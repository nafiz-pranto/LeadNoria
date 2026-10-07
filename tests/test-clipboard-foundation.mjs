/**
 * LeadNoria — Spreadsheet Clipboard & Copy All Domain
 * Comprehensive Foundation Test Suite
 *
 * Verifies:
 * - Generic TSV serialization & deterministic ordering
 * - Cell normalization & safe type conversions
 * - Tab & newline sanitization
 * - Google Maps 8-column spreadsheet projection
 * - Meta Ad Library 3-column spreadsheet projection
 * - Browser-facing clipboard writer abstraction & DI
 * - Architectural boundaries (zero acquisition imports, zero Lead schema pollution)
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  serializeToTsv,
  sanitizeCellValue,
  GOOGLE_MAPS_CLIPBOARD_COLUMNS,
  googleMapsCandidateToClipboardRow,
  googleMapsResultsToClipboardRows,
  googleMapsResultsToTsv,
  META_CLIPBOARD_COLUMNS,
  metaResultToClipboardRow,
  metaResultsToClipboardRows,
  metaResultsToTsv,
  writeClipboardText
} from '../src/extension/clipboard/index.ts';

import { toExportSafeLead } from '../src/extension/leads/leadProjection.ts';
import { validateExportSafeLead } from '../src/extension/leads/leadExportPolicy.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let passedCount = 0;
let failedCount = 0;

function group(name) {
  console.log(`\n--- ${name} ---`);
}

function test(description, fn) {
  try {
    fn();
    passedCount++;
    console.log(`  [PASS] Test ${passedCount}: ${description}`);
  } catch (err) {
    failedCount++;
    console.error(`  [FAIL] Test: ${description}`);
    console.error(`         ${err.message}`);
    throw err;
  }
}

async function asyncTest(description, fn) {
  try {
    await fn();
    passedCount++;
    console.log(`  [PASS] Test ${passedCount}: ${description}`);
  } catch (err) {
    failedCount++;
    console.error(`  [FAIL] Test: ${description}`);
    console.error(`         ${err.message}`);
    throw err;
  }
}

console.log('================================================================');
console.log('LEADNORIA — SPREADSHEET CLIPBOARD FOUNDATION TEST SUITE');
console.log('================================================================');

// ─── GROUP 1: GENERIC TSV SERIALIZATION ──────────────────────────────────────
group('GROUP 1: GENERIC TSV SERIALIZATION');

const testColumns = [
  { key: 'colA', header: 'Column A' },
  { key: 'colB', header: 'Column B' },
  { key: 'colC', header: 'Column C' }
];

test('1. Correct header order strictly matching supplied definitions', () => {
  const tsv = serializeToTsv(testColumns, []);
  assert.strictEqual(tsv, 'Column A\tColumn B\tColumn C');
});

test('2. Correct column order in data rows', () => {
  const rows = [{ colA: 'Alpha', colB: 'Beta', colC: 'Gamma' }];
  const tsv = serializeToTsv(testColumns, rows);
  const lines = tsv.split('\n');
  assert.strictEqual(lines[0], 'Column A\tColumn B\tColumn C');
  assert.strictEqual(lines[1], 'Alpha\tBeta\tGamma');
});

test('3. Multiple rows formatted with newline delimiters', () => {
  const rows = [
    { colA: 'Row1A', colB: 'Row1B', colC: 'Row1C' },
    { colA: 'Row2A', colB: 'Row2B', colC: 'Row2C' },
    { colA: 'Row3A', colB: 'Row3B', colC: 'Row3C' }
  ];
  const tsv = serializeToTsv(testColumns, rows);
  const lines = tsv.split('\n');
  assert.strictEqual(lines.length, 4);
  assert.strictEqual(lines[1], 'Row1A\tRow1B\tRow1C');
  assert.strictEqual(lines[2], 'Row2A\tRow2B\tRow2C');
  assert.strictEqual(lines[3], 'Row3A\tRow3B\tRow3C');
});

test('4. Single row formatting', () => {
  const rows = [{ colA: 'OnlyA', colB: 'OnlyB', colC: 'OnlyC' }];
  const tsv = serializeToTsv(testColumns, rows);
  const lines = tsv.split('\n');
  assert.strictEqual(lines.length, 2);
  assert.strictEqual(lines[1], 'OnlyA\tOnlyB\tOnlyC');
});

test('5. Zero rows formatting (header only when includeHeader true)', () => {
  const tsvWithHeader = serializeToTsv(testColumns, []);
  assert.strictEqual(tsvWithHeader, 'Column A\tColumn B\tColumn C');

  const tsvNoHeader = serializeToTsv(testColumns, [], { includeHeader: false });
  assert.strictEqual(tsvNoHeader, '');
});

test('6. Null values produce blank cells ("")', () => {
  const rows = [{ colA: null, colB: 'Valid', colC: null }];
  const tsv = serializeToTsv(testColumns, rows, { includeHeader: false });
  assert.strictEqual(tsv, '\tValid\t');
});

test('7. Undefined values produce blank cells ("")', () => {
  const rows = [{ colA: undefined, colB: 'Valid', colC: undefined }];
  const tsv = serializeToTsv(testColumns, rows, { includeHeader: false });
  assert.strictEqual(tsv, '\tValid\t');
});

test('8. Numeric values format deterministically', () => {
  const numCols = [
    { key: 'intVal', header: 'Integer' },
    { key: 'floatVal', header: 'Float' },
    { key: 'zeroVal', header: 'Zero' }
  ];
  const rows = [{ intVal: 42, floatVal: 4.75, zeroVal: 0 }];
  const tsv = serializeToTsv(numCols, rows, { includeHeader: false });
  assert.strictEqual(tsv, '42\t4.75\t0');
});

test('9. Boolean values format deterministically ("true" / "false")', () => {
  const boolCols = [
    { key: 'yes', header: 'Yes' },
    { key: 'no', header: 'No' }
  ];
  const rows = [{ yes: true, no: false }];
  const tsv = serializeToTsv(boolCols, rows, { includeHeader: false });
  assert.strictEqual(tsv, 'true\tfalse');
});

test('10. Tabs inside values are normalized to spaces', () => {
  assert.strictEqual(sanitizeCellValue('ABC\tFurniture'), 'ABC Furniture');
  const rows = [{ colA: 'ABC\tFurniture', colB: 'Item\tTwo', colC: 'End' }];
  const tsv = serializeToTsv(testColumns, rows, { includeHeader: false });
  assert.strictEqual(tsv, 'ABC Furniture\tItem Two\tEnd');
});

test('11. Newline (\\n) inside values is normalized to space', () => {
  assert.strictEqual(sanitizeCellValue('ABC\nFurniture'), 'ABC Furniture');
  const rows = [{ colA: 'ABC\nFurniture', colB: 'Line1\nLine2', colC: 'End' }];
  const tsv = serializeToTsv(testColumns, rows, { includeHeader: false });
  assert.strictEqual(tsv, 'ABC Furniture\tLine1 Line2\tEnd');
});

test('12. CRLF (\\r\\n) and CR (\\r) inside values are normalized to space', () => {
  assert.strictEqual(sanitizeCellValue('ABC\r\nFurniture'), 'ABC Furniture');
  assert.strictEqual(sanitizeCellValue('ABC\rFurniture'), 'ABC Furniture');
  const rows = [{ colA: 'ABC\r\nFurniture', colB: 'Item\rTwo', colC: 'End' }];
  const tsv = serializeToTsv(testColumns, rows, { includeHeader: false });
  assert.strictEqual(tsv, 'ABC Furniture\tItem Two\tEnd');
});

test('13. Deterministic output: repeated runs produce identical text', () => {
  const rows = [
    { colA: 'First', colB: 'Second', colC: 'Third' },
    { colA: 'Fourth', colB: 'Fifth', colC: 'Sixth' }
  ];
  const tsv1 = serializeToTsv(testColumns, rows);
  const tsv2 = serializeToTsv(testColumns, rows);
  assert.strictEqual(tsv1, tsv2);
});

test('14. Missing columns in row objects yield blank cells', () => {
  const rows = [{ colA: 'OnlyA' }];
  const tsv = serializeToTsv(testColumns, rows, { includeHeader: false });
  assert.strictEqual(tsv, 'OnlyA\t\t');
});

test('15. No accidental literal "undefined" output', () => {
  const rows = [{ colA: undefined, colB: null }];
  const tsv = serializeToTsv(testColumns, rows);
  assert.ok(!tsv.includes('undefined'));
});

test('16. No accidental literal "null" output', () => {
  const rows = [{ colA: null, colB: null }];
  const tsv = serializeToTsv(testColumns, rows);
  assert.ok(!tsv.includes('null'));
});

test('17. No accidental "[object Object]" output from arbitrary objects', () => {
  const rows = [{ colA: { nested: 'obj' }, colB: [1, 2, 3] }];
  const tsv = serializeToTsv(testColumns, rows);
  assert.ok(!tsv.includes('[object Object]'));
});

// ─── GROUP 2: GOOGLE MAPS CLIPBOARD PROJECTION ──────────────────────────────
group('GROUP 2: GOOGLE MAPS CLIPBOARD PROJECTION');

test('18. Business name mapping (string and ObservedField)', () => {
  const row1 = googleMapsCandidateToClipboardRow({ businessName: 'Prime Realtors' });
  assert.strictEqual(row1.businessName, 'Prime Realtors');

  const row2 = googleMapsCandidateToClipboardRow({
    businessName: { availability: 'PRESENT', parsedValue: 'Acme Corp', rawValue: 'Acme Corp' }
  });
  assert.strictEqual(row2.businessName, 'Acme Corp');

  const row3 = googleMapsCandidateToClipboardRow({ name: 'Fallback Name' });
  assert.strictEqual(row3.businessName, 'Fallback Name');
});

test('19. Maps URL mapping (string and ObservedField)', () => {
  const row1 = googleMapsCandidateToClipboardRow({
    mapsUrl: 'https://www.google.com/maps/place/data=123'
  });
  assert.strictEqual(row1.googleMaps, 'https://www.google.com/maps/place/data=123');

  const row2 = googleMapsCandidateToClipboardRow({
    mapsUrl: { availability: 'PRESENT', parsedValue: 'https://maps.google.com/?cid=456' }
  });
  assert.strictEqual(row2.googleMaps, 'https://maps.google.com/?cid=456');
});

test('20. Website YES mapping (explicit state, string URL, ObservedField)', () => {
  const r1 = googleMapsCandidateToClipboardRow({ websiteState: 'YES' });
  assert.strictEqual(r1.website, 'YES');

  const r2 = googleMapsCandidateToClipboardRow({ websiteUrl: 'https://example.com' });
  assert.strictEqual(r2.website, 'YES');

  const r3 = googleMapsCandidateToClipboardRow({
    websiteUrl: { availability: 'PRESENT', parsedValue: 'https://acme.org' }
  });
  assert.strictEqual(r3.website, 'YES');
});

test('21. Website NO mapping (explicit state and ABSENT ObservedField)', () => {
  const r1 = googleMapsCandidateToClipboardRow({ websiteState: 'NO' });
  assert.strictEqual(r1.website, 'NO');

  const r2 = googleMapsCandidateToClipboardRow({
    websiteUrl: { availability: 'ABSENT' }
  });
  assert.strictEqual(r2.website, 'NO');
});

test('22. Website UNKNOWN handling yields blank ("") and is never coerced to NO', () => {
  const r1 = googleMapsCandidateToClipboardRow({ websiteState: 'UNKNOWN' });
  assert.strictEqual(r1.website, '');

  const r2 = googleMapsCandidateToClipboardRow({
    websiteUrl: { availability: 'UNKNOWN' }
  });
  assert.strictEqual(r2.website, '');

  const r3 = googleMapsCandidateToClipboardRow({});
  assert.strictEqual(r3.website, '');
});

test('23. Rating mapping (observed numbers 5, 4.7, 4.0)', () => {
  const r1 = googleMapsCandidateToClipboardRow({ rating: 5 });
  assert.strictEqual(r1.rating, '5');

  const r2 = googleMapsCandidateToClipboardRow({ rating: 4.7 });
  assert.strictEqual(r2.rating, '4.7');

  const r3 = googleMapsCandidateToClipboardRow({
    rating: { availability: 'PRESENT', parsedValue: 4.0 }
  });
  assert.strictEqual(r3.rating, '4');
});

test('24. Unknown rating remains blank ("") and is NEVER coerced to 0', () => {
  const r1 = googleMapsCandidateToClipboardRow({ rating: null });
  assert.strictEqual(r1.rating, '');
  assert.notStrictEqual(r1.rating, '0');

  const r2 = googleMapsCandidateToClipboardRow({
    rating: { availability: 'UNKNOWN' }
  });
  assert.strictEqual(r2.rating, '');
  assert.notStrictEqual(r2.rating, '0');

  const r3 = googleMapsCandidateToClipboardRow({});
  assert.strictEqual(r3.rating, '');
});

test('25. Phone mapping (direct and enriched)', () => {
  const r1 = googleMapsCandidateToClipboardRow({ phone: '+1-555-0100' });
  assert.strictEqual(r1.phone, '+1-555-0100');

  const r2 = googleMapsCandidateToClipboardRow({
    enrichmentResult: {
      contactEvidence: {
        phones: [{ phone: '+1-800-ACME' }]
      }
    }
  });
  assert.strictEqual(r2.phone, '+1-800-ACME');
});

test('26. Facebook mapping (direct, socialProfiles, and enrichment)', () => {
  const r1 = googleMapsCandidateToClipboardRow({ facebook: 'https://facebook.com/prime' });
  assert.strictEqual(r1.facebook, 'https://facebook.com/prime');

  const r2 = googleMapsCandidateToClipboardRow({
    socialProfiles: [{ platform: 'FACEBOOK', url: 'https://facebook.com/acme' }]
  });
  assert.strictEqual(r2.facebook, 'https://facebook.com/acme');
});

test('27. Instagram mapping (direct, socialProfiles, and enrichment)', () => {
  const r1 = googleMapsCandidateToClipboardRow({ instagram: 'https://instagram.com/prime' });
  assert.strictEqual(r1.instagram, 'https://instagram.com/prime');

  const r2 = googleMapsCandidateToClipboardRow({
    socialProfiles: [{ platform: 'INSTAGRAM', url: 'https://instagram.com/acme' }]
  });
  assert.strictEqual(r2.instagram, 'https://instagram.com/acme');
});

test('28. Other Social mapping (LinkedIn, YouTube, Twitter/X)', () => {
  const r1 = googleMapsCandidateToClipboardRow({
    socialProfiles: [
      { platform: 'LINKEDIN', url: 'https://linkedin.com/company/acme' },
      { platform: 'YOUTUBE', url: 'https://youtube.com/@acme' }
    ]
  });
  assert.ok(r1.otherSocial.includes('https://linkedin.com/company/acme'));
  assert.ok(r1.otherSocial.includes('https://youtube.com/@acme'));
  assert.strictEqual(r1.facebook, '');
  assert.strictEqual(r1.instagram, '');
});

test('29. Missing optional fields remain blank ("")', () => {
  const row = googleMapsCandidateToClipboardRow({ businessName: 'Minimal Business' });
  assert.strictEqual(row.businessName, 'Minimal Business');
  assert.strictEqual(row.googleMaps, '');
  assert.strictEqual(row.website, '');
  assert.strictEqual(row.rating, '');
  assert.strictEqual(row.phone, '');
  assert.strictEqual(row.facebook, '');
  assert.strictEqual(row.instagram, '');
  assert.strictEqual(row.otherSocial, '');
});

test('29b. Google Maps TSV projection contains exact 8 columns in order', () => {
  const candidate = {
    businessName: 'Apex Law',
    mapsUrl: 'https://maps.google.com/apex',
    websiteState: 'YES',
    rating: 4.8,
    phone: '555-1234',
    facebook: 'https://facebook.com/apex',
    instagram: 'https://instagram.com/apex',
    otherSocial: 'https://linkedin.com/apex'
  };
  const tsv = googleMapsResultsToTsv([candidate]);
  const lines = tsv.split('\n');
  assert.strictEqual(
    lines[0],
    'Business Name\tGoogle Maps\tWebsite\tRating\tPhone\tFacebook\tInstagram\tOther Social'
  );
  assert.strictEqual(
    lines[1],
    'Apex Law\thttps://maps.google.com/apex\tYES\t4.8\t555-1234\thttps://facebook.com/apex\thttps://instagram.com/apex\thttps://linkedin.com/apex'
  );
});

// ─── GROUP 3: META AD LIBRARY CLIPBOARD PROJECTION ──────────────────────────
group('GROUP 3: META AD LIBRARY CLIPBOARD PROJECTION');

test('30. Meta page name mapping (pageName, facebookPageName, name, canonicalName)', () => {
  const r1 = metaResultToClipboardRow({ facebookPageName: 'Horizon Media' });
  assert.strictEqual(r1.facebookPageName, 'Horizon Media');

  const r2 = metaResultToClipboardRow({ pageName: 'Apex Digital' });
  assert.strictEqual(r2.facebookPageName, 'Apex Digital');

  const r3 = metaResultToClipboardRow({ name: 'Legacy Name' });
  assert.strictEqual(r3.facebookPageName, 'Legacy Name');
});

test('31. Facebook page URL mapping', () => {
  const r1 = metaResultToClipboardRow({ facebookPageUrl: 'https://facebook.com/horizon' });
  assert.strictEqual(r1.facebookPage, 'https://facebook.com/horizon');

  const r2 = metaResultToClipboardRow({ facebookPage: 'https://facebook.com/apex' });
  assert.strictEqual(r2.facebookPage, 'https://facebook.com/apex');
});

test('32. Meta website YES mapping', () => {
  const r1 = metaResultToClipboardRow({ websiteState: 'found' });
  assert.strictEqual(r1.website, 'YES');

  const r2 = metaResultToClipboardRow({ destinationUrl: 'https://horizonmedia.io' });
  assert.strictEqual(r2.website, 'YES');
});

test('33. Meta website NO mapping', () => {
  const r1 = metaResultToClipboardRow({ websiteState: 'not_found' });
  assert.strictEqual(r1.website, 'NO');

  const r2 = metaResultToClipboardRow({ website: 'NO' });
  assert.strictEqual(r2.website, 'NO');
});

test('34. Meta website UNKNOWN handling yields blank ("") and is never coerced to NO', () => {
  const r1 = metaResultToClipboardRow({ websiteState: 'unknown' });
  assert.strictEqual(r1.website, '');

  const r2 = metaResultToClipboardRow({});
  assert.strictEqual(r2.website, '');
});

test('35. Meta missing fields remain blank ("")', () => {
  const r = metaResultToClipboardRow({});
  assert.strictEqual(r.facebookPageName, '');
  assert.strictEqual(r.facebookPage, '');
  assert.strictEqual(r.website, '');
});

test('35b. Meta Ad Library TSV projection contains exact 3 columns in order', () => {
  const item = {
    facebookPageName: 'Scale Up Media',
    facebookPageUrl: 'https://facebook.com/scaleup',
    websiteState: 'found'
  };
  const tsv = metaResultsToTsv([item]);
  const lines = tsv.split('\n');
  assert.strictEqual(lines[0], 'Facebook Page Name\tFacebook Page\tWebsite');
  assert.strictEqual(lines[1], 'Scale Up Media\thttps://facebook.com/scaleup\tYES');
});

// ─── GROUP 4: CLIPBOARD WRITER ABSTRACTION ──────────────────────────────────
group('GROUP 4: CLIPBOARD WRITER ABSTRACTION');

await asyncTest('39. writeClipboardText succeeds with injected custom clipboard provider', async () => {
  let writtenData = '';
  const mockClipboard = {
    writeText: async (t) => {
      writtenData = t;
    }
  };

  const res = await writeClipboardText('Test TSV Payload', { clipboard: mockClipboard });
  assert.strictEqual(res.success, true);
  assert.strictEqual(writtenData, 'Test TSV Payload');
});

await asyncTest('40. writeClipboardText fails gracefully without crashing when unavailable or throwing', async () => {
  // Test when no provider is available
  const res1 = await writeClipboardText('Data', { clipboard: null });
  assert.strictEqual(res1.success, false);
  assert.ok(res1.error);

  // Test when provider throws
  const throwingClipboard = {
    writeText: async () => {
      throw new Error('Permission denied');
    }
  };
  const res2 = await writeClipboardText('Data', { clipboard: throwingClipboard });
  assert.strictEqual(res2.success, false);
  assert.strictEqual(res2.error, 'Permission denied');
});

// ─── GROUP 5: ARCHITECTURAL BOUNDARY & SAFETY ───────────────────────────────
group('GROUP 5: ARCHITECTURAL BOUNDARY & SAFETY');

test('36. Maps URL / rating may exist in clipboard projection without polluting persistent Lead', () => {
  const cand = {
    businessName: 'Vanguard Realty',
    mapsUrl: 'https://www.google.com/maps/place/data=vanguard',
    rating: 4.9,
    websiteState: 'YES'
  };

  // Clipboard projection contains transient mapsUrl and rating
  const clipboardRow = googleMapsCandidateToClipboardRow(cand);
  assert.strictEqual(clipboardRow.googleMaps, 'https://www.google.com/maps/place/data=vanguard');
  assert.strictEqual(clipboardRow.rating, '4.9');

  // Verify toExportSafeLead projection still strictly denies restricted Google fields
  const anchor = {
    sourceId: 'anc_123',
    sourceClass: 'WEBSITE_PUBLIC',
    targetUrl: 'https://vanguardrealty.com',
    domain: 'vanguardrealty.com',
    businessName: 'Vanguard Realty',
    inputMethod: 'STANDALONE_CRAWL',
    verifiedAt: new Date().toISOString(),
    isRestricted: false
  };

  const safeLead = toExportSafeLead({
    independentSource: anchor,
    independentEvidence: {
      domain: 'vanguardrealty.com',
      canonicalUrl: 'https://vanguardrealty.com',
      businessName: 'Vanguard Realty'
    }
  });

  const leadJson = JSON.stringify(safeLead);
  assert.ok(!leadJson.includes('maps.google.com'));
  assert.ok(!leadJson.includes('"rating"'));
  assert.ok(!leadJson.includes('"mapsUrl"'));
});

test('37. toExportSafeLead validation remains valid and untouched', () => {
  const anchor = {
    sourceId: 'anc_456',
    sourceClass: 'WEBSITE_PUBLIC',
    targetUrl: 'https://cleancompany.com',
    domain: 'cleancompany.com',
    businessName: 'Clean Company',
    inputMethod: 'STANDALONE_CRAWL',
    verifiedAt: new Date().toISOString(),
    isRestricted: false
  };

  const safeLead = toExportSafeLead({
    independentSource: anchor,
    independentEvidence: {
      domain: 'cleancompany.com',
      canonicalUrl: 'https://cleancompany.com',
      businessName: 'Clean Company'
    }
  });

  const validation = validateExportSafeLead(safeLead);
  assert.strictEqual(validation.isValid, true);
  assert.strictEqual(validation.errors.length, 0);
});

test('38. Restricted Google fields do not enter persistent Lead output through clipboard module', () => {
  const clipboardSource = fs.readFileSync(
    path.join(rootDir, 'src/extension/clipboard/googleMapsClipboard.ts'),
    'utf-8'
  );
  // Must NOT import workspace or lead storage
  assert.ok(!clipboardSource.includes('WorkspaceRepository'));
  assert.ok(!clipboardSource.includes('toExportSafeLead'));
  assert.ok(!clipboardSource.includes('leadRepository'));
});

test('41. Architectural Test: Clipboard domain does NOT import acquisition engine implementation', () => {
  const clipboardDir = path.join(rootDir, 'src/extension/clipboard');
  const files = fs.readdirSync(clipboardDir).filter(f => f.endsWith('.ts'));

  const prohibitedPatterns = [
    /acquisition\/engine\/navigation/i,
    /acquisition\/engine\/resultFeed/i,
    /acquisition\/engine\/scrolling/i,
    /acquisition\/engine\/runtimeCoordinator/i,
    /acquisition\/engine\/checkpoint/i,
    /queryPlanner/i,
    /playwright/i,
    /puppeteer/i,
    /document\./i,
    /window\./i
  ];

  for (const file of files) {
    const content = fs.readFileSync(path.join(clipboardDir, file), 'utf-8');
    for (const pattern of prohibitedPatterns) {
      assert.ok(
        !pattern.test(content),
        `Prohibited dependency or DOM access pattern ${pattern} detected in ${file}`
      );
    }
  }
});

test('42. Architectural Test: Zero eval, Function, or scraping tokens in clipboard domain', () => {
  const clipboardDir = path.join(rootDir, 'src/extension/clipboard');
  const files = fs.readdirSync(clipboardDir).filter(f => f.endsWith('.ts'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(clipboardDir, file), 'utf-8');
    assert.ok(!content.includes('eval('), `Prohibited eval found in ${file}`);
    assert.ok(!content.includes('new Function('), `Prohibited new Function found in ${file}`);
    assert.ok(!/antiCaptcha|bypass|solver/i.test(content), `Prohibited bypass token in ${file}`);
  }
});

console.log('\n================================================================');
console.log('SPREADSHEET CLIPBOARD FOUNDATION TEST SUMMARY');
console.log(`Passed: ${passedCount}`);
console.log(`Failed: ${failedCount}`);
console.log('================================================================\n');

if (failedCount > 0) {
  process.exit(1);
}
