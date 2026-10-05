/**
 * LeadNoria — Phase 32: Production Feedback, Reliability & Growth Readiness
 * Settings, Compliance Disclosures & Diagnostics Integration View
 * 
 * Strict Invariants:
 * - Factual local processing disclosures (no false "offline" claims, no legal guarantees)
 * - Exposes user preferences and operational health transparently
 * - Local-first: ZERO external telemetry or remote diagnostic reporting
 * - Reuses existing StorageAdapter and clear history workflows
 */

import React, { useState } from 'react';
import {
  ReliabilityMetrics,
  OperationalGuardrailAlert,
  AggregatedIssue,
  StorageHealthSummary,
  IssueResolutionState
} from '../../reliability/types.ts';
import { DiagnosticsView } from './DiagnosticsView.tsx';

export interface SettingsViewProps {
  onOpenDiagnostics: () => void;
  onClearLocalHistory?: () => void;
  version?: string;
  reliabilityMetrics?: ReliabilityMetrics;
  guardrailAlerts?: OperationalGuardrailAlert[];
  issues?: AggregatedIssue[];
  storageHealth?: StorageHealthSummary;
  onUpdateIssueResolution?: (fingerprint: string, state: IssueResolutionState) => void;
  onClearDiagnostics?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenDiagnostics,
  onClearLocalHistory,
  version = '1.5.0',
  reliabilityMetrics,
  guardrailAlerts = [],
  issues = [],
  storageHealth,
  onUpdateIssueResolution,
  onClearDiagnostics
}) => {
  const [activeSection, setActiveSection] = useState<'GENERAL' | 'SOURCES' | 'STORAGE' | 'DIAGNOSTICS'>('GENERAL');

  // Fallback defaults for diagnostics if not injected yet
  const defaultMetrics: ReliabilityMetrics = reliabilityMetrics || {
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    partialRuns: 0,
    cancelledRuns: 0,
    recoveryCount: 0,
    retryCount: 0,
    exportSuccesses: 0,
    exportFailures: 0,
    persistenceFailures: 0,
    websiteTimeoutCount: 0,
    acquisitionFailureCount: 0,
    averageRunDurationMs: 0,
    p95RunDurationMs: 0,
    runSuccessRate: 100.0,
    issueRatePerRun: 0.0,
    recoveryRate: 100.0,
    sampleSufficiency: 'NO_DATA'
  };

  const defaultStorage: StorageHealthSummary = storageHealth || {
    collectionCounts: {},
    estimatedBytes: 0,
    quotaLimitBytes: 50 * 1024 * 1024,
    quotaUsagePercent: 0.0,
    isPressureHigh: false,
    retentionPolicies: {}
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
      {/* Header */}
      <div className="border-b border-slate-800 pb-2">
        <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
          <span>⚙</span> Settings, Compliance &amp; Operational Health
        </h2>
        <p className="text-[11px] text-slate-500">Local runtime configuration, privacy boundaries, and diagnostic health</p>
      </div>

      {/* Sub-Navigation Bar */}
      <nav className="flex items-center px-1 border-b border-slate-800 gap-1 overflow-x-auto scrollbar-none" role="tablist" aria-label="Settings sections">
        {[
          { id: 'GENERAL', label: 'General & Compliance' },
          { id: 'SOURCES', label: 'Source Capabilities' },
          { id: 'STORAGE', label: 'Data & Storage' },
          { id: 'DIAGNOSTICS', label: `Diagnostics & Health (${issues.length})`, badge: guardrailAlerts.length > 0 ? guardrailAlerts.length : undefined }
        ].map(sec => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              role="tab"
              id={`tab-settings-${sec.id.toLowerCase()}`}
              aria-selected={isActive}
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-3 py-2 text-[11px] font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-sky-400 flex items-center gap-1.5 ${
                isActive
                  ? 'border-sky-500 text-sky-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{sec.label}</span>
              {sec.badge && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {sec.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* SECTION 1: GENERAL & PRIVACY DISCLOSURE */}
      {activeSection === 'GENERAL' && (
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Local Processing &amp; Privacy Architecture
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              LeadNoria processes supported research data locally in the extension runtime while accessing permitted public sources.
              Pipeline orchestration, normalization, entity deduplication, relevance scoring, and qualification profile evaluations occur entirely within your local browser environment.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <strong>Compliance Invariant:</strong> Data derived from Google consumer-web sources is strictly designated <code className="text-purple-300">NOT_PERSISTABLE</code> and <code className="text-purple-300">NOT_EXPORTABLE</code> to prevent policy breaches.
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200 block mb-0.5">Pipeline Diagnostics Drawer</span>
              <span className="text-[11px] text-slate-500">Inspect low-level versioning, adapter contracts, and checkpoint metadata</span>
            </div>
            <button
              type="button"
              onClick={onOpenDiagnostics}
              className="px-3 py-1 text-xs font-medium text-sky-300 hover:text-sky-100 bg-sky-950/40 hover:bg-sky-900/40 rounded border border-sky-500/40 transition-colors focus:outline-none"
            >
              Open Technical Drawer
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: SOURCE CAPABILITIES */}
      {activeSection === 'SOURCES' && (
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Source Capabilities &amp; Access Controls
          </h3>
          <ul className="space-y-2 text-[11px]">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <div>
                <strong className="text-slate-200">Meta Ad Library:</strong> Public UI advertiser search, creative signals, and domain pointers.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">⊘</span>
              <div>
                <strong className="text-slate-200">Google Maps:</strong> Contract planning &amp; geographic partitioning only. Live extraction is not enabled.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <div>
                <strong className="text-slate-200">Public Websites:</strong> Bounded same-origin verification and contact discovery.
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* SECTION 3: STORAGE MANAGEMENT */}
      {activeSection === 'STORAGE' && (
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200 block mb-0.5">Local Research History</span>
              <span className="text-[11px] text-slate-500">Clear persisted runs stored in chrome.storage.local</span>
            </div>
            {onClearLocalHistory && (
              <button
                type="button"
                onClick={onClearLocalHistory}
                className="px-3 py-1 text-xs font-medium text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/40 rounded border border-rose-500/40 transition-colors focus:outline-none"
              >
                Clear Research History
              </button>
            )}
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">Bounded Retention Policy</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              LeadNoria enforces deterministic retention bounds across all collections. Diagnostic records are capped at 100 entries, research runs at 100 runs, and optimization snapshots at 20 snapshots.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 4: DIAGNOSTICS & RELIABILITY VIEW (PHASE 32) */}
      {activeSection === 'DIAGNOSTICS' && (
        <DiagnosticsView
          version={version}
          reliabilityMetrics={defaultMetrics}
          guardrailAlerts={guardrailAlerts}
          issues={issues}
          storageHealth={defaultStorage}
          onUpdateIssueResolution={onUpdateIssueResolution}
          onClearDiagnostics={onClearDiagnostics}
        />
      )}
    </div>
  );
};
