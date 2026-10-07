/**
 * LeadNoria — Part 3: Rating + Website Filter Engine
 * Accessible, Deterministic Single-Choice Filter Controls Component
 *
 * Visual & Accessibility Contract:
 * - Semantic <fieldset> and <legend> elements for screen readers
 * - Single-choice radio buttons with keyboard arrow-key navigation
 * - RATING: 'ANY' | '4.0+' | '4.5+'
 * - WEBSITE: 'ANY' | 'WITH_WEBSITE' | 'WITHOUT_WEBSITE'
 * - Accessible [ Reset Filters ] button
 * - Concise filter summary displaying exact combined match count
 * - Uses existing LeadNoria Tailwind/slate design tokens
 */

import React from 'react';
import type { RatingFilterOption, WebsiteFilterOption } from '../../acquisition/engine/filterTypes.ts';

export interface GoogleMapsFilterControlsProps {
  ratingFilter: RatingFilterOption;
  websiteFilter: WebsiteFilterOption;
  onRatingChange: (rating: RatingFilterOption) => void;
  onWebsiteChange: (website: WebsiteFilterOption) => void;
  onResetFilters: () => void;
  totalObserved: number;
  matchingCount: number;
}

export const GoogleMapsFilterControls: React.FC<GoogleMapsFilterControlsProps> = ({
  ratingFilter,
  websiteFilter,
  onRatingChange,
  onWebsiteChange,
  onResetFilters,
  totalObserved,
  matchingCount
}) => {
  const isDefault = ratingFilter === 'ANY' && websiteFilter === 'ANY';

  // Format concise active filter summary
  const ratingLabel = ratingFilter === 'ANY' ? 'All ratings' : (ratingFilter === 'MIN_4_5' ? '4.5+ stars' : '4.0+ stars');
  const websiteLabel = websiteFilter === 'ANY' ? 'Any website' : (websiteFilter === 'WITH_WEBSITE' ? 'With website' : 'Without website');
  const summaryText = `${ratingLabel} · ${websiteLabel}`;

  return (
    <div
      className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col gap-2.5"
      role="region"
      aria-label="Google Maps candidate filter controls"
    >
      {/* Header & Match Count Summary */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span>⚙️</span> Filter Leads:
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-sky-300 border border-slate-700">
            {summaryText}
          </span>
          <span className="text-[11px] text-slate-400">
            ({matchingCount} of {totalObserved} matching)
          </span>
        </div>

        {/* Reset Filters Control */}
        <button
          type="button"
          onClick={onResetFilters}
          disabled={isDefault}
          className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 ${
            !isDefault
              ? 'bg-slate-800 hover:bg-slate-750 text-sky-400 hover:text-sky-300 border border-slate-700'
              : 'text-slate-600 bg-slate-950 border border-slate-850 cursor-not-allowed'
          }`}
          aria-label="Reset all filters to Any"
        >
          Reset Filters
        </button>
      </div>

      {/* Filter Groups Row */}
      <div className="flex flex-wrap items-center gap-6 pt-1 border-t border-slate-800/80">
        {/* Rating Single-Choice Fieldset */}
        <fieldset className="flex items-center gap-3 border-none p-0 m-0">
          <legend className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Rating:
          </legend>
          <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer">
            <input
              type="radio"
              name="leadnoria-rating-filter"
              value="ANY"
              checked={ratingFilter === 'ANY'}
              onChange={() => onRatingChange('ANY')}
              className="rounded-full border-slate-700 bg-slate-950 text-sky-500 focus:ring-2 focus:ring-sky-400"
              aria-label="Any rating"
            />
            <span>Any</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer">
            <input
              type="radio"
              name="leadnoria-rating-filter"
              value="MIN_4_0"
              checked={ratingFilter === 'MIN_4_0'}
              onChange={() => onRatingChange('MIN_4_0')}
              className="rounded-full border-slate-700 bg-slate-950 text-sky-500 focus:ring-2 focus:ring-sky-400"
              aria-label="Rating 4.0 and above"
            />
            <span>4.0+</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer">
            <input
              type="radio"
              name="leadnoria-rating-filter"
              value="MIN_4_5"
              checked={ratingFilter === 'MIN_4_5'}
              onChange={() => onRatingChange('MIN_4_5')}
              className="rounded-full border-slate-700 bg-slate-950 text-sky-500 focus:ring-2 focus:ring-sky-400"
              aria-label="Rating 4.5 and above"
            />
            <span>4.5+</span>
          </label>
        </fieldset>

        {/* Website Single-Choice Fieldset */}
        <fieldset className="flex items-center gap-3 border-none p-0 m-0">
          <legend className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Website:
          </legend>
          <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer">
            <input
              type="radio"
              name="leadnoria-website-filter"
              value="ANY"
              checked={websiteFilter === 'ANY'}
              onChange={() => onWebsiteChange('ANY')}
              className="rounded-full border-slate-700 bg-slate-950 text-sky-500 focus:ring-2 focus:ring-sky-400"
              aria-label="Any website status"
            />
            <span>Any</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer">
            <input
              type="radio"
              name="leadnoria-website-filter"
              value="WITH_WEBSITE"
              checked={websiteFilter === 'WITH_WEBSITE'}
              onChange={() => onWebsiteChange('WITH_WEBSITE')}
              className="rounded-full border-slate-700 bg-slate-950 text-sky-500 focus:ring-2 focus:ring-sky-400"
              aria-label="With verified website"
            />
            <span>With Website</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer">
            <input
              type="radio"
              name="leadnoria-website-filter"
              value="WITHOUT_WEBSITE"
              checked={websiteFilter === 'WITHOUT_WEBSITE'}
              onChange={() => onWebsiteChange('WITHOUT_WEBSITE')}
              className="rounded-full border-slate-700 bg-slate-950 text-sky-500 focus:ring-2 focus:ring-sky-400"
              aria-label="Without website (confirmed absent)"
            />
            <span>Without Website</span>
          </label>
        </fieldset>
      </div>
    </div>
  );
};
