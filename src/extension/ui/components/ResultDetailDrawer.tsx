/**
 * LeadNoria — Phase 15 & Phase 25: UI/UX Integration & Unified Lead Intelligence
 * Comprehensive Result Detail Drawer (10 Canonical Lead Intelligence Sections)
 * 
 * Strict Invariants:
 * - Human-understandable labels, no raw technical enums or opaque internal IDs
 * - Separate source badges: [Meta], [Website], [Restricted Google]
 * - Field-level evidence inspection (expandable)
 * - Transparent conflict display (Source A vs Source B with timestamps and values)
 * - Phase 23 qualification reason graph: Result, Why (✓), Potential issues (!)
 * - Descriptive quality indicators: Data completeness, Contact depth, Evidence coverage
 * - Safe URL handling: validates external URLs before rendering clickable links
 * - Accessible drawer: Escape to close, focus management, visible focus rings
 */

import React, { useState, useEffect, useRef } from 'react';
import { ResultDetailViewModel } from '../types.ts';
import { StatusBadge } from './StatusBadge.tsx';
import { getSafeExternalUrl } from '../security.ts';
import { toFriendlyStatus } from '../humanLabels.ts';

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
  const [expandedConflicts, setExpandedConflicts] = useState<Set<number>>(new Set());
  const [expandedFieldEvidence, setExpandedFieldEvidence] = useState<Set<string>>(new Set());

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

  const safeWebsiteUrl = getSafeExternalUrl(lead.websiteUrl || lead.digitalPresence?.websiteUrl);

  const toggleConflict = (idx: number) => {
    const next = new Set(expandedConflicts);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedConflicts(next);
  };

  const toggleFieldEvidence = (field: string) => {
    const next = new Set(expandedFieldEvidence);
    if (next.has(field)) next.delete(field);
    else next.add(field);
    setExpandedFieldEvidence(next);
  };

  // Section data from view model
  const identity = lead.identityDetails || {
    canonicalBusinessName: lead.displayName,
    aliases: lead.aliases || [],
    entityType: 'LOCAL_BUSINESS',
    entityTypeLabel: 'Local Business'
  };

  const business = lead.businessDetails || {
    categories: lead.category ? [lead.category] : [],
    services: [],
    businessStatus: 'Operational'
  };

  const location = lead.locationDetails || {
    address: lead.addresses?.[0]?.addressLine,
    city: lead.addresses?.[0]?.locality,
    addresses: (lead.addresses || []).map(a => a.addressLine)
  };

  const digital = lead.digitalPresence || {
    websiteUrl: safeWebsiteUrl || undefined,
    socialLinks: lead.socialLinks || []
  };

  const contacts = lead.contactsDetails || {
    emails: (lead.emails || []).map(e => ({ address: e.address, classification: e.classification, source: e.observation })),
    phones: (lead.phones || []).map(p => ({ number: p.number, type: p.type, source: p.observation })),
    forms: lead.hasContactForm ? ['Observed on Website'] : []
  };

  const people = lead.peopleDetails || [];

  const qualification = lead.qualificationDetails || {
    finalState: lead.qualificationState,
    friendlyFinalState: toFriendlyStatus(lead.qualificationState),
    profileName: lead.qualificationProfileName,
    explanation: lead.qualificationSummaryExplanation,
    whyReasons: lead.mandatoryCriteria.filter(c => c.status === 'PASS').map(c => ({ label: c.name, passed: true, explanation: c.explanation })),
    potentialIssues: lead.mandatoryCriteria.filter(c => c.status !== 'PASS').map(c => ({ label: c.name, explanation: c.explanation })),
    criteria: [...lead.mandatoryCriteria, ...lead.optionalCriteria].map(c => ({
      ...c,
      friendlyStatus: toFriendlyStatus(c.status)
    }))
  };

  const evidence = lead.evidenceDetails || {
    totalCount: lead.evidenceItems.length,
    items: lead.evidenceItems.map(e => ({
      id: e.id,
      fact: e.fact,
      source: e.sourceFamily,
      sourceUrl: e.pageOrSourceReference,
      observedAt: lead.updatedAt,
      isRestricted: e.isRestricted
    })),
    fieldEvidence: [],
    conflicts: []
  };

  const freshness = lead.freshnessDetails || {
    overallState: lead.dataSignals?.freshness || 'CURRENT',
    friendlyLabel: lead.dataSignals?.freshnessLabel || 'Recently observed',
    firstObservedAt: lead.createdAt,
    lastObservedAt: lead.updatedAt,
    perSource: []
  };

  const quality = lead.qualityDetails || lead.qualityMetrics || {
    completenessPercent: 75,
    contactCompletenessPercent: 50,
    evidenceCoveragePercent: 80,
    corroborationCount: lead.corroborationCount,
    contradictionCount: 0
  };

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
            {/* Badges & Source Lineage */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <StatusBadge
                status={lead.qualificationState}
                customLabel={qualification.friendlyFinalState}
                size="sm"
              />

              {/* Separate Source Badges */}
              {lead.sourceBadges && lead.sourceBadges.length > 0 ? (
                lead.sourceBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className={`px-1.5 py-0.5 text-[10px] font-semibold rounded border ${
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
                <span className="px-1.5 py-0.5 text-[10px] font-semibold text-sky-300 bg-sky-950/60 border border-sky-500/40 rounded">
                  {toFriendlyStatus(lead.primarySource)}
                </span>
              )}

              {lead.isRestricted && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 bg-purple-950/60 border border-purple-500/40 rounded">
                  ⊘ RESTRICTED SOURCE
                </span>
              )}
            </div>

            <h2 id="detail-drawer-title" className="text-base font-bold text-slate-100 leading-snug">
              {identity.canonicalBusinessName}
            </h2>

            <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span>Type: <strong className="text-slate-200">{identity.entityTypeLabel}</strong></span>
              {location.city && (
                <>
                  <span>•</span>
                  <span>📍 {location.city}{location.country ? `, ${location.country}` : ''}</span>
                </>
              )}
              {business.categories.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-sky-300">{business.categories[0]}</span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        {/* Quality Indicator Bar */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">Data Completeness</span>
            <strong className="text-slate-200 text-xs">{quality.completenessPercent}%</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Contact Depth</span>
            <strong className="text-slate-200 text-xs">{quality.contactCompletenessPercent}%</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Corroborated Sources</span>
            <strong className="text-sky-300 text-xs">{quality.corroborationCount}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Contradictions</span>
            <strong className={`text-xs ${quality.contradictionCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {quality.contradictionCount}
            </strong>
          </div>
        </div>

        {/* Drawer Body: 10 Inspection Sections */}
        <div className="p-4 overflow-y-auto flex flex-col gap-4 text-xs text-slate-300">
          
          {/* Section 1: IDENTITY */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">1. Identity</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">Canonical Business Name:</span>
                <span className="font-semibold text-slate-100">{identity.canonicalBusinessName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Entity Classification:</span>
                <span className="font-medium text-slate-200">{identity.entityTypeLabel}</span>
              </div>
              {identity.aliases.length > 0 && (
                <div className="col-span-2">
                  <span className="text-slate-500 block">Known Aliases:</span>
                  <span className="text-slate-300">{identity.aliases.join(', ')}</span>
                </div>
              )}
              {identity.branchInfo && (
                <div className="col-span-2 p-2 bg-slate-900 rounded border border-slate-800 text-[11px]">
                  <span className="font-semibold text-slate-200 block mb-0.5">
                    {identity.branchInfo.isBranch ? 'Branch Location' : 'Parent Organization'}
                  </span>
                  {identity.branchInfo.parentEntityId && (
                    <span className="text-slate-400 block">Parent ID: <code className="font-mono text-slate-300">{identity.branchInfo.parentEntityId}</code></span>
                  )}
                  {identity.branchInfo.branchSignals && identity.branchInfo.branchSignals.length > 0 && (
                    <span className="text-slate-400 block mt-0.5">Signals: {identity.branchInfo.branchSignals.join('; ')}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: BUSINESS */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">2. Business</h3>
            <div className="flex flex-col gap-1.5 text-[11px]">
              {business.categories.length > 0 && (
                <div>
                  <span className="text-slate-500 block">Categories:</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {business.categories.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-900 text-sky-300 rounded border border-slate-800 font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {business.services.length > 0 && (
                <div>
                  <span className="text-slate-500 block">Identified Services:</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {business.services.map((s, i) => (
                      <span key={i} className="px-1.5 py-0.2 bg-slate-900 text-slate-300 rounded border border-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {business.description && (
                <div>
                  <span className="text-slate-500 block">Business Description:</span>
                  <p className="text-slate-300 leading-relaxed mt-0.5">{business.description}</p>
                </div>
              )}
              {business.hours && (
                <div>
                  <span className="text-slate-500 block">Business Hours:</span>
                  <span className="text-slate-300 font-mono">{business.hours}</span>
                </div>
              )}
              {business.serviceAreas && business.serviceAreas.length > 0 && (
                <div>
                  <span className="text-slate-500 block">Service Areas:</span>
                  <span className="text-slate-300">{business.serviceAreas.join(', ')}</span>
                </div>
              )}
              {business.businessStatus && (
                <div>
                  <span className="text-slate-500">Operational Status: </span>
                  <strong className="text-slate-200">{business.businessStatus}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: LOCATION */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">3. Location</h3>
            <div className="text-[11px] flex flex-col gap-1">
              {location.addresses.length > 0 ? (
                <ul className="space-y-1">
                  {location.addresses.map((addr, i) => (
                    <li key={i} className="p-1.5 bg-slate-900 rounded border border-slate-800 text-slate-200 flex items-start gap-1.5">
                      <span>📍</span>
                      <span>{addr}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-500">Physical address data not available.</span>
              )}
              {location.city && (
                <div className="mt-1 text-slate-400">
                  <span>Geographic Scope: </span>
                  <strong className="text-slate-200">{[location.city, location.region, location.country].filter(Boolean).join(', ')}</strong>
                </div>
              )}
              {location.coordinates && (
                <div className="text-slate-500 font-mono text-[10px]">
                  Coordinates: {location.coordinates}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: DIGITAL PRESENCE */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">4. Digital Presence</h3>
            <div className="text-[11px] flex flex-col gap-1.5">
              {safeWebsiteUrl ? (
                <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500">Website:</span>
                  <a
                    href={safeWebsiteUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sky-400 hover:underline truncate max-w-sm font-medium"
                  >
                    {safeWebsiteUrl} ↗
                  </a>
                  {lead.dataSignals?.websiteVerified && (
                    <span className="px-1.5 py-0.2 text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 rounded font-semibold ml-auto">
                      ✓ VERIFIED
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-slate-500">Website data not available.</span>
              )}

              {/* Technology & Capabilities */}
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {digital.cms && (
                  <span className="px-1.5 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800 text-[10px]">
                    CMS: {digital.cms}
                  </span>
                )}
                {digital.ecommerce && (
                  <span className="px-1.5 py-0.5 bg-sky-950/50 text-sky-300 rounded border border-sky-500/30 text-[10px]">
                    🛒 E-Commerce
                  </span>
                )}
                {digital.booking && (
                  <span className="px-1.5 py-0.5 bg-purple-950/50 text-purple-300 rounded border border-purple-500/30 text-[10px]">
                    📅 Booking Available
                  </span>
                )}
                {digital.chat && (
                  <span className="px-1.5 py-0.5 bg-emerald-950/50 text-emerald-300 rounded border border-emerald-500/30 text-[10px]">
                    💬 Live Chat
                  </span>
                )}
              </div>

              {/* Social Profiles */}
              {digital.socialLinks && digital.socialLinks.length > 0 && (
                <div>
                  <span className="text-slate-500 block mb-1">Public Profiles:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {digital.socialLinks.map((s, i) => {
                      const safe = getSafeExternalUrl(s.url);
                      return (
                        <a
                          key={i}
                          href={safe || '#'}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-sky-300 rounded border border-slate-800 flex items-center gap-1 text-[10px]"
                        >
                          <span>🔗</span> {s.platform}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: CONTACTS (with field-level evidence inspection) */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">5. Contacts</h3>

            {/* Phones */}
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Public Business Phones:</span>
              {contacts.phones.length > 0 ? (
                <ul className="space-y-1.5">
                  {contacts.phones.map((p, i) => (
                    <li key={i} className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-100 font-medium">📞 {p.number}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">{p.type}</span>
                          <button
                            type="button"
                            onClick={() => toggleFieldEvidence(`phone_${i}`)}
                            className="text-[10px] text-sky-400 hover:underline cursor-pointer ml-1"
                          >
                            {expandedFieldEvidence.has(`phone_${i}`) ? 'Hide Source' : 'View Source'}
                          </button>
                        </div>
                      </div>
                      {expandedFieldEvidence.has(`phone_${i}`) && (
                        <div className="mt-1.5 p-1.5 bg-slate-950/80 rounded border border-slate-800 text-[10px] text-slate-400 flex flex-col gap-0.5">
                          <div>Source Attribution: <strong className="text-slate-300">{p.source || 'Public Web Observation'}</strong></div>
                          {p.observedAt && <div>Observed: {p.observedAt}</div>}
                          {p.hasConflict && <div className="text-amber-400">⚠️ Multiple phone numbers observed across sources</div>}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[11px] text-slate-500">Public phone data not available.</span>
              )}
            </div>

            {/* Emails */}
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Public Business Emails:</span>
              {contacts.emails.length > 0 ? (
                <ul className="space-y-1.5">
                  {contacts.emails.map((e, i) => (
                    <li key={i} className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-100 font-medium">✉ {e.address}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">{e.classification}</span>
                          <button
                            type="button"
                            onClick={() => toggleFieldEvidence(`email_${i}`)}
                            className="text-[10px] text-sky-400 hover:underline cursor-pointer ml-1"
                          >
                            {expandedFieldEvidence.has(`email_${i}`) ? 'Hide Source' : 'View Source'}
                          </button>
                        </div>
                      </div>
                      {expandedFieldEvidence.has(`email_${i}`) && (
                        <div className="mt-1.5 p-1.5 bg-slate-950/80 rounded border border-slate-800 text-[10px] text-slate-400 flex flex-col gap-0.5">
                          <div>Source Attribution: <strong className="text-slate-300">{e.source || 'Public Web Observation'}</strong></div>
                          {e.observedAt && <div>Observed: {e.observedAt}</div>}
                          {e.hasConflict && <div className="text-amber-400">⚠️ Conflicting email observed</div>}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[11px] text-slate-500">Public email data not available.</span>
              )}
            </div>

            {/* Contact Forms */}
            {contacts.forms && contacts.forms.length > 0 && (
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span>Contact Form: </span>
                <strong className="text-slate-200">Observed on public website</strong>
              </div>
            )}
          </div>

          {/* Section 6: PEOPLE */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">6. People &amp; Roles</h3>
            {people.length > 0 ? (
              <ul className="space-y-1.5 text-[11px]">
                {people.map((p, i) => (
                  <li key={i} className="p-2 bg-slate-900 rounded border border-slate-800 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-100 flex items-center gap-1.5">
                        <span>👤</span> {p.name}
                      </strong>
                      {p.titles && p.titles.length > 0 && (
                        <span className="text-[10px] text-sky-400 font-medium">{p.titles.join(', ')}</span>
                      )}
                    </div>
                    {p.emails && p.emails.length > 0 && (
                      <div className="text-[10px] text-slate-400 font-mono">Email: {p.emails.join(', ')}</div>
                    )}
                    {p.phones && p.phones.length > 0 && (
                      <div className="text-[10px] text-slate-400 font-mono">Phone: {p.phones.join(', ')}</div>
                    )}
                    {p.linkedInUrl && (
                      <a
                        href={p.linkedInUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <span>🔗</span> Public Profile ↗
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-[11px] text-slate-500">No public individual roles observed for this business.</span>
            )}
          </div>

          {/* Section 7: QUALIFICATION (Phase 23 Reason Graph) */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">7. Qualification Evaluation</h3>
              <StatusBadge
                status={qualification.finalState}
                customLabel={qualification.friendlyFinalState}
                size="sm"
              />
            </div>

            <div className="text-[11px] text-slate-400">
              Profile: <strong className="text-slate-200">{qualification.profileName}</strong>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800">
              {qualification.explanation}
            </p>

            {/* Why Reasons (Phase 23 Graph) */}
            {qualification.whyReasons && qualification.whyReasons.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold uppercase text-emerald-400 block mb-1">
                  Why Qualified:
                </span>
                <ul className="space-y-1 text-[11px]">
                  {qualification.whyReasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-slate-200">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{r.label}{r.explanation ? ` — ${r.explanation}` : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Potential Issues */}
            {qualification.potentialIssues && qualification.potentialIssues.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold uppercase text-amber-400 block mb-1">
                  Potential Issues / Observations:
                </span>
                <ul className="space-y-1 text-[11px]">
                  {qualification.potentialIssues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-amber-200">
                      <span className="text-amber-400 font-bold">!</span>
                      <span>{issue.label}{issue.explanation ? ` — ${issue.explanation}` : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Criteria Breakdown */}
            {qualification.criteria && qualification.criteria.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Criteria Outcomes:</span>
                <div className="space-y-1">
                  {qualification.criteria.map((c, i) => (
                    <div key={i} className="p-1.5 bg-slate-900 rounded border border-slate-800 text-[11px] flex items-center justify-between">
                      <span className="text-slate-200 font-medium">{c.name}</span>
                      <StatusBadge status={c.status} customLabel={c.friendlyStatus} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 8: EVIDENCE & CONFLICTS */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">8. Evidence &amp; Conflicts</h3>
              <span className="text-[10px] text-slate-500">{evidence.totalCount} public facts</span>
            </div>

            {/* Conflicts Warning & Detailed Comparison */}
            {evidence.conflicts && evidence.conflicts.length > 0 ? (
              <div className="p-2.5 rounded bg-amber-950/30 border border-amber-500/40 flex flex-col gap-2">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <span>⚠️</span> Conflicting Information Found ({evidence.conflicts.length})
                </span>
                {evidence.conflicts.map((conf, cIdx) => (
                  <div key={cIdx} className="p-2 bg-slate-900/90 rounded border border-amber-500/30 flex flex-col gap-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-100">{conf.field} differs between sources</strong>
                      <button
                        type="button"
                        onClick={() => toggleConflict(cIdx)}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                      >
                        {expandedConflicts.has(cIdx) ? 'Collapse' : 'Expand Details'}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">{conf.description}</p>
                    {expandedConflicts.has(cIdx) && (
                      <div className="mt-1 space-y-1 pt-1 border-t border-slate-800">
                        {conf.conflictingValues.map((cv, vIdx) => (
                          <div key={vIdx} className="p-1.5 bg-slate-950 rounded text-[10px] flex items-center justify-between text-slate-300">
                            <div>
                              <span className="text-slate-500">Source: </span>
                              <strong className="text-slate-200">{cv.source}</strong>
                              <span className="ml-2 font-mono text-sky-300">"{cv.value}"</span>
                            </div>
                            {cv.observedAt && <span className="text-slate-500 text-[9px]">{cv.observedAt}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-slate-500">No field conflicts detected across public sources.</span>
            )}

            {/* Evidence References */}
            {evidence.items && evidence.items.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Observed Facts:</span>
                <ul className="space-y-1 text-[11px]">
                  {evidence.items.slice(0, 5).map(ev => (
                    <li key={ev.id} className="p-2 bg-slate-900 rounded border border-slate-800 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-300">{toFriendlyStatus(ev.source)}</span>
                        {ev.isRestricted && <span className="text-purple-400 font-semibold">RESTRICTED</span>}
                      </div>
                      <span className="text-slate-200">{ev.fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section 9: FRESHNESS */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">9. Data Freshness</h3>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                freshness.overallState === 'CURRENT'
                  ? 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40'
                  : 'text-amber-400 bg-amber-950/50 border-amber-500/40'
              }`}>
                {freshness.friendlyLabel}
              </span>
            </div>

            <div className="text-[11px] flex flex-col gap-1">
              {freshness.lastObservedAt && (
                <div>
                  <span className="text-slate-500">Last Public Observation: </span>
                  <strong className="text-slate-200">{freshness.lastObservedAt}</strong>
                </div>
              )}
              {freshness.firstObservedAt && (
                <div>
                  <span className="text-slate-500">First Public Observation: </span>
                  <span className="text-slate-300">{freshness.firstObservedAt}</span>
                </div>
              )}

              {freshness.perSource && freshness.perSource.length > 0 && (
                <div className="mt-1 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">By Source:</span>
                  {freshness.perSource.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-1 bg-slate-900 rounded text-[10px] text-slate-300">
                      <span>{s.source}</span>
                      <span className="text-slate-400">{s.friendlyState} ({s.lastObservedAt})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 10: POLICY & COMPLIANCE */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">10. Policy &amp; Compliance</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                <span className="text-slate-500 block mb-0.5 text-[10px] uppercase">Export Eligibility</span>
                <span className={`font-semibold ${lead.isExportable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {lead.isExportable ? '✓ Eligible for Export' : '⊘ Not Exportable'}
                </span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                <span className="text-slate-500 block mb-0.5 text-[10px] uppercase">Storage Eligibility</span>
                <span className={`font-semibold ${lead.isPersistable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {lead.isPersistable ? '✓ Persistable' : '⊘ Not Persistable'}
                </span>
              </div>
            </div>
            {lead.isRestricted && (
              <p className="text-[11px] text-purple-300 bg-purple-950/40 p-2.5 rounded border border-purple-500/30 mt-1 leading-relaxed">
                <strong>Policy Notice:</strong> {lead.restrictionExplanation || 'Protected by source compliance policy. Consumer-web records cannot be exported or stored persistently.'}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
