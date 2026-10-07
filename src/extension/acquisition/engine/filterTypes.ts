/**
 * LeadNoria — Google Maps Acquisition Engine — Rating + Website Filter Domain
 * Part 3: Filter Domain Contracts & Interfaces
 *
 * HARD BOUNDARIES & INVARIANTS:
 * - Pure, deterministic, local filtering over acquired candidate observations.
 * - Non-destructive: raw acquired observations are NEVER mutated, overwritten, or deleted.
 * - Filter choices exposed to user:
 *     RATING: 'ANY' | '4.0+' | '4.5+'
 *     WEBSITE: 'ANY' | 'WITH_WEBSITE' | 'WITHOUT_WEBSITE'
 * - Filters combine with strict AND semantics.
 * - Minimum rating filters treat UNKNOWN as NOT MATCHING, but MUST NOT rewrite UNKNOWN into ABSENT.
 * - Website WITHOUT matches ONLY explicit ABSENT evidence (never UNKNOWN/AMBIGUOUS/UNSUPPORTED).
 * - Changing filters never triggers re-scraping, page reload, or re-acquisition.
 * - Pure functions with zero DOM, zero network, zero side effects.
 */

import type { GoogleMapsCandidateObservation } from './types.ts';

// ============================================================================
// 1. User-Facing Filter Option Types (Canonical Internal Contract)
// ============================================================================

export type RatingFilterOption =
  | 'ANY'
  | 'MIN_4_0'
  | 'MIN_4_5';

export type WebsiteFilterOption =
  | 'ANY'
  | 'WITH_WEBSITE'
  | 'WITHOUT_WEBSITE';

export interface GoogleMapsFilterCriteria {
  readonly rating: RatingFilterOption;
  readonly website: WebsiteFilterOption;
}

export const DEFAULT_GOOGLE_MAPS_FILTER: GoogleMapsFilterCriteria = Object.freeze({
  rating: 'ANY',
  website: 'ANY'
});

/**
 * Single validated boundary function to normalize any external or legacy rating representation
 * into the canonical internal RatingFilterOption ('ANY' | 'MIN_4_0' | 'MIN_4_5').
 */
export function normalizeRatingFilter(input: unknown): RatingFilterOption {
  if (typeof input !== 'string') return 'ANY';
  const trimmed = input.trim();
  if (trimmed === 'MIN_4_5' || trimmed === '4.5+' || trimmed === '4.5') {
    return 'MIN_4_5';
  }
  if (trimmed === 'MIN_4_0' || trimmed === '4.0+' || trimmed === '4.0') {
    return 'MIN_4_0';
  }
  return 'ANY';
}

/**
 * Single validated boundary function to normalize any external website representation
 * into the canonical internal WebsiteFilterOption ('ANY' | 'WITH_WEBSITE' | 'WITHOUT_WEBSITE').
 */
export function normalizeWebsiteFilter(input: unknown): WebsiteFilterOption {
  if (typeof input !== 'string') return 'ANY';
  const trimmed = input.trim();
  if (trimmed === 'WITH_WEBSITE' || trimmed === 'WITH' || trimmed === 'PRESENT') {
    return 'WITH_WEBSITE';
  }
  if (trimmed === 'WITHOUT_WEBSITE' || trimmed === 'WITHOUT' || trimmed === 'ABSENT') {
    return 'WITHOUT_WEBSITE';
  }
  return 'ANY';
}

/**
 * Normalizes filter criteria into immutable canonical representation.
 */
export function normalizeFilterCriteria(input: unknown): GoogleMapsFilterCriteria {
  if (!input || typeof input !== 'object') {
    return DEFAULT_GOOGLE_MAPS_FILTER;
  }
  const obj = input as Record<string, unknown>;
  return Object.freeze({
    rating: normalizeRatingFilter(obj.rating),
    website: normalizeWebsiteFilter(obj.website)
  });
}

// ============================================================================
// 2. Deterministic Reason Codes
// ============================================================================

export type RatingMatchReason =
  | 'RATING_ANY'
  | 'RATING_THRESHOLD_MET'
  | 'RATING_BELOW_THRESHOLD'
  | 'RATING_UNKNOWN'
  | 'RATING_ABSENT'
  | 'RATING_AMBIGUOUS'
  | 'RATING_UNSUPPORTED';

export type WebsiteMatchReason =
  | 'WEBSITE_ANY'
  | 'WEBSITE_PRESENT'
  | 'WEBSITE_ABSENT'
  | 'WEBSITE_UNKNOWN'
  | 'WEBSITE_AMBIGUOUS'
  | 'WEBSITE_UNSUPPORTED';

export type CombinedMatchReason =
  | 'COMBINED_MATCH'
  | 'COMBINED_RATING_MISMATCH'
  | 'COMBINED_WEBSITE_MISMATCH'
  | 'COMBINED_BOTH_MISMATCH';

// ============================================================================
// 3. Evaluation Result Contracts
// ============================================================================

export interface SingleFieldFilterResult<R extends string> {
  readonly matches: boolean;
  readonly reason: R;
  readonly observedAvailability: string;
  readonly observedValue?: string | number;
}

export interface CandidateFilterEvaluation {
  readonly candidateId: string;
  readonly observationId: string;
  readonly matches: boolean;
  readonly combinedReason: CombinedMatchReason;
  readonly rating: SingleFieldFilterResult<RatingMatchReason>;
  readonly website: SingleFieldFilterResult<WebsiteMatchReason>;
  readonly explanation: string;
}

// ============================================================================
// 4. Counts & Dataset Views
// ============================================================================

export interface FilterDatasetCounts {
  readonly totalObserved: number;
  readonly matchingCount: number;
  readonly excludedCount: number;
  readonly rating4PlusCount: number;
  readonly rating4_5PlusCount: number;
  readonly websitePresentCount: number;
  readonly websiteAbsentCount: number;
}

export type FilteredEmptyStateReason =
  | 'NO_DATA'                  // Zero candidates acquired in dataset
  | 'ACQUISITION_IN_PROGRESS'  // Acquisition running but no candidates arrived yet
  | 'NO_MATCHES'               // Dataset has candidates, but active filter excludes all
  | 'NONE';                    // Results exist and match filter

export interface FilteredDatasetView {
  readonly totalObserved: number;
  readonly matchingCount: number;
  readonly excludedCount: number;
  readonly matchingCandidateIds: readonly string[];
  readonly visibleCandidateIds: readonly string[];
  readonly matchingObservations: readonly GoogleMapsCandidateObservation[];
  readonly visibleCandidates: readonly GoogleMapsCandidateObservation[];
  readonly activeFilter: GoogleMapsFilterCriteria;
  readonly counts: FilterDatasetCounts;
  readonly emptyStateReason: FilteredEmptyStateReason;
  readonly evaluations: ReadonlyMap<string, CandidateFilterEvaluation>;
}

// ============================================================================
// 5. Filter State Actions
// ============================================================================

export type GoogleMapsFilterAction =
  | { type: 'SET_RATING_FILTER'; rating: RatingFilterOption }
  | { type: 'SET_WEBSITE_FILTER'; website: WebsiteFilterOption }
  | { type: 'SET_FILTER'; filter: GoogleMapsFilterCriteria }
  | { type: 'RESET_FILTERS' };
