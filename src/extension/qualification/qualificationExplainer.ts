/**
 * Qualification Decision Explainer (Phase 12)
 *
 * Generates transparent, machine-readable and human-readable audit explanations,
 * categorizes reasons (blocking, contradiction, unknown, failure),
 * and surfaces field-level evidence traces.
 */

import type {
  CriterionEvaluationResult,
  AdvancedQualificationState,
  QualificationScoreSummary
} from './qualificationTypes.ts';

export interface ExplanationAuditLedger {
  blockingReasons: string[];
  contradictionReasons: string[];
  unknownReasons: string[];
  failureReasons: string[];
  supportingEvidence: any[];
  summaryNarrative: string;
}

/**
 * Builds structured audit ledgers and factual summary narratives.
 */
export function buildExplanationLedger(
  status: AdvancedQualificationState,
  criterionResults: CriterionEvaluationResult[],
  scoreSummary: QualificationScoreSummary
): ExplanationAuditLedger {
  const blockingReasons: string[] = [];
  const contradictionReasons: string[] = [];
  const unknownReasons: string[] = [];
  const failureReasons: string[] = [];
  const supportingEvidence: any[] = [];

  for (const cr of criterionResults) {
    if (cr.evidence && cr.evidence.length > 0) {
      supportingEvidence.push(...cr.evidence);
    }

    if (cr.outcome === 'BLOCKED') {
      blockingReasons.push(cr.explanation);
    } else if (cr.outcome === 'CONTRADICTORY') {
      contradictionReasons.push(cr.explanation);
    } else if (cr.outcome === 'UNKNOWN') {
      if (cr.mandatory) {
        unknownReasons.push(cr.explanation);
      }
    } else if (cr.outcome === 'FAIL') {
      if (cr.mandatory) {
        failureReasons.push(cr.explanation);
      }
    }
  }

  // Construct neutral factual summary narrative
  let summaryNarrative = '';

  switch (status) {
    case 'QUALIFIED':
      summaryNarrative = `Candidate successfully satisfied all mandatory qualification criteria (Score: ${scoreSummary.totalScore}/${scoreSummary.maxPossibleScore}, Threshold: ${scoreSummary.threshold}).`;
      break;

    case 'NOT_QUALIFIED':
      if (failureReasons.length > 0) {
        summaryNarrative = `Candidate failed ${failureReasons.length} mandatory qualification requirement(s): ${failureReasons.join('; ')}`;
      } else if (!scoreSummary.thresholdPassed) {
        summaryNarrative = `Candidate score (${scoreSummary.totalScore}) fell below the configured minimum threshold (${scoreSummary.threshold}).`;
      } else {
        summaryNarrative = 'Candidate did not satisfy configured qualification criteria.';
      }
      break;

    case 'UNCERTAIN':
      summaryNarrative = `Qualification is uncertain due to unresolved or missing mandatory facts: ${unknownReasons.join('; ')}`;
      break;

    case 'BLOCKED':
      summaryNarrative = `Qualification evaluation was blocked by compliance or source restrictions: ${blockingReasons.join('; ')}`;
      break;
  }

  return {
    blockingReasons,
    contradictionReasons,
    unknownReasons,
    failureReasons,
    supportingEvidence,
    summaryNarrative
  };
}
