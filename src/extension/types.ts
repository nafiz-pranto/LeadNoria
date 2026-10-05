/**
 * Chrome MV3 Meta Ad Library Scraper Extension Types
 */

export const MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH = 5000;

export type ResearchMode = 'CUSTOM' | 'PRESET';
export type ResearchModelType = 'AUTO_DISCOVERY';

export type JobStatus =
  | 'IDLE'
  | 'STARTING'
  | 'NAVIGATING'
  | 'COLLECTING'
  | 'NORMALIZING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'CANCELLED'
  | 'BLOCKED'
  | 'FAILED'
  | 'RECOVERY_REQUIRED'
  | 'BROWSER_TAB_CLOSED'
  | 'BROWSER_INTERRUPTED'
  | 'RATE_LIMITED'
  | 'CHALLENGED';

export type ResearchStopReason =
  | 'TARGET_REACHED'
  | 'SAFETY_LIMIT_REACHED'
  | 'SOURCE_EXHAUSTED'
  | 'SOURCE_EXHAUSTED_VERIFIED'
  | 'SOURCE_PROGRESS_STALLED'
  | 'NO_NEW_RESULTS_OBSERVED'
  | 'USER_CANCELLED'
  | 'BROWSER_INTERRUPTED'
  | 'BROWSER_TAB_CLOSED'
  | 'RATE_LIMITED'
  | 'CHALLENGED'
  | 'CHALLENGE_DETECTED'
  | 'STALE_JOB_TIMEOUT'
  | 'FAILED'
  | 'FATAL_ERROR';

export type RelevanceDecision = 'RELEVANT' | 'UNCERTAIN' | 'NOT_RELEVANT';
export type RelevanceConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type EvidenceStrength = 'STRONG' | 'MODERATE' | 'WEAK' | 'CONTRADICTORY';

export type EvidenceType =
  | 'ENTITY_IDENTITY'
  | 'CATEGORY_MATCH'
  | 'COMMERCIAL_INTENT'
  | 'PRODUCT_OR_SERVICE_SIGNAL'
  | 'DESTINATION_MATCH'
  | 'FACEBOOK_PAGE_SIGNAL'
  | 'DOMAIN_SIGNAL'
  | 'NEGATIVE_CATEGORY'
  | 'CONTRADICTION'
  | 'QUERY_CONTEXT'
  | 'WEBSITE_IDENTITY'
  | 'WEBSITE_CATEGORY'
  | 'WEBSITE_COMMERCIAL'
  | 'WEBSITE_DESTINATION'
  | 'WEBSITE_NEGATIVE'
  | 'WEBSITE_CONTACT'
  | 'WEBSITE_LOCATION';

export type EvidenceSource =
  | 'advertiser_name'
  | 'ad_text'
  | 'destination_url'
  | 'destination_domain'
  | 'facebook_page'
  | 'cta_text'
  | 'entity_aggregation'
  | 'matched_query'
  | 'product_catalog'
  | 'cross_query_merge'
  | 'website_verification';

export interface StructuredEvidence {
  type: EvidenceType;
  strength: EvidenceStrength;
  source: EvidenceSource;
  reason: string;
  matchedSignal?: string;
  reasonCode?: string;
  value?: string;
  explanation?: string;
  signature?: string;
  occurrenceCount?: number;
}

export type EvidenceCoverageLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface EvidenceCoverage {
  applicableCategoriesPresent: number;
  applicableCategoriesTotal: number;
  coverageRatio: number;
  coverageLevel: EvidenceCoverageLevel;
  presentCategories: EvidenceType[];
  missingCategories: EvidenceType[];
}

export interface StrictV3Decision {
  decision: RelevanceDecision;
  confidence: RelevanceConfidence;
  score: number;
  reasons: string[];
  matchedKeywords: string[];
  matchedTerms: string[];
  negativeSignals: string[];
  evidence: StructuredEvidence[];
  conflicts: StructuredEvidence[];
  evidenceCoverage: EvidenceCoverage;
  uniqueEvidenceSignals: number;
  observedEvidenceOccurrences: number;
  explanation: string;
  reasonCode: string;
  strategyVersion: number;
  engineVersion: string;
  presetVersion?: string;
}

export type UncertainReasonCode =
  | 'UNCERTAIN_KEYWORD_ONLY'
  | 'UNCERTAIN_AMBIGUOUS_ENTITY'
  | 'UNCERTAIN_MISSING_IDENTITY'
  | 'UNCERTAIN_MISSING_CATEGORY_EVIDENCE'
  | 'UNCERTAIN_CONFLICT_NOT_RESOLVED'
  | 'UNCERTAIN_SHARED_MARKETPLACE'
  | 'UNCERTAIN_LIMITED_PUBLIC_EVIDENCE';

export interface UncertainEntityRecord {
  entityId: string;
  entityKey?: string;
  canonicalName: string;
  observedNames: string[];
  advertiserName?: string;
  matchedQueries: string[];
  identityConfidence: IdentityConfidence;
  evidenceItems: StructuredEvidence[];
  evidence?: StructuredEvidence[];
  missingEvidence: string[];
  reasonCodes: string[];
  primaryReasonCode: string;
  reasonCode?: string;
  reasons?: string[];
  observedAdIds: string[];
  observedDomains: string[];
  facebookPageInfo?: {
    pageName?: string;
    pageUrl?: string;
    pageId?: string;
  };
  timestamps: {
    firstDiscovered: string;
    lastEvaluated: string;
  };
  recordedAt?: string;
  decision?: 'UNCERTAIN';
  confidence?: RelevanceConfidence;
  queryProvenance?: string[];
  uncertainReasonCodes?: string[];
  lastEvaluationState: {
    score: number;
    decision: 'UNCERTAIN';
    confidence: RelevanceConfidence;
    explanation?: string;
  };
  evidenceCoverage?: EvidenceCoverage;
}

export type CreativeSignalType =
  | 'CTA'
  | 'OFFER'
  | 'DISCOUNT'
  | 'PRICE'
  | 'COMMERCIAL_INTENT'
  | 'PRODUCT_TERM'
  | 'SERVICE_TERM'
  | 'CREATIVE_TYPE'
  | 'LANGUAGE';

export interface StructuredCreativeSignal {
  type: CreativeSignalType;
  rawSignal: string;
  normalized: string;
  occurrences: number;
}

export type AdvertiserExpansionStatus =
  | 'NOT_ELIGIBLE'
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'NO_RESULTS'
  | 'BLOCKED'
  | 'FAILED';

export interface AdvertiserExpansionProvenance {
  expansionType: 'ADVERTISER';
  sourceEntityId: string;
  sourceAdvertiserName: string;
  expansionQuery: string;
  query?: string;
  timestamp: string;
  resultCount: number;
  newAdsDiscovered: number;
  newAds?: number;
  duplicateAds: number;
  newEntitiesDiscovered: number;
  newEntities?: number;
  stopReason: 'SOURCE_EXHAUSTED' | 'MAX_ADS_REACHED' | 'RATE_LIMITED' | 'TIMEOUT' | 'NO_NEW_DATA' | 'ERROR' | 'COMPLETED_SUCCESSFULLY';
}

export interface RunCounters {
  rawAds: number;
  normalizedCandidates: number;
  relevantCandidates: number;
  uncertainCandidates: number;
  notRelevantCandidates: number;
  duplicatesRemoved: number;
  duplicateAdRecordsRemoved?: number;
  entityMergesCount?: number;
  finalUniqueLeads: number;
  // Enhanced Phase 2 bulk counters
  uniqueEntitiesObserved?: number;
  relevantEntities?: number;
  uncertainEntities?: number;
  notRelevantEntities?: number;
  keywordsCompleted?: number;
  keywordsTotal?: number;
  finalUniqueRelevantLeads?: number;
  reasonCodes?: Record<string, number>;
  // Prompt 5: Advertiser Expansion counters
  advertiserExpansionsCount?: number;
  advertiserExpansionAdsCount?: number;
  advertiserExpansionDuplicatesCount?: number;
}

export type QueryVariantType =
  | 'SEED'
  | 'CATEGORY_SYNONYM'
  | 'PRODUCT_TERM'
  | 'SERVICE_TERM'
  | 'COMMERCIAL_CATEGORY'
  | 'SINGULAR_PLURAL'
  | 'COMMON_SPELLING_VARIANT'
  | 'LOCALE_VARIANT';

export type QueryStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'NO_RESULTS'
  | 'NO_NEW_ENTITIES';

export interface PlannedQuery {
  query: string;
  seedQuery: string;
  variantType: QueryVariantType;
  rationale: string;
  locale: string;
  country: string;
  sequence: number;
  runId?: string;
  status?: QueryStatus;
  rawAds?: number;
  normalizedAds?: number;
  newUniqueEntities?: number;
  duplicateEntities?: number;
  rejectedByRelevance?: number;
  uncertainByRelevance?: number;
  yield?: number;
}

export interface QueryFrontierState {
  runId: string;
  activeQueryIndex: number;
  queries: PlannedQuery[];
  completedQueries: string[];
  isSaturated?: boolean;
  saturationReason?: string;
  consecutiveZeroYieldCount?: number;
}

export interface KeywordFrontierState {
  activeKeywordIndex: number;
  keywords: string[];
  currentKeyword: string;
  completedKeywords: string[];
  seenLibraryIdsCount: number;
  seenEntityKeysCount: number;
  lastBatchIndex: number;
  checkpointTimestamp: string;
}

export interface ScrapedAdCandidate {
  libraryId: string;
  pageName: string;
  facebookPageUrl?: string;
  facebookPageId?: string;
  destinationUrl?: string;
  destinationDomain?: string;
  isActive: boolean;
  startedRunning?: string;
  hasMultipleVersions?: boolean;
  bodyCopy?: string;
  ctaText?: string;
  observedKeyword?: string;
  rawText?: string;
}

export interface ExtensionLead {
  id: string;
  name: string;
  canonicalName: string;
  facebookPageName: string;
  facebookPageUrl?: string;
  facebookPageState: 'found' | 'not_found' | 'unknown';
  destinationUrl?: string;
  destinationDomain?: string;
  websiteState: 'found' | 'not_found' | 'unknown';
  activeAdCount: number;
  adCount?: number;
  adLibraryIds: string[];
  adLibraryUrl?: string;
  matchedKeywords: string[];
  matchedQueries?: string[];
  locationCode: string;
  locationName: string;
  status: 'QUALIFIED' | 'REVIEW_REQUIRED' | 'NEEDS_DATA';
  discoveredAt: string;
  sampleCopy?: string;
  sampleCta?: string;
  // Relevance evaluation fields
  relevanceScore?: number;
  relevanceDecision?: RelevanceDecision;
  relevanceConfidence?: RelevanceConfidence;
  relevanceReasons?: string[];
  relevanceMatchedTerms?: string[];
  relevanceEvidence?: StructuredEvidence[];
  relevanceStrategyVersion?: number;
  engineVersion?: string;
  presetVersion?: string;
  evidenceCoverage?: EvidenceCoverage;
  evidenceExplanation?: string;
  uniqueEvidenceSignals?: number;
  observedEvidenceOccurrences?: number;
  // Entity Identity & Resolution (v1.1)
  identityConfidence?: IdentityConfidence;
  canonicalPageId?: string;
  canonicalPageSlug?: string;
  observedDomains?: string[];
  observedUrls?: string[];
  aliases?: string[];
  relationshipType?: EntityRelationshipType;
  mergeHistory?: EntityMergeRecord[];
  // Prompt 5: Uncertain Queue, Advertiser Expansion & Creative Signals
  evaluationStatus?: 'RELEVANT' | 'UNCERTAIN' | 'REJECTED';
  uncertainReason?: string;
  missingEvidence?: string[];
  advertiserExpansionStatus?: AdvertiserExpansionStatus;
  expansionProvenance?: AdvertiserExpansionProvenance[];
  creativeSignals?: StructuredCreativeSignal[];
  // Prompt 6: Website Deep Verification
  websiteVerificationStatus?: WebsiteVerificationStatus;
  websiteVerification?: WebsiteVerificationRecord;
}

export type IdentityConfidence = 'STRONG' | 'MODERATE' | 'WEAK' | 'UNRESOLVED' | 'AMBIGUOUS';
export type EntityRelationshipType =
  | 'PARENT_BRAND'
  | 'LOCAL_BRANCH'
  | 'INDEPENDENT_BUSINESS'
  | 'UNRESOLVED_RELATIONSHIP';

export interface EntityMergeRecord {
  timestamp: string;
  mergeReason: string;
  sourceLibraryId?: string;
  sourceQuery?: string;
  confidence: IdentityConfidence;
}

export interface ExtensionResearchRun {
  runId: string;
  researchName: string;
  mode: ResearchMode;
  presetId?: string;
  presetName?: string;
  keywords: string[];
  countryCode: string;
  locationName: string;
  // Auto-Discovery fields (Phase 1)
  researchMode?: 'AUTO_DISCOVERY';
  maxFinalUniqueRelevantLeads?: number;
  // Legacy backward-compatibility metadata
  maxResults?: number;
  targetLeadCount?: number;
  status: JobStatus;
  stopReason?: string;
  challengeReason?: string;
  leads: ExtensionLead[];
  rejectedLeadsCount?: number;
  uncertainLeadsCount?: number;
  relevanceStrategyVersion?: number;
  engineVersion?: string;
  counters?: RunCounters;
  logs: Array<{
    timestamp: string;
    message: string;
    stage: string;
  }>;
  startedAt: string;
  completedAt?: string;
  lastUpdatedAt: string;
  schemaVersion: number;
  totalAdsInspected: number;
  allCandidates?: ScrapedAdCandidate[];
  activeKeywordIndex?: number;
  currentKeyword?: string;
  keywordsCompleted?: number;
  totalKeywords?: number;
  entitiesEvaluated?: number;
  lastCheckpointBatch?: number;
  frontier?: KeywordFrontierState;
  queryFrontier?: QueryFrontierState;
  plannedQueries?: PlannedQuery[];
  activeQueryIndex?: number;
}

export interface StartResearchPayload {
  mode: ResearchMode;
  presetId?: string;
  presetName?: string;
  keywords: string[];
  countryCode: string;
  locationName: string;
  researchName?: string;
  // Auto-Discovery fields (Phase 1)
  researchMode?: 'AUTO_DISCOVERY';
  maxFinalUniqueRelevantLeads?: number;
  // Legacy backward-compatibility
  maxResults?: number;
}

export interface ExtensionMessage {
  type:
    | 'START_RESEARCH'
    | 'STOP_RESEARCH'
    | 'CANCEL_RESEARCH'
    | 'RESUME_RESEARCH'
    | 'GET_STATE'
    | 'GET_HISTORY'
    | 'CLEAR_HISTORY'
    | 'GET_ALL_LEADS_FOR_EXPORT'
    | 'RESEARCH_PROGRESS'
    | 'RESEARCH_COMPLETED'
    | 'SCAN_AND_EXTRACT'
    | 'CANDIDATES_COLLECTED'
    | 'CHALLENGE_DETECTED'
    | 'CONTENT_SCRIPT_READY'
    | 'VERIFY_WEBSITE'
    | 'GET_WEBSITE_VERIFICATION'
    | 'EVALUATE_BUSINESS_QUALIFICATION'
    | 'ASSEMBLE_CANONICAL_LEAD';
  payload?: any;
}

// ==========================================
// Prompt 6: Website Deep Verification Engine
// ==========================================

export type WebsiteVerificationStatus =
  | 'NOT_VERIFIED'
  | 'VERIFYING'
  | 'VERIFIED_BUSINESS_WEBSITE'
  | 'LIKELY_BUSINESS_WEBSITE'
  | 'UNCERTAIN_WEBSITE'
  | 'NOT_A_BUSINESS_SITE'
  | 'INVALID'
  | 'BLOCKED'
  | 'NO_WEBSITE';

export type WebsiteIdentityMatchLevel = 'STRONG' | 'MODERATE' | 'WEAK' | 'CONTRADICTORY' | 'UNKNOWN';
export type WebsiteCategoryMatchLevel = 'STRONG' | 'MODERATE' | 'WEAK' | 'CONTRADICTORY' | 'UNKNOWN';

export type WebsiteCommercialSignalCode =
  | 'WEBSITE_PRODUCT_SIGNAL'
  | 'WEBSITE_SERVICE_SIGNAL'
  | 'WEBSITE_PRICE_SIGNAL'
  | 'WEBSITE_ECOMMERCE_SIGNAL'
  | 'WEBSITE_BOOKING_SIGNAL'
  | 'WEBSITE_CONTACT_SIGNAL'
  | 'WEBSITE_LOCATION_SIGNAL'
  | 'WEBSITE_SHOWROOM_SIGNAL'
  | 'WEBSITE_DELIVERY_SIGNAL'
  | 'WEBSITE_WARRANTY_SIGNAL';

export type WebsiteNegativeSignalCode =
  | 'PARKED_DOMAIN'
  | 'DOMAIN_FOR_SALE'
  | 'EMPTY_SITE'
  | 'GENERIC_DIRECTORY'
  | 'JOB_PORTAL'
  | 'NEWS_ONLY'
  | 'PERSONAL_BLOG'
  | 'UNRELATED_CATEGORY'
  | 'SOCIAL_ONLY_REDIRECT'
  | 'MARKETPLACE_ONLY'
  | 'BROKEN_SITE';

export interface WebsiteContactSignal {
  type: 'phone' | 'email' | 'address' | 'city' | 'country' | 'contactPage' | 'businessHours';
  value: string;
}

export interface WebsiteVerificationRecord {
  leadId: string;
  canonicalName: string;
  originalUrl: string;
  normalizedUrl: string;
  finalUrl: string;
  finalOrigin: string;
  hostname: string;
  status: WebsiteVerificationStatus;
  identityMatch: WebsiteIdentityMatchLevel;
  categoryMatch: WebsiteCategoryMatchLevel;
  commercialSignals: WebsiteCommercialSignalCode[];
  negativeSignals: WebsiteNegativeSignalCode[];
  evidence: StructuredEvidence[];
  pagesVisited: string[];
  contactSignals: WebsiteContactSignal[];
  locationSignals: string[];
  verifiedAt: string;
  durationMs: number;
  blockedReason?: string;
  errorCode?: string;
}
