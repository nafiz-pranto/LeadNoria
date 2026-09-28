/**
 * Internal Uncertain Entity Queue & Deterministic Classifier
 * LEADNORIA v1.1 — Master Prompt 5
 *
 * Durable internal representation and deterministic classification for candidates
 * where evidence is insufficient to safely accept (RELEVANT) or definitively reject (NOT_RELEVANT).
 *
 * INVARIANTS:
 * 1. UNCERTAIN candidates remain strictly EXCLUDED from final leads and exports.
 * 2. UNCERTAIN is NEVER used as a hidden acceptance backdoor.
 * 3. Survives service worker restart, side panel closure, and research resumption.
 */

import type {
  ScrapedAdCandidate,
  ExtensionLead,
  UncertainEntityRecord,
  UncertainReasonCode,
  StructuredEvidence,
  StrictV3Decision,
  IdentityConfidence
} from './types.ts';
import type { ResearchIntent } from './relevanceEngine.ts';

// -------------------------------------------------------------
// 1. REASON CODE CATALOG
// -------------------------------------------------------------
export const UNCERTAIN_REASONS: Record<UncertainReasonCode, string> = {
  UNCERTAIN_KEYWORD_ONLY: 'Keyword matched in ad text or query, but entity lacks verified business identity or category corroboration.',
  UNCERTAIN_AMBIGUOUS_ENTITY: 'Advertiser name is generic, dictionary word, or ambiguous without corroborating domain or verified page.',
  UNCERTAIN_MISSING_IDENTITY: 'Commercial activity observed, but entity lacks both Facebook Page verification and destination website domain.',
  UNCERTAIN_MISSING_CATEGORY_EVIDENCE: 'Commercial intent present (e.g. CTA or discounts), but vertical category evidence (product catalog, services) is incomplete.',
  UNCERTAIN_CONFLICT_NOT_RESOLVED: 'Candidate has mixed or conflicting signals that do not meet the threshold for a definitive hard contradiction.',
  UNCERTAIN_SHARED_MARKETPLACE: 'Destination domain is a multi-vendor shared marketplace (e.g. daraz, amazon) and seller has no independent category corroboration.',
  UNCERTAIN_LIMITED_PUBLIC_EVIDENCE: 'Ad card contains minimal visible public evidence (under 20 characters of copy, no active CTA, no landing page).'
};

// Known multi-vendor shared marketplace domains
const SHARED_MARKETPLACES = new Set([
  'daraz.com.bd',
  'daraz.com',
  'amazon.com',
  'aliexpress.com',
  'bikroy.com',
  'etsy.com',
  'ebay.com',
  'shopee.com',
  'lazada.com'
]);

// -------------------------------------------------------------
// 2. DETERMINISTIC UNCERTAIN CLASSIFIER
// -------------------------------------------------------------
/**
 * Classifies an ambiguous or borderline candidate into an UncertainEntityRecord.
 * Determines the primary reason code deterministically based on missing/weak signals.
 */
export function classifyUncertainCandidate(
  cand: ScrapedAdCandidate,
  v3Decision: StrictV3Decision,
  intent?: ResearchIntent,
  canonicalKey?: string,
  existingRecord?: UncertainEntityRecord
): UncertainEntityRecord {
  const adCopy = (cand.bodyCopy || cand.rawText || '').trim();
  const domain = (cand.destinationDomain || '').toLowerCase();
  const pageUrl = cand.facebookPageUrl || '';
  const now = new Date().toISOString();

  const missingEvidence: string[] = [];
  const reasonCodes: UncertainReasonCode[] = [];

  // Evaluate missing evidence dimensions
  if (!pageUrl) {
    missingEvidence.push('FACEBOOK_PAGE_VERIFICATION');
  }
  if (!domain) {
    missingEvidence.push('DESTINATION_DOMAIN');
  }

  const hasCatalog = v3Decision.evidence.some(e => e.type === 'PRODUCT_OR_SERVICE_SIGNAL' && e.strength === 'STRONG');
  if (!hasCatalog) {
    missingEvidence.push('CATEGORY_PRODUCT_CATALOG');
  }

  const hasCommercial = v3Decision.evidence.some(e => e.type === 'COMMERCIAL_INTENT');
  if (!hasCommercial) {
    missingEvidence.push('COMMERCIAL_INTENT_SIGNAL');
  }

  // Determine specific reason codes
  if (SHARED_MARKETPLACES.has(domain)) {
    reasonCodes.push('UNCERTAIN_SHARED_MARKETPLACE');
  }

  if (adCopy.length < 20 && !domain && !pageUrl) {
    reasonCodes.push('UNCERTAIN_LIMITED_PUBLIC_EVIDENCE');
  }

  if (!domain && !pageUrl) {
    reasonCodes.push('UNCERTAIN_MISSING_IDENTITY');
  }

  if (hasCommercial && !hasCatalog) {
    reasonCodes.push('UNCERTAIN_MISSING_CATEGORY_EVIDENCE');
  }

  const rawName = (cand.pageName || (cand as any).advertiserName || (cand as any).name || '').trim();
  const isGenericName = rawName.split(/\s+/).length <= 1 && !domain;
  if (isGenericName) {
    reasonCodes.push('UNCERTAIN_AMBIGUOUS_ENTITY');
  }

  if (v3Decision.reasonCode === 'UNCERTAIN_KEYWORD_ONLY' || (!hasCatalog && !domain && v3Decision.matchedTerms.length > 0)) {
    reasonCodes.push('UNCERTAIN_KEYWORD_ONLY');
  }

  if (v3Decision.conflicts && v3Decision.conflicts.length > 0) {
    reasonCodes.push('UNCERTAIN_CONFLICT_NOT_RESOLVED');
  }

  // Fallback reason code
  if (reasonCodes.length === 0) {
    reasonCodes.push('UNCERTAIN_AMBIGUOUS_ENTITY');
  }

  const primaryReasonCode = reasonCodes[0];

  const matchedQueries = existingRecord?.matchedQueries ? [...existingRecord.matchedQueries] : [];
  const currentQuery = cand.observedKeyword || intent?.primaryKeywords?.[0];
  if (currentQuery && !matchedQueries.includes(currentQuery)) {
    matchedQueries.push(currentQuery);
  }

  const observedNames = existingRecord?.observedNames ? [...existingRecord.observedNames] : [];
  if (cand.pageName && !observedNames.includes(cand.pageName)) {
    observedNames.push(cand.pageName);
  }

  const observedAdIds = existingRecord?.observedAdIds ? [...existingRecord.observedAdIds] : [];
  if (cand.libraryId && !observedAdIds.includes(cand.libraryId)) {
    observedAdIds.push(cand.libraryId);
  }

  const observedDomains = existingRecord?.observedDomains ? [...existingRecord.observedDomains] : [];
  if (domain && !observedDomains.includes(domain)) {
    observedDomains.push(domain);
  }

  let identityConfidence: IdentityConfidence = 'WEAK';
  if (pageUrl && domain) {
    identityConfidence = 'MODERATE';
  } else if (!pageUrl && !domain) {
    identityConfidence = 'WEAK';
  } else if (isGenericName) {
    identityConfidence = 'AMBIGUOUS';
  }

  const entityId = existingRecord?.entityId || `uncertain_${canonicalKey || rawName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

  return {
    entityId,
    entityKey: canonicalKey || rawName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    canonicalName: rawName,
    observedNames,
    advertiserName: rawName,
    matchedQueries,
    identityConfidence,
    evidenceItems: v3Decision.evidence,
    missingEvidence,
    reasonCodes,
    primaryReasonCode,
    reasonCode: primaryReasonCode,
    reasons: [UNCERTAIN_REASONS[primaryReasonCode] || v3Decision.explanation],
    observedAdIds,
    observedDomains,
    facebookPageInfo: {
      pageName: cand.pageName,
      pageUrl: cand.facebookPageUrl,
      pageId: cand.facebookPageId
    },
    timestamps: {
      firstDiscovered: existingRecord?.timestamps?.firstDiscovered || now,
      lastEvaluated: now
    },
    recordedAt: now,
    lastEvaluationState: {
      score: v3Decision.score,
      decision: 'UNCERTAIN',
      confidence: v3Decision.confidence,
      explanation: v3Decision.explanation
    },
    evidenceCoverage: v3Decision.evidenceCoverage
  };
}

// -------------------------------------------------------------
// 3. EXCLUSION FILTER FOR FINAL LEADS & EXPORTS
// -------------------------------------------------------------
/**
 * Strict gate guarantee: Filters out any entity that has evaluationStatus === 'UNCERTAIN'
 * or decision === 'UNCERTAIN'.
 */
export function filterOnlyQualifiedLeads(leads: ExtensionLead[]): ExtensionLead[] {
  return leads.filter(lead => {
    if (lead.evaluationStatus === 'UNCERTAIN' || lead.evaluationStatus === 'REJECTED') {
      return false;
    }
    if (lead.relevanceDecision && lead.relevanceDecision !== 'RELEVANT') {
      return false;
    }
    return true;
  });
}

export const filterOutUncertainEntities = filterOnlyQualifiedLeads;

export function isUncertainCandidate(record: any): boolean {
  if (!record) return false;
  if (record.reasonCode && String(record.reasonCode).startsWith('UNCERTAIN_')) return true;
  if (record.lastEvaluationState === 'UNCERTAIN') return true;
  if (record.lastEvaluationState && typeof record.lastEvaluationState === 'object' && record.lastEvaluationState.decision === 'UNCERTAIN') return true;
  if (record.evaluationStatus === 'UNCERTAIN' || record.relevanceDecision === 'UNCERTAIN') return true;
  return false;
}

/**
 * Universal classifier helper for building or validating an UncertainEntityRecord.
 */
export function classifyUncertainty(cand: any): UncertainEntityRecord {
  const missing = cand.missingEvidence || [];
  const domains = cand.observedDomains || [];
  let reasonCode: UncertainReasonCode = 'UNCERTAIN_AMBIGUOUS_ENTITY';

  if (domains.some((d: string) => SHARED_MARKETPLACES.has(d.toLowerCase())) || missing.includes('INDEPENDENT_DOMAIN')) {
    reasonCode = 'UNCERTAIN_SHARED_MARKETPLACE';
  } else if (missing.includes('CREATIVE_TEXT')) {
    reasonCode = 'UNCERTAIN_LIMITED_PUBLIC_EVIDENCE';
  } else if (missing.includes('CONFLICT_RESOLUTION') || cand.identityConfidence === 'UNRESOLVED') {
    reasonCode = 'UNCERTAIN_CONFLICT_NOT_RESOLVED';
  } else if (missing.includes('CATEGORY_EVIDENCE')) {
    reasonCode = 'UNCERTAIN_MISSING_CATEGORY_EVIDENCE';
  } else if (missing.includes('FACEBOOK_PAGE_EVIDENCE') || cand.facebookPage === null) {
    reasonCode = 'UNCERTAIN_MISSING_IDENTITY';
  } else if (cand.identityConfidence === 'AMBIGUOUS') {
    reasonCode = 'UNCERTAIN_AMBIGUOUS_ENTITY';
  } else if (missing.includes('STRONG_ENTITY_NAME') || cand.identityConfidence === 'WEAK') {
    reasonCode = 'UNCERTAIN_KEYWORD_ONLY';
  }

  return {
    entityId: cand.entityId || cand.id || `unc_${(cand.name || 'entity').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    canonicalName: cand.name || cand.canonicalName || 'Unknown Entity',
    observedNames: cand.observedNames || (cand.name ? [cand.name] : (cand.canonicalName ? [cand.canonicalName] : [])),
    matchedQueries: cand.matchedQueries || [],
    identityConfidence: cand.identityConfidence || 'WEAK',
    evidenceItems: cand.evidenceItems || [],
    missingEvidence: missing,
    reasonCode,
    reasonCodes: [reasonCode],
    primaryReasonCode: reasonCode,
    reasons: [UNCERTAIN_REASONS[reasonCode] || reasonCode],
    observedAdIds: cand.observedAdIds || [],
    observedDomains: domains,
    facebookPageInfo: cand.facebookPageInfo || null,
    timestamps: cand.timestamps || { firstDiscovered: new Date().toISOString(), lastEvaluated: new Date().toISOString() },
    recordedAt: new Date().toISOString(),
    lastEvaluationState: cand.lastEvaluationState || 'UNCERTAIN',
    evidenceCoverage: cand.evidenceCoverage || 'PARTIAL'
  };
}

