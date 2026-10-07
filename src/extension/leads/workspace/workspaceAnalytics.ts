/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Persistent Workspace Analytics
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Strictly aggregate scalar metrics only.
 * 2. ZERO candidate/lead payloads, business names, URLs, phones, emails, or Google IDs.
 */

import type { PersistedLeadRecord, PersistentWorkspaceAnalytics } from './workspaceTypes.ts';

/**
 * Computes safe aggregate analytics for the Persistent Workspace.
 */
export function computeWorkspaceAnalytics(
  leads: readonly PersistedLeadRecord[]
): PersistentWorkspaceAnalytics {
  let activeLeads = 0;
  let archivedLeads = 0;
  let qualifiedLeads = 0;
  let followUpsPending = 0;
  let exportEligibleLeads = 0;
  let exportBlockedLeads = 0;
  const uniqueTags = new Set<string>();

  for (const lead of leads) {
    if (lead.lifecycle.state === 'ARCHIVED') {
      archivedLeads++;
    } else {
      activeLeads++;
    }

    if (lead.lifecycle.state === 'QUALIFIED') {
      qualifiedLeads++;
    }

    if (lead.userMetadata.followUpStatus === 'PENDING') {
      followUpsPending++;
    }

    if (lead.safeProvenance.exportEligibility === 'ELIGIBLE') {
      exportEligibleLeads++;
    } else {
      exportBlockedLeads++;
    }

    for (const tag of lead.userMetadata.tags) {
      uniqueTags.add(tag.toLowerCase());
    }
  }

  const analytics: PersistentWorkspaceAnalytics = Object.freeze({
    totalStoredLeads: leads.length,
    activeLeads,
    archivedLeads,
    qualifiedLeads,
    followUpsPending,
    tagsCount: uniqueTags.size,
    exportEligibleLeads,
    exportBlockedLeads,
    generatedAt: new Date().toISOString()
  });

  // Defensive validation asserting only scalar numbers
  for (const [key, val] of Object.entries(analytics)) {
    if (key !== 'generatedAt') {
      if (typeof val !== 'number') {
        throw new Error(`CRITICAL VIOLATION: Metric "${key}" in PersistentWorkspaceAnalytics must be a number`);
      }
    }
  }

  return analytics;
}
