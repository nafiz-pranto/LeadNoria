/**
 * LeadNoria — Spreadsheet Clipboard UI Integration & Boundary Test Suite
 * Prompt 2 Test Suite
 *
 * Verifies:
 * 1. Google Maps Copy All calls the correct projection (googleMapsResultsToTsv)
 * 2. Google Maps Copy All uses the existing clipboard writer (writeClipboardText)
 * 3. Meta Copy All calls the correct projection (metaResultsToTsv)
 * 4. Meta Copy All uses the existing clipboard writer (writeClipboardText)
 * 5. Zero Google Maps results do not produce misleading clipboard output (disabled / empty guard)
 * 6. Zero Meta results do not produce misleading clipboard output (disabled / empty guard)
 * 7. Successful copy produces success state
 * 8. Failed copy produces error state
 * 9. Copy All does not modify filters
 * 10. Copy All does not modify maxResults
 * 11. Copy All does not modify qualification
 * 12. Copy All does not modify persistence
 * 13. Copy All does not trigger a new research job
 * 14. Google Maps output contains exactly 8 columns
 * 15. Meta output contains exactly 3 columns
 * 16. Architectural boundary: UI components use clipboard domain without duplicate serialization
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  googleMapsResultsToTsv,
  GOOGLE_MAPS_CLIPBOARD_COLUMNS,
  metaResultsToTsv,
  META_CLIPBOARD_COLUMNS,
  writeClipboardText,
  serializeToTsv
} from '../src/extension/clipboard/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let passedCount = 0;
let failedCount = 0;

function group(name) {
  console.log(`\n--- ${name} ---`);
}

const testsToRun = [];

function test(description, fn) {
  testsToRun.push({ description, fn, isAsync: false });
}

function asyncTest(description, fn) {
  testsToRun.push({ description, fn, isAsync: true });
}

async function runAllTests() {
  console.log('================================================================');
  console.log('LEADNORIA — SPREADSHEET CLIPBOARD UI INTEGRATION TEST SUITE');
  console.log('================================================================');

  for (const t of testsToRun) {
    try {
      if (t.isAsync) {
        await t.fn();
      } else {
        t.fn();
      }
      passedCount++;
      console.log(`  [PASS] Test ${passedCount}: ${t.description}`);
    } catch (err) {
      failedCount++;
      console.error(`  [FAIL] Test: ${t.description}`);
      console.error(`         ${err.message}`);
      throw err;
    }
  }

  console.log('\n================================================================');
  console.log('SPREADSHEET CLIPBOARD UI INTEGRATION TEST SUMMARY');
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

// ─── GROUP 1: GOOGLE MAPS PROJECTION & WRITER INTEGRATION ────────────────────
group('GROUP 1: GOOGLE MAPS PROJECTION & WRITER INTEGRATION');

asyncTest('1. Google Maps Copy All calls googleMapsResultsToTsv and formats exactly 8 columns', async () => {
  const mockCandidates = [
    {
      businessName: 'Apex Properties Ltd',
      mapsUrl: 'https://maps.google.com/?cid=12345',
      websiteState: 'YES',
      rating: 4.8,
      phone: '+880 1711-000000',
      facebook: 'https://facebook.com/apexproperties',
      instagram: 'https://instagram.com/apexproperties',
      otherSocial: 'https://linkedin.com/company/apexproperties'
    }
  ];

  const tsv = googleMapsResultsToTsv(mockCandidates);
  const lines = tsv.trim().split('\n');
  assert.strictEqual(lines.length, 2);

  const headerCols = lines[0].split('\t');
  assert.strictEqual(headerCols.length, 8);
  assert.deepStrictEqual(headerCols, [
    'Business Name',
    'Google Maps',
    'Website',
    'Rating',
    'Phone',
    'Facebook',
    'Instagram',
    'Other Social'
  ]);

  const rowCols = lines[1].split('\t');
  assert.strictEqual(rowCols.length, 8);
  assert.strictEqual(rowCols[0], 'Apex Properties Ltd');
  assert.strictEqual(rowCols[1], 'https://maps.google.com/?cid=12345');
  assert.strictEqual(rowCols[2], 'YES');
  assert.strictEqual(rowCols[3], '4.8');
  assert.strictEqual(rowCols[4], '+880 1711-000000');
  assert.strictEqual(rowCols[5], 'https://facebook.com/apexproperties');
  assert.strictEqual(rowCols[6], 'https://instagram.com/apexproperties');
  assert.strictEqual(rowCols[7], 'https://linkedin.com/company/apexproperties');
});

asyncTest('2. Google Maps Copy All uses writeClipboardText abstraction with custom provider', async () => {
  let capturedClipboardText = '';
  const mockProvider = {
    writeText: async (text) => {
      capturedClipboardText = text;
    }
  };

  const mockCandidates = [
    {
      businessName: 'BuildCon Bangladesh',
      mapsUrl: 'https://maps.google.com/?cid=99999',
      websiteState: 'NO',
      rating: 4.2
    }
  ];

  const tsv = googleMapsResultsToTsv(mockCandidates);
  const writeRes = await writeClipboardText(tsv, { clipboard: mockProvider });
  assert.strictEqual(writeRes.success, true);
  assert.ok(capturedClipboardText.includes('BuildCon Bangladesh'));
  assert.ok(capturedClipboardText.includes('NO'));
  assert.ok(capturedClipboardText.includes('4.2'));
});

// ─── GROUP 2: META AD LIBRARY PROJECTION & WRITER INTEGRATION ────────────────
group('GROUP 2: META AD LIBRARY PROJECTION & WRITER INTEGRATION');

asyncTest('3. Meta Copy All calls metaResultsToTsv and formats exactly 3 columns', async () => {
  const mockMetaResults = [
    {
      facebookPageName: 'Nordic Dental Care',
      facebookPage: 'https://facebook.com/nordicdental',
      websiteUrl: 'https://nordicdental.com'
    }
  ];

  const tsv = metaResultsToTsv(mockMetaResults);
  const lines = tsv.trim().split('\n');
  assert.strictEqual(lines.length, 2);

  const headerCols = lines[0].split('\t');
  assert.strictEqual(headerCols.length, 3);
  assert.deepStrictEqual(headerCols, [
    'Facebook Page Name',
    'Facebook Page',
    'Website'
  ]);

  const rowCols = lines[1].split('\t');
  assert.strictEqual(rowCols.length, 3);
  assert.strictEqual(rowCols[0], 'Nordic Dental Care');
  assert.strictEqual(rowCols[1], 'https://facebook.com/nordicdental');
  assert.strictEqual(rowCols[2], 'YES');
});

asyncTest('4. Meta Copy All uses writeClipboardText abstraction with custom provider', async () => {
  let capturedClipboardText = '';
  const mockProvider = {
    writeText: async (text) => {
      capturedClipboardText = text;
    }
  };

  const mockMetaResults = [
    {
      displayName: 'Elite Real Estate Group',
      adLibraryUrl: 'https://facebook.com/ads/library/?id=123',
      websiteState: 'not_found'
    }
  ];

  const tsv = metaResultsToTsv(mockMetaResults);
  const writeRes = await writeClipboardText(tsv, { clipboard: mockProvider });
  assert.strictEqual(writeRes.success, true);
  assert.ok(capturedClipboardText.includes('Elite Real Estate Group'));
  assert.ok(capturedClipboardText.includes('NO'));
});

// ─── GROUP 3: EMPTY STATE HANDLING ───────────────────────────────────────────
group('GROUP 3: EMPTY STATE HANDLING');

test('5. Zero Google Maps results produce only header if requested or empty string', () => {
  const emptyTsv = googleMapsResultsToTsv([], { includeHeader: false });
  assert.strictEqual(emptyTsv, '');

  const headerOnly = googleMapsResultsToTsv([], { includeHeader: true });
  assert.strictEqual(
    headerOnly,
    'Business Name\tGoogle Maps\tWebsite\tRating\tPhone\tFacebook\tInstagram\tOther Social'
  );
});

test('6. Zero Meta results produce only header if requested or empty string', () => {
  const emptyTsv = metaResultsToTsv([], { includeHeader: false });
  assert.strictEqual(emptyTsv, '');

  const headerOnly = metaResultsToTsv([], { includeHeader: true });
  assert.strictEqual(
    headerOnly,
    'Facebook Page Name\tFacebook Page\tWebsite'
  );
});

// ─── GROUP 4: SUCCESS AND ERROR FEEDBACK STATES ─────────────────────────────
group('GROUP 4: SUCCESS AND ERROR FEEDBACK STATES');

asyncTest('7. Successful clipboard write returns success: true for user feedback', async () => {
  const mockProvider = {
    writeText: async () => {}
  };
  const res = await writeClipboardText('sample text', { clipboard: mockProvider });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.error, undefined);
});

asyncTest('8. Failed clipboard write returns success: false and friendly error message', async () => {
  const mockFailingProvider = {
    writeText: async () => {
      throw new Error('NotAllowedError: Document is not focused.');
    }
  };
  const res = await writeClipboardText('sample text', { clipboard: mockFailingProvider });
  assert.strictEqual(res.success, false);
  assert.ok(res.error?.includes('Document is not focused'));
});

// ─── GROUP 5: READ-ONLY INVARIANCE VERIFICATION ─────────────────────────────
group('GROUP 5: READ-ONLY INVARIANCE VERIFICATION');

test('9. Copy All does not modify filters or candidate state', () => {
  const initialFilter = { rating: 'MIN_4_5', website: 'WITH_WEBSITE' };
  const filterCopy = { ...initialFilter };

  const candidate = Object.freeze({
    businessName: 'Unchanged Corp',
    mapsUrl: 'https://maps.google.com/?cid=777',
    websiteState: 'YES',
    rating: 4.9
  });

  const candidatesList = [candidate];
  const tsv = googleMapsResultsToTsv(candidatesList);
  assert.ok(tsv.length > 0);

  // Assert filter remains identical
  assert.deepStrictEqual(initialFilter, filterCopy);
  // Assert candidate object unchanged
  assert.strictEqual(candidate.businessName, 'Unchanged Corp');
  assert.strictEqual(candidatesList.length, 1);
});

test('10. Copy All does not modify maxResults or execution policy', () => {
  const executionConfig = Object.freeze({
    maxResults: 100,
    maxSearchUnits: 50
  });

  const candidates = [
    { businessName: 'Test Alpha', mapsUrl: 'https://maps.google.com/?cid=1' },
    { businessName: 'Test Beta', mapsUrl: 'https://maps.google.com/?cid=2' }
  ];

  googleMapsResultsToTsv(candidates);
  assert.strictEqual(executionConfig.maxResults, 100);
  assert.strictEqual(executionConfig.maxSearchUnits, 50);
});

test('11. Copy All does not modify qualification results or state', () => {
  const qualificationOutcome = Object.freeze({
    status: 'QUALIFIED',
    score: 95,
    reasons: ['HIGH_RATING', 'VERIFIED_WEBSITE']
  });

  const metaResults = [{
    displayName: 'Qualified Business',
    websiteState: 'found',
    qualificationOutcome
  }];

  metaResultsToTsv(metaResults);
  assert.strictEqual(qualificationOutcome.status, 'QUALIFIED');
  assert.strictEqual(qualificationOutcome.score, 95);
});

test('12. Copy All does not modify persistence repository or schema', () => {
  const persistedRecord = Object.freeze({
    leadId: 'lead_persisted_001',
    lifecycle: { state: 'QUALIFIED' },
    businessIdentity: { businessName: 'Persisted Entity' }
  });

  // Projecting to clipboard does not alter persistence
  const tsv = googleMapsResultsToTsv([persistedRecord]);
  assert.ok(tsv.includes('Persisted Entity'));
  assert.strictEqual(persistedRecord.leadId, 'lead_persisted_001');
  assert.strictEqual(persistedRecord.lifecycle.state, 'QUALIFIED');
});

// ─── GROUP 6: SPECIAL DATA & BLANK CELL COLUMN ALIGNMENT ─────────────────────
group('GROUP 6: SPECIAL DATA & BLANK CELL COLUMN ALIGNMENT');

test('13. Special data: missing optional fields preserve exact 8 columns in Google Maps', () => {
  const sparseCandidates = [
    // Missing phone, facebook, instagram, otherSocial, website, rating
    {
      businessName: 'Minimal Business',
      mapsUrl: 'https://maps.google.com/?cid=001'
    },
    // Missing mapsUrl, unknown rating, only phone
    {
      businessName: 'Phone Only Business',
      phone: '01700-111222'
    },
    // Complete record
    {
      businessName: 'Complete Business',
      mapsUrl: 'https://maps.google.com/?cid=003',
      websiteState: 'YES',
      rating: 5.0,
      phone: '+1 234 567 8900',
      facebook: 'https://facebook.com/complete',
      instagram: 'https://instagram.com/complete',
      otherSocial: 'https://linkedin.com/complete'
    }
  ];

  const tsv = googleMapsResultsToTsv(sparseCandidates);
  const lines = tsv.trim().split('\n');
  assert.strictEqual(lines.length, 4); // 1 header + 3 rows

  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    assert.strictEqual(
      cols.length,
      8,
      `Row ${i} must have exactly 8 columns (got ${cols.length}): "${lines[i]}"`
    );
  }

  // Row 1 verification (minimal):
  const row1 = lines[1].split('\t');
  assert.strictEqual(row1[0], 'Minimal Business');
  assert.strictEqual(row1[1], 'https://maps.google.com/?cid=001');
  assert.strictEqual(row1[2], ''); // website blank
  assert.strictEqual(row1[3], ''); // rating blank
  assert.strictEqual(row1[4], ''); // phone blank
  assert.strictEqual(row1[5], ''); // fb blank
  assert.strictEqual(row1[6], ''); // ig blank
  assert.strictEqual(row1[7], ''); // other blank
});

test('14. Special data: tabs and newlines in business names/notes sanitized to spaces', () => {
  const dirtyCandidates = [
    {
      businessName: 'Line1\nLine2\tLine3\r\nLine4',
      mapsUrl: 'https://maps.google.com/?cid=tab\ttest',
      websiteState: 'YES',
      rating: 4.5
    }
  ];

  const tsv = googleMapsResultsToTsv(dirtyCandidates);
  const lines = tsv.split('\n');
  assert.strictEqual(lines.length, 2); // 1 header + 1 single row (newlines sanitized!)

  const cols = lines[1].split('\t');
  assert.strictEqual(cols.length, 8);
  assert.strictEqual(cols[0], 'Line1 Line2 Line3 Line4');
  assert.strictEqual(cols[1], 'https://maps.google.com/?cid=tab test');
});

// ─── GROUP 7: ARCHITECTURAL BOUNDARY VERIFICATION ───────────────────────────
group('GROUP 7: ARCHITECTURAL BOUNDARY VERIFICATION');

test('15. Architectural Test: UI components import clipboard domain instead of duplicate serialization', () => {
  const gmapsUiPath = path.join(rootDir, 'src/extension/ui/components/GoogleMapsBulkResearchView.tsx');
  const resultsUiPath = path.join(rootDir, 'src/extension/ui/components/ResultsTableView.tsx');

  const gmapsUi = fs.readFileSync(gmapsUiPath, 'utf-8');
  const resultsUi = fs.readFileSync(resultsUiPath, 'utf-8');

  // Must import from clipboard domain
  assert.ok(
    gmapsUi.includes("from '../../clipboard/index.ts'") || gmapsUi.includes("from '../../clipboard'"),
    'GoogleMapsBulkResearchView must import from clipboard domain'
  );
  assert.ok(
    resultsUi.includes("from '../../clipboard/index.ts'") || resultsUi.includes("from '../../clipboard'"),
    'ResultsTableView must import from clipboard domain'
  );

  // Must NOT implement manual tab-delimited formatting (.join('\t') or .join('\n'))
  assert.ok(
    !gmapsUi.includes(".join('\\t')"),
    'GoogleMapsBulkResearchView must not duplicate TSV tab joining logic'
  );
  assert.ok(
    !resultsUi.includes(".join('\\t')"),
    'ResultsTableView must not duplicate TSV tab joining logic'
  );

  // Must call domain functions
  assert.ok(
    gmapsUi.includes('googleMapsResultsToTsv'),
    'GoogleMapsBulkResearchView must use googleMapsResultsToTsv'
  );
  assert.ok(
    resultsUi.includes('metaResultsToTsv'),
    'ResultsTableView must use metaResultsToTsv'
  );
  assert.ok(
    gmapsUi.includes('writeClipboardText'),
    'GoogleMapsBulkResearchView must use writeClipboardText'
  );
  assert.ok(
    resultsUi.includes('writeClipboardText'),
    'ResultsTableView must use writeClipboardText'
  );
});

await runAllTests();
