/**
 * LeadNoria — Google Maps Acquisition Engine — Bulk Research Domain
 * Part 4: Bulk Research Input, Plan, and Execution Types
 *
 * HARD BOUNDARIES & INVARIANTS:
 * - Deterministic Cartesian expansion: Keywords x Locations.
 * - Sequential execution: Concurrency = 1 active Google Maps acquisition context.
 * - Single dedicated browser tab reuse across SearchUnits.
 * - Separation of concerns: Filters operate post-acquisition on in-memory dataset.
 * - Google Data Firewall: ONLY execution metadata is stored; restricted Google content is NOT persistable.
 * - Error isolation: Single SearchUnit failure does not abort the entire bulk run.
 * - Bounded retries with deterministic backoff.
 */

import type {
  GoogleMapsSearchUnit,
  GoogleMapsAcquisitionState,
  GoogleMapsAcquisitionDiagnostic,
  GoogleMapsCandidateObservation,
  GoogleMapsAcquisitionPolicy,
  GoogleMapsSessionConfig
} from './types.ts';

import type {
  RatingFilterOption,
  WebsiteFilterOption,
  GoogleMapsFilterCriteria
} from './filterTypes.ts';

import type {
  EnrichmentQueueSnapshot
} from './enrichmentTypes.ts';

// ============================================================================
// 1. Bulk Execution Policy
// ============================================================================

export interface BulkExecutionPolicy {
  readonly maxSearchUnits: number;           // Default: 500. Warning threshold for user confirmation.
  readonly maxCandidatesPerUnit: number;      // Default: 50 candidates per unit.
  readonly maxScrollStepsPerUnit: number;     // Default: 15 scroll steps.
  readonly maxDurationPerUnitMs: number;      // Default: 60,000ms (1 min).
  readonly maxRunDurationMs: number;          // Default: 1,800,000ms (30 mins).
  readonly maxRetriesPerUnit: number;         // Default: 2 retries.
  readonly retryBackoffMs: number;            // Default: 1,000ms base backoff.
  readonly navigationTimeoutMs: number;       // Default: 15,000ms.
  readonly readinessTimeoutMs: number;        // Default: 10,000ms.
}

export const DEFAULT_BULK_EXECUTION_POLICY: BulkExecutionPolicy = Object.freeze({
  maxSearchUnits: 500,
  maxCandidatesPerUnit: 50,
  maxScrollStepsPerUnit: 15,
  maxDurationPerUnitMs: 60000,
  maxRunDurationMs: 1800000,
  maxRetriesPerUnit: 2,
  retryBackoffMs: 1000,
  navigationTimeoutMs: 15000,
  readinessTimeoutMs: 10000
});

// ============================================================================
// 2. Bulk Research Request Contract
// ============================================================================

export interface BulkResearchRequest {
  readonly keywords: readonly string[];
  readonly locations: readonly string[];
  readonly ratingFilter?: RatingFilterOption | string;
  readonly websiteFilter?: WebsiteFilterOption | string;
  readonly maxResults?: number;
  readonly executionPolicy?: Partial<BulkExecutionPolicy>;
  readonly acquisitionPolicy?: Partial<GoogleMapsAcquisitionPolicy>;
  readonly tabId?: number;
  readonly planId?: string;
  readonly runId?: string;
}

// ============================================================================
// 3. Immutable Bulk Research Plan
// ============================================================================

export interface BulkResearchPlan {
  readonly planId: string;
  readonly planFingerprint: string;
  readonly createdAt: string;
  readonly normalizedKeywords: readonly string[];
  readonly normalizedLocations: readonly string[];
  readonly searchUnits: readonly GoogleMapsSearchUnit[];
  readonly totalUnits: number;
  readonly initialFilter: GoogleMapsFilterCriteria;
  readonly executionPolicy: BulkExecutionPolicy;
  readonly maxResults?: number;
  readonly schemaVersion: number;
}

// ============================================================================
// 4. Run-Level States & Transitions
// ============================================================================

export type BulkRunState =
  | 'PLAN_CREATED'
  | 'QUEUED'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETING'
  | 'COMPLETED'
  | 'PARTIALLY_COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'RECOVERY_REQUIRED'
  | 'BLOCKED';

export type SearchUnitRunState =
  | 'PENDING'
  | 'CLAIMED'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRY_PENDING'
  | 'CANCELLED'
  | 'BLOCKED';

export type SearchUnitTerminationReason =
  | 'EXHAUSTED'
  | 'MAX_RESULTS_REACHED'
  | 'TIMEOUT'
  | 'USER_CANCELLED'
  | 'TAB_INTERRUPTED'
  | 'UNSUPPORTED'
  | 'ERROR'
  | 'RETRY_EXHAUSTED';

export type BulkRunTerminationReason =
  | 'ALL_UNITS_COMPLETED'
  | 'PARTIAL_FAILURE'
  | 'USER_CANCELLED'
  | 'TIME_LIMIT_REACHED'
  | 'PLAN_LIMIT_REACHED'
  | 'RECOVERY_REQUIRED'
  | 'FATAL_RUN_ERROR'
  | 'NONE';

export function isTerminalBulkRunState(state: BulkRunState): boolean {
  return state === 'COMPLETED' ||
    state === 'PARTIALLY_COMPLETED' ||
    state === 'CANCELLED' ||
    state === 'FAILED' ||
    state === 'RECOVERY_REQUIRED' ||
    state === 'BLOCKED';
}

export const LEGAL_BULK_RUN_TRANSITIONS: Record<BulkRunState, readonly BulkRunState[]> = {
  PLAN_CREATED: ['QUEUED', 'BLOCKED', 'CANCELLED'],
  QUEUED: ['RUNNING', 'CANCELLED', 'BLOCKED'],
  RUNNING: ['PAUSED', 'COMPLETING', 'FAILED', 'CANCELLED', 'RECOVERY_REQUIRED'],
  PAUSED: ['RUNNING', 'CANCELLED', 'RECOVERY_REQUIRED'],
  COMPLETING: ['COMPLETED', 'PARTIALLY_COMPLETED', 'FAILED'],
  COMPLETED: [],
  PARTIALLY_COMPLETED: [],
  CANCELLED: [],
  FAILED: [],
  RECOVERY_REQUIRED: ['RUNNING', 'CANCELLED'],
  BLOCKED: []
};

export function canTransitionBulkRunState(from: BulkRunState, to: BulkRunState): boolean {
  return LEGAL_BULK_RUN_TRANSITIONS[from]?.includes(to) ?? false;
}

export const LEGAL_SEARCH_UNIT_TRANSITIONS: Record<SearchUnitRunState, readonly SearchUnitRunState[]> = {
  PENDING: ['CLAIMED', 'CANCELLED', 'BLOCKED'],
  CLAIMED: ['RUNNING', 'PENDING', 'CANCELLED'],
  RUNNING: ['PAUSED', 'COMPLETED', 'FAILED', 'RETRY_PENDING', 'CANCELLED'],
  PAUSED: ['RUNNING', 'CANCELLED'],
  RETRY_PENDING: ['RUNNING', 'FAILED', 'CANCELLED'],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
  BLOCKED: []
};

export function canTransitionSearchUnitState(from: SearchUnitRunState, to: SearchUnitRunState): boolean {
  return LEGAL_SEARCH_UNIT_TRANSITIONS[from]?.includes(to) ?? false;
}

// ============================================================================
// 5. Accounting & Metrics Model
// ============================================================================

export interface BulkRunMetrics {
  readonly totalSearchUnits: number;
  readonly queuedUnits: number;
  readonly runningUnits: number;
  readonly completedUnits: number;
  readonly failedUnits: number;
  readonly retryingUnits: number;
  readonly cancelledUnits: number;
  readonly blockedUnits: number;

  // Candidate observations metrics (distinguishes raw, unique, and filtered)
  readonly rawCandidateObservations: number;
  readonly uniqueCandidateCount: number;
  readonly duplicateObservationCount: number;
  readonly currentFilteredMatchCount: number;

  // Website & Contact Enrichment metrics (Part 6)
  readonly eligibleForEnrichment?: number;
  readonly enrichmentQueued?: number;
  readonly enrichmentRunning?: number;
  readonly enrichmentCompleted?: number;
  readonly enrichmentPartial?: number;
  readonly enrichmentFailed?: number;
  readonly enrichmentBlocked?: number;
  readonly enrichmentSkipped?: number;
  readonly enrichmentDeferred?: number;
  readonly emailsFound?: number;
  readonly phonesFound?: number;
  readonly personsFound?: number;
}

export type BulkTerminationReason = BulkRunTerminationReason;

export interface SearchUnitExecutionSummary {
  searchUnitId: string;
  keyword: string;
  location?: string;
  query: string;
  status: SearchUnitRunState;
  attemptCount: number;
  startedAt?: string;
  completedAt?: string;
  elapsedMs: number;
  candidateCount: number;
  duplicateCount: number;
  terminationReason?: SearchUnitTerminationReason;
  lastError?: string;
}

// ============================================================================
// 6. Checkpoint & Storage Contracts (Metadata ONLY — Zero Restricted Content)
// ============================================================================

export interface BulkExecutionCheckpoint {
  readonly checkpointId: string;
  readonly runId: string;
  readonly planId: string;
  readonly planFingerprint: string;
  readonly schemaVersion: number;
  readonly engineVersion: string;
  readonly timestamp: string;
  readonly state: BulkRunState;
  readonly terminationReason: BulkRunTerminationReason;
  readonly currentSearchUnitId?: string;
  readonly currentQueueIndex: number;
  readonly tabId?: number;
  readonly activeFilter: GoogleMapsFilterCriteria;
  readonly metrics: BulkRunMetrics;
  readonly unitSummaries: readonly SearchUnitExecutionSummary[];
  readonly startedAt: string;
  readonly lastUpdatedAt: string;
  readonly diagnosticsSummary: {
    readonly warningCount: number;
    readonly errorCount: number;
    readonly lastErrorCode?: string;
  };
}

// ============================================================================
// 7. Snapshot for UI and Status Inquiries
// ============================================================================

export interface BulkRunSnapshot {
  readonly runId: string;
  readonly planId: string;
  readonly state: BulkRunState;
  readonly terminationReason: BulkRunTerminationReason;
  readonly currentSearchUnit?: {
    readonly searchUnitId: string;
    readonly keyword: string;
    readonly location?: string;
    readonly query: string;
    readonly unitIndex: number;
    readonly totalUnits: number;
    readonly status: SearchUnitRunState;
    readonly attemptCount: number;
  };
  readonly currentUnit?: {
    readonly searchUnitId: string;
    readonly keyword: string;
    readonly location?: string;
    readonly query: string;
    readonly unitIndex: number;
    readonly totalUnits: number;
    readonly status: SearchUnitRunState;
    readonly attemptCount: number;
  };
  readonly totalUnits: number;
  readonly completedUnits: number;
  readonly failedUnits: number;
  readonly cancelledUnits: number;
  readonly pendingUnits: number;
  readonly progress: {
    readonly unitsCompleted: number;
    readonly totalUnits: number;
    readonly percent: number;
  };
  readonly progressPercent: number;
  readonly metrics: BulkRunMetrics;
  readonly activeFilter: GoogleMapsFilterCriteria;
  readonly filterSnapshot: GoogleMapsFilterCriteria;
  readonly isPausable: boolean;
  readonly isResumable: boolean;
  readonly isCancellable: boolean;
  readonly startedAt: string;
  readonly lastUpdatedAt: string;
  readonly completedAt?: string;
  readonly diagnostics: readonly GoogleMapsAcquisitionDiagnostic[];
  readonly enrichmentSnapshot?: EnrichmentQueueSnapshot;
}
