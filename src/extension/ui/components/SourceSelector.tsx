/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Primary Source Selector Component
 * 
 * Strict Invariants:
 * - Prominent, simple selection: [ From Meta Ad Library ] and [ From Google Maps ]
 * - Google Maps visibly declared CONTRACT_ONLY: "Contract available. Live extraction is not enabled."
 * - Non-color-only state indicators (Icon + Text + ARIA label)
 * - Keyboard navigable with standard focus-visible rings
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
  const isGmaps = selectedSource === 'GOOGLE_MAPS';

  return (
    <div className="w-full flex flex-col gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Research Source
        </span>
        <span className="text-[11px] text-slate-500">
          Explicit Source Selection
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Select research source">
        {/* Option 1: Meta Ad Library */}
        <button
          type="button"
          role="radio"
          aria-checked={isMeta}
          aria-label="From Meta Ad Library (Available for live discovery)"
          disabled={disabled}
          onClick={() => onSelectSource('META')}
          className={`flex flex-col items-start p-3 rounded-md border text-left transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 ${
            isMeta
              ? 'bg-slate-800 border-sky-500/80 shadow-sm shadow-sky-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="font-medium text-sm text-slate-100 flex items-center gap-1.5">
              <span className="text-sky-400" aria-hidden="true">⦿</span>
              From Meta Ad Library
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 rounded">
              <span aria-hidden="true">✓</span> AVAILABLE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Public commercial advertiser signals with active creative presence.
          </p>
        </button>

        {/* Option 2: Google Maps */}
        <button
          type="button"
          role="radio"
          aria-checked={isGmaps}
          aria-label="From Google Maps (Contract available, live extraction not enabled)"
          disabled={disabled}
          onClick={() => onSelectSource('GOOGLE_MAPS')}
          className={`flex flex-col items-start p-3 rounded-md border text-left transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 ${
            isGmaps
              ? 'bg-slate-800 border-purple-500/80 shadow-sm shadow-purple-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="font-medium text-sm text-slate-100 flex items-center gap-1.5">
              <span className="text-purple-400" aria-hidden="true">⊘</span>
              From Google Maps
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-purple-400 bg-purple-950/60 border border-purple-500/40 rounded">
              <span aria-hidden="true">⊘</span> CONTRACT ONLY
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Contract &amp; geographic planning available. Live extraction is not enabled.
          </p>
        </button>
      </div>

      {/* Factual disclaimer */}
      {isGmaps && (
        <div 
          className="mt-1 p-2.5 rounded bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-200 flex items-start gap-2"
          role="status"
          aria-live="polite"
        >
          <span className="text-purple-400 text-sm leading-none mt-0.5" aria-hidden="true">ℹ</span>
          <span>
            <strong>Architectural Invariant:</strong> Google Maps operates strictly in <code className="px-1 py-0.5 bg-purple-900/50 rounded text-purple-300 font-mono">CONTRACT_ONLY</code> mode. You may plan geographic coverage, inspect SearchUnits, or replay test fixtures. Live extraction cannot be executed.
          </span>
        </div>
      )}
    </div>
  );
};
