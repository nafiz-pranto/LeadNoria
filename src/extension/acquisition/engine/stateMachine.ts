/**
 * LeadNoria — Google Maps Acquisition State Machine
 * Deterministic Transition Enforcement & Lifecycle Audit
 *
 * Invariants:
 * - Only strictly legal transitions are permitted.
 * - Illegal transitions throw IllegalStateTransitionError.
 * - Pause and Cancel operations are idempotent.
 * - Resume from CANCELLED is rejected.
 * - Full audit trail of state transitions is preserved for diagnostics.
 */

import type {
  GoogleMapsAcquisitionState,
  StateTransitionEvent
} from './types.ts';

export class IllegalStateTransitionError extends Error {
  readonly fromState: GoogleMapsAcquisitionState;
  readonly toState: GoogleMapsAcquisitionState;
  readonly reason?: string;

  constructor(fromState: GoogleMapsAcquisitionState, toState: GoogleMapsAcquisitionState, reason?: string) {
    super(
      `Illegal Google Maps acquisition state transition: cannot transition from '${fromState}' to '${toState}'${
        reason ? ` (reason: ${reason})` : ''
      }`
    );
    this.name = 'IllegalStateTransitionError';
    this.fromState = fromState;
    this.toState = toState;
    this.reason = reason;
  }
}

/**
 * Authoritative Map of Legal Transitions
 */
export const LEGAL_TRANSITIONS: Record<GoogleMapsAcquisitionState, ReadonlySet<GoogleMapsAcquisitionState>> = {
  IDLE: new Set<GoogleMapsAcquisitionState>(['QUEUED', 'STARTING', 'CANCELLED']),
  QUEUED: new Set<GoogleMapsAcquisitionState>(['STARTING', 'PAUSED', 'CANCELLED']),
  STARTING: new Set<GoogleMapsAcquisitionState>(['NAVIGATING', 'FAILED', 'CANCELLED', 'BLOCKED']),
  NAVIGATING: new Set<GoogleMapsAcquisitionState>(['OBSERVING', 'PAUSED', 'FAILED', 'CANCELLED', 'BLOCKED']),
  OBSERVING: new Set<GoogleMapsAcquisitionState>(['NAVIGATING', 'PAUSED', 'COMPLETING', 'FAILED', 'CANCELLED', 'BLOCKED']),
  PAUSED: new Set<GoogleMapsAcquisitionState>(['STARTING', 'NAVIGATING', 'OBSERVING', 'CANCELLED']),
  COMPLETING: new Set<GoogleMapsAcquisitionState>(['COMPLETED', 'FAILED']),
  COMPLETED: new Set<GoogleMapsAcquisitionState>(['IDLE']),
  CANCELLED: new Set<GoogleMapsAcquisitionState>(['IDLE']),
  FAILED: new Set<GoogleMapsAcquisitionState>(['IDLE']),
  BLOCKED: new Set<GoogleMapsAcquisitionState>(['IDLE'])
};

export class GoogleMapsStateMachine {
  private _state: GoogleMapsAcquisitionState;
  private readonly _sessionId: string;
  private _currentSearchUnitId?: string;
  private _pausedFromState: GoogleMapsAcquisitionState | null = null;
  private readonly _history: StateTransitionEvent[] = [];

  constructor(sessionId: string, initialState: GoogleMapsAcquisitionState = 'IDLE') {
    this._sessionId = sessionId;
    this._state = initialState;
  }

  public get state(): GoogleMapsAcquisitionState {
    return this._state;
  }

  public get sessionId(): string {
    return this._sessionId;
  }

  public get currentSearchUnitId(): string | undefined {
    return this._currentSearchUnitId;
  }

  public get pausedFromState(): GoogleMapsAcquisitionState | null {
    return this._pausedFromState;
  }

  public setSearchUnitId(unitId?: string): void {
    this._currentSearchUnitId = unitId;
  }

  public get history(): ReadonlyArray<StateTransitionEvent> {
    return this._history;
  }

  public canTransitionTo(targetState: GoogleMapsAcquisitionState): boolean {
    const allowed = LEGAL_TRANSITIONS[this._state];
    return allowed ? allowed.has(targetState) : false;
  }

  public transitionTo(
    targetState: GoogleMapsAcquisitionState,
    reason: string
  ): StateTransitionEvent {
    // Idempotency: if already in the target terminal/idle state, return synthetic event
    if (this._state === targetState) {
      return {
        fromState: this._state,
        toState: targetState,
        timestamp: new Date().toISOString(),
        reason: `No-op: already in state '${targetState}'`,
        sessionId: this._sessionId,
        searchUnitId: this._currentSearchUnitId
      };
    }

    if (!this.canTransitionTo(targetState)) {
      throw new IllegalStateTransitionError(this._state, targetState, reason);
    }

    const event: StateTransitionEvent = {
      fromState: this._state,
      toState: targetState,
      timestamp: new Date().toISOString(),
      reason,
      sessionId: this._sessionId,
      searchUnitId: this._currentSearchUnitId
    };

    this._state = targetState;
    this._history.push(event);
    return event;
  }

  /**
   * Idempotent Pause:
   * Preserves the active operational state (NAVIGATING, OBSERVING, STARTING) in pausedFromState.
   * Returns true if transitioned to PAUSED, false if already PAUSED.
   */
  public pause(reason = 'Operator or queue paused acquisition'): boolean {
    if (this._state === 'PAUSED') {
      return false;
    }
    this._pausedFromState = this._state;
    this.transitionTo('PAUSED', reason);
    return true;
  }

  /**
   * Safe Resume:
   * Only permitted from PAUSED. Transitions back to the operational state it was paused from,
   * or to an explicit legal targetState (OBSERVING, NAVIGATING, STARTING).
   */
  public resume(
    targetState?: 'STARTING' | 'NAVIGATING' | 'OBSERVING',
    reason = 'Resumed from pause'
  ): StateTransitionEvent {
    if (this._state !== 'PAUSED') {
      throw new Error(`Cannot resume acquisition: current state is '${this._state}', expected 'PAUSED'`);
    }
    const resolvedTarget = targetState
      || (this._pausedFromState === 'OBSERVING' || this._pausedFromState === 'NAVIGATING' || this._pausedFromState === 'STARTING'
          ? this._pausedFromState
          : 'NAVIGATING');
    this._pausedFromState = null;
    return this.transitionTo(resolvedTarget, reason);
  }

  /**
   * Idempotent Cancel:
   * Returns true if transitioned to CANCELLED, false if already CANCELLED.
   */
  public cancel(reason = 'Operator or lifecycle cancelled acquisition'): boolean {
    if (this._state === 'CANCELLED') {
      return false;
    }
    this._pausedFromState = null;
    this.transitionTo('CANCELLED', reason);
    return true;
  }

  /**
   * Reset back to IDLE (only valid from terminal states: COMPLETED, CANCELLED, FAILED, BLOCKED).
   */
  public reset(reason = 'Resetting session state to IDLE'): StateTransitionEvent {
    return this.transitionTo('IDLE', reason);
  }
}
