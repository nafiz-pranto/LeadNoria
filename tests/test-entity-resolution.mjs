/**
 * LeadNoria v1.1 - Entity Resolution & Advanced Deduplication Test Suite
 *
 * Validates Section 22 Test Matrix (Scenarios A through T):
 * A. Exact Ad Library ID duplicate
 * B. Same Page ID
 * C. Same Page URL
 * D. Same advertiser + domain
 * E. Same name only
 * F. Same name + different domain
 * G. Same domain + different Page
 * H. Parent brand vs local branch
 * I. Marketplace shared domain
 * J. Multi-keyword duplicate
 * K. Restart duplicate
 * L. Resume duplicate
 * M. Case variation
 * N. Unicode/punctuation variation
 * O. Short generic name
 * P. Agency vs client
 * Q. Reseller vs manufacturer
 * R. Alias handling
 * S. Merge explanation
 * T. Data preservation after merge
 */

import assert from 'node:assert';
import {
  EntityResolutionIndex,
  evaluateEntityMerge,
  mergeCandidateIntoEntity,
  normalizeAdvertiserName,
  getComparisonNameKey,
  isShortGenericName,
  normalizeFacebookPage,
  normalizeDestinationDomain,
  detectBranchRelationship
} from '../src/extension/entityResolver.ts';
import { processBatch } from '../src/extension/bulkProcessor.ts';

let totalChecks = 0;
let passedChecks = 0;
const testRecords = [];

function check(scenario, inputDesc, evidenceDesc, expected, actual, condition) {
  totalChecks++;
  const passed = Boolean(condition);
  if (passed) {
    passedChecks++;
    console.log(`[PASS] [Scenario ${scenario}] ${inputDesc} -> ${expected}`);
  } else {
    console.error(`[FAIL] [Scenario ${scenario}] ${inputDesc}`);
    console.error(`   Expected: ${expected}`);
    console.error(`   Actual:   ${actual}`);
  }

  testRecords.push({
    scenario,
    input: inputDesc,
    evidence: evidenceDesc,
    expected,
    actual,
    passed
  });

  assert.ok(passed, `Failed [Scenario ${scenario}]: ${inputDesc}`);
}

async function runEntityResolutionTests() {
  console.log('================================================================');
  console.log('LEADNORIA v1.1 ENTITY RESOLUTION & DEDUPLICATION TEST MATRIX');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Test A: Exact Ad Library ID duplicate
  // -------------------------------------------------------------
  {
    const existingEntities = new Map();
    const seenAdIds = new Set(['ad_1001']);
    const seenEntityKeys = new Set(['fb_page_100']);
    const counters = { rawAds: 1, normalizedCandidates: 1, relevantCandidates: 1, duplicatesRemoved: 0, finalUniqueLeads: 1 };

    const batch = await processBatch(
      [{
        libraryId: 'ad_1001',
        pageName: 'Hatil Furniture',
        facebookPageId: 'page_100',
        destinationUrl: 'https://hatil.com'
      }],
      existingEntities,
      seenAdIds,
      seenEntityKeys,
      counters,
      { runId: 'test_a', countryCode: 'BD', locationName: 'Bangladesh', currentKeyword: 'Furniture', effectiveCeiling: 5000 }
    );

    check(
      'A',
      'Input exact duplicate Ad Library ID ad_1001',
      'seenAdIds contains ad_1001',
      'DUPLICATE_REMOVED (No lead inflation, duplicatesRemoved + 1)',
      `duplicatesRemoved: ${batch.counters.duplicatesRemoved}, rawAds: ${batch.counters.rawAds}`,
      batch.counters.duplicatesRemoved === 1 && batch.counters.rawAds === 1 && batch.updatedEntities.length === 0
    );
  }

  // -------------------------------------------------------------
  // Test B: Same Page ID
  // -------------------------------------------------------------
  {
    const index = new EntityResolutionIndex();
    const entities = new Map();
    const lead1 = {
      id: 'lead_1',
      name: 'Otobi Furniture',
      canonicalName: 'Otobi Furniture',
      canonicalPageId: '987654321',
      facebookPageUrl: 'https://facebook.com/otobiofficial',
      adLibraryIds: ['ad_1'],
      matchedKeywords: ['Furniture'],
      matchedQueries: ['Furniture'],
      adCount: 1,
      activeAdCount: 1
    };
    entities.set('fb_987654321', lead1);
    index.indexEntity('fb_987654321', lead1);

    const cand = {
      libraryId: 'ad_2',
      pageName: 'Otobi BD Official',
      facebookPageId: '987654321',
      facebookPageUrl: 'https://facebook.com/otobiofficial'
    };

    const decision = evaluateEntityMerge(cand, entities, index);
    check(
      'B',
      'Candidate with different name variation but identical Page ID 987654321',
      'Exact Page ID 987654321 matches existing entity',
      'MERGE (STRONG, reason contains MERGE_EXACT_FACEBOOK_PAGE_ID)',
      `${decision.shouldMerge} (${decision.confidence}, ${decision.reason})`,
      decision.shouldMerge === true && decision.confidence === 'STRONG' && decision.targetKey === 'fb_987654321'
    );
  }

  // -------------------------------------------------------------
  // Test C: Same Page URL / Slug
  // -------------------------------------------------------------
  {
    const index = new EntityResolutionIndex();
    const entities = new Map();
    const lead1 = {
      id: 'lead_2',
      name: 'Navana Furniture',
      canonicalName: 'Navana Furniture',
      canonicalPageSlug: 'navana.furniture',
      facebookPageUrl: 'https://www.facebook.com/navana.furniture/?ref=page_internal',
      adLibraryIds: ['ad_nav_1'],
      matchedKeywords: ['Furniture'],
      matchedQueries: ['Furniture'],
      adCount: 1,
      activeAdCount: 1
    };
    entities.set('fbslug_navana.furniture', lead1);
    index.indexEntity('fbslug_navana.furniture', lead1);

    const cand = {
      libraryId: 'ad_nav_2',
      pageName: 'Navana Furniture Brand',
      facebookPageUrl: 'https://m.facebook.com/navana.furniture'
    };

    const decision = evaluateEntityMerge(cand, entities, index);
    check(
      'C',
      'Candidate with mobile Facebook URL m.facebook.com/navana.furniture',
      'Canonical page slug "navana.furniture" matches existing entity',
      'MERGE (STRONG, reason contains MERGE_CANONICAL_FACEBOOK_PAGE_SLUG)',
      `${decision.shouldMerge} (${decision.confidence}, ${decision.reason})`,
      decision.shouldMerge === true && decision.confidence === 'STRONG' && decision.targetKey === 'fbslug_navana.furniture'
    );
  }

  // -------------------------------------------------------------
  // Test D: Same advertiser + canonical domain
  // -------------------------------------------------------------
  {
    const index = new EntityResolutionIndex();
    const entities = new Map();
    const lead = {
      id: 'lead_3',
      name: 'Partex Furniture Industries',
      canonicalName: 'Partex Furniture Industries',
      destinationDomain: 'partexfurniture.com',
      destinationUrl: 'https://www.partexfurniture.com/living-room',
      adLibraryIds: ['ad_px_1'],
      matchedKeywords: ['Furniture'],
      matchedQueries: ['Furniture'],
      adCount: 1,
      activeAdCount: 1
    };
    const key = 'dom_partex_furniture_industries_partexfurniture.com';
    entities.set(key, lead);
    index.indexEntity(key, lead);

    const cand = {
      libraryId: 'ad_px_2',
      pageName: 'Partex Furniture Industries Ltd.',
      destinationUrl: 'https://partexfurniture.com/bedroom?utm_source=fb'
    };

    const decision = evaluateEntityMerge(cand, entities, index);
    check(
      'D',
      'Partex Furniture Industries Ltd. with destination partexfurniture.com',
      'Normalized brand matches "partex furniture industries" and domain matches "partexfurniture.com"',
      'MERGE (STRONG, corroborated name and domain)',
      `${decision.shouldMerge} (${decision.confidence}, ${decision.reason})`,
      decision.shouldMerge === true && decision.confidence === 'STRONG' && decision.targetKey === key
    );
  }

  // -------------------------------------------------------------
  // Test E: Same name only (no domain, no page)
  // -------------------------------------------------------------
  {
    const index = new EntityResolutionIndex();
    const entities = new Map();
    const lead = {
      id: 'lead_4',
      name: 'Brothers Furniture Exclusive',
      canonicalName: 'Brothers Furniture Exclusive',
      adLibraryIds: ['ad_bf_1'],
      matchedKeywords: ['Furniture'],
      matchedQueries: ['Furniture'],
      adCount: 1,
      activeAdCount: 1
    };
    const key = 'name_brothers_furniture_exclusive';
    entities.set(key, lead);
    index.indexEntity(key, lead);

    const cand = {
      libraryId: 'ad_bf_2',
      pageName: 'Brothers Furniture Exclusive'
    };

    const decision = evaluateEntityMerge(cand, entities, index);
    check(
      'E',
      'Same specific multi-word brand name without corroborating page or domain',
      'Brand name matches but lacks corroborating Page ID, URL, or Domain evidence',
      'DO NOT AUTO-MERGE (MODERATE, reason contains MERGE_CANDIDATE_MODERATE_IDENTITY)',
      `${decision.shouldMerge} (${decision.confidence}, ${decision.reason})`,
      decision.shouldMerge === false && decision.confidence === 'MODERATE' && decision.reason.includes('MERGE_CANDIDATE_MODERATE_IDENTITY')
    );
  }

  // -------------------------------------------------------------
  // Test F: Same name + different domain
  // -------------------------------------------------------------
  {
    const index = new EntityResolutionIndex();
    const entities = new Map();
    const lead = {
      id: 'lead_5',
      name: 'Regal Furniture Studio',
      canonicalName: 'Regal Furniture Studio',
      destinationDomain: 'regalfurniturebd.com',
      destinationUrl: 'https://regalfurniturebd.com',
      adLibraryIds: ['ad_rg_1'],
      matchedKeywords: ['Furniture'],
      matchedQueries: ['Furniture'],
      adCount: 1,
      activeAdCount: 1
    };
    const key = 'dom_regal_furniture_studio_regalfurniturebd.com';
    entities.set(key, lead);
    index.indexEntity(key, lead);

    const cand = {
      libraryId: 'ad_rg_2',
      pageName: 'Regal Furniture Studio',
      destinationDomain: 'regalfurniture-usa.com',
      destinationUrl: 'https://regalfurniture-usa.com'
    };

    const decision = evaluateEntityMerge(cand, entities, index);
    check(
      'F',
      'Same name but different independent destination domain',
      'regalfurniturebd.com vs regalfurniture-usa.com',
      'NON_MERGE (NON_MERGE_CONFLICTING_DESTINATION_DOMAIN)',
      `${decision.shouldMerge} (${decision.reason})`,
      decision.shouldMerge === false && decision.reason.includes('NON_MERGE_CONFLICTING_DESTINATION_DOMAIN')
    );
  }

  // -------------------------------------------------------------
  // Test G: Same domain + different Page
  // -------------------------------------------------------------
  {
    const index = new EntityResolutionIndex();
    const entities = new Map();
    const lead = {
      id: 'lead_6',
      name: 'Wood Decor',
      canonicalName: 'Wood Decor',
      canonicalPageSlug: 'wooddecor.main',
      facebookPageUrl: 'https://facebook.com/wooddecor.main',
      destinationDomain: 'wooddecor.com',
      destinationUrl: 'https://wooddecor.com',
      adLibraryIds: ['ad_wd_1'],
      matchedKeywords: ['Furniture'],
      matchedQueries: ['Furniture'],
      adCount: 1,
      activeAdCount: 1
    };
    const key = 'fbslug_wooddecor.main';
    entities.set(key, lead);
    index.indexEntity(key, lead);

    const cand = {
      libraryId: 'ad_wd_2',
      pageName: 'Wood Decor Outlet',
      facebookPageUrl: 'https://facebook.com/wooddecor.outlet',
      destinationUrl: 'https://wooddecor.com'
    };

    const decision = evaluateEntityMerge(cand, entities, index);
    check(
      'G',
      'Same domain but conflicting distinct Facebook pages',
      'wooddecor.main vs wooddecor.outlet',
      'NON_MERGE (NON_MERGE_CONFLICTING_FACEBOOK_PAGE or distinct branch)',
      `${decision.shouldMerge} (${decision.reason})`,
      decision.shouldMerge === false && (decision.reason.includes('CONFLICTING_FACEBOOK_PAGE') || decision.reason.includes('LOCAL_BRANCH'))
    );
  }

  // -------------------------------------------------------------
  // Test H: Parent brand vs local branch
  // -------------------------------------------------------------
  {
    const index = new EntityResolutionIndex();
    const entities = new Map();
    const parentLead = {
      id: 'lead_parent',
      name: 'ABC Furniture',
      canonicalName: 'ABC Furniture',
      facebookPageUrl: 'https://facebook.com/abcfurniture.hq',
      canonicalPageSlug: 'abcfurniture.hq',
      adLibraryIds: ['ad_p_1'],
      matchedKeywords: ['Furniture'],
      matchedQueries: ['Furniture'],
      adCount: 1,
      activeAdCount: 1
    };
    const key = 'fbslug_abcfurniture.hq';
    entities.set(key, parentLead);
    index.indexEntity(key, parentLead);

    const branchCand = {
      libraryId: 'ad_b_1',
      pageName: 'ABC Furniture Dhaka',
      facebookPageUrl: 'https://facebook.com/abcfurniture.dhaka'
    };

    const decision = evaluateEntityMerge(branchCand, entities, index);
    check(
      'H',
      'ABC Furniture Dhaka vs ABC Furniture',
      'Branch token "dhaka" detected and Facebook pages differ',
      'NON_MERGE (NON_MERGE_LOCAL_BRANCH_DISTINCTION)',
      `${decision.shouldMerge} (${decision.relationshipType}, ${decision.reason})`,
      decision.shouldMerge === false && decision.relationshipType === 'LOCAL_BRANCH' && decision.reason.includes('NON_MERGE_LOCAL_BRANCH_DISTINCTION')
    );
  }

  // -------------------------------------------------------------
  // Test I: Marketplace shared domain protection
  // -------------------------------------------------------------
  {
    const index = new EntityResolutionIndex();
    const entities = new Map();
    const lead = {
      id: 'lead_seller1',
      name: 'Handmade Crafts BD',
      canonicalName: 'Handmade Crafts BD',
      destinationDomain: 'daraz.com.bd',
      destinationUrl: 'https://www.daraz.com.bd/shop/handmade-crafts',
      adLibraryIds: ['ad_d_1'],
      matchedKeywords: ['Crafts'],
      matchedQueries: ['Crafts'],
      adCount: 1,
      activeAdCount: 1
    };
    const key = 'mkp_handmade_crafts_bd';
    entities.set(key, lead);
    index.indexEntity(key, lead);

    const cand = {
      libraryId: 'ad_d_2',
      pageName: 'Modern Home Decor',
      destinationDomain: 'daraz.com.bd',
      destinationUrl: 'https://www.daraz.com.bd/shop/modern-home'
    };

    const decision = evaluateEntityMerge(cand, entities, index);
    check(
      'I',
      'Two different sellers pointing to marketplace daraz.com.bd',
      'daraz.com.bd is in GENERIC_SHARED_DOMAINS',
      'NON_MERGE (NON_MERGE_SHARED_MARKETPLACE_DOMAIN)',
      `${decision.shouldMerge} (${decision.reason})`,
      decision.shouldMerge === false && decision.reason.includes('NON_MERGE_SHARED_MARKETPLACE_DOMAIN')
    );
  }

  // -------------------------------------------------------------
  // Test J: Multi-keyword duplicate merge
  // -------------------------------------------------------------
  {
    const entitiesMap = new Map();
    const seenAdIds = new Set();
    const seenEntityKeys = new Set();
    const counters = { rawAds: 0, normalizedCandidates: 0, relevantCandidates: 0, duplicatesRemoved: 0, finalUniqueLeads: 0 };

    // Query 1: "Furniture" discovers RFL Furniture ad 1
    const res1 = await processBatch(
      [{
        libraryId: 'ad_rfl_1',
        pageName: 'RFL Furniture',
        facebookPageId: '555666777',
        facebookPageUrl: 'https://facebook.com/rflfurniturebd',
        destinationUrl: 'https://rflbestbuy.com'
      }],
      entitiesMap,
      seenAdIds,
      seenEntityKeys,
      counters,
      { runId: 'run_multi', countryCode: 'BD', locationName: 'Bangladesh', currentKeyword: 'Furniture', effectiveCeiling: 5000 }
    );

    // Query 2: "Sofa" discovers RFL Furniture ad 2
    const res2 = await processBatch(
      [{
        libraryId: 'ad_rfl_2',
        pageName: 'RFL Furniture BD',
        facebookPageId: '555666777',
        facebookPageUrl: 'https://facebook.com/rflfurniturebd',
        destinationUrl: 'https://rflbestbuy.com'
      }],
      entitiesMap,
      seenAdIds,
      seenEntityKeys,
      res1.counters,
      { runId: 'run_multi', countryCode: 'BD', locationName: 'Bangladesh', currentKeyword: 'Sofa', effectiveCeiling: 5000 }
    );

    // Query 3: "Furniture Store" discovers RFL Furniture ad 3
    const res3 = await processBatch(
      [{
        libraryId: 'ad_rfl_3',
        pageName: 'RFL Furniture',
        facebookPageId: '555666777',
        facebookPageUrl: 'https://facebook.com/rflfurniturebd',
        destinationUrl: 'https://rflbestbuy.com'
      }],
      entitiesMap,
      seenAdIds,
      seenEntityKeys,
      res2.counters,
      { runId: 'run_multi', countryCode: 'BD', locationName: 'Bangladesh', currentKeyword: 'Furniture Store', effectiveCeiling: 5000 }
    );

    const rflEntity = entitiesMap.get('fbid_555666777') || entitiesMap.get('fb_555666777');
    check(
      'J',
      '3 distinct queries (Furniture, Sofa, Furniture Store) finding RFL Furniture',
      'Same Page ID 555666777 across 3 queries',
      'ONE FINAL ENTITY with matchedQueries = [Furniture, Sofa, Furniture Store] and adCount = 3',
      `entitiesCount: ${entitiesMap.size}, matchedQueries: ${JSON.stringify(rflEntity?.matchedQueries)}, adCount: ${rflEntity?.adCount}`,
      entitiesMap.size === 1 &&
      rflEntity?.adCount === 3 &&
      rflEntity?.matchedQueries?.length === 3 &&
      rflEntity?.matchedQueries.includes('Furniture') &&
      rflEntity?.matchedQueries.includes('Sofa') &&
      rflEntity?.matchedQueries.includes('Furniture Store')
    );
  }

  // -------------------------------------------------------------
  // Test K: Restart duplicate (Idempotency on identical batch)
  // -------------------------------------------------------------
  {
    const entitiesMap = new Map();
    const seenAdIds = new Set();
    const seenEntityKeys = new Set();
    const counters = { rawAds: 0, normalizedCandidates: 0, relevantCandidates: 0, duplicatesRemoved: 0, finalUniqueLeads: 0 };

    const batchInput = [{
      libraryId: 'ad_restart_1',
      pageName: 'Legacy Woodworks',
      facebookPageId: '888111222',
      destinationUrl: 'https://legacywood.com'
    }];

    // First run
    await processBatch(batchInput, entitiesMap, seenAdIds, seenEntityKeys, counters, {
      runId: 'run_k', countryCode: 'BD', locationName: 'BD', currentKeyword: 'Wood', effectiveCeiling: 5000
    });
    const stateA = { leads: entitiesMap.size, rawAds: counters.rawAds, duplicates: counters.duplicatesRemoved };

    // Second run (simulating crash restart / reprocessing same ads)
    await processBatch(batchInput, entitiesMap, seenAdIds, seenEntityKeys, counters, {
      runId: 'run_k', countryCode: 'BD', locationName: 'BD', currentKeyword: 'Wood', effectiveCeiling: 5000
    });

    check(
      'K',
      'Process same ad after restart',
      'Ad ad_restart_1 already in seenAdIds',
      'ZERO new leads created, state remains exactly 1 lead',
      `leads: ${entitiesMap.size}, duplicatesRemoved: ${counters.duplicatesRemoved}`,
      entitiesMap.size === 1 && stateA.leads === 1 && counters.duplicatesRemoved === 1
    );
  }

  // -------------------------------------------------------------
  // Test L: Resume duplicate (Resuming partial run)
  // -------------------------------------------------------------
  {
    const entitiesMap = new Map();
    const seenAdIds = new Set();
    const seenEntityKeys = new Set();
    const counters = { rawAds: 0, normalizedCandidates: 0, relevantCandidates: 0, duplicatesRemoved: 0, finalUniqueLeads: 0 };

    // Simulate pre-existing lead loaded from DB on resume
    const restoredLead = {
      id: 'lead_resumed_1',
      name: 'Restored Artisan Co',
      canonicalName: 'Restored Artisan Co',
      canonicalPageId: '777000111',
      facebookPageUrl: 'https://facebook.com/restoredartisan',
      adLibraryIds: ['ad_res_1'],
      matchedKeywords: ['Artisan'],
      matchedQueries: ['Artisan'],
      adCount: 1,
      activeAdCount: 1
    };
    entitiesMap.set('fbid_777000111', restoredLead);
    seenAdIds.add('ad_res_1');
    counters.finalUniqueLeads = 1;

    // Stream a new ad from same advertiser after resume
    await processBatch(
      [{
        libraryId: 'ad_res_2',
        pageName: 'Restored Artisan Co.',
        facebookPageId: '777000111',
        facebookPageUrl: 'https://facebook.com/restoredartisan'
      }],
      entitiesMap,
      seenAdIds,
      seenEntityKeys,
      counters,
      { runId: 'run_resume', countryCode: 'BD', locationName: 'BD', currentKeyword: 'Handmade', effectiveCeiling: 5000 }
    );

    check(
      'L',
      'Stream ad from existing advertiser after resume',
      'Entity restored in existingEntitiesMap with pageId 777000111',
      'MERGED into existing entity, finalUniqueLeads remains 1, adCount becomes 2',
      `finalUniqueLeads: ${counters.finalUniqueLeads}, adCount: ${restoredLead.adCount}`,
      counters.finalUniqueLeads === 1 && restoredLead.adCount === 2 && restoredLead.adLibraryIds.includes('ad_res_2')
    );
  }

  // -------------------------------------------------------------
  // Test M: Case variation
  // -------------------------------------------------------------
  {
    const norm1 = getComparisonNameKey('HATIL FURNITURE');
    const norm2 = getComparisonNameKey('hatil furniture');
    const norm3 = getComparisonNameKey('HaTiL FuRniTuRe');

    check(
      'M',
      'HATIL FURNITURE vs hatil furniture vs HaTiL FuRniTuRe',
      'Case insensitivity in comparison keys',
      'All produce identical key "hatil furniture"',
      `${norm1} === ${norm2} === ${norm3}`,
      norm1 === norm2 && norm2 === norm3 && norm1 === 'hatil furniture'
    );
  }

  // -------------------------------------------------------------
  // Test N: Unicode and punctuation variation
  // -------------------------------------------------------------
  {
    const norm1 = getComparisonNameKey('ABC - Furniture, Ltd.');
    const norm2 = getComparisonNameKey('ABC—Furniture  Limited');
    const norm3 = getComparisonNameKey('ABC & Furniture');

    check(
      'N',
      'Punctuation and legal suffix variation ("ABC - Furniture, Ltd." vs "ABC—Furniture Limited")',
      'Stripping punctuation, dashes, and standard legal suffixes',
      'Normalized comparison keys match "abc furniture"',
      `norm1: "${norm1}", norm2: "${norm2}"`,
      norm1 === 'abc furniture' && norm2 === 'abc furniture'
    );
  }

  // -------------------------------------------------------------
  // Test O: Short generic name protection
  // -------------------------------------------------------------
  {
    const isApexGeneric = isShortGenericName('Apex');
    const isNovaGeneric = isShortGenericName('Nova');
    const isHomeGeneric = isShortGenericName('Home');
    const isEliteGeneric = isShortGenericName('Elite');
    const isHatilGeneric = isShortGenericName('Hatil Furniture');

    const index = new EntityResolutionIndex();
    const entities = new Map();
    const cand = { libraryId: 'ad_apex_1', pageName: 'Apex' };
    const decision = evaluateEntityMerge(cand, entities, index);

    check(
      'O',
      'Advertiser name "Apex" without page ID or domain',
      'Apex is in SHORT_GENERIC_BRAND_TOKENS and lacks corroborating signals',
      'NON_MERGE (UNRESOLVED, reason contains NON_MERGE_GENERIC_NAME_AMBIGUOUS)',
      `${decision.shouldMerge} (${decision.confidence}, ${decision.reason})`,
      decision.shouldMerge === false && decision.confidence === 'UNRESOLVED' && isApexGeneric && isNovaGeneric && !isHatilGeneric
    );
  }

  // -------------------------------------------------------------
  // Test P: Agency advertising for client
  // -------------------------------------------------------------
  {
    const index = new EntityResolutionIndex();
    const entities = new Map();

    // Client Page
    const clientEntity = {
      id: 'lead_client',
      name: 'Elite Leather Bags',
      canonicalName: 'Elite Leather Bags',
      canonicalPageSlug: 'eliteleatherbd',
      facebookPageUrl: 'https://facebook.com/eliteleatherbd',
      destinationDomain: 'eliteleather.com',
      destinationUrl: 'https://eliteleather.com',
      adLibraryIds: ['ad_c_1'],
      matchedKeywords: ['Leather'],
      matchedQueries: ['Leather'],
      adCount: 1,
      activeAdCount: 1
    };
    entities.set('fbslug_eliteleatherbd', clientEntity);
    index.indexEntity('fbslug_eliteleatherbd', clientEntity);

    // Agency Page running ads for themselves or someone else
    const agencyCand = {
      libraryId: 'ad_agency_1',
      pageName: 'GrowFast Digital Agency',
      facebookPageUrl: 'https://facebook.com/growfastagency',
      destinationUrl: 'https://growfast.agency'
    };

    const decision = evaluateEntityMerge(agencyCand, entities, index);
    check(
      'P',
      'GrowFast Digital Agency vs Elite Leather Bags',
      'Different Facebook Page and different domain',
      'NON_MERGE (Independent business entities kept separate)',
      `${decision.shouldMerge} (${decision.targetKey})`,
      decision.shouldMerge === false && decision.targetKey !== 'fbslug_eliteleatherbd'
    );
  }

  // -------------------------------------------------------------
  // Test Q: Reseller vs manufacturer
  // -------------------------------------------------------------
  {
    const index = new EntityResolutionIndex();
    const entities = new Map();

    // Manufacturer
    const mfgEntity = {
      id: 'lead_mfg',
      name: 'Sony Bangladesh Official',
      canonicalName: 'Sony Bangladesh Official',
      canonicalPageSlug: 'sonybdofficial',
      facebookPageUrl: 'https://facebook.com/sonybdofficial',
      destinationDomain: 'sony.com.bd',
      destinationUrl: 'https://sony.com.bd',
      adLibraryIds: ['ad_mfg_1'],
      matchedKeywords: ['Electronics'],
      matchedQueries: ['Electronics'],
      adCount: 1,
      activeAdCount: 1
    };
    entities.set('fbslug_sonybdofficial', mfgEntity);
    index.indexEntity('fbslug_sonybdofficial', mfgEntity);

    // Third-party Reseller
    const resellerCand = {
      libraryId: 'ad_resell_1',
      pageName: 'Rangs Electronics (Sony Reseller)',
      facebookPageUrl: 'https://facebook.com/rangselectronics',
      destinationUrl: 'https://rangs.com.bd'
    };

    const decision = evaluateEntityMerge(resellerCand, entities, index);
    check(
      'Q',
      'Rangs Electronics (Sony Reseller) vs Sony Bangladesh Official',
      'Distinct Facebook Page (rangselectronics vs sonybdofficial) and distinct domain',
      'NON_MERGE (Manufacturer and reseller kept strictly separate)',
      `${decision.shouldMerge} (${decision.targetKey})`,
      decision.shouldMerge === false && decision.targetKey !== 'fbslug_sonybdofficial'
    );
  }

  // -------------------------------------------------------------
  // Test R: Alias handling
  // -------------------------------------------------------------
  {
    const entity = {
      id: 'lead_alias',
      name: 'RFL Furniture',
      canonicalName: 'RFL Furniture',
      canonicalPageId: '12345',
      adLibraryIds: ['ad_al_1'],
      matchedKeywords: ['Furniture'],
      matchedQueries: ['Furniture'],
      adCount: 1,
      activeAdCount: 1,
      aliases: []
    };

    const cand = {
      libraryId: 'ad_al_2',
      pageName: 'RFL Furniture BD Official',
      facebookPageId: '12345'
    };

    const decision = {
      shouldMerge: true,
      targetKey: 'fb_12345',
      confidence: 'STRONG',
      reason: 'MERGE_EXACT_FACEBOOK_PAGE_ID',
      relationshipType: 'INDEPENDENT_BUSINESS'
    };

    mergeCandidateIntoEntity(entity, cand, decision, 'Sofa');

    check(
      'R',
      'Merge candidate with display name variant "RFL Furniture BD Official"',
      'Candidate merged into entity with primary name "RFL Furniture"',
      'Alias "RFL Furniture BD Official" added to aliases array without overwriting canonicalName',
      `canonical: "${entity.canonicalName}", aliases: ${JSON.stringify(entity.aliases)}`,
      entity.canonicalName === 'RFL Furniture' &&
      Array.isArray(entity.aliases) &&
      entity.aliases.includes('RFL Furniture BD Official')
    );
  }

  // -------------------------------------------------------------
  // Test S: Merge explanation audit trail
  // -------------------------------------------------------------
  {
    const entity = {
      id: 'lead_audit',
      name: 'Audit Test Furniture',
      canonicalName: 'Audit Test Furniture',
      canonicalPageId: '999888',
      adLibraryIds: ['ad_au_1'],
      matchedKeywords: ['Furniture'],
      matchedQueries: ['Furniture'],
      adCount: 1,
      activeAdCount: 1,
      mergeHistory: []
    };

    const cand = {
      libraryId: 'ad_au_2',
      pageName: 'Audit Test Furniture',
      facebookPageId: '999888'
    };

    const decision = {
      shouldMerge: true,
      targetKey: 'fb_999888',
      confidence: 'STRONG',
      reason: 'MERGE_EXACT_FACEBOOK_PAGE_ID: Matched Page ID 999888',
      relationshipType: 'INDEPENDENT_BUSINESS'
    };

    mergeCandidateIntoEntity(entity, cand, decision, 'Luxury Sofa');

    const lastMerge = entity.mergeHistory[entity.mergeHistory.length - 1];
    check(
      'S',
      'Inspect mergeHistory on merged entity',
      'Merge performed with structured reason and source query',
      'mergeHistory records timestamp, reason, sourceLibraryId, sourceQuery, and confidence',
      `mergeHistory entry: ${JSON.stringify(lastMerge)}`,
      entity.mergeHistory.length === 1 &&
      lastMerge.mergeReason.includes('MERGE_EXACT_FACEBOOK_PAGE_ID') &&
      lastMerge.sourceLibraryId === 'ad_au_2' &&
      lastMerge.sourceQuery === 'Luxury Sofa' &&
      lastMerge.confidence === 'STRONG'
    );
  }

  // -------------------------------------------------------------
  // Test T: Complete data preservation during merge
  // -------------------------------------------------------------
  {
    const entity = {
      id: 'lead_preservation',
      name: 'Preserve Test Corp',
      canonicalName: 'Preserve Test Corp',
      canonicalPageId: '111222',
      facebookPageUrl: 'https://facebook.com/preservetest',
      destinationDomain: 'preservetest.com',
      destinationUrl: 'https://preservetest.com/page1',
      observedDomains: ['preservetest.com'],
      observedUrls: ['https://preservetest.com/page1'],
      adLibraryIds: ['ad_pres_1'],
      matchedKeywords: ['Query1'],
      matchedQueries: ['Query1'],
      adCount: 1,
      activeAdCount: 1,
      sampleCopy: 'Original Ad Copy 1',
      sampleCta: 'Shop Now',
      aliases: [],
      mergeHistory: []
    };

    const cand = {
      libraryId: 'ad_pres_2',
      pageName: 'Preserve Test Corp International',
      facebookPageId: '111222',
      destinationUrl: 'https://preservetest.com/page2?promo=spring',
      destinationDomain: 'preservetest.com',
      bodyCopy: 'Brand new creative copy',
      ctaText: 'Learn More'
    };

    const decision = {
      shouldMerge: true,
      targetKey: 'fb_111222',
      confidence: 'STRONG',
      reason: 'MERGE_EXACT_FACEBOOK_PAGE_ID',
      relationshipType: 'INDEPENDENT_BUSINESS'
    };

    mergeCandidateIntoEntity(entity, cand, decision, 'Query2');

    check(
      'T',
      'Verify all evidence preserved after merge',
      'All Ad IDs, URLs, queries, and copies retained without destructive overwrite',
      'adLibraryIds=[ad_pres_1, ad_pres_2], matchedQueries=[Query1, Query2], observedUrls has both URLs, adCount=2',
      `adLibraryIds: ${entity.adLibraryIds.length}, matchedQueries: ${entity.matchedQueries.length}, observedUrls: ${entity.observedUrls.length}`,
      entity.adLibraryIds.length === 2 &&
      entity.adLibraryIds.includes('ad_pres_1') &&
      entity.adLibraryIds.includes('ad_pres_2') &&
      entity.matchedQueries.length === 2 &&
      entity.matchedQueries.includes('Query1') &&
      entity.matchedQueries.includes('Query2') &&
      entity.observedUrls.length === 2 &&
      entity.observedUrls.includes('https://preservetest.com/page1') &&
      entity.observedUrls.includes('https://preservetest.com/page2?promo=spring') &&
      entity.sampleCopy === 'Original Ad Copy 1' &&
      entity.adCount === 2
    );
  }

  // -------------------------------------------------------------
  // Test U: Moderate candidate upgraded by stronger later evidence
  // -------------------------------------------------------------
  {
    const index = new EntityResolutionIndex();
    const entities = new Map();
    const lead = {
      id: 'lead_lumina',
      name: 'Lumina Interiors',
      canonicalName: 'Lumina Interiors',
      canonicalPageId: 'lumina_page_999',
      adLibraryIds: ['ad_lum_1'],
      matchedKeywords: ['Interior'],
      matchedQueries: ['Interior'],
      adCount: 1,
      activeAdCount: 1
    };
    const key = 'fb_lumina_page_999';
    entities.set(key, lead);
    index.indexEntity(key, lead);

    // Ad with only brand name: evaluated as MODERATE candidate, kept separate (DO NOT auto-merge)
    const moderateCand = {
      libraryId: 'ad_lum_mod',
      pageName: 'Lumina Interiors'
    };
    const modDecision = evaluateEntityMerge(moderateCand, entities, index);
    assert.strictEqual(modDecision.shouldMerge, false, 'Moderate candidate must not auto-merge');
    assert.ok(modDecision.reason.includes('MERGE_CANDIDATE_MODERATE_IDENTITY'), 'Must classify as MERGE_CANDIDATE_MODERATE_IDENTITY');

    // Subsequent ad with STRONG corroborating evidence (same exact Page ID): satisfies STRONG policy -> MERGED!
    const strongCand = {
      libraryId: 'ad_lum_strong',
      pageName: 'Lumina Interiors BD',
      facebookPageId: 'lumina_page_999'
    };
    const strongDecision = evaluateEntityMerge(strongCand, entities, index);

    check(
      'U',
      'Moderate candidate upgraded by stronger later evidence (Page ID lumina_page_999)',
      'Subsequent ad provides exact Facebook Page ID matching existing entity',
      'MERGE ONLY WHEN EVIDENCE SATISFIES STRONG POLICY (STRONG, MERGE_EXACT_FACEBOOK_PAGE_ID)',
      `${strongDecision.shouldMerge} (${strongDecision.confidence}, ${strongDecision.reason})`,
      strongDecision.shouldMerge === true &&
      strongDecision.confidence === 'STRONG' &&
      strongDecision.reason.includes('MERGE_EXACT_FACEBOOK_PAGE_ID') &&
      strongDecision.targetKey === key
    );
  }

  console.log('\n================================================================');
  console.log(`ENTITY RESOLUTION TEST RESULTS: ${passedChecks}/${totalChecks} PASSED`);
  console.log('================================================================');

  if (passedChecks === totalChecks) {
    console.log('ALL SECTION 22 & 3.1 TESTS (A through U) PASSED CLEANLY.\n');
  } else {
    process.exit(1);
  }
}

runEntityResolutionTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
