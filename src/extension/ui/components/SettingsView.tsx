/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Settings & Privacy Disclosure View
 * 
 * Strict Invariants:
 * - Factual local processing disclosures (no false "offline" claims, no legal guarantees)
 * - Exposes user preferences only, never security-sensitive internal controls
 * - Technical diagnostics affordance
 */

import React from 'react';

interface SettingsViewProps {
  onOpenDiagnostics: () => void;
  onClearLocalHistory?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenDiagnostics,
  onClearLocalHistory
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
      <div className="border-b border-slate-800 pb-2">
        <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
          <span>⚙</span> Settings &amp; Compliance Disclosures
        </h2>
        <p className="text-[11px] text-slate-500">Local runtime configuration and privacy architecture</p>
      </div>

      {/* Local Processing Architecture Disclosure */}
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

      {/* Source Capability Declarations */}
      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Source Capabilities
        </h3>
        <ul className="space-y-1.5 text-[11px]">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <div>
              <strong className="text-slate-200">Meta Ad Library:</strong> Public UI advertiser search, creative signals, and domain pointers.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">⊘</span>
            <div>
              <strong className="text-slate-200">Google Maps:</strong> Contract planning &amp; geographic partitioning only. Live extraction is not enabled.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <div>
              <strong className="text-slate-200">Public Websites:</strong> Bounded same-origin verification and contact discovery.
            </div>
          </li>
        </ul>
      </div>

      {/* Local Storage & Cache Management */}
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
            Clear History
          </button>
        )}
      </div>

      {/* Technical Diagnostics Trigger */}
      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
        <div>
          <span className="font-semibold text-slate-200 block mb-0.5">Pipeline Diagnostics</span>
          <span className="text-[11px] text-slate-500">Inspect versioning, adapter contracts, and checkpoint metadata</span>
        </div>
        <button
          type="button"
          onClick={onOpenDiagnostics}
          className="px-3 py-1 text-xs font-medium text-sky-300 hover:text-sky-100 bg-sky-950/40 hover:bg-sky-900/40 rounded border border-sky-500/40 transition-colors focus:outline-none"
        >
          Open Diagnostics
        </button>
      </div>
    </div>
  );
};
