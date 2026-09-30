/**
 * LeadNoria — Phase 13: Geographic Expansion & Saturation
 * Yield Analyzer & Entity Accounting
 * 
 * Invariants:
 * - Uses Phase 8 resolved entity IDs for unique entity accounting
 * - Preserves distinct physical branch entities (does not flatten branches into one)
 * - Safe division-by-zero handling: returns 'NOT_AVAILABLE' rather than NaN or Infinity
 * - Measures marginal yield: newUniqueEntities / totalCandidates
 * - Preserves source restrictions throughout accounting
 */

import { CandidateAccountingInput, SearchUnitResultMetrics } from './geographicTypes.ts';

export class YieldAnalyzer {
  private globalEntityIds = new Set<string>();
  private globalBranchIds = new Set<string>();
  private globalQualifiedEntityIds = new Set<string>();
  private areaEntityMap = new Map<string, Set<string>>(); // areaId -> entityIds
  private areaBranchMap = new Map<string, Set<string>>(); // areaId -> branchIds

  /**
   * Evaluates the yield of candidates produced by a specific SearchUnit.
   */
  public analyzeUnitYield(
    areaId: string,
    candidates: CandidateAccountingInput[],
    durationMs: number,
    isFailure = false,
    errorMessage?: string
  ): SearchUnitResultMetrics {
    const rawCandidateCount = candidates.length;
    let duplicateCount = 0;
    let unresolvedCount = 0;
    let relevantCount = 0;
    let qualifiedCount = 0;
    let blockedCount = 0;
    let errorCount = isFailure ? 1 : 0;
    let newUniqueEntities = 0;
    let newQualifiedEntities = 0;

    const unitEntities = new Set<string>();

    for (const c of candidates) {
      if (c.isRestricted) {
        blockedCount++;
      }
      if (c.isUnresolved) {
        unresolvedCount++;
      }
      if (c.relevanceState === 'RELEVANT') {
        relevantCount++;
      }
      if (c.qualificationState === 'QUALIFIED') {
        qualifiedCount++;
      }

      // Check branch-aware identity
      const identityKey = c.branchId ? `branch::${c.branchId}` : `entity::${c.entityId}`;

      const isAlreadyInUnit = unitEntities.has(identityKey);
      const isAlreadyGlobal = c.branchId
        ? this.globalBranchIds.has(c.branchId)
        : this.globalEntityIds.has(c.entityId);

      if (isAlreadyInUnit || isAlreadyGlobal) {
        duplicateCount++;
      } else {
        newUniqueEntities++;
        if (c.qualificationState === 'QUALIFIED') {
          newQualifiedEntities++;
        }
      }

      unitEntities.add(identityKey);
      if (c.branchId) {
        this.globalBranchIds.add(c.branchId);
      } else {
        this.globalEntityIds.add(c.entityId);
      }

      // Record in area mapping
      if (!this.areaEntityMap.has(areaId)) {
        this.areaEntityMap.set(areaId, new Set<string>());
      }
      this.areaEntityMap.get(areaId)!.add(c.entityId);

      if (c.branchId) {
        if (!this.areaBranchMap.has(areaId)) {
          this.areaBranchMap.set(areaId, new Set<string>());
        }
        this.areaBranchMap.get(areaId)!.add(c.branchId);
      }

      if (c.qualificationState === 'QUALIFIED') {
        this.globalQualifiedEntityIds.add(c.entityId);
      }
    }

    const uniqueEntityCount = unitEntities.size;
    const isNoResults = rawCandidateCount === 0 && !isFailure;

    // Calculate rates with zero-division safety
    const denom = rawCandidateCount;
    const marginalUniqueYield: number | 'NOT_AVAILABLE' =
      denom > 0 ? Number((newUniqueEntities / denom).toFixed(4)) : 'NOT_AVAILABLE';
    const marginalQualifiedYield: number | 'NOT_AVAILABLE' =
      denom > 0 ? Number((newQualifiedEntities / denom).toFixed(4)) : 'NOT_AVAILABLE';
    const overlapRate: number | 'NOT_AVAILABLE' =
      denom > 0 ? Number((duplicateCount / denom).toFixed(4)) : 'NOT_AVAILABLE';
    const duplicateRate: number | 'NOT_AVAILABLE' =
      denom > 0 ? Number((duplicateCount / denom).toFixed(4)) : 'NOT_AVAILABLE';
    const unresolvedRate: number | 'NOT_AVAILABLE' =
      denom > 0 ? Number((unresolvedCount / denom).toFixed(4)) : 'NOT_AVAILABLE';
    const errorRate: number | 'NOT_AVAILABLE' =
      denom > 0 ? Number((errorCount / denom).toFixed(4)) : isFailure ? 1.0 : 'NOT_AVAILABLE';

    return {
      rawCandidateCount,
      normalizedCandidateCount: rawCandidateCount,
      uniqueEntityCount,
      duplicateCount,
      unresolvedCount,
      relevantCount,
      qualifiedCount,
      blockedCount,
      errorCount,
      newUniqueEntities,
      newQualifiedEntities,
      marginalUniqueYield,
      marginalQualifiedYield,
      overlapRate,
      duplicateRate,
      unresolvedRate,
      errorRate,
      isNoResults,
      isFailure,
      durationMs
    };
  }

  public getGlobalUniqueEntityCount(): number {
    return this.globalEntityIds.size;
  }

  public getGlobalBranchCount(): number {
    return this.globalBranchIds.size;
  }

  public getAreaEntities(areaId: string): string[] {
    return Array.from(this.areaEntityMap.get(areaId) || []);
  }

  public getAreaBranches(areaId: string): string[] {
    return Array.from(this.areaBranchMap.get(areaId) || []);
  }

  public getAreaEntityOverlap(areaAId: string, areaBId: string): {
    areaAEntities: number;
    areaBEntities: number;
    sharedEntities: number;
    overlapRate: number;
  } {
    const setA = this.areaEntityMap.get(areaAId) || new Set<string>();
    const setB = this.areaEntityMap.get(areaBId) || new Set<string>();
    let shared = 0;
    for (const id of setA) {
      if (setB.has(id)) shared++;
    }
    const union = new Set([...setA, ...setB]).size;
    const overlapRate = union > 0 ? Number((shared / union).toFixed(4)) : 0;

    return {
      areaAEntities: setA.size,
      areaBEntities: setB.size,
      sharedEntities: shared,
      overlapRate
    };
  }

  public restoreSnapshot(data: {
    observedEntityIds: string[];
    observedBranchIds: string[];
    areaEntityMap: Record<string, string[]>;
  }): void {
    this.globalEntityIds = new Set(data.observedEntityIds);
    this.globalBranchIds = new Set(data.observedBranchIds);
    this.areaEntityMap.clear();
    for (const [areaId, ids] of Object.entries(data.areaEntityMap)) {
      this.areaEntityMap.set(areaId, new Set(ids));
    }
  }

  public exportSnapshot(): {
    observedEntityIds: string[];
    observedBranchIds: string[];
    areaEntityMap: Record<string, string[]>;
  } {
    const areaMap: Record<string, string[]> = {};
    for (const [areaId, ids] of this.areaEntityMap.entries()) {
      areaMap[areaId] = Array.from(ids);
    }
    return {
      observedEntityIds: Array.from(this.globalEntityIds),
      observedBranchIds: Array.from(this.globalBranchIds),
      areaEntityMap: areaMap
    };
  }
}
