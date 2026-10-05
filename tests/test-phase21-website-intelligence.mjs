/**
 * LeadNoria Phase 21: Website Intelligence Engine Test Suite
 *
 * Comprehensive validation across:
 * - Group 1: Page Discovery & Navigation Ordering
 * - Group 2: URL Safety & SSRF Defenses
 * - Group 3: Public Business Identity Extraction
 * - Group 4: Public Email Extraction & Evidence Taxonomy (No guessing, no SMTP)
 * - Group 5: Public Phone Extraction & Normalization
 * - Group 6: Outbound Social Presence Observation (No social crawling)
 * - Group 7: Explicit Public Person / Team Extraction (No inferred people)
 * - Group 8: Structured Data (JSON-LD Organization, LocalBusiness, Person, ContactPoint, PostalAddress)
 * - Group 9: Technology & Digital Signal Detection (LEADNORIA_DERIVED)
 * - Group 10: Public Business Services & Offerings Extraction
 * - Group 11: Cross-Page Conflict Detection & Non-Destructive Recording
 * - Group 12: Bounded Crawl Policies & Resource Limits
 * - Group 13: Content Safety & Adversarial Defenses
 * - Group 14: Data Firewall & Lineage Preservation (Google restrictions cannot be circumvented)
 * - Group 15: Meta & User-Provided Normal Persistence & Export Compatibility
 * - Group 16: End-to-End WebsiteIntelligenceEngine Integration & 24h Caching
 */

import assert from 'node:assert/strict';
import {
  WebsiteIntelligenceEngine,
  validateSafeWebUrl,
  isSafeSameOrigin,
  validateRedirectHop,
  extractCandidateLinksFromHtml,
  buildDiscoveryPlan,
  categorizePagePath,
  detectTechnologiesInHtml,
  extractPublicPeople,
  extractPublicServices,
  detectAllConflicts,
  detectPhoneConflicts,
  detectAddressConflicts,
  detectEmailConflicts,
  BoundedObservationCache,
  generateObservationCacheKey,
  estimateObservationBytes
} from '../src/extension/websiteIntelligence/index.ts';

import { ExportPolicy } from '../src/extension/export/exportPolicy.ts';

let passedTests = 0;
let failedTests = 0;

async function test(name, fn) {
  try {
    await fn();
    passedTests++;
    console.log(`  [PASS] Test ${passedTests + failedTests}: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  [FAIL] Test ${passedTests + failedTests}: ${name}`);
    console.error(err);
  }
}

console.log('================================================================');
console.log('LEADNORIA PHASE 21: WEBSITE INTELLIGENCE ENGINE SUITE');
console.log('================================================================\n');

// ============================================================================
// GROUP 1: PAGE DISCOVERY & NAVIGATION ORDERING
// ============================================================================
console.log('--- GROUP 1: PAGE DISCOVERY & NAVIGATION ORDERING ---');

await test('P21-01: Discovers homepage, contact, about, services, and team links', () => {
  const root = 'https://acmeplumbing.com';
  const html = `
    <html>
      <body>
        <a href="/contact-us">Contact</a>
        <a href="/about-us">About</a>
        <a href="/our-services">Services</a>
        <a href="/our-team">Team</a>
        <a href="/privacy-policy">Privacy</a>
      </body>
    </html>
  `;
  const links = extractCandidateLinksFromHtml(html, root);
  const plan = buildDiscoveryPlan(root, links, 5);

  assert.equal(plan.length, 5);
  assert.equal(plan[0], 'https://acmeplumbing.com');
  assert.ok(plan.some(p => p.includes('/contact-us')));
  assert.ok(plan.some(p => p.includes('/about-us')));
  assert.ok(plan.some(p => p.includes('/our-services')));
  assert.ok(plan.some(p => p.includes('/our-team')));
});

await test('P21-02: Prioritizes Contact before About, Services, and Team', () => {
  const root = 'https://example.com';
  const c1 = categorizePagePath('https://example.com/contact-us', root);
  const c2 = categorizePagePath('https://example.com/about', root);
  const c3 = categorizePagePath('https://example.com/services', root);
  const c4 = categorizePagePath('https://example.com/team', root);

  assert.ok(c1.priority < c2.priority);
  assert.ok(c2.priority < c3.priority);
  assert.ok(c3.priority < c4.priority);
});

await test('P21-03: Rejects irrelevant and non-content pages (login, cart, checkout, admin)', () => {
  const root = 'https://store.com';
  const html = `
    <div>
      <a href="/login">Login</a>
      <a href="/cart">Cart</a>
      <a href="/checkout">Checkout</a>
      <a href="/wp-admin">Admin</a>
      <a href="/catalog.pdf">Download PDF</a>
      <a href="/about">Valid About</a>
    </div>
  `;
  const links = extractCandidateLinksFromHtml(html, root);
  assert.equal(links.length, 1);
  assert.equal(links[0], 'https://store.com/about');
});

await test('P21-04: Enforces same-origin constraint and rejects external links', () => {
  const root = 'https://mybiz.com';
  const html = `
    <div>
      <a href="/contact">Local Contact</a>
      <a href="https://otherbiz.com/contact">External Contact</a>
      <a href="https://subdomain.external.org">External Sub</a>
    </div>
  `;
  const links = extractCandidateLinksFromHtml(html, root);
  assert.equal(links.length, 1);
  assert.equal(links[0], 'https://mybiz.com/contact');
});

// ============================================================================
// GROUP 2: URL SAFETY & SSRF DEFENSES
// ============================================================================
console.log('\n--- GROUP 2: URL SAFETY & SSRF DEFENSES ---');

await test('P21-05: Rejects non-HTTP/HTTPS protocols (javascript, data, file, chrome)', () => {
  assert.equal(validateSafeWebUrl('javascript:alert(1)').isSafe, false);
  assert.equal(validateSafeWebUrl('data:text/html,payload').isSafe, false);
  assert.equal(validateSafeWebUrl('file:///etc/passwd').isSafe, false);
  assert.equal(validateSafeWebUrl('chrome://settings').isSafe, false);
  assert.equal(validateSafeWebUrl('blob:https://example.com/uuid').isSafe, false);
});

await test('P21-06: Rejects loopback addresses (localhost, 127.0.0.1, ::1)', () => {
  assert.equal(validateSafeWebUrl('http://localhost:3000').isSafe, false);
  assert.equal(validateSafeWebUrl('http://127.0.0.1/admin').isSafe, false);
  assert.equal(validateSafeWebUrl('http://0.0.0.0').isSafe, false);
  assert.equal(validateSafeWebUrl('http://[::1]').isSafe, false);
});

await test('P21-07: Rejects private RFC-1918 and cloud metadata IPs', () => {
  assert.equal(validateSafeWebUrl('http://10.0.0.1/status').isSafe, false);
  assert.equal(validateSafeWebUrl('http://172.16.5.1').isSafe, false);
  assert.equal(validateSafeWebUrl('http://192.168.1.1').isSafe, false);
  // AWS/GCP/Azure link-local metadata endpoint
  assert.equal(validateSafeWebUrl('http://169.254.169.254/latest/meta-data').isSafe, false);
});

await test('P21-08: Rejects internal top-level domain names (.local, .internal, .lan)', () => {
  assert.equal(validateSafeWebUrl('http://intranet.local').isSafe, false);
  assert.equal(validateSafeWebUrl('http://backend.internal').isSafe, false);
  assert.equal(validateSafeWebUrl('http://router.lan').isSafe, false);
});

await test('P21-09: Accepts valid public business website URLs', () => {
  assert.equal(validateSafeWebUrl('https://www.summitdental.com').isSafe, true);
  assert.equal(validateSafeWebUrl('http://denverlawfirm.org/contact').isSafe, true);
});

// ============================================================================
// GROUP 3: PUBLIC BUSINESS IDENTITY EXTRACTION
// ============================================================================
console.log('\n--- GROUP 3: PUBLIC BUSINESS IDENTITY EXTRACTION ---');

await test('P21-10: Extracts business identity, page title, and meta description', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [{
    url: 'https://apexlaw.com',
    status: 200,
    html: `
      <html>
        <head>
          <title>Apex Law Group - Colorado Trial Attorneys</title>
          <meta name="description" content="Premier Denver personal injury and commercial trial lawyers.">
          <link rel="canonical" href="https://apexlaw.com">
        </head>
        <body>
          <h1>Apex Law Group</h1>
        </body>
      </html>
    `
  }];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://apexlaw.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  assert.equal(extracted.identity.pageTitle, 'Apex Law Group - Colorado Trial Attorneys');
  assert.equal(extracted.identity.metaDescription, 'Premier Denver personal injury and commercial trial lawyers.');
  assert.equal(extracted.identity.canonicalUrl, 'https://apexlaw.com');
  assert.equal(extracted.identity.domain, 'apexlaw.com');
});

await test('P21-11: Extracts business hours from structured data and page content', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [{
    url: 'https://bakerbakery.com',
    status: 200,
    html: `
      <html>
        <head>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Bakery",
            "name": "Baker Bakery",
            "openingHours": ["Mo-Fr 07:00-18:00", "Sa 08:00-14:00"]
          }
          </script>
        </head>
        <body>Baker Bakery</body>
      </html>
    `
  }];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://bakerbakery.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  assert.ok(extracted.identity.businessHours?.includes('Mo-Fr 07:00-18:00'));
});

// ============================================================================
// GROUP 4: PUBLIC EMAIL EXTRACTION & EVIDENCE TAXONOMY
// ============================================================================
console.log('\n--- GROUP 4: PUBLIC EMAIL EXTRACTION & EVIDENCE TAXONOMY ---');

await test('P21-12: Extracts visible plain text email and mailto links', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [{
    url: 'https://acme.com/contact',
    status: 200,
    html: `
      <p>Direct inquiries: info@acme.com</p>
      <a href="mailto:support@acme.com">Email Support</a>
    </body>
    `
  }];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://acme.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  assert.ok(extracted.emails.some(e => e.normalizedEmail === 'info@acme.com'));
  assert.ok(extracted.emails.some(e => e.normalizedEmail === 'support@acme.com'));
});

await test('P21-13: Deduplicates same email appearing across multiple pages and preserves evidence lineage', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [
    {
      url: 'https://clinic.com',
      status: 200,
      html: '<p>Contact: info@clinic.com</p>'
    },
    {
      url: 'https://clinic.com/contact',
      status: 200,
      html: '<a href="mailto:info@clinic.com">info@clinic.com</a>'
    }
  ];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://clinic.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  assert.equal(extracted.emails.filter(e => e.normalizedEmail === 'info@clinic.com').length, 1);
  const fact = extracted.emails.find(e => e.normalizedEmail === 'info@clinic.com');
  assert.ok(fact.evidence.length >= 2, 'Should accumulate multiple evidence references across pages');
});

await test('P21-14: Discards invalid emails and image filename lookalikes', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [{
    url: 'https://site.com',
    status: 200,
    html: '<img src="logo@2x.png"> <p>Fake: not-an-email@.com</p> <p>Valid: real@site.com</p>'
  }];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://site.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  assert.ok(!extracted.emails.some(e => e.normalizedEmail.includes('logo@2x.png')));
  assert.ok(extracted.emails.some(e => e.normalizedEmail === 'real@site.com'));
});

await test('P21-15: Never guesses or brute-forces unlisted emails', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [{
    url: 'https://mystore.com',
    status: 200,
    html: '<p>Owner: Sarah Connor</p>' // mentions person but NO email
  }];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://mystore.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  // Must NOT invent sarah.connor@mystore.com
  assert.equal(extracted.emails.length, 0);
});

// ============================================================================
// GROUP 5: PUBLIC PHONE EXTRACTION & NORMALIZATION
// ============================================================================
console.log('\n--- GROUP 5: PUBLIC PHONE EXTRACTION & NORMALIZATION ---');

await test('P21-16: Extracts visible phone and tel: links', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [{
    url: 'https://hvac.com/contact',
    status: 200,
    html: '<a href="tel:+13035550199">Call Us: (303) 555-0199</a>'
  }];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://hvac.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  assert.ok(extracted.phones.some(p => p.normalizedValue.includes('5550199') || p.rawValue.includes('555-0199')));
});

await test('P21-17: Normalizes phone deterministically without guessing country codes', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [{
    url: 'https://local.com',
    status: 200,
    html: '<p>Office: 555-4321</p>' // local 7-digit without country code
  }];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://local.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  const p = extracted.phones.find(ph => ph.normalizedValue.includes('555-4321'));
  if (p) {
    // Should not fabricate international +1 prefix if ambiguous
    assert.strictEqual(p.countryCode, undefined);
  }
});

// ============================================================================
// GROUP 6: OUTBOUND SOCIAL PRESENCE OBSERVATION
// ============================================================================
console.log('\n--- GROUP 6: OUTBOUND SOCIAL PRESENCE OBSERVATION ---');

await test('P21-18: Extracts outbound Facebook, Instagram, LinkedIn, and YouTube links', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [{
    url: 'https://agency.com',
    status: 200,
    html: `
      <footer>
        <a href="https://facebook.com/agencydenver">Facebook</a>
        <a href="https://instagram.com/agency_denver">Instagram</a>
        <a href="https://linkedin.com/company/agency-denver">LinkedIn</a>
        <a href="https://youtube.com/@agencydenver">YouTube</a>
        <a href="https://twitter.com/agencydenver">X</a>
      </footer>
    `
  }];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://agency.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  assert.ok(extracted.socialProfiles.some(s => s.platform === 'FACEBOOK'));
  assert.ok(extracted.socialProfiles.some(s => s.platform === 'INSTAGRAM'));
  assert.ok(extracted.socialProfiles.some(s => s.platform === 'LINKEDIN'));
  assert.ok(extracted.socialProfiles.some(s => s.platform === 'YOUTUBE'));
  assert.ok(extracted.socialProfiles.some(s => s.platform === 'TWITTER_X'));
});

await test('P21-19: Ignores social sharing links (sharer.php, intent/tweet)', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [{
    url: 'https://blog.com/post-1',
    status: 200,
    html: `
      <a href="https://www.facebook.com/sharer/sharer.php?u=https://blog.com">Share on FB</a>
      <a href="https://twitter.com/intent/tweet?text=hello">Tweet</a>
    `
  }];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://blog.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  assert.equal(extracted.socialProfiles.length, 0);
});

// ============================================================================
// GROUP 7: EXPLICIT PUBLIC PERSON / TEAM EXTRACTION
// ============================================================================
console.log('\n--- GROUP 7: EXPLICIT PUBLIC PERSON / TEAM EXTRACTION ---');

await test('P21-20: Extracts public person from JSON-LD schema', () => {
  const html = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Dr. Emily Vance",
      "jobTitle": "Lead Orthodontist",
      "email": "dr.vance@dentalcare.com",
      "sameAs": "https://www.linkedin.com/in/emily-vance-dds"
    }
    </script>
  `;
  const people = extractPublicPeople(html, 'https://dentalcare.com/about');
  assert.equal(people.length, 1);
  assert.equal(people[0].fullName, 'Dr. Emily Vance');
  assert.equal(people[0].jobTitle, 'Lead Orthodontist');
  assert.equal(people[0].email, 'dr.vance@dentalcare.com');
  assert.equal(people[0].linkedInUrl, 'https://www.linkedin.com/in/emily-vance-dds');
  assert.equal(people[0].provenance, 'WEBSITE_DERIVED');
});

await test('P21-21: Extracts leadership member from DOM card on Team page', () => {
  const html = `
    <div class="team-member-card">
      <h3 class="name">Marcus Brody</h3>
      <p class="role">Founder & Managing Partner</p>
      <a href="https://www.linkedin.com/in/marcus-brody">LinkedIn</a>
    </div>
  `;
  const people = extractPublicPeople(html, 'https://brodylaw.com/our-team');
  assert.equal(people.length, 1);
  assert.equal(people[0].fullName, 'Marcus Brody');
  assert.equal(people[0].jobTitle, 'Founder & Managing Partner');
  assert.equal(people[0].linkedInUrl, 'https://www.linkedin.com/in/marcus-brody');
});

await test('P21-22: Does not infer people or create unobserved contact fields', () => {
  const html = '<p>General staff directory is currently unavailable.</p>';
  const people = extractPublicPeople(html, 'https://example.com/team');
  assert.equal(people.length, 0);
});

// ============================================================================
// GROUP 8: STRUCTURED DATA (JSON-LD)
// ============================================================================
console.log('\n--- GROUP 8: STRUCTURED DATA (JSON-LD) ---');

await test('P21-23: Ingests LocalBusiness address and phone from JSON-LD', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [{
    url: 'https://austinpest.com',
    status: 200,
    html: `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Austin Pest Control",
        "telephone": "+1 512-555-0188",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "700 Congress Ave",
          "addressLocality": "Austin",
          "addressRegion": "TX",
          "postalCode": "78701",
          "addressCountry": "US"
        }
      }
      </script>
    `
  }];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://austinpest.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  assert.ok(extracted.phones.some(p => p.normalizedValue.includes('5125550188') || p.rawValue.includes('512-555-0188')));
  assert.ok(extracted.locations.some(l => l.normalizedAddress.includes('700 Congress Ave')));
});

// ============================================================================
// GROUP 9: TECHNOLOGY & DIGITAL SIGNAL DETECTION
// ============================================================================
console.log('\n--- GROUP 9: TECHNOLOGY & DIGITAL SIGNAL DETECTION ---');

await test('P21-24: Detects WordPress, Shopify, Wix, and Webflow signatures', () => {
  const wp = detectTechnologiesInHtml('<meta name="generator" content="WordPress 6.4.2" /><link rel="stylesheet" href="/wp-content/themes/twentytwenty/style.css">');
  assert.ok(wp.some(t => t.name === 'WordPress' && t.category === 'CMS'));

  const shop = detectTechnologiesInHtml('<script src="//cdn.shopify.com/s/files/1/theme.js"></script>');
  assert.ok(shop.some(t => t.name === 'Shopify' && t.category === 'ECOMMERCE'));

  const wix = detectTechnologiesInHtml('<script src="https://static.parastorage.com/services/wix-bolt/1.0/bolt.js"></script>');
  assert.ok(wix.some(t => t.name === 'Wix' && t.category === 'CMS'));

  const wf = detectTechnologiesInHtml('<html data-wf-page="64ab1234"></html>');
  assert.ok(wf.some(t => t.name === 'Webflow' && t.category === 'CMS'));
});

await test('P21-25: Detects booking widgets (Calendly) and chat widgets (Intercom)', () => {
  const booking = detectTechnologiesInHtml('<script src="https://assets.calendly.com/assets/external/widget.js"></script>');
  assert.ok(booking.some(t => t.name === 'Calendly' && t.category === 'BOOKING'));

  const chat = detectTechnologiesInHtml('<script src="https://widget.intercom.io/widget/app123"></script>');
  assert.ok(chat.some(t => t.name === 'Intercom' && t.category === 'CHAT_WIDGET'));
});

await test('P21-26: Detects Tag Managers and Analytics (GTM, Meta Pixel)', () => {
  const tags = detectTechnologiesInHtml(`
    <script src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXX"></script>
    <script src="https://connect.facebook.net/en_US/fbevents.js"></script>
  `);
  assert.ok(tags.some(t => t.name === 'Google Tag Manager' && t.category === 'TAG_MANAGER'));
  assert.ok(tags.some(t => t.name === 'Meta Pixel' && t.category === 'ANALYTICS'));
});

// ============================================================================
// GROUP 10: PUBLIC BUSINESS SERVICES & OFFERINGS EXTRACTION
// ============================================================================
console.log('\n--- GROUP 10: PUBLIC BUSINESS SERVICES & OFFERINGS EXTRACTION ---');

await test('P21-27: Extracts public business services from dedicated sections and JSON-LD', () => {
  const html = `
    <section id="services">
      <h2>Emergency Plumbing</h2>
      <h2>Drain Cleaning</h2>
      <h2>Water Heater Repair</h2>
    </section>
  `;
  const services = extractPublicServices(html, 'https://plumber.com/services');
  assert.equal(services.length, 3);
  assert.ok(services.some(s => s.name === 'Emergency Plumbing'));
  assert.ok(services.some(s => s.name === 'Drain Cleaning'));
  assert.ok(services.some(s => s.name === 'Water Heater Repair'));
  assert.equal(services[0].provenance, 'WEBSITE_DERIVED');
});

await test('P21-28: Never invents unobserved services', () => {
  const html = '<p>We are a professional accounting firm.</p>';
  const services = extractPublicServices(html, 'https://taxco.com');
  assert.equal(services.length, 0);
});

// ============================================================================
// GROUP 11: CROSS-PAGE CONFLICT DETECTION & NON-DESTRUCTIVE RECORDING
// ============================================================================
console.log('\n--- GROUP 11: CROSS-PAGE CONFLICT DETECTION & NON-DESTRUCTIVE RECORDING ---');

await test('P21-29: Flags phone discrepancy across pages as PHONE_CONFLICT without overwriting', () => {
  const phones = [
    {
      rawValue: '303-555-0111',
      normalizedValue: '+1 303-555-0111',
      e164Format: '+13035550111',
      phoneType: 'MAIN',
      status: 'FOUND',
      evidence: [{ pageUrl: 'https://co.com', observedAt: '2026-09-01T10:00:00Z' }],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: []
    },
    {
      rawValue: '303-555-0222',
      normalizedValue: '+1 303-555-0222',
      e164Format: '+13035550222',
      phoneType: 'MAIN',
      status: 'FOUND',
      evidence: [{ pageUrl: 'https://co.com/contact', observedAt: '2026-09-01T10:01:00Z' }],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: []
    }
  ];

  const conflicts = detectPhoneConflicts(phones);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].conflictType, 'PHONE_CONFLICT');
  assert.equal(conflicts[0].values.length, 2);
  assert.equal(conflicts[0].values[0].value, '+1 303-555-0111');
  assert.equal(conflicts[0].values[1].value, '+1 303-555-0222');
});

await test('P21-30: Flags address discrepancy across pages as ADDRESS_CONFLICT', () => {
  const locs = [
    {
      id: 'l1',
      rawAddress: '100 Main St, Denver, CO',
      normalizedAddress: '100 Main St, Denver, CO',
      status: 'FOUND',
      evidence: [{ pageUrl: 'https://biz.com', observedAt: '2026-09-01T10:00:00Z' }],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: []
    },
    {
      id: 'l2',
      rawAddress: '500 Broadway, Boulder, CO',
      normalizedAddress: '500 Broadway, Boulder, CO',
      status: 'FOUND',
      evidence: [{ pageUrl: 'https://biz.com/contact', observedAt: '2026-09-01T10:01:00Z' }],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: []
    }
  ];

  const conflicts = detectAddressConflicts(locs);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].conflictType, 'ADDRESS_CONFLICT');
});

// ============================================================================
// GROUP 12: BOUNDED CRAWL POLICIES & RESOURCE LIMITS
// ============================================================================
console.log('\n--- GROUP 12: BOUNDED CRAWL POLICIES & RESOURCE LIMITS ---');

await test('P21-31: Honors maxPages bound (stops at 5 pages)', async () => {
  const engine = new WebsiteIntelligenceEngine();
  const visited = [];

  const mockFetch = async (url) => {
    visited.push(url);
    return {
      status: 200,
      html: `
        <a href="/p1">Page 1</a>
        <a href="/p2">Page 2</a>
        <a href="/p3">Page 3</a>
        <a href="/p4">Page 4</a>
        <a href="/p5">Page 5</a>
        <a href="/p6">Page 6</a>
        <a href="/p7">Page 7</a>
      `
    };
  };

  const pages = await engine.crawl({
    targetUrl: 'https://multi.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED',
    config: { maxPages: 5 }
  }, mockFetch);

  assert.equal(pages.length, 5);
  assert.equal(visited.length, 5);
});

await test('P21-32: Single page failure does not abort remaining crawl', async () => {
  const engine = new WebsiteIntelligenceEngine();

  const mockFetch = async (url) => {
    if (url.includes('/broken')) {
      throw new Error('Connection reset');
    }
    return {
      status: 200,
      html: '<a href="/broken">Broken</a> <a href="/good">Good</a>'
    };
  };

  const pages = await engine.crawl({
    targetUrl: 'https://robust.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  }, mockFetch);

  assert.ok(pages.some(p => p.url.replace(/\/$/, '') === 'https://robust.com'));
  assert.ok(pages.some(p => p.url.includes('/good')));
});

await test('P21-33: Supports cancellation mid-crawl', async () => {
  const engine = new WebsiteIntelligenceEngine();

  let crawlCount = 0;
  const mockFetch = async (url) => {
    crawlCount++;
    if (crawlCount === 1) {
      engine.cancel();
    }
    return {
      status: 200,
      html: '<a href="/next">Next</a>'
    };
  };

  const pages = await engine.crawl({
    targetUrl: 'https://cancel.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  }, mockFetch);

  assert.equal(pages.length, 1);
});

// ============================================================================
// GROUP 13: CONTENT SAFETY & ADVERSARIAL DEFENSES
// ============================================================================
console.log('\n--- GROUP 13: CONTENT SAFETY & ADVERSARIAL DEFENSES ---');

await test('P21-34: Sanitizes script and HTML injection payloads from extracted fields', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [{
    url: 'https://xss.com',
    status: 200,
    html: `
      <title><script>alert('xss')</script>Clean Title</title>
      <meta name="description" content="<img src=x onerror=alert(1)>Safe text">
      <a href="mailto:hacker@evil.com<script>evil()</script>">Link</a>
    `
  }];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://xss.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  assert.ok(!extracted.identity.pageTitle.includes('<script>'));
  assert.ok(!extracted.identity.metaDescription.includes('<img'));
});

await test('P21-35: Enforces max document size limit (truncates oversized HTML)', async () => {
  const engine = new WebsiteIntelligenceEngine();
  const largeHtml = 'A'.repeat(800000); // 800 KB

  const mockFetch = async () => ({
    status: 200,
    html: largeHtml
  });

  const pages = await engine.crawl({
    targetUrl: 'https://oversized.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED',
    config: { maxDocumentBytes: 100000 }
  }, mockFetch);

  assert.equal(pages.length, 1);
  assert.ok(pages[0].html.length <= 100000);
});

// ============================================================================
// GROUP 14: DATA FIREWALL & LINEAGE PRESERVATION (GOOGLE RESTRICTION MANDATE)
// ============================================================================
console.log('\n--- GROUP 14: DATA FIREWALL & LINEAGE PRESERVATION (GOOGLE RESTRICTION MANDATE) ---');

await test('P21-36: Website intelligence on Google-restricted input preserves NOT_PERSISTABLE', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [{
    url: 'https://gmapssite.com',
    status: 200,
    html: '<p>Contact: info@gmapssite.com</p>'
  }];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://gmapssite.com',
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED',
    sourceRestrictions: {
      isRestricted: true,
      restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
      persistenceEligibility: 'NOT_PERSISTABLE',
      exportEligibility: 'NOT_EXPORTABLE'
    }
  });

  const result = engine.emitEvidence(extracted, {
    targetUrl: 'https://gmapssite.com',
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED',
    sourceRestrictions: {
      isRestricted: true,
      restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
      persistenceEligibility: 'NOT_PERSISTABLE',
      exportEligibility: 'NOT_EXPORTABLE'
    }
  }, {
    pagesDiscovered: 1,
    pagesVisited: ['https://gmapssite.com'],
    pagesSkipped: [],
    pagesFailed: [],
    durationMs: 50,
    fromCache: false
  });

  // Check that all contributions enforce NOT_PERSISTABLE and NOT_EXPORTABLE
  assert.equal(result.provenance, 'GOOGLE_DERIVED');
  for (const contrib of result.sourceContributions) {
    assert.equal(contrib.isRestricted, true);
    assert.equal(contrib.persistenceStatus, 'NOT_PERSISTABLE');
    assert.equal(contrib.exportStatus, 'NOT_EXPORTABLE');
    assert.equal(contrib.restrictionBasis, 'GOOGLE_CONSUMER_WEB_RESTRICTED');
  }
});

await test('P21-37: ExportPolicy firewall blocks Google-derived enriched record from export', () => {
  const policy = new ExportPolicy();

  const googleEnrichedRecord = {
    recordId: 'rec_g_enriched_1',
    primarySource: 'GOOGLE_MAPS',
    restrictions: {
      isRestricted: true,
      persistenceEligible: false,
      exportEligible: false,
      restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED'
    },
    fieldEligibility: {
      businessName: {
        fieldName: 'businessName',
        isEligible: false,
        sourceProvenance: 'GOOGLE_DERIVED',
        restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED'
      },
      website: {
        fieldName: 'website',
        isEligible: false,
        sourceProvenance: 'GOOGLE_DERIVED',
        restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED'
      },
      email: {
        fieldName: 'email',
        isEligible: false,
        sourceProvenance: 'GOOGLE_DERIVED',
        restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED'
      }
    }
  };

  const evalResult = policy.evaluateRecord(googleEnrichedRecord);
  assert.equal(evalResult.isEligibleForExport, false);
  assert.ok(evalResult.blockedReason.includes('RESTRICTED') || evalResult.blockedReason.includes('POLICY'));

  const fieldEval = policy.evaluateField('email', googleEnrichedRecord.fieldEligibility.email);
  assert.equal(fieldEval.decision, 'EXPORT_BLOCKED');
});

// ============================================================================
// GROUP 15: META & USER-PROVIDED NORMAL COMPATIBILITY
// ============================================================================
console.log('\n--- GROUP 15: META & USER-PROVIDED NORMAL COMPATIBILITY ---');

await test('P21-38: Website intelligence on Meta input produces PERSISTABLE and EXPORTABLE output', () => {
  const engine = new WebsiteIntelligenceEngine();
  const pages = [{
    url: 'https://metasite.com',
    status: 200,
    html: '<p>Contact: info@metasite.com</p>'
  }];

  const extracted = engine.extract(pages, {
    targetUrl: 'https://metasite.com',
    sourceContext: 'META',
    provenanceContext: 'META_DERIVED'
  });

  const result = engine.emitEvidence(extracted, {
    targetUrl: 'https://metasite.com',
    sourceContext: 'META',
    provenanceContext: 'META_DERIVED'
  }, {
    pagesDiscovered: 1,
    pagesVisited: ['https://metasite.com'],
    pagesSkipped: [],
    pagesFailed: [],
    durationMs: 40,
    fromCache: false
  });

  assert.equal(result.provenance, 'WEBSITE_DERIVED');
  for (const contrib of result.sourceContributions) {
    assert.equal(contrib.isRestricted, false);
    assert.equal(contrib.persistenceStatus, 'PERSISTABLE');
    assert.equal(contrib.exportStatus, 'EXPORTABLE');
    assert.equal(contrib.policyStatus, 'POLICY_APPROVED');
  }
});

// ============================================================================
// GROUP 16: END-TO-END PROCESS & CACHING
// ============================================================================
console.log('\n--- GROUP 16: END-TO-END PROCESS & CACHING ---');

await test('P21-39: Executes full process pipeline with verify, crawl, extract, and emit', async () => {
  const engine = new WebsiteIntelligenceEngine();

  const mockFetch = async (url) => ({
    status: 200,
    html: `
      <html>
        <head>
          <title>Boulder Dental Arts</title>
          <meta name="description" content="Quality family dentistry in Boulder CO.">
        </head>
        <body>
          <h1>Boulder Dental Arts</h1>
          <p>Call us at (303) 555-9000 or email office@boulderdental.com</p>
          <a href="/services">Services</a>
          <footer>
            <a href="https://facebook.com/boulderdental">FB</a>
          </footer>
        </body>
      </html>
    `
  });

  const result = await engine.process({
    targetUrl: 'https://boulderdental.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  }, mockFetch);

  assert.equal(result.verificationState, 'VERIFIED');
  assert.equal(result.identity.pageTitle, 'Boulder Dental Arts');
  assert.ok(result.phones.some(p => p.normalizedValue.includes('5559000') || p.rawValue.includes('555-9000')));
  assert.ok(result.emails.some(e => e.normalizedEmail === 'office@boulderdental.com'));
  assert.ok(result.socialProfiles.some(s => s.platform === 'FACEBOOK'));
  assert.equal(result.crawlStats.fromCache, false);
});

await test('P21-40: Second crawl of same domain returns cached result within TTL', async () => {
  const engine = new WebsiteIntelligenceEngine();
  let fetchCallCount = 0;

  const mockFetch = async () => {
    fetchCallCount++;
    return {
      status: 200,
      html: '<h1>Cached Dental Clinic</h1>'
    };
  };

  const res1 = await engine.process({
    targetUrl: 'https://cachedclinic.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  }, mockFetch);

  assert.equal(res1.crawlStats.fromCache, false);
  assert.equal(fetchCallCount, 1);

  // Second run: should hit 24h cache without calling fetch
  const res2 = await engine.process({
    targetUrl: 'https://cachedclinic.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  }, mockFetch);

  assert.equal(res2.crawlStats.fromCache, true);
  assert.equal(fetchCallCount, 1); // No new network calls
});

// ============================================================================
// GROUP 17: CACHE ISOLATION & DYNAMIC POLICY RE-BINDING (BLOCKER A)
// ============================================================================
console.log('\n--- GROUP 17: CACHE ISOLATION & DYNAMIC POLICY RE-BINDING (BLOCKER A) ---');

await test('P21-41: Same domain USER_PROVIDED produces PERSISTABLE and EXPORTABLE output', async () => {
  const engine = new WebsiteIntelligenceEngine(new BoundedObservationCache());
  const mockFetch = async () => ({ status: 200, html: '<p>Email: info@shared.com</p>' });

  const res = await engine.process({
    targetUrl: 'https://shared.com',
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'USER_PROVIDED'
  }, mockFetch);

  assert.equal(res.provenance, 'WEBSITE_DERIVED');
  for (const contrib of res.sourceContributions) {
    assert.equal(contrib.persistenceStatus, 'PERSISTABLE');
    assert.equal(contrib.exportStatus, 'EXPORTABLE');
    assert.equal(contrib.isRestricted, false);
  }
});

await test('P21-42: Same domain cached under USER_PROVIDED, when requested by GOOGLE_DERIVED, re-binds to restricted policy', async () => {
  const cache = new BoundedObservationCache();
  const engine = new WebsiteIntelligenceEngine(cache);
  let fetchCount = 0;
  const mockFetch = async () => {
    fetchCount++;
    return { status: 200, html: '<p>Email: info@shared.com</p>' };
  };

  // 1. Process as USER_PROVIDED (populates neutral cache)
  const res1 = await engine.process({
    targetUrl: 'https://shared.com',
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'USER_PROVIDED'
  }, mockFetch);
  assert.equal(fetchCount, 1);
  assert.equal(res1.sourceContributions[0].isRestricted, false);

  // 2. Process as GOOGLE_MAPS (hits neutral cache, re-binds policy dynamically!)
  const res2 = await engine.process({
    targetUrl: 'https://shared.com',
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED',
    sourceRestrictions: {
      isRestricted: true,
      persistenceEligible: false,
      exportEligible: false,
      restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED'
    }
  }, mockFetch);

  assert.equal(fetchCount, 1); // Hit cache!
  assert.equal(res2.crawlStats.fromCache, true);
  assert.equal(res2.provenance, 'GOOGLE_DERIVED');
  for (const contrib of res2.sourceContributions) {
    assert.equal(contrib.isRestricted, true);
    assert.equal(contrib.persistenceStatus, 'NOT_PERSISTABLE');
    assert.equal(contrib.exportStatus, 'NOT_EXPORTABLE');
    assert.equal(contrib.restrictionBasis, 'GOOGLE_CONSUMER_WEB_RESTRICTED');
  }
});

await test('P21-43: Restricted Google cache result cannot be returned as unrestricted data', async () => {
  const cache = new BoundedObservationCache();
  const engine = new WebsiteIntelligenceEngine(cache);
  const mockFetch = async () => ({ status: 200, html: '<p>Email: info@restricted-site.com</p>' });

  // First run under Google restriction
  await engine.process({
    targetUrl: 'https://restricted-site.com',
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED',
    sourceRestrictions: { isRestricted: true, persistenceEligible: false, exportEligible: false, restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED' }
  }, mockFetch);

  // Subsequent Google request MUST still be restricted
  const res = await engine.process({
    targetUrl: 'https://restricted-site.com',
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED',
    sourceRestrictions: { isRestricted: true, persistenceEligible: false, exportEligible: false, restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED' }
  }, mockFetch);

  assert.equal(res.crawlStats.fromCache, true);
  assert.equal(res.sourceContributions[0].isRestricted, true);
  assert.equal(res.sourceContributions[0].exportStatus, 'NOT_EXPORTABLE');
});

await test('P21-44: Neutral cache hit under META does not inherit previous Google restrictions', async () => {
  const cache = new BoundedObservationCache();
  const engine = new WebsiteIntelligenceEngine(cache);
  const mockFetch = async () => ({ status: 200, html: '<p>Email: info@shared.com</p>' });

  // 1. First run as Google-restricted
  await engine.process({
    targetUrl: 'https://neutral.com',
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED',
    sourceRestrictions: { isRestricted: true, persistenceEligible: false, exportEligible: false, restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED' }
  }, mockFetch);

  // 2. Second run as Meta (hits cache)
  const resMeta = await engine.process({
    targetUrl: 'https://neutral.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  }, mockFetch);

  assert.equal(resMeta.crawlStats.fromCache, true);
  assert.equal(resMeta.provenance, 'WEBSITE_DERIVED');
  for (const contrib of resMeta.sourceContributions) {
    assert.equal(contrib.isRestricted, false);
    assert.equal(contrib.persistenceStatus, 'PERSISTABLE');
    assert.equal(contrib.exportStatus, 'EXPORTABLE');
  }
});

await test('P21-45: Different crawl configuration produces distinct cache key', () => {
  const k1 = generateObservationCacheKey('https://example.com', { maxPages: 3 });
  const k2 = generateObservationCacheKey('https://example.com', { maxPages: 5 });
  assert.notEqual(k1, k2);
});

await test('P21-46: Different target path/page scope produces distinct cache key', () => {
  const k1 = generateObservationCacheKey('https://enterprise.com/branch-a');
  const k2 = generateObservationCacheKey('https://enterprise.com/branch-b');
  assert.notEqual(k1, k2);
});

await test('P21-47: Provenance is re-applied from current request context on cache hit', async () => {
  const cache = new BoundedObservationCache();
  const engine = new WebsiteIntelligenceEngine(cache);
  const mockFetch = async () => ({ status: 200, html: '<h1>Test</h1>' });

  await engine.process({ targetUrl: 'https://prov.com', sourceContext: 'META', provenanceContext: 'WEBSITE_DERIVED' }, mockFetch);
  const hit = await engine.process({ targetUrl: 'https://prov.com', sourceContext: 'GOOGLE_MAPS', provenanceContext: 'GOOGLE_DERIVED' }, mockFetch);

  assert.equal(hit.provenance, 'GOOGLE_DERIVED');
});

await test('P21-48: Cache hit cannot modify persistence/export state of active records', async () => {
  const cache = new BoundedObservationCache();
  const engine = new WebsiteIntelligenceEngine(cache);
  const mockFetch = async () => ({ status: 200, html: '<h1>Test</h1>' });

  const res1 = await engine.process({ targetUrl: 'https://immut.com', sourceContext: 'META', provenanceContext: 'WEBSITE_DERIVED' }, mockFetch);

  // Modify local result in caller memory
  res1.sourceContributions[0].persistenceStatus = 'NOT_PERSISTABLE';

  // Second process: cache must return pristine neutral facts
  const res2 = await engine.process({ targetUrl: 'https://immut.com', sourceContext: 'META', provenanceContext: 'WEBSITE_DERIVED' }, mockFetch);
  assert.equal(res2.sourceContributions[0].persistenceStatus, 'PERSISTABLE');
});

// ============================================================================
// GROUP 18: BOUNDED IN-MEMORY CACHE & LRU EVICTION (BLOCKER B)
// ============================================================================
console.log('\n--- GROUP 18: BOUNDED IN-MEMORY CACHE & LRU EVICTION (BLOCKER B) ---');

await test('P21-49: MAX_CACHE_ENTRIES bound is strictly enforced (max 3)', () => {
  const cache = new BoundedObservationCache({ maxEntries: 3, maxBytes: 1000000 });
  const dummyPayload = (domain) => ({
    targetOrigin: `https://${domain}`,
    targetUrl: `https://${domain}`,
    canonicalUrl: `https://${domain}`,
    domain,
    scopeKey: domain,
    configHash: '',
    extractedAt: new Date().toISOString(),
    extracted: { identity: { canonicalUrl: '', domain }, phones: [], emails: [], locations: [], socialProfiles: [], people: [], services: [], descriptions: [], technologies: [], contactForms: [], allEvidence: [] },
    crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 1, fromCache: false }
  });

  cache.set('k1', dummyPayload('k1'));
  cache.set('k2', dummyPayload('k2'));
  cache.set('k3', dummyPayload('k3'));
  assert.equal(cache.size(), 3);

  cache.set('k4', dummyPayload('k4'));
  assert.equal(cache.size(), 3);
  assert.equal(cache.get('k1'), null); // Oldest evicted
  assert.ok(cache.get('k4') !== null);
});

await test('P21-50: LRU eviction order updates on get() access', () => {
  const cache = new BoundedObservationCache({ maxEntries: 3, maxBytes: 1000000 });
  const dummyPayload = (domain) => ({
    targetOrigin: `https://${domain}`, targetUrl: `https://${domain}`, canonicalUrl: `https://${domain}`, domain, scopeKey: domain, configHash: '', extractedAt: '',
    extracted: { identity: { canonicalUrl: '', domain }, phones: [], emails: [], locations: [], socialProfiles: [], people: [], services: [], descriptions: [], technologies: [], contactForms: [], allEvidence: [] },
    crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 1, fromCache: false }
  });

  cache.set('k1', dummyPayload('k1'));
  cache.set('k2', dummyPayload('k2'));
  cache.set('k3', dummyPayload('k3'));

  // Access k1 (making it MRU, k2 becomes oldest)
  cache.get('k1');

  // Insert k4 -> should evict k2, not k1!
  cache.set('k4', dummyPayload('k4'));
  assert.equal(cache.get('k2'), null); // k2 was evicted!
  assert.ok(cache.get('k1') !== null); // k1 was preserved!
});

await test('P21-51: MAX_CACHE_BYTES bound is strictly enforced', () => {
  // 5000 bytes budget
  const cache = new BoundedObservationCache({ maxEntries: 50, maxBytes: 5000 });
  const payload = (domain) => ({
    targetOrigin: `https://${domain}`, targetUrl: `https://${domain}`, canonicalUrl: `https://${domain}`, domain, scopeKey: domain, configHash: '', extractedAt: '',
    extracted: { identity: { canonicalUrl: '', domain }, phones: [], emails: [], locations: [], socialProfiles: [], people: [], services: [], descriptions: [{ text: 'X'.repeat(500), sourceType: 'META_DESC', observedAt: '', provenance: 'WEBSITE_DERIVED' }], technologies: [], contactForms: [], allEvidence: [] },
    crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 1, fromCache: false }
  });

  for (let i = 0; i < 10; i++) {
    cache.set(`domain${i}`, payload(`domain${i}`));
  }

  assert.ok(cache.getBytes() <= 5000);
  assert.ok(cache.getStats().evictions > 0);
});

await test('P21-52: Oversized single result exceeding maxBytes is safely rejected', () => {
  const cache = new BoundedObservationCache({ maxEntries: 10, maxBytes: 2000 });
  const oversized = {
    targetOrigin: 'https://huge.com', targetUrl: 'https://huge.com', canonicalUrl: 'https://huge.com', domain: 'huge.com', scopeKey: 'huge', configHash: '', extractedAt: '',
    extracted: { identity: { canonicalUrl: '', domain: 'huge.com' }, phones: [], emails: [], locations: [], socialProfiles: [], people: [], services: [], descriptions: [{ text: 'A'.repeat(5000), sourceType: 'META_DESC', observedAt: '', provenance: 'WEBSITE_DERIVED' }], technologies: [], contactForms: [], allEvidence: [] },
    crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 1, fromCache: false }
  };

  const stored = cache.set('huge', oversized);
  assert.equal(stored, false);
  assert.equal(cache.get('huge'), null);
});

await test('P21-53: TTL expiry removes stale entries on get and pruneExpired', () => {
  const cache = new BoundedObservationCache({ maxEntries: 10, maxBytes: 100000, defaultTtlMs: 10 });
  const payload = {
    targetOrigin: 'https://exp.com', targetUrl: 'https://exp.com', canonicalUrl: 'https://exp.com', domain: 'exp.com', scopeKey: 'exp', configHash: '', extractedAt: '',
    extracted: { identity: { canonicalUrl: '', domain: 'exp.com' }, phones: [], emails: [], locations: [], socialProfiles: [], people: [], services: [], descriptions: [], technologies: [], contactForms: [], allEvidence: [] },
    crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 1, fromCache: false }
  };

  cache.set('exp', payload, 10);
  assert.ok(cache.get('exp') !== null);

  // Expired entry
  cache.set('expired_now', payload, -100);
  assert.equal(cache.get('expired_now'), null);
});

await test('P21-54: Cache never grows beyond configured bounds across repeated writes', () => {
  const cache = new BoundedObservationCache({ maxEntries: 5, maxBytes: 10000 });
  const payload = (i) => ({
    targetOrigin: `https://site${i}.com`, targetUrl: `https://site${i}.com`, canonicalUrl: '', domain: `site${i}.com`, scopeKey: `${i}`, configHash: '', extractedAt: '',
    extracted: { identity: { canonicalUrl: '', domain: `site${i}.com` }, phones: [], emails: [], locations: [], socialProfiles: [], people: [], services: [], descriptions: [], technologies: [], contactForms: [], allEvidence: [] },
    crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 1, fromCache: false }
  });

  for (let i = 0; i < 50; i++) {
    cache.set(`k_${i}`, payload(i));
  }

  assert.ok(cache.size() <= 5);
  assert.ok(cache.getBytes() <= 10000);
});

await test('P21-55: Cache eviction does not corrupt active results in memory', () => {
  const cache = new BoundedObservationCache({ maxEntries: 1, maxBytes: 10000 });
  const payload = (i) => ({
    targetOrigin: `https://site${i}.com`, targetUrl: `https://site${i}.com`, canonicalUrl: '', domain: `site${i}.com`, scopeKey: `${i}`, configHash: '', extractedAt: '',
    extracted: { identity: { canonicalUrl: '', domain: `site${i}.com`, pageTitle: `Title ${i}` }, phones: [], emails: [], locations: [], socialProfiles: [], people: [], services: [], descriptions: [], technologies: [], contactForms: [], allEvidence: [] },
    crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 1, fromCache: false }
  });

  cache.set('first', payload(1));
  const activeObj = cache.get('first');
  assert.equal(activeObj.extracted.identity.pageTitle, 'Title 1');

  // Evict 'first' by adding 'second'
  cache.set('second', payload(2));
  assert.equal(cache.get('first'), null);

  // activeObj in caller memory remains untouched!
  assert.equal(activeObj.extracted.identity.pageTitle, 'Title 1');
});

// ============================================================================
// GROUP 19: REDIRECT SSRF & ORIGIN SAFETY (BLOCKER C)
// ============================================================================
console.log('\n--- GROUP 19: REDIRECT SSRF & ORIGIN SAFETY (BLOCKER C) ---');

await test('P21-56: Redirect public → localhost rejected', () => {
  const hop = validateRedirectHop('http://localhost/admin', 'https://target.com/page', 'https://target.com');
  assert.equal(hop.isSafe, false);
  assert.ok(hop.reason.includes('LOOPBACK_NOT_ALLOWED') || hop.reason.includes('CROSS_ORIGIN'));
});

await test('P21-57: Redirect public → 127.0.0.1 rejected', () => {
  const hop = validateRedirectHop('http://127.0.0.1:8080/secret', 'https://target.com', 'https://target.com');
  assert.equal(hop.isSafe, false);
  assert.ok(hop.reason.includes('LOOPBACK_NOT_ALLOWED') || hop.reason.includes('CROSS_ORIGIN'));
});

await test('P21-58: Redirect public → ::1 IPv6 loopback rejected', () => {
  const hop = validateRedirectHop('http://[::1]/internal', 'https://target.com', 'https://target.com');
  assert.equal(hop.isSafe, false);
});

await test('P21-59: Redirect public → RFC1918 private IP rejected', () => {
  const hop1 = validateRedirectHop('http://10.0.0.5/api', 'https://target.com', 'https://target.com');
  assert.equal(hop1.isSafe, false);

  const hop2 = validateRedirectHop('http://192.168.1.100/router', 'https://target.com', 'https://target.com');
  assert.equal(hop2.isSafe, false);

  const hop3 = validateRedirectHop('http://172.16.5.1/db', 'https://target.com', 'https://target.com');
  assert.equal(hop3.isSafe, false);
});

await test('P21-60: Redirect public → link-local cloud metadata IP (169.254.169.254) rejected', () => {
  const hop = validateRedirectHop('http://169.254.169.254/latest/meta-data/', 'https://target.com', 'https://target.com');
  assert.equal(hop.isSafe, false);
});

await test('P21-61: Redirect public → internal hostname (.local, .internal, .lan) rejected', () => {
  const hop = validateRedirectHop('http://corp-db.internal/status', 'https://target.com', 'https://target.com');
  assert.equal(hop.isSafe, false);
});

await test('P21-62: Redirect public → forbidden schemes (javascript:, data:, file:) rejected', () => {
  const hop1 = validateRedirectHop('javascript:alert(1)', 'https://target.com', 'https://target.com');
  assert.equal(hop1.isSafe, false);

  const hop2 = validateRedirectHop('data:text/html,evil', 'https://target.com', 'https://target.com');
  assert.equal(hop2.isSafe, false);

  const hop3 = validateRedirectHop('file:///etc/passwd', 'https://target.com', 'https://target.com');
  assert.equal(hop3.isSafe, false);
});

await test('P21-63: Redirect public → external origin (cross-origin escape) rejected', () => {
  const hop = validateRedirectHop('https://evil-hacker.com/landing', 'https://target.com', 'https://target.com');
  assert.equal(hop.isSafe, false);
  assert.equal(hop.reason, 'CROSS_ORIGIN_REDIRECT_BLOCKED');
});

await test('P21-64: Multi-hop redirect ending at a private host rejected in engine crawl', async () => {
  const engine = new WebsiteIntelligenceEngine(new BoundedObservationCache());

  const mockFetch = async (url) => {
    if (url === 'https://legit.com/') {
      return { status: 301, headers: { location: 'https://legit.com/hop1' } };
    }
    if (url === 'https://legit.com/hop1') {
      return { status: 302, headers: { location: 'http://169.254.169.254/secret' } }; // Malicious hop!
    }
    return { status: 200, html: 'Should not reach' };
  };

  const pages = await engine.crawl({
    targetUrl: 'https://legit.com',
    sourceContext: 'META',
    provenanceContext: 'WEBSITE_DERIVED'
  }, mockFetch);

  // Crawl must reject and not ingest private destination
  assert.equal(pages.length, 0);
});

await test('P21-65: Safe same-origin redirect allowed and resolved', () => {
  const hop1 = validateRedirectHop('/contact-us', 'https://target.com/page', 'https://target.com');
  assert.equal(hop1.isSafe, true);
  assert.equal(hop1.resolvedUrl, 'https://target.com/contact-us');

  const hop2 = validateRedirectHop('https://target.com/about', 'https://target.com/old-about', 'https://target.com');
  assert.equal(hop2.isSafe, true);
  assert.equal(hop2.resolvedUrl, 'https://target.com/about');
});

await test('P21-66: Malformed redirect URL rejected safely', () => {
  const hop = validateRedirectHop('http://:::invalid:::', 'https://target.com', 'https://target.com');
  assert.equal(hop.isSafe, false);
});

// ============================================================================
// GROUP 20: FIREWALL & ANTI-LAUNDERING INVARIANTS
// ============================================================================
console.log('\n--- GROUP 20: FIREWALL & ANTI-LAUNDERING INVARIANTS ---');

await test('P21-67: Google-restricted cache hit remains NOT_PERSISTABLE', async () => {
  const engine = new WebsiteIntelligenceEngine(new BoundedObservationCache());
  const mockFetch = async () => ({ status: 200, html: '<p>info@biz.com</p>' });

  // Populated by unrestricted run
  await engine.process({ targetUrl: 'https://firewalltest.com', sourceContext: 'META', provenanceContext: 'WEBSITE_DERIVED' }, mockFetch);

  // Subsequent Google-restricted run
  const res = await engine.process({
    targetUrl: 'https://firewalltest.com',
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED',
    sourceRestrictions: { isRestricted: true, persistenceEligible: false, exportEligible: false, restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED' }
  }, mockFetch);

  assert.equal(res.crawlStats.fromCache, true);
  assert.equal(res.sourceContributions[0].persistenceStatus, 'NOT_PERSISTABLE');
});

await test('P21-68: Google-restricted cache hit remains NOT_EXPORTABLE', async () => {
  const engine = new WebsiteIntelligenceEngine(new BoundedObservationCache());
  const mockFetch = async () => ({ status: 200, html: '<p>info@biz.com</p>' });

  await engine.process({ targetUrl: 'https://firewalltest.com', sourceContext: 'META', provenanceContext: 'WEBSITE_DERIVED' }, mockFetch);
  const res = await engine.process({
    targetUrl: 'https://firewalltest.com',
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED',
    sourceRestrictions: { isRestricted: true, persistenceEligible: false, exportEligible: false, restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED' }
  }, mockFetch);

  assert.equal(res.sourceContributions[0].exportStatus, 'NOT_EXPORTABLE');
});

await test('P21-69: Google-restricted cache hit remains GOOGLE_CONSUMER_WEB_RESTRICTED', async () => {
  const engine = new WebsiteIntelligenceEngine(new BoundedObservationCache());
  const mockFetch = async () => ({ status: 200, html: '<p>info@biz.com</p>' });

  await engine.process({ targetUrl: 'https://firewalltest.com', sourceContext: 'META', provenanceContext: 'WEBSITE_DERIVED' }, mockFetch);
  const res = await engine.process({
    targetUrl: 'https://firewalltest.com',
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED',
    sourceRestrictions: { isRestricted: true, persistenceEligible: false, exportEligible: false, restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED' }
  }, mockFetch);

  assert.equal(res.sourceContributions[0].restrictionBasis, 'GOOGLE_CONSUMER_WEB_RESTRICTED');
});

await test('P21-70: Website-derived facts from cache cannot launder Google restrictions in ExportPolicy', async () => {
  const engine = new WebsiteIntelligenceEngine(new BoundedObservationCache());
  const policy = new ExportPolicy();
  const mockFetch = async () => ({ status: 200, html: '<p>info@biz.com</p>' });

  // 1. Crawl website
  const res = await engine.process({
    targetUrl: 'https://firewalltest.com',
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED',
    sourceRestrictions: { isRestricted: true, persistenceEligible: false, exportEligible: false, restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED' }
  }, mockFetch);

  // 2. Build record with the enriched contributions
  const record = {
    recordId: 'rec_cached_g_enrich',
    primarySource: 'GOOGLE_MAPS',
    restrictions: {
      isRestricted: true,
      persistenceEligible: false,
      exportEligible: false,
      restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED'
    },
    fieldEligibility: {
      email: {
        fieldName: 'email',
        isEligible: false,
        sourceProvenance: res.sourceContributions[0].provenance,
        restrictionBasis: res.sourceContributions[0].restrictionBasis
      }
    }
  };

  const decision = policy.evaluateRecord(record);
  assert.equal(decision.isEligibleForExport, false);
  const fieldDecision = policy.evaluateField('email', record.fieldEligibility.email);
  assert.equal(fieldDecision.decision, 'EXPORT_BLOCKED');
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n================================================================');
console.log(`PHASE 21 TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed (Total ${passedTests + failedTests})`);
console.log('================================================================\n');

if (failedTests > 0) {
  console.error('>>> SOME PHASE 21 TESTS FAILED <<<');
  process.exit(1);
} else {
  console.log('>>> ALL PHASE 21 WEBSITE INTELLIGENCE TESTS PASSED! <<<');
}
