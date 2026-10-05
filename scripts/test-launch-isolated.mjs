import { chromium } from 'playwright';
import fs from 'fs';
import os from 'os';
import path from 'path';

async function test() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-clean-prof-'));
  const tempExtDir = path.join(os.tmpdir(), 'leadnoria-clean-ext');
  if (fs.existsSync(tempExtDir)) fs.rmSync(tempExtDir, { recursive: true, force: true });
  fs.cpSync(path.resolve('extension'), tempExtDir, { recursive: true });

  console.log('Using tmp profile:', tmpDir);
  console.log('Using tmp extension:', tempExtDir);
  const context = await chromium.launchPersistentContext(tmpDir, {
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions', '--disable-component-extensions-with-background-pages'],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--disable-extensions-except=${tempExtDir}`,
      `--load-extension=${tempExtDir}`
    ]
  });
  console.log('Context launched successfully!');
  const page = await context.newPage();
  await page.goto('chrome://extensions');
  await new Promise(r => setTimeout(r, 2000));
  const pageHtml = await page.content();
  console.log('Extensions page loaded. Length:', pageHtml.length);
  // Check if developer mode or extension items are present
  const evalResult = await page.evaluate(() => {
    const items = document.querySelectorAll('extensions-item');
    const mgr = document.querySelector('extensions-manager');
    return {
      itemCount: items.length,
      hasManager: !!mgr,
      bodyText: document.body.innerText.substring(0, 500)
    };
  });
  console.log('Eval result:', evalResult);
  await context.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log('Test completed successfully!');
}
test().catch(err => { console.error('Error:', err); process.exit(1); });
