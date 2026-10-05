/**
 * LeadNoria — Phase 32: Production Feedback, Reliability & Growth Readiness
 * Local Diagnostics Persistence & Bounded Issue Storage Repository
 *
 * Invariants:
 * - Reuses existing StorageAdapter abstraction strictly (zero competing storage subsystems).
 * - Bounded storage quota strictly enforced (default: 100 distinct issues).
 * - Deterministic pruning: lowest occurrence count, then oldest lastSeen, then fingerprint tie-breaker.
 * - Corrupt storage fails gracefully: never throws to crash research execution.
 * - Clear diagnostic history ONLY clears diagnostics; NEVER touches lead records or research history.
 */

import { StorageAdapter } from '../persistence/storageAdapter.ts';
import {
  ProductionIssue,
  AggregatedIssue,
  IssueResolutionState,
  StorageHealthSummary,
  DIAGNOSTIC_COLLECTION_NAME,
  DEFAULT_MAX_DIAGNOSTIC_ISSUES
} from './types.ts';
import { generateIssueFingerprint } from './fingerprint.ts';
import { classifyProductionError } from './taxonomy.ts';
import { aggregateProductionIssues, sanitizeDiagnosticText } from './reliabilityEngine.ts';

export interface DiagnosticsRepositoryOptions {
  adapter: StorageAdapter;
  maxIssues?: number;
  version?: string;
}

export class DiagnosticsRepository {
  private adapter: StorageAdapter;
  private maxIssues: number;
  private version: string;

  constructor(options: DiagnosticsRepositoryOptions) {
    this.adapter = options.adapter;
    this.maxIssues = options.maxIssues || DEFAULT_MAX_DIAGNOSTIC_ISSUES;
    this.version = options.version || '1.5.0';
  }

  /**
   * Records a production issue deterministically into bounded storage.
   */
  async recordIssue(
    err: unknown,
    context?: {
      stage?: any;
      category?: any;
      technicalCode?: string;
      runId?: string;
      customMessage?: string;
      reproductionHint?: string;
      contextMetadata?: Record<string, string | number | boolean>;
    }
  ): Promise<ProductionIssue | null> {
    try {
      const classification = classifyProductionError(err, {
        stage: context?.stage,
        category: context?.category,
        technicalCode: context?.technicalCode
      });

      const message = context?.customMessage || classification.humanReadableMessage;
      const fingerprint = generateIssueFingerprint(
        classification.category,
        classification.technicalCode,
        classification.workflowStage,
        message
      );

      const now = new Date().toISOString();
      const existing = await this.adapter.get<ProductionIssue>(DIAGNOSTIC_COLLECTION_NAME, fingerprint);

      let issue: ProductionIssue;
      if (existing) {
        const runIds = Array.from(new Set([
          ...(existing.affectedRunIds || []),
          ...(context?.runId ? [context.runId] : [])
        ]));

        issue = {
          ...existing,
          occurrenceCount: (existing.occurrenceCount || 1) + 1,
          lastSeen: now,
          affectedRunIds: runIds,
          version: this.version
        };
      } else {
        issue = {
          issueId: `issue_${fingerprint.replace('fp_', '')}`,
          fingerprint,
          severity: classification.severity,
          category: classification.category,
          workflowStage: classification.workflowStage,
          humanReadableMessage: sanitizeDiagnosticText(message),
          sanitizedTechnicalCode: sanitizeDiagnosticText(classification.technicalCode),
          version: this.version,
          browser: typeof navigator !== 'undefined' ? sanitizeDiagnosticText(navigator.userAgent) : 'Node.js',
          os: typeof process !== 'undefined' ? sanitizeDiagnosticText(process.platform) : 'browser',
          timestamp: now,
          occurrenceCount: 1,
          affectedRunIds: context?.runId ? [context.runId] : [],
          lastSeen: now,
          reproductionHint: sanitizeDiagnosticText(context?.reproductionHint || classification.reproductionHint),
          resolutionState: 'OPEN',
          retryability: classification.retryability,
          userImpact: sanitizeDiagnosticText(classification.userImpact),
          context: context?.contextMetadata
        };
      }

      await this.adapter.put(DIAGNOSTIC_COLLECTION_NAME, fingerprint, issue);

      // Enforce bounded storage
      await this.enforceStorageBounds();

      return issue;
    } catch (storageErr) {
      // Graceful degradation: never crash calling workflow on diagnostics persistence failure
      console.warn('[DiagnosticsRepository] Failed to record issue safely:', storageErr);
      return null;
    }
  }

  /**
   * Retrieves all recorded issues newest-first.
   */
  async listIssues(filter?: (item: ProductionIssue) => boolean): Promise<ProductionIssue[]> {
    try {
      const items = await this.adapter.list<ProductionIssue>(DIAGNOSTIC_COLLECTION_NAME, filter);
      items.sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
      return items;
    } catch (err) {
      console.warn('[DiagnosticsRepository] Failed to list issues safely:', err);
      return [];
    }
  }

  /**
   * Returns aggregated issue summaries.
   */
  async getAggregatedIssues(): Promise<AggregatedIssue[]> {
    const issues = await this.listIssues();
    return aggregateProductionIssues(issues);
  }

  /**
   * Updates resolution state for a specific issue fingerprint.
   */
  async updateIssueResolution(fingerprint: string, state: IssueResolutionState): Promise<boolean> {
    try {
      const existing = await this.adapter.get<ProductionIssue>(DIAGNOSTIC_COLLECTION_NAME, fingerprint);
      if (!existing) return false;
      existing.resolutionState = state;
      await this.adapter.put(DIAGNOSTIC_COLLECTION_NAME, fingerprint, existing);
      return true;
    } catch (err) {
      console.warn('[DiagnosticsRepository] Failed to update issue resolution:', err);
      return false;
    }
  }

  /**
   * Clears only diagnostic issue history. NEVER clears research data or lead records.
   */
  async clearDiagnosticHistory(): Promise<void> {
    try {
      await this.adapter.clear(DIAGNOSTIC_COLLECTION_NAME);
    } catch (err) {
      console.warn('[DiagnosticsRepository] Failed to clear diagnostics collection:', err);
    }
  }

  /**
   * Enforces deterministic bounded retention.
   */
  private async enforceStorageBounds(): Promise<void> {
    try {
      const count = await this.adapter.count(DIAGNOSTIC_COLLECTION_NAME);
      if (count <= this.maxIssues) return;

      const items = await this.adapter.list<ProductionIssue>(DIAGNOSTIC_COLLECTION_NAME);
      // Prune lowest occurrenceCount first, then oldest lastSeen, then fingerprint tie-breaker
      items.sort((a, b) => {
        const oDiff = a.occurrenceCount - b.occurrenceCount;
        if (oDiff !== 0) return oDiff;
        const tDiff = a.lastSeen.localeCompare(b.lastSeen);
        if (tDiff !== 0) return tDiff;
        return a.fingerprint.localeCompare(b.fingerprint);
      });

      const excessCount = items.length - this.maxIssues;
      for (let i = 0; i < excessCount; i++) {
        await this.adapter.delete(DIAGNOSTIC_COLLECTION_NAME, items[i].fingerprint);
      }
    } catch (err) {
      console.warn('[DiagnosticsRepository] Bounded storage enforcement error:', err);
    }
  }

  /**
   * Computes storage health and capacity indicators across local collections.
   */
  async getStorageHealth(quotaLimitBytes: number = 50 * 1024 * 1024): Promise<StorageHealthSummary> {
    try {
      const stats = await this.adapter.getStats();
      const usagePercent = quotaLimitBytes > 0
        ? Math.min(100.0, ((stats.estimatedBytes || 0) / quotaLimitBytes) * 100.0)
        : 0.0;

      return {
        collectionCounts: stats.collectionCounts || {},
        estimatedBytes: stats.estimatedBytes || 0,
        quotaLimitBytes,
        quotaUsagePercent: Number(usagePercent.toFixed(1)),
        isPressureHigh: usagePercent >= 80.0,
        retentionPolicies: {
          [DIAGNOSTIC_COLLECTION_NAME]: {
            maxEntries: this.maxIssues,
            strategy: 'LOWEST_OCCURRENCE_OLDEST_FIRST'
          },
          research_runs: {
            maxEntries: 100,
            strategy: 'OLDEST_FIRST'
          },
          research_optimization_snapshots: {
            maxEntries: 20,
            strategy: 'OLDEST_FIRST'
          }
        }
      };
    } catch (err) {
      return {
        collectionCounts: {},
        estimatedBytes: 0,
        quotaLimitBytes,
        quotaUsagePercent: 0.0,
        isPressureHigh: false,
        retentionPolicies: {}
      };
    }
  }
}
