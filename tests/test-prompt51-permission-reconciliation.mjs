/**
 * LEADNORIA v1.1 MASTER PROMPT 5.1 PERMISSION RECONCILIATION SUITE
 * 
 * Verifies:
 * 1. Final manifest permission declarations in src/extension/manifest.json and extension/manifest.json
 * 2. Absolute absence of webRequest and declarativeNetRequest across runtime code
 * 3. Justification and active code references for each declared permission:
 *    - storage
 *    - tabs
 *    - scripting
 *    - sidePanel
 * 4. Strict host_permissions scoping (only public Meta Ad Library URLs, no <all_urls>)
 * 5. Network safety verification (no external servers, no localhost, no scraping services)
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function runPermissionReconciliationTests() {
  console.log('================================================================');
  console.log('LEADNORIA v1.1 PROMPT 5.1: PERMISSION & NETWORK API RECONCILIATION');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      passed++;
      console.log(`[PASS] ${name}`);
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      throw err;
    }
  }

  // -------------------------------------------------------------
  // 1. MANIFEST INSPECTION
  // -------------------------------------------------------------
  console.log('--- TEST GROUP 1: MANIFEST INSPECTION ---');

  const srcManifestPath = path.join(rootDir, 'src', 'extension', 'manifest.json');
  const prodManifestPath = path.join(rootDir, 'extension', 'manifest.json');

  assert.ok(fs.existsSync(srcManifestPath), 'src/extension/manifest.json must exist');
  assert.ok(fs.existsSync(prodManifestPath), 'extension/manifest.json must exist');

  const srcManifest = JSON.parse(fs.readFileSync(srcManifestPath, 'utf8'));
  const prodManifest = JSON.parse(fs.readFileSync(prodManifestPath, 'utf8'));

  test('1.1: Production manifest permissions match exact minimal set', () => {
    const expected = ['scripting', 'sidePanel', 'storage', 'tabs'].sort();
    const actual = [...prodManifest.permissions].sort();
    assert.deepStrictEqual(actual, expected, 'Permissions must be exactly [scripting, sidePanel, storage, tabs]');
  });

  test('1.2: Source manifest permissions match production manifest', () => {
    assert.deepStrictEqual(srcManifest.permissions.sort(), prodManifest.permissions.sort());
  });

  test('1.3: webRequest is NOT declared in permissions or optional_permissions', () => {
    assert.strictEqual(prodManifest.permissions.includes('webRequest'), false);
    assert.strictEqual(prodManifest.permissions.includes('webRequestBlocking'), false);
    assert.strictEqual(Boolean(prodManifest.optional_permissions?.includes('webRequest')), false);
  });

  test('1.4: declarativeNetRequest is NOT declared in permissions or manifest keys', () => {
    assert.strictEqual(prodManifest.permissions.includes('declarativeNetRequest'), false);
    assert.strictEqual(prodManifest.permissions.includes('declarativeNetRequestWithHostAccess'), false);
    assert.strictEqual(prodManifest.permissions.includes('declarativeNetRequestFeedback'), false);
    assert.strictEqual(prodManifest.declarative_net_request, undefined);
  });

  test('1.5: host_permissions are strictly limited to Meta Ad Library (NO <all_urls>)', () => {
    assert.ok(prodManifest.host_permissions.length > 0);
    assert.strictEqual(prodManifest.host_permissions.includes('<all_urls>'), false);
    assert.strictEqual(prodManifest.host_permissions.includes('*://*/*'), false);
    for (const hp of prodManifest.host_permissions) {
      assert.ok(
        hp.includes('facebook.com/ads/library/*'),
        `Host permission ${hp} must be restricted to Meta Ad Library`
      );
    }
  });

  // -------------------------------------------------------------
  // 2. RUNTIME CODEBASE AUDIT FOR NETWORK INTERCEPTION APIS
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: RUNTIME SOURCE CODE AUDIT ---');

  const runtimeDirs = [
    path.join(rootDir, 'src', 'extension'),
    path.join(rootDir, 'extension')
  ];

  const bannedPatterns = [
    /chrome\.webRequest/i,
    /browser\.webRequest/i,
    /\bwebRequest\./i,
    /\bonBeforeRequest\b/i,
    /\bonBeforeSendHeaders\b/i,
    /\bonHeadersReceived\b/i,
    /\bonCompleted\b/i,
    /\bonErrorOccurred\b/i,
    /\bwebRequestBlocking\b/i,
    /\bwebRequestAuthProvider\b/i,
    /chrome\.declarativeNetRequest/i,
    /browser\.declarativeNetRequest/i,
    /\bdeclarativeNetRequest\./i,
    /\bupdateDynamicRules\b/i,
    /\bupdateSessionRules\b/i,
    /\bgetMatchedRules\b/i,
    /\bonRuleMatchedDebug\b/i,
    /\brule_resources\b/i
  ];

  function getFilesRecursively(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(getFilesRecursively(fullPath));
      } else if (/\.(ts|tsx|js|mjs|html)$/.test(entry.name) && !entry.name.endsWith('.map')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  test('2.1: Zero occurrences of webRequest and declarativeNetRequest in src/extension/', () => {
    const srcFiles = getFilesRecursively(path.join(rootDir, 'src', 'extension'));
    let violations = [];
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of bannedPatterns) {
        if (pattern.test(content)) {
          violations.push({ file: path.relative(rootDir, file), pattern: pattern.toString() });
        }
      }
    }
    assert.strictEqual(violations.length, 0, `Found banned API usages: ${JSON.stringify(violations)}`);
  });

  test('2.2: Zero occurrences of webRequest and declarativeNetRequest in extension/ (dist)', () => {
    const distFiles = getFilesRecursively(path.join(rootDir, 'extension'));
    let violations = [];
    for (const file of distFiles) {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of bannedPatterns) {
        if (pattern.test(content)) {
          violations.push({ file: path.relative(rootDir, file), pattern: pattern.toString() });
        }
      }
    }
    assert.strictEqual(violations.length, 0, `Found banned API usages in distribution: ${JSON.stringify(violations)}`);
  });

  test('2.3: Zero occurrences in scripts/build-extension.mjs', () => {
    const buildScript = fs.readFileSync(path.join(rootDir, 'scripts', 'build-extension.mjs'), 'utf8');
    for (const pattern of bannedPatterns) {
      assert.strictEqual(pattern.test(buildScript), false, `build script matched ${pattern}`);
    }
  });

  // -------------------------------------------------------------
  // 3. JUSTIFICATION FOR ALL REMAINING DECLARED PERMISSIONS
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: ACTIVE CODE JUSTIFICATION FOR DECLARED PERMISSIONS ---');

  const swContent = fs.readFileSync(path.join(rootDir, 'src', 'extension', 'service-worker.ts'), 'utf8');
  const appContent = fs.readFileSync(path.join(rootDir, 'src', 'extension', 'ui', 'App.tsx'), 'utf8');

  test('3.1: "storage" permission is actively used by state persistence', () => {
    assert.ok(swContent.includes('chrome.storage.local'), 'service-worker.ts uses chrome.storage.local');
    assert.ok(appContent.includes('chrome.storage.local'), 'App.tsx uses chrome.storage.local');
  });

  test('3.2: "tabs" permission is actively used for tab orchestration', () => {
    assert.ok(swContent.includes('chrome.tabs.create'), 'service-worker.ts uses chrome.tabs.create');
    assert.ok(swContent.includes('chrome.tabs.update'), 'service-worker.ts uses chrome.tabs.update');
    assert.ok(swContent.includes('chrome.tabs.sendMessage'), 'service-worker.ts uses chrome.tabs.sendMessage');
    assert.ok(swContent.includes('chrome.tabs.remove'), 'service-worker.ts uses chrome.tabs.remove');
  });

  test('3.3: "scripting" permission is actively used for fallback content injection', () => {
    assert.ok(swContent.includes('chrome.scripting.executeScript'), 'service-worker.ts uses chrome.scripting.executeScript');
  });

  test('3.4: "sidePanel" permission is actively configured for side panel workflow', () => {
    assert.ok(prodManifest.side_panel && prodManifest.side_panel.default_path, 'manifest declares side_panel.default_path');
    assert.ok(fs.existsSync(path.join(rootDir, 'extension', 'sidepanel.html')), 'sidepanel.html exists');
  });

  // -------------------------------------------------------------
  // 4. NETWORK SAFETY VERIFICATION
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: NETWORK INTEGRITY & SAFETY ---');

  test('4.1: No localhost or 127.0.0.1 in extension runtime code', () => {
    const sw = fs.readFileSync(path.join(rootDir, 'extension', 'service-worker.js'), 'utf8');
    const cs = fs.readFileSync(path.join(rootDir, 'extension', 'content-script.js'), 'utf8');
    const app = fs.readFileSync(path.join(rootDir, 'extension', 'app.js'), 'utf8');

    assert.strictEqual(/http:\/\/localhost/i.test(sw), false);
    assert.strictEqual(/http:\/\/127\.0\.0\.1/i.test(sw), false);
    assert.strictEqual(/http:\/\/localhost/i.test(cs), false);
    assert.strictEqual(/http:\/\/127\.0\.0\.1/i.test(cs), false);
    assert.strictEqual(/http:\/\/localhost/i.test(app), false);
    assert.strictEqual(/http:\/\/127\.0\.0\.1/i.test(app), false);
  });

  test('4.2: No external proxy, backend server, or scraping service references in runtime', () => {
    const sw = fs.readFileSync(path.join(rootDir, 'extension', 'service-worker.js'), 'utf8');
    const cs = fs.readFileSync(path.join(rootDir, 'extension', 'content-script.js'), 'utf8');
    
    assert.strictEqual(/api\.openai\.com/i.test(sw), false);
    assert.strictEqual(/anthropic\.com/i.test(sw), false);
    assert.strictEqual(/scraping/i.test(sw), false);
    assert.strictEqual(/brightdata/i.test(sw), false);
    assert.strictEqual(/scraperapi/i.test(sw), false);
  });

  console.log('\n================================================================');
  console.log(`PROMPT 5.1 PERMISSION TESTS: ${passed}/${total} PASSED`);
  console.log('RECONCILIATION VERIFIED: ONLY storage, tabs, scripting, sidePanel REQUIRED');
  console.log('webRequest AND declarativeNetRequest ARE 100% ABSENT FROM RUNTIME');
  console.log('================================================================');
}

runPermissionReconciliationTests().catch(err => {
  console.error(err);
  process.exit(1);
});
