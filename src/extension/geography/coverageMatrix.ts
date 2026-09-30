/**
 * LeadNoria — Phase 13: Geographic Expansion & Saturation
 * Coverage Matrix
 * 
 * Invariants:
 * - Tracks coverage cells deterministically by (areaId, sourceType, category, queryVariant)
 * - Transparent candidate accounting (raw, unique, duplicate, unresolved, qualified)
 * - Descriptive operational metrics only — never claims total market completeness
 */

import { CoverageCell, SearchUnit, SearchUnitResultMetrics, CoverageState } from './geographicTypes.ts';

export class CoverageMatrix {
  private cells = new Map<string, CoverageCell>();

  private buildCellKey(areaId: string, sourceType: string, category?: string, queryVariant?: string): string {
    return `${areaId}::${sourceType}::${category || 'NONE'}::${queryVariant || 'NONE'}`;
  }

  public registerSearchUnit(unit: SearchUnit): void {
    const key = this.buildCellKey(unit.geographicAreaId, unit.sourceType, unit.category, unit.queryVariant);
    if (!this.cells.has(key)) {
      this.cells.set(key, {
        areaId: unit.geographicAreaId,
        sourceType: unit.sourceType,
        categoryId: unit.category || 'NONE',
        queryVariantId: unit.queryVariant || 'NONE',
        status: 'PLANNED',
        candidateCount: 0,
        uniqueCandidateCount: 0,
        duplicateCount: 0,
        unresolvedCount: 0,
        relevantCount: 0,
        qualifiedCount: 0,
        blockedCount: 0,
        errorCount: 0,
        durationMs: 0
      });
    }
  }

  public recordUnitCompletion(unit: SearchUnit, metrics: SearchUnitResultMetrics): void {
    const key = this.buildCellKey(unit.geographicAreaId, unit.sourceType, unit.category, unit.queryVariant);
    let cell = this.cells.get(key);
    if (!cell) {
      this.registerSearchUnit(unit);
      cell = this.cells.get(key)!;
    }

    let status: CoverageState = 'COMPLETED';
    if (metrics.isFailure) {
      status = 'FAILED';
    } else if (metrics.blockedCount > 0 && metrics.rawCandidateCount === metrics.blockedCount) {
      status = 'BLOCKED';
    } else if (metrics.isNoResults) {
      status = 'COMPLETED'; // Completed, but 0 results observed
    }

    cell.status = status;
    cell.candidateCount += metrics.rawCandidateCount;
    cell.uniqueCandidateCount += metrics.uniqueEntityCount;
    cell.duplicateCount += metrics.duplicateCount;
    cell.unresolvedCount += metrics.unresolvedCount;
    cell.relevantCount += metrics.relevantCount;
    cell.qualifiedCount += metrics.qualifiedCount;
    cell.blockedCount += metrics.blockedCount;
    cell.errorCount += metrics.errorCount;
    cell.durationMs += metrics.durationMs;
    cell.processedAt = new Date().toISOString();
  }

  public getCell(areaId: string, sourceType: string, category?: string, queryVariant?: string): CoverageCell | undefined {
    return this.cells.get(this.buildCellKey(areaId, sourceType, category, queryVariant));
  }

  public getAllCells(): CoverageCell[] {
    return Array.from(this.cells.values());
  }

  public getAreaCells(areaId: string): CoverageCell[] {
    return Array.from(this.cells.values()).filter(c => c.areaId === areaId);
  }

  public getAggregateMetrics(): {
    totalCells: number;
    completedCells: number;
    failedCells: number;
    blockedCells: number;
    totalCandidates: number;
    uniqueCandidates: number;
    duplicateCandidates: number;
  } {
    let completed = 0;
    let failed = 0;
    let blocked = 0;
    let total = 0;
    let unique = 0;
    let dup = 0;

    for (const cell of this.cells.values()) {
      if (cell.status === 'COMPLETED') completed++;
      if (cell.status === 'FAILED') failed++;
      if (cell.status === 'BLOCKED') blocked++;
      total += cell.candidateCount;
      unique += cell.uniqueCandidateCount;
      dup += cell.duplicateCount;
    }

    return {
      totalCells: this.cells.size,
      completedCells: completed,
      failedCells: failed,
      blockedCells: blocked,
      totalCandidates: total,
      uniqueCandidates: unique,
      duplicateCandidates: dup
    };
  }
}
