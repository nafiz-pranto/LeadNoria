/**
 * LeadNoria — Phase 25: Unified Lead Intelligence UI & Research Workflow Integration
 * Primary Source Selector Component
 * 
 * Strict Invariants:
 * - Production research displays ONLY approved production source: [ From Meta Ad Library ]
 * - Google Maps must NOT appear as a normal selectable production source
 * - Non-color-only state indicators (Icon + Text + ARIA label)
 * - Keyboard navigable with standard focus-visible rings
 * - Preserves "CONTRACT ONLY" architectural invariant notice for security and policy traceability
 */

import React from 'react';
import { SourceType } from '../../pipeline/pipelineTypes.ts';

interface SourceSelectorProps {
  selectedSource: SourceType;
  onSelectSource: (source: SourceType) => void;
  disabled?: boolean;
}

export const SourceSelector: React.FC<SourceSelectorProps> = ({
  selectedSource,
  onSelectSource,
  disabled = false
}) => {
  const isMeta = selectedSource === 'META';

  return (
    <div className="w-full flex flex-col gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Research Source
        </span>
        <span className="text-[11px] text-slate-500">
          Approved Production Source
        </span>
      </div>

      <div className="w-full" role="radiogroup" aria-label="Select research source">
        {/* Approved Production Source: Meta Ad Library */}
        <button
          type="button"
          role="radio"
          aria-checked={isMeta}
          aria-label="From Meta Ad Library (Approved production source for commercial discovery)"
          disabled={disabled}
          onClick={() => onSelectSource('META')}
          className="w-full flex flex-col items-start p-3 rounded-md border text-left transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 bg-slate-800 border-sky-500/80 shadow-sm shadow-sky-500/10 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
              <span className="text-sky-400" aria-hidden="true">⦿</span>
              From Meta Ad Library
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 rounded">
              <span aria-hidden="true">✓</span> APPROVED PRODUCTION SOURCE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Public commercial advertiser signals with active creative presence.
          </p>
        </button>
      </div>

      {/* Contract & Policy Invariant Notice */}
      <div 
        className="mt-1 p-2 rounded bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between"
        role="status"
        aria-label="Source contract status"
      >
        <span>Production signals: Meta Ad Library</span>
        <span className="font-mono text-slate-500">CONTRACT ONLY: Google Maps live extraction disabled</span>
      </div>
    </div>
  );
};
