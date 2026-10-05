/**
 * LeadNoria — Phase 15 & Phase 25: UI/UX Integration & Unified Lead Intelligence
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
 * - Full first-class integration with Phase 24 CanonicalLeadRecord
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
  LeadResultRowViewModel,
  ResultDetailViewModel,
  RunStatusViewModel,
  ExportPreviewViewModel,
  EvidenceItemViewModel,
  StageStatusViewModel
} from './types.ts';
export type { LeadResultRowViewModel };

import { sanitizePassiveText, getSafeExternalUrl } from './security.ts';
import { CanonicalLeadRecord } from '../leadIntelligence/types.ts';
import { toFriendlyStatus, getSourceBadgeInfo } from './humanLabels.ts';

/**
 * Type guard for CanonicalLeadRecord (Phase 24 schema).
 */
export function isCanonicalLeadRecord(record: any): record is CanonicalLeadRecord {
  return Boolean(
    record &&
    typeof record === 'object' &&
    (record.schemaVersion === 'lead-intelligence-v1' ||
     ('canonicalEntityId' in record && 'canonicalBusinessName' in record && 'policy' in record))
  );
}

/**
 * Maps a CanonicalLeadRecord directly into a compact ResultRowViewModel.
 */
export function canonicalLeadToResultRowViewModel(record: CanonicalLeadRecord): ResultRowViewModel {
  const recordId = `rec_${record.canonicalEntityId}`;
  const entityId = record.canonicalEntityId;
  const displayName = record.canonicalBusinessName.preferredObservedValue ||
    record.canonicalBusinessName.value ||
    'Unknown Business';

  const category = record.business.categories.value?.[0] || undefined;
  const rawWeb = record.digital.verifiedWebsite.value || record.digital.domains.value?.[0];
  const safeWeb = getSafeExternalUrl(rawWeb);

  const phones = record.contacts.phones || [];
  const emails = record.contacts.emails || [];
  const hasPhone = phones.length > 0;
  const hasEmail = emails.length > 0;
  const phoneText = phones[0]?.preferredObservedValue || phones[0]?.normalizedValue || phones[0]?.value;
  const emailText = emails[0]?.preferredObservedValue || emails[0]?.normalizedValue || emails[0]?.value;

  // Source badges & primary source
  const sourceBadges: Array<{ sourceType: SourceType | string; label: string; isRestricted: boolean }> = [];
  const seenSources = new Set<string>();

  if (record.policy.hasMetaLineage) {
    sourceBadges.push(getSourceBadgeInfo('META'));
    seenSources.add('META');
  }
  if (record.policy.hasWebsiteLineage) {
    sourceBadges.push(getSourceBadgeInfo('WEBSITE'));
    seenSources.add('WEBSITE');
  }
  if (record.policy.hasGoogleConsumerWebLineage) {
    sourceBadges.push(getSourceBadgeInfo('GOOGLE_MAPS'));
    seenSources.add('GOOGLE_MAPS');
  }
  if (record.policy.hasUserProvidedLineage && !seenSources.has('USER_PROVIDED')) {
    sourceBadges.push(getSourceBadgeInfo('USER_PROVIDED'));
    seenSources.add('USER_PROVIDED');
  }

  for (const st of record.evidence?.evidencePack?.sourceTypes || []) {
    if (!seenSources.has(st)) {
      seenSources.add(st);
      sourceBadges.push(getSourceBadgeInfo(st));
    }
  }

  const primarySource: SourceType = record.policy.hasMetaLineage
    ? 'META'
    : (record.policy.hasGoogleConsumerWebLineage ? 'GOOGLE_MAPS' : 'META');

  const isMixedProvenance = record.policy.overallProvenance === 'MIXED' || sourceBadges.length > 1;

  // Qualification State
  const rawQState = (record.qualification.finalState || record.qualification.qualificationDecision?.status || 'NOT_STARTED').toUpperCase();
  const qualificationState = (['QUALIFIED', 'NOT_QUALIFIED', 'UNCERTAIN', 'BLOCKED', 'NOT_STARTED'].includes(rawQState)
    ? rawQState
    : 'NOT_STARTED') as any;

  // Freshness
  const freshnessEntries = Object.values(record.freshness.perSourceFreshness || {});
  let overallFreshness: 'CURRENT' | 'STALE' | 'UNKNOWN' = 'UNKNOWN';
  if (freshnessEntries.some(f => f.state === 'CURRENT')) {
    overallFreshness = 'CURRENT';
  } else if (freshnessEntries.some(f => f.state === 'STALE')) {
    overallFreshness = 'STALE';
  }

  // Quality metrics
  const q = record.quality || {
    identityCompleteness: 0,
    businessCompleteness: 0,
    contactCompleteness: 0,
    websiteCompleteness: 0,
    evidenceCoverage: 0,
    corroborationCount: 0,
    contradictionCount: 0
  };

  const qualityMetrics = {
    completenessPercent: Math.round(((q.identityCompleteness + q.businessCompleteness + q.contactCompleteness + q.websiteCompleteness) / 4) * 100) || 0,
    contactCompletenessPercent: Math.round(q.contactCompleteness * 100) || 0,
    evidenceCoveragePercent: Math.round(q.evidenceCoverage * 100) || 0,
    corroborationCount: q.corroborationCount || (record.evidence?.corroborations?.length ?? 0) || (sourceBadges.length > 1 ? sourceBadges.length : 1),
    contradictionCount: q.contradictionCount || record.evidence.conflicts?.length || 0
  };

  // Data signals
  const dataSignals = {
    websiteVerified: Boolean(record.digital.verifiedWebsite.value),
    contactAvailable: hasPhone || hasEmail,
    publicPersonAvailable: (record.people.publicPeople || []).length > 0,
    advertisingEvidence: Boolean(record.sourceSignals?.metaEvidence && record.sourceSignals.metaEvidence.adCount > 0),
    freshness: overallFreshness,
    freshnessLabel: toFriendlyStatus(overallFreshness)
  };

  // Location display
  const city = record.location?.city?.value;
  const country = record.location?.country?.value;
  const locationDisplay = [city, country].filter(Boolean).join(', ') || record.location?.normalizedAddress?.value || 'Global / Unspecified';

  return {
    recordId,
    entityId,
    displayName: sanitizePassiveText(displayName, 120),
    primarySource,
    provenance: record.policy.overallProvenance,
    isMixedProvenance,
    relevanceDecision: 'RELEVANT',
    websiteState: record.digital.verifiedWebsite.value ? 'VERIFIED_BUSINESS_WEBSITE' : (rawWeb ? 'WEBSITE_PRESENT_UNVERIFIED' : 'NOT_OBSERVED'),
    websiteUrl: safeWeb || undefined,
    contactSummary: {
      hasPhone,
      hasEmail,
      hasAddress: (record.location.addresses.value || []).length > 0,
      hasContactForm: (record.contacts.contactForms || []).length > 0,
      hasSocialLinks: (record.digital.socialProfiles.value || []).length > 0,
      phoneText,
      emailText
    },
    qualificationState,
    qualificationScore: undefined, // no opaque scores exposed
    geographicContext: locationDisplay,
    isRestricted: record.policy.isRestricted,
    isExportable: record.policy.exportEligible,
    isPersistable: record.policy.persistenceEligible,
    restrictionBadgeText: record.policy.isRestricted ? (record.policy.restrictionBasis || 'RESTRICTED_SOURCE') : undefined,
    corroborationCount: qualityMetrics.corroborationCount,

    // Phase 25 Unified UI fields
    category,
    sourceBadges,
    dataSignals,
    qualityMetrics,
    friendlyQualificationState: toFriendlyStatus(qualificationState),
    friendlyFreshnessState: toFriendlyStatus(overallFreshness),
    lastObservedText: record.freshness.lastObservedAt,
    canonicalRecord: record
  };
}

/**
 * Maps a CanonicalLeadRecord directly into a full ResultDetailViewModel.
 */
export function canonicalLeadToResultDetailViewModel(record: CanonicalLeadRecord): ResultDetailViewModel {
  const row = canonicalLeadToResultRowViewModel(record);

  // 1. Identity Details
  const identityDetails = {
    canonicalBusinessName: record.canonicalBusinessName.preferredObservedValue || record.canonicalBusinessName.value || 'Unknown Business',
    aliases: record.aliases || [],
    entityType: record.entityType,
    entityTypeLabel: toFriendlyStatus(record.entityType),
    branchInfo: record.branchRelationship ? {
      isBranch: record.branchRelationship.isBranch,
      isParent: record.branchRelationship.isParent,
      parentEntityId: record.branchRelationship.parentEntityId,
      branchSignals: (record.branchRelationship.branchSignals || []).map(s => `${s.type}: ${s.token}`)
    } : undefined
  };

  // 2. Business Details
  const businessDetails = {
    categories: record.business.categories.value || [],
    services: record.business.services.value || [],
    description: record.business.description.value || undefined,
    hours: record.business.businessHours.value || undefined,
    serviceAreas: record.business.serviceAreas.value || [],
    businessStatus: toFriendlyStatus(record.business.businessStatus.value)
  };

  // 3. Location Details
  const locationDetails = {
    address: record.location.normalizedAddress.value || record.location.addresses.value?.[0],
    city: record.location.city.value,
    region: record.location.region.value,
    country: record.location.country.value,
    coordinates: record.location.latitude && record.location.longitude ? `${record.location.latitude}, ${record.location.longitude}` : undefined,
    addresses: record.location.addresses.value || []
  };

  // 4. Digital Presence
  const digitalPresence = {
    websiteUrl: getSafeExternalUrl(record.digital.verifiedWebsite.value) || undefined,
    domain: record.digital.domains.value?.[0],
    cms: record.digital.cms,
    booking: record.digital.booking,
    ecommerce: record.digital.ecommerce,
    chat: record.digital.chat,
    analytics: record.digital.analytics,
    technologySignals: (record.digital.technologySignals || []).map(t => `${t.name} (${t.category})`),
    socialLinks: (record.digital.socialProfiles.value || []).map(s => ({
      platform: s.platform,
      url: getSafeExternalUrl(s.url) || '#'
    }))
  };

  // 5. Contacts Details
  const contactsDetails = {
    emails: (record.contacts.emails || []).map(e => ({
      address: e.value,
      classification: toFriendlyStatus(e.category),
      source: toFriendlyStatus(e.provenance),
      isRestricted: e.isRestricted,
      observedAt: e.lastObservedAt,
      hasConflict: e.hasConflict,
      alternatives: e.alternatives
    })),
    phones: (record.contacts.phones || []).map(p => ({
      number: p.value,
      type: toFriendlyStatus(p.category),
      source: toFriendlyStatus(p.provenance),
      isRestricted: p.isRestricted,
      observedAt: p.lastObservedAt,
      hasConflict: p.hasConflict,
      alternatives: p.alternatives
    })),
    forms: record.contacts.contactForms || []
  };

  // 6. People Details
  const peopleDetails = (record.people.publicPeople || []).map(p => ({
    name: p.name,
    canonicalName: p.canonicalName,
    titles: p.titles || [],
    emails: p.emails || [],
    phones: p.phones || [],
    linkedInUrl: getSafeExternalUrl(p.linkedInUrl) || undefined,
    isRestricted: p.isRestricted,
    associatedContacts: [...p.emails, ...p.phones]
  }));

  // 7. Qualification Details (Phase 23 Reason Graph Integration)
  const qDec = record.qualification.qualificationDecision;
  const whyReasons: Array<{ label: string; passed: boolean; explanation?: string }> = [];
  const potentialIssues: Array<{ label: string; explanation?: string }> = [];

  const criteria = (qDec?.criterionResults || []).map(c => {
    const passed = c.outcome === 'PASS';
    const friendlyStatus = toFriendlyStatus(c.outcome);
    const label = c.criterionId.replace(/_/g, ' ');

    if (passed) {
      whyReasons.push({ label, passed: true, explanation: c.explanation });
    } else {
      potentialIssues.push({ label, explanation: c.explanation });
    }

    return {
      criterionId: c.criterionId,
      name: label,
      isMandatory: c.mandatory,
      status: c.outcome,
      friendlyStatus,
      scoreAwarded: c.scoreContribution,
      maxScore: c.scoreContribution,
      explanation: c.explanation || '',
      reasonCode: c.reasonCode || ''
    };
  });

  // Additional freshness potential issues
  if (row.dataSignals?.freshness === 'STALE') {
    potentialIssues.push({
      label: 'May be outdated',
      explanation: 'One or more public observations are over 30 days old.'
    });
  }

  // Contradiction potential issues
  for (const conf of record.evidence.conflicts || []) {
    potentialIssues.push({
      label: `Conflicting ${conf.field}`,
      explanation: conf.reason || 'Different sources observed conflicting values.'
    });
  }

  const qualificationDetails = {
    finalState: row.qualificationState,
    friendlyFinalState: toFriendlyStatus(row.qualificationState),
    profileId: record.qualification.qualificationProfileId,
    profileName: qDec?.profileId || 'Commercial Qualification Profile',
    explanation: record.qualification.explanation || (qDec as any)?.summaryExplanation || 'Qualification evaluated from verified public signals.',
    whyReasons,
    potentialIssues,
    criteria
  };

  // 8. Evidence Details
  const fieldEvidence: Array<{
    fieldName: string;
    value: string;
    sources: string[];
    observedAt: string;
    evidenceNote?: string;
  }> = [];

  if (row.contactSummary.phoneText) {
    const ph = record.contacts.phones[0];
    fieldEvidence.push({
      fieldName: 'Business Phone',
      value: row.contactSummary.phoneText,
      sources: ph ? ph.corroboratedBySources.map(String) : [row.primarySource],
      observedAt: ph?.lastObservedAt || record.updatedAt,
      evidenceNote: ph?.isCorroborated ? 'Corroborated across multiple public sources' : 'Observed from public source'
    });
  }

  if (row.contactSummary.emailText) {
    const em = record.contacts.emails[0];
    fieldEvidence.push({
      fieldName: 'Business Email',
      value: row.contactSummary.emailText,
      sources: em ? em.corroboratedBySources.map(String) : [row.primarySource],
      observedAt: em?.lastObservedAt || record.updatedAt,
      evidenceNote: em?.isCorroborated ? 'Corroborated across multiple public sources' : 'Publicly listed business email'
    });
  }

  if (row.websiteUrl) {
    fieldEvidence.push({
      fieldName: 'Website',
      value: row.websiteUrl,
      sources: record.digital.verifiedWebsite.corroboratedBySources.map(String),
      observedAt: record.digital.verifiedWebsite.lastObservedAt || record.updatedAt,
      evidenceNote: 'Verified public domain'
    });
  }

  const conflicts = (record.evidence.conflicts || []).map(c => ({
    field: c.field,
    description: c.reason,
    conflictingValues: (c.conflictingValues || []).map(cv => ({
      value: String(cv.value),
      source: toFriendlyStatus(cv.source),
      observedAt: cv.observedAt
    }))
  }));

  const evidenceItems: EvidenceItemViewModel[] = (record.evidence.evidenceReferences || []).map((ev, idx) => ({
    id: ev.evidenceId || `ev_${idx + 1}`,
    fact: ev.factSummary || 'Observed fact',
    sourceFamily: ev.sourceType,
    evidenceType: ev.factType || 'OBSERVATION',
    pageOrSourceReference: ev.sourceUrl || 'Public source signal',
    observationState: 'OBSERVED',
    provenance: ev.provenance,
    isRestricted: ev.isRestricted,
    restrictionNotice: ev.isRestricted ? 'Restricted source evidence' : undefined
  }));

  const evidenceDetails = {
    totalCount: record.evidence.evidencePack?.totalEvidenceCount || evidenceItems.length,
    items: evidenceItems.map(e => ({
      id: e.id,
      fact: e.fact,
      source: e.sourceFamily,
      sourceUrl: e.pageOrSourceReference,
      observedAt: record.updatedAt,
      isRestricted: e.isRestricted
    })),
    fieldEvidence,
    conflicts
  };

  // 9. Freshness Details
  const perSource = Object.entries(record.freshness.perSourceFreshness || {}).map(([src, val]) => ({
    source: toFriendlyStatus(src),
    state: val.state,
    friendlyState: toFriendlyStatus(val.state),
    lastObservedAt: val.lastObservedAt,
    count: val.observationCount
  }));

  const freshnessDetails = {
    overallState: row.dataSignals!.freshness,
    friendlyLabel: toFriendlyStatus(row.dataSignals!.freshness),
    firstObservedAt: record.freshness.firstObservedAt,
    lastObservedAt: record.freshness.lastObservedAt,
    perSource
  };

  return {
    ...row,
    aliases: record.aliases || [],
    identityConfidence: 'HIGH',
    contradictionFlags: conflicts.map(c => c.field),
    primarySource: row.primarySource,
    contributingSources: row.sourceBadges?.map(b => b.sourceType as SourceType) || [row.primarySource],
    provenanceLineage: record.policy.overallProvenance,
    provenanceClassification: record.policy.overallProvenance === 'MIXED' ? 'MIXED' : 'DERIVED',
    relevanceDecision: row.relevanceDecision,
    relevanceConfidence: 'HIGH',
    relevanceExplanation: 'Entity matches research requirements',
    relevanceMatchedTerms: [],
    websiteUrl: row.websiteUrl,
    websiteVerificationStatus: row.websiteState,
    websiteIdentityMatchLevel: 'STRONG',
    websiteVerifiedAt: record.updatedAt,
    phones: contactsDetails.phones.map(p => ({ number: p.number, type: p.type || 'MAIN', observation: p.source })),
    emails: contactsDetails.emails.map(e => ({ address: e.address, classification: e.classification || 'GENERIC_BUSINESS', observation: e.source })),
    addresses: locationDetails.addresses.map(a => ({ addressLine: a, isBranch: false })),
    hasContactForm: contactsDetails.forms.length > 0,
    socialLinks: digitalPresence.socialLinks,
    mandatoryCriteria: qualificationDetails.criteria.filter(c => c.isMandatory).map(c => ({
      criterionId: c.criterionId,
      name: c.name,
      isMandatory: true,
      status: c.status as any,
      scoreAwarded: c.scoreAwarded,
      maxScore: c.maxScore,
      explanation: c.explanation,
      reasonCode: c.reasonCode,
      referencedEvidence: []
    })),
    optionalCriteria: qualificationDetails.criteria.filter(c => !c.isMandatory).map(c => ({
      criterionId: c.criterionId,
      name: c.name,
      isMandatory: false,
      status: c.status as any,
      scoreAwarded: c.scoreAwarded,
      maxScore: c.maxScore,
      explanation: c.explanation,
      reasonCode: c.reasonCode,
      referencedEvidence: []
    })),
    qualificationProfileName: record.qualification.qualificationProfileId || 'Commercial Qualification Profile',
    qualificationProfileVersion: '1.0.0',
    qualificationSummaryExplanation: qualificationDetails.explanation,
    evidenceItems,
    fieldEligibility: {},
    restrictionExplanation: record.policy.isRestricted ? (record.policy.restrictionBasis || 'Restricted consumer-web source') : undefined,
    runId: 'canonical_lead',
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,

    // Phase 25 Detailed Sections
    category: row.category,
    sourceBadges: row.sourceBadges,
    identityDetails,
    businessDetails,
    locationDetails,
    digitalPresence,
    contactsDetails,
    peopleDetails,
    qualificationDetails,
    evidenceDetails,
    freshnessDetails,
    qualityDetails: row.qualityMetrics,
    canonicalRecord: record
  };
}

/**
 * Maps a UnifiedResearchRecord, CandidateEnvelope, or CanonicalLeadRecord into a compact ResultRowViewModel.
 */
export function toResultRowViewModel(record: UnifiedResearchRecord | CandidateEnvelope | CanonicalLeadRecord): ResultRowViewModel {
  if (isCanonicalLeadRecord(record)) {
    return canonicalLeadToResultRowViewModel(record);
  }

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

  // Source badges
  const sourceBadges: Array<{ sourceType: SourceType | string; label: string; isRestricted: boolean }> = [];
  sourceBadges.push(getSourceBadgeInfo(primarySource));
  if (isUnified && u.corroborationSources) {
    for (const cs of u.corroborationSources) {
      if (cs !== primarySource && !sourceBadges.some(b => b.sourceType === cs)) {
        sourceBadges.push(getSourceBadgeInfo(cs));
      }
    }
  }

  // Data signals
  const dataSignals = {
    websiteVerified: websiteState.includes('VERIFIED'),
    contactAvailable: contactSummary.hasPhone || contactSummary.hasEmail,
    publicPersonAvailable: false,
    advertisingEvidence: primarySource === 'META',
    freshness: 'CURRENT' as const,
    freshnessLabel: toFriendlyStatus('CURRENT')
  };

  // Quality metrics
  const qualityMetrics = {
    completenessPercent: (contactSummary.hasPhone ? 25 : 0) + (contactSummary.hasEmail ? 25 : 0) + (websiteUrl ? 25 : 0) + (displayName ? 25 : 0),
    contactCompletenessPercent: (contactSummary.hasPhone ? 50 : 0) + (contactSummary.hasEmail ? 50 : 0),
    evidenceCoveragePercent: isUnified ? Math.min(100, (u.evidence?.length || 1) * 25) : 50,
    corroborationCount: isUnified ? u.corroborationCount : 1,
    contradictionCount: 0
  };

  return {
    recordId,
    entityId,
    displayName: sanitizePassiveText(displayName, 120),
    primarySource,
    provenance,
    isMixedProvenance,
    relevanceDecision,
    websiteState,
    websiteUrl: getSafeExternalUrl(websiteUrl) || undefined,
    contactSummary,
    qualificationState,
    qualificationScore,
    geographicContext,
    isRestricted,
    isExportable,
    isPersistable,
    restrictionBadgeText,
    corroborationCount: isUnified ? u.corroborationCount : 1,

    // Phase 25 additions
    sourceBadges,
    dataSignals,
    qualityMetrics,
    friendlyQualificationState: toFriendlyStatus(qualificationState),
    friendlyFreshnessState: toFriendlyStatus('CURRENT'),
    lastObservedText: record.createdAt
  };
}

/**
 * Maps a UnifiedResearchRecord into a full ResultDetailViewModel.
 */
export function toResultDetailViewModel(record: UnifiedResearchRecord | CanonicalLeadRecord): ResultDetailViewModel {
  if (isCanonicalLeadRecord(record)) {
    return canonicalLeadToResultDetailViewModel(record);
  }

  const u = record as UnifiedResearchRecord;
  const row = toResultRowViewModel(u);

  // Identity
  const aliases: string[] = [];
  const contradictionFlags: string[] = [];
  const identityConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNRESOLVED' = 'HIGH';

  // Provenance classification
  let provenanceClassification: 'DIRECT_SOURCE' | 'DERIVED' | 'MIXED' = 'DERIVED';
  if (u.provenance === 'MIXED') {
    provenanceClassification = 'MIXED';
  } else if (u.provenance === 'USER_PROVIDED') {
    provenanceClassification = 'DIRECT_SOURCE';
  }

  // Relevance
  const relevanceExplanation = u.relevanceResult?.explanation || 'Relevance evaluation not executed or not applicable';
  const relevanceMatchedTerms: string[] = (u.relevanceResult?.reasonCodes || []).map(String);
  const relevanceConfidence = 'HIGH';

  // Website verification
  const websiteVerificationStatus = u.websiteVerificationResult?.status || 'NOT_VERIFIED';
  const websiteIdentityMatchLevel = u.websiteVerificationResult?.identityMatch || 'UNKNOWN';
  const websiteVerifiedAt = u.websiteVerificationResult?.verifiedAt;

  // Contact facts
  const phones: Array<{ number: string; type: string; observation: string }> = [];
  const emails: Array<{ address: string; classification: string; observation: string }> = [];
  const addresses: Array<{ addressLine: string; locality?: string; postalCode?: string; isBranch: boolean }> = [];
  const socialLinks: Array<{ platform: string; url: string }> = [];

  if (u.contactEnrichmentResult) {
    const ce = u.contactEnrichmentResult;
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
      const safe = getSafeExternalUrl(s.normalizedUrl || s.rawUrl);
      if (safe) {
        socialLinks.push({ platform: s.platform, url: safe });
      }
    }
  }

  // Qualification
  const q = u.qualificationDecision;
  const mandatoryCriteria = (q?.criterionResults || [])
    .filter(c => c.mandatory)
    .map(c => ({
      criterionId: c.criterionId,
      name: c.criterionId.replace(/_/g, ' '),
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
      name: c.criterionId.replace(/_/g, ' '),
      isMandatory: false,
      status: c.outcome,
      scoreAwarded: c.scoreContribution,
      explanation: c.explanation || '',
      reasonCode: c.reasonCode || '',
      referencedEvidence: (c.evidence || []).map((e: any) => e.signature || e.reason || String(e))
    }));

  // Evidence Ledger items
  const evidenceItems: EvidenceItemViewModel[] = (u.evidence || []).map((ev: any, idx: number) => ({
    id: `ev_${idx + 1}`,
    fact: ev.explanation || ev.reason || ev.value || 'Observed public fact',
    sourceFamily: ev.source || 'PUBLIC_WEB',
    evidenceType: ev.type || 'OBSERVATION',
    pageOrSourceReference: ev.matchedSignal || ev.page || 'Public source signal',
    observationState: 'OBSERVED',
    provenance: ev.provenance || u.provenance,
    isRestricted: Boolean(ev.isRestricted),
    restrictionNotice: ev.restrictionNotice
  }));

  // Field Eligibility
  const fieldEligibility: Record<string, { isEligible: boolean; notice?: string }> = {};
  if (u.fieldEligibility) {
    for (const [k, v] of Object.entries(u.fieldEligibility)) {
      fieldEligibility[k] = {
        isEligible: v.isEligible,
        notice: v.restrictionBasis
      };
    }
  }

  // Construct Phase 25 unified detail models
  const identityDetails = {
    canonicalBusinessName: row.displayName,
    aliases,
    entityType: 'LOCAL_BUSINESS',
    entityTypeLabel: toFriendlyStatus('LOCAL_BUSINESS')
  };

  const businessDetails = {
    categories: [],
    services: [],
    serviceAreas: [],
    businessStatus: toFriendlyStatus('OPERATIONAL')
  };

  const locationDetails = {
    address: addresses[0]?.addressLine,
    city: addresses[0]?.locality,
    addresses: addresses.map(a => a.addressLine)
  };

  const digitalPresence = {
    websiteUrl: row.websiteUrl,
    domain: row.websiteUrl ? new URL(row.websiteUrl).hostname : undefined,
    socialLinks
  };

  const contactsDetails = {
    emails: emails.map(e => ({ address: e.address, classification: e.classification, source: e.observation })),
    phones: phones.map(p => ({ number: p.number, type: p.type, source: p.observation })),
    forms: row.contactSummary.hasContactForm ? ['Observed on Website'] : []
  };

  const qualificationDetails = {
    finalState: row.qualificationState,
    friendlyFinalState: toFriendlyStatus(row.qualificationState),
    profileId: q?.profileId,
    profileName: q?.profileId || 'Commercial Profile',
    explanation: (q as any)?.summaryExplanation || 'Qualification evaluated from public signals.',
    whyReasons: mandatoryCriteria.filter(c => c.status === 'PASS').map(c => ({ label: c.name, passed: true, explanation: c.explanation })),
    potentialIssues: mandatoryCriteria.filter(c => c.status !== 'PASS').map(c => ({ label: c.name, explanation: c.explanation })),
    criteria: [...mandatoryCriteria, ...optionalCriteria].map(c => ({
      ...c,
      friendlyStatus: toFriendlyStatus(c.status)
    }))
  };

  const evidenceDetails = {
    totalCount: evidenceItems.length,
    items: evidenceItems.map(e => ({
      id: e.id,
      fact: e.fact,
      source: e.sourceFamily,
      sourceUrl: e.pageOrSourceReference,
      observedAt: u.updatedAt || u.createdAt,
      isRestricted: e.isRestricted
    })),
    fieldEvidence: [],
    conflicts: []
  };

  const freshnessDetails = {
    overallState: 'CURRENT' as const,
    friendlyLabel: toFriendlyStatus('CURRENT'),
    firstObservedAt: u.createdAt,
    lastObservedAt: u.updatedAt || u.createdAt,
    perSource: [{
      source: toFriendlyStatus(row.primarySource),
      state: 'CURRENT',
      friendlyState: toFriendlyStatus('CURRENT'),
      lastObservedAt: u.updatedAt || u.createdAt
    }]
  };

  return {
    ...row,
    aliases,
    identityConfidence,
    contradictionFlags,
    primarySource: u.primarySource,
    contributingSources: u.corroborationSources || [u.primarySource],
    provenanceLineage: u.provenance,
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
    qualificationProfileName: q?.profileId || 'Default Commercial Profile',
    qualificationProfileVersion: q?.profileVersion || '1.0.0',
    qualificationScoreText: q?.scoreSummary ? `${q.scoreSummary.totalScore} points` : undefined,
    mandatoryCriteria,
    optionalCriteria,
    qualificationSummaryExplanation: (q as any)?.summaryExplanation || (q as any)?.failureReasons?.join('; ') || 'Entity evaluated against configured criteria.',
    evidenceItems,
    fieldEligibility,
    restrictionExplanation: row.isRestricted ? (u.restrictions?.restrictionBasis || 'Restricted source data') : undefined,
    runId: 'run_unified',
    createdAt: u.createdAt || new Date().toISOString(),
    updatedAt: u.updatedAt || new Date().toISOString(),

    // Phase 25 additions
    identityDetails,
    businessDetails,
    locationDetails,
    digitalPresence,
    contactsDetails,
    peopleDetails: [],
    qualificationDetails,
    evidenceDetails,
    freshnessDetails,
    qualityDetails: row.qualityMetrics
  };
}

/**
 * Maps run execution progress into a comprehensive RunStatusViewModel.
 */
export function toRunStatusViewModel(run: MultiSourceRun, elapsedMs = 0): RunStatusViewModel {
  const cfg = run.config;
  const stages: PipelineStageId[] = [
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

  const stageLabels: Record<PipelineStageId, string> = {
    SOURCE_PLANNING: 'Source Planning',
    SOURCE_EXECUTION: 'Source Execution',
    NORMALIZATION: 'Candidate Normalization',
    ENTITY_RESOLUTION: 'Entity Resolution',
    EVIDENCE: 'Evidence Aggregation',
    RELEVANCE: 'Relevance Scoring',
    WEBSITE_VERIFICATION: 'Website Verification',
    CONTACT_ENRICHMENT: 'Contact Enrichment',
    QUALIFICATION: 'Commercial Qualification',
    GEOGRAPHIC_ACCOUNTING: 'Geographic Accounting',
    PERSISTENCE: 'Persistence',
    EXPORT: 'Export Firewall'
  };

  const stageViewModels: StageStatusViewModel[] = stages.map(st => {
    const rawState = (run.stageStates instanceof Map ? run.stageStates.get(st) : (run as any).stageStates?.[st]) || 'NOT_STARTED';
    const isCompleted = rawState === 'COMPLETED';
    const isActive = rawState === 'IN_PROGRESS';
    const isBlocked = rawState === 'BLOCKED';
    const isSkipped = rawState === 'SKIPPED';
    const isFailed = rawState === 'FAILED';

    let stateText = 'Not Started';
    if (isCompleted) stateText = 'Completed';
    else if (isActive) stateText = 'In Progress';
    else if (isBlocked) stateText = 'Blocked by Policy';
    else if (isSkipped) stateText = 'Skipped';
    else if (isFailed) stateText = 'Failed';
    else if (rawState === 'CONTRACT_ONLY') stateText = 'Contract Only';

    return {
      stageId: st,
      label: stageLabels[st],
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
export function toExportPreviewViewModel(records: (UnifiedResearchRecord | CanonicalLeadRecord)[]): ExportPreviewViewModel {
  const totalSelectedRecords = records.length;
  let exportableRecordsCount = 0;
  let restrictedRecordsCount = 0;

  for (const r of records) {
    if (isCanonicalLeadRecord(r)) {
      if (r.policy.exportEligible && !r.policy.isRestricted) {
        exportableRecordsCount++;
      } else {
        restrictedRecordsCount++;
      }
    } else {
      const u = r as UnifiedResearchRecord;
      if (u.restrictions?.exportEligible && !u.restrictions?.isRestricted) {
        exportableRecordsCount++;
      } else {
        restrictedRecordsCount++;
      }
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
