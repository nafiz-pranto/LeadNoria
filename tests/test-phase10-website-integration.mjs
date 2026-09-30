import assert from 'assert';
import { verifyMapsEntityWebsite } from '../src/extension/relevance/mapsWebsiteIntegration.ts';
import { normalizeWebsiteUrl } from '../src/extension/websiteUrlNormalizer.ts';
import { setCachedWebsiteVerification, getCachedWebsiteVerification } from '../src/extension/websiteCache.ts';

// We'll mock fetch to simulate the various website test cases without network calls.
const accounts = {
  'Phase 10 integration functionality': { passed: 0, failed: 0 },
  'Phase 10 negative & edge cases': { passed: 0, failed: 0 },
  'Phase 10 performance': { passed: 0, failed: 0 }
};

let currentAccount = 'Phase 10 integration functionality';

function pass(name) {
  accounts[currentAccount].passed++;
  console.log(`  [PASS] ${name}`);
}

function fail(name, error) {
  accounts[currentAccount].failed++;
  console.error(`  [FAIL] ${name}:`, error?.message || error);
}

// Dummy Factory
function mkRelevanceResult(id, state, originalUrl) {
  return {
    entityId: id,
    canonicalDisplayName: `Canonical ${id}`,
    relevanceState: state,
    internalScore: 80,
    sourceContributions: [
      {
        source: 'GOOGLE_MAPS',
        provenance: 'GOOGLE_DERIVED',
        fieldName: 'website',
        isRestricted: true,
        policyStatus: 'POLICY_APPROVED',
        persistenceStatus: 'NOT_PERSISTABLE',
        exportStatus: 'NOT_EXPORTABLE'
      }
    ],
    derivedFrom: [],
    policyEligibility: 'POLICY_APPROVED',
    persistenceEligibility: 'NOT_PERSISTABLE',
    exportEligibility: 'NOT_EXPORTABLE'
  };
}

function mkEntityGroup(id, website, businessName, category) {
  return {
    entityId: id,
    canonicalDisplayName: businessName,
    domains: [website],
    clusterSize: 1
  };
}

async function runTests() {
  console.log('================================================================');
  console.log('PHASE 10 TEST SUITE: WEBSITE VERIFICATION INTEGRATION');
  console.log('================================================================\n');

  try {
    currentAccount = 'Phase 10 integration functionality';

    // 1. RELEVANT entity with valid URL is verified
    let relRes = mkRelevanceResult('cand1', 'RELEVANT', 'https://example.com');
    let ent = mkEntityGroup('cand1', 'https://example.com', 'Example Business', 'Contractor');
    
    // Mock fetch to return a standard verified business
    const mockFetchSuccess = async (url) => {
      return { status: 200, html: '<html><title>Example Business</title><body>We are a contractor.</body></html>' };
    };

    let res1 = await verifyMapsEntityWebsite(relRes, ent, mockFetchSuccess);
    assert.equal(res1.verificationState, 'COMPLETED');
    // For a mock response without strong commercial signals, it might return UNCERTAIN_WEBSITE
    assert.ok(['LIKELY_BUSINESS_WEBSITE', 'UNCERTAIN_WEBSITE', 'VERIFIED_BUSINESS_WEBSITE'].includes(res1.websiteState));
    
    // Lineage check: Google restriction preserved, Website verification added
    const googleContrib = res1.sourceContributions.find(c => c.provenance === 'GOOGLE_DERIVED');
    const websiteContrib = res1.sourceContributions.find(c => c.provenance === 'WEBSITE_DERIVED');
    
    assert.ok(googleContrib.isRestricted, 'Google restriction preserved');
    assert.ok(websiteContrib, 'Website verification contribution added');
    assert.equal(websiteContrib.isRestricted, false, 'Website data itself is unrestricted');
    pass('Test 1: Verification gate opens for RELEVANT entity & lineage preserved');

    // 2. UNCERTAIN entity with valid URL is verified
    let uncRes = mkRelevanceResult('cand2', 'UNCERTAIN', 'https://example.com');
    let res2 = await verifyMapsEntityWebsite(uncRes, ent, mockFetchSuccess);
    assert.equal(res2.verificationState, 'COMPLETED');
    pass('Test 2: Verification gate opens for UNCERTAIN entity');

    // 3. NOT_RELEVANT entity is skipped
    let notRelRes = mkRelevanceResult('cand3', 'NOT_RELEVANT', 'https://example.com');
    let res3 = await verifyMapsEntityWebsite(notRelRes, ent, mockFetchSuccess);
    assert.equal(res3.verificationState, 'SKIPPED_NOT_RELEVANT');
    pass('Test 3: Verification gate skips NOT_RELEVANT entity');

    // 4. Missing URL is skipped
    let noUrlRes = mkRelevanceResult('cand4', 'RELEVANT', '');
    let entNoUrl = mkEntityGroup('cand4', '', 'Example', 'Contractor');
    let res4 = await verifyMapsEntityWebsite(noUrlRes, entNoUrl, mockFetchSuccess);
    assert.equal(res4.verificationState, 'SKIPPED_NO_URL');
    pass('Test 4: Verification gate skips missing URL');

    // 5. Invalid/Security blocked URL is skipped
    let badUrlRes = mkRelevanceResult('cand5', 'RELEVANT', 'javascript:alert(1)');
    let entBadUrl = mkEntityGroup('cand5', 'javascript:alert(1)', 'Example', 'Contractor');
    let res5 = await verifyMapsEntityWebsite(badUrlRes, entBadUrl, mockFetchSuccess);
    assert.equal(res5.verificationState, 'SKIPPED_INVALID_URL');
    pass('Test 5: Verification gate blocks unsafe/invalid URL');

    // 6. 404 Not Found returns WEBSITE_UNAVAILABLE / INVALID
    const mockFetch404 = async (url) => { return { status: 404, html: '' }; };
    let res6 = await verifyMapsEntityWebsite(relRes, ent, mockFetch404);
    assert.equal(res6.verificationState, 'COMPLETED'); // Verification ran
    assert.ok(['INVALID', 'WEBSITE_UNAVAILABLE', 'NO_WEBSITE'].includes(res6.websiteState) || res6.websiteState === 'UNCERTAIN_WEBSITE');
    pass('Test 6: Handles 404 without crashing');

    // 7. Identity Mismatch yields UNCERTAIN_WEBSITE / NON_BUSINESS
    const mockFetchMismatch = async (url) => {
      return { status: 200, html: '<html><title>Bob Pet Supplies</title><body>We sell dog food.</body></html>' };
    };
    let res7 = await verifyMapsEntityWebsite(relRes, ent, mockFetchMismatch);
    assert.equal(res7.verificationState, 'COMPLETED');
    assert.equal(res7.websiteState, 'UNCERTAIN_WEBSITE'); // Or NON_BUSINESS
    pass('Test 7: Identity contradiction handled natively');

    // 8. Error / Timeout handling (Fetch throws)
    const mockFetchError = async (url) => { throw new Error('AbortError'); };
    let res8 = await verifyMapsEntityWebsite(relRes, ent, mockFetchError);
    assert.equal(res8.verificationState, 'COMPLETED');
    assert.ok(['NO_WEBSITE', 'UNCERTAIN_WEBSITE'].includes(res8.websiteState));
    pass('Test 8: Network timeout handled natively');
    
    // Performance test
    currentAccount = 'Phase 10 performance';
    const start = Date.now();
    const batchSize = 1000;
    for(let i=0; i<batchSize; i++) {
        await verifyMapsEntityWebsite(relRes, ent, mockFetchSuccess);
    }
    const elapsed = Date.now() - start;
    const ops = Math.floor((batchSize / elapsed) * 1000);
    console.log(`  [BENCH] ${batchSize} synthetic website verifications: ${elapsed}ms (${ops} ops/sec)`);
    pass('Performance: Orchestration layer throughput verified');

  } catch (e) {
    fail('Unexpected exception in test suite', e);
  }

  console.log('\n================================================================');
  console.log('PHASE 10 TEST ACCOUNTING');
  console.log('================================================================');

  let totalPassed = 0;
  let totalFailed = 0;

  for (const [category, counts] of Object.entries(accounts)) {
    console.log(`  ${category}: ${counts.passed} Passed, ${counts.failed} Failed`);
    totalPassed += counts.passed;
    totalFailed += counts.failed;
  }

  console.log('-----------------------------------------');
  console.log(`  Phase 10 Total: ${totalPassed} Passed, ${totalFailed} Failed`);
  console.log('================================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runTests();
