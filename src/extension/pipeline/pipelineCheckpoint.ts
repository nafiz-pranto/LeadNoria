/**
 * LeadNoria — Phase 14: Unified Multi-Source Architecture
 * Pipeline Checkpoint & Recovery State
 * 
 * Non-Negotiable Invariants:
 * - Version compatibility validation upon restoration
 * - Preserves complete stage and source lifecycle state
 * - Resumes without duplicating completed stages
 */

import { createHash } from 'node:crypto';
import {
  SourceType,
  PipelineStageId,
  SourceLifecycleStatus,
  CandidateEnvelope,
  UnifiedResearchRecord,
  PIPELINE_VERSION
} from './pipelineTypes.ts';

export interface PipelineCheckpoint {
  checkpointId: string;
  runId: string;
  runVersion: string;
  pipelineVersion: string;
  completedStages: PipelineStageId[];
  sourceStatuses: Record<string, SourceLifecycleStatus>;
  candidateEnvelopes: CandidateEnvelope[];
  unifiedRecords: UnifiedResearchRecord[];
  timestamp: string;
}

export function createPipelineCheckpoint(params: {
  runId: string;
  runVersion: string;
  completedStages: PipelineStageId[];
  sourceStatuses: Record<string, SourceLifecycleStatus>;
  candidateEnvelopes: CandidateEnvelope[];
  unifiedRecords: UnifiedResearchRecord[];
}): PipelineCheckpoint {
  const timestamp = new Date().toISOString();
  const hash = createHash('sha256')
    .update(`${params.runId}::${params.completedStages.join(',')}::${timestamp}`)
    .digest('hex')
    .substring(0, 12);

  return {
    checkpointId: `chk_${hash}`,
    runId: params.runId,
    runVersion: params.runVersion,
    pipelineVersion: PIPELINE_VERSION,
    completedStages: [...params.completedStages],
    sourceStatuses: { ...params.sourceStatuses },
    candidateEnvelopes: params.candidateEnvelopes.map(e => ({ ...e })),
    unifiedRecords: params.unifiedRecords.map(r => ({ ...r })),
    timestamp
  };
}

export function validateCheckpointCompatibility(checkpoint: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!checkpoint || typeof checkpoint !== 'object') {
    return { isValid: false, errors: ['Checkpoint must be an object'] };
  }

  const c = checkpoint as Partial<PipelineCheckpoint>;

  if (!c.checkpointId || typeof c.checkpointId !== 'string') {
    errors.push('Missing checkpointId');
  }
  if (!c.runId || typeof c.runId !== 'string') {
    errors.push('Missing runId');
  }
  if (!c.pipelineVersion || c.pipelineVersion !== PIPELINE_VERSION) {
    errors.push(`Incompatible pipelineVersion: expected '${PIPELINE_VERSION}', got '${c.pipelineVersion}'`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
