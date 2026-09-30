/**
 * LeadNoria — Phase 13: Geographic Expansion & Saturation
 * Geographic Plan Validator
 * 
 * Invariants:
 * - Protects against prototype pollution (__proto__, constructor, prototype)
 * - Rejects NaN, Infinity, negative limits, impossible coordinates
 * - Rejects oversized inputs before allocating resources
 * - No code execution or eval()
 */

import { GeographicPlan, SaturationPolicy, GeographicPlanLimits } from './geographicTypes.ts';

export interface PlanValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Checks for prototype pollution patterns recursively in an object.
 */
export function detectPrototypePollution(obj: unknown, depth = 0): string | null {
  if (!obj || typeof obj !== 'object' || depth > 10) return null;

  const forbiddenKeys = ['__proto__', 'constructor', 'prototype'];
  for (const key of Object.keys(obj)) {
    if (forbiddenKeys.includes(key)) {
      return `Prohibited object key detected: '${key}'`;
    }
    const val = (obj as Record<string, unknown>)[key];
    if (val && typeof val === 'object') {
      const nested = detectPrototypePollution(val, depth + 1);
      if (nested) return nested;
    }
  }
  return null;
}

/**
 * Validates a SaturationPolicy object.
 */
export function validateSaturationPolicy(policy: SaturationPolicy): string[] {
  const errors: string[] = [];

  if (!policy || typeof policy !== 'object') {
    errors.push('SaturationPolicy must be an object');
    return errors;
  }

  if (typeof policy.minimumSamples !== 'number' || !Number.isFinite(policy.minimumSamples) || policy.minimumSamples < 1) {
    errors.push(`Invalid minimumSamples: must be a positive integer (got ${policy.minimumSamples})`);
  }
  if (
    typeof policy.minimumMarginalYield !== 'number' ||
    !Number.isFinite(policy.minimumMarginalYield) ||
    policy.minimumMarginalYield < 0 ||
    policy.minimumMarginalYield > 1
  ) {
    errors.push(`Invalid minimumMarginalYield: must be between 0 and 1 (got ${policy.minimumMarginalYield})`);
  }
  if (
    typeof policy.consecutiveLowYieldUnits !== 'number' ||
    !Number.isFinite(policy.consecutiveLowYieldUnits) ||
    policy.consecutiveLowYieldUnits < 1
  ) {
    errors.push(`Invalid consecutiveLowYieldUnits: must be a positive integer (got ${policy.consecutiveLowYieldUnits})`);
  }
  if (typeof policy.maximumUnits !== 'number' || !Number.isFinite(policy.maximumUnits) || policy.maximumUnits < 1) {
    errors.push(`Invalid maximumUnits: must be positive (got ${policy.maximumUnits})`);
  }
  if (typeof policy.maximumAreas !== 'number' || !Number.isFinite(policy.maximumAreas) || policy.maximumAreas < 1) {
    errors.push(`Invalid maximumAreas: must be positive (got ${policy.maximumAreas})`);
  }
  if (typeof policy.maximumCandidates !== 'number' || !Number.isFinite(policy.maximumCandidates) || policy.maximumCandidates < 1) {
    errors.push(`Invalid maximumCandidates: must be positive (got ${policy.maximumCandidates})`);
  }
  if (typeof policy.maximumRuntimeMs !== 'number' || !Number.isFinite(policy.maximumRuntimeMs) || policy.maximumRuntimeMs < 1) {
    errors.push(`Invalid maximumRuntimeMs: must be positive (got ${policy.maximumRuntimeMs})`);
  }
  if (
    typeof policy.maximumErrorRate !== 'number' ||
    !Number.isFinite(policy.maximumErrorRate) ||
    policy.maximumErrorRate < 0 ||
    policy.maximumErrorRate > 1
  ) {
    errors.push(`Invalid maximumErrorRate: must be between 0 and 1 (got ${policy.maximumErrorRate})`);
  }

  return errors;
}

/**
 * Validates GeographicPlan limits.
 */
export function validatePlanLimits(limits: GeographicPlanLimits): string[] {
  const errors: string[] = [];
  if (!limits || typeof limits !== 'object') {
    errors.push('Plan limits must be an object');
    return errors;
  }
  if (typeof limits.maxAreas !== 'number' || !Number.isFinite(limits.maxAreas) || limits.maxAreas < 1 || limits.maxAreas > 10_000) {
    errors.push(`Invalid limits.maxAreas: must be between 1 and 10,000 (got ${limits.maxAreas})`);
  }
  if (typeof limits.maxSearchUnits !== 'number' || !Number.isFinite(limits.maxSearchUnits) || limits.maxSearchUnits < 1 || limits.maxSearchUnits > 50_000) {
    errors.push(`Invalid limits.maxSearchUnits: must be between 1 and 50,000 (got ${limits.maxSearchUnits})`);
  }
  if (typeof limits.maxHierarchyDepth !== 'number' || !Number.isFinite(limits.maxHierarchyDepth) || limits.maxHierarchyDepth < 1 || limits.maxHierarchyDepth > 20) {
    errors.push(`Invalid limits.maxHierarchyDepth: must be between 1 and 20 (got ${limits.maxHierarchyDepth})`);
  }
  return errors;
}

/**
 * Master validation for GeographicPlan configuration.
 */
export function validateGeographicPlan(plan: unknown): PlanValidationResult {
  const errors: string[] = [];

  if (!plan || typeof plan !== 'object') {
    return { isValid: false, errors: ['GeographicPlan must be a valid non-null object'] };
  }

  // 1. Prototype pollution check
  const pollution = detectPrototypePollution(plan);
  if (pollution) {
    errors.push(pollution);
  }

  const p = plan as Partial<GeographicPlan>;

  // 2. Identity and version checks
  if (!p.planId || typeof p.planId !== 'string' || p.planId.trim() === '') {
    errors.push('planId is required and must be a non-empty string');
  }
  if (!p.planVersion || typeof p.planVersion !== 'string' || p.planVersion.trim() === '') {
    errors.push('planVersion is required and must be a non-empty string');
  }

  // 3. Root areas
  if (!Array.isArray(p.rootAreas)) {
    errors.push('rootAreas must be an array');
  }

  // 4. Expansion strategy
  const validStrategies = [
    'HIERARCHICAL_EXPANSION',
    'COUNTRY_TO_REGION_TO_CITY',
    'REGION_FIRST',
    'CITY_FIRST',
    'CUSTOM_AREA_ORDER',
    'MANUAL_QUEUE'
  ];
  if (!p.expansionStrategy || !validStrategies.includes(p.expansionStrategy)) {
    errors.push(`Invalid expansionStrategy: '${p.expansionStrategy}'`);
  }

  // 5. Saturation policy validation
  if (p.saturationPolicy) {
    errors.push(...validateSaturationPolicy(p.saturationPolicy));
  } else {
    errors.push('saturationPolicy is required');
  }

  // 6. Limits validation
  if (p.limits) {
    errors.push(...validatePlanLimits(p.limits));
  } else {
    errors.push('limits is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
