/**
 * LeadNoria — Google Maps Unified Candidate Review & Qualification Layer
 * Part 7: Review Domain Types & Contracts
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. GOOGLE DATA FIREWALL REMAINS ABSOLUTE:
 *    - All candidates derived from Google Maps remain isRestricted = true,
 *      persistenceStatus = 'NOT_PERSISTABLE', exportStatus = 'NOT_EXPORTABLE',
 *      policyStatus = 'POLICY_GATED'.
 *    - Qualification and review records must NEVER create a persistent or exportable clone.
 * 2. PROVENANCE LINEAGE PRESERVED:
 *    - Maps facts and Website facts maintain explicit source lineage.
 *    - Never overwrite Google-derived values with website-derived values.
 * 3. EXPLICIT CONFLICT HANDLING:
 *    - Surfaces PHONE_DIVERGENCE, ADDRESS_DIVERGENCE, WEBSITE_TARGET_CONFLICT.
 *    - Both sides are preserved and displayed; never silently resolved.
 * 4. PURE DETERMINISTIC QUALIFICATION:
 *    - No fake AI confidence scores; only explainable, deterministic evidence readiness.
 *    - UNKNOWN evidence never becomes PASS merely because a field is missing.
 * 5. FILTER / QUALIFICATION INDEPENDENCE:
 *    - Part 3 filters (rating & website) are stage 1 acquisition filters.
 *    - Qualification is an independent stage 2 research decision layer.
 */

import type { SessionCandidate } from '../engine/candidateIdentityTypes.ts';

// ============================================================================
// 1. Human Review Lifecycle State & Actions
// ============================================================================

export type ReviewState =
  | 'UNREVIEWED'
  | 'REVIEWING'
  | 'QUALIFIED'
  | 'DISQUALIFIED'
  | 'NEEDS_REVIEW';

export type ReviewActionType =
  | 'START_REVIEW'
  | 'MARK_QUALIFIED'
  | 'MARK_DISQUALIFIED'
  | 'MARK_NEEDS_REVIEW'
  | 'RESET_REVIEW';

export interface ReviewAction {
  readonly type: ReviewActionType;
  readonly candidateId: string;
  readonly reviewerNotes?: string;
  readonly reviewerId?: string;
  readonly timestamp?: string;
  readonly qualificationOverrideReason?: string;
}

// ============================================================================
// 2. Deterministic Qualification Contract
// ============================================================================

export type QualificationStatus =
  | 'QUALIFIED'
  | 'DISQUALIFIED'
  | 'NEEDS_REVIEW'
  | 'INSUFFICIENT_EVIDENCE';

export type QualificationReasonCode =
  | 'RATING_MATCH'
  | 'RATING_BELOW_THRESHOLD'
  | 'RATING_UNKNOWN'
  | 'WEBSITE_PRESENT'
  | 'WEBSITE_ABSENT'
  | 'WEBSITE_UNKNOWN'
  | 'WEBSITE_UNAVAILABLE'
  | 'CONTACT_AVAILABLE'
  | 'PHONE_AVAILABLE'
  | 'PHONE_ABSENT'
  | 'EMAIL_AVAILABLE'
  | 'EMAIL_ABSENT'
  | 'PERSON_AVAILABLE'
  | 'PERSON_ABSENT'
  | 'BUSINESS_IDENTITY_CONFIRMED'
  | 'BUSINESS_IDENTITY_WEAK'
  | 'CONFLICT_DETECTED'
  | 'PHONE_DIVERGENCE'
  | 'ADDRESS_DIVERGENCE'
  | 'WEBSITE_TARGET_CONFLICT'
  | 'IDENTITY_CONFLICT'
  | 'PLACE_ID_CONFLICT'
  | 'OTHER_SOURCE_CONFLICT'
  | 'MISSING_REQUIRED_EVIDENCE'
  | 'ENRICHMENT_BLOCKED'
  | 'INSUFFICIENT_EVIDENCE';

export interface QualificationCriteria {
  readonly minRating: number | null;
  readonly minReviewCount: number | null;
  readonly requireWebsite: boolean;
  readonly requirePhone: boolean;
  readonly requireEmail: boolean;
  readonly requirePerson: boolean;
  readonly requireContact: boolean; // either email or phone
  readonly allowPhoneDivergence: boolean;
  readonly allowAddressDivergence: boolean;
  readonly allowWebsiteConflict: boolean;
  readonly maxAllowedConflicts: number;
  readonly minimumIdentityConfidenceTier: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ReadinessScores {
  readonly identityReadiness: number; // 0.0 - 1.0
  readonly contactReadiness: number;  // 0.0 - 1.0
  readonly websiteReadiness: number;  // 0.0 - 1.0
  readonly personReadiness: number;   // 0.0 - 1.0
  readonly conflictState: 'NONE' | 'TOLERATED' | 'BLOCKING';
  readonly overallQualificationReadiness: number; // 0.0 - 1.0
}

export interface CandidateQualificationResult {
  readonly candidateId: string;
  readonly status: QualificationStatus;
  readonly reasons: readonly QualificationReasonCode[];
  readonly reasonDescriptions: readonly string[];
  readonly evidenceReferences: readonly string[];
  readonly readiness: ReadinessScores;
  readonly passedRules: readonly string[];
  readonly failedRules: readonly string[];
  readonly blockedRules: readonly string[];
  readonly evaluatedAt: string;
}

// ============================================================================
// 3. Provenance & Conflict Models
// ============================================================================

export type EvidenceProvenanceSource =
  | 'GOOGLE_MAPS_BROWSER'
  | 'WEBSITE_PUBLIC'
  | 'CONTACT_PUBLIC'
  | 'PERSON_PUBLIC'
  | 'DERIVED'
  | 'USER_REVIEW';

export interface FieldProvenanceRecord {
  readonly fieldName: string;
  readonly source: EvidenceProvenanceSource;
  readonly value: unknown;
  readonly availability: string;
  readonly confidence: number;
  readonly observedAt: string;
  readonly isRestricted: boolean;
  readonly sourceUrl?: string;
}

export type ConflictType =
  | 'PHONE_DIVERGENCE'
  | 'ADDRESS_DIVERGENCE'
  | 'WEBSITE_TARGET_CONFLICT'
  | 'IDENTITY_CONFLICT'
  | 'PLACE_ID_CONFLICT'
  | 'OTHER_SOURCE_CONFLICT';

export interface ConflictRecord {
  readonly conflictType: ConflictType;
  readonly fieldName: string;
  readonly mapsValue: unknown;
  readonly mapsObservedAt: string;
  readonly websiteValue: unknown;
  readonly websiteObservedAt: string;
  readonly tolerated: boolean;
  readonly severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';
  readonly explanation: string;
}

// ============================================================================
// 4. Evidence Summary & Candidate Review View Model
// ============================================================================

export interface CandidateEvidenceSummary {
  readonly knownFields: readonly string[];
  readonly unknownFields: readonly string[];
  readonly unsupportedFields: readonly string[];
  readonly conflictFieldCount: number;
  readonly dataCompleteness: number; // 0.0 - 100.0 reused from Part 5
  readonly identityConfidence: string;
  readonly enrichmentStatus: string;
  readonly qualificationReadiness: number;
}

export interface CandidateReviewRecord {
  readonly candidateId: string;
  readonly reviewState: ReviewState;
  readonly qualificationResult: CandidateQualificationResult;
  readonly evidenceSummary: CandidateEvidenceSummary;
  readonly conflicts: readonly ConflictRecord[];
  readonly provenance: readonly FieldProvenanceRecord[];
  readonly reviewerNotes?: string;
  readonly reviewerId?: string;
  readonly reviewedAt?: string;

  // Live in-memory candidate reference only
  readonly candidate: SessionCandidate;

  // Strict firewall markers
  readonly isRestricted: true;
  readonly isExportable: false;
  readonly persistenceStatus: 'NOT_PERSISTABLE';
  readonly exportStatus: 'NOT_EXPORTABLE';
  readonly policyStatus: 'POLICY_GATED';
}

// ============================================================================
// 5. Session Lifecycle & Aggregate Analytics
// ============================================================================

export type ResearchSessionLifecycle =
  | 'CREATE'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPOSED';

export interface AggregateResearchAnalytics {
  readonly candidatesReviewed: number;
  readonly qualifiedCount: number;
  readonly disqualifiedCount: number;
  readonly needsReviewCount: number;
  readonly unreviewedCount: number;
  readonly enrichmentCompletedCount: number;
  readonly conflictCount: number;
  readonly qualificationRuleMatchCount: Record<string, number>;
  readonly sessionDurationMs: number;
}
