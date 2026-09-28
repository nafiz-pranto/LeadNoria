import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import os from 'os';
import fs from 'fs';

const extDir = path.resolve(__dirname, '../extension');
const tempDir = path.join(os.tmpdir(), 'leadnoria-test-ext');
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
fs.cpSync(extDir, tempDir, { recursive: true });

console.log('Testing extension from path without spaces:', tempDir);

const context = await chromium.launchPersistentContext('', {
  headless: false,
  args: [
    '--headless=new',
    `--disable-extensions-except=${tempDir}`,
    `--load-extension=${tempDir}`
  ]
});

let [sw] = context.serviceWorkers();
if (!sw) sw = await context.waitForEvent('serviceworker', { timeout: 10000 });
console.log('Worker found:', sw.url());
await context.close();
