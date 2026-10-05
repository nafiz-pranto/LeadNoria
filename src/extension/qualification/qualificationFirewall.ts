/**
 * Qualification Firewall & Lineage Guard (Phase 12)
 *
 * Enforces strict policy boundary checks before evidence consumption,
 * ensures Google Maps consumer-web restrictions are strictly preserved,
 * blocks restricted fields from unauthorized qualification,
 * and maintains recursive provenance tracking.
 */

import type {
  SourceContribution,
  PolicyRestrictionBasis,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus,
  ProvenanceType
} from '../extraction/types.ts';
import type { CandidateEvaluationContext } from './qualificationTypes.ts';

export interface PolicyCheckResult {
  isBlocked: boolean;
  reason?: string;
  restrictionBasis: PolicyRestrictionBasis;
}

/**
 * Checks whether evidence associated with a field or source contribution is
 * legally and policy-wise permitted for internal qualification evaluation.
 */
export function checkQualificationEligibility(
  contribution?: SourceContribution
): PolicyCheckResult {
  if (!contribution) {
    return { isBlocked: false, restrictionBasis: 'NONE' };
  }

  // Check if contribution explicitly prohibits qualification processing
  if (contribution.policyStatus === 'PRODUCT_REJECTED') {
    return {
      isBlocked: true,
      reason: `Field '${contribution.fieldName}' is PRODUCT_REJECTED by compliance policy`,
      restrictionBasis: contribution.restrictionBasis
    };
  }

  return {
    isBlocked: false,
    restrictionBasis: contribution.restrictionBasis
  };
}

/**
 * Derives the composite restriction state for a qualification decision
 * without laundering restricted underlying sources.
 */
export function deriveCompositeRestrictions(
  context: CandidateEvaluationContext
): {
  isRestricted: boolean;
  restrictionBasis: PolicyRestrictionBasis;
  policyStatus: PolicyStatus;
  persistenceEligibility: PersistenceStatus;
  exportEligibility: ExportStatus;
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  derivedFrom: string[];
} {
  const allContributions: SourceContribution[] = [
    ...(context.sourceContributions || []),
    ...(context.relevanceResult?.sourceContributions || []),
    ...(context.mapsVerificationResult?.sourceContributions || []),
    ...(context.contactEnrichment?.sourceContributions || []),
    ...(context.businessIntelligence?.sourceContributions || [])
  ];

  // Deduplicate contributions by fieldName + source + provenance
  const seenContribKeys = new Set<string>();
  const dedupedContributions: SourceContribution[] = [];

  for (const c of allContributions) {
    const key = `${c.fieldName}_${c.source}_${c.provenance}_${c.acquisitionContext}`;
    if (!seenContribKeys.has(key)) {
      seenContribKeys.add(key);
      dedupedContributions.push(c);
    }
  }

  const allDerivedFrom = new Set<string>([
    ...(context.derivedFrom || []),
    ...(context.relevanceResult?.derivedFrom || []),
    ...(context.mapsVerificationResult?.derivedFrom || []),
    ...(context.contactEnrichment?.derivedFrom || []),
    ...(context.businessIntelligence?.derivedFrom || [])
  ]);

  // Check if any underlying source contribution is restricted
  const hasRestrictedGoogle =
    context.businessIntelligence?.hasRestrictedGoogleEvidence === true ||
    context.businessIntelligence?.sourceRestrictions?.isRestricted === true ||
    dedupedContributions.some(
      c => c.provenance === 'GOOGLE_DERIVED' || c.restrictionBasis === 'GOOGLE_CONSUMER_WEB_RESTRICTED'
    );

  const hasRestrictedAPI = dedupedContributions.some(
    c => c.restrictionBasis === 'GOOGLE_API_SERVICE_SPECIFIC'
  );

  let restrictionBasis: PolicyRestrictionBasis = 'NONE';
  let persistenceEligibility: PersistenceStatus = 'PERSISTABLE';
  let exportEligibility: ExportStatus = 'EXPORTABLE';
  let policyStatus: PolicyStatus = 'POLICY_APPROVED';

  if (hasRestrictedGoogle) {
    restrictionBasis = 'GOOGLE_CONSUMER_WEB_RESTRICTED';
    persistenceEligibility = 'NOT_PERSISTABLE';
    exportEligibility = 'NOT_EXPORTABLE';
  } else if (hasRestrictedAPI) {
    restrictionBasis = 'GOOGLE_API_SERVICE_SPECIFIC';
    persistenceEligibility = 'PERSISTENCE_GATED';
    exportEligibility = 'EXPORT_GATED';
    policyStatus = 'POLICY_REVIEW_REQUIRED';
  }

  // Compute composite provenance
  const provenances = new Set(dedupedContributions.map(c => c.provenance));
  let provenance: ProvenanceType = 'LEADNORIA_DERIVED';

  if (provenances.size > 1) {
    provenance = 'MIXED';
  } else if (provenances.size === 1) {
    provenance = Array.from(provenances)[0];
  } else if (context.contactEnrichment) {
    provenance = context.contactEnrichment.provenance;
  }

  return {
    isRestricted: hasRestrictedGoogle || hasRestrictedAPI,
    restrictionBasis,
    policyStatus,
    persistenceEligibility,
    exportEligibility,
    provenance,
    sourceContributions: dedupedContributions,
    derivedFrom: Array.from(allDerivedFrom).sort()
  };
}
