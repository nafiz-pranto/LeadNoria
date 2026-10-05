/**
 * Email Intelligence Layer (Phase 22)
 *
 * Implements deterministic email syntax validation, normalization, role vs personal
 * classification, email-to-website domain relationship checking, and deduplication.
 *
 * NON-NEGOTIABLE SAFETY:
 * - NO email guessing.
 * - NO SMTP mailbox probing.
 * - NO mailbox enumeration.
 * - NO third-party email APIs.
 */

import type {
  EmailClassification,
  EmailDomainRelationship,
  ContactEvidenceClassification,
  ContactConfidenceState
} from './types.ts';
import type { ProvenanceType } from '../extraction/types.ts';

const ROLE_PREFIXES = new Set([
  'sales',
  'support',
  'admin',
  'administrator',
  'billing',
  'accounts',
  'accounting',
  'jobs',
  'career',
  'careers',
  'marketing',
  'hr',
  'humanresources',
  'media',
  'press',
  'legal',
  'security',
  'compliance',
  'finance',
  'dev',
  'engineering',
  'operations',
  'ops'
]);

const GENERIC_PREFIXES = new Set([
  'info',
  'hello',
  'hi',
  'contact',
  'contactus',
  'office',
  'mail',
  'help',
  'inquiry',
  'inquiries',
  'enquiry',
  'enquiries',
  'team',
  'general',
  'service',
  'services',
  'reception',
  'frontdesk',
  'desk'
]);

const FORBIDDEN_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.css',
  '.js',
  '.pdf',
  '.zip'
]);

export interface EmailIntelligenceResult {
  isValid: boolean;
  rawValue: string;
  normalizedEmail: string;
  localPart: string;
  domainPart: string;
  classification: EmailClassification;
  domainRelationship: EmailDomainRelationship;
  evidenceClassification: ContactEvidenceClassification;
  confidenceState: ContactConfidenceState;
  provenance: ProvenanceType;
  reason?: string;
}

/**
 * Deterministically normalizes and validates an email string.
 */
export function processEmailIntelligence(
  rawEmail: string,
  sourceUrlOrDomain?: string,
  domainOrContext?: string,
  maybeContext?: string
): EmailIntelligenceResult | null {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return null;
  }

  // Control characters check (\x00-\x1F\x7F) on raw input (newlines, tabs, carriage returns, etc.)
  if (/[\x00-\x1F\x7F]/.test(rawEmail)) {
    return null;
  }

  let targetDomain = domainOrContext;
  let sourceUrl = '';
  let context = maybeContext || 'VISIBLE_TEXT';

  if (sourceUrlOrDomain) {
    if (sourceUrlOrDomain.startsWith('http://') || sourceUrlOrDomain.startsWith('https://')) {
      sourceUrl = sourceUrlOrDomain;
      if (!targetDomain) {
        try {
          targetDomain = new URL(sourceUrlOrDomain).hostname;
        } catch {
          // ignore
        }
      }
    } else {
      targetDomain = sourceUrlOrDomain;
      if (domainOrContext) {
        context = domainOrContext;
      }
    }
  }

  const isMailto = /^mailto:/i.test(rawEmail);
  let trimmed = rawEmail
    .normalize('NFC')
    .replace(/^mailto:/i, '')
    .split('?')[0] // remove mailto query parameters like ?subject=...
    .trim();

  // Strip wrapping RFC angle brackets if present (<user@example.com>)
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  // RFC 5321 length restriction (max 254 chars)
  if (!trimmed || trimmed.length > 254) {
    return null;
  }

  // Reject invalid extensions (image filenames matching email patterns)
  const lower = trimmed.toLowerCase();
  for (const ext of FORBIDDEN_EXTENSIONS) {
    if (lower.endsWith(ext)) {
      return null;
    }
  }

  // Reject non-email scripts or HTML tokens
  if (/[<>{}]|script|javascript/i.test(trimmed)) {
    return null;
  }

  // Parse local-part and domain-part, properly recognizing quoted strings with @ and escaped chars
  let inQuotes = false;
  let escaped = false;
  let separatorIndex = -1;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      if (inQuotes) {
        escaped = true;
      } else {
        // Backslash outside of quotes is invalid
        return null;
      }
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === '@' && !inQuotes) {
      separatorIndex = i;
      break;
    }
  }

  // Must not have unclosed quotes, dangling escape, or missing/invalid separator @
  if (inQuotes || escaped || separatorIndex <= 0 || separatorIndex >= trimmed.length - 1) {
    return null;
  }

  const localPart = trimmed.slice(0, separatorIndex);
  const rawDomainPart = trimmed.slice(separatorIndex + 1);

  // Validate local-part (max 64 characters per RFC 5321)
  if (!localPart || localPart.length > 64) {
    return null;
  }

  if (localPart.startsWith('"')) {
    // Quoted local-part
    if (!localPart.endsWith('"') || localPart.length < 2) {
      return null;
    }
    // Verify inside of quoted-string
    let innerEscaped = false;
    const inner = localPart.slice(1, -1);
    for (let i = 0; i < inner.length; i++) {
      const c = inner[i];
      if (innerEscaped) {
        innerEscaped = false;
      } else if (c === '\\') {
        innerEscaped = true;
      } else if (c === '"') {
        // Unescaped quote inside quoted-string
        return null;
      } else if (/[\x00-\x1F\x7F]/.test(c)) {
        return null;
      }
    }
    if (innerEscaped) {
      return null;
    }
  } else {
    // Unquoted dot-atom local-part
    if (/\s/.test(localPart)) {
      return null;
    }
    if (
      localPart.startsWith('.') ||
      localPart.endsWith('.') ||
      localPart.includes('..') ||
      localPart.includes('@')
    ) {
      return null;
    }
    // atext characters per RFC 5322: alphanumeric + !#$%&'*+-/=?^_`{|}~ and dots
    if (!/^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(localPart)) {
      return null;
    }
  }

  // Validate domain-part (max 255 characters per RFC 1035 / RFC 5321)
  if (!rawDomainPart || rawDomainPart.length > 255) {
    return null;
  }
  // Domain cannot contain @ or whitespace or control characters
  if (rawDomainPart.includes('@') || /\s|[\x00-\x1F\x7F]/.test(rawDomainPart)) {
    return null;
  }
  if (
    rawDomainPart.startsWith('.') ||
    rawDomainPart.endsWith('.') ||
    rawDomainPart.includes('..')
  ) {
    return null;
  }

  const labels = rawDomainPart.split('.');
  if (labels.length < 2) {
    return null;
  }

  for (const label of labels) {
    if (!label || label.length > 63) {
      return null;
    }
    if (label.startsWith('-') || label.endsWith('-')) {
      return null;
    }
    // Label characters: alphanumeric, hyphen, and Unicode letters/numbers for IDN
    // Supports ASCII labels, hyphenated labels, Punycode A-labels (xn--...), and Unicode IDN
    if (!/^[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?$/u.test(label)) {
      return null;
    }
  }

  // TLD validation (last label): minimum 2 chars, cannot be purely numeric
  const tld = labels[labels.length - 1];
  if (tld.length < 2 || /^[0-9]+$/.test(tld)) {
    return null;
  }

  // Lowercase domain part, while PRESERVING local-part case (RFC 5321 compliance)
  const domainPart = rawDomainPart.toLowerCase();
  const normalizedEmail = `${localPart}@${domainPart}`;

  // 1. Classification (Generic vs Role vs Personal)
  const cleanLocal = localPart.toLowerCase().replace(/[^a-z0-9]/g, '');
  let classification: EmailClassification = 'UNKNOWN';

  if (ROLE_PREFIXES.has(cleanLocal) || GENERIC_PREFIXES.has(cleanLocal)) {
    classification = 'ROLE_ACCOUNT';
  } else if (
    /^[a-z]+[._-][a-z]+$/i.test(localPart) || // e.g. john.doe, jane_smith
    /^[a-z]{1,2}[a-z]+$/i.test(localPart)    // e.g. jsmith, jdoe
  ) {
    classification = 'PERSON_NAMED';
  } else {
    classification = 'UNKNOWN';
  }

  // 2. Email-Domain Relationship
  let domainRelationship: EmailDomainRelationship = 'UNKNOWN';
  if (targetDomain) {
    const cleanWebDomain = targetDomain.toLowerCase().replace(/^www\./, '').trim();
    if (cleanWebDomain) {
      if (domainPart === cleanWebDomain) {
        domainRelationship = 'EXACT_DOMAIN_MATCH';
      } else if (domainPart.endsWith(`.${cleanWebDomain}`)) {
        domainRelationship = 'SUBDOMAIN_MATCH';
      } else {
        domainRelationship = 'EXTERNAL_DOMAIN';
      }
    }
  }

  // 3. Evidence classification mapping
  let evidenceClassification: ContactEvidenceClassification = 'PUBLICLY_LISTED';
  if (isMailto || context === 'MAILTO') {
    evidenceClassification = 'MAILTO';
  } else if (sourceUrl.includes('#jsonld') || sourceUrl.includes('schema') || context === 'STRUCTURED_DATA') {
    evidenceClassification = 'STRUCTURED_DATA';
  } else if (context === 'PERSON_ASSOCIATED') {
    evidenceClassification = 'PERSON_ASSOCIATED';
  } else if (domainRelationship === 'EXACT_DOMAIN_MATCH') {
    evidenceClassification = 'DOMAIN_MATCHED';
  }

  const confidenceState: ContactConfidenceState =
    domainRelationship === 'EXACT_DOMAIN_MATCH' || evidenceClassification === 'STRUCTURED_DATA'
      ? 'HIGH'
      : 'MEDIUM';

  return {
    isValid: true,
    rawValue: rawEmail,
    normalizedEmail,
    localPart,
    domainPart,
    classification,
    domainRelationship,
    evidenceClassification,
    confidenceState,
    provenance: 'LEADNORIA_DERIVED'
  };
}

/**
 * Normalizes email address returning null if invalid.
 */
export function normalizeEmail(rawEmail: string): string | null {
  const result = processEmailIntelligence(rawEmail);
  return result?.isValid ? result.normalizedEmail : null;
}

/**
 * Deterministically classifies email as GENERIC_BUSINESS, ROLE_ACCOUNT, PERSON_NAMED, or UNKNOWN.
 */
export function classifyEmailType(email: string): EmailClassification {
  const result = processEmailIntelligence(email);
  return result ? result.classification : 'UNKNOWN';
}

/**
 * Determines whether email domain matches website domain (EXACT, SUBDOMAIN, EXTERNAL).
 */
export function evaluateEmailDomainRelationship(
  email: string,
  targetWebsiteDomain: string
): EmailDomainRelationship {
  const result = processEmailIntelligence(email, targetWebsiteDomain);
  return result ? result.domainRelationship : 'UNKNOWN';
}
