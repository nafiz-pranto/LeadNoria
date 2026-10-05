/**
 * LeadNoria Website Intelligence Engine Types (Phase 21)
 *
 * Defines source-neutral, structured data contracts for public business website
 * intelligence, public contact extraction, digital presence, team/people discovery,
 * technology signals, and cross-page conflict detection within bounded same-origin crawls.
 */

import type {
  ProvenanceType,
  SourceContribution,
  PolicyRestrictionBasis,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus
} from '../extraction/types.ts';

import type {
  BusinessPhoneFact,
  BusinessEmailFact,
  BusinessLocationFact,
  DigitalPresenceFact,
  ContactFormFact,
  ContactEvidenceItem
} from '../enrichment/contactTypes.ts';

export const DEFAULT_MAX_PAGES_PER_DOMAIN = 5;
export const DEFAULT_MAX_PAGE_TIMEOUT_MS = 10000;
export const DEFAULT_MAX_DOMAIN_TIMEOUT_MS = 30000;
export const DEFAULT_CACHE_TTL_MS = 86400000; // 24 hours
export const DEFAULT_MAX_DOCUMENT_BYTES = 500000; // 500 KB
export const DEFAULT_MAX_CACHE_ENTRIES = 100;
export const DEFAULT_MAX_CACHE_BYTES = 5 * 1024 * 1024; // 5 MB

export type WebsiteVerificationState =
  | 'VERIFIED'
  | 'LIKELY'
  | 'UNVERIFIED'
  | 'REJECTED'
  | 'CHALLENGE_BLOCKED'
  | 'UNREACHABLE'
  | 'INVALID';

export type EvidenceConfidence =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'AMBIGUOUS';

export type ExtractionState =
  | 'FOUND'
  | 'NOT_FOUND'
  | 'PARTIAL'
  | 'INVALID'
  | 'CONFLICT'
  | 'UNKNOWN';

export type EmailEvidenceKind =
  | 'PUBLICLY_LISTED'
  | 'STRUCTURED_DATA'
  | 'MAILTO'
  | 'UNVERIFIED'
  | 'INVALID';

export type PhoneEvidenceKind =
  | 'PUBLICLY_LISTED'
  | 'STRUCTURED_DATA'
  | 'TEL_LINK'
  | 'UNVERIFIED'
  | 'INVALID';

export type SocialEvidenceKind = 'WEBSITE_LINKED_SOCIAL';

export type PersonEvidenceKind =
  | 'TEAM_PAGE'
  | 'ABOUT_PAGE'
  | 'STRUCTURED_DATA'
  | 'CONTACT_PAGE'
  | 'VISIBLE_CONTENT';

export type TechnologyCategory =
  | 'CMS'
  | 'ECOMMERCE'
  | 'BOOKING'
  | 'CHAT_WIDGET'
  | 'ANALYTICS'
  | 'TAG_MANAGER'
  | 'FRAMEWORK'
  | 'OTHER';

export type TechnologyDetectionState =
  | 'DETECTED'
  | 'LIKELY'
  | 'UNKNOWN';

export type ConflictType =
  | 'PHONE_CONFLICT'
  | 'ADDRESS_CONFLICT'
  | 'NAME_CONFLICT'
  | 'EMAIL_CONFLICT'
  | 'TITLE_CONFLICT';

export interface PublicPerson {
  fullName: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  linkedInUrl?: string;
  sourceUrl: string;
  evidenceType: PersonEvidenceKind;
  observedAt: string;
  provenance: ProvenanceType;
}

export interface TechnologySignal {
  name: string;
  category: TechnologyCategory;
  state: TechnologyDetectionState;
  evidence: string;
  observedAt: string;
  provenance: ProvenanceType;
}

export interface BusinessService {
  name: string;
  category?: string;
  sourceUrl: string;
  snippet?: string;
  observedAt: string;
  provenance: ProvenanceType;
}

export interface BusinessDescription {
  text: string;
  sourceType: 'HOMEPAGE' | 'ABOUT' | 'STRUCTURED_DATA' | 'META_DESC';
  sourceUrl: string;
  observedAt: string;
  provenance: ProvenanceType;
}

export interface ContactConflict {
  conflictType: ConflictType;
  field: string;
  values: Array<{
    value: string;
    sourceUrl: string;
    observedAt: string;
  }>;
  description: string;
}

export interface WebsiteIdentity {
  canonicalUrl: string;
  domain: string;
  pageTitle: string;
  businessName?: string;
  legalName?: string;
  description?: string;
  metaDescription?: string;
  address?: string;
  phones: string[];
  emails: string[];
  businessHours?: string;
  serviceAreas: string[];
  services: string[];
  categories: string[];
}

export interface CrawlStats {
  pagesDiscovered: number;
  pagesVisited: string[];
  pagesSkipped: string[];
  pagesFailed: string[];
  durationMs: number;
  fromCache: boolean;
}

export interface WebsiteIntelligenceConfig {
  maxPages?: number;
  pageTimeoutMs?: number;
  domainTimeoutMs?: number;
  cacheTtlMs?: number;
  maxDocumentBytes?: number;
  maxConcurrentRequests?: number;
  collectPeople?: boolean;
  collectServices?: boolean;
  detectTechnology?: boolean;
}

export interface WebsiteIntelligenceInput {
  targetUrl: string;
  sourceContext: 'META' | 'GOOGLE_MAPS' | 'USER_PROVIDED' | string;
  provenanceContext: ProvenanceType;
  sourceRestrictions?: {
    isRestricted: boolean;
    restrictionBasis?: PolicyRestrictionBasis;
    policyStatus?: PolicyStatus;
    persistenceEligibility?: PersistenceStatus;
    exportEligibility?: ExportStatus;
  };
  businessContext?: {
    expectedName?: string;
    expectedPhone?: string;
    expectedAddress?: string;
    expectedCity?: string;
  };
  config?: WebsiteIntelligenceConfig;
}

export interface WebsiteIntelligenceResult {
  identity: WebsiteIdentity;
  contacts: ContactEvidenceItem[];
  phones: BusinessPhoneFact[];
  emails: BusinessEmailFact[];
  socialProfiles: DigitalPresenceFact[];
  publicPeople: PublicPerson[];
  address?: BusinessLocationFact;
  services: BusinessService[];
  description?: BusinessDescription;
  businessHours?: string;
  technologySignals: TechnologySignal[];
  contactForms: ContactFormFact[];
  sourcePages: string[];
  crawlStats: CrawlStats;
  verificationState: WebsiteVerificationState;
  conflicts: ContactConflict[];
  warnings: string[];
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  observedAt: string;
}
