/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * RFC-4180 CSV Serializer with Spreadsheet Formula Injection Defense
 * 
 * Non-Negotiable Invariants:
 * - RFC-4180 compliance: proper comma, double-quote, and newline escaping
 * - Formula injection defense: neutralizes leading '=', '+', '-', '@', '\t', '\r'
 * - Deterministic column order and row order
 * - Zero prototype pollution or raw buffer corruption
 */

import { ExportRecordProjection } from './exportTypes.ts';

export const CSV_COLUMNS: Array<{ key: keyof ExportRecordProjection; header: string }> = [
  { key: 'businessName', header: 'Business Name' },
  { key: 'website', header: 'Website' },
  { key: 'phone', header: 'Phone' },
  { key: 'email', header: 'Email' },
  { key: 'streetAddress', header: 'Street Address' },
  { key: 'city', header: 'City' },
  { key: 'country', header: 'Country' },
  { key: 'category', header: 'Category' },
  { key: 'relevance', header: 'Relevance' },
  { key: 'qualificationStatus', header: 'Qualification' },
  { key: 'qualificationScore', header: 'Score' },
  { key: 'primarySource', header: 'Source' },
  { key: 'provenance', header: 'Provenance' }
];

export class CsvExporter {
  /**
   * Neutralizes formula injection vulnerabilities.
   * If a string starts with =, +, -, @, \t, or \r, prefix with a single quote.
   */
  sanitizeCellValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    let str = String(value);

    // Defense against Excel / Google Sheets formula injection
    const firstChar = str.charAt(0);
    if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@' || firstChar === '\t' || firstChar === '\r') {
      str = `'${str}`;
    }

    // RFC-4180 escaping: if field contains comma, quote, or newline, escape quotes and wrap in quotes
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      str = `"${str.replace(/"/g, '""')}"`;
    }

    return str;
  }

  /**
   * Serializes a list of projections into deterministic RFC-4180 CSV.
   */
  serialize(projections: ExportRecordProjection[], includeHeader = true): string {
    // Deterministic row ordering: sort by businessName then recordId
    const sorted = [...projections].sort((a, b) => {
      const nameCompare = a.businessName.localeCompare(b.businessName);
      if (nameCompare !== 0) return nameCompare;
      return a.recordId.localeCompare(b.recordId);
    });

    const lines: string[] = [];

    // Header row
    if (includeHeader) {
      const headerLine = CSV_COLUMNS.map(col => this.sanitizeCellValue(col.header)).join(',');
      lines.push(headerLine);
    }

    // Data rows
    for (const record of sorted) {
      const row = CSV_COLUMNS.map(col => {
        const val = record[col.key];
        return this.sanitizeCellValue(val);
      }).join(',');
      lines.push(row);
    }

    return lines.join('\r\n') + '\r\n';
  }
}
