/**
 * LeadNoria — Spreadsheet Clipboard & Copy All Domain
 * Pure, reusable domain type contracts for tabular spreadsheet clipboard projections.
 *
 * ARCHITECTURAL BOUNDARIES:
 * - Operates purely on structured in-memory data representations.
 * - ZERO DOM access, zero selector knowledge, zero scraping or browser orchestration.
 * - ZERO persistence coupling: transient projection for user-initiated copy operations only.
 * - Does NOT alter persistent Lead models or Google Data Firewall invariants.
 */

export interface ClipboardColumn {
  readonly key: string;
  readonly header: string;
}

export type ClipboardRow = Record<string, unknown>;

export interface TsvSerializerOptions {
  readonly includeHeader?: boolean;
  readonly lineDelimiter?: string;
  readonly columnDelimiter?: string;
}

export interface GoogleMapsClipboardRow extends ClipboardRow {
  readonly businessName: string;
  readonly googleMaps: string;
  readonly website: string;
  readonly rating: string;
  readonly phone: string;
  readonly facebook: string;
  readonly instagram: string;
  readonly otherSocial: string;
}

export interface MetaClipboardRow extends ClipboardRow {
  readonly facebookPageName: string;
  readonly facebookPage: string;
  readonly website: string;
}

export interface ClipboardWriteResult {
  readonly success: boolean;
  readonly error?: string;
}

export interface ClipboardWriterOptions {
  readonly clipboard?: {
    writeText: (text: string) => Promise<void>;
  };
}
