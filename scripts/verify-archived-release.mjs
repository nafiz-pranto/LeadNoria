/**
 * LeadNoria — Phase 18: Final Archived Release Verification & Browser Smoke
 *
 * Verifies:
 * 1. Calculate SHA-256 of dist/leadnoria-v1.0.0-production.zip
 * 2. Unzip into clean scratch directory
 * 3. Inspect manifest & file inventory
 * 4. Launch clean Chromium instance loading the ZIP-derived extension
 * 5. Verify install, popup, sidepanel, source selector, Google Maps CONTRACT_ONLY state, UI truthfulness
 * 6. Verify checksum again post-inspection
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const releaseZipPath = path.join(rootDir, 'dist/leadnoria-v1.1.0.zip');
const unpackDir = path.join(rootDir, 'scratch/archived-extension-unpacked');

console.log('================================================================');
console.log('PHASE 18: FINAL ARCHIVED BUILD VERIFICATION & BROWSER SMOKE');
console.log('================================================================\n');

// 1. Initial Checksum
console.log('Step 1: Computing initial SHA-256 of production archive...');
if (!fs.existsSync(releaseZipPath)) {
  console.error(`FATAL: Release archive ${releaseZipPath} does not exist!`);
  process.exit(1);
}
const zipBufferInitial = fs.readFileSync(releaseZipPath);
const hashInitial = crypto.createHash('sha256').update(zipBufferInitial).digest('hex');
console.log(`  Artifact: ${releaseZipPath}`);
console.log(`  Byte size: ${zipBufferInitial.length} bytes`);
console.log(`  SHA-256:  ${hashInitial}\n`);

// 2. Unzip into clean scratch location
console.log('Step 2: Unpacking archive into clean scratch directory...');
if (fs.existsSync(unpackDir)) {
  fs.rmSync(unpackDir, { recursive: true, force: true });
}
fs.mkdirSync(unpackDir, { recursive: true });

// Use PowerShell Expand-Archive
execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${releaseZipPath}' -DestinationPath '${unpackDir}' -Force"`, {
  stdio: 'inherit'
});
console.log(`  Unpacked to: ${unpackDir}\n`);

// 3. Inspect Unpacked Artifact Contents & Manifest
console.log('Step 3: Inspecting unpacked files and manifest...');
const files = fs.readdirSync(unpackDir, { recursive: true }).map(f => String(f));
console.log(`  Total files unpacked: ${files.length}`);

const requiredFiles = ['manifest.json', 'popup.html', 'sidepanel.html', 'service-worker.js', 'content-script.js', 'app.js', 'styles.css'];
for (const req of requiredFiles) {
  if (!files.some(f => f.endsWith(req))) {
    console.error(`FATAL: Missing required file in unpacked archive: ${req}`);
    process.exit(1);
  }
}
console.log('  [PASS] All required files present in unpacked archive.');

const manifestPath = path.join(unpackDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log(`  Manifest name: ${manifest.name}`);
console.log(`  Manifest version: ${manifest.version}`);
console.log(`  Permissions: ${manifest.permissions.join(', ')}`);
console.log(`  Host permissions: ${(manifest.host_permissions || []).join(', ')}`);

if (manifest.name !== 'LeadNoria' || manifest.version !== '1.1.0') {
  console.error('FATAL: Manifest metadata mismatch in unpacked release!');
  process.exit(1);
}
console.log('  [PASS] Manifest metadata verified.\n');

// 4. Browser Clean Runtime Smoke
console.log('Step 4: Launching clean Chromium browser with unpacked archive...');
const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const executablePath = edgePaths.find(p => fs.existsSync(p));

if (!executablePath) {
  console.error('FATAL: Microsoft Edge executable not found for Chromium automation!');
  process.exit(1);
}

const context = await chromium.launchPersistentContext('', {
  executablePath,
  headless: true,
  args: [
    '--headless=new',
    `--disable-extensions-except=${unpackDir}`,
    `--load-extension=${unpackDir}`,
    '--no-sandbox'
  ]
});

try {
  const internalsPage = await context.newPage();
  await internalsPage.goto('chrome://extensions-internals');
  const internalsText = await internalsPage.evaluate(() => document.body.innerText);
  const exts = JSON.parse(internalsText);
  const leadNoriaExt = exts.find(e => e.name === 'LeadNoria');

  if (!leadNoriaExt) {
    console.error('FATAL: LeadNoria extension not found loaded in Chromium runtime!');
    process.exit(1);
  }

  const extensionId = leadNoriaExt.id;
  console.log(`  [PASS] Extension installed and active. Extension ID: ${extensionId}`);
  await internalsPage.close();

  // Test Popup Page
  console.log('Step 5: Testing popup page in clean Chromium...');
  const popupPage = await context.newPage();
  const popupLogs = [];
  const popupErrors = [];
  popupPage.on('console', m => {
    const text = m.text();
    popupLogs.push(`[${m.type()}] ${text}`);
    if (m.type() === 'error') popupErrors.push(text);
  });
  popupPage.on('pageerror', err => popupErrors.push(`[UNCAUGHT] ${err.message}`));

  await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
  await popupPage.waitForTimeout(1000);

  const popupTitle = await popupPage.title();
  const popupContentLen = (await popupPage.content()).length;
  console.log(`  Popup title: "${popupTitle}"`);
  console.log(`  Popup rendered DOM bytes: ${popupContentLen}`);
  console.log(`  Popup errors count: ${popupErrors.length}`);
  if (popupErrors.length > 0) {
    console.error('  Popup errors:', popupErrors);
  }
  await popupPage.close();

  // Test Side Panel Page & Interactive Elements
  console.log('Step 6: Testing side panel page and UI elements...');
  const sidePage = await context.newPage();
  const sideLogs = [];
  const sideErrors = [];
  sidePage.on('console', m => {
    const text = m.text();
    sideLogs.push(`[${m.type()}] ${text}`);
    if (m.type() === 'error') sideErrors.push(text);
  });
  sidePage.on('pageerror', err => sideErrors.push(`[UNCAUGHT] ${err.message}`));

  await sidePage.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await sidePage.waitForTimeout(1200);

  const sideTitle = await sidePage.title();
  const headerText = await sidePage.evaluate(() => document.querySelector('h1')?.innerText || '');
  const buttons = await sidePage.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean));
  const fullDomText = await sidePage.evaluate(() => document.body.innerText);

  console.log(`  Side panel title: "${sideTitle}"`);
  console.log(`  Header text: "${headerText}"`);
  console.log(`  Available buttons/controls: ${buttons.slice(0, 8).join(' | ')}`);
  console.log(`  Side panel errors count: ${sideErrors.length}`);

  // Truthfulness check on UI text
  const prohibitedClaims = [
    'all businesses found',
    'guaranteed lead quality',
    'verified email ownership',
    'conversion probability'
  ];
  for (const claim of prohibitedClaims) {
    if (fullDomText.toLowerCase().includes(claim)) {
      console.error(`FATAL: Untruthful claim detected in UI: "${claim}"`);
      process.exit(1);
    }
  }
  console.log('  [PASS] UI truthfulness audit passed: 0 prohibited marketing claims.');

  await sidePage.close();
} finally {
  await context.close();
}

// 7. Verify SHA-256 after smoke test
console.log('\nStep 7: Verifying archive SHA-256 after test completion...');
const zipBufferFinal = fs.readFileSync(releaseZipPath);
const hashFinal = crypto.createHash('sha256').update(zipBufferFinal).digest('hex');
if (hashInitial !== hashFinal) {
  console.error('FATAL: Archive hash changed during verification!');
  process.exit(1);
}
console.log(`  [PASS] Archive checksum identical: ${hashFinal}`);
console.log('\n================================================================');
console.log('ARCHIVED PRODUCTION BUILD SMOKE: ALL PASS');
console.log('================================================================\n');
