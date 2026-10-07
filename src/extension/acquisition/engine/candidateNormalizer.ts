/**
 * LeadNoria — Google Maps Candidate Field Normalizer
 * Part 5: Pure Deterministic Normalization for Identity & Comparison
 *
 * HARD BOUNDARIES & INVARIANTS:
 * - Deterministic, pure functions with zero DOM, zero network calls.
 * - Meaningful business tokens preserved (do NOT strip "Group", "Holdings", etc. indiscriminately).
 * - Legal suffixes stripped ONLY for comparison keys, never destroying original evidence.
 * - Address normalization preserves house/road/sector/block numbers and city names.
 * - Phone normalization harmonizes international (+880) and national (01...) formatting.
 * - Website normalization reuses safe URL canonicalization; generic shared domains flagged.
 * - Rating, review count, business status normalized as data fields, NEVER identity signals.
 */

import { normalizeWebsiteUrl } from '../../websiteUrlNormalizer.ts';

// Common legal suffixes stripped ONLY for comparison keys
export const LEGAL_SUFFIXES = [
  'private limited', 'pvt ltd', 'pvt. ltd.', 'pvt. ltd', 'pvt', 'pvt.',
  'limited', 'ltd', 'ltd.',
  'llc', 'l.l.c.',
  'inc', 'inc.', 'incorporated',
  'corp', 'corp.', 'corporation',
  'co', 'co.', 'company',
  'plc', 'p.l.c.',
  'gmbh',
  'enterprise', 'enterprises'
];

// Generic shared domains that MUST NEVER act as sole identity anchors
export const GENERIC_SHARED_DOMAINS = new Set([
  'facebook.com', 'web.facebook.com', 'm.facebook.com', 'l.facebook.com',
  'instagram.com', 'wa.me', 'api.whatsapp.com', 'whatsapp.com',
  't.me', 'telegram.me', 'youtube.com', 'youtu.be',
  'linktr.ee', 'bio.link', 'beacons.ai', 'campsite.bio',
  'forms.gle', 'docs.google.com', 'drive.google.com', 'google.com',
  'typeform.com', 'calendly.com',
  'bit.ly', 'tinyurl.com', 'ow.ly', 'rebrand.ly', 't.co',
  'amazon.com', 'amazon.co.uk', 'amazon.in',
  'ebay.com', 'etsy.com', 'daraz.com.bd', 'daraz.pk',
  'walmart.com', 'target.com', 'aliexpress.com', 'alibaba.com',
  'myshopify.com', 'shopee.com', 'lazada.com', 'yelp.com',
  'tripadvisor.com', 'yellowpages.com'
]);

// Well-known locality / city tokens for Bangladesh and regional branch conflict checks
const REGIONAL_LOCALITY_TOKENS = [
  'dhaka', 'chattogram', 'chittagong', 'sylhet', 'rajshahi', 'khulna',
  'barishal', 'barisal', 'rangpur', 'mymensingh', 'cumilla', 'comilla',
  'gazipur', 'narayanganj', 'bogura', 'bogra', 'coxs bazar', "cox's bazar",
  'uttara', 'gulshan', 'banani', 'dhanmondi', 'mirpur', 'motijheel',
  'mohakhali', 'bashundhara', 'badda', 'mohammadpur', 'khilgaon'
];

// ============================================================================
// 1. Business Name Normalization
// ============================================================================

export interface NormalizedNameResult {
  readonly displayName: string;
  readonly normalizedName: string;
  readonly comparisonKey: string;
  readonly legalSuffix?: string;
}

export function normalizeBusinessNameForIdentity(rawName?: string | null): NormalizedNameResult {
  if (!rawName) {
    return { displayName: '', normalizedName: '', comparisonKey: '' };
  }

  // 1. Clean display name: trim, remove leading/trailing noise, collapse spaces
  const cleaned = rawName
    .normalize('NFKC')
    .replace(/\s*·\s*Sponsored.*$/i, '')
    .replace(/\s*Sponsored.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Normalized name: lowercase, strip edge punctuation
  const normalizedName = cleaned.toLowerCase();

  // 3. Comparison key: strip legal entity suffixes from the end
  let comp = normalizedName;
  let matchedSuffix: string | undefined;

  const sortedSuffixes = [...LEGAL_SUFFIXES].sort((a, b) => b.length - a.length);
  for (const suffix of sortedSuffixes) {
    const escaped = suffix.replace(/\./g, '\\.');
    const regex = new RegExp(`(?:\\b|\\s)${escaped}\\.?$`, 'i');
    if (regex.test(comp)) {
      matchedSuffix = suffix;
      comp = comp.replace(regex, '').trim();
      break;
    }
  }

  // Strip punctuation for comparison key
  const comparisonKey = comp
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    displayName: cleaned,
    normalizedName,
    comparisonKey: comparisonKey || normalizedName,
    legalSuffix: matchedSuffix
  };
}

// ============================================================================
// 2. Address Normalization
// ============================================================================

export interface NormalizedAddressResult {
  readonly rawAddress: string;
  readonly normalizedAddress: string;
  readonly comparisonKey: string;
  readonly locality?: string;
}

export function normalizeAddressForIdentity(rawAddress?: string | null): NormalizedAddressResult {
  if (!rawAddress) {
    return { rawAddress: '', normalizedAddress: '', comparisonKey: '' };
  }

  const raw = rawAddress.trim();
  const normalizedAddress = raw
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  // Punctuation to spaces, collapse spaces
  const comparisonKey = normalizedAddress
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract identifiable locality/city
  let locality: string | undefined;
  for (const loc of REGIONAL_LOCALITY_TOKENS) {
    const regex = new RegExp(`\\b${loc}\\b`, 'i');
    if (regex.test(comparisonKey)) {
      locality = loc;
      break;
    }
  }

  return {
    rawAddress: raw,
    normalizedAddress,
    comparisonKey,
    locality
  };
}

// ============================================================================
// 3. Phone Normalization
// ============================================================================

export interface NormalizedPhoneResult {
  readonly rawPhone: string;
  readonly normalizedPhone: string;
  readonly nationalDigits: string;
  readonly isValid: boolean;
}

export function normalizePhoneForIdentity(rawPhone?: string | null): NormalizedPhoneResult {
  if (!rawPhone) {
    return { rawPhone: '', normalizedPhone: '', nationalDigits: '', isValid: false };
  }

  const raw = rawPhone.trim();
  const hasPlus = raw.startsWith('+');
  const digits = raw.replace(/\D/g, '');

  if (digits.length < 6 || digits.length > 15) {
    return { rawPhone: raw, normalizedPhone: raw, nationalDigits: digits, isValid: false };
  }

  // Normalize international vs national for Bangladesh (dial code 880)
  let nationalDigits = digits;
  if (digits.startsWith('880') && digits.length >= 10) {
    nationalDigits = digits.slice(3); // e.g. 1712345678
  } else if (digits.startsWith('0') && digits.length >= 10) {
    nationalDigits = digits.slice(1); // e.g. 1712345678
  }

  const normalizedPhone = hasPlus ? `+${digits}` : digits;

  return {
    rawPhone: raw,
    normalizedPhone,
    nationalDigits,
    isValid: true
  };
}

/**
 * Checks if two phone numbers refer to the same physical phone.
 * Supports comparison between +880 1712-345678, 01712 345678, and 01712345678.
 */
export function arePhonesEquivalent(phoneA?: string | null, phoneB?: string | null): boolean {
  if (!phoneA || !phoneB) return false;
  const pA = normalizePhoneForIdentity(phoneA);
  const pB = normalizePhoneForIdentity(phoneB);
  if (!pA.isValid || !pB.isValid) return false;

  // Exact digits match
  if (pA.normalizedPhone === pB.normalizedPhone) return true;

  // Harmonized national digits match (minimum 8 digits for uniqueness)
  if (pA.nationalDigits.length >= 8 && pA.nationalDigits === pB.nationalDigits) {
    return true;
  }

  return false;
}

// ============================================================================
// 4. Website Normalization
// ============================================================================

export interface NormalizedWebsiteResult {
  readonly rawUrl: string;
  readonly normalizedUrl: string;
  readonly hostname: string;
  readonly domain?: string;
  readonly isGenericDomain: boolean;
  readonly isValid: boolean;
}

export function normalizeWebsiteForIdentity(rawUrl?: string | null): NormalizedWebsiteResult {
  if (!rawUrl) {
    return { rawUrl: '', normalizedUrl: '', hostname: '', isGenericDomain: false, isValid: false };
  }

  const norm = normalizeWebsiteUrl(rawUrl);
  if (!norm.isValid) {
    return { rawUrl, normalizedUrl: '', hostname: '', isGenericDomain: false, isValid: false };
  }

  const hostname = norm.finalHostname.toLowerCase().replace(/^www\./, '');
  const isGenericDomain = GENERIC_SHARED_DOMAINS.has(hostname);

  return {
    rawUrl,
    normalizedUrl: norm.finalUrl,
    hostname,
    domain: isGenericDomain ? undefined : hostname,
    isGenericDomain,
    isValid: true
  };
}

// ============================================================================
// 5. Google Maps URL Normalization
// ============================================================================

export function normalizeMapsUrlSlug(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      return decodeURIComponent(placeMatch[1]).toLowerCase().replace(/\+/g, ' ').trim();
    }
    const q = parsed.searchParams.get('q');
    if (q) {
      return q.toLowerCase().replace(/\+/g, ' ').trim();
    }
  } catch {
    if (trimmed.includes('/maps/place/')) {
      const parts = trimmed.split('/maps/place/')[1]?.split(/[\/@?]/)[0];
      if (parts) return parts.toLowerCase().replace(/\+/g, ' ').trim();
    }
  }
  return undefined;
}
