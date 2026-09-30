/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Export Audit Tracker
 * 
 * Non-Negotiable Invariants:
 * - Persists audit trail of every export operation without leaking restricted values
 * - Tracks exact counts: selected, exported, excluded, and blocked fields
 * - Records schema, policy, and projection versions
 * - Binds content checksum for cryptographic verification
 */

import { ExportAuditRecord } from '../persistence/persistenceTypes.ts';
import { calculateChecksum } from '../persistence/integrity.ts';
import { CURRENT_EXPORT_POLICY_VERSION, CURRENT_EXPORT_PROJECTION_VERSION, ExportFormat } from './exportTypes.ts';

export function createExportAuditRecord(params: {
  runId: string;
  format: ExportFormat;
  selectedCount: number;
}): ExportAuditRecord {
  const timestamp = new Date().toISOString();
  const rawId = `${params.runId}_${params.format}_${timestamp}`;
  const exportId = `exp_${calculateChecksum(rawId).substring(0, 12)}`;

  return {
    exportId,
    runId: params.runId,
    schemaVersion: 1,
    projectionVersion: CURRENT_EXPORT_PROJECTION_VERSION,
    policyVersion: CURRENT_EXPORT_POLICY_VERSION,
    format: params.format,
    requestedAt: timestamp,
    selectedRecordCount: params.selectedCount,
    exportedRecordCount: 0,
    excludedRecordCount: 0,
    blockedFieldCount: 0,
    status: 'STARTED'
  };
}

export function finalizeExportAuditRecord(
  audit: ExportAuditRecord,
  results: {
    exportedCount: number;
    excludedCount: number;
    blockedFieldCount: number;
    serializedContent: string;
  }
): ExportAuditRecord {
  const checksum = calculateChecksum(results.serializedContent);
  return {
    ...audit,
    completedAt: new Date().toISOString(),
    exportedRecordCount: results.exportedCount,
    excludedRecordCount: results.excludedCount,
    blockedFieldCount: results.blockedFieldCount,
    checksum,
    status: 'COMPLETED'
  };
}

export function failExportAuditRecord(audit: ExportAuditRecord, reason: string): ExportAuditRecord {
  return {
    ...audit,
    completedAt: new Date().toISOString(),
    status: 'FAILED',
    failureReason: reason
  };
}
