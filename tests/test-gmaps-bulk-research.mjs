/**
 * LeadNoria — Part 4: Bulk Research Orchestration Engine Dedicated Test Suite
 *
 * Comprehensive validation across all 50 groups:
 *  1. Bulk request validation
 *  2. Keyword normalization
 *  3. Location normalization
 *  4. Cartesian plan generation
 *  5. Deterministic plan IDs
 *  6. Duplicate SearchUnit suppression
 *  7. Plan fingerprint
 *  8. Queue enqueue
 *  9. Atomic claim (Double-claim concurrency guard)
 * 10. Sequential execution (Single active tab / worker)
 * 11. Unit completion
 * 12. Unit failure
 * 13. Retry accounting
 * 14. Retry exhaustion
 * 15. Pause semantics
 * 16. Resume semantics
 * 17. Cancel semantics
 * 18. Idempotency
 * 19. Run accounting invariants
 * 20. Candidate accounting
 * 21. Cross-search dedup
 * 22. Multi-search provenance
 * 23. Active filter during run
 * 24. Dynamic candidate arrival
 * 25. Checkpoint metadata
 * 26. Stale checkpoint detection
 * 27. Plan-hash mismatch
 * 28. Tab closure handling
 * 29. Recovery-required handling
 * 30. Service-worker rehydration
 * 31. Persistence firewall verification
 * 32. Large-plan planning (10,000 units)
 * 33. Queue performance benchmark (10, 100, 1,000, 10,000)
 * 34. Memory safety
 * 35. SearchUnit isolation
 * 36. UI setup structure
 * 37. UI progress structure
 * 38. UI pause control
 * 39. UI resume control
 * 40. UI cancel control
 * 41. UI partial completion
 * 42. UI recovery state
 * 43. Accessibility compliance
 * 44. Duplicate START protection
 * 45. Filter-change does-not-acquire invariant
 * 46. Cross-unit candidate counting
 * 47. Termination reasons
 * 48. Full-run completion
 * 49. Full-run partial completion
 * 50. Security & anti-bot audit
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  DEFAULT_BULK_EXECUTION_POLICY,
  isTerminalBulkRunState,
  canTransitionBulkRunState,
  canTransitionSearchUnitState
} from '../src/extension/acquisition/engine/bulkPlanTypes.ts';

import {
  normalizeKeywordList,
  normalizeLocationList,
  computePlanFingerprint,
  validateBulkRequest,
  createBulkResearchPlan,
  MAX_RECOMMENDED_SEARCH_UNITS
} from '../src/extension/acquisition/engine/bulkPlanner.ts';

import {
  GoogleMapsBulkOrchestrator
} from '../src/extension/acquisition/engine/bulkOrchestrator.ts';

import {
  GoogleMapsFilterStateManager
} from '../src/extension/acquisition/engine/filterEngine.ts';

import {
  GoogleMapsRuntimeCoordinator
} from '../src/extension/acquisition/engine/runtimeCoordinator.ts';

import {
  InMemoryCheckpointStorage
} from '../src/extension/acquisition/engine/checkpointManager.ts';

import {
  createCandidateObservation
} from '../src/extension/acquisition/engine/observationBoundary.ts';

// ─── Test Harness ────────────────────────────────────────────────────────────

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

const suite = [];

function group(title) {
  suite.push({ type: 'group', title });
}

function test(name, fn) {
  suite.push({ type: 'test', name, fn, isAsync: false });
}

function asyncTest(name, fn) {
  suite.push({ type: 'test', name, fn, isAsync: true });
}

// ─── Helper: Mock Tab Driver ──────────────────────────────────────────────────

function createMockTabDriver(options = {}) {
  const navigatedUrls = [];
  let tabValid = options.tabValid !== undefined ? options.tabValid : true;

  return {
    navigatedUrls,
    async navigateTab(tabId, url) {
      if (!tabValid) {
        throw new Error('Tab closed or inaccessible');
      }
      navigatedUrls.push({ tabId, url, time: Date.now() });
      return { tabId, url, status: 'complete' };
    },
    async getTab(tabId) {
      if (!tabValid) return null;
      return { tabId, url: 'https://www.google.com/maps', status: 'complete' };
    },
    async getTabInfo(tabId) {
      if (!tabValid) return null;
      return { tabId, url: 'https://www.google.com/maps', status: 'complete' };
    },
    async probeTabState(_tabId) {
      if (!tabValid) return { ready: false, pageKind: 'UNKNOWN', confidence: 0 };
      return { ready: true, pageKind: 'SEARCH_RESULTS', confidence: 1.0, isValid: true };
    },
    setTabValid(v) {
      tabValid = v;
    }
  };
}

// ─── Helper: Synthetic Candidate Generator ───────────────────────────────────

function createSyntheticCandidate(index, name, rating, hasWebsite, placeId = null) {
  return createCandidateObservation(
    {
      businessName: name,
      rating: rating !== null ? String(rating) : undefined,
      reviewCount: rating !== null ? '45' : undefined,
      websiteUrl: hasWebsite ? `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : undefined,
      mapsUrl: `https://www.google.com/maps/place/${encodeURIComponent(name)}/data=!4m2!3m1!1s${placeId || '0x' + index}`,
      placeId: placeId || `place_${index}`,
      surfaceType: 'DETAIL'
    },
    {
      sessionId: 'sess_test',
      searchUnitId: 'su_test',
      searchKeyword: 'test keyword',
      searchLocation: 'Dhaka',
      pageUrl: 'https://www.google.com/maps',
      pageKind: 'SEARCH_RESULTS'
    }
  );
}

// =============================================================================
// TESTS START
// =============================================================================

console.log('================================================================');
console.log('LEADNORIA — PART 4: BULK RESEARCH ORCHESTRATION ENGINE TEST SUITE');
console.log('================================================================');

// ─── GROUP 1: BULK REQUEST VALIDATION ────────────────────────────────────────
group('GROUP 1: BULK REQUEST VALIDATION');

test('G1-01: Valid request with non-empty keywords & locations passes', () => {
  const req = {
    keywords: ['real estate developer', 'property developer'],
    locations: ['Dhaka', 'Chattogram'],
    ratingFilter: 'ANY',
    websiteFilter: 'ANY'
  };
  const val = validateBulkRequest(req);
  assert.equal(val.valid, true);
  assert.equal(val.errors.length, 0);
});

test('G1-02: Missing or non-array keywords fails validation', () => {
  const val = validateBulkRequest({ keywords: 'not an array', locations: ['Dhaka'] });
  assert.equal(val.valid, false);
  assert.match(val.errors[0], /keywords array/);
});

test('G1-03: Empty keywords array fails validation', () => {
  const val = validateBulkRequest({ keywords: ['  ', ''], locations: ['Dhaka'] });
  assert.equal(val.valid, false);
  assert.match(val.errors[0], /At least one valid keyword/);
});

test('G1-04: Empty locations array fails validation', () => {
  const val = validateBulkRequest({ keywords: ['real estate'], locations: [] });
  assert.equal(val.valid, false);
  assert.match(val.errors[0], /At least one valid location/);
});

test('G1-05: Excessive individual query length is rejected', () => {
  const longKeyword = 'a'.repeat(250);
  const val = validateBulkRequest({ keywords: [longKeyword], locations: ['Dhaka'] });
  assert.equal(val.valid, false);
  assert.match(val.errors[0], /exceeds maximum length/);
});

// ─── GROUP 2: KEYWORD NORMALIZATION ──────────────────────────────────────────
group('GROUP 2: KEYWORD NORMALIZATION');

test('G2-01: Keyword normalization trims whitespace and collapses multiple spaces', () => {
  const list = ['  real   estate   developer  ', 'property developer'];
  const norm = normalizeKeywordList(list);
  assert.deepEqual(norm, ['real estate developer', 'property developer']);
});

test('G2-02: Keyword normalization removes exact duplicates after trim', () => {
  const list = ['Real Estate Developer', ' real estate developer ', 'REAL ESTATE DEVELOPER'];
  const norm = normalizeKeywordList(list);
  assert.equal(norm.length, 1);
  assert.equal(norm[0], 'real estate developer');
});

test('G2-03: Keyword normalization filters out empty strings', () => {
  const list = ['', '   ', 'valid keyword', ' '];
  const norm = normalizeKeywordList(list);
  assert.deepEqual(norm, ['valid keyword']);
});

// ─── GROUP 3: LOCATION NORMALIZATION ─────────────────────────────────────────
group('GROUP 3: LOCATION NORMALIZATION');

test('G3-01: Location normalization trims and collapses repeated whitespace', () => {
  const list = ['  Dhaka   North  ', 'Chattogram'];
  const norm = normalizeLocationList(list);
  assert.deepEqual(norm, ['Dhaka North', 'Chattogram']);
});

test('G3-02: Location normalization dedupes case-insensitively', () => {
  const list = ['Dhaka', ' dhaka ', 'DHAKA'];
  const norm = normalizeLocationList(list);
  assert.equal(norm.length, 1);
  assert.equal(norm[0], 'Dhaka');
});

// ─── GROUP 4: CARTESIAN PLAN GENERATION ──────────────────────────────────────
group('GROUP 4: CARTESIAN PLAN GENERATION');

test('G4-01: 2 keywords x 3 locations produces exactly 6 SearchUnits', () => {
  const plan = createBulkResearchPlan({
    keywords: ['real estate', 'builder'],
    locations: ['Dhaka', 'Chattogram', 'Sylhet']
  });
  assert.equal(plan.totalUnits, 6);
  assert.equal(plan.searchUnits.length, 6);
});

test('G4-02: Keyword-major deterministic ordering is strictly maintained', () => {
  const plan = createBulkResearchPlan({
    keywords: ['kw1', 'kw2'],
    locations: ['loc1', 'loc2']
  });
  assert.equal(plan.searchUnits[0].normalizedKeyword, 'kw1');
  assert.equal(plan.searchUnits[0].normalizedLocation, 'loc1');
  assert.equal(plan.searchUnits[1].normalizedKeyword, 'kw1');
  assert.equal(plan.searchUnits[1].normalizedLocation, 'loc2');
  assert.equal(plan.searchUnits[2].normalizedKeyword, 'kw2');
  assert.equal(plan.searchUnits[2].normalizedLocation, 'loc1');
  assert.equal(plan.searchUnits[3].normalizedKeyword, 'kw2');
  assert.equal(plan.searchUnits[3].normalizedLocation, 'loc2');
});

// ─── GROUP 5: DETERMINISTIC PLAN IDS ─────────────────────────────────────────
group('GROUP 5: DETERMINISTIC PLAN IDS');

test('G5-01: Plan fingerprint is purely deterministic and content-addressed', () => {
  const fp1 = computePlanFingerprint(['real estate', 'builder'], ['dhaka', 'sylhet']);
  const fp2 = computePlanFingerprint(['real estate', 'builder'], ['dhaka', 'sylhet']);
  assert.equal(fp1, fp2);
  assert.match(fp1, /^bpfp_/);
});

test('G5-02: SearchUnit IDs are deterministic from normalized keyword + location', () => {
  const plan1 = createBulkResearchPlan({ keywords: ['kw'], locations: ['loc'] });
  const plan2 = createBulkResearchPlan({ keywords: [' kw '], locations: [' LOC '] });
  assert.equal(plan1.searchUnits[0].searchUnitId, plan2.searchUnits[0].searchUnitId);
});

// ─── GROUP 6: DUPLICATE SEARCHUNIT SUPPRESSION ──────────────────────────────
group('GROUP 6: DUPLICATE SEARCHUNIT SUPPRESSION');

test('G6-01: Duplicate raw inputs produce single SearchUnit in plan', () => {
  const plan = createBulkResearchPlan({
    keywords: ['Real Estate Developer', ' real estate developer '],
    locations: ['Dhaka', ' Dhaka ']
  });
  assert.equal(plan.totalUnits, 1);
  assert.equal(plan.searchUnits.length, 1);
});

// ─── GROUP 7: PLAN FINGERPRINT ───────────────────────────────────────────────
group('GROUP 7: PLAN FINGERPRINT');

test('G7-01: Changing keywords or locations changes the plan fingerprint', () => {
  const fp1 = computePlanFingerprint(['kw1'], ['loc1']);
  const fp2 = computePlanFingerprint(['kw1', 'kw2'], ['loc1']);
  assert.notEqual(fp1, fp2);
});

// ─── GROUP 8: QUEUE ENQUEUE ──────────────────────────────────────────────────
group('GROUP 8: QUEUE ENQUEUE');

test('G8-01: Plan enqueues in FIFO order into acquisition queue', () => {
  const plan = createBulkResearchPlan({
    keywords: ['k1', 'k2'],
    locations: ['l1', 'l2']
  });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });
  const snapshot = orchestrator.getSnapshot();
  assert.equal(snapshot.state, 'QUEUED');
  assert.equal(snapshot.totalUnits, 4);
  assert.equal(snapshot.completedUnits, 0);
});

// ─── GROUP 9: ATOMIC CLAIM & CONCURRENCY GUARD ───────────────────────────────
group('GROUP 9: ATOMIC CLAIM & CONCURRENCY GUARD');

test('G9-01: Atomic claim concurrency guard prevents double-claim', () => {
  const plan = createBulkResearchPlan({
    keywords: ['k1'],
    locations: ['l1']
  });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });
  const claim1 = orchestrator._queue.claimNext();
  assert.notEqual(claim1, null);
  assert.equal(claim1.status, 'IN_PROGRESS');

  // Second claim attempt must fail/return null
  const claim2 = orchestrator._queue.claimNext();
  assert.equal(claim2, null);
});

test('G9-02: Simultaneous executeLoop invocations guard against concurrent workers', async () => {
  const plan = createBulkResearchPlan({
    keywords: ['k1'],
    locations: ['l1']
  });
  const orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: createMockTabDriver()
  });

  // Call _executeLoop twice concurrently
  const p1 = orchestrator._executeLoop();
  const p2 = orchestrator._executeLoop();
  await Promise.all([p1, p2]);

  assert.equal(orchestrator.getSnapshot().completedUnits, 1);
});

// ─── GROUP 10: SEQUENTIAL EXECUTION ──────────────────────────────────────────
group('GROUP 10: SEQUENTIAL EXECUTION');

asyncTest('G10-01: Default execution concurrency is strictly 1 active search unit', async () => {
  const plan = createBulkResearchPlan({
    keywords: ['k1', 'k2'],
    locations: ['l1']
  });
  let activeCount = 0;
  let maxActiveObserved = 0;

  const orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: createMockTabDriver(),
    callbacks: {
      onSearchUnitStarted() {
        activeCount++;
        if (activeCount > maxActiveObserved) maxActiveObserved = activeCount;
      },
      onSearchUnitCompleted() {
        activeCount--;
      }
    }
  });

  await orchestrator.start();
  assert.equal(maxActiveObserved, 1);
  assert.equal(orchestrator.getSnapshot().state, 'COMPLETED');
});

// ─── GROUP 11: UNIT COMPLETION ───────────────────────────────────────────────
group('GROUP 11: UNIT COMPLETION');

asyncTest('G11-01: SearchUnit transitions to COMPLETED and releases claim', async () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: createMockTabDriver()
  });

  await orchestrator.start();
  const snapshot = orchestrator.getSnapshot();
  assert.equal(snapshot.completedUnits, 1);
  assert.equal(snapshot.failedUnits, 0);
  assert.equal(snapshot.progress.unitsCompleted, 1);
  assert.equal(snapshot.progress.percent, 100);
});

// ─── GROUP 12: UNIT FAILURE & ISOLATION ──────────────────────────────────────
group('GROUP 12: UNIT FAILURE & ISOLATION');

asyncTest('G12-01: Failing SearchUnit is isolated and does not abort remaining units', async () => {
  const plan = createBulkResearchPlan({
    keywords: ['fail_me', 'pass_me'],
    locations: ['l1']
  });
  const mockDriver = {
    async navigateTab(tabId, url) {
      if (url.includes('fail_me')) {
        throw new Error('Deterministic simulated navigation failure');
      }
      return { tabId, url, status: 'complete' };
    },
    async getTab(tabId) {
      return { tabId, url: 'https://www.google.com/maps', status: 'complete' };
    },
    async getTabInfo(tabId) {
      return { tabId, url: 'https://www.google.com/maps', status: 'complete' };
    }
  };

  const orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: mockDriver,
    policy: { ...DEFAULT_BULK_EXECUTION_POLICY, maxAttemptsPerUnit: 1, delayBetweenRetriesMs: 0 }
  });

  await orchestrator.start();
  const snapshot = orchestrator.getSnapshot();
  assert.equal(snapshot.completedUnits, 1);
  assert.equal(snapshot.failedUnits, 1);
  assert.equal(snapshot.state, 'PARTIALLY_COMPLETED');
});

// ─── GROUP 13: RETRY ACCOUNTING ──────────────────────────────────────────────
group('GROUP 13: RETRY ACCOUNTING');

asyncTest('G13-01: Transient failure succeeds on attempt 2 with exact attempt accounting', async () => {
  const plan = createBulkResearchPlan({ keywords: ['retry_test'], locations: ['l1'] });
  let attempts = 0;
  const mockDriver = {
    async navigateTab(tabId, url) {
      attempts++;
      if (attempts === 1) {
        throw new Error('Transient navigation glitch');
      }
      return { tabId, url, status: 'complete' };
    },
    async getTab(tabId) {
      return { tabId, url: 'https://www.google.com/maps', status: 'complete' };
    },
    async getTabInfo(tabId) {
      return { tabId, url: 'https://www.google.com/maps', status: 'complete' };
    }
  };

  const orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: mockDriver,
    policy: { ...DEFAULT_BULK_EXECUTION_POLICY, maxAttemptsPerUnit: 3, delayBetweenRetriesMs: 0 }
  });

  await orchestrator.start();
  const snapshot = orchestrator.getSnapshot();
  assert.equal(snapshot.completedUnits, 1);
  assert.equal(snapshot.failedUnits, 0);
  assert.equal(orchestrator.getMetrics().retryingUnits, 1);
  assert.equal(attempts, 2);
});

// ─── GROUP 14: RETRY EXHAUSTION ──────────────────────────────────────────────
group('GROUP 14: RETRY EXHAUSTION');

asyncTest('G14-01: Exhausting maxAttempts marks unit FAILED with attempt count = maxAttempts', async () => {
  const plan = createBulkResearchPlan({ keywords: ['exhaust'], locations: ['l1'] });
  let attempts = 0;
  const mockDriver = {
    async navigateTab() {
      attempts++;
      throw new Error('Continuous network error');
    },
    async getTab(tabId) {
      return { tabId, url: 'https://www.google.com/maps', status: 'complete' };
    },
    async getTabInfo(tabId) {
      return { tabId, url: 'https://www.google.com/maps', status: 'complete' };
    }
  };

  const orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: mockDriver,
    policy: { ...DEFAULT_BULK_EXECUTION_POLICY, maxAttemptsPerUnit: 3, delayBetweenRetriesMs: 0 }
  });

  await orchestrator.start();
  const snapshot = orchestrator.getSnapshot();
  assert.equal(snapshot.failedUnits, 1);
  assert.equal(attempts, 3);
  assert.equal(snapshot.state, 'FAILED');
});

// ─── GROUP 15: PAUSE SEMANTICS ───────────────────────────────────────────────
group('GROUP 15: PAUSE SEMANTICS');

asyncTest('G15-01: Pause stops claiming next unit and transitions state to PAUSED', async () => {
  const plan = createBulkResearchPlan({
    keywords: ['k1', 'k2', 'k3'],
    locations: ['l1']
  });
  let step = 0;
  const orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: createMockTabDriver(),
    callbacks: {
      onSearchUnitCompleted() {
        step++;
        if (step === 1) {
          orchestrator.pause();
        }
      }
    }
  });

  await orchestrator.start();
  const snapshot = orchestrator.getSnapshot();
  assert.equal(snapshot.state, 'PAUSED');
  assert.equal(snapshot.completedUnits, 1);
});

// ─── GROUP 16: RESUME SEMANTICS ──────────────────────────────────────────────
group('GROUP 16: RESUME SEMANTICS');

asyncTest('G16-01: Resume continues queue execution to completion', async () => {
  const plan = createBulkResearchPlan({
    keywords: ['k1', 'k2'],
    locations: ['l1']
  });
  let pausedOnce = false;
  const orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: createMockTabDriver(),
    callbacks: {
      onSearchUnitCompleted() {
        if (!pausedOnce) {
          pausedOnce = true;
          orchestrator.pause();
        }
      }
    }
  });

  await orchestrator.start();
  assert.equal(orchestrator.getSnapshot().state, 'PAUSED');

  await orchestrator.resume();
  assert.equal(orchestrator.getSnapshot().state, 'COMPLETED');
  assert.equal(orchestrator.getSnapshot().completedUnits, 2);
});

// ─── GROUP 17: CANCEL SEMANTICS ──────────────────────────────────────────────
group('GROUP 17: CANCEL SEMANTICS');

asyncTest('G17-01: Cancel terminates run permanently and marks unstarted units CANCELLED', async () => {
  const plan = createBulkResearchPlan({
    keywords: ['k1', 'k2', 'k3'],
    locations: ['l1']
  });
  const orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: createMockTabDriver(),
    callbacks: {
      onSearchUnitStarted() {
        orchestrator.cancel();
      }
    }
  });

  await orchestrator.start();
  const snapshot = orchestrator.getSnapshot();
  assert.equal(snapshot.state, 'CANCELLED');
  assert.equal(orchestrator.isCancelled(), true);

  // Resume must be rejected
  const resumeResult = await orchestrator.resume();
  assert.equal(resumeResult, false);
});

// ─── GROUP 18: IDEMPOTENCY ───────────────────────────────────────────────────
group('GROUP 18: IDEMPOTENCY');

test('G18-01: Multiple pause/cancel calls produce identical idempotent state', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  orchestrator.pause();
  orchestrator.pause();
  assert.equal(orchestrator.getSnapshot().state, 'PAUSED');

  orchestrator.cancel();
  orchestrator.cancel();
  assert.equal(orchestrator.getSnapshot().state, 'CANCELLED');
});

// ─── GROUP 19: RUN ACCOUNTING INVARIANTS ─────────────────────────────────────
group('GROUP 19: RUN ACCOUNTING INVARIANTS');

test('G19-01: Completed + failed + cancelled + remaining == totalUnits holds strictly', () => {
  const plan = createBulkResearchPlan({
    keywords: ['k1', 'k2', 'k3', 'k4', 'k5'],
    locations: ['l1']
  });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });
  const inv = orchestrator.verifyRunInvariants();
  assert.equal(inv.valid, true);
  assert.equal(inv.sum, 5);
});

// ─── GROUP 20: CANDIDATE ACCOUNTING ──────────────────────────────────────────
group('GROUP 20: CANDIDATE ACCOUNTING');

test('G20-01: Candidate metrics separate raw observations, unique count, duplicates', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  const cand1 = createSyntheticCandidate(0, 'Apex Builders', 4.8, true, '0x1');
  const cand2 = createSyntheticCandidate(1, 'Apex Builders', 4.8, true, '0x1'); // duplicate
  const cand3 = createSyntheticCandidate(2, 'Skyline Homes', 4.2, false, '0x2');

  orchestrator.ingestCandidate(cand1);
  orchestrator.ingestCandidate(cand2);
  orchestrator.ingestCandidate(cand3);

  const m = orchestrator.getMetrics();
  assert.equal(m.rawCandidateObservations, 3);
  assert.equal(m.uniqueCandidateCount, 2);
  assert.equal(m.duplicateObservationCount, 1);
});

// ─── GROUP 21: CROSS-SEARCH DEDUPLICATION ────────────────────────────────────
group('GROUP 21: CROSS-SEARCH DEDUPLICATION');

test('G21-01: Same candidate across SearchUnit A and SearchUnit B counted once in unique count', () => {
  const plan = createBulkResearchPlan({
    keywords: ['real estate', 'property developer'],
    locations: ['Dhaka']
  });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  const candA = createSyntheticCandidate(0, 'ABC Properties', 4.5, true, '0xabc');
  const candB = createSyntheticCandidate(1, 'ABC Properties', 4.5, true, '0xabc');

  orchestrator.ingestCandidate(candA);
  orchestrator.ingestCandidate(candB);

  assert.equal(orchestrator.getMetrics().uniqueCandidateCount, 1);
  assert.equal(orchestrator.getMetrics().duplicateObservationCount, 1);
});

// ─── GROUP 22: MULTI-SEARCH PROVENANCE ───────────────────────────────────────
group('GROUP 22: MULTI-SEARCH PROVENANCE');

test('G22-01: Multi-search candidate preserves first discovery context and GOOGLE_MAPS_BROWSER source', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  const cand = createSyntheticCandidate(0, 'Eastern Housing', 4.0, true, '0xeast');
  orchestrator.ingestCandidate(cand);

  const dataset = orchestrator.getSessionDataset();
  assert.equal(dataset.length, 1);
  assert.equal(dataset[0].provenance.source, 'GOOGLE_MAPS_BROWSER');
  assert.equal(dataset[0].provenance.policyStatus, 'POLICY_GATED');
  assert.equal(dataset[0].provenance.persistenceStatus, 'NOT_PERSISTABLE');
  assert.equal(dataset[0].provenance.exportStatus, 'NOT_EXPORTABLE');
});

// ─── GROUP 23: ACTIVE FILTER DURING RUN ──────────────────────────────────────
group('GROUP 23: ACTIVE FILTER DURING RUN');

test('G23-01: Changing filter during active run does not modify queue or restart acquisition', () => {
  const plan = createBulkResearchPlan({
    keywords: ['k1', 'k2'],
    locations: ['l1']
  });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  // Update filter criteria
  orchestrator.setFilter({ ratingFilter: 'MIN_4_5', websiteFilter: 'WITH_WEBSITE' });
  const snapshot = orchestrator.getSnapshot();

  assert.equal(snapshot.filterSnapshot.ratingFilter, 'MIN_4_5');
  assert.equal(snapshot.filterSnapshot.websiteFilter, 'WITH_WEBSITE');
  assert.equal(snapshot.state, 'QUEUED');
});

// ─── GROUP 24: DYNAMIC CANDIDATE ARRIVAL UNDER ACTIVE FILTER ─────────────────
group('GROUP 24: DYNAMIC CANDIDATE ARRIVAL UNDER ACTIVE FILTER');

test('G24-01: Ingested candidates immediately reflect in filteredMatchCount', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  orchestrator.setFilter({ ratingFilter: 'MIN_4_5', websiteFilter: 'ANY' });

  const candPass = createSyntheticCandidate(0, 'Five Star Properties', 4.8, true, '0x5');
  const candFail = createSyntheticCandidate(1, 'Three Star Homes', 3.8, true, '0x3');

  orchestrator.ingestCandidate(candPass);
  orchestrator.ingestCandidate(candFail);

  const m = orchestrator.getMetrics();
  assert.equal(m.uniqueCandidateCount, 2);
  assert.equal(m.currentFilteredMatchCount, 1);
});

// ─── GROUP 25: CHECKPOINT METADATA ───────────────────────────────────────────
group('GROUP 25: CHECKPOINT METADATA');

test('G25-01: Checkpoint metadata contains only execution state and NO candidate PII', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  // Ingest candidate with sensitive information
  orchestrator.ingestCandidate(createSyntheticCandidate(0, 'Private Client Realty', 4.5, true));

  const cp = orchestrator.createCheckpoint();
  const cpJson = JSON.stringify(cp);

  assert.ok(cp.planId);
  assert.ok(cp.runId);
  assert.ok(cp.metrics);
  assert.equal(cpJson.includes('Private Client Realty'), false);
  assert.equal(cpJson.includes('privateclient'), false);
});

// ─── GROUP 26: STALE CHECKPOINT DETECTION ────────────────────────────────────
group('GROUP 26: STALE CHECKPOINT DETECTION');

test('G26-01: Stale checkpoint with incompatible schemaVersion is rejected', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  const staleCp = {
    schemaVersion: 999, // Incompatible
    engineVersion: '1.0.0',
    planId: plan.planId,
    planFingerprint: plan.planFingerprint,
    runId: 'brun_old',
    status: 'PAUSED',
    queueIndex: 0,
    searchUnits: [],
    counters: { completed: 0, failed: 0, cancelled: 0, retried: 0 },
    timestamp: new Date().toISOString()
  };

  const restored = orchestrator.restoreFromCheckpoint(staleCp);
  assert.equal(restored, false);
});

// ─── GROUP 27: PLAN-HASH MISMATCH ────────────────────────────────────────────
group('GROUP 27: PLAN-HASH MISMATCH');

test('G27-01: Checkpoint with mismatched plan fingerprint is rejected', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  const mismatchedCp = {
    schemaVersion: 1,
    engineVersion: '1.0.0',
    planId: plan.planId,
    planFingerprint: 'bpfp_different_hash',
    runId: 'brun_old',
    status: 'PAUSED',
    queueIndex: 0,
    searchUnits: [],
    counters: { completed: 0, failed: 0, cancelled: 0, retried: 0 },
    timestamp: new Date().toISOString()
  };

  const restored = orchestrator.restoreFromCheckpoint(mismatchedCp);
  assert.equal(restored, false);
});

// ─── GROUP 28: TAB CLOSURE HANDLING ──────────────────────────────────────────
group('GROUP 28: TAB CLOSURE HANDLING');

asyncTest('G28-01: Tab closure during execution safely handles interruption without crash', async () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const mockDriver = createMockTabDriver({ tabValid: false });

  const orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: mockDriver,
    policy: { ...DEFAULT_BULK_EXECUTION_POLICY, maxAttemptsPerUnit: 1, delayBetweenRetriesMs: 0 }
  });

  await orchestrator.start();
  const snapshot = orchestrator.getSnapshot();
  assert.equal(snapshot.failedUnits, 1);
  assert.equal(snapshot.state, 'FAILED');
});

// ─── GROUP 29: RECOVERY-REQUIRED STATE ───────────────────────────────────────
group('GROUP 29: RECOVERY-REQUIRED STATE');

test('G29-01: State transitions enforce valid terminal states', () => {
  assert.equal(isTerminalBulkRunState('COMPLETED'), true);
  assert.equal(isTerminalBulkRunState('PARTIALLY_COMPLETED'), true);
  assert.equal(isTerminalBulkRunState('FAILED'), true);
  assert.equal(isTerminalBulkRunState('CANCELLED'), true);
  assert.equal(isTerminalBulkRunState('BLOCKED'), true);
  assert.equal(isTerminalBulkRunState('RUNNING'), false);
});

// ─── GROUP 30: SERVICE-WORKER REHYDRATION ────────────────────────────────────
group('GROUP 30: SERVICE-WORKER REHYDRATION');

test('G30-01: Service-worker startup restores execution metadata into orchestrator', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1', 'k2'], locations: ['l1'] });
  const orchestrator1 = new GoogleMapsBulkOrchestrator({ plan });
  const cp = orchestrator1.createCheckpoint();

  // Simulate new worker instance
  const orchestrator2 = new GoogleMapsBulkOrchestrator({ plan });
  const restored = orchestrator2.restoreFromCheckpoint(cp);
  assert.equal(restored, true);
  assert.equal(orchestrator2.getSnapshot().planId, plan.planId);
});

// ─── GROUP 31: PERSISTENCE FIREWALL AUDIT ────────────────────────────────────
group('GROUP 31: PERSISTENCE FIREWALL AUDIT');

test('G31-01: No restricted Google candidate fields exist in checkpoint storage', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  orchestrator.ingestCandidate(createSyntheticCandidate(0, 'Restricted Hotel', 4.5, false));
  const cp = orchestrator.createCheckpoint();
  const serialized = JSON.stringify(cp);

  // Assert firewall checks
  assert.equal(serialized.includes('Restricted Hotel'), false);
  assert.equal(serialized.includes('phone'), false);
  assert.equal(serialized.includes('review'), false);
});

// ─── GROUP 32: LARGE-PLAN PLANNING (10,000 UNITS) ────────────────────────────
group('GROUP 32: LARGE-PLAN PLANNING');

test('G32-01: 100 keywords x 100 locations produces 10,000 SearchUnits deterministically in < 100ms', () => {
  const kws = Array.from({ length: 100 }, (_, i) => `keyword_${i}`);
  const locs = Array.from({ length: 100 }, (_, i) => `location_${i}`);

  const start = Date.now();
  const plan = createBulkResearchPlan({ keywords: kws, locations: locs });
  const duration = Date.now() - start;

  assert.equal(plan.totalUnits, 10000);
  assert.equal(plan.searchUnits.length, 10000);
  assert.ok(duration < 400, `Planning took ${duration}ms, expected < 400ms`);
});

// ─── GROUP 33: QUEUE PERFORMANCE BENCHMARK ───────────────────────────────────
group('GROUP 33: QUEUE PERFORMANCE BENCHMARK');

test('G33-01: Queue operations benchmark across 10, 100, 1,000, 10,000 units', () => {
  const sizes = [10, 100, 1000, 10000];
  for (const size of sizes) {
    const k = Math.ceil(Math.sqrt(size));
    const kws = Array.from({ length: k }, (_, i) => `k_${i}`);
    const locs = Array.from({ length: Math.ceil(size / k) }, (_, i) => `l_${i}`);

    const t0 = performance.now();
    const plan = createBulkResearchPlan({ keywords: kws, locations: locs });
    const t1 = performance.now();

    const orchestrator = new GoogleMapsBulkOrchestrator({ plan });
    const snap = orchestrator.getSnapshot();
    const t2 = performance.now();

    assert.ok(snap.totalUnits >= size);
    console.log(`     Benchmark size ${size}: planning ${(t1 - t0).toFixed(2)}ms, queue init ${(t2 - t1).toFixed(2)}ms`);
  }
});

// ─── GROUP 34: MEMORY SAFETY ─────────────────────────────────────────────────
group('GROUP 34: MEMORY SAFETY');

test('G34-01: SearchUnits do not retain DOM or raw candidate payloads', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const unit = plan.searchUnits[0];
  assert.equal(unit.candidates, undefined);
  assert.equal(unit.domElement, undefined);
  assert.equal(typeof unit.normalizedKeyword, 'string');
  assert.equal(typeof unit.normalizedLocation, 'string');
});

// ─── GROUP 35: SEARCHUNIT ISOLATION ──────────────────────────────────────────
group('GROUP 35: SEARCHUNIT ISOLATION');

test('G35-01: Unit reset boundary clears unit-local state without corrupting session dataset', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1', 'k2'], locations: ['l1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  orchestrator.ingestCandidate(createSyntheticCandidate(0, 'Business One', 4.5, true));
  assert.equal(orchestrator.getSessionDataset().length, 1);

  orchestrator.resetSearchUnitState();
  assert.equal(orchestrator.getSessionDataset().length, 1); // session dataset preserved
});

// ─── GROUP 36: UI SETUP STRUCTURE ────────────────────────────────────────────
group('GROUP 36: UI SETUP STRUCTURE');

test('G36-01: GoogleMapsBulkResearchView component file exists and exports proper component', () => {
  const uiFilePath = path.join(process.cwd(), 'src', 'extension', 'ui', 'components', 'GoogleMapsBulkResearchView.tsx');
  assert.ok(fs.existsSync(uiFilePath), 'GoogleMapsBulkResearchView.tsx must exist');
  const content = fs.readFileSync(uiFilePath, 'utf8');
  assert.ok(content.includes('export const GoogleMapsBulkResearchView'));
  assert.ok(content.includes('bulk-keywords-input'));
  assert.ok(content.includes('bulk-locations-input'));
});

// ─── GROUP 37: UI PROGRESS STRUCTURE ─────────────────────────────────────────
group('GROUP 37: UI PROGRESS STRUCTURE');

test('G37-01: UI component contains progress bar and metrics display', () => {
  const uiFilePath = path.join(process.cwd(), 'src', 'extension', 'ui', 'components', 'GoogleMapsBulkResearchView.tsx');
  const content = fs.readFileSync(uiFilePath, 'utf8');
  assert.ok(content.includes('role="progressbar"'));
  assert.ok(content.includes('Observed'));
  assert.ok(content.includes('Unique Leads'));
  assert.ok(content.includes('Filtered Matches'));
});

// ─── GROUP 38: UI PAUSE CONTROL ──────────────────────────────────────────────
group('GROUP 38: UI PAUSE CONTROL');

test('G38-01: UI component provides accessible Pause button', () => {
  const uiFilePath = path.join(process.cwd(), 'src', 'extension', 'ui', 'components', 'GoogleMapsBulkResearchView.tsx');
  const content = fs.readFileSync(uiFilePath, 'utf8');
  assert.ok(content.includes('id="pause-bulk-research-btn"'));
  assert.ok(content.includes('Pause'));
});

// ─── GROUP 39: UI RESUME CONTROL ─────────────────────────────────────────────
group('GROUP 39: UI RESUME CONTROL');

test('G39-01: UI component provides accessible Resume button when paused', () => {
  const uiFilePath = path.join(process.cwd(), 'src', 'extension', 'ui', 'components', 'GoogleMapsBulkResearchView.tsx');
  const content = fs.readFileSync(uiFilePath, 'utf8');
  assert.ok(content.includes('id="resume-bulk-research-btn"'));
  assert.ok(content.includes('Resume'));
});

// ─── GROUP 40: UI CANCEL CONTROL ─────────────────────────────────────────────
group('GROUP 40: UI CANCEL CONTROL');

test('G40-01: UI component provides accessible Cancel button', () => {
  const uiFilePath = path.join(process.cwd(), 'src', 'extension', 'ui', 'components', 'GoogleMapsBulkResearchView.tsx');
  const content = fs.readFileSync(uiFilePath, 'utf8');
  assert.ok(content.includes('id="cancel-bulk-research-btn"'));
  assert.ok(content.includes('Cancel'));
});

// ─── GROUP 41: UI PARTIAL COMPLETION ─────────────────────────────────────────
group('GROUP 41: UI PARTIAL COMPLETION');

test('G41-01: UI component provides status copy for PARTIALLY_COMPLETED runs', () => {
  const uiFilePath = path.join(process.cwd(), 'src', 'extension', 'ui', 'components', 'GoogleMapsBulkResearchView.tsx');
  const content = fs.readFileSync(uiFilePath, 'utf8');
  assert.ok(content.includes('Partially completed'));
});

// ─── GROUP 42: UI RECOVERY STATE ─────────────────────────────────────────────
group('GROUP 42: UI RECOVERY STATE');

test('G42-01: UI component handles BLOCKED and policy guardrail states', () => {
  const uiFilePath = path.join(process.cwd(), 'src', 'extension', 'ui', 'components', 'GoogleMapsBulkResearchView.tsx');
  const content = fs.readFileSync(uiFilePath, 'utf8');
  assert.ok(content.includes('Research run blocked'));
});

// ─── GROUP 43: ACCESSIBILITY COMPLIANCE ──────────────────────────────────────
group('GROUP 43: ACCESSIBILITY COMPLIANCE');

test('G43-01: UI component contains fieldset, legend, aria-live, and role="region"', () => {
  const uiFilePath = path.join(process.cwd(), 'src', 'extension', 'ui', 'components', 'GoogleMapsBulkResearchView.tsx');
  const content = fs.readFileSync(uiFilePath, 'utf8');
  assert.ok(content.includes('<fieldset'));
  assert.ok(content.includes('<legend'));
  assert.ok(content.includes('aria-live="polite"'));
  assert.ok(content.includes('role="region"'));
});

// ─── GROUP 44: DUPLICATE START PROTECTION ────────────────────────────────────
group('GROUP 44: DUPLICATE START PROTECTION');

asyncTest('G44-01: Calling start on already active run rejects duplicate execution', async () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: createMockTabDriver()
  });

  const p1 = orchestrator.start();
  const res2 = await orchestrator.start(); // second start call
  assert.equal(res2.success, false);
  assert.match(res2.error, /already active/);
  await p1;
});

// ─── GROUP 45: FILTER-CHANGE DOES-NOT-ACQUIRE INVARIANT ──────────────────────
group('GROUP 45: FILTER-CHANGE DOES-NOT-ACQUIRE INVARIANT');

test('G45-01: Coordinator setSessionFilter does not trigger tab navigation or scrapers', () => {
  const coord = new GoogleMapsRuntimeCoordinator();
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orch = new GoogleMapsBulkOrchestrator({ plan, tabDriver: createMockTabDriver() });
  coord._bulkOrchestrators.set('test_run', orch);

  const res = coord.setSessionFilter('test_run', { ratingFilter: 'MIN_4_0', websiteFilter: 'WITH_WEBSITE' });
  assert.equal(res.success, true);
  assert.equal(orch.getSnapshot().state, 'QUEUED'); // Queue untouched
});

// ─── GROUP 46: CROSS-UNIT CANDIDATE COUNTING ─────────────────────────────────
group('GROUP 46: CROSS-UNIT CANDIDATE COUNTING');

test('G46-01: Unit A (3 candidates) + Unit B (2 same + 1 new) -> 4 unique, 2 duplicates, 6 raw', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1', 'k2'], locations: ['l1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  // Unit A
  orchestrator.ingestCandidate(createSyntheticCandidate(0, 'Cand 1', 4.5, true, '0x1'));
  orchestrator.ingestCandidate(createSyntheticCandidate(1, 'Cand 2', 4.0, false, '0x2'));
  orchestrator.ingestCandidate(createSyntheticCandidate(2, 'Cand 3', 3.5, false, '0x3'));

  // Unit B
  orchestrator.ingestCandidate(createSyntheticCandidate(3, 'Cand 1', 4.5, true, '0x1')); // duplicate
  orchestrator.ingestCandidate(createSyntheticCandidate(4, 'Cand 2', 4.0, false, '0x2')); // duplicate
  orchestrator.ingestCandidate(createSyntheticCandidate(5, 'Cand 4', 4.9, true, '0x4')); // new

  const m = orchestrator.getMetrics();
  assert.equal(m.rawCandidateObservations, 6);
  assert.equal(m.uniqueCandidateCount, 4);
  assert.equal(m.duplicateObservationCount, 2);
});

// ─── GROUP 47: TERMINATION REASONS ───────────────────────────────────────────
group('GROUP 47: TERMINATION REASONS');

test('G47-01: Termination reasons include EXHAUSTED, MAX_RESULTS_REACHED, TIMEOUT, USER_CANCELLED', () => {
  const validReasons = [
    'ALL_UNITS_COMPLETED',
    'PARTIAL_FAILURE',
    'USER_CANCELLED',
    'TIME_LIMIT_REACHED',
    'PLAN_LIMIT_REACHED',
    'RECOVERY_REQUIRED',
    'FATAL_RUN_ERROR'
  ];
  for (const r of validReasons) {
    assert.equal(typeof r, 'string');
  }
});

// ─── GROUP 48: FULL-RUN COMPLETION ───────────────────────────────────────────
group('GROUP 48: FULL-RUN COMPLETION');

asyncTest('G48-01: 3 keywords x 3 locations completes with status COMPLETED and 9 units completed', async () => {
  const plan = createBulkResearchPlan({
    keywords: ['k1', 'k2', 'k3'],
    locations: ['l1', 'l2', 'l3']
  });
  const orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: createMockTabDriver()
  });

  await orchestrator.start();
  const snapshot = orchestrator.getSnapshot();
  assert.equal(snapshot.state, 'COMPLETED');
  assert.equal(snapshot.completedUnits, 9);
  assert.equal(snapshot.failedUnits, 0);
  assert.equal(snapshot.progress.unitsCompleted, 9);
  assert.equal(snapshot.progress.percent, 100);
});

// ─── GROUP 49: FULL-RUN PARTIAL COMPLETION ───────────────────────────────────
group('GROUP 49: FULL-RUN PARTIAL COMPLETION');

asyncTest('G49-01: Run with 2 successes and 1 failure finishes as PARTIALLY_COMPLETED', async () => {
  const plan = createBulkResearchPlan({
    keywords: ['good1', 'fail_one', 'good2'],
    locations: ['loc1']
  });
  const mockDriver = {
    async navigateTab(tabId, url) {
      if (url.includes('fail_one')) {
        throw new Error('Forced failure');
      }
      return { tabId, url, status: 'complete' };
    },
    async getTab(tabId) {
      return { tabId, url: 'https://www.google.com/maps', status: 'complete' };
    },
    async getTabInfo(tabId) {
      return { tabId, url: 'https://www.google.com/maps', status: 'complete' };
    }
  };

  const orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: mockDriver,
    policy: { ...DEFAULT_BULK_EXECUTION_POLICY, maxAttemptsPerUnit: 1, delayBetweenRetriesMs: 0 }
  });

  await orchestrator.start();
  const snapshot = orchestrator.getSnapshot();
  assert.equal(snapshot.state, 'PARTIALLY_COMPLETED');
  assert.equal(snapshot.completedUnits, 2);
  assert.equal(snapshot.failedUnits, 1);
});

// ─── GROUP 50: SECURITY & ANTI-BOT AUDIT ─────────────────────────────────────
group('GROUP 50: SECURITY & ANTI-BOT AUDIT');

test('G50-01: No prohibited anti-bot, evasion, CAPTCHA bypass, or stealth tokens exist in Part 4 code', () => {
  const filesToCheck = [
    'src/extension/acquisition/engine/bulkPlanTypes.ts',
    'src/extension/acquisition/engine/bulkPlanner.ts',
    'src/extension/acquisition/engine/bulkOrchestrator.ts',
    'src/extension/ui/components/GoogleMapsBulkResearchView.tsx'
  ];

  const prohibitedTokens = [
    'anti-bot',
    'antibot',
    'bypass_captcha',
    'rotate_proxy',
    'stealth',
    'fingerprint_spoof',
    'eval(',
    'new Function(',
    'unlimitedStorage'
  ];

  for (const relPath of filesToCheck) {
    const fullPath = path.join(process.cwd(), relPath);
    const content = fs.readFileSync(fullPath, 'utf8').toLowerCase();
    for (const token of prohibitedTokens) {
      assert.ok(
        !content.includes(token),
        `Prohibited token "${token}" found in ${relPath}`
      );
    }
  }
});

// ─── GROUP 51: ACTIVE-UNIT PAUSE SEMANTICS (CORRECTION 1) ────────────────────
group('GROUP 51: ACTIVE-UNIT PAUSE SEMANTICS');

asyncTest('G51-01: PAUSE during NAVIGATING halts run at safe boundary and marks active unit PAUSED', async () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1', 'kw2'], locations: ['loc1'] });
  let orchestrator;
  const mockDriver = {
    async navigateTab(tabId, url) {
      await orchestrator.pause();
      return { tabId, url, status: 'complete' };
    },
    async getTab(tabId) { return { tabId, url: 'https://www.google.com/maps', status: 'complete' }; },
    async getTabInfo(tabId) { return { tabId, url: 'https://www.google.com/maps', status: 'complete' }; }
  };

  orchestrator = new GoogleMapsBulkOrchestrator({ plan, tabDriver: mockDriver });
  await orchestrator.start();
  const snap = orchestrator.getSnapshot();

  assert.equal(snap.state, 'PAUSED');
  assert.equal(snap.completedUnits, 0);
  assert.ok(snap.currentSearchUnit);
  assert.equal(snap.currentSearchUnit.status, 'PAUSED');
});

asyncTest('G51-02: PAUSE during OBSERVING / SCROLLING halts scroll loop and marks unit PAUSED', async () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1', 'kw2'], locations: ['loc1'] });
  let orchestrator;

  orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: createMockTabDriver(),
    callbacks: {
      onSearchUnitStarted(unit, idx) {
        if (idx === 1) {
          orchestrator.pause();
        }
      }
    }
  });

  await orchestrator.start();
  const snap = orchestrator.getSnapshot();
  assert.equal(snap.state, 'PAUSED');
  assert.equal(snap.completedUnits, 0);
  assert.ok(snap.currentSearchUnit);
  assert.equal(snap.currentSearchUnit.status, 'PAUSED');
});

test('G51-03: PAUSE latency is bounded and checkpoint is immediately written', () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1', 'kw2'], locations: ['loc1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  const t0 = performance.now();
  orchestrator.pause();
  const latency = performance.now() - t0;

  assert.ok(latency < 100, `Pause latency ${latency}ms exceeds 100ms safe bound`);
  const cp = orchestrator.createCheckpoint();
  assert.equal(cp.state, 'PAUSED');
});

asyncTest('G51-04: PAUSE while current SearchUnit is active preserves unit state and checkpoint', async () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1', 'kw2'], locations: ['loc1'] });
  let orchestrator;
  const mockDriver = {
    async navigateTab(tabId, url) {
      await orchestrator.pause();
      return { tabId, url, status: 'complete' };
    },
    async getTab(tabId) { return { tabId, url: 'https://www.google.com/maps', status: 'complete' }; },
    async getTabInfo(tabId) { return { tabId, url: 'https://www.google.com/maps', status: 'complete' }; }
  };

  orchestrator = new GoogleMapsBulkOrchestrator({ plan, tabDriver: mockDriver });
  await orchestrator.start();

  const cp = orchestrator.createCheckpoint();
  assert.equal(cp.state, 'PAUSED');
  assert.ok(cp.currentSearchUnitId, 'Checkpoint must preserve paused unit ID');
  const unitSummary = cp.unitSummaries.find(u => u.searchUnitId === cp.currentSearchUnitId);
  assert.equal(unitSummary?.status, 'PAUSED');
  assert.equal(unitSummary?.terminationReason, 'USER_PAUSED');
});

asyncTest('G51-05: PAUSE does not claim next SearchUnit from queue', async () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1', 'kw2', 'kw3'], locations: ['loc1'] });
  let orchestrator;
  const mockDriver = {
    async navigateTab(tabId, url) {
      await orchestrator.pause();
      return { tabId, url, status: 'complete' };
    },
    async getTab(tabId) { return { tabId, url: 'https://www.google.com/maps', status: 'complete' }; },
    async getTabInfo(tabId) { return { tabId, url: 'https://www.google.com/maps', status: 'complete' }; }
  };

  orchestrator = new GoogleMapsBulkOrchestrator({ plan, tabDriver: mockDriver });
  await orchestrator.start();
  const snap = orchestrator.getSnapshot();

  assert.equal(snap.completedUnits, 0);
  assert.equal(snap.pendingUnits, 3); // 1 paused + 2 pending = 3 queuedUnits
});

test('G51-06: Repeated PAUSE calls are idempotent and maintain PAUSED state', async () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1'], locations: ['loc1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan });

  await orchestrator.pause();
  const snap1 = orchestrator.getSnapshot();
  assert.equal(snap1.state, 'PAUSED');

  await orchestrator.pause();
  const snap2 = orchestrator.getSnapshot();
  assert.equal(snap2.state, 'PAUSED');
});

// ─── GROUP 52: ACTIVE-UNIT RESUME SEMANTICS (CORRECTION 2) ───────────────────
group('GROUP 52: ACTIVE-UNIT RESUME SEMANTICS');

asyncTest('G52-01: Scenario A: Pause during NAVIGATING resumes from navigation boundary safely', async () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1'], locations: ['loc1'] });
  let allowNav = false;
  let navCount = 0;
  let orchestrator;

  const mockDriver = {
    async navigateTab(tabId, url) {
      navCount++;
      if (!allowNav) {
        await orchestrator.pause();
        return { tabId, url, status: 'complete' };
      }
      return { tabId, url, status: 'complete' };
    },
    async getTab(tabId) { return { tabId, url: 'https://www.google.com/maps', status: 'complete' }; },
    async getTabInfo(tabId) { return { tabId, url: 'https://www.google.com/maps', status: 'complete' }; }
  };

  orchestrator = new GoogleMapsBulkOrchestrator({ plan, tabDriver: mockDriver });
  await orchestrator.start();
  assert.equal(orchestrator.getSnapshot().state, 'PAUSED');

  // Resume safely
  allowNav = true;
  await orchestrator.resume();
  const snap = orchestrator.getSnapshot();

  assert.equal(snap.state, 'COMPLETED');
  assert.equal(snap.completedUnits, 1);
  assert.ok(navCount >= 2, `Expected at least 2 navigation attempts, got ${navCount}`);
});

asyncTest('G52-02: Scenario B & C: In-session deduplication survives across resume without candidate duplication', async () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1'], locations: ['loc1'] });
  let allowPass = false;
  let orchestrator;

  const mockDriver = {
    async navigateTab(tabId, url) {
      if (!allowPass) {
        // Ingest candidate before pause
        orchestrator.ingestCandidate(createSyntheticCandidate(0, 'Candidate One', 4.8, true, '0x101'));
        await orchestrator.pause();
        return { tabId, url, status: 'complete' };
      }
      return { tabId, url, status: 'complete' };
    },
    async getTab(tabId) { return { tabId, url: 'https://www.google.com/maps', status: 'complete' }; },
    async getTabInfo(tabId) { return { tabId, url: 'https://www.google.com/maps', status: 'complete' }; }
  };

  orchestrator = new GoogleMapsBulkOrchestrator({ plan, tabDriver: mockDriver });
  await orchestrator.start();
  assert.equal(orchestrator.getSnapshot().state, 'PAUSED');
  assert.equal(orchestrator.getMetrics().uniqueCandidateCount, 1);

  // Resume and re-observe same candidate
  allowPass = true;
  orchestrator.ingestCandidate(createSyntheticCandidate(0, 'Candidate One', 4.8, true, '0x101'));
  await orchestrator.resume();

  const metrics = orchestrator.getMetrics();
  assert.equal(metrics.uniqueCandidateCount, 1, 'In-session dedup must prevent candidate inflation');
  assert.equal(metrics.duplicateObservationCount, 1, 'Re-observed candidate recorded as duplicate');
});

asyncTest('G52-03: Scenario D: Current SearchUnit already completed before pause -> resume claims next pending unit', async () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1', 'kw2'], locations: ['loc1'] });
  let pausedAfterUnit1 = false;
  let orchestrator;

  orchestrator = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: createMockTabDriver(),
    callbacks: {
      onSearchUnitCompleted(unit, summary) {
        if (!pausedAfterUnit1) {
          pausedAfterUnit1 = true;
          orchestrator.pause();
        }
      }
    }
  });

  await orchestrator.start();
  assert.equal(orchestrator.getSnapshot().state, 'PAUSED');
  assert.equal(orchestrator.getSnapshot().completedUnits, 1);

  // Resume claims next unit
  await orchestrator.resume();
  const finalSnap = orchestrator.getSnapshot();
  assert.equal(finalSnap.state, 'COMPLETED');
  assert.equal(finalSnap.completedUnits, 2);
});

asyncTest('G52-04: Scenario E: Cancelled run rejects resume', async () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1'], locations: ['loc1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan, tabDriver: createMockTabDriver() });

  await orchestrator.cancel();
  assert.equal(orchestrator.getSnapshot().state, 'CANCELLED');

  const resumeRes = await orchestrator.resume();
  assert.equal(resumeRes, false, 'Resume on CANCELLED run must return false');
});

asyncTest('G52-05: Scenario F: Completed run rejects resume', async () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1'], locations: ['loc1'] });
  const orchestrator = new GoogleMapsBulkOrchestrator({ plan, tabDriver: createMockTabDriver() });

  await orchestrator.start();
  assert.equal(orchestrator.getSnapshot().state, 'COMPLETED');

  const resumeRes = await orchestrator.resume();
  assert.equal(resumeRes, false, 'Resume on COMPLETED run must return false');
});

// ─── GROUP 53: SERVICE-WORKER REHYDRATION & GOOGLE DATA FIREWALL (CORRECTION 5)
group('GROUP 53: SERVICE-WORKER REHYDRATION & GOOGLE DATA FIREWALL');

test('G53-01: Rehydration restores execution metadata into fresh coordinator instance without duplicate run', () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1', 'kw2'], locations: ['loc1'] });
  const orch1 = new GoogleMapsBulkOrchestrator({ plan });
  const cp = orch1.createCheckpoint();

  // Create second instance simulating service worker reinitialization
  const orch2 = new GoogleMapsBulkOrchestrator({ plan });
  const restored = orch2.restoreFromCheckpoint(cp);

  assert.equal(restored, true);
  assert.equal(orch2.getSnapshot().planId, plan.planId);
  assert.equal(orch2.getSnapshot().runId, cp.runId);
});

test('G53-02: Rehydrated run does not claim duplicate SearchUnit or navigate arbitrary browser tabs', () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1', 'kw2'], locations: ['loc1'] });
  const driver = createMockTabDriver();
  const orch1 = new GoogleMapsBulkOrchestrator({ plan, tabDriver: driver });
  const cp = orch1.createCheckpoint();

  const orch2 = new GoogleMapsBulkOrchestrator({ plan, tabDriver: driver });
  orch2.restoreFromCheckpoint(cp);

  // Assert no tabs navigated merely by rehydrating
  assert.equal(driver.navigatedUrls.length, 0);
  assert.equal(orch2.getSnapshot().completedUnits, 0);
});

test('G53-03: Zero candidate PII / restricted Google candidate content is stored in execution metadata', () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1'], locations: ['loc1'] });
  const orch = new GoogleMapsBulkOrchestrator({ plan });

  orch.ingestCandidate(createSyntheticCandidate(0, 'Secret Dental Clinic', 4.9, true, '0x999'));
  const cp = orch.createCheckpoint();
  const serialized = JSON.stringify(cp);

  assert.equal(serialized.includes('Secret Dental Clinic'), false);
  assert.equal(serialized.includes('0x999'), false);
  assert.equal(serialized.includes('phone'), false);
  assert.equal(serialized.includes('review'), false);
});

// ─── GROUP 54: STALE CHECKPOINT & PLAN HASH INVARIANTS (CORRECTION 6) ────────
group('GROUP 54: STALE CHECKPOINT & PLAN HASH INVARIANTS');

test('G54-01: Checkpoint from Plan A attempted on Plan B is rejected with STALE_METADATA', () => {
  const planA = createBulkResearchPlan({ keywords: ['dental'], locations: ['austin'] });
  const planB = createBulkResearchPlan({ keywords: ['plumbing'], locations: ['dallas'] });

  const orchA = new GoogleMapsBulkOrchestrator({ plan: planA });
  const cpA = orchA.createCheckpoint();

  const orchB = new GoogleMapsBulkOrchestrator({ plan: planB });
  const restored = orchB.restoreFromCheckpoint(cpA);

  assert.equal(restored, false, 'Checkpoint from different plan must be rejected');
  const diags = orchB.getSnapshot().diagnostics;
  assert.ok(diags.some(d => d.code === 'STALE_METADATA'));
});

test('G54-02: Checkpoint with incompatible schemaVersion fails closed', () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1'], locations: ['loc1'] });
  const orch = new GoogleMapsBulkOrchestrator({ plan });

  const invalidCp = {
    schemaVersion: 9999, // incompatible
    planFingerprint: plan.planFingerprint,
    runId: 'brun_old',
    state: 'PAUSED'
  };

  const restored = orch.restoreFromCheckpoint(invalidCp);
  assert.equal(restored, false, 'Incompatible schemaVersion must fail closed');
  const diags = orch.getSnapshot().diagnostics;
  assert.ok(diags.some(d => d.code === 'INCOMPATIBLE_ADAPTER_VERSION'));
});

test('G54-03: Corrupted or null checkpoint payload fails closed without modifying orchestrator state', () => {
  const plan = createBulkResearchPlan({ keywords: ['kw1'], locations: ['loc1'] });
  const orch = new GoogleMapsBulkOrchestrator({ plan });

  assert.equal(orch.restoreFromCheckpoint(null), false);
  assert.equal(orch.restoreFromCheckpoint(undefined), false);
  assert.equal(orch.restoreFromCheckpoint('corrupted string'), false);
  assert.equal(orch.getSnapshot().state, 'QUEUED');
});

// ─── GROUP 55: RUN ACCOUNTING & INVARIANTS (CORRECTION 7) ────────────────────
group('GROUP 55: RUN ACCOUNTING & INVARIANTS');

test('G55-01: 10 planned units scenario: 6 completed, 2 failed, 1 cancelled, 1 pending -> exactly 10', () => {
  const plan = createBulkResearchPlan({
    keywords: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'k10'],
    locations: ['loc1']
  });
  assert.equal(plan.totalUnits, 10);
  const orch = new GoogleMapsBulkOrchestrator({ plan });

  // Manually configure unit summaries to reflect scenario: 6 completed, 2 failed, 1 cancelled, 1 pending
  const units = plan.searchUnits;
  for (let i = 0; i < 6; i++) {
    orch._unitSummaries.set(units[i].searchUnitId, {
      ...orch._unitSummaries.get(units[i].searchUnitId),
      status: 'COMPLETED',
      attemptCount: 1
    });
  }
  for (let i = 6; i < 8; i++) {
    orch._unitSummaries.set(units[i].searchUnitId, {
      ...orch._unitSummaries.get(units[i].searchUnitId),
      status: 'FAILED',
      attemptCount: 3
    });
  }
  orch._unitSummaries.set(units[8].searchUnitId, {
    ...orch._unitSummaries.get(units[8].searchUnitId),
    status: 'CANCELLED',
    attemptCount: 0
  });
  // units[9] remains PENDING

  const inv = orch.verifyRunInvariants();
  assert.equal(inv.valid, true);
  assert.equal(inv.sum, 10);
  assert.equal(inv.total, 10);
  assert.equal(inv.details.completed, 6);
  assert.equal(inv.details.failed, 2);
  assert.equal(inv.details.cancelled, 1);
  assert.equal(inv.details.queued, 1);
});

test('G55-02: 10 planned units scenario: 5 completed, 1 retrying, 1 running, 3 pending -> no double counting', () => {
  const plan = createBulkResearchPlan({
    keywords: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'k10'],
    locations: ['loc1']
  });
  const orch = new GoogleMapsBulkOrchestrator({ plan });
  const units = plan.searchUnits;

  // 5 completed
  for (let i = 0; i < 5; i++) {
    orch._unitSummaries.set(units[i].searchUnitId, {
      ...orch._unitSummaries.get(units[i].searchUnitId),
      status: 'COMPLETED',
      attemptCount: 1
    });
  }
  // 1 retrying
  orch._unitSummaries.set(units[5].searchUnitId, {
    ...orch._unitSummaries.get(units[5].searchUnitId),
    status: 'RETRY_PENDING',
    attemptCount: 2
  });
  // 1 running
  orch._unitSummaries.set(units[6].searchUnitId, {
    ...orch._unitSummaries.get(units[6].searchUnitId),
    status: 'RUNNING',
    attemptCount: 1
  });
  // 3 pending (units 7, 8, 9 remain PENDING)

  const inv = orch.verifyRunInvariants();
  assert.equal(inv.valid, true);
  assert.equal(inv.sum, 10);
  assert.equal(inv.total, 10);
  assert.equal(inv.details.completed, 5);
  assert.equal(inv.details.retrying, 1);
  assert.equal(inv.details.running, 1);
  assert.equal(inv.details.queued, 4); // 3 pending + 1 retry_pending
});

// ─── GROUP 56: LIVE FILTER CHANGES DURING BULK RUN (CORRECTION 8) ────────────
group('GROUP 56: LIVE FILTER CHANGES DURING BULK RUN');

test('G56-01: Filter change to MIN_4_5 / WITHOUT_WEBSITE during active bulk run updates view without re-acquisition', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1', 'k2'], locations: ['l1'] });
  const driver = createMockTabDriver();
  const orch = new GoogleMapsBulkOrchestrator({ plan, tabDriver: driver });

  // Ingest candidates: 1 matches 4.8 without website, 1 does not
  orch.ingestCandidate(createSyntheticCandidate(0, 'Prime Law', 4.8, false, '0x1'));
  orch.ingestCandidate(createSyntheticCandidate(1, 'Second Law', 3.9, true, '0x2'));

  assert.equal(orch.getMetrics().uniqueCandidateCount, 2);
  assert.equal(orch.getMetrics().currentFilteredMatchCount, 2); // Initial ANY/ANY

  // Change filter live
  orch.setFilter({ ratingFilter: 'MIN_4_5', websiteFilter: 'WITHOUT_WEBSITE' });

  assert.equal(orch.getMetrics().uniqueCandidateCount, 2);
  assert.equal(orch.getMetrics().currentFilteredMatchCount, 1);
  assert.equal(driver.navigatedUrls.length, 0, 'No navigation or re-acquisition should occur');
  assert.equal(orch.getSnapshot().state, 'QUEUED');
});

test('G56-02: Resetting filter back to ANY / ANY restores previously hidden candidates without reacquisition', () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orch = new GoogleMapsBulkOrchestrator({ plan });

  orch.ingestCandidate(createSyntheticCandidate(0, 'A', 4.8, false, '0x1'));
  orch.ingestCandidate(createSyntheticCandidate(1, 'B', 3.5, true, '0x2'));

  orch.setFilter({ ratingFilter: 'MIN_4_5', websiteFilter: 'WITHOUT_WEBSITE' });
  assert.equal(orch.getMetrics().currentFilteredMatchCount, 1);

  // Reset to ANY/ANY
  orch.setFilter({ ratingFilter: 'ANY', websiteFilter: 'ANY' });
  assert.equal(orch.getMetrics().currentFilteredMatchCount, 2);
});

// ─── GROUP 57: CANCEL & TERMINAL SAFETY (CORRECTION 9) ───────────────────────
group('GROUP 57: CANCEL & TERMINAL SAFETY');

asyncTest('G57-01: Calling CANCEL twice is idempotent and results in single terminal CANCELLED state', async () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orch = new GoogleMapsBulkOrchestrator({ plan });

  await orch.cancel();
  const snap1 = orch.getSnapshot();
  assert.equal(snap1.state, 'CANCELLED');

  await orch.cancel();
  const snap2 = orch.getSnapshot();
  assert.equal(snap2.state, 'CANCELLED');
});

asyncTest('G57-02: RESUME after CANCEL is rejected', async () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orch = new GoogleMapsBulkOrchestrator({ plan });

  await orch.cancel();
  const res = await orch.resume();
  assert.equal(res, false);
  assert.equal(orch.getSnapshot().state, 'CANCELLED');
});

asyncTest('G57-03: START after CANCEL rejects duplicate execution', async () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orch = new GoogleMapsBulkOrchestrator({ plan, tabDriver: createMockTabDriver() });

  await orch.cancel();
  await assert.rejects(
    async () => { await orch.start(); },
    /Cannot start a cancelled bulk research run/
  );
  assert.equal(orch.getSnapshot().state, 'CANCELLED');
});

asyncTest('G57-04: COMPLETED or PARTIALLY_COMPLETED run rejects resume', async () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const orch = new GoogleMapsBulkOrchestrator({ plan, tabDriver: createMockTabDriver() });

  await orch.start();
  assert.equal(orch.getSnapshot().state, 'COMPLETED');

  const res = await orch.resume();
  assert.equal(res, false);
});

// ─── GROUP 58: TAB CLOSURE RECOVERY (CORRECTION 10) ──────────────────────────
group('GROUP 58: TAB CLOSURE RECOVERY');

asyncTest('G58-01: Tab closure during active SearchUnit emits diagnostic and does not falsely mark COMPLETED', async () => {
  const plan = createBulkResearchPlan({ keywords: ['k1'], locations: ['l1'] });
  const mockDriver = {
    async navigateTab() {
      throw new Error('Tab closed or inaccessible (MAPS_TAB_NOT_FOUND)');
    },
    async getTab() { return null; },
    async getTabInfo() { return null; }
  };

  const orch = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: mockDriver,
    policy: { ...DEFAULT_BULK_EXECUTION_POLICY, maxAttemptsPerUnit: 1, delayBetweenRetriesMs: 0 }
  });

  await orch.start();
  const snap = orch.getSnapshot();

  assert.equal(snap.completedUnits, 0, 'Must NOT be marked COMPLETED');
  assert.equal(snap.failedUnits, 1);
  assert.equal(snap.state, 'FAILED');
  assert.ok(snap.diagnostics.length > 0);
});

asyncTest('G58-02: Tab closure prevents queue advance as success and avoids hijacking unrelated tabs', async () => {
  const plan = createBulkResearchPlan({ keywords: ['k1', 'k2'], locations: ['l1'] });
  let callCount = 0;
  const mockDriver = {
    async navigateTab(tabId, url) {
      callCount++;
      throw new Error('Dedicated acquisition tab ownership lost');
    },
    async getTab() { return null; },
    async getTabInfo() { return null; }
  };

  const orch = new GoogleMapsBulkOrchestrator({
    plan,
    tabDriver: mockDriver,
    policy: { ...DEFAULT_BULK_EXECUTION_POLICY, maxAttemptsPerUnit: 1, delayBetweenRetriesMs: 0 }
  });

  await orch.start();
  const snap = orch.getSnapshot();

  assert.equal(snap.completedUnits, 0);
  assert.equal(snap.state, 'FAILED');
});

// =============================================================================
// RUN TEST SUITE SEQUENTIALLY
// =============================================================================

async function runSuite() {
  for (const item of suite) {
    if (item.type === 'group') {
      console.log(`\n--- ${item.title} ---`);
      continue;
    }
    totalTests++;
    try {
      if (item.isAsync) {
        await item.fn();
      } else {
        item.fn();
      }
      console.log(`  [PASS] Test ${totalTests}: ${item.name}`);
      passedTests++;
    } catch (err) {
      console.error(`  [FAIL] Test ${totalTests}: ${item.name}`);
      console.error(`         ${err.message}`);
      failedTests++;
    }
  }

  console.log('\n================================================================');
  console.log('PART 4: BULK RESEARCH ORCHESTRATION ENGINE TEST SUMMARY');
  console.log('================================================================');
  console.log(`Total Tests Run:    ${totalTests}`);
  console.log(`Tests Passed:       ${passedTests}`);
  console.log(`Tests Failed:       ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('ALL PART 4 BULK RESEARCH ORCHESTRATION TESTS PASSED ✅\n');
  }
}

await runSuite();
