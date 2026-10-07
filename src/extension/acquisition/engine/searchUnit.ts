/**
 * LeadNoria — Google Maps Search Unit Abstraction
 * Deterministic Query Normalization, Identification, and Planning
 *
 * Invariants:
 * - Deterministic SearchUnit ID derived from normalized keyword + location.
 * - Whitespace normalization without destroying meaningful location tokens.
 * - Detects and suppresses duplicate search requests before execution.
 * - URL generation uses standard browser navigation format: /maps/search/...
 */

import type {
  GoogleMapsSearchUnit,
  GoogleMapsSearchUnitInput,
  SearchUnitStatus
} from './types.ts';

/**
 * Deterministic hash function (fnv1a 32-bit x 2 for 64-bit hex)
 * Pure, portable, zero dependency.
 */
export function hashStringDeterministic(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = (h1 ^ c) * 0x01000193;
    h2 = (h2 ^ (c >> 1)) * 0x01000193;
    h1 = h1 >>> 0;
    h2 = h2 >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

/**
 * Normalizes user keyword input:
 * - Strips leading/trailing whitespace
 * - Collapses repeated internal whitespace
 * - Strips illegal control chars
 * - Rejects empty strings
 */
export function normalizeKeyword(raw: string): string {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Keyword must be a non-empty string');
  }
  const cleaned = raw
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length === 0) {
    throw new Error('Keyword cannot be empty or pure whitespace');
  }
  return cleaned;
}

/**
 * Normalizes location input:
 * - Preserves meaningful location tokens (commas, districts, country prefixes)
 * - Collapses redundant whitespace
 * - Returns undefined if location was empty or not specified
 */
export function normalizeLocation(raw?: string): string | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  const cleaned = raw
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Constructs the deterministic Search Unit ID from normalized tokens.
 * Stable across sessions, restarts, and processes.
 */
export function deriveSearchUnitId(normKeyword: string, normLocation?: string): string {
  const composite = `${normKeyword.toLowerCase()}::${(normLocation || '').toLowerCase()}`;
  const hash = hashStringDeterministic(composite);
  return `gsu_${hash}`;
}

/**
 * Generates the standard Google Maps browser search URL.
 */
export function buildMapsSearchUrl(query: string): string {
  const bounded = (query || '').slice(0, 500);
  return `https://www.google.com/maps/search/${encodeURIComponent(bounded)}`;
}

/**
 * Factory for creating a deterministic GoogleMapsSearchUnit.
 */
export function createSearchUnit(input: GoogleMapsSearchUnitInput): GoogleMapsSearchUnit {
  const normKeyword = normalizeKeyword(input.keyword);
  const normLocation = normalizeLocation(input.location);

  const normalizedQuery = input.customQuery
    ? input.customQuery.trim()
    : normLocation
    ? `${normKeyword} ${normLocation}`
    : normKeyword;

  const searchUnitId = deriveSearchUnitId(normKeyword, normLocation);
  const navigationUrl = buildMapsSearchUrl(normalizedQuery);
  const now = new Date().toISOString();

  return {
    searchUnitId,
    rawKeyword: input.keyword,
    normalizedKeyword: normKeyword,
    rawLocation: input.location,
    normalizedLocation: normLocation,
    normalizedQuery,
    navigationUrl,
    status: 'PLANNED',
    createdAt: now,
    candidateCount: 0,
    retryCount: 0,
    maxRetries: input.maxRetries ?? 2,
    diagnostics: []
  };
}

/**
 * Bulk generator: creates the Cartesian product of keywords x locations
 * with deterministic deduplication.
 */
export function planSearchUnits(
  keywords: string[],
  locations: string[] = []
): { searchUnits: GoogleMapsSearchUnit[]; duplicatesSuppressed: number } {
  const validKeywords = keywords
    .map(k => {
      try {
        return normalizeKeyword(k);
      } catch {
        return null;
      }
    })
    .filter((k): k is string => k !== null);

  // Deduplicate keywords by case-insensitive key
  const uniqueKeywords = Array.from(
    new Map(validKeywords.map(k => [k.toLowerCase(), k])).values()
  );

  // Track duplicates removed during keyword deduplication
  let duplicatesSuppressed = validKeywords.length - uniqueKeywords.length;

  const locs = locations.length > 0 ? locations : [undefined];
  const seenIds = new Set<string>();
  const units: GoogleMapsSearchUnit[] = [];

  for (const kw of uniqueKeywords) {
    for (const loc of locs) {
      const normLoc = normalizeLocation(loc);
      const id = deriveSearchUnitId(kw, normLoc);
      if (seenIds.has(id)) {
        duplicatesSuppressed++;
        continue;
      }
      seenIds.add(id);
      units.push(createSearchUnit({ keyword: kw, location: normLoc }));
    }
  }

  return { searchUnits: units, duplicatesSuppressed };
}
