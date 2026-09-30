/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Deterministic View Model Mappers
 * 
 * Strict Invariants:
 * - Pure functions, zero mutation of input objects
 * - Preserves state distinctions:
 *     SKIPPED != NOT_QUALIFIED
 *     BLOCKED != NOT_FOUND
 *     CONTRACT_ONLY != COMPLETED
 *     UNKNOWN != FAIL
 *     PARTIAL != COMPLETE
 *     NOT_FOUND != UNKNOWN
 * - Field-level restriction preservation: Google consumer-web provenance remains NOT_EXPORTABLE and NOT_PERSISTABLE
 */

import {
  UnifiedResearchRecord,
  CandidateEnvelope,
  SourceType,
  PipelineStageId
} from '../pipeline/pipelineTypes.ts';
import { MultiSourceRun } from '../pipeline/multiSourceRun.ts';
import {
  ResultRowViewModel,
  ResultDetailViewModel,
  RunStatusViewModel,
  ExportPreviewViewModel,
  EvidenceItemViewModel,
  StageStatusViewModel
} from './types.ts';
import { sanitizePassiveText } from './security.ts';

/**
 * Maps a UnifiedResearchRecord or CandidateEnvelope into a compact ResultRowViewModel.
 */
export function toResultRowViewModel(record: UnifiedResearchRecord | CandidateEnvelope): ResultRowViewModel {
  const isUnified = 'entityId' in record && 'corroborationCount' in record;
  const u = record as UnifiedResearchRecord;
  const c = record as CandidateEnvelope;

  const recordId = isUnified ? u.recordId : c.candidateId;
  const entityId = isUnified ? u.entityId : c.candidateId;

  // Extract display name
  let displayName = 'Unknown Entity';
  if (isUnified) {
    displayName = u.canonicalDisplayName || u.normalizedEntity?.businessName?.value?.displayName || (u.normalizedEntity as any)?.name || displayName;
  } else if (!isUnified && c.normalizedCandidate) {
    displayName = c.normalizedCandidate.businessName?.value?.displayName || (c.normalizedCandidate as any)?.name || displayName;
  }

  // Extract source & provenance
  const primarySource: SourceType = isUnified ? u.primarySource : c.sourceKey.sourceType;
  const provenance = record.provenance || 'UNKNOWN';
  const isMixedProvenance = provenance === 'MIXED';

  // Relevance decision
  let relevanceDecision: 'RELEVANT' | 'UNCERTAIN' | 'NOT_RELEVANT' = 'UNCERTAIN';
  if (isUnified && u.relevanceResult) {
    relevanceDecision = u.relevanceResult.relevanceState;
  }

  // Website state
  let websiteState = 'NOT_OBSERVED';
  let websiteUrl: string | undefined;
  if (isUnified && u.websiteVerificationResult) {
    websiteState = u.websiteVerificationResult.status || 'WEBSITE_UNCERTAIN';
    websiteUrl = u.websiteVerificationResult.finalUrl || u.websiteVerificationResult.originalUrl;
  } else if (!isUnified && c.normalizedCandidate?.websiteUrl) {
    const wVal = c.normalizedCandidate.websiteUrl as any;
    websiteState = 'WEBSITE_PRESENT_UNVERIFIED';
    websiteUrl = typeof wVal === 'string' ? wVal : wVal?.value?.rawUrl || wVal?.value?.canonicalUrl;
  }

  // Contact summary
  const contactSummary = {
    hasPhone: false,
    hasEmail: false,
    hasAddress: false,
    hasContactForm: false,
    hasSocialLinks: false,
    phoneText: undefined as string | undefined,
    emailText: undefined as string | undefined
  };

  if (isUnified && u.contactEnrichmentResult) {
    const ce = u.contactEnrichmentResult;
    contactSummary.hasPhone = Array.isArray(ce.phones) && ce.phones.length > 0;
    contactSummary.hasEmail = Array.isArray(ce.emails) && ce.emails.length > 0;
    contactSummary.hasAddress = Array.isArray(ce.addresses) && ce.addresses.length > 0;
    contactSummary.hasContactForm = Array.isArray(ce.contactForms) && ce.contactForms.length > 0;
    contactSummary.hasSocialLinks = Array.isArray(ce.socialProfiles) && ce.socialProfiles.length > 0;

    if (contactSummary.hasPhone) {
      const p = ce.phones[0];
      contactSummary.phoneText = p.e164Format || p.normalizedValue || p.rawValue;
    }
    if (contactSummary.hasEmail) {
      const e = ce.emails[0];
      contactSummary.emailText = e.normalizedEmail || e.rawValue;
    }
  }

  // Qualification status
  let qualificationState: 'QUALIFIED' | 'NOT_QUALIFIED' | 'UNCERTAIN' | 'BLOCKED' | 'NOT_STARTED' = 'NOT_STARTED';
  let qualificationScore: number | undefined;

  if (isUnified) {
    if (u.qualificationState) {
      qualificationState = u.qualificationState;
    } else if (u.qualificationDecision) {
      qualificationState = u.qualificationDecision.status;
    }
    if (u.qualificationDecision?.scoreSummary) {
      qualificationScore = u.qualificationDecision.scoreSummary.totalScore;
    }
  }

  // Geographic context
  let geographicContext: string | undefined;
  if (isUnified && u.geographicObservations && u.geographicObservations.length > 0) {
    const geo = u.geographicObservations[0];
    geographicContext = geo.canonicalName || geo.name || geo.areaId || [geo.countryCode, geo.level].filter(Boolean).join(', ');
  }

  // Restrictions
  const isRestricted = Boolean(record.restrictions?.isRestricted);
  const isExportable = Boolean(record.restrictions?.exportEligible);
  const isPersistable = Boolean(record.restrictions?.persistenceEligible);
  const restrictionBadgeText = isRestricted ? (record.restrictions?.restrictionBasis || 'RESTRICTED_SOURCE') : undefined;

  return {
    recordId,
    entityId,
    displayName: sanitizePassiveText(displayName, 120),
    primarySource,
    provenance,
    isMixedProvenance,
    relevanceDecision,
    websiteState,
    websiteUrl,
    contactSummary,
    qualificationState,
    qualificationScore,
    geographicContext,
    isRestricted,
    isExportable,
    isPersistable,
    restrictionBadgeText,
    corroborationCount: isUnified ? u.corroborationCount : 1
  };
}

/**
 * Maps a UnifiedResearchRecord into a full ResultDetailViewModel.
 */
export function toResultDetailViewModel(record: UnifiedResearchRecord): ResultDetailViewModel {
  const row = toResultRowViewModel(record);

  // Identity
  const aliases: string[] = [];
  const contradictionFlags: string[] = [];
  let identityConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNRESOLVED' = 'HIGH';

  // Provenance classification
  let provenanceClassification: 'DIRECT_SOURCE' | 'DERIVED' | 'MIXED' = 'DERIVED';
  if (record.provenance === 'MIXED') {
    provenanceClassification = 'MIXED';
  } else if (record.provenance === 'USER_PROVIDED') {
    provenanceClassification = 'DIRECT_SOURCE';
  }

  // Relevance
  const relevanceExplanation = record.relevanceResult?.explanation || 'Relevance evaluation not executed or not applicable';
  const relevanceMatchedTerms: string[] = (record.relevanceResult?.reasonCodes || []).map(String);
  const relevanceConfidence = 'HIGH';

  // Website verification
  const websiteVerificationStatus = record.websiteVerificationResult?.status || 'NOT_VERIFIED';
  const websiteIdentityMatchLevel = record.websiteVerificationResult?.identityMatch || 'UNKNOWN';
  const websiteVerifiedAt = record.websiteVerificationResult?.verifiedAt;

  // Contact facts
  const phones: Array<{ number: string; type: string; observation: string }> = [];
  const emails: Array<{ address: string; classification: string; observation: string }> = [];
  const addresses: Array<{ addressLine: string; locality?: string; postalCode?: string; isBranch: boolean }> = [];
  const socialLinks: Array<{ platform: string; url: string }> = [];

  if (record.contactEnrichmentResult) {
    const ce = record.contactEnrichmentResult;
    for (const p of ce.phones || []) {
      phones.push({
        number: p.e164Format || p.normalizedValue || p.rawValue,
        type: p.phoneType || 'GENERAL',
        observation: 'Observed on public website'
      });
    }
    for (const e of ce.emails || []) {
      emails.push({
        address: e.normalizedEmail || e.rawValue,
        classification: e.emailType || 'GENERIC_BUSINESS',
        observation: 'Observed on public website'
      });
    }
    for (const a of ce.addresses || []) {
      addresses.push({
        addressLine: a.streetAddress || a.normalizedAddress || a.rawAddress,
        locality: a.city,
        postalCode: a.postalCode,
        isBranch: Boolean(a.label && a.label.toLowerCase().includes('branch'))
      });
    }
    for (const s of ce.socialProfiles || []) {
      socialLinks.push({ platform: s.platform, url: s.normalizedUrl || s.rawUrl });
    }
  }

  // Qualification
  const q = record.qualificationDecision;
  const mandatoryCriteria = (q?.criterionResults || [])
    .filter(c => c.mandatory)
    .map(c => ({
      criterionId: c.criterionId,
      name: c.criterionId,
      isMandatory: true,
      status: c.outcome,
      scoreAwarded: c.scoreContribution,
      explanation: c.explanation || '',
      reasonCode: c.reasonCode || '',
      referencedEvidence: (c.evidence || []).map((e: any) => e.signature || e.reason || String(e))
    }));

  const optionalCriteria = (q?.criterionResults || [])
    .filter(c => !c.mandatory)
    .map(c => ({
      criterionId: c.criterionId,
      name: c.criterionId,
      isMandatory: false,
      status: c.outcome,
      scoreAwarded: c.scoreContribution,
      explanation: c.explanation || '',
      reasonCode: c.reasonCode || '',
      referencedEvidence: (c.evidence || []).map((e: any) => e.signature || e.reason || String(e))
    }));

  // Evidence Ledger items
  const evidenceItems: EvidenceItemViewModel[] = (record.evidence || []).map((ev: any, idx: number) => ({
    id: `ev_${idx + 1}`,
    fact: ev.explanation || ev.reason || ev.value || 'Observed public fact',
    sourceFamily: ev.source || 'PUBLIC_WEB',
    evidenceType: ev.type || 'OBSERVATION',
    pageOrSourceReference: ev.matchedSignal || ev.page || 'Public source signal',
    observationState: 'OBSERVED',
    provenance: ev.provenance || record.provenance,
    isRestricted: Boolean(ev.isRestricted),
    restrictionNotice: ev.restrictionNotice
  }));

  // Field Eligibility
  const fieldEligibility: Record<string, { isEligible: boolean; notice?: string }> = {};
  if (record.fieldEligibility) {
    for (const [k, v] of Object.entries(record.fieldEligibility)) {
      fieldEligibility[k] = {
        isEligible: v.isEligible,
        notice: v.restrictionBasis
      };
    }
  }

  return {
    ...row,
    aliases,
    identityConfidence,
    contradictionFlags,
    primarySource: record.primarySource,
    contributingSources: record.corroborationSources || [record.primarySource],
    provenanceLineage: record.provenance,
    provenanceClassification,
    relevanceDecision: row.relevanceDecision,
    relevanceConfidence,
    relevanceExplanation,
    relevanceMatchedTerms,
    websiteUrl: row.websiteUrl,
    websiteVerificationStatus,
    websiteIdentityMatchLevel,
    websiteVerifiedAt,
    phones,
    emails,
    addresses,
    hasContactForm: row.contactSummary.hasContactForm,
    socialLinks,
    qualificationState: row.qualificationState,
    qualificationProfileName: q?.profileId || 'Default Business Profile',
    qualificationProfileVersion: q?.profileVersion || '1.0.0',
    qualificationScoreText: q?.scoreSummary?.totalScore != null ? `${q.scoreSummary.totalScore} points` : undefined,
    mandatoryCriteria,
    optionalCriteria,
    qualificationSummaryExplanation: q?.failureReasons?.join(', ') || 'Qualification evaluated by configured profile',
    evidenceItems,
    fieldEligibility,
    restrictionExplanation: record.restrictions?.restrictionBasis,
    runId: (record as any).runMetadata?.runId || 'run_unknown',
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

/**
 * Maps a MultiSourceRun instance to a RunStatusViewModel.
 */
export function toRunStatusViewModel(run: MultiSourceRun, elapsedMs = 0): RunStatusViewModel {
  const cfg = run.config;
  const canonicalStages: PipelineStageId[] = [
    'SOURCE_PLANNING',
    'SOURCE_EXECUTION',
    'NORMALIZATION',
    'ENTITY_RESOLUTION',
    'EVIDENCE',
    'RELEVANCE',
    'WEBSITE_VERIFICATION',
    'CONTACT_ENRICHMENT',
    'QUALIFICATION',
    'GEOGRAPHIC_ACCOUNTING',
    'PERSISTENCE',
    'EXPORT'
  ];

  const stageViewModels: StageStatusViewModel[] = canonicalStages.map(stageId => {
    const rawState = (run.stageStates instanceof Map ? run.stageStates.get(stageId) : (run.stageStates as any)?.[stageId]) || 'NOT_STARTED';
    const isCompleted = rawState === 'COMPLETED';
    const isActive = rawState === 'IN_PROGRESS';
    const isBlocked = rawState === 'BLOCKED';
    const isSkipped = rawState === 'SKIPPED';
    const isFailed = rawState === 'FAILED';

    let stateText = 'Not Started';
    if (isCompleted) stateText = 'Completed';
    else if (isActive) stateText = 'In Progress';
    else if (isBlocked) stateText = 'Blocked';
    else if (isSkipped) stateText = 'Skipped';
    else if (isFailed) stateText = 'Failed';

    return {
      stageId,
      label: stageId.replace(/_/g, ' '),
      state: rawState,
      stateText,
      isCompleted,
      isActive,
      isBlocked,
      isSkipped,
      isFailed
    };
  });

  const activeSource = cfg?.selectedSources?.[0] || 'META';
  const sourceStatus = (run.sourceStatuses instanceof Map ? run.sourceStatuses.get(activeSource) : (run as any).sourceStatuses?.[activeSource] || (run as any).sourceStates?.[activeSource]) || 'UNKNOWN';

  const isRunning = run.status === 'RUNNING';
  const isPausable = isRunning;
  const isResumable = run.status === 'PARTIAL' || run.status === 'PLANNED';
  const isStoppable = isRunning || run.status === 'PARTIAL';

  return {
    runId: cfg?.runId || (run as any).runId || 'run_unknown',
    runVersion: cfg?.runVersion || (run as any).runVersion || '1.0.0',
    globalStatus: run.status,
    globalStatusText: run.status.replace(/_/g, ' '),
    activeSource,
    sourceStatus,
    stages: stageViewModels,
    candidatesProcessed: 0,
    hasWarnings: run.status === 'COMPLETED_WITH_WARNINGS',
    warningMessages: run.status === 'COMPLETED_WITH_WARNINGS' 
      ? ['Run completed with warnings: some sources or stages completed in CONTRACT_ONLY or SKIPPED status'] 
      : [],
    isPausable,
    isResumable,
    isStoppable,
    checkpointId: (run as any).checkpoint?.checkpointId,
    checkpointTimestamp: (run as any).checkpoint?.createdAt,
    elapsedMs,
    canRetry: run.status === 'FAILED' || run.status === 'PARTIAL'
  };
}

/**
 * Creates an ExportPreviewViewModel before running export.
 */
export function toExportPreviewViewModel(records: UnifiedResearchRecord[]): ExportPreviewViewModel {
  const totalSelectedRecords = records.length;
  let exportableRecordsCount = 0;
  let restrictedRecordsCount = 0;

  for (const r of records) {
    if (r.restrictions?.exportEligible) {
      exportableRecordsCount++;
    } else {
      restrictedRecordsCount++;
    }
  }

  const eligibleFields = [
    'displayName',
    'primarySource',
    'provenance',
    'websiteUrl',
    'businessEmail',
    'businessPhone',
    'qualificationState'
  ];

  const restrictedFieldsOmitted = [
    'Google consumer-web place identifiers',
    'Google consumer-web raw search entries'
  ];

  const policyNotice = restrictedRecordsCount > 0
    ? `${restrictedRecordsCount} record(s) contain restricted consumer-web provenance and are excluded by the policy firewall.`
    : 'All selected records satisfy public source export policy.';

  return {
    totalSelectedRecords,
    exportableRecordsCount,
    restrictedRecordsCount,
    blockedDueToComplianceCount: restrictedRecordsCount,
    eligibleFields,
    restrictedFieldsOmitted,
    policyNotice,
    isExportReady: exportableRecordsCount > 0
  };
}
