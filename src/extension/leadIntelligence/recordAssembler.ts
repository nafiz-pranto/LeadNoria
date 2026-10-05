/**
 * LeadNoria — Phase 24: Unified Lead Intelligence & Cross-Source Record Assembly
 * Canonical Record Assembler Engine
 *
 * Non-Negotiable Invariants:
 * - Deterministic, explainable, source-aware, field-level lineage preserving
 * - Phase 8 Entity Resolution remains the ONLY authority for entity merge & branch distinction
 * - Phase 23 remains the ONLY authority for qualification evaluation (Zero recalculation)
 * - Field conflicts are NEVER silently overwritten
 * - Google consumer-web restrictions CANNOT be laundered through cross-source assembly
 * - Existing Phase 16 ExportPolicy and PersistencePolicy remain authoritative
 */

import type {
  SourceType,
  ProvenanceType,
  SourceContribution
} from '../extraction/types.ts';

import type {
  ResolvedEntityGroup
} from '../resolution/types.ts';

import type {
  UnifiedResearchRecord,
  CandidateRestrictions,
  FieldEligibility,
  SourceRecordKey,
  SourceType as PipelineSourceType
} from '../pipeline/pipelineTypes.ts';

import {
  CURRENT_LEAD_RECORD_SCHEMA_VERSION,
  type CanonicalLeadRecord,
  type CanonicalField,
  type CanonicalFieldConflict,
  type CanonicalCorroborationItem,
  type CanonicalLeadContact,
  type CanonicalLeadPerson,
  type CanonicalEvidencePack,
  type CompactEvidenceItem,
  type SourceSignalsView,
  type QualitySummary,
  type CanonicalFreshnessModel,
  type SourceFreshnessEntry,
  type CanonicalPolicySummary,
  type CanonicalAssemblyInput,
  type FieldAlternative,
  type FreshnessState,
  type ChangeState
} from './types.ts';

import {
  sanitizeObject,
  sanitizeString,
  sanitizeUrl,
  normalizeForIdentityComparison,
  normalizePhoneForComparison,
  evaluateRestrictionFirewall
} from './sanitizer.ts';

import { ExportPolicy } from '../export/exportPolicy.ts';
import { ExportProjection } from '../export/exportProjection.ts';
import type { RecordExportEvaluation, ExportRecordProjection } from '../export/exportTypes.ts';

export class RecordAssembler {
  private static entitySeq = 0;
  private exportPolicy: ExportPolicy;
  private exportProjection: ExportProjection;

  constructor() {
    this.exportPolicy = new ExportPolicy();
    this.exportProjection = new ExportProjection();
  }

  /**
   * Assembles a comprehensive canonical lead intelligence record from multi-source inputs.
   */
  public assemble(rawInput: CanonicalAssemblyInput): CanonicalLeadRecord {
    // 1. Defensively sanitize input payload to prevent prototype pollution and injection
    const input = sanitizeObject(rawInput);
    const now = input.referenceNow || new Date().toISOString();
    const maxAgeDays = input.freshnessMaxAgeDays ?? 90;

    // 2. Identify resolved entity identity authority (Phase 8)
    const entityGroup = input.resolvedEntityGroup;
    let fallbackId = '';
    if (input.googleCandidate?.placeId) {
      fallbackId = `ent_${input.googleCandidate.placeId}`;
    } else if (input.metaCandidate?.pageId) {
      fallbackId = `ent_${input.metaCandidate.pageId}`;
    } else if (input.websiteResult?.identity?.domain) {
      fallbackId = `ent_${input.websiteResult.identity.domain.replace(/[^a-zA-Z0-9]/g, '_')}`;
    } else if (input.metaCandidate?.pageUrl) {
      fallbackId = `ent_${input.metaCandidate.pageUrl.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }

    const entityId = entityGroup?.entityId ||
      input.candidates?.[0]?.candidateId ||
      input.candidateEnvelopes?.[0]?.candidateId ||
      fallbackId ||
      `ent_${++RecordAssembler.entitySeq}`;

    // 3. Assemble Source Signals View
    const sourceSignals: SourceSignalsView = {};
    if (input.metaCandidate) {
      sourceSignals.metaEvidence = {
        adCount: input.metaCandidate.adCount ?? 0,
        adStatus: input.metaCandidate.adStatus || 'UNKNOWN',
        adPlatforms: [...(input.metaCandidate.adPlatforms || [])].sort(),
        pageUrl: sanitizeUrl(input.metaCandidate.pageUrl),
        pageId: input.metaCandidate.pageId,
        firstSeen: input.metaCandidate.observedAt || now,
        lastSeen: input.metaCandidate.observedAt || now
      };
    }
    if (input.googleCandidate) {
      sourceSignals.googleEvidence = {
        placeId: input.googleCandidate.placeId,
        businessName: sanitizeString(input.googleCandidate.businessName),
        rating: typeof input.googleCandidate.rating === 'number' ? input.googleCandidate.rating : undefined,
        reviewCount: typeof input.googleCandidate.reviewCount === 'number' ? input.googleCandidate.reviewCount : undefined,
        categories: [...(input.googleCandidate.categories || [])].sort(),
        observedAt: input.googleCandidate.observedAt || now,
        isRestricted: input.googleCandidate.isRestricted ?? true,
        mapsUrl: sanitizeUrl(input.googleCandidate.mapsUrl)
      };
    }
    if (input.websiteResult) {
      const cmsSignal = (input.websiteResult.technologySignals || []).find(t => t.category === 'CMS');
      sourceSignals.websiteEvidence = {
        domain: sanitizeString(input.websiteResult.identity?.domain),
        verifiedUrl: sanitizeUrl(input.websiteResult.identity?.canonicalUrl),
        cms: cmsSignal?.name,
        technologySignals: (input.websiteResult.technologySignals || []).map(t => t.name).sort(),
        hasBooking: (input.websiteResult.technologySignals || []).some(t => t.category === 'BOOKING'),
        hasEcommerce: (input.websiteResult.technologySignals || []).some(t => t.category === 'ECOMMERCE'),
        hasChat: (input.websiteResult.technologySignals || []).some(t => t.category === 'CHAT_WIDGET'),
        pageCount: input.websiteResult.crawlStats?.pagesVisited?.length || input.websiteResult.crawlStats?.pagesDiscovered || 1,
        observedAt: input.websiteResult.observedAt || now
      };
    }
    if (input.userOverride) {
      sourceSignals.userProvidedEvidence = {
        userProvidedUrl: sanitizeUrl(input.userOverride.website),
        userProvidedName: sanitizeString(input.userOverride.businessName),
        userProvidedFields: {
          phone: input.userOverride.phone,
          email: input.userOverride.email,
          address: input.userOverride.address
        },
        providedAt: input.userOverride.providedAt || now
      };
    }

    // 4. Determine Global Policy & Restriction Firewall
    const allProvenances: ProvenanceType[] = [];
    if (entityGroup?.sourceContributions) {
      allProvenances.push(...entityGroup.sourceContributions.map(c => c.provenance));
    }
    if (input.candidates) {
      allProvenances.push(...input.candidates.map(c => c.overallProvenance));
    }
    if (input.candidateEnvelopes) {
      allProvenances.push(...input.candidateEnvelopes.map(e => e.provenance));
    }
    if (input.googleCandidate) allProvenances.push('GOOGLE_DERIVED');
    if (input.metaCandidate) allProvenances.push('META_DERIVED');
    if (input.websiteResult) allProvenances.push('WEBSITE_DERIVED');
    if (input.userOverride) allProvenances.push('USER_PROVIDED');

    const hasGoogleConsumerWeb =
      entityGroup?.policySummary?.hasGoogleConsumerWebLineage === true ||
      entityGroup?.policySummary?.isRestricted === true ||
      input.googleCandidate?.isRestricted === true ||
      allProvenances.includes('GOOGLE_DERIVED');

    const policyFirewall = evaluateRestrictionFirewall({
      isExplicitlyRestricted: hasGoogleConsumerWeb,
      hasGoogleConsumerWeb,
      provenances: allProvenances
    });

    const policySummary: CanonicalPolicySummary = {
      isRestricted: policyFirewall.isRestricted,
      persistenceEligible: policyFirewall.persistenceEligible,
      exportEligible: policyFirewall.exportEligible,
      restrictionBasis: policyFirewall.restrictionBasis,
      upstreamRestrictions: policyFirewall.upstreamRestrictions,
      overallProvenance: allProvenances.length > 1 ? 'MIXED' : (allProvenances[0] || 'LEADNORIA_DERIVED'),
      hasGoogleConsumerWebLineage: hasGoogleConsumerWeb,
      hasMetaLineage: allProvenances.includes('META_DERIVED'),
      hasWebsiteLineage: allProvenances.includes('WEBSITE_DERIVED'),
      hasUserProvidedLineage: allProvenances.includes('USER_PROVIDED')
    };

    // 5. Track Freshness per Source
    const perSourceFreshness: Record<string, SourceFreshnessEntry> = {};
    const recordTimestamp = (source: SourceType | 'USER_PROVIDED' | 'WEBSITE', ts?: string) => {
      const observed = ts || now;
      if (!perSourceFreshness[source]) {
        perSourceFreshness[source] = {
          sourceType: source,
          firstObservedAt: observed,
          lastObservedAt: observed,
          state: this.computeFreshnessState(observed, now, maxAgeDays),
          observationCount: 1
        };
      } else {
        const entry = perSourceFreshness[source];
        entry.observationCount++;
        if (observed < entry.firstObservedAt) entry.firstObservedAt = observed;
        if (observed > entry.lastObservedAt) {
          entry.lastObservedAt = observed;
          entry.state = this.computeFreshnessState(observed, now, maxAgeDays);
        }
      }
    };

    if (input.metaCandidate) recordTimestamp('META_AD_LIBRARY', input.metaCandidate.observedAt);
    if (input.googleCandidate) recordTimestamp('GOOGLE_MAPS', input.googleCandidate.observedAt);
    if (input.websiteResult) recordTimestamp('WEBSITE', input.websiteResult.observedAt);
    if (input.userOverride) recordTimestamp('USER_PROVIDED', input.userOverride.providedAt);

    // Global timestamps
    const timestamps = Object.values(perSourceFreshness).flatMap(f => [f.firstObservedAt, f.lastObservedAt]);
    const firstObservedAt = timestamps.length > 0 ? [...timestamps].sort()[0] : now;
    const lastObservedAt = timestamps.length > 0 ? [...timestamps].sort().reverse()[0] : now;

    const freshnessModel: CanonicalFreshnessModel = {
      firstObservedAt,
      lastObservedAt,
      perSourceFreshness
    };

    // 6. Assemble Canonical Fields with Lineage and Conflict Protection

    // Field: Canonical Business Name
    const nameAlternatives: FieldAlternative<string>[] = [];
    if (input.userOverride?.businessName) {
      nameAlternatives.push({
        value: input.userOverride.businessName,
        source: 'USER_PROVIDED',
        provenance: 'USER_PROVIDED',
        observedAt: input.userOverride.providedAt || now,
        lineage: ['user-input-form']
      });
    }
    if (entityGroup?.canonicalDisplayName) {
      nameAlternatives.push({
        value: entityGroup.canonicalDisplayName,
        source: 'LEADNORIA',
        provenance: entityGroup.policySummary?.overallProvenance || 'LEADNORIA_DERIVED',
        observedAt: entityGroup.createdAt || now,
        lineage: ['phase-8-entity-resolution']
      });
    }
    if (input.googleCandidate?.businessName) {
      nameAlternatives.push({
        value: input.googleCandidate.businessName,
        source: 'GOOGLE_MAPS',
        provenance: 'GOOGLE_DERIVED',
        observedAt: input.googleCandidate.observedAt || now,
        sourceUrl: input.googleCandidate.mapsUrl,
        lineage: ['google-maps-candidate']
      });
    }
    if (input.metaCandidate?.businessName) {
      nameAlternatives.push({
        value: input.metaCandidate.businessName,
        source: 'META_AD_LIBRARY',
        provenance: 'META_DERIVED',
        observedAt: input.metaCandidate.observedAt || now,
        sourceUrl: input.metaCandidate.pageUrl,
        lineage: ['meta-ad-candidate']
      });
    }
    if (input.websiteResult?.identity?.businessName) {
      nameAlternatives.push({
        value: input.websiteResult.identity.businessName,
        source: 'WEBSITE',
        provenance: 'WEBSITE_DERIVED',
        observedAt: input.websiteResult.observedAt || now,
        sourceUrl: input.websiteResult.identity.canonicalUrl,
        lineage: ['website-header-discovery']
      });
    }

    const canonicalBusinessName = this.buildCanonicalField<string>(
      nameAlternatives,
      'businessName',
      now,
      maxAgeDays,
      input.userOverride?.applyAsPreferred ? input.userOverride.businessName : undefined,
      (a, b) => normalizeForIdentityComparison(a) === normalizeForIdentityComparison(b)
    );

    // Field: Canonical Website
    const websiteAlternatives: FieldAlternative<string>[] = [];
    if (input.userOverride?.website) {
      websiteAlternatives.push({
        value: input.userOverride.website,
        source: 'USER_PROVIDED',
        provenance: 'USER_PROVIDED',
        observedAt: input.userOverride.providedAt || now,
        lineage: ['user-input-form']
      });
    }
    if (input.websiteResult?.identity?.canonicalUrl) {
      websiteAlternatives.push({
        value: input.websiteResult.identity.canonicalUrl,
        source: 'WEBSITE',
        provenance: 'WEBSITE_DERIVED',
        observedAt: input.websiteResult.observedAt || now,
        sourceUrl: input.websiteResult.identity.canonicalUrl,
        lineage: ['website-crawl-verification']
      });
    }
    if (input.googleCandidate?.websiteUrl) {
      websiteAlternatives.push({
        value: input.googleCandidate.websiteUrl,
        source: 'GOOGLE_MAPS',
        provenance: 'GOOGLE_DERIVED',
        observedAt: input.googleCandidate.observedAt || now,
        sourceUrl: input.googleCandidate.mapsUrl,
        lineage: ['google-maps-listing-url']
      });
    }
    if (input.metaCandidate?.pageUrl) {
      websiteAlternatives.push({
        value: input.metaCandidate.pageUrl,
        source: 'META_AD_LIBRARY',
        provenance: 'META_DERIVED',
        observedAt: input.metaCandidate.observedAt || now,
        sourceUrl: input.metaCandidate.pageUrl,
        lineage: ['meta-page-url']
      });
    }

    // Deterministic precedence for website:
    // 1. User override with applyAsPreferred
    // 2. Explicitly verified website identity from Phase 21
    const preferredWebsite = input.userOverride?.applyAsPreferred
      ? input.userOverride.website
      : (input.websiteResult?.identity?.canonicalUrl || undefined);

    const verifiedWebsite = this.buildCanonicalField<string>(
      websiteAlternatives,
      'website',
      now,
      maxAgeDays,
      preferredWebsite,
      (a, b) => {
        try {
          const uA = new URL(a.startsWith('http') ? a : 'https://' + a);
          const uB = new URL(b.startsWith('http') ? b : 'https://' + b);
          return uA.hostname.replace(/^www\./, '').toLowerCase() === uB.hostname.replace(/^www\./, '').toLowerCase();
        } catch {
          return a.toLowerCase() === b.toLowerCase();
        }
      }
    );

    // Field: Domains
    const domainSet = new Set<string>();
    if (input.websiteResult?.identity?.domain) domainSet.add(input.websiteResult.identity.domain.toLowerCase());
    if (entityGroup?.domains) entityGroup.domains.forEach(d => domainSet.add(d.toLowerCase()));
    if (input.googleCandidate?.websiteUrl) {
      try {
        const u = new URL(input.googleCandidate.websiteUrl.startsWith('http') ? input.googleCandidate.websiteUrl : 'https://' + input.googleCandidate.websiteUrl);
        domainSet.add(u.hostname.replace(/^www\./, '').toLowerCase());
      } catch {}
    }
    const domainsField = this.buildCanonicalField<string[]>(
      [{
        value: Array.from(domainSet).sort(),
        source: 'LEADNORIA',
        provenance: allProvenances.length > 1 ? 'MIXED' : (allProvenances[0] || 'LEADNORIA_DERIVED'),
        observedAt: now,
        lineage: ['domain-deduplication']
      }],
      'domains',
      now,
      maxAgeDays,
      Array.from(domainSet).sort()
    );

    // Field: Categories
    const categoryAlternatives: FieldAlternative<string[]>[] = [];
    if (input.googleCandidate?.categories && input.googleCandidate.categories.length > 0) {
      categoryAlternatives.push({
        value: [...input.googleCandidate.categories].sort(),
        source: 'GOOGLE_MAPS',
        provenance: 'GOOGLE_DERIVED',
        observedAt: input.googleCandidate.observedAt || now,
        sourceUrl: input.googleCandidate.mapsUrl,
        lineage: ['google-maps-category-list']
      });
    }
    if (input.websiteResult?.identity?.categories && input.websiteResult.identity.categories.length > 0) {
      categoryAlternatives.push({
        value: [...input.websiteResult.identity.categories].sort(),
        source: 'WEBSITE',
        provenance: 'WEBSITE_DERIVED',
        observedAt: input.websiteResult.observedAt || now,
        sourceUrl: input.websiteResult.identity?.canonicalUrl,
        lineage: ['website-identity-category-list']
      });
    }
    if ((input.metaCandidate as any)?.categories && (input.metaCandidate as any).categories.length > 0) {
      categoryAlternatives.push({
        value: [...(input.metaCandidate as any).categories].sort(),
        source: 'META_AD_LIBRARY',
        provenance: 'META_DERIVED',
        observedAt: input.metaCandidate?.observedAt || now,
        sourceUrl: input.metaCandidate?.pageUrl,
        lineage: ['meta-candidate-category-list']
      });
    }
    const mergedCategories = Array.from(
      new Set(categoryAlternatives.flatMap(a => a.value))
    ).sort();

    const categoriesField = this.buildCanonicalField<string[]>(
      categoryAlternatives.length > 0 ? categoryAlternatives : [{
        value: [],
        source: 'LEADNORIA',
        provenance: 'LEADNORIA_DERIVED',
        observedAt: now
      }],
      'categories',
      now,
      maxAgeDays,
      mergedCategories
    );

    // Field: Business Status
    const statusAlternatives: FieldAlternative<'OPERATIONAL' | 'PERMANENTLY_CLOSED' | 'TEMPORARILY_CLOSED' | 'UNKNOWN'>[] = [];
    if (input.candidates?.[0]?.businessStatus?.value?.status) {
      statusAlternatives.push({
        value: input.candidates[0].businessStatus.value.status as any,
        source: input.candidates[0].source,
        provenance: input.candidates[0].businessStatus.provenance,
        observedAt: input.candidates[0].normalizationAudit?.normalizedAt || now,
        lineage: ['candidate-business-status']
      });
    }
    const businessStatusField = this.buildCanonicalField<'OPERATIONAL' | 'PERMANENTLY_CLOSED' | 'TEMPORARILY_CLOSED' | 'UNKNOWN'>(
      statusAlternatives.length > 0 ? statusAlternatives : [{
        value: 'OPERATIONAL',
        source: 'LEADNORIA',
        provenance: 'LEADNORIA_DERIVED',
        observedAt: now
      }],
      'businessStatus',
      now,
      maxAgeDays,
      statusAlternatives.length === 1 ? statusAlternatives[0].value : undefined
    );

    // Field: Description
    const descriptionAlternatives: FieldAlternative<string>[] = [];
    if (input.websiteResult?.description?.text) {
      descriptionAlternatives.push({
        value: input.websiteResult.description.text,
        source: 'WEBSITE',
        provenance: 'WEBSITE_DERIVED',
        observedAt: input.websiteResult.observedAt || now,
        sourceUrl: input.websiteResult.identity?.canonicalUrl,
        lineage: ['website-meta-description']
      });
    }
    const descriptionField = this.buildCanonicalField<string>(
      descriptionAlternatives.length > 0 ? descriptionAlternatives : [{
        value: '',
        source: 'LEADNORIA',
        provenance: 'LEADNORIA_DERIVED',
        observedAt: now
      }],
      'description',
      now,
      maxAgeDays,
      descriptionAlternatives[0]?.value
    );

    // Field: Services & Service Areas & Business Hours
    const servicesList = (input.websiteResult?.services || []).map(s => s.name).sort();
    const servicesField = this.buildCanonicalField<string[]>(
      [{
        value: servicesList,
        source: 'WEBSITE',
        provenance: 'WEBSITE_DERIVED',
        observedAt: input.websiteResult?.observedAt || now
      }],
      'services',
      now,
      maxAgeDays,
      servicesList
    );

    const serviceAreasField = this.buildCanonicalField<string[]>(
      [{
        value: [],
        source: 'LEADNORIA',
        provenance: 'LEADNORIA_DERIVED',
        observedAt: now
      }],
      'serviceAreas',
      now,
      maxAgeDays,
      []
    );

    const hoursStr = input.websiteResult?.businessHours || '';
    const businessHoursField = this.buildCanonicalField<string>(
      [{
        value: hoursStr,
        source: 'WEBSITE',
        provenance: 'WEBSITE_DERIVED',
        observedAt: input.websiteResult?.observedAt || now
      }],
      'businessHours',
      now,
      maxAgeDays,
      hoursStr
    );

    // Location Fields
    const addressAlternatives: FieldAlternative<string>[] = [];
    if (input.userOverride?.address) {
      addressAlternatives.push({
        value: input.userOverride.address,
        source: 'USER_PROVIDED',
        provenance: 'USER_PROVIDED',
        observedAt: input.userOverride.providedAt || now
      });
    }
    if (input.googleCandidate?.address) {
      addressAlternatives.push({
        value: input.googleCandidate.address,
        source: 'GOOGLE_MAPS',
        provenance: 'GOOGLE_DERIVED',
        observedAt: input.googleCandidate.observedAt || now,
        sourceUrl: input.googleCandidate.mapsUrl
      });
    }
    if (input.websiteResult?.address) {
      const siteAddr = input.websiteResult.address.rawAddress || input.websiteResult.address.normalizedAddress;
      if (siteAddr) {
        addressAlternatives.push({
          value: siteAddr,
          source: 'WEBSITE',
          provenance: 'WEBSITE_DERIVED',
          observedAt: input.websiteResult.observedAt || now
        });
      }
    }
    if (entityGroup?.addresses) {
      entityGroup.addresses.forEach(addr => {
        addressAlternatives.push({
          value: addr,
          source: 'LEADNORIA',
          provenance: 'LEADNORIA_DERIVED',
          observedAt: entityGroup.createdAt || now
        });
      });
    }

    const preferredAddress = input.userOverride?.applyAsPreferred ? input.userOverride.address : undefined;
    const normalizedAddressField = this.buildCanonicalField<string>(
      addressAlternatives,
      'address',
      now,
      maxAgeDays,
      preferredAddress,
      (a, b) => normalizeForIdentityComparison(a) === normalizeForIdentityComparison(b)
    );

    const addressesField = this.buildCanonicalField<string[]>(
      [{
        value: Array.from(new Set(addressAlternatives.map(a => a.value))).sort(),
        source: 'LEADNORIA',
        provenance: allProvenances.length > 1 ? 'MIXED' : (allProvenances[0] || 'LEADNORIA_DERIVED'),
        observedAt: now
      }],
      'addresses',
      now,
      maxAgeDays,
      Array.from(new Set(addressAlternatives.map(a => a.value))).sort()
    );

    const cityStr = input.websiteResult?.address?.city ||
      (input.metaCandidate as any)?.city ||
      (input.candidates?.[0] as any)?.geographicObservations?.[0]?.city ||
      '';
    const cityField = this.buildCanonicalField<string>(
      [{ value: cityStr, source: 'LEADNORIA', provenance: 'LEADNORIA_DERIVED', observedAt: now }],
      'city',
      now,
      maxAgeDays,
      cityStr
    );
    const regionField = this.buildCanonicalField<string>(
      [{ value: '', source: 'LEADNORIA', provenance: 'LEADNORIA_DERIVED', observedAt: now }],
      'region',
      now,
      maxAgeDays,
      ''
    );
    const countryStr = input.websiteResult?.address?.country ||
      (input.metaCandidate as any)?.country ||
      (input.candidates?.[0] as any)?.geographicObservations?.[0]?.country ||
      '';
    const countryField = this.buildCanonicalField<string>(
      [{ value: countryStr, source: 'LEADNORIA', provenance: 'LEADNORIA_DERIVED', observedAt: now }],
      'country',
      now,
      maxAgeDays,
      countryStr
    );

    // Digital Presence Fields
    const socialFactList = (input.websiteResult?.socialProfiles || []).map(s => ({
      platform: s.platform,
      url: sanitizeUrl(s.normalizedUrl || s.rawUrl),
      handle: s.handleOrPath
    }));
    const socialProfilesField = this.buildCanonicalField<Array<{ platform: string; url: string; handle?: string }>>(
      [{
        value: socialFactList,
        source: 'WEBSITE',
        provenance: 'WEBSITE_DERIVED',
        observedAt: input.websiteResult?.observedAt || now
      }],
      'socialProfiles',
      now,
      maxAgeDays,
      socialFactList
    );

    // 7. Contacts & People Assembly (Consumes Phase 21 & Phase 22)
    const { canonicalEmails, canonicalPhones } = this.assembleContacts(
      input,
      now,
      maxAgeDays,
      policySummary
    );

    const canonicalPeople = this.assemblePeople(
      input,
      now,
      maxAgeDays,
      policySummary
    );

    // 8. Corroboration Engine (Phase 7 & Phase 23 corroboration assembly)
    const corroborations: CanonicalCorroborationItem[] = [];
    // Corroboration: Phone across Google and Website
    const googlePhone = input.googleCandidate?.phone;
    const websitePhones = (input.websiteResult?.phones || []).map(p => p.nationalFormat || p.normalizedValue || p.e164Format || p.rawValue || '');
    if (googlePhone && websitePhones.length > 0) {
      const gDigits = normalizePhoneForComparison(googlePhone);
      const matches = websitePhones.some(wp => normalizePhoneForComparison(wp) === gDigits);
      if (matches && gDigits.length >= 7) {
        corroborations.push({
          field: 'phone',
          corroboratedValue: googlePhone,
          sources: ['GOOGLE_MAPS', 'WEBSITE'],
          corroborationCount: 2,
          corroboratingReferences: [
            {
              source: 'GOOGLE_MAPS',
              observedValue: googlePhone,
              sourceUrl: input.googleCandidate?.mapsUrl,
              observedAt: input.googleCandidate?.observedAt || now
            },
            {
              source: 'WEBSITE',
              observedValue: googlePhone,
              sourceUrl: input.websiteResult?.identity?.canonicalUrl,
              observedAt: input.websiteResult?.observedAt || now
            }
          ]
        });
      }
    }

    // Corroboration: Domain / Identity across listing and crawled site
    if (input.googleCandidate?.websiteUrl && input.websiteResult?.identity?.domain) {
      try {
        const listingHost = new URL(input.googleCandidate.websiteUrl.startsWith('http') ? input.googleCandidate.websiteUrl : 'https://' + input.googleCandidate.websiteUrl).hostname.replace(/^www\./, '').toLowerCase();
        const siteDomain = input.websiteResult.identity.domain.replace(/^www\./, '').toLowerCase();
        if (listingHost === siteDomain) {
          corroborations.push({
            field: 'domain',
            corroboratedValue: siteDomain,
            sources: ['GOOGLE_MAPS', 'WEBSITE'],
            corroborationCount: 2,
            corroboratingReferences: [
              {
                source: 'GOOGLE_MAPS',
                observedValue: input.googleCandidate.websiteUrl,
                observedAt: input.googleCandidate.observedAt || now
              },
              {
                source: 'WEBSITE',
                observedValue: siteDomain,
                observedAt: input.websiteResult.observedAt || now
              }
            ]
          });
        }
      } catch {}
    }

    // Corroboration: Business Name across sources
    if (input.metaCandidate?.businessName && input.googleCandidate?.businessName) {
      if (normalizeForIdentityComparison(input.metaCandidate.businessName) === normalizeForIdentityComparison(input.googleCandidate.businessName)) {
        corroborations.push({
          field: 'businessName',
          corroboratedValue: input.metaCandidate.businessName,
          sources: ['META_AD_LIBRARY', 'GOOGLE_MAPS'],
          corroborationCount: 2,
          corroboratingReferences: [
            { source: 'META_AD_LIBRARY', observedValue: input.metaCandidate.businessName, observedAt: input.metaCandidate.observedAt || now },
            { source: 'GOOGLE_MAPS', observedValue: input.googleCandidate.businessName, observedAt: input.googleCandidate.observedAt || now }
          ]
        });
      }
    }

    // 9. All Field Conflicts
    const allConflicts: CanonicalFieldConflict[] = [
      ...canonicalBusinessName.conflicts,
      ...verifiedWebsite.conflicts,
      ...normalizedAddressField.conflicts,
      ...canonicalPhones.flatMap(p => p.conflicts),
      ...canonicalEmails.flatMap(e => e.conflicts)
    ];

    // 10. Qualification Attachment (Phase 23 Zero Recalculation)
    const qDecision = input.qualificationDecision;
    const qualificationAttachment = {
      qualificationDecision: qDecision,
      qualificationProfileId: qDecision?.profileId,
      reasonGraph: qDecision?.reasonGraph,
      finalState: qDecision?.status,
      blockingCriteria: qDecision?.blockingReasons || [],
      contradictoryCriteria: qDecision?.contradictionReasons || [],
      explanation: qDecision?.reasonGraph?.primaryRationale || qDecision?.reasonGraph?.summaryText || ''
    };

    // 11. Compact Evidence Pack Construction
    const evidencePack = this.buildCompactEvidencePack(
      entityId,
      input,
      allConflicts,
      corroborations,
      now
    );

    // 12. Quality Metrics Summary
    const quality = this.computeQualitySummary(
      canonicalBusinessName,
      verifiedWebsite,
      normalizedAddressField,
      canonicalEmails,
      canonicalPhones,
      canonicalPeople,
      corroborations,
      allConflicts
    );

    // 13. Entity Type & Branch Separation (Phase 8 authority)
    let entityType: 'LOCAL_BUSINESS' | 'PARENT_ORGANIZATION' | 'BRANCH' | 'ONLINE_BUSINESS' | 'GENERAL_BUSINESS' = 'LOCAL_BUSINESS';
    let branchRelationship = undefined;

    if (entityGroup) {
      const hasBranches = (entityGroup.branchEntityIds || []).length > 0;
      const isBranch = Boolean(entityGroup.parentEntityId);

      if (hasBranches) {
        entityType = 'PARENT_ORGANIZATION';
      } else if (isBranch) {
        entityType = 'BRANCH';
      }

      branchRelationship = {
        isBranch,
        isParent: hasBranches,
        parentEntityId: entityGroup.parentEntityId,
        branchEntityIds: [...(entityGroup.branchEntityIds || [])].sort(),
        branchSignals: (entityGroup.branchSignals || []).map(b => ({ type: b.type, token: b.token }))
      };
    }

    const cmsVal = (input.websiteResult?.technologySignals || []).find(t => t.category === 'CMS')?.name;

    // Final Assembled Canonical Lead Record
    return {
      schemaVersion: CURRENT_LEAD_RECORD_SCHEMA_VERSION,
      canonicalEntityId: entityId,
      canonicalBusinessName,
      aliases: [...(entityGroup?.aliases || [])].sort(),
      entityType,
      branchRelationship,
      business: {
        categories: categoriesField,
        businessStatus: businessStatusField,
        description: descriptionField,
        services: servicesField,
        serviceAreas: serviceAreasField,
        businessHours: businessHoursField
      },
      location: {
        addresses: addressesField,
        normalizedAddress: normalizedAddressField,
        city: cityField,
        region: regionField,
        country: countryField,
        latitude: undefined,
        longitude: undefined
      },
      digital: {
        verifiedWebsite,
        domains: domainsField,
        socialProfiles: socialProfilesField,
        cms: cmsVal,
        technologySignals: input.websiteResult?.technologySignals || [],
        booking: (input.websiteResult?.technologySignals || []).some(t => t.category === 'BOOKING'),
        ecommerce: (input.websiteResult?.technologySignals || []).some(t => t.category === 'ECOMMERCE'),
        chat: (input.websiteResult?.technologySignals || []).some(t => t.category === 'CHAT_WIDGET'),
        analytics: (input.websiteResult?.technologySignals || []).filter(t => t.category === 'ANALYTICS').map(t => t.name).sort()
      },
      contacts: {
        emails: canonicalEmails,
        phones: canonicalPhones,
        contactForms: (input.websiteResult?.contactForms || []).map(f => f.formAction || f.pageUrl).filter(Boolean).sort()
      },
      people: {
        publicPeople: canonicalPeople,
        titles: Array.from(new Set(canonicalPeople.flatMap(p => p.titles))).sort(),
        personContactAssociations: canonicalPeople.flatMap(p =>
          p.emails.map(email => ({
            personName: p.name,
            email,
            associationStrength: 'DIRECT_LINK' as const
          }))
        )
      },
      sourceSignals,
      evidence: {
        sourceContributions: [
          ...(entityGroup?.sourceContributions || []),
          ...(input.candidates?.[0]?.sourceContributions || [])
        ],
        evidenceReferences: evidencePack.items,
        conflicts: allConflicts,
        corroborations,
        evidencePack
      },
      qualification: qualificationAttachment,
      freshness: freshnessModel,
      quality,
      policy: policySummary,
      createdAt: firstObservedAt,
      updatedAt: lastObservedAt
    };
  }

  /**
   * Builds a CanonicalField<T> with explicit alternative lineage, conflict detection,
   * and deterministic precedence semantics.
   */
  private buildCanonicalField<T>(
    alternatives: FieldAlternative<T>[],
    fieldName: string,
    now: string,
    maxAgeDays: number,
    policyPreferredValue?: T,
    equalityFn: (a: T, b: T) => boolean = (a, b) => a === b
  ): CanonicalField<T> {
    if (alternatives.length === 0) {
      return {
        value: undefined as any,
        preferredObservedValue: undefined,
        hasConflict: false,
        alternatives: [],
        conflicts: [],
        corroboratedBySources: [],
        corroborationCount: 0,
        provenance: 'LEADNORIA_DERIVED',
        sourceContributions: [],
        firstObservedAt: now,
        lastObservedAt: now,
        freshnessState: 'UNKNOWN',
        changeState: 'UNKNOWN'
      };
    }

    // Collect distinct values to detect conflict
    const distinctAlternatives: FieldAlternative<T>[] = [];
    for (const alt of alternatives) {
      if (!distinctAlternatives.some(da => equalityFn(da.value, alt.value))) {
        distinctAlternatives.push(alt);
      }
    }

    const hasConflict = distinctAlternatives.length > 1;
    const conflicts: CanonicalFieldConflict[] = [];

    if (hasConflict) {
      conflicts.push({
        field: fieldName,
        conflictingValues: distinctAlternatives.map(da => ({
          value: da.value,
          source: String(da.source),
          provenance: da.provenance,
          observedAt: da.observedAt,
          sourceUrl: da.sourceUrl
        })),
        reason: `Conflicting observations across sources for '${fieldName}' without identical matching values.`
      });
    }

    // Deterministic Precedence Rule:
    // If a policyPreferredValue is provided (e.g. from user override or verified website), use it.
    // Otherwise, if all observations agree (distinctAlternatives.length === 1), that is preferred.
    // If conflicting and NO policy applies: preferredObservedValue MUST be undefined!
    let preferredObservedValue: T | undefined = undefined;
    if (policyPreferredValue !== undefined) {
      preferredObservedValue = policyPreferredValue;
    } else if (distinctAlternatives.length === 1) {
      preferredObservedValue = distinctAlternatives[0].value;
    } else {
      preferredObservedValue = undefined; // Strictly undefined when unresolved conflict exists
    }

    const value = preferredObservedValue !== undefined ? preferredObservedValue : alternatives[0].value;

    const sources = Array.from(new Set(alternatives.map(a => a.source as SourceType)));
    const provenances = Array.from(new Set(alternatives.map(a => a.provenance)));
    const timestamps = alternatives.map(a => a.observedAt).sort();
    const firstObservedAt = timestamps[0] || now;
    const lastObservedAt = timestamps[timestamps.length - 1] || now;

    return {
      value,
      preferredObservedValue,
      hasConflict,
      alternatives,
      conflicts,
      corroboratedBySources: sources,
      corroborationCount: sources.length,
      provenance: provenances.length > 1 ? 'MIXED' : (provenances[0] || 'LEADNORIA_DERIVED'),
      sourceContributions: alternatives.map(a => ({
        source: a.source as SourceType,
        provenance: a.provenance,
        fieldName,
        acquisitionContext: 'LEADNORIA_INTERNAL',
        restrictionBasis: a.provenance === 'GOOGLE_DERIVED' ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' : 'NONE',
        isRestricted: a.provenance === 'GOOGLE_DERIVED'
      })),
      firstObservedAt,
      lastObservedAt,
      freshnessState: this.computeFreshnessState(lastObservedAt, now, maxAgeDays),
      changeState: 'OBSERVED'
    };
  }

  /**
   * Assembles canonical contacts, preserving field-level provenance and restrictions.
   */
  private assembleContacts(
    input: CanonicalAssemblyInput,
    now: string,
    maxAgeDays: number,
    globalPolicy: CanonicalPolicySummary
  ): {
    canonicalEmails: CanonicalLeadContact[];
    canonicalPhones: CanonicalLeadContact[];
  } {
    const canonicalEmails: CanonicalLeadContact[] = [];
    const canonicalPhones: CanonicalLeadContact[] = [];

    // 1. Phones from Google Candidate (Restricted by nature)
    if (input.googleCandidate?.phone) {
      const rawGPhone = input.googleCandidate.phone;
      const gDigits = normalizePhoneForComparison(rawGPhone);
      canonicalPhones.push({
        type: 'PHONE',
        value: rawGPhone,
        normalizedValue: gDigits,
        preferredObservedValue: rawGPhone,
        hasConflict: false,
        alternatives: [{
          value: rawGPhone,
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          observedAt: input.googleCandidate.observedAt || now,
          sourceUrl: input.googleCandidate.mapsUrl,
          lineage: ['google-maps-raw-phone']
        }],
        conflicts: [],
        isCorroborated: false,
        corroboratedBySources: ['GOOGLE_MAPS'],
        corroborationCount: 1,
        provenance: 'GOOGLE_DERIVED',
        sourceContributions: [{
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          fieldName: 'phone',
          acquisitionContext: 'GOOGLE_CONSUMER_WEB',
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          isRestricted: true
        }],
        firstObservedAt: input.googleCandidate.observedAt || now,
        lastObservedAt: input.googleCandidate.observedAt || now,
        freshnessState: this.computeFreshnessState(input.googleCandidate.observedAt, now, maxAgeDays),
        changeState: 'OBSERVED',
        isRestricted: true,
        exportEligible: false,
        persistenceEligible: false,
        associatedPersonNames: []
      });
    }

    // 2. Phones from Website (Phase 21 & Phase 22)
    const websitePhones = [
      ...(input.contactResult?.contacts || []).filter(c => c.contactType === 'PHONE'),
      ...((input.websiteResult?.phones || []).map(p => ({
        rawValue: p.rawValue,
        normalizedValue: p.normalizedValue || p.rawValue,
        firstObservedAt: input.websiteResult?.observedAt || now,
        lastObservedAt: input.websiteResult?.observedAt || now,
        associatedPersonIds: []
      })))
    ];

    for (const wp of websitePhones) {
      const phoneVal = wp.rawValue || wp.normalizedValue;
      const digits = normalizePhoneForComparison(wp.normalizedValue || wp.rawValue);
      // Check if matches an existing Google phone for corroboration
      const existingGooglePhone = canonicalPhones.find(p => p.normalizedValue === digits);
      if (existingGooglePhone) {
        existingGooglePhone.isCorroborated = true;
        if (!existingGooglePhone.corroboratedBySources.includes('WEBSITE')) {
          existingGooglePhone.corroboratedBySources.push('WEBSITE');
          existingGooglePhone.corroborationCount = existingGooglePhone.corroboratedBySources.length;
        }
        existingGooglePhone.alternatives.push({
          value: phoneVal,
          source: 'WEBSITE',
          provenance: 'WEBSITE_DERIVED',
          observedAt: wp.lastObservedAt || now,
          lineage: ['website-contact-fact']
        });
      } else {
        canonicalPhones.push({
          type: 'PHONE',
          value: phoneVal,
          normalizedValue: digits,
          preferredObservedValue: phoneVal,
          hasConflict: false,
          alternatives: [{
            value: phoneVal,
            source: 'WEBSITE',
            provenance: 'WEBSITE_DERIVED',
            observedAt: wp.lastObservedAt || now,
            lineage: ['website-contact-fact']
          }],
          conflicts: [],
          isCorroborated: false,
          corroboratedBySources: ['WEBSITE'],
          corroborationCount: 1,
          provenance: 'WEBSITE_DERIVED',
          sourceContributions: [{
            source: 'WEBSITE',
            provenance: 'WEBSITE_DERIVED',
            fieldName: 'phone',
            acquisitionContext: 'WEBSITE_DIRECT',
            restrictionBasis: 'NONE',
            isRestricted: false
          }],
          firstObservedAt: wp.firstObservedAt || now,
          lastObservedAt: wp.lastObservedAt || now,
          freshnessState: this.computeFreshnessState(wp.lastObservedAt, now, maxAgeDays),
          changeState: 'OBSERVED',
          isRestricted: false,
          exportEligible: true,
          persistenceEligible: true,
          associatedPersonNames: wp.associatedPersonIds || []
        });
      }
    }

    // 3. User Override Phone
    if (input.userOverride?.phone) {
      const userPhone = input.userOverride.phone;
      const uDigits = normalizePhoneForComparison(userPhone);
      canonicalPhones.unshift({
        type: 'PHONE',
        value: userPhone,
        normalizedValue: uDigits,
        preferredObservedValue: userPhone,
        hasConflict: false,
        alternatives: [{
          value: userPhone,
          source: 'USER_PROVIDED',
          provenance: 'USER_PROVIDED',
          observedAt: input.userOverride.providedAt || now,
          lineage: ['user-override']
        }],
        conflicts: [],
        isCorroborated: false,
        corroboratedBySources: ['USER_PROVIDED'],
        corroborationCount: 1,
        provenance: 'USER_PROVIDED',
        sourceContributions: [{
          source: 'USER_PROVIDED',
          provenance: 'USER_PROVIDED',
          fieldName: 'phone',
          acquisitionContext: 'USER_INPUT',
          restrictionBasis: 'NONE',
          isRestricted: false
        }],
        firstObservedAt: input.userOverride.providedAt || now,
        lastObservedAt: input.userOverride.providedAt || now,
        freshnessState: 'CURRENT',
        changeState: 'OBSERVED',
        isRestricted: false,
        exportEligible: true,
        persistenceEligible: true,
        associatedPersonNames: []
      });
    }

    // 4. Emails from Website / Phase 22
    const websiteEmails = [
      ...(input.contactResult?.contacts || []).filter(c => c.contactType === 'EMAIL'),
      ...((input.websiteResult?.emails || []).map(e => ({
        rawValue: e.rawValue,
        normalizedValue: e.normalizedEmail || e.rawValue,
        firstObservedAt: input.websiteResult?.observedAt || now,
        lastObservedAt: input.websiteResult?.observedAt || now
      })))
    ];
    for (const we of websiteEmails) {
      const emailVal = we.rawValue || we.normalizedValue;
      canonicalEmails.push({
        type: 'EMAIL',
        value: emailVal,
        normalizedValue: emailVal.toLowerCase().trim(),
        preferredObservedValue: emailVal,
        hasConflict: false,
        alternatives: [{
          value: emailVal,
          source: 'WEBSITE',
          provenance: 'WEBSITE_DERIVED',
          observedAt: we.lastObservedAt || now,
          lineage: ['website-contact-discovery']
        }],
        conflicts: [],
        isCorroborated: false,
        corroboratedBySources: ['WEBSITE'],
        corroborationCount: 1,
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [{
          source: 'WEBSITE',
          provenance: 'WEBSITE_DERIVED',
          fieldName: 'email',
          acquisitionContext: 'WEBSITE_DIRECT',
          restrictionBasis: 'NONE',
          isRestricted: false
        }],
        firstObservedAt: we.firstObservedAt || now,
        lastObservedAt: we.lastObservedAt || now,
        freshnessState: this.computeFreshnessState(we.lastObservedAt, now, maxAgeDays),
        changeState: 'OBSERVED',
        isRestricted: false,
        exportEligible: true,
        persistenceEligible: true,
        category: (we as any).emailClassification === 'ROLE_ACCOUNT' ? 'OPERATIONAL_ROLE' : ((we as any).emailClassification === 'PERSON_NAMED' ? 'NAMED_INDIVIDUAL' : 'GENERAL_INQUIRY'),
        associatedPersonNames: (we as any).associatedPersonIds || []
      });
    }

    // 5. User Override Email
    if (input.userOverride?.email) {
      const uEmail = input.userOverride.email;
      canonicalEmails.unshift({
        type: 'EMAIL',
        value: uEmail,
        normalizedValue: uEmail.toLowerCase().trim(),
        preferredObservedValue: uEmail,
        hasConflict: false,
        alternatives: [{
          value: uEmail,
          source: 'USER_PROVIDED',
          provenance: 'USER_PROVIDED',
          observedAt: input.userOverride.providedAt || now,
          lineage: ['user-override']
        }],
        conflicts: [],
        isCorroborated: false,
        corroboratedBySources: ['USER_PROVIDED'],
        corroborationCount: 1,
        provenance: 'USER_PROVIDED',
        sourceContributions: [{
          source: 'USER_PROVIDED',
          provenance: 'USER_PROVIDED',
          fieldName: 'email',
          acquisitionContext: 'USER_INPUT',
          restrictionBasis: 'NONE',
          isRestricted: false
        }],
        firstObservedAt: input.userOverride.providedAt || now,
        lastObservedAt: input.userOverride.providedAt || now,
        freshnessState: 'CURRENT',
        changeState: 'OBSERVED',
        isRestricted: false,
        exportEligible: true,
        persistenceEligible: true,
        associatedPersonNames: []
      });
    }

    // 6. Detect phone/email conflicts across different values
    if (canonicalPhones.length > 1) {
      const uniqueDigits = Array.from(new Set(canonicalPhones.map(p => p.normalizedValue)));
      if (uniqueDigits.length > 1) {
        const conflictRecord: CanonicalFieldConflict = {
          field: 'phone',
          conflictingValues: canonicalPhones.map(p => ({
            value: p.value,
            source: String(p.alternatives[0]?.source || 'UNKNOWN'),
            provenance: p.provenance,
            observedAt: p.lastObservedAt
          })),
          reason: 'Multiple conflicting phone numbers discovered across active sources.'
        };
        for (const p of canonicalPhones) {
          p.hasConflict = true;
          p.conflicts.push(conflictRecord);
          // If no user override, clear preferredObservedValue
          if (!input.userOverride?.applyAsPreferred) {
            p.preferredObservedValue = undefined;
          }
        }
      }
    }

    // 7. Check for Change States against Previous Snapshot
    if (input.previousSnapshot) {
      this.reconcileContactChanges(canonicalPhones, input.previousSnapshot.contacts.phones);
      this.reconcileContactChanges(canonicalEmails, input.previousSnapshot.contacts.emails);
    }

    return {
      canonicalEmails,
      canonicalPhones
    };
  }

  /**
   * Reconciles contacts against a previous snapshot to tag new, changed, or stale states.
   */
  private reconcileContactChanges(
    currentContacts: CanonicalLeadContact[],
    previousContacts: CanonicalLeadContact[]
  ): void {
    const prevMap = new Map<string, CanonicalLeadContact>();
    for (const p of previousContacts) {
      prevMap.set(p.normalizedValue, p);
    }

    for (const c of currentContacts) {
      const prev = prevMap.get(c.normalizedValue);
      if (!prev) {
        c.changeState = 'OBSERVED'; // New observation
      } else {
        if (prev.value !== c.value) {
          c.changeState = 'CHANGED';
        } else {
          c.changeState = 'OBSERVED';
        }
      }
    }

    // Carry over previous observations not seen in current run as NOT_OBSERVED_THIS_RUN
    const currentValues = new Set(currentContacts.map(c => c.normalizedValue));
    for (const prev of previousContacts) {
      if (!currentValues.has(prev.normalizedValue)) {
        currentContacts.push({
          ...prev,
          changeState: 'NOT_OBSERVED_THIS_RUN',
          freshnessState: 'STALE'
        });
      }
    }
  }

  /**
   * Assembles canonical people records from Phase 22 ContactIntelligenceResult.
   */
  private assemblePeople(
    input: CanonicalAssemblyInput,
    now: string,
    maxAgeDays: number,
    globalPolicy: CanonicalPolicySummary
  ): CanonicalLeadPerson[] {
    const peopleList: CanonicalLeadPerson[] = [];
    const sourcePeople = input.contactResult?.people || [];

    for (const sp of sourcePeople) {
      peopleList.push({
        personId: sp.personId,
        name: sp.fullName,
        canonicalName: sp.normalizedName,
        titles: sp.jobTitle ? [sp.jobTitle] : [],
        emails: [...(sp.emailRefs || [])],
        phones: [...(sp.phoneRefs || [])],
        linkedInUrl: undefined,
        socialUrls: (sp.socialRefs || []).map(sanitizeUrl).filter(Boolean).sort(),
        provenance: sp.provenance || 'WEBSITE_DERIVED',
        sourceContributions: [...(sp.sourceContributions || [])],
        firstObservedAt: sp.firstObservedAt || now,
        lastObservedAt: sp.lastObservedAt || now,
        freshnessState: this.computeFreshnessState(sp.lastObservedAt, now, maxAgeDays),
        changeState: 'OBSERVED',
        isRestricted: false,
        exportEligible: true,
        persistenceEligible: true
      });
    }

    // Check against previous snapshot for removed / changed people
    if (input.previousSnapshot?.people?.publicPeople) {
      const currentIds = new Set(peopleList.map(p => p.personId));
      for (const prevPerson of input.previousSnapshot.people.publicPeople) {
        if (!currentIds.has(prevPerson.personId)) {
          peopleList.push({
            ...prevPerson,
            changeState: 'NOT_OBSERVED_THIS_RUN',
            freshnessState: 'STALE'
          });
        }
      }
    }

    return peopleList.sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));
  }

  /**
   * Constructs a compact, bounded evidence pack without storing raw HTML or dumps.
   */
  private buildCompactEvidencePack(
    entityId: string,
    input: CanonicalAssemblyInput,
    conflicts: CanonicalFieldConflict[],
    corroborations: CanonicalCorroborationItem[],
    now: string
  ): CanonicalEvidencePack {
    const items: CompactEvidenceItem[] = [];
    const sourceUrls: string[] = [];
    const sourceTypes: SourceType[] = [];

    const addSource = (st: SourceType, url?: string) => {
      if (!sourceTypes.includes(st)) sourceTypes.push(st);
      if (url && !sourceUrls.includes(url)) sourceUrls.push(url);
    };

    if (input.googleCandidate) {
      addSource('GOOGLE_MAPS', input.googleCandidate.mapsUrl);
      items.push({
        evidenceId: `ev_google_${entityId}`,
        sourceType: 'GOOGLE_MAPS',
        factType: 'BUSINESS_LISTING',
        factSummary: `Google listing observed: ${input.googleCandidate.businessName || ''}`,
        sourceUrl: input.googleCandidate.mapsUrl,
        observedAt: input.googleCandidate.observedAt || now,
        provenance: 'GOOGLE_DERIVED',
        isRestricted: true,
        fieldReferences: ['businessName', 'address', 'phone', 'website']
      });
    }

    if (input.metaCandidate) {
      addSource('META_AD_LIBRARY', input.metaCandidate.pageUrl);
      items.push({
        evidenceId: `ev_meta_${entityId}`,
        sourceType: 'META_AD_LIBRARY',
        factType: 'ADVERTISING_SIGNAL',
        factSummary: `Meta Ad Library observation with ${input.metaCandidate.adCount ?? 0} active ads`,
        sourceUrl: input.metaCandidate.pageUrl,
        observedAt: input.metaCandidate.observedAt || now,
        provenance: 'META_DERIVED',
        isRestricted: false,
        fieldReferences: ['businessName', 'pageUrl']
      });
    }

    if (input.websiteResult) {
      addSource('WEBSITE', input.websiteResult.identity?.canonicalUrl);
      const pagesCount = input.websiteResult.crawlStats?.pagesVisited?.length || input.websiteResult.crawlStats?.pagesDiscovered || 1;
      items.push({
        evidenceId: `ev_web_${entityId}`,
        sourceType: 'WEBSITE',
        factType: 'WEBSITE_INTELLIGENCE',
        factSummary: `Website crawl: ${input.websiteResult.identity?.domain || ''}, ${pagesCount} pages verified`,
        sourceUrl: input.websiteResult.identity?.canonicalUrl,
        observedAt: input.websiteResult.observedAt || now,
        provenance: 'WEBSITE_DERIVED',
        isRestricted: false,
        fieldReferences: ['website', 'email', 'phone', 'services', 'socialProfiles']
      });
    }

    return {
      totalEvidenceCount: items.length,
      items,
      sourceUrls,
      sourceTypes,
      conflictCount: conflicts.length,
      corroborationCount: corroborations.length,
      entityResolutionId: entityId,
      qualificationProfileId: input.qualificationDecision?.profileId
    };
  }

  /**
   * Computes deterministic, descriptive completeness metrics (0.0 - 1.0).
   * Strictly no AI scoring, buyer scores, or intent probabilities.
   */
  private computeQualitySummary(
    businessName: CanonicalField<string>,
    website: CanonicalField<string>,
    address: CanonicalField<string>,
    emails: CanonicalLeadContact[],
    phones: CanonicalLeadContact[],
    people: CanonicalLeadPerson[],
    corroborations: CanonicalCorroborationItem[],
    conflicts: CanonicalFieldConflict[]
  ): QualitySummary {
    // Identity Completeness: name (0.4) + website/domain (0.3) + address/locality (0.3)
    let identityScore = 0;
    if (businessName.value) identityScore += 0.4;
    if (website.value) identityScore += 0.3;
    if (address.value) identityScore += 0.3;

    // Business Completeness
    const businessScore = (businessName.value ? 0.5 : 0) + (address.value ? 0.5 : 0);

    // Contact Completeness: email (0.4) + phone (0.4) + multiple (0.2)
    let contactScore = 0;
    if (emails.length > 0) contactScore += 0.4;
    if (phones.length > 0) contactScore += 0.4;
    if (emails.length + phones.length > 2) contactScore += 0.2;

    // Website Completeness
    const websiteScore = website.value ? 1.0 : 0.0;

    // Public Person Completeness
    let personScore = 0;
    if (people.length > 0) personScore += 0.5;
    if (people.some(p => p.titles.length > 0)) personScore += 0.25;
    if (people.some(p => p.emails.length > 0 || p.phones.length > 0)) personScore += 0.25;

    // Evidence Coverage
    const coverageScore = corroborations.length > 0 ? Math.min(1.0, 0.4 + corroborations.length * 0.3) : 0.4;

    return {
      identityCompleteness: Number(identityScore.toFixed(2)),
      businessCompleteness: Number(businessScore.toFixed(2)),
      contactCompleteness: Number(contactScore.toFixed(2)),
      websiteCompleteness: Number(websiteScore.toFixed(2)),
      evidenceCoverage: Number(coverageScore.toFixed(2)),
      publicPersonCompleteness: Number(personScore.toFixed(2)),
      contradictionCount: conflicts.length,
      corroborationCount: corroborations.length
    };
  }

  /**
   * Helper to compute freshness state based on maximum age days.
   */
  private computeFreshnessState(timestamp?: string, now = new Date().toISOString(), maxAgeDays = 90): FreshnessState {
    if (!timestamp) return 'UNKNOWN';
    try {
      const ts = new Date(timestamp).getTime();
      const current = new Date(now).getTime();
      if (isNaN(ts) || isNaN(current)) return 'UNKNOWN';
      const ageDays = (current - ts) / (1000 * 60 * 60 * 24);
      return ageDays <= maxAgeDays ? 'CURRENT' : 'STALE';
    } catch {
      return 'UNKNOWN';
    }
  }

  /**
   * Converts a CanonicalLeadRecord into a UnifiedResearchRecord for Phase 16 ExportPolicy evaluation.
   */
  public toUnifiedResearchRecord(record: CanonicalLeadRecord): UnifiedResearchRecord {
    const isRestricted = record.policy.isRestricted;
    const persistenceEligible = record.policy.persistenceEligible;
    const exportEligible = record.policy.exportEligible;

    const sourceRecords: SourceRecordKey[] = [];
    if (record.sourceSignals.googleEvidence) {
      sourceRecords.push({
        sourceType: 'GOOGLE_MAPS',
        sourceNamespace: 'google',
        sourceRecordId: record.sourceSignals.googleEvidence.placeId || record.canonicalEntityId
      });
    }
    if (record.sourceSignals.metaEvidence) {
      sourceRecords.push({
        sourceType: 'META_AD_LIBRARY',
        sourceNamespace: 'meta',
        sourceRecordId: record.sourceSignals.metaEvidence.pageId || record.canonicalEntityId
      });
    }
    if (record.sourceSignals.websiteEvidence) {
      sourceRecords.push({
        sourceType: 'WEBSITE',
        sourceNamespace: 'website',
        sourceRecordId: record.sourceSignals.websiteEvidence.domain
      });
    }
    if (sourceRecords.length === 0) {
      sourceRecords.push({
        sourceType: 'USER_PROVIDED',
        sourceNamespace: 'user',
        sourceRecordId: record.canonicalEntityId
      });
    }

    const fieldEligibility: Record<string, FieldEligibility> = {
      businessName: {
        isEligible: !isRestricted,
        sourceProvenance: record.canonicalBusinessName.provenance,
        restrictionBasis: isRestricted ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' : undefined
      },
      website: {
        isEligible: !isRestricted,
        sourceProvenance: record.digital.verifiedWebsite.provenance,
        restrictionBasis: isRestricted ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' : undefined
      },
      phone: {
        isEligible: !isRestricted,
        sourceProvenance: record.contacts.phones[0]?.provenance || 'LEADNORIA_DERIVED',
        restrictionBasis: isRestricted ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' : undefined
      },
      email: {
        isEligible: !isRestricted,
        sourceProvenance: record.contacts.emails[0]?.provenance || 'WEBSITE_DERIVED',
        restrictionBasis: isRestricted ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' : undefined
      },
      address: {
        isEligible: !isRestricted,
        sourceProvenance: record.location.normalizedAddress.provenance,
        restrictionBasis: isRestricted ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' : undefined
      }
    };

    const restrictions: CandidateRestrictions = {
      isRestricted,
      persistenceEligible,
      exportEligible,
      displayEligible: true,
      qualificationEligible: true,
      restrictionBasis: record.policy.restrictionBasis
    };

    const validPipelineSources: PipelineSourceType[] = record.evidence.evidencePack.sourceTypes
      .filter((s): s is PipelineSourceType => s !== 'LEADNORIA');

    return {
      recordId: `rec_${record.canonicalEntityId}`,
      entityId: record.canonicalEntityId,
      canonicalDisplayName: record.canonicalBusinessName.value || '',
      sourceRecords,
      primarySource: sourceRecords[0]?.sourceType || 'USER_PROVIDED',
      sourceContributions: record.evidence.sourceContributions,
      provenance: record.policy.overallProvenance,
      restrictions,
      fieldEligibility,
      corroborationSources: validPipelineSources,
      corroborationCount: record.evidence.corroborations.length,
      stageStates: {
        SOURCE_PLANNING: 'COMPLETED',
        SOURCE_EXECUTION: 'COMPLETED',
        NORMALIZATION: 'COMPLETED',
        ENTITY_RESOLUTION: 'COMPLETED',
        EVIDENCE: 'COMPLETED',
        RELEVANCE: 'COMPLETED',
        WEBSITE_VERIFICATION: 'COMPLETED',
        CONTACT_ENRICHMENT: 'COMPLETED',
        QUALIFICATION: 'COMPLETED',
        GEOGRAPHIC_ACCOUNTING: 'COMPLETED',
        PERSISTENCE: persistenceEligible ? 'COMPLETED' : 'BLOCKED',
        EXPORT: exportEligible ? 'COMPLETED' : 'BLOCKED'
      },
      evidence: record.evidence.evidenceReferences,
      qualificationDecision: record.qualification.qualificationDecision,
      qualificationState: record.qualification.finalState as any,
      geographicObservations: [],
      diagnostics: {
        warnings: [],
        errors: [],
        notes: []
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  /**
   * Evaluates export eligibility for a CanonicalLeadRecord using the existing Phase 16 ExportPolicy.
   */
  public evaluateExport(record: CanonicalLeadRecord): RecordExportEvaluation {
    const unifiedRecord = this.toUnifiedResearchRecord(record);
    return this.exportPolicy.evaluateRecord(unifiedRecord);
  }

  /**
   * Projects a CanonicalLeadRecord to export projection using the existing Phase 16 ExportProjection.
   */
  public projectExport(record: CanonicalLeadRecord, evaluation?: RecordExportEvaluation): ExportRecordProjection | null {
    const unifiedRecord = this.toUnifiedResearchRecord(record);
    const evalResult = evaluation || this.exportPolicy.evaluateRecord(unifiedRecord);
    return this.exportProjection.projectRecord(unifiedRecord, evalResult);
  }
}
