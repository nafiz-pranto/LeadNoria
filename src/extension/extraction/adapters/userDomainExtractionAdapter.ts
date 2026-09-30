/**
 * User-Provided Domain Extraction Adapter (Phase 5)
 *
 * Implements the SourceAdapter interface for user-supplied business domains
 * (Website-First Fallback: manual paste or CSV upload).
 */

import type { SourceAdapter } from '../sourceAdapter.ts';
import type {
  SourceType,
  SourceCapabilityDeclaration,
  RawCandidateEnvelope,
  NormalizedCandidate,
  FieldPolicyEnvelope,
  NormalizationErrorRecord
} from '../types.ts';
import {
  normalizeBusinessName,
  normalizeUrl,
  normalizeSourceIdentifier
} from '../normalizer.ts';
import { assertProvenanceInvariants } from '../firewall.ts';

export interface UserDomainInput {
  domainOrUrl: string;
  businessName?: string;
  countryCode?: string;
}

export class UserDomainExtractionAdapter implements SourceAdapter<UserDomainInput> {
  readonly sourceType: SourceType = 'USER_PROVIDED_DOMAIN';

  readonly capabilities: SourceCapabilityDeclaration = {
    sourceType: 'USER_PROVIDED_DOMAIN',
    implementationStatus: 'IMPLEMENTED',
    supportedCapabilities: [
      'CAN_ACCEPT_DOMAIN',
      'CAN_PROVIDE_EXTERNAL_URL'
    ],
    unsupportedCapabilities: [
      'CAN_DISCOVER',
      'CAN_FETCH_DOMAIN',
      'CAN_EXTRACT_WEBSITE_FIELDS',
      'CAN_EXTRACT_BUSINESS_NAME',
      'CAN_EXTRACT_PHONE',
      'CAN_EXTRACT_ADDRESS',
      'CAN_EXTRACT_CATEGORY',
      'CAN_EXTRACT_LOCATION',
      'CAN_EXTRACT_SOCIAL'
    ],
    defaultPolicyStatus: 'NOT_APPLICABLE',
    defaultProvenance: 'USER_PROVIDED',
    defaultPersistenceStatus: 'USER_PROVIDED',
    defaultExportStatus: 'USER_APPROVED'
  };

  validateInput(input: UserDomainInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input || !input.domainOrUrl || !input.domainOrUrl.trim()) {
      errors.push('Missing required domainOrUrl input');
    }
    return { isValid: errors.length === 0, errors };
  }

  createRawEnvelope(input: UserDomainInput, runId: string): RawCandidateEnvelope {
    const now = new Date().toISOString();
    const candidateId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const fields: Record<string, FieldPolicyEnvelope<any>> = {
      websiteUrl: {
        value: input.domainOrUrl.trim(),
        fieldName: 'websiteUrl',
        provenance: 'USER_PROVIDED',
        acquisitionContext: 'USER_INPUT',
        source: 'USER_PROVIDED_DOMAIN',
        capturedAt: now,
        confidence: 'STRONG',
        policyStatus: 'NOT_APPLICABLE',
        persistenceStatus: 'USER_PROVIDED',
        exportStatus: 'USER_APPROVED',
        originalRawValue: input.domainOrUrl
      }
    };

    if (input.businessName) {
      fields.businessName = {
        value: input.businessName.trim(),
        fieldName: 'businessName',
        provenance: 'USER_PROVIDED',
        acquisitionContext: 'USER_INPUT',
        source: 'USER_PROVIDED_DOMAIN',
        capturedAt: now,
        confidence: 'STRONG',
        policyStatus: 'NOT_APPLICABLE',
        persistenceStatus: 'USER_PROVIDED',
        exportStatus: 'USER_APPROVED',
        originalRawValue: input.businessName
      };
    }

    return {
      candidateId,
      runId,
      source: 'USER_PROVIDED_DOMAIN',
      capturedAt: now,
      acquisitionContext: 'USER_INPUT',
      policyContext: 'NOT_APPLICABLE',
      defaultProvenance: 'USER_PROVIDED',
      fields,
      rawFieldMetadata: {
        countryCode: input.countryCode || '',
        subsequentCrawlPolicy: 'TARGET_SITE_RULES_APPLY'
      },
      persistenceEligibility: 'USER_PROVIDED',
      exportEligibility: 'USER_APPROVED',
      sourceContributions: [
        {
          source: 'USER_PROVIDED_DOMAIN',
          provenance: 'USER_PROVIDED',
          fieldName: 'domainOrUrl',
          acquisitionContext: 'USER_INPUT',
          restrictionBasis: 'NONE',
          isRestricted: false,
          policyStatus: 'NOT_APPLICABLE',
          persistenceStatus: 'USER_PROVIDED',
          exportStatus: 'USER_APPROVED'
        }
      ]
    };
  }

  normalize(rawEnvelope: RawCandidateEnvelope): NormalizedCandidate {
    const now = new Date().toISOString();
    const errors: NormalizationErrorRecord[] = [];

    // 1. Website URL
    const rawUrlEnvelope = rawEnvelope.fields.websiteUrl;
    const normUrl = normalizeUrl(rawUrlEnvelope?.value);
    if (!normUrl.isValid) {
      errors.push({
        code: 'INVALID_URL',
        field: 'websiteUrl',
        message: normUrl.error || 'Invalid URL',
        rejectedValue: rawUrlEnvelope?.value,
        timestamp: now
      });
    }

    const websiteField: FieldPolicyEnvelope<any> = {
      value: normUrl,
      fieldName: 'websiteUrl',
      provenance: 'USER_PROVIDED',
      acquisitionContext: 'USER_INPUT',
      source: 'USER_PROVIDED_DOMAIN',
      capturedAt: rawEnvelope.capturedAt,
      confidence: normUrl.isValid ? 'STRONG' : 'WEAK',
      policyStatus: 'NOT_APPLICABLE',
      persistenceStatus: normUrl.isValid ? 'USER_PROVIDED' : 'NOT_PERSISTABLE',
      exportStatus: normUrl.isValid ? 'USER_APPROVED' : 'NOT_EXPORTABLE',
      originalRawValue: rawUrlEnvelope?.originalRawValue,
      derivedFrom: [
        {
          source: 'USER_PROVIDED_DOMAIN',
          provenance: 'USER_PROVIDED',
          fieldName: 'websiteUrl',
          acquisitionContext: 'USER_INPUT',
          restrictionBasis: 'NONE',
          isRestricted: false,
          policyStatus: 'NOT_APPLICABLE',
          persistenceStatus: 'USER_PROVIDED',
          exportStatus: 'USER_APPROVED'
        }
      ]
    };
    if (rawUrlEnvelope) {
      assertProvenanceInvariants(rawUrlEnvelope, websiteField);
    }

    // 2. Business Name (if provided, or inferred from domain)
    const rawNameEnvelope = rawEnvelope.fields.businessName;
    const fallbackName = normUrl.canonicalDomain || 'Unknown Business';
    const normName = normalizeBusinessName(rawNameEnvelope ? rawNameEnvelope.value : fallbackName);

    const businessNameField: FieldPolicyEnvelope<any> = {
      value: normName,
      fieldName: 'businessName',
      provenance: 'USER_PROVIDED',
      acquisitionContext: 'USER_INPUT',
      source: 'USER_PROVIDED_DOMAIN',
      capturedAt: rawEnvelope.capturedAt,
      confidence: rawNameEnvelope ? 'STRONG' : 'MODERATE',
      policyStatus: 'NOT_APPLICABLE',
      persistenceStatus: 'USER_PROVIDED',
      exportStatus: 'USER_APPROVED',
      originalRawValue: rawNameEnvelope?.originalRawValue || fallbackName,
      derivedFrom: [
        {
          source: 'USER_PROVIDED_DOMAIN',
          provenance: 'USER_PROVIDED',
          fieldName: rawNameEnvelope ? 'businessName' : 'websiteUrl',
          acquisitionContext: 'USER_INPUT',
          restrictionBasis: 'NONE',
          isRestricted: false,
          policyStatus: 'NOT_APPLICABLE',
          persistenceStatus: 'USER_PROVIDED',
          exportStatus: 'USER_APPROVED'
        }
      ]
    };
    if (rawNameEnvelope) {
      assertProvenanceInvariants(rawNameEnvelope, businessNameField);
    }

    // 3. Source Identifier
    const sourceIdentifier = normalizeSourceIdentifier(
      'USER_PROVIDED_DOMAIN',
      normUrl.canonicalDomain || rawEnvelope.candidateId,
      'USER_DOMAIN_HASH',
      'USER_INPUT',
      'USER_PROVIDED',
      'NOT_APPLICABLE',
      [
        {
          source: 'USER_PROVIDED_DOMAIN',
          provenance: 'USER_PROVIDED',
          fieldName: 'domainOrUrl',
          acquisitionContext: 'USER_INPUT',
          restrictionBasis: 'NONE',
          isRestricted: false,
          policyStatus: 'NOT_APPLICABLE',
          persistenceStatus: 'USER_PROVIDED',
          exportStatus: 'USER_APPROVED'
        }
      ]
    );

    return {
      candidateId: rawEnvelope.candidateId,
      runId: rawEnvelope.runId,
      source: 'USER_PROVIDED_DOMAIN',
      sourceIdentifier,
      acquisitionContext: 'USER_INPUT',
      overallPolicyStatus: 'NOT_APPLICABLE',
      overallPersistenceStatus: 'USER_PROVIDED',
      overallExportStatus: 'USER_APPROVED',
      overallProvenance: 'USER_PROVIDED',
      sourceContributions: rawEnvelope.sourceContributions || [
        {
          source: 'USER_PROVIDED_DOMAIN',
          provenance: 'USER_PROVIDED',
          fieldName: 'domainOrUrl',
          acquisitionContext: 'USER_INPUT',
          restrictionBasis: 'NONE',
          isRestricted: false,
          policyStatus: 'NOT_APPLICABLE',
          persistenceStatus: 'USER_PROVIDED',
          exportStatus: 'USER_APPROVED'
        }
      ],
      businessName: businessNameField,
      websiteUrl: websiteField,
      phones: [],
      emails: [],
      categories: [],
      socialUrls: [],
      verificationPlaceholder: {
        verificationStatus: normUrl.isValid ? 'PENDING' : 'NOT_APPLICABLE',
        eligibleForDeepVerification: normUrl.isValid
      },
      qualificationPlaceholder: {
        relevanceDecision: 'PENDING',
        qualificationScore: 0
      },
      normalizationAudit: {
        normalizedAt: now,
        engineVersion: '5.0.0',
        errors,
        warnings: [],
        isSanitized: true
      }
    };
  }
}
