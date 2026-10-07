/**
 * LeadNoria — Google Maps Acquisition Engine — Runtime Coordinator
 *
 * Connects the acquisition engine into the Chrome extension service-worker runtime.
 * Bridges:
 * - Chrome runtime messages (START_GMAPS_ACQUISITION, PAUSE, RESUME, CANCEL, GET_STATUS)
 * - State machine lifecycle enforcement
 * - Search-unit queuing and duplicate suppression
 * - Browser tab navigation orchestration
 * - DOM/Page readiness detection
 * - Candidate observation boundary
 * - Ephemeral checkpoint manager
 */

import type {
  GoogleMapsAcquisitionState,
  GoogleMapsCandidateObservation,
  GoogleMapsSessionConfig,
  GoogleMapsSessionProgress,
  GoogleMapsAcquisitionDiagnostic,
  GoogleMapsSearchUnitInput,
  GoogleMapsSearchUnit
} from './types.ts';
import { DEFAULT_MAPS_SESSION_CONFIG } from './types.ts';
import { GoogleMapsStateMachine } from './stateMachine.ts';
import { GoogleMapsAcquisitionQueue } from './acquisitionQueue.ts';
import { planSearchUnits, createSearchUnit } from './searchUnit.ts';
import {
  GoogleMapsNavigationOrchestrator,
  type TabNavigationDriver
} from './navigationOrchestrator.ts';
import {
  GoogleMapsCheckpointManager,
  InMemoryCheckpointStorage
} from './checkpointManager.ts';
import {
  validateAcquisitionMessage,
  type GoogleMapsAcquisitionMessage
} from './messageContracts.ts';
import { detectGoogleMapsPage } from './pageDetector.ts';
import {
  createCandidateObservation,
  buildPageObservation,
  type RawCandidateNodeData
} from './observationBoundary.ts';
import { DefaultResultFeedObserver } from './resultFeedObserver.ts';
import { SessionCandidateDeduplicator } from './candidateIdentity.ts';
import { GoogleMapsFeedScrollEngine } from './feedScrollEngine.ts';
import { probeGoogleMapsCapability } from './liveCapabilityProbe.ts';
import type { GoogleMapsAcquisitionPolicy, GoogleMapsObservationBatch } from './types.ts';
import {
  GoogleMapsFilterStateManager,
  normalizeRatingFilter,
  normalizeWebsiteFilter,
  normalizeFilterCriteria
} from './filterEngine.ts';
import type {
  GoogleMapsFilterCriteria,
  RatingFilterOption,
  WebsiteFilterOption,
  FilteredDatasetView
} from './filterTypes.ts';
import {
  createBulkResearchPlan,
  validateBulkRequest
} from './bulkPlanner.ts';
import {
  GoogleMapsBulkOrchestrator
} from './bulkOrchestrator.ts';
import type {
  BulkResearchRequest,
  BulkResearchPlan,
  BulkRunSnapshot
} from './bulkPlanTypes.ts';

export interface ActiveSessionContext {
  sessionId: string;
  stateMachine: GoogleMapsStateMachine;
  queue: GoogleMapsAcquisitionQueue;
  orchestrator: GoogleMapsNavigationOrchestrator;
  checkpointManager: GoogleMapsCheckpointManager;
  config: GoogleMapsSessionConfig;
  tabDriver: TabNavigationDriver;
  currentSearchUnit?: GoogleMapsSearchUnit;
  candidatesObserved: GoogleMapsCandidateObservation[];
  diagnostics: GoogleMapsAcquisitionDiagnostic[];
  deduplicator: SessionCandidateDeduplicator;
  batches: GoogleMapsObservationBatch[];
  scrollEngine?: GoogleMapsFeedScrollEngine;
  filterManager: GoogleMapsFilterStateManager;
}

/**
 * Default browser tab driver using standard Chrome extension APIs (when available).
 */
export function createDefaultTabDriver(): TabNavigationDriver {
  return {
    async getTab(tabId: number) {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.get) {
        try {
          const tab = await chrome.tabs.get(tabId);
          return {
            id: tab.id ?? tabId,
            url: tab.url ?? '',
            active: tab.active ?? false,
            status: tab.status === 'loading' ? 'loading' : tab.status === 'complete' ? 'complete' : undefined
          };
        } catch {
          return null;
        }
      }
      return null;
    },
    async navigateTab(tabId: number, url: string) {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.update) {
        try {
          await chrome.tabs.update(tabId, { url });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    },
    async probeTabState(tabId: number) {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.get) {
        try {
          const tab = await chrome.tabs.get(tabId);
          return detectGoogleMapsPage(tab.url ?? '');
        } catch {
          // Tab inquiry failed
        }
      }
      return detectGoogleMapsPage('');
    }
  };
}

export class GoogleMapsRuntimeCoordinator {
  private readonly _sessions = new Map<string, ActiveSessionContext>();
  private readonly _bulkOrchestrators = new Map<string, GoogleMapsBulkOrchestrator>();
  private readonly _defaultDriver: TabNavigationDriver;

  constructor(defaultDriver: TabNavigationDriver = createDefaultTabDriver()) {
    this._defaultDriver = defaultDriver;
  }

  /**
   * Dispatches incoming Chrome extension runtime messages to the acquisition engine.
   */
  public async handleAcquisitionMessage(
    rawMessage: unknown,
    _sender?: unknown,
    customDriver?: TabNavigationDriver
  ): Promise<{
    success: boolean;
    error?: string;
    sessionId?: string;
    state?: GoogleMapsAcquisitionState;
    progress?: GoogleMapsSessionProgress;
    candidatesCount?: number;
    diagnostics?: GoogleMapsAcquisitionDiagnostic[];
    checkpointId?: string;
    details?: Record<string, unknown>;
    snapshot?: BulkRunSnapshot;
  }> {
    const validation = validateAcquisitionMessage(rawMessage);
    if (!validation.valid || !validation.message) {
      return {
        success: false,
        error: validation.error || 'Invalid acquisition message'
      };
    }

    const msg = validation.message;
    const sessionId = msg.payload.sessionId;

    switch (msg.type) {
      case 'START_GMAPS_ACQUISITION': {
        return this.startAcquisition(
          sessionId,
          msg.payload.searchUnits,
          msg.payload.config,
          customDriver
        );
      }
      case 'PAUSE_GMAPS_ACQUISITION': {
        return this.pauseAcquisition(sessionId);
      }
      case 'RESUME_GMAPS_ACQUISITION': {
        return this.resumeAcquisition(sessionId);
      }
      case 'CANCEL_GMAPS_ACQUISITION': {
        return this.cancelAcquisition(sessionId, msg.payload.reason);
      }
      case 'GET_GMAPS_ACQUISITION_STATUS': {
        return this.getAcquisitionStatus(sessionId);
      }
      case 'EXECUTE_GMAPS_FEED_SCROLL': {
        return this.executeFeedScroll(sessionId, (msg as any).payload?.policy);
      }
      case 'PROBE_GMAPS_LIVE_CAPABILITY': {
        return this.probeLiveCapability(undefined, (msg as any).payload?.url);
      }
      case 'SET_GMAPS_FILTER': {
        const p = (msg as any).payload;
        return this.setSessionFilter(sessionId, {
          rating: normalizeRatingFilter(p?.rating),
          website: normalizeWebsiteFilter(p?.website)
        });
      }
      case 'RESET_GMAPS_FILTER': {
        return this.resetSessionFilter(sessionId);
      }
      case 'GET_GMAPS_FILTERED_VIEW': {
        return this.getSessionFilteredView(sessionId);
      }
      case 'START_GMAPS_BULK_RESEARCH': {
        const p = (msg as any).payload;
        return this.startBulkResearch({
          keywords: p.keywords,
          locations: p.locations,
          ratingFilter: p.ratingFilter,
          websiteFilter: p.websiteFilter,
          maxResults: p.maxResults,
          executionPolicy: p.executionPolicy,
          tabId: p.tabId,
          planId: p.planId,
          runId: p.runId || sessionId
        }, customDriver);
      }
      case 'PAUSE_GMAPS_BULK_RESEARCH': {
        return this.pauseBulkResearch(sessionId);
      }
      case 'RESUME_GMAPS_BULK_RESEARCH': {
        return this.resumeBulkResearch(sessionId);
      }
      case 'CANCEL_GMAPS_BULK_RESEARCH': {
        return this.cancelBulkResearch(sessionId, (msg as any).payload?.reason);
      }
      case 'GET_GMAPS_BULK_RESEARCH_STATUS': {
        return this.getBulkResearchStatus(sessionId);
      }
      default:
        return {
          success: false,
          error: `Unhandled acquisition message type: ${(msg as any).type}`
        };
    }
  }

  /**
   * Starts a Google Maps acquisition session from units input.
   */
  public async startAcquisition(
    sessionId: string,
    inputs: GoogleMapsSearchUnitInput[],
    configOverrides?: Partial<GoogleMapsSessionConfig>,
    driver?: TabNavigationDriver
  ) {
    if (!sessionId) {
      return { success: false, error: 'sessionId is required' };
    }
    if (!inputs || inputs.length === 0) {
      return { success: false, error: 'At least one searchUnit is required' };
    }

    const tabDriver = driver || this._defaultDriver;
    const config: GoogleMapsSessionConfig = {
      ...DEFAULT_MAPS_SESSION_CONFIG,
      ...configOverrides,
      sessionId
    };

    // Initialize state machine
    const stateMachine = new GoogleMapsStateMachine(sessionId);
    stateMachine.transitionTo('STARTING', 'Starting Google Maps acquisition session');

    // Plan and enqueue search units
    const queue = new GoogleMapsAcquisitionQueue();
    const plannedUnits = inputs.map(inp => createSearchUnit(inp));
    queue.enqueue(plannedUnits);

    const checkpointManager = new GoogleMapsCheckpointManager(new InMemoryCheckpointStorage());
    const orchestrator = new GoogleMapsNavigationOrchestrator(tabDriver, {
      timeoutMs: config.navigationTimeoutMs,
      pollIntervalMs: 250
    });

    const ctx: ActiveSessionContext = {
      sessionId,
      stateMachine,
      queue,
      orchestrator,
      checkpointManager,
      config,
      tabDriver,
      candidatesObserved: [],
      diagnostics: [],
      deduplicator: new SessionCandidateDeduplicator(),
      batches: [],
      filterManager: new GoogleMapsFilterStateManager()
    };
    this._sessions.set(sessionId, ctx);

    // Claim first unit to begin execution
    const claimedUnit = queue.claimNext();
    if (!claimedUnit) {
      stateMachine.transitionTo('FAILED', 'Queue had no runnable search units');
      return {
        success: false,
        sessionId,
        state: stateMachine.state,
        error: 'No search units could be claimed'
      };
    }
    ctx.currentSearchUnit = claimedUnit;
    stateMachine.setSearchUnitId(claimedUnit.searchUnitId);

    // Validate tab ownership
    const tabOwnership = await orchestrator.validateTabOwnership(config.tabId, sessionId);
    if (!tabOwnership.valid && tabOwnership.diagnostic) {
      ctx.diagnostics.push(tabOwnership.diagnostic);
      // If tab invalid, transition to FAILED or stay in STARTING with diagnostic
      stateMachine.transitionTo('FAILED', tabOwnership.diagnostic.message);
      return {
        success: false,
        sessionId,
        state: stateMachine.state,
        error: tabOwnership.diagnostic.message,
        diagnostics: ctx.diagnostics
      };
    }

    // Move to NAVIGATING
    stateMachine.transitionTo('NAVIGATING', `Navigating to query: ${claimedUnit.normalizedQuery}`);

    // Execute bounded navigation
    const navResult = await orchestrator.navigateToSearchUnit(
      config.tabId,
      claimedUnit,
      sessionId
    );

    if (!navResult.success) {
      if (navResult.diagnostics) {
        ctx.diagnostics.push(...navResult.diagnostics);
      }
      stateMachine.transitionTo('FAILED', navResult.error || 'Navigation failed');
      queue.fail(claimedUnit.searchUnitId, navResult.error || 'Navigation failed');
      return {
        success: false,
        sessionId,
        state: stateMachine.state,
        error: navResult.error || 'Navigation failed',
        diagnostics: ctx.diagnostics
      };
    }

    // Transition to OBSERVING upon successful navigation
    stateMachine.transitionTo('OBSERVING', 'Page ready; observing rendered results');

    // Create initial metadata checkpoint
    const qProgress = queue.getProgress();
    const checkpoint = await checkpointManager.createCheckpoint({
      sessionId,
      searchUnit: claimedUnit,
      state: stateMachine.state,
      pageUrl: navResult.url,
      searchUnitProgressContext: {
        unitIndex: 1,
        totalUnits: qProgress.total,
        query: claimedUnit.normalizedQuery
      },
      progress: {
        totalUnits: qProgress.total,
        completedUnits: qProgress.completed,
        pendingUnits: qProgress.queued
      }
    });

    return {
      success: true,
      sessionId,
      state: stateMachine.state,
      progress: this._buildSessionProgress(ctx),
      candidatesCount: ctx.candidatesObserved.length,
      diagnostics: ctx.diagnostics,
      checkpointId: checkpoint.checkpointId,
      details: {
        searchUnitId: claimedUnit.searchUnitId,
        query: claimedUnit.normalizedQuery,
        navigationUrl: claimedUnit.navigationUrl
      }
    };
  }

  /**
   * Pauses an active acquisition session, preserving checkpoint and current progress.
   */
  public async pauseAcquisition(sessionId: string) {
    const ctx = this._sessions.get(sessionId);
    if (!ctx) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }

    ctx.queue.pause();
    ctx.stateMachine.pause('Operator requested pause');

    let checkpointId: string | undefined;
    if (ctx.currentSearchUnit) {
      const qProgress = ctx.queue.getProgress();
      const cp = await ctx.checkpointManager.createCheckpoint({
        sessionId,
        searchUnit: ctx.currentSearchUnit,
        state: ctx.stateMachine.state,
        pageUrl: ctx.currentSearchUnit.navigationUrl,
        lastObservedCandidateIdentity: ctx.candidatesObserved[ctx.candidatesObserved.length - 1]?.observationId,
        progress: {
          totalUnits: qProgress.total,
          completedUnits: qProgress.completed,
          pendingUnits: qProgress.queued
        }
      });
      checkpointId = cp.checkpointId;
    }

    return {
      success: true,
      sessionId,
      state: ctx.stateMachine.state,
      progress: this._buildSessionProgress(ctx),
      checkpointId,
      diagnostics: ctx.diagnostics
    };
  }

  /**
   * Resumes a paused acquisition session safely using preserved checkpoint state.
   */
  public async resumeAcquisition(sessionId: string) {
    const ctx = this._sessions.get(sessionId);
    if (!ctx) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }

    if (ctx.stateMachine.state === 'CANCELLED' || ctx.queue.getProgress().isCancelled) {
      return { success: false, error: 'Cannot resume a cancelled session' };
    }

    if (ctx.stateMachine.state !== 'PAUSED') {
      return { success: false, error: `Cannot resume: session is in '${ctx.stateMachine.state}', expected 'PAUSED'` };
    }

    const latestCp = await ctx.checkpointManager.loadCheckpoint(sessionId);
    const validation = ctx.checkpointManager.validateCheckpoint(latestCp);
    if (!validation.valid) {
      return { success: false, error: `Cannot resume: ${validation.reason}` };
    }

    ctx.queue.resume();
    // Resumes to pausedFromState (OBSERVING or NAVIGATING) automatically
    ctx.stateMachine.resume();

    return {
      success: true,
      sessionId,
      state: ctx.stateMachine.state,
      progress: this._buildSessionProgress(ctx),
      diagnostics: ctx.diagnostics
    };
  }

  /**
   * Cancels an active session, marking all remaining units cancelled.
   */
  public async cancelAcquisition(sessionId: string, reason = 'Operator cancelled session') {
    const ctx = this._sessions.get(sessionId);
    if (!ctx) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }

    ctx.queue.cancel();
    ctx.stateMachine.cancel(reason);

    if (ctx.currentSearchUnit) {
      const qProgress = ctx.queue.getProgress();
      await ctx.checkpointManager.createCheckpoint({
        sessionId,
        searchUnit: ctx.currentSearchUnit,
        state: 'CANCELLED',
        pageUrl: ctx.currentSearchUnit.navigationUrl,
        progress: {
          totalUnits: qProgress.total,
          completedUnits: qProgress.completed,
          pendingUnits: 0
        }
      });
    }

    return {
      success: true,
      sessionId,
      state: ctx.stateMachine.state,
      progress: this._buildSessionProgress(ctx),
      diagnostics: ctx.diagnostics
    };
  }

  /**
   * Gets current status of an acquisition session.
   */
  public getAcquisitionStatus(sessionId: string) {
    const ctx = this._sessions.get(sessionId);
    if (!ctx) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }

    return {
      success: true,
      sessionId,
      state: ctx.stateMachine.state,
      progress: this._buildSessionProgress(ctx),
      candidatesCount: ctx.candidatesObserved.length,
      diagnostics: ctx.diagnostics,
      details: {
        currentSearchUnitId: ctx.currentSearchUnit?.searchUnitId,
        pausedFromState: ctx.stateMachine.pausedFromState
      }
    };
  }

  /**
   * Ingests observed raw candidates from content-script observation boundary into session context.
   */
  public ingestCandidateObservations(
    sessionId: string,
    rawCandidates: RawCandidateNodeData[],
    pageUrl: string
  ): { count: number; observations: GoogleMapsCandidateObservation[] } {
    const ctx = this._sessions.get(sessionId);
    if (!ctx || !ctx.currentSearchUnit) {
      return { count: 0, observations: [] };
    }

    const unit = ctx.currentSearchUnit;
    const observations = rawCandidates.map(raw =>
      createCandidateObservation(raw, {
        sessionId,
        searchUnitId: unit.searchUnitId,
        searchKeyword: unit.rawKeyword,
        searchLocation: unit.rawLocation,
        pageUrl,
        pageKind: 'SEARCH_RESULTS'
      })
    );

    const registered = observations.map(obs => ctx.deduplicator.register(obs).candidate);
    ctx.candidatesObserved.push(...observations);
    ctx.filterManager.ingestCandidates(registered);
    unit.candidateCount = ctx.deduplicator.size;

    return { count: observations.length, observations };
  }

  /**
   * Executes feed scrolling and live candidate observation for an active session.
   */
  public async executeFeedScroll(
    sessionId: string,
    policyOverrides?: Partial<GoogleMapsAcquisitionPolicy>,
    domProvider?: () => any
  ): Promise<{
    success: boolean;
    sessionId?: string;
    state?: GoogleMapsAcquisitionState;
    candidatesCount?: number;
    newCandidatesCount?: number;
    metrics?: Record<string, unknown>;
    terminationReason?: string;
    diagnostics?: GoogleMapsAcquisitionDiagnostic[];
    error?: string;
  }> {
    const ctx = this._sessions.get(sessionId);
    if (!ctx) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }
    if (!ctx.currentSearchUnit) {
      return { success: false, error: 'No active search unit in session' };
    }

    const unit = ctx.currentSearchUnit;
    const provider = domProvider || (() => (typeof document !== 'undefined' ? document : null));

    const scrollEngine = new GoogleMapsFeedScrollEngine(
      provider,
      {
        sessionId,
        searchUnitId: unit.searchUnitId,
        searchKeyword: unit.rawKeyword,
        searchLocation: unit.rawLocation,
        pageUrl: unit.navigationUrl
      },
      policyOverrides,
      {
        onNewCandidates: (newObs) => {
          ctx.candidatesObserved.push(...newObs);
          ctx.filterManager.ingestCandidates(newObs);
          unit.candidateCount = ctx.deduplicator.size;
        },
        onBatchCompleted: (batch) => {
          ctx.batches.push(batch);
        },
        isPaused: () => ctx.stateMachine.state === 'PAUSED',
        isCancelled: () => ctx.stateMachine.state === 'CANCELLED',
        onDiagnostic: (diag) => {
          ctx.diagnostics.push(diag);
        }
      },
      ctx.deduplicator
    );

    ctx.scrollEngine = scrollEngine;

    const result = await scrollEngine.execute();

    // Update metadata checkpoint
    const qProgress = ctx.queue.getProgress();
    await ctx.checkpointManager.createCheckpoint({
      sessionId,
      searchUnit: unit,
      state: ctx.stateMachine.state,
      pageUrl: unit.navigationUrl,
      observationSequence: scrollEngine.observationSequence,
      lastObservedCandidateIdentity: ctx.candidatesObserved[ctx.candidatesObserved.length - 1]?.observationId,
      duplicateSuppressionContext: {
        observedIds: ctx.deduplicator.knownCandidateIds
      },
      progress: {
        totalUnits: qProgress.total,
        completedUnits: qProgress.completed,
        pendingUnits: qProgress.queued
      }
    });

    return {
      success: true,
      sessionId,
      state: ctx.stateMachine.state,
      candidatesCount: ctx.deduplicator.size,
      newCandidatesCount: result.candidates.length,
      metrics: result.metrics as any,
      terminationReason: result.terminationReason,
      diagnostics: ctx.diagnostics
    };
  }

  /**
   * Diagnostic capability probe against current DOM.
   */
  public probeLiveCapability(domRoot?: any, url?: string) {
    const root = domRoot || (typeof document !== 'undefined' ? document : null);
    const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const probe = probeGoogleMapsCapability(root, targetUrl);
    return {
      success: true,
      probe
    };
  }

  /**
   * Updates filter criteria for an active acquisition session or bulk run and returns the re-evaluated view.
   */
  public setSessionFilter(sessionId?: string, filter?: Partial<GoogleMapsFilterCriteria>) {
    const validFilter = normalizeFilterCriteria(filter);
    const ctx = sessionId ? this._sessions.get(sessionId) : undefined;
    let bulk = sessionId ? this._bulkOrchestrators.get(sessionId) : undefined;
    if (!ctx && !bulk && this._bulkOrchestrators.size > 0) {
      const all = Array.from(this._bulkOrchestrators.values());
      bulk = all[all.length - 1];
    }
    if (!ctx && !bulk) {
      return { success: false, error: `Session "${sessionId || 'default'}" not found` };
    }
    if (bulk) {
      bulk.setFilter(validFilter);
      const view = bulk.getFilterManager().getFilteredView();
      return {
        success: true,
        sessionId: bulk.getSnapshot().runId,
        view,
        snapshot: bulk.getSnapshot()
      };
    }
    const manager = ctx!.filterManager;
    const view = manager.setFilter(filter);
    return {
      success: true,
      sessionId,
      view
    };
  }

  /**
   * Resets active filters to default ANY / ANY for a session or bulk run.
   */
  public resetSessionFilter(sessionId: string) {
    const ctx = this._sessions.get(sessionId);
    const bulk = this._bulkOrchestrators.get(sessionId);
    if (!ctx && !bulk) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }
    const manager = bulk ? bulk.getFilterManager() : ctx!.filterManager;
    const view = manager.resetFilters();
    return {
      success: true,
      sessionId,
      view
    };
  }

  /**
   * Retrieves the current filtered dataset view for a session or bulk run.
   */
  public getSessionFilteredView(sessionId: string) {
    const ctx = this._sessions.get(sessionId);
    const bulk = this._bulkOrchestrators.get(sessionId);
    if (!ctx && !bulk) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }
    const manager = bulk ? bulk.getFilterManager() : ctx!.filterManager;
    const view = manager.getFilteredView();
    return {
      success: true,
      sessionId,
      view
    };
  }

  /**
   * Starts a bulk research run across Keywords x Locations (Part 4).
   * Guards against duplicate start if an active run exists.
   */
  public async startBulkResearch(
    request: BulkResearchRequest,
    driver?: TabNavigationDriver
  ) {
    const tabDriver = driver || this._defaultDriver;
    let tabId = request.tabId ?? 0;
    if (tabId <= 0 && typeof chrome !== 'undefined' && chrome.tabs && typeof chrome.tabs.query === 'function') {
      try {
        const tabs = await chrome.tabs.query({});
        const targetTab = tabs.find(t => t.url && !t.url.startsWith('chrome-extension://')) || tabs.find(t => t.id && !t.active) || tabs[0];
        if (targetTab?.id) {
          tabId = targetTab.id;
        }
      } catch {}
    }

    const validation = validateBulkRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Invalid bulk research request: ${validation.errors.join('; ')}`
      };
    }

    const plan = createBulkResearchPlan(request);
    const runId = request.runId || `brun_${plan.planFingerprint}`;

    // Duplicate execution guard
    const existing = this._bulkOrchestrators.get(runId);
    if (existing) {
      const snap = existing.getSnapshot();
      if (snap.state === 'RUNNING' || snap.state === 'QUEUED') {
        return {
          success: false,
          error: `A bulk research run (${runId}) is already active. Duplicate execution prevented.`,
          snapshot: snap
        };
      }
    }

    const orchestrator = new GoogleMapsBulkOrchestrator({
      plan,
      runId,
      tabDriver,
      tabId
    });

    this._bulkOrchestrators.set(runId, orchestrator);
    this._bulkOrchestrators.set(plan.planId, orchestrator);

    const snapshot = await orchestrator.start();
    return {
      success: true,
      sessionId: runId,
      snapshot
    };
  }

  public async pauseBulkResearch(sessionId: string) {
    const orch = this._bulkOrchestrators.get(sessionId);
    if (!orch) {
      return { success: false, error: `Bulk research run "${sessionId}" not found` };
    }
    const snapshot = await orch.pause();
    return { success: true, sessionId, snapshot };
  }

  public async resumeBulkResearch(sessionId: string) {
    const orch = this._bulkOrchestrators.get(sessionId);
    if (!orch) {
      return { success: false, error: `Bulk research run "${sessionId}" not found` };
    }
    const snapshot = await orch.resume();
    return { success: true, sessionId, snapshot };
  }

  public async cancelBulkResearch(sessionId: string, reason?: string) {
    const orch = this._bulkOrchestrators.get(sessionId);
    if (!orch) {
      return { success: false, error: `Bulk research run "${sessionId}" not found` };
    }
    const snapshot = await orch.cancel(reason);
    return { success: true, sessionId, snapshot };
  }

  public getBulkResearchStatus(sessionId?: string) {
    let orch = sessionId ? this._bulkOrchestrators.get(sessionId) : undefined;
    if (!orch && this._bulkOrchestrators.size > 0) {
      const all = Array.from(this._bulkOrchestrators.values());
      orch = all[all.length - 1];
    }
    if (!orch) {
      return { success: false, error: `Bulk research run "${sessionId || 'default'}" not found` };
    }
    const snapshot = orch.getSnapshot();
    return { success: true, sessionId: snapshot.runId, snapshot };
  }

  public getBulkOrchestrator(sessionId: string): GoogleMapsBulkOrchestrator | undefined {
    return this._bulkOrchestrators.get(sessionId);
  }

  public getSession(sessionId: string): ActiveSessionContext | undefined {
    return this._sessions.get(sessionId);
  }

  private _buildSessionProgress(ctx: ActiveSessionContext): GoogleMapsSessionProgress {
    const qp = ctx.queue.getProgress();
    const now = new Date().toISOString();
    return {
      sessionId: ctx.sessionId,
      state: ctx.stateMachine.state,
      totalSearchUnits: qp.total,
      completedSearchUnits: qp.completed,
      currentSearchUnitId: ctx.currentSearchUnit?.searchUnitId,
      totalCandidatesObserved: ctx.candidatesObserved.length,
      uniqueCandidatesObserved: new Set(ctx.candidatesObserved.map(c => c.observationId)).size,
      diagnosticsCount: ctx.diagnostics.length,
      startedAt: ctx.currentSearchUnit?.startedAt || now,
      lastActivityAt: now,
      completedAt: ctx.stateMachine.state === 'COMPLETED' ? now : undefined
    };
  }
}

// Global coordinator singleton
export const googleMapsRuntimeCoordinator = new GoogleMapsRuntimeCoordinator();
