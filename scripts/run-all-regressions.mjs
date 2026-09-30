/**
 * LeadNoria — Master Regression Suite Runner
 * Runs Post-Freeze and Phases 5 through 17 suites and reports exact counts.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const suites = [
  { name: 'Post-Freeze V1.0 Verification', file: 'tests/test-postfreeze-verification.mjs', useTsx: true },
  { name: 'Phase 5: Extraction & Normalization', file: 'tests/test-phase5-extraction-normalization.mjs', useTsx: true },
  { name: 'Phase 6: Website Qualification', file: 'tests/test-phase6-website-qualification.mjs', useTsx: true },
  { name: 'Phase 7: Google Maps Normalization', file: 'tests/test-phase7-maps-normalization.mjs', useTsx: true },
  { name: 'Phase 8: Entity Resolution', file: 'tests/test-phase8-entity-resolution.mjs', useTsx: true },
  { name: 'Phase 8B: Transitive Conflict Resolution', file: 'tests/test-phase8b-transitive-conflict.mjs', useTsx: true },
  { name: 'Phase 9: Evidence Relevance Waterfall', file: 'tests/test-phase9-evidence-relevance.mjs', useTsx: true },
  { name: 'Phase 10: Website Integration', file: 'tests/test-phase10-website-integration.mjs', useTsx: true },
  { name: 'Phase 11: Contact Enrichment', file: 'tests/test-phase11-contact-enrichment.mjs', useTsx: true },
  { name: 'Phase 12: Advanced Qualification Engine', file: 'tests/test-phase12-advanced-qualification.mjs', useTsx: true },
  { name: 'Phase 13: Geographic Expansion & Planning', file: 'tests/test-phase13-geographic-expansion.mjs', useTsx: true },
  { name: 'Phase 14: Unified Multi-Source Architecture', file: 'tests/test-phase14-unified-architecture.mjs', useTsx: true },
  { name: 'Phase 15: UI/UX & Result ViewModels', file: 'tests/test-phase15-ui-ux.mjs', useTsx: true },
  { name: 'Phase 16: Persistence, Recovery & Export', file: 'tests/test-phase16-persistence-export.mjs', useTsx: true },
  { name: 'Phase 17: Security + Regression + Full E2E', file: 'tests/test-phase17-security-e2e.mjs', useTsx: true },
  { name: 'Phase 18: Final Production Audit & Release', file: 'tests/test-phase18-final-audit.mjs', useTsx: true },
  { name: 'Post-Release Full-System Audit', file: 'tests/test-post-release-audit.mjs', useTsx: true }
];

console.log('================================================================');
console.log('LEADNORIA HISTORICAL REGRESSION & PHASE 18 FINAL AUDIT RUNNER');
console.log('================================================================\n');

const results = [];
let overallPass = true;

for (const suite of suites) {
  process.stdout.write('Running ' + suite.name.padEnd(45) + ' ... ');
  const fullPath = path.join(rootDir, suite.file);
  const args = suite.useTsx ? ['--import', 'tsx', fullPath] : [fullPath];

  const startTime = Date.now();
  const res = spawnSync('node', args, {
    cwd: rootDir,
    encoding: 'utf8',
    env: { ...process.env }
  });
  const duration = Date.now() - startTime;

  const stdout = res.stdout || '';
  const stderr = res.stderr || '';
  const isOk = res.status === 0;

  if (!isOk) {
    overallPass = false;
  }

  // Parse test counts
  let passed = 0;
  const totalPassedMatch = stdout.match(/Total\s+Passed:\s*(\d+)/i);
  if (totalPassedMatch) {
    passed = parseInt(totalPassedMatch[1], 10);
  } else {
    const passMatches = stdout.match(/\[PASS(?::[^\]]+)?\]/g);
    if (passMatches) {
      passed = passMatches.length;
    } else {
      const passedMatch = stdout.match(/(\d+)\s+(?:tests?\s+)?passed/i);
      if (passedMatch) passed = parseInt(passedMatch[1], 10);
    }
  }

  results.push({
    name: suite.name,
    file: suite.file,
    status: isOk ? 'PASS' : 'FAIL',
    exitCode: res.status,
    passed,
    durationMs: duration
  });

  console.log((isOk ? '[PASS]' : '[FAIL]') + ' (' + passed + ' passed, ' + duration + 'ms)');
  if (!isOk && stderr) {
    console.error('       Error: ' + stderr.split('\n').slice(0, 2).join(' '));
  }
}

console.log('\n================================================================');
console.log('HISTORICAL REGRESSION, POST-FREEZE & PHASE 18 SUMMARY TABLE');
console.log('================================================================');
console.log('Suite Name                                     | Status | Passed | Duration');
console.log('-----------------------------------------------+--------+--------+---------');
let grandTotal = 0;
for (const r of results) {
  grandTotal += r.passed;
  console.log(r.name.padEnd(46) + ' | ' + r.status.padEnd(6) + ' | ' + String(r.passed).padStart(6) + ' | ' + String(r.durationMs).padStart(6) + 'ms');
}
console.log('-----------------------------------------------+--------+--------+---------');
console.log('Total Across All Validated Suites:              |        | ' + String(grandTotal).padStart(6) + ' |');
console.log('================================================================');

if (!overallPass) {
  console.error('\n>>> FAILURE: One or more regression suites failed! <<<');
  process.exit(1);
} else {
  console.log('\n>>> ALL HISTORICAL REGRESSIONS, POST-FREEZE, AND PHASE 18 PASSED CLEANLY! <<<');
}
