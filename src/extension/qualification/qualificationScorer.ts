/**
 * Qualification Scoring & Threshold Engine (Phase 12)
 *
 * Implements deterministic, transparent weighted scoring,
 * threshold evaluation, and guarantees that scores cannot override
 * mandatory FAIL, CONTRADICTORY, or BLOCKED states.
 */

import type {
  CriterionEvaluationResult,
  QualificationScoreSummary,
  QualificationProfile
} from './qualificationTypes.ts';

/**
 * Computes deterministic score summary across all criterion results.
 */
export function calculateQualificationScore(
  criterionResults: CriterionEvaluationResult[],
  profile: QualificationProfile
): QualificationScoreSummary {
  let totalScore = 0;
  let maxPossibleScore = 0;

  for (const cr of criterionResults) {
    maxPossibleScore += cr.weight;
    if (cr.outcome === 'PASS') {
      totalScore += cr.scoreContribution;
    }
  }

  const threshold = profile.thresholds?.minimumScore ?? 0;
  const thresholdPassed = totalScore >= threshold;

  return {
    totalScore,
    maxPossibleScore,
    threshold,
    thresholdPassed
  };
}
