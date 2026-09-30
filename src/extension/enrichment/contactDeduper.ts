/**
 * Contact Fact Deduplicator & Aggregator (Phase 11)
 *
 * Implements deterministic identity-based deduplication across pages,
 * merges field-level evidence references, prevents evidence inflation,
 * preserves branch/location distinctions, and enforces stable lexicographical sorting.
 */

import type {
  BusinessPhoneFact,
  BusinessEmailFact,
  BusinessLocationFact,
  DigitalPresenceFact,
  ContactFormFact,
  BusinessNameFact
} from './contactTypes.ts';
import { deduplicateEvidence, assessCorroboration } from './contactEvidence.ts';

/**
 * Deduplicates business phone facts by normalized phone identity (e164Format or normalizedValue).
 * Distinct branch phone numbers remain separate.
 */
export function deduplicatePhones(phones: BusinessPhoneFact[]): BusinessPhoneFact[] {
  const map = new Map<string, BusinessPhoneFact>();

  for (const p of phones) {
    const key = (p.e164Format || p.normalizedValue || p.rawValue).replace(/[^0-9]/g, '');
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...p,
        evidence: [...p.evidence],
        sourceContributions: [...p.sourceContributions]
      });
    } else {
      // Merge evidence and promote corroboration
      existing.evidence = deduplicateEvidence([...existing.evidence, ...p.evidence]);
      if (existing.status === 'AMBIGUOUS' && p.status === 'FOUND') {
        existing.status = 'FOUND';
        existing.e164Format = p.e164Format || existing.e164Format;
        existing.nationalFormat = p.nationalFormat || existing.nationalFormat;
      }
      if (!existing.extension && p.extension) {
        existing.extension = p.extension;
      }
      if (!existing.label && p.label) {
        existing.label = p.label;
      }
    }
  }

  // Update corroboration and sort deterministically
  const results = Array.from(map.values()).map(p => {
    p.evidence = deduplicateEvidence(p.evidence);
    const corrStrength = assessCorroboration(p.evidence);
    for (const ev of p.evidence) {
      if (corrStrength === 'CORROBORATED_PUBLIC_OBSERVATION' && ev.evidenceStrength === 'DIRECT_PUBLIC_OBSERVATION') {
        ev.evidenceStrength = 'CORROBORATED_PUBLIC_OBSERVATION';
      }
    }
    return p;
  });

  return results.sort((a, b) => (a.normalizedValue || a.rawValue).localeCompare(b.normalizedValue || b.rawValue));
}

/**
 * Deduplicates business email facts by canonical normalized email.
 */
export function deduplicateEmails(emails: BusinessEmailFact[]): BusinessEmailFact[] {
  const map = new Map<string, BusinessEmailFact>();

  for (const e of emails) {
    const key = e.normalizedEmail.toLowerCase().trim();
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...e,
        evidence: [...e.evidence],
        sourceContributions: [...e.sourceContributions]
      });
    } else {
      existing.evidence = deduplicateEvidence([...existing.evidence, ...e.evidence]);
      if (existing.emailType === 'UNKNOWN' && e.emailType !== 'UNKNOWN') {
        existing.emailType = e.emailType;
      }
    }
  }

  const results = Array.from(map.values()).map(e => {
    e.evidence = deduplicateEvidence(e.evidence);
    const corrStrength = assessCorroboration(e.evidence);
    for (const ev of e.evidence) {
      if (corrStrength === 'CORROBORATED_PUBLIC_OBSERVATION' && ev.evidenceStrength === 'DIRECT_PUBLIC_OBSERVATION') {
        ev.evidenceStrength = 'CORROBORATED_PUBLIC_OBSERVATION';
      }
    }
    return e;
  });

  return results.sort((a, b) => a.normalizedEmail.localeCompare(b.normalizedEmail));
}

/**
 * Deduplicates digital presence facts by normalized social profile URL.
 */
export function deduplicateSocialProfiles(profiles: DigitalPresenceFact[]): DigitalPresenceFact[] {
  const map = new Map<string, DigitalPresenceFact>();

  for (const p of profiles) {
    const key = p.normalizedUrl.toLowerCase().trim().replace(/\/$/, '');
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...p,
        evidence: [...p.evidence],
        sourceContributions: [...p.sourceContributions]
      });
    } else {
      existing.evidence = deduplicateEvidence([...existing.evidence, ...p.evidence]);
    }
  }

  const results = Array.from(map.values()).map(p => {
    p.evidence = deduplicateEvidence(p.evidence);
    const corrStrength = assessCorroboration(p.evidence);
    for (const ev of p.evidence) {
      if (corrStrength === 'CORROBORATED_PUBLIC_OBSERVATION' && ev.evidenceStrength === 'DIRECT_PUBLIC_OBSERVATION') {
        ev.evidenceStrength = 'CORROBORATED_PUBLIC_OBSERVATION';
      }
    }
    return p;
  });

  return results.sort((a, b) => {
    const platCmp = a.platform.localeCompare(b.platform);
    if (platCmp !== 0) return platCmp;
    return a.normalizedUrl.localeCompare(b.normalizedUrl);
  });
}

/**
 * Deduplicates physical business locations while preserving distinct branches and offices.
 * Addresses with distinct street names, cities, or postal codes remain separate records.
 */
export function deduplicateLocations(locations: BusinessLocationFact[]): BusinessLocationFact[] {
  const map = new Map<string, BusinessLocationFact>();

  for (const loc of locations) {
    // Generate a canonical comparison key for the location
    const normKey = loc.normalizedAddress
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!normKey) continue;

    const existing = map.get(normKey);
    if (!existing) {
      map.set(normKey, {
        ...loc,
        evidence: [...loc.evidence],
        sourceContributions: [...loc.sourceContributions]
      });
    } else {
      existing.evidence = deduplicateEvidence([...existing.evidence, ...loc.evidence]);
      if (existing.status === 'PARTIAL' && loc.status === 'FOUND') {
        existing.status = 'FOUND';
        existing.postalCode = loc.postalCode || existing.postalCode;
        existing.city = loc.city || existing.city;
        existing.streetAddress = loc.streetAddress || existing.streetAddress;
      }
      if (!existing.phone && loc.phone) {
        existing.phone = loc.phone;
      }
      if (!existing.label && loc.label) {
        existing.label = loc.label;
      }
    }
  }

  const results = Array.from(map.values()).map(loc => {
    loc.evidence = deduplicateEvidence(loc.evidence);
    return loc;
  });

  return results.sort((a, b) => a.normalizedAddress.localeCompare(b.normalizedAddress));
}

/**
 * Deduplicates contact forms by pageUrl and action.
 */
export function deduplicateContactForms(forms: ContactFormFact[]): ContactFormFact[] {
  const map = new Map<string, ContactFormFact>();

  for (const f of forms) {
    const key = `${f.pageUrl.toLowerCase()}_${(f.formAction || '').toLowerCase()}_${(f.formIdOrName || '').toLowerCase()}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...f,
        evidence: [...f.evidence],
        sourceContributions: [...f.sourceContributions]
      });
    } else {
      existing.evidence = deduplicateEvidence([...existing.evidence, ...f.evidence]);
      existing.hasEmailField = existing.hasEmailField || f.hasEmailField;
      existing.hasPhoneField = existing.hasPhoneField || f.hasPhoneField;
      existing.hasMessageField = existing.hasMessageField || f.hasMessageField;
    }
  }

  const results = Array.from(map.values()).map(f => {
    f.evidence = deduplicateEvidence(f.evidence);
    return f;
  });

  return results.sort((a, b) => a.pageUrl.localeCompare(b.pageUrl));
}

/**
 * Selects the authoritative business name fact from website observations.
 * Prioritizes JSON-LD schema over OpenGraph over page title.
 */
export function deduplicateBusinessNames(names: BusinessNameFact[]): BusinessNameFact | undefined {
  if (names.length === 0) return undefined;

  // Group by comparison key
  const map = new Map<string, { fact: BusinessNameFact; score: number }>();

  for (const n of names) {
    let score = 1;
    if (n.evidence.some(e => e.evidenceType === 'STRUCTURED_PAGE_CONTENT')) score = 3;
    else if (n.evidence.some(e => e.evidenceType === 'PAGE_TITLE')) score = 2;

    const existing = map.get(n.comparisonKey);
    if (!existing) {
      map.set(n.comparisonKey, { fact: { ...n, evidence: [...n.evidence] }, score });
    } else {
      existing.fact.evidence = deduplicateEvidence([...existing.fact.evidence, ...n.evidence]);
      if (score > existing.score) {
        existing.score = score;
        existing.fact.rawValue = n.rawValue;
        existing.fact.normalizedName = n.normalizedName;
      }
    }
  }

  const sorted = Array.from(map.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.fact.comparisonKey.localeCompare(b.fact.comparisonKey);
  });

  return sorted[0]?.fact;
}
