import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const zipPath = path.join(rootDir, 'dist', 'leadnoria-v1.0.0.zip');
if (!fs.existsSync(zipPath)) {
  console.error('ZIP file not found:', zipPath);
  process.exit(1);
}

const fileBuffer = fs.readFileSync(zipPath);
const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
const stat = fs.statSync(zipPath);

console.log('Archive File:     dist/leadnoria-v1.0.0.zip');
console.log(`Archive Size:     ${stat.size} bytes (${(stat.size / 1024).toFixed(1)} KB)`);
console.log(`SHA-256:          ${sha256}`);

// Unpack test
const testUnpackedDir = path.join(rootDir, 'dist', 'test-unpacked');
if (fs.existsSync(testUnpackedDir)) {
  fs.rmSync(testUnpackedDir, { recursive: true, force: true });
}
fs.mkdirSync(testUnpackedDir, { recursive: true });

// Unpack using PowerShell Expand-Archive safely
execSync(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${testUnpackedDir}' -Force"`);

const manifestPath = path.join(testUnpackedDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('CRITICAL: Extracted ZIP does not contain manifest.json!');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log(`Extracted Name:   ${manifest.name}`);
console.log(`Extracted Ver:    ${manifest.version}`);
console.log(`Description:      ${manifest.description}`);
console.log(`Permissions:      ${manifest.permissions.join(', ')}`);
console.log(`Host Permissions: ${manifest.host_permissions.join(', ')}`);
console.log(`Optional Hosts:   ${manifest.optional_host_permissions.join(', ')}`);

// Verify required runtime files exist
const requiredFiles = [
  'manifest.json',
  'service-worker.js',
  'content-script.js',
  'sidepanel.html',
  'popup.html',
  'styles.css',
  'icons/icon-16.png',
  'icons/icon-32.png',
  'icons/icon-48.png',
  'icons/icon-128.png'
];

for (const req of requiredFiles) {
  const p = path.join(testUnpackedDir, req);
  if (!fs.existsSync(p)) {
    console.error(`CRITICAL: Missing required file in archive: ${req}`);
    process.exit(1);
  }
}

console.log('ALL REQUIRED RUNTIME FILES PRESENT IN EXTRACTED ZIP.');
console.log('PACKAGE VALIDATION COMPLETE: SUCCESS');
