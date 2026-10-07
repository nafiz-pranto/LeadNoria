/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Sorting & Pagination Engine
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Deterministic sort order with mandatory tie-break by leadId.
 * 2. Immutable pagination: changing pages never mutates underlying lead data.
 */

import type {
  PersistedLeadRecord,
  WorkspacePaginationParams,
  WorkspaceQueryResult,
  WorkspaceSortCriteria
} from './workspaceTypes.ts';

const PRIORITY_ORDER: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

const LIFECYCLE_ORDER: Record<string, number> = {
  NEW: 1,
  ACTIVE: 2,
  CONTACTED: 3,
  QUALIFIED: 4,
  ON_HOLD: 5,
  DISQUALIFIED: 6,
  ARCHIVED: 7
};

/**
 * Sorts PersistedLeadRecords deterministically.
 */
export function sortPersistedLeads(
  leads: readonly PersistedLeadRecord[],
  criteria: WorkspaceSortCriteria = { field: 'updatedAt', direction: 'DESC' }
): PersistedLeadRecord[] {
  const sorted = [...leads];
  const { field, direction } = criteria;
  const factor = direction === 'ASC' ? 1 : -1;

  sorted.sort((a, b) => {
    let cmp = 0;

    switch (field) {
      case 'businessName': {
        const nameA = a.businessIdentity.businessName.toLowerCase();
        const nameB = b.businessIdentity.businessName.toLowerCase();
        cmp = nameA.localeCompare(nameB);
        break;
      }
      case 'createdAt': {
        cmp = a.auditMetadata.createdAt.localeCompare(b.auditMetadata.createdAt);
        break;
      }
      case 'updatedAt': {
        cmp = a.auditMetadata.updatedAt.localeCompare(b.auditMetadata.updatedAt);
        break;
      }
      case 'priority': {
        const pA = PRIORITY_ORDER[a.userMetadata.priority] || 0;
        const pB = PRIORITY_ORDER[b.userMetadata.priority] || 0;
        cmp = pA - pB;
        break;
      }
      case 'lifecycle': {
        const lA = LIFECYCLE_ORDER[a.lifecycle.state] || 0;
        const lB = LIFECYCLE_ORDER[b.lifecycle.state] || 0;
        cmp = lA - lB;
        break;
      }
      case 'followUpDate': {
        const fA = a.userMetadata.followUpDate || '';
        const fB = b.userMetadata.followUpDate || '';
        cmp = fA.localeCompare(fB);
        break;
      }
      default: {
        cmp = 0;
      }
    }

    if (cmp !== 0) {
      return cmp * factor;
    }

    // Stable tie-break by leadId
    return a.leadId.localeCompare(b.leadId);
  });

  return sorted;
}

/**
 * Applies pagination to a sorted list of leads.
 */
export function paginatePersistedLeads(
  leads: readonly PersistedLeadRecord[],
  pagination: WorkspacePaginationParams
): WorkspaceQueryResult {
  const page = Math.max(1, pagination.page || 1);
  const pageSize = Math.max(1, Math.min(100, pagination.pageSize || 20));
  const totalCount = leads.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const startIndex = (page - 1) * pageSize;
  const items = leads.slice(startIndex, startIndex + pageSize);

  return {
    items,
    totalCount,
    page,
    pageSize,
    totalPages
  };
}
