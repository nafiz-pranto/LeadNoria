/**
 * LeadNoria — Export-Safe Lead Projection & Research Workspace
 * Part 8: Lead Workspace Component
 *
 * 8 Required Workspace Sections:
 * 1. Research Candidates
 * 2. Qualified Research
 * 3. Export-Safe Leads
 * 4. Blocked / Restricted
 * 5. Review Queue
 * 6. Conflicts
 * 7. Independent Source Evidence
 * 8. Export Readiness
 *
 * HARD INVARIANTS:
 * - Unmistakable visual badges:
 *   - GOOGLE RESTRICTED [NOT EXPORTABLE]
 *   - INDEPENDENT PUBLIC SOURCE [EXPORT ELIGIBLE]
 * - Direct export actions for CSV, JSON, and Clipboard.
 * - Zero dangerouslySetInnerHTML; strict XSS and injection defense.
 */

import React, { useState } from 'react';
import type { ExportSafeLead, IndependentSourceAnchor } from '../../leads/leadTypes.ts';
import { exportLeadsToCsv, exportLeadsToJson, formatLeadsForClipboard } from '../../leads/leadExportPolicy.ts';
import { getSafeExternalUrl } from '../security.ts';

export interface ExportSafeLeadWorkspaceViewProps {
  leads: readonly ExportSafeLead[];
  candidateCounts?: {
    researchCandidatesCount: number;
    qualifiedCandidatesCount: number;
    blockedGoogleCount: number;
  };
  onAttachSource?: (leadId: string, anchor: IndependentSourceAnchor) => void;
  onUpdateMetadata?: (leadId: string, notes?: string, tags?: string[], priority?: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  onBlockExport?: (leadId: string, reason: string) => void;
  onUnblockExport?: (leadId: string) => void;
  onClose?: () => void;
}

export type WorkspaceTab =
  | 'CANDIDATES'
  | 'QUALIFIED'
  | 'EXPORT_SAFE'
  | 'BLOCKED'
  | 'REVIEW_QUEUE'
  | 'CONFLICTS'
  | 'INDEPENDENT_EVIDENCE'
  | 'EXPORT_READINESS';

export const ExportSafeLeadWorkspaceView: React.FC<ExportSafeLeadWorkspaceViewProps> = ({
  leads,
  candidateCounts = { researchCandidatesCount: 0, qualifiedCandidatesCount: 0, blockedGoogleCount: 0 },
  onAttachSource,
  onUpdateMetadata,
  onBlockExport,
  onUnblockExport,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('EXPORT_SAFE');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.leadId || null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const eligibleLeads = leads.filter(l => l.exportEligibility === 'ELIGIBLE');
  const blockedLeads = leads.filter(l => l.exportEligibility === 'BLOCKED');
  const selectedLead = leads.find(l => l.leadId === selectedLeadId) || eligibleLeads[0] || leads[0];

  const handleExportCsv = () => {
    const csvData = exportLeadsToCsv(leads);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leadnoria_export_safe_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportNotice(`Exported ${eligibleLeads.length} eligible leads to CSV`);
  };

  const handleExportJson = () => {
    const jsonData = exportLeadsToJson(leads);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leadnoria_export_safe_leads_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportNotice(`Exported ${eligibleLeads.length} eligible leads to JSON`);
  };

  const handleClipboardCopy = async () => {
    const tsvData = formatLeadsForClipboard(leads);
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(tsvData);
      setExportNotice(`Copied ${eligibleLeads.length} eligible leads to clipboard`);
    }
  };

  return (
    <div id="export-safe-lead-workspace" className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans text-sm select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
        <div>
          <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            <span>Export-Safe Lead Workspace</span>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
              Part 8 Boundary
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict separation: Restricted Google research candidates vs independently anchored public leads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-copy-clipboard"
            onClick={handleClipboardCopy}
            disabled={eligibleLeads.length === 0}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50"
          >
            Copy Table
          </button>
          <button
            id="btn-export-json"
            onClick={handleExportJson}
            disabled={eligibleLeads.length === 0}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50"
          >
            Export JSON
          </button>
          <button
            id="btn-export-csv"
            onClick={handleExportCsv}
            disabled={eligibleLeads.length === 0}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50"
          >
            Export CSV ({eligibleLeads.length})
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded text-xs font-medium text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* Export Feedback Notice */}
      {exportNotice && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-4 py-2 text-xs text-emerald-300 flex justify-between items-center">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Navigation Tabs (8 Required Sections) */}
      <nav className="flex items-center gap-1 px-4 py-2 bg-slate-900 border-b border-slate-800 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('CANDIDATES')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
            activeTab === 'CANDIDATES' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          1. Research Candidates ({candidateCounts.researchCandidatesCount})
        </button>
        <button
          onClick={() => setActiveTab('QUALIFIED')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
            activeTab === 'QUALIFIED' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          2. Qualified Research ({candidateCounts.qualifiedCandidatesCount})
        </button>
        <button
          onClick={() => setActiveTab('EXPORT_SAFE')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
            activeTab === 'EXPORT_SAFE' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          3. Export-Safe Leads ({eligibleLeads.length})
        </button>
        <button
          onClick={() => setActiveTab('BLOCKED')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
            activeTab === 'BLOCKED' ? 'bg-rose-950/80 text-rose-400 border border-rose-800 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          4. Blocked / Restricted ({blockedLeads.length + candidateCounts.blockedGoogleCount})
        </button>
        <button
          onClick={() => setActiveTab('REVIEW_QUEUE')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
            activeTab === 'REVIEW_QUEUE' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          5. Review Queue
        </button>
        <button
          onClick={() => setActiveTab('CONFLICTS')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
            activeTab === 'CONFLICTS' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          6. Conflicts
        </button>
        <button
          onClick={() => setActiveTab('INDEPENDENT_EVIDENCE')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
            activeTab === 'INDEPENDENT_EVIDENCE' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          7. Independent Evidence
        </button>
        <button
          onClick={() => setActiveTab('EXPORT_READINESS')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
            activeTab === 'EXPORT_READINESS' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          8. Export Readiness
        </button>
      </nav>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Lead Records List */}
        <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-900/50">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Displaying {leads.length} Projected Leads</span>
            <span>{eligibleLeads.length} Eligible</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {leads.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No projected leads yet. Attach an independent public source to qualify research candidates for export.
              </div>
            ) : (
              leads.map(lead => {
                const isSelected = lead.leadId === selectedLeadId;
                const isEligible = lead.exportEligibility === 'ELIGIBLE';

                return (
                  <div
                    key={lead.leadId}
                    onClick={() => setSelectedLeadId(lead.leadId)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-800/80 border-l-2 border-emerald-500' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-white truncate">{lead.identity.businessName}</div>
                      {isEligible ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 whitespace-nowrap">
                          EXPORT ELIGIBLE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 whitespace-nowrap">
                          BLOCKED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-mono truncate">{lead.identity.domain}</div>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {lead.sourceClass}
                      </span>
                      <span>Emails: {lead.contact.publicEmails.length}</span>
                      <span>Key People: {lead.person.leadershipPeople.length}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Record Detail & Provenance Cockpit */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-950 space-y-5">
          {selectedLead ? (
            <>
              {/* Top Banner: Provenance Badge & Eligibility State */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">ID: {selectedLead.leadId}</span>
                    {selectedLead.exportEligibility === 'ELIGIBLE' ? (
                      <span id="badge-independent-public" className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        INDEPENDENT PUBLIC SOURCE [EXPORT ELIGIBLE]
                      </span>
                    ) : (
                      <span id="badge-google-restricted" className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
                        GOOGLE RESTRICTED [NOT EXPORTABLE]
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedLead.identity.businessName}</h3>
                  <a
                    href={getSafeExternalUrl(selectedLead.identity.canonicalUrl) || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-sky-400 hover:underline font-mono mt-0.5 inline-block"
                  >
                    {selectedLead.identity.canonicalUrl}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  {selectedLead.exportEligibility === 'ELIGIBLE' ? (
                    <button
                      onClick={() => onBlockExport?.(selectedLead.leadId, 'Manual researcher block')}
                      className="px-3 py-1.5 rounded text-xs font-medium bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800"
                    >
                      Block Export
                    </button>
                  ) : (
                    <button
                      onClick={() => onUnblockExport?.(selectedLead.leadId)}
                      className="px-3 py-1.5 rounded text-xs font-medium bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800"
                    >
                      Unblock Export
                    </button>
                  )}
                </div>
              </div>

              {/* Public Website Evidence Section */}
              <section className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Independent Public Website Evidence</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Domain:</span>
                    <span className="ml-2 font-mono text-slate-200">{selectedLead.website.domain}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Page Title:</span>
                    <span className="ml-2 text-slate-200">{selectedLead.website.pageTitle || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Description:</span>
                    <span className="ml-2 text-slate-300">{selectedLead.website.metaDescription || 'N/A'}</span>
                  </div>
                </div>
              </section>

              {/* Public Contact Evidence Section */}
              <section className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Public Contact Evidence</h4>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500">Emails ({selectedLead.contact.publicEmails.length}):</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {selectedLead.contact.publicEmails.map((em, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 font-mono text-emerald-400 border border-slate-700">
                          {em.email} ({em.classification})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500">Phones ({selectedLead.contact.publicPhones.length}):</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {selectedLead.contact.publicPhones.map((ph, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 font-mono text-sky-400 border border-slate-700">
                          {ph.phone}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Public Person Evidence Section */}
              <section className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Leadership & Key People</h4>
                <div className="space-y-1.5 text-xs">
                  {selectedLead.person.leadershipPeople.length === 0 ? (
                    <div className="text-slate-500 italic">No leadership persons discovered on public pages.</div>
                  ) : (
                    selectedLead.person.leadershipPeople.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-800">
                        <span className="font-semibold text-white">{p.fullName}</span>
                        <span className="text-slate-400">{p.jobTitle}</span>
                        {p.email && <span className="text-emerald-400 font-mono">{p.email}</span>}
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Eligibility Reason Codes */}
              <section className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Eligibility Engine Decision</h4>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {selectedLead.eligibilityReasons.map((rc, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded font-mono text-[11px] border ${
                        rc.includes('PRESENT') || rc.includes('SOURCE')
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                          : 'bg-rose-950/70 text-rose-300 border-rose-800'
                      }`}
                    >
                      {rc}
                    </span>
                  ))}
                </div>
              </section>

              {/* User Metadata / Researcher Notes */}
              <section className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Researcher Notes & Metadata</h4>
                <textarea
                  value={selectedLead.userMetadata.notes || ''}
                  onChange={e => onUpdateMetadata?.(selectedLead.leadId, e.target.value)}
                  placeholder="Enter researcher notes (stored in lead user metadata)..."
                  className="w-full h-20 p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600 resize-none"
                />
              </section>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">Select a lead to inspect details.</div>
          )}
        </div>
      </div>
    </div>
  );
};
