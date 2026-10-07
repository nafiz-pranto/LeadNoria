/**
 * LeadNoria — Google Maps Candidate Registry & Session Deduplication Engine
 * Part 5: Multi-Key Blocking Index, Incremental O(1) Matching & Data Quality Registry
 *
 * HARD BOUNDARIES & INVARIANTS:
 * - Scoped per research session to preserve session isolation.
 * - Multi-key blocking indexes prevent O(N²) all-pairs comparisons.
 * - Maximum duplicate reduction WITHOUT false entity collapse.
 * - Strong identity auto-merges; weak identity or potential duplicates kept separate.
 * - Bounded memory: indexes store compact string IDs, zero DOM nodes.
 * - Google firewall: candidate objects held strictly in-memory during active run.
 */

import type { GoogleMapsCandidateObservation } from './types.ts';
import type {
  SessionCandidate,
  IdentityDecision,
  DuplicateRelationship,
  DataQualitySnapshot
} from './candidateIdentityTypes.ts';

import {
  normalizeBusinessNameForIdentity,
  normalizeAddressForIdentity,
  normalizePhoneForIdentity,
  normalizeWebsiteForIdentity,
  normalizeMapsUrlSlug
} from './candidateNormalizer.ts';

import {
  compareCandidatesForIdentity,
  type MatchSubject
} from './candidateMatcher.ts';

import {
  createSessionCandidateFromObservation,
  mergeObservationIntoSessionCandidate
} from './candidateMerger.ts';

import { hashStringDeterministic } from './searchUnit.ts';

export class CandidateRegistry {
  private readonly _sessionId: string;
  private readonly _candidates = new Map<string, SessionCandidate>();
  private readonly _candidateOrder: string[] = [];

  // Multi-key blocking indexes (mapping normalized keys -> candidate IDs)
  private readonly _byPlaceId = new Map<string, string>();
  private readonly _byMapsUrlSlug = new Map<string, string>();
  private readonly _byNameAddressKey = new Map<string, string>();
  private readonly _byNameKey = new Map<string, Set<string>>();
  private readonly _byPhoneKey = new Map<string, Set<string>>();
  private readonly _byDomainKey = new Map<string, Set<string>>();

  // Relationship tracking
  private readonly _potentialDuplicates = new Map<string, DuplicateRelationship>();
  private readonly _identityConflicts = new Map<string, DuplicateRelationship>();

  private _rawObservations = 0;
  private _duplicateObservations = 0;

  constructor(sessionId: string = '') {
    this._sessionId = sessionId;
  }

  public get sessionId(): string {
    return this._sessionId;
  }

  public get size(): number {
    return this._candidates.size;
  }

  public get knownCandidateIds(): ReadonlyArray<string> {
    return this._candidateOrder;
  }

  public has(candidateId: string): boolean {
    return this._candidates.has(candidateId);
  }

  public get(candidateId: string): SessionCandidate | undefined {
    return this._candidates.get(candidateId);
  }

  public getAll(): readonly SessionCandidate[] {
    return Array.from(this._candidates.values());
  }

  public getAllCandidates(): readonly SessionCandidate[] {
    return this.getAll();
  }

  public updateCandidate(candidate: SessionCandidate): void {
    if (this._candidates.has(candidate.candidateId)) {
      this._candidates.set(candidate.candidateId, candidate);
      this._updateIndexes(candidate);
    }
  }

  public getEnrichedCount(): number {
    let count = 0;
    for (const c of this._candidates.values()) {
      if (c.enrichmentStatus === 'COMPLETED' || c.enrichmentStatus === 'PARTIAL') {
        count++;
      }
    }
    return count;
  }

  public getPotentialDuplicates(): readonly DuplicateRelationship[] {
    return Array.from(this._potentialDuplicates.values());
  }

  public getIdentityConflicts(): readonly DuplicateRelationship[] {
    return Array.from(this._identityConflicts.values());
  }

  public getStats(): {
    uniqueCandidates: number;
    duplicateObservations: number;
    rawObservations: number;
    potentialDuplicates: number;
    identityConflicts: number;
  } {
    return {
      uniqueCandidates: this._candidates.size,
      duplicateObservations: this._duplicateObservations,
      rawObservations: this._rawObservations,
      potentialDuplicates: this._potentialDuplicates.size,
      identityConflicts: this._identityConflicts.size
    };
  }

  /**
   * Registers a newly observed Google Maps candidate observation.
   * Performs incremental indexed blocking, equivalence testing, auto-merge or distinct registration.
   */
  public registerObservation(observation: GoogleMapsCandidateObservation): {
    isNew: boolean;
    candidate: SessionCandidate;
    candidateId: string;
    decision: IdentityDecision;
  } {
    this._rawObservations++;

    const rawName = observation.businessName?.parsedValue ?? observation.businessName?.rawValue;
    const rawAddr = observation.address?.parsedValue ?? observation.address?.rawValue;
    const rawPhone = observation.phone?.parsedValue ?? observation.phone?.rawValue;
    const rawWeb = observation.websiteUrl?.parsedValue ?? observation.websiteUrl?.rawValue;
    const rawPlaceId = observation.placeId?.parsedValue ?? observation.placeId?.rawValue;
    const rawMapsUrl = observation.mapsUrl?.parsedValue ?? observation.mapsUrl?.rawValue;

    const normName = normalizeBusinessNameForIdentity(rawName);
    const normAddr = normalizeAddressForIdentity(rawAddr);
    const normPhone = normalizePhoneForIdentity(rawPhone);
    const normWeb = normalizeWebsiteForIdentity(rawWeb);
    const mapsSlug = normalizeMapsUrlSlug(rawMapsUrl);
    const placeId = rawPlaceId?.trim();

    const isPlaceIdValid = Boolean(placeId && (placeId.startsWith('ChIJ') || placeId.startsWith('0x') || placeId.includes(':')));

    // 1. Query blocking indexes to gather plausible candidate IDs (O(1) average lookup)
    const candidateIdSet = new Set<string>();

    if (isPlaceIdValid && placeId) {
      const matchId = this._byPlaceId.get(placeId);
      if (matchId) candidateIdSet.add(matchId);
    }

    if (mapsSlug && mapsSlug.length >= 3) {
      const matchId = this._byMapsUrlSlug.get(mapsSlug);
      if (matchId) candidateIdSet.add(matchId);
    }

    if (normName.comparisonKey && normAddr.comparisonKey && normAddr.comparisonKey.length >= 5) {
      const nameAddrKey = `${normName.comparisonKey}::${normAddr.comparisonKey}`;
      const matchId = this._byNameAddressKey.get(nameAddrKey);
      if (matchId) candidateIdSet.add(matchId);
    }

    if (normName.comparisonKey) {
      const nameMatches = this._byNameKey.get(normName.comparisonKey);
      if (nameMatches) {
        for (const cid of nameMatches) candidateIdSet.add(cid);
      }
    }

    if (normPhone.isValid && normPhone.nationalDigits.length >= 8) {
      const phoneMatches = this._byPhoneKey.get(normPhone.nationalDigits);
      if (phoneMatches) {
        for (const cid of phoneMatches) candidateIdSet.add(cid);
      }
    }

    if (normWeb.domain) {
      const domainMatches = this._byDomainKey.get(normWeb.domain);
      if (domainMatches) {
        for (const cid of domainMatches) candidateIdSet.add(cid);
      }
    }

    // Subject representation for comparison
    const incomingSubject: MatchSubject = {
      observationId: observation.observationId,
      businessName: rawName,
      placeId: isPlaceIdValid ? placeId : undefined,
      mapsUrl: rawMapsUrl,
      address: rawAddr,
      phone: rawPhone,
      websiteUrl: rawWeb,
      category: observation.category?.parsedValue ?? observation.category?.rawValue,
      searchLocation: observation.searchLocation,
      searchKeyword: observation.searchKeyword,
      searchUnitId: observation.searchUnitId
    };

    // Derive deterministic session candidate ID (cid_<hash>)
    const derivedCandidateId = (observation.candidateId?.startsWith('cid_') ? observation.candidateId : undefined) ||
      (observation.observationId?.startsWith('cid_') ? observation.observationId : undefined) ||
      this._deriveDeterministicCandidateId(
        isPlaceIdValid ? placeId : undefined,
        mapsSlug,
        normName.comparisonKey,
        normAddr.comparisonKey,
        observation.category?.parsedValue ?? observation.category?.rawValue,
        observation.searchLocation,
        observation.searchUnitId
      );

    if (derivedCandidateId) {
      candidateIdSet.add(derivedCandidateId);
    }

    // Check if this candidate is a placeholder restored from checkpoint
    const placeholder = this._candidates.get(derivedCandidateId);
    if (placeholder && !placeholder.businessName) {
      const orderIdx = this._candidateOrder.indexOf(derivedCandidateId);
      const restored = createSessionCandidateFromObservation(
        observation,
        {
          relationship: 'SAME',
          confidence: isPlaceIdValid ? 0.99 : mapsSlug ? 0.95 : 0.85,
          confidenceTier: 'HIGH',
          method: isPlaceIdValid ? 'VISIBLE_PLACE_ID' : mapsSlug ? 'MAPS_URL' : 'NAME_ADDRESS',
          evidence: [rawName || 'restored'],
          reasons: ['Restored checkpoint identity matching incoming observation']
        },
        derivedCandidateId,
        orderIdx >= 0 ? orderIdx + 1 : this._candidateOrder.length + 1
      );
      this._candidates.set(derivedCandidateId, restored);
      this._updateIndexes(restored);
      return {
        isNew: false,
        candidate: restored,
        candidateId: derivedCandidateId,
        decision: {
          relationship: 'SAME',
          confidence: 0.95,
          confidenceTier: 'HIGH',
          method: isPlaceIdValid ? 'VISIBLE_PLACE_ID' : mapsSlug ? 'MAPS_URL' : 'NAME_ADDRESS',
          evidence: ['Checkpoint restoration'],
          reasons: ['Observation matches checkpoint identity']
        }
      };
    }

    // 2. Test plausible candidates
    let confirmedSameCandidate: SessionCandidate | undefined;
    let strongestDecision: IdentityDecision | undefined;

    for (const cid of candidateIdSet) {
      const existing = this._candidates.get(cid);
      if (!existing || !existing.businessName) continue;

      const existingSubject: MatchSubject = {
        candidateId: existing.candidateId,
        businessName: existing.businessName?.parsedValue ?? existing.businessName?.rawValue,
        placeId: existing.placeId?.parsedValue ?? existing.placeId?.rawValue,
        mapsUrl: existing.mapsUrl?.parsedValue ?? existing.mapsUrl?.rawValue,
        address: existing.address?.parsedValue ?? existing.address?.rawValue,
        phone: existing.phone?.parsedValue ?? existing.phone?.rawValue,
        websiteUrl: existing.websiteUrl?.parsedValue ?? existing.websiteUrl?.rawValue,
        category: existing.category?.parsedValue ?? existing.category?.rawValue,
        searchLocation: existing.searchLocation,
        searchKeyword: existing.searchKeyword,
        searchUnitId: existing.searchUnitId
      };

      const decision = compareCandidatesForIdentity(existingSubject, incomingSubject);

      if (decision.relationship === 'SAME') {
        confirmedSameCandidate = existing;
        strongestDecision = decision;
        break;
      } else if (decision.relationship === 'POTENTIAL_DUPLICATE') {
        const pairKey = [existing.candidateId, observation.observationId].sort().join('::');
        this._potentialDuplicates.set(pairKey, {
          candidateIdA: existing.candidateId,
          candidateIdB: observation.observationId,
          relationship: 'POTENTIAL_DUPLICATE',
          confidence: decision.confidence,
          method: decision.method,
          reason: decision.reasons.join('; '),
          detectedAt: new Date().toISOString(),
          evidence: decision.evidence
        });
        if (!strongestDecision || decision.confidence > strongestDecision.confidence) {
          strongestDecision = decision;
        }
      } else if (decision.relationship === 'CONFLICT') {
        const pairKey = [existing.candidateId, observation.observationId].sort().join('::');
        this._identityConflicts.set(pairKey, {
          candidateIdA: existing.candidateId,
          candidateIdB: observation.observationId,
          relationship: 'CONFLICT',
          confidence: decision.confidence,
          method: decision.method,
          reason: decision.reasons.join('; '),
          detectedAt: new Date().toISOString(),
          evidence: decision.evidence
        });
        if (!strongestDecision || decision.confidence > strongestDecision.confidence) {
          strongestDecision = decision;
        }
      }
    }

    // 3. Handle Auto-Merge (SAME)
    if (confirmedSameCandidate && strongestDecision) {
      this._duplicateObservations++;
      const mergedCandidate = mergeObservationIntoSessionCandidate(
        confirmedSameCandidate,
        observation,
        strongestDecision
      );

      this._candidates.set(confirmedSameCandidate.candidateId, mergedCandidate);
      this._updateIndexes(mergedCandidate);

      return {
        isNew: false,
        candidate: mergedCandidate,
        candidateId: confirmedSameCandidate.candidateId,
        decision: strongestDecision
      };
    }

    // 4. Handle New Distinct Session Candidate
    const initialDecision: IdentityDecision = strongestDecision || {
      relationship: 'DISTINCT',
      confidence: isPlaceIdValid ? 0.99 : mapsSlug ? 0.95 : (normName.comparisonKey && normAddr.comparisonKey) ? 0.85 : 0.50,
      confidenceTier: isPlaceIdValid || mapsSlug || (normName.comparisonKey && normAddr.comparisonKey) ? 'HIGH' : 'LOW',
      method: isPlaceIdValid ? 'VISIBLE_PLACE_ID' : mapsSlug ? 'MAPS_URL' : (normName.comparisonKey && normAddr.comparisonKey) ? 'NAME_ADDRESS' : 'WEAK_FALLBACK',
      evidence: [rawName || 'unknown'],
      reasons: ['Initial candidate observation registered as unique session candidate']
    };

    const newCandidate = createSessionCandidateFromObservation(
      observation,
      initialDecision,
      derivedCandidateId,
      this._candidateOrder.length + 1
    );

    this._candidates.set(derivedCandidateId, newCandidate);
    this._candidateOrder.push(derivedCandidateId);
    this._updateIndexes(newCandidate);

    return {
      isNew: true,
      candidate: newCandidate,
      candidateId: derivedCandidateId,
      decision: initialDecision
    };
  }

  private _deriveDeterministicCandidateId(
    placeId?: string,
    mapsSlug?: string,
    normNameKey?: string,
    normAddrKey?: string,
    category?: string,
    location?: string,
    searchUnitId?: string
  ): string {
    if (placeId && (placeId.startsWith('ChIJ') || placeId.startsWith('0x') || placeId.includes(':'))) {
      return `cid_${hashStringDeterministic(`PID::${placeId}`)}`;
    }
    if (mapsSlug && mapsSlug.length >= 3) {
      return `cid_${hashStringDeterministic(`URL::${mapsSlug}`)}`;
    }
    if (normNameKey && normAddrKey && normAddrKey.length >= 5) {
      return `cid_${hashStringDeterministic(`NAME_ADDR::${normNameKey}::${normAddrKey}`)}`;
    }
    if (normNameKey && (category || location)) {
      return `cid_${hashStringDeterministic(`NAME_CAT_LOC::${normNameKey}::${category || ''}::${location || ''}::${searchUnitId || 'none'}`)}`;
    }
    return `cid_${hashStringDeterministic(`FALLBACK::${normNameKey || 'unknown'}::${searchUnitId || 'none'}`)}`;
  }

  private _updateIndexes(candidate: SessionCandidate): void {
    const cid = candidate.candidateId;

    const pid = candidate.placeId?.parsedValue ?? candidate.placeId?.rawValue;
    if (pid && (pid.startsWith('ChIJ') || pid.startsWith('0x') || pid.includes(':'))) {
      this._byPlaceId.set(pid.trim(), cid);
    }

    const mapsUrl = candidate.mapsUrl?.parsedValue ?? candidate.mapsUrl?.rawValue;
    const slug = normalizeMapsUrlSlug(mapsUrl);
    if (slug && slug.length >= 3) {
      this._byMapsUrlSlug.set(slug, cid);
    }

    const rawName = candidate.businessName?.parsedValue ?? candidate.businessName?.rawValue;
    const normName = normalizeBusinessNameForIdentity(rawName);

    const rawAddr = candidate.address?.parsedValue ?? candidate.address?.rawValue;
    const normAddr = normalizeAddressForIdentity(rawAddr);

    if (normName.comparisonKey && normAddr.comparisonKey && normAddr.comparisonKey.length >= 5) {
      this._byNameAddressKey.set(`${normName.comparisonKey}::${normAddr.comparisonKey}`, cid);
    }

    if (normName.comparisonKey) {
      let set = this._byNameKey.get(normName.comparisonKey);
      if (!set) {
        set = new Set();
        this._byNameKey.set(normName.comparisonKey, set);
      }
      set.add(cid);
    }

    const rawPhone = candidate.phone?.parsedValue ?? candidate.phone?.rawValue;
    const normPhone = normalizePhoneForIdentity(rawPhone);
    if (normPhone.isValid && normPhone.nationalDigits.length >= 8) {
      let set = this._byPhoneKey.get(normPhone.nationalDigits);
      if (!set) {
        set = new Set();
        this._byPhoneKey.set(normPhone.nationalDigits, set);
      }
      set.add(cid);
    }

    const rawWeb = candidate.websiteUrl?.parsedValue ?? candidate.websiteUrl?.rawValue;
    const normWeb = normalizeWebsiteForIdentity(rawWeb);
    if (normWeb.domain) {
      let set = this._byDomainKey.get(normWeb.domain);
      if (!set) {
        set = new Set();
        this._byDomainKey.set(normWeb.domain, set);
      }
      set.add(cid);
    }
  }

  /**
   * Generates a comprehensive data quality snapshot for the session.
   */
  public getQualitySnapshot(): DataQualitySnapshot {
    const totalCandidates = this._candidates.size;
    let totalCompleteness = 0;
    const completenessScores: number[] = [];

    const completenessDist = {
      tier0To25: 0,
      tier26To50: 0,
      tier51To75: 0,
      tier76To100: 0
    };

    const identityDist = {
      high: 0,
      medium: 0,
      low: 0,
      conflict: 0
    };

    const fieldCounts: Record<string, number> = {
      businessName: 0,
      category: 0,
      address: 0,
      phone: 0,
      websiteUrl: 0,
      rating: 0,
      reviewCount: 0,
      businessStatus: 0,
      mapsUrl: 0
    };

    let candidatesWithFieldConflicts = 0;

    for (const candidate of this._candidates.values()) {
      const q = candidate.qualityMetrics;
      const score = q.dataCompleteness;
      totalCompleteness += score;
      completenessScores.push(score);

      if (score <= 25) completenessDist.tier0To25++;
      else if (score <= 50) completenessDist.tier26To50++;
      else if (score <= 75) completenessDist.tier51To75++;
      else completenessDist.tier76To100++;

      if (q.identityConfidence === 'HIGH') identityDist.high++;
      else if (q.identityConfidence === 'MEDIUM') identityDist.medium++;
      else if (q.identityConfidence === 'LOW') identityDist.low++;
      else if (q.identityConfidence === 'CONFLICT') identityDist.conflict++;

      for (const [fn, st] of Object.entries(q.fieldStates)) {
        if (st === 'CONFIDENT' || st === 'SUPPORTED') {
          fieldCounts[fn] = (fieldCounts[fn] || 0) + 1;
        }
      }

      if (q.conflictFieldCount > 0) {
        candidatesWithFieldConflicts++;
      }
    }

    completenessScores.sort((a, b) => a - b);
    const medianCompleteness = completenessScores.length > 0
      ? completenessScores[Math.floor(completenessScores.length / 2)]
      : 0;
    const averageCompleteness = totalCandidates > 0
      ? Math.round((totalCompleteness / totalCandidates) * 10) / 10
      : 0;

    const duplicateRate = this._rawObservations > 0
      ? Math.round((this._duplicateObservations / this._rawObservations) * 1000) / 1000
      : 0;

    return {
      totalRawObservations: this._rawObservations,
      uniqueCandidates: totalCandidates,
      duplicateObservations: this._duplicateObservations,
      duplicateRate,
      potentialDuplicatesCount: this._potentialDuplicates.size,
      identityConflictsCount: this._identityConflicts.size,
      candidatesWithFieldConflictsCount: candidatesWithFieldConflicts,
      averageCompleteness,
      medianCompleteness,
      completenessDistribution: completenessDist,
      identityTierDistribution: identityDist,
      fieldPresenceCounts: fieldCounts
    };
  }

  public exportCheckpointData(): {
    sessionId: string;
    knownCount: number;
    knownCandidateIds: string[];
    rawObservations: number;
    duplicateObservations: number;
  } {
    return {
      sessionId: this._sessionId,
      knownCount: this._candidates.size,
      knownCandidateIds: [...this._candidateOrder],
      rawObservations: this._rawObservations,
      duplicateObservations: this._duplicateObservations
    };
  }

  public importCheckpointData(data: {
    knownCandidateIds?: readonly string[];
    rawObservations?: number;
    duplicateObservations?: number;
  }): void {
    if (data?.knownCandidateIds) {
      for (const id of data.knownCandidateIds) {
        if (!this._candidates.has(id)) {
          this._candidateOrder.push(id);
          this._candidates.set(id, { candidateId: id } as any);
        }
      }
    }
    if (typeof data?.rawObservations === 'number') {
      this._rawObservations = data.rawObservations;
    }
    if (typeof data?.duplicateObservations === 'number') {
      this._duplicateObservations = data.duplicateObservations;
    }
  }

  public clear(): void {
    this._candidates.clear();
    this._candidateOrder.length = 0;
    this._byPlaceId.clear();
    this._byMapsUrlSlug.clear();
    this._byNameAddressKey.clear();
    this._byNameKey.clear();
    this._byPhoneKey.clear();
    this._byDomainKey.clear();
    this._potentialDuplicates.clear();
    this._identityConflicts.clear();
    this._rawObservations = 0;
    this._duplicateObservations = 0;
  }

  public dispose(): void {
    this.clear();
  }
}
