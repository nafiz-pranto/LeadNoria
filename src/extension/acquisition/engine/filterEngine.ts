/**
 * LeadNoria — Google Maps Acquisition Engine — Rating + Website Filter Engine
 * Part 3: Pure Deterministic Filter Implementation
 *
 * HARD BOUNDARIES & INVARIANTS:
 * - Pure, deterministic, local filtering over acquired candidate observations.
 * - Non-destructive: raw acquired observations are NEVER mutated, overwritten, or deleted.
 * - User-facing choices:
 *     RATING: 'ANY' | '4.0+' | '4.5+'
 *     WEBSITE: 'ANY' | 'WITH_WEBSITE' | 'WITHOUT_WEBSITE'
 * - Filters combine with strict AND semantics.
 * - Minimum rating filters treat UNKNOWN as NOT MATCHING, but MUST NOT rewrite UNKNOWN into ABSENT.
 * - Website WITHOUT matches ONLY explicit ABSENT evidence (never UNKNOWN/AMBIGUOUS/UNSUPPORTED).
 * - Changing filters never triggers re-scraping, page reload, or re-acquisition.
 * - Pure functions with zero DOM, zero network, zero side effects.
 */

import type { GoogleMapsCandidateObservation } from './types.ts';
import type {
  RatingFilterOption,
  WebsiteFilterOption,
  GoogleMapsFilterCriteria,
  RatingMatchReason,
  WebsiteMatchReason,
  CombinedMatchReason,
  SingleFieldFilterResult,
  CandidateFilterEvaluation,
  FilterDatasetCounts,
  FilteredDatasetView,
  FilteredEmptyStateReason
} from './filterTypes.ts';
import {
  DEFAULT_GOOGLE_MAPS_FILTER,
  normalizeRatingFilter,
  normalizeWebsiteFilter,
  normalizeFilterCriteria
} from './filterTypes.ts';
export {
  DEFAULT_GOOGLE_MAPS_FILTER,
  normalizeRatingFilter,
  normalizeWebsiteFilter,
  normalizeFilterCriteria
};
import { normalizeWebsiteUrl } from '../../websiteUrlNormalizer.ts';

// ============================================================================
// 1. Pure Rating Matcher
// ============================================================================

/**
 * Evaluates a candidate observation against a canonical rating filter option.
 * Pure deterministic function with zero side-effects.
 */
export function evaluateRatingMatch(
  candidate: GoogleMapsCandidateObservation,
  ratingFilter: RatingFilterOption | string
): SingleFieldFilterResult<RatingMatchReason> {
  const canonicalFilter = normalizeRatingFilter(ratingFilter);
  const ratingField = candidate.rating;
  const avail = ratingField ? ratingField.availability : 'UNKNOWN';
  const val = ratingField ? ratingField.parsedValue : undefined;

  // 1. RATING = ANY: Every candidate matches regardless of availability
  if (canonicalFilter === 'ANY') {
    return {
      matches: true,
      reason: 'RATING_ANY',
      observedAvailability: avail,
      observedValue: val
    };
  }

  // Canonical constrained thresholds: MIN_4_5 -> 4.5, MIN_4_0 -> 4.0
  const threshold = canonicalFilter === 'MIN_4_5' ? 4.5 : 4.0;

  // 2. Constrained filter ('4.0+' or '4.5+')
  // Candidate matches ONLY when rating.availability === PRESENT and parsedValue is a finite number >= threshold
  if (avail === 'PRESENT') {
    if (typeof val === 'number' && Number.isFinite(val)) {
      if (val >= threshold) {
        return {
          matches: true,
          reason: 'RATING_THRESHOLD_MET',
          observedAvailability: avail,
          observedValue: val
        };
      }
      return {
        matches: false,
        reason: 'RATING_BELOW_THRESHOLD',
        observedAvailability: avail,
        observedValue: val
      };
    }
    // Present but non-numeric / malformed
    return {
      matches: false,
      reason: 'RATING_AMBIGUOUS',
      observedAvailability: avail,
      observedValue: val
    };
  }

  if (avail === 'UNKNOWN') {
    return {
      matches: false,
      reason: 'RATING_UNKNOWN',
      observedAvailability: avail,
      observedValue: undefined
    };
  }

  if (avail === 'ABSENT') {
    return {
      matches: false,
      reason: 'RATING_ABSENT',
      observedAvailability: avail,
      observedValue: undefined
    };
  }

  if (avail === 'AMBIGUOUS') {
    return {
      matches: false,
      reason: 'RATING_AMBIGUOUS',
      observedAvailability: avail,
      observedValue: undefined
    };
  }

  // UNSUPPORTED or any other state
  return {
    matches: false,
    reason: 'RATING_UNSUPPORTED',
    observedAvailability: avail,
    observedValue: undefined
  };
}

// ============================================================================
// 2. Pure Website Matcher
// ============================================================================

/**
 * Evaluates a candidate observation against a website filter option.
 * Pure deterministic function with zero network interaction.
 */
export function evaluateWebsiteMatch(
  candidate: GoogleMapsCandidateObservation,
  websiteFilter: WebsiteFilterOption | string
): SingleFieldFilterResult<WebsiteMatchReason> {
  const canonicalWeb = normalizeWebsiteFilter(websiteFilter);
  const webField = candidate.websiteUrl;
  const avail = webField ? webField.availability : 'UNKNOWN';
  const rawUrl = webField ? (webField.parsedValue || webField.rawValue) : undefined;

  // 1. WEBSITE = ANY: Every candidate matches regardless of availability
  if (canonicalWeb === 'ANY') {
    return {
      matches: true,
      reason: 'WEBSITE_ANY',
      observedAvailability: avail,
      observedValue: rawUrl
    };
  }

  // 2. WEBSITE = WITH_WEBSITE:
  // Matches ONLY when website.availability === PRESENT and URL is valid via LeadNoria normalizer
  if (canonicalWeb === 'WITH_WEBSITE') {
    if (avail === 'PRESENT') {
      if (rawUrl) {
        const norm = normalizeWebsiteUrl(rawUrl);
        if (norm.isValid && !norm.normalizedUrl.includes('google.com/maps')) {
          return {
            matches: true,
            reason: 'WEBSITE_PRESENT',
            observedAvailability: avail,
            observedValue: norm.normalizedUrl
          };
        }
      }
      return {
        matches: false,
        reason: 'WEBSITE_AMBIGUOUS',
        observedAvailability: avail,
        observedValue: rawUrl
      };
    }

    if (avail === 'ABSENT') {
      return {
        matches: false,
        reason: 'WEBSITE_ABSENT',
        observedAvailability: avail,
        observedValue: undefined
      };
    }

    if (avail === 'UNKNOWN') {
      return {
        matches: false,
        reason: 'WEBSITE_UNKNOWN',
        observedAvailability: avail,
        observedValue: undefined
      };
    }

    if (avail === 'AMBIGUOUS') {
      return {
        matches: false,
        reason: 'WEBSITE_AMBIGUOUS',
        observedAvailability: avail,
        observedValue: undefined
      };
    }

    return {
      matches: false,
      reason: 'WEBSITE_UNSUPPORTED',
      observedAvailability: avail,
      observedValue: undefined
    };
  }

  // 3. WEBSITE = WITHOUT_WEBSITE:
  // Matches ONLY when website.availability === ABSENT (explicit absence evidence)
  // Rejects PRESENT, UNKNOWN, AMBIGUOUS, UNSUPPORTED
  if (canonicalWeb === 'WITHOUT_WEBSITE') {
    if (avail === 'ABSENT') {
      return {
        matches: true,
        reason: 'WEBSITE_ABSENT',
        observedAvailability: avail,
        observedValue: undefined
      };
    }

    if (avail === 'PRESENT') {
      return {
        matches: false,
        reason: 'WEBSITE_PRESENT',
        observedAvailability: avail,
        observedValue: rawUrl
      };
    }

    if (avail === 'UNKNOWN') {
      return {
        matches: false,
        reason: 'WEBSITE_UNKNOWN',
        observedAvailability: avail,
        observedValue: undefined
      };
    }

    if (avail === 'AMBIGUOUS') {
      return {
        matches: false,
        reason: 'WEBSITE_AMBIGUOUS',
        observedAvailability: avail,
        observedValue: undefined
      };
    }

    return {
      matches: false,
      reason: 'WEBSITE_UNSUPPORTED',
      observedAvailability: avail,
      observedValue: undefined
    };
  }

  return {
    matches: false,
    reason: 'WEBSITE_UNKNOWN',
    observedAvailability: avail,
    observedValue: undefined
  };
}

// ============================================================================
// 3. AND Composition & Explanation
// ============================================================================

/**
 * Formats a concise, human-readable explanation for a filter evaluation.
 */
export function formatFilterExplanation(
  ratingResOrEval: SingleFieldFilterResult<RatingMatchReason> | CandidateFilterEvaluation,
  webRes?: SingleFieldFilterResult<WebsiteMatchReason>,
  criteria?: GoogleMapsFilterCriteria
): string {
  if (ratingResOrEval && 'rating' in ratingResOrEval && 'website' in ratingResOrEval) {
    const ev = ratingResOrEval as CandidateFilterEvaluation;
    if (ev.explanation) return ev.explanation;
    return formatFilterExplanation(ev.rating, ev.website, criteria || { rating: 'ANY', website: 'ANY' });
  }

  const ratingRes = ratingResOrEval as SingleFieldFilterResult<RatingMatchReason>;
  const effectiveWebRes = webRes || { matches: true, reason: 'WEBSITE_ANY', observedAvailability: 'UNKNOWN' };
  const effectiveCriteria = normalizeFilterCriteria(criteria);

  if (ratingRes.matches && effectiveWebRes.matches) {
    const rLabel = effectiveCriteria.rating === 'MIN_4_5' ? '4.5+' : (effectiveCriteria.rating === 'MIN_4_0' ? '4.0+' : 'any');
    const rNote = effectiveCriteria.rating === 'ANY' ? 'any rating' : `rating ${ratingRes.observedValue} meets ${rLabel}`;
    const wNote = effectiveCriteria.website === 'ANY' ? 'any website' : (effectiveCriteria.website === 'WITH_WEBSITE' ? 'website is present' : 'website is confirmed absent');
    return `Matches: ${rNote} and ${wNote}.`;
  }

  const parts: string[] = [];
  if (!ratingRes.matches) {
    if (ratingRes.reason === 'RATING_BELOW_THRESHOLD') {
      const thresholdLabel = effectiveCriteria.rating === 'MIN_4_5' ? '4.5' : '4.0';
      parts.push(`rating ${ratingRes.observedValue} is below ${thresholdLabel}`);
    } else if (ratingRes.reason === 'RATING_UNKNOWN') {
      parts.push('rating status is unknown on observation surface');
    } else if (ratingRes.reason === 'RATING_ABSENT') {
      parts.push('business has no rating');
    } else {
      parts.push(`rating evidence is ${ratingRes.observedAvailability.toLowerCase()}`);
    }
  }

  if (!webRes.matches) {
    if (effectiveCriteria.website === 'WITH_WEBSITE') {
      if (webRes.reason === 'WEBSITE_UNKNOWN') {
        parts.push('website was not shown on result card (presence unknown)');
      } else if (webRes.reason === 'WEBSITE_ABSENT') {
        parts.push('website is confirmed absent');
      } else {
        parts.push(`website evidence is ${webRes.observedAvailability.toLowerCase()}`);
      }
    } else if (effectiveCriteria.website === 'WITHOUT_WEBSITE') {
      if (webRes.reason === 'WEBSITE_PRESENT') {
        parts.push('candidate has a verified website');
      } else if (webRes.reason === 'WEBSITE_UNKNOWN') {
        parts.push('card omitted website link without proving absence');
      } else {
        parts.push(`website evidence is ${webRes.observedAvailability.toLowerCase()}`);
      }
    }
  }

  return `Does not match: ${parts.join('; ')}.`;
}

/**
 * Evaluates a candidate observation against the combined filter criteria.
 * Enforces strict AND composition.
 */
export function evaluateCandidateFilter(
  candidate: GoogleMapsCandidateObservation,
  filter: GoogleMapsFilterCriteria
): CandidateFilterEvaluation {
  const canonicalFilter = normalizeFilterCriteria(filter);
  const ratingRes = evaluateRatingMatch(candidate, canonicalFilter.rating);
  const webRes = evaluateWebsiteMatch(candidate, canonicalFilter.website);

  const matches = ratingRes.matches && webRes.matches;

  let combinedReason: CombinedMatchReason = 'COMBINED_MATCH';
  if (!matches) {
    if (!ratingRes.matches && !webRes.matches) {
      combinedReason = 'COMBINED_BOTH_MISMATCH';
    } else if (!ratingRes.matches) {
      combinedReason = 'COMBINED_RATING_MISMATCH';
    } else {
      combinedReason = 'COMBINED_WEBSITE_MISMATCH';
    }
  }

  const explanation = formatFilterExplanation(ratingRes, webRes, canonicalFilter);

  return {
    candidateId: candidate.observationId,
    observationId: candidate.observationId,
    matches,
    combinedReason,
    rating: ratingRes,
    website: webRes,
    explanation
  };
}

// ============================================================================
// 4. Counts Calculation
// ============================================================================

/**
 * Computes deterministic counts across a candidate collection.
 * Distinguishes combined matching counts from independent dimension counts.
 */
export function calculateFilterCounts(
  candidates: readonly GoogleMapsCandidateObservation[],
  filter: GoogleMapsFilterCriteria
): FilterDatasetCounts {
  const canonicalFilter = normalizeFilterCriteria(filter);
  let matchingCount = 0;
  let rating4PlusCount = 0;
  let rating4_5PlusCount = 0;
  let websitePresentCount = 0;
  let websiteAbsentCount = 0;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];

    // Independent rating counts
    const rField = c.rating;
    if (rField && rField.availability === 'PRESENT' && typeof rField.parsedValue === 'number') {
      if (rField.parsedValue >= 4.0) rating4PlusCount++;
      if (rField.parsedValue >= 4.5) rating4_5PlusCount++;
    }

    // Independent website counts
    const wField = c.websiteUrl;
    if (wField && wField.availability === 'PRESENT') {
      const norm = normalizeWebsiteUrl(wField.parsedValue || wField.rawValue);
      if (norm.isValid && !norm.normalizedUrl.includes('google.com/maps')) {
        websitePresentCount++;
      }
    } else if (wField && wField.availability === 'ABSENT') {
      websiteAbsentCount++;
    }

    // Combined AND evaluation
    const rMatch = evaluateRatingMatch(c, canonicalFilter.rating);
    if (rMatch.matches) {
      const wMatch = evaluateWebsiteMatch(c, canonicalFilter.website);
      if (wMatch.matches) {
        matchingCount++;
      }
    }
  }

  return {
    totalObserved: candidates.length,
    matchingCount,
    excludedCount: candidates.length - matchingCount,
    rating4PlusCount,
    rating4_5PlusCount,
    websitePresentCount,
    websiteAbsentCount
  };
}

// ============================================================================
// 5. Dataset Filtering Layer
// ============================================================================

/**
 * Pure dataset filtering function.
 * Filters candidates without mutating the input array or candidate objects.
 * Scales linearly in O(N) where N = candidates.length.
 */
export function filterCandidateDataset(
  candidates: readonly GoogleMapsCandidateObservation[],
  filter: GoogleMapsFilterCriteria,
  isAcquisitionRunning = false
): FilteredDatasetView {
  const canonicalFilter = normalizeFilterCriteria(filter);
  const matchingCandidateIds: string[] = [];
  const matchingObservations: GoogleMapsCandidateObservation[] = [];
  const evaluations = new Map<string, CandidateFilterEvaluation>();

  let rating4PlusCount = 0;
  let rating4_5PlusCount = 0;
  let websitePresentCount = 0;
  let websiteAbsentCount = 0;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const evalResult = evaluateCandidateFilter(c, canonicalFilter);
    evaluations.set(c.observationId, evalResult);

    // Track independent dimension metrics
    const rField = c.rating;
    if (rField && rField.availability === 'PRESENT' && typeof rField.parsedValue === 'number') {
      if (rField.parsedValue >= 4.0) rating4PlusCount++;
      if (rField.parsedValue >= 4.5) rating4_5PlusCount++;
    }
    const wField = c.websiteUrl;
    if (wField && wField.availability === 'PRESENT') {
      const norm = normalizeWebsiteUrl(wField.parsedValue || wField.rawValue);
      if (norm.isValid && !norm.normalizedUrl.includes('google.com/maps')) {
        websitePresentCount++;
      }
    } else if (wField && wField.availability === 'ABSENT') {
      websiteAbsentCount++;
    }

    const id = c.candidateId || c.observationId;
    if (evalResult.matches) {
      matchingCandidateIds.push(id);
      matchingObservations.push(c);
    }
  }

  const matchingCount = matchingObservations.length;
  const excludedCount = candidates.length - matchingCount;

  // Deterministic empty-state classification
  let emptyStateReason: FilteredEmptyStateReason = 'NONE';
  if (candidates.length === 0) {
    emptyStateReason = isAcquisitionRunning ? 'ACQUISITION_IN_PROGRESS' : 'NO_DATA';
  } else if (matchingCount === 0) {
    emptyStateReason = 'NO_MATCHES';
  }

  const counts: FilterDatasetCounts = {
    totalObserved: candidates.length,
    matchingCount,
    excludedCount,
    rating4PlusCount,
    rating4_5PlusCount,
    websitePresentCount,
    websiteAbsentCount
  };

  return {
    totalObserved: candidates.length,
    matchingCount,
    excludedCount,
    matchingCandidateIds,
    visibleCandidateIds: matchingCandidateIds,
    matchingObservations,
    visibleCandidates: matchingObservations,
    activeFilter: canonicalFilter,
    counts,
    emptyStateReason,
    evaluations
  };
}

// ============================================================================
// 6. Filter State Manager
// ============================================================================

/**
 * Manages active filter state and maintains raw candidate dataset.
 * Guarantees raw dataset immutability and instant non-destructive re-filtering.
 */
export class GoogleMapsFilterStateManager {
  private _activeFilter: GoogleMapsFilterCriteria = Object.freeze({ ...DEFAULT_GOOGLE_MAPS_FILTER });
  private readonly _rawCandidates = new Map<string, GoogleMapsCandidateObservation>();
  private _cachedView?: FilteredDatasetView;
  private _isAcquisitionRunning = false;

  constructor(
    initialCandidatesOrFilter: readonly GoogleMapsCandidateObservation[] | GoogleMapsFilterCriteria = [],
    initialFilter?: GoogleMapsFilterCriteria
  ) {
    if (
      initialCandidatesOrFilter &&
      !Array.isArray(initialCandidatesOrFilter) &&
      ('rating' in (initialCandidatesOrFilter as any) || 'website' in (initialCandidatesOrFilter as any))
    ) {
      this._activeFilter = normalizeFilterCriteria(initialCandidatesOrFilter);
    } else {
      const candidates = (initialCandidatesOrFilter as readonly GoogleMapsCandidateObservation[]) || [];
      for (const c of candidates) {
        this._rawCandidates.set(c.candidateId || c.observationId, c);
      }
      if (initialFilter) {
        this._activeFilter = normalizeFilterCriteria(initialFilter);
      }
    }
  }

  /**
   * Returns current immutable active filter criteria containing only canonical states.
   */
  public getActiveFilter(): GoogleMapsFilterCriteria {
    return { ...this._activeFilter };
  }

  /**
   * Updates rating filter and instantly re-evaluates filtered view without re-acquisition.
   * Automatically normalizes external/legacy input to canonical internal state.
   */
  public setRatingFilter(rating: RatingFilterOption | string): FilteredDatasetView {
    this._activeFilter = Object.freeze({
      ...this._activeFilter,
      rating: normalizeRatingFilter(rating)
    });
    this._cachedView = undefined;
    return this.getFilteredView();
  }

  /**
   * Updates website filter and instantly re-evaluates filtered view without re-acquisition.
   * Automatically normalizes external/legacy input to canonical internal state.
   */
  public setWebsiteFilter(website: WebsiteFilterOption | string): FilteredDatasetView {
    this._activeFilter = Object.freeze({
      ...this._activeFilter,
      website: normalizeWebsiteFilter(website)
    });
    this._cachedView = undefined;
    return this.getFilteredView();
  }

  /**
   * Sets full filter criteria and instantly re-evaluates view.
   * Guarantees internal state stores only canonical values.
   */
  public setFilter(filter: GoogleMapsFilterCriteria | { rating?: unknown; website?: unknown }): FilteredDatasetView {
    this._activeFilter = normalizeFilterCriteria(filter);
    this._cachedView = undefined;
    return this.getFilteredView();
  }

  /**
   * Resets active filters to default ANY / ANY and restores all candidates.
   * Completely local operation with zero network/DOM calls.
   */
  public resetFilters(): FilteredDatasetView {
    this._activeFilter = Object.freeze({ ...DEFAULT_GOOGLE_MAPS_FILTER });
    this._cachedView = undefined;
    return this.getFilteredView();
  }

  public resetFilter(): FilteredDatasetView {
    return this.resetFilters();
  }

  /**
   * Ingests a new candidate observation into the raw dataset and updates active view.
   * Does NOT discard candidates that do not match the active filter.
   */
  public ingestCandidate(candidate: GoogleMapsCandidateObservation): FilteredDatasetView {
    this._rawCandidates.set(candidate.candidateId || candidate.observationId, candidate);
    this._cachedView = undefined;
    return this.getFilteredView();
  }

  /**
   * Ingests multiple candidate observations into the raw dataset in a single pass.
   */
  public ingestCandidates(candidates: readonly GoogleMapsCandidateObservation[]): FilteredDatasetView {
    for (const c of candidates) {
      this._rawCandidates.set(c.candidateId || c.observationId, c);
    }
    this._cachedView = undefined;
    return this.getFilteredView();
  }

  /**
   * Informs manager of acquisition lifecycle for empty-state distinction.
   */
  public setAcquisitionRunning(isRunning: boolean): void {
    this._isAcquisitionRunning = isRunning;
    this._cachedView = undefined;
  }

  /**
   * Returns total unique raw candidate count in dataset.
   */
  public getRawCount(): number {
    return this._rawCandidates.size;
  }

  /**
   * Returns all raw candidates without mutation.
   */
  public getRawCandidates(): readonly GoogleMapsCandidateObservation[] {
    return Array.from(this._rawCandidates.values());
  }

  public getRawDataset(): readonly GoogleMapsCandidateObservation[] {
    return this.getRawCandidates();
  }

  /**
   * Retrieves or computes current filtered dataset view.
   */
  public getFilteredView(): FilteredDatasetView {
    if (!this._cachedView) {
      const candidates = Array.from(this._rawCandidates.values());
      this._cachedView = filterCandidateDataset(
        candidates,
        this._activeFilter,
        this._isAcquisitionRunning
      );
    }
    return this._cachedView;
  }

  /**
   * Retrieves current dataset counts.
   */
  public getCounts(): FilterDatasetCounts {
    return this.getFilteredView().counts;
  }
}
