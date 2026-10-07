/**
 * LeadNoria — Spreadsheet Clipboard & Copy All Domain
 * Meta Ad Library Research Results Clipboard Projection
 *
 * HARD INVARIANTS:
 * - Exact 3-column spreadsheet projection:
 *     1. Facebook Page Name
 *     2. Facebook Page
 *     3. Website
 * - Website rule: YES, NO, or blank for unknown (never silently converted to NO).
 * - ZERO ad copy, advertiser ID, spend, impressions, creative data, targeting, or dates.
 * - ZERO DOM access, zero selector knowledge, zero scraping or browser automation.
 */

import type { ClipboardColumn, MetaClipboardRow, TsvSerializerOptions } from './types.ts';
import { serializeToTsv } from './tsvSerializer.ts';

export const META_CLIPBOARD_COLUMNS: readonly ClipboardColumn[] = Object.freeze([
  { key: 'facebookPageName', header: 'Facebook Page Name' },
  { key: 'facebookPage', header: 'Facebook Page' },
  { key: 'website', header: 'Website' }
]);

/**
 * Extracts website state for Meta Ad Library result.
 * Produces "YES", "NO", or "" for unknown (never silently converted to "NO").
 */
function extractMetaWebsiteState(item: Record<string, unknown>): string {
  // 1. Explicit website state string ('YES' | 'NO' | 'UNKNOWN')
  const web = item.website;
  if (web === 'YES') return 'YES';
  if (web === 'NO') return 'NO';
  if (web === 'UNKNOWN') return '';

  // 2. ExtensionLead websiteState ('found' | 'not_found' | 'unknown')
  const ws = item.websiteState;
  if (ws === 'found') return 'YES';
  if (ws === 'not_found') return 'NO';
  if (ws === 'unknown') return '';

  // 3. Destination URL, Website URL or Domain signal
  if (typeof item.websiteUrl === 'string' && item.websiteUrl.trim().length > 0) {
    return 'YES';
  }
  if (typeof item.destinationUrl === 'string' && item.destinationUrl.trim().length > 0) {
    return 'YES';
  }
  if (typeof item.destinationDomain === 'string' && item.destinationDomain.trim().length > 0) {
    return 'YES';
  }

  // 4. Fallback unknown
  return '';
}

/**
 * Maps a single Meta Ad Library result into a structured spreadsheet clipboard row.
 */
export function metaResultToClipboardRow(result: unknown): MetaClipboardRow {
  if (!result || typeof result !== 'object') {
    return Object.freeze({
      facebookPageName: '',
      facebookPage: '',
      website: ''
    });
  }

  const item = result as Record<string, unknown>;

  // 1. Facebook Page Name
  const facebookPageName =
    (typeof item.displayName === 'string' && item.displayName.trim()) ||
    (typeof item.facebookPageName === 'string' && item.facebookPageName.trim()) ||
    (typeof item.advertiserName === 'string' && item.advertiserName.trim()) ||
    (typeof item.pageName === 'string' && item.pageName.trim()) ||
    (typeof item.name === 'string' && item.name.trim()) ||
    (typeof item.canonicalName === 'string' && item.canonicalName.trim()) ||
    '';

  // 2. Facebook Page URL
  const facebookPage =
    (typeof item.facebookPageUrl === 'string' && item.facebookPageUrl.trim()) ||
    (typeof item.facebookPage === 'string' && item.facebookPage.trim()) ||
    (typeof item.adLibraryUrl === 'string' && item.adLibraryUrl.trim()) ||
    '';

  // 3. Website
  const website = extractMetaWebsiteState(item);

  return Object.freeze({
    facebookPageName,
    facebookPage,
    website
  });
}

/**
 * Maps an array of Meta Ad Library results into structured clipboard rows.
 */
export function metaResultsToClipboardRows(
  results: readonly unknown[]
): MetaClipboardRow[] {
  if (!Array.isArray(results)) {
    return [];
  }
  return results.map(metaResultToClipboardRow);
}

/**
 * Projects Meta Ad Library research results directly into TSV spreadsheet text.
 */
export function metaResultsToTsv(
  results: readonly unknown[],
  options?: TsvSerializerOptions
): string {
  const rows = metaResultsToClipboardRows(results);
  return serializeToTsv(META_CLIPBOARD_COLUMNS, rows, options);
}
