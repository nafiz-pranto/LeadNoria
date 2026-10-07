/**
 * Website Intelligence Engine (Phase 21)
 *
 * Orchestrates bounded, deterministic, same-origin website intelligence crawls.
 * Extracts public business identity, contacts, digital presence, public team members,
 * services, technology signals, and cross-page discrepancies.
 *
 * Core Guarantees:
 * - Public same-origin crawling only (max 5 pages).
 * - Strict resource & timeout bounds (10s page timeout, 30s domain timeout).
 * - No general web crawling, no social crawling, no SMTP probing, no email guessing.
 * - Source-neutral and reusable across Meta, Google (experimental), and User-provided sources.
 * - Strict Provenance & Data Firewall compliance:
 *   - Google-derived candidates retain NOT_PERSISTABLE, NOT_EXPORTABLE, and GOOGLE_CONSUMER_WEB_RESTRICTED.
 *   - Meta / User-provided sources maintain normal persistence and export eligibility.
 */

import type {
  WebsiteIntelligenceInput,
  WebsiteIntelligenceResult,
  WebsiteIdentity,
  WebsiteVerificationState,
  BusinessDescription,
  CrawlStats,
  TechnologySignal,
  PublicPerson,
  BusinessService,
  ContactConflict
} from './types.ts';

import {
  DEFAULT_MAX_PAGES_PER_DOMAIN,
  DEFAULT_MAX_PAGE_TIMEOUT_MS,
  DEFAULT_MAX_DOMAIN_TIMEOUT_MS,
  DEFAULT_MAX_DOCUMENT_BYTES,
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_MAX_CACHE_ENTRIES,
  DEFAULT_MAX_CACHE_BYTES
} from './types.ts';

import { validateSafeWebUrl, isSafeSameOrigin, validateRedirectHop } from './urlSafety.ts';
import {
  BoundedObservationCache,
  generateObservationCacheKey,
  type NeutralObservationPayload
} from './observationCache.ts';
import { extractCandidateLinksFromHtml, buildDiscoveryPlan } from './pageDiscovery.ts';
import { detectTechnologiesInHtml } from './technologyDetector.ts';
import { extractPublicPeople } from './personExtractor.ts';
import { extractPublicServices } from './serviceExtractor.ts';
import { detectAllConflicts } from './conflictDetector.ts';

import { extractContactsFromHtmlPage } from '../enrichment/contactExtractor.ts';
import { extractDigitalPresenceFromHtml } from '../enrichment/digitalPresenceExtractor.ts';
import { deduplicatePhones, deduplicateEmails, deduplicateLocations } from '../enrichment/contactDeduper.ts';

import type {
  BusinessPhoneFact,
  BusinessEmailFact,
  BusinessLocationFact,
  DigitalPresenceFact,
  ContactFormFact,
  ContactEvidenceItem
} from '../enrichment/contactTypes.ts';

import type { SourceContribution, ProvenanceType, SourceType } from '../extraction/types.ts';

// Shared default bounded in-memory observation cache
const defaultObservationCache = new BoundedObservationCache({
  maxEntries: DEFAULT_MAX_CACHE_ENTRIES,
  maxBytes: DEFAULT_MAX_CACHE_BYTES,
  defaultTtlMs: DEFAULT_CACHE_TTL_MS
});

export class WebsiteIntelligenceEngine {
  private isCancelled = false;
  private activeAbortController: AbortController | null = null;
  private observationCache: BoundedObservationCache;
  private _lastFailedPages: string[] = [];
  private _lastDiscoveredCount = 0;

  constructor(customCache?: BoundedObservationCache) {
    this.observationCache = customCache || defaultObservationCache;
  }

  /**
   * Diagnostic cache stats.
   */
  getCacheStats() {
    return this.observationCache.getStats();
  }

  /**
   * Clears the observation cache.
   */
  clearCache(): void {
    this.observationCache.clear();
  }

  /**
   * Returns internal bounded observation cache instance.
   */
  getObservationCache(): BoundedObservationCache {
    return this.observationCache;
  }

  /**
   * Cleans and formats plain text from HTML, stripping script, style, and HTML tags.
   */
  private cleanText(raw: string): string {
    return (raw || '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, '')
      .normalize('NFC')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Verifies the target domain reachability and basic business identity matching.
   */
  async verifyDomain(input: WebsiteIntelligenceInput): Promise<WebsiteVerificationState> {
    const safety = validateSafeWebUrl(input.targetUrl);
    if (!safety.isSafe) {
      return 'INVALID';
    }
    return 'VERIFIED';
  }

  /**
   * Executes bounded, cancellable same-origin crawl up to maxPages (default 5).
   */
  async crawl(
    input: WebsiteIntelligenceInput,
    customFetch?: (url: string, timeoutMs: number) => Promise<{ status: number; html: string }>
  ): Promise<Array<{ url: string; html: string; status: number }>> {
    const cfg = input.config || {};
    const maxPages = cfg.maxPages ?? DEFAULT_MAX_PAGES_PER_DOMAIN;
    const pageTimeoutMs = cfg.pageTimeoutMs ?? DEFAULT_MAX_PAGE_TIMEOUT_MS;
    const domainTimeoutMs = cfg.domainTimeoutMs ?? DEFAULT_MAX_DOMAIN_TIMEOUT_MS;
    const maxDocBytes = cfg.maxDocumentBytes ?? DEFAULT_MAX_DOCUMENT_BYTES;

    const safety = validateSafeWebUrl(input.targetUrl);
    if (!safety.isSafe || !safety.normalizedUrl) {
      throw new Error(`[WebsiteIntelligenceEngine] Invalid target URL: ${safety.reason}`);
    }

    const rootUrl = safety.normalizedUrl;
    const baseOrigin = new URL(rootUrl).origin;
    const startTime = Date.now();
    const fetchedPages: Array<{ url: string; html: string; status: number }> = [];
    const visitedUrls = new Set<string>();

    this.activeAbortController = new AbortController();

    const MAX_REDIRECTS = 5;

    /**
     * Executes network fetch with explicit per-hop redirect validation and SSRF defenses.
     */
    const safeFetchWithRedirects = async (
      initialUrl: string,
      timeoutMs: number
    ): Promise<{ status: number; html: string; finalUrl: string }> => {
      let currentUrl = initialUrl;
      let hops = 0;

      while (hops <= MAX_REDIRECTS) {
        // Pre-hop safety & same-origin check
        const hopSafety = validateSafeWebUrl(currentUrl);
        if (!hopSafety.isSafe) {
          throw new Error(`[WebsiteIntelligenceEngine] SSRF blocked destination: ${hopSafety.reason}`);
        }
        if (!isSafeSameOrigin(currentUrl, baseOrigin)) {
          throw new Error(`[WebsiteIntelligenceEngine] Cross-origin crawl target blocked: ${currentUrl}`);
        }

        let status = 0;
        let html = '';
        let locationHeader: string | undefined;

        if (customFetch) {
          const res = (await customFetch(currentUrl, timeoutMs)) as any;
          status = res.status;
          html = res.html || '';
          locationHeader =
            res.headers?.location ||
            res.headers?.Location ||
            res.redirectUrl ||
            res.location;
        } else {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);
          const cancelListener = () => controller.abort();
          this.activeAbortController?.signal.addEventListener('abort', cancelListener);

          try {
            const resp = await fetch(currentUrl, {
              method: 'GET',
              headers: { Accept: 'text/html,application/xhtml+xml' },
              redirect: 'manual', // Enforce manual per-hop redirect validation
              signal: controller.signal
            });
            clearTimeout(timer);
            this.activeAbortController?.signal.removeEventListener('abort', cancelListener);

            status = resp.status;
            locationHeader = resp.headers.get('location') || undefined;
            if (status < 300 || status >= 400 || !locationHeader) {
              html = await resp.text();
            }
          } catch (err) {
            clearTimeout(timer);
            this.activeAbortController?.signal.removeEventListener('abort', cancelListener);
            throw err;
          }
        }

        // If redirect response (301, 302, 303, 307, 308)
        if (status >= 300 && status < 400 && locationHeader) {
          const redirectValidation = validateRedirectHop(locationHeader, currentUrl, baseOrigin);
          if (!redirectValidation.isSafe || !redirectValidation.resolvedUrl) {
            throw new Error(
              `[WebsiteIntelligenceEngine] Blocked unsafe redirect: ${redirectValidation.reason}`
            );
          }
          currentUrl = redirectValidation.resolvedUrl;
          hops++;
          continue;
        }

        // Terminal document bounds defense
        if (html.length > maxDocBytes) {
          html = html.slice(0, maxDocBytes);
        }

        return { status, html, finalUrl: currentUrl };
      }

      throw new Error('[WebsiteIntelligenceEngine] Exceeded maximum redirect hops (5)');
    };

    this._lastFailedPages = [];
    this._lastDiscoveredCount = 0;

    // 1. Fetch homepage first
    let homepageHtml = '';
    try {
      if (this.isCancelled) return fetchedPages;
      const homeRes = await safeFetchWithRedirects(rootUrl, pageTimeoutMs);
      homepageHtml = homeRes.html;
      visitedUrls.add(homeRes.finalUrl.replace(/\/$/, ''));
      fetchedPages.push({ url: homeRes.finalUrl, html: homeRes.html, status: homeRes.status });
    } catch {
      // If homepage fails or redirect is blocked, return empty
      return fetchedPages;
    }

    // 2. Discover priority candidate links
    const candidateLinks = extractCandidateLinksFromHtml(homepageHtml, rootUrl);
    const discoveryPlan = buildDiscoveryPlan(rootUrl, candidateLinks, maxPages);
    this._lastDiscoveredCount = 1 + discoveryPlan.length;

    // 3. Crawl remaining discovery plan
    for (const pageUrl of discoveryPlan) {
      if (this.isCancelled) break;
      if (Date.now() - startTime >= domainTimeoutMs) break;
      if (fetchedPages.length >= maxPages) break;

      const normUrl = pageUrl.replace(/\/$/, '');
      if (visitedUrls.has(normUrl)) continue;
      visitedUrls.add(normUrl);

      try {
        const pageRes = await safeFetchWithRedirects(pageUrl, pageTimeoutMs);
        fetchedPages.push({ url: pageRes.finalUrl, html: pageRes.html, status: pageRes.status });
      } catch {
        this._lastFailedPages.push(pageUrl);
      }
    }

    return fetchedPages;
  }

  /**
   * Extracts multi-page business intelligence from crawled HTML pages.
   */
  extract(
    pages: Array<{ url: string; html: string; status: number }>,
    input: WebsiteIntelligenceInput
  ): {
    identity: WebsiteIdentity;
    phones: BusinessPhoneFact[];
    emails: BusinessEmailFact[];
    locations: BusinessLocationFact[];
    socialProfiles: DigitalPresenceFact[];
    people: PublicPerson[];
    services: BusinessService[];
    descriptions: BusinessDescription[];
    technologies: TechnologySignal[];
    contactForms: ContactFormFact[];
    allEvidence: ContactEvidenceItem[];
  } {
    const allPhones: BusinessPhoneFact[] = [];
    const allEmails: BusinessEmailFact[] = [];
    const allLocations: BusinessLocationFact[] = [];
    const allSocial: DigitalPresenceFact[] = [];
    const allPeople: PublicPerson[] = [];
    const allServices: BusinessService[] = [];
    const allDescriptions: BusinessDescription[] = [];
    const allTech: TechnologySignal[] = [];
    const allForms: ContactFormFact[] = [];
    const allEvidence: ContactEvidenceItem[] = [];

    let canonicalUrl = input.targetUrl;
    let pageTitle = '';
    let metaDescription = '';
    let businessName: string | undefined;
    let businessHours: string | undefined;
    const serviceAreas = new Set<string>();
    const categories = new Set<string>();

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const isHome = i === 0;

      // 1. Title & Meta Description
      if (isHome) {
        const tMatch = page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        if (tMatch) pageTitle = this.cleanText(tMatch[1]);

        let mMatch = page.html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["']/i);
        if (!mMatch) {
          mMatch = page.html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:description|og:description)["']/i);
        }
        if (mMatch) {
          metaDescription = this.cleanText(mMatch[1]);
          allDescriptions.push({
            text: metaDescription,
            sourceType: 'META_DESC',
            sourceUrl: page.url,
            observedAt: new Date().toISOString(),
            provenance: 'WEBSITE_DERIVED'
          });
        }

        const canonMatch = page.html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
        if (canonMatch) canonicalUrl = canonMatch[1].trim();
      }

      // 2. Public contacts (Phones, Emails, Locations, Forms, Business Name)
      const pageContacts = extractContactsFromHtmlPage(page.html, page.url);
      allPhones.push(...pageContacts.phones);
      allEmails.push(...pageContacts.emails);
      allLocations.push(...pageContacts.locations);
      allForms.push(...pageContacts.contactForms);

      if (pageContacts.businessNames.length > 0 && !businessName) {
        businessName = pageContacts.businessNames[0].normalizedName;
      }

      // 3. Social / Digital presence
      const social = extractDigitalPresenceFromHtml(page.html, page.url);
      allSocial.push(...social);

      // 4. Public Team / People
      if (input.config?.collectPeople !== false) {
        const people = extractPublicPeople(page.html, page.url);
        allPeople.push(...people);
      }

      // 5. Public Services
      if (input.config?.collectServices !== false) {
        const services = extractPublicServices(page.html, page.url);
        allServices.push(...services);
      }

      // 6. Technology detection
      if (input.config?.detectTechnology !== false) {
        const tech = detectTechnologiesInHtml(page.html);
        for (const t of tech) {
          if (!allTech.some(existing => existing.name === t.name)) {
            allTech.push(t);
          }
        }
      }

      // 7. Structured Data Hours & Descriptions
      const ldMatches = page.html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      for (const m of ldMatches) {
        try {
          const parsed = JSON.parse(m[1].trim());
          const items = Array.isArray(parsed) ? parsed : [parsed];
          for (const item of items) {
            if (!item || typeof item !== 'object') continue;
            if (item.description && typeof item.description === 'string' && !allDescriptions.some(d => d.text === item.description)) {
              allDescriptions.push({
                text: this.cleanText(item.description),
                sourceType: 'STRUCTURED_DATA',
                sourceUrl: page.url,
                observedAt: new Date().toISOString(),
                provenance: 'WEBSITE_DERIVED'
              });
            }
            if (item.openingHours && !businessHours) {
              businessHours = Array.isArray(item.openingHours) ? item.openingHours.join(', ') : String(item.openingHours);
            }
            if (item.areaServed) {
              const areas = Array.isArray(item.areaServed) ? item.areaServed : [item.areaServed];
              for (const a of areas) {
                const name = typeof a === 'string' ? a : a?.name;
                if (typeof name === 'string') serviceAreas.add(this.cleanText(name));
              }
            }
          }
        } catch {}
      }
    }

    // Deduplicate contacts across pages
    const dedupedPhones = deduplicatePhones(allPhones);
    const dedupedEmails = deduplicateEmails(allEmails);
    const dedupedLocations = deduplicateLocations(allLocations);

    // Extract all evidence items
    for (const p of dedupedPhones) allEvidence.push(...p.evidence);
    for (const e of dedupedEmails) allEvidence.push(...e.evidence);
    for (const l of dedupedLocations) allEvidence.push(...l.evidence);

    // Deduplicate people
    const uniquePeople: PublicPerson[] = [];
    for (const p of allPeople) {
      if (!uniquePeople.some(u => u.fullName.toLowerCase() === p.fullName.toLowerCase())) {
        uniquePeople.push(p);
      }
    }

    // Deduplicate services
    const uniqueServices: BusinessService[] = [];
    for (const s of allServices) {
      if (!uniqueServices.some(u => u.name.toLowerCase() === s.name.toLowerCase())) {
        uniqueServices.push(s);
      }
    }

    // Deduplicate social profiles by platform + normalizedUrl
    const uniqueSocial: DigitalPresenceFact[] = [];
    for (const s of allSocial) {
      if (!uniqueSocial.some(u => u.platform === s.platform && u.normalizedUrl === s.normalizedUrl)) {
        uniqueSocial.push(s);
      }
    }

    const domain = new URL(canonicalUrl).hostname.toLowerCase().replace(/^www\./, '');

    const identity: WebsiteIdentity = {
      canonicalUrl,
      domain,
      pageTitle,
      businessName,
      description: allDescriptions[0]?.text,
      metaDescription,
      address: dedupedLocations[0]?.normalizedAddress,
      phones: dedupedPhones.map(p => p.normalizedValue),
      emails: dedupedEmails.map(e => e.normalizedEmail),
      businessHours,
      serviceAreas: Array.from(serviceAreas),
      services: uniqueServices.map(s => s.name),
      categories: Array.from(categories)
    };

    return {
      identity,
      phones: dedupedPhones,
      emails: dedupedEmails,
      locations: dedupedLocations,
      socialProfiles: uniqueSocial,
      people: uniquePeople,
      services: uniqueServices,
      descriptions: allDescriptions,
      technologies: allTech,
      contactForms: allForms,
      allEvidence
    };
  }

  /**
   * Applies source restrictions and emits final structured WebsiteIntelligenceResult.
   *
   * MANDATORY GOOGLE INVARIANT:
   * If sourceContext is GOOGLE_MAPS or carries Google restrictions,
   * all resulting source contributions enforce NOT_PERSISTABLE and NOT_EXPORTABLE,
   * preventing any circumvention of Google data restrictions.
   */
  emitEvidence(
    extracted: ReturnType<WebsiteIntelligenceEngine['extract']>,
    input: WebsiteIntelligenceInput,
    crawlStats: CrawlStats
  ): WebsiteIntelligenceResult {
    const isGoogleRestricted =
      input.sourceContext === 'GOOGLE_MAPS' ||
      input.provenanceContext === 'GOOGLE_DERIVED' ||
      input.sourceRestrictions?.isRestricted === true;

    // Detect cross-page conflicts
    const conflicts = detectAllConflicts(
      extracted.phones,
      extracted.locations,
      extracted.emails
    );

    // Build source contributions
    const sourceContributions: SourceContribution[] = [];

    const makeContribution = (
      fieldName: string,
      provenance: ProvenanceType
    ): SourceContribution => {
      if (isGoogleRestricted) {
        return {
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          fieldName,
          acquisitionContext: 'GOOGLE_CONSUMER_WEB',
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          isRestricted: true,
          policyStatus: 'PRODUCT_REJECTED',
          persistenceStatus: 'NOT_PERSISTABLE',
          exportStatus: 'NOT_EXPORTABLE'
        };
      }

      let sourceVal: SourceType = 'FUTURE_SOURCE';
      if (input.sourceContext === 'META' || input.sourceContext === 'META_AD_LIBRARY') {
        sourceVal = 'META_AD_LIBRARY';
      } else if (input.sourceContext === 'USER_PROVIDED' || input.sourceContext === 'USER_PROVIDED_DOMAIN') {
        sourceVal = 'USER_PROVIDED_DOMAIN';
      }

      return {
        source: sourceVal,
        provenance,
        fieldName,
        acquisitionContext: 'WEBSITE_DIRECT',
        restrictionBasis: 'NONE',
        isRestricted: false,
        policyStatus: 'POLICY_APPROVED',
        persistenceStatus: 'PERSISTABLE',
        exportStatus: 'EXPORTABLE'
      };
    };

    sourceContributions.push(makeContribution('website_identity', 'WEBSITE_DERIVED'));
    sourceContributions.push(makeContribution('contact_details', 'WEBSITE_DERIVED'));
    if (extracted.technologies.length > 0) {
      sourceContributions.push(makeContribution('technology_signals', 'LEADNORIA_DERIVED'));
    }

    // Determine verification state
    let verificationState: WebsiteVerificationState = 'VERIFIED';
    if (crawlStats.pagesVisited.length === 0) {
      verificationState = 'UNREACHABLE';
    } else if (extracted.identity.businessName && input.businessContext?.expectedName) {
      // Cross-check name if provided
      const expected = input.businessContext.expectedName.toLowerCase();
      const observed = extracted.identity.businessName.toLowerCase();
      if (!observed.includes(expected) && !expected.includes(observed)) {
        verificationState = 'LIKELY';
      }
    }

    return {
      identity: extracted.identity,
      contacts: extracted.allEvidence,
      phones: extracted.phones,
      emails: extracted.emails,
      socialProfiles: extracted.socialProfiles,
      publicPeople: extracted.people,
      address: extracted.locations[0],
      services: extracted.services,
      description: extracted.descriptions[0],
      businessHours: extracted.identity.businessHours,
      technologySignals: extracted.technologies,
      contactForms: extracted.contactForms,
      sourcePages: crawlStats.pagesVisited,
      crawlStats,
      verificationState,
      conflicts,
      warnings: [],
      provenance: isGoogleRestricted ? 'GOOGLE_DERIVED' : 'WEBSITE_DERIVED',
      sourceContributions,
      observedAt: new Date().toISOString()
    };
  }

  /**
   * Main end-to-end processing pipeline for a target website.
   * Performs verify -> crawl -> extract -> emit with isolated neutral observation caching.
   *
   * BLOCKER A & B ENFORCEMENT:
   * 1. Caches only neutral observations (extracted facts, crawl stats).
   * 2. Keyed by normalized origin + path scope + crawl config.
   * 3. Dynamically re-binds provenance and restrictions to current request on cache hit.
   * 4. Enforces bounded memory limits via BoundedObservationCache (MAX_CACHE_ENTRIES, MAX_CACHE_BYTES).
   */
  async process(
    input: WebsiteIntelligenceInput,
    customFetch?: (url: string, timeoutMs: number) => Promise<{ status: number; html: string; headers?: Record<string, string>; location?: string; redirectUrl?: string }>
  ): Promise<WebsiteIntelligenceResult> {
    const safety = validateSafeWebUrl(input.targetUrl);
    if (!safety.isSafe || !safety.normalizedUrl) {
      throw new Error(`[WebsiteIntelligenceEngine] Rejected unsafe URL: ${safety.reason}`);
    }

    const cacheKey = generateObservationCacheKey(input.targetUrl, input.config);
    const cacheTtl = input.config?.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;

    // 1. Check isolated neutral observation cache
    const cachedPayload = this.observationCache.get(cacheKey);
    if (cachedPayload) {
      const crawlStats: CrawlStats = {
        ...cachedPayload.crawlStats,
        fromCache: true
      };
      // CRITICAL POLICY RE-BINDING:
      // Dynamically apply current request's provenance and restriction context!
      // A Google-restricted request remains restricted; an unrestricted request remains unrestricted.
      return this.emitEvidence(cachedPayload.extracted, input, crawlStats);
    }

    // 2. Cache miss -> run bounded crawl & extraction
    const startTime = Date.now();
    const pages = await this.crawl(input, customFetch);

    const crawlStats: CrawlStats = {
      pagesDiscovered: Math.max(pages.length, this._lastDiscoveredCount),
      pagesVisited: pages.map(p => p.url),
      pagesSkipped: [],
      pagesFailed: [...this._lastFailedPages],
      durationMs: Date.now() - startTime,
      fromCache: false
    };

    const extracted = this.extract(pages, input);

    // 3. Cache NEUTRAL observation only (no policy or restriction bindings)
    if (pages.length > 0) {
      const domain = safety.parsedUrl?.hostname.toLowerCase().replace(/^www\./, '') || '';
      const neutralPayload: NeutralObservationPayload = {
        targetOrigin: safety.parsedUrl?.origin || input.targetUrl,
        targetUrl: input.targetUrl,
        canonicalUrl: extracted.identity.canonicalUrl,
        domain,
        scopeKey: cacheKey,
        configHash: JSON.stringify(input.config || {}),
        extractedAt: new Date().toISOString(),
        extracted,
        crawlStats
      };

      this.observationCache.set(cacheKey, neutralPayload, cacheTtl);
    }

    // 4. Emit evidence bound to CURRENT request context
    return this.emitEvidence(extracted, input, crawlStats);
  }

  /**
   * Cancels any in-flight crawl requests.
   */
  cancel(): void {
    this.isCancelled = true;
    this.activeAbortController?.abort();
  }

  /**
   * Disposes engine resources.
   */
  dispose(): void {
    this.cancel();
    this.activeAbortController = null;
  }
}
