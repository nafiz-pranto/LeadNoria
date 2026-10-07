/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Search Engine over Persisted Safe Leads
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Operates solely over safe allowlisted fields.
 * 2. Absolutely zero index or search on Google Maps restricted data.
 * 3. Deterministic token matching without ReDoS or regex injection.
 */

import type { PersistedLeadRecord } from './workspaceTypes.ts';

/**
 * Normalizes text for search tokens: lowercases, strips special regex chars, trims.
 */
export function normalizeSearchTerm(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s@._-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts searchable text corpus from a PersistedLeadRecord.
 */
export function extractLeadSearchCorpus(lead: PersistedLeadRecord): string {
  const parts: string[] = [
    lead.leadId,
    lead.businessIdentity.businessName,
    lead.businessIdentity.domain,
    lead.businessIdentity.canonicalUrl,
    lead.lifecycle.state,
    lead.userMetadata.priority,
    lead.userMetadata.notes,
    ...lead.userMetadata.tags,
    ...lead.publicContacts.publicEmails.map(e => e.email),
    ...lead.publicContacts.publicPhones.map(p => p.phone),
    ...lead.publicContacts.publicPhones.map(p => p.rawPhone),
    ...lead.publicPerson.leadershipPeople.map(p => p.fullName),
    ...lead.publicPerson.leadershipPeople.map(p => p.jobTitle)
  ];

  return normalizeSearchTerm(parts.filter(Boolean).join(' '));
}

/**
 * Searches a list of PersistedLeadRecords matching a user search query.
 * Supports:
 * - Free text multi-word AND matching
 * - Prefix search
 * - Specific prefix filters: "tag:vip", "status:active", "priority:high"
 */
export function searchPersistedLeads(
  leads: readonly PersistedLeadRecord[],
  query: string
): PersistedLeadRecord[] {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return [...leads];
  }

  const rawTokens = query.trim().split(/\s+/);
  const tagFilters: string[] = [];
  const statusFilters: string[] = [];
  const priorityFilters: string[] = [];
  const textTokens: string[] = [];

  for (const token of rawTokens) {
    const lower = token.toLowerCase();
    if (lower.startsWith('tag:')) {
      const val = lower.slice(4).trim();
      if (val) tagFilters.push(val);
    } else if (lower.startsWith('status:') || lower.startsWith('state:')) {
      const val = lower.split(':')[1].trim().toUpperCase();
      if (val) statusFilters.push(val);
    } else if (lower.startsWith('priority:')) {
      const val = lower.slice(9).trim().toUpperCase();
      if (val) priorityFilters.push(val);
    } else {
      const clean = normalizeSearchTerm(token);
      if (clean) textTokens.push(clean);
    }
  }

  return leads.filter(lead => {
    // 1. Tag filters
    for (const tag of tagFilters) {
      if (!lead.userMetadata.tags.some(t => t.includes(tag))) {
        return false;
      }
    }

    // 2. Status filters
    for (const st of statusFilters) {
      if (lead.lifecycle.state !== st) {
        return false;
      }
    }

    // 3. Priority filters
    for (const pr of priorityFilters) {
      if (lead.userMetadata.priority !== pr) {
        return false;
      }
    }

    // 4. Free text token matching
    if (textTokens.length > 0) {
      const corpus = extractLeadSearchCorpus(lead);
      for (const token of textTokens) {
        if (!corpus.includes(token)) {
          return false;
        }
      }
    }

    return true;
  });
}
