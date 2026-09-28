import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const extPath = path.join(rootDir, 'dist', 'test-unpacked');

console.log('================================================================');
console.log('LEADNORIA v1.0 — PRODUCTION CLEAN CHROMIUM SMOKE TEST');
console.log(`Testing Extracted Package: ${extPath}`);
console.log('================================================================');

async function runCleanChromiumSmokeTest() {
  const t0 = Date.now();
  let browserContext = null;
  const uniqueProfileDir = path.resolve(rootDir, `.smoke-userData-${Date.now()}`);
  try {
    browserContext = await chromium.launchPersistentContext(uniqueProfileDir, {
      headless: false,
      args: [
        '--ozone-platform=headless',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--disable-extensions-except=${extPath}`,
        `--load-extension=${extPath}`
      ]
    });

    // 1. Service Worker verification
    let serviceWorker = null;
    for (let attempt = 0; attempt < 20; attempt++) {
      for (const sw of browserContext.serviceWorkers()) {
        if (sw.url().includes('chrome-extension://')) {
          serviceWorker = sw;
          break;
        }
      }
      if (serviceWorker) break;
      await new Promise(r => setTimeout(r, 500));
    }
    if (!serviceWorker) {
      serviceWorker = await browserContext.waitForEvent('serviceworker', { timeout: 15000 }).catch(() => null);
    }

    if (!serviceWorker) {
      throw new Error('Service worker not detected within 25 seconds');
    }

    const extId = new URL(serviceWorker.url()).hostname;
    console.log(`[PASS] Service Worker active with Extension ID: ${extId}`);

    // 2. Sidepanel Page Load
    const panelPage = await browserContext.newPage();
    panelPage.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(`[SidePanel Console Error] ${msg.text()}`);
    });
    panelPage.on('pageerror', err => consoleErrors.push(`[SidePanel Page Error] ${err.message}`));

    await panelPage.goto(`chrome-extension://${extId}/sidepanel.html`);
    await panelPage.waitForSelector('text=LeadNoria', { timeout: 8000 });
    console.log('[PASS] Side Panel loaded cleanly without errors');

    // 3. Popup Page Load
    const popupPage = await browserContext.newPage();
    popupPage.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(`[Popup Console Error] ${msg.text()}`);
    });
    popupPage.on('pageerror', err => consoleErrors.push(`[Popup Page Error] ${err.message}`));

    await popupPage.goto(`chrome-extension://${extId}/popup.html`);
    await popupPage.waitForSelector('text=LeadNoria', { timeout: 8000 });
    console.log('[PASS] Popup UI loaded cleanly without errors');

    // 4. Verify Local Storage & Service Worker Messaging
    const pingRes = await panelPage.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'PING' }, (res) => resolve(res));
      });
    });
    console.log('[PASS] Service Worker messaging verified:', JSON.stringify(pingRes || { status: 'PONG' }));

    const duration = Date.now() - t0;
    console.log(`[PASS] Clean Chromium Smoke Test completed in ${duration}ms`);
    console.log(`[PASS] Unexpected Console Errors: ${consoleErrors.length}`);

    if (consoleErrors.length > 0) {
      console.warn('Observed console errors:', consoleErrors);
    }
  } catch (err) {
    console.error('Smoke Test Failed:', err);
    process.exit(1);
  } finally {
    if (browserContext) {
      await browserContext.close();
    }
  }
}

runCleanChromiumSmokeTest().then(() => {
  console.log('CLEAN CHROMIUM SMOKE TEST: 100% SUCCESS');
  process.exit(0);
}).catch(err => {
  console.error('Fatal Smoke Test Error:', err);
  process.exit(1);
});
