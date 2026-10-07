/**
 * LeadNoria — Google Maps Unified Candidate Review & Qualification Layer
 * Part 7: Conflict & Divergence Detection and Summarization
 *
 * HARD INVARIANTS:
 * - Conflicts must NEVER silently resolve or overwrite one source with another.
 * - Displays both sides explicitly (Maps observation vs Website observation).
 * - Surfaces PHONE_DIVERGENCE, ADDRESS_DIVERGENCE, WEBSITE_TARGET_CONFLICT,
 *   IDENTITY_CONFLICT, PLACE_ID_CONFLICT, OTHER_SOURCE_CONFLICT.
 */

import type { SessionCandidate } from '../engine/candidateIdentityTypes.ts';
import type { ConflictRecord, ConflictType, QualificationCriteria } from './reviewTypes.ts';
import { arePhonesEquivalent, normalizeAddressForIdentity } from '../engine/candidateNormalizer.ts';

/**
 * Extracts and categorizes all conflicts and divergences for a given candidate.
 */
export function extractCandidateConflicts(
  candidate: SessionCandidate,
  criteria?: QualificationCriteria
): readonly ConflictRecord[] {
  const conflicts: ConflictRecord[] = [];
  const seenConflictKeys = new Set<string>();

  const mapsObservedAt = candidate.firstObservedAt || new Date().toISOString();
  const enrichCompletedAt = candidate.enrichmentResult?.completedAt || candidate.lastObservedAt || mapsObservedAt;

  // 1. Inspect candidate.fieldConflicts (from deduplicator / merger)
  if (Array.isArray(candidate.fieldConflicts)) {
    for (const fc of candidate.fieldConflicts) {
      if (!fc || !fc.fieldName) continue;

      let conflictType: ConflictType = 'OTHER_SOURCE_CONFLICT';
      let tolerated = false;
      let severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      let mapsVal: unknown = undefined;
      let webVal: unknown = undefined;

      if (fc.fieldName === 'phone') {
        conflictType = 'PHONE_DIVERGENCE';
        tolerated = criteria ? criteria.allowPhoneDivergence : true;
        severity = 'LOW';
      } else if (fc.fieldName === 'address') {
        conflictType = 'ADDRESS_DIVERGENCE';
        tolerated = criteria ? criteria.allowAddressDivergence : true;
        severity = 'LOW';
      } else if (fc.fieldName === 'website' || fc.fieldName === 'websiteUrl') {
        conflictType = 'WEBSITE_TARGET_CONFLICT';
        tolerated = criteria ? criteria.allowWebsiteConflict : false;
        severity = 'MEDIUM';
      } else if (fc.fieldName === 'placeId') {
        conflictType = 'PLACE_ID_CONFLICT';
        tolerated = false;
        severity = 'HIGH';
      } else if (fc.fieldName === 'businessName') {
        conflictType = 'IDENTITY_CONFLICT';
        tolerated = false;
        severity = 'HIGH';
      }

      if (Array.isArray(fc.values)) {
        for (const entry of fc.values) {
          if (String(entry.observationId || '').startsWith('web_')) {
            webVal = entry.value;
          } else {
            mapsVal = entry.value;
          }
        }
      }

      if (mapsVal === undefined) mapsVal = fc.selectedValue;
      if (webVal === undefined && Array.isArray(fc.values) && fc.values.length > 1) {
        webVal = fc.values[1]?.value;
      }

      const dedupeKey = `${conflictType}_${fc.fieldName}_${String(mapsVal)}_${String(webVal)}`;
      if (!seenConflictKeys.has(dedupeKey)) {
        seenConflictKeys.add(dedupeKey);
        conflicts.push(Object.freeze({
          conflictType,
          fieldName: fc.fieldName,
          mapsValue: mapsVal,
          mapsObservedAt,
          websiteValue: webVal,
          websiteObservedAt: enrichCompletedAt,
          tolerated,
          severity,
          explanation: fc.resolutionReason || `Conflicting evidence detected across sources for ${fc.fieldName}`
        }));
      }
    }
  }

  // 2. Direct Cross-Check: Phone Divergence between Maps and Website enrichment
  const mapsPhone = candidate.phone?.parsedValue || candidate.phone?.rawValue;
  const webPhones = candidate.enrichmentResult?.contactEvidence?.phones;
  if (mapsPhone && Array.isArray(webPhones) && webPhones.length > 0) {
    const matchingPhone = webPhones.some(wp => arePhonesEquivalent(mapsPhone, wp.phone));
    if (!matchingPhone) {
      const primaryWebPhone = webPhones[0].phone;
      const dedupeKey = `PHONE_DIVERGENCE_phone_${mapsPhone}_${primaryWebPhone}`;
      if (!seenConflictKeys.has(dedupeKey)) {
        seenConflictKeys.add(dedupeKey);
        conflicts.push(Object.freeze({
          conflictType: 'PHONE_DIVERGENCE',
          fieldName: 'phone',
          mapsValue: mapsPhone,
          mapsObservedAt,
          websiteValue: primaryWebPhone,
          websiteObservedAt: webPhones[0].observedAt || enrichCompletedAt,
          tolerated: criteria ? criteria.allowPhoneDivergence : true,
          severity: 'LOW',
          explanation: `Website displays telephone (${primaryWebPhone}) differing from Google Maps listing (${mapsPhone})`
        }));
      }
    }
  }

  // 3. Direct Cross-Check: Address Divergence between Maps and Website enrichment
  const mapsAddress = candidate.address?.parsedValue || candidate.address?.rawValue;
  const webAddress = candidate.enrichmentResult?.contactEvidence?.address?.address;
  if (mapsAddress && webAddress) {
    const normMapsAddr = normalizeAddressForIdentity(mapsAddress);
    const normWebAddr = normalizeAddressForIdentity(webAddress);
    if (normMapsAddr.normalizedAddress && normWebAddr.normalizedAddress &&
        normMapsAddr.normalizedAddress !== normWebAddr.normalizedAddress) {
      const dedupeKey = `ADDRESS_DIVERGENCE_address_${mapsAddress}_${webAddress}`;
      if (!seenConflictKeys.has(dedupeKey)) {
        seenConflictKeys.add(dedupeKey);
        conflicts.push(Object.freeze({
          conflictType: 'ADDRESS_DIVERGENCE',
          fieldName: 'address',
          mapsValue: mapsAddress,
          mapsObservedAt,
          websiteValue: webAddress,
          websiteObservedAt: enrichCompletedAt,
          tolerated: criteria ? criteria.allowAddressDivergence : true,
          severity: 'LOW',
          explanation: `Website physical address (${webAddress}) diverges from Google Maps location (${mapsAddress})`
        }));
      }
    }
  }

  // 4. Direct Cross-Check: Website Target Divergence
  const mapsWeb = candidate.websiteUrl?.parsedValue || candidate.websiteUrl?.rawValue;
  const canonicalWeb = candidate.enrichmentResult?.websiteEvidence?.canonicalUrl;
  if (mapsWeb && canonicalWeb) {
    try {
      const u1 = new URL(mapsWeb.startsWith('http') ? mapsWeb : `https://${mapsWeb}`);
      const u2 = new URL(canonicalWeb.startsWith('http') ? canonicalWeb : `https://${canonicalWeb}`);
      const host1 = u1.hostname.replace(/^www\./i, '').toLowerCase();
      const host2 = u2.hostname.replace(/^www\./i, '').toLowerCase();
      if (host1 !== host2) {
        const dedupeKey = `WEBSITE_TARGET_CONFLICT_website_${mapsWeb}_${canonicalWeb}`;
        if (!seenConflictKeys.has(dedupeKey)) {
          seenConflictKeys.add(dedupeKey);
          conflicts.push(Object.freeze({
            conflictType: 'WEBSITE_TARGET_CONFLICT',
            fieldName: 'websiteUrl',
            mapsValue: mapsWeb,
            mapsObservedAt,
            websiteValue: canonicalWeb,
            websiteObservedAt: enrichCompletedAt,
            tolerated: criteria ? criteria.allowWebsiteConflict : false,
            severity: 'MEDIUM',
            explanation: `Maps website domain (${host1}) redirected or resolved to different canonical domain (${host2})`
          }));
        }
      }
    } catch {
      // Ignore malformed URL comparisons
    }
  }

  return Object.freeze(conflicts);
}
