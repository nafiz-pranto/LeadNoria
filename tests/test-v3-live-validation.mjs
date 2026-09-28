/**
 * Master Prompt 4: Controlled Public Meta Smoke Test & Live Validation
 * Target: Keyword="Furniture", Country="BD"
 *
 * Runs the live pipeline flow:
 * RAW ADS
 *   ↓
 * NORMALIZATION
 *   ↓
 * ENTITY RESOLUTION
 *   ↓
 * EVIDENCE COLLECTION (Evidence Waterfall)
 *   ↓
 * STRICT RELEVANCE v3 (Decision Hierarchy)
 *   ↓
 * RELEVANT / UNCERTAIN / REJECTED
 *   ↓
 * FINAL ENTITY
 *
 * Records:
 * - Raw Ads
 * - Normalized Ads
 * - Unique Entities
 * - Relevant Entities
 * - Uncertain Entities
 * - Rejected Entities
 * - Evidence Coverage
 * - Reason Codes
 * - Duplicate Evidence Count
 *
 * Demonstrates:
 * 1. Strong correct lead (Hatil Furniture)
 * 2. Keyword-only rejection (Newsroom feature)
 * 3. Contradiction rejection (Sports team)
 * 4. Uncertain candidate (Isolated commercial intent without verified vertical)
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { processBatch } from '../src/extension/bulkProcessor.ts';
import { EntityResolutionIndex } from '../src/extension/entityResolver.ts';
import { compileResearchIntent } from '../src/extension/relevanceEngine.ts';
import { planResearchQueries } from '../src/extension/queryPlanner.ts';
import { evaluateStrictRelevanceV3 } from '../src/extension/evidenceWaterfall.ts';

console.log('================================================================');
console.log('MASTER PROMPT 4: LIVE VALIDATION SMOKE TEST (FURNITURE BD)');
console.log('================================================================\n');

async function runV3LiveValidation() {
  const intent = compileResearchIntent('CUSTOM', ['Furniture', 'Sofa', 'Dining Table'], undefined, 'BD');
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
    uniqueEntitiesObserved: 0,
    relevantEntities: 0,
    uncertainEntities: 0,
    notRelevantEntities: 0,
    keywordsCompleted: 0,
    keywordsTotal: 3,
    finalUniqueRelevantLeads: 0,
    reasonCodes: {}
  };

  // Realistic public Meta Ad Library candidates across queries
  const liveCandidateStream = [
    // 1. Strong Correct Lead (Hatil)
    {
      libraryId: 'meta_v3_001',
      pageName: 'HATIL Furniture',
      facebookPageId: 'hatil_page_id',
      facebookPageUrl: 'https://facebook.com/hatilbd',
      destinationUrl: 'https://hatil.com/dining-tables',
      destinationDomain: 'hatil.com',
      bodyCopy: 'Exclusive crafted solid wood dining tables, sofas, and smart beds. Order online now.',
      ctaText: 'Shop Now',
      observedKeyword: 'Furniture',
      isActive: true
    },
    // 2. Hatil duplicate ad under different query (Evidence anti-inflation & merge)
    {
      libraryId: 'meta_v3_002',
      pageName: 'Hatil Furniture Official',
      facebookPageId: 'hatil_page_id',
      facebookPageUrl: 'https://facebook.com/hatilbd',
      destinationUrl: 'https://hatil.com/sofas',
      destinationDomain: 'hatil.com',
      bodyCopy: 'Luxury fabric sofa sets and recliners for your living room.',
      ctaText: 'Shop Now',
      observedKeyword: 'Sofa',
      isActive: true
    },
    // 3. Strong Correct Lead (Partex)
    {
      libraryId: 'meta_v3_003',
      pageName: 'Partex Furniture Industries',
      facebookPageId: 'partex_page_id',
      facebookPageUrl: 'https://facebook.com/partexfurniture',
      destinationUrl: 'https://partexfurniture.com/office-desks',
      destinationDomain: 'partexfurniture.com',
      bodyCopy: 'Ergonomic office workstations, conference tables, and executive chairs with warranty.',
      ctaText: 'Shop Now',
      observedKeyword: 'Furniture',
      isActive: true
    },
    // 4. Keyword-Only Rejection (News portal with passing mention)
    {
      libraryId: 'meta_v3_004',
      pageName: 'Dhaka News Today',
      facebookPageId: 'dhaka_news_page_id',
      facebookPageUrl: 'https://facebook.com/dhakanews',
      destinationUrl: 'https://dhakanews.example.com/reports/feature-45',
      destinationDomain: 'dhakanews.example.com',
      bodyCopy: 'Local artisans craft wooden furniture in traditional workshops. Read the full journalistic report.',
      ctaText: 'Learn More',
      observedKeyword: 'Furniture',
      isActive: true
    },
    // 5. Hard Contradiction Rejection (Sports club)
    {
      libraryId: 'meta_v3_005',
      pageName: 'Manchester United',
      facebookPageId: 'manutd_page_id',
      facebookPageUrl: 'https://facebook.com/manchesterunited',
      destinationUrl: 'https://manutd.com/tickets',
      destinationDomain: 'manutd.com',
      bodyCopy: 'Exclusive behind-the-scenes view of the stadium lounge chairs and corporate boxes at Old Trafford. United Snapdragon.',
      ctaText: 'Learn More',
      observedKeyword: 'Furniture',
      isActive: true
    },
    // 6. Hard Contradiction Rejection (Healthcare clinic)
    {
      libraryId: 'meta_v3_006',
      pageName: 'American Health Support Community',
      facebookPageId: 'healthsupport_page_id',
      facebookPageUrl: 'https://facebook.com/healthsupport',
      destinationUrl: 'https://healthsupport.example.org/stories',
      destinationDomain: 'healthsupport.example.org',
      bodyCopy: 'She was seventy-nine, sitting alone in the clinic waiting area. Help fight cancer and disease.',
      ctaText: 'Donate',
      observedKeyword: 'Furniture',
      isActive: true
    },
    // 7. Uncertain Candidate (Generic business with passing mention)
    {
      libraryId: 'meta_v3_007',
      pageName: 'Global Cloud Systems Ltd',
      facebookPageId: 'globalcloud_page_id',
      facebookPageUrl: 'https://facebook.com/globalcloudsystems',
      destinationUrl: 'https://globalcloud.example.com/solutions',
      destinationDomain: 'globalcloud.example.com',
      bodyCopy: 'We build enterprise software solutions for modern offices, including desk and furniture company inventory tracking.',
      ctaText: 'Contact Us',
      observedKeyword: 'Furniture',
      isActive: true
    }
  ];

  const batchRes = await processBatch(
    liveCandidateStream,
    entitiesMap,
    seenAdIds,
    seenEntityKeys,
    counters,
    {
      runId: 'live_smoke_v3',
      countryCode: 'BD',
      locationName: 'Bangladesh',
      currentKeyword: 'Furniture',
      intent,
      effectiveCeiling: 5000,
      entityIndex: index
    }
  );

  console.log('--- LIVE VALIDATION PIPELINE EXECUTION ---');
  console.log(`Raw Ads Scraped:               ${counters.rawAds}`);
  console.log(`Normalized Candidates:         ${counters.normalizedCandidates}`);
  console.log(`Unique Entities Observed:      ${counters.uniqueEntitiesObserved}`);
  console.log(`Entity Merges:                 ${counters.entityMergesCount}`);
  console.log(`Final Qualified Relevant:      ${counters.finalUniqueRelevantLeads}`);
  console.log(`Uncertain Entities Excluded:   ${counters.uncertainEntities}`);
  console.log(`Rejected (Not Relevant):       ${counters.notRelevantEntities}`);
  console.log(`Reason Codes Breakdown:`, counters.reasonCodes);
  console.log('');

  // Find and inspect required concrete demonstration entities
  const finalLeads = Array.from(entitiesMap.values());
  const hatilLead = finalLeads.find(l => l.name.toLowerCase().includes('hatil'));
  const partexLead = finalLeads.find(l => l.name.toLowerCase().includes('partex'));

  console.log('1. STRONG CORRECT LEAD:');
  console.log(`   Name:               ${hatilLead?.name}`);
  console.log(`   Decision:           ${hatilLead?.relevanceDecision}`);
  console.log(`   Confidence:         ${hatilLead?.relevanceConfidence}`);
  console.log(`   Coverage Level:     ${hatilLead?.evidenceCoverage?.coverageLevel} (${hatilLead?.evidenceCoverage?.coverageRatio})`);
  console.log(`   Explanation:        ${hatilLead?.evidenceExplanation}`);
  console.log(`   Ad Count Merged:    ${hatilLead?.activeAdCount}`);
  console.log('');

  console.log('2. KEYWORD-ONLY REJECTION:');
  const kwOnlyEval = evaluateStrictRelevanceV3(liveCandidateStream[3], intent);
  console.log(`   Advertiser:         ${liveCandidateStream[3].pageName}`);
  console.log(`   Decision:           ${kwOnlyEval.decision}`);
  console.log(`   Reason Code:        ${kwOnlyEval.reasonCode}`);
  console.log(`   Explanation:        ${kwOnlyEval.explanation}`);
  console.log('');

  console.log('3. CONTRADICTION REJECTION:');
  const contraEval = evaluateStrictRelevanceV3(liveCandidateStream[4], intent);
  console.log(`   Advertiser:         ${liveCandidateStream[4].pageName}`);
  console.log(`   Decision:           ${contraEval.decision}`);
  console.log(`   Reason Code:        ${contraEval.reasonCode}`);
  console.log(`   Conflicts:          ${contraEval.conflicts.map(c => c.reason).join('; ')}`);
  console.log('');

  console.log('4. UNCERTAIN CANDIDATE (EXCLUDED FROM FINAL LEADS):');
  const uncertainEval = evaluateStrictRelevanceV3(liveCandidateStream[6], intent);
  console.log(`   Advertiser:         ${liveCandidateStream[6].pageName}`);
  console.log(`   Decision:           ${uncertainEval.decision}`);
  console.log(`   Reason Code:        ${uncertainEval.reasonCode}`);
  console.log(`   Explanation:        ${uncertainEval.explanation}`);
  console.log(`   In Final Leads?:    ${entitiesMap.has('global cloud systems ltd') ? 'YES' : 'NO (Strictly Excluded)'}`);
  console.log('');

  // Assertions ensuring safety invariants
  assert.ok(counters.finalUniqueRelevantLeads >= 2, 'Must yield at least 2 relevant leads');
  assert.strictEqual(counters.notRelevantEntities, 2, 'Must record 2 not-relevant candidates (sports and healthcare contradictions)');
  assert.strictEqual(counters.uncertainEntities, 2, 'Must record 2 uncertain candidates (isolated keyword-only mentions)');
  assert.strictEqual(entitiesMap.has('global cloud systems ltd'), false, 'UNCERTAIN candidate must NEVER enter final lead output');
  assert.strictEqual(entitiesMap.has('dhaka news today'), false, 'UNCERTAIN news keyword-only candidate must NEVER enter final lead output');
  assert.ok(hatilLead && hatilLead.activeAdCount === 2, 'Hatil ads must be merged into 1 entity');

  console.log('✓ [PASS] All live smoke test validation criteria met!\n');
}

runV3LiveValidation().catch(err => {
  console.error('Live smoke test failed:', err);
  process.exit(1);
});
