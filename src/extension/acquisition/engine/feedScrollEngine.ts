/**
 * LeadNoria — Google Maps Feed Scroll Engine
 * Bounded Stepwise Scrolling, Virtualized Load Waiting, Multi-Signal Exhaustion & Delta Emission
 *
 * Invariants:
 * - Controlled stepwise cycles: NO uncontrolled while(true) scrollToBottom().
 * - Disconnects all observers and clears all timers on termination/pause/cancel.
 * - Distinguishes TEMPORARY_STALL from TRUE_EXHAUSTION via bounded retry thresholds.
 * - Enforces hard time budgets (maxDurationMs), step budgets (maxScrollSteps), and candidate budgets (maxCandidates).
 * - Cooperates with GoogleMapsStateMachine pause/cancel boundaries.
 * - Zero retained DOM nodes or HTML strings across cycles.
 */

import type {
  GoogleMapsAcquisitionPolicy,
  GoogleMapsAcquisitionMetrics,
  GoogleMapsObservationBatch,
  GoogleMapsCandidateObservation,
  ScrollTerminationReason,
  GoogleMapsAcquisitionDiagnostic
} from './types.ts';
import { DEFAULT_ACQUISITION_POLICY } from './types.ts';
import { detectResultSurface } from './resultSurfaceDetector.ts';
import { CARD_SELECTORS, classifyCandidateCard, extractRawCardNodeData } from './cardDetector.ts';
import { createCandidateObservation } from './observationBoundary.ts';
import { deriveCandidateIdentity, SessionCandidateDeduplicator } from './candidateIdentity.ts';

export { DEFAULT_ACQUISITION_POLICY };

/**
 * Validates and sanitizes acquisition policy with safe bounded fallback defaults.
 */
export function validateAcquisitionPolicy(
  policy?: Partial<GoogleMapsAcquisitionPolicy>
): GoogleMapsAcquisitionPolicy {
  if (!policy) return { ...DEFAULT_ACQUISITION_POLICY };

  const sanitizeNumber = (val: any, fallback: number, min: number, max: number): number => {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val) || val < min || val > max) {
      return fallback;
    }
    return val;
  };

  return {
    maxScrollSteps: sanitizeNumber(policy.maxScrollSteps, DEFAULT_ACQUISITION_POLICY.maxScrollSteps, 1, 200),
    maxCandidates: sanitizeNumber(policy.maxCandidates, DEFAULT_ACQUISITION_POLICY.maxCandidates, 1, 1000),
    maxDurationMs: sanitizeNumber(policy.maxDurationMs, DEFAULT_ACQUISITION_POLICY.maxDurationMs, 1000, 600000),
    scrollFractionOfViewport: sanitizeNumber(policy.scrollFractionOfViewport, DEFAULT_ACQUISITION_POLICY.scrollFractionOfViewport, 0.1, 1.0),
    loadWaitTimeoutMs: sanitizeNumber(policy.loadWaitTimeoutMs, DEFAULT_ACQUISITION_POLICY.loadWaitTimeoutMs, 10, 30000),
    quietPeriodMs: sanitizeNumber(policy.quietPeriodMs, DEFAULT_ACQUISITION_POLICY.quietPeriodMs, 10, 5000),
    maxNoNewCandidateCycles: sanitizeNumber(policy.maxNoNewCandidateCycles, DEFAULT_ACQUISITION_POLICY.maxNoNewCandidateCycles, 1, 10),
    retryLimit: sanitizeNumber(policy.retryLimit, DEFAULT_ACQUISITION_POLICY.retryLimit, 1, 10),
    exhaustionTolerancePx: sanitizeNumber(policy.exhaustionTolerancePx, DEFAULT_ACQUISITION_POLICY.exhaustionTolerancePx, 0, 500)
  };
}

export interface FeedScrollEngineContext {
  sessionId: string;
  searchUnitId: string;
  searchKeyword: string;
  searchLocation?: string;
  pageUrl: string;
}

export interface FeedScrollEngineHooks {
  onNewCandidates?: (newCandidates: GoogleMapsCandidateObservation[]) => void;
  onBatchCompleted?: (batch: GoogleMapsObservationBatch) => void;
  isPaused?: () => boolean;
  isCancelled?: () => boolean;
  onDiagnostic?: (diagnostic: GoogleMapsAcquisitionDiagnostic) => void;
}

export class GoogleMapsFeedScrollEngine {
  private _domProvider: () => any;
  private _context: FeedScrollEngineContext;
  private readonly _policy: GoogleMapsAcquisitionPolicy;
  private readonly _deduplicator: SessionCandidateDeduplicator;
  private readonly _hooks: FeedScrollEngineHooks;

  private _activeObserver: any = null;
  private _activeTimers: Set<any> = new Set();
  private _observationSequence = 0;
  private _startTime = 0;

  private _userPaused = false;
  private _userCancelled = false;
  private _running = false;
  private _listeners: Map<string, Set<Function>> = new Map();

  constructor(
    domProviderOrPolicy?: (() => any) | Partial<GoogleMapsAcquisitionPolicy>,
    context?: FeedScrollEngineContext,
    policy: Partial<GoogleMapsAcquisitionPolicy> = {},
    hooks: FeedScrollEngineHooks = {},
    deduplicator: SessionCandidateDeduplicator = new SessionCandidateDeduplicator()
  ) {
    if (typeof domProviderOrPolicy === 'function') {
      this._domProvider = domProviderOrPolicy;
      this._context = context || { sessionId: '', searchUnitId: '', searchKeyword: '', pageUrl: '' };
      this._policy = validateAcquisitionPolicy(policy);
      this._hooks = hooks;
      this._deduplicator = deduplicator;
    } else {
      const pol = domProviderOrPolicy as Partial<GoogleMapsAcquisitionPolicy> | undefined;
      this._domProvider = () => null;
      this._context = context || { sessionId: '', searchUnitId: '', searchKeyword: '', pageUrl: '' };
      this._policy = validateAcquisitionPolicy(pol);
      this._hooks = hooks;
      this._deduplicator = deduplicator;
    }
  }

  public get deduplicator(): SessionCandidateDeduplicator {
    return this._deduplicator;
  }

  public get observationSequence(): number {
    return this._observationSequence;
  }

  public isRunning(): boolean {
    return this._running;
  }

  public isPaused(): boolean {
    return this._userPaused;
  }

  public requestPause(): void {
    this._userPaused = true;
  }

  public requestCancel(): void {
    this._userCancelled = true;
  }

  public on(event: string, fn: Function): this {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(fn);
    return this;
  }

  private emit(event: string, ...args: any[]): void {
    const set = this._listeners.get(event);
    if (set) {
      for (const fn of set) {
        try {
          fn(...args);
        } catch {}
      }
    }
  }

  /**
   * Central timer helper to guarantee all timeouts are tracked and cancellable.
   */
  private _setTimeout(fn: () => void, ms: number): any {
    const timer = setTimeout(() => {
      this._activeTimers.delete(timer);
      fn();
    }, ms);
    this._activeTimers.add(timer);
    return timer;
  }

  /**
   * Cleans up all active timers and mutation observers cleanly.
   */
  public cleanup(): void {
    for (const timer of this._activeTimers) {
      clearTimeout(timer);
    }
    this._activeTimers.clear();

    if (this._activeObserver && typeof this._activeObserver.disconnect === 'function') {
      try {
        this._activeObserver.disconnect();
      } catch {}
      this._activeObserver = null;
    }
  }

  /**
   * Bounded wait for feed DOM changes after a scroll action.
   */
  private async _waitForFeedUpdate(surfaceElement: any): Promise<boolean> {
    if (!surfaceElement) return false;

    return new Promise<boolean>((resolve) => {
      let resolved = false;
      let quietTimer: any = null;

      const finish = (hadMutations: boolean) => {
        if (resolved) return;
        resolved = true;
        if (quietTimer) clearTimeout(quietTimer);
        this.cleanup();
        resolve(hadMutations);
      };

      // Hard timeout fallback
      this._setTimeout(() => {
        finish(false);
      }, this._policy.loadWaitTimeoutMs);

      // Setup MutationObserver if supported in environment
      if (typeof MutationObserver !== 'undefined' && surfaceElement.nodeType) {
        try {
          this._activeObserver = new MutationObserver(() => {
            if (quietTimer) clearTimeout(quietTimer);
            quietTimer = setTimeout(() => {
              finish(true);
            }, this._policy.quietPeriodMs);
          });

          this._activeObserver.observe(surfaceElement, {
            childList: true,
            subtree: true,
            attributes: false
          });
          return;
        } catch {}
      }

      // In non-DOM/mock environments, wait for quietPeriod
      this._setTimeout(() => {
        finish(true);
      }, Math.min(this._policy.quietPeriodMs, 100));
    });
  }

  /**
   * Multi-signal exhaustion detector.
   */
  public isFeedExhausted(surfaceElement: any, noProgressCycles: number): {
    exhausted: boolean;
    reason?: string;
  } {
    if (!surfaceElement) {
      return { exhausted: true, reason: 'Surface container missing' };
    }

    const dom = this._domProvider();

    // Signal 1: Explicit end-of-list DOM text marker
    if (dom && dom.querySelector) {
      const endMarker = dom.querySelector(
        '.HlvSq, [aria-label*="end of the list"], [aria-label*="End of list"], .m6QErb.tLzqyd:contains("end")'
      );
      if (endMarker) {
        return { exhausted: true, reason: 'End-of-results DOM marker observed' };
      }
    }
    if (surfaceElement.querySelector) {
      const innerMarker = surfaceElement.querySelector(
        '.HlvSq, [aria-label*="end of the list"], [aria-label*="End of list"]'
      );
      if (innerMarker) {
        return { exhausted: true, reason: 'End-of-results marker observed in surface' };
      }
    }

    // Signal 2: Geometric bottom check
    const scrollTop = surfaceElement.scrollTop ?? 0;
    const clientHeight = surfaceElement.clientHeight ?? 0;
    const scrollHeight = surfaceElement.scrollHeight ?? 0;

    if (scrollHeight > 0 && clientHeight > 0) {
      const remainingDistance = scrollHeight - (scrollTop + clientHeight);
      if (remainingDistance <= this._policy.exhaustionTolerancePx && noProgressCycles >= 1) {
        return {
          exhausted: true,
          reason: `Geometric scroll bottom reached (remaining=${remainingDistance}px, noProgress=${noProgressCycles})`
        };
      }
    }

    // Signal 3: Consecutively stalled with zero new candidates
    if (noProgressCycles >= this._policy.maxNoNewCandidateCycles) {
      return {
        exhausted: true,
        reason: `Exhausted after ${noProgressCycles} consecutive cycles with zero new candidates`
      };
    }

    return { exhausted: false };
  }

  /**
   * Executes a single scroll observation cycle against a surface element.
   */
  public async executeScrollCycle(
    surfaceElement: any,
    context: FeedScrollEngineContext,
    location?: string,
    sequence: number = 1
  ): Promise<GoogleMapsObservationBatch & { scrollOutcome: string }> {
    this._observationSequence = sequence;
    const cardElements = surfaceElement?.querySelectorAll
      ? Array.from(surfaceElement.querySelectorAll(CARD_SELECTORS.cardContainers.join(', ')))
      : [];

    const cycleNewCandidates: GoogleMapsCandidateObservation[] = [];
    let cycleDuplicates = 0;
    let cycleInvalids = 0;
    const cycleCandidateIds: string[] = [];

    for (const cardEl of cardElements as any[]) {
      const classification = classifyCandidateCard(cardEl);
      if (!classification.isBusinessCard) {
        cycleInvalids++;
        continue;
      }

      const rawData = extractRawCardNodeData(cardEl, context.pageUrl);
      const observation = createCandidateObservation(rawData, {
        sessionId: context.sessionId,
        searchUnitId: context.searchUnitId,
        searchKeyword: context.searchKeyword,
        searchLocation: location || context.searchLocation,
        pageUrl: context.pageUrl,
        pageKind: 'SEARCH_RESULTS'
      });

      const identity = deriveCandidateIdentity({
        businessName: observation.businessName.parsedValue,
        placeId: observation.placeId.parsedValue,
        mapsUrl: observation.mapsUrl.parsedValue,
        address: observation.address.parsedValue,
        category: observation.category.parsedValue,
        searchKeyword: context.searchKeyword,
        searchLocation: location || context.searchLocation,
        searchUnitId: context.searchUnitId
      });

      const identifiedObservation: GoogleMapsCandidateObservation = {
        ...observation,
        observationId: observation.observationId || identity.candidateId,
        candidateId: identity.candidateId,
        identityMethod: identity.identityMethod,
        identityConfidence: identity.identityConfidence,
        identityEvidence: identity.evidence
      };

      cycleCandidateIds.push(identity.candidateId);
      const { isNew, candidate } = this._deduplicator.register(identifiedObservation);
      if (isNew) {
        cycleNewCandidates.push(candidate);
        if (this._deduplicator.size >= this._policy.maxCandidates) {
          break;
        }
      } else {
        cycleDuplicates++;
      }
    }

    const prevScrollTop = surfaceElement?.scrollTop ?? 0;
    const stepDistance = Math.max(
      200,
      Math.round((surfaceElement?.clientHeight || 600) * this._policy.scrollFractionOfViewport)
    );

    if (surfaceElement) {
      if (typeof surfaceElement.scrollTo === 'function') {
        surfaceElement.scrollTo({ top: prevScrollTop + stepDistance });
      } else if (typeof surfaceElement.scrollBy === 'function') {
        surfaceElement.scrollBy(0, stepDistance);
      } else if (surfaceElement.scrollTop !== undefined) {
        surfaceElement.scrollTop += stepDistance;
      }
    }

    const newScrollTop = surfaceElement?.scrollTop ?? prevScrollTop;
    const scrollOutcome = newScrollTop > prevScrollTop
      ? 'SCROLL_PROGRESS'
      : (cycleNewCandidates.length > 0 ? 'SCROLL_PROGRESS' : 'SCROLL_NO_PROGRESS');

    const batch: GoogleMapsObservationBatch & { scrollOutcome: string } = {
      sessionId: context.sessionId,
      searchUnitId: context.searchUnitId,
      observationSequence: sequence,
      visibleCandidateCount: cardElements.length,
      newCandidateCount: cycleNewCandidates.length,
      duplicateCandidateCount: cycleDuplicates,
      invalidCandidateCount: cycleInvalids,
      candidateIds: cycleCandidateIds,
      newCandidates: cycleNewCandidates,
      scrollTop: newScrollTop,
      clientHeight: surfaceElement?.clientHeight ?? 0,
      scrollHeight: surfaceElement?.scrollHeight ?? 0,
      isAtBottom: false,
      hasNewContent: cycleNewCandidates.length > 0,
      timestamp: new Date().toISOString(),
      scrollOutcome
    };

    this.emit('batch', batch);
    return batch;
  }

  /**
   * Runs acquisition loop over a specified surface container.
   */
  public async runAcquisitionLoop(
    surfaceContainer: any,
    context: FeedScrollEngineContext,
    location?: string
  ): Promise<{
    metrics: GoogleMapsAcquisitionMetrics;
    batches: GoogleMapsObservationBatch[];
    candidates: GoogleMapsCandidateObservation[];
    terminationReason: ScrollTerminationReason;
  }> {
    this._running = true;
    this._context = context;
    this._startTime = Date.now();
    let scrollStep = 0;
    let consecutiveNoProgressCycles = 0;
    const batches: GoogleMapsObservationBatch[] = [];
    const emittedCandidates: GoogleMapsCandidateObservation[] = [];

    const metrics: GoogleMapsAcquisitionMetrics = {
      scrollSteps: 0,
      observationCycles: 0,
      visibleCandidateObservations: 0,
      uniqueCandidates: 0,
      duplicateObservations: 0,
      invalidCandidates: 0,
      scrollNoProgressCycles: 0,
      feedGrowthEvents: 0,
      extractionErrors: 0,
      elapsedMs: 0
    };

    let terminationReason: ScrollTerminationReason = 'EXHAUSTED';

    try {
      while (true) {
        metrics.elapsedMs = Date.now() - this._startTime;
        if (metrics.elapsedMs >= this._policy.maxDurationMs) {
          terminationReason = 'TIMEOUT';
          break;
        }

        if (this._userCancelled || (this._hooks.isCancelled && this._hooks.isCancelled())) {
          terminationReason = 'USER_CANCELLED';
          break;
        }
        if (this._userPaused || (this._hooks.isPaused && this._hooks.isPaused())) {
          terminationReason = 'USER_PAUSED';
          break;
        }

        this._observationSequence++;
        metrics.observationCycles++;

        const batch = await this.executeScrollCycle(
          surfaceContainer,
          context,
          location,
          this._observationSequence
        );

        batches.push(batch);
        metrics.visibleCandidateObservations += batch.visibleCandidateCount;
        metrics.invalidCandidates += batch.invalidCandidateCount;
        metrics.duplicateObservations += batch.duplicateCandidateCount;

        if (batch.newCandidates && batch.newCandidates.length > 0) {
          consecutiveNoProgressCycles = 0;
          metrics.feedGrowthEvents++;
          emittedCandidates.push(...batch.newCandidates);
        } else {
          consecutiveNoProgressCycles++;
          metrics.scrollNoProgressCycles++;
        }

        metrics.uniqueCandidates = this._deduplicator.size;

        if (this._deduplicator.size >= this._policy.maxCandidates) {
          terminationReason = 'MAX_RESULTS_REACHED';
          break;
        }

        const exhaustionCheck = this.isFeedExhausted(surfaceContainer, consecutiveNoProgressCycles);
        if (exhaustionCheck.exhausted) {
          terminationReason = 'EXHAUSTED';
          break;
        }

        scrollStep++;
        metrics.scrollSteps = scrollStep;
        if (scrollStep >= this._policy.maxScrollSteps) {
          terminationReason = 'MAX_SCROLL_STEPS_REACHED';
          break;
        }

        await this._waitForFeedUpdate(surfaceContainer);
      }
    } finally {
      this.cleanup();
      this._running = false;
      metrics.elapsedMs = Date.now() - this._startTime;
      metrics.terminationReason = terminationReason;
    }

    return {
      metrics,
      batches,
      candidates: emittedCandidates,
      terminationReason
    };
  }

  public async startScrollLoop(): Promise<{
    metrics: GoogleMapsAcquisitionMetrics;
    batches: GoogleMapsObservationBatch[];
    candidates: GoogleMapsCandidateObservation[];
    terminationReason: ScrollTerminationReason;
  }> {
    return this.execute();
  }

  /**
   * Executes the controlled, stepwise acquisition loop using the configured domProvider.
   */
  public async execute(): Promise<{
    metrics: GoogleMapsAcquisitionMetrics;
    batches: GoogleMapsObservationBatch[];
    candidates: GoogleMapsCandidateObservation[];
    terminationReason: ScrollTerminationReason;
  }> {
    this._running = true;
    this._startTime = Date.now();
    let scrollStep = 0;
    let consecutiveNoProgressCycles = 0;
    const batches: GoogleMapsObservationBatch[] = [];
    const emittedCandidates: GoogleMapsCandidateObservation[] = [];

    const metrics: GoogleMapsAcquisitionMetrics = {
      scrollSteps: 0,
      observationCycles: 0,
      visibleCandidateObservations: 0,
      uniqueCandidates: 0,
      duplicateObservations: 0,
      invalidCandidates: 0,
      scrollNoProgressCycles: 0,
      feedGrowthEvents: 0,
      extractionErrors: 0,
      elapsedMs: 0
    };

    let terminationReason: ScrollTerminationReason = 'EXHAUSTED';

    try {
      while (true) {
        metrics.elapsedMs = Date.now() - this._startTime;
        if (metrics.elapsedMs >= this._policy.maxDurationMs) {
          terminationReason = 'TIMEOUT';
          break;
        }

        if (this._userCancelled || (this._hooks.isCancelled && this._hooks.isCancelled())) {
          terminationReason = 'USER_CANCELLED';
          break;
        }
        if (this._userPaused || (this._hooks.isPaused && this._hooks.isPaused())) {
          terminationReason = 'USER_PAUSED';
          break;
        }

        const dom = this._domProvider();
        const surfaceDetection = detectResultSurface(dom);

        if (!surfaceDetection.found || !surfaceDetection.container || !surfaceDetection.container.validated) {
          terminationReason = 'UNSUPPORTED';
          if (this._hooks.onDiagnostic) {
            this._hooks.onDiagnostic({
              code: 'RESULT_SURFACE_NOT_FOUND',
              severity: 'P1',
              recoveryClass: 'UNSUPPORTED',
              message: surfaceDetection.container?.reason || 'Result surface not found in DOM',
              timestamp: new Date().toISOString(),
              sessionId: this._context.sessionId,
              searchUnitId: this._context.searchUnitId
            });
          }
          break;
        }

        const surfaceElement = surfaceDetection.container.element;
        this._observationSequence++;
        metrics.observationCycles++;

        const cardElements = surfaceElement.querySelectorAll
          ? Array.from(surfaceElement.querySelectorAll(CARD_SELECTORS.cardContainers.join(', ')))
          : [];

        metrics.visibleCandidateObservations += cardElements.length;

        const cycleNewCandidates: GoogleMapsCandidateObservation[] = [];
        let cycleDuplicates = 0;
        let cycleInvalids = 0;
        const cycleCandidateIds: string[] = [];

        for (const cardEl of cardElements as any[]) {
          const classification = classifyCandidateCard(cardEl);

          if (!classification.isBusinessCard) {
            cycleInvalids++;
            metrics.invalidCandidates++;
            continue;
          }

          const rawData = extractRawCardNodeData(cardEl, this._context.pageUrl);

          const observation = createCandidateObservation(rawData, {
            sessionId: this._context.sessionId,
            searchUnitId: this._context.searchUnitId,
            searchKeyword: this._context.searchKeyword,
            searchLocation: this._context.searchLocation,
            pageUrl: this._context.pageUrl,
            pageKind: 'SEARCH_RESULTS'
          });

          const identity = deriveCandidateIdentity({
            businessName: observation.businessName.parsedValue,
            placeId: observation.placeId.parsedValue,
            mapsUrl: observation.mapsUrl.parsedValue,
            address: observation.address.parsedValue,
            category: observation.category.parsedValue,
            searchKeyword: this._context.searchKeyword,
            searchLocation: this._context.searchLocation,
            searchUnitId: this._context.searchUnitId
          });

          const identifiedObservation: GoogleMapsCandidateObservation = {
            ...observation,
            observationId: observation.observationId || identity.candidateId,
            candidateId: identity.candidateId,
            identityMethod: identity.identityMethod,
            identityConfidence: identity.identityConfidence,
            identityEvidence: identity.evidence
          };

          cycleCandidateIds.push(identity.candidateId);

          const { isNew, candidate: registeredCandidate } = this._deduplicator.register(identifiedObservation);

          if (isNew) {
            cycleNewCandidates.push(registeredCandidate);
            emittedCandidates.push(registeredCandidate);
            if (this._deduplicator.size >= this._policy.maxCandidates) {
              break;
            }
          } else {
            cycleDuplicates++;
            metrics.duplicateObservations++;
          }
        }

        metrics.uniqueCandidates = this._deduplicator.size;

        if (cycleNewCandidates.length > 0) {
          consecutiveNoProgressCycles = 0;
          metrics.feedGrowthEvents++;
          if (this._hooks.onNewCandidates) {
            this._hooks.onNewCandidates(cycleNewCandidates);
          }
        } else {
          consecutiveNoProgressCycles++;
          metrics.scrollNoProgressCycles++;
        }

        if (this._deduplicator.size >= this._policy.maxCandidates) {
          terminationReason = 'MAX_RESULTS_REACHED';
          break;
        }

        const exhaustionCheck = this.isFeedExhausted(surfaceElement, consecutiveNoProgressCycles);
        const isAtBottom = exhaustionCheck.exhausted;

        const batch: GoogleMapsObservationBatch = {
          sessionId: this._context.sessionId,
          searchUnitId: this._context.searchUnitId,
          observationSequence: this._observationSequence,
          visibleCandidateCount: cardElements.length,
          newCandidateCount: cycleNewCandidates.length,
          duplicateCandidateCount: cycleDuplicates,
          invalidCandidateCount: cycleInvalids,
          candidateIds: cycleCandidateIds,
          newCandidates: cycleNewCandidates,
          scrollTop: surfaceElement.scrollTop ?? 0,
          clientHeight: surfaceElement.clientHeight ?? 0,
          scrollHeight: surfaceElement.scrollHeight ?? 0,
          isAtBottom,
          hasNewContent: cycleNewCandidates.length > 0,
          timestamp: new Date().toISOString()
        };
        batches.push(batch);
        this.emit('batch', batch);

        if (this._hooks.onBatchCompleted) {
          this._hooks.onBatchCompleted(batch);
        }

        if (isAtBottom) {
          terminationReason = 'EXHAUSTED';
          break;
        }

        scrollStep++;
        metrics.scrollSteps = scrollStep;
        if (scrollStep >= this._policy.maxScrollSteps) {
          terminationReason = 'MAX_SCROLL_STEPS_REACHED';
          break;
        }

        const stepDistance = Math.max(
          200,
          Math.round((surfaceElement.clientHeight || 600) * this._policy.scrollFractionOfViewport)
        );

        const prevScrollTop = surfaceElement.scrollTop ?? 0;
        if (typeof surfaceElement.scrollBy === 'function') {
          surfaceElement.scrollBy(0, stepDistance);
        } else if (surfaceElement.scrollTop !== undefined) {
          surfaceElement.scrollTop += stepDistance;
        }

        const newScrollTop = surfaceElement.scrollTop ?? prevScrollTop;
        if (newScrollTop === prevScrollTop && consecutiveNoProgressCycles >= this._policy.maxNoNewCandidateCycles) {
          terminationReason = 'EXHAUSTED';
          break;
        }

        await this._waitForFeedUpdate(surfaceElement);
      }
    } finally {
      this.cleanup();
      this._running = false;
      metrics.elapsedMs = Date.now() - this._startTime;
      metrics.terminationReason = terminationReason;
    }

    return {
      metrics,
      batches,
      candidates: emittedCandidates,
      terminationReason
    };
  }
}
