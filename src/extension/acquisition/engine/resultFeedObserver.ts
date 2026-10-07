/**
 * LeadNoria — Google Maps Result Feed Observation Hook
 * Clean Interface & Boundary for Virtualized / Infinite Feed Acquisition
 *
 * Invariants:
 * - Bounded step-wise observation hook; no uncontrolled continuous scrolling.
 * - Detects end-of-list markers ("You've reached the end of the list", etc.).
 * - Separates DOM scrolling primitives from raw candidate extraction.
 * - Future-proofed for virtualized DOM container variations.
 */

import type {
  GoogleMapsAcquisitionDiagnostic
} from './types.ts';

export type ResultSurfaceStatus =
  | 'FEED_ACTIVE'       // Feed container exists with unexhausted results
  | 'FEED_EMPTY'        // Feed container exists but contains zero listing cards
  | 'FEED_EXHAUSTED'    // End-of-results marker reached
  | 'FEED_NOT_FOUND';   // No feed container present in DOM

export interface ResultSurfaceMetrics {
  totalCardsObserved: number;
  scrollStepsCompleted: number;
  isAtBottom: boolean;
  status: ResultSurfaceStatus;
  feedSelectorUsed?: string;
}

export interface ResultFeedSurface {
  /**
   * Probes the current DOM surface to inspect feed container and card presence.
   */
  observeResultSurface(): Promise<{
    status: ResultSurfaceStatus;
    cardCount: number;
    isExhausted: boolean;
    diagnostics: GoogleMapsAcquisitionDiagnostic[];
  }>;

  /**
   * Performs a single bounded scroll increment on the scrollable results container.
   */
  scrollResultSurface(stepDistancePx?: number): Promise<{
    scrolled: boolean;
    newScrollTop: number;
    isAtBottom: boolean;
  }>;

  /**
   * Checks if the results feed has reached end-of-list or exhaustion marker.
   */
  detectResultSurfaceExhaustion(): Promise<boolean>;
}

export class DefaultResultFeedObserver implements ResultFeedSurface {
  private readonly _domProvider: () => {
    querySelector: (sel: string) => { textContent?: string | null; scrollTop?: number; scrollHeight?: number; clientHeight?: number; scrollBy?: (x: number, y: number) => void } | null;
    querySelectorAll: (sel: string) => Array<unknown>;
  } | null;

  private _scrollCount = 0;
  private readonly _maxScrollSteps: number;

  constructor(
    domProvider: () => any,
    maxScrollSteps = 20
  ) {
    this._domProvider = domProvider;
    this._maxScrollSteps = maxScrollSteps;
  }

  public async observeResultSurface(): Promise<{
    status: ResultSurfaceStatus;
    cardCount: number;
    isExhausted: boolean;
    diagnostics: GoogleMapsAcquisitionDiagnostic[];
  }> {
    const dom = this._domProvider();
    const diagnostics: GoogleMapsAcquisitionDiagnostic[] = [];

    if (!dom) {
      return {
        status: 'FEED_NOT_FOUND',
        cardCount: 0,
        isExhausted: false,
        diagnostics: [{
          code: 'RESULT_SURFACE_NOT_FOUND',
          severity: 'P1',
          recoveryClass: 'UNSUPPORTED',
          message: 'DOM context unavailable to observe result surface',
          timestamp: new Date().toISOString()
        }]
      };
    }

    const feedEl = dom.querySelector('div[role="feed"], div[aria-label*="Results"], div[aria-label*="results"]');
    if (!feedEl) {
      return {
        status: 'FEED_NOT_FOUND',
        cardCount: 0,
        isExhausted: false,
        diagnostics: [{
          code: 'RESULT_SURFACE_NOT_FOUND',
          severity: 'P1',
          recoveryClass: 'UNSUPPORTED',
          message: 'Feed container [role="feed"] not found in active DOM',
          timestamp: new Date().toISOString()
        }]
      };
    }

    const cards = dom.querySelectorAll('div[role="feed"] > div[jsaction], div[role="article"]');
    const isExhausted = await this.detectResultSurfaceExhaustion();

    let status: ResultSurfaceStatus = 'FEED_ACTIVE';
    if (cards.length === 0) {
      status = 'FEED_EMPTY';
    } else if (isExhausted) {
      status = 'FEED_EXHAUSTED';
    }

    return {
      status,
      cardCount: cards.length,
      isExhausted,
      diagnostics
    };
  }

  public async scrollResultSurface(stepDistancePx = 800): Promise<{
    scrolled: boolean;
    newScrollTop: number;
    isAtBottom: boolean;
  }> {
    if (this._scrollCount >= this._maxScrollSteps) {
      return { scrolled: false, newScrollTop: 0, isAtBottom: true };
    }

    const dom = this._domProvider();
    if (!dom) return { scrolled: false, newScrollTop: 0, isAtBottom: true };

    const feedEl = dom.querySelector('div[role="feed"]');
    if (!feedEl) return { scrolled: false, newScrollTop: 0, isAtBottom: true };

    const initialTop = feedEl.scrollTop ?? 0;
    if (feedEl.scrollBy) {
      feedEl.scrollBy(0, stepDistancePx);
    } else if (feedEl.scrollTop !== undefined) {
      feedEl.scrollTop += stepDistancePx;
    }

    this._scrollCount++;
    const isAtBottom = await this.detectResultSurfaceExhaustion();

    return {
      scrolled: true,
      newScrollTop: feedEl.scrollTop ?? initialTop + stepDistancePx,
      isAtBottom
    };
  }

  public async detectResultSurfaceExhaustion(): Promise<boolean> {
    const dom = this._domProvider();
    if (!dom) return true;

    // Check DOM exhaustion text markers
    const endMarker = dom.querySelector(
      '.HlvSq, [aria-label*="end of the list"], [aria-label*="End of list"], .m6QErb.tLzqyd'
    );
    if (endMarker) return true;

    // Check scroll geometry if feedEl exists
    const feedEl = dom.querySelector('div[role="feed"]');
    if (feedEl && feedEl.scrollTop !== undefined && feedEl.scrollHeight !== undefined && feedEl.clientHeight !== undefined) {
      const scrollBuffer = 20;
      if (feedEl.scrollTop + feedEl.clientHeight >= feedEl.scrollHeight - scrollBuffer) {
        return true;
      }
    }

    return false;
  }
}
