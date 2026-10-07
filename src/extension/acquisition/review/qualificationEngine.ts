/**
 * LeadNoria — Google Maps Unified Candidate Review & Qualification Layer
 * Part 7: Pure Deterministic Qualification Engine
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * - Pure, deterministic, side-effect free, non-destructive.
 * - Testable independently from UI and browser runtime.
 * - Zero fake AI confidence scores; only explainable evidence readiness.
 * - UNKNOWN evidence NEVER becomes PASS merely because a field is missing.
 * - Stage 2 research decision layer independent of Part 3 acquisition filtering.
 */

import type { SessionCandidate } from '../engine/candidateIdentityTypes.ts';
import type {
  CandidateQualificationResult,
  QualificationCriteria,
  QualificationReasonCode,
  QualificationStatus,
  ReadinessScores
} from './reviewTypes.ts';
import { normalizeQualificationCriteria } from './qualificationRules.ts';
import { extractCandidateConflicts } from './conflictSummary.ts';

const TIER_ORDER: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  CONFLICT: 0
};

/**
 * Pure evaluation function that scores a candidate against deterministic qualification criteria.
 */
export function evaluateCandidateQualification(
  candidate: SessionCandidate,
  criteriaInput?: unknown
): CandidateQualificationResult {
  const criteria: QualificationCriteria = normalizeQualificationCriteria(criteriaInput);
  const reasons: QualificationReasonCode[] = [];
  const reasonDescriptions: string[] = [];
  const evidenceReferences: string[] = [];
  const passedRules: string[] = [];
  const failedRules: string[] = [];
  const blockedRules: string[] = [];

  let hardDisqualified = false;
  let evidenceBlocked = false;

  // 1. Rating Rule
  const ratingAvailability = candidate.rating?.availability;
  const ratingVal = candidate.rating?.parsedValue;

  if (criteria.minRating !== null) {
    if (ratingAvailability !== 'PRESENT' || typeof ratingVal !== 'number' || isNaN(ratingVal)) {
      reasons.push('RATING_UNKNOWN');
      reasonDescriptions.push('Rating evidence is unknown or absent while minimum rating is required');
      failedRules.push(`Rating >= ${criteria.minRating}`);
      blockedRules.push('RATING_EVIDENCE');
      evidenceBlocked = true;
    } else if (ratingVal >= criteria.minRating) {
      reasons.push('RATING_MATCH');
      reasonDescriptions.push(`Rating ${ratingVal.toFixed(1)} meets requirement (>= ${criteria.minRating.toFixed(1)})`);
      passedRules.push(`Rating >= ${criteria.minRating}`);
      evidenceReferences.push(`GoogleMaps:rating=${ratingVal}`);
    } else {
      reasons.push('RATING_BELOW_THRESHOLD');
      reasonDescriptions.push(`Rating ${ratingVal.toFixed(1)} is below required threshold of ${criteria.minRating.toFixed(1)}`);
      failedRules.push(`Rating >= ${criteria.minRating}`);
      hardDisqualified = true;
      evidenceReferences.push(`GoogleMaps:rating=${ratingVal}`);
    }
  } else {
    if (ratingAvailability === 'PRESENT' && typeof ratingVal === 'number') {
      reasons.push('RATING_MATCH');
      reasonDescriptions.push(`Rating ${ratingVal.toFixed(1)} observed (no minimum required)`);
      evidenceReferences.push(`GoogleMaps:rating=${ratingVal}`);
    }
  }

  // 2. Review Count Rule
  if (criteria.minReviewCount !== null) {
    const revCount = candidate.reviewCount?.parsedValue;
    if (typeof revCount === 'number' && revCount >= criteria.minReviewCount) {
      passedRules.push(`ReviewCount >= ${criteria.minReviewCount}`);
      evidenceReferences.push(`GoogleMaps:reviewCount=${revCount}`);
    } else {
      failedRules.push(`ReviewCount >= ${criteria.minReviewCount}`);
      if (typeof revCount === 'number') {
        hardDisqualified = true;
        reasonDescriptions.push(`Review count (${revCount}) is below required minimum (${criteria.minReviewCount})`);
      } else {
        evidenceBlocked = true;
        blockedRules.push('REVIEW_COUNT_EVIDENCE');
        reasonDescriptions.push('Review count is unknown while minimum count is required');
      }
    }
  }

  // 3. Website Presence Rule
  const websiteAvailability = candidate.websiteUrl?.availability;
  const websiteVal = candidate.websiteUrl?.parsedValue || candidate.websiteUrl?.rawValue;

  if (criteria.requireWebsite) {
    if (websiteAvailability === 'PRESENT' && websiteVal) {
      reasons.push('WEBSITE_PRESENT');
      reasonDescriptions.push(`Valid website domain observed: ${websiteVal}`);
      passedRules.push('Website required');
      evidenceReferences.push(`Website:${websiteVal}`);
    } else if (websiteAvailability === 'ABSENT') {
      reasons.push('WEBSITE_ABSENT');
      reasonDescriptions.push('Listing explicitly lacks website');
      failedRules.push('Website required');
      hardDisqualified = true;
    } else {
      reasons.push('WEBSITE_UNKNOWN');
      reasonDescriptions.push('Website presence is unknown or unsupported');
      failedRules.push('Website required');
      blockedRules.push('WEBSITE_EVIDENCE');
      evidenceBlocked = true;
    }
  } else {
    if (websiteAvailability === 'PRESENT' && websiteVal) {
      reasons.push('WEBSITE_PRESENT');
      evidenceReferences.push(`Website:${websiteVal}`);
    } else if (websiteAvailability === 'ABSENT') {
      reasons.push('WEBSITE_ABSENT');
    }
  }

  // 4. Contact Intelligence Availability (Phone / Email / General Contact)
  const mapsPhone = candidate.phone?.parsedValue || candidate.phone?.rawValue;
  const enrichPhones = candidate.enrichmentResult?.contactEvidence?.phones || [];
  const enrichEmails = candidate.enrichmentResult?.contactEvidence?.emails || [];
  const hasPhone = Boolean(mapsPhone || enrichPhones.length > 0);
  const hasEmail = enrichEmails.length > 0;

  if (hasPhone) {
    reasons.push('PHONE_AVAILABLE');
    if (mapsPhone) evidenceReferences.push(`Phone(Maps):${mapsPhone}`);
    if (enrichPhones[0]) evidenceReferences.push(`Phone(Web):${enrichPhones[0].phone}`);
  } else {
    reasons.push('PHONE_ABSENT');
  }

  if (hasEmail) {
    reasons.push('EMAIL_AVAILABLE');
    evidenceReferences.push(`Email(Web):${enrichEmails[0].email}`);
  } else {
    reasons.push('EMAIL_ABSENT');
  }

  if (hasPhone || hasEmail) {
    reasons.push('CONTACT_AVAILABLE');
  }

  // Evaluate Phone requirement
  if (criteria.requirePhone) {
    if (hasPhone) {
      passedRules.push('Phone required');
    } else {
      failedRules.push('Phone required');
      if (candidate.enrichmentStatus === 'COMPLETED' || candidate.websiteUrl?.availability === 'ABSENT') {
        hardDisqualified = true;
        reasonDescriptions.push('No telephone available across Maps or crawled website');
      } else {
        evidenceBlocked = true;
        blockedRules.push('PHONE_EVIDENCE');
      }
    }
  }

  // Evaluate Email requirement
  if (criteria.requireEmail) {
    if (hasEmail) {
      passedRules.push('Email required');
    } else {
      failedRules.push('Email required');
      if (candidate.enrichmentStatus === 'COMPLETED' || candidate.websiteUrl?.availability === 'ABSENT') {
        hardDisqualified = true;
        reasonDescriptions.push('No public email found across website enrichment');
      } else {
        evidenceBlocked = true;
        blockedRules.push('EMAIL_EVIDENCE');
      }
    }
  }

  // Evaluate General Contact requirement (Phone OR Email)
  if (criteria.requireContact) {
    if (hasPhone || hasEmail) {
      passedRules.push('Contact channel required');
    } else {
      failedRules.push('Contact channel required');
      reasons.push('MISSING_REQUIRED_EVIDENCE');
      if (candidate.enrichmentStatus === 'COMPLETED' || candidate.websiteUrl?.availability === 'ABSENT') {
        hardDisqualified = true;
      } else {
        evidenceBlocked = true;
        blockedRules.push('CONTACT_CHANNEL_EVIDENCE');
      }
    }
  }

  // 5. Person Intelligence Availability
  const enrichPeople = candidate.enrichmentResult?.personEvidence?.people || [];
  const hasPerson = enrichPeople.length > 0;

  if (hasPerson) {
    reasons.push('PERSON_AVAILABLE');
    evidenceReferences.push(`Person:${enrichPeople[0].fullName}`);
  } else {
    reasons.push('PERSON_ABSENT');
  }

  if (criteria.requirePerson) {
    if (hasPerson) {
      passedRules.push('Leadership person required');
    } else {
      failedRules.push('Leadership person required');
      if (candidate.enrichmentStatus === 'COMPLETED' || candidate.websiteUrl?.availability === 'ABSENT') {
        hardDisqualified = true;
        reasonDescriptions.push('No leadership or key person identified on website');
      } else {
        evidenceBlocked = true;
        blockedRules.push('PERSON_EVIDENCE');
      }
    }
  }

  // 6. Identity Confidence Tier Rule
  const identityTier = candidate.qualityMetrics?.identityConfidence ?? 'LOW';
  const minTierVal = TIER_ORDER[criteria.minimumIdentityConfidenceTier] ?? 1;
  const candTierVal = TIER_ORDER[identityTier] ?? 1;

  if (candTierVal >= minTierVal && identityTier !== 'CONFLICT') {
    reasons.push('BUSINESS_IDENTITY_CONFIRMED');
    passedRules.push(`Identity confidence >= ${criteria.minimumIdentityConfidenceTier}`);
    evidenceReferences.push(`Identity:${candidate.identityMethod}(${identityTier})`);
  } else {
    reasons.push('BUSINESS_IDENTITY_WEAK');
    failedRules.push(`Identity confidence >= ${criteria.minimumIdentityConfidenceTier}`);
    reasonDescriptions.push(`Identity confidence (${identityTier}) is below required minimum (${criteria.minimumIdentityConfidenceTier})`);
    if (identityTier === 'CONFLICT') {
      hardDisqualified = true;
    } else {
      evidenceBlocked = true;
      blockedRules.push('IDENTITY_CONFIDENCE');
    }
  }

  // 7. Conflict & Divergence Check
  const conflicts = extractCandidateConflicts(candidate, criteria);
  let nonToleratedConflictCount = 0;

  for (const c of conflicts) {
    if (!c.tolerated) {
      nonToleratedConflictCount++;
      if (c.conflictType === 'PHONE_DIVERGENCE') reasons.push('PHONE_DIVERGENCE');
      else if (c.conflictType === 'ADDRESS_DIVERGENCE') reasons.push('ADDRESS_DIVERGENCE');
      else if (c.conflictType === 'WEBSITE_TARGET_CONFLICT') reasons.push('WEBSITE_TARGET_CONFLICT');
      else if (c.conflictType === 'IDENTITY_CONFLICT') reasons.push('IDENTITY_CONFLICT');
      else if (c.conflictType === 'PLACE_ID_CONFLICT') reasons.push('PLACE_ID_CONFLICT');
      else reasons.push('OTHER_SOURCE_CONFLICT');
    }
  }

  let conflictState: 'NONE' | 'TOLERATED' | 'BLOCKING' = 'NONE';
  if (conflicts.length > 0) {
    if (nonToleratedConflictCount > 0 || conflicts.length > criteria.maxAllowedConflicts) {
      conflictState = 'BLOCKING';
      reasons.push('CONFLICT_DETECTED');
      failedRules.push('Conflict tolerance check');
      reasonDescriptions.push(`Unresolved non-tolerated conflicts detected (${nonToleratedConflictCount} blocking)`);
      hardDisqualified = true;
    } else {
      conflictState = 'TOLERATED';
      passedRules.push('Conflict tolerance check');
    }
  } else {
    passedRules.push('Conflict tolerance check');
  }

  // 8. Deterministic Readiness Dimensions (0.0 to 1.0)
  // Dimension 1: Identity Readiness
  let identityReadiness = 0.5;
  if (identityTier === 'HIGH') identityReadiness = 1.0;
  else if (identityTier === 'MEDIUM') identityReadiness = 0.75;
  else if (identityTier === 'CONFLICT') identityReadiness = 0.25;

  // Dimension 2: Website Readiness
  let websiteReadiness = 0.0;
  if (websiteAvailability === 'PRESENT') {
    if (candidate.enrichmentStatus === 'COMPLETED') websiteReadiness = 1.0;
    else if (candidate.enrichmentStatus === 'PARTIAL') websiteReadiness = 0.8;
    else websiteReadiness = 0.6;
  } else if (websiteAvailability === 'UNKNOWN') {
    websiteReadiness = 0.3;
  }

  // Dimension 3: Contact Readiness
  let contactScore = 0.0;
  if (hasPhone) contactScore += 0.45;
  if (hasEmail) contactScore += 0.45;
  if (candidate.enrichmentResult?.contactEvidence?.socialProfiles?.length) contactScore += 0.10;
  const contactReadiness = Math.min(1.0, contactScore);

  // Dimension 4: Person Readiness
  let personReadiness = 0.0;
  if (hasPerson) {
    personReadiness = 1.0;
  } else if (candidate.enrichmentStatus === 'COMPLETED') {
    personReadiness = 0.0;
  } else {
    personReadiness = 0.2; // un-crawled/pending
  }

  // Dimension 5: Overall Qualification Readiness
  const conflictModifier = conflictState === 'NONE' ? 0.10 : (conflictState === 'TOLERATED' ? 0.05 : 0.0);
  const rawOverall = (identityReadiness * 0.25) +
                     (websiteReadiness * 0.25) +
                     (contactReadiness * 0.25) +
                     (personReadiness * 0.15) +
                     conflictModifier;
  const overallQualificationReadiness = Math.round(Math.min(1.0, Math.max(0.0, rawOverall)) * 100) / 100;

  const readiness: ReadinessScores = Object.freeze({
    identityReadiness,
    contactReadiness,
    websiteReadiness,
    personReadiness,
    conflictState,
    overallQualificationReadiness
  });

  // 9. Status Determination
  let status: QualificationStatus;
  if (hardDisqualified) {
    status = 'DISQUALIFIED';
  } else if (evidenceBlocked) {
    status = blockedRules.length > 1 ? 'INSUFFICIENT_EVIDENCE' : 'NEEDS_REVIEW';
    if (!reasons.includes('INSUFFICIENT_EVIDENCE')) {
      reasons.push('INSUFFICIENT_EVIDENCE');
    }
  } else if (failedRules.length === 0 && conflictState !== 'BLOCKING') {
    status = 'QUALIFIED';
  } else {
    status = 'NEEDS_REVIEW';
  }

  return Object.freeze({
    candidateId: candidate.candidateId,
    status,
    reasons: Object.freeze(Array.from(new Set(reasons))),
    reasonDescriptions: Object.freeze(reasonDescriptions),
    evidenceReferences: Object.freeze(Array.from(new Set(evidenceReferences))),
    readiness,
    passedRules: Object.freeze(passedRules),
    failedRules: Object.freeze(failedRules),
    blockedRules: Object.freeze(blockedRules),
    evaluatedAt: new Date().toISOString()
  });
}
