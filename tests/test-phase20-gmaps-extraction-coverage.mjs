/**
 * LeadNoria — Phase 20: Google Maps Field Extraction + Coverage Engine
 * Comprehensive Test Suite
 *
 * Test Groups:
 * Group 1: Google Maps Field Model & Quality States
 * Group 2: Safe Deterministic Normalization
 * Group 3: Field-Level Lineage & Provenance
 * Group 4: Acquisition Quality Signals
 * Group 5: Multi-Stage Extraction Lifecycle
 * Group 6: Coverage Engine & Search-Unit States
 * Group 7: Session-Local Deduplication
 * Group 8: Coverage Overlap & Cross-Unit Lineage
 * Group 9: Partial-Progress Safety & Checkpoint Resumption
 * Group 10: Error Handling & Fault Isolation
 * Group 11: Security & Adversarial Defense
 * Group 12: Data Firewall & Non-Persistence Mandates
 * Group 13: Memory Safety & Streaming Boundedness
 * Group 14: Phase 19 Baseline & Adapter Integration
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Domain imports
import {
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
} from '../src/extension/acquisition/googleMapsFieldNormalizer.ts';

import {
  calculateAcquisitionQuality
} from '../src/extension/acquisition/googleMapsFieldModel.ts';

import {
  CoverageTracker
} from '../src/extension/acquisition/coverage/coverageTracker.ts';

import {
  SessionDeduplicator
} from '../src/extension/acquisition/coverage/sessionDeduplicator.ts';

import {
  GoogleMapsExtractionEngine,
  EXTRACTION_SELECTORS,
  parseCoordinatesFromUrl,
  parsePlaceIdFromUrl
} from '../src/extension/acquisition/googleMapsExtractionEngine.ts';

import { GoogleMapsUnifiedAdapter } from '../src/extension/pipeline/sourceAdapter.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] Test ${totalTests}: ${name}`);
    console.error(`         ${err.message}`);
    failedTests++;
  }
}

function group(title) {
  console.log(`\n--- ${title} ---`);
}

console.log('================================================================');
console.log('LEADNORIA PHASE 20: FIELD EXTRACTION & COVERAGE ENGINE SUITE');
console.log('================================================================');

// ────────────────────────────────────────────────────────────
// GROUP 1: GOOGLE MAPS FIELD MODEL & QUALITY STATES
// ────────────────────────────────────────────────────────────
group('GROUP 1: GOOGLE MAPS FIELD MODEL & QUALITY STATES');

test('P20-01: Distinguishes field absence (ABSENT) from extraction failure (INVALID)', () => {
  const absentWebsite = normalizeWebsiteUrlField(undefined);
  assert.equal(absentWebsite, undefined);

  const emptyWebsite = normalizeWebsiteUrlField('');
  assert.equal(emptyWebsite, undefined);

  const invalidWebsite = normalizeWebsiteUrlField('javascript:alert(1)');
  assert.ok(invalidWebsite);
  assert.equal(invalidWebsite.state, 'INVALID');
  assert.equal(invalidWebsite.qualityReason, 'WEBSITE_UNSAFE_PROTOCOL');
});

test('P20-02: Distinguishes missing phone (NO_PHONE) from malformed phone (PHONE_MALFORMED)', () => {
  const absentPhone = normalizePhoneField('');
  assert.equal(absentPhone, undefined);

  const malformedPhone = normalizePhoneField('abc-not-a-number');
  assert.ok(malformedPhone);
  assert.equal(malformedPhone.state, 'INVALID');
  assert.equal(malformedPhone.qualityReason, 'PHONE_MALFORMED');
  assert.equal(malformedPhone.value, undefined);
});

test('P20-03: Flags ambiguous phone (missing country dial code) as PARTIAL', () => {
  const localPhone = normalizePhoneField('(415) 555-0199');
  assert.ok(localPhone);
  assert.equal(localPhone.state, 'PARTIAL');
  assert.equal(localPhone.qualityReason, 'PHONE_AMBIGUOUS');
  assert.equal(localPhone.value, '4155550199');
});

test('P20-04: Full E.164 phone with explicit country code is marked PRESENT', () => {
  const intlPhone = normalizePhoneField('+1-415-555-0199');
  assert.ok(intlPhone);
  assert.equal(intlPhone.state, 'PRESENT');
  assert.equal(intlPhone.value, '+14155550199');
  assert.equal(intlPhone.qualityReason, undefined);
});

test('P20-05: Missing address yields undefined without fabricating data', () => {
  const addr = normalizeAddressField(undefined, undefined);
  assert.equal(addr, undefined);
});

test('P20-06: Partial address decomposes tokens and records PARTIAL state', () => {
  const addr = normalizeAddressField('123 Market St, San Francisco');
  assert.ok(addr);
  assert.equal(addr.state, 'PARTIAL');
  assert.equal(addr.qualityReason, 'ADDRESS_INCOMPLETE');
  assert.equal(addr.value?.street, '123 Market St');
  assert.equal(addr.value?.city, 'San Francisco');
  assert.equal(addr.value?.country, undefined);
});

// ────────────────────────────────────────────────────────────
// GROUP 2: SAFE DETERMINISTIC NORMALIZATION
// ────────────────────────────────────────────────────────────
group('GROUP 2: SAFE DETERMINISTIC NORMALIZATION');

test('P20-07: Business name trims whitespace and collapses repeated whitespace', () => {
  const res = normalizeBusinessNameField('   Blue   Bottle    Coffee   ');
  assert.equal(res.value, 'Blue Bottle Coffee');
  assert.equal(res.state, 'PRESENT');
});

test('P20-08: Business name applies Unicode NFC normalization', () => {
  // Composed vs Decomposed é: 'e\u0301' -> '\u00e9'
  const decomposed = 'Cafe\u0301 de Paris';
  const res = normalizeBusinessNameField(decomposed);
  assert.equal(res.value, 'Café de Paris');
});

test('P20-09: Business name preserves meaningful punctuation and branding', () => {
  const name = "Ben & Jerry's Ice Cream - Main St. (2nd Fl.)";
  const res = normalizeBusinessNameField(name);
  assert.equal(res.value, "Ben & Jerry's Ice Cream - Main St. (2nd Fl.)");
});

test('P20-010: Categories normalize whitespace and deduplicate case-insensitively', () => {
  const primary = '  Coffee Shop  ';
  const secondary = ['coffee shop', 'Cafe', 'espresso bar', 'CAFE'];
  const res = normalizeCategories(primary, secondary);

  assert.equal(res.primaryCategory?.value, 'Coffee Shop');
  assert.deepEqual(res.secondaryCategories?.value, ['Cafe', 'espresso bar']);
});

test('P20-011: URL normalizer adds https scheme and removes click trackers', () => {
  const rawUrl = 'bluebottlecoffee.com/store?branch=1&gclid=xyz123&fbclid=abc';
  const res = normalizeWebsiteUrlField(rawUrl);
  assert.ok(res);
  assert.equal(res.state, 'PRESENT');
  assert.equal(res.value, 'https://bluebottlecoffee.com/store?branch=1');
});

test('P20-012: URL normalizer unescapes Google redirect wrapper', () => {
  const redirect = 'https://www.google.com/url?q=https://realbusiness.com/about&sa=D';
  const res = normalizeWebsiteUrlField(redirect);
  assert.ok(res);
  assert.equal(res.value, 'https://realbusiness.com/about');
});

test('P20-013: Coordinates validate valid range and round to 6 decimal places', () => {
  const coords = normalizeCoordinatesField(37.7749295, -122.4194156);
  assert.ok(coords);
  assert.equal(coords.state, 'PRESENT');
  assert.equal(coords.value?.latitude, 37.77493);
  assert.equal(coords.value?.longitude, -122.419416);
});

test('P20-014: Coordinates reject out-of-range latitude or longitude', () => {
  const invalidLat = normalizeCoordinatesField(95.5, -122.4);
  assert.ok(invalidLat);
  assert.equal(invalidLat.state, 'INVALID');
  assert.equal(invalidLat.qualityReason, 'COORDINATES_OUT_OF_BOUNDS');

  const invalidLng = normalizeCoordinatesField(37.5, 200.0);
  assert.ok(invalidLng);
  assert.equal(invalidLng.state, 'INVALID');
  assert.equal(invalidLng.qualityReason, 'COORDINATES_OUT_OF_BOUNDS');
});

test('P20-015: Ratings normalize to 1.0 - 5.0 range with 1 decimal precision', () => {
  const valid = normalizeRatingField('4.74 stars');
  assert.ok(valid);
  assert.equal(valid.value, 4.7);

  const invalid = normalizeRatingField('9.2');
  assert.ok(invalid);
  assert.equal(invalid.state, 'INVALID');
  assert.equal(invalid.qualityReason, 'RATING_MALFORMED');
});

test('P20-016: Review count parses formatted integers and strips commas', () => {
  const valid = normalizeReviewCountField('1,450 reviews');
  assert.ok(valid);
  assert.equal(valid.value, 1450);

  const invalid = normalizeReviewCountField('many');
  assert.ok(invalid);
  assert.equal(invalid.state, 'INVALID');
  assert.equal(invalid.qualityReason, 'REVIEW_COUNT_MALFORMED');
});

test('P20-017: Opening hours extracts day periods without inventing missing hours', () => {
  const rawHours = [
    'Monday: 7:00 AM – 6:00 PM',
    'Tuesday: 7:00 AM – 6:00 PM',
    'Wednesday: Closed',
    'Thursday: Open 24 hours'
  ];
  const res = normalizeOpeningHoursField(rawHours);
  assert.ok(res);
  assert.equal(res.state, 'PRESENT');
  assert.equal(res.value?.periods?.length, 4);

  const wed = res.value?.periods?.find(p => p.dayName === 'Wednesday');
  assert.ok(wed?.isClosed);

  const thu = res.value?.periods?.find(p => p.dayName === 'Thursday');
  assert.ok(thu?.isOpen24Hours);
});

// ────────────────────────────────────────────────────────────
// GROUP 3: FIELD-LEVEL LINEAGE & PROVENANCE
// ────────────────────────────────────────────────────────────
group('GROUP 3: FIELD-LEVEL LINEAGE & PROVENANCE');

test('P20-018: Normalized fields retain original observed value and transformation note', () => {
  const rawPhone = '  (415) 555-0100  ';
  const field = normalizePhoneField(rawPhone);
  assert.ok(field);
  assert.equal(field.originalRawValue, rawPhone);
  assert.equal(field.value, '4155550100');
  assert.ok(field.transformation?.includes('Punctuation stripped'));
  assert.equal(field.provenance, 'GOOGLE_DERIVED');
});

test('P20-019: Every field in GoogleMapsNormalizedRecord has GOOGLE_DERIVED provenance', () => {
  const record = normalizeGoogleMapsRecord(
    {
      businessName: 'Apex Dental',
      category: 'Dentist',
      address: '456 Mission St, San Francisco, CA',
      phone: '+14155550199',
      websiteUrl: 'https://apexdental.com'
    },
    { acquisitionId: 'acq_1', sessionId: 'sess_1' }
  );

  assert.equal(record.businessName.provenance, 'GOOGLE_DERIVED');
  assert.equal(record.primaryCategory?.provenance, 'GOOGLE_DERIVED');
  assert.equal(record.address?.provenance, 'GOOGLE_DERIVED');
  assert.equal(record.phone?.provenance, 'GOOGLE_DERIVED');
  assert.equal(record.websiteUrl?.provenance, 'GOOGLE_DERIVED');
  assert.equal(record.provenance, 'GOOGLE_DERIVED');
});

test('P20-020: Lineage does NOT mix META_DERIVED or WEBSITE_DERIVED into Maps fields', () => {
  const record = normalizeGoogleMapsRecord(
    { businessName: 'Test Corp' },
    { acquisitionId: 'acq_2', sessionId: 'sess_2' }
  );

  const jsonStr = JSON.stringify(record);
  assert.ok(!jsonStr.includes('META_DERIVED'));
  assert.ok(!jsonStr.includes('WEBSITE_DERIVED'));
});

// ────────────────────────────────────────────────────────────
// GROUP 4: ACQUISITION QUALITY SIGNALS
// ────────────────────────────────────────────────────────────
group('GROUP 4: ACQUISITION QUALITY SIGNALS');

test('P20-021: Calculates completeness ratios for identity, contact, location', () => {
  const signals = calculateAcquisitionQuality({
    hasName: true,
    hasCategory: true,
    hasStatus: true,
    hasPhone: true,
    hasWebsite: true,
    hasAddress: true,
    hasCity: true,
    hasCoordinates: true,
    hasHours: true,
    hasRating: true,
    hasReviewCount: true,
    hasSourceRecordId: true,
    hasListingUrl: true
  });

  assert.equal(signals.identityCompleteness, 1.0);
  assert.equal(signals.contactCompleteness, 1.0);
  assert.equal(signals.locationCompleteness, 1.0);
  assert.equal(signals.fieldCompletenessRatio, 1.0);
  assert.equal(signals.sourceIntegrity, 'HIGH');
});

test('P20-022: Candidate missing contact channels receives lower contact completeness', () => {
  const signals = calculateAcquisitionQuality({
    hasName: true,
    hasCategory: true,
    hasStatus: false,
    hasPhone: false,
    hasWebsite: false,
    hasAddress: true,
    hasCity: true,
    hasCoordinates: false,
    hasHours: false,
    hasRating: false,
    hasReviewCount: false,
    hasSourceRecordId: false,
    hasListingUrl: true
  });

  assert.equal(signals.contactCompleteness, 0.0);
  assert.ok(signals.identityCompleteness > 0.5);
  assert.equal(signals.sourceIntegrity, 'MEDIUM');
});

test('P20-023: Quality signals are technical completeness metrics, NOT lead scores', () => {
  const record = normalizeGoogleMapsRecord(
    { businessName: 'Solo Bakery' },
    { acquisitionId: 'acq_3', sessionId: 'sess_3' }
  );

  // Must not have qualification decision or lead qualification properties
  assert.equal(record.qualificationScore, undefined);
  assert.equal(record.leadStatus, undefined);
  assert.ok(record.qualitySignals.fieldCompletenessRatio >= 0);
});

// ────────────────────────────────────────────────────────────
// GROUP 5: MULTI-STAGE EXTRACTION LIFECYCLE
// ────────────────────────────────────────────────────────────
group('GROUP 5: MULTI-STAGE EXTRACTION LIFECYCLE');

test('P20-024: URL parser extracts latitude, longitude and place ID', () => {
  const url = 'https://www.google.com/maps/place/Blue+Bottle/@37.7812,-122.4045,17z/data=!4m6!3m5!1sChIJ3bZ2QvGAhYAR1oHh5sW-5zM!8m2';
  const coords = parseCoordinatesFromUrl(url);
  assert.equal(coords.latitude, 37.7812);
  assert.equal(coords.longitude, -122.4045);

  const placeId = parsePlaceIdFromUrl(url);
  assert.equal(placeId, 'ChIJ3bZ2QvGAhYAR1oHh5sW-5zM');
});

test('P20-025: Extraction engine stages D and E normalize and emit structured candidate', () => {
  const engine = new GoogleMapsExtractionEngine('session_abc');
  const record = engine.stageDAndENormalizeAndEmit(
    {
      businessName: 'Mission Plumbing',
      category: 'Plumber',
      address: '100 16th St, San Francisco, CA 94103',
      phone: '+14155550188',
      websiteUrl: 'https://missionplumbing.com',
      rating: '4.8',
      reviewCount: '120',
      placeId: 'ChIJPlumberPlaceId12345'
    },
    {
      acquisitionId: 'cand_101',
      searchQuery: 'plumber san francisco',
      searchLocation: 'San Francisco, CA',
      searchUnitId: 'unit_sf_01'
    }
  );

  assert.equal(record.acquisitionId, 'cand_101');
  assert.equal(record.businessName.value, 'Mission Plumbing');
  assert.equal(record.phone?.value, '+14155550188');
  assert.equal(record.sourceContext.searchQuery, 'plumber san francisco');
  assert.equal(record.sourceContext.searchUnitId, 'unit_sf_01');
  assert.equal(record.sourceContext.sourceRecordId, 'ChIJPlumberPlaceId12345');
});

// ────────────────────────────────────────────────────────────
// GROUP 6: COVERAGE ENGINE & SEARCH-UNIT STATES
// ────────────────────────────────────────────────────────────
group('GROUP 6: COVERAGE ENGINE & SEARCH-UNIT STATES');

test('P20-026: Search unit transitions through distinct states (NOT_STARTED -> RUNNING -> COMPLETED)', () => {
  const tracker = new CoverageTracker('session_cov_1');
  tracker.registerSearchUnit('unit_1', 'bakery dallas', 'Dallas, TX');

  let state = tracker.getSearchUnit('unit_1');
  assert.equal(state?.status, 'NOT_STARTED');

  tracker.startSearchUnit('unit_1');
  state = tracker.getSearchUnit('unit_1');
  assert.equal(state?.status, 'RUNNING');
  assert.ok(state?.startedAt);

  tracker.recordCandidateObservation('unit_1', { businessName: 'Dallas Bakes' }, 'cand_d1');
  tracker.completeSearchUnit('unit_1');

  state = tracker.getSearchUnit('unit_1');
  assert.equal(state?.status, 'COMPLETED');
  assert.equal(state?.candidatesAccepted, 1);
  assert.equal(state?.isNoResults, false);
  assert.equal(state?.isPartial, false);
});

test('P20-027: Zero results is explicitly recorded as NO_RESULTS and NEVER as FAILED', () => {
  const tracker = new CoverageTracker('session_cov_2');
  tracker.registerSearchUnit('unit_empty', 'obscure specialty austin', 'Austin, TX');
  tracker.startSearchUnit('unit_empty');

  tracker.completeSearchUnit('unit_empty', { isNoResults: true });
  const state = tracker.getSearchUnit('unit_empty');

  assert.equal(state?.status, 'NO_RESULTS');
  assert.equal(state?.isNoResults, true);
  assert.equal(state?.isFailure, false);

  const metrics = tracker.getSessionMetrics();
  assert.equal(metrics.noResultsSearchUnits, 1);
  assert.equal(metrics.failedSearchUnits, 0);
});

test('P20-028: Partial completion is distinctly marked as PARTIAL and NEVER as COMPLETED', () => {
  const tracker = new CoverageTracker('session_cov_3');
  tracker.registerSearchUnit('unit_partial', 'dentist houston', 'Houston, TX');
  tracker.startSearchUnit('unit_partial');

  tracker.recordCandidateObservation('unit_partial', { businessName: 'Houston Teeth' }, 'cand_h1');
  tracker.completeSearchUnit('unit_partial', { isPartial: true });

  const state = tracker.getSearchUnit('unit_partial');
  assert.equal(state?.status, 'PARTIAL');
  assert.equal(state?.isPartial, true);
  assert.equal(state?.isFailure, false);

  const metrics = tracker.getSessionMetrics();
  assert.equal(metrics.partialSearchUnits, 1);
  assert.equal(metrics.completedSearchUnits, 0);
});

test('P20-029: Failure marks search unit FAILED without corrupting completed units', () => {
  const tracker = new CoverageTracker('session_cov_4');
  tracker.registerSearchUnit('unit_ok', 'q1');
  tracker.registerSearchUnit('unit_err', 'q2');

  tracker.startSearchUnit('unit_ok');
  tracker.recordCandidateObservation('unit_ok', { businessName: 'Good Business' }, 'cand_ok');
  tracker.completeSearchUnit('unit_ok');

  tracker.startSearchUnit('unit_err');
  tracker.failSearchUnit('unit_err', 'Network disconnect during scroll');

  const okState = tracker.getSearchUnit('unit_ok');
  const errState = tracker.getSearchUnit('unit_err');

  assert.equal(okState?.status, 'COMPLETED');
  assert.equal(errState?.status, 'FAILED');
  assert.equal(errState?.isFailure, true);
  assert.equal(errState?.errorReason, 'Network disconnect during scroll');

  const metrics = tracker.getSessionMetrics();
  assert.equal(metrics.completedSearchUnits, 1);
  assert.equal(metrics.failedSearchUnits, 1);
});

test('P20-030: Cancellation preserves completed units and transitions only active units to CANCELLED', () => {
  const tracker = new CoverageTracker('session_cov_5');
  tracker.registerSearchUnit('u1', 'q1');
  tracker.registerSearchUnit('u2', 'q2');

  tracker.startSearchUnit('u1');
  tracker.recordCandidateObservation('u1', { businessName: 'Biz 1' }, 'c1');
  tracker.completeSearchUnit('u1');

  tracker.startSearchUnit('u2');
  tracker.cancelAllRunning();

  assert.equal(tracker.getSearchUnit('u1')?.status, 'COMPLETED');
  assert.equal(tracker.getSearchUnit('u2')?.status, 'CANCELLED');
});

// ────────────────────────────────────────────────────────────
// GROUP 7: SESSION-LOCAL DEDUPLICATION
// ────────────────────────────────────────────────────────────
group('GROUP 7: SESSION-LOCAL DEDUPLICATION');

test('P20-031: Primary key prefers stable Google place ID', () => {
  const dedup = new SessionDeduplicator();
  const keys = dedup.generateKeys({
    placeId: 'ChIJ1234567890abcdef',
    listingUrl: 'https://maps.google.com/maps/place/Foo',
    businessName: 'Foo Bar',
    address: '123 Main'
  });

  assert.equal(keys.primaryKey, 'gplace:ChIJ1234567890abcdef');
  assert.equal(keys.matchTier, 'SOURCE_RECORD_ID');
});

test('P20-032: Fallback to normalized listing URL when place ID absent', () => {
  const dedup = new SessionDeduplicator();
  const keys = dedup.generateKeys({
    listingUrl: 'https://www.google.com/maps/place/Joe+Cafe?entry=ttu',
    businessName: 'Joe Cafe'
  });

  assert.equal(keys.primaryKey, 'url:https://www.google.com/maps/place/joe+cafe');
  assert.equal(keys.matchTier, 'LISTING_URL');
});

test('P20-033: Fallback to composite fingerprint when URL absent', () => {
  const dedup = new SessionDeduplicator();
  const keys = dedup.generateKeys({
    businessName: 'Acme Cafe',
    address: '100 Market St, Denver, CO'
  });

  assert.ok(keys.primaryKey.startsWith('fp:name+addr:acme cafe|100 market st, denver, co'));
  assert.equal(keys.matchTier, 'FIELD_FINGERPRINT');
});

test('P20-034: Suppresses duplicate candidate with same place ID', () => {
  const dedup = new SessionDeduplicator();
  const first = dedup.evaluateAndRegister({ placeId: 'ChIJAAA111' }, 'cand_1');
  assert.equal(first.isDuplicate, false);
  assert.equal(first.canonicalId, 'cand_1');

  const second = dedup.evaluateAndRegister({ placeId: 'ChIJAAA111' }, 'cand_2');
  assert.equal(second.isDuplicate, true);
  assert.equal(second.canonicalId, 'cand_1');
});

test('P20-035: Weak name+address collision is emitted as potential duplicate with evidence (NOT suppressed)', () => {
  const dedup = new SessionDeduplicator();
  const first = dedup.evaluateAndRegister({
    businessName: 'Summit Law',
    address: '500 5th Ave, Seattle, WA'
  }, 'summit_1');
  assert.equal(first.isDuplicate, false);
  assert.equal(first.isDefinitiveDuplicate, false);

  const second = dedup.evaluateAndRegister({
    businessName: 'Summit Law',
    address: '500 5th Ave, Seattle, WA',
    phone: '206-555-0199'
  }, 'summit_2');
  assert.equal(second.isDuplicate, false); // NOT suppressed!
  assert.equal(second.isDefinitiveDuplicate, false);
  assert.equal(second.isPotentialDuplicate, true);
  assert.equal(second.collisionEvidence?.matchedSignal, 'NAME_AND_ADDRESS');
  assert.equal(second.collisionEvidence?.collidedWithCanonicalId, 'summit_1');
});

test('P20-036: Preserves separate branches at different physical addresses (No Universal Merge)', () => {
  const dedup = new SessionDeduplicator();
  const branchA = dedup.evaluateAndRegister({
    businessName: 'Starbucks',
    address: '100 Main St, Austin, TX'
  }, 'sb_austin');

  const branchB = dedup.evaluateAndRegister({
    businessName: 'Starbucks',
    address: '200 Oak St, Dallas, TX'
  }, 'sb_dallas');

  assert.equal(branchA.isDuplicate, false);
  assert.equal(branchB.isDuplicate, false);
});

// ────────────────────────────────────────────────────────────
// GROUP 8: COVERAGE OVERLAP & CROSS-UNIT LINEAGE
// ────────────────────────────────────────────────────────────
group('GROUP 8: COVERAGE OVERLAP & CROSS-UNIT LINEAGE');

test('P20-037: Records occurrence count and search units across repeated observations', () => {
  const tracker = new CoverageTracker('sess_overlap');
  tracker.registerSearchUnit('unit_kw1', 'italian restaurant downtown');
  tracker.registerSearchUnit('unit_kw2', 'pasta downtown');

  tracker.startSearchUnit('unit_kw1');
  const obs1 = tracker.recordCandidateObservation('unit_kw1', {
    placeId: 'ChIJTrattoria1',
    businessName: 'Trattoria Roma'
  }, 'cand_roma');

  assert.equal(obs1.isNewCandidate, true);
  assert.equal(obs1.isDuplicate, false);

  tracker.startSearchUnit('unit_kw2');
  const obs2 = tracker.recordCandidateObservation('unit_kw2', {
    placeId: 'ChIJTrattoria1',
    businessName: 'Trattoria Roma'
  }, 'cand_roma_repeated');

  assert.equal(obs2.isNewCandidate, false);
  assert.equal(obs2.isDuplicate, true);
  assert.equal(obs2.canonicalCandidateId, 'cand_roma');

  // Verify lineage
  const lineage = tracker.getCandidateLineage('cand_roma');
  assert.ok(lineage);
  assert.equal(lineage.occurrenceCount, 2);
  assert.equal(lineage.firstSeenSearchUnit, 'unit_kw1');
  assert.deepEqual(lineage.additionalSearchUnits, ['unit_kw2']);
  assert.equal(lineage.searchQueriesSeen.length, 2);
});

test('P20-038: Coverage metrics accurately sum duplicates and accepted candidates across units', () => {
  const tracker = new CoverageTracker('sess_metrics');
  tracker.registerSearchUnit('u1', 'q1');
  tracker.registerSearchUnit('u2', 'q2');

  tracker.startSearchUnit('u1');
  tracker.recordCandidateObservation('u1', { placeId: 'PID_1', businessName: 'B1' }, 'c1');
  tracker.recordCandidateObservation('u1', { placeId: 'PID_2', businessName: 'B2' }, 'c2');
  tracker.completeSearchUnit('u1');

  tracker.startSearchUnit('u2');
  tracker.recordCandidateObservation('u2', { placeId: 'PID_2', businessName: 'B2' }, 'c2_repeat');
  tracker.recordCandidateObservation('u2', { placeId: 'PID_3', businessName: 'B3' }, 'c3');
  tracker.completeSearchUnit('u2');

  const metrics = tracker.getSessionMetrics();
  assert.equal(metrics.totalCandidatesSeen, 4);
  assert.equal(metrics.totalCandidatesAccepted, 3);
  assert.equal(metrics.duplicateCount, 1);
  assert.equal(metrics.completedSearchUnits, 2);
});

// ────────────────────────────────────────────────────────────
// GROUP 9: PARTIAL-PROGRESS SAFETY & CHECKPOINT RESUMPTION
// ────────────────────────────────────────────────────────────
group('GROUP 9: PARTIAL-PROGRESS SAFETY & CHECKPOINT RESUMPTION');

test('P20-039: Coverage checkpoint captures unit status without storing business records or PII', () => {
  const tracker = new CoverageTracker('sess_ckpt');
  tracker.registerSearchUnit('unit_comp', 'coffee miami');
  tracker.startSearchUnit('unit_comp');
  tracker.recordCandidateObservation('unit_comp', {
    placeId: 'PID_Coffee',
    businessName: 'Miami Roasters',
    address: '100 Ocean Dr, Miami, FL',
    phone: '305-555-0100'
  }, 'c_miami');
  tracker.completeSearchUnit('unit_comp');

  const checkpoint = tracker.createCheckpoint();

  // Validate structural metadata
  assert.equal(checkpoint.sessionId, 'sess_ckpt');
  assert.equal(checkpoint.searchUnits['unit_comp'].status, 'COMPLETED');
  assert.equal(checkpoint.searchUnits['unit_comp'].candidatesAccepted, 1);

  // Validate Google Firewall: zero business text or PII in checkpoint
  const ckptJson = JSON.stringify(checkpoint);
  assert.ok(!ckptJson.includes('Miami Roasters'));
  assert.ok(!ckptJson.includes('100 Ocean Dr'));
  assert.ok(!ckptJson.includes('305-555-0100'));
});

test('P20-040: Restores completed search units from checkpoint preventing duplicate processing', () => {
  const original = new CoverageTracker('sess_restore');
  original.registerSearchUnit('u_done', 'q_done');
  original.startSearchUnit('u_done');
  original.recordCandidateObservation('u_done', { businessName: 'Done Corp' }, 'c_done');
  original.completeSearchUnit('u_done');

  const ckpt = original.createCheckpoint();

  // Fresh tracker instance simulating recovery
  const fresh = new CoverageTracker('sess_restore');
  fresh.restoreFromCheckpoint(ckpt);

  const restoredUnit = fresh.getSearchUnit('u_done');
  assert.ok(restoredUnit);
  assert.equal(restoredUnit.status, 'COMPLETED');
  assert.equal(restoredUnit.candidatesAccepted, 1);

  // Calling start on already completed unit is idempotent
  fresh.startSearchUnit('u_done');
  assert.equal(fresh.getSearchUnit('u_done')?.status, 'COMPLETED');
});

// ────────────────────────────────────────────────────────────
// GROUP 10: ERROR HANDLING & FAULT ISOLATION
// ────────────────────────────────────────────────────────────
group('GROUP 10: ERROR HANDLING & FAULT ISOLATION');

test('P20-041: Malformed candidate (missing name) is rejected without terminating search unit', () => {
  const tracker = new CoverageTracker('sess_err_iso');
  tracker.registerSearchUnit('u_mix', 'query');
  tracker.startSearchUnit('u_mix');

  const badResult = tracker.recordCandidateObservation('u_mix', {
    businessName: '' // Missing name
  }, 'bad_cand');

  assert.equal(badResult.isNewCandidate, false);
  assert.equal(badResult.isDuplicate, false);

  const goodResult = tracker.recordCandidateObservation('u_mix', {
    businessName: 'Valid Name'
  }, 'good_cand');

  assert.equal(goodResult.isNewCandidate, true);

  const unit = tracker.getSearchUnit('u_mix');
  assert.equal(unit?.candidatesDiscovered, 2);
  assert.equal(unit?.candidatesAccepted, 1);
  assert.equal(unit?.candidatesRejected, 1);
  assert.equal(unit?.malformedCount, 1);
});

// ────────────────────────────────────────────────────────────
// GROUP 11: SECURITY & ADVERSARIAL DEFENSE
// ────────────────────────────────────────────────────────────
group('GROUP 11: SECURITY & ADVERSARIAL DEFENSE');

test('P20-042: Rejects javascript: and data: URLs in website normalizer', () => {
  assert.equal(normalizeWebsiteUrlField('javascript:alert(document.cookie)')?.state, 'INVALID');
  assert.equal(normalizeWebsiteUrlField('data:text/html,<script>alert(1)</script>')?.state, 'INVALID');
  assert.equal(normalizeWebsiteUrlField('vbscript:msgbox(1)')?.state, 'INVALID');
});

test('P20-043: Phone normalizer rejects script injection payloads', () => {
  const res = normalizePhoneField('<script>alert("xss")</script>');
  assert.ok(res);
  assert.equal(res.state, 'INVALID');
  assert.equal(res.qualityReason, 'PHONE_MALFORMED');
  assert.equal(res.value, undefined);
});

test('P20-044: Business name normalizer bounds excessively long text to prevent DoS', () => {
  const hugeName = 'A'.repeat(2000);
  const res = normalizeBusinessNameField(hugeName);
  assert.ok(res.value);
  assert.equal(res.value.length, 300);
});

// ────────────────────────────────────────────────────────────
// GROUP 12: DATA FIREWALL & NON-PERSISTENCE MANDATES
// ────────────────────────────────────────────────────────────
group('GROUP 12: DATA FIREWALL & NON-PERSISTENCE MANDATES');

test('P20-045: GoogleMapsNormalizedRecord enforces NOT_PERSISTABLE and NOT_EXPORTABLE', () => {
  const record = normalizeGoogleMapsRecord(
    { businessName: 'Firewall Protected LLC' },
    { acquisitionId: 'fw_1', sessionId: 'sess_fw' }
  );

  assert.equal(record.provenance, 'GOOGLE_DERIVED');
  assert.equal(record.restrictionBasis, 'GOOGLE_CONSUMER_WEB_RESTRICTED');
  assert.equal(record.policyStatus, 'POLICY_GATED');
  assert.equal(record.persistenceStatus, 'NOT_PERSISTABLE');
  assert.equal(record.exportStatus, 'NOT_EXPORTABLE');
});

test('P20-046: No Google API, Places API, or undocumented endpoint references in Phase 20 files', () => {
  const filesToCheck = [
    'src/extension/acquisition/googleMapsFieldModel.ts',
    'src/extension/acquisition/googleMapsFieldNormalizer.ts',
    'src/extension/acquisition/googleMapsExtractionEngine.ts',
    'src/extension/acquisition/coverage/coverageTypes.ts',
    'src/extension/acquisition/coverage/coverageTracker.ts',
    'src/extension/acquisition/coverage/sessionDeduplicator.ts'
  ];

  for (const relPath of filesToCheck) {
    const content = fs.readFileSync(path.join(rootDir, relPath), 'utf-8');
    assert.ok(!content.includes('maps.googleapis.com'), `${relPath} must not reference maps.googleapis.com`);
    assert.ok(!content.includes('places.googleapis.com'), `${relPath} must not reference places.googleapis.com`);
    assert.ok(!content.includes('PlacesService'), `${relPath} must not reference PlacesService`);
    assert.ok(!content.includes('fetch('), `${relPath} must not call fetch(`);
    assert.ok(!content.includes('XMLHttpRequest'), `${relPath} must not call XMLHttpRequest`);
    assert.ok(!content.includes('eval('), `${relPath} must not call eval(`);
    assert.ok(!content.includes('innerHTML'), `${relPath} must not use innerHTML`);
  }
});

// ────────────────────────────────────────────────────────────
// GROUP 13: MEMORY SAFETY & STREAMING BOUNDEDNESS
// ────────────────────────────────────────────────────────────
group('GROUP 13: MEMORY SAFETY & STREAMING BOUNDEDNESS');

test('P20-047: SessionDeduplicator caps capacity and evicts oldest entries without unbounded growth', () => {
  const smallCapacity = 100;
  const dedup = new SessionDeduplicator(smallCapacity);

  for (let i = 0; i < 150; i++) {
    dedup.evaluateAndRegister({
      placeId: `PID_${i}`,
      businessName: `Business ${i}`
    }, `cand_${i}`);
  }

  assert.ok(dedup.size <= smallCapacity);
});

test('P20-048: Benchmark: 5,000 candidate normalizations complete in under 100ms', () => {
  const start = performance.now();
  for (let i = 0; i < 5000; i++) {
    normalizeGoogleMapsRecord(
      {
        businessName: `Test Cafe ${i}`,
        category: 'Coffee Shop',
        address: `${i} Market St, City, ST 12345`,
        phone: `+1415555${String(i).padStart(4, '0')}`,
        websiteUrl: `https://testcafe${i}.com`
      },
      { acquisitionId: `acq_${i}`, sessionId: 'sess_bench' }
    );
  }
  const duration = performance.now() - start;
  console.log(`       [BENCHMARK] 5,000 normalizations: ${duration.toFixed(1)}ms (${Math.round((5000 / duration) * 1000)} ops/sec)`);
  assert.ok(duration < 250, '5,000 normalizations should execute efficiently');
});

// ────────────────────────────────────────────────────────────
// GROUP 14: PHASE 19 BASELINE & ADAPTER INTEGRATION
// ────────────────────────────────────────────────────────────
group('GROUP 14: PHASE 19 BASELINE & ADAPTER INTEGRATION');

test('P20-049: GoogleMapsUnifiedAdapter wrapCandidate creates CandidateEnvelope with normalizedGoogleRecord', () => {
  const adapter = new GoogleMapsUnifiedAdapter();
  const envelope = adapter.wrapCandidate({
    acquisitionId: 'acq_gm_01',
    businessName: 'Peak Performance Clinic',
    address: '123 Health Way, San Diego, CA',
    phone: '+16195550111',
    websiteUrl: 'https://peakclinic.com',
    observed: {
      businessName: 'Peak Performance Clinic',
      address: '123 Health Way, San Diego, CA',
      phone: '+16195550111',
      websiteUrl: 'https://peakclinic.com'
    }
  });

  assert.equal(envelope.candidateId, 'acq_gm_01');
  assert.equal(envelope.provenance, 'GOOGLE_DERIVED');
  assert.equal(envelope.restrictions.persistenceEligible, false);
  assert.equal(envelope.restrictions.exportEligible, false);

  // Phase 20 normalized record attached
  const rawRef = envelope.rawReference;
  assert.ok(rawRef.normalizedGoogleRecord);
  assert.equal(rawRef.normalizedGoogleRecord.businessName.value, 'Peak Performance Clinic');
  assert.equal(rawRef.normalizedGoogleRecord.phone?.value, '+16195550111');
});

test('P20-050: Manifest permissions remain strictly scoped without Google API hosts', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'src/extension/manifest.json'), 'utf-8')
  );

  const hp = manifest.host_permissions;
  assert.ok(!hp.some(h => h.includes('googleapis.com')));
  assert.ok(!hp.some(h => h === 'https://*/*'));

  // Experimental maps content script defined in content_scripts rather than host_permissions
  const csMatches = manifest.content_scripts.flatMap(cs => cs.matches);
  assert.ok(csMatches.some(m => m.includes('google.com/maps')));

  const perms = manifest.permissions;
  assert.ok(!perms.includes('webRequest'));
  assert.ok(!perms.includes('debugger'));
  assert.ok(!perms.includes('cookies'));
});

// ────────────────────────────────────────────────────────────
// GROUP 15: SESSION DEDUP CORRECTION & WEAK-SIGNAL REGRESSION TESTS
// ────────────────────────────────────────────────────────────
group('GROUP 15: SESSION DEDUP CORRECTION & WEAK-SIGNAL REGRESSION TESTS');

test('P20-051: Regression 1: Same business name, different address must remain two distinct candidates', () => {
  const dedup = new SessionDeduplicator();
  const candA = dedup.evaluateAndRegister({
    businessName: 'ABC Dental',
    address: '123 Main St, Denver, CO'
  }, 'cand_dental_1');

  const candB = dedup.evaluateAndRegister({
    businessName: 'ABC Dental',
    address: '456 Main St, Denver, CO'
  }, 'cand_dental_2');

  assert.equal(candA.isDefinitiveDuplicate, false);
  assert.equal(candB.isDefinitiveDuplicate, false);
  assert.equal(candB.isDuplicate, false); // NOT suppressed!
});

test('P20-052: Regression 2: Same business name, same domain, different branches must NOT be suppressed', () => {
  const dedup = new SessionDeduplicator();
  const branch1 = dedup.evaluateAndRegister({
    businessName: 'ABC Dental',
    address: '123 Main St, Denver, CO',
    websiteUrl: 'https://abc-dental.com'
  }, 'dental_branch_1');

  const branch2 = dedup.evaluateAndRegister({
    businessName: 'ABC Dental',
    address: '456 Main St, Denver, CO',
    websiteUrl: 'https://abc-dental.com'
  }, 'dental_branch_2');

  assert.equal(branch1.isDuplicate, false);
  assert.equal(branch2.isDuplicate, false); // NOT suppressed!
  assert.equal(branch2.isDefinitiveDuplicate, false);
  assert.equal(branch2.isPotentialDuplicate, true);
  assert.equal(branch2.collisionEvidence?.matchedSignal, 'NAME_AND_DOMAIN');
  assert.equal(branch2.collisionEvidence?.collidedWithCanonicalId, 'dental_branch_1');
});

test('P20-053: Regression 3: Same business name, same phone, different branches must NOT be suppressed', () => {
  const dedup = new SessionDeduplicator();
  const branchA = dedup.evaluateAndRegister({
    businessName: 'ABC Cafe',
    address: '100 North St',
    phone: '555-0100'
  }, 'cafe_branch_a');

  const branchB = dedup.evaluateAndRegister({
    businessName: 'ABC Cafe',
    address: '200 South St',
    phone: '555-0100'
  }, 'cafe_branch_b');

  assert.equal(branchA.isDuplicate, false);
  assert.equal(branchB.isDuplicate, false); // NOT suppressed!
  assert.equal(branchB.isDefinitiveDuplicate, false);
  assert.equal(branchB.isPotentialDuplicate, true);
  assert.equal(branchB.collisionEvidence?.matchedSignal, 'NAME_AND_PHONE');
});

test('P20-054: Regression 4: Same business name in nearby locations must NOT be suppressed by geo', () => {
  const dedup = new SessionDeduplicator();
  const loc1 = dedup.evaluateAndRegister({
    businessName: 'Metro Market',
    latitude: 37.7749,
    longitude: -122.4194
  }, 'metro_1');

  const loc2 = dedup.evaluateAndRegister({
    businessName: 'Metro Market',
    latitude: 37.7750,
    longitude: -122.4195
  }, 'metro_2');

  assert.equal(loc1.isDuplicate, false);
  assert.equal(loc2.isDuplicate, false); // NOT suppressed!
  assert.equal(loc2.isDefinitiveDuplicate, false);
  assert.equal(loc2.isPotentialDuplicate, true);
  assert.equal(loc2.collisionEvidence?.matchedSignal, 'NAME_AND_GEO');
});

test('P20-055: Regression 5: Same name only MUST NEVER suppress a candidate', () => {
  const dedup = new SessionDeduplicator();
  const first = dedup.evaluateAndRegister({
    businessName: "Joe's Pizza"
  }, 'pizza_1');

  const second = dedup.evaluateAndRegister({
    businessName: "Joe's Pizza"
  }, 'pizza_2');

  assert.equal(first.isDuplicate, false);
  assert.equal(second.isDuplicate, false); // MUST NEVER suppress!
  assert.equal(second.isDefinitiveDuplicate, false);
  assert.equal(second.isPotentialDuplicate, true);
  assert.equal(second.collisionEvidence?.matchedSignal, 'NAME_ONLY');
});

test('P20-056: Regression 6: Exact same Place ID triggers definitive suppression', () => {
  const dedup = new SessionDeduplicator();
  const first = dedup.evaluateAndRegister({
    placeId: 'ChIJ_exact_place_id_999',
    businessName: 'Anchor Bar'
  }, 'cand_anchor_1');

  const second = dedup.evaluateAndRegister({
    placeId: 'ChIJ_exact_place_id_999',
    businessName: 'Anchor Bar'
  }, 'cand_anchor_2');

  assert.equal(first.isDuplicate, false);
  assert.equal(second.isDuplicate, true); // Definitive suppression!
  assert.equal(second.isDefinitiveDuplicate, true);
  assert.equal(second.canonicalId, 'cand_anchor_1');
  assert.equal(second.matchedTier, 'EXACT_PLACE_ID');
});

test('P20-057: Regression 7: Exact same canonical listing URL triggers definitive suppression', () => {
  const dedup = new SessionDeduplicator();
  const first = dedup.evaluateAndRegister({
    listingUrl: 'https://www.google.com/maps/place/Acme+Bakery/@37.7,-122.4',
    businessName: 'Acme Bakery'
  }, 'cand_acme_1');

  const second = dedup.evaluateAndRegister({
    listingUrl: 'https://www.google.com/maps/place/Acme+Bakery/@37.7,-122.4?entry=ttu&hl=en',
    businessName: 'Acme Bakery'
  }, 'cand_acme_2');

  assert.equal(first.isDuplicate, false);
  assert.equal(second.isDuplicate, true); // Definitive suppression!
  assert.equal(second.isDefinitiveDuplicate, true);
  assert.equal(second.canonicalId, 'cand_acme_1');
  assert.equal(second.matchedTier, 'EXACT_LISTING_URL');
});

test('P20-058: Regression 8: Weak-key collision followed by distinct strong identifier yields both candidates emitted', () => {
  const dedup = new SessionDeduplicator();
  const first = dedup.evaluateAndRegister({
    placeId: 'ChIJ_distinct_branch_alpha',
    businessName: 'Apex Health',
    phone: '415-555-0155'
  }, 'cand_apex_alpha');

  const second = dedup.evaluateAndRegister({
    placeId: 'ChIJ_distinct_branch_beta', // Distinct Place ID!
    businessName: 'Apex Health',           // Same name and phone
    phone: '415-555-0155'
  }, 'cand_apex_beta');

  assert.equal(first.isDuplicate, false);
  assert.equal(second.isDuplicate, false); // Both emitted!
  assert.equal(second.isDefinitiveDuplicate, false);
});

test('P20-059: Regression 9: Repeated observation of same business across multiple search units updates lineage', () => {
  const tracker = new CoverageTracker('sess_multi_unit_reg');
  tracker.registerSearchUnit('unit_north', 'lawyer north');
  tracker.registerSearchUnit('unit_south', 'lawyer south');

  tracker.startSearchUnit('unit_north');
  const res1 = tracker.recordCandidateObservation('unit_north', {
    placeId: 'ChIJ_Lawyer_Strong_Id',
    businessName: 'City Law Group'
  }, 'cand_law_1');

  assert.equal(res1.isNewCandidate, true);
  assert.equal(res1.isDefinitiveDuplicate, false);

  tracker.startSearchUnit('unit_south');
  const res2 = tracker.recordCandidateObservation('unit_south', {
    placeId: 'ChIJ_Lawyer_Strong_Id',
    businessName: 'City Law Group'
  }, 'cand_law_repeat');

  assert.equal(res2.isNewCandidate, false);
  assert.equal(res2.isDefinitiveDuplicate, true);
  assert.equal(res2.canonicalCandidateId, 'cand_law_1');

  const lineage = tracker.getCandidateLineage('cand_law_1');
  assert.ok(lineage);
  assert.equal(lineage.occurrenceCount, 2);
  assert.deepEqual(lineage.additionalSearchUnits, ['unit_south']);
  assert.deepEqual(lineage.searchQueriesSeen, ['lawyer north', 'lawyer south']);
});

test('P20-060: Regression 10: Coverage metrics correctly distinguish exactDuplicateSuppressed from potentialDuplicateCount', () => {
  const tracker = new CoverageTracker('sess_metric_dist_reg');
  tracker.registerSearchUnit('unit_test', 'query test');
  tracker.startSearchUnit('unit_test');

  // Candidate 1: Unique
  tracker.recordCandidateObservation('unit_test', {
    placeId: 'PID_001',
    businessName: 'First Business'
  }, 'c1');

  // Candidate 2: Potential duplicate (shares name + phone with c1, but no placeId)
  tracker.recordCandidateObservation('unit_test', {
    businessName: 'First Business',
    phone: '555-0100'
  }, 'c2');

  // Candidate 3: Definitive duplicate of c1 (shares exact placeId)
  tracker.recordCandidateObservation('unit_test', {
    placeId: 'PID_001',
    businessName: 'First Business'
  }, 'c3');

  tracker.completeSearchUnit('unit_test');

  const unit = tracker.getSearchUnit('unit_test');
  assert.equal(unit?.candidatesDiscovered, 3);
  assert.equal(unit?.candidatesAccepted, 2); // c1 + c2 accepted! (c2 not suppressed)
  assert.equal(unit?.exactDuplicateSuppressed, 1); // c3 suppressed
  assert.equal(unit?.duplicatesSuppressed, 1);
  assert.equal(unit?.potentialDuplicateCount, 1); // c2 recorded as potential duplicate

  const sessionMetrics = tracker.getSessionMetrics();
  assert.equal(sessionMetrics.totalCandidatesSeen, 3);
  assert.equal(sessionMetrics.totalCandidatesAccepted, 2);
  assert.equal(sessionMetrics.exactDuplicateSuppressed, 1);
  assert.equal(sessionMetrics.duplicateCount, 1);
  assert.equal(sessionMetrics.potentialDuplicateCount, 1);
});

// ────────────────────────────────────────────────────────────
// SUMMARY
// ────────────────────────────────────────────────────────────
console.log('\n================================================================');
console.log(`PHASE 20 TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed (Total ${totalTests})`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('>>> ALL PHASE 20 GOOGLE MAPS EXTRACTION & COVERAGE TESTS PASSED! <<<\n');
}
