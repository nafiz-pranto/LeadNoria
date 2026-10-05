/**
 * LeadNoria — Phase 20: Google Maps Field Extraction + Coverage Engine
 * Multi-Stage Extraction Engine
 *
 * Implements the 5-stage controlled extraction lifecycle:
 * STAGE A: Discover visible listing candidates
 * STAGE B: Extract listing-level fields from cards
 * STAGE C: Collect detail-level fields when permitted by config
 * STAGE D: Normalize with field-level lineage & quality calculation
 * STAGE E: Emit structured Google-derived business record
 *
 * Invariants:
 * - Operates strictly on browser-rendered visible DOM in content-script/page context.
 * - ZERO Google API calls, Places API calls, or private endpoints.
 * - Robust, structural and semantic signals (aria-labels, data attributes, role attributes).
 * - Safe against delayed fields, missing fields, DOM variations, and repeated nodes.
 * - Bounded execution; does not navigate endlessly or scroll infinitely.
 * - GOOGLE_DERIVED, NOT_PERSISTABLE, NOT_EXPORTABLE strictly preserved.
 */

import type { GoogleMapsObservedFields, AcquisitionSessionConfig } from './browserAcquisitionTypes.ts';
import type { GoogleMapsNormalizedRecord } from './googleMapsFieldModel.ts';
import { normalizeGoogleMapsRecord, cleanText } from './googleMapsFieldNormalizer.ts';

// Bounded arrays to prevent excessive memory usage
const MAX_HOURS_ENTRIES = 14;
const MAX_ATTRIBUTES = 25;
const MAX_TEXT_LEN = 500;

// Stable semantic and structural selectors
export const EXTRACTION_SELECTORS = {
  // Results Feed
  feed: 'div[role="feed"], div[aria-label*="Results"], div[aria-label*="results"]',
  cards: 'div[role="feed"] > div[jsaction], div[role="article"], div[jsaction*="mouseover"]:has(a[href*="/maps/place/"])',

  // Card Level
  cardName: '.qBF1Pd, [class*="fontHeadlineSmall"], h3, .NrDZNb, [role="heading"]',
  cardLink: 'a[href*="/maps/place/"], a[href*="google.com/maps/place/"]',
  cardRating: 'span[aria-label*="star"], span[aria-label*="rated"], span.MW4etd',
  cardReviews: 'span[aria-label*="review"], .UY7F9, .e4rVHe',
  cardCategory: '.W4Efsd .W4Efsd span, .YkTo7b, [jsan*="category"]',
  cardAddress: '.W4Efsd .W4Efsd .W4Efsd span, .GHT2ce span',
  cardStatus: '.YhemCb, [aria-label*="Closed"], [aria-label*="Open"]',

  // Detail Panel
  detailPanel: 'div[role="main"], div[role="region"][aria-label], div.m6QErb.WNBkOb',
  detailName: 'h1.DUwDvf, h1[class*="fontHeadlineLarge"], h1',
  detailCategory: 'button[jsaction*="category"], .DkEaL, button.DkEaL',
  detailAddress: 'button[data-item-id="address"] .Io6YTe, [data-item-id="address"], button[aria-label*="Address"] .Io6YTe',
  detailPhone: 'button[data-item-id*="phone"] .Io6YTe, [data-item-id*="phone:tel"], button[aria-label*="Phone"] .Io6YTe',
  detailWebsite: 'a[data-item-id="authority"], a[aria-label*="Website"], a[data-tooltip*="website"]',
  detailHours: 'table.WgFkxc tr, div[aria-label*="hours"] tr, div[aria-label*="Hours"] tr',
  detailRating: 'div.F7nice span[aria-hidden="true"], span.ceNzKf',
  detailReviews: 'button[jsaction*="review"] span.HHrUdb, div.F7nice span[aria-label*="reviews"]',
  detailDescription: '.PYvSYb, [data-attrid*="description"]',
  detailStatus: '.o0Svhf, [aria-label*="Temporarily closed"], [aria-label*="Closed"]',
  detailPrice: 'span.mgr77e, span[aria-label*="Price:"]',
  detailServiceOptions: 'div[aria-label*="Service options"] span, .E0DTEd .e2moi',
  detailAccessibility: 'div[aria-label*="Accessibility"] span, div[aria-label*="accessibility"] span',
  detailAmenities: 'div[aria-label*="Amenities"] span, div[aria-label*="amenities"] span',
  detailGeneralAttributes: '.iP2t7d .l0uA6, .E0DTEd span'
} as const;

// ==========================================
// Helper Utilities
// ==========================================

function safeQueryText(root: Element | Document, selector: string): string | undefined {
  try {
    const el = root.querySelector(selector);
    if (!el || !el.textContent) return undefined;
    const txt = cleanText(el.textContent);
    return txt ? txt.slice(0, MAX_TEXT_LEN) : undefined;
  } catch {
    return undefined;
  }
}

function safeQueryAttr(root: Element | Document, selector: string, attr: string): string | undefined {
  try {
    const el = root.querySelector(selector);
    if (!el) return undefined;
    const val = el.getAttribute(attr);
    return val ? cleanText(val) : undefined;
  } catch {
    return undefined;
  }
}

function safeQueryAllTexts(root: Element | Document, selector: string, max: number): string[] {
  try {
    const els = Array.from(root.querySelectorAll(selector)).slice(0, max);
    return els
      .map(el => cleanText(el.textContent))
      .filter((t): t is string => !!t);
  } catch {
    return [];
  }
}

export function parseCoordinatesFromUrl(url: string): { latitude?: number; longitude?: number } {
  try {
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (!match) return {};
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (isNaN(lat) || isNaN(lng)) return {};
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return {};
    return {
      latitude: Math.round(lat * 1e6) / 1e6,
      longitude: Math.round(lng * 1e6) / 1e6
    };
  } catch {
    return {};
  }
}

export function parsePlaceIdFromUrl(url: string): string | undefined {
  try {
    const match = url.match(/[?&!]1s(ChIJ[A-Za-z0-9_-]{20,})/);
    if (match && match[1]) return match[1];
    return undefined;
  } catch {
    return undefined;
  }
}

// ==========================================
// Multi-Stage Extraction Lifecycle
// ==========================================

export class GoogleMapsExtractionEngine {
  private readonly sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  // ──────────────────────────────────────────
  // STAGE A: Discover visible listing candidates
  // ──────────────────────────────────────────
  public stageADiscoverVisibleCards(doc: Document = document): Element[] {
    try {
      const feed = doc.querySelector(EXTRACTION_SELECTORS.feed);
      if (!feed) {
        // Fallback: look for card elements directly
        const rawCards = doc.querySelectorAll(EXTRACTION_SELECTORS.cards);
        return Array.from(rawCards);
      }
      const cards = feed.querySelectorAll(':scope > div[jsaction], div[role="article"]');
      return Array.from(cards);
    } catch {
      return [];
    }
  }

  // ──────────────────────────────────────────
  // STAGE B: Extract listing-level fields from card
  // ──────────────────────────────────────────
  public stageBExtractCardFields(
    card: Element,
    pageUrl: string,
    context?: { searchQuery?: string; searchLocation?: string; searchUnitId?: string }
  ): GoogleMapsObservedFields {
    const fields: GoogleMapsObservedFields = {};

    // 1. Business Name
    const name = safeQueryText(card, EXTRACTION_SELECTORS.cardName);
    if (name) fields.businessName = name;

    // 2. Listing URL & Place ID
    const linkEl = card.querySelector(EXTRACTION_SELECTORS.cardLink) as HTMLAnchorElement | null;
    if (linkEl && linkEl.href) {
      fields.listingUrl = linkEl.href;
      const pid = parsePlaceIdFromUrl(linkEl.href);
      if (pid) {
        fields.placeId = pid;
        fields.sourceRecordId = pid;
      }
    }

    // 3. Category & Address lines
    const textLines = safeQueryAllTexts(card, '.W4Efsd span, .GHT2ce span', 10);
    for (const line of textLines) {
      // Heuristically distinguish category vs address vs status
      if (/^\d+\.?\d*$/.test(line) || line.includes('reviews') || line.includes('★')) {
        continue;
      }
      if (line.toLowerCase().includes('closed') || line.toLowerCase().includes('open')) {
        fields.businessStatus = line;
        continue;
      }
      if (!fields.category && line.length < 50 && !line.includes(',')) {
        fields.category = line;
        fields.primaryCategory = line;
      } else if (!fields.address && (line.includes(',') || /\d/.test(line))) {
        fields.address = line;
        fields.fullAddress = line;
      }
    }

    // 4. Rating & Reviews
    const ratingEl = card.querySelector(EXTRACTION_SELECTORS.cardRating);
    if (ratingEl) {
      const aria = ratingEl.getAttribute('aria-label') ?? ratingEl.textContent ?? '';
      const rMatch = aria.match(/(\d+\.?\d*)/);
      if (rMatch) fields.rating = rMatch[1];
    }

    const reviewEl = card.querySelector(EXTRACTION_SELECTORS.cardReviews);
    if (reviewEl) {
      const revText = reviewEl.getAttribute('aria-label') ?? reviewEl.textContent ?? '';
      const cMatch = revText.match(/([\d,]+)/);
      if (cMatch) fields.reviewCount = cMatch[1].replace(/,/g, '');
    }

    // 5. Business Status
    const statusText = safeQueryText(card, EXTRACTION_SELECTORS.cardStatus);
    if (statusText) fields.businessStatus = statusText;

    // 6. Coordinates from page URL
    const coords = parseCoordinatesFromUrl(pageUrl);
    if (coords.latitude != null) fields.latitude = coords.latitude;
    if (coords.longitude != null) fields.longitude = coords.longitude;

    // Source context
    fields.mapsUrl = pageUrl;
    if (context?.searchQuery) fields.searchQuery = context.searchQuery;
    if (context?.searchLocation) fields.searchLocation = context.searchLocation;
    if (context?.searchUnitId) fields.searchUnitId = context.searchUnitId;

    return fields;
  }

  // ──────────────────────────────────────────
  // STAGE C: Collect detail-level fields
  // ──────────────────────────────────────────
  public stageCExtractDetailPanelFields(
    panel: Element,
    pageUrl: string,
    context?: { searchQuery?: string; searchLocation?: string; searchUnitId?: string }
  ): Partial<GoogleMapsObservedFields> {
    const fields: Partial<GoogleMapsObservedFields> = {};

    // Name
    const name = safeQueryText(panel, EXTRACTION_SELECTORS.detailName);
    if (name) fields.businessName = name;

    // Category
    const category = safeQueryText(panel, EXTRACTION_SELECTORS.detailCategory);
    if (category) {
      fields.category = category;
      fields.primaryCategory = category;
    }

    // Address
    const address = safeQueryText(panel, EXTRACTION_SELECTORS.detailAddress);
    if (address) {
      fields.address = address;
      fields.fullAddress = address;
    }

    // Phone
    const phone = safeQueryText(panel, EXTRACTION_SELECTORS.detailPhone);
    if (phone) fields.phone = phone;

    // Website
    const websiteEl = panel.querySelector(EXTRACTION_SELECTORS.detailWebsite) as HTMLAnchorElement | null;
    if (websiteEl && websiteEl.href) {
      const href = websiteEl.href;
      try {
        const u = new URL(href);
        if (u.hostname.includes('google.com') && u.pathname === '/url' && u.searchParams.has('q')) {
          fields.websiteUrl = u.searchParams.get('q') ?? href;
        } else {
          fields.websiteUrl = href;
        }
      } catch {
        fields.websiteUrl = href;
      }
    }

    // Hours
    const hours = safeQueryAllTexts(panel, EXTRACTION_SELECTORS.detailHours, MAX_HOURS_ENTRIES);
    if (hours.length > 0) fields.openingHours = hours;

    // Description
    const desc = safeQueryText(panel, EXTRACTION_SELECTORS.detailDescription);
    if (desc) fields.description = desc;

    // Status
    const status = safeQueryText(panel, EXTRACTION_SELECTORS.detailStatus);
    if (status) fields.businessStatus = status;

    // Price Level
    const price = safeQueryText(panel, EXTRACTION_SELECTORS.detailPrice);
    if (price) {
      const cleanPrice = price.replace(/[^$€£¥₹]/g, '');
      if (cleanPrice.length > 0 && cleanPrice.length <= 4) {
        fields.priceLevel = cleanPrice;
      }
    }

    // Service Options, Accessibility, Amenities
    const serviceOpts = safeQueryAllTexts(panel, EXTRACTION_SELECTORS.detailServiceOptions, MAX_ATTRIBUTES);
    if (serviceOpts.length > 0) fields.serviceOptions = serviceOpts;

    const accessOpts = safeQueryAllTexts(panel, EXTRACTION_SELECTORS.detailAccessibility, MAX_ATTRIBUTES);
    if (accessOpts.length > 0) fields.accessibilityOptions = accessOpts;

    const amenities = safeQueryAllTexts(panel, EXTRACTION_SELECTORS.detailAmenities, MAX_ATTRIBUTES);
    if (amenities.length > 0) fields.amenities = amenities;

    // Coordinates and Place ID from page URL
    const coords = parseCoordinatesFromUrl(pageUrl);
    if (coords.latitude != null) fields.latitude = coords.latitude;
    if (coords.longitude != null) fields.longitude = coords.longitude;

    const pid = parsePlaceIdFromUrl(pageUrl);
    if (pid) {
      fields.placeId = pid;
      fields.sourceRecordId = pid;
    }

    fields.mapsUrl = pageUrl;
    fields.listingUrl = pageUrl;

    if (context?.searchQuery) fields.searchQuery = context.searchQuery;
    if (context?.searchLocation) fields.searchLocation = context.searchLocation;
    if (context?.searchUnitId) fields.searchUnitId = context.searchUnitId;

    return fields;
  }

  // ──────────────────────────────────────────
  // STAGE D & E: Normalize and Emit Record
  // ──────────────────────────────────────────
  public stageDAndENormalizeAndEmit(
    observed: GoogleMapsObservedFields,
    options: {
      acquisitionId: string;
      searchQuery?: string;
      searchLocation?: string;
      searchUnitId?: string;
      observedAt?: string;
    }
  ): GoogleMapsNormalizedRecord {
    return normalizeGoogleMapsRecord(observed, {
      acquisitionId: options.acquisitionId,
      sessionId: this.sessionId,
      searchQuery: options.searchQuery,
      searchLocation: options.searchLocation,
      searchUnitId: options.searchUnitId,
      observedAt: options.observedAt
    });
  }
}
