/**
 * LeadNoria — Google Maps Browser Acquisition Engine (Foundation)
 * Domain Type Contracts & Interfaces
 *
 * HARD BOUNDARIES & INVARIANTS:
 * - Browser-rendered DOM observation only.
 * - ZERO private Google APIs, Places APIs, OAuth, or undocumented RPC endpoints.
 * - ZERO CAPTCHA bypass, stealth automation, or fingerprint spoofing.
 * - All extracted content treated as untrusted input.
 * - GOOGLE_DERIVED provenance enforced; NOT_PERSISTABLE / NOT_EXPORTABLE enforced.
 * - Field availability must explicitly distinguish: PRESENT, ABSENT, UNKNOWN, UNSUPPORTED, AMBIGUOUS.
 * - State machine transitions are deterministic and strictly enforced.
 */

// ==========================================
// 1. Field Availability & Observation Model
// ==========================================

export type FieldAvailability =
  | 'PRESENT'       // Valid field value directly observed and parsed from supported surface
  | 'ABSENT'        // Supported surface provides explicit evidence that the field is absent (e.g., explicit unrated / zero reviews)
  | 'UNKNOWN'       // Field cannot be established from current observation surface (e.g., missing on card layout / partial rendering)
  | 'UNSUPPORTED'   // Current observation method cannot support this field (e.g., external surface)
  | 'AMBIGUOUS';    // Conflicting, malformed, or unreliable field evidence exists

export interface ObservedField<T = string> {
  readonly availability: FieldAvailability;
  readonly rawValue?: string;
  readonly parsedValue?: T;
  readonly confidence: number; // 0.0 - 1.0
  readonly sourceSignal?: string; // Selector or observation clue
  readonly diagnosticReason?: string;
}

// ==========================================
// 2. Google Maps Page Kinds & Detection
// ==========================================

export type GoogleMapsPageKind =
  | 'SEARCH_RESULTS'   // /maps/search/... or /maps?q=... with result list
  | 'PLACE_DETAIL'     // /maps/place/... single listing inspection
  | 'HOME_MAPS'        // Root google.com/maps without active query
  | 'DIRECTIONS'       // /maps/dir/... routing view
  | 'NON_GOOGLE'       // Completely outside Google Maps
  | 'UNSUPPORTED'      // Google Maps page with unsupported layout or mobile/light mode
  | 'UNKNOWN';         // Indeterminate state

export interface GoogleMapsReadinessSignals {
  hasMapsHost: boolean;
  hasSearchPath: boolean;
  hasPlacePath: boolean;
  hasSearchInput: boolean;
  hasFeedContainer: boolean;
  hasDetailContainer: boolean;
  isLoadingSpinnerPresent: boolean;
  hasResultsHeader: boolean;
  hasNoResultsMarker: boolean;
  elementCount: number;
}

export interface GoogleMapsPageDetection {
  readonly isGoogleMaps: boolean;
  readonly pageKind: GoogleMapsPageKind;
  readonly ready: boolean;
  readonly confidence: number; // 0.0 - 1.0
  readonly reason: string;
  readonly url: string;
  readonly observedAt: string;
  readonly signals: GoogleMapsReadinessSignals;
}

// ==========================================
// 3. Search Unit Abstraction
// ==========================================

export type SearchUnitStatus =
  | 'PLANNED'
  | 'QUEUED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface GoogleMapsSearchUnitInput {
  keyword: string;
  location?: string;
  customQuery?: string;
  maxRetries?: number;
}

export interface GoogleMapsSearchUnit {
  readonly searchUnitId: string;
  readonly rawKeyword: string;
  readonly normalizedKeyword: string;
  readonly rawLocation?: string;
  readonly normalizedLocation?: string;
  readonly normalizedQuery: string;
  readonly navigationUrl: string;
  status: SearchUnitStatus;
  readonly createdAt: string;
  startedAt?: string;
  completedAt?: string;
  candidateCount: number;
  retryCount: number;
  readonly maxRetries: number;
  checkpoint?: GoogleMapsAcquisitionCheckpoint;
  diagnostics: GoogleMapsAcquisitionDiagnostic[];
  lastError?: string;
}

// ==========================================
// 4. Candidate Observation Contract
// ==========================================

export interface GoogleMapsObservationProvenance {
  readonly source: 'GOOGLE_MAPS_BROWSER';
  readonly acquisitionContext: 'BROWSER_RENDERED_DOM';
  readonly isRestricted: true;
  readonly policyStatus: 'POLICY_GATED';
  readonly persistenceStatus: 'NOT_PERSISTABLE';
  readonly exportStatus: 'NOT_EXPORTABLE';
  readonly adapterVersion: string;
  readonly extractionMethod: string;
  readonly searchUnitId: string;
  readonly sessionId: string;
  readonly observedAt: string;
  readonly pageUrl: string;
}

export interface GoogleMapsCandidateObservation {
  readonly observationId: string;
  readonly candidateId?: string;
  readonly searchUnitId: string;
  readonly sessionId: string;
  readonly source: 'GOOGLE_MAPS_BROWSER';
  readonly observedAt: string;
  readonly pageUrl: string;
  readonly pageKind: GoogleMapsPageKind;

  // Granular Observed Fields
  readonly businessName: ObservedField<string>;
  readonly category: ObservedField<string>;
  readonly address: ObservedField<string>;
  readonly phone: ObservedField<string>;
  readonly websiteUrl: ObservedField<string>;
  readonly rating: ObservedField<number>;
  readonly reviewCount: ObservedField<number>;
  readonly businessStatus: ObservedField<string>;
  readonly placeId: ObservedField<string>;
  readonly mapsUrl: ObservedField<string>;

  // Context & Provenance
  readonly searchKeyword: string;
  readonly searchLocation?: string;
  readonly provenance: GoogleMapsObservationProvenance;
  readonly fieldAvailability: Record<string, FieldAvailability>;
  readonly diagnostics: GoogleMapsAcquisitionDiagnostic[];

  // Identity & Multi-Observation Evidence
  readonly identityMethod?: CandidateIdentityMethod;
  readonly identityConfidence?: number;
  readonly identityEvidence?: string;
  readonly observationCount?: number;
  readonly firstObservedAt?: string;
  readonly lastObservedAt?: string;
  readonly observedOrder?: number;
}

// ==========================================
// 5. Page Observation Snapshot
// ==========================================

export type ObservationCompleteness =
  | 'COMPLETE'
  | 'PARTIAL'
  | 'EMPTY'
  | 'BLOCKED';

export interface GoogleMapsPageObservation {
  readonly observationId: string;
  readonly sessionId: string;
  readonly searchUnitId: string;
  readonly observedAt: string;
  readonly pageUrl: string;
  readonly pageKind: GoogleMapsPageKind;
  readonly completeness: ObservationCompleteness;
  readonly candidates: GoogleMapsCandidateObservation[];
  readonly totalCandidatesObserved: number;
  readonly diagnostics: GoogleMapsAcquisitionDiagnostic[];
}

// ==========================================
// 6. Acquisition State Machine
// ==========================================

export type GoogleMapsAcquisitionState =
  | 'IDLE'
  | 'QUEUED'
  | 'STARTING'
  | 'NAVIGATING'
  | 'OBSERVING'
  | 'PAUSED'
  | 'COMPLETING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'BLOCKED';

export interface StateTransitionEvent {
  readonly fromState: GoogleMapsAcquisitionState;
  readonly toState: GoogleMapsAcquisitionState;
  readonly timestamp: string;
  readonly reason: string;
  readonly sessionId: string;
  readonly searchUnitId?: string;
}

// ==========================================
// 7. Checkpoint Contract
// ==========================================

export interface GoogleMapsAcquisitionCheckpoint {
  readonly checkpointId: string;
  readonly sessionId: string;
  readonly searchUnitId: string;
  readonly state: GoogleMapsAcquisitionState;
  readonly pageUrl: string;
  readonly candidateCount: number;
  readonly lastObservedCandidateSignature?: string;
  // Bounded Resume Context (Metadata only, NO raw DOM/HTML)
  readonly lastObservedCandidateIdentity?: string;
  readonly lastObservedCandidateEvidence?: string;
  readonly resultSurfacePosition?: {
    readonly scrollOffset: number;
    readonly estimatedItemIndex: number;
  };
  readonly observationSequence?: number;
  readonly searchUnitProgressContext?: {
    readonly unitIndex: number;
    readonly totalUnits: number;
    readonly query: string;
  };
  readonly checkpointToken?: string;
  readonly duplicateSuppressionContext?: {
    readonly observedIds: readonly string[];
    readonly cursorToken?: string;
  };
  readonly progress: {
    readonly totalUnits: number;
    readonly completedUnits: number;
    readonly pendingUnits: number;
  };
  readonly retryCount: number;
  readonly timestamp: string;
  readonly adapterVersion: string;
  readonly diagnosticsSummary: {
    readonly warningCount: number;
    readonly errorCount: number;
    readonly lastErrorCode?: string;
  };
}

// ==========================================
// 8. Diagnostics Model
// ==========================================

export type AcquisitionDiagnosticCode =
  | 'MAPS_TAB_NOT_FOUND'
  | 'UNSUPPORTED_MAPS_PAGE'
  | 'MAPS_NOT_READY'
  | 'NAVIGATION_TIMEOUT'
  | 'OBSERVATION_TIMEOUT'
  | 'RESULT_SURFACE_NOT_FOUND'
  | 'CARD_DETECTION_FAILED'
  | 'CANDIDATE_PARSE_FAILED'
  | 'SCROLL_TARGET_INVALID'
  | 'SCROLL_NO_PROGRESS'
  | 'FEED_STALLED'
  | 'EXHAUSTION_UNCERTAIN'
  | 'CANDIDATE_OBSERVATION_FAILED'
  | 'CHECKPOINT_FAILURE'
  | 'CHECKPOINT_CORRUPTED'
  | 'INCOMPATIBLE_ADAPTER_VERSION'
  | 'STALE_METADATA'
  | 'SESSION_CANCELLED'
  | 'SESSION_PAUSED'
  | 'USER_NAVIGATION_INTERRUPTION'
  | 'DUPLICATE_SEARCH_UNIT_SUPPRESSED'
  | 'INVALID_STATE_TRANSITION'
  | 'RATE_LIMIT_WARNING';

export type DiagnosticSeverity = 'P0' | 'P1' | 'P2';
export type DiagnosticRecoveryClass =
  | 'RECOVERABLE'
  | 'RETRYABLE'
  | 'USER_ACTION_REQUIRED'
  | 'UNSUPPORTED'
  | 'TERMINAL';

export interface GoogleMapsAcquisitionDiagnostic {
  readonly code: AcquisitionDiagnosticCode;
  readonly severity: DiagnosticSeverity;
  readonly recoveryClass: DiagnosticRecoveryClass;
  readonly message: string;
  readonly timestamp: string;
  readonly searchUnitId?: string;
  readonly sessionId?: string;
  readonly url?: string;
  readonly details?: Record<string, unknown>;
}

// ==========================================
// 9. Session Config & Progress
// ==========================================

export interface GoogleMapsSessionConfig {
  readonly sessionId: string;
  readonly tabId: number;
  readonly maxCandidatesPerUnit: number;
  readonly maxScrollSteps: number;
  readonly navigationTimeoutMs: number;
  readonly readinessTimeoutMs: number;
  readonly renderWaitMs: number;
  readonly maxRetriesPerUnit: number;
  readonly collectDetails: boolean;
}

export const DEFAULT_MAPS_SESSION_CONFIG: GoogleMapsSessionConfig = {
  sessionId: '',
  tabId: 0,
  maxCandidatesPerUnit: 50,
  maxScrollSteps: 15,
  navigationTimeoutMs: 15000,
  readinessTimeoutMs: 10000,
  renderWaitMs: 1200,
  maxRetriesPerUnit: 2,
  collectDetails: false
};

export interface GoogleMapsSessionProgress {
  readonly sessionId: string;
  readonly state: GoogleMapsAcquisitionState;
  readonly totalSearchUnits: number;
  readonly completedSearchUnits: number;
  readonly currentSearchUnitId?: string;
  readonly totalCandidatesObserved: number;
  readonly uniqueCandidatesObserved: number;
  readonly diagnosticsCount: number;
  readonly startedAt: string;
  readonly lastActivityAt: string;
  readonly completedAt?: string;
}

// ==========================================
// 10. Part 2: Candidate Identity & Card Classification
// ==========================================

export type CandidateIdentityMethod =
  | 'MAPS_URL'
  | 'VISIBLE_PLACE_ID'
  | 'NAME_ADDRESS'
  | 'NAME_PHONE'
  | 'NAME_CATEGORY_LOCATION'
  | 'WEAK_FALLBACK';

export interface CandidateIdentity {
  readonly candidateId: string;
  readonly identityMethod: CandidateIdentityMethod;
  readonly identityConfidence: number;
  readonly evidence: string;
}

export type CandidateCardClassification =
  | 'VALID_BUSINESS_CANDIDATE'
  | 'NON_BUSINESS_UI'
  | 'LOADING_PLACEHOLDER'
  | 'AD_OR_PROMOTIONAL_UI'
  | 'INVALID_UNKNOWN';

export interface ValidatedCandidateCard {
  readonly element: unknown;
  readonly classification: CandidateCardClassification;
  readonly confidence: number;
  readonly reason: string;
  readonly isBusinessCard: boolean;
}

// ==========================================
// 11. Part 2: Result Surface Candidate & Scoring
// ==========================================

export interface ResultSurfaceCandidate {
  readonly elementPath?: string;
  readonly confidence: number;
  readonly reason: string;
  readonly scrollTop: number;
  readonly clientHeight: number;
  readonly scrollHeight: number;
  readonly candidateCardCount: number;
  readonly isScrollable: boolean;
  readonly validated: boolean;
}

// ==========================================
// 12. Part 2: Scroll Engine & Exhaustion
// ==========================================

export type ScrollTerminationReason =
  | 'EXHAUSTED'
  | 'MAX_RESULTS_REACHED'
  | 'MAX_SCROLL_STEPS_REACHED'
  | 'TIMEOUT'
  | 'USER_PAUSED'
  | 'USER_CANCELLED'
  | 'TAB_INTERRUPTED'
  | 'UNSUPPORTED'
  | 'ERROR';

export type ScrollCycleOutcome =
  | 'SCROLL_PROGRESS'
  | 'SCROLL_NO_PROGRESS'
  | 'SCROLL_LOADING'
  | 'SCROLL_EXHAUSTED'
  | 'SCROLL_INTERRUPTED';

export interface GoogleMapsAcquisitionPolicy {
  readonly maxScrollSteps: number;
  readonly maxCandidates: number;
  readonly maxDurationMs: number;
  readonly scrollFractionOfViewport: number;
  readonly loadWaitTimeoutMs: number;
  readonly quietPeriodMs: number;
  readonly maxNoNewCandidateCycles: number;
  readonly retryLimit: number;
  readonly exhaustionTolerancePx: number;
}

export const DEFAULT_ACQUISITION_POLICY: GoogleMapsAcquisitionPolicy = {
  maxScrollSteps: 25,
  maxCandidates: 60,
  maxDurationMs: 60000,
  scrollFractionOfViewport: 0.75,
  loadWaitTimeoutMs: 3000,
  quietPeriodMs: 400,
  maxNoNewCandidateCycles: 3,
  retryLimit: 3,
  exhaustionTolerancePx: 30
};

export interface GoogleMapsObservationBatch {
  readonly sessionId: string;
  readonly searchUnitId: string;
  readonly observationSequence: number;
  readonly visibleCandidateCount: number;
  readonly newCandidateCount: number;
  readonly duplicateCandidateCount: number;
  readonly invalidCandidateCount: number;
  readonly candidateIds: readonly string[];
  readonly newCandidates: readonly GoogleMapsCandidateObservation[];
  readonly scrollTop: number;
  readonly clientHeight: number;
  readonly scrollHeight: number;
  readonly isAtBottom: boolean;
  readonly hasNewContent: boolean;
  readonly timestamp: string;
  readonly terminationReason?: ScrollTerminationReason;
}

export interface GoogleMapsAcquisitionMetrics {
  scrollSteps: number;
  observationCycles: number;
  visibleCandidateObservations: number;
  uniqueCandidates: number;
  duplicateObservations: number;
  invalidCandidates: number;
  scrollNoProgressCycles: number;
  feedGrowthEvents: number;
  extractionErrors: number;
  elapsedMs: number;
  terminationReason?: ScrollTerminationReason;
}

// ============================================================================
// 13. Part 3 Roadmap: Rating + Website Filter Engine (Scope Definition)
// ============================================================================
// PART 3 = RATING + WEBSITE FILTER ENGINE
//
// Target UI / Filter Model:
// RATING:
//   - 'ANY'
//   - '4.0+'
//   - '4.5+'
//
// WEBSITE:
//   - 'ANY'
//   - 'WITH_WEBSITE'
//   - 'WITHOUT_WEBSITE'
//
// Filters combine with AND semantics:
//   - 4.0+ AND WITH WEBSITE
//   - 4.0+ AND WITHOUT WEBSITE
//   - 4.5+ AND WITH WEBSITE
//   - 4.5+ AND WITHOUT WEBSITE
//   - ANY  AND WITH WEBSITE
//   - ANY  AND WITHOUT WEBSITE
//
// Invariant for Part 3 filter engine:
// Minimum rating filters treat UNKNOWN as NOT MATCHING,
// but MUST NOT rewrite UNKNOWN into ABSENT.
// Lead scoring, candidate review, and external enrichment remain later concerns.
