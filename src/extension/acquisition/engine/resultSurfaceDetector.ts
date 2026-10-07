/**
 * LeadNoria — Google Maps Result Surface Detector
 * Layered Feed Identification, Confidence Scoring & Scroll Target Validation
 *
 * Invariants:
 * - Does NOT hard-code a single brittle CSS class.
 * - Multi-layered detection strategy:
 *   1. Semantic & accessibility signals (role="feed", aria-label)
 *   2. Stable structural containers (.m6QErb, pane parents)
 *   3. Scrollability characteristics (scrollHeight > clientHeight, overflow)
 *   4. Validated result card descendants
 *   5. Fallback selectors
 * - Fails closed: returns validated: false and FEED_NOT_FOUND if confidence < threshold.
 * - Verifies scroll target responses before initiating scroll loop.
 */

import type { ResultSurfaceCandidate } from './types.ts';
import { CARD_SELECTORS, classifyCandidateCard, type DOMElementLike } from './cardDetector.ts';

export const SURFACE_SELECTORS = {
  semanticFeed: [
    'div[role="feed"]',
    'div[aria-label*="Results"]',
    'div[aria-label*="results"]',
    'div[aria-label*="Result list"]'
  ],
  structuralContainer: [
    'div.m6QErb.DxyBCb.kA9KIf.dS8AEf',
    'div.m6QErb[aria-label]',
    'div.m6QErb:has(div[jsaction*="mouseover"])',
    'div[jsaction*="pane.wfvdle"]',
    'div.m6QErb'
  ],
  fallbackSelectors: [
    'div#QA0Szd div[tabindex="-1"]',
    'div[style*="overflow-y: scroll"]',
    'div[style*="overflow-y: auto"]'
  ]
};

export interface ResultSurfaceMetrics {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
  isScrollable: boolean;
}

/**
 * Extracts scroll metrics from a candidate container element.
 */
export function getElementScrollMetrics(el: any): ResultSurfaceMetrics {
  const scrollTop = el?.scrollTop ?? 0;
  const clientHeight = el?.clientHeight ?? 0;
  const scrollHeight = el?.scrollHeight ?? 0;
  const isScrollable = scrollHeight > clientHeight && clientHeight > 0;

  return {
    scrollTop,
    clientHeight,
    scrollHeight,
    isScrollable
  };
}

/**
 * Evaluates and scores a single container element as a potential result surface.
 */
export function scoreContainerCandidate(
  container: DOMElementLike,
  selectorTier: 'SEMANTIC' | 'STRUCTURAL' | 'FALLBACK',
  elementPath = ''
): ResultSurfaceCandidate {
  let score = 0;
  const reasons: string[] = [];

  const metrics = getElementScrollMetrics(container);

  // 1. Selector tier & role score
  const hasRoleFeed = Boolean(container.getAttribute && container.getAttribute('role') === 'feed');
  const hasAriaResults = Boolean(container.getAttribute && /result/i.test(container.getAttribute('aria-label') || ''));

  if (hasRoleFeed) {
    score += 0.40;
    reasons.push('Explicit role="feed" attribute');
    if (hasAriaResults) {
      score += 0.05;
      reasons.push('Matched aria-label for results');
    }
  } else if (selectorTier === 'SEMANTIC') {
    score += 0.35;
    reasons.push('Matched semantic feed role/aria-label');
  } else if (selectorTier === 'STRUCTURAL') {
    score += 0.25;
    reasons.push('Matched structural Maps panel container');
  } else {
    score += 0.15;
    reasons.push('Matched fallback scrollable container');
  }

  // 2. Count candidate card descendants
  let cardCount = 0;
  let validCardCount = 0;
  if (container.querySelectorAll) {
    try {
      const cardNodes = container.querySelectorAll(CARD_SELECTORS.cardContainers.join(', '));
      cardCount = cardNodes.length;

      // Classify up to first 5 cards to verify they are real business candidates
      for (let i = 0; i < Math.min(cardNodes.length, 5); i++) {
        const cls = classifyCandidateCard(cardNodes[i]);
        if (cls.isBusinessCard) {
          validCardCount++;
        }
      }
    } catch {}
  }

  if (cardCount > 0) {
    score += 0.30;
    reasons.push(`Contains ${cardCount} candidate cards (${validCardCount} validated)`);
  }

  // 3. Scrollability check
  if (metrics.isScrollable) {
    score += 0.25;
    reasons.push(`Vertically scrollable (scrollHeight=${metrics.scrollHeight} > clientHeight=${metrics.clientHeight})`);
  } else if (metrics.clientHeight > 0 && cardCount > 2) {
    // Virtualized feed might initially match clientHeight if not yet overflowed
    score += 0.10;
    reasons.push('Container has positive clientHeight with multiple cards');
  } else {
    reasons.push('Container not currently scrollable');
  }

  // 4. Reject map canvas or body elements
  const tagName = (container.tagName || '').toLowerCase();
  if (tagName === 'canvas' || tagName === 'body' || tagName === 'html') {
    score = 0;
    reasons.push('Rejected document/canvas container');
  }

  const confidence = Math.min(1.0, Math.round(score * 100) / 100);
  const validated = confidence >= 0.55 && (cardCount > 0 || (hasRoleFeed && metrics.isScrollable));

  return {
    elementPath,
    confidence,
    reason: reasons.join('; '),
    scrollTop: metrics.scrollTop,
    clientHeight: metrics.clientHeight,
    scrollHeight: metrics.scrollHeight,
    candidateCardCount: cardCount,
    isScrollable: metrics.isScrollable,
    validated
  };
}

/**
 * Searches the DOM root using layered strategies to identify and validate the best result surface.
 */
export function detectResultSurface(domRoot: any): {
  surfaceElement: any | null;
  candidate: ResultSurfaceCandidate;
  found: boolean;
  status: string;
  container: (ResultSurfaceCandidate & { element?: any }) | null;
} {
  const failCandidate: ResultSurfaceCandidate = {
    confidence: 0,
    reason: 'DOM context unavailable',
    scrollTop: 0,
    clientHeight: 0,
    scrollHeight: 0,
    candidateCardCount: 0,
    isScrollable: false,
    validated: false
  };

  if (!domRoot || !domRoot.querySelector) {
    return {
      surfaceElement: null,
      candidate: failCandidate,
      found: false,
      status: 'RESULT_SURFACE_NOT_FOUND',
      container: null
    };
  }

  // Strategy 1: Semantic Feed
  for (const sel of SURFACE_SELECTORS.semanticFeed) {
    try {
      const el = domRoot.querySelector(sel);
      if (el) {
        const candidate = scoreContainerCandidate(el, 'SEMANTIC', sel);
        if (candidate.validated) {
          return {
            surfaceElement: el,
            candidate,
            found: true,
            status: 'SURFACE_DETECTED',
            container: { ...candidate, element: el }
          };
        }
      }
    } catch {}
  }

  // Strategy 2: Structural Container
  for (const sel of SURFACE_SELECTORS.structuralContainer) {
    try {
      const el = domRoot.querySelector(sel);
      if (el) {
        const candidate = scoreContainerCandidate(el, 'STRUCTURAL', sel);
        if (candidate.validated) {
          return {
            surfaceElement: el,
            candidate,
            found: true,
            status: 'SURFACE_DETECTED',
            container: { ...candidate, element: el }
          };
        }
      }
    } catch {}
  }

  // Strategy 3: Fallback Selectors
  for (const sel of SURFACE_SELECTORS.fallbackSelectors) {
    try {
      const el = domRoot.querySelector(sel);
      if (el) {
        const candidate = scoreContainerCandidate(el, 'FALLBACK', sel);
        if (candidate.validated) {
          return {
            surfaceElement: el,
            candidate,
            found: true,
            status: 'SURFACE_DETECTED',
            container: { ...candidate, element: el }
          };
        }
      }
    } catch {}
  }

  // Fail closed
  const failClosedCandidate: ResultSurfaceCandidate = {
    confidence: 0,
    reason: 'No candidate container satisfied result-surface validation thresholds',
    scrollTop: 0,
    clientHeight: 0,
    scrollHeight: 0,
    candidateCardCount: 0,
    isScrollable: false,
    validated: false
  };

  return {
    surfaceElement: null,
    candidate: failClosedCandidate,
    found: false,
    status: 'RESULT_SURFACE_NOT_FOUND',
    container: null
  };
}

export const scoreCandidateContainer = (container: DOMElementLike, elementPath = '') => {
  const isSemantic = Boolean(container?.getAttribute && (container.getAttribute('role') === 'feed' || /result/i.test(container.getAttribute('aria-label') || '')));
  return scoreContainerCandidate(container, isSemantic ? 'SEMANTIC' : 'FALLBACK', elementPath);
};

