/**
 * Meta Ad Library Extraction Adapter (Phase 5)
 *
 * Implements the SourceAdapter interface for Meta Ad Library candidates,
 * providing clean bridge compatibility with existing v1.0.0 data structures
 * without modifying any production Meta code.
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
  normalizePhone,
  normalizeCategory,
  normalizeLocation,
  normalizeSourceIdentifier,
  sanitizeText
} from '../normalizer.ts';
import { assertProvenanceInvariants } from '../firewall.ts';

export interface MetaAdCandidateInput {
  adLibraryId: string;
  pageId?: string;
  advertiserName?: string;
  adText?: string;
  destinationUrl?: string;
  pageProfileUrl?: string;
  category?: string;
  location?: string;
  countryCode?: string;
}

export class MetaExtractionAdapter implements SourceAdapter<MetaAdCandidateInput> {
  readonly sourceType: SourceType = 'META_AD_LIBRARY';

  readonly capabilities: SourceCapabilityDeclaration = {
    sourceType: 'META_AD_LIBRARY',
    implementationStatus: 'IMPLEMENTED',
    supportedCapabilities: [
      'CAN_DISCOVER',
      'CAN_EXTRACT_BUSINESS_NAME',
      'CAN_EXTRACT_WEBSITE',
      'CAN_EXTRACT_SOURCE_ID',
      'CAN_PROVIDE_EXTERNAL_URL'
    ],
    unsupportedCapabilities: [
      'CAN_EXTRACT_PHONE',
      'CAN_EXTRACT_ADDRESS',
      'CAN_EXTRACT_LOCATION'
    ],
    defaultPolicyStatus: 'POLICY_APPROVED',
    defaultProvenance: 'META_DERIVED',
    defaultPersistenceStatus: 'PERSISTABLE',
    defaultExportStatus: 'EXPORTABLE'
  };

  validateInput(input: MetaAdCandidateInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input) {
      errors.push('Input is null or undefined');
      return { isValid: false, errors };
    }
    if (!input.adLibraryId && !input.advertiserName && !input.destinationUrl) {
      errors.push('Meta candidate missing all primary identity attributes (adLibraryId, advertiserName, destinationUrl)');
    }
    return { isValid: errors.length === 0, errors };
  }

  createRawEnvelope(input: MetaAdCandidateInput, runId: string): RawCandidateEnvelope {
    const now = new Date().toISOString();
    const candidateId = `meta_${input.adLibraryId || Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const fields: Record<string, FieldPolicyEnvelope<any>> = {
      businessName: {
        value: input.advertiserName || 'Unknown Advertiser',
        fieldName: 'businessName',
        provenance: 'META_DERIVED',
        acquisitionContext: 'META_AD_LIBRARY',
        source: 'META_AD_LIBRARY',
        capturedAt: now,
        confidence: 'STRONG',
        policyStatus: 'POLICY_APPROVED',
        persistenceStatus: 'PERSISTABLE',
        exportStatus: 'EXPORTABLE',
        originalRawValue: input.advertiserName
      }
    };

    if (input.destinationUrl) {
      fields.websiteUrl = {
        value: input.destinationUrl,
        fieldName: 'websiteUrl',
        provenance: 'META_DERIVED',
        acquisitionContext: 'META_AD_LIBRARY',
        source: 'META_AD_LIBRARY',
        capturedAt: now,
        confidence: 'STRONG',
        policyStatus: 'POLICY_APPROVED',
        persistenceStatus: 'PERSISTABLE',
        exportStatus: 'EXPORTABLE',
        originalRawValue: input.destinationUrl
      };
    }

    return {
      candidateId,
      runId,
      source: 'META_AD_LIBRARY',
      capturedAt: now,
      acquisitionContext: 'META_AD_LIBRARY',
      policyContext: 'POLICY_APPROVED',
      defaultProvenance: 'META_DERIVED',
      fields,
      rawFieldMetadata: {
        adLibraryId: input.adLibraryId || '',
        pageId: input.pageId || '',
        countryCode: input.countryCode || ''
      },
      persistenceEligibility: 'PERSISTABLE',
      exportEligibility: 'EXPORTABLE',
      sourceContributions: [
        {
          source: 'META_AD_LIBRARY',
          provenance: 'META_DERIVED',
          fieldName: 'candidate',
          acquisitionContext: 'META_AD_LIBRARY',
          restrictionBasis: 'NONE',
          isRestricted: false,
          policyStatus: 'POLICY_APPROVED',
          persistenceStatus: 'PERSISTABLE',
          exportStatus: 'EXPORTABLE'
        }
      ]
    };
  }

  normalize(rawEnvelope: RawCandidateEnvelope): NormalizedCandidate {
    const now = new Date().toISOString();
    const errors: NormalizationErrorRecord[] = [];

    // 1. Business Name (Preserves META_DERIVED provenance and records lineage)
    const rawNameEnvelope = rawEnvelope.fields.businessName;
    const normName = normalizeBusinessName(rawNameEnvelope?.value);
    const businessNameField: FieldPolicyEnvelope<any> = {
      value: normName,
      fieldName: 'businessName',
      provenance: rawNameEnvelope.provenance,
      acquisitionContext: rawNameEnvelope.acquisitionContext,
      source: rawEnvelope.source,
      capturedAt: rawEnvelope.capturedAt,
      confidence: rawNameEnvelope.confidence,
      policyStatus: rawNameEnvelope.policyStatus,
      persistenceStatus: rawNameEnvelope.persistenceStatus,
      exportStatus: rawNameEnvelope.exportStatus,
      originalRawValue: rawNameEnvelope.originalRawValue,
      derivedFrom: [
        {
          source: 'META_AD_LIBRARY',
          provenance: 'META_DERIVED',
          fieldName: 'advertiserName',
          acquisitionContext: 'META_AD_LIBRARY',
          restrictionBasis: 'NONE',
          isRestricted: false,
          policyStatus: 'POLICY_APPROVED',
          persistenceStatus: 'PERSISTABLE',
          exportStatus: 'EXPORTABLE'
        }
      ]
    };
    assertProvenanceInvariants(rawNameEnvelope, businessNameField);

    // 2. Website URL (Pointers remain META_DERIVED until independent website crawl)
    let websiteField: FieldPolicyEnvelope<any> | undefined;
    if (rawEnvelope.fields.websiteUrl) {
      const rawUrlEnvelope = rawEnvelope.fields.websiteUrl;
      const normUrl = normalizeUrl(rawUrlEnvelope.value);
      if (!normUrl.isValid) {
        errors.push({
          code: 'INVALID_URL',
          field: 'websiteUrl',
          message: normUrl.error || 'Invalid URL',
          rejectedValue: rawUrlEnvelope.value,
          timestamp: now
        });
      }
      websiteField = {
        value: normUrl,
        fieldName: 'websiteUrl',
        provenance: rawUrlEnvelope.provenance,
        acquisitionContext: rawUrlEnvelope.acquisitionContext,
        source: rawEnvelope.source,
        capturedAt: rawEnvelope.capturedAt,
        confidence: normUrl.isValid ? 'STRONG' : 'WEAK',
        policyStatus: rawUrlEnvelope.policyStatus,
        persistenceStatus: normUrl.isValid ? rawUrlEnvelope.persistenceStatus : 'NOT_PERSISTABLE',
        exportStatus: normUrl.isValid ? rawUrlEnvelope.exportStatus : 'NOT_EXPORTABLE',
        originalRawValue: rawUrlEnvelope.originalRawValue,
        derivedFrom: [
          {
            source: 'META_AD_LIBRARY',
            provenance: 'META_DERIVED',
            fieldName: 'destinationUrl',
            acquisitionContext: 'META_AD_LIBRARY',
            restrictionBasis: 'NONE',
            isRestricted: false,
            policyStatus: 'POLICY_APPROVED',
            persistenceStatus: 'PERSISTABLE',
            exportStatus: 'EXPORTABLE'
          }
        ]
      };
      assertProvenanceInvariants(rawUrlEnvelope, websiteField);
    }

    // 3. Source Identifier
    const sourceIdentifier = normalizeSourceIdentifier(
      'META_AD_LIBRARY',
      rawEnvelope.rawFieldMetadata.adLibraryId || rawEnvelope.candidateId,
      'META_AD_ID',
      'META_AD_LIBRARY',
      'META_DERIVED',
      'POLICY_APPROVED',
      [
        {
          source: 'META_AD_LIBRARY',
          provenance: 'META_DERIVED',
          fieldName: 'adLibraryId',
          acquisitionContext: 'META_AD_LIBRARY',
          restrictionBasis: 'NONE',
          isRestricted: false,
          policyStatus: 'POLICY_APPROVED',
          persistenceStatus: 'PERSISTABLE',
          exportStatus: 'EXPORTABLE'
        }
      ]
    );

    return {
      candidateId: rawEnvelope.candidateId,
      runId: rawEnvelope.runId,
      source: 'META_AD_LIBRARY',
      sourceIdentifier,
      acquisitionContext: rawEnvelope.acquisitionContext,
      overallPolicyStatus: rawEnvelope.policyContext,
      overallPersistenceStatus: rawEnvelope.persistenceEligibility,
      overallExportStatus: rawEnvelope.exportEligibility,
      overallProvenance: 'META_DERIVED',
      sourceContributions: rawEnvelope.sourceContributions || [
        {
          source: 'META_AD_LIBRARY',
          provenance: 'META_DERIVED',
          fieldName: 'candidate',
          acquisitionContext: 'META_AD_LIBRARY',
          restrictionBasis: 'NONE',
          isRestricted: false,
          policyStatus: 'POLICY_APPROVED',
          persistenceStatus: 'PERSISTABLE',
          exportStatus: 'EXPORTABLE'
        }
      ],
      businessName: businessNameField,
      websiteUrl: websiteField,
      phones: [],
      emails: [],
      categories: [],
      socialUrls: [],
      externalProfileUrl: rawEnvelope.rawFieldMetadata.pageProfileUrl
        ? {
            value: rawEnvelope.rawFieldMetadata.pageProfileUrl,
            fieldName: 'externalProfileUrl',
            provenance: 'META_DERIVED',
            acquisitionContext: 'META_AD_LIBRARY',
            source: 'META_AD_LIBRARY',
            capturedAt: now,
            confidence: 'STRONG',
            policyStatus: 'POLICY_APPROVED',
            persistenceStatus: 'PERSISTABLE',
            exportStatus: 'EXPORTABLE',
            derivedFrom: [
              {
                source: 'META_AD_LIBRARY',
                provenance: 'META_DERIVED',
                fieldName: 'pageProfileUrl',
                acquisitionContext: 'META_AD_LIBRARY',
                restrictionBasis: 'NONE',
                isRestricted: false,
                policyStatus: 'POLICY_APPROVED',
                persistenceStatus: 'PERSISTABLE',
                exportStatus: 'EXPORTABLE'
              }
            ]
          }
        : undefined,
      verificationPlaceholder: {
        verificationStatus: websiteField?.value.isValid ? 'PENDING' : 'NOT_APPLICABLE',
        eligibleForDeepVerification: Boolean(websiteField?.value.isValid)
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
