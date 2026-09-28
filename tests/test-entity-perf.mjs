/**
 * Performance and Memory Benchmarking for Entity Resolution Engine
 * Tests 100, 1,000, and 5,000 entities.
 */

import assert from 'node:assert';
import {
  EntityResolutionIndex,
  evaluateEntityMerge
} from '../src/extension/entityResolver.ts';
import { processBatch } from '../src/extension/bulkProcessor.ts';

async function runPerfTest() {
  console.log('================================================================');
  console.log('ENTITY RESOLUTION PERFORMANCE & STORAGE BENCHMARK (100, 1000, 5000)');
  console.log('================================================================\n');

  const tiers = [100, 1000, 5000];

  for (const count of tiers) {
    if (global.gc) global.gc();
    const memBefore = process.memoryUsage().heapUsed;
    const startTime = performance.now();

    const index = new EntityResolutionIndex();
    const entitiesMap = new Map();
    const seenAdIds = new Set();
    const seenEntityKeys = new Set();
    const counters = {
      rawAds: 0,
      normalizedCandidates: 0,
      relevantCandidates: 0,
      uncertainCandidates: 0,
      notRelevantCandidates: 0,
      duplicatesRemoved: 0,
      finalUniqueLeads: 0,
      uniqueEntitiesObserved: 0,
      relevantEntities: 0,
      uncertainEntities: 0,
      notRelevantEntities: 0,
      keywordsCompleted: 0,
      keywordsTotal: 1,
      finalUniqueRelevantLeads: 0,
      reasonCodes: {}
    };

    // Synthesize 'count' unique advertiser candidates
    const candidates = [];
    for (let i = 0; i < count; i++) {
      candidates.push({
        libraryId: `ad_perf_${i}`,
        pageName: `Artisan Woodworks ${i}`,
        facebookPageId: `page_id_${i}`,
        facebookPageUrl: `https://facebook.com/artisanwood${i}`,
        destinationUrl: `https://artisanwood${i}.com/store`
      });
    }

    const batchRes = await processBatch(
      candidates,
      entitiesMap,
      seenAdIds,
      seenEntityKeys,
      counters,
      {
        runId: `run_perf_${count}`,
        countryCode: 'BD',
        locationName: 'Bangladesh',
        currentKeyword: 'Furniture',
        effectiveCeiling: 5000,
        entityIndex: index
      }
    );

    const batchDuration = performance.now() - startTime;
    const memAfter = process.memoryUsage().heapUsed;
    const memDeltaMB = (memAfter - memBefore) / (1024 * 1024);

    console.log(`[PERF ${count} ENTITIES]`);
    console.log(`  Processed: ${candidates.length} ads`);
    console.log(`  Entities created: ${entitiesMap.size}`);
    console.log(`  Batch duration: ${batchDuration.toFixed(2)} ms (${(batchDuration / count).toFixed(3)} ms/entity)`);
    console.log(`  Heap delta: ${memDeltaMB.toFixed(2)} MB`);
    console.log(`  Index sizes: pageIdToKey=${index.pageIdToKey.size}, pageSlugToKey=${index.pageSlugToKey.size}, nameDomainToKey=${index.nameDomainToKey.size}\n`);

    // Invariant checks
    assert.strictEqual(entitiesMap.size, count, `Must create exactly ${count} entities`);
    assert.ok(batchDuration / count < 1.0, `Per-entity resolution must be sub-millisecond (< 1.0ms), actual: ${(batchDuration / count).toFixed(3)}ms`);
    assert.ok(memDeltaMB < (count === 5000 ? 50 : 20), `Memory footprint must be tightly bounded`);

    // Verify lookup speed on 100 randomly sampled lookups
    const lookupStart = performance.now();
    for (let j = 0; j < 100; j++) {
      const sampleId = Math.floor(Math.random() * count);
      const queryCand = {
        libraryId: `ad_query_${sampleId}`,
        pageName: `Artisan Woodworks ${sampleId} Ltd`,
        facebookPageId: `page_id_${sampleId}`
      };
      const dec = evaluateEntityMerge(queryCand, entitiesMap, index);
      assert.strictEqual(dec.shouldMerge, true, 'Must correctly identify existing entity');
    }
    const lookupDuration = performance.now() - lookupStart;
    console.log(`  100 Sample Lookups Duration: ${lookupDuration.toFixed(2)} ms (${(lookupDuration / 100).toFixed(4)} ms/lookup)\n`);
  }

  console.log('PERFORMANCE & STORAGE BENCHMARK: PASSED (All tiers within budget)\n');
}

runPerfTest().catch(err => {
  console.error('Performance test failed:', err);
  process.exit(1);
});
