/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Deterministic JSON Exporter
 * 
 * Non-Negotiable Invariants:
 * - Deterministic JSON output with sorted property keys
 * - Stable row ordering
 * - Excludes internal prototype properties and prohibited fields
 * - Valid JSON formatting suitable for programmatic consumption
 */

import { ExportRecordProjection } from './exportTypes.ts';
import { canonicalJsonStringify } from '../persistence/integrity.ts';

export class JsonExporter {
  /**
   * Serializes a list of projections into formatted, deterministic JSON.
   */
  serialize(projections: ExportRecordProjection[], pretty = true, exportedAt?: string): string {
    // Deterministic row ordering
    const sorted = [...projections].sort((a, b) => {
      const nameCompare = a.businessName.localeCompare(b.businessName);
      if (nameCompare !== 0) return nameCompare;
      return a.recordId.localeCompare(b.recordId);
    });

    const exportEnvelope = {
      product: 'LeadNoria',
      version: '1.0.0',
      exportedAt: exportedAt || projections[0]?.exportedAt || new Date().toISOString(),
      recordCount: sorted.length,
      records: sorted
    };

    if (pretty) {
      // Re-parse canonical stringification to apply stable indentation
      const canonical = canonicalJsonStringify(exportEnvelope);
      return JSON.stringify(JSON.parse(canonical), null, 2);
    }

    return canonicalJsonStringify(exportEnvelope);
  }
}
