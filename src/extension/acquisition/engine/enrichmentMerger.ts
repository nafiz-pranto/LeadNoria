/**
 * LeadNoria — Google Maps Candidate Enrichment Merger (Part 6)
 *
 * Merges website-derived and contact/person evidence into the SessionCandidate:
 * - HARD INVARIANT: Google source lineage remains strictly intact.
 *   (source: 'GOOGLE_MAPS_BROWSER', isRestricted: true, NOT_PERSISTABLE, NOT_EXPORTABLE).
 * - Non-destructive field merging: Maps phone and address are NEVER overwritten.
 * - Records PHONE_DIVERGENCE and ADDRESS_DIVERGENCE as non-blocking data quality issues.
 * - Attaches typed enrichment result and compact summary.
 * - Improves data completeness metrics without creating lead scoring or buyer prediction.
 */

import type {
  SessionCandidate,
  FieldConflict,
  FieldEvidenceEntry,
  DataQualityIssue,
  CandidateQualityMetrics,
  FieldLevelQualityState
} from './candidateIdentityTypes.ts';
import type {
  CandidateEnrichmentResult,
  CandidateEnrichmentSummary
} from './enrichmentTypes.ts';
import {
  normalizePhoneForIdentity,
  normalizeAddressForIdentity,
  arePhonesEquivalent
} from './candidateNormalizer.ts';

/**
 * Merges enrichment result into a SessionCandidate, producing an enriched immutable candidate.
 */
export function mergeEnrichmentIntoCandidate(
  candidate: SessionCandidate,
  enrichmentResult: CandidateEnrichmentResult
): SessionCandidate {
  const observedAt = enrichmentResult.completedAt || new Date().toISOString();

  // 1. Build compact summary
  const emailsCount = enrichmentResult.contactEvidence?.emails.length || 0;
  const phonesCount = enrichmentResult.contactEvidence?.phones.length || 0;
  const socialCount = enrichmentResult.contactEvidence?.socialProfiles.length || 0;
  const peopleCount = enrichmentResult.personEvidence?.people.length || 0;
  const pagesVisited = enrichmentResult.pagesVisited.length;

  const enrichmentSummary: CandidateEnrichmentSummary = {
    status: enrichmentResult.status,
    targetUrl: enrichmentResult.websiteTarget,
    emailsCount,
    phonesCount,
    socialCount,
    peopleCount,
    pagesVisited,
    completedAt: enrichmentResult.completedAt
  };

  // 2. Clone field evidence map
  const updatedFieldEvidence: Record<string, FieldEvidenceEntry[]> = {};
  for (const [key, list] of Object.entries(candidate.fieldEvidence || {})) {
    updatedFieldEvidence[key] = [...list];
  }

  // 3. Clone field conflicts
  const updatedFieldConflicts: FieldConflict[] = [...(candidate.fieldConflicts || [])];

  // 4. Quality issues tracking
  const newIssues: DataQualityIssue[] = [...(candidate.qualityMetrics?.issues || [])];

  // 5. Phone corroboration or divergence
  const mapsPhoneVal = candidate.phone?.parsedValue || candidate.phone?.rawValue;
  const normMapsPhone = normalizePhoneForIdentity(mapsPhoneVal);

  if (enrichmentResult.contactEvidence?.phones && enrichmentResult.contactEvidence.phones.length > 0) {
    if (!updatedFieldEvidence.phone) {
      updatedFieldEvidence.phone = [];
    }

    for (const webPhone of enrichmentResult.contactEvidence.phones) {
      const normWebPhone = normalizePhoneForIdentity(webPhone.phone);

      // Add to phone field evidence entries with WEBSITE source attribution
      updatedFieldEvidence.phone.push({
        value: webPhone.phone,
        availability: 'PRESENT',
        confidence: 0.90,
        observedAt: webPhone.observedAt || observedAt,
        searchUnitId: candidate.searchUnitId,
        observationId: `web_ph_${Math.abs(hashPhone(webPhone.phone))}`
      });

      if (normMapsPhone.isValid && normWebPhone.isValid) {
        if (arePhonesEquivalent(mapsPhoneVal, webPhone.phone)) {
          // Corroborated phone evidence: matches Maps phone!
        } else {
          // Divergence: differing phone number observed on website!
          // NEVER overwrite Maps phone destructively; record divergence conflict.
          if (!updatedFieldConflicts.some(fc => fc.fieldName === 'phone')) {
            updatedFieldConflicts.push({
              fieldName: 'phone',
              values: [
                {
                  value: mapsPhoneVal,
                  availability: 'PRESENT',
                  observedAt: candidate.firstObservedAt,
                  searchUnitId: candidate.searchUnitId,
                  observationId: candidate.candidateId
                },
                {
                  value: webPhone.phone,
                  availability: 'PRESENT',
                  observedAt: webPhone.observedAt || observedAt,
                  searchUnitId: candidate.searchUnitId,
                  observationId: `web_${webPhone.phone}`
                }
              ],
              selectedValue: mapsPhoneVal,
              resolutionReason: 'Retained primary Maps observation while preserving website phone divergence'
            });
          }

          if (!newIssues.some(iss => iss.code === 'INCONSISTENT_PHONE')) {
            newIssues.push({
              code: 'INCONSISTENT_PHONE',
              field: 'phone',
              severity: 'LOW',
              message: `Website exposes differing phone (${webPhone.phone}) than Maps listing (${mapsPhoneVal})`
            });
          }
        }
      }
    }
  }

  // 6. Address corroboration or divergence
  const mapsAddrVal = candidate.address?.parsedValue || candidate.address?.rawValue;
  const normMapsAddr = normalizeAddressForIdentity(mapsAddrVal);
  const webAddress = enrichmentResult.contactEvidence?.address?.address;

  if (webAddress) {
    if (!updatedFieldEvidence.address) {
      updatedFieldEvidence.address = [];
    }
    updatedFieldEvidence.address.push({
      value: webAddress,
      availability: 'PRESENT',
      confidence: 0.85,
      observedAt,
      searchUnitId: candidate.searchUnitId,
      observationId: `web_addr_${Math.abs(hashPhone(webAddress))}`
    });

    const normWebAddr = normalizeAddressForIdentity(webAddress);
    if (normMapsAddr.comparisonKey && normWebAddr.comparisonKey) {
      if (normMapsAddr.comparisonKey !== normWebAddr.comparisonKey) {
        // Materially divergent address
        if (!newIssues.some(iss => iss.code === 'INCONSISTENT_ADDRESS')) {
          newIssues.push({
            code: 'INCONSISTENT_ADDRESS',
            field: 'address',
            severity: 'LOW',
            message: `Website exposes address (${webAddress}) with variances from Maps listing (${mapsAddrVal})`
          });
        }
        if (!updatedFieldConflicts.some(fc => fc.fieldName === 'address')) {
          updatedFieldConflicts.push({
            fieldName: 'address',
            values: [
              {
                value: mapsAddrVal,
                availability: 'PRESENT',
                observedAt: candidate.firstObservedAt,
                searchUnitId: candidate.searchUnitId,
                observationId: candidate.candidateId
              },
              {
                value: webAddress,
                availability: 'PRESENT',
                observedAt,
                searchUnitId: candidate.searchUnitId,
                observationId: `web_${Math.abs(hashPhone(webAddress))}`
              }
            ],
            selectedValue: mapsAddrVal,
            resolutionReason: 'Retained primary Maps observation while preserving website address divergence'
          });
        }
      }
    }
  }

  // 7. Emails evidence
  if (enrichmentResult.contactEvidence?.emails && enrichmentResult.contactEvidence.emails.length > 0) {
    if (!updatedFieldEvidence.email) {
      updatedFieldEvidence.email = [];
    }
    for (const em of enrichmentResult.contactEvidence.emails) {
      updatedFieldEvidence.email.push({
        value: em.email,
        availability: 'PRESENT',
        confidence: 0.95,
        observedAt: em.observedAt || observedAt,
        searchUnitId: candidate.searchUnitId,
        observationId: `web_em_${Math.abs(hashPhone(em.email))}`
      });
    }
  }

  // 8. Website evidence corroboration
  if (enrichmentResult.websiteEvidence?.canonicalUrl) {
    if (!updatedFieldEvidence.websiteUrl) {
      updatedFieldEvidence.websiteUrl = [];
    }
    updatedFieldEvidence.websiteUrl.push({
      value: enrichmentResult.websiteEvidence.canonicalUrl,
      availability: 'PRESENT',
      confidence: 0.95,
      observedAt,
      searchUnitId: candidate.searchUnitId,
      observationId: `web_canon_${Math.abs(hashPhone(enrichmentResult.websiteEvidence.canonicalUrl))}`
    });
  }

  // 9. Recalculate field quality states and data completeness
  const prevMetrics = candidate.qualityMetrics;
  const fieldStates: Record<string, FieldLevelQualityState> = { ...(prevMetrics?.fieldStates || {}) };

  // Update phone state
  if (updatedFieldConflicts.some(fc => fc.fieldName === 'phone')) {
    fieldStates.phone = 'CONFLICTING';
  } else if (candidate.phone?.availability === 'PRESENT') {
    fieldStates.phone = phonesCount > 0 ? 'CONFIDENT' : (fieldStates.phone || 'SUPPORTED');
  }

  // Update email state
  if (emailsCount > 0) {
    fieldStates.email = 'CONFIDENT';
  }

  // Update website state
  if (enrichmentResult.status === 'COMPLETED' || enrichmentResult.status === 'PARTIAL') {
    fieldStates.website = 'CONFIDENT';
  }

  // Technical data completeness percentage calculation (9 core fields + email bonus)
  const coreFields = [
    candidate.businessName?.availability === 'PRESENT',
    candidate.address?.availability === 'PRESENT',
    candidate.phone?.availability === 'PRESENT' || phonesCount > 0,
    candidate.websiteUrl?.availability === 'PRESENT',
    candidate.rating?.availability === 'PRESENT',
    candidate.reviewCount?.availability === 'PRESENT',
    candidate.businessStatus?.availability === 'PRESENT',
    candidate.category?.availability === 'PRESENT',
    candidate.placeId?.availability === 'PRESENT'
  ];
  const presentCoreCount = coreFields.filter(Boolean).length;
  const hasEmailBonus = emailsCount > 0 ? 1 : 0;
  const completenessPct = Math.min(100, Math.round(((presentCoreCount + hasEmailBonus) / 10) * 100));

  const updatedQualityMetrics: CandidateQualityMetrics = {
    identityConfidence: prevMetrics?.identityConfidence || 'HIGH',
    identityConfidenceScore: prevMetrics?.identityConfidenceScore || 0.95,
    dataCompleteness: Math.max(completenessPct, prevMetrics?.dataCompleteness || 0),
    observedFieldCount: prevMetrics?.observedFieldCount || 9,
    supportedFieldCount: (prevMetrics?.supportedFieldCount || 7) + (emailsCount > 0 ? 1 : 0),
    unknownFieldCount: Math.max(0, (prevMetrics?.unknownFieldCount || 2) - (emailsCount > 0 ? 1 : 0)),
    conflictFieldCount: updatedFieldConflicts.length,
    fieldStates,
    issues: newIssues
  };

  // 10. Construct enriched candidate preserving ALL Level 2 invariants and Google restrictions
  const enrichedCandidate: SessionCandidate & { enrichmentSummary?: CandidateEnrichmentSummary } = {
    ...candidate,
    // Google Lineage Preserved
    source: 'GOOGLE_MAPS_BROWSER',
    isRestricted: true,

    // Attached enrichment data
    enrichmentStatus: enrichmentResult.status,
    enrichmentResult,
    enrichmentSummary,

    // Updated evidence and conflicts
    fieldEvidence: updatedFieldEvidence,
    fieldConflicts: updatedFieldConflicts,
    qualityMetrics: updatedQualityMetrics
  };

  return enrichedCandidate;
}

function hashPhone(val: string): number {
  let hash = 0;
  for (let i = 0; i < val.length; i++) {
    hash = (hash << 5) - hash + val.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
