/**
 * LeadNoria — Phase 32: Production Feedback, Reliability & Growth Readiness
 * Diagnostics & Operational Reliability View
 *
 * Invariants:
 * - 100% local rendering: ZERO network telemetry, ZERO cloud beacons.
 * - Evidence-derived metrics: cards display actual run metrics with sample sufficiency guardrails.
 * - Privacy-safe: all displayed issues and exportable packages are stripped of PII.
 * - Full WCAG AA accessibility: semantic headings, table scopes, keyboard focus, high contrast.
 */

import React, { useState, useMemo } from 'react';
import {
  ReliabilityMetrics,
  OperationalGuardrailAlert,
  AggregatedIssue,
  StorageHealthSummary,
  IssueResolutionState
} from '../../reliability/types.ts';
import { createDiagnosticReproductionPackage } from '../../reliability/reliabilityEngine.ts';

export interface DiagnosticsViewProps {
  version: string;
  reliabilityMetrics: ReliabilityMetrics;
  guardrailAlerts: OperationalGuardrailAlert[];
  issues: AggregatedIssue[];
  storageHealth: StorageHealthSummary;
  onUpdateIssueResolution?: (fingerprint: string, state: IssueResolutionState) => void;
  onClearDiagnostics?: () => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  version,
  reliabilityMetrics,
  guardrailAlerts,
  issues,
  storageHealth,
  onUpdateIssueResolution,
  onClearDiagnostics
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (filterCategory !== 'ALL' && issue.category !== filterCategory) return false;
      if (filterSeverity !== 'ALL' && issue.severity !== filterSeverity) return false;
      return true;
    });
  }, [issues, filterCategory, filterSeverity]);

  // Export diagnostic report
  const handleExportJson = () => {
    const pkg = createDiagnosticReproductionPackage({
      version,
      runs: [], // Reliability metrics already contain computed summaries
      issues: issues as any,
      storageHealth
    });
    // Override reliabilitySummary with the live passed metrics
    pkg.reliabilitySummary = reliabilityMetrics;
    pkg.activeGuardrailAlerts = guardrailAlerts;
    pkg.topIssues = issues;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pkg, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `leadnoria_diagnostic_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy summary to clipboard
  const handleCopySummary = async () => {
    const summaryLines = [
      `LeadNoria v${version} Diagnostics Summary`,
      `Generated: ${new Date().toISOString()}`,
      `Total Runs: ${reliabilityMetrics.totalRuns} (Success Rate: ${reliabilityMetrics.runSuccessRate}%)`,
      `Issue Rate: ${reliabilityMetrics.issueRatePerRun}% | Recovery Rate: ${reliabilityMetrics.recoveryRate}%`,
      `P95 Runtime: ${reliabilityMetrics.p95RunDurationMs}ms`,
      `Sample Sufficiency: ${reliabilityMetrics.sampleSufficiency}`,
      `Active Guardrails: ${guardrailAlerts.length}`,
      `Recorded Issues: ${issues.length} distinct fingerprints`,
      `Storage Usage: ${storageHealth.quotaUsagePercent}% (${Math.round(storageHealth.estimatedBytes / 1024)} KB)`
    ];
    try {
      await navigator.clipboard.writeText(summaryLines.join('\n'));
      setCopyFeedback('Diagnostic summary copied to clipboard!');
      setTimeout(() => setCopyFeedback(null), 3000);
    } catch {
      setCopyFeedback('Failed to access clipboard automatically.');
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'P0': return 'bg-rose-950/80 text-rose-300 border-rose-600/50';
      case 'P1': return 'bg-amber-950/80 text-amber-300 border-amber-600/50';
      case 'P2': return 'bg-yellow-950/80 text-yellow-300 border-yellow-600/50';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const categories = useMemo(() => {
    const set = new Set(issues.map(i => i.category));
    return Array.from(set).sort();
  }, [issues]);

  return (
    <div
      role="region"
      aria-label="System Diagnostics & Reliability Health"
      className="flex flex-col gap-4 text-xs text-slate-300"
    >
      {/* 1. Header & Architecture Badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-slate-950/80 rounded-lg border border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
            <span>🛡</span> Operational Diagnostics &amp; Reliability
          </h3>
          <p className="text-[11px] text-slate-400">
            Local operational monitoring, bounded error taxonomy, and evidence-based reliability metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
            LOCAL-FIRST (0 TELEMETRY)
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950/80 text-sky-300 border border-sky-600/40">
            v{version}
          </span>
        </div>
      </div>

      {/* 2. Operational Reliability Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Run Success Rate</span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-lg font-bold text-slate-100">{reliabilityMetrics.runSuccessRate}%</span>
            <span className="text-[10px] text-slate-500">({reliabilityMetrics.successfulRuns}/{reliabilityMetrics.totalRuns})</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Sample: {reliabilityMetrics.sampleSufficiency}</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Issue Rate Per Run</span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-lg font-bold text-slate-100">{reliabilityMetrics.issueRatePerRun}%</span>
            <span className="text-[10px] text-slate-500">of runs</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{issues.length} distinct fingerprints</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Recovery Rate</span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-lg font-bold text-slate-100">{reliabilityMetrics.recoveryRate}%</span>
            <span className="text-[10px] text-slate-500">({reliabilityMetrics.recoveryCount} recovered)</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Retries: {reliabilityMetrics.retryCount}</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">P95 Run Duration</span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-lg font-bold text-slate-100">
              {reliabilityMetrics.p95RunDurationMs > 0 ? `${(reliabilityMetrics.p95RunDurationMs / 1000).toFixed(1)}s` : 'N/A'}
            </span>
            <span className="text-[10px] text-slate-500">Avg: {(reliabilityMetrics.averageRunDurationMs / 1000).toFixed(1)}s</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Timeouts: {reliabilityMetrics.websiteTimeoutCount}</span>
        </div>
      </div>

      {/* 3. Operational Guardrail Alerts (SLA-like internal warnings) */}
      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
          <span>Operational Guardrails &amp; Health Alerts</span>
          <span className="text-[10px] text-slate-400 normal-case">
            {guardrailAlerts.length === 0 ? 'All metrics within normal bounds' : `${guardrailAlerts.length} active alerts`}
          </span>
        </h4>

        {guardrailAlerts.length === 0 ? (
          <div className="flex items-center gap-2 p-2 bg-emerald-950/30 rounded border border-emerald-800/40 text-emerald-300 text-[11px]">
            <span>✓</span>
            <span>All internal reliability thresholds normal. No operational alerts active.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {guardrailAlerts.map(alert => (
              <div
                key={alert.alertId}
                role="alert"
                className={`p-2.5 rounded border text-[11px] flex flex-col gap-1 ${getSeverityBadgeClass(alert.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span>⚠</span> {alert.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold border border-current">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-slate-300">{alert.description}</p>
                <p className="text-[10px] text-slate-400 italic">
                  <strong>Remediation:</strong> {alert.remediationRecommendation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Production Issues List */}
      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Recorded Issues ({filteredIssues.length} of {issues.length})
          </h4>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              aria-label="Filter by Category"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-1 focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              aria-label="Filter by Severity"
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-1 focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Severities</option>
              <option value="P0">P0 (Critical)</option>
              <option value="P1">P1 (High)</option>
              <option value="P2">P2 (Medium)</option>
              <option value="P3">P3 (Low)</option>
            </select>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <p className="text-[11px] text-slate-400 py-3 text-center">
            {issues.length === 0 ? 'No production issues recorded in local diagnostic history.' : 'No issues match the selected category and severity filters.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th scope="col" className="pb-1.5 font-semibold">Severity</th>
                  <th scope="col" className="pb-1.5 font-semibold">Category</th>
                  <th scope="col" className="pb-1.5 font-semibold">Technical Code / Stage</th>
                  <th scope="col" className="pb-1.5 font-semibold text-center">Occurrences</th>
                  <th scope="col" className="pb-1.5 font-semibold">User Impact &amp; Message</th>
                  <th scope="col" className="pb-1.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredIssues.map(issue => (
                  <tr key={issue.fingerprint} className="hover:bg-slate-900/40">
                    <td className="py-2 pr-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadgeClass(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="py-2 pr-2 font-medium text-slate-200">{issue.category}</td>
                    <td className="py-2 pr-2">
                      <div className="font-mono text-[10px] text-sky-300">{issue.sanitizedTechnicalCode}</div>
                      <div className="text-[10px] text-slate-400">{issue.workflowStage}</div>
                    </td>
                    <td className="py-2 pr-2 text-center">
                      <span className="font-semibold text-slate-200">{issue.occurrenceCount}</span>
                      <span className="text-[10px] text-slate-400 block">({issue.affectedRunCount} runs)</span>
                    </td>
                    <td className="py-2 pr-2 max-w-[260px]">
                      <p className="text-slate-300 line-clamp-2">{issue.humanReadableMessage}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{issue.userImpact}</p>
                    </td>
                    <td className="py-2 text-right">
                      {onUpdateIssueResolution ? (
                        <button
                          type="button"
                          onClick={() => onUpdateIssueResolution(
                            issue.fingerprint,
                            issue.resolutionState === 'RESOLVED' ? 'OPEN' : 'RESOLVED'
                          )}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                            issue.resolutionState === 'RESOLVED'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/60'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {issue.resolutionState}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">{issue.resolutionState}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Storage Capacity & Retention Policy */}
      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Local Storage Health &amp; Retention Bounds
        </h4>
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span>Capacity Usage ({Math.round(storageHealth.estimatedBytes / 1024)} KB of {Math.round(storageHealth.quotaLimitBytes / (1024 * 1024))} MB)</span>
          <span className={`font-semibold ${storageHealth.isPressureHigh ? 'text-amber-400' : 'text-emerald-400'}`}>
            {storageHealth.quotaUsagePercent}%
          </span>
        </div>
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-300 ${storageHealth.isPressureHigh ? 'bg-amber-500' : 'bg-sky-500'}`}
            style={{ width: `${Math.min(100, storageHealth.quotaUsagePercent)}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1 text-[10px] text-slate-400">
          <div>Diagnostics: {storageHealth.collectionCounts['production_diagnostic_issues'] || 0} / 100 max</div>
          <div>Research Runs: {storageHealth.collectionCounts['research_runs'] || 0} / 100 max</div>
          <div>Snapshots: {storageHealth.collectionCounts['research_optimization_snapshots'] || 0} / 20 max</div>
        </div>
      </div>

      {/* 6. Action Controls (Export / Copy / Clear) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-export-diagnostics-json"
            onClick={handleExportJson}
            className="px-3 py-1.5 text-[11px] font-medium text-sky-200 bg-sky-950 hover:bg-sky-900 border border-sky-500/40 rounded transition-colors focus:ring-1 focus:ring-sky-400"
          >
            Export Diagnostic Package (JSON)
          </button>
          <button
            type="button"
            id="btn-copy-diagnostics-summary"
            onClick={handleCopySummary}
            className="px-3 py-1.5 text-[11px] font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded transition-colors focus:ring-1 focus:ring-sky-400"
          >
            Copy Summary
          </button>
          {copyFeedback && (
            <span role="status" className="text-[11px] text-emerald-400 font-medium">
              {copyFeedback}
            </span>
          )}
        </div>

        {onClearDiagnostics && (
          <div>
            {!showClearConfirm ? (
              <button
                type="button"
                id="btn-clear-diagnostic-history"
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 text-[11px] font-medium text-rose-300 hover:text-rose-100 bg-rose-950/30 hover:bg-rose-900/40 rounded border border-rose-500/30 transition-colors"
              >
                Clear Diagnostic History
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-300">Clear diagnostics only?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearDiagnostics();
                    setShowClearConfirm(false);
                  }}
                  className="px-2 py-1 text-[10px] font-bold text-rose-100 bg-rose-700 hover:bg-rose-600 rounded"
                >
                  Yes, Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 rounded"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
