/**
 * Test Suite: Website Verification Permission Architecture Audit (Prompt 6)
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=== RUNNING TEST: Website Verification Permission Architecture ===\n');

let passCount = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

const distManifestPath = path.join(rootDir, 'extension/manifest.json');
const srcManifestPath = path.join(rootDir, 'src/extension/manifest.json');

const distManifest = JSON.parse(fs.readFileSync(distManifestPath, 'utf-8'));
const srcManifest = JSON.parse(fs.readFileSync(srcManifestPath, 'utf-8'));

test('Required permissions remain minimal (storage, tabs, scripting, sidePanel)', () => {
  const expectedPerms = ['storage', 'tabs', 'scripting', 'sidePanel'];
  assert.deepStrictEqual(distManifest.permissions, expectedPerms);
  assert.deepStrictEqual(srcManifest.permissions, expectedPerms);
});

test('Required host_permissions are strictly limited to public Meta Ad Library endpoints', () => {
  const expectedHosts = [
    'https://www.facebook.com/ads/library/*',
    'https://web.facebook.com/ads/library/*'
  ];
  assert.deepStrictEqual(distManifest.host_permissions, expectedHosts);
  assert.deepStrictEqual(srcManifest.host_permissions, expectedHosts);
});

test('Banned broad host patterns are 100% ABSENT from required host_permissions', () => {
  const allHostStrings = [
    ...distManifest.host_permissions,
    ...srcManifest.host_permissions
  ];

  for (const h of allHostStrings) {
    assert.strictEqual(h.includes('<all_urls>'), false, 'Cannot contain <all_urls>');
    assert.strictEqual(h.includes('*://*/*'), false, 'Cannot contain *://*/*');
    assert.strictEqual(h === 'http://*/*', false, 'Cannot contain http://*/*');
    assert.strictEqual(h === 'https://*/*', false, 'Cannot contain https://*/* in required permissions');
  }
});

test('Optional host access uses optional_host_permissions ("https://*/*") for runtime consent', () => {
  assert.ok(distManifest.optional_host_permissions, 'Must declare optional_host_permissions');
  assert.deepStrictEqual(distManifest.optional_host_permissions, ['https://*/*']);
  assert.deepStrictEqual(srcManifest.optional_host_permissions, ['https://*/*']);
});

test('webRequest and declarativeNetRequest remain 100% ABSENT', () => {
  assert.strictEqual(distManifest.permissions.includes('webRequest'), false);
  assert.strictEqual(distManifest.permissions.includes('declarativeNetRequest'), false);
  assert.strictEqual(distManifest.declarative_net_request, undefined);
  assert.strictEqual(srcManifest.permissions.includes('webRequest'), false);
  assert.strictEqual(srcManifest.permissions.includes('declarativeNetRequest'), false);
});

test('No silent background permission requests in discovery pipeline', () => {
  const serviceWorkerCode = fs.readFileSync(path.join(rootDir, 'src/extension/service-worker.ts'), 'utf-8');
  assert.strictEqual(serviceWorkerCode.includes('chrome.permissions.request'), false,
    'Service worker must not silently request permissions in background; UI user gesture required.');
});

console.log(`\nPermission architecture audit complete. Passed: ${passCount}/6 checks.\n`);
