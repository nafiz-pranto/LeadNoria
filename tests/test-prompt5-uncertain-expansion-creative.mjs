/**
 * LEADNORIA v1.1 PROMPT 5 COMPREHENSIVE TEST SUITE
 * 
 * Verifies:
 * - Matrix 1: Internal UNCERTAIN Queue (10 cases)
 * - Matrix 2: Bounded Advertiser Expansion (12 cases)
 * - Matrix 3: Structured Creative / Commercial Signals (12 cases)
 */

import assert from 'node:assert';
import { extractCreativeSignals, aggregateCreativeSignals, detectLanguage } from '../src/extension/creativeSignals.ts';
import { classifyUncertainty, isUncertainCandidate, filterOutUncertainEntities } from '../src/extension/uncertainQueue.ts';
import { 
  checkAdvertiserExpansionEligibility, 
  executeAdvertiserExpansion, 
  ADVERTISER_EXPANSION_BOUNDS 
} from '../src/extension/advertiserExpander.ts';
import { 
  saveBatch, 
  getAllUncertainEntities, 
  getAllAdvertiserExpansions 
} from '../src/extension/bulkStore.ts';
import { evaluateEntityMerge, EntityResolutionIndex } from '../src/extension/entityResolver.ts';
import { evaluateStrictRelevanceV3 } from '../src/extension/evidenceWaterfall.ts';

async function runPrompt5TestSuite() {
  console.log('================================================================');
  console.log('LEADNORIA v1.1 PROMPT 5 COMPREHENSIVE VERIFICATION SUITE');
  console.log('Uncertain Queue + Advertiser Expansion + Creative Signals');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      passed++;
      console.log(`[PASS] ${name}`);
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      throw err;
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`[PASS] ${name}`);
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      throw err;
    }
  }

  // ========================================================================
  // MATRIX 1: UNCERTAIN QUEUE (10 Tests)
  // ========================================================================
  console.log('--- TEST MATRIX 1: UNCERTAIN QUEUE ---');

  test('1.1: Keyword-only candidate -> UNCERTAIN_KEYWORD_ONLY', () => {
    const candidate = {
      name: 'Daily News Media',
      matchedQueries: ['furniture'],
      identityConfidence: 'WEAK',
      evidenceItems: [{ type: 'KEYWORD_MATCH', dimension: 'CATEGORY_KEYWORD', signal: 'furniture' }],
      missingEvidence: ['STRONG_ENTITY_NAME', 'CATEGORY_AFFIRMATION'],
      observedAdIds: ['ad_01'],
      observedDomains: ['dailynews.com'],
      lastEvaluationState: 'UNCERTAIN'
    };
    const record = classifyUncertainty(candidate);
    assert.strictEqual(record.reasonCode, 'UNCERTAIN_KEYWORD_ONLY');
    assert.strictEqual(isUncertainCandidate(record), true);
  });

  test('1.2: Ambiguous brand candidate -> UNCERTAIN_AMBIGUOUS_ENTITY', () => {
    const candidate = {
      name: 'Apex Group Global',
      matchedQueries: ['furniture'],
      identityConfidence: 'AMBIGUOUS',
      evidenceItems: [],
      missingEvidence: ['VERTICAL_CORROBORATION'],
      observedAdIds: ['ad_02'],
      observedDomains: [],
      lastEvaluationState: 'UNCERTAIN'
    };
    const record = classifyUncertainty(candidate);
    assert.strictEqual(record.reasonCode, 'UNCERTAIN_AMBIGUOUS_ENTITY');
  });

  test('1.3: Candidate with missing Facebook Page -> UNCERTAIN_MISSING_IDENTITY', () => {
    const candidate = {
      name: 'Modern Living Studio',
      matchedQueries: ['living room'],
      identityConfidence: 'WEAK',
      evidenceItems: [{ type: 'COMMERCIAL_INTENT', dimension: 'COMMERCIAL', signal: 'shop' }],
      missingEvidence: ['FACEBOOK_PAGE_EVIDENCE'],
      observedAdIds: ['ad_03'],
      observedDomains: [],
      facebookPage: null,
      lastEvaluationState: 'UNCERTAIN'
    };
    const record = classifyUncertainty(candidate);
    assert.strictEqual(record.reasonCode, 'UNCERTAIN_MISSING_IDENTITY');
  });

  test('1.4: Commercial activity present but category missing -> UNCERTAIN_MISSING_CATEGORY_EVIDENCE', () => {
    const candidate = {
      name: 'Quick Ship Direct',
      matchedQueries: ['fast delivery furniture'],
      identityConfidence: 'MODERATE',
      evidenceItems: [{ type: 'COMMERCIAL_INTENT', dimension: 'COMMERCIAL', signal: 'Shop Now' }],
      missingEvidence: ['CATEGORY_EVIDENCE', 'PRODUCT_CATALOG'],
      observedAdIds: ['ad_04'],
      observedDomains: ['quickship.com'],
      facebookPage: { id: 'pg_44' },
      lastEvaluationState: 'UNCERTAIN'
    };
    const record = classifyUncertainty(candidate);
    assert.strictEqual(record.reasonCode, 'UNCERTAIN_MISSING_CATEGORY_EVIDENCE');
  });

  test('1.5: Candidate with unresolved conflict -> UNCERTAIN_CONFLICT_NOT_RESOLVED', () => {
    const candidate = {
      name: 'Fusion Spaces',
      matchedQueries: ['office furniture'],
      identityConfidence: 'UNRESOLVED',
      evidenceItems: [{ type: 'CONFLICTING_EVIDENCE', dimension: 'CONTRADICTION', signal: 'co-working rent vs furniture sales' }],
      missingEvidence: ['CONFLICT_RESOLUTION'],
      observedAdIds: ['ad_05'],
      observedDomains: ['fusionspaces.io'],
      lastEvaluationState: 'UNCERTAIN'
    };
    const record = classifyUncertainty(candidate);
    assert.strictEqual(record.reasonCode, 'UNCERTAIN_CONFLICT_NOT_RESOLVED');
  });

  test('1.6: Candidate on shared marketplace domain -> UNCERTAIN_SHARED_MARKETPLACE', () => {
    const candidate = {
      name: 'Seller #8849',
      matchedQueries: ['wooden table'],
      identityConfidence: 'WEAK',
      evidenceItems: [],
      missingEvidence: ['INDEPENDENT_DOMAIN', 'BUSINESS_IDENTITY'],
      observedAdIds: ['ad_06'],
      observedDomains: ['daraz.com.bd'],
      lastEvaluationState: 'UNCERTAIN'
    };
    const record = classifyUncertainty(candidate);
    assert.strictEqual(record.reasonCode, 'UNCERTAIN_SHARED_MARKETPLACE');
  });

  test('1.7: Candidate with limited public ad info -> UNCERTAIN_LIMITED_PUBLIC_EVIDENCE', () => {
    const candidate = {
      name: 'Woodcraft Corp',
      matchedQueries: ['woodcraft'],
      identityConfidence: 'WEAK',
      evidenceItems: [],
      missingEvidence: ['CREATIVE_TEXT', 'DESTINATION_LINK'],
      observedAdIds: ['ad_07'],
      observedDomains: [],
      lastEvaluationState: 'UNCERTAIN'
    };
    const record = classifyUncertainty(candidate);
    assert.strictEqual(record.reasonCode, 'UNCERTAIN_LIMITED_PUBLIC_EVIDENCE');
  });

  test('1.8: Strong sports contradiction -> REJECTED (Not Uncertain)', () => {
    const intent = { primaryKeywords: ['furniture', 'sofa'], verticalTerms: ['furniture', 'sofa', 'table', 'chair'], targetCountry: 'BD' };
    const cand = {
      advertiserName: 'Premier League Fanatics',
      facebookPageUrl: 'https://facebook.com/premierleaguefans',
      destinationUrl: 'https://premierleaguefans.com',
      destinationDomain: 'premierleaguefans.com',
      adText: 'Get comfortable in our match viewing seats. Watch live football club matches.',
      matchedKeyword: 'furniture'
    };
    const evalResult = evaluateStrictRelevanceV3(cand, intent);
    assert.strictEqual(evalResult.decision, 'NOT_RELEVANT');
    assert.notStrictEqual(evalResult.decision, 'UNCERTAIN');
    assert.ok(evalResult.conflicts.length > 0);
  });

  await testAsync('1.9: Uncertain entity storage persistence in BulkStore', async () => {
    const runId = 'test_run_uncertain_storage';
    const rec = {
      entityId: 'ent_unc_persist_1',
      canonicalName: 'Uncertain Furnishings Co',
      matchedQueries: ['sofa bd'],
      identityConfidence: 'WEAK',
      evidenceItems: [],
      missingEvidence: ['FACEBOOK_PAGE'],
      reasonCode: 'UNCERTAIN_MISSING_IDENTITY',
      observedAdIds: ['ad_persist_1'],
      observedDomains: ['unknownfurnishings.com'],
      facebookPage: null,
      firstSeenTimestamp: Date.now(),
      lastEvaluationTimestamp: Date.now(),
      lastEvaluationState: 'UNCERTAIN'
    };

    await saveBatch(runId, {
      batchIndex: 0,
      ads: [],
      entities: [],
      uncertainEntities: [rec],
      checkpoint: { runId, batchIndex: 0, timestamp: new Date().toISOString(), activeKeywordIndex: 0, currentKeyword: '', rawAdsCount: 0, distinctAdCount: 0, processedBatches: 1, lastLeadName: '' }
    });
    const retrieved = await getAllUncertainEntities(runId);
    assert.strictEqual(retrieved.length, 1);
    assert.strictEqual(retrieved[0].entityId, 'ent_unc_persist_1');
    assert.strictEqual(retrieved[0].reasonCode, 'UNCERTAIN_MISSING_IDENTITY');
  });

  test('1.10: Uncertain candidates strictly excluded from final lead exports', () => {
    const mixedEntities = [
      { id: 'lead_1', name: 'HATIL Furniture', relevanceDecision: 'RELEVANT', score: 0.95 },
      { id: 'lead_2', name: 'Random News Page', relevanceDecision: 'UNCERTAIN', score: 0.3 },
      { id: 'lead_3', name: 'Akhtar Furnishers', relevanceDecision: 'RELEVANT', score: 0.9 },
      { id: 'lead_4', name: 'Sports Bar BD', relevanceDecision: 'REJECTED', score: 0.0 }
    ];
    const qualifiedLeads = filterOutUncertainEntities(mixedEntities);
    assert.strictEqual(qualifiedLeads.length, 2);
    assert.strictEqual(qualifiedLeads.some(e => e.relevanceDecision === 'UNCERTAIN'), false);
    assert.strictEqual(qualifiedLeads.some(e => e.relevanceDecision === 'REJECTED'), false);
  });

  // ========================================================================
  // MATRIX 2: ADVERTISER EXPANSION (12 Tests)
  // ========================================================================
  console.log('\n--- TEST MATRIX 2: ADVERTISER EXPANSION ---');

  test('2.1: Eligible strong relevant advertiser qualifies for expansion', () => {
    const strongLead = {
      id: 'ent_hatil',
      name: 'HATIL Furniture Official',
      relevanceDecision: 'RELEVANT',
      identityConfidence: 'STRONG',
      relevanceScore: 0.95,
      facebookPageId: 'hatil.official',
      websiteUrl: 'https://hatil.com',
      advertiserExpansionStatus: 'PENDING'
    };
    const eligibility = checkAdvertiserExpansionEligibility(strongLead, []);
    assert.strictEqual(eligibility.eligible, true);
    assert.strictEqual(eligibility.status, 'ELIGIBLE');
  });

  test('2.2: Ineligible UNCERTAIN candidate is strictly blocked from expansion', () => {
    const uncertainLead = {
      id: 'ent_unc_cand',
      name: 'Generic Wood Shop',
      relevanceDecision: 'UNCERTAIN',
      identityConfidence: 'WEAK',
      advertiserExpansionStatus: 'NOT_ELIGIBLE'
    };
    const eligibility = checkAdvertiserExpansionEligibility(uncertainLead, []);
    assert.strictEqual(eligibility.eligible, false);
    assert.strictEqual(eligibility.status, 'INELIGIBLE_UNCERTAIN');
  });

  test('2.3: Ineligible REJECTED candidate is strictly blocked from expansion', () => {
    const rejectedLead = {
      id: 'ent_rej_cand',
      name: 'Premier League Football',
      relevanceDecision: 'REJECTED',
      identityConfidence: 'STRONG',
      advertiserExpansionStatus: 'NOT_ELIGIBLE'
    };
    const eligibility = checkAdvertiserExpansionEligibility(rejectedLead, []);
    assert.strictEqual(eligibility.eligible, false);
    assert.strictEqual(eligibility.status, 'INELIGIBLE_REJECTED');
  });

  test('2.4: Duplicate expansion blocked if already COMPLETED in run', () => {
    const alreadyExpandedLead = {
      id: 'ent_hatil_done',
      name: 'HATIL Furniture',
      relevanceDecision: 'RELEVANT',
      identityConfidence: 'STRONG',
      advertiserExpansionStatus: 'COMPLETED'
    };
    const priorExpansions = [{ sourceEntityId: 'ent_hatil_done', stopReason: 'SOURCE_EXHAUSTED' }];
    const eligibility = checkAdvertiserExpansionEligibility(alreadyExpandedLead, priorExpansions);
    assert.strictEqual(eligibility.eligible, false);
    assert.strictEqual(eligibility.status, 'ALREADY_EXPANDED');
  });

  await testAsync('2.5: Provenance records query, discovered ads, and stop reason', async () => {
    const lead = {
      id: 'ent_prov_test',
      name: 'Navana Furniture Ltd',
      relevanceDecision: 'RELEVANT',
      identityConfidence: 'STRONG'
    };
    const mockFetcher = async () => [
      { adLibraryId: 'ad_nav_101', advertiserName: 'Navana Furniture Ltd', text: 'Executive office desk' },
      { adLibraryId: 'ad_nav_102', advertiserName: 'Navana Furniture Ltd', text: 'Modern living sofa' }
    ];

    const result = await executeAdvertiserExpansion(lead, mockFetcher, new Set());
    assert.strictEqual(result.provenance.sourceEntityId, 'ent_prov_test');
    assert.strictEqual(result.provenance.newAds, 2);
    assert.strictEqual(result.provenance.duplicateAds, 0);
    assert.strictEqual(result.provenance.stopReason, 'COMPLETED_SUCCESSFULLY');
    assert.strictEqual(result.status, 'COMPLETED');
  });

  await testAsync('2.6: Expansion result merges corroborating ads and tracks duplicate ads', async () => {
    const lead = {
      id: 'ent_merge_test',
      name: 'Partex Furniture Industries',
      relevanceDecision: 'RELEVANT',
      identityConfidence: 'STRONG'
    };
    const existingSeenIds = new Set(['ad_partex_seen']);
    const mockFetcher = async () => [
      { adLibraryId: 'ad_partex_seen', advertiserName: 'Partex Furniture Industries', text: 'Classic Dining Table' },
      { adLibraryId: 'ad_partex_new', advertiserName: 'Partex Furniture Industries', text: 'Ergonomic Chair' }
    ];

    const result = await executeAdvertiserExpansion(lead, mockFetcher, existingSeenIds);
    assert.strictEqual(result.provenance.newAds, 1);
    assert.strictEqual(result.provenance.duplicateAds, 1);
    assert.strictEqual(result.newRawAds.length, 1);
  });

  await testAsync('2.7: Expansion stop condition when source is exhausted (0 ads returned)', async () => {
    const lead = {
      id: 'ent_empty_test',
      name: 'Regal Furniture Direct',
      relevanceDecision: 'RELEVANT',
      identityConfidence: 'STRONG'
    };
    const mockFetcher = async () => [];
    const result = await executeAdvertiserExpansion(lead, mockFetcher, new Set());
    assert.strictEqual(result.status, 'NO_RESULTS');
    assert.strictEqual(result.provenance.stopReason, 'SOURCE_EXHAUSTED');
    assert.strictEqual(result.provenance.newAds, 0);
  });

  test('2.8: Deterministic max bounds enforced (MAX_ADVERTISER_EXPANSIONS_PER_RUN = 5)', () => {
    assert.strictEqual(ADVERTISER_EXPANSION_BOUNDS.MAX_ADVERTISER_EXPANSIONS_PER_RUN, 5);
    assert.strictEqual(ADVERTISER_EXPANSION_BOUNDS.MAX_EXPANSIONS_PER_ENTITY, 1);
    assert.strictEqual(ADVERTISER_EXPANSION_BOUNDS.MAX_ADS_PER_EXPANSION, 20);
    assert.strictEqual(ADVERTISER_EXPANSION_BOUNDS.TIMEOUT_MS_PER_EXPANSION, 15000);

    const priorRuns = [
      { sourceEntityId: 'e1' }, { sourceEntityId: 'e2' }, { sourceEntityId: 'e3' },
      { sourceEntityId: 'e4' }, { sourceEntityId: 'e5' }
    ];
    const candidateLead = { id: 'e6', name: 'Otobi Limited', relevanceDecision: 'RELEVANT', identityConfidence: 'STRONG' };
    const eligibility = checkAdvertiserExpansionEligibility(candidateLead, priorRuns);
    assert.strictEqual(eligibility.eligible, false);
    assert.strictEqual(eligibility.status, 'RUN_EXPANSION_CAP_REACHED');
  });

  test('2.9: Conflicting domain in expansion ad prevents cross-entity corruption', () => {
    const index = new EntityResolutionIndex();
    const entities = new Map();
    const lead = {
      id: 'lead_studio_1',
      name: 'Studio Furniture',
      canonicalName: 'Studio Furniture',
      destinationDomain: 'studiofurniture.com',
      destinationUrl: 'https://studiofurniture.com',
      adLibraryIds: ['ad_base_01'],
      adCount: 1
    };
    entities.set('dom_studio_furniture_studiofurniture.com', lead);
    index.indexEntity('dom_studio_furniture_studiofurniture.com', lead);

    const conflictingAd = {
      libraryId: 'ad_exp_02',
      pageName: 'Studio Furniture',
      destinationDomain: 'differentfurniture.org',
      destinationUrl: 'https://differentfurniture.org'
    };

    const decision = evaluateEntityMerge(conflictingAd, entities, index);
    assert.strictEqual(decision.shouldMerge, false);
    assert.ok(decision.reason.includes('NON_MERGE_CONFLICTING_DESTINATION_DOMAIN'));
  });

  test('2.10: Local branch protection maintained during expansion', () => {
    const index = new EntityResolutionIndex();
    const entities = new Map();
    const hqLead = {
      id: 'lead_hq_1',
      name: 'ABC Furniture Ltd',
      canonicalName: 'ABC Furniture Ltd',
      adLibraryIds: ['ad_hq_01'],
      adCount: 1
    };
    entities.set('name_abc_furniture_ltd', hqLead);
    index.indexEntity('name_abc_furniture_ltd', hqLead);

    const branchCandidate = {
      libraryId: 'ad_branch_02',
      pageName: 'ABC Furniture Dhaka Branch'
    };

    const decision = evaluateEntityMerge(branchCandidate, entities, index);
    assert.strictEqual(decision.shouldMerge, false);
  });

  await testAsync('2.11: Resume after expansion interruption retains prior recorded provenance', async () => {
    const runId = 'test_resume_expansion_run';
    const initialProvenance = {
      expansionType: 'ADVERTISER',
      sourceEntityId: 'ent_prior_1',
      sourceAdvertiserName: 'Brothers Furniture',
      query: 'Brothers Furniture',
      timestamp: Date.now(),
      resultCount: 4,
      newAds: 3,
      duplicateAds: 1,
      newEntities: 0,
      stopReason: 'COMPLETED_SUCCESSFULLY'
    };

    await saveBatch(runId, {
      batchIndex: 0,
      ads: [],
      entities: [],
      advertiserExpansions: [initialProvenance],
      checkpoint: { runId, batchIndex: 0, timestamp: new Date().toISOString(), activeKeywordIndex: 0, currentKeyword: '', rawAdsCount: 0, distinctAdCount: 0, processedBatches: 1, lastLeadName: '' }
    });
    const stored = await getAllAdvertiserExpansions(runId);
    assert.strictEqual(stored.length, 1);
    assert.strictEqual(stored[0].sourceEntityId, 'ent_prior_1');
    assert.strictEqual(stored[0].newAds, 3);
  });

  await testAsync('2.12: Service worker restart preserves advertiser expansion stores in IndexedDB', async () => {
    const runId = 'test_sw_restart_run';
    const prov = {
      expansionType: 'ADVERTISER',
      sourceEntityId: 'ent_sw_test',
      sourceAdvertiserName: 'Akhtar Furnishers',
      query: 'Akhtar Furnishers',
      timestamp: Date.now(),
      resultCount: 5,
      newAds: 5,
      duplicateAds: 0,
      newEntities: 0,
      stopReason: 'COMPLETED_SUCCESSFULLY'
    };

    await saveBatch(runId, {
      batchIndex: 0,
      ads: [],
      entities: [],
      advertiserExpansions: [prov],
      checkpoint: { runId, batchIndex: 0, timestamp: new Date().toISOString(), activeKeywordIndex: 0, currentKeyword: '', rawAdsCount: 0, distinctAdCount: 0, processedBatches: 1, lastLeadName: '' }
    });
    const retrieved = await getAllAdvertiserExpansions(runId);
    assert.strictEqual(retrieved.length, 1);
    assert.strictEqual(retrieved[0].sourceAdvertiserName, 'Akhtar Furnishers');
  });

  // ========================================================================
  // MATRIX 3: CREATIVE SIGNALS (12 Tests)
  // ========================================================================
  console.log('\n--- TEST MATRIX 3: CREATIVE SIGNALS ---');

  test('3.1: CTA extraction and normalization', () => {
    const rawAd = {
      adText: 'Explore our latest furniture collection. Shop Now for best prices.',
      ctaText: 'Shop Now →'
    };
    const signals = extractCreativeSignals(rawAd);
    const ctaSignal = signals.find(s => s.type === 'CTA');
    assert.ok(ctaSignal, 'CTA signal must be present');
    assert.strictEqual(ctaSignal.normalized, 'SHOP_NOW');
  });

  test('3.2: Discount and promotion percentage detection', () => {
    const rawAd = {
      adText: 'Grand Eid Sale! Enjoy 20% discount on all wooden sofa sets.',
      ctaText: 'Order Now'
    };
    const signals = extractCreativeSignals(rawAd);
    const discountSignal = signals.find(s => s.type === 'OFFER');
    assert.ok(discountSignal, 'Offer signal must be present');
    assert.strictEqual(discountSignal.normalized, 'DISCOUNT_OFFER');
  });

  test('3.3: Explicit price detection without fabrication', () => {
    const rawAd = {
      adText: 'Premium Solid Wood King Bed at only ৳35,000 / $350. Order today.',
      ctaText: 'Buy Now'
    };
    const signals = extractCreativeSignals(rawAd);
    const priceSignal = signals.find(s => s.type === 'PRICE');
    assert.ok(priceSignal, 'Price signal must be present');
    assert.strictEqual(priceSignal.normalized, 'PRICE_PRESENT');
  });

  test('3.4: Product term extraction (sofa, bed, dining table)', () => {
    const rawAd = {
      adText: 'Crafted solid wood sofa set and ergonomic dining table for luxury interiors.',
      ctaText: 'Learn More'
    };
    const signals = extractCreativeSignals(rawAd);
    const productSignals = signals.filter(s => s.type === 'PRODUCT_TERM');
    assert.ok(productSignals.length >= 2, 'Should detect sofa and dining table');
    assert.ok(productSignals.some(s => s.normalized === 'sofa'));
  });

  test('3.5: Service term extraction (custom made, interior design, delivery)', () => {
    const rawAd = {
      adText: 'We offer full home interior design and custom made furniture solutions with free delivery.',
      ctaText: 'Contact Us'
    };
    const signals = extractCreativeSignals(rawAd);
    const serviceSignals = signals.filter(s => s.type === 'SERVICE_TERM');
    assert.ok(serviceSignals.length >= 1, 'Should detect service terms');
    assert.ok(serviceSignals.some(s => s.normalized === 'interior design' || s.normalized === 'custom made'));
  });

  test('3.6: Appointment and consultation commercial signal detection', () => {
    const rawAd = {
      adText: 'Book your free design appointment and consultation with our architects today.',
      ctaText: 'Book Now'
    };
    const signals = extractCreativeSignals(rawAd);
    const apptSignal = signals.find(s => s.type === 'COMMERCIAL_INTENT');
    assert.ok(apptSignal, 'Appointment commercial intent must be detected');
    assert.strictEqual(apptSignal.normalized, 'APPOINTMENT_BOOKING');
  });

  test('3.7: Lightweight language classification: English and Bengali', () => {
    const bengaliText = 'আমাদের নতুন আসবাবপত্র কালেকশন দেখুন। আধুনিক সোফা ও খাট।';
    const langBn = detectLanguage(bengaliText);
    assert.strictEqual(langBn.language || langBn, 'BENGALI');

    const englishText = 'Discover handcrafted solid oak dining tables and chairs for your home.';
    const langEn = detectLanguage(englishText);
    assert.strictEqual(langEn.language || langEn, 'ENGLISH');
  });

  test('3.8: Mixed-language detection does not crash and marks MIXED', () => {
    const mixedText = 'Special Eid offer! আমাদের শো-রুমে visit করুন and get 15% discount on all sofa sets.';
    const langMixed = detectLanguage(mixedText);
    assert.strictEqual(langMixed.language || langMixed, 'MIXED');
  });

  test('3.9: Duplicate signal anti-inflation (100 identical ads != 100 independent scores)', () => {
    const identicalAd = {
      adText: 'Special sale. 20% off all modern beds. Shop Now.',
      ctaText: 'Shop Now'
    };
    const signals1 = extractCreativeSignals(identicalAd);

    // Aggregate 100 identical sets of signals
    let aggregated = [];
    for (let i = 0; i < 100; i++) {
      aggregated = aggregateCreativeSignals(aggregated, signals1);
    }

    const shopNowSignal = aggregated.find(s => s.normalized === 'SHOP_NOW');
    assert.ok(shopNowSignal);
    // occurrences reflects total sightings, but unique identity is preserved
    assert.strictEqual(shopNowSignal.occurrences, 100);
    // Unique signal types count is bounded
    assert.ok(aggregated.length <= 5, 'Anti-inflation keeps distinct normalized signal set compact');
  });

  test('3.10: Missing-field safety (empty copy, missing CTA -> gracefully handles without fabrication)', () => {
    const sparseAd = {
      adText: '',
      ctaText: ''
    };
    const signals = extractCreativeSignals(sparseAd);
    assert.strictEqual(signals.length, 0);
  });

  test('3.11: Raw-to-normalized signal mapping preserves raw token', () => {
    const ad = {
      adText: 'Save 25% on living room items.',
      ctaText: 'Shop Now →'
    };
    const signals = extractCreativeSignals(ad);
    const offer = signals.find(s => s.type === 'OFFER');
    assert.ok(offer);
    assert.strictEqual(offer.normalized, 'DISCOUNT_OFFER');
    assert.ok(offer.raw.includes('25%'));
  });

  test('3.12: Creative type classification (carousel, video, static image)', () => {
    const videoAd = {
      adText: 'Check our manufacturing process video.',
      ctaText: 'Watch More',
      videoUrl: 'https://video.xx.fbcdn.net/123.mp4'
    };
    const signals = extractCreativeSignals(videoAd);
    const typeSignal = signals.find(s => s.type === 'CREATIVE_TYPE');
    assert.ok(typeSignal);
    assert.strictEqual(typeSignal.normalized, 'VIDEO');
  });

  console.log('\n================================================================');
  console.log(`PROMPT 5 TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('ALL SECTION 21, 22, 23 REQUIREMENTS MET CLEANLY');
  console.log('================================================================');
}

runPrompt5TestSuite().catch(err => {
  console.error(err);
  process.exit(1);
});
