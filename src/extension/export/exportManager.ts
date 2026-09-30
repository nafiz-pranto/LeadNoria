/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Export Orchestrator & Manager
 * 
 * Non-Negotiable Invariants:
 * - Immutable selection snapshot captured before export processing
 * - Evaluates every record against the field-level export firewall
 * - Serializes using deterministic RFC-4180 CSV or deterministic JSON
 * - Records durable export audit without storing restricted values
 * - Complete idempotency and failure recovery
 */

import { UnifiedResearchRecord } from '../pipeline/pipelineTypes.ts';
import { PersistenceRepository } from '../persistence/persistenceRepository.ts';
import { ExportOptions, ExportRecordProjection, ExportResult } from './exportTypes.ts';
import { ExportPolicy } from './exportPolicy.ts';
import { ExportProjection } from './exportProjection.ts';
import { CsvExporter } from './csvExporter.ts';
import { JsonExporter } from './jsonExporter.ts';
import { createExportAuditRecord, finalizeExportAuditRecord, failExportAuditRecord } from './exportAudit.ts';
import { ExportIntegrity } from './exportIntegrity.ts';
import { PersistenceError } from '../persistence/persistenceTypes.ts';
import { calculateChecksum } from '../persistence/integrity.ts';

export class ExportManager {
  private policy: ExportPolicy;
  private projection: ExportProjection;
  private csvExporter: CsvExporter;
  private jsonExporter: JsonExporter;

  constructor(private repository: PersistenceRepository) {
    this.policy = new ExportPolicy();
    this.projection = new ExportProjection();
    this.csvExporter = new CsvExporter();
    this.jsonExporter = new JsonExporter();
  }

  /**
   * Executes an export against a set of UnifiedResearchRecords or by runId.
   */
  async exportRecords(records: UnifiedResearchRecord[], options: ExportOptions): Promise<ExportResult> {
    // 1. Capture immutable selection snapshot
    const snapshot: UnifiedResearchRecord[] = records
      .filter(r => !options.recordIds || options.recordIds.includes(r.recordId))
      .map(r => JSON.parse(JSON.stringify(r)));

    // 2. Start audit record
    let audit = createExportAuditRecord({
      runId: options.runId,
      format: options.format,
      selectedCount: snapshot.length
    });
    await this.repository.saveExportAudit(audit);

    try {
      const projections: ExportRecordProjection[] = [];
      let excludedCount = 0;
      let blockedFieldCount = 0;

      // 3. Process each record through the policy firewall and projection
      for (const record of snapshot) {
        const evaluation = this.policy.evaluateRecord(record);
        blockedFieldCount += evaluation.excludedFields.length;

        if (!evaluation.isEligibleForExport) {
          excludedCount++;
          continue;
        }

        const proj = this.projection.projectRecord(record, evaluation);
        if (proj) {
          projections.push(proj);
        } else {
          excludedCount++;
        }
      }

      // 4. Serialize to chosen format
      let content = '';
      let mimeType = '';

      if (options.format === 'CSV') {
        content = this.csvExporter.serialize(projections, options.includeHeaderRow ?? true);
        mimeType = 'text/csv;charset=utf-8;';
      } else {
        content = this.jsonExporter.serialize(projections, true);
        mimeType = 'application/json;charset=utf-8;';
      }

      // 5. Finalize audit record
      audit = finalizeExportAuditRecord(audit, {
        exportedCount: projections.length,
        excludedCount,
        blockedFieldCount,
        serializedContent: content
      });
      await this.repository.saveExportAudit(audit);

      // 6. Generate safe filename
      const filename = ExportIntegrity.generateFilename(options.runId, options.format, options.filenamePrefix);

      return {
        exportId: audit.exportId,
        runId: options.runId,
        format: options.format,
        filename,
        content,
        mimeType,
        selectedCount: snapshot.length,
        exportedCount: projections.length,
        excludedCount,
        blockedFieldCount,
        checksum: audit.checksum || calculateChecksum(content),
        timestamp: audit.completedAt || new Date().toISOString()
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      audit = failExportAuditRecord(audit, errorMsg);
      await this.repository.saveExportAudit(audit);
      throw new PersistenceError('EXPORT_POLICY_BLOCKED', `Export failed: ${errorMsg}`);
    }
  }
}
