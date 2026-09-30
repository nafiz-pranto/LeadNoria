/**
 * LeadNoria — Phase 13: Geographic Expansion & Saturation
 * Saturation Engine & Stopping Conditions
 * 
 * Invariants:
 * - False Saturation Protection: A unit that failed due to error/timeout/block is NEVER counted as low-yield.
 * - Multi-dimensional saturation: tracks Area, Category, Query Variant, and Global scopes.
 * - Evaluates multiple stopping conditions deterministically without discarding secondary reasons.
 * - Manual continuation support with explicit continuation tracking.
 */

import {
  SaturationPolicy,
  SaturationState,
  StoppingCondition,
  SearchUnitResultMetrics,
  SearchUnit
} from './geographicTypes.ts';

export class SaturationEngine {
  private policy: SaturationPolicy;
  private consecutiveLowYieldGlobal = 0;
  private evaluatedUnitsGlobal = 0;
  private consecutiveLowYieldByArea = new Map<string, number>();
  private evaluatedUnitsByArea = new Map<string, number>();
  private consecutiveLowYieldByCategory = new Map<string, number>();
  private consecutiveLowYieldByQuery = new Map<string, number>();
  private isManuallyContinued = false;

  constructor(policy: SaturationPolicy) {
    this.policy = policy;
  }

  /**
   * Ingests the result of a SearchUnit and updates saturation counters.
   * False-saturation protection (Requirement 16):
   * Units with isFailure = true or blocked extraction do NOT count toward consecutive low-yield units!
   */
  public recordUnitOutcome(unit: SearchUnit, metrics: SearchUnitResultMetrics): void {
    if (metrics.isFailure || metrics.errorRate === 1.0) {
      // Failed unit: reset or do not increment consecutive low yield
      // Invariant 3: A failed unit cannot be counted as a successful low-yield unit.
      return;
    }

    this.evaluatedUnitsGlobal++;
    const areaId = unit.geographicAreaId;
    const cat = unit.category || 'NONE';
    const qv = unit.queryVariant || 'NONE';

    this.evaluatedUnitsByArea.set(areaId, (this.evaluatedUnitsByArea.get(areaId) || 0) + 1);

    // Evaluate marginal yield against configured threshold
    const marginalYield = typeof metrics.marginalUniqueYield === 'number' ? metrics.marginalUniqueYield : 0;
    const isLowYield = marginalYield < this.policy.minimumMarginalYield;

    // 1. Global accounting
    if (isLowYield) {
      this.consecutiveLowYieldGlobal++;
    } else {
      this.consecutiveLowYieldGlobal = 0;
    }

    // 2. Area accounting
    if (isLowYield) {
      this.consecutiveLowYieldByArea.set(areaId, (this.consecutiveLowYieldByArea.get(areaId) || 0) + 1);
    } else {
      this.consecutiveLowYieldByArea.set(areaId, 0);
    }

    // 3. Category accounting
    if (isLowYield) {
      this.consecutiveLowYieldByCategory.set(cat, (this.consecutiveLowYieldByCategory.get(cat) || 0) + 1);
    } else {
      this.consecutiveLowYieldByCategory.set(cat, 0);
    }

    // 4. Query variant accounting
    if (isLowYield) {
      this.consecutiveLowYieldByQuery.set(qv, (this.consecutiveLowYieldByQuery.get(qv) || 0) + 1);
    } else {
      this.consecutiveLowYieldByQuery.set(qv, 0);
    }
  }

  /**
   * Evaluates if global saturation has been reached.
   */
  public evaluateGlobalSaturation(): SaturationState {
    const reasons: string[] = [];
    let isSaturated = false;

    if (!this.isManuallyContinued) {
      if (
        this.evaluatedUnitsGlobal >= this.policy.minimumSamples &&
        this.consecutiveLowYieldGlobal >= this.policy.consecutiveLowYieldUnits
      ) {
        isSaturated = true;
        reasons.push(
          `Global saturation reached: ${this.consecutiveLowYieldGlobal} consecutive units produced ` +
          `marginal unique yield below ${this.policy.minimumMarginalYield * 100}% (evaluated ${this.evaluatedUnitsGlobal} units).`
        );
      }
    }

    return {
      isSaturated,
      saturationScope: isSaturated ? 'GLOBAL_SCOPE_SATURATED' : 'NOT_SATURATED',
      consecutiveLowYieldCount: this.consecutiveLowYieldGlobal,
      evaluatedUnits: this.evaluatedUnitsGlobal,
      triggeredReasons: reasons,
      lastEvaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Evaluates if a specific area has reached saturation.
   */
  public evaluateAreaSaturation(areaId: string): SaturationState {
    const evaluated = this.evaluatedUnitsByArea.get(areaId) || 0;
    const consecutive = this.consecutiveLowYieldByArea.get(areaId) || 0;
    const isSaturated = evaluated >= this.policy.minimumSamples && consecutive >= this.policy.consecutiveLowYieldUnits;
    const reasons: string[] = [];

    if (isSaturated) {
      reasons.push(
        `Area '${areaId}' saturated: ${consecutive} consecutive units with marginal yield below ` +
        `${this.policy.minimumMarginalYield * 100}%.`
      );
    }

    return {
      isSaturated,
      saturationScope: isSaturated ? 'AREA_SATURATED' : 'NOT_SATURATED',
      scopeIdentifier: areaId,
      consecutiveLowYieldCount: consecutive,
      evaluatedUnits: evaluated,
      triggeredReasons: reasons,
      lastEvaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Evaluates stopping conditions based on current execution metrics.
   */
  public evaluateStoppingConditions(params: {
    completedUnits: number;
    processedAreas: number;
    totalCandidates: number;
    elapsedRuntimeMs: number;
    failedUnits: number;
    isSourceBlocked?: boolean;
    isManualStopRequested?: boolean;
  }): { shouldStop: boolean; stopReasons: StoppingCondition[]; details: string[] } {
    const stopReasons: StoppingCondition[] = [];
    const details: string[] = [];

    // 1. Saturation check
    const sat = this.evaluateGlobalSaturation();
    if (sat.isSaturated) {
      stopReasons.push('SATURATION_REACHED');
      details.push(...sat.triggeredReasons);
    }

    // 2. Maximum units check
    if (params.completedUnits >= this.policy.maximumUnits) {
      stopReasons.push('MAX_SEARCH_UNITS');
      details.push(`Reached maximum configured search units limit (${this.policy.maximumUnits}).`);
    }

    // 3. Maximum areas check
    if (params.processedAreas >= this.policy.maximumAreas) {
      stopReasons.push('MAX_AREAS');
      details.push(`Reached maximum configured geographic areas limit (${this.policy.maximumAreas}).`);
    }

    // 4. Maximum candidates check
    if (params.totalCandidates >= this.policy.maximumCandidates) {
      stopReasons.push('MAX_CANDIDATES');
      details.push(`Reached maximum configured candidates limit (${this.policy.maximumCandidates}).`);
    }

    // 5. Maximum runtime check
    if (params.elapsedRuntimeMs >= this.policy.maximumRuntimeMs) {
      stopReasons.push('MAX_RUNTIME');
      details.push(`Reached maximum configured runtime limit (${this.policy.maximumRuntimeMs}ms).`);
    }

    // 6. Error threshold check
    if (params.completedUnits > 0) {
      const errorRate = params.failedUnits / params.completedUnits;
      if (errorRate > this.policy.maximumErrorRate) {
        stopReasons.push('ERROR_THRESHOLD');
        details.push(`Error rate (${(errorRate * 100).toFixed(1)}%) exceeded maximum threshold (${(this.policy.maximumErrorRate * 100).toFixed(1)}%).`);
      }
    }

    // 7. Source blocked
    if (params.isSourceBlocked) {
      stopReasons.push('SOURCE_BLOCKED');
      details.push('Execution stopped due to hard source compliance or policy block.');
    }

    // 8. Manual stop
    if (params.isManualStopRequested) {
      stopReasons.push('MANUAL_STOP');
      details.push('Execution stopped by explicit manual user request.');
    }

    return {
      shouldStop: stopReasons.length > 0,
      stopReasons,
      details
    };
  }

  /**
   * Resets saturation counters for explicit manual continuation.
   */
  public manualContinue(): void {
    if (!this.policy.allowManualContinue) {
      throw new Error('Manual continuation is not permitted by current SaturationPolicy');
    }
    this.isManuallyContinued = true;
    this.consecutiveLowYieldGlobal = 0;
  }
}
