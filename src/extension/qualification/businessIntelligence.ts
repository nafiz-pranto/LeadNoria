/**
 * LeadNoria Business Intelligence & Multi-Source Evidence Aggregation (Phase 23)
 *
 * Implements deterministic aggregation of public evidence observed across
 * Google Maps, Meta Ad Library, Website Intelligence (Phase 21), and
 * Contact & Person Intelligence (Phase 22).
 *
 * NON-NEGOTIABLE PRINCIPLES:
 * - Deterministic and explainable (NO AI scores, NO conversion probabilities).
 * - Zero predictive buyer/intent scores.
 * - Evidence-backed field states: CONFIRMED, OBSERVED, CORROBORATED, UNKNOWN, NOT_FOUND, CONTRADICTORY, BLOCKED.
 * - Preserves strict Google restriction invariants: Google-derived intelligence
 *   remains NOT_PERSISTABLE and NOT_EXPORTABLE without policy laundering.
 */

import type {
  SourceType,
  ProvenanceType,
  SourceContribution,
  PolicyRestrictionBasis,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus
} from '../extraction/types.ts';
import type { WebsiteIntelligenceResult } from '../websiteIntelligence/types.ts';
import type { ContactIntelligenceResult } from '../contactIntelligence/types.ts';
import type { NormalizedCandidate } from '../extraction/types.ts';
import type { ResolvedEntityGroup } from '../resolution/types.ts';

// ==========================================
// 1. Evidence States & Signal Models
// ==========================================

export type EvidenceState =
  | 'CONFIRMED'
  | 'OBSERVED'
  | 'CORROBORATED'
  | 'UNKNOWN'
  | 'NOT_FOUND'
  | 'CONTRADICTORY'
  | 'BLOCKED';

export type FreshnessState =
  | 'CURRENT'
  | 'STALE'
  | 'UNKNOWN';

export interface EvidenceSignal<T> {
  value: T | undefined;
  state: EvidenceState;
  source: SourceType;
  sourceUrl?: string;
  observedAt: string;
  firstObservedAt?: string;
  lastObservedAt?: string;
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  corroborationSources?: SourceType[];
  conflicts?: Array<{ source: string; value: any; reason?: string }>;
  freshnessState?: FreshnessState;
}

// ==========================================
// 2. Business Completeness Metrics
// ==========================================

export interface BusinessCompletenessMetrics {
  evidenceCoverage: number;          // 0.0 - 1.0 (unrounded ratio)
  identityCompleteness: number;      // 0.0 - 1.0
  locationCompleteness: number;      // 0.0 - 1.0
  websiteCompleteness: number;       // 0.0 - 1.0
  contactCompleteness: number;       // 0.0 - 1.0
  publicPersonCompleteness: number;  // 0.0 - 1.0
  socialPresenceCompleteness: number;// 0.0 - 1.0
  businessCompleteness: number;      // aggregate 0.0 - 1.0
  sourceCorroborationCount: number;  // count of cross-corroborated signals
  contradictionCount: number;        // count of contradictory signals
  unknownCriterionCount: number;      // count of unknown signals/criteria
}

// ==========================================
// 3. Structured Business Intelligence Profile
// ==========================================

export interface BusinessIntelligenceProfile {
  identity: {
    canonicalBusinessName: EvidenceSignal<string>;
    verifiedDomain: EvidenceSignal<string>;
    businessStatus: EvidenceSignal<'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY' | 'UNKNOWN'>;
    primaryCategory: EvidenceSignal<string>;
    secondaryCategories: EvidenceSignal<string[]>;
  };
  location: {
    address: EvidenceSignal<string>;
    city: EvidenceSignal<string>;
    region: EvidenceSignal<string>;
    country: EvidenceSignal<string>;
    serviceAreas: EvidenceSignal<string[]>;
    geographicConfidence: EvidenceSignal<'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'>;
  };
  businessActivity: {
    publishedServices: EvidenceSignal<string[]>;
    businessDescription: EvidenceSignal<string>;
    businessHours: EvidenceSignal<string>;
    contactAvailability: EvidenceSignal<'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE' | 'UNKNOWN'>;
  };
  digitalPresence: {
    websitePresent: EvidenceSignal<boolean>;
    verifiedWebsite: EvidenceSignal<boolean>;
    socialPresence: EvidenceSignal<string[]>;
    contactFormPresent: EvidenceSignal<boolean>;
    bookingSystemPresent: EvidenceSignal<boolean>;
    ecommercePresent: EvidenceSignal<boolean>;
    chatPresent: EvidenceSignal<boolean>;
    analyticsTechnologyPresent: EvidenceSignal<boolean>;
    cmsDetected: EvidenceSignal<string>;
  };
  contactPresence: {
    publicEmailPresent: EvidenceSignal<boolean>;
    roleEmailPresent: EvidenceSignal<boolean>;
    personEmailPresent: EvidenceSignal<boolean>;
    publicPhonePresent: EvidenceSignal<boolean>;
    personPhonePresent: EvidenceSignal<boolean>;
    publicPersonPresent: EvidenceSignal<boolean>;
    personWithTitlePresent: EvidenceSignal<boolean>;
  };
  advertisingSignals: {
    hasMetaAds: EvidenceSignal<boolean>;
    adCount: EvidenceSignal<number>;
    adStatus: EvidenceSignal<'ACTIVE' | 'INACTIVE' | 'NOT_FOUND' | 'UNKNOWN'>;
    adPlatforms: EvidenceSignal<string[]>;
    adPresenceState: EvidenceSignal<boolean>;
  };
  completeness: BusinessCompletenessMetrics;
  completenessMetrics: BusinessCompletenessMetrics;
  corroboration: {
    identityCorroborated: boolean;
    phoneCorroborated: boolean;
    domainCorroborated: boolean;
    details: Array<{ signal: string; sources: SourceType[]; note: string }>;
  };
  crossSourceCorroborations: Array<{ signal: string; sources: SourceType[]; note: string }>;
  conflicts: Array<{ signal: string; sources: string[]; values: any[]; note: string }>;
  provenance: ProvenanceType;
  sourceContributions: SourceContribution[];
  derivedFrom: string[];
  hasRestrictedGoogleEvidence?: boolean;
  sourceRestrictions?: {
    isRestricted: boolean;
    restrictionBasis: PolicyRestrictionBasis;
    policyStatus: PolicyStatus;
    persistenceEligibility: PersistenceStatus;
    exportEligibility: ExportStatus;
  };
  observedAt: string;
}

// ==========================================
// 4. Build Parameters & Helper Utilities
// ==========================================

export interface BusinessIntelligenceBuildParams {
  candidate?: NormalizedCandidate;
  websiteResult?: WebsiteIntelligenceResult;
  contactResult?: ContactIntelligenceResult;
  resolvedEntityGroup?: ResolvedEntityGroup;
  metaCandidate?: {
    businessName?: string;
    pageUrl?: string;
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
  };
  userProvidedUrl?: string;
  observedAt?: string;
  freshnessMaxAgeDays?: number;
}

function normalizeForComparison(str?: string): string {
  return (str || '')
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePhoneDigits(phone?: string): string {
  let digits = (phone || '').replace(/[^0-9]/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  return digits;
}

export function evaluateTemporalFreshness(
  timestamp?: string,
  maxAgeDays: number = 90
): FreshnessState {
  if (!timestamp) return 'UNKNOWN';
  try {
    const obsTime = new Date(timestamp).getTime();
    if (isNaN(obsTime)) return 'UNKNOWN';
    const now = Date.now();
    const diffDays = (now - obsTime) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) return 'CURRENT'; // future/current clock
    return diffDays <= maxAgeDays ? 'CURRENT' : 'STALE';
  } catch {
    return 'UNKNOWN';
  }
}

function createSignal<T>(
  value: T | undefined,
  state: EvidenceState,
  source: SourceType,
  provenance: ProvenanceType,
  observedAt: string,
  sourceUrl?: string,
  extra?: Partial<EvidenceSignal<T>>
): EvidenceSignal<T> {
  const isGoogle = provenance === 'GOOGLE_DERIVED';
  const contrib: SourceContribution = {
    source,
    provenance,
    fieldName: 'signal',
    acquisitionContext: isGoogle ? 'GOOGLE_CONSUMER_WEB' : (provenance === 'META_DERIVED' ? 'META_AD_LIBRARY' : 'WEBSITE_DIRECT'),
    restrictionBasis: isGoogle ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' : 'NONE',
    isRestricted: isGoogle,
    policyStatus: isGoogle ? 'PRODUCT_REJECTED' : 'POLICY_APPROVED',
    persistenceStatus: isGoogle ? 'NOT_PERSISTABLE' : 'PERSISTABLE',
    exportStatus: isGoogle ? 'NOT_EXPORTABLE' : 'EXPORTABLE'
  };

  return {
    value,
    state,
    source,
    sourceUrl,
    observedAt,
    firstObservedAt: extra?.firstObservedAt || observedAt,
    lastObservedAt: extra?.lastObservedAt || observedAt,
    provenance,
    sourceContributions: [contrib],
    corroborationSources: extra?.corroborationSources,
    conflicts: extra?.conflicts,
    freshnessState: extra?.freshnessState || evaluateTemporalFreshness(observedAt)
  };
}

// ==========================================
// 5. Deterministic Profile Builder
// ==========================================

export function buildBusinessIntelligenceProfile(
  params: BusinessIntelligenceBuildParams
): BusinessIntelligenceProfile {
  const observedAt = params.observedAt || new Date().toISOString();
  const maxAgeDays = params.freshnessMaxAgeDays || 90;
  const conflicts: Array<{ signal: string; sources: string[]; values: any[]; note: string }> = [];
  const corroborationDetails: Array<{ signal: string; sources: SourceType[]; note: string }> = [];

  // Determine Primary Provenance & Restrictions
  const isGoogleRestricted = Boolean(
    params.googleCandidate?.isRestricted ||
    params.candidate?.overallProvenance === 'GOOGLE_DERIVED' ||
    params.candidate?.sourceContributions?.some(c => c.provenance === 'GOOGLE_DERIVED' || c.restrictionBasis === 'GOOGLE_CONSUMER_WEB_RESTRICTED')
  );

  let rootProvenance: ProvenanceType = 'WEBSITE_DERIVED';
  if (isGoogleRestricted || params.candidate?.overallProvenance === 'GOOGLE_DERIVED') {
    rootProvenance = 'GOOGLE_DERIVED';
  } else if (params.metaCandidate || params.candidate?.overallProvenance === 'META_DERIVED') {
    rootProvenance = 'META_DERIVED';
  } else if (params.userProvidedUrl || params.candidate?.overallProvenance === 'USER_PROVIDED') {
    rootProvenance = 'USER_PROVIDED';
  }

  // ----------------------------------------------------
  // A. IDENTITY
  // ----------------------------------------------------
  const webName = params.websiteResult?.identity?.businessName || params.websiteResult?.identity?.pageTitle;
  const mapsName = params.googleCandidate?.businessName || params.candidate?.businessName?.value?.displayName;
  const metaName = params.metaCandidate?.businessName;

  let businessName = webName || mapsName || metaName || '';
  let nameState: EvidenceState = 'UNKNOWN';
  const nameSources: SourceType[] = [];

  if (webName) nameSources.push('WEBSITE');
  if (mapsName) nameSources.push('GOOGLE_MAPS');
  if (metaName) nameSources.push('META');

  if (nameSources.length >= 2) {
    const normWeb = normalizeForComparison(webName);
    const normMaps = normalizeForComparison(mapsName);
    const normMeta = normalizeForComparison(metaName);

    const matches = (
      (normWeb && normMaps && (normWeb.includes(normMaps) || normMaps.includes(normWeb))) ||
      (normWeb && normMeta && (normWeb.includes(normMeta) || normMeta.includes(normWeb))) ||
      (normMaps && normMeta && (normMaps.includes(normMeta) || normMeta.includes(normMaps)))
    );

    if (matches) {
      nameState = 'CORROBORATED';
      corroborationDetails.push({
        signal: 'canonicalBusinessName',
        sources: nameSources,
        note: `Business name corroborated across ${nameSources.join(' and ')}`
      });
    } else {
      nameState = 'CONTRADICTORY';
      conflicts.push({
        signal: 'canonicalBusinessName',
        sources: nameSources.map(String),
        values: [webName, mapsName, metaName].filter(Boolean),
        note: 'Contradictory business names observed across sources without matching alias'
      });
    }
  } else if (nameSources.length === 1) {
    nameState = 'OBSERVED';
  } else {
    nameState = 'NOT_FOUND';
  }

  const canonicalBusinessName = createSignal(
    businessName,
    nameState,
    nameSources[0] || 'WEBSITE',
    rootProvenance,
    observedAt,
    params.websiteResult?.identity?.canonicalUrl,
    { corroborationSources: nameSources }
  );

  // Verified Domain
  const webDomain = params.websiteResult?.identity?.domain;
  const candDomain = params.candidate?.websiteUrl?.value?.canonicalDomain || params.candidate?.websiteUrl?.value?.hostname || (params.candidate as any)?.website?.value?.domain;
  const domainVal = webDomain || candDomain || '';
  let domainState: EvidenceState = 'UNKNOWN';
  const domainSources: SourceType[] = [];

  if (webDomain) domainSources.push('WEBSITE');
  if (candDomain) domainSources.push(params.candidate?.overallProvenance === 'GOOGLE_DERIVED' ? 'GOOGLE_MAPS' : 'META');

  if (domainVal) {
    if (webDomain && candDomain && webDomain.toLowerCase() === candDomain.toLowerCase()) {
      domainState = 'CORROBORATED';
      corroborationDetails.push({
        signal: 'verifiedDomain',
        sources: domainSources,
        note: `Domain corroborated between website and listing: ${domainVal}`
      });
    } else {
      domainState = params.websiteResult?.identity ? 'CONFIRMED' : 'OBSERVED';
    }
  } else {
    domainState = 'NOT_FOUND';
  }

  const verifiedDomain = createSignal(
    domainVal,
    domainState,
    domainSources[0] || 'WEBSITE',
    rootProvenance,
    observedAt,
    params.websiteResult?.identity?.canonicalUrl
  );

  // Category
  const primaryCat =
    params.candidate?.categories?.[0]?.value?.normalizedCategory ||
    params.googleCandidate?.categories?.[0] ||
    params.websiteResult?.identity?.categories?.[0] ||
    '';
  const primaryCategory = createSignal(
    primaryCat,
    primaryCat ? 'OBSERVED' : 'NOT_FOUND',
    params.googleCandidate ? 'GOOGLE_MAPS' : 'WEBSITE',
    rootProvenance,
    observedAt
  );

  const secCats = [
    ...(params.candidate?.categories?.slice(1).map(c => c.value?.normalizedCategory).filter(Boolean) || []),
    ...(params.googleCandidate?.categories?.slice(1) || []),
    ...(params.websiteResult?.identity?.categories?.slice(1) || [])
  ] as string[];
  const secondaryCategories = createSignal(
    secCats,
    secCats.length > 0 ? 'OBSERVED' : 'NOT_FOUND',
    params.googleCandidate ? 'GOOGLE_MAPS' : 'WEBSITE',
    rootProvenance,
    observedAt
  );

  // Business Status
  const businessStatus = createSignal<'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY' | 'UNKNOWN'>(
    'OPERATIONAL',
    'CONFIRMED',
    'WEBSITE',
    rootProvenance,
    observedAt
  );

  // ----------------------------------------------------
  // B. LOCATION
  // ----------------------------------------------------
  const webAddr = params.websiteResult?.address?.normalizedAddress || params.websiteResult?.address?.rawAddress || params.websiteResult?.identity?.address;
  const mapsAddr = params.googleCandidate?.address || params.candidate?.address?.value?.displayAddress || params.candidate?.address?.value?.normalizedAddress;
  let addressVal = webAddr || mapsAddr || '';
  let addressState: EvidenceState = 'UNKNOWN';

  if (webAddr && mapsAddr) {
    const normW = normalizeForComparison(webAddr);
    const normM = normalizeForComparison(mapsAddr);
    if (normW === normM || normW.includes(normM) || normM.includes(normW)) {
      addressState = 'CORROBORATED';
      corroborationDetails.push({
        signal: 'address',
        sources: ['WEBSITE', 'GOOGLE_MAPS'],
        note: 'Physical street address corroborated between Google Maps and website'
      });
    } else {
      addressState = 'CONTRADICTORY';
      conflicts.push({
        signal: 'address',
        sources: ['WEBSITE', 'GOOGLE_MAPS'],
        values: [webAddr, mapsAddr],
        note: 'Address mismatch between website and Maps listing'
      });
    }
  } else if (webAddr || mapsAddr) {
    addressState = 'OBSERVED';
  } else {
    addressState = 'NOT_FOUND';
  }

  const address = createSignal(
    addressVal,
    addressState,
    webAddr ? 'WEBSITE' : 'GOOGLE_MAPS',
    rootProvenance,
    observedAt
  );

  const cityVal = params.websiteResult?.address?.city || params.candidate?.address?.value?.locality || '';
  const city = createSignal(cityVal, cityVal ? 'OBSERVED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  const regionVal = params.websiteResult?.address?.region || params.candidate?.address?.value?.region || '';
  const region = createSignal(regionVal, regionVal ? 'OBSERVED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  const countryVal = params.websiteResult?.address?.country || params.candidate?.address?.value?.countryCode || 'US';
  const country = createSignal(countryVal, countryVal ? 'OBSERVED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  const sAreas = params.websiteResult?.identity?.serviceAreas || [];
  const serviceAreas = createSignal(sAreas, sAreas.length > 0 ? 'OBSERVED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  const geoConfidence = createSignal<'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'>(
    addressState === 'CORROBORATED' ? 'HIGH' : addressVal ? 'MEDIUM' : 'UNKNOWN',
    addressVal ? 'OBSERVED' : 'UNKNOWN',
    'WEBSITE',
    rootProvenance,
    observedAt
  );

  // ----------------------------------------------------
  // C. BUSINESS ACTIVITY
  // ----------------------------------------------------
  const rawServices = params.websiteResult?.services || [];
  const publishedServicesList = rawServices.map(s => s.name).filter(Boolean);
  const publishedServices = createSignal(
    publishedServicesList,
    publishedServicesList.length > 0 ? 'OBSERVED' : 'NOT_FOUND',
    'WEBSITE',
    rootProvenance,
    observedAt
  );

  const descVal = params.websiteResult?.description?.text || params.websiteResult?.identity?.metaDescription || '';
  const businessDescription = createSignal(
    descVal,
    descVal ? 'OBSERVED' : 'NOT_FOUND',
    'WEBSITE',
    rootProvenance,
    observedAt
  );

  const hoursVal = params.websiteResult?.businessHours || params.websiteResult?.identity?.businessHours || '';
  const businessHours = createSignal(
    hoursVal,
    hoursVal ? 'OBSERVED' : 'NOT_FOUND',
    'WEBSITE',
    rootProvenance,
    observedAt
  );

  const contactAvailability = createSignal<'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE' | 'UNKNOWN'>(
    (params.contactResult?.contacts?.length || 0) > 0 ? 'AVAILABLE' : 'LIMITED',
    'OBSERVED',
    'WEBSITE',
    rootProvenance,
    observedAt
  );

  // ----------------------------------------------------
  // D. DIGITAL PRESENCE
  // ----------------------------------------------------
  const hasSite = Boolean(params.websiteResult?.identity?.canonicalUrl || params.candidate?.websiteUrl?.value?.originalUrl || params.candidate?.websiteUrl?.value?.normalizedUrl || (params.candidate as any)?.website?.value?.domain);
  const websitePresent = createSignal(hasSite, hasSite ? 'CONFIRMED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  const isVerifiedSite = Boolean(params.websiteResult && params.websiteResult.identity.domain);
  const verifiedWebsite = createSignal(isVerifiedSite, isVerifiedSite ? 'CONFIRMED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  const socialPlatforms = (params.websiteResult?.socialProfiles || []).map(s => s.platform);
  const socialPresence = createSignal(
    socialPlatforms,
    socialPlatforms.length > 0 ? 'OBSERVED' : 'NOT_FOUND',
    'WEBSITE',
    rootProvenance,
    observedAt
  );

  const tech = params.websiteResult?.technologySignals || [];
  const hasBooking = tech.some(t => t.category === 'BOOKING');
  const bookingSystemPresent = createSignal(hasBooking, hasBooking ? 'OBSERVED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  const hasEcommerce = tech.some(t => t.category === 'ECOMMERCE');
  const ecommercePresent = createSignal(hasEcommerce, hasEcommerce ? 'OBSERVED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  const hasChat = tech.some(t => t.category === 'CHAT_WIDGET');
  const chatPresent = createSignal(hasChat, hasChat ? 'OBSERVED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  const hasAnalytics = tech.some(t => t.category === 'ANALYTICS' || t.category === 'TAG_MANAGER');
  const analyticsTechnologyPresent = createSignal(hasAnalytics, hasAnalytics ? 'OBSERVED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  const cmsTech = tech.find(t => t.category === 'CMS');
  const cmsDetected = createSignal(cmsTech?.name || '', cmsTech ? 'OBSERVED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  const hasForm =
    (params.contactResult?.contacts || []).some(c => c.contactType === 'CONTACT_FORM') ||
    (params.websiteResult?.contactForms || []).length > 0;
  const contactFormPresent = createSignal(hasForm, hasForm ? 'OBSERVED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  // ----------------------------------------------------
  // E. CONTACT PRESENCE
  // ----------------------------------------------------
  const contacts = params.contactResult?.contacts || [];
  const people = params.contactResult?.people || [];

  const emails = contacts.filter(c => c.contactType === 'EMAIL');
  const phones = contacts.filter(c => c.contactType === 'PHONE');

  const publicEmailPresent = createSignal(emails.length > 0, emails.length > 0 ? 'CONFIRMED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);
  const roleEmailPresent = createSignal(emails.some(e => e.emailClassification === 'ROLE_ACCOUNT'), emails.some(e => e.emailClassification === 'ROLE_ACCOUNT') ? 'CONFIRMED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);
  const personEmailPresent = createSignal(emails.some(e => e.emailClassification === 'PERSON_NAMED' || e.associatedPersonId), emails.some(e => e.emailClassification === 'PERSON_NAMED' || e.associatedPersonId) ? 'CONFIRMED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  // Phone corroboration check
  const mapsPhone = params.googleCandidate?.phone || params.candidate?.phones?.[0]?.value?.e164Format || params.candidate?.phones?.[0]?.value?.rawPhone;
  const webPhone = phones[0]?.normalizedValue;
  let phoneState: EvidenceState = phones.length > 0 ? 'CONFIRMED' : 'NOT_FOUND';

  if (mapsPhone && webPhone) {
    if (normalizePhoneDigits(mapsPhone) === normalizePhoneDigits(webPhone)) {
      phoneState = 'CORROBORATED';
      corroborationDetails.push({
        signal: 'publicPhonePresent',
        sources: ['GOOGLE_MAPS', 'WEBSITE'],
        note: `Phone number corroborated across Maps and Website: ${webPhone}`
      });
    } else {
      conflicts.push({
        signal: 'publicPhonePresent',
        sources: ['GOOGLE_MAPS', 'WEBSITE'],
        values: [mapsPhone, webPhone],
        note: 'Phone number mismatch between Maps listing and Website'
      });
    }
  }

  const publicPhonePresent = createSignal(phones.length > 0, phoneState, 'WEBSITE', rootProvenance, observedAt);
  const personPhonePresent = createSignal(phones.some(p => p.associatedPersonId), phones.some(p => p.associatedPersonId) ? 'CONFIRMED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  const publicPersonPresent = createSignal(people.length > 0, people.length > 0 ? 'CONFIRMED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);
  const personWithTitlePresent = createSignal(people.some(p => p.jobTitle || p.roleCategory), people.some(p => p.jobTitle || p.roleCategory) ? 'CONFIRMED' : 'NOT_FOUND', 'WEBSITE', rootProvenance, observedAt);

  // ----------------------------------------------------
  // F. ADVERTISING SIGNALS
  // ----------------------------------------------------
  const hasMeta = Boolean(params.metaCandidate && (params.metaCandidate.adCount || 0) > 0);
  const metaObservedAt = params.metaCandidate?.observedAt || observedAt;
  const metaFreshness = evaluateTemporalFreshness(metaObservedAt, maxAgeDays);

  const hasMetaAds = createSignal(
    hasMeta,
    hasMeta ? 'OBSERVED' : 'NOT_FOUND',
    'META',
    'META_DERIVED',
    metaObservedAt,
    params.metaCandidate?.pageUrl,
    { freshnessState: metaFreshness }
  );

  const adCount = createSignal(
    params.metaCandidate?.adCount || 0,
    hasMeta ? 'OBSERVED' : 'NOT_FOUND',
    'META',
    'META_DERIVED',
    metaObservedAt,
    undefined,
    { freshnessState: metaFreshness }
  );

  const adStatus = createSignal<'ACTIVE' | 'INACTIVE' | 'NOT_FOUND' | 'UNKNOWN'>(
    params.metaCandidate?.adStatus || (hasMeta ? 'ACTIVE' : 'NOT_FOUND'),
    hasMeta ? 'OBSERVED' : 'NOT_FOUND',
    'META',
    'META_DERIVED',
    metaObservedAt,
    undefined,
    { freshnessState: metaFreshness }
  );

  const adPlatforms = createSignal(
    params.metaCandidate?.adPlatforms || [],
    hasMeta ? 'OBSERVED' : 'NOT_FOUND',
    'META',
    'META_DERIVED',
    metaObservedAt,
    undefined,
    { freshnessState: metaFreshness }
  );

  // ----------------------------------------------------
  // G. DETERMINISTIC COMPLETENESS METRICS
  // ----------------------------------------------------
  const identityFields = [canonicalBusinessName.value, verifiedDomain.value, primaryCategory.value];
  const identityCompleteness = identityFields.filter(Boolean).length / identityFields.length;

  const locationFields = [address.value, city.value, country.value];
  const locationCompleteness = locationFields.filter(Boolean).length / locationFields.length;

  const websiteFields = [verifiedWebsite.value, publishedServicesList.length > 0, descVal, hoursVal];
  const websiteCompleteness = websiteFields.filter(Boolean).length / websiteFields.length;

  const contactCompleteness = params.contactResult?.completeness?.contactCompletenessRatio ?? (
    [emails.length > 0, phones.length > 0, socialPlatforms.length > 0, hasForm].filter(Boolean).length / 4
  );

  const publicPersonCompleteness = [
    people.length > 0,
    people.some(p => p.jobTitle || p.roleCategory),
    people.some(p => (p.emailRefs?.length ?? 0) > 0 || (p.phoneRefs?.length ?? 0) > 0)
  ].filter(Boolean).length / 3;

  const socialPresenceCompleteness = Math.min(socialPlatforms.length / 3, 1.0);

  // Aggregate Measurable Signals
  const keySignals = [
    canonicalBusinessName.state,
    verifiedDomain.state,
    address.state,
    publishedServices.state,
    publicEmailPresent.state,
    publicPhonePresent.state,
    publicPersonPresent.state,
    socialPresence.state
  ];

  const coveredSignalsCount = keySignals.filter(s => s === 'CONFIRMED' || s === 'OBSERVED' || s === 'CORROBORATED').length;
  const evidenceCoverage = coveredSignalsCount / keySignals.length;

  const businessCompleteness = (
    identityCompleteness * 0.25 +
    locationCompleteness * 0.20 +
    websiteCompleteness * 0.20 +
    contactCompleteness * 0.20 +
    publicPersonCompleteness * 0.15
  );

  const completeness: BusinessCompletenessMetrics = {
    evidenceCoverage,
    identityCompleteness,
    locationCompleteness,
    websiteCompleteness,
    contactCompleteness,
    publicPersonCompleteness,
    socialPresenceCompleteness,
    businessCompleteness,
    sourceCorroborationCount: corroborationDetails.length,
    contradictionCount: conflicts.length,
    unknownCriterionCount: keySignals.filter(s => s === 'UNKNOWN' || s === 'NOT_FOUND').length
  };

  return {
    identity: {
      canonicalBusinessName,
      verifiedDomain,
      businessStatus,
      primaryCategory,
      secondaryCategories
    },
    location: {
      address,
      city,
      region,
      country,
      serviceAreas,
      geographicConfidence: geoConfidence
    },
    businessActivity: {
      publishedServices,
      businessDescription,
      businessHours,
      contactAvailability
    },
    digitalPresence: {
      websitePresent,
      verifiedWebsite,
      socialPresence,
      contactFormPresent,
      bookingSystemPresent,
      ecommercePresent,
      chatPresent,
      analyticsTechnologyPresent,
      cmsDetected
    },
    contactPresence: {
      publicEmailPresent,
      roleEmailPresent,
      personEmailPresent,
      publicPhonePresent,
      personPhonePresent,
      publicPersonPresent,
      personWithTitlePresent
    },
    advertisingSignals: {
      hasMetaAds,
      adCount,
      adStatus,
      adPlatforms,
      adPresenceState: hasMetaAds
    },
    completeness,
    completenessMetrics: completeness,
    corroboration: {
      identityCorroborated: nameState === 'CORROBORATED',
      phoneCorroborated: phoneState === 'CORROBORATED',
      domainCorroborated: domainState === 'CORROBORATED',
      details: corroborationDetails
    },
    crossSourceCorroborations: corroborationDetails,
    conflicts,
    provenance: rootProvenance,
    sourceContributions: [
      canonicalBusinessName.sourceContributions[0],
      verifiedDomain.sourceContributions[0]
    ],
    derivedFrom: [
      params.candidate?.candidateId,
      params.websiteResult?.identity?.canonicalUrl,
      params.googleCandidate?.placeId,
      params.metaCandidate?.pageUrl
    ].filter(Boolean) as string[],
    hasRestrictedGoogleEvidence: isGoogleRestricted,
    sourceRestrictions: {
      isRestricted: isGoogleRestricted,
      restrictionBasis: isGoogleRestricted ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' : 'NONE',
      policyStatus: isGoogleRestricted ? 'POLICY_REVIEW_REQUIRED' : 'POLICY_APPROVED',
      persistenceEligibility: isGoogleRestricted ? 'NOT_PERSISTABLE' : 'PERSISTABLE',
      exportEligibility: isGoogleRestricted ? 'NOT_EXPORTABLE' : 'EXPORTABLE'
    },
    observedAt
  };
}
