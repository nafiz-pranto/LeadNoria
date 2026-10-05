/**
 * LeadNoria — Phase 31: Research Optimization & Saturation Intelligence
 * Optimization Persistence Repository
 *
 * Invariants:
 * - Persisted ONLY through the existing persistence architecture (StorageAdapter).
 * - Zero independent storage subsystems created.
 * - Never persists duplicate raw lead records inside optimization snapshots.
 * - Rebuildable from canonical persisted runs and records.
 */

import { StorageAdapter, MemoryStorageAdapter } from '../persistence/storageAdapter.ts';
import { ResearchOptimizationSnapshot } from './types.ts';
import { computeResearchOptimization } from './optimizationEngine.ts';
import { CanonicalLeadRecord } from '../leadIntelligence/types.ts';
import { GeographicArea } from '../geography/geographicTypes.ts';

export const OPTIMIZATION_COLLECTION_NAME = 'research_optimization_snapshots';

export class OptimizationPersistenceRepository {
  constructor(private adapter: StorageAdapter = new MemoryStorageAdapter()) {}

  /**
   * Persists an optimization snapshot without raw lead object duplication
   */
  async saveSnapshot(snapshot: ResearchOptimizationSnapshot): Promise<ResearchOptimizationSnapshot> {
    const cleanPayload: ResearchOptimizationSnapshot = {
      snapshotId: snapshot.snapshotId,
      schemaVersion: snapshot.schemaVersion,
      generatedAt: snapshot.generatedAt,
      totalRunsAnalyzed: snapshot.totalRunsAnalyzed,
      totalSearchUnitsAnalyzed: snapshot.totalSearchUnitsAnalyzed,
      totalCanonicalLeadsObserved: snapshot.totalCanonicalLeadsObserved,
      overallCoverage: { ...snapshot.overallCoverage },
      searchUnitPerformances: snapshot.searchUnitPerformances.map(p => ({
        ...p,
        runIds: [...p.runIds],
        saturationAssessment: {
          ...p.saturationAssessment,
          triggeringFactors: [...p.saturationAssessment.triggeringFactors]
        },
        duplicatePressure: { ...p.duplicatePressure },
        marginalYieldResult: { ...p.marginalYieldResult },
        qualityDimensions: { ...p.qualityDimensions }
      })),
      recommendations: snapshot.recommendations.map(r => ({
        ...r,
        triggeringMetrics: { ...r.triggeringMetrics },
        thresholds: { ...r.thresholds },
        relevantEntityIds: [...r.relevantEntityIds]
      })),
      warnings: snapshot.warnings.map(w => ({ ...w })),
      geographicBreakdown: snapshot.geographicBreakdown.map(g => ({
        ...g,
        searchUnitIds: [...g.searchUnitIds]
      })),
      queryCategoryInsights: snapshot.queryCategoryInsights.map(q => ({ ...q })),
      restrictedRecordsAggregate: { ...snapshot.restrictedRecordsAggregate }
    };

    await this.adapter.put(OPTIMIZATION_COLLECTION_NAME, snapshot.snapshotId, cleanPayload);
    return cleanPayload;
  }

  /**
   * Retrieves an optimization snapshot by snapshot ID
   */
  async getSnapshot(snapshotId: string): Promise<ResearchOptimizationSnapshot | null> {
    return this.adapter.get<ResearchOptimizationSnapshot>(OPTIMIZATION_COLLECTION_NAME, snapshotId);
  }

  /**
   * Retrieves the latest optimization snapshot by timestamp
   */
  async getLatestSnapshot(): Promise<ResearchOptimizationSnapshot | null> {
    const all = await this.listSnapshots();
    if (all.length === 0) return null;
    return all.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
  }

  /**
   * Lists all stored optimization snapshots
   */
  async listSnapshots(): Promise<ResearchOptimizationSnapshot[]> {
    return this.adapter.list<ResearchOptimizationSnapshot>(OPTIMIZATION_COLLECTION_NAME);
  }

  /**
   * Deletes an optimization snapshot
   */
  async deleteSnapshot(snapshotId: string): Promise<boolean> {
    return this.adapter.delete(OPTIMIZATION_COLLECTION_NAME, snapshotId);
  }

  /**
   * Rebuilds an optimization snapshot on-demand from authoritative runs and records
   */
  async rebuildSnapshot(
    runs: Array<{ runId: string; startedAt?: string; completedAt?: string; searchUnits?: any[]; query?: string; category?: string }>,
    records: CanonicalLeadRecord[],
    geographicAreas: GeographicArea[] = []
  ): Promise<ResearchOptimizationSnapshot> {
    const freshSnapshot = computeResearchOptimization(runs, records, geographicAreas);
    await this.saveSnapshot(freshSnapshot);
    return freshSnapshot;
  }
}

export { OptimizationPersistenceRepository as ResearchOptimizationPersistenceRepository };
