/**
 * Test Suite: Website Negative Signals & Status Engine (Prompt 6)
 */

import assert from 'assert';
import {
  detectWebsiteNegativeSignals,
  determineFinalWebsiteStatus
} from '../src/extension/websiteVerifier.ts';

console.log('=== RUNNING TEST: Website Negative Signals & Status Engine ===\n');

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

// 1. Negative Signal Detection
test('Detects PARKED_DOMAIN and DOMAIN_FOR_SALE', () => {
  const html = 'This domain is for sale. Buy this domain today at Dan.com or Sedo parking.';
  const res = detectWebsiteNegativeSignals(html, 200, 1);
  assert.ok(res.signals.includes('PARKED_DOMAIN'));
  assert.ok(res.signals.includes('DOMAIN_FOR_SALE'));
});

test('Detects GENERIC_DIRECTORY and yellow pages aggregator', () => {
  const html = 'Local Business Directory - Find local businesses, top 10 businesses, and yellow pages listings.';
  const res = detectWebsiteNegativeSignals(html, 200, 1);
  assert.ok(res.signals.includes('GENERIC_DIRECTORY'));
});

test('Detects JOB_PORTAL destination', () => {
  const html = 'Post a job, search jobs, and explore latest job vacancies and career portal.';
  const res = detectWebsiteNegativeSignals(html, 200, 1);
  assert.ok(res.signals.includes('JOB_PORTAL'));
});

test('Detects PERSONAL_BLOG destination', () => {
  const html = 'Welcome to my personal blog and diary where I write about life, thoughts, and personal travels.';
  const res = detectWebsiteNegativeSignals(html, 200, 1);
  assert.ok(res.signals.includes('PERSONAL_BLOG'));
});

test('Detects BROKEN_SITE on HTTP error codes', () => {
  const res = detectWebsiteNegativeSignals('Not Found', 404, 0);
  assert.ok(res.signals.includes('BROKEN_SITE'));
});

// 2. Final Status Engine
test('Status: VERIFIED_BUSINESS_WEBSITE requires reachable + strong/moderate identity + commercial signals', () => {
  const status = determineFinalWebsiteStatus(
    true, // reachable
    false, // not blocked
    'STRONG', // identity
    3, // commercial signals
    [] // no negative signals
  );
  assert.strictEqual(status, 'VERIFIED_BUSINESS_WEBSITE');
});

test('Status: LIKELY_BUSINESS_WEBSITE when commercial signals exist but identity is moderate or incomplete', () => {
  const status = determineFinalWebsiteStatus(
    true,
    false,
    'UNKNOWN',
    2,
    []
  );
  assert.strictEqual(status, 'LIKELY_BUSINESS_WEBSITE');
});

test('Status: UNCERTAIN_WEBSITE when evidence is sparse or ambiguous', () => {
  const status = determineFinalWebsiteStatus(
    true,
    false,
    'WEAK',
    0,
    []
  );
  assert.strictEqual(status, 'UNCERTAIN_WEBSITE');
});

test('Status: NOT_A_BUSINESS_SITE when parked, directory, job portal, or contradictory identity detected', () => {
  const statusParked = determineFinalWebsiteStatus(
    true,
    false,
    'UNKNOWN',
    0,
    ['PARKED_DOMAIN', 'DOMAIN_FOR_SALE']
  );
  assert.strictEqual(statusParked, 'NOT_A_BUSINESS_SITE');

  const statusContradictory = determineFinalWebsiteStatus(
    true,
    false,
    'CONTRADICTORY',
    1,
    []
  );
  assert.strictEqual(statusContradictory, 'NOT_A_BUSINESS_SITE');
});

test('Status: BLOCKED when security challenge or access barrier detected', () => {
  const status = determineFinalWebsiteStatus(
    true,
    true, // isBlocked
    'STRONG',
    3,
    []
  );
  assert.strictEqual(status, 'BLOCKED');
});

test('Status: INVALID when domain is unreachable or network failed', () => {
  const status = determineFinalWebsiteStatus(
    false, // unreachable
    false,
    'UNKNOWN',
    0,
    ['BROKEN_SITE']
  );
  assert.strictEqual(status, 'INVALID');
});

console.log(`\nWebsite negative signals & status suite complete. Passed: ${passCount}/11 checks.\n`);
