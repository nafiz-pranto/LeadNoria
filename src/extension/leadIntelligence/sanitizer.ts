/**
 * LeadNoria — Phase 24: Unified Lead Intelligence & Cross-Source Record Assembly
 * Security Controls & Payload Sanitization
 *
 * Invariants:
 * - Strict defense against prototype pollution (__proto__, constructor, prototype)
 * - Safe URL enforcement (permits http: and https: only; strictly rejects javascript:, data:, file:)
 * - Bounded memory enforcement for strings and collection sizes
 * - Forged restriction prevention: security/restriction flags can only escalate to restricted, never de-escalate
 */

import { isValidExternalUrl } from '../ui/security.ts';
import type { ProvenanceType, PolicyRestrictionBasis } from '../extraction/types.ts';

const BANNED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export const MAX_COLLECTION_SIZE = 100;
export const MAX_STRING_LENGTH = 2000;

/**
 * Deeply sanitizes and defensively clones any object, completely neutralizing prototype pollution attempts.
 */
export function sanitizeObject<T>(input: T, depth = 0): T {
  if (depth > 12) {
    return null as any;
  }
  if (input === null || typeof input !== 'object') {
    if (typeof input === 'string') {
      return sanitizeString(input) as any;
    }
    return input;
  }

  if (Array.isArray(input)) {
    const safeArr: any[] = [];
    const maxItems = Math.min(input.length, MAX_COLLECTION_SIZE);
    for (let i = 0; i < maxItems; i++) {
      safeArr.push(sanitizeObject(input[i], depth + 1));
    }
    return safeArr as any;
  }

  const cleanObj: Record<string, any> = Object.create(null);
  for (const [key, val] of Object.entries(input)) {
    if (BANNED_KEYS.has(key)) {
      continue;
    }
    cleanObj[key] = sanitizeObject(val, depth + 1);
  }

  return cleanObj as T;
}

/**
 * Truncates and normalizes string inputs to prevent unbounded memory consumption or injection.
 */
export function sanitizeString(val: string | null | undefined, maxLength = MAX_STRING_LENGTH): string {
  if (val == null) return '';
  const str = String(val).normalize('NFC').trim();
  if (str.length > maxLength) {
    return str.slice(0, maxLength);
  }
  return str;
}

/**
 * Validates and sanitizes a URL, returning empty string if unsafe or invalid protocol.
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!isValidExternalUrl(trimmed)) {
    return '';
  }
  return trimmed;
}

/**
 * Normalizes strings for case-insensitive, punctuation-neutral identity comparison.
 */
export function normalizeForIdentityComparison(str?: string): string {
  return (str || '')
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes phone numbers to digits only for cross-source comparison.
 */
export function normalizePhoneForComparison(phone?: string): string {
  let digits = (phone || '').replace(/[^0-9]/g, '');
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  if (digits.length > 7 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Evaluates whether any upstream restriction forbids export or persistence.
 * Prevents forged/laundered restriction states.
 */
export function evaluateRestrictionFirewall(inputs: {
  isExplicitlyRestricted?: boolean;
  hasGoogleConsumerWeb?: boolean;
  restrictionBasis?: PolicyRestrictionBasis;
  provenances?: ProvenanceType[];
}): {
  isRestricted: boolean;
  persistenceEligible: boolean;
  exportEligible: boolean;
  restrictionBasis: PolicyRestrictionBasis;
  upstreamRestrictions: string[];
} {
  const isGoogleRestricted =
    inputs.isExplicitlyRestricted === true ||
    inputs.hasGoogleConsumerWeb === true ||
    inputs.restrictionBasis === 'GOOGLE_CONSUMER_WEB_RESTRICTED' ||
    (inputs.provenances || []).some(p => p === 'GOOGLE_DERIVED');

  if (isGoogleRestricted) {
    return {
      isRestricted: true,
      persistenceEligible: false,
      exportEligible: false,
      restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
      upstreamRestrictions: [
        'NOT_PERSISTABLE',
        'NOT_EXPORTABLE',
        'GOOGLE_CONSUMER_WEB_RESTRICTED'
      ]
    };
  }

  return {
    isRestricted: false,
    persistenceEligible: true,
    exportEligible: true,
    restrictionBasis: 'NONE',
    upstreamRestrictions: []
  };
}
