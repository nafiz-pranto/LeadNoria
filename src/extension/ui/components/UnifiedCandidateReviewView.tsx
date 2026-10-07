/**
 * LeadNoria — Google Maps Unified Candidate Review & Qualification Layer
 * Part 7: Unified Candidate Research & Review Experience Component
 *
 * 10 Canonical Research & Decision Sections:
 * 1. Source / Acquisition
 * 2. Business Identity
 * 3. Maps Observations (Visually marked with Restricted Google Data Badge)
 * 4. Website Intelligence
 * 5. Contact Intelligence
 * 6. Person Intelligence
 * 7. Conflicts / Divergences (Explicit side-by-side display of both sources)
 * 8. Qualification Decision & Readiness
 * 9. Human Review Lifecycle Status & Actions
 * 10. Evidence & Field-Level Provenance
 *
 * HARD INVARIANTS:
 * - Google-restricted data is visually marked as restricted (NOT_EXPORTABLE / POLICY_GATED).
 * - Explicit provenance source tags for every evidence item.
 * - Zero dangerouslySetInnerHTML; strict XSS defense.
 * - Pure React UI interactions dispatching deterministic actions.
 */

import React, { useState } from 'react';
import type { CandidateReviewRecord, ReviewAction } from '../../acquisition/review/reviewTypes.ts';
import { getSafeExternalUrl } from '../security.ts';

export interface UnifiedCandidateReviewViewProps {
  record: CandidateReviewRecord;
  onDispatchAction?: (action: ReviewAction) => void;
  onClose?: () => void;
}

export const UnifiedCandidateReviewView: React.FC<UnifiedCandidateReviewViewProps> = ({
  record,
  onDispatchAction,
  onClose
}) => {
  const [notes, setNotes] = useState<string>(record.reviewerNotes || '');

  const cand = record.candidate;
  const qual = record.qualificationResult;
  const evSummary = record.evidenceSummary;
  const conflicts = record.conflicts;
  const provenance = record.provenance;

  const handleAction = (type: ReviewAction['type']) => {
    if (!onDispatchAction) return;
    onDispatchAction({
      type,
      candidateId: record.candidateId,
      reviewerNotes: notes,
      timestamp: new Date().toISOString()
    });
  };

  const safeWebUrl = getSafeExternalUrl(cand.websiteUrl?.parsedValue || cand.websiteUrl?.rawValue);

  // Review Status Badge Styles
  const getReviewStateBadge = () => {
    switch (record.reviewState) {
      case 'QUALIFIED':
        return <span id="badge-review-state" className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">QUALIFIED</span>;
      case 'DISQUALIFIED':
        return <span id="badge-review-state" className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800">DISQUALIFIED</span>;
      case 'NEEDS_REVIEW':
        return <span id="badge-review-state" className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800">NEEDS REVIEW</span>;
      case 'REVIEWING':
        return <span id="badge-review-state" className="px-2.5 py-1 rounded text-xs font-semibold bg-sky-950/80 text-sky-400 border border-sky-800 animate-pulse">REVIEWING</span>;
      case 'UNREVIEWED':
      default:
        return <span id="badge-review-state" className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">UNREVIEWED</span>;
    }
  };

  // Qualification Status Badge
  const getQualStatusBadge = () => {
    switch (qual.status) {
      case 'QUALIFIED':
        return <span id="badge-qual-status" className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-900/60 text-emerald-300">AUTO-PASS</span>;
      case 'DISQUALIFIED':
        return <span id="badge-qual-status" className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-900/60 text-rose-300">DISQUALIFIED</span>;
      case 'INSUFFICIENT_EVIDENCE':
        return <span id="badge-qual-status" className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-900/60 text-amber-300">INSUFFICIENT EVIDENCE</span>;
      case 'NEEDS_REVIEW':
      default:
        return <span id="badge-qual-status" className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-900/60 text-sky-300">NEEDS REVIEW</span>;
    }
  };

  return (
    <div id="review-view-container" className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto p-4 gap-4 text-xs font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>🔬</span> Candidate Research Dossier
          </h2>
          {getReviewStateBadge()}
        </div>
        {onClose && (
          <button
            type="button"
            id="btn-close-review-dossier"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800"
          >
            ✕ Close
          </button>
        )}
      </div>

      {/* 1. Source / Acquisition Section */}
      <section id="section-source-acquisition" className="p-3 bg-slate-900/90 rounded border border-slate-800 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">1. Source &amp; Acquisition Lineage</span>
          <span className="font-mono text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-900/50">
            {cand.source}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
          <div><span className="text-slate-500">Candidate ID:</span> <span className="font-mono text-[11px]">{cand.candidateId}</span></div>
          <div><span className="text-slate-500">Search Unit:</span> <span className="font-mono text-[11px]">{cand.searchUnitId || 'Direct'}</span></div>
          <div><span className="text-slate-500">Keyword:</span> {cand.searchKeyword || 'N/A'}</div>
          <div><span className="text-slate-500">First Observed:</span> {new Date(cand.firstObservedAt).toLocaleString()}</div>
        </div>
      </section>

      {/* 2. Business Identity Section */}
      <section id="section-business-identity" className="p-3 bg-slate-900/90 rounded border border-slate-800 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">2. Business Identity Resolution</span>
          <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">
            Tier: {cand.qualityMetrics?.identityConfidence || 'LOW'} ({cand.identityMethod})
          </span>
        </div>
        <div className="text-sm font-semibold text-white pt-0.5">
          {cand.businessName?.parsedValue || cand.businessName?.rawValue || 'Unknown Business'}
        </div>
        <div className="text-slate-400">
          <span className="text-slate-500">Category:</span> {cand.category?.parsedValue || cand.category?.rawValue || 'Uncategorized'}
        </div>
      </section>

      {/* 3. Maps Observations (Restricted Data Visual Marker) */}
      <section id="section-maps-observations" className="p-3 bg-slate-900/90 rounded border border-amber-900/40 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">3. Google Maps Browser Observations</span>
          <span id="badge-restricted-google-firewall" className="text-[10px] font-bold font-mono bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-700/60 flex items-center gap-1">
            <span>🛡️</span> RESTRICTED GOOGLE DATA (NOT EXPORTABLE)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
          <div>
            <span className="text-slate-500">Rating:</span>{' '}
            <span className="font-bold text-amber-300">
              {cand.rating?.parsedValue !== undefined ? `★ ${cand.rating.parsedValue.toFixed(1)}` : 'Unknown'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Reviews:</span>{' '}
            <span>{cand.reviewCount?.parsedValue !== undefined ? `${cand.reviewCount.parsedValue.toLocaleString()} reviews` : 'Unknown'}</span>
          </div>
          <div>
            <span className="text-slate-500">Maps Phone:</span>{' '}
            <span className="font-mono text-[11px]">{cand.phone?.parsedValue || cand.phone?.rawValue || 'None listed'}</span>
          </div>
          <div>
            <span className="text-slate-500">Maps Address:</span>{' '}
            <span>{cand.address?.parsedValue || cand.address?.rawValue || 'None listed'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500">Maps Place ID:</span>{' '}
            <span className="font-mono text-[10px] text-slate-400">{cand.placeId?.parsedValue || 'Unextracted'}</span>
          </div>
        </div>
      </section>

      {/* 4. Website Intelligence Section */}
      <section id="section-website-intelligence" className="p-3 bg-slate-900/90 rounded border border-slate-800 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">4. Website Intelligence</span>
          <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-sky-300">
            Status: {cand.enrichmentStatus || 'NOT_ELIGIBLE'}
          </span>
        </div>
        {cand.enrichmentResult?.websiteEvidence ? (
          <div className="flex flex-col gap-1 pt-1 text-slate-300">
            <div>
              <span className="text-slate-500">Canonical Target:</span>{' '}
              {safeWebUrl ? (
                <a href={safeWebUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 underline hover:text-sky-300">
                  {cand.enrichmentResult.websiteEvidence.canonicalUrl || safeWebUrl}
                </a>
              ) : (
                <span>{cand.enrichmentResult.websiteEvidence.canonicalUrl || 'N/A'}</span>
              )}
            </div>
            <div>
              <span className="text-slate-500">Page Title:</span>{' '}
              <span>{cand.enrichmentResult.websiteEvidence.pageTitle || 'None'}</span>
            </div>
            {cand.enrichmentResult.websiteEvidence.technologies?.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                <span className="text-slate-500 text-[11px]">Tech Stack:</span>
                {cand.enrichmentResult.websiteEvidence.technologies.map(t => (
                  <span key={t.name} className="px-1.5 py-0.5 bg-slate-800 text-[10px] rounded text-slate-300">
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-500 italic py-1">Website intelligence has not been gathered or is not eligible.</div>
        )}
      </section>

      {/* 5. Contact Intelligence Section */}
      <section id="section-contact-intelligence" className="p-3 bg-slate-900/90 rounded border border-slate-800 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">5. Contact Intelligence</span>
          <span className="text-[10px] text-slate-400">Public Crawled Signals</span>
        </div>
        {cand.enrichmentResult?.contactEvidence ? (
          <div className="grid grid-cols-2 gap-2 pt-1 text-slate-300">
            <div>
              <span className="text-slate-500 block text-[11px]">Emails ({cand.enrichmentResult.contactEvidence.emails.length}):</span>
              {cand.enrichmentResult.contactEvidence.emails.length > 0 ? (
                cand.enrichmentResult.contactEvidence.emails.map(e => (
                  <div key={e.email} className="font-mono text-emerald-400 text-[11px]">✉ {e.email}</div>
                ))
              ) : (
                <span className="text-slate-500 italic text-[11px]">No emails discovered</span>
              )}
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Website Phones ({cand.enrichmentResult.contactEvidence.phones.length}):</span>
              {cand.enrichmentResult.contactEvidence.phones.length > 0 ? (
                cand.enrichmentResult.contactEvidence.phones.map(p => (
                  <div key={p.phone} className="font-mono text-sky-400 text-[11px]">☎ {p.phone}</div>
                ))
              ) : (
                <span className="text-slate-500 italic text-[11px]">No website phones found</span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-slate-500 italic py-1">No contact enrichment records available.</div>
        )}
      </section>

      {/* 6. Person Intelligence Section */}
      <section id="section-person-intelligence" className="p-3 bg-slate-900/90 rounded border border-slate-800 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">6. Person &amp; Leadership Intelligence</span>
          <span className="text-[10px] text-slate-400">Website &amp; Leadership Bios</span>
        </div>
        {cand.enrichmentResult?.personEvidence?.people && cand.enrichmentResult.personEvidence.people.length > 0 ? (
          <div className="flex flex-col gap-1.5 pt-1">
            {cand.enrichmentResult.personEvidence.people.map(p => (
              <div key={p.fullName} className="p-2 bg-slate-950/70 rounded border border-slate-800/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">👤 {p.fullName}</div>
                  <div className="text-slate-400 text-[11px]">{p.jobTitle || 'Executive / Staff'}</div>
                </div>
                {p.linkedInUrl && (
                  <span className="text-sky-400 font-mono text-[10px]">LinkedIn</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 italic py-1">No public leadership persons identified on domain.</div>
        )}
      </section>

      {/* 7. Conflicts & Divergences Section */}
      <section id="section-conflicts-divergences" className="p-3 bg-slate-900/90 rounded border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">7. Source Divergences &amp; Conflicts</span>
          <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">
            {conflicts.length} Recorded
          </span>
        </div>
        {conflicts.length > 0 ? (
          <div className="flex flex-col gap-2 pt-1">
            {conflicts.map((c, idx) => (
              <div key={`${c.conflictType}_${idx}`} className="p-2.5 bg-slate-950/80 rounded border border-amber-900/40 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-400 text-[11px] font-semibold">{c.conflictType}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${c.tolerated ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                    {c.tolerated ? 'TOLERATED' : 'BLOCKING'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Maps Observation:</span>
                    <span className="text-slate-200 font-medium">{String(c.mapsValue || 'None')}</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Website Observation:</span>
                    <span className="text-slate-200 font-medium">{String(c.websiteValue || 'None')}</span>
                  </div>
                </div>
                <div className="text-slate-400 text-[10px] italic pt-0.5">{c.explanation}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-emerald-400/90 py-1 flex items-center gap-1.5">
            <span>✓</span> Zero conflicts or divergences recorded across sources.
          </div>
        )}
      </section>

      {/* 8. Qualification Decision & Readiness Section */}
      <section id="section-qualification-decision" className="p-3 bg-slate-900/90 rounded border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">8. Deterministic Qualification Engine</span>
          {getQualStatusBadge()}
        </div>

        {/* Readiness Gauges */}
        <div className="grid grid-cols-5 gap-1.5 text-center pt-1 text-slate-300">
          <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800">
            <div className="text-[10px] text-slate-500">Identity</div>
            <div className="font-bold text-sky-400 mt-0.5">{(qual.readiness.identityReadiness * 100).toFixed(0)}%</div>
          </div>
          <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800">
            <div className="text-[10px] text-slate-500">Website</div>
            <div className="font-bold text-sky-400 mt-0.5">{(qual.readiness.websiteReadiness * 100).toFixed(0)}%</div>
          </div>
          <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800">
            <div className="text-[10px] text-slate-500">Contact</div>
            <div className="font-bold text-sky-400 mt-0.5">{(qual.readiness.contactReadiness * 100).toFixed(0)}%</div>
          </div>
          <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800">
            <div className="text-[10px] text-slate-500">Person</div>
            <div className="font-bold text-sky-400 mt-0.5">{(qual.readiness.personReadiness * 100).toFixed(0)}%</div>
          </div>
          <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800">
            <div className="text-[10px] text-slate-500">Overall</div>
            <div className="font-bold text-emerald-400 mt-0.5">{(qual.readiness.overallQualificationReadiness * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Rule Evaluations */}
        <div className="flex flex-col gap-1 pt-1 text-[11px]">
          {qual.passedRules.map(r => (
            <div key={r} className="text-emerald-400 flex items-center gap-1.5">
              <span>✓</span> {r}
            </div>
          ))}
          {qual.failedRules.map(r => (
            <div key={r} className="text-rose-400 flex items-center gap-1.5">
              <span>✕</span> {r}
            </div>
          ))}
          {qual.blockedRules.map(r => (
            <div key={r} className="text-amber-400 flex items-center gap-1.5">
              <span>⚠</span> Blocked: {r}
            </div>
          ))}
        </div>
      </section>

      {/* 9. Human Review Lifecycle & Controls */}
      <section id="section-review-status" className="p-3 bg-slate-900 rounded border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">9. Review Lifecycle Actions</span>
          <span className="text-[10px] text-slate-400 font-mono">Current: {record.reviewState}</span>
        </div>

        {/* Notes Textarea */}
        <div className="flex flex-col gap-1">
          <label htmlFor="input-reviewer-notes" className="text-[11px] text-slate-400">
            Reviewer Research Notes:
          </label>
          <textarea
            id="input-reviewer-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add qualification rationale or researcher observations..."
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
          <button
            type="button"
            id="btn-start-review"
            onClick={() => handleAction('START_REVIEW')}
            className="px-3 py-1.5 rounded bg-sky-900/60 hover:bg-sky-800 text-sky-200 font-semibold border border-sky-700/50"
          >
            Start Review
          </button>
          <button
            type="button"
            id="btn-mark-qualified"
            onClick={() => handleAction('MARK_QUALIFIED')}
            className="px-3 py-1.5 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-semibold"
          >
            Mark Qualified
          </button>
          <button
            type="button"
            id="btn-mark-disqualified"
            onClick={() => handleAction('MARK_DISQUALIFIED')}
            className="px-3 py-1.5 rounded bg-rose-900 hover:bg-rose-800 text-white font-semibold"
          >
            Mark Disqualified
          </button>
          <button
            type="button"
            id="btn-mark-needs-review"
            onClick={() => handleAction('MARK_NEEDS_REVIEW')}
            className="px-3 py-1.5 rounded bg-amber-900/80 hover:bg-amber-800 text-amber-200 font-semibold"
          >
            Needs Review
          </button>
          <button
            type="button"
            id="btn-reset-review"
            onClick={() => handleAction('RESET_REVIEW')}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 font-semibold"
          >
            Reset
          </button>
        </div>
      </section>

      {/* 10. Evidence & Provenance Table */}
      <section id="section-evidence-provenance" className="p-3 bg-slate-900/90 rounded border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">10. Evidence Lineage &amp; Field Provenance</span>
          <span className="text-[10px] text-slate-400">{provenance.length} Fields Tracked</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px]">
                <th className="py-1">Field</th>
                <th className="py-1">Source Lineage</th>
                <th className="py-1">Value</th>
                <th className="py-1">Restricted</th>
              </tr>
            </thead>
            <tbody>
              {provenance.map((p, idx) => (
                <tr key={`${p.fieldName}_${idx}`} className="border-b border-slate-800/40 text-slate-300">
                  <td className="py-1 font-mono text-slate-400">{p.fieldName}</td>
                  <td className="py-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                      p.source === 'GOOGLE_MAPS_BROWSER' ? 'bg-amber-950 text-amber-300 border border-amber-900/60' :
                      p.source === 'WEBSITE_PUBLIC' ? 'bg-sky-950 text-sky-300' :
                      p.source === 'CONTACT_PUBLIC' ? 'bg-emerald-950 text-emerald-300' :
                      p.source === 'PERSON_PUBLIC' ? 'bg-indigo-950 text-indigo-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {p.source}
                    </span>
                  </td>
                  <td className="py-1 max-w-[200px] truncate" title={String(p.value)}>
                    {String(Array.isArray(p.value) ? p.value.join(', ') : p.value)}
                  </td>
                  <td className="py-1">
                    {p.isRestricted ? (
                      <span className="text-amber-400 font-bold font-mono text-[10px]">YES</span>
                    ) : (
                      <span className="text-slate-500 font-mono text-[10px]">NO</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
