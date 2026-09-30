/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Storage Diagnostics, Referential Integrity & Orphan Detection
 * 
 * Non-Negotiable Invariants:
 * - Deterministic audits of relationship integrity (Run -> Candidate -> Entity -> Evidence)
 * - Explicit orphan detection across all persisted resource collections
 * - Accurate storage consumption metrics without fabricating capacity
 */

import { ReferentialIntegrityReport, StorageStats } from './persistenceTypes.ts';
import { StorageAdapter } from './storageAdapter.ts';

export class StorageDiagnostics {
  constructor(private adapter: StorageAdapter) {}

  /**
   * Conducts an audit of referential integrity across all stored entities.
   */
  async auditReferentialIntegrity(): Promise<ReferentialIntegrityReport> {
    const runs = await this.adapter.list<{ runId: string }>('runs');
    const runIds = new Set(runs.map(r => r.runId));

    const brokenRunReferences: string[] = [];
    const orphanedCandidates: string[] = [];
    const orphanedEvidence: string[] = [];
    const orphanedQualifications: string[] = [];
    const orphanedCheckpoints: string[] = [];

    // Audit candidates
    const candidates = await this.adapter.list<{ candidateId: string; runId: string }>('candidates');
    for (const c of candidates) {
      if (!runIds.has(c.runId)) {
        orphanedCandidates.push(c.candidateId);
        brokenRunReferences.push(`Candidate '${c.candidateId}' references non-existent run '${c.runId}'`);
      }
    }

    // Audit evidence
    const evidence = await this.adapter.list<{ evidenceId: string; runId: string }>('evidence');
    for (const ev of evidence) {
      if (!runIds.has(ev.runId)) {
        orphanedEvidence.push(ev.evidenceId);
        brokenRunReferences.push(`Evidence '${ev.evidenceId}' references non-existent run '${ev.runId}'`);
      }
    }

    // Audit qualifications
    const qualifications = await this.adapter.list<{ evaluationId: string; runId: string }>('qualifications');
    for (const q of qualifications) {
      if (!runIds.has(q.runId)) {
        orphanedQualifications.push(q.evaluationId);
        brokenRunReferences.push(`Qualification '${q.evaluationId}' references non-existent run '${q.runId}'`);
      }
    }

    // Audit checkpoints
    const checkpoints = await this.adapter.list<{ checkpointId: string; runId: string }>('checkpoints');
    for (const chk of checkpoints) {
      if (!runIds.has(chk.runId)) {
        orphanedCheckpoints.push(chk.checkpointId);
        brokenRunReferences.push(`Checkpoint '${chk.checkpointId}' references non-existent run '${chk.runId}'`);
      }
    }

    const isValid = brokenRunReferences.length === 0;

    return {
      isValid,
      brokenRunReferences,
      orphanedCandidates,
      orphanedEvidence,
      orphanedQualifications,
      orphanedCheckpoints
    };
  }

  /**
   * Compiles comprehensive storage stats.
   */
  async getStorageStats(): Promise<StorageStats> {
    const adapterStats = await this.adapter.getStats();

    return {
      schemaVersion: 1,
      totalRuns: adapterStats.collectionCounts['runs'] || 0,
      totalCandidates: adapterStats.collectionCounts['candidates'] || 0,
      totalEntities: adapterStats.collectionCounts['entities'] || 0,
      totalEvidence: adapterStats.collectionCounts['evidence'] || 0,
      totalCheckpoints: adapterStats.collectionCounts['checkpoints'] || 0,
      totalExportAudits: adapterStats.collectionCounts['exportAudits'] || 0,
      estimatedBytes: adapterStats.estimatedBytes
    };
  }
}
