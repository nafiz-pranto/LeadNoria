/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Export Types, Projections & Policy Contracts
 * 
 * Non-Negotiable Invariants:
 * - Export is a separate projection layer over persisted records
 * - Strict field-level policy evaluation: restricted fields excluded
 * - Google consumer-web fields are permanently blocked from export
 * - Formula injection defense for CSV
 * - Deterministic serialization across JSON and CSV
 */

import { ProvenanceType } from '../extraction/types.ts';
import { SourceType } from '../pipeline/pipelineTypes.ts';

export const CURRENT_EXPORT_PROJECTION_VERSION = 1;
export const CURRENT_EXPORT_POLICY_VERSION = '1.0.0';

export type ExportFormat = 'CSV' | 'JSON';

export type FieldExportDecision = 'EXPORT_ALLOWED' | 'EXPORT_REDACTED' | 'EXPORT_BLOCKED';

export interface FieldPolicyEvaluation {
  fieldName: string;
  decision: FieldExportDecision;
  reasonCode: string;
  sourceFamily: SourceType;
  provenance: ProvenanceType;
}

/**
 * Clean, sanitized projection of a research record eligible for user export.
 */
export interface ExportRecordProjection {
  recordId: string;
  businessName: string;
  website: string;
  phone: string;
  email: string;
  streetAddress: string;
  city: string;
  country: string;
  category: string;
  relevance: string;
  qualificationStatus: string;
  qualificationScore: string;
  primarySource: string;
  provenance: string;
  corroborationCount: number;
  exportedAt: string;
}

/**
 * Result of evaluating an entire record against the export firewall.
 */
export interface RecordExportEvaluation {
  recordId: string;
  isEligibleForExport: boolean;
  fieldEvaluations: FieldPolicyEvaluation[];
  projection: ExportRecordProjection | null;
  excludedFields: string[];
  blockedReason?: string;
}

/**
 * Options configuring an export run.
 */
export interface ExportOptions {
  runId: string;
  format: ExportFormat;
  recordIds?: string[]; // If specified, only these records
  includeHeaderRow?: boolean; // CSV only (default true)
  filenamePrefix?: string;
}

/**
 * The final generated export package.
 */
export interface ExportResult {
  exportId: string;
  runId: string;
  format: ExportFormat;
  filename: string;
  content: string;
  mimeType: string;
  selectedCount: number;
  exportedCount: number;
  excludedCount: number;
  blockedFieldCount: number;
  checksum: string;
  timestamp: string;
}
