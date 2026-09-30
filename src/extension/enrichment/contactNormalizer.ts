/**
 * Contact & Digital Presence Normalizer (Phase 11)
 *
 * Implements deterministic sanitization, RFC 5322 email normalization,
 * role categorization, phone formatting, social URL canonicalization,
 * and untrusted-input security defense.
 */

import {
  normalizePhone as baseNormalizePhone,
  normalizeEmail as baseNormalizeEmail,
  normalizeUrl as baseNormalizeUrl,
  normalizeBusinessName as baseNormalizeBusinessName,
  sanitizeText
} from '../extraction/normalizer.ts';
import type {
  BusinessEmailType,
  ContactFieldStatus,
  LocationFieldStatus
} from './contactTypes.ts';

// Banned placeholder/vendor domains that are not public business contacts
const PLACEHOLDER_EMAIL_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'domain.com',
  'email.com',
  'sentry.io',
  'wixpress.com',
  'wordpress.org',
  'shopify.com',
  'myshopify.com',
  'gravatar.com',
  'schema.org'
]);

// Generic business email role prefixes
const GENERIC_EMAIL_PREFIXES = new Set([
  'info',
  'contact',
  'contactus',
  'support',
  'sales',
  'hello',
  'hi',
  'admin',
  'administrator',
  'billing',
  'accounts',
  'press',
  'media',
  'jobs',
  'career',
  'careers',
  'hr',
  'help',
  'inquiry',
  'inquiries',
  'enquiry',
  'enquiries',
  'office',
  'frontdesk',
  'service',
  'services',
  'customercare',
  'customerservice',
  'team',
  'general',
  'mail',
  'reception',
  'booking',
  'bookings',
  'reservation',
  'reservations',
  'order',
  'orders'
]);

// Direct executive / leadership role prefixes
const DIRECT_ROLE_PREFIXES = new Set([
  'ceo',
  'founder',
  'president',
  'director',
  'manager',
  'cto',
  'cfo',
  'coo',
  'cmo',
  'owner',
  'partner',
  'principal',
  'headmaster',
  'dean'
]);

// ==========================================
// 1. Security & Sanitization Guards
// ==========================================

/**
 * Validates whether a URL uses safe protocols. Rejects javascript:, data:, vbscript:, etc.
 */
export function isSafeWebUrl(rawUrl: string): boolean {
  if (!rawUrl) return false;
  const trimmed = rawUrl.trim().toLowerCase();
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:') ||
    trimmed.startsWith('blob:')
  ) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Cleans untrusted text from crawled web pages.
 * Neutralizes potential HTML tags and malicious prompt-injection payloads
 * by strictly interpreting them as literal unicode text.
 */
export function sanitizeWebText(text?: string | null, maxLength = 2000): string {
  if (!text) return '';
  return sanitizeText(text, maxLength);
}

// ==========================================
// 2. Email Normalization & Classification
// ==========================================

export interface NormalizedEmailResult {
  rawValue: string;
  normalizedEmail: string;
  localPart: string;
  domainPart: string;
  emailType: BusinessEmailType;
  status: ContactFieldStatus;
  isValid: boolean;
  reason?: string;
}

export function normalizeBusinessEmail(rawEmail?: string | null): NormalizedEmailResult {
  if (!rawEmail) {
    return {
      rawValue: '',
      normalizedEmail: '',
      localPart: '',
      domainPart: '',
      emailType: 'UNKNOWN',
      status: 'NOT_FOUND',
      isValid: false,
      reason: 'EMPTY_EMAIL'
    };
  }

  // Strip mailto: prefix and any mailto query parameters (?subject=..., ?body=...)
  let cleaned = String(rawEmail).trim();
  if (cleaned.toLowerCase().startsWith('mailto:')) {
    cleaned = cleaned.slice(7);
  }
  const queryIdx = cleaned.indexOf('?');
  if (queryIdx !== -1) {
    cleaned = cleaned.slice(0, queryIdx);
  }

  // Strip surrounding punctuation, brackets, quotes
  cleaned = cleaned.replace(/^[<(\["']+|[>)\]"',;:]+$/g, '').trim();

  // Basic sanity check against invalid extensions mistakenly matched as emails (e.g. image@2x.png)
  const lower = cleaned.toLowerCase();
  if (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.js') ||
    lower.endsWith('.css')
  ) {
    return {
      rawValue: String(rawEmail),
      normalizedEmail: '',
      localPart: '',
      domainPart: '',
      emailType: 'UNKNOWN',
      status: 'INVALID',
      isValid: false,
      reason: 'ASSET_FILENAME_NOT_EMAIL'
    };
  }

  const baseResult = baseNormalizeEmail(cleaned);
  if (!baseResult.isValid) {
    return {
      rawValue: String(rawEmail),
      normalizedEmail: '',
      localPart: '',
      domainPart: '',
      emailType: 'UNKNOWN',
      status: 'INVALID',
      isValid: false,
      reason: baseResult.error || 'INVALID_EMAIL_SYNTAX'
    };
  }

  const domain = baseResult.domainPart.toLowerCase();
  if (PLACEHOLDER_EMAIL_DOMAINS.has(domain)) {
    return {
      rawValue: String(rawEmail),
      normalizedEmail: baseResult.normalizedEmail,
      localPart: baseResult.localPart,
      domainPart: domain,
      emailType: 'UNKNOWN',
      status: 'INVALID',
      isValid: false,
      reason: 'PLACEHOLDER_OR_VENDOR_DOMAIN'
    };
  }

  // Classify email type
  const localClean = baseResult.localPart.toLowerCase().replace(/[^a-z0-9]/g, '');
  let emailType: BusinessEmailType = 'UNKNOWN';

  if (GENERIC_EMAIL_PREFIXES.has(localClean)) {
    emailType = 'GENERIC_BUSINESS';
  } else if (DIRECT_ROLE_PREFIXES.has(localClean)) {
    emailType = 'DIRECT_ROLE';
  } else if (baseResult.localPart.includes('.') || baseResult.localPart.includes('_') || baseResult.localPart.length > 3) {
    emailType = 'APPARENT_PERSONAL';
  } else {
    emailType = 'GENERIC_BUSINESS';
  }

  return {
    rawValue: String(rawEmail),
    normalizedEmail: `${baseResult.localPart.toLowerCase()}@${domain}`,
    localPart: baseResult.localPart,
    domainPart: domain,
    emailType,
    status: 'FOUND',
    isValid: true
  };
}

// ==========================================
// 3. Phone Normalization
// ==========================================

export interface NormalizedPhoneResult {
  rawValue: string;
  normalizedValue: string;
  e164Format?: string;
  nationalFormat?: string;
  countryCode?: string;
  dialCode?: string;
  extension?: string;
  status: ContactFieldStatus;
  isValid: boolean;
  reason?: string;
}

export function normalizeBusinessPhone(
  rawPhone?: string | null,
  countryHint?: string
): NormalizedPhoneResult {
  if (!rawPhone) {
    return {
      rawValue: '',
      normalizedValue: '',
      status: 'NOT_FOUND',
      isValid: false,
      reason: 'EMPTY_PHONE'
    };
  }

  let cleaned = String(rawPhone).trim();
  if (cleaned.toLowerCase().startsWith('tel:')) {
    cleaned = cleaned.slice(4);
  }

  const baseResult = baseNormalizePhone(cleaned, countryHint);

  if (baseResult.phoneState === 'PHONE_INVALID') {
    return {
      rawValue: String(rawPhone),
      normalizedValue: '',
      status: 'INVALID',
      isValid: false,
      reason: baseResult.error || 'INVALID_PHONE_NUMBER'
    };
  }

  if (baseResult.phoneState === 'PHONE_AMBIGUOUS') {
    // Phone contains digits but lack of country code or non-standard length leaves it ambiguous
    const digits = cleaned.replace(/[^0-9]/g, '');
    return {
      rawValue: String(rawPhone),
      normalizedValue: digits,
      status: 'AMBIGUOUS',
      isValid: false,
      reason: baseResult.error || 'AMBIGUOUS_WITHOUT_COUNTRY_CODE'
    };
  }

  return {
    rawValue: String(rawPhone),
    normalizedValue: baseResult.e164Format || baseResult.nationalFormat || cleaned,
    e164Format: baseResult.e164Format,
    nationalFormat: baseResult.nationalFormat,
    countryCode: baseResult.countryCode,
    dialCode: baseResult.dialCode,
    extension: baseResult.extension,
    status: 'FOUND',
    isValid: true
  };
}

// ==========================================
// 4. Social / Digital Presence URL Normalization
// ==========================================

export interface NormalizedSocialUrlResult {
  rawUrl: string;
  normalizedUrl: string;
  domain: string;
  platformDomain: string;
  handleOrPath?: string;
  isValid: boolean;
  isShareWidget: boolean;
  reason?: string;
}

export function normalizeSocialUrl(rawUrl?: string | null): NormalizedSocialUrlResult {
  if (!rawUrl) {
    return {
      rawUrl: '',
      normalizedUrl: '',
      domain: '',
      platformDomain: '',
      isValid: false,
      isShareWidget: false,
      reason: 'EMPTY_URL'
    };
  }

  if (!isSafeWebUrl(rawUrl)) {
    return {
      rawUrl: String(rawUrl),
      normalizedUrl: '',
      domain: '',
      platformDomain: '',
      isValid: false,
      isShareWidget: false,
      reason: 'UNSAFE_OR_MALFORMED_URL'
    };
  }

  const baseResult = baseNormalizeUrl(rawUrl);
  if (!baseResult.isValid) {
    return {
      rawUrl: String(rawUrl),
      normalizedUrl: '',
      domain: '',
      platformDomain: '',
      isValid: false,
      isShareWidget: false,
      reason: baseResult.error || 'MALFORMED_URL'
    };
  }

  const hostname = baseResult.hostname.toLowerCase().replace(/^www\./, '');
  const pathname = baseResult.pathname || '';
  const lowerPath = pathname.toLowerCase();

  // Detect social sharing widgets (e.g. /sharer, /intent/tweet, /shareArticle)
  const isShareWidget =
    lowerPath.includes('/sharer') ||
    lowerPath.includes('/intent/tweet') ||
    lowerPath.includes('/share') ||
    lowerPath.includes('/sharearticle') ||
    lowerPath.includes('/dialog/share') ||
    lowerPath.includes('/pin/create');

  // Strip residual tracking params (e.g. igshid, fbclid, ref, etc.)
  const cleanUrl = `${baseResult.protocol}//${hostname}${pathname}`.replace(/\/$/, '');

  return {
    rawUrl: String(rawUrl),
    normalizedUrl: cleanUrl,
    domain: baseResult.canonicalDomain,
    platformDomain: hostname,
    handleOrPath: pathname.replace(/^\/+/, '') || undefined,
    isValid: true,
    isShareWidget
  };
}

// ==========================================
// 5. Address / Location Normalization
// ==========================================

export interface NormalizedAddressResult {
  rawAddress: string;
  normalizedAddress: string;
  streetAddress?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  status: LocationFieldStatus;
  isValid: boolean;
}

export function normalizeBusinessAddress(
  rawAddress?: string | null,
  countryHint?: string
): NormalizedAddressResult {
  const sanitized = sanitizeWebText(rawAddress, 500);
  if (!sanitized || sanitized.length < 5) {
    return {
      rawAddress: rawAddress || '',
      normalizedAddress: '',
      status: 'NOT_FOUND',
      isValid: false
    };
  }

  // Canonicalize whitespace
  const norm = sanitized.replace(/\s+/g, ' ').trim();

  // Basic heuristic detection for postal code and components
  const postalMatch = norm.match(/\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}|\d{5}(?:-\d{4})?|\d{4,6})\b/i);
  const postalCode = postalMatch ? postalMatch[1].trim() : undefined;

  // Distinguish complete vs partial
  const parts = norm.split(',').map(p => p.trim()).filter(Boolean);
  let status: LocationFieldStatus = 'PARTIAL';

  if (parts.length >= 3 || (parts.length >= 2 && postalCode)) {
    status = 'FOUND';
  } else if (parts.length === 1 && !postalCode) {
    status = 'PARTIAL';
  }

  return {
    rawAddress: String(rawAddress),
    normalizedAddress: norm,
    postalCode,
    country: countryHint?.toUpperCase(),
    status,
    isValid: true
  };
}

// ==========================================
// 6. Business Name Normalization
// ==========================================

export function normalizeBusinessNameFact(rawName?: string | null): {
  rawValue: string;
  normalizedName: string;
  comparisonKey: string;
  status: ContactFieldStatus;
} {
  const sanitized = sanitizeWebText(rawName, 300);
  if (!sanitized) {
    return {
      rawValue: '',
      normalizedName: '',
      comparisonKey: '',
      status: 'NOT_FOUND'
    };
  }

  const baseResult = baseNormalizeBusinessName(sanitized);

  return {
    rawValue: sanitized,
    normalizedName: baseResult.displayName,
    comparisonKey: baseResult.comparisonName,
    status: 'FOUND'
  };
}
