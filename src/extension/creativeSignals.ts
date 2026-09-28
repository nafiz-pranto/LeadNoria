/**
 * Structured Creative / Commercial Signal Extractor & Normalizer
 * LEADNORIA v1.1 — Master Prompt 5
 *
 * Extracts, normalizes, and aggregates structured creative signals:
 * - CTA (e.g. SHOP_NOW, LEARN_MORE, CONTACT_US, BOOK_NOW, SIGN_UP, ORDER_NOW)
 * - Offer / Discount (e.g. DISCOUNT_OFFER, FREE_SHIPPING, PROMOTION, BOGO_OFFER)
 * - Price language (e.g. PRICE_PRESENT)
 * - Commercial intent (e.g. APPOINTMENT, SHOWROOM_VISIT, ONLINE_ORDER, CASH_ON_DELIVERY)
 * - Product & Service terms
 * - Creative type (IMAGE, VIDEO, CAROUSEL, UNKNOWN)
 * - Deterministic language classification (ENGLISH, BENGALI, SPANISH, GERMAN, MIXED, UNKNOWN)
 *
 * Anti-Inflation:
 * Repeated identical signals from duplicate ads are collapsed into unique signatures with occurrence counts.
 *
 * Invariant:
 * Creative signals represent evidence only. They NEVER independently produce a RELEVANT decision.
 */

import type {
  ScrapedAdCandidate,
  StructuredCreativeSignal,
  CreativeSignalType
} from './types.ts';

// -------------------------------------------------------------
// 1. CTA NORMALIZATION DICTIONARY
// -------------------------------------------------------------
const CTA_NORMALIZATION_MAP: Record<string, string> = {
  // Shop / Buy / Order
  'shop now': 'SHOP_NOW',
  'shop now →': 'SHOP_NOW',
  'order now': 'ORDER_NOW',
  'order now →': 'ORDER_NOW',
  'buy now': 'BUY_NOW',
  'buy now →': 'BUY_NOW',
  'order': 'ORDER_NOW',
  'shop': 'SHOP_NOW',
  'buy': 'BUY_NOW',

  // Learn / Information
  'learn more': 'LEARN_MORE',
  'learn more →': 'LEARN_MORE',
  'see more': 'LEARN_MORE',
  'view details': 'LEARN_MORE',
  'explore': 'LEARN_MORE',

  // Contact / Message / Call
  'contact us': 'CONTACT_US',
  'contact us →': 'CONTACT_US',
  'send message': 'SEND_MESSAGE',
  'send message →': 'SEND_MESSAGE',
  'message now': 'SEND_MESSAGE',
  'call now': 'CALL_NOW',
  'call now →': 'CALL_NOW',
  'whatsapp': 'WHATSAPP_MESSAGE',
  'chat with us': 'SEND_MESSAGE',

  // Booking / Appointments
  'book now': 'BOOK_NOW',
  'book now →': 'BOOK_NOW',
  'book appointment': 'APPOINTMENT_BOOKING',
  'book your appointment': 'APPOINTMENT_BOOKING',
  'schedule now': 'APPOINTMENT_BOOKING',
  'get quote': 'GET_QUOTE',
  'request quote': 'GET_QUOTE',

  // Sign up / Registration
  'sign up': 'SIGN_UP',
  'sign up →': 'SIGN_UP',
  'register now': 'SIGN_UP',
  'subscribe': 'SUBSCRIBE',
  'apply now': 'APPLY_NOW',

  // Offers
  'get offer': 'GET_OFFER',
  'claim offer': 'GET_OFFER',
  'grab offer': 'GET_OFFER'
};

// -------------------------------------------------------------
// 2. OFFER / DISCOUNT PATTERNS
// -------------------------------------------------------------
const DISCOUNT_PATTERNS = [
  /(\d{1,2}%\s*(?:off|discount|ছাড়|ছাড়))/i,
  /(?:flat|up\s*to)\s*(\d{1,2}%\s*(?:off|discount|ছাড়|ছাড়)?)/i,
  /(?:save|discount)\s*(?:up\s*to\s*)?(\d{1,2}%)/i,
  /\b(?:mega\s*sale|summer\s*sale|winter\s*sale|eid\s*sale|flash\s*sale|clearance\s*sale)\b/i,
  /\b(?:special\s*discount|exclusive\s*discount|festive\s*offer|special\s*offer)\b/i
];

const FREE_SHIPPING_PATTERNS = [
  /\b(?:free\s*shipping|free\s*delivery|ফ্রি\s*ডেলিভারি)\b/i
];

const BOGO_PATTERNS = [
  /\b(?:buy\s*1\s*get\s*1|bogo|buy\s*one\s*get\s*one)\b/i
];

// -------------------------------------------------------------
// 3. PRICE PATTERNS (DO NOT INFER EXACT PRICING IF NOT EXPLICIT)
// -------------------------------------------------------------
const PRICE_PATTERNS = [
  /(?:[$€£]\s*[0-9,]+(?:\.[0-9]{2})?)/,
  /(?:(?:tk|bdt|rs|inr|usd)\.?\s*[0-9,]+)/i,
  /(?:[0-9,]+\s*(?:tk|bdt|taka|টাকা|৳))/i,
  /(?:৳\s*[0-9,]+)/
];

// -------------------------------------------------------------
// 4. COMMERCIAL INTENT PHRASES
// -------------------------------------------------------------
const COMMERCIAL_INTENT_PATTERNS = [
  { regex: /\b(?:appointment|consultation|schedule\s*visit)\b/i, normalized: 'APPOINTMENT_BOOKING' },
  { regex: /\b(?:showroom|outlet|store\s*location|visit\s*our\s*outlet)\b/i, normalized: 'SHOWROOM_VISIT' },
  { regex: /\b(?:cash\s*on\s*delivery|cod|ক্যাশ\s*অন\s*ডেলিভারি)\b/i, normalized: 'CASH_ON_DELIVERY' },
  { regex: /\b(?:inbox\s*to\s*order|order\s*online|ইনবক্স\s*করুন)\b/i, normalized: 'ORDER_INQUIRY' },
  { regex: /\b(?:warranty|guarantee|ওয়ারেন্টি|গ্যারান্টি)\b/i, normalized: 'WARRANTY' },
  { regex: /\b(?:wholesale|retail|পাইকারি|খুচরা)\b/i, normalized: 'COMMERCIAL_SCALE' }
];

const PRODUCT_TERM_PATTERNS = [
  { regex: /\b(sofa|couch|divan|sectional)\b/i, normalized: 'sofa' },
  { regex: /\b(dining\s*table|dining\s*set)\b/i, normalized: 'dining table' },
  { regex: /\b(bed|mattress|bedframe|headboard)\b/i, normalized: 'bed' },
  { regex: /\b(chair|armchair|recliner|stool)\b/i, normalized: 'chair' },
  { regex: /\b(wardrobe|closet|almirah)\b/i, normalized: 'wardrobe' },
  { regex: /\b(desk|workstation|bookshelf|cabinet)\b/i, normalized: 'cabinet' }
];

const SERVICE_TERM_PATTERNS = [
  { regex: /\b(interior\s*design|interior\s*decorating)\b/i, normalized: 'interior design' },
  { regex: /\b(custom\s*made|custom\s*furniture|made\s*to\s*order)\b/i, normalized: 'custom made' },
  { regex: /\b(free\s*delivery|home\s*delivery|express\s*shipping)\b/i, normalized: 'delivery' },
  { regex: /\b(installation|assembly\s*service)\b/i, normalized: 'installation' },
  { regex: /\b(warranty|guarantee)\b/i, normalized: 'warranty' },
  { regex: /\b(consultation|architectural\s*consultation)\b/i, normalized: 'consultation' }
];

// -------------------------------------------------------------
// 5. DETERMINISTIC LANGUAGE CLASSIFICATION
// -------------------------------------------------------------
export interface LanguageDetectionResult {
  language: 'ENGLISH' | 'BENGALI' | 'SPANISH' | 'GERMAN' | 'MIXED' | 'UNKNOWN';
  rawLanguage?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return { language: 'UNKNOWN', confidence: 'LOW' };
  }

  // Bengali Unicode range: U+0980 to U+09FF
  const bengaliChars = (text.match(/[\u0980-\u09FF]/g) || []).length;
  // Latin alphabetic characters
  const latinChars = (text.match(/[A-Za-z]/g) || []).length;
  const totalLetters = bengaliChars + latinChars;

  if (totalLetters === 0) {
    return { language: 'UNKNOWN', confidence: 'LOW' };
  }

  const bengaliRatio = bengaliChars / totalLetters;
  const latinRatio = latinChars / totalLetters;

  if (bengaliRatio >= 0.7) {
    return { language: 'BENGALI', rawLanguage: 'bn', confidence: 'HIGH' };
  }
  if (bengaliRatio >= 0.25 && latinRatio >= 0.25) {
    return { language: 'MIXED', rawLanguage: 'bn-en', confidence: 'HIGH' };
  }

  // Check specific European language markers
  const textLower = text.toLowerCase();
  const spanishMarkers = /\b(?:oferta|descuento|comprar|tienda|envío|más\s*información|precio|calidad)\b/i;
  const germanMarkers = /\b(?:rabatt|angebot|jetzt\s*kaufen|kostenloser\s*versand|mehr\s*erfahren|preis|qualität)\b/i;

  if (spanishMarkers.test(textLower) && !germanMarkers.test(textLower)) {
    return { language: 'SPANISH', rawLanguage: 'es', confidence: 'HIGH' };
  }
  if (germanMarkers.test(textLower) && !spanishMarkers.test(textLower)) {
    return { language: 'GERMAN', rawLanguage: 'de', confidence: 'HIGH' };
  }

  if (latinRatio >= 0.7) {
    return { language: 'ENGLISH', rawLanguage: 'en', confidence: 'MEDIUM' };
  }

  return { language: 'UNKNOWN', confidence: 'LOW' };
}

// -------------------------------------------------------------
// 6. CREATIVE TYPE DETECTION
// -------------------------------------------------------------
export function detectCreativeType(cand: any): 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'UNKNOWN' {
  if (cand.videoUrl || cand.video || cand.cardType === 'video' || cand.cardType === 'VIDEO') {
    return 'VIDEO';
  }
  if (cand.hasCarousel || cand.isCarousel || cand.cardType === 'carousel' || cand.cardType === 'CAROUSEL') {
    return 'CAROUSEL';
  }
  if (cand.imageUrl || cand.image || cand.cardType === 'image' || cand.cardType === 'IMAGE') {
    return 'IMAGE';
  }
  const combined = `${cand.rawText || ''} ${cand.bodyCopy || ''}`.toLowerCase();
  if (cand.hasMultipleVersions || combined.includes('carousel') || combined.includes('scroll to see more')) {
    return 'CAROUSEL';
  }
  if (combined.includes('watch video') || combined.includes('video duration') || combined.includes('view video') || combined.includes('reel') || combined.includes('video')) {
    return 'VIDEO';
  }
  if (combined.includes('photo') || combined.includes('image') || combined.includes('view photo')) {
    return 'IMAGE';
  }
  return 'UNKNOWN';
}

/**
 * Flexible wrapper for extracting signals from any ad or candidate representation.
 */
export function extractCreativeSignals(ad: any): StructuredCreativeSignal[] {
  const cand: any = {
    bodyCopy: ad.bodyCopy || ad.adText || ad.text || '',
    rawText: ad.rawText || ad.adText || ad.text || '',
    ctaText: ad.ctaText || ad.cta || '',
    cardType: ad.cardType || ad.creativeType,
    videoUrl: ad.videoUrl,
    imageUrl: ad.imageUrl,
    hasCarousel: ad.hasCarousel,
    isCarousel: ad.isCarousel
  };
  return extractCreativeSignalsFromCandidate(cand);
}

// -------------------------------------------------------------
// 7. SIGNAL EXTRACTION FROM AD CANDIDATE
// -------------------------------------------------------------
export function extractCreativeSignalsFromCandidate(
  cand: ScrapedAdCandidate
): StructuredCreativeSignal[] {
  const rawSignals: Array<{ type: CreativeSignalType; raw: string; normalized: string }> = [];

  // A. CTA Signal
  if (cand.ctaText && cand.ctaText.trim()) {
    const rawCta = cand.ctaText.trim();
    const ctaNorm = CTA_NORMALIZATION_MAP[rawCta.toLowerCase()] || rawCta.toUpperCase().replace(/\s+/g, '_');
    rawSignals.push({
      type: 'CTA',
      raw: rawCta,
      normalized: ctaNorm
    });
  }

  const combinedCopy = `${cand.bodyCopy || ''} ${cand.rawText || ''}`;

  // B. Offer / Discount Signals
  for (const pattern of DISCOUNT_PATTERNS) {
    const match = combinedCopy.match(pattern);
    if (match) {
      rawSignals.push({
        type: 'OFFER',
        raw: match[0].trim(),
        normalized: 'DISCOUNT_OFFER'
      });
      break;
    }
  }

  for (const pattern of FREE_SHIPPING_PATTERNS) {
    const match = combinedCopy.match(pattern);
    if (match) {
      rawSignals.push({
        type: 'OFFER',
        raw: match[0].trim(),
        normalized: 'FREE_SHIPPING'
      });
      break;
    }
  }

  for (const pattern of BOGO_PATTERNS) {
    const match = combinedCopy.match(pattern);
    if (match) {
      rawSignals.push({
        type: 'OFFER',
        raw: match[0].trim(),
        normalized: 'BOGO_OFFER'
      });
      break;
    }
  }

  // C. Price Language Signals
  for (const pattern of PRICE_PATTERNS) {
    const match = combinedCopy.match(pattern);
    if (match) {
      rawSignals.push({
        type: 'PRICE',
        raw: match[0].trim(),
        normalized: 'PRICE_PRESENT'
      });
      break;
    }
  }

  // D. Commercial Intent Signals
  for (const item of COMMERCIAL_INTENT_PATTERNS) {
    const match = combinedCopy.match(item.regex);
    if (match) {
      rawSignals.push({
        type: 'COMMERCIAL_INTENT',
        raw: match[0].trim(),
        normalized: item.normalized
      });
    }
  }

  // E. Product Terms
  for (const item of PRODUCT_TERM_PATTERNS) {
    const match = combinedCopy.match(item.regex);
    if (match) {
      rawSignals.push({
        type: 'PRODUCT_TERM',
        raw: match[0].trim(),
        normalized: item.normalized
      });
    }
  }

  // F. Service Terms
  for (const item of SERVICE_TERM_PATTERNS) {
    const match = combinedCopy.match(item.regex);
    if (match) {
      rawSignals.push({
        type: 'SERVICE_TERM',
        raw: match[0].trim(),
        normalized: item.normalized
      });
    }
  }

  // E. Creative Type Signal
  const cType = detectCreativeType(cand);
  if (cType !== 'UNKNOWN') {
    rawSignals.push({
      type: 'CREATIVE_TYPE',
      raw: cType,
      normalized: cType
    });
  }

  // F. Language Signal
  const langResult = detectLanguage(combinedCopy);
  if (langResult.language !== 'UNKNOWN') {
    rawSignals.push({
      type: 'LANGUAGE',
      raw: langResult.language,
      normalized: langResult.language
    });
  }

  // Return anti-inflated list
  return aggregateCreativeSignals(
    rawSignals.map(s => ({
      type: s.type,
      rawSignal: s.raw,
      normalized: s.normalized,
      occurrences: 1
    }))
  );
}

// -------------------------------------------------------------
// 8. ANTI-INFLATION AGGREGATION
// -------------------------------------------------------------
/**
 * Merges creative signals across ads for an entity.
 * Prevents identical repeated signals from inflating importance while
 * preserving total occurrence counts for transparent auditing.
 */
export function aggregateCreativeSignals(
  existingOrAll: StructuredCreativeSignal[],
  newSignals?: StructuredCreativeSignal[]
): StructuredCreativeSignal[] {
  const combined = newSignals ? [...existingOrAll, ...newSignals] : existingOrAll;
  const map = new Map<string, StructuredCreativeSignal>();

  for (const s of combined) {
    const key = `${s.type}::${s.normalized}`;
    const existing = map.get(key);
    if (existing) {
      existing.occurrences += (s.occurrences || 1);
    } else {
      map.set(key, {
        type: s.type,
        rawSignal: s.rawSignal,
        raw: s.rawSignal,
        normalized: s.normalized,
        occurrences: s.occurrences || 1
      } as any);
    }
  }

  return Array.from(map.values());
}
