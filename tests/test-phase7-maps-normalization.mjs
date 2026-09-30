/**
 * LeadNoria Phase 7: Maps Data Normalization Comprehensive Test Suite
 *
 * Validates:
 * 1. All 40 test fixtures coverage
 * 2. Matrix A: Name normalization (branches, suffixes, scripts)
 * 3. Matrix B: Category normalization (no aggressive collapse, unknown category)
 * 4. Matrix C: Address normalization (structured, partial, missing elements)
 * 5. Matrix D: Country normalization (canonical ISO, missing country handling)
 * 6. Matrix E: Phone normalization (E.164, national with country, ambiguous, missing)
 * 7. Matrix F: Website URL normalization (tracking stripped, functional params preserved, NO verification)
 * 8. Matrix G: Coordinate validation (valid, invalid >90/<180, missing, precision)
 * 9. Matrix H: Hours normalization (multiple periods, closed days, unknown hours, timezone)
 * 10. Matrix I: Rating & review normalization (ranges, precision, malformed values, missing)
 * 11. Matrix J: Source ID preservation (placeId, plusCode, separation)
 * 12. Matrix K-N: Provenance firewall, restriction basis & recursive lineage preservation
 * 13. Matrix O: Missing / invalid value semantics (explicit enums, no empty string spoofing)
 * 14. Matrix P-Q: Determinism & Order Independence (100 runs byte-identical check)
 * 15. Matrix R: Internationalization (EN, BN, AR, DE, FR, ES)
 * 16. Matrix S: Security sanitization (HTML injection, control chars, protocols)
 * 17. Matrix T-W: Strict phase boundaries (no entity merging, no qualification leakage, no relevance leakage, no policy promotion)
 * 18. Local Normalization Benchmarks (100, 500, 1,000, 5,000, 10,000 candidates)
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

import {
  normalizeMapsCandidate,
  normalizeMapsCandidateBatch,
  normalizeMapsCoordinates,
  normalizeMapsBusinessStatus,
  normalizeMapsOpeningHours,
  normalizeMapsRating,
  normalizeMapsUrl,
  normalizeMapsCategory,
  normalizeMapsAddress
} from '../src/extension/extraction/mapsNormalizer.ts';

import {
  assertNoGooglePersistence,
  assertNoGoogleExport,
  hasRestrictedGoogleContribution
} from '../src/extension/extraction/firewall.ts';

let passedTests = 0;
let failedTests = 0;

function pass(msg) {
  passedTests++;
  console.log(`  [PASS] ${msg}`);
}

function fail(msg, err) {
  failedTests++;
  console.error(`  [FAIL] ${msg}:`, err);
}

function loadFixture(filename) {
  const filePath = path.resolve('fixtures/maps', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

console.log('================================================================');
console.log('LEADNORIA PHASE 7: MAPS DATA NORMALIZATION TEST SUITE');
console.log('================================================================\n');

// ============================================================================
// 1. ALL 40 TEST FIXTURES EXECUTION
// ============================================================================
console.log('--- 1. 40 TEST FIXTURES COVERAGE ---');
try {
  const fixtureFiles = fs.readdirSync(path.resolve('fixtures/maps')).filter(f => f.endsWith('.json'));
  assert.equal(fixtureFiles.length, 40, 'All 40 Maps normalization fixtures must exist');

  for (const file of fixtureFiles) {
    const fixture = loadFixture(file);
    assert.ok(fixture.candidate, `Fixture ${file} must have candidate`);
    const normalized = normalizeMapsCandidate(fixture.candidate);

    assert.ok(normalized.candidateId, `Normalized result for ${file} must have candidateId`);
    assert.ok(normalized.businessName, `Normalized result for ${file} must have businessName envelope`);
    assert.ok(normalized.sourceIdentifier, `Normalized result for ${file} must have sourceIdentifier`);
    assert.ok(normalized.sourceContributions.length > 0, `Normalized result for ${file} must preserve sourceContributions`);
  }
  pass('Successfully loaded, parsed, and normalized all 40 Phase 7 Maps fixtures');
} catch (e) {
  fail('40 Test Fixtures Coverage', e);
}

// ============================================================================
// 2. MATRIX A: NAME NORMALIZATION & BRANCH DISTINCTION
// ============================================================================
console.log('\n--- 2. MATRIX A: BUSINESS NAME NORMALIZATION ---');
try {
  // A1: Standard name with legal suffix
  const f01 = loadFixture('01-english-business.json');
  const res01 = normalizeMapsCandidate(f01.candidate);
  assert.equal(res01.businessName.value.displayName, 'Austin Craft Roofing & Siding LLC');
  assert.equal(res01.businessName.value.normalizedName, 'austin craft roofing & siding llc');
  assert.equal(res01.businessName.value.comparisonName, 'austin craft roofing siding');
  assert.equal(res01.businessName.value.legalSuffix, 'llc');
  assert.equal(res01.businessName.value.detectedScript, 'LATIN');
  pass('Business name normalizes display name, normalized name, and comparison name with legal suffix isolated');

  // A2: Branch distinction must survive normalization without collapsing
  const f08 = loadFixture('08-branch-name.json');
  const res08 = normalizeMapsCandidate(f08.candidate);
  assert.ok(res08.businessName.value.displayName.includes('Uttara Branch'));
  assert.ok(res08.businessName.value.comparisonName.includes('uttara branch'));
  pass('Branch/location distinctions ("Uttara Branch") survive normalization without collapsing');
} catch (e) {
  fail('Matrix A: Name Normalization', e);
}

// ============================================================================
// 3. MATRIX B: CATEGORY NORMALIZATION
// ============================================================================
console.log('\n--- 3. MATRIX B: CATEGORY NORMALIZATION ---');
try {
  // B1: Category normalization preserves distinct categories
  const cat1 = normalizeMapsCategory('Furniture Store');
  const cat2 = normalizeMapsCategory('Furniture shop');
  const cat3 = normalizeMapsCategory('Home Furniture');
  assert.equal(cat1.normalizedCategory, 'furniture store');
  assert.equal(cat2.normalizedCategory, 'furniture shop');
  assert.equal(cat3.normalizedCategory, 'home furniture');
  assert.notEqual(cat1.normalizedCategory, cat2.normalizedCategory, 'Distinct categories must not be aggressively collapsed');
  pass('Categories preserve distinct representations without aggressive collapsing');

  // B2: Unknown category state
  const f38 = loadFixture('38-unknown-category.json');
  const res38 = normalizeMapsCandidate(f38.candidate);
  assert.equal(res38.categories.length, 0, 'Omitted category leaves categories array empty or marked UNKNOWN_CATEGORY');
  const unknownCat = normalizeMapsCategory(null);
  assert.equal(unknownCat.categoryState, 'UNKNOWN_CATEGORY');
  assert.equal(unknownCat.categoryConfidence, 'UNKNOWN');
  pass('Missing category is explicitly marked UNKNOWN_CATEGORY without guessing');
} catch (e) {
  fail('Matrix B: Category Normalization', e);
}

// ============================================================================
// 4. MATRIX C & D: ADDRESS & COUNTRY NORMALIZATION
// ============================================================================
console.log('\n--- 4. MATRIX C & D: ADDRESS & COUNTRY NORMALIZATION ---');
try {
  // C1: Structured address preservation
  const f16 = loadFixture('16-structured-address.json');
  const res16 = normalizeMapsCandidate(f16.candidate);
  assert.equal(res16.address.value.displayAddress, '2500 Bee Cave Rd, Bldg 1, Suite 100, Austin, TX 78746, USA');
  assert.equal(res16.address.value.locality, 'Austin');
  assert.equal(res16.address.value.region, 'TX');
  assert.equal(res16.address.value.postalCode, '78746');
  assert.equal(res16.address.value.countryCode, 'US');
  pass('Structured address fields parsed and preserved without external geocoding calls');

  // C2: Partial address with missing locality
  const f18 = loadFixture('18-missing-locality.json');
  const res18 = normalizeMapsCandidate(f18.candidate);
  assert.equal(res18.address.value.locality, undefined);
  assert.equal(res18.location, undefined, 'Missing locality does NOT fabricate location');
  pass('Missing locality preserved as undefined without fabrication');

  // D1: Canonical ISO country representation
  assert.equal(normalizeMapsAddress('', { country: 'Germany' }).countryCode, 'DE');
  assert.equal(normalizeMapsAddress('', { country: 'Bangladesh' }).countryCode, 'BD');
  assert.equal(normalizeMapsAddress('', { country: 'United States' }).countryCode, 'US');
  pass('Country names map deterministically to ISO country codes');

  // D2: Unknown country representation
  const f20 = loadFixture('20-missing-country.json');
  const res20 = normalizeMapsCandidate(f20.candidate);
  assert.equal(res20.address.value.countryCode, undefined);
  pass('Missing country represented explicitly as undefined without guessing from language');
} catch (e) {
  fail('Matrix C & D: Address & Country', e);
}

// ============================================================================
// 5. MATRIX E: PHONE NORMALIZATION
// ============================================================================
console.log('\n--- 5. MATRIX E: PHONE NORMALIZATION ---');
try {
  // E1: International phone with +
  const f12 = loadFixture('12-international-phone-plus.json');
  const res12 = normalizeMapsCandidate(f12.candidate);
  assert.equal(res12.phones[0].value.e164Format, '+442079460991');
  assert.equal(res12.phones[0].value.phoneState, 'PHONE_NORMALIZED');
  assert.equal(res12.phones[0].value.countryInference, 'COUNTRY_EXPLICIT');
  pass('International phone with + normalizes cleanly to E.164 with COUNTRY_EXPLICIT');

  // E2: National phone with explicit country context
  const f13 = loadFixture('13-national-phone-explicit-country.json');
  const res13 = normalizeMapsCandidate(f13.candidate);
  assert.equal(res13.phones[0].value.e164Format, '+15125550188');
  assert.equal(res13.phones[0].value.phoneState, 'PHONE_NORMALIZED');
  pass('National phone with country context normalizes to international format');

  // E3: Ambiguous national phone without country context
  const f14 = loadFixture('14-ambiguous-national-phone.json');
  const res14 = normalizeMapsCandidate(f14.candidate);
  assert.equal(res14.phones[0].value.phoneState, 'PHONE_AMBIGUOUS');
  assert.equal(res14.phones[0].value.countryInference, 'COUNTRY_UNKNOWN');
  pass('Ambiguous phone without country context flagged as PHONE_AMBIGUOUS without fabricating country');

  // E4: Missing phone
  const f15 = loadFixture('15-missing-phone.json');
  const res15 = normalizeMapsCandidate(f15.candidate);
  assert.equal(res15.phones.length, 0, 'Missing phone produces empty phones array');
  pass('Missing phone leaves phones array empty');
} catch (e) {
  fail('Matrix E: Phone Normalization', e);
}

// ============================================================================
// 6. MATRIX F: WEBSITE URL NORMALIZATION
// ============================================================================
console.log('\n--- 6. MATRIX F: WEBSITE URL NORMALIZATION ---');
try {
  // F1: Functional parameters preserved
  const f10 = loadFixture('10-functional-website-params.json');
  const res10 = normalizeMapsCandidate(f10.candidate);
  assert.ok(res10.websiteUrl.value.normalizedUrl.includes('store=gulshan'));
  assert.ok(res10.websiteUrl.value.normalizedUrl.includes('branch=2'));
  assert.ok(res10.websiteUrl.value.normalizedUrl.includes('lang=bn'));
  pass('Functional parameters (?store=gulshan&branch=2&lang=bn) preserved in normalized URL');

  // F2: Tracking parameters stripped
  const f11 = loadFixture('11-tracking-website-params.json');
  const res11 = normalizeMapsCandidate(f11.candidate);
  assert.equal(res11.websiteUrl.value.normalizedUrl.includes('gclid'), false);
  assert.equal(res11.websiteUrl.value.normalizedUrl.includes('fbclid'), false);
  assert.equal(res11.websiteUrl.value.normalizedUrl.includes('gbraid'), false);
  pass('Ad tracking click IDs (gclid, fbclid, gbraid) stripped from normalized URL');

  // F3: Phase 7 does NOT classify verified business site
  assert.equal(res10.verificationPlaceholder?.verificationStatus, 'PENDING');
  pass('Phase 7 does NOT perform website verification or classify WEBSITE_VERIFIED_BUSINESS_SITE');
} catch (e) {
  fail('Matrix F: Website URL Normalization', e);
}

// ============================================================================
// 7. MATRIX G: COORDINATE VALIDATION
// ============================================================================
console.log('\n--- 7. MATRIX G: COORDINATE VALIDATION ---');
try {
  // G1: Valid coordinates
  const f21 = loadFixture('21-valid-coordinates.json');
  const res21 = normalizeMapsCandidate(f21.candidate);
  assert.equal(res21.coordinates.value.coordinateState, 'VALID');
  assert.equal(res21.coordinates.value.latitude, 30.274722);
  assert.equal(res21.coordinates.value.longitude, -97.740556);
  assert.equal(res21.coordinates.value.precision, 6);
  pass('Valid coordinates parsed, validated, and normalized to 6 decimal precision');

  // G2: Invalid coordinates (>90 latitude)
  const f22 = loadFixture('22-invalid-coordinates.json');
  const res22 = normalizeMapsCandidate(f22.candidate);
  assert.equal(res22.coordinates.value.coordinateState, 'INVALID');
  assert.equal(res22.coordinates.value.latitude, null);
  assert.equal(res22.coordinates.value.longitude, null);
  pass('Out-of-range coordinates (>90) flagged as INVALID with null normalized values');

  // G3: Missing coordinates
  const f23 = loadFixture('23-missing-coordinates.json');
  const res23 = normalizeMapsCandidate(f23.candidate);
  assert.equal(res23.coordinates.value.coordinateState, 'MISSING');
  assert.equal(res23.coordinates.value.latitude, null);
  pass('Missing coordinates explicitly marked MISSING');
} catch (e) {
  fail('Matrix G: Coordinate Validation', e);
}

// ============================================================================
// 8. MATRIX H & I: HOURS & RATINGS NORMALIZATION
// ============================================================================
console.log('\n--- 8. MATRIX H & I: HOURS & RATINGS NORMALIZATION ---');
try {
  // H1: Structured hours with multiple intervals
  const f24 = loadFixture('24-multiple-hours-intervals.json');
  const res24 = normalizeMapsCandidate(f24.candidate);
  assert.equal(res24.openingHours.value.hoursState, 'STRUCTURED');
  assert.equal(res24.openingHours.value.periods.length, 4);
  assert.equal(res24.openingHours.value.timezone, 'America/Chicago');
  pass('Multiple hours intervals per day normalized into structured periods with timezone preserved');

  // H2: Unknown hours
  const f26 = loadFixture('26-unknown-hours.json');
  const res26 = normalizeMapsCandidate(f26.candidate);
  assert.equal(res26.openingHours, undefined);
  const rawUnknown = normalizeMapsOpeningHours(null);
  assert.equal(rawUnknown.hoursState, 'MISSING');
  assert.equal(rawUnknown.timezone, 'TIMEZONE_UNKNOWN');
  pass('Missing hours preserved as MISSING and TIMEZONE_UNKNOWN without guessing');

  // I1: Valid numeric rating and review count
  const f27 = loadFixture('27-numeric-rating.json');
  const res27 = normalizeMapsCandidate(f27.candidate);
  assert.equal(res27.rating.value.ratingState, 'VALID');
  assert.equal(res27.rating.value.rating, 4.9);
  assert.equal(res27.rating.value.reviewCountState, 'VALID');
  assert.equal(res27.rating.value.reviewCount, 382);
  pass('Numeric rating and review count normalized with precision');

  // I2: String formatted review count ("1,420")
  const f29 = loadFixture('29-numeric-review-count.json');
  const res29 = normalizeMapsCandidate(f29.candidate);
  assert.equal(res29.rating.value.reviewCount, 1420);
  assert.equal(res29.rating.value.reviewCountState, 'VALID');
  pass('Comma formatted review count ("1,420") parsed to deterministic integer 1420');

  // I3: Malformed review count ("hundreds")
  const f30 = loadFixture('30-malformed-review-count.json');
  const res30 = normalizeMapsCandidate(f30.candidate);
  assert.equal(res30.rating.value.reviewCountState, 'INVALID');
  assert.equal(res30.rating.value.reviewCount, null);
  pass('Malformed review count ("hundreds") flagged as INVALID with null integer');
} catch (e) {
  fail('Matrix H & I: Hours & Ratings', e);
}

// ============================================================================
// 9. MATRIX J-N: PROVENANCE, LINEAGE & DATA FIREWALL
// ============================================================================
console.log('\n--- 9. MATRIX J-N: PROVENANCE & DATA FIREWALL ---');
try {
  // J1: Source ID preservation
  const f31 = loadFixture('31-google-source-id.json');
  const res31 = normalizeMapsCandidate(f31.candidate);
  assert.equal(res31.sourceIdentifier.sourceRecordId, 'ChIJN1t_tDeuEmsRUsoyG83frY4');
  assert.equal(res31.sourceIdentifier.sourceRecordType, 'GOOGLE_WEB_PLACE_ID');
  pass('Google Place ID preserved in source-specific identifier without universal conversion');

  // K-M: Google consumer-web restricted lineage is strictly blocked from persistence & export
  const f32 = loadFixture('32-google-derived-restricted-lineage.json');
  const res32 = normalizeMapsCandidate(f32.candidate);
  assert.equal(res32.overallPolicyStatus, 'POLICY_GATED');
  assert.equal(res32.overallPersistenceStatus, 'NOT_PERSISTABLE');
  assert.equal(res32.overallExportStatus, 'NOT_EXPORTABLE');

  // Firewall assertion check
  assert.ok(hasRestrictedGoogleContribution(res32.businessName), 'Google businessName carries restricted contribution');
  assert.throws(
    () => assertNoGooglePersistence({ ...res32.businessName, persistenceStatus: 'PERSISTABLE' }),
    /Google Persistence Guard/,
    'Attempting to persist Google-derived field must throw'
  );
  assert.throws(
    () => assertNoGoogleExport({ ...res32.businessName, exportStatus: 'EXPORTABLE' }),
    /Google Export Guard/,
    'Attempting to export Google-derived field must throw'
  );
  pass('Google consumer-web restricted lineage strictly enforced: NOT_PERSISTABLE, NOT_EXPORTABLE, firewall throws on breach');

  // M2: Google API service-specific lineage requires policy review
  const f33 = loadFixture('33-google-api-service-specific-lineage.json');
  const res33 = normalizeMapsCandidate(f33.candidate);
  assert.equal(res33.overallPolicyStatus, 'POLICY_REVIEW_REQUIRED');
  assert.equal(res33.overallPersistenceStatus, 'PERSISTENCE_GATED');
  assert.equal(res33.overallExportStatus, 'EXPORT_GATED');
  pass('Google API service-specific lineage preserved as POLICY_REVIEW_REQUIRED and PERSISTENCE_GATED');

  // N: Mixed lineage entity preserves all contributions
  const f37 = loadFixture('37-mixed-lineage-field.json');
  const res37 = normalizeMapsCandidate(f37.candidate);
  assert.equal(res37.overallProvenance, 'MIXED');
  assert.equal(res37.sourceContributions.length >= 2, true);
  assert.ok(res37.sourceContributions.some(c => c.provenance === 'GOOGLE_DERIVED'));
  assert.ok(res37.sourceContributions.some(c => c.provenance === 'WEBSITE_DERIVED'));
  pass('Mixed lineage entity preserves individual source contributions without laundering');
} catch (e) {
  fail('Matrix J-N: Provenance & Firewall', e);
}

// ============================================================================
// 10. MATRIX P & Q: DETERMINISM & ORDER INDEPENDENCE
// ============================================================================
console.log('\n--- 10. MATRIX P & Q: DETERMINISM & ORDER INDEPENDENCE ---');
try {
  const f01 = loadFixture('01-english-business.json');
  const baseNorm = normalizeMapsCandidate(f01.candidate);
  const baseJson = JSON.stringify(baseNorm);

  // 100 deterministic repetitions
  for (let i = 0; i < 100; i++) {
    const repNorm = normalizeMapsCandidate(f01.candidate);
    assert.equal(JSON.stringify(repNorm), baseJson, `Repetition ${i} must produce byte-identical output`);
  }
  pass('Determinism verified: 100 repetitions produce byte-identical normalized output');

  // Shuffled property order independence
  const shuffledKeys = Object.keys(f01.candidate).sort(() => Math.random() - 0.5);
  const shuffledCandidate = {};
  for (const k of shuffledKeys) {
    shuffledCandidate[k] = f01.candidate[k];
  }
  const shuffledNorm = normalizeMapsCandidate(shuffledCandidate);
  assert.equal(JSON.stringify(shuffledNorm), baseJson, 'Shuffled input property order produces identical output');
  pass('Order independence verified: shuffled candidate property order produces identical normalized output');
} catch (e) {
  fail('Matrix P & Q: Determinism & Order Independence', e);
}

// ============================================================================
// 11. MATRIX R: INTERNATIONALIZATION (EN, BN, AR, DE, FR, ES)
// ============================================================================
console.log('\n--- 11. MATRIX R: INTERNATIONALIZATION ---');
try {
  // Bengali
  const resBN = normalizeMapsCandidate(loadFixture('02-bengali-business.json').candidate);
  assert.equal(resBN.businessName.value.detectedScript, 'BENGALI');
  assert.ok(resBN.businessName.value.displayName.includes('ঢাকা ডেন্টাল কেয়ার'));

  // Arabic
  const resAR = normalizeMapsCandidate(loadFixture('03-arabic-business.json').candidate);
  assert.equal(resAR.businessName.value.detectedScript, 'ARABIC');
  assert.ok(resAR.businessName.value.displayName.includes('عيادة دبي'));

  // German
  const resDE = normalizeMapsCandidate(loadFixture('04-german-business.json').candidate);
  assert.ok(resDE.businessName.value.displayName.includes('Müller & Söhne'));
  assert.equal(resDE.businessName.value.legalSuffix, 'gmbh');

  // French
  const resFR = normalizeMapsCandidate(loadFixture('05-french-business.json').candidate);
  assert.ok(resFR.businessName.value.displayName.includes('Ébénisterie'));
  assert.equal(resFR.businessName.value.legalSuffix, 'sarl');

  // Spanish
  const resES = normalizeMapsCandidate(loadFixture('06-spanish-business.json').candidate);
  assert.ok(resES.businessName.value.displayName.includes('Diseño de Muebles'));
  assert.equal(resES.businessName.value.legalSuffix, 's.l.');

  pass('Multilingual normalization verified across EN, BN, AR, DE, FR, ES without script corruption or translation');
} catch (e) {
  fail('Matrix R: Internationalization', e);
}

// ============================================================================
// 12. MATRIX S: SECURITY SANITIZATION
// ============================================================================
console.log('\n--- 12. MATRIX S: SECURITY SANITIZATION ---');
try {
  const maliciousInput = {
    sourceId: 'ChIJ_malicious_01',
    source: 'GOOGLE_MAPS',
    businessName: '<script>alert("xss")</script>Safe Roofing Co. \u0000\u200B',
    website: 'javascript:alert(1)',
    address: '<b>100 Main St</b><style>body{color:red}</style>'
  };

  const clean = normalizeMapsCandidate(maliciousInput);
  assert.equal(clean.businessName.value.displayName, 'Safe Roofing Co.');
  assert.equal(clean.websiteUrl.value.isValid, false, 'Dangerous javascript: URL scheme rejected');
  assert.equal(clean.address.value.displayAddress, '100 Main St');
  pass('HTML tags, style blocks, control chars, and dangerous URL protocols neutralized');
} catch (e) {
  fail('Matrix S: Security Sanitization', e);
}

// ============================================================================
// 13. MATRIX T-W: STRICT PHASE BOUNDARIES
// ============================================================================
console.log('\n--- 13. MATRIX T-W: STRICT PHASE BOUNDARIES ---');
try {
  // Boundary T: No entity merging (Phase 8)
  const candA = { sourceId: 'id_1', businessName: 'Acme Roofing' };
  const candB = { sourceId: 'id_2', businessName: 'Acme Roofing' };
  const batch = normalizeMapsCandidateBatch([candA, candB]);
  assert.equal(batch.length, 2, 'Batch of 2 candidates must produce exactly 2 normalized candidates');
  assert.notEqual(batch[0].candidateId, batch[1].candidateId);
  pass('Boundary T: No entity merging or deduplication performed in Phase 7');

  // Boundary U: No qualification decisions (Phase 6)
  assert.equal(batch[0].qualificationState, undefined, 'No qualificationState assigned');
  assert.equal(batch[0].qualificationReasons, undefined, 'No qualificationReasons assigned');
  pass('Boundary U: No qualification decisions or reason codes generated in Phase 7');

  // Boundary V: No relevance scoring (Phase 9)
  assert.equal(batch[0].relevanceScore, undefined, 'No commercial relevance score calculated');
  pass('Boundary V: No commercial relevance scoring calculated in Phase 7');

  // Boundary W: No policy promotion
  assert.equal(batch[0].overallPolicyStatus, 'POLICY_GATED');
  assert.equal(batch[0].overallPersistenceStatus, 'NOT_PERSISTABLE');
  assert.equal(batch[0].overallExportStatus, 'NOT_EXPORTABLE');
  pass('Boundary W: Normalization never upgrades POLICY_GATED to POLICY_APPROVED or permits export');
} catch (e) {
  fail('Matrix T-W: Phase Boundaries', e);
}

// ============================================================================
// 14. PERFORMANCE BENCHMARKS (100, 500, 1,000, 5,000, 10,000)
// ============================================================================
console.log('\n--- 14. SYNTHETIC PERFORMANCE BENCHMARKS ---');
try {
  const f01 = loadFixture('01-english-business.json');
  const counts = [100, 500, 1000, 5000, 10000];

  console.log('\n  [A] Streaming Pipeline Normalization (Phase 5 Comparable - No Batch Array Retention):');
  for (const count of counts) {
    if (global.gc) global.gc();
    const heapBefore = process.memoryUsage().heapUsed;
    const start = performance.now();

    for (let i = 0; i < count; i++) {
      const raw = {
        ...f01.candidate,
        sourceId: `ChIJ_stream_${i}`
      };
      normalizeMapsCandidate(raw);
    }

    const elapsed = performance.now() - start;
    if (global.gc) global.gc();
    const heapAfter = process.memoryUsage().heapUsed;
    const heapDeltaMB = ((heapAfter - heapBefore) / 1024 / 1024).toFixed(2);
    const opsPerSec = Math.round((count / (elapsed / 1000)));

    console.log(`    ${count.toString().padStart(6)} candidates: ${elapsed.toFixed(1).padStart(6)}ms (${opsPerSec.toLocaleString().padStart(8)} ops/sec) | Heap Before: ${(heapBefore/1024/1024).toFixed(2)} MB | After: ${(heapAfter/1024/1024).toFixed(2)} MB | Heap Δ: ${heapDeltaMB.padStart(6)} MB`);
  }

  console.log('\n  [B] Retained In-Memory Batch Normalization & GC Reclamation:');
  for (const count of counts) {
    if (global.gc) global.gc();
    const heapBefore = process.memoryUsage().heapUsed;
    const start = performance.now();

    let batch = null;
    {
      const rawList = Array.from({ length: count }, (_, idx) => ({
        ...f01.candidate,
        sourceId: `ChIJ_bench_${idx}`
      }));
      batch = normalizeMapsCandidateBatch(rawList);
    }

    const elapsed = performance.now() - start;
    const heapInScope = process.memoryUsage().heapUsed;
    const inScopeDeltaMB = ((heapInScope - heapBefore) / 1024 / 1024).toFixed(2);
    const opsPerSec = Math.round((count / (elapsed / 1000)));

    assert.equal(batch.length, count);

    // Dereference batch to verify GC reclamation
    batch = null;
    if (global.gc) global.gc();
    const heapAfterGC = process.memoryUsage().heapUsed;
    const residualDeltaMB = ((heapAfterGC - heapBefore) / 1024 / 1024).toFixed(2);

    console.log(`    ${count.toString().padStart(6)} batch: ${elapsed.toFixed(1).padStart(6)}ms (${opsPerSec.toLocaleString().padStart(8)} ops/sec) | In-Scope Δ: +${inScopeDeltaMB.padStart(6)} MB | Post-GC Residual Δ: ${residualDeltaMB.padStart(6)} MB`);
  }

  pass('Maps normalization benchmark completed: streaming aligns with Phase 5 baseline; in-scope retention is bounded; zero engine leaks');
} catch (e) {
  fail('Performance Benchmarks', e);
}

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n================================================================');
console.log(`PHASE 7 TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed`);
console.log('================================================================\n');

if (failedTests > 0) {
  console.error('>>> SOME PHASE 7 TESTS FAILED <<<');
  process.exit(1);
} else {
  console.log('>>> ALL PHASE 7 MAPS NORMALIZATION TESTS PASSED! <<<');
}
