/**
 * LeadNoria — Google Maps Unified Candidate Review & Qualification Layer (Part 7)
 * Module Exports
 */

// Types & Contracts
export type {
  ReviewState,
  ReviewActionType,
  ReviewAction,
  QualificationStatus,
  QualificationReasonCode,
  QualificationCriteria,
  ReadinessScores,
  CandidateQualificationResult,
  EvidenceProvenanceSource,
  FieldProvenanceRecord,
  ConflictType,
  ConflictRecord,
  CandidateEvidenceSummary,
  CandidateReviewRecord,
  ResearchSessionLifecycle,
  AggregateResearchAnalytics
} from './reviewTypes.ts';

// Qualification Rules & Criteria
export {
  DEFAULT_QUALIFICATION_CRITERIA,
  normalizeQualificationCriteria
} from './qualificationRules.ts';

// Deterministic Qualification Engine
export {
  evaluateCandidateQualification
} from './qualificationEngine.ts';

// Review State Transition Reducer
export {
  VALID_REVIEW_STATES,
  VALID_REVIEW_ACTIONS,
  isValidReviewTransition,
  reviewReducer
} from './reviewReducer.ts';

// Conflict & Divergence Summarization
export {
  extractCandidateConflicts
} from './conflictSummary.ts';

// Field-Level Provenance Summarization
export {
  summarizeCandidateProvenance
} from './provenanceSummary.ts';

// Completeness & Evidence Summarization
export {
  summarizeCandidateEvidence
} from './evidenceSummary.ts';

// Candidate Review Model & Factory
export {
  createCandidateReviewRecord,
  applyActionToReviewRecord
} from './candidateReviewModel.ts';

// In-Memory Review State Manager
export {
  ReviewStateManager
} from './reviewState.ts';

// Review Session Manager
export {
  GoogleMapsReviewSession
} from './reviewSession.ts';
