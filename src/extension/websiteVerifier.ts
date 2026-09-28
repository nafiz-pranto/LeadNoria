/**
 * LeadNoria Website Deep Verification Engine (Phase 6)
 *
 * Provides conservative, production-grade verification of publicly accessible
 * business websites discovered from public Meta Ad Library lead evidence.
 *
 * Core Guarantees:
 * - Public DOM / standard fetch only.
 * - Same-origin crawling only (max 5 pages).
 * - Strict resource & timeout boundaries (10s page timeout, 30s domain timeout).
 * - No network interception, no CAPTCHA solving, no stealth, no private API.
 * - Deterministic identity, commercial, category, and negative signal extraction.
 * - Graceful failure recovery without crashing research runs or disqualifying leads.
 */

import type {
  ExtensionLead,
  StructuredEvidence,
  WebsiteVerificationRecord,
  WebsiteVerificationStatus,
  WebsiteIdentityMatchLevel,
  WebsiteCategoryMatchLevel,
  WebsiteCommercialSignalCode,
  WebsiteNegativeSignalCode,
  WebsiteContactSignal
} from './types.ts';
import { normalizeWebsiteUrl, isSameOriginUrl } from './websiteUrlNormalizer.ts';
import { getCachedWebsiteVerification, setCachedWebsiteVerification } from './websiteCache.ts';
import { BOUNDED_TAXONOMY, tokenizeText } from './relevanceEngine.ts';

export const MAX_PAGES_PER_DOMAIN = 5;
export const MAX_PAGE_TIMEOUT_MS = 10000; // 10s
export const MAX_DOMAIN_VERIFICATION_TIME_MS = 30000; // 30s

export interface PageExtractionResult {
  url: string;
  statusCode: number;
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  visibleText: string;
  logoAlt: string[];
  organizationName?: string;
  canonicalUrl?: string;
  sameOriginLinks: string[];
  emails: string[];
  phones: string[];
  addressCandidates: string[];
  businessHours?: string;
  isBlocked: boolean;
  blockedReason?: string;
}

// Banned external patterns from automated following
const BANNED_LINK_HOST_PATTERNS = [
  'facebook.com', 'fb.com', 'instagram.com', 'twitter.com', 'x.com',
  'linkedin.com', 'youtube.com', 'pinterest.com', 'tiktok.com',
  'google.com', 'amazon.', 'ebay.', 'aliexpress.', 'daraz.', 'walmart.',
  'etsy.', 'apple.com', 'play.google.com', 'schema.org'
];

const BANNED_LINK_PATH_PATTERNS = [
  '/login', '/signin', '/sign-in', '/register', '/signup', '/sign-up',
  '/auth', '/cart', '/checkout', '/my-account', '/account', '/wp-admin',
  '/user', '/password', '/reset', '.pdf', '.jpg', '.png', '.zip'
];

/**
 * Strip and normalize text to NFC Unicode standard
 */
function cleanText(text: string): string {
  return (text || '').normalize('NFC').replace(/\s+/g, ' ').trim();
}

/**
 * Parses raw HTML string into structured public DOM signals.
 * Works seamlessly in both browser (DOMParser) and Node.js test environments.
 */
export function extractPageSignalsFromHtml(html: string, pageUrl: string): PageExtractionResult {
  const normHtml = html || '';
  const result: PageExtractionResult = {
    url: pageUrl,
    statusCode: 200,
    title: '',
    metaDescription: '',
    h1: [],
    h2: [],
    visibleText: '',
    logoAlt: [],
    sameOriginLinks: [],
    emails: [],
    phones: [],
    addressCandidates: [],
    isBlocked: false
  };

  // 1. Detect Blocking / Anti-bot challenges
  const lowerHtml = normHtml.toLowerCase();
  const challengePatterns = [
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

  for (const pat of challengePatterns) {
    if (lowerHtml.includes(pat)) {
      result.isBlocked = true;
      result.blockedReason = `Security challenge / access barrier detected: "${pat}"`;
      return result;
    }
  }

  // 2. Browser DOMParser extraction if available
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(normHtml, 'text/html');

      // Title
      result.title = cleanText(doc.title || '');

      // Meta Description
      const metaDesc = doc.querySelector('meta[name="description" i]') || doc.querySelector('meta[property="og:description" i]');
      if (metaDesc) {
        result.metaDescription = cleanText(metaDesc.getAttribute('content') || '');
      }

      // Canonical URL
      const canonical = doc.querySelector('link[rel="canonical" i]');
      if (canonical) {
        result.canonicalUrl = canonical.getAttribute('href') || undefined;
      }

      // Headings
      doc.querySelectorAll('h1').forEach(el => {
        const t = cleanText(el.textContent || '');
        if (t && t.length < 150) result.h1.push(t);
      });
      doc.querySelectorAll('h2').forEach(el => {
        const t = cleanText(el.textContent || '');
        if (t && t.length < 150) result.h2.push(t);
      });

      // Logo alt text
      doc.querySelectorAll('img[alt]').forEach(el => {
        const alt = cleanText(el.getAttribute('alt') || '');
        const idOrClass = `${el.id} ${el.className}`.toLowerCase();
        if (alt && (idOrClass.includes('logo') || alt.toLowerCase().includes('logo'))) {
          result.logoAlt.push(alt);
        }
      });

      // JSON-LD schema for organization name
      doc.querySelectorAll('script[type="application/ld+json"]').forEach(el => {
        try {
          const parsed = JSON.parse(el.textContent || '{}');
          const org = Array.isArray(parsed) ? parsed.find(i => i['@type'] === 'Organization' || i['@type'] === 'LocalBusiness') : parsed;
          if (org && org.name && typeof org.name === 'string') {
            result.organizationName = cleanText(org.name);
          }
        } catch {
          // Ignore invalid schema json
        }
      });

      // Links on same origin
      const currentOrigin = new URL(pageUrl).origin;
      doc.querySelectorAll('a[href]').forEach(el => {
        const href = el.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
          return;
        }
        try {
          const absUrl = new URL(href, pageUrl).toString();
          const parsedAbs = new URL(absUrl);
          const lowerPath = parsedAbs.pathname.toLowerCase();

          // Reject banned patterns
          if (
            BANNED_LINK_HOST_PATTERNS.some(p => parsedAbs.hostname.toLowerCase().includes(p)) ||
            BANNED_LINK_PATH_PATTERNS.some(p => lowerPath.includes(p))
          ) {
            return;
          }

          if (isSameOriginUrl(absUrl, currentOrigin)) {
            // Remove hash and search params for crawl queue
            const cleanTarget = `${parsedAbs.protocol}//${parsedAbs.hostname}${parsedAbs.pathname}`.replace(/\/$/, '') || `${parsedAbs.protocol}//${parsedAbs.hostname}/`;
            if (!result.sameOriginLinks.includes(cleanTarget)) {
              result.sameOriginLinks.push(cleanTarget);
            }
          }
        } catch {
          // Ignore invalid URLs
        }
      });

      // Visible body text (stripped scripts/styles)
      const scripts = doc.querySelectorAll('script, style, noscript, svg');
      scripts.forEach(s => s.remove());
      result.visibleText = cleanText(doc.body?.textContent || '');
    } catch {
      // Fallback to regex parser
    }
  }

  // 3. Fallback / supplementary regex extraction (ensures robustness across Node and browsers)
  if (!result.title) {
    const titleMatch = normHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) result.title = cleanText(titleMatch[1]);
  }

  if (!result.metaDescription) {
    const metaMatch = normHtml.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["']/i);
    if (metaMatch) result.metaDescription = cleanText(metaMatch[1]);
  }

  if (result.h1.length === 0) {
    const h1Matches = normHtml.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    for (const m of h1Matches) {
      const t = cleanText(m[1].replace(/<[^>]+>/g, ''));
      if (t && t.length < 150) result.h1.push(t);
    }
  }

  if (result.h2.length === 0) {
    const h2Matches = normHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi);
    for (const m of h2Matches) {
      const t = cleanText(m[1].replace(/<[^>]+>/g, ''));
      if (t && t.length < 150) result.h2.push(t);
    }
  }

  if (!result.visibleText) {
    result.visibleText = cleanText(normHtml.replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '));
  }

  // JSON-LD schema fallback
  if (!result.organizationName) {
    const jsonLdMatches = normHtml.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const m of jsonLdMatches) {
      try {
        const parsed = JSON.parse(m[1].trim());
        const org = Array.isArray(parsed) ? parsed.find(i => i['@type'] === 'Organization' || i['@type'] === 'LocalBusiness') : parsed;
        if (org && org.name && typeof org.name === 'string') {
          result.organizationName = cleanText(org.name);
          break;
        }
      } catch {}
    }
  }

  // Logo alt fallback
  if (result.logoAlt.length === 0) {
    const imgMatches = normHtml.matchAll(/<img[^>]+alt=["']([^"']+)["'][^>]*>/gi);
    for (const m of imgMatches) {
      const alt = cleanText(m[1]);
      if (alt && alt.toLowerCase().includes('logo')) {
        result.logoAlt.push(alt);
      }
    }
  }

  // Same-origin links fallback
  if (result.sameOriginLinks.length === 0) {
    try {
      const currentOrigin = new URL(pageUrl).origin;
      const aMatches = normHtml.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi);
      for (const m of aMatches) {
        const href = m[1];
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
          continue;
        }
        try {
          const absUrl = new URL(href, pageUrl).toString();
          const parsedAbs = new URL(absUrl);
          const lowerPath = parsedAbs.pathname.toLowerCase();
          if (
            BANNED_LINK_HOST_PATTERNS.some(p => parsedAbs.hostname.toLowerCase().includes(p)) ||
            BANNED_LINK_PATH_PATTERNS.some(p => lowerPath.includes(p))
          ) {
            continue;
          }
          if (isSameOriginUrl(absUrl, currentOrigin)) {
            const cleanTarget = `${parsedAbs.protocol}//${parsedAbs.hostname}${parsedAbs.pathname}`.replace(/\/$/, '') || `${parsedAbs.protocol}//${parsedAbs.hostname}/`;
            if (!result.sameOriginLinks.includes(cleanTarget)) {
              result.sameOriginLinks.push(cleanTarget);
            }
          }
        } catch {}
      }
    } catch {}
  }

  // 4. Extract public contact signals (emails, phones) from text & links
  // Emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const rawEmails = (result.visibleText + ' ' + normHtml).match(emailRegex) || [];
  const bannedEmailDomains = ['example.com', 'domain.com', 'email.com', 'sentry.io', 'wixpress.com'];
  for (const e of rawEmails) {
    const lower = e.toLowerCase().trim();
    if (
      !lower.endsWith('.png') &&
      !lower.endsWith('.jpg') &&
      !bannedEmailDomains.some(b => lower.includes(b)) &&
      !result.emails.includes(lower)
    ) {
      result.emails.push(lower);
    }
  }

  // Phones (international / standard formats)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}\b/g;
  const rawPhones = (result.visibleText).match(phoneRegex) || [];
  for (const p of rawPhones) {
    const cleaned = p.trim();
    // Must contain at least 7 digits to be a legitimate phone number
    const digitCount = (cleaned.match(/\d/g) || []).length;
    if (digitCount >= 7 && digitCount <= 15 && !result.phones.includes(cleaned)) {
      result.phones.push(cleaned);
    }
  }

  return result;
}

/**
 * Deterministically prioritizes discovered same-origin pages to crawl (up to MAX_PAGES_PER_DOMAIN)
 */
export function prioritizePagesToCrawl(rootUrl: string, candidateLinks: string[]): string[] {
  const queue: string[] = [];
  const root = rootUrl;
  queue.push(root);

  const cleanRootKey = root.toLowerCase().replace(/\/$/, '');
  const priorityKeywords = [
    ['about', 'story', 'company', 'who-we-are'],
    ['contact', 'reach-us', 'location', 'get-in-touch'],
    ['product', 'service', 'shop', 'collection', 'catalog', 'menu'],
    ['category', 'pricing', 'showroom']
  ];

  for (const group of priorityKeywords) {
    for (const link of candidateLinks) {
      if (queue.length >= MAX_PAGES_PER_DOMAIN) break;
      const lower = link.toLowerCase();
      const cleanLinkKey = lower.replace(/\/$/, '');
      if (cleanLinkKey !== cleanRootKey && !queue.includes(link) && group.some(kw => lower.includes(kw))) {
        queue.push(link);
      }
    }
  }

  // Add any remaining links up to max
  for (const link of candidateLinks) {
    if (queue.length >= MAX_PAGES_PER_DOMAIN) break;
    const cleanLinkKey = link.toLowerCase().replace(/\/$/, '');
    if (cleanLinkKey !== cleanRootKey && !queue.includes(link)) {
      queue.push(link);
    }
  }

  return queue.slice(0, MAX_PAGES_PER_DOMAIN);
}

/**
 * Compares website identity against canonical entity metadata.
 * Keyword overlap alone MUST NOT produce strong identity.
 */
export function evaluateBusinessIdentityMatch(
  lead: ExtensionLead,
  extractedIdentity: {
    title: string;
    organizationName?: string;
    logoAlt: string[];
    headings: string[];
    hostname: string;
  }
): {
  level: WebsiteIdentityMatchLevel;
  reason: string;
  evidenceItems: StructuredEvidence[];
} {
  const canonicalName = (lead.canonicalName || lead.name || '').toLowerCase().trim();
  const fbPageName = (lead.facebookPageName || '').toLowerCase().trim();
  const targetDomain = (lead.destinationDomain || '').toLowerCase().trim();
  const host = extractedIdentity.hostname.toLowerCase().replace(/^www\./, '');

  const extractedTokens = new Set<string>();
  const addTokens = (str?: string) => {
    if (!str) return;
    for (const tok of tokenizeText(str)) {
      extractedTokens.add(tok);
    }
  };

  addTokens(extractedIdentity.title);
  addTokens(extractedIdentity.organizationName);
  extractedIdentity.logoAlt.forEach(addTokens);
  extractedIdentity.headings.forEach(addTokens);

  // Exact or near-exact match in title, org name, or logo
  const cleanOrg = (extractedIdentity.organizationName || '').toLowerCase().trim();
  const cleanTitle = extractedIdentity.title.toLowerCase().trim();

  // Domain matches observed destination domain
  const isDirectDomainMatch = Boolean(targetDomain && (host === targetDomain || host.endsWith(`.${targetDomain}`)));

  const leadNameTokens = tokenizeText(canonicalName).filter(t => t.length > 2);
  const matchedTokens = leadNameTokens.filter(t => extractedTokens.has(t));
  const tokenOverlapRatio = leadNameTokens.length > 0 ? matchedTokens.length / leadNameTokens.length : 0;

  // 1. STRONG MATCH
  // Exact name in org name or title + domain consistency, or full brand tokens match
  if (
    (cleanOrg && (cleanOrg === canonicalName || cleanOrg.includes(canonicalName) || canonicalName.includes(cleanOrg))) ||
    (cleanTitle.includes(canonicalName) && isDirectDomainMatch) ||
    (tokenOverlapRatio >= 0.8 && isDirectDomainMatch && leadNameTokens.length >= 2) ||
    (extractedIdentity.logoAlt.some(alt => alt.toLowerCase().includes(canonicalName)))
  ) {
    return {
      level: 'STRONG',
      reason: `Website explicit business identity matches canonical entity "${lead.canonicalName}" with confirmed domain corroboration.`,
      evidenceItems: [{
        type: 'WEBSITE_IDENTITY',
        strength: 'STRONG',
        source: 'website_verification',
        reason: `Website branding matches entity name "${lead.canonicalName}" on domain ${host}`,
        value: cleanOrg || cleanTitle
      }]
    };
  }

  // 2. MODERATE MATCH
  if (
    (tokenOverlapRatio >= 0.6 && leadNameTokens.length >= 2) ||
    (isDirectDomainMatch && tokenOverlapRatio >= 0.4) ||
    (fbPageName && cleanTitle.includes(fbPageName))
  ) {
    return {
      level: 'MODERATE',
      reason: `Website displays substantial brand token overlap (${Math.round(tokenOverlapRatio * 100)}%) with entity "${lead.canonicalName}".`,
      evidenceItems: [{
        type: 'WEBSITE_IDENTITY',
        strength: 'MODERATE',
        source: 'website_verification',
        reason: `Substantial brand token overlap on domain ${host}`,
        value: matchedTokens.join(' ')
      }]
    };
  }

  // 3. CONTRADICTORY MATCH
  // Distinct company name clearly visible on a conflicting domain or distinct organization
  if (
    cleanOrg &&
    leadNameTokens.length >= 2 &&
    tokenOverlapRatio === 0 &&
    (!isDirectDomainMatch || tokenizeText(cleanOrg).filter(t => t.length > 2).length >= 2)
  ) {
    return {
      level: 'CONTRADICTORY',
      reason: `Website explicitly identifies as distinct company "${cleanOrg}", contradicting lead "${lead.canonicalName}".`,
      evidenceItems: [{
        type: 'WEBSITE_IDENTITY',
        strength: 'CONTRADICTORY',
        source: 'website_verification',
        reason: `Distinct entity identity "${cleanOrg}" contradicts "${lead.canonicalName}"`,
        value: cleanOrg
      }]
    };
  }

  // 4. WEAK MATCH (Generic keyword overlap only)
  if (tokenOverlapRatio > 0 && tokenOverlapRatio < 0.6) {
    return {
      level: 'WEAK',
      reason: `Weak token overlap only (${matchedTokens.join(', ')}). Insufficient for confirmed business identity.`,
      evidenceItems: [{
        type: 'WEBSITE_IDENTITY',
        strength: 'WEAK',
        source: 'website_verification',
        reason: `Weak name token overlap on domain ${host}`,
        value: matchedTokens.join(' ')
      }]
    };
  }

  return {
    level: 'UNKNOWN',
    reason: 'Insufficient distinct business identity evidence found on public website pages.',
    evidenceItems: []
  };
}

/**
 * Extracts commercial intent signals from combined website text
 */
export function extractCommercialSignals(combinedText: string): {
  signals: WebsiteCommercialSignalCode[];
  evidenceItems: StructuredEvidence[];
} {
  const lower = combinedText.toLowerCase();
  const signals = new Set<WebsiteCommercialSignalCode>();
  const evidenceItems: StructuredEvidence[] = [];

  const commercialMap: Array<{
    code: WebsiteCommercialSignalCode;
    pattern: RegExp;
    label: string;
  }> = [
    { code: 'WEBSITE_PRODUCT_SIGNAL', pattern: /\b(products?|catalog|collection|models?|items?|specs?|specifications?)\b/i, label: 'Product catalog signals' },
    { code: 'WEBSITE_SERVICE_SIGNAL', pattern: /\b(services?|solutions?|customization|consultation|repair|maintenance)\b/i, label: 'Service offerings' },
    { code: 'WEBSITE_PRICE_SIGNAL', pattern: /(\$|€|£|bdt|taka|price|pricing|starts at|cost|affordable|special deal|flat \d+%)/i, label: 'Explicit pricing' },
    { code: 'WEBSITE_ECOMMERCE_SIGNAL', pattern: /\b(add to cart|checkout|buy now|shop now|shopping cart|order online|buy online)\b/i, label: 'E-commerce cart functionality' },
    { code: 'WEBSITE_BOOKING_SIGNAL', pattern: /\b(book(?:ing|\s+(?:an?\s+)?appointment)?|appointment|schedule|reserve|reservation)\b/i, label: 'Appointment / booking system' },
    { code: 'WEBSITE_CONTACT_SIGNAL', pattern: /\b(contact(?:\s+(?:us|sales|support|team))?|get\s+(?:a\s+)?quote|request\s+(?:a\s+)?quote|inquire|inquiry|reach us)\b/i, label: 'Sales inquiry / quote mechanism' },
    { code: 'WEBSITE_LOCATION_SIGNAL', pattern: /\b(our locations?|store locator|find a store|headquarters|office address)\b/i, label: 'Physical store / office locations' },
    { code: 'WEBSITE_SHOWROOM_SIGNAL', pattern: /\b(showroom|experience center|visit our showroom|flagship store)\b/i, label: 'Physical showroom' },
    { code: 'WEBSITE_DELIVERY_SIGNAL', pattern: /\b(delivery|shipping|nationwide shipping|home delivery|dispatch|freight)\b/i, label: 'Delivery / shipping service' },
    { code: 'WEBSITE_WARRANTY_SIGNAL', pattern: /\b(warranty|guarantee|\d+\s*year warranty|money back)\b/i, label: 'Product / service warranty' }
  ];

  for (const item of commercialMap) {
    if (item.pattern.test(lower)) {
      signals.add(item.code);
      evidenceItems.push({
        type: 'WEBSITE_COMMERCIAL',
        strength: 'STRONG',
        source: 'website_verification',
        reason: item.label,
        matchedSignal: item.code,
        value: item.code
      });
    }
  }

  return {
    signals: Array.from(signals),
    evidenceItems
  };
}

/**
 * Matches website content against the active research category
 */
export function evaluateWebsiteCategoryMatch(
  lead: ExtensionLead,
  combinedText: string
): {
  level: WebsiteCategoryMatchLevel;
  evidenceItems: StructuredEvidence[];
} {
  const lower = combinedText.toLowerCase();
  const matchedKeywords = (lead.matchedKeywords || []).map(k => k.toLowerCase().trim()).filter(Boolean);

  let activeTaxonomyTerms: string[] = [];

  // Inspect predefined taxonomy
  for (const [key, tax] of Object.entries(BOUNDED_TAXONOMY)) {
    if (matchedKeywords.some(kw => kw.includes(key) || tax.rootTerms.some(rt => kw.includes(rt)))) {
      activeTaxonomyTerms = activeTaxonomyTerms.concat(tax.rootTerms, tax.productServiceTerms);
    }
  }

  // Fallback to matched keywords if taxonomy empty
  if (activeTaxonomyTerms.length === 0) {
    activeTaxonomyTerms = matchedKeywords;
  }

  const foundTerms = new Set<string>();
  for (const term of activeTaxonomyTerms) {
    if (lower.includes(term.toLowerCase())) {
      foundTerms.add(term);
    }
  }

  if (foundTerms.size >= 3) {
    return {
      level: 'STRONG',
      evidenceItems: [{
        type: 'WEBSITE_CATEGORY',
        strength: 'STRONG',
        source: 'website_verification',
        reason: `Strong category corroboration on website: ${Array.from(foundTerms).slice(0, 5).join(', ')}`,
        value: Array.from(foundTerms).join(', ')
      }]
    };
  }

  if (foundTerms.size >= 1) {
    return {
      level: 'MODERATE',
      evidenceItems: [{
        type: 'WEBSITE_CATEGORY',
        strength: 'MODERATE',
        source: 'website_verification',
        reason: `Category terms observed on website: ${Array.from(foundTerms).join(', ')}`,
        value: Array.from(foundTerms).join(', ')
      }]
    };
  }

  return {
    level: 'WEAK',
    evidenceItems: [{
      type: 'WEBSITE_CATEGORY',
      strength: 'WEAK',
      source: 'website_verification',
      reason: 'No clear category terms observed on public website.',
      value: 'NO_CATEGORY_TERMS'
    }]
  };
}

/**
 * Detects negative signals indicating non-business or mismatched destinations
 */
export function detectWebsiteNegativeSignals(
  combinedText: string,
  statusCode: number,
  pagesVisited: number
): {
  signals: WebsiteNegativeSignalCode[];
  evidenceItems: StructuredEvidence[];
} {
  const lower = combinedText.toLowerCase();
  const signals = new Set<WebsiteNegativeSignalCode>();
  const evidenceItems: StructuredEvidence[] = [];

  // Parked / For sale domains
  if (
    /(\bbuy this domain\b|\bdomain is for sale\b|\binquire about this domain\b|\bparked free\b|\bdomain parking\b|\bnamesilo\b|\bsedo\b|\bhugedomains\b|\bdan\.com\b)/i.test(lower)
  ) {
    signals.add('PARKED_DOMAIN');
    signals.add('DOMAIN_FOR_SALE');
    evidenceItems.push({
      type: 'WEBSITE_NEGATIVE',
      strength: 'CONTRADICTORY',
      source: 'website_verification',
      reason: 'Domain parking or domain-for-sale placeholder detected',
      matchedSignal: 'PARKED_DOMAIN'
    });
  }

  // Empty / Under construction site
  if (
    pagesVisited <= 1 &&
    (/(\bunder construction\b|\bcoming soon\b|\bwebsite coming soon\b|\bdefault web site page\b|\bindex of \/\b)/i.test(lower) || lower.length < 150)
  ) {
    signals.add('EMPTY_SITE');
    evidenceItems.push({
      type: 'WEBSITE_NEGATIVE',
      strength: 'MODERATE',
      source: 'website_verification',
      reason: 'Empty or under-construction placeholder site detected',
      matchedSignal: 'EMPTY_SITE'
    });
  }

  // Generic Directory / Yellow Pages aggregator
  if (
    /(\bbusiness directory\b|\byellow pages\b|\blocal business listings\b|\bfind local businesses\b|\btop 10 businesses\b)/i.test(lower) &&
    !/(\babout our company\b|\bour showroom\b|\bour factory\b)/i.test(lower)
  ) {
    signals.add('GENERIC_DIRECTORY');
    evidenceItems.push({
      type: 'WEBSITE_NEGATIVE',
      strength: 'CONTRADICTORY',
      source: 'website_verification',
      reason: 'Generic directory or listing portal destination detected',
      matchedSignal: 'GENERIC_DIRECTORY'
    });
  }

  // Job portal only
  if (
    /(\bjob vacancies\b|\bsearch jobs\b|\bpost a job\b|\bcareer portal\b|\bjob portal\b)/i.test(lower) &&
    !/(\bproducts\b|\bservices\b|\bour shop\b)/i.test(lower)
  ) {
    signals.add('JOB_PORTAL');
    evidenceItems.push({
      type: 'WEBSITE_NEGATIVE',
      strength: 'CONTRADICTORY',
      source: 'website_verification',
      reason: 'Job recruitment portal detected instead of direct commercial business',
      matchedSignal: 'JOB_PORTAL'
    });
  }

  // Personal blog
  if (
    /(\bmy personal blog\b|\bpersonal diary\b|\blifestyle blog by\b|\bwritten by a blogger\b)/i.test(lower) &&
    !/(\bshop\b|\bcart\b|\border\b|\bcompany\b|\bstore\b)/i.test(lower)
  ) {
    signals.add('PERSONAL_BLOG');
    evidenceItems.push({
      type: 'WEBSITE_NEGATIVE',
      strength: 'CONTRADICTORY',
      source: 'website_verification',
      reason: 'Personal blog or lifestyle journal destination detected',
      matchedSignal: 'PERSONAL_BLOG'
    });
  }

  // News / Media editorial portal
  if (
    /(\bbreaking news\b|\bdaily news\b|\bjournalism\b|\bop-ed\b|\bpress release\b|\bnews agency\b)/i.test(lower) &&
    !/(\bour products\b|\bour shop\b|\badd to cart\b|\bpricing\b)/i.test(lower)
  ) {
    signals.add('NEWS_ONLY');
    evidenceItems.push({
      type: 'WEBSITE_NEGATIVE',
      strength: 'CONTRADICTORY',
      source: 'website_verification',
      reason: 'News or media editorial publication detected instead of commercial business',
      matchedSignal: 'NEWS_ONLY'
    });
  }

  // Government / Municipal administration
  if (
    /(\bgovernment portal\b|\bofficial government\b|\bmunicipal services\b|\bpublic voting\b|\bdepartment of public works\b|\bcity hall\b)/i.test(lower)
  ) {
    signals.add('GENERIC_DIRECTORY');
    evidenceItems.push({
      type: 'WEBSITE_NEGATIVE',
      strength: 'CONTRADICTORY',
      source: 'website_verification',
      reason: 'Government or municipal administration portal detected instead of commercial business',
      matchedSignal: 'GENERIC_DIRECTORY'
    });
  }

  // Broken site
  if (statusCode >= 400) {
    signals.add('BROKEN_SITE');
    evidenceItems.push({
      type: 'WEBSITE_NEGATIVE',
      strength: 'CONTRADICTORY',
      source: 'website_verification',
      reason: `HTTP error status ${statusCode} returned by destination`,
      matchedSignal: 'BROKEN_SITE'
    });
  }

  return {
    signals: Array.from(signals),
    evidenceItems
  };
}

/**
 * Computes deterministic final website verification status
 */
export function determineFinalWebsiteStatus(
  reachable: boolean,
  isBlocked: boolean,
  identityLevel: WebsiteIdentityMatchLevel,
  commercialCount: number,
  negativeSignals: WebsiteNegativeSignalCode[]
): WebsiteVerificationStatus {
  if (isBlocked) {
    return 'BLOCKED';
  }

  if (!reachable) {
    return 'INVALID';
  }

  // Check critical negative signals
  if (
    negativeSignals.includes('PARKED_DOMAIN') ||
    negativeSignals.includes('DOMAIN_FOR_SALE') ||
    negativeSignals.includes('GENERIC_DIRECTORY') ||
    negativeSignals.includes('JOB_PORTAL') ||
    negativeSignals.includes('PERSONAL_BLOG') ||
    negativeSignals.includes('NEWS_ONLY')
  ) {
    return 'NOT_A_BUSINESS_SITE';
  }

  if (identityLevel === 'CONTRADICTORY') {
    return 'NOT_A_BUSINESS_SITE';
  }

  // VERIFIED_BUSINESS_WEBSITE:
  // Reachable + strong/moderate business identity + meaningful commercial evidence (>= 1 or 2 signals) + no critical contradiction
  if (
    (identityLevel === 'STRONG' && commercialCount >= 1) ||
    (identityLevel === 'MODERATE' && commercialCount >= 2)
  ) {
    return 'VERIFIED_BUSINESS_WEBSITE';
  }

  // LIKELY_BUSINESS_WEBSITE:
  // Business evidence present + identity match moderate or incomplete
  if (
    commercialCount >= 2 ||
    (identityLevel === 'MODERATE' && commercialCount >= 1) ||
    (identityLevel === 'WEAK' && commercialCount >= 1)
  ) {
    return 'LIKELY_BUSINESS_WEBSITE';
  }

  // UNCERTAIN_WEBSITE:
  // Sparse or ambiguous evidence
  return 'UNCERTAIN_WEBSITE';
}

/**
 * Main deep website verification entrypoint for a single lead.
 * Does NOT mutate existing leads on failure.
 * Honors 24-hour cache.
 */
export async function verifyLeadWebsite(
  lead: ExtensionLead,
  customFetch?: (url: string, timeoutMs: number) => Promise<{ status: number; html: string }>
): Promise<WebsiteVerificationRecord> {
  const startTime = Date.now();
  const originalUrl = lead.destinationUrl || (lead.observedUrls && lead.observedUrls[0]) || '';

  // 1. Check if website URL exists
  if (!originalUrl) {
    return {
      leadId: lead.id,
      canonicalName: lead.canonicalName || lead.name,
      originalUrl: '',
      normalizedUrl: '',
      finalUrl: '',
      finalOrigin: '',
      hostname: '',
      status: 'NO_WEBSITE',
      identityMatch: 'UNKNOWN',
      categoryMatch: 'UNKNOWN',
      commercialSignals: [],
      negativeSignals: [],
      evidence: [],
      pagesVisited: [],
      contactSignals: [],
      locationSignals: [],
      verifiedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime
    };
  }

  // 2. Normalize URL
  const norm = normalizeWebsiteUrl(originalUrl);
  if (!norm.isValid) {
    return {
      leadId: lead.id,
      canonicalName: lead.canonicalName || lead.name,
      originalUrl,
      normalizedUrl: norm.normalizedUrl,
      finalUrl: norm.finalUrl,
      finalOrigin: norm.finalOrigin,
      hostname: norm.finalHostname,
      status: 'INVALID',
      identityMatch: 'UNKNOWN',
      categoryMatch: 'UNKNOWN',
      commercialSignals: [],
      negativeSignals: ['BROKEN_SITE'],
      evidence: [],
      pagesVisited: [],
      contactSignals: [],
      locationSignals: [],
      verifiedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      errorCode: norm.error || 'INVALID_URL'
    };
  }

  // 3. Check 24h cache
  const cached = await getCachedWebsiteVerification(norm.finalHostname);
  if (cached) {
    return {
      ...cached,
      leadId: lead.id,
      canonicalName: lead.canonicalName || lead.name
    };
  }

  // 4. Destination consistency evaluation
  const destinationEvidence: StructuredEvidence[] = [];
  if (lead.destinationDomain) {
    const metaHost = lead.destinationDomain.toLowerCase().replace(/^www\./, '');
    const siteHost = norm.finalHostname.toLowerCase().replace(/^www\./, '');
    if (metaHost === siteHost || siteHost.endsWith(`.${metaHost}`)) {
      destinationEvidence.push({
        type: 'WEBSITE_DESTINATION',
        strength: 'STRONG',
        source: 'website_verification',
        reason: `Advertiser Meta destination matches verified site host: ${norm.finalHostname}`,
        matchedSignal: 'DESTINATION_MATCH_STRONG',
        value: norm.finalHostname
      });
    } else {
      destinationEvidence.push({
        type: 'WEBSITE_DESTINATION',
        strength: 'MODERATE',
        source: 'website_verification',
        reason: `Destination domain divergence: Meta ad pointed to ${metaHost}, website is ${siteHost}`,
        matchedSignal: 'DESTINATION_DOMAIN_CONFLICT',
        value: `${metaHost} != ${siteHost}`
      });
    }
  }

  // 5. Fetch executor (native browser fetch with timeout or injected test fetch)
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

  // 6. Crawl loop bounded by MAX_PAGES_PER_DOMAIN and MAX_DOMAIN_VERIFICATION_TIME_MS
  const pagesVisited: string[] = [];
  const allExtractedTexts: string[] = [];
  const allContactSignals: WebsiteContactSignal[] = [];
  const allLocationSignals = new Set<string>();
  let primaryTitle = '';
  let primaryOrgName: string | undefined;
  const primaryLogoAlts: string[] = [];
  const primaryHeadings: string[] = [];
  let isBlocked = false;
  let blockedReason: string | undefined;
  let crawlError: string | undefined;

  let pagesToCrawl: string[] = [norm.finalUrl];

  try {
    while (pagesToCrawl.length > 0 && pagesVisited.length < MAX_PAGES_PER_DOMAIN) {
      if (Date.now() - startTime >= MAX_DOMAIN_VERIFICATION_TIME_MS) {
        break; // Stop immediately upon reaching domain timeout
      }

      const currentUrl = pagesToCrawl.shift()!;
      if (pagesVisited.includes(currentUrl)) continue;

      pagesVisited.push(currentUrl);

      let pageRes: { status: number; html: string };
      try {
        pageRes = await fetcher(currentUrl, MAX_PAGE_TIMEOUT_MS);
      } catch (err: any) {
        if (pagesVisited.length === 1) {
          crawlError = err.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR';
        }
        continue;
      }

      if (pageRes.status === 403 || pageRes.status === 429) {
        isBlocked = true;
        blockedReason = `HTTP ${pageRes.status} access denied`;
        break;
      }

      const extracted = extractPageSignalsFromHtml(pageRes.html, currentUrl);
      if (extracted.isBlocked) {
        isBlocked = true;
        blockedReason = extracted.blockedReason;
        break;
      }

      // Collect text
      allExtractedTexts.push(`${extracted.title} ${extracted.metaDescription} ${extracted.visibleText}`);

      // Primary page metadata
      if (pagesVisited.length === 1) {
        primaryTitle = extracted.title;
        primaryOrgName = extracted.organizationName;
        primaryLogoAlts.push(...extracted.logoAlt);
        primaryHeadings.push(...extracted.h1, ...extracted.h2);

        // Update crawl queue with discovered same-origin links
        const prioritized = prioritizePagesToCrawl(norm.finalUrl, extracted.sameOriginLinks);
        for (const p of prioritized) {
          const pKey = p.toLowerCase().replace(/\/$/, '');
          const alreadyVisited = pagesVisited.some(v => v.toLowerCase().replace(/\/$/, '') === pKey);
          const alreadyQueued = pagesToCrawl.some(q => q.toLowerCase().replace(/\/$/, '') === pKey);
          if (!alreadyVisited && !alreadyQueued) {
            pagesToCrawl.push(p);
          }
        }
      }

      // Collect contacts
      for (const email of extracted.emails) {
        if (!allContactSignals.some(c => c.value === email)) {
          allContactSignals.push({ type: 'email', value: email });
        }
      }
      for (const phone of extracted.phones) {
        if (!allContactSignals.some(c => c.value === phone)) {
          allContactSignals.push({ type: 'phone', value: phone });
        }
      }
    }
  } catch (err: any) {
    crawlError = err.message || 'PARSE_ERROR';
  }

  // 7. Aggregate evidence across visited pages
  const combinedText = allExtractedTexts.join(' ');
  const reachable = pagesVisited.length > 0 && !crawlError;

  // Identity evaluation
  const identityMatch = evaluateBusinessIdentityMatch(lead, {
    title: primaryTitle,
    organizationName: primaryOrgName,
    logoAlt: primaryLogoAlts,
    headings: primaryHeadings,
    hostname: norm.finalHostname
  });

  // Commercial signals
  const commercial = extractCommercialSignals(combinedText);

  // Category evaluation
  const categoryMatch = evaluateWebsiteCategoryMatch(lead, combinedText);

  // Negative signals
  const negative = detectWebsiteNegativeSignals(combinedText, reachable ? 200 : 500, pagesVisited.length);

  // Determine final status
  const finalStatus = determineFinalWebsiteStatus(
    reachable,
    isBlocked,
    identityMatch.level,
    commercial.signals.length,
    negative.signals
  );

  // Compile structured evidence list
  const structuredEvidence: StructuredEvidence[] = [
    ...destinationEvidence,
    ...identityMatch.evidenceItems,
    ...commercial.evidenceItems,
    ...categoryMatch.evidenceItems,
    ...negative.evidenceItems
  ];

  // Contact signals structured evidence
  if (allContactSignals.length > 0) {
    structuredEvidence.push({
      type: 'WEBSITE_CONTACT',
      strength: 'STRONG',
      source: 'website_verification',
      reason: `Discovered ${allContactSignals.length} public contact channel(s) on website`,
      value: allContactSignals.map(c => `${c.type}:${c.value}`).slice(0, 3).join(', ')
    });
  }

  const record: WebsiteVerificationRecord = {
    leadId: lead.id,
    canonicalName: lead.canonicalName || lead.name,
    originalUrl,
    normalizedUrl: norm.normalizedUrl,
    finalUrl: norm.finalUrl,
    finalOrigin: norm.finalOrigin,
    hostname: norm.finalHostname,
    status: finalStatus,
    identityMatch: identityMatch.level,
    categoryMatch: categoryMatch.level,
    commercialSignals: commercial.signals,
    negativeSignals: negative.signals,
    evidence: structuredEvidence,
    pagesVisited,
    contactSignals: allContactSignals,
    locationSignals: Array.from(allLocationSignals),
    verifiedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    blockedReason,
    errorCode: crawlError
  };

  // 8. Cache successful result
  if (finalStatus !== 'INVALID' && finalStatus !== 'BLOCKED') {
    await setCachedWebsiteVerification(norm.finalHostname, record);
  }

  return record;
}
