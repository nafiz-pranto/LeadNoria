/**
 * LeadNoria — Google Maps Acquisition Engine — Bulk Research Orchestrator
 * Part 4: Sequential Queue Orchestrator & Bounded Execution Engine
 *
 * HARD BOUNDARIES & INVARIANTS:
 * - Concurrency = 1: Single active acquisition worker, zero parallel Maps scraping.
 * - Tab reuse: Dedicated browser tab reused sequentially across SearchUnits.
 * - Error isolation: Single SearchUnit failure does not abort the entire run.
 * - Bounded retries: Configurable retry limit with deterministic backoff.
 * - Atomic queue claiming: Concurrency guard strictly prevents duplicate execution.
 * - Non-destructive post-acquisition filtering: Filter updates do not alter acquisition.
 * - Google Data Firewall: ONLY execution metadata is stored; candidate PII is never persisted.
 * - Truthful recovery: In-session exact pause/resume; safe boundary restart after process reload.
 */

import type {
  GoogleMapsSearchUnit,
  GoogleMapsAcquisitionState,
  GoogleMapsAcquisitionDiagnostic,
  GoogleMapsCandidateObservation,
  GoogleMapsAcquisitionPolicy,
  GoogleMapsSessionConfig
} from './types.ts';

import {
  BulkExecutionPolicy,
  BulkResearchPlan,
  BulkRunState,
  SearchUnitRunState,
  SearchUnitTerminationReason,
  BulkRunTerminationReason,
  BulkRunMetrics,
  SearchUnitExecutionSummary,
  BulkExecutionCheckpoint,
  BulkRunSnapshot
} from './bulkPlanTypes.ts';

import { GoogleMapsAcquisitionQueue } from './acquisitionQueue.ts';
import { GoogleMapsNavigationOrchestrator, TabNavigationDriver } from './navigationOrchestrator.ts';
import { GoogleMapsFeedScrollEngine } from './feedScrollEngine.ts';
import { SessionCandidateDeduplicator } from './candidateIdentity.ts';
import { GoogleMapsFilterStateManager } from './filterEngine.ts';
import { GoogleMapsCheckpointManager, InMemoryCheckpointStorage, CheckpointStorageAdapter } from './checkpointManager.ts';
import { ENGINE_ADAPTER_VERSION } from './observationBoundary.ts';
import { BULK_PLAN_SCHEMA_VERSION } from './bulkPlanner.ts';
import { hashStringDeterministic } from './searchUnit.ts';
import { GoogleMapsEnrichmentQueue } from './enrichmentQueue.ts';
import type { EnrichmentPolicy, EnrichmentQueueSnapshot } from './enrichmentTypes.ts';
import type { SessionCandidate } from './candidateIdentityTypes.ts';

export interface BulkOrchestratorCallbacks {
  onProgress?: (snapshot: BulkRunSnapshot) => void;
  onUnitStarted?: (unit: GoogleMapsSearchUnit, index: number, total: number) => void;
  onSearchUnitStarted?: (unit: GoogleMapsSearchUnit, index: number, total: number) => void;
  onUnitCompleted?: (unit: GoogleMapsSearchUnit, summary: SearchUnitExecutionSummary) => void;
  onSearchUnitCompleted?: (unit: GoogleMapsSearchUnit, summary: SearchUnitExecutionSummary) => void;
  onUnitFailed?: (unit: GoogleMapsSearchUnit, summary: SearchUnitExecutionSummary) => void;
  onSearchUnitFailed?: (unit: GoogleMapsSearchUnit, summary: SearchUnitExecutionSummary) => void;
  onCandidateBatch?: (batch: GoogleMapsCandidateObservation[]) => void;
  onDiagnostic?: (diagnostic: GoogleMapsAcquisitionDiagnostic) => void;
  onRunCompleted?: (snapshot: BulkRunSnapshot) => void;
}

export interface BulkOrchestratorOptions {
  plan: BulkResearchPlan;
  runId?: string;
  tabDriver?: TabNavigationDriver;
  tabId?: number;
  policy?: Partial<BulkExecutionPolicy> & { maxAttemptsPerUnit?: number; delayBetweenRetriesMs?: number };
  callbacks?: BulkOrchestratorCallbacks;
  storageAdapter?: CheckpointStorageAdapter;
  domProvider?: () => any;
  enrichmentPolicy?: Partial<EnrichmentPolicy>;
  enrichmentCustomFetch?: (url: string, timeoutMs: number) => Promise<{ status: number; html: string; headers?: Record<string, string>; location?: string; redirectUrl?: string }>;
}

export class GoogleMapsBulkOrchestrator {
  private readonly _plan: BulkResearchPlan;
  private _runId: string;
  private readonly _tabDriver: TabNavigationDriver;
  private readonly _tabId: number;
  private readonly _callbacks: BulkOrchestratorCallbacks;
  private readonly _policy: BulkExecutionPolicy;

  private readonly _queue: GoogleMapsAcquisitionQueue;
  private readonly _orchestrator: GoogleMapsNavigationOrchestrator;
  private readonly _checkpointManager: GoogleMapsCheckpointManager;
  private readonly _filterManager: GoogleMapsFilterStateManager;
  private readonly _deduplicator = new SessionCandidateDeduplicator();
  private readonly _enrichmentQueue: GoogleMapsEnrichmentQueue;

  private _state: BulkRunState = 'PLAN_CREATED';
  private _terminationReason: BulkRunTerminationReason = 'NONE';
  private _startedAt: string = '';
  private _lastUpdatedAt: string = '';
  private _completedAt?: string;

  private _currentUnit?: GoogleMapsSearchUnit;
  private _currentUnitSummary?: SearchUnitExecutionSummary;
  private _unitSummaries = new Map<string, SearchUnitExecutionSummary>();
  private readonly _diagnostics: GoogleMapsAcquisitionDiagnostic[] = [];

  // Concurrency & lifecycle locks
  private _isExecuting = false;
  private _isPaused = false;
  private _isCancelled = false;
  private _pausedUnitId?: string;
  private _executionPromise?: Promise<void>;
  private _activeScrollEngine?: GoogleMapsFeedScrollEngine;
  private readonly _domProvider: () => any;

  // Candidate observations tracking
  private _rawCandidateObservations = 0;
  private _duplicateObservationCount = 0;

  constructor(params: BulkOrchestratorOptions) {
    this._plan = params.plan;
    this._runId = params.runId || `brun_${hashStringDeterministic(params.plan.planFingerprint + Date.now().toString())}`;
    this._tabDriver = (params.tabDriver || {
      async navigateTab() { return true; },
      async getTab(id: number) { return { tabId: id, url: 'https://www.google.com/maps', status: 'complete' }; },
      async getTabInfo(id: number) { return { tabId: id, url: 'https://www.google.com/maps', status: 'complete' }; },
      async probeTabState() { return { ready: true, pageKind: 'SEARCH_RESULTS', confidence: 1.0, isValid: true }; }
    }) as unknown as TabNavigationDriver;
    this._tabId = params.tabId || 1;
    this._callbacks = params.callbacks || {};

    const rawPol = (params.policy || {}) as any;
    const maxRetries = rawPol.maxAttemptsPerUnit !== undefined
      ? Math.max(0, rawPol.maxAttemptsPerUnit - 1)
      : (rawPol.maxRetriesPerUnit !== undefined ? rawPol.maxRetriesPerUnit : params.plan.executionPolicy.maxRetriesPerUnit);
    const retryDelay = rawPol.delayBetweenRetriesMs !== undefined
      ? rawPol.delayBetweenRetriesMs
      : (rawPol.retryBackoffMs !== undefined ? rawPol.retryBackoffMs : params.plan.executionPolicy.retryBackoffMs);

    this._policy = {
      ...params.plan.executionPolicy,
      ...rawPol,
      maxRetriesPerUnit: maxRetries,
      retryBackoffMs: retryDelay
    };
    this._domProvider = params.domProvider || (() => (typeof document !== 'undefined' ? document : null));

    // Initialize deterministic queue with search units from plan
    this._queue = new GoogleMapsAcquisitionQueue(params.plan.searchUnits as GoogleMapsSearchUnit[]);
    this._orchestrator = new GoogleMapsNavigationOrchestrator(this._tabDriver, {
      timeoutMs: this._policy.navigationTimeoutMs,
      pollIntervalMs: 50
    });
    this._checkpointManager = new GoogleMapsCheckpointManager(
      params.storageAdapter || new InMemoryCheckpointStorage()
    );
    this._filterManager = new GoogleMapsFilterStateManager([], params.plan.initialFilter);

    // Initialize asynchronous secondary website & contact enrichment queue
    this._enrichmentQueue = new GoogleMapsEnrichmentQueue(
      this._runId,
      params.enrichmentPolicy || {},
      {
        onCandidateEnriched: (enrichedCandidate) => {
          this._deduplicator.updateCandidate(enrichedCandidate);
          this._filterManager.ingestCandidate(enrichedCandidate);
          this._notifyProgress();
        },
        onQueueProgress: () => {
          this._notifyProgress();
        },
        onDiagnostic: (diag) => {
          this._diagnostics.push(diag);
          if (this._callbacks.onDiagnostic) {
            this._callbacks.onDiagnostic(diag);
          }
        }
      },
      params.enrichmentCustomFetch
    );

    // Initialize unit execution summaries
    for (const unit of params.plan.searchUnits) {
      this._unitSummaries.set(unit.searchUnitId, {
        searchUnitId: unit.searchUnitId,
        keyword: unit.normalizedKeyword,
        location: unit.normalizedLocation,
        query: unit.normalizedQuery,
        status: 'PENDING',
        attemptCount: 0,
        elapsedMs: 0,
        candidateCount: 0,
        duplicateCount: 0
      });
    }

    this._state = 'QUEUED';
    this._lastUpdatedAt = new Date().toISOString();
  }

  // ==========================================================================
  // Public Lifecycle Controls (Start, Pause, Resume, Cancel)
  // ==========================================================================

  /**
   * Starts sequential execution of the bulk research plan.
   * Enforces single-worker concurrency guard.
   */
  public async start(): Promise<BulkRunSnapshot> {
    if (this._isExecuting || this._state === 'RUNNING') {
      return Object.assign(this.getSnapshot(), {
        success: false,
        error: `A bulk research run is already active (${this._runId})`
      }) as any;
    }
    if (this._isCancelled || this._state === 'CANCELLED') {
      throw new Error(`Cannot start a cancelled bulk research run (${this._runId})`);
    }
    if (this._state === 'COMPLETED' || this._state === 'PARTIALLY_COMPLETED') {
      throw new Error(`Cannot start an already completed bulk research run (${this._runId})`);
    }

    this._state = 'RUNNING';
    this._isPaused = false;
    this._isCancelled = false;
    this._startedAt = this._startedAt || new Date().toISOString();
    this._lastUpdatedAt = new Date().toISOString();

    await this._saveCheckpoint();
    this._notifyProgress();

    // Run sequential execution loop and await settlement
    this._executionPromise = this._runExecutionLoop().catch(err => {
      this._recordError('FATAL_RUN_ERROR', `Execution loop crashed: ${err.message || String(err)}`);
    });

    await this._executionPromise;
    return this.getSnapshot();
  }

  /**
   * Pauses the active bulk research run.
   * Ongoing SearchUnit reaches a safe boundary; no further units are claimed.
   */
  public async pause(): Promise<BulkRunSnapshot> {
    if (this._state === 'PAUSED' || this._isPaused) {
      return this.getSnapshot();
    }
    if (this._isCancelled || this._state === 'CANCELLED' || this._state === 'COMPLETED' || this._state === 'PARTIALLY_COMPLETED' || this._state === 'FAILED') {
      return this.getSnapshot();
    }

    this._isPaused = true;
    this._state = 'PAUSED';
    this._queue.pause();
    this._enrichmentQueue.pause();
    this._lastUpdatedAt = new Date().toISOString();

    // Signal active scroll engine to halt at bounded observation boundary
    if (this._activeScrollEngine) {
      try {
        this._activeScrollEngine.requestPause();
      } catch {}
    }

    if (this._currentUnit) {
      this._pausedUnitId = this._currentUnit.searchUnitId;
      const summary = this._unitSummaries.get(this._currentUnit.searchUnitId);
      if (summary && (summary.status === 'RUNNING' || summary.status === 'CLAIMED')) {
        this._unitSummaries.set(this._currentUnit.searchUnitId, {
          ...summary,
          status: 'PAUSED',
          terminationReason: 'USER_PAUSED' as any
        });
      }
    }

    await this._saveCheckpoint();
    this._notifyProgress();
    return this.getSnapshot();
  }

  /**
   * Resumes a paused bulk research run.
   */
  public async resume(): Promise<any> {
    if (this._isCancelled || this._state === 'CANCELLED') {
      return false;
    }
    if (this._state === 'COMPLETED' || this._state === 'PARTIALLY_COMPLETED' || this._state === 'FAILED') {
      return false;
    }
    if (this._state !== 'PAUSED' && !this._isPaused) {
      return this.getSnapshot();
    }

    this._isPaused = false;
    this._state = 'RUNNING';
    this._queue.resume();
    this._enrichmentQueue.resume();
    this._lastUpdatedAt = new Date().toISOString();

    if (this._pausedUnitId) {
      const summary = this._unitSummaries.get(this._pausedUnitId);
      if (summary && summary.status === 'PAUSED') {
        this._unitSummaries.set(this._pausedUnitId, {
          ...summary,
          status: 'RUNNING'
        });
      }
    }

    await this._saveCheckpoint();
    this._notifyProgress();

    // Re-kick execution loop if not currently active
    if (!this._isExecuting) {
      this._executionPromise = this._runExecutionLoop().catch(err => {
        this._recordError('FATAL_RUN_ERROR', `Execution loop crashed on resume: ${err.message || String(err)}`);
      });
      await this._executionPromise;
    }

    return this.getSnapshot();
  }

  /**
   * Idempotently cancels the bulk research run.
   * Ongoing SearchUnit halts; all pending units are marked CANCELLED.
   */
  public async cancel(reason = 'USER_CANCELLED'): Promise<BulkRunSnapshot> {
    if (this._state === 'CANCELLED' && this._isCancelled) {
      return this.getSnapshot();
    }

    this._isCancelled = true;
    this._isPaused = false;
    this._state = 'CANCELLED';
    this._terminationReason = 'USER_CANCELLED';
    this._queue.cancel();
    this._enrichmentQueue.cancel();
    this._lastUpdatedAt = new Date().toISOString();
    this._completedAt = new Date().toISOString();

    // Signal active scroll engine to cancel immediately
    if (this._activeScrollEngine) {
      try {
        this._activeScrollEngine.requestCancel();
      } catch {}
    }

    // Mark current unit cancelled only if not completed/failed
    if (this._currentUnit) {
      const summary = this._unitSummaries.get(this._currentUnit.searchUnitId);
      if (summary && summary.status !== 'COMPLETED' && summary.status !== 'FAILED') {
        this._unitSummaries.set(this._currentUnit.searchUnitId, {
          ...summary,
          status: 'CANCELLED',
          completedAt: new Date().toISOString(),
          terminationReason: 'USER_CANCELLED'
        });
      }
    }

    // Mark all remaining pending units cancelled
    for (const [id, summary] of this._unitSummaries.entries()) {
      if (summary.status === 'PENDING' || summary.status === 'CLAIMED' || summary.status === 'PAUSED') {
        this._unitSummaries.set(id, {
          ...summary,
          status: 'CANCELLED',
          completedAt: new Date().toISOString(),
          terminationReason: 'USER_CANCELLED'
        });
      }
    }

    await this._saveCheckpoint();
    this._notifyProgress();
    return this.getSnapshot();
  }

  // ==========================================================================
  // Filter Integration (Post-Acquisition / View Layer)
  // ==========================================================================

  public getFilterManager(): GoogleMapsFilterStateManager {
    return this._filterManager;
  }

  // ==========================================================================
  // Snapshots & Metrics
  // ==========================================================================

  public getMetrics(): BulkRunMetrics {
    let completedUnits = 0;
    let failedUnits = 0;
    let cancelledUnits = 0;
    let runningUnits = 0;
    let queuedUnits = 0;
    let blockedUnits = 0;
    let retryingUnits = 0;

    for (const summary of this._unitSummaries.values()) {
      if (summary.attemptCount > 1 || summary.status === 'RETRY_PENDING') {
        retryingUnits++;
      }
      switch (summary.status) {
        case 'COMPLETED': completedUnits++; break;
        case 'FAILED': failedUnits++; break;
        case 'CANCELLED': cancelledUnits++; break;
        case 'RUNNING': runningUnits++; break;
        case 'CLAIMED':
        case 'PENDING':
        case 'PAUSED':
        case 'RETRY_PENDING': queuedUnits++; break;
        case 'BLOCKED': blockedUnits++; break;
      }
    }

    const filteredView = this._filterManager.getFilteredView();
    const enrichmentSnap = this._enrichmentQueue.getSnapshot();

    return {
      totalSearchUnits: this._plan.totalUnits,
      queuedUnits,
      runningUnits,
      completedUnits,
      failedUnits,
      retryingUnits,
      cancelledUnits,
      blockedUnits,
      rawCandidateObservations: this._rawCandidateObservations,
      uniqueCandidateCount: this._deduplicator.size,
      duplicateObservationCount: this._duplicateObservationCount,
      currentFilteredMatchCount: filteredView.matchingCount,
      eligibleForEnrichment: enrichmentSnap.totalEligible,
      enrichmentQueued: enrichmentSnap.queued,
      enrichmentRunning: enrichmentSnap.running,
      enrichmentCompleted: enrichmentSnap.completed,
      enrichmentPartial: enrichmentSnap.partial,
      enrichmentFailed: enrichmentSnap.failed,
      enrichmentBlocked: enrichmentSnap.blocked,
      enrichmentSkipped: enrichmentSnap.skipped,
      enrichmentDeferred: enrichmentSnap.deferred,
      emailsFound: enrichmentSnap.emailsFound || undefined,
      phonesFound: enrichmentSnap.phonesFound || undefined,
      personsFound: enrichmentSnap.personsFound || undefined
    };
  }

  public verifyRunInvariants(): { valid: boolean; sum: number; total: number; details: Record<string, number> } {
    const metrics = this.getMetrics();
    const terminalCount = metrics.completedUnits + metrics.failedUnits + metrics.cancelledUnits;
    const nonTerminalCount = Array.from(this._unitSummaries.values())
      .filter(s => s.status === 'PENDING' || s.status === 'CLAIMED' || s.status === 'RUNNING' || s.status === 'PAUSED' || s.status === 'RETRY_PENDING' || s.status === 'BLOCKED')
      .length;
    const sum = terminalCount + nonTerminalCount;
    const valid = sum === metrics.totalSearchUnits &&
      metrics.completedUnits <= metrics.totalSearchUnits &&
      metrics.failedUnits <= metrics.totalSearchUnits &&
      metrics.cancelledUnits <= metrics.totalSearchUnits;
    return {
      valid,
      sum,
      total: metrics.totalSearchUnits,
      details: {
        completed: metrics.completedUnits,
        failed: metrics.failedUnits,
        cancelled: metrics.cancelledUnits,
        queued: metrics.queuedUnits,
        running: metrics.runningUnits,
        retrying: metrics.retryingUnits,
        blocked: metrics.blockedUnits
      }
    };
  }

  public setFilter(criteria: any): void {
    if (criteria.ratingFilter !== undefined) {
      this._filterManager.setRatingFilter(criteria.ratingFilter);
    } else if (criteria.rating !== undefined) {
      this._filterManager.setRatingFilter(criteria.rating);
    }
    if (criteria.websiteFilter !== undefined) {
      this._filterManager.setWebsiteFilter(criteria.websiteFilter);
    } else if (criteria.website !== undefined) {
      this._filterManager.setWebsiteFilter(criteria.website);
    }
    this._notifyProgress();
  }

  public ingestCandidate(cand: GoogleMapsCandidateObservation): void {
    this._rawCandidateObservations++;
    const dedupeResult = this._deduplicator.register(cand);
    if (!dedupeResult.isNew) {
      this._duplicateObservationCount++;
    }
    this._filterManager.ingestCandidate(dedupeResult.candidate);

    // Asynchronously enqueue into enrichment queue (non-blocking)
    if (dedupeResult.candidate && 'websiteUrl' in dedupeResult.candidate) {
      this._enrichmentQueue.enqueue(dedupeResult.candidate as SessionCandidate);
    }

    this._notifyProgress();
  }

  public getEnrichmentQueue(): GoogleMapsEnrichmentQueue {
    return this._enrichmentQueue;
  }

  public getEnrichmentSnapshot(): EnrichmentQueueSnapshot {
    return this._enrichmentQueue.getSnapshot();
  }

  public setEnrichmentCustomFetch(fetcher: (url: string, timeoutMs: number) => Promise<{ status: number; html: string; headers?: Record<string, string>; location?: string; redirectUrl?: string }>): void {
    this._enrichmentQueue.setCustomFetch(fetcher);
  }

  public getSessionDataset(): readonly GoogleMapsCandidateObservation[] {
    return this._filterManager.getRawDataset();
  }

  public getQualitySnapshot(): import('./candidateIdentityTypes.ts').DataQualitySnapshot {
    return this._deduplicator.getQualitySnapshot();
  }

  public getPotentialDuplicates(): readonly import('./candidateIdentityTypes.ts').DuplicateRelationship[] {
    return this._deduplicator.getPotentialDuplicates();
  }

  public getIdentityConflicts(): readonly import('./candidateIdentityTypes.ts').DuplicateRelationship[] {
    return this._deduplicator.getIdentityConflicts();
  }

  public get deduplicator(): SessionCandidateDeduplicator {
    return this._deduplicator;
  }

  public get queue(): GoogleMapsAcquisitionQueue {
    return this._queue;
  }

  public get enrichmentQueue(): GoogleMapsEnrichmentQueue {
    return this._enrichmentQueue;
  }

  public resetSearchUnitState(): void {
    if (this._activeScrollEngine) {
      this._activeScrollEngine = undefined;
    }
  }

  public isCancelled(): boolean {
    return this._isCancelled;
  }

  public createCheckpoint(): BulkExecutionCheckpoint {
    const metrics = this.getMetrics();
    const summariesArray = Array.from(this._unitSummaries.values());

    return {
      checkpointId: `bcp_${hashStringDeterministic(this._runId + this._lastUpdatedAt)}`,
      runId: this._runId,
      planId: this._plan.planId,
      planFingerprint: this._plan.planFingerprint,
      schemaVersion: BULK_PLAN_SCHEMA_VERSION,
      engineVersion: ENGINE_ADAPTER_VERSION,
      timestamp: this._lastUpdatedAt,
      state: this._state,
      terminationReason: this._terminationReason,
      currentSearchUnitId: this._currentUnit?.searchUnitId || this._pausedUnitId,
      currentQueueIndex: metrics.completedUnits + metrics.failedUnits,
      tabId: this._tabId,
      activeFilter: this._filterManager.getActiveFilter(),
      metrics,
      unitSummaries: summariesArray,
      startedAt: this._startedAt,
      lastUpdatedAt: this._lastUpdatedAt,
      diagnosticsSummary: {
        warningCount: this._diagnostics.filter(d => d.severity === 'P2').length,
        errorCount: this._diagnostics.filter(d => d.severity === 'P0' || d.severity === 'P1').length,
        lastErrorCode: this._diagnostics[this._diagnostics.length - 1]?.code
      }
    };
  }

  public restoreFromCheckpoint(cp: BulkExecutionCheckpoint): boolean {
    if (!cp || typeof cp !== 'object') return false;
    if (cp.schemaVersion !== BULK_PLAN_SCHEMA_VERSION) {
      this._recordDiagnostic({
        code: 'INCOMPATIBLE_ADAPTER_VERSION',
        severity: 'P1',
        recoveryClass: 'TERMINAL',
        message: `Incompatible checkpoint schema version: ${cp.schemaVersion}`,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    if (cp.planFingerprint !== this._plan.planFingerprint) {
      this._recordDiagnostic({
        code: 'STALE_METADATA',
        severity: 'P1',
        recoveryClass: 'TERMINAL',
        message: `Checkpoint plan fingerprint mismatch: ${cp.planFingerprint} !== ${this._plan.planFingerprint}`,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    this._runId = cp.runId || this._runId;
    this._state = cp.state;
    this._terminationReason = cp.terminationReason;
    if (cp.activeFilter) {
      this._filterManager.setFilter(cp.activeFilter);
    }
    return true;
  }

  public async _executeLoop(): Promise<void> {
    return this._runExecutionLoop();
  }

  public getSnapshot(): BulkRunSnapshot {
    const metrics = this.getMetrics();
    const progressPercent = metrics.totalSearchUnits > 0
      ? Math.round(((metrics.completedUnits + metrics.failedUnits + metrics.cancelledUnits) / metrics.totalSearchUnits) * 100)
      : 0;

    const activeUnitObj = this._currentUnit || (this._pausedUnitId ? this._plan.searchUnits.find(u => u.searchUnitId === this._pausedUnitId) : undefined);
    const currentUnitSummary = activeUnitObj
      ? this._unitSummaries.get(activeUnitObj.searchUnitId)
      : undefined;

    let currentUnitInfo: BulkRunSnapshot['currentSearchUnit'] = undefined;
    if (activeUnitObj && currentUnitSummary) {
      const allUnits = this._plan.searchUnits;
      const unitIndex = allUnits.findIndex(u => u.searchUnitId === activeUnitObj.searchUnitId) + 1;
      currentUnitInfo = {
        searchUnitId: activeUnitObj.searchUnitId,
        keyword: activeUnitObj.normalizedKeyword,
        location: activeUnitObj.normalizedLocation,
        query: activeUnitObj.normalizedQuery,
        unitIndex: unitIndex > 0 ? unitIndex : 1,
        totalUnits: this._plan.totalUnits,
        status: currentUnitSummary.status,
        attemptCount: currentUnitSummary.attemptCount
      };
    }

    return {
      runId: this._runId,
      planId: this._plan.planId,
      state: this._state,
      terminationReason: this._terminationReason,
      currentSearchUnit: currentUnitInfo,
      currentUnit: currentUnitInfo,
      totalUnits: this._plan.totalUnits,
      completedUnits: metrics.completedUnits,
      failedUnits: metrics.failedUnits,
      cancelledUnits: metrics.cancelledUnits,
      pendingUnits: metrics.queuedUnits,
      progress: {
        unitsCompleted: metrics.completedUnits,
        totalUnits: this._plan.totalUnits,
        percent: progressPercent
      },
      progressPercent,
      metrics,
      activeFilter: this._filterManager.getActiveFilter(),
      filterSnapshot: {
        ...this._filterManager.getActiveFilter(),
        ratingFilter: this._filterManager.getActiveFilter().rating,
        websiteFilter: this._filterManager.getActiveFilter().website
      } as any,
      isPausable: this._state === 'RUNNING',
      isResumable: this._state === 'PAUSED',
      isCancellable: this._state === 'RUNNING' || this._state === 'PAUSED' || this._state === 'QUEUED',
      startedAt: this._startedAt,
      lastUpdatedAt: this._lastUpdatedAt,
      completedAt: this._completedAt,
      diagnostics: [...this._diagnostics],
      enrichmentSnapshot: this._enrichmentQueue.getSnapshot()
    };
  }

  // ==========================================================================
  // Core Sequential Execution Loop
  // ==========================================================================

  private async _runExecutionLoop(): Promise<void> {
    if (this._isExecuting) {
      return; // Concurrency guard: already running
    }
    this._isExecuting = true;

    try {
      while (!this._isPaused && !this._isCancelled) {
        // Enforce run-level maximum duration budget
        const elapsedRunMs = Date.now() - new Date(this._startedAt).getTime();
        if (elapsedRunMs > this._policy.maxRunDurationMs) {
          this._terminationReason = 'TIME_LIMIT_REACHED';
          this._recordDiagnostic({
            code: 'OBSERVATION_TIMEOUT',
            severity: 'P1',
            recoveryClass: 'TERMINAL',
            message: `Bulk run duration exceeded limit of ${this._policy.maxRunDurationMs}ms`,
            timestamp: new Date().toISOString()
          });
          break;
        }

        // Enforce plan maxResults limit if configured
        if (
          this._plan.maxResults !== undefined &&
          this._filterManager.getFilteredView().matchingCount >= this._plan.maxResults
        ) {
          this._terminationReason = 'PLAN_LIMIT_REACHED';
          break;
        }

        // Atomic queue claim: if there is an active SearchUnit that was paused mid-flight, resume that unit first
        let unit: GoogleMapsSearchUnit | null = null;
        if (this._pausedUnitId) {
          unit = this._plan.searchUnits.find(u => u.searchUnitId === this._pausedUnitId) || null;
          this._pausedUnitId = undefined;
        }

        if (!unit) {
          unit = this._queue.claimNext();
        }

        if (!unit) {
          break; // Queue exhausted or paused
        }

        this._currentUnit = unit;
        await this._executeSingleSearchUnit(unit);
        this._currentUnit = undefined;
      }
    } finally {
      this._isExecuting = false;
      this._evaluateRunCompletion();
    }
  }

  /**
   * Executes a single claimed SearchUnit in the dedicated browser tab.
   */
  private async _executeSingleSearchUnit(unit: GoogleMapsSearchUnit): Promise<void> {
    const summary = this._unitSummaries.get(unit.searchUnitId) || {
      searchUnitId: unit.searchUnitId,
      keyword: unit.normalizedKeyword,
      location: unit.normalizedLocation,
      query: unit.normalizedQuery,
      status: 'PENDING',
      attemptCount: 0,
      elapsedMs: 0,
      candidateCount: 0,
      duplicateCount: 0
    };

    summary.attemptCount++;
    summary.status = 'RUNNING';
    summary.startedAt = summary.startedAt || new Date().toISOString();
    this._currentUnitSummary = summary;
    this._unitSummaries.set(unit.searchUnitId, summary);

    const allUnits = this._plan.searchUnits;
    const unitIndex = allUnits.findIndex(u => u.searchUnitId === unit.searchUnitId) + 1;
    const onStart = this._callbacks.onSearchUnitStarted || this._callbacks.onUnitStarted;
    if (onStart) {
      onStart(unit, unitIndex, this._plan.totalUnits);
    }
    this._notifyProgress();

    if (this._isCancelled || this._state === 'CANCELLED') {
      return;
    }

    if (this._isPaused || this._state === 'PAUSED') {
      summary.status = 'PAUSED';
      summary.terminationReason = 'USER_PAUSED' as any;
      this._pausedUnitId = unit.searchUnitId;
      this._unitSummaries.set(unit.searchUnitId, summary);
      return;
    }

    const startTime = Date.now();

    try {
      // 1. Validate dedicated tab ownership
      const tabOwnership = await this._orchestrator.validateTabOwnership(this._tabId, this._runId);
      if (!tabOwnership.valid) {
        throw new Error(tabOwnership.diagnostic?.message || 'Dedicated acquisition tab ownership lost');
      }

      if (this._isPaused || (this._state as any) === 'PAUSED') {
        summary.status = 'PAUSED';
        summary.terminationReason = 'USER_PAUSED' as any;
        this._pausedUnitId = unit.searchUnitId;
        this._unitSummaries.set(unit.searchUnitId, summary);
        return;
      }

      // 2. Navigate to SearchUnit URL
      const navResult = await this._orchestrator.navigateToSearchUnit(
        this._tabId,
        unit,
        this._runId
      );

      if (!navResult.success) {
        throw new Error(navResult.error || 'Navigation to Google Maps search failed');
      }

      if (this._isPaused || (this._state as any) === 'PAUSED') {
        summary.status = 'PAUSED';
        summary.terminationReason = 'USER_PAUSED' as any;
        this._pausedUnitId = unit.searchUnitId;
        this._unitSummaries.set(unit.searchUnitId, summary);
        return;
      }

      // 3. Execute Part 2 feed scrolling & candidate extraction
      const scrollResult = await this._executeFeedScrolling(unit);

      if (this._isCancelled) {
        return;
      }

      if (this._isPaused || (this._state as any) === 'PAUSED' || scrollResult.terminationReason === 'USER_PAUSED') {
        summary.status = 'PAUSED';
        summary.terminationReason = 'USER_PAUSED' as any;
        summary.elapsedMs += (Date.now() - startTime);
        summary.candidateCount = scrollResult.candidatesCount;
        this._pausedUnitId = unit.searchUnitId;
        this._unitSummaries.set(unit.searchUnitId, summary);
        return;
      }

      // 4. Mark SearchUnit Completed
      summary.status = 'COMPLETED';
      summary.completedAt = new Date().toISOString();
      summary.elapsedMs += (Date.now() - startTime);
      summary.candidateCount = scrollResult.candidatesCount;
      summary.terminationReason = (scrollResult.terminationReason as SearchUnitTerminationReason) || 'EXHAUSTED';

      this._queue.complete(unit.searchUnitId, scrollResult.candidatesCount);
      this._unitSummaries.set(unit.searchUnitId, summary);

      const onComp = this._callbacks.onSearchUnitCompleted || this._callbacks.onUnitCompleted;
      if (onComp) {
        onComp(unit, summary);
      }
    } catch (err: any) {
      if (this._isCancelled) {
        return;
      }
      summary.elapsedMs += (Date.now() - startTime);
      const isTransient = this._isTransientError(err.message || String(err));
      const maxAttempts = (this._policy as any).maxAttemptsPerUnit || (this._policy.maxRetriesPerUnit + 1);

      if (isTransient && summary.attemptCount < maxAttempts && !this._isCancelled) {
        // Bounded retry with backoff
        summary.status = 'RETRY_PENDING';
        summary.lastError = err.message || String(err);
        this._unitSummaries.set(unit.searchUnitId, summary);

        this._recordDiagnostic({
          code: 'NAVIGATION_TIMEOUT',
          severity: 'P2',
          recoveryClass: 'RETRYABLE',
          message: `SearchUnit ${unit.normalizedQuery} failed attempt ${summary.attemptCount}. Scheduling retry. Error: ${err.message}`,
          timestamp: new Date().toISOString(),
          searchUnitId: unit.searchUnitId
        });

        // Fail in queue to trigger retry or terminal failure
        this._queue.fail(unit.searchUnitId, err.message || String(err));

        // Deterministic backoff delay
        if (this._policy.retryBackoffMs > 0) {
          await new Promise(resolve => setTimeout(resolve, this._policy.retryBackoffMs * summary.attemptCount));
        }
      } else {
        // Terminal failure for this SearchUnit (isolated from the rest of the queue)
        summary.status = 'FAILED';
        summary.completedAt = new Date().toISOString();
        summary.lastError = err.message || String(err);
        summary.terminationReason = summary.attemptCount >= maxAttempts ? 'RETRY_EXHAUSTED' : 'ERROR';
        this._unitSummaries.set(unit.searchUnitId, summary);

        this._queue.fail(unit.searchUnitId, err.message || String(err));
        const onFailed = this._callbacks.onSearchUnitFailed || this._callbacks.onUnitFailed;
        if (onFailed) {
          onFailed(unit, summary);
        }
        this._recordDiagnostic({
          code: 'CANDIDATE_OBSERVATION_FAILED',
          severity: 'P1',
          recoveryClass: 'RECOVERABLE',
          message: `SearchUnit ${unit.normalizedQuery} failed terminally: ${err.message}`,
          timestamp: new Date().toISOString(),
          searchUnitId: unit.searchUnitId
        });
      }
    } finally {
      // 5. Clean up unit-local resources at the unit boundary
      this._cleanupUnitResources();
      await this._saveCheckpoint();
      this._notifyProgress();
    }
  }

  /**
   * Executes feed scroll engine on the active tab and collects candidate observations.
   */
  private async _executeFeedScrolling(unit: GoogleMapsSearchUnit): Promise<{
    candidatesCount: number;
    terminationReason: string;
  }> {
    return new Promise((resolve, reject) => {
      let unitObservedCount = 0;

      const engine = new GoogleMapsFeedScrollEngine(
        this._domProvider,
        {
          sessionId: this._runId,
          searchUnitId: unit.searchUnitId,
          searchKeyword: unit.normalizedKeyword,
          searchLocation: unit.normalizedLocation,
          pageUrl: unit.navigationUrl
        },
        {
          maxCandidates: this._policy.maxCandidatesPerUnit,
          maxScrollSteps: this._policy.maxScrollStepsPerUnit,
          maxDurationMs: this._policy.maxDurationPerUnitMs
        },
        {
          onNewCandidates: (newCandidates) => {
            unitObservedCount += newCandidates.length;
            this._rawCandidateObservations += newCandidates.length;

            // Ingest into session filter manager for real-time filtered view
            this._filterManager.ingestCandidates(newCandidates);

            // Asynchronously enqueue into website enrichment queue (non-blocking)
            for (const cand of newCandidates) {
              if (cand && 'websiteUrl' in cand) {
                this._enrichmentQueue.enqueue(cand as SessionCandidate);
              }
            }

            if (this._callbacks.onCandidateBatch) {
              this._callbacks.onCandidateBatch(newCandidates);
            }
            this._notifyProgress();

            if (
              this._plan.maxResults !== undefined &&
              this._filterManager.getFilteredView().matchingCount >= this._plan.maxResults
            ) {
              if (this._activeScrollEngine) {
                this._activeScrollEngine.requestCancel();
              }
            }
          },
          onBatchCompleted: () => {},
          isPaused: () => this._isPaused,
          isCancelled: () => this._isCancelled,
          onDiagnostic: (diag) => {
            this._diagnostics.push(diag);
            if (this._callbacks.onDiagnostic) {
              this._callbacks.onDiagnostic(diag);
            }
          }
        },
        this._deduplicator
      );

      this._activeScrollEngine = engine;

      engine.startScrollLoop()
        .then(result => {
          this._activeScrollEngine = undefined;
          resolve({
            candidatesCount: unitObservedCount,
            terminationReason: result.terminationReason || 'EXHAUSTED'
          });
        })
        .catch(err => {
          this._activeScrollEngine = undefined;
          reject(err);
        });
    });
  }

  /**
   * Cleans up unit-local state (disconnects observers, clears timers).
   * Preserves session-level deduplication and filter manager.
   */
  private _cleanupUnitResources(): void {
    if (this._activeScrollEngine) {
      try {
        this._activeScrollEngine.cleanup();
      } catch {
        // Safe cleanup
      }
      this._activeScrollEngine = undefined;
    }
  }

  private _isTransientError(msg: string): boolean {
    const lower = msg.toLowerCase();
    if (lower.includes('closed') || lower.includes('tab not found') || lower.includes('ownership lost') || lower.includes('inaccessible')) {
      return false; // Tab closure / detachment is non-transient; halts without blind retry
    }
    return (
      lower.includes('timeout') ||
      lower.includes('stalled') ||
      lower.includes('loading') ||
      lower.includes('temporary') ||
      lower.includes('surface not found')
    );
  }

  private _evaluateRunCompletion(): void {
    if (this._isCancelled || this._state === 'CANCELLED') {
      return;
    }
    if (this._isPaused || this._state === 'PAUSED') {
      return;
    }

    const q = this._queue.getProgress();
    if (q.queued === 0 && q.inProgress === 0) {
      this._completedAt = new Date().toISOString();
      if (q.failed > 0 && q.completed === 0) {
        this._state = 'FAILED';
        this._terminationReason = 'PARTIAL_FAILURE';
      } else if (q.failed > 0) {
        this._state = 'PARTIALLY_COMPLETED';
        this._terminationReason = 'PARTIAL_FAILURE';
      } else if (q.cancelled > 0 && q.completed === 0) {
        this._state = 'CANCELLED';
        this._terminationReason = 'USER_CANCELLED';
      } else {
        this._state = 'COMPLETED';
        this._terminationReason = 'ALL_UNITS_COMPLETED';
      }

      this._lastUpdatedAt = new Date().toISOString();
      this._saveCheckpoint().catch(() => {});
      const snapshot = this.getSnapshot();
      if (this._callbacks.onRunCompleted) {
        this._callbacks.onRunCompleted(snapshot);
      }
      this._notifyProgress();
    }
  }

  // ==========================================================================
  // Checkpoints & Metadata Persistence (Firewall Compliant)
  // ==========================================================================

  private async _saveCheckpoint(): Promise<void> {
    const metrics = this.getMetrics();
    const qProgress = this._queue.getProgress();

    const summariesArray = Array.from(this._unitSummaries.values());

    const checkpoint: BulkExecutionCheckpoint = {
      checkpointId: `bcp_${hashStringDeterministic(this._runId + this._lastUpdatedAt)}`,
      runId: this._runId,
      planId: this._plan.planId,
      planFingerprint: this._plan.planFingerprint,
      schemaVersion: BULK_PLAN_SCHEMA_VERSION,
      engineVersion: ENGINE_ADAPTER_VERSION,
      timestamp: this._lastUpdatedAt,
      state: this._state,
      terminationReason: this._terminationReason,
      currentSearchUnitId: this._currentUnit?.searchUnitId,
      currentQueueIndex: metrics.completedUnits + metrics.failedUnits,
      tabId: this._tabId,
      activeFilter: this._filterManager.getActiveFilter(),
      metrics,
      unitSummaries: summariesArray,
      startedAt: this._startedAt,
      lastUpdatedAt: this._lastUpdatedAt,
      diagnosticsSummary: {
        warningCount: this._diagnostics.filter(d => d.severity === 'P2').length,
        errorCount: this._diagnostics.filter(d => d.severity === 'P0' || d.severity === 'P1').length,
        lastErrorCode: this._diagnostics[this._diagnostics.length - 1]?.code
      }
    };

    // Store execution metadata ONLY
    if (this._currentUnit) {
      await this._checkpointManager.createCheckpoint({
        sessionId: this._runId,
        searchUnit: this._currentUnit,
        state: this._state === 'PAUSED' ? 'PAUSED' : 'OBSERVING',
        pageUrl: this._currentUnit.navigationUrl,
        progress: {
          totalUnits: this._plan.totalUnits,
          completedUnits: metrics.completedUnits,
          pendingUnits: metrics.queuedUnits
        }
      });
    }
  }

  private _recordDiagnostic(diag: GoogleMapsAcquisitionDiagnostic): void {
    this._diagnostics.push(diag);
    if (this._callbacks.onDiagnostic) {
      this._callbacks.onDiagnostic(diag);
    }
  }

  private _recordError(reason: BulkRunTerminationReason, msg: string): void {
    this._state = 'FAILED';
    this._terminationReason = reason;
    this._completedAt = new Date().toISOString();
    this._recordDiagnostic({
      code: 'INVALID_STATE_TRANSITION',
      severity: 'P0',
      recoveryClass: 'TERMINAL',
      message: msg,
      timestamp: new Date().toISOString()
    });
    this._notifyProgress();
  }

  private _notifyProgress(): void {
    if (this._callbacks.onProgress) {
      this._callbacks.onProgress(this.getSnapshot());
    }
  }
}
