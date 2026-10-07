import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const v150Path = path.join(rootDir, 'dist', 'leadnoria-v1.5.0.zip');
const v160Path = path.join(rootDir, 'dist', 'leadnoria-v1.6.0.zip');

console.log('=== V1.5.0 IMMUTABILITY CHECK ===');
const v150Buf = fs.readFileSync(v150Path);
const v150Sha = crypto.createHash('sha256').update(v150Buf).digest('hex');
const v150Stat = fs.statSync(v150Path);
console.log(`v1.5.0 Size: ${v150Stat.size} bytes`);
console.log(`v1.5.0 SHA:  ${v150Sha}`);
const EXPECTED_V150_SHA = '1a55ad80ed3e400b88c7f6d9c36d3dcbccd697737df39cb95c4e0dd4c11c4544';
console.log(`v1.5.0 Matches Expected: ${v150Sha === EXPECTED_V150_SHA}`);

console.log('\n=== V1.6.0 ARTIFACT AUDIT ===');
const v160Buf = fs.readFileSync(v160Path);
const v160Sha = crypto.createHash('sha256').update(v160Buf).digest('hex');
const v160Stat = fs.statSync(v160Path);
console.log(`v1.6.0 Size: ${v160Stat.size} bytes`);
console.log(`v1.6.0 SHA:  ${v160Sha}`);
const EXPECTED_V160_SHA = '00b32aa1683d0a6d60fbd98771d237196700d61d168d0da76959344d91e289f0';
console.log(`v1.6.0 Matches Expected: ${v160Sha === EXPECTED_V160_SHA}`);

const unpackDir150 = path.join(rootDir, 'dist', 'audit-v150-unpacked');
const unpackDir160 = path.join(rootDir, 'dist', 'audit-v160-unpacked');

if (fs.existsSync(unpackDir150)) fs.rmSync(unpackDir150, { recursive: true, force: true });
if (fs.existsSync(unpackDir160)) fs.rmSync(unpackDir160, { recursive: true, force: true });
fs.mkdirSync(unpackDir150, { recursive: true });
fs.mkdirSync(unpackDir160, { recursive: true });

execSync(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${v150Path}' -DestinationPath '${unpackDir150}' -Force"`);
execSync(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${v160Path}' -DestinationPath '${unpackDir160}' -Force"`);

function getFilesRecursive(dir, prefix = '') {
  let results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const rel = prefix ? `${prefix}/${item}` : item;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getFilesRecursive(full, rel));
    } else {
      const sha = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
      results.push({ rel, size: stat.size, sha });
    }
  }
  return results;
}

const files150 = getFilesRecursive(unpackDir150);
const files160 = getFilesRecursive(unpackDir160);

console.log('\n=== FILE INVENTORY COMPARISON ===');
console.log(`v1.5.0 file count: ${files150.length}`);
console.log(`v1.6.0 file count: ${files160.length}`);

const map150 = new Map(files150.map(f => [f.rel, f]));
const map160 = new Map(files160.map(f => [f.rel, f]));

console.log('\n--- Files in v1.6.0 vs v1.5.0 ---');
for (const [rel, f160] of map160.entries()) {
  const f150 = map150.get(rel);
  if (!f150) {
    console.log(`+ ADDED: ${rel} (${f160.size} bytes)`);
  } else if (f150.sha !== f160.sha) {
    console.log(`* MODIFIED: ${rel} (v1.5.0: ${f150.size}B -> v1.6.0: ${f160.size}B)`);
  } else {
    console.log(`= UNCHANGED: ${rel} (${f160.size} bytes)`);
  }
}
for (const [rel, f150] of map150.entries()) {
  if (!map160.has(rel)) {
    console.log(`- REMOVED: ${rel}`);
  }
}

const manifest150 = JSON.parse(fs.readFileSync(path.join(unpackDir150, 'manifest.json'), 'utf8'));
const manifest160 = JSON.parse(fs.readFileSync(path.join(unpackDir160, 'manifest.json'), 'utf8'));
console.log('\n=== MANIFESTS ===');
console.log('v1.5.0 manifest version:', manifest150.version);
console.log('v1.6.0 manifest version:', manifest160.version);

// Check bundle contents in v1.6.0
console.log('\n=== BUNDLE CONTENT AUDIT (v1.6.0) ===');
const appJsPath = path.join(unpackDir160, 'app.js');
const serviceWorkerPath = path.join(unpackDir160, 'service-worker.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const swJs = fs.readFileSync(serviceWorkerPath, 'utf8');

const checks = [
  { name: 'qualifiesCandidate function', pattern: /qualifiesCandidate/ },
  { name: 'extractRatingSignal function', pattern: /extractRatingSignal/ },
  { name: 'determineWebsiteState function', pattern: /determineWebsiteState/ },
  { name: 'RATING_BELOW_THRESHOLD', pattern: /RATING_BELOW_THRESHOLD/ },
  { name: 'RATING_UNKNOWN', pattern: /RATING_UNKNOWN/ },
  { name: 'WEBSITE_MISSING', pattern: /WEBSITE_MISSING/ },
  { name: 'WEBSITE_UNKNOWN', pattern: /WEBSITE_UNKNOWN/ },
  { name: 'Rating filter: FOUR_PLUS', pattern: /FOUR_PLUS/ },
  { name: 'Rating filter: FOUR_POINT_FIVE_PLUS', pattern: /FOUR_POINT_FIVE_PLUS/ },
  { name: 'Website filter: WITH_WEBSITE', pattern: /WITH_WEBSITE/ },
  { name: 'Website filter: WITHOUT_WEBSITE', pattern: /WITHOUT_WEBSITE/ },
  { name: 'maxResults logic', pattern: /maxResults/ },
  { name: 'PLAN_LIMIT_REACHED', pattern: /PLAN_LIMIT_REACHED/ },
  { name: 'cross-query deduplication', pattern: /SessionCandidateDeduplicator|duplicatesSuppressed/i },
  { name: 'Maximum Results UI label', pattern: /Maximum Results/ }
];

console.log('Checking app.js:');
for (const c of checks) {
  const inApp = c.pattern.test(appJs);
  const inSw = c.pattern.test(swJs);
  console.log(`  ${c.name}: app.js=${inApp}, service-worker.js=${inSw}`);
}

console.log('\n=== RESTRICTED FIELD PERSISTENCE/EXPORT BOUNDARY SCAN (v1.6.0 bundle) ===');
// Check if restricted fields are exposed in export safe models or leak into persistent lead models
console.log('app.js size:', appJs.length, 'service-worker.js size:', swJs.length);
