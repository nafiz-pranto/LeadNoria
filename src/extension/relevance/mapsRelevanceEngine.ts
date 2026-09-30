/**
 * LeadNoria Maps Evidence & Relevance Engine (Phase 9)
 *
 * Implements deterministic evidence evaluation, waterfall classification,
 * contradiction overrides, anti-inflation, reason code assignment,
 * and strict policy firewall preservation.
 *
 * INVARIANTS:
 * 1. ZERO DOM scraping, ZERO live Google Maps extraction (CONTRACT_ONLY).
 * 2. ZERO modification of frozen Meta production runtime.
 * 3. Technical relevance classification is INDEPENDENT of persistence/export eligibility.
 *    RELEVANT + GOOGLE_CONSUMER_WEB_RESTRICTED != EXPORTABLE.
 * 4. Deterministic: identical inputs produce byte-identical outputs.
 * 5. Unknown != Negative. Missing evidence is never converted to negative without explicit rule.
 */

import { performance } from 'node:perf_hooks';

import type {
  ResolvedEntityGroup
} from '../resolution/types.ts';

import type {
  PolicyStatus,
  PersistenceStatus,
  ExportStatus,
  SourceContribution
} from '../extraction/types.ts';

import type {
  MapsResearchIntent,
  NormalizedResearchIntent,
  EntityRelevanceResult,
  BatchRelevanceResult,
  RelevanceState,
  EvidenceWaterfallTier,
  RelevanceReasonCode,
  RelevanceEvaluationOptions,
  RelevanceEvidenceItem
} from './types.ts';

import {
  extractEntityEvidence
} from './evidenceExtractor.ts';

import {
  normalizeOntologyString
} from './ontology.ts';

/**
 * Normalizes user research intent locally and deterministically.
 */
export function normalizeResearchIntent(intent: MapsResearchIntent): NormalizedResearchIntent {
  const normKw = normalizeOntologyString(intent.keyword || '');
  const normCat = intent.category ? normalizeOntologyString(intent.category) : undefined;
  const normLoc = intent.targetLocation ? normalizeOntologyString(intent.targetLocation) : undefined;
  const normCountry = intent.targetCountry ? intent.targetCountry.trim().toUpperCase() : undefined;
  const normReg = intent.targetRegion ? normalizeOntologyString(intent.targetRegion) : undefined;

  const kwTokens = normKw.split(' ').filter(t => t.length > 0);
  const catTokens = normCat ? normCat.split(' ').filter(t => t.length > 0) : [];

  const queryVariants = (intent.queryVariants || []).map(v => normalizeOntologyString(v)).filter(Boolean);
  const userSynonyms = (intent.userSynonyms || []).map(s => normalizeOntologyString(s)).filter(Boolean);
  const exclusions = (intent.exclusions || []).map(e => normalizeOntologyString(e)).filter(Boolean);

  return {
    originalKeyword: intent.keyword,
    normalizedKeyword: normKw,
    keywordTokens: kwTokens,
    originalCategory: intent.category,
    normalizedCategory: normCat,
    categoryTokens: catTokens,
    targetLocation: intent.targetLocation,
    normalizedLocation: normLoc,
    targetCountry: intent.targetCountry,
    normalizedCountry: normCountry,
    targetRegion: intent.targetRegion,
    normalizedRegion: normReg,
    language: intent.language || 'en',
    locale: intent.locale || 'en_US',
    websiteRequirement: intent.websiteRequirement || 'BOTH',
    queryVariants,
    userSynonyms,
    exclusions,
    strictLocation: intent.strictLocation ?? true
  };
}

/**
 * Evaluates the relevance of a single ResolvedEntityGroup against research intent.
 */
export function evaluateEntityRelevance(
  entity: ResolvedEntityGroup,
  intent: MapsResearchIntent,
  options: RelevanceEvaluationOptions = {}
): EntityRelevanceResult {
  const normIntent = normalizeResearchIntent(intent);

  // 1. Extract primary evidence
  const extraction = extractEntityEvidence(entity, normIntent);
  let allEvidence = [...extraction.evidenceItems];

  // 2. Query expansion anti-inflation (Phase 9 Section 26 & 27)
  // If query variants exist, evaluate them to find additional evidence,
  // but deduplicate by evidenceId so identical facts never inflate scores.
  if (normIntent.queryVariants.length > 0 && options.enableAntiInflation !== false) {
    const existingEvidenceIds = new Set(allEvidence.map(e => e.evidenceId));
    for (const variant of normIntent.queryVariants) {
      if (variant === normIntent.normalizedKeyword) continue;
      const variantIntent: NormalizedResearchIntent = {
        ...normIntent,
        normalizedKeyword: variant,
        keywordTokens: variant.split(' ').filter(Boolean)
      };
      const variantExtraction = extractEntityEvidence(entity, variantIntent);
      for (const item of variantExtraction.evidenceItems) {
        if (!existingEvidenceIds.has(item.evidenceId)) {
          existingEvidenceIds.add(item.evidenceId);
          allEvidence.push(item);
        }
      }
    }
  }

  // 3. Separate evidence by polarity
  const positiveEvidence: RelevanceEvidenceItem[] = [];
  const negativeEvidence: RelevanceEvidenceItem[] = [];
  const contradictions: RelevanceEvidenceItem[] = [];

  for (const item of allEvidence) {
    if (item.polarity === 'POSITIVE') {
      positiveEvidence.push(item);
    } else if (item.polarity === 'NEGATIVE') {
      negativeEvidence.push(item);
      if (item.strength === 'STRONG') {
        contradictions.push(item);
      }
    } else if (item.polarity === 'CONTRADICTORY') {
      contradictions.push(item);
      negativeEvidence.push(item);
    }
  }

  // 4. Deterministic Evidence Waterfall Evaluation (Phase 9 Section 15, 16, 17)
  let relevanceState: RelevanceState = 'UNCERTAIN';
  let evidenceTier: EvidenceWaterfallTier = 'TIER_6_WEAK_AMBIGUOUS';
  const reasonCodes: RelevanceReasonCode[] = [];
  let explanation = '';
  let internalScore = 0;

  const {
    locationState,
    hasCategoryMatch,
    hasCategoryCompatible,
    hasCategoryContradiction,
    hasNameMatch,
    hasExactLocationMatch,
    hasCountryMismatch,
    hasNegativeModifier,
    hasDecisiveNegation,
    isCategoryUnknown,
    hasObservedCategoryMismatch,
    isLocationUnknown,
    serviceMatches
  } = extraction;

  const hasExclusionMatch = negativeEvidence.some(e => e.ruleId === 'USER_EXCLUSION_MATCH');

  // CONTRADICTION OVERRIDES (Hard negative overrides)
  if (hasCountryMismatch) {
    relevanceState = 'NOT_RELEVANT';
    evidenceTier = 'CONTRADICTION_OVERRIDE';
    reasonCodes.push('NOT_RELEVANT_COUNTRY_MISMATCH');
    explanation = 'Target country does not match the physical location of the business.';
    internalScore = 0;
  } else if (hasExclusionMatch) {
    relevanceState = 'NOT_RELEVANT';
    evidenceTier = 'EXCLUSION_OVERRIDE';
    reasonCodes.push('NOT_RELEVANT_EXCLUSION_TERM_MATCH');
    explanation = 'Business matches explicit user-configured exclusion term.';
    internalScore = 0;
  } else if (hasCategoryContradiction) {
    relevanceState = 'NOT_RELEVANT';
    evidenceTier = 'CONTRADICTION_OVERRIDE';
    reasonCodes.push('NOT_RELEVANT_NEGATIVE_CATEGORY');
    reasonCodes.push('NOT_RELEVANT_CONTRADICTORY_BUSINESS_TYPE');
    explanation = 'Business category contradicts the target research domain.';
    internalScore = 5;
  } else if (hasDecisiveNegation) {
    // Only DECISIVE entity-level negations (Prompt 9A Section 1) trigger hard override
    relevanceState = 'NOT_RELEVANT';
    evidenceTier = 'CONTRADICTION_OVERRIDE';
    reasonCodes.push('NOT_RELEVANT_NEGATED_INTENT');
    explanation = 'Business identity contains explicit negative modifier (e.g. "not a contractor", permanently closed).';
    internalScore = 5;
  } else if (normIntent.strictLocation && locationState === 'LOCATION_MISMATCH') {
    relevanceState = 'NOT_RELEVANT';
    evidenceTier = 'CONTRADICTION_OVERRIDE';
    reasonCodes.push('NOT_RELEVANT_LOCATION_MISMATCH');
    explanation = 'Business is located in a different locality than the requested target location.';
    internalScore = 15;
  }
  // POSITIVE WATERFALL TIERS
  else if (hasCategoryMatch && (hasExactLocationMatch || !normIntent.targetLocation)) {
    // TIER 1: Exact category + exact target location
    relevanceState = 'RELEVANT';
    evidenceTier = 'TIER_1_EXACT_CATEGORY_LOCATION';
    reasonCodes.push('RELEVANT_EXACT_CATEGORY_LOCATION');
    explanation = `Exact category match with target locality "${normIntent.targetLocation || 'any'}".`;
    internalScore = 95;
  } else if (hasCategoryMatch && (hasNameMatch || serviceMatches.length > 0) && (hasExactLocationMatch || locationState === 'LOCATION_MATCH')) {
    // TIER 2: Exact category + strong business-name/service evidence + matching location
    relevanceState = 'RELEVANT';
    evidenceTier = 'TIER_2_CATEGORY_NAME_SERVICE_LOCATION';
    if (serviceMatches.length > 0) {
      reasonCodes.push('RELEVANT_SERVICE_CATEGORY_LOCATION');
      explanation = `Category match corroborated by explicit service terms: "${serviceMatches.join(', ')}".`;
    } else {
      reasonCodes.push('RELEVANT_CATEGORY_NAME_LOCATION');
      explanation = `Category match corroborated by relevant business name "${entity.canonicalDisplayName}".`;
    }
    internalScore = 90;
  } else if (hasCategoryCompatible && (hasExactLocationMatch || locationState === 'LOCATION_MATCH') && (hasNameMatch || serviceMatches.length > 0)) {
    // TIER 3: Strong category-compatible evidence + location evidence
    relevanceState = 'RELEVANT';
    evidenceTier = 'TIER_3_COMPATIBLE_CATEGORY_LOCATION';
    reasonCodes.push('RELEVANT_MULTI_SIGNAL');
    explanation = 'Compatible industry category corroborated by business name and physical location.';
    internalScore = 80;
  } else if (serviceMatches.length > 0 && hasNameMatch && (hasExactLocationMatch || locationState === 'LOCATION_MATCH')) {
    // TIER 4: Strong service/product evidence + business identity + location
    relevanceState = 'RELEVANT';
    evidenceTier = 'TIER_4_SERVICE_PRODUCT_IDENTITY_LOCATION';
    reasonCodes.push('RELEVANT_SERVICE_CATEGORY_LOCATION');
    explanation = `Multiple relevant service terms "${serviceMatches.join(', ')}" corroborated by name and location.`;
    internalScore = 75;
  } else if (hasNameMatch && hasCategoryCompatible && (locationState === 'LOCATION_MATCH' || locationState === 'LOCATION_PARTIAL')) {
    // TIER 5: Name/alias evidence + supporting category/location evidence
    relevanceState = 'RELEVANT';
    evidenceTier = 'TIER_5_NAME_ALIAS_CORROBORATED';
    reasonCodes.push('RELEVANT_ALIAS_CORROBORATED');
    explanation = 'Business name match supported by compatible domain category.';
    internalScore = 70;
  }
  // AMBIGUOUS, WEAK, MISSING, OR MISMATCH CASES (Prompt 9A Section 2 & 6)
  // Case C: Material conflict between positive and negative evidence
  else if (positiveEvidence.length > 0 && negativeEvidence.length > 0) {
    relevanceState = 'UNCERTAIN';
    evidenceTier = 'TIER_6_WEAK_AMBIGUOUS';
    reasonCodes.push('UNCERTAIN_CONTRADICTORY_EVIDENCE');
    explanation = 'Positive and negative evidence materially conflict; requires review.';
    internalScore = 40;
  }
  // Category matches, but location is only regional / partial
  else if (hasCategoryMatch && locationState === 'LOCATION_PARTIAL') {
    relevanceState = 'UNCERTAIN';
    evidenceTier = 'TIER_6_WEAK_AMBIGUOUS';
    reasonCodes.push('UNCERTAIN_LOCATION_PARTIAL');
    explanation = 'Category matches target, but business locality is partial or regional.';
    internalScore = 50;
  }
  // Category matches, but location is missing / unknown (Prompt 9A Section 2)
  else if (hasCategoryMatch && locationState === 'LOCATION_UNKNOWN') {
    relevanceState = 'UNCERTAIN';
    evidenceTier = 'TIER_6_WEAK_AMBIGUOUS';
    reasonCodes.push('UNCERTAIN_LOCATION_MISSING');
    explanation = 'Category matches target, but business has no verifiable physical location.';
    internalScore = 40;
  }
  // Name match with unknown category (Prompt 9A Section 2)
  else if (hasNameMatch && isCategoryUnknown) {
    relevanceState = 'UNCERTAIN';
    evidenceTier = 'TIER_6_WEAK_AMBIGUOUS';
    reasonCodes.push('UNCERTAIN_NAME_ONLY');
    reasonCodes.push('UNCERTAIN_CATEGORY_UNKNOWN');
    reasonCodes.push('UNCERTAIN_INSUFFICIENT_CORROBORATION');
    explanation = 'Business name matches keyword, but category is unknown and unverified.';
    internalScore = 45;
  }
  // Name match alone without category corroboration => UNCERTAIN
  else if (hasNameMatch && !hasCategoryMatch && !hasCategoryCompatible && !hasCategoryContradiction) {
    relevanceState = 'UNCERTAIN';
    evidenceTier = 'TIER_6_WEAK_AMBIGUOUS';
    reasonCodes.push('UNCERTAIN_NAME_ONLY');
    reasonCodes.push('UNCERTAIN_INSUFFICIENT_CORROBORATION');
    explanation = 'Business name contains keyword, but lacks corroborating category or service evidence.';
    internalScore = 40;
  }
  // Compatible category alone without any name or service support
  else if (hasCategoryCompatible && !hasNameMatch && serviceMatches.length === 0) {
    relevanceState = 'UNCERTAIN';
    evidenceTier = 'TIER_6_WEAK_AMBIGUOUS';
    reasonCodes.push('UNCERTAIN_INSUFFICIENT_CORROBORATION');
    explanation = 'Category is only broadly compatible with no corroborating service or name signals.';
    internalScore = 35;
  }
  // Case A: Observed mismatch evidence exists => NOT_RELEVANT (Prompt 9A Section 2)
  else if (hasObservedCategoryMismatch || hasCategoryContradiction) {
    relevanceState = 'NOT_RELEVANT';
    evidenceTier = 'TIER_6_WEAK_AMBIGUOUS';
    reasonCodes.push('NOT_RELEVANT_CATEGORY_MISMATCH');
    explanation = 'Observed business category mismatches requested intent.';
    internalScore = 10;
  }
  // Case B: Required evidence is missing/unknown and no strong negative evidence exists => UNCERTAIN (Prompt 9A Section 2)
  // (e.g. Category = UNKNOWN, Service = UNKNOWN, Name = "ABC Holdings", Query = "Roofing Contractor")
  else if (isCategoryUnknown && serviceMatches.length === 0) {
    relevanceState = 'UNCERTAIN';
    evidenceTier = 'TIER_6_WEAK_AMBIGUOUS';
    reasonCodes.push('UNCERTAIN_CATEGORY_UNKNOWN');
    reasonCodes.push('UNCERTAIN_INSUFFICIENT_CORROBORATION');
    explanation = 'Required category and service evidence is missing/unknown; cannot determine relevance without evidence.';
    internalScore = 25;
  }
  // Final Fallback: Zero positive evidence + no negative evidence + insufficient information => UNCERTAIN
  else {
    relevanceState = 'UNCERTAIN';
    evidenceTier = 'TIER_6_WEAK_AMBIGUOUS';
    reasonCodes.push('UNCERTAIN_INSUFFICIENT_CORROBORATION');
    explanation = 'Available evidence provides no positive match and insufficient information to determine relevance.';
    internalScore = 25;
  }

  // 5. Policy & Data Firewall Preservation (Phase 9 Section 22 & Prompt 9A Section 3)
  // Technical relevance NEVER grants persistence or export eligibility.
  const policySummary = entity.policySummary;
  const isRestricted = Boolean(policySummary?.isRestricted);
  const policyEligibility: PolicyStatus = policySummary?.overallPolicyStatus || 'POLICY_APPROVED';
  const persistenceEligibility: PersistenceStatus = policySummary?.overallPersistenceStatus || 'PERSISTABLE';
  const exportEligibility: ExportStatus = policySummary?.overallExportStatus || 'EXPORTABLE';

  const sourceContributions: SourceContribution[] = [...(entity.sourceContributions || [])];
  const derivedFrom: SourceContribution[] = [...(entity.derivedFrom || [])];

  // LeadNoria relevance decision contribution preserving full Phase 5 metadata
  const relevanceDecisionContribution: SourceContribution = {
    source: 'FUTURE_SOURCE',
    provenance: 'LEADNORIA_DERIVED',
    fieldName: 'relevanceDecision',
    acquisitionContext: 'LEADNORIA_INTERNAL',
    restrictionBasis: isRestricted ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' : 'NONE',
    isRestricted,
    policyStatus: policyEligibility,
    persistenceStatus: persistenceEligibility,
    exportStatus: exportEligibility
  };

  const consolidatedContributions: SourceContribution[] = [
    ...sourceContributions,
    relevanceDecisionContribution
  ];

  return {
    entityId: entity.entityId,
    canonicalDisplayName: entity.canonicalDisplayName,
    relevanceState,
    evidenceTier,
    locationState,
    internalScore,
    evidenceItems: allEvidence,
    positiveEvidence,
    negativeEvidence,
    contradictions,
    reasonCodes,
    explanation,
    sourceContributions: consolidatedContributions,
    derivedFrom: derivedFrom.length > 0 ? derivedFrom : sourceContributions,
    policyEligibility,
    persistenceEligibility,
    exportEligibility,
    isRestricted,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * Evaluates a batch of ResolvedEntityGroup instances against research intent.
 */
export function evaluateEntityRelevanceBatch(
  entities: ResolvedEntityGroup[],
  intent: MapsResearchIntent,
  options: RelevanceEvaluationOptions = {}
): BatchRelevanceResult {
  const start = performance.now();
  let heapBefore = 0;
  if (typeof process !== 'undefined' && process.memoryUsage) {
    if ((global as any).gc) (global as any).gc();
    heapBefore = process.memoryUsage().heapUsed;
  }

  let relevantCount = 0;
  let uncertainCount = 0;
  let notRelevantCount = 0;
  let totalEvidenceGenerated = 0;
  let deduplicatedEvidenceCount = 0;

  const results: EntityRelevanceResult[] = [];

  for (let i = 0; i < entities.length; i++) {
    const res = evaluateEntityRelevance(entities[i], intent, options);
    results.push(res);

    if (res.relevanceState === 'RELEVANT') relevantCount++;
    else if (res.relevanceState === 'UNCERTAIN') uncertainCount++;
    else if (res.relevanceState === 'NOT_RELEVANT') notRelevantCount++;

    totalEvidenceGenerated += res.evidenceItems.length;
    deduplicatedEvidenceCount += res.evidenceItems.length;
  }

  const elapsedMs = performance.now() - start;
  const throughputOpsSec = elapsedMs > 0 ? Math.round((entities.length / (elapsedMs / 1000))) : 0;

  let heapDeltaMB: number | undefined;
  if (typeof process !== 'undefined' && process.memoryUsage) {
    if ((global as any).gc) (global as any).gc();
    const heapAfter = process.memoryUsage().heapUsed;
    heapDeltaMB = Number(((heapAfter - heapBefore) / 1024 / 1024).toFixed(2));
  }

  return {
    results,
    summary: {
      totalEntities: entities.length,
      relevantCount,
      uncertainCount,
      notRelevantCount,
      totalEvidenceGenerated,
      deduplicatedEvidenceCount,
      elapsedMs,
      throughputOpsSec,
      heapDeltaMB
    }
  };
}
