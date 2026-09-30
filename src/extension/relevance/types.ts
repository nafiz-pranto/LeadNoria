/**
 * LeadNoria Maps Evidence & Relevance Engine Contracts (Phase 9)
 *
 * Defines the deterministic relevance states, evidence taxonomy, match types,
 * polarity classifications, audit trail, research intent, and evaluation results.
 *
 * INVARIANTS:
 * 1. ZERO DOM scraping, ZERO live Google Maps extraction (CONTRACT_ONLY).
 * 2. ZERO modification of frozen Meta production runtime.
 * 3. Technical relevance classification is INDEPENDENT of persistence/export eligibility.
 *    RELEVANT + GOOGLE_CONSUMER_WEB_RESTRICTED != EXPORTABLE.
 * 4. Deterministic: identical inputs produce byte-identical outputs.
 * 5. Unknown != Negative. Missing evidence is never converted to negative without explicit rule.
 */

import type {
  ProvenanceType,
  SourceContribution,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus
} from '../extraction/types.ts';

import type {
  ResolvedEntityGroup
} from '../resolution/types.ts';

// ==========================================
// 1. Relevance States (Phase 9 Section 4)
// ==========================================

export type RelevanceState =
  | 'RELEVANT'
  | 'UNCERTAIN'
  | 'NOT_RELEVANT';

// ==========================================
// 2. Evidence Taxonomy (Phase 9 Section 5)
// ==========================================

export type EvidenceType =
  | 'BUSINESS_NAME_EVIDENCE'
  | 'ALIAS_EVIDENCE'
  | 'CATEGORY_EVIDENCE'
  | 'ADDRESS_EVIDENCE'
  | 'LOCALITY_EVIDENCE'
  | 'REGION_EVIDENCE'
  | 'COUNTRY_EVIDENCE'
  | 'WEBSITE_EVIDENCE'
  | 'SERVICE_TERM_EVIDENCE'
  | 'PRODUCT_TERM_EVIDENCE'
  | 'NEGATIVE_CATEGORY_EVIDENCE'
  | 'NEGATIVE_LOCATION_EVIDENCE'
  | 'CONTRADICTION_EVIDENCE';

// ==========================================
// 3. Evidence Polarity & Negation Context (Phase 9 Section 6 & Prompt 9A)
// ==========================================

export type EvidencePolarity =
  | 'POSITIVE'
  | 'NEGATIVE'
  | 'NEUTRAL'
  | 'CONTRADICTORY';

export type NegationContextType =
  | 'ENTITY_LEVEL_NEGATION' // Directly describes the entity (e.g. "not a roofing contractor", "permanently closed")
  | 'PAGE_CONTEXT_TERM'     // Navigational or page context (e.g. "careers", "jobs", "privacy policy")
  | 'INCIDENTAL_TEXT';       // Modifiers that may be descriptive rather than exclusive (e.g. "wholesale", "association")

// ==========================================
// 4. Match Types (Phase 9 Section 7)
// ==========================================

export type MatchType =
  | 'EXACT'
  | 'NORMALIZED_EXACT'
  | 'TOKEN_MATCH'
  | 'PHRASE_MATCH'
  | 'ALIAS_MATCH'
  | 'CATEGORY_MATCH'
  | 'CATEGORY_COMPATIBLE'
  | 'LOCATION_EXACT'
  | 'LOCATION_COMPONENT_MATCH'
  | 'COUNTRY_MATCH'
  | 'SERVICE_MATCH'
  | 'PRODUCT_MATCH'
  | 'NEGATED_MATCH'
  | 'CONTRADICTORY_MATCH'
  | 'NO_MATCH';

export type EvidenceStrength =
  | 'STRONG'
  | 'MODERATE'
  | 'WEAK';

export type LocationRelevanceState =
  | 'LOCATION_MATCH'
  | 'LOCATION_PARTIAL'
  | 'LOCATION_UNKNOWN'
  | 'LOCATION_MISMATCH'
  | 'LOCATION_CONTRADICTORY';

// ==========================================
// 5. Evidence Waterfall Tiers (Phase 9 Section 15 & Prompt 9A)
// ==========================================
/**
 * WATERFALL CONSISTENCY DEFINITIONS:
 *
 * NO_MATCH:
 *   A tested field was observed/available, but did not match the query/intent.
 *   (e.g., observed category "Bakery" tested against query "Roofing Contractor").
 *
 * UNKNOWN:
 *   The relevant field/evidence was unavailable or unresolved in the candidate record.
 *   (e.g., category is undefined/missing, address locality is missing).
 *   UNKNOWN != NEGATIVE. Absence of evidence is NEVER treated as negative evidence.
 *
 * NEGATIVE:
 *   Evidence positively indicates mismatch, incompatibility, or contradiction.
 *   (e.g., observed category "Dentist" for "Roofing", country "DE" for target "US",
 *   or entity-level negation "not a roofing contractor").
 *
 * CONTRADICTORY:
 *   Material positive and negative evidence coexist within the entity evaluation.
 *   (e.g., matching name "Austin Roofing Solutions" but observed category "Pet Supplies").
 */

export type EvidenceWaterfallTier =
  | 'TIER_1_EXACT_CATEGORY_LOCATION'
  | 'TIER_2_CATEGORY_NAME_SERVICE_LOCATION'
  | 'TIER_3_COMPATIBLE_CATEGORY_LOCATION'
  | 'TIER_4_SERVICE_PRODUCT_IDENTITY_LOCATION'
  | 'TIER_5_NAME_ALIAS_CORROBORATED'
  | 'TIER_6_WEAK_AMBIGUOUS'
  | 'CONTRADICTION_OVERRIDE'
  | 'EXCLUSION_OVERRIDE';

// ==========================================
// 6. Explainable Reason Codes (Phase 9 Section 19)
// ==========================================

export type RelevanceReasonCode =
  // RELEVANT reasons
  | 'RELEVANT_EXACT_CATEGORY_LOCATION'
  | 'RELEVANT_CATEGORY_NAME_LOCATION'
  | 'RELEVANT_SERVICE_CATEGORY_LOCATION'
  | 'RELEVANT_ALIAS_CORROBORATED'
  | 'RELEVANT_MULTI_SIGNAL'
  | 'RELEVANT_CATEGORY_WITHOUT_LOCATION_RESTRICTION'
  // UNCERTAIN reasons
  | 'UNCERTAIN_NAME_ONLY'
  | 'UNCERTAIN_CATEGORY_UNKNOWN'
  | 'UNCERTAIN_LOCATION_PARTIAL'
  | 'UNCERTAIN_CONTRADICTORY_EVIDENCE'
  | 'UNCERTAIN_WEAK_SERVICE_SIGNAL'
  | 'UNCERTAIN_INSUFFICIENT_CORROBORATION'
  | 'UNCERTAIN_GENERIC_BRAND_NAME'
  | 'UNCERTAIN_LOCATION_MISSING'
  // NOT_RELEVANT reasons
  | 'NOT_RELEVANT_CATEGORY_MISMATCH'
  | 'NOT_RELEVANT_LOCATION_MISMATCH'
  | 'NOT_RELEVANT_COUNTRY_MISMATCH'
  | 'NOT_RELEVANT_NEGATIVE_CATEGORY'
  | 'NOT_RELEVANT_CONTRADICTORY_BUSINESS_TYPE'
  | 'NOT_RELEVANT_NEGATED_INTENT'
  | 'NOT_RELEVANT_BRANCH_LOCATION_MISMATCH'
  | 'NOT_RELEVANT_EXCLUSION_TERM_MATCH';

// ==========================================
// 7. Relevance Evidence Item (Phase 9 Section 5 & 20)
// ==========================================

export interface RelevanceEvidenceItem {
  evidenceId: string;
  evidenceType: EvidenceType;
  fieldName: string;
  observedValue: string;
  matchedValue: string;
  matchType: MatchType;
  strength: EvidenceStrength;
  polarity: EvidencePolarity;
  explanation: string;
  sourceProvenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  derivedFrom: SourceContribution[];
  confidence: 'STRONG' | 'MODERATE' | 'WEAK';
  policyStatus: PolicyStatus;
  ruleId?: string;
  queryTerm?: string;
  negationContext?: NegationContextType;
}

// ==========================================
// 8. Research Intent Contracts (Phase 9 Section 3 & 8)
// ==========================================

export interface MapsResearchIntent {
  keyword: string;
  category?: string;
  targetLocation?: string;
  targetCountry?: string; // ISO 3166-1 alpha-2 or full country name
  targetRegion?: string;
  language?: string;
  locale?: string;
  websiteRequirement?: 'WITH' | 'WITHOUT' | 'BOTH';
  queryVariants?: string[];
  userSynonyms?: string[];
  exclusions?: string[];
  strictLocation?: boolean;
}

export interface NormalizedResearchIntent {
  originalKeyword: string;
  normalizedKeyword: string;
  keywordTokens: string[];
  originalCategory?: string;
  normalizedCategory?: string;
  categoryTokens: string[];
  targetLocation?: string;
  normalizedLocation?: string;
  targetCountry?: string;
  normalizedCountry?: string;
  targetRegion?: string;
  normalizedRegion?: string;
  language: string;
  locale: string;
  websiteRequirement: 'WITH' | 'WITHOUT' | 'BOTH';
  queryVariants: string[];
  userSynonyms: string[];
  exclusions: string[];
  strictLocation: boolean;
}

// ==========================================
// 9. Entity Relevance Result (Phase 9 Section 29)
// ==========================================

export interface EntityRelevanceResult {
  entityId: string;
  canonicalDisplayName: string;
  relevanceState: RelevanceState;
  evidenceTier: EvidenceWaterfallTier;
  locationState: LocationRelevanceState;
  internalScore: number; // 0 to 100 bounded ordering score (NOT a sales/maturity score)
  evidenceItems: RelevanceEvidenceItem[];
  positiveEvidence: RelevanceEvidenceItem[];
  negativeEvidence: RelevanceEvidenceItem[];
  contradictions: RelevanceEvidenceItem[];
  reasonCodes: RelevanceReasonCode[];
  explanation: string;
  sourceContributions: SourceContribution[];
  derivedFrom: SourceContribution[];
  // Policy & Data Firewall Preservation (Phase 9 Section 22)
  policyEligibility: PolicyStatus;
  persistenceEligibility: PersistenceStatus;
  exportEligibility: ExportStatus;
  isRestricted: boolean;
  evaluatedAt: string;
}

// ==========================================
// 10. Batch Relevance Result (Phase 9 Section 29 & 34)
// ==========================================

export interface BatchRelevanceSummary {
  totalEntities: number;
  relevantCount: number;
  uncertainCount: number;
  notRelevantCount: number;
  totalEvidenceGenerated: number;
  deduplicatedEvidenceCount: number;
  elapsedMs: number;
  throughputOpsSec: number;
  heapDeltaMB?: number;
}

export interface BatchRelevanceResult {
  results: EntityRelevanceResult[];
  summary: BatchRelevanceSummary;
}

export interface RelevanceEvaluationOptions {
  enableLocationCheck?: boolean;
  enableBranchVerification?: boolean;
  enableServiceTermExtraction?: boolean;
  enableNegationDetection?: boolean;
  enableAntiInflation?: boolean;
}
