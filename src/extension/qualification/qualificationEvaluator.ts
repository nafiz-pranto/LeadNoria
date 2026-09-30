/**
 * Advanced Lead Qualification Evaluator (Phase 12)
 *
 * Implements deterministic qualification orchestration, enforces strict
 * evaluation precedence (BLOCKED -> CONTRADICTORY -> FAIL -> UNKNOWN -> PASS),
 * respects recursive source restrictions, and guarantees order independence.
 */

import type {
  QualificationProfile,
  CandidateEvaluationContext,
  QualificationDecision,
  AdvancedQualificationState,
  CriterionEvaluationResult
} from './qualificationTypes.ts';
import { validateQualificationProfile } from './qualificationProfile.ts';
import { evaluateCriterion } from './criterionEvaluator.ts';
import { calculateQualificationScore } from './qualificationScorer.ts';
import { buildExplanationLedger } from './qualificationExplainer.ts';
import { deriveCompositeRestrictions } from './qualificationFirewall.ts';

export const QUALIFICATION_EVALUATOR_VERSION = '1.0.0';

/**
 * Evaluates an already-researched business candidate against a configured QualificationProfile.
 * Pure, deterministic evaluation over existing evidence without external side effects.
 */
export function evaluateLeadQualification(
  context: CandidateEvaluationContext,
  profile: QualificationProfile
): QualificationDecision {
  const errors: string[] = [];
  const warnings: string[] = [];
  const notices: string[] = [];
  const evaluatedAt = context.evaluatedAt || new Date().toISOString();

  // 1. Profile Security & Schema Validation
  const validation = validateQualificationProfile(profile);
  if (!validation.isValid) {
    return {
      entityId: context.entityId,
      status: 'BLOCKED',
      profileId: profile?.profileId || 'UNKNOWN_PROFILE',
      profileVersion: profile?.version || '0.0.0',
      evaluatorVersion: QUALIFICATION_EVALUATOR_VERSION,
      evaluatedAt,
      criterionResults: [],
      scoreSummary: {
        totalScore: 0,
        maxPossibleScore: 0,
        threshold: 0,
        thresholdPassed: false
      },
      blockingReasons: [`Profile validation failed: ${validation.errors.join('; ')}`],
      contradictionReasons: [],
      unknownReasons: [],
      failureReasons: [],
      supportingEvidence: [],
      provenance: 'LEADNORIA_DERIVED',
      sourceContributions: context.sourceContributions || [],
      derivedFrom: context.derivedFrom || [],
      sourceRestrictions: {
        isRestricted: false,
        restrictionBasis: 'NONE',
        policyStatus: 'PRODUCT_REJECTED',
        persistenceEligibility: 'NOT_PERSISTABLE',
        exportEligibility: 'NOT_EXPORTABLE'
      },
      diagnostics: {
        errors: validation.errors,
        warnings: validation.warnings,
        notices: ['Evaluation halted due to invalid qualification profile configuration.']
      }
    };
  }

  // 2. Sort criteria deterministically by ID to enforce order independence
  const sortedCriteria = [...profile.criteria].sort((a, b) => a.id.localeCompare(b.id));

  // 3. Evaluate each criterion
  const criterionResults: CriterionEvaluationResult[] = [];

  for (const criterion of sortedCriteria) {
    const res = evaluateCriterion(criterion, context, {
      missingDataPolicy: profile.missingDataPolicy,
      unknownDataPolicy: profile.unknownDataPolicy,
      conflictPolicy: profile.conflictPolicy
    });
    criterionResults.push(res);
  }

  // 4. Calculate Weighted Score
  const scoreSummary = calculateQualificationScore(criterionResults, profile);

  // 5. Deterministic Precedence Resolution
  // 1. BLOCKED: Any mandatory criterion was blocked by source policy
  // 2. CONTRADICTORY: Any mandatory criterion observed a hard contradiction
  // 3. FAIL: Any mandatory criterion failed
  // 4. UNKNOWN: Any mandatory criterion is unknown
  // 5. PASS: All mandatory criteria passed + score threshold satisfied
  let finalStatus: AdvancedQualificationState = 'QUALIFIED';

  const mandatoryBlocked = criterionResults.some(cr => cr.mandatory && cr.outcome === 'BLOCKED');
  const mandatoryContradictory = criterionResults.some(cr => cr.mandatory && cr.outcome === 'CONTRADICTORY');
  const mandatoryFailed = criterionResults.some(cr => cr.mandatory && cr.outcome === 'FAIL');
  const mandatoryUnknown = criterionResults.some(cr => cr.mandatory && cr.outcome === 'UNKNOWN');

  if (mandatoryBlocked) {
    finalStatus = 'BLOCKED';
  } else if (mandatoryContradictory) {
    finalStatus = 'UNCERTAIN'; // Contradictory business identity or evidence produces UNCERTAIN per contract
  } else if (mandatoryFailed) {
    finalStatus = 'NOT_QUALIFIED';
  } else if (mandatoryUnknown) {
    if (profile.unknownDataPolicy === 'UNKNOWN_FAILS_MANDATORY') {
      finalStatus = 'NOT_QUALIFIED';
    } else {
      finalStatus = 'UNCERTAIN';
    }
  } else {
    // All mandatory passed: check score threshold if configured
    if (!scoreSummary.thresholdPassed) {
      finalStatus = 'NOT_QUALIFIED';
    } else {
      finalStatus = 'QUALIFIED';
    }
  }

  // 6. Build Explanation Ledger
  const explanationLedger = buildExplanationLedger(finalStatus, criterionResults, scoreSummary);

  // 7. Derive Composite Lineage & Source Restrictions
  const compositeRestrictions = deriveCompositeRestrictions(context);

  return {
    entityId: context.entityId,
    status: finalStatus,
    profileId: profile.profileId,
    profileVersion: profile.version,
    evaluatorVersion: QUALIFICATION_EVALUATOR_VERSION,
    evaluatedAt,
    criterionResults,
    scoreSummary,
    blockingReasons: explanationLedger.blockingReasons,
    contradictionReasons: explanationLedger.contradictionReasons,
    unknownReasons: explanationLedger.unknownReasons,
    failureReasons: explanationLedger.failureReasons,
    supportingEvidence: explanationLedger.supportingEvidence,
    provenance: compositeRestrictions.provenance,
    sourceContributions: compositeRestrictions.sourceContributions,
    derivedFrom: compositeRestrictions.derivedFrom,
    sourceRestrictions: {
      isRestricted: compositeRestrictions.isRestricted,
      restrictionBasis: compositeRestrictions.restrictionBasis,
      policyStatus: compositeRestrictions.policyStatus,
      persistenceEligibility: compositeRestrictions.persistenceEligibility,
      exportEligibility: compositeRestrictions.exportEligibility
    },
    diagnostics: {
      errors,
      warnings,
      notices: [explanationLedger.summaryNarrative]
    }
  };
}
