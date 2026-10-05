/**
 * LeadNoria — Phase 31: Saturation State Precedence & Reconciliation Test Suite
 *
 * Verifies deterministic state precedence across all 14 required saturation scenarios:
 * 1. 0 observations -> INSUFFICIENT_DATA
 * 2. 1 observation -> INSUFFICIENT_DATA
 * 3. 2 observations -> INSUFFICIENT_DATA
 * 4. 3 observations -> INSUFFICIENT_DATA
 * 5. 4 observations -> INSUFFICIENT_DATA
 * 6. 5 observations -> Non-insufficient data evaluation (MODERATE_SAMPLE entrypoint)
 * 7. 19 observations -> Non-insufficient data evaluation (MODERATE_SAMPLE ceiling)
 * 8. 20 observations -> STRONG_SAMPLE entrypoint (eligible for HIGHLY_SATURATED)
 * 9. Low attempts + high yield -> UNDEREXPLORED
 * 10. Low attempts + low yield -> MODERATELY_SATURATED (overrides UNDEREXPLORED)
 * 11. High duplicate ratio (>= 70%) with strong sample & low yield -> HIGHLY_SATURATED
 * 12. Repeated low-yield runs -> MODERATELY_SATURATED / HIGHLY_SATURATED
 * 13. Precedence conflict: attempts <= 2 (low attempt) + observations < 5 -> INSUFFICIENT_DATA strictly overrides UNDEREXPLORED
 * 14. Precedence conflict: attempts <= 2 (low attempt) + high dup ratio (>= 50%) -> MODERATELY_SATURATED strictly overrides UNDEREXPLORED
 */

import assert from 'node:assert';
import {
  evaluateSaturationAssessment,
  evaluateSampleSufficiency
} from '../src/extension/optimization/optimizationEngine.ts';
import {
  DEFAULT_SAMPLE_THRESHOLDS,
  DEFAULT_SATURATION_THRESHOLDS
} from '../src/extension/optimization/types.ts';

console.log('=============================================================================');
console.log('LEADNORIA — PHASE 31 SATURATION STATE PRECEDENCE TEST SUITE');
console.log('=============================================================================\n');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    passed++;
    console.log(`[PASS] ${description}`);
  } catch (err) {
    failed++;
    console.error(`[FAIL] ${description}:`, err.message);
  }
}

// 1. 0 observations
test('1. 0 observations -> strictly INSUFFICIENT_DATA', () => {
  const res = evaluateSaturationAssessment({
    attempts: 1,
    rawCandidateCount: 0,
    uniqueCanonicalEntities: 0,
    newEntitiesDiscovered: 0,
    duplicateCandidateCount: 0
  });
  assert.strictEqual(res.state, 'INSUFFICIENT_DATA');
  assert.strictEqual(res.sampleSufficiency, 'NO_DATA');
});

// 2. 1 observation
test('2. 1 observation -> strictly INSUFFICIENT_DATA', () => {
  const res = evaluateSaturationAssessment({
    attempts: 1,
    rawCandidateCount: 1,
    uniqueCanonicalEntities: 1,
    newEntitiesDiscovered: 1,
    duplicateCandidateCount: 0
  });
  assert.strictEqual(res.state, 'INSUFFICIENT_DATA');
  assert.strictEqual(res.sampleSufficiency, 'LOW_SAMPLE');
});

// 3. 2 observations
test('3. 2 observations -> strictly INSUFFICIENT_DATA', () => {
  const res = evaluateSaturationAssessment({
    attempts: 1,
    rawCandidateCount: 2,
    uniqueCanonicalEntities: 2,
    newEntitiesDiscovered: 2,
    duplicateCandidateCount: 0
  });
  assert.strictEqual(res.state, 'INSUFFICIENT_DATA');
  assert.strictEqual(res.sampleSufficiency, 'LOW_SAMPLE');
});

// 4. 3 observations
test('4. 3 observations -> strictly INSUFFICIENT_DATA', () => {
  const res = evaluateSaturationAssessment({
    attempts: 2,
    rawCandidateCount: 3,
    uniqueCanonicalEntities: 3,
    newEntitiesDiscovered: 3,
    duplicateCandidateCount: 0
  });
  assert.strictEqual(res.state, 'INSUFFICIENT_DATA');
  assert.strictEqual(res.sampleSufficiency, 'LOW_SAMPLE');
});

// 5. 4 observations
test('5. 4 observations -> strictly INSUFFICIENT_DATA', () => {
  const res = evaluateSaturationAssessment({
    attempts: 2,
    rawCandidateCount: 4,
    uniqueCanonicalEntities: 4,
    newEntitiesDiscovered: 4,
    duplicateCandidateCount: 0
  });
  assert.strictEqual(res.state, 'INSUFFICIENT_DATA');
  assert.strictEqual(res.sampleSufficiency, 'LOW_SAMPLE');
});

// 6. 5 observations (Threshold boundary)
test('6. 5 observations -> exits INSUFFICIENT_DATA to MODERATE_SAMPLE', () => {
  const res = evaluateSaturationAssessment({
    attempts: 1,
    rawCandidateCount: 5,
    uniqueCanonicalEntities: 5,
    newEntitiesDiscovered: 5,
    duplicateCandidateCount: 0
  });
  assert.notStrictEqual(res.state, 'INSUFFICIENT_DATA');
  assert.strictEqual(res.sampleSufficiency, 'MODERATE_SAMPLE');
  assert.strictEqual(res.state, 'UNDEREXPLORED');
});

// 7. 19 observations (MODERATE_SAMPLE upper boundary)
test('7. 19 observations -> MODERATE_SAMPLE evaluation', () => {
  const res = evaluateSaturationAssessment({
    attempts: 2,
    rawCandidateCount: 19,
    uniqueCanonicalEntities: 15,
    newEntitiesDiscovered: 12,
    duplicateCandidateCount: 4
  });
  assert.strictEqual(res.sampleSufficiency, 'MODERATE_SAMPLE');
  assert.strictEqual(res.state, 'UNDEREXPLORED');
});

// 8. 20 observations (STRONG_SAMPLE lower boundary)
test('8. 20 observations -> STRONG_SAMPLE evaluation', () => {
  const res = evaluateSaturationAssessment({
    attempts: 4,
    rawCandidateCount: 20,
    uniqueCanonicalEntities: 16,
    newEntitiesDiscovered: 12,
    duplicateCandidateCount: 4
  });
  assert.strictEqual(res.sampleSufficiency, 'STRONG_SAMPLE');
  assert.strictEqual(res.state, 'ACTIVE');
});

// 9. Low attempts + high yield (attempts <= 2, yield >= 0.50, dup < 35%, obs >= 5)
test('9. Low attempts + high yield -> UNDEREXPLORED', () => {
  const res = evaluateSaturationAssessment({
    attempts: 2,
    rawCandidateCount: 10,
    uniqueCanonicalEntities: 10,
    newEntitiesDiscovered: 8,
    duplicateCandidateCount: 1
  });
  assert.strictEqual(res.state, 'UNDEREXPLORED');
  assert.ok(res.marginalYield >= 0.50);
  assert.ok(res.duplicateRatio < 35.0);
});

// 10. Low attempts + low yield (attempts <= 2, marginal yield <= 0.25)
test('10. Low attempts + low yield -> MODERATELY_SATURATED', () => {
  const res = evaluateSaturationAssessment({
    attempts: 2,
    rawCandidateCount: 10,
    uniqueCanonicalEntities: 2,
    newEntitiesDiscovered: 0,
    duplicateCandidateCount: 8
  });
  assert.strictEqual(res.state, 'MODERATELY_SATURATED');
});

// 11. High duplicate ratio (>= 70%) with strong sample & declining yield
test('11. High duplicate ratio + strong sample (>= 20) + declining yield -> HIGHLY_SATURATED', () => {
  const res = evaluateSaturationAssessment({
    attempts: 5,
    rawCandidateCount: 30,
    uniqueCanonicalEntities: 6,
    newEntitiesDiscovered: 1,
    duplicateCandidateCount: 24,
    consecutiveLowYieldRuns: 3
  });
  assert.strictEqual(res.state, 'HIGHLY_SATURATED');
  assert.ok(res.duplicateRatio >= 70.0);
  assert.strictEqual(res.sampleSufficiency, 'STRONG_SAMPLE');
});

// 12. Repeated low-yield runs (consecutiveLowYieldRuns >= 2)
test('12. Repeated low-yield runs without strong sample -> MODERATELY_SATURATED', () => {
  const res = evaluateSaturationAssessment({
    attempts: 3,
    rawCandidateCount: 12,
    uniqueCanonicalEntities: 5,
    newEntitiesDiscovered: 1,
    duplicateCandidateCount: 7,
    consecutiveLowYieldRuns: 2
  });
  assert.strictEqual(res.state, 'MODERATELY_SATURATED');
});

// 13. Precedence Conflict: attempts <= 2 AND observations < 5
test('13. Precedence Conflict: INSUFFICIENT_DATA strictly overrides UNDEREXPLORED when obs < 5', () => {
  // Even with 100% new entity yield and 0 duplicates across 1 attempt:
  const res = evaluateSaturationAssessment({
    attempts: 1,
    rawCandidateCount: 3,
    uniqueCanonicalEntities: 3,
    newEntitiesDiscovered: 3,
    duplicateCandidateCount: 0
  });
  assert.strictEqual(res.state, 'INSUFFICIENT_DATA');
  assert.notStrictEqual(res.state, 'UNDEREXPLORED');
});

// 14. Precedence Conflict: attempts <= 2 AND duplicate ratio >= 50%
test('14. Precedence Conflict: MODERATELY_SATURATED strictly overrides UNDEREXPLORED when dup ratio >= 50%', () => {
  const res = evaluateSaturationAssessment({
    attempts: 2,
    rawCandidateCount: 10,
    uniqueCanonicalEntities: 5,
    newEntitiesDiscovered: 4,
    duplicateCandidateCount: 5 // 50% duplicate ratio
  });
  assert.strictEqual(res.state, 'MODERATELY_SATURATED');
  assert.notStrictEqual(res.state, 'UNDEREXPLORED');
});

console.log(`\n=============================================================================`);
console.log(`ALL 14 SATURATION PRECEDENCE TESTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`=============================================================================`);

if (failed > 0) {
  process.exit(1);
}
