/**
 * LeadNoria — Part 4: Bulk Research Orchestration Engine
 * Google Maps Bulk Research Setup, Progress & Control View Component
 *
 * Strict Invariants:
 * - Deterministic Cartesian planning (Keywords x Locations)
 * - Single active acquisition tab (Concurrency = 1)
 * - Canonical Part 3 rating & website filtering
 * - Large-plan protection (> 500 units warning)
 * - Distinct candidate metrics: Observed, Unique, Filtered Matches
 * - Pause / Resume / Cancel controls
 * - Full accessibility: semantic fieldsets, legends, aria-live progress
 * - Preserves Google Data Firewall (no raw Google PII displayed beyond ephemeral in-session UI)
 */

import React, { useState, useMemo } from 'react';
import type { RatingFilterOption, WebsiteFilterOption } from '../../acquisition/engine/filterTypes.ts';
import type { BulkRunSnapshot, BulkRunState } from '../../acquisition/engine/bulkPlanTypes.ts';
import { normalizeKeywordList, normalizeLocationList, MAX_RECOMMENDED_SEARCH_UNITS } from '../../acquisition/engine/bulkPlanner.ts';
import { qualifiesCandidate, type ResearchFilters } from '../../qualification/googleMaps/index.ts';
import { googleMapsResultsToTsv, writeClipboardText } from '../../clipboard/index.ts';

export interface GoogleMapsBulkResearchViewProps {
  onStartBulkResearch?: (request: {
    keywords: string[];
    locations: string[];
    ratingFilter: RatingFilterOption;
    websiteFilter: WebsiteFilterOption;
    maxResults?: number;
  }) => void;
  onPauseBulkResearch?: () => void;
  onResumeBulkResearch?: () => void;
  onCancelBulkResearch?: () => void;
  onFilterChange?: (rating: RatingFilterOption, website: WebsiteFilterOption) => void;
  activeSnapshot?: BulkRunSnapshot | null;
  candidates?: readonly unknown[];
  disabled?: boolean;
}

export const GoogleMapsBulkResearchView: React.FC<GoogleMapsBulkResearchViewProps> = ({
  onStartBulkResearch,
  onPauseBulkResearch,
  onResumeBulkResearch,
  onCancelBulkResearch,
  onFilterChange,
  activeSnapshot,
  candidates,
  disabled = false
}) => {
  // Input state
  const [keywordsInput, setKeywordsInput] = useState<string>(
    'real estate developer\nproperty developer\nconstruction company'
  );
  const [locationsInput, setLocationsInput] = useState<string>(
    'Dhaka\nChattogram\nSylhet'
  );

  // Filter state (Canonical Part 3 representation)
  const [ratingFilter, setRatingFilter] = useState<RatingFilterOption>('ANY');
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilterOption>('ANY');

  // Max results state
  const [maxResultsPreset, setMaxResultsPreset] = useState<'50' | '100' | '250' | '500' | 'CUSTOM'>('100');
  const [customMaxResults, setCustomMaxResults] = useState<number>(100);

  // Copy All state
  const [isCopying, setIsCopying] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Large plan explicit confirmation
  const [largePlanConfirmed, setLargePlanConfirmed] = useState<boolean>(false);

  // Normalized preview calculations
  const normalizedKeywords = useMemo(() => normalizeKeywordList(keywordsInput.split('\n')), [keywordsInput]);
  const normalizedLocations = useMemo(() => normalizeLocationList(locationsInput.split('\n')), [locationsInput]);
  const plannedUnitsCount = normalizedKeywords.length * normalizedLocations.length;
  const isLargePlan = plannedUnitsCount > MAX_RECOMMENDED_SEARCH_UNITS;

  // Validation
  const validationError = useMemo(() => {
    if (normalizedKeywords.length === 0) {
      return 'Please enter at least one valid keyword.';
    }
    if (normalizedLocations.length === 0) {
      return 'Please enter at least one valid location.';
    }
    if (isLargePlan && !largePlanConfirmed) {
      return `Plan size of ${plannedUnitsCount.toLocaleString()} SearchUnits exceeds policy threshold (${MAX_RECOMMENDED_SEARCH_UNITS}). Please reduce scope or check confirmation.`;
    }
    return null;
  }, [normalizedKeywords.length, normalizedLocations.length, isLargePlan, largePlanConfirmed, plannedUnitsCount]);

  const isRunning = activeSnapshot?.state === 'RUNNING';
  const isPaused = activeSnapshot?.state === 'PAUSED';
  const isActive = isRunning || isPaused || activeSnapshot?.state === 'QUEUED' || activeSnapshot?.state === 'COMPLETING';
  const isTerminal = activeSnapshot ? ['COMPLETED', 'PARTIALLY_COMPLETED', 'FAILED', 'CANCELLED', 'BLOCKED'].includes(activeSnapshot.state) : false;

  const effectiveMaxResults = maxResultsPreset === 'CUSTOM' ? customMaxResults : parseInt(maxResultsPreset, 10);

  const handleStart = () => {
    if (validationError || !onStartBulkResearch || disabled || isActive) return;
    onStartBulkResearch({
      keywords: normalizedKeywords,
      locations: normalizedLocations,
      ratingFilter,
      websiteFilter,
      maxResults: effectiveMaxResults
    });
  };

  // Live qualification evaluation helper using canonical qualification engine
  const checkCandidateQualification = useMemo(() => {
    return (cand: any) => qualifiesCandidate(cand, {
      rating: ratingFilter as any,
      website: websiteFilter as any,
      maxResults: effectiveMaxResults
    });
  }, [ratingFilter, websiteFilter, effectiveMaxResults]);

  const handleRatingChange = (newRating: RatingFilterOption) => {
    setRatingFilter(newRating);
    if (onFilterChange) {
      onFilterChange(newRating, websiteFilter);
    }
  };

  const handleWebsiteChange = (newWebsite: WebsiteFilterOption) => {
    setWebsiteFilter(newWebsite);
    if (onFilterChange) {
      onFilterChange(ratingFilter, newWebsite);
    }
  };

  // Human-readable status copy
  const getStatusCopy = (snapshot: BulkRunSnapshot): string => {
    switch (snapshot.state) {
      case 'QUEUED':
        return 'Queued — Preparing research run...';
      case 'RUNNING':
        if (snapshot.currentUnit) {
          return `Running search ${snapshot.progress.unitsCompleted + 1} of ${snapshot.totalUnits}...`;
        }
        return 'Running bulk research...';
      case 'PAUSED':
        return 'Research run paused.';
      case 'COMPLETING':
        return 'Finalizing research results...';
      case 'COMPLETED':
        return `Completed all ${snapshot.totalUnits} searches.`;
      case 'PARTIALLY_COMPLETED':
        return `Partially completed — ${snapshot.completedUnits} finished, ${snapshot.failedUnits} failed, ${snapshot.cancelledUnits} cancelled.`;
      case 'FAILED':
        return `Run failed: ${snapshot.terminationReason || 'Execution error'}`;
      case 'CANCELLED':
        return 'Research run cancelled by user.';
      case 'BLOCKED':
        return 'Research run blocked by policy guardrails.';
      default:
        return 'Ready to start bulk research.';
    }
  };

  // Copy All Handler
  const availableCandidatesCount = candidates
    ? candidates.length
    : (activeSnapshot?.metrics.currentFilteredMatchCount ?? 0);

  const handleCopyAll = async () => {
    if (isCopying) return;
    setIsCopying(true);
    setCopyFeedback(null);

    try {
      let candidateList: readonly unknown[] = [];

      if (candidates && candidates.length > 0) {
        candidateList = candidates;
      } else if (activeSnapshot?.runId && typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        // Query current filtered view for the active bulk run session
        const resp: any = await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            {
              type: 'GET_GMAPS_FILTERED_VIEW',
              source: 'GMAPS_ENGINE',
              payload: { sessionId: activeSnapshot.runId }
            },
            (response) => resolve(response)
          );
        });

        if (resp?.success && resp.view?.matchingObservations) {
          candidateList = resp.view.matchingObservations;
        } else if (resp?.success && resp.view?.visibleCandidates) {
          candidateList = resp.view.visibleCandidates;
        }
      }

      if (candidateList.length === 0) {
        setCopyFeedback({
          type: 'error',
          message: 'No results available to copy.'
        });
        setIsCopying(false);
        return;
      }

      const tsv = googleMapsResultsToTsv(candidateList);
      const writeResult = await writeClipboardText(tsv);

      if (writeResult.success) {
        setCopyFeedback({
          type: 'success',
          message: `${candidateList.length} results copied`
        });
        setTimeout(() => {
          setCopyFeedback(prev => prev?.type === 'success' ? null : prev);
        }, 3000);
      } else {
        setCopyFeedback({
          type: 'error',
          message: 'Could not copy results to clipboard.'
        });
      }
    } catch (_err) {
      setCopyFeedback({
        type: 'error',
        message: 'Could not copy results to clipboard.'
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div
      className="flex flex-col gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl"
      role="region"
      aria-label="Google Maps bulk research orchestration"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🗺️</span> Google Maps Bulk Research
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sequential multi-keyword &amp; multi-location acquisition with live filtering
          </p>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-sky-950 text-sky-400 border border-sky-800 rounded-full">
          Concurrency: 1
        </span>
      </div>

      {/* Input Section (Only interactive when no active run) */}
      {!isActive && (
        <div className="flex flex-col gap-3">
          {/* Keywords & Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Keywords Input */}
            <div className="flex flex-col gap-1">
              <label htmlFor="bulk-keywords-input" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Keywords <span className="text-slate-500 font-normal">(one per line)</span>
              </label>
              <textarea
                id="bulk-keywords-input"
                rows={4}
                value={keywordsInput}
                onChange={e => {
                  setKeywordsInput(e.target.value);
                  setLargePlanConfirmed(false);
                }}
                disabled={disabled}
                placeholder="e.g. real estate developer&#10;property developer&#10;construction company"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono resize-y"
                aria-label="Search keywords, one per line"
              />
              <span className="text-[11px] text-slate-400">
                {normalizedKeywords.length} valid keyword{normalizedKeywords.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Locations Input */}
            <div className="flex flex-col gap-1">
              <label htmlFor="bulk-locations-input" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Locations <span className="text-slate-500 font-normal">(one per line)</span>
              </label>
              <textarea
                id="bulk-locations-input"
                rows={4}
                value={locationsInput}
                onChange={e => {
                  setLocationsInput(e.target.value);
                  setLargePlanConfirmed(false);
                }}
                disabled={disabled}
                placeholder="e.g. Dhaka&#10;Chattogram&#10;Sylhet"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono resize-y"
                aria-label="Search locations, one per line"
              />
              <span className="text-[11px] text-slate-400">
                {normalizedLocations.length} valid location{normalizedLocations.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Plan Preview Card */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-medium">Deterministic Plan:</span>
              <span className="px-2 py-0.5 bg-slate-800 text-sky-300 rounded font-semibold font-mono text-xs">
                {normalizedKeywords.length} keywords × {normalizedLocations.length} locations = {plannedUnitsCount} searches
              </span>
            </div>
            {isLargePlan && (
              <span className="text-amber-400 font-medium flex items-center gap-1 text-[11px]">
                <span>⚠️</span> High volume
              </span>
            )}
          </div>

          {/* Large-Plan Safety Warning */}
          {isLargePlan && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 text-sm font-bold">⚠️</span>
                <div>
                  <h4 className="font-semibold text-amber-300">Large Research Plan Warning</h4>
                  <p className="text-amber-200/80 text-[11px] mt-0.5">
                    This plan contains {plannedUnitsCount.toLocaleString()} SearchUnits, exceeding the recommended limit of {MAX_RECOMMENDED_SEARCH_UNITS}. Sequential browser acquisition may take a prolonged duration.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-amber-200 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  id="bulk-large-plan-confirm"
                  checked={largePlanConfirmed}
                  onChange={e => setLargePlanConfirmed(e.target.checked)}
                  className="rounded border-amber-600 bg-slate-950 text-amber-500 focus:ring-2 focus:ring-amber-400"
                />
                <span className="text-[11px] font-medium">
                  I understand this is a large research plan and want to proceed.
                </span>
              </label>
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <p className="text-xs text-rose-400 flex items-center gap-1.5" role="alert">
              <span>⚠️</span> {validationError}
            </p>
          )}
        </div>
      )}

      {/* Filter Selection (Always mutable, does NOT restart acquisition) */}
      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Result Filters <span className="text-slate-500 font-normal lowercase">(view-only, changes live)</span>
          </span>
          <button
            type="button"
            onClick={() => {
              handleRatingChange('ANY');
              handleWebsiteChange('ANY');
            }}
            disabled={ratingFilter === 'ANY' && websiteFilter === 'ANY'}
            className="text-[11px] text-sky-400 hover:text-sky-300 disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer"
          >
            Reset Filters
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-1 border-t border-slate-800/80">
          {/* Rating */}
          <fieldset className="flex items-center gap-3 border-none p-0 m-0">
            <legend className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Rating:
            </legend>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer">
              <input
                type="radio"
                name="bulk-rating-filter"
                value="ANY"
                checked={ratingFilter === 'ANY'}
                onChange={() => handleRatingChange('ANY')}
                className="rounded-full border-slate-700 bg-slate-950 text-sky-500 focus:ring-2 focus:ring-sky-400"
              />
              <span>Any</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer">
              <input
                type="radio"
                name="bulk-rating-filter"
                value="MIN_4_0"
                checked={ratingFilter === 'MIN_4_0'}
                onChange={() => handleRatingChange('MIN_4_0')}
                className="rounded-full border-slate-700 bg-slate-950 text-sky-500 focus:ring-2 focus:ring-sky-400"
              />
              <span>4.0+</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer">
              <input
                type="radio"
                name="bulk-rating-filter"
                value="MIN_4_5"
                checked={ratingFilter === 'MIN_4_5'}
                onChange={() => handleRatingChange('MIN_4_5')}
                className="rounded-full border-slate-700 bg-slate-950 text-sky-500 focus:ring-2 focus:ring-sky-400"
              />
              <span>4.5+</span>
            </label>
          </fieldset>

          {/* Website */}
          <fieldset className="flex items-center gap-3 border-none p-0 m-0">
            <legend className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Website:
            </legend>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer">
              <input
                type="radio"
                name="bulk-website-filter"
                value="ANY"
                checked={websiteFilter === 'ANY'}
                onChange={() => handleWebsiteChange('ANY')}
                className="rounded-full border-slate-700 bg-slate-950 text-sky-500 focus:ring-2 focus:ring-sky-400"
              />
              <span>Any</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer">
              <input
                type="radio"
                name="bulk-website-filter"
                value="WITH_WEBSITE"
                checked={websiteFilter === 'WITH_WEBSITE'}
                onChange={() => handleWebsiteChange('WITH_WEBSITE')}
                className="rounded-full border-slate-700 bg-slate-950 text-sky-500 focus:ring-2 focus:ring-sky-400"
              />
              <span>With Website</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer">
              <input
                type="radio"
                name="bulk-website-filter"
                value="WITHOUT_WEBSITE"
                checked={websiteFilter === 'WITHOUT_WEBSITE'}
                onChange={() => handleWebsiteChange('WITHOUT_WEBSITE')}
                className="rounded-full border-slate-700 bg-slate-950 text-sky-500 focus:ring-2 focus:ring-sky-400"
              />
              <span>Without Website</span>
            </label>
          </fieldset>
        </div>
      </div>

      {/* Maximum Results Target */}
      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Maximum Results Target
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Target: {effectiveMaxResults} qualified leads
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          {(['50', '100', '250', '500'] as const).map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setMaxResultsPreset(preset)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                maxResultsPreset === preset
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {preset}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMaxResultsPreset('CUSTOM')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              maxResultsPreset === 'CUSTOM'
                ? 'bg-sky-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Custom
          </button>
          {maxResultsPreset === 'CUSTOM' && (
            <input
              type="number"
              min={1}
              max={1000}
              value={customMaxResults}
              onChange={e => setCustomMaxResults(Math.max(1, Math.min(1000, parseInt(e.target.value) || 100)))}
              className="w-20 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
              aria-label="Custom maximum results target"
            />
          )}
        </div>
      </div>

      {/* Execution Progress & Status Panel (Visible when active or terminal snapshot exists) */}
      {activeSnapshot && (
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col gap-3">
          {/* Status Label */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isRunning ? 'bg-emerald-400 animate-pulse' :
                isPaused ? 'bg-amber-400' :
                activeSnapshot.state === 'COMPLETED' ? 'bg-sky-400' :
                activeSnapshot.state === 'PARTIALLY_COMPLETED' ? 'bg-amber-400' :
                'bg-rose-400'
              }`} />
              <span className="text-xs font-semibold text-slate-200" aria-live="polite">
                {getStatusCopy(activeSnapshot)}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {activeSnapshot.progress.percent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                activeSnapshot.state === 'FAILED' ? 'bg-rose-500' :
                activeSnapshot.state === 'CANCELLED' ? 'bg-slate-500' :
                activeSnapshot.state === 'PARTIALLY_COMPLETED' ? 'bg-amber-500' :
                'bg-sky-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, activeSnapshot.progress.percent))}%` }}
              role="progressbar"
              aria-valuenow={activeSnapshot.progress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Bulk research progress: ${activeSnapshot.progress.unitsCompleted} of ${activeSnapshot.totalUnits} searches`}
            />
          </div>

          {/* Current SearchUnit Display */}
          {activeSnapshot.currentUnit && (
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-300">
                  Current Search: {activeSnapshot.progress.unitsCompleted + 1} of {activeSnapshot.totalUnits}
                </span>
                <span className="text-[11px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-sky-300">
                  Attempt {activeSnapshot.currentUnit.attemptCount}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-slate-300">
                <div>
                  <span className="text-slate-500 text-[11px]">Keyword:</span>{' '}
                  <span className="font-medium">{activeSnapshot.currentUnit.keyword}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Location:</span>{' '}
                  <span className="font-medium">{activeSnapshot.currentUnit.location}</span>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Counters Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
              <div className="text-[11px] text-slate-500">Searches</div>
              <div className="font-semibold text-slate-200 mt-0.5">
                {activeSnapshot.completedUnits}/{activeSnapshot.totalUnits}
              </div>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
              <div className="text-[11px] text-slate-500">Observed</div>
              <div className="font-semibold text-slate-200 mt-0.5">
                {activeSnapshot.metrics.rawCandidateObservations}
              </div>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
              <div className="text-[11px] text-slate-500">Duplicates Suppressed</div>
              <div className="font-semibold text-amber-400 mt-0.5">
                {activeSnapshot.metrics.duplicateObservationCount}
              </div>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
              <div className="text-[11px] text-slate-500">Unique Leads</div>
              <div className="font-semibold text-emerald-400 mt-0.5">
                {activeSnapshot.metrics.uniqueCandidateCount}
              </div>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
              <div className="text-[11px] text-slate-500">Filtered Matches</div>
              <div className="font-semibold text-sky-400 mt-0.5">
                {activeSnapshot.metrics.currentFilteredMatchCount}
              </div>
            </div>
          </div>

          {/* Secondary Website & Contact Enrichment Row (Part 6) */}
          {activeSnapshot.enrichmentSnapshot && (
            <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1.5">
                  <span>🌐</span> Website &amp; Contact Enrichment
                </span>
                <span className="text-[11px] font-mono text-sky-400">
                  {activeSnapshot.enrichmentSnapshot.completed + activeSnapshot.enrichmentSnapshot.partial} / {activeSnapshot.enrichmentSnapshot.totalEligible} eligible
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800/60">
                  <div className="text-[10px] text-slate-500">Enriched</div>
                  <div className="font-semibold text-emerald-400 mt-0.5">
                    {activeSnapshot.enrichmentSnapshot.completed}
                    {activeSnapshot.enrichmentSnapshot.partial > 0 && (
                      <span className="text-[10px] text-amber-400 font-normal"> (+{activeSnapshot.enrichmentSnapshot.partial} partial)</span>
                    )}
                  </div>
                </div>
                <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800/60">
                  <div className="text-[10px] text-slate-500">In Queue</div>
                  <div className="font-semibold text-slate-300 mt-0.5">
                    {activeSnapshot.enrichmentSnapshot.queued}
                    {activeSnapshot.enrichmentSnapshot.running > 0 && (
                      <span className="text-[10px] text-sky-400 animate-pulse font-normal"> (1 active)</span>
                    )}
                  </div>
                </div>
                <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800/60">
                  <div className="text-[10px] text-slate-500">Contacts</div>
                  <div className="font-semibold text-sky-300 mt-0.5">
                    {activeSnapshot.enrichmentSnapshot.emailsFound} ✉ / {activeSnapshot.enrichmentSnapshot.phonesFound} ☎
                  </div>
                </div>
                <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800/60">
                  <div className="text-[10px] text-slate-500">People</div>
                  <div className="font-semibold text-indigo-300 mt-0.5">
                    {activeSnapshot.enrichmentSnapshot.personsFound} 👤
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Copy All Feedback Notification */}
      {copyFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all ${
            copyFeedback.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-800/80 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span>{copyFeedback.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{copyFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setCopyFeedback(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-2 text-xs"
            aria-label="Dismiss feedback"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Copy All Button */}
        <div>
          <button
            type="button"
            id="gmaps-copy-all-btn"
            onClick={handleCopyAll}
            disabled={availableCandidatesCount === 0 || isCopying}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer ${
              availableCandidatesCount > 0 && !isCopying
                ? 'bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700'
                : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
            }`}
            aria-label={`Copy all ${availableCandidatesCount} Google Maps results to clipboard`}
          >
            <span>📋</span> {isCopying ? 'Copying...' : `Copy All (${availableCandidatesCount})`}
          </button>
        </div>

        {/* Execution Controls */}
        <div className="flex items-center gap-2">
          {!isActive ? (
            <button
              type="button"
              id="start-bulk-research-btn"
              onClick={handleStart}
              disabled={!!validationError || disabled}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                !validationError && !disabled
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              aria-label={`Start bulk research for ${plannedUnitsCount} searches`}
            >
              Start Bulk Research ({plannedUnitsCount} Searches)
            </button>
          ) : (
            <>
              {isRunning ? (
                <button
                  type="button"
                  id="pause-bulk-research-btn"
                  onClick={onPauseBulkResearch}
                  disabled={disabled}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                  aria-label="Pause bulk research execution"
                >
                  Pause
                </button>
              ) : isPaused ? (
                <button
                  type="button"
                  id="resume-bulk-research-btn"
                  onClick={onResumeBulkResearch}
                  disabled={disabled}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  aria-label="Resume bulk research execution"
                >
                  Resume
                </button>
              ) : null}

              <button
                type="button"
                id="cancel-bulk-research-btn"
                onClick={onCancelBulkResearch}
                disabled={disabled}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
                aria-label="Cancel bulk research execution"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
