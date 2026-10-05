/**
 * LeadNoria — Phase 31: Research Optimization & Saturation Intelligence
 * Type Contracts & Optimization Models
 *
 * Invariants:
 * - Purely evidence-derived and observational.
 * - ZERO predictive lead scoring, ZERO buyer intent prediction, ZERO conversion forecasting.
 * - All recommendations derive strictly from historical LeadNoria records and observed run metrics.
 * - Google Maps remains CONTRACT_ONLY; restricted records are safely accounted for without exposing raw details.
 * - Deterministic: identical input runs and records always yield identical metrics, saturation states, and recommendations.
 */

import { SourceType } from '../extraction/types.ts';
import { GeographicLevel } from '../geography/geographicTypes.ts';
import { CanonicalLeadRecord } from '../leadIntelligence/types.ts';

export const OPTIMIZATION_SCHEMA_VERSION = 'research-optimization-v1';

/**
 * Sample-size guardrails to prevent ungrounded claims on tiny samples
 */
export type SampleSufficiency =
  | 'NO_DATA'           // 0 observations
  | 'LOW_SAMPLE'        // 1 to 4 observations
  | 'MODERATE_SAMPLE'   // 5 to 19 observations
  | 'STRONG_SAMPLE';    // 20+ observations

export const DEFAULT_SAMPLE_THRESHOLDS = {
  LOW_SAMPLE_MAX: 4,
  MODERATE_SAMPLE_MAX: 19,
  STRONG_SAMPLE_MIN: 20
} as const;

/**
 * Deterministic saturation state based strictly on observed run history
 */
export type SaturationState =
  | 'UNDEREXPLORED'         // Low observed attempts or high marginal yield with low duplicate ratio
  | 'ACTIVE'                // Healthy new entity yield, moderate duplicate ratio
  | 'MODERATELY_SATURATED'  // Declining new entity yield, increasing duplicate ratio
  | 'HIGHLY_SATURATED'      // Consecutive low new entity yield, high duplicate ratio, strong sample
  | 'INSUFFICIENT_DATA';    // Sample size too small to evaluate saturation state

export const DEFAULT_SATURATION_THRESHOLDS = {
  MIN_SAMPLE_SIZE: 5,
  HIGH_DUPLICATE_RATIO: 65.0,    // >= 65% duplicates indicates heavy saturation pressure
  HIGH_SATURATION_DUP_RATIO: 70.0,
  LOW_MARGINAL_YIELD: 0.15,      // < 15% new entities per attempt indicates low marginal yield
  CONSECUTIVE_LOW_YIELD_MIN: 2   // Minimum consecutive low yield runs required for HIGHLY_SATURATED
} as const;

/**
 * Duplicate pressure level and evaluation
 */
export type DuplicatePressureLevel =
  | 'LOW'       // < 40% duplicate ratio
  | 'MODERATE'  // 40% - 64.9%
  | 'HIGH'      // 65% - 79.9%
  | 'CRITICAL'; // >= 80%

export interface DuplicatePressureAssessment {
  level: DuplicatePressureLevel;
  pressureLevel?: DuplicatePressureLevel;
  duplicateRatio: number;          // 0.0 - 100.0%
  repeatedEntityCount: number;
  totalObservedCandidates: number;
  warningHeadline?: string;
  explanation: string;
  evidence?: string[];
}

/**
 * Marginal research yield breakdown
 */
export interface MarginalYieldResult {
  searchUnitId: string;
  marginalYield?: number;
  marginalEntityYield: number;     // new canonical entities / attempts (or raw candidates)
  newEntityYield?: number;
  newWebsitesDiscovered?: number;
  marginalWebsiteYield: number;    // new verified websites / attempts
  newEmailsDiscovered?: number;
  marginalEmailYield: number;      // new verified emails / attempts
  newPhonesDiscovered?: number;
  marginalPhoneYield: number;      // new verified phones / attempts
  newPeopleDiscovered?: number;
  marginalPeopleYield: number;     // new public people / attempts
  marginalQualifiedYield: number;  // new qualified leads / attempts
  yieldTrend?: string;
  trend: 'INCREASING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_HISTORY';
}

/**
 * Quality-aware optimization dimensions (separate, non-collapsed)
 */
export interface QualityDimensionsProfile {
  discoveryYield: number;         // unique entities / raw candidates (0.0 - 100.0%)
  dataCoverage: number;           // overall observed field completeness (0.0 - 100.0%)
  contactCoverage: number;        // records with phone or email (0.0 - 100.0%)
  qualificationCoverage: number;  // records qualified or evaluated (0.0 - 100.0%)
  conflictPressure: number;       // field conflict frequency (0.0 - 100.0%)
  duplicatePressure: number;      // duplicate ratio (0.0 - 100.0%)
}

/**
 * Saturation assessment containing observable evidence and reasoning
 */
export interface SaturationAssessment {
  state: SaturationState;
  observedDuplicateRatio: number;
  duplicateRatio?: number;
  consecutiveLowYieldRuns: number;
  marginalEntityYield: number;
  marginalYield?: number;
  newEntityYield?: number;
  sampleSufficiency: SampleSufficiency;
  evidenceStatement: string;      // e.g. "Observed saturation is high based on repeated duplicate-heavy runs."
  observedEvidence?: string[];
  triggeringFactors: string[];
}

/**
 * Search unit performance profile
 */
export interface SearchUnitPerformance {
  searchUnitId: string;
  geographicAreaId: string;
  areaName: string;
  category: string;
  queryVariant: string;
  sourceType: SourceType;
  runIds: string[];
  attempts: number;
  rawCandidatesCount: number;
  rawCandidateCount?: number;
  uniqueEntitiesCount: number;
  uniqueCanonicalEntities?: number;
  newEntitiesCount: number;
  newEntitiesDiscovered?: number;
  duplicateCandidateCount?: number;
  duplicateRatio: number;          // 0.0 - 100.0%
  marginalYield: any;              // number or MarginalYieldResult
  websiteCoverage: number;         // 0.0 - 100.0%
  contactCoverage: number;         // 0.0 - 100.0%
  emailCoverage: number;           // 0.0 - 100.0%
  phoneCoverage: number;           // 0.0 - 100.0%
  peopleCoverage: number;          // 0.0 - 100.0%
  qualificationCoverage: number;   // 0.0 - 100.0%
  uncertaintyRate: number;         // 0.0 - 100.0%
  conflictRate: number;            // 0.0 - 100.0%
  exportableCount: number;
  sampleSufficiency: SampleSufficiency;
  saturationAssessment: SaturationAssessment;
  saturation?: SaturationAssessment;
  duplicatePressure: DuplicatePressureAssessment;
  marginalYieldResult: MarginalYieldResult;
  qualityDimensions: QualityDimensionsProfile;
  firstObservedAt: string;
  lastObservedAt: string;
}

/**
 * Types of deterministic next-research recommendations
 */
export type RecommendationType =
  | 'EXPLORE_UNDER_SAMPLED_UNIT'
  | 'EXPLORE_UNDEREXPLORED'
  | 'EXPLORE_ADJACENT_GEOGRAPHY'
  | 'TRY_ADJACENT_UNIT'
  | 'REDUCE_SATURATED_QUERYING'
  | 'REDUCE_SATURATED_QUERY'
  | 'REVISIT_HIGH_WEBSITE_LOW_CONTACT'
  | 'REVISIT_ENRICHMENT'
  | 'INVESTIGATE_HIGH_CONFLICT_UNIT'
  | 'INVESTIGATE_CONFLICTS'
  | 'INVESTIGATE_UNCERTAINTY'
  | 'TARGET_HIGH_MARGINAL_YIELD_CATEGORY';

export interface ResearchRecommendation {
  recommendationId: string;
  type: RecommendationType;
  priority?: number;
  headline: string;
  sourceSearchUnitId?: string;
  targetSearchUnitId: string;
  targetAreaName: string;
  targetCategory: string;
  targetQueryVariant: string;
  evidenceBasis: string;
  observedEvidence?: string[];
  triggeringMetrics: Record<string, number | string>;
  thresholds: Record<string, number | string>;
  sampleSufficiency: SampleSufficiency;
  confidenceReason?: string;
  actionableNextQuery?: {
    geographicArea?: string;
    category?: string;
    queryVariant?: string;
  };
  relevantEntityIds: string[];
}

/**
 * Actionable optimization warning
 */
export interface OptimizationWarning {
  id: string;
  type?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  title: string;
  searchUnitId: string;
  message: string;
  remedy: string;
}

/**
 * Run-to-run comparison for research planning
 */
export interface RunComparisonForPlanning {
  baseRunId: string;
  targetRunId: string;
  metrics?: {
    uniqueEntities: { absoluteChange: number; percentageChange: number };
    marginalYield: { absoluteChange: number; percentageChange: number };
    duplicateRatio: { absoluteChange: number; percentageChange: number };
    contactCoverage: { absoluteChange: number; percentageChange: number };
  };
  metricsDiff: {
    rawCandidatesDelta: number;
    uniqueEntitiesDelta: number;
    duplicateRatioDelta: number;
    marginalYieldDelta: number;
    websiteCoverageDelta: number;
    emailCoverageDelta: number;
    phoneCoverageDelta: number;
    qualificationCoverageDelta: number;
    uncertaintyDelta: number;
    conflictDelta: number;
  };
  targetSampleSize?: number;
  baselineSampleSize?: number;
  targetFreshness?: string;
  baselineFreshness?: string;
  entityOverlapCount?: number;
  entityOverlapRatio?: number;
  sampleSizeBase: number;
  sampleSizeTarget: number;
  freshnessNote: string;
  summary?: string;
  descriptiveSummary: string;
}

/**
 * Geographic area summary for optimization planning
 */
export interface GeographicOptimizationSummary {
  areaId: string;
  areaName: string;
  level: GeographicLevel;
  observedCoveragePercent: number;
  uniqueEntitiesCount: number;
  saturationState: SaturationState;
  marginalYield: number;
  searchUnitIds: string[];
}

/**
 * Query/Category combination insights
 */
export interface QueryCategoryInsight {
  category: string;
  queryVariant: string;
  attempts: number;
  duplicateRatio: number;
  marginalYield: number;
  websiteCoverage: number;
  contactCoverage: number;
  uncertaintyRate: number;
  observationSummary: string;
}

/**
 * Coverage state describing observed coverage intelligence
 */
export interface CoverageState {
  totalObservedRecords: number;
  uniqueCanonicalEntities: number;
  duplicateCandidateCount: number;
  newEntityCount: number;
  websiteCoverageRatio: number;      // 0.0 - 100.0%
  emailCoverageRatio: number;        // 0.0 - 100.0%
  phoneCoverageRatio: number;        // 0.0 - 100.0%
  peopleCoverageRatio: number;       // 0.0 - 100.0%
  contactCoverageRatio: number;      // 0.0 - 100.0%
  qualificationCoverageRatio: number;// 0.0 - 100.0%
  uncertaintyRate: number;           // 0.0 - 100.0%
  conflictRate: number;              // 0.0 - 100.0%
  exportableCount: number;
  blockedCount: number;
  restrictedRecordCount: number;
}

/**
 * Full Research Optimization Snapshot
 */
export interface ResearchOptimizationSnapshot {
  snapshotId: string;
  schemaVersion: string; // OPTIMIZATION_SCHEMA_VERSION
  generatedAt: string;
  totalRunsAnalyzed: number;
  totalSearchUnitsAnalyzed: number;
  totalCanonicalLeadsObserved: number;
  overallCoverage: CoverageState;
  searchUnitPerformances: SearchUnitPerformance[];
  recommendations: ResearchRecommendation[];
  warnings: OptimizationWarning[];
  geographicBreakdown: GeographicOptimizationSummary[];
  queryCategoryInsights: QueryCategoryInsight[];
  restrictedRecordsAggregate: {
    restrictedCount: number;
    excludedFromExport: number;
    complianceNote: string;
  };
}
