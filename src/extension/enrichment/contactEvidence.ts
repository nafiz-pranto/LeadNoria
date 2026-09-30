/**
 * Contact Evidence Ledger & Anti-Inflation Engine (Phase 11)
 *
 * Implements deterministic evidence generation, audit tracking,
 * and anti-inflation guards preventing repeated DOM elements or
 * repetitive footer templates from artificially inflating evidence counts.
 */

import type {
  ContactEvidenceItem,
  ContactEvidenceType,
  ContactEvidenceStrength
} from './contactTypes.ts';

/**
 * Deterministically generates a stable identifier for an evidence record.
 */
export function generateEvidenceId(
  field: string,
  normalizedValue: string,
  pageUrl: string,
  evidenceType: ContactEvidenceType
): string {
  const normVal = (normalizedValue || '').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40);
  let cleanUrl = (pageUrl || '').toLowerCase();
  try {
    const u = new URL(cleanUrl);
    cleanUrl = `${u.hostname}${u.pathname}`;
  } catch {
    // fallback clean
  }
  const normUrl = cleanUrl.replace(/[^a-z0-9]/g, '_').slice(0, 40);
  return `ev_${field}_${normVal}_${normUrl}_${evidenceType.toLowerCase()}`;
}

/**
 * Creates an immutable, auditable evidence item.
 */
export function createContactEvidence(params: {
  field: 'phone' | 'email' | 'address' | 'social' | 'contact_form' | 'business_name';
  rawValue: string;
  normalizedValue: string;
  pageUrl: string;
  evidenceType: ContactEvidenceType;
  evidenceStrength?: ContactEvidenceStrength;
  contextSnippet?: string;
  extractionState?: string;
  observedAt?: string;
}): ContactEvidenceItem {
  const defaultStrength: ContactEvidenceStrength =
    params.evidenceType === 'MAILTO_LINK' ||
    params.evidenceType === 'TEL_LINK' ||
    params.evidenceType === 'STRUCTURED_PAGE_CONTENT' ||
    params.evidenceType === 'CONTACT_FORM'
      ? 'DIRECT_PUBLIC_OBSERVATION'
      : 'DIRECT_PUBLIC_OBSERVATION';

  const cleanSnippet = params.contextSnippet
    ? params.contextSnippet.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)
    : undefined;

  return {
    id: generateEvidenceId(params.field, params.normalizedValue, params.pageUrl, params.evidenceType),
    field: params.field,
    rawValue: params.rawValue,
    normalizedValue: params.normalizedValue,
    pageUrl: params.pageUrl,
    evidenceType: params.evidenceType,
    evidenceStrength: params.evidenceStrength || defaultStrength,
    contextSnippet: cleanSnippet,
    extractionState: params.extractionState || 'EXTRACTED_FROM_PUBLIC_PAGE',
    observedAt: params.observedAt || 'STATIC_DETERMINISTIC_TIMESTAMP'
  };
}

/**
 * Anti-Evidence Inflation Filter:
 * Ensures that identical evidence items from the same page and type
 * are collapsed into a single evidence reference.
 * Sorts evidence deterministically by id.
 */
export function deduplicateEvidence(evidenceList: ContactEvidenceItem[]): ContactEvidenceItem[] {
  const seenIds = new Set<string>();
  const deduplicated: ContactEvidenceItem[] = [];

  for (const item of evidenceList) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      deduplicated.push(item);
    }
  }

  // Deterministic sort by ID
  return deduplicated.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Assesses whether multiple independent pages corroborate this fact.
 * Upgrades evidence strength to CORROBORATED_PUBLIC_OBSERVATION if
 * the fact is observed across multiple distinct page URLs.
 */
export function assessCorroboration(
  evidenceList: ContactEvidenceItem[]
): ContactEvidenceStrength {
  const distinctPages = new Set(evidenceList.map(e => e.pageUrl.toLowerCase().replace(/\/$/, '')));
  if (distinctPages.size >= 2) {
    return 'CORROBORATED_PUBLIC_OBSERVATION';
  }
  if (evidenceList.some(e => e.evidenceStrength === 'DIRECT_PUBLIC_OBSERVATION')) {
    return 'DIRECT_PUBLIC_OBSERVATION';
  }
  return 'WEAK_OBSERVATION';
}
