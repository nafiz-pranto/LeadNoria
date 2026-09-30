import type {
  WebsiteVerificationRecord,
  WebsiteVerificationStatus,
  ExtensionLead
} from '../types.ts';
import type {
  ResolvedEntityGroup
} from '../resolution/types.ts';
import type {
  EntityRelevanceResult,
  RelevanceState
} from './types.ts';
import { verifyLeadWebsite } from '../websiteVerifier.ts';
import { normalizeWebsiteUrl } from '../websiteUrlNormalizer.ts';

export interface MapsVerificationIntegrationResult {
  entityId: string;
  relevanceState: RelevanceState;
  websiteState: WebsiteVerificationStatus | 'WEBSITE_UNAVAILABLE' | 'WEBSITE_UNKNOWN';
  verificationState: string;
  verificationEvidence: any[];
  verificationReasons: string[];
  verificationTimestamp: string;
  sourceContributions: any[];
  derivedFrom: any[];
  policyEligibility: string;
  persistenceEligibility: string;
  exportEligibility: string;
  canonicalWebsiteIdentity?: string;
  redirectHistory?: string[];
}

/**
 * Gatekeeper for website verification. Only verifies RELEVANT or UNCERTAIN entities
 * with a usable website pointer.
 */
export async function verifyMapsEntityWebsite(
  relevanceResult: EntityRelevanceResult,
  entityGroup: ResolvedEntityGroup,
  customFetch?: (url: string, timeoutMs: number) => Promise<{ status: number; html: string }>
): Promise<MapsVerificationIntegrationResult> {
  // 1. Re-use existing LeadNoria verification engine logic
  const originalUrl = entityGroup.domains[0] || '';
  let websiteState: WebsiteVerificationStatus | 'WEBSITE_UNAVAILABLE' | 'WEBSITE_UNKNOWN' = 'WEBSITE_UNKNOWN';
  let verificationState = 'SKIPPED';
  let record: WebsiteVerificationRecord | null = null;
  let verificationReasons: string[] = [];

  // 2. Gate: only RELEVANT or UNCERTAIN
  if (relevanceResult.relevanceState !== 'RELEVANT' && relevanceResult.relevanceState !== 'UNCERTAIN') {
    verificationState = 'SKIPPED_NOT_RELEVANT';
    verificationReasons.push('Entity is NOT_RELEVANT; skipping website verification.');
  } else if (!originalUrl) {
    verificationState = 'SKIPPED_NO_URL';
    verificationReasons.push('No website pointer available on entity.');
  } else {
    try {
      const norm = normalizeWebsiteUrl(originalUrl);
      if (!norm.isValid) {
        verificationState = 'SKIPPED_INVALID_URL';
        websiteState = 'INVALID';
        verificationReasons.push(`URL security validation failed: ${norm.error || 'Invalid URL'}`);
      } else {
        // Safe to verify
        const shimLead = {
          id: entityGroup.entityId,
          name: entityGroup.canonicalDisplayName || '',
          canonicalName: relevanceResult.canonicalDisplayName,
          destinationUrl: originalUrl,
          observedUrls: [originalUrl],
        } as unknown as ExtensionLead;

        record = await verifyLeadWebsite(shimLead, customFetch);
        websiteState = record.status;
        verificationState = 'COMPLETED';
        verificationReasons.push(`Verification completed with status: ${record.status}`);
      }
    } catch (e: any) {
      verificationState = 'ERROR';
      websiteState = 'WEBSITE_UNAVAILABLE';
      verificationReasons.push(`Verification error: ${e.message}`);
    }
  }

  // 3. Provenance and Output Contract
  const combinedSourceContributions = [...relevanceResult.sourceContributions];
  const combinedDerivedFrom = [...relevanceResult.derivedFrom];
  
  // Note: the original GOOGLE_DERIVED pointer remains restricted in sourceContributions.
  if (record) {
    combinedSourceContributions.push({
      source: 'FUTURE_SOURCE' as any,
      provenance: 'WEBSITE_DERIVED',
      fieldName: 'websiteVerification',
      acquisitionContext: 'WEBSITE_DIRECT',
      isRestricted: false,
      restrictionBasis: 'NONE' as any,
      policyStatus: 'POLICY_APPROVED',
      persistenceStatus: 'PERSISTABLE',
      exportStatus: 'EXPORTABLE'
    });
  }

  return {
    entityId: relevanceResult.entityId,
    relevanceState: relevanceResult.relevanceState,
    websiteState,
    verificationState,
    verificationEvidence: record ? record.evidence : [],
    verificationReasons,
    verificationTimestamp: record ? record.verifiedAt : new Date().toISOString(),
    sourceContributions: combinedSourceContributions,
    derivedFrom: combinedDerivedFrom,
    policyEligibility: relevanceResult.policyEligibility,
    persistenceEligibility: relevanceResult.persistenceEligibility,
    exportEligibility: relevanceResult.exportEligibility,
    canonicalWebsiteIdentity: record?.finalOrigin || undefined,
    redirectHistory: record?.finalUrl && record.finalUrl !== record.originalUrl ? [record.originalUrl, record.finalUrl] : undefined
  };
}
