/**
 * LeadNoria — Phase 14: Unified Multi-Source Architecture
 * Multi-Source Run Model & Lifecycle State
 * 
 * Invariants:
 * - Source isolation: failures or blocks in one source do not erase successful results from another
 * - Multi-source run preserves per-source lifecycle status
 * - Explicit user source selection
 */

import {
  SourceType,
  GlobalRunStatus,
  SourceLifecycleStatus,
  PipelineStageId,
  StageCompleteness,
  ExecutionMode,
  PIPELINE_VERSION
} from './pipelineTypes.ts';
import { SourcePlan } from './sourcePlan.ts';

export interface MultiSourceRunConfig {
  runId: string;
  runVersion: string;
  selectedSources: SourceType[];
  sourcePlans: SourcePlan[];
  globalExecutionMode: ExecutionMode;
  globalLimits: {
    maxTotalCandidates: number;
    maxRunDurationMs: number;
    maxConcurrentSources: number;
  };
  metadata?: Record<string, string>;
}

export class MultiSourceRun {
  public readonly config: MultiSourceRunConfig;
  public status: GlobalRunStatus = 'PLANNED';
  public sourceStatuses: Map<SourceType, SourceLifecycleStatus> = new Map();
  public stageStates: Map<PipelineStageId, StageCompleteness> = new Map();
  public startedAt?: string;
  public completedAt?: string;
  public diagnostics: {
    warnings: string[];
    errors: string[];
    notes: string[];
  } = { warnings: [], errors: [], notes: [] };

  constructor(config: MultiSourceRunConfig) {
    this.config = config;
    for (const src of config.selectedSources) {
      this.sourceStatuses.set(src, 'PLANNED');
    }
  }

  public setSourceStatus(sourceType: SourceType, status: SourceLifecycleStatus): void {
    this.sourceStatuses.set(sourceType, status);
    this.recomputeGlobalStatus();
  }

  public getSourceStatus(sourceType: SourceType): SourceLifecycleStatus {
    return this.sourceStatuses.get(sourceType) || 'UNKNOWN';
  }

  public setStageState(stageId: PipelineStageId, state: StageCompleteness): void {
    this.stageStates.set(stageId, state);
  }

  public getStageState(stageId: PipelineStageId): StageCompleteness {
    return this.stageStates.get(stageId) || 'NOT_STARTED';
  }

  /**
   * Recomputes global run status from individual source statuses.
   * Enforces Source Isolation (Requirement 11 & 12).
   */
  public recomputeGlobalStatus(): GlobalRunStatus {
    const statuses = Array.from(this.sourceStatuses.values());
    if (statuses.length === 0) {
      this.status = 'PLANNED';
      return this.status;
    }

    const completed = statuses.filter(s => s === 'COMPLETED').length;
    const failed = statuses.filter(s => s === 'FAILED').length;
    const blocked = statuses.filter(s => s === 'BLOCKED').length;
    const contractOnly = statuses.filter(s => s === 'CONTRACT_ONLY' || s === 'SKIPPED').length;
    const running = statuses.filter(s => s === 'RUNNING').length;

    if (running > 0) {
      this.status = 'RUNNING';
    } else if (completed === statuses.length) {
      this.status = 'COMPLETED';
    } else if (failed === statuses.length) {
      this.status = 'FAILED';
    } else if (blocked === statuses.length) {
      this.status = 'BLOCKED';
    } else if ((completed > 0 || contractOnly > 0) && (contractOnly > 0 || blocked > 0) && failed === 0) {
      this.status = 'COMPLETED_WITH_WARNINGS';
    } else if (completed > 0 && failed > 0) {
      this.status = 'PARTIAL';
    } else if (statuses.every(s => s === 'PLANNED' || s === 'READY' || s === 'VALIDATED')) {
      this.status = 'READY';
    } else {
      this.status = 'PARTIAL';
    }

    return this.status;
  }
}
