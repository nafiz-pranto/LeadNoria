import { execSync } from 'child_process';
import path from 'path';

const suites = [
  { name: 'Part 1: Acquisition Foundation', path: 'tests/test-gmaps-acquisition-foundation.mjs' },
  { name: 'Part 2: Feed Scrolling & Extraction', path: 'tests/test-gmaps-feed-scrolling-extraction.mjs' },
  { name: 'Part 3: Rating & Website Filters', path: 'tests/test-gmaps-rating-website-filter.mjs' },
  { name: 'Part 4: Bulk Research Orchestration', path: 'tests/test-gmaps-bulk-research.mjs' },
  { name: 'Part 5: Deduplication & Quality', path: 'tests/test-gmaps-dedup-quality.mjs' },
  { name: 'Part 6: Enrichment Integration', path: 'tests/test-gmaps-enrichment-integration.mjs' },
  { name: 'Part 7: Review & Qualification', path: 'tests/test-gmaps-review-qualification.mjs' },
  { name: 'Part 8: Lead Projection', path: 'tests/test-gmaps-lead-projection.mjs' },
  { name: 'Part 9: Workspace Persistence', path: 'tests/test-gmaps-workspace-persistence.mjs' },
  { name: 'Phase 21: Website Intelligence', path: 'tests/test-phase21-website-intelligence.mjs' },
  { name: 'Phase 22: Contact & Person Intel', path: 'tests/test-phase22-contact-person-intelligence.mjs' },
  { name: 'Part 10: Production Hardening', path: 'tests/test-gmaps-part10-production-hardening.mjs' },
  { name: 'Google Maps Adv Research & Qualification', path: 'tests/test-gmaps-advanced-research-qualification.mjs' },
  { name: 'Browser Smoke', path: 'tests/test-gmaps-browser-smoke.mjs' }
];

console.log('=== RUNNING ALL ACTIVE SUITES WITH TSX ===\n');
let grandTotal = 0;
const results = [];

for (const s of suites) {
  const command = `npx tsx ${s.path}`;
  try {
    const start = Date.now();
    const output = execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const duration = Date.now() - start;
    
    // Look for assertion counts in output
    let matchedCount = null;
    const match = output.match(/(?:PASSED|Total|Executed Assertions|TOTAL.*ASSERTIONS.*?PASSED):\s*(\d+)(?:\s*\/\s*(\d+))?/i);
    
    const lines = output.split('\n').filter(l => l.trim().length > 0);
    const summaryLines = lines.slice(-2).join(' | ');
    results.push({ name: s.name, status: 'PASS', duration, summary: summaryLines });
    console.log(`[PASS] ${s.name} (${duration}ms)`);
    console.log(`       -> ${summaryLines}`);
  } catch (err) {
    results.push({ name: s.name, status: 'FAIL', error: err.message });
    console.error(`[FAIL] ${s.name}:`, err.message);
    if (err.stdout) console.log('STDOUT tail:', err.stdout.slice(-400));
    if (err.stderr) console.error('STDERR tail:', err.stderr.slice(-400));
  }
}
