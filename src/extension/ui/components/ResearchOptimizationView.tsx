/**
 * LeadNoria — Phase 31: Research Optimization & Saturation Intelligence
 * Research Optimization UI Component
 *
 * Invariants:
 * - 100% observational: zero predictive scoring, zero conversion claims.
 * - Explains all saturation assessments and recommendations with underlying evidence.
 * - Provides actionable navigation ("View Matching Records", "Prefill Config") without auto-running queries.
 * - Accessible: ARIA landmarks, semantic tabs, visible focus, responsive down to 360px without nested scroll traps.
 */

import React, { useState, useMemo } from 'react';
import {
  ResearchOptimizationSnapshot,
  SearchUnitPerformance,
  ResearchRecommendation,
  OptimizationWarning,
  SaturationState
} from '../../optimization/types.ts';

export interface ResearchOptimizationViewProps {
  snapshot: ResearchOptimizationSnapshot | null;
  onSelectSearchUnit?: (unitId: string) => void;
  onFilterResults?: (filter: { field: string; value: string }) => void;
  onNavigateToResultsWithFilter?: (filter: { field: string; value: string }) => void;
  onPrefillResearchConfig?: (config: { area?: string; category?: string; query?: string }) => void;
}

export function getSaturationBadgeColor(state: SaturationState): string {
  if (state === 'HIGHLY_SATURATED') return '#dc2626';
  if (state === 'ACTIVE') return '#16a34a';
  return '#d97706';
}

export const ResearchOptimizationView: React.FC<ResearchOptimizationViewProps> = ({
  snapshot,
  onSelectSearchUnit,
  onFilterResults,
  onNavigateToResultsWithFilter,
  onPrefillResearchConfig
}) => {
  const [activeTab, setActiveTab] = useState<'RECOMMENDATIONS' | 'PERFORMANCE' | 'SATURATION' | 'YIELD_PRESSURE' | 'COMPARISON'>('RECOMMENDATIONS');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [compareUnitA, setCompareUnitA] = useState<string>('');
  const [compareUnitB, setCompareUnitB] = useState<string>('');

  const handleFilterClick = (filter: { field: string; value: string }) => {
    if (onFilterResults) onFilterResults(filter);
    if (onNavigateToResultsWithFilter) onNavigateToResultsWithFilter(filter);
  };

  const selectedUnit = useMemo(() => {
    if (!snapshot || !selectedUnitId) return snapshot?.searchUnitPerformances[0] || null;
    return snapshot.searchUnitPerformances.find(p => p.searchUnitId === selectedUnitId) || null;
  }, [snapshot, selectedUnitId]);

  if (!snapshot || snapshot.searchUnitPerformances.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 min-h-[300px]" role="region" aria-label="Research Optimization and Saturation Intelligence">
        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 mb-3 text-xl">
          🧭
        </div>
        <h2 className="text-base font-semibold text-slate-200">No Research Optimization Data</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          No search units have been recorded yet. Execute research runs across search units to analyze coverage saturation, marginal yield, duplicate pressure, and next-research opportunities.
        </p>
      </div>
    );
  }

  const { searchUnitPerformances, recommendations, warnings, geographicBreakdown, overallCoverage } = snapshot;

  const getSaturationBadge = (state: SaturationState) => {
    const color = getSaturationBadgeColor(state);
    return (
      <span
        className="px-1.5 py-0.5 rounded text-[10px] font-semibold border"
        style={{ color, borderColor: `${color}80`, backgroundColor: `${color}15` }}
        aria-label={`Observed saturation: ${state}`}
      >
        {state}
      </span>
    );
  };

  const getDuplicateBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-700">CRITICAL DUPES</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-950/80 text-orange-400 border border-orange-800">HIGH DUPES</span>;
      case 'MODERATE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800">MODERATE DUPES</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">LOW DUPES</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto bg-slate-900 text-slate-100 text-xs" role="region" aria-label="Research Optimization and Saturation Intelligence">
      {/* Header Info Banner */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <span>🧭</span> Research Optimization & Saturation Intelligence
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Evidence-based research guidance, marginal yield, duplicate pressure, and saturation accounting.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Search Units: <strong className="text-slate-200">{snapshot.totalSearchUnitsAnalyzed}</strong></span>
          <span>Runs: <strong className="text-slate-200">{snapshot.totalRunsAnalyzed}</strong></span>
          <span>Leads: <strong className="text-slate-200">{snapshot.totalCanonicalLeadsObserved} leads</strong></span>
        </div>
      </div>

      {/* Coverage Overview Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-slate-950/80 border-b border-slate-800 text-center">
        <div className="p-2 rounded bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase text-slate-400">Observed Records</span>
          <p className="text-base font-bold text-slate-100 mt-0.5">{overallCoverage?.totalObservedRecords ?? snapshot.totalCanonicalLeadsObserved} leads</p>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase text-slate-400">Unique Entities</span>
          <p className="text-base font-bold text-emerald-400 mt-0.5">{overallCoverage?.uniqueCanonicalEntities ?? snapshot.totalCanonicalLeadsObserved} entities</p>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase text-slate-400">Duplicate Candidate Ratio</span>
          <p className="text-base font-bold text-amber-400 mt-0.5">
            {overallCoverage?.totalObservedRecords
              ? Math.round(((overallCoverage.duplicateCandidateCount || 0) / overallCoverage.totalObservedRecords) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-3 overflow-x-auto shrink-0" role="tablist" aria-label="Optimization Views">
        <button
          role="tab"
          aria-selected={activeTab === 'RECOMMENDATIONS'}
          onClick={() => setActiveTab('RECOMMENDATIONS')}
          className={`py-2 px-3 border-b-2 text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'RECOMMENDATIONS'
              ? 'border-amber-400 text-amber-300 font-semibold bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🎯</span> Recommendations ({recommendations.length})
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'PERFORMANCE'}
          onClick={() => setActiveTab('PERFORMANCE')}
          className={`py-2 px-3 border-b-2 text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'PERFORMANCE'
              ? 'border-amber-400 text-amber-300 font-semibold bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📊</span> Search Unit Performance
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'SATURATION'}
          onClick={() => setActiveTab('SATURATION')}
          className={`py-2 px-3 border-b-2 text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'SATURATION'
              ? 'border-amber-400 text-amber-300 font-semibold bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🌐</span> Saturation & Coverage
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'YIELD_PRESSURE'}
          onClick={() => setActiveTab('YIELD_PRESSURE')}
          className={`py-2 px-3 border-b-2 text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'YIELD_PRESSURE'
              ? 'border-amber-400 text-amber-300 font-semibold bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>⚡</span> Marginal Yield & Duplicates
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'COMPARISON'}
          onClick={() => setActiveTab('COMPARISON')}
          className={`py-2 px-3 border-b-2 text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'COMPARISON'
              ? 'border-amber-400 text-amber-300 font-semibold bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>⚖️</span> Unit Comparison
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-3 space-y-4">
        {/* TAB 1: RECOMMENDATIONS */}
        {activeTab === 'RECOMMENDATIONS' && (
          <div className="space-y-3" role="tabpanel" aria-label="Next Research Recommendations">
            {warnings.length === 0 ? (
              <div className="p-2 text-center text-slate-500 text-[10px]" role="status">
                No optimization warnings detected
              </div>
            ) : (
              <div className="space-y-2">
                {warnings.map(w => (
                  <div key={w.id} role="alert" className="p-2.5 rounded border border-rose-800/60 bg-rose-950/30 flex items-start gap-2.5">
                    <span className="text-base">⚠️</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <strong className="text-rose-200 text-xs font-semibold">{w.title}</strong>
                        <span className="text-[10px] px-1.5 py-0.2 bg-rose-900/60 text-rose-300 rounded uppercase font-semibold">{w.severity}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">{w.message}</p>
                      <p className="text-[10px] text-rose-300/80 mt-1 font-mono">Action: {w.remedy}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2.5">
              {recommendations.length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-950/40 rounded border border-slate-800">
                  Zero critical bottlenecks detected. Research coverage is balanced.
                </div>
              ) : (
                recommendations.map(rec => (
                  <div key={rec.recommendationId} className="p-3 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-amber-300">{rec.headline}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                            Confidence: {rec.sampleSufficiency}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">{rec.evidenceBasis}</p>
                        
                        {rec.observedEvidence && rec.observedEvidence.length > 0 && (
                          <div className="mt-2 text-[10px] text-slate-400">
                            <span className="font-semibold text-slate-300">Observed Evidence:</span>
                            <ul>
                              {rec.observedEvidence.map((e, i) => (
                                <li key={i} className="list-disc ml-4 mt-0.5">{e}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-2 text-[10px] text-slate-400">
                          <span>Threshold: {rec.thresholds?.threshold ?? rec.thresholds?.duplicateRatioThreshold ?? 0}%</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {rec.actionableNextQuery && onPrefillResearchConfig && (
                          <button
                            id={`prefill-btn-${rec.recommendationId}`}
                            type="button"
                            onClick={() => onPrefillResearchConfig({
                              area: rec.actionableNextQuery?.geographicArea,
                              category: rec.actionableNextQuery?.category,
                              query: rec.actionableNextQuery?.queryVariant
                            })}
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-semibold transition-colors"
                            aria-label="Prefill Config"
                          >
                            Prefill Config
                          </button>
                        )}
                        <button
                          id={`filter-btn-${rec.recommendationId}`}
                          type="button"
                          onClick={() => handleFilterClick({ field: 'searchUnitId', value: rec.sourceSearchUnitId || rec.targetSearchUnitId })}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
                          aria-label="View matching records"
                        >
                          View Matching Records
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SEARCH UNIT PERFORMANCE */}
        {activeTab === 'PERFORMANCE' && (
          <div className="space-y-3" role="tabpanel" aria-label="Search Unit Performance Matrix">
            <div className="overflow-x-auto rounded border border-slate-800 bg-slate-950">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                    <th scope="col" className="p-2 font-medium">Area / Search Unit</th>
                    <th scope="col" className="p-2 font-medium">Attempts</th>
                    <th scope="col" className="p-2 font-medium">Unique / Raw</th>
                    <th scope="col" className="p-2 font-medium">Marginal Yield</th>
                    <th scope="col" className="p-2 font-medium">Dup Ratio</th>
                    <th scope="col" className="p-2 font-medium">Web Cov</th>
                    <th scope="col" className="p-2 font-medium">Contact Cov</th>
                    <th scope="col" className="p-2 font-medium">Saturation</th>
                  </tr>
                </thead>
                <tbody>
                  {searchUnitPerformances.map(p => (
                    <tr
                      key={p.searchUnitId}
                      onClick={() => {
                        setSelectedUnitId(p.searchUnitId);
                        if (onSelectSearchUnit) onSelectSearchUnit(p.searchUnitId);
                      }}
                      className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        selectedUnit?.searchUnitId === p.searchUnitId ? 'bg-slate-800/60 font-semibold' : ''
                      }`}
                    >
                      <td className="p-2 text-slate-200 font-medium">{p.areaName}</td>
                      <td className="p-2 text-slate-300">{p.attempts}</td>
                      <td className="p-2 text-slate-300">{p.uniqueEntitiesCount || p.uniqueCanonicalEntities} / {p.rawCandidatesCount || p.rawCandidateCount}</td>
                      <td className="p-2 text-amber-300 font-mono">
                        {typeof p.marginalYield === 'number' ? p.marginalYield : p.marginalYieldResult?.marginalEntityYield}
                      </td>
                      <td className="p-2">{getDuplicateBadge(p.duplicatePressure.level)}</td>
                      <td className="p-2 text-slate-300">{p.websiteCoverage}%</td>
                      <td className="p-2 text-slate-300">{p.contactCoverage}%</td>
                      <td className="p-2">{getSaturationBadge(p.saturationAssessment?.state || p.saturation?.state || 'INSUFFICIENT_DATA')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected Unit Evidence Detail */}
            {selectedUnit && (
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span>🔍</span> Evidence Profile: {selectedUnit.areaName} ({selectedUnit.category})
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {selectedUnit.searchUnitId}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Marginal Entity Yield</span>
                    <p className="text-sm font-bold text-amber-400 mt-0.5">{selectedUnit.marginalYieldResult.marginalEntityYield} / attempt</p>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Website Coverage</span>
                    <p className="text-sm font-bold text-sky-400 mt-0.5">{selectedUnit.websiteCoverage}%</p>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Direct Contactability</span>
                    <p className="text-sm font-bold text-emerald-400 mt-0.5">{selectedUnit.contactCoverage}%</p>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Contradiction Conflict Rate</span>
                    <p className="text-sm font-bold text-rose-400 mt-0.5">{selectedUnit.conflictRate}%</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 italic pt-1">
                  "{selectedUnit.saturationAssessment.evidenceStatement}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SATURATION & COVERAGE */}
        {activeTab === 'SATURATION' && (
          <div className="space-y-3" role="tabpanel" aria-label="Saturation and Geographic Coverage">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {geographicBreakdown.map(geo => (
                <div key={geo.areaId} className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-bold text-slate-200">{geo.areaName}</strong>
                      <span className="text-[10px] text-slate-500 ml-1.5 font-mono uppercase">({geo.level})</span>
                    </div>
                    {getSaturationBadge(geo.saturationState)}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Unique Discovered Entities:</span>
                    <strong className="text-slate-200">{geo.uniqueEntitiesCount}</strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Observed Domain Coverage:</span>
                    <strong className="text-slate-200">{geo.observedCoveragePercent}%</strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Average Marginal Yield:</span>
                    <strong className="text-amber-400">{geo.marginalYield} / run</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Compliance Boundary Notice */}
            {snapshot.restrictedRecordsAggregate.restrictedCount > 0 && (
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
                🔒 {snapshot.restrictedRecordsAggregate.complianceNote}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MARGINAL YIELD & DUPLICATE PRESSURE */}
        {activeTab === 'YIELD_PRESSURE' && (
          <div className="space-y-3" role="tabpanel" aria-label="Marginal Yield and Duplicate Pressure">
            <h3 className="text-sm font-bold text-slate-200">Marginal Yield & Discovery</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {searchUnitPerformances.map(p => (
                <div key={p.searchUnitId} className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                    <strong className="text-xs font-semibold text-slate-200">{p.areaName} ({p.category})</strong>
                    {getDuplicateBadge(p.duplicatePressure.level)}
                  </div>

                  <h3 className="text-xs font-semibold text-slate-300">Duplicate Candidate Pressure</h3>
                  {p.duplicatePressure.level === 'HIGH' && (
                    <div className="text-rose-400 text-xs font-bold">HIGH DUPLICATE PRESSURE</div>
                  )}

                  <p className="text-[11px] text-slate-300">{p.duplicatePressure.explanation}</p>

                  <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-slate-400">
                    <div>
                      <span>New Entities:</span> <strong className="text-slate-200">{p.newEntitiesCount}</strong>
                    </div>
                    <div>
                      <span>New Websites</span>: <strong className="text-slate-200">{p.marginalYieldResult.newWebsitesDiscovered ?? 0}</strong>
                    </div>
                    <div>
                      <span>Marginal Yield:</span> <strong className="text-amber-400">{p.marginalYieldResult.marginalEntityYield}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: UNIT COMPARISON */}
        {activeTab === 'COMPARISON' && (
          <div className="space-y-3" role="tabpanel" aria-label="Unit Comparison for Planning">
            <div className="p-3 rounded bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] uppercase text-slate-400 block mb-1">Target Unit A</label>
                <select
                  value={compareUnitA}
                  onChange={e => setCompareUnitA(e.target.value)}
                  className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                >
                  <option value="">Select Search Unit A</option>
                  {searchUnitPerformances.map(p => (
                    <option key={p.searchUnitId} value={p.searchUnitId}>
                      {p.areaName} — {p.category} ({p.queryVariant})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] uppercase text-slate-400 block mb-1">Baseline Unit B</label>
                <select
                  value={compareUnitB}
                  onChange={e => setCompareUnitB(e.target.value)}
                  className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                >
                  <option value="">Select Search Unit B</option>
                  {searchUnitPerformances.map(p => (
                    <option key={p.searchUnitId} value={p.searchUnitId}>
                      {p.areaName} — {p.category} ({p.queryVariant})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {compareUnitA && compareUnitB && (
              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                <p>Comparison between selected research units active.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
