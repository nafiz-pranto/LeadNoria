/**
 * Website Verification Cache Layer (Phase 6)
 *
 * Persists successful WebsiteVerificationRecord results for 24 hours.
 * Uses chrome.storage.local / IndexedDB with in-memory fallback for test harnesses.
 * Keys entries by normalized domain / origin to prevent repeated crawling during runs.
 */

import type { WebsiteVerificationRecord } from './types.ts';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface CachedWebsiteEntry {
  key: string; // normalized domain or origin
  record: WebsiteVerificationRecord;
  cachedAt: number; // Unix timestamp ms
  expiresAt: number;
}

// In-memory fallback for Node/testing or when chrome.storage is unavailable
const memoryCache = new Map<string, CachedWebsiteEntry>();

/**
 * Normalizes cache key from domain or URL origin
 */
export function getDomainCacheKey(originOrDomain: string): string {
  let cleaned = (originOrDomain || '').toLowerCase().trim();
  cleaned = cleaned.replace(/^https?:\/\//, '').replace(/^www\./, '');
  const slashIdx = cleaned.indexOf('/');
  if (slashIdx !== -1) {
    cleaned = cleaned.slice(0, slashIdx);
  }
  return cleaned;
}

/**
 * Retrieves a non-expired verification record from cache
 */
export async function getCachedWebsiteVerification(
  originOrDomain: string
): Promise<WebsiteVerificationRecord | null> {
  const key = getDomainCacheKey(originOrDomain);
  if (!key) return null;

  const now = Date.now();

  // 1. Try chrome.storage.local
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const storageKey = `web_verify_cache_${key}`;
      const res = await chrome.storage.local.get([storageKey]);
      const entry = res[storageKey] as CachedWebsiteEntry | undefined;
      if (entry && entry.expiresAt > now && entry.record) {
        return entry.record;
      }
    } catch {
      // Fallback to memory cache
    }
  }

  // 2. Memory cache fallback
  const memEntry = memoryCache.get(key);
  if (memEntry) {
    if (memEntry.expiresAt > now) {
      return memEntry.record;
    } else {
      memoryCache.delete(key);
    }
  }

  return null;
}

/**
 * Stores a verification record in cache with 24h TTL
 */
export async function setCachedWebsiteVerification(
  originOrDomain: string,
  record: WebsiteVerificationRecord
): Promise<void> {
  const key = getDomainCacheKey(originOrDomain);
  if (!key) return;

  const now = Date.now();
  const entry: CachedWebsiteEntry = {
    key,
    record,
    cachedAt: now,
    expiresAt: now + CACHE_TTL_MS
  };

  memoryCache.set(key, entry);

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const storageKey = `web_verify_cache_${key}`;
      await chrome.storage.local.set({ [storageKey]: entry });
    } catch {
      // Memory store already updated
    }
  }
}

/**
 * Clears expired or all verification cache entries
 */
export async function clearWebsiteCache(forceAll: boolean = false): Promise<void> {
  const now = Date.now();
  if (forceAll) {
    memoryCache.clear();
  } else {
    for (const [k, v] of memoryCache.entries()) {
      if (v.expiresAt <= now) {
        memoryCache.delete(k);
      }
    }
  }
}
