/**
 * Bounded Advertiser Expansion Engine
 * LEADNORIA v1.1 — Master Prompt 5
 *
 * For STRONG or HIGH-CONFIDENCE relevant entities only, executes controlled,
 * bounded advertiser-level public Meta Ad Library expansion searches.
 *
 * INVARIANTS:
 * 1. ONLY eligible for STRONG relevant entities (RELEVANT + STRONG identity confidence).
 * 2. NEVER run for REJECTED, UNCERTAIN, weak identity, or ambiguous entities.
 * 3. STRICT BOUNDS: Max 5 expansions per run, 1 per entity, max 20 ads per expansion.
 * 4. NO CROSS-ENTITY CONTAMINATION: Conflicting expanded ads are never merged into source entity.
 * 5. All expanded ads enter global Ad Library ID dedup, entity resolution, and evidence aggregation.
 * 6. Full auditable provenance logging.
 */

import type {
  ExtensionLead,
  ScrapedAdCandidate,
  AdvertiserExpansionStatus,
  AdvertiserExpansionProvenance,
  RunCounters
} from './types.ts';
import type { ResearchIntent } from './relevanceEngine.ts';
import { evaluateEntityMerge, mergeCandidateIntoEntity, EntityResolutionIndex } from './entityResolver.ts';
import { extractCreativeSignalsFromCandidate, aggregateCreativeSignals } from './creativeSignals.ts';
import { evaluateStrictRelevanceV3 } from './evidenceWaterfall.ts';

// -------------------------------------------------------------
// 1. BOUNDED SAFETY CONSTANTS
// -------------------------------------------------------------
export const ADVERTISER_EXPANSION_BOUNDS = {
  MAX_ADVERTISER_EXPANSIONS_PER_RUN: 5,
  MAX_EXPANSIONS_PER_ENTITY: 1,
  MAX_ADS_PER_ADVERTISER_EXPANSION: 20,
  MAX_ADS_PER_EXPANSION: 20,
  MAX_EXPANSION_TIME_PER_ENTITY_MS: 15000, // 15 seconds max per entity
  TIMEOUT_MS_PER_EXPANSION: 15000
};

// Generic names that must never trigger advertiser expansion
const GENERIC_NAME_BLOCKLIST = new Set([
  'unknown advertiser',
  'sponsored',
  'facebook user',
  'advertiser',
  'daraz',
  'amazon',
  'shop',
  'store',
  'outlet',
  'online shop'
]);

// -------------------------------------------------------------
// 2. ELIGIBILITY EVALUATION
// -------------------------------------------------------------
export interface ExpansionEligibility {
  eligible: boolean;
  status: AdvertiserExpansionStatus | 'ELIGIBLE' | 'INELIGIBLE_UNCERTAIN' | 'INELIGIBLE_REJECTED' | 'ALREADY_EXPANDED' | 'RUN_EXPANSION_CAP_REACHED';
  reason: string;
}

/**
 * Deterministically checks whether an entity qualifies for advertiser expansion.
 */
export function checkAdvertiserExpansionEligibility(
  entity: ExtensionLead,
  alreadyExpandedEntityIds: Set<string> | any[] = new Set(),
  currentExpansionsCount?: number
): ExpansionEligibility {
  // Normalize expanded IDs/records
  const expandedSet = new Set<string>();
  let count = currentExpansionsCount ?? 0;
  if (Array.isArray(alreadyExpandedEntityIds)) {
    count = currentExpansionsCount ?? alreadyExpandedEntityIds.length;
    for (const item of alreadyExpandedEntityIds) {
      if (typeof item === 'string') expandedSet.add(item);
      else if (item && typeof item === 'object' && item.sourceEntityId) expandedSet.add(item.sourceEntityId);
    }
  } else if (alreadyExpandedEntityIds instanceof Set) {
    for (const id of alreadyExpandedEntityIds) expandedSet.add(id);
  }

  // 1. Check if capacity reached
  if (count >= ADVERTISER_EXPANSION_BOUNDS.MAX_ADVERTISER_EXPANSIONS_PER_RUN) {
    return {
      eligible: false,
      status: 'RUN_EXPANSION_CAP_REACHED',
      reason: `Max advertiser expansions per run reached (${ADVERTISER_EXPANSION_BOUNDS.MAX_ADVERTISER_EXPANSIONS_PER_RUN})`
    };
  }

  // 2. Relevance decision check
  if (entity.relevanceDecision === 'UNCERTAIN') {
    return {
      eligible: false,
      status: 'INELIGIBLE_UNCERTAIN',
      reason: 'Entity relevance is UNCERTAIN. Review queue candidates are strictly ineligible for expansion.'
    };
  }

  if ((entity.relevanceDecision as string) === 'REJECTED' || entity.relevanceDecision === 'NOT_RELEVANT') {
    return {
      eligible: false,
      status: 'INELIGIBLE_REJECTED',
      reason: 'Entity relevance is REJECTED/NOT_RELEVANT. Rejected candidates are strictly ineligible.'
    };
  }

  if (entity.relevanceDecision !== 'RELEVANT') {
    return {
      eligible: false,
      status: 'NOT_ELIGIBLE',
      reason: `Relevance decision is ${entity.relevanceDecision || 'UNKNOWN'}, not RELEVANT`
    };
  }

  // 3. Identity confidence must be STRONG
  if (entity.identityConfidence !== 'STRONG') {
    return {
      eligible: false,
      status: 'NOT_ELIGIBLE',
      reason: `Identity confidence is ${entity.identityConfidence || 'UNKNOWN'}, requires STRONG`
    };
  }

  // 4. Already expanded check
  if (entity.advertiserExpansionStatus === 'COMPLETED' || expandedSet.has(entity.id)) {
    return {
      eligible: false,
      status: 'ALREADY_EXPANDED',
      reason: 'Entity has already been expanded in this run'
    };
  }

  // 5. Advertiser name usable for public search
  const name = (entity.canonicalName || entity.name || '').trim();
  if (name.length < 3) {
    return {
      eligible: false,
      status: 'NOT_ELIGIBLE',
      reason: 'Advertiser name is too short for public search'
    };
  }

  if (GENERIC_NAME_BLOCKLIST.has(name.toLowerCase())) {
    return {
      eligible: false,
      status: 'NOT_ELIGIBLE',
      reason: 'Advertiser name is generic or blocklisted'
    };
  }

  // 6. Must not have active contradictions
  if (entity.relevanceEvidence && entity.relevanceEvidence.some(e => e.type === 'CONTRADICTION')) {
    return {
      eligible: false,
      status: 'BLOCKED',
      reason: 'Entity has unresolved contradiction evidence'
    };
  }

  return {
    eligible: true,
    status: 'ELIGIBLE',
    reason: 'Strong relevant advertiser eligible for bounded expansion'
  };
}

export interface ExecuteAdvertiserExpansionResult {
  status: AdvertiserExpansionStatus;
  provenance: AdvertiserExpansionProvenance;
  newRawAds: any[];
}

export async function executeAdvertiserExpansion(
  lead: ExtensionLead,
  adFetcher: (query: string) => Promise<any[]>,
  seenAdLibraryIds: Set<string>
): Promise<ExecuteAdvertiserExpansionResult> {
  const query = lead.canonicalName || lead.name;
  const rawAds = await adFetcher(query);
  const now = new Date().toISOString();

  let newAds = 0;
  let dupAds = 0;
  const newRawAds: any[] = [];

  for (const ad of rawAds) {
    const id = ad.adLibraryId || ad.libraryId;
    if (seenAdLibraryIds.has(id)) {
      dupAds++;
    } else {
      newAds++;
      seenAdLibraryIds.add(id);
      newRawAds.push(ad);
    }
  }

  const stopReason = rawAds.length === 0 ? 'SOURCE_EXHAUSTED' : 'COMPLETED_SUCCESSFULLY';
  const status: AdvertiserExpansionStatus = rawAds.length === 0 ? 'NO_RESULTS' : 'COMPLETED';

  const provenance: AdvertiserExpansionProvenance = {
    expansionType: 'ADVERTISER',
    sourceEntityId: lead.id,
    sourceAdvertiserName: lead.canonicalName || lead.name,
    expansionQuery: query,
    query,
    timestamp: now,
    resultCount: rawAds.length,
    newAdsDiscovered: newAds,
    newAds,
    duplicateAds: dupAds,
    newEntitiesDiscovered: 0,
    newEntities: 0,
    stopReason
  };

  return {
    status,
    provenance,
    newRawAds
  };
}

// -------------------------------------------------------------
// 3. EXPANSION EXECUTION & PIPELINE MERGE
// -------------------------------------------------------------
export interface ProcessExpansionAdsResult {
  provenance: AdvertiserExpansionProvenance;
  mergedIntoSourceCount: number;
  newAdsDiscovered: number;
  duplicateAdsCount: number;
  newSeparateEntities: ExtensionLead[];
}

/**
 * Processes ads collected via advertiser-level expansion through the global dedup,
 * entity resolution, and evidence aggregation pipeline.
 *
 * Enforces NO CROSS-ENTITY CONTAMINATION:
 * If an ad does not match the source entity, it is NOT merged into source entity.
 */
export function processExpandedAds(
  sourceEntity: ExtensionLead,
  expandedAds: ScrapedAdCandidate[],
  existingEntitiesMap: Map<string, ExtensionLead>,
  entityIndex: EntityResolutionIndex,
  seenAdLibraryIds: Set<string>,
  intent: ResearchIntent,
  counters: RunCounters,
  expansionQuery?: string
): ProcessExpansionAdsResult {
  const queryUsed = expansionQuery || sourceEntity.canonicalName;
  const now = new Date().toISOString();

  let newAdsDiscovered = 0;
  let duplicateAdsCount = 0;
  let mergedIntoSourceCount = 0;
  const newSeparateEntities: ExtensionLead[] = [];

  // Bounded ads processing limit
  const boundedAds = expandedAds.slice(0, ADVERTISER_EXPANSION_BOUNDS.MAX_ADS_PER_ADVERTISER_EXPANSION);

  for (const cand of boundedAds) {
    // 1. Global Ad ID Deduplication
    if (seenAdLibraryIds.has(cand.libraryId)) {
      duplicateAdsCount++;
      counters.duplicatesRemoved++;
      counters.advertiserExpansionDuplicatesCount = (counters.advertiserExpansionDuplicatesCount || 0) + 1;
      continue;
    }

    seenAdLibraryIds.add(cand.libraryId);
    newAdsDiscovered++;
    counters.rawAds++;
    counters.advertiserExpansionAdsCount = (counters.advertiserExpansionAdsCount || 0) + 1;

    // 2. Identity Resolution Check
    const mergeDecision = evaluateEntityMerge(cand, existingEntitiesMap, entityIndex);

    // Check if this ad belongs to the source entity
    const targetEntity = mergeDecision.shouldMerge ? existingEntitiesMap.get(mergeDecision.targetKey) : null;
    const isMatchToSource = mergeDecision.shouldMerge && (
      (targetEntity && (targetEntity.id === sourceEntity.id || targetEntity.canonicalName.toLowerCase() === sourceEntity.canonicalName.toLowerCase())) ||
      mergeDecision.targetKey === sourceEntity.id ||
      mergeDecision.targetKey === sourceEntity.canonicalName.toLowerCase()
    );

    if (isMatchToSource) {
      // Clean, verified merge into source entity!
      mergedIntoSourceCount++;
      counters.entityMergesCount = (counters.entityMergesCount || 0) + 1;
      mergeCandidateIntoEntity(sourceEntity, cand, mergeDecision, queryUsed);

      // Extract and aggregate creative signals into source entity
      const newSignals = extractCreativeSignalsFromCandidate(cand);
      sourceEntity.creativeSignals = aggregateCreativeSignals([
        ...(sourceEntity.creativeSignals || []),
        ...newSignals
      ]);

      // Re-index updated source entity
      entityIndex.indexEntity(mergeDecision.targetKey, sourceEntity);
    } else if (mergeDecision.shouldMerge) {
      // Matches another existing entity
      const targetEntity = existingEntitiesMap.get(mergeDecision.targetKey);
      if (targetEntity) {
        counters.entityMergesCount = (counters.entityMergesCount || 0) + 1;
        mergeCandidateIntoEntity(targetEntity, cand, mergeDecision, queryUsed);
        const newSignals = extractCreativeSignalsFromCandidate(cand);
        targetEntity.creativeSignals = aggregateCreativeSignals([
          ...(targetEntity.creativeSignals || []),
          ...newSignals
        ]);
        entityIndex.indexEntity(mergeDecision.targetKey, targetEntity);
      }
    } else {
      // Candidate does NOT match source entity or any existing entity!
      // Invariant: DO NOT FORCE MERGE. Evaluate independently to prevent cross-contamination.
      const v3Decision = evaluateStrictRelevanceV3({
        advertiserName: cand.pageName,
        adText: cand.bodyCopy,
        destinationUrl: cand.destinationUrl,
        destinationDomain: cand.destinationDomain,
        facebookPageUrl: cand.facebookPageUrl,
        ctaText: cand.ctaText,
        matchedKeyword: queryUsed
      }, intent);

      if (v3Decision.decision === 'RELEVANT') {
        const separateKey = cand.pageName.trim().toLowerCase();
        const cleanName = cand.pageName.trim();
        const separateLead: ExtensionLead = {
          id: `lead_exp_${cand.libraryId}`,
          name: cleanName,
          canonicalName: cleanName,
          facebookPageName: cleanName,
          facebookPageUrl: cand.facebookPageUrl,
          facebookPageState: cand.facebookPageUrl ? 'found' : 'not_found',
          destinationUrl: cand.destinationUrl,
          destinationDomain: cand.destinationDomain,
          observedDomains: cand.destinationDomain ? [cand.destinationDomain] : [],
          observedUrls: cand.destinationUrl ? [cand.destinationUrl] : [],
          aliases: [],
          websiteState: cand.destinationUrl ? 'found' : 'not_found',
          adCount: 1,
          activeAdCount: 1,
          adLibraryIds: [cand.libraryId],
          adLibraryUrl: `https://www.facebook.com/ads/library/?id=${cand.libraryId}`,
          matchedKeywords: [queryUsed],
          matchedQueries: [queryUsed],
          locationCode: sourceEntity.locationCode || 'BD',
          locationName: sourceEntity.locationName || 'Bangladesh',
          status: cand.destinationUrl ? 'QUALIFIED' : 'REVIEW_REQUIRED',
          discoveredAt: now,
          sampleCopy: cand.bodyCopy,
          sampleCta: cand.ctaText,
          relevanceScore: v3Decision.score,
          relevanceDecision: 'RELEVANT',
          relevanceConfidence: v3Decision.confidence,
          relevanceReasons: v3Decision.reasons,
          relevanceMatchedTerms: v3Decision.matchedTerms,
          relevanceEvidence: v3Decision.evidence,
          evaluationStatus: 'RELEVANT',
          creativeSignals: extractCreativeSignalsFromCandidate(cand)
        };

        existingEntitiesMap.set(separateKey, separateLead);
        entityIndex.indexEntity(separateKey, separateLead);
        newSeparateEntities.push(separateLead);
        counters.relevantCandidates++;
        counters.finalUniqueLeads++;
        counters.finalUniqueRelevantLeads = (counters.finalUniqueRelevantLeads || 0) + 1;
      }
    }
  }

  // Create provenance record
  const provenance: AdvertiserExpansionProvenance = {
    expansionType: 'ADVERTISER',
    sourceEntityId: sourceEntity.id,
    sourceAdvertiserName: sourceEntity.canonicalName,
    expansionQuery: queryUsed,
    timestamp: now,
    resultCount: boundedAds.length,
    newAdsDiscovered,
    duplicateAds: duplicateAdsCount,
    newEntitiesDiscovered: newSeparateEntities.length,
    stopReason: boundedAds.length < ADVERTISER_EXPANSION_BOUNDS.MAX_ADS_PER_ADVERTISER_EXPANSION
      ? 'SOURCE_EXHAUSTED'
      : 'MAX_ADS_REACHED'
  };

  // Attach provenance to source entity
  sourceEntity.expansionProvenance = [
    ...(sourceEntity.expansionProvenance || []),
    provenance
  ];
  sourceEntity.advertiserExpansionStatus = 'COMPLETED';

  return {
    provenance,
    mergedIntoSourceCount,
    newAdsDiscovered,
    duplicateAdsCount,
    newSeparateEntities
  };
}
