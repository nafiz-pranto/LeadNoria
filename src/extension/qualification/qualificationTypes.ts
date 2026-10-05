/**
 * LeadNoria Advanced Lead Qualification Contracts (Phase 12)
 *
 * Defines source-neutral, deterministic qualification schemas, configurable
 * QualificationProfile contracts, five-valued criterion outcomes, explainable
 * decision envelopes, and typed evaluation contexts.
 */

import type {
  SourceContribution,
  PolicyRestrictionBasis,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus,
  ProvenanceType
} from '../extraction/types.ts';
import type { ContactEvidenceStrength, ContactEnrichmentResult } from '../enrichment/contactTypes.ts';
import type { EntityRelevanceResult } from '../relevance/types.ts';
import type { MapsVerificationIntegrationResult } from '../relevance/mapsWebsiteIntegration.ts';
import type { ResolvedEntityGroup } from '../resolution/types.ts';
import type { NormalizedCandidate } from '../extraction/types.ts';

// ==========================================
// 1. Qualification States & Criterion Outcomes
// ==========================================

export type AdvancedQualificationState =
  | 'QUALIFIED'
  | 'NOT_QUALIFIED'
  | 'UNCERTAIN'
  | 'BLOCKED';

export type QualificationDecisionState = AdvancedQualificationState;

export type CriterionOutcome =
  | 'PASS'
  | 'FAIL'
  | 'UNKNOWN'
  | 'CONTRADICTORY'
  | 'BLOCKED';

// ==========================================
// 2. Criterion Types
// ==========================================

export type CriterionType =
  | 'RELEVANCE'
  | 'WEBSITE_STATUS'
  | 'BUSINESS_IDENTITY'
  | 'HAS_BUSINESS_PHONE'
  | 'HAS_BUSINESS_EMAIL'
  | 'HAS_BUSINESS_ADDRESS'
  | 'HAS_CONTACT_FORM'
  | 'HAS_SOCIAL_PROFILE'
  | 'LOCATION_MATCH'
  | 'CATEGORY_MATCH'
  | 'NAME_MATCH'
  | 'NEGATIVE_EVIDENCE'
  | 'SOURCE_EVIDENCE_REQUIREMENT'
  | 'COMPLETENESS_THRESHOLD'
  | 'CUSTOM_FIELD'
  // Phase 23 Business Intelligence Additions:
  | 'VERIFIED_BUSINESS_WEBSITE'
  | 'PUBLISHED_SERVICES'
  | 'SERVICE_AREA_MATCH'
  | 'BUSINESS_HOURS_PRESENT'
  | 'DIGITAL_BOOKING_PRESENT'
  | 'DIGITAL_ECOMMERCE_PRESENT'
  | 'DIGITAL_CHAT_PRESENT'
  | 'DIGITAL_ANALYTICS_PRESENT'
  | 'DIGITAL_CMS_DETECTED'
  | 'PUBLIC_EMAIL_AVAILABLE'
  | 'ROLE_EMAIL_AVAILABLE'
  | 'PERSON_EMAIL_AVAILABLE'
  | 'PUBLIC_PHONE_AVAILABLE'
  | 'PERSON_PHONE_AVAILABLE'
  | 'PUBLIC_PERSON_AVAILABLE'
  | 'PERSON_WITH_TITLE_AVAILABLE'
  | 'CROSS_SOURCE_CORROBORATION'
  | 'CORROBORATED_PHONE'
  | 'CORROBORATED_IDENTITY'
  | 'META_AD_ACTIVE'
  | 'EVIDENCE_COVERAGE_THRESHOLD'
  | 'BUSINESS_COMPLETENESS_THRESHOLD'
  | 'TEMPORAL_FRESHNESS';

// ==========================================
// 3. Rule Operators
// ==========================================

export type CriterionOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'IN'
  | 'NOT_IN'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'MATCHES'
  | 'EXISTS'
  | 'NOT_EXISTS'
  | 'COUNT_AT_LEAST'
  | 'COUNT_AT_MOST'
  | 'THRESHOLD_AT_LEAST'
  | 'THRESHOLD_AT_MOST'
  | 'ANY'
  | 'ALL'
  | 'NONE';

// ==========================================
// 4. Missing, Unknown & Conflict Policies
// ==========================================

export type MissingDataPolicy =
  | 'MISSING_IS_UNKNOWN'
  | 'MISSING_FAILS_REQUIRED'
  | 'MISSING_ALLOWED';

export type UnknownDataPolicy =
  | 'UNKNOWN_FAILS_MANDATORY'
  | 'UNKNOWN_YIELDS_UNCERTAIN'
  | 'UNKNOWN_ALLOWED';

export type ConflictPolicy =
  | 'STRICT_CONTRADICTION'
  | 'PERMISSIVE';

// ==========================================
// 5. Qualification Criterion & Profile
// ==========================================

export interface QualificationCriterion {
  id: string;
  type: CriterionType;
  field?: string; // For CUSTOM_FIELD or targeted subfield extraction
  operator: CriterionOperator;
  expectedValue?: any;
  mandatory: boolean;
  weight?: number;
  description?: string;
  minimumEvidenceStrength?: ContactEvidenceStrength;
}

export interface QualificationThresholds {
  minimumScore?: number;
}

export interface QualificationProfile {
  profileId: string;
  profileName: string;
  version: string;
  criteria: QualificationCriterion[];
  thresholds?: QualificationThresholds;
  missingDataPolicy: MissingDataPolicy;
  unknownDataPolicy: UnknownDataPolicy;
  conflictPolicy: ConflictPolicy;
  defaultEvidenceStrength?: ContactEvidenceStrength;
  enabled: boolean;
  metadata?: Record<string, any>;
}

import type {
  BusinessIntelligenceProfile,
  BusinessCompletenessMetrics
} from './businessIntelligence.ts';

// ==========================================
// 6. Evaluation Context
// ==========================================

export interface CandidateEvaluationContext {
  entityId: string;
  canonicalDisplayName?: string;
  normalizedCandidate?: NormalizedCandidate;
  websiteState?: string;
  websiteEvidence?: any[];
  resolvedEntityGroup?: ResolvedEntityGroup;
  relevanceResult?: EntityRelevanceResult;
  mapsVerificationResult?: MapsVerificationIntegrationResult;
  contactEnrichment?: ContactEnrichmentResult;
  sourceContributions?: SourceContribution[];
  derivedFrom?: string[];
  evaluatedAt?: string;
  // Phase 23 Additions:
  businessIntelligence?: BusinessIntelligenceProfile;
  websiteIntelligence?: any;
  contactIntelligence?: any;
}

// ==========================================
// 7. Criterion Result & Decision Model
// ==========================================

export interface CriterionEvaluationResult {
  criterionId: string;
  criterionType: CriterionType;
  operator: CriterionOperator;
  expectedValue: any;
  actualValue: any;
  outcome: CriterionOutcome;
  mandatory: boolean;
  weight: number;
  scoreContribution: number;
  evidence: any[];
  reasonCode: string;
  explanation: string;
}

export interface QualificationScoreSummary {
  totalScore: number;
  maxPossibleScore: number;
  threshold: number;
  thresholdPassed: boolean;
}

export interface QualificationReasonNode {
  criterionId: string;
  criterionType: CriterionType;
  outcome: CriterionOutcome;
  mandatory: boolean;
  weight: number;
  scoreContribution: number;
  explanation: string;
  evidenceCount: number;
  sources: string[];
}

export interface QualificationReasonGraph {
  finalStatus: AdvancedQualificationState;
  primaryRationale: string;
  summaryText: string;
  nodes: QualificationReasonNode[];
  passingFactors: string[];
  failingFactors: string[];
  uncertainFactors: string[];
  contradictoryFactors: string[];
  blockingFactors: string[];
}

export interface QualificationDecision {
  entityId: string;
  status: AdvancedQualificationState;
  profileId: string;
  profileVersion: string;
  evaluatorVersion: string;
  evaluatedAt: string;
  criterionResults: CriterionEvaluationResult[];
  scoreSummary: QualificationScoreSummary;
  blockingReasons: string[];
  contradictionReasons: string[];
  unknownReasons: string[];
  failureReasons: string[];
  supportingEvidence: any[];
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  derivedFrom: string[];
  sourceRestrictions: {
    isRestricted: boolean;
    restrictionBasis: PolicyRestrictionBasis;
    policyStatus: PolicyStatus;
    persistenceEligibility: PersistenceStatus;
    exportEligibility: ExportStatus;
  };
  diagnostics: {
    errors: string[];
    warnings: string[];
    notices: string[];
  };
  // Phase 23 Additions:
  reasonGraph?: QualificationReasonGraph;
  completenessMetrics?: BusinessCompletenessMetrics;
}
