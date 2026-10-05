/**
 * LeadNoria — Phase 30: Production Intelligence Analytics & Run Quality Insights
 * Analytics Persistence Repository Adapter
 *
 * Invariants:
 * - Persisted ONLY through the existing persistence architecture (StorageAdapter)
 * - Zero independent storage subsystems created
 * - Never persists duplicate raw lead records inside analytics snapshots
 * - Fully rebuildable from canonical persisted records
 */

import { StorageAdapter, MemoryStorageAdapter } from '../persistence/storageAdapter.ts';
import { RunAnalyticsSnapshot } from './types.ts';
import { PersistenceRepository } from '../persistence/persistenceRepository.ts';
import { computeRunAnalytics } from './analyticsEngine.ts';
import { UnifiedResearchRecord } from '../pipeline/pipelineTypes.ts';

export const ANALYTICS_COLLECTION_NAME = 'analytics_snapshots';

export class AnalyticsPersistenceRepository {
  constructor(private adapter: StorageAdapter = new MemoryStorageAdapter()) {}

  /**
   * Persists an analytics snapshot without duplicate raw lead payloads
   */
  async saveSnapshot(snapshot: RunAnalyticsSnapshot): Promise<void> {
    // Ensure clean copy with no stray raw lead references
    const cleanPayload: RunAnalyticsSnapshot = {
      schemaVersion: snapshot.schemaVersion,
      runId: snapshot.runId,
      runTitle: snapshot.runTitle,
      sourceType: snapshot.sourceType,
      createdAt: snapshot.createdAt,
      totalRecords: snapshot.totalRecords,
      runMetrics: { ...snapshot.runMetrics },
      coverage: { ...snapshot.coverage },
      contactability: { ...snapshot.contactability },
      website: { ...snapshot.website },
      qualification: {
        ...snapshot.qualification,
        reasonBreakdown: [...snapshot.qualification.reasonBreakdown]
      },
      source: { ...snapshot.source },
      restrictedAggregate: { ...snapshot.restrictedAggregate },
      warnings: [...snapshot.warnings]
    };

    await this.adapter.put(ANALYTICS_COLLECTION_NAME, snapshot.runId, cleanPayload);
  }

  /**
   * Retrieves an analytics snapshot by run ID
   */
  async getSnapshot(runId: string): Promise<RunAnalyticsSnapshot | null> {
    return this.adapter.get<RunAnalyticsSnapshot>(ANALYTICS_COLLECTION_NAME, runId);
  }

  /**
   * Lists all stored analytics snapshots
   */
  async listSnapshots(): Promise<RunAnalyticsSnapshot[]> {
    return this.adapter.list<RunAnalyticsSnapshot>(ANALYTICS_COLLECTION_NAME);
  }

  /**
   * Deletes an analytics snapshot
   */
  async deleteSnapshot(runId: string): Promise<boolean> {
    return this.adapter.delete(ANALYTICS_COLLECTION_NAME, runId);
  }

  /**
   * Rebuilds an analytics snapshot directly from authoritative persisted entity records
   */
  async rebuildSnapshotFromRun(
    runId: string,
    repository: PersistenceRepository
  ): Promise<RunAnalyticsSnapshot | null> {
    const run = await repository.getRun(runId);
    if (!run) return null;

    const entities = await repository.listEntitiesByRun(runId);

    // Build minimal UnifiedResearchRecords from persisted entities
    const records: UnifiedResearchRecord[] = entities.map(e => ({
      recordId: e.entityId,
      entityId: e.entityId,
      canonicalDisplayName: e.canonicalDisplayName,
      sourceRecords: (e.candidateIds || []).map(cid => ({
        sourceType: e.primarySource,
        sourceNamespace: 'production',
        sourceRecordId: cid
      })),
      primarySource: e.primarySource,
      sourceContributions: [],
      provenance: e.provenance,
      restrictions: e.restrictions,
      fieldEligibility: {},
      corroborationSources: [e.primarySource],
      corroborationCount: 1,
      stageStates: {} as any,
      evidence: [],
      geographicObservations: [],
      diagnostics: { warnings: [], errors: [], notes: [] },
      createdAt: e.resolvedAt,
      updatedAt: e.updatedAt
    }));

    const snapshot = computeRunAnalytics(runId, records, {
      sourceType: run.selectedSources[0] === 'META' ? 'META' : 'GOOGLE_MAPS',
      runTitle: `Run ${runId}`
    });

    await this.saveSnapshot(snapshot);
    return snapshot;
  }
}
