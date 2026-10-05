/**
 * LeadNoria — Phase 30: Production Intelligence Analytics & Run Quality Insights
 * Analytics UI Component
 *
 * Invariants:
 * - 100% observational: no predictive scores, no conversion claims
 * - Fully accessible: ARIA landmarks, semantic headings, visible focus, keyboard navigable
 * - Responsive: designed down to 360px viewport without nested scroll traps
 * - Interactive filter handoff: clicking metric cards triggers parent navigation to filtered results
 */

import React, { useState, useMemo } from 'react';
import {
  RunAnalyticsSnapshot,
  RunComparisonSnapshot,
  AnalyticsFilterTarget,
  QualityWarning
} from '../../analytics/types.ts';
import { compareRuns } from '../../analytics/analyticsEngine.ts';

export interface AnalyticsViewProps {
  currentSnapshot: RunAnalyticsSnapshot | null;
  historySnapshots?: RunAnalyticsSnapshot[];
  rawRecords?: any[];
  onSelectRun?: (runId: string) => void;
  onNavigateToResultsWithFilter?: (filter: AnalyticsFilterTarget) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  currentSnapshot,
  historySnapshots = [],
  rawRecords = [],
  onSelectRun,
  onNavigateToResultsWithFilter
}) => {
  const [activeSection, setActiveSection] = useState<'SUMMARY' | 'COVERAGE' | 'CONTACTS' | 'WEBSITE' | 'QUALIFICATION' | 'WARNINGS' | 'COMPARISON'>('SUMMARY');
  const [compareRunId, setCompareRunId] = useState<string>('');

  // Selected compare snapshot
  const compareSnapshot = useMemo(() => {
    if (!compareRunId) return null;
    return historySnapshots.find(s => s.runId === compareRunId) || null;
  }, [compareRunId, historySnapshots]);

  // Comparison result
  const comparisonResult: RunComparisonSnapshot | null = useMemo(() => {
    if (!currentSnapshot || !compareSnapshot) return null;
    return compareRuns(currentSnapshot, compareSnapshot, rawRecords, []);
  }, [currentSnapshot, compareSnapshot, rawRecords]);

  if (!currentSnapshot) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 min-h-[300px]" role="region" aria-label="Analytics empty state">
        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 mb-3 text-xl">
          📊
        </div>
        <h2 className="text-base font-semibold text-slate-200">No Analytics Data Available</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Execute or load a research run to view comprehensive lead quality, website intelligence, and coverage analytics.
        </p>
      </div>
    );
  }

  const { runMetrics, coverage, contactability, website, qualification, warnings, restrictedAggregate } = currentSnapshot;

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto bg-slate-900 text-slate-100 text-xs" role="region" aria-label="LeadNoria Intelligence Analytics">
      {/* Top Header & Run Selector */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
            <span>📈</span> Intelligence Analytics
          </span>
          <span className="text-[10px] text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded font-mono truncate max-w-[140px]">
            {currentSnapshot.runId}
          </span>
        </div>

        {/* History Switcher */}
        {historySnapshots.length > 1 && onSelectRun && (
          <div className="flex items-center gap-1">
            <label htmlFor="analytics-run-select" className="text-[10px] text-slate-400">Run:</label>
            <select
              id="analytics-run-select"
              value={currentSnapshot.runId}
              onChange={e => onSelectRun(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {historySnapshots.map(s => (
                <option key={s.runId} value={s.runId}>
                  {s.runTitle || s.runId} ({s.totalRecords} leads)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sub-Navigation Bar */}
      <nav className="flex items-center px-2 border-b border-slate-800 bg-slate-950/80 gap-1 overflow-x-auto scrollbar-none shrink-0" role="tablist" aria-label="Analytics view sections">
        {[
          { id: 'SUMMARY', label: 'Summary' },
          { id: 'COVERAGE', label: 'Coverage' },
          { id: 'CONTACTS', label: 'Contacts' },
          { id: 'WEBSITE', label: 'Website' },
          { id: 'QUALIFICATION', label: 'Qualification' },
          { id: 'WARNINGS', label: `Warnings (${warnings.length})`, badge: warnings.length > 0 ? warnings.length : undefined },
          { id: 'COMPARISON', label: 'Compare' }
        ].map(sec => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-2.5 py-2 text-[11px] font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-sky-400 ${
                isActive
                  ? 'border-sky-500 text-sky-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec.label}
            </button>
          );
        })}
      </nav>

      {/* Body Content */}
      <div className="p-3 space-y-3 min-w-0">
        {/* SECTION: SUMMARY */}
        {activeSection === 'SUMMARY' && (
          <div className="space-y-3">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded">
                <div className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">Total Discovered</div>
                <div className="text-lg font-bold text-slate-100 mt-0.5">{runMetrics.recordsDiscovered}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{runMetrics.recordsAccepted} accepted</div>
              </div>

              <div
                onClick={() => onNavigateToResultsWithFilter?.('QUALIFIED')}
                className={`p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded ${onNavigateToResultsWithFilter ? 'cursor-pointer hover:border-emerald-500 transition-colors' : ''}`}
                title="Click to filter results by QUALIFIED"
              >
                <div className="text-[10px] text-emerald-400 uppercase font-medium tracking-wider">Qualified</div>
                <div className="text-lg font-bold text-emerald-300 mt-0.5">{runMetrics.qualifiedCount}</div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5">
                  {currentSnapshot.totalRecords > 0 ? Math.round((runMetrics.qualifiedCount / currentSnapshot.totalRecords) * 100) : 0}% of leads
                </div>
              </div>

              <div
                onClick={() => onNavigateToResultsWithFilter?.('UNCERTAIN')}
                className={`p-2.5 bg-amber-950/30 border border-amber-500/30 rounded ${onNavigateToResultsWithFilter ? 'cursor-pointer hover:border-amber-500 transition-colors' : ''}`}
                title="Click to filter results by UNCERTAIN"
              >
                <div className="text-[10px] text-amber-400 uppercase font-medium tracking-wider">Uncertain</div>
                <div className="text-lg font-bold text-amber-300 mt-0.5">{runMetrics.uncertainCount}</div>
                <div className="text-[10px] text-amber-400/80 mt-0.5">Needs review</div>
              </div>

              <div
                onClick={() => onNavigateToResultsWithFilter?.('BLOCKED')}
                className={`p-2.5 bg-rose-950/30 border border-rose-500/30 rounded ${onNavigateToResultsWithFilter ? 'cursor-pointer hover:border-rose-500 transition-colors' : ''}`}
                title="Click to filter results by BLOCKED"
              >
                <div className="text-[10px] text-rose-400 uppercase font-medium tracking-wider">Blocked / Excluded</div>
                <div className="text-lg font-bold text-rose-300 mt-0.5">{runMetrics.blockedCount}</div>
                <div className="text-[10px] text-rose-400/80 mt-0.5">Firewall protected</div>
              </div>
            </div>

            {/* Pipeline Processing Ledger */}
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded space-y-2">
              <h3 className="text-xs font-semibold text-slate-200">Observed Processing Ledger</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="flex justify-between border-b border-slate-700/40 pb-1">
                  <span className="text-slate-400">Duplicates Detected:</span>
                  <span className="font-mono text-slate-200">{runMetrics.duplicatesDetected}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/40 pb-1">
                  <span className="text-slate-400">Records Merged:</span>
                  <span className="font-mono text-slate-200">{runMetrics.recordsMerged}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/40 pb-1">
                  <span className="text-slate-400">Records Rejected:</span>
                  <span className="font-mono text-slate-200">{runMetrics.recordsRejected}</span>
                </div>
                <div
                  onClick={() => onNavigateToResultsWithFilter?.('CONFLICTED')}
                  className={`flex justify-between border-b border-slate-700/40 pb-1 ${onNavigateToResultsWithFilter ? 'cursor-pointer hover:text-sky-300' : ''}`}
                >
                  <span className="text-slate-400">Field Conflicts:</span>
                  <span className="font-mono text-amber-300">{runMetrics.conflictedCount}</span>
                </div>
                <div
                  onClick={() => onNavigateToResultsWithFilter?.('INCOMPLETE')}
                  className={`flex justify-between border-b border-slate-700/40 pb-1 ${onNavigateToResultsWithFilter ? 'cursor-pointer hover:text-sky-300' : ''}`}
                >
                  <span className="text-slate-400">Incomplete Records:</span>
                  <span className="font-mono text-slate-300">{runMetrics.incompleteCount}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/40 pb-1">
                  <span className="text-slate-400">Exportable Records:</span>
                  <span className="font-mono text-emerald-400">{runMetrics.exportableCount}</span>
                </div>
              </div>
            </div>

            {/* Restricted Data Aggregate Notice */}
            {restrictedAggregate.restrictedRecordCount > 0 && (
              <div className="p-2.5 bg-slate-950 border border-amber-500/40 rounded flex items-start gap-2">
                <span className="text-amber-400 text-sm">🔒</span>
                <div>
                  <div className="text-[11px] font-semibold text-amber-300">Data Firewall Invariant Active</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {restrictedAggregate.policyMessage}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION: COVERAGE */}
        {activeSection === 'COVERAGE' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded space-y-2.5">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold text-slate-200">Field Coverage Distribution</h3>
                <span className="text-[10px] text-slate-400">Denominator: {coverage.totalEligibleRecords} eligible records</span>
              </div>

              {[
                { label: 'Identity (Name & Entity)', pct: coverage.identityCoverage, count: coverage.rawCounts.identityCount, filter: undefined },
                { label: 'Website Present', pct: coverage.websiteCoverage, count: coverage.rawCounts.websiteCount, filter: 'MISSING_WEBSITE' as AnalyticsFilterTarget },
                { label: 'Email Address', pct: coverage.emailCoverage, count: coverage.rawCounts.emailCount, filter: 'MISSING_EMAIL' as AnalyticsFilterTarget },
                { label: 'Phone Number', pct: coverage.phoneCoverage, count: coverage.rawCounts.phoneCount, filter: 'MISSING_PHONE' as AnalyticsFilterTarget },
                { label: 'Public People', pct: coverage.peopleCoverage, count: coverage.rawCounts.peopleCount, filter: 'PUBLIC_PEOPLE' as AnalyticsFilterTarget },
                { label: 'Published Services', pct: coverage.servicesCoverage, count: coverage.rawCounts.servicesCount, filter: undefined },
                { label: 'Social Profiles', pct: coverage.socialCoverage, count: coverage.rawCounts.socialCount, filter: undefined },
                { label: 'Qualification Evaluated', pct: coverage.qualificationCoverage, count: coverage.rawCounts.qualificationCount, filter: undefined }
              ].map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300">{item.label}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400">{item.count} / {coverage.totalEligibleRecords}</span>
                      <span className={`font-semibold ${item.pct >= 75 ? 'text-emerald-400' : item.pct >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {item.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.pct >= 75 ? 'bg-emerald-500' : item.pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.max(0, item.pct))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: CONTACTS */}
        {activeSection === 'CONTACTS' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-200">Observed Contactability Breakdown</h3>
              <p className="text-[10px] text-slate-400">
                Categorization based strictly on actual observed channels. No predictive conversion scoring.
              </p>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2 bg-slate-900 border border-slate-700/60 rounded">
                  <div className="text-slate-400 text-[10px]">Email + Phone Available</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">{contactability.emailAndPhoneCount}</div>
                  <div className="text-[10px] text-slate-400">{contactability.fullContactabilityPercentage}% of total</div>
                </div>

                <div
                  onClick={() => onNavigateToResultsWithFilter?.('MISSING_PHONE')}
                  className="p-2 bg-slate-900 border border-slate-700/60 rounded cursor-pointer hover:border-slate-500"
                >
                  <div className="text-slate-400 text-[10px]">Email Only</div>
                  <div className="text-base font-bold text-sky-400 font-mono mt-0.5">{contactability.emailOnlyCount}</div>
                  <div className="text-[10px] text-slate-400">{contactability.totalEmailAvailableCount} total with email</div>
                </div>

                <div
                  onClick={() => onNavigateToResultsWithFilter?.('MISSING_EMAIL')}
                  className="p-2 bg-slate-900 border border-slate-700/60 rounded cursor-pointer hover:border-slate-500"
                >
                  <div className="text-slate-400 text-[10px]">Phone Only</div>
                  <div className="text-base font-bold text-amber-400 font-mono mt-0.5">{contactability.phoneOnlyCount}</div>
                  <div className="text-[10px] text-slate-400">{contactability.totalPhoneAvailableCount} total with phone</div>
                </div>

                <div className="p-2 bg-slate-900 border border-slate-700/60 rounded">
                  <div className="text-slate-400 text-[10px]">Contact Form Only</div>
                  <div className="text-base font-bold text-indigo-400 font-mono mt-0.5">{contactability.contactFormOnlyCount}</div>
                  <div className="text-[10px] text-slate-400">Website form detected</div>
                </div>

                <div
                  onClick={() => onNavigateToResultsWithFilter?.('PUBLIC_PEOPLE')}
                  className="p-2 bg-slate-900 border border-slate-700/60 rounded cursor-pointer hover:border-slate-500"
                >
                  <div className="text-slate-400 text-[10px]">Person Available Only</div>
                  <div className="text-base font-bold text-purple-400 font-mono mt-0.5">{contactability.personAvailableOnlyCount}</div>
                  <div className="text-[10px] text-slate-400">{contactability.totalPublicPersonAvailableCount} with named people</div>
                </div>

                <div className="p-2 bg-slate-900 border border-slate-700/60 rounded">
                  <div className="text-slate-400 text-[10px]">No Public Contact Signal</div>
                  <div className="text-base font-bold text-rose-400 font-mono mt-0.5">{contactability.noPublicContactSignalCount}</div>
                  <div className="text-[10px] text-slate-400">{contactability.noContactSignalPercentage}% missing contact</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: WEBSITE */}
        {activeSection === 'WEBSITE' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold text-slate-200">Website Intelligence (Phase 21 Limits)</h3>
                <span className="text-[10px] text-slate-400 font-mono">Max 5 pgs • 10s timeout</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                <div
                  onClick={() => onNavigateToResultsWithFilter?.('VERIFIED_WEBSITE')}
                  className="p-2 bg-slate-900 border border-slate-700/60 rounded cursor-pointer hover:border-emerald-500"
                >
                  <div className="text-slate-400 text-[10px]">Verified Business Site</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">{website.websiteVerifiedCount}</div>
                  <div className="text-[10px] text-slate-400">{website.verificationRate}% of present sites</div>
                </div>

                <div className="p-2 bg-slate-900 border border-slate-700/60 rounded">
                  <div className="text-slate-400 text-[10px]">Website Present</div>
                  <div className="text-base font-bold text-slate-200 font-mono mt-0.5">{website.websitePresentCount}</div>
                  <div className="text-[10px] text-slate-400">{website.pagesSuccessfullyInspected} pages inspected</div>
                </div>

                <div className="p-2 bg-slate-900 border border-slate-700/60 rounded">
                  <div className="text-slate-400 text-[10px]">Site Unavailable / Timeout</div>
                  <div className="text-base font-bold text-amber-400 font-mono mt-0.5">{website.websiteUnavailableCount}</div>
                  <div className="text-[10px] text-slate-400">{website.websiteTimeoutCount} timed out</div>
                </div>

                <div className="p-2 bg-slate-900 border border-slate-700/60 rounded">
                  <div className="text-slate-400 text-[10px]">Blocked by Safety Policy</div>
                  <div className="text-base font-bold text-rose-400 font-mono mt-0.5">{website.websiteBlockedBySafetyCount}</div>
                  <div className="text-[10px] text-slate-400">SSRF / origin protection</div>
                </div>

                <div className="p-2 bg-slate-900 border border-slate-700/60 rounded">
                  <div className="text-slate-400 text-[10px]">Tech Signals Discovered</div>
                  <div className="text-base font-bold text-sky-400 font-mono mt-0.5">{website.technologySignalsDiscovered}</div>
                  <div className="text-[10px] text-slate-400">CMS, Analytics, Chat</div>
                </div>

                <div className="p-2 bg-slate-900 border border-slate-700/60 rounded">
                  <div className="text-slate-400 text-[10px]">Non-Business / Parked</div>
                  <div className="text-base font-bold text-slate-400 font-mono mt-0.5">{website.websiteNonBusinessCount + website.websiteParkedCount}</div>
                  <div className="text-[10px] text-slate-400">Filtered generic domains</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: QUALIFICATION */}
        {activeSection === 'QUALIFICATION' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-200">Qualification Decision Rationale</h3>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded text-center">
                  <div className="text-[10px] text-emerald-400">QUALIFIED</div>
                  <div className="text-base font-bold text-emerald-300 font-mono">{qualification.qualifiedCount}</div>
                </div>
                <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded text-center">
                  <div className="text-[10px] text-amber-400">UNCERTAIN</div>
                  <div className="text-base font-bold text-amber-300 font-mono">{qualification.uncertainCount}</div>
                </div>
                <div className="p-2 bg-rose-950/40 border border-rose-500/30 rounded text-center">
                  <div className="text-[10px] text-rose-400">NOT QUALIFIED / BLOCKED</div>
                  <div className="text-base font-bold text-rose-300 font-mono">{qualification.notQualifiedCount + qualification.blockedCount}</div>
                </div>
              </div>

              {/* Observed Reasons Table */}
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-300">Observed Reason Codes</div>
                {qualification.reasonBreakdown.length === 0 ? (
                  <div className="text-[10px] text-slate-400 py-1">No detailed reason codes recorded.</div>
                ) : (
                  <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                    {qualification.reasonBreakdown.map(r => (
                      <div key={r.code} className="p-1.5 bg-slate-900 border border-slate-800 rounded flex items-center justify-between gap-2 text-[11px]">
                        <div className="min-w-0">
                          <div className="font-mono text-slate-200 truncate">{r.code}</div>
                          <div className="text-[10px] text-slate-400 truncate">{r.description}</div>
                        </div>
                        <span className="font-mono font-bold text-sky-400 bg-slate-800 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                          {r.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: WARNINGS */}
        {activeSection === 'WARNINGS' && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-200">Quality Warnings ({warnings.length})</h3>
            {warnings.length === 0 ? (
              <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded text-center text-slate-400">
                <span className="text-emerald-400 text-lg">✓</span>
                <div className="text-xs font-semibold text-slate-200 mt-1">Zero Quality Warnings</div>
                <div className="text-[10px] text-slate-400 mt-0.5">All observed data quality metrics satisfied defined thresholds.</div>
              </div>
            ) : (
              warnings.map(w => (
                <div
                  key={w.id}
                  className={`p-3 rounded border text-xs space-y-1 ${
                    w.severity === 'HIGH'
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                      : w.severity === 'MEDIUM'
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                      <span>{w.severity === 'HIGH' ? '⚠️' : 'ℹ️'}</span> {w.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {w.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{w.message}</p>
                  <div className="text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-800/60">
                    <strong className="text-slate-300">Action:</strong> {w.actionableRemedy}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SECTION: COMPARISON */}
        {activeSection === 'COMPARISON' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded space-y-2">
              <h3 className="text-xs font-semibold text-slate-200">Run Comparison Studio</h3>
              <p className="text-[10px] text-slate-400">
                Select another completed run to evaluate variances, deduplication shifts, and entity modifications.
              </p>

              {historySnapshots.length < 2 ? (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded text-slate-400 text-center">
                  At least two completed runs are required for comparative analysis.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Compare with:</span>
                    <select
                      value={compareRunId}
                      onChange={e => setCompareRunId(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="">Select a run to compare...</option>
                      {historySnapshots
                        .filter(s => s.runId !== currentSnapshot.runId)
                        .map(s => (
                          <option key={s.runId} value={s.runId}>
                            {s.runTitle || s.runId} ({s.totalRecords} leads)
                          </option>
                        ))}
                    </select>
                  </div>

                  {comparisonResult && (
                    <div className="space-y-3 mt-3">
                      {/* Descriptive Summary */}
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded space-y-1">
                        <div className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">Descriptive Summary</div>
                        {comparisonResult.descriptiveSummary.map((line, idx) => (
                          <div key={idx} className="text-[11px] text-slate-300">• {line}</div>
                        ))}
                      </div>

                      {/* Metrics Variance Table */}
                      <div className="border border-slate-800 rounded overflow-hidden">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-slate-950 text-slate-400 uppercase text-[9px]">
                            <tr>
                              <th className="p-2">Metric</th>
                              <th className="p-2 text-right">Base Run</th>
                              <th className="p-2 text-right">Compare Run</th>
                              <th className="p-2 text-right">Delta</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono">
                            {comparisonResult.metricsDiff.map(d => (
                              <tr key={d.metricName} className="hover:bg-slate-800/40">
                                <td className="p-2 font-sans text-slate-300">{d.metricName}</td>
                                <td className="p-2 text-right text-slate-400">{d.baseValue}</td>
                                <td className="p-2 text-right text-slate-200">{d.compareValue}</td>
                                <td className={`p-2 text-right font-bold ${d.delta > 0 ? 'text-emerald-400' : d.delta < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                                  {d.delta > 0 ? `+${d.delta}` : d.delta}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Entity Change Ledger */}
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded space-y-1">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Entity Change Summary</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
                          <div>New: <span className="text-emerald-400 font-bold">{comparisonResult.changeAnalysis.newRecordsCount}</span></div>
                          <div>Removed: <span className="text-rose-400 font-bold">{comparisonResult.changeAnalysis.removedRecordsCount}</span></div>
                          <div>Modified: <span className="text-amber-400 font-bold">{comparisonResult.changeAnalysis.changedRecordsCount}</span></div>
                          <div>Unchanged: <span className="text-slate-400 font-bold">{comparisonResult.changeAnalysis.unchangedRecordsCount}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
