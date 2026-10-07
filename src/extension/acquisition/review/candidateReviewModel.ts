/**
 * LeadNoria — Google Maps Unified Candidate Review & Qualification Layer
 * Part 7: Candidate Review Record Model & Factory
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * - Unifies candidate, review state, qualification result, provenance, and conflicts.
 * - Live SessionCandidate reference is held strictly in-memory during research session.
 * - Zero cloning into persistent or exportable objects.
 * - Immutable records: updates return new record wrappers without mutating underlying evidence.
 */

import type { SessionCandidate } from '../engine/candidateIdentityTypes.ts';
import type {
  CandidateReviewRecord,
  QualificationCriteria,
  ReviewAction,
  ReviewState
} from './reviewTypes.ts';
import { evaluateCandidateQualification } from './qualificationEngine.ts';
import { summarizeCandidateEvidence } from './evidenceSummary.ts';
import { extractCandidateConflicts } from './conflictSummary.ts';
import { summarizeCandidateProvenance } from './provenanceSummary.ts';
import { reviewReducer } from './reviewReducer.ts';

/**
 * Creates an immutable CandidateReviewRecord for a SessionCandidate.
 */
export function createCandidateReviewRecord(
  candidate: SessionCandidate,
  criteria?: QualificationCriteria,
  initialReviewState: ReviewState = 'UNREVIEWED'
): CandidateReviewRecord {
  if (!candidate || !candidate.candidateId) {
    throw new Error('Valid SessionCandidate with candidateId is required');
  }

  const qualificationResult = evaluateCandidateQualification(candidate, criteria);
  const evidenceSummary = summarizeCandidateEvidence(candidate, qualificationResult.readiness);
  const conflicts = extractCandidateConflicts(candidate, criteria);
  const provenance = summarizeCandidateProvenance(candidate);

  return Object.freeze({
    candidateId: candidate.candidateId,
    reviewState: initialReviewState,
    qualificationResult,
    evidenceSummary,
    conflicts,
    provenance,
    reviewerNotes: undefined,
    reviewerId: undefined,
    reviewedAt: undefined,

    // Live in-memory reference
    candidate,

    // Strict Google Data Firewall & Export Gating
    isRestricted: true,
    isExportable: false,
    persistenceStatus: 'NOT_PERSISTABLE',
    exportStatus: 'NOT_EXPORTABLE',
    policyStatus: 'POLICY_GATED'
  });
}

/**
 * Applies a ReviewAction to an existing CandidateReviewRecord, returning a new immutable record.
 */
export function applyActionToReviewRecord(
  record: CandidateReviewRecord,
  action: ReviewAction
): CandidateReviewRecord {
  if (record.candidateId !== action.candidateId) {
    throw new Error(`Action candidateId "${action.candidateId}" does not match record candidateId "${record.candidateId}"`);
  }

  const nextState = reviewReducer(record.reviewState, action);
  const now = action.timestamp || new Date().toISOString();

  return Object.freeze({
    ...record,
    reviewState: nextState,
    reviewerNotes: action.reviewerNotes !== undefined ? action.reviewerNotes : record.reviewerNotes,
    reviewerId: action.reviewerId !== undefined ? action.reviewerId : record.reviewerId,
    reviewedAt: now
  });
}
