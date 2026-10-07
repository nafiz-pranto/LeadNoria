/**
 * LeadNoria — Google Maps Lead Intelligence Engine — Part 10
 * Pipeline Observability & Operational Run Telemetry
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Zero PII or candidate payload storage in telemetry logs.
 * 2. Deterministic accounting: all counters strictly reconcile across lifecycle stages.
 * 3. Exact reconciliation formula:
 *    discoveredRecords === processedRecords + rejectedRecords + duplicatesDetected
 *    exportedRecords <= qualifiedRecords
 * 4. Logs help diagnose real failures without noisy logging.
 */

export interface PipelineFailureRecord {
  readonly timestamp: string;
  readonly code: string;
  readonly message: string;
  readonly isTerminal: boolean;
  readonly contextStage: string;
}

export interface PipelineRunMetrics {
  readonly runId: string;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  readonly recordsDiscovered: number;
  readonly recordsProcessed: number;
  readonly recordsRejected: number;
  readonly recordsQualified: number;
  readonly recordsProjected: number;
  readonly recordsExported: number;
  readonly duplicatesDetected: number;
  readonly retriesAttempted: number;
  readonly recoverableFailuresCount: number;
  readonly terminalFailuresCount: number;
  readonly failures: readonly PipelineFailureRecord[];
  readonly reconciliation: {
    readonly isReconciled: boolean;
    readonly inputSum: number;
    readonly outcomeSum: number;
    readonly discrepancy: number;
  };
}

export class PipelineObservability {
  private readonly runId: string;
  private readonly startedAt: string;
  private completedAt?: string;
  private status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING';

  private recordsDiscovered = 0;
  private recordsProcessed = 0;
  private recordsRejected = 0;
  private recordsQualified = 0;
  private recordsProjected = 0;
  private recordsExported = 0;
  private duplicatesDetected = 0;
  private retriesAttempted = 0;

  private readonly failures: PipelineFailureRecord[] = [];

  constructor(runId: string) {
    this.runId = runId;
    this.startedAt = new Date().toISOString();
  }

  public start(): void {
    this.status = 'RUNNING';
  }

  public complete(status: 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'COMPLETED'): void {
    this.status = status;
    this.completedAt = new Date().toISOString();
  }

  public recordDiscovered(count = 1): void {
    this.recordsDiscovered += count;
  }

  public recordProcessed(count = 1): void {
    this.recordsProcessed += count;
  }

  public recordRejected(reason?: string, count = 1): void {
    this.recordsRejected += count;
  }

  public recordQualified(count = 1): void {
    this.recordsQualified += count;
  }

  public recordProjected(count = 1): void {
    this.recordsProjected += count;
  }

  public recordExported(count = 1): void {
    this.recordsExported += count;
  }

  public recordDuplicate(count = 1): void {
    this.duplicatesDetected += count;
  }

  public recordRetry(reason?: string): void {
    this.retriesAttempted += 1;
  }

  public recordRecoverableFailure(code: string, message: string, stage = 'PIPELINE'): void {
    this.failures.push({
      timestamp: new Date().toISOString(),
      code,
      message,
      isTerminal: false,
      contextStage: stage
    });
  }

  public recordTerminalFailure(code: string, message: string, stage = 'PIPELINE'): void {
    this.failures.push({
      timestamp: new Date().toISOString(),
      code,
      message,
      isTerminal: true,
      contextStage: stage
    });
    this.status = 'FAILED';
    if (!this.completedAt) {
      this.completedAt = new Date().toISOString();
    }
  }

  public getMetrics(): PipelineRunMetrics {
    const recoverableFailuresCount = this.failures.filter(f => !f.isTerminal).length;
    const terminalFailuresCount = this.failures.filter(f => f.isTerminal).length;

    const outcomeSum = this.recordsProcessed + this.recordsRejected + this.duplicatesDetected;
    const discrepancy = this.recordsDiscovered - outcomeSum;
    const isReconciled = discrepancy === 0;

    return Object.freeze({
      runId: this.runId,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      status: this.status,
      recordsDiscovered: this.recordsDiscovered,
      recordsProcessed: this.recordsProcessed,
      recordsRejected: this.recordsRejected,
      recordsQualified: this.recordsQualified,
      recordsProjected: this.recordsProjected,
      recordsExported: this.recordsExported,
      duplicatesDetected: this.duplicatesDetected,
      retriesAttempted: this.retriesAttempted,
      recoverableFailuresCount,
      terminalFailuresCount,
      failures: Object.freeze([...this.failures]),
      reconciliation: Object.freeze({
        isReconciled,
        inputSum: this.recordsDiscovered,
        outcomeSum,
        discrepancy
      })
    });
  }
}
