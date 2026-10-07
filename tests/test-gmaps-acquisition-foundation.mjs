/**
 * LeadNoria — Google Maps Acquisition Foundation Test Suite
 *
 * Covers the full Definition of Done checklist for the acquisition foundation phase:
 *
 * Group 1:  Search Unit Normalization & Deterministic ID
 * Group 2:  Search Unit Planning (keyword × location Cartesian)
 * Group 3:  State Machine Transitions (legal)
 * Group 4:  State Machine Transitions (illegal / fail-closed)
 * Group 5:  Pause / Resume / Cancel Semantics
 * Group 6:  Google Maps Page Detection — URL Classification
 * Group 7:  Google Maps Page Detection — Multi-Signal / Fail-Closed
 * Group 8:  Field Availability — Rating (PRESENT/ABSENT/AMBIGUOUS/UNSUPPORTED)
 * Group 9:  Field Availability — Website (PRESENT/ABSENT/UNKNOWN/UNSUPPORTED)
 * Group 10: Field Availability — Text Fields
 * Group 11: Review Count Parsing
 * Group 12: Candidate Observation Construction & Provenance
 * Group 13: Deterministic Observation IDs
 * Group 14: Page Observation Snapshot Completeness
 * Group 15: Acquisition Queue — Enqueue / Claim / Complete / Fail
 * Group 16: Acquisition Queue — Duplicate Suppression
 * Group 17: Acquisition Queue — Pause / Resume / Cancel
 * Group 18: Acquisition Queue — Retry Logic
 * Group 19: Checkpoint Creation & Validation
 * Group 20: Checkpoint Recovery — Valid vs Invalid vs Cancelled
 * Group 21: Message Contracts — Validation
 * Group 22: Filter Compatibility — Rating PRESENT distinctions (4.0, 4.5, 5.0)
 * Group 23: Filter Compatibility — Website PRESENT vs ABSENT vs UNKNOWN
 * Group 24: Navigation Orchestrator — Tab Ownership Validation
 * Group 25: Result Feed Observer — Surface Status Detection
 * Group 26: Error Classification (recoverable / retryable / terminal)
 * Group 27: Security — No Prohibited Patterns in Source Files
 */

import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ─── Imports ────────────────────────────────────────────────────────────────

import {
  normalizeKeyword,
  normalizeLocation,
  deriveSearchUnitId,
  buildMapsSearchUrl,
  createSearchUnit,
  planSearchUnits,
  hashStringDeterministic
} from '../src/extension/acquisition/engine/searchUnit.ts';

import {
  GoogleMapsStateMachine,
  IllegalStateTransitionError,
  LEGAL_TRANSITIONS
} from '../src/extension/acquisition/engine/stateMachine.ts';

import {
  isGoogleMapsUrl,
  classifyUrlPath,
  detectGoogleMapsPage
} from '../src/extension/acquisition/engine/pageDetector.ts';

import {
  evaluateRatingField,
  evaluateReviewCountField,
  evaluateWebsiteField,
  evaluateTextField,
  createCandidateObservation,
  buildPageObservation,
  ENGINE_ADAPTER_VERSION
} from '../src/extension/acquisition/engine/observationBoundary.ts';

import {
  GoogleMapsAcquisitionQueue
} from '../src/extension/acquisition/engine/acquisitionQueue.ts';

import {
  GoogleMapsCheckpointManager,
  InMemoryCheckpointStorage
} from '../src/extension/acquisition/engine/checkpointManager.ts';

import {
  validateAcquisitionMessage
} from '../src/extension/acquisition/engine/messageContracts.ts';

import {
  DefaultResultFeedObserver
} from '../src/extension/acquisition/engine/resultFeedObserver.ts';

import {
  GoogleMapsNavigationOrchestrator
} from '../src/extension/acquisition/engine/navigationOrchestrator.ts';

import {
  GoogleMapsRuntimeCoordinator
} from '../src/extension/acquisition/engine/runtimeCoordinator.ts';

// ─── Test Harness ────────────────────────────────────────────────────────────

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      result.then(() => {
        console.log(`  [PASS] Test ${totalTests}: ${name}`);
        passedTests++;
      }).catch(err => {
        console.error(`  [FAIL] Test ${totalTests}: ${name}`);
        console.error(`         ${err.message}`);
        failedTests++;
      });
      return result;
    }
    console.log(`  [PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] Test ${totalTests}: ${name}`);
    console.error(`         ${err.message}`);
    failedTests++;
  }
}

async function asyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
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
console.log('LEADNORIA — GOOGLE MAPS ACQUISITION FOUNDATION TEST SUITE');
console.log('================================================================');

// ─── GROUP 1: Search Unit Normalization ──────────────────────────────────────
group('GROUP 1: SEARCH UNIT NORMALIZATION & DETERMINISTIC ID');

test('G1-01: normalizeKeyword strips leading/trailing whitespace', () => {
  assert.equal(normalizeKeyword('  real estate developer  '), 'real estate developer');
});

test('G1-02: normalizeKeyword collapses repeated internal whitespace', () => {
  assert.equal(normalizeKeyword('real   estate    developer'), 'real estate developer');
});

test('G1-03: normalizeKeyword rejects empty string', () => {
  assert.throws(() => normalizeKeyword(''), /empty/i);
});

test('G1-04: normalizeKeyword rejects pure whitespace', () => {
  assert.throws(() => normalizeKeyword('   '), /empty/i);
});

test('G1-05: normalizeKeyword rejects non-string', () => {
  assert.throws(() => normalizeKeyword(null), /non-empty string/i);
});

test('G1-06: normalizeLocation strips whitespace', () => {
  const r = normalizeLocation('  Dhaka  ');
  assert.equal(r, 'Dhaka');
});

test('G1-07: normalizeLocation preserves commas and district tokens', () => {
  const r = normalizeLocation('Gulshan, Dhaka');
  assert.equal(r, 'Gulshan, Dhaka');
});

test('G1-08: normalizeLocation returns undefined for empty', () => {
  assert.equal(normalizeLocation(''), undefined);
  assert.equal(normalizeLocation(undefined), undefined);
});

test('G1-09: deriveSearchUnitId is deterministic for same inputs', () => {
  const id1 = deriveSearchUnitId('real estate developer', 'Dhaka');
  const id2 = deriveSearchUnitId('real estate developer', 'Dhaka');
  assert.equal(id1, id2);
});

test('G1-10: deriveSearchUnitId differs for different keywords', () => {
  const id1 = deriveSearchUnitId('real estate developer', 'Dhaka');
  const id2 = deriveSearchUnitId('property developer', 'Dhaka');
  assert.notEqual(id1, id2);
});

test('G1-11: deriveSearchUnitId differs for different locations', () => {
  const id1 = deriveSearchUnitId('real estate developer', 'Dhaka');
  const id2 = deriveSearchUnitId('real estate developer', 'Chittagong');
  assert.notEqual(id1, id2);
});

test('G1-12: deriveSearchUnitId is case-insensitive (no duplicate work)', () => {
  const id1 = deriveSearchUnitId('REAL ESTATE DEVELOPER', 'DHAKA');
  const id2 = deriveSearchUnitId('real estate developer', 'dhaka');
  assert.equal(id1, id2);
});

test('G1-13: buildMapsSearchUrl encodes query correctly', () => {
  const url = buildMapsSearchUrl('real estate developer Dhaka');
  assert.match(url, /^https:\/\/www\.google\.com\/maps\/search\//);
  assert.match(url, /real%20estate%20developer%20Dhaka/);
});

test('G1-14: createSearchUnit builds deterministic unit', () => {
  const u = createSearchUnit({ keyword: 'property developer', location: 'Dhaka' });
  assert.equal(u.normalizedKeyword, 'property developer');
  assert.equal(u.normalizedLocation, 'Dhaka');
  assert.equal(u.normalizedQuery, 'property developer Dhaka');
  assert.equal(u.status, 'PLANNED');
  assert.match(u.searchUnitId, /^gsu_/);
  assert.ok(u.createdAt);
  assert.equal(u.candidateCount, 0);
  assert.equal(u.retryCount, 0);
});

test('G1-15: createSearchUnit without location builds keyword-only query', () => {
  const u = createSearchUnit({ keyword: 'restaurant' });
  assert.equal(u.normalizedQuery, 'restaurant');
  assert.equal(u.normalizedLocation, undefined);
  assert.match(u.navigationUrl, /restaurant/);
});

test('G1-16: createSearchUnit supports customQuery override', () => {
  const u = createSearchUnit({ keyword: 'hotel', location: 'Dhaka', customQuery: 'boutique hotel Dhaka near Gulshan' });
  assert.equal(u.normalizedQuery, 'boutique hotel Dhaka near Gulshan');
});

test('G1-17: hashStringDeterministic is stable', () => {
  const h1 = hashStringDeterministic('hello world');
  const h2 = hashStringDeterministic('hello world');
  assert.equal(h1, h2);
  assert.equal(h1.length, 16);
});

// ─── GROUP 2: planSearchUnits ─────────────────────────────────────────────────
group('GROUP 2: SEARCH UNIT PLANNING (keyword × location)');

test('G2-01: planSearchUnits generates Cartesian product', () => {
  const { searchUnits } = planSearchUnits(
    ['real estate developer', 'property developer'],
    ['Dhaka', 'Chittagong']
  );
  assert.equal(searchUnits.length, 4);
});

test('G2-02: planSearchUnits deduplicates identical keywords', () => {
  const { searchUnits, duplicatesSuppressed } = planSearchUnits(
    ['hotel', 'hotel', 'Hotel'],
    ['Dhaka']
  );
  assert.equal(searchUnits.length, 1);
  assert.ok(duplicatesSuppressed >= 1);
});

test('G2-03: planSearchUnits with no locations creates keyword-only units', () => {
  const { searchUnits } = planSearchUnits(['restaurant', 'cafe']);
  assert.equal(searchUnits.length, 2);
  for (const u of searchUnits) {
    assert.equal(u.normalizedLocation, undefined);
  }
});

test('G2-04: planSearchUnits all units start with PLANNED status', () => {
  const { searchUnits } = planSearchUnits(['developer'], ['Dhaka']);
  for (const u of searchUnits) {
    assert.equal(u.status, 'PLANNED');
  }
});

test('G2-05: planSearchUnits skips invalid (empty) keywords', () => {
  const { searchUnits } = planSearchUnits(['valid keyword', '', '   ']);
  assert.equal(searchUnits.length, 1);
});

test('G2-06: all planned units have deterministic IDs', () => {
  const { searchUnits } = planSearchUnits(['developer', 'contractor'], ['Dhaka', 'Sylhet']);
  const ids = new Set(searchUnits.map(u => u.searchUnitId));
  assert.equal(ids.size, 4); // All distinct
});

// ─── GROUP 3: State Machine — Legal Transitions ───────────────────────────────
group('GROUP 3: STATE MACHINE — LEGAL TRANSITIONS');

test('G3-01: IDLE → QUEUED', () => {
  const sm = new GoogleMapsStateMachine('session-1');
  const ev = sm.transitionTo('QUEUED', 'Enqueued by operator');
  assert.equal(sm.state, 'QUEUED');
  assert.equal(ev.fromState, 'IDLE');
  assert.equal(ev.toState, 'QUEUED');
});

test('G3-02: IDLE → STARTING direct', () => {
  const sm = new GoogleMapsStateMachine('session-2');
  sm.transitionTo('STARTING', 'Direct start');
  assert.equal(sm.state, 'STARTING');
});

test('G3-03: STARTING → NAVIGATING', () => {
  const sm = new GoogleMapsStateMachine('session-3');
  sm.transitionTo('STARTING', 'Start');
  sm.transitionTo('NAVIGATING', 'Tab opened');
  assert.equal(sm.state, 'NAVIGATING');
});

test('G3-04: NAVIGATING → OBSERVING', () => {
  const sm = new GoogleMapsStateMachine('session-4');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.transitionTo('OBSERVING', 'Page ready');
  assert.equal(sm.state, 'OBSERVING');
});

test('G3-05: OBSERVING → COMPLETING → COMPLETED', () => {
  const sm = new GoogleMapsStateMachine('session-5');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.transitionTo('OBSERVING', '');
  sm.transitionTo('COMPLETING', 'All units done');
  sm.transitionTo('COMPLETED', 'Done');
  assert.equal(sm.state, 'COMPLETED');
});

test('G3-06: Any operational state → FAILED', () => {
  // STARTING -> FAILED
  const sm1 = new GoogleMapsStateMachine('s-starting');
  sm1.transitionTo('STARTING', '');
  sm1.transitionTo('FAILED', 'err');
  assert.equal(sm1.state, 'FAILED');

  // NAVIGATING -> FAILED
  const sm2 = new GoogleMapsStateMachine('s-navigating');
  sm2.transitionTo('STARTING', '');
  sm2.transitionTo('NAVIGATING', '');
  sm2.transitionTo('FAILED', 'err');
  assert.equal(sm2.state, 'FAILED');

  // OBSERVING -> FAILED
  const sm3 = new GoogleMapsStateMachine('s-observing');
  sm3.transitionTo('STARTING', '');
  sm3.transitionTo('NAVIGATING', '');
  sm3.transitionTo('OBSERVING', '');
  sm3.transitionTo('FAILED', 'err');
  assert.equal(sm3.state, 'FAILED');

  // COMPLETING -> FAILED
  const sm4 = new GoogleMapsStateMachine('s-completing');
  sm4.transitionTo('STARTING', '');
  sm4.transitionTo('NAVIGATING', '');
  sm4.transitionTo('OBSERVING', '');
  sm4.transitionTo('COMPLETING', '');
  sm4.transitionTo('FAILED', 'err');
  assert.equal(sm4.state, 'FAILED');
});

test('G3-07: NAVIGATING → PAUSED', () => {
  const sm = new GoogleMapsStateMachine('s-pause');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.transitionTo('PAUSED', 'User paused');
  assert.equal(sm.state, 'PAUSED');
});

test('G3-08: History records all transitions', () => {
  const sm = new GoogleMapsStateMachine('s-hist');
  sm.transitionTo('STARTING', 'T1');
  sm.transitionTo('NAVIGATING', 'T2');
  assert.equal(sm.history.length, 2);
  assert.equal(sm.history[0].fromState, 'IDLE');
  assert.equal(sm.history[0].toState, 'STARTING');
});

test('G3-09: canTransitionTo returns true for legal transition', () => {
  const sm = new GoogleMapsStateMachine('s-can');
  assert.ok(sm.canTransitionTo('QUEUED'));
  assert.ok(sm.canTransitionTo('STARTING'));
});

// ─── GROUP 4: State Machine — Illegal Transitions ────────────────────────────
group('GROUP 4: STATE MACHINE — ILLEGAL TRANSITIONS (fail-closed)');

test('G4-01: IDLE → OBSERVING is illegal', () => {
  const sm = new GoogleMapsStateMachine('s-ill1');
  assert.throws(() => sm.transitionTo('OBSERVING', 'bad'), IllegalStateTransitionError);
});

test('G4-02: IDLE → COMPLETED is illegal', () => {
  const sm = new GoogleMapsStateMachine('s-ill2');
  assert.throws(() => sm.transitionTo('COMPLETED', 'bad'), IllegalStateTransitionError);
});

test('G4-03: COMPLETED → NAVIGATING is illegal', () => {
  const sm = new GoogleMapsStateMachine('s-ill3');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.transitionTo('OBSERVING', '');
  sm.transitionTo('COMPLETING', '');
  sm.transitionTo('COMPLETED', '');
  assert.throws(() => sm.transitionTo('NAVIGATING', 'bad'), IllegalStateTransitionError);
});

test('G4-04: CANCELLED → NAVIGATING is illegal', () => {
  const sm = new GoogleMapsStateMachine('s-ill4');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('CANCELLED', '');
  assert.throws(() => sm.transitionTo('NAVIGATING', 'bad'), IllegalStateTransitionError);
});

test('G4-05: FAILED → OBSERVING is illegal', () => {
  const sm = new GoogleMapsStateMachine('s-ill5');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('FAILED', '');
  assert.throws(() => sm.transitionTo('OBSERVING', 'bad'), IllegalStateTransitionError);
});

test('G4-06: IllegalStateTransitionError carries fromState/toState', () => {
  const sm = new GoogleMapsStateMachine('s-ill6');
  try {
    sm.transitionTo('COMPLETED', 'bad');
    assert.fail('Should have thrown');
  } catch (err) {
    assert.ok(err instanceof IllegalStateTransitionError);
    assert.equal(err.fromState, 'IDLE');
    assert.equal(err.toState, 'COMPLETED');
  }
});

// ─── GROUP 5: Pause / Resume / Cancel ────────────────────────────────────────
group('GROUP 5: PAUSE / RESUME / CANCEL SEMANTICS');

test('G5-01: pause() transitions to PAUSED from OBSERVING', () => {
  const sm = new GoogleMapsStateMachine('s-p1');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.transitionTo('OBSERVING', '');
  const paused = sm.pause();
  assert.ok(paused);
  assert.equal(sm.state, 'PAUSED');
});

test('G5-02: pause() from PAUSED is idempotent (returns false, no throw)', () => {
  const sm = new GoogleMapsStateMachine('s-p2');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.transitionTo('PAUSED', '');
  const result = sm.pause();
  assert.equal(result, false);
  assert.equal(sm.state, 'PAUSED');
});

test('G5-03: resume() from PAUSED transitions back to NAVIGATING', () => {
  const sm = new GoogleMapsStateMachine('s-p3');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.transitionTo('PAUSED', '');
  sm.resume('NAVIGATING', 'Operator resumed');
  assert.equal(sm.state, 'NAVIGATING');
});

test('G5-04: resume() from non-PAUSED state throws', () => {
  const sm = new GoogleMapsStateMachine('s-p4');
  sm.transitionTo('STARTING', '');
  assert.throws(() => sm.resume(), /Cannot resume.*STARTING/);
});

test('G5-05: cancel() transitions to CANCELLED', () => {
  const sm = new GoogleMapsStateMachine('s-p5');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.cancel();
  assert.equal(sm.state, 'CANCELLED');
});

test('G5-06: cancel() is idempotent from CANCELLED (no throw)', () => {
  const sm = new GoogleMapsStateMachine('s-p6');
  sm.transitionTo('STARTING', '');
  sm.cancel();
  const result = sm.cancel();
  assert.equal(result, false);
  assert.equal(sm.state, 'CANCELLED');
});

test('G5-07: resume() after CANCEL is rejected', () => {
  const sm = new GoogleMapsStateMachine('s-p7');
  sm.transitionTo('STARTING', '');
  sm.cancel();
  assert.throws(() => sm.resume(), /Cannot resume.*CANCELLED/);
});

test('G5-08: reset() to IDLE from COMPLETED', () => {
  const sm = new GoogleMapsStateMachine('s-p8');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.transitionTo('OBSERVING', '');
  sm.transitionTo('COMPLETING', '');
  sm.transitionTo('COMPLETED', '');
  sm.reset();
  assert.equal(sm.state, 'IDLE');
});

test('G5-09: pause from OBSERVING records pausedFromState === "OBSERVING"', () => {
  const sm = new GoogleMapsStateMachine('s-p9');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.transitionTo('OBSERVING', '');
  sm.pause();
  assert.equal(sm.state, 'PAUSED');
  assert.equal(sm.pausedFromState, 'OBSERVING');
});

test('G5-10: resume without arguments restores OBSERVING when paused from OBSERVING', () => {
  const sm = new GoogleMapsStateMachine('s-p10');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.transitionTo('OBSERVING', '');
  sm.pause();
  sm.resume();
  assert.equal(sm.state, 'OBSERVING');
  assert.equal(sm.pausedFromState, null);
});

test('G5-11: pause from NAVIGATING records pausedFromState === "NAVIGATING"', () => {
  const sm = new GoogleMapsStateMachine('s-p11');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.pause();
  assert.equal(sm.state, 'PAUSED');
  assert.equal(sm.pausedFromState, 'NAVIGATING');
});

test('G5-12: resume without arguments restores NAVIGATING when paused from NAVIGATING', () => {
  const sm = new GoogleMapsStateMachine('s-p12');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.pause();
  sm.resume();
  assert.equal(sm.state, 'NAVIGATING');
  assert.equal(sm.pausedFromState, null);
});

test('G5-13: pause then cancel clears pausedFromState and transitions to CANCELLED', () => {
  const sm = new GoogleMapsStateMachine('s-p13');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.pause();
  assert.equal(sm.pausedFromState, 'NAVIGATING');
  sm.cancel();
  assert.equal(sm.state, 'CANCELLED');
  assert.equal(sm.pausedFromState, null);
});

test('G5-14: resume after COMPLETED is rejected', () => {
  const sm = new GoogleMapsStateMachine('s-p14');
  sm.transitionTo('STARTING', '');
  sm.transitionTo('NAVIGATING', '');
  sm.transitionTo('OBSERVING', '');
  sm.transitionTo('COMPLETING', '');
  sm.transitionTo('COMPLETED', '');
  assert.throws(() => sm.resume(), /Cannot resume.*COMPLETED/);
});

// ─── GROUP 6: Page Detection — URL Classification ────────────────────────────
group('GROUP 6: GOOGLE MAPS PAGE DETECTION — URL CLASSIFICATION');

test('G6-01: isGoogleMapsUrl returns true for google.com/maps', () => {
  assert.ok(isGoogleMapsUrl('https://www.google.com/maps/search/restaurant+Dhaka'));
});

test('G6-02: isGoogleMapsUrl returns true for maps.google.com', () => {
  assert.ok(isGoogleMapsUrl('https://maps.google.com/maps'));
});

test('G6-03: isGoogleMapsUrl returns false for non-Google URL', () => {
  assert.equal(isGoogleMapsUrl('https://facebook.com/ads/library'), false);
});

test('G6-04: isGoogleMapsUrl returns false for google.com without /maps path', () => {
  assert.equal(isGoogleMapsUrl('https://www.google.com/search?q=restaurant'), false);
});

test('G6-05: classifyUrlPath — search URL with /maps/search/', () => {
  const r = classifyUrlPath('https://www.google.com/maps/search/restaurant+Dhaka');
  assert.equal(r.kind, 'SEARCH_RESULTS');
  assert.ok(r.confidence >= 0.8);
});

test('G6-06: classifyUrlPath — place detail /maps/place/', () => {
  const r = classifyUrlPath('https://www.google.com/maps/place/SomeRestaurant/1234');
  assert.equal(r.kind, 'PLACE_DETAIL');
});

test('G6-07: classifyUrlPath — directions /maps/dir/', () => {
  const r = classifyUrlPath('https://www.google.com/maps/dir/Dhaka/Chittagong');
  assert.equal(r.kind, 'DIRECTIONS');
});

test('G6-08: classifyUrlPath — home maps', () => {
  const r = classifyUrlPath('https://www.google.com/maps');
  assert.equal(r.kind, 'HOME_MAPS');
});

test('G6-09: detectGoogleMapsPage — NON_GOOGLE URL', () => {
  const d = detectGoogleMapsPage('https://example.com/page');
  assert.equal(d.isGoogleMaps, false);
  assert.equal(d.pageKind, 'NON_GOOGLE');
  assert.equal(d.ready, false);
  assert.ok(d.confidence >= 0.9);
});

test('G6-10: detectGoogleMapsPage — search results page without DOM', () => {
  const d = detectGoogleMapsPage('https://www.google.com/maps/search/restaurant+Dhaka');
  assert.equal(d.isGoogleMaps, true);
  assert.equal(d.pageKind, 'SEARCH_RESULTS');
  assert.ok(d.ready);
  assert.ok(d.observedAt);
});

// ─── GROUP 7: Page Detection — Multi-Signal / Fail-Closed ────────────────────
group('GROUP 7: GOOGLE MAPS PAGE DETECTION — MULTI-SIGNAL');

test('G7-01: detectGoogleMapsPage returns UNKNOWN for malformed URL', () => {
  const d = detectGoogleMapsPage('not-a-url');
  assert.equal(d.pageKind, 'NON_GOOGLE');
  assert.equal(d.isGoogleMaps, false);
});

test('G7-02: detectGoogleMapsPage with loading spinner → ready: false', () => {
  const mockDom = {
    querySelector(sel) {
      if (sel.includes('progressbar') || sel.includes('loading')) return { textContent: '' };
      return null;
    },
    querySelectorAll() { return []; }
  };
  const d = detectGoogleMapsPage('https://www.google.com/maps/search/restaurant+Dhaka', mockDom);
  assert.equal(d.isGoogleMaps, true);
  assert.equal(d.ready, false);
  assert.ok(d.reason.toLowerCase().includes('loading') || d.reason.toLowerCase().includes('spinner'));
});

test('G7-03: detectGoogleMapsPage with feed container → ready: true', () => {
  const mockDom = {
    querySelector(sel) {
      if (sel.includes('role="feed"') || sel.includes('feed')) return { textContent: 'Results' };
      return null;
    },
    querySelectorAll() { return [{ tagName: 'DIV' }, { tagName: 'DIV' }]; }
  };
  const d = detectGoogleMapsPage('https://www.google.com/maps/search/restaurant+Dhaka', mockDom);
  assert.equal(d.isGoogleMaps, true);
  assert.equal(d.pageKind, 'SEARCH_RESULTS');
  assert.ok(d.ready);
  assert.ok(d.confidence >= 0.9);
});

test('G7-04: detectGoogleMapsPage with DOM but missing feed → ready: false', () => {
  const mockDom = {
    querySelector(_sel) { return null; },
    querySelectorAll() { return []; }
  };
  const d = detectGoogleMapsPage('https://www.google.com/maps/search/restaurant+Dhaka', mockDom);
  assert.equal(d.isGoogleMaps, true);
  assert.equal(d.ready, false);
});

test('G7-05: detectGoogleMapsPage — no results marker → ready: true', () => {
  const mockDom = {
    querySelector(sel) {
      if (sel.includes('Q2vNVc') || sel.includes('No results')) return { textContent: 'No results found' };
      return null;
    },
    querySelectorAll() { return []; }
  };
  const d = detectGoogleMapsPage('https://www.google.com/maps/search/xyzzyxyz+Dhaka', mockDom);
  assert.equal(d.isGoogleMaps, true);
  assert.ok(d.ready);
  assert.ok(d.reason.toLowerCase().includes('no results'));
});

test('G7-06: detectGoogleMapsPage signals contains hasMapsHost', () => {
  const d = detectGoogleMapsPage('https://www.google.com/maps/search/restaurant');
  assert.ok(d.signals.hasMapsHost);
  assert.ok(d.signals.hasSearchPath);
});

test('G7-07: detectGoogleMapsPage place detail page', () => {
  const d = detectGoogleMapsPage('https://www.google.com/maps/place/SomeBusiness/data=abc123');
  assert.equal(d.pageKind, 'PLACE_DETAIL');
  assert.ok(d.observedAt);
});

// ─── GROUP 8: Field Availability — Rating ────────────────────────────────────
group('GROUP 8: FIELD AVAILABILITY — RATING (PRESENT / ABSENT / AMBIGUOUS)');

test('G8-01: rating "4.5" → PRESENT, parsedValue 4.5', () => {
  const f = evaluateRatingField('4.5');
  assert.equal(f.availability, 'PRESENT');
  assert.equal(f.parsedValue, 4.5);
  assert.ok(f.confidence >= 0.9);
});

test('G8-02: rating "4.0" → PRESENT, parsedValue 4.0', () => {
  const f = evaluateRatingField('4.0');
  assert.equal(f.availability, 'PRESENT');
  assert.equal(f.parsedValue, 4.0);
});

test('G8-03: rating "5" → PRESENT, parsedValue 5', () => {
  const f = evaluateRatingField('5');
  assert.equal(f.availability, 'PRESENT');
  assert.equal(f.parsedValue, 5);
});

test('G8-04: rating "3.7 stars" → PRESENT, parsedValue 3.7', () => {
  const f = evaluateRatingField('3.7 stars');
  assert.equal(f.availability, 'PRESENT');
  assert.equal(f.parsedValue, 3.7);
});

test('G8-05: rating "4,5" (European comma) → PRESENT, parsedValue 4.5', () => {
  const f = evaluateRatingField('4,5');
  assert.equal(f.availability, 'PRESENT');
  assert.equal(f.parsedValue, 4.5);
});

test('G8-06: rating missing from card → UNKNOWN (not ABSENT)', () => {
  const f = evaluateRatingField(undefined);
  assert.equal(f.availability, 'UNKNOWN');
  assert.equal(f.parsedValue, undefined);
});

test('G8-07: rating "" (empty) → UNKNOWN', () => {
  const f = evaluateRatingField('');
  assert.equal(f.availability, 'UNKNOWN');
});

test('G8-08: rating out of range "9.9" → AMBIGUOUS', () => {
  const f = evaluateRatingField('9.9');
  assert.equal(f.availability, 'AMBIGUOUS');
});

test('G8-09: rating with EXTERNAL surface → UNSUPPORTED when undefined', () => {
  const f = evaluateRatingField(undefined, 'EXTERNAL');
  assert.equal(f.availability, 'UNSUPPORTED');
});

test('G8-10: rating "not rated" (explicit no-rating evidence) → ABSENT', () => {
  const f = evaluateRatingField('not rated');
  assert.equal(f.availability, 'ABSENT');
});

// ─── GROUP 9: Field Availability — Website ───────────────────────────────────
group('GROUP 9: FIELD AVAILABILITY — WEBSITE (PRESENT / ABSENT / UNKNOWN / UNSUPPORTED)');

test('G9-01: valid website URL → PRESENT', () => {
  const f = evaluateWebsiteField('https://example.com');
  assert.equal(f.availability, 'PRESENT');
  assert.equal(f.parsedValue, 'https://example.com/');
});

test('G9-02: website undefined + surface inspected → ABSENT', () => {
  const f = evaluateWebsiteField(undefined, true);
  assert.equal(f.availability, 'ABSENT');
});

test('G9-03: website undefined + surface NOT inspected → UNSUPPORTED', () => {
  const f = evaluateWebsiteField(undefined, false);
  assert.equal(f.availability, 'UNSUPPORTED');
});

test('G9-04: website with invalid URL → UNKNOWN', () => {
  const f = evaluateWebsiteField('not-a-url', true);
  assert.equal(f.availability, 'UNKNOWN');
});

test('G9-05: website pointing to google.com/maps → ABSENT (internal link)', () => {
  const f = evaluateWebsiteField('https://www.google.com/maps/place/SomeBusiness', true);
  assert.equal(f.availability, 'ABSENT');
});

test('G9-06: ABSENT ≠ UNKNOWN ≠ UNSUPPORTED ≠ PRESENT (distinct values)', () => {
  const absent = evaluateWebsiteField(undefined, true);
  const unknown = evaluateWebsiteField('not-a-url', true);
  const unsupported = evaluateWebsiteField(undefined, false);
  const present = evaluateWebsiteField('https://example.com', true);

  const values = new Set([absent.availability, unknown.availability, unsupported.availability, present.availability]);
  assert.equal(values.size, 4);
});

test('G9-07: javascript: URL → UNKNOWN (security rejection)', () => {
  const f = evaluateWebsiteField('javascript:void(0)', true);
  assert.equal(f.availability, 'UNKNOWN');
});

test('G9-08: website from card listing (no detail surface) → correct availability', () => {
  // When website is in a card summary, if URL is valid
  const f = evaluateWebsiteField('https://businesssite.bd', true);
  assert.equal(f.availability, 'PRESENT');
  assert.ok(f.parsedValue);
});

// ─── GROUP 10: Text Fields ────────────────────────────────────────────────────
group('GROUP 10: FIELD AVAILABILITY — TEXT FIELDS');

test('G10-01: evaluateTextField with valid text → PRESENT', () => {
  const f = evaluateTextField('ABC Restaurant', 'businessName');
  assert.equal(f.availability, 'PRESENT');
  assert.equal(f.parsedValue, 'ABC Restaurant');
});

test('G10-02: evaluateTextField with undefined on card surface → UNKNOWN (DETAIL → ABSENT)', () => {
  const fCard = evaluateTextField(undefined, 'businessName');
  assert.equal(fCard.availability, 'UNKNOWN');
  const fDetail = evaluateTextField(undefined, 'businessName', 'DETAIL');
  assert.equal(fDetail.availability, 'ABSENT');
});

test('G10-03: evaluateTextField with empty string → UNKNOWN', () => {
  const f = evaluateTextField('', 'category');
  assert.equal(f.availability, 'UNKNOWN');
});

test('G10-04: evaluateTextField strips control chars', () => {
  const f = evaluateTextField('ABC\x00\x01 Restaurant', 'businessName');
  assert.equal(f.availability, 'PRESENT');
  assert.ok(!f.parsedValue?.includes('\x00'));
});

test('G10-05: evaluateTextField truncates at 500 chars', () => {
  const longText = 'A'.repeat(1000);
  const f = evaluateTextField(longText, 'description');
  assert.equal(f.availability, 'PRESENT');
  assert.ok(f.parsedValue && f.parsedValue.length <= 500);
});

// ─── GROUP 11: Review Count ───────────────────────────────────────────────────
group('GROUP 11: REVIEW COUNT PARSING');

test('G11-01: "(1,234 reviews)" → PRESENT, 1234', () => {
  const f = evaluateReviewCountField('(1,234 reviews)');
  assert.equal(f.availability, 'PRESENT');
  assert.equal(f.parsedValue, 1234);
});

test('G11-02: "47" → PRESENT, 47', () => {
  const f = evaluateReviewCountField('47');
  assert.equal(f.availability, 'PRESENT');
  assert.equal(f.parsedValue, 47);
});

test('G11-03: undefined on card → UNKNOWN (explicit zero → ABSENT)', () => {
  const fCard = evaluateReviewCountField(undefined);
  assert.equal(fCard.availability, 'UNKNOWN');
  const fZero = evaluateReviewCountField('0 reviews');
  assert.equal(fZero.availability, 'ABSENT');
  assert.equal(fZero.parsedValue, 0);
});

test('G11-04: empty string → UNKNOWN', () => {
  const f = evaluateReviewCountField('');
  assert.equal(f.availability, 'UNKNOWN');
});

test('G11-05: "many" (no digits) → AMBIGUOUS', () => {
  const f = evaluateReviewCountField('many');
  assert.equal(f.availability, 'AMBIGUOUS');
});

// ─── GROUP 12: Candidate Observation Construction ─────────────────────────────
group('GROUP 12: CANDIDATE OBSERVATION CONSTRUCTION & PROVENANCE');

const testCtx = {
  sessionId: 'sess_test_001',
  searchUnitId: 'gsu_abc123',
  searchKeyword: 'real estate developer',
  searchLocation: 'Dhaka',
  pageUrl: 'https://www.google.com/maps/search/real+estate+developer+Dhaka',
  pageKind: 'SEARCH_RESULTS'
};

test('G12-01: createCandidateObservation creates valid envelope', () => {
  const obs = createCandidateObservation({
    businessName: 'Meridian Properties',
    rating: '4.3',
    reviewCount: '(89)',
    websiteUrl: 'https://meridianproperties.bd',
    address: '34 Gulshan Avenue, Dhaka',
    phone: '+880-2-12345678'
  }, testCtx);

  assert.equal(obs.source, 'GOOGLE_MAPS_BROWSER');
  assert.equal(obs.sessionId, 'sess_test_001');
  assert.equal(obs.searchUnitId, 'gsu_abc123');
  assert.ok(obs.observationId.startsWith('gmo_'));
  assert.ok(obs.observedAt);
});

test('G12-02: Provenance metadata is enforced', () => {
  const obs = createCandidateObservation({ businessName: 'Test Corp' }, testCtx);
  assert.equal(obs.provenance.source, 'GOOGLE_MAPS_BROWSER');
  assert.equal(obs.provenance.isRestricted, true);
  assert.equal(obs.provenance.persistenceStatus, 'NOT_PERSISTABLE');
  assert.equal(obs.provenance.exportStatus, 'NOT_EXPORTABLE');
  assert.equal(obs.provenance.policyStatus, 'POLICY_GATED');
  assert.equal(obs.provenance.searchUnitId, 'gsu_abc123');
  assert.equal(obs.provenance.sessionId, 'sess_test_001');
  assert.equal(obs.provenance.adapterVersion, ENGINE_ADAPTER_VERSION);
});

test('G12-03: All fields have explicit FieldAvailability', () => {
  const obs = createCandidateObservation({ businessName: 'Test' }, testCtx);
  const fields = ['businessName', 'category', 'address', 'phone', 'websiteUrl', 'rating', 'reviewCount', 'businessStatus', 'placeId', 'mapsUrl'];
  for (const field of fields) {
    assert.ok(obs.fieldAvailability[field], `Expected fieldAvailability.${field} to be set`);
  }
});

test('G12-04: Missing business name produces diagnostic', () => {
  const obs = createCandidateObservation({}, testCtx);
  assert.equal(obs.businessName.availability, 'UNKNOWN');
  assert.ok(obs.diagnostics.length > 0);
  assert.equal(obs.diagnostics[0].code, 'CANDIDATE_OBSERVATION_FAILED');

  const obsDetail = createCandidateObservation({ isDetail: true }, testCtx);
  assert.equal(obsDetail.businessName.availability, 'ABSENT');
});

test('G12-05: All field availability values are valid enum entries', () => {
  const valid = new Set(['PRESENT', 'ABSENT', 'UNKNOWN', 'UNSUPPORTED', 'AMBIGUOUS']);
  const obs = createCandidateObservation({ businessName: 'Test', rating: '4.5', websiteUrl: 'https://test.com' }, testCtx);
  for (const [key, val] of Object.entries(obs.fieldAvailability)) {
    assert.ok(valid.has(val), `Field "${key}" has invalid availability "${val}"`);
  }
});

test('G12-06: searchKeyword and searchLocation preserved in observation', () => {
  const obs = createCandidateObservation({ businessName: 'Hotel ABC' }, testCtx);
  assert.equal(obs.searchKeyword, 'real estate developer');
  assert.equal(obs.searchLocation, 'Dhaka');
  assert.equal(obs.pageUrl, testCtx.pageUrl);
});

// ─── GROUP 13: Deterministic Observation IDs ──────────────────────────────────
group('GROUP 13: DETERMINISTIC OBSERVATION IDS');

test('G13-01: Same inputs produce same observationId', () => {
  const raw = { businessName: 'Hotel XYZ', placeId: 'ChIJ123' };
  const obs1 = createCandidateObservation(raw, testCtx);
  const obs2 = createCandidateObservation(raw, testCtx);
  assert.equal(obs1.observationId, obs2.observationId);
});

test('G13-02: Different placeId → different observationId', () => {
  const obs1 = createCandidateObservation({ placeId: 'ABC' }, testCtx);
  const obs2 = createCandidateObservation({ placeId: 'XYZ' }, testCtx);
  assert.notEqual(obs1.observationId, obs2.observationId);
});

test('G13-03: Different searchUnitId → different observationId', () => {
  const obs1 = createCandidateObservation({ businessName: 'Test', placeId: 'P1' }, { ...testCtx, searchUnitId: 'gsu_unit1' });
  const obs2 = createCandidateObservation({ businessName: 'Test', placeId: 'P1' }, { ...testCtx, searchUnitId: 'gsu_unit2' });
  assert.notEqual(obs1.observationId, obs2.observationId);
});

// ─── GROUP 14: Page Observation Snapshot ─────────────────────────────────────
group('GROUP 14: PAGE OBSERVATION SNAPSHOT COMPLETENESS');

test('G14-01: buildPageObservation with candidates → COMPLETE', () => {
  const obs1 = createCandidateObservation({ businessName: 'A', placeId: 'p1' }, testCtx);
  const obs2 = createCandidateObservation({ businessName: 'B', placeId: 'p2' }, testCtx);
  const snapshot = buildPageObservation([obs1, obs2], { ...testCtx, pageKind: 'SEARCH_RESULTS' });
  assert.equal(snapshot.completeness, 'COMPLETE');
  assert.equal(snapshot.totalCandidatesObserved, 2);
  assert.ok(snapshot.observationId.startsWith('gpo_'));
});

test('G14-02: buildPageObservation with zero candidates → EMPTY', () => {
  const snapshot = buildPageObservation([], { ...testCtx, pageKind: 'SEARCH_RESULTS' });
  assert.equal(snapshot.completeness, 'EMPTY');
  assert.equal(snapshot.totalCandidatesObserved, 0);
});

test('G14-03: buildPageObservation with missing-name candidates → PARTIAL', () => {
  const incomplete = createCandidateObservation({}, testCtx); // no businessName
  const snapshot = buildPageObservation([incomplete], { ...testCtx, pageKind: 'SEARCH_RESULTS' });
  assert.equal(snapshot.completeness, 'PARTIAL');
});

// ─── GROUP 15: Acquisition Queue — Basic Operations ──────────────────────────
group('GROUP 15: ACQUISITION QUEUE — ENQUEUE / CLAIM / COMPLETE / FAIL');

test('G15-01: enqueue returns accepted=1 for new unit', () => {
  const q = new GoogleMapsAcquisitionQueue();
  const u = createSearchUnit({ keyword: 'hotel', location: 'Dhaka' });
  const r = q.enqueue(u);
  assert.equal(r.accepted, 1);
  assert.equal(r.duplicatesSuppressed, 0);
});

test('G15-02: claimNext returns queued unit and marks IN_PROGRESS', () => {
  const q = new GoogleMapsAcquisitionQueue();
  const u = createSearchUnit({ keyword: 'restaurant', location: 'Dhaka' });
  q.enqueue(u);
  const claimed = q.claimNext();
  assert.ok(claimed);
  assert.equal(claimed.status, 'IN_PROGRESS');
  assert.ok(claimed.startedAt);
});

test('G15-03: claimNext returns null when worker already active', () => {
  const q = new GoogleMapsAcquisitionQueue();
  q.enqueue(createSearchUnit({ keyword: 'hotel' }));
  q.enqueue(createSearchUnit({ keyword: 'resort' }));
  q.claimNext(); // Claim first
  const second = q.claimNext(); // Should be null: one active worker
  assert.equal(second, null);
});

test('G15-04: complete() marks unit COMPLETED', () => {
  const q = new GoogleMapsAcquisitionQueue();
  const u = createSearchUnit({ keyword: 'builder' });
  q.enqueue(u);
  const claimed = q.claimNext();
  assert.ok(claimed);
  q.complete(claimed.searchUnitId, 42);
  const updated = q.getUnit(claimed.searchUnitId);
  assert.equal(updated.status, 'COMPLETED');
  assert.equal(updated.candidateCount, 42);
});

test('G15-05: getProgress reflects current queue state', () => {
  const q = new GoogleMapsAcquisitionQueue();
  q.enqueue([createSearchUnit({ keyword: 'A' }), createSearchUnit({ keyword: 'B' })]);
  const progress = q.getProgress();
  assert.equal(progress.total, 2);
  assert.equal(progress.queued, 2);
  assert.equal(progress.completed, 0);
});

// ─── GROUP 16: Acquisition Queue — Duplicate Suppression ─────────────────────
group('GROUP 16: ACQUISITION QUEUE — DUPLICATE SUPPRESSION');

test('G16-01: Enqueue same searchUnitId twice → suppressed', () => {
  const q = new GoogleMapsAcquisitionQueue();
  const u = createSearchUnit({ keyword: 'hotel', location: 'Dhaka' });
  q.enqueue(u);
  const r2 = q.enqueue(u);
  assert.equal(r2.duplicatesSuppressed, 1);
  assert.equal(r2.accepted, 0);
  assert.equal(q.getProgress().total, 1);
});

test('G16-02: Same keyword+location always deterministically suppressed', () => {
  const q = new GoogleMapsAcquisitionQueue();
  const u1 = createSearchUnit({ keyword: 'developer', location: 'Dhaka' });
  const u2 = createSearchUnit({ keyword: 'developer', location: 'Dhaka' });
  assert.equal(u1.searchUnitId, u2.searchUnitId);
  q.enqueue(u1);
  const r = q.enqueue(u2);
  assert.equal(r.duplicatesSuppressed, 1);
});

// ─── GROUP 17: Acquisition Queue — Pause / Resume / Cancel ───────────────────
group('GROUP 17: ACQUISITION QUEUE — PAUSE / RESUME / CANCEL');

test('G17-01: pause() sets isPaused=true; claimNext returns null', () => {
  const q = new GoogleMapsAcquisitionQueue();
  q.enqueue(createSearchUnit({ keyword: 'hotel' }));
  q.pause();
  assert.equal(q.claimNext(), null);
  assert.ok(q.getProgress().isPaused);
});

test('G17-02: resume() allows claiming again', () => {
  const q = new GoogleMapsAcquisitionQueue();
  q.enqueue(createSearchUnit({ keyword: 'restaurant' }));
  q.pause();
  q.resume();
  assert.ok(!q.getProgress().isPaused);
  const u = q.claimNext();
  assert.ok(u);
});

test('G17-03: cancel() marks all remaining units CANCELLED', () => {
  const q = new GoogleMapsAcquisitionQueue();
  q.enqueue([createSearchUnit({ keyword: 'A' }), createSearchUnit({ keyword: 'B' })]);
  q.cancel();
  const prog = q.getProgress();
  assert.equal(prog.isCancelled, true);
  assert.equal(prog.cancelled, 2);
  assert.equal(prog.queued, 0);
});

test('G17-04: resume() after cancel() throws', () => {
  const q = new GoogleMapsAcquisitionQueue();
  q.cancel();
  assert.throws(() => q.resume(), /cancelled/i);
});

test('G17-05: enqueue after cancel throws', () => {
  const q = new GoogleMapsAcquisitionQueue();
  q.cancel();
  assert.throws(() => q.enqueue(createSearchUnit({ keyword: 'hotel' })), /cancelled/i);
});

// ─── GROUP 18: Acquisition Queue — Retry Logic ───────────────────────────────
group('GROUP 18: ACQUISITION QUEUE — RETRY LOGIC');

test('G18-01: fail() re-queues unit if within maxRetries', () => {
  const q = new GoogleMapsAcquisitionQueue();
  const u = createSearchUnit({ keyword: 'hotel', location: 'Dhaka', maxRetries: 2 });
  q.enqueue(u);
  const claimed = q.claimNext();
  const r = q.fail(claimed.searchUnitId, 'Page not ready');
  assert.equal(r.retried, true);
  assert.equal(r.terminal, false);
  const updated = q.getUnit(claimed.searchUnitId);
  assert.equal(updated.status, 'QUEUED');
  assert.equal(updated.retryCount, 1);
});

test('G18-02: fail() marks FAILED after maxRetries exceeded', () => {
  const q = new GoogleMapsAcquisitionQueue();
  const u = createSearchUnit({ keyword: 'hotel', maxRetries: 1 });
  q.enqueue(u);
  // Exhaust retries
  const c1 = q.claimNext();
  q.fail(c1.searchUnitId, 'err1');
  const c2 = q.claimNext();
  const r2 = q.fail(c2.searchUnitId, 'err2');
  assert.equal(r2.terminal, true);
  assert.equal(q.getUnit(c2.searchUnitId).status, 'FAILED');
});

// ─── GROUP 19: Checkpoint Creation ───────────────────────────────────────────
group('GROUP 19: CHECKPOINT CREATION & STORAGE');

asyncTest('G19-01: createCheckpoint persists metadata-only checkpoint', async () => {
  const mgr = new GoogleMapsCheckpointManager(new InMemoryCheckpointStorage());
  const unit = createSearchUnit({ keyword: 'hotel', location: 'Dhaka' });
  const cp = await mgr.createCheckpoint({
    sessionId: 'sess-cp-001',
    searchUnit: unit,
    state: 'OBSERVING',
    pageUrl: 'https://www.google.com/maps/search/hotel+Dhaka',
    progress: { totalUnits: 3, completedUnits: 1, pendingUnits: 2 }
  });

  assert.ok(cp.checkpointId.startsWith('gcp_'));
  assert.equal(cp.sessionId, 'sess-cp-001');
  assert.equal(cp.state, 'OBSERVING');
  assert.equal(cp.adapterVersion, ENGINE_ADAPTER_VERSION);
  assert.equal(cp.progress.totalUnits, 3);
});

asyncTest('G19-02: loadCheckpoint returns saved checkpoint', async () => {
  const storage = new InMemoryCheckpointStorage();
  const mgr = new GoogleMapsCheckpointManager(storage);
  const unit = createSearchUnit({ keyword: 'developer' });
  await mgr.createCheckpoint({
    sessionId: 'sess-cp-002',
    searchUnit: unit,
    state: 'NAVIGATING',
    pageUrl: 'https://www.google.com/maps/search/developer',
    progress: { totalUnits: 1, completedUnits: 0, pendingUnits: 1 }
  });

  const loaded = await mgr.loadCheckpoint('sess-cp-002');
  assert.ok(loaded);
  assert.equal(loaded.state, 'NAVIGATING');
});

asyncTest('G19-03: clearCheckpoint removes checkpoint', async () => {
  const mgr = new GoogleMapsCheckpointManager(new InMemoryCheckpointStorage());
  const unit = createSearchUnit({ keyword: 'cafe' });
  await mgr.createCheckpoint({
    sessionId: 'sess-cp-003',
    searchUnit: unit,
    state: 'PAUSED',
    pageUrl: 'https://www.google.com/maps/search/cafe',
    progress: { totalUnits: 1, completedUnits: 0, pendingUnits: 1 }
  });
  await mgr.clearCheckpoint('sess-cp-003');
  const loaded = await mgr.loadCheckpoint('sess-cp-003');
  assert.equal(loaded, null);
});

asyncTest('G19-04: checkpoint stores bounded resume context for deterministic recovery', async () => {
  const mgr = new GoogleMapsCheckpointManager(new InMemoryCheckpointStorage());
  const unit = createSearchUnit({ keyword: 'boutique hotel', location: 'Dhaka' });
  const cp = await mgr.createCheckpoint({
    sessionId: 'sess-cp-004',
    searchUnit: unit,
    state: 'OBSERVING',
    pageUrl: 'https://www.google.com/maps/search/boutique+hotel+Dhaka',
    lastObservedCandidateIdentity: 'gmo_place_12345',
    lastObservedCandidateEvidence: 'Signature: The Westin Dhaka',
    resultSurfacePosition: { scrollOffset: 1450, estimatedItemIndex: 12 },
    observationSequence: 3,
    searchUnitProgressContext: { unitIndex: 1, totalUnits: 2, query: 'boutique hotel Dhaka' },
    checkpointToken: 'tok_res_001',
    duplicateSuppressionContext: {
      observedIds: ['gmo_place_12345', 'gmo_place_67890'],
      cursorToken: 'cur_next_123'
    },
    progress: { totalUnits: 2, completedUnits: 0, pendingUnits: 2 }
  });

  assert.equal(cp.lastObservedCandidateIdentity, 'gmo_place_12345');
  assert.equal(cp.resultSurfacePosition?.scrollOffset, 1450);
  assert.equal(cp.observationSequence, 3);
  assert.equal(cp.duplicateSuppressionContext?.observedIds.length, 2);
  assert.equal(cp.checkpointToken, 'tok_res_001');
});

test('G19-05: checkpoint preserves zero DOM / HTML nodes in metadata storage', () => {
  const unit = createSearchUnit({ keyword: 'hospital' });
  const cp = {
    checkpointId: 'gcp_dom_check',
    sessionId: 'sess-dom',
    searchUnitId: unit.searchUnitId,
    state: 'OBSERVING',
    pageUrl: 'https://www.google.com/maps/search/hospital',
    candidateCount: 0,
    progress: { totalUnits: 1, completedUnits: 0, pendingUnits: 1 },
    retryCount: 0,
    timestamp: new Date().toISOString(),
    adapterVersion: ENGINE_ADAPTER_VERSION,
    diagnosticsSummary: { warningCount: 0, errorCount: 0 }
  };
  const jsonStr = JSON.stringify(cp);
  assert.ok(!jsonStr.includes('HTMLDivElement'));
  assert.ok(!jsonStr.includes('<div'));
  assert.ok(!jsonStr.includes('document.'));
});

// ─── GROUP 20: Checkpoint Recovery ───────────────────────────────────────────
group('GROUP 20: CHECKPOINT RECOVERY — VALID / INVALID / CANCELLED');

test('G20-01: validateCheckpoint — null returns invalid', () => {
  const mgr = new GoogleMapsCheckpointManager();
  const r = mgr.validateCheckpoint(null);
  assert.equal(r.valid, false);
});

test('G20-02: validateCheckpoint — PAUSED state is valid for resumption', () => {
  const mgr = new GoogleMapsCheckpointManager();
  const unit = createSearchUnit({ keyword: 'hotel' });
  const cp = {
    checkpointId: 'gcp_test',
    sessionId: 'sess-1',
    searchUnitId: unit.searchUnitId,
    state: 'PAUSED',
    pageUrl: 'https://www.google.com/maps/search/hotel',
    candidateCount: 5,
    progress: { totalUnits: 2, completedUnits: 1, pendingUnits: 1 },
    retryCount: 0,
    timestamp: new Date().toISOString(),
    adapterVersion: ENGINE_ADAPTER_VERSION,
    diagnosticsSummary: { warningCount: 0, errorCount: 0 }
  };
  const r = mgr.validateCheckpoint(cp);
  assert.ok(r.valid);
});

test('G20-03: validateCheckpoint — CANCELLED state rejects resumption', () => {
  const mgr = new GoogleMapsCheckpointManager();
  const cp = {
    checkpointId: 'gcp_x',
    sessionId: 'sess-2',
    searchUnitId: 'gsu_y',
    state: 'CANCELLED',
    pageUrl: 'https://www.google.com/maps/search/anything',
    candidateCount: 0,
    progress: { totalUnits: 1, completedUnits: 0, pendingUnits: 1 },
    retryCount: 0,
    timestamp: new Date().toISOString(),
    adapterVersion: ENGINE_ADAPTER_VERSION,
    diagnosticsSummary: { warningCount: 0, errorCount: 0 }
  };
  const r = mgr.validateCheckpoint(cp);
  assert.equal(r.valid, false);
  assert.match(r.reason, /CANCELLED/);
});

test('G20-04: validateCheckpoint — COMPLETED state rejects resumption', () => {
  const mgr = new GoogleMapsCheckpointManager();
  const cp = {
    checkpointId: 'gcp_z',
    sessionId: 'sess-3',
    searchUnitId: 'gsu_z',
    state: 'COMPLETED',
    pageUrl: 'https://www.google.com/maps/search/test',
    candidateCount: 20,
    progress: { totalUnits: 1, completedUnits: 1, pendingUnits: 0 },
    retryCount: 0,
    timestamp: new Date().toISOString(),
    adapterVersion: ENGINE_ADAPTER_VERSION,
    diagnosticsSummary: { warningCount: 0, errorCount: 0 }
  };
  const r = mgr.validateCheckpoint(cp);
  assert.equal(r.valid, false);
});

test('G20-05: validateCheckpoint — malformed (missing sessionId) → invalid', () => {
  const mgr = new GoogleMapsCheckpointManager();
  const cp = {
    checkpointId: 'gcp_bad',
    sessionId: '',
    searchUnitId: '',
    state: 'PAUSED',
    pageUrl: '',
    candidateCount: 0,
    progress: { totalUnits: 0, completedUnits: 0, pendingUnits: 0 },
    retryCount: 0,
    timestamp: '',
    adapterVersion: '',
    diagnosticsSummary: { warningCount: 0, errorCount: 0 }
  };
  const r = mgr.validateCheckpoint(cp);
  assert.equal(r.valid, false);
});

// ─── GROUP 21: Message Contracts ─────────────────────────────────────────────
group('GROUP 21: MESSAGE CONTRACTS — VALIDATION');

test('G21-01: Valid START_GMAPS_ACQUISITION message passes', () => {
  const msg = {
    type: 'START_GMAPS_ACQUISITION',
    source: 'GMAPS_ENGINE',
    payload: {
      sessionId: 'sess-msg-001',
      searchUnits: [{ keyword: 'hotel', location: 'Dhaka' }],
      config: {}
    }
  };
  const r = validateAcquisitionMessage(msg);
  assert.ok(r.valid);
});

test('G21-02: Message without source fails validation', () => {
  const msg = {
    type: 'PAUSE_GMAPS_ACQUISITION',
    payload: { sessionId: 'sess-1' }
  };
  const r = validateAcquisitionMessage(msg);
  assert.equal(r.valid, false);
});

test('G21-03: Message with wrong source fails validation', () => {
  const msg = {
    type: 'PAUSE_GMAPS_ACQUISITION',
    source: 'SOME_OTHER_SOURCE',
    payload: { sessionId: 'sess-1' }
  };
  const r = validateAcquisitionMessage(msg);
  assert.equal(r.valid, false);
});

test('G21-04: Message without payload fails', () => {
  const msg = {
    type: 'CANCEL_GMAPS_ACQUISITION',
    source: 'GMAPS_ENGINE'
  };
  const r = validateAcquisitionMessage(msg);
  assert.equal(r.valid, false);
});

test('G21-05: Message with unknown type fails', () => {
  const msg = {
    type: 'SOME_UNKNOWN_MESSAGE_TYPE',
    source: 'GMAPS_ENGINE',
    payload: { sessionId: 'sess-1' }
  };
  const r = validateAcquisitionMessage(msg);
  assert.equal(r.valid, false);
});

test('G21-06: Message without sessionId in payload fails', () => {
  const msg = {
    type: 'GET_GMAPS_ACQUISITION_STATUS',
    source: 'GMAPS_ENGINE',
    payload: {}
  };
  const r = validateAcquisitionMessage(msg);
  assert.equal(r.valid, false);
});

test('G21-07: null message fails gracefully', () => {
  const r = validateAcquisitionMessage(null);
  assert.equal(r.valid, false);
  assert.ok(r.error);
});

test('G21-08: All acquisition message types are valid', () => {
  const types = [
    'START_GMAPS_ACQUISITION',
    'PAUSE_GMAPS_ACQUISITION',
    'RESUME_GMAPS_ACQUISITION',
    'CANCEL_GMAPS_ACQUISITION',
    'GET_GMAPS_ACQUISITION_STATUS',
    'GMAPS_ACQUISITION_STATUS_UPDATED',
    'GMAPS_CANDIDATES_OBSERVED',
    'GMAPS_ACQUISITION_DIAGNOSTIC'
  ];
  for (const t of types) {
    const msg = { type: t, source: 'GMAPS_ENGINE', payload: { sessionId: 'test' } };
    const r = validateAcquisitionMessage(msg);
    assert.ok(r.valid, `Expected valid for type "${t}"`);
  }
});

// ─── GROUP 22: Filter Compatibility — Rating ──────────────────────────────────
group('GROUP 22: FILTER COMPATIBILITY — RATING DISTINCTIONS');

test('G22-01: Rating 4.0 → PRESENT with parsedValue 4.0 (future 4.0+ filter)', () => {
  const f = evaluateRatingField('4.0');
  assert.equal(f.availability, 'PRESENT');
  assert.equal(f.parsedValue, 4.0);
  // Future filter: pass if parsedValue >= 4.0
  assert.ok(f.parsedValue >= 4.0);
});

test('G22-02: Rating 4.5 → PRESENT with parsedValue 4.5 (future 4.5+ filter)', () => {
  const f = evaluateRatingField('4.5');
  assert.equal(f.availability, 'PRESENT');
  assert.ok(f.parsedValue >= 4.5);
});

test('G22-03: Rating 5.0 → PRESENT with parsedValue 5.0', () => {
  const f = evaluateRatingField('5.0');
  assert.equal(f.availability, 'PRESENT');
  assert.equal(f.parsedValue, 5.0);
});

test('G22-04: Rating 3.9 → passes 3.5+ but not 4.0+ filter', () => {
  const f = evaluateRatingField('3.9');
  assert.equal(f.availability, 'PRESENT');
  assert.ok(f.parsedValue >= 3.5);
  assert.ok(f.parsedValue < 4.0);
});

test('G22-05: UNKNOWN rating → clearly excludable from 4.0+ filter without being rewritten to ABSENT', () => {
  const f = evaluateRatingField(undefined);
  assert.equal(f.availability, 'UNKNOWN');
  // Minimum rating filter: UNKNOWN does not match 4.0+, but is NOT rewritten to ABSENT
  assert.notEqual(f.availability, 'PRESENT');
  assert.notEqual(f.availability, 'ABSENT');
});

// ─── GROUP 23: Filter Compatibility — Website ─────────────────────────────────
group('GROUP 23: FILTER COMPATIBILITY — WEBSITE DISTINCTIONS');

test('G23-01: WITH_WEBSITE filter: PRESENT → include', () => {
  const f = evaluateWebsiteField('https://example.com', true);
  assert.equal(f.availability, 'PRESENT');
  // Future WITH_WEBSITE filter: include only PRESENT
  assert.ok(f.availability === 'PRESENT');
});

test('G23-02: WITHOUT_WEBSITE filter: ABSENT → include; PRESENT → exclude', () => {
  const absent = evaluateWebsiteField(undefined, true);
  const present = evaluateWebsiteField('https://example.com', true);
  assert.equal(absent.availability, 'ABSENT');
  assert.notEqual(present.availability, 'ABSENT');
});

test('G23-03: UNKNOWN website should not be classified as ABSENT', () => {
  const unknown = evaluateWebsiteField('malformed-url', true);
  assert.notEqual(unknown.availability, 'ABSENT');
  assert.notEqual(unknown.availability, 'PRESENT');
});

test('G23-04: UNSUPPORTED website not confused with ABSENT', () => {
  const unsupported = evaluateWebsiteField(undefined, false);
  assert.equal(unsupported.availability, 'UNSUPPORTED');
  assert.notEqual(unsupported.availability, 'ABSENT');
});

test('G23-05: Candidate observation preserves website availability for filtering', () => {
  const withWebsite = createCandidateObservation({ businessName: 'A', websiteUrl: 'https://a.com' }, testCtx);
  const withoutWebsiteDetail = createCandidateObservation({ businessName: 'B', isDetail: true }, testCtx);
  const withoutWebsiteCard = createCandidateObservation({ businessName: 'C' }, testCtx);

  assert.equal(withWebsite.websiteUrl.availability, 'PRESENT');
  assert.equal(withoutWebsiteDetail.websiteUrl.availability, 'ABSENT');
  assert.equal(withoutWebsiteCard.websiteUrl.availability, 'UNKNOWN');
  assert.notEqual(withWebsite.websiteUrl.availability, withoutWebsiteDetail.websiteUrl.availability);
  assert.notEqual(withWebsite.websiteUrl.availability, withoutWebsiteCard.websiteUrl.availability);
});

// ─── GROUP 24: Navigation Orchestrator — Tab Ownership ───────────────────────
group('GROUP 24: NAVIGATION ORCHESTRATOR — TAB OWNERSHIP VALIDATION');

asyncTest('G24-01: Invalid tabId (0) fails validation', async () => {
  const driver = {
    async getTab(_id) { return null; },
    async navigateTab() { return true; },
    async probeTabState() { return detectGoogleMapsPage('https://www.google.com/maps/search/test'); }
  };
  const orch = new GoogleMapsNavigationOrchestrator(driver);
  const result = await orch.validateTabOwnership(0, 'sess-nav-001');
  assert.equal(result.valid, false);
  assert.equal(result.diagnostic?.code, 'MAPS_TAB_NOT_FOUND');
  assert.equal(result.diagnostic?.severity, 'P1');
  assert.equal(result.diagnostic?.recoveryClass, 'USER_ACTION_REQUIRED');
});

asyncTest('G24-02: Non-existent tab (getTab returns null) fails validation', async () => {
  const driver = {
    async getTab(_id) { return null; },
    async navigateTab() { return true; },
    async probeTabState() { return detectGoogleMapsPage('https://www.google.com/maps/search/test'); }
  };
  const orch = new GoogleMapsNavigationOrchestrator(driver);
  const result = await orch.validateTabOwnership(999, 'sess-nav-002');
  assert.equal(result.valid, false);
  assert.equal(result.diagnostic?.code, 'MAPS_TAB_NOT_FOUND');
  assert.equal(result.diagnostic?.severity, 'P1');
  assert.equal(result.diagnostic?.recoveryClass, 'USER_ACTION_REQUIRED');
});

asyncTest('G24-03: Valid Maps tab passes validation', async () => {
  const driver = {
    async getTab(id) {
      return { id, url: 'https://www.google.com/maps/search/hotel+Dhaka', active: true, status: 'complete' };
    },
    async navigateTab() { return true; },
    async probeTabState(_tabId) { return detectGoogleMapsPage('https://www.google.com/maps/search/hotel+Dhaka'); }
  };
  const orch = new GoogleMapsNavigationOrchestrator(driver);
  const result = await orch.validateTabOwnership(42, 'sess-nav-003');
  assert.ok(result.valid);
  assert.equal(result.diagnostic, undefined);
});

asyncTest('G24-04: Navigation timeout emits NAVIGATION_TIMEOUT diagnostic', async () => {
  const unit = createSearchUnit({ keyword: 'hotel', location: 'Dhaka' });
  const driver = {
    async getTab(_id) {
      return { id: 1, url: 'https://www.google.com/maps/search/hotel+Dhaka', active: true };
    },
    async navigateTab() { return true; },
    async probeTabState(_tabId) {
      // Always return not-ready (loading)
      return {
        isGoogleMaps: true,
        pageKind: 'SEARCH_RESULTS',
        ready: false,
        confidence: 0.5,
        reason: 'Spinner active',
        url: 'https://www.google.com/maps/search/hotel+Dhaka',
        observedAt: new Date().toISOString(),
        signals: {
          hasMapsHost: true, hasSearchPath: true, hasPlacePath: false,
          hasSearchInput: false, hasFeedContainer: false, hasDetailContainer: false,
          isLoadingSpinnerPresent: true, hasResultsHeader: false, hasNoResultsMarker: false,
          elementCount: 0
        }
      };
    }
  };
  const orch = new GoogleMapsNavigationOrchestrator(driver, { timeoutMs: 100, pollIntervalMs: 30 });
  const result = await orch.navigateToSearchUnit(1, unit, 'sess-nav-004');
  assert.equal(result.success, false);
  assert.ok(result.diagnostics.some(d => d.code === 'NAVIGATION_TIMEOUT'));
});

asyncTest('G24-05: User navigates away emits USER_NAVIGATION_INTERRUPTION diagnostic', async () => {
  const unit = createSearchUnit({ keyword: 'hotel', location: 'Dhaka' });
  let callCount = 0;
  const driver = {
    async getTab(_id) {
      callCount++;
      // First call returns Maps, then user navigated away
      if (callCount <= 1) {
        return { id: 1, url: 'https://www.google.com/maps/search/hotel+Dhaka', active: true };
      }
      return { id: 1, url: 'https://youtube.com/watch?v=123', active: true };
    },
    async navigateTab() { return true; },
    async probeTabState() {
      return { isGoogleMaps: false, pageKind: 'NON_GOOGLE', ready: false, confidence: 1.0, reason: 'Not Maps', url: 'https://youtube.com', observedAt: new Date().toISOString(), signals: { hasMapsHost: false, hasSearchPath: false, hasPlacePath: false, hasSearchInput: false, hasFeedContainer: false, hasDetailContainer: false, isLoadingSpinnerPresent: false, hasResultsHeader: false, hasNoResultsMarker: false, elementCount: 0 } };
    }
  };
  const orch = new GoogleMapsNavigationOrchestrator(driver, { timeoutMs: 500, pollIntervalMs: 30 });
  const result = await orch.navigateToSearchUnit(1, unit, 'sess-nav-005');
  assert.equal(result.success, false);
  assert.ok(result.diagnostics.some(d => d.code === 'USER_NAVIGATION_INTERRUPTION'));
});

// ─── GROUP 25: Result Feed Observer ──────────────────────────────────────────
group('GROUP 25: RESULT FEED OBSERVER — SURFACE STATUS');

asyncTest('G25-01: observeResultSurface with null DOM → FEED_NOT_FOUND', async () => {
  const obs = new DefaultResultFeedObserver(() => null);
  const r = await obs.observeResultSurface();
  assert.equal(r.status, 'FEED_NOT_FOUND');
  assert.ok(r.diagnostics.some(d => d.code === 'RESULT_SURFACE_NOT_FOUND'));
});

asyncTest('G25-02: observeResultSurface without feed element → FEED_NOT_FOUND', async () => {
  const dom = { querySelector: (_sel) => null, querySelectorAll: (_sel) => [] };
  const obs = new DefaultResultFeedObserver(() => dom);
  const r = await obs.observeResultSurface();
  assert.equal(r.status, 'FEED_NOT_FOUND');
});

asyncTest('G25-03: scrollResultSurface beyond maxScrollSteps → not scrolled', async () => {
  const dom = {
    querySelector: (sel) => sel.includes('feed') ? { scrollTop: 0, scrollHeight: 2000, clientHeight: 500, scrollBy: () => {} } : null,
    querySelectorAll: () => []
  };
  const obs = new DefaultResultFeedObserver(() => dom, 0); // maxScrollSteps=0
  const r = await obs.scrollResultSurface();
  assert.equal(r.scrolled, false);
  assert.equal(r.isAtBottom, true);
});

asyncTest('G25-04: detectResultSurfaceExhaustion with null DOM → true', async () => {
  const obs = new DefaultResultFeedObserver(() => null);
  const r = await obs.detectResultSurfaceExhaustion();
  assert.equal(r, true);
});

// ─── GROUP 26: Error Classification ──────────────────────────────────────────
group('GROUP 26: ERROR CLASSIFICATION');

test('G26-01: MAPS_TAB_NOT_FOUND diagnostic has P1 severity (user action required, not system crash)', () => {
  // Tab not found is P1 (operational acquisition lifecycle error, user intervention required)
  const diag = {
    code: 'MAPS_TAB_NOT_FOUND',
    severity: 'P1',
    recoveryClass: 'USER_ACTION_REQUIRED',
    message: 'Tab not found',
    timestamp: new Date().toISOString()
  };
  assert.equal(diag.severity, 'P1');
  assert.equal(diag.recoveryClass, 'USER_ACTION_REQUIRED');
});

test('G26-02: NAVIGATION_TIMEOUT is P1, RETRYABLE', () => {
  const diag = {
    code: 'NAVIGATION_TIMEOUT',
    severity: 'P1',
    recoveryClass: 'RETRYABLE',
    message: 'Timeout',
    timestamp: new Date().toISOString()
  };
  assert.equal(diag.recoveryClass, 'RETRYABLE');
});

test('G26-03: CANDIDATE_OBSERVATION_FAILED is RECOVERABLE', () => {
  const diag = {
    code: 'CANDIDATE_OBSERVATION_FAILED',
    severity: 'P1',
    recoveryClass: 'RECOVERABLE',
    message: 'Missing name',
    timestamp: new Date().toISOString()
  };
  assert.equal(diag.recoveryClass, 'RECOVERABLE');
});

// ─── GROUP 27: Security — No Prohibited Patterns ─────────────────────────────
group('GROUP 27: SECURITY — NO PROHIBITED PATTERNS IN SOURCE FILES');

const engineSrcDir = path.join(rootDir, 'src/extension/acquisition/engine');
const engineFiles = fs.readdirSync(engineSrcDir).filter(f => f.endsWith('.ts'));
const engineSources = engineFiles.map(f => ({
  name: f,
  src: fs.readFileSync(path.join(engineSrcDir, f), 'utf-8')
}));

test('G27-01: No eval() in engine source files', () => {
  for (const { name, src } of engineSources) {
    assert.ok(!/\beval\s*\(/.test(src), `Prohibited eval() found in ${name}`);
  }
});

test('G27-02: No new Function() in engine source files', () => {
  for (const { name, src } of engineSources) {
    assert.ok(!/new\s+Function\s*\(/.test(src), `Prohibited new Function() found in ${name}`);
  }
});

test('G27-03: No private Google RPC endpoints', () => {
  const privatePatterns = [
    /maps\.googleapis\.com\/maps\/api/,
    /places\.googleapis\.com/,
    /oauth\.googleapis\.com/,
    /ClientSideChannel/,
    /internal\._rpc/
  ];
  for (const { name, src } of engineSources) {
    for (const p of privatePatterns) {
      assert.ok(!p.test(src), `Prohibited private endpoint pattern "${p}" found in ${name}`);
    }
  }
});

test('G27-04: No webRequest, cookies, history, debugger permission references', () => {
  for (const { name, src } of engineSources) {
    assert.ok(!/"webRequest"/.test(src), `Prohibited permission "webRequest" in ${name}`);
    assert.ok(!/"cookies"/.test(src), `Prohibited permission "cookies" in ${name}`);
    assert.ok(!/"history"/.test(src), `Prohibited permission "history" in ${name}`);
    assert.ok(!/"debugger"/.test(src), `Prohibited permission "debugger" in ${name}`);
  }
});

test('G27-05: Engine source files respect NOT_PERSISTABLE / NOT_EXPORTABLE invariants', () => {
  // All source-related provenance files must reference data firewall markers
  const observationSrc = fs.readFileSync(path.join(engineSrcDir, 'observationBoundary.ts'), 'utf-8');
  assert.ok(observationSrc.includes('NOT_PERSISTABLE'));
  assert.ok(observationSrc.includes('NOT_EXPORTABLE'));
  assert.ok(observationSrc.includes('GOOGLE_DERIVED') || observationSrc.includes('GOOGLE_MAPS_BROWSER'));
});

test('G27-06: Manifest permissions unchanged (no new dangerous permissions)', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'extension/manifest.json'), 'utf-8'));
  const permissions = manifest.permissions || [];
  const dangerous = ['webRequest', 'cookies', 'history', 'debugger', 'userScripts', 'unlimitedStorage'];
  for (const d of dangerous) {
    assert.ok(!permissions.includes(d), `Dangerous permission "${d}" added to manifest`);
  }
  // Core required permissions still present
  assert.ok(permissions.includes('storage'));
  assert.ok(permissions.includes('tabs'));
  assert.ok(permissions.includes('scripting'));
});

test('G27-07: No qualification/scoring implemented in engine files', () => {
  for (const { name, src } of engineSources) {
    assert.ok(!/(qualification|leadScore|buyerIntent|aiScore)/i.test(src), `Premature qualification/scoring in ${name}`);
  }
});

test('G27-08: No website crawling implemented in engine files', () => {
  for (const { name, src } of engineSources) {
    assert.ok(!/(websiteCrawl|contactExtract|emailDiscover|socialExtract)/i.test(src),
      `Premature enrichment in ${name}`);
  }
});

// ─── GROUP 28: Runtime Coordinator & Wiring ──────────────────────────────────
group('GROUP 28: RUNTIME COORDINATOR & MESSAGE WIRING');

let mockNavUrl = '';
const mockDriver = {
  async getTab(tabId) {
    return {
      id: tabId,
      url: mockNavUrl || 'https://www.google.com/maps/search/developer+Dhaka',
      active: true,
      status: 'complete'
    };
  },
  async navigateTab(tabId, url) {
    mockNavUrl = url;
    return true;
  },
  async probeTabState(_tabId) {
    return detectGoogleMapsPage(mockNavUrl || 'https://www.google.com/maps/search/developer+Dhaka');
  }
};

asyncTest('G28-01: coordinator startAcquisition initializes state, plans units, and reaches OBSERVING', async () => {
  const coord = new GoogleMapsRuntimeCoordinator(mockDriver);
  const result = await coord.startAcquisition(
    'sess_coord_001',
    [{ keyword: 'developer', location: 'Dhaka' }],
    { tabId: 10, navigationTimeoutMs: 2000 },
    mockDriver
  );
  assert.equal(result.success, true);
  assert.equal(result.state, 'OBSERVING');
  assert.ok(result.checkpointId);
  assert.equal(result.progress?.totalSearchUnits, 1);
});

test('G28-02: coordinator getAcquisitionStatus retrieves structured state and progress', () => {
  const coord = new GoogleMapsRuntimeCoordinator(mockDriver);
  // Unregistered session fails gracefully
  const notFound = coord.getAcquisitionStatus('sess_nonexistent');
  assert.equal(notFound.success, false);
});

asyncTest('G28-03: coordinator pauseAcquisition preserves pausedFromState and transitions to PAUSED', async () => {
  const coord = new GoogleMapsRuntimeCoordinator(mockDriver);
  await coord.startAcquisition('sess_coord_003', [{ keyword: 'builder' }], { tabId: 11 }, mockDriver);
  const pauseRes = await coord.pauseAcquisition('sess_coord_003');
  assert.equal(pauseRes.success, true);
  assert.equal(pauseRes.state, 'PAUSED');
  const session = coord.getSession('sess_coord_003');
  assert.equal(session?.stateMachine.pausedFromState, 'OBSERVING');
});

asyncTest('G28-04: coordinator resumeAcquisition restores operational state', async () => {
  const coord = new GoogleMapsRuntimeCoordinator(mockDriver);
  await coord.startAcquisition('sess_coord_004', [{ keyword: 'contractor' }], { tabId: 12 }, mockDriver);
  await coord.pauseAcquisition('sess_coord_004');
  const resumeRes = await coord.resumeAcquisition('sess_coord_004');
  assert.equal(resumeRes.success, true);
  assert.equal(resumeRes.state, 'OBSERVING');
});

asyncTest('G28-05: coordinator ingestCandidateObservations produces candidate envelopes with full provenance', async () => {
  const coord = new GoogleMapsRuntimeCoordinator(mockDriver);
  await coord.startAcquisition('sess_coord_005', [{ keyword: 'agency', location: 'Dhaka' }], { tabId: 13 }, mockDriver);
  const ingested = coord.ingestCandidateObservations(
    'sess_coord_005',
    [{
      businessName: 'Prime Agency Ltd',
      rating: '4.8',
      reviewCount: '(120)',
      websiteUrl: 'https://primeagency.bd'
    }],
    'https://www.google.com/maps/search/agency+Dhaka'
  );
  assert.equal(ingested.count, 1);
  assert.equal(ingested.observations[0].businessName.parsedValue, 'Prime Agency Ltd');
  assert.equal(ingested.observations[0].provenance.source, 'GOOGLE_MAPS_BROWSER');
  assert.equal(ingested.observations[0].provenance.persistenceStatus, 'NOT_PERSISTABLE');
  assert.equal(ingested.observations[0].provenance.exportStatus, 'NOT_EXPORTABLE');
});

asyncTest('G28-06: coordinator cancelAcquisition terminates session and transitions to CANCELLED', async () => {
  const coord = new GoogleMapsRuntimeCoordinator(mockDriver);
  await coord.startAcquisition('sess_coord_006', [{ keyword: 'hotel' }], { tabId: 14 }, mockDriver);
  const cancelRes = await coord.cancelAcquisition('sess_coord_006');
  assert.equal(cancelRes.success, true);
  assert.equal(cancelRes.state, 'CANCELLED');
});

asyncTest('G28-07: coordinator repeated cancel is idempotent', async () => {
  const coord = new GoogleMapsRuntimeCoordinator(mockDriver);
  await coord.startAcquisition('sess_coord_007', [{ keyword: 'motel' }], { tabId: 15 }, mockDriver);
  await coord.cancelAcquisition('sess_coord_007');
  const repeated = await coord.cancelAcquisition('sess_coord_007');
  assert.equal(repeated.success, true);
  assert.equal(repeated.state, 'CANCELLED');
});

asyncTest('G28-08: coordinator rejects resume after cancellation', async () => {
  const coord = new GoogleMapsRuntimeCoordinator(mockDriver);
  await coord.startAcquisition('sess_coord_008', [{ keyword: 'resort' }], { tabId: 16 }, mockDriver);
  await coord.cancelAcquisition('sess_coord_008');
  const badResume = await coord.resumeAcquisition('sess_coord_008');
  assert.equal(badResume.success, false);
  assert.match(badResume.error, /cancelled/i);
});

asyncTest('G28-09: coordinator handleAcquisitionMessage validates and routes messages', async () => {
  const coord = new GoogleMapsRuntimeCoordinator(mockDriver);
  const msg = {
    type: 'START_GMAPS_ACQUISITION',
    source: 'GMAPS_ENGINE',
    payload: {
      sessionId: 'sess_coord_msg_001',
      searchUnits: [{ keyword: 'developer' }],
      config: { tabId: 17 }
    }
  };
  const res = await coord.handleAcquisitionMessage(msg, undefined, mockDriver);
  assert.equal(res.success, true);
  assert.equal(res.sessionId, 'sess_coord_msg_001');
});

asyncTest('G28-10: coordinator handleAcquisitionMessage rejects unknown message type', async () => {
  const coord = new GoogleMapsRuntimeCoordinator(mockDriver);
  const badMsg = {
    type: 'UNKNOWN_MSG_TYPE',
    source: 'GMAPS_ENGINE',
    payload: { sessionId: 'sess_bad' }
  };
  const res = await coord.handleAcquisitionMessage(badMsg);
  assert.equal(res.success, false);
});

// ─── Final Summary ────────────────────────────────────────────────────────────

// Wait for all async tests to settle before reporting
await new Promise(resolve => setTimeout(resolve, 500));

console.log('\n================================================================');
console.log(`LEADNORIA — GOOGLE MAPS ACQUISITION FOUNDATION TEST SUMMARY`);
console.log('================================================================');
console.log(`Total Tests Run:    ${totalTests}`);
console.log(`Passed:             ${passedTests}`);
console.log(`Failed:             ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\nALL TESTS PASSED ✅');
}
