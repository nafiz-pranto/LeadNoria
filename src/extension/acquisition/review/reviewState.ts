/**
 * LeadNoria — Google Maps Unified Candidate Review & Qualification Layer
 * Part 7: Review State Manager
 *
 * HARD INVARIANTS:
 * - Scoped to live research session in-memory only.
 * - Manages candidate review records deterministically.
 * - Dispatches review actions without mutating underlying candidate observations.
 * - Completely released on session cleanup.
 */

import type {
  CandidateReviewRecord,
  QualificationCriteria,
  ReviewAction
} from './reviewTypes.ts';
import { applyActionToReviewRecord } from './candidateReviewModel.ts';
import { evaluateCandidateQualification } from './qualificationEngine.ts';
import { summarizeCandidateEvidence } from './evidenceSummary.ts';
import { extractCandidateConflicts } from './conflictSummary.ts';

export class ReviewStateManager {
  private readonly _reviews = new Map<string, CandidateReviewRecord>();
  private readonly _reviewOrder: string[] = [];

  public get size(): number {
    return this._reviews.size;
  }

  public has(candidateId: string): boolean {
    return this._reviews.has(candidateId);
  }

  public get(candidateId: string): CandidateReviewRecord | undefined {
    return this._reviews.get(candidateId);
  }

  public getAll(): readonly CandidateReviewRecord[] {
    return this._reviewOrder
      .map(id => this._reviews.get(id))
      .filter((r): r is CandidateReviewRecord => r !== undefined);
  }

  public set(record: CandidateReviewRecord): void {
    if (!this._reviews.has(record.candidateId)) {
      this._reviewOrder.push(record.candidateId);
    }
    this._reviews.set(record.candidateId, record);
  }

  public dispatch(action: ReviewAction): CandidateReviewRecord {
    const current = this._reviews.get(action.candidateId);
    if (!current) {
      throw new Error(`Cannot dispatch action for untracked candidateId "${action.candidateId}"`);
    }

    const updated = applyActionToReviewRecord(current, action);
    this._reviews.set(action.candidateId, updated);
    return updated;
  }

  public reevaluate(candidateId: string, criteria?: QualificationCriteria): CandidateReviewRecord {
    const current = this._reviews.get(candidateId);
    if (!current) {
      throw new Error(`Cannot reevaluate untracked candidateId "${candidateId}"`);
    }

    const nextQual = evaluateCandidateQualification(current.candidate, criteria);
    const nextEvidence = summarizeCandidateEvidence(current.candidate, nextQual.readiness);
    const nextConflicts = extractCandidateConflicts(current.candidate, criteria);

    const updated: CandidateReviewRecord = Object.freeze({
      ...current,
      qualificationResult: nextQual,
      evidenceSummary: nextEvidence,
      conflicts: nextConflicts
    });

    this._reviews.set(candidateId, updated);
    return updated;
  }

  public reevaluateAll(criteria?: QualificationCriteria): void {
    for (const id of this._reviewOrder) {
      this.reevaluate(id, criteria);
    }
  }

  public remove(candidateId: string): boolean {
    const existed = this._reviews.delete(candidateId);
    const idx = this._reviewOrder.indexOf(candidateId);
    if (idx !== -1) {
      this._reviewOrder.splice(idx, 1);
    }
    return existed;
  }

  public clear(): void {
    this._reviews.clear();
    this._reviewOrder.length = 0;
  }

  public dispose(): void {
    this.clear();
  }
}
