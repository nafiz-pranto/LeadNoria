/**
 * LeadNoria Contact & Person Intelligence Contracts (Phase 22)
 *
 * Defines source-neutral, confidence-aware contracts for canonical contacts,
 * public person intelligence, evidence-backed contact-person associations,
 * role intelligence, completeness metrics, and compact contact graphs.
 */

import type {
  ProvenanceType,
  SourceContribution,
  SourceType,
  PolicyRestrictionBasis,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus
} from '../extraction/types.ts';

import type {
  ContactEvidenceType,
  ContactEvidenceStrength,
  SocialPlatform,
  BusinessPhoneFact,
  BusinessEmailFact,
  BusinessLocationFact,
  DigitalPresenceFact,
  ContactFormFact
} from '../enrichment/contactTypes.ts';

import type {
  WebsiteIntelligenceResult,
  PublicPerson,
  ConflictType
} from '../websiteIntelligence/types.ts';

// ==========================================
// 1. Contact Classification & Evidence
// ==========================================

export type CanonicalContactType =
  | 'EMAIL'
  | 'PHONE'
  | 'CONTACT_FORM'
  | 'WEBSITE'
  | 'SOCIAL_PROFILE';

export type ContactEvidenceClassification =
  | 'PUBLICLY_LISTED'
  | 'MAILTO'
  | 'TEL_LINK'
  | 'STRUCTURED_DATA'
  | 'PERSON_ASSOCIATED'
  | 'MULTI_PAGE_CORROBORATED'
  | 'DOMAIN_MATCHED'
  | 'INVALID'
  | 'CONFLICTING'
  | 'UNVERIFIED'
  | 'UNKNOWN';

export type ContactConfidenceState =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'UNVERIFIED'
  | 'INVALID';

export type EmailClassification =
  | 'GENERIC_BUSINESS'
  | 'ROLE_ACCOUNT'
  | 'PERSON_NAMED'
  | 'UNKNOWN';

export type EmailDomainRelationship =
  | 'EXACT_DOMAIN_MATCH'
  | 'SUBDOMAIN_MATCH'
  | 'EXTERNAL_DOMAIN'
  | 'UNKNOWN';

export type AssociationStrength =
  | 'EXPLICIT_ASSOCIATION'
  | 'POTENTIAL_ASSOCIATION';

export type SocialProfileAssociationType =
  | 'BUSINESS_PROFILE'
  | 'PERSON_PROFILE'
  | 'UNKNOWN';

// ==========================================
// 2. Canonical Contact Model
// ==========================================

export interface CanonicalContact {
  contactId: string;
  contactType: CanonicalContactType;
  rawValue: string;
  normalizedValue: string;
  label?: string; // e.g. "Support", "Direct", "Branch: Downtown"
  sourceUrl: string;
  sourcePages: string[];
  evidenceType: ContactEvidenceClassification;
  confidenceState: ContactConfidenceState;
  emailClassification?: EmailClassification;
  emailDomainRelationship?: EmailDomainRelationship;
  socialPlatform?: SocialPlatform;
  socialAssociationType?: SocialProfileAssociationType;
  socialProfile?: { platform?: SocialPlatform; associationType?: SocialProfileAssociationType };
  associatedPersonIds: string[];
  associatedPersonId?: string;
  associationStrength?: AssociationStrength;
  associationConfidence?: AssociationStrength;
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  firstObservedAt: string;
  lastObservedAt: string;
  observationCount: number;
}

// ==========================================
// 3. Canonical Person Model
// ==========================================

export interface PersonEvidenceItem {
  sourceUrl: string;
  evidenceKind: string;
  snippet?: string;
  observedAt: string;
}

export interface CanonicalPerson {
  personId: string;
  fullName: string;
  normalizedName: string;
  jobTitle?: string;
  normalizedJobTitle?: string;
  roleCategory?: string; // Founder, Owner, CEO, Director, Manager, Specialist, etc.
  emailRefs: string[]; // contactIds of associated emails
  phoneRefs: string[]; // contactIds of associated phones
  socialRefs: string[]; // contactIds of associated social profiles
  sourcePages: string[];
  evidence: PersonEvidenceItem[];
  confidenceState: 'HIGH' | 'MEDIUM' | 'LOW';
  potentialDuplicatePersonIds?: string[]; // Preserves weak matches without merging
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  firstObservedAt: string;
  lastObservedAt: string;
  observationCount: number;
}

// ==========================================
// 4. Contact Priority & Completeness Metrics
// ==========================================

export type ContactPrioritySignal =
  | 'DIRECT_PUBLIC_CONTACT'
  | 'ROLE_CONTACT'
  | 'GENERIC_BUSINESS_CONTACT'
  | 'WEBSITE_FORM_ONLY'
  | 'SOCIAL_ONLY'
  | 'NO_PUBLIC_CONTACT'
  | 'CONFLICTING_CONTACT';

export interface ContactCompleteness {
  hasPublicEmail: boolean;
  hasPublicPhone: boolean;
  hasContactForm: boolean;
  hasSocialProfile: boolean;
  hasPublicPerson: boolean;
  hasPersonAssociatedEmail: boolean;
  hasPersonAssociatedPhone: boolean;
  contactCompletenessRatio: number; // 0.0 to 1.0
}

// ==========================================
// 5. Contact Source Graph
// ==========================================

export interface SourceGraphNode {
  id: string;
  type: 'WEBSITE' | 'PAGE' | 'CONTACT' | 'PERSON';
  label: string;
  url?: string;
}

export interface SourceGraphEdge {
  fromId: string;
  toId: string;
  relationship: 'HOSTS_PAGE' | 'EXPOSES_CONTACT' | 'EXPOSES_PERSON' | 'ASSOCIATED_WITH';
}

export interface ContactSourceGraph {
  nodes: SourceGraphNode[];
  edges: SourceGraphEdge[];
}

// ==========================================
// 6. Conflicts & Changes
// ==========================================

export interface ContactConflictValue {
  value: string;
  sourceUrl: string;
  observedAt: string;
}

export interface ContactConflictRecord {
  conflictType: 'PHONE_CONFLICT' | 'EMAIL_CONFLICT' | 'TITLE_CONFLICT' | 'ADDRESS_CONFLICT';
  values: ContactConflictValue[];
  corroborationCount: number;
}

export interface ContactChangeEvent {
  type: 'ADDED' | 'REMOVED' | 'MODIFIED';
  target: 'EMAIL' | 'PHONE' | 'PERSON' | 'TITLE' | 'SOCIAL';
  changeType?: string;
  previousValue?: string;
  currentValue?: string;
  observedAt: string;
}

// ==========================================
// 7. Engine Input & Result Contracts
// ==========================================

export interface ContactIntelligenceInput {
  targetUrl?: string;
  websiteResult?: WebsiteIntelligenceResult;
  rawHtmlPages?: Array<{ url: string; html: string }>;
  previousSnapshot?: ContactIntelligenceResult;
  previousSession?: { canonicalContacts: CanonicalContact[]; canonicalPeople: CanonicalPerson[] };
  sourceContext?: SourceType | 'META' | 'GOOGLE' | 'GOOGLE_MAPS' | 'USER_PROVIDED';
  provenanceContext?: ProvenanceType;
  sourceRestrictions?: {
    isRestricted?: boolean;
    restrictionBasis?: PolicyRestrictionBasis;
    policyStatus?: PolicyStatus;
    persistenceEligible?: boolean;
    persistenceEligibility?: PersistenceStatus;
    exportEligible?: boolean;
    exportEligibility?: ExportStatus;
  };
}

export interface ContactIntelligenceResult {
  contacts: CanonicalContact[];
  people: CanonicalPerson[];
  prioritySignal: ContactPrioritySignal;
  completeness: ContactCompleteness;
  sourceGraph: ContactSourceGraph;
  conflicts: ContactConflictRecord[];
  changes?: ContactChangeEvent[];
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  observedAt: string;
  isRestricted: boolean;
  persistenceEligibility?: PersistenceStatus;
  exportEligibility?: ExportStatus;
  restrictionBasis?: PolicyRestrictionBasis;
}
