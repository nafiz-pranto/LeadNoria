/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Persistent Workspace Repository
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Transactional write safety: atomic state updates with rollback on failure.
 * 2. Optimistic version locking via auditMetadata.version.
 * 3. History audit events recorded for every meaningful mutation.
 * 4. Zero persistent Google Maps candidate records.
 */

import type { ExportSafeLead } from '../leadTypes.ts';
import { filterPersistedLeads } from './workspaceFilters.ts';
import { createHistoryEvent, WorkspaceHistoryManager } from './workspaceHistory.ts';
import { WorkspacePersistenceDriver, type StorageBackend } from './workspacePersistence.ts';
import { toPersistedLeadRecord, validatePersistedLeadRecord, verifyZeroGoogleFieldsInPersistedRecord } from './workspaceSchema.ts';
import { paginatePersistedLeads, sortPersistedLeads } from './workspaceSorting.ts';
import type {
  PersistedLeadRecord,
  WorkspaceFilterCriteria,
  WorkspaceHistoryEvent,
  WorkspacePaginationParams,
  WorkspaceQueryResult,
  WorkspaceSortCriteria
} from './workspaceTypes.ts';

/**
 * In-memory Mock StorageBackend for testing and headless execution.
 */
export class MemoryStorageBackend implements StorageBackend {
  private data = new Map<string, any>();

  public async get(keys: string | string[]): Promise<Record<string, any>> {
    const keyList = Array.isArray(keys) ? keys : [keys];
    const result: Record<string, any> = {};
    for (const k of keyList) {
      if (this.data.has(k)) {
        result[k] = this.data.get(k);
      }
    }
    return result;
  }

  public async set(items: Record<string, any>): Promise<void> {
    for (const [k, v] of Object.entries(items)) {
      this.data.set(k, v);
    }
  }

  public async remove(keys: string | string[]): Promise<void> {
    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const k of keyList) {
      this.data.delete(k);
    }
  }

  public clear(): void {
    this.data.clear();
  }
}

/**
 * High-level Persistent Workspace Repository.
 */
export class WorkspaceRepository {
  private readonly namespace: string;
  private readonly persistenceDriver: WorkspacePersistenceDriver;
  private readonly historyManager = new WorkspaceHistoryManager();
  private readonly leadsMap = new Map<string, PersistedLeadRecord>();
  private isDisposed = false;
  private isHydrated = false;

  constructor(storageBackend: StorageBackend, namespace = 'default') {
    this.namespace = namespace;
    this.persistenceDriver = new WorkspacePersistenceDriver(storageBackend, namespace);
  }

  public async initialize(): Promise<void> {
    this.assertActive();
    if (this.isHydrated) return;

    const storedLeads = await this.persistenceDriver.loadLeads();
    this.leadsMap.clear();

    for (const lead of storedLeads) {
      this.leadsMap.set(lead.leadId, lead);
    }

    this.isHydrated = true;
  }

  public get size(): number {
    this.assertActive();
    return this.leadsMap.size;
  }

  public getLead(leadId: string): PersistedLeadRecord | undefined {
    this.assertActive();
    return this.leadsMap.get(leadId);
  }

  /**
   * Looks up a lead by its canonical domain name for deduplication.
   */
  public findLeadByDomain(domain: string): PersistedLeadRecord | undefined {
    this.assertActive();
    if (!domain) return undefined;
    const norm = domain.trim().toLowerCase();
    for (const lead of this.leadsMap.values()) {
      if (lead.businessIdentity.domain.trim().toLowerCase() === norm) {
        return lead;
      }
    }
    return undefined;
  }

  public listLeads(): PersistedLeadRecord[] {
    this.assertActive();
    return Array.from(this.leadsMap.values());
  }

  /**
   * Saves a new or projected lead into the workspace.
   * Accepts either an ExportSafeLead or a PersistedLeadRecord.
   * Automatically deduplicates by leadId or canonical domain to ensure idempotency.
   */
  public async saveLead(
    leadInput: ExportSafeLead | PersistedLeadRecord
  ): Promise<PersistedLeadRecord> {
    this.assertActive();

    let record: PersistedLeadRecord;
    const isAlreadyPersistedRecord = 'schemaVersion' in leadInput && 'auditMetadata' in leadInput;

    if (isAlreadyPersistedRecord) {
      record = leadInput as PersistedLeadRecord;
    } else {
      record = toPersistedLeadRecord(leadInput as ExportSafeLead);
    }

    // Deduplication check: existing by leadId or canonical domain
    const existingById = this.leadsMap.get(record.leadId);
    const existingByDomain = this.findLeadByDomain(record.businessIdentity.domain);
    const existing = existingById || existingByDomain;

    if (existing) {
      record = {
        ...record,
        leadId: existing.leadId,
        auditMetadata: {
          ...record.auditMetadata,
          createdAt: existing.auditMetadata.createdAt,
          version: (existing.auditMetadata.version || 1) + 1,
          updatedAt: new Date().toISOString()
        }
      };
    }

    // Validate
    const validation = validatePersistedLeadRecord(record);
    if (!validation.isValid) {
      throw new Error(`Cannot save invalid lead record: ${validation.errors.join('; ')}`);
    }

    verifyZeroGoogleFieldsInPersistedRecord(record);

    // Save with rollback protection
    const backup = new Map(this.leadsMap);
    try {
      this.leadsMap.set(record.leadId, record);
      await this.persist();

      this.historyManager.recordEvent(
        createHistoryEvent({
          leadId: record.leadId,
          eventType: existing ? 'FIELD_UPDATED' : 'LEAD_CREATED',
          fieldName: existing ? 'leadRecord' : undefined,
          newSafeValue: record.businessIdentity.businessName
        })
      );

      return record;
    } catch (err) {
      // Rollback memory state
      this.leadsMap.clear();
      for (const [k, v] of backup.entries()) {
        this.leadsMap.set(k, v);
      }
      throw err;
    }
  }

  /**
   * Updates an existing lead record using a functional mutator.
   * Enforces optimistic locking if expectedVersion is provided.
   */
  public async updateLead(
    leadId: string,
    mutator: (current: PersistedLeadRecord) => PersistedLeadRecord,
    expectedVersion?: number
  ): Promise<PersistedLeadRecord> {
    this.assertActive();
    const current = this.leadsMap.get(leadId);

    if (!current) {
      throw new Error(`Lead "${leadId}" not found in workspace`);
    }

    if (expectedVersion !== undefined && current.auditMetadata.version !== expectedVersion) {
      throw new Error(
        `CONCURRENCY CONFLICT: Lead "${leadId}" version mismatch (expected ${expectedVersion}, found ${current.auditMetadata.version})`
      );
    }

    const mutated = mutator(current);
    const updated: PersistedLeadRecord = {
      ...mutated,
      auditMetadata: {
        ...mutated.auditMetadata,
        version: (current.auditMetadata.version || 1) + 1,
        updatedAt: new Date().toISOString()
      }
    };

    const validation = validatePersistedLeadRecord(updated);
    if (!validation.isValid) {
      throw new Error(`Cannot update lead with invalid record: ${validation.errors.join('; ')}`);
    }

    verifyZeroGoogleFieldsInPersistedRecord(updated);

    const backup = new Map(this.leadsMap);
    try {
      this.leadsMap.set(leadId, updated);
      await this.persist();

      this.historyManager.recordEvent(
        createHistoryEvent({
          leadId,
          eventType: 'FIELD_UPDATED',
          fieldName: 'metadata',
          oldSafeValue: current.auditMetadata.updatedAt,
          newSafeValue: updated.auditMetadata.updatedAt
        })
      );

      return updated;
    } catch (err) {
      this.leadsMap.clear();
      for (const [k, v] of backup.entries()) {
        this.leadsMap.set(k, v);
      }
      throw err;
    }
  }

  /**
   * Deletes a lead record and cleans up associated history and references.
   */
  public async deleteLead(leadId: string): Promise<boolean> {
    this.assertActive();
    if (!this.leadsMap.has(leadId)) {
      return false;
    }

    const backup = new Map(this.leadsMap);
    try {
      this.leadsMap.delete(leadId);
      this.historyManager.clearLeadHistory(leadId);
      await this.persist();
      return true;
    } catch (err) {
      this.leadsMap.clear();
      for (const [k, v] of backup.entries()) {
        this.leadsMap.set(k, v);
      }
      throw err;
    }
  }

  /**
   * Batch updates multiple leads.
   */
  public async batchUpdateLeads(
    leadIds: string[],
    mutator: (current: PersistedLeadRecord) => PersistedLeadRecord
  ): Promise<PersistedLeadRecord[]> {
    this.assertActive();
    const backup = new Map(this.leadsMap);
    const updatedList: PersistedLeadRecord[] = [];

    try {
      for (const id of leadIds) {
        const item = this.leadsMap.get(id);
        if (item) {
          const mod = mutator(item);
          verifyZeroGoogleFieldsInPersistedRecord(mod);
          this.leadsMap.set(id, mod);
          updatedList.push(mod);
        }
      }
      await this.persist();
      return updatedList;
    } catch (err) {
      this.leadsMap.clear();
      for (const [k, v] of backup.entries()) {
        this.leadsMap.set(k, v);
      }
      throw err;
    }
  }

  /**
   * Queries leads with filters, sorting, and pagination.
   */
  public queryLeads(
    filters: WorkspaceFilterCriteria = {},
    sort: WorkspaceSortCriteria = { field: 'updatedAt', direction: 'DESC' },
    pagination: WorkspacePaginationParams = { page: 1, pageSize: 20 }
  ): WorkspaceQueryResult {
    this.assertActive();
    const all = Array.from(this.leadsMap.values());
    const filtered = filterPersistedLeads(all, filters);
    const sorted = sortPersistedLeads(filtered, sort);
    return paginatePersistedLeads(sorted, pagination);
  }

  public getHistoryForLead(leadId: string): readonly WorkspaceHistoryEvent[] {
    this.assertActive();
    return this.historyManager.getEventsForLead(leadId);
  }

  public recordHistoryEvent(event: WorkspaceHistoryEvent): void {
    this.assertActive();
    this.historyManager.recordEvent(event);
  }

  public dispose(): void {
    this.leadsMap.clear();
    this.historyManager.clearAll();
    this.isDisposed = true;
  }

  private async persist(): Promise<void> {
    const list = Array.from(this.leadsMap.values());
    await this.persistenceDriver.saveLeads(list);
  }

  private assertActive(): void {
    if (this.isDisposed) {
      throw new Error(`Cannot perform operation on disposed WorkspaceRepository "${this.namespace}"`);
    }
  }
}
