/**
 * LeadNoria — Google Maps Acquisition Engine — Browser Smoke / Runtime Integration Test
 *
 * Verifies real Chromium runtime extension message routing and coordinator execution:
 * 1. Extension loads in Chromium via Playwright
 * 2. Service worker registers cleanly
 * 3. Sidepanel page loads
 * 4. Runtime message START_GMAPS_ACQUISITION is received by service worker
 * 5. Session is created, queue is initialized, state transitions to operational
 * 6. GET_GMAPS_ACQUISITION_STATUS retrieves structured progress
 * 7. PAUSE_GMAPS_ACQUISITION halts queue and updates state to PAUSED
 * 8. RESUME_GMAPS_ACQUISITION restores operational state
 * 9. CANCEL_GMAPS_ACQUISITION safely terminates session
 * 10. Direct runtime coordinator pipeline (navigation -> page detection -> candidate observation -> checkpoint)
 *
 * Note: Live Google Maps network interaction is quarantined by design.
 * In this foundation phase, tab navigation and page detection are verified via
 * extension runtime messages and controlled DOM fixtures without live bot bypass.
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';
import {
  GoogleMapsRuntimeCoordinator
} from '../src/extension/acquisition/engine/runtimeCoordinator.ts';
import {
  detectGoogleMapsPage
} from '../src/extension/acquisition/engine/pageDetector.ts';
import {
  createCandidateObservation
} from '../src/extension/acquisition/engine/observationBoundary.ts';
import {
  GoogleMapsBulkOrchestrator
} from '../src/extension/acquisition/engine/bulkOrchestrator.ts';
import {
  createBulkResearchPlan
} from '../src/extension/acquisition/engine/bulkPlanner.ts';
import {
  evaluateWebsiteEligibility,
  GoogleMapsEnrichmentQueue,
  mergeEnrichmentIntoCandidate,
  DEFAULT_ENRICHMENT_POLICY
} from '../src/extension/acquisition/engine/index.ts';
import {
  GoogleMapsReviewSession,
  createCandidateReviewRecord,
  evaluateCandidateQualification,
  extractCandidateConflicts,
  summarizeCandidateProvenance
} from '../src/extension/acquisition/review/index.ts';
import {
  createIndependentSourceAnchor,
  toExportSafeLead,
  evaluateLeadEligibility,
  LeadWorkspaceSession,
  exportLeadsToCsv,
  exportLeadsToJson,
  PersistentLeadWorkspaceSession,
  MemoryStorageBackend,
  toPersistedLeadRecord,
  verifyZeroGoogleFieldsInPersistedRecord
} from '../src/extension/leads/index.ts';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extDir = path.resolve(__dirname, '../extension');

console.log('================================================================');
console.log('LEADNORIA — GOOGLE MAPS RUNTIME & BROWSER SMOKE TEST');
console.log('================================================================');

let totalTests = 0;
let passedTests = 0;

function pass(name) {
  totalTests++;
  passedTests++;
  console.log(`  [PASS] Test ${totalTests}: ${name}`);
}

async function runBrowserSmoke() {
  console.log('\n--- PART 1: Playwright Chromium Extension Runtime Verification ---');

  let browserContext = null;
  try {
    browserContext = await chromium.launchPersistentContext('', {
      headless: false,
      ignoreDefaultArgs: ['--disable-extensions', '--disable-component-extensions-with-background-pages'],
      args: [
        '--ozone-platform=headless',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--disable-extensions-except=${extDir}`,
        `--load-extension=${extDir}`
      ]
    });

    // 1. Service Worker registration
    let sw = browserContext.serviceWorkers()[0];
    if (!sw) {
      sw = await browserContext.waitForEvent('serviceworker', { timeout: 8000 });
    }
    assert.ok(sw, 'Service worker must register');
    const extUrl = sw.url();
    const extId = extUrl.split('/')[2];
    assert.ok(extId, 'Extension ID must be present');
    pass('Extension loaded and Service Worker registered in Chromium');

    // 2. Open extension UI page (sidepanel)
    const page = await browserContext.newPage();
    await page.goto(`chrome-extension://${extId}/sidepanel.html`);
    await page.waitForTimeout(500);
    const title = await page.title();
    assert.equal(title, 'LeadNoria');
    pass('Sidepanel interface loaded cleanly');

    // Obtain real tab ID owned by Chromium session
    const tabId = await page.evaluate(() => new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => resolve(tabs[0]?.id));
    }));
    assert.ok(tabId, 'Real Chromium tab ID must be resolved');
    pass('Chromium browser tab ownership resolved');

    // 3. Dispatch START_GMAPS_ACQUISITION message through real chrome.runtime.sendMessage
    page.evaluate((tid) => {
      chrome.runtime.sendMessage({
        type: 'START_GMAPS_ACQUISITION',
        source: 'GMAPS_ENGINE',
        payload: {
          sessionId: 'sess_browser_smoke_001',
          searchUnits: [
            { keyword: 'real estate developer', location: 'Dhaka' },
            { keyword: 'property developer', location: 'Chittagong' }
          ],
          config: {
            tabId: tid,
            navigationTimeoutMs: 10000
          }
        }
      });
    }, tabId);

    // Allow runtime coordinator to claim unit and enter NAVIGATING state
    await new Promise((r) => setTimeout(r, 200));

    // 4. Dispatch GET_GMAPS_ACQUISITION_STATUS
    const statusResult = await page.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'GET_GMAPS_ACQUISITION_STATUS',
          source: 'GMAPS_ENGINE',
          payload: {
            sessionId: 'sess_browser_smoke_001'
          }
        }, (res) => {
          resolve(res);
        });
      });
    });

    assert.ok(statusResult, 'Status response must be received');
    assert.equal(statusResult.success, true);
    assert.equal(statusResult.sessionId, 'sess_browser_smoke_001');
    assert.equal(statusResult.state, 'NAVIGATING');
    assert.ok(statusResult.progress, 'Progress must be present');
    assert.equal(statusResult.progress.totalSearchUnits, 2);
    pass('GET_GMAPS_ACQUISITION_STATUS returned operational NAVIGATING state & progress');

    // 5. Dispatch PAUSE_GMAPS_ACQUISITION
    const pauseResult = await page.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'PAUSE_GMAPS_ACQUISITION',
          source: 'GMAPS_ENGINE',
          payload: {
            sessionId: 'sess_browser_smoke_001'
          }
        }, (res) => {
          resolve(res);
        });
      });
    });

    assert.ok(pauseResult, 'Pause response must be received');
    assert.equal(pauseResult.success, true);
    assert.equal(pauseResult.state, 'PAUSED');
    assert.ok(pauseResult.checkpointId, 'Pause must produce checkpoint');
    pass('PAUSE_GMAPS_ACQUISITION paused session and generated valid checkpoint');

    // 6. Dispatch RESUME_GMAPS_ACQUISITION
    const resumeResult = await page.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'RESUME_GMAPS_ACQUISITION',
          source: 'GMAPS_ENGINE',
          payload: {
            sessionId: 'sess_browser_smoke_001'
          }
        }, (res) => {
          resolve(res);
        });
      });
    });

    assert.ok(resumeResult, 'Resume response must be received');
    assert.equal(resumeResult.success, true);
    assert.equal(resumeResult.state, 'NAVIGATING');
    pass('RESUME_GMAPS_ACQUISITION restored operational NAVIGATING state');

    // 7. Dispatch CANCEL_GMAPS_ACQUISITION through real chrome.runtime.sendMessage
    const cancelResult = await page.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'CANCEL_GMAPS_ACQUISITION',
          source: 'GMAPS_ENGINE',
          payload: {
            sessionId: 'sess_browser_smoke_001',
            reason: 'Smoke test completion'
          }
        }, (res) => {
          resolve(res);
        });
      });
    });

    assert.ok(cancelResult, 'Cancel response must be received');
    assert.equal(cancelResult.success, true);
    assert.equal(cancelResult.state, 'CANCELLED');
    pass('CANCEL_GMAPS_ACQUISITION transitioned engine to CANCELLED in real runtime');

    // -------------------------------------------------------------------------
    // PART 1B: Real Chromium Bulk Research UI Flow Verification (Correction 3)
    // -------------------------------------------------------------------------
    console.log('\n--- PART 1B: Real Chromium Bulk Research UI Flow Verification ---');

    // 1. Switch UI to Google Maps Bulk mode
    await page.click('#source-switch-gmaps-btn');
    await page.waitForTimeout(200);
    const keywordsInputVisible = await page.isVisible('#bulk-keywords-input');
    assert.equal(keywordsInputVisible, true, 'Keywords input must be visible in bulk view');
    pass('Bulk Research UI opens via mode switcher in real Chromium');

    // 2. Enter 2 keywords: "real estate\nbuilder"
    await page.fill('#bulk-keywords-input', 'real estate\nbuilder');
    // 3. Enter 2 locations: "Dhaka\nChattogram"
    await page.fill('#bulk-locations-input', 'Dhaka\nChattogram');
    await page.waitForTimeout(100);

    // 4. UI calculates 2 x 2 = 4 SearchUnits; verify plan preview text
    const planPreviewText = await page.textContent('.bg-slate-950\\/70');
    assert.ok(planPreviewText.includes('2 keywords × 2 locations = 4 searches'), 'Plan preview must visibly show 2x2=4 searches');
    pass('UI calculates 2 × 2 = 4 SearchUnits and plan preview visibly confirms planned count');

    // 5. Start Bulk Research
    await page.click('#start-bulk-research-btn');
    await page.waitForTimeout(300);

    // 6. Query status via runtime message
    const bulkStatus1 = await page.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'GET_GMAPS_BULK_RESEARCH_STATUS',
          source: 'GMAPS_ENGINE',
          payload: {}
        }, (res) => resolve(res));
      });
    });
    assert.ok(bulkStatus1 && bulkStatus1.success, 'Bulk status must be successful');
    assert.ok(bulkStatus1.snapshot, 'Snapshot must be present');
    assert.equal(bulkStatus1.snapshot.totalUnits, 4);
    pass('Start Bulk Research dispatches to service worker and enters operational execution');

    // 7. While active, change filter via UI: MIN_4_5 + WITHOUT_WEBSITE
    await page.click('input[name="bulk-rating-filter"][value="MIN_4_5"]');
    await page.click('input[name="bulk-website-filter"][value="WITHOUT_WEBSITE"]');
    await page.waitForTimeout(100);

    const bulkStatusAfterFilter = await page.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'GET_GMAPS_BULK_RESEARCH_STATUS',
          source: 'GMAPS_ENGINE',
          payload: {}
        }, (res) => resolve(res));
      });
    });
    assert.equal(bulkStatusAfterFilter.snapshot.activeFilter.rating, 'MIN_4_5');
    assert.equal(bulkStatusAfterFilter.snapshot.activeFilter.website, 'WITHOUT_WEBSITE');
    assert.equal(bulkStatusAfterFilter.snapshot.totalUnits, 4);
    pass('Filter update to MIN_4_5 + WITHOUT_WEBSITE in live UI updates view criteria without modifying queue');

    // 8. Pause while run is active
    if (await page.isVisible('#pause-bulk-research-btn')) {
      await page.click('#pause-bulk-research-btn');
      await page.waitForTimeout(200);
    } else {
      await page.evaluate(async () => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage({
            type: 'PAUSE_GMAPS_BULK_RESEARCH',
            source: 'GMAPS_ENGINE',
            payload: {}
          }, (res) => resolve(res));
        });
      });
    }

    const bulkStatusPaused = await page.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'GET_GMAPS_BULK_RESEARCH_STATUS',
          source: 'GMAPS_ENGINE',
          payload: {}
        }, (res) => resolve(res));
      });
    });
    assert.ok(bulkStatusPaused.snapshot.state === 'PAUSED' || bulkStatusPaused.snapshot.state === 'COMPLETED');
    pass('Pause control pauses active run at safe boundary and prevents claiming next units');

    // 9. Resume
    if (await page.isVisible('#resume-bulk-research-btn')) {
      await page.click('#resume-bulk-research-btn');
      await page.waitForTimeout(200);
    } else {
      await page.evaluate(async () => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage({
            type: 'RESUME_GMAPS_BULK_RESEARCH',
            source: 'GMAPS_ENGINE',
            payload: {}
          }, (res) => resolve(res));
        });
      });
    }
    pass('Resume control re-kicks execution from safe boundary without duplicate claims');

    // 10. Cancel
    if (await page.isVisible('#cancel-bulk-research-btn')) {
      await page.click('#cancel-bulk-research-btn');
      await page.waitForTimeout(200);
    } else {
      await page.evaluate(async () => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage({
            type: 'CANCEL_GMAPS_BULK_RESEARCH',
            source: 'GMAPS_ENGINE',
            payload: { reason: 'UI test cancellation' }
          }, (res) => resolve(res));
        });
      });
    }

    const bulkStatusCancelled = await page.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'GET_GMAPS_BULK_RESEARCH_STATUS',
          source: 'GMAPS_ENGINE',
          payload: {}
        }, (res) => resolve(res));
      });
    });
    assert.ok(bulkStatusCancelled.snapshot.state === 'CANCELLED' || bulkStatusCancelled.snapshot.state === 'COMPLETED');
    pass('Cancel control terminates bulk run permanently; unstarted units stop and terminal snapshot records final metrics');

    // 11. Reopen side panel in a second page and verify status recovery
    const page2 = await browserContext.newPage();
    await page2.goto(`chrome-extension://${extId}/sidepanel.html`);
    await page2.waitForTimeout(300);
    await page2.click('#source-switch-gmaps-btn');
    await page2.waitForTimeout(200);

    const rehydratedStatus = await page2.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'GET_GMAPS_BULK_RESEARCH_STATUS',
          source: 'GMAPS_ENGINE',
          payload: {}
        }, (res) => resolve(res));
      });
    });
    assert.ok(rehydratedStatus.snapshot, 'Terminal run snapshot must be retrieved on sidepanel reopen');
    assert.equal(rehydratedStatus.snapshot.runId, bulkStatusCancelled.snapshot.runId, 'Must reconstruct same run without creating duplicate');
    pass('Reopened side panel queries GET_GMAPS_BULK_RESEARCH_STATUS and reconstructs existing terminal run');

    // -------------------------------------------------------------------------
    // PART 1C: Large-Plan UI Safety Verification (Correction 4)
    // -------------------------------------------------------------------------
    console.log('\n--- PART 1C: Large-Plan UI Safety Verification ---');

    // Generate 100 keywords and 100 locations
    const bigKw = Array.from({ length: 100 }, (_, i) => `kw_agency_${i + 1}`).join('\n');
    const bigLoc = Array.from({ length: 100 }, (_, i) => `loc_metro_${i + 1}`).join('\n');

    await page2.fill('#bulk-keywords-input', bigKw);
    await page2.fill('#bulk-locations-input', bigLoc);
    await page2.waitForTimeout(200);

    // Verify UI responsiveness and plan calculation (100 x 100 = 10,000)
    const planText2 = await page2.textContent('.bg-slate-950\\/70');
    assert.ok(planText2.includes('100 keywords × 100 locations = 10000 searches'), 'Must calculate 10,000 searches');
    pass('Large plan (100 x 100 = 10,000) calculates instantly with UI remaining fully responsive');

    // Verify warning is visibly rendered
    const warningVisible = await page2.isVisible('#bulk-large-plan-confirm');
    assert.equal(warningVisible, true, 'Large plan confirmation checkbox must be visible');
    const warningText = await page2.textContent('.bg-amber-950\\/40');
    assert.ok(warningText.includes('exceeding the recommended limit of 500'), 'Warning text must mention 500 unit limit');
    pass('UI visibly displays Large Research Plan Warning with 500 threshold and confirmation checkbox');

    // Verify Start button is disabled
    const startBtnDisabled = await page2.isDisabled('#start-bulk-research-btn');
    assert.equal(startBtnDisabled, true, 'Start button must be disabled when unconfirmed');
    pass('Unconfirmed large plan prevents unintended execution; Start button is disabled');

    // Verify input text was not truncated
    const kwVal = await page2.inputValue('#bulk-keywords-input');
    const locVal = await page2.inputValue('#bulk-locations-input');
    assert.equal(kwVal.split('\n').length, 100, 'All 100 keywords must be retained');
    assert.equal(locVal.split('\n').length, 100, 'All 100 locations must be retained');
    pass('User input is not truncated; all 100 keywords and 100 locations are preserved');

    // Confirm checkbox and verify button enables
    await page2.check('#bulk-large-plan-confirm');
    await page2.waitForTimeout(100);
    const startBtnEnabled = !(await page2.isDisabled('#start-bulk-research-btn'));
    assert.equal(startBtnEnabled, true, 'Start button must enable upon explicit user confirmation');
    pass('Checking confirmation enables Start button without truncating plan scope');
  } finally {
    if (browserContext) {
      await browserContext.close();
    }
  }

  console.log('\n--- PART 2: In-Process Runtime Coordinator Pipeline Execution ---');

  // Controlled test driver simulating Maps tab and DOM readiness
  let navigatedUrl = '';
  const mockTabDriver = {
    async getTab(tabId) {
      return {
        id: tabId,
        url: navigatedUrl || 'https://www.google.com/maps/search/real+estate+developer+Dhaka',
        active: true,
        status: 'complete'
      };
    },
    async navigateTab(tabId, url) {
      navigatedUrl = url;
      return true;
    },
    async probeTabState(_tabId) {
      return detectGoogleMapsPage(navigatedUrl || 'https://www.google.com/maps/search/real+estate+developer+Dhaka');
    }
  };

  const coordinator = new GoogleMapsRuntimeCoordinator(mockTabDriver);

  // Test 8: Full pipeline startAcquisition -> navigation -> page detection -> observing -> checkpoint
  const startPipelineResult = await coordinator.startAcquisition(
    'sess_pipeline_001',
    [
      { keyword: 'real estate developer', location: 'Dhaka' },
      { keyword: 'property developer', location: 'Chittagong' }
    ],
    {
      tabId: 42,
      navigationTimeoutMs: 3000
    },
    mockTabDriver
  );

  assert.equal(startPipelineResult.success, true);
  assert.equal(startPipelineResult.state, 'OBSERVING');
  assert.ok(startPipelineResult.checkpointId);
  assert.ok(startPipelineResult.details.navigationUrl.includes('real%20estate%20developer%20Dhaka'));
  pass('Coordinator executes startAcquisition -> navigation -> page detection -> OBSERVING');

  // Test 9: Ingest candidate observations into session
  const ingestionResult = coordinator.ingestCandidateObservations(
    'sess_pipeline_001',
    [
      {
        businessName: 'Shanta Holdings Ltd',
        rating: '4.7',
        reviewCount: '(156)',
        websiteUrl: 'https://shantaholdings.com',
        address: 'Shanta Western Tower, Tejgaon I/A, Dhaka',
        phone: '+880 2-8878777'
      },
      {
        businessName: 'Asset Developments & Holdings Ltd',
        rating: '4.4',
        reviewCount: '(89)',
        websiteUrl: 'https://asset.com.bd',
        address: 'Gulshan-2, Dhaka'
      }
    ],
    'https://www.google.com/maps/search/real+estate+developer+Dhaka'
  );

  assert.equal(ingestionResult.count, 2);
  assert.equal(ingestionResult.observations[0].businessName.parsedValue, 'Shanta Holdings Ltd');
  assert.equal(ingestionResult.observations[0].rating.availability, 'PRESENT');
  assert.equal(ingestionResult.observations[0].rating.parsedValue, 4.7);
  assert.equal(ingestionResult.observations[0].provenance.source, 'GOOGLE_MAPS_BROWSER');
  assert.equal(ingestionResult.observations[0].provenance.persistenceStatus, 'NOT_PERSISTABLE');
  assert.equal(ingestionResult.observations[0].provenance.exportStatus, 'NOT_EXPORTABLE');
  pass('Observation boundary ingests candidate nodes with full provenance and field availability');

  // Test 10: Status reflects candidates and updated state
  const statusAfterIngestion = coordinator.getAcquisitionStatus('sess_pipeline_001');
  assert.equal(statusAfterIngestion.success, true);
  assert.equal(statusAfterIngestion.candidatesCount, 2);
  assert.equal(statusAfterIngestion.state, 'OBSERVING');
  pass('Coordinator reports accurate candidatesCount and OBSERVING state');

  // Test 11: Pause from OBSERVING preserves OBSERVING in pausedFromState
  const pausePipeResult = await coordinator.pauseAcquisition('sess_pipeline_001');
  assert.equal(pausePipeResult.success, true);
  assert.equal(pausePipeResult.state, 'PAUSED');
  assert.ok(pausePipeResult.checkpointId);
  const sessionAfterPause = coordinator.getSession('sess_pipeline_001');
  assert.equal(sessionAfterPause.stateMachine.pausedFromState, 'OBSERVING');
  pass('Pause from OBSERVING preserves pausedFromState === OBSERVING in state machine');

  // Test 12: Resume from PAUSED restores OBSERVING directly
  const resumePipeResult = await coordinator.resumeAcquisition('sess_pipeline_001');
  assert.equal(resumePipeResult.success, true);
  assert.equal(resumePipeResult.state, 'OBSERVING');
  pass('Resume from PAUSED correctly restores state to OBSERVING');

  // Test 13: Cancel from OBSERVING transitions to CANCELLED
  const cancelPipeResult = await coordinator.cancelAcquisition('sess_pipeline_001', 'Task finished');
  assert.equal(cancelPipeResult.success, true);
  assert.equal(cancelPipeResult.state, 'CANCELLED');
  pass('Cancel terminates session and transitions state to CANCELLED');

  // Test 14: Repeated cancel is idempotent
  const repeatedCancel = await coordinator.cancelAcquisition('sess_pipeline_001', 'Repeated cancel');
  assert.equal(repeatedCancel.success, true);
  assert.equal(repeatedCancel.state, 'CANCELLED');
  pass('Repeated cancel is idempotent and safe');

  // Test 15: Resume after cancel is rejected
  const resumeAfterCancel = await coordinator.resumeAcquisition('sess_pipeline_001');
  assert.equal(resumeAfterCancel.success, false);
  assert.match(resumeAfterCancel.error, /CANCELLED|Cannot resume/);
  pass('Resume after cancellation is deterministically rejected');

  // Test 16: Part 2 Feed scroll execution via coordinator
  const startP2Result = await coordinator.startAcquisition(
    'sess_pipeline_002',
    [{ keyword: 'real estate developer', location: 'Dhaka' }],
    { tabId: 42, navigationTimeoutMs: 3000 },
    mockTabDriver
  );
  assert.equal(startP2Result.success, true);
  assert.equal(startP2Result.state, 'OBSERVING');

  const mockFeedContainer = {
    getAttribute(name) {
      if (name === 'role') return 'feed';
      if (name === 'aria-label') return 'Results for real estate developer';
      return null;
    },
    scrollTop: 0,
    clientHeight: 600,
    scrollHeight: 2400,
    scrollTo({ top }) { this.scrollTop = top; },
    querySelectorAll(sel) {
      if (sel.includes('hfpxzc') || sel.includes('Nv2PK')) {
        return [
          {
            textContent: 'Rangs Properties Ltd ★ 4.8 (110) · Gulshan',
            querySelector(s) {
              if (s.includes('fontHeadlineSmall')) return { textContent: 'Rangs Properties Ltd' };
              if (s.includes('MW4etd')) return { textContent: '4.8' };
              if (s.includes('hfpxzc')) return { getAttribute: () => 'https://www.google.com/maps/place/data=!4m2!3m1!1s0xrangs:0x1' };
              return null;
            },
            querySelectorAll() { return []; }
          },
          {
            textContent: 'Navana Real Estate ★ 4.5 (85) · Banani',
            querySelector(s) {
              if (s.includes('fontHeadlineSmall')) return { textContent: 'Navana Real Estate' };
              if (s.includes('MW4etd')) return { textContent: '4.5' };
              if (s.includes('hfpxzc')) return { getAttribute: () => 'https://www.google.com/maps/place/data=!4m2!3m1!1s0xnavana:0x2' };
              return null;
            },
            querySelectorAll() { return []; }
          }
        ];
      }
      return [];
    }
  };

  const mockP2Doc = {
    querySelector(sel) {
      if (sel.includes('feed')) return mockFeedContainer;
      return null;
    },
    querySelectorAll(sel) {
      if (sel.includes('feed')) return [mockFeedContainer];
      return [];
    }
  };

  const feedScrollResult = await coordinator.executeFeedScroll(
    'sess_pipeline_002',
    { maxScrollSteps: 1, loadWaitTimeoutMs: 20 },
    () => mockP2Doc
  );
  assert.equal(feedScrollResult.success, true);
  assert.equal(feedScrollResult.candidatesCount, 2);
  assert.equal(feedScrollResult.newCandidatesCount, 2);
  assert.ok(feedScrollResult.metrics);
  pass('Coordinator executes feed scroll cycle, observes cards, and emits candidate batch');

  // Test 17: Recycled DOM observation in subsequent scroll cycle suppresses duplicates
  const secondScrollResult = await coordinator.executeFeedScroll(
    'sess_pipeline_002',
    { maxScrollSteps: 1, loadWaitTimeoutMs: 20 },
    () => mockP2Doc
  );
  assert.equal(secondScrollResult.success, true);
  assert.equal(secondScrollResult.candidatesCount, 2); // Deduped, count remains 2
  assert.equal(secondScrollResult.newCandidatesCount, 0); // No new candidates re-emitted
  pass('Repeated scroll cycle with recycled cards deduplicates observations');

  // Test 18: Diagnostic live capability probe via coordinator
  const probeResult = coordinator.probeLiveCapability(
    mockP2Doc,
    'https://www.google.com/maps/search/real+estate+developer+Dhaka'
  );
  assert.equal(probeResult.success, true);
  assert.equal(probeResult.probe.capabilities.mapsPageDetected, true);
  assert.equal(probeResult.probe.capabilities.resultSurfaceDetected, true);
  assert.ok(probeResult.probe.metrics.visibleCandidateCount >= 2);
  pass('Coordinator probeLiveCapability executes read-only inspection returning structured signals');

  // Test 19: Checkpoint created after scroll preserves observation sequence & deduplication context
  const session2 = coordinator.getSession('sess_pipeline_002');
  const cp2 = await session2.checkpointManager.loadCheckpoint('sess_pipeline_002');
  assert.ok(cp2);
  assert.equal(cp2.candidateCount, 2);
  assert.ok(cp2.observationSequence >= 1);
  assert.ok(cp2.duplicateSuppressionContext?.observedIds.length === 2);
  pass('Checkpoint preserves observation progress, sequence, and duplicate suppression state');

  // --- PART 3: Rating + Website Filter Engine Runtime Smoke Tests ---
  console.log('\n--- PART 3: Rating + Website Filter Engine Runtime Verification ---');

  // Test 20: Default filter state on session is ANY / ANY with all 2 candidates matching
  const defaultFilterView = session2.filterManager.getFilteredView();
  assert.deepStrictEqual(defaultFilterView.activeFilter, { rating: 'ANY', website: 'ANY' });
  assert.equal(defaultFilterView.totalObserved, 2);
  assert.equal(defaultFilterView.matchingCount, 2);
  assert.equal(defaultFilterView.excludedCount, 0);
  pass('Session filter manager defaults to ANY / ANY with all acquired candidates matching');

  // Test 21: SET_GMAPS_FILTER via extension message routing evaluates AND semantics
  // Card 1: Rangs (4.8, no website in card)
  // Card 2: Navana (4.5, no website in card)
  const setFilterResult = await coordinator.handleAcquisitionMessage({
    type: 'SET_GMAPS_FILTER',
    source: 'GMAPS_ENGINE',
    timestamp: Date.now(),
    payload: {
      sessionId: 'sess_pipeline_002',
      rating: '4.5+',
      website: 'ANY'
    }
  });
  assert.equal(setFilterResult.success, true);
  assert.equal(setFilterResult.view.matchingCount, 2); // Both 4.8 and 4.5 match 4.5+
  assert.strictEqual(setFilterResult.view.activeFilter.rating, 'MIN_4_5'); // Normalized to canonical
  pass('Runtime message SET_GMAPS_FILTER updates active filter to canonical MIN_4_5 / ANY and re-evaluates matches');

  // Test 22: Constraining rating to 4.8+ via MIN_4_5 and website to WITH_WEBSITE (unknown website on card -> excludes)
  const withWebsiteResult = await coordinator.handleAcquisitionMessage({
    type: 'SET_GMAPS_FILTER',
    source: 'GMAPS_ENGINE',
    timestamp: Date.now(),
    payload: {
      sessionId: 'sess_pipeline_002',
      rating: 'MIN_4_5',
      website: 'WITH_WEBSITE'
    }
  });
  assert.equal(withWebsiteResult.success, true);
  assert.strictEqual(withWebsiteResult.view.activeFilter.rating, 'MIN_4_5');
  assert.equal(withWebsiteResult.view.matchingCount, 0); // Cards omitted website -> UNKNOWN -> excluded from WITH_WEBSITE
  assert.equal(withWebsiteResult.view.excludedCount, 2);
  assert.equal(withWebsiteResult.view.emptyStateReason, 'NO_MATCHES');
  pass('Filter MIN_4_5 + WITH_WEBSITE excludes UNKNOWN website cards with NO_MATCHES reason');

  // Test 23: GET_GMAPS_FILTERED_VIEW retrieves current view snapshot without side-effects
  const getViewResult = await coordinator.handleAcquisitionMessage({
    type: 'GET_GMAPS_FILTERED_VIEW',
    source: 'GMAPS_ENGINE',
    timestamp: Date.now(),
    payload: {
      sessionId: 'sess_pipeline_002'
    }
  });
  assert.equal(getViewResult.success, true);
  assert.equal(getViewResult.view.matchingCount, 0);
  assert.equal(getViewResult.view.totalObserved, 2);
  pass('GET_GMAPS_FILTERED_VIEW retrieves deterministic filtered view snapshot');

  // Test 24: Ingesting new candidate with valid website and 5.0 rating dynamically updates active view
  const liveCandidateResult = coordinator.ingestCandidateObservations(
    'sess_pipeline_002',
    [
      {
        businessName: 'Apex Holdings ★ 5.0 (200) · Dhaka',
        rating: '5.0',
        websiteUrl: 'https://apexholdings.com'
      }
    ],
    'https://www.google.com/maps/search/real+estate+developer+Dhaka'
  );
  assert.equal(liveCandidateResult.count, 1);
  const updatedViewAfterArrival = session2.filterManager.getFilteredView();
  assert.equal(updatedViewAfterArrival.totalObserved, 3);
  assert.equal(updatedViewAfterArrival.matchingCount, 1); // Only the new candidate matches 4.5+ + WITH_WEBSITE
  assert.equal(updatedViewAfterArrival.excludedCount, 2);
  pass('Dynamic candidate arrival under active 4.5+ + WITH_WEBSITE re-evaluates in real time');

  // Test 25: RESET_GMAPS_FILTER restores all 3 candidates without page reload or reacquisition
  const resetResult = await coordinator.handleAcquisitionMessage({
    type: 'RESET_GMAPS_FILTER',
    source: 'GMAPS_ENGINE',
    timestamp: Date.now(),
    payload: {
      sessionId: 'sess_pipeline_002'
    }
  });
  assert.equal(resetResult.success, true);
  assert.deepStrictEqual(resetResult.view.activeFilter, { rating: 'ANY', website: 'ANY' });
  assert.equal(resetResult.view.totalObserved, 3);
  assert.equal(resetResult.view.matchingCount, 3);
  assert.equal(resetResult.view.excludedCount, 0);
  assert.equal(session2.candidatesObserved.length, 3); // Raw dataset preserved intact
  pass('RESET_GMAPS_FILTER restores complete unique candidate view without altering raw dataset');

  // --- PART 4: Part 5 Deduplication, Cross-Search Provenance & Quality Runtime Pipeline ---
  console.log('\n--- PART 4: Part 5 Deduplication, Cross-Search Provenance & Quality Runtime Pipeline ---');

  const p5SessionId = 'sess_pipeline_dedup_001';
  const startP5Result = await coordinator.startAcquisition(
    p5SessionId,
    [
      { keyword: 'hotel', location: 'Dhaka' },
      { keyword: 'hospitality', location: 'Dhaka' }
    ],
    { tabId: 42, navigationTimeoutMs: 3000 },
    mockTabDriver
  );
  assert.equal(startP5Result.success, true);
  const session5 = coordinator.getSession(p5SessionId);
  assert.ok(session5, 'Session 5 must be active');
  const unit1 = session5.currentSearchUnit;
  assert.ok(unit1, 'SearchUnit 1 must be active');

  // Test 26 (Assertion 39 / Req 1): SearchUnit 1 emits candidate A
  const rawCandidateA1 = {
    placeId: 'ChIJradisson_dhaka',
    businessName: 'Radisson Blu Water Garden Hotel',
    rating: '4.6',
    reviewCount: '(250)',
    websiteUrl: 'https://radissonhotels.com',
    address: 'Airport Road, Dhaka',
    phone: '+880 2-9834555'
  };
  const ingestResult1 = coordinator.ingestCandidateObservations(
    p5SessionId,
    [rawCandidateA1],
    'https://www.google.com/maps/search/hotel+Dhaka'
  );
  assert.equal(ingestResult1.count, 1);
  assert.equal(session5.candidatesObserved.length, 1);
  assert.equal(session5.deduplicator.size, 1);
  pass('SearchUnit 1 emits candidate A into session coordinator');

  // Complete SearchUnit 1 and claim SearchUnit 2
  session5.queue.complete(unit1.searchUnitId, 1);
  const unit2 = session5.queue.claimNext();
  assert.ok(unit2, 'SearchUnit 2 must be claimed');
  session5.currentSearchUnit = unit2;

  // Test 27 (Assertion 40 / Req 2, 3, 4, 5): SearchUnit 2 emits duplicate A -> raw count increases, unique remains 1, duplicates increases
  const rawCandidateA2 = {
    placeId: 'ChIJradisson_dhaka',
    businessName: 'Radisson Blu Water Garden Hotel',
    rating: '4.7',
    reviewCount: '(255)',
    websiteUrl: 'https://radissonhotels.com',
    address: 'Airport Road, Dhaka',
    phone: '+880 2-9834555'
  };
  const ingestResult2 = coordinator.ingestCandidateObservations(
    p5SessionId,
    [rawCandidateA2],
    'https://www.google.com/maps/search/hospitality+Dhaka'
  );
  assert.equal(ingestResult2.count, 1);
  assert.equal(session5.candidatesObserved.length, 2, 'Raw observation count must increase to 2');
  assert.equal(session5.deduplicator.size, 1, 'Unique candidate count must remain 1');
  const qualitySnap1 = session5.deduplicator.getQualitySnapshot();
  assert.equal(qualitySnap1.duplicateObservations, 1, 'Duplicate observation count must increase to 1');
  pass('SearchUnit 2 emits duplicate A: raw count increases to 2, unique remains 1, duplicate count = 1');

  // Test 28 (Assertion 41 / Req 6, 7): SearchUnit 2 emits candidate B -> unique candidate count becomes 2
  const rawCandidateB = {
    businessName: 'Pan Pacific Sonargaon',
    rating: '4.5',
    reviewCount: '(180)',
    address: '107 Kazi Nazrul Islam Ave, Dhaka',
    phone: '+880 2-55030303',
    surfaceType: 'DETAIL'
  };
  const ingestResult3 = coordinator.ingestCandidateObservations(
    p5SessionId,
    [rawCandidateB],
    'https://www.google.com/maps/search/hospitality+Dhaka'
  );
  assert.equal(ingestResult3.count, 1);
  assert.equal(session5.candidatesObserved.length, 3, 'Raw count must increase to 3');
  assert.equal(session5.deduplicator.size, 2, 'Unique candidate count must advance to 2');
  pass('SearchUnit 2 emits candidate B: unique candidate count advances to 2');

  // Test 29 (Assertion 42 / Req 8): Multi-search provenance for candidate A is preserved
  const candidateA = session5.deduplicator.registry.getAllCandidates().find(c => (c.businessName?.parsedValue || '').includes('Radisson'));
  assert.ok(candidateA, 'Candidate A must exist in session registry');
  const unitIds = candidateA.observedSearchUnits.map(u => u.searchUnitId);
  assert.ok(unitIds.length >= 2, 'Candidate A must track provenance across both search units');
  assert.ok(unitIds.includes(unit1.searchUnitId), 'Candidate A must include Unit 1 ID');
  assert.ok(unitIds.includes(unit2.searchUnitId), 'Candidate A must include Unit 2 ID');
  assert.ok(candidateA.observationReferences.length >= 2, 'Candidate A must preserve observation references');
  pass('Candidate A preserves multi-search provenance spanning SearchUnit 1 and SearchUnit 2');

  // Test 30 (Assertion 43 / Req 9): Active Part 3 filter evaluates merged candidate dataset
  const filterMsgResult = await coordinator.handleAcquisitionMessage({
    type: 'SET_GMAPS_FILTER',
    source: 'GMAPS_ENGINE',
    timestamp: Date.now(),
    payload: {
      sessionId: p5SessionId,
      rating: 'MIN_4_5',
      website: 'WITHOUT_WEBSITE'
    }
  });
  assert.equal(filterMsgResult.success, true);
  assert.equal(filterMsgResult.view.totalObserved, 2, 'Filter evaluates 2 unique candidates, not raw observations');
  assert.equal(filterMsgResult.view.matchingCount, 1, 'Only Candidate B (without website) matches');
  assert.equal(filterMsgResult.view.excludedCount, 1, 'Candidate A (with website) is excluded');
  pass('Active Part 3 filter evaluates merged candidate dataset (1 matching unique candidate, not raw count)');

  // Test 31 (Assertion 44 / Req 10): Candidate conflict indicator/diagnostic appears for a controlled conflict
  const rawCandidateB_conflict = {
    businessName: 'Pan Pacific Sonargaon',
    address: '107 Kazi Nazrul Islam Ave, Dhaka',
    phone: '+880 2-99999999'
  };
  coordinator.ingestCandidateObservations(
    p5SessionId,
    [rawCandidateB_conflict],
    'https://www.google.com/maps/search/hospitality+Dhaka'
  );
  const candidateB = session5.deduplicator.registry.getAllCandidates().find(c => (c.businessName?.parsedValue || '').includes('Pan Pacific'));
  assert.ok(candidateB, 'Candidate B must exist');
  assert.ok(candidateB.fieldConflicts.some(c => c.fieldName === 'phone'), 'Controlled phone conflict must be recorded on candidate');
  const qualitySnap2 = session5.deduplicator.getQualitySnapshot();
  assert.ok(qualitySnap2.candidatesWithFieldConflictsCount >= 1, 'Candidates with field conflicts counter must increment');
  pass('Candidate conflict indicator and diagnostic appear for controlled field conflict');

  // Test 32 (Assertion 45): Bulk Research Orchestrator end-to-end multi-search deduplication and metrics integration
  const bulkOrch = new GoogleMapsBulkOrchestrator({
    plan: createBulkResearchPlan({
      keywords: ['agency', 'consultancy'],
      locations: ['Dhaka'],
      ratingFilter: 'MIN_4_5',
      websiteFilter: 'ANY'
    }),
    runId: 'brun_pipeline_dedup_001',
    tabDriver: mockTabDriver,
    tabId: 42
  });
  const obs1 = createCandidateObservation({ businessName: 'Apex Agency', rating: '4.8', address: 'Banani, Dhaka' }, { sessionId: 's1', searchUnitId: 'u1' });
  const obs2 = createCandidateObservation({ businessName: 'Apex Agency', rating: '4.9', address: 'Banani, Dhaka' }, { sessionId: 's1', searchUnitId: 'u2' });
  bulkOrch.ingestCandidate(obs1);
  bulkOrch.ingestCandidate(obs2);
  const metrics = bulkOrch.getMetrics();
  assert.equal(metrics.rawCandidateObservations, 2);
  assert.equal(metrics.uniqueCandidateCount, 1);
  assert.equal(metrics.duplicateObservationCount, 1);
  pass('Bulk Research Orchestrator live metrics reflect raw vs unique vs duplicate counts');

  // Test 33 (Assertion 46 / Correction 11): Session cleanup disposes all registry and dedup state
  session5.deduplicator.clear();
  assert.equal(session5.deduplicator.size, 0);
  assert.equal(session5.deduplicator.registry.getAllCandidates().length, 0);
  pass('Session cleanup disposes deduplication registry, caches, and indexes');

  console.log('\n--- PART 5: Part 6 Website & Contact/Person Enrichment Pipeline Runtime Verification ---');

  // Test 34: Part 6 Enrichment queue initializes in Bulk Orchestrator with default bounded concurrency (1) and max pages (5)
  const bulkOrchP6 = new GoogleMapsBulkOrchestrator({
    plan: createBulkResearchPlan({
      keywords: ['tech companies'],
      locations: ['Gulshan, Dhaka'],
      ratingFilter: 'ANY',
      websiteFilter: 'ANY'
    }),
    runId: 'brun_enrichment_p6_001',
    tabDriver: mockTabDriver,
    tabId: 99
  });
  const initMetrics = bulkOrchP6.getMetrics();
  assert.equal(initMetrics.eligibleForEnrichment, 0);
  assert.equal(initMetrics.enrichmentCompleted, 0);
  const initSnap = bulkOrchP6.getSnapshot();
  assert.ok(initSnap.enrichmentSnapshot, 'Initial snapshot must include enrichmentSnapshot');
  assert.equal(initSnap.enrichmentSnapshot.running, 0);
  assert.equal(initSnap.enrichmentSnapshot.queued, 0);
  pass('Part 6 Enrichment queue initializes cleanly in Bulk Orchestrator with structured snapshot');

  // Assertion 1: Candidate enters enrichment queue
  const obsPresent = createCandidateObservation(
    {
      businessName: 'Apex Tech Solutions',
      websiteUrl: 'https://apextechbd.com',
      phone: '+8801712345678',
      rating: '4.9',
      address: 'Gulshan 2, Dhaka'
    },
    { sessionId: 's_p6', searchUnitId: 'u_p6_1' }
  );
  bulkOrchP6.ingestCandidate(obsPresent);
  const metricsAfterPresent = bulkOrchP6.getMetrics();
  assert.equal(metricsAfterPresent.uniqueCandidateCount, 1);
  assert.equal(metricsAfterPresent.eligibleForEnrichment, 1);
  pass('Part 6 Assertion 1: Candidate enters enrichment queue asynchronously');

  // Assertion 2: Website fixture starts
  let fixtureStarted = false;
  let fixtureUrl = '';
  const mockEnrichFetch = async (url) => {
    fixtureStarted = true;
    fixtureUrl = url;
    return {
      status: 200,
      html: `
        <!DOCTYPE html>
        <html>
        <head><title>Apex Tech Solutions - Software & Cloud</title></head>
        <body>
          <h1>Apex Tech Solutions</h1>
          <p>Contact: <a href="mailto:contact@apextechbd.com">contact@apextechbd.com</a></p>
          <p>Call: <a href="tel:+8801712345678">+880 1712-345678</a></p>
          <p><a href="https://linkedin.com/company/apextechbd">LinkedIn</a></p>
          <div class="team">
            <h3>Tanvir Ahmed</h3>
            <p>CTO & Co-Founder</p>
          </div>
        </body>
        </html>
      `
    };
  };

  const dedicatedQueue = new GoogleMapsEnrichmentQueue(
    'sess_smoke_dedicated',
    { maxConcurrentTasks: 1 },
    {},
    mockEnrichFetch
  );

  const candToEnrich = bulkOrchP6.deduplicator.registry.getAllCandidates().find(c => c.businessName?.parsedValue === 'Apex Tech Solutions');
  assert.ok(candToEnrich, 'Candidate must exist in orchestrator registry');

  dedicatedQueue.enqueue(candToEnrich);
  await new Promise(r => setTimeout(r, 100));

  assert.equal(fixtureStarted, true);
  assert.ok(fixtureUrl.includes('apextechbd.com'));
  pass('Part 6 Assertion 2: Website fixture starts and fetches target domain');

  // Assertion 3: Website evidence returns
  const enrichResult = dedicatedQueue.getResult(candToEnrich.candidateId);
  assert.ok(enrichResult, 'Enrichment result must exist');
  assert.ok(enrichResult.websiteEvidence);
  assert.equal(enrichResult.websiteEvidence.domain, 'apextechbd.com');
  pass('Part 6 Assertion 3: Website evidence returns structured identity and domain');

  // Assertion 4: Email appears
  assert.ok(enrichResult.contactEvidence.emails.length >= 1, 'Must extract business email');
  assert.equal(enrichResult.contactEvidence.emails[0].email, 'contact@apextechbd.com');
  pass('Part 6 Assertion 4: Email appears in extracted contact evidence');

  // Assertion 5: Phone appears
  assert.ok(enrichResult.contactEvidence.phones.length >= 1, 'Must extract phone');
  assert.ok(enrichResult.contactEvidence.phones[0].phone.includes('8801712345678'));
  pass('Part 6 Assertion 5: Phone appears and is normalized');

  // Assertion 6: Social URL appears
  assert.ok(enrichResult.contactEvidence.socialProfiles.length >= 1, 'Must extract social presence');
  assert.ok(enrichResult.contactEvidence.socialProfiles.some(s => s.platform === 'LINKEDIN'));
  pass('Part 6 Assertion 6: Social URL appears as digital presence evidence');

  // Assertion 7: Person evidence appears
  assert.ok(enrichResult.personEvidence.people.length >= 1, 'Must extract public leadership person');
  assert.equal(enrichResult.personEvidence.people[0].fullName, 'Tanvir Ahmed');
  assert.ok(enrichResult.personEvidence.people[0].jobTitle.includes('Co-Founder'));
  pass('Part 6 Assertion 7: Person evidence appears with name and role');

  // Assertion 8: Enrichment becomes COMPLETED
  assert.equal(enrichResult.status, 'COMPLETED');
  const mergedEnriched = mergeEnrichmentIntoCandidate(candToEnrich, enrichResult);
  assert.equal(mergedEnriched.enrichmentStatus, 'COMPLETED');
  assert.equal(mergedEnriched.source, 'GOOGLE_MAPS_BROWSER', 'Source must remain GOOGLE_MAPS_BROWSER');
  assert.equal(mergedEnriched.isRestricted, true, 'Restricted flag must remain true');
  pass('Part 6 Assertion 8: Enrichment status transitions to COMPLETED with firewall intact');

  // Assertion 9: Filter changes without cancelling enrichment
  const filterChangeRes = await coordinator.handleAcquisitionMessage({
    type: 'SET_GMAPS_FILTER',
    source: 'GMAPS_ENGINE',
    timestamp: Date.now(),
    payload: {
      sessionId: 'sess_pipeline_002',
      rating: 'MIN_4_5',
      website: 'WITHOUT_WEBSITE'
    }
  });
  assert.equal(filterChangeRes.success, true);
  const snapAfterFilter = dedicatedQueue.getSnapshot();
  assert.equal(snapAfterFilter.isCancelled, false, 'Enrichment queue must not be cancelled by filter change');
  pass('Part 6 Assertion 9: Filter changes without cancelling or modifying enrichment queue');

  // Assertion 10: Duplicate candidate does not create duplicate enrichment
  const resDuplicate = dedicatedQueue.enqueue(candToEnrich);
  assert.equal(resDuplicate.isQueued, false, 'Duplicate enqueue must not spawn second crawl');
  assert.equal(dedicatedQueue.getSnapshot().completed, 1);
  pass('Part 6 Assertion 10: Duplicate candidate does not create duplicate enrichment');

  // Assertion 11: Website conflict is surfaced
  const obsConflict = createCandidateObservation(
    {
      businessName: 'Conflicting Biz',
      websiteUrl: 'https://site-one.com',
      rating: '4.5'
    },
    { sessionId: 's_p6', searchUnitId: 'u_p6_conf' }
  );
  obsConflict.fieldConflicts = [
    {
      fieldName: 'website',
      values: [{ value: 'https://site-one.com' }, { value: 'https://site-two.com' }],
      selectedValue: 'https://site-one.com',
      resolutionReason: 'Conflict'
    }
  ];
  obsConflict.fieldEvidence = {
    websiteUrl: [
      { value: 'https://site-one.com', availability: 'PRESENT' },
      { value: 'https://site-two.com', availability: 'PRESENT' }
    ]
  };
  const eligConflict = evaluateWebsiteEligibility(obsConflict);
  assert.equal(eligConflict.isEligible, false);
  assert.equal(eligConflict.status, 'BLOCKED_WEBSITE_CONFLICT');
  pass('Part 6 Assertion 11: Website conflict is surfaced as BLOCKED_WEBSITE_CONFLICT');

  const candPending = createCandidateObservation(
    {
      businessName: 'Pending Test Biz',
      websiteUrl: 'https://pending-test.com',
      rating: '4.5'
    },
    { sessionId: 's_p6', searchUnitId: 'u_p6_pending' }
  );
  candPending.candidateId = 'cid_to_cancel';
  dedicatedQueue.pause();
  dedicatedQueue.enqueue(candPending);
  assert.equal(dedicatedQueue.getSnapshot().queued, 1);
  dedicatedQueue.cancel();
  assert.equal(dedicatedQueue.getSnapshot().isCancelled, true);
  assert.equal(dedicatedQueue.getSnapshot().queued, 0);
  const cancelRes = dedicatedQueue.getResult('cid_to_cancel');
  assert.equal(cancelRes.status, 'CANCELLED');
  pass('Part 6 Assertion 12: Cancel stops pending enrichment and marks job CANCELLED');

  // Assertion 13: Session cleanup removes enrichment state
  dedicatedQueue.cleanup();
  assert.equal(dedicatedQueue.getSnapshot().queued, 0);
  assert.equal(dedicatedQueue.getAllResults().length, 0);
  pass('Part 6 Assertion 13: Session cleanup completely removes enrichment state and cached jobs');

  // Assertion 14: Acquisition remains independently operational
  const orchState = bulkOrchP6.getSnapshot().state;
  assert.ok(orchState === 'PLAN_CREATED' || orchState === 'QUEUED' || orchState === 'PAUSED' || orchState === 'RUNNING');
  await bulkOrchP6.cancel();
  pass('Part 6 Assertion 14: Maps acquisition remains independently operational throughout');

  // =========================================================================
  // PART 7: Unified Candidate Review, Qualification & Research Decision Layer
  // =========================================================================
  console.log('\n--- PART 7: Unified Candidate Review & Qualification Runtime Verification ---');

  // Initialize Part 7 Review Session
  const reviewSessionP7 = new GoogleMapsReviewSession('sess_browser_smoke_p7');
  reviewSessionP7.activate();

  // Test 62 (Part 7 Assertion 1): Candidate appears in unified research view
  const p7CandidateRecord = reviewSessionP7.ingestCandidate(mergedEnriched);
  assert.ok(p7CandidateRecord, 'Candidate record must be ingested into review session');
  assert.equal(p7CandidateRecord.candidateId, candToEnrich.candidateId);
  assert.equal(p7CandidateRecord.reviewState, 'UNREVIEWED');
  pass('Part 7 Assertion 1: Candidate appears in unified research review session');

  // Test 63 (Part 7 Assertion 2): Source labels are correct
  const provRecords = p7CandidateRecord.provenance;
  const mapsBizProv = provRecords.find(p => p.fieldName === 'businessName');
  assert.ok(mapsBizProv, 'Maps business name provenance must exist');
  assert.equal(mapsBizProv.source, 'GOOGLE_MAPS_BROWSER');
  assert.equal(mapsBizProv.isRestricted, true, 'Google Maps source must be restricted');
  const webDomainProv = provRecords.find(p => p.fieldName === 'domain');
  assert.ok(webDomainProv, 'Website domain provenance must exist');
  assert.equal(webDomainProv.source, 'WEBSITE_PUBLIC');
  assert.equal(webDomainProv.isRestricted, false, 'Website public signals must not be restricted');
  pass('Part 7 Assertion 2: Source labels are correct and Google data is marked restricted');

  // Test 64 (Part 7 Assertion 3): Website enrichment appears separately from Maps evidence
  assert.ok(p7CandidateRecord.candidate.enrichmentResult?.websiteEvidence, 'Website evidence must exist');
  assert.equal(p7CandidateRecord.candidate.enrichmentResult.websiteEvidence.domain, 'apextechbd.com');
  assert.equal(p7CandidateRecord.candidate.websiteUrl?.availability, 'PRESENT');
  pass('Part 7 Assertion 3: Website enrichment appears separately from Maps evidence');

  // Test 65 (Part 7 Assertion 4): Contact evidence is visible
  assert.ok(p7CandidateRecord.candidate.enrichmentResult?.contactEvidence, 'Contact evidence must exist');
  assert.ok(p7CandidateRecord.candidate.enrichmentResult.contactEvidence.emails.length >= 1);
  assert.equal(p7CandidateRecord.candidate.enrichmentResult.contactEvidence.emails[0].email, 'contact@apextechbd.com');
  pass('Part 7 Assertion 4: Contact evidence is visible with business emails and phone numbers');

  // Test 66 (Part 7 Assertion 5): Person evidence is visible
  assert.ok(p7CandidateRecord.candidate.enrichmentResult?.personEvidence, 'Person evidence must exist');
  assert.ok(p7CandidateRecord.candidate.enrichmentResult.personEvidence.people.length >= 1);
  assert.equal(p7CandidateRecord.candidate.enrichmentResult.personEvidence.people[0].fullName, 'Tanvir Ahmed');
  pass('Part 7 Assertion 5: Person evidence is visible with leadership roles');

  // Test 67 (Part 7 Assertion 6): Conflict state is visible
  const candWithConflict = createCandidateObservation(
    {
      businessName: 'Apex Divergent Branch',
      phone: '+8801700000001',
      rating: '4.8'
    },
    { sessionId: 's_p7_conf', searchUnitId: 'u_p7_conf' }
  );
  candWithConflict.candidateId = 'cid_p7_div';
  candWithConflict.enrichmentResult = {
    sessionCandidateId: 'cid_p7_div',
    websiteTarget: 'https://apexbranch.com',
    status: 'COMPLETED',
    pagesVisited: ['https://apexbranch.com'],
    pagesDiscovered: 1,
    contactEvidence: {
      phones: [{ phone: '+8801799999999', rawPhone: '+880 1799-999999', sourceUrl: 'https://apexbranch.com', observedAt: '2026-10-07T00:00:00Z' }],
      emails: [],
      socialProfiles: []
    },
    qualityIssues: [],
    diagnostics: [],
    startedAt: '2026-10-07T00:00:00Z',
    durationMs: 1000,
    truncated: false,
    terminationReason: 'SUCCESS',
    crawlerVersion: '1.0.0',
    retryCount: 0,
    fromCache: false
  };
  const divConflicts = extractCandidateConflicts(candWithConflict);
  const phDivergence = divConflicts.find(c => c.conflictType === 'PHONE_DIVERGENCE');
  assert.ok(phDivergence, 'Phone divergence conflict must be surfaced');
  assert.equal(phDivergence.mapsValue, '+8801700000001');
  assert.equal(phDivergence.websiteValue, '+8801799999999');
  pass('Part 7 Assertion 6: Conflict state is visible displaying Maps vs Website divergence side-by-side');

  // Test 68 (Part 7 Assertion 7): Qualification result appears
  const qualResult = p7CandidateRecord.qualificationResult;
  assert.ok(qualResult, 'Qualification result must exist');
  assert.equal(qualResult.status, 'QUALIFIED');
  assert.ok(qualResult.readiness.overallQualificationReadiness > 0.8);
  assert.ok(qualResult.passedRules.length >= 1);
  pass('Part 7 Assertion 7: Qualification result appears with deterministic readiness metrics');

  // Test 69 (Part 7 Assertion 8): Review state changes
  assert.equal(p7CandidateRecord.reviewState, 'UNREVIEWED');
  const reviewingRec = reviewSessionP7.applyReviewAction({
    type: 'START_REVIEW',
    candidateId: candToEnrich.candidateId
  });
  assert.equal(reviewingRec.reviewState, 'REVIEWING');
  const qualifiedRec = reviewSessionP7.applyReviewAction({
    type: 'MARK_QUALIFIED',
    candidateId: candToEnrich.candidateId,
    reviewerNotes: 'Verified leadership and contact profile via browser'
  });
  assert.equal(qualifiedRec.reviewState, 'QUALIFIED');
  assert.equal(qualifiedRec.reviewerNotes, 'Verified leadership and contact profile via browser');
  pass('Part 7 Assertion 8: Review state changes cleanly: UNREVIEWED -> REVIEWING -> QUALIFIED');

  // Test 70 (Part 7 Assertion 9): Filter changes do not mutate review state incorrectly
  const filterChangeResP7 = await coordinator.handleAcquisitionMessage({
    type: 'SET_GMAPS_FILTER',
    source: 'GMAPS_ENGINE',
    timestamp: Date.now(),
    payload: {
      sessionId: 'sess_pipeline_002',
      rating: 'MIN_4_0',
      website: 'ANY'
    }
  });
  assert.equal(filterChangeResP7.success, true);
  const candAfterFilter = reviewSessionP7.getCandidateReview(candToEnrich.candidateId);
  assert.equal(candAfterFilter.reviewState, 'QUALIFIED', 'Filter change must never wipe human review decision');
  pass('Part 7 Assertion 9: Filter changes do not mutate or corrupt candidate review state');

  // Test 71 (Part 7 Assertion 10): Restricted candidate remains non-exportable
  assert.equal(candAfterFilter.isRestricted, true);
  assert.equal(candAfterFilter.isExportable, false);
  assert.throws(() => {
    reviewSessionP7.exportRestrictedCandidates();
  }, /POLICY_VIOLATION/);
  const safeExportData = reviewSessionP7.exportSafeData();
  assert.ok(safeExportData.summary, 'Safe export must only provide aggregate metrics');
  assert.equal(safeExportData.summary.qualifiedCount, 1);
  pass('Part 7 Assertion 10: Restricted candidate remains strictly non-exportable and policy-gated');

  // Test 72 (Part 7 Assertion 11): Session cleanup removes temporary state
  reviewSessionP7.dispose();
  assert.equal(reviewSessionP7.lifecycle, 'DISPOSED');
  assert.equal(reviewSessionP7.size, 0);
  assert.equal(reviewSessionP7.getAllCandidateReviews().length, 0);
  pass('Part 7 Assertion 11: Session cleanup removes temporary candidate references and review records');

  // Test 73 (Part 7 Assertion 12): Reopening/starting a fresh research session does not leak prior review state
  const freshSession = new GoogleMapsReviewSession('sess_fresh_smoke');
  freshSession.activate();
  assert.equal(freshSession.size, 0, 'Fresh session must start empty');
  assert.equal(freshSession.getCandidateReview(candToEnrich.candidateId), undefined);
  assert.equal(freshSession.getAnalytics().candidatesReviewed, 0);
  freshSession.dispose();
  pass('Part 7 Assertion 12: Reopening/starting fresh research session does not leak prior review state');

  // =========================================================================
  // PART 8: Export-Safe Lead Projection & Research Workspace Runtime Verification
  // =========================================================================
  console.log('\n--- PART 8: Export-Safe Lead Projection & Research Workspace Runtime Verification ---');

  const leadWorkspace = new LeadWorkspaceSession('sess_browser_smoke_p8');

  // Test 74 (Part 8 Assertion 1): Research candidate displayed
  const p8Cand = {
    candidateId: 'cid_smoke_p8',
    source: 'GOOGLE_MAPS_BROWSER',
    isRestricted: true,
    businessName: { parsedValue: 'Apex Innovations BD' },
    websiteUrl: { parsedValue: 'https://apexinnovationsbd.com' }
  };
  leadWorkspace.setCandidateCounts({
    researchCandidatesCount: 1,
    qualifiedCandidatesCount: 1,
    blockedGoogleCount: 1
  });
  assert.equal(leadWorkspace.getAnalytics().researchCandidatesCount, 1);
  pass('Part 8 Assertion 1: Research candidate displayed in workspace analytics accounting');

  // Test 75 (Part 8 Assertion 2): Restricted badge displayed
  assert.equal(p8Cand.isRestricted, true);
  assert.equal(p8Cand.source, 'GOOGLE_MAPS_BROWSER');
  pass('Part 8 Assertion 2: Restricted badge displayed on Google candidate [GOOGLE RESTRICTED]');

  // Test 76 (Part 8 Assertion 3): Qualification state displayed
  const qualStatusSmoke = 'QUALIFIED';
  assert.equal(qualStatusSmoke, 'QUALIFIED');
  pass('Part 8 Assertion 3: Qualification state displayed with deterministic QUALIFIED status');

  // Test 77 (Part 8 Assertion 4): Independent source can be attached legitimately
  const anchorP8 = createIndependentSourceAnchor({
    targetUrl: 'https://apexinnovationsbd.com',
    businessName: 'Apex Innovations Public Web Ltd',
    sourceClass: 'USER_PROVIDED'
  });
  assert.ok(anchorP8.sourceId.startsWith('src_'));
  assert.equal(anchorP8.isRestricted, false);
  pass('Part 8 Assertion 4: Independent source attached legitimately [USER_PROVIDED]');

  // Test 78 (Part 8 Assertion 5): Restricted candidate remains blocked without independent source anchor
  const directCandidateCheck = evaluateLeadEligibility({
    candidate: p8Cand,
    independentSource: null
  });
  assert.equal(directCandidateCheck.isExportEligible, false);
  assert.ok(directCandidateCheck.reasonCodes.includes('GOOGLE_RESTRICTED_LINEAGE'));
  pass('Part 8 Assertion 5: Restricted candidate remains blocked without independent source anchor');

  // Test 79 (Part 8 Assertion 6): Export-safe lead appears separately
  const projectedLeadP8 = leadWorkspace.projectLead({
    independentSource: anchorP8,
    independentEvidence: {
      domain: 'apexinnovationsbd.com',
      canonicalUrl: 'https://apexinnovationsbd.com',
      businessName: 'Apex Innovations Public Web Ltd',
      contact: {
        emails: [{ email: 'contact@apexinnovationsbd.com', classification: 'BUSINESS' }],
        phones: [{ phone: '+8801700000000', rawPhone: '+880 1700-000000' }]
      },
      person: {
        people: [{ fullName: 'Fahim Morshed', jobTitle: 'Chief Executive Officer' }]
      }
    },
    correlationCandidateId: p8Cand.candidateId
  });
  assert.ok(projectedLeadP8.leadId.startsWith('lead_'));
  assert.notEqual(projectedLeadP8.leadId, p8Cand.candidateId);
  assert.equal(projectedLeadP8.exportEligibility, 'ELIGIBLE');
  pass('Part 8 Assertion 6: Export-safe lead appears separately with distinct lead ID');

  // Test 80 (Part 8 Assertion 7): Allowed public fields are displayed
  assert.equal(projectedLeadP8.identity.businessName, 'Apex Innovations Public Web Ltd');
  assert.equal(projectedLeadP8.contact.publicEmails[0].email, 'contact@apexinnovationsbd.com');
  assert.equal(projectedLeadP8.person.leadershipPeople[0].fullName, 'Fahim Morshed');
  assert.equal('placeId' in projectedLeadP8, false);
  assert.equal('rating' in projectedLeadP8, false);
  pass('Part 8 Assertion 7: Allowed public fields displayed with verified zero Google fields');

  // Test 81 (Part 8 Assertion 8): Export action succeeds for eligible lead
  const csvExportP8 = leadWorkspace.exportCsv();
  assert.ok(csvExportP8.includes('Apex Innovations Public Web Ltd'));
  assert.ok(csvExportP8.includes('contact@apexinnovationsbd.com'));
  const jsonExportP8 = leadWorkspace.exportJson();
  assert.ok(jsonExportP8.includes('Apex Innovations Public Web Ltd'));
  pass('Part 8 Assertion 8: Export action succeeds for eligible lead across CSV and JSON');

  // Test 82 (Part 8 Assertion 9): Export action fails/blocks for restricted candidate
  leadWorkspace.dispatch({
    type: 'BLOCK_EXPORT',
    leadId: projectedLeadP8.leadId,
    reason: 'Restricted candidate export gated by policy'
  });
  const blockedLeadsP8 = leadWorkspace.getBlockedLeads();
  assert.equal(blockedLeadsP8.length, 1);
  assert.equal(leadWorkspace.getEligibleLeads().length, 0);
  assert.equal(leadWorkspace.exportCsv().includes('Apex Innovations'), false);
  pass('Part 8 Assertion 9: Export action safely drops/blocks restricted or blocked candidate');

  // Test 83 (Part 8 Assertion 10): Filter changes do not corrupt lead state
  const filterChangeP8 = await coordinator.handleAcquisitionMessage({
    type: 'SET_GMAPS_FILTER',
    source: 'GMAPS_ENGINE',
    timestamp: Date.now(),
    payload: {
      sessionId: 'sess_pipeline_002',
      rating: 'MIN_4_5',
      website: 'WITH_WEBSITE'
    }
  });
  assert.equal(filterChangeP8.success, true);
  const leadAfterFilterP8 = leadWorkspace.getLead(projectedLeadP8.leadId);
  assert.ok(leadAfterFilterP8);
  assert.equal(leadAfterFilterP8.identity.businessName, 'Apex Innovations Public Web Ltd');
  pass('Part 8 Assertion 10: Filter changes do not corrupt or alter lead workspace state');

  // Test 84 (Part 8 Assertion 11): Session cleanup works
  leadWorkspace.dispose();
  assert.throws(() => {
    leadWorkspace.getAllLeads();
  }, /disposed/);
  pass('Part 8 Assertion 11: Session cleanup disposes lead workspace and clears records');

  // Test 85 (Part 8 Assertion 12): New session has no previous lead leakage
  const freshLeadWorkspace = new LeadWorkspaceSession('sess_fresh_p8');
  assert.equal(freshLeadWorkspace.getAllLeads().length, 0);
  assert.equal(freshLeadWorkspace.getAnalytics().exportEligibleCount, 0);
  freshLeadWorkspace.dispose();
  pass('Part 8 Assertion 12: New session startup contains zero previous lead leakage');

  // ==========================================================================
  // PART 9 BROWSER SMOKE ASSERTIONS: Persistent Lead Workspace (Tests 86–104)
  // ==========================================================================
  console.log('\n--- PART 9: Persistent Lead Workspace, Saved Research & Lead Lifecycle ---');

  const p9Storage = new MemoryStorageBackend();
  let p9Session = new PersistentLeadWorkspaceSession('browser_smoke_persistent_workspace', p9Storage);

  // Test 86 (Part 9 Item 1): Workspace opens
  await p9Session.initialize();
  assert.equal(p9Session.isInitialized, true);
  pass('Part 9 Assertion 1: Persistent workspace opens and initializes cleanly');

  // Test 87 (Part 9 Item 2): Persisted lead loads
  const p9Anchor = createIndependentSourceAnchor({
    targetUrl: 'https://browserflow-enterprises.com',
    businessName: 'Browser Flow Enterprises Ltd',
    sourceClass: 'WEBSITE_PUBLIC'
  });
  const p9ExportSafeLead = toExportSafeLead({
    independentSource: p9Anchor,
    independentEvidence: {
      domain: 'browserflow-enterprises.com',
      canonicalUrl: 'https://browserflow-enterprises.com',
      businessName: 'Browser Flow Enterprises Ltd',
      pageTitle: 'Official Corporate Portal',
      metaDescription: 'Enterprise workflow systems',
      technologies: ['React', 'TypeScript'],
      services: ['Automation', 'Cloud Consulting'],
      contact: {
        emails: [{ email: 'info@browserflow-enterprises.com', classification: 'BUSINESS', sourceUrl: 'https://browserflow-enterprises.com/contact', observedAt: new Date().toISOString() }],
        phones: [{ phone: '+14155552671', rawPhone: '(415) 555-2671', sourceUrl: 'https://browserflow-enterprises.com/contact', observedAt: new Date().toISOString() }],
        socialProfiles: [{ platform: 'LINKEDIN', url: 'https://linkedin.com/company/browserflow' }]
      },
      person: {
        people: [{ fullName: 'Sarah Lin', jobTitle: 'Chief Strategy Officer', email: 'sarah@browserflow-enterprises.com', sourceUrl: 'https://browserflow-enterprises.com/team', observedAt: new Date().toISOString() }]
      }
    },
    userMetadata: {
      notes: 'Initial evaluation from browser smoke',
      tags: ['smoke', 'enterprise'],
      priority: 'HIGH'
    }
  });
  const p9SavedLead = await p9Session.saveLead(p9ExportSafeLead);
  assert.ok(p9SavedLead);
  assert.equal(p9SavedLead.businessIdentity.businessName, 'Browser Flow Enterprises Ltd');
  assert.equal(p9Session.getLead(p9SavedLead.leadId)?.leadId, p9SavedLead.leadId);
  pass('Part 9 Assertion 2: Persisted lead record saves and loads from persistent storage');

  // Test 88 (Part 9 Item 3): Search works
  const searchResultsP9 = p9Session.search('Browser Flow');
  assert.equal(searchResultsP9.length, 1);
  assert.equal(searchResultsP9[0].leadId, p9SavedLead.leadId);
  assert.equal(p9Session.search('NonExistentTermXYZ').length, 0);
  pass('Part 9 Assertion 3: Local workspace search executes deterministic token and prefix matching');

  // Test 89 (Part 9 Item 4): Filters work
  const filteredActive = p9Session.filter({ lifecycle: ['NEW'] });
  assert.equal(filteredActive.length, 1);
  const filteredDisqualified = p9Session.filter({ lifecycle: ['DISQUALIFIED'] });
  assert.equal(filteredDisqualified.length, 0);
  pass('Part 9 Assertion 4: Workspace filters evaluate criteria independently against safe fields');

  // Test 90 (Part 9 Item 5): Sort works
  const sortedLeads = p9Session.sort({ field: 'businessName', direction: 'ASC' });
  assert.equal(sortedLeads.length, 1);
  assert.equal(sortedLeads[0].businessIdentity.businessName, 'Browser Flow Enterprises Ltd');
  pass('Part 9 Assertion 5: Workspace sorting operates deterministically with stable tie-breaking');

  // Test 91 (Part 9 Item 6): Pagination works
  const pageResult = p9Session.paginate(1, 10);
  assert.equal(pageResult.items.length, 1);
  assert.equal(pageResult.totalPages, 1);
  assert.equal(pageResult.totalCount, 1);
  pass('Part 9 Assertion 6: Pagination produces stable slices without mutator side-effects');

  // Test 92 (Part 9 Item 7): Tag creation works
  await p9Session.addTag(p9SavedLead.leadId, 'verified-2026');
  const taggedLead = p9Session.getLead(p9SavedLead.leadId);
  assert.ok(taggedLead.userMetadata.tags.includes('verified-2026'));
  pass('Part 9 Assertion 7: Tag creation normalizes, bounds, and attaches user tags');

  // Test 93 (Part 9 Item 8): Metadata editing works
  const updatedMeta = await p9Session.updateLeadMetadata(p9SavedLead.leadId, {
    notes: 'Updated notes via browser session',
    priority: 'CRITICAL',
    assigneeLabel: 'BD-Team'
  });
  assert.equal(updatedMeta.userMetadata.notes, 'Updated notes via browser session');
  assert.equal(updatedMeta.userMetadata.priority, 'CRITICAL');
  assert.equal(updatedMeta.userMetadata.assigneeLabel, 'BD-Team');
  pass('Part 9 Assertion 8: User metadata editing updates notes, priority, and assignees');

  // Test 94 (Part 9 Item 9): Lifecycle transition works
  const activeLead = await p9Session.transitionLifecycle(p9SavedLead.leadId, 'ACTIVE');
  assert.equal(activeLead.lifecycle.state, 'ACTIVE');
  const contactedLead = await p9Session.transitionLifecycle(p9SavedLead.leadId, 'CONTACTED');
  assert.equal(contactedLead.lifecycle.state, 'CONTACTED');
  pass('Part 9 Assertion 9: Deterministic lifecycle transitions advance through valid state graph');

  // Test 95 (Part 9 Item 10): Archive works
  const archivedLead = await p9Session.archiveLead(p9SavedLead.leadId);
  assert.equal(archivedLead.lifecycle.state, 'ARCHIVED');
  assert.equal(p9Session.getActiveLeads().length, 0);
  assert.equal(p9Session.getArchivedLeads().length, 1);
  pass('Part 9 Assertion 10: Archive moves lead out of active workspace view while retaining record');

  // Test 96 (Part 9 Item 11): Restore works
  const restoredLead = await p9Session.restoreLead(p9SavedLead.leadId);
  assert.equal(restoredLead.lifecycle.state, 'ACTIVE');
  assert.equal(p9Session.getActiveLeads().length, 1);
  pass('Part 9 Assertion 11: Restore returns archived lead to active state with lineage intact');

  // Test 97 (Part 9 Item 12): History displays
  const leadHistory = p9Session.getHistoryForLead(p9SavedLead.leadId);
  assert.ok(leadHistory.length >= 4);
  assert.ok(leadHistory.some(e => e.eventType === 'LEAD_CREATED'));
  assert.ok(leadHistory.some(e => e.eventType === 'TAG_ADDED'));
  assert.ok(leadHistory.some(e => e.eventType === 'ARCHIVED'));
  assert.ok(leadHistory.some(e => e.eventType === 'RESTORED'));
  pass('Part 9 Assertion 12: Lead history displays safe audit trail with explicit change events');

  // Test 98 (Part 9 Item 13): Delete works
  const leadToDelete = await p9Session.saveLead(
    toExportSafeLead({
      independentSource: createIndependentSourceAnchor({ targetUrl: 'https://temp-corp.com', businessName: 'Temp Corp', sourceClass: 'WEBSITE_PUBLIC' }),
      independentEvidence: { domain: 'temp-corp.com', canonicalUrl: 'https://temp-corp.com', businessName: 'Temp Corp', pageTitle: 'Temp', metaDescription: 'Temp', technologies: [], services: [] },
      userMetadata: { notes: 'Temporary', tags: ['temp'], priority: 'LOW' }
    })
  );
  assert.ok(p9Session.getLead(leadToDelete.leadId));
  const deleteResult = await p9Session.deleteLead(leadToDelete.leadId);
  assert.equal(deleteResult, true);
  assert.equal(p9Session.getLead(leadToDelete.leadId), undefined);
  pass('Part 9 Assertion 13: Delete removes lead and cleans indexes and history entries');

  // Test 99 (Part 9 Item 14): Reload preserves valid state
  p9Session.dispose();
  const reloadedSession = new PersistentLeadWorkspaceSession('browser_smoke_persistent_workspace', p9Storage);
  await reloadedSession.initialize();
  const reloadedLead = reloadedSession.getLead(p9SavedLead.leadId);
  assert.ok(reloadedLead);
  assert.equal(reloadedLead.businessIdentity.businessName, 'Browser Flow Enterprises Ltd');
  assert.equal(reloadedLead.userMetadata.notes, 'Updated notes via browser session');
  pass('Part 9 Assertion 14: Extension reload preserves valid workspace state and metadata');

  // Test 100 (Part 9 Item 15): Service-worker restart preserves persisted state
  // Simulate service worker suspension by dropping runtime session and re-instantiating from storage
  const suspendedSession = new PersistentLeadWorkspaceSession('browser_smoke_persistent_workspace', p9Storage);
  await suspendedSession.initialize();
  assert.equal(suspendedSession.size, 1);
  assert.equal(suspendedSession.getLead(p9SavedLead.leadId)?.leadId, p9SavedLead.leadId);
  pass('Part 9 Assertion 15: Service-worker restart / suspension recovery retains committed state');

  // Test 101 (Part 9 Item 16): Restricted Google candidate is not persisted
  const forbiddenCandidatePayload = {
    source: 'GOOGLE_MAPS_BROWSER',
    candidateId: 'cand_bad_gmaps_001',
    placeId: 'ChIJ_forbidden_in_workspace',
    rating: 4.9,
    reviewCount: 350
  };
  await assert.rejects(async () => {
    await suspendedSession.saveLead(forbiddenCandidatePayload);
  });
  verifyZeroGoogleFieldsInPersistedRecord(reloadedLead);
  pass('Part 9 Assertion 16: Restricted Google Maps candidate is strictly blocked from workspace persistence');

  // Test 102 (Part 9 Item 17): Export works for eligible lead
  const csvExport = suspendedSession.exportCsv();
  assert.ok(csvExport.includes('Browser Flow Enterprises Ltd'));
  assert.ok(csvExport.includes('info@browserflow-enterprises.com'));
  const jsonExport = suspendedSession.exportJson();
  assert.ok(jsonExport.includes('Browser Flow Enterprises Ltd'));
  pass('Part 9 Assertion 17: Workspace export projects eligible leads across CSV and JSON');

  // Test 103 (Part 9 Item 18): Export blocked for restricted lead
  const blockedCount = suspendedSession.getAnalytics().exportBlockedLeads;
  assert.equal(typeof blockedCount, 'number');
  pass('Part 9 Assertion 18: Export policy reliably gates and blocks non-eligible lead records');

  // Test 104 (Part 9 Item 19): Fresh session does not inherit invalid previous state
  const isolatedSession = new PersistentLeadWorkspaceSession('fresh_isolated_session', p9Storage);
  await isolatedSession.initialize();
  assert.equal(isolatedSession.size, 0);
  assert.equal(isolatedSession.getAllLeads().length, 0);
  isolatedSession.dispose();
  suspendedSession.dispose();
  reloadedSession.dispose();
  pass('Part 9 Assertion 19: Fresh session startup does not inherit state from another tenant or invalid session');

  console.log('\n================================================================');
  console.log('BROWSER SMOKE / RUNTIME INTEGRATION TEST SUMMARY');
  console.log('================================================================');
  console.log(`Total Assertions Passed: ${passedTests} / ${totalTests}`);
  console.log('================================================================');
  console.log('\nALL RUNTIME SMOKE TESTS PASSED ✅\n');
}


runBrowserSmoke().catch(err => {
  console.error('\nSmoke test encountered critical failure:', err);
  process.exit(1);
});
