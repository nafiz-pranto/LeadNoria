/**
 * LeadNoria — Google Maps Checkpoint Manager
 * Ephemeral Metadata Checkpointing & Crash Resumption
 *
 * Invariants:
 * - Checkpoint contains ONLY metadata, progress counters, and execution state.
 * - ZERO Google business listing fields, phone numbers, addresses, or PII stored.
 * - Completely compatible with Google Data Firewall (NOT_PERSISTABLE / NOT_EXPORTABLE).
 * - Restores state safely after unexpected pause, worker suspension, or interruption.
 */

import type {
  GoogleMapsAcquisitionCheckpoint,
  GoogleMapsAcquisitionState,
  GoogleMapsSearchUnit
} from './types.ts';
import { ENGINE_ADAPTER_VERSION } from './observationBoundary.ts';
import { hashStringDeterministic } from './searchUnit.ts';

export interface CheckpointStorageAdapter {
  saveCheckpoint(checkpoint: GoogleMapsAcquisitionCheckpoint): Promise<void>;
  loadCheckpoint(sessionId: string): Promise<GoogleMapsAcquisitionCheckpoint | null>;
  clearCheckpoint(sessionId: string): Promise<void>;
}

export class InMemoryCheckpointStorage implements CheckpointStorageAdapter {
  private readonly _storage = new Map<string, GoogleMapsAcquisitionCheckpoint>();

  public async saveCheckpoint(checkpoint: GoogleMapsAcquisitionCheckpoint): Promise<void> {
    this._storage.set(checkpoint.sessionId, checkpoint);
  }

  public async loadCheckpoint(sessionId: string): Promise<GoogleMapsAcquisitionCheckpoint | null> {
    return this._storage.get(sessionId) ?? null;
  }

  public async clearCheckpoint(sessionId: string): Promise<void> {
    this._storage.delete(sessionId);
  }
}

export class GoogleMapsCheckpointManager {
  private readonly _storage: CheckpointStorageAdapter;

  constructor(storage: CheckpointStorageAdapter = new InMemoryCheckpointStorage()) {
    this._storage = storage;
  }

  /**
   * Captures an ephemeral metadata checkpoint for the active session and search unit.
   */
  public async createCheckpoint(params: {
    sessionId: string;
    searchUnit: GoogleMapsSearchUnit;
    state: GoogleMapsAcquisitionState;
    pageUrl: string;
    lastObservedCandidateSignature?: string;
    lastObservedCandidateIdentity?: string;
    lastObservedCandidateEvidence?: string;
    resultSurfacePosition?: {
      scrollOffset: number;
      estimatedItemIndex: number;
    };
    observationSequence?: number;
    searchUnitProgressContext?: {
      unitIndex: number;
      totalUnits: number;
      query: string;
    };
    checkpointToken?: string;
    duplicateSuppressionContext?: {
      observedIds: readonly string[];
      cursorToken?: string;
    };
    progress: {
      totalUnits: number;
      completedUnits: number;
      pendingUnits: number;
    };
    diagnosticsSummary?: {
      warningCount: number;
      errorCount: number;
      lastErrorCode?: string;
    };
  }): Promise<GoogleMapsAcquisitionCheckpoint> {
    const now = new Date().toISOString();
    const checkpointSeed = `${params.sessionId}::${params.searchUnit.searchUnitId}::${now}`;
    const checkpointId = `gcp_${hashStringDeterministic(checkpointSeed)}`;

    const checkpoint: GoogleMapsAcquisitionCheckpoint = {
      checkpointId,
      sessionId: params.sessionId,
      searchUnitId: params.searchUnit.searchUnitId,
      state: params.state,
      pageUrl: params.pageUrl,
      candidateCount: params.searchUnit.candidateCount,
      lastObservedCandidateSignature: params.lastObservedCandidateSignature,
      lastObservedCandidateIdentity: params.lastObservedCandidateIdentity,
      lastObservedCandidateEvidence: params.lastObservedCandidateEvidence,
      resultSurfacePosition: params.resultSurfacePosition,
      observationSequence: params.observationSequence,
      searchUnitProgressContext: params.searchUnitProgressContext,
      checkpointToken: params.checkpointToken ?? `tok_${checkpointId}`,
      duplicateSuppressionContext: params.duplicateSuppressionContext,
      progress: params.progress,
      retryCount: params.searchUnit.retryCount,
      timestamp: now,
      adapterVersion: ENGINE_ADAPTER_VERSION,
      diagnosticsSummary: params.diagnosticsSummary ?? {
        warningCount: 0,
        errorCount: 0
      }
    };

    await this._storage.saveCheckpoint(checkpoint);
    return checkpoint;
  }

  /**
   * Loads the latest checkpoint for the given session.
   */
  public async loadCheckpoint(sessionId: string): Promise<GoogleMapsAcquisitionCheckpoint | null> {
    return this._storage.loadCheckpoint(sessionId);
  }

  /**
   * Validates a checkpoint for resumption integrity.
   */
  public validateCheckpoint(
    checkpoint: GoogleMapsAcquisitionCheckpoint | null
  ): { valid: boolean; reason?: string } {
    if (!checkpoint) {
      return { valid: false, reason: 'Checkpoint does not exist' };
    }
    if (!checkpoint.sessionId || !checkpoint.searchUnitId) {
      return { valid: false, reason: 'Malformed checkpoint: missing sessionId or searchUnitId' };
    }
    if (checkpoint.state === 'CANCELLED') {
      return { valid: false, reason: 'Cannot resume from a CANCELLED checkpoint' };
    }
    if (checkpoint.state === 'COMPLETED') {
      return { valid: false, reason: 'Session already completed' };
    }
    return { valid: true };
  }

  /**
   * Cleans up checkpoint on session completion or cancellation.
   */
  public async clearCheckpoint(sessionId: string): Promise<void> {
    await this._storage.clearCheckpoint(sessionId);
  }
}
