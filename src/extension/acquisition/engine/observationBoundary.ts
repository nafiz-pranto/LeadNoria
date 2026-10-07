/**
 * LeadNoria — Google Maps DOM Observation Boundary
 * Raw Observation Envelope Construction, Field Availability, & Provenance Tracking
 *
 * Invariants:
 * - Operates strictly on browser-rendered visible DOM in content script context.
 * - Produces structured GoogleMapsCandidateObservation envelopes, NOT canonical leads.
 * - Distinguishes field availability: PRESENT, ABSENT, UNKNOWN, UNSUPPORTED, AMBIGUOUS.
 * - Never fabricates missing fields; never null-pads absent data into fake defaults.
 * - Enforces GOOGLE_DERIVED / NOT_PERSISTABLE / NOT_EXPORTABLE provenance metadata.
 * - Deterministic, content-addressed observation IDs.
 */

import type {
  GoogleMapsCandidateObservation,
  GoogleMapsPageObservation,
  GoogleMapsPageKind,
  ObservedField,
  FieldAvailability,
  GoogleMapsAcquisitionDiagnostic,
  ObservationCompleteness
} from './types.ts';
import { hashStringDeterministic } from './searchUnit.ts';

export const ENGINE_ADAPTER_VERSION = '2.0.0-foundation';

/**
 * Clean and truncate raw text safely.
 */
function cleanDomText(text: string | number | null | undefined): string | undefined {
  if (text === null || text === undefined) return undefined;
  const str = typeof text === 'string' ? text : String(text);
  const s = str
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return s.length > 0 ? s.slice(0, 500) : undefined;
}

/**
 * Sanitize URLs from DOM attributes.
 */
function cleanDomUrl(raw: string | null | undefined): string | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  const s = raw.trim();
  if (s.toLowerCase().startsWith('javascript:') || s.toLowerCase().startsWith('data:')) {
    return undefined;
  }
  try {
    const parsed = new URL(s);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // If relative google maps path, accept it
    if (s.startsWith('/maps/place/') || s.startsWith('https://www.google.com/maps/place/')) {
      return s;
    }
  }
  return undefined;
}

/**
 * Build an ObservedField with explicit availability classification.
 */
export function buildObservedField<T>(
  rawValue: string | undefined,
  parsedValue: T | undefined,
  availability: FieldAvailability,
  confidence: number,
  sourceSignal?: string,
  diagnosticReason?: string
): ObservedField<T> {
  return {
    availability,
    rawValue,
    parsedValue,
    confidence,
    sourceSignal,
    diagnosticReason
  };
}

/**
 * Parses rating string to number, categorizing availability explicitly.
 * Semantics (Correction 1):
 * - PRESENT: A valid rating was directly observed and parsed (1.0 - 5.0).
 * - ABSENT: The supported observation surface provides explicit evidence that the business has no rating.
 *   (e.g., "No reviews", "Unrated", "No rating", "Not rated", "No reviews yet").
 * - UNKNOWN: Rating cannot be established from the current observation surface.
 *   Do NOT infer ABSENT merely from missing rating element, missing rating text, card layout variation,
 *   or virtualized partial rendering!
 * - AMBIGUOUS: Conflicting, malformed, or unreliable rating evidence exists (e.g. price, out of bounds).
 * - UNSUPPORTED: The current observation method cannot support rating observation (e.g. external surface).
 */
export function evaluateRatingField(
  rawRating?: string,
  surfaceType: 'CARD' | 'DETAIL' | 'EXTERNAL' = 'CARD'
): ObservedField<number> {
  if (rawRating === undefined) {
    if (surfaceType === 'EXTERNAL') {
      return buildObservedField(undefined, undefined, 'UNSUPPORTED', 0.8, undefined, 'Rating not available on external surface');
    }
    // Missing rating element on card or detail surface does NOT prove the business has no rating.
    return buildObservedField(undefined, undefined, 'UNKNOWN', 0.85, undefined, 'Rating element not visible or omitted on observation surface (presence unknown)');
  }

  const cleaned = cleanDomText(rawRating);
  if (!cleaned) {
    return buildObservedField(rawRating, undefined, 'UNKNOWN', 0.5, undefined, 'Rating element present but empty text');
  }

  // Explicit evidence that the business has no rating -> ABSENT
  if (/(no reviews|unrated|no rating|not rated|no reviews yet)/i.test(cleaned)) {
    return buildObservedField(cleaned, undefined, 'ABSENT', 0.95, 'rating-badge', 'Explicit evidence indicates business has no rating');
  }

  // Reject price or currency symbols masquerading as ratings -> AMBIGUOUS
  if (/[$€£৳¥]/.test(cleaned)) {
    return buildObservedField(rawRating, undefined, 'AMBIGUOUS', 0.3, undefined, 'Contains price currency tokens rather than rating');
  }

  // Parse rating e.g. "4.5", "4,5", "4.5 stars", "Rated 4.0 out of 5", "5"
  const match = cleaned.match(/(\d+[.,]\d+|\b[1-5]\b)/);
  if (!match) {
    return buildObservedField(rawRating, undefined, 'AMBIGUOUS', 0.4, undefined, `Unparseable rating text: "${cleaned}"`);
  }

  const val = parseFloat(match[1].replace(',', '.'));
  if (isNaN(val) || val < 1.0 || val > 5.0) {
    return buildObservedField(rawRating, undefined, 'AMBIGUOUS', 0.3, undefined, `Rating value out of valid 1-5 range: ${val}`);
  }

  return buildObservedField(cleaned, Math.round(val * 10) / 10, 'PRESENT', 0.95, 'rating-badge');
}

/**
 * Parses review count string to integer with evidence discipline (Correction 2).
 * Semantics:
 * - PRESENT: Count directly observed and parsed (e.g., 123, 1,234, 12K).
 * - ABSENT: Explicit evidence establishes zero/no reviews (e.g., "0 reviews", "0", "No reviews", "No reviews yet").
 * - UNKNOWN: Count not visible or not determinable. Do NOT infer zero reviews merely because count is not shown.
 * - AMBIGUOUS: Conflicting or invalid evidence (e.g., distance, currency, unparseable non-count text).
 * - UNSUPPORTED: The current observation method cannot support review count observation.
 */
export function evaluateReviewCountField(
  rawReviews?: string,
  surfaceType: 'CARD' | 'DETAIL' | 'EXTERNAL' = 'CARD'
): ObservedField<number> {
  if (rawReviews === undefined) {
    if (surfaceType === 'EXTERNAL') {
      return buildObservedField(undefined, undefined, 'UNSUPPORTED', 0.8, undefined, 'Review count not available on external surface');
    }
    return buildObservedField(undefined, undefined, 'UNKNOWN', 0.85, undefined, 'Review count not visible on observation surface (presence unknown)');
  }

  const cleaned = cleanDomText(rawReviews);
  if (!cleaned) {
    return buildObservedField(rawReviews, undefined, 'UNKNOWN', 0.5, undefined, 'Review count element empty');
  }

  // Explicit evidence of zero / no reviews -> ABSENT
  if (/(no reviews|\b0 reviews\b|\b0\b|no reviews yet|zero reviews)/i.test(cleaned)) {
    return buildObservedField(cleaned, 0, 'ABSENT', 0.95, 'review-count-badge', 'Explicit evidence indicates zero/no reviews');
  }

  // Reject distance indicators e.g. "1.5 km", "500 m", "2 mi"
  if (/\b(km|mi|m|meters|miles)\b/i.test(cleaned)) {
    return buildObservedField(rawReviews, undefined, 'AMBIGUOUS', 0.3, undefined, 'Contains distance unit rather than review count');
  }

  // Reject currency/price strings
  if (/[$€£৳¥]/.test(cleaned)) {
    return buildObservedField(rawReviews, undefined, 'AMBIGUOUS', 0.3, undefined, 'Contains currency symbol rather than review count');
  }

  // Check for K notation e.g. "1.2K", "12K", "(1.2K reviews)"
  const kMatch = cleaned.match(/([\d]+[.,]\d+|\d+)\s*[kK]/);
  if (kMatch) {
    const base = parseFloat(kMatch[1].replace(',', '.'));
    if (!isNaN(base)) {
      const count = Math.round(base * 1000);
      return buildObservedField(cleaned, count, 'PRESENT', 0.95, 'review-count-badge');
    }
  }

  // Strip parentheses and commas e.g. "(1,234)" or "1,234 reviews" -> 1234
  const digitsMatch = cleaned.replace(/[(),]/g, '').match(/\b\d+\b/);
  if (!digitsMatch) {
    return buildObservedField(rawReviews, undefined, 'AMBIGUOUS', 0.4, undefined, `Unparseable review count text: "${cleaned}"`);
  }

  const count = parseInt(digitsMatch[0], 10);
  if (count === 0) {
    return buildObservedField(cleaned, 0, 'ABSENT', 0.95, 'review-count-badge', 'Explicit zero reviews observed');
  }

  return buildObservedField(cleaned, count, 'PRESENT', 0.95, 'review-count-badge');
}

/**
 * Evaluates website URL field with strict availability categorization.
 * CRITICAL RULE: On a result card surface, if a website link is omitted,
 * it MUST be classified as UNKNOWN (not ABSENT), because cards do not guarantee
 * displaying all fields. Only explicit absence or full detail inspection yields ABSENT.
 */
export function evaluateWebsiteField(
  rawUrl?: string,
  surfaceInspected = true,
  surfaceType?: 'CARD' | 'DETAIL'
): ObservedField<string> {
  if (!surfaceInspected) {
    return buildObservedField(undefined, undefined, 'UNSUPPORTED', 0.9, undefined, 'Surface does not support website inspection');
  }

  if (rawUrl === undefined) {
    if (surfaceType === 'CARD') {
      // Result card omission: presence or absence is UNKNOWN
      return buildObservedField(undefined, undefined, 'UNKNOWN', 0.85, undefined, 'Website not shown on result card surface (presence unknown)');
    }
    return buildObservedField(undefined, undefined, 'ABSENT', 0.95, undefined, 'Inspection completed; no website link present');
  }

  const cleaned = cleanDomUrl(rawUrl);
  if (!cleaned) {
    return buildObservedField(rawUrl, undefined, 'UNKNOWN', 0.5, undefined, 'Website attribute present but invalid URL structure');
  }

  // Filter out internal Google search / maps links masquerading as authority websites
  if (cleaned.includes('google.com/maps') || cleaned.includes('google.com/search')) {
    return buildObservedField(rawUrl, undefined, 'ABSENT', 0.9, undefined, 'Authority website points to internal Google URL');
  }

  return buildObservedField(rawUrl, cleaned, 'PRESENT', 0.95, 'authority-anchor');
}

/**
 * Evaluates standard text fields (business name, category, address, phone, businessStatus, placeId, mapsUrl).
 * Prevents false-negative data (Correction 3): on a rendered CARD surface, missing visual evidence
 * is classified as UNKNOWN (not ABSENT) unless the surface explicitly proves absence.
 * On a fully inspected DETAIL surface where absence is established, omitted fields are classified as ABSENT.
 */
export function evaluateTextField(
  rawText?: string,
  fieldName = 'field',
  surfaceType: 'CARD' | 'DETAIL' | 'EXTERNAL' = 'CARD'
): ObservedField<string> {
  if (rawText === undefined) {
    if (surfaceType === 'EXTERNAL') {
      return buildObservedField(undefined, undefined, 'UNSUPPORTED', 0.8, undefined, `${fieldName} not available on external surface`);
    }
    if (surfaceType === 'CARD') {
      return buildObservedField(undefined, undefined, 'UNKNOWN', 0.85, undefined, `${fieldName} not visible on result card surface (presence unknown)`);
    }
    return buildObservedField(undefined, undefined, 'ABSENT', 0.9, undefined, `No ${fieldName} element detected on inspected detail surface`);
  }

  const cleaned = cleanDomText(rawText);
  if (!cleaned) {
    return buildObservedField(rawText, undefined, 'UNKNOWN', 0.5, undefined, `${fieldName} element present but text empty`);
  }

  return buildObservedField(rawText, cleaned, 'PRESENT', 0.95, `${fieldName}-node`);
}

export interface RawCandidateNodeData {
  businessName?: string;
  category?: string;
  address?: string;
  phone?: string;
  websiteUrl?: string;
  rating?: string;
  reviewCount?: string;
  businessStatus?: string;
  placeId?: string;
  mapsUrl?: string;
  isDetail?: boolean;
  surfaceType?: 'CARD' | 'DETAIL';
}

/**
 * Constructs a fully qualified GoogleMapsCandidateObservation envelope
 * from raw parsed node data with full provenance and field availability.
 */
export function createCandidateObservation(
  raw: RawCandidateNodeData,
  context: {
    sessionId: string;
    searchUnitId: string;
    searchKeyword: string;
    searchLocation?: string;
    pageUrl: string;
    pageKind: GoogleMapsPageKind;
  }
): GoogleMapsCandidateObservation {
  const now = (context as any).observedAt || new Date().toISOString();
  const surfaceType: 'CARD' | 'DETAIL' = raw.surfaceType ?? (raw.isDetail ? 'DETAIL' : 'CARD');

  const nameField = evaluateTextField(raw.businessName, 'businessName', surfaceType);
  const catField = evaluateTextField(raw.category, 'category', surfaceType);
  const addrField = evaluateTextField(raw.address, 'address', surfaceType);
  const phoneField = evaluateTextField(raw.phone, 'phone', surfaceType);
  const webField = evaluateWebsiteField(raw.websiteUrl, true, surfaceType);
  const ratingField = evaluateRatingField(raw.rating, surfaceType);
  const revField = evaluateReviewCountField(raw.reviewCount, surfaceType);
  const statusField = evaluateTextField(raw.businessStatus, 'businessStatus', surfaceType);
  const placeIdField = evaluateTextField(raw.placeId, 'placeId', surfaceType);
  const mapsUrlField = evaluateTextField(raw.mapsUrl, 'mapsUrl', surfaceType);

  // Derive stable observation identity
  const idSeed = `${context.searchUnitId}::${raw.placeId || raw.businessName || 'unknown'}::${raw.address || ''}`;
  const observationId = `gmo_${hashStringDeterministic(idSeed)}`;

  const fieldAvailability: Record<string, FieldAvailability> = {
    businessName: nameField.availability,
    category: catField.availability,
    address: addrField.availability,
    phone: phoneField.availability,
    websiteUrl: webField.availability,
    rating: ratingField.availability,
    reviewCount: revField.availability,
    businessStatus: statusField.availability,
    placeId: placeIdField.availability,
    mapsUrl: mapsUrlField.availability
  };

  const diagnostics: GoogleMapsAcquisitionDiagnostic[] = [];
  if (nameField.availability !== 'PRESENT') {
    diagnostics.push({
      code: 'CANDIDATE_OBSERVATION_FAILED',
      severity: 'P1',
      recoveryClass: 'RECOVERABLE',
      message: 'Candidate observed without valid business name',
      timestamp: now,
      searchUnitId: context.searchUnitId,
      sessionId: context.sessionId
    });
  }

  return {
    observationId,
    searchUnitId: context.searchUnitId,
    sessionId: context.sessionId,
    source: 'GOOGLE_MAPS_BROWSER',
    observedAt: now,
    pageUrl: context.pageUrl,
    pageKind: context.pageKind,
    businessName: nameField,
    category: catField,
    address: addrField,
    phone: phoneField,
    websiteUrl: webField,
    rating: ratingField,
    reviewCount: revField,
    businessStatus: statusField,
    placeId: placeIdField,
    mapsUrl: mapsUrlField,
    searchKeyword: context.searchKeyword,
    searchLocation: context.searchLocation,
    provenance: {
      source: 'GOOGLE_MAPS_BROWSER',
      acquisitionContext: 'BROWSER_RENDERED_DOM',
      isRestricted: true,
      policyStatus: 'POLICY_GATED',
      persistenceStatus: 'NOT_PERSISTABLE',
      exportStatus: 'NOT_EXPORTABLE',
      adapterVersion: ENGINE_ADAPTER_VERSION,
      extractionMethod: 'RENDERED_DOM_OBSERVATION',
      searchUnitId: context.searchUnitId,
      sessionId: context.sessionId,
      observedAt: now,
      pageUrl: context.pageUrl
    },
    fieldAvailability,
    diagnostics
  };
}

/**
 * Wraps candidates into a GoogleMapsPageObservation snapshot.
 */
export function buildPageObservation(
  candidates: GoogleMapsCandidateObservation[],
  context: {
    sessionId: string;
    searchUnitId: string;
    pageUrl: string;
    pageKind: GoogleMapsPageKind;
  },
  diagnostics: GoogleMapsAcquisitionDiagnostic[] = []
): GoogleMapsPageObservation {
  const now = new Date().toISOString();
  const obsSeed = `${context.sessionId}::${context.searchUnitId}::${now}::${candidates.length}`;
  const observationId = `gpo_${hashStringDeterministic(obsSeed)}`;

  let completeness: ObservationCompleteness = 'COMPLETE';
  if (candidates.length === 0) {
    completeness = 'EMPTY';
  } else if (candidates.some(c => c.businessName.availability !== 'PRESENT')) {
    completeness = 'PARTIAL';
  }

  return {
    observationId,
    sessionId: context.sessionId,
    searchUnitId: context.searchUnitId,
    observedAt: now,
    pageUrl: context.pageUrl,
    pageKind: context.pageKind,
    completeness,
    candidates,
    totalCandidatesObserved: candidates.length,
    diagnostics
  };
}
