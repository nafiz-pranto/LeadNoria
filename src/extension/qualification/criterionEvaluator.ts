/**
 * Deterministic Criterion Evaluator (Phase 12)
 *
 * Implements type-safe five-valued logic (PASS, FAIL, UNKNOWN, CONTRADICTORY, BLOCKED),
 * operator execution, missing/unknown policy enforcement, and field-level evidence binding.
 */

import type {
  QualificationCriterion,
  CandidateEvaluationContext,
  CriterionEvaluationResult,
  CriterionOutcome,
  MissingDataPolicy,
  UnknownDataPolicy,
  ConflictPolicy
} from './qualificationTypes.ts';
import { checkQualificationEligibility } from './qualificationFirewall.ts';

/**
 * Safely evaluates a binary comparison operator on primitive values or sets.
 */
function evaluateOperator(
  operator: string,
  actual: any,
  expected: any
): boolean {
  switch (operator) {
    case 'EQUALS':
      return actual === expected || String(actual).toLowerCase() === String(expected).toLowerCase();

    case 'NOT_EQUALS':
      return actual !== expected && String(actual).toLowerCase() !== String(expected).toLowerCase();

    case 'IN':
      if (Array.isArray(expected)) {
        return expected.some(exp => exp === actual || String(exp).toLowerCase() === String(actual).toLowerCase());
      }
      return false;

    case 'NOT_IN':
      if (Array.isArray(expected)) {
        return !expected.some(exp => exp === actual || String(exp).toLowerCase() === String(actual).toLowerCase());
      }
      return true;

    case 'CONTAINS':
      if (typeof actual === 'string' && typeof expected === 'string') {
        return actual.toLowerCase().includes(expected.toLowerCase());
      }
      if (Array.isArray(actual)) {
        return actual.some(item => item === expected || String(item).toLowerCase() === String(expected).toLowerCase());
      }
      return false;

    case 'NOT_CONTAINS':
      if (typeof actual === 'string' && typeof expected === 'string') {
        return !actual.toLowerCase().includes(expected.toLowerCase());
      }
      if (Array.isArray(actual)) {
        return !actual.some(item => item === expected || String(item).toLowerCase() === String(expected).toLowerCase());
      }
      return true;

    case 'MATCHES':
      if (typeof actual === 'string' && typeof expected === 'string') {
        try {
          const reg = new RegExp(expected, 'i');
          return reg.test(actual);
        } catch {
          return false;
        }
      }
      return false;

    case 'EXISTS':
      return actual !== undefined && actual !== null && actual !== '' && (!Array.isArray(actual) || actual.length > 0);

    case 'NOT_EXISTS':
      return actual === undefined || actual === null || actual === '' || (Array.isArray(actual) && actual.length === 0);

    case 'COUNT_AT_LEAST':
      if (Array.isArray(actual)) {
        return actual.length >= Number(expected);
      }
      if (typeof actual === 'number') {
        return actual >= Number(expected);
      }
      return false;

    case 'COUNT_AT_MOST':
      if (Array.isArray(actual)) {
        return actual.length <= Number(expected);
      }
      if (typeof actual === 'number') {
        return actual <= Number(expected);
      }
      return false;

    case 'THRESHOLD_AT_LEAST':
      return Number(actual) >= Number(expected);

    case 'THRESHOLD_AT_MOST':
      return Number(actual) <= Number(expected);

    case 'ANY':
      if (Array.isArray(actual) && Array.isArray(expected)) {
        return actual.some(a => expected.includes(a));
      }
      return false;

    case 'ALL':
      if (Array.isArray(actual) && Array.isArray(expected)) {
        return expected.every(e => actual.includes(e));
      }
      return false;

    case 'NONE':
      if (Array.isArray(actual) && Array.isArray(expected)) {
        return !actual.some(a => expected.includes(a));
      }
      return true;

    default:
      return false;
  }
}

/**
 * Evaluates a single qualification criterion against the candidate context.
 */
export function evaluateCriterion(
  criterion: QualificationCriterion,
  context: CandidateEvaluationContext,
  policies: {
    missingDataPolicy: MissingDataPolicy;
    unknownDataPolicy: UnknownDataPolicy;
    conflictPolicy: ConflictPolicy;
  }
): CriterionEvaluationResult {
  const weight = criterion.weight ?? (criterion.mandatory ? 10 : 5);
  const evidence: any[] = [];
  let actualValue: any = undefined;
  let isMissing = false;
  let isContradictory = false;
  let contradictionReason = '';
  let reasonCode = '';
  let explanation = '';

  // 1. Extract target value & evidence according to CriterionType
  switch (criterion.type) {
    case 'RELEVANCE': {
      actualValue = context.relevanceResult?.relevanceState;
      if (!actualValue) {
        isMissing = true;
      } else {
        if (context.relevanceResult?.evidenceItems) {
          evidence.push(...context.relevanceResult.evidenceItems);
        }
      }
      break;
    }

    case 'WEBSITE_STATUS': {
      actualValue =
        context.websiteState ||
        context.mapsVerificationResult?.websiteState ||
        (context.normalizedCandidate?.verificationPlaceholder?.verificationStatus as any);
      if (!actualValue) {
        isMissing = true;
      } else {
        if (context.websiteEvidence) {
          evidence.push(...context.websiteEvidence);
        }
        if (context.mapsVerificationResult?.verificationEvidence) {
          evidence.push(...context.mapsVerificationResult.verificationEvidence);
        }
      }
      break;
    }

    case 'BUSINESS_IDENTITY': {
      const isConflict =
        context.resolvedEntityGroup?.resolutionStatus === 'CONFLICTING_IDENTITY' ||
        (context.resolvedEntityGroup as any)?.relationshipType === 'CONFLICTING_IDENTITY' ||
        (context.resolvedEntityGroup?.identityConflicts && context.resolvedEntityGroup.identityConflicts.length > 0) ||
        context.contactEnrichment?.diagnostics?.warnings?.some(w => w.includes('conflicts with candidate name'));
      
      if (isConflict) {
        isContradictory = true;
        contradictionReason = 'Business identity contradiction detected across source records';
      }
      actualValue = isConflict ? 'CONTRADICTION' : (context.canonicalDisplayName || context.normalizedCandidate?.businessName?.value?.displayName);
      if (!actualValue) isMissing = true;
      break;
    }

    case 'HAS_BUSINESS_PHONE': {
      const enrichmentPhones = context.contactEnrichment?.phones || [];
      const candidatePhones = context.normalizedCandidate?.phones || [];
      const hasPhones = enrichmentPhones.length > 0 || candidatePhones.length > 0;
      actualValue = enrichmentPhones.length > 0 ? enrichmentPhones : candidatePhones;
      if (!hasPhones) {
        isMissing = true;
      } else {
        for (const p of enrichmentPhones) {
          if (p.evidence) evidence.push(...p.evidence);
        }
        for (const cp of candidatePhones) {
          if (cp.sourceContributions) evidence.push(...cp.sourceContributions);
        }
      }
      break;
    }

    case 'HAS_BUSINESS_EMAIL': {
      const enrichmentEmails = context.contactEnrichment?.emails || [];
      const candidateEmails = context.normalizedCandidate?.emails || [];
      const hasEmails = enrichmentEmails.length > 0 || candidateEmails.length > 0;
      actualValue = enrichmentEmails.length > 0 ? enrichmentEmails : candidateEmails;
      if (!hasEmails) {
        isMissing = true;
      } else {
        for (const e of enrichmentEmails) {
          if (e.evidence) evidence.push(...e.evidence);
        }
        for (const ce of candidateEmails) {
          if (ce.sourceContributions) evidence.push(...ce.sourceContributions);
        }
      }
      break;
    }

    case 'HAS_BUSINESS_ADDRESS': {
      const enrichmentAddresses = context.contactEnrichment?.addresses || [];
      const candidateAddress = context.normalizedCandidate?.address ? [context.normalizedCandidate.address] : [];
      const hasAddresses = enrichmentAddresses.length > 0 || candidateAddress.length > 0;
      actualValue = enrichmentAddresses.length > 0 ? enrichmentAddresses : candidateAddress;
      if (!hasAddresses) {
        isMissing = true;
      } else {
        for (const a of enrichmentAddresses) {
          if (a.evidence) evidence.push(...a.evidence);
        }
        for (const ca of candidateAddress) {
          if (ca.sourceContributions) evidence.push(...ca.sourceContributions);
        }
      }
      break;
    }

    case 'HAS_CONTACT_FORM': {
      const forms = context.contactEnrichment?.contactForms || [];
      actualValue = forms.some(f => f.present);
      if (forms.length === 0) {
        isMissing = true;
      } else {
        for (const f of forms) {
          if (f.evidence) evidence.push(...f.evidence);
        }
      }
      break;
    }

    case 'HAS_SOCIAL_PROFILE': {
      const socials = context.contactEnrichment?.socialProfiles || [];
      actualValue = socials.map(s => s.platform);
      if (socials.length === 0) {
        isMissing = true;
      } else {
        for (const s of socials) {
          if (s.evidence) evidence.push(...s.evidence);
        }
      }
      break;
    }

    case 'LOCATION_MATCH': {
      const country =
        context.normalizedCandidate?.address?.value?.countryCode ||
        context.normalizedCandidate?.location?.value?.countryCode ||
        context.contactEnrichment?.addresses?.[0]?.country;
      const city =
        context.normalizedCandidate?.address?.value?.locality ||
        context.normalizedCandidate?.location?.value?.city ||
        context.contactEnrichment?.addresses?.[0]?.city;

      actualValue = { country, city };
      if (!country && !city) {
        isMissing = true;
      }
      break;
    }

    case 'CATEGORY_MATCH': {
      actualValue =
        context.normalizedCandidate?.categories?.[0]?.value?.normalizedCategory ||
        (context.normalizedCandidate as any)?.category?.normalizedCategory ||
        (context.normalizedCandidate as any)?.category ||
        context.relevanceResult?.evidenceItems?.find(e => e.evidenceType === 'CATEGORY_EVIDENCE')?.observedValue;
      if (!actualValue) isMissing = true;
      break;
    }

    case 'NAME_MATCH': {
      actualValue =
        context.canonicalDisplayName ||
        context.normalizedCandidate?.businessName?.value?.displayName ||
        context.contactEnrichment?.businessName?.normalizedName;
      if (!actualValue) isMissing = true;
      break;
    }

    case 'NEGATIVE_EVIDENCE': {
      const hasNegativeRelevance = context.relevanceResult?.relevanceState === 'NOT_RELEVANT';
      const hasNegativeWeb =
        context.websiteState === 'WEBSITE_NON_BUSINESS' ||
        context.websiteState === 'WEBSITE_PARKED';
      actualValue = hasNegativeRelevance || hasNegativeWeb;
      break;
    }

    case 'SOURCE_EVIDENCE_REQUIREMENT': {
      const allContribs = [
        ...(context.sourceContributions || []),
        ...(context.contactEnrichment?.sourceContributions || [])
      ];
      actualValue = allContribs.map(c => c.provenance);
      if (allContribs.length === 0) isMissing = true;
      break;
    }

    case 'COMPLETENESS_THRESHOLD': {
      actualValue = context.contactEnrichment?.completeness;
      if (!actualValue) isMissing = true;
      break;
    }

    case 'CUSTOM_FIELD': {
      if (criterion.field) {
        const resolvePath = (obj: any, path: string) => {
          if (!obj) return undefined;
          return path.split('.').reduce((curr, key) => (curr !== null && curr !== undefined ? curr[key] : undefined), obj);
        };
        actualValue =
          resolvePath(context, criterion.field) ??
          resolvePath(context.normalizedCandidate, criterion.field) ??
          resolvePath(context.contactEnrichment, criterion.field);
      }
      if (actualValue === undefined || actualValue === null) isMissing = true;
      break;
    }
  }

  // 2. Evaluate Policy Check: Is any required evidence BLOCKED?
  const matchingContrib = context.sourceContributions?.find(c => c.fieldName === criterion.field || c.fieldName === criterion.type.toLowerCase());
  const policyCheck = checkQualificationEligibility(matchingContrib);
  if (policyCheck.isBlocked) {
    return {
      criterionId: criterion.id,
      criterionType: criterion.type,
      operator: criterion.operator,
      expectedValue: criterion.expectedValue,
      actualValue,
      outcome: 'BLOCKED',
      mandatory: criterion.mandatory,
      weight,
      scoreContribution: 0,
      evidence,
      reasonCode: 'CRITERION_BLOCKED_BY_POLICY',
      explanation: `Evaluation blocked: ${policyCheck.reason || 'Source compliance restriction'}`
    };
  }

  // 3. Evaluate Contradiction
  if (isContradictory && policies.conflictPolicy === 'STRICT_CONTRADICTION') {
    return {
      criterionId: criterion.id,
      criterionType: criterion.type,
      operator: criterion.operator,
      expectedValue: criterion.expectedValue,
      actualValue,
      outcome: 'CONTRADICTORY',
      mandatory: criterion.mandatory,
      weight,
      scoreContribution: 0,
      evidence,
      reasonCode: 'CRITERION_CONTRADICTORY',
      explanation: `Contradiction detected: ${contradictionReason}`
    };
  }

  // 4. Handle Missing Data Policy
  if (isMissing) {
    if (policies.missingDataPolicy === 'MISSING_FAILS_REQUIRED') {
      return {
        criterionId: criterion.id,
        criterionType: criterion.type,
        operator: criterion.operator,
        expectedValue: criterion.expectedValue,
        actualValue: undefined,
        outcome: 'FAIL',
        mandatory: criterion.mandatory,
        weight,
        scoreContribution: 0,
        evidence: [],
        reasonCode: 'MISSING_DATA_FAILS',
        explanation: `Mandatory evidence for '${criterion.id}' is missing; policy classifies missing as FAIL.`
      };
    } else if (policies.missingDataPolicy === 'MISSING_ALLOWED') {
      return {
        criterionId: criterion.id,
        criterionType: criterion.type,
        operator: criterion.operator,
        expectedValue: criterion.expectedValue,
        actualValue: undefined,
        outcome: 'PASS',
        mandatory: criterion.mandatory,
        weight,
        scoreContribution: weight,
        evidence: [],
        reasonCode: 'MISSING_DATA_ALLOWED',
        explanation: `Evidence for '${criterion.id}' is absent; policy permits missing data as PASS.`
      };
    } else {
      // MISSING_IS_UNKNOWN
      return {
        criterionId: criterion.id,
        criterionType: criterion.type,
        operator: criterion.operator,
        expectedValue: criterion.expectedValue,
        actualValue: undefined,
        outcome: 'UNKNOWN',
        mandatory: criterion.mandatory,
        weight,
        scoreContribution: 0,
        evidence: [],
        reasonCode: 'MISSING_DATA_UNKNOWN',
        explanation: `Evidence for '${criterion.id}' is currently unknown or unobserved.`
      };
    }
  }

  // 5. Evaluate Operator
  // Special handling for LOCATION_MATCH object comparison
  let passed = false;
  if (criterion.type === 'LOCATION_MATCH' && typeof criterion.expectedValue === 'object') {
    const locActual = actualValue || {};
    let countryPass = true;
    let cityPass = true;
    if (criterion.expectedValue.country) {
      countryPass = evaluateOperator(criterion.operator, locActual.country, criterion.expectedValue.country);
    }
    if (criterion.expectedValue.city) {
      cityPass = evaluateOperator(criterion.operator, locActual.city, criterion.expectedValue.city);
    }
    passed = countryPass && cityPass;
  } else {
    passed = evaluateOperator(criterion.operator, actualValue, criterion.expectedValue);
  }

  const outcome: CriterionOutcome = passed ? 'PASS' : 'FAIL';
  const scoreContribution = passed ? weight : 0;
  reasonCode = passed ? 'CRITERION_SATISFIED' : 'CRITERION_UNSATISFIED';
  explanation = passed
    ? `Criterion '${criterion.id}' (${criterion.type}) passed: observed value satisfied operator ${criterion.operator}.`
    : `Criterion '${criterion.id}' (${criterion.type}) failed: observed value did not satisfy operator ${criterion.operator}.`;

  return {
    criterionId: criterion.id,
    criterionType: criterion.type,
    operator: criterion.operator,
    expectedValue: criterion.expectedValue,
    actualValue,
    outcome,
    mandatory: criterion.mandatory,
    weight,
    scoreContribution,
    evidence,
    reasonCode,
    explanation
  };
}
