/**
 * LeadNoria — Export-Safe Lead Projection & Research Workspace
 * Part 8: Pure Export-Safe Lead Projection Function
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * - Pure function: creates a BRAND NEW ExportSafeLead instance.
 * - STRICT ALLOWLIST: Zero object spreading ({ ...candidate } is strictly FORBIDDEN).
 * - Zero Google Maps fields: no Place ID, no Maps URL, no rating, no review count,
 *   no Google address, no Google phone, no Google status.
 * - Enforces that exportable facts originate SOLELY from independent public sources.
 */

import type {
  ExportSafeLead,
  IndependentSourceAnchor,
  PublicContactEvidence,
  PublicPersonEvidence,
  PublicWebsiteEvidence
} from './leadTypes.ts';
import { generateLeadId, generateDeterministicLeadId } from './leadIdentity.ts';
import { evaluateLeadEligibility } from './leadEligibility.ts';

export interface LeadProjectionParams {
  readonly leadId?: string;
  readonly independentSource: IndependentSourceAnchor;
  readonly independentEvidence: {
    readonly domain: string;
    readonly canonicalUrl: string;
    readonly businessName?: string;
    readonly pageTitle?: string;
    readonly metaDescription?: string;
    readonly technologies?: readonly string[];
    readonly services?: readonly string[];
    readonly contact?: {
      readonly emails?: readonly { email: string; classification?: string; sourceUrl?: string; observedAt?: string }[];
      readonly phones?: readonly { phone: string; rawPhone?: string; sourceUrl?: string; observedAt?: string }[];
      readonly socialProfiles?: readonly { platform: string; url: string }[];
    };
    readonly person?: {
      readonly people?: readonly { fullName: string; jobTitle: string; email?: string; sourceUrl?: string; observedAt?: string }[];
    };
  };
  readonly correlationCandidateId?: string;
  readonly reviewOutcome?: {
    readonly reviewState: 'QUALIFIED' | 'REVIEWING' | 'NEEDS_REVIEW' | 'UNREVIEWED' | 'DISQUALIFIED';
    readonly reviewerNotes?: string;
    readonly reviewedAt?: string;
  };
  readonly qualification?: {
    readonly status: 'QUALIFIED' | 'NEEDS_REVIEW' | 'DISQUALIFIED';
    readonly overallReadiness: number;
    readonly passedRules: readonly string[];
  };
  readonly userMetadata?: {
    readonly notes?: string;
    readonly tags?: readonly string[];
    readonly priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    readonly manualStatus?: string;
  };
}

/**
 * Pure projection function that transforms verified independent evidence into an ExportSafeLead.
 * STRICT ALLOWLIST ENFORCED.
 */
export function toExportSafeLead(params: LeadProjectionParams): ExportSafeLead {
  const { independentSource, independentEvidence } = params;

  if (!independentSource || independentSource.isRestricted !== false) {
    throw new Error('toExportSafeLead requires a verified, non-restricted IndependentSourceAnchor');
  }

  // 1. Identity allowlist (MUST come from independent source/evidence)
  const resolvedDomain = independentSource.domain || independentEvidence.domain;
  const resolvedCanonicalUrl = independentSource.targetUrl || independentEvidence.canonicalUrl;
  const resolvedBusinessName =
    independentSource.businessName ||
    independentEvidence.businessName ||
    independentEvidence.pageTitle ||
    resolvedDomain;

  const identity = Object.freeze({
    businessName: String(resolvedBusinessName).trim(),
    domain: String(resolvedDomain).trim().toLowerCase(),
    canonicalUrl: String(resolvedCanonicalUrl).trim()
  });

  // 2. Website evidence allowlist
  const website: PublicWebsiteEvidence = Object.freeze({
    domain: identity.domain,
    canonicalUrl: identity.canonicalUrl,
    pageTitle: independentEvidence.pageTitle ? String(independentEvidence.pageTitle).trim() : undefined,
    metaDescription: independentEvidence.metaDescription ? String(independentEvidence.metaDescription).trim() : undefined,
    technologies: independentEvidence.technologies ? Object.freeze([...independentEvidence.technologies]) : undefined,
    services: independentEvidence.services ? Object.freeze([...independentEvidence.services]) : undefined
  });

  // 3. Contact evidence allowlist (public website only)
  const publicEmails = (independentEvidence.contact?.emails || []).map(e => ({
    email: String(e.email).trim().toLowerCase(),
    classification: String(e.classification || 'BUSINESS'),
    sourceUrl: String(e.sourceUrl || identity.canonicalUrl),
    observedAt: String(e.observedAt || new Date().toISOString())
  }));

  const publicPhones = (independentEvidence.contact?.phones || []).map(p => ({
    phone: String(p.phone).trim(),
    rawPhone: String(p.rawPhone || p.phone).trim(),
    sourceUrl: String(p.sourceUrl || identity.canonicalUrl),
    observedAt: String(p.observedAt || new Date().toISOString())
  }));

  const socialProfiles = (independentEvidence.contact?.socialProfiles || []).map(s => ({
    platform: String(s.platform).toUpperCase(),
    url: String(s.url).trim()
  }));

  const contact: PublicContactEvidence = Object.freeze({
    publicEmails: Object.freeze(publicEmails),
    publicPhones: Object.freeze(publicPhones),
    socialProfiles: Object.freeze(socialProfiles)
  });

  // 4. Person evidence allowlist (public website only)
  const leadershipPeople = (independentEvidence.person?.people || []).map(p => ({
    fullName: String(p.fullName).trim(),
    jobTitle: String(p.jobTitle).trim(),
    email: p.email ? String(p.email).trim().toLowerCase() : undefined,
    sourceUrl: String(p.sourceUrl || identity.canonicalUrl),
    observedAt: String(p.observedAt || new Date().toISOString())
  }));

  const person: PublicPersonEvidence = Object.freeze({
    leadershipPeople: Object.freeze(leadershipPeople)
  });

  // 5. Qualification snapshot
  const qualification = Object.freeze({
    status: params.qualification?.status || 'QUALIFIED',
    overallReadiness: params.qualification?.overallReadiness ?? 1.0,
    passedRules: Object.freeze([...(params.qualification?.passedRules || ['Independent Public Source Verified'])])
  });

  // 6. Review outcome
  const reviewOutcome = Object.freeze({
    reviewState: params.reviewOutcome?.reviewState || 'QUALIFIED',
    reviewerNotes: params.reviewOutcome?.reviewerNotes ? String(params.reviewOutcome.reviewerNotes) : undefined,
    reviewedAt: params.reviewOutcome?.reviewedAt || new Date().toISOString()
  });

  // 7. Correlation link (Metadata pointer only)
  const correlation = params.correlationCandidateId
    ? Object.freeze({
        candidateId: params.correlationCandidateId,
        correlationStatus: 'CONFIRMED_BY_INDEPENDENT_SOURCE' as const
      })
    : undefined;

  // 8. Evidence references (strictly public HTTP URLs)
  const evidenceReferences = Object.freeze([
    { fieldName: 'domain', sourceUrl: identity.canonicalUrl, observedAt: independentSource.verifiedAt },
    { fieldName: 'businessName', sourceUrl: identity.canonicalUrl, observedAt: independentSource.verifiedAt },
    ...publicEmails.map(e => ({ fieldName: 'email', sourceUrl: e.sourceUrl, observedAt: e.observedAt })),
    ...publicPhones.map(p => ({ fieldName: 'phone', sourceUrl: p.sourceUrl, observedAt: p.observedAt }))
  ]);

  // 9. Run Eligibility Check
  const eligibility = evaluateLeadEligibility({
    independentSource,
    independentEvidence: {
      domain: identity.domain,
      businessName: identity.businessName,
      hasPublicContact: publicEmails.length > 0 || publicPhones.length > 0,
      hasLeadershipPerson: leadershipPeople.length > 0
    },
    reviewState: reviewOutcome.reviewState,
    qualificationStatus: qualification.status
  });

  // 10. User metadata allowlist
  const userMetadata = Object.freeze({
    notes: params.userMetadata?.notes ? String(params.userMetadata.notes) : undefined,
    tags: params.userMetadata?.tags ? Object.freeze([...params.userMetadata.tags]) : undefined,
    priority: params.userMetadata?.priority || 'MEDIUM',
    manualStatus: params.userMetadata?.manualStatus ? String(params.userMetadata.manualStatus) : undefined
  });

  const now = new Date().toISOString();

  // 11. Construct NEW, immutable ExportSafeLead
  const leadId = params.leadId || generateDeterministicLeadId(identity.domain, independentSource.sourceId);
  const lead: ExportSafeLead = Object.freeze({
    leadId,
    sourceClass: independentSource.sourceClass,
    independentSourceId: independentSource.sourceId,
    identity,
    website,
    contact,
    person,
    qualification,
    reviewOutcome,
    correlation,
    evidenceReferences,
    exportEligibility: eligibility.isExportEligible ? 'ELIGIBLE' : 'BLOCKED',
    eligibilityReasons: eligibility.reasonCodes,
    userMetadata,
    createdAt: now,
    updatedAt: now
  });

  // 12. Run strict runtime boundary verification on the projected lead
  verifyZeroGoogleFieldsInLead(lead);

  return lead;
}

/**
 * Runtime defensive validation asserting ZERO Google Maps fields or markers
 * exist anywhere on the projected lead object.
 */
export function verifyZeroGoogleFieldsInLead(lead: any): void {
  const forbiddenKeys = [
    'placeId',
    'mapsUrl',
    'rating',
    'reviewCount',
    'businessStatus',
    'isRestricted',
    'searchUnitId',
    'searchKeyword',
    'searchLocation',
    'observationCount',
    'identityMethod'
  ];

  for (const key of forbiddenKeys) {
    if (key in lead) {
      throw new Error(`CRITICAL FIREWALL VIOLATION: Forbidden Google field "${key}" detected in ExportSafeLead`);
    }
  }

  // Deep inspect identity, website, contact, person
  const serialized = JSON.stringify(lead);
  if (
    serialized.includes('GOOGLE_MAPS_BROWSER') ||
    serialized.includes('ChIJ') ||
    serialized.includes('maps.google.com')
  ) {
    throw new Error('CRITICAL FIREWALL VIOLATION: Restricted Google markers detected in serialized ExportSafeLead');
  }
}
