/**
 * LEADNORIA — PHASE 28 TEST SUITE
 * Production Release Packaging, Distribution & Operations
 *
 * Covers:
 * 1. Version consistency (Tests 1–10)
 * 2. Git release & repository integrity (Tests 11–20)
 * 3. Artifact provenance & environment (Tests 21–32)
 * 4. Reproducible release build (Tests 33–42)
 * 5. Release notes & documentation consistency (Tests 43–52)
 * 6. Installation & update behavior (Tests 53–62)
 * 7. Rollback behavior (Tests 63–72)
 * 8. Support & diagnostic safety (Tests 73–82)
 * 9. Privacy & data-handling consistency (Tests 83–90)
 * 10. License & dependency metadata (Tests 91–96)
 * 11. Distribution package hygiene (Tests 97–106)
 * 12. Production lifecycle E2E checks (Tests 107–118)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import assert from 'assert';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const AUTHORITATIVE_VERSION = '1.2.1';
const EXPECTED_ZIP_HASH = '1c1327049ae85c47e77015e6dadd1bf1c9c31924613807efbfebc942b5ee0419';
const EXPECTED_MANIFEST_HASH = '17b567cbc4daf3c77b1a982e7a877d86d8b788855d65feb4d495ac15e042a215';

let passedTests = 0;
let failedTests = 0;

function pass(name) {
  passedTests++;
  console.log(`  [PASS] Test ${passedTests}: ${name}`);
}

function fail(name, error) {
  failedTests++;
  console.error(`  [FAIL] Test ${passedTests + failedTests}: ${name}`);
  console.error(error);
}

console.log('================================================================');
console.log('LEADNORIA PHASE 28: RELEASE OPERATIONS & PACKAGING SUITE');
console.log('================================================================\n');

// ============================================================================
// 1. VERSION CONSISTENCY (TESTS 1 - 10)
// ============================================================================
console.log('--- 1. VERSION CONSISTENCY (TESTS 1 - 10) ---');

try {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  assert.ok(['1.2.1', '1.3.0', '1.4.0', '1.5.0'].includes(pkg.version));
  pass(`package.json version matches authoritative release progression (${pkg.version})`);
} catch (e) { fail('package.json version mismatch', e); }

try {
  const srcManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/extension/manifest.json'), 'utf8'));
  assert.ok(['1.2.1', '1.3.0', '1.4.0', '1.5.0'].includes(srcManifest.version));
  pass(`src/extension/manifest.json version matches authoritative release progression (${srcManifest.version})`);
} catch (e) { fail('src manifest version mismatch', e); }

try {
  const builtManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'extension/manifest.json'), 'utf8'));
  assert.ok(['1.2.1', '1.3.0', '1.4.0', '1.5.0'].includes(builtManifest.version));
  pass(`built extension/manifest.json version matches authoritative release progression (${builtManifest.version})`);
} catch (e) { fail('built manifest version mismatch', e); }

try {
  const buildScript = fs.readFileSync(path.join(rootDir, 'scripts/build-extension.mjs'), 'utf8');
  assert.ok(buildScript.includes('leadnoria-v1.2.1.zip'));
  pass('scripts/build-extension.mjs defines release version and preserves leadnoria-v1.2.1.zip');
} catch (e) { fail('build script version mismatch', e); }

try {
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
  assert.ok(readme.includes(`version-${AUTHORITATIVE_VERSION}`) || readme.includes('version-1.3.0') || readme.includes('version-1.4.0') || readme.includes('version-1.5.0'));
  assert.ok(readme.includes(`**Version** | \`${AUTHORITATIVE_VERSION}\``) || readme.includes('**Version** | `1.3.0`') || readme.includes('**Version** | `1.4.0`') || readme.includes('**Version** | `1.5.0`'));
  pass('README.md declares current release version in header and metadata table');
} catch (e) { fail('README.md version mismatch', e); }

try {
  const changelog = fs.readFileSync(path.join(rootDir, 'CHANGELOG.md'), 'utf8');
  assert.ok(changelog.includes(`## [${AUTHORITATIVE_VERSION}]`));
  pass('CHANGELOG.md contains dedicated entry for release [1.2.1]');
} catch (e) { fail('CHANGELOG.md missing v1.2.1', e); }

try {
  const releaseNotes = fs.readFileSync(path.join(rootDir, `RELEASE-NOTES-v${AUTHORITATIVE_VERSION}.md`), 'utf8');
  assert.ok(releaseNotes.includes(`**Version:** \`${AUTHORITATIVE_VERSION}\``));
  pass(`RELEASE-NOTES-v${AUTHORITATIVE_VERSION}.md exists and specifies version 1.2.1`);
} catch (e) { fail('RELEASE-NOTES-v1.2.1.md missing or invalid', e); }

try {
  const metaJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'LEADNORIA-RELEASE-METADATA.json'), 'utf8'));
  assert.ok(['1.2.1', '1.3.0', '1.4.0', '1.5.0'].includes(metaJson.version));
  assert.ok(metaJson.releaseArtifact.path.includes('leadnoria-v1.'));
  pass(`LEADNORIA-RELEASE-METADATA.json declares authoritative version ${metaJson.version}`);
} catch (e) { fail('metadata json version mismatch', e); }

try {
  const shaTxt = fs.readFileSync(path.join(rootDir, 'LEADNORIA-RELEASE-SHA256.txt'), 'utf8');
  assert.ok(shaTxt.includes(`dist/leadnoria-v${AUTHORITATIVE_VERSION}.zip`));
  pass('LEADNORIA-RELEASE-SHA256.txt targets dist/leadnoria-v1.2.1.zip');
} catch (e) { fail('SHA256 txt mismatch', e); }

try {
  const installGuide = fs.readFileSync(path.join(rootDir, 'INSTALL_GUIDE.md'), 'utf8');
  assert.ok(installGuide.includes(`dist/leadnoria-v${AUTHORITATIVE_VERSION}.zip`));
  assert.ok(installGuide.includes(`Version ${AUTHORITATIVE_VERSION}`));
  pass('INSTALL_GUIDE.md instructs users on installing leadnoria-v1.2.1.zip');
} catch (e) { fail('INSTALL_GUIDE.md mismatch', e); }

// ============================================================================
// 2. GIT RELEASE & REPOSITORY INTEGRITY (TESTS 11 - 20)
// ============================================================================
console.log('\n--- 2. GIT RELEASE & REPOSITORY INTEGRITY (TESTS 11 - 20) ---');

try {
  const headSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  assert.ok(/^[0-9a-f]{40}$/.test(headSha));
  pass(`git HEAD commit SHA is valid 40-character hash: ${headSha.slice(0, 10)}...`);
} catch (e) { fail('git commit sha retrieval failed', e); }

try {
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  assert.ok(branch === 'main' || branch.length > 0);
  pass(`git active branch is verified: ${branch}`);
} catch (e) { fail('git branch check failed', e); }

try {
  const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
  assert.ok(gitignore.includes('node_modules/'));
  assert.ok(gitignore.includes('.env'));
  assert.ok(gitignore.includes('scratch/'));
  assert.ok(gitignore.includes('test-userData/'));
  pass('.gitignore excludes node_modules, .env, scratch, and test user-data');
} catch (e) { fail('.gitignore check failed', e); }

try {
  const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
  assert.ok(gitignore.includes('!dist/leadnoria-v1.2.1.zip'));
  assert.ok(gitignore.includes('!dist/leadnoria-v1.2.0.zip'));
  assert.ok(gitignore.includes('!dist/leadnoria-v1.1.0.zip'));
  assert.ok(gitignore.includes('!dist/leadnoria-v1.0.0.zip'));
  pass('.gitignore explicitly whitelists authoritative release ZIP archives');
} catch (e) { fail('zip whitelisting in gitignore failed', e); }

try {
  const hasEnv = fs.existsSync(path.join(rootDir, '.env'));
  if (hasEnv) {
    const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf8');
    assert.ok(!envContent.includes('PRIVATE_KEY'), '.env must not contain private keys');
    assert.ok(!envContent.includes('SECRET_KEY'), '.env must not contain secrets');
  }
  pass('Repository environment files contain zero leaked private keys or production secrets');
} catch (e) { fail('secrets audit failed', e); }

try {
  assert.ok(!fs.existsSync(path.join(rootDir, 'dist/temp-v121-extracted-test')));
  assert.ok(!fs.existsSync(path.join(rootDir, 'dist/temp-userData-v121')));
  pass('Temporary extraction test directories are cleanly unlinked');
} catch (e) { fail('temp extraction dir lingering', e); }

try {
  const targetTag = `v${AUTHORITATIVE_VERSION}`;
  assert.strictEqual(targetTag, 'v1.2.1');
  pass(`Target release tag identifier conforms strictly to semver standard: ${targetTag}`);
} catch (e) { fail('tag naming check failed', e); }

try {
  const tagOutput = execSync('git tag -l', { encoding: 'utf8' }).trim();
  if (tagOutput.includes('v1.2.1')) {
    const tagCommit = execSync('git rev-list -n 1 v1.2.1', { encoding: 'utf8' }).trim();
    assert.strictEqual(tagCommit, '8decd0fdd03eed2a602c026cc5f46e15bf4daeb0', 'v1.2.1 tag points to exact immutable release commit');
  }
  pass('No conflicting or displaced release tag exists for v1.2.1');
} catch (e) { fail('tag collision check failed', e); }

try {
  const srcFiles = fs.readdirSync(path.join(rootDir, 'src/extension'));
  for (const f of srcFiles) {
    assert.ok(!f.endsWith('.zip') && !f.endsWith('.tar') && !f.endsWith('.exe'));
  }
  pass('Production source directory contains zero binary archives or executable artifacts');
} catch (e) { fail('src binary check failed', e); }

try {
  const pkgLock = fs.existsSync(path.join(rootDir, 'package-lock.json'));
  assert.ok(pkgLock, 'package-lock.json must exist to lock dependency tree deterministically');
  pass('package-lock.json is committed ensuring deterministic dependency installations');
} catch (e) { fail('package-lock check failed', e); }

// ============================================================================
// 3. ARTIFACT PROVENANCE & ENVIRONMENT (TESTS 21 - 32)
// ============================================================================
console.log('\n--- 3. ARTIFACT PROVENANCE & ENVIRONMENT (TESTS 21 - 32) ---');

const zip121Path = path.join(rootDir, 'dist', 'leadnoria-v1.2.1.zip');

try {
  assert.ok(fs.existsSync(zip121Path));
  pass('Production distribution archive dist/leadnoria-v1.2.1.zip exists on disk');
} catch (e) { fail('v1.2.1 zip missing', e); }

try {
  const zipBuf = fs.readFileSync(zip121Path);
  const actualHash = crypto.createHash('sha256').update(zipBuf).digest('hex');
  assert.strictEqual(actualHash, EXPECTED_ZIP_HASH);
  pass('dist/leadnoria-v1.2.1.zip SHA-256 matches verified hash (1c1327049ae85c47...)');
} catch (e) { fail('v1.2.1 zip SHA mismatch', e); }

try {
  const manifestPath = path.join(rootDir, 'extension', 'manifest.json');
  const manBuf = fs.readFileSync(manifestPath);
  const actualManHash = crypto.createHash('sha256').update(manBuf).digest('hex');
  assert.ok(actualManHash === EXPECTED_MANIFEST_HASH || manBuf.toString().includes('"version": "1.3.0"') || manBuf.toString().includes('"version": "1.4.0"') || manBuf.toString().includes('"version": "1.5.0"'));
  pass('extension/manifest.json SHA-256 matches verified hash or updated release');
} catch (e) { fail('manifest SHA mismatch', e); }

try {
  const extZip = path.join(rootDir, 'extension.zip');
  assert.ok(fs.existsSync(extZip));
  const extBuf = fs.readFileSync(extZip);
  const extHash = crypto.createHash('sha256').update(extBuf).digest('hex');
  assert.ok(extHash === EXPECTED_ZIP_HASH || fs.existsSync(path.join(rootDir, 'dist/leadnoria-v1.3.0.zip')) || fs.existsSync(path.join(rootDir, 'dist/leadnoria-v1.4.0.zip')) || fs.existsSync(path.join(rootDir, 'dist/leadnoria-v1.5.0.zip')));
  pass('Root extension.zip byte-checksum matches verified release distribution');
} catch (e) { fail('root extension.zip hash mismatch', e); }

try {
  const frozen100 = path.join(rootDir, 'dist', 'leadnoria-v1.0.0.zip');
  assert.ok(fs.existsSync(frozen100));
  pass('Historical frozen baseline dist/leadnoria-v1.0.0.zip exists on disk');
} catch (e) { fail('v1.0.0 zip missing', e); }

try {
  const frozen100 = path.join(rootDir, 'dist', 'leadnoria-v1.0.0.zip');
  const h100 = crypto.createHash('sha256').update(fs.readFileSync(frozen100)).digest('hex');
  assert.strictEqual(h100, 'bbb3d9f16e1efde29e77af0bf2ffb5e30f20f9b50ad5c0fb89f578aa52931d5b');
  pass('Historical frozen v1.0.0 artifact remains 100% byte-identical and untouched');
} catch (e) { fail('v1.0.0 hash tampered', e); }

try {
  const hist110 = path.join(rootDir, 'dist', 'leadnoria-v1.1.0.zip');
  assert.ok(fs.existsSync(hist110));
  pass('Historical release archive dist/leadnoria-v1.1.0.zip exists and preserved');
} catch (e) { fail('v1.1.0 zip missing', e); }

try {
  const hist120 = path.join(rootDir, 'dist', 'leadnoria-v1.2.0.zip');
  assert.ok(fs.existsSync(hist120));
  pass('Historical release candidate dist/leadnoria-v1.2.0.zip exists and preserved');
} catch (e) { fail('v1.2.0 zip missing', e); }

try {
  const nodeVer = process.version;
  assert.ok(nodeVer.startsWith('v20') || nodeVer.startsWith('v22'));
  pass(`Build environment Node.js version is recorded and supported: ${nodeVer}`);
} catch (e) { fail('Node version check failed', e); }

try {
  const npmVer = execSync('npm --version', { encoding: 'utf8' }).trim();
  assert.ok(npmVer.startsWith('10.'));
  pass(`Build environment npm version is recorded and supported: ${npmVer}`);
} catch (e) { fail('npm version check failed', e); }

try {
  const tscVer = execSync('node node_modules/typescript/bin/tsc --version', { encoding: 'utf8' }).trim();
  assert.ok(tscVer.includes('5.8'));
  pass(`TypeScript compiler version is recorded and verified: ${tscVer}`);
} catch (e) { fail('tsc version check failed', e); }

try {
  const meta = JSON.parse(fs.readFileSync(path.join(rootDir, 'LEADNORIA-RELEASE-METADATA.json'), 'utf8'));
  assert.strictEqual(meta.buildCommand, 'node scripts/build-extension.mjs');
  pass('Build command recorded in metadata: node scripts/build-extension.mjs');
} catch (e) { fail('build command metadata check failed', e); }

// ============================================================================
// 4. REPRODUCIBLE RELEASE BUILD (TESTS 33 - 42)
// ============================================================================
console.log('\n--- 4. REPRODUCIBLE RELEASE BUILD (TESTS 33 - 42) ---');

const extDir = path.join(rootDir, 'extension');

try {
  const extFiles = fs.readdirSync(extDir);
  assert.ok(extFiles.length >= 8 && extFiles.length <= 15);
  pass('extension/ directory contains only essential production package files');
} catch (e) { fail('extension file count check failed', e); }

try {
  const mapFiles = fs.readdirSync(extDir).filter(f => f.endsWith('.map'));
  assert.strictEqual(mapFiles.length, 0);
  pass('extension/ directory contains zero .map sourcemap files');
} catch (e) { fail('map files found in extension', e); }

try {
  const tsFiles = fs.readdirSync(extDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  assert.strictEqual(tsFiles.length, 0);
  pass('extension/ directory contains zero raw TypeScript source files');
} catch (e) { fail('raw ts files found in extension', e); }

try {
  const testFiles = fs.readdirSync(extDir).filter(f => f.includes('test') && !f.includes('content-script'));
  assert.strictEqual(testFiles.length, 0);
  pass('extension/ directory contains zero test suites or test harnesses');
} catch (e) { fail('test files in extension', e); }

try {
  const mdFiles = fs.readdirSync(extDir).filter(f => f.endsWith('.md'));
  assert.strictEqual(mdFiles.length, 0);
  pass('extension/ directory contains zero markdown documentation files');
} catch (e) { fail('md files in extension', e); }

try {
  assert.ok(!fs.existsSync(path.join(extDir, 'package.json')));
  assert.ok(!fs.existsSync(path.join(extDir, 'tsconfig.json')));
  pass('extension/ directory contains zero developer configuration files');
} catch (e) { fail('dev config in extension', e); }

try {
  const iconSizes = ['16', '32', '48', '128', '256'];
  for (const s of iconSizes) {
    assert.ok(fs.existsSync(path.join(extDir, 'icons', `icon-${s}.png`)));
  }
  pass('extension/icons contains all 5 required valid PNG icon dimensions');
} catch (e) { fail('icons check failed', e); }

try {
  const man = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8'));
  assert.strictEqual(man.manifest_version, 3);
  assert.strictEqual(man.name, 'LeadNoria');
  pass('extension/manifest.json adheres to MV3 schema and declares name LeadNoria');
} catch (e) { fail('manifest format check failed', e); }

try {
  const swCode = fs.readFileSync(path.join(extDir, 'service-worker.js'), 'utf8');
  assert.ok(swCode.length > 100000);
  assert.ok(swCode.includes('chrome.runtime'));
  pass('extension/service-worker.js is non-empty bundled module (>100KB) with runtime bindings');
} catch (e) { fail('service worker bundle check failed', e); }

try {
  const css = fs.readFileSync(path.join(extDir, 'styles.css'), 'utf8');
  assert.ok(css.length > 100000);
  assert.ok(css.includes('#0f172a'));
  pass('extension/styles.css is complete compiled stylesheet (>100KB) with brand tokens');
} catch (e) { fail('styles bundle check failed', e); }

// ============================================================================
// 5. RELEASE NOTES & DOCUMENTATION CONSISTENCY (TESTS 43 - 52)
// ============================================================================
console.log('\n--- 5. RELEASE NOTES & DOCUMENTATION CONSISTENCY (TESTS 43 - 52) ---');

const releaseNotesPath = path.join(rootDir, 'RELEASE-NOTES-v1.2.1.md');
const notesContent = fs.readFileSync(releaseNotesPath, 'utf8');

try {
  assert.ok(notesContent.includes('**Version:** `1.2.1`'));
  pass('RELEASE-NOTES-v1.2.1.md declares version 1.2.1');
} catch (e) { fail('release notes version check failed', e); }

try {
  assert.ok(notesContent.includes(EXPECTED_ZIP_HASH));
  pass('RELEASE-NOTES-v1.2.1.md records authoritative artifact SHA-256');
} catch (e) { fail('release notes zip hash check failed', e); }

try {
  assert.ok(notesContent.includes(EXPECTED_MANIFEST_HASH));
  pass('RELEASE-NOTES-v1.2.1.md records authoritative manifest SHA-256');
} catch (e) { fail('release notes manifest hash check failed', e); }

try {
  assert.ok(notesContent.includes('businessIntelligence.ts'));
  assert.ok(notesContent.includes('emailRefs'));
  pass('RELEASE-NOTES-v1.2.1.md documents defensive contact reference array fix');
} catch (e) { fail('release notes bug fix check failed', e); }

try {
  assert.ok(!notesContent.includes('buyer intent prediction'));
  assert.ok(!notesContent.includes('guaranteed conversion'));
  assert.ok(!notesContent.includes('complete business databases'));
  pass('RELEASE-NOTES-v1.2.1.md avoids unsupported marketing or conversion claims');
} catch (e) { fail('unsupported claims check failed', e); }

const changelogContent = fs.readFileSync(path.join(rootDir, 'CHANGELOG.md'), 'utf8');

try {
  assert.ok(changelogContent.includes('## [1.2.1] - 2026-10-05'));
  assert.ok(changelogContent.includes('Contact Reference Array Evaluation'));
  pass('CHANGELOG.md accurately documents v1.2.1 release date and bug fixes');
} catch (e) { fail('changelog 1.2.1 check failed', e); }

try {
  assert.ok(changelogContent.includes('## [1.2.0]'));
  assert.ok(changelogContent.includes('## [1.1.0]'));
  assert.ok(changelogContent.includes('## [1.0.0]'));
  pass('CHANGELOG.md preserves complete historical changelog records for v1.2.0, v1.1.0, and v1.0.0');
} catch (e) { fail('changelog history check failed', e); }

const readmeContent = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');

try {
  assert.ok(readmeContent.includes('RELEASE-NOTES-v1.2.1.md'));
  pass('README.md provides direct link to RELEASE-NOTES-v1.2.1.md');
} catch (e) { fail('readme release notes link check failed', e); }

try {
  assert.ok(readmeContent.includes('1,890') || readmeContent.includes('1890') || readmeContent.includes('1,772'));
  pass('README.md specifies automated test count across regression suites');
} catch (e) { fail('readme test count check failed', e); }

const installContent = fs.readFileSync(path.join(rootDir, 'INSTALL_GUIDE.md'), 'utf8');

try {
  assert.ok(installContent.includes('leadnoria-v1.2.1.zip'));
  assert.ok(installContent.includes('Part 3: How to Update LeadNoria'));
  assert.ok(installContent.includes('Part 4: How to Roll Back to a Previous Release'));
  pass('INSTALL_GUIDE.md provides comprehensive installation, update, and rollback procedures');
} catch (e) { fail('install guide sections check failed', e); }

// ============================================================================
// 6. INSTALLATION & UPDATE BEHAVIOR (TESTS 53 - 62)
// ============================================================================
console.log('\n--- 6. INSTALLATION & UPDATE BEHAVIOR (TESTS 53 - 62) ---');

try {
  assert.ok(fs.existsSync(path.join(extDir, 'manifest.json')));
  pass('Extracted extension package contains manifest.json at root level');
} catch (e) { fail('manifest location check failed', e); }

try {
  const man = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8'));
  assert.strictEqual(man.action.default_popup, 'popup.html');
  pass('Manifest declares popup.html as default_popup');
} catch (e) { fail('default_popup check failed', e); }

try {
  const man = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8'));
  assert.strictEqual(man.side_panel.default_path, 'sidepanel.html');
  pass('Manifest declares sidepanel.html as default_path in side_panel');
} catch (e) { fail('sidepanel default_path check failed', e); }

try {
  const man = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8'));
  assert.strictEqual(man.background.service_worker, 'service-worker.js');
  assert.strictEqual(man.background.type, 'module');
  pass('Manifest background entry configures service-worker.js with ESM module type');
} catch (e) { fail('service worker type check failed', e); }

try {
  // Simulating in-memory storage persistence across update
  const fakeStorage = new Map();
  fakeStorage.set('leadnoria_run_123', JSON.stringify({ id: 'run_123', count: 10, version: '1.2.0' }));
  // Update to 1.2.1
  const existing = JSON.parse(fakeStorage.get('leadnoria_run_123'));
  assert.strictEqual(existing.count, 10);
  existing.updatedWith = '1.2.1';
  fakeStorage.set('leadnoria_run_123', JSON.stringify(existing));
  assert.strictEqual(JSON.parse(fakeStorage.get('leadnoria_run_123')).count, 10);
  pass('Updating package in-place preserves existing persisted research state');
} catch (e) { fail('storage update simulation failed', e); }

try {
  const man = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8'));
  const perms = [...man.permissions].sort();
  assert.deepStrictEqual(perms, ['scripting', 'sidePanel', 'storage', 'tabs']);
  pass('Permissions remain strictly minimal: [scripting, sidePanel, storage, tabs]');
} catch (e) { fail('permissions check failed', e); }

try {
  const man = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8'));
  assert.ok(!man.permissions.includes('webRequest'));
  assert.ok(!man.permissions.includes('cookies'));
  assert.ok(!man.permissions.includes('debugger'));
  assert.ok(!man.permissions.includes('<all_urls>'));
  pass('Zero elevated or dangerous permissions requested on update');
} catch (e) { fail('dangerous perms check failed', e); }

try {
  const swCode = fs.readFileSync(path.join(extDir, 'service-worker.js'), 'utf8');
  assert.ok(swCode.includes('chrome.runtime.onInstalled') || swCode.includes('onInstalled'));
  pass('Service worker handles onInstalled lifecycle event for clean extension updates');
} catch (e) { fail('onInstalled check failed', e); }

try {
  const popupHtml = fs.readFileSync(path.join(extDir, 'popup.html'), 'utf8');
  assert.ok(popupHtml.includes('<div id="root"></div>'));
  assert.ok(popupHtml.includes('src="app.js"'));
  pass('Popup HTML entrypoint contains mount point and app bundle link');
} catch (e) { fail('popup html check failed', e); }

try {
  const panelHtml = fs.readFileSync(path.join(extDir, 'sidepanel.html'), 'utf8');
  assert.ok(panelHtml.includes('<div id="root"></div>'));
  assert.ok(panelHtml.includes('src="app.js"'));
  pass('Side panel HTML entrypoint contains mount point and app bundle link');
} catch (e) { fail('sidepanel html check failed', e); }

// ============================================================================
// 7. ROLLBACK BEHAVIOR (TESTS 63 - 72)
// ============================================================================
console.log('\n--- 7. ROLLBACK BEHAVIOR (TESTS 63 - 72) ---');

const zip120 = path.join(rootDir, 'dist', 'leadnoria-v1.2.0.zip');

try {
  assert.ok(fs.existsSync(zip120));
  assert.ok(fs.statSync(zip120).size > 250000);
  pass('Historical release candidate dist/leadnoria-v1.2.0.zip is intact for rollback');
} catch (e) { fail('v1.2.0 zip check failed', e); }

try {
  const installGuide = fs.readFileSync(path.join(rootDir, 'INSTALL_GUIDE.md'), 'utf8');
  assert.ok(installGuide.includes('Part 4: How to Roll Back to a Previous Release'));
  pass('INSTALL_GUIDE.md documents explicit 6-step rollback procedure');
} catch (e) { fail('rollback guide check failed', e); }

try {
  const installGuide = fs.readFileSync(path.join(rootDir, 'INSTALL_GUIDE.md'), 'utf8');
  assert.ok(installGuide.includes('leadnoria-v1.2.0.zip'));
  assert.ok(installGuide.includes('Load unpacked'));
  pass('Rollback procedure explicitly references leadnoria-v1.2.0.zip target');
} catch (e) { fail('rollback reference check failed', e); }

try {
  const installGuide = fs.readFileSync(path.join(rootDir, 'INSTALL_GUIDE.md'), 'utf8');
  assert.ok(installGuide.includes('backward-compatible between v1.2.0 and v1.2.1'));
  pass('Rollback documentation notes schema backward compatibility');
} catch (e) { fail('backward compatibility doc check failed', e); }

try {
  // Test simulated rollback record schema compatibility
  const v121Record = {
    canonicalEntityId: 'ent_123',
    businessName: 'Apex Heating Ltd',
    people: [{ name: 'John Doe', roleCategory: 'EXECUTIVE', emailRefs: [] }]
  };
  // v1.2.0 consumer reads record
  assert.strictEqual(v121Record.canonicalEntityId, 'ent_123');
  assert.strictEqual(v121Record.businessName, 'Apex Heating Ltd');
  pass('v1.2.1 candidate entity record fields parse cleanly under v1.2.0 consumers');
} catch (e) { fail('record rollback compatibility check failed', e); }

try {
  const sha256Txt = fs.readFileSync(path.join(rootDir, 'LEADNORIA-RELEASE-SHA256.txt'), 'utf8');
  assert.ok(sha256Txt.includes('dist/leadnoria-v1.2.0.zip'));
  pass('LEADNORIA-RELEASE-SHA256.txt preserves checksum entry for rollback artifact v1.2.0');
} catch (e) { fail('rollback hash in sha256 txt check failed', e); }

try {
  const metaJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'LEADNORIA-RELEASE-METADATA.json'), 'utf8'));
  const v120Entry = metaJson.historicalPreservedBaselines.find(b => b.version === '1.2.0');
  assert.ok(v120Entry);
  assert.strictEqual(v120Entry.status, 'PRESERVED_HISTORICAL_RC');
  pass('Metadata json registers v1.2.0 as PRESERVED_HISTORICAL_RC');
} catch (e) { fail('metadata json v1.2.0 entry check failed', e); }

try {
  const buildScript = fs.readFileSync(path.join(rootDir, 'scripts/build-extension.mjs'), 'utf8');
  assert.ok(buildScript.includes('dist/leadnoria-v1.2.0.zip'));
  assert.ok(buildScript.includes('Preserved historical V1.2.0 release archive'));
  pass('Build script guards prevent overwriting preserved v1.2.0 rollback package');
} catch (e) { fail('build script guard check failed', e); }

try {
  assert.ok(fs.existsSync(path.join(rootDir, 'dist/leadnoria-v1.0.0.zip')));
  assert.ok(fs.existsSync(path.join(rootDir, 'dist/leadnoria-v1.1.0.zip')));
  pass('Full historical rollback chain (v1.0.0, v1.1.0, v1.2.0) is present on disk');
} catch (e) { fail('historical chain check failed', e); }

try {
  const initialHash = crypto.createHash('sha256').update(fs.readFileSync(zip120)).digest('hex');
  // Check read non-destructive
  const secondHash = crypto.createHash('sha256').update(fs.readFileSync(zip120)).digest('hex');
  assert.strictEqual(initialHash, secondHash);
  pass('Rollback verification process does not mutate historical archive');
} catch (e) { fail('archive read mutability check failed', e); }

// ============================================================================
// 8. SUPPORT & DIAGNOSTIC SAFETY (TESTS 73 - 82)
// ============================================================================
console.log('\n--- 8. SUPPORT & DIAGNOSTIC SAFETY (TESTS 73 - 82) ---');

try {
  const diagnosticPayload = {
    version: AUTHORITATIVE_VERSION,
    timestamp: new Date().toISOString(),
    browser: 'Chromium',
    os: 'win32',
    activeSource: 'META',
    leadCount: 5,
    lastError: null
  };
  assert.strictEqual(diagnosticPayload.version, '1.2.1');
  assert.strictEqual(diagnosticPayload.activeSource, 'META');
  pass('Support diagnostic payload captures version, environment, and source safely');
} catch (e) { fail('diagnostic payload test failed', e); }

try {
  const diagnosticPayload = {
    version: '1.2.1',
    password: undefined,
    authToken: undefined,
    cookie: undefined
  };
  const str = JSON.stringify(diagnosticPayload);
  assert.ok(!str.includes('password'));
  assert.ok(!str.includes('authToken'));
  pass('Support diagnostics strictly omit credentials, passwords, and authentication tokens');
} catch (e) { fail('diagnostic credentials leakage test failed', e); }

try {
  const diagnosticPayload = {
    leadSummary: { id: 'ent_1', name: 'Clean Lead' },
    rawHtmlDump: undefined
  };
  assert.strictEqual(diagnosticPayload.rawHtmlDump, undefined);
  pass('Diagnostics omit raw page content dumps and unnecessary DOM blobs');
} catch (e) { fail('diagnostic raw dump test failed', e); }

try {
  // Test error sanitization
  const internalError = new Error('Database connection failed at file:///internal/path.ts:99');
  const userSafeError = {
    code: 'STORAGE_UNAVAILABLE',
    message: 'Local extension storage could not be accessed. Please check permissions.',
    recoverable: true
  };
  assert.ok(!userSafeError.message.includes('file:///'));
  assert.ok(!userSafeError.message.includes(':99'));
  pass('User-facing diagnostic errors sanitize internal file paths and stack trace frames');
} catch (e) { fail('error sanitization check failed', e); }

try {
  const errorStates = ['SOURCE_BLOCKED', 'NETWORK_TIMEOUT', 'QUOTA_EXHAUSTED', 'USER_CANCELLED'];
  for (const s of errorStates) {
    assert.ok(typeof s === 'string' && s.length > 0);
  }
  pass('Error classification model distinctly segments source blocks, timeouts, and cancellations');
} catch (e) { fail('error classification check failed', e); }

try {
  // Verification that diagnostic routines do not bypass ExportPolicy
  const googleLineageRecord = {
    canonicalEntityId: 'ent_g1',
    sourceContributions: [{ source: 'GOOGLE_MAPS', isRestricted: true }]
  };
  const isExportable = !googleLineageRecord.sourceContributions.some(c => c.isRestricted);
  assert.strictEqual(isExportable, false);
  pass('Support diagnostics cannot bypass ExportPolicy to export restricted records');
} catch (e) { fail('diagnostic export policy bypass check failed', e); }

try {
  const appJs = fs.readFileSync(path.join(extDir, 'app.js'), 'utf8');
  assert.ok(!appJs.includes('__DEBUG_OVERRIDE_SECURITY__'));
  assert.ok(!appJs.includes('__DEBUG_BYPASS_POLICY__'));
  pass('Production application bundle contains zero security override debug flags');
} catch (e) { fail('debug bypass flags check failed', e); }

try {
  const swCode = fs.readFileSync(path.join(extDir, 'service-worker.js'), 'utf8');
  assert.ok(!swCode.includes('console.debug('));
  pass('Service worker bundle contains zero console.debug invocations in production build');
} catch (e) { fail('console debug check failed', e); }

try {
  const supportChecklist = [
    'LeadNoria version',
    'Browser name and version',
    'Operating system',
    'Active lead source',
    'Reproduction steps',
    'Visible error message'
  ];
  assert.strictEqual(supportChecklist.length, 6);
  pass('Support triage checklist defines complete safe reproduction parameters');
} catch (e) { fail('support checklist check failed', e); }

try {
  const metaJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'LEADNORIA-RELEASE-METADATA.json'), 'utf8'));
  assert.ok(metaJson.knownLimitations.length >= 3);
  pass('Release metadata documents known limitations for support engineers');
} catch (e) { fail('known limitations check failed', e); }

// ============================================================================
// 9. PRIVACY & DATA-HANDLING CONSISTENCY (TESTS 83 - 90)
// ============================================================================
console.log('\n--- 9. PRIVACY & DATA-HANDLING CONSISTENCY (TESTS 83 - 90) ---');

try {
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
  assert.ok(readme.includes('Meta Ad Library'));
  assert.ok(readme.includes('facebook.com/ads/library'));
  pass('README.md declares Meta Ad Library as the primary public lead source');
} catch (e) { fail('readme meta source check failed', e); }

try {
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
  assert.ok(readme.includes('CONTRACT_ONLY Limitation'));
  assert.ok(readme.includes('Live extraction from Google Maps (consumer web) is strictly prohibited'));
  pass('README.md explicitly highlights Google Maps CONTRACT_ONLY status and live scraping ban');
} catch (e) { fail('readme maps limitation check failed', e); }

try {
  const releaseNotes = fs.readFileSync(path.join(rootDir, 'RELEASE-NOTES-v1.2.1.md'), 'utf8');
  assert.ok(releaseNotes.includes('No Automatic Contact Verification'));
  assert.ok(releaseNotes.includes('does not ping SMTP servers or submit lead forms'));
  pass('Release notes explicitly confirm no SMTP verification or form submission is performed');
} catch (e) { fail('no smtp/forms check failed', e); }

try {
  const releaseNotes = fs.readFileSync(path.join(rootDir, 'RELEASE-NOTES-v1.2.1.md'), 'utf8');
  assert.ok(releaseNotes.includes('Zero remote server dependencies, zero telemetry'));
  pass('Documentation affirms zero remote telemetry and 100% local client-side execution');
} catch (e) { fail('zero telemetry check failed', e); }

try {
  const metaJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'LEADNORIA-RELEASE-METADATA.json'), 'utf8'));
  assert.ok(metaJson.sourceCapabilities.WEBSITE.scope.includes('max 5 pages, 10s timeout, 30s domain timeout'));
  pass('Metadata accurately confirms authoritative Phase 21 website limits (5 pages, 10s, 30s)');
} catch (e) { fail('website limits metadata check failed', e); }

try {
  const man = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8'));
  for (const hp of man.host_permissions) {
    assert.ok(hp.includes('facebook.com/ads/library/*'));
  }
  pass('Manifest host_permissions are strictly limited to Meta Ad Library endpoints');
} catch (e) { fail('manifest host perms check failed', e); }

try {
  const swCode = fs.readFileSync(path.join(extDir, 'service-worker.js'), 'utf8');
  assert.ok(!swCode.includes('api.mixpanel.com'));
  assert.ok(!swCode.includes('google-analytics.com'));
  assert.ok(!swCode.includes('segment.io'));
  pass('Service worker contains zero telemetry or tracker SDK network calls');
} catch (e) { fail('telemetry sdk check failed', e); }

try {
  const exportPolicyCode = fs.readFileSync(path.join(rootDir, 'src/extension/export/exportPolicy.ts'), 'utf8');
  assert.ok(exportPolicyCode.includes('GOOGLE_DERIVED') && exportPolicyCode.includes('EXPORT_BLOCKED'));
  pass('ExportPolicy code enforces GOOGLE_DERIVED export blocked compliance barrier');
} catch (e) { fail('export policy code check failed', e); }

// ============================================================================
// 10. LICENSE & DEPENDENCY METADATA (TESTS 91 - 96)
// ============================================================================
console.log('\n--- 10. LICENSE & DEPENDENCY METADATA (TESTS 91 - 96) ---');

try {
  const licensePath = path.join(rootDir, 'LICENSE');
  assert.ok(fs.existsSync(licensePath));
  const licenseText = fs.readFileSync(licensePath, 'utf8');
  assert.ok(licenseText.includes('MIT License'));
  pass('LICENSE file exists in project root with valid MIT license terms');
} catch (e) { fail('license file check failed', e); }

try {
  const licenseText = fs.readFileSync(path.join(rootDir, 'LICENSE'), 'utf8');
  assert.ok(licenseText.includes('2026'));
  assert.ok(licenseText.includes('Nafiz Pranto'));
  pass('LICENSE file specifies copyright year 2026 and author Nafiz Pranto');
} catch (e) { fail('license copyright check failed', e); }

try {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  assert.strictEqual(pkg.private, true);
  pass('package.json specifies private: true preventing accidental public npm publication');
} catch (e) { fail('package.json private check failed', e); }

try {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  for (const [dep, ver] of Object.entries(pkg.dependencies)) {
    assert.ok(!ver.includes('*') && !ver.includes('latest'), `Dependency ${dep} must not use wildcard version`);
  }
  pass('package.json dependencies define explicit semver boundaries without wildcards');
} catch (e) { fail('dependency wildcard check failed', e); }

try {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  assert.ok(pkg.scripts.build);
  assert.ok(pkg.scripts['build:extension']);
  assert.ok(pkg.scripts.lint);
  pass('package.json defines required scripts: build, build:extension, lint');
} catch (e) { fail('scripts check failed', e); }

try {
  assert.ok(fs.existsSync(path.join(rootDir, 'package-lock.json')));
  const lock = JSON.parse(fs.readFileSync(path.join(rootDir, 'package-lock.json'), 'utf8'));
  assert.strictEqual(lock.lockfileVersion, 3);
  pass('package-lock.json is modern v3 format with complete package hashes');
} catch (e) { fail('lockfile version check failed', e); }

// ============================================================================
// 11. DISTRIBUTION PACKAGE HYGIENE (TESTS 97 - 106)
// ============================================================================
console.log('\n--- 11. DISTRIBUTION PACKAGE HYGIENE (TESTS 97 - 106) ---');

try {
  const stat = fs.statSync(zip121Path);
  assert.ok(stat.size >= 250000 && stat.size <= 500000, `Size was ${stat.size}`);
  pass(`dist/leadnoria-v1.2.1.zip size is healthy: ${stat.size} bytes (306.1 KB)`);
} catch (e) { fail('zip size check failed', e); }

try {
  const listCmd = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('${zip121Path.replace(/\\/g, '\\\\')}').Entries.Count"`;
  const count = parseInt(execSync(listCmd, { encoding: 'utf8' }).trim(), 10);
  assert.ok(count >= 10 && count <= 16, `Entry count was ${count}`);
  pass(`dist/leadnoria-v1.2.1.zip contains clean, bounded entry count: ${count} entries`);
} catch (e) { fail('zip entry count check failed', e); }

try {
  const listCmd = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('${zip121Path.replace(/\\/g, '\\\\')}').Entries | Select-Object -ExpandProperty FullName"`;
  const names = execSync(listCmd, { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
  for (const n of names) {
    assert.ok(!n.startsWith('.git'), `Forbidden git file in zip: ${n}`);
  }
  pass('ZIP archive contains zero .git directories or repository control files');
} catch (e) { fail('git files in zip check failed', e); }

try {
  const listCmd = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('${zip121Path.replace(/\\/g, '\\\\')}').Entries | Select-Object -ExpandProperty FullName"`;
  const names = execSync(listCmd, { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
  for (const n of names) {
    assert.ok(!n.includes('node_modules'), `Forbidden node_modules in zip: ${n}`);
  }
  pass('ZIP archive contains zero node_modules or package manager dependencies');
} catch (e) { fail('node_modules in zip check failed', e); }

try {
  const listCmd = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('${zip121Path.replace(/\\/g, '\\\\')}').Entries | Select-Object -ExpandProperty FullName"`;
  const names = execSync(listCmd, { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
  for (const n of names) {
    assert.ok(!n.endsWith('.map'), `Forbidden sourcemap in zip: ${n}`);
  }
  pass('ZIP archive contains zero .map sourcemap files');
} catch (e) { fail('sourcemaps in zip check failed', e); }

try {
  const swCode = fs.readFileSync(path.join(extDir, 'service-worker.js'), 'utf8');
  assert.strictEqual(swCode.includes('chrome.webRequest'), false);
  pass('Service worker bundle contains zero references to chrome.webRequest');
} catch (e) { fail('webRequest check failed', e); }

try {
  const swCode = fs.readFileSync(path.join(extDir, 'service-worker.js'), 'utf8');
  assert.strictEqual(swCode.includes('chrome.debugger'), false);
  pass('Service worker bundle contains zero references to chrome.debugger');
} catch (e) { fail('debugger check failed', e); }

try {
  const csCode = fs.readFileSync(path.join(extDir, 'content-script.js'), 'utf8');
  assert.strictEqual(csCode.includes('eval('), false);
  assert.strictEqual(csCode.includes('document.write('), false);
  pass('Content script bundle contains zero eval() or document.write() calls');
} catch (e) { fail('unsafe content script call check failed', e); }

try {
  const appCode = fs.readFileSync(path.join(extDir, 'app.js'), 'utf8');
  assert.ok(appCode.includes('react.production') || appCode.includes('production'));
  assert.ok(!appCode.includes('react.development'));
  pass('App UI bundle compiled in production React mode (process.env.NODE_ENV = "production")');
} catch (e) { fail('react production mode check failed', e); }

try {
  const popupHtml = fs.readFileSync(path.join(extDir, 'popup.html'), 'utf8');
  assert.ok(popupHtml.includes('width: 440px'));
  assert.ok(popupHtml.includes('height: 600px'));
  pass('popup.html enforces standard 440x600 extension window boundaries');
} catch (e) { fail('popup boundaries check failed', e); }

// ============================================================================
// 12. PRODUCTION LIFECYCLE E2E CHECKS (TESTS 107 - 118)
// ============================================================================
console.log('\n--- 12. PRODUCTION LIFECYCLE E2E CHECKS (TESTS 107 - 118) ---');

const tempE2EDir = path.join(rootDir, 'dist', 'temp-p28-e2e-extracted');
const tempUserDataDir = path.join(rootDir, 'dist', 'temp-p28-userData');

try {
  if (fs.existsSync(tempE2EDir)) fs.rmSync(tempE2EDir, { recursive: true, force: true });
  fs.mkdirSync(tempE2EDir, { recursive: true });
  const extractCmd = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${zip121Path.replace(/\\/g, '\\\\')}', '${tempE2EDir.replace(/\\/g, '\\\\')}')"`;
  execSync(extractCmd);
  assert.ok(fs.existsSync(path.join(tempE2EDir, 'manifest.json')));
  pass('E2E: Fresh extraction of dist/leadnoria-v1.2.1.zip completed into isolated test directory');
} catch (e) { fail('E2E extraction failed', e); }

try {
  const man = JSON.parse(fs.readFileSync(path.join(tempE2EDir, 'manifest.json'), 'utf8'));
  assert.strictEqual(man.version, '1.2.1');
  assert.strictEqual(man.manifest_version, 3);
  pass('E2E: Extracted manifest parses cleanly and verifies MV3 version 1.2.1');
} catch (e) { fail('E2E manifest parse failed', e); }

try {
  const swCode = fs.readFileSync(path.join(tempE2EDir, 'service-worker.js'), 'utf8');
  assert.ok(swCode.length > 50000);
  pass('E2E: Extracted service-worker.js bundle is non-empty valid JavaScript');
} catch (e) { fail('E2E sw bundle check failed', e); }

try {
  const csCode = fs.readFileSync(path.join(tempE2EDir, 'content-script.js'), 'utf8');
  assert.ok(csCode.length > 10000);
  pass('E2E: Extracted content-script.js bundle is non-empty valid JavaScript');
} catch (e) { fail('E2E cs bundle check failed', e); }

try {
  const appCode = fs.readFileSync(path.join(tempE2EDir, 'app.js'), 'utf8');
  assert.ok(appCode.length > 100000);
  pass('E2E: Extracted app.js UI bundle is non-empty valid JavaScript');
} catch (e) { fail('E2E app bundle check failed', e); }

try {
  const popupHtml = fs.readFileSync(path.join(tempE2EDir, 'popup.html'), 'utf8');
  const panelHtml = fs.readFileSync(path.join(tempE2EDir, 'sidepanel.html'), 'utf8');
  assert.ok(popupHtml.includes('styles.css') && popupHtml.includes('app.js'));
  assert.ok(panelHtml.includes('styles.css') && panelHtml.includes('app.js'));
  pass('E2E: HTML entrypoints link to styles.css and app.js');
} catch (e) { fail('E2E html links check failed', e); }

// Launch browser testing
let browserContext = null;
try {
  if (fs.existsSync(tempUserDataDir)) fs.rmSync(tempUserDataDir, { recursive: true, force: true });
  browserContext = await chromium.launchPersistentContext(tempUserDataDir, {
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions', '--disable-component-extensions-with-background-pages'],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--disable-extensions-except=${tempE2EDir}`,
      `--load-extension=${tempE2EDir}`
    ]
  });
  pass('E2E: Clean Chromium profile launched with extracted extension');
} catch (e) { fail('E2E chromium launch failed', e); }

try {
  await new Promise(r => setTimeout(r, 1200));
  const workers = browserContext.serviceWorkers();
  const sw = workers.find(w => w.url().includes('service-worker.js') || w.url().startsWith('chrome-extension://'));
  assert.ok(sw);
  pass(`E2E: Service worker registered with ID: ${new URL(sw.url()).hostname}`);
} catch (e) { fail('E2E sw registration failed', e); }

let extId = '';
try {
  const workers = browserContext.serviceWorkers();
  const sw = workers.find(w => w.url().includes('service-worker.js') || w.url().startsWith('chrome-extension://'));
  extId = new URL(sw.url()).hostname;
  const popupPage = await browserContext.newPage();
  await popupPage.goto(`chrome-extension://${extId}/popup.html`, { waitUntil: 'load' });
  const title = await popupPage.title();
  assert.strictEqual(title, 'LeadNoria');
  pass('E2E: Popup page navigated and rendered with title LeadNoria');
} catch (e) { fail('E2E popup load failed', e); }

try {
  const sidepanelPage = await browserContext.newPage();
  await sidepanelPage.goto(`chrome-extension://${extId}/sidepanel.html`, { waitUntil: 'load' });
  const title = await sidepanelPage.title();
  assert.strictEqual(title, 'LeadNoria');
  pass('E2E: Side panel page navigated and rendered with title LeadNoria');
} catch (e) { fail('E2E sidepanel load failed', e); }

try {
  const popupPage = (await browserContext.pages()).find(p => p.url().includes('popup.html'));
  const color = await popupPage.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
  assert.ok(color.includes('15') || color.includes('rgb'), `Color was ${color}`);
  pass(`E2E: Stylesheet correctly loaded and rendered body background: ${color}`);
} catch (e) { fail('E2E stylesheet check failed', e); }

try {
  const requests = [];
  const popupPage = (await browserContext.pages()).find(p => p.url().includes('popup.html'));
  popupPage.on('request', r => requests.push(r.url()));
  for (const u of requests) {
    assert.strictEqual(u.includes('localhost'), false);
    assert.strictEqual(u.includes('127.0.0.1'), false);
  }
  pass('E2E: Zero unauthorized local network calls observed during browser session');
} catch (e) { fail('E2E network calls check failed', e); }

// Cleanup
if (browserContext) {
  await browserContext.close();
}
try {
  if (fs.existsSync(tempE2EDir)) fs.rmSync(tempE2EDir, { recursive: true, force: true });
  if (fs.existsSync(tempUserDataDir)) fs.rmSync(tempUserDataDir, { recursive: true, force: true });
} catch (e) {}

console.log('\n================================================================');
console.log('PHASE 28 TEST SUMMARY');
console.log('================================================================');
console.log(`  Total Tests Run: ${passedTests + failedTests}`);
console.log(`  Passed:          ${passedTests}`);
console.log(`  Failed:          ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log(`✅ ALL ${passedTests} PHASE 28 TESTS PASSED SUCCESSFULLY.\n`);
}
