/**
 * LeadNoria — Export-Safe Lead Projection & Research Workspace
 * Part 8: Core Type Contracts & Domain Models
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. ResearchCandidate and ExportSafeLead are strictly distinct domains.
 * 2. Zero Google Maps fields in ExportSafeLead (no Place ID, Maps URL, rating, review count, etc.).
 * 3. An ExportSafeLead requires an explicit IndependentSourceAnchor.
 * 4. Qualification in Part 7 is a research decision, NOT export eligibility.
 * 5. Google Data Firewall remains impenetrable across all projection boundaries.
 */

import type { ReviewState } from '../acquisition/review/reviewTypes.ts';

/**
 * Valid independent source classes permitted to anchor an ExportSafeLead.
 * GOOGLE_MAPS_BROWSER is explicitly RESTRICTED and can never be an anchor.
 */
export type IndependentSourceClass =
  | 'WEBSITE_PUBLIC'
  | 'USER_PROVIDED'
  | 'LEADNORIA_DERIVED_FROM_NON_RESTRICTED_INPUT';

/**
 * Source classification of incoming research context.
 */
export type CandidateSourceClass =
  | 'GOOGLE_MAPS_BROWSER'
  | IndependentSourceClass;

/**
 * Independent Source Anchor contract.
 * Represents verified public web or user-supplied entrypoints establishing identity.
 */
export interface IndependentSourceAnchor {
  readonly sourceId: string;
  readonly sourceClass: IndependentSourceClass;
  readonly targetUrl: string;
  readonly domain: string;
  readonly businessName?: string;
  readonly inputMethod: 'MANUAL_ENTRY' | 'STANDALONE_CRAWL' | 'EXTERNAL_IMPORT';
  readonly verifiedAt: string;
  readonly notes?: string;
  readonly isRestricted: false;
}

/**
 * Public Contact Evidence (derived purely from public website or user input).
 */
export interface PublicContactEvidence {
  readonly publicEmails: readonly {
    readonly email: string;
    readonly classification: string;
    readonly sourceUrl: string;
    readonly observedAt: string;
  }[];
  readonly publicPhones: readonly {
    readonly phone: string;
    readonly rawPhone: string;
    readonly sourceUrl: string;
    readonly observedAt: string;
  }[];
  readonly socialProfiles: readonly {
    readonly platform: string;
    readonly url: string;
  }[];
}

/**
 * Public Leadership Person Evidence (derived purely from public website leadership sections).
 */
export interface PublicPersonEvidence {
  readonly leadershipPeople: readonly {
    readonly fullName: string;
    readonly jobTitle: string;
    readonly email?: string;
    readonly sourceUrl: string;
    readonly observedAt: string;
  }[];
}

/**
 * Public Website Evidence (derived from direct HTTP crawl or user submission).
 */
export interface PublicWebsiteEvidence {
  readonly domain: string;
  readonly canonicalUrl: string;
  readonly pageTitle?: string;
  readonly metaDescription?: string;
  readonly technologies?: readonly string[];
  readonly services?: readonly string[];
}

/**
 * Correlation status linking a research candidate to an independent lead without data transfer.
 */
export type CorrelationStatus =
  | 'CORRELATED'
  | 'POTENTIAL_MATCH'
  | 'CONFIRMED_BY_INDEPENDENT_SOURCE';

/**
 * Lead eligibility evaluation status and reason codes.
 */
export type LeadEligibilityStatus = 'ELIGIBLE' | 'NOT_ELIGIBLE';

export type LeadEligibilityReasonCode =
  | 'INDEPENDENT_SOURCE_PRESENT'
  | 'INDEPENDENT_SOURCE_MISSING'
  | 'GOOGLE_RESTRICTED_LINEAGE'
  | 'INSUFFICIENT_IDENTITY_EVIDENCE'
  | 'REVIEW_NOT_COMPLETE'
  | 'QUALIFICATION_REQUIRED'
  | 'CONFLICT_BLOCKED'
  | 'EXPORT_POLICY_BLOCKED'
  | 'USER_PROVIDED_SOURCE'
  | 'WEBSITE_PUBLIC_SOURCE'
  | 'PERSISTENCE_NOT_ALLOWED';

export interface LeadEligibilityResult {
  readonly status: LeadEligibilityStatus;
  readonly isExportEligible: boolean;
  readonly isPersistenceEligible: boolean;
  readonly reasonCodes: readonly LeadEligibilityReasonCode[];
  readonly reasonDescriptions: readonly string[];
  readonly evaluatedAt: string;
}

/**
 * ExportSafeLead Contract.
 * GUARANTEE: Zero Google Maps-derived fields exist within this structure.
 */
export interface ExportSafeLead {
  readonly leadId: string;
  readonly sourceClass: IndependentSourceClass;
  readonly independentSourceId: string;
  readonly identity: {
    readonly businessName: string;
    readonly domain: string;
    readonly canonicalUrl: string;
  };
  readonly website: PublicWebsiteEvidence;
  readonly contact: PublicContactEvidence;
  readonly person: PublicPersonEvidence;
  readonly qualification: {
    readonly status: 'QUALIFIED' | 'NEEDS_REVIEW' | 'DISQUALIFIED';
    readonly overallReadiness: number;
    readonly passedRules: readonly string[];
  };
  readonly reviewOutcome: {
    readonly reviewState: ReviewState;
    readonly reviewerNotes?: string;
    readonly reviewedAt?: string;
  };
  readonly correlation?: {
    readonly candidateId: string;
    readonly correlationStatus: CorrelationStatus;
  };
  readonly evidenceReferences: readonly {
    readonly fieldName: string;
    readonly sourceUrl: string;
    readonly observedAt: string;
  }[];
  readonly exportEligibility: 'ELIGIBLE' | 'BLOCKED';
  readonly eligibilityReasons: readonly LeadEligibilityReasonCode[];
  readonly userMetadata: {
    readonly notes?: string;
    readonly tags?: readonly string[];
    readonly priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    readonly manualStatus?: string;
  };
  readonly createdAt: string;
  readonly updatedAt: string;
}


/**
 * Lead Workspace Aggregated Analytics.
 * GUARANTEE: Contains strictly scalar numbers. Zero candidate/lead payloads, PII, or URLs.
 */
export interface LeadWorkspaceAnalytics {
  readonly researchCandidatesCount: number;
  readonly qualifiedCandidatesCount: number;
  readonly blockedGoogleCount: number;
  readonly independentSourceCount: number;
  readonly exportEligibleCount: number;
  readonly exportBlockedCount: number;
  readonly conflictCount: number;
  readonly reviewedCount: number;
  readonly generatedAt: string;
}
