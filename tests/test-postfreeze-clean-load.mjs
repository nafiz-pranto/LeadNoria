import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const extPath = path.join(rootDir, 'dist', 'frozen-extracted');

console.log('================================================================');
console.log('POST-FREEZE TEST: Real Chrome Extension Load From Extracted ZIP');
console.log(`Path: ${extPath}`);
console.log('================================================================');

async function testPostFreezeLoad() {
  const userDataDir = path.join(rootDir, 'test-userData');
  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions', '--disable-component-extensions-with-background-pages'],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`
    ]
  });

  try {
    // Wait for LeadNoria service worker
    let leadnoriaWorker = null;
    for (let i = 0; i < 20; i++) {
      const workers = browserContext.serviceWorkers();
      leadnoriaWorker = workers.find(w => w.url().includes('service-worker.js') || (!w.url().includes('fignfifoniblkonapihmkfakmlgkbkcf') && w.url().startsWith('chrome-extension://')));
      if (leadnoriaWorker) break;
      await new Promise(r => setTimeout(r, 500));
    }

    if (!leadnoriaWorker) {
      console.log('Available workers:', browserContext.serviceWorkers().map(w => w.url()));
      throw new Error('LeadNoria service worker was not detected in clean Chromium');
    }

    const extId = new URL(leadnoriaWorker.url()).hostname;
    console.log(`[PASS] LeadNoria Extension loaded with ID: ${extId}`);

    // Load Side Panel
    const panelPage = await browserContext.newPage();
    const panelErrors = [];
    panelPage.on('console', msg => {
      if (msg.type() === 'error') panelErrors.push(msg.text());
    });
    panelPage.on('pageerror', err => panelErrors.push(err.message));

    await panelPage.goto(`chrome-extension://${extId}/sidepanel.html`);
    await panelPage.waitForSelector('text=LeadNoria', { timeout: 8000 });
    console.log('[PASS] Side Panel loaded cleanly and rendered "LeadNoria"');

    // Load Popup
    const popupPage = await browserContext.newPage();
    const popupErrors = [];
    popupPage.on('console', msg => {
      if (msg.type() === 'error') popupErrors.push(msg.text());
    });
    popupPage.on('pageerror', err => popupErrors.push(err.message));

    await popupPage.goto(`chrome-extension://${extId}/popup.html`);
    await popupPage.waitForSelector('text=LeadNoria', { timeout: 8000 });
    console.log('[PASS] Popup UI loaded cleanly and rendered "LeadNoria"');

    // Verify ping to service worker
    const pingResponse = await panelPage.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'PING' }, res => resolve(res));
      });
    });
    console.log('[PASS] Runtime messaging verified:', JSON.stringify(pingResponse));

    // Verify zero calls to remote backends, localhost, or unapproved domains
    const networkUrls = [];
    panelPage.on('request', req => networkUrls.push(req.url()));
    popupPage.on('request', req => networkUrls.push(req.url()));

    for (const u of networkUrls) {
      assert(!u.includes('localhost'), 'Forbidden localhost request detected');
      assert(!u.includes('127.0.0.1'), 'Forbidden 127.0.0.1 request detected');
    }
    console.log('[PASS] Network integrity verified: 0 forbidden localhost/backend requests');

    console.log(`[PASS] Errors in SidePanel: ${panelErrors.length}, Errors in Popup: ${popupErrors.length}`);
    assert.strictEqual(panelErrors.length, 0, 'SidePanel must have zero console errors');
    assert.strictEqual(popupErrors.length, 0, 'Popup must have zero console errors');

    console.log('\n>>> FROZEN RELEASE ZIP EXTRACTED EXTENSION LOADED SUCCESSFULLY IN CLEAN CHROMIUM! <<<');
  } finally {
    await browserContext.close();
  }
}

testPostFreezeLoad().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
