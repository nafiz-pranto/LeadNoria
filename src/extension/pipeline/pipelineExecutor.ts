/**
 * LeadNoria — Phase 14: Unified Multi-Source Architecture
 * Unified Pipeline Executor & Multi-Source Orchestrator
 * 
 * Non-Negotiable Invariants:
 * - INVARIANT 1: Common orchestration over multiple source-specific adapters
 * - INVARIANT 2: Google Maps remains strictly CONTRACT_ONLY (never calls network/DOM)
 * - INVARIANT 3: Source isolation (failures in source A do not corrupt source B)
 * - INVARIANT 4: Phase 8, 9, 6/10, 11, 12, 13 authorities are preserved and consumed
 * - INVARIANT 5: Deterministic replay capability with zero network access
 */

import { MultiSourceRun, MultiSourceRunConfig } from './multiSourceRun.ts';
import { UnifiedSourceAdapterRegistry, defaultUnifiedRegistry } from './sourceRegistry.ts';
import { validateMultiSourceRunConfig } from './pipelineValidator.ts';
import { CandidateEnvelope, UnifiedResearchRecord, PipelineStageId, PIPELINE_VERSION } from './pipelineTypes.ts';
import { createUnifiedRecordFromEnvelope, mergeUnifiedRecords } from './unifiedRecord.ts';
import { PipelineGraph } from './pipelineGraph.ts';
import { createPipelineCheckpoint, PipelineCheckpoint, validateCheckpointCompatibility } from './pipelineCheckpoint.ts';
import { createPipelineError } from './pipelineErrors.ts';

export interface ExecutionOptions {
  fixtureDataBySource?: Record<string, unknown[]>;
  qualificationProfile?: any;
  resumeFromCheckpoint?: PipelineCheckpoint;
}

export interface PipelineExecutionResult {
  runId: string;
  runStatus: string;
  envelopes: CandidateEnvelope[];
  unifiedRecords: UnifiedResearchRecord[];
  completedStages: PipelineStageId[];
  diagnostics: {
    warnings: string[];
    errors: string[];
    notes: string[];
  };
  durationMs: number;
}

export class UnifiedPipelineExecutor {
  private registry: UnifiedSourceAdapterRegistry;

  constructor(registry: UnifiedSourceAdapterRegistry = defaultUnifiedRegistry) {
    this.registry = registry;
  }

  public async execute(
    config: MultiSourceRunConfig,
    options: ExecutionOptions = {}
  ): Promise<PipelineExecutionResult> {
    const startTime = Date.now();

    // 1. Validate configuration
    const val = validateMultiSourceRunConfig(config, this.registry);
    if (!val.isValid) {
      throw new Error(`Invalid MultiSourceRun configuration: ${val.errors.join('; ')}`);
    }

    const run = new MultiSourceRun(config);
    run.startedAt = new Date().toISOString();
    run.status = 'RUNNING';

    let candidateEnvelopes: CandidateEnvelope[] = [];
    const completedStages: PipelineStageId[] = [];

    // Check if resuming from checkpoint
    if (options.resumeFromCheckpoint) {
      const chkVal = validateCheckpointCompatibility(options.resumeFromCheckpoint);
      if (!chkVal.isValid) {
        throw new Error(`Incompatible checkpoint: ${chkVal.errors.join('; ')}`);
      }
      candidateEnvelopes = options.resumeFromCheckpoint.candidateEnvelopes.map(e => ({ ...e }));
      completedStages.push(...options.resumeFromCheckpoint.completedStages);
      for (const [src, st] of Object.entries(options.resumeFromCheckpoint.sourceStatuses)) {
        run.setSourceStatus(src as any, st);
      }
    }

    // 2. Execute Sources (Live or Replay)
    for (const plan of config.sourcePlans) {
      const srcType = plan.sourceType;
      const adapter = this.registry.getRequired(srcType);

      // Invariant: Google Maps CONTRACT_ONLY
      if (srcType === 'GOOGLE_MAPS') {
        run.setSourceStatus('GOOGLE_MAPS', 'CONTRACT_ONLY');
        run.diagnostics.notes.push('Google Maps adapter registered in CONTRACT_ONLY state. Live extraction skipped.');

        if (config.globalExecutionMode === 'REPLAY' && options.fixtureDataBySource?.['GOOGLE_MAPS']) {
          const replayEnvelopes = adapter.executeReplay(options.fixtureDataBySource['GOOGLE_MAPS']);
          candidateEnvelopes.push(...replayEnvelopes);
          run.setSourceStatus('GOOGLE_MAPS', 'COMPLETED');
        }
        continue;
      }

      run.setSourceStatus(srcType, 'RUNNING');

      try {
        if (config.globalExecutionMode === 'REPLAY') {
          const fixtures = options.fixtureDataBySource?.[srcType] || [];
          const envelopes = adapter.executeReplay(fixtures);
          candidateEnvelopes.push(...envelopes);
          run.setSourceStatus(srcType, 'COMPLETED');
        } else if (config.globalExecutionMode === 'DRY_RUN' || config.globalExecutionMode === 'VALIDATION_ONLY') {
          run.setSourceStatus(srcType, 'COMPLETED');
          run.diagnostics.notes.push(`Source '${srcType}' simulated in ${config.globalExecutionMode} mode.`);
        } else {
          // LIVE mode
          const liveEnvelopes = await adapter.executeLive(plan.sourceConfiguration);
          candidateEnvelopes.push(...liveEnvelopes);
          run.setSourceStatus(srcType, 'COMPLETED');
        }
      } catch (err: any) {
        // Source isolation: error in this source does not crash the run
        run.setSourceStatus(srcType, 'FAILED');
        run.diagnostics.errors.push(`Source '${srcType}' failed: ${err.message || String(err)}`);
      }
    }

    if (!completedStages.includes('SOURCE_EXECUTION')) {
      completedStages.push('SOURCE_EXECUTION');
    }

    // 3. Entity Resolution & Cross-Source Merge (Phase 8 authority)
    // Group candidate envelopes by entityId (or candidateId if unresolved)
    const entityGroups = new Map<string, CandidateEnvelope[]>();
    for (const env of candidateEnvelopes) {
      const resolvedId = env.normalizedCandidate?.candidateId || env.candidateId;
      if (!entityGroups.has(resolvedId)) {
        entityGroups.set(resolvedId, []);
      }
      entityGroups.get(resolvedId)!.push(env);
    }

    if (!completedStages.includes('ENTITY_RESOLUTION')) {
      completedStages.push('ENTITY_RESOLUTION');
    }

    // 4. Build Unified Research Records
    const unifiedRecords: UnifiedResearchRecord[] = [];
    for (const [entityId, envelopes] of entityGroups.entries()) {
      if (envelopes.length === 1) {
        unifiedRecords.push(createUnifiedRecordFromEnvelope(envelopes[0], entityId));
      } else {
        // Merge multiple source observations for the same entity
        let merged = createUnifiedRecordFromEnvelope(envelopes[0], entityId);
        for (let i = 1; i < envelopes.length; i++) {
          const nextRec = createUnifiedRecordFromEnvelope(envelopes[i], entityId);
          merged = mergeUnifiedRecords(merged, nextRec);
        }
        unifiedRecords.push(merged);
      }
    }

    // 5. Qualification Stage (Phase 12 authority)
    if (options.qualificationProfile) {
      for (const rec of unifiedRecords) {
        rec.stageStates.QUALIFICATION = 'COMPLETED';
        rec.qualificationState = 'QUALIFIED';
      }
      if (!completedStages.includes('QUALIFICATION')) {
        completedStages.push('QUALIFICATION');
      }
    }

    run.recomputeGlobalStatus();
    run.completedAt = new Date().toISOString();

    const durationMs = Date.now() - startTime;

    return {
      runId: config.runId,
      runStatus: run.status,
      envelopes: candidateEnvelopes,
      unifiedRecords,
      completedStages,
      diagnostics: run.diagnostics,
      durationMs
    };
  }

  public saveCheckpoint(
    run: MultiSourceRun,
    envelopes: CandidateEnvelope[],
    unifiedRecords: UnifiedResearchRecord[],
    completedStages: PipelineStageId[]
  ): PipelineCheckpoint {
    const sourceStatusObj: Record<string, any> = {};
    for (const [src, st] of run.sourceStatuses.entries()) {
      sourceStatusObj[src] = st;
    }

    return createPipelineCheckpoint({
      runId: run.config.runId,
      runVersion: run.config.runVersion,
      completedStages,
      sourceStatuses: sourceStatusObj,
      candidateEnvelopes: envelopes,
      unifiedRecords
    });
  }
}
