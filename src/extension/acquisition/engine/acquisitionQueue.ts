/**
 * LeadNoria — Google Maps Acquisition Queue
 * Deterministic Search-Unit Queue & Single-Worker Concurrency Guard
 *
 * Invariants:
 * - Deterministic, FIFO processing of search units.
 * - Single active acquisition worker guarantee (no parallel Maps tabs).
 * - Automatic duplicate suppression by searchUnitId during enqueue.
 * - Supports bounded retries before marking unit as terminal FAILED.
 * - Pause, resume, and cancel semantics for queue lifecycle.
 */

import type {
  GoogleMapsSearchUnit,
  SearchUnitStatus,
  GoogleMapsAcquisitionDiagnostic
} from './types.ts';

export interface QueueProgressMetrics {
  total: number;
  planned: number;
  queued: number;
  inProgress: number;
  completed: number;
  failed: number;
  cancelled: number;
  activeUnitId?: string;
  isPaused: boolean;
  isCancelled: boolean;
}

export class GoogleMapsAcquisitionQueue {
  private readonly _units: Map<string, GoogleMapsSearchUnit> = new Map();
  private readonly _order: string[] = [];
  private _activeUnitId: string | null = null;
  private _isPaused = false;
  private _isCancelled = false;

  constructor(initialUnits: GoogleMapsSearchUnit[] = []) {
    this.enqueue(initialUnits);
  }

  /**
   * Enqueues one or more search units, suppressing duplicates deterministically.
   * Returns the count of newly accepted units.
   */
  public enqueue(
    units: GoogleMapsSearchUnit | GoogleMapsSearchUnit[]
  ): { accepted: number; duplicatesSuppressed: number } {
    if (this._isCancelled) {
      throw new Error('Cannot enqueue into a cancelled acquisition queue');
    }

    const arr = Array.isArray(units) ? units : [units];
    let accepted = 0;
    let duplicatesSuppressed = 0;

    for (const u of arr) {
      if (this._units.has(u.searchUnitId)) {
        duplicatesSuppressed++;
        continue;
      }
      u.status = 'QUEUED';
      this._units.set(u.searchUnitId, u);
      this._order.push(u.searchUnitId);
      accepted++;
    }

    return { accepted, duplicatesSuppressed };
  }

  /**
   * Returns the currently active Search Unit if any.
   */
  public getActiveUnit(): GoogleMapsSearchUnit | null {
    if (!this._activeUnitId) return null;
    return this._units.get(this._activeUnitId) ?? null;
  }

  /**
   * Claims the next QUEUED search unit for execution.
   * Enforces single-active-worker constraint: returns null if a unit is already active,
   * or if the queue is paused or cancelled.
   */
  public claimNext(): GoogleMapsSearchUnit | null {
    if (this._isPaused || this._isCancelled) {
      return null;
    }

    if (this._activeUnitId) {
      // Worker busy: cannot claim multiple units in parallel
      return null;
    }

    for (const id of this._order) {
      const u = this._units.get(id);
      if (u && (u.status === 'QUEUED' || u.status === 'PLANNED')) {
        u.status = 'IN_PROGRESS';
        u.startedAt = new Date().toISOString();
        this._activeUnitId = u.searchUnitId;
        return u;
      }
    }

    return null;
  }

  /**
   * Marks the specified search unit as COMPLETED.
   */
  public complete(searchUnitId: string, candidateCount = 0): boolean {
    const u = this._units.get(searchUnitId);
    if (!u) return false;

    u.status = 'COMPLETED';
    u.candidateCount = candidateCount;
    u.completedAt = new Date().toISOString();

    if (this._activeUnitId === searchUnitId) {
      this._activeUnitId = null;
    }
    return true;
  }

  /**
   * Records a failure for a search unit, automatically retrying if within maxRetries budget.
   */
  public fail(
    searchUnitId: string,
    error: string,
    diagnostic?: GoogleMapsAcquisitionDiagnostic
  ): { retried: boolean; terminal: boolean } {
    const u = this._units.get(searchUnitId);
    if (!u) return { retried: false, terminal: false };

    u.lastError = error;
    if (diagnostic) {
      u.diagnostics.push(diagnostic);
    }

    if (this._activeUnitId === searchUnitId) {
      this._activeUnitId = null;
    }

    if (u.retryCount < u.maxRetries && !this._isCancelled) {
      u.retryCount++;
      u.status = 'QUEUED'; // Re-queue for retry
      return { retried: true, terminal: false };
    }

    u.status = 'FAILED';
    u.completedAt = new Date().toISOString();
    return { retried: false, terminal: true };
  }

  /**
   * Pauses the queue. Ongoing unit is preserved in IN_PROGRESS or PAUSED.
   */
  public pause(): void {
    this._isPaused = true;
    if (this._activeUnitId) {
      const u = this._units.get(this._activeUnitId);
      if (u) u.status = 'PAUSED';
    }
  }

  /**
   * Resumes the queue.
   */
  public resume(): void {
    if (this._isCancelled) {
      throw new Error('Cannot resume a cancelled queue');
    }
    this._isPaused = false;
    if (this._activeUnitId) {
      const u = this._units.get(this._activeUnitId);
      if (u && u.status === 'PAUSED') u.status = 'IN_PROGRESS';
    }
  }

  /**
   * Cancels the queue, terminating remaining queued units.
   */
  public cancel(): void {
    this._isCancelled = true;
    for (const u of this._units.values()) {
      if (u.status === 'QUEUED' || u.status === 'PLANNED' || u.status === 'IN_PROGRESS' || u.status === 'PAUSED') {
        u.status = 'CANCELLED';
        u.completedAt = new Date().toISOString();
      }
    }
    this._activeUnitId = null;
  }

  /**
   * Returns current queue progress breakdown.
   */
  public getProgress(): QueueProgressMetrics {
    let planned = 0;
    let queued = 0;
    let inProgress = 0;
    let completed = 0;
    let failed = 0;
    let cancelled = 0;

    for (const u of this._units.values()) {
      switch (u.status) {
        case 'PLANNED': planned++; break;
        case 'QUEUED': queued++; break;
        case 'IN_PROGRESS':
        case 'PAUSED': inProgress++; break;
        case 'COMPLETED': completed++; break;
        case 'FAILED': failed++; break;
        case 'CANCELLED': cancelled++; break;
      }
    }

    return {
      total: this._units.size,
      planned,
      queued,
      inProgress,
      completed,
      failed,
      cancelled,
      activeUnitId: this._activeUnitId ?? undefined,
      isPaused: this._isPaused,
      isCancelled: this._isCancelled
    };
  }

  public getUnit(searchUnitId: string): GoogleMapsSearchUnit | undefined {
    return this._units.get(searchUnitId);
  }

  public getAllUnits(): GoogleMapsSearchUnit[] {
    return this._order.map(id => this._units.get(id)!).filter(Boolean);
  }
}
