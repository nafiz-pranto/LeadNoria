import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { spawnSync } from 'node:child_process';

const destDir = 'C:\\Users\\samiu\\AppData\\Local\\ms-playwright\\chromium-1243';
const zipPath = path.join(destDir, 'chrome-win64.zip');
const exePath = path.join(destDir, 'chrome-win64', 'chrome.exe');
const url = 'https://cdn.playwright.dev/builds/cft/153.0.8010.12/win64/chrome-win64.zip';

if (fs.existsSync(exePath)) {
  console.log('chrome.exe already exists at:', exePath);
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });

console.log('Downloading Chrome for Testing from:', url);
console.log('Destination:', zipPath);

function download(fileUrl, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(fileUrl, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed with status code: ${response.statusCode}`));
      }
      const total = parseInt(response.headers['content-length'] || '0', 10);
      let downloaded = 0;
      let lastPct = -1;

      response.on('data', (chunk) => {
        downloaded += chunk.length;
        if (total > 0) {
          const pct = Math.floor((downloaded / total) * 100);
          if (pct % 10 === 0 && pct !== lastPct) {
            lastPct = pct;
            console.log(`Progress: ${pct}% (${(downloaded / 1024 / 1024).toFixed(1)} MB / ${(total / 1024 / 1024).toFixed(1)} MB)`);
          }
        }
      });

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  await download(url, zipPath);
  console.log('Download complete. Extracting via PowerShell Expand-Archive...');
  const res = spawnSync('powershell.exe', [
    '-NoProfile',
    '-Command',
    `Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force`
  ], { stdio: 'inherit' });

  if (res.status === 0 && fs.existsSync(exePath)) {
    console.log('Extraction complete! chrome.exe is ready at:', exePath);
    try { fs.unlinkSync(zipPath); } catch {}
  } else {
    console.error('Extraction failed or chrome.exe not found');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
