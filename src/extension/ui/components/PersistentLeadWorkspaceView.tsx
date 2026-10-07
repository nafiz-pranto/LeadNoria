/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Persistent Lead Workspace React View Component
 *
 * ACCESSIBILITY & SECURITY INVARIANTS:
 * 1. Semantic HTML elements: fieldset, legend, table, aria-live, role="region".
 * 2. Visual indicators for Lifecycle, Priority, Follow-Up, and Provenance.
 * 3. Zero dangerouslySetInnerHTML: all text rendered safely via React DOM text nodes.
 * 4. Confirmation dialog for destructive actions (Delete lead).
 */

import React, { useState, useMemo } from 'react';
import type {
  FollowUpStatus,
  LeadLifecycleState,
  LeadPriority,
  PersistedLeadRecord,
  WorkspaceFilterCriteria,
  WorkspaceHistoryEvent,
  WorkspaceSortCriteria
} from '../../leads/workspace/workspaceTypes.ts';
import { filterPersistedLeads } from '../../leads/workspace/workspaceFilters.ts';
import { sortPersistedLeads, paginatePersistedLeads } from '../../leads/workspace/workspaceSorting.ts';
import { computeWorkspaceAnalytics } from '../../leads/workspace/workspaceAnalytics.ts';
import { exportLeadsToCsv, exportLeadsToJson, formatLeadsForClipboard } from '../../leads/leadExportPolicy.ts';
import type { ExportSafeLead } from '../../leads/leadTypes.ts';

export interface PersistentLeadWorkspaceViewProps {
  leads: readonly PersistedLeadRecord[];
  onSaveLead?: (lead: PersistedLeadRecord) => void;
  onUpdateMetadata?: (leadId: string, notes: string, priority: LeadPriority, followUpDate?: string, followUpStatus?: FollowUpStatus) => void;
  onTransitionLifecycle?: (leadId: string, state: LeadLifecycleState, reason?: string) => void;
  onArchiveLead?: (leadId: string) => void;
  onRestoreLead?: (leadId: string) => void;
  onDeleteLead?: (leadId: string) => void;
  onAddTag?: (leadId: string, tag: string) => void;
  onRemoveTag?: (leadId: string, tag: string) => void;
  onGetHistory?: (leadId: string) => readonly WorkspaceHistoryEvent[];
  onClose?: () => void;
}

export const PersistentLeadWorkspaceView: React.FC<PersistentLeadWorkspaceViewProps> = ({
  leads,
  onUpdateMetadata,
  onTransitionLifecycle,
  onArchiveLead,
  onRestoreLead,
  onDeleteLead,
  onAddTag,
  onRemoveTag,
  onGetHistory,
  onClose
}) => {
  // Query & View States
  const [searchQuery, setSearchQuery] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [followUpFilter, setFollowUpFilter] = useState<string>('ALL');
  const [showArchived, setShowArchived] = useState(false);

  // Sorting & Pagination
  const [sortCriteria, setSortCriteria] = useState<WorkspaceSortCriteria>({ field: 'updatedAt', direction: 'DESC' });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals & Drawers
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.leadId || null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotesText, setEditNotesText] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [historyDrawerLeadId, setHistoryDrawerLeadId] = useState<string | null>(null);
  const [confirmDeleteLeadId, setConfirmDeleteLeadId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Compute analytics
  const analytics = useMemo(() => computeWorkspaceAnalytics(leads), [leads]);

  // Construct active filter criteria
  const activeFilters = useMemo<WorkspaceFilterCriteria>(() => {
    const crit: any = {
      searchQuery: searchQuery.trim() || undefined,
      isArchived: showArchived
    };

    if (lifecycleFilter !== 'ALL') {
      crit.lifecycle = [lifecycleFilter as LeadLifecycleState];
    }
    if (priorityFilter !== 'ALL') {
      crit.priority = [priorityFilter as LeadPriority];
    }
    if (followUpFilter !== 'ALL') {
      crit.followUpStatus = [followUpFilter as FollowUpStatus];
    }

    return crit;
  }, [searchQuery, lifecycleFilter, priorityFilter, followUpFilter, showArchived]);

  // Execute filtering, sorting, pagination
  const filteredLeads = useMemo(() => filterPersistedLeads(leads, activeFilters), [leads, activeFilters]);
  const sortedLeads = useMemo(() => sortPersistedLeads(filteredLeads, sortCriteria), [filteredLeads, sortCriteria]);
  const queryResult = useMemo(() => paginatePersistedLeads(sortedLeads, { page, pageSize }), [sortedLeads, page, pageSize]);

  const selectedLead = useMemo(() => leads.find(l => l.leadId === selectedLeadId) || queryResult.items[0] || leads[0], [leads, selectedLeadId, queryResult.items]);

  // Export conversions
  const toExportSafeFormat = (items: readonly PersistedLeadRecord[]): ExportSafeLead[] => {
    return items
      .filter(r => r.safeProvenance.exportEligibility === 'ELIGIBLE' && r.lifecycle.state !== 'DISQUALIFIED')
      .map(r => ({
        leadId: r.leadId,
        sourceClass: r.sourceClass,
        independentSourceId: r.independentSourceId,
        identity: {
          businessName: r.businessIdentity.businessName,
          domain: r.businessIdentity.domain,
          canonicalUrl: r.businessIdentity.canonicalUrl
        },
        website: r.publicWebsite,
        contact: r.publicContacts,
        person: r.publicPerson,
        qualification: r.qualification,
        reviewOutcome: r.reviewOutcome,
        evidenceReferences: [],
        exportEligibility: r.safeProvenance.exportEligibility,
        eligibilityReasons: [],
        userMetadata: {
          notes: r.userMetadata.notes,
          tags: r.userMetadata.tags,
          priority: r.userMetadata.priority
        },
        createdAt: r.auditMetadata.createdAt,
        updatedAt: r.auditMetadata.updatedAt
      }));
  };

  const handleExportCsv = () => {
    const exportable = toExportSafeFormat(filteredLeads);
    const csvData = exportLeadsToCsv(exportable);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leadnoria_persistent_workspace_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotification(`Exported ${exportable.length} leads to CSV`);
  };

  const handleExportJson = () => {
    const exportable = toExportSafeFormat(filteredLeads);
    const jsonData = exportLeadsToJson(exportable);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leadnoria_persistent_workspace_leads_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotification(`Exported ${exportable.length} leads to JSON`);
  };

  const handleClipboardCopy = async () => {
    const exportable = toExportSafeFormat(filteredLeads);
    const tsvData = formatLeadsForClipboard(exportable);
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(tsvData);
      setNotification(`Copied ${exportable.length} leads to clipboard (TSV)`);
    }
  };

  return (
    <div
      role="region"
      aria-label="Persistent Lead Workspace"
      className="flex flex-col h-full bg-slate-900 text-slate-100 font-sans"
    >
      {/* Header Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <h1 className="text-base font-semibold tracking-wide text-white">
            Persistent Lead Workspace &amp; Saved Research
          </h1>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-mono">
            PERSISTENCE VERIFIED
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="workspace-export-csv-btn"
            onClick={handleExportCsv}
            className="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded border border-slate-600 transition"
          >
            Export CSV
          </button>
          <button
            id="workspace-export-json-btn"
            onClick={handleExportJson}
            className="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded border border-slate-600 transition"
          >
            Export JSON
          </button>
          <button
            id="workspace-copy-clipboard-btn"
            onClick={handleClipboardCopy}
            className="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded border border-slate-600 transition"
          >
            Copy TSV
          </button>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close workspace"
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* Analytics Summary Banner */}
      <section aria-label="Workspace metrics" className="grid grid-cols-6 gap-2 px-4 py-2 bg-slate-800/60 border-b border-slate-700 text-xs">
        <div className="flex flex-col">
          <span className="text-slate-400">Total Leads</span>
          <span className="text-base font-bold text-white">{analytics.totalStoredLeads}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Active</span>
          <span className="text-base font-bold text-emerald-400">{analytics.activeLeads}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Qualified</span>
          <span className="text-base font-bold text-cyan-400">{analytics.qualifiedLeads}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Follow-Ups Pending</span>
          <span className="text-base font-bold text-amber-400">{analytics.followUpsPending}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Tags Count</span>
          <span className="text-base font-bold text-indigo-400">{analytics.tagsCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Archived</span>
          <span className="text-base font-bold text-slate-400">{analytics.archivedLeads}</span>
        </div>
      </section>

      {/* Notification toast */}
      {notification && (
        <div role="status" aria-live="polite" className="px-4 py-1.5 bg-emerald-900/90 text-emerald-200 text-xs flex justify-between items-center">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Search & Filters Controls */}
      <section aria-label="Search and filters" className="p-4 bg-slate-850 border-b border-slate-700 flex flex-wrap gap-3 items-center">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <input
            id="workspace-search-input"
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search business, website, email, phone, tags..."
            aria-label="Search leads"
            className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Lifecycle Filter */}
        <div className="flex items-center space-x-1">
          <label htmlFor="filter-lifecycle" className="text-xs text-slate-400">State:</label>
          <select
            id="filter-lifecycle"
            value={lifecycleFilter}
            onChange={e => { setLifecycleFilter(e.target.value); setPage(1); }}
            className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
          >
            <option value="ALL">All States</option>
            <option value="NEW">New</option>
            <option value="ACTIVE">Active</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="DISQUALIFIED">Disqualified</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-1">
          <label htmlFor="filter-priority" className="text-xs text-slate-400">Priority:</label>
          <select
            id="filter-priority"
            value={priorityFilter}
            onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
            className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
          >
            <option value="ALL">All</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Follow-up Filter */}
        <div className="flex items-center space-x-1">
          <label htmlFor="filter-followup" className="text-xs text-slate-400">Follow-up:</label>
          <select
            id="filter-followup"
            value={followUpFilter}
            onChange={e => { setFollowUpFilter(e.target.value); setPage(1); }}
            className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="DONE">Done</option>
            <option value="NONE">None</option>
          </select>
        </div>

        {/* Toggle Archived */}
        <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
          <input
            id="workspace-show-archived-checkbox"
            type="checkbox"
            checked={showArchived}
            onChange={e => { setShowArchived(e.target.checked); setPage(1); }}
            className="rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
          />
          <span>Show Archived</span>
        </label>

        {/* Sort Selector */}
        <div className="flex items-center space-x-1">
          <label htmlFor="workspace-sort-field" className="text-xs text-slate-400">Sort:</label>
          <select
            id="workspace-sort-field"
            value={sortCriteria.field}
            onChange={e => setSortCriteria({ ...sortCriteria, field: e.target.value as any })}
            className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
          >
            <option value="updatedAt">Updated Time</option>
            <option value="createdAt">Created Time</option>
            <option value="businessName">Business Name</option>
            <option value="priority">Priority</option>
            <option value="lifecycle">Lifecycle State</option>
          </select>
          <button
            onClick={() => setSortCriteria({ ...sortCriteria, direction: sortCriteria.direction === 'ASC' ? 'DESC' : 'ASC' })}
            aria-label="Toggle sort direction"
            className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded hover:bg-slate-700"
          >
            {sortCriteria.direction === 'ASC' ? '▲ ASC' : '▼ DESC'}
          </button>
        </div>
      </section>

      {/* Main Workspace Body */}
      <main className="flex-1 flex overflow-hidden">
        {/* Leads Table Container */}
        <div className="flex-1 overflow-auto p-4">
          {queryResult.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-700 rounded-lg text-slate-400 text-xs">
              <span className="text-slate-500 text-sm mb-1">No saved leads matching criteria</span>
              <span>Try adjusting filters, search query, or checking archived leads.</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse" aria-label="Saved Leads List">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 font-medium">
                  <th className="py-2 px-2">Business</th>
                  <th className="py-2 px-2">Lifecycle State</th>
                  <th className="py-2 px-2">Priority</th>
                  <th className="py-2 px-2">Contact Signal</th>
                  <th className="py-2 px-2">Tags</th>
                  <th className="py-2 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {queryResult.items.map(lead => {
                  const isSelected = lead.leadId === selectedLeadId;
                  const isArchived = lead.lifecycle.state === 'ARCHIVED';

                  return (
                    <tr
                      key={lead.leadId}
                      onClick={() => setSelectedLeadId(lead.leadId)}
                      className={`hover:bg-slate-800/60 cursor-pointer transition ${isSelected ? 'bg-slate-800 border-l-2 border-emerald-500' : ''}`}
                    >
                      {/* Business Info */}
                      <td className="py-2.5 px-2">
                        <div className="font-semibold text-slate-100">{lead.businessIdentity.businessName}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{lead.businessIdentity.domain}</div>
                      </td>

                      {/* Lifecycle Pill */}
                      <td className="py-2.5 px-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                          lead.lifecycle.state === 'QUALIFIED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          lead.lifecycle.state === 'CONTACTED' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                          lead.lifecycle.state === 'ACTIVE' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          lead.lifecycle.state === 'ON_HOLD' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          lead.lifecycle.state === 'DISQUALIFIED' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          lead.lifecycle.state === 'ARCHIVED' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                          'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {lead.lifecycle.state}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-2.5 px-2">
                        <span className={`text-[11px] font-medium ${
                          lead.userMetadata.priority === 'HIGH' ? 'text-rose-400' :
                          lead.userMetadata.priority === 'MEDIUM' ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {lead.userMetadata.priority}
                        </span>
                      </td>

                      {/* Contact Summary */}
                      <td className="py-2.5 px-2 text-[11px] text-slate-300">
                        {lead.publicContacts.publicEmails[0]?.email ? (
                          <div className="truncate max-w-[150px]">{lead.publicContacts.publicEmails[0].email}</div>
                        ) : lead.publicContacts.publicPhones[0]?.phone ? (
                          <div>{lead.publicContacts.publicPhones[0].phone}</div>
                        ) : (
                          <span className="text-slate-500">No direct contact</span>
                        )}
                      </td>

                      {/* Tags */}
                      <td className="py-2.5 px-2">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {lead.userMetadata.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                              {tag}
                            </span>
                          ))}
                          {lead.userMetadata.tags.length > 3 && (
                            <span className="text-slate-500 text-[10px]">+{lead.userMetadata.tags.length - 3}</span>
                          )}
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="py-2.5 px-2 text-right space-x-1">
                        {isArchived ? (
                          <button
                            onClick={e => { e.stopPropagation(); onRestoreLead?.(lead.leadId); }}
                            className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded border border-slate-700"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); onArchiveLead?.(lead.leadId); }}
                            className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-400 rounded border border-slate-700"
                          >
                            Archive
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); setHistoryDrawerLeadId(lead.leadId); }}
                          className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700"
                        >
                          History
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmDeleteLeadId(lead.leadId); }}
                          className="px-1.5 py-0.5 text-[11px] bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded border border-slate-700"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination Controls */}
          {queryResult.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span>Showing {queryResult.items.length} of {queryResult.totalCount} leads</span>
              <div className="flex space-x-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-2.5 py-1 bg-slate-800 disabled:opacity-50 rounded hover:bg-slate-700 border border-slate-700"
                >
                  Previous
                </button>
                <span className="px-3 py-1 font-mono text-slate-300">Page {page} of {queryResult.totalPages}</span>
                <button
                  disabled={page >= queryResult.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-2.5 py-1 bg-slate-800 disabled:opacity-50 rounded hover:bg-slate-700 border border-slate-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Lead Detail Drawer */}
        {selectedLead && (
          <aside className="w-80 bg-slate-850 border-l border-slate-700 p-4 overflow-y-auto flex flex-col space-y-4">
            <div>
              <div className="flex justify-between items-start">
                <h2 className="text-sm font-semibold text-white">{selectedLead.businessIdentity.businessName}</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                  {selectedLead.sourceClass}
                </span>
              </div>
              <a
                href={selectedLead.businessIdentity.canonicalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:underline font-mono"
              >
                {selectedLead.businessIdentity.domain}
              </a>
            </div>

            {/* Lifecycle Quick Switch */}
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-medium">Lifecycle Stage:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['ACTIVE', 'CONTACTED', 'QUALIFIED', 'ON_HOLD', 'DISQUALIFIED'] as LeadLifecycleState[]).map(st => (
                  <button
                    key={st}
                    onClick={() => onTransitionLifecycle?.(selectedLead.leadId, st)}
                    className={`px-2 py-1 text-[11px] rounded font-mono transition border ${
                      selectedLead.lifecycle.state === st
                        ? 'bg-emerald-600 text-white border-emerald-500 font-semibold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">User Notes:</span>
                <button
                  onClick={() => {
                    setIsEditingNotes(!isEditingNotes);
                    setEditNotesText(selectedLead.userMetadata.notes || '');
                  }}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  {isEditingNotes ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={editNotesText}
                    onChange={e => setEditNotesText(e.target.value)}
                    rows={4}
                    className="w-full p-2 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100"
                  />
                  <button
                    onClick={() => {
                      onUpdateMetadata?.(
                        selectedLead.leadId,
                        editNotesText,
                        selectedLead.userMetadata.priority,
                        selectedLead.userMetadata.followUpDate,
                        selectedLead.userMetadata.followUpStatus
                      );
                      setIsEditingNotes(false);
                    }}
                    className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                  >
                    Save Notes
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-300 whitespace-pre-wrap">
                  {selectedLead.userMetadata.notes || <span className="text-slate-500 italic">No notes added.</span>}
                </p>
              )}
            </div>

            {/* Tag Management */}
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-medium">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {selectedLead.userMetadata.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-xs flex items-center space-x-1">
                    <span>{tag}</span>
                    <button
                      onClick={() => onRemoveTag?.(selectedLead.leadId, tag)}
                      className="text-slate-400 hover:text-rose-400 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-1 pt-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  placeholder="New tag..."
                  className="flex-1 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200"
                />
                <button
                  onClick={() => {
                    if (newTagInput.trim()) {
                      onAddTag?.(selectedLead.leadId, newTagInput.trim());
                      setNewTagInput('');
                    }
                  }}
                  className="px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Public Verified Contacts */}
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1.5 text-xs">
              <span className="text-slate-400 font-medium">Public Contacts:</span>
              {selectedLead.publicContacts.publicEmails.map(e => (
                <div key={e.email} className="text-slate-200 font-mono">{e.email}</div>
              ))}
              {selectedLead.publicContacts.publicPhones.map(p => (
                <div key={p.phone} className="text-slate-200">{p.phone}</div>
              ))}
              {selectedLead.publicPerson.leadershipPeople.map(p => (
                <div key={p.fullName} className="text-slate-300">
                  <span className="font-semibold">{p.fullName}</span> ({p.jobTitle})
                </div>
              ))}
            </div>
          </aside>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {confirmDeleteLeadId && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-semibold text-rose-400">Confirm Lead Deletion</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete lead <code className="text-white">{confirmDeleteLeadId}</code>? This action will permanently remove the lead, its metadata, and history.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfirmDeleteLeadId(null)}
                className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteLead?.(confirmDeleteLeadId);
                  setConfirmDeleteLeadId(null);
                }}
                className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded font-medium"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Audit Drawer / Modal */}
      {historyDrawerLeadId && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 max-w-md w-full space-y-3 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <h3 className="text-sm font-semibold text-white">Safe Audit History: {historyDrawerLeadId}</h3>
              <button onClick={() => setHistoryDrawerLeadId(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {onGetHistory?.(historyDrawerLeadId)?.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No history events recorded yet.</div>
              ) : (
                onGetHistory?.(historyDrawerLeadId)?.map(evt => (
                  <div key={evt.eventId} className="bg-slate-900 p-2 rounded border border-slate-800 text-xs">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>{evt.eventType}</span>
                      <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    {evt.oldSafeValue && <div className="text-rose-400 text-[11px]">Old: {evt.oldSafeValue}</div>}
                    {evt.newSafeValue && <div className="text-emerald-400 text-[11px]">New: {evt.newSafeValue}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
