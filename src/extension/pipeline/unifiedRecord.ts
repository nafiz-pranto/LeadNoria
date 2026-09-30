/**
 * LeadNoria — Phase 14: Unified Multi-Source Architecture
 * Unified Research Record & Multi-Source Merge
 * 
 * Non-Negotiable Invariants:
 * - True MIXED provenance only when derived from multiple source families
 * - Preserves field-level and source-level restrictions during merge
 * - Multi-source corroboration without duplicate evidence inflation
 * - Entity resolution authority remains Phase 8
 */

import { ProvenanceType, SourceContribution } from '../extraction/types.ts';
import {
  SourceType,
  CandidateEnvelope,
  UnifiedResearchRecord,
  CandidateRestrictions,
  FieldEligibility,
  SourceRecordKey
} from './pipelineTypes.ts';

export function createUnifiedRecordFromEnvelope(envelope: CandidateEnvelope, entityId?: string): UnifiedResearchRecord {
  const resolvedEntityId = entityId || envelope.candidateId;
  const displayName = envelope.normalizedCandidate?.businessName?.value?.displayName || envelope.candidateId;
  const now = new Date().toISOString();

  return {
    recordId: `rec_${envelope.candidateId}`,
    entityId: resolvedEntityId,
    canonicalDisplayName: displayName,
    sourceRecords: [envelope.sourceKey],
    primarySource: envelope.sourceKey.sourceType,
    normalizedEntity: envelope.normalizedCandidate,
    sourceContributions: [...envelope.sourceContributions],
    provenance: envelope.provenance,
    restrictions: { ...envelope.restrictions },
    fieldEligibility: { ...envelope.fieldEligibility },
    corroborationSources: [envelope.sourceKey.sourceType],
    corroborationCount: 1,
    stageStates: { ...envelope.stageStates },
    evidence: [...envelope.evidence],
    relevanceResult: envelope.relevanceResult,
    websiteVerificationResult: envelope.websiteVerificationResult,
    contactEnrichmentResult: envelope.contactEnrichmentResult,
    qualificationDecision: envelope.qualificationDecision,
    qualificationState: envelope.qualificationDecision?.status,
    geographicObservations: [...envelope.geographicObservations],
    diagnostics: {
      warnings: [...envelope.diagnostics.warnings],
      errors: [...envelope.diagnostics.errors],
      notes: [...envelope.diagnostics.notes]
    },
    createdAt: envelope.createdAt || now,
    updatedAt: now
  };
}

/**
 * Merges two UnifiedResearchRecords representing the same resolved entity.
 * Invariant 47: Genuine MIXED provenance only when derived from multiple source families.
 * Invariant 48: Restrictions propagate at field-level; website fields do not inherit Google restrictions.
 */
export function mergeUnifiedRecords(a: UnifiedResearchRecord, b: UnifiedResearchRecord): UnifiedResearchRecord {
  const now = new Date().toISOString();

  // Combine source records uniquely
  const sourceRecords: SourceRecordKey[] = [...a.sourceRecords];
  for (const src of b.sourceRecords) {
    if (!sourceRecords.some(s => s.sourceType === src.sourceType && s.sourceRecordId === src.sourceRecordId)) {
      sourceRecords.push(src);
    }
  }

  // Combine source contributions uniquely
  const sourceContributions: SourceContribution[] = [...a.sourceContributions];
  for (const c of b.sourceContributions) {
    if (!sourceContributions.some(sc => sc.source === c.source && sc.fieldName === c.fieldName)) {
      sourceContributions.push(c);
    }
  }

  // Determine provenance: MIXED if multiple distinct source types are involved
  const distinctSources = new Set(sourceRecords.map(s => s.sourceType));
  const distinctProvenances = new Set(sourceContributions.map(c => c.provenance));
  let provenance: ProvenanceType = a.provenance;
  if (distinctProvenances.size > 1 || distinctSources.size > 1) {
    provenance = 'MIXED';
  }

  // Combine field eligibility (field-level precision)
  const fieldEligibility: Record<string, FieldEligibility> = { ...a.fieldEligibility };
  for (const [field, elig] of Object.entries(b.fieldEligibility)) {
    if (!fieldEligibility[field]) {
      fieldEligibility[field] = elig;
    } else {
      // If either source has an unrestricted observation, preserve field eligibility
      if (elig.isEligible && !fieldEligibility[field].isEligible) {
        fieldEligibility[field] = elig;
      }
    }
  }

  // Overall candidate restrictions: restricted if any contribution is restricted
  const isRestricted = a.restrictions.isRestricted || b.restrictions.isRestricted;
  const persistenceEligible = a.restrictions.persistenceEligible && b.restrictions.persistenceEligible;
  const exportEligible = a.restrictions.exportEligible && b.restrictions.exportEligible;

  // Corroboration sources
  const corroborationSources = Array.from(distinctSources);

  // Combine evidence uniquely
  const evidence = [...a.evidence];
  for (const ev of b.evidence) {
    const id = ev.evidenceId || ev.id;
    if (!evidence.some(e => (e.evidenceId || e.id) === id)) {
      evidence.push(ev);
    }
  }

  return {
    recordId: a.recordId,
    entityId: a.entityId,
    canonicalDisplayName: a.canonicalDisplayName || b.canonicalDisplayName,
    sourceRecords,
    primarySource: a.primarySource,
    normalizedEntity: a.normalizedEntity || b.normalizedEntity,
    sourceContributions,
    provenance,
    restrictions: {
      isRestricted,
      persistenceEligible,
      exportEligible,
      displayEligible: a.restrictions.displayEligible || b.restrictions.displayEligible,
      qualificationEligible: a.restrictions.qualificationEligible && b.restrictions.qualificationEligible
    },
    fieldEligibility,
    corroborationSources,
    corroborationCount: corroborationSources.length,
    stageStates: { ...a.stageStates, ...b.stageStates },
    evidence,
    relevanceResult: a.relevanceResult || b.relevanceResult,
    websiteVerificationResult: a.websiteVerificationResult || b.websiteVerificationResult,
    contactEnrichmentResult: a.contactEnrichmentResult || b.contactEnrichmentResult,
    qualificationDecision: a.qualificationDecision || b.qualificationDecision,
    qualificationState: a.qualificationState || b.qualificationState,
    geographicObservations: [...a.geographicObservations, ...b.geographicObservations],
    diagnostics: {
      warnings: [...a.diagnostics.warnings, ...b.diagnostics.warnings],
      errors: [...a.diagnostics.errors, ...b.diagnostics.errors],
      notes: [...a.diagnostics.notes, ...b.diagnostics.notes]
    },
    createdAt: a.createdAt,
    updatedAt: now
  };
}
