/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Scalable Results List View Component
 * 
 * Strict Invariants:
 * - Deterministic sorting and filtering
 * - Preserves authoritative states (SKIPPED != NOT_QUALIFIED, BLOCKED != NOT_FOUND)
 * - Bulk selection does NOT imply bulk export eligibility (policy firewall is separate)
 * - Progressive disclosure: compact row with click-to-expand details
 */

import React, { useState, useMemo } from 'react';
import { ResultRowViewModel } from '../types.ts';
import { StatusBadge } from './StatusBadge.tsx';

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
  const [relevanceFilter, setRelevanceFilter] = useState<string>('ALL');
  const [qualificationFilter, setQualificationFilter] = useState<string>('ALL');
  const [requirePhone, setRequirePhone] = useState(false);
  const [requireEmail, setRequireEmail] = useState(false);
  const [sortBy, setSortBy] = useState<'NAME_ASC' | 'NAME_DESC' | 'SOURCE' | 'QUALIFICATION'>('NAME_ASC');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

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
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesWebsite) {
          return false;
        }
      }

      // Source filter
      if (sourceFilter !== 'ALL' && r.primarySource !== sourceFilter) {
        return false;
      }

      // Relevance filter
      if (relevanceFilter !== 'ALL' && r.relevanceDecision !== relevanceFilter) {
        return false;
      }

      // Qualification filter
      if (qualificationFilter !== 'ALL' && r.qualificationState !== qualificationFilter) {
        return false;
      }

      // Contact filters
      if (requirePhone && !r.contactSummary.hasPhone) return false;
      if (requireEmail && !r.contactSummary.hasEmail) return false;

      return true;
    });
  }, [results, searchTerm, sourceFilter, relevanceFilter, qualificationFilter, requirePhone, requireEmail]);

  // Deterministic Sorting
  const sortedResults = useMemo(() => {
    const list = [...filteredResults];
    list.sort((a, b) => {
      switch (sortBy) {
        case 'NAME_ASC':
          return a.displayName.localeCompare(b.displayName);
        case 'NAME_DESC':
          return b.displayName.localeCompare(a.displayName);
        case 'SOURCE':
          return a.primarySource.localeCompare(b.primarySource) || a.displayName.localeCompare(b.displayName);
        case 'QUALIFICATION':
          return a.qualificationState.localeCompare(b.qualificationState) || a.displayName.localeCompare(b.displayName);
        default:
          return 0;
      }
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

  const allFilteredSelected = paginatedResults.length > 0 && paginatedResults.every(r => selectedRecordIds.has(r.recordId));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      onClearSelection();
    } else {
      onSelectAll(paginatedResults.map(r => r.recordId));
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
              placeholder="Search eligible business names, emails, phones, domains..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="Search results"
            />
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={onOpenExportModal}
            disabled={results.length === 0}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400 ${
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
            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
              aria-label="Filter by source"
            >
              <option value="ALL">All Sources</option>
              <option value="META">Meta Ad Library</option>
              <option value="GOOGLE_MAPS">Google Maps</option>
              <option value="WEBSITE">Website</option>
              <option value="USER_PROVIDED">User Provided</option>
            </select>

            {/* Relevance Filter */}
            <select
              value={relevanceFilter}
              onChange={e => { setRelevanceFilter(e.target.value); setPage(1); }}
              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
              aria-label="Filter by relevance"
            >
              <option value="ALL">All Relevance</option>
              <option value="RELEVANT">Relevant Only</option>
              <option value="UNCERTAIN">Uncertain Only</option>
              <option value="NOT_RELEVANT">Not Relevant</option>
            </select>

            {/* Qualification Filter */}
            <select
              value={qualificationFilter}
              onChange={e => { setQualificationFilter(e.target.value); setPage(1); }}
              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
              aria-label="Filter by qualification"
            >
              <option value="ALL">All Qualification</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="NOT_QUALIFIED">Not Qualified</option>
              <option value="UNCERTAIN">Uncertain</option>
              <option value="BLOCKED">Blocked</option>
              <option value="NOT_STARTED">Not Started</option>
            </select>

            {/* Checkboxes for quick contact presence */}
            <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requirePhone}
                onChange={e => { setRequirePhone(e.target.checked); setPage(1); }}
                className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0"
              />
              Phone
            </label>

            <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requireEmail}
                onChange={e => { setRequireEmail(e.target.checked); setPage(1); }}
                className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0"
              />
              Email
            </label>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
              aria-label="Sort results by"
            >
              <option value="NAME_ASC">Name (A-Z)</option>
              <option value="NAME_DESC">Name (Z-A)</option>
              <option value="SOURCE">Source</option>
              <option value="QUALIFICATION">Qualification</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Bulk Action Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allFilteredSelected}
            onChange={handleToggleSelectAll}
            className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
            aria-label="Select all on this page"
          />
          <span>
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
              className="text-[11px] text-slate-400 hover:text-slate-200 underline focus:outline-none"
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
            {results.length === 0 ? 'No Research Results Available' : 'No Matching Leads Found'}
          </p>
          <p className="text-[11px] text-slate-500">
            {results.length === 0
              ? 'Research data not available. Start a research run to discover leads.'
              : 'Try relaxing your search terms or filter criteria.'}
          </p>
        </div>
      )}

      {/* Table / List Representation */}
      <div className="flex flex-col gap-1.5" role="list" aria-label="Research results list">
        {paginatedResults.map(r => {
          const isSelected = selectedRecordIds.has(r.recordId);
          return (
            <div
              key={r.recordId}
              role="listitem"
              onClick={() => onInspectRecord(r.recordId)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-2 ${
                isSelected
                  ? 'bg-slate-850 border-sky-500/50 shadow-sm'
                  : 'bg-slate-900 border-slate-850 hover:border-slate-700 hover:bg-slate-850/80'
              }`}
            >
              {/* Row Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onClick={e => e.stopPropagation()}
                    onChange={() => onToggleSelect(r.recordId)}
                    className="mt-1 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0"
                    aria-label={`Select ${r.displayName}`}
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 leading-tight hover:text-sky-300">
                      {r.displayName}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                      <span className="font-mono text-slate-500">{r.primarySource}</span>
                      {r.isMixedProvenance && (
                        <span className="px-1 py-0.2 text-[9px] font-semibold bg-sky-950 text-sky-300 border border-sky-500/30 rounded">
                          MIXED
                        </span>
                      )}
                      {r.geographicContext && (
                        <>
                          <span>•</span>
                          <span>{r.geographicContext}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-1.5 justify-end">
                  <StatusBadge status={r.relevanceDecision} size="sm" />
                  <StatusBadge status={r.qualificationState} size="sm" />
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

              {/* Row Body: Contact & Website indicators */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-3">
                  {r.websiteUrl ? (
                    <span className="flex items-center gap-1 text-slate-300 truncate max-w-[160px]">
                      <span>🌐</span>
                      <span className="truncate">{r.websiteUrl.replace(/^https?:\/\//, '')}</span>
                    </span>
                  ) : (
                    <span className="text-slate-600">No website</span>
                  )}

                  {r.contactSummary.phoneText && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <span>📞</span>
                      <span>{r.contactSummary.phoneText}</span>
                    </span>
                  )}

                  {r.contactSummary.emailText && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <span>✉</span>
                      <span>{r.contactSummary.emailText}</span>
                    </span>
                  )}
                </div>

                <span className="text-sky-400 font-medium text-[11px] hover:underline">
                  Inspect Dossier →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
          >
            ← Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};
