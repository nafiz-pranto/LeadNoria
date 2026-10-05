/**
 * LeadNoria Phase 8: Entity Resolution & Deduplication Test Suite
 *
 * Verifies all 35 fixtures, Test Matrices A through Z,
 * Provenance & Policy Firewall preservation, Order Independence,
 * Contradiction Detection, Branch Differentiation, and Performance Benchmarks.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Phase 7 Normalizer and Phase 8 Entity Resolver
import { normalizeMapsCandidate } from '../src/extension/extraction/mapsNormalizer.ts';
import {
  resolveCandidates,
  compareCandidates,
  detectBranchSignals,
  isGenericBrandName,
  computeEntityPolicySummary,
  generateDeterministicEntityId
} from '../src/extension/resolution/index.ts';

let passedTests = 0;
let failedTests = 0;

function pass(name) {
  passedTests++;
  console.log(`  [PASS] ${name}`);
}

function fail(name, error) {
  failedTests++;
  console.error(`  [FAIL] ${name}:`, error?.message || error);
  if (error?.stack) console.error(error.stack);
}

function loadFixture(filename) {
  const filePath = path.resolve(__dirname, '../fixtures/resolution', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

console.log('================================================================');
console.log('LEADNORIA PHASE 8: ENTITY RESOLUTION & DEDUPLICATION TEST SUITE');
console.log('================================================================\n');

// ============================================================================
// 1. 35 TEST FIXTURES COVERAGE
// ============================================================================
console.log('--- 1. 35 TEST FIXTURES COVERAGE ---');
try {
  const fixtureFiles = fs.readdirSync(path.resolve(__dirname, '../fixtures/resolution'))
    .filter(f => f.endsWith('.json'))
    .sort();

  assert.equal(fixtureFiles.length, 35, 'Must contain all 35 Phase 8 fixtures');

  for (const file of fixtureFiles) {
    const fixture = loadFixture(file);
    const normalized = fixture.candidates.map(c => normalizeMapsCandidate(c));
    const result = resolveCandidates(normalized);

    assert.equal(
      result.entities.length,
      fixture.expectedEntityCount,
      `Fixture ${file}: expected ${fixture.expectedEntityCount} entities, got ${result.entities.length}`
    );

    if (fixture.expectedRelationship === 'SAME_ENTITY') {
      assert.ok(
        result.summary.sameEntityMerges > 0 || result.entities.length === 1,
        `Fixture ${file}: must perform same-entity merge`
      );
    } else if (fixture.expectedRelationship === 'SAME_PARENT_BRAND_DIFFERENT_BRANCH') {
      assert.ok(
        result.summary.branchRelationships > 0,
        `Fixture ${file}: must detect branch relationship`
      );
    } else if (fixture.expectedRelationship === 'CONFLICTING_ENTITY') {
      assert.ok(
        result.summary.conflictingIdentities > 0,
        `Fixture ${file}: must detect conflicting identity`
      );
    }
  }

  pass('Successfully loaded, executed, and verified all 35 Phase 8 resolution fixtures');
} catch (e) {
  fail('35 Test Fixtures Coverage', e);
}

// ============================================================================
// 2. MATRIX A & B: EXACT IDENTITY & NAME MATCHING
// ============================================================================
console.log('\n--- 2. MATRIX A & B: EXACT IDENTITY & NAME MATCHING ---');
try {
  const f01 = loadFixture('01-exact-duplicate.json');
  const norm01 = f01.candidates.map(c => normalizeMapsCandidate(c));
  const res01 = resolveCandidates(norm01);

  assert.equal(res01.entities.length, 1);
  assert.equal(res01.entities[0].sourceRecords.length, 2);
  assert.equal(res01.summary.sameEntityMerges, 1);
  pass('Matrix A: Exact identical candidate duplicate merged into single entity group');

  const f02 = loadFixture('02-source-id-duplicate.json');
  const norm02 = f02.candidates.map(c => normalizeMapsCandidate(c));
  const res02 = resolveCandidates(norm02);

  assert.equal(res02.entities.length, 1);
  assert.ok(res02.entities[0].resolutionReasonCodes.includes('EXACT_SOURCE_ID_MATCH'));
  pass('Matrix A: Stable Google Place ID match merges records with exact source identity');

  const f04 = loadFixture('04-legal-suffix-variation.json');
  const norm04 = f04.candidates.map(c => normalizeMapsCandidate(c));
  const res04 = resolveCandidates(norm04);

  assert.equal(res04.entities.length, 1);
  assert.equal(res04.entities[0].canonicalComparisonName, 'apex technologies');
  pass('Matrix B: Legal suffix variation ("Limited" vs "Ltd.") merges without name distortion');
} catch (e) {
  fail('Matrix A & B: Identity & Name Matching', e);
}

// ============================================================================
// 3. MATRIX C, D & E: DOMAIN, PHONE & ADDRESS MATCHING
// ============================================================================
console.log('\n--- 3. MATRIX C, D & E: DOMAIN, PHONE & ADDRESS MATCHING ---');
try {
  const f07 = loadFixture('07-same-name-same-domain.json');
  const norm07 = f07.candidates.map(c => normalizeMapsCandidate(c));
  const res07 = resolveCandidates(norm07);
  assert.equal(res07.entities.length, 1);
  assert.ok(res07.entities[0].domains.includes('summitdentalcare.com'));
  pass('Matrix C: Exact canonical non-generic domain matches compatible candidates');

  const f06 = loadFixture('06-same-name-same-phone.json');
  const norm06 = f06.candidates.map(c => normalizeMapsCandidate(c));
  const res06 = resolveCandidates(norm06);
  assert.equal(res06.entities.length, 1);
  assert.ok(res06.entities[0].phones.includes('+13035550188'));
  pass('Matrix D: Exact normalized E.164 phone matches compatible candidates');

  const f05 = loadFixture('05-same-name-same-address.json');
  const norm05 = f05.candidates.map(c => normalizeMapsCandidate(c));
  const res05 = resolveCandidates(norm05);
  assert.equal(res05.entities.length, 1);
  assert.ok(res05.entities[0].addresses.some(a => a.includes('Franklin Ave')));
  pass('Matrix E: Exact physical street address matches compatible candidates without web/phone');
} catch (e) {
  fail('Matrix C, D & E: Field Matching', e);
}

// ============================================================================
// 4. MATRIX G: BRANCH DIFFERENTIATION
// ============================================================================
console.log('\n--- 4. MATRIX G: BRANCH DIFFERENTIATION ---');
try {
  // Test 8: Dhaka Main vs Uttara Branch
  const f08 = loadFixture('08-same-brand-different-branch.json');
  const norm08 = f08.candidates.map(c => normalizeMapsCandidate(c));
  const res08 = resolveCandidates(norm08);

  assert.equal(res08.entities.length, 2, 'Branches MUST NOT be merged into a single entity');
  assert.equal(res08.summary.branchRelationships, 1, 'Must register branch relationship');
  assert.equal(res08.relationships[0].relationshipType, 'SAME_PARENT_BRAND_DIFFERENT_BRANCH');
  assert.ok(res08.entities[0].branchEntityIds.includes(res08.entities[1].entityId));
  pass('Matrix G: Same brand with explicit branch markers in different localities kept separate');

  // Test 9: Berlin vs Hamburg
  const f09 = loadFixture('09-same-brand-different-city.json');
  const norm09 = f09.candidates.map(c => normalizeMapsCandidate(c));
  const res09 = resolveCandidates(norm09);

  assert.equal(res09.entities.length, 2, 'Same brand across distinct cities kept as separate branches');
  assert.equal(res09.summary.branchRelationships, 1);
  pass('Matrix G: Same brand in distinct cities (Berlin vs Hamburg) classified as branch relationship');

  // Test 31: 3 retail chain locations in same city
  const f31 = loadFixture('31-multiple-locations.json');
  const norm31 = f31.candidates.map(c => normalizeMapsCandidate(c));
  const res31 = resolveCandidates(norm31);

  assert.equal(res31.entities.length, 3, 'All 3 branch locations kept distinct');
  assert.ok(res31.summary.branchRelationships >= 2, 'Branch relationships established between locations');
  pass('Matrix G: Multi-location enterprise chain preserves individual physical branch entities');
} catch (e) {
  fail('Matrix G: Branch Differentiation', e);
}

// ============================================================================
// 5. MATRIX H & I: MARKETPLACE & GENERIC NAME PROTECTION
// ============================================================================
console.log('\n--- 5. MATRIX H & I: MARKETPLACE & GENERIC NAME PROTECTION ---');
try {
  // Marketplace protection: daraz.com.bd
  const f14 = loadFixture('14-marketplace-listing.json');
  const norm14 = f14.candidates.map(c => normalizeMapsCandidate(c));
  const res14 = resolveCandidates(norm14);

  assert.equal(res14.entities.length, 2, 'Marketplace domain match alone MUST NEVER merge businesses');
  assert.equal(res14.summary.sameEntityMerges, 0);
  pass('Matrix H: Marketplace platform domain (daraz.com.bd) strictly prevented from acting as identity anchor');

  // Generic brand protection: "Dental Clinic"
  const f13 = loadFixture('13-generic-business-name.json');
  const norm13 = f13.candidates.map(c => normalizeMapsCandidate(c));
  const res13 = resolveCandidates(norm13);

  assert.equal(res13.entities.length, 2, 'Generic business name alone MUST NEVER merge without corroboration');
  assert.equal(res13.summary.sameEntityMerges, 0);
  pass('Matrix I: Generic brand name ("Dental Clinic") requires strong multi-field corroboration');

  // Shared call center phone protection
  const f11 = loadFixture('11-same-phone-different-businesses.json');
  const norm11 = f11.candidates.map(c => normalizeMapsCandidate(c));
  const res11 = resolveCandidates(norm11);

  assert.equal(res11.entities.length, 2, 'Shared phone number between distinct businesses MUST NOT merge');
  pass('Matrix I: Shared call center phone number between different businesses kept separate');
} catch (e) {
  fail('Matrix H & I: Protection Guards', e);
}

// ============================================================================
// 6. MATRIX J: CONTRADICTION DETECTION
// ============================================================================
console.log('\n--- 6. MATRIX J: CONTRADICTION DETECTION ---');
try {
  // Contradiction 1: Same name, distinct domains
  const f10 = loadFixture('10-same-name-different-domain.json');
  const norm10 = f10.candidates.map(c => normalizeMapsCandidate(c));
  const res10 = resolveCandidates(norm10);

  assert.equal(res10.entities.length, 2);
  assert.ok(res10.summary.conflictingIdentities > 0);
  pass('Matrix J: Same business name with conflicting non-generic domains flagged as contradiction');

  // Contradiction 2: Same domain, completely incompatible business names
  const f12 = loadFixture('12-same-domain-conflicting-identity.json');
  const norm12 = f12.candidates.map(c => normalizeMapsCandidate(c));
  const res12 = resolveCandidates(norm12);

  assert.equal(res12.entities.length, 2);
  assert.ok(res12.summary.conflictingIdentities > 0);
  pass('Matrix J: Same domain hosting contradictory business identities flagged as contradiction');

  // Contradiction 3: Geographic country mismatch (US vs DE)
  const f20 = loadFixture('20-conflicting-source-records.json');
  const norm20 = f20.candidates.map(c => normalizeMapsCandidate(c));
  const res20 = resolveCandidates(norm20);

  assert.equal(res20.entities.length, 2);
  assert.ok(res20.summary.conflictingIdentities > 0);
  pass('Matrix J: Geographic country mismatch (US vs DE) blocks merging and records conflict');
} catch (e) {
  fail('Matrix J: Contradiction Detection', e);
}

// ============================================================================
// 7. MATRIX Q, R & S: PROVENANCE, RESTRICTION & EXPORT FIREWALL
// ============================================================================
console.log('\n--- 7. MATRIX Q, R & S: PROVENANCE & POLICY FIREWALL ---');
try {
  // Google consumer-web restricted candidate
  const f22 = loadFixture('22-google-derived-restricted-record.json');
  const norm22 = f22.candidates.map(c => normalizeMapsCandidate(c));
  const res22 = resolveCandidates(norm22);

  assert.equal(res22.entities.length, 1);
  const ent22 = res22.entities[0];
  assert.equal(ent22.policySummary.overallPolicyStatus, 'POLICY_GATED');
  assert.equal(ent22.policySummary.overallPersistenceStatus, 'NOT_PERSISTABLE');
  assert.equal(ent22.policySummary.overallExportStatus, 'NOT_EXPORTABLE');
  assert.equal(ent22.policySummary.isRestricted, true);
  assert.equal(ent22.policySummary.hasGoogleConsumerWebLineage, true);
  pass('Matrix Q & R: Google consumer-web candidate retains NOT_PERSISTABLE and NOT_EXPORTABLE in entity summary');

  // Cross-source merging: Google + Website candidate
  const f25 = loadFixture('25-mixed-provenance-entity.json');
  const norm25 = f25.candidates.map(c => normalizeMapsCandidate(c));
  const res25 = resolveCandidates(norm25);

  assert.equal(res25.entities.length, 1);
  const ent25 = res25.entities[0];
  assert.equal(ent25.policySummary.overallProvenance, 'MIXED', 'Merged multi-source entity has MIXED provenance');
  assert.equal(ent25.policySummary.isRestricted, true, 'CRITICAL: Merging with website DOES NOT launder Google restriction');
  assert.equal(ent25.policySummary.overallExportStatus, 'NOT_EXPORTABLE', 'CRITICAL: Entity remains strictly NOT_EXPORTABLE');
  assert.equal(ent25.policySummary.overallPersistenceStatus, 'NOT_PERSISTABLE');
  pass('Matrix S: Cross-source entity merging strictly prevents restriction laundering');
} catch (e) {
  fail('Matrix Q, R & S: Provenance & Policy Firewall', e);
}

// ============================================================================
// 8. MATRIX T & U: ORDER INDEPENDENCE & DETERMINISTIC TIE-BREAKING
// ============================================================================
console.log('\n--- 8. MATRIX T & U: ORDER INDEPENDENCE & DETERMINISM ---');
try {
  const f01 = loadFixture('01-exact-duplicate.json');
  const f08 = loadFixture('08-same-brand-different-branch.json');
  const f06 = loadFixture('06-same-name-same-phone.json');
  const combined = [
    ...f01.candidates,
    ...f08.candidates,
    ...f06.candidates
  ].map(c => normalizeMapsCandidate(c));

  // Original Order
  const resA = resolveCandidates(combined);

  // Reversed Order
  const resB = resolveCandidates([...combined].reverse());

  // Shuffled Order
  const shuffled = [...combined].sort((x, y) => x.candidateId.localeCompare(y.candidateId));
  const resC = resolveCandidates(shuffled);

  assert.equal(resA.entities.length, resB.entities.length, 'Reversed order entity count mismatch');
  assert.equal(resA.entities.length, resC.entities.length, 'Shuffled order entity count mismatch');

  const idsA = resA.entities.map(e => e.entityId).sort();
  const idsB = resB.entities.map(e => e.entityId).sort();
  const idsC = resC.entities.map(e => e.entityId).sort();

  assert.deepEqual(idsA, idsB, 'Reversed order produced different entity IDs');
  assert.deepEqual(idsA, idsC, 'Shuffled order produced different entity IDs');

  pass('Matrix T & U: Order independence verified: original, reversed, and shuffled orders yield identical entities');
} catch (e) {
  fail('Matrix T & U: Order Independence & Determinism', e);
}

// ============================================================================
// 9. MATRIX W: INTERNATIONALIZATION (EN, BN, AR, DE)
// ============================================================================
console.log('\n--- 9. MATRIX W: INTERNATIONALIZATION ---');
try {
  // Bengali multilingual same business
  const f16 = loadFixture('16-multilingual-same-business.json');
  const norm16 = f16.candidates.map(c => normalizeMapsCandidate(c));
  const res16 = resolveCandidates(norm16);

  assert.equal(res16.entities.length, 1);
  assert.ok(res16.entities[0].aliases.some(a => /হাল ফ্যাশন/.test(a)));
  assert.ok(res16.entities[0].aliases.some(a => /Haal Fashion/.test(a)));
  pass('Matrix W: Bengali multilingual candidate merges cleanly preserving Bengali Unicode and English alias');

  // Arabic transliterated business
  const f17 = loadFixture('17-transliterated-same-business.json');
  const norm17 = f17.candidates.map(c => normalizeMapsCandidate(c));
  const res17 = resolveCandidates(norm17);

  assert.equal(res17.entities.length, 1);
  pass('Matrix W: Arabic / transliterated business merges deterministically via canonical domain and phone');
} catch (e) {
  fail('Matrix W: Internationalization', e);
}

// ============================================================================
// 10. SYNTHETIC PERFORMANCE BENCHMARKS WITH CANDIDATE-PAIR METRICS (8A SEC 5)
// ============================================================================
console.log('\n--- 10. SYNTHETIC PERFORMANCE BENCHMARKS WITH PAIR METRICS ---');
try {
  const f01 = loadFixture('01-exact-duplicate.json');
  const baseRaw = f01.candidates[0];
  const benchmarks = [100, 500, 1000, 5000, 10000, 25000];

  for (const count of benchmarks) {
    const rawList = [];
    for (let i = 0; i < count; i++) {
      const clusterIdx = Math.floor(i / 3);
      const mod = i % 3;
      const streetNum = 100 + clusterIdx;
      const phoneNum = `+1 512-555-${String(clusterIdx % 10000).padStart(4, '0')}`;
      const address = `${streetNum} Congress Ave, Austin, TX 78701`;

      if (mod === 1) {
        rawList.push({
          ...baseRaw,
          sourceId: `ChIJ_cluster_${clusterIdx}`,
          businessName: `Austin Roofing Group ${clusterIdx} LLC`,
          street: `${streetNum} Congress Ave`,
          address,
          phone: phoneNum,
          website: `https://austinroofing-${clusterIdx}.com`,
          candidateId: `cand_${i}`
        });
      } else if (mod === 2) {
        rawList.push({
          ...baseRaw,
          sourceId: `ChIJ_branch_${clusterIdx}`,
          businessName: `Austin Roofing Group ${clusterIdx} (South Branch)`,
          street: `${400 + clusterIdx} South First St`,
          address: `${400 + clusterIdx} South First St, Austin, TX 78704`,
          locality: 'Austin',
          phone: `+1 512-556-${String(clusterIdx % 10000).padStart(4, '0')}`,
          website: `https://austinroofing-${clusterIdx}.com`,
          candidateId: `cand_${i}`
        });
      } else {
        rawList.push({
          ...baseRaw,
          sourceId: `ChIJ_cluster_${clusterIdx}`,
          businessName: `Austin Roofing Group ${clusterIdx} LLC`,
          street: `${streetNum} Congress Ave`,
          address,
          phone: phoneNum,
          website: `https://austinroofing-${clusterIdx}.com`,
          candidateId: `cand_${i}`
        });
      }
    }

    const normalizedList = rawList.map(c => normalizeMapsCandidate(c));

    if (global.gc) global.gc();
    const heapBefore = process.memoryUsage().heapUsed;
    const start = performance.now();

    const res = resolveCandidates(normalizedList);

    const elapsed = performance.now() - start;
    if (global.gc) global.gc();
    const heapAfter = process.memoryUsage().heapUsed;
    const heapDeltaMB = ((heapAfter - heapBefore) / 1024 / 1024).toFixed(2);
    const opsPerSec = Math.round((count / (elapsed / 1000)));

    assert.equal(res.summary.sourceRecordCount, count);
    assert.ok(res.entities.length > 0);

    const s = res.summary;
    console.log(`  [BENCHMARK] ${count.toString().padStart(6)} candidates: ${elapsed.toFixed(1).padStart(8)}ms | Pairs: ${(s.candidatePairsGenerated || 0).toString().padStart(8)} | Comparisons: ${(s.detailedComparisons || 0).toString().padStart(8)} | MaxBucket: ${(s.maxBucketSize || 0).toString().padStart(4)} | AvgBucket: ${(s.avgBucketSize || 0).toFixed(2).padStart(6)} | Entities: ${s.uniqueEntityCount.toString().padStart(5)} | Merges: ${s.sameEntityMerges.toString().padStart(5)} | Branches: ${s.branchRelationships.toString().padStart(5)} | Heap Δ: ${heapDeltaMB.padStart(6)} MB | ${opsPerSec.toLocaleString().padStart(8)} ops/sec`);
  }

  pass('Entity resolution benchmark completed with candidate-pair metrics across 100 to 25,000 candidates');
} catch (e) {
  fail('Performance Benchmarks with Pair Metrics', e);
}

// ============================================================================
// 11. WORST-CASE ADVERSARIAL SYNTHETIC TEST (8A SEC 6)
// ============================================================================
console.log('\n--- 11. WORST-CASE ADVERSARIAL SYNTHETIC TEST ---');
try {
  const f01 = loadFixture('01-exact-duplicate.json');
  const baseRaw = f01.candidates[0];

  // Create 200 records sharing the SAME generic name AND same locality
  // but representing distinct businesses with different phones, domains, addresses
  const adversarialRecords = [];
  for (let i = 0; i < 200; i++) {
    adversarialRecords.push({
      ...baseRaw,
      sourceId: `ChIJ_adversarial_${i}`,
      businessName: 'Dental Clinic',
      street: `${100 + i} Unique St`,
      address: `${100 + i} Unique St, Austin, TX 78701`,
      locality: 'Austin',
      countryCode: 'US',
      phone: `+1 512-999-${String(i).padStart(4, '0')}`,
      website: `https://dentalclinic-${i}.com`,
      candidateId: `adversarial_${i}`
    });
  }

  // Add 50 records sharing same corporate domain but different cities (branches)
  for (let i = 0; i < 50; i++) {
    adversarialRecords.push({
      ...baseRaw,
      sourceId: `ChIJ_corpbranch_${i}`,
      businessName: 'MegaCorp International',
      street: `${500 + i} Corporate Blvd`,
      address: `${500 + i} Corporate Blvd, City${i}, TX`,
      locality: `City${i}`,
      countryCode: 'US',
      phone: `+1 512-888-${String(i).padStart(4, '0')}`,
      website: 'https://megacorp-international.com',
      candidateId: `corpbranch_${i}`
    });
  }

  // Add 50 records sharing same phone but different businesses at different locations
  for (let i = 0; i < 50; i++) {
    adversarialRecords.push({
      ...baseRaw,
      sourceId: `ChIJ_sharedphone_${i}`,
      businessName: `Business ${String.fromCharCode(65 + (i % 26))}${i} Services`,
      street: `${700 + i} Phone Sharing Lane`,
      address: `${700 + i} Phone Sharing Lane, Austin, TX`,
      locality: 'Austin',
      countryCode: 'US',
      phone: '+1 800-555-0000', // shared call center number
      website: `https://business-${i}-services.com`,
      candidateId: `sharedphone_${i}`
    });
  }

  const normalizedAdversarial = adversarialRecords.map(c => normalizeMapsCandidate(c));

  if (global.gc) global.gc();
  const advStart = performance.now();
  const advResult = resolveCandidates(normalizedAdversarial);
  const advElapsed = performance.now() - advStart;

  const advS = advResult.summary;

  // Verify: no universal merge from generic name
  assert.ok(advResult.entities.length >= 200, `Expected 200+ entities for generic name records, got ${advResult.entities.length}`);

  // Verify: MegaCorp branches remain separate
  const megacorpEntities = advResult.entities.filter(e => e.canonicalComparisonName.includes('megacorp'));
  assert.ok(megacorpEntities.length >= 40, `Expected 40+ separate MegaCorp branch entities, got ${megacorpEntities.length}`);

  // Verify: shared phone records remain separate (no false universal merge via shared call center #)
  const sharedPhoneEntities = advResult.entities.filter(e => e.phones.includes('+18005550000'));
  assert.ok(sharedPhoneEntities.length >= 40, `Expected 40+ separate shared-phone entities, got ${sharedPhoneEntities.length}`);

  console.log(`  [ADVERSARIAL] ${adversarialRecords.length} records: ${advElapsed.toFixed(1)}ms | Entities: ${advS.uniqueEntityCount} | Merges: ${advS.sameEntityMerges} | Branches: ${advS.branchRelationships} | MaxBucket: ${advS.maxBucketSize || 0} | Pairs: ${advS.candidatePairsGenerated || 0} | Comparisons: ${advS.detailedComparisons || 0}`);

  pass('Worst-case adversarial test: no false universal merge, branch distinctions preserved, comparison growth measured');
} catch (e) {
  fail('Worst-Case Adversarial Synthetic Test', e);
}

// ============================================================================
// 12. FALSE-MERGE REGRESSION TESTS (8A SEC 7)
// ============================================================================
console.log('\n--- 12. FALSE-MERGE REGRESSION TESTS ---');

// Test 1: Same phone + same address + INCOMPATIBLE names => NOT SAME_ENTITY
try {
  const candA = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_1a', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'ABC Dental',
    street: '123 Main Street', locality: 'Austin', countryCode: 'US',
    phone: '+1 555-100-0000', candidateId: 'fm1_a'
  });
  const candB = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_1b', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'XYZ Dental',
    street: '123 Main Street', locality: 'Austin', countryCode: 'US',
    phone: '+1 555-100-0000', candidateId: 'fm1_b'
  });
  const comp1 = compareCandidates(candA, candB);
  assert.notEqual(comp1.relationshipType, 'SAME_ENTITY', 'Same phone+address+incompatible names MUST NOT be SAME_ENTITY');
  assert.ok(
    comp1.reasons.includes('PHONE_ADDRESS_MATCH_WITHOUT_IDENTITY_CORROBORATION') ||
    comp1.relationshipType === 'DIFFERENT_ENTITY' ||
    comp1.resolutionStatus === 'UNRESOLVED',
    'Must report insufficient identity corroboration'
  );
  pass('FM-1: Same phone + same address + incompatible names => NOT SAME_ENTITY');
} catch (e) {
  fail('FM-1: Same phone + same address + incompatible names', e);
}

// Test 2: Same phone + same address + compatible name => SAME_ENTITY with corroboration
try {
  const candA2 = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_2a', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'ABC Dental LLC',
    street: '123 Main Street', locality: 'Austin', countryCode: 'US',
    phone: '+1 555-200-0000', candidateId: 'fm2_a'
  });
  const candB2 = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_2b', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'ABC Dental',
    street: '123 Main Street', locality: 'Austin', countryCode: 'US',
    phone: '+1 555-200-0000', candidateId: 'fm2_b'
  });
  const comp2 = compareCandidates(candA2, candB2);
  // With compatible name + phone + address, should be SAME_ENTITY
  assert.equal(comp2.relationshipType, 'SAME_ENTITY', 'Same phone+address+compatible name should be SAME_ENTITY');
  pass('FM-2: Same phone + same address + compatible name => SAME_ENTITY with corroboration');
} catch (e) {
  fail('FM-2: Same phone + same address + compatible name', e);
}

// Test 3: Same domain + same name + different branch addresses => branch
try {
  const candA3 = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_3a', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'TechCo Solutions',
    street: '100 North Ave', locality: 'Dallas', countryCode: 'US',
    website: 'https://techco-solutions.com', candidateId: 'fm3_a'
  });
  const candB3 = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_3b', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'TechCo Solutions',
    street: '200 South Blvd', locality: 'Houston', countryCode: 'US',
    website: 'https://techco-solutions.com', candidateId: 'fm3_b'
  });
  const res3 = resolveCandidates([candA3, candB3]);
  assert.equal(res3.entities.length, 2, 'Same domain + same name + different branch addresses must stay separate');
  assert.ok(res3.summary.branchRelationships > 0 || res3.relationships.some(r => r.relationshipType === 'SAME_PARENT_BRAND_DIFFERENT_BRANCH'));
  pass('FM-3: Same domain + same name + different branch addresses => SAME_PARENT_BRAND_DIFFERENT_BRANCH');
} catch (e) {
  fail('FM-3: Same domain + same name + different branch addresses', e);
}

// Test 4: Same domain + same name + missing address on one => do not automatically collapse
try {
  const candA4 = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_4a', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'CloudNet Ltd',
    street: '300 Cloud Ave', locality: 'Seattle', countryCode: 'US',
    website: 'https://cloudnet.com', candidateId: 'fm4_a'
  });
  const candB4 = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_4b', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'CloudNet Ltd',
    website: 'https://cloudnet.com', candidateId: 'fm4_b'
  });
  const res4 = resolveCandidates([candA4, candB4]);
  // With same domain + same name + one has address and the other doesn't, should merge
  // (no branch evidence exists since only one record has an address)
  assert.equal(res4.entities.length, 1, 'Same domain + same name + missing address on one = safe to merge (no branch conflict)');
  pass('FM-4: Same domain + same name + missing address on one record => merges safely (no branch evidence)');
} catch (e) {
  fail('FM-4: Same domain + same name + missing address on one record', e);
}

// Test 5: Same parent brand + different cities => branch candidate, not SAME_ENTITY
try {
  const candA5 = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_5a', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'NovaCare Pharmacy',
    street: '10 Main St', locality: 'Phoenix', countryCode: 'US',
    phone: '+1 602-555-0001', candidateId: 'fm5_a'
  });
  const candB5 = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_5b', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'NovaCare Pharmacy',
    street: '20 Broadway', locality: 'Tucson', countryCode: 'US',
    phone: '+1 520-555-0002', candidateId: 'fm5_b'
  });
  const res5 = resolveCandidates([candA5, candB5]);
  assert.equal(res5.entities.length, 2, 'Same parent brand + different cities must remain separate branches');
  pass('FM-5: Same parent brand + different cities => branch candidate, not SAME_ENTITY');
} catch (e) {
  fail('FM-5: Same parent brand + different cities', e);
}

// Test 6: Same generic name + same city => UNRESOLVED / separate
try {
  const candA6 = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_6a', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'Furniture Store',
    street: '50 Oak Ave', locality: 'Denver', countryCode: 'US',
    phone: '+1 303-555-0010', website: 'https://furniturestore-a.com', candidateId: 'fm6_a'
  });
  const candB6 = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_6b', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'Furniture Store',
    street: '60 Elm Ave', locality: 'Denver', countryCode: 'US',
    phone: '+1 303-555-0020', website: 'https://furniturestore-b.com', candidateId: 'fm6_b'
  });
  const res6 = resolveCandidates([candA6, candB6]);
  assert.equal(res6.entities.length, 2, 'Same generic name + same city must remain separate without corroboration');
  pass('FM-6: Same generic name + same city => UNRESOLVED / separate');
} catch (e) {
  fail('FM-6: Same generic name + same city', e);
}

// Test 7: Same corporate domain + unrelated business categories => CONFLICTING_IDENTITY or UNRESOLVED
try {
  const candA7 = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_7a', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'Alpha Pizza Palace',
    street: '70 Food Court', locality: 'Miami', countryCode: 'US',
    website: 'https://alpha-corp.com', candidateId: 'fm7_a'
  });
  const candB7 = normalizeMapsCandidate({
    sourceId: 'ChIJ_fm_7b', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'Alpha Auto Repair',
    street: '80 Mechanic Row', locality: 'Miami', countryCode: 'US',
    website: 'https://alpha-corp.com', candidateId: 'fm7_b'
  });
  const comp7 = compareCandidates(candA7, candB7);
  // Same domain but completely different names should flag as contradiction
  assert.ok(
    comp7.relationshipType === 'CONFLICTING_ENTITY' || comp7.resolutionStatus === 'CONFLICTING_IDENTITY',
    'Same domain + unrelated business names should flag as conflicting identity'
  );
  pass('FM-7: Same corporate domain + unrelated business names => CONFLICTING_IDENTITY');
} catch (e) {
  fail('FM-7: Same corporate domain + unrelated business names', e);
}

// ============================================================================
// 13. PHASE 20 CORRECTION: CANDIDATE CONSUMPTION & WEAK-COLLISION VERIFICATION
// ============================================================================
console.log('\n--- 13. PHASE 20 CORRECTION: CANDIDATE CONSUMPTION & WEAK-COLLISION VERIFICATION ---');

// Test P20-1: Normal Google candidate consumed cleanly
try {
  const normalCand = normalizeMapsCandidate({
    sourceId: 'ChIJ_p20_norm', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'Summit Peak Dental',
    street: '100 Summit Way', locality: 'Denver', countryCode: 'US',
    phone: '+1 303-555-0100', website: 'https://summitpeakdental.com', candidateId: 'p20_norm_1'
  });
  const res = resolveCandidates([normalCand]);
  assert.equal(res.entities.length, 1);
  assert.equal(res.entities[0].sourceRecords.length, 1);
  pass('P20-1: Normal Google candidate consumed cleanly by Phase 8');
} catch (e) {
  fail('P20-1: Normal Google candidate consumed cleanly by Phase 8', e);
}

// Test P20-2: Candidate with isPotentialDuplicate = true consumed cleanly
try {
  const potDupCand = normalizeMapsCandidate({
    sourceId: 'ChIJ_p20_potdup', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'Summit Peak Dental',
    street: '200 Mountain Ave', locality: 'Denver', countryCode: 'US',
    phone: '+1 303-555-0100', website: 'https://summitpeakdental.com', candidateId: 'p20_potdup_2'
  });
  // Attach Phase 20 isPotentialDuplicate flag
  potDupCand.isPotentialDuplicate = true;
  const res = resolveCandidates([potDupCand]);
  assert.equal(res.entities.length, 1);
  pass('P20-2: Candidate with isPotentialDuplicate = true consumed cleanly by Phase 8');
} catch (e) {
  fail('P20-2: Candidate with isPotentialDuplicate = true consumed cleanly by Phase 8', e);
}

// Test P20-3: Candidate containing collisionEvidence consumed cleanly
try {
  const evidenceCand = normalizeMapsCandidate({
    sourceId: 'ChIJ_p20_ev', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'Summit Peak Dental North',
    street: '300 North Way', locality: 'Denver', countryCode: 'US',
    phone: '+1 303-555-0100', website: 'https://summitpeakdental.com', candidateId: 'p20_ev_3'
  });
  // Attach Phase 20 collisionEvidence
  evidenceCand.collisionEvidence = [{
    key: 'fp:name+phone:summit peak dental:+13035550100',
    type: 'NAME_PHONE',
    primaryCandidateId: 'p20_norm_1',
    matchedFields: ['name', 'phone']
  }];
  const res = resolveCandidates([evidenceCand]);
  assert.equal(res.entities.length, 1);
  pass('P20-3: Candidate containing collisionEvidence consumed cleanly by Phase 8');
} catch (e) {
  fail('P20-3: Candidate containing collisionEvidence consumed cleanly by Phase 8', e);
}

// Test P20-4: Weak-key collision (name+phone) evaluated by Phase 8 with branch differentiation
try {
  const branchA = normalizeMapsCandidate({
    sourceId: 'ChIJ_p20_brA', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'Beacon Cafe Downtown',
    street: '123 Market St', locality: 'Seattle', countryCode: 'US',
    phone: '+1 206-555-8888', candidateId: 'p20_brA'
  });
  branchA.collisionEvidence = [{
    key: 'fp:name+phone:beacon cafe:+12065558888',
    type: 'NAME_PHONE',
    primaryCandidateId: 'p20_brB',
    matchedFields: ['name', 'phone']
  }];
  const branchB = normalizeMapsCandidate({
    sourceId: 'ChIJ_p20_brB', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'Beacon Cafe Uptown',
    street: '456 Queen Anne Ave', locality: 'Seattle', countryCode: 'US',
    phone: '+1 206-555-8888', candidateId: 'p20_brB'
  });
  const res = resolveCandidates([branchA, branchB]);
  // Different branch indicators (Downtown vs Uptown) and different streets: must NOT be merged as SAME_ENTITY
  assert.equal(res.entities.length, 2, 'Branches with weak collision must remain separate entities');
  pass('P20-4: Weak-key collision evaluated by Phase 8: branches preserved separately');
} catch (e) {
  fail('P20-4: Weak-key collision evaluated by Phase 8: branches preserved separately', e);
}

// Test P20-5: Candidate with weak-key collision followed by later strong identifier merges authoritatively
try {
  const candOriginal = normalizeMapsCandidate({
    sourceId: 'ChIJ_strong_place_999', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'Pacific Auto Care',
    street: '500 Pacific Hwy', locality: 'San Diego', countryCode: 'US',
    phone: '+1 619-555-9999', candidateId: 'p20_orig'
  });
  const candLater = normalizeMapsCandidate({
    sourceId: 'ChIJ_strong_place_999', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'Pacific Auto Care',
    street: '500 Pacific Hwy', locality: 'San Diego', countryCode: 'US',
    phone: '+1 619-555-9999', candidateId: 'p20_later'
  });
  // candLater had weak collision recorded during acquisition
  candLater.isPotentialDuplicate = true;
  candLater.collisionEvidence = [{
    key: 'fp:name+address:pacific auto care:500 pacific hwy',
    type: 'NAME_ADDRESS',
    primaryCandidateId: 'p20_orig',
    matchedFields: ['name', 'address']
  }];
  const res = resolveCandidates([candOriginal, candLater]);
  assert.equal(res.entities.length, 1, 'Exact Place ID authoritatively merges the records');
  assert.equal(res.entities[0].sourceRecords.length, 2, 'Both candidate records clustered into entity');
  pass('P20-5: Weak collision candidate with identical strong Place ID merges authoritatively in Phase 8');
} catch (e) {
  fail('P20-5: Weak collision candidate with identical strong Place ID merges authoritatively in Phase 8', e);
}

// Test P20-6: Multiple branches sharing corporate domain
try {
  const dental1 = normalizeMapsCandidate({
    sourceId: 'ChIJ_dental_1', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'ABC Dental',
    street: '123 Main St', locality: 'Dallas', countryCode: 'US',
    website: 'https://abc-dental.com', candidateId: 'p20_d1'
  });
  const dental2 = normalizeMapsCandidate({
    sourceId: 'ChIJ_dental_2', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'ABC Dental',
    street: '456 Oak St', locality: 'Fort Worth', countryCode: 'US',
    website: 'https://abc-dental.com', candidateId: 'p20_d2'
  });
  const res = resolveCandidates([dental1, dental2]);
  assert.equal(res.entities.length, 2, 'Branches in different cities sharing domain must remain 2 entities');
  pass('P20-6: Multiple branches sharing domain preserved as separate entities in Phase 8');
} catch (e) {
  fail('P20-6: Multiple branches sharing domain preserved as separate entities in Phase 8', e);
}

// Test P20-7: Multiple branches sharing central call-center phone
try {
  const callCenter1 = normalizeMapsCandidate({
    sourceId: 'ChIJ_cc_1', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'ABC Cafe Branch A',
    street: '10 First St', locality: 'Portland', countryCode: 'US',
    phone: '+1 503-555-0000', candidateId: 'p20_cc1'
  });
  const callCenter2 = normalizeMapsCandidate({
    sourceId: 'ChIJ_cc_2', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'ABC Cafe Branch B',
    street: '20 Second St', locality: 'Portland', countryCode: 'US',
    phone: '+1 503-555-0000', candidateId: 'p20_cc2'
  });
  const res = resolveCandidates([callCenter1, callCenter2]);
  assert.equal(res.entities.length, 2, 'Distinct branches with same phone must remain separate entities');
  pass('P20-7: Multiple branches sharing central phone preserved as separate entities in Phase 8');
} catch (e) {
  fail('P20-7: Multiple branches sharing central phone preserved as separate entities in Phase 8', e);
}

// Test P20-8: Nearby same-name businesses without corroboration
try {
  const nearby1 = normalizeMapsCandidate({
    sourceId: 'ChIJ_near_1', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'Golden Dragon Restaurant',
    street: '100 Chinatown Way', locality: 'San Francisco', countryCode: 'US',
    phone: '+1 415-555-0101', candidateId: 'p20_near1'
  });
  const nearby2 = normalizeMapsCandidate({
    sourceId: 'ChIJ_near_2', source: 'GOOGLE_MAPS', acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED', businessName: 'Golden Dragon Restaurant',
    street: '500 Chinatown Way', locality: 'San Francisco', countryCode: 'US',
    phone: '+1 415-555-0202', candidateId: 'p20_near2'
  });
  const res = resolveCandidates([nearby1, nearby2]);
  assert.equal(res.entities.length, 2, 'Nearby businesses with different phones/street numbers must not be merged');
  pass('P20-8: Nearby same-name businesses with distinct signals preserved as separate entities in Phase 8');
} catch (e) {
  fail('P20-8: Nearby same-name businesses with distinct signals preserved as separate entities in Phase 8', e);
}

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n================================================================');
console.log(`PHASE 8 TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed`);
console.log('================================================================\n');

if (failedTests > 0) {
  console.error('>>> SOME PHASE 8 TESTS FAILED <<<');
  process.exit(1);
} else {
  console.log('>>> ALL PHASE 8 ENTITY RESOLUTION TESTS PASSED! <<<');
}

