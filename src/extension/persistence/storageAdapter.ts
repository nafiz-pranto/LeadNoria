/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Storage Adapter Abstraction & In-Memory/IndexedDB Implementations
 * 
 * Non-Negotiable Invariants:
 * - Deterministic storage operations with isolated collections
 * - Fast deterministic lookups via collection indices
 * - Storage quota monitoring & atomic lock/lease management
 * - Zero external cloud dependencies
 */

import { PersistenceError } from './persistenceTypes.ts';

export interface StorageAdapter {
  get<T>(collection: string, key: string): Promise<T | null>;
  put<T>(collection: string, key: string, value: T): Promise<void>;
  delete(collection: string, key: string): Promise<boolean>;
  list<T>(collection: string, filter?: (item: T) => boolean): Promise<T[]>;
  count(collection: string): Promise<number>;
  clear(collection?: string): Promise<void>;
  acquireLock(lockKey: string, ttlMs?: number): Promise<boolean>;
  releaseLock(lockKey: string): Promise<void>;
  getStats(): Promise<{ collectionCounts: Record<string, number>; estimatedBytes: number }>;
}

/**
 * Deterministic In-Memory Storage Adapter
 * Used in test environments, non-browser workers, and local service execution.
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private collections: Map<string, Map<string, unknown>> = new Map();
  private locks: Map<string, { expiresAt: number }> = new Map();
  private maxQuotaBytes: number;
  private currentBytes = 0;

  constructor(maxQuotaBytes: number = 50 * 1024 * 1024) { // Default 50 MB quota
    this.maxQuotaBytes = maxQuotaBytes;
  }

  private getCollection(name: string): Map<string, unknown> {
    let coll = this.collections.get(name);
    if (!coll) {
      coll = new Map();
      this.collections.set(name, coll);
    }
    return coll;
  }

  async get<T>(collection: string, key: string): Promise<T | null> {
    const coll = this.getCollection(collection);
    const item = coll.get(key);
    if (item === undefined) {
      return null;
    }
    // Deep clone to prevent accidental in-memory reference mutations
    return JSON.parse(JSON.stringify(item)) as T;
  }

  async put<T>(collection: string, key: string, value: T): Promise<void> {
    const coll = this.getCollection(collection);
    const serialized = JSON.stringify(value);
    const newBytes = serialized.length * 2; // Rough UTF-16 byte estimate

    // Check quota
    if (this.currentBytes + newBytes > this.maxQuotaBytes) {
      throw new PersistenceError(
        'STORAGE_QUOTA_EXCEEDED',
        `Storage quota of ${this.maxQuotaBytes} bytes exceeded (current: ${this.currentBytes}, new: ${newBytes})`
      );
    }

    // Deduct old item bytes if replacing
    const oldItem = coll.get(key);
    if (oldItem !== undefined) {
      const oldBytes = JSON.stringify(oldItem).length * 2;
      this.currentBytes = Math.max(0, this.currentBytes - oldBytes);
    }

    this.currentBytes += newBytes;
    coll.set(key, JSON.parse(serialized));
  }

  async delete(collection: string, key: string): Promise<boolean> {
    const coll = this.getCollection(collection);
    const item = coll.get(key);
    if (item !== undefined) {
      const bytes = JSON.stringify(item).length * 2;
      this.currentBytes = Math.max(0, this.currentBytes - bytes);
      return coll.delete(key);
    }
    return false;
  }

  async list<T>(collection: string, filter?: (item: T) => boolean): Promise<T[]> {
    const coll = this.getCollection(collection);
    const items: T[] = [];
    for (const val of coll.values()) {
      const cloned = JSON.parse(JSON.stringify(val)) as T;
      if (!filter || filter(cloned)) {
        items.push(cloned);
      }
    }
    return items;
  }

  async count(collection: string): Promise<number> {
    const coll = this.getCollection(collection);
    return coll.size;
  }

  async clear(collection?: string): Promise<void> {
    if (collection) {
      const coll = this.getCollection(collection);
      coll.clear();
    } else {
      this.collections.clear();
      this.locks.clear();
      this.currentBytes = 0;
    }
  }

  async acquireLock(lockKey: string, ttlMs = 5000): Promise<boolean> {
    const now = Date.now();
    const existing = this.locks.get(lockKey);
    if (existing && existing.expiresAt > now) {
      return false; // Lock active
    }
    this.locks.set(lockKey, { expiresAt: now + ttlMs });
    return true;
  }

  async releaseLock(lockKey: string): Promise<void> {
    this.locks.delete(lockKey);
  }

  async getStats(): Promise<{ collectionCounts: Record<string, number>; estimatedBytes: number }> {
    const collectionCounts: Record<string, number> = {};
    for (const [name, map] of this.collections.entries()) {
      collectionCounts[name] = map.size;
    }
    return {
      collectionCounts,
      estimatedBytes: this.currentBytes
    };
  }
}
