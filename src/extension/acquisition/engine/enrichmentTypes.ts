/**
 * LeadNoria — Google Maps Website & Contact/Person Enrichment Engine (Part 6)
 * Domain Type Contracts & Interfaces
 *
 * HARD BOUNDARIES & INVARIANTS:
 * - Reuses existing Website Intelligence and Contact/Person Intelligence engines.
 * - ZERO duplicate crawlers, zero secondary parsers or duplicate normalizers.
 * - Asynchronous, secondary pipeline: acquisition NEVER blocks on website crawling.
 * - Google Data Firewall: enriched Google candidates remain strictly NOT_PERSISTABLE and NOT_EXPORTABLE.
 * - Concurrency = 1 (default): dedicated enrichment context, never touches Google Maps tab.
 * - Filter independence: Part 3 rating/website filters evaluate candidate existence, not crawl success.
 * - Bounded crawl policy: max 5 pages, 10s page timeout, 30s domain timeout, 500KB document budget.
 * - SSRF, same-origin, redirect defenses strictly enforced.
 * - Zero guessing of emails, zero AI person speculation, zero form submission, zero social crawling.
 */

import type { GoogleMapsAcquisitionDiagnostic } from './types.ts';

// ============================================================================
// 1. Candidate Enrichment Status & Termination Reason
// ============================================================================

export type CandidateEnrichmentStatus =
  | 'NOT_ELIGIBLE'
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED'
  | 'BLOCKED'
  | 'SKIPPED_NO_WEBSITE'
  | 'SKIPPED_AMBIGUOUS_WEBSITE'
  | 'ENRICHMENT_DEFERRED'
  | 'BLOCKED_WEBSITE_CONFLICT'
  | 'CANCELLED';

export type EnrichmentTerminationReason =
  | 'SUCCESS'
  | 'MAX_PAGES'
  | 'PAGE_TIMEOUT'
  | 'DOMAIN_TIMEOUT'
  | 'BODY_TOO_LARGE'
  | 'REDIRECT_BLOCKED'
  | 'SSRF_BLOCKED'
  | 'ORIGIN_VIOLATION'
  | 'USER_CANCELLED'
  | 'ERROR'
  | 'COMPLETE'
  | 'NONE';

// ============================================================================
// 2. Extracted Evidence Models (Bounded, Typed Projections)
// ============================================================================

export interface CandidateWebsiteEvidence {
  readonly targetUrl: string;
  readonly canonicalUrl: string;
  readonly domain: string;
  readonly pageTitle: string;
  readonly metaDescription?: string;
  readonly description?: string;
  readonly businessName?: string;
  readonly businessHours?: string;
  readonly technologies: readonly {
    readonly name: string;
    readonly category: string;
    readonly state: string;
  }[];
  readonly services: readonly string[];
  readonly sourcePages: readonly string[];
}

export interface CandidateContactItem {
  readonly email?: string;
  readonly rawEmail?: string;
  readonly phone?: string;
  readonly rawPhone?: string;
  readonly classification?: string;
  readonly sourceUrl: string;
  readonly observedAt: string;
}

export interface CandidateSocialProfile {
  readonly platform: string;
  readonly url: string;
  readonly sourceUrl: string;
}

export interface CandidateContactEvidence {
  readonly emails: readonly {
    readonly email: string;
    readonly rawEmail: string;
    readonly classification: string;
    readonly sourceUrl: string;
    readonly observedAt: string;
  }[];
  readonly phones: readonly {
    readonly phone: string;
    readonly rawPhone: string;
    readonly sourceUrl: string;
    readonly observedAt: string;
  }[];
  readonly socialProfiles: readonly CandidateSocialProfile[];
  readonly address?: {
    readonly address: string;
    readonly sourceUrl: string;
  };
  readonly contactForms: readonly {
    readonly actionUrl?: string;
    readonly formType?: string;
  }[];
}

export interface CandidatePersonItem {
  readonly fullName: string;
  readonly jobTitle?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly linkedInUrl?: string;
  readonly sourceUrl: string;
  readonly evidenceType: string;
  readonly observedAt: string;
}

export interface CandidatePersonEvidence {
  readonly people: readonly CandidatePersonItem[];
}

// ============================================================================
// 3. Candidate Enrichment Result Contract (Section 34)
// ============================================================================

export interface CandidateEnrichmentResult {
  readonly sessionCandidateId: string;
  readonly websiteTarget: string;
  readonly status: CandidateEnrichmentStatus;
  readonly pagesVisited: readonly string[];
  readonly pagesDiscovered: number;
  readonly websiteEvidence?: CandidateWebsiteEvidence;
  readonly contactEvidence?: CandidateContactEvidence;
  readonly personEvidence?: CandidatePersonEvidence;
  readonly qualityIssues: readonly string[];
  readonly diagnostics: readonly GoogleMapsAcquisitionDiagnostic[];
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly durationMs: number;
  readonly truncated: boolean;
  readonly terminationReason: EnrichmentTerminationReason;
  readonly crawlerVersion: string;
  readonly retryCount: number;
  readonly fromCache: boolean;
}

// ============================================================================
// 4. Compact Candidate Summary for View / Table Display
// ============================================================================

export interface CandidateEnrichmentSummary {
  readonly status: CandidateEnrichmentStatus;
  readonly targetUrl?: string;
  readonly emailsCount: number;
  readonly phonesCount: number;
  readonly socialCount: number;
  readonly peopleCount: number;
  readonly pagesVisited: number;
  readonly completedAt?: string;
}

// ============================================================================
// 5. Enrichment Queue Snapshot & Metrics (Section 40, 77, 78)
// ============================================================================

export interface EnrichmentQueueSnapshot {
  readonly totalEligible: number;
  readonly eligible: number;
  readonly queued: number;
  readonly running: number;
  readonly completed: number;
  readonly partial: number;
  readonly failed: number;
  readonly blocked: number;
  readonly skipped: number;
  readonly deferred: number;
  readonly currentCandidateId?: string;

  // Crawl stats
  readonly pagesAttempted: number;
  readonly pagesSucceeded: number;
  readonly pagesFailed: number;

  // Contact metrics
  readonly emailsFound: number;
  readonly phonesFound: number;
  readonly socialLinksFound: number;
  readonly personsFound: number;

  // Conflict metrics
  readonly websiteConflicts: number;
  readonly contactConflicts: number;

  // Lifecycle
  readonly isPaused: boolean;
  readonly isCancelled: boolean;
}

// ============================================================================
// 6. Enrichment Policy & Configuration
// ============================================================================

export interface EnrichmentPolicy {
  readonly maxPendingEnrichmentJobs: number; // Backpressure bound (default: 500)
  readonly maxConcurrentTasks: number;      // Concurrency bound (default: 1)
  readonly maxRetries: number;              // Transient failure retries (default: 1)
  readonly maxPagesPerDomain: number;       // Bound (default: 5)
  readonly pageTimeoutMs: number;           // Per page timeout (default: 10000ms = 10s)
  readonly domainTimeoutMs: number;         // Per domain budget (default: 30000ms = 30s)
  readonly maxDocumentBytes: number;        // Document size bound (default: 500000 = 500KB)
  readonly collectPeople: boolean;          // Default: true
  readonly collectServices: boolean;        // Default: true
  readonly detectTechnology: boolean;       // Default: true
}

export const DEFAULT_ENRICHMENT_POLICY: EnrichmentPolicy = {
  maxPendingEnrichmentJobs: 200,
  maxConcurrentTasks: 1,
  maxRetries: 1,
  maxPagesPerDomain: 5,
  pageTimeoutMs: 10000,
  domainTimeoutMs: 30000,
  maxDocumentBytes: 500000,
  collectPeople: true,
  collectServices: true,
  detectTechnology: true
};

export const ENRICHMENT_ADAPTER_VERSION = '1.0.0-phase21-22';
