/**
 * LeadNoria — Phase 14: Unified Multi-Source Architecture
 * Pipeline Types & Common Contracts
 * 
 * Non-Negotiable Invariants:
 * - One common orchestration layer over multiple source-specific adapters
 * - Google Maps remains strictly CONTRACT_ONLY
 * - Provenance, recursive lineage, and source restrictions are preserved
 * - Source isolation: failures in one source do not corrupt other sources
 * - Explicit typed capability gating and stage completeness
 */

import {
  ProvenanceType,
  SourceContribution,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus,
  NormalizedCandidate
} from '../extraction/types.ts';
import { AdvancedQualificationState, QualificationDecision } from '../qualification/qualificationTypes.ts';
import { EntityRelevanceResult } from '../relevance/types.ts';
import { WebsiteVerificationRecord } from '../types.ts';
import { ContactEnrichmentResult } from '../enrichment/contactTypes.ts';
import { GeographicArea } from '../geography/geographicTypes.ts';

export const PIPELINE_VERSION = '1.0.0-phase14';
export const ORCHESTRATION_VERSION = '1.0.0';

export type SourceType =
  | 'META'
  | 'GOOGLE_MAPS'
  | 'USER_PROVIDED'
  | 'WEBSITE'
  | 'META_AD_LIBRARY'
  | 'USER_PROVIDED_DOMAIN'
  | 'FUTURE_SOURCE';

// ==========================================
// 1. Pipeline Stage Identifiers
// ==========================================

export type PipelineStageId =
  | 'SOURCE_PLANNING'
  | 'SOURCE_EXECUTION'
  | 'NORMALIZATION'
  | 'ENTITY_RESOLUTION'
  | 'EVIDENCE'
  | 'RELEVANCE'
  | 'WEBSITE_VERIFICATION'
  | 'CONTACT_ENRICHMENT'
  | 'QUALIFICATION'
  | 'GEOGRAPHIC_ACCOUNTING'
  | 'PERSISTENCE'
  | 'EXPORT';

export const ORDERED_PIPELINE_STAGES: PipelineStageId[] = [
  'SOURCE_PLANNING',
  'SOURCE_EXECUTION',
  'NORMALIZATION',
  'ENTITY_RESOLUTION',
  'EVIDENCE',
  'RELEVANCE',
  'WEBSITE_VERIFICATION',
  'CONTACT_ENRICHMENT',
  'QUALIFICATION',
  'GEOGRAPHIC_ACCOUNTING',
  'PERSISTENCE',
  'EXPORT'
];

// ==========================================
// 2. Stage Capability States & Source Capabilities
// ==========================================

export type StageCapabilityState =
  | 'SUPPORTED'
  | 'CONTRACT_ONLY'
  | 'NOT_SUPPORTED'
  | 'RESTRICTED';

export type ExecutionMode =
  | 'LIVE'
  | 'DRY_RUN'
  | 'REPLAY'
  | 'VALIDATION_ONLY';

export type RestrictionClass =
  | 'UNRESTRICTED'
  | 'POLICY_GATED'
  | 'RESTRICTED_CONSUMER_WEB'
  | 'INTERNAL_ONLY';

export interface SourceCapability {
  sourceType: SourceType;
  adapterVersion: string;
  implementationState: 'LIVE' | 'CONTRACT_ONLY' | 'MOCK' | 'DISABLED';
  stages: Record<PipelineStageId, StageCapabilityState>;
  supportedExecutionModes: ExecutionMode[];
  supportedDataTypes: string[];
  restrictionClass: RestrictionClass;
  supportsLiveExtraction: boolean;
  supportsReplay: boolean;
  supportsDryRun: boolean;
  version: string;
}

// ==========================================
// 3. Completeness & Lifecycle States
// ==========================================

export type StageCompleteness =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'BLOCKED'
  | 'FAILED'
  | 'UNKNOWN';

export type SourceLifecycleStatus =
  | 'PLANNED'
  | 'VALIDATED'
  | 'READY'
  | 'RUNNING'
  | 'PARTIAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'SKIPPED'
  | 'CONTRACT_ONLY'
  | 'UNKNOWN';

export type GlobalRunStatus =
  | 'PLANNED'
  | 'READY'
  | 'RUNNING'
  | 'PARTIAL'
  | 'COMPLETED'
  | 'COMPLETED_WITH_WARNINGS'
  | 'BLOCKED'
  | 'FAILED'
  | 'CANCELLED';

// ==========================================
// 4. Source Record Identity
// ==========================================

export interface SourceRecordKey {
  sourceType: SourceType;
  sourceNamespace: string;
  sourceRecordId: string;
  sourceRecordVersion?: string;
}

export function formatSourceRecordKey(key: SourceRecordKey): string {
  return `${key.sourceType}::${key.sourceNamespace}::${key.sourceRecordId}${key.sourceRecordVersion ? '@' + key.sourceRecordVersion : ''}`;
}

// ==========================================
// 5. Common Candidate Envelope & Restrictions
// ==========================================

export interface FieldEligibility {
  isEligible: boolean;
  restrictionBasis?: string;
  sourceProvenance: ProvenanceType;
}

export interface CandidateRestrictions {
  isRestricted: boolean;
  persistenceEligible: boolean;
  exportEligible: boolean;
  displayEligible: boolean;
  qualificationEligible: boolean;
  restrictionBasis?: string;
}

export interface CandidateEnvelope {
  candidateId: string;
  sourceKey: SourceRecordKey;
  sourceVersion: string;
  rawReference?: unknown;
  normalizedCandidate?: NormalizedCandidate;
  sourceContributions: SourceContribution[];
  provenance: ProvenanceType;
  restrictions: CandidateRestrictions;
  fieldEligibility: Record<string, FieldEligibility>;
  stageStates: Record<PipelineStageId, StageCompleteness>;
  evidence: any[];
  relevanceResult?: EntityRelevanceResult;
  websiteVerificationResult?: WebsiteVerificationRecord;
  contactEnrichmentResult?: ContactEnrichmentResult;
  qualificationDecision?: QualificationDecision;
  geographicObservations: GeographicArea[];
  diagnostics: {
    warnings: string[];
    errors: string[];
    notes: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. Unified Research Record (Multi-Source Result)
// ==========================================

export interface UnifiedResearchRecord {
  recordId: string;
  entityId: string;
  canonicalDisplayName: string;
  sourceRecords: SourceRecordKey[];
  primarySource: SourceType;
  normalizedEntity?: NormalizedCandidate;
  sourceContributions: SourceContribution[];
  provenance: ProvenanceType;
  restrictions: CandidateRestrictions;
  fieldEligibility: Record<string, FieldEligibility>;
  corroborationSources: SourceType[];
  corroborationCount: number;
  stageStates: Record<PipelineStageId, StageCompleteness>;
  evidence: any[];
  relevanceResult?: EntityRelevanceResult;
  websiteVerificationResult?: WebsiteVerificationRecord;
  contactEnrichmentResult?: ContactEnrichmentResult;
  qualificationDecision?: QualificationDecision;
  qualificationState?: AdvancedQualificationState;
  geographicObservations: GeographicArea[];
  diagnostics: {
    warnings: string[];
    errors: string[];
    notes: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 7. Error Model
// ==========================================

export type ErrorSeverity = 'FATAL' | 'ERROR' | 'WARNING';

export interface PipelineError {
  errorCode: string;
  severity: ErrorSeverity;
  sourceType?: SourceType;
  stageId?: PipelineStageId;
  candidateId?: string;
  retryable: boolean;
  policyRelated: boolean;
  message: string;
  causeCode?: string;
  timestamp: string;
  diagnostics?: Record<string, unknown>;
}

// ==========================================
// 8. Pipeline Events
// ==========================================

export type PipelineEventType =
  | 'RUN_PLANNED'
  | 'RUN_STARTED'
  | 'STAGE_STARTED'
  | 'STAGE_COMPLETED'
  | 'STAGE_SKIPPED'
  | 'STAGE_FAILED'
  | 'STAGE_BLOCKED'
  | 'SOURCE_STARTED'
  | 'SOURCE_COMPLETED'
  | 'SOURCE_BLOCKED'
  | 'SOURCE_SKIPPED'
  | 'CHECKPOINT_SAVED'
  | 'RUN_COMPLETED'
  | 'RUN_FAILED';

export interface PipelineEvent {
  eventId: string;
  runId: string;
  type: PipelineEventType;
  sourceType?: SourceType;
  stageId?: PipelineStageId;
  candidateId?: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
