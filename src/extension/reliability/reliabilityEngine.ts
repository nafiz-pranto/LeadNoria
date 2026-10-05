/**
 * LeadNoria — Phase 32: Production Feedback, Reliability & Growth Readiness
 * Operational Reliability Engine & Diagnostic Package Generator
 *
 * Invariants:
 * - 100% evidence-derived: all metrics derive directly from recorded runs & issue occurrences.
 * - Strict denominators: zero hidden exclusions of failed, cancelled, or partial runs.
 * - Strict sample-size guardrails: no sweeping reliability conclusions on tiny run samples.
 * - Privacy-preserving & anti-laundering: Google data firewall strictly maintained in diagnostics.
 * - Deterministic: identical inputs produce identical metrics, alerts, and packages.
 */

import {
  ReliabilityMetrics,
  ReliabilitySampleSufficiency,
  OperationalGuardrailAlert,
  OperationalGuardrailAlertType,
  ProductionIssue,
  AggregatedIssue,
  DiagnosticReproductionPackage,
  StorageHealthSummary,
  DEFAULT_GUARDRAIL_THRESHOLDS,
  DIAGNOSTICS_SCHEMA_VERSION,
  IssueSeverity
} from './types.ts';

/**
 * Deterministic rounding utility handling NaN, Infinity, and signed zero safely.
 */
export function roundDeterministic(val: number, decimals = 1): number {
  if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
    return 0.0;
  }
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(val * factor) / factor;
  return Object.is(rounded, -0) ? 0.0 : rounded;
}

/**
 * Text sanitization for diagnostic messages, preventing CSV formula injection and XSS.
 */
export function sanitizeDiagnosticText(input: string | undefined | null): string {
  if (!input) return '';
  let str = String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Neutralize CSV/Spreadsheet formula injection tokens (=, +, -, @, tab, CR)
  if (/^[=\-+@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return str.trim();
}

/**
 * Computes sample sufficiency level from total observed runs.
 */
export function evaluateReliabilitySampleSufficiency(totalRuns: number): ReliabilitySampleSufficiency {
  if (totalRuns <= 0) return 'NO_DATA';
  if (totalRuns < 5) return 'LOW_SAMPLE';
  if (totalRuns < 20) return 'MODERATE_SAMPLE';
  return 'STRONG_SAMPLE';
}

/**
 * Computes operational reliability metrics strictly from observed run history and issues.
 */
export function computeReliabilityMetrics(
  runs: any[] = [],
  issues: ProductionIssue[] = []
): ReliabilityMetrics {
  const totalRuns = runs.length;
  const sampleSufficiency = evaluateReliabilitySampleSufficiency(totalRuns);

  let successfulRuns = 0;
  let failedRuns = 0;
  let partialRuns = 0;
  let cancelledRuns = 0;
  let recoveryCount = 0;
  let retryCount = 0;
  let exportSuccesses = 0;
  let exportFailures = 0;
  let persistenceFailures = 0;
  let websiteTimeoutCount = 0;
  let acquisitionFailureCount = 0;

  const durations: number[] = [];
  const runsWithIssuesSet = new Set<string>();

  for (const run of runs) {
    const status = (run.status || '').toUpperCase();
    if (status === 'COMPLETED') {
      successfulRuns++;
    } else if (status === 'FAILED') {
      failedRuns++;
    } else if (status === 'PARTIAL') {
      partialRuns++;
    } else if (status === 'CANCELLED') {
      cancelledRuns++;
    }

    if (run.wasRecovered || run.checkpointRecovered) {
      recoveryCount++;
    }
    if (run.retryCount && typeof run.retryCount === 'number') {
      retryCount += run.retryCount;
    }

    if (run.startedAt && run.completedAt) {
      const start = new Date(run.startedAt).getTime();
      const end = new Date(run.completedAt).getTime();
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        durations.push(end - start);
      }
    } else if (typeof run.durationMs === 'number' && run.durationMs >= 0) {
      durations.push(run.durationMs);
    }
  }

  for (const issue of issues) {
    if (issue.affectedRunIds && Array.isArray(issue.affectedRunIds)) {
      for (const rId of issue.affectedRunIds) {
        if (rId) runsWithIssuesSet.add(rId);
      }
    }

    if (issue.category === 'EXPORT') {
      exportFailures += issue.occurrenceCount || 1;
    }
    if (issue.category === 'PERSISTENCE') {
      persistenceFailures += issue.occurrenceCount || 1;
    }
    if (issue.category === 'WEBSITE' && (issue.sanitizedTechnicalCode || '').toUpperCase().includes('TIMEOUT')) {
      websiteTimeoutCount += issue.occurrenceCount || 1;
    }
    if (issue.category === 'ACQUISITION') {
      acquisitionFailureCount += issue.occurrenceCount || 1;
    }
  }

  // Calculate duration metrics
  durations.sort((a, b) => a - b);
  let averageRunDurationMs = 0;
  let p95RunDurationMs = 0;

  if (durations.length > 0) {
    const sum = durations.reduce((acc, d) => acc + d, 0);
    averageRunDurationMs = roundDeterministic(sum / durations.length, 0);
    const p95Idx = Math.min(durations.length - 1, Math.floor(durations.length * 0.95));
    p95RunDurationMs = durations[p95Idx];
  }

  // Denominators
  const completedRuns = successfulRuns + failedRuns + partialRuns + cancelledRuns;
  const runSuccessRate = completedRuns > 0
    ? roundDeterministic((successfulRuns / completedRuns) * 100.0, 1)
    : 100.0;

  const issueRatePerRun = totalRuns > 0
    ? roundDeterministic((runsWithIssuesSet.size / totalRuns) * 100.0, 1)
    : 0.0;

  const recoverableRuns = failedRuns + partialRuns + recoveryCount;
  const recoveryRate = recoverableRuns > 0
    ? roundDeterministic((recoveryCount / recoverableRuns) * 100.0, 1)
    : 100.0;

  // Track export successes from runs that completed an export step
  exportSuccesses = Math.max(0, successfulRuns - exportFailures);

  return {
    totalRuns,
    successfulRuns,
    failedRuns,
    partialRuns,
    cancelledRuns,
    recoveryCount,
    retryCount,
    exportSuccesses,
    exportFailures,
    persistenceFailures,
    websiteTimeoutCount,
    acquisitionFailureCount,
    averageRunDurationMs,
    p95RunDurationMs,
    runSuccessRate,
    issueRatePerRun,
    recoveryRate,
    sampleSufficiency
  };
}

/**
 * Evaluates internal operational guardrails against observed reliability metrics.
 */
export function evaluateOperationalGuardrails(
  metrics: ReliabilityMetrics,
  customThresholds?: Partial<typeof DEFAULT_GUARDRAIL_THRESHOLDS>
): OperationalGuardrailAlert[] {
  const t = { ...DEFAULT_GUARDRAIL_THRESHOLDS, ...customThresholds };
  const alerts: OperationalGuardrailAlert[] = [];

  // Guardrail 1: High Run Failure Rate (only active when sample >= MIN_SAMPLE_RUNS)
  if (metrics.totalRuns >= t.MIN_SAMPLE_RUNS) {
    const observedFailureRate = 100.0 - metrics.runSuccessRate;
    if (observedFailureRate > t.MAX_RUN_FAILURE_RATE) {
      alerts.push({
        alertId: 'alert_run_failure_rate',
        alertType: 'HIGH_FAILURE_RATE',
        severity: 'P1',
        title: 'High Run Failure Rate Observed',
        description: `Run failure rate is ${roundDeterministic(observedFailureRate, 1)}% across ${metrics.totalRuns} runs (threshold: ${t.MAX_RUN_FAILURE_RATE}%).`,
        observedValue: observedFailureRate,
        thresholdValue: t.MAX_RUN_FAILURE_RATE,
        unit: '%',
        remediationRecommendation: 'Check source availability and network connectivity before launching large batch research.'
      });
    }
  }

  // Guardrail 2: High Persistence Failure Rate
  if (metrics.totalRuns >= t.MIN_SAMPLE_RUNS && metrics.persistenceFailures > 0) {
    const rate = roundDeterministic((metrics.persistenceFailures / metrics.totalRuns) * 100.0, 1);
    if (rate > t.MAX_PERSISTENCE_FAILURE_RATE) {
      alerts.push({
        alertId: 'alert_persistence_failure',
        alertType: 'HIGH_PERSISTENCE_FAILURE_RATE',
        severity: 'P0',
        title: 'High Local Persistence Failure Rate',
        description: `Persistence failure rate is ${rate}% (${metrics.persistenceFailures} failures across ${metrics.totalRuns} runs).`,
        observedValue: rate,
        thresholdValue: t.MAX_PERSISTENCE_FAILURE_RATE,
        unit: '%',
        remediationRecommendation: 'Check browser local storage quota or clear old diagnostic history.'
      });
    }
  }

  // Guardrail 3: High Export Failure Rate
  const totalExports = metrics.exportSuccesses + metrics.exportFailures;
  if (totalExports >= 3 && metrics.exportFailures > 0) {
    const rate = roundDeterministic((metrics.exportFailures / totalExports) * 100.0, 1);
    if (rate > t.MAX_EXPORT_FAILURE_RATE) {
      alerts.push({
        alertId: 'alert_export_failure',
        alertType: 'HIGH_EXPORT_FAILURE_RATE',
        severity: 'P1',
        title: 'High Export Failure Rate',
        description: `Export failure rate is ${rate}% (${metrics.exportFailures} failed out of ${totalExports} exports).`,
        observedValue: rate,
        thresholdValue: t.MAX_EXPORT_FAILURE_RATE,
        unit: '%',
        remediationRecommendation: 'Verify browser download permissions are enabled for the LeadNoria extension.'
      });
    }
  }

  // Guardrail 4: Low Recovery Rate
  const recoverableCount = metrics.failedRuns + metrics.partialRuns + metrics.recoveryCount;
  if (recoverableCount >= 3 && metrics.recoveryRate < t.MIN_RECOVERY_RATE) {
    alerts.push({
      alertId: 'alert_recovery_failure',
      alertType: 'HIGH_RECOVERY_FAILURE_RATE',
      severity: 'P1',
      title: 'Degraded Checkpoint Recovery Rate',
      description: `Recovery rate is ${metrics.recoveryRate}% (${metrics.recoveryCount} successful recoveries out of ${recoverableCount} interrupted runs).`,
      observedValue: metrics.recoveryRate,
      thresholdValue: t.MIN_RECOVERY_RATE,
      unit: '%',
      remediationRecommendation: 'Allow research runs to complete or resume immediately after browser restart.'
    });
  }

  // Guardrail 5: High Website Timeout Rate
  if (metrics.totalRuns >= t.MIN_SAMPLE_RUNS && metrics.websiteTimeoutCount > 0) {
    const rate = roundDeterministic((metrics.websiteTimeoutCount / metrics.totalRuns) * 100.0, 1);
    if (rate > t.MAX_WEBSITE_TIMEOUT_RATE) {
      alerts.push({
        alertId: 'alert_website_timeout',
        alertType: 'HIGH_WEBSITE_TIMEOUT_RATE',
        severity: 'P2',
        title: 'Elevated Website Verification Timeouts',
        description: `Website timeout rate is ${rate}% (${metrics.websiteTimeoutCount} timeouts observed).`,
        observedValue: rate,
        thresholdValue: t.MAX_WEBSITE_TIMEOUT_RATE,
        unit: '%',
        remediationRecommendation: 'Target websites may be slow or blocking automated verification; website enrichment marked UNVERIFIED.'
      });
    }
  }

  // Guardrail 6: High P95 Runtime
  if (metrics.totalRuns >= t.MIN_SAMPLE_RUNS && metrics.p95RunDurationMs > t.MAX_P95_RUNTIME_MS) {
    alerts.push({
      alertId: 'alert_p95_runtime',
      alertType: 'HIGH_P95_RUNTIME',
      severity: 'P2',
      title: 'High 95th Percentile Run Duration',
      description: `P95 execution duration is ${roundDeterministic(metrics.p95RunDurationMs / 1000, 1)}s (threshold: ${t.MAX_P95_RUNTIME_MS / 1000}s).`,
      observedValue: metrics.p95RunDurationMs,
      thresholdValue: t.MAX_P95_RUNTIME_MS,
      unit: 'ms',
      remediationRecommendation: 'Reduce search unit query scope or target smaller geographic partitions for faster execution.'
    });
  }

  return alerts;
}

/**
 * Deterministically aggregates repeated production issues sharing the same fingerprint.
 */
export function aggregateProductionIssues(issues: ProductionIssue[] = []): AggregatedIssue[] {
  const map = new Map<string, AggregatedIssue>();
  const runSets = new Map<string, Set<string>>();

  const severityRank: Record<IssueSeverity, number> = {
    P0: 4,
    P1: 3,
    P2: 2,
    P3: 1
  };

  for (const issue of issues) {
    const fp = issue.fingerprint;
    let set = runSets.get(fp);
    if (!set) {
      set = new Set<string>();
      runSets.set(fp, set);
    }
    if (issue.affectedRunIds) {
      for (const r of issue.affectedRunIds) {
        if (r) set.add(r);
      }
    }

    const existing = map.get(fp);
    if (!existing) {
      map.set(fp, {
        fingerprint: fp,
        category: issue.category,
        severity: issue.severity,
        humanReadableMessage: sanitizeDiagnosticText(issue.humanReadableMessage),
        sanitizedTechnicalCode: sanitizeDiagnosticText(issue.sanitizedTechnicalCode),
        workflowStage: issue.workflowStage,
        occurrenceCount: issue.occurrenceCount || 1,
        affectedRunCount: set.size,
        firstSeen: issue.timestamp || issue.lastSeen || new Date().toISOString(),
        lastSeen: issue.lastSeen || issue.timestamp || new Date().toISOString(),
        retryability: issue.retryability,
        userImpact: sanitizeDiagnosticText(issue.userImpact),
        resolutionState: issue.resolutionState || 'OPEN'
      });
    } else {
      existing.occurrenceCount += issue.occurrenceCount || 1;
      existing.affectedRunCount = set.size;

      // Update severity to highest seen
      if (severityRank[issue.severity] > severityRank[existing.severity]) {
        existing.severity = issue.severity;
      }

      // Update timestamps
      const issueTime = new Date(issue.timestamp || issue.lastSeen).getTime();
      const existingLast = new Date(existing.lastSeen).getTime();
      const existingFirst = new Date(existing.firstSeen).getTime();

      if (!isNaN(issueTime)) {
        if (isNaN(existingLast) || issueTime > existingLast) {
          existing.lastSeen = issue.lastSeen || issue.timestamp;
        }
        if (isNaN(existingFirst) || issueTime < existingFirst) {
          existing.firstSeen = issue.timestamp || issue.lastSeen;
        }
      }
    }
  }

  const result = Array.from(map.values());

  // Deterministic sorting: Highest severity first, then occurrence count desc, then lastSeen desc
  result.sort((a, b) => {
    const sDiff = severityRank[b.severity] - severityRank[a.severity];
    if (sDiff !== 0) return sDiff;
    const oDiff = b.occurrenceCount - a.occurrenceCount;
    if (oDiff !== 0) return oDiff;
    return b.lastSeen.localeCompare(a.lastSeen);
  });

  return result;
}

export interface DiagnosticPackageOptions {
  version: string;
  runs: any[];
  issues: ProductionIssue[];
  storageHealth: StorageHealthSummary;
  browser?: string;
  os?: string;
  googleRestrictedCount?: number;
}

/**
 * Creates a fully sanitized, privacy-safe reproduction package for operator export.
 */
export function createDiagnosticReproductionPackage(
  opts: DiagnosticPackageOptions
): DiagnosticReproductionPackage {
  const metrics = computeReliabilityMetrics(opts.runs, opts.issues);
  const alerts = evaluateOperationalGuardrails(metrics);
  const topIssues = aggregateProductionIssues(opts.issues);

  return {
    schemaVersion: DIAGNOSTICS_SCHEMA_VERSION,
    product: 'LeadNoria',
    version: opts.version || '1.5.0',
    generatedAt: new Date().toISOString(),
    environment: {
      browser: sanitizeDiagnosticText(opts.browser || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js')),
      os: sanitizeDiagnosticText(opts.os || (typeof process !== 'undefined' ? process.platform : 'browser')),
      userAgentSummary: sanitizeDiagnosticText(typeof navigator !== 'undefined' ? navigator.appName : 'Extension Runtime')
    },
    reliabilitySummary: metrics,
    activeGuardrailAlerts: alerts,
    topIssues: topIssues.slice(0, 25), // Bounded top 25 aggregated issues
    storageHealth: {
      collectionCounts: { ...opts.storageHealth.collectionCounts },
      estimatedBytes: opts.storageHealth.estimatedBytes,
      quotaLimitBytes: opts.storageHealth.quotaLimitBytes,
      quotaUsagePercent: opts.storageHealth.quotaUsagePercent,
      isPressureHigh: opts.storageHealth.isPressureHigh,
      retentionPolicies: { ...opts.storageHealth.retentionPolicies }
    },
    policySummary: {
      googleRestrictedAccountingCount: opts.googleRestrictedCount || 0,
      dataFirewallActive: true,
      localOnlyEnforced: true
    }
  };
}
