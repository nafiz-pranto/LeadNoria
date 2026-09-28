/**
 * LeadNoria v1.1 — Evidence Waterfall & Strict Relevance v3 Engine
 *
 * Implements deterministic evidence collection, anti-inflation aggregation,
 * strict decision hierarchy, evidence coverage audit metric, and natural explainability
 * while strictly preserving all Strict Relevance Gate v2 baseline safety invariants.
 *
 * Architecture:
 * RAW ADS
 *   ↓
 * NORMALIZATION
 *   ↓
 * ENTITY RESOLUTION
 *   ↓
 * EVIDENCE COLLECTION (Evidence Waterfall)
 *   ↓
 * STRICT RELEVANCE v3 (Decision Hierarchy)
 *   ↓
 * RELEVANT / UNCERTAIN / REJECTED
 *   ↓
 * FINAL ENTITY
 */

import type {
  ScrapedAdCandidate,
  RelevanceDecision,
  RelevanceConfidence,
  EvidenceStrength,
  EvidenceType,
  EvidenceSource,
  StructuredEvidence,
  EvidenceCoverage,
  EvidenceCoverageLevel,
  StrictV3Decision,
  UncertainEntityRecord,
  ExtensionLead,
  WebsiteVerificationRecord
} from './types.ts';
import {
  LeadRelevanceEngine,
  type ResearchIntent,
  type CandidateEvidence,
  type NormalizedEvidence,
  normalizeEvidence,
  BOUNDED_TAXONOMY,
  NEGATIVE_CATEGORIES,
  tokenizeText,
  stemToken
} from './relevanceEngine.ts';

export const RELEVANCE_ENGINE_VERSION_V3 = 'strict-v3';
export const RELEVANCE_STRATEGY_VERSION_V3 = 3;

/**
 * Standard commercial intent indicator phrases
 */
const COMMERCIAL_CTA_PHRASES = new Set([
  'shop now', 'buy now', 'order now', 'get quote', 'contact us',
  'order', 'book now', 'sign up', 'apply now', 'request quote',
  'call now', 'schedule now', 'get offer', 'claim offer'
]);

const COMMERCIAL_COPY_REGEX = /(price|discount|sale|off|taka|bdt|usd|\$|€|£|warranty|deal|buy|shop|order|quote|booking|free consultation|special offer|flat \d+%|starts at|affordable)/i;

/**
 * Deterministic hash/signature for evidence deduplication and anti-inflation
 */
export function createEvidenceSignature(
  type: EvidenceType,
  source: EvidenceSource,
  strength: EvidenceStrength,
  value: string
): string {
  const normVal = (value || '').toLowerCase().trim().replace(/\s+/g, ' ');
  return `${type}::${source}::${strength}::${normVal}`;
}

/**
 * Structured container for entity-level accumulated evidence
 */
export interface EntityEvidenceProfile {
  entityKey: string;
  advertiserName: string;
  canonicalName: string;
  uniqueEvidenceMap: Map<string, StructuredEvidence>;
  observedEvidenceOccurrences: number;
  distinctAdCopyHashes: Set<string>;
  distinctAdCount: number;
  matchedQueries: Set<string>;
  observedDomains: Set<string>;
  observedPages: Set<string>;
  observedDestinationUrls: Set<string>;
  conflicts: StructuredEvidence[];
  negativeSignals: string[];
}

/**
 * Initializes a clean entity evidence profile
 */
export function createEntityEvidenceProfile(
  entityKey: string,
  advertiserName: string,
  canonicalName?: string
): EntityEvidenceProfile {
  return {
    entityKey,
    advertiserName,
    canonicalName: canonicalName || advertiserName,
    uniqueEvidenceMap: new Map(),
    observedEvidenceOccurrences: 0,
    distinctAdCopyHashes: new Set(),
    distinctAdCount: 0,
    matchedQueries: new Set(),
    observedDomains: new Set(),
    observedPages: new Set(),
    observedDestinationUrls: new Set(),
    conflicts: [],
    negativeSignals: []
  };
}

/**
 * Collects structured evidence items from candidate ad data.
 * Pure deterministic rule-based evaluation.
 */
export function collectEvidenceWaterfall(
  evidence: CandidateEvidence,
  intent: ResearchIntent
): {
  evidenceList: StructuredEvidence[];
  conflicts: StructuredEvidence[];
  negativeSignals: string[];
} {
  const evidenceList: StructuredEvidence[] = [];
  const conflicts: StructuredEvidence[] = [];
  const negativeSignals: string[] = [];

  const normalized = normalizeEvidence(evidence);

  // Compile active queries
  const allQueryPhrases: string[] = [];
  if (evidence.query) allQueryPhrases.push(evidence.query.toLowerCase().trim());
  if (evidence.matchedKeyword) allQueryPhrases.push(evidence.matchedKeyword.toLowerCase().trim());
  if (intent.primaryKeywords) {
    for (const kw of intent.primaryKeywords) {
      const l = kw.toLowerCase().trim();
      if (!allQueryPhrases.includes(l)) allQueryPhrases.push(l);
    }
  }

  // Active taxonomy lookup
  const activeTaxonomies = [];
  for (const [key, tax] of Object.entries(BOUNDED_TAXONOMY)) {
    if (
      allQueryPhrases.some(phrase =>
        phrase.includes(key) ||
        tax.rootTerms.some(rt => phrase.includes(rt))
      )
    ) {
      activeTaxonomies.push(tax);
    }
  }

  // Dynamic fallback taxonomy if no match
  if (activeTaxonomies.length === 0 && allQueryPhrases.length > 0) {
    const dynamicRoots: string[] = [];
    const dynamicStems: string[] = [];
    for (const phrase of allQueryPhrases) {
      dynamicRoots.push(phrase);
      for (const tok of tokenizeText(phrase)) {
        dynamicStems.push(tok);
      }
    }
    activeTaxonomies.push({
      category: allQueryPhrases[0],
      rootTerms: Array.from(new Set(dynamicRoots)),
      productServiceTerms: Array.from(new Set(dynamicStems)),
      industryDescriptors: allQueryPhrases,
      conflictingCategories: ['sports', 'healthcare', 'politics', 'gaming', 'casino']
    });
  }

  const coreQueryTokens = new Set<string>();
  for (const phrase of allQueryPhrases) {
    for (const t of tokenizeText(phrase)) {
      coreQueryTokens.add(t);
    }
  }
  for (const tax of activeTaxonomies) {
    for (const rt of tax.rootTerms) {
      for (const t of tokenizeText(rt)) {
        coreQueryTokens.add(t);
      }
    }
  }

  const productTerms = new Set<string>();
  for (const tax of activeTaxonomies) {
    for (const t of tax.productServiceTerms) {
      productTerms.add(stemToken(t));
    }
  }

  // -------------------------------------------------------------
  // 1. CONFLICTS & CONTRADICTIONS (Negative signals override)
  // -------------------------------------------------------------
  // Preset Exclusions
  if (intent.exclusions && intent.exclusions.length > 0) {
    for (const excl of intent.exclusions) {
      const exclLower = excl.toLowerCase();
      if (
        normalized.advertiserText.includes(exclLower) ||
        normalized.adCopyText.includes(exclLower) ||
        normalized.normalizedDomain.includes(exclLower)
      ) {
        const reason = `Matched preset exclusion rule: "${excl}"`;
        negativeSignals.push(reason);
        conflicts.push({
          type: 'CONTRADICTION',
          strength: 'STRONG',
          source: 'advertiser_name',
          reason,
          matchedSignal: excl,
          reasonCode: 'REJECT_PRESET_EXCLUSION',
          value: excl,
          explanation: `Candidate matches explicit preset exclusion rule: ${excl}`,
          signature: createEvidenceSignature('CONTRADICTION', 'advertiser_name', 'STRONG', excl)
        });
        break;
      }
    }
  }

  // Cross-Domain Negative Categories
  for (const negCat of NEGATIVE_CATEGORIES) {
    const isQueryRelatedToNegCat = allQueryPhrases.some(q =>
      negCat.terms.some(t => q.includes(t)) ||
      q.includes(negCat.category) ||
      (negCat.category === 'sports' && (q.includes('football') || q.includes('cricket') || q.includes('sports')))
    );
    if (isQueryRelatedToNegCat) continue;

    // Entity identity contradiction in name or domain
    let entityContradictionTerm: string | undefined;
    for (const term of negCat.terms) {
      if (normalized.advertiserText.includes(term) || normalized.normalizedDomain.includes(term.replace(/\s+/g, ''))) {
        entityContradictionTerm = term;
        break;
      }
    }

    if (entityContradictionTerm) {
      const reason = `Advertiser entity identity belongs to unrelated category (${negCat.category}): "${entityContradictionTerm}"`;
      negativeSignals.push(reason);
      conflicts.push({
        type: 'CONTRADICTION',
        strength: 'STRONG',
        source: 'advertiser_name',
        reason,
        matchedSignal: entityContradictionTerm,
        reasonCode: 'REJECT_CONTRADICTION_IDENTITY',
        value: entityContradictionTerm,
        explanation: `Advertiser belongs to conflicting ${negCat.category} vertical`,
        signature: createEvidenceSignature('CONTRADICTION', 'advertiser_name', 'STRONG', entityContradictionTerm)
      });
      continue;
    }

    // Negative terms in ad copy or domain
    for (const term of negCat.terms) {
      if (
        normalized.adCopyText.includes(term) ||
        normalized.normalizedDomain.includes(term.replace(/\s+/g, ''))
      ) {
        const reason = `Unrelated ${negCat.category} signal detected in candidate ad context: "${term}"`;
        negativeSignals.push(reason);
        conflicts.push({
          type: 'NEGATIVE_CATEGORY',
          strength: 'STRONG',
          source: 'ad_text',
          reason,
          matchedSignal: term,
          reasonCode: 'REJECT_CONFLICT',
          value: term,
          explanation: `Context contains conflicting ${negCat.category} terms`,
          signature: createEvidenceSignature('NEGATIVE_CATEGORY', 'ad_text', 'STRONG', term)
        });
        break;
      }
    }
  }

  // -------------------------------------------------------------
  // 2. ENTITY IDENTITY EVIDENCE
  // -------------------------------------------------------------
  let strongNameFound = false;
  for (const phrase of allQueryPhrases) {
    if (normalized.advertiserText.includes(phrase)) {
      strongNameFound = true;
      evidenceList.push({
        type: 'ENTITY_IDENTITY',
        strength: 'STRONG',
        source: 'advertiser_name',
        reason: `Advertiser name explicitly contains target category query "${phrase}"`,
        matchedSignal: phrase,
        reasonCode: 'SIGNAL_ENTITY_NAME_EXACT',
        value: phrase,
        explanation: `Business name explicitly specifies target category: ${phrase}`,
        signature: createEvidenceSignature('ENTITY_IDENTITY', 'advertiser_name', 'STRONG', phrase)
      });
      break;
    }
  }

  if (!strongNameFound) {
    const matchedTokensInName = normalized.normalizedAdvertiserTokens.filter(t => coreQueryTokens.has(t));
    if (matchedTokensInName.length > 0) {
      strongNameFound = true;
      const val = matchedTokensInName.join(', ');
      evidenceList.push({
        type: 'ENTITY_IDENTITY',
        strength: 'STRONG',
        source: 'advertiser_name',
        reason: `Advertiser name contains core target keyword stem(s): ${val}`,
        matchedSignal: val,
        reasonCode: 'SIGNAL_ENTITY_NAME_CORE',
        value: val,
        explanation: `Business name contains core keyword stem(s): ${val}`,
        signature: createEvidenceSignature('ENTITY_IDENTITY', 'advertiser_name', 'STRONG', val)
      });
    } else {
      const productTokensInName = normalized.normalizedAdvertiserTokens.filter(t => productTerms.has(t));
      const matchedSubstringProduct = Array.from(productTerms).filter(
        pt => pt.length >= 4 && normalized.advertiserText.includes(pt)
      );
      const combined = Array.from(new Set([...productTokensInName, ...matchedSubstringProduct]));
      if (combined.length > 0) {
        const val = combined.join(', ');
        evidenceList.push({
          type: 'ENTITY_IDENTITY',
          strength: 'MODERATE',
          source: 'advertiser_name',
          reason: `Advertiser name contains target product term(s): ${val}`,
          matchedSignal: val,
          reasonCode: 'SIGNAL_ENTITY_NAME_PRODUCT',
          value: val,
          explanation: `Business name contains relevant product or service terms: ${val}`,
          signature: createEvidenceSignature('ENTITY_IDENTITY', 'advertiser_name', 'MODERATE', val)
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 3. DESTINATION MATCH & DOMAIN SIGNAL
  // -------------------------------------------------------------
  if (normalized.normalizedDomain) {
    const domainHasQuery = allQueryPhrases.some(p =>
      normalized.normalizedDomain.includes(p.replace(/\s+/g, ''))
    );
    const domainHasProduct = Array.from(productTerms).some(t =>
      t.length >= 4 && normalized.normalizedDomain.includes(t)
    );

    if (domainHasQuery) {
      evidenceList.push({
        type: 'DESTINATION_MATCH',
        strength: 'STRONG',
        source: 'destination_domain',
        reason: `Destination domain "${normalized.normalizedDomain}" explicitly contains target query`,
        matchedSignal: normalized.normalizedDomain,
        reasonCode: 'SIGNAL_DOMAIN_QUERY_EXACT',
        value: normalized.normalizedDomain,
        explanation: `Destination website domain matches target query`,
        signature: createEvidenceSignature('DESTINATION_MATCH', 'destination_domain', 'STRONG', normalized.normalizedDomain)
      });
    } else if (domainHasProduct) {
      evidenceList.push({
        type: 'DOMAIN_SIGNAL',
        strength: 'MODERATE',
        source: 'destination_domain',
        reason: `Destination domain "${normalized.normalizedDomain}" contains category product term`,
        matchedSignal: normalized.normalizedDomain,
        reasonCode: 'SIGNAL_DOMAIN_PRODUCT',
        value: normalized.normalizedDomain,
        explanation: `Destination website domain includes category product term`,
        signature: createEvidenceSignature('DOMAIN_SIGNAL', 'destination_domain', 'MODERATE', normalized.normalizedDomain)
      });
    }
  }

  // -------------------------------------------------------------
  // 4. FACEBOOK PAGE SIGNAL
  // -------------------------------------------------------------
  if (evidence.facebookPageUrl) {
    const pageUrlLower = evidence.facebookPageUrl.toLowerCase();
    const pageHasQuery = allQueryPhrases.some(p => pageUrlLower.includes(p.replace(/\s+/g, '')));
    if (pageHasQuery) {
      evidenceList.push({
        type: 'FACEBOOK_PAGE_SIGNAL',
        strength: 'MODERATE',
        source: 'facebook_page',
        reason: `Facebook Page handle/URL reinforces target category identity`,
        matchedSignal: evidence.facebookPageUrl,
        reasonCode: 'SIGNAL_PAGE_HANDLE',
        value: evidence.facebookPageUrl,
        explanation: `Facebook page handle reinforces category identity`,
        signature: createEvidenceSignature('FACEBOOK_PAGE_SIGNAL', 'facebook_page', 'MODERATE', evidence.facebookPageUrl)
      });
    }
  }

  // -------------------------------------------------------------
  // 5. CATEGORY MATCH & PRODUCT/SERVICE SIGNALS (Ad Copy)
  // -------------------------------------------------------------
  let adCopyMatchedPhrase = false;
  for (const phrase of allQueryPhrases) {
    if (normalized.adCopyText.includes(phrase)) {
      adCopyMatchedPhrase = true;
      evidenceList.push({
        type: 'CATEGORY_MATCH',
        strength: 'MODERATE',
        source: 'ad_text',
        reason: `Ad copy directly mentions target query "${phrase}"`,
        matchedSignal: phrase,
        reasonCode: 'SIGNAL_COPY_PHRASE',
        value: phrase,
        explanation: `Ad copy explicitly mentions target query phrase`,
        signature: createEvidenceSignature('CATEGORY_MATCH', 'ad_text', 'MODERATE', phrase)
      });
      break;
    }
  }

  const foundProductTermsInCopy = Array.from(productTerms).filter(t =>
    normalized.normalizedAdTextTokens.includes(t) ||
    (t.length >= 4 && normalized.adCopyText.includes(t))
  );

  if (foundProductTermsInCopy.length > 0) {
    const sampleTerms = foundProductTermsInCopy.slice(0, 5);
    const val = sampleTerms.join(', ');

    if (foundProductTermsInCopy.length >= 2) {
      evidenceList.push({
        type: 'PRODUCT_OR_SERVICE_SIGNAL',
        strength: 'STRONG',
        source: 'ad_text',
        reason: `Ad copy contains specific category product catalog: ${val}`,
        matchedSignal: val,
        reasonCode: 'SIGNAL_COPY_PRODUCT_CATALOG',
        value: val,
        explanation: `Ad offers multiple distinct category products: ${val}`,
        signature: createEvidenceSignature('PRODUCT_OR_SERVICE_SIGNAL', 'ad_text', 'STRONG', val)
      });
    } else {
      evidenceList.push({
        type: 'PRODUCT_OR_SERVICE_SIGNAL',
        strength: 'WEAK',
        source: 'ad_text',
        reason: `Ad copy mentions category product term: ${sampleTerms[0]}`,
        matchedSignal: sampleTerms[0],
        reasonCode: 'SIGNAL_COPY_SINGLE_PRODUCT',
        value: sampleTerms[0],
        explanation: `Ad mentions category product: ${sampleTerms[0]}`,
        signature: createEvidenceSignature('PRODUCT_OR_SERVICE_SIGNAL', 'ad_text', 'WEAK', sampleTerms[0])
      });
    }
  } else if (!adCopyMatchedPhrase) {
    const matchedTokensInCopy = normalized.normalizedAdTextTokens.filter(t => coreQueryTokens.has(t));
    if (matchedTokensInCopy.length > 0) {
      const val = matchedTokensInCopy.join(', ');
      evidenceList.push({
        type: 'CATEGORY_MATCH',
        strength: 'WEAK',
        source: 'ad_text',
        reason: `Ad copy mentions keyword stem(s): ${val}`,
        matchedSignal: val,
        reasonCode: 'SIGNAL_COPY_STEM_ONLY',
        value: val,
        explanation: `Ad copy only contains isolated keyword stem`,
        signature: createEvidenceSignature('CATEGORY_MATCH', 'ad_text', 'WEAK', val)
      });
    }
  }

  // Destination URL slug
  if (normalized.normalizedUrlSlug) {
    const slugHasProduct = Array.from(productTerms).some(t =>
      t.length >= 4 && normalized.normalizedUrlSlug.includes(t)
    );
    const slugHasQuery = Array.from(coreQueryTokens).some(t =>
      normalized.normalizedUrlSlug.includes(t)
    );
    if (slugHasProduct || slugHasQuery) {
      evidenceList.push({
        type: 'DESTINATION_MATCH',
        strength: 'MODERATE',
        source: 'destination_url',
        reason: `Destination URL path contains target product category context`,
        matchedSignal: normalized.normalizedUrlSlug.substring(0, 50),
        reasonCode: 'SIGNAL_URL_SLUG_MATCH',
        value: normalized.normalizedUrlSlug.substring(0, 50),
        explanation: `Destination URL path contains target category terms`,
        signature: createEvidenceSignature('DESTINATION_MATCH', 'destination_url', 'MODERATE', normalized.normalizedUrlSlug.substring(0, 30))
      });
    }
  }

  // -------------------------------------------------------------
  // 6. COMMERCIAL INTENT EVIDENCE
  // -------------------------------------------------------------
  const ctaLower = (evidence.ctaText || '').toLowerCase().trim();
  if (COMMERCIAL_CTA_PHRASES.has(ctaLower)) {
    evidenceList.push({
      type: 'COMMERCIAL_INTENT',
      strength: 'MODERATE',
      source: 'cta_text',
      reason: `Commercial action call-to-action ("${evidence.ctaText}")`,
      matchedSignal: evidence.ctaText,
      reasonCode: 'SIGNAL_COMMERCIAL_INTENT_CTA',
      value: evidence.ctaText,
      explanation: `Commercial call-to-action detected: ${evidence.ctaText}`,
      signature: createEvidenceSignature('COMMERCIAL_INTENT', 'cta_text', 'MODERATE', ctaLower)
    });
  }

  if (COMMERCIAL_COPY_REGEX.test(normalized.adCopyText)) {
    evidenceList.push({
      type: 'COMMERCIAL_INTENT',
      strength: 'MODERATE',
      source: 'ad_text',
      reason: `Commercial pricing, transaction, or sale language observed in ad copy`,
      reasonCode: 'SIGNAL_COMMERCIAL_INTENT_PRICE',
      value: 'pricing_or_offer_terms',
      explanation: `Commercial pricing, discount, or offer terms found in ad copy`,
      signature: createEvidenceSignature('COMMERCIAL_INTENT', 'ad_text', 'MODERATE', 'pricing_or_offer_terms')
    });
  }

  // -------------------------------------------------------------
  // 7. QUERY CONTEXT
  // -------------------------------------------------------------
  if (evidence.matchedKeyword || evidence.query) {
    const q = (evidence.matchedKeyword || evidence.query || '').trim();
    evidenceList.push({
      type: 'QUERY_CONTEXT',
      strength: 'WEAK',
      source: 'matched_query',
      reason: `Discovered under query "${q}"`,
      matchedSignal: q,
      reasonCode: 'SIGNAL_QUERY_PROVENANCE',
      value: q,
      explanation: `Candidate surfaced by query: ${q}`,
      signature: createEvidenceSignature('QUERY_CONTEXT', 'matched_query', 'WEAK', q.toLowerCase())
    });
  }

  return { evidenceList, conflicts, negativeSignals };
}

/**
 * Calculates evidence coverage for an entity.
 * Audit metric: applicableCategoriesPresent / applicableCategoriesTotal
 */
export function calculateEvidenceCoverage(evidenceItems: StructuredEvidence[]): EvidenceCoverage {
  // Applicable core evidence categories for relevance evaluation
  const APPLICABLE_CATEGORIES: EvidenceType[] = [
    'ENTITY_IDENTITY',
    'CATEGORY_MATCH',
    'COMMERCIAL_INTENT',
    'PRODUCT_OR_SERVICE_SIGNAL',
    'DESTINATION_MATCH',
    'FACEBOOK_PAGE_SIGNAL',
    'DOMAIN_SIGNAL'
  ];

  const presentCategories = Array.from(
    new Set(evidenceItems.map(e => e.type).filter(t => APPLICABLE_CATEGORIES.includes(t)))
  );

  const missingCategories = APPLICABLE_CATEGORIES.filter(c => !presentCategories.includes(c));
  const applicableCategoriesPresent = presentCategories.length;
  const applicableCategoriesTotal = APPLICABLE_CATEGORIES.length;
  const coverageRatio = Math.round((applicableCategoriesPresent / applicableCategoriesTotal) * 100) / 100;

  let coverageLevel: EvidenceCoverageLevel = 'LOW';
  if (applicableCategoriesPresent >= 4) {
    coverageLevel = 'HIGH';
  } else if (applicableCategoriesPresent >= 2) {
    coverageLevel = 'MEDIUM';
  }

  return {
    applicableCategoriesPresent,
    applicableCategoriesTotal,
    coverageRatio,
    coverageLevel,
    presentCategories,
    missingCategories
  };
}

/**
 * Merges a candidate's evidence into an entity's profile with anti-inflation collapse.
 */
export function recordCandidateEvidenceInProfile(
  profile: EntityEvidenceProfile,
  evidence: CandidateEvidence,
  intent: ResearchIntent
): void {
  const { evidenceList, conflicts, negativeSignals } = collectEvidenceWaterfall(evidence, intent);

  // Accumulate conflicts and negative signals
  for (const c of conflicts) {
    if (!profile.conflicts.some(ex => ex.signature === c.signature)) {
      profile.conflicts.push(c);
    }
  }
  for (const sig of negativeSignals) {
    if (!profile.negativeSignals.includes(sig)) {
      profile.negativeSignals.push(sig);
    }
  }

  // Ad copy deduplication to prevent repeated copy from inflating counts
  const copyNormalized = (evidence.adText || '').toLowerCase().trim().replace(/\s+/g, ' ').substring(0, 120);
  if (copyNormalized) {
    profile.distinctAdCopyHashes.add(copyNormalized);
  }
  profile.distinctAdCount++;

  // Metadata provenance
  if (evidence.matchedKeyword) profile.matchedQueries.add(evidence.matchedKeyword);
  if (evidence.query) profile.matchedQueries.add(evidence.query);
  if (evidence.destinationDomain) profile.observedDomains.add(evidence.destinationDomain);
  if (evidence.destinationUrl) profile.observedDestinationUrls.add(evidence.destinationUrl);
  if (evidence.facebookPageUrl) profile.observedPages.add(evidence.facebookPageUrl);

  // Evidence anti-inflation aggregation
  for (const item of evidenceList) {
    profile.observedEvidenceOccurrences++;
    const sig = item.signature || createEvidenceSignature(item.type, item.source, item.strength, item.value || item.reason);

    const existing = profile.uniqueEvidenceMap.get(sig);
    if (existing) {
      existing.occurrenceCount = (existing.occurrenceCount || 1) + 1;
    } else {
      profile.uniqueEvidenceMap.set(sig, {
        ...item,
        signature: sig,
        occurrenceCount: 1
      });
    }
  }
}

/**
 * Deterministic Decision Hierarchy (Strict Relevance v3):
 *
 * 1. HARD CONTRADICTION -> REJECT (conflicting category, preset exclusion)
 * 2. STRONG ENTITY + STRONG/MODERATE CATEGORY -> RELEVANT
 * 3. STRONG CATEGORY + COMMERCIAL INTENT -> RELEVANT
 * 4. WEAK KEYWORD-ONLY (single keyword mention without identity or product corroboration) -> REJECT or UNCERTAIN
 * 5. MODERATE EVIDENCE WITHOUT CONTRADICTION (commercial or product signal without entity confirmation) -> UNCERTAIN
 * 6. MISSING CRITICAL EVIDENCE -> UNCERTAIN
 */
export function evaluateStrictRelevanceV3(
  candidateOrProfile: CandidateEvidence | EntityEvidenceProfile,
  intent: ResearchIntent
): StrictV3Decision {
  // If candidate given directly, construct a single-item profile
  let profile: EntityEvidenceProfile;
  if ('uniqueEvidenceMap' in candidateOrProfile) {
    profile = candidateOrProfile;
  } else {
    profile = createEntityEvidenceProfile('cand', candidateOrProfile.advertiserName);
    recordCandidateEvidenceInProfile(profile, candidateOrProfile, intent);
  }

  // Also obtain baseline v2 evaluation for strict compatibility verification
  const candEvidence: CandidateEvidence = {
    advertiserName: profile.advertiserName,
    adText: Array.from(profile.distinctAdCopyHashes).join(' '),
    destinationDomain: Array.from(profile.observedDomains)[0],
    destinationUrl: Array.from(profile.observedDestinationUrls)[0],
    facebookPageUrl: Array.from(profile.observedPages)[0],
    matchedKeyword: Array.from(profile.matchedQueries)[0]
  };
  const v2Eval = LeadRelevanceEngine.evaluateCandidate(candEvidence, intent);

  const evidenceItems = Array.from(profile.uniqueEvidenceMap.values());
  const coverage = calculateEvidenceCoverage(evidenceItems);

  // Check specific evidence signals
  const hasHardContradiction = profile.conflicts.some(
    c => (c.type === 'CONTRADICTION' || c.type === 'NEGATIVE_CATEGORY') && c.strength === 'STRONG'
  ) || v2Eval.conflicts.some(c => c.type === 'CONTRADICTION' && c.strength === 'STRONG');

  const strongEntity = evidenceItems.some(
    e => e.type === 'ENTITY_IDENTITY' && e.strength === 'STRONG'
  );
  const moderateEntity = evidenceItems.some(
    e => e.type === 'ENTITY_IDENTITY' && e.strength === 'MODERATE'
  );
  const strongCategory = evidenceItems.some(
    e => (e.type === 'CATEGORY_MATCH' || e.type === 'PRODUCT_OR_SERVICE_SIGNAL') && e.strength === 'STRONG'
  );
  const moderateCategory = evidenceItems.some(
    e => (e.type === 'CATEGORY_MATCH' || e.type === 'PRODUCT_OR_SERVICE_SIGNAL') && e.strength === 'MODERATE'
  );
  const weakCategory = evidenceItems.some(
    e => e.type === 'CATEGORY_MATCH' && e.strength === 'WEAK'
  );
  const commercialIntent = evidenceItems.some(
    e => e.type === 'COMMERCIAL_INTENT'
  );
  const strongDestination = evidenceItems.some(
    e => e.type === 'DESTINATION_MATCH' && e.strength === 'STRONG'
  );
  const moderateDestination = evidenceItems.some(
    e => (e.type === 'DESTINATION_MATCH' || e.type === 'DOMAIN_SIGNAL') && e.strength === 'MODERATE'
  );

  let decision: RelevanceDecision = 'UNCERTAIN';
  let confidence: RelevanceConfidence = 'LOW';
  let reasonCode = 'UNCERTAIN_AMBIGUOUS_ENTITY';
  let explanation = '';
  const reasons: string[] = [];

  // =============================================================
  // TIER 1: HARD CONTRADICTION -> REJECT
  // =============================================================
  if (hasHardContradiction) {
    decision = 'NOT_RELEVANT';
    confidence = 'HIGH';
    reasonCode = profile.conflicts[0]?.reasonCode || v2Eval.reasonCode || 'REJECT_CONTRADICTION_IDENTITY';
    const conflictDesc = profile.negativeSignals[0] || v2Eval.negativeSignals[0] || 'Entity conflicts with requested category';
    reasons.push(`Disqualified by Hard Contradiction Gate: ${conflictDesc}`);
    explanation = `Advertiser entity conflicts with target category: ${conflictDesc}`;

    return {
      decision,
      confidence,
      score: 0.05,
      reasons,
      matchedKeywords: v2Eval.matchedKeywords,
      matchedTerms: v2Eval.matchedTerms,
      negativeSignals: profile.negativeSignals.length > 0 ? profile.negativeSignals : v2Eval.negativeSignals,
      evidence: evidenceItems,
      conflicts: profile.conflicts.length > 0 ? profile.conflicts : v2Eval.conflicts,
      evidenceCoverage: coverage,
      uniqueEvidenceSignals: evidenceItems.length,
      observedEvidenceOccurrences: profile.observedEvidenceOccurrences,
      explanation,
      reasonCode,
      strategyVersion: RELEVANCE_STRATEGY_VERSION_V3,
      engineVersion: RELEVANCE_ENGINE_VERSION_V3,
      presetVersion: intent.presetVersion
    };
  }

  // =============================================================
  // TIER 2: STRONG ENTITY + SUPPORTING CATEGORY / COMMERCIAL -> RELEVANT
  // =============================================================
  if (strongEntity && (moderateCategory || strongCategory || commercialIntent || strongDestination || moderateDestination)) {
    decision = 'RELEVANT';
    confidence = (strongCategory || commercialIntent || coverage.coverageLevel === 'HIGH') ? 'HIGH' : 'MEDIUM';
    reasonCode = 'ACCEPT_STRONG_ENTITY_MATCH';
    reasons.push('Advertiser is confirmed as target business entity with supporting product/commercial evidence.');
    explanation = `Advertiser is identified as a ${intent.primaryKeywords?.[0] || 'target'} business with supporting category evidence.`;
  }
  // =============================================================
  // TIER 3: STRONG CATEGORY (Catalog) + COMMERCIAL INTENT -> RELEVANT
  // =============================================================
  else if (strongCategory && (commercialIntent || strongDestination || moderateDestination || moderateEntity)) {
    decision = 'RELEVANT';
    confidence = (commercialIntent && (strongDestination || moderateDestination)) ? 'HIGH' : 'MEDIUM';
    reasonCode = 'ACCEPT_MULTI_SIGNAL_MATCH';
    reasons.push('Verified product/service catalog with corroborating commercial intent.');
    explanation = `Explicit product catalog and commercial intent confirm active business in target vertical.`;
  }
  // =============================================================
  // TIER 4: MODERATE ENTITY + MODERATE CATEGORY -> RELEVANT
  // =============================================================
  else if (moderateEntity && (moderateCategory || strongDestination || (commercialIntent && weakCategory))) {
    decision = 'RELEVANT';
    confidence = 'MEDIUM';
    reasonCode = 'ACCEPT_MULTI_SIGNAL_MATCH';
    reasons.push('Entity product terms corroborated by destination or commercial evidence.');
    explanation = `Entity product branding corroborated by category match.`;
  }
  // =============================================================
  // TIER 5: KEYWORD-ONLY PROTECTION (Single keyword in copy, no identity) -> REJECT or UNCERTAIN
  // =============================================================
  else if (!strongEntity && !moderateEntity && !strongDestination && !moderateDestination && !strongCategory) {
    if (weakCategory || moderateCategory) {
      if (v2Eval.score < 0.18) {
        decision = 'NOT_RELEVANT';
        confidence = 'HIGH';
        reasonCode = 'REJECT_INSUFFICIENT_EVIDENCE';
        reasons.push('Keyword appears in passing but entity has zero commercial or vertical corroboration.');
        explanation = `Keyword appears in ad context, but advertiser lacks verified vertical identity.`;
      } else {
        decision = 'UNCERTAIN';
        confidence = 'LOW';
        reasonCode = 'UNCERTAIN_KEYWORD_ONLY';
        reasons.push('Candidate mentions keyword but lacks independent business or product catalog evidence.');
        explanation = `Keyword mention detected, but advertiser business vertical is unverified.`;
      }
    } else {
      decision = 'NOT_RELEVANT';
      confidence = 'HIGH';
      reasonCode = 'REJECT_CATEGORY_MISMATCH';
      reasons.push('Zero target category or commercial signals found.');
      explanation = `No entity identity, category, or commercial evidence observed for requested vertical.`;
    }
  }
  // =============================================================
  // TIER 6: MISSING CRITICAL EVIDENCE / AMBIGUOUS -> UNCERTAIN
  // =============================================================
  else {
    decision = 'UNCERTAIN';
    confidence = 'LOW';
    reasonCode = 'UNCERTAIN_AMBIGUOUS_ENTITY';
    reasons.push('Candidate has partial signals but missing critical category or entity verification.');
    explanation = `Commercial advertiser detected, but vertical identity evidence is incomplete.`;
  }

  // Strict v2 compatibility safety lock:
  // If v2 rejects an entity due to score < 0.22, preserve rejection
  if (v2Eval.decision === 'NOT_RELEVANT' && decision === 'RELEVANT') {
    decision = 'NOT_RELEVANT';
    confidence = v2Eval.confidence;
    reasonCode = v2Eval.reasonCode;
    reasons.unshift(`Strict-v2 safety lock: ${v2Eval.reasons[0] || 'Score insufficient'}`);
  }

  const finalScore = Math.max(v2Eval.score, decision === 'RELEVANT' ? 0.65 : decision === 'UNCERTAIN' ? 0.35 : 0.10);

  return {
    decision,
    confidence,
    score: Math.round(finalScore * 100) / 100,
    reasons: [...reasons, ...v2Eval.reasons],
    matchedKeywords: v2Eval.matchedKeywords,
    matchedTerms: v2Eval.matchedTerms,
    negativeSignals: v2Eval.negativeSignals,
    evidence: evidenceItems,
    conflicts: profile.conflicts,
    evidenceCoverage: coverage,
    uniqueEvidenceSignals: evidenceItems.length,
    observedEvidenceOccurrences: profile.observedEvidenceOccurrences,
    explanation,
    reasonCode,
    strategyVersion: RELEVANCE_STRATEGY_VERSION_V3,
    engineVersion: RELEVANCE_ENGINE_VERSION_V3,
    presetVersion: intent.presetVersion
  };
}

/**
 * Builds an auditable UNCERTAIN record for internal persistence (Section 16).
 */
export function buildUncertainRecord(
  entityKey: string,
  profile: EntityEvidenceProfile,
  v3Decision: StrictV3Decision
): UncertainEntityRecord {
  const now = new Date().toISOString();
  return {
    entityId: `uncertain_${entityKey}`,
    entityKey,
    canonicalName: profile.canonicalName,
    observedNames: [profile.advertiserName, profile.canonicalName],
    advertiserName: profile.advertiserName,
    matchedQueries: Array.from(profile.matchedQueries),
    identityConfidence: 'WEAK',
    evidenceItems: v3Decision.evidence,
    evidence: v3Decision.evidence,
    missingEvidence: v3Decision.evidenceCoverage.missingCategories.map(c => `MISSING_${c}`),
    reasonCodes: [v3Decision.reasonCode],
    primaryReasonCode: v3Decision.reasonCode,
    reasonCode: v3Decision.reasonCode,
    uncertainReasonCodes: [v3Decision.reasonCode],
    reasons: v3Decision.reasons,
    observedAdIds: Array.from(profile.distinctAdCopyHashes),
    observedDomains: Array.from(profile.observedDomains),
    timestamps: {
      firstDiscovered: now,
      lastEvaluated: now
    },
    queryProvenance: Array.from(profile.matchedQueries),
    evidenceCoverage: v3Decision.evidenceCoverage,
    recordedAt: now,
    decision: 'UNCERTAIN',
    confidence: v3Decision.confidence,
    lastEvaluationState: {
      score: v3Decision.score,
      decision: 'UNCERTAIN',
      confidence: v3Decision.confidence,
      explanation: v3Decision.explanation
    }
  };
}

/**
 * Integrates verified website evidence into an existing lead or candidate's evidence profile.
 * Adheres strictly to Prompt 6 Section 14:
 * - Evidence classes: WEBSITE_IDENTITY, WEBSITE_CATEGORY, WEBSITE_COMMERCIAL, WEBSITE_DESTINATION, WEBSITE_NEGATIVE, WEBSITE_CONTACT, WEBSITE_LOCATION
 * - Evidence strengths: STRONG, MODERATE, WEAK, CONTRADICTORY
 * - Integrates into existing Evidence Waterfall without rewriting relevance engine
 * - Critical existing contradictions remain dominant
 */
export function integrateWebsiteVerificationEvidence(
  profile: EntityEvidenceProfile,
  websiteRecord: WebsiteVerificationRecord
): void {
  for (const ev of websiteRecord.evidence) {
    if (ev.strength === 'CONTRADICTORY') {
      profile.conflicts.push(ev);
      profile.negativeSignals.push(ev.reason);
    } else {
      const sig = ev.signature || createEvidenceSignature(ev.type, ev.source, ev.strength, ev.value || ev.reason);
      if (!profile.uniqueEvidenceMap.has(sig)) {
        profile.uniqueEvidenceMap.set(sig, { ...ev, signature: sig });
        profile.observedEvidenceOccurrences++;
      }
    }
  }

  if (websiteRecord.hostname) {
    profile.observedDomains.add(websiteRecord.hostname);
  }
}
