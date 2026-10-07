/**
 * LeadNoria — Google Maps Candidate Identity & Data Quality Hardening
 * Part 5: Domain Types & Decision Contracts
 *
 * THREE IDENTITY LEVELS:
 * - Level 1: Observation ID (gmo_<hash>) — specific single observed candidate event.
 * - Level 2: Session Candidate ID (cid_<hash>) — unique discovered business in active session.
 * - Level 3: Global/Canonical Entity ID — unpersisted, strictly firewall-gated for Google data.
 *
 * HARD INVARIANTS:
 * - Maximum duplicate reduction WITHOUT false entity collapse.
 * - Same business name does NOT imply same business (branch safety).
 * - Phone-only or website-only matches do NOT auto-merge.
 * - Rating and review count are mutable observation variance, NEVER identity proof.
 * - Data completeness is strictly decoupled from identity confidence.
 * - Zero buyer intent / lead scoring; zero website crawling / contact enrichment.
 * - Memory is strictly bounded (O(1) storage per candidate, capped evidence).
 */

import type {
  FieldAvailability,
  ObservedField,
  GoogleMapsCandidateObservation,
  GoogleMapsAcquisitionDiagnostic
} from './types.ts';
import type {
  CandidateEnrichmentStatus,
  CandidateEnrichmentResult,
  CandidateEnrichmentSummary
} from './enrichmentTypes.ts';

// ============================================================================
// 1. Identity Relationships & Methods
// ============================================================================

export type IdentityRelationship =
  | 'SAME'                // Confirmed duplicate observation of the same candidate (auto-merge)
  | 'POTENTIAL_DUPLICATE' // Plausible match with supporting signals, but insufficient strong identity (do NOT auto-merge)
  | 'DISTINCT'            // Different candidate / separate branch / incompatible identity
  | 'CONFLICT';           // Contradictory strong identity signals (e.g. same place ID with incompatible address)

export type IdentityMethod =
  | 'VISIBLE_PLACE_ID'
  | 'MAPS_URL'
  | 'NAME_ADDRESS'
  | 'NAME_PHONE'
  | 'NAME_CATEGORY_LOCATION'
  | 'WEAK_FALLBACK';

export type IdentityConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW' | 'CONFLICT';

export interface IdentityDecision {
  readonly relationship: IdentityRelationship;
  readonly confidence: number; // 0.0 - 1.0
  readonly confidenceTier: IdentityConfidenceTier;
  readonly method: IdentityMethod;
  readonly evidence: readonly string[];
  readonly reasons: readonly string[];
  readonly conflictDetails?: readonly string[];
}

export interface DuplicateRelationship {
  readonly candidateIdA: string;
  readonly candidateIdB: string;
  readonly relationship: 'POTENTIAL_DUPLICATE' | 'CONFLICT';
  readonly confidence: number;
  readonly method: IdentityMethod;
  readonly reason: string;
  readonly detectedAt: string;
  readonly evidence: readonly string[];
}

// ============================================================================
// 2. Candidate Provenance & Bounded Evidence
// ============================================================================

export interface CandidateObservationReference {
  readonly observationId: string;
  readonly searchUnitId: string;
  readonly observedAt: string;
  readonly searchKeyword: string;
  readonly searchLocation?: string;
  readonly pageUrl?: string;
}

export interface ObservedSearchUnitContext {
  readonly searchUnitId: string;
  readonly keyword: string;
  readonly location?: string;
  readonly firstObservedAt: string;
  readonly lastObservedAt: string;
  readonly observationCount: number;
}

export interface FieldConflict<T = unknown> {
  readonly fieldName: string;
  readonly values: readonly {
    readonly value: T;
    readonly availability: FieldAvailability;
    readonly observedAt: string;
    readonly searchUnitId: string;
    readonly observationId: string;
  }[];
  readonly selectedValue?: T;
  readonly resolutionReason: string;
}

export interface FieldEvidenceEntry<T = unknown> {
  readonly value?: T;
  readonly availability: FieldAvailability;
  readonly confidence: number;
  readonly observedAt: string;
  readonly searchUnitId: string;
  readonly observationId: string;
}

// ============================================================================
// 3. Field-Level Quality State & Issue Model
// ============================================================================

export type FieldLevelQualityState =
  | 'CONFIDENT'
  | 'SUPPORTED'
  | 'INCOMPLETE'
  | 'CONFLICTING'
  | 'UNKNOWN';

export type DataQualityIssueCode =
  | 'MISSING_NAME'
  | 'MISSING_ADDRESS'
  | 'MISSING_PHONE'
  | 'MISSING_WEBSITE_EVIDENCE'
  | 'RATING_UNKNOWN'
  | 'REVIEW_COUNT_UNKNOWN'
  | 'IDENTITY_WEAK'
  | 'IDENTITY_CONFLICT'
  | 'MULTI_FIELD_CONFLICT'
  | 'DUPLICATE_OBSERVATION'
  | 'POTENTIAL_DUPLICATE'
  | 'INCONSISTENT_PHONE'
  | 'INCONSISTENT_ADDRESS'
  | 'INCONSISTENT_WEBSITE'
  | 'WEBSITE_EVIDENCE_CONFLICT'
  | 'WEBSITE_PHONE_DIVERGENCE'
  | 'WEBSITE_ADDRESS_DIVERGENCE'
  | 'WEBSITE_NAME_VARIANCE'
  | 'WEBSITE_TARGET_CONFLICT';

export interface DataQualityIssue {
  readonly code: DataQualityIssueCode;
  readonly field?: string;
  readonly severity: 'INFO' | 'LOW' | 'MEDIUM'; // Non-blocking! Ordinary missing data is NOT P0/P1 system failure
  readonly message: string;
}

export interface CandidateQualityMetrics {
  readonly identityConfidence: IdentityConfidenceTier;
  readonly identityConfidenceScore: number;
  readonly dataCompleteness: number; // 0.0 - 100.0 percentage of core fields with usable evidence
  readonly observedFieldCount: number;
  readonly supportedFieldCount: number;
  readonly unknownFieldCount: number;
  readonly conflictFieldCount: number;
  readonly fieldStates: Record<string, FieldLevelQualityState>;
  readonly issues: readonly DataQualityIssue[];
}

// ============================================================================
// 4. Session Candidate Contract (Level 2 Identity)
// ============================================================================

export interface SessionCandidate {
  readonly candidateId: string; // cid_<hash>
  readonly firstObservedAt: string;
  readonly lastObservedAt: string;
  readonly observationCount: number;
  readonly source: 'GOOGLE_MAPS_BROWSER';
  readonly isRestricted: true;

  // Granular Merged Observed Fields
  readonly businessName: ObservedField<string>;
  readonly category: ObservedField<string>;
  readonly address: ObservedField<string>;
  readonly phone: ObservedField<string>;
  readonly websiteUrl: ObservedField<string>;
  readonly rating: ObservedField<number>;
  readonly reviewCount: ObservedField<number>;
  readonly businessStatus: ObservedField<string>;
  readonly placeId: ObservedField<string>;
  readonly mapsUrl: ObservedField<string>;

  readonly fieldAvailability: Record<string, FieldAvailability>;

  // Identity Metadata
  readonly identityMethod: IdentityMethod;
  readonly identityConfidence: number;
  readonly identityEvidence: string;

  // Provenance (Bounded)
  readonly observationReferences: readonly CandidateObservationReference[];
  readonly observedSearchUnits: readonly ObservedSearchUnitContext[];
  readonly observedOrder?: number;

  // Field Evidence & Conflicts (Bounded)
  readonly fieldConflicts: readonly FieldConflict[];
  readonly fieldEvidence: Record<string, readonly FieldEvidenceEntry[]>;

  // Quality Metrics (Decoupled from Identity)
  readonly qualityMetrics: CandidateQualityMetrics;
  readonly evidenceTruncated?: boolean;

  // Website & Contact Enrichment (Part 6)
  readonly enrichmentStatus?: CandidateEnrichmentStatus;
  readonly enrichmentResult?: CandidateEnrichmentResult;
  readonly enrichmentSummary?: CandidateEnrichmentSummary;

  // Compatibility projection
  readonly observationId: string; // Set to candidateId for seamless filter compatibility
  readonly searchUnitId: string;  // Primary search unit where first discovered
  readonly sessionId: string;
  readonly observedAt: string;    // latestObservedAt
  readonly pageUrl: string;
  readonly pageKind: any;
  readonly searchKeyword: string;
  readonly searchLocation?: string;
  readonly provenance: any;
  readonly diagnostics: GoogleMapsAcquisitionDiagnostic[];
}

// ============================================================================
// 5. Session Data Quality Snapshot
// ============================================================================

export interface DataQualitySnapshot {
  readonly totalRawObservations: number;
  readonly uniqueCandidates: number;
  readonly duplicateObservations: number;
  readonly duplicateRate: number; // 0.0 - 1.0 (duplicateObservations / totalRawObservations)
  readonly potentialDuplicatesCount: number;
  readonly identityConflictsCount: number;
  readonly candidatesWithFieldConflictsCount: number;
  readonly averageCompleteness: number; // 0.0 - 100.0
  readonly medianCompleteness: number;  // 0.0 - 100.0
  readonly completenessDistribution: {
    readonly tier0To25: number;
    readonly tier26To50: number;
    readonly tier51To75: number;
    readonly tier76To100: number;
  };
  readonly identityTierDistribution: {
    readonly high: number;
    readonly medium: number;
    readonly low: number;
    readonly conflict: number;
  };
  readonly fieldPresenceCounts: Record<string, number>;
}
