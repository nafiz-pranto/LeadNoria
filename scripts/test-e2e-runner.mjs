import { chromium } from 'playwright';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const extDir = path.join(rootDir, 'extension');

async function main() {
  const tempDir = path.join(os.tmpdir(), 'leadnoria-test-ext-' + Date.now());
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  fs.cpSync(extDir, tempDir, { recursive: true });

  const tmpUser = path.join(os.tmpdir(), 'leadnoria-edge-prof-' + Date.now());
  fs.mkdirSync(tmpUser, { recursive: true });

  const context = await chromium.launchPersistentContext(tmpUser, {
    channel: 'msedge',
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions', '--disable-component-extensions-with-background-pages'],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--disable-extensions-except=${tempDir}`,
      `--load-extension=${tempDir}`
    ]
  });

  try {
    console.log('Browser launched. Waiting for service worker...');
    let sw = context.serviceWorkers().find(w => !w.url().includes('fignfifoniblkonapihmkfakmlgkbkcf') && w.url().startsWith('chrome-extension://'));
    
    if (!sw) {
      sw = await context.waitForEvent('serviceworker', {
        predicate: w => !w.url().includes('fignfifoniblkonapihmkfakmlgkbkcf') && w.url().startsWith('chrome-extension://'),
        timeout: 10000
      }).catch(() => null);
    }

    console.log('Worker not triggered yet, navigating to chrome://extensions...');
    const p = await context.newPage();
    await p.goto('chrome://extensions');
    await p.waitForTimeout(2000);

    // Toggle developer mode
    const devMode = p.locator('#devMode');
    if (await devMode.isVisible().catch(() => false)) {
      console.log('Dev mode button found. Checking if pressed...');
      const isChecked = await devMode.getAttribute('aria-pressed');
      if (isChecked !== 'true') {
        console.log('Enabling dev mode...');
        await devMode.click();
        await p.waitForTimeout(1000);
      }
    }

    const count = await p.locator('extensions-item').count();
    console.log('Extensions item count after dev mode:', count);
    for (let i = 0; i < count; i++) {
      const item = p.locator('extensions-item').nth(i);
      const name = await item.locator('#name').textContent().catch(() => '');
      const id = await item.getAttribute('id');
      console.log(`Extension ${i}: ${name} (id: ${id})`);
    }
  } finally {
    await context.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
