/**
 * LeadNoria — Google Maps Live Capability Probe (Optional / Manual Diagnostic)
 *
 * Invariants:
 * - Read-only DOM observation against active browser tab.
 * - ZERO private endpoints, API keys, CAPTCHA bypass, stealth, or proxy manipulation.
 * - Diagnostic only; does not claim live extraction occurred unless observed.
 * - Reports exact signal capabilities:
 *   MAPS_PAGE_DETECTED, RESULT_SURFACE_DETECTED, VISIBLE_CANDIDATES_FOUND,
 *   FIELDS_OBSERVED, SCROLL_PROGRESS_DETECTED, NEW_CANDIDATES_AFTER_SCROLL, EXHAUSTION_SIGNAL_DETECTED.
 */

import { detectGoogleMapsPage } from './pageDetector.ts';
import { detectResultSurface } from './resultSurfaceDetector.ts';
import { classifyCandidateCard, extractRawCardNodeData, CARD_SELECTORS } from './cardDetector.ts';
import { createCandidateObservation } from './observationBoundary.ts';
import { deriveCandidateIdentity } from './candidateIdentity.ts';

export interface LiveCapabilityProbeResult {
  url: string;
  timestamp: string;
  capabilities: {
    mapsPageDetected: boolean;
    resultSurfaceDetected: boolean;
    visibleCandidatesFound: boolean;
    fieldsObserved: boolean;
    scrollProgressDetected: boolean;
    newCandidatesAfterScroll: boolean;
    exhaustionSignalDetected: boolean;
  };
  metrics: {
    visibleCandidateCount: number;
    validCandidateCount: number;
    surfaceConfidence: number;
    surfaceSelector?: string;
    sampleCandidate?: {
      businessName?: string;
      rating?: number;
      reviewCount?: number;
      address?: string;
      websiteAvailability?: string;
      identityMethod?: string;
    };
  };
  diagnostics: string[];
}

/**
 * Executes a non-destructive, read-only capability inspection on a DOM context.
 */
export function probeGoogleMapsCapability(
  domRoot: any,
  currentUrl = ''
): LiveCapabilityProbeResult {
  const diagnostics: string[] = [];
  const now = new Date().toISOString();

  // 1. Detect page state
  const pageDetect = detectGoogleMapsPage(currentUrl, domRoot);
  const mapsPageDetected = pageDetect.isGoogleMaps;
  if (!mapsPageDetected) {
    diagnostics.push(`Page URL does not match supported Google Maps pattern: ${currentUrl}`);
  }

  // 2. Detect result surface
  const { surfaceElement, candidate: surfaceCandidate } = detectResultSurface(domRoot);
  const resultSurfaceDetected = surfaceCandidate.validated;
  if (!resultSurfaceDetected) {
    diagnostics.push(`Result surface not validated: ${surfaceCandidate.reason}`);
  }

  // 3. Detect candidate cards
  let visibleCandidateCount = 0;
  let validCandidateCount = 0;
  let sampleCandidate: LiveCapabilityProbeResult['metrics']['sampleCandidate'];

  if (surfaceElement && surfaceElement.querySelectorAll) {
    const cards = Array.from(surfaceElement.querySelectorAll(CARD_SELECTORS.cardContainers.join(', ')));
    visibleCandidateCount = cards.length;

    for (const c of cards) {
      const cls = classifyCandidateCard(c as any);
      if (cls.isBusinessCard) {
        validCandidateCount++;
        if (!sampleCandidate) {
          const raw = extractRawCardNodeData(c as any, currentUrl);
          const obs = createCandidateObservation(raw, {
            sessionId: 'probe-session',
            searchUnitId: 'probe-unit',
            searchKeyword: 'probe',
            pageUrl: currentUrl,
            pageKind: pageDetect.pageKind
          });
          const id = deriveCandidateIdentity({
            businessName: obs.businessName.parsedValue,
            placeId: obs.placeId.parsedValue,
            mapsUrl: obs.mapsUrl.parsedValue,
            address: obs.address.parsedValue
          });

          sampleCandidate = {
            businessName: obs.businessName.parsedValue,
            rating: obs.rating.parsedValue,
            reviewCount: obs.reviewCount.parsedValue,
            address: obs.address.parsedValue,
            websiteAvailability: obs.websiteUrl.availability,
            identityMethod: id.identityMethod
          };
        }
      }
    }
  }

  const visibleCandidatesFound = validCandidateCount > 0;
  const fieldsObserved = Boolean(sampleCandidate?.businessName);

  // 4. Scroll capability check (geometry inspection)
  const isScrollable = surfaceCandidate.isScrollable;
  const scrollProgressDetected = isScrollable;

  // 5. Exhaustion signal inspection
  let exhaustionSignalDetected = false;
  if (domRoot && domRoot.querySelector) {
    const endMarker = domRoot.querySelector('.HlvSq, [aria-label*="end of the list"], [aria-label*="End of list"]');
    if (endMarker) exhaustionSignalDetected = true;
  }

  return {
    url: currentUrl,
    timestamp: now,
    capabilities: {
      mapsPageDetected,
      resultSurfaceDetected,
      visibleCandidatesFound,
      fieldsObserved,
      scrollProgressDetected,
      newCandidatesAfterScroll: false, // Non-destructive read probe does not alter scroll
      exhaustionSignalDetected
    },
    metrics: {
      visibleCandidateCount,
      validCandidateCount,
      surfaceConfidence: surfaceCandidate.confidence,
      surfaceSelector: surfaceCandidate.elementPath,
      sampleCandidate
    },
    diagnostics
  };
}

/**
 * Diagnostic helper that accepts URL first and returns convenience flags.
 */
export function probeGoogleMapsLiveCapability(
  currentUrl = '',
  domRoot?: any
) {
  const dom = domRoot || (typeof document !== 'undefined' ? document : null);
  const result = probeGoogleMapsCapability(dom, currentUrl);
  return {
    ...result,
    isGoogleMapsUrl: result.capabilities.mapsPageDetected,
    resultSurfaceDetected: result.capabilities.resultSurfaceDetected,
    visibleCardsCount: result.metrics.visibleCandidateCount,
    capabilities: {
      ...result.capabilities,
      canExtractName: result.capabilities.fieldsObserved,
      canDetectFeed: result.capabilities.resultSurfaceDetected
    }
  };
}

