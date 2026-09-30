/**
 * Contact & Digital Presence Enrichment Orchestrator (Phase 11)
 *
 * Implements deterministic public business contact enrichment from target websites.
 * Reuses bounded crawling parameters (max 5 pages, 10s page timeout, 30s domain timeout),
 * strictly enforces source lineage invariants, prevents data laundering,
 * and yields comprehensive, auditable field-level evidence.
 */

import type {
  ContactEnrichmentResult,
  ContactEnrichmentStatus,
  BusinessPhoneFact,
  BusinessEmailFact,
  BusinessLocationFact,
  DigitalPresenceFact,
  ContactFormFact,
  BusinessNameFact,
  ContactEvidenceItem
} from './contactTypes.ts';
import type {
  SourceContribution,
  ProvenanceType,
  PolicyRestrictionBasis,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus
} from '../extraction/types.ts';
import { normalizeWebsiteUrl, isSameOriginUrl } from '../websiteUrlNormalizer.ts';
import { extractContactsFromHtmlPage } from './contactExtractor.ts';
import { extractDigitalPresenceFromHtml } from './digitalPresenceExtractor.ts';
import {
  deduplicatePhones,
  deduplicateEmails,
  deduplicateSocialProfiles,
  deduplicateLocations,
  deduplicateContactForms,
  deduplicateBusinessNames
} from './contactDeduper.ts';
import { deduplicateEvidence } from './contactEvidence.ts';
import { sanitizeWebText } from './contactNormalizer.ts';

// Bounded Crawl Constraints (Phase 6 / Phase 11 Frozen Limits)
export const ENRICHMENT_MAX_PAGES = 5;
export const ENRICHMENT_PAGE_TIMEOUT_MS = 10000; // 10s
export const ENRICHMENT_DOMAIN_TIMEOUT_MS = 30000; // 30s
export const ENRICHMENT_CACHE_TTL_MS = 86400000; // 24h

// In-memory cache for test harnesses & runtime deduplication
const enrichmentMemoryCache = new Map<string, { result: ContactEnrichmentResult; expiresAt: number }>();

export interface ContactEnrichmentInput {
  entityId: string;
  websiteUrl: string;
  canonicalDisplayName?: string;
  sourceContributions?: SourceContribution[];
  derivedFrom?: string[];
  countryHint?: string;
  timestamp?: string;
  skipCache?: boolean;
}

export type CustomFetchFn = (url: string, timeoutMs: number) => Promise<{ status: number; html: string }>;

/**
 * Deterministically prioritizes discovered same-origin pages for contact discovery.
 */
export function prioritizeContactPages(rootUrl: string, candidateLinks: string[]): string[] {
  const queue: string[] = [rootUrl];
  const cleanRootKey = rootUrl.toLowerCase().replace(/\/$/, '');

  const priorityGroups = [
    // 1. Direct contact pages
    ['contact', 'contact-us', 'contactus', 'reach-us', 'get-in-touch', 'touch'],
    // 2. Physical locations & branches
    ['location', 'locations', 'find-us', 'our-locations', 'branches', 'stores', 'where-to-find-us'],
    // 3. About & Corporate identity
    ['about', 'about-us', 'company', 'who-we-are', 'our-story', 'headquarters']
  ];

  for (const group of priorityGroups) {
    for (const link of candidateLinks) {
      if (queue.length >= ENRICHMENT_MAX_PAGES) break;
      const lower = link.toLowerCase();
      const cleanLinkKey = lower.replace(/\/$/, '');
      if (cleanLinkKey !== cleanRootKey && !queue.includes(link) && group.some(kw => lower.includes(kw))) {
        queue.push(link);
      }
    }
  }

  // Fill remainder up to ENRICHMENT_MAX_PAGES
  for (const link of candidateLinks) {
    if (queue.length >= ENRICHMENT_MAX_PAGES) break;
    const cleanLinkKey = link.toLowerCase().replace(/\/$/, '');
    if (cleanLinkKey !== cleanRootKey && !queue.includes(link)) {
      queue.push(link);
    }
  }

  return queue.slice(0, ENRICHMENT_MAX_PAGES);
}

/**
 * Extracts candidate links on the same origin from page HTML.
 */
function extractSameOriginLinks(html: string, pageUrl: string): string[] {
  const links: string[] = [];
  let currentOrigin: string;
  try {
    currentOrigin = new URL(pageUrl).origin;
  } catch {
    return [];
  }

  const anchorRegex = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  const matches = (html || '').matchAll(anchorRegex);

  for (const m of matches) {
    const href = (m[1] || '').trim();
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }
    try {
      const absUrl = new URL(href, pageUrl).toString();
      if (isSameOriginUrl(absUrl, currentOrigin)) {
        const parsed = new URL(absUrl);
        const clean = `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`.replace(/\/$/, '') || `${parsed.protocol}//${parsed.hostname}/`;
        if (!links.includes(clean)) {
          links.push(clean);
        }
      }
    } catch {}
  }

  return links;
}

/**
 * Checks for security challenges or anti-bot barriers in HTML.
 */
function detectAccessBarrier(html: string): { isBlocked: boolean; reason?: string } {
  const lower = (html || '').toLowerCase();
  const barriers = [
    'just a moment...',
    'attention required! | cloudflare',
    'cf-chl-bypass',
    'verify you are human',
    'security check to access',
    'access denied',
    'error 403 forbidden',
    'datadome',
    'incapsula',
    'bot detection'
  ];

  for (const b of barriers) {
    if (lower.includes(b)) {
      return { isBlocked: true, reason: `Barrier detected: "${b}"` };
    }
  }

  return { isBlocked: false };
}

/**
 * Evaluates whether extracted business name strongly contradicts candidate name.
 */
function evaluateIdentityContradiction(
  candidateName?: string,
  observedName?: BusinessNameFact
): { isContradiction: boolean; reason?: string } {
  if (!candidateName || !observedName) {
    return { isContradiction: false };
  }

  const cClean = candidateName.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  const oClean = observedName.comparisonKey.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();

  if (!cClean || !oClean) {
    return { isContradiction: false };
  }

  // Token overlap check
  const cTokens = new Set(cClean.split(/\s+/).filter(t => t.length > 2));
  const oTokens = new Set(oClean.split(/\s+/).filter(t => t.length > 2));

  let overlap = 0;
  for (const t of cTokens) {
    if (oTokens.has(t)) overlap++;
  }

  if (cTokens.size >= 2 && oTokens.size >= 2 && overlap === 0) {
    return {
      isContradiction: true,
      reason: `Website identity "${observedName.normalizedName}" conflicts with candidate name "${candidateName}"`
    };
  }

  return { isContradiction: false };
}

/**
 * Main enrichment orchestrator.
 */
export async function enrichBusinessContacts(
  input: ContactEnrichmentInput,
  customFetch?: CustomFetchFn
): Promise<ContactEnrichmentResult> {
  const startTime = Date.now();
  const timestamp = input.timestamp || new Date().toISOString();
  const errors: string[] = [];
  const warnings: string[] = [];
  const notices: string[] = [];

  const rawContributions = input.sourceContributions || [];
  const rawDerivedFrom = input.derivedFrom || [];

  // Determine starting restriction basis
  const hasRestrictedGoogleSource = rawContributions.some(
    c => c.provenance === 'GOOGLE_DERIVED' || c.restrictionBasis === 'GOOGLE_CONSUMER_WEB_RESTRICTED'
  );

  const initialRestrictionBasis: PolicyRestrictionBasis = hasRestrictedGoogleSource
    ? 'GOOGLE_CONSUMER_WEB_RESTRICTED'
    : 'NONE';

  const initialPolicyStatus: PolicyStatus = 'POLICY_APPROVED';
  const initialPersistence: PersistenceStatus = hasRestrictedGoogleSource ? 'NOT_PERSISTABLE' : 'PERSISTABLE';
  const initialExport: ExportStatus = hasRestrictedGoogleSource ? 'NOT_EXPORTABLE' : 'EXPORTABLE';

  // 1. Validate Target Website URL
  if (!input.websiteUrl || !input.websiteUrl.trim()) {
    return {
      entityId: input.entityId,
      targetDomain: '',
      status: 'CONTACT_UNAVAILABLE',
      phones: [],
      emails: [],
      addresses: [],
      socialProfiles: [],
      contactForms: [],
      allEvidence: [],
      completeness: {
        hasPhone: false,
        hasEmail: false,
        hasAddress: false,
        hasSocialProfile: false,
        hasContactForm: false,
        numberOfBusinessPhones: 0,
        numberOfBusinessEmails: 0,
        numberOfLocations: 0,
        numberOfSocialProfiles: 0
      },
      provenance: hasRestrictedGoogleSource ? 'MIXED' : 'USER_PROVIDED',
      sourceContributions: [...rawContributions],
      derivedFrom: [...rawDerivedFrom],
      sourceRestrictions: {
        isRestricted: hasRestrictedGoogleSource,
        restrictionBasis: initialRestrictionBasis,
        policyStatus: initialPolicyStatus,
        persistenceEligibility: initialPersistence,
        exportEligibility: initialExport
      },
      crawlMetadata: {
        domain: '',
        startUrl: '',
        pagesVisited: [],
        pagesAttempted: 0,
        durationMs: Date.now() - startTime,
        enrichedAt: timestamp,
        fromCache: false
      },
      diagnostics: {
        errors: ['Missing or empty website URL'],
        warnings: [],
        notices: ['Enrichment skipped: No website pointer available.']
      }
    };
  }

  const normUrl = normalizeWebsiteUrl(input.websiteUrl);
  if (!normUrl.isValid) {
    return {
      entityId: input.entityId,
      targetDomain: '',
      status: 'CONTACT_UNAVAILABLE',
      phones: [],
      emails: [],
      addresses: [],
      socialProfiles: [],
      contactForms: [],
      allEvidence: [],
      completeness: {
        hasPhone: false,
        hasEmail: false,
        hasAddress: false,
        hasSocialProfile: false,
        hasContactForm: false,
        numberOfBusinessPhones: 0,
        numberOfBusinessEmails: 0,
        numberOfLocations: 0,
        numberOfSocialProfiles: 0
      },
      provenance: hasRestrictedGoogleSource ? 'MIXED' : 'USER_PROVIDED',
      sourceContributions: [...rawContributions],
      derivedFrom: [...rawDerivedFrom],
      sourceRestrictions: {
        isRestricted: hasRestrictedGoogleSource,
        restrictionBasis: initialRestrictionBasis,
        policyStatus: initialPolicyStatus,
        persistenceEligibility: initialPersistence,
        exportEligibility: initialExport
      },
      crawlMetadata: {
        domain: '',
        startUrl: input.websiteUrl,
        pagesVisited: [],
        pagesAttempted: 0,
        durationMs: Date.now() - startTime,
        enrichedAt: timestamp,
        fromCache: false
      },
      diagnostics: {
        errors: [`Invalid target website URL: ${normUrl.error || 'Syntax error'}`],
        warnings: [],
        notices: ['Enrichment skipped: URL normalization failed.']
      }
    };
  }

  const targetDomain = normUrl.finalHostname;
  const cacheKey = `enrich_${targetDomain.toLowerCase()}`;

  // 2. Check 24-hour cache
  if (!input.skipCache) {
    const cached = enrichmentMemoryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return {
        ...cached.result,
        entityId: input.entityId,
        crawlMetadata: {
          ...cached.result.crawlMetadata,
          fromCache: true,
          durationMs: Date.now() - startTime
        }
      };
    }
  }

  // 3. Setup Fetcher
  const defaultFetch = async (url: string, timeoutMs: number): Promise<{ status: number; html: string }> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'text/html,application/xhtml+xml' },
        signal: controller.signal
      });
      clearTimeout(timeout);
      const text = await resp.text();
      return { status: resp.status, html: text };
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  };

  const fetcher = customFetch || defaultFetch;

  // 4. Bounded Crawl Loop
  const pagesVisited: string[] = [];
  const rawBusinessNames: BusinessNameFact[] = [];
  const rawPhones: BusinessPhoneFact[] = [];
  const rawEmails: BusinessEmailFact[] = [];
  const rawLocations: BusinessLocationFact[] = [];
  const rawSocials: DigitalPresenceFact[] = [];
  const rawForms: ContactFormFact[] = [];

  let pagesQueue: string[] = [normUrl.finalUrl];
  let isBlocked = false;
  let blockReason = '';
  let crawlFailedRoot = false;

  while (pagesQueue.length > 0 && pagesVisited.length < ENRICHMENT_MAX_PAGES) {
    if (Date.now() - startTime >= ENRICHMENT_DOMAIN_TIMEOUT_MS) {
      warnings.push('Domain verification time limit (30s) reached; terminating crawl queue.');
      break;
    }

    const currentUrl = pagesQueue.shift()!;
    if (pagesVisited.includes(currentUrl)) continue;

    pagesVisited.push(currentUrl);

    let pageRes: { status: number; html: string };
    try {
      pageRes = await fetcher(currentUrl, ENRICHMENT_PAGE_TIMEOUT_MS);
    } catch (err: any) {
      if (pagesVisited.length === 1) {
        crawlFailedRoot = true;
        errors.push(`Root page navigation failed: ${err.message || 'Network error'}`);
      } else {
        warnings.push(`Page fetch failed for ${currentUrl}: ${err.message || 'Network error'}`);
      }
      continue;
    }

    // HTTP Status Check
    if (pageRes.status === 403 || pageRes.status === 429) {
      isBlocked = true;
      blockReason = `HTTP ${pageRes.status} Access Denied`;
      break;
    }

    if (pageRes.status >= 400) {
      if (pagesVisited.length === 1) {
        crawlFailedRoot = true;
        errors.push(`HTTP ${pageRes.status} received on root page`);
      } else {
        warnings.push(`HTTP ${pageRes.status} received on subpage ${currentUrl}`);
      }
      continue;
    }

    // Access Barrier Check
    const barrier = detectAccessBarrier(pageRes.html);
    if (barrier.isBlocked) {
      isBlocked = true;
      blockReason = barrier.reason || 'Bot barrier detected';
      break;
    }

    // Extract facts from page
    const pageContacts = extractContactsFromHtmlPage(pageRes.html, currentUrl, input.countryHint);
    const pageSocials = extractDigitalPresenceFromHtml(pageRes.html, currentUrl);

    rawBusinessNames.push(...pageContacts.businessNames);
    rawPhones.push(...pageContacts.phones);
    rawEmails.push(...pageContacts.emails);
    rawLocations.push(...pageContacts.locations);
    rawForms.push(...pageContacts.contactForms);
    rawSocials.push(...pageSocials);

    // If root page, discover same-origin links and prioritize
    if (pagesVisited.length === 1) {
      const discoveredLinks = extractSameOriginLinks(pageRes.html, currentUrl);
      const prioritized = prioritizeContactPages(normUrl.finalUrl, discoveredLinks);
      for (const p of prioritized) {
        const pKey = p.toLowerCase().replace(/\/$/, '');
        const alreadyVisited = pagesVisited.some(v => v.toLowerCase().replace(/\/$/, '') === pKey);
        const alreadyQueued = pagesQueue.some(q => q.toLowerCase().replace(/\/$/, '') === pKey);
        if (!alreadyVisited && !alreadyQueued) {
          pagesQueue.push(p);
        }
      }
    }
  }

  // 5. Handle Failure / Blocking States
  if (isBlocked) {
    return {
      entityId: input.entityId,
      targetDomain,
      status: 'CONTACT_BLOCKED',
      phones: [],
      emails: [],
      addresses: [],
      socialProfiles: [],
      contactForms: [],
      allEvidence: [],
      completeness: {
        hasPhone: false,
        hasEmail: false,
        hasAddress: false,
        hasSocialProfile: false,
        hasContactForm: false,
        numberOfBusinessPhones: 0,
        numberOfBusinessEmails: 0,
        numberOfLocations: 0,
        numberOfSocialProfiles: 0
      },
      provenance: hasRestrictedGoogleSource ? 'MIXED' : 'WEBSITE_DERIVED',
      sourceContributions: [...rawContributions],
      derivedFrom: [...rawDerivedFrom],
      sourceRestrictions: {
        isRestricted: hasRestrictedGoogleSource,
        restrictionBasis: initialRestrictionBasis,
        policyStatus: initialPolicyStatus,
        persistenceEligibility: initialPersistence,
        exportEligibility: initialExport
      },
      crawlMetadata: {
        domain: targetDomain,
        startUrl: normUrl.finalUrl,
        pagesVisited,
        pagesAttempted: pagesVisited.length,
        durationMs: Date.now() - startTime,
        enrichedAt: timestamp,
        fromCache: false
      },
      diagnostics: {
        errors: [`Target website blocked access: ${blockReason}`],
        warnings,
        notices: ['Access restricted by target site policies.']
      }
    };
  }

  if (crawlFailedRoot && pagesVisited.length <= 1) {
    return {
      entityId: input.entityId,
      targetDomain,
      status: 'CONTACT_UNAVAILABLE',
      phones: [],
      emails: [],
      addresses: [],
      socialProfiles: [],
      contactForms: [],
      allEvidence: [],
      completeness: {
        hasPhone: false,
        hasEmail: false,
        hasAddress: false,
        hasSocialProfile: false,
        hasContactForm: false,
        numberOfBusinessPhones: 0,
        numberOfBusinessEmails: 0,
        numberOfLocations: 0,
        numberOfSocialProfiles: 0
      },
      provenance: hasRestrictedGoogleSource ? 'MIXED' : 'WEBSITE_DERIVED',
      sourceContributions: [...rawContributions],
      derivedFrom: [...rawDerivedFrom],
      sourceRestrictions: {
        isRestricted: hasRestrictedGoogleSource,
        restrictionBasis: initialRestrictionBasis,
        policyStatus: initialPolicyStatus,
        persistenceEligibility: initialPersistence,
        exportEligibility: initialExport
      },
      crawlMetadata: {
        domain: targetDomain,
        startUrl: normUrl.finalUrl,
        pagesVisited,
        pagesAttempted: pagesVisited.length,
        durationMs: Date.now() - startTime,
        enrichedAt: timestamp,
        fromCache: false
      },
      diagnostics: {
        errors,
        warnings,
        notices: ['Website unavailable or failed to respond.']
      }
    };
  }

  // 6. Deduplicate & Corroborate Facts
  const dedupedPhones = deduplicatePhones(rawPhones);
  const dedupedEmails = deduplicateEmails(rawEmails);
  const dedupedSocials = deduplicateSocialProfiles(rawSocials);
  const dedupedLocations = deduplicateLocations(rawLocations);
  const dedupedForms = deduplicateContactForms(rawForms);
  const dedupedBusinessName = deduplicateBusinessNames(rawBusinessNames);

  // Collect all unique evidence items
  const allEvidenceRaw: ContactEvidenceItem[] = [
    ...(dedupedBusinessName ? dedupedBusinessName.evidence : []),
    ...dedupedPhones.flatMap(p => p.evidence),
    ...dedupedEmails.flatMap(e => e.evidence),
    ...dedupedLocations.flatMap(l => l.evidence),
    ...dedupedSocials.flatMap(s => s.evidence),
    ...dedupedForms.flatMap(f => f.evidence)
  ];
  const allEvidence = deduplicateEvidence(allEvidenceRaw);

  // 7. Identity Contradiction Check
  const identityCheck = evaluateIdentityContradiction(input.canonicalDisplayName, dedupedBusinessName);
  if (identityCheck.isContradiction) {
    warnings.push(identityCheck.reason!);
  }

  // 8. Determine Overall Status
  let status: ContactEnrichmentStatus = 'CONTACT_NOT_FOUND';

  const hasDirectContact = dedupedPhones.length > 0 || dedupedEmails.length > 0;
  const hasDigitalPresence = dedupedSocials.length > 0 || dedupedForms.length > 0 || dedupedLocations.length > 0;

  if (identityCheck.isContradiction) {
    status = 'CONTACT_UNCERTAIN';
  } else if (hasDirectContact) {
    status = 'CONTACT_FOUND';
  } else if (hasDigitalPresence) {
    status = 'CONTACT_PARTIAL';
  } else {
    status = 'CONTACT_NOT_FOUND';
  }

  // 9. Lineage & Provenance Construction
  const websiteContribution: SourceContribution = {
    source: 'FUTURE_SOURCE',
    provenance: 'WEBSITE_DERIVED',
    fieldName: 'contact_enrichment',
    acquisitionContext: 'WEBSITE_DIRECT',
    restrictionBasis: 'NONE',
    isRestricted: false,
    policyStatus: 'POLICY_APPROVED',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'EXPORTABLE'
  };

  const finalSourceContributions: SourceContribution[] = [...rawContributions, websiteContribution];
  const finalDerivedFrom: string[] = [...rawDerivedFrom, `website:${targetDomain}`];

  // Final overall provenance:
  // If original candidate has contributions from other sources (GOOGLE_DERIVED, META_DERIVED, USER_PROVIDED),
  // adding WEBSITE_DERIVED facts makes the composite entity provenance MIXED.
  // Google restrictions remain intact on the candidate.
  const hasMultipleSourceProvenances = rawContributions.some(
    c => c.provenance !== 'WEBSITE_DERIVED'
  );
  const finalProvenance: ProvenanceType = hasMultipleSourceProvenances ? 'MIXED' : 'WEBSITE_DERIVED';

  // 10. Objective Completeness Metrics (NO SCORES)
  const completeness = {
    hasPhone: dedupedPhones.length > 0,
    hasEmail: dedupedEmails.length > 0,
    hasAddress: dedupedLocations.length > 0,
    hasSocialProfile: dedupedSocials.length > 0,
    hasContactForm: dedupedForms.length > 0,
    numberOfBusinessPhones: dedupedPhones.length,
    numberOfBusinessEmails: dedupedEmails.length,
    numberOfLocations: dedupedLocations.length,
    numberOfSocialProfiles: dedupedSocials.length
  };

  const result: ContactEnrichmentResult = {
    entityId: input.entityId,
    targetDomain,
    status,
    businessName: dedupedBusinessName,
    phones: dedupedPhones,
    emails: dedupedEmails,
    addresses: dedupedLocations,
    socialProfiles: dedupedSocials,
    contactForms: dedupedForms,
    allEvidence,
    completeness,
    provenance: finalProvenance,
    sourceContributions: finalSourceContributions,
    derivedFrom: finalDerivedFrom,
    sourceRestrictions: {
      isRestricted: hasRestrictedGoogleSource,
      restrictionBasis: initialRestrictionBasis,
      policyStatus: initialPolicyStatus,
      persistenceEligibility: initialPersistence,
      exportEligibility: initialExport
    },
    crawlMetadata: {
      domain: targetDomain,
      startUrl: normUrl.finalUrl,
      pagesVisited,
      pagesAttempted: pagesVisited.length,
      durationMs: Date.now() - startTime,
      enrichedAt: timestamp,
      fromCache: false
    },
    diagnostics: {
      errors,
      warnings,
      notices
    }
  };

  // Cache result for 24 hours
  enrichmentMemoryCache.set(cacheKey, {
    result,
    expiresAt: Date.now() + ENRICHMENT_CACHE_TTL_MS
  });

  return result;
}

/**
 * Clears enrichment memory cache (for test isolation).
 */
export function clearEnrichmentCache(): void {
  enrichmentMemoryCache.clear();
}
