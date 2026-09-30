/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Persisted Research History View Component
 * 
 * Strict Invariants:
 * - Uses actual persisted runs from chrome.storage.local
 * - Factual metrics, no fabricated history entries
 */

import React from 'react';
import { ExtensionResearchRun } from '../../types.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface HistoryViewProps {
  runs: ExtensionResearchRun[];
  onSelectRun: (run: ExtensionResearchRun) => void;
  onClearHistory?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  runs,
  onSelectRun,
  onClearHistory
}) => {
  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
        <span className="text-3xl mb-2">📜</span>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">No Saved Research Runs</h3>
        <p className="text-xs text-slate-500 max-w-xs">
          Historical research data not available. Completed research runs are automatically archived locally for inspection and export.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-400">
          Showing <strong>{runs.length}</strong> archived runs
        </span>
        {onClearHistory && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-[11px] text-slate-400 hover:text-rose-400 underline focus:outline-none"
          >
            Clear All History
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {runs.map(run => {
          const leadCount = run.leads ? run.leads.length : 0;
          const dateStr = run.timestamp ? new Date(run.timestamp).toLocaleString() : 'Recent';

          return (
            <div
              key={run.runId}
              onClick={() => onSelectRun(run)}
              className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xs font-semibold text-slate-200">
                    {run.researchName || `Run ${run.runId.substring(0, 8)}`}
                  </h4>
                  <StatusBadge status={run.status} size="sm" />
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>{dateStr}</span>
                  <span>•</span>
                  <span>{run.locationName || run.countryCode}</span>
                  {run.keywords && run.keywords.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[120px] font-mono">{run.keywords.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-sky-400 block">{leadCount}</span>
                <span className="text-[10px] text-slate-500 uppercase">Leads</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
