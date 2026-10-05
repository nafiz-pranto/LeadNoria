/**
 * LeadNoria — Phase 25: Unified Lead Intelligence UI & Research Workflow Integration
 * Research Configuration View Component
 * 
 * Strict Invariants:
 * - Simple, human-understandable controls only
 * - Source: [ From Meta Ad Library ] (approved production source)
 * - Geographic Scope (Country / Region / City)
 * - Category & Query Scope (Industry Preset or Custom Keywords)
 * - Max Candidates Limit
 * - No internal adapter names, provenance flags, execution mode switches, search-unit IDs, retry counters
 * - Review Research Plan before execution
 */

import React, { useState } from 'react';
import { SourceType, ExecutionMode } from '../../pipeline/pipelineTypes.ts';
import { SourceSelector } from './SourceSelector.tsx';
import { RESEARCH_PRESETS } from '../../../data/presetCatalogue.ts';
import { META_AD_LIBRARY_LOCATIONS } from '../../../data/locationCatalogue.ts';

interface ResearchConfigViewProps {
  selectedSource: SourceType;
  onSelectSource: (source: SourceType) => void;
  onOpenPlanReview: (config: {
    sourceType: SourceType;
    executionMode: ExecutionMode;
    keywords: string[];
    countryCode: string;
    locationName?: string;
    maxCandidates: number;
    presetName?: string;
  }) => void;
  disabled?: boolean;
}

export const ResearchConfigView: React.FC<ResearchConfigViewProps> = ({
  selectedSource,
  onSelectSource,
  onOpenPlanReview,
  disabled = false
}) => {
  const [modeType, setModeType] = useState<'PRESET' | 'CUSTOM'>('PRESET');
  const [presetId, setPresetId] = useState<string>(RESEARCH_PRESETS[0]?.preset_id || '');
  const [customKeywords, setCustomKeywords] = useState<string>('Furniture, Home Decor');
  const [countryCode, setCountryCode] = useState<string>('BD');
  const [maxCandidates, setMaxCandidates] = useState<number>(200);

  const selectedPreset = RESEARCH_PRESETS.find(p => p.preset_id === presetId) || RESEARCH_PRESETS[0];

  const handleReviewClick = () => {
    let keywords: string[] = [];
    let presetName: string | undefined;

    if (modeType === 'PRESET' && selectedPreset) {
      keywords = selectedPreset.primary_keywords;
      presetName = selectedPreset.name;
    } else {
      keywords = customKeywords
        .split(/[,;\n]/)
        .map(k => k.trim())
        .filter(k => k.length > 0);
    }

    const selectedLoc = META_AD_LIBRARY_LOCATIONS.find(l => l.locationCode === countryCode);

    onOpenPlanReview({
      sourceType: selectedSource,
      executionMode: 'LIVE',
      keywords,
      countryCode,
      locationName: selectedLoc?.displayName || countryCode,
      maxCandidates,
      presetName
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
      {/* 1. Source Selector (Approved Production Source) */}
      <SourceSelector
        selectedSource={selectedSource}
        onSelectSource={onSelectSource}
        disabled={disabled}
      />

      {/* 2. Geographic Scope */}
      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
        <label htmlFor="geo-country-select" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Geographic Scope
        </label>
        <select
          id="geo-country-select"
          value={countryCode}
          onChange={e => setCountryCode(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          {META_AD_LIBRARY_LOCATIONS.map(loc => (
            <option key={loc.locationCode} value={loc.locationCode}>
              {loc.displayName} ({loc.locationCode})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Category / Query Scope */}
      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Category &amp; Query Scope
          </span>
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
            <button
              type="button"
              onClick={() => setModeType('PRESET')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                modeType === 'PRESET' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Industry Preset
            </button>
            <button
              type="button"
              onClick={() => setModeType('CUSTOM')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                modeType === 'CUSTOM' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom Keywords
            </button>
          </div>
        </div>

        {modeType === 'PRESET' ? (
          <div>
            <select
              value={presetId}
              onChange={e => setPresetId(e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 mb-1"
              aria-label="Select industry research preset"
            >
              {RESEARCH_PRESETS.map(p => (
                <option key={p.preset_id} value={p.preset_id}>
                  {p.name} ({p.industry})
                </option>
              ))}
            </select>
            {selectedPreset && (
              <p className="text-[11px] text-slate-400">
                Keywords: <span className="text-slate-300 font-mono">{selectedPreset.primary_keywords.join(', ')}</span>
              </p>
            )}
          </div>
        ) : (
          <div>
            <textarea
              rows={2}
              value={customKeywords}
              onChange={e => setCustomKeywords(e.target.value)}
              disabled={disabled}
              placeholder="Enter comma-separated keywords (e.g. Roofing, Gutter Repair)"
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="Custom research keywords"
            />
            <p className="text-[10px] text-slate-500">Separate multiple search terms with commas or newlines.</p>
          </div>
        )}
      </div>

      {/* 4. Research Scope Limit */}
      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
        <label htmlFor="max-candidates-input" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Max Leads Target
        </label>
        <div className="flex items-center gap-3">
          <input
            id="max-candidates-input"
            type="number"
            min={10}
            max={1000}
            value={maxCandidates}
            onChange={e => setMaxCandidates(Math.max(10, Math.min(1000, parseInt(e.target.value) || 100)))}
            disabled={disabled}
            className="w-32 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <span className="text-[11px] text-slate-400">Target unique relevant business leads to discover.</span>
        </div>
      </div>

      {/* 5. Review & Launch Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleReviewClick}
        className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-sky-600/20 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>📋</span> Review Research Plan →
      </button>
    </div>
  );
};
