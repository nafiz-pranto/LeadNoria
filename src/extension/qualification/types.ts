/**
 * LeadNoria Website Requirement Engine & Lead Qualification Pipeline Contracts (Phase 6)
 *
 * Defines deterministic contracts for website requirement states, website evidence models,
 * lead qualification states, explainable machine-readable reason codes, and result envelopes.
 */

import type {
  NormalizedCandidate,
  SourceContribution,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus,
  ProvenanceType,
  SourceType
} from '../extraction/types.ts';

// ==========================================
// 1. User Intent Model
// ==========================================

export type WebsiteRequirement =
  | 'WITH'      // Require verified business website
  | 'WITHOUT'   // Require confirmed absence of website (explicit evidence required)
  | 'BOTH';     // Accept eligible WITH and eligible WITHOUT leads, keeping states distinct

// ==========================================
// 2. Deterministic Website State Machine
// ==========================================

export type WebsiteState =
  | 'WEBSITE_PRESENT'               // A URL exists in the candidate data, unverified
  | 'WEBSITE_NOT_FOUND'             // No usable website URL obtained from permitted source path (NOT proven absence)
  | 'WEBSITE_INVALID'               // URL is malformed, dangerous protocol, or credential-bearing
  | 'WEBSITE_UNCERTAIN'             // Verification evidence is contradictory, borderline, or inconclusive
  | 'WEBSITE_VERIFIED_BUSINESS_SITE'// Independent website verification established it represents target business
  | 'WEBSITE_NON_BUSINESS'          // Destination resolves to generic profile, marketplace, encyclopedia, or personal blog
  | 'WEBSITE_PARKED'                // Destination is parked domain, for-sale placeholder, or domain broker
  | 'WEBSITE_UNAVAILABLE'           // Site timed out, unreachable (DNS/404/500), or blocked by security barrier
  | 'WEBSITE_UNKNOWN';              // No determination was possible

// ==========================================
// 3. Website Evidence Model
// ==========================================

export interface WebsiteEvidenceComponentMatch {
  matched: boolean;
  score?: number;
  evidenceSnippet?: string;
  matchedValue?: string;
}

export interface WebsiteParkingEvidence {
  isParked: boolean;
  detectedPatterns?: string[];
  registrarNote?: string;
}

export interface WebsiteNonBusinessEvidence {
  isNonBusiness: boolean;
  category?: 'GENERIC_MARKETPLACE' | 'SOCIAL_PROFILE' | 'WIKIPEDIA_OR_ENCYCLOPEDIA' | 'DIRECTORY' | 'PERSONAL_BLOG' | 'OTHER';
  reason?: string;
}

export type UnavailableReasonCode =
  | 'PAGE_TIMEOUT'
  | 'DOMAIN_TIMEOUT'
  | 'DNS_FAILURE'
  | 'HTTP_403'
  | 'HTTP_404'
  | 'HTTP_429'
  | 'HTTP_5XX'
  | 'NETWORK_ERROR'
  | 'REDIRECT_ERROR'
  | 'UNKNOWN';

export interface WebsiteEvidence {
  websiteUrl: string;
  normalizedUrl: string;
  canonicalOrigin: string;
  canonicalDomain: string;
  verificationState: WebsiteState;
  unavailableReason?: UnavailableReasonCode;
  httpStatus?: number;
  redirectChain: string[];
  pagesVisited: string[];
  sameOrigin: boolean;
  
  // Specific Corroborating Signals
  businessNameEvidence: WebsiteEvidenceComponentMatch;
  addressEvidence: {
    matched: boolean;
    localityMatched?: boolean;
    evidenceSnippet?: string;
  };
  phoneEvidence: {
    matched: boolean;
    matchedPhone?: string;
  };
  emailEvidence: {
    matched: boolean;
    matchedEmail?: string;
  };
  brandEvidence: WebsiteEvidenceComponentMatch;
  serviceEvidence: {
    matched: boolean;
    keywords?: string[];
  };
  aboutEvidence: {
    matched: boolean;
    text?: string;
  };
  contactEvidence: {
    matched: boolean;
    formPresent?: boolean;
  };
  
  // Disqualifying Signals
  parkingEvidence: WebsiteParkingEvidence;
  nonBusinessEvidence: WebsiteNonBusinessEvidence;
  
  // Provenance & Audit
  capturedAt: string;
  policyStatus: PolicyStatus;
  sourceContributions: SourceContribution[];
  derivedFrom: SourceContribution[];
}

// ==========================================
// 4. Lead Qualification Model
// ==========================================

export type QualificationState =
  | 'QUALIFIED'     // Satisfies relevance, geography, website requirement, and data firewall gates
  | 'UNCERTAIN'     // Evidence is incomplete, ambiguous, missing proof of absence, or policy review required
  | 'DISQUALIFIED'; // Failed relevance, wrong geography, parked/non-business, or hard contradiction

// ==========================================
// 5. Explainable Qualification Reason Codes
// ==========================================

export type QualificationReasonCode =
  | 'QUALIFIED_RELEVANT_WITH_VERIFIED_WEBSITE'
  | 'QUALIFIED_WITH_WEBSITE'
  | 'QUALIFIED_WITHOUT_WEBSITE'
  | 'UNCERTAIN_WEBSITE_NOT_FOUND'
  | 'UNCERTAIN_WEBSITE_VERIFICATION'
  | 'UNCERTAIN_POLICY_REVIEW'
  | 'UNCERTAIN_CONTRADICTORY_EVIDENCE'
  | 'UNCERTAIN_GEOGRAPHY_AMBIGUOUS'
  | 'UNCERTAIN_RELEVANCE_WEAK'
  | 'DISQUALIFIED_NON_BUSINESS'
  | 'DISQUALIFIED_PARKED_DOMAIN'
  | 'DISQUALIFIED_IRRELEVANT'
  | 'DISQUALIFIED_GEO_MISMATCH'
  | 'DISQUALIFIED_WEBSITE_REQUIREMENT'
  | 'DISQUALIFIED_POLICY_INELIGIBLE'
  | 'DISQUALIFIED_CONTRADICTION';

// ==========================================
// 6. Qualification Input & Result Envelopes
// ==========================================

export interface TargetLocationCriteria {
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
}

export interface QualificationEvaluationInput {
  candidate: NormalizedCandidate;
  websiteRequirement: WebsiteRequirement;
  websiteEvidence?: WebsiteEvidence;
  targetKeywords?: string[];
  targetLocation?: TargetLocationCriteria;
  targetCategory?: string;
  
  // Explicit absence proof if available (e.g. verified registry confirm or domain unregistered)
  explicitNoWebsiteEvidence?: {
    hasConfirmedAbsence: boolean;
    source: SourceType;
    evidenceSnippet: string;
  };
}

export interface QualificationResultEnvelope {
  candidate: NormalizedCandidate;
  websiteRequirement: WebsiteRequirement;
  websiteState: WebsiteState;
  websiteEvidence?: WebsiteEvidence;
  qualificationState: QualificationState;
  qualificationReasons: QualificationReasonCode[];
  explanation: string;
  
  // Policy & Firewall Gates
  policyEligibility: PolicyStatus;
  persistenceEligibility: PersistenceStatus;
  exportEligibility: ExportStatus;
  
  // Full Lineage and Contribution Tracking
  sourceContributions: SourceContribution[];
  derivedFrom: SourceContribution[];
  
  // Uncertainty Detail
  uncertainReasons?: string[];
  evaluatedAt: string;
}

export interface WebsiteEligibilityResult {
  isEligible: boolean;
  state: WebsiteState;
  reason: string;
  reasonCode: QualificationReasonCode;
}
