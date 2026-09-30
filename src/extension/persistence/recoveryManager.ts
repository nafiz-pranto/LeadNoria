/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Recovery Manager & Resumption Orchestrator
 * 
 * Non-Negotiable Invariants:
 * - Discovers incomplete or interrupted runs and determines resumable stages
 * - Never reruns already committed stages
 * - Validates schema, plan, and pipeline version compatibility before resumption
 * - Fully recoverable across Manifest V3 service worker suspensions
 */

import { CheckpointRecord, PersistenceError, RecoveryState, RunRecord } from './persistenceTypes.ts';
import { CheckpointStore } from './checkpointStore.ts';
import { StorageAdapter } from './storageAdapter.ts';
import { ORDERED_PIPELINE_STAGES, PipelineStageId, PIPELINE_VERSION } from '../pipeline/pipelineTypes.ts';

export interface ResumptionPlan {
  runId: string;
  checkpointId: string;
  runVersion: string;
  pipelineVersion: string;
  completedStages: PipelineStageId[];
  resumableStages: PipelineStageId[];
  candidateReferences: string[];
  entityReferences: string[];
  isResumable: boolean;
  blockReason?: string;
}

export class RecoveryManager {
  constructor(
    private adapter: StorageAdapter,
    private checkpointStore: CheckpointStore
  ) {}

  /**
   * Discovers all runs requiring recovery or available for resumption.
   */
  async discoverResumableRuns(): Promise<RunRecord[]> {
    return this.adapter.list<RunRecord>('runs', run => {
      return (
        run.recoveryState === 'RESUMABLE' ||
        run.recoveryState === 'INTERRUPTED' ||
        run.recoveryState === 'PAUSED' ||
        run.recoveryState === 'RECOVERY_REQUIRED' ||
        run.status === 'PARTIAL'
      );
    });
  }

  /**
   * Plans the safe resumption of a run based on its latest valid checkpoint.
   */
  async planResumption(runId: string): Promise<ResumptionPlan> {
    const run = await this.adapter.get<RunRecord>('runs', runId);
    if (!run) {
      throw new PersistenceError('RESOURCE_NOT_FOUND', `Cannot plan resumption: run '${runId}' not found`);
    }

    const checkpoint = await this.checkpointStore.getLatestValidCheckpoint(runId);
    if (!checkpoint) {
      return {
        runId,
        checkpointId: '',
        runVersion: run.runVersion,
        pipelineVersion: PIPELINE_VERSION,
        completedStages: run.completedStages || [],
        resumableStages: [],
        candidateReferences: [],
        entityReferences: [],
        isResumable: false,
        blockReason: 'No valid committed checkpoint found for run'
      };
    }

    // Verify pipeline version compatibility
    if (checkpoint.pipelineVersion !== PIPELINE_VERSION) {
      return {
        runId,
        checkpointId: checkpoint.checkpointId,
        runVersion: checkpoint.runVersion,
        pipelineVersion: checkpoint.pipelineVersion,
        completedStages: checkpoint.completedStages,
        resumableStages: [],
        candidateReferences: checkpoint.candidateReferences,
        entityReferences: checkpoint.entityReferences,
        isResumable: false,
        blockReason: `Incompatible pipelineVersion: checkpoint uses '${checkpoint.pipelineVersion}', runtime is '${PIPELINE_VERSION}'`
      };
    }

    // Determine unexecuted stages in strict topological order
    const completedSet = new Set(checkpoint.completedStages);
    const resumableStages = ORDERED_PIPELINE_STAGES.filter(stage => !completedSet.has(stage));

    return {
      runId,
      checkpointId: checkpoint.checkpointId,
      runVersion: checkpoint.runVersion,
      pipelineVersion: checkpoint.pipelineVersion,
      completedStages: [...checkpoint.completedStages],
      resumableStages,
      candidateReferences: [...checkpoint.candidateReferences],
      entityReferences: [...checkpoint.entityReferences],
      isResumable: true
    };
  }

  /**
   * Applies crash-recovery status transitions to a run interrupted during execution.
   */
  async handleInterruptedRun(runId: string, errorDescription?: string): Promise<RunRecord> {
    const run = await this.adapter.get<RunRecord>('runs', runId);
    if (!run) {
      throw new PersistenceError('RESOURCE_NOT_FOUND', `Run '${runId}' not found`);
    }

    const updated: RunRecord = {
      ...run,
      recoveryState: 'INTERRUPTED',
      status: 'PARTIAL',
      updatedAt: new Date().toISOString(),
      recordVersion: run.recordVersion + 1,
      diagnostics: {
        ...run.diagnostics,
        warnings: errorDescription ? [...run.diagnostics.warnings, errorDescription] : run.diagnostics.warnings
      }
    };

    await this.adapter.put('runs', runId, updated);
    return updated;
  }
}
