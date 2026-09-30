/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Primary Persistence Repository
 * 
 * Non-Negotiable Invariants:
 * - Typed repository interface over isolated storage collections
 * - Optimistic versioning with explicit conflict handling (VERSION_CONFLICT)
 * - Idempotent write operations (duplicate writes converge deterministically)
 * - Strict schema validation on read and write
 * - Field-level provenance and restriction preservation across persistence lifecycle
 */

import {
  CandidateRecord,
  CheckpointRecord,
  EntityRecord,
  EvidenceRecord,
  ExportAuditRecord,
  PersistenceError,
  QualificationRecord,
  ReferentialIntegrityReport,
  RunRecord,
  SourcePlanRecord,
  StorageStats
} from './persistenceTypes.ts';
import { StorageAdapter, MemoryStorageAdapter } from './storageAdapter.ts';
import { validateRecordForWrite, validateRecordOnRead } from './recordValidator.ts';
import { CheckpointStore } from './checkpointStore.ts';
import { RecoveryManager } from './recoveryManager.ts';
import { RetentionManager } from './retentionManager.ts';
import { StorageDiagnostics } from './storageDiagnostics.ts';

export class PersistenceRepository {
  readonly checkpointStore: CheckpointStore;
  readonly recoveryManager: RecoveryManager;
  readonly retentionManager: RetentionManager;
  readonly diagnostics: StorageDiagnostics;

  constructor(private adapter: StorageAdapter = new MemoryStorageAdapter()) {
    this.checkpointStore = new CheckpointStore(this.adapter);
    this.recoveryManager = new RecoveryManager(this.adapter, this.checkpointStore);
    this.retentionManager = new RetentionManager(this.adapter);
    this.diagnostics = new StorageDiagnostics(this.adapter);
  }

  // ==========================================
  // RUN OPERATIONS
  // ==========================================

  async createRun(run: RunRecord): Promise<RunRecord> {
    validateRecordForWrite('run', run);
    const existing = await this.adapter.get<RunRecord>('runs', run.runId);
    if (existing) {
      // Idempotent: if identical, return existing
      if (existing.configFingerprint === run.configFingerprint) {
        return existing;
      }
      throw new PersistenceError('VERSION_CONFLICT', `Run '${run.runId}' already exists with different fingerprint`);
    }
    await this.adapter.put('runs', run.runId, run);
    return run;
  }

  async getRun(runId: string): Promise<RunRecord | null> {
    const raw = await this.adapter.get<RunRecord>('runs', runId);
    if (!raw) return null;
    return validateRecordOnRead<RunRecord>('run', raw);
  }

  async updateRun(runId: string, updates: Partial<RunRecord>, expectedVersion?: number): Promise<RunRecord> {
    const existing = await this.getRun(runId);
    if (!existing) {
      throw new PersistenceError('RESOURCE_NOT_FOUND', `Cannot update run '${runId}': run not found`);
    }

    if (expectedVersion !== undefined && existing.recordVersion !== expectedVersion) {
      throw new PersistenceError(
        'VERSION_CONFLICT',
        `Version conflict on run '${runId}': expected version ${expectedVersion}, but found ${existing.recordVersion}`
      );
    }

    const updated: RunRecord = {
      ...existing,
      ...updates,
      runId: existing.runId, // Immutable ID
      recordVersion: existing.recordVersion + 1,
      updatedAt: new Date().toISOString()
    };

    validateRecordForWrite('run', updated);
    await this.adapter.put('runs', runId, updated);
    return updated;
  }

  async listRuns(): Promise<RunRecord[]> {
    const rawList = await this.adapter.list<RunRecord>('runs');
    return rawList.map(item => validateRecordOnRead<RunRecord>('run', item));
  }

  async deleteRun(runId: string): Promise<void> {
    await this.retentionManager.deleteRunCascade(runId);
  }

  // ==========================================
  // CANDIDATE OPERATIONS
  // ==========================================

  async saveCandidate(candidate: CandidateRecord): Promise<void> {
    validateRecordForWrite('candidate', candidate);
    await this.adapter.put('candidates', candidate.candidateId, candidate);
  }

  async getCandidate(candidateId: string): Promise<CandidateRecord | null> {
    const raw = await this.adapter.get<CandidateRecord>('candidates', candidateId);
    if (!raw) return null;
    return validateRecordOnRead<CandidateRecord>('candidate', raw);
  }

  async listCandidatesByRun(runId: string): Promise<CandidateRecord[]> {
    const rawList = await this.adapter.list<CandidateRecord>('candidates', c => c.runId === runId);
    return rawList.map(c => validateRecordOnRead<CandidateRecord>('candidate', c));
  }

  // ==========================================
  // ENTITY OPERATIONS
  // ==========================================

  async saveEntity(entity: EntityRecord): Promise<void> {
    validateRecordForWrite('entity', entity);
    await this.adapter.put('entities', entity.entityId, entity);
  }

  async getEntity(entityId: string): Promise<EntityRecord | null> {
    const raw = await this.adapter.get<EntityRecord>('entities', entityId);
    if (!raw) return null;
    return validateRecordOnRead<EntityRecord>('entity', raw);
  }

  async listEntitiesByRun(runId: string): Promise<EntityRecord[]> {
    const rawList = await this.adapter.list<EntityRecord>('entities', e => e.runId === runId);
    return rawList.map(e => validateRecordOnRead<EntityRecord>('entity', e));
  }

  // ==========================================
  // EVIDENCE OPERATIONS
  // ==========================================

  async saveEvidence(evidence: EvidenceRecord): Promise<void> {
    validateRecordForWrite('evidence', evidence);
    await this.adapter.put('evidence', evidence.evidenceId, evidence);
  }

  async listEvidenceByCandidate(candidateId: string): Promise<EvidenceRecord[]> {
    const rawList = await this.adapter.list<EvidenceRecord>('evidence', ev => ev.candidateId === candidateId);
    return rawList.map(ev => validateRecordOnRead<EvidenceRecord>('evidence', ev));
  }

  // ==========================================
  // QUALIFICATION OPERATIONS
  // ==========================================

  async saveQualification(qual: QualificationRecord): Promise<void> {
    validateRecordForWrite('qualification', qual);
    await this.adapter.put('qualifications', qual.evaluationId, qual);
  }

  async getQualificationByEntity(entityId: string): Promise<QualificationRecord | null> {
    const list = await this.adapter.list<QualificationRecord>('qualifications', q => q.entityId === entityId);
    if (list.length === 0) return null;
    return validateRecordOnRead<QualificationRecord>('qualification', list[0]);
  }

  // ==========================================
  // CHECKPOINT OPERATIONS
  // ==========================================

  async saveCheckpoint(checkpoint: CheckpointRecord): Promise<void> {
    if (checkpoint.commitState === 'COMMITTED') {
      await this.checkpointStore.saveCommittedCheckpoint(checkpoint);
    } else {
      await this.checkpointStore.stageCheckpoint(checkpoint);
    }
  }

  async loadCheckpoint(checkpointId: string): Promise<CheckpointRecord | null> {
    return this.checkpointStore.loadCheckpoint(checkpointId);
  }

  async getLatestCheckpoint(runId: string): Promise<CheckpointRecord | null> {
    return this.checkpointStore.getLatestValidCheckpoint(runId);
  }

  // ==========================================
  // EXPORT AUDIT OPERATIONS
  // ==========================================

  async saveExportAudit(audit: ExportAuditRecord): Promise<void> {
    validateRecordForWrite('exportAudit', audit);
    await this.adapter.put('exportAudits', audit.exportId, audit);

    // Link export audit to run record
    const run = await this.getRun(audit.runId);
    if (run && !run.exportAuditIds.includes(audit.exportId)) {
      await this.updateRun(audit.runId, {
        exportAuditIds: [...run.exportAuditIds, audit.exportId]
      });
    }
  }

  async getExportAudit(exportId: string): Promise<ExportAuditRecord | null> {
    const raw = await this.adapter.get<ExportAuditRecord>('exportAudits', exportId);
    if (!raw) return null;
    return validateRecordOnRead<ExportAuditRecord>('exportAudit', raw);
  }

  async listExportAuditsByRun(runId: string): Promise<ExportAuditRecord[]> {
    const rawList = await this.adapter.list<ExportAuditRecord>('exportAudits', ea => ea.runId === runId);
    return rawList.map(ea => validateRecordOnRead<ExportAuditRecord>('exportAudit', ea));
  }

  // ==========================================
  // DIAGNOSTICS & STATS
  // ==========================================

  async getStorageStats(): Promise<StorageStats> {
    return this.diagnostics.getStorageStats();
  }

  async checkReferentialIntegrity(): Promise<ReferentialIntegrityReport> {
    return this.diagnostics.auditReferentialIntegrity();
  }

  async clearAll(): Promise<void> {
    await this.retentionManager.resetAllStorage();
  }
}
