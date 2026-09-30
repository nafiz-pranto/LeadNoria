/**
 * Source-Neutral Normalization Engine (Phase 5 Reconciled)
 *
 * Implements deterministic normalization, sanitization, canonicalization,
 * parameter preservation, and internationalization across diverse source inputs.
 */

import type {
  NormalizedUrlComponents,
  NormalizedPhoneComponents,
  NormalizedEmailComponents,
  NormalizedBusinessNameComponents,
  NormalizedAddressComponents,
  NormalizedCategoryComponents,
  NormalizedLocationComponents,
  SourceIdentifier,
  SourceType,
  SourceRecordType,
  AcquisitionContext,
  ProvenanceType,
  PolicyStatus,
  PhoneState,
  CountryInferenceState,
  SourceContribution
} from './types.ts';

// Conservative allowlist of known marketing and ad-click tracking parameters.
// Ambiguous parameters like 'ref', 'source', 'campaign', 'affiliate', 'trk' are preserved as functional.
const KNOWN_TRACKING_PARAMS = new Set([
  'fbclid', 'gclid', 'msclkid', 'dclid', 'gbraid', 'wbraid'
]);

// Common legal entity suffixes stripped ONLY for comparison keys (never display names)
const LEGAL_SUFFIXES = [
  'llc', 'l.l.c.', 'inc', 'inc.', 'incorporated', 'corp', 'corp.', 'corporation',
  'ltd', 'ltd.', 'limited', 'gmbh', 'co', 'co.', 'company', 'pvt', 'pvt.',
  'private limited', 'enterprises', 'holdings', 'group', 'sa', 's.a.', 'plc',
  's.l.', 'sl', 'sarl', 's.a.r.l.', 'sas', 's.a.s.', 'srl', 's.r.l.'
];

// Common country dial codes for country-aware resolution (representative lookup)
const COMMON_COUNTRY_CODES: Record<string, { code: string; dial: string; nationalDigits: number[] }> = {
  US: { code: 'US', dial: '1', nationalDigits: [10] },
  CA: { code: 'CA', dial: '1', nationalDigits: [10] },
  GB: { code: 'GB', dial: '44', nationalDigits: [10, 11] },
  UK: { code: 'GB', dial: '44', nationalDigits: [10, 11] },
  BD: { code: 'BD', dial: '880', nationalDigits: [10, 11] },
  DE: { code: 'DE', dial: '49', nationalDigits: [9, 10, 11, 12] },
  FR: { code: 'FR', dial: '33', nationalDigits: [9, 10] },
  ES: { code: 'ES', dial: '34', nationalDigits: [9] },
  AU: { code: 'AU', dial: '61', nationalDigits: [9, 10] },
  AE: { code: 'AE', dial: '971', nationalDigits: [9] },
  IN: { code: 'IN', dial: '91', nationalDigits: [10] },
  SG: { code: 'SG', dial: '65', nationalDigits: [8] },
  NZ: { code: 'NZ', dial: '64', nationalDigits: [8, 9] },
  IE: { code: 'IE', dial: '353', nationalDigits: [9] },
  NL: { code: 'NL', dial: '31', nationalDigits: [9] },
  IT: { code: 'IT', dial: '39', nationalDigits: [9, 10] },
  BR: { code: 'BR', dial: '55', nationalDigits: [10, 11] },
  JP: { code: 'JP', dial: '81', nationalDigits: [10] }
};

// ==========================================
// 1. Sanitization Layer
// ==========================================

export function sanitizeText(raw?: string | null, maxLength = 2000): string {
  if (raw === null || raw === undefined) return '';
  let text = String(raw);

  // 1. Remove script and style tags along with their inner contents completely
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 2. Remove control characters (except newline, tab) and zero-width spaces
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '');

  // 3. Neutralize HTML tags
  text = text.replace(/<[^>]*>/g, ' ');

  // 4. Normalize Unicode (NFC)
  text = text.normalize('NFC');

  // 5. Collapse consecutive whitespace
  text = text.replace(/[ \t\r\f\v]+/g, ' ').trim();

  // 6. Enforce safe length ceiling
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim();
  }

  return text;
}

// ==========================================
// 2. URL Normalization
// ==========================================

export function normalizeUrl(rawUrl?: string | null): NormalizedUrlComponents {
  // Strip surrounding quotes or angle brackets before sanitizing
  const preCleaned = (rawUrl || '').trim().replace(/^[<(\["']+|[>)\]"']+$/g, '').trim();
  const original = sanitizeText(preCleaned, 2048);

  if (!original) {
    return {
      originalUrl: '',
      normalizedUrl: '',
      canonicalDomain: '',
      canonicalOrigin: '',
      protocol: 'https:',
      hostname: '',
      pathname: '',
      hasMeaningfulSubdomain: false,
      preservedParams: {},
      isCredentialBearing: false,
      isValid: false,
      error: 'EMPTY_URL'
    };
  }

  // Security Guard: Reject dangerous or unsupported protocols
  if (/^(javascript|data|blob|file|about|chrome|chrome-extension):/i.test(original)) {
    return {
      originalUrl: original,
      normalizedUrl: '',
      canonicalDomain: '',
      canonicalOrigin: '',
      protocol: 'https:',
      hostname: '',
      pathname: '',
      hasMeaningfulSubdomain: false,
      preservedParams: {},
      isCredentialBearing: false,
      isValid: false,
      error: 'SECURITY_REJECTED_PROTOCOL'
    };
  }

  let working = original;
  if (!/^https?:\/\//i.test(working)) {
    working = 'https://' + working;
  }

  try {
    const parsed = new URL(working);

    // Security Guard: Reject credential-bearing URLs (e.g. user:password@example.com)
    if (parsed.username || parsed.password) {
      return {
        originalUrl: original,
        normalizedUrl: '',
        canonicalDomain: '',
        canonicalOrigin: '',
        protocol: 'https:',
        hostname: '',
        pathname: '',
        hasMeaningfulSubdomain: false,
        preservedParams: {},
        isCredentialBearing: true,
        isValid: false,
        error: 'SECURITY_REJECTED_CREDENTIALS'
      };
    }

    const protocol = parsed.protocol.toLowerCase() === 'http:' ? 'http:' : 'https:';
    let hostname = parsed.hostname.toLowerCase().trim();

    // Clean trailing dots
    hostname = hostname.replace(/\.+$/, '');

    // Determine meaningful subdomain (e.g., blog.company.com vs www.company.com)
    const hostParts = hostname.split('.');
    let canonicalDomain = hostname;
    let hasMeaningfulSubdomain = false;

    if (hostname.startsWith('www.')) {
      canonicalDomain = hostname.substring(4);
    } else if (hostParts.length > 2) {
      // Retain meaningful subdomains
      hasMeaningfulSubdomain = true;
      canonicalDomain = hostname;
    }

    // Strip ONLY verified tracking parameters (utm_*, fbclid, gclid, msclkid, dclid, gbraid, wbraid);
    // preserve functional parameters (e.g. ?store=dhaka, ?branch=2, ?lang=bn, ?ref=partner, ?source=store, ?campaign=spring)
    const cleanParams = new URLSearchParams();
    const preservedParams: Record<string, string> = {};

    for (const [key, value] of parsed.searchParams.entries()) {
      const lowerKey = key.toLowerCase();
      const isTracking = lowerKey.startsWith('utm_') || KNOWN_TRACKING_PARAMS.has(lowerKey);
      if (!isTracking) {
        cleanParams.append(key, value);
        preservedParams[key] = value;
      }
    }

    // Canonicalize path: remove redundant slashes, normalize trailing slash
    let pathname = parsed.pathname.replace(/\/+/g, '/');
    if (pathname === '/') {
      pathname = '';
    } else if (pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    const searchStr = cleanParams.toString() ? `?${cleanParams.toString()}` : '';
    const normalizedUrl = `${protocol}//${hostname}${pathname}${searchStr}`;
    const canonicalOrigin = `${protocol}//${hostname}`;

    return {
      originalUrl: original,
      normalizedUrl,
      canonicalDomain,
      canonicalOrigin,
      protocol,
      hostname,
      pathname,
      hasMeaningfulSubdomain,
      preservedParams,
      isCredentialBearing: false,
      isValid: true
    };
  } catch (err: any) {
    return {
      originalUrl: original,
      normalizedUrl: '',
      canonicalDomain: '',
      canonicalOrigin: '',
      protocol: 'https:',
      hostname: '',
      pathname: '',
      hasMeaningfulSubdomain: false,
      preservedParams: {},
      isCredentialBearing: false,
      isValid: false,
      error: `MALFORMED_URL: ${err.message}`
    };
  }
}

// ==========================================
// 3. Phone Normalization
// ==========================================

export function normalizePhone(rawPhone?: string | null, countryHint?: string): NormalizedPhoneComponents {
  const original = sanitizeText(rawPhone, 100);

  if (!original) {
    return {
      rawPhone: '',
      phoneState: 'PHONE_INVALID',
      countryInference: 'COUNTRY_UNKNOWN',
      isValid: false,
      error: 'EMPTY_PHONE'
    };
  }

  // Detect extension pattern (e.g. ext 102, x45)
  let extension: string | undefined;
  let cleanInput = original;
  const extMatch = original.match(/(?:ext|ext\.|x|#)\s*([0-9]{1,6})/i);
  if (extMatch) {
    extension = extMatch[1];
    cleanInput = original.substring(0, extMatch.index).trim();
  }

  // Extract digits and check if leading plus is present
  const hasPlus = cleanInput.trim().startsWith('+');
  const digits = cleanInput.replace(/[^0-9]/g, '');

  if (digits.length < 5 || digits.length > 15) {
    return {
      rawPhone: original,
      phoneState: 'PHONE_INVALID',
      countryInference: 'COUNTRY_UNKNOWN',
      isValid: false,
      error: 'INVALID_DIGIT_LENGTH'
    };
  }

  let countryMeta = countryHint ? COMMON_COUNTRY_CODES[countryHint.toUpperCase()] : undefined;
  let countryInference: CountryInferenceState = countryHint ? 'COUNTRY_EXPLICIT' : 'COUNTRY_UNKNOWN';
  let e164: string | undefined;
  let dialCode: string | undefined;
  let nationalNumber = digits;

  if (hasPlus) {
    // International leading plus: identify matching country dial code
    for (const meta of Object.values(COMMON_COUNTRY_CODES)) {
      if (digits.startsWith(meta.dial)) {
        dialCode = meta.dial;
        nationalNumber = digits.substring(meta.dial.length);
        e164 = `+${digits}`;
        if (!countryMeta) {
          countryMeta = meta;
          countryInference = 'COUNTRY_INFERRED';
        }
        break;
      }
    }
    if (!e164) {
      // General valid international E.164 number
      e164 = `+${digits}`;
      countryInference = 'COUNTRY_INFERRED';
    }
  } else if (countryMeta) {
    // Country code explicitly provided: parse national number
    if (countryMeta.nationalDigits.includes(digits.length)) {
      e164 = `+${countryMeta.dial}${digits}`;
      dialCode = countryMeta.dial;
      nationalNumber = digits;
    } else if (digits.startsWith(countryMeta.dial)) {
      e164 = `+${digits}`;
      dialCode = countryMeta.dial;
      nationalNumber = digits.substring(countryMeta.dial.length);
    } else {
      return {
        rawPhone: original,
        phoneState: 'PHONE_AMBIGUOUS',
        countryInference: 'COUNTRY_EXPLICIT',
        countryCode: countryMeta.code,
        isValid: false,
        error: 'AMBIGUOUS_NATIONAL_NUMBER_FOR_COUNTRY'
      };
    }
  } else {
    // No country hint and no leading plus: cannot reliably guess country without fabricating
    return {
      rawPhone: original,
      phoneState: 'PHONE_AMBIGUOUS',
      countryInference: 'COUNTRY_UNKNOWN',
      isValid: false,
      error: 'AMBIGUOUS_WITHOUT_COUNTRY_CODE'
    };
  }

  return {
    rawPhone: original,
    e164Format: e164,
    internationalFormat: e164,
    nationalFormat: nationalNumber,
    countryCode: countryMeta?.code,
    countryInference,
    dialCode,
    extension,
    phoneState: 'PHONE_NORMALIZED',
    isValid: true
  };
}

// ==========================================
// 4. Email Normalization
// ==========================================

export function normalizeEmail(rawEmail?: string | null): NormalizedEmailComponents {
  if (!rawEmail) {
    return {
      rawEmail: '',
      normalizedEmail: '',
      localPart: '',
      domainPart: '',
      isValid: false,
      error: 'EMPTY_EMAIL'
    };
  }

  // Strip accidental punctuation or angle brackets before sanitizing (e.g. <contact@site.com>)
  const stripped = String(rawEmail).trim().replace(/^[<(\["']+|[>)\]"']+$/g, '').trim();
  const original = sanitizeText(stripped, 254);

  if (!original) {
    return {
      rawEmail: String(rawEmail),
      normalizedEmail: '',
      localPart: '',
      domainPart: '',
      isValid: false,
      error: 'EMPTY_EMAIL'
    };
  }

  // Basic RFC 5322 validation regex
  const emailRegex = /^([a-zA-Z0-9_\.\-\+]+)@([a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+)$/;
  const match = original.match(emailRegex);

  if (!match) {
    return {
      rawEmail: String(rawEmail),
      normalizedEmail: '',
      localPart: '',
      domainPart: '',
      isValid: false,
      error: 'INVALID_EMAIL_SYNTAX'
    };
  }

  const localPart = match[1];
  const domainPart = match[2].toLowerCase();
  const normalizedEmail = `${localPart}@${domainPart}`;

  return {
    rawEmail: String(rawEmail),
    normalizedEmail,
    localPart,
    domainPart,
    isValid: true
  };
}

// ==========================================
// 5. Business Name Normalization
// ==========================================

export function detectScript(text: string): 'LATIN' | 'BENGALI' | 'ARABIC' | 'MIXED' | 'OTHER' {
  const hasBengali = /[\u0980-\u09FF]/.test(text);
  const hasArabic = /[\u0600-\u06FF\u0750-\u077F]/.test(text);
  const hasLatin = /[a-zA-Z]/.test(text);

  const scripts = [hasBengali, hasArabic, hasLatin].filter(Boolean).length;
  if (scripts > 1) return 'MIXED';
  if (hasBengali) return 'BENGALI';
  if (hasArabic) return 'ARABIC';
  if (hasLatin) return 'LATIN';
  return 'OTHER';
}

export function normalizeBusinessName(rawName?: string | null): NormalizedBusinessNameComponents {
  const original = sanitizeText(rawName, 300);

  if (!original) {
    return {
      displayName: 'Unknown Business',
      normalizedName: 'unknown business',
      comparisonName: 'unknown business',
      detectedScript: 'LATIN'
    };
  }

  // 1. Clean display name: trim, normalize Unicode, remove boilerplate badges
  let displayName = original
    .replace(/\s*·\s*Sponsored.*$/i, '')
    .replace(/\s*Sponsored.*$/i, '')
    .replace(/\s*\(official\)$/i, '')
    .replace(/\s*\(verified\)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Normalized name: lowercase, NFKC normalization
  const normalizedName = displayName.normalize('NFKC').toLowerCase();

  // 3. Comparison key: strip common legal entity suffixes
  let comp = normalizedName;
  let matchedSuffix: string | undefined;

  // Sort suffixes by length descending so longer/dotted versions match first
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

  // Strip residual punctuation for comparison key
  const comparisonName = comp
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  const detectedScript = detectScript(displayName);

  return {
    displayName,
    normalizedName,
    comparisonName: comparisonName || normalizedName,
    legalSuffix: matchedSuffix,
    detectedScript
  };
}

// ==========================================
// 6. Address Normalization
// ==========================================

export function normalizeAddress(rawAddress?: string | null, countryHint?: string): NormalizedAddressComponents {
  const original = sanitizeText(rawAddress, 500);

  if (!original) {
    return {
      displayAddress: '',
      normalizedAddress: ''
    };
  }

  // Canonicalize whitespace and line breaks
  const normalizedAddress = original.replace(/\s+/g, ' ').trim();

  return {
    displayAddress: original,
    normalizedAddress,
    countryCode: countryHint?.toUpperCase()
  };
}

// ==========================================
// 7. Category Normalization
// ==========================================

export function normalizeCategory(rawCategory?: string | null): NormalizedCategoryComponents {
  const original = sanitizeText(rawCategory, 150);

  if (!original) {
    return {
      sourceCategory: '',
      normalizedCategory: 'Uncategorized',
      categoryConfidence: 'UNKNOWN'
    };
  }

  const normalized = original.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();

  return {
    sourceCategory: original,
    normalizedCategory: normalized,
    categoryConfidence: 'MODERATE'
  };
}

// ==========================================
// 8. Location Normalization
// ==========================================

export function normalizeLocation(rawLocation?: string | null, countryCode?: string): NormalizedLocationComponents {
  const original = sanitizeText(rawLocation, 200);

  if (!original) {
    return {
      sourceLocation: '',
      normalizedLocation: '',
      countryCode: countryCode?.toUpperCase()
    };
  }

  const normalized = original.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();

  return {
    sourceLocation: original,
    normalizedLocation: normalized,
    countryCode: countryCode?.toUpperCase()
  };
}

// ==========================================
// 9. Source Identifier Normalization
// ==========================================

export function normalizeSourceIdentifier(
  sourceType: SourceType,
  rawId: string,
  recordType: SourceRecordType,
  context: AcquisitionContext,
  provenance: ProvenanceType,
  policy: PolicyStatus,
  derivedFrom?: SourceContribution[]
): SourceIdentifier {
  const original = sanitizeText(rawId, 255);
  return {
    sourceType,
    sourceRecordId: original,
    sourceRecordType: recordType,
    sourceContext: context,
    originalValue: original,
    normalizedValue: original.toLowerCase(),
    provenance,
    policyStatus: policy,
    derivedFrom
  };
}
