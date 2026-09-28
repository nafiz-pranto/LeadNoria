/**
 * Master Prompt 2: Query Planner & Discovery Engine Comprehensive Test Suite
 *
 * Validates deterministic query expansion, safety bounds, locale handling,
 * quality gate, query provenance, frontier lifecycle, and adversarial inputs.
 */

import assert from 'assert';
import {
  planResearchQueries,
  validateQueryQuality,
  calculateQueryYield,
  QueryFrontier,
  MAX_QUERIES_PER_RESEARCH_RUN,
  MAX_VARIANTS_PER_SEED,
  MAX_QUERY_LENGTH
} from '../src/extension/queryPlanner.ts';
import { processBatch } from '../src/extension/bulkProcessor.ts';
import { compileResearchIntent } from '../src/extension/relevanceEngine.ts';

console.log('================================================================');
console.log('MASTER PROMPT 2: QUERY PLANNER & DISCOVERY ENGINE TEST SUITE');
console.log('================================================================\n');

let passedChecks = 0;
function testAssert(condition, message) {
  assert(condition, message);
  passedChecks++;
  console.log(`✓ [PASS] ${message}`);
}

// -------------------------------------------------------------
// TEST SUITE 1: SEED QUERY INTEGRITY & ORDERING
// -------------------------------------------------------------
console.log('--- TEST SUITE 1: Seed Query Integrity & Ordering ---');

const furnitureQueries = planResearchQueries({
  seedKeywords: ['Furniture'],
  countryCode: 'BD',
  runId: 'test_run_1'
});

testAssert(furnitureQueries.length > 1, 'Query expansion generated candidate queries');
testAssert(furnitureQueries[0].query === 'Furniture', 'First query is strictly identical to user seed query');
testAssert(furnitureQueries[0].variantType === 'SEED', 'First query has variantType = SEED');
testAssert(furnitureQueries[0].sequence === 0, 'First query has sequence index 0');
testAssert(furnitureQueries[0].rationale.includes('Original user-entered seed'), 'Seed query rationale documented');
testAssert(furnitureQueries[0].country === 'BD', 'Seed query preserves target country code');

// -------------------------------------------------------------
// TEST SUITE 2: DEDUPLICATION & CASE-INSENSITIVITY
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 2: Deduplication & Quality Gate ---');

const duplicateSeedQueries = planResearchQueries({
  seedKeywords: ['Furniture', 'furniture', '  FURNITURE  '],
  countryCode: 'US',
  runId: 'test_run_dup'
});

const seedCount = duplicateSeedQueries.filter(q => q.variantType === 'SEED').length;
testAssert(seedCount === 1, `Case-insensitive and whitespace duplicate seeds collapsed to exactly 1 seed (got ${seedCount})`);

const existingSet = new Set(['furniture', 'sofa']);
const dupCheck = validateQueryQuality('Furniture', 'Furniture', existingSet);
testAssert(!dupCheck.valid, 'Quality gate rejects identical duplicate of existing query');
const dupCaseCheck = validateQueryQuality('SOFA', 'Furniture', existingSet);
testAssert(!dupCaseCheck.valid, 'Quality gate rejects case-variant duplicate of existing query');

// -------------------------------------------------------------
// TEST SUITE 3: BOUNDS & CEILINGS
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 3: Deterministic Bounds & Limits ---');

testAssert(MAX_QUERIES_PER_RESEARCH_RUN === 8, 'MAX_QUERIES_PER_RESEARCH_RUN is strictly 8');
testAssert(MAX_VARIANTS_PER_SEED === 5, 'MAX_VARIANTS_PER_SEED is strictly 5');
testAssert(MAX_QUERY_LENGTH === 60, 'MAX_QUERY_LENGTH is strictly 60');

const multiSeedQueries = planResearchQueries({
  seedKeywords: ['Furniture', 'Desk', 'Table', 'Chair', 'Bed', 'Cabinet', 'Shelf'],
  countryCode: 'US',
  runId: 'test_run_bounds'
});

testAssert(
  multiSeedQueries.length <= MAX_QUERIES_PER_RESEARCH_RUN,
  `Planned queries never exceed MAX_QUERIES_PER_RESEARCH_RUN (got ${multiSeedQueries.length} <= ${MAX_QUERIES_PER_RESEARCH_RUN})`
);

// -------------------------------------------------------------
// TEST SUITE 4: LOCALE-AWARE EXPANSION & FALLBACK
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 4: Locale-Aware Expansion ---');

const bdQueries = planResearchQueries({
  seedKeywords: ['Furniture'],
  countryCode: 'BD',
  runId: 'test_run_bd'
});

const bdLocaleVariants = bdQueries.filter(q => q.variantType === 'LOCALE_VARIANT');
testAssert(bdLocaleVariants.length > 0, `Country BD produces Bengali locale variants (got ${bdLocaleVariants.length})`);
testAssert(
  bdLocaleVariants.some(q => q.query === 'ফার্নিচার' || q.query === 'আসবাবপত্র'),
  'Bengali terms ("ফার্নিচার" or "আসবাবপত্র") included in BD locale expansion'
);

const deQueries = planResearchQueries({
  seedKeywords: ['Furniture'],
  countryCode: 'DE',
  runId: 'test_run_de'
});
const deLocaleVariants = deQueries.filter(q => q.variantType === 'LOCALE_VARIANT');
testAssert(
  deLocaleVariants.some(q => q.query === 'Möbel' || q.query === 'Möbelhaus'),
  'German terms ("Möbel" or "Möbelhaus") included in DE locale expansion'
);

const esQueries = planResearchQueries({
  seedKeywords: ['Furniture'],
  countryCode: 'ES',
  runId: 'test_run_es'
});
const esLocaleVariants = esQueries.filter(q => q.variantType === 'LOCALE_VARIANT');
testAssert(
  esLocaleVariants.some(q => q.query === 'Muebles'),
  'Spanish term ("Muebles") included in ES locale expansion'
);

const unknownCountryQueries = planResearchQueries({
  seedKeywords: ['Furniture'],
  countryCode: 'XX', // Unknown country code
  runId: 'test_run_xx'
});
const unknownLocaleVariants = unknownCountryQueries.filter(q => q.variantType === 'LOCALE_VARIANT');
testAssert(
  unknownLocaleVariants.length === 0,
  'Unknown country code falls back cleanly with zero hallucinated translations'
);

// -------------------------------------------------------------
// TEST SUITE 5: MULTI-KEYWORD SEEDS INTEGRITY
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 5: Multi-Keyword Seeds Integrity ---');

const dualSeedQueries = planResearchQueries({
  seedKeywords: ['Furniture', 'Office'],
  countryCode: 'US',
  runId: 'test_run_dual'
});

testAssert(dualSeedQueries[0].query === 'Furniture', 'Seed 1 is Furniture at index 0');
testAssert(dualSeedQueries[1].query === 'Office', 'Seed 2 is Office at index 1');
testAssert(dualSeedQueries[0].variantType === 'SEED' && dualSeedQueries[1].variantType === 'SEED', 'Both seeds marked as SEED variantType');

// -------------------------------------------------------------
// TEST SUITE 6: GLOBAL DEDUPLICATION ACROSS EXPANDED QUERIES
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 6: Global Deduplication Across Expanded Queries ---');

const entitiesMap = new Map();
const seenAdIds = new Set();
const seenEntityKeys = new Set();
const counters = {
  rawAds: 0,
  normalizedCandidates: 0,
  relevantCandidates: 0,
  uncertainCandidates: 0,
  notRelevantCandidates: 0,
  duplicatesRemoved: 0,
  finalUniqueLeads: 0,
  finalUniqueRelevantLeads: 0,
  uniqueEntitiesObserved: 0,
  relevantEntities: 0,
  uncertainEntities: 0,
  notRelevantEntities: 0,
  reasonCodes: {}
};

const intent = compileResearchIntent('CUSTOM', ['Furniture', 'Sofa'], undefined, 'US');

// Batch from Query 1 ("Furniture")
const candQuery1 = {
  libraryId: 'ad_101',
  pageName: 'Apex Comfort Furniture Studio',
  facebookPageUrl: 'https://facebook.com/apexcomfort',
  destinationUrl: 'https://apexcomfort.com/sofa',
  bodyCopy: 'Quality ergonomic living room furniture and sofas.',
  isActive: true
};

const batch1 = await processBatch(
  [candQuery1],
  entitiesMap,
  seenAdIds,
  seenEntityKeys,
  counters,
  {
    runId: 'run_dedup_test',
    countryCode: 'US',
    locationName: 'United States',
    currentKeyword: 'Furniture',
    intent,
    effectiveCeiling: 5000
  }
);

testAssert(entitiesMap.size === 1, 'Query 1 ("Furniture") registered 1 unique entity');
const leadAfterBatch1 = Array.from(entitiesMap.values())[0];
testAssert(leadAfterBatch1.matchedQueries?.includes('Furniture'), 'Lead records Query 1 in matchedQueries');

// Batch from Query 2 ("Sofa") with same advertiser but different ad
const candQuery2 = {
  libraryId: 'ad_102',
  pageName: 'Apex Comfort Furniture Studio',
  facebookPageUrl: 'https://facebook.com/apexcomfort',
  destinationUrl: 'https://apexcomfort.com/sofa-collection',
  bodyCopy: 'Brand new luxury leather sofa sets on sale.',
  isActive: true
};

const batch2 = await processBatch(
  [candQuery2],
  entitiesMap,
  seenAdIds,
  seenEntityKeys,
  batch1.counters,
  {
    runId: 'run_dedup_test',
    countryCode: 'US',
    locationName: 'United States',
    currentKeyword: 'Sofa',
    intent,
    effectiveCeiling: 5000
  }
);

testAssert(
  entitiesMap.size === 1,
  `Same advertiser discovered across different queries strictly deduplicates to 1 final entity (got ${entitiesMap.size})`
);
const leadAfterBatch2 = Array.from(entitiesMap.values())[0];
testAssert(leadAfterBatch2.adCount === 2, `Advertiser adCount merged to 2 (got ${leadAfterBatch2.adCount})`);
testAssert(leadAfterBatch2.adLibraryIds.length === 2, 'Both ad library IDs recorded');
testAssert(
  leadAfterBatch2.matchedQueries?.includes('Furniture') && leadAfterBatch2.matchedQueries?.includes('Sofa'),
  'matchedQueries contains both ["Furniture", "Sofa"] without entity duplication'
);

// -------------------------------------------------------------
// TEST SUITE 7: QUERY FRONTIER LIFECYCLE & SATURATION
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 7: Query Frontier Lifecycle & Saturation ---');

const frontier = new QueryFrontier('run_sat_test', furnitureQueries);
testAssert(frontier.getActiveQuery()?.query === 'Furniture', 'Active query starts at primary seed');

// Record high yield on seed
frontier.recordQueryMetrics(0, {
  rawAds: 20,
  normalizedAds: 20,
  newUniqueEntities: 8,
  duplicateEntities: 2,
  rejectedByRelevance: 8,
  uncertainByRelevance: 2
});

const q0 = frontier.getQueries()[0];
testAssert(q0.status === 'COMPLETED', 'Seed query marked COMPLETED');
testAssert(q0.yield === 0.4, `Query yield calculated correctly (8/20 = 0.4, got ${q0.yield})`);
testAssert(!frontier.getSaturationState().isSaturated, 'Frontier not saturated after productive query');

// Record zero new entities for two consecutive expansion queries
frontier.recordQueryMetrics(1, {
  rawAds: 10,
  normalizedAds: 10,
  newUniqueEntities: 0,
  duplicateEntities: 10,
  rejectedByRelevance: 0,
  uncertainByRelevance: 0
});
testAssert(!frontier.getSaturationState().isSaturated, 'Not saturated after 1st zero-yield query');

frontier.recordQueryMetrics(2, {
  rawAds: 12,
  normalizedAds: 12,
  newUniqueEntities: 0,
  duplicateEntities: 12,
  rejectedByRelevance: 0,
  uncertainByRelevance: 0
});

const satState = frontier.getSaturationState();
testAssert(satState.isSaturated, 'Frontier marked saturated after 2 consecutive zero-yield expansion queries');
testAssert(satState.reason?.includes('DISCOVERY_SATURATED'), 'Saturation reason accurately documented');
testAssert(frontier.getActiveQuery() === null, 'Active query becomes null when saturated');

// Test serialization & restore
const serialized = frontier.serialize();
const restored = QueryFrontier.restore(serialized);
testAssert(restored.getSaturationState().isSaturated === true, 'Restored frontier preserves saturation state');
testAssert(restored.getQueries().length === furnitureQueries.length, 'Restored frontier preserves planned queries list');

// -------------------------------------------------------------
// TEST SUITE 8: ADVERSARIAL INPUTS
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 8: Adversarial Inputs ---');

// 1. Empty keyword
const emptyRes = planResearchQueries({ seedKeywords: [''], countryCode: 'US', runId: 'test_empty' });
testAssert(emptyRes.length === 0, 'Empty keyword yields empty query plan safely');

// 2. Whitespace-only keyword
const wsRes = planResearchQueries({ seedKeywords: ['   \t\n  '], countryCode: 'US', runId: 'test_ws' });
testAssert(wsRes.length === 0, 'Whitespace-only keyword yields empty query plan safely');

// 3. Single-character keyword
const singleCharRes = planResearchQueries({ seedKeywords: ['x'], countryCode: 'US', runId: 'test_single' });
testAssert(singleCharRes.length === 0, 'Single-character keyword ignored by planner');

// 4. Overly long keyword (>MAX_QUERY_LENGTH)
const hugeKeyword = 'A'.repeat(100);
const hugeCheck = validateQueryQuality(hugeKeyword, 'seed', new Set());
testAssert(!hugeCheck.valid, `Keyword exceeding ${MAX_QUERY_LENGTH} chars rejected by quality gate`);

// 5. Punctuation-only keyword
const punctCheck = validateQueryQuality('!@#$%^&*()_+', 'seed', new Set());
testAssert(!punctCheck.valid, 'Punctuation-only keyword rejected by quality gate');

// 6. Contradictory/malicious industry terms
const casinoCheck = validateQueryQuality('Furniture Casino Poker', 'Furniture', new Set());
testAssert(!casinoCheck.valid && casinoCheck.reason?.includes('contradictory'), 'Query containing casino/betting contradiction token rejected');

const politicsCheck = validateQueryQuality('Senate Election Furniture', 'Furniture', new Set());
testAssert(!politicsCheck.valid && politicsCheck.reason?.includes('contradictory'), 'Query containing political campaign token rejected');

// 7. Generic fallback without hardcoded category
const customNiche = planResearchQueries({ seedKeywords: ['Leather Jackets'], countryCode: 'US', runId: 'test_niche' });
testAssert(customNiche.length > 1, 'Unindexed niche keyword generates bounded commercial variants');
testAssert(customNiche[0].query === 'Leather Jackets', 'Primary seed query preserved for niche');
testAssert(
  customNiche.some(q => q.query.includes('Store') || q.query.includes('Company')),
  'Commercial derivation generated for unindexed niche'
);

console.log('\n================================================================');
console.log(`ALL QUERY PLANNER SUITES PASSED CLEANLY! (${passedChecks} checks green)`);
console.log('================================================================\n');
