/**
 * LeadNoria — Phase 14: Unified Multi-Source Architecture
 * Pipeline Error Model & Error Isolation
 * 
 * Non-Negotiable Invariants:
 * - Error isolation: source-specific failures remain isolated
 * - Policy blocks are marked non-retryable
 * - Internal secrets and stack traces are excluded from consumer error records
 */

import { SourceType, PipelineStageId, PipelineError, ErrorSeverity } from './pipelineTypes.ts';

export function createPipelineError(params: {
  errorCode: string;
  severity?: ErrorSeverity;
  sourceType?: SourceType;
  stageId?: PipelineStageId;
  candidateId?: string;
  retryable?: boolean;
  policyRelated?: boolean;
  message: string;
  causeCode?: string;
  diagnostics?: Record<string, unknown>;
}): PipelineError {
  return {
    errorCode: params.errorCode,
    severity: params.severity || 'ERROR',
    sourceType: params.sourceType,
    stageId: params.stageId,
    candidateId: params.candidateId,
    retryable: params.retryable ?? false,
    policyRelated: params.policyRelated ?? false,
    message: params.message,
    causeCode: params.causeCode,
    timestamp: new Date().toISOString(),
    diagnostics: params.diagnostics
  };
}

export function isFatalPipelineError(err: PipelineError): boolean {
  return err.severity === 'FATAL';
}

export function isRetryableError(err: PipelineError): boolean {
  // Policy-related errors and capability violations are NEVER retryable
  if (err.policyRelated) return false;
  return err.retryable;
}
