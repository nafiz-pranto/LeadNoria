/**
 * LeadNoria — Phase 20: Google Maps Field Extraction + Coverage Engine
 * Google Maps Field Model & Quality Contracts
 *
 * Invariants:
 * - Pure Google-derived field representation.
 * - Every field maintains GOOGLE_DERIVED provenance and explicit normalization lineage.
 * - Field quality states distinguish absence from extraction/parsing failures.
 * - Quality signals measure acquisition completeness only (never lead qualification).
 * - NOT_PERSISTABLE and NOT_EXPORTABLE strictly enforced.
 * - No Google API, Places API, private endpoints, or anti-bot/stealth mechanisms.
 */

// ==========================================
// 1. Field Quality States & Specific Reasons
// ==========================================

export type FieldQualityState =
  | 'PRESENT'      // Field observed and validly extracted/normalized
  | 'ABSENT'       // Field did not exist on the rendered page
  | 'INVALID'      // Field existed but was malformed or failed validation
  | 'PARTIAL'      // Field was partially extracted (e.g. partial address, ambiguous phone)
  | 'UNAVAILABLE'; // Detail panel not opened or extraction timed out

export type FieldQualityReason =
  // Website
  | 'NO_WEBSITE'
  | 'WEBSITE_EXTRACTION_FAILED'
  | 'WEBSITE_UNSAFE_PROTOCOL'
  | 'WEBSITE_MALFORMED'
  // Phone
  | 'NO_PHONE'
  | 'PHONE_MALFORMED'
  | 'PHONE_AMBIGUOUS'
  | 'PHONE_EXTRACTION_FAILED'
  // Address & Location
  | 'NO_ADDRESS'
  | 'ADDRESS_INCOMPLETE'
  | 'ADDRESS_EXTRACTION_FAILED'
  | 'NO_COORDINATES'
  | 'COORDINATES_OUT_OF_BOUNDS'
  | 'COORDINATES_MALFORMED'
  // Rating & Reviews
  | 'NO_RATING'
  | 'RATING_MALFORMED'
  | 'NO_REVIEW_COUNT'
  | 'REVIEW_COUNT_MALFORMED'
  // Hours
  | 'NO_HOURS'
  | 'HOURS_MALFORMED'
  // Attributes
  | 'NO_ATTRIBUTES'
  | 'ATTRIBUTES_UNAVAILABLE'
  // General
  | 'FIELD_NOT_OBSERVED'
  | 'DETAIL_PANEL_NOT_REQUESTED';

// ==========================================
// 2. Field-Level Provenance & Lineage Envelope
// ==========================================

export interface GoogleDerivedField<T> {
  readonly fieldName: string;
  readonly value: T | undefined;
  readonly originalRawValue?: string;
  readonly state: FieldQualityState;
  readonly qualityReason?: FieldQualityReason;
  readonly provenance: 'GOOGLE_DERIVED';
  readonly transformation?: string;
  readonly observedAt: string;
}

// ==========================================
// 3. Structured Field Sub-types
// ==========================================

export interface GoogleAddressComponents {
  readonly fullAddress: string;
  readonly street?: string;
  readonly city?: string;
  readonly region?: string;
  readonly postalCode?: string;
  readonly country?: string;
  readonly countryCode?: string;
}

export interface GoogleOpeningHoursStructured {
  readonly rawEntries: string[];
  readonly periods?: Array<{
    day: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    dayName: string;
    hours: string;
    isOpen24Hours?: boolean;
    isClosed?: boolean;
  }>;
}

export interface GoogleBusinessAttributes {
  readonly serviceOptions: string[];
  readonly accessibilityOptions: string[];
  readonly amenities: string[];
  readonly otherAttributes: Record<string, string[]>;
}

export interface GoogleSourceContext {
  readonly mapsUrl: string;
  readonly listingUrl?: string;
  readonly sourceRecordId?: string;
  readonly searchQuery?: string;
  readonly searchLocation?: string;
  readonly searchUnitId?: string;
  readonly observedAt: string;
}

// ==========================================
// 4. Acquisition Quality Signals
// ==========================================

/**
 * Acquisition-level quality signals.
 * Measures technical completeness of the extracted business record.
 * NOT a lead qualification score; NOT user-facing lead evaluation.
 */
export interface AcquisitionQualitySignals {
  /** Overall ratio of observed vs total potential fields (0.0 - 1.0) */
  readonly fieldCompletenessRatio: number;
  /** Completeness of identity fields: name, categories, status (0.0 - 1.0) */
  readonly identityCompleteness: number;
  /** Completeness of contact channels: phone, website (0.0 - 1.0) */
  readonly contactCompleteness: number;
  /** Completeness of physical coordinates and address (0.0 - 1.0) */
  readonly locationCompleteness: number;
  /** Source integrity rating based on place ID / URL / coordinate consistency */
  readonly sourceIntegrity: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ==========================================
// 5. Complete Google Maps Normalized Business Record
// ==========================================

export interface GoogleMapsNormalizedRecord {
  /** Stable acquisition identifier */
  readonly acquisitionId: string;
  /** Session identifier */
  readonly sessionId: string;

  // Identity
  readonly businessName: GoogleDerivedField<string>;
  readonly primaryCategory?: GoogleDerivedField<string>;
  readonly secondaryCategories?: GoogleDerivedField<string[]>;
  readonly businessStatus?: GoogleDerivedField<'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED' | 'UNKNOWN'>;

  // Address
  readonly address?: GoogleDerivedField<GoogleAddressComponents>;

  // Contact
  readonly phone?: GoogleDerivedField<string>;
  readonly websiteUrl?: GoogleDerivedField<string>;

  // Location
  readonly coordinates?: GoogleDerivedField<{ latitude: number; longitude: number }>;

  // Business Signals
  readonly rating?: GoogleDerivedField<number>;
  readonly reviewCount?: GoogleDerivedField<number>;
  readonly priceLevel?: GoogleDerivedField<string>;
  readonly openingHours?: GoogleDerivedField<GoogleOpeningHoursStructured>;
  readonly description?: GoogleDerivedField<string>;
  readonly attributes?: GoogleDerivedField<GoogleBusinessAttributes>;

  // Source Context
  readonly sourceContext: GoogleSourceContext;

  // Acquisition Quality
  readonly qualitySignals: AcquisitionQualitySignals;

  // Dedup Signature
  readonly dedupSignature: string;

  // Data Firewall Mandates
  readonly provenance: 'GOOGLE_DERIVED';
  readonly restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED';
  readonly policyStatus: 'POLICY_GATED';
  readonly persistenceStatus: 'NOT_PERSISTABLE';
  readonly exportStatus: 'NOT_EXPORTABLE';
}

// ==========================================
// 6. Quality Signal Calculator
// ==========================================

export function calculateAcquisitionQuality(fields: {
  hasName: boolean;
  hasCategory: boolean;
  hasStatus: boolean;
  hasPhone: boolean;
  hasWebsite: boolean;
  hasAddress: boolean;
  hasCity: boolean;
  hasCoordinates: boolean;
  hasHours: boolean;
  hasRating: boolean;
  hasReviewCount: boolean;
  hasSourceRecordId: boolean;
  hasListingUrl: boolean;
}): AcquisitionQualitySignals {
  // Identity: name (0.5), category (0.3), status (0.2)
  let identityScore = 0;
  if (fields.hasName) identityScore += 0.5;
  if (fields.hasCategory) identityScore += 0.3;
  if (fields.hasStatus) identityScore += 0.2;

  // Contact: website (0.5), phone (0.5)
  let contactScore = 0;
  if (fields.hasWebsite) contactScore += 0.5;
  if (fields.hasPhone) contactScore += 0.5;

  // Location: address (0.4), city (0.3), coordinates (0.3)
  let locationScore = 0;
  if (fields.hasAddress) locationScore += 0.4;
  if (fields.hasCity) locationScore += 0.3;
  if (fields.hasCoordinates) locationScore += 0.3;

  // Overall Completeness
  const totalWeight = 11;
  let earned = 0;
  if (fields.hasName) earned += 1;
  if (fields.hasCategory) earned += 1;
  if (fields.hasStatus) earned += 1;
  if (fields.hasPhone) earned += 1;
  if (fields.hasWebsite) earned += 1;
  if (fields.hasAddress) earned += 1;
  if (fields.hasCoordinates) earned += 1;
  if (fields.hasHours) earned += 1;
  if (fields.hasRating) earned += 1;
  if (fields.hasReviewCount) earned += 1;
  if (fields.hasSourceRecordId || fields.hasListingUrl) earned += 1;

  const completenessRatio = Math.round((earned / totalWeight) * 100) / 100;

  // Source Integrity
  let sourceIntegrity: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (fields.hasSourceRecordId && (fields.hasCoordinates || fields.hasAddress)) {
    sourceIntegrity = 'HIGH';
  } else if (fields.hasListingUrl || fields.hasCoordinates) {
    sourceIntegrity = 'MEDIUM';
  }

  return {
    fieldCompletenessRatio: completenessRatio,
    identityCompleteness: Math.round(identityScore * 100) / 100,
    contactCompleteness: Math.round(contactScore * 100) / 100,
    locationCompleteness: Math.round(locationScore * 100) / 100,
    sourceIntegrity
  };
}
