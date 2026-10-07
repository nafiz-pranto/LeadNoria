/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Lead Lifecycle State Machine
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Deterministic transitions only: invalid transitions fail closed.
 * 2. Lifecycle transitions NEVER alter source provenance or Google firewall restrictions.
 * 3. Restoring an archived lead returns it to ACTIVE or NEW without modifying data lineage.
 */

import type { LeadLifecycleState, PersistedLeadRecord } from './workspaceTypes.ts';

/**
 * Valid transitions mapping for each state.
 */
const ALLOWED_TRANSITIONS: Record<LeadLifecycleState, readonly LeadLifecycleState[]> = {
  NEW: ['ACTIVE', 'DISQUALIFIED', 'ON_HOLD', 'ARCHIVED'],
  ACTIVE: ['CONTACTED', 'QUALIFIED', 'DISQUALIFIED', 'ON_HOLD', 'ARCHIVED'],
  CONTACTED: ['QUALIFIED', 'DISQUALIFIED', 'ON_HOLD', 'ARCHIVED', 'ACTIVE'],
  QUALIFIED: ['ACTIVE', 'CONTACTED', 'ARCHIVED', 'ON_HOLD', 'DISQUALIFIED'],
  DISQUALIFIED: ['ACTIVE', 'ARCHIVED'],
  ON_HOLD: ['ACTIVE', 'ARCHIVED', 'DISQUALIFIED'],
  ARCHIVED: ['ACTIVE', 'NEW'] // Restore actions
};

/**
 * Checks whether a lifecycle transition from currentState to targetState is valid.
 */
export function isValidLifecycleTransition(
  currentState: LeadLifecycleState,
  targetState: LeadLifecycleState
): boolean {
  if (currentState === targetState) return true; // Idempotent same-state is valid
  const allowed = ALLOWED_TRANSITIONS[currentState];
  return allowed ? allowed.includes(targetState) : false;
}

/**
 * Transitions a PersistedLeadRecord to a new lifecycle state.
 * Throws an Error if the transition is illegal.
 */
export function transitionLeadLifecycle(
  record: PersistedLeadRecord,
  targetState: LeadLifecycleState,
  changeReason?: string
): PersistedLeadRecord {
  if (!record || !record.lifecycle) {
    throw new Error('Cannot transition null or malformed lead record');
  }

  const currentState = record.lifecycle.state;

  if (!isValidLifecycleTransition(currentState, targetState)) {
    throw new Error(
      `INVALID LIFECYCLE TRANSITION: Cannot transition lead "${record.leadId}" from ${currentState} to ${targetState}`
    );
  }

  const now = new Date().toISOString();

  // Create new record with updated lifecycle and audit metadata
  // Invariant: Source provenance, identity, and evidence are completely immutable
  const updated: PersistedLeadRecord = {
    ...record,
    lifecycle: {
      state: targetState,
      previousState: currentState,
      changedAt: now,
      changeReason: changeReason || `Transitioned from ${currentState} to ${targetState}`
    },
    auditMetadata: {
      ...record.auditMetadata,
      updatedAt: now,
      version: record.auditMetadata.version + 1
    }
  };

  return Object.freeze(updated);
}

/**
 * Convenience helper to archive a lead.
 */
export function archiveLeadRecord(
  record: PersistedLeadRecord,
  reason = 'User archived lead'
): PersistedLeadRecord {
  return transitionLeadLifecycle(record, 'ARCHIVED', reason);
}

/**
 * Convenience helper to restore an archived lead.
 * Restores to previous state or ACTIVE by default.
 */
export function restoreLeadRecord(
  record: PersistedLeadRecord,
  targetState: 'ACTIVE' | 'NEW' = 'ACTIVE',
  reason = 'User restored archived lead'
): PersistedLeadRecord {
  if (record.lifecycle.state !== 'ARCHIVED') {
    throw new Error(`Cannot restore lead "${record.leadId}" because it is not in ARCHIVED state`);
  }
  return transitionLeadLifecycle(record, targetState, reason);
}
