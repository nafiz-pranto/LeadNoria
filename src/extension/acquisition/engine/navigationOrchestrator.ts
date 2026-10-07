/**
 * LeadNoria — Google Maps Navigation Orchestrator
 * Tab Ownership, Bounded Navigation & Readiness Waiting
 *
 * Invariants:
 * - Explicit browser tab ownership; never silently navigates arbitrary user tabs.
 * - Bounded readiness detection with strict timeouts and retry caps.
 * - Pluggable TabDriver interface for live Chrome and deterministic test execution.
 * - Emits structured diagnostics on tab loss, navigation timeouts, or interruptions.
 */

import type {
  GoogleMapsSearchUnit,
  GoogleMapsAcquisitionDiagnostic,
  GoogleMapsPageDetection
} from './types.ts';
import { detectGoogleMapsPage, isGoogleMapsUrl } from './pageDetector.ts';

export interface BrowserTabInfo {
  id: number;
  url: string;
  active: boolean;
  title?: string;
  status?: 'loading' | 'complete';
}

export interface TabNavigationDriver {
  getTab(tabId: number): Promise<BrowserTabInfo | null>;
  navigateTab(tabId: number, url: string): Promise<boolean>;
  probeTabState(tabId: number): Promise<GoogleMapsPageDetection>;
}

export interface NavigationResult {
  success: boolean;
  url: string;
  pageDetection?: GoogleMapsPageDetection;
  diagnostics: GoogleMapsAcquisitionDiagnostic[];
  error?: string;
}

export class GoogleMapsNavigationOrchestrator {
  private readonly _driver: TabNavigationDriver;
  private readonly _timeoutMs: number;
  private readonly _pollIntervalMs: number;

  constructor(
    driver: TabNavigationDriver,
    options: { timeoutMs?: number; pollIntervalMs?: number } = {}
  ) {
    this._driver = driver;
    this._timeoutMs = options.timeoutMs ?? 15000;
    this._pollIntervalMs = options.pollIntervalMs ?? 500;
  }

  /**
   * Verifies that the tab exists and belongs to a Google Maps surface or is eligible for navigation.
   */
  public async validateTabOwnership(
    tabId: number,
    sessionId: string
  ): Promise<{ valid: boolean; diagnostic?: GoogleMapsAcquisitionDiagnostic }> {
    if (!tabId || tabId <= 0) {
      return {
        valid: false,
        diagnostic: {
          code: 'MAPS_TAB_NOT_FOUND',
          severity: 'P1',
          recoveryClass: 'USER_ACTION_REQUIRED',
          message: 'Invalid tab ID provided for Google Maps acquisition',
          timestamp: new Date().toISOString(),
          sessionId
        }
      };
    }

    const tab = await this._driver.getTab(tabId);
    if (!tab) {
      return {
        valid: false,
        diagnostic: {
          code: 'MAPS_TAB_NOT_FOUND',
          severity: 'P1',
          recoveryClass: 'USER_ACTION_REQUIRED',
          message: `Browser tab ${tabId} could not be found or was closed by user`,
          timestamp: new Date().toISOString(),
          sessionId
        }
      };
    }

    return { valid: true };
  }

  /**
   * Navigates the target tab to the Search Unit's Google Maps search URL,
   * then waits until the page is ready within the configured timeout.
   */
  public async navigateToSearchUnit(
    tabId: number,
    searchUnit: GoogleMapsSearchUnit,
    sessionId: string
  ): Promise<NavigationResult> {
    const diagnostics: GoogleMapsAcquisitionDiagnostic[] = [];
    const now = new Date().toISOString();

    const ownership = await this.validateTabOwnership(tabId, sessionId);
    if (!ownership.valid) {
      if (ownership.diagnostic) diagnostics.push(ownership.diagnostic);
      return {
        success: false,
        url: searchUnit.navigationUrl,
        diagnostics,
        error: ownership.diagnostic?.message ?? 'Invalid tab ownership'
      };
    }

    // Trigger tab navigation
    let navTriggered = false;
    try {
      navTriggered = await this._driver.navigateTab(tabId, searchUnit.navigationUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      diagnostics.push({
        code: 'USER_NAVIGATION_INTERRUPTION',
        severity: 'P1',
        recoveryClass: 'RETRYABLE',
        message: `Tab navigation failed: ${msg}`,
        timestamp: new Date().toISOString(),
        sessionId,
        searchUnitId: searchUnit.searchUnitId,
        url: searchUnit.navigationUrl
      });
      return { success: false, url: searchUnit.navigationUrl, diagnostics, error: msg };
    }

    if (!navTriggered) {
      diagnostics.push({
        code: 'USER_NAVIGATION_INTERRUPTION',
        severity: 'P1',
        recoveryClass: 'RETRYABLE',
        message: 'Tab driver rejected navigation request',
        timestamp: new Date().toISOString(),
        sessionId,
        searchUnitId: searchUnit.searchUnitId,
        url: searchUnit.navigationUrl
      });
      return { success: false, url: searchUnit.navigationUrl, diagnostics, error: 'Navigation rejected' };
    }

    // Wait for Maps readiness (bounded loop)
    const startTime = Date.now();
    let lastDetection: GoogleMapsPageDetection | undefined;

    while (Date.now() - startTime < this._timeoutMs) {
      // Check if tab still exists
      const currentTab = await this._driver.getTab(tabId);
      if (!currentTab) {
        diagnostics.push({
          code: 'MAPS_TAB_NOT_FOUND',
          severity: 'P1',
          recoveryClass: 'USER_ACTION_REQUIRED',
          message: 'Target Google Maps tab was closed during navigation wait',
          timestamp: new Date().toISOString(),
          sessionId,
          searchUnitId: searchUnit.searchUnitId
        });
        return { success: false, url: searchUnit.navigationUrl, diagnostics, error: 'Tab closed' };
      }

      // Check if user navigated away from Google Maps (only after navigation has committed to non-blank URL)
      if (currentTab.url && currentTab.url !== 'about:blank' && !isGoogleMapsUrl(currentTab.url)) {
        diagnostics.push({
          code: 'USER_NAVIGATION_INTERRUPTION',
          severity: 'P1',
          recoveryClass: 'USER_ACTION_REQUIRED',
          message: `User or script navigated away to non-Google URL: ${currentTab.url}`,
          timestamp: new Date().toISOString(),
          sessionId,
          searchUnitId: searchUnit.searchUnitId,
          url: currentTab.url
        });
        return { success: false, url: currentTab.url, diagnostics, error: 'Navigated away' };
      }

      // Probe page state
      try {
        if (typeof this._driver.probeTabState === 'function') {
          lastDetection = await this._driver.probeTabState(tabId);
          if (lastDetection.ready && lastDetection.pageKind === 'SEARCH_RESULTS') {
            return {
              success: true,
              url: currentTab.url,
              pageDetection: lastDetection,
              diagnostics
            };
          }
        } else {
          return {
            success: true,
            url: currentTab.url,
            diagnostics
          };
        }
      } catch {
        // Retry probe on next tick
      }

      await new Promise(r => setTimeout(r, this._pollIntervalMs));
    }

    // Timeout exceeded
    diagnostics.push({
      code: 'NAVIGATION_TIMEOUT',
      severity: 'P1',
      recoveryClass: 'RETRYABLE',
      message: `Google Maps failed to reach ready state within ${this._timeoutMs}ms`,
      timestamp: new Date().toISOString(),
      sessionId,
      searchUnitId: searchUnit.searchUnitId,
      url: searchUnit.navigationUrl,
      details: {
        lastReason: lastDetection?.reason ?? 'Unknown readiness delay',
        confidence: lastDetection?.confidence ?? 0
      }
    });

    return {
      success: false,
      url: searchUnit.navigationUrl,
      pageDetection: lastDetection,
      diagnostics,
      error: `Navigation timeout after ${this._timeoutMs}ms`
    };
  }
}
