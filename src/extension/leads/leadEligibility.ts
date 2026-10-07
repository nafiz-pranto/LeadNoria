/**
 * LeadNoria — Export-Safe Lead Projection & Research Workspace
 * Part 8: Lead Eligibility Engine
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * - Pure, deterministic function: (context) => LeadEligibilityResult.
 * - QUALIFICATION IS NOT EXPORT ELIGIBILITY: A qualified Google candidate is NOT exportable
 *   without a verified, independent public source anchor.
 * - Rejects Google-restricted lineage with GOOGLE_RESTRICTED_LINEAGE.
 */

import type {
  IndependentSourceAnchor,
  LeadEligibilityReasonCode,
  LeadEligibilityResult,
  LeadEligibilityStatus
} from './leadTypes.ts';
import { hasGoogleMapsLineage, validateIndependentAnchor } from './leadProvenance.ts';

export interface LeadEligibilityEvaluationInput {
  readonly candidate?: {
    readonly candidateId: string;
    readonly source: string;
    readonly isRestricted: boolean;
    readonly reviewState?: string;
    readonly qualificationStatus?: string;
  };
  readonly independentSource?: IndependentSourceAnchor | null;
  readonly independentEvidence?: {
    readonly domain?: string;
    readonly businessName?: string;
    readonly hasPublicContact?: boolean;
    readonly hasLeadershipPerson?: boolean;
  };
  readonly reviewState?: string;
  readonly qualificationStatus?: string;
  readonly hasBlockingConflicts?: boolean;
  readonly policyOverrideBlock?: boolean;
}

/**
 * Pure evaluation function that determines whether a candidate / research context
 * is eligible to project into an ExportSafeLead.
 */
export function evaluateLeadEligibility(
  input: LeadEligibilityEvaluationInput
): LeadEligibilityResult {
  const reasonCodes: LeadEligibilityReasonCode[] = [];
  const reasonDescriptions: string[] = [];

  const evaluatedAt = new Date().toISOString();

  // 1. Check Policy Block
  if (input.policyOverrideBlock) {
    reasonCodes.push('EXPORT_POLICY_BLOCKED');
    reasonDescriptions.push('Manual or administrative export policy block active');
  }

  // 2. Check Blocking Conflicts
  if (input.hasBlockingConflicts) {
    reasonCodes.push('CONFLICT_BLOCKED');
    reasonDescriptions.push('Unresolved contradictory identity or place conflicts detected');
  }

  // 3. Inspect Candidate Lineage (if candidate is attached)
  const isGoogleLineage = input.candidate ? hasGoogleMapsLineage(input.candidate) : false;

  // 4. Verify Independent Source Anchor
  const anchorValidation = validateIndependentAnchor(input.independentSource);

  if (!anchorValidation.isValid || !input.independentSource) {
    reasonCodes.push('INDEPENDENT_SOURCE_MISSING');
    reasonDescriptions.push('Record lacks a verified independent public source anchor');

    if (isGoogleLineage) {
      reasonCodes.push('GOOGLE_RESTRICTED_LINEAGE');
      reasonDescriptions.push('Candidate originates from Google Maps browser observation; export strictly blocked under data firewall');
    }
  } else {
    // Independent source is valid!
    reasonCodes.push('INDEPENDENT_SOURCE_PRESENT');
    reasonDescriptions.push(`Anchored by independent public source (${input.independentSource.sourceClass}: ${input.independentSource.domain})`);

    if (input.independentSource.sourceClass === 'USER_PROVIDED') {
      reasonCodes.push('USER_PROVIDED_SOURCE');
      reasonDescriptions.push('Source entrypoint verified via direct user entry');
    } else if (input.independentSource.sourceClass === 'WEBSITE_PUBLIC') {
      reasonCodes.push('WEBSITE_PUBLIC_SOURCE');
      reasonDescriptions.push('Source entrypoint verified via direct public web crawl');
    }
  }

  // 5. Check Identity Evidence
  const hasIdentityName = Boolean(input.independentSource?.businessName || input.independentEvidence?.businessName);
  const hasIdentityDomain = Boolean(input.independentSource?.domain || input.independentEvidence?.domain);

  if (!hasIdentityName && !hasIdentityDomain) {
    reasonCodes.push('INSUFFICIENT_IDENTITY_EVIDENCE');
    reasonDescriptions.push('Missing verifiable business name or canonical domain in independent evidence');
  }

  // 6. Check Qualification & Review State Requirements
  const currentReview = input.reviewState || input.candidate?.reviewState || 'UNREVIEWED';
  const currentQual = input.qualificationStatus || input.candidate?.qualificationStatus;

  if (currentReview === 'UNREVIEWED' || currentReview === 'REVIEWING') {
    reasonCodes.push('REVIEW_NOT_COMPLETE');
    reasonDescriptions.push(`Human review state is ${currentReview}; completed review is required`);
  }

  if (currentQual && currentQual !== 'QUALIFIED') {
    reasonCodes.push('QUALIFICATION_REQUIRED');
    reasonDescriptions.push(`Candidate qualification status is ${currentQual}; must be QUALIFIED`);
  }

  // Determine overall eligibility status:
  // Must have: INDEPENDENT_SOURCE_PRESENT, sufficient identity, no GOOGLE_RESTRICTED_LINEAGE without independent anchor, no conflict, no policy block
  const hasFailureReasons = reasonCodes.some(code =>
    code === 'INDEPENDENT_SOURCE_MISSING' ||
    code === 'GOOGLE_RESTRICTED_LINEAGE' ||
    code === 'INSUFFICIENT_IDENTITY_EVIDENCE' ||
    code === 'CONFLICT_BLOCKED' ||
    code === 'EXPORT_POLICY_BLOCKED'
  );

  const isEligible = !hasFailureReasons;
  const status: LeadEligibilityStatus = isEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE';

  if (!isEligible) {
    reasonCodes.push('PERSISTENCE_NOT_ALLOWED');
    reasonDescriptions.push('Ineligible record cannot be serialized into persistent storage');
  }

  return Object.freeze({
    status,
    isExportEligible: isEligible,
    isPersistenceEligible: isEligible,
    reasonCodes: Object.freeze(reasonCodes),
    reasonDescriptions: Object.freeze(reasonDescriptions),
    evaluatedAt
  });
}
