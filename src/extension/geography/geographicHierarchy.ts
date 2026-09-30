/**
 * LeadNoria — Phase 13: Geographic Expansion & Saturation
 * Geographic Hierarchy & Graph Management
 * 
 * Invariants:
 * - Detects and rejects cycles (e.g. A -> B -> C -> A)
 * - Detects and rejects self-parenting (A -> A)
 * - Enforces bounded depth (no unbounded recursion)
 * - Deterministic traversal order independent of insertion order
 */

import { GeographicArea } from './geographicTypes.ts';

export interface HierarchyValidationResult {
  isValid: boolean;
  errors: string[];
}

export class GeographicHierarchy {
  private areasById = new Map<string, GeographicArea>();
  private childrenByParentId = new Map<string, string[]>();
  private rootAreaIds: string[] = [];

  constructor(areas: GeographicArea[] = []) {
    for (const area of areas) {
      this.addArea(area);
    }
  }

  /**
   * Adds an area to the hierarchy map.
   */
  public addArea(area: GeographicArea): void {
    this.areasById.set(area.areaId, area);
    if (area.parentAreaId) {
      const siblings = this.childrenByParentId.get(area.parentAreaId) || [];
      if (!siblings.includes(area.areaId)) {
        siblings.push(area.areaId);
        this.childrenByParentId.set(area.parentAreaId, siblings);
      }
    } else {
      if (!this.rootAreaIds.includes(area.areaId)) {
        this.rootAreaIds.push(area.areaId);
      }
    }
  }

  public getArea(areaId: string): GeographicArea | undefined {
    return this.areasById.get(areaId);
  }

  public getAllAreas(): GeographicArea[] {
    return Array.from(this.areasById.values());
  }

  public getChildren(parentAreaId: string): GeographicArea[] {
    const childIds = this.childrenByParentId.get(parentAreaId) || [];
    return childIds
      .map(id => this.areasById.get(id))
      .filter((a): a is GeographicArea => a !== undefined)
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.areaId.localeCompare(b.areaId));
  }

  public getRootAreas(): GeographicArea[] {
    return this.rootAreaIds
      .map(id => this.areasById.get(id))
      .filter((a): a is GeographicArea => a !== undefined)
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.areaId.localeCompare(b.areaId));
  }

  /**
   * Validates the hierarchy for cycles, self-parenting, invalid parent references, and depth limits.
   */
  public validate(maxDepth = 10): HierarchyValidationResult {
    const errors: string[] = [];

    // 1. Check self-parenting
    for (const [id, area] of this.areasById.entries()) {
      if (area.parentAreaId === id) {
        errors.push(`Self-parenting detected for area '${id}' (${area.name})`);
      }
    }

    // 2. Check missing parent references
    for (const [id, area] of this.areasById.entries()) {
      if (area.parentAreaId && !this.areasById.has(area.parentAreaId)) {
        errors.push(`Area '${id}' references non-existent parentAreaId '${area.parentAreaId}'`);
      }
    }

    // 3. Cycle detection & depth verification
    for (const areaId of this.areasById.keys()) {
      const visited = new Set<string>();
      let currId: string | undefined = areaId;
      let depth = 0;

      while (currId) {
        if (visited.has(currId)) {
          errors.push(`Cycle detected in hierarchy involving area '${currId}'`);
          break;
        }
        visited.add(currId);
        depth++;

        if (depth > maxDepth) {
          errors.push(`Hierarchy depth limit (${maxDepth}) exceeded starting at area '${areaId}' (depth: ${depth})`);
          break;
        }

        const currArea = this.areasById.get(currId);
        currId = currArea?.parentAreaId;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Deterministic traversal returning all areas ordered by:
   * 1. Priority descending
   * 2. Hierarchy depth ascending
   * 3. Canonical areaId ascending
   */
  public getDeterministicTraversal(): GeographicArea[] {
    const all = Array.from(this.areasById.values());
    return all.sort((a, b) => {
      const pDiff = (b.priority ?? 0) - (a.priority ?? 0);
      if (pDiff !== 0) return pDiff;
      const dDiff = a.depth - b.depth;
      if (dDiff !== 0) return dDiff;
      return a.areaId.localeCompare(b.areaId);
    });
  }
}
