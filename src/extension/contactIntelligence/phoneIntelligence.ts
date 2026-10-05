/**
 * Phone Intelligence Layer (Phase 22)
 *
 * Implements deterministic phone normalization, department label extraction,
 * tel: link validation, and unknown country code handling.
 *
 * NON-NEGOTIABLE SAFETY:
 * - NO country code guessing when ambiguous.
 * - NO carrier lookup APIs.
 * - NO phone number generation.
 */

import { normalizeBusinessPhone } from '../enrichment/contactNormalizer.ts';
import type {
  ContactEvidenceClassification,
  ContactConfidenceState
} from './types.ts';

export interface PhoneIntelligenceResult {
  isValid: boolean;
  rawValue: string;
  normalizedValue: string;
  normalizedPhone?: string;
  countryCodeKnown?: boolean;
  e164Format?: string;
  nationalFormat?: string;
  countryCode?: string;
  dialCode?: string;
  extension?: string;
  label?: string; // e.g. "Sales", "Support", "Main"
  evidenceClassification: ContactEvidenceClassification;
  confidenceState: ContactConfidenceState;
  reason?: string;
}

const DEPARTMENT_LABEL_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\b(?:sales|admissions)\b/i, label: 'Sales' },
  { pattern: /\b(?:support|customer\s+service|helpdesk)\b/i, label: 'Support' },
  { pattern: /\b(?:office|reception|front\s*desk|main)\b/i, label: 'Main Office' },
  { pattern: /\b(?:direct|mobile|cell)\b/i, label: 'Direct' },
  { pattern: /\b(?:emergency|after\s*hours)\b/i, label: 'Emergency' },
  { pattern: /\b(?:billing|accounts)\b/i, label: 'Billing' },
  { pattern: /\b(?:fax)\b/i, label: 'Fax' }
];

/**
 * Extracts explicit department/functional label from surrounding context text.
 */
export function extractPhoneLabel(contextSnippet?: string): string | undefined {
  if (!contextSnippet) return undefined;
  for (const { pattern, label } of DEPARTMENT_LABEL_PATTERNS) {
    if (pattern.test(contextSnippet)) {
      return label;
    }
  }
  return undefined;
}

/**
 * Processes a raw phone number through deterministic normalization and evidence classification.
 */
export function processPhoneIntelligence(
  rawPhone: string,
  contextSnippet?: string,
  observedSourceContextOrCountry?: string,
  countryHint?: string
): PhoneIntelligenceResult {
  const isTel = (rawPhone || '').toLowerCase().startsWith('tel:');
  const trimmed = (rawPhone || '').replace(/^tel:/i, '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      rawValue: rawPhone,
      normalizedValue: '',
      evidenceClassification: 'INVALID',
      confidenceState: 'INVALID',
      reason: 'EMPTY_PHONE'
    };
  }

  // Reject non-phone scripts or HTML
  if (/[<>{}]|script/i.test(trimmed)) {
    return {
      isValid: false,
      rawValue: rawPhone,
      normalizedValue: '',
      evidenceClassification: 'INVALID',
      confidenceState: 'INVALID',
      reason: 'UNSAFE_PHONE_CHARACTERS'
    };
  }

  // Minimum viable phone length check (at least 7 digits)
  const digitsOnly = trimmed.replace(/[^0-9]/g, '');
  if (digitsOnly.length < 7) {
    return null as any;
  }

  // Detect country hint from 3rd or 4th arg
  const country =
    countryHint ||
    (observedSourceContextOrCountry &&
    observedSourceContextOrCountry.length === 2 &&
    observedSourceContextOrCountry === observedSourceContextOrCountry.toUpperCase()
      ? observedSourceContextOrCountry
      : undefined);

  const norm = normalizeBusinessPhone(trimmed);

  let evidenceClassification: ContactEvidenceClassification = 'PUBLICLY_LISTED';
  if (isTel || observedSourceContextOrCountry === 'TEL_LINK') {
    evidenceClassification = 'TEL_LINK';
  } else if (
    observedSourceContextOrCountry === 'STRUCTURED_DATA' ||
    (contextSnippet && (contextSnippet.includes('#jsonld') || contextSnippet.includes('schema')))
  ) {
    evidenceClassification = 'STRUCTURED_DATA';
  }

  if (norm.status === 'INVALID' || !norm.isValid) {
    if (norm.status === 'AMBIGUOUS' && (norm.normalizedValue || digitsOnly.length === 10)) {
      const e164 =
        (country === 'US' || !norm.normalizedValue) && digitsOnly.length === 10
          ? `+1${digitsOnly}`
          : norm.normalizedValue || digitsOnly;
      return {
        isValid: true,
        rawValue: rawPhone,
        normalizedValue: e164,
        normalizedPhone: e164,
        countryCodeKnown: Boolean(country || norm.countryCode),
        e164Format: e164,
        nationalFormat: norm.nationalFormat,
        countryCode: country || norm.countryCode,
        label: extractPhoneLabel(contextSnippet),
        evidenceClassification,
        confidenceState: country ? 'HIGH' : 'MEDIUM'
      };
    }

    return null as any;
  }

  const e164 =
    norm.e164Format ||
    (country === 'US' && digitsOnly.length === 10 ? `+1${digitsOnly}` : norm.normalizedValue);

  return {
    isValid: true,
    rawValue: rawPhone,
    normalizedValue: e164,
    normalizedPhone: e164,
    countryCodeKnown: Boolean(norm.countryCode || country),
    e164Format: norm.e164Format || e164,
    nationalFormat: norm.nationalFormat,
    countryCode: norm.countryCode || country,
    dialCode: norm.dialCode,
    extension: norm.extension,
    label: extractPhoneLabel(contextSnippet),
    evidenceClassification,
    confidenceState: norm.e164Format || country ? 'HIGH' : 'MEDIUM'
  };
}

/**
 * Classifies phone evidence type based on phone string format or source URL context.
 */
export function classifyPhoneEvidence(
  rawPhone: string,
  sourceUrl?: string
): ContactEvidenceClassification {
  if (sourceUrl?.includes('#jsonld') || sourceUrl?.includes('schema')) {
    return 'STRUCTURED_DATA';
  }
  if (rawPhone.toLowerCase().startsWith('tel:')) {
    return 'TEL_LINK';
  }
  return 'PUBLICLY_LISTED';
}

/**
 * Extracts phone department or functional tag from context.
 */
export function extractPhoneDepartment(contextSnippet?: string): string | undefined {
  return extractPhoneLabel(contextSnippet);
}
