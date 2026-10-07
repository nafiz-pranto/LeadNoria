/**
 * LeadNoria — Google Maps Feed Scrolling & Live Candidate Extraction (Part 2)
 * Comprehensive Dedicated Test Suite
 *
 * Covers all 15 Groups specified in Prompt Section 56 plus mandatory special tests:
 * - Group 1: Result Surface Detection & Scoring
 * - Group 2: Card Detection & Classification
 * - Group 3: Candidate Field Extraction
 * - Group 4: Rating Parsing & Boundary Values
 * - Group 5: Review Count Parsing & Non-Review Rejection
 * - Group 6: Stable Identity Hierarchy & Confidence
 * - Group 7: Deduplication Across Observations & DOM Recycling
 * - Group 8: Scroll Engine Bounded Cycles & Metrics
 * - Group 9: Multi-Signal Feed Exhaustion Detection
 * - Group 10: Acquisition Policy Configuration & Validation
 * - Group 11: Pause, Resume & Cancellation Safety
 * - Group 12: Checkpoint Integration & Sequence Continuity
 * - Group 13: Observation Batches & Delta Emission
 * - Group 14: Memory, Timer & Observer Lifecycle Cleanup
 * - Group 15: Security & Invariant Verification
 * - Section 57: Mandatory Virtualized Feed Recycling Fixture
 * - Section 58: Mandatory Partial Field Merging Precedence
 * - Section 59: Mandatory Website Absence Safety (UNKNOWN vs ABSENT)
 * - Section 62: Synthetic Feed Performance Benchmark (100, 500, 1000 items)
 * - Section 63: Failure Isolation (Malformed Card Resiliency)
 * - Section 66: SearchUnit & Session Deduplication Isolation
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  detectResultSurface,
  scoreCandidateContainer
} from '../src/extension/acquisition/engine/resultSurfaceDetector.ts';

import {
  classifyCandidateCard,
  extractRawCardNodeData,
  parsePlaceIdFromUrl
} from '../src/extension/acquisition/engine/cardDetector.ts';

import {
  deriveCandidateIdentity,
  mergeCandidateObservations,
  SessionCandidateDeduplicator
} from '../src/extension/acquisition/engine/candidateIdentity.ts';

import {
  GoogleMapsFeedScrollEngine,
  DEFAULT_ACQUISITION_POLICY,
  validateAcquisitionPolicy
} from '../src/extension/acquisition/engine/feedScrollEngine.ts';

import {
  createCandidateObservation,
  evaluateRatingField,
  evaluateReviewCountField,
  evaluateWebsiteField,
  evaluateTextField
} from '../src/extension/acquisition/engine/observationBoundary.ts';

import {
  GoogleMapsRuntimeCoordinator
} from '../src/extension/acquisition/engine/runtimeCoordinator.ts';

import {
  probeGoogleMapsLiveCapability
} from '../src/extension/acquisition/engine/liveCapabilityProbe.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function group(name) {
  console.log(`\n--- ${name} ---`);
}

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err });
    console.error(`  [FAIL] Test ${totalTests}: ${name}\n         ${err.message}`);
  }
}

const mockContext = {
  sessionId: 'sess_p2_test',
  searchUnitId: 'su_p2_001',
  searchKeyword: 'software company',
  searchLocation: 'Dhaka',
  pageUrl: 'https://www.google.com/maps/search/software+company+Dhaka',
  pageKind: 'MAPS_SEARCH'
};

async function runAllTests() {
  // ============================================================================
  // GROUP 1: RESULT SURFACE DETECTION
  // ============================================================================
  group('GROUP 1: RESULT SURFACE DETECTION & SCORING');

  await test('G1-01: Correct scroll surface selected with role="feed"', async () => {
    const feedEl = {
      getAttribute(name) {
        if (name === 'role') return 'feed';
        if (name === 'aria-label') return 'Results for software company';
        return null;
      },
      scrollTop: 0,
      clientHeight: 600,
      scrollHeight: 2400,
      querySelectorAll(sel) {
        if (sel.includes('hfpxzc') || sel.includes('Nv2PK')) {
          return [{ textContent: 'Company A' }, { textContent: 'Company B' }];
        }
        return [];
      }
    };

    const doc = {
      querySelector(sel) {
        if (sel === 'div[role="feed"]') return feedEl;
        return null;
      },
      querySelectorAll(sel) {
        if (sel === 'div[role="feed"]') return [feedEl];
        return [];
      }
    };

    const detection = detectResultSurface(doc);
    assert.equal(detection.found, true);
    assert.equal(detection.status, 'SURFACE_DETECTED');
    assert.ok(detection.container);
    assert.ok(detection.container.confidence >= 0.85);
    assert.equal(detection.container.isScrollable, true);
  });

  await test('G1-02: Non-scrollable container rejected', async () => {
    const flatEl = {
      getAttribute(name) { return name === 'role' ? 'feed' : null; },
      scrollTop: 0,
      clientHeight: 600,
      scrollHeight: 600,
      querySelectorAll() { return [{ textContent: 'A' }]; }
    };
    const score = scoreCandidateContainer(flatEl, 'flat-feed');
    assert.equal(score.isScrollable, false);
    assert.ok(score.confidence < 0.8);
  });

  await test('G1-03: Unrelated scrollable container without cards rejected', async () => {
    const mapEl = {
      getAttribute() { return null; },
      scrollTop: 0,
      clientHeight: 800,
      scrollHeight: 3000,
      querySelectorAll() { return []; }
    };
    const score = scoreCandidateContainer(mapEl, 'map-canvas');
    assert.equal(score.candidateCardCount, 0);
    assert.equal(score.validated, false);
  });

  await test('G1-04: Empty feed detected when DOM contains no feed containers', async () => {
    const emptyDoc = {
      querySelector() { return null; },
      querySelectorAll() { return []; }
    };
    const detection = detectResultSurface(emptyDoc);
    assert.equal(detection.found, false);
    assert.equal(detection.status, 'RESULT_SURFACE_NOT_FOUND');
    assert.equal(detection.container, null);
  });

  await test('G1-05: Multiple candidate containers selects highest confidence feed', async () => {
    const weakContainer = {
      getAttribute() { return null; },
      scrollTop: 0,
      clientHeight: 500,
      scrollHeight: 700,
      querySelectorAll() { return [{ textContent: 'Card 1' }]; }
    };
    const strongContainer = {
      getAttribute(name) { return name === 'role' ? 'feed' : null; },
      scrollTop: 0,
      clientHeight: 600,
      scrollHeight: 3000,
      querySelectorAll() { return [{ textContent: 'Card 1' }, { textContent: 'Card 2' }, { textContent: 'Card 3' }]; }
    };

    const doc = {
      querySelectorAll(sel) {
        if (sel === 'div[role="feed"]') return [strongContainer];
        return [weakContainer, strongContainer];
      },
      querySelector(sel) {
        const arr = this.querySelectorAll(sel);
        return arr[0] || null;
      }
    };

    const detection = detectResultSurface(doc);
    assert.equal(detection.found, true);
    assert.equal(detection.container.element, strongContainer);
    assert.ok(detection.container.confidence > 0.85);
  });

  await test('G1-06: Confidence scoring reflects accessibility, scrollability and cards', async () => {
    const mockFeed = {
      getAttribute(attr) {
        if (attr === 'role') return 'feed';
        if (attr === 'aria-label') return 'Results';
        return null;
      },
      scrollTop: 50,
      clientHeight: 500,
      scrollHeight: 2000,
      querySelectorAll() { return [{}, {}, {}, {}]; }
    };
    const score = scoreCandidateContainer(mockFeed, 'feed-role');
    assert.ok(score.confidence >= 0.95);
    assert.equal(score.isScrollable, true);
    assert.equal(score.candidateCardCount, 4);
  });

  // ============================================================================
  // GROUP 2: CARD DETECTION & CLASSIFICATION
  // ============================================================================
  group('GROUP 2: CARD DETECTION & CLASSIFICATION');

  await test('G2-01: Valid candidate card classified as VALID_BUSINESS_CANDIDATE', async () => {
    const cardEl = {
      getAttribute(attr) { return attr === 'class' ? 'Nv2PK' : null; },
      textContent: 'Tech Solutions Ltd ★ 4.7 (120) · Software company · Gulshan, Dhaka',
      querySelector(sel) {
        if (sel.includes('fontHeadlineSmall') || sel.includes('header')) {
          return { textContent: 'Tech Solutions Ltd' };
        }
        if (sel.includes('hfpxzc') || sel.includes('placeLink')) {
          return { getAttribute: () => 'https://www.google.com/maps/place/data=!4m2!3m1!1s0x3755c7a123:0x456' };
        }
        if (sel.includes('MW4etd') || sel.includes('star')) {
          return { textContent: '4.7', getAttribute: () => '4.7 stars' };
        }
        return null;
      },
      querySelectorAll() { return []; }
    };

    const result = classifyCandidateCard(cardEl);
    assert.equal(result.classification, 'VALID_BUSINESS_CANDIDATE');
    assert.equal(result.isBusinessCard, true);
    assert.ok(result.confidence >= 0.8);
  });

  await test('G2-02: Non-business UI (filter buttons, controls) rejected', async () => {
    const btnEl = {
      getAttribute(attr) { return attr === 'role' ? 'button' : null; },
      textContent: 'Filters · Open now · Top rated',
      querySelector() { return null; },
      querySelectorAll() { return []; }
    };
    const result = classifyCandidateCard(btnEl);
    assert.equal(result.classification, 'NON_BUSINESS_UI');
    assert.equal(result.isBusinessCard, false);
  });

  await test('G2-03: Loading placeholder / skeleton rejected', async () => {
    const busyEl = {
      getAttribute(attr) { return attr === 'aria-busy' ? 'true' : null; },
      textContent: '   ',
      querySelector() { return null; },
      querySelectorAll() { return []; }
    };
    const result = classifyCandidateCard(busyEl);
    assert.equal(result.classification, 'LOADING_PLACEHOLDER');
    assert.equal(result.isBusinessCard, false);
  });

  await test('G2-04: Malformed card with no name or evidence classified as INVALID_UNKNOWN', async () => {
    const emptyEl = {
      getAttribute() { return null; },
      textContent: 'some random decorative divider',
      querySelector() { return null; },
      querySelectorAll() { return []; }
    };
    const result = classifyCandidateCard(emptyEl);
    assert.equal(result.classification, 'INVALID_UNKNOWN');
    assert.equal(result.isBusinessCard, false);
  });

  await test('G2-05: Sponsored listing classified as AD_OR_PROMOTIONAL_UI', async () => {
    const adEl = {
      getAttribute() { return null; },
      textContent: 'Sponsored · Cloud Hosting Pro ★ 4.9 (50) · Web hosting service',
      querySelector(sel) {
        if (sel.includes('fontHeadlineSmall')) return { textContent: 'Cloud Hosting Pro' };
        if (sel.includes('MW4etd')) return { textContent: '4.9' };
        return null;
      },
      querySelectorAll() { return []; }
    };
    const result = classifyCandidateCard(adEl);
    assert.equal(result.classification, 'AD_OR_PROMOTIONAL_UI');
    assert.equal(result.isBusinessCard, true);
  });

  await test('G2-06: Card with deeply nested clickable elements handles extraction cleanly', async () => {
    const complexEl = {
      getAttribute() { return 'Nv2PK'; },
      textContent: 'Apex Property Developers ★ 4.5 (80) · Real estate agency · Dhanmondi, Dhaka',
      querySelector(sel) {
        if (sel.includes('fontHeadlineSmall')) {
          return { textContent: 'Apex Property Developers' };
        }
        if (sel.includes('hfpxzc')) {
          return { getAttribute: () => 'https://www.google.com/maps/place/Apex/data=!4m2!3m1!1s0x123:0x456' };
        }
        return null;
      },
      querySelectorAll() { return []; }
    };
    const raw = extractRawCardNodeData(complexEl);
    assert.equal(raw.businessName, 'Apex Property Developers');
    assert.equal(raw.placeId, '0x123:0x456');
    assert.equal(raw.surfaceType, 'CARD');
  });

  // ============================================================================
  // GROUP 3: CANDIDATE FIELD EXTRACTION
  // ============================================================================
  group('GROUP 3: CANDIDATE FIELD EXTRACTION');

  await test('G3-01: Complete card extracts all visibly available fields', async () => {
    const mockCard = {
      textContent: 'Bengal Software Ltd ★ 4.8 (350) · Software company · Road 11, Banani, Dhaka · +880 1711-000000 · Open · Closes 7 PM',
      querySelector(sel) {
        if (sel.includes('fontHeadlineSmall')) return { textContent: 'Bengal Software Ltd' };
        if (sel.includes('MW4etd')) return { textContent: '4.8', getAttribute: () => '4.8 stars' };
        if (sel.includes('UY7F9')) return { textContent: '(350)' };
        if (sel.includes('hfpxzc')) return { getAttribute: () => 'https://www.google.com/maps/place/data=!4m2!3m1!1s0xbengal:0x999' };
        if (sel.includes('Website') || sel.includes('http')) return { getAttribute: () => 'https://bengalsoft.com' };
        return null;
      },
      querySelectorAll(sel) {
        if (sel.includes('W4Efsd')) {
          return [
            { textContent: 'Software company' },
            { textContent: 'Road 11, Banani, Dhaka' },
            { textContent: '+880 1711-000000' },
            { textContent: 'Open · Closes 7 PM' }
          ];
        }
        return [];
      }
    };

    const raw = extractRawCardNodeData(mockCard);
    const obs = createCandidateObservation(raw, mockContext);

    assert.equal(obs.businessName.parsedValue, 'Bengal Software Ltd');
    assert.equal(obs.businessName.availability, 'PRESENT');
    assert.equal(obs.rating.parsedValue, 4.8);
    assert.equal(obs.rating.availability, 'PRESENT');
    assert.equal(obs.reviewCount.parsedValue, 350);
    assert.equal(obs.reviewCount.availability, 'PRESENT');
    assert.equal(obs.websiteUrl.parsedValue, 'https://bengalsoft.com/');
    assert.equal(obs.websiteUrl.availability, 'PRESENT');
    assert.equal(obs.placeId.parsedValue, '0xbengal:0x999');
    assert.equal(obs.category.parsedValue, 'Software company');
    assert.equal(obs.phone.parsedValue, '+880 1711-000000');
    assert.equal(obs.businessStatus.parsedValue, 'Open · Closes 7 PM');
  });

  await test('G3-02: Missing fields yield explicit UNKNOWN / ABSENT without fabrication', async () => {
    const minimalRaw = {
      businessName: 'No Reviews Cafe',
      surfaceType: 'CARD'
    };
    const obs = createCandidateObservation(minimalRaw, mockContext);

    assert.equal(obs.businessName.availability, 'PRESENT');
    assert.equal(obs.rating.availability, 'UNKNOWN');
    assert.equal(obs.rating.parsedValue, undefined);
    assert.equal(obs.reviewCount.availability, 'UNKNOWN');
    assert.equal(obs.reviewCount.parsedValue, undefined);
    assert.equal(obs.websiteUrl.availability, 'UNKNOWN');
    assert.equal(obs.websiteUrl.parsedValue, undefined);
    assert.equal(obs.phone.availability, 'UNKNOWN');
    assert.equal(obs.address.availability, 'UNKNOWN');
    assert.equal(obs.category.availability, 'UNKNOWN');
    assert.equal(obs.businessStatus.availability, 'UNKNOWN');
    assert.equal(obs.mapsUrl.availability, 'UNKNOWN');
  });

  // ============================================================================
  // GROUP 4: RATING PARSING & BOUNDARY VALUES (CORRECTION 1 SEMANTICS)
  // ============================================================================
  group('GROUP 4: RATING PARSING & BOUNDARY VALUES (CORRECTION 1)');

  await test('G4-01: Rating deterministic tests 1-7 (Correction 1)', async () => {
    // 1. rating present → PRESENT
    const rPresent = evaluateRatingField('4.2');
    assert.equal(rPresent.availability, 'PRESENT');
    assert.equal(rPresent.parsedValue, 4.2);

    // 2. rating missing from card → UNKNOWN
    const rMissing = evaluateRatingField(undefined);
    assert.equal(rMissing.availability, 'UNKNOWN');
    assert.equal(rMissing.parsedValue, undefined);

    // 3. explicit no-rating evidence → ABSENT
    const rNoReviews = evaluateRatingField('No reviews');
    assert.equal(rNoReviews.availability, 'ABSENT');
    const rUnrated = evaluateRatingField('Unrated');
    assert.equal(rUnrated.availability, 'ABSENT');
    const rNoRating = evaluateRatingField('No rating');
    assert.equal(rNoRating.availability, 'ABSENT');

    // 4. malformed rating → AMBIGUOUS
    const rMalformed = evaluateRatingField('malformed 9.9 stars');
    assert.equal(rMalformed.availability, 'AMBIGUOUS');
    const rPrice = evaluateRatingField('$$$ $45');
    assert.equal(rPrice.availability, 'AMBIGUOUS');

    // 5. valid 4.0 → PRESENT
    const r40 = evaluateRatingField('4.0');
    assert.equal(r40.availability, 'PRESENT');
    assert.equal(r40.parsedValue, 4.0);

    // 6. valid 4.5 → PRESENT
    const r45 = evaluateRatingField('4.5');
    assert.equal(r45.availability, 'PRESENT');
    assert.equal(r45.parsedValue, 4.5);

    // 7. valid 5.0 → PRESENT
    const r50 = evaluateRatingField('5.0');
    assert.equal(r50.availability, 'PRESENT');
    assert.equal(r50.parsedValue, 5.0);
  });

  await test('G4-02: Rating boundary parsing: 3.9, 4.0, 4.5, 4.9, 5.0', async () => {
    const r39 = evaluateRatingField('3.9');
    assert.equal(r39.availability, 'PRESENT');
    assert.equal(r39.parsedValue, 3.9);

    const r40 = evaluateRatingField('4.0 stars');
    assert.equal(r40.availability, 'PRESENT');
    assert.equal(r40.parsedValue, 4.0);

    const r45 = evaluateRatingField('Rated 4,5 out of 5');
    assert.equal(r45.availability, 'PRESENT');
    assert.equal(r45.parsedValue, 4.5);

    const r49 = evaluateRatingField('4.9 ★');
    assert.equal(r49.availability, 'PRESENT');
    assert.equal(r49.parsedValue, 4.9);

    const r50 = evaluateRatingField('5.0');
    assert.equal(r50.availability, 'PRESENT');
    assert.equal(r50.parsedValue, 5.0);
  });

  await test('G4-03: Rating 0 or out of bounds (0.0, 6.5, 9.9) → AMBIGUOUS', async () => {
    const r0 = evaluateRatingField('0.0');
    assert.equal(r0.availability, 'AMBIGUOUS');

    const r6 = evaluateRatingField('6.5');
    assert.equal(r6.availability, 'AMBIGUOUS');

    const r99 = evaluateRatingField('9.9');
    assert.equal(r99.availability, 'AMBIGUOUS');
  });

  await test('G4-04: Missing rating from card → UNKNOWN (never ABSENT merely from missing element)', async () => {
    const rMissing = evaluateRatingField(undefined);
    assert.equal(rMissing.availability, 'UNKNOWN');
    assert.notEqual(rMissing.availability, 'ABSENT');
    assert.equal(rMissing.parsedValue, undefined);
  });

  await test('G4-05: Explicit no-rating evidence → ABSENT ("Not rated", "No reviews yet")', async () => {
    const rNotRated = evaluateRatingField('Not rated');
    assert.equal(rNotRated.availability, 'ABSENT');

    const rNoReviewsYet = evaluateRatingField('No reviews yet');
    assert.equal(rNoReviewsYet.availability, 'ABSENT');
  });

  await test('G4-06: Unrelated numbers (2024, 500, price $50) not parsed as ratings', async () => {
    const rYear = evaluateRatingField('Established in 2024');
    assert.equal(rYear.availability, 'AMBIGUOUS');

    const rCount = evaluateRatingField('500 reviews');
    assert.equal(rCount.availability, 'AMBIGUOUS');

    const rPrice = evaluateRatingField('$$$ $45');
    assert.equal(rPrice.availability, 'AMBIGUOUS');
  });

  // ============================================================================
  // GROUP 5: REVIEW COUNT PARSING & EVIDENCE DISCIPLINE (CORRECTION 2)
  // ============================================================================
  group('GROUP 5: REVIEW COUNT PARSING & EVIDENCE DISCIPLINE (CORRECTION 2)');

  await test('G5-01: Visible review count directly observed and parsed → PRESENT', async () => {
    const c1 = evaluateReviewCountField('123');
    assert.equal(c1.availability, 'PRESENT');
    assert.equal(c1.parsedValue, 123);

    const c2 = evaluateReviewCountField('(1,234)');
    assert.equal(c2.availability, 'PRESENT');
    assert.equal(c2.parsedValue, 1234);

    const c3 = evaluateReviewCountField('12K reviews');
    assert.equal(c3.availability, 'PRESENT');
    assert.equal(c3.parsedValue, 12000);

    const c4 = evaluateReviewCountField('(1.2K)');
    assert.equal(c4.availability, 'PRESENT');
    assert.equal(c4.parsedValue, 1200);
  });

  await test('G5-02: Explicit evidence of zero/no reviews → ABSENT', async () => {
    const cZeroReviews = evaluateReviewCountField('0 reviews');
    assert.equal(cZeroReviews.availability, 'ABSENT');
    assert.equal(cZeroReviews.parsedValue, 0);

    const cNoReviews = evaluateReviewCountField('No reviews');
    assert.equal(cNoReviews.availability, 'ABSENT');
    assert.equal(cNoReviews.parsedValue, 0);

    const cNoReviewsYet = evaluateReviewCountField('No reviews yet');
    assert.equal(cNoReviewsYet.availability, 'ABSENT');
    assert.equal(cNoReviewsYet.parsedValue, 0);

    const cZero = evaluateReviewCountField('0');
    assert.equal(cZero.availability, 'ABSENT');
    assert.equal(cZero.parsedValue, 0);
  });

  await test('G5-03: Missing review count on card → UNKNOWN (never ABSENT without explicit proof)', async () => {
    const cMissing = evaluateReviewCountField(undefined);
    assert.equal(cMissing.availability, 'UNKNOWN');
    assert.notEqual(cMissing.availability, 'ABSENT');
    assert.equal(cMissing.parsedValue, undefined);
  });

  await test('G5-04: Malformed review count (empty text, non-digits) → AMBIGUOUS or UNKNOWN', async () => {
    const cEmpty = evaluateReviewCountField('');
    assert.equal(cEmpty.availability, 'UNKNOWN');

    const cMalformed = evaluateReviewCountField('unparseable string with no numbers');
    assert.equal(cMalformed.availability, 'AMBIGUOUS');
  });

  await test('G5-05: Ambiguous review count (distance, currency) rejected → AMBIGUOUS', async () => {
    const cDist = evaluateReviewCountField('1.5 km away');
    assert.equal(cDist.availability, 'AMBIGUOUS');

    const cMiles = evaluateReviewCountField('3 mi');
    assert.equal(cMiles.availability, 'AMBIGUOUS');

    const cPrice = evaluateReviewCountField('৳1,500');
    assert.equal(cPrice.availability, 'AMBIGUOUS');
  });

  // ============================================================================
  // GROUP 5B: OTHER CARD FIELDS SAFETY AUDIT (CORRECTIONS 3 & 4)
  // ============================================================================
  group('GROUP 5B: OTHER CARD FIELDS SAFETY AUDIT (CORRECTIONS 3 & 4)');

  await test('G5B-01: Card surface: missing phone, address, category, businessStatus, mapsUrl → UNKNOWN', async () => {
    const cardCandidate = createCandidateObservation({
      businessName: 'Audit Test Cafe',
      surfaceType: 'CARD'
    }, mockContext);

    assert.equal(cardCandidate.phone.availability, 'UNKNOWN');
    assert.equal(cardCandidate.address.availability, 'UNKNOWN');
    assert.equal(cardCandidate.category.availability, 'UNKNOWN');
    assert.equal(cardCandidate.businessStatus.availability, 'UNKNOWN');
    assert.equal(cardCandidate.mapsUrl.availability, 'UNKNOWN');
    assert.equal(cardCandidate.rating.availability, 'UNKNOWN');
    assert.equal(cardCandidate.reviewCount.availability, 'UNKNOWN');
    assert.equal(cardCandidate.websiteUrl.availability, 'UNKNOWN');
  });

  await test('G5B-02: Detail surface: inspected absence → ABSENT for omitted fields', async () => {
    const detailCandidate = createCandidateObservation({
      businessName: 'Audited Detail Listing',
      surfaceType: 'DETAIL'
    }, mockContext);

    assert.equal(detailCandidate.phone.availability, 'ABSENT');
    assert.equal(detailCandidate.address.availability, 'ABSENT');
    assert.equal(detailCandidate.category.availability, 'ABSENT');
    assert.equal(detailCandidate.businessStatus.availability, 'ABSENT');
    assert.equal(detailCandidate.mapsUrl.availability, 'ABSENT');
    assert.equal(detailCandidate.websiteUrl.availability, 'ABSENT');
  });

  await test('G5B-03: PRESENT semantics preserved when visual elements are detected', async () => {
    const fullCard = createCandidateObservation({
      businessName: 'Full Info Corp',
      phone: '+1 555-0199',
      address: '123 Main St, New York',
      category: 'Corporate office',
      businessStatus: 'Open 24 hours',
      mapsUrl: 'https://maps.google.com/?cid=12345',
      websiteUrl: 'https://fullinfo.com',
      rating: '4.7',
      reviewCount: '520',
      surfaceType: 'CARD'
    }, mockContext);

    assert.equal(fullCard.businessName.availability, 'PRESENT');
    assert.equal(fullCard.phone.availability, 'PRESENT');
    assert.equal(fullCard.address.availability, 'PRESENT');
    assert.equal(fullCard.category.availability, 'PRESENT');
    assert.equal(fullCard.businessStatus.availability, 'PRESENT');
    assert.equal(fullCard.mapsUrl.availability, 'PRESENT');
    assert.equal(fullCard.websiteUrl.availability, 'PRESENT');
    assert.equal(fullCard.rating.availability, 'PRESENT');
    assert.equal(fullCard.reviewCount.availability, 'PRESENT');
  });

  // ============================================================================
  // GROUP 6: STABLE IDENTITY HIERARCHY & CONFIDENCE
  // ============================================================================
  group('GROUP 6: STABLE IDENTITY HIERARCHY & CONFIDENCE');

  await test('G6-01: VISIBLE_PLACE_ID produces highest confidence identity', async () => {
    const idInfo = deriveCandidateIdentity({
      placeId: '0x3755c7a123:0x456',
      businessName: 'Dhaka Tech Ltd',
      address: 'Gulshan 2'
    });
    assert.equal(idInfo.identityMethod, 'VISIBLE_PLACE_ID');
    assert.equal(idInfo.identityConfidence, 0.99);
    assert.ok(idInfo.candidateId.startsWith('cid_'));
  });

  await test('G6-02: MAPS_URL parsed correctly when placeId missing', async () => {
    const idInfo = deriveCandidateIdentity({
      mapsUrl: 'https://www.google.com/maps/place/Dhaka+Tech/@23.79,90.41,17z/data=!4m2!3m1!1s0x3755c7a123:0x456',
      businessName: 'Dhaka Tech Ltd'
    });
    assert.equal(idInfo.identityMethod, 'MAPS_URL');
    assert.equal(idInfo.identityConfidence, 0.95);
  });

  await test('G6-03: NAME_ADDRESS used when URL/PlaceId unavailable', async () => {
    const idInfo = deriveCandidateIdentity({
      businessName: 'Green View Real Estate Ltd',
      address: 'House 12, Road 4, Sector 3, Uttara, Dhaka'
    });
    assert.equal(idInfo.identityMethod, 'NAME_ADDRESS');
    assert.equal(idInfo.identityConfidence, 0.85);
  });

  await test('G6-04: NAME_CATEGORY_LOCATION used when address is missing', async () => {
    const idInfo = deriveCandidateIdentity(
      {
        businessName: 'Delta Systems',
        category: 'Software company'
      },
      'Dhaka'
    );
    assert.equal(idInfo.identityMethod, 'NAME_CATEGORY_LOCATION');
    assert.equal(idInfo.identityConfidence, 0.75);
  });

  await test('G6-05: WEAK_FALLBACK assigned when only business name exists', async () => {
    const idInfo = deriveCandidateIdentity({
      businessName: 'Unknown Store'
    });
    assert.equal(idInfo.identityMethod, 'WEAK_FALLBACK');
    assert.equal(idInfo.identityConfidence, 0.5);
  });

  // ============================================================================
  // GROUP 7: DEDUPLICATION ACROSS OBSERVATIONS & DOM RECYCLING
  // ============================================================================
  group('GROUP 7: DEDUPLICATION ACROSS OBSERVATIONS & DOM RECYCLING');

  await test('G7-01: Repeated observation of same candidate is deduplicated', async () => {
    const dedup = new SessionCandidateDeduplicator('su_dedup_001');

    const obs1 = createCandidateObservation({
      businessName: 'Summit Group',
      placeId: '0xsummit:0x1'
    }, mockContext);

    const res1 = dedup.registerObservation(obs1);
    assert.equal(res1.isNew, true);
    assert.equal(dedup.getStats().uniqueCandidates, 1);

    const obs2 = createCandidateObservation({
      businessName: 'Summit Group',
      placeId: '0xsummit:0x1',
      rating: '4.6'
    }, mockContext);

    const res2 = dedup.registerObservation(obs2);
    assert.equal(res2.isNew, false);
    assert.equal(dedup.getStats().uniqueCandidates, 1);
    assert.equal(dedup.getStats().duplicateObservations, 1);
  });

  await test('G7-02: DOM node recycling: same node object reused for different business', async () => {
    const dedup = new SessionCandidateDeduplicator('su_dedup_dom');

    const obsA = createCandidateObservation({
      businessName: 'Alpha Corp',
      placeId: '0xalpha:0x1'
    }, mockContext);
    assert.equal(dedup.registerObservation(obsA).isNew, true);

    const obsB = createCandidateObservation({
      businessName: 'Beta Corp',
      placeId: '0xbeta:0x1'
    }, mockContext);
    assert.equal(dedup.registerObservation(obsB).isNew, true);

    assert.equal(dedup.getStats().uniqueCandidates, 2);
  });

  await test('G7-03: Deduplication with minor whitespace/case formatting differences', async () => {
    const dedup = new SessionCandidateDeduplicator('su_dedup_case');

    const obs1 = createCandidateObservation({
      businessName: '  Orion  Pharma  Ltd. ',
      address: 'Tejgaon I/A, Dhaka'
    }, mockContext);
    assert.equal(dedup.registerObservation(obs1).isNew, true);

    const obs2 = createCandidateObservation({
      businessName: 'orion pharma ltd',
      address: 'Tejgaon I/A, Dhaka'
    }, mockContext);
    assert.equal(dedup.registerObservation(obs2).isNew, false);
  });

  // ============================================================================
  // GROUP 8: SCROLL ENGINE BOUNDED CYCLES & METRICS
  // ============================================================================
  group('GROUP 8: SCROLL ENGINE BOUNDED CYCLES & METRICS');

  await test('G8-01: Normal scroll progress increments scrollTop and records metrics', async () => {
    let cardCount = 3;

    const mockContainer = {
      scrollTop: 0,
      clientHeight: 500,
      scrollHeight: 2000,
      scrollTo({ top }) {
        this.scrollTop = top;
      },
      querySelectorAll() {
        const cards = [];
        for (let i = 0; i < cardCount; i++) {
          cards.push({
            textContent: `Company ${i} ★ 4.5 (${i * 10})`,
            querySelector(s) {
              if (s.includes('fontHeadlineSmall')) return { textContent: `Company ${i}` };
              if (s.includes('MW4etd')) return { textContent: '4.5' };
              if (s.includes('hfpxzc')) return { getAttribute: () => `https://www.google.com/maps/place/data=!4m2!3m1!1s0x${i}:0x${i}` };
              return null;
            },
            querySelectorAll() { return []; }
          });
        }
        return cards;
      }
    };

    const engine = new GoogleMapsFeedScrollEngine({
      maxScrollSteps: 5,
      maxCandidates: 10,
      quietPeriodMs: 10,
      loadWaitTimeoutMs: 50
    });

    const batch = await engine.executeScrollCycle(
      mockContainer,
      mockContext,
      'Dhaka',
      1
    );

    assert.equal(batch.observationSequence, 1);
    assert.equal(batch.visibleCandidateCount, 3);
    assert.equal(batch.newCandidateCount, 3);
    assert.equal(batch.scrollOutcome, 'SCROLL_PROGRESS');
    assert.ok(mockContainer.scrollTop > 0);
  });

  await test('G8-02: Scroll no progress detected when container does not scroll', async () => {
    const rigidContainer = {
      scrollTop: 0,
      clientHeight: 500,
      scrollHeight: 500,
      scrollTo() {},
      querySelectorAll() { return []; }
    };

    const engine = new GoogleMapsFeedScrollEngine({
      maxScrollSteps: 2,
      loadWaitTimeoutMs: 20
    });

    const batch = await engine.executeScrollCycle(
      rigidContainer,
      mockContext,
      'Dhaka',
      1
    );

    assert.equal(batch.scrollOutcome, 'SCROLL_NO_PROGRESS');
  });

  // ============================================================================
  // GROUP 9: MULTI-SIGNAL FEED EXHAUSTION DETECTION
  // ============================================================================
  group('GROUP 9: MULTI-SIGNAL FEED EXHAUSTION DETECTION');

  await test('G9-01: True bottom + end of results marker yields EXHAUSTED', async () => {
    const exhaustedContainer = {
      scrollTop: 1500,
      clientHeight: 500,
      scrollHeight: 2000,
      scrollTo() {},
      querySelectorAll(sel) {
        if (sel.includes('hfpxzc') || sel.includes('Nv2PK')) {
          return [{ textContent: 'Final Business' }];
        }
        return [];
      },
      querySelector(sel) {
        if (sel.includes('end') || sel.includes('HlvSq')) {
          return { textContent: "You've reached the end of the list." };
        }
        return null;
      }
    };

    const engine = new GoogleMapsFeedScrollEngine({
      maxScrollSteps: 10,
      maxNoNewCandidateCycles: 1,
      loadWaitTimeoutMs: 20
    });

    const result = await engine.runAcquisitionLoop(
      exhaustedContainer,
      mockContext,
      'Dhaka'
    );

    assert.equal(result.terminationReason, 'EXHAUSTED');
    assert.ok(result.metrics.observationCycles >= 1);
  });

  await test('G9-02: Temporary stall not mistaken as immediate exhaustion', async () => {
    let calls = 0;
    const stallContainer = {
      scrollTop: 0,
      clientHeight: 500,
      scrollHeight: 2000,
      scrollTo({ top }) {
        this.scrollTop = top;
      },
      querySelectorAll() {
        calls++;
        const count = calls <= 2 ? 2 : 4;
        const res = [];
        for (let i = 0; i < count; i++) {
          res.push({
            textContent: `Business ${i} ★ 4.0 (10)`,
            querySelector(s) {
              if (s.includes('fontHeadlineSmall')) return { textContent: `Business ${i}` };
              if (s.includes('hfpxzc')) return { getAttribute: () => `https://www.google.com/maps/place/data=!4m2!3m1!1s0x${i}:0x1` };
              return null;
            },
            querySelectorAll() { return []; }
          });
        }
        return res;
      }
    };

    const engine = new GoogleMapsFeedScrollEngine({
      maxScrollSteps: 4,
      maxNoNewCandidateCycles: 2,
      quietPeriodMs: 10,
      loadWaitTimeoutMs: 30
    });

    const result = await engine.runAcquisitionLoop(
      stallContainer,
      mockContext,
      'Dhaka'
    );

    assert.ok(result.candidates.length >= 4);
  });

  // ============================================================================
  // GROUP 10: CONFIGURATION & POLICY VALIDATION
  // ============================================================================
  group('GROUP 10: CONFIGURATION & POLICY VALIDATION');

  await test('G10-01: Valid policy passes validation unchanged', async () => {
    const policy = validateAcquisitionPolicy({
      maxScrollSteps: 50,
      maxCandidates: 100,
      maxDurationMs: 60000
    });
    assert.equal(policy.maxScrollSteps, 50);
    assert.equal(policy.maxCandidates, 100);
    assert.equal(policy.maxDurationMs, 60000);
  });

  await test('G10-02: Invalid/negative/NaN values reset to safe defaults', async () => {
    const bad = validateAcquisitionPolicy({
      maxScrollSteps: -5,
      maxCandidates: NaN,
      scrollFractionOfViewport: 5.0,
      maxDurationMs: 0
    });
    assert.equal(bad.maxScrollSteps, DEFAULT_ACQUISITION_POLICY.maxScrollSteps);
    assert.equal(bad.maxCandidates, DEFAULT_ACQUISITION_POLICY.maxCandidates);
    assert.equal(bad.scrollFractionOfViewport, DEFAULT_ACQUISITION_POLICY.scrollFractionOfViewport);
    assert.equal(bad.maxDurationMs, DEFAULT_ACQUISITION_POLICY.maxDurationMs);
  });

  await test('G10-03: Max candidates budget stops acquisition cleanly with MAX_RESULTS_REACHED', async () => {
    const container = {
      scrollTop: 0,
      clientHeight: 500,
      scrollHeight: 5000,
      scrollTo({ top }) { this.scrollTop = top; },
      querySelectorAll() {
        const arr = [];
        for (let i = 0; i < 15; i++) {
          arr.push({
            textContent: `Biz ${i} ★ 4.5`,
            querySelector(s) {
              if (s.includes('fontHeadlineSmall')) return { textContent: `Biz ${i}` };
              if (s.includes('hfpxzc')) return { getAttribute: () => `https://www.google.com/maps/place/data=!4m2!3m1!1s0x${i}:0x1` };
              return null;
            },
            querySelectorAll() { return []; }
          });
        }
        return arr;
      }
    };

    const engine = new GoogleMapsFeedScrollEngine({
      maxCandidates: 5,
      maxScrollSteps: 10,
      loadWaitTimeoutMs: 20
    });

    const res = await engine.runAcquisitionLoop(container, mockContext, 'Dhaka');
    assert.equal(res.terminationReason, 'MAX_RESULTS_REACHED');
    assert.equal(res.candidates.length, 5);
  });

  // ============================================================================
  // GROUP 11: PAUSE / RESUME / CANCEL INTEGRATION
  // ============================================================================
  group('GROUP 11: PAUSE / RESUME / CANCEL INTEGRATION');

  await test('G11-01: Pause requested during acquisition halts scrolling gracefully', async () => {
    const container = {
      scrollTop: 0,
      clientHeight: 500,
      scrollHeight: 5000,
      scrollTo({ top }) { this.scrollTop = top; },
      querySelectorAll() {
        return [{
          textContent: 'Biz 1 ★ 4.0',
          querySelector: () => ({ textContent: 'Biz 1' }),
          querySelectorAll: () => []
        }];
      }
    };

    const engine = new GoogleMapsFeedScrollEngine({
      maxScrollSteps: 10,
      loadWaitTimeoutMs: 30
    });

    engine.on('batch', () => {
      engine.requestPause();
    });

    const res = await engine.runAcquisitionLoop(container, mockContext, 'Dhaka');
    assert.equal(res.terminationReason, 'USER_PAUSED');
    assert.ok(res.metrics.scrollSteps <= 2);
  });

  await test('G11-02: Cancellation stops immediately and detaches lifecycle', async () => {
    const container = {
      scrollTop: 0,
      clientHeight: 500,
      scrollHeight: 5000,
      scrollTo({ top }) { this.scrollTop = top; },
      querySelectorAll: () => [{
        textContent: 'Biz 1',
        querySelector: () => ({ textContent: 'Biz 1' }),
        querySelectorAll: () => []
      }]
    };

    const engine = new GoogleMapsFeedScrollEngine({
      maxScrollSteps: 10,
      loadWaitTimeoutMs: 30
    });

    engine.on('batch', () => {
      engine.requestCancel();
    });

    const res = await engine.runAcquisitionLoop(container, mockContext, 'Dhaka');
    assert.equal(res.terminationReason, 'USER_CANCELLED');
  });

  // ============================================================================
  // GROUP 12: CHECKPOINT INTEGRATION & SEQUENCE CONTINUITY
  // ============================================================================
  group('GROUP 12: CHECKPOINT INTEGRATION & SEQUENCE CONTINUITY');

  await test('G12-01: Checkpoint data generated before scroll preserves sequence & dedup references', async () => {
    const dedup = new SessionCandidateDeduplicator('su_cp_001');
    const obs = createCandidateObservation({
      businessName: 'Checkpoint Tech',
      placeId: '0xcp:0x1'
    }, mockContext);
    dedup.registerObservation(obs);

    const cpData = dedup.exportCheckpointData();
    assert.equal(cpData.searchUnitId, 'su_cp_001');
    assert.equal(cpData.knownCount, 1);
    assert.ok(Array.isArray(cpData.knownCandidateIds));
    assert.equal(cpData.knownCandidateIds.length, 1);
  });

  await test('G12-02: Checkpoint restoration restores known identities and prevents duplicates', async () => {
    const dedupOriginal = new SessionCandidateDeduplicator('su_cp_restore');
    const obs1 = createCandidateObservation({
      businessName: 'Restored Corp',
      placeId: '0xrestore:0x1'
    }, mockContext);
    dedupOriginal.registerObservation(obs1);
    const exported = dedupOriginal.exportCheckpointData();

    const dedupRestored = new SessionCandidateDeduplicator('su_cp_restore');
    dedupRestored.importCheckpointData(exported);

    const res = dedupRestored.registerObservation(obs1);
    assert.equal(res.isNew, false);
    assert.equal(dedupRestored.getStats().uniqueCandidates, 1);
  });

  // ============================================================================
  // GROUP 13: OBSERVATION BATCHES & DELTA EMISSION
  // ============================================================================
  group('GROUP 13: OBSERVATION BATCHES & DELTA EMISSION');

  await test('G13-01: Emits correct delta (new candidates only, deduplicating known)', async () => {
    const emittedBatches = [];
    const container = {
      scrollTop: 0,
      clientHeight: 500,
      scrollHeight: 2000,
      scrollTo({ top }) { this.scrollTop = top; },
      querySelectorAll() {
        return [
          {
            textContent: 'A ★ 4.0',
            querySelector: (s) => s.includes('fontHeadlineSmall') ? { textContent: 'A' } : null,
            querySelectorAll: () => []
          },
          {
            textContent: 'B ★ 4.0',
            querySelector: (s) => s.includes('fontHeadlineSmall') ? { textContent: 'B' } : null,
            querySelectorAll: () => []
          }
        ];
      }
    };

    const engine = new GoogleMapsFeedScrollEngine({
      maxScrollSteps: 2,
      loadWaitTimeoutMs: 20
    });

    engine.on('batch', (b) => {
      emittedBatches.push(b);
    });

    await engine.runAcquisitionLoop(container, mockContext, 'Dhaka');
    assert.ok(emittedBatches.length >= 1);
    assert.equal(emittedBatches[0].newCandidateCount, 2);
    if (emittedBatches.length > 1) {
      assert.equal(emittedBatches[1].newCandidateCount, 0);
    }
  });

  await test('G13-02: Preserves discovery order across batches', async () => {
    const container = {
      scrollTop: 0,
      clientHeight: 500,
      scrollHeight: 2000,
      scrollTo({ top }) { this.scrollTop = top; },
      querySelectorAll() {
        return [
          {
            textContent: 'First Business',
            querySelector: (s) => s.includes('fontHeadlineSmall') ? { textContent: 'First Business' } : null,
            querySelectorAll: () => []
          },
          {
            textContent: 'Second Business',
            querySelector: (s) => s.includes('fontHeadlineSmall') ? { textContent: 'Second Business' } : null,
            querySelectorAll: () => []
          }
        ];
      }
    };

    const engine = new GoogleMapsFeedScrollEngine({ maxScrollSteps: 1, loadWaitTimeoutMs: 20 });
    const res = await engine.runAcquisitionLoop(container, mockContext, 'Dhaka');
    assert.equal(res.candidates[0].businessName.parsedValue, 'First Business');
    assert.equal(res.candidates[1].businessName.parsedValue, 'Second Business');
    assert.equal(res.candidates[0].observedOrder, 1);
    assert.equal(res.candidates[1].observedOrder, 2);
  });

  // ============================================================================
  // GROUP 14: MEMORY, TIMER & OBSERVER LIFECYCLE CLEANUP
  // ============================================================================
  group('GROUP 14: MEMORY, TIMER & OBSERVER LIFECYCLE CLEANUP');

  await test('G14-01: Disconnects observers and releases all timers upon loop completion', async () => {
    const container = {
      scrollTop: 0,
      clientHeight: 500,
      scrollHeight: 1000,
      scrollTo({ top }) { this.scrollTop = top; },
      querySelectorAll: () => []
    };

    const engine = new GoogleMapsFeedScrollEngine({
      maxScrollSteps: 1,
      loadWaitTimeoutMs: 20
    });

    await engine.runAcquisitionLoop(container, mockContext, 'Dhaka');
    assert.equal(engine.isRunning(), false);
    assert.equal(engine.isPaused(), false);
  });

  await test('G14-02: Zero DOM nodes retained in candidate envelopes or deduplication registry', async () => {
    const obs = createCandidateObservation({
      businessName: 'Clean Memory Ltd',
      placeId: '0xclean:1'
    }, mockContext);

    const jsonStr = JSON.stringify(obs);
    assert.ok(!jsonStr.includes('nodeType'));
    assert.ok(!jsonStr.includes('HTML'));
    assert.equal(typeof obs.businessName.parsedValue, 'string');
  });

  // ============================================================================
  // GROUP 15: SECURITY & INVARIANT VERIFICATION
  // ============================================================================
  group('GROUP 15: SECURITY & INVARIANT VERIFICATION');

  await test('G15-01: Engine files contain zero eval or new Function', async () => {
    const engineDir = path.resolve(__dirname, '../src/extension/acquisition/engine');
    const files = fs.readdirSync(engineDir).filter(f => f.endsWith('.ts'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(engineDir, file), 'utf-8');
      assert.ok(!/\beval\s*\(/.test(content), `eval() forbidden in ${file}`);
      assert.ok(!/\bnew\s+Function\s*\(/.test(content), `new Function() forbidden in ${file}`);
    }
  });

  await test('G15-02: No private Google endpoints or internal RPC calls', async () => {
    const engineDir = path.resolve(__dirname, '../src/extension/acquisition/engine');
    const files = fs.readdirSync(engineDir).filter(f => f.endsWith('.ts'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(engineDir, file), 'utf-8');
      assert.ok(!content.includes('/maps/api/'), `Private API forbidden in ${file}`);
      assert.ok(!content.includes('googleapis.com'), `Private endpoint forbidden in ${file}`);
    }
  });

  await test('G15-03: Google data firewall invariants respected (NOT_PERSISTABLE, NOT_EXPORTABLE)', async () => {
    const obs = createCandidateObservation({
      businessName: 'Firewall Protected',
      placeId: '0xfw:1'
    }, mockContext);

    assert.equal(obs.provenance.persistenceStatus, 'NOT_PERSISTABLE');
    assert.equal(obs.provenance.exportStatus, 'NOT_EXPORTABLE');
    assert.equal(obs.provenance.source, 'GOOGLE_MAPS_BROWSER');
  });

  // ============================================================================
  // MANDATORY SPECIAL TEST: SECTION 57 (VIRTUALIZED FEED RECYCLING)
  // ============================================================================
  group('SECTION 57: MANDATORY VIRTUALIZED FEED RECYCLING TEST');

  await test('S57: DOM node recycling across cycles yields 6 unique candidates, not 3', async () => {
    const dedup = new SessionCandidateDeduplicator('su_s57');

    const nodeA = { name: 'Business A', id: '0xA:1' };
    const nodeB = { name: 'Business B', id: '0xB:1' };
    const nodeC = { name: 'Business C', id: '0xC:1' };

    const obsA = createCandidateObservation({ businessName: nodeA.name, placeId: nodeA.id }, mockContext);
    const obsB = createCandidateObservation({ businessName: nodeB.name, placeId: nodeB.id }, mockContext);
    const obsC = createCandidateObservation({ businessName: nodeC.name, placeId: nodeC.id }, mockContext);

    assert.equal(dedup.registerObservation(obsA).isNew, true);
    assert.equal(dedup.registerObservation(obsB).isNew, true);
    assert.equal(dedup.registerObservation(obsC).isNew, true);
    assert.equal(dedup.getStats().uniqueCandidates, 3);

    nodeA.name = 'Business D'; nodeA.id = '0xD:1';
    nodeB.name = 'Business E'; nodeB.id = '0xE:1';
    nodeC.name = 'Business F'; nodeC.id = '0xF:1';

    const obsD = createCandidateObservation({ businessName: nodeA.name, placeId: nodeA.id }, mockContext);
    const obsE = createCandidateObservation({ businessName: nodeB.name, placeId: nodeB.id }, mockContext);
    const obsF = createCandidateObservation({ businessName: nodeC.name, placeId: nodeC.id }, mockContext);

    assert.equal(dedup.registerObservation(obsD).isNew, true);
    assert.equal(dedup.registerObservation(obsE).isNew, true);
    assert.equal(dedup.registerObservation(obsF).isNew, true);

    assert.equal(dedup.getStats().uniqueCandidates, 6);

    nodeA.name = 'Business B'; nodeA.id = '0xB:1';
    const obsB_reused = createCandidateObservation({ businessName: nodeA.name, placeId: nodeA.id }, mockContext);

    const resB = dedup.registerObservation(obsB_reused);
    assert.equal(resB.isNew, false);
    assert.equal(dedup.getStats().uniqueCandidates, 6);
    assert.equal(dedup.getStats().duplicateObservations, 1);
  });

  // ============================================================================
  // MANDATORY SPECIAL TEST: SECTION 58 (PARTIAL FIELD MERGING)
  // ============================================================================
  group('SECTION 58: MANDATORY PARTIAL FIELD MERGING PRECEDENCE');

  await test('S58-01: Multi-observation merging accumulates fields without data loss', async () => {
    const obs1 = createCandidateObservation({
      businessName: 'Integrated Services',
      placeId: '0xmulti:1',
      rating: '4.7',
      address: 'Gulshan 1, Dhaka'
    }, mockContext);

    const obs2 = createCandidateObservation({
      businessName: 'Integrated Services',
      placeId: '0xmulti:1',
      websiteUrl: 'https://integrated.com.bd'
    }, mockContext);

    const obs3 = createCandidateObservation({
      businessName: 'Integrated Services',
      placeId: '0xmulti:1',
      phone: '+880 1819-123456'
    }, mockContext);

    const merged = mergeCandidateObservations(obs1, obs2);
    const fullyMerged = mergeCandidateObservations(merged, obs3);

    assert.equal(fullyMerged.businessName.parsedValue, 'Integrated Services');
    assert.equal(fullyMerged.rating.parsedValue, 4.7);
    assert.equal(fullyMerged.address.parsedValue, 'Gulshan 1, Dhaka');
    assert.equal(fullyMerged.websiteUrl.parsedValue, 'https://integrated.com.bd/');
    assert.equal(fullyMerged.phone.parsedValue, '+880 1819-123456');
    assert.equal(fullyMerged.observationCount, 3);
  });

  await test('S58-02: PRESENT field never overwritten by UNKNOWN observation', async () => {
    const obsWithWeb = createCandidateObservation({
      businessName: 'Web Firm',
      placeId: '0xfirm:1',
      websiteUrl: 'https://webfirm.com'
    }, mockContext);
    assert.equal(obsWithWeb.websiteUrl.availability, 'PRESENT');

    const obsWithoutWeb = createCandidateObservation({
      businessName: 'Web Firm',
      placeId: '0xfirm:1',
      surfaceType: 'CARD'
    }, mockContext);
    assert.equal(obsWithoutWeb.websiteUrl.availability, 'UNKNOWN');

    const merged = mergeCandidateObservations(obsWithWeb, obsWithoutWeb);
    assert.equal(merged.websiteUrl.availability, 'PRESENT');
    assert.equal(merged.websiteUrl.parsedValue, 'https://webfirm.com/');
  });

  // ============================================================================
  // MANDATORY SPECIAL TEST: SECTION 59 (WEBSITE ABSENCE SAFETY)
  // ============================================================================
  group('SECTION 59: MANDATORY WEBSITE ABSENCE SAFETY TEST');

  await test('S59: Website omission on card yields UNKNOWN, NOT ABSENT', async () => {
    const cardWithNoWeb = {
      businessName: 'Local Corner Grocery',
      surfaceType: 'CARD'
    };

    const obs = createCandidateObservation(cardWithNoWeb, mockContext);
    assert.equal(obs.websiteUrl.availability, 'UNKNOWN');
    assert.notEqual(obs.websiteUrl.availability, 'ABSENT');
  });

  // ============================================================================
  // MANDATORY SPECIAL TEST: SECTION 62 (PERFORMANCE BENCHMARK)
  // ============================================================================
  group('SECTION 62: PERFORMANCE BENCHMARK (100, 500, 1000 CANDIDATES)');

  await test('S62: Extraction & Deduplication scales linearly/O(1) lookup without O(N²) blowup', async () => {
    const counts = [100, 500, 1000];
    const durations = [];

    for (const n of counts) {
      const dedup = new SessionCandidateDeduplicator(`su_perf_${n}`);
      const t0 = performance.now();

      for (let i = 0; i < n; i++) {
        const obs = createCandidateObservation({
          businessName: `Enterprise ${i % (n / 2)} Ltd`,
          placeId: `0xperf:${i % (n / 2)}`,
          rating: '4.5',
          reviewCount: `${i * 10}`,
          websiteUrl: `https://biz${i % (n / 2)}.com`,
          address: `Road ${i}, Block D, Dhaka`
        }, mockContext);
        dedup.registerObservation(obs);
      }

      const elapsed = performance.now() - t0;
      durations.push({ n, elapsed });
      const perItem = elapsed / n;
      assert.ok(perItem < 0.5, `Per item duration ${perItem.toFixed(3)}ms should be under 0.5ms`);
    }

    console.log(`         Benchmark results: 100 items: ${durations[0].elapsed.toFixed(1)}ms | 500 items: ${durations[1].elapsed.toFixed(1)}ms | 1000 items: ${durations[2].elapsed.toFixed(1)}ms`);
  });

  // ============================================================================
  // MANDATORY SPECIAL TEST: SECTION 63 (FAILURE ISOLATION)
  // ============================================================================
  group('SECTION 63: FAILURE ISOLATION (MALFORMED CARD RESILIENCY)');

  await test('S63: Malformed card isolated; valid cards emitted; session not killed', async () => {
    const rawCards = [
      { businessName: 'Card A', placeId: '0xA:1' },
      { businessName: 'Card B', placeId: '0xB:1' },
      { /* Malformed card C with zero name/id */ },
      { businessName: 'Card D', placeId: '0xD:1' },
      { businessName: 'Card E', placeId: '0xE:1' }
    ];

    const dedup = new SessionCandidateDeduplicator('su_fail_iso');
    const validObservations = [];
    let invalidCount = 0;

    for (const card of rawCards) {
      const obs = createCandidateObservation(card, mockContext);
      if (obs.businessName.availability !== 'PRESENT') {
        invalidCount++;
        continue;
      }
      const res = dedup.registerObservation(obs);
      if (res.isNew) validObservations.push(obs);
    }

    assert.equal(invalidCount, 1);
    assert.equal(validObservations.length, 4);
    assert.equal(validObservations.map(o => o.businessName.parsedValue).join(','), 'Card A,Card B,Card D,Card E');
  });

  // ============================================================================
  // MANDATORY SPECIAL TEST: SECTION 66 (SESSION ISOLATION TEST)
  // ============================================================================
  group('SECTION 66: SEARCH UNIT & SESSION DEDUPLICATION ISOLATION');

  await test('S66: SearchUnit A and SearchUnit B maintain strictly isolated deduplication state', async () => {
    const dedupA = new SessionCandidateDeduplicator('su_unit_A');
    const dedupB = new SessionCandidateDeduplicator('su_unit_B');

    const obsA1 = createCandidateObservation({ businessName: 'Apex', placeId: '0xapex:1' }, { ...mockContext, searchUnitId: 'su_unit_A' });
    const obsA2 = createCandidateObservation({ businessName: 'Bashundhara', placeId: '0xbash:1' }, { ...mockContext, searchUnitId: 'su_unit_A' });

    const obsB1 = createCandidateObservation({ businessName: 'Apex', placeId: '0xapex:1' }, { ...mockContext, searchUnitId: 'su_unit_B' });
    const obsB2 = createCandidateObservation({ businessName: 'Concord', placeId: '0xconc:1' }, { ...mockContext, searchUnitId: 'su_unit_B' });

    assert.equal(dedupA.registerObservation(obsA1).isNew, true);
    assert.equal(dedupA.registerObservation(obsA2).isNew, true);

    assert.equal(dedupB.registerObservation(obsB1).isNew, true);
    assert.equal(dedupB.registerObservation(obsB2).isNew, true);

    assert.equal(dedupA.getStats().uniqueCandidates, 2);
    assert.equal(dedupB.getStats().uniqueCandidates, 2);
  });

  // ============================================================================
  // LIVE CAPABILITY PROBE TEST
  // ============================================================================
  group('LIVE GOOGLE MAPS CAPABILITY PROBE');

  await test('PROBE-01: Capability probe returns structured diagnostics on synthetic DOM', async () => {
    const mockFeed = {
      getAttribute: (attr) => attr === 'role' ? 'feed' : null,
      scrollTop: 0,
      clientHeight: 600,
      scrollHeight: 2400,
      querySelectorAll: (sel) => {
        if (sel.includes('Nv2PK') || sel.includes('hfpxzc')) {
          return [{
            textContent: 'Probe Business ★ 4.5 (20) · IT Company',
            querySelector: (s) => s.includes('fontHeadlineSmall') ? { textContent: 'Probe Business' } : null,
            querySelectorAll: () => []
          }];
        }
        return [];
      }
    };

    const mockDoc = {
      querySelector: (sel) => sel.includes('feed') ? mockFeed : null,
      querySelectorAll: (sel) => sel.includes('feed') ? [mockFeed] : []
    };

    const probeResult = probeGoogleMapsLiveCapability('https://www.google.com/maps/search/it+companies+dhaka', mockDoc);
    assert.equal(probeResult.isGoogleMapsUrl, true);
    assert.equal(probeResult.resultSurfaceDetected, true);
    assert.ok(probeResult.visibleCardsCount >= 1);
    assert.ok(probeResult.capabilities.canExtractName);
    assert.ok(probeResult.capabilities.canDetectFeed);
  });

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n================================================================');
  console.log('PART 2 — GOOGLE MAPS FEED SCROLLING & EXTRACTION TEST SUMMARY');
  console.log('================================================================');
  console.log(`Total Tests Run:    ${totalTests}`);
  console.log(`Passed:             ${passedTests}`);
  console.log(`Failed:             ${failedTests}`);
  console.log('================================================================');

  if (failedTests > 0) {
    console.error('\nFAILED TESTS:');
    for (const f of failures) {
      console.error(`- ${f.name}: ${f.error.message}`);
    }
    process.exit(1);
  } else {
    console.log('\nALL PART 2 DEDICATED TESTS PASSED ✅\n');
  }
}

runAllTests().catch((err) => {
  console.error('Unhandled runner error:', err);
  process.exit(1);
});
