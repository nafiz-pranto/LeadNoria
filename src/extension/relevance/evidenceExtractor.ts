/**
 * LeadNoria Maps Evidence Extractor (Phase 9)
 *
 * Extracts structured, auditable relevance evidence items from a Phase 8
 * ResolvedEntityGroup across business names, categories, locations, branches,
 * websites, and service terms.
 *
 * INVARIANTS:
 * 1. ZERO DOM scraping, ZERO external network calls.
 * 2. Strict provenance preservation: every evidence item traces to source lineage.
 * 3. Duplicate evidence anti-inflation: identical facts across multiple records
 *    are deduplicated into a single evidence fact.
 * 4. Unknown != Negative: missing fields are classified as neutral/unknown, not negative.
 */

import { createHash } from 'node:crypto';

import type {
  ResolvedEntityGroup
} from '../resolution/types.ts';

import type {
  NormalizedCandidate,
  SourceContribution,
  PolicyStatus,
  ProvenanceType
} from '../extraction/types.ts';

import type {
  RelevanceEvidenceItem,
  NormalizedResearchIntent,
  LocationRelevanceState,
  EvidenceStrength
} from './types.ts';

import {
  evaluateCategoryMatch,
  extractServiceMatches,
  detectContextualNegation,
  normalizeOntologyString,
  resolveIndustryForTerm,
  GENERIC_NAME_STOP_WORDS
} from './ontology.ts';

/**
 * Generates a deterministic hash-based evidence ID.
 */
function makeEvidenceId(
  entityId: string,
  type: string,
  field: string,
  observedValue: string
): string {
  const payload = `${entityId}:${type}:${field}:${observedValue.toLowerCase().trim()}`;
  return 'ev_' + createHash('sha256').update(payload).digest('hex').substring(0, 16);
}

/**
 * Locates full SourceContribution objects corresponding to a specific field.
 * Preserves Phase 5 authoritative lineage (Prompt 9A Section 3).
 */
function getFieldContributions(
  entity: ResolvedEntityGroup,
  fieldName: string,
  fallbackProvenance: ProvenanceType = 'LEADNORIA_DERIVED'
): SourceContribution[] {
  const matches: SourceContribution[] = [];
  for (const rec of entity.sourceRecords) {
    for (const sc of rec.sourceContributions || []) {
      if (
        sc.fieldName === fieldName ||
        (fieldName.startsWith('canonicalDisplay') && (sc.fieldName === 'businessName' || sc.fieldName === 'name')) ||
        (fieldName.startsWith('canonicalComparison') && (sc.fieldName === 'businessName' || sc.fieldName === 'name')) ||
        (fieldName.startsWith('category') && sc.fieldName === 'categories') ||
        (fieldName.startsWith('locality') && sc.fieldName === 'address') ||
        (fieldName.startsWith('country') && sc.fieldName === 'address') ||
        (fieldName.startsWith('domain') && sc.fieldName === 'websiteUri')
      ) {
        matches.push(sc);
      }
    }
  }
  if (matches.length > 0) return matches;
  if (entity.sourceContributions && entity.sourceContributions.length > 0) {
    return entity.sourceContributions;
  }
  return [{
    source: 'FUTURE_SOURCE',
    provenance: fallbackProvenance,
    fieldName,
    acquisitionContext: 'LEADNORIA_INTERNAL',
    restrictionBasis: 'NONE',
    isRestricted: false,
    policyStatus: 'POLICY_APPROVED',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'EXPORTABLE'
  }];
}

/**
 * Extracts and consolidates all evidence items from a resolved entity group.
 */
export function extractEntityEvidence(
  entity: ResolvedEntityGroup,
  intent: NormalizedResearchIntent
): {
  evidenceItems: RelevanceEvidenceItem[];
  locationState: LocationRelevanceState;
  hasCategoryMatch: boolean;
  hasCategoryCompatible: boolean;
  hasCategoryContradiction: boolean;
  hasNameMatch: boolean;
  hasExactLocationMatch: boolean;
  hasCountryMismatch: boolean;
  hasNegativeModifier: boolean;
  hasDecisiveNegation: boolean;
  isCategoryUnknown: boolean;
  hasObservedCategoryMismatch: boolean;
  isLocationUnknown: boolean;
  serviceMatches: string[];
} {
  const rawItems: RelevanceEvidenceItem[] = [];
  const primaryRecord = entity.sourceRecords[0] || {} as NormalizedCandidate;
  const entityProvenance: ProvenanceType = entity.policySummary?.overallProvenance || 'LEADNORIA_DERIVED';
  const entityPolicyStatus: PolicyStatus = entity.policySummary?.overallPolicyStatus || 'POLICY_APPROVED';
  const contributions: SourceContribution[] = entity.sourceContributions || [];
  const derivedFrom: SourceContribution[] = entity.derivedFrom || [];

  let hasCategoryMatch = false;
  let hasCategoryCompatible = false;
  let hasCategoryContradiction = false;
  let hasNameMatch = false;
  let hasExactLocationMatch = false;
  let hasCountryMismatch = false;
  let hasNegativeModifier = false;
  let hasDecisiveNegation = false;
  const serviceMatchesSet = new Set<string>();

  // --------------------------------------------------------------------------
  // 1. BUSINESS NAME & ALIAS EVIDENCE
  // --------------------------------------------------------------------------
  const nameValues = [
    { val: entity.canonicalDisplayName, field: 'canonicalDisplayName' },
    { val: entity.canonicalComparisonName, field: 'canonicalComparisonName' },
    ...(entity.aliases || []).map((a, i) => ({ val: a, field: `alias_${i}` }))
  ];

  const normKeyword = intent.normalizedKeyword;
  const keywordTokens = intent.keywordTokens;

  for (const { val, field } of nameValues) {
    if (!val) continue;
    const normVal = normalizeOntologyString(val);
    if (!normVal) continue;

    // Context-aware negative evidence evaluation (Prompt 9A Section 1 & 5)
    const contextualNegations = detectContextualNegation(val, normKeyword, field);
    for (const neg of contextualNegations) {
      if (neg.contextType === 'ENTITY_LEVEL_NEGATION' && neg.isDecisive) {
        hasDecisiveNegation = true;
        hasNegativeModifier = true;
        rawItems.push({
          evidenceId: makeEvidenceId(entity.entityId, 'NEGATIVE_CATEGORY_EVIDENCE', field, neg.term),
          evidenceType: 'NEGATIVE_CATEGORY_EVIDENCE',
          fieldName: field,
          observedValue: val,
          matchedValue: neg.term,
          matchType: 'NEGATED_MATCH',
          strength: 'STRONG',
          polarity: 'NEGATIVE',
          explanation: neg.explanation,
          sourceProvenance: entityProvenance,
          sourceContributions: getFieldContributions(entity, field, entityProvenance),
          derivedFrom,
          confidence: 'STRONG',
          policyStatus: entityPolicyStatus,
          ruleId: 'NEG_ENTITY_LEVEL',
          queryTerm: normKeyword,
          negationContext: 'ENTITY_LEVEL_NEGATION'
        });
      } else if (neg.contextType === 'PAGE_CONTEXT_TERM') {
        // Page-context terms (careers, jobs) are NEUTRAL and do NOT force NOT_RELEVANT
        rawItems.push({
          evidenceId: makeEvidenceId(entity.entityId, 'BUSINESS_NAME_EVIDENCE', field, neg.term),
          evidenceType: 'BUSINESS_NAME_EVIDENCE',
          fieldName: field,
          observedValue: val,
          matchedValue: neg.term,
          matchType: 'TOKEN_MATCH',
          strength: 'WEAK',
          polarity: 'NEUTRAL',
          explanation: neg.explanation,
          sourceProvenance: entityProvenance,
          sourceContributions: getFieldContributions(entity, field, entityProvenance),
          derivedFrom,
          confidence: 'WEAK',
          policyStatus: entityPolicyStatus,
          ruleId: 'PAGE_CONTEXT_TERM',
          queryTerm: normKeyword,
          negationContext: 'PAGE_CONTEXT_TERM'
        });
      } else if (neg.contextType === 'INCIDENTAL_TEXT') {
        // Incidental terms (wholesale, association) evaluated contextually
        rawItems.push({
          evidenceId: makeEvidenceId(entity.entityId, 'NEGATIVE_CATEGORY_EVIDENCE', field, neg.term),
          evidenceType: 'NEGATIVE_CATEGORY_EVIDENCE',
          fieldName: field,
          observedValue: val,
          matchedValue: neg.term,
          matchType: 'NEGATED_MATCH',
          strength: neg.isDecisive ? 'MODERATE' : 'WEAK',
          polarity: neg.isDecisive ? 'NEGATIVE' : 'NEUTRAL',
          explanation: neg.explanation,
          sourceProvenance: entityProvenance,
          sourceContributions: getFieldContributions(entity, field, entityProvenance),
          derivedFrom,
          confidence: 'MODERATE',
          policyStatus: entityPolicyStatus,
          ruleId: 'INCIDENTAL_MODIFIER',
          queryTerm: normKeyword,
          negationContext: 'INCIDENTAL_TEXT'
        });
        if (neg.isDecisive) {
          hasNegativeModifier = true;
        }
      }
    }

    // Match name against query keyword
    if (normVal === normKeyword) {
      hasNameMatch = true;
      rawItems.push({
        evidenceId: makeEvidenceId(entity.entityId, 'BUSINESS_NAME_EVIDENCE', field, val),
        evidenceType: field.startsWith('alias') ? 'ALIAS_EVIDENCE' : 'BUSINESS_NAME_EVIDENCE',
        fieldName: field,
        observedValue: val,
        matchedValue: normKeyword,
        matchType: 'EXACT',
        strength: 'STRONG',
        polarity: 'POSITIVE',
        explanation: `Exact business name match with search keyword "${normKeyword}"`,
        sourceProvenance: entityProvenance,
        sourceContributions: contributions,
        derivedFrom,
        confidence: 'STRONG',
        policyStatus: entityPolicyStatus,
        ruleId: 'NAME_EXACT',
        queryTerm: normKeyword
      });
    } else if (normVal.includes(normKeyword)) {
      hasNameMatch = true;
      rawItems.push({
        evidenceId: makeEvidenceId(entity.entityId, 'BUSINESS_NAME_EVIDENCE', field, val),
        evidenceType: field.startsWith('alias') ? 'ALIAS_EVIDENCE' : 'BUSINESS_NAME_EVIDENCE',
        fieldName: field,
        observedValue: val,
        matchedValue: normKeyword,
        matchType: 'PHRASE_MATCH',
        strength: 'STRONG',
        polarity: 'POSITIVE',
        explanation: `Business name contains complete keyword phrase "${normKeyword}"`,
        sourceProvenance: entityProvenance,
        sourceContributions: contributions,
        derivedFrom,
        confidence: 'STRONG',
        policyStatus: entityPolicyStatus,
        ruleId: 'NAME_PHRASE',
        queryTerm: normKeyword
      });
    } else {
      // Check token match if keyword has multiple tokens
      const valTokens = normVal.split(' ');
      const matchedTokens = keywordTokens.filter(kt => kt.length > 2 && !GENERIC_NAME_STOP_WORDS.has(kt) && valTokens.includes(kt));
      if (matchedTokens.length >= 1) {
        hasNameMatch = true;
        rawItems.push({
          evidenceId: makeEvidenceId(entity.entityId, 'BUSINESS_NAME_EVIDENCE', field, val),
          evidenceType: field.startsWith('alias') ? 'ALIAS_EVIDENCE' : 'BUSINESS_NAME_EVIDENCE',
          fieldName: field,
          observedValue: val,
          matchedValue: matchedTokens.join(' '),
          matchType: 'TOKEN_MATCH',
          strength: matchedTokens.length === keywordTokens.length ? 'STRONG' : 'MODERATE',
          polarity: 'POSITIVE',
          explanation: `Business name contains relevant token(s): "${matchedTokens.join(', ')}"`,
          sourceProvenance: entityProvenance,
          sourceContributions: contributions,
          derivedFrom,
          confidence: matchedTokens.length === keywordTokens.length ? 'STRONG' : 'MODERATE',
          policyStatus: entityPolicyStatus,
          ruleId: 'NAME_TOKENS',
          queryTerm: normKeyword
        });
      }
    }

    // Extract positive service terms from name
    const svcMatches = extractServiceMatches(val, normKeyword);
    for (const sm of svcMatches) {
      serviceMatchesSet.add(sm);
      rawItems.push({
        evidenceId: makeEvidenceId(entity.entityId, 'SERVICE_TERM_EVIDENCE', field, sm),
        evidenceType: 'SERVICE_TERM_EVIDENCE',
        fieldName: field,
        observedValue: val,
        matchedValue: sm,
        matchType: 'SERVICE_MATCH',
        strength: 'STRONG',
        polarity: 'POSITIVE',
        explanation: `Business name explicitly specifies relevant service term: "${sm}"`,
        sourceProvenance: entityProvenance,
        sourceContributions: contributions,
        derivedFrom,
        confidence: 'STRONG',
        policyStatus: entityPolicyStatus,
        ruleId: 'SERVICE_NAME_MATCH',
        queryTerm: normKeyword
      });
    }
  }

  // --------------------------------------------------------------------------
  // 2. CATEGORY EVIDENCE (NORMALIZED & ORIGINAL)
  // --------------------------------------------------------------------------
  const observedCategories = new Set<string>();
  for (const rec of entity.sourceRecords) {
    for (const catEnv of rec.categories || []) {
      if (catEnv.value?.sourceCategory) observedCategories.add(catEnv.value.sourceCategory);
      if (catEnv.value?.normalizedCategory) observedCategories.add(catEnv.value.normalizedCategory);
    }
  }

  const isCategoryUnknown = observedCategories.size === 0 ||
    Array.from(observedCategories).every(c => c.toLowerCase() === 'unknown' || c.toLowerCase() === 'unknown_category');

  let hasObservedCategoryMismatch = false;
  const targetCategoryTerm = intent.normalizedCategory || intent.normalizedKeyword;

  if (!isCategoryUnknown) {
    for (const cat of observedCategories) {
      const catEval = evaluateCategoryMatch(cat, targetCategoryTerm);

      if (catEval.isContradictory) {
        hasCategoryContradiction = true;
        hasObservedCategoryMismatch = true;
        rawItems.push({
          evidenceId: makeEvidenceId(entity.entityId, 'NEGATIVE_CATEGORY_EVIDENCE', 'category', cat),
          evidenceType: 'NEGATIVE_CATEGORY_EVIDENCE',
          fieldName: 'category',
          observedValue: cat,
          matchedValue: targetCategoryTerm,
          matchType: 'CONTRADICTORY_MATCH',
          strength: 'STRONG',
          polarity: 'NEGATIVE',
          explanation: `Observed category "${cat}" is contradictory to target research category "${targetCategoryTerm}"`,
          sourceProvenance: entityProvenance,
          sourceContributions: getFieldContributions(entity, 'categories', entityProvenance),
          derivedFrom,
          confidence: 'STRONG',
          policyStatus: entityPolicyStatus,
          ruleId: 'CAT_CONTRADICTORY',
          queryTerm: targetCategoryTerm
        });
      } else if (catEval.isMatch) {
        hasCategoryMatch = true;
        rawItems.push({
          evidenceId: makeEvidenceId(entity.entityId, 'CATEGORY_EVIDENCE', 'category', cat),
          evidenceType: 'CATEGORY_EVIDENCE',
          fieldName: 'category',
          observedValue: cat,
          matchedValue: targetCategoryTerm,
          matchType: catEval.matchType,
          strength: 'STRONG',
          polarity: 'POSITIVE',
          explanation: `Observed category "${cat}" matches target research category "${targetCategoryTerm}"`,
          sourceProvenance: entityProvenance,
          sourceContributions: getFieldContributions(entity, 'categories', entityProvenance),
          derivedFrom,
          confidence: 'STRONG',
          policyStatus: entityPolicyStatus,
          ruleId: 'CAT_MATCH',
          queryTerm: targetCategoryTerm
        });
      } else if (catEval.isCompatible) {
        hasCategoryCompatible = true;
        rawItems.push({
          evidenceId: makeEvidenceId(entity.entityId, 'CATEGORY_EVIDENCE', 'category', cat),
          evidenceType: 'CATEGORY_EVIDENCE',
          fieldName: 'category',
          observedValue: cat,
          matchedValue: targetCategoryTerm,
          matchType: 'CATEGORY_COMPATIBLE',
          strength: 'MODERATE',
          polarity: 'POSITIVE',
          explanation: `Observed category "${cat}" is compatible with target research domain "${targetCategoryTerm}"`,
          sourceProvenance: entityProvenance,
          sourceContributions: getFieldContributions(entity, 'categories', entityProvenance),
          derivedFrom,
          confidence: 'MODERATE',
          policyStatus: entityPolicyStatus,
          ruleId: 'CAT_COMPATIBLE',
          queryTerm: targetCategoryTerm
        });
      } else {
        // catEval.matchType === 'NO_MATCH'
        // An explicit category was observed and did not match
        hasObservedCategoryMismatch = true;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 3. LOCATION & BRANCH RELEVANCE
  // --------------------------------------------------------------------------
  let locationState: LocationRelevanceState = 'LOCATION_UNKNOWN';

  const targetLoc = intent.normalizedLocation;
  const targetCountry = intent.normalizedCountry;
  const targetRegion = intent.normalizedRegion;

  // Collect location info from source records
  const localities = new Set<string>();
  const regions = new Set<string>();
  const countries = new Set<string>();
  const streets = new Set<string>();

  for (const rec of entity.sourceRecords) {
    const loc = rec.address?.value?.locality?.toLowerCase()?.trim();
    if (loc) localities.add(loc);

    const reg = rec.address?.value?.region?.toLowerCase()?.trim();
    if (reg) regions.add(reg);

    const cc = (rec.address?.value?.countryCode || (rec as any).countryCode || '')?.toUpperCase()?.trim();
    if (cc) countries.add(cc);

    const str = (rec.address?.value?.addressLine1 || (rec.address?.value as any)?.street || '')?.toLowerCase()?.trim();
    if (str) streets.add(str);
  }

  // Also inspect entity.locations array
  for (const locStr of entity.locations || []) {
    localities.add(locStr.toLowerCase().trim());
  }

  const isLocationUnknown = (localities.size === 0 && regions.size === 0 && countries.size === 0);

  if (targetCountry) {
    if (countries.size > 0 && !countries.has(targetCountry)) {
      hasCountryMismatch = true;
      locationState = 'LOCATION_CONTRADICTORY';
      rawItems.push({
        evidenceId: makeEvidenceId(entity.entityId, 'NEGATIVE_LOCATION_EVIDENCE', 'countryCode', [...countries].join(', ')),
        evidenceType: 'NEGATIVE_LOCATION_EVIDENCE',
        fieldName: 'countryCode',
        observedValue: [...countries].join(', '),
        matchedValue: targetCountry,
        matchType: 'CONTRADICTORY_MATCH',
        strength: 'STRONG',
        polarity: 'NEGATIVE',
        explanation: `Country mismatch: business is in ${[...countries].join(', ')}, target is ${targetCountry}`,
        sourceProvenance: entityProvenance,
        sourceContributions: getFieldContributions(entity, 'countryCode', entityProvenance),
        derivedFrom,
        confidence: 'STRONG',
        policyStatus: entityPolicyStatus,
        ruleId: 'LOC_COUNTRY_MISMATCH',
        queryTerm: targetCountry
      });
    }
  }

  if (targetLoc && !hasCountryMismatch) {
    const normTargetLoc = normalizeOntologyString(targetLoc);
    let matchedLocality = false;

    for (const loc of localities) {
      const normLoc = normalizeOntologyString(loc);
      if (normLoc === normTargetLoc || normLoc.includes(normTargetLoc) || normTargetLoc.includes(normLoc)) {
        matchedLocality = true;
        break;
      }
    }

    if (matchedLocality) {
      hasExactLocationMatch = true;
      locationState = 'LOCATION_MATCH';
      rawItems.push({
        evidenceId: makeEvidenceId(entity.entityId, 'LOCALITY_EVIDENCE', 'locality', targetLoc),
        evidenceType: 'LOCALITY_EVIDENCE',
        fieldName: 'locality',
        observedValue: [...localities].join(', '),
        matchedValue: targetLoc,
        matchType: 'LOCATION_EXACT',
        strength: 'STRONG',
        polarity: 'POSITIVE',
        explanation: `Exact target locality match: "${targetLoc}"`,
        sourceProvenance: entityProvenance,
        sourceContributions: getFieldContributions(entity, 'locality', entityProvenance),
        derivedFrom,
        confidence: 'STRONG',
        policyStatus: entityPolicyStatus,
        ruleId: 'LOC_EXACT',
        queryTerm: targetLoc
      });
    } else if (targetRegion && regions.has(targetRegion.toLowerCase())) {
      locationState = 'LOCATION_PARTIAL';
      rawItems.push({
        evidenceId: makeEvidenceId(entity.entityId, 'REGION_EVIDENCE', 'region', targetRegion),
        evidenceType: 'REGION_EVIDENCE',
        fieldName: 'region',
        observedValue: [...regions].join(', '),
        matchedValue: targetRegion,
        matchType: 'LOCATION_COMPONENT_MATCH',
        strength: 'MODERATE',
        polarity: 'POSITIVE',
        explanation: `Matches target region "${targetRegion}", but locality "${targetLoc}" does not match observed localities: "${[...localities].join(', ')}"`,
        sourceProvenance: entityProvenance,
        sourceContributions: getFieldContributions(entity, 'locality', entityProvenance),
        derivedFrom,
        confidence: 'MODERATE',
        policyStatus: entityPolicyStatus,
        ruleId: 'LOC_REGION_PARTIAL',
        queryTerm: targetRegion
      });
    } else if (localities.size > 0) {
      // Has location, but it does NOT match the requested target locality
      locationState = 'LOCATION_MISMATCH';
      rawItems.push({
        evidenceId: makeEvidenceId(entity.entityId, 'NEGATIVE_LOCATION_EVIDENCE', 'locality', [...localities].join(', ')),
        evidenceType: 'NEGATIVE_LOCATION_EVIDENCE',
        fieldName: 'locality',
        observedValue: [...localities].join(', '),
        matchedValue: targetLoc,
        matchType: 'CONTRADICTORY_MATCH',
        strength: intent.strictLocation ? 'STRONG' : 'MODERATE',
        polarity: 'NEGATIVE',
        explanation: `Different physical locality: observed "${[...localities].join(', ')}" vs target "${targetLoc}"`,
        sourceProvenance: entityProvenance,
        sourceContributions: getFieldContributions(entity, 'locality', entityProvenance),
        derivedFrom,
        confidence: 'STRONG',
        policyStatus: entityPolicyStatus,
        ruleId: 'LOC_MISMATCH',
        queryTerm: targetLoc
      });
    } else {
      locationState = 'LOCATION_UNKNOWN';
    }
  } else if (!targetLoc && !hasCountryMismatch) {
    locationState = 'LOCATION_MATCH'; // No target location requested => location neutral/match
  }

  // --------------------------------------------------------------------------
  // 4. WEBSITE EVIDENCE & DOMAIN KEYWORDS
  // --------------------------------------------------------------------------
  for (const dom of entity.domains || []) {
    const normDom = dom.toLowerCase();
    const compactedKw = normKeyword.replace(/\s+/g, '');
    const hasTokenInDomain = keywordTokens.some(kt => kt.length > 3 && !GENERIC_NAME_STOP_WORDS.has(kt) && normDom.includes(kt));
    if ((compactedKw.length > 3 && normDom.includes(compactedKw)) || hasTokenInDomain) {
      rawItems.push({
        evidenceId: makeEvidenceId(entity.entityId, 'WEBSITE_EVIDENCE', 'domain', dom),
        evidenceType: 'WEBSITE_EVIDENCE',
        fieldName: 'canonicalDomain',
        observedValue: dom,
        matchedValue: normKeyword,
        matchType: 'TOKEN_MATCH',
        strength: 'MODERATE',
        polarity: 'POSITIVE',
        explanation: `Canonical domain "${dom}" embeds relevant keyword token(s)`,
        sourceProvenance: entityProvenance,
        sourceContributions: getFieldContributions(entity, 'canonicalDomain', entityProvenance),
        derivedFrom,
        confidence: 'MODERATE',
        policyStatus: entityPolicyStatus,
        ruleId: 'DOMAIN_KEYWORD',
        queryTerm: normKeyword
      });
    }
  }

  // --------------------------------------------------------------------------
  // 5. USER EXCLUSIONS
  // --------------------------------------------------------------------------
  for (const excl of intent.exclusions || []) {
    const normExcl = normalizeOntologyString(excl);
    if (!normExcl) continue;

    const fullEntityText = [
      entity.canonicalDisplayName,
      entity.canonicalComparisonName,
      ...(entity.aliases || []),
      ...(entity.domains || []),
      ...observedCategories
    ].join(' ').toLowerCase();

    if (fullEntityText.includes(normExcl)) {
      rawItems.push({
        evidenceId: makeEvidenceId(entity.entityId, 'CONTRADICTION_EVIDENCE', 'exclusion', excl),
        evidenceType: 'CONTRADICTION_EVIDENCE',
        fieldName: 'userExclusion',
        observedValue: excl,
        matchedValue: excl,
        matchType: 'NEGATED_MATCH',
        strength: 'STRONG',
        polarity: 'NEGATIVE',
        explanation: `Entity matches user-specified exclusion term: "${excl}"`,
        sourceProvenance: entityProvenance,
        sourceContributions: contributions,
        derivedFrom,
        confidence: 'STRONG',
        policyStatus: entityPolicyStatus,
        ruleId: 'USER_EXCLUSION_MATCH',
        queryTerm: excl
      });
    }
  }

  // --------------------------------------------------------------------------
  // 6. DUPLICATE EVIDENCE ANTI-INFLATION (Phase 9 Section 27)
  // --------------------------------------------------------------------------
  const deduplicatedMap = new Map<string, RelevanceEvidenceItem>();
  for (const item of rawItems) {
    if (!deduplicatedMap.has(item.evidenceId)) {
      deduplicatedMap.set(item.evidenceId, item);
    }
  }

  const finalItems = Array.from(deduplicatedMap.values());

  return {
    evidenceItems: finalItems,
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
    serviceMatches: Array.from(serviceMatchesSet)
  };
}
