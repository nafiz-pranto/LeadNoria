/**
 * LeadNoria — Google Maps Unified Candidate Review & Qualification Layer
 * Part 7: Completeness & Evidence Summarization
 *
 * HARD INVARIANTS:
 * - Reuses existing Part 5 completeness semantics.
 * - Does NOT redefine UNKNOWN or inflate completeness merely because enrichment completed.
 * - Summarizes known, unknown, unsupported fields and conflicts.
 */

import type { SessionCandidate } from '../engine/candidateIdentityTypes.ts';
import type { CandidateEvidenceSummary, ReadinessScores } from './reviewTypes.ts';

/**
 * Summarizes candidate evidence completeness, field availability, and qualification readiness.
 */
export function summarizeCandidateEvidence(
  candidate: SessionCandidate,
  readiness?: ReadinessScores
): CandidateEvidenceSummary {
  const knownFields: string[] = [];
  const unknownFields: string[] = [];
  const unsupportedFields: string[] = [];

  const avail = candidate.fieldAvailability || {};
  for (const [field, status] of Object.entries(avail)) {
    if (status === 'PRESENT') {
      knownFields.push(field);
    } else if (status === 'UNKNOWN') {
      unknownFields.push(field);
    } else if (status === 'UNSUPPORTED') {
      unsupportedFields.push(field);
    }
  }

  // Also factor in enrichment presence without altering Part 5 completeness formula
  if (candidate.enrichmentResult?.websiteEvidence) {
    if (!knownFields.includes('websiteIntelligence')) knownFields.push('websiteIntelligence');
  }
  if (candidate.enrichmentResult?.contactEvidence?.emails && candidate.enrichmentResult.contactEvidence.emails.length > 0) {
    if (!knownFields.includes('emails')) knownFields.push('emails');
  }
  if (candidate.enrichmentResult?.personEvidence?.people && candidate.enrichmentResult.personEvidence.people.length > 0) {
    if (!knownFields.includes('people')) knownFields.push('people');
  }

  const conflictFieldCount = candidate.fieldConflicts?.length ?? 0;
  const dataCompleteness = candidate.qualityMetrics?.dataCompleteness ?? 0;
  const identityConfidence = candidate.qualityMetrics?.identityConfidence ?? 'LOW';
  const enrichmentStatus = candidate.enrichmentStatus ?? 'NOT_ELIGIBLE';
  const qualificationReadiness = readiness?.overallQualificationReadiness ?? 0.0;

  return Object.freeze({
    knownFields: Object.freeze(knownFields),
    unknownFields: Object.freeze(unknownFields),
    unsupportedFields: Object.freeze(unsupportedFields),
    conflictFieldCount,
    dataCompleteness,
    identityConfidence,
    enrichmentStatus,
    qualificationReadiness
  });
}
