/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Workspace Filtering Engine
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Evaluates strictly persisted safe lead attributes.
 * 2. Complete separation from Google Maps Part 3 acquisition search filters.
 * 3. Default view excludes ARCHIVED leads unless explicitly queried.
 */

import { searchPersistedLeads } from './workspaceSearch.ts';
import type { PersistedLeadRecord, WorkspaceFilterCriteria } from './workspaceTypes.ts';

/**
 * Checks whether a single PersistedLeadRecord matches the given criteria.
 */
export function matchesWorkspaceFilters(
  lead: PersistedLeadRecord,
  filters: WorkspaceFilterCriteria
): boolean {
  // 1. Archive status filter
  const isLeadArchived = lead.lifecycle.state === 'ARCHIVED';
  if (filters.isArchived === true) {
    if (!isLeadArchived) return false;
  } else if (filters.isArchived === false || filters.isArchived === undefined) {
    // Default active view: hide archived leads unless lifecycle filter specifically includes ARCHIVED
    if (isLeadArchived && (!filters.lifecycle || !filters.lifecycle.includes('ARCHIVED'))) {
      return false;
    }
  }

  // 2. Lifecycle state
  if (filters.lifecycle && filters.lifecycle.length > 0) {
    if (!filters.lifecycle.includes(lead.lifecycle.state)) {
      return false;
    }
  }

  // 3. Priority
  if (filters.priority && filters.priority.length > 0) {
    if (!filters.priority.includes(lead.userMetadata.priority)) {
      return false;
    }
  }

  // 4. Tags filter (must contain all specified tags)
  if (filters.tags && filters.tags.length > 0) {
    const leadTags = new Set(lead.userMetadata.tags.map(t => t.toLowerCase()));
    for (const reqTag of filters.tags) {
      if (!leadTags.has(reqTag.toLowerCase())) {
        return false;
      }
    }
  }

  // 5. Website presence
  if (filters.hasWebsite !== undefined) {
    const hasWeb = !!lead.publicWebsite.canonicalUrl && lead.publicWebsite.canonicalUrl.startsWith('http');
    if (hasWeb !== filters.hasWebsite) {
      return false;
    }
  }

  // 6. Email presence
  if (filters.hasEmail !== undefined) {
    const hasEm = lead.publicContacts.publicEmails.length > 0;
    if (hasEm !== filters.hasEmail) {
      return false;
    }
  }

  // 7. Phone presence
  if (filters.hasPhone !== undefined) {
    const hasPh = lead.publicContacts.publicPhones.length > 0;
    if (hasPh !== filters.hasPhone) {
      return false;
    }
  }

  // 8. Leadership person presence
  if (filters.hasLeadershipPerson !== undefined) {
    const hasPer = lead.publicPerson.leadershipPeople.length > 0;
    if (hasPer !== filters.hasLeadershipPerson) {
      return false;
    }
  }

  // 9. Follow-up status
  if (filters.followUpStatus && filters.followUpStatus.length > 0) {
    if (!filters.followUpStatus.includes(lead.userMetadata.followUpStatus)) {
      return false;
    }
  }

  // 10. Qualification status
  if (filters.qualificationStatus && filters.qualificationStatus.length > 0) {
    if (!filters.qualificationStatus.includes(lead.qualification.status)) {
      return false;
    }
  }

  // 11. Source class
  if (filters.sourceClass && filters.sourceClass.length > 0) {
    if (!filters.sourceClass.includes(lead.sourceClass)) {
      return false;
    }
  }

  return true;
}

/**
 * Filters and searches a list of PersistedLeadRecords.
 */
export function filterPersistedLeads(
  leads: readonly PersistedLeadRecord[],
  filters: WorkspaceFilterCriteria
): PersistedLeadRecord[] {
  // First apply search query if specified
  let filtered = filters.searchQuery
    ? searchPersistedLeads(leads, filters.searchQuery)
    : [...leads];

  // Then apply structured dimension filters
  return filtered.filter(lead => matchesWorkspaceFilters(lead, filters));
}
