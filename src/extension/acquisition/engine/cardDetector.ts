/**
 * LeadNoria — Google Maps Candidate Card Detector
 * Structural Validation, UI Artifact Filtering & Raw Field Extraction
 *
 * Invariants:
 * - Card detection is a distinct concern separated from feed detection and scrolling.
 * - Distinguishes VALID_BUSINESS_CANDIDATE, NON_BUSINESS_UI, LOADING_PLACEHOLDER, AD_OR_PROMOTIONAL_UI, INVALID_UNKNOWN.
 * - Resilient against dynamic class names, nested anchors, rating badges, and sponsored markers.
 * - Isolates malformed or non-business UI cards without terminating feed acquisition.
 * - Zero private API calls; pure browser DOM inspection.
 */

import type {
  CandidateCardClassification,
  ValidatedCandidateCard
} from './types.ts';
import type { RawCandidateNodeData } from './observationBoundary.ts';

export interface DOMElementLike {
  textContent?: string | null;
  getAttribute?(name: string): string | null;
  querySelector?(selector: string): DOMElementLike | null;
  querySelectorAll?(selector: string): Array<DOMElementLike> | NodeListOf<any>;
  className?: string;
  tagName?: string;
}

// Ordered selector strategies for card components
export const CARD_SELECTORS = {
  // Candidate card containers within feed
  cardContainers: [
    'div[role="feed"] > div[jsaction]',
    'div[role="feed"] > div[role="article"]',
    'div[role="article"]',
    'div[jsaction*="mouseover"]:has(a[href*="/maps/place/"])',
    'div.Nv2PK', // Common Maps result item class fallback
    'div[jsaction*="pane.wfvdle"]'
  ],

  // Business Name
  name: [
    '.qBF1Pd',
    '[class*="fontHeadlineSmall"]',
    'h3',
    '.NrDZNb',
    '[role="heading"]',
    'a[href*="/maps/place/"] div[class*="fontHeadline"]',
    'div.fontHeadlineSmall'
  ],

  // Listing / Maps Place link
  placeLink: [
    'a.hfpxzc',
    'a[class*="hfpxzc"]',
    'a[href*="/maps/place/"]',
    'a[href*="google.com/maps/place/"]',
    'a[data-item-id*="address"]',
    'a[jsaction*="pane.wfvdle"]'
  ],

  // Rating & Review indicators
  rating: [
    'span[aria-label*="star"]',
    'span[aria-label*="rated"]',
    'span[aria-label*="Rated"]',
    'span.MW4etd',
    'span[aria-hidden="true"]:has(+ span[aria-label*="reviews"])'
  ],

  reviews: [
    'span[aria-label*="review"]',
    'span[aria-label*="Review"]',
    '.UY7F9',
    '.e4rVHe',
    'span.ZDNAVf'
  ],

  // Category and Address lines
  textSnippets: [
    '.W4Efsd span',
    '.GHT2ce span',
    'div[class*="fontBodyMedium"] span',
    'div.W4Efsd'
  ],

  // Business status indicators
  status: [
    '.YhemCb',
    '[aria-label*="Closed"]',
    '[aria-label*="Open"]',
    'span[style*="color: rgb(217, 48, 37)"]', // Red text (closed)
    'span[style*="color: rgb(24, 128, 56)"]'  // Green text (open)
  ],

  // Non-business UI / Placeholder markers
  loadingPlaceholders: [
    '[class*="skeleton"]',
    '[class*="placeholder"]',
    '.m6QErb.tLzqyd[aria-label*="Loading"]',
    'div[aria-busy="true"]'
  ],

  adMarkers: [
    'span[aria-label*="Sponsored"]',
    'span[aria-label*="Ad"]',
    '.k8D6id',
    'span:contains("Sponsored")',
    '[data-ad-slot]'
  ]
};

/**
 * Extracts a stable Google Maps place ID from link URLs.
 * Handles ChIJ... place IDs and hex feature IDs (0x...:0x...).
 */
export function parsePlaceIdFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  // 1. Check for ChIJ... Place ID
  const chijMatch = url.match(/(ChIJ[A-Za-z0-9_-]{20,})/);
  if (chijMatch) return chijMatch[1];

  // 2. Check for !1s token in Maps URL data parameter (e.g. !1s0x...:0x... or !1sChIJ...)
  const tokenMatch = url.match(/!1s([^!/?&#]+)/);
  if (tokenMatch) return tokenMatch[1];

  // 3. Fallback to generic 0x...:0x... pattern
  const genericHex = url.match(/(0x[0-9a-zA-Z_-]+:0x[0-9a-zA-Z_-]+)/);
  if (genericHex) return genericHex[1];

  return undefined;
}

/**
 * Extracts sanitized clean text from a DOM element or child.
 */
function extractText(el?: DOMElementLike | null): string | undefined {
  if (!el || !el.textContent) return undefined;
  const s = el.textContent
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return s.length > 0 ? s : undefined;
}

/**
 * Validates whether a candidate card DOM element represents a valid business candidate.
 */
export function classifyCandidateCard(el: DOMElementLike | null | undefined): ValidatedCandidateCard {
  if (!el) {
    return {
      element: el,
      classification: 'INVALID_UNKNOWN',
      confidence: 0,
      reason: 'Null or undefined element',
      isBusinessCard: false
    };
  }

  // 1. Check for loading placeholder / skeleton
  if (el.getAttribute && (el.getAttribute('aria-busy') === 'true' || el.getAttribute('data-loading') === 'true')) {
    return {
      element: el,
      classification: 'LOADING_PLACEHOLDER',
      confidence: 0.9,
      reason: 'Element is an active loading skeleton/placeholder',
      isBusinessCard: false
    };
  }

  const rawText = el.textContent || '';
  if (rawText.trim().length === 0) {
    return {
      element: el,
      classification: 'LOADING_PLACEHOLDER',
      confidence: 0.85,
      reason: 'Card has zero text content (empty placeholder/skeleton)',
      isBusinessCard: false
    };
  }

  // 2. Check for non-business UI (e.g. search filters, buttons, map controls)
  const role = el.getAttribute ? el.getAttribute('role') : undefined;
  if (role === 'button' || role === 'tab' || role === 'menubar' || role === 'navigation') {
    return {
      element: el,
      classification: 'NON_BUSINESS_UI',
      confidence: 0.95,
      reason: `Element has non-card role="${role}"`,
      isBusinessCard: false
    };
  }

  // 3. Check for business name evidence
  let foundName: string | undefined;
  if (el.querySelector) {
    for (const sel of CARD_SELECTORS.name) {
      try {
        const nameEl = el.querySelector(sel);
        const txt = extractText(nameEl);
        if (txt && txt.length > 0 && txt.length < 200) {
          foundName = txt;
          break;
        }
      } catch {}
    }
  }

  // If no name found via selectors, check first heading or bold text
  if (!foundName && el.querySelector) {
    const heading = el.querySelector('h3, h2, [role="heading"], strong');
    const txt = extractText(heading);
    if (txt && txt.length > 1 && txt.length < 200) {
      foundName = txt;
    }
  }

  if (!foundName) {
    return {
      element: el,
      classification: 'INVALID_UNKNOWN',
      confidence: 0.8,
      reason: 'No recognizable business name heading or text found',
      isBusinessCard: false
    };
  }

  // 4. Check for Ad / Sponsored marker (distinguish, but can still be collected with ad classification)
  let isSponsored = false;
  const lowerText = rawText.toLowerCase();
  if (lowerText.startsWith('sponsored') || lowerText.includes('· sponsored') || lowerText.includes(' ad ·')) {
    isSponsored = true;
  }
  if (!isSponsored && el.querySelector) {
    for (const sel of CARD_SELECTORS.adMarkers) {
      try {
        if (el.querySelector(sel)) {
          isSponsored = true;
          break;
        }
      } catch {}
    }
  }

  // 5. Look for supporting Maps listing evidence (place link, rating, category, address)
  let hasSupportingEvidence = false;
  if (el.querySelector) {
    for (const sel of CARD_SELECTORS.placeLink) {
      try {
        if (el.querySelector(sel)) {
          hasSupportingEvidence = true;
          break;
        }
      } catch {}
    }
    if (!hasSupportingEvidence) {
      for (const sel of CARD_SELECTORS.rating) {
        try {
          if (el.querySelector(sel)) {
            hasSupportingEvidence = true;
            break;
          }
        } catch {}
      }
    }
  }

  // If has name and is non-empty, even with weak supporting evidence it can be business candidate
  if (foundName.length >= 1) {
    if (isSponsored) {
      return {
        element: el,
        classification: 'AD_OR_PROMOTIONAL_UI',
        confidence: 0.85,
        reason: `Sponsored business listing: "${foundName}"`,
        isBusinessCard: true
      };
    }

    return {
      element: el,
      classification: 'VALID_BUSINESS_CANDIDATE',
      confidence: hasSupportingEvidence ? 0.95 : 0.75,
      reason: `Valid business card with name "${foundName}"`,
      isBusinessCard: true
    };
  }

  return {
    element: el,
    classification: 'INVALID_UNKNOWN',
    confidence: 0.7,
    reason: 'Insufficient business identity evidence',
    isBusinessCard: false
  };
}

/**
 * Extracts raw candidate node data from a validated business card element.
 */
export function extractRawCardNodeData(cardEl: DOMElementLike, pageUrl = ''): RawCandidateNodeData {
  const result: RawCandidateNodeData = {};

  if (!cardEl.querySelector) {
    return result;
  }

  // 1. Business Name
  for (const sel of CARD_SELECTORS.name) {
    try {
      const el = cardEl.querySelector(sel);
      const txt = extractText(el);
      if (txt) {
        result.businessName = txt;
        break;
      }
    } catch {}
  }

  // 2. Maps Place Link & Place ID
  for (const sel of CARD_SELECTORS.placeLink) {
    try {
      const linkEl = cardEl.querySelector(sel);
      if (linkEl && linkEl.getAttribute) {
        const href = linkEl.getAttribute('href');
        if (href) {
          result.mapsUrl = href;
          const pid = parsePlaceIdFromUrl(href);
          if (pid) {
            result.placeId = pid;
          }
          break;
        }
      }
    } catch {}
  }

  // 3. Rating
  for (const sel of CARD_SELECTORS.rating) {
    try {
      const ratingEl = cardEl.querySelector(sel);
      if (ratingEl) {
        const aria = ratingEl.getAttribute ? ratingEl.getAttribute('aria-label') : undefined;
        const txt = aria || ratingEl.textContent || '';
        const match = txt.match(/(\d+[.,]\d+|\b[1-5]\b)/);
        if (match) {
          result.rating = match[1];
          break;
        }
      }
    } catch {}
  }

  // 4. Review Count
  for (const sel of CARD_SELECTORS.reviews) {
    try {
      const reviewEl = cardEl.querySelector(sel);
      if (reviewEl) {
        const aria = reviewEl.getAttribute ? reviewEl.getAttribute('aria-label') : undefined;
        const txt = aria || reviewEl.textContent || '';
        const match = txt.match(/([\d]+[.,]\d+|\d+)\s*[kK]?/);
        if (match) {
          result.reviewCount = match[0];
          break;
        }
      }
    } catch {}
  }

  // 5. Category & Address lines from structural text snippets
  if (cardEl.querySelectorAll) {
    try {
      const snippetNodes = cardEl.querySelectorAll(CARD_SELECTORS.textSnippets.join(', '));
      const textSnippets: string[] = [];
      for (let i = 0; i < snippetNodes.length && i < 12; i++) {
        const txt = extractText(snippetNodes[i]);
        if (txt && !textSnippets.includes(txt)) {
          textSnippets.push(txt);
        }
      }

      for (const line of textSnippets) {
        // Skip ratings, review counts, stars
        if (/^\d+[.,]?\d*$/.test(line) || line.includes('★') || line.includes('reviews') || line.includes('review')) {
          continue;
        }

        // Status check
        const lower = line.toLowerCase();
        if (lower.includes('closed') || lower.includes('open') || lower.includes('opens') || lower.includes('closing')) {
          if (!result.businessStatus) {
            result.businessStatus = line;
          }
          continue;
        }

        // Phone check
        if (/\+?\d[\d\s\-()]{7,}\d/.test(line) && !result.phone) {
          result.phone = line;
          continue;
        }

        // Heuristically assign category vs address
        if (!result.category && line.length < 60 && !line.includes(',') && !/\d{3,}/.test(line)) {
          result.category = line;
        } else if (!result.address && (line.includes(',') || /\d/.test(line) || line.length >= 10)) {
          result.address = line;
        }
      }
    } catch {}
  }

  // 6. Explicit Website link (if directly present on card)
  try {
    const websiteEl = cardEl.querySelector('a[data-value="Website"], a[aria-label*="Website"], a[href^="http"]:not([href*="google.com"])');
    if (websiteEl && websiteEl.getAttribute) {
      const href = websiteEl.getAttribute('href');
      if (href && !href.includes('google.com/maps')) {
        result.websiteUrl = href;
      }
    }
  } catch {}

  // 7. Status element fallback
  if (!result.businessStatus) {
    for (const sel of CARD_SELECTORS.status) {
      try {
        const sEl = cardEl.querySelector(sel);
        const txt = extractText(sEl);
        if (txt) {
          result.businessStatus = txt;
          break;
        }
      } catch {}
    }
  }

  // Mark that this is a CARD surface (crucial for evaluateWebsiteField UNKNOWN classification)
  result.isDetail = false;
  result.surfaceType = 'CARD';

  return result;
}
