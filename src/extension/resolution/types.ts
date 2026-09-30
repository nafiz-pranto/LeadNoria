/**
 * LeadNoria Entity Resolution & Deduplication Types (Phase 8)
 *
 * Defines the canonical entity clustering, relationship classification,
 * evidence tracking, contradiction detection, and deduplication contracts.
 *
 * Adheres strictly to the LeadNoria Provenance & Data Firewall invariants.
 */

import type {
  NormalizedCandidate,
  SourceContribution,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus,
  ProvenanceType
} from '../extraction/types.ts';

export type ResolutionStatus =
  | 'STRONG_MATCH'
  | 'MODERATE_MATCH'
  | 'WEAK_MATCH'
  | 'UNRESOLVED'
  | 'CONFLICTING_IDENTITY';

export type ResolutionConfidence =
  | 'STRONG'
  | 'MODERATE'
  | 'WEAK'
  | 'UNRESOLVED';

export type EntityRelationshipType =
  | 'SAME_ENTITY'
  | 'SAME_PARENT_BRAND_DIFFERENT_BRANCH'
  | 'POSSIBLE_SAME_ENTITY'
  | 'POSSIBLE_BRANCH'
  | 'DIFFERENT_ENTITY'
  | 'CONFLICTING_ENTITY'
  | 'UNRESOLVED';

export interface IdentityEvidenceItem {
  field: string;
  relationship: string;
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
  description?: string;
  candidateAId?: string;
  candidateBId?: string;
}

export interface IdentityConflictItem {
  field: string;
  conflictType: string;
  description: string;
  candidateAId?: string;
  candidateBId?: string;
}

export interface BranchSignal {
  type: 'KEYWORD' | 'LOCALITY' | 'ADDRESS_DELTA' | 'EXPLICIT_LABEL' | 'URL_SLUG';
  token: string;
  confidence: 'STRONG' | 'MODERATE';
}

export interface EntityPolicySummary {
  overallPolicyStatus: PolicyStatus;
  overallPersistenceStatus: PersistenceStatus;
  overallExportStatus: ExportStatus;
  overallProvenance: ProvenanceType;
  isRestricted: boolean;
  hasGoogleConsumerWebLineage: boolean;
  hasGoogleApiLineage: boolean;
  hasMetaLineage: boolean;
  hasWebsiteLineage: boolean;
  hasUserProvidedLineage: boolean;
}

export interface ResolvedEntityGroup {
  entityId: string;
  canonicalDisplayName: string;
  canonicalComparisonName: string;
  aliases: string[];
  sourceRecords: NormalizedCandidate[];
  sourceIds: Array<{
    sourceType: string;
    sourceContext?: string;
    sourceRecordId: string;
  }>;
  domains: string[];
  phones: string[];
  addresses: string[];
  locations: string[];
  branchSignals: BranchSignal[];
  branchEntityIds: string[];
  parentEntityId?: string;
  identityEvidence: IdentityEvidenceItem[];
  identityConflicts: IdentityConflictItem[];
  resolutionStatus: ResolutionStatus;
  resolutionConfidence: ResolutionConfidence;
  resolutionReasonCodes: string[];
  sourceContributions: SourceContribution[];
  derivedFrom: SourceContribution[];
  policySummary: EntityPolicySummary;
  createdAt: string;
}

export interface CandidatePairComparison {
  candidateAId: string;
  candidateBId: string;
  relationshipType: EntityRelationshipType;
  resolutionStatus: ResolutionStatus;
  confidence: ResolutionConfidence;
  reasons: string[];
  evidence: IdentityEvidenceItem[];
  conflicts: IdentityConflictItem[];
  branchSignals: BranchSignal[];
}

export interface EntityRelationshipLink {
  entityAId: string;
  entityBId: string;
  relationshipType: EntityRelationshipType;
  reason: string;
  confidence: ResolutionConfidence;
  evidence: IdentityEvidenceItem[];
}

export interface DeduplicationSummary {
  sourceRecordCount: number;
  uniqueEntityCount: number;
  duplicateRecordCount: number;
  sameEntityMerges: number;
  branchRelationships: number;
  unresolvedRecords: number;
  conflictingIdentities: number;
  elapsedMs?: number;
  throughputOpsSec?: number;
  // Candidate-pair benchmark metrics (8A)
  candidatePairsGenerated?: number;
  detailedComparisons?: number;
  indexEntries?: number;
  maxBucketSize?: number;
  avgBucketSize?: number;
  // Cluster validation metrics (8B)
  provisionalClusters?: number;
  finalClusters?: number;
  clusterConflictChecks?: number;
  clusterSplits?: number;
}

export interface EntityResolutionResult {
  entities: ResolvedEntityGroup[];
  relationships: EntityRelationshipLink[];
  recordToEntityMap: Record<string, string>;
  summary: DeduplicationSummary;
}

export interface ResolutionOptions {
  enableBranchDetection?: boolean;
  allowCrossSourceMatching?: boolean;
  strictMarketplaceGuards?: boolean;
  strictGenericNameGuards?: boolean;
  runId?: string;
}
