/**
 * LeadNoria — Google Maps Candidate Field Evidence Merger & Quality Assessor
 * Part 5: Deterministic Field Evidence Precedence, Conflict Representation & Completeness
 *
 * HARD BOUNDARIES & INVARIANTS:
 * - Deterministic, pure functions with zero side-effects.
 * - Evidence precedence: PRESENT > AMBIGUOUS > UNKNOWN > ABSENT > UNSUPPORTED.
 * - UNKNOWN never overwrites PRESENT. ABSENT never silently overwrites PRESENT.
 * - Temporal fields (rating, reviewCount, businessStatus) reflect latest observation variance,
 *   NEVER identity conflict, and are NEVER synthetically averaged.
 * - Website PRESENT + ABSENT creates WEBSITE_EVIDENCE_CONFLICT; does NOT downgrade PRESENT.
 * - Data completeness is strictly decoupled from identity confidence.
 * - Provenance from multiple SearchUnits preserved with bounded memory caps.
 */

import type {
  FieldAvailability,
  ObservedField,
  GoogleMapsCandidateObservation
} from './types.ts';

import type {
  SessionCandidate,
  FieldConflict,
  FieldEvidenceEntry,
  CandidateObservationReference,
  ObservedSearchUnitContext,
  CandidateQualityMetrics,
  FieldLevelQualityState,
  DataQualityIssue,
  IdentityDecision
} from './candidateIdentityTypes.ts';

import {
  arePhonesEquivalent,
  normalizeWebsiteForIdentity
} from './candidateNormalizer.ts';

export const DEFAULT_EVIDENCE_BOUNDS = {
  maxObservationReferences: 50,
  maxSearchUnitContexts: 50,
  maxFieldConflicts: 20,
  maxFieldEvidencePerField: 10
} as const;

const MAX_BOUNDED_OBSERVATIONS = DEFAULT_EVIDENCE_BOUNDS.maxObservationReferences;
const MAX_BOUNDED_SEARCH_UNITS = DEFAULT_EVIDENCE_BOUNDS.maxSearchUnitContexts;
const MAX_BOUNDED_CONFLICTS = DEFAULT_EVIDENCE_BOUNDS.maxFieldConflicts;
const MAX_BOUNDED_FIELD_EVIDENCE = DEFAULT_EVIDENCE_BOUNDS.maxFieldEvidencePerField;

const CORE_FIELD_NAMES = [
  'businessName',
  'category',
  'address',
  'phone',
  'websiteUrl',
  'rating',
  'reviewCount',
  'businessStatus',
  'mapsUrl'
] as const;

const PRECEDENCE_SCORE: Record<FieldAvailability, number> = {
  PRESENT: 5,
  AMBIGUOUS: 4,
  UNKNOWN: 3,
  ABSENT: 2,
  UNSUPPORTED: 1
};

/**
 * Deterministically compares two observations for temporal precedence:
 * 1. Highest valid observedAt timestamp wins
 * 2. Deterministic observationId tie-break when observedAt is equal
 */
export function compareTemporalObservations(
  metaA: { observedAt?: string; observationId?: string },
  metaB: { observedAt?: string; observationId?: string }
): number {
  const timeA = metaA.observedAt ? new Date(metaA.observedAt).getTime() : 0;
  const timeB = metaB.observedAt ? new Date(metaB.observedAt).getTime() : 0;
  if (timeA !== timeB) {
    return timeA > timeB ? 1 : -1;
  }
  const idA = metaA.observationId || '';
  const idB = metaB.observationId || '';
  return idA.localeCompare(idB);
}

/**
 * Merges two observed fields adhering to strict evidence precedence.
 * For temporal fields (rating, reviewCount, businessStatus), deterministic timestamp + ID comparison is used.
 * For static fields with equal precedence, deterministic tie-breaking is enforced to guarantee order independence.
 */
function mergeSingleField<T>(
  existing: ObservedField<T>,
  incoming: ObservedField<T>,
  existingMeta: { observedAt?: string; observationId?: string },
  incomingMeta: { observedAt?: string; observationId?: string },
  isTemporalField: boolean = false
): {
  merged: ObservedField<T>;
  hasConflict: boolean;
  conflictReason?: string;
} {
  const existingScore = PRECEDENCE_SCORE[existing.availability] ?? 0;
  const incomingScore = PRECEDENCE_SCORE[incoming.availability] ?? 0;

  // 1. Incoming has strictly higher precedence
  if (incomingScore > existingScore) {
    return { merged: incoming, hasConflict: false };
  }

  // 2. Existing has strictly higher precedence
  if (existingScore > incomingScore) {
    // Special check: website PRESENT vs ABSENT conflict
    if (existing.availability === 'PRESENT' && incoming.availability === 'ABSENT') {
      return {
        merged: existing,
        hasConflict: true,
        conflictReason: 'WEBSITE_EVIDENCE_CONFLICT: incoming observation claims ABSENT while prior observation established PRESENT'
      };
    }
    return { merged: existing, hasConflict: false };
  }

  // 3. Both have EQUAL availability
  if (existing.availability === 'PRESENT' && incoming.availability === 'PRESENT') {
    // For temporal mutable fields (rating, reviewCount, businessStatus):
    // Deterministic selection based on highest observedAt + observationId tie-break
    if (isTemporalField) {
      let cmp = compareTemporalObservations(incomingMeta, existingMeta);
      if (cmp === 0) {
        // Ultimate deterministic tie-break on value if timestamps and observation IDs are identical
        const valA = String(existing.parsedValue ?? '');
        const valB = String(incoming.parsedValue ?? '');
        cmp = valB.localeCompare(valA);
      }
      const chosen = cmp > 0 ? incoming : existing;
      return { merged: chosen, hasConflict: false };
    }

    // For static identity fields: check equality
    const valA = String(existing.parsedValue ?? existing.rawValue ?? '');
    const valB = String(incoming.parsedValue ?? incoming.rawValue ?? '');

    if (valA && valB && valA !== valB) {
      // Choose higher confidence, or deterministic string tie-break for equal confidence
      let chosen: ObservedField<T>;
      if (incoming.confidence !== existing.confidence) {
        chosen = incoming.confidence > existing.confidence ? incoming : existing;
      } else {
        chosen = valB.localeCompare(valA) > 0 ? incoming : existing;
      }
      return {
        merged: chosen,
        hasConflict: true,
        conflictReason: `Conflicting PRESENT values observed: '${valA}' vs '${valB}'`
      };
    }

    // Equivalent values: choose higher confidence or deterministic winner
    return {
      merged: (incoming.confidence > existing.confidence) ? incoming : existing,
      hasConflict: false
    };
  }

  // Both UNKNOWN, ABSENT, or AMBIGUOUS: keep higher confidence or existing
  return {
    merged: (incoming.confidence > existing.confidence) ? incoming : existing,
    hasConflict: false
  };
}

/**
 * Computes deterministic data completeness and quality metrics for a session candidate.
 */
export function assessCandidateQuality(
  candidate: {
    businessName: ObservedField<string>;
    category: ObservedField<string>;
    address: ObservedField<string>;
    phone: ObservedField<string>;
    websiteUrl: ObservedField<string>;
    rating: ObservedField<number>;
    reviewCount: ObservedField<number>;
    businessStatus: ObservedField<string>;
    mapsUrl: ObservedField<string>;
    identityConfidenceTier: 'HIGH' | 'MEDIUM' | 'LOW' | 'CONFLICT';
    identityConfidenceScore: number;
    observationCount: number;
    fieldConflicts: readonly FieldConflict[];
  }
): CandidateQualityMetrics {
  let presentCount = 0;
  let absentCount = 0;
  let supportedCount = 0;
  let unknownCount = 0;
  const fieldStates: Record<string, FieldLevelQualityState> = {};
  const issues: DataQualityIssue[] = [];

  const conflictFieldMap = new Set(candidate.fieldConflicts.map(c => c.fieldName));

  for (const fieldName of CORE_FIELD_NAMES) {
    const field = candidate[fieldName] as ObservedField<unknown>;
    const avail = field?.availability ?? 'UNKNOWN';

    if (avail === 'PRESENT') {
      presentCount++;
      supportedCount++;
      if (conflictFieldMap.has(fieldName)) {
        fieldStates[fieldName] = 'CONFLICTING';
      } else {
        fieldStates[fieldName] = 'CONFIDENT';
      }
    } else if (avail === 'ABSENT') {
      absentCount++;
      supportedCount++;
      fieldStates[fieldName] = 'SUPPORTED';
    } else if (avail === 'AMBIGUOUS') {
      supportedCount++;
      fieldStates[fieldName] = 'INCOMPLETE';
    } else {
      unknownCount++;
      fieldStates[fieldName] = 'UNKNOWN';
    }
  }

  // 1. Data Completeness: percentage of 9 core fields with known evidence (PRESENT or explicit ABSENT)
  const knownCount = presentCount + absentCount;
  const dataCompleteness = Math.round((knownCount / CORE_FIELD_NAMES.length) * 1000) / 10; // e.g. 77.8

  // 2. Missing data issues (non-blocking) - only flag UNKNOWN, never explicit ABSENT evidence
  if (candidate.businessName.availability === 'UNKNOWN') {
    issues.push({ code: 'MISSING_NAME', field: 'businessName', severity: 'MEDIUM', message: 'Business name is missing or unverified' });
  }
  if (candidate.address.availability === 'UNKNOWN') {
    issues.push({ code: 'MISSING_ADDRESS', field: 'address', severity: 'LOW', message: 'Physical street address is unknown on observation surface' });
  }
  if (candidate.phone.availability === 'UNKNOWN') {
    issues.push({ code: 'MISSING_PHONE', field: 'phone', severity: 'LOW', message: 'Telephone number is unknown on observation surface' });
  }
  if (candidate.websiteUrl.availability === 'UNKNOWN') {
    issues.push({ code: 'MISSING_WEBSITE_EVIDENCE', field: 'websiteUrl', severity: 'LOW', message: 'Website link was not observed on card' });
  }
  if (candidate.rating.availability === 'UNKNOWN') {
    issues.push({ code: 'RATING_UNKNOWN', field: 'rating', severity: 'LOW', message: 'Rating is unknown on observation surface' });
  }
  if (candidate.reviewCount.availability === 'UNKNOWN') {
    issues.push({ code: 'REVIEW_COUNT_UNKNOWN', field: 'reviewCount', severity: 'LOW', message: 'Review count is unknown on observation surface' });
  }

  // 3. Identity issues
  if (candidate.identityConfidenceTier === 'LOW') {
    issues.push({ code: 'IDENTITY_WEAK', severity: 'LOW', message: 'Candidate identified via weak fallback signal' });
  } else if (candidate.identityConfidenceTier === 'CONFLICT') {
    issues.push({ code: 'IDENTITY_CONFLICT', severity: 'MEDIUM', message: 'Candidate contains conflicting identity attributes' });
  }

  // 4. Conflict issues
  if (candidate.fieldConflicts.length >= 2) {
    issues.push({ code: 'MULTI_FIELD_CONFLICT', severity: 'MEDIUM', message: `Multiple fields (${candidate.fieldConflicts.length}) have conflicting evidence` });
  }
  for (const conf of candidate.fieldConflicts) {
    if (conf.fieldName === 'phone') {
      issues.push({ code: 'INCONSISTENT_PHONE', field: 'phone', severity: 'LOW', message: conf.resolutionReason });
    } else if (conf.fieldName === 'address') {
      issues.push({ code: 'INCONSISTENT_ADDRESS', field: 'address', severity: 'LOW', message: conf.resolutionReason });
    } else if (conf.fieldName === 'websiteUrl') {
      issues.push({ code: 'WEBSITE_EVIDENCE_CONFLICT', field: 'websiteUrl', severity: 'LOW', message: conf.resolutionReason });
    }
  }

  if (candidate.observationCount > 1) {
    issues.push({ code: 'DUPLICATE_OBSERVATION', severity: 'INFO', message: `Candidate observed ${candidate.observationCount} times across SearchUnits` });
  }

  return {
    identityConfidence: candidate.identityConfidenceTier,
    identityConfidenceScore: candidate.identityConfidenceScore,
    dataCompleteness,
    observedFieldCount: presentCount,
    supportedFieldCount: supportedCount,
    unknownFieldCount: unknownCount,
    conflictFieldCount: candidate.fieldConflicts.length,
    fieldStates,
    issues
  };
}

/**
 * Initializes a new SessionCandidate envelope from a single raw observation.
 */
export function createSessionCandidateFromObservation(
  observation: GoogleMapsCandidateObservation,
  decision: IdentityDecision,
  assignedCandidateId: string,
  observedOrder?: number
): SessionCandidate {
  const now = observation.observedAt || new Date().toISOString();

  const obsRef: CandidateObservationReference = {
    observationId: observation.observationId,
    searchUnitId: observation.searchUnitId,
    observedAt: now,
    searchKeyword: observation.searchKeyword,
    searchLocation: observation.searchLocation,
    pageUrl: observation.pageUrl
  };

  const suContext: ObservedSearchUnitContext = {
    searchUnitId: observation.searchUnitId,
    keyword: observation.searchKeyword,
    location: observation.searchLocation,
    firstObservedAt: now,
    lastObservedAt: now,
    observationCount: 1
  };

  const fieldEvidence: Record<string, FieldEvidenceEntry[]> = {};
  for (const fn of CORE_FIELD_NAMES) {
    const field = observation[fn] as ObservedField<unknown>;
    if (field) {
      fieldEvidence[fn] = [{
        value: field.parsedValue ?? field.rawValue,
        availability: field.availability,
        confidence: field.confidence,
        observedAt: now,
        searchUnitId: observation.searchUnitId,
        observationId: observation.observationId
      }];
    }
  }

  const quality = assessCandidateQuality({
    businessName: observation.businessName,
    category: observation.category,
    address: observation.address,
    phone: observation.phone,
    websiteUrl: observation.websiteUrl,
    rating: observation.rating,
    reviewCount: observation.reviewCount,
    businessStatus: observation.businessStatus,
    mapsUrl: observation.mapsUrl,
    identityConfidenceTier: decision.confidenceTier,
    identityConfidenceScore: decision.confidence,
    observationCount: 1,
    fieldConflicts: []
  });

  return {
    candidateId: assignedCandidateId,
    firstObservedAt: now,
    lastObservedAt: now,
    observationCount: 1,
    source: 'GOOGLE_MAPS_BROWSER',
    isRestricted: true,
    businessName: observation.businessName,
    category: observation.category,
    address: observation.address,
    phone: observation.phone,
    websiteUrl: observation.websiteUrl,
    rating: observation.rating,
    reviewCount: observation.reviewCount,
    businessStatus: observation.businessStatus,
    placeId: observation.placeId,
    mapsUrl: observation.mapsUrl,
    fieldAvailability: { ...observation.fieldAvailability },
    identityMethod: decision.method,
    identityConfidence: decision.confidence,
    identityEvidence: decision.evidence.join(' | ') || decision.method,
    observationReferences: [obsRef],
    observedSearchUnits: [suContext],
    observedOrder,
    fieldConflicts: [],
    fieldEvidence,
    qualityMetrics: quality,
    // Projection properties for backwards compatibility
    observationId: assignedCandidateId,
    searchUnitId: observation.searchUnitId,
    sessionId: observation.sessionId,
    observedAt: now,
    pageUrl: observation.pageUrl,
    pageKind: observation.pageKind,
    searchKeyword: observation.searchKeyword,
    searchLocation: observation.searchLocation,
    provenance: observation.provenance,
    diagnostics: [...observation.diagnostics]
  };
}

/**
 * Merges a newly arrived duplicate observation into an existing SessionCandidate.
 * Enforces field evidence precedence, temporal observation variance, and bounded provenance.
 */
export function mergeObservationIntoSessionCandidate(
  existing: SessionCandidate,
  incoming: GoogleMapsCandidateObservation,
  decision: IdentityDecision
): SessionCandidate {
  const now = incoming.observedAt || new Date().toISOString();
  const newObsCount = existing.observationCount + 1;

  // 1. Provenance: Observation reference
  const newObsRef: CandidateObservationReference = {
    observationId: incoming.observationId,
    searchUnitId: incoming.searchUnitId,
    observedAt: now,
    searchKeyword: incoming.searchKeyword,
    searchLocation: incoming.searchLocation,
    pageUrl: incoming.pageUrl
  };
  const updatedObsRefs = [newObsRef, ...existing.observationReferences].slice(0, MAX_BOUNDED_OBSERVATIONS);

  // 2. SearchUnit Context
  const existingSuMap = new Map<string, ObservedSearchUnitContext>();
  for (const su of existing.observedSearchUnits) {
    existingSuMap.set(su.searchUnitId, su);
  }
  const currentSu = existingSuMap.get(incoming.searchUnitId);
  if (currentSu) {
    existingSuMap.set(incoming.searchUnitId, {
      ...currentSu,
      lastObservedAt: now,
      observationCount: currentSu.observationCount + 1
    });
  } else {
    existingSuMap.set(incoming.searchUnitId, {
      searchUnitId: incoming.searchUnitId,
      keyword: incoming.searchKeyword,
      location: incoming.searchLocation,
      firstObservedAt: now,
      lastObservedAt: now,
      observationCount: 1
    });
  }
  const updatedSearchUnits = Array.from(existingSuMap.values()).slice(0, MAX_BOUNDED_SEARCH_UNITS);

  // 3. Field-by-Field Merge with Precedence
  const newConflicts: FieldConflict[] = [...existing.fieldConflicts];
  const updatedFieldEvidence: Record<string, FieldEvidenceEntry[]> = {};
  for (const [k, v] of Object.entries(existing.fieldEvidence)) {
    updatedFieldEvidence[k] = [...v];
  }

  function mergeAndRecord<T>(
    fieldName: string,
    fieldExisting: ObservedField<T>,
    fieldIncoming: ObservedField<T>,
    isTemporal: boolean = false
  ): ObservedField<T> {
    const existingEntry = (existing.fieldEvidence[fieldName] && existing.fieldEvidence[fieldName].length > 0)
      ? existing.fieldEvidence[fieldName][0]
      : undefined;
    const existingMeta = {
      observedAt: existingEntry?.observedAt || existing.lastObservedAt,
      observationId: existingEntry?.observationId || existing.observationId
    };
    const incomingMeta = {
      observedAt: incoming.observedAt || now,
      observationId: incoming.observationId
    };

    const res = mergeSingleField(fieldExisting, fieldIncoming, existingMeta, incomingMeta, isTemporal);

    // Record evidence entry
    const entries = [...(updatedFieldEvidence[fieldName] || [])];
    if (fieldIncoming.parsedValue !== undefined || fieldIncoming.rawValue) {
      entries.push({
        value: fieldIncoming.parsedValue ?? fieldIncoming.rawValue,
        availability: fieldIncoming.availability,
        confidence: fieldIncoming.confidence,
        observedAt: incomingMeta.observedAt,
        searchUnitId: incoming.searchUnitId,
        observationId: incoming.observationId
      });
      // Sort evidence deterministically: newest first
      entries.sort((a, b) => compareTemporalObservations(b, a));
      updatedFieldEvidence[fieldName] = entries.slice(0, MAX_BOUNDED_FIELD_EVIDENCE);
    }

    if (res.hasConflict && res.conflictReason) {
      const existingConflictIdx = newConflicts.findIndex(c => c.fieldName === fieldName);
      const conflictValues = [
        {
          value: fieldExisting.parsedValue ?? fieldExisting.rawValue,
          availability: fieldExisting.availability,
          observedAt: existingMeta.observedAt,
          searchUnitId: existing.searchUnitId,
          observationId: existingMeta.observationId
        },
        {
          value: fieldIncoming.parsedValue ?? fieldIncoming.rawValue,
          availability: fieldIncoming.availability,
          observedAt: incomingMeta.observedAt,
          searchUnitId: incoming.searchUnitId,
          observationId: incomingMeta.observationId
        }
      ].sort((a, b) => String(a.value).localeCompare(String(b.value)));

      const conflictObj: FieldConflict = {
        fieldName,
        values: conflictValues,
        selectedValue: res.merged.parsedValue ?? res.merged.rawValue,
        resolutionReason: res.conflictReason
      };

      if (existingConflictIdx >= 0) {
        newConflicts[existingConflictIdx] = conflictObj;
      } else {
        newConflicts.push(conflictObj);
      }
      newConflicts.sort((a, b) => a.fieldName.localeCompare(b.fieldName));
    }

    return res.merged;
  }

  const mergedName = mergeAndRecord('businessName', existing.businessName, incoming.businessName);
  const mergedCategory = mergeAndRecord('category', existing.category, incoming.category);
  const mergedAddress = mergeAndRecord('address', existing.address, incoming.address);
  const mergedPhone = mergeAndRecord('phone', existing.phone, incoming.phone);
  const mergedWebsite = mergeAndRecord('websiteUrl', existing.websiteUrl, incoming.websiteUrl);

  // Temporal fields: rating, reviewCount, businessStatus
  const mergedRating = mergeAndRecord('rating', existing.rating, incoming.rating, true);
  const mergedReviews = mergeAndRecord('reviewCount', existing.reviewCount, incoming.reviewCount, true);
  const mergedStatus = mergeAndRecord('businessStatus', existing.businessStatus, incoming.businessStatus, true);

  const mergedPlaceId = mergeAndRecord('placeId', existing.placeId, incoming.placeId);
  const mergedMapsUrl = mergeAndRecord('mapsUrl', existing.mapsUrl, incoming.mapsUrl);

  const fieldAvailability: Record<string, FieldAvailability> = {
    businessName: mergedName.availability,
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

  const boundedConflicts = newConflicts.slice(0, MAX_BOUNDED_CONFLICTS);

  // Recalculate quality metrics
  const quality = assessCandidateQuality({
    businessName: mergedName,
    category: mergedCategory,
    address: mergedAddress,
    phone: mergedPhone,
    websiteUrl: mergedWebsite,
    rating: mergedRating,
    reviewCount: mergedReviews,
    businessStatus: mergedStatus,
    mapsUrl: mergedMapsUrl,
    identityConfidenceTier: decision.confidenceTier === 'CONFLICT' ? 'CONFLICT' : existing.qualityMetrics.identityConfidence,
    identityConfidenceScore: Math.max(existing.identityConfidence, decision.confidence),
    observationCount: newObsCount,
    fieldConflicts: boundedConflicts
  });

  const incomingTime = new Date(now).getTime();
  const existingFirstTime = new Date(existing.firstObservedAt).getTime();
  const existingLastTime = new Date(existing.lastObservedAt).getTime();
  const computedFirstObservedAt = incomingTime < existingFirstTime ? now : existing.firstObservedAt;
  const computedLastObservedAt = incomingTime > existingLastTime ? now : existing.lastObservedAt;

  const isTruncated = Boolean(
    existing.evidenceTruncated ||
    newObsCount > MAX_BOUNDED_OBSERVATIONS ||
    updatedSearchUnits.length >= MAX_BOUNDED_SEARCH_UNITS
  );

  return {
    ...existing,
    firstObservedAt: computedFirstObservedAt,
    lastObservedAt: computedLastObservedAt,
    observationCount: newObsCount,
    evidenceTruncated: isTruncated,
    businessName: mergedName,
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
    observationReferences: updatedObsRefs,
    observedSearchUnits: updatedSearchUnits,
    fieldConflicts: boundedConflicts,
    fieldEvidence: updatedFieldEvidence,
    qualityMetrics: quality,
    observedAt: computedLastObservedAt
  };
}
