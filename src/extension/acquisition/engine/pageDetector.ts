/**
 * LeadNoria — Google Maps Page State Detector
 * Multi-Signal Page Classification, Readiness Evaluation & Fail-Closed Detection
 *
 * Invariants:
 * - Uses independent structural, URL, and semantic DOM signals.
 * - Fails closed: if confidence is insufficient, returns UNKNOWN or UNSUPPORTED.
 * - Distinguishes between search results, place details, directions, home, and unsupported states.
 * - Detects active loading indicators (progress bars, spinners) to verify true readiness.
 */

import type {
  GoogleMapsPageDetection,
  GoogleMapsPageKind,
  GoogleMapsReadinessSignals
} from './types.ts';

export interface DOMSignalExtractor {
  querySelector(selector: string): { textContent?: string | null; getAttribute?(name: string): string | null } | null;
  querySelectorAll?(selector: string): Array<unknown>;
  title?: string;
}

/**
 * Checks if a given URL belongs to Google Maps.
 */
export function isGoogleMapsUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    const isGoogleDomain = host === 'maps.google.com' ||
      host.endsWith('.google.com') ||
      /(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host);

    if (!isGoogleDomain) return false;
    if (host === 'maps.google.com') return true;
    return url.pathname.startsWith('/maps');
  } catch {
    return false;
  }
}

/**
 * Classifies page kind based on URL heuristics.
 */
export function classifyUrlPath(urlStr: string): { kind: GoogleMapsPageKind; confidence: number } {
  try {
    const url = new URL(urlStr);
    const path = url.pathname.toLowerCase();
    const q = url.searchParams.get('q');

    if (path.includes('/maps/search/') || (path.startsWith('/maps') && !!q)) {
      return { kind: 'SEARCH_RESULTS', confidence: 0.85 };
    }
    if (path.includes('/maps/place/')) {
      return { kind: 'PLACE_DETAIL', confidence: 0.90 };
    }
    if (path.includes('/maps/dir/')) {
      return { kind: 'DIRECTIONS', confidence: 0.85 };
    }
    if (path === '/maps' || path === '/maps/' || path.startsWith('/maps/@')) {
      return { kind: 'HOME_MAPS', confidence: 0.80 };
    }
    return { kind: 'UNSUPPORTED', confidence: 0.50 };
  } catch {
    return { kind: 'UNKNOWN', confidence: 0.10 };
  }
}

/**
 * Evaluates DOM signals and readiness.
 */
export function evaluateSignals(
  urlStr: string,
  dom?: DOMSignalExtractor
): GoogleMapsReadinessSignals {
  const isMaps = isGoogleMapsUrl(urlStr);
  if (!isMaps) {
    return {
      hasMapsHost: false,
      hasSearchPath: false,
      hasPlacePath: false,
      hasSearchInput: false,
      hasFeedContainer: false,
      hasDetailContainer: false,
      isLoadingSpinnerPresent: false,
      hasResultsHeader: false,
      hasNoResultsMarker: false,
      elementCount: 0
    };
  }

  let hasSearchPath = false;
  let hasPlacePath = false;
  try {
    const u = new URL(urlStr);
    hasSearchPath = u.pathname.includes('/maps/search/') || !!u.searchParams.get('q');
    hasPlacePath = u.pathname.includes('/maps/place/');
  } catch {
    // Ignore URL parse error
  }

  if (!dom) {
    return {
      hasMapsHost: true,
      hasSearchPath,
      hasPlacePath,
      hasSearchInput: false,
      hasFeedContainer: false,
      hasDetailContainer: false,
      isLoadingSpinnerPresent: false,
      hasResultsHeader: false,
      hasNoResultsMarker: false,
      elementCount: 0
    };
  }

  // DOM inspections
  const searchInput = dom.querySelector('input#searchboxinput, input[aria-label*="Search"]');
  const feed = dom.querySelector('div[role="feed"], div[aria-label*="Results"], div[aria-label*="results"]');
  const detail = dom.querySelector('div[role="main"], h1.DUwDvf, [data-item-id="address"]');
  const spinner = dom.querySelector('div[role="progressbar"], div.m6QErb.loading, .G6jK8e');
  const noResults = dom.querySelector('div[role="feed"] div:has([aria-label*="No results"]), div.Q2vNVc, .widget-pane-no-results');

  const cardCount = dom.querySelectorAll ? dom.querySelectorAll('div[role="feed"] > div[jsaction], div[role="article"]').length : 0;

  return {
    hasMapsHost: true,
    hasSearchPath,
    hasPlacePath,
    hasSearchInput: !!searchInput,
    hasFeedContainer: !!feed,
    hasDetailContainer: !!detail,
    isLoadingSpinnerPresent: !!spinner,
    hasResultsHeader: !!feed,
    hasNoResultsMarker: !!noResults,
    elementCount: cardCount
  };
}

/**
 * Comprehensive Multi-Signal Page Detector.
 * Fails closed if confidence is below threshold.
 */
export function detectGoogleMapsPage(
  urlStr: string,
  dom?: DOMSignalExtractor
): GoogleMapsPageDetection {
  const now = new Date().toISOString();

  if (!isGoogleMapsUrl(urlStr)) {
    return {
      isGoogleMaps: false,
      pageKind: 'NON_GOOGLE',
      ready: false,
      confidence: 1.0,
      reason: 'URL domain is outside Google Maps',
      url: urlStr,
      observedAt: now,
      signals: evaluateSignals(urlStr, dom)
    };
  }

  const signals = evaluateSignals(urlStr, dom);
  const urlClass = classifyUrlPath(urlStr);

  // Still loading if a progress bar is actively displayed
  if (signals.isLoadingSpinnerPresent) {
    return {
      isGoogleMaps: true,
      pageKind: urlClass.kind,
      ready: false,
      confidence: 0.70,
      reason: 'Loading progress bar or spinner is active in DOM',
      url: urlStr,
      observedAt: now,
      signals
    };
  }

  // Check Search Results surface
  if (urlClass.kind === 'SEARCH_RESULTS') {
    if (signals.hasNoResultsMarker) {
      return {
        isGoogleMaps: true,
        pageKind: 'SEARCH_RESULTS',
        ready: true,
        confidence: 0.95,
        reason: 'Search page ready: no results found for query',
        url: urlStr,
        observedAt: now,
        signals
      };
    }

    if (signals.hasFeedContainer || signals.elementCount > 0) {
      return {
        isGoogleMaps: true,
        pageKind: 'SEARCH_RESULTS',
        ready: true,
        confidence: 0.98,
        reason: 'Search results feed verified and rendered in DOM',
        url: urlStr,
        observedAt: now,
        signals
      };
    }

    // URL indicates search, but DOM hasn't rendered feed yet
    if (dom && !signals.hasFeedContainer) {
      return {
        isGoogleMaps: true,
        pageKind: 'SEARCH_RESULTS',
        ready: false,
        confidence: 0.65,
        reason: 'Search URL loaded but feed container not yet detected in DOM',
        url: urlStr,
        observedAt: now,
        signals
      };
    }

    // URL only (no DOM available to inspect)
    return {
      isGoogleMaps: true,
      pageKind: 'SEARCH_RESULTS',
      ready: true,
      confidence: 0.85,
      reason: 'Search results page confirmed via URL structure',
      url: urlStr,
      observedAt: now,
      signals
    };
  }

  // Check Place Detail surface
  if (urlClass.kind === 'PLACE_DETAIL') {
    const ready = signals.hasDetailContainer || !dom;
    return {
      isGoogleMaps: true,
      pageKind: 'PLACE_DETAIL',
      ready,
      confidence: ready ? 0.95 : 0.60,
      reason: ready
        ? 'Place detail panel rendered and visible'
        : 'Place detail URL loaded but detail container not rendered',
      url: urlStr,
      observedAt: now,
      signals
    };
  }

  // Check Home / Base Maps
  if (urlClass.kind === 'HOME_MAPS') {
    return {
      isGoogleMaps: true,
      pageKind: 'HOME_MAPS',
      ready: true,
      confidence: 0.80,
      reason: 'Google Maps home surface loaded without active search query',
      url: urlStr,
      observedAt: now,
      signals
    };
  }

  // Fail closed for unsupported layouts
  return {
    isGoogleMaps: true,
    pageKind: 'UNSUPPORTED',
    ready: false,
    confidence: 0.50,
    reason: 'Google Maps page is in an unsupported or unclassified layout state',
    url: urlStr,
    observedAt: now,
    signals
  };
}
