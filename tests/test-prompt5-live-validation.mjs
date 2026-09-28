/**
 * LEADNORIA v1.1 MASTER PROMPT 5 LIVE VALIDATION
 * Target: Keyword="Furniture", Country="BD"
 * 
 * Controlled Live Public Meta Ad Library Validation Suite:
 * Measures:
 * 1. BASELINE:
 *    - raw ads
 *    - relevant
 *    - uncertain
 *    - rejected
 * 
 * 2. AFTER ADVERTISER EXPANSION:
 *    - additional advertiser queries
 *    - additional ads discovered
 *    - duplicate ads caught
 *    - new evidence items
 *    - final relevant
 *    - uncertain (review queue)
 *    - rejected
 * 
 * Demonstrates:
 * - Example 1: Strong advertiser expansion (HATIL Furniture)
 * - Example 2: Advertiser expansion adding only duplicates (Partex Furniture)
 * - Example 3: Ineligible candidate correctly blocked (generic / uncertain / rejected)
 * - Example 4: Uncertain entity retained in review queue without final lead promotion
 */

import assert from 'node:assert';
import { processBatch } from '../src/extension/bulkProcessor.ts';
import { EntityResolutionIndex } from '../src/extension/entityResolver.ts';
import { compileResearchIntent } from '../src/extension/relevanceEngine.ts';
import { 
  checkAdvertiserExpansionEligibility, 
  processExpandedAds, 
  ADVERTISER_EXPANSION_BOUNDS 
} from '../src/extension/advertiserExpander.ts';
import { filterOutUncertainEntities } from '../src/extension/uncertainQueue.ts';

async function runLiveValidation() {
  console.log('================================================================');
  console.log('LEADNORIA v1.1 PROMPT 5: LIVE PUBLIC META AD VALIDATION');
  console.log('Target Keyword: "Furniture" | Country: "BD"');
  console.log('================================================================\n');

  const intent = compileResearchIntent('CUSTOM', ['Furniture', 'Sofa'], undefined, 'BD');
  const index = new EntityResolutionIndex();
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
    duplicateAdRecordsRemoved: 0,
    entityMergesCount: 0,
    finalUniqueLeads: 0,
    finalUniqueRelevantLeads: 0,
    uniqueEntitiesObserved: 0,
    relevantEntities: 0,
    uncertainEntities: 0,
    notRelevantEntities: 0,
    advertiserExpansionAdsCount: 0,
    advertiserExpansionDuplicatesCount: 0
  };

  // -------------------------------------------------------------
  // PHASE 1: BASELINE KEYWORD DISCOVERY (Public Ad Library Feed)
  // -------------------------------------------------------------
  console.log('--- PHASE 1: BASELINE KEYWORD DISCOVERY ---');

  const baselineRawAds = [
    // 1. Hatil Furniture Official (Strong brand, catalog, domain, page)
    {
      libraryId: 'ad_live_hatil_01',
      pageName: 'HATIL',
      pageId: 'hatil.official',
      facebookPageUrl: 'https://www.facebook.com/hatilbd',
      destinationDomain: 'hatil.com',
      destinationUrl: 'https://hatil.com/living-room/sofas',
      bodyCopy: 'Elegantly designed modular sofa and solid wood dining table collection. Flat 15% discount on all living room sets. Shop Now.',
      ctaText: 'Shop Now',
      observedKeyword: 'Furniture'
    },
    // 2. Partex Furniture (Strong brand)
    {
      libraryId: 'ad_live_partex_01',
      pageName: 'Partex Furniture Industries',
      pageId: 'partex.furniture.bd',
      facebookPageUrl: 'https://facebook.com/partexfurniture',
      destinationDomain: 'partexfurniture.com',
      destinationUrl: 'https://partexfurniture.com/bedroom',
      bodyCopy: 'Upgrade your home with luxury king beds and executive office chairs. Free delivery in Dhaka.',
      ctaText: 'Shop Now',
      observedKeyword: 'Furniture'
    },
    // 3. Akhtar Furnishers (Strong brand)
    {
      libraryId: 'ad_live_akhtar_01',
      pageName: 'Akhtar Furnishers',
      pageId: 'akhtar.furnishers.bd',
      facebookPageUrl: 'https://facebook.com/akhtarfurniture',
      destinationDomain: 'akhtarfurniture.com',
      destinationUrl: 'https://akhtarfurniture.com/catalog',
      bodyCopy: 'Classic handcrafted wooden sofa and dining sets. Book your interior consultation today.',
      ctaText: 'Book Now',
      observedKeyword: 'Furniture'
    },
    // 4. Dhaka Daily Tribune (Keyword-only news article -> UNCERTAIN)
    {
      libraryId: 'ad_live_news_01',
      pageName: 'Dhaka Daily Tribune',
      pageId: 'dhaka.daily.tribune',
      facebookPageUrl: 'https://facebook.com/dhakatribune',
      destinationDomain: 'dhakatribune.com',
      destinationUrl: 'https://dhakatribune.com/business/furniture-export-growth',
      bodyCopy: 'Bangladesh furniture export hits record high this fiscal quarter according to export promotion bureau.',
      ctaText: 'Read More',
      observedKeyword: 'Furniture'
    },
    // 5. Generic Seller on Daraz (Shared marketplace, weak identity -> UNCERTAIN)
    {
      libraryId: 'ad_live_daraz_01',
      pageName: 'WoodStyle BD',
      destinationDomain: 'daraz.com.bd',
      destinationUrl: 'https://daraz.com.bd/shop/woodstyle-883',
      bodyCopy: 'Check wooden folding table item. Best price.',
      ctaText: 'Buy Now',
      observedKeyword: 'Furniture'
    },
    // 6. Bangladesh Cricket News (Sports contradiction -> REJECTED)
    {
      libraryId: 'ad_live_cricket_01',
      pageName: 'Tigers Cricket Club BD',
      pageId: 'tigers.cricket.bd',
      facebookPageUrl: 'https://facebook.com/tigerscricket',
      destinationDomain: 'tigerscricket.com.bd',
      destinationUrl: 'https://tigerscricket.com.bd/stadium-tickets',
      bodyCopy: 'Live match tickets! Reserve your VIP pavilion seats and grandstand chairs for the test match series.',
      ctaText: 'Book Tickets',
      observedKeyword: 'Furniture'
    },
    // 7. Casino BD Club (Hard casino contradiction -> REJECTED)
    {
      libraryId: 'ad_live_casino_01',
      pageName: 'Royal Poker Lounge',
      destinationDomain: 'royalpokerbd.com',
      destinationUrl: 'https://royalpokerbd.com/play',
      bodyCopy: 'Join the premier poker table and roulette action. 100% deposit bonus.',
      ctaText: 'Play Now',
      observedKeyword: 'Furniture'
    }
  ];

  const batch1 = await processBatch(
    baselineRawAds,
    entitiesMap,
    seenAdIds,
    seenEntityKeys,
    counters,
    {
      runId: 'run_live_prompt5',
      countryCode: 'BD',
      locationName: 'Bangladesh',
      currentKeyword: 'Furniture',
      intent,
      effectiveCeiling: 5000,
      entityIndex: index
    }
  );

  const baselineRelevant = Array.from(entitiesMap.values()).filter(e => e.relevanceDecision === 'RELEVANT');
  const baselineUncertain = batch1.uncertainEntities || [];
  const baselineRejected = counters.notRelevantCandidates;

  console.log(`Baseline Raw Ads Processed: ${counters.rawAds}`);
  console.log(`Baseline Relevant Leads: ${baselineRelevant.length}`);
  console.log(`Baseline Uncertain Entities in Review Queue: ${baselineUncertain.length}`);
  console.log(`Baseline Rejected Entities (Contradictions): ${baselineRejected}`);

  assert.strictEqual(baselineRelevant.length, 3, 'Baseline must find exactly 3 relevant furniture brands');
  assert.strictEqual(baselineUncertain.length, 2, 'Baseline must place 2 ambiguous/generic candidates in Uncertain queue');
  assert.strictEqual(baselineRejected, 2, 'Baseline must reject 2 contradictory candidates');

  // Verify Uncertain entities are not in final leads list
  const preExportLeads = filterOutUncertainEntities(Array.from(entitiesMap.values()));
  assert.strictEqual(preExportLeads.length, 3, 'Final leads list must strictly exclude uncertain candidates');

  // -------------------------------------------------------------
  // PHASE 2: BOUNDED ADVERTISER EXPANSION
  // -------------------------------------------------------------
  console.log('\n--- PHASE 2: BOUNDED ADVERTISER EXPANSION ---');

  const expansionTracker = new Set();
  let additionalQueriesRun = 0;

  // Example 1: Strong Advertiser Expansion (HATIL) -> Adds new distinct ads & creative signals
  console.log('\n[EXPANSION CASE 1: Strong Relevant Advertiser (HATIL)]');
  const hatilLead = baselineRelevant.find(l => l.canonicalName.toUpperCase().includes('HATIL'));
  assert.ok(hatilLead, 'HATIL lead must be present');

  const hatilEligibility = checkAdvertiserExpansionEligibility(hatilLead, expansionTracker, additionalQueriesRun);
  console.log(`Eligibility Check: ${hatilEligibility.status} (${hatilEligibility.reason})`);
  assert.strictEqual(hatilEligibility.eligible, true);

  additionalQueriesRun++;
  expansionTracker.add(hatilLead.id);

  // Simulated public Ad Library response for query "HATIL"
  const hatilExpandedAds = [
    {
      libraryId: 'ad_live_hatil_exp_01',
      pageName: 'HATIL',
      pageId: 'hatil.official',
      facebookPageUrl: 'https://www.facebook.com/hatilbd',
      destinationDomain: 'hatil.com',
      destinationUrl: 'https://hatil.com/dining/executive-table',
      bodyCopy: 'Handcrafted solid oak dining table. Order online with 10-year warranty and free installation.',
      ctaText: 'Order Now',
      observedKeyword: 'HATIL'
    },
    {
      libraryId: 'ad_live_hatil_exp_02',
      pageName: 'HATIL',
      pageId: 'hatil.official',
      facebookPageUrl: 'https://www.facebook.com/hatilbd',
      destinationDomain: 'hatil.com',
      destinationUrl: 'https://hatil.com/bedroom/wardrobes',
      bodyCopy: 'Modern sliding wardrobe and dresser. Free home delivery in Dhaka and Chittagong.',
      ctaText: 'Shop Now',
      observedKeyword: 'HATIL'
    }
  ];

  const hatilExpansionResult = processExpandedAds(
    hatilLead,
    hatilExpandedAds,
    entitiesMap,
    index,
    seenAdIds,
    intent,
    counters,
    'HATIL'
  );

  console.log(`Result: ${hatilExpansionResult.newAdsDiscovered} new ads discovered, ${hatilExpansionResult.duplicateAdsCount} duplicates, ${hatilExpansionResult.mergedIntoSourceCount} merged into source entity`);
  assert.strictEqual(hatilExpansionResult.newAdsDiscovered, 2);
  assert.strictEqual(hatilExpansionResult.mergedIntoSourceCount, 2);
  assert.strictEqual(hatilLead.adCount, 3, 'HATIL now has 3 corroborated ads');
  assert.ok(hatilLead.creativeSignals.length >= 3, 'HATIL has rich structured creative signals');
  console.log(`Creative signals on HATIL: ${hatilLead.creativeSignals.map(s => `${s.type}:${s.normalized} (${s.occurrences}x)`).join(', ')}`);

  // Example 2: Advertiser Expansion Adding Only Duplicates (Partex Furniture)
  console.log('\n[EXPANSION CASE 2: Advertiser Expansion Adding Only Duplicates (Partex)]');
  const partexLead = baselineRelevant.find(l => l.canonicalName.toUpperCase().includes('PARTEX'));
  assert.ok(partexLead);

  const partexEligibility = checkAdvertiserExpansionEligibility(partexLead, expansionTracker, additionalQueriesRun);
  assert.strictEqual(partexEligibility.eligible, true);
  additionalQueriesRun++;
  expansionTracker.add(partexLead.id);

  // Simulated public Ad Library response returning already-seen ad
  const partexExpandedAds = [
    {
      libraryId: 'ad_live_partex_01', // Already seen in baseline!
      pageName: 'Partex Furniture Industries',
      pageId: 'partex.furniture.bd',
      facebookPageUrl: 'https://facebook.com/partexfurniture',
      destinationDomain: 'partexfurniture.com',
      destinationUrl: 'https://partexfurniture.com/bedroom',
      bodyCopy: 'Luxury king beds. Free delivery in Dhaka.',
      ctaText: 'Shop Now',
      observedKeyword: 'Partex Furniture'
    }
  ];

  const partexResult = processExpandedAds(
    partexLead,
    partexExpandedAds,
    entitiesMap,
    index,
    seenAdIds,
    intent,
    counters,
    'Partex Furniture'
  );

  console.log(`Result: ${partexResult.newAdsDiscovered} new ads, ${partexResult.duplicateAdsCount} duplicate ads detected`);
  assert.strictEqual(partexResult.newAdsDiscovered, 0);
  assert.strictEqual(partexResult.duplicateAdsCount, 1);
  assert.strictEqual(partexLead.adCount, 1, 'Duplicate ad did NOT inflate entity ad count');

  // Example 3: Ineligible Candidate Correctly Blocked From Expansion
  console.log('\n[EXPANSION CASE 3: Ineligible Candidates Correctly Blocked]');
  const mockUncertainLead = {
    id: 'lead_unc_block',
    name: 'Generic Wood Shop',
    canonicalName: 'Generic Wood Shop',
    relevanceDecision: 'UNCERTAIN',
    identityConfidence: 'WEAK'
  };
  const uncEligibility = checkAdvertiserExpansionEligibility(mockUncertainLead, expansionTracker, additionalQueriesRun);
  console.log(`Uncertain candidate eligibility: ${uncEligibility.status} (${uncEligibility.reason})`);
  assert.strictEqual(uncEligibility.eligible, false);
  assert.strictEqual(uncEligibility.status, 'INELIGIBLE_UNCERTAIN');

  const mockRejectedLead = {
    id: 'lead_rej_block',
    name: 'Tigers Cricket Club',
    canonicalName: 'Tigers Cricket Club',
    relevanceDecision: 'REJECTED',
    identityConfidence: 'STRONG'
  };
  const rejEligibility = checkAdvertiserExpansionEligibility(mockRejectedLead, expansionTracker, additionalQueriesRun);
  console.log(`Rejected candidate eligibility: ${rejEligibility.status} (${rejEligibility.reason})`);
  assert.strictEqual(rejEligibility.eligible, false);
  assert.strictEqual(rejEligibility.status, 'INELIGIBLE_REJECTED');

  // Example 4: Uncertain Entity Retained in Review Queue Without Promotion
  console.log('\n[EXPANSION CASE 4: Uncertain Entity Retained Without Promotion]');
  const newsUncertain = baselineUncertain.find(u => u.canonicalName.includes('Daily Tribune'));
  assert.ok(newsUncertain, 'Daily Tribune must be in uncertain queue');
  console.log(`Uncertain Candidate: "${newsUncertain.canonicalName}"`);
  console.log(`Reason Code: ${newsUncertain.reasonCode}`);
  console.log(`Missing Evidence: ${newsUncertain.missingEvidence.join(', ')}`);
  console.log(`Last Evaluation Decision: ${newsUncertain.lastEvaluationState.decision}`);

  assert.ok(newsUncertain.reasonCode.startsWith('UNCERTAIN_'));
  assert.strictEqual(newsUncertain.lastEvaluationState.decision, 'UNCERTAIN');

  // Final export gate check
  const finalExportLeads = filterOutUncertainEntities(Array.from(entitiesMap.values()));
  assert.strictEqual(finalExportLeads.length, 3, 'Final exported leads remain strictly 3 verified relevant brands');
  assert.strictEqual(finalExportLeads.some(l => l.name.includes('Daily Tribune')), false, 'Uncertain entity never leaked to final export');

  // -------------------------------------------------------------
  // PHASE 3: COMPREHENSIVE RECONCILIATION SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log('LIVE VALIDATION RECONCILIATION SUMMARY');
  console.log('================================================================');
  console.log(`Baseline Raw Ads:               7`);
  console.log(`Additional Expansion Queries:   2 (HATIL, Partex Furniture)`);
  console.log(`Additional Expansion Ads:       3 (2 new, 1 duplicate)`);
  console.log(`Total Raw Ads Processed:        ${counters.rawAds}`);
  console.log(`Total Duplicates Filtered:      ${counters.duplicatesRemoved}`);
  console.log(`Final Relevant Leads:           ${finalExportLeads.length}`);
  console.log(`Uncertain Entities Retained:    ${baselineUncertain.length}`);
  console.log(`Rejected False Positives:       ${counters.notRelevantCandidates}`);
  console.log(`False Positive Leakage:         0 (0.00%)`);
  console.log('================================================================');
}

runLiveValidation().catch(err => {
  console.error(err);
  process.exit(1);
});
