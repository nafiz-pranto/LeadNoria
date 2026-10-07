/**
 * LeadNoria — Google Maps Unified Candidate Review & Qualification Layer
 * Part 7: Deterministic Qualification Rules & Criteria
 *
 * PURE & DETERMINISTIC:
 * - Sane default criteria for commercial qualification.
 * - Validation & normalization ensures criteria is always immutable and well-typed.
 * - Decoupled from Part 3 acquisition filters.
 */

import type { QualificationCriteria } from './reviewTypes.ts';

export const DEFAULT_QUALIFICATION_CRITERIA: QualificationCriteria = Object.freeze({
  minRating: 4.0,
  minReviewCount: null,
  requireWebsite: true,
  requirePhone: false,
  requireEmail: false,
  requirePerson: false,
  requireContact: false,
  allowPhoneDivergence: true,
  allowAddressDivergence: true,
  allowWebsiteConflict: false,
  maxAllowedConflicts: 2,
  minimumIdentityConfidenceTier: 'LOW'
});

/**
 * Normalizes input criteria into an immutable QualificationCriteria object.
 * Applies defaults where fields are missing or invalid.
 */
export function normalizeQualificationCriteria(input?: unknown): QualificationCriteria {
  if (!input || typeof input !== 'object') {
    return DEFAULT_QUALIFICATION_CRITERIA;
  }

  const raw = input as Record<string, unknown>;

  let minRating: number | null = null;
  if (typeof raw.minRating === 'number' && !isNaN(raw.minRating)) {
    minRating = Math.max(0, Math.min(5, raw.minRating));
  } else if (raw.minRating === null) {
    minRating = null;
  } else if (raw.minRating === undefined) {
    minRating = DEFAULT_QUALIFICATION_CRITERIA.minRating;
  }

  let minReviewCount: number | null = null;
  if (typeof raw.minReviewCount === 'number' && !isNaN(raw.minReviewCount)) {
    minReviewCount = Math.max(0, Math.floor(raw.minReviewCount));
  } else if (raw.minReviewCount === null) {
    minReviewCount = null;
  } else if (raw.minReviewCount === undefined) {
    minReviewCount = DEFAULT_QUALIFICATION_CRITERIA.minReviewCount;
  }

  let minimumIdentityConfidenceTier: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (raw.minimumIdentityConfidenceTier === 'HIGH' || raw.minimumIdentityConfidenceTier === 'MEDIUM' || raw.minimumIdentityConfidenceTier === 'LOW') {
    minimumIdentityConfidenceTier = raw.minimumIdentityConfidenceTier;
  }

  const maxAllowedConflicts = typeof raw.maxAllowedConflicts === 'number' && !isNaN(raw.maxAllowedConflicts)
    ? Math.max(0, Math.floor(raw.maxAllowedConflicts))
    : DEFAULT_QUALIFICATION_CRITERIA.maxAllowedConflicts;

  return Object.freeze({
    minRating,
    minReviewCount,
    requireWebsite: raw.requireWebsite !== undefined ? Boolean(raw.requireWebsite) : DEFAULT_QUALIFICATION_CRITERIA.requireWebsite,
    requirePhone: raw.requirePhone !== undefined ? Boolean(raw.requirePhone) : DEFAULT_QUALIFICATION_CRITERIA.requirePhone,
    requireEmail: raw.requireEmail !== undefined ? Boolean(raw.requireEmail) : DEFAULT_QUALIFICATION_CRITERIA.requireEmail,
    requirePerson: raw.requirePerson !== undefined ? Boolean(raw.requirePerson) : DEFAULT_QUALIFICATION_CRITERIA.requirePerson,
    requireContact: raw.requireContact !== undefined ? Boolean(raw.requireContact) : DEFAULT_QUALIFICATION_CRITERIA.requireContact,
    allowPhoneDivergence: raw.allowPhoneDivergence !== undefined ? Boolean(raw.allowPhoneDivergence) : DEFAULT_QUALIFICATION_CRITERIA.allowPhoneDivergence,
    allowAddressDivergence: raw.allowAddressDivergence !== undefined ? Boolean(raw.allowAddressDivergence) : DEFAULT_QUALIFICATION_CRITERIA.allowAddressDivergence,
    allowWebsiteConflict: raw.allowWebsiteConflict !== undefined ? Boolean(raw.allowWebsiteConflict) : DEFAULT_QUALIFICATION_CRITERIA.allowWebsiteConflict,
    maxAllowedConflicts,
    minimumIdentityConfidenceTier
  });
}
