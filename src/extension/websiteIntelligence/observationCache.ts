/**
 * Bounded In-Memory Observation Cache (Phase 21 Blocker A & B Correction)
 *
 * Implements strict cache isolation and bounded memory management:
 * 1. Neutral website observations are cached independently from request-specific
 *    provenance, export, and persistence policies.
 * 2. Deterministic LRU eviction enforcing MAX_CACHE_ENTRIES and MAX_CACHE_BYTES.
 * 3. TTL expiration enforcing CACHE_TTL_MS (24 hours).
 * 4. Stays strictly in-memory (no storage persistence, zero leak across runs).
 */

import type {
  WebsiteIdentity,
  PublicPerson,
  TechnologySignal,
  BusinessService,
  BusinessDescription,
  CrawlStats,
  WebsiteIntelligenceConfig
} from './types.ts';
import {
  DEFAULT_MAX_CACHE_ENTRIES,
  DEFAULT_MAX_CACHE_BYTES,
  DEFAULT_CACHE_TTL_MS
} from './types.ts';
import type {
  BusinessPhoneFact,
  BusinessEmailFact,
  BusinessLocationFact,
  DigitalPresenceFact,
  ContactFormFact,
  ContactEvidenceItem
} from '../enrichment/contactTypes.ts';

export interface NeutralExtractedFacts {
  identity: WebsiteIdentity;
  phones: BusinessPhoneFact[];
  emails: BusinessEmailFact[];
  locations: BusinessLocationFact[];
  socialProfiles: DigitalPresenceFact[];
  people: PublicPerson[];
  services: BusinessService[];
  descriptions: BusinessDescription[];
  technologies: TechnologySignal[];
  contactForms: ContactFormFact[];
  allEvidence: ContactEvidenceItem[];
}

export interface NeutralObservationPayload {
  targetOrigin: string;
  targetUrl: string;
  canonicalUrl: string;
  domain: string;
  scopeKey: string;
  configHash: string;
  extractedAt: string;
  extracted: NeutralExtractedFacts;
  crawlStats: CrawlStats;
}

export interface CachedObservationEntry {
  key: string;
  payload: NeutralObservationPayload;
  byteSize: number;
  cachedAt: number;
  lastAccessedAt: number;
  expiresAt: number;
}

export interface ObservationCacheStats {
  entries: number;
  currentBytes: number;
  maxEntries: number;
  maxBytes: number;
  hits: number;
  misses: number;
  evictions: number;
  expirations: number;
}

export interface ObservationCacheOptions {
  maxEntries?: number;
  maxBytes?: number;
  defaultTtlMs?: number;
}

/**
 * Deterministically estimates memory footprint of an observation payload in bytes.
 */
export function estimateObservationBytes(payload: NeutralObservationPayload): number {
  try {
    const json = JSON.stringify(payload);
    // Rough estimate: UTF-16 characters ~ 2 bytes each, plus object overhead
    return json.length * 2 + 256;
  } catch {
    return 8192; // Fallback bound
  }
}

/**
 * Computes an isolated cache key that captures:
 * 1. Normalized origin and pathname scope
 * 2. Crawl configuration limits (maxPages, doc size, feature flags)
 * 3. Extraction schema version
 */
export function generateObservationCacheKey(
  targetUrl: string,
  config?: WebsiteIntelligenceConfig
): string {
  let origin = '';
  let pathScope = '/';
  try {
    const u = new URL(targetUrl.toLowerCase().trim());
    origin = `${u.protocol}//${u.hostname.replace(/^www\./, '')}${u.port ? ':' + u.port : ''}`;
    pathScope = u.pathname.replace(/\/+$/, '') || '/';
  } catch {
    origin = targetUrl.toLowerCase().trim();
  }

  const p = config?.maxPages ?? 5;
  const d = config?.maxDocumentBytes ?? 500000;
  const tech = config?.detectTechnology !== false ? '1' : '0';
  const pp = config?.collectPeople !== false ? '1' : '0';
  const sv = config?.collectServices !== false ? '1' : '0';

  return `obs:${origin}${pathScope}:p${p}:d${d}:t${tech}:pp${pp}:s${sv}:v1`;
}

/**
 * In-memory Bounded LRU Cache for Neutral Website Observations.
 */
export class BoundedObservationCache {
  private readonly maxEntries: number;
  private readonly maxBytes: number;
  private readonly defaultTtlMs: number;
  private readonly entries = new Map<string, CachedObservationEntry>();
  private currentBytes = 0;

  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private expirations = 0;

  constructor(options?: ObservationCacheOptions) {
    this.maxEntries = options?.maxEntries ?? DEFAULT_MAX_CACHE_ENTRIES;
    this.maxBytes = options?.maxBytes ?? DEFAULT_MAX_CACHE_BYTES;
    this.defaultTtlMs = options?.defaultTtlMs ?? DEFAULT_CACHE_TTL_MS;
  }

  /**
   * Retrieves an active neutral observation, updating its LRU position.
   * Returns a clean deep-clone to guarantee caller isolation.
   */
  get(key: string): NeutralObservationPayload | null {
    const entry = this.entries.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.entries.delete(key);
      this.currentBytes = Math.max(0, this.currentBytes - entry.byteSize);
      this.expirations++;
      this.misses++;
      return null;
    }

    // Refresh LRU order (delete & re-set places key at most recently used position)
    this.entries.delete(key);
    entry.lastAccessedAt = now;
    this.entries.set(key, entry);

    this.hits++;
    // Return deep clone to prevent callers from mutating cached neutral facts
    return JSON.parse(JSON.stringify(entry.payload));
  }

  /**
   * Stores a neutral observation payload with deterministic LRU eviction.
   */
  set(
    key: string,
    payload: NeutralObservationPayload,
    customTtlMs?: number
  ): boolean {
    const byteSize = estimateObservationBytes(payload);

    // If an individual entry exceeds the entire cache byte budget, reject it safely
    if (byteSize > this.maxBytes) {
      return false;
    }

    // Evict any existing entry under the same key
    const existing = this.entries.get(key);
    if (existing) {
      this.entries.delete(key);
      this.currentBytes = Math.max(0, this.currentBytes - existing.byteSize);
    }

    // Evict LRU entries until within entry and byte bounds
    while (
      (this.entries.size >= this.maxEntries || this.currentBytes + byteSize > this.maxBytes) &&
      this.entries.size > 0
    ) {
      const oldestKey = this.entries.keys().next().value;
      if (!oldestKey) break;

      const oldestEntry = this.entries.get(oldestKey);
      this.entries.delete(oldestKey);
      if (oldestEntry) {
        this.currentBytes = Math.max(0, this.currentBytes - oldestEntry.byteSize);
      }
      this.evictions++;
    }

    const now = Date.now();
    const ttl = typeof customTtlMs === 'number' ? customTtlMs : this.defaultTtlMs;
    const entry: CachedObservationEntry = {
      key,
      payload: JSON.parse(JSON.stringify(payload)),
      byteSize,
      cachedAt: now,
      lastAccessedAt: now,
      expiresAt: now + ttl
    };

    this.entries.set(key, entry);
    this.currentBytes += byteSize;
    return true;
  }

  /**
   * Deletes a specific cache key.
   */
  delete(key: string): boolean {
    const existing = this.entries.get(key);
    if (!existing) return false;

    this.entries.delete(key);
    this.currentBytes = Math.max(0, this.currentBytes - existing.byteSize);
    return true;
  }

  /**
   * Removes all expired entries from cache.
   */
  pruneExpired(): number {
    const now = Date.now();
    let pruned = 0;

    for (const [key, entry] of this.entries.entries()) {
      if (now > entry.expiresAt) {
        this.entries.delete(key);
        this.currentBytes = Math.max(0, this.currentBytes - entry.byteSize);
        this.expirations++;
        pruned++;
      }
    }

    return pruned;
  }

  /**
   * Completely clears all cached entries.
   */
  clear(): void {
    this.entries.clear();
    this.currentBytes = 0;
  }

  /**
   * Current number of entries in the cache.
   */
  size(): number {
    return this.entries.size;
  }

  /**
   * Current estimated byte consumption.
   */
  getBytes(): number {
    return this.currentBytes;
  }

  /**
   * Diagnostics stats.
   */
  getStats(): ObservationCacheStats {
    return {
      entries: this.entries.size,
      currentBytes: this.currentBytes,
      maxEntries: this.maxEntries,
      maxBytes: this.maxBytes,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      expirations: this.expirations
    };
  }
}
