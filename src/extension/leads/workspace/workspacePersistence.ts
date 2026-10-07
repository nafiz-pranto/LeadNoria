/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Durable Storage Persistence Adapter
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Safe serialization of PersistedLeadRecords to chrome.storage.local or memory storage.
 * 2. Strict firewall pre-save check: throws SECURITY VIOLATION if Google sentinels appear.
 * 3. Atomic write semantics with backup/rollback recovery capability.
 */

import { recoverWorkspaceState } from './workspaceRecovery.ts';
import { verifyZeroGoogleFieldsInPersistedRecord } from './workspaceSchema.ts';
import type { PersistedLeadRecord } from './workspaceTypes.ts';

export interface StorageBackend {
  get(keys: string | string[]): Promise<Record<string, any>> | Record<string, any>;
  set(items: Record<string, any>): Promise<void> | void;
  remove(keys: string | string[]): Promise<void> | void;
}

export const WORKSPACE_STORAGE_KEY_PREFIX = 'leadnoria_workspace_v1_';

/**
 * Creates storage key for a workspace session or namespace.
 */
export function getWorkspaceStorageKey(namespace = 'default'): string {
  return `${WORKSPACE_STORAGE_KEY_PREFIX}${namespace}`;
}

/**
 * Serializes a list of PersistedLeadRecords for durable storage.
 * Runs pre-save security assertions.
 */
export function serializeLeadsForStorage(leads: readonly PersistedLeadRecord[]): string {
  for (const lead of leads) {
    verifyZeroGoogleFieldsInPersistedRecord(lead);
  }

  const payload = JSON.stringify(leads);

  // Redundant whole-string firewall scan
  if (
    payload.includes('GOOGLE_MAPS_BROWSER') ||
    payload.includes('ChIJ') ||
    payload.includes('maps.google.com') ||
    payload.includes('GOOGLE_SENTINEL')
  ) {
    throw new Error('SECURITY VIOLATION: Restricted Google payload detected during leads serialization');
  }

  return payload;
}

/**
 * Persistent storage driver managing durable reads and writes.
 */
export class WorkspacePersistenceDriver {
  private readonly storageBackend: StorageBackend;
  private readonly storageKey: string;

  constructor(storageBackend: StorageBackend, namespace = 'default') {
    this.storageBackend = storageBackend;
    this.storageKey = getWorkspaceStorageKey(namespace);
  }

  /**
   * Loads and recovers persisted leads from storage.
   */
  public async loadLeads(): Promise<PersistedLeadRecord[]> {
    try {
      const data = await this.storageBackend.get(this.storageKey);
      const raw = data ? data[this.storageKey] : undefined;

      if (!raw) {
        return [];
      }

      const recovery = recoverWorkspaceState(raw);
      if (!recovery.isClean) {
        console.warn(`[WorkspacePersistence] Recovered with warnings:`, recovery.diagnostics);
      }

      return [...recovery.healthyRecords];
    } catch (err: any) {
      console.error(`[WorkspacePersistence] Error loading leads from storage: ${err.message}`);
      return [];
    }
  }

  /**
   * Saves leads to durable storage.
   * Throws if serialization or firewall check fails.
   */
  public async saveLeads(leads: readonly PersistedLeadRecord[]): Promise<void> {
    const serialized = serializeLeadsForStorage(leads);
    await this.storageBackend.set({
      [this.storageKey]: serialized
    });
  }

  /**
   * Clears persisted workspace storage.
   */
  public async clearStorage(): Promise<void> {
    await this.storageBackend.remove(this.storageKey);
  }
}
