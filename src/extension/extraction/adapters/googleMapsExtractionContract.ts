/**
 * Google Maps Extraction Contract (Phase 5 - Specification & Fixture Adapter)
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * - CONTRACT ONLY. NO LIVE GOOGLE MAPS DOM EXTRACTION.
 * - NO CSS SELECTORS, NO XPATH, NO MUTATIONOBSERVER.
 * - NO LIVE SCRAPING LOOPS, NO AUTOMATED SCROLLING/CLICKING.
 * - NO GOOGLE API CREDENTIALS OR REMOTE ENDPOINTS.
 *
 * Implements the SourceAdapter interface for synthetic/mock Google Maps fixtures,
 * enforcing immutable GOOGLE_DERIVED provenance, POLICY_GATED status,
 * NOT_PERSISTABLE storage bounds, and NOT_EXPORTABLE export bounds.
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
  normalizeAddress,
  normalizeCategory,
  normalizeLocation,
  normalizeSourceIdentifier
} from '../normalizer.ts';
import { assertProvenanceInvariants, assertNoGooglePersistence, assertNoGoogleExport } from '../firewall.ts';

export interface GoogleMapsSyntheticFixtureInput {
  placeName?: string;
  websiteUrl?: string;
  phoneNumber?: string;
  formattedAddress?: string;
  category?: string;
  locality?: string;
  countryCode?: string;
  sourceRecordId?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export class GoogleMapsExtractionContract implements SourceAdapter<GoogleMapsSyntheticFixtureInput> {
  readonly sourceType: SourceType = 'GOOGLE_MAPS';

  readonly capabilities: SourceCapabilityDeclaration = {
    sourceType: 'GOOGLE_MAPS',
    implementationStatus: 'CONTRACT_ONLY',
    supportedCapabilities: [
      'CAN_MODEL_NAME',
      'CAN_MODEL_WEBSITE',
      'CAN_MODEL_PHONE',
      'CAN_MODEL_ADDRESS',
      'CAN_MODEL_CATEGORY',
      'CAN_MODEL_LOCATION'
    ],
    unsupportedCapabilities: [
      'CAN_DISCOVER',
      'CAN_EXTRACT_BUSINESS_NAME',
      'CAN_EXTRACT_WEBSITE',
      'CAN_EXTRACT_PHONE',
      'CAN_EXTRACT_ADDRESS',
      'CAN_EXTRACT_CATEGORY',
      'CAN_EXTRACT_SOURCE_ID',
      'CAN_EXTRACT_LOCATION',
      'CAN_EXTRACT_SOCIAL',
      'CAN_PROVIDE_EXTERNAL_URL'
    ],
    defaultPolicyStatus: 'POLICY_GATED',
    defaultProvenance: 'GOOGLE_DERIVED',
    defaultPersistenceStatus: 'NOT_PERSISTABLE',
    defaultExportStatus: 'NOT_EXPORTABLE'
  };

  validateInput(input: GoogleMapsSyntheticFixtureInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input) {
      errors.push('Input fixture is null or undefined');
      return { isValid: false, errors };
    }
    if (!input.placeName && !input.websiteUrl && !input.sourceRecordId) {
      errors.push('Fixture missing primary candidate identifiers (placeName, websiteUrl, or sourceRecordId)');
    }
    return { isValid: errors.length === 0, errors };
  }

  createRawEnvelope(input: GoogleMapsSyntheticFixtureInput, runId: string): RawCandidateEnvelope {
    const now = new Date().toISOString();
    const candidateId = `gmaps_${input.sourceRecordId || Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const fields: Record<string, FieldPolicyEnvelope<any>> = {};

    if (input.placeName) {
      fields.businessName = {
        value: input.placeName,
        fieldName: 'businessName',
        provenance: 'GOOGLE_DERIVED',
        acquisitionContext: 'GOOGLE_CONSUMER_WEB',
        source: 'GOOGLE_MAPS',
        capturedAt: now,
        confidence: 'MODERATE',
        policyStatus: 'POLICY_GATED',
        persistenceStatus: 'NOT_PERSISTABLE',
        exportStatus: 'NOT_EXPORTABLE',
        originalRawValue: input.placeName
      };
    }

    if (input.websiteUrl) {
      fields.websiteUrl = {
        value: input.websiteUrl,
        fieldName: 'websiteUrl',
        provenance: 'GOOGLE_DERIVED',
        acquisitionContext: 'GOOGLE_CONSUMER_WEB',
        source: 'GOOGLE_MAPS',
        capturedAt: now,
        confidence: 'STRONG',
        policyStatus: 'POLICY_GATED',
        persistenceStatus: 'NOT_PERSISTABLE',
        exportStatus: 'NOT_EXPORTABLE',
        originalRawValue: input.websiteUrl
      };
    }

    if (input.phoneNumber) {
      fields.phoneNumber = {
        value: input.phoneNumber,
        fieldName: 'phoneNumber',
        provenance: 'GOOGLE_DERIVED',
        acquisitionContext: 'GOOGLE_CONSUMER_WEB',
        source: 'GOOGLE_MAPS',
        capturedAt: now,
        confidence: 'MODERATE',
        policyStatus: 'POLICY_GATED',
        persistenceStatus: 'NOT_PERSISTABLE',
        exportStatus: 'NOT_EXPORTABLE',
        originalRawValue: input.phoneNumber
      };
    }

    if (input.formattedAddress) {
      fields.address = {
        value: input.formattedAddress,
        fieldName: 'address',
        provenance: 'GOOGLE_DERIVED',
        acquisitionContext: 'GOOGLE_CONSUMER_WEB',
        source: 'GOOGLE_MAPS',
        capturedAt: now,
        confidence: 'MODERATE',
        policyStatus: 'POLICY_GATED',
        persistenceStatus: 'NOT_PERSISTABLE',
        exportStatus: 'NOT_EXPORTABLE',
        originalRawValue: input.formattedAddress
      };
    }

    if (input.category) {
      fields.category = {
        value: input.category,
        fieldName: 'category',
        provenance: 'GOOGLE_DERIVED',
        acquisitionContext: 'GOOGLE_CONSUMER_WEB',
        source: 'GOOGLE_MAPS',
        capturedAt: now,
        confidence: 'MODERATE',
        policyStatus: 'POLICY_GATED',
        persistenceStatus: 'NOT_PERSISTABLE',
        exportStatus: 'NOT_EXPORTABLE',
        originalRawValue: input.category
      };
    }

    return {
      candidateId,
      runId,
      source: 'GOOGLE_MAPS',
      capturedAt: now,
      acquisitionContext: 'GOOGLE_CONSUMER_WEB',
      policyContext: 'POLICY_GATED',
      defaultProvenance: 'GOOGLE_DERIVED',
      fields,
      rawFieldMetadata: {
        sourceRecordId: input.sourceRecordId || '',
        locality: input.locality || '',
        countryCode: input.countryCode || '',
        fixtureAuthority: 'TEST_FIXTURE_DATA',
        isSyntheticFixture: 'true'
      },
      persistenceEligibility: 'NOT_PERSISTABLE',
      exportEligibility: 'NOT_EXPORTABLE',
      sourceContributions: [
        {
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          fieldName: 'place',
          acquisitionContext: 'GOOGLE_CONSUMER_WEB',
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          isRestricted: true,
          policyStatus: 'POLICY_GATED',
          persistenceStatus: 'NOT_PERSISTABLE',
          exportStatus: 'NOT_EXPORTABLE'
        }
      ]
    };
  }

  normalize(rawEnvelope: RawCandidateEnvelope): NormalizedCandidate {
    const now = new Date().toISOString();
    const errors: NormalizationErrorRecord[] = [];

    // 1. Business Name (Immutable GOOGLE_DERIVED Provenance & NOT_PERSISTABLE Boundary)
    const rawNameEnvelope = rawEnvelope.fields.businessName;
    const normName = normalizeBusinessName(rawNameEnvelope?.value || 'Observed Place');
    const businessNameField: FieldPolicyEnvelope<any> = {
      value: normName,
      fieldName: 'businessName',
      provenance: 'GOOGLE_DERIVED',
      acquisitionContext: 'GOOGLE_CONSUMER_WEB',
      source: 'GOOGLE_MAPS',
      capturedAt: rawEnvelope.capturedAt,
      confidence: 'MODERATE',
      policyStatus: 'POLICY_GATED',
      persistenceStatus: 'NOT_PERSISTABLE',
      exportStatus: 'NOT_EXPORTABLE',
      originalRawValue: rawNameEnvelope?.originalRawValue,
      derivedFrom: [
        {
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          fieldName: 'placeName',
          acquisitionContext: 'GOOGLE_CONSUMER_WEB',
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          isRestricted: true,
          policyStatus: 'POLICY_GATED',
          persistenceStatus: 'NOT_PERSISTABLE',
          exportStatus: 'NOT_EXPORTABLE'
        }
      ]
    };
    if (rawNameEnvelope) {
      assertProvenanceInvariants(rawNameEnvelope, businessNameField);
    }
    assertNoGooglePersistence(businessNameField);
    assertNoGoogleExport(businessNameField);

    // 2. Website URL (Immutable GOOGLE_DERIVED Provenance & POLICY_GATED Status)
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
        provenance: 'GOOGLE_DERIVED',
        acquisitionContext: 'GOOGLE_CONSUMER_WEB',
        source: 'GOOGLE_MAPS',
        capturedAt: rawEnvelope.capturedAt,
        confidence: normUrl.isValid ? 'STRONG' : 'WEAK',
        policyStatus: 'POLICY_GATED',
        persistenceStatus: 'NOT_PERSISTABLE',
        exportStatus: 'NOT_EXPORTABLE',
        originalRawValue: rawUrlEnvelope.originalRawValue,
        derivedFrom: [
          {
            source: 'GOOGLE_MAPS',
            provenance: 'GOOGLE_DERIVED',
            fieldName: 'websiteUrl',
            acquisitionContext: 'GOOGLE_CONSUMER_WEB',
            restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
            isRestricted: true,
            policyStatus: 'POLICY_GATED',
            persistenceStatus: 'NOT_PERSISTABLE',
            exportStatus: 'NOT_EXPORTABLE'
          }
        ]
      };
      assertProvenanceInvariants(rawUrlEnvelope, websiteField);
      assertNoGooglePersistence(websiteField);
      assertNoGoogleExport(websiteField);
    }

    // 3. Phone Number
    const phones: Array<FieldPolicyEnvelope<any>> = [];
    if (rawEnvelope.fields.phoneNumber) {
      const rawPhoneEnvelope = rawEnvelope.fields.phoneNumber;
      const normPhone = normalizePhone(rawPhoneEnvelope.value, rawEnvelope.rawFieldMetadata.countryCode || 'US');
      const phoneField: FieldPolicyEnvelope<any> = {
        value: normPhone,
        fieldName: 'phoneNumber',
        provenance: 'GOOGLE_DERIVED',
        acquisitionContext: 'GOOGLE_CONSUMER_WEB',
        source: 'GOOGLE_MAPS',
        capturedAt: rawEnvelope.capturedAt,
        confidence: normPhone.isValid ? 'MODERATE' : 'WEAK',
        policyStatus: 'POLICY_GATED',
        persistenceStatus: 'NOT_PERSISTABLE',
        exportStatus: 'NOT_EXPORTABLE',
        originalRawValue: rawPhoneEnvelope.originalRawValue,
        derivedFrom: [
          {
            source: 'GOOGLE_MAPS',
            provenance: 'GOOGLE_DERIVED',
            fieldName: 'phoneNumber',
            acquisitionContext: 'GOOGLE_CONSUMER_WEB',
            restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
            isRestricted: true,
            policyStatus: 'POLICY_GATED',
            persistenceStatus: 'NOT_PERSISTABLE',
            exportStatus: 'NOT_EXPORTABLE'
          }
        ]
      };
      assertProvenanceInvariants(rawPhoneEnvelope, phoneField);
      assertNoGooglePersistence(phoneField);
      assertNoGoogleExport(phoneField);
      phones.push(phoneField);
    }

    // 4. Address
    let addressField: FieldPolicyEnvelope<any> | undefined;
    if (rawEnvelope.fields.address) {
      const rawAddrEnvelope = rawEnvelope.fields.address;
      const normAddr = normalizeAddress(rawAddrEnvelope.value, rawEnvelope.rawFieldMetadata.countryCode);
      addressField = {
        value: normAddr,
        fieldName: 'address',
        provenance: 'GOOGLE_DERIVED',
        acquisitionContext: 'GOOGLE_CONSUMER_WEB',
        source: 'GOOGLE_MAPS',
        capturedAt: rawEnvelope.capturedAt,
        confidence: 'MODERATE',
        policyStatus: 'POLICY_GATED',
        persistenceStatus: 'NOT_PERSISTABLE',
        exportStatus: 'NOT_EXPORTABLE',
        originalRawValue: rawAddrEnvelope.originalRawValue,
        derivedFrom: [
          {
            source: 'GOOGLE_MAPS',
            provenance: 'GOOGLE_DERIVED',
            fieldName: 'address',
            acquisitionContext: 'GOOGLE_CONSUMER_WEB',
            restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
            isRestricted: true,
            policyStatus: 'POLICY_GATED',
            persistenceStatus: 'NOT_PERSISTABLE',
            exportStatus: 'NOT_EXPORTABLE'
          }
        ]
      };
      assertProvenanceInvariants(rawAddrEnvelope, addressField);
      assertNoGooglePersistence(addressField);
      assertNoGoogleExport(addressField);
    }

    // 5. Category
    const categories: Array<FieldPolicyEnvelope<any>> = [];
    if (rawEnvelope.fields.category) {
      const rawCatEnvelope = rawEnvelope.fields.category;
      const normCat = normalizeCategory(rawCatEnvelope.value);
      const catField: FieldPolicyEnvelope<any> = {
        value: normCat,
        fieldName: 'category',
        provenance: 'GOOGLE_DERIVED',
        acquisitionContext: 'GOOGLE_CONSUMER_WEB',
        source: 'GOOGLE_MAPS',
        capturedAt: rawEnvelope.capturedAt,
        confidence: 'MODERATE',
        policyStatus: 'POLICY_GATED',
        persistenceStatus: 'NOT_PERSISTABLE',
        exportStatus: 'NOT_EXPORTABLE',
        originalRawValue: rawCatEnvelope.originalRawValue,
        derivedFrom: [
          {
            source: 'GOOGLE_MAPS',
            provenance: 'GOOGLE_DERIVED',
            fieldName: 'category',
            acquisitionContext: 'GOOGLE_CONSUMER_WEB',
            restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
            isRestricted: true,
            policyStatus: 'POLICY_GATED',
            persistenceStatus: 'NOT_PERSISTABLE',
            exportStatus: 'NOT_EXPORTABLE'
          }
        ]
      };
      assertProvenanceInvariants(rawCatEnvelope, catField);
      assertNoGooglePersistence(catField);
      assertNoGoogleExport(catField);
      categories.push(catField);
    }

    // 6. Source Identifier (Distinct GOOGLE_WEB_PLACE_ID)
    const sourceIdentifier = normalizeSourceIdentifier(
      'GOOGLE_MAPS',
      rawEnvelope.rawFieldMetadata.sourceRecordId || rawEnvelope.candidateId,
      'GOOGLE_WEB_PLACE_ID',
      'GOOGLE_CONSUMER_WEB',
      'GOOGLE_DERIVED',
      'POLICY_GATED',
      [
        {
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          fieldName: 'sourceRecordId',
          acquisitionContext: 'GOOGLE_CONSUMER_WEB',
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          isRestricted: true,
          policyStatus: 'POLICY_GATED',
          persistenceStatus: 'NOT_PERSISTABLE',
          exportStatus: 'NOT_EXPORTABLE'
        }
      ]
    );

    return {
      candidateId: rawEnvelope.candidateId,
      runId: rawEnvelope.runId,
      source: 'GOOGLE_MAPS',
      sourceIdentifier,
      acquisitionContext: 'GOOGLE_CONSUMER_WEB',
      overallPolicyStatus: 'POLICY_GATED',
      overallPersistenceStatus: 'NOT_PERSISTABLE',
      overallExportStatus: 'NOT_EXPORTABLE',
      overallProvenance: 'GOOGLE_DERIVED',
      sourceContributions: rawEnvelope.sourceContributions || [
        {
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          fieldName: 'place',
          acquisitionContext: 'GOOGLE_CONSUMER_WEB',
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          isRestricted: true,
          policyStatus: 'POLICY_GATED',
          persistenceStatus: 'NOT_PERSISTABLE',
          exportStatus: 'NOT_EXPORTABLE'
        }
      ],
      businessName: businessNameField,
      websiteUrl: websiteField,
      phones,
      emails: [],
      address: addressField,
      categories,
      socialUrls: [],
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
        warnings: ['Google Maps candidate is POLICY_GATED; raw fields must not persist or export.'],
        isSanitized: true
      }
    };
  }
}
