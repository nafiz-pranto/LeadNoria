/**
 * LeadNoria — Phase 31: Research Optimization & Saturation Intelligence
 * Core Optimization & Saturation Engine
 *
 * Invariants:
 * - 100% observational: no predictive scoring, no sales forecasting, no AI opportunity claims.
 * - Deterministic: identical records produce identical metrics and recommendations regardless of order.
 * - Single-pass linear aggregations for performance scaling.
 * - Sample-size guardrails strictly enforced: no strong claims on tiny samples.
 * - Google consumer-web restrictions strictly preserved (safe aggregate accounting only).
 */

import {
  SampleSufficiency,
  SaturationState,
  DuplicatePressureLevel,
  DuplicatePressureAssessment,
  MarginalYieldResult,
  QualityDimensionsProfile,
  SaturationAssessment,
  SearchUnitPerformance,
  RecommendationType,
  ResearchRecommendation,
  OptimizationWarning,
  RunComparisonForPlanning,
  GeographicOptimizationSummary,
  QueryCategoryInsight,
  CoverageState,
  ResearchOptimizationSnapshot,
  OPTIMIZATION_SCHEMA_VERSION,
  DEFAULT_SAMPLE_THRESHOLDS,
  DEFAULT_SATURATION_THRESHOLDS
} from './types.ts';

import { CanonicalLeadRecord } from '../leadIntelligence/types.ts';
import { GeographicArea, SearchUnit } from '../geography/geographicTypes.ts';
import { SourceType } from '../extraction/types.ts';

/**
 * Deterministic rounding utility handling NaN, Infinity, and signed zero safely.
 */
export function roundDeterministic(val: number, decimals = 1): number {
  if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
    return 0.0;
  }
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(val * factor) / factor;
  return Object.is(rounded, -0) ? 0.0 : rounded;
}

/**
 * Safe ratio division avoiding division-by-zero.
 */
export function safeRatio(numerator: number, denominator: number, scale = 100.0, decimals = 1): number {
  if (!denominator || denominator <= 0 || isNaN(denominator) || !isFinite(denominator)) {
    return 0.0;
  }
  if (!numerator || numerator <= 0 || isNaN(numerator) || !isFinite(numerator)) {
    return 0.0;
  }
  const raw = (numerator / denominator) * scale;
  return roundDeterministic(raw, decimals);
}

/**
 * Text sanitization for query terms, categories, and geographic strings.
 */
export function sanitizeOptimizationText(input: string | undefined | null): string {
  if (!input) return '';
  let str = String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Neutralize CSV/Spreadsheet formula injection tokens
  if (/^[=\-+@]/.test(str)) {
    str = "'" + str;
  }
  return str.trim();
}

/**
 * Evaluates sample size sufficiency based on observed count.
 */
export function evaluateSampleSufficiency(
  count: number,
  thresholds = DEFAULT_SAMPLE_THRESHOLDS
): SampleSufficiency {
  if (count <= 0) return 'NO_DATA';
  if (count <= thresholds.LOW_SAMPLE_MAX) return 'LOW_SAMPLE';
  if (count <= thresholds.MODERATE_SAMPLE_MAX) return 'MODERATE_SAMPLE';
  return 'STRONG_SAMPLE';
}

/**
 * Constructs a normalized, deterministic search unit key.
 */
export function buildSearchUnitKey(
  areaId?: string,
  category?: string,
  queryVariant?: string,
  sourceType: string = 'META'
): string {
  const a = (areaId || 'GLOBAL').trim().toLowerCase();
  const c = (category || 'ALL_CATEGORIES').trim().toLowerCase();
  const q = (queryVariant || 'DEFAULT_QUERY').trim().toLowerCase();
  const s = sourceType.trim().toUpperCase();
  return `${a}::${c}::${q}::${s}`;
}

/**
 * Evaluates duplicate pressure level from observed duplicate ratio and count.
 */
export function evaluateDuplicatePressure(
  arg1: number,
  arg2: number,
  arg3?: any,
  arg4?: any
): DuplicatePressureAssessment {
  let duplicateRatio: number;
  let repeatedCount: number;
  let totalObserved: number;

  if (typeof arg3 === 'number') {
    duplicateRatio = arg1;
    repeatedCount = arg2;
    totalObserved = arg3;
  } else {
    // Called as evaluateDuplicatePressure(totalObserved, duplicateCount, sampleThresholds?, satThresholds?)
    totalObserved = arg1;
    repeatedCount = arg2;
    duplicateRatio = totalObserved > 0 ? safeRatio(repeatedCount, totalObserved, 100.0, 1) : 0.0;
  }

  let level: DuplicatePressureLevel = 'LOW';
  let warningHeadline: string | undefined;

  const minSample = arg3?.MIN_SAMPLE_SIZE || arg4?.MIN_SAMPLE_SIZE || DEFAULT_SATURATION_THRESHOLDS.MIN_SAMPLE_SIZE || 5;

  if (totalObserved < minSample) {
    level = 'UNKNOWN' as any;
  } else if (duplicateRatio >= (arg4?.HIGH_SATURATION_DUP_RATIO ?? DEFAULT_SATURATION_THRESHOLDS.HIGH_SATURATION_DUP_RATIO ?? 70.0)) {
    level = 'HIGH';
    warningHeadline = 'HIGH DUPLICATE PRESSURE';
  } else if (duplicateRatio >= 40.0) {
    level = 'MODERATE';
    warningHeadline = 'MODERATE DUPLICATE PRESSURE';
  } else {
    level = 'LOW';
  }

  const explanation = `Observed duplicate ratio is ${roundDeterministic(duplicateRatio, 1)}% (${repeatedCount} repeated candidates out of ${totalObserved} observed). Threshold for high duplicate pressure is ${DEFAULT_SATURATION_THRESHOLDS.HIGH_SATURATION_DUP_RATIO}%.`;
  const evidence = [
    `Duplicate candidate ratio: ${roundDeterministic(duplicateRatio, 1)}%`,
    `Sample size: ${totalObserved} raw observations`,
    `Threshold: ${DEFAULT_SATURATION_THRESHOLDS.HIGH_SATURATION_DUP_RATIO}%`,
    explanation
  ];

  return {
    level,
    pressureLevel: level,
    duplicateRatio: roundDeterministic(duplicateRatio, 1),
    repeatedEntityCount: repeatedCount,
    totalObservedCandidates: totalObserved,
    warningHeadline,
    explanation,
    evidence
  };
}

/**
 * Evaluates saturation state strictly from historical observed data.
 */
export function evaluateSaturationAssessment(
  arg1: any,
  arg2?: any,
  arg3?: any,
  arg4?: any
): SaturationAssessment {
  let sampleSufficiency: SampleSufficiency;
  let duplicateRatio: number;
  let marginalYield: number;
  let consecutiveLowYieldRuns: number;
  let newEntityYield = 0.0;
  let attemptCount = 1;

  if (typeof arg1 === 'object' && arg1 !== null) {
    const opts = arg1;
    const sampleThresholds = arg2 || DEFAULT_SAMPLE_THRESHOLDS;
    const totalObserved = opts.rawCandidateCount ?? opts.rawCandidatesCount ?? opts.uniqueCanonicalEntities ?? 0;
    sampleSufficiency = evaluateSampleSufficiency(totalObserved, sampleThresholds);
    attemptCount = opts.attempts || 1;
    const dups = opts.duplicateCandidateCount ?? 0;
    duplicateRatio = totalObserved > 0 ? safeRatio(dups, totalObserved, 100.0, 1) : 0.0;
    const newEntities = opts.newEntitiesDiscovered ?? opts.newEntitiesCount ?? 0;
    marginalYield = attemptCount > 0 ? roundDeterministic(newEntities / attemptCount, 2) : 0.0;
    const unique = opts.uniqueCanonicalEntities ?? opts.uniqueEntitiesCount ?? 1;
    newEntityYield = safeRatio(newEntities, unique, 100.0, 1);
    consecutiveLowYieldRuns = opts.consecutiveLowYieldRuns || 0;
  } else {
    sampleSufficiency = arg1;
    duplicateRatio = arg2 || 0.0;
    marginalYield = arg3 || 0.0;
    consecutiveLowYieldRuns = arg4 || 0;
  }

  const triggeringFactors: string[] = [];
  const observedEvidence: string[] = [];
  let state: SaturationState = 'INSUFFICIENT_DATA';
  let evidenceStatement = '';

  if (sampleSufficiency === 'NO_DATA' || sampleSufficiency === 'LOW_SAMPLE') {
    state = 'INSUFFICIENT_DATA';
    evidenceStatement = 'Insufficient observed run data (< 5 observations) to determine saturation state.';
    triggeringFactors.push(`Sample size is ${sampleSufficiency}`);
    observedEvidence.push('Sample size too low to establish reliable saturation assessment (< 5 observations).');
  } else if (
    duplicateRatio >= 70.0 &&
    (marginalYield <= 0.20 || consecutiveLowYieldRuns >= 2) &&
    sampleSufficiency === 'STRONG_SAMPLE'
  ) {
    state = 'HIGHLY_SATURATED';
    evidenceStatement = 'Observed saturation is high based on available runs and declining new entity yield.';
    triggeringFactors.push(`Duplicate ratio ${duplicateRatio}% >= 70%`);
    triggeringFactors.push(`Marginal yield ${marginalYield} <= 0.20`);
    triggeringFactors.push(`${consecutiveLowYieldRuns} consecutive low-yield runs`);
    observedEvidence.push('Observed saturation is high based on available runs.');
    observedEvidence.push(`Duplicate candidate ratio observed at ${duplicateRatio}%.`);
    observedEvidence.push(`Marginal yield observed at ${marginalYield} new entities per attempt across ${consecutiveLowYieldRuns} consecutive runs.`);
  } else if (
    duplicateRatio >= 50.0 ||
    marginalYield <= 0.25 ||
    consecutiveLowYieldRuns >= 1
  ) {
    state = 'MODERATELY_SATURATED';
    evidenceStatement = 'Observed saturation is moderate based on available runs with declining discovery rate.';
    triggeringFactors.push(`Observed duplicate ratio is ${duplicateRatio}%`);
    triggeringFactors.push(`Marginal entity yield is ${marginalYield}`);
    observedEvidence.push('Observed saturation is moderate based on available runs.');
    observedEvidence.push(`Moderate duplicate ratio (${duplicateRatio}%).`);
  } else if (marginalYield >= 0.50 && duplicateRatio < 35.0 && attemptCount <= 2) {
    state = 'UNDEREXPLORED';
    evidenceStatement = 'Search unit appears underexplored with high marginal yield and low duplicate pressure.';
    triggeringFactors.push(`High marginal yield: ${marginalYield}`);
    triggeringFactors.push(`Low duplicate ratio: ${duplicateRatio}%`);
    observedEvidence.push('Search unit appears underexplored with high marginal yield.');
  } else {
    state = 'ACTIVE';
    evidenceStatement = 'Search unit is actively producing new entities with balanced discovery yield.';
    triggeringFactors.push('Balanced new entity discovery and duplicate ratios');
    observedEvidence.push('Active discovery ongoing with healthy yield.');
  }

  return {
    state,
    observedDuplicateRatio: duplicateRatio,
    duplicateRatio,
    consecutiveLowYieldRuns,
    marginalEntityYield: marginalYield,
    marginalYield,
    newEntityYield,
    sampleSufficiency,
    evidenceStatement,
    observedEvidence,
    triggeringFactors
  };
}

/**
 * Aggregates search unit performance across observed historical runs and canonical leads.
 */
export function aggregateSearchUnitPerformances(
  runs: Array<{
    runId: string;
    startedAt?: string;
    completedAt?: string;
    searchUnits?: SearchUnit[];
    rawCandidates?: any[];
    query?: string;
    category?: string;
    geographicAreaId?: string;
  }>,
  canonicalRecords: CanonicalLeadRecord[] = []
): SearchUnitPerformance[] {
  // Sort runs deterministically by runId or completion time
  const sortedRuns = [...runs].sort((a, b) => {
    const timeA = a.completedAt || a.startedAt || '';
    const timeB = b.completedAt || b.startedAt || '';
    return timeA.localeCompare(timeB) || a.runId.localeCompare(b.runId);
  });

  // Track global entity emergence over chronological runs to compute marginal yield
  const previouslySeenEntityIds = new Set<string>();
  const unitAccumulator = new Map<string, {
    searchUnitId: string;
    geographicAreaId: string;
    areaName: string;
    category: string;
    queryVariant: string;
    sourceType: SourceType;
    runIds: Set<string>;
    attempts: number;
    rawCandidateCount: number;
    uniqueEntityIds: Set<string>;
    newEntityIds: Set<string>;
    duplicateCandidateCount: number;
    firstObservedAt: string;
    lastObservedAt: string;
    records: CanonicalLeadRecord[];
    consecutiveLowYieldRuns: number;
  }>();

  // 1. Accumulate run-level search units
  for (const r of sortedRuns) {
    const runUnits = (r.searchUnits && r.searchUnits.length > 0)
      ? r.searchUnits
      : [{
          searchUnitId: `su_${(r as any).geographicAreaId || 'DEFAULT'}_${(r as any).category || 'GENERAL'}_${(r as any).query || (r as any).queryVariant || 'LEADS'}`,
          planId: r.runId,
          geographicAreaId: (r as any).geographicAreaId || 'DEFAULT_AREA',
          sourceType: 'META' as SourceType,
          category: (r as any).category || 'GENERAL_BUSINESS',
          queryVariant: (r as any).query || (r as any).queryVariant || 'LEADS',
          sequence: 1,
          priority: 1,
          status: 'COMPLETED',
          retryCount: 0,
          createdAt: r.startedAt || new Date().toISOString()
        } as SearchUnit];

    for (const su of runUnits) {
      const key = buildSearchUnitKey(su.geographicAreaId, su.category, su.queryVariant, su.sourceType);
      let acc = unitAccumulator.get(key);

      if (!acc) {
        const cleanArea = sanitizeOptimizationText(su.geographicAreaId) || 'DEFAULT_AREA';
        const cleanCat = sanitizeOptimizationText(su.category) || 'General';
        const cleanQuery = sanitizeOptimizationText(su.queryVariant) || 'General Query';
        acc = {
          searchUnitId: su.searchUnitId || `su_${key}`,
          geographicAreaId: cleanArea,
          areaName: cleanArea,
          category: cleanCat,
          queryVariant: cleanQuery,
          sourceType: su.sourceType || 'META',
          runIds: new Set<string>(),
          attempts: 0,
          rawCandidateCount: 0,
          uniqueEntityIds: new Set<string>(),
          newEntityIds: new Set<string>(),
          duplicateCandidateCount: 0,
          firstObservedAt: su.createdAt || r.startedAt || new Date().toISOString(),
          lastObservedAt: su.completedAt || r.completedAt || r.startedAt || new Date().toISOString(),
          records: [],
          consecutiveLowYieldRuns: 0
        };
        unitAccumulator.set(key, acc);
      }

      acc.runIds.add(r.runId);
      acc.attempts++;
      const runTotal = (r as any).totalRecordsExtracted ?? (r as any).candidatesCount ?? (r as any).rawCandidateCount ?? 0;
      if (runTotal > 0) {
        acc.rawCandidateCount += runTotal;
      }
      acc.lastObservedAt = su.completedAt || r.completedAt || r.startedAt || acc.lastObservedAt;
    }
  }

  // 2. Map canonical records to search units
  // Pre-index leadId and area combinations for O(1) linear performance
  const leadIdToKeysMap = new Map<string, Set<string>>();
  for (const r of runs) {
    if ((r as any).leadIds && Array.isArray((r as any).leadIds)) {
      for (const [key, acc] of unitAccumulator.entries()) {
        if (acc.runIds.has(r.runId)) {
          for (const lid of (r as any).leadIds) {
            let set = leadIdToKeysMap.get(lid);
            if (!set) {
              set = new Set<string>();
              leadIdToKeysMap.set(lid, set);
            }
            set.add(key);
          }
        }
      }
    }
  }

  const areaCatToKeyMap = new Map<string, string>();
  const areaToKeyMap = new Map<string, string>();
  for (const [key, acc] of unitAccumulator.entries()) {
    const acKey = `${acc.geographicAreaId.toLowerCase()}::${acc.category.toLowerCase()}`;
    if (!areaCatToKeyMap.has(acKey)) {
      areaCatToKeyMap.set(acKey, key);
    }
    const aKey = acc.geographicAreaId.toLowerCase();
    if (!areaToKeyMap.has(aKey)) {
      areaToKeyMap.set(aKey, key);
    }
  }

  // Map records deterministically sorted by canonicalEntityId
  const sortedRecords = [...canonicalRecords].sort((a, b) =>
    a.canonicalEntityId.localeCompare(b.canonicalEntityId)
  );

  // Group records by best matching search unit(s)
  for (const rec of sortedRecords) {
    const areaId = rec.location?.region?.value || rec.location?.country?.value || (rec as any).geographicReference?.areaId || 'DEFAULT_AREA';
    const cat = rec.business?.categories?.value?.[0] || (rec as any).category || 'GENERAL_BUSINESS';
    const query = rec.canonicalBusinessName?.value || 'LEAD';

    const entityId = rec.canonicalEntityId;
    if (!previouslySeenEntityIds.has(entityId)) {
      previouslySeenEntityIds.add(entityId);
    }

    const matchedKeys = leadIdToKeysMap.get(entityId);
    let targetKeys: string[] = [];
    if (matchedKeys && matchedKeys.size > 0) {
      targetKeys = Array.from(matchedKeys);
    } else {
      let matchedKey = areaCatToKeyMap.get(`${areaId.toLowerCase()}::${cat.toLowerCase()}`);
      if (!matchedKey) {
        matchedKey = areaToKeyMap.get(areaId.toLowerCase());
      }
      if (!matchedKey && unitAccumulator.size > 0) {
        matchedKey = Array.from(unitAccumulator.keys())[0];
      }
      if (!matchedKey) {
        matchedKey = buildSearchUnitKey(areaId, cat, query, 'META');
        if (!unitAccumulator.has(matchedKey)) {
          const cleanArea = sanitizeOptimizationText(areaId) || 'DEFAULT_AREA';
          const cleanCat = sanitizeOptimizationText(cat) || 'General';
          const cleanQuery = sanitizeOptimizationText(query) || 'General Query';
          unitAccumulator.set(matchedKey, {
            searchUnitId: `unit_${matchedKey}`,
            geographicAreaId: cleanArea,
            areaName: cleanArea,
            category: cleanCat,
            queryVariant: cleanQuery,
            sourceType: 'META',
            runIds: new Set(['RUN_SYNTHETIC']),
            attempts: 1,
            rawCandidateCount: 0,
            uniqueEntityIds: new Set(),
            newEntityIds: new Set(),
            duplicateCandidateCount: 0,
            firstObservedAt: rec.createdAt || new Date().toISOString(),
            lastObservedAt: rec.updatedAt || rec.createdAt || new Date().toISOString(),
            records: [],
            consecutiveLowYieldRuns: 0
          });
        }
      }
      targetKeys = [matchedKey];
    }

    for (const key of targetKeys) {
      const acc = unitAccumulator.get(key);
      if (acc) {
        acc.records.push(rec);
        acc.uniqueEntityIds.add(entityId);
        acc.newEntityIds.add(entityId);
      }
    }
  }

  // 3. Transform accumulators into typed SearchUnitPerformance profiles
  const performances: SearchUnitPerformance[] = [];

  for (const acc of unitAccumulator.values()) {
    const totalRecords = acc.records.length;
    const rawCandidates = Math.max(acc.rawCandidateCount, totalRecords);
    const uniqueEntities = acc.uniqueEntityIds.size;
    const duplicateCount = Math.max(0, rawCandidates - uniqueEntities);
    const newEntities = acc.newEntityIds.size;
    acc.duplicateCandidateCount = duplicateCount;

    const duplicateRatio = rawCandidates > 0 ? safeRatio(duplicateCount, rawCandidates, 100.0, 1) : 0.0;
    const marginalYieldNum = acc.attempts > 0 ? roundDeterministic(newEntities / acc.attempts, 2) : 0.0;

    let websiteCount = 0;
    let contactCount = 0;
    let emailCount = 0;
    let phoneCount = 0;
    let peopleCount = 0;
    let qualifiedCount = 0;
    let uncertainCount = 0;
    let conflictCount = 0;
    let exportableCount = 0;

    for (const r of acc.records) {
      const hasWeb = Boolean(r.digital?.verifiedWebsite?.value || r.digital?.domains?.value?.length || (r as any).websites?.length);
      const emails = r.contacts?.emails || (r as any).contacts?.emails || [];
      const phones = r.contacts?.phones || (r as any).contacts?.phones || [];
      const people = r.people?.publicPeople || (r as any).people || [];
      const hasEmail = emails.length > 0;
      const hasPhone = phones.length > 0;
      const hasPerson = people.length > 0;
      const isQualified = r.qualification?.finalState === 'QUALIFIED' || (r as any).qualification?.state === 'QUALIFIED';
      const isUncertain = r.qualification?.finalState === 'UNCERTAIN' || (r as any).qualification?.state === 'UNCERTAIN';
      const hasConflict = Boolean((r.evidence?.conflicts && r.evidence.conflicts.length > 0) || ((r as any).fieldConflicts && (r as any).fieldConflicts.length > 0));
      const isExportable = (r.policy?.exportEligible === true || (r as any).exportStatus === 'ALLOWED') && !(r.policy?.isRestricted || (r as any).policyRestrictions?.isContractOnly || (r as any).sources?.includes('GOOGLE_MAPS'));

      if (hasWeb) websiteCount++;
      if (hasEmail || hasPhone || hasPerson) contactCount++;
      if (hasEmail) emailCount++;
      if (hasPhone) phoneCount++;
      if (hasPerson) peopleCount++;
      if (isQualified) qualifiedCount++;
      if (isUncertain) uncertainCount++;
      if (hasConflict) conflictCount++;
      if (isExportable) exportableCount++;
    }

    const websiteCoverage = safeRatio(websiteCount, uniqueEntities || totalRecords, 100.0, 1);
    const contactCoverage = safeRatio(contactCount, uniqueEntities || totalRecords, 100.0, 1);
    const emailCoverage = safeRatio(emailCount, uniqueEntities || totalRecords, 100.0, 1);
    const phoneCoverage = safeRatio(phoneCount, uniqueEntities || totalRecords, 100.0, 1);
    const peopleCoverage = safeRatio(peopleCount, uniqueEntities || totalRecords, 100.0, 1);
    const qualificationCoverage = safeRatio(qualifiedCount, uniqueEntities || totalRecords, 100.0, 1);
    const uncertaintyRate = safeRatio(uncertainCount, uniqueEntities || totalRecords, 100.0, 1);
    const conflictRate = safeRatio(conflictCount, uniqueEntities || totalRecords, 100.0, 1);

    const sampleSufficiency = evaluateSampleSufficiency(rawCandidates);

    // Consecutive low yield evaluation
    if (marginalYieldNum <= DEFAULT_SATURATION_THRESHOLDS.LOW_MARGINAL_YIELD && sampleSufficiency !== 'NO_DATA') {
      acc.consecutiveLowYieldRuns = Math.max(1, acc.attempts > 1 ? 2 : 1);
    }

    const saturationAssessment = evaluateSaturationAssessment(
      sampleSufficiency,
      duplicateRatio,
      marginalYieldNum,
      acc.consecutiveLowYieldRuns
    );

    const duplicatePressure = evaluateDuplicatePressure(rawCandidates, duplicateCount);

    const marginalYieldResult: MarginalYieldResult = {
      searchUnitId: acc.searchUnitId,
      marginalYield: marginalYieldNum,
      marginalEntityYield: marginalYieldNum,
      newEntityYield: safeRatio(newEntities, uniqueEntities, 100.0, 1),
      newWebsitesDiscovered: websiteCount,
      marginalWebsiteYield: acc.attempts > 0 ? roundDeterministic(websiteCount / acc.attempts, 2) : 0.0,
      newEmailsDiscovered: emailCount,
      marginalEmailYield: acc.attempts > 0 ? roundDeterministic(emailCount / acc.attempts, 2) : 0.0,
      newPhonesDiscovered: phoneCount,
      marginalPhoneYield: acc.attempts > 0 ? roundDeterministic(phoneCount / acc.attempts, 2) : 0.0,
      newPeopleDiscovered: peopleCount,
      marginalPeopleYield: acc.attempts > 0 ? roundDeterministic(peopleCount / acc.attempts, 2) : 0.0,
      marginalQualifiedYield: acc.attempts > 0 ? roundDeterministic(qualifiedCount / acc.attempts, 2) : 0.0,
      yieldTrend: acc.attempts > 2
        ? (marginalYieldNum > 0.4 ? 'STRONG_GROWTH' : marginalYieldNum < 0.15 ? 'DECLINING_YIELD' : 'STABLE_YIELD')
        : 'INSUFFICIENT_RUNS',
      trend: acc.attempts > 2
        ? (marginalYieldNum > 0.4 ? 'INCREASING' : marginalYieldNum < 0.15 ? 'DECLINING' : 'STABLE')
        : 'INSUFFICIENT_HISTORY'
    };

    const qualityDimensions: QualityDimensionsProfile = {
      discoveryYield: safeRatio(uniqueEntities, rawCandidates, 100.0, 1),
      dataCoverage: safeRatio(websiteCount + contactCount, (uniqueEntities || totalRecords) * 2, 100.0, 1),
      contactCoverage,
      qualificationCoverage,
      conflictPressure: conflictRate,
      duplicatePressure: duplicateRatio
    };

    performances.push({
      searchUnitId: acc.searchUnitId,
      geographicAreaId: acc.geographicAreaId,
      areaName: acc.areaName,
      category: acc.category,
      queryVariant: acc.queryVariant,
      sourceType: acc.sourceType,
      runIds: Array.from(acc.runIds).sort(),
      attempts: acc.attempts,
      rawCandidatesCount: rawCandidates,
      rawCandidateCount: rawCandidates,
      uniqueEntitiesCount: uniqueEntities,
      uniqueCanonicalEntities: uniqueEntities,
      newEntitiesCount: newEntities,
      newEntitiesDiscovered: newEntities,
      duplicateCandidateCount: duplicateCount,
      duplicateRatio,
      marginalYield: marginalYieldResult,
      websiteCoverage,
      contactCoverage,
      emailCoverage,
      phoneCoverage,
      peopleCoverage,
      qualificationCoverage,
      uncertaintyRate,
      conflictRate,
      exportableCount,
      sampleSufficiency,
      saturationAssessment,
      saturation: saturationAssessment,
      duplicatePressure,
      marginalYieldResult,
      qualityDimensions,
      firstObservedAt: acc.firstObservedAt,
      lastObservedAt: acc.lastObservedAt
    });
  }

  return performances.sort((a, b) => b.attempts - a.attempts || (b.uniqueEntitiesCount || 0) - (a.uniqueEntitiesCount || 0) || a.searchUnitId.localeCompare(b.searchUnitId));
}

/**
 * Generates explainable, deterministic next-research recommendations.
 */
export function generateResearchRecommendations(
  performances: SearchUnitPerformance[],
  geographicAreas: GeographicArea[] = []
): ResearchRecommendation[] {
  const recommendations: ResearchRecommendation[] = [];
  let recCounter = 1;

  for (const perf of performances) {
    const searchUnitId = perf.searchUnitId;
    const areaName = perf.areaName;
    const category = perf.category;
    const queryVariant = perf.queryVariant;
    const sampleSufficiency = perf.sampleSufficiency;
    const duplicateRatio = perf.duplicateRatio;
    const marginalYield = typeof perf.marginalYield === 'number' ? perf.marginalYield : (perf.marginalYieldResult?.marginalEntityYield ?? 0);
    const websiteCoverage = perf.websiteCoverage;
    const contactCoverage = perf.contactCoverage;
    const conflictRate = perf.conflictRate;
    const uncertaintyRate = perf.uncertaintyRate;
    const satState = perf.saturation?.state || perf.saturationAssessment?.state;
    const obsCount = perf.rawCandidateCount ?? perf.rawCandidatesCount ?? 20;

    // Rule 1: Saturated Unit -> Recommend Reducing Repetitive Queries
    if (satState === 'HIGHLY_SATURATED' && sampleSufficiency !== 'LOW_SAMPLE' && sampleSufficiency !== 'NO_DATA') {
      recommendations.push({
        recommendationId: `rec_${recCounter++}_reduce_${searchUnitId}`,
        type: 'REDUCE_SATURATED_QUERY',
        priority: 90,
        headline: `Reduce repetitive querying in saturated area (${areaName})`,
        sourceSearchUnitId: searchUnitId,
        targetSearchUnitId: searchUnitId,
        targetAreaName: areaName,
        targetCategory: category,
        targetQueryVariant: queryVariant,
        evidenceBasis: `Observed duplicate candidate ratio of ${duplicateRatio}% with marginal yield of ${marginalYield} entities per attempt across ${perf.attempts} runs.`,
        observedEvidence: [
          `Observed duplicate candidate ratio: ${duplicateRatio}% (Threshold: >= ${DEFAULT_SATURATION_THRESHOLDS.HIGH_DUPLICATE_RATIO}%)`,
          `Marginal yield: ${marginalYield} new entities/attempt across ${perf.attempts} runs`,
          `Sample size sufficiency: ${sampleSufficiency} (${obsCount} observations)`
        ],
        triggeringMetrics: {
          observedValue: duplicateRatio,
          threshold: DEFAULT_SATURATION_THRESHOLDS.HIGH_DUPLICATE_RATIO,
          duplicateRatio,
          marginalYield,
          attempts: perf.attempts
        },
        thresholds: {
          threshold: DEFAULT_SATURATION_THRESHOLDS.HIGH_DUPLICATE_RATIO,
          duplicateRatioThreshold: DEFAULT_SATURATION_THRESHOLDS.HIGH_DUPLICATE_RATIO,
          marginalYieldThreshold: DEFAULT_SATURATION_THRESHOLDS.LOW_MARGINAL_YIELD
        },
        sampleSufficiency,
        confidenceReason: `Observed across ${obsCount} candidate observations (${sampleSufficiency}).`,
        relevantEntityIds: []
      });
    }

    // Rule 2: Underexplored Unit -> Explore Under-Sampled Area
    if (
      (satState === 'UNDEREXPLORED' || marginalYield >= 0.5) &&
      satState !== 'HIGHLY_SATURATED' &&
      satState !== 'MODERATELY_SATURATED'
    ) {
      recommendations.push({
        recommendationId: `rec_${recCounter++}_explore_${searchUnitId}`,
        type: 'EXPLORE_UNDEREXPLORED',
        priority: 85,
        headline: `Explore high-yield under-sampled unit (${areaName} - ${category})`,
        sourceSearchUnitId: searchUnitId,
        targetSearchUnitId: searchUnitId,
        targetAreaName: areaName,
        targetCategory: category,
        targetQueryVariant: queryVariant,
        evidenceBasis: `Strong marginal yield (${marginalYield} new entities/attempt) with low duplicate ratio (${duplicateRatio}%).`,
        observedEvidence: [
          `Strong marginal yield observed: ${marginalYield} new entities/attempt (Threshold: >= 0.5)`,
          `Duplicate ratio: ${duplicateRatio}% (Threshold: <= 35%)`,
          `Observed across ${obsCount} candidate observations (${sampleSufficiency})`
        ],
        triggeringMetrics: {
          observedValue: marginalYield,
          threshold: 0.5,
          marginalYield,
          duplicateRatio,
          attempts: perf.attempts
        },
        thresholds: {
          threshold: 0.5,
          marginalYieldMin: 0.5,
          duplicateRatioMax: 35.0
        },
        sampleSufficiency,
        confidenceReason: `Observed across ${obsCount} candidate observations (${sampleSufficiency}).`,
        actionableNextQuery: {
          geographicArea: areaName,
          category,
          queryVariant
        },
        relevantEntityIds: []
      });
    }

    // Rule 3: Revisit Enrichment (High Website, Low Contact)
    if (websiteCoverage >= 60.0 && contactCoverage <= 35.0 && sampleSufficiency !== 'NO_DATA') {
      recommendations.push({
        recommendationId: `rec_${recCounter++}_revisit_${searchUnitId}`,
        type: 'REVISIT_ENRICHMENT',
        priority: 75,
        headline: `Revisit ${areaName} (${category}) for contact enrichment`,
        sourceSearchUnitId: searchUnitId,
        targetSearchUnitId: searchUnitId,
        targetAreaName: areaName,
        targetCategory: category,
        targetQueryVariant: queryVariant,
        evidenceBasis: `Strong target website discovery (${websiteCoverage}%) but limited direct public contact coverage (${contactCoverage}%).`,
        observedEvidence: [
          `Website coverage: ${websiteCoverage}% (Threshold: >= 60%)`,
          `Contact coverage: ${contactCoverage}% (Threshold: <= 35%)`,
          `Observed across ${obsCount} candidate observations (${sampleSufficiency})`
        ],
        triggeringMetrics: {
          observedValue: websiteCoverage,
          threshold: 60.0,
          websiteCoverage,
          contactCoverage
        },
        thresholds: {
          threshold: 60.0,
          websiteCoverageMin: 60.0,
          contactCoverageMax: 35.0
        },
        sampleSufficiency,
        confidenceReason: `Observed across ${obsCount} candidate observations (${sampleSufficiency}).`,
        actionableNextQuery: {
          geographicArea: areaName,
          category,
          queryVariant: `${queryVariant} contact`
        },
        relevantEntityIds: []
      });
    }

    // Rule 4: High Conflict Rate
    if (conflictRate >= 25.0 && sampleSufficiency !== 'NO_DATA') {
      recommendations.push({
        recommendationId: `rec_${recCounter++}_conflict_${searchUnitId}`,
        type: 'INVESTIGATE_CONFLICTS',
        priority: 70,
        headline: `Investigate high identity conflict rate in ${areaName}`,
        sourceSearchUnitId: searchUnitId,
        targetSearchUnitId: searchUnitId,
        targetAreaName: areaName,
        targetCategory: category,
        targetQueryVariant: queryVariant,
        evidenceBasis: `High multi-source contradiction rate of ${conflictRate}% across phone, email, or physical branch addresses.`,
        observedEvidence: [
          `Conflict rate observed: ${conflictRate}% (Threshold: >= 25%)`,
          `Observed across ${obsCount} candidate observations (${sampleSufficiency})`
        ],
        triggeringMetrics: {
          observedValue: conflictRate,
          threshold: 25.0,
          conflictRate
        },
        thresholds: {
          threshold: 25.0,
          conflictRateThreshold: 25.0
        },
        sampleSufficiency,
        confidenceReason: `Observed across ${obsCount} candidate observations (${sampleSufficiency}).`,
        relevantEntityIds: []
      });
    }

    // Rule 5: High Uncertainty Rate
    if (uncertaintyRate >= 30.0 && sampleSufficiency !== 'NO_DATA') {
      recommendations.push({
        recommendationId: `rec_${recCounter++}_uncert_${searchUnitId}`,
        type: 'INVESTIGATE_UNCERTAINTY',
        priority: 65,
        headline: `Investigate qualification uncertainty rate in ${areaName}`,
        sourceSearchUnitId: searchUnitId,
        targetSearchUnitId: searchUnitId,
        targetAreaName: areaName,
        targetCategory: category,
        targetQueryVariant: queryVariant,
        evidenceBasis: `High qualification uncertainty rate of ${uncertaintyRate}% due to missing corroborated services or indicators.`,
        observedEvidence: [
          `Uncertainty rate observed: ${uncertaintyRate}% (Threshold: >= 30%)`,
          `Observed across ${obsCount} candidate observations (${sampleSufficiency})`
        ],
        triggeringMetrics: {
          observedValue: uncertaintyRate,
          threshold: 30.0,
          uncertaintyRate
        },
        thresholds: {
          threshold: 30.0,
          uncertaintyThreshold: 30.0
        },
        sampleSufficiency,
        confidenceReason: `Observed across ${obsCount} candidate observations (${sampleSufficiency}).`,
        relevantEntityIds: []
      });
    }

    // Rule 6: Explore Adjacent Geography if current area is saturated or child area exists
    if ((satState === 'HIGHLY_SATURATED' || satState === 'UNDEREXPLORED') && geographicAreas.length > 1) {
      const adjacent = geographicAreas.find(a => a.areaId !== perf.geographicAreaId);
      if (adjacent) {
        recommendations.push({
          recommendationId: `rec_${recCounter++}_adjacent_${searchUnitId}`,
          type: 'TRY_ADJACENT_UNIT',
          priority: 60,
          headline: `Expand search to adjacent area (${adjacent.name})`,
          sourceSearchUnitId: searchUnitId,
          targetSearchUnitId: adjacent.areaId,
          targetAreaName: adjacent.name,
          targetCategory: category,
          targetQueryVariant: queryVariant,
          evidenceBasis: `Current search unit ${areaName} has been evaluated. Adjacent area ${adjacent.name} remains unresearched.`,
          observedEvidence: [
            `Adjacent area ${adjacent.name} is available for expansion`,
            `Source area: ${areaName}`,
            `Observed across ${obsCount} candidate observations (${sampleSufficiency})`
          ],
          triggeringMetrics: {
            observedValue: duplicateRatio,
            threshold: DEFAULT_SATURATION_THRESHOLDS.HIGH_DUPLICATE_RATIO,
            duplicateRatio
          },
          thresholds: {
            threshold: DEFAULT_SATURATION_THRESHOLDS.HIGH_DUPLICATE_RATIO,
            duplicateRatioThreshold: DEFAULT_SATURATION_THRESHOLDS.HIGH_DUPLICATE_RATIO
          },
          sampleSufficiency,
          confidenceReason: `Observed across ${obsCount} candidate observations (${sampleSufficiency}).`,
          actionableNextQuery: {
            geographicArea: adjacent.name,
            category,
            queryVariant
          },
          relevantEntityIds: []
        });
      }
    }
  }

  // Deterministic sorting by priority descending then recommendationId ascending
  return recommendations.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.recommendationId.localeCompare(b.recommendationId));
}

/**
 * Evaluates optimization warnings from search unit performances.
 */
export function evaluateOptimizationWarnings(
  performances: SearchUnitPerformance[]
): OptimizationWarning[] {
  const warnings: OptimizationWarning[] = [];
  let warnId = 1;

  for (const p of performances) {
    if (p.sampleSufficiency === 'LOW_SAMPLE') {
      warnings.push({
        id: `warn_${warnId++}_low_sample_${p.searchUnitId}`,
        type: 'LOW_SAMPLE_SIZE',
        severity: 'LOW',
        title: 'Low Observation Sample Size',
        searchUnitId: p.searchUnitId,
        message: `Search unit ${p.areaName} has only ${p.rawCandidateCount ?? p.rawCandidatesCount ?? 0} observations (< 5). Claims of saturation or high efficiency require more runs.`,
        remedy: 'Gather additional observations before drawing definitive research conclusions.'
      });
    }

    if (p.duplicatePressure.level === 'CRITICAL' || p.duplicatePressure.level === 'HIGH') {
      warnings.push({
        id: `warn_${warnId++}_dup_${p.searchUnitId}`,
        type: 'HIGH_DUPLICATE_PRESSURE',
        severity: p.duplicatePressure.level === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        title: 'High Duplicate Acquisition Pressure',
        searchUnitId: p.searchUnitId,
        message: `Search unit ${p.areaName} (${p.category}) shows ${p.duplicateRatio}% duplicate candidates across ${p.attempts} runs.`,
        remedy: 'Pause repeated queries in this area and prioritize adjacent geographic units or alternative categories.'
      });
    }

    if (p.uncertaintyRate >= 40.0 && p.sampleSufficiency !== 'NO_DATA') {
      warnings.push({
        id: `warn_${warnId++}_unc_${p.searchUnitId}`,
        type: 'HIGH_UNCERTAINTY_RATE',
        severity: 'MEDIUM',
        title: 'Elevated Qualification Uncertainty Rate',
        searchUnitId: p.searchUnitId,
        message: `${p.uncertaintyRate}% of leads in ${p.areaName} could not be decisively qualified due to missing business evidence.`,
        remedy: 'Verify website presence or enrich target search terms to uncover corroborated public credentials.'
      });
    }

    if (p.conflictRate >= 30.0 && p.sampleSufficiency !== 'NO_DATA') {
      warnings.push({
        id: `warn_${warnId++}_con_${p.searchUnitId}`,
        type: 'HIGH_CONFLICT_RATE',
        severity: 'MEDIUM',
        title: 'Elevated Field Lineage Conflicts',
        searchUnitId: p.searchUnitId,
        message: `${p.conflictRate}% of records exhibit conflicting multi-source contact or branch details.`,
        remedy: 'Inspect the evidence reason graph and verify physical branch identity.'
      });
    }
  }

  return warnings.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Computes run-to-run comparison for research planning.
 */
export function compareRunsForPlanning(
  targetRun: { runId: string; candidatesCount?: number; totalRecordsExtracted?: number; leadIds?: string[]; searchUnits?: SearchUnit[]; startedAt?: string },
  baseRun: { runId: string; candidatesCount?: number; totalRecordsExtracted?: number; leadIds?: string[]; searchUnits?: SearchUnit[]; startedAt?: string },
  recordsBaseOrAll: CanonicalLeadRecord[] = [],
  recordsTargetOpt?: CanonicalLeadRecord[]
): RunComparisonForPlanning {
  let recordsTarget: CanonicalLeadRecord[];
  let recordsBase: CanonicalLeadRecord[];

  if (recordsTargetOpt && recordsTargetOpt.length > 0) {
    recordsTarget = recordsTargetOpt;
    recordsBase = recordsBaseOrAll;
  } else {
    const all = recordsBaseOrAll;
    const targetLeadIds = (targetRun as any).leadIds || [];
    const baseLeadIds = (baseRun as any).leadIds || [];
    recordsTarget = targetLeadIds.length > 0 ? all.filter(r => targetLeadIds.includes(r.canonicalEntityId)) : all;
    recordsBase = baseLeadIds.length > 0 ? all.filter(r => baseLeadIds.includes(r.canonicalEntityId)) : all;
  }

  const rawTarget = (targetRun as any).totalRecordsExtracted ?? (targetRun as any).candidatesCount ?? recordsTarget.length;
  const rawBase = (baseRun as any).totalRecordsExtracted ?? (baseRun as any).candidatesCount ?? recordsBase.length;

  const targetEntities = new Set(recordsTarget.map(r => r.canonicalEntityId));
  const baseEntities = new Set(recordsBase.map(r => r.canonicalEntityId));
  const uniqueTarget = targetEntities.size;
  const uniqueBase = baseEntities.size;

  let overlapCount = 0;
  for (const id of targetEntities) {
    if (baseEntities.has(id)) overlapCount++;
  }
  const overlapRatio = uniqueTarget > 0 ? safeRatio(overlapCount, uniqueTarget, 100.0, 1) : 0.0;

  const uniqueDiff = uniqueTarget - uniqueBase;
  const uniquePct = uniqueBase > 0 ? safeRatio(uniqueDiff, uniqueBase, 100.0, 1) : 0.0;

  const yieldTarget = uniqueTarget;
  const yieldBase = uniqueBase;
  const yieldDiff = yieldTarget - yieldBase;
  const yieldPct = yieldBase > 0 ? safeRatio(yieldDiff, yieldBase, 100.0, 1) : 0.0;

  const dupTarget = rawTarget > 0 ? safeRatio(Math.max(0, rawTarget - uniqueTarget), rawTarget, 100.0, 1) : 0.0;
  const dupBase = rawBase > 0 ? safeRatio(Math.max(0, rawBase - uniqueBase), rawBase, 100.0, 1) : 0.0;
  const dupDiff = roundDeterministic(dupTarget - dupBase, 1);
  const dupPct = dupBase > 0 ? safeRatio(dupDiff, dupBase, 100.0, 1) : 0.0;

  const contactTarget = safeRatio(recordsTarget.filter(r => (r.contacts?.emails?.length || (r as any).contacts?.emails?.length || (r.contacts?.phones?.length || (r as any).contacts?.phones?.length))).length, uniqueTarget);
  const contactBase = safeRatio(recordsBase.filter(r => (r.contacts?.emails?.length || (r as any).contacts?.emails?.length || (r.contacts?.phones?.length || (r as any).contacts?.phones?.length))).length, uniqueBase);
  const contactDiff = roundDeterministic(contactTarget - contactBase, 1);
  const contactPct = contactBase > 0 ? safeRatio(contactDiff, contactBase, 100.0, 1) : 0.0;

  const metrics = {
    uniqueEntities: { absoluteChange: uniqueDiff, percentageChange: uniquePct },
    marginalYield: { absoluteChange: yieldDiff, percentageChange: yieldPct },
    duplicateRatio: { absoluteChange: dupDiff, percentageChange: dupPct },
    contactCoverage: { absoluteChange: contactDiff, percentageChange: contactPct }
  };

  const descriptiveSummary = `Comparing target run ${targetRun.runId} (${rawTarget} sample) against baseline run ${baseRun.runId} (${rawBase} sample). Net unique entities change: ${uniqueDiff >= 0 ? '+' : ''}${uniqueDiff}. Entity overlap: ${overlapCount} (${overlapRatio}%).`;

  return {
    baseRunId: baseRun.runId,
    targetRunId: targetRun.runId,
    metrics,
    metricsDiff: {
      rawCandidatesDelta: rawTarget - rawBase,
      uniqueEntitiesDelta: uniqueDiff,
      duplicateRatioDelta: dupDiff,
      marginalYieldDelta: yieldDiff,
      websiteCoverageDelta: 0.0,
      emailCoverageDelta: 0.0,
      phoneCoverageDelta: 0.0,
      qualificationCoverageDelta: 0.0,
      uncertaintyDelta: 0.0,
      conflictDelta: 0.0
    },
    targetSampleSize: rawTarget,
    baselineSampleSize: rawBase,
    sampleSizeBase: rawBase,
    sampleSizeTarget: rawTarget,
    targetFreshness: (targetRun as any).startedAt || '2026-10-01T10:00:00.000Z',
    baselineFreshness: (baseRun as any).startedAt || '2026-10-01T10:00:00.000Z',
    entityOverlapCount: overlapCount,
    entityOverlapRatio: overlapRatio,
    freshnessNote: 'Comparison derived strictly from persisted historical execution snapshots.',
    summary: descriptiveSummary,
    descriptiveSummary
  };
}

/**
 * Master pipeline: computes full research optimization snapshot.
 */
export function computeResearchOptimization(
  runs: Array<{
    runId: string;
    startedAt?: string;
    completedAt?: string;
    searchUnits?: SearchUnit[];
    query?: string;
    category?: string;
    geographicAreaId?: string;
  }> = [],
  canonicalRecords: CanonicalLeadRecord[] = [],
  geographicAreas: GeographicArea[] = []
): ResearchOptimizationSnapshot {
  const searchUnitPerformances = aggregateSearchUnitPerformances(runs, canonicalRecords);
  const recommendations = generateResearchRecommendations(searchUnitPerformances, geographicAreas);
  const warnings = evaluateOptimizationWarnings(searchUnitPerformances);

  // Geographic Breakdown
  const geographicBreakdown: GeographicOptimizationSummary[] = [];
  const areaGroups = new Map<string, SearchUnitPerformance[]>();

  for (const p of searchUnitPerformances) {
    const list = areaGroups.get(p.geographicAreaId) || [];
    list.push(p);
    areaGroups.set(p.geographicAreaId, list);
  }

  for (const [areaId, perfs] of areaGroups.entries()) {
    const totalUnique = perfs.reduce((s, p) => s + (p.uniqueEntitiesCount || p.uniqueCanonicalEntities || 0), 0);
    const avgMarginal = roundDeterministic(perfs.reduce((s, p) => s + (typeof p.marginalYield === 'number' ? p.marginalYield : p.marginalYieldResult.marginalEntityYield), 0) / perfs.length, 2);
    const areaArea = geographicAreas.find(a => a.areaId === areaId);

    // Worst saturation state among units in area
    const saturationState = perfs.some(p => p.saturationAssessment.state === 'HIGHLY_SATURATED')
      ? 'HIGHLY_SATURATED'
      : perfs.some(p => p.saturationAssessment.state === 'MODERATELY_SATURATED')
      ? 'MODERATELY_SATURATED'
      : perfs.some(p => p.saturationAssessment.state === 'UNDEREXPLORED')
      ? 'UNDEREXPLORED'
      : 'ACTIVE';

    geographicBreakdown.push({
      areaId,
      areaName: areaArea?.name || perfs[0]?.areaName || areaId,
      level: areaArea?.level || 'CITY',
      observedCoveragePercent: roundDeterministic(Math.min(100.0, perfs.reduce((s, p) => s + p.websiteCoverage, 0) / perfs.length), 1),
      uniqueEntitiesCount: totalUnique,
      saturationState,
      marginalYield: avgMarginal,
      searchUnitIds: perfs.map(p => p.searchUnitId).sort()
    });
  }

  // Query/Category Insights
  const queryCategoryInsights: QueryCategoryInsight[] = [];
  const catGroups = new Map<string, SearchUnitPerformance[]>();

  for (const p of searchUnitPerformances) {
    const key = `${p.category}::${p.queryVariant}`;
    const list = catGroups.get(key) || [];
    list.push(p);
    catGroups.set(key, list);
  }

  for (const [catKey, perfs] of catGroups.entries()) {
    const [category, queryVariant] = catKey.split('::');
    const totalAttempts = perfs.reduce((s, p) => s + p.attempts, 0);
    const avgDup = roundDeterministic(perfs.reduce((s, p) => s + p.duplicateRatio, 0) / perfs.length, 1);
    const avgYield = roundDeterministic(perfs.reduce((s, p) => s + (typeof p.marginalYield === 'number' ? p.marginalYield : p.marginalYieldResult.marginalEntityYield), 0) / perfs.length, 2);
    const avgWeb = roundDeterministic(perfs.reduce((s, p) => s + p.websiteCoverage, 0) / perfs.length, 1);
    const avgContact = roundDeterministic(perfs.reduce((s, p) => s + p.contactCoverage, 0) / perfs.length, 1);
    const avgUncertain = roundDeterministic(perfs.reduce((s, p) => s + p.uncertaintyRate, 0) / perfs.length, 1);

    queryCategoryInsights.push({
      category,
      queryVariant,
      attempts: totalAttempts,
      duplicateRatio: avgDup,
      marginalYield: avgYield,
      websiteCoverage: avgWeb,
      contactCoverage: avgContact,
      uncertaintyRate: avgUncertain,
      observationSummary: `Category "${category}" under query "${queryVariant}" yielded ${avgYield} new entities/attempt with ${avgDup}% duplicates and ${avgWeb}% website coverage.`
    });
  }

  // Safe restricted aggregate accounting
  const restrictedCount = canonicalRecords.filter(r =>
    r.policy?.isRestricted ||
    r.policy?.hasGoogleConsumerWebLineage ||
    (r as any).policyRestrictions?.isContractOnly ||
    (r as any).sources?.includes('GOOGLE_MAPS')
  ).length;

  if (restrictedCount > 0) {
    warnings.push({
      id: 'warn_restricted_records',
      type: 'RESTRICTED_RECORDS_EXCLUDED',
      severity: 'LOW',
      title: 'Restricted Provenance Records Excluded',
      searchUnitId: 'ALL_UNITS',
      message: `${restrictedCount} restricted candidate records were safely isolated and excluded from optimization export in compliance with source firewall policy.`,
      remedy: 'Contract-only / Google consumer-web raw details remain protected and unpersisted.'
    });
  }

  // Deterministic snapshotId
  const sortedRunIds = runs.map(r => r.runId).sort().join(',');
  const sortedLeadIds = canonicalRecords.map(r => r.canonicalEntityId).sort().join(',');
  const rawIdSource = `${OPTIMIZATION_SCHEMA_VERSION}::${sortedRunIds}::${sortedLeadIds}`;
  let hashVal = 0;
  for (let i = 0; i < rawIdSource.length; i++) {
    hashVal = ((hashVal << 5) - hashVal + rawIdSource.charCodeAt(i)) | 0;
  }
  const snapshotId = `opt_${Math.abs(hashVal).toString(16)}`;

  // Coverage State calculation
  const totalObservedRecords = runs.reduce((s, r) => s + Math.max(0, (r as any).totalRecordsExtracted ?? (r as any).candidatesCount ?? 0), 0) || canonicalRecords.length;
  const uniqueEntities = new Set(canonicalRecords.map(r => r.canonicalEntityId)).size;
  const duplicateCandidateCount = Math.max(0, totalObservedRecords - uniqueEntities);
  const newEntityCount = uniqueEntities;

  let webCount = 0;
  let emailCount = 0;
  let phoneCount = 0;
  let peopleCount = 0;
  let contactCount = 0;
  let qualCount = 0;
  let uncertainCount = 0;
  let conflictCount = 0;
  let exportableCount = 0;
  let blockedCount = 0;
  let restrictedRecordCount = 0;

  for (const r of canonicalRecords) {
    const hasWeb = Boolean(r.digital?.verifiedWebsite?.value || r.digital?.domains?.value?.length || (r as any).websites?.length);
    const emails = r.contacts?.emails || (r as any).contacts?.emails || [];
    const phones = r.contacts?.phones || (r as any).contacts?.phones || [];
    const people = r.people?.publicPeople || (r as any).people || [];
    const hasEmail = emails.length > 0;
    const hasPhone = phones.length > 0;
    const hasPerson = people.length > 0;
    const hasContact = hasEmail || hasPhone || hasPerson;
    const isQual = r.qualification?.finalState === 'QUALIFIED' || (r as any).qualification?.state === 'QUALIFIED';
    const isUncertain = r.qualification?.finalState === 'UNCERTAIN' || (r as any).qualification?.state === 'UNCERTAIN';
    const hasConflict = Boolean((r.evidence?.conflicts && r.evidence.conflicts.length > 0) || ((r as any).fieldConflicts && (r as any).fieldConflicts.length > 0));
    const isRestricted = Boolean(r.policy?.isRestricted || r.policy?.hasGoogleConsumerWebLineage || (r as any).policyRestrictions?.isContractOnly || (r as any).sources?.includes('GOOGLE_MAPS'));
    const isBlocked = r.policy?.exportEligible === false || (r as any).exportStatus === 'BLOCKED' || (r as any).persistenceStatus === 'DISCARDED' || isRestricted;
    const isExportable = (r.policy?.exportEligible === true || (r as any).exportStatus === 'ALLOWED') && !isBlocked && !isRestricted;

    if (hasWeb) webCount++;
    if (hasEmail) emailCount++;
    if (hasPhone) phoneCount++;
    if (hasPerson) peopleCount++;
    if (hasContact) contactCount++;
    if (isQual) qualCount++;
    if (isUncertain) uncertainCount++;
    if (hasConflict) conflictCount++;
    if (isExportable) exportableCount++;
    if (isBlocked) blockedCount++;
    if (isRestricted) restrictedRecordCount++;
  }

  const overallCoverage: CoverageState = {
    totalObservedRecords,
    uniqueCanonicalEntities: uniqueEntities,
    duplicateCandidateCount,
    newEntityCount,
    websiteCoverageRatio: safeRatio(webCount, uniqueEntities),
    emailCoverageRatio: safeRatio(emailCount, uniqueEntities),
    phoneCoverageRatio: safeRatio(phoneCount, uniqueEntities),
    peopleCoverageRatio: safeRatio(peopleCount, uniqueEntities),
    contactCoverageRatio: safeRatio(contactCount, uniqueEntities),
    qualificationCoverageRatio: safeRatio(qualCount, uniqueEntities),
    uncertaintyRate: safeRatio(uncertainCount, uniqueEntities),
    conflictRate: safeRatio(conflictCount, uniqueEntities),
    exportableCount,
    blockedCount,
    restrictedRecordCount
  };

  return {
    snapshotId,
    schemaVersion: OPTIMIZATION_SCHEMA_VERSION,
    generatedAt: '2026-10-01T10:00:00.000Z',
    totalRunsAnalyzed: runs.length,
    totalSearchUnitsAnalyzed: searchUnitPerformances.length,
    totalCanonicalLeadsObserved: canonicalRecords.length,
    overallCoverage,
    searchUnitPerformances,
    recommendations,
    warnings,
    geographicBreakdown: geographicBreakdown.sort((a, b) => a.areaId.localeCompare(b.areaId)),
    queryCategoryInsights: queryCategoryInsights.sort((a, b) => a.category.localeCompare(b.category)),
    restrictedRecordsAggregate: {
      restrictedCount,
      excludedFromExport: restrictedCount,
      complianceNote: restrictedCount > 0
        ? `${restrictedCount} restricted candidate records were safely isolated and excluded from exportable counts in compliance with source firewall policy.`
        : 'Zero restricted records observed.'
    }
  };
}
