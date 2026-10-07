/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Presentation Layer View Models & State Interfaces
 * 
 * Non-Negotiable Principles:
 * - View models transform domain state for presentation without altering business semantics
 * - Authoritative states preserved:
 *   SKIPPED != NOT_QUALIFIED
 *   BLOCKED != NOT_FOUND
 *   CONTRACT_ONLY != COMPLETED
 *   UNKNOWN != FAIL
 *   PARTIAL != COMPLETE
 *   NOT_FOUND != UNKNOWN
 * - No subjective marketing labels ("Hot", "Gold", "High-converting")
 */

import { SourceType, PipelineStageId, ExecutionMode, StageCompleteness } from '../pipeline/pipelineTypes.ts';

export type NavigationTab = 'RESEARCH' | 'RUN_STATUS' | 'RESULTS' | 'ANALYTICS' | 'HISTORY' | 'SETTINGS';

export type DisplayableSourceState = 
  | 'AVAILABLE'
  | 'CONTRACT_ONLY'
  | 'NOT_SUPPORTED'
  | 'RESTRICTED'
  | 'BLOCKED'
  | 'DISABLED';

export interface SourceOptionViewModel {
  sourceType: SourceType;
  label: string;
  badgeLabel: string;
  state: DisplayableSourceState;
  explanation: string;
  supportsLive: boolean;
  supportsDryRun: boolean;
  supportsReplay: boolean;
}

export interface ResearchConfigViewModel {
  selectedSource: SourceType;
  geographicScope: {
    country: string;
    region?: string;
    city?: string;
    customArea?: string;
    isAmbiguous?: boolean;
  };
  queryScope: {
    presetId?: string;
    rawInput: string;
    parsedTerms: string[];
  };
  executionMode: ExecutionMode;
  qualificationProfileId: string;
  qualificationProfileVersion: string;
  limits: {
    maxCandidates: number;
    timeoutMs: number;
  };
  enabledStages: PipelineStageId[];
}

export interface PlanReviewViewModel {
  sourceType: SourceType;
  executionMode: ExecutionMode;
  plannedSearchUnitsCount: number;
  selectedCategoriesCount: number;
  enabledStages: PipelineStageId[];
  qualificationProfileName: string;
  maxCandidatesLimit: number;
  timeoutSeconds: number;
  checkpointEnabled: boolean;
  safetyWarnings: string[];
  canExecuteLive: boolean;
  blockedReason?: string;
  keywords?: string[];
  countryCode?: string;
  locationName?: string;
}

export interface StageStatusViewModel {
  stageId: PipelineStageId;
  label: string;
  state: StageCompleteness;
  stateText: string;
  isCompleted: boolean;
  isActive: boolean;
  isBlocked: boolean;
  isSkipped: boolean;
  isFailed: boolean;
  itemsProcessed?: number;
  durationMs?: number;
  error?: string;
}

export interface RunStatusViewModel {
  runId: string;
  runVersion: string;
  globalStatus: 'PLANNED' | 'READY' | 'RUNNING' | 'PARTIAL' | 'COMPLETED' | 'COMPLETED_WITH_WARNINGS' | 'BLOCKED' | 'FAILED' | 'CANCELLED';
  globalStatusText: string;
  activeSource: SourceType;
  sourceStatus: string;
  currentStage?: PipelineStageId;
  stages: StageStatusViewModel[];
  candidatesProcessed: number;
  searchUnitsCompleted?: number;
  searchUnitsTotal?: number;
  hasWarnings: boolean;
  warningMessages: string[];
  isPausable: boolean;
  isResumable: boolean;
  isStoppable: boolean;
  checkpointId?: string;
  checkpointTimestamp?: string;
  elapsedMs: number;
  errorMessage?: string;
  canRetry: boolean;
}

export interface ResultRowViewModel {
  recordId: string;
  entityId: string;
  displayName: string;
  primarySource: SourceType;
  provenance: string;
  isMixedProvenance: boolean;
  relevanceDecision: 'RELEVANT' | 'UNCERTAIN' | 'NOT_RELEVANT';
  websiteState: string;
  websiteUrl?: string;
  contactSummary: {
    hasPhone: boolean;
    hasEmail: boolean;
    hasAddress: boolean;
    hasContactForm: boolean;
    hasSocialLinks: boolean;
    phoneText?: string;
    emailText?: string;
  };
  qualificationState: 'QUALIFIED' | 'NOT_QUALIFIED' | 'UNCERTAIN' | 'BLOCKED' | 'NOT_STARTED';
  qualificationScore?: number;
  geographicContext?: string;
  isRestricted: boolean;
  isExportable: boolean;
  isPersistable: boolean;
  restrictionBadgeText?: string;
  corroborationCount: number;

  // Phase 25 Unified Lead Intelligence extensions
  category?: string;
  sourceBadges?: Array<{ sourceType: SourceType | string; label: string; isRestricted: boolean }>;
  dataSignals?: {
    websiteVerified: boolean;
    contactAvailable: boolean;
    publicPersonAvailable: boolean;
    advertisingEvidence: boolean;
    freshness: 'CURRENT' | 'STALE' | 'UNKNOWN';
    freshnessLabel: string;
  };
  qualityMetrics?: {
    completenessPercent: number;
    contactCompletenessPercent: number;
    evidenceCoveragePercent: number;
    corroborationCount: number;
    contradictionCount: number;
  };
  friendlyQualificationState?: string;
  friendlyFreshnessState?: string;
  lastObservedText?: string;
  canonicalRecord?: any;

  // Part 3 Google Maps Rating & Website Filter fields
  rating?: {
    availability: string;
    parsedValue?: number;
    rawValue?: string;
  };
  websiteAvailability?: string;
}
export type LeadResultRowViewModel = ResultRowViewModel;

export interface EvidenceItemViewModel {
  id: string;
  fact: string;
  sourceFamily: string;
  evidenceType: string;
  pageOrSourceReference: string;
  observationState: 'OBSERVED' | 'UNCONFIRMED' | 'CONTRADICTED' | 'AMBIGUOUS';
  provenance: string;
  isRestricted: boolean;
  restrictionNotice?: string;
}

export interface QualificationCriterionViewModel {
  criterionId: string;
  name: string;
  isMandatory: boolean;
  status: 'PASS' | 'FAIL' | 'UNKNOWN' | 'BLOCKED' | 'CONTRADICTORY';
  scoreAwarded?: number;
  maxScore?: number;
  explanation: string;
  reasonCode: string;
  referencedEvidence: string[];
}

export interface ResultDetailViewModel {
  recordId: string;
  entityId: string;
  displayName: string;
  legalName?: string;
  aliases: string[];
  identityConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNRESOLVED';
  contradictionFlags: string[];

  // Sources & Provenance
  primarySource: SourceType;
  contributingSources: SourceType[];
  provenanceLineage: string;
  provenanceClassification: 'DIRECT_SOURCE' | 'DERIVED' | 'MIXED';

  // Relevance
  relevanceDecision: 'RELEVANT' | 'UNCERTAIN' | 'NOT_RELEVANT';
  relevanceConfidence: string;
  relevanceExplanation: string;
  relevanceMatchedTerms: string[];

  // Website Verification
  websiteUrl?: string;
  websiteVerificationStatus: string;
  websiteIdentityMatchLevel?: string;
  websiteVerifiedAt?: string;

  // Contact Facts
  phones: Array<{ number: string; type: string; observation: string }>;
  emails: Array<{ address: string; classification: string; observation: string }>;
  addresses: Array<{ addressLine: string; locality?: string; postalCode?: string; isBranch: boolean }>;
  hasContactForm: boolean;
  socialLinks: Array<{ platform: string; url: string }>;

  // Qualification
  qualificationState: 'QUALIFIED' | 'NOT_QUALIFIED' | 'UNCERTAIN' | 'BLOCKED' | 'NOT_STARTED';
  qualificationProfileName: string;
  qualificationProfileVersion: string;
  qualificationScoreText?: string;
  mandatoryCriteria: QualificationCriterionViewModel[];
  optionalCriteria: QualificationCriterionViewModel[];
  qualificationSummaryExplanation: string;

  // Evidence Ledger
  evidenceItems: EvidenceItemViewModel[];

  // Restrictions & Compliance
  isRestricted: boolean;
  isExportable: boolean;
  isPersistable: boolean;
  fieldEligibility: Record<string, { isEligible: boolean; notice?: string }>;
  restrictionExplanation?: string;

  // Metadata
  runId: string;
  createdAt: string;
  updatedAt: string;

  // Phase 25 Unified Detail Sections
  category?: string;
  sourceBadges?: Array<{ sourceType: SourceType | string; label: string; isRestricted: boolean }>;
  identityDetails?: {
    canonicalBusinessName: string;
    aliases: string[];
    entityType: string;
    entityTypeLabel: string;
    branchInfo?: {
      isBranch: boolean;
      isParent: boolean;
      parentEntityId?: string;
      branchSignals: string[];
    };
  };
  businessDetails?: {
    categories: string[];
    services: string[];
    description?: string;
    hours?: string;
    serviceAreas: string[];
    businessStatus?: string;
  };
  locationDetails?: {
    address?: string;
    city?: string;
    region?: string;
    country?: string;
    coordinates?: string;
    addresses: string[];
  };
  digitalPresence?: {
    websiteUrl?: string;
    domain?: string;
    cms?: string;
    booking?: boolean;
    ecommerce?: boolean;
    chat?: boolean;
    analytics?: string[];
    technologySignals?: string[];
    socialLinks: Array<{ platform: string; url: string }>;
  };
  contactsDetails?: {
    emails: Array<{
      address: string;
      classification?: string;
      source?: string;
      isRestricted?: boolean;
      observedAt?: string;
      hasConflict?: boolean;
      alternatives?: any[];
    }>;
    phones: Array<{
      number: string;
      type?: string;
      source?: string;
      isRestricted?: boolean;
      observedAt?: string;
      hasConflict?: boolean;
      alternatives?: any[];
    }>;
    forms: string[];
  };
  peopleDetails?: Array<{
    name: string;
    canonicalName?: string;
    titles: string[];
    emails: string[];
    phones: string[];
    linkedInUrl?: string;
    isRestricted?: boolean;
    associatedContacts?: string[];
  }>;
  qualificationDetails?: {
    finalState: string;
    friendlyFinalState: string;
    profileId?: string;
    profileName?: string;
    explanation?: string;
    whyReasons: Array<{ label: string; passed: boolean; explanation?: string }>;
    potentialIssues: Array<{ label: string; explanation?: string }>;
    criteria: Array<{
      criterionId: string;
      name: string;
      isMandatory: boolean;
      status: string;
      friendlyStatus: string;
      scoreAwarded?: number;
      maxScore?: number;
      explanation: string;
      reasonCode: string;
    }>;
  };
  evidenceDetails?: {
    totalCount: number;
    items: Array<{
      id: string;
      fact: string;
      source: string;
      sourceUrl?: string;
      observedAt: string;
      corroboration?: string[];
      isRestricted: boolean;
    }>;
    fieldEvidence?: Array<{
      fieldName: string;
      value: string;
      sources: string[];
      observedAt: string;
      evidenceNote?: string;
    }>;
    conflicts?: Array<{
      field: string;
      description: string;
      conflictingValues: Array<{ value: string; source: string; observedAt: string }>;
    }>;
  };
  freshnessDetails?: {
    overallState: 'CURRENT' | 'STALE' | 'UNKNOWN';
    friendlyLabel: string;
    firstObservedAt?: string;
    lastObservedAt?: string;
    perSource: Array<{ source: string; state: string; friendlyState: string; lastObservedAt: string; count?: number }>;
  };
  qualityDetails?: {
    completenessPercent: number;
    contactCompletenessPercent: number;
    evidenceCoveragePercent: number;
    corroborationCount: number;
    contradictionCount: number;
  };
  canonicalRecord?: any;
}

export interface ExportPreviewViewModel {
  totalSelectedRecords: number;
  exportableRecordsCount: number;
  restrictedRecordsCount: number;
  blockedDueToComplianceCount: number;
  eligibleFields: string[];
  restrictedFieldsOmitted: string[];
  policyNotice: string;
  isExportReady: boolean;
}

export interface CheckpointRecoveryViewModel {
  runId: string;
  sourceType: SourceType;
  planVersion: string;
  pipelineVersion: string;
  lastCompletedStage: PipelineStageId;
  savedCandidateCount: number;
  checkpointTimestamp: string;
  isCompatible: boolean;
  incompatibilityReason?: string;
}

export interface DiagnosticsViewModel {
  runId: string;
  pipelineVersion: string;
  adapterVersions: Record<string, string>;
  planVersion: string;
  currentStage?: PipelineStageId;
  elapsedDurationMs: number;
  sourceStatuses: Record<string, string>;
  blockedOperationsCount: number;
  retriesAttempted: number;
  checkpointId?: string;
  memoryDiagnostics?: {
    heapUsedMB?: number;
    envelopesCount: number;
  };
}
