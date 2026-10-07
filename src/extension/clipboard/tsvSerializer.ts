/**
 * LeadNoria — Spreadsheet Clipboard & Copy All Domain
 * Generic TSV (Tab-Separated Values) Serializer
 *
 * HARD INVARIANTS:
 * - Deterministic column ordering strictly following supplied ClipboardColumn definitions.
 * - Primary delimiter is \t (horizontal tab); row delimiter is \n (newline).
 * - Safe cell normalization:
 *     null       -> ""
 *     undefined  -> ""
 *     string     -> sanitized single-line string
 *     number     -> deterministic decimal string
 *     boolean    -> "true" / "false"
 *     [object]   -> "" (never "[object Object]")
 * - Tab / Newline safety:
 *     Embedded \r\n, \r, and \n are normalized to a single space " ".
 *     Embedded \t is replaced with space " ".
 *     Meaningful text characters are strictly preserved.
 */

import type { ClipboardColumn, ClipboardRow, TsvSerializerOptions } from './types.ts';

/**
 * Normalizes a cell value safely into a TSV-safe string.
 */
export function sanitizeCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str: string;
  if (typeof value === 'string') {
    str = value;
  } else if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return '';
    }
    str = String(value);
  } else if (typeof value === 'boolean') {
    str = value ? 'true' : 'false';
  } else {
    // Non-primitive values (objects, arrays, symbols, functions)
    // Never output accidental "[object Object]"
    return '';
  }

  // 1. Normalize embedded CRLF, CR, LF sequences into single space
  str = str.replace(/\r\n|\r|\n/g, ' ');

  // 2. Normalize embedded tabs into single space
  str = str.replace(/\t/g, ' ');

  return str;
}

/**
 * Serializes structured tabular records into deterministic TSV text.
 */
export function serializeToTsv(
  columns: readonly ClipboardColumn[],
  rows: readonly ClipboardRow[],
  options?: TsvSerializerOptions
): string {
  const colDelimiter = options?.columnDelimiter ?? '\t';
  const rowDelimiter = options?.lineDelimiter ?? '\n';
  const includeHeader = options?.includeHeader ?? true;

  const lines: string[] = [];

  // 1. Header row
  if (includeHeader && columns.length > 0) {
    const headerLine = columns
      .map(col => sanitizeCellValue(col.header))
      .join(colDelimiter);
    lines.push(headerLine);
  }

  // 2. Data rows
  for (const row of rows) {
    const rowValues = columns.map(col => {
      const rawVal = row ? row[col.key] : undefined;
      return sanitizeCellValue(rawVal);
    });
    lines.push(rowValues.join(colDelimiter));
  }

  return lines.join(rowDelimiter);
}
