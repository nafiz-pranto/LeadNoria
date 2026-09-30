import { chromium } from 'playwright';
import path from 'path';

async function run() {
  const extPath = path.resolve('extension');
  console.log('Testing Chromium (Edge) with extPath:', extPath);

  const ctx = await chromium.launchPersistentContext('', {
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: [
      '--headless=new',
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`
    ]
  });

  const page = await ctx.newPage();
  await page.goto('chrome://extensions-internals');
  const text = await page.evaluate(() => document.body.innerText);
  const exts = JSON.parse(text);
  const ln = exts.find(e => e.name === 'LeadNoria');

  if (ln) {
    console.log('Found extension ID:', ln.id);

    // Test popup.html
    const popupPage = await ctx.newPage();
    const popupLogs = [];
    popupPage.on('console', m => popupLogs.push(`[${m.type()}] ${m.text()}`));
    popupPage.on('pageerror', e => popupLogs.push(`[PAGE_ERR] ${e.message}`));
    await popupPage.goto(`chrome-extension://${ln.id}/popup.html`);
    await popupPage.waitForTimeout(1000);
    console.log('Popup page title:', await popupPage.title());
    console.log('Popup console errors count:', popupLogs.filter(l => l.includes('error') || l.includes('PAGE_ERR')).length);
    console.log('Popup rendered DOM length:', (await popupPage.content()).length);
    await popupPage.close();

    // Test sidepanel.html
    const sidePage = await ctx.newPage();
    const sideLogs = [];
    sidePage.on('console', m => sideLogs.push(`[${m.type()}] ${m.text()}`));
    sidePage.on('pageerror', e => sideLogs.push(`[PAGE_ERR] ${e.message}`));
    await sidePage.goto(`chrome-extension://${ln.id}/sidepanel.html`);
    await sidePage.waitForTimeout(1000);
    console.log('Side panel page title:', await sidePage.title());
    console.log('Side panel console errors count:', sideLogs.filter(l => l.includes('error') || l.includes('PAGE_ERR')).length);
    console.log('Side panel rendered DOM length:', (await sidePage.content()).length);

    // Check header text, tabs, buttons inside side panel DOM
    const headerText = await sidePage.evaluate(() => document.querySelector('h1')?.innerText || '');
    console.log('Header text:', headerText);
    const tabs = await sidePage.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean));
    console.log('Rendered buttons/tabs:', tabs.slice(0, 10));

    await sidePage.close();
  }

  await ctx.close();
}

run().catch(console.error);
