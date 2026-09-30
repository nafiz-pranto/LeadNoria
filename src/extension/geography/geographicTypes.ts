/**
 * LeadNoria — Phase 13: Geographic Expansion & Saturation
 * Geographic Types & Contracts
 * 
 * Non-Negotiable Boundaries:
 * - Separates Geographic Planning from Source Extraction
 * - Google Maps remains CONTRACT_ONLY (no DOM/network scraping)
 * - Deterministic, versioned, explainable coverage and saturation accounting
 */

import { SourceType, SourceContribution, ProvenanceType } from '../extraction/types.ts';
import { AdvancedQualificationState } from '../qualification/qualificationTypes.ts';

export const EVALUATOR_VERSION = '1.0.0-phase13';

// ==========================================
// 1. Geographic Hierarchy & Level Types
// ==========================================

export type GeographicLevel =
  | 'WORLD'
  | 'COUNTRY'
  | 'REGION'
  | 'STATE_PROVINCE'
  | 'CITY'
  | 'DISTRICT'
  | 'POSTAL_REGION'
  | 'CUSTOM_AREA';

export interface GeographicCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeographicBoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export type GeographicAreaStatus =
  | 'ACTIVE'
  | 'AMBIGUOUS'
  | 'INVALID'
  | 'INACTIVE';

export interface GeographicArea {
  areaId: string;
  parentAreaId?: string;
  level: GeographicLevel;
  name: string;
  canonicalName: string;
  countryCode?: string;       // ISO 3166-1 alpha-2 where available
  regionCode?: string;
  cityCode?: string;
  postalCode?: string;
  boundingBox?: GeographicBoundingBox;
  center?: GeographicCoordinates;
  radiusMeters?: number;
  geometryReference?: string;
  status: GeographicAreaStatus;
  depth: number;
  priority?: number;          // Planning priority (higher = processed earlier; not a business value forecast)
  metadata?: Record<string, string>;
}

// ==========================================
// 2. Coverage & Expansion State
// ==========================================

export type CoverageState =
  | 'PLANNED'
  | 'QUEUED'
  | 'IN_PROGRESS'
  | 'PARTIALLY_PROCESSED'
  | 'COMPLETED'
  | 'SATURATED'
  | 'BLOCKED'
  | 'FAILED'
  | 'UNKNOWN'
  | 'CANCELLED';

export type ExpansionStrategy =
  | 'HIERARCHICAL_EXPANSION'
  | 'COUNTRY_TO_REGION_TO_CITY'
  | 'REGION_FIRST'
  | 'CITY_FIRST'
  | 'CUSTOM_AREA_ORDER'
  | 'MANUAL_QUEUE';

// ==========================================
// 3. Search Unit Abstraction
// ==========================================

export type SearchUnitStatus =
  | 'PLANNED'
  | 'QUEUED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CANCELLED';

export interface SearchUnitResultMetrics {
  rawCandidateCount: number;
  normalizedCandidateCount: number;
  uniqueEntityCount: number;
  duplicateCount: number;
  unresolvedCount: number;
  relevantCount: number;
  qualifiedCount: number;
  blockedCount: number;
  errorCount: number;
  newUniqueEntities: number;
  newQualifiedEntities: number;
  marginalUniqueYield: number | 'NOT_AVAILABLE';
  marginalQualifiedYield: number | 'NOT_AVAILABLE';
  overlapRate: number | 'NOT_AVAILABLE';
  duplicateRate: number | 'NOT_AVAILABLE';
  unresolvedRate: number | 'NOT_AVAILABLE';
  errorRate: number | 'NOT_AVAILABLE';
  isNoResults: boolean;
  isFailure: boolean;
  durationMs: number;
}

export interface SearchUnit {
  searchUnitId: string;
  planId: string;
  geographicAreaId: string;
  sourceType: SourceType;
  category?: string;
  queryVariant?: string;
  language?: string;
  countryCode?: string;
  sequence: number;
  priority: number;
  status: SearchUnitStatus;
  resultMetrics?: SearchUnitResultMetrics;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  failedReason?: string;
  retryCount: number;
}

// ==========================================
// 4. Coverage Cell & Matrix
// ==========================================

export interface CoverageCell {
  areaId: string;
  sourceType: SourceType;
  categoryId: string;
  queryVariantId: string;
  status: CoverageState;
  candidateCount: number;
  uniqueCandidateCount: number;
  duplicateCount: number;
  unresolvedCount: number;
  relevantCount: number;
  qualifiedCount: number;
  blockedCount: number;
  errorCount: number;
  processedAt?: string;
  durationMs: number;
}

// ==========================================
// 5. Saturation Policy & State
// ==========================================

export interface SaturationPolicy {
  policyVersion: string;
  minimumSamples: number;             // Minimum completed units before saturation can trigger (e.g. 3)
  minimumMarginalYield: number;       // Marginal unique yield threshold (e.g. 0.05 = 5%)
  consecutiveLowYieldUnits: number;   // Number of consecutive units required below threshold (e.g. 2 or 3)
  maximumUnits: number;               // Safety ceiling for search units
  maximumAreas: number;               // Safety ceiling for geographic areas
  maximumCandidates: number;          // Safety ceiling for total candidates
  maximumRuntimeMs: number;           // Safety ceiling for run duration
  maximumErrorRate: number;           // Safety error rate ceiling (e.g. 0.25 = 25%)
  allowManualContinue: boolean;       // Support explicit manual continuation after saturation
}

export type SaturationScope =
  | 'AREA_SATURATED'
  | 'CATEGORY_SATURATED'
  | 'QUERY_VARIANT_SATURATED'
  | 'SOURCE_SATURATED'
  | 'GLOBAL_SCOPE_SATURATED'
  | 'NOT_SATURATED';

export interface SaturationState {
  isSaturated: boolean;
  saturationScope: SaturationScope;
  scopeIdentifier?: string;           // E.g. areaId or category name
  consecutiveLowYieldCount: number;
  evaluatedUnits: number;
  triggeredReasons: string[];
  lastEvaluatedAt: string;
}

// ==========================================
// 6. Stopping Conditions
// ==========================================

export type StoppingCondition =
  | 'MAX_AREAS'
  | 'MAX_SEARCH_UNITS'
  | 'MAX_CANDIDATES'
  | 'MAX_RUNTIME'
  | 'SATURATION_REACHED'
  | 'ERROR_THRESHOLD'
  | 'MANUAL_STOP'
  | 'SOURCE_BLOCKED';

// ==========================================
// 7. Geographic Plan & Checkpoint
// ==========================================

export interface GeographicPlanLimits {
  maxAreas: number;
  maxHierarchyDepth: number;
  maxSearchUnits: number;
  maxCandidates: number;
  maxRuntimeMs: number;
  maxConcurrentUnits: number;
}

export interface GeographicPlan {
  planId: string;
  planVersion: string;
  sourceTypes: SourceType[];
  rootAreas: GeographicArea[];
  expansionStrategy: ExpansionStrategy;
  categories: string[];
  queryVariants: string[];
  languages?: string[];
  saturationPolicy: SaturationPolicy;
  limits: GeographicPlanLimits;
  createdAt: string;
  evaluatorVersion: string;
  metadata?: Record<string, string>;
}

export interface GeographicCheckpoint {
  checkpointId: string;
  runId: string;
  planId: string;
  planVersion: string;
  evaluatorVersion: string;
  processedAreaIds: string[];
  completedUnitIds: string[];
  failedUnitIds: string[];
  activeUnitId?: string;
  observedEntityIds: string[];
  observedBranchIds: string[];
  areaEntityMap: Record<string, string[]>;      // areaId -> entityIds
  saturationState: SaturationState;
  stopReasons: StoppingCondition[];
  aggregateMetrics: SearchUnitResultMetrics;
  lastSequenceNumber: number;
  savedAt: string;
}

// ==========================================
// 8. Candidate Ingestion Fact for Accounting
// ==========================================

export interface CandidateAccountingInput {
  candidateId: string;
  entityId: string;                           // Phase 8 resolved entity ID
  branchId?: string;                          // Phase 8 distinct physical branch ID
  organizationId?: string;                    // Phase 8 root organization ID
  isUnresolved?: boolean;                     // Phase 8 unresolved status
  isContradictory?: boolean;                  // Phase 8 conflict status
  relevanceState?: 'RELEVANT' | 'UNCERTAIN' | 'NOT_RELEVANT'; // Phase 9
  qualificationState?: AdvancedQualificationState;             // Phase 12
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  isRestricted?: boolean;
}
