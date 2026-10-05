/**
 * LeadNoria — Phase 15 & Phase 25: UI/UX Integration & Unified Lead Intelligence
 * Scalable Results List View Component
 * 
 * Strict Invariants:
 * - Deterministic sorting and filtering
 * - Preserves authoritative states (SKIPPED != NOT_QUALIFIED, BLOCKED != NOT_FOUND)
 * - Bulk selection does NOT imply bulk export eligibility (policy firewall is separate)
 * - Selection operates on canonical entity IDs
 * - Progressive disclosure: compact row with click-to-expand details
 * - Displays separate source badges, quality metrics, data signals, and friendly human labels
 */

import React, { useState, useMemo } from 'react';
import { ResultRowViewModel } from '../types.ts';
import { StatusBadge } from './StatusBadge.tsx';
import { toFriendlyStatus } from '../humanLabels.ts';
import { getSafeExternalUrl } from '../security.ts';

export type SortOption =
  | 'NAME_ASC'
  | 'NAME_DESC'
  | 'LOCATION'
  | 'QUALIFICATION'
  | 'COMPLETENESS'
  | 'CONTACT_COMPLETENESS'
  | 'LAST_OBSERVED'
  | 'SOURCE';

interface ResultsTableViewProps {
  results: ResultRowViewModel[];
  selectedRecordIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onInspectRecord: (recordId: string) => void;
  onOpenExportModal: () => void;
}

export const ResultsTableView: React.FC<ResultsTableViewProps> = ({
  results,
  selectedRecordIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onInspectRecord,
  onOpenExportModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [qualificationFilter, setQualificationFilter] = useState<string>('ALL');
  const [freshnessFilter, setFreshnessFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [requirePhone, setRequirePhone] = useState(false);
  const [requireEmail, setRequireEmail] = useState(false);
  const [requireWebsite, setRequireWebsite] = useState(false);
  const [requirePerson, setRequirePerson] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('NAME_ASC');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  // Derive unique categories for filter dropdown
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    for (const r of results) {
      if (r.category) set.add(r.category);
    }
    return Array.from(set).sort();
  }, [results]);

  // Filter & Search Logic
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      // Local text search
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchesName = r.displayName.toLowerCase().includes(q);
        const matchesPhone = r.contactSummary.phoneText?.toLowerCase().includes(q);
        const matchesEmail = r.contactSummary.emailText?.toLowerCase().includes(q);
        const matchesWebsite = r.websiteUrl?.toLowerCase().includes(q);
        const matchesCategory = r.category?.toLowerCase().includes(q);
        const matchesLocation = r.geographicContext?.toLowerCase().includes(q);
        const matchesPeople = (r.canonicalRecord?.people?.publicPeople || []).some((p: any) =>
          p.name?.toLowerCase().includes(q) || p.canonicalName?.toLowerCase().includes(q)
        );

        if (!matchesName && !matchesPhone && !matchesEmail && !matchesWebsite && !matchesCategory && !matchesLocation && !matchesPeople) {
          return false;
        }
      }

      // Source filter
      if (sourceFilter !== 'ALL') {
        const hasSource = r.sourceBadges
          ? r.sourceBadges.some(b => b.sourceType === sourceFilter)
          : r.primarySource === sourceFilter;
        if (!hasSource) return false;
      }

      // Qualification filter
      if (qualificationFilter !== 'ALL' && r.qualificationState !== qualificationFilter) {
        return false;
      }

      // Freshness filter
      if (freshnessFilter !== 'ALL') {
        const freshState = r.dataSignals?.freshness || 'UNKNOWN';
        if (freshState !== freshnessFilter) return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) {
        return false;
      }

      // Signal filters
      if (requirePhone && !r.contactSummary.hasPhone) return false;
      if (requireEmail && !r.contactSummary.hasEmail) return false;
      if (requireWebsite && !r.dataSignals?.websiteVerified) return false;
      if (requirePerson && !r.dataSignals?.publicPersonAvailable) return false;

      return true;
    });
  }, [
    results,
    searchTerm,
    sourceFilter,
    qualificationFilter,
    freshnessFilter,
    categoryFilter,
    requirePhone,
    requireEmail,
    requireWebsite,
    requirePerson
  ]);

  // Deterministic Sorting
  const sortedResults = useMemo(() => {
    const list = [...filteredResults];
    list.sort((a, b) => {
      let diff = 0;
      switch (sortBy) {
        case 'NAME_ASC':
          diff = a.displayName.localeCompare(b.displayName);
          break;
        case 'NAME_DESC':
          diff = b.displayName.localeCompare(a.displayName);
          break;
        case 'LOCATION':
          diff = (a.geographicContext || '').localeCompare(b.geographicContext || '');
          break;
        case 'QUALIFICATION':
          diff = a.qualificationState.localeCompare(b.qualificationState);
          break;
        case 'COMPLETENESS': {
          const compA = a.qualityMetrics?.completenessPercent || 0;
          const compB = b.qualityMetrics?.completenessPercent || 0;
          diff = compB - compA;
          break;
        }
        case 'CONTACT_COMPLETENESS': {
          const compA = a.qualityMetrics?.contactCompletenessPercent || 0;
          const compB = b.qualityMetrics?.contactCompletenessPercent || 0;
          diff = compB - compA;
          break;
        }
        case 'LAST_OBSERVED': {
          const tA = a.lastObservedText ? new Date(a.lastObservedText).getTime() : 0;
          const tB = b.lastObservedText ? new Date(b.lastObservedText).getTime() : 0;
          diff = tB - tA;
          break;
        }
        case 'SOURCE':
          diff = a.primarySource.localeCompare(b.primarySource);
          break;
        default:
          diff = 0;
      }
      // Always tie-break deterministically using canonical entityId or recordId
      return diff !== 0 ? diff : (a.entityId || a.recordId).localeCompare(b.entityId || b.recordId);
    });
    return list;
  }, [filteredResults, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedResults.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedResults.slice(start, start + PAGE_SIZE);
  }, [sortedResults, currentPage]);

  const allFilteredSelected = paginatedResults.length > 0 &&
    paginatedResults.every(r => selectedRecordIds.has(r.entityId) || selectedRecordIds.has(r.recordId));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      onClearSelection();
    } else {
      // Use entityId for selection, fallback to recordId
      onSelectAll(paginatedResults.map(r => r.entityId || r.recordId));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Controls Bar: Search, Filters, Export */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2.5 text-xs text-slate-500" aria-hidden="true">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Search eligible businesses, emails, phones, domains, categories..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="Search results"
            />
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={onOpenExportModal}
            disabled={results.length === 0}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer ${
              results.length > 0
                ? 'bg-sky-600 hover:bg-sky-500 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <span>⭳</span> Export ({selectedRecordIds.size > 0 ? selectedRecordIds.size : results.length})
          </button>
        </div>

        {/* Filter & Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Qualification Filter */}
            <select
              value={qualificationFilter}
              onChange={e => { setQualificationFilter(e.target.value); setPage(1); }}
              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-400"
              aria-label="Filter by qualification status"
            >
              <option value="ALL">All Qualifications</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="NOT_QUALIFIED">Does not meet criteria</option>
              <option value="UNCERTAIN">Needs review</option>
              <option value="BLOCKED">Unavailable</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-400"
              aria-label="Filter by source"
            >
              <option value="ALL">All Sources</option>
              <option value="META">Meta</option>
              <option value="WEBSITE">Website</option>
              <option value="GOOGLE_MAPS">Restricted Google</option>
            </select>

            {/* Freshness Filter */}
            <select
              value={freshnessFilter}
              onChange={e => { setFreshnessFilter(e.target.value); setPage(1); }}
              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-400"
              aria-label="Filter by data freshness"
            >
              <option value="ALL">All Freshness</option>
              <option value="CURRENT">Recently observed</option>
              <option value="STALE">May be outdated</option>
              <option value="UNKNOWN">Not enough info</option>
            </select>

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-400 max-w-[140px]"
                aria-label="Filter by business category"
              >
                <option value="ALL">All Categories</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}

            {/* Signal Checkboxes */}
            <label className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={requirePhone}
                onChange={e => { setRequirePhone(e.target.checked); setPage(1); }}
                className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0"
              />
              Phone
            </label>
            <label className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={requireEmail}
                onChange={e => { setRequireEmail(e.target.checked); setPage(1); }}
                className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0"
              />
              Email
            </label>
            <label className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={requireWebsite}
                onChange={e => { setRequireWebsite(e.target.checked); setPage(1); }}
                className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0"
              />
              Website
            </label>
            <label className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={requirePerson}
                onChange={e => { setRequirePerson(e.target.checked); setPage(1); }}
                className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0"
              />
              Person
            </label>
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-500 text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-400 text-xs"
              aria-label="Sort records"
            >
              <option value="NAME_ASC">Name (A-Z)</option>
              <option value="NAME_DESC">Name (Z-A)</option>
              <option value="LOCATION">Location</option>
              <option value="QUALIFICATION">Qualification</option>
              <option value="COMPLETENESS">Completeness</option>
              <option value="CONTACT_COMPLETENESS">Contact Depth</option>
              <option value="LAST_OBSERVED">Recently Observed</option>
              <option value="SOURCE">Source</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selection & Pagination Status Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={handleToggleSelectAll}
              className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0"
              aria-label="Select all visible records"
            />
            <span className="text-[11px]">Select Visible</span>
          </label>
          <span className="text-[11px] text-slate-500">•</span>
          <span className="text-[11px]">
            Showing <strong>{paginatedResults.length}</strong> of <strong>{sortedResults.length}</strong> records
            {results.length !== sortedResults.length && ` (filtered from ${results.length})`}
          </span>
        </div>

        {selectedRecordIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sky-300 font-semibold text-[11px]">
              {selectedRecordIds.size} selected
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline focus:outline-none cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {paginatedResults.length === 0 && (
        <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-lg">
          <span className="text-2xl block mb-1">🔍</span>
          <p className="text-xs font-semibold text-slate-300 mb-0.5">
            {results.length === 0 ? 'No Research Results Available' : 'No Matching Businesses Found'}
          </p>
          <p className="text-[11px] text-slate-500">
            {results.length === 0
              ? 'Data not available. Start a research run to discover leads.'
              : 'Try adjusting your search terms or relaxing your filter criteria.'}
          </p>
        </div>
      )}

      {/* Results List */}
      <div className="flex flex-col gap-2" role="list" aria-label="Research results list">
        {paginatedResults.map(r => {
          const isSelected = selectedRecordIds.has(r.entityId) || selectedRecordIds.has(r.recordId);
          const safeWeb = getSafeExternalUrl(r.websiteUrl);

          return (
            <div
              key={r.recordId}
              role="listitem"
              onClick={() => onInspectRecord(r.recordId)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-2 ${
                isSelected
                  ? 'bg-slate-850 border-sky-500/50 shadow-sm'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850/80'
              }`}
            >
              {/* Row Header: Selection, Title, Source Badges, Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onClick={e => e.stopPropagation()}
                    onChange={() => onToggleSelect(r.entityId || r.recordId)}
                    className="mt-1 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0 cursor-pointer"
                    aria-label={`Select ${r.displayName}`}
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 leading-tight hover:text-sky-300">
                      {r.displayName}
                    </h4>

                    {/* Metadata line: Category, Location, Source Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-1 text-[11px] text-slate-400">
                      {r.category && (
                        <span className="text-slate-300 font-medium">{r.category}</span>
                      )}
                      {r.geographicContext && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span>📍 {r.geographicContext}</span>
                        </>
                      )}

                      {/* Source Badges */}
                      <span className="text-slate-600">•</span>
                      <div className="flex items-center gap-1">
                        {r.sourceBadges && r.sourceBadges.length > 0 ? (
                          r.sourceBadges.map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className={`px-1.5 py-0.2 text-[9px] font-semibold rounded border ${
                                badge.isRestricted
                                  ? 'text-purple-300 bg-purple-950/60 border-purple-500/40'
                                  : (badge.sourceType === 'WEBSITE'
                                      ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40'
                                      : 'text-sky-300 bg-sky-950/60 border-sky-500/40')
                              }`}
                            >
                              {badge.label}
                            </span>
                          ))
                        ) : (
                          <span className="font-mono text-slate-500 text-[10px]">{r.primarySource}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-1.5 justify-end">
                  <StatusBadge
                    status={r.qualificationState}
                    customLabel={r.friendlyQualificationState || toFriendlyStatus(r.qualificationState)}
                    size="sm"
                  />
                  {r.isRestricted && (
                    <span 
                      className="px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 bg-purple-950/60 border border-purple-500/40 rounded"
                      title="Restricted by source policy (Not exportable or persistable)"
                    >
                      ⊘ RESTRICTED
                    </span>
                  )}
                </div>
              </div>

              {/* Row Body: Contact Summary, Website, Signals */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60 gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Phone */}
                  {r.contactSummary.hasPhone ? (
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <span>📞</span> {r.contactSummary.phoneText}
                    </span>
                  ) : (
                    <span className="text-slate-600">No phone</span>
                  )}

                  {/* Email */}
                  {r.contactSummary.hasEmail ? (
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <span>✉</span> {r.contactSummary.emailText}
                    </span>
                  ) : (
                    <span className="text-slate-600">No email</span>
                  )}

                  {/* Website */}
                  {safeWeb ? (
                    <span className="flex items-center gap-1 text-sky-400">
                      <span>🌐</span>
                      <span className="truncate max-w-[150px]">{safeWeb.replace(/^https?:\/\//, '')}</span>
                      {r.dataSignals?.websiteVerified && (
                        <span className="text-emerald-400 font-bold" title="Verified business website">✓</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-600">No website</span>
                  )}

                  {/* Public person signal */}
                  {r.dataSignals?.publicPersonAvailable && (
                    <span className="flex items-center gap-0.5 text-slate-300">
                      <span>👤</span> Person
                    </span>
                  )}

                  {/* Freshness signal */}
                  {r.dataSignals?.freshness && (
                    <span className={`px-1.5 py-0.2 text-[9px] rounded font-medium ${
                      r.dataSignals.freshness === 'CURRENT'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-amber-950/50 text-amber-300 border border-amber-500/30'
                    }`}>
                      {r.dataSignals.freshnessLabel}
                    </span>
                  )}
                </div>

                {/* Quality Summary */}
                {r.qualityMetrics && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 ml-auto">
                    <span>Quality: <strong className="text-slate-300">{r.qualityMetrics.completenessPercent}%</strong></span>
                    {r.qualityMetrics.corroborationCount > 1 && (
                      <span className="text-sky-400 font-semibold">{r.qualityMetrics.corroborationCount} sources</span>
                    )}
                    {r.qualityMetrics.contradictionCount > 0 && (
                      <span className="text-amber-400 font-semibold">⚠️ {r.qualityMetrics.contradictionCount} conflict</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 focus:outline-none"
          >
            ← Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 focus:outline-none"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};
