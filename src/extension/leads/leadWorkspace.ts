/**
 * LeadNoria — Export-Safe Lead Projection & Research Workspace
 * Part 8: Lead Workspace Session Orchestrator
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * - Unifies Research Candidates and ExportSafeLeads in-memory with strict boundaries.
 * - Research candidates NEVER automatically become exportable.
 * - Exposes safe export methods (CSV, JSON, Clipboard).
 * - Disposes cleanly on session completion.
 */

import type {
  ExportSafeLead,
  IndependentSourceAnchor,
  LeadWorkspaceAnalytics
} from './leadTypes.ts';
import {
  INITIAL_LEAD_WORKSPACE_STATE,
  leadWorkspaceReducer,
  type LeadWorkspaceAction,
  type LeadWorkspaceState
} from './leadReducer.ts';
import { toExportSafeLead, type LeadProjectionParams } from './leadProjection.ts';
import { exportLeadsToCsv, exportLeadsToJson, formatLeadsForClipboard } from './leadExportPolicy.ts';
import { computeLeadWorkspaceAnalytics } from './leadAnalytics.ts';

export class LeadWorkspaceSession {
  private readonly sessionId: string;
  private state: LeadWorkspaceState = INITIAL_LEAD_WORKSPACE_STATE;
  private isDisposed = false;

  // External candidate count tracking from acquisition session
  private candidateCounts = {
    researchCandidatesCount: 0,
    qualifiedCandidatesCount: 0,
    blockedGoogleCount: 0
  };

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getState(): LeadWorkspaceState {
    this.assertActive();
    return this.state;
  }

  public setCandidateCounts(counts: {
    researchCandidatesCount: number;
    qualifiedCandidatesCount: number;
    blockedGoogleCount: number;
  }): void {
    this.assertActive();
    this.candidateCounts = { ...counts };
  }

  public dispatch(action: LeadWorkspaceAction): void {
    this.assertActive();
    this.state = leadWorkspaceReducer(this.state, action);
  }

  /**
   * Projects an independent source into an ExportSafeLead and registers it into the workspace.
   */
  public projectLead(params: LeadProjectionParams): ExportSafeLead {
    this.assertActive();
    const lead = toExportSafeLead(params);
    this.dispatch({ type: 'CREATE_LEAD', lead });
    this.dispatch({ type: 'ATTACH_INDEPENDENT_SOURCE', leadId: lead.leadId, source: params.independentSource });
    return lead;
  }

  public getLead(leadId: string): ExportSafeLead | undefined {
    this.assertActive();
    return this.state.leads[leadId];
  }

  public getAllLeads(): ExportSafeLead[] {
    this.assertActive();
    return Object.values(this.state.leads);
  }

  public getEligibleLeads(): ExportSafeLead[] {
    this.assertActive();
    return Object.values(this.state.leads).filter(l => l.exportEligibility === 'ELIGIBLE');
  }

  public getBlockedLeads(): ExportSafeLead[] {
    this.assertActive();
    return Object.values(this.state.leads).filter(l => l.exportEligibility === 'BLOCKED');
  }

  public exportCsv(): string {
    this.assertActive();
    return exportLeadsToCsv(this.getAllLeads());
  }

  public exportJson(): string {
    this.assertActive();
    return exportLeadsToJson(this.getAllLeads());
  }

  public exportClipboard(): string {
    this.assertActive();
    return formatLeadsForClipboard(this.getAllLeads());
  }

  public getAnalytics(): LeadWorkspaceAnalytics {
    this.assertActive();
    const leads = this.getAllLeads();
    return computeLeadWorkspaceAnalytics({
      researchCandidatesCount: this.candidateCounts.researchCandidatesCount,
      qualifiedCandidatesCount: this.candidateCounts.qualifiedCandidatesCount,
      blockedGoogleCount: this.candidateCounts.blockedGoogleCount,
      independentSourceCount: Object.keys(this.state.independentSources).length,
      leads,
      conflictCount: this.state.conflicts.length
    });
  }

  public dispose(): void {
    this.dispatch({ type: 'CLEAR_WORKSPACE' });
    this.isDisposed = true;
  }

  private assertActive(): void {
    if (this.isDisposed) {
      throw new Error(`Cannot perform operation on disposed LeadWorkspaceSession "${this.sessionId}"`);
    }
  }
}
