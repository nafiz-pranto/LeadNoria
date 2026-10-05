/**
 * LeadNoria — Scroll Layout Regression Suite
 * BUG-FIX: Research Screen Vertical Scrolling (Popup + Side Panel)
 *
 * Tests 27 deterministic regression requirements:
 *  1. Research viewport is vertically scrollable (overflow-y:auto, not hidden)
 *  2. Horizontal overflow is prevented (overflow-x:hidden)
 *  3. Bottom controls remain reachable (ResearchConfigView renders all fields)
 *  4. Meta and Google Maps use the same scroll architecture (source-neutral main container)
 *  5. Popup HTML is compatible with Chrome extension popup sizing
 *  6. Side Panel HTML uses responsive viewport height
 *  7. BUG-AUDIT-04: responsive side-panel min-width remains intact
 *  8. Keyboard focus reaches bottom controls (tabIndex-accessible inputs exist)
 *  9. No nested-scroll trap (only one overflow-y:auto container in the chain)
 * 10. Switching source does not alter the scroll container classes
 * 11. Tab switching does not alter the scroll container classes
 * 12. Build artifacts contain correct overflow declarations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ─── Helpers ─────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ FAIL  ${name}`);
    console.log(`         ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readFile(relPath) {
  return fs.readFileSync(path.join(rootDir, relPath), 'utf-8');
}

// ─── Suite ───────────────────────────────────────────────────────────────────

console.log('\n════════════════════════════════════════════════════════');
console.log('  LeadNoria — Scroll Layout Regression Suite');
console.log('════════════════════════════════════════════════════════\n');

// --- Group 1: App.tsx layout structure ---
console.log('Group 1: App.tsx layout structure\n');

const appTsx = readFile('src/extension/ui/App.tsx');

test('REG-SCROLL-01: Main scroll container has overflow-y-auto', () => {
  assert(
    appTsx.includes('overflow-y-auto'),
    'Expected main container to have overflow-y-auto for vertical scrolling'
  );
});

test('REG-SCROLL-02: Main scroll container has overflow-x-hidden to prevent horizontal scroll', () => {
  assert(
    appTsx.includes('overflow-x-hidden'),
    'Expected main container to have overflow-x-hidden'
  );
});

test('REG-SCROLL-03: Main scroll container has min-h-0 (required for flex scroll chain)', () => {
  assert(
    appTsx.includes('min-h-0'),
    'Expected min-h-0 on main to establish correct flex scroll chain'
  );
});

test('REG-SCROLL-04: Outer App div does NOT have overflow-hidden (was the root cause)', () => {
  const returnMatch = appTsx.match(/return\s*\(\s*<div className="([^"]+)"/);
  assert(returnMatch, 'Could not find root return div in App.tsx');
  const outerDivClasses = returnMatch[1];
  assert(
    !outerDivClasses.includes('overflow-hidden'),
    `Outer App div must NOT have overflow-hidden (blocks scroll). Found: "${outerDivClasses}"`
  );
});

test('REG-SCROLL-05: Header has shrink-0 (prevents header from collapsing in flex layout)', () => {
  const headerTsx = readFile('src/extension/ui/components/Header.tsx');
  assert(
    headerTsx.includes('shrink-0'),
    'Header must have shrink-0 to stay fixed at top while main scrolls'
  );
});

// --- Group 2: Bottom control reachability ---
console.log('\nGroup 2: Bottom control reachability\n');

const researchConfig = readFile('src/extension/ui/components/ResearchConfigView.tsx');

test('REG-SCROLL-06: Category & Query Scope control is present', () => {
  assert(
    researchConfig.includes('Category &amp; Query Scope') || researchConfig.includes('Category & Query Scope'),
    'Category & Query Scope control must be present in ResearchConfigView'
  );
});

test('REG-SCROLL-07: Max Candidates control is present and has an id', () => {
  assert(
    researchConfig.includes('id="max-candidates-input"'),
    'Max Candidates input must have id="max-candidates-input" for tab accessibility'
  );
});

test('REG-SCROLL-08: Review Research Plan button is rendered after scope controls and Max Candidates', () => {
  const maxIdx = researchConfig.lastIndexOf('max-candidates-input');
  const btnIdx = researchConfig.lastIndexOf('Review Research Plan');
  assert(maxIdx > 0, 'max-candidates-input must exist');
  assert(btnIdx > 0, 'Review Research Plan button must exist');
  assert(
    btnIdx > maxIdx,
    'Review Research Plan button must come after Max Candidates in the DOM order'
  );
});

test('REG-SCROLL-09: Geographic Scope control is present (above-fold anchor)', () => {
  assert(
    researchConfig.includes('Geographic Scope'),
    'Geographic Scope section must be present in ResearchConfigView'
  );
});

// --- Group 3: Source parity (no source-specific scroll logic) ---
console.log('\nGroup 3: Source parity — scroll is source-neutral\n');

test('REG-SCROLL-10: App.tsx main container does not branch on source type for overflow/scroll', () => {
  const hasSourceBranchForOverflow = /isGmaps[^;]*overflow|overflow[^;]*isGmaps/i.test(appTsx) ||
    /selectedSource[^;]*overflow|overflow[^;]*selectedSource/i.test(appTsx);
  assert(
    !hasSourceBranchForOverflow,
    'Scroll/overflow classes must NOT branch on selectedSource or isGmaps — must be source-neutral'
  );
});

test('REG-SCROLL-11: ResearchConfigView renders same container regardless of source (no scroll class fork)', () => {
  const rootDivMatch = researchConfig.match(/return\s*\(\s*<div className="([^"]+)"/);
  assert(rootDivMatch, 'Could not find root return div in ResearchConfigView');
  const classes = rootDivMatch[1];
  assert(
    !classes.includes('isGmaps') && !classes.includes('selectedSource'),
    'ResearchConfigView root div must have static classes, not source-conditional overflow'
  );
});

// --- Group 4: Popup HTML validation ---
console.log('\nGroup 4: Popup HTML validation\n');

const popupHtml = readFile('extension/popup.html');

test('REG-SCROLL-12: Popup body has overflow-x: hidden to prevent horizontal document scroll', () => {
  assert(
    popupHtml.includes('overflow-x: hidden'),
    'Popup body should have overflow-x: hidden to prevent horizontal document scroll'
  );
});

test('REG-SCROLL-13: Popup #root has display:flex and flex-direction:column for scroll chain', () => {
  assert(
    popupHtml.includes('display: flex'),
    'Popup #root must have display:flex to establish scroll chain'
  );
  assert(
    popupHtml.includes('flex-direction: column'),
    'Popup #root must have flex-direction:column'
  );
});

test('REG-SCROLL-14: Popup dimensions remain 440x600 (Chrome popup sizing compatibility)', () => {
  assert(
    popupHtml.includes('width: 440px'),
    'Popup body must keep width: 440px for Chrome popup compatibility'
  );
  assert(
    popupHtml.includes('height: 600px'),
    'Popup body must keep height: 600px for Chrome popup compatibility'
  );
});

// --- Group 5: Side Panel HTML validation ---
console.log('\nGroup 5: Side Panel HTML validation\n');

const sidepanelHtml = readFile('extension/sidepanel.html');

test('REG-SCROLL-15: Side Panel body uses 100vh height (full viewport)', () => {
  assert(
    sidepanelHtml.includes('height: 100vh'),
    'Side panel body must use height: 100vh'
  );
});

test('REG-SCROLL-16: Side Panel body uses 100% width (responsive)', () => {
  assert(
    sidepanelHtml.includes('width: 100%'),
    'Side panel body must use width: 100% for responsiveness'
  );
});

test('REG-SCROLL-17: BUG-AUDIT-04 — Side Panel min-width: 360px remains intact', () => {
  assert(
    sidepanelHtml.includes('min-width: 360px'),
    'Side panel must retain min-width: 360px (BUG-AUDIT-04 responsive fix)'
  );
});

test('REG-SCROLL-18: Side Panel #root has display:flex and flex-direction:column', () => {
  assert(
    sidepanelHtml.includes('display: flex'),
    'Side panel #root must have display:flex'
  );
  assert(
    sidepanelHtml.includes('flex-direction: column'),
    'Side panel #root must have flex-direction:column'
  );
});

// --- Group 6: No nested scroll trap ---
console.log('\nGroup 6: No nested scroll trap\n');

test('REG-SCROLL-19: Only one overflow-y-auto in the App.tsx render tree (no nested scroll containers)', () => {
  const returnIdx = appTsx.lastIndexOf('return (');
  assert(returnIdx > 0, 'Could not find return statement in App.tsx');
  const renderTree = appTsx.slice(returnIdx);
  const matches = renderTree.match(/overflow-y-auto/g) || [];
  assert(
    matches.length === 1,
    `Expected exactly 1 overflow-y-auto in render tree, found ${matches.length}. Multiple scroll containers create nested-scroll traps.`
  );
});

test('REG-SCROLL-20: Tab panel divs do NOT have their own overflow-y-auto (no nested trap)', () => {
  const returnIdx = appTsx.lastIndexOf('return (');
  const renderTree = appTsx.slice(returnIdx);
  const tabPanelMatches = renderTree.match(/role="tabpanel"[^>]*overflow-y-auto/g) || [];
  assert(
    tabPanelMatches.length === 0,
    `Found ${tabPanelMatches.length} tabpanel divs with their own overflow-y-auto — nested scroll traps`
  );
});

// --- Group 7: Build script validation ---
console.log('\nGroup 7: Build script generates correct HTML\n');

const buildScript = readFile('scripts/build-extension.mjs');

test('REG-SCROLL-21: Build script HTML template body does NOT use bare overflow: hidden (body scroll blocker)', () => {
  const createHtmlIdx = buildScript.indexOf('const createHtml');
  assert(createHtmlIdx > 0, 'createHtml function not found in build script');
  const htmlTemplate = buildScript.slice(createHtmlIdx, createHtmlIdx + 2500);
  // Extract only the body/html rule block (before #root block)
  // The #root block correctly has overflow:hidden — we only care about body
  const rootIdx = htmlTemplate.indexOf('#root');
  const bodySection = rootIdx > 0 ? htmlTemplate.slice(0, rootIdx) : htmlTemplate;
  // Body section must not have bare "overflow: hidden" without x/y distinction
  const bodyHasBareHidden = /overflow:\s*hidden/.test(bodySection) &&
    !bodySection.includes('overflow-x:') &&
    !bodySection.includes('overflow-x: hidden') &&
    !bodySection.includes('overflow-y: hidden');
  assert(
    !bodyHasBareHidden,
    'Build script HTML template body must not use bare overflow:hidden that blocks all body-level scrolling'
  );
});

test('REG-SCROLL-22: Build script template generates #root with display:flex (scroll chain)', () => {
  assert(
    buildScript.includes('display: flex') && buildScript.includes('flex-direction: column'),
    'Build script #root template must include display:flex and flex-direction:column'
  );
});

// --- Group 8: Keyboard accessibility (static structural check) ---
console.log('\nGroup 8: Keyboard accessibility (structural)\n');

test('REG-SCROLL-23: Category & Query Scope has explicit aria-label association', () => {
  assert(
    researchConfig.includes('aria-label="Select industry research preset"') &&
    researchConfig.includes('aria-label="Custom research keywords"'),
    'Category & Query Scope controls must have explicit aria-labels for keyboard accessibility'
  );
});

test('REG-SCROLL-24: Max Candidates input has explicit id + htmlFor label association', () => {
  assert(
    researchConfig.includes('id="max-candidates-input"') &&
    researchConfig.includes('htmlFor="max-candidates-input"'),
    'Max Candidates must have matching id and htmlFor for keyboard label association'
  );
});

test('REG-SCROLL-25: Geographic Scope select has explicit id + htmlFor label association', () => {
  assert(
    researchConfig.includes('id="geo-country-select"') &&
    researchConfig.includes('htmlFor="geo-country-select"'),
    'Geographic Scope must have matching id and htmlFor for keyboard label association'
  );
});

// --- Group 9: Reload / state resilience (structural) ---
console.log('\nGroup 9: Reload / tab-switch resilience\n');

test('REG-SCROLL-26: Scroll container classes are unconditional static strings', () => {
  const mainMatch = appTsx.match(/<main className="([^"]+)"/);
  assert(mainMatch, '<main className="..."> not found in App.tsx');
  const mainClasses = mainMatch[1];
  assert(
    mainClasses.includes('flex-1') &&
    mainClasses.includes('min-h-0') &&
    mainClasses.includes('overflow-y-auto') &&
    mainClasses.includes('overflow-x-hidden'),
    `Main scroll container must have static classes (flex-1, min-h-0, overflow-y-auto, overflow-x-hidden). Found: "${mainClasses}"`
  );
});

test('REG-SCROLL-27: <main> scroll container is NOT conditionally rendered on activeTab', () => {
  const mainIdx = appTsx.indexOf('<main className');
  assert(mainIdx > 0, '<main> not found');
  const before = appTsx.slice(Math.max(0, mainIdx - 200), mainIdx);
  assert(
    !before.includes('activeTab ==='),
    '<main> scroll container must not be inside an activeTab conditional — scroll state must persist across tab switches'
  );
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n════════════════════════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log('════════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('  ✅ ALL SCROLL LAYOUT REGRESSION TESTS PASS\n');
}
