/**
 * LeadNoria Extraction Data Firewall & Policy Guards (Phase 5 Reconciled)
 *
 * Implements strict provenance invariants, dependency lineage tracking,
 * and recursive no-Google-persistence / no-Google-export guards.
 */

import type {
  FieldPolicyEnvelope,
  NormalizedCandidate,
  SourceContribution
} from './types.ts';

export class ProvenanceInvariantViolation extends Error {
  constructor(message: string) {
    super(`[PROVENANCE_INVARIANT_VIOLATION] ${message}`);
    this.name = 'ProvenanceInvariantViolation';
  }
}

export class PolicyBoundaryViolation extends Error {
  constructor(message: string) {
    super(`[POLICY_BOUNDARY_VIOLATION] ${message}`);
    this.name = 'PolicyBoundaryViolation';
  }
}

// ==========================================
// 1. Provenance Invariant Enforcement
// ==========================================

/**
 * Validates that normalization and transformation preserve all mandatory provenance invariants.
 */
export function assertProvenanceInvariants(
  rawField: FieldPolicyEnvelope<any>,
  normalizedField: FieldPolicyEnvelope<any>
): void {
  // RULE 2: GOOGLE_DERIVED never silently becomes WEBSITE_DERIVED
  if (rawField.provenance === 'GOOGLE_DERIVED' && normalizedField.provenance === 'WEBSITE_DERIVED') {
    throw new ProvenanceInvariantViolation(
      `Illegal provenance transformation: GOOGLE_DERIVED cannot be converted to WEBSITE_DERIVED for field '${rawField.fieldName}'.`
    );
  }

  // RULE 2b: META_DERIVED never silently becomes WEBSITE_DERIVED
  if (rawField.provenance === 'META_DERIVED' && normalizedField.provenance === 'WEBSITE_DERIVED') {
    throw new ProvenanceInvariantViolation(
      `Illegal provenance transformation: META_DERIVED cannot be converted to WEBSITE_DERIVED for field '${rawField.fieldName}' without independent website crawl.`
    );
  }

  // RULE 1 & RULE 5: Source provenance must survive normalization unchanged (or be LEADNORIA_DERIVED with explicit lineage)
  if (normalizedField.provenance === 'LEADNORIA_DERIVED') {
    // RULE 3 & 4: LEADNORIA_DERIVED must record underlying derivedFrom lineage
    if (!normalizedField.derivedFrom || normalizedField.derivedFrom.length === 0) {
      throw new ProvenanceInvariantViolation(
        `LEADNORIA_DERIVED field '${normalizedField.fieldName}' must preserve derivedFrom source lineage dependencies.`
      );
    }
  } else if (rawField.provenance !== normalizedField.provenance) {
    throw new ProvenanceInvariantViolation(
      `Field '${rawField.fieldName}' provenance changed from '${rawField.provenance}' to '${normalizedField.provenance}' during normalization.`
    );
  }

  // RULE 6 & RULE 7: Sanitization and canonicalization must not alter acquisition context
  if (normalizedField.provenance !== 'LEADNORIA_DERIVED' && rawField.acquisitionContext !== normalizedField.acquisitionContext) {
    throw new ProvenanceInvariantViolation(
      `Acquisition context mismatch for field '${rawField.fieldName}': expected '${rawField.acquisitionContext}', got '${normalizedField.acquisitionContext}'.`
    );
  }

  // RULE 8: Normalization must never convert restricted/gated/unknown policy data into unrestricted data
  if (
    (rawField.policyStatus === 'POLICY_GATED' ||
      rawField.policyStatus === 'UNKNOWN' ||
      rawField.policyStatus === 'POLICY_REVIEW_REQUIRED' ||
      rawField.policyStatus === 'TERMS_REVIEW_REQUIRED') &&
    normalizedField.policyStatus === 'POLICY_APPROVED'
  ) {
    throw new PolicyBoundaryViolation(
      `Illegal policy promotion: Field '${rawField.fieldName}' with status '${rawField.policyStatus}' cannot be promoted to POLICY_APPROVED by normalization alone.`
    );
  }
}

// ==========================================
// 2. Recursive Lineage Inspection Helper
// ==========================================

export function hasRestrictedGoogleContribution(field: FieldPolicyEnvelope<any>): boolean {
  // 1. Direct check
  if (
    (field.provenance === 'GOOGLE_DERIVED' && field.acquisitionContext === 'GOOGLE_CONSUMER_WEB') ||
    field.metadata?.restrictionBasis === 'GOOGLE_CONSUMER_WEB_RESTRICTED'
  ) {
    return true;
  }

  // 2. Inspect derivedFrom dependencies
  if (field.derivedFrom && field.derivedFrom.length > 0) {
    for (const dep of field.derivedFrom) {
      if (
        (dep.provenance === 'GOOGLE_DERIVED' && dep.acquisitionContext === 'GOOGLE_CONSUMER_WEB') ||
        dep.restrictionBasis === 'GOOGLE_CONSUMER_WEB_RESTRICTED' ||
        dep.isRestricted
      ) {
        return true;
      }
    }
  }

  // 3. Inspect sourceContributions (for MIXED entities)
  if (field.sourceContributions && field.sourceContributions.length > 0) {
    for (const contrib of field.sourceContributions) {
      if (
        (contrib.provenance === 'GOOGLE_DERIVED' && contrib.acquisitionContext === 'GOOGLE_CONSUMER_WEB') ||
        contrib.restrictionBasis === 'GOOGLE_CONSUMER_WEB_RESTRICTED' ||
        contrib.isRestricted
      ) {
        return true;
      }
    }
  }

  return false;
}

export function hasUncertainOrReviewRequiredContribution(field: FieldPolicyEnvelope<any>): boolean {
  // Direct check
  if (
    field.policyStatus === 'UNKNOWN' ||
    field.policyStatus === 'POLICY_REVIEW_REQUIRED' ||
    field.policyStatus === 'TERMS_REVIEW_REQUIRED' ||
    field.metadata?.restrictionBasis === 'UNKNOWN_REQUIRES_REVIEW'
  ) {
    return true;
  }

  // Service-specific API without explicit policy approval
  if (
    field.provenance === 'GOOGLE_API_DERIVED' &&
    field.policyStatus !== 'POLICY_APPROVED'
  ) {
    return true;
  }

  // Check derivedFrom dependencies
  if (field.derivedFrom && field.derivedFrom.length > 0) {
    for (const dep of field.derivedFrom) {
      if (
        dep.restrictionBasis === 'UNKNOWN_REQUIRES_REVIEW' ||
        dep.policyStatus === 'UNKNOWN' ||
        dep.policyStatus === 'POLICY_REVIEW_REQUIRED' ||
        dep.policyStatus === 'TERMS_REVIEW_REQUIRED'
      ) {
        return true;
      }
      if (
        dep.restrictionBasis === 'GOOGLE_API_SERVICE_SPECIFIC' &&
        dep.policyStatus !== 'POLICY_APPROVED'
      ) {
        return true;
      }
    }
  }

  // Check sourceContributions
  if (field.sourceContributions && field.sourceContributions.length > 0) {
    for (const contrib of field.sourceContributions) {
      if (
        contrib.restrictionBasis === 'UNKNOWN_REQUIRES_REVIEW' ||
        contrib.policyStatus === 'UNKNOWN' ||
        contrib.policyStatus === 'POLICY_REVIEW_REQUIRED' ||
        contrib.policyStatus === 'TERMS_REVIEW_REQUIRED'
      ) {
        return true;
      }
      if (
        contrib.restrictionBasis === 'GOOGLE_API_SERVICE_SPECIFIC' &&
        contrib.policyStatus !== 'POLICY_APPROVED'
      ) {
        return true;
      }
    }
  }

  return false;
}

// ==========================================
// 3. Google Persistence Guard (Recursive)
// ==========================================

/**
 * Ensures that no raw or derived Google-dependent field crosses the boundary into persistent storage.
 */
export function assertNoGooglePersistence(field: FieldPolicyEnvelope<any>): void {
  if (field.persistenceStatus === 'PERSISTABLE') {
    if (hasRestrictedGoogleContribution(field)) {
      throw new PolicyBoundaryViolation(
        `Google Persistence Guard: Field '${field.fieldName}' carries restricted GOOGLE_DERIVED / GOOGLE_CONSUMER_WEB lineage and must NOT be marked PERSISTABLE.`
      );
    }
    if (hasUncertainOrReviewRequiredContribution(field)) {
      throw new PolicyBoundaryViolation(
        `Policy Persistence Guard: Field '${field.fieldName}' carries uncertain or review-required policy status and must NOT be marked PERSISTABLE without explicit authorization.`
      );
    }
  }
}

// ==========================================
// 4. Google Export Guard (Recursive)
// ==========================================

/**
 * Ensures that no raw or derived Google-dependent field crosses the boundary into exportable outputs.
 */
export function assertNoGoogleExport(field: FieldPolicyEnvelope<any>): void {
  if (field.exportStatus === 'EXPORTABLE') {
    if (hasRestrictedGoogleContribution(field)) {
      throw new PolicyBoundaryViolation(
        `Google Export Guard: Field '${field.fieldName}' carries restricted GOOGLE_DERIVED / GOOGLE_CONSUMER_WEB lineage and must NOT be marked EXPORTABLE.`
      );
    }
    if (hasUncertainOrReviewRequiredContribution(field)) {
      throw new PolicyBoundaryViolation(
        `Policy Export Guard: Field '${field.fieldName}' carries uncertain or review-required policy status and must NOT be marked EXPORTABLE without explicit authorization.`
      );
    }
  }
}

// ==========================================
// 5. End-to-End Candidate Firewall Check
// ==========================================

export interface FirewallAuditReport {
  isCompliant: boolean;
  violations: string[];
  auditedFieldsCount: number;
}

export function auditCandidateDataFirewall(candidate: NormalizedCandidate): FirewallAuditReport {
  const violations: string[] = [];
  let auditedFieldsCount = 0;

  const checkField = (field?: FieldPolicyEnvelope<any>) => {
    if (!field) return;
    auditedFieldsCount++;

    try {
      assertNoGooglePersistence(field);
    } catch (err: any) {
      violations.push(err.message);
    }

    try {
      assertNoGoogleExport(field);
    } catch (err: any) {
      violations.push(err.message);
    }
  };

  checkField(candidate.businessName);
  checkField(candidate.websiteUrl);
  candidate.phones.forEach(checkField);
  candidate.emails.forEach(checkField);
  checkField(candidate.address);
  checkField(candidate.location);
  candidate.categories.forEach(checkField);
  candidate.socialUrls.forEach(checkField);
  checkField(candidate.externalProfileUrl);

  return {
    isCompliant: violations.length === 0,
    violations,
    auditedFieldsCount
  };
}
