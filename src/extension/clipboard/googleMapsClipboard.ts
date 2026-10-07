/**
 * LeadNoria — Spreadsheet Clipboard & Copy All Domain
 * Google Maps Research Results Clipboard Projection
 *
 * HARD INVARIANTS:
 * - Exact 8-column spreadsheet projection:
 *     1. Business Name
 *     2. Google Maps
 *     3. Website
 *     4. Rating
 *     5. Phone
 *     6. Facebook
 *     7. Instagram
 *     8. Other Social
 * - Transient user-initiated projection: NEVER persists restricted Google fields into Lead schema.
 * - Rating rule: Actual observed rating (e.g. 5, 4.7, 4.0). Unknown rating remains blank "" (NEVER 0).
 * - Website rule: YES, NO, or blank for unknown (never silently converted to NO).
 * - Phone & Social rule: Use existing observed signals; blank if unavailable; zero fabricated data.
 * - ZERO DOM access, zero selector knowledge, zero scraping or browser automation.
 */

import type { ClipboardColumn, GoogleMapsClipboardRow, TsvSerializerOptions } from './types.ts';
import { serializeToTsv } from './tsvSerializer.ts';

export const GOOGLE_MAPS_CLIPBOARD_COLUMNS: readonly ClipboardColumn[] = Object.freeze([
  { key: 'businessName', header: 'Business Name' },
  { key: 'googleMaps', header: 'Google Maps' },
  { key: 'website', header: 'Website' },
  { key: 'rating', header: 'Rating' },
  { key: 'phone', header: 'Phone' },
  { key: 'facebook', header: 'Facebook' },
  { key: 'instagram', header: 'Instagram' },
  { key: 'otherSocial', header: 'Other Social' }
]);

interface ObservedFieldLike<T = unknown> {
  availability?: string;
  parsedValue?: T;
  rawValue?: string;
}

interface SocialProfileLike {
  platform?: string;
  url?: string;
}

/**
 * Extracts a string value from either a plain string or an ObservedField object.
 */
function extractObservedString(val: unknown): string {
  if (typeof val === 'string') {
    return val.trim();
  }
  if (val && typeof val === 'object') {
    const field = val as ObservedFieldLike<string>;
    if (field.availability === 'PRESENT' || !field.availability) {
      if (typeof field.parsedValue === 'string') {
        return field.parsedValue.trim();
      }
      if (typeof field.rawValue === 'string') {
        return field.rawValue.trim();
      }
    }
  }
  return '';
}

/**
 * Extracts the rating representation.
 * Preserves actual observed rating (e.g., 5, 4.7, 4.0).
 * Unknown rating remains blank "" (NEVER converted to 0).
 */
function extractRating(val: unknown): string {
  if (val === null || val === undefined) {
    return '';
  }
  if (typeof val === 'number') {
    return Number.isFinite(val) ? String(val) : '';
  }
  if (typeof val === 'object') {
    const field = val as ObservedFieldLike<number>;
    if (field.availability === 'PRESENT') {
      if (typeof field.parsedValue === 'number' && Number.isFinite(field.parsedValue)) {
        return String(field.parsedValue);
      }
      if (typeof field.rawValue === 'string' && field.rawValue.trim().length > 0) {
        const parsed = parseFloat(field.rawValue.trim());
        if (Number.isFinite(parsed)) {
          return String(parsed);
        }
      }
    }
    // UNKNOWN, ABSENT, AMBIGUOUS, UNSUPPORTED remain blank
    return '';
  }
  if (typeof val === 'string' && val.trim().length > 0) {
    const parsed = parseFloat(val.trim());
    return Number.isFinite(parsed) ? String(parsed) : '';
  }
  return '';
}

/**
 * Extracts website state: "YES", "NO", or "" for unknown.
 * Unknown website is NEVER coerced to "NO".
 */
function extractWebsiteState(candidate: Record<string, unknown>): string {
  // 1. Explicit websiteState property ('YES' | 'NO' | 'UNKNOWN')
  const explicitState = candidate.websiteState;
  if (explicitState === 'YES') return 'YES';
  if (explicitState === 'NO') return 'NO';
  if (explicitState === 'UNKNOWN') return '';

  // 2. Explicit website field
  const explicitWebsite = candidate.website;
  if (explicitWebsite === 'YES') return 'YES';
  if (explicitWebsite === 'NO') return 'NO';
  if (explicitWebsite === 'UNKNOWN') return '';

  // 3. Inspection of websiteUrl or website
  const webTarget = candidate.websiteUrl || candidate.website;
  if (typeof webTarget === 'string') {
    const trimmed = webTarget.trim();
    if (trimmed.length > 0 && !trimmed.includes('google.com/maps')) {
      return 'YES';
    }
    return '';
  }

  if (webTarget && typeof webTarget === 'object') {
    const field = webTarget as ObservedFieldLike<string>;
    if (field.availability === 'PRESENT') {
      const u = field.parsedValue || field.rawValue;
      if (typeof u === 'string' && u.trim().length > 0 && !u.includes('google.com/maps')) {
        return 'YES';
      }
      return '';
    }
    if (field.availability === 'ABSENT') {
      return 'NO';
    }
    // UNKNOWN, AMBIGUOUS, UNSUPPORTED -> blank
    return '';
  }

  return '';
}

/**
 * Extracts phone from candidate or enrichment evidence.
 */
function extractPhone(candidate: Record<string, unknown>): string {
  const directPhone = extractObservedString(candidate.phone);
  if (directPhone) {
    return directPhone;
  }

  // Check contactSummary.phoneText
  const contactSummary = candidate.contactSummary as { phoneText?: string } | undefined;
  if (typeof contactSummary?.phoneText === 'string' && contactSummary.phoneText.trim()) {
    return contactSummary.phoneText.trim();
  }

  // Check enrichment contact evidence
  const enrichment = candidate.enrichmentResult as {
    contactEvidence?: {
      phones?: readonly { phone?: string; rawPhone?: string }[];
    };
  } | undefined;

  const enrichedPhones = enrichment?.contactEvidence?.phones;
  if (Array.isArray(enrichedPhones) && enrichedPhones.length > 0) {
    const first = enrichedPhones[0];
    const p = first?.phone || first?.rawPhone;
    if (typeof p === 'string' && p.trim()) {
      return p.trim();
    }
  }

  return '';
}

/**
 * Extracts social profile URLs (Facebook, Instagram, Other).
 */
function extractSocialProfiles(candidate: Record<string, unknown>): {
  facebook: string;
  instagram: string;
  otherSocial: string;
} {
  let fb = '';
  let ig = '';
  const other: string[] = [];

  // Direct candidate properties
  if (typeof candidate.facebook === 'string' && candidate.facebook.trim()) {
    fb = candidate.facebook.trim();
  } else if (typeof candidate.facebookUrl === 'string' && candidate.facebookUrl.trim()) {
    fb = candidate.facebookUrl.trim();
  } else if (typeof candidate.facebookPageUrl === 'string' && candidate.facebookPageUrl.trim()) {
    fb = candidate.facebookPageUrl.trim();
  }

  if (typeof candidate.instagram === 'string' && candidate.instagram.trim()) {
    ig = candidate.instagram.trim();
  } else if (typeof candidate.instagramUrl === 'string' && candidate.instagramUrl.trim()) {
    ig = candidate.instagramUrl.trim();
  }

  if (typeof candidate.otherSocial === 'string' && candidate.otherSocial.trim()) {
    other.push(candidate.otherSocial.trim());
  } else if (typeof candidate.linkedInUrl === 'string' && candidate.linkedInUrl.trim()) {
    other.push(candidate.linkedInUrl.trim());
  }

  // Collect profiles from candidate.socialProfiles or enrichment contact evidence
  const candidateProfiles = (candidate.socialProfiles as readonly SocialProfileLike[]) || [];
  const enrichment = candidate.enrichmentResult as {
    contactEvidence?: {
      socialProfiles?: readonly SocialProfileLike[];
    };
  } | undefined;
  const enrichedProfiles = enrichment?.contactEvidence?.socialProfiles || [];

  const allProfiles: readonly SocialProfileLike[] = [...candidateProfiles, ...enrichedProfiles];

  for (const p of allProfiles) {
    if (!p || !p.url) continue;
    const url = String(p.url).trim();
    if (!url) continue;

    const platform = String(p.platform || '').toUpperCase();
    const urlLower = url.toLowerCase();

    if (platform === 'FACEBOOK' || urlLower.includes('facebook.com')) {
      if (!fb) fb = url;
    } else if (platform === 'INSTAGRAM' || urlLower.includes('instagram.com')) {
      if (!ig) ig = url;
    } else {
      if (!other.includes(url)) {
        other.push(url);
      }
    }
  }

  return {
    facebook: fb,
    instagram: ig,
    otherSocial: other.join(', ')
  };
}

/**
 * Maps a single Google Maps candidate into a structured spreadsheet clipboard row.
 */
export function googleMapsCandidateToClipboardRow(candidate: unknown): GoogleMapsClipboardRow {
  if (!candidate || typeof candidate !== 'object') {
    return Object.freeze({
      businessName: '',
      googleMaps: '',
      website: '',
      rating: '',
      phone: '',
      facebook: '',
      instagram: '',
      otherSocial: ''
    });
  }

  const cand = candidate as Record<string, unknown>;

  // 1. Business Name
  const businessIdentity = cand.businessIdentity as { businessName?: string } | undefined;
  const businessName = extractObservedString(cand.businessName) ||
    extractObservedString(cand.name) ||
    extractObservedString(cand.displayName) ||
    extractObservedString(businessIdentity?.businessName) ||
    '';

  // 2. Google Maps URL
  const googleMaps = extractObservedString(cand.mapsUrl) ||
    extractObservedString(cand.googleMapsUrl) ||
    extractObservedString(cand.googleMaps) ||
    '';

  // 3. Website (YES, NO, blank for unknown)
  const website = extractWebsiteState(cand);

  // 4. Rating (5, 4.7, 4.0; blank for unknown; never 0)
  const rating = extractRating(cand.rating);

  // 5. Phone
  const phone = extractPhone(cand);

  // 6, 7, 8. Social profiles
  const { facebook, instagram, otherSocial } = extractSocialProfiles(cand);

  return Object.freeze({
    businessName,
    googleMaps,
    website,
    rating,
    phone,
    facebook,
    instagram,
    otherSocial
  });
}

/**
 * Maps an array of Google Maps candidates into structured clipboard rows.
 */
export function googleMapsResultsToClipboardRows(
  candidates: readonly unknown[]
): GoogleMapsClipboardRow[] {
  if (!Array.isArray(candidates)) {
    return [];
  }
  return candidates.map(googleMapsCandidateToClipboardRow);
}

/**
 * Projects Google Maps research candidates directly into TSV spreadsheet text.
 */
export function googleMapsResultsToTsv(
  candidates: readonly unknown[],
  options?: TsvSerializerOptions
): string {
  const rows = googleMapsResultsToClipboardRows(candidates);
  return serializeToTsv(GOOGLE_MAPS_CLIPBOARD_COLUMNS, rows, options);
}
