/**
 * Test Suite: Website Identity, Commercial Signals & Category Matching (Prompt 6)
 */

import assert from 'assert';
import {
  extractPageSignalsFromHtml,
  evaluateBusinessIdentityMatch,
  extractCommercialSignals,
  evaluateWebsiteCategoryMatch
} from '../src/extension/websiteVerifier.ts';

console.log('=== RUNNING TEST: Website Evidence & Commercial Signals ===\n');

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

// 1. Identity Evidence Extraction
test('Extracts title, meta description, headings, and JSON-LD organization cleanly', () => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Artisan Oak Living — Premium Handcrafted Solid Wood Furniture</title>
        <meta name="description" content="Discover solid oak dining tables, sofas, and ergonomic chairs designed for modern homes.">
        <link rel="canonical" href="https://artisanoakliving.com/">
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Artisan Oak Living LLC",
            "url": "https://artisanoakliving.com"
          }
        </script>
      </head>
      <body>
        <h1>Handcrafted Solid Wood Furniture</h1>
        <h2>Living Room & Dining Collections</h2>
        <img src="/logo.png" alt="Artisan Oak Living official logo" class="header-logo" />
        <p>Email: contact@artisanoakliving.com | Phone: +1-555-019-2834</p>
      </body>
    </html>
  `;

  const signals = extractPageSignalsFromHtml(html, 'https://artisanoakliving.com');
  assert.strictEqual(signals.title, 'Artisan Oak Living — Premium Handcrafted Solid Wood Furniture');
  assert.strictEqual(signals.metaDescription, 'Discover solid oak dining tables, sofas, and ergonomic chairs designed for modern homes.');
  assert.strictEqual(signals.organizationName, 'Artisan Oak Living LLC');
  assert.ok(signals.h1.includes('Handcrafted Solid Wood Furniture'));
  assert.ok(signals.logoAlt.some(a => a.includes('Artisan Oak Living')));
  assert.ok(signals.emails.includes('contact@artisanoakliving.com'));
  assert.ok(signals.phones.some(p => p.includes('555')));
});

// 2. Business Identity Match
test('Assigns STRONG identity match when organization/title and domain directly corroborate entity', () => {
  const lead = {
    id: 'lead_1',
    name: 'Artisan Oak Living',
    canonicalName: 'Artisan Oak Living',
    facebookPageName: 'Artisan Oak Living',
    destinationDomain: 'artisanoakliving.com',
    matchedKeywords: ['furniture']
  };

  const identity = evaluateBusinessIdentityMatch(lead, {
    title: 'Artisan Oak Living — Handcrafted Home Furniture',
    organizationName: 'Artisan Oak Living',
    logoAlt: ['Artisan Oak Living logo'],
    headings: ['Welcome to Artisan Oak Living'],
    hostname: 'artisanoakliving.com'
  });

  assert.strictEqual(identity.level, 'STRONG');
  assert.strictEqual(identity.evidenceItems.length, 1);
  assert.strictEqual(identity.evidenceItems[0].strength, 'STRONG');
});

test('Assigns MODERATE identity match for substantial token overlap', () => {
  const lead = {
    id: 'lead_2',
    name: 'Urban Timber Studio',
    canonicalName: 'Urban Timber Studio',
    destinationDomain: 'timbercreations.com',
    matchedKeywords: ['furniture']
  };

  const identity = evaluateBusinessIdentityMatch(lead, {
    title: 'Timber Creations Studio',
    organizationName: 'Timber Creations LLC',
    logoAlt: [],
    headings: ['Custom Woodwork'],
    hostname: 'timbercreations.com'
  });

  assert.strictEqual(identity.level, 'MODERATE');
});

test('Rule: Generic keyword overlap alone MUST NOT produce strong identity', () => {
  const lead = {
    id: 'lead_3',
    name: 'Apex Precision Furniture',
    canonicalName: 'Apex Precision Furniture',
    destinationDomain: 'cityfurnituregallery.com',
    matchedKeywords: ['furniture']
  };

  // Website only has "furniture", no "apex" or "precision"
  const identity = evaluateBusinessIdentityMatch(lead, {
    title: 'City Furniture Store — Cheap Furniture For All',
    organizationName: 'City Furniture LLC',
    logoAlt: [],
    headings: ['Our Furniture Deals'],
    hostname: 'cityfurnituregallery.com'
  });

  assert.notStrictEqual(identity.level, 'STRONG', 'Keyword overlap alone cannot produce STRONG identity');
  assert.strictEqual(identity.level === 'WEAK' || identity.level === 'CONTRADICTORY', true);
});

test('Assigns CONTRADICTORY identity when website explicitly belongs to different company', () => {
  const lead = {
    id: 'lead_4',
    name: 'Zenith Sofas',
    canonicalName: 'Zenith Sofas',
    destinationDomain: 'rivalfurnituredepot.com',
    matchedKeywords: ['sofa', 'furniture']
  };

  const identity = evaluateBusinessIdentityMatch(lead, {
    title: 'Rival Furniture Depot Corporation',
    organizationName: 'Rival Furniture Depot Corporation',
    logoAlt: [],
    headings: ['Welcome to Rival Depot'],
    hostname: 'rivalfurnituredepot.com'
  });

  assert.strictEqual(identity.level, 'CONTRADICTORY');
});

// 3. Commercial Signals Extraction
test('Extracts and deduplicates diverse commercial intent signals', () => {
  const text = `
    Browse our full catalog of dining tables, wooden chairs, and beds.
    Pricing starts at $499 with flat 20% discount this weekend.
    Add to cart or checkout online for fast nationwide home delivery.
    Visit our flagship experience showroom or book an appointment for custom consultation.
    Every product comes with our 5-year solid wood warranty. Contact sales today!
  `;

  const { signals, evidenceItems } = extractCommercialSignals(text);
  assert.ok(signals.includes('WEBSITE_PRODUCT_SIGNAL'));
  assert.ok(signals.includes('WEBSITE_PRICE_SIGNAL'));
  assert.ok(signals.includes('WEBSITE_ECOMMERCE_SIGNAL'));
  assert.ok(signals.includes('WEBSITE_DELIVERY_SIGNAL'));
  assert.ok(signals.includes('WEBSITE_SHOWROOM_SIGNAL'));
  assert.ok(signals.includes('WEBSITE_BOOKING_SIGNAL'));
  assert.ok(signals.includes('WEBSITE_WARRANTY_SIGNAL'));
  assert.ok(signals.includes('WEBSITE_CONTACT_SIGNAL'));

  // Ensure deduplication: no duplicate codes
  const uniqueCodes = new Set(signals);
  assert.strictEqual(signals.length, uniqueCodes.size);
});

// 4. Category Match Evaluation
test('Evaluates category match against lead vertical taxonomy', () => {
  const furnitureLead = {
    id: 'lead_cat',
    name: 'Crafted Woods',
    canonicalName: 'Crafted Woods',
    matchedKeywords: ['furniture', 'sofa']
  };

  const relevantText = 'We manufacture solid wood dining tables, sofas, wardrobes, and ergonomic beds.';
  const strongMatch = evaluateWebsiteCategoryMatch(furnitureLead, relevantText);
  assert.strictEqual(strongMatch.level, 'STRONG');

  const unrelatedText = 'We provide enterprise cloud cybersecurity solutions and firewall audits.';
  const weakMatch = evaluateWebsiteCategoryMatch(furnitureLead, unrelatedText);
  assert.strictEqual(weakMatch.level, 'WEAK');
});

console.log(`\nWebsite evidence and commercial signals complete. Passed: ${passCount}/7 checks.\n`);
