/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Persistent Workspace Orchestrator & Session Lifecycle
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Coordinates persistent storage, state reducer, and queries.
 * 2. Export operations project strictly via allowlist through Part 8 ExportPolicy.
 * 3. Complete session isolation with memory and storage bounds.
 */

import { exportLeadsToCsv, exportLeadsToJson, formatLeadsForClipboard } from '../leadExportPolicy.ts';
import type { ExportSafeLead } from '../leadTypes.ts';
import { computeWorkspaceAnalytics } from './workspaceAnalytics.ts';
import { filterPersistedLeads } from './workspaceFilters.ts';
import { MemoryStorageBackend, WorkspaceRepository } from './workspaceRepository.ts';
import { INITIAL_WORKSPACE_STATE, workspaceReducer, type WorkspaceAction, type WorkspaceState } from './workspaceReducer.ts';
import { paginatePersistedLeads, sortPersistedLeads } from './workspaceSorting.ts';
import { transitionLeadLifecycle } from './workspaceLifecycle.ts';
import { addTagToLead, removeTagFromLead } from './workspaceTags.ts';
import { createHistoryEvent } from './workspaceHistory.ts';
import type {
  LeadLifecycleState,
  PersistedLeadRecord,
  PersistentWorkspaceAnalytics,
  UserLeadMetadata,
  WorkspaceFilterCriteria,
  WorkspaceHistoryEvent,
  WorkspacePaginationParams,
  WorkspaceQueryResult,
  WorkspaceSortCriteria
} from './workspaceTypes.ts';

export class PersistentLeadWorkspaceSession {
  private readonly sessionId: string;
  private readonly repository: WorkspaceRepository;
  private state: WorkspaceState = INITIAL_WORKSPACE_STATE;
  private isDisposed = false;

  constructor(sessionId: string, storageBackend = new MemoryStorageBackend()) {
    this.sessionId = sessionId;
    this.repository = new WorkspaceRepository(storageBackend, sessionId);
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public get isInitialized(): boolean {
    return !this.state.isLoading && this.state.error === null && !this.isDisposed;
  }

  public get size(): number {
    return this.repository.size;
  }

  public async initialize(): Promise<void> {
    this.assertActive();
    this.dispatch({ type: 'LOAD_START' });
    try {
      await this.repository.initialize();
      const leads = this.repository.listLeads();
      this.dispatch({ type: 'LOAD_SUCCESS', leads });
    } catch (err: any) {
      this.dispatch({ type: 'LOAD_ERROR', error: err.message });
      throw err;
    }
  }

  public getState(): WorkspaceState {
    this.assertActive();
    return this.state;
  }

  public dispatch(action: WorkspaceAction): void {
    this.assertActive();
    this.state = workspaceReducer(this.state, action);
  }

  /**
   * Persists an ExportSafeLead into the durable workspace.
   */
  public async saveLead(lead: ExportSafeLead | PersistedLeadRecord): Promise<PersistedLeadRecord> {
    this.assertActive();
    const saved = await this.repository.saveLead(lead);
    this.dispatch({ type: 'SAVE_LEAD', lead: saved });
    return saved;
  }

  public getLead(leadId: string): PersistedLeadRecord | undefined {
    this.assertActive();
    return this.repository.getLead(leadId);
  }

  public async updateLeadMetadata(
    leadId: string,
    metadata: Partial<UserLeadMetadata>
  ): Promise<PersistedLeadRecord> {
    this.assertActive();
    const updated = await this.repository.updateLead(leadId, current => {
      const now = new Date().toISOString();
      return Object.freeze({
        ...current,
        userMetadata: {
          ...current.userMetadata,
          ...metadata
        },
        auditMetadata: {
          ...current.auditMetadata,
          updatedAt: now,
          version: current.auditMetadata.version + 1
        }
      });
    });

    this.dispatch({ type: 'UPDATE_METADATA', leadId, metadata });
    return updated;
  }

  public async transitionLifecycle(
    leadId: string,
    targetState: LeadLifecycleState,
    reason?: string
  ): Promise<PersistedLeadRecord> {
    this.assertActive();
    const current = this.repository.getLead(leadId);
    if (!current) throw new Error(`Lead "${leadId}" not found`);

    const updated = await this.repository.updateLead(leadId, curr => {
      return transitionLeadLifecycle(curr, targetState, reason);
    });

    const eventType = targetState === 'ARCHIVED'
      ? 'ARCHIVED'
      : (current.lifecycle.state === 'ARCHIVED' ? 'RESTORED' : 'LIFECYCLE_CHANGED');

    this.repository.recordHistoryEvent(
      createHistoryEvent({
        leadId,
        eventType,
        oldSafeValue: current.lifecycle.state,
        newSafeValue: targetState
      })
    );

    this.dispatch({ type: 'TRANSITION_LIFECYCLE', leadId, targetState, reason });
    return updated;
  }

  public async archiveLead(leadId: string, reason?: string): Promise<PersistedLeadRecord> {
    this.assertActive();
    const updated = await this.transitionLifecycle(leadId, 'ARCHIVED', reason || 'Archived lead');
    this.dispatch({ type: 'ARCHIVE_LEAD', leadId, reason });
    return updated;
  }

  public async restoreLead(leadId: string, reason?: string): Promise<PersistedLeadRecord> {
    this.assertActive();
    const current = this.repository.getLead(leadId);
    if (!current) throw new Error(`Lead "${leadId}" not found`);
    const targetState: LeadLifecycleState = current.lifecycle.previousState === 'NEW' ? 'NEW' : 'ACTIVE';
    const updated = await this.transitionLifecycle(leadId, targetState, reason || 'Restored lead');
    this.dispatch({ type: 'RESTORE_LEAD', leadId, reason });
    return updated;
  }

  public async deleteLead(leadId: string): Promise<boolean> {
    this.assertActive();
    const deleted = await this.repository.deleteLead(leadId);
    if (deleted) {
      this.dispatch({ type: 'DELETE_LEAD', leadId });
    }
    return deleted;
  }

  public async addTag(leadId: string, tag: string): Promise<PersistedLeadRecord> {
    this.assertActive();
    const updated = await this.repository.updateLead(leadId, current => {
      return addTagToLead(current, tag);
    });
    this.repository.recordHistoryEvent(
      createHistoryEvent({
        leadId,
        eventType: 'TAG_ADDED',
        newSafeValue: tag
      })
    );
    this.dispatch({ type: 'ADD_TAG', leadId, tag });
    return updated;
  }

  public async removeTag(leadId: string, tag: string): Promise<PersistedLeadRecord> {
    this.assertActive();
    const updated = await this.repository.updateLead(leadId, current => {
      return removeTagFromLead(current, tag);
    });
    this.repository.recordHistoryEvent(
      createHistoryEvent({
        leadId,
        eventType: 'TAG_REMOVED',
        oldSafeValue: tag
      })
    );
    this.dispatch({ type: 'REMOVE_TAG', leadId, tag });
    return updated;
  }

  public query(
    filters?: WorkspaceFilterCriteria,
    sort?: WorkspaceSortCriteria,
    pagination?: WorkspacePaginationParams
  ): WorkspaceQueryResult {
    this.assertActive();
    const activeFilters = filters || this.state.filterCriteria;
    const activeSort = sort || this.state.sortCriteria;
    const activePagination = pagination || this.state.pagination;

    return this.repository.queryLeads(activeFilters, activeSort, activePagination);
  }

  public search(query: string): readonly PersistedLeadRecord[] {
    this.assertActive();
    return this.query({ searchQuery: query }).items;
  }

  public filter(criteria: WorkspaceFilterCriteria): readonly PersistedLeadRecord[] {
    this.assertActive();
    return this.query(criteria).items;
  }

  public sort(sortCriteria: WorkspaceSortCriteria): readonly PersistedLeadRecord[] {
    this.assertActive();
    return this.query(undefined, sortCriteria).items;
  }

  public paginate(page: number, pageSize: number): WorkspaceQueryResult {
    this.assertActive();
    return this.query(undefined, undefined, { page, pageSize });
  }

  public getActiveLeads(): readonly PersistedLeadRecord[] {
    this.assertActive();
    return this.filter({ isArchived: false });
  }

  public getArchivedLeads(): readonly PersistedLeadRecord[] {
    this.assertActive();
    return this.filter({ isArchived: true });
  }

  public listLeads(): PersistedLeadRecord[] {
    this.assertActive();
    return this.repository.listLeads();
  }

  public getAllLeads(): PersistedLeadRecord[] {
    this.assertActive();
    return this.repository.listLeads();
  }

  public getAnalytics(): PersistentWorkspaceAnalytics {
    this.assertActive();
    return computeWorkspaceAnalytics(this.repository.listLeads());
  }

  public getHistoryForLead(leadId: string): readonly WorkspaceHistoryEvent[] {
    this.assertActive();
    return this.repository.getHistoryForLead(leadId);
  }

  /**
   * Helper converting PersistedLeadRecord back to ExportSafeLead format for export.
   */
  public toExportSafeLeads(records: readonly PersistedLeadRecord[]): ExportSafeLead[] {
    return records
      .filter(r => r.safeProvenance.exportEligibility === 'ELIGIBLE' && r.lifecycle.state !== 'DISQUALIFIED')
      .map(r => ({
        leadId: r.leadId,
        sourceClass: r.sourceClass,
        independentSourceId: r.independentSourceId,
        identity: {
          businessName: r.businessIdentity.businessName,
          domain: r.businessIdentity.domain,
          canonicalUrl: r.businessIdentity.canonicalUrl
        },
        website: r.publicWebsite,
        contact: r.publicContacts,
        person: r.publicPerson,
        qualification: r.qualification,
        reviewOutcome: r.reviewOutcome,
        evidenceReferences: [],
        exportEligibility: r.safeProvenance.exportEligibility,
        eligibilityReasons: [],
        userMetadata: {
          notes: r.userMetadata.notes,
          tags: r.userMetadata.tags,
          priority: r.userMetadata.priority
        },
        createdAt: r.auditMetadata.createdAt,
        updatedAt: r.auditMetadata.updatedAt
      }));
  }

  public exportCsv(filters?: WorkspaceFilterCriteria): string {
    this.assertActive();
    const all = this.repository.listLeads();
    const filtered = filterPersistedLeads(all, filters || this.state.filterCriteria);
    const exportable = this.toExportSafeLeads(filtered);
    return exportLeadsToCsv(exportable);
  }

  public exportJson(filters?: WorkspaceFilterCriteria): string {
    this.assertActive();
    const all = this.repository.listLeads();
    const filtered = filterPersistedLeads(all, filters || this.state.filterCriteria);
    const exportable = this.toExportSafeLeads(filtered);
    return exportLeadsToJson(exportable);
  }

  public exportClipboard(filters?: WorkspaceFilterCriteria): string {
    this.assertActive();
    const all = this.repository.listLeads();
    const filtered = filterPersistedLeads(all, filters || this.state.filterCriteria);
    const exportable = this.toExportSafeLeads(filtered);
    return formatLeadsForClipboard(exportable);
  }

  public dispose(): void {
    this.repository.dispose();
    this.isDisposed = true;
  }

  private assertActive(): void {
    if (this.isDisposed) {
      throw new Error(`Cannot perform operation on disposed PersistentLeadWorkspaceSession "${this.sessionId}"`);
    }
  }
}
