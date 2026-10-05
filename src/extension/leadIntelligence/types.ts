/**
 * LeadNoria — Phase 24: Unified Lead Intelligence & Cross-Source Record Assembly
 * Canonical Lead Intelligence Data Contracts & Types
 *
 * Non-Negotiable Invariants:
 * - Deterministic, explainable, source-aware, field-level lineage preserving
 * - Phase 8 Entity Resolution remains the ONLY authority for entity merge & branch distinction
 * - Phase 23 remains the ONLY authority for qualification evaluation
 * - Field conflicts are NEVER silently overwritten
 * - Google consumer-web restrictions CANNOT be laundered through cross-source assembly
 * - Existing Phase 16 ExportPolicy and PersistencePolicy remain authoritative
 */

import type {
  SourceType,
  ProvenanceType,
  PolicyRestrictionBasis,
  SourceContribution,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus
} from '../extraction/types.ts';

import type {
  ResolvedEntityGroup,
  BranchSignal
} from '../resolution/types.ts';

import type {
  WebsiteIntelligenceResult,
  TechnologySignal
} from '../websiteIntelligence/types.ts';

import type {
  ContactIntelligenceResult,
  CanonicalContact,
  CanonicalPerson,
  ContactConflictRecord
} from '../contactIntelligence/types.ts';

import type {
  QualificationDecision
} from '../qualification/qualificationTypes.ts';

import type {
  NormalizedCandidate
} from '../extraction/types.ts';

import type {
  UnifiedResearchRecord,
  CandidateEnvelope
} from '../pipeline/pipelineTypes.ts';

export const CURRENT_LEAD_RECORD_SCHEMA_VERSION = 'lead-intelligence-v1';

// ==========================================
// 1. Freshness & Change States
// ==========================================

export type FreshnessState = 'CURRENT' | 'STALE' | 'UNKNOWN';

export type ChangeState =
  | 'OBSERVED'
  | 'NOT_OBSERVED_THIS_RUN'
  | 'CHANGED'
  | 'STALE'
  | 'UNKNOWN';

export interface SourceFreshnessEntry {
  sourceType: SourceType | 'USER_PROVIDED' | 'WEBSITE';
  firstObservedAt: string;
  lastObservedAt: string;
  state: FreshnessState;
  observationCount: number;
}

export interface CanonicalFreshnessModel {
  firstObservedAt: string;
  lastObservedAt: string;
  perSourceFreshness: Record<string, SourceFreshnessEntry>;
}

// ==========================================
// 2. Field Lineage & Conflict Model
// ==========================================

export interface FieldAlternative<T> {
  value: T;
  source: SourceType | 'USER_PROVIDED' | 'WEBSITE';
  provenance: ProvenanceType;
  sourceUrl?: string;
  observedAt: string;
  lineage?: string[];
  raw?: any;
}

export interface CanonicalFieldConflict {
  field: string;
  conflictingValues: Array<{
    value: any;
    source: string;
    provenance: ProvenanceType;
    observedAt: string;
    sourceUrl?: string;
  }>;
  reason: string;
}

export interface CanonicalField<T> {
  value: T;
  preferredObservedValue?: T; // Defined ONLY when an existing deterministic policy establishes precedence
  hasConflict: boolean;
  alternatives: FieldAlternative<T>[];
  conflicts: CanonicalFieldConflict[];
  corroboratedBySources: SourceType[];
  corroborationCount: number;
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  firstObservedAt: string;
  lastObservedAt: string;
  freshnessState: FreshnessState;
  changeState: ChangeState;
}

// ==========================================
// 3. Contacts & People Models
// ==========================================

export interface CanonicalLeadContact {
  type: 'EMAIL' | 'PHONE';
  value: string;
  normalizedValue: string;
  preferredObservedValue?: string;
  hasConflict: boolean;
  alternatives: FieldAlternative<string>[];
  conflicts: CanonicalFieldConflict[];
  isCorroborated: boolean;
  corroboratedBySources: SourceType[];
  corroborationCount: number;
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  firstObservedAt: string;
  lastObservedAt: string;
  freshnessState: FreshnessState;
  changeState: ChangeState;
  isRestricted: boolean;
  exportEligible: boolean;
  persistenceEligible: boolean;
  category?: 'OPERATIONAL_ROLE' | 'NAMED_INDIVIDUAL' | 'GENERAL_INQUIRY' | 'UNKNOWN';
  carrierOrDomain?: string;
  associatedPersonNames: string[];
}

export interface CanonicalLeadPerson {
  personId: string;
  name: string;
  canonicalName: string;
  titles: string[];
  emails: string[];
  phones: string[];
  linkedInUrl?: string;
  socialUrls: string[];
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  firstObservedAt: string;
  lastObservedAt: string;
  freshnessState: FreshnessState;
  changeState: ChangeState;
  isRestricted: boolean;
  exportEligible: boolean;
  persistenceEligible: boolean;
}

// ==========================================
// 4. Corroboration & Compact Evidence Pack
// ==========================================

export interface CanonicalCorroborationItem {
  field: string;
  corroboratedValue: any;
  sources: SourceType[];
  corroborationCount: number;
  corroboratingReferences: Array<{
    source: SourceType;
    observedValue: any;
    sourceUrl?: string;
    observedAt: string;
  }>;
}

export interface CompactEvidenceItem {
  evidenceId: string;
  sourceType: SourceType;
  factType: string;
  factSummary: string;
  sourceUrl?: string;
  observedAt: string;
  provenance: ProvenanceType;
  isRestricted: boolean;
  fieldReferences: string[];
  corroboratedBy?: SourceType[];
}

export interface CanonicalEvidencePack {
  totalEvidenceCount: number;
  items: CompactEvidenceItem[];
  sourceUrls: string[];
  sourceTypes: SourceType[];
  conflictCount: number;
  corroborationCount: number;
  entityResolutionId: string;
  qualificationProfileId?: string;
}

// ==========================================
// 5. Source Signals Views
// ==========================================

export interface MetaSourceSignals {
  adCount: number;
  adStatus: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
  adPlatforms: string[];
  pageUrl?: string;
  pageId?: string;
  firstSeen?: string;
  lastSeen?: string;
}

export interface GoogleSourceSignals {
  placeId?: string;
  businessName?: string;
  rating?: number;
  reviewCount?: number;
  categories?: string[];
  observedAt?: string;
  isRestricted: boolean;
  mapsUrl?: string;
}

export interface WebsiteSourceSignals {
  domain: string;
  verifiedUrl: string;
  cms?: string;
  technologySignals: string[];
  hasBooking: boolean;
  hasEcommerce: boolean;
  hasChat: boolean;
  pageCount: number;
  observedAt: string;
}

export interface UserProvidedSignals {
  userProvidedUrl?: string;
  userProvidedName?: string;
  userProvidedFields: Record<string, any>;
  providedAt: string;
}

export interface SourceSignalsView {
  metaEvidence?: MetaSourceSignals;
  googleEvidence?: GoogleSourceSignals;
  websiteEvidence?: WebsiteSourceSignals;
  userProvidedEvidence?: UserProvidedSignals;
}

// ==========================================
// 6. Quality Metrics Summary
// ==========================================

export interface QualitySummary {
  identityCompleteness: number; // 0.0 - 1.0
  businessCompleteness: number; // 0.0 - 1.0
  contactCompleteness: number; // 0.0 - 1.0
  websiteCompleteness: number; // 0.0 - 1.0
  evidenceCoverage: number; // 0.0 - 1.0
  publicPersonCompleteness: number; // 0.0 - 1.0
  contradictionCount: number;
  corroborationCount: number;
}

// ==========================================
// 7. Policy Summary & Firewalls
// ==========================================

export interface CanonicalPolicySummary {
  isRestricted: boolean;
  persistenceEligible: boolean;
  exportEligible: boolean;
  restrictionBasis?: PolicyRestrictionBasis;
  upstreamRestrictions: string[];
  overallProvenance: ProvenanceType;
  hasGoogleConsumerWebLineage: boolean;
  hasMetaLineage: boolean;
  hasWebsiteLineage: boolean;
  hasUserProvidedLineage: boolean;
}

// ==========================================
// 8. Canonical Lead Intelligence Record
// ==========================================

export interface CanonicalLeadRecord {
  schemaVersion: string; // "lead-intelligence-v1"
  canonicalEntityId: string;
  canonicalBusinessName: CanonicalField<string>;
  aliases: string[];
  entityType: 'LOCAL_BUSINESS' | 'PARENT_ORGANIZATION' | 'BRANCH' | 'ONLINE_BUSINESS' | 'GENERAL_BUSINESS';
  branchRelationship?: {
    isBranch: boolean;
    isParent: boolean;
    parentEntityId?: string;
    branchEntityIds: string[];
    branchSignals: Array<{ type: string; token: string }>;
  };
  business: {
    categories: CanonicalField<string[]>;
    businessStatus: CanonicalField<'OPERATIONAL' | 'PERMANENTLY_CLOSED' | 'TEMPORARILY_CLOSED' | 'UNKNOWN'>;
    description: CanonicalField<string>;
    services: CanonicalField<string[]>;
    serviceAreas: CanonicalField<string[]>;
    businessHours: CanonicalField<string>;
  };
  location: {
    addresses: CanonicalField<string[]>;
    normalizedAddress: CanonicalField<string>;
    city: CanonicalField<string>;
    region: CanonicalField<string>;
    country: CanonicalField<string>;
    latitude?: number;
    longitude?: number;
  };
  digital: {
    verifiedWebsite: CanonicalField<string>;
    domains: CanonicalField<string[]>;
    socialProfiles: CanonicalField<Array<{ platform: string; url: string; handle?: string }>>;
    cms?: string;
    technologySignals: TechnologySignal[];
    booking: boolean;
    ecommerce: boolean;
    chat: boolean;
    analytics: string[];
  };
  contacts: {
    emails: CanonicalLeadContact[];
    phones: CanonicalLeadContact[];
    contactForms: string[];
  };
  people: {
    publicPeople: CanonicalLeadPerson[];
    titles: string[];
    personContactAssociations: Array<{
      personName: string;
      email?: string;
      phone?: string;
      associationStrength: 'EXPLICIT_CONTAINED' | 'DIRECT_LINK' | 'POTENTIAL_ASSOCIATION';
    }>;
  };
  sourceSignals: SourceSignalsView;
  evidence: {
    sourceContributions: SourceContribution[];
    evidenceReferences: CompactEvidenceItem[];
    conflicts: CanonicalFieldConflict[];
    corroborations: CanonicalCorroborationItem[];
    evidencePack: CanonicalEvidencePack;
  };
  qualification: {
    qualificationDecision?: QualificationDecision;
    qualificationProfileId?: string;
    reasonGraph?: any;
    finalState?: string;
    blockingCriteria: string[];
    contradictoryCriteria: string[];
    explanation?: string;
  };
  freshness: CanonicalFreshnessModel;
  quality: QualitySummary;
  policy: CanonicalPolicySummary;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 9. Assembler Input Contracts
// ==========================================

export interface CanonicalAssemblyInput {
  resolvedEntityGroup?: ResolvedEntityGroup;
  candidateEnvelopes?: CandidateEnvelope[];
  candidates?: NormalizedCandidate[];
  websiteResult?: WebsiteIntelligenceResult;
  contactResult?: ContactIntelligenceResult;
  qualificationDecision?: QualificationDecision;
  userOverride?: {
    businessName?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    providedAt?: string;
    applyAsPreferred?: boolean; // if true, deterministic policy grants user precedence
  };
  metaCandidate?: {
    businessName?: string;
    pageUrl?: string;
    pageId?: string;
    adCount?: number;
    adStatus?: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
    adPlatforms?: string[];
    observedAt?: string;
  };
  googleCandidate?: {
    businessName?: string;
    placeId?: string;
    address?: string;
    phone?: string;
    websiteUrl?: string;
    categories?: string[];
    isRestricted?: boolean;
    observedAt?: string;
    mapsUrl?: string;
    rating?: number;
    reviewCount?: number;
  };
  previousSnapshot?: CanonicalLeadRecord;
  referenceNow?: string;
  freshnessMaxAgeDays?: number;
}
