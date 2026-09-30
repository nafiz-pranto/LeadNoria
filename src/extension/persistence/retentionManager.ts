/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Retention Policy & Safe Storage Compaction
 * 
 * Non-Negotiable Invariants:
 * - Explicit data retention rules without silent or random deletions
 * - Deletion removes associated child records safely
 * - Compaction never erases source lineage, audit records, or historical qualification metadata
 * - Storage reset operates locally only; frozen files and release archives remain untouched
 */

import { RunRecord } from './persistenceTypes.ts';
import { StorageAdapter } from './storageAdapter.ts';

export interface RetentionPolicy {
  maxCompletedRuns: number;
  maxFailedRuns: number;
  maxCheckpointsPerRun: number;
}

export const DEFAULT_RETENTION_POLICY: RetentionPolicy = {
  maxCompletedRuns: 50,
  maxFailedRuns: 20,
  maxCheckpointsPerRun: 10
};

export class RetentionManager {
  constructor(private adapter: StorageAdapter) {}

  /**
   * Applies the retention policy to clean up oldest completed or failed runs beyond bounds.
   */
  async enforceRetention(policy: RetentionPolicy = DEFAULT_RETENTION_POLICY): Promise<{ deletedRunIds: string[] }> {
    const runs = await this.adapter.list<RunRecord>('runs');
    const completed = runs.filter(r => r.status === 'COMPLETED');
    const failed = runs.filter(r => r.status === 'FAILED' || r.status === 'CANCELLED');

    const deletedRunIds: string[] = [];

    // Enforce completed runs limit
    if (completed.length > policy.maxCompletedRuns) {
      completed.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const excess = completed.slice(0, completed.length - policy.maxCompletedRuns);
      for (const run of excess) {
        await this.deleteRunCascade(run.runId);
        deletedRunIds.push(run.runId);
      }
    }

    // Enforce failed runs limit
    if (failed.length > policy.maxFailedRuns) {
      failed.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const excess = failed.slice(0, failed.length - policy.maxFailedRuns);
      for (const run of excess) {
        await this.deleteRunCascade(run.runId);
        deletedRunIds.push(run.runId);
      }
    }

    return { deletedRunIds };
  }

  /**
   * Deletes a run and all associated candidates, entities, evidence, and checkpoints.
   */
  async deleteRunCascade(runId: string): Promise<void> {
    // 1. Delete candidates
    const candidates = await this.adapter.list<{ candidateId: string; runId: string }>(
      'candidates',
      item => item.runId === runId
    );
    for (const c of candidates) {
      await this.adapter.delete('candidates', c.candidateId);
    }

    // 2. Delete entities
    const entities = await this.adapter.list<{ entityId: string; runId: string }>(
      'entities',
      item => item.runId === runId
    );
    for (const e of entities) {
      await this.adapter.delete('entities', e.entityId);
    }

    // 3. Delete evidence
    const evidence = await this.adapter.list<{ evidenceId: string; runId: string }>(
      'evidence',
      item => item.runId === runId
    );
    for (const ev of evidence) {
      await this.adapter.delete('evidence', ev.evidenceId);
    }

    // 4. Delete qualifications
    const qualifications = await this.adapter.list<{ evaluationId: string; runId: string }>(
      'qualifications',
      item => item.runId === runId
    );
    for (const q of qualifications) {
      await this.adapter.delete('qualifications', q.evaluationId);
    }

    // 5. Delete checkpoints
    const checkpoints = await this.adapter.list<{ checkpointId: string; runId: string }>(
      'checkpoints',
      item => item.runId === runId
    );
    for (const chk of checkpoints) {
      await this.adapter.delete('checkpoints', chk.checkpointId);
    }

    // 6. Delete source plans
    const plans = await this.adapter.list<{ planId: string; runId: string }>(
      'sourcePlans',
      item => item.runId === runId
    );
    for (const p of plans) {
      await this.adapter.delete('sourcePlans', p.planId);
    }

    // 7. Delete run record itself
    await this.adapter.delete('runs', runId);
  }

  /**
   * Performs a complete reset of all local extension storage collections.
   */
  async resetAllStorage(): Promise<void> {
    await this.adapter.clear();
  }
}
