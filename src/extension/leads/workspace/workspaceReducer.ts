/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Workspace State Reducer
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Pure, deterministic state machine for Persistent Lead Workspace.
 * 2. Enforces valid lifecycle transitions and safe metadata bounds.
 * 3. Immutable state updates with complete prototype safety.
 */

import { transitionLeadLifecycle } from './workspaceLifecycle.ts';
import { addTagToLead, removeTagFromLead } from './workspaceTags.ts';
import type {
  LeadLifecycleState,
  LeadPriority,
  PersistedLeadRecord,
  UserLeadMetadata,
  WorkspaceFilterCriteria,
  WorkspacePaginationParams,
  WorkspaceSortCriteria
} from './workspaceTypes.ts';

export interface WorkspaceState {
  readonly leads: readonly PersistedLeadRecord[];
  readonly filterCriteria: WorkspaceFilterCriteria;
  readonly sortCriteria: WorkspaceSortCriteria;
  readonly pagination: WorkspacePaginationParams;
  readonly selectedLeadId: string | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export const INITIAL_WORKSPACE_STATE: WorkspaceState = Object.freeze({
  leads: Object.freeze([]),
  filterCriteria: Object.freeze({ isArchived: false }),
  sortCriteria: Object.freeze({ field: 'updatedAt', direction: 'DESC' }),
  pagination: Object.freeze({ page: 1, pageSize: 20 }),
  selectedLeadId: null,
  isLoading: false,
  error: null
});

export type WorkspaceAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; leads: PersistedLeadRecord[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'SAVE_LEAD'; lead: PersistedLeadRecord }
  | { type: 'UPDATE_METADATA'; leadId: string; metadata: Partial<UserLeadMetadata> }
  | { type: 'TRANSITION_LIFECYCLE'; leadId: string; targetState: LeadLifecycleState; reason?: string }
  | { type: 'ARCHIVE_LEAD'; leadId: string; reason?: string }
  | { type: 'RESTORE_LEAD'; leadId: string; reason?: string }
  | { type: 'DELETE_LEAD'; leadId: string }
  | { type: 'ADD_TAG'; leadId: string; tag: string }
  | { type: 'REMOVE_TAG'; leadId: string; tag: string }
  | { type: 'SET_FILTERS'; filters: Partial<WorkspaceFilterCriteria> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_SORT'; sort: WorkspaceSortCriteria }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SELECT_LEAD'; leadId: string | null }
  | { type: 'BATCH_TRANSITION_LIFECYCLE'; leadIds: string[]; targetState: LeadLifecycleState; reason?: string };

export function workspaceReducer(
  state: WorkspaceState = INITIAL_WORKSPACE_STATE,
  action: WorkspaceAction
): WorkspaceState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };

    case 'LOAD_SUCCESS':
      return { ...state, leads: Object.freeze([...action.leads]), isLoading: false, error: null };

    case 'LOAD_ERROR':
      return { ...state, isLoading: false, error: action.error };

    case 'SAVE_LEAD': {
      const existingIdx = state.leads.findIndex(l => l.leadId === action.lead.leadId);
      let updatedLeads: PersistedLeadRecord[];

      if (existingIdx >= 0) {
        updatedLeads = [...state.leads];
        updatedLeads[existingIdx] = action.lead;
      } else {
        updatedLeads = [action.lead, ...state.leads];
      }

      return { ...state, leads: Object.freeze(updatedLeads), error: null };
    }

    case 'UPDATE_METADATA': {
      const updatedLeads = state.leads.map(lead => {
        if (lead.leadId !== action.leadId) return lead;

        const updatedMetadata: UserLeadMetadata = {
          ...lead.userMetadata,
          ...action.metadata
        };

        const now = new Date().toISOString();
        return Object.freeze({
          ...lead,
          userMetadata: updatedMetadata,
          auditMetadata: {
            ...lead.auditMetadata,
            updatedAt: now,
            version: lead.auditMetadata.version + 1
          }
        });
      });

      return { ...state, leads: Object.freeze(updatedLeads) };
    }

    case 'TRANSITION_LIFECYCLE': {
      const updatedLeads = state.leads.map(lead => {
        if (lead.leadId !== action.leadId) return lead;
        return transitionLeadLifecycle(lead, action.targetState, action.reason);
      });

      return { ...state, leads: Object.freeze(updatedLeads) };
    }

    case 'ARCHIVE_LEAD': {
      const updatedLeads = state.leads.map(lead => {
        if (lead.leadId !== action.leadId) return lead;
        return transitionLeadLifecycle(lead, 'ARCHIVED', action.reason || 'User archived lead');
      });

      return { ...state, leads: Object.freeze(updatedLeads) };
    }

    case 'RESTORE_LEAD': {
      const updatedLeads = state.leads.map(lead => {
        if (lead.leadId !== action.leadId) return lead;
        const target = lead.lifecycle.previousState || 'ACTIVE';
        return transitionLeadLifecycle(lead, target === 'ARCHIVED' ? 'ACTIVE' : target, action.reason || 'User restored lead');
      });

      return { ...state, leads: Object.freeze(updatedLeads) };
    }

    case 'DELETE_LEAD': {
      const filtered = state.leads.filter(l => l.leadId !== action.leadId);
      const nextSelected = state.selectedLeadId === action.leadId ? null : state.selectedLeadId;
      return { ...state, leads: Object.freeze(filtered), selectedLeadId: nextSelected };
    }

    case 'ADD_TAG': {
      const updatedLeads = state.leads.map(lead => {
        if (lead.leadId !== action.leadId) return lead;
        return addTagToLead(lead, action.tag);
      });

      return { ...state, leads: Object.freeze(updatedLeads) };
    }

    case 'REMOVE_TAG': {
      const updatedLeads = state.leads.map(lead => {
        if (lead.leadId !== action.leadId) return lead;
        return removeTagFromLead(lead, action.tag);
      });

      return { ...state, leads: Object.freeze(updatedLeads) };
    }

    case 'SET_FILTERS': {
      return {
        ...state,
        filterCriteria: Object.freeze({ ...state.filterCriteria, ...action.filters }),
        pagination: { ...state.pagination, page: 1 } // Reset to page 1 on filter change
      };
    }

    case 'RESET_FILTERS': {
      return {
        ...state,
        filterCriteria: Object.freeze({ isArchived: false }),
        pagination: { ...state.pagination, page: 1 }
      };
    }

    case 'SET_SORT': {
      return { ...state, sortCriteria: Object.freeze(action.sort) };
    }

    case 'SET_PAGE': {
      return { ...state, pagination: { ...state.pagination, page: action.page } };
    }

    case 'SELECT_LEAD': {
      return { ...state, selectedLeadId: action.leadId };
    }

    case 'BATCH_TRANSITION_LIFECYCLE': {
      const set = new Set(action.leadIds);
      const updatedLeads = state.leads.map(lead => {
        if (!set.has(lead.leadId)) return lead;
        return transitionLeadLifecycle(lead, action.targetState, action.reason);
      });

      return { ...state, leads: Object.freeze(updatedLeads) };
    }

    default:
      return state;
  }
}
