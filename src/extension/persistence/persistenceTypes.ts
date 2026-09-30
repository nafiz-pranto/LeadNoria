/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Persistence Schema & Typed Storage Models
 * 
 * Non-Negotiable Invariants:
 * - Versioned persistence schema with stable resource IDs
 * - Preserves complete field-level provenance and recursive lineage
 * - Preserves Google-derived and source-specific restrictions
 * - Never converts UNKNOWN to FAIL or BLOCKED to PASS
 * - Optimistic versioning with explicit conflict handling
 */

import { ProvenanceType, SourceContribution } from '../extraction/types.ts';
import {
  SourceType,
  CandidateRestrictions,
  FieldEligibility,
  SourceRecordKey,
  PipelineStageId,
  SourceLifecycleStatus,
  CandidateEnvelope,
  UnifiedResearchRecord
} from '../pipeline/pipelineTypes.ts';
import { CriterionEvaluationResult, AdvancedQualificationState } from '../qualification/qualificationTypes.ts';

export const CURRENT_PERSISTENCE_SCHEMA_VERSION = 1;
export const STORAGE_VERSION = '1.0.0';

/**
 * Data classification for persisted fields
 */
export type DataClassification =
  | 'PUBLIC_SOURCE_FACT'
  | 'DERIVED_FACT'
  | 'USER_PROVIDED'
  | 'SYSTEM_METADATA'
  | 'RESTRICTED_SOURCE'
  | 'DIAGNOSTIC'
  | 'EXPORT_PROJECTION';

/**
 * Write operation classes
 */
export type WriteOperationClass =
  | 'CREATE'
  | 'UPSERT'
  | 'PATCH'
  | 'DELETE'
  | 'CHECKPOINT_WRITE'
  | 'EXPORT_MARK';

/**
 * Recovery execution states
 */
export type RecoveryState =
  | 'RUNNING'
  | 'PAUSED'
  | 'INTERRUPTED'
  | 'RESUMABLE'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CANCELLED'
  | 'RECOVERY_REQUIRED'
  | 'RECOVERY_FAILED';

/**
 * Checkpoint two-phase commit state
 */
export type CheckpointCommitState = 'STAGED' | 'COMMITTED';

/**
 * Stored Run Record
 */
export interface RunRecord {
  runId: string;
  runVersion: string;
  schemaVersion: number;
  recordVersion: number;
  selectedSources: SourceType[];
  globalExecutionMode: string;
  status: string;
  recoveryState: RecoveryState;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  configFingerprint: string;
  activeStage?: PipelineStageId;
  completedStages: PipelineStageId[];
  candidateCount: number;
  entityCount: number;
  checkpointId?: string;
  exportAuditIds: string[];
  diagnostics: {
    warnings: string[];
    errors: string[];
    blockedCount: number;
  };
}

/**
 * Stored Source Plan Record
 */
export interface SourcePlanRecord {
  planId: string;
  runId: string;
  sourceType: SourceType;
  adapterVersion: string;
  planVersion: string;
  executionMode: string;
  capabilityState: string;
  policyVersion: string;
  configFingerprint: string;
  schemaVersion: number;
  createdAt: string;
}

/**
 * Stored Pipeline State Record
 */
export interface PipelineStateRecord {
  runId: string;
  schemaVersion: number;
  recordVersion: number;
  activeStage?: PipelineStageId;
  completedStages: PipelineStageId[];
  sourceStatuses: Record<string, SourceLifecycleStatus>;
  stageStates: Record<string, string>;
  updatedAt: string;
}

/**
 * Stored Candidate Record
 */
export interface CandidateRecord {
  candidateId: string;
  runId: string;
  schemaVersion: number;
  recordVersion: number;
  sourceKey: SourceRecordKey;
  provenance: ProvenanceType;
  restrictions: CandidateRestrictions;
  fieldEligibility: Record<string, FieldEligibility>;
  sourceContributions: SourceContribution[];
  displayName: string;
  envelope: CandidateEnvelope;
  classification: DataClassification;
  createdAt: string;
  updatedAt: string;
}

/**
 * Stored Entity Record (Deduplicated resolved entity)
 */
export interface EntityRecord {
  entityId: string;
  runId: string;
  schemaVersion: number;
  recordVersion: number;
  canonicalDisplayName: string;
  candidateIds: string[];
  primarySource: SourceType;
  provenance: ProvenanceType;
  restrictions: CandidateRestrictions;
  aliases: string[];
  resolvedAt: string;
  updatedAt: string;
}

/**
 * Stored Evidence Record
 */
export interface EvidenceRecord {
  evidenceId: string;
  runId: string;
  candidateId?: string;
  entityId?: string;
  schemaVersion: number;
  fact: string;
  source: SourceType;
  evidenceType: string;
  provenance: ProvenanceType;
  classification: DataClassification;
  confidence?: string;
  isRestricted: boolean;
  observedAt: string;
}

/**
 * Stored Qualification Record
 */
export interface QualificationRecord {
  evaluationId: string;
  runId: string;
  candidateId?: string;
  entityId?: string;
  schemaVersion: number;
  profileId: string;
  profileVersion: string;
  evaluatorVersion: string;
  status: AdvancedQualificationState;
  score?: number;
  criteriaResults: CriterionEvaluationResult[];
  reasons: string[];
  evaluatedAt: string;
}

/**
 * Stored Geographic Accounting Record
 */
export interface GeographicAccountingRecord {
  accountingId: string;
  runId: string;
  schemaVersion: number;
  planId: string;
  areaId: string;
  searchUnitId: string;
  uniqueEntities: number;
  duplicateRate: number;
  unresolvedRate: number;
  isSaturated: boolean;
  recordedAt: string;
}

/**
 * Stored Checkpoint Record
 */
export interface CheckpointRecord {
  checkpointId: string;
  runId: string;
  runVersion: string;
  planVersion: string;
  pipelineVersion: string;
  schemaVersion: number;
  commitState: CheckpointCommitState;
  createdAt: string;
  completedStages: PipelineStageId[];
  activeStage?: PipelineStageId;
  sourceStates: Record<string, SourceLifecycleStatus>;
  candidateReferences: string[];
  entityReferences: string[];
  policyVersions: Record<string, string>;
  adapterVersions: Record<string, string>;
  checksum: string;
}

/**
 * Stored Export Audit Record
 */
export interface ExportAuditRecord {
  exportId: string;
  runId: string;
  schemaVersion: number;
  projectionVersion: number;
  policyVersion: string;
  format: 'CSV' | 'JSON';
  requestedAt: string;
  completedAt?: string;
  selectedRecordCount: number;
  exportedRecordCount: number;
  excludedRecordCount: number;
  blockedFieldCount: number;
  checksum?: string;
  status: 'STARTED' | 'WRITING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  failureReason?: string;
}

/**
 * Persistence Operation Log Entry
 */
export interface OperationLogEntry {
  opId: string;
  runId: string;
  opClass: WriteOperationClass;
  resourceType: string;
  resourceId: string;
  version: number;
  timestamp: string;
}

/**
 * Storage Statistics
 */
export interface StorageStats {
  schemaVersion: number;
  totalRuns: number;
  totalCandidates: number;
  totalEntities: number;
  totalEvidence: number;
  totalCheckpoints: number;
  totalExportAudits: number;
  estimatedBytes: number;
  quotaBytes?: number;
}

/**
 * Referential Integrity Diagnostic
 */
export interface ReferentialIntegrityReport {
  isValid: boolean;
  brokenRunReferences: string[];
  orphanedCandidates: string[];
  orphanedEvidence: string[];
  orphanedQualifications: string[];
  orphanedCheckpoints: string[];
}

/**
 * Error Codes for Phase 16
 */
export type PersistenceErrorCode =
  | 'VERSION_CONFLICT'
  | 'CHECKPOINT_CORRUPT'
  | 'CHECKPOINT_INCOMPLETE'
  | 'INCOMPATIBLE_STORAGE_VERSION'
  | 'INVALID_PERSISTED_RECORD'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'RECORD_TOO_LARGE'
  | 'LINEAGE_TOO_DEEP'
  | 'RESOURCE_NOT_FOUND'
  | 'REFERENTIAL_INTEGRITY_BREACH'
  | 'RESTRICTION_FIREWALL_BREACH'
  | 'EXPORT_POLICY_BLOCKED';

export class PersistenceError extends Error {
  readonly code: PersistenceErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: PersistenceErrorCode, message: string, details?: Record<string, unknown>) {
    super(`[${code}] ${message}`);
    this.name = 'PersistenceError';
    this.code = code;
    this.details = details;
  }
}
