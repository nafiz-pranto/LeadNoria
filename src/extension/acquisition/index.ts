/**
 * LeadNoria — Acquisition Module Exports
 *
 * Public API for the browser acquisition engine and Phase 20 field extraction + coverage engine.
 * Import from this index to avoid deep coupling to internal files.
 */

// Phase 19 Base Contracts
export type {
  BrowserAcquisitionAdapter,
  AcquisitionCandidate,
  AcquisitionSessionConfig,
  AcquisitionSessionState,
  AcquisitionResult,
  AcquisitionStatus,
  AcquisitionErrorCode,
  AcquisitionError,
  GoogleMapsObservedFields,
  PageDetectionResult,
  MapsPageType,
  AcquisitionEvent,
  AcquisitionEventType,
  AcquisitionSourceId
} from './browserAcquisitionTypes.ts';

export { DEFAULT_ACQUISITION_CONFIG } from './browserAcquisitionTypes.ts';
export { GoogleMapsBrowserAdapter } from './googleMapsBrowserAdapter.ts';

// Phase 20 Field Model & Quality Contracts
export type {
  FieldQualityState,
  FieldQualityReason,
  GoogleDerivedField,
  GoogleAddressComponents,
  GoogleOpeningHoursStructured,
  GoogleBusinessAttributes,
  GoogleSourceContext,
  AcquisitionQualitySignals,
  GoogleMapsNormalizedRecord
} from './googleMapsFieldModel.ts';

export { calculateAcquisitionQuality } from './googleMapsFieldModel.ts';

// Phase 20 Normalization Engine
export {
  cleanText,
  normalizeBusinessNameField,
  normalizeCategories,
  normalizeAddressField,
  normalizePhoneField,
  normalizeWebsiteUrlField,
  normalizeCoordinatesField,
  normalizeRatingField,
  normalizeReviewCountField,
  normalizeBusinessStatusField,
  normalizeOpeningHoursField,
  normalizeGoogleMapsRecord
} from './googleMapsFieldNormalizer.ts';

// Phase 20 Coverage Engine & Deduplication
export type {
  SearchUnitCoverageStatus,
  SearchUnitCoverageState,
  CandidateObservationLineage,
  CoverageSessionMetrics,
  CoverageCheckpoint
} from './coverage/coverageTypes.ts';

export { SessionDeduplicator } from './coverage/sessionDeduplicator.ts';
export type { DeduplicationDecision } from './coverage/sessionDeduplicator.ts';
export { CoverageTracker } from './coverage/coverageTracker.ts';

// Phase 20 Multi-Stage Extraction
export {
  GoogleMapsExtractionEngine,
  EXTRACTION_SELECTORS,
  parseCoordinatesFromUrl,
  parsePlaceIdFromUrl
} from './googleMapsExtractionEngine.ts';
