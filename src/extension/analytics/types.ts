/**
 * LeadNoria — Phase 30: Production Intelligence Analytics & Run Quality Insights
 * Analytics Type Definitions & Observation Contracts
 *
 * Invariants:
 * - Pure observation/quality analytics layer
 * - NEVER buyer intent scoring, conversion prediction, sales propensity, or black-box scores
 * - All metrics derived only from observable evidence present in CanonicalLeadRecord / UnifiedResearchRecord
 * - Google Maps remains strictly INTERNAL / EXPERIMENTAL; restricted data stays restricted
 * - Zero telemetry, 100% local execution
 */

import { SourceType } from '../pipeline/pipelineTypes.ts';
import { AdvancedQualificationState } from '../qualification/qualificationTypes.ts';

export const ANALYTICS_SCHEMA_VERSION = 'lead-analytics-v1';

// Authoritative Phase 21 Website Intelligence Limits
export const AUTHORITATIVE_WEBSITE_LIMITS = {
  MAX_PAGES_PER_DOMAIN: 5,
  PAGE_TIMEOUT_MS: 10000,
  DOMAIN_TIMEOUT_MS: 30000,
  MAX_DOCUMENT_SIZE_BYTES: 512000 // 500 KB
} as const;

/**
 * Run-level aggregate volume and processing counts
 */
export interface RunLevelMetrics {
  recordsDiscovered: number;
  recordsAccepted: number;
  duplicatesDetected: number;
  recordsMerged: number;
  recordsRejected: number;
  recordsWithWebsite: number;
  recordsWithVerifiedWebsite: number;
  recordsWithEmail: number;
  recordsWithPhone: number;
  recordsWithPublicPeople: number;
  recordsWithSocialLinks: number;
  recordsWithServices: number;
  qualifiedCount: number;
  notQualifiedCount: number;
  uncertainCount: number;
  blockedCount: number;
  conflictedCount: number;
  incompleteCount: number;
  exportableCount: number;
}

/**
 * Coverage metrics across all canonical dimensions
 */
export interface CoverageMetrics {
  totalEligibleRecords: number;
  // Percentage coverage (0.0 to 100.0, deterministic 1 decimal place)
  identityCoverage: number;
  businessCoverage: number;
  locationCoverage: number;
  websiteCoverage: number;
  emailCoverage: number;
  phoneCoverage: number;
  peopleCoverage: number;
  servicesCoverage: number;
  socialCoverage: number;
  qualificationCoverage: number;
  evidenceCoverage: number;
  freshnessCoverage: number;
  // Raw observed counts
  rawCounts: {
    identityCount: number;
    businessCount: number;
    locationCount: number;
    websiteCount: number;
    emailCount: number;
    phoneCount: number;
    peopleCount: number;
    servicesCount: number;
    socialCount: number;
    qualificationCount: number;
    evidenceCount: number;
    freshnessCount: number;
  };
}

/**
 * Observed contactability categories based ONLY on actual fields
 */
export interface ContactabilityMetrics {
  totalRecords: number;
  // Mutually distinct categories based on observed channels
  emailAndPhoneCount: number;
  emailOnlyCount: number;
  phoneOnlyCount: number;
  contactFormOnlyCount: number;
  personAvailableOnlyCount: number;
  noPublicContactSignalCount: number;
  // Channel totals
  totalEmailAvailableCount: number;
  totalPhoneAvailableCount: number;
  totalPublicPersonAvailableCount: number;
  totalContactFormAvailableCount: number;
  // Coverage percentages
  emailPercentage: number;
  phonePercentage: number;
  fullContactabilityPercentage: number; // Email + Phone
  noContactSignalPercentage: number;
}

/**
 * Website intelligence metrics adhering to Phase 21 limits
 */
export interface WebsiteMetrics {
  limits: typeof AUTHORITATIVE_WEBSITE_LIMITS;
  websitePresentCount: number;
  websiteVerifiedCount: number;
  websiteUnavailableCount: number;
  websiteTimeoutCount: number;
  websiteBlockedBySafetyCount: number;
  websiteNonBusinessCount: number;
  websiteParkedCount: number;
  pagesSuccessfullyInspected: number;
  contactSignalsDiscovered: number;
  technologySignalsDiscovered: number;
  socialSignalsDiscovered: number;
  personSignalsDiscovered: number;
  verificationRate: number; // Percentage of present websites verified
}

/**
 * Qualification analytics summarized from Phase 23 reason graph
 */
export interface QualificationAnalytics {
  qualifiedCount: number;
  notQualifiedCount: number;
  uncertainCount: number;
  blockedCount: number;
  // Reason category breakdown
  mandatoryFailureCount: number;
  missingEvidenceCount: number;
  contradictoryEvidenceCount: number;
  insufficientCompletenessCount: number;
  corroborationWeaknessCount: number;
  freshnessIssueCount: number;
  // Detailed reason code distributions
  reasonBreakdown: Array<{
    code: string;
    count: number;
    category: 'MANDATORY_FAIL' | 'MISSING_EVIDENCE' | 'CONTRADICTION' | 'INSUFFICIENT' | 'CORROBORATION' | 'FRESHNESS' | 'PASS';
    description: string;
  }>;
}

/**
 * Source attribution & firewall metrics
 */
export interface SourceMetrics {
  primarySource: SourceType;
  sourceRecordCount: number;
  sourceContributionCount: number;
  websiteEnrichmentContributionCount: number;
  mixedSourceRecordCount: number;
  restrictedSourceRecordCount: number;
  googleMapsStatus: 'INTERNAL_EXPERIMENTAL_RESTRICTED';
  restrictedPolicyNote: string;
}

/**
 * Restricted data aggregate view (firewall protected)
 */
export interface RestrictedDataAggregate {
  restrictedRecordCount: number;
  excludedFromExportCount: number;
  policyMessage: string;
}

/**
 * Explainable, rule-based quality warning
 */
export interface QualityWarning {
  id: string;
  code: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  metricName: string;
  observedValue: number;
  threshold: number;
  actionableRemedy: string;
}

/**
 * Typed, configurable thresholds for quality warnings
 */
export interface QualityWarningThresholds {
  highMissingEmailRateThreshold: number;       // default: 60 (%)
  lowWebsiteVerificationThreshold: number;     // default: 40 (%)
  highUncertaintyRateThreshold: number;        // default: 25 (%)
  highConflictRateThreshold: number;           // default: 15 (%)
  highBlockedRateThreshold: number;            // default: 10 (%)
  lowPeopleCoverageThreshold: number;          // default: 20 (%)
  highDuplicateCandidateRatioThreshold: number;// default: 30 (%)
}

export const DEFAULT_QUALITY_THRESHOLDS: QualityWarningThresholds = {
  highMissingEmailRateThreshold: 60.0,
  lowWebsiteVerificationThreshold: 40.0,
  highUncertaintyRateThreshold: 25.0,
  highConflictRateThreshold: 15.0,
  highBlockedRateThreshold: 10.0,
  lowPeopleCoverageThreshold: 20.0,
  highDuplicateCandidateRatioThreshold: 30.0
};

/**
 * Top-level snapshot for a research run
 */
export interface RunAnalyticsSnapshot {
  schemaVersion: string;
  runId: string;
  runTitle?: string;
  sourceType: SourceType;
  createdAt: string;
  totalRecords: number;
  runMetrics: RunLevelMetrics;
  coverage: CoverageMetrics;
  contactability: ContactabilityMetrics;
  website: WebsiteMetrics;
  qualification: QualificationAnalytics;
  source: SourceMetrics;
  restrictedAggregate: RestrictedDataAggregate;
  warnings: QualityWarning[];
}

/**
 * Detailed entity-level change record
 */
export interface EntityFieldDelta {
  field: string;
  oldValue: string | null;
  newValue: string | null;
  description: string;
}

export interface EntityChangeRecord {
  entityId: string;
  businessName: string;
  changeType: 'NEW' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';
  fieldDeltas: EntityFieldDelta[];
}

/**
 * Deterministic change analysis between two runs
 */
export interface ChangeAnalysisResult {
  baseRunId: string;
  compareRunId: string;
  newRecordsCount: number;
  removedRecordsCount: number;
  unchangedRecordsCount: number;
  changedRecordsCount: number;
  changedWebsiteCount: number;
  changedContactCount: number;
  changedPeopleCount: number;
  changedQualificationCount: number;
  changedFreshnessCount: number;
  newlyConflictingCount: number;
  newlyResolvedCount: number;
  detailedChanges: EntityChangeRecord[];
}

/**
 * Run comparison snapshot
 */
export interface MetricComparisonItem {
  metricName: string;
  baseValue: number;
  compareValue: number;
  delta: number;
  percentageChange: number;
  descriptiveNote: string;
}

export interface RunComparisonSnapshot {
  baseRunId: string;
  compareRunId: string;
  generatedAt: string;
  metricsDiff: MetricComparisonItem[];
  descriptiveSummary: string[];
  changeAnalysis: ChangeAnalysisResult;
}

/**
 * Filter handoff preset for navigating from analytics to results
 */
export type AnalyticsFilterTarget =
  | 'MISSING_EMAIL'
  | 'MISSING_PHONE'
  | 'MISSING_WEBSITE'
  | 'VERIFIED_WEBSITE'
  | 'QUALIFIED'
  | 'UNCERTAIN'
  | 'NOT_QUALIFIED'
  | 'BLOCKED'
  | 'CONFLICTED'
  | 'INCOMPLETE'
  | 'PUBLIC_PEOPLE';
