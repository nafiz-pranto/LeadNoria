/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Comprehensive Result Detail Drawer (10 Inspection Sections)
 * 
 * Strict Invariants:
 * - Evidence-backed facts: no persuasive or subjective marketing summaries
 * - Preserves provenance & field-level restrictions
 * - Safe URL handling: validates external URLs before rendering clickable links
 * - Accessible drawer: Escape to close, focus management
 */

import React, { useEffect, useRef } from 'react';
import { ResultDetailViewModel } from '../types.ts';
import { StatusBadge } from './StatusBadge.tsx';
import { getSafeExternalUrl } from '../security.ts';

interface ResultDetailDrawerProps {
  isOpen: boolean;
  lead: ResultDetailViewModel | null;
  onClose: () => void;
}

export const ResultDetailDrawer: React.FC<ResultDetailDrawerProps> = ({
  isOpen,
  lead,
  onClose
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    drawerRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !lead) return null;

  const safeWebsiteUrl = getSafeExternalUrl(lead.websiteUrl);

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-drawer-title"
    >
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="w-full max-w-xl bg-slate-900 border-l border-slate-700 h-full flex flex-col shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={lead.qualificationState} size="sm" />
              <StatusBadge status={lead.relevanceDecision} size="sm" />
              {lead.isRestricted && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 bg-purple-950/60 border border-purple-500/40 rounded">
                  ⊘ RESTRICTED SOURCE
                </span>
              )}
            </div>
            <h2 id="detail-drawer-title" className="text-base font-bold text-slate-100 leading-snug">
              {lead.displayName}
            </h2>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Entity ID: <code className="text-slate-300 font-mono">{lead.entityId.substring(0, 16)}</code></span>
              <span>•</span>
              <span>Primary: <strong className="text-slate-200">{lead.primarySource}</strong></span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        {/* Drawer Body: 10 Factual Sections */}
        <div className="p-4 overflow-y-auto flex flex-col gap-5 text-xs text-slate-300">
          {/* Section 1: Identity */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">1. Identity</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">Display Name:</span>
                <span className="font-medium text-slate-200">{lead.displayName}</span>
              </div>
              {lead.legalName && (
                <div>
                  <span className="text-slate-500 block">Legal Name:</span>
                  <span className="font-medium text-slate-200">{lead.legalName}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 block">Identity Confidence:</span>
                <span className="font-medium text-slate-200">{lead.identityConfidence}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Sources & Provenance */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">2. Sources &amp; Provenance</h3>
            <div className="text-[11px] flex flex-col gap-1">
              <div>
                <span className="text-slate-500">Provenance Lineage:</span>{' '}
                <strong className="text-slate-200">{lead.provenanceLineage}</strong> ({lead.provenanceClassification})
              </div>
              <div>
                <span className="text-slate-500">Contributing Sources ({lead.contributingSources.length}):</span>{' '}
                <span className="text-slate-300">{lead.contributingSources.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Relevance (Phase 9) */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">3. Relevance (Phase 9)</h3>
              <StatusBadge status={lead.relevanceDecision} size="sm" />
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {lead.relevanceExplanation}
            </p>
            {lead.relevanceMatchedTerms.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mt-1">
                <span className="text-[10px] text-slate-500">Matched Terms:</span>
                {lead.relevanceMatchedTerms.map((term, i) => (
                  <span key={i} className="px-1.5 py-0.2 text-[10px] bg-slate-800 text-sky-300 rounded font-mono">
                    {term}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Website Verification (Phase 6/10) */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">4. Website Verification</h3>
              <StatusBadge status={lead.websiteVerificationStatus} size="sm" />
            </div>
            <div className="text-[11px] flex flex-col gap-1">
              {safeWebsiteUrl ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">URL:</span>
                  <a
                    href={safeWebsiteUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sky-400 hover:underline truncate max-w-sm"
                  >
                    {safeWebsiteUrl} ↗
                  </a>
                </div>
              ) : (
                <span className="text-slate-500">Website data not available or unverified pointer.</span>
              )}
            </div>
          </div>

          {/* Section 5: Contact Facts (Phase 11) */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">5. Contact Information</h3>
            
            {/* Phones */}
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Business Phones:</span>
              {lead.phones.length > 0 ? (
                <ul className="space-y-1">
                  {lead.phones.map((p, i) => (
                    <li key={i} className="flex items-center justify-between text-[11px] bg-slate-900 p-1.5 rounded border border-slate-800">
                      <span className="font-mono text-slate-200">📞 {p.number}</span>
                      <span className="text-[10px] text-slate-500">{p.observation}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[11px] text-slate-500">Public phone data not available.</span>
              )}
            </div>

            {/* Emails */}
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Business Emails:</span>
              {lead.emails.length > 0 ? (
                <ul className="space-y-1">
                  {lead.emails.map((e, i) => (
                    <li key={i} className="flex items-center justify-between text-[11px] bg-slate-900 p-1.5 rounded border border-slate-800">
                      <span className="font-mono text-slate-200">✉ {e.address}</span>
                      <span className="text-[10px] text-slate-500">{e.classification}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[11px] text-slate-500">Public business email data not available.</span>
              )}
            </div>

            {/* Contact Form */}
            <div className="text-[11px] text-slate-400">
              <span>Contact Form: </span>
              <strong className="text-slate-200">{lead.hasContactForm ? 'Observed on Website' : 'Not Observed'}</strong>
            </div>
          </div>

          {/* Section 6: Locations & Branches (Phase 7/8/13) */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">6. Physical Locations</h3>
            {lead.addresses.length > 0 ? (
              <ul className="space-y-1 text-[11px]">
                {lead.addresses.map((a, i) => (
                  <li key={i} className="p-1.5 bg-slate-900 rounded border border-slate-800 text-slate-300">
                    📍 {a.addressLine} {a.locality && `— ${a.locality}`} {a.isBranch && <span className="text-[10px] text-amber-400">(Branch)</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-[11px] text-slate-500">Physical address data not available.</span>
            )}
          </div>

          {/* Section 7: Digital Presence / Social Links */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">7. Digital Presence</h3>
            {lead.socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {lead.socialLinks.map((s, i) => {
                  const safe = getSafeExternalUrl(s.url);
                  return (
                    <a
                      key={i}
                      href={safe || '#'}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-300 rounded border border-slate-700 flex items-center gap-1"
                    >
                      <span>🔗</span> {s.platform}
                    </a>
                  );
                })}
              </div>
            ) : (
              <span className="text-[11px] text-slate-500">Social presence data not available.</span>
            )}
          </div>

          {/* Section 8: Qualification Evaluation (Phase 12) */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">8. Qualification (Phase 12)</h3>
              <StatusBadge status={lead.qualificationState} size="sm" />
            </div>

            <div className="text-[11px] text-slate-400">
              Profile: <strong className="text-slate-200">{lead.qualificationProfileName}</strong> (v{lead.qualificationProfileVersion})
              {lead.qualificationScoreText && ` • Score: ${lead.qualificationScoreText}`}
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {lead.qualificationSummaryExplanation}
            </p>

            {/* Mandatory Criteria */}
            {lead.mandatoryCriteria.length > 0 && (
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Mandatory Criteria:</span>
                {lead.mandatoryCriteria.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 bg-slate-900 rounded border border-slate-800 text-[11px]">
                    <span className="font-mono text-slate-300">{c.name}</span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 9: Evidence Ledger */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">9. Evidence Ledger</h3>
              <span className="text-[10px] text-slate-500">{lead.evidenceItems.length} facts</span>
            </div>

            {lead.evidenceItems.length > 0 ? (
              <ul className="space-y-1.5 text-[11px]">
                {lead.evidenceItems.map(ev => (
                  <li key={ev.id} className="p-2 bg-slate-900 rounded border border-slate-800/80 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-300">{ev.sourceFamily}</span>
                      <span className="font-mono text-slate-500">{ev.evidenceType}</span>
                    </div>
                    <span className="text-slate-200">{ev.fact}</span>
                    <span className="text-[10px] text-slate-500">Ref: {ev.pageOrSourceReference}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-[11px] text-slate-500">No granular evidence records bound to this entity.</span>
            )}
          </div>

          {/* Section 10: Compliance & Restrictions */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">10. Policy &amp; Compliance</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">Export Eligibility:</span>
                <span className={`font-semibold ${lead.isExportable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {lead.isExportable ? '✓ EXPORTABLE' : '⊘ NOT EXPORTABLE'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Persistence Eligibility:</span>
                <span className={`font-semibold ${lead.isPersistable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {lead.isPersistable ? '✓ PERSISTABLE' : '⊘ NOT PERSISTABLE'}
                </span>
              </div>
            </div>
            {lead.isRestricted && (
              <p className="text-[11px] text-purple-300 bg-purple-950/40 p-2 rounded border border-purple-500/30 mt-1">
                <strong>Restriction Notice:</strong> {lead.restrictionExplanation || 'Contains restricted public source data. Protected by compliance firewall.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
