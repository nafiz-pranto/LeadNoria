/**
 * LeadNoria Contact & Digital Presence Enrichment Contracts (Phase 11)
 *
 * Defines source-neutral data contracts for public business contact and digital-presence
 * facts extracted strictly from public business websites within bounded crawls.
 */

import type {
  ProvenanceType,
  SourceContribution,
  PolicyRestrictionBasis,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus
} from '../extraction/types.ts';

// ==========================================
// 1. Overall & Field-Level Statuses
// ==========================================

export type ContactEnrichmentStatus =
  | 'CONTACT_FOUND'
  | 'CONTACT_NOT_FOUND'
  | 'CONTACT_UNCERTAIN'
  | 'CONTACT_PARTIAL'
  | 'CONTACT_BLOCKED'
  | 'CONTACT_UNAVAILABLE'
  | 'CONTACT_UNKNOWN';

export type ContactFieldStatus =
  | 'FOUND'
  | 'NOT_FOUND'
  | 'UNKNOWN'
  | 'INVALID'
  | 'AMBIGUOUS';

export type LocationFieldStatus =
  | 'FOUND'
  | 'PARTIAL'
  | 'AMBIGUOUS'
  | 'NOT_FOUND'
  | 'UNKNOWN';

// ==========================================
// 2. Evidence Taxonomy & Strength
// ==========================================

export type ContactEvidenceType =
  | 'VISIBLE_TEXT'
  | 'MAILTO_LINK'
  | 'TEL_LINK'
  | 'ANCHOR_LINK'
  | 'CONTACT_FORM'
  | 'HEADER'
  | 'FOOTER'
  | 'PAGE_TITLE'
  | 'STRUCTURED_PAGE_CONTENT';

export type ContactEvidenceStrength =
  | 'DIRECT_PUBLIC_OBSERVATION'
  | 'CORROBORATED_PUBLIC_OBSERVATION'
  | 'WEAK_OBSERVATION'
  | 'CONTRADICTORY_OBSERVATION';

export interface ContactEvidenceItem {
  id: string;
  field: 'phone' | 'email' | 'address' | 'social' | 'contact_form' | 'business_name';
  rawValue: string;
  normalizedValue: string;
  pageUrl: string;
  evidenceType: ContactEvidenceType;
  evidenceStrength: ContactEvidenceStrength;
  contextSnippet?: string;
  extractionState: string;
  observedAt: string;
}

// ==========================================
// 3. Contact Facts: Phone
// ==========================================

export interface BusinessPhoneFact {
  rawValue: string;
  normalizedValue: string;
  e164Format?: string;
  nationalFormat?: string;
  countryCode?: string;
  dialCode?: string;
  extension?: string;
  label?: string; // e.g. "Main", "Support", "Branch: Downtown"
  phoneType: 'MAIN' | 'BRANCH' | 'SUPPORT' | 'SALES' | 'FAX' | 'GENERAL';
  status: ContactFieldStatus;
  evidence: ContactEvidenceItem[];
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
}

// ==========================================
// 4. Contact Facts: Email
// ==========================================

export type BusinessEmailType =
  | 'GENERIC_BUSINESS'      // info@, sales@, contact@, support@, hello@, team@, etc.
  | 'DIRECT_ROLE'          // ceo@, founder@, director@, manager@, etc.
  | 'APPARENT_PERSONAL'    // john.smith@company.com (observed, without individual claim)
  | 'UNKNOWN';

export interface BusinessEmailFact {
  rawValue: string;
  normalizedEmail: string;
  localPart: string;
  domainPart: string;
  emailType: BusinessEmailType;
  status: ContactFieldStatus;
  evidence: ContactEvidenceItem[];
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
}

// ==========================================
// 5. Contact Facts: Address & NAP
// ==========================================

export interface BusinessLocationFact {
  id: string;
  label?: string; // e.g. "Headquarters", "Branch 2", "London Office"
  rawAddress: string;
  normalizedAddress: string;
  streetAddress?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  isHeadquarters?: boolean;
  status: LocationFieldStatus;
  evidence: ContactEvidenceItem[];
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
}

// ==========================================
// 6. Contact Facts: Social / Digital Presence
// ==========================================

export type SocialPlatform =
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'LINKEDIN'
  | 'YOUTUBE'
  | 'TIKTOK'
  | 'TWITTER_X'
  | 'GITHUB'
  | 'PINTEREST'
  | 'OTHER';

export interface DigitalPresenceFact {
  platform: SocialPlatform;
  rawUrl: string;
  normalizedUrl: string;
  domain: string;
  handleOrPath?: string;
  pageObserved: string;
  status: ContactFieldStatus;
  evidence: ContactEvidenceItem[];
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
}

// ==========================================
// 7. Contact Facts: Contact Form
// ==========================================

export interface ContactFormFact {
  id: string;
  present: boolean;
  pageUrl: string;
  formAction?: string;
  formMethod?: string;
  formIdOrName?: string;
  hasEmailField: boolean;
  hasPhoneField: boolean;
  hasMessageField: boolean;
  evidence: ContactEvidenceItem[];
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
}

// ==========================================
// 8. Contact Facts: Business Name
// ==========================================

export interface BusinessNameFact {
  rawValue: string;
  normalizedName: string;
  comparisonKey: string;
  status: ContactFieldStatus;
  evidence: ContactEvidenceItem[];
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
}

// ==========================================
// 9. Objective Completeness Metrics
// ==========================================

export interface ContactCompleteness {
  hasPhone: boolean;
  hasEmail: boolean;
  hasAddress: boolean;
  hasSocialProfile: boolean;
  hasContactForm: boolean;
  numberOfBusinessPhones: number;
  numberOfBusinessEmails: number;
  numberOfLocations: number;
  numberOfSocialProfiles: number;
}

// ==========================================
// 10. Master Enrichment Result
// ==========================================

export interface ContactEnrichmentResult {
  entityId: string;
  targetDomain: string;
  status: ContactEnrichmentStatus;
  businessName?: BusinessNameFact;
  phones: BusinessPhoneFact[];
  emails: BusinessEmailFact[];
  addresses: BusinessLocationFact[];
  socialProfiles: DigitalPresenceFact[];
  contactForms: ContactFormFact[];
  allEvidence: ContactEvidenceItem[];
  completeness: ContactCompleteness;
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  derivedFrom: string[];
  sourceRestrictions: {
    isRestricted: boolean;
    restrictionBasis: PolicyRestrictionBasis;
    policyStatus: PolicyStatus;
    persistenceEligibility: PersistenceStatus;
    exportEligibility: ExportStatus;
  };
  crawlMetadata: {
    domain: string;
    startUrl: string;
    pagesVisited: string[];
    pagesAttempted: number;
    durationMs: number;
    enrichedAt: string;
    fromCache: boolean;
  };
  diagnostics: {
    errors: string[];
    warnings: string[];
    notices: string[];
  };
}
