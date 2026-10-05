/**
 * LeadNoria — Phase 20: Google Maps Field Extraction + Coverage Engine
 * Google Maps Field Normalizer
 *
 * Deterministic, non-inferential normalization for Google-derived fields.
 *
 * Invariants:
 * - Deterministic, pure transformations (no network, no side-effects).
 * - Every field maintains GOOGLE_DERIVED provenance and explicit normalization lineage.
 * - NEVER fabricates missing values or guesses country codes / emails / people.
 * - Distinguishes between field absence and malformed/extraction failure states.
 * - Preserves original casing and wording while standardizing whitespace & Unicode.
 * - Rejects dangerous URL schemes (javascript:, data:, vbscript:, etc.).
 */

import type {
  GoogleDerivedField,
  GoogleAddressComponents,
  GoogleOpeningHoursStructured,
  GoogleBusinessAttributes,
  GoogleSourceContext,
  GoogleMapsNormalizedRecord,
  FieldQualityState,
  FieldQualityReason
} from './googleMapsFieldModel.ts';
import { calculateAcquisitionQuality } from './googleMapsFieldModel.ts';
import type { GoogleMapsObservedFields } from './browserAcquisitionTypes.ts';

// ==========================================
// 1. Text & Unicode Normalization Helper
// ==========================================

export function cleanText(raw?: string): string | undefined {
  if (raw == null) return undefined;
  // Unicode NFC normalization
  const normalized = String(raw).normalize('NFC');
  // Collapse whitespace (including tabs, non-breaking spaces)
  const collapsed = normalized.replace(/[\s\u00A0\u200B-\u200D\uFEFF]+/g, ' ').trim();
  return collapsed.length > 0 ? collapsed : undefined;
}

// ==========================================
// 2. Business Name Normalizer
// ==========================================

export function normalizeBusinessNameField(
  rawName?: string,
  observedAt: string = new Date().toISOString()
): GoogleDerivedField<string> {
  const cleaned = cleanText(rawName);
  if (!cleaned) {
    return {
      fieldName: 'businessName',
      value: undefined,
      originalRawValue: rawName,
      state: 'ABSENT',
      qualityReason: 'FIELD_NOT_OBSERVED',
      provenance: 'GOOGLE_DERIVED',
      observedAt
    };
  }

  // Preserve meaningful punctuation (&, ', -, ., ,, #, +, /) without aggressive rewrite
  // Truncate excessively long strings (>300 chars) for memory safety
  const safeName = cleaned.slice(0, 300);

  return {
    fieldName: 'businessName',
    value: safeName,
    originalRawValue: rawName,
    state: 'PRESENT',
    provenance: 'GOOGLE_DERIVED',
    transformation: 'Unicode NFC normalization and whitespace collapse',
    observedAt
  };
}

// ==========================================
// 3. Category Normalizer
// ==========================================

export function normalizeCategories(
  rawPrimary?: string,
  rawSecondary?: string[],
  observedAt: string = new Date().toISOString()
): {
  primaryCategory?: GoogleDerivedField<string>;
  secondaryCategories?: GoogleDerivedField<string[]>;
} {
  const cleanedPrimary = cleanText(rawPrimary);
  const primaryField: GoogleDerivedField<string> | undefined = cleanedPrimary
    ? {
        fieldName: 'primaryCategory',
        value: cleanedPrimary,
        originalRawValue: rawPrimary,
        state: 'PRESENT',
        provenance: 'GOOGLE_DERIVED',
        transformation: 'Trim and Unicode normalization',
        observedAt
      }
    : rawPrimary != null
    ? {
        fieldName: 'primaryCategory',
        value: undefined,
        originalRawValue: rawPrimary,
        state: 'INVALID',
        provenance: 'GOOGLE_DERIVED',
        observedAt
      }
    : undefined;

  let secondaryField: GoogleDerivedField<string[]> | undefined;
  if (Array.isArray(rawSecondary) && rawSecondary.length > 0) {
    const seen = new Set<string>();
    if (cleanedPrimary) seen.add(cleanedPrimary.toLowerCase());

    const deduped: string[] = [];
    for (const cat of rawSecondary) {
      const c = cleanText(cat);
      if (c && !seen.has(c.toLowerCase())) {
        seen.add(c.toLowerCase());
        deduped.push(c);
      }
    }

    if (deduped.length > 0) {
      secondaryField = {
        fieldName: 'secondaryCategories',
        value: deduped,
        originalRawValue: JSON.stringify(rawSecondary),
        state: 'PRESENT',
        provenance: 'GOOGLE_DERIVED',
        transformation: 'Trim, Unicode normalization, and exact case-insensitive deduplication',
        observedAt
      };
    }
  }

  return { primaryCategory: primaryField, secondaryCategories: secondaryField };
}

// ==========================================
// 4. Address Normalizer
// ==========================================

export function normalizeAddressField(
  rawAddress?: string,
  rawComponents?: {
    street?: string;
    city?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  },
  observedAt: string = new Date().toISOString()
): GoogleDerivedField<GoogleAddressComponents> | undefined {
  const cleanedFull = cleanText(rawAddress?.replace(/[\r\n]+/g, ', '));

  if (!cleanedFull && !rawComponents) {
    return undefined;
  }

  if (!cleanedFull && rawComponents) {
    // Only component pieces provided
    const parts = [
      rawComponents.street,
      rawComponents.city ?? rawComponents.locality,
      rawComponents.region,
      rawComponents.postalCode,
      rawComponents.country
    ].filter(Boolean);

    if (parts.length === 0) return undefined;

    const assembled = parts.join(', ');
    return {
      fieldName: 'address',
      value: {
        fullAddress: assembled,
        street: cleanText(rawComponents.street),
        city: cleanText(rawComponents.city ?? rawComponents.locality),
        region: cleanText(rawComponents.region),
        postalCode: cleanText(rawComponents.postalCode),
        country: cleanText(rawComponents.country)
      },
      originalRawValue: assembled,
      state: 'PARTIAL',
      qualityReason: 'ADDRESS_INCOMPLETE',
      provenance: 'GOOGLE_DERIVED',
      transformation: 'Assembled from discrete observed components',
      observedAt
    };
  }

  // When full address string is present
  const fullAddress = cleanedFull!;

  // Parse comma-delimited components if discrete ones weren't passed
  let street = cleanText(rawComponents?.street);
  let city = cleanText(rawComponents?.city ?? rawComponents?.locality);
  let region = cleanText(rawComponents?.region);
  let postalCode = cleanText(rawComponents?.postalCode);
  let country = cleanText(rawComponents?.country);

  // If discrete components absent, perform safe heuristic decomposition on comma tokens
  if (!street && !city && fullAddress.includes(',')) {
    const tokens = fullAddress.split(',').map(t => t.trim()).filter(Boolean);
    if (tokens.length >= 2) {
      street = tokens[0];
      if (tokens.length === 2) {
        city = tokens[1];
      } else if (tokens.length === 3) {
        city = tokens[1];
        country = tokens[2];
      } else if (tokens.length >= 4) {
        city = tokens[1];
        region = tokens[2];
        country = tokens[tokens.length - 1];
        // Check if token has postal code pattern
        const pcMatch = region.match(/\b\d{4,6}\b/);
        if (pcMatch) {
          postalCode = pcMatch[0];
        }
      }
    }
  }

  const components: GoogleAddressComponents = {
    fullAddress,
    ...(street ? { street } : {}),
    ...(city ? { city } : {}),
    ...(region ? { region } : {}),
    ...(postalCode ? { postalCode } : {}),
    ...(country ? { country } : {})
  };

  const isPartial = !street || !city || !country;

  return {
    fieldName: 'address',
    value: components,
    originalRawValue: rawAddress,
    state: isPartial ? 'PARTIAL' : 'PRESENT',
    qualityReason: isPartial ? 'ADDRESS_INCOMPLETE' : undefined,
    provenance: 'GOOGLE_DERIVED',
    transformation: 'Whitespace normalization, line break flattening, and token component decomposition',
    observedAt
  };
}

// ==========================================
// 5. Phone Normalizer
// ==========================================

export function normalizePhoneField(
  rawPhone?: string,
  observedAt: string = new Date().toISOString()
): GoogleDerivedField<string> | undefined {
  if (rawPhone == null || rawPhone.trim().length === 0) {
    return undefined;
  }

  const cleaned = cleanText(rawPhone);
  if (!cleaned) {
    return {
      fieldName: 'phone',
      value: undefined,
      originalRawValue: rawPhone,
      state: 'ABSENT',
      qualityReason: 'NO_PHONE',
      provenance: 'GOOGLE_DERIVED',
      observedAt
    };
  }

  // Reject obvious script or non-phone payloads
  if (/[<>{}[\];=]/.test(cleaned) || cleaned.toLowerCase().includes('javascript')) {
    return {
      fieldName: 'phone',
      value: undefined,
      originalRawValue: rawPhone,
      state: 'INVALID',
      qualityReason: 'PHONE_MALFORMED',
      provenance: 'GOOGLE_DERIVED',
      transformation: 'Rejected due to adversarial or unparseable characters',
      observedAt
    };
  }

  // Preserve leading + for international format
  const hasPlus = cleaned.startsWith('+');
  // Strip formatting symbols except digits
  const digitsOnly = cleaned.replace(/\D/g, '');

  // Must have reasonable phone length (6 to 15 digits according to E.164)
  if (digitsOnly.length < 6 || digitsOnly.length > 15) {
    return {
      fieldName: 'phone',
      value: undefined,
      originalRawValue: rawPhone,
      state: 'INVALID',
      qualityReason: 'PHONE_MALFORMED',
      provenance: 'GOOGLE_DERIVED',
      transformation: 'Digit count out of valid E.164 bounds (6-15 digits)',
      observedAt
    };
  }

  const normalizedPhone = hasPlus ? `+${digitsOnly}` : digitsOnly;
  const isAmbiguous = !hasPlus; // Missing explicit country code

  return {
    fieldName: 'phone',
    value: normalizedPhone,
    originalRawValue: rawPhone,
    state: isAmbiguous ? 'PARTIAL' : 'PRESENT',
    qualityReason: isAmbiguous ? 'PHONE_AMBIGUOUS' : undefined,
    provenance: 'GOOGLE_DERIVED',
    transformation: hasPlus
      ? 'E.164 canonicalization with preserved country dial code'
      : 'Punctuation stripped; country code unverified (no country guessed)',
    observedAt
  };
}

// ==========================================
// 6. Website URL Normalizer
// ==========================================

export function normalizeWebsiteUrlField(
  rawUrl?: string,
  observedAt: string = new Date().toISOString()
): GoogleDerivedField<string> | undefined {
  if (rawUrl == null || rawUrl.trim().length === 0) {
    return undefined;
  }

  const cleaned = cleanText(rawUrl);
  if (!cleaned) {
    return {
      fieldName: 'websiteUrl',
      value: undefined,
      originalRawValue: rawUrl,
      state: 'ABSENT',
      qualityReason: 'NO_WEBSITE',
      provenance: 'GOOGLE_DERIVED',
      observedAt
    };
  }

  // Check for unsafe protocols
  const lower = cleaned.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.startsWith('chrome:')
  ) {
    return {
      fieldName: 'websiteUrl',
      value: undefined,
      originalRawValue: rawUrl,
      state: 'INVALID',
      qualityReason: 'WEBSITE_UNSAFE_PROTOCOL',
      provenance: 'GOOGLE_DERIVED',
      transformation: 'Rejected unsafe protocol',
      observedAt
    };
  }

  // Handle Google redirect wrappers like https://www.google.com/url?q=https://example.com
  let targetUrl = cleaned;
  try {
    const parsed = new URL(targetUrl);
    if (parsed.hostname.includes('google.com') && parsed.pathname === '/url' && parsed.searchParams.has('q')) {
      const unwrapped = parsed.searchParams.get('q');
      if (unwrapped) targetUrl = unwrapped;
    }
  } catch {
    // If not a full URL yet, we try prepending https:// below
  }

  // Ensure scheme
  let urlObj: URL;
  try {
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }
    urlObj = new URL(targetUrl);
  } catch {
    return {
      fieldName: 'websiteUrl',
      value: undefined,
      originalRawValue: rawUrl,
      state: 'INVALID',
      qualityReason: 'WEBSITE_MALFORMED',
      provenance: 'GOOGLE_DERIVED',
      transformation: 'Malformed URL structure',
      observedAt
    };
  }

  // Remove common tracking params (gclid, fbclid, utm_*)
  const cleanParams = new URLSearchParams();
  for (const [key, val] of urlObj.searchParams.entries()) {
    const lk = key.toLowerCase();
    if (!lk.startsWith('utm_') && lk !== 'gclid' && lk !== 'fbclid' && lk !== 'gbraid' && lk !== 'wbraid') {
      cleanParams.set(key, val);
    }
  }
  urlObj.search = cleanParams.toString();

  // Normalize trailing slash: root domain has '/', subpaths without trailing slash unless index
  let normalizedHref = urlObj.href;
  if (urlObj.pathname === '/') {
    normalizedHref = `${urlObj.protocol}//${urlObj.host}/`;
  } else if (normalizedHref.endsWith('/')) {
    normalizedHref = normalizedHref.slice(0, -1);
  }

  return {
    fieldName: 'websiteUrl',
    value: normalizedHref,
    originalRawValue: rawUrl,
    state: 'PRESENT',
    provenance: 'GOOGLE_DERIVED',
    transformation: 'Scheme standardization, tracking param stripping, trailing slash normalization',
    observedAt
  };
}

// ==========================================
// 7. Coordinates Normalizer
// ==========================================

export function normalizeCoordinatesField(
  rawLat?: number | string,
  rawLng?: number | string,
  observedAt: string = new Date().toISOString()
): GoogleDerivedField<{ latitude: number; longitude: number }> | undefined {
  if (rawLat == null || rawLng == null) {
    return undefined;
  }

  const latNum = typeof rawLat === 'number' ? rawLat : parseFloat(String(rawLat));
  const lngNum = typeof rawLng === 'number' ? rawLng : parseFloat(String(rawLng));

  if (isNaN(latNum) || isNaN(lngNum)) {
    return {
      fieldName: 'coordinates',
      value: undefined,
      originalRawValue: `${rawLat},${rawLng}`,
      state: 'INVALID',
      qualityReason: 'COORDINATES_MALFORMED',
      provenance: 'GOOGLE_DERIVED',
      observedAt
    };
  }

  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return {
      fieldName: 'coordinates',
      value: undefined,
      originalRawValue: `${rawLat},${rawLng}`,
      state: 'INVALID',
      qualityReason: 'COORDINATES_OUT_OF_BOUNDS',
      provenance: 'GOOGLE_DERIVED',
      transformation: 'Coordinates outside valid Earth boundaries (-90..90, -180..180)',
      observedAt
    };
  }

  // rounded to 6 decimal places
  const latitude = Math.round(latNum * 1e6) / 1e6;
  const longitude = Math.round(lngNum * 1e6) / 1e6;

  return {
    fieldName: 'coordinates',
    value: { latitude, longitude },
    originalRawValue: `${rawLat},${rawLng}`,
    state: 'PRESENT',
    provenance: 'GOOGLE_DERIVED',
    transformation: 'Rounded to 6 decimal places',
    observedAt
  };
}

// ==========================================
// 8. Rating & Review Count Normalizer
// ==========================================

export function normalizeRatingField(
  rawRating?: string | number,
  observedAt: string = new Date().toISOString()
): GoogleDerivedField<number> | undefined {
  if (rawRating == null) return undefined;

  const str = String(rawRating).trim();
  const num = parseFloat(str);

  if (isNaN(num) || num < 1.0 || num > 5.0) {
    return {
      fieldName: 'rating',
      value: undefined,
      originalRawValue: String(rawRating),
      state: 'INVALID',
      qualityReason: 'RATING_MALFORMED',
      provenance: 'GOOGLE_DERIVED',
      observedAt
    };
  }

  const rounded = Math.round(num * 10) / 10;
  return {
    fieldName: 'rating',
    value: rounded,
    originalRawValue: String(rawRating),
    state: 'PRESENT',
    provenance: 'GOOGLE_DERIVED',
    transformation: 'Parsed float bounded to 1.0-5.0 with 1 decimal precision',
    observedAt
  };
}

export function normalizeReviewCountField(
  rawReviews?: string | number,
  observedAt: string = new Date().toISOString()
): GoogleDerivedField<number> | undefined {
  if (rawReviews == null) return undefined;

  const str = String(rawReviews).replace(/,/g, '').trim();
  const num = parseInt(str, 10);

  if (isNaN(num) || num < 0) {
    return {
      fieldName: 'reviewCount',
      value: undefined,
      originalRawValue: String(rawReviews),
      state: 'INVALID',
      qualityReason: 'REVIEW_COUNT_MALFORMED',
      provenance: 'GOOGLE_DERIVED',
      observedAt
    };
  }

  return {
    fieldName: 'reviewCount',
    value: num,
    originalRawValue: String(rawReviews),
    state: 'PRESENT',
    provenance: 'GOOGLE_DERIVED',
    transformation: 'Parsed non-negative integer with comma stripping',
    observedAt
  };
}

// ==========================================
// 9. Business Status Normalizer
// ==========================================

export function normalizeBusinessStatusField(
  rawStatus?: string,
  observedAt: string = new Date().toISOString()
): GoogleDerivedField<'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED' | 'UNKNOWN'> | undefined {
  if (!rawStatus) return undefined;

  const s = rawStatus.toLowerCase();
  let status: 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED' | 'UNKNOWN' = 'UNKNOWN';

  if (s.includes('temporarily closed') || s.includes('temp closed')) {
    status = 'TEMPORARILY_CLOSED';
  } else if (s.includes('permanently closed') || s.includes('closed') || s.includes('ferm\u00E9') || s.includes('geschlossen')) {
    status = 'CLOSED';
  } else if (s.includes('open') || s.includes('ouvert') || s.includes('ge\u00F6ffnet')) {
    status = 'OPEN';
  }

  return {
    fieldName: 'businessStatus',
    value: status,
    originalRawValue: rawStatus,
    state: 'PRESENT',
    provenance: 'GOOGLE_DERIVED',
    transformation: 'Standardized operational status enumeration',
    observedAt
  };
}

// ==========================================
// 10. Opening Hours Normalizer
// ==========================================

export function normalizeOpeningHoursField(
  rawHours?: string[],
  observedAt: string = new Date().toISOString()
): GoogleDerivedField<GoogleOpeningHoursStructured> | undefined {
  if (!Array.isArray(rawHours) || rawHours.length === 0) return undefined;

  const cleanedEntries = rawHours
    .map(h => cleanText(h))
    .filter((h): h is string => h != null);

  if (cleanedEntries.length === 0) return undefined;

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const periods: GoogleOpeningHoursStructured['periods'] = [];

  for (const entry of cleanedEntries) {
    const lower = entry.toLowerCase();
    let dayIndex = -1;
    let matchedDayName = '';

    for (let i = 0; i < dayNames.length; i++) {
      if (lower.startsWith(dayNames[i])) {
        dayIndex = i;
        matchedDayName = dayNames[i];
        break;
      }
    }

    if (dayIndex >= 0) {
      const rest = entry.slice(matchedDayName.length).replace(/^[:\s\t]+/, '').trim();
      const isOpen24 = rest.toLowerCase().includes('open 24 hours') || rest.toLowerCase().includes('24 hours');
      const isClosed = rest.toLowerCase().includes('closed');

      periods.push({
        day: dayIndex,
        dayName: matchedDayName.charAt(0).toUpperCase() + matchedDayName.slice(1),
        hours: rest,
        isOpen24Hours: isOpen24,
        isClosed
      });
    }
  }

  return {
    fieldName: 'openingHours',
    value: {
      rawEntries: cleanedEntries,
      periods: periods.length > 0 ? periods : undefined
    },
    originalRawValue: JSON.stringify(rawHours),
    state: 'PRESENT',
    provenance: 'GOOGLE_DERIVED',
    transformation: 'Structured period extraction with day mapping',
    observedAt
  };
}

// ==========================================
// 11. Complete Candidate Record Normalization
// ==========================================

/**
 * Normalizes raw Google Maps observed fields into a typed, verified,
 * coverage-aware GoogleMapsNormalizedRecord.
 */
export function normalizeGoogleMapsRecord(
  raw: GoogleMapsObservedFields,
  options: {
    acquisitionId: string;
    sessionId: string;
    searchQuery?: string;
    searchLocation?: string;
    searchUnitId?: string;
    observedAt?: string;
  }
): GoogleMapsNormalizedRecord {
  const observedAt = options.observedAt ?? raw.observedAt ?? new Date().toISOString();

  // 1. Identity
  const businessName = normalizeBusinessNameField(raw.businessName, observedAt);
  const categories = normalizeCategories(
    raw.primaryCategory ?? raw.category,
    raw.secondaryCategories,
    observedAt
  );
  const businessStatus = normalizeBusinessStatusField(raw.businessStatus, observedAt);

  // 2. Address
  const address = normalizeAddressField(
    raw.fullAddress ?? raw.address,
    {
      street: raw.street,
      city: raw.city ?? raw.locality,
      region: raw.region,
      postalCode: raw.postalCode,
      country: raw.country
    },
    observedAt
  );

  // 3. Contact
  const phone = normalizePhoneField(raw.phone, observedAt);
  const websiteUrl = normalizeWebsiteUrlField(raw.websiteUrl, observedAt);

  // 4. Coordinates
  const coordinates = normalizeCoordinatesField(raw.latitude, raw.longitude, observedAt);

  // 5. Business Signals
  const rating = normalizeRatingField(raw.rating, observedAt);
  const reviewCount = normalizeReviewCountField(raw.reviewCount, observedAt);
  const priceLevel = raw.priceLevel ? {
    fieldName: 'priceLevel',
    value: raw.priceLevel,
    originalRawValue: raw.priceLevel,
    state: 'PRESENT' as FieldQualityState,
    provenance: 'GOOGLE_DERIVED' as const,
    transformation: 'Price level symbol preservation',
    observedAt
  } : undefined;

  const openingHours = normalizeOpeningHoursField(raw.openingHours, observedAt);
  const description = raw.description ? {
    fieldName: 'description',
    value: cleanText(raw.description),
    originalRawValue: raw.description,
    state: 'PRESENT' as FieldQualityState,
    provenance: 'GOOGLE_DERIVED' as const,
    transformation: 'Whitespace collapsed and trimmed',
    observedAt
  } : undefined;

  // Attributes
  let attributes: GoogleDerivedField<GoogleBusinessAttributes> | undefined;
  const serviceOptions = (raw.serviceOptions ?? raw.serviceAttributes ?? []).map(s => cleanText(s)).filter((s): s is string => !!s);
  const accessibilityOptions = (raw.accessibilityOptions ?? []).map(s => cleanText(s)).filter((s): s is string => !!s);
  const amenities = (raw.amenities ?? []).map(s => cleanText(s)).filter((s): s is string => !!s);

  if (serviceOptions.length > 0 || accessibilityOptions.length > 0 || amenities.length > 0) {
    attributes = {
      fieldName: 'attributes',
      value: {
        serviceOptions: Array.from(new Set(serviceOptions)),
        accessibilityOptions: Array.from(new Set(accessibilityOptions)),
        amenities: Array.from(new Set(amenities)),
        otherAttributes: {}
      },
      originalRawValue: JSON.stringify({ serviceOptions, accessibilityOptions, amenities }),
      state: 'PRESENT',
      provenance: 'GOOGLE_DERIVED',
      transformation: 'Category deduplication and whitespace normalization',
      observedAt
    };
  }

  // 6. Source Context
  const sourceRecordId = raw.sourceRecordId ?? raw.placeId;
  const sourceContext: GoogleSourceContext = {
    mapsUrl: raw.mapsUrl ?? 'https://www.google.com/maps',
    ...(raw.listingUrl ? { listingUrl: raw.listingUrl } : {}),
    ...(sourceRecordId ? { sourceRecordId } : {}),
    ...(options.searchQuery ?? raw.searchQuery ? { searchQuery: options.searchQuery ?? raw.searchQuery } : {}),
    ...(options.searchLocation ?? raw.searchLocation ? { searchLocation: options.searchLocation ?? raw.searchLocation } : {}),
    ...(options.searchUnitId ?? raw.searchUnitId ? { searchUnitId: options.searchUnitId ?? raw.searchUnitId } : {}),
    observedAt
  };

  // 7. Dedup Signature
  let dedupSignature: string;
  if (sourceRecordId) {
    dedupSignature = `gplace:${sourceRecordId}`;
  } else if (raw.listingUrl) {
    const cleanUrl = raw.listingUrl.split('?')[0];
    dedupSignature = `url:${cleanUrl.toLowerCase()}`;
  } else {
    const namePart = (businessName.value ?? '').toLowerCase();
    const addrPart = (address?.value?.fullAddress ?? '').toLowerCase();
    dedupSignature = `fingerprint:${namePart}|${addrPart}`;
  }

  // 8. Acquisition Quality Signals
  const qualitySignals = calculateAcquisitionQuality({
    hasName: !!businessName.value,
    hasCategory: !!categories.primaryCategory?.value,
    hasStatus: !!businessStatus?.value && businessStatus.value !== 'UNKNOWN',
    hasPhone: !!phone?.value,
    hasWebsite: !!websiteUrl?.value,
    hasAddress: !!address?.value?.fullAddress,
    hasCity: !!address?.value?.city,
    hasCoordinates: !!coordinates?.value,
    hasHours: !!openingHours?.value,
    hasRating: !!rating?.value,
    hasReviewCount: !!reviewCount?.value,
    hasSourceRecordId: !!sourceRecordId,
    hasListingUrl: !!raw.listingUrl
  });

  return {
    acquisitionId: options.acquisitionId,
    sessionId: options.sessionId,
    businessName,
    ...(categories.primaryCategory ? { primaryCategory: categories.primaryCategory } : {}),
    ...(categories.secondaryCategories ? { secondaryCategories: categories.secondaryCategories } : {}),
    ...(businessStatus ? { businessStatus } : {}),
    ...(address ? { address } : {}),
    ...(phone ? { phone } : {}),
    ...(websiteUrl ? { websiteUrl } : {}),
    ...(coordinates ? { coordinates } : {}),
    ...(rating ? { rating } : {}),
    ...(reviewCount ? { reviewCount } : {}),
    ...(priceLevel ? { priceLevel } : {}),
    ...(openingHours ? { openingHours } : {}),
    ...(description ? { description } : {}),
    ...(attributes ? { attributes } : {}),
    sourceContext,
    qualitySignals,
    dedupSignature,
    provenance: 'GOOGLE_DERIVED',
    restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
    policyStatus: 'POLICY_GATED',
    persistenceStatus: 'NOT_PERSISTABLE',
    exportStatus: 'NOT_EXPORTABLE'
  };
}
