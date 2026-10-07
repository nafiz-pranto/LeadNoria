/**
 * LeadNoria — Google Maps Candidate Identity & Virtualized Feed Deduplication
 * Deterministic Content-Addressed Identity, Evidence Hierarchy & Field Merging
 *
 * Invariants:
 * - NEVER use DOM node identity as business identity (DOM nodes are recycled in virtualized feeds).
 * - Stable identity hierarchy:
 *   1. MAPS_URL (canonical place URL path/slug)
 *   2. VISIBLE_PLACE_ID (ChIJ... Google place token)
 *   3. NAME_ADDRESS (normalized business name + normalized address)
 *   4. NAME_CATEGORY_LOCATION (normalized name + category + location)
 *   5. WEAK_FALLBACK (normalized name + search unit id)
 * - Field merging across multiple observation cycles obeys strict evidence precedence:
 *   PRESENT > AMBIGUOUS > UNKNOWN. ABSENT must NEVER overwrite PRESENT.
 * - Deduplication is scoped per session/searchUnit to preserve isolation.
 * - Bounded memory: stores compact strings/IDs, zero DOM nodes, zero HTML strings.
 */

import type {
  CandidateIdentity,
  CandidateIdentityMethod,
  GoogleMapsCandidateObservation,
  ObservedField,
  FieldAvailability
} from './types.ts';
import { hashStringDeterministic } from './searchUnit.ts';

/**
 * Normalizes text for identity comparison:
 * - Lowercase
 * - Strips punctuation and symbols
 * - Collapses whitespace
 */
export function normalizeIdentityText(input?: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes a Google Maps place URL for stable identity hashing.
 * Extracts the canonical place slug / coordinates / place id if present.
 */
export function normalizeMapsUrlForIdentity(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    // Path /maps/place/<name>/@<lat>,<lng>...
    const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      return decodeURIComponent(placeMatch[1]).toLowerCase().replace(/\+/g, ' ').trim();
    }
    // Query param q=<name>
    const q = parsed.searchParams.get('q');
    if (q) {
      return q.toLowerCase().replace(/\+/g, ' ').trim();
    }
  } catch {
    if (url.includes('/maps/place/')) {
      const parts = url.split('/maps/place/')[1]?.split(/[\/@?]/)[0];
      if (parts) return parts.toLowerCase().replace(/\+/g, ' ').trim();
    }
  }
  return undefined;
}

/**
 * Derives a deterministic stable candidate identity based on the evidence hierarchy.
 */
export function deriveCandidateIdentity(
  candidate: {
    businessName?: string;
    placeId?: string;
    mapsUrl?: string;
    address?: string;
    category?: string;
    searchKeyword?: string;
    searchLocation?: string;
    searchUnitId?: string;
  }
): CandidateIdentity {
  const normName = normalizeIdentityText(candidate.businessName);
  const normAddress = normalizeIdentityText(candidate.address);
  const normCategory = normalizeIdentityText(candidate.category);
  const normLocation = normalizeIdentityText(candidate.searchLocation);
  const placeId = candidate.placeId?.trim();
  const normUrlSlug = normalizeMapsUrlForIdentity(candidate.mapsUrl);

  // 1. VISIBLE_PLACE_ID: Strongest single-source identity
  if (placeId && (placeId.startsWith('ChIJ') || placeId.startsWith('0x') || placeId.includes(':'))) {
    const candidateId = `cid_${hashStringDeterministic(`PID::${placeId}`)}`;
    return {
      candidateId,
      identityMethod: 'VISIBLE_PLACE_ID',
      identityConfidence: 0.99,
      evidence: `PlaceId:${placeId}`
    };
  }

  // 2. MAPS_URL: Normalized place slug / path from link
  if (normUrlSlug && normUrlSlug.length >= 3) {
    const candidateId = `cid_${hashStringDeterministic(`URL::${normUrlSlug}`)}`;
    return {
      candidateId,
      identityMethod: 'MAPS_URL',
      identityConfidence: 0.95,
      evidence: `MapsUrlSlug:${normUrlSlug}`
    };
  }

  // 3. NAME_ADDRESS: Normalized name + address
  if (normName && normAddress && normAddress.length >= 5) {
    const composite = `NAME_ADDR::${normName}::${normAddress}`;
    const candidateId = `cid_${hashStringDeterministic(composite)}`;
    return {
      candidateId,
      identityMethod: 'NAME_ADDRESS',
      identityConfidence: 0.85,
      evidence: `${normName} | ${normAddress}`
    };
  }

  // 4. NAME_CATEGORY_LOCATION: Normalized name + category + search location
  if (normName && (normCategory || normLocation)) {
    const composite = `NAME_CAT_LOC::${normName}::${normCategory || ''}::${normLocation || ''}`;
    const candidateId = `cid_${hashStringDeterministic(composite)}`;
    return {
      candidateId,
      identityMethod: 'NAME_CATEGORY_LOCATION',
      identityConfidence: 0.75,
      evidence: `${normName} | ${normCategory} | ${normLocation}`
    };
  }

  // 5. WEAK_FALLBACK: Name + Search Unit ID
  const fallbackComposite = `FALLBACK::${normName || 'unknown'}::${candidate.searchUnitId || 'none'}`;
  const candidateId = `cid_${hashStringDeterministic(fallbackComposite)}`;
  return {
    candidateId,
    identityMethod: 'WEAK_FALLBACK',
    identityConfidence: 0.50,
    evidence: `Fallback:${normName || 'unknown'}`
  };
}

/**
 * Merges two observed fields adhering to strict evidence precedence:
 * PRESENT > AMBIGUOUS > UNKNOWN > ABSENT > UNSUPPORTED.
 * Invariant: ABSENT or UNKNOWN must NEVER overwrite an existing PRESENT field.
 */
function mergeObservedField<T>(
  existing: ObservedField<T>,
  incoming: ObservedField<T>
): ObservedField<T> {
  const precedenceScore: Record<FieldAvailability, number> = {
    PRESENT: 5,
    AMBIGUOUS: 4,
    UNKNOWN: 3,
    ABSENT: 2,
    UNSUPPORTED: 1
  };

  const existingScore = precedenceScore[existing.availability] ?? 0;
  const incomingScore = precedenceScore[incoming.availability] ?? 0;

  // If incoming has strictly higher precedence, take incoming
  if (incomingScore > existingScore) {
    return incoming;
  }

  // If both are PRESENT, keep existing or choose higher confidence
  if (existing.availability === 'PRESENT' && incoming.availability === 'PRESENT') {
    if (incoming.confidence > existing.confidence && incoming.parsedValue !== undefined) {
      return incoming;
    }
    return existing;
  }

  // Retain existing by default
  return existing;
}

/**
 * Enriches and merges an existing in-session candidate observation with newly observed fields.
 * Preserves multi-observation statistics: observationCount, firstObservedAt, lastObservedAt.
 */
export function mergeCandidateObservations(
  existing: GoogleMapsCandidateObservation,
  incoming: GoogleMapsCandidateObservation
): GoogleMapsCandidateObservation {
  const now = new Date().toISOString();
  const obsCount = (existing.observationCount ?? 1) + 1;
  const firstObs = existing.firstObservedAt || existing.observedAt;

  const mergedBusinessName = mergeObservedField(existing.businessName, incoming.businessName);
  const mergedCategory = mergeObservedField(existing.category, incoming.category);
  const mergedAddress = mergeObservedField(existing.address, incoming.address);
  const mergedPhone = mergeObservedField(existing.phone, incoming.phone);
  const mergedWebsite = mergeObservedField(existing.websiteUrl, incoming.websiteUrl);
  const mergedRating = mergeObservedField(existing.rating, incoming.rating);
  const mergedReviews = mergeObservedField(existing.reviewCount, incoming.reviewCount);
  const mergedStatus = mergeObservedField(existing.businessStatus, incoming.businessStatus);
  const mergedPlaceId = mergeObservedField(existing.placeId, incoming.placeId);
  const mergedMapsUrl = mergeObservedField(existing.mapsUrl, incoming.mapsUrl);

  const fieldAvailability: Record<string, FieldAvailability> = {
    businessName: mergedBusinessName.availability,
    category: mergedCategory.availability,
    address: mergedAddress.availability,
    phone: mergedPhone.availability,
    websiteUrl: mergedWebsite.availability,
    rating: mergedRating.availability,
    reviewCount: mergedReviews.availability,
    businessStatus: mergedStatus.availability,
    placeId: mergedPlaceId.availability,
    mapsUrl: mergedMapsUrl.availability
  };

  return {
    ...existing,
    businessName: mergedBusinessName,
    category: mergedCategory,
    address: mergedAddress,
    phone: mergedPhone,
    websiteUrl: mergedWebsite,
    rating: mergedRating,
    reviewCount: mergedReviews,
    businessStatus: mergedStatus,
    placeId: mergedPlaceId,
    mapsUrl: mergedMapsUrl,
    fieldAvailability,
    observationCount: obsCount,
    firstObservedAt: firstObs,
    lastObservedAt: now
  };
}

export * from './candidateIdentityTypes.ts';
export * from './candidateNormalizer.ts';
export * from './candidateMatcher.ts';
export * from './candidateMerger.ts';
export * from './candidateRegistry.ts';

import { CandidateRegistry } from './candidateRegistry.ts';
import type {
  SessionCandidate,
  DuplicateRelationship,
  DataQualitySnapshot
} from './candidateIdentityTypes.ts';

/**
 * In-session deduplication and candidate registry.
 * Isolates candidates to a single search unit or session.
 * Powered by CandidateRegistry with multi-key blocking indexes and data quality tracking.
 */
export class SessionCandidateDeduplicator {
  private readonly _searchUnitId: string;
  private readonly _registry: CandidateRegistry;

  constructor(searchUnitId: string = '') {
    this._searchUnitId = searchUnitId;
    this._registry = new CandidateRegistry(searchUnitId);
  }

  public get searchUnitId(): string {
    return this._searchUnitId;
  }

  public get registry(): CandidateRegistry {
    return this._registry;
  }

  public get size(): number {
    return this._registry.size;
  }

  public get knownCandidateIds(): ReadonlyArray<string> {
    return this._registry.knownCandidateIds;
  }

  public has(candidateId: string): boolean {
    return this._registry.has(candidateId);
  }

  public get(candidateId: string): GoogleMapsCandidateObservation | SessionCandidate | undefined {
    return this._registry.get(candidateId);
  }

  public getAll(): readonly SessionCandidate[] {
    return this._registry.getAll();
  }

  public updateCandidate(candidate: SessionCandidate): void {
    this._registry.updateCandidate(candidate);
  }

  public getEnrichedCount(): number {
    return this._registry.getEnrichedCount();
  }

  public getStats(): {
    uniqueCandidates: number;
    duplicateObservations: number;
    rawObservations: number;
  } {
    const stats = this._registry.getStats();
    return {
      uniqueCandidates: stats.uniqueCandidates,
      duplicateObservations: stats.duplicateObservations,
      rawObservations: stats.rawObservations
    };
  }

  public getExtendedStats(): {
    uniqueCandidates: number;
    duplicateObservations: number;
    rawObservations: number;
    potentialDuplicates: number;
    identityConflicts: number;
  } {
    return this._registry.getStats();
  }

  public getQualitySnapshot(): DataQualitySnapshot {
    return this._registry.getQualitySnapshot();
  }

  public getPotentialDuplicates(): readonly DuplicateRelationship[] {
    return this._registry.getPotentialDuplicates();
  }

  public getIdentityConflicts(): readonly DuplicateRelationship[] {
    return this._registry.getIdentityConflicts();
  }

  public register(candidate: GoogleMapsCandidateObservation): {
    isNew: boolean;
    candidate: GoogleMapsCandidateObservation | SessionCandidate;
    candidateId: string;
  } {
    const res = this._registry.registerObservation(candidate);
    return {
      isNew: res.isNew,
      candidate: res.candidate,
      candidateId: res.candidateId
    };
  }

  public registerObservation(candidate: GoogleMapsCandidateObservation): {
    isNew: boolean;
    candidate: GoogleMapsCandidateObservation | SessionCandidate;
    candidateId: string;
  } {
    return this.register(candidate);
  }

  public exportCheckpointData(): {
    searchUnitId: string;
    knownCount: number;
    knownCandidateIds: string[];
    rawObservations: number;
    duplicateObservations: number;
  } {
    const exp = this._registry.exportCheckpointData();
    return {
      searchUnitId: this._searchUnitId,
      knownCount: exp.knownCount,
      knownCandidateIds: exp.knownCandidateIds,
      rawObservations: exp.rawObservations,
      duplicateObservations: exp.duplicateObservations
    };
  }

  public importCheckpointData(data: {
    knownCandidateIds?: readonly string[];
    rawObservations?: number;
    duplicateObservations?: number;
  }): void {
    this._registry.importCheckpointData(data);
  }

  public clear(): void {
    this._registry.clear();
  }

  public seedFromCheckpoint(knownIds: readonly string[]): void {
    this._registry.importCheckpointData({ knownCandidateIds: knownIds });
  }
}

