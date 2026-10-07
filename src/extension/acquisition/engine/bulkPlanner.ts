/**
 * LeadNoria — Google Maps Acquisition Engine — Bulk Research Planner
 * Part 4: Deterministic Cartesian Planning & Plan Normalization
 *
 * Invariants:
 * - Deterministic Cartesian expansion: Keywords x Locations (keyword-major order).
 * - Whitespace normalization and duplicate suppression.
 * - Deterministic plan fingerprint based purely on normalized query tokens.
 * - Plan bounds validation with explicit warnings for large plans.
 * - Zero DOM/network side-effects: purely mathematical planning.
 */

import {
  hashStringDeterministic,
  createSearchUnit,
  normalizeKeyword,
  normalizeLocation,
  deriveSearchUnitId
} from './searchUnit.ts';

import type {
  GoogleMapsSearchUnit
} from './types.ts';

import {
  DEFAULT_BULK_EXECUTION_POLICY,
  BulkExecutionPolicy,
  BulkResearchRequest,
  BulkResearchPlan
} from './bulkPlanTypes.ts';

import {
  DEFAULT_GOOGLE_MAPS_FILTER,
  normalizeRatingFilter,
  normalizeWebsiteFilter,
  normalizeFilterCriteria
} from './filterTypes.ts';

export const BULK_PLAN_SCHEMA_VERSION = 1;
export const MAX_KEYWORD_LENGTH = 200;
export const MAX_LOCATION_LENGTH = 200;
export const MAX_RECOMMENDED_SEARCH_UNITS = 500;

/**
 * Normalizes an array of keywords:
 * - Trims and collapses whitespace
 * - Rejects empty strings
 * - Rejects strings exceeding MAX_KEYWORD_LENGTH
 * - Deduplicates case-insensitively, canonicalizing to lower-case
 */
export function normalizeKeywordList(rawKeywords: readonly string[]): string[] {
  if (!rawKeywords || !Array.isArray(rawKeywords)) {
    return [];
  }

  const seenKeys = new Set<string>();
  const normalized: string[] = [];

  for (const raw of rawKeywords) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
    if (trimmed.length === 0 || trimmed.length > MAX_KEYWORD_LENGTH) {
      continue;
    }
    const key = trimmed.toLowerCase();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      normalized.push(key);
    }
  }

  return normalized;
}

/**
 * Normalizes an array of locations:
 * - Trims and collapses whitespace
 * - Rejects empty strings
 * - Rejects strings exceeding MAX_LOCATION_LENGTH
 * - Deduplicates case-insensitively, preserving original casing of first occurrence
 */
export function normalizeLocationList(rawLocations: readonly string[]): string[] {
  if (!rawLocations || !Array.isArray(rawLocations)) {
    return [];
  }

  const seenKeys = new Set<string>();
  const normalized: string[] = [];

  for (const raw of rawLocations) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LOCATION_LENGTH) {
      continue;
    }
    const key = trimmed.toLowerCase();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      normalized.push(trimmed);
    }
  }

  return normalized;
}

/**
 * Computes a deterministic fingerprint for a research plan based on its normalized contents.
 * Independent of timestamps, run IDs, or memory addresses.
 */
export function computePlanFingerprint(
  keywords: readonly string[],
  locations: readonly string[],
  schemaVersion: number = BULK_PLAN_SCHEMA_VERSION
): string {
  const sortedKeywords = [...keywords].map(k => k.toLowerCase()).sort().join('|');
  const sortedLocations = [...locations].map(l => l.toLowerCase()).sort().join('|');
  const composite = `v${schemaVersion}::kw:${sortedKeywords}::loc:${sortedLocations}`;
  return `bpfp_${hashStringDeterministic(composite)}`;
}

/**
 * Validates a bulk research request before execution.
 */
export function validateBulkRequest(
  request: BulkResearchRequest,
  policyOverrides?: Partial<BulkExecutionPolicy>
): {
  valid: boolean;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  plannedCount: number;
  normalizedKeywords: string[];
  normalizedLocations: string[];
} {
  const policy: BulkExecutionPolicy = {
    ...DEFAULT_BULK_EXECUTION_POLICY,
    ...policyOverrides
  };

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!request) {
    return {
      valid: false,
      isValid: false,
      errors: ['Request object is required'],
      warnings: [],
      plannedCount: 0,
      normalizedKeywords: [],
      normalizedLocations: []
    };
  }

  if (!request.keywords || !Array.isArray(request.keywords)) {
    errors.push('keywords array is required');
  }

  if (!request.locations || !Array.isArray(request.locations)) {
    errors.push('locations array is required');
  }

  if (Array.isArray(request.keywords)) {
    for (const kw of request.keywords) {
      if (typeof kw === 'string' && kw.length > MAX_KEYWORD_LENGTH) {
        errors.push(`Keyword exceeds maximum length of ${MAX_KEYWORD_LENGTH}`);
        break;
      }
    }
  }

  if (Array.isArray(request.locations)) {
    for (const loc of request.locations) {
      if (typeof loc === 'string' && loc.length > MAX_LOCATION_LENGTH) {
        errors.push(`Location exceeds maximum length of ${MAX_LOCATION_LENGTH}`);
        break;
      }
    }
  }

  const normalizedKeywords = normalizeKeywordList(request.keywords || []);
  const normalizedLocations = normalizeLocationList(request.locations || []);

  if (errors.length === 0 && normalizedKeywords.length === 0) {
    errors.push('At least one valid keyword is required');
  }

  if (errors.length === 0 && normalizedLocations.length === 0) {
    errors.push('At least one valid location is required');
  }

  const plannedCount = normalizedKeywords.length * normalizedLocations.length;

  if (plannedCount > policy.maxSearchUnits) {
    warnings.push(
      `Plan contains ${plannedCount} SearchUnits, exceeding recommended maximum of ${policy.maxSearchUnits}. Explicit confirmation required.`
    );
  }

  const isValid = errors.length === 0;

  return {
    valid: isValid,
    isValid,
    errors,
    warnings,
    plannedCount,
    normalizedKeywords,
    normalizedLocations
  };
}

/**
 * Creates an immutable BulkResearchPlan from user inputs.
 * Expands keywords x locations in deterministic keyword-major Cartesian order.
 */
export function createBulkResearchPlan(
  request: BulkResearchRequest,
  policyOverrides?: Partial<BulkExecutionPolicy>
): BulkResearchPlan {
  const validation = validateBulkRequest(request, policyOverrides);
  if (!validation.isValid) {
    throw new Error(`Invalid BulkResearchRequest: ${validation.errors.join('; ')}`);
  }

  const policy: BulkExecutionPolicy = {
    ...DEFAULT_BULK_EXECUTION_POLICY,
    ...request.executionPolicy,
    ...policyOverrides
  };

  const { normalizedKeywords, normalizedLocations } = validation;
  const searchUnits: (GoogleMapsSearchUnit & { keyword: string; location: string })[] = [];
  const seenUnitIds = new Set<string>();

  // Keyword-major Cartesian expansion
  for (const kw of normalizedKeywords) {
    for (const loc of normalizedLocations) {
      const unitId = deriveSearchUnitId(kw, loc);
      if (seenUnitIds.has(unitId)) {
        continue;
      }
      seenUnitIds.add(unitId);
      const baseUnit = createSearchUnit({
        keyword: kw,
        location: loc,
        maxRetries: policy.maxRetriesPerUnit
      });
      searchUnits.push(
        Object.assign(baseUnit, { keyword: kw, location: loc })
      );
    }
  }

  const planFingerprint = computePlanFingerprint(
    normalizedKeywords,
    normalizedLocations,
    BULK_PLAN_SCHEMA_VERSION
  );

  const planId = request.planId || `plan_${planFingerprint}`;
  const initialFilter = normalizeFilterCriteria({
    rating: request.ratingFilter,
    website: request.websiteFilter
  });

  return Object.freeze({
    planId,
    planFingerprint,
    createdAt: new Date().toISOString(),
    normalizedKeywords: Object.freeze(normalizedKeywords),
    normalizedLocations: Object.freeze(normalizedLocations),
    searchUnits: Object.freeze(searchUnits),
    totalUnits: searchUnits.length,
    initialFilter,
    executionPolicy: Object.freeze(policy),
    ...(request.maxResults !== undefined ? { maxResults: request.maxResults } : {}),
    schemaVersion: BULK_PLAN_SCHEMA_VERSION
  });
}
