/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Dedicated Run Status Experience
 * 
 * Strict Invariants:
 * - Factual execution state: SKIPPED != NOT_QUALIFIED, BLOCKED != NOT_FOUND, CONTRACT_ONLY != COMPLETED
 * - Live topological stage progress graph
 * - aria-live dynamic status announcements for assistive technology
 * - Real checkpoint / resume / pause / stop actions
 */

import React from 'react';
import { RunStatusViewModel, StageStatusViewModel } from '../types.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface RunStatusViewProps {
  runStatus: RunStatusViewModel | null;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onViewResults?: () => void;
  onInspectDiagnostics?: () => void;
}

export const RunStatusView: React.FC<RunStatusViewProps> = ({
  runStatus,
  onPause,
  onResume,
  onStop,
  onViewResults,
  onInspectDiagnostics
}) => {
  if (!runStatus) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <span className="text-3xl mb-2">⏱</span>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">No Active Run</h3>
        <p className="text-xs text-slate-500 max-w-xs">
          Active run data not available. Select a source and launch a research plan to observe live pipeline execution.
        </p>
      </div>
    );
  }

  const isRunning = runStatus.globalStatus === 'RUNNING';
  const isCompleted = runStatus.globalStatus === 'COMPLETED' || runStatus.globalStatus === 'COMPLETED_WITH_WARNINGS';
  const isPartial = runStatus.globalStatus === 'PARTIAL';

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
      {/* Screen Reader ARIA Live Region */}
      <div className="sr-only" role="status" aria-live="polite">
        Current run status: {runStatus.globalStatusText}. Active source: {runStatus.activeSource}.
      </div>

      {/* Top Banner: Global Status & Controls */}
      <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2.5">
          <StatusBadge status={runStatus.globalStatus} />
          <div>
            <span className="text-xs font-semibold text-slate-200 block">
              Run: {runStatus.runId}
            </span>
            <span className="text-[11px] text-slate-400">
              Source: <strong className="text-slate-300">{runStatus.activeSource}</strong> ({runStatus.sourceStatus})
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {isRunning && onPause && (
            <button
              type="button"
              onClick={onPause}
              disabled={!runStatus.isPausable}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="Pause active research run"
            >
              ⏸ Pause
            </button>
          )}

          {isPartial && onResume && (
            <button
              type="button"
              onClick={onResume}
              disabled={!runStatus.isResumable}
              className="px-2.5 py-1 text-xs font-semibold text-sky-300 bg-sky-950/60 hover:bg-sky-900/60 rounded border border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="Resume partial research run"
            >
              ▶ Resume
            </button>
          )}

          {(isRunning || isPartial) && onStop && (
            <button
              type="button"
              onClick={onStop}
              disabled={!runStatus.isStoppable}
              className="px-2.5 py-1 text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 rounded border border-rose-500/40 focus:outline-none focus:ring-2 focus:ring-rose-400"
              aria-label="Stop research run"
            >
              ⏹ Stop
            </button>
          )}

          {isCompleted && onViewResults && (
            <button
              type="button"
              onClick={onViewResults}
              className="px-3 py-1 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 rounded border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="View research results"
            >
              View Results →
            </button>
          )}
        </div>
      </div>

      {/* Progress & Checkpoint Overview */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800">
          <span className="text-[10px] uppercase text-slate-500 block mb-0.5">Candidates</span>
          <span className="text-base font-bold text-slate-100">{runStatus.candidatesProcessed}</span>
        </div>
        <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800">
          <span className="text-[10px] uppercase text-slate-500 block mb-0.5">Elapsed Time</span>
          <span className="text-base font-bold text-slate-100">{(runStatus.elapsedMs / 1000).toFixed(1)}s</span>
        </div>
        <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800">
          <span className="text-[10px] uppercase text-slate-500 block mb-0.5">Checkpoint</span>
          <span className="text-xs font-mono text-slate-300 truncate block">
            {runStatus.checkpointId ? runStatus.checkpointId.substring(0, 10) : 'None'}
          </span>
        </div>
      </div>

      {/* Warnings & Diagnostics notices */}
      {runStatus.hasWarnings && (
        <div className="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded text-xs text-amber-200">
          <strong className="block font-semibold mb-0.5">Run Completed With Warnings:</strong>
          <ul className="list-disc list-inside text-[11px] text-amber-300/90 space-y-0.5">
            {runStatus.warningMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 12-Stage Pipeline Progress Graph */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pipeline Stage Graph (12 Stages)
          </span>
          {onInspectDiagnostics && (
            <button
              type="button"
              onClick={onInspectDiagnostics}
              className="text-[11px] text-sky-400 hover:text-sky-300 underline focus:outline-none"
            >
              Inspect Diagnostics
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {runStatus.stages.map((stage: StageStatusViewModel) => (
            <div
              key={stage.stageId}
              className={`p-2 rounded border text-xs flex flex-col justify-between transition-colors ${
                stage.isActive
                  ? 'bg-sky-950/40 border-sky-500/60 text-sky-200'
                  : stage.isCompleted
                  ? 'bg-slate-950/50 border-slate-800 text-slate-300'
                  : stage.isBlocked
                  ? 'bg-purple-950/30 border-purple-500/40 text-purple-300'
                  : stage.isSkipped
                  ? 'bg-slate-950/30 border-slate-800/80 text-slate-500'
                  : stage.isFailed
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  : 'bg-slate-950/20 border-slate-900 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] truncate max-w-[130px] font-medium" title={stage.label}>
                  {stage.label}
                </span>
                <span className="text-[10px] font-bold">
                  {stage.isCompleted && '✓'}
                  {stage.isActive && '⟳'}
                  {stage.isBlocked && '⊘'}
                  {stage.isSkipped && '—'}
                  {stage.isFailed && '✕'}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                {stage.stateText}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
