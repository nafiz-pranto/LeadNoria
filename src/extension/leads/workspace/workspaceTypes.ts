/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Core Type Contracts & Domain Models
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. ONLY ExportSafeLead data may enter durable workspace storage.
 * 2. Absolutely zero Google Maps fields (Place ID, Maps URL, rating, review count, etc.).
 * 3. Research candidate correlation pointers are simple boolean flags that cannot reconstruct restricted candidates.
 * 4. Deterministic lifecycle state machine (NEW -> ACTIVE -> CONTACTED -> QUALIFIED -> ARCHIVED).
 * 5. Bounded user metadata (notes length, tags count, tag length) with formula injection and sentinel shields.
 */

import type {
  IndependentSourceClass,
  PublicContactEvidence,
  PublicPersonEvidence,
  PublicWebsiteEvidence
} from '../leadTypes.ts';

import type { ReviewState } from '../../acquisition/review/reviewTypes.ts';

/**
 * Current durable workspace storage schema version.
 */
export const WORKSPACE_SCHEMA_VERSION = 1;

/**
 * Lead Lifecycle States.
 * Every lifecycle state is explicit, deterministic, and non-arbitrary.
 */
export type LeadLifecycleState =
  | 'NEW'
  | 'ACTIVE'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'DISQUALIFIED'
  | 'ON_HOLD'
  | 'ARCHIVED';

/**
 * User-assigned priority tier.
 */
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Follow-up workflow status.
 * Strictly user-owned; never inferred from Google data.
 */
export type FollowUpStatus = 'NONE' | 'PENDING' | 'DONE' | 'CANCELLED';

/**
 * User-owned metadata constraints.
 */
export const METADATA_CONSTRAINTS = {
  MAX_NOTES_LENGTH: 10000,
  MAX_TAGS_COUNT: 30,
  MAX_TAG_LENGTH: 50,
  MAX_CUSTOM_STATUS_NOTE_LENGTH: 200,
  MAX_ASSIGNEE_LABEL_LENGTH: 100
} as const;

/**
 * User-owned metadata contract for a persistent lead.
 */
export interface UserLeadMetadata {
  readonly notes: string;
  readonly tags: readonly string[];
  readonly priority: LeadPriority;
  readonly customStatusNote?: string;
  readonly followUpDate?: string;
  readonly followUpStatus: FollowUpStatus;
  readonly followUpNote?: string;
  readonly assigneeLabel?: string;
}

/**
 * Safe provenance metadata for durable persistence.
 * Note: hasResearchCorrelation is a boolean flag ONLY. Zero candidate IDs, Place IDs, or snapshots are stored.
 */
export interface SafeLeadProvenance {
  readonly sourceClass: IndependentSourceClass;
  readonly isRestricted: false;
  readonly exportEligibility: 'ELIGIBLE' | 'BLOCKED';
  readonly anchorVerifiedAt: string;
  readonly hasResearchCorrelation: boolean;
}

/**
 * Audit trail metadata for a persisted lead.
 */
export interface PersistedLeadAuditMetadata {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number; // Optimistic locking version counter
}

/**
 * PersistedLeadRecord Contract.
 * The authoritative durable representation of an ExportSafeLead.
 * STRICT ALLOWLIST: Zero Google Maps-derived fields can exist within this record.
 */
export interface PersistedLeadRecord {
  readonly schemaVersion: number;
  readonly leadId: string;
  readonly sourceClass: IndependentSourceClass;
  readonly independentSourceId: string;
  readonly businessIdentity: {
    readonly businessName: string;
    readonly domain: string;
    readonly canonicalUrl: string;
  };
  readonly publicWebsite: PublicWebsiteEvidence;
  readonly publicContacts: PublicContactEvidence;
  readonly publicPerson: PublicPersonEvidence;
  readonly qualification: {
    readonly status: 'QUALIFIED' | 'NEEDS_REVIEW' | 'DISQUALIFIED';
    readonly overallReadiness: number;
    readonly passedRules: readonly string[];
  };
  readonly reviewOutcome: {
    readonly reviewState: ReviewState;
    readonly reviewerNotes?: string;
    readonly reviewedAt?: string;
  };
  readonly lifecycle: {
    readonly state: LeadLifecycleState;
    readonly previousState?: LeadLifecycleState;
    readonly changedAt: string;
    readonly changeReason?: string;
  };
  readonly userMetadata: UserLeadMetadata;
  readonly safeProvenance: SafeLeadProvenance;
  readonly auditMetadata: PersistedLeadAuditMetadata;
}

/**
 * History / Audit event types.
 */
export type WorkspaceHistoryEventType =
  | 'LEAD_CREATED'
  | 'FIELD_UPDATED'
  | 'TAG_ADDED'
  | 'TAG_REMOVED'
  | 'LIFECYCLE_CHANGED'
  | 'QUALIFICATION_CHANGED'
  | 'REVIEW_CHANGED'
  | 'FOLLOWUP_UPDATED'
  | 'ARCHIVED'
  | 'RESTORED'
  | 'DELETED';

/**
 * Historical audit event entry.
 * Stores only safe before/after values for permitted fields.
 */
export interface WorkspaceHistoryEvent {
  readonly eventId: string;
  readonly leadId: string;
  readonly eventType: WorkspaceHistoryEventType;
  readonly fieldName?: string;
  readonly oldSafeValue?: string;
  readonly newSafeValue?: string;
  readonly timestamp: string;
  readonly actor: 'USER' | 'SYSTEM';
}

/**
 * Workspace filter criteria.
 * Operates purely on persisted safe records.
 */
export interface WorkspaceFilterCriteria {
  readonly lifecycle?: readonly LeadLifecycleState[];
  readonly priority?: readonly LeadPriority[];
  readonly tags?: readonly string[];
  readonly hasWebsite?: boolean;
  readonly hasEmail?: boolean;
  readonly hasPhone?: boolean;
  readonly hasLeadershipPerson?: boolean;
  readonly followUpStatus?: readonly FollowUpStatus[];
  readonly qualificationStatus?: readonly ('QUALIFIED' | 'NEEDS_REVIEW' | 'DISQUALIFIED')[];
  readonly sourceClass?: readonly IndependentSourceClass[];
  readonly isArchived?: boolean; // Defaults to false (active view) unless explicitly specified
  readonly searchQuery?: string;
}

/**
 * Sort options for persisted workspace.
 */
export type WorkspaceSortField =
  | 'updatedAt'
  | 'createdAt'
  | 'businessName'
  | 'priority'
  | 'lifecycle'
  | 'followUpDate';

export interface WorkspaceSortCriteria {
  readonly field: WorkspaceSortField;
  readonly direction: 'ASC' | 'DESC';
}

/**
 * Pagination parameters & result structure.
 */
export interface WorkspacePaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

export interface WorkspaceQueryResult {
  readonly items: readonly PersistedLeadRecord[];
  readonly totalCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

/**
 * Persistent Workspace Aggregate Analytics.
 * GUARANTEE: Strictly scalar metrics. Zero PII, zero business names, zero Google data.
 */
export interface PersistentWorkspaceAnalytics {
  readonly totalStoredLeads: number;
  readonly activeLeads: number;
  readonly archivedLeads: number;
  readonly qualifiedLeads: number;
  readonly followUpsPending: number;
  readonly tagsCount: number;
  readonly exportEligibleLeads: number;
  readonly exportBlockedLeads: number;
  readonly generatedAt: string;
}
