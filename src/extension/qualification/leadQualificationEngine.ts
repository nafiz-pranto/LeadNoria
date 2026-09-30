/**
 * LeadNoria Lead Qualification Engine (Phase 6)
 *
 * Implements deterministic lead qualification consuming Phase 5 normalized candidates,
 * evaluating relevance, geography, website requirements, identity contradictions,
 * and data firewall / export eligibility gates.
 *
 * INVARIANTS:
 * 1. Deterministic and pure: same inputs produce byte-identical outputs.
 * 2. QUALIFIED does NOT automatically grant EXPORTABLE or PERSISTABLE.
 * 3. All restricted Google lineage blocks persistence and export.
 * 4. Inconclusive, ambiguous, or absence-unproven leads route to UNCERTAIN.
 * 5. Full dependency lineage is preserved without laundering.
 */

import type {
  NormalizedCandidate,
  SourceContribution,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus,
  FieldPolicyEnvelope
} from '../extraction/types.ts';
import type {
  QualificationEvaluationInput,
  QualificationResultEnvelope,
  QualificationState,
  QualificationReasonCode,
  TargetLocationCriteria,
  WebsiteEvidence
} from './types.ts';
import {
  determineWebsiteState,
  evaluateWebsiteRequirement
} from './websiteRequirementEngine.ts';
import {
  formatWhyThisLead
} from './qualificationReasons.ts';

/**
 * Normalizes string for case- and diacritic-insensitive comparison.
 */
function normalizeForMatch(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Checks if candidate matches target keywords or categories.
 */
function evaluateRelevance(
  candidate: NormalizedCandidate,
  targetKeywords?: string[],
  targetCategory?: string,
  evidence?: WebsiteEvidence
): { isRelevant: boolean; isUncertain: boolean; reasonCode?: QualificationReasonCode } {
  if (!targetKeywords || targetKeywords.length === 0) {
    return { isRelevant: true, isUncertain: false };
  }

  const normKeywords = targetKeywords.map(normalizeForMatch).filter(Boolean);
  if (normKeywords.length === 0) {
    return { isRelevant: true, isUncertain: false };
  }

  // Build candidate text pool
  const candidateTexts: string[] = [
    candidate.businessName?.value?.displayName || '',
    candidate.businessName?.value?.comparisonName || '',
    ...(candidate.categories || []).map(c => c.value?.normalizedCategory || ''),
    ...(evidence?.serviceEvidence?.keywords || []),
    evidence?.aboutEvidence?.text || ''
  ].map(normalizeForMatch);

  const fullText = candidateTexts.join(' ');

  // Check direct keyword match
  const hasKeywordMatch = normKeywords.some(kw => fullText.includes(kw));

  // Check category match
  let hasCategoryMatch = false;
  if (targetCategory) {
    const normTargetCat = normalizeForMatch(targetCategory);
    hasCategoryMatch = (candidate.categories || []).some(c =>
      normalizeForMatch(c.value?.normalizedCategory || '').includes(normTargetCat)
    );
  }

  if (hasKeywordMatch || hasCategoryMatch) {
    return { isRelevant: true, isUncertain: false };
  }

  // If candidate has categories but none match keywords/target category, check for conflict
  if (candidate.categories && candidate.categories.length > 0) {
    return {
      isRelevant: false,
      isUncertain: false,
      reasonCode: 'DISQUALIFIED_IRRELEVANT'
    };
  }

  // If no categories and no keywords matched, but name exists without contradiction
  return {
    isRelevant: false,
    isUncertain: true,
    reasonCode: 'UNCERTAIN_RELEVANCE_WEAK'
  };
}

/**
 * Evaluates geographic alignment between candidate and target criteria.
 */
function evaluateGeography(
  candidate: NormalizedCandidate,
  targetLocation?: TargetLocationCriteria
): { isGeoMatch: boolean; isGeoUncertain: boolean; reasonCode?: QualificationReasonCode } {
  if (!targetLocation) {
    return { isGeoMatch: true, isGeoUncertain: false };
  }

  const candCountryCode = normalizeForMatch(
    candidate.address?.value?.countryCode ||
    candidate.location?.value?.countryCode ||
    ''
  );
  const candCountry = normalizeForMatch(
    candidate.address?.value?.country ||
    ''
  );
  const candCity = normalizeForMatch(
    candidate.address?.value?.locality ||
    candidate.location?.value?.city ||
    ''
  );

  const targetCountryCode = normalizeForMatch(targetLocation.countryCode || '');
  const targetCountry = normalizeForMatch(targetLocation.country || '');
  const targetCity = normalizeForMatch(targetLocation.city || '');

  // 1. Country code mismatch check
  if (targetCountryCode && candCountryCode && targetCountryCode !== candCountryCode) {
    return {
      isGeoMatch: false,
      isGeoUncertain: false,
      reasonCode: 'DISQUALIFIED_GEO_MISMATCH'
    };
  }

  // 2. Country name mismatch check
  if (targetCountry && candCountry && !candCountry.includes(targetCountry) && !targetCountry.includes(candCountry)) {
    return {
      isGeoMatch: false,
      isGeoUncertain: false,
      reasonCode: 'DISQUALIFIED_GEO_MISMATCH'
    };
  }

  // 3. City mismatch check (if target city specified and candidate has distinct city)
  if (targetCity && candCity && candCity !== targetCity && !candCity.includes(targetCity)) {
    // If country matches but city differs, check if region/locality is in conflict
    return {
      isGeoMatch: false,
      isGeoUncertain: false,
      reasonCode: 'DISQUALIFIED_GEO_MISMATCH'
    };
  }

  // 4. Missing location info when target specified
  if ((targetCountryCode || targetCity) && !candCountryCode && !candCountry && !candCity) {
    return {
      isGeoMatch: true,
      isGeoUncertain: true,
      reasonCode: 'UNCERTAIN_GEOGRAPHY_AMBIGUOUS'
    };
  }

  return { isGeoMatch: true, isGeoUncertain: false };
}

/**
 * Checks for hard contradictions between candidate source data and website evidence.
 */
function detectContradictions(
  candidate: NormalizedCandidate,
  evidence?: WebsiteEvidence
): { hasContradiction: boolean; isHardDisqualification: boolean; reasonCode?: QualificationReasonCode; message?: string } {
  if (!evidence) {
    return { hasContradiction: false, isHardDisqualification: false };
  }

  const candName = normalizeForMatch(candidate.businessName?.value?.comparisonName || candidate.businessName?.value?.displayName || '');
  // Skip contradiction check if domain is parked or already identified as non-business
  if (evidence.parkingEvidence?.isParked || evidence.nonBusinessEvidence?.isNonBusiness) {
    return { hasContradiction: false, isHardDisqualification: false };
  }

  // Hard contradiction: active site with explicit conflicting business entity
  if (
    evidence.businessNameEvidence &&
    evidence.businessNameEvidence.matched === false &&
    evidence.businessNameEvidence.matchedValue &&
    evidence.httpStatus === 200
  ) {
    return {
      hasContradiction: true,
      isHardDisqualification: true,
      reasonCode: 'DISQUALIFIED_CONTRADICTION',
      message: `Website represents a confirmed conflicting entity: ${evidence.businessNameEvidence.matchedValue}`
    };
  }

  // Geographic contradiction between candidate and website
  if (
    candidate.address?.value?.countryCode &&
    evidence.addressEvidence?.localityMatched === false &&
    evidence.addressEvidence?.evidenceSnippet
  ) {
    return {
      hasContradiction: true,
      isHardDisqualification: false,
      reasonCode: 'UNCERTAIN_CONTRADICTORY_EVIDENCE',
      message: 'Website geographic evidence conflicts with candidate location records.'
    };
  }

  return { hasContradiction: false, isHardDisqualification: false };
}

/**
 * Aggregates all source contributions and evaluates policy, persistence, and export eligibility.
 */
function evaluatePolicyAndFirewall(
  candidate: NormalizedCandidate,
  evidence?: WebsiteEvidence
): {
  policyStatus: PolicyStatus;
  persistenceStatus: PersistenceStatus;
  exportStatus: ExportStatus;
  allContributions: SourceContribution[];
  allDerivedFrom: SourceContribution[];
  isRestrictedGoogle: boolean;
  requiresReview: boolean;
  isPolicyBlocked: boolean;
} {
  const allContributions: SourceContribution[] = [
    ...(candidate.sourceContributions || [])
  ];

  if (evidence?.sourceContributions) {
    allContributions.push(...evidence.sourceContributions);
  }

  // Build derivedFrom lineage
  const allDerivedFrom: SourceContribution[] = [
    ...(candidate.businessName?.derivedFrom || []),
    ...(candidate.websiteUrl?.derivedFrom || [])
  ];

  if (evidence?.derivedFrom) {
    allDerivedFrom.push(...evidence.derivedFrom);
  }

  let isRestrictedGoogle = false;
  let requiresReview = false;
  let isPolicyBlocked = false;

  for (const c of allContributions) {
    if (
      c.restrictionBasis === 'GOOGLE_CONSUMER_WEB_RESTRICTED' ||
      (c.provenance === 'GOOGLE_DERIVED' && c.acquisitionContext === 'GOOGLE_CONSUMER_WEB') ||
      c.isRestricted
    ) {
      isRestrictedGoogle = true;
    }

    if (
      c.restrictionBasis === 'UNKNOWN_REQUIRES_REVIEW' ||
      c.policyStatus === 'UNKNOWN' ||
      c.policyStatus === 'POLICY_REVIEW_REQUIRED' ||
      c.policyStatus === 'TERMS_REVIEW_REQUIRED' ||
      (c.provenance === 'GOOGLE_API_DERIVED' && c.policyStatus !== 'POLICY_APPROVED')
    ) {
      requiresReview = true;
    }

    if (c.policyStatus === 'PRODUCT_REJECTED') {
      isPolicyBlocked = true;
    }
  }

  // Determine policy, persistence, and export gates
  let policyStatus: PolicyStatus = candidate.overallPolicyStatus || 'POLICY_APPROVED';
  let persistenceStatus: PersistenceStatus = candidate.overallPersistenceStatus || 'PERSISTABLE';
  let exportStatus: ExportStatus = candidate.overallExportStatus || 'EXPORTABLE';

  if (isPolicyBlocked) {
    policyStatus = 'PRODUCT_REJECTED';
    persistenceStatus = 'NOT_PERSISTABLE';
    exportStatus = 'NOT_EXPORTABLE';
  } else if (isRestrictedGoogle) {
    // CRITICAL: Google consumer-web data is strictly NON-PERSISTABLE and NON-EXPORTABLE
    policyStatus = 'POLICY_GATED';
    persistenceStatus = 'NOT_PERSISTABLE';
    exportStatus = 'NOT_EXPORTABLE';
  } else if (requiresReview) {
    policyStatus = 'POLICY_REVIEW_REQUIRED';
    persistenceStatus = 'PERSISTENCE_GATED';
    exportStatus = 'EXPORT_GATED';
  }

  return {
    policyStatus,
    persistenceStatus,
    exportStatus,
    allContributions,
    allDerivedFrom,
    isRestrictedGoogle,
    requiresReview,
    isPolicyBlocked
  };
}

/**
 * Main Deterministic Lead Qualification Pipeline.
 */
export function qualifyLead(
  input: QualificationEvaluationInput
): QualificationResultEnvelope {
  const {
    candidate,
    websiteRequirement,
    websiteEvidence,
    targetKeywords,
    targetLocation,
    targetCategory,
    explicitNoWebsiteEvidence
  } = input;

  const now = new Date().toISOString();
  const qualificationReasons: QualificationReasonCode[] = [];
  const uncertainReasons: string[] = [];

  // 1. Evaluate Website State & Requirement
  const websiteState = determineWebsiteState(candidate, websiteEvidence);
  const websiteResult = evaluateWebsiteRequirement(
    websiteRequirement,
    websiteState,
    explicitNoWebsiteEvidence
  );

  // 2. Evaluate Business Relevance
  const relevanceResult = evaluateRelevance(
    candidate,
    targetKeywords,
    targetCategory,
    websiteEvidence
  );

  // 3. Evaluate Geography
  const geoResult = evaluateGeography(candidate, targetLocation);

  // 4. Detect Contradictions
  const contradictionResult = detectContradictions(candidate, websiteEvidence);

  // 5. Evaluate Data Firewall, Provenance Lineage, and Policy
  const firewallResult = evaluatePolicyAndFirewall(candidate, websiteEvidence);

  // -----------------------------------------------------------
  // Deterministic Qualification Gate Resolution
  // -----------------------------------------------------------
  let qualificationState: QualificationState = 'QUALIFIED';

  // Check 1: Policy Ineligibility (Immediate Disqualification)
  if (firewallResult.isPolicyBlocked) {
    qualificationState = 'DISQUALIFIED';
    qualificationReasons.push('DISQUALIFIED_POLICY_INELIGIBLE');
  }

  // Check 2: Relevance Disqualification
  if (relevanceResult.reasonCode === 'DISQUALIFIED_IRRELEVANT') {
    qualificationState = 'DISQUALIFIED';
    qualificationReasons.push('DISQUALIFIED_IRRELEVANT');
  }

  // Check 3: Geographic Disqualification
  if (geoResult.reasonCode === 'DISQUALIFIED_GEO_MISMATCH') {
    qualificationState = 'DISQUALIFIED';
    qualificationReasons.push('DISQUALIFIED_GEO_MISMATCH');
  }

  // Check 4: Contradiction Disqualification
  if (contradictionResult.hasContradiction && contradictionResult.isHardDisqualification) {
    qualificationState = 'DISQUALIFIED';
    qualificationReasons.push(contradictionResult.reasonCode || 'DISQUALIFIED_CONTRADICTION');
  }

  // Check 5: Website Disqualification
  if (
    websiteResult.reasonCode === 'DISQUALIFIED_PARKED_DOMAIN' ||
    websiteResult.reasonCode === 'DISQUALIFIED_NON_BUSINESS' ||
    websiteResult.reasonCode === 'DISQUALIFIED_WEBSITE_REQUIREMENT'
  ) {
    qualificationState = 'DISQUALIFIED';
    qualificationReasons.push(websiteResult.reasonCode);
  }

  // If not disqualified, evaluate uncertainty gates
  if (qualificationState !== 'DISQUALIFIED') {
    let hasUncertainty = false;

    // Uncertainty Gate: Website Requirement
    if (!websiteResult.isEligible) {
      hasUncertainty = true;
      qualificationReasons.push(websiteResult.reasonCode);
      uncertainReasons.push(websiteResult.reason);
    }

    // Uncertainty Gate: Policy Review Required
    if (firewallResult.requiresReview) {
      hasUncertainty = true;
      qualificationReasons.push('UNCERTAIN_POLICY_REVIEW');
      uncertainReasons.push('Source data contains unreviewed or service-specific contributions requiring compliance audit.');
    }

    // Uncertainty Gate: Contradictory Evidence
    if (contradictionResult.hasContradiction && !contradictionResult.isHardDisqualification) {
      hasUncertainty = true;
      qualificationReasons.push('UNCERTAIN_CONTRADICTORY_EVIDENCE');
      uncertainReasons.push(contradictionResult.message || 'Contradictory signals observed.');
    }

    // Uncertainty Gate: Geographic Ambiguity
    if (geoResult.isGeoUncertain) {
      hasUncertainty = true;
      qualificationReasons.push('UNCERTAIN_GEOGRAPHY_AMBIGUOUS');
      uncertainReasons.push('Geographic location signals are incomplete or ambiguous relative to target.');
    }

    // Uncertainty Gate: Weak Relevance
    if (relevanceResult.isUncertain) {
      hasUncertainty = true;
      qualificationReasons.push('UNCERTAIN_RELEVANCE_WEAK');
      uncertainReasons.push('Commercial signals are weak or category confirmation is incomplete.');
    }

    if (hasUncertainty) {
      qualificationState = 'UNCERTAIN';
    } else {
      // All gates passed! Add qualifying reason code
      qualificationReasons.push(websiteResult.reasonCode);
    }
  }

  // Build clean, factual human explanation
  const explanation = formatWhyThisLead(qualificationReasons);

  return {
    candidate,
    websiteRequirement,
    websiteState,
    websiteEvidence,
    qualificationState,
    qualificationReasons,
    explanation,
    policyEligibility: firewallResult.policyStatus,
    persistenceEligibility: firewallResult.persistenceStatus,
    exportEligibility: firewallResult.exportStatus,
    sourceContributions: firewallResult.allContributions,
    derivedFrom: firewallResult.allDerivedFrom,
    uncertainReasons: uncertainReasons.length > 0 ? uncertainReasons : undefined,
    evaluatedAt: now
  };
}

/**
 * Batch qualifies an array of candidate inputs.
 */
export function qualifyLeadBatch(
  inputs: QualificationEvaluationInput[]
): QualificationResultEnvelope[] {
  return inputs.map(qualifyLead);
}
