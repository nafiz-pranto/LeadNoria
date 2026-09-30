/**
 * LeadNoria Maps Data Normalization Engine (Phase 7)
 *
 * Converts a Google Maps candidate envelope into LeadNoria's canonical normalized
 * candidate representation (NormalizedCandidate) adhering to strict source-neutral
 * normalization, data firewall, and provenance lineage standards.
 *
 * PHASE 7 BOUNDARIES:
 * - Pure data normalization only.
 * - NO Google Maps discovery, scraping, DOM selectors, or private RPCs.
 * - NO website crawling or verification.
 * - NO entity resolution or deduplication (Phase 8).
 * - NO commercial relevance scoring (Phase 9).
 * - NO qualification decisions (Phase 6).
 * - Google consumer-web restricted lineage is strictly preserved (NOT_PERSISTABLE / NOT_EXPORTABLE).
 */

import type {
  NormalizedCandidate,
  RawMapsCandidateEnvelope,
  FieldPolicyEnvelope,
  SourceContribution,
  SourceIdentifier,
  SourceType,
  ProvenanceType,
  AcquisitionContext,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus,
  PolicyRestrictionBasis,
  NormalizedBusinessNameComponents,
  NormalizedAddressComponents,
  NormalizedCategoryComponents,
  NormalizedLocationComponents,
  NormalizedPhoneComponents,
  NormalizedUrlComponents,
  NormalizedCoordinates,
  NormalizedBusinessStatus,
  NormalizedOpeningHours,
  OpeningHoursPeriod,
  NormalizedRatingComponents,
  NormalizedMapsUrlComponents,
  NormalizedPlaceReferenceComponents,
  BusinessOperationalStatus,
  CoordinateState,
  HoursState,
  RatingState
} from './types.ts';

import {
  sanitizeText,
  normalizeUrl,
  normalizePhone,
  normalizeBusinessName,
  detectScript
} from './normalizer.ts';

// ISO 3166-1 alpha-2 known mapping for deterministic canonicalization
const ISO_COUNTRY_MAP: Record<string, { code: string; name: string }> = {
  US: { code: 'US', name: 'United States' },
  USA: { code: 'US', name: 'United States' },
  'UNITED STATES': { code: 'US', name: 'United States' },
  BD: { code: 'BD', name: 'Bangladesh' },
  BANGLADESH: { code: 'BD', name: 'Bangladesh' },
  GB: { code: 'GB', name: 'United Kingdom' },
  UK: { code: 'GB', name: 'United Kingdom' },
  'UNITED KINGDOM': { code: 'GB', name: 'United Kingdom' },
  DE: { code: 'DE', name: 'Germany' },
  GERMANY: { code: 'DE', name: 'Germany' },
  DEUTSCHLAND: { code: 'DE', name: 'Germany' },
  FR: { code: 'FR', name: 'France' },
  FRANCE: { code: 'FR', name: 'France' },
  ES: { code: 'ES', name: 'Spain' },
  SPAIN: { code: 'ES', name: 'Spain' },
  ESPAÑA: { code: 'ES', name: 'Spain' },
  AE: { code: 'AE', name: 'United Arab Emirates' },
  UAE: { code: 'AE', name: 'United Arab Emirates' },
  'UNITED ARAB EMIRATES': { code: 'AE', name: 'United Arab Emirates' },
  CA: { code: 'CA', name: 'Canada' },
  CANADA: { code: 'CA', name: 'Canada' },
  AU: { code: 'AU', name: 'Australia' },
  AUSTRALIA: { code: 'AU', name: 'Australia' }
};

// Reusable frozen structures to prevent allocation churn in high-volume batches
const EMPTY_STRING_ARRAY: readonly string[] = Object.freeze([]);
const EMPTY_ANY_ARRAY: readonly any[] = Object.freeze([]);
const EMPTY_PERIODS: readonly OpeningHoursPeriod[] = Object.freeze([]);
const DEFAULT_VERIFICATION_ELIGIBLE = Object.freeze({
  verificationStatus: 'PENDING' as const,
  eligibleForDeepVerification: true
});
const DEFAULT_VERIFICATION_INELIGIBLE = Object.freeze({
  verificationStatus: 'PENDING' as const,
  eligibleForDeepVerification: false
});

// ============================================================================
// 1. Coordinates Normalization & Validation
// ============================================================================

export function normalizeMapsCoordinates(
  rawLat?: number | string | null,
  rawLng?: number | string | null
): NormalizedCoordinates {
  if (
    rawLat === undefined || rawLat === null || rawLat === '' ||
    rawLng === undefined || rawLng === null || rawLng === ''
  ) {
    return {
      latitude: null,
      longitude: null,
      rawLatitude: rawLat ?? undefined,
      rawLongitude: rawLng ?? undefined,
      coordinateState: 'MISSING'
    };
  }

  const latNum = typeof rawLat === 'number' ? rawLat : parseFloat(String(rawLat).trim());
  const lngNum = typeof rawLng === 'number' ? rawLng : parseFloat(String(rawLng).trim());

  if (
    Number.isNaN(latNum) || !Number.isFinite(latNum) ||
    Number.isNaN(lngNum) || !Number.isFinite(lngNum) ||
    latNum < -90 || latNum > 90 ||
    lngNum < -180 || lngNum > 180
  ) {
    return {
      latitude: null,
      longitude: null,
      rawLatitude: rawLat,
      rawLongitude: rawLng,
      coordinateState: 'INVALID'
    };
  }

  // Round deterministically to 6 decimal places (approx. 0.11 m resolution)
  const normLat = Math.round(latNum * 1e6) / 1e6;
  const normLng = Math.round(lngNum * 1e6) / 1e6;

  return {
    latitude: normLat,
    longitude: normLng,
    rawLatitude: rawLat,
    rawLongitude: rawLng,
    coordinateState: 'VALID',
    precision: 6
  };
}

// ============================================================================
// 2. Business Status Normalization
// ============================================================================

export function normalizeMapsBusinessStatus(
  rawStatus?: string | null
): NormalizedBusinessStatus {
  const original = sanitizeText(rawStatus, 100);
  if (!original) {
    return {
      status: 'UNKNOWN',
      originalStatus: '',
      statusState: 'UNKNOWN'
    };
  }

  const upper = original.toUpperCase().trim();

  let status: BusinessOperationalStatus = 'UNKNOWN';
  if (
    upper === 'OPERATIONAL' || upper === 'OPEN' || upper === 'ACTIVE' ||
    upper === 'OPEN_NOW' || upper === 'BUSINESS_OPEN'
  ) {
    status = 'OPEN';
  } else if (
    upper === 'CLOSED_PERMANENTLY' || upper === 'PERMANENTLY_CLOSED' || upper === 'CLOSED'
  ) {
    status = 'CLOSED';
  } else if (
    upper === 'CLOSED_TEMPORARILY' || upper === 'TEMPORARILY_CLOSED' || upper === 'TEMP_CLOSED'
  ) {
    status = 'TEMPORARILY_CLOSED';
  }

  return {
    status,
    originalStatus: original,
    statusState: status !== 'UNKNOWN' ? 'EXPLICIT' : 'UNKNOWN'
  };
}

// ============================================================================
// 3. Opening Hours Normalization
// ============================================================================

export function normalizeMapsOpeningHours(
  rawHours?: any
): NormalizedOpeningHours {
  if (!rawHours) {
    return {
      periods: EMPTY_PERIODS as OpeningHoursPeriod[],
      weekdayText: EMPTY_STRING_ARRAY as string[],
      timezone: 'TIMEZONE_UNKNOWN',
      hoursState: 'MISSING'
    };
  }

  const periods: OpeningHoursPeriod[] = [];
  const weekdayText: string[] = [];

  // Parse structured periods array if present
  if (Array.isArray(rawHours.periods)) {
    for (const p of rawHours.periods) {
      if (p && typeof p.day === 'number' && p.openTime && p.closeTime) {
        periods.push({
          day: p.day,
          openTime: sanitizeText(p.openTime, 10),
          closeTime: sanitizeText(p.closeTime, 10)
        });
      }
    }
  }

  // Parse weekdayText array if present
  if (Array.isArray(rawHours.weekdayText)) {
    for (const line of rawHours.weekdayText) {
      if (typeof line === 'string') {
        const cleaned = sanitizeText(line, 100);
        if (cleaned) weekdayText.push(cleaned);
      }
    }
  } else if (typeof rawHours === 'string') {
    const cleaned = sanitizeText(rawHours, 500);
    if (cleaned) weekdayText.push(cleaned);
  }

  let hoursState: HoursState = 'UNKNOWN_HOURS';
  if (periods.length > 0) {
    hoursState = 'STRUCTURED';
  } else if (weekdayText.some(t => /closed/i.test(t))) {
    hoursState = 'CLOSED_DAY';
  } else if (weekdayText.length > 0) {
    hoursState = 'STRUCTURED';
  }

  const timezone = typeof rawHours.timezone === 'string' && rawHours.timezone.trim()
    ? sanitizeText(rawHours.timezone, 50)
    : 'TIMEZONE_UNKNOWN';

  return {
    periods,
    weekdayText,
    timezone,
    hoursState,
    rawHours: typeof rawHours === 'object' ? undefined : String(rawHours)
  };
}

// ============================================================================
// 4. Rating & Review Count Normalization
// ============================================================================

export function normalizeMapsRating(
  rawRating?: number | string | null,
  rawReviewCount?: number | string | null
): NormalizedRatingComponents {
  let rating: number | null = null;
  let ratingState: RatingState = 'MISSING';

  if (rawRating !== undefined && rawRating !== null && rawRating !== '') {
    const rNum = typeof rawRating === 'number' ? rawRating : parseFloat(String(rawRating).trim());
    if (!Number.isNaN(rNum) && Number.isFinite(rNum) && rNum >= 1.0 && rNum <= 5.0) {
      rating = Math.round(rNum * 10) / 10;
      ratingState = 'VALID';
    } else {
      ratingState = 'INVALID';
    }
  }

  let reviewCount: number | null = null;
  let reviewCountState: RatingState = 'MISSING';

  if (rawReviewCount !== undefined && rawReviewCount !== null && rawReviewCount !== '') {
    const strVal = String(rawReviewCount).trim().replace(/,/g, '');
    const cNum = parseInt(strVal, 10);
    if (!Number.isNaN(cNum) && Number.isFinite(cNum) && cNum >= 0 && String(cNum) === strVal) {
      reviewCount = cNum;
      reviewCountState = 'VALID';
    } else {
      reviewCountState = 'INVALID';
    }
  }

  return {
    rating,
    reviewCount,
    ratingState,
    reviewCountState,
    originalRating: rawRating ?? undefined,
    originalReviewCount: rawReviewCount ?? undefined
  };
}

// ============================================================================
// 5. Maps URL Normalization
// ============================================================================

export function normalizeMapsUrl(
  rawUrl?: string | null
): NormalizedMapsUrlComponents {
  const original = sanitizeText(rawUrl, 1000);
  if (!original) {
    return {
      originalMapsUrl: '',
      normalizedMapsUrl: '',
      isValid: false
    };
  }

  try {
    const parsed = new URL(original);
    // Reject dangerous protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        originalMapsUrl: original,
        normalizedMapsUrl: '',
        isValid: false
      };
    }

    // Strip known advertising tracking params
    const trackingParams = ['gbraid', 'wbraid', 'gclid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign'];
    for (const p of trackingParams) {
      parsed.searchParams.delete(p);
    }

    // Preserve functional location parameters
    const placeQuery = parsed.searchParams.get('q') || parsed.searchParams.get('query') || undefined;

    return {
      originalMapsUrl: original,
      normalizedMapsUrl: parsed.toString(),
      isValid: true,
      placeQuery: placeQuery ? sanitizeText(placeQuery, 200) : undefined
    };
  } catch {
    return {
      originalMapsUrl: original,
      normalizedMapsUrl: '',
      isValid: false
    };
  }
}

// ============================================================================
// 6. Category Normalization
// ============================================================================

export function normalizeMapsCategory(
  rawCategory?: string | null
): NormalizedCategoryComponents & { categoryState: 'NORMALIZED' | 'UNKNOWN_CATEGORY' } {
  const original = sanitizeText(rawCategory, 150);
  if (!original) {
    return {
      sourceCategory: '',
      normalizedCategory: 'Unknown Category',
      categoryConfidence: 'UNKNOWN',
      categoryState: 'UNKNOWN_CATEGORY'
    };
  }

  // Preserve casing distinction across branches, collapse consecutive whitespace
  const normalized = original.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();

  return {
    sourceCategory: original,
    normalizedCategory: normalized,
    categoryConfidence: 'MODERATE',
    categoryState: 'NORMALIZED'
  };
}

// ============================================================================
// 7. Structured Address Normalization
// ============================================================================

export function normalizeMapsAddress(
  rawAddress?: string | null,
  structured?: {
    street?: string | null;
    locality?: string | null;
    region?: string | null;
    postalCode?: string | null;
    country?: string | null;
    countryCode?: string | null;
  }
): NormalizedAddressComponents {
  const displayAddress = sanitizeText(rawAddress, 500);
  const normalizedAddress = displayAddress.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();

  let countryCode: string | undefined = undefined;
  let country: string | undefined = undefined;

  if (structured?.countryCode) {
    const cleanCode = sanitizeText(structured.countryCode, 10).toUpperCase();
    if (ISO_COUNTRY_MAP[cleanCode]) {
      countryCode = ISO_COUNTRY_MAP[cleanCode].code;
      country = ISO_COUNTRY_MAP[cleanCode].name;
    } else if (cleanCode.length === 2) {
      countryCode = cleanCode;
    }
  }

  if (!countryCode && structured?.country) {
    const cleanCountry = sanitizeText(structured.country, 100).toUpperCase();
    if (ISO_COUNTRY_MAP[cleanCountry]) {
      countryCode = ISO_COUNTRY_MAP[cleanCountry].code;
      country = ISO_COUNTRY_MAP[cleanCountry].name;
    } else {
      country = sanitizeText(structured.country, 100);
    }
  }

  return {
    displayAddress,
    normalizedAddress,
    addressLine1: structured?.street ? sanitizeText(structured.street, 200) : undefined,
    locality: structured?.locality ? sanitizeText(structured.locality, 100) : undefined,
    region: structured?.region ? sanitizeText(structured.region, 100) : undefined,
    postalCode: structured?.postalCode ? sanitizeText(structured.postalCode, 50) : undefined,
    country: country || (structured?.country ? sanitizeText(structured.country, 100) : undefined),
    countryCode
  };
}

// ============================================================================
// 8. Main Maps Candidate Normalizer
// ============================================================================

export function normalizeMapsCandidate(
  raw: RawMapsCandidateEnvelope
): NormalizedCandidate {
  const capturedAt = raw.capturedAt || '2026-09-29T12:00:00.000Z';
  const source: SourceType = raw.source || 'GOOGLE_MAPS';
  const provenance: ProvenanceType = raw.provenance || 'GOOGLE_DERIVED';
  const acquisitionContext: AcquisitionContext = raw.acquisitionContext || 'GOOGLE_CONSUMER_WEB';

  // Determine policy restriction basis
  const restrictionBasis: PolicyRestrictionBasis = raw.restrictionBasis ||
    (acquisitionContext === 'GOOGLE_CONSUMER_WEB' ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' :
      acquisitionContext === 'GOOGLE_PLATFORM_API' ? 'GOOGLE_API_SERVICE_SPECIFIC' : 'NONE');

  const isRestricted = restrictionBasis === 'GOOGLE_CONSUMER_WEB_RESTRICTED';

  // Determine policy statuses adhering to firewall invariants
  let policyStatus: PolicyStatus = raw.policyStatus ||
    (isRestricted ? 'POLICY_GATED' :
      restrictionBasis === 'GOOGLE_API_SERVICE_SPECIFIC' ? 'POLICY_REVIEW_REQUIRED' : 'POLICY_APPROVED');

  let persistenceStatus: PersistenceStatus = raw.persistenceStatus ||
    (isRestricted ? 'NOT_PERSISTABLE' :
      restrictionBasis === 'GOOGLE_API_SERVICE_SPECIFIC' ? 'PERSISTENCE_GATED' : 'PERSISTABLE');

  let exportStatus: ExportStatus = raw.exportStatus ||
    (isRestricted ? 'NOT_EXPORTABLE' :
      restrictionBasis === 'GOOGLE_API_SERVICE_SPECIFIC' ? 'EXPORT_GATED' : 'EXPORTABLE');

  // Build the foundational source contribution representing this candidate
  const candidateContribution: SourceContribution = {
    source,
    provenance,
    fieldName: 'candidate',
    acquisitionContext,
    restrictionBasis,
    isRestricted,
    policyStatus,
    persistenceStatus,
    exportStatus
  };

  const hasRawContributions = Boolean(raw.sourceContributions && raw.sourceContributions.length > 0);
  const hasRawDerived = Boolean(raw.derivedFrom && raw.derivedFrom.length > 0);

  const allContributions: SourceContribution[] = hasRawContributions
    ? [candidateContribution, ...raw.sourceContributions!]
    : [candidateContribution];

  const derivedLineage: SourceContribution[] = hasRawDerived
    ? [candidateContribution, ...raw.derivedFrom!]
    : (hasRawContributions ? [candidateContribution] : allContributions);

  // Helper to construct deterministic FieldPolicyEnvelope
  function makeFieldEnvelope<T>(
    value: T,
    fieldName: string,
    fieldProvenance: ProvenanceType = provenance,
    fieldPolicy: PolicyStatus = policyStatus,
    fieldPersist: PersistenceStatus = persistenceStatus,
    fieldExport: ExportStatus = exportStatus,
    fieldDerived: SourceContribution[] = derivedLineage
  ): FieldPolicyEnvelope<T> {
    return {
      value,
      fieldName,
      provenance: fieldProvenance,
      acquisitionContext,
      source,
      capturedAt,
      confidence: 'STRONG',
      policyStatus: fieldPolicy,
      persistenceStatus: fieldPersist,
      exportStatus: fieldExport,
      derivedFrom: fieldDerived.length > 0 ? fieldDerived : undefined,
      sourceContributions: allContributions
    };
  }

  // 1. Business Name Normalization (Preserving Branch & Location Distinctions)
  const normName = normalizeBusinessName(raw.businessName);

  // 2. Address Normalization
  const normAddress = normalizeMapsAddress(raw.address, {
    street: raw.street,
    locality: raw.locality,
    region: raw.region,
    postalCode: raw.postalCode,
    country: raw.country,
    countryCode: raw.countryCode
  });

  // 3. Category Normalization
  const categories: Array<FieldPolicyEnvelope<NormalizedCategoryComponents>> = [];
  if (raw.category !== undefined && raw.category !== null) {
    const normCat = normalizeMapsCategory(raw.category);
    categories.push(makeFieldEnvelope(normCat, 'category'));
  }

  // 4. Coordinates Normalization
  const normCoords = normalizeMapsCoordinates(raw.latitude, raw.longitude);
  const coordinatesEnvelope = makeFieldEnvelope(normCoords, 'coordinates');

  // 5. Business Status Normalization
  let businessStatusEnvelope: FieldPolicyEnvelope<NormalizedBusinessStatus> | undefined;
  if (raw.businessStatus !== undefined && raw.businessStatus !== null) {
    const normStatus = normalizeMapsBusinessStatus(raw.businessStatus);
    businessStatusEnvelope = makeFieldEnvelope(normStatus, 'businessStatus');
  }

  // 6. Opening Hours Normalization
  let openingHoursEnvelope: FieldPolicyEnvelope<NormalizedOpeningHours> | undefined;
  if (raw.openingHours !== undefined && raw.openingHours !== null) {
    const normHours = normalizeMapsOpeningHours(raw.openingHours);
    openingHoursEnvelope = makeFieldEnvelope(normHours, 'openingHours');
  }

  // 7. Rating & Review Count Normalization
  let ratingEnvelope: FieldPolicyEnvelope<NormalizedRatingComponents> | undefined;
  if (raw.rating !== undefined || raw.reviewCount !== undefined) {
    const normRating = normalizeMapsRating(raw.rating, raw.reviewCount);
    ratingEnvelope = makeFieldEnvelope(normRating, 'rating');
  }

  // 8. Phone Normalization (reusing worldwide international normalizer)
  const phones: Array<FieldPolicyEnvelope<NormalizedPhoneComponents>> = [];
  if (raw.phone) {
    const normPhone = normalizePhone(raw.phone, normAddress.countryCode);
    phones.push(makeFieldEnvelope(normPhone, 'phone'));
  }

  // 9. Website URL Normalization (conservative allowlist, functional params preserved, NO verification)
  let websiteEnvelope: FieldPolicyEnvelope<NormalizedUrlComponents> | undefined;
  if (raw.website) {
    const normWeb = normalizeUrl(raw.website);
    websiteEnvelope = makeFieldEnvelope(normWeb, 'websiteUrl');
  }

  // 10. Maps URL Normalization
  let mapsUrlEnvelope: FieldPolicyEnvelope<NormalizedMapsUrlComponents> | undefined;
  if (raw.mapsUrl) {
    const normMapsUrl = normalizeMapsUrl(raw.mapsUrl);
    mapsUrlEnvelope = makeFieldEnvelope(normMapsUrl, 'mapsUrl');
  }

  // 11. Place Reference Normalization
  let placeRefEnvelope: FieldPolicyEnvelope<NormalizedPlaceReferenceComponents> | undefined;
  if (raw.placeReference || raw.sourceId) {
    const refType = raw.placeReference?.plusCode ? 'PLUS_CODE' :
      acquisitionContext === 'GOOGLE_PLATFORM_API' ? 'GOOGLE_API_PLACE_ID' : 'GOOGLE_WEB_PLACE_ID';

    const placeRef: NormalizedPlaceReferenceComponents = {
      placeId: raw.placeReference?.placeId || raw.sourceId,
      plusCode: raw.placeReference?.plusCode,
      dataId: raw.placeReference?.dataId,
      referenceType: refType
    };
    placeRefEnvelope = makeFieldEnvelope(placeRef, 'placeReference');
  }

  // Source Identifier
  const sourceRecordType = acquisitionContext === 'GOOGLE_PLATFORM_API'
    ? 'GOOGLE_API_PLACE_ID'
    : 'GOOGLE_WEB_PLACE_ID';

  const sourceIdentifier: SourceIdentifier = {
    sourceType: source,
    sourceRecordId: sanitizeText(raw.sourceId, 255),
    sourceRecordType,
    sourceContext: acquisitionContext,
    originalValue: raw.sourceId,
    normalizedValue: sanitizeText(raw.sourceId, 255).toLowerCase(),
    provenance,
    policyStatus,
    derivedFrom: derivedLineage
  };

  const candidateId = raw.candidateId || `maps_cand_${sourceIdentifier.normalizedValue}`;

  return {
    candidateId,
    runId: 'run-maps-p7',
    source,
    sourceIdentifier,
    acquisitionContext,
    overallPolicyStatus: policyStatus,
    overallPersistenceStatus: persistenceStatus,
    overallExportStatus: exportStatus,
    overallProvenance: provenance,
    sourceContributions: allContributions,
    businessName: makeFieldEnvelope(normName, 'businessName'),
    websiteUrl: websiteEnvelope,
    phones,
    emails: EMPTY_ANY_ARRAY as any,
    address: makeFieldEnvelope(normAddress, 'address'),
    location: normAddress.locality ? makeFieldEnvelope({
      sourceLocation: normAddress.locality,
      normalizedLocation: normAddress.locality.toLowerCase(),
      city: normAddress.locality,
      countryCode: normAddress.countryCode
    }, 'location') : undefined,
    categories,
    coordinates: coordinatesEnvelope,
    businessStatus: businessStatusEnvelope,
    openingHours: openingHoursEnvelope,
    rating: ratingEnvelope,
    mapsUrl: mapsUrlEnvelope,
    placeReference: placeRefEnvelope,
    socialUrls: EMPTY_ANY_ARRAY as any,
    verificationPlaceholder: websiteEnvelope
      ? DEFAULT_VERIFICATION_ELIGIBLE
      : DEFAULT_VERIFICATION_INELIGIBLE,
    qualificationPlaceholder: {
      relevanceDecision: 'PENDING',
      qualificationScore: 0,
      derivedFrom: derivedLineage
    },
    normalizationAudit: {
      normalizedAt: '2026-09-29T12:00:00.000Z',
      engineVersion: '1.2.0',
      errors: EMPTY_ANY_ARRAY as any,
      warnings: EMPTY_ANY_ARRAY as any,
      isSanitized: true
    }
  };
}

/**
 * Batch normalizes an array of Maps candidate envelopes.
 */
export function normalizeMapsCandidateBatch(
  rawCandidates: RawMapsCandidateEnvelope[]
): NormalizedCandidate[] {
  return rawCandidates.map(normalizeMapsCandidate);
}
