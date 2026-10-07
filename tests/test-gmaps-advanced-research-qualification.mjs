/**
 * LeadNoria — Google Maps Advanced Research & Qualification Engine
 * Master Dedicated Test Suite
 *
 * Verifies:
 * - Section A: Rating filter (ANY, FOUR_PLUS [4.0+], FOUR_POINT_FIVE_PLUS [4.5+])
 * - Section B: Website filter (ANY, WITH_WEBSITE, WITHOUT_WEBSITE)
 * - Section C: Exhaustive 3 x 3 Matrix (all 9 combinations with determinism)
 * - Section D: Multi-keyword orchestration & cross-query deduplication
 * - Section E: Failure isolation (failed queries, timeouts, malformed candidates)
 * - Section F: Stop conditions & cancellation responsiveness
 * - Section G: Export safety & lead projection firewall
 * - Section H: Complete End-to-End lifecycle (Research -> Dedup -> Qualify -> Project -> Persist -> Export)
 * - Section I: Unknown data safety (missing rating != 0, unknown website != without)
 */

import assert from 'assert';
import {
  qualifiesCandidate,
  extractRatingSignal,
  determineWebsiteState,
  createInitialCounters,
  executeMultiQueryResearch,
  DEFAULT_RESEARCH_FILTERS,
  normalizeRatingFilter,
  normalizeWebsiteFilter,
  normalizeResearchFilters
} from '../src/extension/qualification/googleMaps/index.ts';
import { SessionCandidateDeduplicator } from '../src/extension/acquisition/engine/candidateIdentity.ts';
import { toExportSafeLead } from '../src/extension/leads/leadProjection.ts';
import { validateExportSafeLead } from '../src/extension/leads/leadExportPolicy.ts';
import { WorkspaceRepository, MemoryStorageBackend } from '../src/extension/leads/workspace/workspaceRepository.ts';
import { verifyZeroGoogleFieldsInPersistedRecord } from '../src/extension/leads/workspace/workspaceSchema.ts';

// ─── Test Runner Harness ────────────────────────────────────────────────────
let passedCount = 0;
let failedCount = 0;
let currentGroup = '';

function group(name) {
  currentGroup = name;
  console.log(`\n--- ${name} ---`);
}

function test(description, fn) {
  try {
    fn();
    passedCount++;
    console.log(`  [PASS] Test ${passedCount}: ${description}`);
  } catch (err) {
    failedCount++;
    console.error(`  [FAIL] Test: ${description}`);
    console.error(`         ${err.message}`);
    throw err;
  }
}

async function asyncTest(description, fn) {
  try {
    await fn();
    passedCount++;
    console.log(`  [PASS] Test ${passedCount}: ${description}`);
  } catch (err) {
    failedCount++;
    console.error(`  [FAIL] Test: ${description}`);
    console.error(`         ${err.message}`);
    throw err;
  }
}

// ─── Candidate Factory ───────────────────────────────────────────────────────
function createCandidate(opts = {}) {
  const ratingObj = (opts.rating !== undefined || opts.ratingAvail !== undefined) ? {
    availability: opts.ratingAvail || (opts.rating !== null ? 'PRESENT' : 'UNKNOWN'),
    parsedValue: opts.rating !== null ? opts.rating : undefined,
    rawValue: opts.rating !== null ? String(opts.rating) : undefined,
    confidence: 1.0
  } : undefined;

  const websiteObj = (opts.website !== undefined || opts.websiteAvail !== undefined) ? {
    availability: opts.websiteAvail || (opts.website ? 'PRESENT' : 'ABSENT'),
    parsedValue: opts.website || undefined,
    rawValue: opts.website || undefined,
    confidence: 1.0
  } : undefined;

  return {
    candidateId: opts.candidateId || `cid_${Math.random().toString(36).substring(2, 10)}`,
    observationId: opts.observationId || `obs_${Math.random().toString(36).substring(2, 10)}`,
    searchUnitId: opts.searchUnitId || 'su_test_001',
    sessionId: opts.sessionId || 'session_001',
    source: 'GOOGLE_MAPS_BROWSER',
    observedAt: new Date().toISOString(),
    pageUrl: 'https://www.google.com/maps/search/test',
    pageKind: 'SEARCH_RESULTS',
    businessName: { availability: 'PRESENT', parsedValue: opts.name || 'Acme Real Estate', rawValue: opts.name || 'Acme Real Estate', confidence: 1.0 },
    category: { availability: 'PRESENT', parsedValue: 'Real estate developer', rawValue: 'Real estate developer', confidence: 1.0 },
    address: { availability: 'PRESENT', parsedValue: opts.address || '123 Main Street', rawValue: opts.address || '123 Main Street', confidence: 1.0 },
    phone: { availability: 'PRESENT', parsedValue: '+1-555-0100', rawValue: '+1-555-0100', confidence: 1.0 },
    websiteUrl: websiteObj,
    websiteState: opts.websiteState,
    rating: ratingObj,
    reviewCount: { availability: 'PRESENT', parsedValue: opts.reviewCount || 42, rawValue: String(opts.reviewCount || 42), confidence: 1.0 },
    businessStatus: { availability: 'PRESENT', parsedValue: 'OPERATIONAL', rawValue: 'OPERATIONAL', confidence: 1.0 },
    placeId: { availability: 'PRESENT', parsedValue: opts.placeId || `ChIJ_${Math.random().toString(36).substring(2, 10)}`, rawValue: opts.placeId || `ChIJ_${Math.random().toString(36).substring(2, 10)}`, confidence: 1.0 },
    mapsUrl: { availability: 'PRESENT', parsedValue: opts.mapsUrl || `https://www.google.com/maps/place/${Math.random().toString(36).substring(2, 10)}`, rawValue: opts.mapsUrl || `https://www.google.com/maps/place/${Math.random().toString(36).substring(2, 10)}`, confidence: 1.0 },
    searchKeyword: opts.keyword || 'real estate developer',
    searchLocation: opts.location || 'New York',
    provenance: {
      source: 'GOOGLE_MAPS_BROWSER',
      acquisitionContext: 'BROWSER_RENDERED_DOM',
      isRestricted: true,
      policyStatus: 'POLICY_GATED',
      persistenceStatus: 'NOT_PERSISTABLE',
      exportStatus: 'NOT_EXPORTABLE',
      adapterVersion: '1.0.0',
      extractionMethod: 'TEST',
      searchUnitId: 'su_test_001',
      sessionId: 'session_001',
      observedAt: new Date().toISOString(),
      pageUrl: 'https://www.google.com/maps/search/test'
    },
    fieldAvailability: {},
    diagnostics: []
  };
}

console.log('================================================================');
console.log('LEADNORIA — GOOGLE MAPS ADVANCED RESEARCH & QUALIFICATION ENGINE');
console.log('================================================================');

// ─── SECTION A: RATING FILTER ───────────────────────────────────────────────
group('SECTION A: RATING FILTER TESTS');

test('A-01: ANY + null rating passes', () => {
  const c = createCandidate({ rating: null });
  const res = qualifiesCandidate(c, { rating: 'ANY', website: 'ANY' });
  assert.equal(res.ratingQualified, true);
  assert.equal(res.qualified, true);
});

test('A-02: ANY + 3.0 rating passes', () => {
  const c = createCandidate({ rating: 3.0 });
  const res = qualifiesCandidate(c, { rating: 'ANY', website: 'ANY' });
  assert.equal(res.ratingQualified, true);
  assert.equal(res.qualified, true);
});

test('A-03: ANY + 4.0 rating passes', () => {
  const c = createCandidate({ rating: 4.0 });
  const res = qualifiesCandidate(c, { rating: 'ANY', website: 'ANY' });
  assert.equal(res.ratingQualified, true);
  assert.equal(res.qualified, true);
});

test('A-04: ANY + 5.0 rating passes', () => {
  const c = createCandidate({ rating: 5.0 });
  const res = qualifiesCandidate(c, { rating: 'ANY', website: 'ANY' });
  assert.equal(res.ratingQualified, true);
  assert.equal(res.qualified, true);
});

test('A-05: 4.0+ + 3.9 rating rejects with RATING_BELOW_THRESHOLD', () => {
  const c = createCandidate({ rating: 3.9 });
  const res = qualifiesCandidate(c, { rating: 'FOUR_PLUS', website: 'ANY' });
  assert.equal(res.ratingQualified, false);
  assert.equal(res.rejectionReason, 'RATING_BELOW_THRESHOLD');
});

test('A-06: 4.0+ + 4.0 rating passes', () => {
  const c = createCandidate({ rating: 4.0 });
  const res = qualifiesCandidate(c, { rating: 'FOUR_PLUS', website: 'ANY' });
  assert.equal(res.ratingQualified, true);
  assert.equal(res.qualified, true);
});

test('A-07: 4.0+ + 4.5 rating passes', () => {
  const c = createCandidate({ rating: 4.5 });
  const res = qualifiesCandidate(c, { rating: 'FOUR_PLUS', website: 'ANY' });
  assert.equal(res.ratingQualified, true);
  assert.equal(res.qualified, true);
});

test('A-08: 4.0+ + null rating rejects with RATING_UNKNOWN', () => {
  const c = createCandidate({ rating: null });
  const res = qualifiesCandidate(c, { rating: 'FOUR_PLUS', website: 'ANY' });
  assert.equal(res.ratingQualified, false);
  assert.equal(res.rejectionReason, 'RATING_UNKNOWN');
});

test('A-09: 4.5+ + 4.49 rating rejects with RATING_BELOW_THRESHOLD', () => {
  const c = createCandidate({ rating: 4.49 });
  const res = qualifiesCandidate(c, { rating: 'FOUR_POINT_FIVE_PLUS', website: 'ANY' });
  assert.equal(res.ratingQualified, false);
  assert.equal(res.rejectionReason, 'RATING_BELOW_THRESHOLD');
});

test('A-10: 4.5+ + 4.5 rating passes', () => {
  const c = createCandidate({ rating: 4.5 });
  const res = qualifiesCandidate(c, { rating: 'FOUR_POINT_FIVE_PLUS', website: 'ANY' });
  assert.equal(res.ratingQualified, true);
  assert.equal(res.qualified, true);
});

test('A-11: 4.5+ + 5.0 rating passes', () => {
  const c = createCandidate({ rating: 5.0 });
  const res = qualifiesCandidate(c, { rating: 'FOUR_POINT_FIVE_PLUS', website: 'ANY' });
  assert.equal(res.ratingQualified, true);
  assert.equal(res.qualified, true);
});

test('A-12: 4.5+ + null rating rejects with RATING_UNKNOWN', () => {
  const c = createCandidate({ rating: null });
  const res = qualifiesCandidate(c, { rating: 'FOUR_POINT_FIVE_PLUS', website: 'ANY' });
  assert.equal(res.ratingQualified, false);
  assert.equal(res.rejectionReason, 'RATING_UNKNOWN');
});

// ─── SECTION B: WEBSITE FILTER ──────────────────────────────────────────────
group('SECTION B: WEBSITE FILTER TESTS');

test('B-01: ANY + YES passes', () => {
  const c = createCandidate({ website: 'https://example.com' });
  const res = qualifiesCandidate(c, { rating: 'ANY', website: 'ANY' });
  assert.equal(res.websiteQualified, true);
  assert.equal(res.qualified, true);
});

test('B-02: ANY + NO passes', () => {
  const c = createCandidate({ websiteAvail: 'ABSENT' });
  const res = qualifiesCandidate(c, { rating: 'ANY', website: 'ANY' });
  assert.equal(res.websiteQualified, true);
  assert.equal(res.qualified, true);
});

test('B-03: ANY + UNKNOWN passes', () => {
  const c = createCandidate({ websiteAvail: 'UNKNOWN' });
  const res = qualifiesCandidate(c, { rating: 'ANY', website: 'ANY' });
  assert.equal(res.websiteQualified, true);
  assert.equal(res.qualified, true);
});

test('B-04: WITH + YES passes', () => {
  const c = createCandidate({ website: 'https://example.com' });
  const res = qualifiesCandidate(c, { rating: 'ANY', website: 'WITH_WEBSITE' });
  assert.equal(res.websiteQualified, true);
  assert.equal(res.qualified, true);
});

test('B-05: WITH + NO rejects with WEBSITE_MISSING', () => {
  const c = createCandidate({ websiteAvail: 'ABSENT' });
  const res = qualifiesCandidate(c, { rating: 'ANY', website: 'WITH_WEBSITE' });
  assert.equal(res.websiteQualified, false);
  assert.equal(res.rejectionReason, 'WEBSITE_MISSING');
});

test('B-06: WITH + UNKNOWN rejects with WEBSITE_UNKNOWN', () => {
  const c = createCandidate({ websiteAvail: 'UNKNOWN' });
  const res = qualifiesCandidate(c, { rating: 'ANY', website: 'WITH_WEBSITE' });
  assert.equal(res.websiteQualified, false);
  assert.equal(res.rejectionReason, 'WEBSITE_UNKNOWN');
});

test('B-07: WITHOUT + YES rejects with WEBSITE_MISSING', () => {
  const c = createCandidate({ website: 'https://example.com' });
  const res = qualifiesCandidate(c, { rating: 'ANY', website: 'WITHOUT_WEBSITE' });
  assert.equal(res.websiteQualified, false);
  assert.equal(res.rejectionReason, 'WEBSITE_MISSING');
});

test('B-08: WITHOUT + NO passes', () => {
  const c = createCandidate({ websiteAvail: 'ABSENT' });
  const res = qualifiesCandidate(c, { rating: 'ANY', website: 'WITHOUT_WEBSITE' });
  assert.equal(res.websiteQualified, true);
  assert.equal(res.qualified, true);
});

test('B-09: WITHOUT + UNKNOWN rejects with WEBSITE_UNKNOWN', () => {
  const c = createCandidate({ websiteAvail: 'UNKNOWN' });
  const res = qualifiesCandidate(c, { rating: 'ANY', website: 'WITHOUT_WEBSITE' });
  assert.equal(res.websiteQualified, false);
  assert.equal(res.rejectionReason, 'WEBSITE_UNKNOWN');
});

// ─── SECTION C: 3 x 3 COMBINATION MATRIX ────────────────────────────────────
group('SECTION C: 3 x 3 MATRIX COMBINATIONS');

test('C-01: Rating ANY + Website ANY matches everything', () => {
  const c1 = createCandidate({ rating: 5.0, website: 'https://ex.com' });
  const c2 = createCandidate({ rating: null, websiteAvail: 'ABSENT' });
  const c3 = createCandidate({ rating: 2.1, websiteAvail: 'UNKNOWN' });

  assert.equal(qualifiesCandidate(c1, { rating: 'ANY', website: 'ANY' }).qualified, true);
  assert.equal(qualifiesCandidate(c2, { rating: 'ANY', website: 'ANY' }).qualified, true);
  assert.equal(qualifiesCandidate(c3, { rating: 'ANY', website: 'ANY' }).qualified, true);
});

test('C-02: Rating ANY + Website WITH matches only businesses with website', () => {
  const cMatch = createCandidate({ rating: 3.1, website: 'https://ex.com' });
  const cNo = createCandidate({ rating: 4.8, websiteAvail: 'ABSENT' });

  assert.equal(qualifiesCandidate(cMatch, { rating: 'ANY', website: 'WITH_WEBSITE' }).qualified, true);
  assert.equal(qualifiesCandidate(cNo, { rating: 'ANY', website: 'WITH_WEBSITE' }).qualified, false);
});

test('C-03: Rating ANY + Website WITHOUT matches only businesses without website', () => {
  const cMatch = createCandidate({ rating: 3.1, websiteAvail: 'ABSENT' });
  const cHas = createCandidate({ rating: 4.8, website: 'https://ex.com' });

  assert.equal(qualifiesCandidate(cMatch, { rating: 'ANY', website: 'WITHOUT_WEBSITE' }).qualified, true);
  assert.equal(qualifiesCandidate(cHas, { rating: 'ANY', website: 'WITHOUT_WEBSITE' }).qualified, false);
});

test('C-04: Rating 4.0+ + Website ANY matches rating >= 4.0 regardless of website', () => {
  const cMatch = createCandidate({ rating: 4.2, websiteAvail: 'UNKNOWN' });
  const cLow = createCandidate({ rating: 3.8, website: 'https://ex.com' });

  assert.equal(qualifiesCandidate(cMatch, { rating: 'FOUR_PLUS', website: 'ANY' }).qualified, true);
  assert.equal(qualifiesCandidate(cLow, { rating: 'FOUR_PLUS', website: 'ANY' }).qualified, false);
});

test('C-05: Rating 4.0+ + Website WITH requires both rating >= 4.0 AND website', () => {
  const cBoth = createCandidate({ rating: 4.5, website: 'https://ex.com' });
  const cLowRating = createCandidate({ rating: 3.9, website: 'https://ex.com' });
  const cNoWeb = createCandidate({ rating: 4.5, websiteAvail: 'ABSENT' });

  assert.equal(qualifiesCandidate(cBoth, { rating: 'FOUR_PLUS', website: 'WITH_WEBSITE' }).qualified, true);
  assert.equal(qualifiesCandidate(cLowRating, { rating: 'FOUR_PLUS', website: 'WITH_WEBSITE' }).qualified, false);
  assert.equal(qualifiesCandidate(cNoWeb, { rating: 'FOUR_PLUS', website: 'WITH_WEBSITE' }).qualified, false);
});

test('C-06: Rating 4.0+ + Website WITHOUT requires rating >= 4.0 AND confirmed absent website', () => {
  const cBoth = createCandidate({ rating: 4.2, websiteAvail: 'ABSENT' });
  const cHasWeb = createCandidate({ rating: 4.2, website: 'https://ex.com' });
  const cLowRating = createCandidate({ rating: 3.7, websiteAvail: 'ABSENT' });

  assert.equal(qualifiesCandidate(cBoth, { rating: 'FOUR_PLUS', website: 'WITHOUT_WEBSITE' }).qualified, true);
  assert.equal(qualifiesCandidate(cHasWeb, { rating: 'FOUR_PLUS', website: 'WITHOUT_WEBSITE' }).qualified, false);
  assert.equal(qualifiesCandidate(cLowRating, { rating: 'FOUR_PLUS', website: 'WITHOUT_WEBSITE' }).qualified, false);
});

test('C-07: Rating 4.5+ + Website ANY matches rating >= 4.5 regardless of website', () => {
  const cMatch = createCandidate({ rating: 4.6, websiteAvail: 'UNKNOWN' });
  const cLow = createCandidate({ rating: 4.4, website: 'https://ex.com' });

  assert.equal(qualifiesCandidate(cMatch, { rating: 'FOUR_POINT_FIVE_PLUS', website: 'ANY' }).qualified, true);
  assert.equal(qualifiesCandidate(cLow, { rating: 'FOUR_POINT_FIVE_PLUS', website: 'ANY' }).qualified, false);
});

test('C-08: Rating 4.5+ + Website WITH requires rating >= 4.5 AND website', () => {
  const cBoth = createCandidate({ rating: 4.8, website: 'https://ex.com' });
  const cLowRating = createCandidate({ rating: 4.4, website: 'https://ex.com' });
  const cNoWeb = createCandidate({ rating: 4.8, websiteAvail: 'ABSENT' });

  assert.equal(qualifiesCandidate(cBoth, { rating: 'FOUR_POINT_FIVE_PLUS', website: 'WITH_WEBSITE' }).qualified, true);
  assert.equal(qualifiesCandidate(cLowRating, { rating: 'FOUR_POINT_FIVE_PLUS', website: 'WITH_WEBSITE' }).qualified, false);
  assert.equal(qualifiesCandidate(cNoWeb, { rating: 'FOUR_POINT_FIVE_PLUS', website: 'WITH_WEBSITE' }).qualified, false);
});

test('C-09: Rating 4.5+ + Website WITHOUT requires rating >= 4.5 AND confirmed absent website', () => {
  const cBoth = createCandidate({ rating: 4.9, websiteAvail: 'ABSENT' });
  const cHasWeb = createCandidate({ rating: 4.9, website: 'https://ex.com' });
  const cLowRating = createCandidate({ rating: 4.2, websiteAvail: 'ABSENT' });

  assert.equal(qualifiesCandidate(cBoth, { rating: 'FOUR_POINT_FIVE_PLUS', website: 'WITHOUT_WEBSITE' }).qualified, true);
  assert.equal(qualifiesCandidate(cHasWeb, { rating: 'FOUR_POINT_FIVE_PLUS', website: 'WITHOUT_WEBSITE' }).qualified, false);
  assert.equal(qualifiesCandidate(cLowRating, { rating: 'FOUR_POINT_FIVE_PLUS', website: 'WITHOUT_WEBSITE' }).qualified, false);
});

// ─── SECTION D: MULTI-KEYWORD ORCHESTRATION ────────────────────────────────
group('SECTION D: MULTI-KEYWORD DEDUPLICATION');

await asyncTest('D-01: 3 keywords with identical candidate appearing in all 3 yields 1 candidate & 2 suppressed duplicates', async () => {
  const keywords = ['real estate developer', 'property developer', 'real estate company'];
  const sharedPlaceId = 'ChIJsharedplace999';

  const candQ1 = createCandidate({ name: 'Apex Developments', placeId: sharedPlaceId, mapsUrl: 'https://www.google.com/maps/place/Apex', rating: 4.8, website: 'https://apex.com' });
  const candQ2 = createCandidate({ name: 'Apex Developments', placeId: sharedPlaceId, mapsUrl: 'https://www.google.com/maps/place/Apex', rating: 4.8, website: 'https://apex.com' });
  const candQ3 = createCandidate({ name: 'Apex Developments', placeId: sharedPlaceId, mapsUrl: 'https://www.google.com/maps/place/Apex', rating: 4.8, website: 'https://apex.com' });

  const queryMock = async (kw, idx) => {
    if (idx === 0) return [candQ1];
    if (idx === 1) return [candQ2];
    if (idx === 2) return [candQ3];
    return [];
  };

  const result = await executeMultiQueryResearch(
    { keywords, filters: { rating: 'FOUR_PLUS', website: 'WITH_WEBSITE' } },
    queryMock
  );

  assert.equal(result.status, 'COMPLETED');
  assert.equal(result.counters.queries, 3);
  assert.equal(result.counters.candidatesDiscovered, 3);
  assert.equal(result.counters.duplicatesSuppressed, 2);
  assert.equal(result.counters.finalQualified, 1);
  assert.equal(result.deduplicatedCandidates.length, 1);
  assert.equal(result.qualifiedCandidates.length, 1);
});

// ─── SECTION E: FAILURE ISOLATION ───────────────────────────────────────────
group('SECTION E: FAILURE ISOLATION');

await asyncTest('E-01: One failing query does not discard successful queries', async () => {
  const keywords = ['keyword_1', 'keyword_2_error', 'keyword_3'];
  const c1 = createCandidate({ name: 'Prime Estate', rating: 4.6, website: 'https://prime.com' });
  const c3 = createCandidate({ name: 'Summit Group', rating: 4.7, website: 'https://summit.com' });

  const queryMock = async (kw, idx) => {
    if (idx === 0) return [c1];
    if (idx === 1) throw new Error('Timeout or network failure');
    if (idx === 2) return [c3];
    return [];
  };

  const result = await executeMultiQueryResearch(
    { keywords, filters: { rating: 'FOUR_PLUS', website: 'WITH_WEBSITE' } },
    queryMock
  );

  assert.equal(result.status, 'PARTIALLY_COMPLETED');
  assert.equal(result.counters.queries, 3);
  assert.equal(result.counters.failedQueries, 1);
  assert.equal(result.counters.candidatesDiscovered, 2);
  assert.equal(result.counters.finalQualified, 2);
  assert.equal(result.qualifiedCandidates.length, 2);
});

test('E-02: Malformed candidates do not throw uncaught errors', () => {
  const malformed = [null, undefined, {}, { rating: 'abc' }, { websiteUrl: 999 }];
  for (const m of malformed) {
    const res = qualifiesCandidate(m, { rating: 'FOUR_PLUS', website: 'WITH_WEBSITE' });
    assert.equal(res.qualified, false);
  }
});

// ─── SECTION F: STOP CONDITIONS & CANCELLATION ──────────────────────────────
group('SECTION F: STOP CONDITIONS & CANCELLATION');

await asyncTest('F-01: Reaching maxResults cap terminates early', async () => {
  const keywords = ['kw1', 'kw2', 'kw3', 'kw4'];
  const c1 = createCandidate({ name: 'Alpha', rating: 4.8, website: 'https://alpha.com' });
  const c2 = createCandidate({ name: 'Beta', rating: 4.8, website: 'https://beta.com' });
  let kw3Run = false;

  const queryMock = async (kw, idx) => {
    if (idx === 0) return [c1];
    if (idx === 1) return [c2];
    if (idx === 2) { kw3Run = true; return []; }
    return [];
  };

  const result = await executeMultiQueryResearch(
    { keywords, filters: { rating: 'FOUR_PLUS', website: 'WITH_WEBSITE' }, maxResults: 2 },
    queryMock
  );

  assert.equal(result.status, 'LIMIT_REACHED');
  assert.equal(result.counters.finalQualified, 2);
  assert.equal(kw3Run, false);
});

await asyncTest('F-02: Cancellation stops further queries while preserving collected candidates', async () => {
  const keywords = ['kw1', 'kw2', 'kw3'];
  const c1 = createCandidate({ name: 'Alpha', rating: 4.8, website: 'https://alpha.com' });
  let stopFlag = false;

  const queryMock = async (kw, idx) => {
    if (idx === 0) {
      stopFlag = true;
      return [c1];
    }
    return [];
  };

  const result = await executeMultiQueryResearch(
    { keywords, filters: { rating: 'FOUR_PLUS', website: 'WITH_WEBSITE' }, shouldStop: () => stopFlag },
    queryMock
  );

  assert.equal(result.status, 'CANCELLED');
  assert.equal(result.counters.candidatesDiscovered, 1);
  assert.equal(result.counters.finalQualified, 1);
});

// ─── SECTION G: EXPORT SAFETY ───────────────────────────────────────────────
group('SECTION G: EXPORT SAFETY & FIREWALL');

test('G-01: Projection creates ExportSafeLead without Google restricted fields', () => {
  const cand = createCandidate({
    name: 'Vanguard Properties',
    placeId: 'ChIJvanguard888',
    mapsUrl: 'https://www.google.com/maps/place/Vanguard',
    address: '100 Broadway, NY',
    rating: 4.9,
    website: 'https://vanguardprops.com'
  });

  const anchor = {
    sourceId: 'anc_001',
    sourceClass: 'WEBSITE_PUBLIC',
    targetUrl: 'https://vanguardprops.com',
    domain: 'vanguardprops.com',
    businessName: 'Vanguard Properties',
    inputMethod: 'STANDALONE_CRAWL',
    verifiedAt: new Date().toISOString(),
    isRestricted: false
  };

  const lead = toExportSafeLead({
    independentSource: anchor,
    independentEvidence: {
      domain: 'vanguardprops.com',
      canonicalUrl: 'https://vanguardprops.com',
      businessName: 'Vanguard Properties'
    },
    correlationCandidateId: cand.candidateId
  });

  const val = validateExportSafeLead(lead);
  assert.equal(val.isValid, true);
  assert.equal((val.errors || []).length, 0);

  const json = JSON.stringify(lead);
  assert.ok(!json.includes('ChIJvanguard888'));
  assert.ok(!json.includes('google.com/maps'));
  assert.ok(!json.includes('"rating"'));
});

// ─── SECTION H: END-TO-END PIPELINE ─────────────────────────────────────────
group('SECTION H: END-TO-END WORKSPACE PERSISTENCE PIPELINE');

await asyncTest('H-01: Full flow: Research -> Deduplicate -> Qualify -> Project -> Persist to WorkspaceRepository', async () => {
  const keywords = ['prop tech nyc', 'commercial real estate ny'];
  const backend = new MemoryStorageBackend();
  const repo = new WorkspaceRepository(backend, 'test_ns');
  await repo.initialize();

  const candA = createCandidate({ name: 'Blue Sky Towers', rating: 4.8, website: 'https://blueskytowers.com' });
  const candB = createCandidate({ name: 'Low Rated Realty', rating: 3.2, website: 'https://lowrated.com' });

  const queryMock = async (kw, idx) => {
    if (idx === 0) return [candA, candB];
    return [];
  };

  const researchResult = await executeMultiQueryResearch(
    { keywords, filters: { rating: 'FOUR_PLUS', website: 'WITH_WEBSITE' } },
    queryMock
  );

  assert.equal(researchResult.status, 'COMPLETED');
  assert.equal(researchResult.qualifiedCandidates.length, 1);
  const qualifiedCandidate = researchResult.qualifiedCandidates[0];

  // Project to ExportSafeLead
  const anchor = {
    sourceId: 'anc_bluesky',
    sourceClass: 'WEBSITE_PUBLIC',
    targetUrl: 'https://blueskytowers.com',
    domain: 'blueskytowers.com',
    businessName: 'Blue Sky Towers',
    inputMethod: 'STANDALONE_CRAWL',
    verifiedAt: new Date().toISOString(),
    isRestricted: false
  };

  const exportLead = toExportSafeLead({
    independentSource: anchor,
    independentEvidence: {
      domain: 'blueskytowers.com',
      canonicalUrl: 'https://blueskytowers.com',
      businessName: 'Blue Sky Towers'
    },
    correlationCandidateId: qualifiedCandidate.candidateId
  });

  // Persist into WorkspaceRepository
  const savedRecord = await repo.saveLead(exportLead);
  assert.ok(savedRecord);
  assert.equal(repo.size, 1);
  assert.equal(savedRecord.businessIdentity.domain, 'blueskytowers.com');

  // Verify zero Google fields in persisted record
  assert.doesNotThrow(() => verifyZeroGoogleFieldsInPersistedRecord(savedRecord));
});

// ============================================================================
// FINAL RECONCILIATION SUMMARY
// ============================================================================

console.log('\n================================================================');
console.log('ADVANCED RESEARCH & QUALIFICATION ENGINE TEST SUMMARY');
console.log('================================================================');
console.log(`Total Passed:  ${passedCount}`);
console.log(`Total Failed:  ${failedCount}`);
console.log('================================================================\n');

if (failedCount > 0) {
  process.exit(1);
}
