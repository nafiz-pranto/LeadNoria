/**
 * LeadNoria — Phase 13: Geographic Expansion & Saturation
 * Search Unit Planner
 * 
 * Invariants:
 * - Deterministic SearchUnit ID generation from canonical attributes
 * - Explicit guardrails on cross-product planning (areas x categories x queries x sources)
 * - Deterministic tie-break expansion ordering
 * - Dry-run planning capability without external source extraction
 */

import { createHash } from 'node:crypto';
import {
  GeographicPlan,
  SearchUnit,
  GeographicArea
} from './geographicTypes.ts';
import { GeographicHierarchy } from './geographicHierarchy.ts';

export interface PlanGenerationResult {
  searchUnits: SearchUnit[];
  totalPlannedUnits: number;
  areaCount: number;
  categoryCount: number;
  queryVariantCount: number;
  sourceCount: number;
  warnings: string[];
}

export function generateDeterministicSearchUnitId(params: {
  planId: string;
  geographicAreaId: string;
  sourceType: string;
  category?: string;
  queryVariant?: string;
}): string {
  const payload = [
    params.planId,
    params.geographicAreaId,
    params.sourceType,
    params.category || 'NO_CAT',
    params.queryVariant || 'NO_QUERY'
  ].join('::');
  const hash = createHash('sha256').update(payload).digest('hex').substring(0, 16);
  return `su_${hash}`;
}

/**
 * Plans and generates deterministic SearchUnits based on a validated GeographicPlan.
 */
export function planSearchUnits(
  plan: GeographicPlan,
  hierarchy: GeographicHierarchy
): PlanGenerationResult {
  const warnings: string[] = [];

  // 1. Get areas according to expansion strategy
  let orderedAreas: GeographicArea[] = [];
  if (plan.expansionStrategy === 'HIERARCHICAL_EXPANSION' || plan.expansionStrategy === 'COUNTRY_TO_REGION_TO_CITY') {
    orderedAreas = hierarchy.getDeterministicTraversal();
  } else if (plan.expansionStrategy === 'CITY_FIRST') {
    orderedAreas = hierarchy.getDeterministicTraversal().sort((a, b) => {
      const aIsCity = a.level === 'CITY' || a.level === 'DISTRICT' ? 1 : 0;
      const bIsCity = b.level === 'CITY' || b.level === 'DISTRICT' ? 1 : 0;
      if (bIsCity !== aIsCity) return bIsCity - aIsCity;
      return (b.priority ?? 0) - (a.priority ?? 0) || a.areaId.localeCompare(b.areaId);
    });
  } else {
    // Default deterministic order
    orderedAreas = hierarchy.getDeterministicTraversal();
  }

  // Enforce maxAreas limit
  if (orderedAreas.length > plan.limits.maxAreas) {
    warnings.push(`Area count (${orderedAreas.length}) exceeded limit (${plan.limits.maxAreas}); truncated.`);
    orderedAreas = orderedAreas.slice(0, plan.limits.maxAreas);
  }

  // 2. Safe defaults for empty categories/queryVariants/sources
  const sources = plan.sourceTypes.length > 0 ? plan.sourceTypes : ['GOOGLE_MAPS' as const];
  const categories = plan.categories.length > 0 ? plan.categories : [''];
  const queryVariants = plan.queryVariants.length > 0 ? plan.queryVariants : [''];

  // 3. Pre-calculate cross-product cardinality before allocating arrays
  const projectedUnits = orderedAreas.length * sources.length * categories.length * queryVariants.length;
  if (projectedUnits > plan.limits.maxSearchUnits) {
    throw new Error(
      `Cross-product planning exceeded maximum search units guardrail: ` +
      `${projectedUnits} units projected (${orderedAreas.length} areas * ${sources.length} sources * ` +
      `${categories.length} categories * ${queryVariants.length} query variants) > limit ${plan.limits.maxSearchUnits}`
    );
  }

  // 4. Generate search units deterministically
  const searchUnits: SearchUnit[] = [];
  let sequence = 0;
  const now = new Date().toISOString();

  for (const area of orderedAreas) {
    for (const source of sources) {
      for (const cat of categories) {
        for (const qv of queryVariants) {
          sequence++;
          const searchUnitId = generateDeterministicSearchUnitId({
            planId: plan.planId,
            geographicAreaId: area.areaId,
            sourceType: source,
            category: cat || undefined,
            queryVariant: qv || undefined
          });

          searchUnits.push({
            searchUnitId,
            planId: plan.planId,
            geographicAreaId: area.areaId,
            sourceType: source,
            category: cat || undefined,
            queryVariant: qv || undefined,
            language: plan.languages?.[0],
            countryCode: area.countryCode,
            sequence,
            priority: area.priority ?? 0,
            status: 'PLANNED',
            createdAt: now,
            retryCount: 0
          });

          if (searchUnits.length >= plan.limits.maxSearchUnits) {
            break;
          }
        }
        if (searchUnits.length >= plan.limits.maxSearchUnits) break;
      }
      if (searchUnits.length >= plan.limits.maxSearchUnits) break;
    }
    if (searchUnits.length >= plan.limits.maxSearchUnits) break;
  }

  return {
    searchUnits,
    totalPlannedUnits: searchUnits.length,
    areaCount: orderedAreas.length,
    categoryCount: categories.length,
    queryVariantCount: queryVariants.length,
    sourceCount: sources.length,
    warnings
  };
}
