/**
 * LeadNoria — Google Maps Browser Acquisition Adapter
 *
 * Extracts publicly rendered business listing information from the user's
 * active Google Maps browser tab (google.com/maps) using only DOM APIs
 * available to a Chrome extension content script.
 *
 * HARD BOUNDARIES (non-negotiable):
 * - NO Google Maps API / Places API / API keys / OAuth.
 * - NO private or undocumented Google endpoints.
 * - NO fetch/XHR to google.com or any Google service.
 * - NO CAPTCHA solving, anti-bot bypass, stealth automation,
 *   proxy/IP rotation, or fingerprint spoofing.
 * - NO reverse-engineering of Google's internal JSON/RPC payloads.
 * - Reads ONLY visible rendered DOM text available to any sighted user.
 * - All content treated as untrusted input — sanitized before use.
 * - All extracted fields carry GOOGLE_DERIVED provenance.
 * - NOT_PERSISTABLE and NOT_EXPORTABLE enforced on all fields.
 *
 * Mechanism:
 * Standard Chrome Extension DOM API (querySelector / textContent / getAttribute)
 * applied to visible rendered elements on google.com/maps. This is identical
 * to a user reading the page with their eyes or using a screen reader.
 *
 * Architecture:
 * - Implements BrowserAcquisitionAdapter interface (source-neutral)
 * - Emits AcquisitionCandidate envelopes (not NormalizedCandidate)
 * - Normalization is downstream (mapsNormalizer.ts)
 * - Deduplication is acquisition-level only (exact signature)
 */

import type {
  BrowserAcquisitionAdapter,
  AcquisitionSourceId,
  AcquisitionCandidate,
  AcquisitionSessionConfig,
  AcquisitionError,
  GoogleMapsObservedFields,
  PageDetectionResult,
  MapsPageType,
  AcquisitionEvent,
  AcquisitionEventType
} from './browserAcquisitionTypes.ts';

// ==========================================
// Constants
// ==========================================

const ADAPTER_VERSION = '1.0.0-phase19';
const SOURCE_ID: AcquisitionSourceId = 'GOOGLE_MAPS_CONSUMER_WEB';

/** Max text length accepted from any single DOM node — prevents memory overload */
const MAX_TEXT_LENGTH = 500;

/** Max items in opening hours array */
const MAX_HOURS_ENTRIES = 14;

/** Max service attribute strings */
const MAX_SERVICE_ATTRIBUTES = 20;

// ==========================================
// Security: Text Sanitization
// ==========================================

/**
 * Sanitize a raw DOM text value.
 * - Truncates to MAX_TEXT_LENGTH
 * - Strips null bytes and control characters (except tab/newline)
 * - Normalizes unicode to NFC
 * - Rejects javascript: and data: prefixes (security)
 * - Returns undefined for empty/unsafe input
 */
function sanitizeText(raw: string | null | undefined): string | undefined {
  if (raw == null) return undefined;
  let s = String(raw);
  // Reject javascript: / data: URI schemes in text values
  const lower = s.trim().toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) return undefined;
  // Strip null bytes and non-printable control chars (keep \t, \n, \r)
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  // Unicode NFC normalization
  try { s = s.normalize('NFC'); } catch { /* older environments */ }
  // Trim and truncate
  s = s.trim().slice(0, MAX_TEXT_LENGTH);
  return s.length > 0 ? s : undefined;
}

/**
 * Sanitize a URL string extracted from DOM.
 * - Must be http: or https: only
 * - Max 2000 chars
 * - Returns undefined for unsafe/invalid input
 */
function sanitizeUrl(raw: string | null | undefined): string | undefined {
  if (raw == null) return undefined;
  const s = raw.trim().slice(0, 2000);
  try {
    const url = new URL(s);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

// ==========================================
// Observability Logger
// ==========================================

/**
 * Structured logger for acquisition events.
 * Uses console with [GMAPS-ACQ] prefix so it's filterable.
 * Does NOT log raw page content or PII.
 */
class AcquisitionLogger {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  emit(type: AcquisitionEventType, message: string, meta?: Record<string, unknown>): AcquisitionEvent {
    const event: AcquisitionEvent = {
      type,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      message,
      metadata: meta
    };
    console.log(`[GMAPS-ACQ] [${type}] ${message}`, meta ?? '');
    return event;
  }

  warn(message: string): void {
    console.warn(`[GMAPS-ACQ] WARN: ${message}`);
  }

  error(message: string): void {
    console.error(`[GMAPS-ACQ] ERROR: ${message}`);
  }
}

// ==========================================
// Acquisition ID Generation
// ==========================================

function generateAcquisitionId(sessionId: string, index: number): string {
  return `gmaps_acq_${sessionId}_${index}_${Date.now().toString(36)}`;
}

// ==========================================
// Dedup Signature
// ==========================================

/**
 * Lightweight acquisition-level dedup signature.
 * Based on normalized business name + normalized address (if present).
 * NOT entity-resolution — just prevents exact duplicate DOM reads.
 */
function buildDedupSignature(fields: GoogleMapsObservedFields): string {
  const name = (fields.businessName ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
  const addr = (fields.address ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
  const url = (fields.mapsUrl ?? fields.listingUrl ?? '').split('?')[0];
  // Prefer URL-based dedup when available (most stable)
  if (url) return `url:${url}`;
  if (name && addr) return `name+addr:${name}|${addr}`;
  if (name) return `name:${name}`;
  return `raw:${JSON.stringify(fields).slice(0, 200)}`;
}

// ==========================================
// DOM Selectors
// ==========================================

/**
 * Google Maps DOM selectors for rendered listing elements.
 *
 * These target visible rendered text, not hidden data attributes or
 * internal JSON payloads. They reflect what a sighted user sees.
 *
 * NOTE: Google Maps may change its DOM structure at any time.
 * The adapter handles missing elements gracefully (returns undefined).
 * Selector changes are confined to this one object — no other file
 * needs updating when Google's DOM changes.
 */
const SELECTORS = {
  // Search results list container
  resultsPanel: 'div[role="feed"]',

  // Individual result card in the list
  resultCard: 'div[role="feed"] > div[jsaction]',

  // Business name in result card
  cardName: '.qBF1Pd, [class*="fontHeadlineSmall"], .NrDZNb',

  // Category in result card
  cardCategory: '.W4Efsd .W4Efsd span, .YkTo7b, [jsan*="category"]',

  // Rating in result card
  cardRating: 'span[aria-label*="stars"], span[aria-label*="rated"], .MW4etd',

  // Review count in result card
  cardReviewCount: '.UY7F9, .e4rVHe, [aria-label*="reviews"]',

  // Address in result card
  cardAddress: '.W4Efsd .W4Efsd .W4Efsd span, .GHT2ce .rllt__details .rllt__wrapped',

  // Business status in result card
  cardStatus: '.YhemCb, [aria-label*="Closed"], [aria-label*="Open"]',

  // Link for the listing (maps.google.com/maps/place/...)
  cardLink: 'a[href*="/maps/place/"], a[href*="google.com/maps/place/"]',

  // Detail panel (right side / bottom sheet when listing selected)
  detailPanel: 'div[role="main"][aria-label]',

  // Business name in detail panel
  detailName: 'h1.DUwDvf, h1[class*="fontHeadlineLarge"], .lMbq3e h1',

  // Category in detail panel
  detailCategory: 'button[jsaction*="category"], .DkEaL, .LBgpqf button',

  // Address in detail panel
  detailAddress: 'button[data-item-id="address"] .Io6YTe, [data-item-id="address"] .rogA2c',

  // Phone in detail panel
  detailPhone: 'button[data-item-id*="phone"] .Io6YTe, [data-item-id*="phone:tel"] .rogA2c',

  // Website in detail panel
  detailWebsite: 'a[data-item-id="authority"], a[href][data-tooltip*="website"]',

  // Opening hours in detail panel
  detailHours: 'table.WgFkxc tr, div[aria-label*="hours"] tr',

  // Rating in detail panel
  detailRating: 'div.F7nice span[aria-hidden="true"], .Aq14fc',

  // Review count in detail panel
  detailReviewCount: 'button[jsaction*="review"] span.HHrUdb, div.F7nice span[aria-label*="reviews"]',

  // Description in detail panel
  detailDescription: '.PYvSYb, [data-attrid*="description"] .LGOjhe',

  // Business status in detail panel
  detailStatus: '.o0Svhf, button[jsaction*="openhours"] .ZDu9vd',

  // Price level in detail panel
  detailPrice: 'span.mgr77e, .TB0oVb',

  // Service attributes
  detailAttributes: '.E0DTEd .e2moi, .iP2t7d .l0uA6',

  // Place ID from URL (when on /maps/place/ URL)
  // Not a DOM selector — parsed from window.location

  // Results list scroll container
  scrollContainer: 'div[role="feed"]'
} as const;

// ==========================================
// DOM Extraction Helpers
// ==========================================

function queryText(root: Element | Document, selector: string): string | undefined {
  try {
    const el = root.querySelector(selector);
    return el ? sanitizeText(el.textContent) : undefined;
  } catch {
    return undefined;
  }
}

function queryAttr(root: Element | Document, selector: string, attr: string): string | undefined {
  try {
    const el = root.querySelector(selector);
    return el ? sanitizeText(el.getAttribute(attr)) : undefined;
  } catch {
    return undefined;
  }
}

function queryAllTexts(root: Element | Document, selector: string, max: number): string[] {
  try {
    const els = Array.from(root.querySelectorAll(selector)).slice(0, max);
    return els
      .map(el => sanitizeText(el.textContent))
      .filter((t): t is string => t != null);
  } catch {
    return [];
  }
}

// ==========================================
// Coordinate Extraction from URL
// ==========================================

/**
 * Extract lat/lng from the current page URL if available.
 * Google Maps encodes coordinates in the URL as @lat,lng,zoom
 * This is publicly visible in the browser address bar.
 */
function extractCoordinatesFromUrl(url: string): { latitude?: number; longitude?: number } {
  try {
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (!match) return {};
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (isNaN(lat) || isNaN(lng)) return {};
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return {};
    return { latitude: lat, longitude: lng };
  } catch {
    return {};
  }
}

/**
 * Extract place ID from URL if safely present.
 * Only from /maps/place/NAME/data=... patterns where it's in the visible URL.
 */
function extractPlaceIdFromUrl(url: string): string | undefined {
  try {
    // Pattern: /maps/place/.../data=!...!1s<placeId>!...
    // The place ID appears in data= parameter in URL
    const match = url.match(/[?&!]1s(ChIJ[A-Za-z0-9_-]{20,})/);
    if (match && match[1]) return match[1];
    return undefined;
  } catch {
    return undefined;
  }
}

// ==========================================
// Card-Level Extraction
// ==========================================

/**
 * Extract observed fields from a single search result card element.
 * Reads only visible rendered text. Returns partial fields — missing
 * fields are simply absent, not null-padded.
 */
function extractCardFields(
  card: Element,
  pageUrl: string,
  searchContext?: string
): GoogleMapsObservedFields {
  const fields: GoogleMapsObservedFields = {};

  // Business name
  const name = queryText(card, SELECTORS.cardName);
  if (name) fields.businessName = name;

  // Category (first occurrence in card)
  const cats = queryAllTexts(card, SELECTORS.cardCategory, 3);
  if (cats.length > 0) {
    fields.category = cats[0];
    if (cats.length > 1) fields.secondaryCategories = cats.slice(1);
  }

  // Rating
  const ratingEl = card.querySelector('span[aria-label]');
  if (ratingEl) {
    const ariaLabel = sanitizeText(ratingEl.getAttribute('aria-label'));
    if (ariaLabel && (ariaLabel.includes('star') || ariaLabel.includes('rated'))) {
      // Extract number from aria-label like "4.5 stars"
      const ratingMatch = ariaLabel.match(/(\d+\.?\d*)/);
      if (ratingMatch) fields.rating = ratingMatch[1];
    }
    // Fallback: text content of rating element
    if (!fields.rating) {
      const ratingText = sanitizeText(ratingEl.textContent);
      if (ratingText && /^\d+\.?\d*$/.test(ratingText)) fields.rating = ratingText;
    }
  }

  // Review count — look for parenthesized number
  const reviewText = queryText(card, SELECTORS.cardReviewCount);
  if (reviewText) {
    const reviewMatch = reviewText.match(/[\(（]?([\d,]+)[\)）]?/);
    if (reviewMatch) fields.reviewCount = reviewMatch[1].replace(/,/g, '');
  }

  // Business status
  const statusText = queryText(card, SELECTORS.cardStatus);
  if (statusText) fields.businessStatus = statusText;

  // Listing URL
  const linkEl = card.querySelector(SELECTORS.cardLink) as HTMLAnchorElement | null;
  if (linkEl) {
    const href = sanitizeUrl(linkEl.href);
    if (href) {
      fields.listingUrl = href;
      // Try to extract place ID from the listing URL
      const pid = extractPlaceIdFromUrl(href);
      if (pid) {
        fields.placeId = pid;
        fields.sourceRecordId = pid;
      }
    }
  }

  // Phase 20 structured field aliases
  if (fields.category) fields.primaryCategory = fields.category;
  if (fields.address) fields.fullAddress = fields.address;

  // Coordinates (from main page URL, shared for all cards on search results)
  const coords = extractCoordinatesFromUrl(pageUrl);
  if (coords.latitude != null) fields.latitude = coords.latitude;
  if (coords.longitude != null) fields.longitude = coords.longitude;

  fields.mapsUrl = sanitizeUrl(pageUrl) ?? pageUrl;

  if (searchContext) {
    fields.searchContext = searchContext;
    fields.searchQuery = searchContext;
  }

  return fields;
}

// ==========================================
// Detail Panel Extraction
// ==========================================

/**
 * Extract observed fields from the detail panel (place detail view).
 * More complete data than card view. Called only when collectDetails=true.
 */
function extractDetailPanelFields(
  doc: Document,
  pageUrl: string,
  searchContext?: string
): Partial<GoogleMapsObservedFields> | null {
  const panel = doc.querySelector(SELECTORS.detailPanel);
  if (!panel) return null;

  const fields: Partial<GoogleMapsObservedFields> = {};

  // Business name
  const name = queryText(panel, SELECTORS.detailName);
  if (name) fields.businessName = name;

  // Category
  const category = queryText(panel, SELECTORS.detailCategory);
  if (category) fields.category = category;

  // Address
  const address = queryText(panel, SELECTORS.detailAddress);
  if (address) fields.address = address;

  // Phone — sanitize to prevent injection
  const phone = queryText(panel, SELECTORS.detailPhone);
  if (phone) {
    // Allow only digits, spaces, +, -, (, ), .
    const sanitizedPhone = phone.replace(/[^\d\s+\-().]/g, '').trim();
    if (sanitizedPhone.length > 0) fields.phone = sanitizedPhone;
  }

  // Website URL
  const websiteEl = panel.querySelector(SELECTORS.detailWebsite) as HTMLAnchorElement | null;
  if (websiteEl) {
    // Google Maps uses redirect URLs like google.com/url?q=... — extract actual destination
    const href = websiteEl.href ?? '';
    let resolvedUrl: string | undefined;
    try {
      const parsed = new URL(href);
      // Handle Google redirect wrapper
      if (parsed.hostname.includes('google.com') && parsed.searchParams.has('q')) {
        resolvedUrl = sanitizeUrl(parsed.searchParams.get('q'));
      } else {
        resolvedUrl = sanitizeUrl(href);
      }
    } catch {
      resolvedUrl = undefined;
    }
    if (resolvedUrl) fields.websiteUrl = resolvedUrl;
  }

  // Opening hours
  const hoursRows = queryAllTexts(panel, SELECTORS.detailHours, MAX_HOURS_ENTRIES);
  if (hoursRows.length > 0) fields.openingHours = hoursRows;

  // Rating
  const ratingEl = panel.querySelector(SELECTORS.detailRating);
  if (ratingEl) {
    const ratingText = sanitizeText(ratingEl.textContent);
    if (ratingText && /^\d+\.?\d*$/.test(ratingText)) fields.rating = ratingText;
  }

  // Review count
  const reviewEl = panel.querySelector(SELECTORS.detailReviewCount);
  if (reviewEl) {
    const reviewLabel = sanitizeText(reviewEl.getAttribute('aria-label') ?? reviewEl.textContent);
    if (reviewLabel) {
      const m = reviewLabel.match(/([\d,]+)/);
      if (m) fields.reviewCount = m[1].replace(/,/g, '');
    }
  }

  // Description
  const description = queryText(panel, SELECTORS.detailDescription);
  if (description) fields.description = description;

  // Business status
  const status = queryText(panel, SELECTORS.detailStatus);
  if (status) fields.businessStatus = status;

  // Price level
  const price = queryText(panel, SELECTORS.detailPrice);
  if (price) {
    // Only accept price level symbols: $, $$, $$$, $$$$
    const priceClean = price.replace(/[^$€£¥₹]/g, '');
    if (priceClean.length > 0 && priceClean.length <= 4) fields.priceLevel = priceClean;
  }

  // Service attributes
  const attrs = queryAllTexts(panel, SELECTORS.detailAttributes, MAX_SERVICE_ATTRIBUTES);
  if (attrs.length > 0) {
    fields.serviceAttributes = attrs;
    fields.serviceOptions = attrs;
  }

  // Phase 20 structured field aliases
  if (fields.category) fields.primaryCategory = fields.category;
  if (fields.address) fields.fullAddress = fields.address;

  // Coordinates from URL
  const coords = extractCoordinatesFromUrl(pageUrl);
  if (coords.latitude != null) fields.latitude = coords.latitude;
  if (coords.longitude != null) fields.longitude = coords.longitude;

  // Place ID from URL
  const pid = extractPlaceIdFromUrl(pageUrl);
  if (pid) {
    fields.placeId = pid;
    fields.sourceRecordId = pid;
  }

  fields.mapsUrl = sanitizeUrl(pageUrl) ?? pageUrl;
  fields.listingUrl = sanitizeUrl(pageUrl) ?? pageUrl;

  if (searchContext) {
    fields.searchContext = searchContext;
    fields.searchQuery = searchContext;
  }

  return Object.keys(fields).length > 0 ? fields : null;
}

// ==========================================
// Google Maps Browser Adapter Implementation
// ==========================================

export class GoogleMapsBrowserAdapter implements BrowserAcquisitionAdapter {
  readonly sourceId: AcquisitionSourceId = SOURCE_ID;
  readonly adapterVersion = ADAPTER_VERSION;

  private logger: AcquisitionLogger;
  private mutationObserver: MutationObserver | null = null;
  private observedMutations = 0;
  private candidateIndex = 0;

  constructor(sessionId: string) {
    this.logger = new AcquisitionLogger(sessionId);
  }

  // ──────────────────────────────────────────
  // Page Detection
  // ──────────────────────────────────────────

  detectSupportedPage(url: string): PageDetectionResult {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      const pathname = parsed.pathname;

      // Must be google.com/maps (various regional TLDs) OR maps.google.com
      const isMapsSubdomain = hostname === 'maps.google.com';
      const isGoogleMapsPath =
        (hostname === 'www.google.com' || hostname === 'google.com' || hostname.endsWith('.google.com')) &&
        (pathname.startsWith('/maps') || isMapsSubdomain);

      if (!isGoogleMapsPath && !isMapsSubdomain) {
        return {
          isSupported: false,
          pageType: 'UNKNOWN',
          url,
          reason: 'Not a Google Maps URL'
        };
      }

      // Identify page type
      let pageType: MapsPageType = 'UNKNOWN';
      if (pathname.startsWith('/maps/place/') || pathname.startsWith('/maps/place')) {
        pageType = 'PLACE_DETAIL';
      } else if (
        pathname.startsWith('/maps/search/') ||
        pathname.startsWith('/maps/search') ||
        parsed.searchParams.has('q') ||
        pathname === '/maps' ||
        pathname === '/maps/' ||
        pathname === '/' && isMapsSubdomain  // maps.google.com/
      ) {
        pageType = 'SEARCH_RESULTS';
      }

      if (pageType === 'UNKNOWN') {
        return {
          isSupported: false,
          pageType,
          url,
          reason: 'Unrecognised Maps page type (not search results or place detail)'
        };
      }

      return { isSupported: true, pageType, url };
    } catch {
      return {
        isSupported: false,
        pageType: 'UNKNOWN',
        url,
        reason: 'Invalid URL'
      };
    }
  }

  // ──────────────────────────────────────────
  // Page Readiness
  // ──────────────────────────────────────────

  isPageReady(): boolean {
    if (typeof document === 'undefined') return false;
    // Check that the results feed or detail panel is present and has children
    const feed = document.querySelector(SELECTORS.resultsPanel);
    if (feed && feed.children.length > 0) return true;
    const detail = document.querySelector(SELECTORS.detailPanel);
    if (detail && detail.textContent && detail.textContent.trim().length > 10) return true;
    return false;
  }

  // ──────────────────────────────────────────
  // Observer Management
  // ──────────────────────────────────────────

  attachObservers(config: AcquisitionSessionConfig): void {
    if (typeof MutationObserver === 'undefined') return;
    if (this.mutationObserver) return; // Already attached

    this.observedMutations = 0;
    this.mutationObserver = new MutationObserver((mutations) => {
      this.observedMutations += mutations.length;
    });

    const target = document.querySelector(SELECTORS.resultsPanel) ?? document.body;
    this.mutationObserver.observe(target, {
      childList: true,
      subtree: true
    });

    this.logger.emit('OBSERVER_ATTACHED', 'MutationObserver attached to results feed');
  }

  detachObservers(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
      this.logger.emit('OBSERVER_DETACHED', 'MutationObserver detached');
    }
  }

  // ──────────────────────────────────────────
  // Candidate Collection
  // ──────────────────────────────────────────

  collectVisibleCandidates(
    config: AcquisitionSessionConfig,
    seenSignatures: Set<string>
  ): AcquisitionCandidate[] {
    if (typeof document === 'undefined') return [];

    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const results: AcquisitionCandidate[] = [];

    // Try result cards (search results page)
    const cards = Array.from(document.querySelectorAll(SELECTORS.resultCard));

    if (cards.length > 0) {
      for (const card of cards) {
        if (results.length + seenSignatures.size >= config.maxCandidates) break;

        try {
          const observed = extractCardFields(card, pageUrl, config.searchContext);

          // Must have at minimum a business name to be useful
          if (!observed.businessName) continue;

          const sig = buildDedupSignature(observed);
          if (seenSignatures.has(sig)) {
            this.logger.emit('CANDIDATE_SKIPPED', 'Duplicate signature — skipped', { sig });
            continue;
          }

          seenSignatures.add(sig);
          this.candidateIndex++;

          const candidate: AcquisitionCandidate = {
            acquisitionId: generateAcquisitionId(config.sessionId, this.candidateIndex),
            source: SOURCE_ID,
            sourceUrl: pageUrl,
            observedAt: new Date().toISOString(),
            sessionId: config.sessionId,
            observed,
            dedupSignature: sig,
            provenance: 'GOOGLE_DERIVED',
            restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
            sourceContribution: {
              source: 'GOOGLE_MAPS',
              acquisitionContext: 'GOOGLE_CONSUMER_WEB',
              isRestricted: true,
              policyStatus: 'POLICY_GATED',
              persistenceStatus: 'NOT_PERSISTABLE',
              exportStatus: 'NOT_EXPORTABLE'
            },
            warnings: [],
            errors: []
          };

          results.push(candidate);
          this.logger.emit('CANDIDATE_DISCOVERED', `Candidate: ${observed.businessName}`, {
            acquisitionId: candidate.acquisitionId,
            sig
          });
        } catch (err) {
          const acqError: AcquisitionError = {
            code: 'EXTRACTION_FAILED',
            message: err instanceof Error ? err.message : 'Unknown extraction error',
            recoverable: true,
            timestamp: new Date().toISOString()
          };
          this.logger.error(`Card extraction failed: ${acqError.message}`);
          // Continue — single card failure does not stop session
        }
      }
    } else {
      // Fallback: try detail panel if no cards found
      if (config.collectDetails) {
        try {
          const detailFields = extractDetailPanelFields(document, pageUrl, config.searchContext);
          if (detailFields && detailFields.businessName) {
            const observed: GoogleMapsObservedFields = detailFields as GoogleMapsObservedFields;
            const sig = buildDedupSignature(observed);
            if (!seenSignatures.has(sig)) {
              seenSignatures.add(sig);
              this.candidateIndex++;
              results.push({
                acquisitionId: generateAcquisitionId(config.sessionId, this.candidateIndex),
                source: SOURCE_ID,
                sourceUrl: pageUrl,
                observedAt: new Date().toISOString(),
                sessionId: config.sessionId,
                observed,
                dedupSignature: sig,
                provenance: 'GOOGLE_DERIVED',
                restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
                sourceContribution: {
                  source: 'GOOGLE_MAPS',
                  acquisitionContext: 'GOOGLE_CONSUMER_WEB',
                  isRestricted: true,
                  policyStatus: 'POLICY_GATED',
                  persistenceStatus: 'NOT_PERSISTABLE',
                  exportStatus: 'NOT_EXPORTABLE'
                },
                warnings: ['Collected from detail panel, not search results list'],
                errors: []
              });
            }
          }
        } catch {
          // Non-fatal
        }
      }
    }

    return results;
  }

  collectDetailPanel(
    config: AcquisitionSessionConfig
  ): Partial<GoogleMapsObservedFields> | null {
    if (typeof document === 'undefined') return null;
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    return extractDetailPanelFields(document, pageUrl, config.searchContext);
  }

  // ──────────────────────────────────────────
  // Scroll
  // ──────────────────────────────────────────

  /**
   * Trigger a single bounded scroll step on the results list.
   * Uses the results feed container scroll, not window.scrollBy.
   * Returns true if scroll was triggered, false if not applicable.
   */
  triggerScroll(): boolean {
    if (typeof document === 'undefined') return false;
    const feed = document.querySelector(SELECTORS.scrollContainer) as HTMLElement | null;
    if (feed) {
      feed.scrollBy({ top: 800, behavior: 'smooth' });
      return true;
    }
    // Fallback: scroll the window
    if (typeof window !== 'undefined') {
      window.scrollBy({ top: 800, behavior: 'smooth' });
      return true;
    }
    return false;
  }

  isAtBottom(): boolean {
    if (typeof document === 'undefined') return true;
    const feed = document.querySelector(SELECTORS.scrollContainer) as HTMLElement | null;
    if (feed) {
      return feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 50;
    }
    if (typeof window !== 'undefined') {
      return window.innerHeight + window.scrollY >= document.body.scrollHeight - 100;
    }
    return true;
  }

  // ──────────────────────────────────────────
  // Dispose
  // ──────────────────────────────────────────

  dispose(): void {
    this.detachObservers();
    this.candidateIndex = 0;
    this.observedMutations = 0;
    this.logger.emit('OBSERVER_DETACHED', 'Adapter disposed — all resources released');
  }
}
