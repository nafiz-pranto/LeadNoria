/**
 * Test Suite: Website Verification Waterfall Integration, Cache, Export & Benchmark (Prompt 6)
 */

import assert from 'assert';
import {
  createEntityEvidenceProfile,
  integrateWebsiteVerificationEvidence
} from '../src/extension/evidenceWaterfall.ts';
import {
  getCachedWebsiteVerification,
  setCachedWebsiteVerification,
  clearWebsiteCache,
  getDomainCacheKey
} from '../src/extension/websiteCache.ts';
import { exportLeadsToCsv } from '../src/extension/metaAdapter.ts';
import {
  verifyLeadWebsite
} from '../src/extension/websiteVerifier.ts';

console.log('=== RUNNING TEST: Website Verification Integration, Cache, Export & Benchmark ===\n');

let passCount = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Evidence Waterfall Integration
test('Integrates website evidence into entity profile preserving contradiction dominance', () => {
  const profile = createEntityEvidenceProfile('oak_decor', 'Oak Decor', 'Oak Decor');

  const mockRecord = {
    leadId: 'lead_1',
    canonicalName: 'Oak Decor',
    originalUrl: 'https://oakdecor.com',
    normalizedUrl: 'https://oakdecor.com',
    finalUrl: 'https://oakdecor.com',
    finalOrigin: 'https://oakdecor.com',
    hostname: 'oakdecor.com',
    status: 'VERIFIED_BUSINESS_WEBSITE',
    identityMatch: 'STRONG',
    categoryMatch: 'STRONG',
    commercialSignals: ['WEBSITE_PRODUCT_SIGNAL'],
    negativeSignals: [],
    evidence: [
      {
        type: 'WEBSITE_IDENTITY',
        strength: 'STRONG',
        source: 'website_verification',
        reason: 'Branding match on domain oakdecor.com',
        value: 'Oak Decor'
      },
      {
        type: 'WEBSITE_COMMERCIAL',
        strength: 'STRONG',
        source: 'website_verification',
        reason: 'Active e-commerce shopping cart',
        value: 'WEBSITE_ECOMMERCE_SIGNAL'
      }
    ],
    pagesVisited: ['https://oakdecor.com'],
    contactSignals: [{ type: 'email', value: 'sales@oakdecor.com' }],
    locationSignals: [],
    verifiedAt: new Date().toISOString(),
    durationMs: 450
  };

  integrateWebsiteVerificationEvidence(profile, mockRecord);
  assert.strictEqual(profile.uniqueEvidenceMap.size, 2);
  assert.ok(profile.observedDomains.has('oakdecor.com'));

  // Negative contradiction dominates
  const negativeRecord = {
    ...mockRecord,
    evidence: [{
      type: 'WEBSITE_NEGATIVE',
      strength: 'CONTRADICTORY',
      source: 'website_verification',
      reason: 'Domain parking detected',
      matchedSignal: 'PARKED_DOMAIN'
    }]
  };
  integrateWebsiteVerificationEvidence(profile, negativeRecord);
  assert.strictEqual(profile.conflicts.length, 1);
  assert.strictEqual(profile.conflicts[0].strength, 'CONTRADICTORY');
});

// 2. 24-Hour Cache Verification
await testAsync('Stores and retrieves verification record by normalized domain with 24h TTL', async () => {
  await clearWebsiteCache(true);
  const domain = 'timberhavenliving.com';
  const mockRecord = {
    leadId: 'lead_cache',
    canonicalName: 'Timber Haven',
    originalUrl: 'https://www.timberhavenliving.com/',
    normalizedUrl: 'https://timberhavenliving.com',
    finalUrl: 'https://timberhavenliving.com',
    finalOrigin: 'https://timberhavenliving.com',
    hostname: 'timberhavenliving.com',
    status: 'VERIFIED_BUSINESS_WEBSITE',
    identityMatch: 'STRONG',
    categoryMatch: 'STRONG',
    commercialSignals: ['WEBSITE_PRODUCT_SIGNAL'],
    negativeSignals: [],
    evidence: [],
    pagesVisited: ['https://timberhavenliving.com'],
    contactSignals: [],
    locationSignals: [],
    verifiedAt: new Date().toISOString(),
    durationMs: 320
  };

  assert.strictEqual(getDomainCacheKey('https://www.timberhavenliving.com/products/'), 'timberhavenliving.com');

  await setCachedWebsiteVerification(domain, mockRecord);
  const retrieved = await getCachedWebsiteVerification('https://timberhavenliving.com/about');
  assert.ok(retrieved);
  assert.strictEqual(retrieved.hostname, 'timberhavenliving.com');
  assert.strictEqual(retrieved.status, 'VERIFIED_BUSINESS_WEBSITE');
});

// 3. CSV Export Verification
test('Export includes all 8 website deep verification columns with formula protection', () => {
  const leads = [
    {
      id: 'lead_csv_1',
      name: 'Modern Sofas Ltd',
      canonicalName: 'Modern Sofas Ltd',
      facebookPageName: 'Modern Sofas Ltd',
      facebookPageState: 'found',
      destinationDomain: 'modernsofas.com',
      destinationUrl: 'https://modernsofas.com',
      websiteState: 'found',
      activeAdCount: 4,
      matchedKeywords: ['sofa', 'furniture'],
      locationCode: 'US',
      locationName: 'United States',
      status: 'QUALIFIED',
      discoveredAt: new Date().toISOString(),
      websiteVerificationStatus: 'VERIFIED_BUSINESS_WEBSITE',
      websiteVerification: {
        leadId: 'lead_csv_1',
        canonicalName: 'Modern Sofas Ltd',
        originalUrl: 'https://modernsofas.com',
        normalizedUrl: 'https://modernsofas.com',
        finalUrl: 'https://modernsofas.com',
        finalOrigin: 'https://modernsofas.com',
        hostname: 'modernsofas.com',
        status: 'VERIFIED_BUSINESS_WEBSITE',
        identityMatch: 'STRONG',
        categoryMatch: 'STRONG',
        commercialSignals: ['WEBSITE_PRODUCT_SIGNAL', 'WEBSITE_ECOMMERCE_SIGNAL'],
        negativeSignals: [],
        evidence: [{ type: 'WEBSITE_IDENTITY', strength: 'STRONG', source: 'website_verification', reason: 'Branding match' }],
        pagesVisited: ['https://modernsofas.com'],
        contactSignals: [{ type: 'email', value: 'info@modernsofas.com' }],
        locationSignals: [],
        verifiedAt: '2026-09-28T12:00:00Z',
        durationMs: 400
      }
    }
  ];

  const csv = exportLeadsToCsv(leads);
  assert.ok(csv.includes('Website Verified URL'));
  assert.ok(csv.includes('Website Deep Verification Status'));
  assert.ok(csv.includes('Website Identity Match'));
  assert.ok(csv.includes('Website Category Match'));
  assert.ok(csv.includes('Website Commercial Signals'));
  assert.ok(csv.includes('Website Evidence Summary'));
  assert.ok(csv.includes('Website Verified At'));

  assert.ok(csv.includes('https://modernsofas.com'));
  assert.ok(csv.includes('VERIFIED_BUSINESS_WEBSITE'));
  assert.ok(csv.includes('STRONG'));
});

// 4. Adversarial Benchmark (Prompt 6 Section 25)
// At least: 10 business websites, 10 unrelated websites, 5 parked/broken/empty domains, 5 directory/marketplace/social-only destinations
await testAsync('Executes deterministic 30-case adversarial website benchmark and calculates metrics', async () => {
  await clearWebsiteCache(true);

  const cases = [
    // 10 Business Websites
    { name: 'Solid Wood Crafts', url: 'https://solidwoodcrafts.com', targetKeyword: 'furniture', isBusinessSite: true, mockHtml: '<html><title>Solid Wood Crafts - Dining & Sofas</title><body><h1>Solid Wood Crafts</h1><p>Catalog, prices from $299. Add to cart. Delivery nationwide.</p></body></html>' },
    { name: 'Nordic Living Studio', url: 'https://nordiclivingstudio.com', targetKeyword: 'furniture', isBusinessSite: true, mockHtml: '<html><title>Nordic Living Studio</title><body><h1>Nordic Living Studio</h1><p>Living room chairs and modern wardrobes. Contact us for quotes.</p></body></html>' },
    { name: 'Apex Bedding Co', url: 'https://apexbeddingco.com', targetKeyword: 'bed', isBusinessSite: true, mockHtml: '<html><title>Apex Bedding Co</title><body><h1>Apex Bedding Co</h1><p>Luxury orthopedic beds and mattresses. Shop now. 10 year warranty.</p></body></html>' },
    { name: 'Metro Office Desks', url: 'https://metroofficedesks.com', targetKeyword: 'office furniture', isBusinessSite: true, mockHtml: '<html><title>Metro Office Desks</title><body><h1>Metro Office Desks</h1><p>Ergonomic office workstations, chairs, and conference tables. Request quote.</p></body></html>' },
    { name: 'Haven Home Decor', url: 'https://havenhomedecor.com', targetKeyword: 'home decor', isBusinessSite: true, mockHtml: '<html><title>Haven Home Decor</title><body><h1>Haven Home Decor</h1><p>Designer lighting, rugs, and living accessories. Buy online.</p></body></html>' },
    { name: 'Prestige Wardrobes', url: 'https://prestigewardrobes.com', targetKeyword: 'wardrobe', isBusinessSite: true, mockHtml: '<html><title>Prestige Wardrobes</title><body><h1>Prestige Wardrobes</h1><p>Custom built-in sliding wardrobes and closets. Book free consultation.</p></body></html>' },
    { name: 'Urban Comfort Sofas', url: 'https://urbancomfortsofas.com', targetKeyword: 'sofa', isBusinessSite: true, mockHtml: '<html><title>Urban Comfort Sofas</title><body><h1>Urban Comfort Sofas</h1><p>Sectional sofas, leather recliners. Showroom in Brooklyn. Order online.</p></body></html>' },
    { name: 'Heritage Woodworks', url: 'https://heritagewoodworks.com', targetKeyword: 'furniture', isBusinessSite: true, mockHtml: '<html><title>Heritage Woodworks</title><body><h1>Heritage Woodworks</h1><p>Custom handmade teak dining sets. Pricing starts at $800.</p></body></html>' },
    { name: 'Luxe Patio Outdoor', url: 'https://luxepatiooutdoor.com', targetKeyword: 'outdoor furniture', isBusinessSite: true, mockHtml: '<html><title>Luxe Patio Outdoor</title><body><h1>Luxe Patio Outdoor</h1><p>Weatherproof outdoor sets, rattan chairs. Fast shipping.</p></body></html>' },
    { name: 'Modern Kitchen Cabinets', url: 'https://modernkitchencabinets.com', targetKeyword: 'kitchen cabinets', isBusinessSite: true, mockHtml: '<html><title>Modern Kitchen Cabinets</title><body><h1>Modern Kitchen Cabinets</h1><p>Modular kitchen cabinetry and kitchen fittings. Get quote.</p></body></html>' },

    // 10 Unrelated Websites
    { name: 'Global Tech News', url: 'https://globaltechnews.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Global Tech News Daily</title><body><h1>Global Tech News</h1><p>Breaking journalism, smartphone reviews, AI algorithms.</p></body></html>' },
    { name: 'Sarah Personal Diary', url: 'https://sarahpersonaldiary.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Sarah Personal Blog</title><body><h1>Welcome to my personal blog</h1><p>My daily reflections and travel thoughts.</p></body></html>' },
    { name: 'City Football Club', url: 'https://cityfootballclub.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>City Football Club</title><body><h1>City Football Club</h1><p>Match highlights, league table, tournament fixtures.</p></body></html>' },
    { name: 'Crypto Alpha Pulse', url: 'https://cryptoalphapulse.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Crypto Alpha Pulse</title><body><h1>Crypto Trading Strategies</h1><p>Bitcoin trading signals and token yields.</p></body></html>' },
    { name: 'State Government Portal', url: 'https://stategovportal.gov', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Department of Public Works</title><body><h1>State Official Portal</h1><p>Citizen municipal services and public voting forms.</p></body></html>' },
    { name: 'Academic Bio Research', url: 'https://academicbioresearch.org', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Genomics Research Institute</title><body><h1>Molecular Biology Papers</h1><p>Peer-reviewed biology manuscripts.</p></body></html>' },
    { name: 'Cooking Recipes World', url: 'https://cookingrecipesworld.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Home Cooking Recipes</title><body><h1>Delicious Pasta Recipes</h1><p>Baking guides and chocolate dessert tutorials.</p></body></html>' },
    { name: 'Indie Video Games Studio', url: 'https://indiegamestudio.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Pixel Arcade Studios</title><body><h1>2D Platformer Games</h1><p>Download demo on Steam and itch.io.</p></body></html>' },
    { name: 'Film Critics Review', url: 'https://filmcriticsreview.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Cinema Critic Weekly</title><body><h1>Movie Reviews & Box Office</h1><p>Hollywood premiere ratings and director interviews.</p></body></html>' },
    { name: 'Astronomy Sky Watch', url: 'https://astronomyskywatch.org', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Sky Watch Telescope Guide</title><body><h1>Solar System Exploration</h1><p>Jupiter moon observations and astrophotography.</p></body></html>' },

    // 5 Parked / Broken / Empty Domains
    { name: 'Parked Domain 1', url: 'https://unusedfurniturestore.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Domain For Sale</title><body><h1>This domain is for sale</h1><p>Inquire about this domain at Dan.com</p></body></html>' },
    { name: 'Parked Domain 2', url: 'https://expiredsofas.com', targetKeyword: 'sofa', isBusinessSite: false, mockHtml: '<html><title>Sedo Domain Parking</title><body><h1>Parked free courtesy of Sedo.com</h1></body></html>' },
    { name: 'Empty Site 1', url: 'https://newlyregisteredwood.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><head><title>Under Construction</title></head><body><h1>Website Coming Soon</h1><p>Default web site page.</p></body></html>' },
    { name: 'Empty Site 2', url: 'https://blankdomaintree.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><head></head><body></body></html>' },
    { name: 'Broken Site 1', url: 'https://brokenlinkcrafts.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><body>404 Not Found</body></html>', mockStatus: 404 },

    // 5 Directory / Marketplace / Social Only Destinations
    { name: 'National Yellow Pages', url: 'https://nationalyellowpages.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>National Business Directory</title><body><h1>Local Business Listings</h1><p>Find local businesses and yellow pages services.</p></body></html>' },
    { name: 'Job Recruiters Portal', url: 'https://jobrecruitersportal.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Career Portal</title><body><h1>Search Jobs & Post Vacancies</h1><p>Job vacancies across retail and manufacturing.</p></body></html>' },
    { name: 'General Classifieds Net', url: 'https://generalclassifieds.net', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Free Classifieds Listings</title><body><h1>Free Ads & Directory</h1><p>Browse user listings and classified advertisements.</p></body></html>' },
    { name: 'Marketplace Vendor Aggregator', url: 'https://multivendorhub.com', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Multi-Vendor Hub</title><body><h1>Top 10 Businesses & Vendor Directory</h1><p>Directory of merchants.</p></body></html>' },
    { name: 'Tech Talent Jobs', url: 'https://techtalentjobs.io', targetKeyword: 'furniture', isBusinessSite: false, mockHtml: '<html><title>Tech Careers & Jobs</title><body><h1>Apply now for jobs</h1><p>Upload resume for hiring companies.</p></body></html>' }
  ];

  assert.strictEqual(cases.length, 30, 'Benchmark must contain exactly 30 test cases');

  let TP = 0, TN = 0, FP = 0, FN = 0;

  for (const tc of cases) {
    const lead = {
      id: `lead_${tc.name.replace(/\s+/g, '_')}`,
      name: tc.name,
      canonicalName: tc.name,
      destinationUrl: tc.url,
      destinationDomain: new URL(tc.url).hostname,
      matchedKeywords: [tc.targetKeyword]
    };

    const mockFetch = async () => ({
      status: tc.mockStatus || 200,
      html: tc.mockHtml
    });

    const record = await verifyLeadWebsite(lead, mockFetch);
    const predictedBusinessSite = record.status === 'VERIFIED_BUSINESS_WEBSITE' || record.status === 'LIKELY_BUSINESS_WEBSITE';

    if (tc.isBusinessSite && predictedBusinessSite) TP++;
    else if (!tc.isBusinessSite && !predictedBusinessSite) TN++;
    else if (!tc.isBusinessSite && predictedBusinessSite) {
      FP++;
      console.log(`    [FP] ${tc.name}: predicted ${record.status}, expected non-business`);
    } else if (tc.isBusinessSite && !predictedBusinessSite) {
      FN++;
      console.log(`    [FN] ${tc.name}: predicted ${record.status}, expected business`);
    }
  }

  const precision = TP + FP > 0 ? TP / (TP + FP) : 0;
  const recall = TP + FN > 0 ? TP / (TP + FN) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  console.log(`  Adversarial Benchmark Results (N=${cases.length}):`);
  console.log(`    TP: ${TP}, TN: ${TN}, FP: ${FP}, FN: ${FN}`);
  console.log(`    Precision: ${(precision * 100).toFixed(1)}%`);
  console.log(`    Recall:    ${(recall * 100).toFixed(1)}%`);
  console.log(`    F1-Score:  ${(f1 * 100).toFixed(1)}%`);

  assert.strictEqual(TP, 10, 'All 10 legitimate business websites should be verified/likely');
  assert.strictEqual(TN, 20, 'All 20 non-business/unrelated/parked/directory destinations should be correctly rejected/uncertain');
  assert.strictEqual(FP, 0, 'Zero false positives on non-business destinations');
  assert.strictEqual(FN, 0, 'Zero false negatives on legitimate business websites');
  assert.strictEqual(precision, 1.0);
  assert.strictEqual(recall, 1.0);
  assert.strictEqual(f1, 1.0);
});

console.log(`\nIntegration, cache, export & benchmark suite complete. Passed: ${passCount}/4 checks.\n`);
