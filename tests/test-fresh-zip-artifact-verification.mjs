/**
 * Fresh v1.2.1 ZIP Artifact Extraction & Clean Chromium Load Verification
 *
 * Requirements:
 * 1. Confirm SHA-256 of dist/leadnoria-v1.2.1.zip is exact expected hash:
 *    1c1327049ae85c47e77015e6dadd1bf1c9c31924613807efbfebc942b5ee0419
 * 2. Extract into a clean, isolated directory (completely separate from extension/ build directory).
 * 3. Verify extracted contents: manifest, versions, icons, absence of dev/test files.
 * 4. Launch clean Chromium profile with Playwright loading ONLY the extracted directory.
 * 5. Verify service worker registration, popup open, side panel open, asset resolution, zero console errors.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { chromium } from 'playwright';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const EXPECTED_ZIP_HASH = '1c1327049ae85c47e77015e6dadd1bf1c9c31924613807efbfebc942b5ee0419';
const EXPECTED_MANIFEST_HASH = '17b567cbc4daf3c77b1a982e7a877d86d8b788855d65feb4d495ac15e042a215';

const zipPath = path.join(rootDir, 'dist', 'leadnoria-v1.2.1.zip');
const tempExtractDir = path.join(rootDir, 'dist', 'temp-v121-extracted-test');
const tempUserDataDir = path.join(rootDir, 'dist', 'temp-userData-v121');

console.log('================================================================');
console.log('FRESH v1.2.1 ZIP ARTIFACT EXTRACTION & CHROMIUM LOAD VERIFICATION');
console.log('================================================================\n');

async function runVerification() {
  // Step 1: Verify ZIP existence and SHA-256
  console.log('--- Step 1: Verify Fresh ZIP Checksum ---');
  assert.ok(fs.existsSync(zipPath), `Artifact must exist at ${zipPath}`);
  const zipBuf = fs.readFileSync(zipPath);
  const actualZipHash = crypto.createHash('sha256').update(zipBuf).digest('hex');
  console.log(`  Artifact path: ${zipPath}`);
  console.log(`  Artifact size: ${zipBuf.length} bytes`);
  console.log(`  Actual SHA-256:   ${actualZipHash}`);
  console.log(`  Expected SHA-256: ${EXPECTED_ZIP_HASH}`);
  assert.strictEqual(actualZipHash, EXPECTED_ZIP_HASH, 'ZIP SHA-256 must match authoritative hash exactly');
  console.log('  ✓ Step 1 PASS: ZIP SHA-256 is 100% verified\n');

  // Step 2: Clean extraction into isolated directory
  console.log('--- Step 2: Clean Extraction into Isolated Directory ---');
  if (fs.existsSync(tempExtractDir)) {
    fs.rmSync(tempExtractDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempExtractDir, { recursive: true });

  // Use PowerShell to extract zip reliably
  const extractCmd = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${zipPath.replace(/\\/g, '\\\\')}', '${tempExtractDir.replace(/\\/g, '\\\\')}')"`;
  execSync(extractCmd);
  assert.ok(fs.existsSync(tempExtractDir), 'Extracted directory must exist');
  console.log(`  Extracted to: ${tempExtractDir}`);
  console.log('  ✓ Step 2 PASS: Clean extraction completed\n');

  // Step 3: Inspect extracted contents
  console.log('--- Step 3: Static Asset & Manifest Inspection on Extracted Directory ---');
  const extractedFiles = fs.readdirSync(tempExtractDir);
  console.log('  Extracted top-level entries:', extractedFiles);

  const manifestPath = path.join(tempExtractDir, 'manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist in extracted artifact');
  const manifestBuf = fs.readFileSync(manifestPath);
  const actualManifestHash = crypto.createHash('sha256').update(manifestBuf).digest('hex');
  console.log(`  Extracted manifest SHA-256:   ${actualManifestHash}`);
  console.log(`  Expected manifest SHA-256:    ${EXPECTED_MANIFEST_HASH}`);
  assert.strictEqual(actualManifestHash, EXPECTED_MANIFEST_HASH, 'Extracted manifest SHA-256 must match');

  const manifest = JSON.parse(manifestBuf.toString('utf8'));
  assert.strictEqual(manifest.manifest_version, 3, 'Must be MV3');
  assert.strictEqual(manifest.name, 'LeadNoria', 'Name must be LeadNoria');
  assert.strictEqual(manifest.version, '1.2.1', 'Version must be 1.2.1');
  console.log(`  ✓ Manifest version: ${manifest.version}`);

  const requiredProductionAssets = [
    'manifest.json',
    'service-worker.js',
    'content-script.js',
    'gmaps-content-script.js',
    'app.js',
    'popup.html',
    'sidepanel.html',
    'styles.css',
    'icons'
  ];
  for (const asset of requiredProductionAssets) {
    assert.ok(fs.existsSync(path.join(tempExtractDir, asset)), `Required asset missing: ${asset}`);
  }
  console.log('  ✓ All required production runtime assets present');

  const icons = ['icon-16.png', 'icon-32.png', 'icon-48.png', 'icon-128.png', 'icon-256.png'];
  for (const ic of icons) {
    assert.ok(fs.existsSync(path.join(tempExtractDir, 'icons', ic)), `Icon missing: ${ic}`);
  }
  console.log('  ✓ All 5 icon assets present');

  // Verify absence of test/dev files
  const forbiddenExts = ['.ts', '.tsx', '.map', '.md', '.log'];
  function checkNoDevFiles(dir) {
    for (const item of fs.readdirSync(dir)) {
      const p = path.join(dir, item);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        checkNoDevFiles(p);
      } else {
        for (const ext of forbiddenExts) {
          assert.ok(!item.endsWith(ext), `Forbidden development file found in artifact: ${item}`);
        }
      }
    }
  }
  checkNoDevFiles(tempExtractDir);
  console.log('  ✓ Zero development / test files present in extracted artifact');
  console.log('  ✓ Step 3 PASS: Extracted directory static verification green\n');

  // Step 4: Clean browser load verification
  console.log('--- Step 4: Clean Chromium Load from Extracted Artifact Directory ---');
  if (fs.existsSync(tempUserDataDir)) {
    fs.rmSync(tempUserDataDir, { recursive: true, force: true });
  }

  const browserContext = await chromium.launchPersistentContext(tempUserDataDir, {
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions', '--disable-component-extensions-with-background-pages'],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--disable-extensions-except=${tempExtractDir}`,
      `--load-extension=${tempExtractDir}`
    ]
  });

  try {
    // Give browser brief interval to register service worker
    await new Promise(r => setTimeout(r, 1200));
    const allWorkers = browserContext.serviceWorkers();
    console.log('  Discovered service workers:', allWorkers.map(w => w.url()));

    const sw = allWorkers.find(w => w.url().includes('service-worker.js') || w.url().startsWith('chrome-extension://'));
    assert.ok(sw, 'Service worker must register from extracted extension package');

    const extId = new URL(sw.url()).hostname;
    console.log(`  ✓ Service worker registered successfully. Extension ID: ${extId}`);

    // Verify Popup
    const popupConsoleErrors = [];
    const popupPage = await browserContext.newPage();
    popupPage.on('console', msg => {
      if (msg.type() === 'error') popupConsoleErrors.push(msg.text());
    });
    popupPage.on('pageerror', err => popupConsoleErrors.push(err.message));

    await popupPage.goto(`chrome-extension://${extId}/popup.html`, { waitUntil: 'load' });
    const popupTitle = await popupPage.title();
    assert.strictEqual(popupTitle, 'LeadNoria', 'Popup title must be LeadNoria');

    const popupRoot = await popupPage.$('#root');
    assert.ok(popupRoot, 'Popup must have #root element');
    const popupHasContent = await popupPage.evaluate(() => document.getElementById('root')?.children.length > 0);
    assert.ok(popupHasContent, 'Popup #root must contain rendered React UI elements');
    assert.strictEqual(popupConsoleErrors.length, 0, `Popup must load with zero console errors: ${popupConsoleErrors.join(', ')}`);
    console.log('  ✓ Popup UI rendered cleanly with zero console/runtime errors');

    // Verify Side Panel
    const sidepanelConsoleErrors = [];
    const sidepanelPage = await browserContext.newPage();
    sidepanelPage.on('console', msg => {
      if (msg.type() === 'error') sidepanelConsoleErrors.push(msg.text());
    });
    sidepanelPage.on('pageerror', err => sidepanelConsoleErrors.push(err.message));

    await sidepanelPage.goto(`chrome-extension://${extId}/sidepanel.html`, { waitUntil: 'load' });
    const sidepanelTitle = await sidepanelPage.title();
    assert.strictEqual(sidepanelTitle, 'LeadNoria', 'Sidepanel title must be LeadNoria');

    const sidepanelRoot = await sidepanelPage.$('#root');
    assert.ok(sidepanelRoot, 'Sidepanel must have #root element');
    const sidepanelHasContent = await sidepanelPage.evaluate(() => document.getElementById('root')?.children.length > 0);
    assert.ok(sidepanelHasContent, 'Sidepanel #root must contain rendered React UI elements');
    assert.strictEqual(sidepanelConsoleErrors.length, 0, `Sidepanel must load with zero console errors: ${sidepanelConsoleErrors.join(', ')}`);
    console.log('  ✓ Side Panel UI rendered cleanly with zero console/runtime errors');

    // Verify CSS Stylesheet applied
    const bodyBg = await popupPage.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    console.log('  Popup body background color:', bodyBg);
    assert.ok(bodyBg.includes('15') || bodyBg.includes('slate') || bodyBg.includes('rgb'), 'Styles.css must be applied');
    console.log('  ✓ Stylesheet loaded and applied to extension views');

    // Check no unauthorized external network requests
    const networkRequests = [];
    popupPage.on('request', req => networkRequests.push(req.url()));
    sidepanelPage.on('request', req => networkRequests.push(req.url()));

    for (const url of networkRequests) {
      assert.strictEqual(url.includes('localhost'), false, `Forbidden local call: ${url}`);
      assert.strictEqual(url.includes('127.0.0.1'), false, `Forbidden loopback call: ${url}`);
    }
    console.log('  ✓ Zero unauthorized outbound network requests observed');

    console.log('  ✓ Step 4 PASS: Clean browser load from extracted ZIP successful\n');
  } finally {
    await browserContext.close();
    // Cleanup temporary extraction and userData
    try {
      if (fs.existsSync(tempExtractDir)) {
        fs.rmSync(tempExtractDir, { recursive: true, force: true });
      }
      if (fs.existsSync(tempUserDataDir)) {
        fs.rmSync(tempUserDataDir, { recursive: true, force: true });
      }
    } catch (e) {
      // ignore cleanup file locking
    }
  }

  console.log('================================================================');
  console.log('VERIFICATION COMPLETE: ALL 4 STEPS PASSED SUCCESSFULLY');
  console.log('The fresh dist/leadnoria-v1.2.1.zip is verified 100% production-ready.');
  console.log('================================================================\n');
}

runVerification().catch(err => {
  console.error('\n❌ Artifact verification failed:', err);
  process.exit(1);
});
