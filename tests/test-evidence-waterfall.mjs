/**
 * Master Prompt 4: Evidence Waterfall Adversarial Test Suite
 *
 * Covers all 20 adversarial edge-case scenarios from Section 19:
 * 1. Keyword-only accidental match
 * 2. Generic brand name
 * 3. Strong identity / wrong category
 * 4. Correct category / weak identity
 * 5. Correct identity / weak ad text
 * 6. Commercial ad / unrelated category
 * 7. Multiple contradictory ads
 * 8. Duplicate ads
 * 9. Duplicate evidence
 * 10. Multi-query repeated evidence
 * 11. Marketplace advertiser
 * 12. Parent brand vs branch
 * 13. Agency/client ambiguity
 * 14. Product catalog evidence
 * 15. Service business evidence
 * 16. Local-language evidence
 * 17. Mixed-language evidence
 * 18. Strong negative category
 * 19. Weak positive + strong contradiction
 * 20. Strong identity + strong positive category
 */

import assert from 'node:assert';
import {
  evaluateStrictRelevanceV3,
  createEntityEvidenceProfile,
  recordCandidateEvidenceInProfile,
  collectEvidenceWaterfall,
  calculateEvidenceCoverage,
  buildUncertainRecord
} from '../src/extension/evidenceWaterfall.ts';
import { compileResearchIntent } from '../src/extension/relevanceEngine.ts';

console.log('================================================================');
console.log('MASTER PROMPT 4: EVIDENCE WATERFALL ADVERSARIAL TEST SUITE (20 SCENARIOS)');
console.log('================================================================\n');

let totalChecks = 0;
let passedChecks = 0;

function check(scenario, desc, expected, condition) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] [Scenario ${scenario}] ${desc} -> ${expected}`);
  } else {
    console.error(`[FAIL] [Scenario ${scenario}] ${desc} -> Expected: ${expected}`);
  }
}

const furnitureIntent = compileResearchIntent('CUSTOM', ['Furniture', 'Sofa'], undefined, 'BD');

// Scenario 1: Keyword-only accidental match (news article mentioning furniture)
const case1 = evaluateStrictRelevanceV3({
  advertiserName: 'The Daily Chronicle',
  adText: 'Furniture collection inspired our latest cultural investigation into artisan communities.',
  destinationUrl: 'https://dailychronicle.example.com/artisan',
  destinationDomain: 'dailychronicle.example.com',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(1, 'Keyword-only accidental match (newspaper)', 'NOT_RELEVANT or UNCERTAIN', case1.decision !== 'RELEVANT');

// Scenario 2: Generic brand name without vertical identity
const case2 = evaluateStrictRelevanceV3({
  advertiserName: 'Nova Global',
  adText: 'Discover innovation and excellence with Nova Global services.',
  destinationUrl: 'https://novaglobal.example.com',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(2, 'Generic brand name without vertical identity', 'NOT_RELEVANT', case2.decision === 'NOT_RELEVANT');

// Scenario 3: Strong identity / wrong category (Sports store mentioning chairs)
const case3 = evaluateStrictRelevanceV3({
  advertiserName: 'FC Barcelona Official Store',
  adText: 'Stadium club seats and lounge chairs merchandise now available.',
  destinationUrl: 'https://store.fcbarcelona.example.com/chairs',
  destinationDomain: 'store.fcbarcelona.example.com',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(3, 'Strong sports identity with incidental chair mention', 'NOT_RELEVANT (Contradiction)', case3.decision === 'NOT_RELEVANT' && case3.conflicts.length > 0);

// Scenario 4: Correct category / weak identity (unknown brand but multi-product catalog + commercial)
const case4 = evaluateStrictRelevanceV3({
  advertiserName: 'Nordic Craft Co.',
  adText: 'Solid oak dining tables, ergonomic office chairs, and modular sofas with 20% discount. Order online now.',
  destinationUrl: 'https://nordiccraft.example.com/dining-tables',
  destinationDomain: 'nordiccraft.example.com',
  ctaText: 'Shop Now',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(4, 'Non-literal brand with rich product catalog and commercial intent', 'RELEVANT', case4.decision === 'RELEVANT');

// Scenario 5: Correct identity / weak ad text (Name says Furniture, ad text is short greeting)
const case5 = evaluateStrictRelevanceV3({
  advertiserName: 'Legacy Handcrafted Furniture',
  adText: 'Warm greetings to all our valued patrons this season.',
  destinationUrl: 'https://legacyfurniture.example.com',
  destinationDomain: 'legacyfurniture.example.com',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(5, 'Strong business name with minimal ad copy', 'RELEVANT', case5.decision === 'RELEVANT');

// Scenario 6: Commercial ad / unrelated category (Shoe sale mentioning comfort)
const case6 = evaluateStrictRelevanceV3({
  advertiserName: 'Apex Footwear Store',
  adText: 'Flash sale! Buy 1 get 1 free on all leather boots and sneakers. Shop now!',
  destinationUrl: 'https://apexshoes.example.com',
  destinationDomain: 'apexshoes.example.com',
  ctaText: 'Shop Now',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(6, 'Commercial ad in completely unrelated vertical', 'NOT_RELEVANT', case6.decision === 'NOT_RELEVANT');

// Scenario 7: Multiple contradictory ads for same entity (1 sports ad among 3 ads)
const profile7 = createEntityEvidenceProfile('ent_7', 'United Sports & Lifestyle');
recordCandidateEvidenceInProfile(profile7, {
  advertiserName: 'United Sports & Lifestyle',
  adText: 'Lounge chairs for office relaxation.',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
recordCandidateEvidenceInProfile(profile7, {
  advertiserName: 'United Sports & Lifestyle',
  adText: 'Premier League football jerseys and fan gear on sale.',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
const case7 = evaluateStrictRelevanceV3(profile7, furnitureIntent);
check(7, 'Entity with sports contradiction in one ad', 'NOT_RELEVANT (Contradiction overrides)', case7.decision === 'NOT_RELEVANT' && case7.conflicts.length > 0);

// Scenario 8: Duplicate ads (20 identical ads must not artificially inflate confidence)
const profile8 = createEntityEvidenceProfile('ent_8', 'Apex Comfort Studio');
for (let i = 0; i < 20; i++) {
  recordCandidateEvidenceInProfile(profile8, {
    advertiserName: 'Apex Comfort Studio',
    adText: 'Dining tables and chairs on sale. Shop now!',
    destinationUrl: 'https://apexcomfort.example.com',
    destinationDomain: 'apexcomfort.example.com',
    ctaText: 'Shop Now',
    matchedKeyword: 'Furniture'
  }, furnitureIntent);
}
check(8, '20 duplicate ads collapsed into 1 unique distinct copy hash', 'distinctAdCount=20, distinctHashes=1', profile8.distinctAdCount === 20 && profile8.distinctAdCopyHashes.size === 1);

// Scenario 9: Duplicate evidence items collapse by signature
const uniqueSignalsCount = profile8.uniqueEvidenceMap.size;
const occurrencesCount = profile8.observedEvidenceOccurrences;
check(9, 'Evidence anti-inflation collapses repeated signatures', 'uniqueSignals < occurrences', uniqueSignalsCount > 0 && uniqueSignalsCount < occurrencesCount);

// Scenario 10: Multi-query repeated evidence (Found under Furniture, Sofa, and Desk)
const profile10 = createEntityEvidenceProfile('ent_10', 'Hatil Furniture Living');
recordCandidateEvidenceInProfile(profile10, {
  advertiserName: 'Hatil Furniture Living',
  adText: 'Living room furniture collections.',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
recordCandidateEvidenceInProfile(profile10, {
  advertiserName: 'Hatil Furniture Living',
  adText: 'Ergonomic office sofa collections.',
  matchedKeyword: 'Sofa'
}, furnitureIntent);
const case10 = evaluateStrictRelevanceV3(profile10, furnitureIntent);
check(10, 'Multi-query entity preserves all matched queries', 'queries count = 2', profile10.matchedQueries.size === 2 && case10.decision === 'RELEVANT');

// Scenario 11: Marketplace advertiser (pointing to shared daraz.com.bd)
const case11 = evaluateStrictRelevanceV3({
  advertiserName: 'Generic Merchant Hub',
  adText: 'Great deals on multiple goods on our seller storefront.',
  destinationUrl: 'https://www.daraz.com.bd/shop/merchant-123',
  destinationDomain: 'daraz.com.bd',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(11, 'Shared marketplace merchant with no product or category corroboration', 'NOT_RELEVANT', case11.decision === 'NOT_RELEVANT');

// Scenario 12: Parent brand vs branch (Both recognized as relevant in their respective profiles)
const case12Parent = evaluateStrictRelevanceV3({
  advertiserName: 'Otobi Office Furniture Limited',
  adText: 'Official nationwide office furniture manufacturer and supplier.',
  destinationUrl: 'https://otobi.example.com',
  destinationDomain: 'otobi.example.com',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
const case12Branch = evaluateStrictRelevanceV3({
  advertiserName: 'Otobi Furniture Chittagong Branch',
  adText: 'Visit our Chittagong showroom for bedroom and dining furniture.',
  destinationUrl: 'https://otobictg.example.com',
  destinationDomain: 'otobictg.example.com',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(12, 'Both parent and branch independently evaluated for relevance', 'Both RELEVANT', case12Parent.decision === 'RELEVANT' && case12Branch.decision === 'RELEVANT');

// Scenario 13: Agency/client ambiguity (Ad agency marketing its social media services using client sample)
const case13 = evaluateStrictRelevanceV3({
  advertiserName: 'Bright Media Digital Agency',
  adText: 'We ran lead generation ads for a top furniture brand and achieved 10x ROI. Hire our marketing team today.',
  destinationUrl: 'https://brightmedia.example.com/case-study',
  destinationDomain: 'brightmedia.example.com',
  ctaText: 'Contact Us',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(13, 'Marketing agency referencing client furniture campaign', 'NOT_RELEVANT or UNCERTAIN', case13.decision !== 'RELEVANT');

// Scenario 14: Product catalog evidence (Multi-product terms without literal "furniture" in advertiser name)
const case14 = evaluateStrictRelevanceV3({
  advertiserName: 'Artisan Woodcraft Studio',
  adText: 'Custom mahogany dining tables, ergonomic executive chairs, wardrobes, and credenzas.',
  destinationUrl: 'https://artisanwoodcraft.example.com/products',
  destinationDomain: 'artisanwoodcraft.example.com',
  ctaText: 'Shop Now',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(14, 'Multi-product catalog triggers strong category match', 'RELEVANT', case14.decision === 'RELEVANT' && case14.evidenceCoverage.applicableCategoriesPresent >= 2);

// Scenario 15: Service business evidence (Dental clinic)
const dentalIntent = compileResearchIntent('CUSTOM', ['Dental Clinic', 'Dentist'], undefined, 'US');
const case15 = evaluateStrictRelevanceV3({
  advertiserName: 'Bright Smile Dental Care',
  adText: 'Professional teeth whitening, braces, and dental implants. Book your consultation today.',
  destinationUrl: 'https://brightsmiledental.example.com/appointment',
  destinationDomain: 'brightsmiledental.example.com',
  ctaText: 'Book Now',
  matchedKeyword: 'Dental Clinic'
}, dentalIntent);
check(15, 'Service business (Dental) correctly accepted under Dental intent', 'RELEVANT', case15.decision === 'RELEVANT');

// Scenario 16: Local-language evidence (Bengali script for furniture and dining chair)
const case16 = evaluateStrictRelevanceV3({
  advertiserName: 'আরএফএল ফার্নিচার',
  adText: 'সেরা ডাইনিং চেয়ার ও খাট কিনুন বিশেষ ছাড়ে। এখনই অর্ডার করুন।',
  destinationUrl: 'https://rflbd.example.com/furniture',
  destinationDomain: 'rflbd.example.com',
  ctaText: 'Shop Now',
  matchedKeyword: 'ফার্নিচার'
}, compileResearchIntent('CUSTOM', ['ফার্নিচার', 'Furniture'], undefined, 'BD'));
check(16, 'Bengali script advertiser and copy accepted under Bengali intent', 'RELEVANT', case16.decision === 'RELEVANT');

// Scenario 17: Mixed-language evidence (English brand name + Bengali copy)
const case17 = evaluateStrictRelevanceV3({
  advertiserName: 'Navana Furniture',
  adText: 'প্রিমিয়াম কোয়ালিটি ডাইনিং টেবিল ও অফিস চেয়ার। Shop now with warranty.',
  destinationUrl: 'https://navana-furniture.example.com',
  destinationDomain: 'navana-furniture.example.com',
  ctaText: 'Shop Now',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(17, 'Mixed English/Bengali candidate accepted with high confidence', 'RELEVANT', case17.decision === 'RELEVANT');

// Scenario 18: Strong negative category (Casino betting claiming table games)
const case18 = evaluateStrictRelevanceV3({
  advertiserName: 'Lucky Spin Online Casino',
  adText: 'Join the premier poker table and roulette games online. 100% welcome bonus.',
  destinationUrl: 'https://luckyspin.example.com',
  destinationDomain: 'luckyspin.example.com',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(18, 'Casino mentioning table games rejected by hard contradiction', 'NOT_RELEVANT', case18.decision === 'NOT_RELEVANT');

// Scenario 19: Weak positive keyword + strong contradiction (Hospital chair story)
const case19 = evaluateStrictRelevanceV3({
  advertiserName: 'City General Hospital Clinic',
  adText: 'Resting in our outpatient clinic chair. Support healthcare for underprivileged children.',
  destinationUrl: 'https://cityhospital.example.org',
  destinationDomain: 'cityhospital.example.org',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(19, 'Weak keyword match overridden by healthcare contradiction', 'NOT_RELEVANT', case19.decision === 'NOT_RELEVANT');

// Scenario 20: Strong identity + strong positive category (The gold standard candidate)
const case20 = evaluateStrictRelevanceV3({
  advertiserName: 'Partex Furniture Industries',
  adText: 'Explore our modular office workstations, executive desks, and ergonomic conference chairs. Up to 25% off.',
  destinationUrl: 'https://partexfurniture.com/office-desks',
  destinationDomain: 'partexfurniture.com',
  facebookPageUrl: 'https://facebook.com/partexfurniture',
  ctaText: 'Shop Now',
  matchedKeyword: 'Furniture'
}, furnitureIntent);
check(20, 'Gold standard candidate (Strong name, catalog, CTA, domain)', 'RELEVANT with HIGH confidence & HIGH coverage', case20.decision === 'RELEVANT' && case20.confidence === 'HIGH' && case20.evidenceCoverage.coverageLevel === 'HIGH');

console.log('\n================================================================');
console.log(`ADVERSARIAL SUITE COMPLETED: ${passedChecks}/${totalChecks} PASSED`);
console.log('================================================================\n');

assert.strictEqual(passedChecks, 20, 'All 20 adversarial scenarios must pass cleanly');
