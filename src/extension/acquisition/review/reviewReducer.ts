/**
 * LeadNoria — Google Maps Unified Candidate Review & Qualification Layer
 * Part 7: Human Review Lifecycle Reducer & Transition Validation
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * - Pure, deterministic state transition reducer.
 * - Explicit and validated state transitions.
 * - Never mutates the underlying source evidence or candidate objects.
 * - Rejects invalid transitions deterministically.
 */

import type { ReviewAction, ReviewActionType, ReviewState } from './reviewTypes.ts';

export const VALID_REVIEW_STATES: readonly ReviewState[] = Object.freeze([
  'UNREVIEWED',
  'REVIEWING',
  'QUALIFIED',
  'DISQUALIFIED',
  'NEEDS_REVIEW'
]);

export const VALID_REVIEW_ACTIONS: readonly ReviewActionType[] = Object.freeze([
  'START_REVIEW',
  'MARK_QUALIFIED',
  'MARK_DISQUALIFIED',
  'MARK_NEEDS_REVIEW',
  'RESET_REVIEW'
]);

/**
 * Validates whether a state transition from `from` to `to` is architecturally legal.
 */
export function isValidReviewTransition(from: ReviewState, to: ReviewState): boolean {
  if (from === to) return true; // Idempotent transition is legal

  switch (from) {
    case 'UNREVIEWED':
      return to === 'REVIEWING' || to === 'QUALIFIED' || to === 'DISQUALIFIED' || to === 'NEEDS_REVIEW';

    case 'REVIEWING':
      return to === 'QUALIFIED' || to === 'DISQUALIFIED' || to === 'NEEDS_REVIEW' || to === 'UNREVIEWED';

    case 'QUALIFIED':
      return to === 'REVIEWING' || to === 'DISQUALIFIED' || to === 'NEEDS_REVIEW' || to === 'UNREVIEWED';

    case 'DISQUALIFIED':
      return to === 'REVIEWING' || to === 'QUALIFIED' || to === 'NEEDS_REVIEW' || to === 'UNREVIEWED';

    case 'NEEDS_REVIEW':
      return to === 'REVIEWING' || to === 'QUALIFIED' || to === 'DISQUALIFIED' || to === 'UNREVIEWED';

    default:
      return false;
  }
}

/**
 * Pure deterministic reducer that computes the next ReviewState given current state and action.
 * Throws an Error on invalid action type or malformed action.
 */
export function reviewReducer(
  currentState: ReviewState,
  action: ReviewAction
): ReviewState {
  if (!VALID_REVIEW_STATES.includes(currentState)) {
    throw new Error(`Invalid current review state: "${String(currentState)}"`);
  }

  if (!action || typeof action !== 'object' || !action.type) {
    throw new Error('Review action must be an object with a valid "type" property');
  }

  let targetState: ReviewState;

  switch (action.type) {
    case 'START_REVIEW':
      targetState = 'REVIEWING';
      break;

    case 'MARK_QUALIFIED':
      targetState = 'QUALIFIED';
      break;

    case 'MARK_DISQUALIFIED':
      targetState = 'DISQUALIFIED';
      break;

    case 'MARK_NEEDS_REVIEW':
      targetState = 'NEEDS_REVIEW';
      break;

    case 'RESET_REVIEW':
      targetState = 'UNREVIEWED';
      break;

    default:
      throw new Error(`Unsupported review action type: "${(action as any).type}"`);
  }

  if (!isValidReviewTransition(currentState, targetState)) {
    throw new Error(`Illegal review transition from ${currentState} to ${targetState}`);
  }

  return targetState;
}
