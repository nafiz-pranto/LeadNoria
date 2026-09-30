/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Plan Review Modal Component
 * 
 * Strict Invariants:
 * - Review plan before executing potentially large runs
 * - Disables execution if Google Maps is in LIVE mode
 * - Displays factual planned values (SearchUnits, categories, limits)
 * - Accessible modal: focus trap, Escape to dismiss
 */

import React, { useEffect, useRef } from 'react';
import { PlanReviewViewModel } from '../types.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface PlanReviewModalProps {
  isOpen: boolean;
  plan: PlanReviewViewModel;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const PlanReviewModal: React.FC<PlanReviewModalProps> = ({
  isOpen,
  plan,
  onConfirm,
  onCancel,
  isSubmitting = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    confirmBtnRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-review-title"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 id="plan-review-title" className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>📋</span> Research Plan Review
            </h2>
            <p className="text-xs text-slate-400">
              Review planned parameters before starting execution
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Close plan review"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex flex-col gap-4 text-xs text-slate-300">
          {/* Source & Mode */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">
                Source Type
              </span>
              <span className="font-semibold text-slate-200">
                {plan.sourceType}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">
                Execution Mode
              </span>
              <StatusBadge status={plan.executionMode} size="sm" />
            </div>
          </div>

          {/* Metric Estimates */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700/60 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">Planned Units</span>
              <span className="text-base font-bold text-sky-400">{plan.plannedSearchUnitsCount}</span>
            </div>
            <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700/60 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">Max Candidates</span>
              <span className="text-base font-bold text-slate-200">{plan.maxCandidatesLimit}</span>
            </div>
            <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700/60 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">Timeout</span>
              <span className="text-base font-bold text-slate-200">{plan.timeoutSeconds}s</span>
            </div>
          </div>

          {/* Enabled Stages */}
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1.5 font-medium">
              Enabled Pipeline Stages ({plan.enabledStages.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {plan.enabledStages.map(stage => (
                <span 
                  key={stage}
                  className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300 rounded"
                >
                  {stage}
                </span>
              ))}
            </div>
          </div>

          {/* Qualification Profile */}
          <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Qualification Profile:</span>
            <span className="font-semibold text-slate-200">{plan.qualificationProfileName}</span>
          </div>

          {/* Safety Warnings & Blocks */}
          {!plan.canExecuteLive && (
            <div 
              className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2"
              role="alert"
            >
              <span className="text-rose-400 text-sm font-bold">⊘</span>
              <div>
                <strong className="block font-semibold">Execution Blocked:</strong>
                {plan.blockedReason || 'Google Maps operates strictly in CONTRACT_ONLY mode and cannot execute live extraction.'}
              </div>
            </div>
          )}

          {plan.safetyWarnings.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex flex-col gap-1">
              <strong className="font-semibold flex items-center gap-1">
                <span>⚠️</span> Plan Safety Advisories:
              </strong>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200">
                {plan.safetyWarnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            disabled={!plan.canExecuteLive || isSubmitting}
            onClick={onConfirm}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400 ${
              plan.canExecuteLive && !isSubmitting
                ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm shadow-sky-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⟳</span>
                Starting...
              </>
            ) : (
              <>
                <span>▶</span>
                Confirm &amp; Run
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
