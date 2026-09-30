/**
 * LeadNoria — Phase 13: Geographic Expansion & Saturation
 * Geographic Run State & Orchestration
 * 
 * Invariants:
 * - Idempotency: Ingesting the same SearchUnit twice does not double count.
 * - Checkpoint / Recovery: Serializes state so plan execution can pause and resume deterministically.
 * - Aggregate metrics consistency: preserves Phase 8 entity deduplication across runs.
 */

import { createHash } from 'node:crypto';
import {
  GeographicPlan,
  SearchUnit,
  CandidateAccountingInput,
  GeographicCheckpoint,
  StoppingCondition,
  SearchUnitResultMetrics
} from './geographicTypes.ts';
import { GeographicHierarchy } from './geographicHierarchy.ts';
import { CoverageMatrix } from './coverageMatrix.ts';
import { YieldAnalyzer } from './yieldAnalyzer.ts';
import { SaturationEngine } from './saturationEngine.ts';
import { EVALUATOR_VERSION } from './geographicTypes.ts';

export class GeographicRunState {
  private runId: string;
  private plan: GeographicPlan;
  private hierarchy: GeographicHierarchy;
  private coverageMatrix: CoverageMatrix;
  private yieldAnalyzer: YieldAnalyzer;
  private saturationEngine: SaturationEngine;

  private completedUnitIds = new Set<string>();
  private failedUnitIds = new Set<string>();
  private processedAreaIds = new Set<string>();
  private stopReasons: StoppingCondition[] = [];
  private startTimeMs: number;
  private lastSequenceNumber = 0;

  constructor(plan: GeographicPlan, hierarchy: GeographicHierarchy, runId?: string) {
    this.plan = plan;
    this.hierarchy = hierarchy;
    this.runId = runId || `run_${createHash('sha256').update(plan.planId + '::' + Date.now()).digest('hex').substring(0, 12)}`;
    this.coverageMatrix = new CoverageMatrix();
    this.yieldAnalyzer = new YieldAnalyzer();
    this.saturationEngine = new SaturationEngine(plan.saturationPolicy);
    this.startTimeMs = Date.now();
  }

  public getRunId(): string {
    return this.runId;
  }

  public getPlan(): GeographicPlan {
    return this.plan;
  }

  public getCoverageMatrix(): CoverageMatrix {
    return this.coverageMatrix;
  }

  public getYieldAnalyzer(): YieldAnalyzer {
    return this.yieldAnalyzer;
  }

  public getSaturationEngine(): SaturationEngine {
    return this.saturationEngine;
  }

  public isUnitCompleted(searchUnitId: string): boolean {
    return this.completedUnitIds.has(searchUnitId);
  }

  /**
   * Idempotently ingests the output candidates of a SearchUnit.
   * If the unit has already been recorded, skips to prevent double-counting.
   */
  public ingestUnitResult(
    unit: SearchUnit,
    candidates: CandidateAccountingInput[],
    durationMs: number,
    isFailure = false,
    errorMessage?: string
  ): { metrics: SearchUnitResultMetrics; isDuplicateSubmission: boolean } {
    // Invariant 8: Repeated processing of the same unit is idempotent
    if (this.completedUnitIds.has(unit.searchUnitId) || this.failedUnitIds.has(unit.searchUnitId)) {
      const existing = unit.resultMetrics || this.yieldAnalyzer.analyzeUnitYield(unit.geographicAreaId, [], 0);
      return { metrics: existing, isDuplicateSubmission: true };
    }

    this.lastSequenceNumber = Math.max(this.lastSequenceNumber, unit.sequence);

    // 1. Analyze yield and record entity novelties
    const metrics = this.yieldAnalyzer.analyzeUnitYield(
      unit.geographicAreaId,
      candidates,
      durationMs,
      isFailure,
      errorMessage
    );
    unit.resultMetrics = metrics;

    // 2. Record in Coverage Matrix
    this.coverageMatrix.recordUnitCompletion(unit, metrics);

    // 3. Update Saturation Engine
    this.saturationEngine.recordUnitOutcome(unit, metrics);

    // 4. Update tracking sets
    if (isFailure) {
      this.failedUnitIds.add(unit.searchUnitId);
      unit.status = 'FAILED';
      unit.failedReason = errorMessage;
    } else {
      this.completedUnitIds.add(unit.searchUnitId);
      unit.status = 'COMPLETED';
      this.processedAreaIds.add(unit.geographicAreaId);
    }
    unit.completedAt = new Date().toISOString();

    // 5. Evaluate stopping conditions
    const stopCheck = this.saturationEngine.evaluateStoppingConditions({
      completedUnits: this.completedUnitIds.size,
      processedAreas: this.processedAreaIds.size,
      totalCandidates: this.coverageMatrix.getAggregateMetrics().totalCandidates,
      elapsedRuntimeMs: Date.now() - this.startTimeMs,
      failedUnits: this.failedUnitIds.size
    });

    if (stopCheck.shouldStop) {
      for (const r of stopCheck.stopReasons) {
        if (!this.stopReasons.includes(r)) {
          this.stopReasons.push(r);
        }
      }
    }

    return { metrics, isDuplicateSubmission: false };
  }

  public getStopReasons(): StoppingCondition[] {
    return [...this.stopReasons];
  }

  public isStopped(): boolean {
    return this.stopReasons.length > 0;
  }

  /**
   * Exports full execution checkpoint for persistence and restart.
   */
  public exportCheckpoint(): GeographicCheckpoint {
    const agg = this.coverageMatrix.getAggregateMetrics();
    const yieldSnap = this.yieldAnalyzer.exportSnapshot();

    const aggregateMetrics: SearchUnitResultMetrics = {
      rawCandidateCount: agg.totalCandidates,
      normalizedCandidateCount: agg.totalCandidates,
      uniqueEntityCount: agg.uniqueCandidates,
      duplicateCount: agg.duplicateCandidates,
      unresolvedCount: 0,
      relevantCount: 0,
      qualifiedCount: 0,
      blockedCount: agg.blockedCells,
      errorCount: agg.failedCells,
      newUniqueEntities: agg.uniqueCandidates,
      newQualifiedEntities: 0,
      marginalUniqueYield: agg.totalCandidates > 0 ? Number((agg.uniqueCandidates / agg.totalCandidates).toFixed(4)) : 'NOT_AVAILABLE',
      marginalQualifiedYield: 'NOT_AVAILABLE',
      overlapRate: agg.totalCandidates > 0 ? Number((agg.duplicateCandidates / agg.totalCandidates).toFixed(4)) : 'NOT_AVAILABLE',
      duplicateRate: agg.totalCandidates > 0 ? Number((agg.duplicateCandidates / agg.totalCandidates).toFixed(4)) : 'NOT_AVAILABLE',
      unresolvedRate: 'NOT_AVAILABLE',
      errorRate: agg.totalCells > 0 ? Number((agg.failedCells / agg.totalCells).toFixed(4)) : 'NOT_AVAILABLE',
      isNoResults: agg.totalCandidates === 0,
      isFailure: agg.failedCells > 0,
      durationMs: Date.now() - this.startTimeMs
    };

    return {
      checkpointId: `chk_${createHash('sha256').update(this.runId + '::' + this.lastSequenceNumber).digest('hex').substring(0, 12)}`,
      runId: this.runId,
      planId: this.plan.planId,
      planVersion: this.plan.planVersion,
      evaluatorVersion: EVALUATOR_VERSION,
      processedAreaIds: Array.from(this.processedAreaIds),
      completedUnitIds: Array.from(this.completedUnitIds),
      failedUnitIds: Array.from(this.failedUnitIds),
      observedEntityIds: yieldSnap.observedEntityIds,
      observedBranchIds: yieldSnap.observedBranchIds,
      areaEntityMap: yieldSnap.areaEntityMap,
      saturationState: this.saturationEngine.evaluateGlobalSaturation(),
      stopReasons: [...this.stopReasons],
      aggregateMetrics,
      lastSequenceNumber: this.lastSequenceNumber,
      savedAt: new Date().toISOString()
    };
  }

  /**
   * Restores run state from an existing checkpoint.
   */
  public restoreCheckpoint(checkpoint: GeographicCheckpoint): void {
    if (checkpoint.planId !== this.plan.planId) {
      throw new Error(`Checkpoint planId '${checkpoint.planId}' does not match current plan '${this.plan.planId}'`);
    }

    this.runId = checkpoint.runId;
    this.completedUnitIds = new Set(checkpoint.completedUnitIds);
    this.failedUnitIds = new Set(checkpoint.failedUnitIds);
    this.processedAreaIds = new Set(checkpoint.processedAreaIds);
    this.stopReasons = [...checkpoint.stopReasons];
    this.lastSequenceNumber = checkpoint.lastSequenceNumber;

    this.yieldAnalyzer.restoreSnapshot({
      observedEntityIds: checkpoint.observedEntityIds,
      observedBranchIds: checkpoint.observedBranchIds,
      areaEntityMap: checkpoint.areaEntityMap
    });
  }
}
