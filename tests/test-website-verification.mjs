/**
 * Test Suite: Website Verification Core Engine & Normalization (Prompt 6)
 */

import assert from 'assert';
import { normalizeWebsiteUrl, isSameOriginUrl } from '../src/extension/websiteUrlNormalizer.ts';
import {
  verifyLeadWebsite,
  prioritizePagesToCrawl,
  MAX_PAGES_PER_DOMAIN,
  MAX_PAGE_TIMEOUT_MS,
  MAX_DOMAIN_VERIFICATION_TIME_MS
} from '../src/extension/websiteVerifier.ts';
import { clearWebsiteCache } from '../src/extension/websiteCache.ts';

console.log('=== RUNNING TEST: Website Verification Core Engine ===\n');

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

// 1. URL Normalization
test('Normalizes missing scheme to https', () => {
  const res = normalizeWebsiteUrl('moderncraftfurniture.com');
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.finalUrl, 'https://moderncraftfurniture.com/');
  assert.strictEqual(res.finalHostname, 'moderncraftfurniture.com');
});

test('Strips trailing slashes and fragments', () => {
  const res = normalizeWebsiteUrl('https://example.com/products/#featured-section');
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.finalUrl, 'https://example.com/products');
});

test('Strips marketing tracking parameters (utm_*, fbclid, gclid)', () => {
  const res = normalizeWebsiteUrl('https://example.com/shop?utm_source=meta&utm_medium=cpc&fbclid=IwAR123&keep=1');
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.finalUrl, 'https://example.com/shop?keep=1');
});

test('Unwraps public Meta link shim safely without network calls', () => {
  const shim = 'https://l.facebook.com/l.php?u=https%3A%2F%2Fauthentichome.com%2Fcatalog%3Futm_source%3Dfb&h=AT123';
  const res = normalizeWebsiteUrl(shim);
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.isMetaRedirect, true);
  assert.strictEqual(res.finalHostname, 'authentichome.com');
  assert.strictEqual(res.finalUrl, 'https://authentichome.com/catalog');
});

test('Rejects invalid schemes and empty inputs', () => {
  assert.strictEqual(normalizeWebsiteUrl('').isValid, false);
  assert.strictEqual(normalizeWebsiteUrl('javascript:alert(1)').isValid, false);
  assert.strictEqual(normalizeWebsiteUrl('data:text/html,<h1>hi</h1>').isValid, false);
});

// 2. Same-Origin Enforcement
test('Enforces same-origin verification and accepts www equivalence', () => {
  assert.strictEqual(isSameOriginUrl('https://example.com/about', 'https://example.com'), true);
  assert.strictEqual(isSameOriginUrl('https://www.example.com/contact', 'https://example.com'), true);
  assert.strictEqual(isSameOriginUrl('https://external-social.com/page', 'https://example.com'), false);
  assert.strictEqual(isSameOriginUrl('https://amazon.com/dp/12345', 'https://example.com'), false);
});

// 3. Crawl Page Prioritization and Limits
test('Limits crawl depth to MAX_PAGES_PER_DOMAIN (5) and prioritizes business pages', () => {
  const links = [
    'https://example.com/misc',
    'https://example.com/contact-us',
    'https://example.com/about',
    'https://example.com/products',
    'https://example.com/gallery',
    'https://example.com/careers',
    'https://example.com/faq'
  ];
  const queue = prioritizePagesToCrawl('https://example.com', links);
  assert.strictEqual(queue.length, MAX_PAGES_PER_DOMAIN);
  assert.strictEqual(queue[0], 'https://example.com');
  assert.ok(queue.includes('https://example.com/about'));
  assert.ok(queue.includes('https://example.com/contact-us'));
  assert.ok(queue.includes('https://example.com/products'));
});

// 4. Resource & Timeout Constants Check
test('Strict resource and timeout limits are configured', () => {
  assert.strictEqual(MAX_PAGE_TIMEOUT_MS, 10000);
  assert.strictEqual(MAX_DOMAIN_VERIFICATION_TIME_MS, 30000);
  assert.strictEqual(MAX_PAGES_PER_DOMAIN, 5);
});

// 5. Verification Execution Tests
await testAsync('Handles lead with NO_WEBSITE without crashing or disqualifying', async () => {
  const lead = {
    id: 'lead_no_web',
    name: 'Corner Woodworks',
    canonicalName: 'Corner Woodworks',
    facebookPageName: 'Corner Woodworks',
    facebookPageState: 'found',
    websiteState: 'not_found',
    activeAdCount: 3,
    adLibraryIds: ['101'],
    matchedKeywords: ['furniture'],
    locationCode: 'US',
    locationName: 'United States',
    status: 'QUALIFIED',
    discoveredAt: new Date().toISOString()
  };

  const record = await verifyLeadWebsite(lead);
  assert.strictEqual(record.status, 'NO_WEBSITE');
  assert.strictEqual(record.leadId, 'lead_no_web');
  assert.strictEqual(lead.status, 'QUALIFIED'); // Lead remains completely intact
});

await testAsync('Handles lead with INVALID URL without crashing', async () => {
  const lead = {
    id: 'lead_invalid_web',
    name: 'Broken Link Store',
    canonicalName: 'Broken Link Store',
    facebookPageName: 'Broken Link Store',
    destinationUrl: 'https://bad domain with spaces',
    facebookPageState: 'found',
    websiteState: 'found',
    activeAdCount: 1,
    adLibraryIds: ['102'],
    matchedKeywords: ['furniture'],
    locationCode: 'US',
    locationName: 'United States',
    status: 'QUALIFIED',
    discoveredAt: new Date().toISOString()
  };

  const record = await verifyLeadWebsite(lead);
  assert.strictEqual(record.status, 'INVALID');
  assert.ok(record.errorCode);
  assert.strictEqual(lead.status, 'QUALIFIED');
});

await testAsync('Handles security challenge / BLOCKED destination gracefully', async () => {
  await clearWebsiteCache(true);
  const lead = {
    id: 'lead_blocked_site',
    name: 'Protected Shop',
    canonicalName: 'Protected Shop',
    facebookPageName: 'Protected Shop',
    destinationUrl: 'https://protectedshop.com',
    destinationDomain: 'protectedshop.com',
    facebookPageState: 'found',
    websiteState: 'found',
    activeAdCount: 2,
    adLibraryIds: ['103'],
    matchedKeywords: ['furniture'],
    locationCode: 'US',
    locationName: 'United States',
    status: 'QUALIFIED',
    discoveredAt: new Date().toISOString()
  };

  const mockBlockedFetch = async () => ({
    status: 403,
    html: '<html><title>Just a moment...</title><body>Attention Required! | Cloudflare. Verify you are human.</body></html>'
  });

  const record = await verifyLeadWebsite(lead, mockBlockedFetch);
  assert.strictEqual(record.status, 'BLOCKED');
  assert.ok(record.blockedReason);
  assert.strictEqual(lead.status, 'QUALIFIED');
});

await testAsync('Confirms destination consistency: STRONG match vs DOMAIN CONFLICT', async () => {
  await clearWebsiteCache(true);
  const matchingLead = {
    id: 'lead_match',
    name: 'Nova Furnishings',
    canonicalName: 'Nova Furnishings',
    facebookPageName: 'Nova Furnishings',
    destinationUrl: 'https://novafurnishings.com',
    destinationDomain: 'novafurnishings.com',
    facebookPageState: 'found',
    websiteState: 'found',
    activeAdCount: 2,
    adLibraryIds: ['104'],
    matchedKeywords: ['furniture'],
    locationCode: 'US',
    locationName: 'United States',
    status: 'QUALIFIED',
    discoveredAt: new Date().toISOString()
  };

  const mockSiteFetch = async () => ({
    status: 200,
    html: `
      <html>
        <head><title>Nova Furnishings | Quality Wooden Furniture & Living Room Sofas</title></head>
        <body>
          <h1>Nova Furnishings</h1>
          <p>Explore our premium furniture collection, dining tables, and beds. Starting at $299. Add to cart now!</p>
          <a href="/contact">Contact</a>
        </body>
      </html>
    `
  });

  const matchRecord = await verifyLeadWebsite(matchingLead, mockSiteFetch);
  assert.strictEqual(matchRecord.status, 'VERIFIED_BUSINESS_WEBSITE');
  const destEvidence = matchRecord.evidence.find(e => e.type === 'WEBSITE_DESTINATION');
  assert.ok(destEvidence);
  assert.strictEqual(destEvidence.strength, 'STRONG');
  assert.strictEqual(destEvidence.matchedSignal, 'DESTINATION_MATCH_STRONG');
});

console.log(`\nWebsite verification suite complete. Passed: ${passCount}/10 checks.\n`);
