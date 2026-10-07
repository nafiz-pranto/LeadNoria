/**
 * LeadNoria — Export-Safe Lead Projection & Research Workspace
 * Part 8: Lead Workspace Analytics
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * - Strictly aggregate scalar metrics only.
 * - ZERO candidate/lead payloads, business names, URLs, phones, emails, or Google IDs.
 */

import type { ExportSafeLead, LeadWorkspaceAnalytics } from './leadTypes.ts';

export interface LeadAnalyticsInput {
  readonly researchCandidatesCount: number;
  readonly qualifiedCandidatesCount: number;
  readonly blockedGoogleCount: number;
  readonly independentSourceCount: number;
  readonly leads: readonly ExportSafeLead[];
  readonly conflictCount?: number;
}

/**
 * Computes safe aggregate analytics for the Lead Workspace.
 */
export function computeLeadWorkspaceAnalytics(
  input: LeadAnalyticsInput
): LeadWorkspaceAnalytics {
  let exportEligibleCount = 0;
  let exportBlockedCount = 0;
  let reviewedCount = 0;

  for (const lead of input.leads) {
    if (lead.exportEligibility === 'ELIGIBLE') {
      exportEligibleCount++;
    } else {
      exportBlockedCount++;
    }

    if (lead.reviewOutcome?.reviewState && lead.reviewOutcome.reviewState !== 'UNREVIEWED') {
      reviewedCount++;
    }
  }

  const analytics: LeadWorkspaceAnalytics = Object.freeze({
    researchCandidatesCount: input.researchCandidatesCount,
    qualifiedCandidatesCount: input.qualifiedCandidatesCount,
    blockedGoogleCount: input.blockedGoogleCount,
    independentSourceCount: input.independentSourceCount,
    exportEligibleCount,
    exportBlockedCount,
    conflictCount: input.conflictCount || 0,
    reviewedCount,
    generatedAt: new Date().toISOString()
  });

  // Defensive validation asserting only scalar numbers
  for (const [key, val] of Object.entries(analytics)) {
    if (key !== 'generatedAt') {
      if (typeof val !== 'number') {
        throw new Error(`CRITICAL VIOLATION: Metric "${key}" in LeadWorkspaceAnalytics must be a number`);
      }
    }
  }

  return analytics;
}
