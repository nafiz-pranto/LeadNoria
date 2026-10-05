/**
 * LeadNoria — Phase 32: Production Feedback, Reliability & Growth Readiness
 * Type Contracts & Production Issue Taxonomy
 *
 * Invariants:
 * - 100% local-first: ZERO third-party analytics, ZERO remote telemetry, ZERO cloud beacons.
 * - Evidence-derived: all metrics reflect actual recorded browser runs and operations.
 * - Privacy-preserving: diagnostics NEVER store passwords, cookies, tokens, or raw scraped PII.
 * - Google contract firewall strictly preserved: restricted Google fields are never exposed.
 * - Deterministic: identical inputs produce identical fingerprints, metrics, and packages.
 */

export const DIAGNOSTICS_SCHEMA_VERSION = 'diagnostics-v1';
export const DEFAULT_MAX_DIAGNOSTIC_ISSUES = 100;
export const DIAGNOSTIC_COLLECTION_NAME = 'production_diagnostic_issues';

/**
 * Severity ranking for operational issues
 */
export type IssueSeverity = 'P0' | 'P1' | 'P2' | 'P3';

/**
 * Categorical taxonomy covering the entire LeadNoria pipeline & extension lifecycle
 */
export type IssueCategory =
  | 'ACQUISITION'
  | 'WEBSITE'
  | 'NORMALIZATION'
  | 'ENTITY_RESOLUTION'
  | 'QUALIFICATION'
  | 'PERSISTENCE'
  | 'EXPORT'
  | 'UI'
  | 'LIFECYCLE'
  | 'SECURITY'
  | 'POLICY'
  | 'PERFORMANCE'
  | 'UNKNOWN';

/**
 * Discrete pipeline and application workflow stages
 */
export type WorkflowStage =
  | 'SOURCE_PLANNING'
  | 'SOURCE_EXECUTION'
  | 'NORMALIZATION'
  | 'ENTITY_RESOLUTION'
  | 'RELEVANCE'
  | 'WEBSITE_VERIFICATION'
  | 'CONTACT_ENRICHMENT'
  | 'QUALIFICATION'
  | 'GEOGRAPHIC_ACCOUNTING'
  | 'PERSISTENCE'
  | 'EXPORT'
  | 'UI_RENDER'
  | 'INITIALIZATION'
  | 'IDLE';

/**
 * User-actionable resolution status of a recorded issue
 */
export type IssueResolutionState = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'IGNORED';

/**
 * Whether the failed operation can be safely retried
 */
export type Retryability = 'YES' | 'NO' | 'CONDITIONAL';

/**
 * Canonical model for a captured production issue
 */
export interface ProductionIssue {
  issueId: string;
  fingerprint: string;
  severity: IssueSeverity;
  category: IssueCategory;
  workflowStage: WorkflowStage;
  humanReadableMessage: string;
  sanitizedTechnicalCode: string;
  version: string;
  browser: string;
  os: string;
  timestamp: string;
  occurrenceCount: number;
  affectedRunIds: string[];
  lastSeen: string;
  reproductionHint: string;
  resolutionState: IssueResolutionState;
  retryability: Retryability;
  userImpact: string;
  context?: Record<string, string | number | boolean>;
}

/**
 * Aggregated summary of repeated production issues sharing the same fingerprint
 */
export interface AggregatedIssue {
  fingerprint: string;
  category: IssueCategory;
  severity: IssueSeverity;
  humanReadableMessage: string;
  sanitizedTechnicalCode: string;
  workflowStage: WorkflowStage;
  occurrenceCount: number;
  affectedRunCount: number;
  firstSeen: string;
  lastSeen: string;
  retryability: Retryability;
  userImpact: string;
  resolutionState: IssueResolutionState;
}

/**
 * Sample sufficiency guardrails for reliability observations
 */
export type ReliabilitySampleSufficiency = 'NO_DATA' | 'LOW_SAMPLE' | 'MODERATE_SAMPLE' | 'STRONG_SAMPLE';

/**
 * Operational reliability metrics calculated strictly from observed run history
 */
export interface ReliabilityMetrics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  partialRuns: number;
  cancelledRuns: number;
  recoveryCount: number;
  retryCount: number;
  exportSuccesses: number;
  exportFailures: number;
  persistenceFailures: number;
  websiteTimeoutCount: number;
  acquisitionFailureCount: number;
  averageRunDurationMs: number;
  p95RunDurationMs: number;
  runSuccessRate: number;        // successfulRuns / max(1, completedRuns)
  issueRatePerRun: number;       // runsWithIssues / max(1, totalRuns)
  recoveryRate: number;          // recoveryCount / max(1, recoverableFailedRuns)
  sampleSufficiency: ReliabilitySampleSufficiency;
}

/**
 * Internal operational guardrail alert identifiers
 */
export type OperationalGuardrailAlertType =
  | 'HIGH_FAILURE_RATE'
  | 'HIGH_PERSISTENCE_FAILURE_RATE'
  | 'HIGH_EXPORT_FAILURE_RATE'
  | 'HIGH_RECOVERY_FAILURE_RATE'
  | 'HIGH_WEBSITE_TIMEOUT_RATE'
  | 'HIGH_UI_ERROR_RATE'
  | 'HIGH_P95_RUNTIME';

export interface OperationalGuardrailAlert {
  alertId: string;
  alertType: OperationalGuardrailAlertType;
  severity: IssueSeverity;
  title: string;
  description: string;
  observedValue: number;
  thresholdValue: number;
  unit: string;
  remediationRecommendation: string;
}

/**
 * Storage health and capacity analysis
 */
export interface StorageHealthSummary {
  collectionCounts: Record<string, number>;
  estimatedBytes: number;
  quotaLimitBytes: number;
  quotaUsagePercent: number;
  isPressureHigh: boolean;
  retentionPolicies: Record<string, { maxEntries: number; strategy: string }>;
}

/**
 * Sanitized user-exportable diagnostic package
 */
export interface DiagnosticReproductionPackage {
  schemaVersion: string;
  product: 'LeadNoria';
  version: string;
  generatedAt: string;
  environment: {
    browser: string;
    os: string;
    userAgentSummary: string;
  };
  reliabilitySummary: ReliabilityMetrics;
  activeGuardrailAlerts: OperationalGuardrailAlert[];
  topIssues: AggregatedIssue[];
  storageHealth: StorageHealthSummary;
  policySummary: {
    googleRestrictedAccountingCount: number;
    dataFirewallActive: boolean;
    localOnlyEnforced: boolean;
  };
}

/**
 * Thresholds for operational guardrails
 */
export const DEFAULT_GUARDRAIL_THRESHOLDS = {
  MIN_SAMPLE_RUNS: 5,
  MAX_RUN_FAILURE_RATE: 25.0,            // Alert if > 25% of completed runs fail
  MAX_PERSISTENCE_FAILURE_RATE: 5.0,     // Alert if > 5% of runs have persistence errors
  MAX_EXPORT_FAILURE_RATE: 5.0,          // Alert if > 5% of exports fail
  MIN_RECOVERY_RATE: 50.0,               // Alert if < 50% of recoverable crashes recover
  MAX_WEBSITE_TIMEOUT_RATE: 30.0,        // Alert if > 30% of website visits timeout
  MAX_P95_RUNTIME_MS: 120_000,           // Alert if 95th percentile run duration exceeds 2 minutes
  STORAGE_PRESSURE_WARNING_PERCENT: 80.0 // Alert if local storage exceeds 80% quota
} as const;
