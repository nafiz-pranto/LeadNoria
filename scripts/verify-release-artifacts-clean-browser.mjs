/**
 * LeadNoria — Clean-Profile Release Artifact Verifier
 *
 * Usage:
 *   node scripts/verify-release-artifacts-clean-browser.mjs <zipPath> <expectedVersion> [--sparse]
 *
 * - Extracts the EXACT zip into a new isolated directory.
 * - Loads it into a fresh Chromium profile.
 * - Injects a run via the extension service worker (chrome.runtime.sendMessage),
 *   which is the real RESEARCH_COMPLETED delivery path used by App.tsx.
 * - Navigates Research, Analytics, Analytics > Optimization (all 5 sub-tabs), Results, History, Settings.
 * - --sparse additionally injects a CanonicalLeadRecord missing optional
 *   business/location/digital/contacts/people blocks (resilience probe).
 * - Fails (exit 1) on any console error, page error, HTTP >= 400, or non-extension network request.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { chromium } from 'playwright';
import { RecordAssembler } from '../src/extension/leadIntelligence/recordAssembler.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const zipArg = process.argv[2];
const expectedVersion = process.argv[3];
const sparse = process.argv.includes('--sparse');
if (!zipArg || !expectedVersion) {
  console.error('Usage: node verify-release-artifacts-clean-browser.mjs <zipPath> <expectedVersion> [--sparse]');
  process.exit(2);
}

const zipPath = path.resolve(rootDir, zipArg);
const stamp = `${expectedVersion}-${sparse ? 'sparse' : 'full'}-${Date.now()}`;
const extractDir = path.join(rootDir, `test-isolated-extract-${stamp}`);
const profileDir = path.join(rootDir, `test-isolated-profile-${stamp}`);

const checks = [];
function record(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  console.log(`${ok ? '[PASS]' : '[FAIL]'} ${name}${detail ? ` — ${detail}` : ''}`);
}

console.log(`=== CLEAN-PROFILE VERIFICATION: ${zipArg} (expect ${expectedVersion}${sparse ? ', sparse probe' : ''}) ===`);

// 1. Artifact hash + extraction
const zipSha = crypto.createHash('sha256').update(fs.readFileSync(zipPath)).digest('hex');
console.log(`ZIP SHA-256: ${zipSha}`);
fs.mkdirSync(extractDir, { recursive: true });
execSync(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${extractDir}' -Force"`);
const files = fs.readdirSync(extractDir, { recursive: true }).filter(f => fs.statSync(path.join(extractDir, f)).isFile());
record('ZIP extracted into new isolated directory', files.length > 0, `${files.length} files`);

const manPath = path.join(extractDir, 'manifest.json');
let manifest = null;
try { manifest = JSON.parse(fs.readFileSync(manPath, 'utf8')); record('manifest parses', true); }
catch (e) { record('manifest parses', false, e.message); }
const manSha = crypto.createHash('sha256').update(fs.readFileSync(manPath)).digest('hex');
console.log(`Manifest SHA-256: ${manSha}`);
record(`manifest version = ${expectedVersion}`, manifest?.version === expectedVersion, `actual ${manifest?.version}`);

// Referenced assets exist
const referenced = ['service-worker.js', 'popup.html', 'sidepanel.html', 'app.js', 'styles.css', 'content-script.js',
  ...Object.values(manifest?.icons || {})];
const missingFiles = referenced.filter(f => !fs.existsSync(path.join(extractDir, f)));
record('all manifest/entrypoint assets present in ZIP', missingFiles.length === 0, missingFiles.join(', '));

// 2. Browser
const consoleErrors = [];
const pageErrors = [];
const httpErrors = [];
const externalRequests = [];

const ctx = await chromium.launchPersistentContext(profileDir, {
  headless: false,
  ignoreDefaultArgs: ['--disable-extensions', '--disable-component-extensions-with-background-pages'],
  args: ['--no-sandbox', `--disable-extensions-except=${extractDir}`, `--load-extension=${extractDir}`]
});

ctx.on('request', req => {
  const u = req.url();
  if (!/^(chrome-extension|data|blob|about|devtools):/.test(u)) externalRequests.push(u);
});

await new Promise(r => setTimeout(r, 2000));
let sw = ctx.serviceWorkers().find(w => w.url().includes('service-worker.js'));
if (!sw) { try { sw = await ctx.waitForEvent('serviceworker', { timeout: 10000 }); } catch { /* recorded below */ } }
record('service worker starts', !!sw, sw?.url() || 'not registered');
if (!sw) { await ctx.close(); finish(); }
const extId = new URL(sw.url()).hostname;

function attach(page, label) {
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(`[${label}] ${m.text()}`); });
  page.on('pageerror', e => pageErrors.push(`[${label}] ${e.message}`));
  page.on('response', r => { if (r.status() >= 400) httpErrors.push(`[${label}] ${r.status()} ${r.url()}`); });
}

// Popup
const popup = await ctx.newPage();
attach(popup, 'popup');
await popup.goto(`chrome-extension://${extId}/popup.html`, { waitUntil: 'load' });
await popup.waitForTimeout(800);
record('popup loads', (await popup.locator('#root *').count()) > 0);
await popup.close();

// Side panel
const panel = await ctx.newPage();
attach(panel, 'sidepanel');
await panel.goto(`chrome-extension://${extId}/sidepanel.html`, { waitUntil: 'load' });
await panel.waitForTimeout(1000);
record('side panel loads', (await panel.locator('#tab-RESEARCH').count()) > 0);

// Inject run via service worker -> runtime message (real App.tsx path).
// Lead is produced by the production Phase 24 RecordAssembler => schema-conforming.
const fullLead = JSON.parse(JSON.stringify(new RecordAssembler().assemble({
  metaCandidate: {
    businessName: 'Manhattan Premier Dental Care',
    pageUrl: 'https://facebook.com/manhattanpremierdental',
    pageId: '55500199',
    adCount: 4,
    adStatus: 'ACTIVE',
    category: 'Dentist',
    phone: '+1 212-555-0199',
    websiteUrl: 'https://www.example-dental.test',
    observedAt: '2026-10-05T12:00:00.000Z'
  },
  referenceNow: '2026-10-06T00:00:00.000Z'
})));
const sparseLead = {
  schemaVersion: 'lead-intelligence-v1',
  canonicalEntityId: 'lead-verify-sparse',
  canonicalBusinessName: { value: 'Sparse Record Co', confidence: 'WEAK', sources: ['META'] },
  aliases: [], sources: ['META'], sourceContributions: [],
  policy: { hasMetaLineage: true }
};
const leads = sparse ? [fullLead, sparseLead] : [fullLead];
const run = { runId: `run-verify-${stamp}`, status: 'COMPLETED', query: 'dentist', leads, startedAt: new Date().toISOString() };

await sw.evaluate(r => new Promise(res => {
  chrome.runtime.sendMessage({ type: 'RESEARCH_COMPLETED', payload: { run: r } }, () => { void chrome.runtime.lastError; res(true); });
}), run);
await panel.waitForTimeout(1200);

async function clickTab(id, label) {
  const loc = panel.locator(`#${id}`);
  const ok = (await loc.count()) > 0;
  if (ok) { await loc.click(); await panel.waitForTimeout(500); }
  record(`${label} loads`, ok && (await panel.locator('main, [role="tabpanel"], #root *').count()) > 0);
}

await clickTab('tab-RESEARCH', 'Research');
await clickTab('tab-RESULTS', 'Results');
const resultRows = await panel.getByText('Manhattan Premier Dental Care').count();
record('injected run reaches Results UI', resultRows > 0, `${resultRows} matches`);

await clickTab('tab-ANALYTICS', 'Analytics');
const optBtn = panel.locator('nav[aria-label="Analytics view sections"] button', { hasText: 'Optimization' });
const optVisible = (await optBtn.count()) > 0 && await optBtn.first().isVisible();
if (optVisible) { await optBtn.first().click(); await panel.waitForTimeout(600); }
record('Analytics > Optimization section opens', optVisible);

for (const name of ['Recommendations', 'Search Unit Performance', 'Saturation & Coverage', 'Marginal Yield & Duplicates', 'Unit Comparison']) {
  const b = panel.getByRole('tab', { name, exact: false }).first();
  const vis = (await b.count()) > 0 && await b.isVisible();
  if (vis) { await b.click(); await panel.waitForTimeout(300); }
  record(`Research Optimization sub-tab "${name}" visible + clickable`, vis);
}

await clickTab('tab-HISTORY', 'History');
await clickTab('tab-SETTINGS', 'Settings');

await ctx.close();

record('no console errors', consoleErrors.length === 0, consoleErrors.join(' | '));
record('no unhandled exceptions', pageErrors.length === 0, pageErrors.join(' | '));
record('no missing assets (HTTP >= 400)', httpErrors.length === 0, httpErrors.join(' | '));
record('no unauthorized external network calls', externalRequests.length === 0, externalRequests.join(' | '));

finish();

function finish() {
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  try { fs.rmSync(extractDir, { recursive: true, force: true }); } catch {}
  const failed = checks.filter(c => !c.ok);
  const summary = { zip: zipArg, zipSha256: zipSha, manifestSha256: manSha, expectedVersion, sparse, passed: checks.length - failed.length, failed: failed.length, checks };
  const saveLog = process.argv.includes('--save-log');
  if (saveLog) {
    const outDir = path.join(rootDir, 'test-logs');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, `clean-browser-v${expectedVersion}-${sparse ? 'sparse' : 'full'}.json`), JSON.stringify(summary, null, 2));
  }
  console.log(`\nRESULT: ${summary.passed} passed, ${summary.failed} failed`);
  process.exit(failed.length ? 1 : 0);
}
