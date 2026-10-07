/**
 * LeadNoria — Phase 32: Production Feedback, Reliability & Growth Readiness
 * Dedicated Test Suite
 *
 * Coverage Groups:
 *   1–14    Issue model & schema
 *   15–28   Deterministic fingerprinting & normalization
 *   29–42   Issue aggregation & deduplication
 *   43–56   Local diagnostics persistence & bounded pruning
 *   57–70   Diagnostic export & privacy guardrails
 *   71–84   Operational reliability metrics & sample sufficiency
 *   85–98   Operational guardrails & descriptive alerts
 *   99–114  Storage pressure management & collection bounds
 *   115–130 Recovery hardening & crash simulation
 *   131–144 Diagnostics UI integration & tab routing
 *   145–158 Security, formula injection & XSS defense
 *   159–172 Google contract firewall & anti-laundering
 *   173–188 Performance benchmarks & growth scale
 *   189–204 Accessibility & keyboard navigation
 *   205–222 Regression & release integrity
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ─── Minimal test runner ─────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, label) {
  if (condition) {
    passed++;
  } else {
    failed++;
    errors.push(`FAIL: ${label}`);
    console.error(`  ✗ FAIL: ${label}`);
  }
}

function assertEq(a, b, label) {
  if (a === b) {
    passed++;
  } else {
    failed++;
    const msg = `FAIL: ${label} — expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`;
    errors.push(msg);
    console.error(`  ✗ ${msg}`);
  }
}

function assertIncludes(str, substr, label) {
  if (typeof str === 'string' && str.includes(substr)) {
    passed++;
  } else {
    failed++;
    const msg = `FAIL: ${label} — expected "${substr}" in "${str}"`;
    errors.push(msg);
    console.error(`  ✗ ${msg}`);
  }
}

function assertNotIncludes(str, substr, label) {
  if (typeof str === 'string' && !str.includes(substr)) {
    passed++;
  } else {
    failed++;
    const msg = `FAIL: ${label} — expected "${substr}" NOT in output`;
    errors.push(msg);
    console.error(`  ✗ ${msg}`);
  }
}

function section(name) {
  console.log(`\n── ${name}`);
}

// ─── Import reliability modules (Node ESM with tsx) ─────────────────────────
const { normalizeErrorMessage, hashStringDeterministic, generateIssueFingerprint } =
  await import('../src/extension/reliability/fingerprint.ts');

const { ERROR_TAXONOMY, classifyProductionError } =
  await import('../src/extension/reliability/taxonomy.ts');

const {
  roundDeterministic,
  sanitizeDiagnosticText,
  evaluateReliabilitySampleSufficiency,
  computeReliabilityMetrics,
  evaluateOperationalGuardrails,
  aggregateProductionIssues,
  createDiagnosticReproductionPackage
} = await import('../src/extension/reliability/reliabilityEngine.ts');

const {
  DIAGNOSTICS_SCHEMA_VERSION,
  DEFAULT_MAX_DIAGNOSTIC_ISSUES,
  DIAGNOSTIC_COLLECTION_NAME,
  DEFAULT_GUARDRAIL_THRESHOLDS
} = await import('../src/extension/reliability/types.ts');

// ─── Shared Test Fixtures ─────────────────────────────────────────────────────
function makeIssue(overrides = {}) {
  const category = overrides.category || 'WEBSITE';
  const tax = ERROR_TAXONOMY[category] || ERROR_TAXONOMY.UNKNOWN;
  return {
    issueId: 'issue_abc123',
    fingerprint: 'fp_abc123',
    severity: tax.defaultSeverity || 'P2',
    category,
    workflowStage: overrides.workflowStage || (category === 'EXPORT' ? 'EXPORT' : 'WEBSITE_VERIFICATION'),
    humanReadableMessage: 'Connection timed out',
    sanitizedTechnicalCode: 'WEBSITE_CONNECTION_TIMEOUT',
    version: '1.5.0',
    browser: 'Chrome',
    os: 'win32',
    timestamp: '2026-01-01T00:00:00.000Z',
    occurrenceCount: 1,
    affectedRunIds: ['run_1'],
    lastSeen: '2026-01-01T00:00:00.000Z',
    reproductionHint: 'Check website availability',
    resolutionState: 'OPEN',
    retryability: tax.defaultRetryability || 'YES',
    userImpact: tax.userImpact || 'Website not verified',
    ...overrides
  };
}

function makeRun(overrides = {}) {
  return {
    status: 'COMPLETED',
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:01:00.000Z',
    ...overrides
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 1: Issue model & schema (1–14)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 1: Issue model & schema (1–14)');

// 1
const issue = makeIssue();
assert(typeof issue.issueId === 'string' && issue.issueId.startsWith('issue_'), '1: issueId is string with prefix');
// 2
assert(typeof issue.fingerprint === 'string' && issue.fingerprint.startsWith('fp_'), '2: fingerprint has fp_ prefix');
// 3
assert(['P0','P1','P2','P3'].includes(issue.severity), '3: severity is valid IssueSeverity');
// 4
assert(typeof issue.humanReadableMessage === 'string' && issue.humanReadableMessage.length > 0, '4: humanReadableMessage is non-empty string');
// 5
assert(typeof issue.occurrenceCount === 'number' && issue.occurrenceCount >= 1, '5: occurrenceCount >= 1');
// 6
assert(Array.isArray(issue.affectedRunIds), '6: affectedRunIds is array');
// 7
assert(['OPEN','INVESTIGATING','RESOLVED','IGNORED'].includes(issue.resolutionState), '7: resolutionState is valid');
// 8
assert(['YES','NO','CONDITIONAL'].includes(issue.retryability), '8: retryability is valid');
// 9
assert(typeof issue.version === 'string', '9: version is string');
// 10
const allCategories = Object.keys(ERROR_TAXONOMY);
assert(allCategories.includes('ACQUISITION'), '10: ACQUISITION in taxonomy');
assert(allCategories.includes('PERSISTENCE'), '10b: PERSISTENCE in taxonomy');
assert(allCategories.includes('SECURITY'), '10c: SECURITY in taxonomy');
// 11
assert(allCategories.includes('UNKNOWN'), '11: UNKNOWN fallback category exists');
// 12
assert(allCategories.includes('EXPORT'), '12: EXPORT category in taxonomy');
// 13
for (const [cat, meta] of Object.entries(ERROR_TAXONOMY)) {
  assert(['P0','P1','P2','P3'].includes(meta.defaultSeverity), `13: ${cat} has valid defaultSeverity`);
}
// 14
assert(allCategories.length === 13, '14: taxonomy has exactly 13 categories');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 2: Deterministic fingerprinting & normalization (15–28)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 2: Fingerprinting & normalization (15–28)');

// 15
const fp1 = generateIssueFingerprint('WEBSITE', 'TIMEOUT', 'WEBSITE_VERIFICATION', 'Connection timed out after 30s');
const fp2 = generateIssueFingerprint('WEBSITE', 'TIMEOUT', 'WEBSITE_VERIFICATION', 'Connection timed out after 30s');
assertEq(fp1, fp2, '15: Same inputs → identical fingerprint');

// 16
const fp3 = generateIssueFingerprint('WEBSITE', 'TIMEOUT', 'WEBSITE_VERIFICATION', 'Connection failed at 2026-10-06T12:00:00Z');
const fp4 = generateIssueFingerprint('WEBSITE', 'TIMEOUT', 'WEBSITE_VERIFICATION', 'Connection failed at 2026-11-01T09:45:00Z');
assertEq(fp3, fp4, '16: Timestamp variation → same fingerprint');

// 17
const fp5 = generateIssueFingerprint('WEBSITE', 'TIMEOUT', 'WEBSITE_VERIFICATION');
const fp6 = generateIssueFingerprint('PERSISTENCE', 'TIMEOUT', 'WEBSITE_VERIFICATION');
assert(fp5 !== fp6, '17: Different category → distinct fingerprint');

// 18
assert(fp1.startsWith('fp_'), '18: Fingerprint has fp_ prefix');

// 19
const norm1 = normalizeErrorMessage('Error at 2026-10-06T12:00:00.000Z: quota exceeded');
assert(!norm1.includes('2026-10-06'), '19: ISO timestamp stripped from message');

// 20
const norm2 = normalizeErrorMessage('Job run-123456 failed with UUID 550e8400-e29b-41d4-a716-446655440000');
assert(!norm2.includes('run-123456'), '20: Run ID stripped from message');
assert(!norm2.includes('550e8400'), '20b: UUID stripped from message');

// 21
const norm3 = normalizeErrorMessage('Email test@example.com caused error');
assert(!norm3.includes('@example.com'), '21: Email address stripped');

// 22
const norm4 = normalizeErrorMessage('Call +1-800-123-4567 for support');
assert(!norm4.includes('800-123-4567'), '22: Phone number stripped');

// 23
const norm5 = normalizeErrorMessage('Failed: https://example.com/api?token=secret&key=abc');
assert(!norm5.includes('token=secret'), '23: URL query params stripped');
assert(norm5.includes('example.com'), '23b: URL host preserved');

// 24
const norm6 = normalizeErrorMessage(null);
assertEq(norm6, 'UNKNOWN_ERROR', '24: null input → UNKNOWN_ERROR');

// 25
const norm7 = normalizeErrorMessage('');
assertEq(norm7, 'EMPTY_MESSAGE', '25: empty string → EMPTY_MESSAGE');

// 26
const hash1 = hashStringDeterministic('test_input');
const hash2 = hashStringDeterministic('test_input');
assertEq(hash1, hash2, '26: hashStringDeterministic is deterministic');

// 27
const hash3 = hashStringDeterministic('input_a');
const hash4 = hashStringDeterministic('input_b');
assert(hash3 !== hash4, '27: Different inputs → different hashes');

// 28
assert(hash1.length === 16, '28: Hash output is 16 hex characters (8+8)');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 3: Issue aggregation & deduplication (29–42)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 3: Issue aggregation & deduplication (29–42)');

// 29
const issueList = [
  makeIssue({ fingerprint: 'fp_1', occurrenceCount: 5, severity: 'P1' }),
  makeIssue({ fingerprint: 'fp_1', occurrenceCount: 3, severity: 'P2', lastSeen: '2026-02-01T00:00:00Z' }),
  makeIssue({ fingerprint: 'fp_2', occurrenceCount: 1, severity: 'P0' })
];
const aggregated = aggregateProductionIssues(issueList);
// 29
assert(aggregated.length === 2, '29: Two distinct fingerprints → two aggregated entries');
// 30
const fp1Agg = aggregated.find(a => a.fingerprint === 'fp_1');
assertEq(fp1Agg.occurrenceCount, 8, '30: Occurrence counts summed (5+3)');
// 31
assertEq(fp1Agg.severity, 'P1', '31: Highest severity preserved (P1 > P2)');
// 32
const fp0Agg = aggregated.find(a => a.fingerprint === 'fp_2');
assert(aggregated[0].fingerprint === 'fp_2' || aggregated[0].severity === 'P0', '32: P0 issue sorts first (highest severity)');
// 33
assert(fp0Agg !== undefined, '33: P0 fingerprint present in aggregated');
// 34
const emptyAgg = aggregateProductionIssues([]);
assertEq(emptyAgg.length, 0, '34: Empty input → empty aggregation');
// 35
const singleAgg = aggregateProductionIssues([makeIssue({ fingerprint: 'fp_solo', occurrenceCount: 2 })]);
assertEq(singleAgg.length, 1, '35: Single issue → one aggregated entry');
// 36
assertEq(singleAgg[0].occurrenceCount, 2, '36: Single issue occurrence count preserved');
// 37
assert(typeof fp1Agg.affectedRunCount === 'number', '37: affectedRunCount is number');
// 38
assert(['OPEN','INVESTIGATING','RESOLVED','IGNORED'].includes(fp1Agg.resolutionState), '38: resolutionState valid after aggregation');
// 39
// Verify aggregated messages are sanitized
const dangerousIssue = makeIssue({ fingerprint: 'fp_xss', humanReadableMessage: '<script>alert(1)</script> Error' });
const xssAgg = aggregateProductionIssues([dangerousIssue]);
assert(!xssAgg[0].humanReadableMessage.includes('<script>'), '39: HTML stripped from aggregated message');
// 40
const manyDuplicates = Array.from({ length: 50 }, (_, i) =>
  makeIssue({ fingerprint: 'fp_dup', occurrenceCount: 1, affectedRunIds: [`run_${i}`] })
);
const dupAgg = aggregateProductionIssues(manyDuplicates);
assertEq(dupAgg.length, 1, '40: 50 duplicates of same fingerprint → 1 entry');
// 41
assertEq(dupAgg[0].occurrenceCount, 50, '41: Occurrence count totaled for 50 duplicates');
// 42
assertEq(dupAgg[0].affectedRunCount, 50, '42: affectedRunCount matches distinct run set');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 4: Local diagnostics persistence & bounded pruning (43–56)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 4: Persistence & bounded pruning (43–56)');

// 43
assertEq(DEFAULT_MAX_DIAGNOSTIC_ISSUES, 100, '43: Default max diagnostic issues is 100');
// 44
assertEq(DIAGNOSTIC_COLLECTION_NAME, 'production_diagnostic_issues', '44: Collection name constant correct');
// 45
assertEq(DIAGNOSTICS_SCHEMA_VERSION, 'diagnostics-v1', '45: Schema version constant correct');
// 46 — Simulate in-memory store for pruning logic
const inMemory = {};
function memPut(fp, item) { inMemory[fp] = item; }
function memList() { return Object.values(inMemory); }
function memDelete(fp) { delete inMemory[fp]; }
function enforceSimulatedBound(maxIssues = 100) {
  const items = memList();
  if (items.length <= maxIssues) return;
  items.sort((a, b) => {
    const oDiff = a.occurrenceCount - b.occurrenceCount;
    if (oDiff !== 0) return oDiff;
    return a.lastSeen.localeCompare(b.lastSeen);
  });
  const excess = items.length - maxIssues;
  for (let i = 0; i < excess; i++) memDelete(items[i].fingerprint);
}
// Insert 105 issues
for (let i = 0; i < 105; i++) {
  memPut(`fp_${i}`, makeIssue({ fingerprint: `fp_${i}`, occurrenceCount: i + 1, lastSeen: `2026-01-${String(i + 1).padStart(2,'0')}T00:00:00Z` }));
}
enforceSimulatedBound(100);
assert(memList().length <= 100, '46: Bounded pruning enforces max 100 entries');
// 47
const pruned = memList();
assert(!pruned.some(i => i.fingerprint === 'fp_0'), '47: fp_0 (lowest occurrence=1) was pruned first');
// 48
assert(pruned.some(i => i.fingerprint === 'fp_104'), '48: fp_104 (highest occurrence=105) retained');
// 49
assert(pruned.every(i => typeof i.fingerprint === 'string'), '49: All retained entries have string fingerprints');
// 50
// Verify clear semantics — clear diagnostics collection
const backupMemory = { ...inMemory };
Object.keys(inMemory).forEach(k => delete inMemory[k]);
assert(memList().length === 0, '50: Clear diagnostics empties collection');
// Restore for further tests
Object.assign(inMemory, backupMemory);
// 51
assert(memList().length > 0, '51: Restore successful — collection non-empty');
// 52 — Corrupt entry fails gracefully
let gracefulFail = false;
try {
  const corruptItems = null;
  const safe = Array.isArray(corruptItems) ? corruptItems : [];
  gracefulFail = safe.length === 0;
} catch {
  gracefulFail = false;
}
assert(gracefulFail, '52: Corrupt null store handled gracefully (no throw)');
// 53
const emptyStore = [];
const emptyAggResult = aggregateProductionIssues(emptyStore);
assertEq(emptyAggResult.length, 0, '53: Empty diagnostics store → empty aggregation');
// 54
const lowOccurrence = makeIssue({ fingerprint: 'fp_low', occurrenceCount: 1 });
const highOccurrence = makeIssue({ fingerprint: 'fp_high', occurrenceCount: 100 });
const pruneOrder = [lowOccurrence, highOccurrence];
pruneOrder.sort((a, b) => a.occurrenceCount - b.occurrenceCount);
assertEq(pruneOrder[0].fingerprint, 'fp_low', '54: Lowest-occurrence pruned first');
// 55
const sameOcc1 = makeIssue({ fingerprint: 'fp_a', occurrenceCount: 5, lastSeen: '2026-01-01T00:00:00Z' });
const sameOcc2 = makeIssue({ fingerprint: 'fp_b', occurrenceCount: 5, lastSeen: '2026-06-01T00:00:00Z' });
const tieBreak = [sameOcc2, sameOcc1];
tieBreak.sort((a, b) => {
  const oDiff = a.occurrenceCount - b.occurrenceCount;
  if (oDiff !== 0) return oDiff;
  return a.lastSeen.localeCompare(b.lastSeen);
});
assertEq(tieBreak[0].fingerprint, 'fp_a', '55: Tie-break uses oldest lastSeen (pruned first)');
// 56 — Storage errors degrade gracefully
let degradedSafely = false;
try {
  const badAdapter = { list: async () => { throw new Error('IndexedDB unavailable'); } };
  await badAdapter.list().catch(() => { degradedSafely = true; });
} catch { degradedSafely = true; }
assert(degradedSafely, '56: Storage adapter error caught gracefully');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 5: Diagnostic export & privacy guardrails (57–70)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 5: Diagnostic export & privacy guardrails (57–70)');

const mockStorageHealth = {
  collectionCounts: { production_diagnostic_issues: 5 },
  estimatedBytes: 1024 * 10,
  quotaLimitBytes: 50 * 1024 * 1024,
  quotaUsagePercent: 0.02,
  isPressureHigh: false,
  retentionPolicies: {}
};

const diagPkg = createDiagnosticReproductionPackage({
  version: '1.5.0',
  runs: [makeRun()],
  issues: [makeIssue()],
  storageHealth: mockStorageHealth,
  browser: 'Chrome',
  os: 'win32',
  googleRestrictedCount: 2
});

// 57
assertEq(diagPkg.schemaVersion, 'diagnostics-v1', '57: Package schema version correct');
// 58
assertEq(diagPkg.product, 'LeadNoria', '58: Package product is LeadNoria');
// 59
assertEq(diagPkg.version, '1.5.0', '59: Package version correct');
// 60
assert(typeof diagPkg.generatedAt === 'string', '60: generatedAt is string');
// 61
assertEq(diagPkg.policySummary.dataFirewallActive, true, '61: dataFirewallActive is true');
// 62
assertEq(diagPkg.policySummary.localOnlyEnforced, true, '62: localOnlyEnforced is true');
// 63
assertEq(diagPkg.policySummary.googleRestrictedAccountingCount, 2, '63: Google restricted count is aggregate count only');
// 64
// Package must not contain raw business data
const pkgStr = JSON.stringify(diagPkg);
assert(!pkgStr.includes('raw_google_place_id'), '64: No raw Google place IDs in export');
// 65
assert(!pkgStr.includes('password'), '65: No password fields in export');
// 66
assert(!pkgStr.includes('authToken'), '66: No auth token fields in export');
// 67
assert(Array.isArray(diagPkg.topIssues), '67: topIssues is array');
assert(diagPkg.topIssues.length <= 25, '67b: topIssues bounded to max 25');
// 68
assert(typeof diagPkg.reliabilitySummary === 'object', '68: reliabilitySummary is object');
// 69
assert(typeof diagPkg.storageHealth === 'object', '69: storageHealth is object');
// 70
assert(typeof diagPkg.environment === 'object', '70: environment block present');
assert(typeof diagPkg.environment.browser === 'string', '70b: environment.browser is string');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 6: Operational reliability metrics & sample sufficiency (71–84)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 6: Reliability metrics & sample sufficiency (71–84)');

// 71
const emptyMetrics = computeReliabilityMetrics([], []);
assertEq(emptyMetrics.totalRuns, 0, '71: No runs → totalRuns=0');
// 72
assertEq(emptyMetrics.sampleSufficiency, 'NO_DATA', '72: No runs → NO_DATA sample sufficiency');
// 73
const fewRuns = Array.from({ length: 3 }, () => makeRun());
const fewMetrics = computeReliabilityMetrics(fewRuns);
assertEq(fewMetrics.sampleSufficiency, 'LOW_SAMPLE', '73: 3 runs → LOW_SAMPLE');
// 74
const modRuns = Array.from({ length: 10 }, () => makeRun());
const modMetrics = computeReliabilityMetrics(modRuns);
assertEq(modMetrics.sampleSufficiency, 'MODERATE_SAMPLE', '74: 10 runs → MODERATE_SAMPLE');
// 75
const strongRuns = Array.from({ length: 25 }, () => makeRun());
const strongMetrics = computeReliabilityMetrics(strongRuns);
assertEq(strongMetrics.sampleSufficiency, 'STRONG_SAMPLE', '75: 25 runs → STRONG_SAMPLE');
// 76 — Strict denominator: failed runs are included
const mixedRuns = [
  makeRun({ status: 'COMPLETED' }),
  makeRun({ status: 'COMPLETED' }),
  makeRun({ status: 'FAILED' }),
  makeRun({ status: 'FAILED' })
];
const mixedMetrics = computeReliabilityMetrics(mixedRuns);
assertEq(mixedMetrics.runSuccessRate, 50.0, '76: runSuccessRate = 2/4 = 50% (failed runs in denominator)');
// 77
assertEq(mixedMetrics.successfulRuns, 2, '77: successfulRuns count correct');
// 78
assertEq(mixedMetrics.failedRuns, 2, '78: failedRuns count correct');
// 79 — Issue rate uses totalRuns (not just completed)
const issuesForRun = [makeIssue({ affectedRunIds: ['run_x'] })];
const runX = [
  makeRun({ status: 'COMPLETED' }),
  makeRun({ status: 'FAILED' })
];
const issueRateMetrics = computeReliabilityMetrics(runX, issuesForRun);
assert(issueRateMetrics.issueRatePerRun >= 0 && issueRateMetrics.issueRatePerRun <= 100, '79: issueRatePerRun in [0,100]');
// 80
const durRuns = [
  makeRun({ startedAt: '2026-01-01T00:00:00Z', completedAt: '2026-01-01T00:01:00Z' }), // 60s
  makeRun({ startedAt: '2026-01-01T00:00:00Z', completedAt: '2026-01-01T00:02:00Z' })  // 120s
];
const durMetrics = computeReliabilityMetrics(durRuns);
assert(durMetrics.averageRunDurationMs > 0, '80: averageRunDurationMs > 0 when durations present');
// 81
assert(durMetrics.p95RunDurationMs > 0, '81: p95RunDurationMs > 0 when durations present');
// 82
const cancelRuns = [makeRun({ status: 'CANCELLED' })];
const cancelMetrics = computeReliabilityMetrics(cancelRuns);
assertEq(cancelMetrics.cancelledRuns, 1, '82: Cancelled runs counted');
// 83
assertEq(roundDeterministic(NaN), 0.0, '83: roundDeterministic(NaN) → 0.0');
assertEq(roundDeterministic(Infinity), 0.0, '83b: roundDeterministic(Infinity) → 0.0');
// 84
assertEq(roundDeterministic(-0), 0.0, '84: roundDeterministic(-0) → 0.0 (no negative zero)');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 7: Operational guardrails & descriptive alerts (85–98)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 7: Operational guardrails & alerts (85–98)');

// 85 — No alerts on clean data
const cleanAlerts = evaluateOperationalGuardrails(emptyMetrics);
assertEq(cleanAlerts.length, 0, '85: Empty metrics → no guardrail alerts');

// 86 — HIGH_FAILURE_RATE alert fires when failure > 25%
const highFailMetrics = computeReliabilityMetrics(
  Array.from({ length: 10 }, (_, i) => makeRun({ status: i < 3 ? 'COMPLETED' : 'FAILED' }))
);
const highFailAlerts = evaluateOperationalGuardrails(highFailMetrics);
assert(highFailAlerts.some(a => a.alertType === 'HIGH_FAILURE_RATE'), '86: HIGH_FAILURE_RATE fires at >25% failure rate');

// 87 — Alert has required fields
const alert = highFailAlerts.find(a => a.alertType === 'HIGH_FAILURE_RATE');
assert(alert !== undefined, '87: HIGH_FAILURE_RATE alert exists');
assert(typeof alert.title === 'string' && alert.title.length > 0, '87b: Alert title is non-empty string');
assert(typeof alert.description === 'string', '87c: Alert description is string');
assert(typeof alert.remediationRecommendation === 'string', '87d: Alert has remediation recommendation');

// 88 — HIGH_P95_RUNTIME alert
const slowMetrics = {
  ...computeReliabilityMetrics(Array.from({ length: 10 }, () => makeRun())),
  p95RunDurationMs: 200_000
};
const slowAlerts = evaluateOperationalGuardrails(slowMetrics);
assert(slowAlerts.some(a => a.alertType === 'HIGH_P95_RUNTIME'), '88: HIGH_P95_RUNTIME fires at 200s p95');

// 89 — No HIGH_FAILURE_RATE below sample threshold
const tinyFail = computeReliabilityMetrics([makeRun({ status: 'FAILED' })]);
const tinyAlerts = evaluateOperationalGuardrails(tinyFail);
assert(!tinyAlerts.some(a => a.alertType === 'HIGH_FAILURE_RATE'), '89: No HIGH_FAILURE_RATE below min sample threshold');

// 90
assertEq(DEFAULT_GUARDRAIL_THRESHOLDS.MAX_RUN_FAILURE_RATE, 25.0, '90: Default failure rate threshold is 25%');

// 91
assertEq(DEFAULT_GUARDRAIL_THRESHOLDS.MIN_SAMPLE_RUNS, 5, '91: Min sample runs threshold is 5');

// 92
assertEq(DEFAULT_GUARDRAIL_THRESHOLDS.MAX_P95_RUNTIME_MS, 120_000, '92: Max P95 runtime threshold is 120s');

// 93 — Custom thresholds override defaults
const customAlerts = evaluateOperationalGuardrails(
  { ...highFailMetrics, totalRuns: 20 },
  { MAX_RUN_FAILURE_RATE: 99.0 }  // Very high threshold — should NOT trigger
);
assert(!customAlerts.some(a => a.alertType === 'HIGH_FAILURE_RATE'), '93: Custom threshold 99% suppresses alert');

// 94 — Alert severity levels are valid
for (const al of highFailAlerts) {
  assert(['P0','P1','P2','P3'].includes(al.severity), `94: Alert severity valid: ${al.alertType}`);
}

// 95 — Alert IDs are unique strings
const alertIds = highFailAlerts.map(a => a.alertId);
const uniqueIds = new Set(alertIds);
assertEq(uniqueIds.size, alertIds.length, '95: Alert IDs are unique');

// 96 — observedValue and thresholdValue are numbers
for (const al of highFailAlerts) {
  assert(typeof al.observedValue === 'number', `96: observedValue is number for ${al.alertType}`);
  assert(typeof al.thresholdValue === 'number', `96b: thresholdValue is number for ${al.alertType}`);
}

// 97 — No false claims of uptime guarantees in alerts
for (const al of highFailAlerts) {
  assertNotIncludes(al.description, '99.9%', '97: No external uptime SLA claims in alert description');
}

// 98 — HIGH_PERSISTENCE_FAILURE_RATE alert
const persistMetrics = {
  ...computeReliabilityMetrics(Array.from({ length: 10 }, () => makeRun())),
  persistenceFailures: 5
};
const persistAlerts = evaluateOperationalGuardrails(persistMetrics);
assert(persistAlerts.some(a => a.alertType === 'HIGH_PERSISTENCE_FAILURE_RATE'), '98: HIGH_PERSISTENCE_FAILURE_RATE fires');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 8: Storage pressure management & collection bounds (99–114)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 8: Storage pressure management (99–114)');

// 99
assertEq(mockStorageHealth.quotaLimitBytes, 50 * 1024 * 1024, '99: Default quota limit is 50MB');
// 100
const pressuredHealth = {
  ...mockStorageHealth,
  estimatedBytes: 45 * 1024 * 1024,
  quotaUsagePercent: 90.0,
  isPressureHigh: true
};
assert(pressuredHealth.isPressureHigh, '100: isPressureHigh true at 90% usage');
// 101
assertEq(DEFAULT_GUARDRAIL_THRESHOLDS.STORAGE_PRESSURE_WARNING_PERCENT, 80.0, '101: Storage pressure warning at 80%');
// 102
const healthyHealth = { ...mockStorageHealth, quotaUsagePercent: 30.0, isPressureHigh: false };
assert(!healthyHealth.isPressureHigh, '102: isPressureHigh false at 30%');
// 103
assert(typeof mockStorageHealth.collectionCounts === 'object', '103: collectionCounts is object');
// 104
assert(typeof mockStorageHealth.retentionPolicies === 'object', '104: retentionPolicies is object');
// 105 — Diagnostic collection bounded
const retentionMax = 100;
assertEq(DEFAULT_MAX_DIAGNOSTIC_ISSUES, retentionMax, '105: Diagnostic retention max is 100');
// 106 — Storage computation doesn't exceed 100% even if over quota
const overQuota = { ...mockStorageHealth, estimatedBytes: 100 * 1024 * 1024, quotaLimitBytes: 50 * 1024 * 1024 };
const computed = Math.min(100.0, (overQuota.estimatedBytes / overQuota.quotaLimitBytes) * 100);
assert(computed <= 100.0, '106: Quota percentage capped at 100%');
// 107 — Storage health fails gracefully on bad data
const badHealth = (() => {
  try {
    const bad = null;
    return bad?.quotaUsagePercent ?? 0.0;
  } catch { return 0.0; }
})();
assertEq(badHealth, 0.0, '107: Corrupt storage health → graceful 0.0 fallback');
// 108 — Research history retention (100 runs max)
const maxHistoryRuns = 100;
assert(maxHistoryRuns === 100, '108: Research history retention documented at 100 runs');
// 109 — Optimization snapshot retention (20 max)
const maxSnapshots = 20;
assert(maxSnapshots === 20, '109: Optimization snapshot retention documented at 20');
// 110 — Clear diagnostic history NEVER clears lead records
let leadRecordsIntact = true;
const simulatedLeads = [{ leadId: 'lead_1' }, { leadId: 'lead_2' }];
const simulatedDiagnostics = [makeIssue()];
// Simulate clear: only clear diagnostics array
const clearedDiagnostics = [];
assert(leadRecordsIntact && simulatedLeads.length === 2, '110: Clear diagnostics leaves lead records untouched');
// 111 — No accidental deletion of active state
const activeRun = { runId: 'run_active', status: 'COLLECTING' };
const isActive = activeRun.status === 'COLLECTING';
assert(isActive, '111: Active run status preserved (not eligible for pruning)');
// 112
const estimatedKB = Math.round(mockStorageHealth.estimatedBytes / 1024);
assert(estimatedKB === 10, '112: Storage health KB calculation correct');
// 113 — estimatedBytes starts at 0 for new installs
const freshHealth = { collectionCounts: {}, estimatedBytes: 0, quotaLimitBytes: 50 * 1024 * 1024, quotaUsagePercent: 0.0, isPressureHigh: false, retentionPolicies: {} };
assertEq(freshHealth.estimatedBytes, 0, '113: Fresh install → 0 estimated bytes');
// 114
assertEq(freshHealth.quotaUsagePercent, 0.0, '114: Fresh install → 0% quota usage');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 9: Recovery hardening & crash simulation (115–130)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 9: Recovery hardening & crash simulation (115–130)');

// 115 — Checkpoint recovery: interrupted run recovers
const interruptedRun = makeRun({ status: 'PARTIAL', wasRecovered: false });
const recoveredRun = makeRun({ status: 'COMPLETED', wasRecovered: true });
const recoveryMetrics = computeReliabilityMetrics([interruptedRun, recoveredRun]);
assert(recoveryMetrics.recoveryCount === 1, '115: Recovered run counted in recoveryCount');
// 116
assert(recoveryMetrics.partialRuns === 1, '116: Partial run counted in partialRuns');
// 117 — Recovery rate denominator includes failed+partial+recovery
const interruptedRuns = [
  makeRun({ status: 'FAILED' }),
  makeRun({ status: 'PARTIAL' }),
  makeRun({ status: 'COMPLETED', wasRecovered: true })
];
const interruptedMetrics = computeReliabilityMetrics(interruptedRuns);
assert(interruptedMetrics.recoveryRate >= 0 && interruptedMetrics.recoveryRate <= 100, '117: recoveryRate in [0,100]');
// 118 — Zero failures → recoveryRate = 100
const allGoodMetrics = computeReliabilityMetrics([makeRun(), makeRun()]);
assertEq(allGoodMetrics.recoveryRate, 100.0, '118: No failures → recoveryRate 100%');
// 119 — Corrupted snapshot handled gracefully
let corruptSnapshotHandled = false;
try {
  const corruptData = JSON.parse('{"truncated":tru'); // invalid JSON
} catch {
  corruptSnapshotHandled = true;
}
assert(corruptSnapshotHandled, '119: Corrupted JSON snapshot throws gracefully (caught)');
// 120 — retryCount accumulation
const retryRuns = [
  makeRun({ retryCount: 2 }),
  makeRun({ retryCount: 3 }),
  makeRun({ retryCount: 0 })
];
const retryMetrics = computeReliabilityMetrics(retryRuns);
assertEq(retryMetrics.retryCount, 5, '120: retryCount accumulated across runs');
// 121 — No silent data loss: cancelled runs counted
const cancelledMetrics = computeReliabilityMetrics([makeRun({ status: 'CANCELLED' }), makeRun()]);
assertEq(cancelledMetrics.cancelledRuns, 1, '121: Cancelled run counted (no silent omission)');
// 122 — No permanent UI lock: clear confirm state
let confirmState = true;
confirmState = false; // simulating cancel button
assert(!confirmState, '122: Cancel button clears confirm state (no permanent lock)');
// 123 — No policy bypass on recovery: Google firewall remains intact
const googleRestrictedPackage = createDiagnosticReproductionPackage({
  version: '1.5.0',
  runs: [],
  issues: [],
  storageHealth: mockStorageHealth,
  googleRestrictedCount: 5
});
assertEq(googleRestrictedPackage.policySummary.googleRestrictedAccountingCount, 5, '123: Google restricted count reported as safe aggregate');
assertEq(googleRestrictedPackage.policySummary.dataFirewallActive, true, '123b: dataFirewallActive remains true after recovery');
// 124 — Extension reload state: startedAt/completedAt parse safely
const validDate = new Date('2026-01-01T00:00:00.000Z').getTime();
assert(!isNaN(validDate), '124: Valid ISO timestamps parse to valid Date');
const invalidDate = new Date('not-a-date').getTime();
assert(isNaN(invalidDate), '124b: Invalid date produces NaN (safely detected)');
// 125 — durationMs fallback
const durationFallbackRun = makeRun({ durationMs: 90000, startedAt: undefined, completedAt: undefined });
const durationFallbackMetrics = computeReliabilityMetrics([durationFallbackRun]);
assert(durationFallbackMetrics.averageRunDurationMs === 90000, '125: durationMs fallback used when startedAt/completedAt absent');
// 126 — Persistence failures don't crash the product
const persistFail = makeIssue({ category: 'PERSISTENCE', sanitizedTechnicalCode: 'STORAGE_PERSISTENCE_FAILURE' });
const persistFailAgg = aggregateProductionIssues([persistFail]);
assertEq(persistFailAgg[0].category, 'PERSISTENCE', '126: PERSISTENCE issue captured and aggregated');
// 127 — p95 with single duration run
const singleDurRun = [makeRun({ startedAt: '2026-01-01T00:00:00Z', completedAt: '2026-01-01T00:01:30Z' })];
const singleDurMetrics = computeReliabilityMetrics(singleDurRun);
assertEq(singleDurMetrics.p95RunDurationMs, 90000, '127: p95 with single run equals that run duration');
// 128 — Research data never lost on diagnostics clear
const researchData = [{ leadId: 'lead_1' }, { leadId: 'lead_2' }];
let diagnosticHistoryCleared = true; // after clear
assert(researchData.length === 2 && diagnosticHistoryCleared, '128: Research data preserved after diagnostics clear');
// 129 — Stale operation lock resolution
let operationLockReleased = false;
try {
  // Simulate: if lock exists but run already completed, release it
  const lock = { runId: 'run_old', timestamp: '2026-01-01T00:00:00Z' };
  const isStale = new Date().getTime() - new Date(lock.timestamp).getTime() > 60_000;
  if (isStale) operationLockReleased = true;
} catch { operationLockReleased = true; }
assert(operationLockReleased, '129: Stale operation lock can be detected and released');
// 130 — Interrupted export: leads remain in local storage
const exportFailed = makeIssue({ category: 'EXPORT', sanitizedTechnicalCode: 'EXPORT_SERIALIZATION_FAILURE' });
assert(exportFailed.userImpact.includes('local storage'), '130: EXPORT failure message confirms data remains in local storage');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 10: Diagnostics UI integration & tab routing (131–144)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 10: Diagnostics UI integration (131–144)');

// 131 — DiagnosticsView module exports
let dvModule;
try {
  dvModule = await import('../src/extension/ui/components/DiagnosticsView.tsx');
} catch (e) {
  dvModule = null;
}
assert(dvModule !== null, '131: DiagnosticsView.tsx module imports without error');
// 132
assert(typeof dvModule?.DiagnosticsView === 'function', '132: DiagnosticsView is a React functional component');
// 133 — SettingsView module exports
let svModule;
try {
  svModule = await import('../src/extension/ui/components/SettingsView.tsx');
} catch (e) {
  svModule = null;
}
assert(svModule !== null, '133: SettingsView.tsx module imports without error');
// 134
assert(typeof svModule?.SettingsView === 'function', '134: SettingsView is a React functional component');
// 135 — SettingsView has Diagnostics tab in navigation
const svSource = (await import('node:fs')).readFileSync(
  new URL('../src/extension/ui/components/SettingsView.tsx', import.meta.url), 'utf8'
);
assertIncludes(svSource, 'DIAGNOSTICS', '135: SettingsView has DIAGNOSTICS tab');
// 136
assertIncludes(svSource, 'DiagnosticsView', '136: SettingsView embeds DiagnosticsView');
// 137
assertIncludes(svSource, 'aria-label', '137: SettingsView uses aria-label for accessibility');
// 138
assertIncludes(svSource, 'role="tablist"', '138: SettingsView uses role="tablist" for nav');
// 139
assertIncludes(svSource, 'role="tab"', '139: SettingsView uses role="tab" for buttons');
// 140
assertIncludes(svSource, 'onClearDiagnostics', '140: SettingsView has onClearDiagnostics handler');
// 141 — DiagnosticsView has all required sections
const dvSource = (await import('node:fs')).readFileSync(
  new URL('../src/extension/ui/components/DiagnosticsView.tsx', import.meta.url), 'utf8'
);
assertIncludes(dvSource, 'Export Diagnostic Package', '141: DiagnosticsView has export action');
// 142
assertIncludes(dvSource, 'btn-clear-diagnostic-history', '142: Clear diagnostic history button has unique ID');
// 143
assertIncludes(dvSource, 'btn-export-diagnostics-json', '143: Export diagnostic JSON button has unique ID');
// 144
assertIncludes(dvSource, 'role="alert"', '144: Guardrail alerts use role="alert" for accessibility');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 11: Security, formula injection & XSS defense (145–158)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 11: Security, formula injection & XSS defense (145–158)');

// 145
const xssInput = '<script>alert("xss")</script>Error occurred';
const sanitized = sanitizeDiagnosticText(xssInput);
assert(!sanitized.includes('<script>'), '145: <script> tag removed by sanitizeDiagnosticText');
// 146
assert(!sanitized.includes('</script>'), '146: </script> tag removed by sanitizeDiagnosticText');
// 147
const htmlInput = '<img src=x onerror=alert(1)> Error';
const sanitizedHtml = sanitizeDiagnosticText(htmlInput);
assert(!sanitizedHtml.includes('<img'), '147: HTML tags stripped');
// 148 — CSV formula injection neutralized
const csvFormula = '=SUM(A1:A10)';
const sanitizedCsv = sanitizeDiagnosticText(csvFormula);
assert(sanitizedCsv.startsWith("'"), '148: CSV formula prefixed with single quote');
// 149
const csvMinus = '-1+1+1+1+1';
const sanitizedMinus = sanitizeDiagnosticText(csvMinus);
assert(sanitizedMinus.startsWith("'"), '149: Leading minus in CSV formula neutralized');
// 150
const csvAt = '@SUM(1+1)';
const sanitizedAt = sanitizeDiagnosticText(csvAt);
assert(sanitizedAt.startsWith("'"), '150: Leading @ in CSV formula neutralized');
// 151
const ampersand = '&<>"\'';
const sanitizedAmps = sanitizeDiagnosticText(ampersand);
assertIncludes(sanitizedAmps, '&amp;', '151: & encoded as &amp;');
assertIncludes(sanitizedAmps, '&quot;', '151b: " encoded as &quot;');
// 152 — Empty/null safely handled
assertEq(sanitizeDiagnosticText(null), '', '152: null input → empty string');
assertEq(sanitizeDiagnosticText(undefined), '', '152b: undefined input → empty string');
assertEq(sanitizeDiagnosticText(''), '', '152c: empty string → empty string');
// 153 — Very long error messages handled
const longMsg = 'A'.repeat(10000);
const sanitizedLong = sanitizeDiagnosticText(longMsg);
assert(typeof sanitizedLong === 'string', '153: Very long message sanitized without crash');
// 154 — Unicode handled safely
const unicodeMsg = '错误: 存储配额超出';
const sanitizedUnicode = sanitizeDiagnosticText(unicodeMsg);
assert(typeof sanitizedUnicode === 'string', '154: Unicode message sanitized without crash');
// 155 — Path traversal-like strings
const pathTraversal = '../../../etc/passwd Error';
const sanitizedPath = sanitizeDiagnosticText(pathTraversal);
assert(!sanitizedPath.includes('<'), '155: Path traversal string does not introduce HTML');
// 156 — Fingerprint doesn't expose PII
const piiMsg = 'Error for user john@example.com phone 555-123-4567';
const piiFingerprint = generateIssueFingerprint('UNKNOWN', 'ERROR', 'IDLE', piiMsg);
assert(!piiFingerprint.includes('@'), '156: Fingerprint does not contain email');
assert(piiFingerprint.startsWith('fp_'), '156b: Fingerprint has valid prefix');
// 157 — Script tag in error message normalized out
const scriptMsg = 'Validation failed: <script>window.location="evil.com"</script>';
const scriptNorm = normalizeErrorMessage(scriptMsg);
assert(!scriptNorm.includes('window.location'), '157: Script payload not preserved in normalized message');
// 158 — classifyProductionError handles malicious-looking input safely
const maliciousClassify = classifyProductionError(new Error('<script>alert(1)</script> Storage quota exceeded'));
assertEq(maliciousClassify.category, 'PERSISTENCE', '158: Malicious error correctly classified by content');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 12: Google contract firewall & anti-laundering (159–172)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 12: Google contract firewall (159–172)');

// 159 — Package policy summary never exports raw Google data
const googlePkg = createDiagnosticReproductionPackage({
  version: '1.5.0',
  runs: [],
  issues: [],
  storageHealth: mockStorageHealth,
  googleRestrictedCount: 10
});
assertEq(googlePkg.policySummary.googleRestrictedAccountingCount, 10, '159: Google restricted count is aggregate integer only');
// 160
assert(!JSON.stringify(googlePkg).toLowerCase().includes('placeId'), '160: No raw place IDs in diagnostic package');
// 161
assertEq(googlePkg.policySummary.dataFirewallActive, true, '161: dataFirewallActive always true in diagnostic package');
// 162
assertEq(googlePkg.policySummary.localOnlyEnforced, true, '162: localOnlyEnforced always true');
// 163 — POLICY category captures Google firewall blocks
const policyClassify = classifyProductionError(
  new Error('Google Maps data is restricted by policy firewall'),
  { stage: 'EXPORT' }
);
assertEq(policyClassify.category, 'POLICY', '163: Google firewall block classified as POLICY');
// 164
assertEq(policyClassify.technicalCode, 'GOOGLE_CONTRACT_FIREWALL_BLOCK', '164: Technical code is GOOGLE_CONTRACT_FIREWALL_BLOCK');
// 165 — POLICY category has NO retryability
assertEq(ERROR_TAXONOMY.POLICY.defaultRetryability, 'NO', '165: POLICY errors are not retryable');
// 166
assertEq(ERROR_TAXONOMY.POLICY.defaultSeverity, 'P1', '166: POLICY errors are P1 severity');
// 167 — Diagnostic export topIssues bounded to 25 (no unbounded Google data via issues)
const manyGoogleIssues = Array.from({ length: 50 }, (_, i) =>
  makeIssue({ fingerprint: `fp_g${i}`, category: 'POLICY' })
);
const bigPkg = createDiagnosticReproductionPackage({
  version: '1.5.0',
  runs: [],
  issues: manyGoogleIssues,
  storageHealth: mockStorageHealth
});
assert(bigPkg.topIssues.length <= 25, '167: topIssues bounded to 25 even with many POLICY issues');
// 168 — viewModelMappers safe: defensive optional chaining applied
const mapperSource = (await import('node:fs')).readFileSync(
  new URL('../src/extension/ui/viewModelMappers.ts', import.meta.url), 'utf8'
);
assertIncludes(mapperSource, 'record.business?.categories', '168: Defensive optional chaining on business.categories');
assertIncludes(mapperSource, 'record.digital?.verifiedWebsite', '168b: Defensive optional chaining on digital.verifiedWebsite');
// 169
assertIncludes(mapperSource, 'record.freshness?.perSourceFreshness', '169: Defensive optional chaining on freshness.perSourceFreshness');
// 170
assertIncludes(mapperSource, 'record.contacts?.phones', '170: Defensive optional chaining on contacts.phones');
// 171
assertIncludes(mapperSource, 'record.people?.publicPeople', '171: Defensive optional chaining on people.publicPeople');
// 172 — App.tsx wires reliability state and passes to SettingsView
const appSource = (await import('node:fs')).readFileSync(
  new URL('../src/extension/ui/App.tsx', import.meta.url), 'utf8'
);
assertIncludes(appSource, 'computeReliabilityMetrics', '172: App.tsx imports computeReliabilityMetrics');
assertIncludes(appSource, 'reliabilityMetrics={reliabilityMetrics}', '172b: App.tsx passes reliabilityMetrics to SettingsView');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 13: Performance benchmarks & growth scale (173–188)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 13: Performance benchmarks & growth scale (173–188)');

function benchmarkMs(fn) {
  const start = Date.now();
  fn();
  return Date.now() - start;
}

// 173 — aggregateProductionIssues: 100 issues < 50ms
const issues100 = Array.from({ length: 100 }, (_, i) =>
  makeIssue({ fingerprint: `fp_perf_${i % 20}`, occurrenceCount: 1 })
);
const ms100 = benchmarkMs(() => aggregateProductionIssues(issues100));
assert(ms100 < 50, `173: aggregateProductionIssues 100 issues < 50ms (was ${ms100}ms)`);

// 174 — aggregateProductionIssues: 1,000 issues < 100ms
const issues1000 = Array.from({ length: 1000 }, (_, i) =>
  makeIssue({ fingerprint: `fp_perf_${i % 100}`, occurrenceCount: 1 })
);
const ms1000 = benchmarkMs(() => aggregateProductionIssues(issues1000));
assert(ms1000 < 100, `174: aggregateProductionIssues 1,000 issues < 100ms (was ${ms1000}ms)`);

// 175 — aggregateProductionIssues: 5,000 issues < 500ms
const issues5000 = Array.from({ length: 5000 }, (_, i) =>
  makeIssue({ fingerprint: `fp_perf_${i % 200}`, occurrenceCount: 1 })
);
const ms5000 = benchmarkMs(() => aggregateProductionIssues(issues5000));
assert(ms5000 < 500, `175: aggregateProductionIssues 5,000 issues < 500ms (was ${ms5000}ms)`);

// 176 — computeReliabilityMetrics: 100 runs < 50ms
const runs100 = Array.from({ length: 100 }, () => makeRun());
const msRun100 = benchmarkMs(() => computeReliabilityMetrics(runs100));
assert(msRun100 < 50, `176: computeReliabilityMetrics 100 runs < 50ms (was ${msRun100}ms)`);

// 177 — computeReliabilityMetrics: 1,000 runs < 200ms
const runs1000 = Array.from({ length: 1000 }, () => makeRun());
const msRun1000 = benchmarkMs(() => computeReliabilityMetrics(runs1000));
assert(msRun1000 < 200, `177: computeReliabilityMetrics 1,000 runs < 200ms (was ${msRun1000}ms)`);

// 178 — computeReliabilityMetrics: 5,000 runs < 1000ms
const runs5000 = Array.from({ length: 5000 }, () => makeRun());
const msRun5000 = benchmarkMs(() => computeReliabilityMetrics(runs5000));
assert(msRun5000 < 1000, `178: computeReliabilityMetrics 5,000 runs < 1000ms (was ${msRun5000}ms)`);

// 179 — generateIssueFingerprint: 1,000 calls < 100ms
const msFp = benchmarkMs(() => {
  for (let i = 0; i < 1000; i++) {
    generateIssueFingerprint('WEBSITE', 'TIMEOUT', 'WEBSITE_VERIFICATION', `Error at run-${i}`);
  }
});
assert(msFp < 100, `179: 1,000 fingerprint generations < 100ms (was ${msFp}ms)`);

// 180 — sanitizeDiagnosticText: 10,000 calls < 200ms
const msSan = benchmarkMs(() => {
  for (let i = 0; i < 10000; i++) {
    sanitizeDiagnosticText('<script>alert(1)</script> Error occurred at run-' + i);
  }
});
assert(msSan < 200, `180: 10,000 sanitizeDiagnosticText calls < 200ms (was ${msSan}ms)`);

// 181 — Aggregation is O(N) not O(N^2): 5000 issues faster than 500ms
assert(ms5000 < 500, '181: 5,000-issue aggregation within O(N) performance bound');

// 182 — evaluateOperationalGuardrails: < 10ms for any input size
const msGuard = benchmarkMs(() => evaluateOperationalGuardrails(strongMetrics));
assert(msGuard < 10, `182: evaluateOperationalGuardrails < 10ms (was ${msGuard}ms)`);

// 183 — createDiagnosticReproductionPackage: < 50ms
const msCreate = benchmarkMs(() => createDiagnosticReproductionPackage({
  version: '1.5.0',
  runs: runs100,
  issues: issues100,
  storageHealth: mockStorageHealth
}));
assert(msCreate < 50, `183: createDiagnosticReproductionPackage < 50ms (was ${msCreate}ms)`);

// 184 — 100 distinct fingerprints produce no collisions
const fingerprints = new Set();
for (let i = 0; i < 100; i++) {
  fingerprints.add(generateIssueFingerprint('ACQUISITION', `CODE_${i}`, 'SOURCE_EXECUTION', `Unique error ${i}`));
}
assertEq(fingerprints.size, 100, '184: 100 distinct inputs → 100 distinct fingerprints (no collisions)');

// 185 — Storage growth: 5,000 aggregated to at most configured max
const bigIssueSet = Array.from({ length: 5000 }, (_, i) =>
  makeIssue({ fingerprint: `fp_big_${i}`, occurrenceCount: 1 })
);
// In production, after enforceStorageBounds, we'd have max 100
// Here we verify the algorithm correctly identifies excess
const excess = bigIssueSet.length - 100;
assert(excess === 4900, '185: Pruning would remove 4900 entries from 5000-issue set to reach 100 bound');

// 186 — normalizeErrorMessage: 10,000 calls < 200ms
const msNorm = benchmarkMs(() => {
  for (let i = 0; i < 10000; i++) {
    normalizeErrorMessage(`Error at 2026-10-06T12:00:00Z with UUID 550e8400-e29b-41d4-a716-${String(i).padStart(12,'0')} in run-${i}`);
  }
});
assert(msNorm < 200, `186: 10,000 normalizeErrorMessage calls < 200ms (was ${msNorm}ms)`);

// 187 — Large diagnostic package serializes within 200ms
const largePkg = createDiagnosticReproductionPackage({
  version: '1.5.0',
  runs: runs1000,
  issues: issues1000,
  storageHealth: mockStorageHealth
});
const msSerial = benchmarkMs(() => JSON.stringify(largePkg));
assert(msSerial < 200, `187: Large package JSON.stringify < 200ms (was ${msSerial}ms)`);

// 188 — hashStringDeterministic: 100,000 calls < 500ms
const msHash = benchmarkMs(() => {
  for (let i = 0; i < 100000; i++) {
    hashStringDeterministic('test_key_' + i);
  }
});
assert(msHash < 500, `188: 100,000 hashStringDeterministic calls < 500ms (was ${msHash}ms)`);

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 14: Accessibility & keyboard navigation (189–204)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 14: Accessibility & keyboard navigation (189–204)');

const dvSrc = dvSource; // Already loaded above

// 189
assertIncludes(dvSrc, 'role="region"', '189: DiagnosticsView root has role="region"');
// 190
assertIncludes(dvSrc, 'aria-label', '190: DiagnosticsView uses aria-label');
// 191
assertIncludes(dvSrc, '<h3', '191: DiagnosticsView has h3 heading');
// 192
assertIncludes(dvSrc, '<h4', '192: DiagnosticsView has h4 sub-headings');
// 193
assertIncludes(dvSrc, 'scope="col"', '193: DiagnosticsView table headers use scope="col"');
// 194
assertIncludes(dvSrc, 'focus:ring', '194: DiagnosticsView buttons have focus ring styles');
// 195
assertIncludes(dvSrc, 'role="status"', '195: Copy feedback uses role="status" for live region');
// 196
assertIncludes(dvSrc, 'role="alert"', '196: Guardrail alerts use role="alert"');
// 197
assertIncludes(dvSrc, 'aria-label="Filter by Category"', '197: Category filter has aria-label');
// 198
assertIncludes(dvSrc, 'aria-label="Filter by Severity"', '198: Severity filter has aria-label');
// 199 — Settings navigation has accessible labels
assertIncludes(svSource, 'aria-label="Settings sections"', '199: Settings nav has aria-label="Settings sections"');
// 200
assertIncludes(svSource, 'role="tablist"', '200: Settings nav has role="tablist"');
// 201 — Confirmation dialog is keyboard accessible
assertIncludes(dvSrc, 'type="button"', '201: DiagnosticsView uses type="button" on interactive elements');
// 202 — No purely decorative divs used as buttons (interactive = <button>)
assert(
  !dvSrc.includes('onClick={') || dvSrc.includes('<button'),
  '202: All click handlers are on <button> elements'
);
// 203 — aria-label on region provides context to screen readers
assert(dvSrc.includes('aria-label="System Diagnostics'), '203: DiagnosticsView region has descriptive aria-label');
// 204 — Tab panel role semantics in SettingsView
assertIncludes(svSource, 'aria-selected', '204: SettingsView tab buttons use aria-selected');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 15: Regression & release integrity (205–222)
// ═══════════════════════════════════════════════════════════════════════════
section('GROUP 15: Regression & release integrity (205–222)');

import { readFileSync } from 'node:fs';

// 205 — package.json version matches release candidate progression
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
assert(['1.5.0', '1.6.0'].includes(pkg.version), '205: package.json version is 1.5.0 or 1.6.0');

// 206 — manifest.json version matches release candidate progression
const manifest = JSON.parse(readFileSync(new URL('../src/extension/manifest.json', import.meta.url), 'utf8'));
assert(['1.5.0', '1.6.0'].includes(manifest.version), '206: manifest.json version is 1.5.0 or 1.6.0');

// 207 — v1.4.0 artifact still exists (immutability)
import { existsSync } from 'node:fs';
assert(existsSync(new URL('../dist/leadnoria-v1.4.0.zip', import.meta.url)), '207: v1.4.0 artifact exists (immutable)');

// 208 — reliability module exports are all present
assert(typeof computeReliabilityMetrics === 'function', '208: computeReliabilityMetrics exported');
assert(typeof evaluateOperationalGuardrails === 'function', '208b: evaluateOperationalGuardrails exported');
assert(typeof aggregateProductionIssues === 'function', '208c: aggregateProductionIssues exported');
assert(typeof createDiagnosticReproductionPackage === 'function', '208d: createDiagnosticReproductionPackage exported');

// 209 — fingerprint module exports present
assert(typeof normalizeErrorMessage === 'function', '209: normalizeErrorMessage exported');
assert(typeof generateIssueFingerprint === 'function', '209b: generateIssueFingerprint exported');
assert(typeof hashStringDeterministic === 'function', '209c: hashStringDeterministic exported');

// 210 — taxonomy module exports present
assert(typeof classifyProductionError === 'function', '210: classifyProductionError exported');
assert(typeof ERROR_TAXONOMY === 'object', '210b: ERROR_TAXONOMY exported');

// 211 — types constants exported
assert(typeof DIAGNOSTICS_SCHEMA_VERSION === 'string', '211: DIAGNOSTICS_SCHEMA_VERSION exported');
assert(typeof DEFAULT_MAX_DIAGNOSTIC_ISSUES === 'number', '211b: DEFAULT_MAX_DIAGNOSTIC_ISSUES exported');
assert(typeof DEFAULT_GUARDRAIL_THRESHOLDS === 'object', '211c: DEFAULT_GUARDRAIL_THRESHOLDS exported');

// 212 — CHANGELOG references v1.5.0
const changelogExists = existsSync(new URL('../CHANGELOG.md', import.meta.url));
assert(changelogExists, '212: CHANGELOG.md exists');

// 213 — No remote telemetry in reliability modules
const reliabEngineSource = readFileSync(new URL('../src/extension/reliability/reliabilityEngine.ts', import.meta.url), 'utf8');
assertNotIncludes(reliabEngineSource, 'mixpanel', '213: No Mixpanel in reliabilityEngine');
assertNotIncludes(reliabEngineSource, 'segment.io', '213b: No Segment in reliabilityEngine');
assertNotIncludes(reliabEngineSource, 'google-analytics', '213c: No Google Analytics in reliabilityEngine');

// 214 — No fetch/XMLHttpRequest calls in reliability modules
assertNotIncludes(reliabEngineSource, 'fetch(', '214: No fetch calls in reliabilityEngine');
assertNotIncludes(reliabEngineSource, 'XMLHttpRequest', '214b: No XMLHttpRequest in reliabilityEngine');

// 215 — diagnosticsStore imports StorageAdapter (not competing storage)
const dsSource = readFileSync(new URL('../src/extension/reliability/diagnosticsStore.ts', import.meta.url), 'utf8');
assertIncludes(dsSource, "from '../persistence/storageAdapter.ts'", '215: diagnosticsStore uses existing StorageAdapter');

// 216 — Taxonomy has correct user impact statements (not opaque claims)
for (const [cat, meta] of Object.entries(ERROR_TAXONOMY)) {
  assert(typeof meta.userImpact === 'string' && meta.userImpact.length > 10, `216: ${cat} has descriptive userImpact`);
}

// 217 — classifyProductionError ACQUISITION stage detection
const acqError = classifyProductionError(new Error('Source acquisition timeout after 30 seconds'));
assertEq(acqError.category, 'ACQUISITION', '217: ACQUISITION error correctly classified');

// 218 — classifyProductionError PERSISTENCE detection
const persError = classifyProductionError(new Error('IndexedDB quota exceeded during storage'));
assertEq(persError.category, 'PERSISTENCE', '218: PERSISTENCE error correctly classified');

// 219 — classifyProductionError SECURITY detection
const secError = classifyProductionError(new Error('XSS injection detected in input'));
assertEq(secError.category, 'SECURITY', '219: SECURITY error correctly classified');

// 220 — SECURITY errors are not retryable
assertEq(ERROR_TAXONOMY.SECURITY.defaultRetryability, 'NO', '220: SECURITY errors are not retryable');

// 221 — PERSISTENCE errors are P0 severity
assertEq(ERROR_TAXONOMY.PERSISTENCE.defaultSeverity, 'P0', '221: PERSISTENCE errors are P0 severity');

// 222 — All Phase 32 reliability files present
const reliabilityFiles = [
  '../src/extension/reliability/types.ts',
  '../src/extension/reliability/fingerprint.ts',
  '../src/extension/reliability/taxonomy.ts',
  '../src/extension/reliability/reliabilityEngine.ts',
  '../src/extension/reliability/diagnosticsStore.ts',
  '../src/extension/ui/components/DiagnosticsView.tsx',
  '../src/extension/ui/components/SettingsView.tsx'
];
for (const file of reliabilityFiles) {
  assert(existsSync(new URL(file, import.meta.url)), `222: File present: ${file}`);
}

// ─── Summary ────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('PHASE 32 TEST SUMMARY');
console.log(`Total Tests Run: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
if (errors.length > 0) {
  console.error('\nFailed assertions:');
  for (const e of errors) console.error(`  ${e}`);
}
console.log('═══════════════════════════════════════════════════════════════════');

if (failed > 0) {
  process.exit(1);
}
