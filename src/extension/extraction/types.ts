/**
 * LeadNoria Source-Neutral Extraction & Normalization Contracts (Phase 5 Reconciled)
 *
 * Provides source-neutral data contracts, candidate envelopes, provenance definitions,
 * dependency lineage models, policy states, and normalized candidate interfaces.
 */

// ==========================================
// 1. Provenance & Acquisition Contexts
// ==========================================

export type ProvenanceType =
  | 'USER_PROVIDED'       // Explicitly supplied by the user (manual input or CSV)
  | 'META_DERIVED'        // Discovered/observed through the public Meta Ad Library UI.
  | 'GOOGLE_DERIVED'      // Discovered/observed through Google Maps consumer web UI
  | 'GOOGLE_API_DERIVED'  // Obtained via official Google Maps Platform API request
  | 'WEBSITE_DERIVED'     // Extracted directly from target business's public website
  | 'LEADNORIA_DERIVED'   // Computed internally by LeadNoria algorithms (e.g. normalized values, scores)
  | 'MIXED';              // Multi-source entity/field with explicit sub-field lineage

export type AcquisitionContext =
  | 'META_AD_LIBRARY'     // Meta Ad Library platform UI
  | 'GOOGLE_CONSUMER_WEB' // Consumer web UI (google.com/maps)
  | 'GOOGLE_PLATFORM_API' // Official Cloud APIs (Places API)
  | 'USER_INPUT'          // Direct user form / CSV upload
  | 'WEBSITE_DIRECT'      // Direct same-origin crawl of target domain
  | 'LEADNORIA_INTERNAL'; // Algorithmic resolution or scoring

// ==========================================
// 2. Policy Restriction Basis & Lineage Model
// ==========================================

export type PolicyRestrictionBasis =
  | 'NONE'
  | 'GOOGLE_CONSUMER_WEB_RESTRICTED'
  | 'GOOGLE_API_SERVICE_SPECIFIC'
  | 'TARGET_SITE_RULES'
  | 'UNKNOWN_REQUIRES_REVIEW';

export interface SourceContribution {
  source: SourceType;
  provenance: ProvenanceType;
  fieldName: string;
  acquisitionContext: AcquisitionContext;
  restrictionBasis: PolicyRestrictionBasis;
  isRestricted: boolean; // true if restricted by firewall (e.g. GOOGLE_CONSUMER_WEB_RESTRICTED)
  policyStatus?: PolicyStatus;
  persistenceStatus?: PersistenceStatus;
  exportStatus?: ExportStatus;
}

// ==========================================
// 3. Policy, Persistence & Export Statuses
// ==========================================

export type PolicyStatus =
  | 'POLICY_APPROVED'           // Approved under source and product terms
  | 'POLICY_GATED'              // Gated; requires evaluation before processing
  | 'POLICY_REVIEW_REQUIRED'    // Ambiguous/service-specific status requiring review
  | 'TARGET_SITE_RULES_APPLY'   // Target business site terms, robots.txt & access controls apply
  | 'TERMS_REVIEW_REQUIRED'     // Contractual terms require explicit review
  | 'PRODUCT_REJECTED'          // Categorically rejected by LeadNoria product rules
  | 'NOT_APPLICABLE'            // User input or unencumbered internal computation
  | 'UNKNOWN';

export type PersistenceStatus =
  | 'PERSISTABLE'               // Eligible for persistent storage in IndexedDB/Storage
  | 'NOT_PERSISTABLE'           // Strictly forbidden from persistent storage
  | 'PERSISTENCE_GATED'         // Gated by persistence eligibility check
  | 'USER_PROVIDED'             // User-owned data; persistable
  | 'UNKNOWN';

export type ExportStatus =
  | 'EXPORTABLE'                // Eligible for RFC-4180 CSV / JSON export
  | 'NOT_EXPORTABLE'            // Strictly excluded from export
  | 'EXPORT_GATED'              // Gated by export eligibility check
  | 'USER_APPROVED'             // User-authorized export
  | 'UNKNOWN';

// ==========================================
// 4. Source Identification & Capabilities
// ==========================================

export type SourceType =
  | 'META_AD_LIBRARY'
  | 'GOOGLE_MAPS'
  | 'USER_PROVIDED_DOMAIN'
  | 'FUTURE_SOURCE'
  | 'WEBSITE'
  | 'META'
  | 'USER_PROVIDED'
  | 'LEADNORIA';

export type ImplementationStatus =
  | 'IMPLEMENTED'       // Production or operational adapter
  | 'CONTRACT_ONLY'     // Specification & synthetic fixture modeling only
  | 'DISABLED'          // Code present but deactivated
  | 'FUTURE';           // Planned architecture

export type ExtractionCapability =
  | 'CAN_DISCOVER'
  | 'CAN_ACCEPT_DOMAIN'
  | 'CAN_FETCH_DOMAIN'
  | 'CAN_EXTRACT_WEBSITE_FIELDS'
  | 'CAN_EXTRACT_BUSINESS_NAME'
  | 'CAN_EXTRACT_WEBSITE'
  | 'CAN_EXTRACT_PHONE'
  | 'CAN_EXTRACT_ADDRESS'
  | 'CAN_EXTRACT_CATEGORY'
  | 'CAN_EXTRACT_SOURCE_ID'
  | 'CAN_EXTRACT_LOCATION'
  | 'CAN_EXTRACT_SOCIAL'
  | 'CAN_PROVIDE_EXTERNAL_URL'
  | 'CAN_MODEL_NAME'
  | 'CAN_MODEL_WEBSITE'
  | 'CAN_MODEL_PHONE'
  | 'CAN_MODEL_ADDRESS'
  | 'CAN_MODEL_CATEGORY'
  | 'CAN_MODEL_LOCATION';

export interface SourceCapabilityDeclaration {
  readonly sourceType: SourceType;
  readonly implementationStatus: ImplementationStatus;
  readonly supportedCapabilities: readonly ExtractionCapability[];
  readonly unsupportedCapabilities: readonly ExtractionCapability[];
  readonly defaultPolicyStatus: PolicyStatus;
  readonly defaultProvenance: ProvenanceType;
  readonly defaultPersistenceStatus: PersistenceStatus;
  readonly defaultExportStatus: ExportStatus;
}

// ==========================================
// 5. Source Identifier Model
// ==========================================

export type SourceRecordType =
  | 'META_AD_ID'
  | 'META_PAGE_ID'
  | 'GOOGLE_API_PLACE_ID'
  | 'GOOGLE_WEB_PLACE_ID'
  | 'USER_DOMAIN_HASH'
  | 'GENERIC_SOURCE_ID';

export interface SourceIdentifier {
  sourceType: SourceType;
  sourceRecordId: string;
  sourceRecordType: SourceRecordType;
  sourceContext: AcquisitionContext;
  originalValue: string;
  normalizedValue: string;
  provenance: ProvenanceType;
  policyStatus: PolicyStatus;
  derivedFrom?: SourceContribution[];
}

// ==========================================
// 6. Normalized Field Value Envelope
// ==========================================

export interface FieldPolicyEnvelope<T = string> {
  value: T;
  fieldName: string;
  provenance: ProvenanceType;
  acquisitionContext: AcquisitionContext;
  source: SourceType;
  capturedAt: string;
  confidence: 'STRONG' | 'MODERATE' | 'WEAK' | 'AMBIGUOUS' | 'UNKNOWN';
  policyStatus: PolicyStatus;
  persistenceStatus: PersistenceStatus;
  exportStatus: ExportStatus;
  originalRawValue?: string;
  derivedFrom?: SourceContribution[];
  sourceContributions?: SourceContribution[];
  metadata?: Record<string, any>;
}

// ==========================================
// 7. Structured Field Components
// ==========================================

export interface NormalizedUrlComponents {
  originalUrl: string;
  normalizedUrl: string;
  canonicalDomain: string;
  canonicalOrigin: string;
  protocol: 'http:' | 'https:';
  hostname: string;
  pathname: string;
  hasMeaningfulSubdomain: boolean;
  preservedParams: Record<string, string>;
  isCredentialBearing: boolean;
  isValid: boolean;
  error?: string;
}

export type PhoneState = 'PHONE_NORMALIZED' | 'PHONE_RAW' | 'PHONE_INVALID' | 'PHONE_AMBIGUOUS';
export type CountryInferenceState = 'COUNTRY_EXPLICIT' | 'COUNTRY_INFERRED' | 'COUNTRY_UNKNOWN';

export interface NormalizedPhoneComponents {
  rawPhone: string;
  e164Format?: string;
  internationalFormat?: string;
  nationalFormat?: string;
  countryCode?: string;
  countryInference: CountryInferenceState;
  dialCode?: string;
  extension?: string;
  phoneState: PhoneState;
  isValid: boolean;
  error?: string;
}

export interface NormalizedEmailComponents {
  rawEmail: string;
  normalizedEmail: string;
  localPart: string;
  domainPart: string;
  isValid: boolean;
  error?: string;
}

export interface NormalizedBusinessNameComponents {
  displayName: string;
  normalizedName: string;
  comparisonName: string;
  legalSuffix?: string;
  detectedScript: 'LATIN' | 'BENGALI' | 'ARABIC' | 'MIXED' | 'OTHER';
}

export interface NormalizedAddressComponents {
  displayAddress: string;
  normalizedAddress: string;
  addressLine1?: string;
  addressLine2?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
    provenance: ProvenanceType;
    policyStatus: PolicyStatus;
    derivedFrom?: SourceContribution[];
  };
}

export interface NormalizedCategoryComponents {
  sourceCategory: string;
  normalizedCategory: string;
  categoryConfidence: 'STRONG' | 'MODERATE' | 'WEAK' | 'UNKNOWN';
  matchedTaxonomyId?: string;
}

export interface NormalizedLocationComponents {
  sourceLocation: string;
  normalizedLocation: string;
  city?: string;
  region?: string;
  countryCode?: string;
  postalCode?: string;
}

// ==========================================
// 7B. Phase 7 Maps Specific Components
// ==========================================

export type CoordinateState = 'VALID' | 'INVALID' | 'MISSING';

export interface NormalizedCoordinates {
  latitude: number | null;
  longitude: number | null;
  rawLatitude?: string | number;
  rawLongitude?: string | number;
  coordinateState: CoordinateState;
  precision?: number;
}

export type BusinessOperationalStatus = 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED' | 'UNKNOWN';

export interface NormalizedBusinessStatus {
  status: BusinessOperationalStatus;
  originalStatus: string;
  statusState: 'EXPLICIT' | 'UNKNOWN';
}

export type HoursState = 'STRUCTURED' | 'CLOSED_DAY' | 'UNKNOWN_HOURS' | 'MISSING';

export interface OpeningHoursPeriod {
  day: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openTime: string; // HH:MM 24-hr
  closeTime: string; // HH:MM 24-hr
}

export interface NormalizedOpeningHours {
  periods: OpeningHoursPeriod[];
  weekdayText: string[];
  timezone: string; // 'TIMEZONE_UNKNOWN' if unknown
  hoursState: HoursState;
  rawHours?: any;
}

export type RatingState = 'VALID' | 'MISSING' | 'INVALID';

export interface NormalizedRatingComponents {
  rating: number | null;
  reviewCount: number | null;
  ratingState: RatingState;
  reviewCountState: RatingState;
  originalRating?: string | number;
  originalReviewCount?: string | number;
}

export interface NormalizedMapsUrlComponents {
  originalMapsUrl: string;
  normalizedMapsUrl: string;
  isValid: boolean;
  placeQuery?: string;
}

export interface NormalizedPlaceReferenceComponents {
  placeId?: string;
  plusCode?: string;
  dataId?: string;
  referenceType: 'GOOGLE_WEB_PLACE_ID' | 'GOOGLE_API_PLACE_ID' | 'PLUS_CODE' | 'GENERIC_REFERENCE';
}

// ==========================================
// 8. Raw Candidate Envelope
// ==========================================

export interface RawCandidateEnvelope {
  candidateId: string;
  runId: string;
  source: SourceType;
  capturedAt: string;
  acquisitionContext: AcquisitionContext;
  policyContext: PolicyStatus;
  defaultProvenance: ProvenanceType;
  fields: Record<string, FieldPolicyEnvelope<any>>;
  rawFieldMetadata: Record<string, string>;
  persistenceEligibility: PersistenceStatus;
  exportEligibility: ExportStatus;
  sourceContributions: SourceContribution[];
}

export interface RawMapsCandidateEnvelope {
  candidateId?: string;
  sourceId: string;
  source?: SourceType; // Defaults to 'GOOGLE_MAPS'
  businessName: string;
  category?: string | null;
  address?: string | null;
  street?: string | null;
  locality?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
  countryCode?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  phone?: string | null;
  website?: string | null;
  openingHours?: any;
  businessStatus?: string | null;
  reviewCount?: number | string | null;
  rating?: number | string | null;
  mapsUrl?: string | null;
  placeReference?: {
    placeId?: string;
    plusCode?: string;
    dataId?: string;
  };
  provenance?: ProvenanceType;
  acquisitionContext?: AcquisitionContext;
  restrictionBasis?: PolicyRestrictionBasis;
  policyStatus?: PolicyStatus;
  persistenceStatus?: PersistenceStatus;
  exportStatus?: ExportStatus;
  sourceContributions?: SourceContribution[];
  derivedFrom?: SourceContribution[];
  capturedAt?: string;
  metadata?: Record<string, any>;
}

// ==========================================
// 9. Normalized Candidate Representation
// ==========================================

export interface NormalizedCandidate {
  candidateId: string;
  runId: string;
  source: SourceType;
  sourceIdentifier: SourceIdentifier;
  acquisitionContext: AcquisitionContext;
  overallPolicyStatus: PolicyStatus;
  overallPersistenceStatus: PersistenceStatus;
  overallExportStatus: ExportStatus;
  overallProvenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  
  // Normalized Core Fields (with field envelopes and lineage)
  businessName: FieldPolicyEnvelope<NormalizedBusinessNameComponents>;
  websiteUrl?: FieldPolicyEnvelope<NormalizedUrlComponents>;
  phones: Array<FieldPolicyEnvelope<NormalizedPhoneComponents>>;
  emails: Array<FieldPolicyEnvelope<NormalizedEmailComponents>>;
  address?: FieldPolicyEnvelope<NormalizedAddressComponents>;
  location?: FieldPolicyEnvelope<NormalizedLocationComponents>;
  categories: Array<FieldPolicyEnvelope<NormalizedCategoryComponents>>;
  
  // Phase 7 Maps Core Fields (additive, optional)
  coordinates?: FieldPolicyEnvelope<NormalizedCoordinates>;
  businessStatus?: FieldPolicyEnvelope<NormalizedBusinessStatus>;
  openingHours?: FieldPolicyEnvelope<NormalizedOpeningHours>;
  rating?: FieldPolicyEnvelope<NormalizedRatingComponents>;
  mapsUrl?: FieldPolicyEnvelope<NormalizedMapsUrlComponents>;
  placeReference?: FieldPolicyEnvelope<NormalizedPlaceReferenceComponents>;
  
  // Auxiliary Signals
  socialUrls: Array<FieldPolicyEnvelope<string>>;
  externalProfileUrl?: FieldPolicyEnvelope<string>;
  
  // Verification & Qualification Placeholders
  verificationPlaceholder?: {
    verificationStatus: 'PENDING' | 'SKIPPED' | 'NOT_APPLICABLE';
    eligibleForDeepVerification: boolean;
  };
  qualificationPlaceholder?: {
    relevanceDecision: 'PENDING' | 'RELEVANT' | 'UNCERTAIN' | 'NOT_RELEVANT';
    qualificationScore: number;
    derivedFrom?: SourceContribution[];
  };
  
  // Normalization Audit & Telemetry
  normalizationAudit: {
    normalizedAt: string;
    engineVersion: string;
    errors: NormalizationErrorRecord[];
    warnings: string[];
    isSanitized: boolean;
  };
}

// ==========================================
// 10. Error Taxonomy
// ==========================================

export type NormalizationErrorCode =
  | 'INVALID_URL'
  | 'INVALID_PHONE'
  | 'INVALID_EMAIL'
  | 'MALFORMED_FIELD'
  | 'UNSUPPORTED_ENCODING'
  | 'AMBIGUOUS_LOCATION'
  | 'MISSING_REQUIRED_FIELD'
  | 'POLICY_BLOCKED'
  | 'SECURITY_REJECTED'
  | 'OVERSIZED_INPUT'
  | 'UNSUPPORTED_SOURCE';

export interface NormalizationErrorRecord {
  code: NormalizationErrorCode;
  field: string;
  message: string;
  rejectedValue?: string;
  timestamp: string;
}
