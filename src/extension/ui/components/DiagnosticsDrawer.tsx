/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Technical Diagnostics Drawer Component
 * 
 * Strict Invariants:
 * - Surfaces technical metadata without cluttering normal workflow
 * - Does not expose internal secrets or raw stack traces
 * - Accessible drawer: Escape to dismiss
 */

import React, { useEffect, useRef } from 'react';
import { DiagnosticsViewModel } from '../types.ts';

interface DiagnosticsDrawerProps {
  isOpen: boolean;
  diagnostics: DiagnosticsViewModel | null;
  onClose: () => void;
}

export const DiagnosticsDrawer: React.FC<DiagnosticsDrawerProps> = ({
  isOpen,
  diagnostics,
  onClose
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    drawerRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !diagnostics) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diag-title"
    >
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="w-full max-w-md bg-slate-900 border-l border-slate-700 h-full flex flex-col shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div>
            <h2 id="diag-title" className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              <span>🔧</span> Technical Diagnostics
            </h2>
            <p className="text-[11px] text-slate-500">Pipeline runtime execution metadata</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 focus:outline-none"
            aria-label="Close diagnostics"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex flex-col gap-3 text-xs text-slate-300">
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 flex flex-col gap-1.5 font-mono text-[11px]">
            <div>
              <span className="text-slate-500">runId:</span> <span className="text-slate-200">{diagnostics.runId}</span>
            </div>
            <div>
              <span className="text-slate-500">pipelineVersion:</span> <span className="text-slate-200">{diagnostics.pipelineVersion}</span>
            </div>
            <div>
              <span className="text-slate-500">planVersion:</span> <span className="text-slate-200">{diagnostics.planVersion}</span>
            </div>
            <div>
              <span className="text-slate-500">currentStage:</span> <span className="text-sky-300">{diagnostics.currentStage || 'None'}</span>
            </div>
            <div>
              <span className="text-slate-500">elapsedDuration:</span> <span className="text-slate-200">{diagnostics.elapsedDurationMs}ms</span>
            </div>
            <div>
              <span className="text-slate-500">retriesAttempted:</span> <span className="text-slate-200">{diagnostics.retriesAttempted}</span>
            </div>
            <div>
              <span className="text-slate-500">checkpointId:</span> <span className="text-slate-200">{diagnostics.checkpointId || 'None'}</span>
            </div>
          </div>

          {/* Source Adapter Versions */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Source Adapter Versions:
            </span>
            <div className="p-2 bg-slate-950/40 rounded border border-slate-800 font-mono text-[11px] space-y-1">
              {Object.entries(diagnostics.adapterVersions).map(([src, ver]) => (
                <div key={src} className="flex justify-between">
                  <span className="text-slate-400">{src}:</span>
                  <span className="text-slate-200">{ver}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Blocked operations notice */}
          {diagnostics.blockedOperationsCount > 0 && (
            <div className="p-2.5 bg-purple-950/30 border border-purple-500/30 rounded text-[11px] text-purple-200">
              <strong className="block text-purple-300">Policy Blocked Operations:</strong>
              {diagnostics.blockedOperationsCount} operations gated by source capability or compliance rules.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
