/**
 * LeadNoria — Browser Acquisition Engine: Type Contracts
 *
 * Source-neutral acquisition layer types. Any browser-based source
 * (Google Maps, future sources) feeds through this contract.
 *
 * INVARIANTS:
 * - No Google API, Places API, or OAuth references.
 * - No private/undocumented Google endpoints.
 * - No CAPTCHA solving, anti-bot bypass, or stealth mechanisms.
 * - All extracted content treated as untrusted input.
 * - GOOGLE_DERIVED provenance enforced; NOT_PERSISTABLE / NOT_EXPORTABLE enforced.
 * - Acquisition is incremental, bounded, and cancellable.
 */

// ==========================================
// 1. Acquisition Source Identifiers
// ==========================================

export type AcquisitionSourceId = 'GOOGLE_MAPS_CONSUMER_WEB';

// ==========================================
// 2. Acquisition Status Codes
// ==========================================

export type AcquisitionStatus =
  | 'IDLE'
  | 'INITIALIZING'
  | 'DETECTING'
  | 'ACQUIRING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'PARTIAL';

// ==========================================
// 3. Acquisition Error Codes
// ==========================================

export type AcquisitionErrorCode =
  | 'UNSUPPORTED_PAGE'
  | 'PAGE_NOT_READY'
  | 'NO_RESULTS'
  | 'PARTIAL_RESULTS'
  | 'NAVIGATION_FAILED'
  | 'EXTRACTION_FAILED'
  | 'CANCELLED'
  | 'ACCESS_UNAVAILABLE'
  | 'SECURITY_REJECTED'
  | 'OBSERVER_FAILED'
  | 'UNKNOWN';

export interface AcquisitionError {
  code: AcquisitionErrorCode;
  message: string;
  candidateId?: string;
  recoverable: boolean;
  timestamp: string;
}

// ==========================================
// 4. Raw Observed Fields (Google Maps)
// ==========================================

/**
 * Fields observed directly from the rendered Google Maps page.
 * All values are raw strings — normalization happens in the pipeline.
 * No field is fabricated; missing fields are omitted (not null-padded).
 */
export interface GoogleMapsObservedFields {
  // Identity
  businessName?: string;
  category?: string;
  secondaryCategories?: string[];
  businessStatus?: string;

  // Location
  address?: string;
  street?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;

  // Contact
  phone?: string;
  websiteUrl?: string;

  // Business signals
  rating?: string;
  reviewCount?: string;
  priceLevel?: string;
  openingHours?: string[];
  description?: string;
  serviceAttributes?: string[];

  // Source metadata
  mapsUrl?: string;
  listingUrl?: string;
  placeId?: string;    // Only when safely exposed in rendered page URL/DOM
  searchQuery?: string;
  searchContext?: string;

  // Phase 20 Structured Extensions
  primaryCategory?: string;
  fullAddress?: string;
  city?: string;
  serviceOptions?: string[];
  accessibilityOptions?: string[];
  amenities?: string[];
  businessAttributes?: Record<string, string[]>;
  sourceRecordId?: string;
  searchLocation?: string;
  searchUnitId?: string;
  observedAt?: string;
}

// ==========================================
// 5. Acquisition Candidate Envelope
// ==========================================

/**
 * Raw acquisition envelope emitted per discovered listing.
 * Carries observed fields + provenance + acquisition status.
 * NOT yet a NormalizedCandidate — normalization is a downstream step.
 */
export interface AcquisitionCandidate {
  /** Stable acquisition-session-local ID */
  acquisitionId: string;

  /** Source this candidate came from */
  source: AcquisitionSourceId;

  /** URL of the page where this was observed */
  sourceUrl: string;

  /** ISO timestamp when observed */
  observedAt: string;

  /** Run/session scoping ID */
  sessionId: string;

  /** Raw observed fields (untrusted input, text only) */
  observed: GoogleMapsObservedFields;

  /** Lightweight acquisition-level dedup signature */
  dedupSignature: string;

  /** Provenance label — always GOOGLE_DERIVED for Maps */
  provenance: 'GOOGLE_DERIVED';

  /** Restriction basis — always GOOGLE_CONSUMER_WEB_RESTRICTED for Maps */
  restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED';

  /** Source contribution metadata for pipeline lineage */
  sourceContribution: {
    source: 'GOOGLE_MAPS';
    acquisitionContext: 'GOOGLE_CONSUMER_WEB';
    isRestricted: true;
    policyStatus: 'POLICY_GATED';
    persistenceStatus: 'NOT_PERSISTABLE';
    exportStatus: 'NOT_EXPORTABLE';
  };

  /** Per-candidate acquisition warnings (non-fatal) */
  warnings: string[];

  /** Per-candidate extraction errors (may be partial) */
  errors: AcquisitionError[];
}

// ==========================================
// 6. Acquisition Session Config
// ==========================================

export interface AcquisitionSessionConfig {
  /** Unique ID for this acquisition session */
  sessionId: string;

  /** Max candidates to collect before stopping */
  maxCandidates: number;

  /** Max scroll iterations before stopping */
  maxScrolls: number;

  /** Max wait ms per render cycle */
  renderWaitMs: number;

  /** Max retry attempts per cycle */
  maxRetries: number;

  /** Whether to collect detail panels (slower, more data) */
  collectDetails: boolean;

  /** Search context label for provenance */
  searchContext?: string;
}

export const DEFAULT_ACQUISITION_CONFIG: AcquisitionSessionConfig = {
  sessionId: '',
  maxCandidates: 100,
  maxScrolls: 20,
  renderWaitMs: 1500,
  maxRetries: 3,
  collectDetails: false
};

// ==========================================
// 7. Acquisition Session State
// ==========================================

export interface AcquisitionSessionState {
  sessionId: string;
  status: AcquisitionStatus;
  candidatesCollected: number;
  candidatesSkipped: number;
  scrollCount: number;
  startedAt: string;
  lastActivityAt: string;
  errors: AcquisitionError[];
  warnings: string[];
}

// ==========================================
// 8. Page Detection Result
// ==========================================

export type MapsPageType =
  | 'SEARCH_RESULTS'   // /maps/search/ or /maps?q=
  | 'PLACE_DETAIL'     // /maps/place/...
  | 'UNKNOWN';

export interface PageDetectionResult {
  isSupported: boolean;
  pageType: MapsPageType;
  url: string;
  reason?: string;
}

// ==========================================
// 9. Acquisition Event (observability)
// ==========================================

export type AcquisitionEventType =
  | 'SESSION_STARTED'
  | 'PAGE_DETECTED'
  | 'PAGE_UNSUPPORTED'
  | 'CANDIDATE_DISCOVERED'
  | 'CANDIDATE_NORMALIZED'
  | 'CANDIDATE_SKIPPED'
  | 'SCROLL_TRIGGERED'
  | 'RENDER_WAITED'
  | 'SESSION_PAUSED'
  | 'SESSION_CANCELLED'
  | 'SESSION_COMPLETED'
  | 'SESSION_FAILED'
  | 'EXTRACTION_ERROR'
  | 'OBSERVER_ATTACHED'
  | 'OBSERVER_DETACHED';

export interface AcquisitionEvent {
  type: AcquisitionEventType;
  sessionId: string;
  timestamp: string;
  candidateId?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

// ==========================================
// 10. Acquisition Result
// ==========================================

export interface AcquisitionResult {
  sessionId: string;
  status: AcquisitionStatus;
  candidates: AcquisitionCandidate[];
  sessionState: AcquisitionSessionState;
  errors: AcquisitionError[];
}

// ==========================================
// 11. Browser Acquisition Adapter Interface
// ==========================================

/**
 * Source-neutral browser acquisition interface.
 * Implemented by GoogleMapsBrowserAdapter and any future browser source.
 */
export interface BrowserAcquisitionAdapter {
  readonly sourceId: AcquisitionSourceId;
  readonly adapterVersion: string;

  /** Detect if the current page is supported by this adapter */
  detectSupportedPage(url: string): PageDetectionResult;

  /** Attach DOM observers to track dynamic content */
  attachObservers(config: AcquisitionSessionConfig): void;

  /** Detach all observers and clean up */
  detachObservers(): void;

  /** Collect currently visible listing candidates */
  collectVisibleCandidates(
    config: AcquisitionSessionConfig,
    seenSignatures: Set<string>
  ): AcquisitionCandidate[];

  /** Collect detail panel for a specific listing (if collectDetails=true) */
  collectDetailPanel(
    config: AcquisitionSessionConfig
  ): Partial<GoogleMapsObservedFields> | null;

  /** Trigger a bounded scroll step */
  triggerScroll(): boolean;

  /** Check if results list is at bottom (no more to load) */
  isAtBottom(): boolean;

  /** Whether the page has enough content to begin acquisition */
  isPageReady(): boolean;

  /** Clean up all observers, timers, and state */
  dispose(): void;
}
