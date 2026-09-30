/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Export Projection Layer
 * 
 * Non-Negotiable Invariants:
 * - Maps UnifiedResearchRecord to ExportRecordProjection according to policy evaluation
 * - Restricted fields are redacted/excluded; restricted values are never leaked
 * - Deterministic field formatting without random values or timestamps
 */

import { UnifiedResearchRecord } from '../pipeline/pipelineTypes.ts';
import { ExportRecordProjection, RecordExportEvaluation } from './exportTypes.ts';

export class ExportProjection {
  /**
   * Projects a UnifiedResearchRecord into an ExportRecordProjection,
   * respecting field-level policy exclusions.
   */
  projectRecord(record: UnifiedResearchRecord, evaluation: RecordExportEvaluation, exportedAt?: string): ExportRecordProjection | null {
    if (!evaluation.isEligibleForExport) {
      return null;
    }

    const excluded = new Set(evaluation.excludedFields);

    // Business Name
    const businessName = excluded.has('businessName')
      ? ''
      : (record.canonicalDisplayName || record.normalizedEntity?.businessName?.value?.displayName || '');

    // Website
    let website = '';
    if (!excluded.has('website')) {
      website = record.websiteVerificationResult?.finalUrl ||
        record.normalizedEntity?.websiteUrl?.value?.normalizedUrl || '';
    }

    // Phone
    let phone = '';
    if (!excluded.has('phone')) {
      if (record.contactEnrichmentResult?.phones && record.contactEnrichmentResult.phones.length > 0) {
        phone = record.contactEnrichmentResult.phones[0].e164Format ||
                record.contactEnrichmentResult.phones[0].nationalFormat ||
                record.contactEnrichmentResult.phones[0].normalizedValue || '';
      } else if (record.normalizedEntity?.phones && record.normalizedEntity.phones.length > 0) {
        const p = record.normalizedEntity.phones[0];
        phone = p.value?.e164Format || p.value?.internationalFormat || p.value?.nationalFormat || p.value?.rawPhone || '';
      }
    }

    // Email
    let email = '';
    if (!excluded.has('email')) {
      if (record.contactEnrichmentResult?.emails && record.contactEnrichmentResult.emails.length > 0) {
        email = record.contactEnrichmentResult.emails[0].normalizedEmail || '';
      } else if (record.normalizedEntity?.emails && record.normalizedEntity.emails.length > 0) {
        email = record.normalizedEntity.emails[0].value?.normalizedEmail || '';
      }
    }

    // Address
    let streetAddress = '';
    let city = '';
    let country = '';
    if (!excluded.has('address')) {
      if (record.contactEnrichmentResult?.addresses && record.contactEnrichmentResult.addresses.length > 0) {
        const loc = record.contactEnrichmentResult.addresses[0];
        streetAddress = loc.streetAddress || loc.normalizedAddress || loc.rawAddress || '';
        city = loc.city || '';
        country = loc.country || '';
      } else if (record.normalizedEntity?.address?.value) {
        const addr = record.normalizedEntity.address.value;
        streetAddress = addr.displayAddress || addr.normalizedAddress || '';
        city = addr.locality || '';
        country = addr.country || addr.countryCode || '';
      }
    }

    // Category
    let category = '';
    if (!excluded.has('category')) {
      const cats = record.normalizedEntity?.categories || [];
      if (cats.length > 0) {
        category = cats[0].value?.normalizedCategory || cats[0].value?.sourceCategory || '';
      }
    }

    // Relevance
    const relevance = record.relevanceResult?.evidenceTier || record.relevanceResult?.relevanceState || 'UNCERTAIN';

    // Qualification
    const qualificationStatus = record.qualificationDecision?.status || record.qualificationState || 'NOT_EVALUATED';
    const qualificationScore = record.qualificationDecision?.scoreSummary?.totalScore !== undefined
      ? String(record.qualificationDecision.scoreSummary.totalScore)
      : '';

    return {
      recordId: record.recordId,
      businessName,
      website,
      phone,
      email,
      streetAddress,
      city,
      country,
      category,
      relevance,
      qualificationStatus,
      qualificationScore,
      primarySource: record.primarySource,
      provenance: record.provenance,
      corroborationCount: record.corroborationCount || 1,
      exportedAt: exportedAt || record.updatedAt || new Date().toISOString()
    };
  }
}
