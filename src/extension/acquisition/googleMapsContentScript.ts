/**
 * LeadNoria — Google Maps Content Script (Experimental)
 *
 * Injected into google.com/maps pages by the Chrome extension.
 * Orchestrates the GoogleMapsBrowserAdapter to collect visible listing
 * candidates and returns them to the service worker.
 *
 * INVARIANTS:
 * - This script does NOT use any Google API, Places API, OAuth, or network calls to Google.
 * - It reads ONLY visible rendered DOM text on the page.
 * - All content is treated as untrusted input and sanitized.
 * - Acquisition is bounded (maxCandidates, maxScrolls, renderWaitMs).
 * - Cancellation is supported via message from service worker.
 * - No orphaned MutationObservers, timers, or event listeners on cleanup.
 * - Google Maps capability remains EXPERIMENTAL — not exposed in production UI.
 */

import { GoogleMapsBrowserAdapter } from './googleMapsBrowserAdapter.ts';
import type {
  AcquisitionSessionConfig,
  AcquisitionSessionState,
  AcquisitionCandidate,
  AcquisitionResult,
  AcquisitionStatus,
  AcquisitionError,
  AcquisitionEventType
} from './browserAcquisitionTypes.ts';
import { DEFAULT_ACQUISITION_CONFIG } from './browserAcquisitionTypes.ts';

// ==========================================
// Session State
// ==========================================

let activeAdapter: GoogleMapsBrowserAdapter | null = null;
let activeConfig: AcquisitionSessionConfig | null = null;
let isCancelled = false;
let isRunning = false;

// Policy enforcement — all Maps data in this session carries these invariants.
// These constants are used by downstream normalization and provenance guards.
const SESSION_PERSISTENCE_STATUS = 'NOT_PERSISTABLE' as const;
const SESSION_EXPORT_STATUS = 'NOT_EXPORTABLE' as const;
const SESSION_POLICY_STATUS = 'POLICY_GATED' as const;


// ==========================================
// Logging
// ==========================================

function log(type: AcquisitionEventType | string, msg: string): void {
  console.log(`[GMAPS-CS] [${type}] ${msg}`);
}

function warn(msg: string): void {
  console.warn(`[GMAPS-CS] WARN: ${msg}`);
}

// ==========================================
// Session Runner
// ==========================================

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main acquisition loop.
 * Bounded by maxScrolls and maxCandidates.
 * Cancellable at any scroll boundary.
 * A single card extraction failure is non-fatal.
 */
async function runAcquisitionSession(
  config: AcquisitionSessionConfig
): Promise<AcquisitionResult> {
  const sessionId = config.sessionId;
  const adapter = new GoogleMapsBrowserAdapter(sessionId);
  activeAdapter = adapter;
  activeConfig = config;

  const sessionState: AcquisitionSessionState = {
    sessionId,
    status: 'INITIALIZING',
    candidatesCollected: 0,
    candidatesSkipped: 0,
    scrollCount: 0,
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    errors: [],
    warnings: []
  };

  const allCandidates: AcquisitionCandidate[] = [];
  const seenSignatures = new Set<string>();

  log('SESSION_STARTED', `Session ${sessionId} starting`);

  // 1. Detect page
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const detection = adapter.detectSupportedPage(url);

  if (!detection.isSupported) {
    const error: AcquisitionError = {
      code: 'UNSUPPORTED_PAGE',
      message: detection.reason ?? 'Page not supported',
      recoverable: false,
      timestamp: new Date().toISOString()
    };
    sessionState.status = 'FAILED';
    sessionState.errors.push(error);
    log('PAGE_UNSUPPORTED', detection.reason ?? 'Not supported');
    adapter.dispose();
    activeAdapter = null;
    return { sessionId, status: 'FAILED', candidates: [], sessionState, errors: [error] };
  }

  log('PAGE_DETECTED', `Page type: ${detection.pageType} — ${url}`);
  sessionState.status = 'ACQUIRING';

  // 2. Wait for page to be ready (bounded)
  let readyAttempts = 0;
  while (!adapter.isPageReady() && readyAttempts < config.maxRetries) {
    if (isCancelled) break;
    await sleep(config.renderWaitMs);
    readyAttempts++;
    log('RENDER_WAITED', `Waiting for page ready (attempt ${readyAttempts}/${config.maxRetries})`);
  }

  if (!adapter.isPageReady() && readyAttempts >= config.maxRetries) {
    const error: AcquisitionError = {
      code: 'PAGE_NOT_READY',
      message: 'Page did not become ready within retry limit',
      recoverable: false,
      timestamp: new Date().toISOString()
    };
    sessionState.status = 'FAILED';
    sessionState.errors.push(error);
    adapter.dispose();
    activeAdapter = null;
    return { sessionId, status: 'FAILED', candidates: [], sessionState, errors: [error] };
  }

  // 3. Attach observer
  adapter.attachObservers(config);

  // 4. Main scroll + collect loop
  for (let scroll = 0; scroll <= config.maxScrolls; scroll++) {
    if (isCancelled) {
      sessionState.status = 'CANCELLED';
      log('SESSION_CANCELLED', `Cancelled at scroll ${scroll}`);
      break;
    }

    if (allCandidates.length >= config.maxCandidates) {
      log('SESSION_COMPLETED', `maxCandidates (${config.maxCandidates}) reached`);
      break;
    }

    // Collect visible candidates
    const batch = adapter.collectVisibleCandidates(config, seenSignatures);
    for (const c of batch) {
      allCandidates.push(c);
      sessionState.candidatesCollected++;
    }

    sessionState.lastActivityAt = new Date().toISOString();

    // Check if at bottom
    if (adapter.isAtBottom() && scroll > 0) {
      log('SESSION_COMPLETED', 'Results list exhausted (at bottom)');
      break;
    }

    if (scroll < config.maxScrolls) {
      adapter.triggerScroll();
      sessionState.scrollCount++;
      log('SCROLL_TRIGGERED', `Scroll ${sessionState.scrollCount}/${config.maxScrolls}`);
      // Wait for dynamic content to render
      await sleep(config.renderWaitMs);
    }
  }

  // 5. Optionally collect detail panel
  if (config.collectDetails && !isCancelled) {
    try {
      const detail = adapter.collectDetailPanel(config);
      if (detail) {
        log('CANDIDATE_NORMALIZED', 'Detail panel fields collected');
      }
    } catch {
      warn('Detail panel collection failed — non-fatal');
    }
  }

  // 6. Final status
  const finalStatus: AcquisitionStatus = isCancelled
    ? 'CANCELLED'
    : allCandidates.length === 0
    ? 'FAILED'
    : allCandidates.length < config.maxCandidates
    ? 'COMPLETED'
    : 'PARTIAL';

  if (finalStatus === 'FAILED') {
    const noResultsError: AcquisitionError = {
      code: 'NO_RESULTS',
      message: 'No candidates collected from this page',
      recoverable: true,
      timestamp: new Date().toISOString()
    };
    sessionState.errors.push(noResultsError);
  }

  sessionState.status = finalStatus;
  log(`SESSION_${finalStatus}` as AcquisitionEventType, `${allCandidates.length} candidates collected`);

  // 7. Cleanup
  adapter.dispose();
  activeAdapter = null;
  activeConfig = null;
  isRunning = false;

  return {
    sessionId,
    status: finalStatus,
    candidates: allCandidates,
    sessionState,
    errors: sessionState.errors
  };
}

// ==========================================
// Message Handler
// ==========================================

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    // ── GMAPS_DETECT ─────────────────────────────────────
    if (message.type === 'GMAPS_DETECT') {
      const url = typeof window !== 'undefined' ? window.location.href : '';
      // Probe adapter without constructing full session
      const probe = new GoogleMapsBrowserAdapter('probe');
      const detection = probe.detectSupportedPage(url);
      probe.dispose();
      sendResponse({
        type: 'GMAPS_DETECT_RESULT',
        payload: detection
      });
      return true;
    }

    // ── GMAPS_ACQUIRE ─────────────────────────────────────
    if (message.type === 'GMAPS_ACQUIRE') {
      if (isRunning) {
        sendResponse({
          type: 'GMAPS_ACQUIRE_ERROR',
          payload: { error: 'Acquisition session already running', code: 'ALREADY_RUNNING' }
        });
        return true;
      }

      isRunning = true;
      isCancelled = false;

      const config: AcquisitionSessionConfig = {
        ...DEFAULT_ACQUISITION_CONFIG,
        ...(message.payload?.config ?? {}),
        sessionId: message.payload?.sessionId ?? `gmaps_${Date.now()}`
      };

      runAcquisitionSession(config).then(result => {
        isRunning = false;
        sendResponse({
          type: 'GMAPS_ACQUIRE_RESULT',
          payload: result
        });
      }).catch(err => {
        isRunning = false;
        sendResponse({
          type: 'GMAPS_ACQUIRE_ERROR',
          payload: {
            error: err instanceof Error ? err.message : 'Unknown error',
            code: 'UNKNOWN'
          }
        });
      });

      return true; // Async response
    }

    // ── GMAPS_CANCEL ─────────────────────────────────────
    if (message.type === 'GMAPS_CANCEL') {
      isCancelled = true;
      if (activeAdapter) {
        activeAdapter.dispose();
        activeAdapter = null;
      }
      isRunning = false;
      log('SESSION_CANCELLED', 'Cancelled by service worker message');
      sendResponse({ type: 'GMAPS_CANCEL_ACK' });
      return true;
    }

    return false;
  });
}

// Notify service worker that Maps content script is ready
try {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: 'GMAPS_CONTENT_SCRIPT_READY',
      payload: { url: typeof window !== 'undefined' ? window.location.href : '' }
    }).catch(() => { /* SW may be sleeping — normal in MV3 */ });
  }
} catch {
  // Graceful fallback
}

log('SESSION_STARTED', `Google Maps content script active on: ${typeof window !== 'undefined' ? window.location.href : 'unknown'}`);
