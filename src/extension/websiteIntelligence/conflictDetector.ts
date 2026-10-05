/**
 * Cross-Page Conflict Detector (Phase 21)
 *
 * Detects discrepancies across multiple pages of a crawled website
 * (e.g. different phone numbers, addresses, emails, or business names).
 *
 * NON-NEGOTIABLE SAFETY:
 * - NEVER silently overwrites a conflicting fact.
 * - Records all observed values, source URLs, and timestamps.
 * - Defers final merge / resolution downstream.
 */

import type { ContactConflict, ConflictType } from './types.ts';
import type { BusinessPhoneFact, BusinessEmailFact, BusinessLocationFact } from '../enrichment/contactTypes.ts';

/**
 * Detects conflicts among extracted business phone numbers across pages.
 */
export function detectPhoneConflicts(phones: BusinessPhoneFact[]): ContactConflict[] {
  const conflicts: ContactConflict[] = [];
  if (phones.length < 2) return conflicts;

  // Filter valid phones with normalized numbers
  const validPhones = phones.filter(p => p.normalizedValue && p.status === 'FOUND');
  if (validPhones.length < 2) return conflicts;

  // Group by distinct digits / e164
  const distinctNumbers = new Map<string, { value: string; sourceUrl: string; observedAt: string }>();

  for (const p of validPhones) {
    const key = p.e164Format || p.normalizedValue.replace(/\D/g, '');
    if (!distinctNumbers.has(key)) {
      const sourceUrl = p.evidence[0]?.pageUrl || 'unknown';
      const observedAt = p.evidence[0]?.observedAt || new Date().toISOString();
      distinctNumbers.set(key, { value: p.normalizedValue, sourceUrl, observedAt });
    }
  }

  // If there are multiple distinct phone numbers across pages, flag conflict
  if (distinctNumbers.size >= 2) {
    const values = Array.from(distinctNumbers.values());
    conflicts.push({
      conflictType: 'PHONE_CONFLICT',
      field: 'phone',
      values,
      description: `Observed ${values.length} distinct phone numbers across website pages: ${values.map(v => v.value).join(' vs ')}`
    });
  }

  return conflicts;
}

/**
 * Detects conflicts among extracted business physical addresses across pages.
 */
export function detectAddressConflicts(locations: BusinessLocationFact[]): ContactConflict[] {
  const conflicts: ContactConflict[] = [];
  if (locations.length < 2) return conflicts;

  const validLocations = locations.filter(l => l.normalizedAddress && l.status === 'FOUND');
  if (validLocations.length < 2) return conflicts;

  const distinctAddresses = new Map<string, { value: string; sourceUrl: string; observedAt: string }>();

  for (const l of validLocations) {
    const key = l.normalizedAddress.toLowerCase().replace(/[^\w]/g, '');
    if (!distinctAddresses.has(key)) {
      const sourceUrl = l.evidence[0]?.pageUrl || 'unknown';
      const observedAt = l.evidence[0]?.observedAt || new Date().toISOString();
      distinctAddresses.set(key, { value: l.normalizedAddress, sourceUrl, observedAt });
    }
  }

  if (distinctAddresses.size >= 2) {
    const values = Array.from(distinctAddresses.values());
    conflicts.push({
      conflictType: 'ADDRESS_CONFLICT',
      field: 'address',
      values,
      description: `Observed ${values.length} distinct physical addresses across website pages`
    });
  }

  return conflicts;
}

/**
 * Detects conflicts among extracted business emails across pages.
 */
export function detectEmailConflicts(emails: BusinessEmailFact[]): ContactConflict[] {
  const conflicts: ContactConflict[] = [];
  if (emails.length < 2) return conflicts;

  const validEmails = emails.filter(e => e.normalizedEmail && e.status === 'FOUND');
  if (validEmails.length < 2) return conflicts;

  // If emails belong to completely different domains or distinct departments, track as multiple observations
  const distinctEmails = new Map<string, { value: string; sourceUrl: string; observedAt: string }>();

  for (const e of validEmails) {
    const key = e.normalizedEmail.toLowerCase();
    if (!distinctEmails.has(key)) {
      const sourceUrl = e.evidence[0]?.pageUrl || 'unknown';
      const observedAt = e.evidence[0]?.observedAt || new Date().toISOString();
      distinctEmails.set(key, { value: e.normalizedEmail, sourceUrl, observedAt });
    }
  }

  // If there are different email domains (e.g. company.com vs external.com), flag conflict
  const emailDomains = new Set(validEmails.map(e => e.domainPart.toLowerCase()));
  if (emailDomains.size >= 2) {
    const values = Array.from(distinctEmails.values());
    conflicts.push({
      conflictType: 'EMAIL_CONFLICT',
      field: 'email',
      values,
      description: `Observed distinct email addresses on different domains: ${Array.from(emailDomains).join(', ')}`
    });
  }

  return conflicts;
}

/**
 * Consolidates all cross-page conflicts.
 */
export function detectAllConflicts(
  phones: BusinessPhoneFact[],
  locations: BusinessLocationFact[],
  emails: BusinessEmailFact[]
): ContactConflict[] {
  return [
    ...detectPhoneConflicts(phones),
    ...detectAddressConflicts(locations),
    ...detectEmailConflicts(emails)
  ];
}
