/**
 * LeadNoria — Export-Safe Lead Projection & Research Workspace
 * Part 8: Lead Workspace Reducer & Action Handlers
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * - Pure, deterministic state machine for managing ExportSafeLeads in-memory.
 * - Enforces that user-owned metadata updates never copy or accept Google restricted fields.
 * - Idempotent, immutable updates.
 */

import type { ExportSafeLead, IndependentSourceAnchor, LeadEligibilityReasonCode } from './leadTypes.ts';
import { evaluateLeadEligibility } from './leadEligibility.ts';

export interface LeadConflictRecord {
  readonly conflictId: string;
  readonly leadId: string;
  readonly fieldName: string;
  readonly independentValue: string;
  readonly conflictingValue: string;
  readonly sourceContext: string;
  readonly status: 'DETECTED' | 'RESOLVED';
  readonly resolvedValue?: string;
  readonly resolvedAt?: string;
}

export interface LeadWorkspaceState {
  readonly leads: Readonly<Record<string, ExportSafeLead>>;
  readonly independentSources: Readonly<Record<string, IndependentSourceAnchor>>;
  readonly conflicts: readonly LeadConflictRecord[];
  readonly selectedLeadId: string | null;
  readonly version: number;
}

export type LeadWorkspaceAction =
  | { type: 'CREATE_LEAD'; lead: ExportSafeLead }
  | { type: 'SELECT_LEAD'; leadId: string | null }
  | { type: 'UPDATE_USER_METADATA'; leadId: string; notes?: string; tags?: string[]; priority?: 'LOW' | 'MEDIUM' | 'HIGH'; manualStatus?: string }
  | { type: 'ATTACH_INDEPENDENT_SOURCE'; leadId: string; source: IndependentSourceAnchor }
  | { type: 'BLOCK_EXPORT'; leadId: string; reason: string }
  | { type: 'UNBLOCK_EXPORT'; leadId: string }
  | { type: 'DELETE_LEAD'; leadId: string }
  | { type: 'RECORD_CONFLICT'; conflict: Omit<LeadConflictRecord, 'status'> }
  | { type: 'RESOLVE_CONFLICT'; conflictId: string; acceptedValue: string }
  | { type: 'RE_EVALUATE_ELIGIBILITY'; leadId: string }
  | { type: 'CLEAR_WORKSPACE' };

export const INITIAL_LEAD_WORKSPACE_STATE: LeadWorkspaceState = Object.freeze({
  leads: Object.freeze({}),
  independentSources: Object.freeze({}),
  conflicts: Object.freeze([]),
  selectedLeadId: null,
  version: 1
});

/**
 * Pure reducer function for Lead Workspace actions.
 */
export function leadWorkspaceReducer(
  state: LeadWorkspaceState,
  action: LeadWorkspaceAction
): LeadWorkspaceState {
  switch (action.type) {
    case 'CREATE_LEAD': {
      const existing = state.leads[action.lead.leadId];
      if (existing) {
        return state; // Idempotent
      }
      return Object.freeze({
        ...state,
        leads: Object.freeze({
          ...state.leads,
          [action.lead.leadId]: action.lead
        }),
        version: state.version + 1
      });
    }

    case 'SELECT_LEAD': {
      return Object.freeze({
        ...state,
        selectedLeadId: action.leadId
      });
    }

    case 'UPDATE_USER_METADATA': {
      const target = state.leads[action.leadId];
      if (!target) return state;

      // Defensive safety check: ensure notes do not contain Google Place ID or restricted URLs
      if (
        (action.notes && action.notes.includes('ChIJ')) ||
        (action.notes && action.notes.includes('maps.google.com'))
      ) {
        throw new Error('SECURITY VIOLATION: Cannot write Google Maps Place IDs or URLs into lead user notes');
      }

      const updatedUserMetadata = Object.freeze({
        notes: action.notes !== undefined ? action.notes : target.userMetadata.notes,
        tags: action.tags !== undefined ? Object.freeze([...action.tags]) : target.userMetadata.tags,
        priority: action.priority !== undefined ? action.priority : target.userMetadata.priority,
        manualStatus: action.manualStatus !== undefined ? action.manualStatus : target.userMetadata.manualStatus
      });

      const updatedLead: ExportSafeLead = Object.freeze({
        ...target,
        userMetadata: updatedUserMetadata,
        updatedAt: new Date().toISOString()
      });

      return Object.freeze({
        ...state,
        leads: Object.freeze({
          ...state.leads,
          [action.leadId]: updatedLead
        }),
        version: state.version + 1
      });
    }

    case 'ATTACH_INDEPENDENT_SOURCE': {
      const target = state.leads[action.leadId];
      if (!target) return state;

      const updatedSources = Object.freeze({
        ...state.independentSources,
        [action.source.sourceId]: action.source
      });

      // Re-evaluate eligibility with newly attached source
      const eligibility = evaluateLeadEligibility({
        independentSource: action.source,
        independentEvidence: {
          domain: target.website.domain,
          businessName: target.identity.businessName,
          hasPublicContact: target.contact.publicEmails.length > 0 || target.contact.publicPhones.length > 0,
          hasLeadershipPerson: target.person.leadershipPeople.length > 0
        },
        reviewState: target.reviewOutcome.reviewState,
        qualificationStatus: target.qualification.status
      });

      const updatedLead: ExportSafeLead = Object.freeze({
        ...target,
        sourceClass: action.source.sourceClass,
        independentSourceId: action.source.sourceId,
        exportEligibility: eligibility.isExportEligible ? 'ELIGIBLE' : 'BLOCKED',
        eligibilityReasons: eligibility.reasonCodes,
        updatedAt: new Date().toISOString()
      });

      return Object.freeze({
        ...state,
        independentSources: updatedSources,
        leads: Object.freeze({
          ...state.leads,
          [action.leadId]: updatedLead
        }),
        version: state.version + 1
      });
    }

    case 'BLOCK_EXPORT': {
      const target = state.leads[action.leadId];
      if (!target) return state;

      const newReasons: readonly LeadEligibilityReasonCode[] = Object.freeze([
        ...target.eligibilityReasons,
        'EXPORT_POLICY_BLOCKED' as const
      ]);

      const updatedLead: ExportSafeLead = Object.freeze({
        ...target,
        exportEligibility: 'BLOCKED',
        eligibilityReasons: newReasons,
        updatedAt: new Date().toISOString()
      });

      return Object.freeze({
        ...state,
        leads: Object.freeze({
          ...state.leads,
          [action.leadId]: updatedLead
        }),
        version: state.version + 1
      });
    }

    case 'UNBLOCK_EXPORT': {
      const target = state.leads[action.leadId];
      if (!target) return state;

      const filteredReasons = target.eligibilityReasons.filter(r => r !== 'EXPORT_POLICY_BLOCKED');
      const isEligible = filteredReasons.length === 0 || filteredReasons.every(r => r.includes('SOURCE_PRESENT'));

      const updatedLead: ExportSafeLead = Object.freeze({
        ...target,
        exportEligibility: isEligible ? 'ELIGIBLE' : 'BLOCKED',
        eligibilityReasons: Object.freeze(filteredReasons),
        updatedAt: new Date().toISOString()
      });

      return Object.freeze({
        ...state,
        leads: Object.freeze({
          ...state.leads,
          [action.leadId]: updatedLead
        }),
        version: state.version + 1
      });
    }

    case 'DELETE_LEAD': {
      if (!state.leads[action.leadId]) return state;
      const { [action.leadId]: _, ...remainingLeads } = state.leads;
      return Object.freeze({
        ...state,
        leads: Object.freeze(remainingLeads),
        selectedLeadId: state.selectedLeadId === action.leadId ? null : state.selectedLeadId,
        version: state.version + 1
      });
    }

    case 'RECORD_CONFLICT': {
      const conflict: LeadConflictRecord = Object.freeze({
        ...action.conflict,
        status: 'DETECTED'
      });
      return Object.freeze({
        ...state,
        conflicts: Object.freeze([...state.conflicts, conflict]),
        version: state.version + 1
      });
    }

    case 'RESOLVE_CONFLICT': {
      const updatedConflicts = state.conflicts.map(c => {
        if (c.conflictId === action.conflictId) {
          return Object.freeze({
            ...c,
            status: 'RESOLVED' as const,
            resolvedValue: action.acceptedValue,
            resolvedAt: new Date().toISOString()
          });
        }
        return c;
      });

      return Object.freeze({
        ...state,
        conflicts: Object.freeze(updatedConflicts),
        version: state.version + 1
      });
    }

    case 'RE_EVALUATE_ELIGIBILITY': {
      const target = state.leads[action.leadId];
      if (!target) return state;

      const anchor = state.independentSources[target.independentSourceId];
      const eligibility = evaluateLeadEligibility({
        independentSource: anchor,
        independentEvidence: {
          domain: target.website.domain,
          businessName: target.identity.businessName,
          hasPublicContact: target.contact.publicEmails.length > 0 || target.contact.publicPhones.length > 0,
          hasLeadershipPerson: target.person.leadershipPeople.length > 0
        },
        reviewState: target.reviewOutcome.reviewState,
        qualificationStatus: target.qualification.status
      });

      const updatedLead: ExportSafeLead = Object.freeze({
        ...target,
        exportEligibility: eligibility.isExportEligible ? 'ELIGIBLE' : 'BLOCKED',
        eligibilityReasons: eligibility.reasonCodes,
        updatedAt: new Date().toISOString()
      });

      return Object.freeze({
        ...state,
        leads: Object.freeze({
          ...state.leads,
          [action.leadId]: updatedLead
        }),
        version: state.version + 1
      });
    }

    case 'CLEAR_WORKSPACE': {
      return INITIAL_LEAD_WORKSPACE_STATE;
    }

    default:
      return state;
  }
}
