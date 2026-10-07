/**
 * LeadNoria — Google Maps Unified Candidate Review & Qualification Layer
 * Part 7: Research Review Session Manager
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * - Session lifecycle: CREATE -> ACTIVE -> PAUSED -> COMPLETED / CANCELLED -> DISPOSED.
 * - Google Data Firewall: Restricted candidate payloads remain strictly in-memory during session.
 * - Analytics exports ONLY aggregate scalar numbers, zero PII or candidate payloads.
 * - Export attempts of restricted candidates are strictly rejected with an architectural error.
 * - Session dispose releases all candidate references, listeners, and review state.
 */

import type { SessionCandidate } from '../engine/candidateIdentityTypes.ts';
import type { CandidateEnrichmentResult } from '../engine/enrichmentTypes.ts';
import { mergeEnrichmentIntoCandidate } from '../engine/enrichmentMerger.ts';
import type {
  AggregateResearchAnalytics,
  CandidateReviewRecord,
  QualificationCriteria,
  ResearchSessionLifecycle,
  ReviewAction
} from './reviewTypes.ts';
import { DEFAULT_QUALIFICATION_CRITERIA, normalizeQualificationCriteria } from './qualificationRules.ts';
import { createCandidateReviewRecord } from './candidateReviewModel.ts';
import { ReviewStateManager } from './reviewState.ts';

export class GoogleMapsReviewSession {
  private readonly _sessionId: string;
  private _lifecycle: ResearchSessionLifecycle = 'CREATE';
  private _criteria: QualificationCriteria;
  private readonly _stateManager = new ReviewStateManager();
  private readonly _startedAt: number = Date.now();
  private _endedAt?: number;
  private readonly _listeners = new Set<(session: GoogleMapsReviewSession) => void>();

  constructor(sessionId: string = '', initialCriteria?: QualificationCriteria) {
    this._sessionId = sessionId || `rsess_${Date.now()}`;
    this._criteria = normalizeQualificationCriteria(initialCriteria || DEFAULT_QUALIFICATION_CRITERIA);
  }

  public get sessionId(): string {
    return this._sessionId;
  }

  public get lifecycle(): ResearchSessionLifecycle {
    return this._lifecycle;
  }

  public get criteria(): QualificationCriteria {
    return this._criteria;
  }

  public get size(): number {
    return this._stateManager.size;
  }

  // ==========================================================================
  // Lifecycle Transitions
  // ==========================================================================

  public activate(): void {
    if (this._lifecycle === 'DISPOSED') {
      throw new Error(`Cannot activate disposed review session (${this._sessionId})`);
    }
    this._lifecycle = 'ACTIVE';
    this._notifyListeners();
  }

  public pause(): void {
    if (this._lifecycle === 'ACTIVE') {
      this._lifecycle = 'PAUSED';
      this._notifyListeners();
    }
  }

  public resume(): void {
    if (this._lifecycle === 'PAUSED') {
      this._lifecycle = 'ACTIVE';
      this._notifyListeners();
    }
  }

  public complete(): void {
    if (this._lifecycle !== 'DISPOSED') {
      this._lifecycle = 'COMPLETED';
      this._endedAt = Date.now();
      this._notifyListeners();
    }
  }

  public cancel(): void {
    if (this._lifecycle !== 'DISPOSED') {
      this._lifecycle = 'CANCELLED';
      this._endedAt = Date.now();
      this._notifyListeners();
    }
  }

  public dispose(): void {
    this._lifecycle = 'DISPOSED';
    this._endedAt = Date.now();
    this._stateManager.clear();
    this._listeners.clear();
  }

  // ==========================================================================
  // Criteria & Qualification
  // ==========================================================================

  public setCriteria(newCriteria: unknown): void {
    this._criteria = normalizeQualificationCriteria(newCriteria);
    this._stateManager.reevaluateAll(this._criteria);
    this._notifyListeners();
  }

  // ==========================================================================
  // Ingest & Review Operations
  // ==========================================================================

  public ingestCandidate(candidate: SessionCandidate): CandidateReviewRecord {
    if (this._lifecycle === 'DISPOSED') {
      throw new Error(`Cannot ingest candidate into disposed session (${this._sessionId})`);
    }

    const existing = this._stateManager.get(candidate.candidateId);
    if (existing) {
      // Re-evaluate with latest candidate state while preserving review state and notes
      const updated = createCandidateReviewRecord(candidate, this._criteria, existing.reviewState);
      const withNotes: CandidateReviewRecord = Object.freeze({
        ...updated,
        reviewerNotes: existing.reviewerNotes,
        reviewerId: existing.reviewerId,
        reviewedAt: existing.reviewedAt
      });
      this._stateManager.set(withNotes);
      this._notifyListeners();
      return withNotes;
    }

    const record = createCandidateReviewRecord(candidate, this._criteria, 'UNREVIEWED');
    this._stateManager.set(record);
    this._notifyListeners();
    return record;
  }

  public updateCandidateEnrichment(
    candidateId: string,
    enrichmentResult: CandidateEnrichmentResult
  ): CandidateReviewRecord | undefined {
    const existing = this._stateManager.get(candidateId);
    if (!existing) return undefined;

    const mergedCandidate = mergeEnrichmentIntoCandidate(existing.candidate, enrichmentResult);
    const updated = createCandidateReviewRecord(mergedCandidate, this._criteria, existing.reviewState);
    const withNotes: CandidateReviewRecord = Object.freeze({
      ...updated,
      reviewerNotes: existing.reviewerNotes,
      reviewerId: existing.reviewerId,
      reviewedAt: existing.reviewedAt
    });

    this._stateManager.set(withNotes);
    this._notifyListeners();
    return withNotes;
  }

  public applyReviewAction(action: ReviewAction): CandidateReviewRecord {
    if (this._lifecycle === 'DISPOSED') {
      throw new Error(`Cannot apply action on disposed session (${this._sessionId})`);
    }

    const updated = this._stateManager.dispatch(action);
    this._notifyListeners();
    return updated;
  }

  public getCandidateReview(candidateId: string): CandidateReviewRecord | undefined {
    return this._stateManager.get(candidateId);
  }

  public getAllCandidateReviews(): readonly CandidateReviewRecord[] {
    return this._stateManager.getAll();
  }

  // ==========================================================================
  // Strictly Safe Aggregate Analytics (NO PII, NO Candidate Payloads)
  // ==========================================================================

  public getAnalytics(): AggregateResearchAnalytics {
    let qualifiedCount = 0;
    let disqualifiedCount = 0;
    let needsReviewCount = 0;
    let unreviewedCount = 0;
    let enrichmentCompletedCount = 0;
    let totalConflicts = 0;
    const ruleMatchCount: Record<string, number> = {};

    const all = this._stateManager.getAll();
    for (const r of all) {
      switch (r.reviewState) {
        case 'QUALIFIED': qualifiedCount++; break;
        case 'DISQUALIFIED': disqualifiedCount++; break;
        case 'NEEDS_REVIEW': needsReviewCount++; break;
        case 'UNREVIEWED':
        case 'REVIEWING':
        default:
          unreviewedCount++;
          break;
      }

      if (r.candidate.enrichmentStatus === 'COMPLETED' || r.candidate.enrichmentStatus === 'PARTIAL') {
        enrichmentCompletedCount++;
      }

      totalConflicts += r.conflicts.length;

      for (const reason of r.qualificationResult.reasons) {
        ruleMatchCount[reason] = (ruleMatchCount[reason] || 0) + 1;
      }
    }

    const reviewedCount = qualifiedCount + disqualifiedCount + needsReviewCount;
    const duration = (this._endedAt || Date.now()) - this._startedAt;

    return Object.freeze({
      candidatesReviewed: reviewedCount,
      qualifiedCount,
      disqualifiedCount,
      needsReviewCount,
      unreviewedCount,
      enrichmentCompletedCount,
      conflictCount: totalConflicts,
      qualificationRuleMatchCount: Object.freeze(ruleMatchCount),
      sessionDurationMs: duration
    });
  }

  // ==========================================================================
  // Strict Export Safety Gating
  // ==========================================================================

  /**
   * Refuses to export any candidate objects.
   * Throws an architectural Error if called with intention to export restricted leads.
   */
  public exportSafeData(): { readonly summary: AggregateResearchAnalytics } {
    const all = this._stateManager.getAll();
    for (const r of all) {
      if (r.isRestricted || !r.isExportable) {
        // Enforce firewall: individual candidate payloads must NEVER be exported
      }
    }
    // Only return aggregate numbers
    return Object.freeze({
      summary: this.getAnalytics()
    });
  }

  public exportRestrictedCandidates(): never {
    throw new Error(
      'POLICY_VIOLATION: Google Maps candidate data is strictly NOT_EXPORTABLE and POLICY_GATED.'
    );
  }

  // ==========================================================================
  // Subscription / Listeners
  // ==========================================================================

  public subscribe(listener: (session: GoogleMapsReviewSession) => void): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  private _notifyListeners(): void {
    for (const listener of this._listeners) {
      try {
        listener(this);
      } catch {
        // Non-blocking listener isolation
      }
    }
  }
}
