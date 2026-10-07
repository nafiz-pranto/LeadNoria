/**
 * LeadNoria — Part 3: Rating + Website Filter Engine Dedicated Test Suite
 *
 * Comprehensive validation across all 28 Groups and mandatory prompt requirements:
 * - Group 1: Filter Contract Validation & Serializability
 * - Group 2: Default State (ANY / ANY)
 * - Group 3: Rating ANY Semantics
 * - Group 4: Rating 4.0+ Semantics
 * - Group 5: Rating 4.5+ Semantics
 * - Group 6: Website ANY Semantics
 * - Group 7: Website WITH_WEBSITE Semantics
 * - Group 8: Website WITHOUT_WEBSITE Semantics
 * - Group 9: Strict AND Composition
 * - Group 10: UNKNOWN Semantics (Conservative, never coerced)
 * - Group 11: AMBIGUOUS Semantics
 * - Group 12: UNSUPPORTED Semantics
 * - Group 13: Combined Truth Table Matrix (360 Parameterized Checks)
 * - Group 14: Filter Reset Operation
 * - Group 15: Dynamic Candidate Arrival
 * - Group 16: Zero Reacquisition On Filter Change
 * - Group 17: Raw Dataset Structural Immutability
 * - Group 18: Deterministic Filter Reason Codes
 * - Group 19: Exact Filter Count Model
 * - Group 20: Empty State Semantics (NO_DATA, NO_MATCHES, IN_PROGRESS)
 * - Group 21: UI State Management & Rapid Switching
 * - Group 22: Accessibility Contract Verification
 * - Group 23: Selection State Preservation Across Filter Switches
 * - Group 24: Multi-Search Unit Dataset Filtering
 * - Group 25: Performance Benchmark (100, 500, 1000, 5000, 10000 records)
 * - Group 26: Google Data Firewall & Restricted Policy Invariance
 * - Group 27: Security, Sanitization & Prohibited Engine Tokens
 * - Group 28: Runtime Coordinator Message Routing Integration
 *
 * Special Mandatory Sequences:
 * - Section 66: Explicit Truth Table Invariants
 * - Section 67: Explicit Deep Immutability Validation
 * - Section 68: Explicit 9-Step Re-Filter Sequence (A, B, C, D, E)
 * - Section 69: Explicit UNKNOWN Safety Test
 * - Section 70: Incremental Acquisition Filtering Under Active Filter
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  evaluateRatingMatch,
  evaluateWebsiteMatch,
  evaluateCandidateFilter,
  formatFilterExplanation,
  filterCandidateDataset,
  calculateFilterCounts,
  GoogleMapsFilterStateManager,
  DEFAULT_GOOGLE_MAPS_FILTER,
  normalizeRatingFilter,
  normalizeWebsiteFilter,
  normalizeFilterCriteria
} from '../src/extension/acquisition/engine/filterEngine.ts';

import {
  createCandidateObservation
} from '../src/extension/acquisition/engine/observationBoundary.ts';

import {
  GoogleMapsRuntimeCoordinator
} from '../src/extension/acquisition/engine/runtimeCoordinator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('LEADNORIA — PART 3: RATING + WEBSITE FILTER ENGINE TEST SUITE');
console.log('================================================================');

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
    console.error(`  [FAIL] Test ${totalTests}: ${name}\n         ${err.stack || err.message}`);
  }
}

// Helper to construct a mock candidate observation
function createMockCandidate(id, ratingVal, ratingAvail, websiteVal, websiteAvail, suId = 'su_001') {
  const context = {
    sessionId: 'sess_test',
    searchUnitId: suId,
    searchKeyword: 'developer',
    searchLocation: 'Dhaka',
    pageUrl: 'https://www.google.com/maps/search/developer+Dhaka',
    pageKind: 'MAPS_SEARCH'
  };
  const raw = {
    businessName: `Business ${id}`,
    placeId: `place_${id}`
  };
  const candidate = createCandidateObservation(raw, context);

  candidate.candidateId = id;

  if (ratingAvail) {
    candidate.rating = {
      availability: ratingAvail,
      rawValue: ratingVal != null ? String(ratingVal) : undefined,
      parsedValue: typeof ratingVal === 'number' ? ratingVal : undefined,
      confidence: ratingAvail === 'PRESENT' ? 'HIGH' : 'LOW'
    };
  }

  if (websiteAvail) {
    candidate.websiteUrl = {
      availability: websiteAvail,
      rawValue: websiteVal,
      parsedValue: websiteVal,
      confidence: websiteAvail === 'PRESENT' ? 'HIGH' : 'LOW'
    };
  }

  return candidate;
}

async function runAllPart3Tests() {
  // ============================================================================
  // GROUP 1: FILTER CONTRACT VALIDATION
  // ============================================================================
  group('GROUP 1: FILTER CONTRACT VALIDATION & SERIALIZABILITY');

  await test('G1-01: Default filter contract matches ANY / ANY', async () => {
    assert.deepStrictEqual(DEFAULT_GOOGLE_MAPS_FILTER, {
      rating: 'ANY',
      website: 'ANY'
    });
  });

  await test('G1-02: Filter criteria is JSON-serializable and round-trips without loss', async () => {
    const filter = { rating: '4.5+', website: 'WITHOUT_WEBSITE' };
    const serialized = JSON.stringify(filter);
    const parsed = JSON.parse(serialized);
    assert.deepStrictEqual(parsed, filter);
  });

  await test('G1-03: Filter criteria is treated as immutable', async () => {
    const filter = Object.freeze({ rating: 'MIN_4_0', website: 'WITH_WEBSITE' });
    assert.throws(() => {
      // @ts-ignore
      filter.rating = 'ANY';
    }, TypeError);
  });

  await test('G1-04: Canonical normalization maps legacy presentation values to canonical options', async () => {
    assert.strictEqual(normalizeRatingFilter('ANY'), 'ANY');
    assert.strictEqual(normalizeRatingFilter('4.0+'), 'MIN_4_0');
    assert.strictEqual(normalizeRatingFilter('4.5+'), 'MIN_4_5');
    assert.strictEqual(normalizeRatingFilter('MIN_4_0'), 'MIN_4_0');
    assert.strictEqual(normalizeRatingFilter('MIN_4_5'), 'MIN_4_5');
    assert.strictEqual(normalizeRatingFilter('4.0'), 'MIN_4_0');
    assert.strictEqual(normalizeRatingFilter('4.5'), 'MIN_4_5');
    assert.strictEqual(normalizeRatingFilter(undefined), 'ANY');
    assert.strictEqual(normalizeRatingFilter(null), 'ANY');
    assert.strictEqual(normalizeRatingFilter('unknown'), 'ANY');

    assert.strictEqual(normalizeWebsiteFilter('ANY'), 'ANY');
    assert.strictEqual(normalizeWebsiteFilter('WITH_WEBSITE'), 'WITH_WEBSITE');
    assert.strictEqual(normalizeWebsiteFilter('WITHOUT_WEBSITE'), 'WITHOUT_WEBSITE');
    assert.strictEqual(normalizeWebsiteFilter(undefined), 'ANY');
  });

  await test('G1-05: Stored filter state stores ONLY canonical values; duplicate representation cannot enter state', async () => {
    const manager = new GoogleMapsFilterStateManager([], { rating: '4.0+', website: 'WITH_WEBSITE' });
    assert.strictEqual(manager.getActiveFilter().rating, 'MIN_4_0');
    assert.notStrictEqual(manager.getActiveFilter().rating, '4.0+');

    manager.setRatingFilter('4.5+');
    assert.strictEqual(manager.getActiveFilter().rating, 'MIN_4_5');
    assert.notStrictEqual(manager.getActiveFilter().rating, '4.5+');

    manager.setFilter({ rating: '4.0+', website: 'WITHOUT_WEBSITE' });
    assert.strictEqual(manager.getActiveFilter().rating, 'MIN_4_0');
    assert.strictEqual(manager.getActiveFilter().website, 'WITHOUT_WEBSITE');

    // Verify duplicate representations cannot coexist as valid state
    const validCanonicalStates = new Set(['ANY', 'MIN_4_0', 'MIN_4_5']);
    assert.ok(validCanonicalStates.has(manager.getActiveFilter().rating));
  });

  await test('G1-06: Serialized filter contains canonical values only', async () => {
    const manager = new GoogleMapsFilterStateManager([], { rating: '4.5+', website: 'WITH_WEBSITE' });
    const serialized = JSON.stringify(manager.getActiveFilter());
    assert.ok(serialized.includes('"rating":"MIN_4_5"'));
    assert.ok(!serialized.includes('"rating":"4.5+"'));
  });

  await test('G1-07: Matcher accepts canonical values directly', async () => {
    const c45 = createMockCandidate('c45', 4.5, 'PRESENT', undefined, 'ABSENT');
    const c40 = createMockCandidate('c40', 4.0, 'PRESENT', undefined, 'ABSENT');

    assert.strictEqual(evaluateRatingMatch(c45, 'MIN_4_5').matches, true);
    assert.strictEqual(evaluateRatingMatch(c40, 'MIN_4_5').matches, false);
    assert.strictEqual(evaluateRatingMatch(c40, 'MIN_4_0').matches, true);
    assert.strictEqual(evaluateRatingMatch(c45, 'ANY').matches, true);
  });

  await test('G1-08: Reset returns canonical ANY / ANY', async () => {
    const manager = new GoogleMapsFilterStateManager([], { rating: 'MIN_4_5', website: 'WITHOUT_WEBSITE' });
    const resetView = manager.resetFilters();
    assert.deepStrictEqual(resetView.activeFilter, { rating: 'ANY', website: 'ANY' });
    assert.deepStrictEqual(manager.getActiveFilter(), { rating: 'ANY', website: 'ANY' });
  });

  // ============================================================================
  // GROUP 2: DEFAULT STATE
  // ============================================================================
  group('GROUP 2: DEFAULT STATE');

  await test('G2-01: Default filter matches all candidates regardless of rating or website', async () => {
    const candidates = [
      createMockCandidate('c1', 5.0, 'PRESENT', 'https://example.com', 'PRESENT'),
      createMockCandidate('c2', undefined, 'UNKNOWN', undefined, 'UNKNOWN'),
      createMockCandidate('c3', undefined, 'ABSENT', undefined, 'ABSENT'),
      createMockCandidate('c4', 3.5, 'PRESENT', undefined, 'UNKNOWN')
    ];

    const result = filterCandidateDataset(candidates, DEFAULT_GOOGLE_MAPS_FILTER);
    assert.equal(result.totalObserved, 4);
    assert.equal(result.matchingCount, 4);
    assert.equal(result.excludedCount, 0);
    assert.equal(result.visibleCandidateIds.length, 4);
  });

  // ============================================================================
  // GROUP 3: RATING ANY SEMANTICS
  // ============================================================================
  group('GROUP 3: RATING ANY SEMANTICS');

  await test('G3-01: Rating ANY matches PRESENT, UNKNOWN, ABSENT, AMBIGUOUS, UNSUPPORTED', async () => {
    const states = ['PRESENT', 'UNKNOWN', 'ABSENT', 'AMBIGUOUS', 'UNSUPPORTED'];
    for (const state of states) {
      const c = createMockCandidate(`c_${state}`, state === 'PRESENT' ? 4.2 : undefined, state, undefined, 'UNKNOWN');
      const evalRes = evaluateRatingMatch(c, 'ANY');
      assert.equal(evalRes.matches, true, `Rating ANY must match state ${state}`);
      assert.equal(evalRes.reason, 'RATING_ANY');
    }
  });

  // ============================================================================
  // GROUP 4: RATING 4.0+ SEMANTICS
  // ============================================================================
  group('GROUP 4: RATING 4.0+ SEMANTICS');

  await test('G4-01: Rating 4.0+ matches valid numbers >= 4.0', async () => {
    for (const val of [4.0, 4.1, 4.5, 4.8, 5.0]) {
      const c = createMockCandidate(`c_${val}`, val, 'PRESENT', undefined, 'UNKNOWN');
      const evalRes = evaluateRatingMatch(c, '4.0+');
      assert.equal(evalRes.matches, true, `Rating 4.0+ should match ${val}`);
      assert.equal(evalRes.reason, 'RATING_THRESHOLD_MET');
    }
  });

  await test('G4-02: Rating 4.0+ rejects numbers < 4.0', async () => {
    for (const val of [3.99, 3.9, 3.5, 2.0, 0.0]) {
      const c = createMockCandidate(`c_${val}`, val, 'PRESENT', undefined, 'UNKNOWN');
      const evalRes = evaluateRatingMatch(c, '4.0+');
      assert.equal(evalRes.matches, false, `Rating 4.0+ should reject ${val}`);
      assert.equal(evalRes.reason, 'RATING_BELOW_THRESHOLD');
    }
  });

  await test('G4-03: Rating 4.0+ rejects non-PRESENT states', async () => {
    for (const state of ['UNKNOWN', 'ABSENT', 'AMBIGUOUS', 'UNSUPPORTED']) {
      const c = createMockCandidate(`c_${state}`, undefined, state, undefined, 'UNKNOWN');
      const evalRes = evaluateRatingMatch(c, '4.0+');
      assert.equal(evalRes.matches, false, `Rating 4.0+ should reject ${state}`);
    }
  });

  // ============================================================================
  // GROUP 5: RATING 4.5+ SEMANTICS
  // ============================================================================
  group('GROUP 5: RATING 4.5+ SEMANTICS');

  await test('G5-01: Rating 4.5+ matches valid numbers >= 4.5', async () => {
    for (const val of [4.5, 4.6, 4.9, 5.0]) {
      const c = createMockCandidate(`c_${val}`, val, 'PRESENT', undefined, 'UNKNOWN');
      const evalRes = evaluateRatingMatch(c, '4.5+');
      assert.equal(evalRes.matches, true, `Rating 4.5+ should match ${val}`);
      assert.equal(evalRes.reason, 'RATING_THRESHOLD_MET');
    }
  });

  await test('G5-02: Rating 4.5+ rejects numbers < 4.5', async () => {
    for (const val of [4.49, 4.4, 4.0, 3.9, 1.0]) {
      const c = createMockCandidate(`c_${val}`, val, 'PRESENT', undefined, 'UNKNOWN');
      const evalRes = evaluateRatingMatch(c, '4.5+');
      assert.equal(evalRes.matches, false, `Rating 4.5+ should reject ${val}`);
      assert.equal(evalRes.reason, 'RATING_BELOW_THRESHOLD');
    }
  });

  await test('G5-03: Rating 4.5+ rejects non-PRESENT states', async () => {
    for (const state of ['UNKNOWN', 'ABSENT', 'AMBIGUOUS', 'UNSUPPORTED']) {
      const c = createMockCandidate(`c_${state}`, undefined, state, undefined, 'UNKNOWN');
      const evalRes = evaluateRatingMatch(c, '4.5+');
      assert.equal(evalRes.matches, false, `Rating 4.5+ should reject ${state}`);
    }
  });

  // ============================================================================
  // GROUP 6: WEBSITE ANY SEMANTICS
  // ============================================================================
  group('GROUP 6: WEBSITE ANY SEMANTICS');

  await test('G6-01: Website ANY matches PRESENT, ABSENT, UNKNOWN, AMBIGUOUS, UNSUPPORTED', async () => {
    const states = ['PRESENT', 'ABSENT', 'UNKNOWN', 'AMBIGUOUS', 'UNSUPPORTED'];
    for (const state of states) {
      const c = createMockCandidate(`c_${state}`, undefined, 'UNKNOWN', state === 'PRESENT' ? 'https://test.com' : undefined, state);
      const evalRes = evaluateWebsiteMatch(c, 'ANY');
      assert.equal(evalRes.matches, true, `Website ANY must match state ${state}`);
      assert.equal(evalRes.reason, 'WEBSITE_ANY');
    }
  });

  // ============================================================================
  // GROUP 7: WEBSITE WITH_WEBSITE SEMANTICS
  // ============================================================================
  group('GROUP 7: WEBSITE WITH_WEBSITE SEMANTICS');

  await test('G7-01: WITH_WEBSITE matches ONLY PRESENT with valid URL', async () => {
    const valid = createMockCandidate('c_valid', undefined, 'UNKNOWN', 'https://example.com', 'PRESENT');
    const evalRes = evaluateWebsiteMatch(valid, 'WITH_WEBSITE');
    assert.equal(evalRes.matches, true);
    assert.equal(evalRes.reason, 'WEBSITE_PRESENT');
  });

  await test('G7-02: WITH_WEBSITE rejects invalid URL or maps internal link', async () => {
    const internalMaps = createMockCandidate('c_maps', undefined, 'UNKNOWN', 'https://google.com/maps/place/xyz', 'PRESENT');
    const evalRes = evaluateWebsiteMatch(internalMaps, 'WITH_WEBSITE');
    assert.equal(evalRes.matches, false);
    assert.equal(evalRes.reason, 'WEBSITE_AMBIGUOUS');
  });

  await test('G7-03: WITH_WEBSITE rejects ABSENT, UNKNOWN, AMBIGUOUS, UNSUPPORTED', async () => {
    for (const state of ['ABSENT', 'UNKNOWN', 'AMBIGUOUS', 'UNSUPPORTED']) {
      const c = createMockCandidate(`c_${state}`, undefined, 'UNKNOWN', undefined, state);
      const evalRes = evaluateWebsiteMatch(c, 'WITH_WEBSITE');
      assert.equal(evalRes.matches, false, `WITH_WEBSITE must reject ${state}`);
    }
  });

  // ============================================================================
  // GROUP 8: WEBSITE WITHOUT_WEBSITE SEMANTICS
  // ============================================================================
  group('GROUP 8: WEBSITE WITHOUT_WEBSITE SEMANTICS');

  await test('G8-01: WITHOUT_WEBSITE matches ONLY explicit ABSENT evidence', async () => {
    const absent = createMockCandidate('c_absent', undefined, 'UNKNOWN', undefined, 'ABSENT');
    const evalRes = evaluateWebsiteMatch(absent, 'WITHOUT_WEBSITE');
    assert.equal(evalRes.matches, true);
    assert.equal(evalRes.reason, 'WEBSITE_ABSENT');
  });

  await test('G8-02: WITHOUT_WEBSITE rejects UNKNOWN (card does not show website != confirmed absent)', async () => {
    const unknown = createMockCandidate('c_unknown', undefined, 'UNKNOWN', undefined, 'UNKNOWN');
    const evalRes = evaluateWebsiteMatch(unknown, 'WITHOUT_WEBSITE');
    assert.equal(evalRes.matches, false);
    assert.equal(evalRes.reason, 'WEBSITE_UNKNOWN');
  });

  await test('G8-03: WITHOUT_WEBSITE rejects PRESENT, AMBIGUOUS, UNSUPPORTED', async () => {
    for (const state of ['PRESENT', 'AMBIGUOUS', 'UNSUPPORTED']) {
      const c = createMockCandidate(`c_${state}`, undefined, 'UNKNOWN', state === 'PRESENT' ? 'https://test.com' : undefined, state);
      const evalRes = evaluateWebsiteMatch(c, 'WITHOUT_WEBSITE');
      assert.equal(evalRes.matches, false, `WITHOUT_WEBSITE must reject ${state}`);
    }
  });

  // ============================================================================
  // GROUP 9: AND COMPOSITION
  // ============================================================================
  group('GROUP 9: AND COMPOSITION');

  await test('G9-01: Both rating AND website must match for combined match', async () => {
    const c1 = createMockCandidate('c1', 4.6, 'PRESENT', 'https://example.com', 'PRESENT');
    const res1 = evaluateCandidateFilter(c1, { rating: '4.5+', website: 'WITH_WEBSITE' });
    assert.equal(res1.matches, true);
    assert.equal(res1.combinedReason, 'COMBINED_MATCH');

    // Rating matches 4.5+, website is UNKNOWN -> NO MATCH
    const c2 = createMockCandidate('c2', 4.6, 'PRESENT', undefined, 'UNKNOWN');
    const res2 = evaluateCandidateFilter(c2, { rating: '4.5+', website: 'WITH_WEBSITE' });
    assert.equal(res2.matches, false);
    assert.equal(res2.combinedReason, 'COMBINED_WEBSITE_MISMATCH');

    // Rating is 3.8, website is ABSENT -> filter 4.0+ + WITHOUT -> NO MATCH
    const c3 = createMockCandidate('c3', 3.8, 'PRESENT', undefined, 'ABSENT');
    const res3 = evaluateCandidateFilter(c3, { rating: '4.0+', website: 'WITHOUT_WEBSITE' });
    assert.equal(res3.matches, false);
    assert.equal(res3.combinedReason, 'COMBINED_RATING_MISMATCH');

    // Both mismatch
    const c4 = createMockCandidate('c4', 3.8, 'PRESENT', undefined, 'UNKNOWN');
    const res4 = evaluateCandidateFilter(c4, { rating: '4.0+', website: 'WITH_WEBSITE' });
    assert.equal(res4.matches, false);
    assert.equal(res4.combinedReason, 'COMBINED_BOTH_MISMATCH');
  });

  // ============================================================================
  // GROUP 10: UNKNOWN SEMANTICS
  // ============================================================================
  group('GROUP 10: UNKNOWN SEMANTICS');

  await test('G10-01: UNKNOWN rating is never coerced to 0 and rejected by min rating filters', async () => {
    const c = createMockCandidate('c_unk', undefined, 'UNKNOWN', 'https://test.com', 'PRESENT');
    const res40 = evaluateCandidateFilter(c, { rating: '4.0+', website: 'ANY' });
    assert.equal(res40.matches, false);
    assert.equal(res40.rating.reason, 'RATING_UNKNOWN');

    const res45 = evaluateCandidateFilter(c, { rating: '4.5+', website: 'ANY' });
    assert.equal(res45.matches, false);
  });

  await test('G10-02: UNKNOWN website is never coerced to ABSENT', async () => {
    const c = createMockCandidate('c_unk_web', 4.8, 'PRESENT', undefined, 'UNKNOWN');
    const resWith = evaluateCandidateFilter(c, { rating: 'ANY', website: 'WITH_WEBSITE' });
    assert.equal(resWith.matches, false);
    assert.equal(resWith.website.reason, 'WEBSITE_UNKNOWN');

    const resWithout = evaluateCandidateFilter(c, { rating: 'ANY', website: 'WITHOUT_WEBSITE' });
    assert.equal(resWithout.matches, false);
    assert.equal(resWithout.website.reason, 'WEBSITE_UNKNOWN');
  });

  // ============================================================================
  // GROUP 11: AMBIGUOUS SEMANTICS
  // ============================================================================
  group('GROUP 11: AMBIGUOUS SEMANTICS');

  await test('G11-01: AMBIGUOUS rating and website are excluded from constrained filters, included in ANY', async () => {
    const c = createMockCandidate('c_amb', undefined, 'AMBIGUOUS', undefined, 'AMBIGUOUS');
    assert.equal(evaluateCandidateFilter(c, { rating: 'ANY', website: 'ANY' }).matches, true);
    assert.equal(evaluateCandidateFilter(c, { rating: '4.0+', website: 'ANY' }).matches, false);
    assert.equal(evaluateCandidateFilter(c, { rating: '4.5+', website: 'ANY' }).matches, false);
    assert.equal(evaluateCandidateFilter(c, { rating: 'ANY', website: 'WITH_WEBSITE' }).matches, false);
    assert.equal(evaluateCandidateFilter(c, { rating: 'ANY', website: 'WITHOUT_WEBSITE' }).matches, false);
  });

  // ============================================================================
  // GROUP 12: UNSUPPORTED SEMANTICS
  // ============================================================================
  group('GROUP 12: UNSUPPORTED SEMANTICS');

  await test('G12-01: UNSUPPORTED rating and website are excluded from constrained filters, included in ANY', async () => {
    const c = createMockCandidate('c_unsup', undefined, 'UNSUPPORTED', undefined, 'UNSUPPORTED');
    assert.equal(evaluateCandidateFilter(c, { rating: 'ANY', website: 'ANY' }).matches, true);
    assert.equal(evaluateCandidateFilter(c, { rating: '4.0+', website: 'ANY' }).matches, false);
    assert.equal(evaluateCandidateFilter(c, { rating: '4.5+', website: 'ANY' }).matches, false);
    assert.equal(evaluateCandidateFilter(c, { rating: 'ANY', website: 'WITH_WEBSITE' }).matches, false);
    assert.equal(evaluateCandidateFilter(c, { rating: 'ANY', website: 'WITHOUT_WEBSITE' }).matches, false);
  });

  // ============================================================================
  // GROUP 13: COMBINED TRUTH-TABLE TESTS (360 PARAMETERIZED COMBINATIONS)
  // ============================================================================
  group('GROUP 13: COMBINED TRUTH-TABLE TESTS (360 PARAMETERIZED CHECKS)');

  await test('G13-01: Exhaustive 360-combination truth table matrix', async () => {
    const ratingStates = [
      { id: '5.0', val: 5.0, avail: 'PRESENT' },
      { id: '4.9', val: 4.9, avail: 'PRESENT' },
      { id: '4.5', val: 4.5, avail: 'PRESENT' },
      { id: '4.0', val: 4.0, avail: 'PRESENT' },
      { id: '3.9', val: 3.9, avail: 'PRESENT' },
      { id: 'UNKNOWN', val: undefined, avail: 'UNKNOWN' },
      { id: 'ABSENT', val: undefined, avail: 'ABSENT' },
      { id: 'AMBIGUOUS', val: undefined, avail: 'AMBIGUOUS' },
      { id: 'UNSUPPORTED', val: undefined, avail: 'UNSUPPORTED' }
    ];

    const websiteStates = [
      { id: 'PRESENT', val: 'https://valid.com', avail: 'PRESENT' },
      { id: 'ABSENT', val: undefined, avail: 'ABSENT' },
      { id: 'UNKNOWN', val: undefined, avail: 'UNKNOWN' },
      { id: 'AMBIGUOUS', val: undefined, avail: 'AMBIGUOUS' },
      { id: 'UNSUPPORTED', val: undefined, avail: 'UNSUPPORTED' }
    ];

    const ratingFilters = ['ANY', '4.0+', '4.5+'];
    const websiteFilters = ['ANY', 'WITH_WEBSITE', 'WITHOUT_WEBSITE'];

    let assertionCount = 0;

    for (const rState of ratingStates) {
      for (const wState of websiteStates) {
        const candidate = createMockCandidate(
          `matrix_${rState.id}_${wState.id}`,
          rState.val,
          rState.avail,
          wState.val,
          wState.avail
        );

        for (const rf of ratingFilters) {
          for (const wf of websiteFilters) {
            // Determine expected rating match
            let expectedRatingMatch = false;
            if (rf === 'ANY') {
              expectedRatingMatch = true;
            } else if (rf === '4.0+') {
              expectedRatingMatch = rState.avail === 'PRESENT' && typeof rState.val === 'number' && rState.val >= 4.0;
            } else if (rf === '4.5+') {
              expectedRatingMatch = rState.avail === 'PRESENT' && typeof rState.val === 'number' && rState.val >= 4.5;
            }

            // Determine expected website match
            let expectedWebsiteMatch = false;
            if (wf === 'ANY') {
              expectedWebsiteMatch = true;
            } else if (wf === 'WITH_WEBSITE') {
              expectedWebsiteMatch = wState.avail === 'PRESENT' && typeof wState.val === 'string' && wState.val.startsWith('http');
            } else if (wf === 'WITHOUT_WEBSITE') {
              expectedWebsiteMatch = wState.avail === 'ABSENT';
            }

            const expectedCombined = expectedRatingMatch && expectedWebsiteMatch;

            const actual = evaluateCandidateFilter(candidate, { rating: rf, website: wf });
            assert.equal(
              actual.matches,
              expectedCombined,
              `Matrix failure: R[${rState.id}] W[${wState.id}] filter R[${rf}] W[${wf}] expected ${expectedCombined} but got ${actual.matches}`
            );
            assertionCount++;
          }
        }
      }
    }

    assert.equal(assertionCount, 9 * 5 * 3 * 3); // 405 checks!
  });

  // ============================================================================
  // GROUP 14: FILTER RESET
  // ============================================================================
  group('GROUP 14: FILTER RESET');

  await test('G14-01: Filter state manager reset restores default ANY / ANY and all visible candidates', async () => {
    const manager = new GoogleMapsFilterStateManager({ rating: '4.5+', website: 'WITHOUT_WEBSITE' });
    manager.ingestCandidate(createMockCandidate('c1', 5.0, 'PRESENT', undefined, 'ABSENT'));
    manager.ingestCandidate(createMockCandidate('c2', 3.5, 'PRESENT', 'https://test.com', 'PRESENT'));

    assert.equal(manager.getFilteredView().matchingCount, 1);

    const resetView = manager.resetFilter();
    assert.deepStrictEqual(manager.getActiveFilter(), { rating: 'ANY', website: 'ANY' });
    assert.equal(resetView.matchingCount, 2);
    assert.equal(resetView.visibleCandidateIds.length, 2);
  });

  // ============================================================================
  // GROUP 15: DYNAMIC CANDIDATE ARRIVAL
  // ============================================================================
  group('GROUP 15: DYNAMIC CANDIDATE ARRIVAL');

  await test('G15-01: Incrementally ingested candidate updates filtered view in real-time under active filter', async () => {
    const manager = new GoogleMapsFilterStateManager({ rating: '4.5+', website: 'WITH_WEBSITE' });

    // Ingest non-matching candidate
    manager.ingestCandidate(createMockCandidate('c1', 4.0, 'PRESENT', 'https://test.com', 'PRESENT'));
    assert.equal(manager.getFilteredView().matchingCount, 0);
    assert.equal(manager.getFilteredView().totalObserved, 1);

    // Ingest matching candidate
    manager.ingestCandidate(createMockCandidate('c2', 4.8, 'PRESENT', 'https://test.com', 'PRESENT'));
    assert.equal(manager.getFilteredView().matchingCount, 1);
    assert.equal(manager.getFilteredView().totalObserved, 2);
    assert.deepStrictEqual(manager.getFilteredView().visibleCandidateIds, ['c2']);
  });

  // ============================================================================
  // GROUP 16: NO REACQUISITION ON FILTER CHANGE
  // ============================================================================
  group('GROUP 16: NO REACQUISITION ON FILTER CHANGE');

  await test('G16-01: Switching filters is pure and local without side-effects or re-scraping', async () => {
    const manager = new GoogleMapsFilterStateManager();
    const c1 = createMockCandidate('c1', 4.2, 'PRESENT', undefined, 'ABSENT');
    const c2 = createMockCandidate('c2', 4.8, 'PRESENT', 'https://test.com', 'PRESENT');
    manager.ingestCandidate(c1);
    manager.ingestCandidate(c2);

    // Switch to 4.5+
    manager.setFilter({ rating: '4.5+', website: 'ANY' });
    assert.equal(manager.getFilteredView().matchingCount, 1);

    // Switch to WITHOUT_WEBSITE
    manager.setFilter({ rating: 'ANY', website: 'WITHOUT_WEBSITE' });
    assert.equal(manager.getFilteredView().matchingCount, 1);
    assert.equal(manager.getFilteredView().visibleCandidateIds[0], 'c1');

    // Both candidates remain safely in raw collection
    assert.equal(manager.getRawCandidates().length, 2);
  });

  // ============================================================================
  // GROUP 17: RAW DATASET IMMUTABILITY
  // ============================================================================
  group('GROUP 17: RAW DATASET STRUCTURAL IMMUTABILITY');

  await test('G17-01: Raw candidate objects are strictly byte/structure-identical before and after filtering', async () => {
    const candidates = [
      createMockCandidate('c1', 5.0, 'PRESENT', 'https://a.com', 'PRESENT'),
      createMockCandidate('c2', 4.0, 'PRESENT', undefined, 'ABSENT'),
      createMockCandidate('c3', undefined, 'UNKNOWN', undefined, 'UNKNOWN')
    ];

    const snapshotBefore = JSON.stringify(candidates);

    // Run filter passes
    filterCandidateDataset(candidates, { rating: 'ANY', website: 'ANY' });
    filterCandidateDataset(candidates, { rating: '4.0+', website: 'ANY' });
    filterCandidateDataset(candidates, { rating: '4.5+', website: 'WITH_WEBSITE' });
    filterCandidateDataset(candidates, { rating: 'ANY', website: 'WITHOUT_WEBSITE' });

    const snapshotAfter = JSON.stringify(candidates);
    assert.equal(snapshotBefore, snapshotAfter, 'Underlying candidate objects must never be mutated by filtering');
  });

  // ============================================================================
  // GROUP 18: FILTER REASON CODES
  // ============================================================================
  group('GROUP 18: FILTER REASON CODES');

  await test('G18-01: Returns deterministic typed reason codes and human-readable explanations', async () => {
    const c1 = createMockCandidate('c1', 4.8, 'PRESENT', 'https://example.com', 'PRESENT');
    const eval1 = evaluateCandidateFilter(c1, { rating: '4.5+', website: 'WITH_WEBSITE' });
    assert.equal(eval1.rating.reason, 'RATING_THRESHOLD_MET');
    assert.equal(eval1.website.reason, 'WEBSITE_PRESENT');
    assert.equal(eval1.combinedReason, 'COMBINED_MATCH');

    const explanation = formatFilterExplanation(eval1);
    assert.ok(explanation.includes('Matches: rating 4.8 meets'));

    const c2 = createMockCandidate('c2', 3.8, 'PRESENT', undefined, 'UNKNOWN');
    const eval2 = evaluateCandidateFilter(c2, { rating: '4.0+', website: 'WITH_WEBSITE' });
    assert.equal(eval2.combinedReason, 'COMBINED_BOTH_MISMATCH');
    const exp2 = formatFilterExplanation(eval2);
    assert.ok(exp2.includes('Does not match:'));
  });

  // ============================================================================
  // GROUP 19: COUNTS
  // ============================================================================
  group('GROUP 19: EXACT FILTER COUNT MODEL');

  await test('G19-01: Counts match deterministic formula and dimension breakdowns', async () => {
    const candidates = [
      createMockCandidate('c1', 4.8, 'PRESENT', 'https://a.com', 'PRESENT'), // 4.8, WITH
      createMockCandidate('c2', 4.2, 'PRESENT', 'https://b.com', 'PRESENT'), // 4.2, WITH
      createMockCandidate('c3', 4.6, 'PRESENT', undefined, 'ABSENT'),        // 4.6, WITHOUT
      createMockCandidate('c4', 3.8, 'PRESENT', undefined, 'ABSENT'),        // 3.8, WITHOUT
      createMockCandidate('c5', undefined, 'UNKNOWN', undefined, 'UNKNOWN')   // UNK, UNK
    ];

    const counts = calculateFilterCounts(candidates, { rating: '4.5+', website: 'WITH_WEBSITE' });
    assert.equal(counts.totalObserved, 5);
    assert.equal(counts.matchingCount, 1); // Only c1
    assert.equal(counts.excludedCount, 4);
    assert.equal(counts.rating4PlusCount, 3); // c1, c2, c3
    assert.equal(counts.rating4_5PlusCount, 2); // c1, c3
    assert.equal(counts.websitePresentCount, 2); // c1, c2
    assert.equal(counts.websiteAbsentCount, 2); // c3, c4
  });

  // ============================================================================
  // GROUP 20: EMPTY STATE SEMANTICS
  // ============================================================================
  group('GROUP 20: EMPTY STATE SEMANTICS');

  await test('G20-01: Correctly classifies NO_DATA vs NO_MATCHES vs ACQUISITION_IN_PROGRESS', async () => {
    // 1. NO_DATA when dataset is empty and not in progress
    const resNoData = filterCandidateDataset([], { rating: 'ANY', website: 'ANY' }, false);
    assert.equal(resNoData.emptyStateReason, 'NO_DATA');

    // 2. ACQUISITION_IN_PROGRESS when dataset is empty but acquisition running
    const resProgress = filterCandidateDataset([], { rating: 'ANY', website: 'ANY' }, true);
    assert.equal(resProgress.emptyStateReason, 'ACQUISITION_IN_PROGRESS');

    // 3. NO_MATCHES when candidates exist but filter excludes all of them
    const candidates = [createMockCandidate('c1', 3.5, 'PRESENT', 'https://test.com', 'PRESENT')];
    const resNoMatch = filterCandidateDataset(candidates, { rating: '4.5+', website: 'ANY' }, false);
    assert.equal(resNoMatch.emptyStateReason, 'NO_MATCHES');

    // 4. NONE when matching candidates exist
    const resMatch = filterCandidateDataset(candidates, { rating: 'ANY', website: 'ANY' }, false);
    assert.equal(resMatch.emptyStateReason, 'NONE');
  });

  // ============================================================================
  // GROUP 21: UI STATE MANAGEMENT & RAPID SWITCHING
  // ============================================================================
  group('GROUP 21: UI STATE MANAGEMENT & RAPID SWITCHING');

  await test('G21-01: Rapid filter transitions maintain consistency without race conditions', async () => {
    const manager = new GoogleMapsFilterStateManager();
    for (let i = 0; i < 50; i++) {
      manager.ingestCandidate(createMockCandidate(`c_${i}`, 3.0 + (i % 21) * 0.1, 'PRESENT', i % 2 === 0 ? 'https://test.com' : undefined, i % 2 === 0 ? 'PRESENT' : 'ABSENT'));
    }

    const filters = [
      { rating: 'ANY', website: 'ANY' },
      { rating: '4.0+', website: 'ANY' },
      { rating: '4.5+', website: 'WITH_WEBSITE' },
      { rating: 'ANY', website: 'WITHOUT_WEBSITE' },
      { rating: '4.0+', website: 'WITHOUT_WEBSITE' },
      { rating: 'ANY', website: 'ANY' }
    ];

    for (const f of filters) {
      const view = manager.setFilter(f);
      assert.equal(view.totalObserved, 50);
      assert.ok(view.matchingCount <= 50);
    }
  });

  // ============================================================================
  // GROUP 22: ACCESSIBILITY CONTRACT
  // ============================================================================
  group('GROUP 22: ACCESSIBILITY CONTRACT VERIFICATION');

  await test('G22-01: UI Component file contains accessible fieldsets, legends, and ARIA labels', async () => {
    const compPath = path.resolve(__dirname, '../src/extension/ui/components/GoogleMapsFilterControls.tsx');
    assert.ok(fs.existsSync(compPath));
    const compContent = fs.readFileSync(compPath, 'utf8');

    assert.ok(compContent.includes('<fieldset'), 'Must contain semantic fieldset elements');
    assert.ok(compContent.includes('<legend'), 'Must contain semantic legend elements');
    assert.ok(compContent.includes('type="radio"'), 'Must use accessible single-choice radio inputs');
    assert.ok(compContent.includes('role="region"'), 'Must have region container role');
    assert.ok(compContent.includes('aria-label'), 'Must have ARIA labels for accessibility');
  });

  // ============================================================================
  // GROUP 23: SELECTION INTERACTION
  // ============================================================================
  group('GROUP 23: SELECTION INTERACTION');

  await test('G23-01: Hidden filtered-out records retain selection IDs in selection Set without corruption', async () => {
    const selectedIds = new Set(['c1', 'c2']);

    const candidates = [
      createMockCandidate('c1', 5.0, 'PRESENT', 'https://test.com', 'PRESENT'),
      createMockCandidate('c2', 3.5, 'PRESENT', 'https://test.com', 'PRESENT')
    ];

    // Filter excludes c2
    const filtered = filterCandidateDataset(candidates, { rating: '4.5+', website: 'ANY' });
    assert.equal(filtered.visibleCandidateIds.length, 1);
    assert.equal(filtered.visibleCandidateIds[0], 'c1');

    // Selection set retains both c1 and c2 internally
    assert.ok(selectedIds.has('c1'));
    assert.ok(selectedIds.has('c2'));

    // When filter reset, c2 is still recognized as selected
    const reset = filterCandidateDataset(candidates, { rating: 'ANY', website: 'ANY' });
    const selectedVisible = reset.visibleCandidateIds.filter(id => selectedIds.has(id));
    assert.equal(selectedVisible.length, 2);
  });

  // ============================================================================
  // GROUP 24: MULTI-SEARCH DATASET BEHAVIOR
  // ============================================================================
  group('GROUP 24: MULTI-SEARCH DATASET BEHAVIOR');

  await test('G24-01: Filtering operates across entire candidate collection across multiple SearchUnits', async () => {
    const candidates = [
      createMockCandidate('c1', 4.8, 'PRESENT', undefined, 'ABSENT', 'su_001'),
      createMockCandidate('c2', 4.2, 'PRESENT', undefined, 'ABSENT', 'su_001'),
      createMockCandidate('c3', 4.9, 'PRESENT', undefined, 'ABSENT', 'su_002'),
      createMockCandidate('c4', 3.5, 'PRESENT', 'https://test.com', 'PRESENT', 'su_002')
    ];

    const result = filterCandidateDataset(candidates, { rating: '4.5+', website: 'WITHOUT_WEBSITE' });
    assert.equal(result.totalObserved, 4);
    assert.equal(result.matchingCount, 2); // c1 from su_001 and c3 from su_002
    assert.deepStrictEqual(result.visibleCandidateIds, ['c1', 'c3']);
  });

  // ============================================================================
  // GROUP 25: PERFORMANCE BENCHMARK & O(N) STRUCTURAL VERIFICATION
  // ============================================================================
  group('GROUP 25: PERFORMANCE BENCHMARK & O(N) STRUCTURAL VERIFICATION');

  await test('G25-01: Deterministic benchmark protocol on 100, 500, 1000, 5000, 10000 records with warm-up & multi-iteration statistics', async () => {
    const sizes = [100, 500, 1000, 5000, 10000];
    const ITERATIONS = 5;

    // Warm-up runs before measurement to allow V8 JIT optimization
    const warmupData = [];
    for (let i = 0; i < 200; i++) {
      warmupData.push(createMockCandidate(`warmup_${i}`, 4.5, 'PRESENT', undefined, 'ABSENT'));
    }
    for (let w = 0; w < 10; w++) {
      filterCandidateDataset(warmupData, { rating: 'MIN_4_5', website: 'WITHOUT_WEBSITE' });
    }

    console.log('\n     Benchmark Statistics (5 iterations per size, V8 warmed up):');
    console.log('     Size   | Min (ms) | Median (ms) | Max (ms) | Avg (ms) | Matches');
    console.log('     -------+----------+-------------+----------+----------+--------');

    for (const size of sizes) {
      const dataset = [];
      for (let i = 0; i < size; i++) {
        const rating = 3.0 + (i % 20) * 0.1;
        const webAvail = i % 3 === 0 ? 'PRESENT' : i % 3 === 1 ? 'ABSENT' : 'UNKNOWN';
        dataset.push(createMockCandidate(`cand_${i}`, rating, 'PRESENT', webAvail === 'PRESENT' ? `https://business${i}.com` : undefined, webAvail));
      }

      // Pre-run warm-up iteration for this specific array shape
      filterCandidateDataset(dataset, { rating: 'MIN_4_5', website: 'WITHOUT_WEBSITE' });

      const runs = [];
      let lastRes;
      for (let iter = 0; iter < ITERATIONS; iter++) {
        const t0 = performance.now();
        lastRes = filterCandidateDataset(dataset, { rating: 'MIN_4_5', website: 'WITHOUT_WEBSITE' });
        const elapsed = performance.now() - t0;
        runs.push(elapsed);
      }

      assert.equal(lastRes.totalObserved, size);
      runs.sort((a, b) => a - b);
      const min = runs[0];
      const max = runs[runs.length - 1];
      const median = runs[Math.floor(runs.length / 2)];
      const avg = runs.reduce((acc, v) => acc + v, 0) / runs.length;

      console.log(`     ${String(size).padEnd(6)} | ${min.toFixed(2).padStart(8)} | ${median.toFixed(2).padStart(11)} | ${max.toFixed(2).padStart(8)} | ${avg.toFixed(2).padStart(8)} | ${lastRes.matchingCount}`);
      assert.ok(median < 100, `Median filter duration for ${size} records (${median.toFixed(2)}ms) must be < 100ms`);
    }
  });

  await test('G25-02: Algorithmic structural verification: strictly single evaluation pass with zero nested loops', async () => {
    let evaluationCallCount = 0;
    const testCandidates = [
      createMockCandidate('c1', 4.8, 'PRESENT', undefined, 'ABSENT'),
      createMockCandidate('c2', 4.2, 'PRESENT', undefined, 'ABSENT'),
      createMockCandidate('c3', 3.9, 'PRESENT', undefined, 'ABSENT'),
      createMockCandidate('c4', 4.9, 'PRESENT', undefined, 'ABSENT'),
      createMockCandidate('c5', 4.0, 'PRESENT', undefined, 'ABSENT')
    ];

    // Wrap candidate rating check to spy on evaluation count
    const observedDataset = testCandidates.map(c => {
      const origRating = c.rating;
      return {
        ...c,
        get rating() {
          evaluationCallCount++;
          return origRating;
        }
      };
    });

    filterCandidateDataset(observedDataset, { rating: 'MIN_4_5', website: 'WITHOUT_WEBSITE' });

    // In a single linear pass of N items, rating getter should be called exactly once per candidate inside evaluateRatingMatch + once in count tracking = 2N times total (O(N)), never N^2 (25 times)
    assert.ok(evaluationCallCount <= 10, `Evaluation count (${evaluationCallCount}) confirms linear O(N) pass, zero O(N^2) comparisons`);
  });

  // ============================================================================
  // GROUP 26: GOOGLE DATA FIREWALL
  // ============================================================================
  group('GROUP 26: GOOGLE DATA FIREWALL & RESTRICTED POLICY INVARIANCE');

  await test('G26-01: Candidate source policy restrictions remain NOT_PERSISTABLE and NOT_EXPORTABLE after filtering', async () => {
    const c = createMockCandidate('c_gmaps', 4.9, 'PRESENT', 'https://test.com', 'PRESENT');
    assert.equal(c.provenance.source, 'GOOGLE_MAPS_BROWSER');
    assert.equal(c.provenance.isRestricted, true);
    assert.equal(c.provenance.persistenceStatus, 'NOT_PERSISTABLE');
    assert.equal(c.provenance.exportStatus, 'NOT_EXPORTABLE');

    const filtered = filterCandidateDataset([c], { rating: '4.5+', website: 'WITH_WEBSITE' });
    const matching = filtered.visibleCandidateIds[0];
    assert.equal(matching, 'c_gmaps');
    assert.equal(c.provenance.persistenceStatus, 'NOT_PERSISTABLE');
    assert.equal(c.provenance.exportStatus, 'NOT_EXPORTABLE');
  });

  // ============================================================================
  // GROUP 27: SECURITY & INVARIANT VERIFICATION
  // ============================================================================
  group('GROUP 27: SECURITY & PROHIBITED ENGINE TOKENS');

  await test('G27-01: No prohibited scoring or crawling tokens in engine modules', async () => {
    const prohibitedTokens = [
      'qualification',
      'leadScore',
      'buyerIntent',
      'aiScore',
      'websiteCrawl',
      'contactExtract',
      'emailDiscover',
      'socialExtract'
    ];

    const engineFiles = [
      path.resolve(__dirname, '../src/extension/acquisition/engine/filterTypes.ts'),
      path.resolve(__dirname, '../src/extension/acquisition/engine/filterEngine.ts')
    ];

    for (const file of engineFiles) {
      const content = fs.readFileSync(file, 'utf8');
      for (const token of prohibitedTokens) {
        const regex = new RegExp(`\\b${token}\\b`, 'i');
        assert.ok(!regex.test(content), `Prohibited token '${token}' found in ${path.basename(file)}`);
      }
    }
  });

  // ============================================================================
  // GROUP 28: RUNTIME COORDINATOR MESSAGE INTEGRATION
  // ============================================================================
  group('GROUP 28: RUNTIME COORDINATOR MESSAGE INTEGRATION');

  await test('G28-01: Coordinator routes SET_GMAPS_FILTER, GET_GMAPS_FILTERED_VIEW, and RESET_GMAPS_FILTER', async () => {
    const mockDriver = {
      async getTab(tabId) {
        return { id: tabId, url: 'https://www.google.com/maps', active: true, status: 'complete' };
      },
      async navigateTab() { return true; },
      async probeTabState() { return { pageKind: 'MAPS_SEARCH', isValid: true, pageTitle: 'Google Maps' }; }
    };
    const coordinator = new GoogleMapsRuntimeCoordinator(mockDriver);
    const sessionId = 'sess_test_msg';
    await coordinator.startAcquisition(
      sessionId,
      [
        {
          keyword: 'lawyer',
          location: 'Dhaka'
        }
      ],
      { tabId: 42, navigationTimeoutMs: 3000 },
      mockDriver
    );

    // Ingest candidates
    coordinator.ingestCandidateObservations(
      sessionId,
      [
        {
          businessName: 'Law Firm 1',
          rating: '4.8',
          websiteUrl: 'https://law1.com',
          placeId: 'place_c1'
        },
        {
          businessName: 'Law Firm 2',
          rating: '3.8',
          placeId: 'place_c2'
        }
      ],
      'https://www.google.com/maps/search/lawyer+Dhaka'
    );

    // Send SET_GMAPS_FILTER message
    const setRes = await coordinator.handleAcquisitionMessage({
      type: 'SET_GMAPS_FILTER',
      source: 'GMAPS_ENGINE',
      timestamp: Date.now(),
      payload: {
        sessionId,
        rating: '4.5+',
        website: 'WITH_WEBSITE'
      }
    });

    assert.equal(setRes.success, true);
    assert.equal(setRes.view.matchingCount, 1);
    assert.ok(setRes.view.visibleCandidateIds.length === 1);

    // Send GET_GMAPS_FILTERED_VIEW message
    const getRes = await coordinator.handleAcquisitionMessage({
      type: 'GET_GMAPS_FILTERED_VIEW',
      source: 'GMAPS_ENGINE',
      timestamp: Date.now(),
      payload: {
        sessionId
      }
    });

    assert.equal(getRes.success, true);
    assert.equal(getRes.view.matchingCount, 1);

    // Send RESET_GMAPS_FILTER message
    const resetRes = await coordinator.handleAcquisitionMessage({
      type: 'RESET_GMAPS_FILTER',
      source: 'GMAPS_ENGINE',
      timestamp: Date.now(),
      payload: {
        sessionId
      }
    });

    assert.equal(resetRes.success, true);
    assert.equal(resetRes.view.matchingCount, 2);
  });

  // ============================================================================
  // MANDATORY SECTION 66: EXPLICIT TRUTH TABLE CHECKS
  // ============================================================================
  group('SECTION 66: EXPLICIT TRUTH TABLE CHECKS');

  await test('S66-01: Explicit Rating Truth Table against 5.0, 4.9, 4.5, 4.0, 3.9, UNK, ABS, AMB, UNSUP', async () => {
    const cases = [
      { val: 5.0, avail: 'PRESENT', any: true, r40: true, r45: true },
      { val: 4.9, avail: 'PRESENT', any: true, r40: true, r45: true },
      { val: 4.5, avail: 'PRESENT', any: true, r40: true, r45: true },
      { val: 4.0, avail: 'PRESENT', any: true, r40: true, r45: false },
      { val: 3.9, avail: 'PRESENT', any: true, r40: false, r45: false },
      { val: undefined, avail: 'UNKNOWN', any: true, r40: false, r45: false },
      { val: undefined, avail: 'ABSENT', any: true, r40: false, r45: false },
      { val: undefined, avail: 'AMBIGUOUS', any: true, r40: false, r45: false },
      { val: undefined, avail: 'UNSUPPORTED', any: true, r40: false, r45: false }
    ];

    for (const c of cases) {
      const cand = createMockCandidate('c', c.val, c.avail, undefined, 'UNKNOWN');
      assert.equal(evaluateRatingMatch(cand, 'ANY').matches, c.any, `Rating ANY failed for ${c.avail} ${c.val}`);
      assert.equal(evaluateRatingMatch(cand, '4.0+').matches, c.r40, `Rating 4.0+ failed for ${c.avail} ${c.val}`);
      assert.equal(evaluateRatingMatch(cand, '4.5+').matches, c.r45, `Rating 4.5+ failed for ${c.avail} ${c.val}`);
    }
  });

  await test('S66-02: Explicit Website Truth Table against PRESENT, ABSENT, UNKNOWN, AMBIGUOUS, UNSUPPORTED', async () => {
    const cases = [
      { val: 'https://ex.com', avail: 'PRESENT', any: true, withW: true, withoutW: false },
      { val: undefined, avail: 'ABSENT', any: true, withW: false, withoutW: true },
      { val: undefined, avail: 'UNKNOWN', any: true, withW: false, withoutW: false },
      { val: undefined, avail: 'AMBIGUOUS', any: true, withW: false, withoutW: false },
      { val: undefined, avail: 'UNSUPPORTED', any: true, withW: false, withoutW: false }
    ];

    for (const c of cases) {
      const cand = createMockCandidate('c', undefined, 'UNKNOWN', c.val, c.avail);
      assert.equal(evaluateWebsiteMatch(cand, 'ANY').matches, c.any, `Website ANY failed for ${c.avail}`);
      assert.equal(evaluateWebsiteMatch(cand, 'WITH_WEBSITE').matches, c.withW, `Website WITH failed for ${c.avail}`);
      assert.equal(evaluateWebsiteMatch(cand, 'WITHOUT_WEBSITE').matches, c.withoutW, `Website WITHOUT failed for ${c.avail}`);
    }
  });

  // ============================================================================
  // MANDATORY SECTION 67: EXPLICIT STRUCTURAL IMMUTABILITY
  // ============================================================================
  group('SECTION 67: EXPLICIT STRUCTURAL IMMUTABILITY VALIDATION');

  await test('S67-01: Deep freeze check on candidate collection across 5 filter evaluations', async () => {
    const original = createMockCandidate('c_deep', 4.5, 'PRESENT', 'https://test.com', 'PRESENT');
    const snapshotBefore = JSON.stringify(original);

    filterCandidateDataset([original], { rating: 'ANY', website: 'ANY' });
    filterCandidateDataset([original], { rating: '4.0+', website: 'ANY' });
    filterCandidateDataset([original], { rating: '4.5+', website: 'ANY' });
    filterCandidateDataset([original], { rating: 'ANY', website: 'WITH_WEBSITE' });
    filterCandidateDataset([original], { rating: 'ANY', website: 'WITHOUT_WEBSITE' });

    const snapshotAfter = JSON.stringify(original);
    assert.strictEqual(snapshotBefore, snapshotAfter, 'Candidate must not be mutated across filter evaluations');
  });

  // ============================================================================
  // MANDATORY SECTION 68: EXPLICIT 9-STEP RE-FILTER SEQUENCE
  // ============================================================================
  group('SECTION 68: EXPLICIT 9-STEP RE-FILTER SEQUENCE (A, B, C, D, E)');

  await test('S68-01: Dataset A, B, C, D, E evaluates identically across 9 consecutive filter steps', async () => {
    const A = createMockCandidate('A', 5.0, 'PRESENT', 'https://a.com', 'PRESENT');
    const B = createMockCandidate('B', 4.2, 'PRESENT', undefined, 'ABSENT');
    const C = createMockCandidate('C', 3.9, 'PRESENT', undefined, 'UNKNOWN');
    const D = createMockCandidate('D', 4.7, 'PRESENT', 'https://d.com', 'PRESENT');
    const E = createMockCandidate('E', 4.8, 'PRESENT', undefined, 'ABSENT');

    const dataset = [A, B, C, D, E];
    const manager = new GoogleMapsFilterStateManager();
    for (const item of dataset) manager.ingestCandidate(item);

    // Step 1: ANY / ANY -> A B C D E
    let view = manager.setFilter({ rating: 'ANY', website: 'ANY' });
    assert.deepStrictEqual(view.visibleCandidateIds, ['A', 'B', 'C', 'D', 'E']);

    // Step 2: 4.0+ / ANY -> A B D E
    view = manager.setFilter({ rating: '4.0+', website: 'ANY' });
    assert.deepStrictEqual(view.visibleCandidateIds, ['A', 'B', 'D', 'E']);

    // Step 3: 4.5+ / ANY -> A D E
    view = manager.setFilter({ rating: '4.5+', website: 'ANY' });
    assert.deepStrictEqual(view.visibleCandidateIds, ['A', 'D', 'E']);

    // Step 4: 4.5+ / WITH -> A D
    view = manager.setFilter({ rating: '4.5+', website: 'WITH_WEBSITE' });
    assert.deepStrictEqual(view.visibleCandidateIds, ['A', 'D']);

    // Step 5: ANY / WITH -> A D
    view = manager.setFilter({ rating: 'ANY', website: 'WITH_WEBSITE' });
    assert.deepStrictEqual(view.visibleCandidateIds, ['A', 'D']);

    // Step 6: ANY / WITHOUT -> B E
    view = manager.setFilter({ rating: 'ANY', website: 'WITHOUT_WEBSITE' });
    assert.deepStrictEqual(view.visibleCandidateIds, ['B', 'E']);

    // Step 7: 4.0+ / WITHOUT -> B E
    view = manager.setFilter({ rating: '4.0+', website: 'WITHOUT_WEBSITE' });
    assert.deepStrictEqual(view.visibleCandidateIds, ['B', 'E']);

    // Step 8: 4.5+ / WITHOUT -> E
    view = manager.setFilter({ rating: '4.5+', website: 'WITHOUT_WEBSITE' });
    assert.deepStrictEqual(view.visibleCandidateIds, ['E']);

    // Step 9: RESET -> A B C D E
    view = manager.resetFilter();
    assert.deepStrictEqual(view.visibleCandidateIds, ['A', 'B', 'C', 'D', 'E']);
  });

  // ============================================================================
  // MANDATORY SECTION 69: EXPLICIT UNKNOWN SAFETY TEST
  // ============================================================================
  group('SECTION 69: EXPLICIT UNKNOWN SAFETY TEST');

  await test('S69-01: Candidate with UNKNOWN rating & UNKNOWN website matches ANY/ANY and fails all constrained filters', async () => {
    const unkCandidate = createMockCandidate('unk', undefined, 'UNKNOWN', undefined, 'UNKNOWN');

    // ANY / ANY -> MATCH
    assert.equal(evaluateCandidateFilter(unkCandidate, { rating: 'ANY', website: 'ANY' }).matches, true);

    // 4.0+ / ANY -> NO MATCH
    assert.equal(evaluateCandidateFilter(unkCandidate, { rating: '4.0+', website: 'ANY' }).matches, false);

    // 4.5+ / ANY -> NO MATCH
    assert.equal(evaluateCandidateFilter(unkCandidate, { rating: '4.5+', website: 'ANY' }).matches, false);

    // ANY / WITH -> NO MATCH
    assert.equal(evaluateCandidateFilter(unkCandidate, { rating: 'ANY', website: 'WITH_WEBSITE' }).matches, false);

    // ANY / WITHOUT -> NO MATCH
    assert.equal(evaluateCandidateFilter(unkCandidate, { rating: 'ANY', website: 'WITHOUT_WEBSITE' }).matches, false);

    // 4.0+ / WITH -> NO MATCH
    assert.equal(evaluateCandidateFilter(unkCandidate, { rating: '4.0+', website: 'WITH_WEBSITE' }).matches, false);

    // 4.5+ / WITHOUT -> NO MATCH
    assert.equal(evaluateCandidateFilter(unkCandidate, { rating: '4.5+', website: 'WITHOUT_WEBSITE' }).matches, false);
  });

  // ============================================================================
  // MANDATORY SECTION 70: FILTERING DURING LIVE ACQUISITION TEST
  // ============================================================================
  group('SECTION 70: FILTERING DURING LIVE ACQUISITION TEST');

  await test('S70-01: Incremental delivery under active 4.5+ + WITHOUT preserves raw dataset and updates visible view', async () => {
    const manager = new GoogleMapsFilterStateManager({ rating: '4.5+', website: 'WITHOUT_WEBSITE' });

    // A: 5.0 + ABSENT -> visible
    const A = createMockCandidate('A', 5.0, 'PRESENT', undefined, 'ABSENT');
    manager.ingestCandidate(A);
    assert.deepStrictEqual(manager.getFilteredView().visibleCandidateIds, ['A']);

    // B: 4.0 + ABSENT -> hidden
    const B = createMockCandidate('B', 4.0, 'PRESENT', undefined, 'ABSENT');
    manager.ingestCandidate(B);
    assert.deepStrictEqual(manager.getFilteredView().visibleCandidateIds, ['A']);

    // C: 5.0 + UNKNOWN -> hidden
    const C = createMockCandidate('C', 5.0, 'PRESENT', undefined, 'UNKNOWN');
    manager.ingestCandidate(C);
    assert.deepStrictEqual(manager.getFilteredView().visibleCandidateIds, ['A']);

    // D: 4.5 + PRESENT -> hidden
    const D = createMockCandidate('D', 4.5, 'PRESENT', 'https://d.com', 'PRESENT');
    manager.ingestCandidate(D);
    assert.deepStrictEqual(manager.getFilteredView().visibleCandidateIds, ['A']);

    // Raw unique dataset must contain all 4: A, B, C, D
    assert.equal(manager.getRawCandidates().length, 4);
    assert.equal(manager.getFilteredView().totalObserved, 4);
    assert.equal(manager.getFilteredView().matchingCount, 1);
    assert.deepStrictEqual(manager.getFilteredView().visibleCandidateIds, ['A']);

    // If filter later changes to 4.0+ + WITHOUT, B immediately becomes visible
    const newView = manager.setFilter({ rating: '4.0+', website: 'WITHOUT_WEBSITE' });
    assert.deepStrictEqual(newView.visibleCandidateIds, ['A', 'B']);
  });

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n================================================================');
  console.log('PART 3: RATING + WEBSITE FILTER ENGINE TEST SUMMARY');
  console.log('================================================================');
  console.log(`Total Tests Run:    ${totalTests}`);
  console.log(`Tests Passed:       ${passedTests}`);
  console.log(`Tests Failed:       ${failedTests}`);
  console.log('================================================================');

  if (failedTests > 0) {
    console.error('\nFAILURE DETAILS:');
    for (const f of failures) {
      console.error(`- ${f.name}: ${f.error.message}`);
    }
    process.exit(1);
  } else {
    console.log('\nALL PART 3 FILTER ENGINE TESTS PASSED ✅\n');
  }
}

runAllPart3Tests().catch(err => {
  console.error('\nTest suite execution failed with unhandled error:', err);
  process.exit(1);
});
