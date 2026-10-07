/**
 * LeadNoria — Google Maps Acquisition Engine — Module Index
 * Public API surface for the Google Maps acquisition foundation.
 *
 * Additive layer over the existing v1.5.0 acquisition infrastructure.
 * Does NOT modify or replace existing browserAcquisitionTypes.ts, googleMapsBrowserAdapter.ts,
 * or any Phase 19/20 module.
 */

// Domain types
export type {
  FieldAvailability,
  ObservedField,
  GoogleMapsPageKind,
  GoogleMapsReadinessSignals,
  GoogleMapsPageDetection,
  SearchUnitStatus,
  GoogleMapsSearchUnitInput,
  GoogleMapsSearchUnit,
  GoogleMapsObservationProvenance,
  GoogleMapsCandidateObservation,
  GoogleMapsPageObservation,
  ObservationCompleteness,
  GoogleMapsAcquisitionState,
  StateTransitionEvent,
  GoogleMapsAcquisitionCheckpoint,
  AcquisitionDiagnosticCode,
  DiagnosticSeverity,
  DiagnosticRecoveryClass,
  GoogleMapsAcquisitionDiagnostic,
  GoogleMapsSessionConfig,
  GoogleMapsSessionProgress,
  CandidateIdentityMethod,
  CandidateIdentity,
  CandidateCardClassification,
  ValidatedCandidateCard,
  ResultSurfaceCandidate,
  ScrollTerminationReason,
  ScrollCycleOutcome,
  GoogleMapsAcquisitionPolicy,
  GoogleMapsObservationBatch,
  GoogleMapsAcquisitionMetrics
} from './types.ts';

export {
  DEFAULT_MAPS_SESSION_CONFIG,
  DEFAULT_ACQUISITION_POLICY
} from './types.ts';

// Search Unit factory & normalization
export {
  normalizeKeyword,
  normalizeLocation,
  deriveSearchUnitId,
  buildMapsSearchUrl,
  createSearchUnit,
  planSearchUnits,
  hashStringDeterministic
} from './searchUnit.ts';

// State machine
export {
  GoogleMapsStateMachine,
  IllegalStateTransitionError,
  LEGAL_TRANSITIONS
} from './stateMachine.ts';

// Page detector
export {
  isGoogleMapsUrl,
  classifyUrlPath,
  evaluateSignals,
  detectGoogleMapsPage
} from './pageDetector.ts';

// Observation boundary
export {
  buildObservedField,
  evaluateRatingField,
  evaluateReviewCountField,
  evaluateWebsiteField,
  evaluateTextField,
  createCandidateObservation,
  buildPageObservation,
  ENGINE_ADAPTER_VERSION
} from './observationBoundary.ts';

export type { RawCandidateNodeData } from './observationBoundary.ts';

// Navigation orchestrator
export {
  GoogleMapsNavigationOrchestrator
} from './navigationOrchestrator.ts';

export type {
  BrowserTabInfo,
  TabNavigationDriver,
  NavigationResult
} from './navigationOrchestrator.ts';

// Result feed observer
export {
  DefaultResultFeedObserver
} from './resultFeedObserver.ts';

export type {
  ResultSurfaceStatus,
  ResultSurfaceMetrics,
  ResultFeedSurface
} from './resultFeedObserver.ts';

// Acquisition queue
export {
  GoogleMapsAcquisitionQueue
} from './acquisitionQueue.ts';

export type { QueueProgressMetrics } from './acquisitionQueue.ts';

// Checkpoint manager
export {
  GoogleMapsCheckpointManager,
  InMemoryCheckpointStorage
} from './checkpointManager.ts';

export type {
  CheckpointStorageAdapter
} from './checkpointManager.ts';

// Message contracts
export type {
  GoogleMapsAcquisitionMessage,
  StartAcquisitionMessage,
  PauseAcquisitionMessage,
  ResumeAcquisitionMessage,
  CancelAcquisitionMessage,
  GetAcquisitionStatusMessage,
  AcquisitionStatusUpdatedMessage,
  CandidatesObservedMessage,
  AcquisitionDiagnosticMessage
} from './messageContracts.ts';

export { validateAcquisitionMessage } from './messageContracts.ts';

// Runtime coordinator
export {
  GoogleMapsRuntimeCoordinator,
  googleMapsRuntimeCoordinator,
  createDefaultTabDriver
} from './runtimeCoordinator.ts';

export type { ActiveSessionContext } from './runtimeCoordinator.ts';

// Part 2: Card Detector
export {
  CARD_SELECTORS,
  classifyCandidateCard,
  extractRawCardNodeData
} from './cardDetector.ts';

// Part 2: Candidate Identity & Deduplication
export {
  normalizeIdentityText,
  normalizeMapsUrlForIdentity,
  deriveCandidateIdentity,
  mergeCandidateObservations,
  SessionCandidateDeduplicator
} from './candidateIdentity.ts';

// Part 2: Result Surface Detector
export {
  SURFACE_SELECTORS,
  getElementScrollMetrics,
  scoreContainerCandidate,
  detectResultSurface
} from './resultSurfaceDetector.ts';

// Part 2: Feed Scroll Engine
export {
  GoogleMapsFeedScrollEngine
} from './feedScrollEngine.ts';

export type {
  FeedScrollEngineContext,
  FeedScrollEngineHooks
} from './feedScrollEngine.ts';

// Part 2: Live Capability Probe
export {
  probeGoogleMapsCapability
} from './liveCapabilityProbe.ts';

export type {
  LiveCapabilityProbeResult
} from './liveCapabilityProbe.ts';

// Part 3: Rating + Website Filter Engine
export type {
  RatingFilterOption,
  WebsiteFilterOption,
  GoogleMapsFilterCriteria,
  RatingMatchReason,
  WebsiteMatchReason,
  CombinedMatchReason,
  SingleFieldFilterResult,
  CandidateFilterEvaluation,
  FilterDatasetCounts,
  FilteredEmptyStateReason,
  FilteredDatasetView,
  GoogleMapsFilterAction
} from './filterTypes.ts';

export {
  DEFAULT_GOOGLE_MAPS_FILTER,
  normalizeRatingFilter,
  normalizeWebsiteFilter,
  normalizeFilterCriteria
} from './filterTypes.ts';

export {
  evaluateRatingMatch,
  evaluateWebsiteMatch,
  evaluateCandidateFilter,
  formatFilterExplanation,
  calculateFilterCounts,
  filterCandidateDataset,
  GoogleMapsFilterStateManager
} from './filterEngine.ts';

// Part 4: Bulk Research Orchestration Engine
export type {
  BulkExecutionPolicy,
  BulkResearchRequest,
  BulkResearchPlan,
  BulkRunState,
  SearchUnitRunState,
  BulkRunMetrics,
  SearchUnitExecutionSummary,
  BulkExecutionCheckpoint,
  BulkRunSnapshot,
  BulkTerminationReason
} from './bulkPlanTypes.ts';

export {
  DEFAULT_BULK_EXECUTION_POLICY,
  isTerminalBulkRunState,
  canTransitionBulkRunState,
  canTransitionSearchUnitState
} from './bulkPlanTypes.ts';

export {
  normalizeKeywordList,
  normalizeLocationList,
  computePlanFingerprint,
  validateBulkRequest,
  createBulkResearchPlan,
  MAX_RECOMMENDED_SEARCH_UNITS
} from './bulkPlanner.ts';

export {
  GoogleMapsBulkOrchestrator
} from './bulkOrchestrator.ts';

export type {
  BulkOrchestratorCallbacks,
  BulkOrchestratorOptions
} from './bulkOrchestrator.ts';

// Part 5: Cross-Search Deduplication & Data Quality Hardening
export type {
  IdentityRelationship,
  IdentityMethod,
  IdentityConfidenceTier,
  IdentityDecision,
  DuplicateRelationship,
  CandidateObservationReference,
  ObservedSearchUnitContext,
  FieldConflict,
  FieldEvidenceEntry,
  FieldLevelQualityState,
  DataQualityIssueCode,
  DataQualityIssue,
  CandidateQualityMetrics,
  SessionCandidate,
  DataQualitySnapshot
} from './candidateIdentityTypes.ts';

export {
  LEGAL_SUFFIXES,
  GENERIC_SHARED_DOMAINS,
  normalizeBusinessNameForIdentity,
  normalizeAddressForIdentity,
  normalizePhoneForIdentity,
  arePhonesEquivalent,
  normalizeWebsiteForIdentity,
  normalizeMapsUrlSlug
} from './candidateNormalizer.ts';

export {
  compareCandidatesForIdentity
} from './candidateMatcher.ts';

export type {
  MatchSubject
} from './candidateMatcher.ts';

export {
  assessCandidateQuality,
  createSessionCandidateFromObservation,
  mergeObservationIntoSessionCandidate
} from './candidateMerger.ts';

export {
  CandidateRegistry
} from './candidateRegistry.ts';

// Part 6: Website Intelligence & Contact/Person Enrichment Integration
export type {
  CandidateEnrichmentStatus,
  EnrichmentTerminationReason,
  CandidateWebsiteEvidence,
  CandidateContactEvidence,
  CandidatePersonEvidence,
  CandidateEnrichmentResult,
  CandidateEnrichmentSummary,
  EnrichmentQueueSnapshot,
  EnrichmentPolicy
} from './enrichmentTypes.ts';

export {
  DEFAULT_ENRICHMENT_POLICY,
  ENRICHMENT_ADAPTER_VERSION
} from './enrichmentTypes.ts';

export {
  evaluateWebsiteEligibility
} from './enrichmentEligibility.ts';

export type {
  WebsiteEligibilityResult
} from './enrichmentEligibility.ts';

export {
  mergeEnrichmentIntoCandidate
} from './enrichmentMerger.ts';

export {
  GoogleMapsEnrichmentQueue
} from './enrichmentQueue.ts';

export type {
  EnrichmentQueueCallbacks
} from './enrichmentQueue.ts';
