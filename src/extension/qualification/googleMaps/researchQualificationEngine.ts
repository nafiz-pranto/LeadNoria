/**
 * LeadNoria — Google Maps Advanced Research & Qualification Engine
 * Canonical Qualification Domain & Multi-Query Orchestration
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Layered Pipeline Architecture:
 *    Google Research Candidate -> Qualified Candidate -> Export-Safe Projection -> Export-Safe Lead
 * 2. Pure, deterministic, local qualification over candidate signals.
 * 3. Rating filter semantics:
 *    - ANY: Accept regardless of rating (5.0, 4.2, 3.1, null all PASS).
 *    - FOUR_PLUS: rating >= 4.0 (null/missing/unknown REJECT as RATING_UNKNOWN; <4.0 REJECT as RATING_BELOW_THRESHOLD).
 *    - FOUR_POINT_FIVE_PLUS: rating >= 4.5 (null/missing/unknown REJECT as RATING_UNKNOWN; <4.5 REJECT as RATING_BELOW_THRESHOLD).
 *    - Never convert missing or null rating into 0.
 * 4. Website filter semantics:
 *    - Distinct states: YES, NO, UNKNOWN.
 *    - Extraction failure / unavailable is UNKNOWN, never silently classified as NO.
 *    - ANY: Accepts YES, NO, UNKNOWN.
 *    - WITH_WEBSITE: Accepts only YES. Rejects NO (WEBSITE_MISSING) and UNKNOWN (WEBSITE_UNKNOWN).
 *    - WITHOUT_WEBSITE: Accepts only NO. Rejects YES (WEBSITE_MISSING) and UNKNOWN (WEBSITE_UNKNOWN).
 * 5. Strict 3 x 3 Matrix Support (all 9 combinations deterministic).
 * 6. Multi-query deduplication across keywords using existing deterministic identity.
 * 7. Failure isolation: individual query or candidate failures do not discard the run.
 * 8. Cancellation safety: cancels cleanly and preserves processed valid leads.
 * 9. Google Data Firewall: zero restricted Google Maps fields cross into exportable leads or telemetry.
 */

import type {
  GoogleMapsCandidateObservation,
  ObservedField,
  FieldAvailability
} from '../../acquisition/engine/types.ts';
import type { SessionCandidate } from '../../acquisition/engine/candidateIdentityTypes.ts';
import { SessionCandidateDeduplicator } from '../../acquisition/engine/candidateIdentity.ts';
import { normalizeWebsiteUrl } from '../../websiteUrlNormalizer.ts';

// ============================================================================
// 1. Canonical Domain Types (Master Prompt Section 5, 6, 8, 9)
// ============================================================================

export type RatingFilter =
  | 'ANY'
  | 'FOUR_PLUS'
  | 'FOUR_POINT_FIVE_PLUS';

export type WebsiteFilter =
  | 'ANY'
  | 'WITH_WEBSITE'
  | 'WITHOUT_WEBSITE';

export interface ResearchFilters {
  readonly rating: RatingFilter;
  readonly website: WebsiteFilter;
  readonly maxResults?: number;
}

export type QualificationRejectionReason =
  | 'RATING_BELOW_THRESHOLD'
  | 'RATING_UNKNOWN'
  | 'WEBSITE_MISSING'
  | 'WEBSITE_UNKNOWN';

export interface QualificationResult {
  readonly qualified: boolean;
  readonly ratingQualified: boolean;
  readonly websiteQualified: boolean;
  readonly rejectionReason?: QualificationRejectionReason;
}

export type WebsiteEvidenceState = 'YES' | 'NO' | 'UNKNOWN';

export interface ResearchCandidateInput {
  readonly businessName?: string | ObservedField<string>;
  readonly rating?: ObservedField<number> | { availability?: string; parsedValue?: number | null; rawValue?: string } | number | null;
  readonly websiteUrl?: ObservedField<string> | { availability?: string; parsedValue?: string | null; rawValue?: string } | string | null;
  readonly websiteState?: WebsiteEvidenceState;
  readonly address?: string | ObservedField<string>;
  readonly phone?: string | ObservedField<string>;
  readonly candidateId?: string;
  readonly observationId?: string;
  readonly placeId?: string | ObservedField<string>;
  readonly mapsUrl?: string | ObservedField<string>;
  readonly [key: string]: unknown;
}

export type ResearchCandidate =
  | GoogleMapsCandidateObservation
  | SessionCandidate
  | ResearchCandidateInput;

// Default canonical research filter configuration
export const DEFAULT_RESEARCH_FILTERS: ResearchFilters = Object.freeze({
  rating: 'ANY',
  website: 'ANY'
});

// ============================================================================
// 2. Normalization Functions
// ============================================================================

export function normalizeRatingFilter(input: unknown): RatingFilter {
  if (typeof input !== 'string') return 'ANY';
  const trimmed = input.trim();
  if (
    trimmed === 'FOUR_POINT_FIVE_PLUS' ||
    trimmed === 'MIN_4_5' ||
    trimmed === '4.5+' ||
    trimmed === '4.5'
  ) {
    return 'FOUR_POINT_FIVE_PLUS';
  }
  if (
    trimmed === 'FOUR_PLUS' ||
    trimmed === 'MIN_4_0' ||
    trimmed === '4.0+' ||
    trimmed === '4.0'
  ) {
    return 'FOUR_PLUS';
  }
  return 'ANY';
}

export function normalizeWebsiteFilter(input: unknown): WebsiteFilter {
  if (typeof input !== 'string') return 'ANY';
  const trimmed = input.trim();
  if (
    trimmed === 'WITH_WEBSITE' ||
    trimmed === 'WITH' ||
    trimmed === 'YES' ||
    trimmed === 'PRESENT'
  ) {
    return 'WITH_WEBSITE';
  }
  if (
    trimmed === 'WITHOUT_WEBSITE' ||
    trimmed === 'WITHOUT' ||
    trimmed === 'NO' ||
    trimmed === 'ABSENT'
  ) {
    return 'WITHOUT_WEBSITE';
  }
  return 'ANY';
}

export function normalizeResearchFilters(input: unknown): ResearchFilters {
  if (!input || typeof input !== 'object') {
    return DEFAULT_RESEARCH_FILTERS;
  }
  const obj = input as Record<string, unknown>;
  const rating = normalizeRatingFilter(obj.rating);
  const website = normalizeWebsiteFilter(obj.website);
  const maxResults = typeof obj.maxResults === 'number' && obj.maxResults > 0
    ? Math.floor(obj.maxResults)
    : undefined;

  return Object.freeze({
    rating,
    website,
    ...(maxResults !== undefined ? { maxResults } : {})
  });
}

// ============================================================================
// 3. Signal Extraction (Rating & Website Evidence State)
// ============================================================================

export interface ExtractedRatingSignal {
  readonly availability: FieldAvailability;
  readonly value?: number;
}

export function extractRatingSignal(candidate: ResearchCandidate): ExtractedRatingSignal {
  if (!candidate || typeof candidate !== 'object') {
    return { availability: 'UNKNOWN' };
  }

  const rawRating = (candidate as Record<string, unknown>).rating;

  // 1. Direct number
  if (typeof rawRating === 'number') {
    if (Number.isFinite(rawRating)) {
      return { availability: 'PRESENT', value: rawRating };
    }
    return { availability: 'UNKNOWN' };
  }

  // 2. null or undefined -> UNKNOWN (never 0)
  if (rawRating === null || rawRating === undefined) {
    return { availability: 'UNKNOWN' };
  }

  // 3. ObservedField-like object
  if (typeof rawRating === 'object') {
    const field = rawRating as { availability?: string; parsedValue?: unknown; rawValue?: unknown };
    const avail = (field.availability as FieldAvailability) || 'UNKNOWN';
    if (avail === 'PRESENT') {
      if (typeof field.parsedValue === 'number' && Number.isFinite(field.parsedValue)) {
        return { availability: 'PRESENT', value: field.parsedValue };
      }
      if (typeof field.rawValue === 'string') {
        const parsed = parseFloat(field.rawValue);
        if (Number.isFinite(parsed)) {
          return { availability: 'PRESENT', value: parsed };
        }
      }
      return { availability: 'AMBIGUOUS' };
    }
    return { availability: avail };
  }

  return { availability: 'UNKNOWN' };
}

export function determineWebsiteState(candidate: ResearchCandidate): WebsiteEvidenceState {
  if (!candidate || typeof candidate !== 'object') {
    return 'UNKNOWN';
  }

  // 1. Explicit websiteState if provided
  const explicitState = (candidate as Record<string, unknown>).websiteState;
  if (explicitState === 'YES' || explicitState === 'NO' || explicitState === 'UNKNOWN') {
    return explicitState;
  }

  const webField = (candidate as Record<string, unknown>).websiteUrl ||
    (candidate as Record<string, unknown>).website;

  if (!webField) {
    return 'UNKNOWN';
  }

  // 2. Direct string URL
  if (typeof webField === 'string') {
    const trimmed = webField.trim();
    if (trimmed.length === 0) return 'UNKNOWN';
    const norm = normalizeWebsiteUrl(trimmed);
    if (norm.isValid && !norm.normalizedUrl.includes('google.com/maps')) {
      return 'YES';
    }
    return 'UNKNOWN';
  }

  // 3. ObservedField object
  if (typeof webField === 'object') {
    const field = webField as {
      availability?: string;
      parsedValue?: unknown;
      rawValue?: unknown;
    };
    const avail = field.availability || 'UNKNOWN';

    if (avail === 'PRESENT') {
      const target = (typeof field.parsedValue === 'string' && field.parsedValue) ||
        (typeof field.rawValue === 'string' && field.rawValue);
      if (target) {
        const norm = normalizeWebsiteUrl(target);
        if (norm.isValid && !norm.normalizedUrl.includes('google.com/maps')) {
          return 'YES';
        }
      }
      // Malformed or internal url is extraction failure / unknown
      return 'UNKNOWN';
    }

    if (avail === 'ABSENT') {
      return 'NO';
    }

    // UNKNOWN, AMBIGUOUS, UNSUPPORTED
    return 'UNKNOWN';
  }

  return 'UNKNOWN';
}

// ============================================================================
// 4. Canonical Qualification Engine (Master Prompt Section 8)
// ============================================================================

/**
 * Pure, deterministic qualification evaluation.
 * Evaluates candidate against rating and website filters independently and in combination.
 * Enforces:
 *   - Rating ANY: PASS
 *   - Rating FOUR_PLUS: rating >= 4.0 (UNKNOWN -> RATING_UNKNOWN, <4.0 -> RATING_BELOW_THRESHOLD)
 *   - Rating FOUR_POINT_FIVE_PLUS: rating >= 4.5 (UNKNOWN -> RATING_UNKNOWN, <4.5 -> RATING_BELOW_THRESHOLD)
 *   - Website ANY: PASS (YES, NO, UNKNOWN all pass)
 *   - Website WITH_WEBSITE: YES -> PASS, NO -> WEBSITE_MISSING, UNKNOWN -> WEBSITE_UNKNOWN
 *   - Website WITHOUT_WEBSITE: NO -> PASS, YES -> WEBSITE_MISSING, UNKNOWN -> WEBSITE_UNKNOWN
 */
export function qualifiesCandidate(
  candidate: ResearchCandidate,
  filtersInput: ResearchFilters
): QualificationResult {
  const filters = normalizeResearchFilters(filtersInput);

  // ── Rating Evaluation ───────────────────────────────────────────────────
  let ratingQualified = false;
  let ratingRejectionReason: QualificationRejectionReason | undefined;

  const ratingSignal = extractRatingSignal(candidate);

  if (filters.rating === 'ANY') {
    ratingQualified = true;
  } else {
    const threshold = filters.rating === 'FOUR_POINT_FIVE_PLUS' ? 4.5 : 4.0;
    if (ratingSignal.availability === 'PRESENT' && ratingSignal.value !== undefined) {
      if (ratingSignal.value >= threshold) {
        ratingQualified = true;
      } else {
        ratingQualified = false;
        ratingRejectionReason = 'RATING_BELOW_THRESHOLD';
      }
    } else {
      // Missing, null, undefined, UNKNOWN, ABSENT, AMBIGUOUS -> RATING_UNKNOWN
      ratingQualified = false;
      ratingRejectionReason = 'RATING_UNKNOWN';
    }
  }

  // ── Website Evaluation ──────────────────────────────────────────────────
  let websiteQualified = false;
  let websiteRejectionReason: QualificationRejectionReason | undefined;

  const webState = determineWebsiteState(candidate);

  if (filters.website === 'ANY') {
    websiteQualified = true;
  } else if (filters.website === 'WITH_WEBSITE') {
    if (webState === 'YES') {
      websiteQualified = true;
    } else if (webState === 'NO') {
      websiteQualified = false;
      websiteRejectionReason = 'WEBSITE_MISSING';
    } else {
      // UNKNOWN
      websiteQualified = false;
      websiteRejectionReason = 'WEBSITE_UNKNOWN';
    }
  } else if (filters.website === 'WITHOUT_WEBSITE') {
    if (webState === 'NO') {
      websiteQualified = true;
    } else if (webState === 'YES') {
      websiteQualified = false;
      websiteRejectionReason = 'WEBSITE_MISSING';
    } else {
      // UNKNOWN cannot be accepted as WITHOUT_WEBSITE
      websiteQualified = false;
      websiteRejectionReason = 'WEBSITE_UNKNOWN';
    }
  }

  // ── Combined Evaluation & Priority Rejection Reason ─────────────────────
  const qualified = ratingQualified && websiteQualified;

  let rejectionReason: QualificationRejectionReason | undefined;
  if (!ratingQualified) {
    rejectionReason = ratingRejectionReason;
  } else if (!websiteQualified) {
    rejectionReason = websiteRejectionReason;
  }

  return {
    qualified,
    ratingQualified,
    websiteQualified,
    ...(rejectionReason ? { rejectionReason } : {})
  };
}

// ============================================================================
// 5. Research Telemetry & Counters (Master Prompt Section 16)
// ============================================================================

export interface ResearchCounters {
  queries: number;
  candidatesDiscovered: number;
  duplicatesSuppressed: number;
  ratingQualified: number;
  websiteQualified: number;
  finalQualified: number;
  failedQueries: number;
}

export function createInitialCounters(): ResearchCounters {
  return {
    queries: 0,
    candidatesDiscovered: 0,
    duplicatesSuppressed: 0,
    ratingQualified: 0,
    websiteQualified: 0,
    finalQualified: 0,
    failedQueries: 0
  };
}

// ============================================================================
// 6. Multi-Query Search Orchestrator (Master Prompt Section 4, 15, 21, 23)
// ============================================================================

export interface MultiQueryResearchOptions {
  readonly keywords: readonly string[];
  readonly filters: ResearchFilters;
  readonly maxResults?: number;
  readonly onProgress?: (counters: Readonly<ResearchCounters>) => void;
  readonly onCandidateQualified?: (candidate: GoogleMapsCandidateObservation | SessionCandidate, result: QualificationResult) => void;
  readonly shouldStop?: () => boolean;
}

export interface MultiQueryResearchResult {
  readonly status: 'COMPLETED' | 'CANCELLED' | 'LIMIT_REACHED' | 'PARTIALLY_COMPLETED';
  readonly counters: ResearchCounters;
  readonly rawCandidates: readonly GoogleMapsCandidateObservation[];
  readonly deduplicatedCandidates: readonly (GoogleMapsCandidateObservation | SessionCandidate)[];
  readonly qualifiedCandidates: readonly (GoogleMapsCandidateObservation | SessionCandidate)[];
  readonly qualificationResults: ReadonlyMap<string, QualificationResult>;
}

export type QueryExecutionFn = (
  keyword: string,
  queryIndex: number
) => Promise<readonly GoogleMapsCandidateObservation[]>;

/**
 * Orchestrates multi-keyword research with:
 * - Sequential execution across queries
 * - Cross-query deduplication via SessionCandidateDeduplicator
 * - Deterministic qualification against canonical ResearchFilters
 * - Failure isolation: failed queries increment counter without discarding completed work
 * - Cancellation responsiveness
 * - Configurable max results cap
 */
export async function executeMultiQueryResearch(
  options: MultiQueryResearchOptions,
  executeQuery: QueryExecutionFn
): Promise<MultiQueryResearchResult> {
  const filters = normalizeResearchFilters(options.filters);
  const maxResults = options.maxResults ?? filters.maxResults;
  const deduplicator = new SessionCandidateDeduplicator();

  const counters = createInitialCounters();
  const allRawObservations: GoogleMapsCandidateObservation[] = [];
  const qualificationMap = new Map<string, QualificationResult>();
  const qualifiedCandidateList: (GoogleMapsCandidateObservation | SessionCandidate)[] = [];

  let isCancelled = false;
  let isLimitReached = false;

  for (let i = 0; i < options.keywords.length; i++) {
    if (options.shouldStop && options.shouldStop()) {
      isCancelled = true;
      break;
    }

    if (maxResults !== undefined && counters.finalQualified >= maxResults) {
      isLimitReached = true;
      break;
    }

    const keyword = options.keywords[i];
    counters.queries++;

    let queryObservations: readonly GoogleMapsCandidateObservation[] = [];
    try {
      queryObservations = await executeQuery(keyword, i);
    } catch {
      // Failure isolation: individual query error does not terminate the run
      counters.failedQueries++;
      if (options.onProgress) {
        options.onProgress({ ...counters });
      }
      continue;
    }

    for (const rawObs of queryObservations) {
      counters.candidatesDiscovered++;
      allRawObservations.push(rawObs);

      // Cross-query deduplication
      const dedupeResult = deduplicator.register(rawObs);
      const sessionCand = dedupeResult.candidate;

      if (!dedupeResult.isNew) {
        counters.duplicatesSuppressed++;
      } else {
        // Evaluate qualification on new unique candidate
        const qual = qualifiesCandidate(sessionCand, filters);
        qualificationMap.set(sessionCand.candidateId, qual);

        if (qual.ratingQualified) {
          counters.ratingQualified++;
        }
        if (qual.websiteQualified) {
          counters.websiteQualified++;
        }
        if (qual.qualified) {
          counters.finalQualified++;
          qualifiedCandidateList.push(sessionCand);
          if (options.onCandidateQualified) {
            options.onCandidateQualified(sessionCand, qual);
          }
        }
      }

      if (options.shouldStop && options.shouldStop()) {
        isCancelled = true;
        break;
      }

      if (maxResults !== undefined && counters.finalQualified >= maxResults) {
        isLimitReached = true;
        break;
      }
    }

    if (options.onProgress) {
      options.onProgress({ ...counters });
    }

    if (isCancelled || isLimitReached) {
      break;
    }
  }

  const status = isCancelled
    ? 'CANCELLED'
    : isLimitReached
    ? 'LIMIT_REACHED'
    : counters.failedQueries > 0
    ? 'PARTIALLY_COMPLETED'
    : 'COMPLETED';

  return {
    status,
    counters: Object.freeze({ ...counters }),
    rawCandidates: Object.freeze([...allRawObservations]),
    deduplicatedCandidates: Object.freeze(deduplicator.getAll()),
    qualifiedCandidates: Object.freeze([...qualifiedCandidateList]),
    qualificationResults: qualificationMap
  };
}
