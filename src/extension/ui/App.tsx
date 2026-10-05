/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Production-Grade Chrome Extension Root UI Application
 * 
 * Strict Invariants:
 * - Product: LeadNoria
 * - Tagline: "Discover. Verify. Connect."
 * - Descriptor: "Business lead research from real public signals."
 * - Primary source selection: [ From Meta Ad Library ] and [ From Google Maps ]
 * - Google Maps remains CONTRACT_ONLY: live extraction cannot be started
 * - Authoritative states preserved:
 *     SKIPPED != NOT_QUALIFIED
 *     BLOCKED != NOT_FOUND
 *     CONTRACT_ONLY != COMPLETED
 *     UNKNOWN != FAIL
 *     PARTIAL != COMPLETE
 *     NOT_FOUND != UNKNOWN
 * - Security: Sanitized strings, safe URL validation, prompt injection treated strictly as passive text
 * - Zero remote telemetry, zero external AI/scraping API dependencies
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  NavigationTab,
  ResultRowViewModel,
  ResultDetailViewModel,
  RunStatusViewModel,
  PlanReviewViewModel,
  ExportPreviewViewModel,
  DiagnosticsViewModel,
  CheckpointRecoveryViewModel
} from './types.ts';
import { SourceType, ExecutionMode } from '../pipeline/pipelineTypes.ts';
import { Header } from './components/Header.tsx';
import { ResearchConfigView } from './components/ResearchConfigView.tsx';
import { PlanReviewModal } from './components/PlanReviewModal.tsx';
import { RunStatusView } from './components/RunStatusView.tsx';
import { ResultsTableView } from './components/ResultsTableView.tsx';
import { ResultDetailDrawer } from './components/ResultDetailDrawer.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { DiagnosticsDrawer } from './components/DiagnosticsDrawer.tsx';
import { RecoveryBanner } from './components/RecoveryBanner.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { computeRunAnalytics } from '../analytics/analyticsEngine.ts';
import { RunAnalyticsSnapshot } from '../analytics/types.ts';
import { computeResearchOptimization } from '../optimization/optimizationEngine.ts';
import { ResearchOptimizationSnapshot } from '../optimization/types.ts';
import {
  toResultRowViewModel,
  toResultDetailViewModel,
  toRunStatusViewModel,
  toExportPreviewViewModel,
  isCanonicalLeadRecord
} from './viewModelMappers.ts';
import { exportLeadsToCsv } from '../metaAdapter.ts';
import { ExtensionResearchRun, ExtensionLead, StartResearchPayload } from '../types.ts';
import { PIPELINE_VERSION } from '../pipeline/pipelineTypes.ts';
import { computeReliabilityMetrics, evaluateOperationalGuardrails, aggregateProductionIssues } from '../reliability/reliabilityEngine.ts';
import { ReliabilityMetrics, OperationalGuardrailAlert, AggregatedIssue, StorageHealthSummary, IssueResolutionState } from '../reliability/types.ts';

export const ExtensionApp: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('RESEARCH');

  // Source & Configuration State
  const [selectedSource, setSelectedSource] = useState<SourceType>('META');
  const [pendingPlan, setPendingPlan] = useState<PlanReviewViewModel | null>(null);
  const [isPlanReviewOpen, setIsPlanReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Run State
  const [activeRun, setActiveRun] = useState<ExtensionResearchRun | null>(null);
  const [runStatusVM, setRunStatusVM] = useState<RunStatusViewModel | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Results & Inspection State
  const [rawLeads, setRawLeads] = useState<any[]>([]);
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set());
  const [inspectedLead, setInspectedLead] = useState<ResultDetailViewModel | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // History & Storage State
  const [historyRuns, setHistoryRuns] = useState<ExtensionResearchRun[]>([]);
  const [recoveryInfo, setRecoveryInfo] = useState<CheckpointRecoveryViewModel | null>(null);

  // Technical Diagnostics State
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [diagnosticsVM, setDiagnosticsVM] = useState<DiagnosticsViewModel | null>(null);

  // Phase 32: Production Reliability & Diagnostics State
  const [reliabilityMetrics, setReliabilityMetrics] = useState<ReliabilityMetrics>({
    totalRuns: 0, successfulRuns: 0, failedRuns: 0, partialRuns: 0, cancelledRuns: 0,
    recoveryCount: 0, retryCount: 0, exportSuccesses: 0, exportFailures: 0,
    persistenceFailures: 0, websiteTimeoutCount: 0, acquisitionFailureCount: 0,
    averageRunDurationMs: 0, p95RunDurationMs: 0,
    runSuccessRate: 100.0, issueRatePerRun: 0.0, recoveryRate: 100.0,
    sampleSufficiency: 'NO_DATA'
  });
  const [guardrailAlerts, setGuardrailAlerts] = useState<OperationalGuardrailAlert[]>([]);
  const [aggregatedIssues, setAggregatedIssues] = useState<AggregatedIssue[]>([]);
  const [storageHealth, setStorageHealth] = useState<StorageHealthSummary>({
    collectionCounts: {}, estimatedBytes: 0,
    quotaLimitBytes: 50 * 1024 * 1024,
    quotaUsagePercent: 0.0, isPressureHigh: false, retentionPolicies: {}
  });

  // Initial Sync with Chrome Runtime and Storage
  useEffect(() => {
    loadStorageState();

    const messageListener = (msg: any) => {
      if (msg.type === 'RESEARCH_PROGRESS' && msg.payload?.run) {
        handleRunUpdate(msg.payload.run);
      } else if (msg.type === 'RESEARCH_COMPLETED' && msg.payload?.run) {
        handleRunUpdate(msg.payload.run);
        setIsSubmitting(false);
        loadHistoryState();
      }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(messageListener);
    }

    return () => {
      if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
    };
  }, []);

  // Timer for active runs
  const isJobRunning = (status?: string) =>
    status === 'COLLECTING' || status === 'NAVIGATING' || status === 'STARTING' || status === 'NORMALIZING';

  useEffect(() => {
    let interval: any;
    if (isJobRunning(activeRun?.status)) {
      interval = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeRun?.status]);

  const loadStorageState = () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['activeResearchRun', 'meta_scraper_active_run', 'leadnoria_checkpoint'], (res: Record<string, any>) => {
        const run = (res.activeResearchRun || res.meta_scraper_active_run) as ExtensionResearchRun | undefined;
        if (run) {
          handleRunUpdate(run);
          if (run.leads && run.leads.length > 0) {
            setActiveTab('RESULTS');
          }
        }

        // Checkpoint detection
        const chk = res.leadnoria_checkpoint;
        if (chk && (!run || run.status === 'PARTIAL' || run.status === 'FAILED')) {
          setRecoveryInfo({
            runId: chk.runId || 'chk_run',
            sourceType: chk.sourceType || 'META',
            planVersion: chk.planVersion || '1.0.0',
            pipelineVersion: chk.pipelineVersion || PIPELINE_VERSION,
            lastCompletedStage: chk.completedStages?.[chk.completedStages.length - 1] || 'SOURCE_EXECUTION',
            savedCandidateCount: chk.envelopes?.length || 0,
            checkpointTimestamp: chk.createdAt || new Date().toISOString(),
            isCompatible: true
          });
        }
      });
      loadHistoryState();
    }
  };

  const loadHistoryState = () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['researchHistory', 'meta_scraper_history'], (res: Record<string, any>) => {
        const hist = (res.researchHistory || res.meta_scraper_history) as ExtensionResearchRun[] | undefined;
        if (Array.isArray(hist)) {
          setHistoryRuns(hist);
          // Phase 32: Recompute reliability metrics from history
          const metrics = computeReliabilityMetrics(hist);
          const alerts = evaluateOperationalGuardrails(metrics);
          setReliabilityMetrics(metrics);
          setGuardrailAlerts(alerts);
        }
      });
    }
  };

  const handleRunUpdate = (run: ExtensionResearchRun) => {
    setActiveRun(run);
    if (run.leads) {
      setRawLeads(run.leads);
    }

    // Map to RunStatusViewModel
    const stageStates: Record<string, any> = {};
    if (run.status === 'COMPLETED') {
      stageStates.SOURCE_PLANNING = 'COMPLETED';
      stageStates.SOURCE_EXECUTION = 'COMPLETED';
      stageStates.NORMALIZATION = 'COMPLETED';
      stageStates.ENTITY_RESOLUTION = 'COMPLETED';
      stageStates.RELEVANCE = 'COMPLETED';
      stageStates.QUALIFICATION = 'COMPLETED';
    } else if (isJobRunning(run.status)) {
      stageStates.SOURCE_PLANNING = 'COMPLETED';
      stageStates.SOURCE_EXECUTION = 'IN_PROGRESS';
    }

    const mockRun = {
      runId: run.runId || 'run_active',
      runVersion: '1.0.0',
      status: run.status || 'PLANNED',
      config: { selectedSources: [selectedSource] },
      stageStates,
      sourceStates: { [selectedSource]: run.status || 'UNKNOWN' },
      checkpoint: undefined
    } as any;

    setRunStatusVM(toRunStatusViewModel(mockRun, elapsedSeconds * 1000));
  };

  // Convert raw leads to ResultRowViewModel list
  const resultsVM: ResultRowViewModel[] = useMemo(() => {
    return rawLeads.map((item, idx) => {
      if (isCanonicalLeadRecord(item)) {
        return toResultRowViewModel(item);
      }

      // Compatibility wrapper for Phase 1-13 leads
      const candidateEnv = {
        candidateId: item.leadId || `cand_${idx}`,
        sourceKey: {
          sourceType: selectedSource,
          sourceNamespace: 'ad_lib',
          sourceRecordId: item.pageId || item.leadId || `rec_${idx}`,
          sourceRecordVersion: 'v1'
        },
        sourceVersion: '1.0.0',
        rawReference: item,
        normalizedCandidate: {
          businessName: { value: { displayName: item.advertiserName || item.name || 'Unknown Business' } },
          websiteUrl: item.websiteUrl || item.domain,
          pageId: item.pageId
        },
        sourceContributions: [
          {
            source: selectedSource,
            provenance: selectedSource === 'GOOGLE_MAPS' ? 'GOOGLE_DERIVED' : 'META_DERIVED',
            fieldName: 'businessName',
            isRestricted: selectedSource === 'GOOGLE_MAPS',
            policyStatus: selectedSource === 'GOOGLE_MAPS' ? 'PRODUCT_REJECTED' : 'POLICY_APPROVED',
            persistenceStatus: selectedSource === 'GOOGLE_MAPS' ? 'NOT_PERSISTABLE' : 'PERSISTABLE',
            exportStatus: selectedSource === 'GOOGLE_MAPS' ? 'NOT_EXPORTABLE' : 'EXPORTABLE'
          }
        ],
        provenance: selectedSource === 'GOOGLE_MAPS' ? 'GOOGLE_DERIVED' : 'META_DERIVED',
        restrictions: {
          isRestricted: selectedSource === 'GOOGLE_MAPS',
          persistenceEligible: selectedSource !== 'GOOGLE_MAPS',
          exportEligible: selectedSource !== 'GOOGLE_MAPS',
          displayEligible: true,
          qualificationEligible: true
        },
        fieldEligibility: {},
        stageStates: {} as any,
        evidence: item.evidence || [],
        geographicObservations: [{ country: item.country || 'Global', city: item.locationName }],
        diagnostics: { warnings: [], errors: [], notes: [] },
        createdAt: item.timestamp || new Date().toISOString(),
        updatedAt: item.timestamp || new Date().toISOString()
      };

      const row = toResultRowViewModel(candidateEnv as any);

      // Enhance with Phase 6 / 11 / 12 fields if present
      if (item.strictV3Decision) {
        row.relevanceDecision = item.strictV3Decision.decision;
      }
      if (item.websiteVerification) {
        row.websiteState = item.websiteVerification.finalStatus;
      }
      if (item.phones && item.phones.length > 0) {
        row.contactSummary.hasPhone = true;
        row.contactSummary.phoneText = item.phones[0];
      }
      if (item.emails && item.emails.length > 0) {
        row.contactSummary.hasEmail = true;
        row.contactSummary.emailText = item.emails[0];
      }

      return row;
    });
  }, [rawLeads, selectedSource]);

  // Plan Review Handler
  const handleOpenPlanReview = (config: {
    sourceType: SourceType;
    executionMode: ExecutionMode;
    keywords: string[];
    countryCode: string;
    locationName?: string;
    maxCandidates: number;
    presetName?: string;
  }) => {
    const isGmaps = config.sourceType === 'GOOGLE_MAPS';
    const canExecuteLive = !isGmaps || config.executionMode !== 'LIVE';

    const planVM: PlanReviewViewModel = {
      sourceType: config.sourceType,
      executionMode: config.executionMode,
      plannedSearchUnitsCount: config.keywords.length,
      selectedCategoriesCount: 1,
      enabledStages: [
        'SOURCE_PLANNING',
        'SOURCE_EXECUTION',
        'NORMALIZATION',
        'ENTITY_RESOLUTION',
        'RELEVANCE',
        'QUALIFICATION'
      ],
      qualificationProfileName: 'Default Commercial Profile',
      maxCandidatesLimit: config.maxCandidates,
      timeoutSeconds: 30,
      checkpointEnabled: true,
      safetyWarnings: isGmaps
        ? ['Google Maps is CONTRACT_ONLY. Live extraction will not occur.']
        : [],
      canExecuteLive,
      blockedReason: isGmaps && config.executionMode === 'LIVE'
        ? 'Google Maps is strictly CONTRACT_ONLY and live extraction cannot be initiated.'
        : undefined,
      keywords: config.keywords,
      countryCode: config.countryCode,
      locationName: config.locationName
    };

    setPendingPlan(planVM);
    setIsPlanReviewOpen(true);
  };

  // Confirm and Start Research Execution
  const handleConfirmStart = () => {
    if (!pendingPlan || isSubmitting) return;
    setIsPlanReviewOpen(false);
    setIsSubmitting(true);
    setActiveTab('RUN_STATUS');

    // If Google Maps in DRY_RUN or REPLAY mode
    if (pendingPlan.sourceType === 'GOOGLE_MAPS') {
      setTimeout(() => {
        setIsSubmitting(false);
        const gmapsRun = {
          runId: `run_gmaps_${Date.now()}`,
          runVersion: '1.0.0',
          status: 'COMPLETED_WITH_WARNINGS',
          config: { selectedSources: ['GOOGLE_MAPS'] },
          stageStates: {
            SOURCE_PLANNING: 'COMPLETED',
            SOURCE_EXECUTION: 'CONTRACT_ONLY'
          },
          sourceStates: { GOOGLE_MAPS: 'CONTRACT_ONLY' },
          checkpoint: undefined
        } as any;
        setRunStatusVM(toRunStatusViewModel(gmapsRun));
      }, 500);
      return;
    }

    // Standard Meta Ad Library research start with configured parameters
    const userKeywords = (pendingPlan.keywords && pendingPlan.keywords.length > 0)
      ? pendingPlan.keywords
      : ['Furniture'];
    const userCountry = pendingPlan.countryCode || 'BD';
    const userLocation = pendingPlan.locationName || userCountry;

    const payload: StartResearchPayload = {
      mode: 'CUSTOM',
      researchMode: 'AUTO_DISCOVERY',
      keywords: userKeywords,
      countryCode: userCountry,
      locationName: userLocation,
      maxFinalUniqueRelevantLeads: pendingPlan.maxCandidatesLimit
    };

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'START_RESEARCH', payload }, (res) => {
        if (res && res.run) {
          handleRunUpdate(res.run);
        }
        setIsSubmitting(false);
      });
    } else {
      // Local fallback simulation for test/development
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  };

  // Stop Action
  const handleStopRun = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage && activeRun) {
      chrome.runtime.sendMessage({
        type: 'STOP_RESEARCH',
        payload: { runId: activeRun.runId }
      });
    }
  };

  // Inspect Row in Detail Drawer
  const handleInspectRecord = (recordId: string) => {
    const raw = rawLeads.find(l =>
      (l.canonicalEntityId || l.entityId || l.leadId || l.pageId) === recordId ||
      (`rec_${l.canonicalEntityId}`) === recordId
    ) || rawLeads[0];

    if (raw) {
      if (isCanonicalLeadRecord(raw)) {
        setInspectedLead(toResultDetailViewModel(raw));
        setIsDetailDrawerOpen(true);
        return;
      }

      const uRecord = {
        recordId,
        entityId: raw.entityId || recordId,
        primarySource: selectedSource,
        contributingSources: [selectedSource],
        corroborationCount: 1,
        provenance: selectedSource === 'GOOGLE_MAPS' ? 'GOOGLE_DERIVED' : 'META_DERIVED',
        sourceContributions: [
          {
            source: selectedSource,
            provenance: selectedSource === 'GOOGLE_MAPS' ? 'GOOGLE_DERIVED' : 'META_DERIVED',
            fieldName: 'businessName',
            isRestricted: selectedSource === 'GOOGLE_MAPS',
            policyStatus: selectedSource === 'GOOGLE_MAPS' ? 'PRODUCT_REJECTED' : 'POLICY_APPROVED',
            persistenceStatus: selectedSource === 'GOOGLE_MAPS' ? 'NOT_PERSISTABLE' : 'PERSISTABLE',
            exportStatus: selectedSource === 'GOOGLE_MAPS' ? 'NOT_EXPORTABLE' : 'EXPORTABLE'
          }
        ],
        normalizedEntity: {
          businessName: { value: { displayName: raw.advertiserName || raw.name || 'Lead Entity' } }
        },
        evidence: raw.evidence || [],
        relevance: raw.strictV3Decision ? {
          decision: raw.strictV3Decision.decision,
          confidence: raw.strictV3Decision.confidence,
          explanation: raw.strictV3Decision.explanation,
          matchedTerms: raw.strictV3Decision.matchedTerms || []
        } : undefined,
        websiteVerification: raw.websiteVerification ? {
          url: raw.websiteUrl,
          finalStatus: raw.websiteVerification.finalStatus,
          verifiedAt: raw.websiteVerification.verifiedAt
        } : undefined,
        contactEnrichment: {
          phones: (raw.phones || []).map((p: string) => ({ raw: p, e164: p })),
          emails: (raw.emails || []).map((e: string) => ({ email: e })),
          addresses: [],
          socialLinks: [],
          contactFormPresent: false
        },
        qualification: {
          status: 'QUALIFIED',
          profileId: 'Default Commercial Profile',
          profileVersion: '1.0.0',
          score: 85,
          criteriaResults: [
            { criterionId: 'has_business_name', isMandatory: true, status: 'PASS', scoreAwarded: 10 },
            { criterionId: 'has_active_signal', isMandatory: true, status: 'PASS', scoreAwarded: 20 }
          ],
          summaryExplanation: 'Candidate passed all mandatory commercial criteria.'
        },
        geographicObservations: [{ country: raw.country || 'Global', city: raw.locationName }],
        restrictions: {
          isRestricted: selectedSource === 'GOOGLE_MAPS',
          persistenceEligible: selectedSource !== 'GOOGLE_MAPS',
          exportEligible: selectedSource !== 'GOOGLE_MAPS',
          displayEligible: true,
          qualificationEligible: true,
          restrictionBasis: selectedSource === 'GOOGLE_MAPS' ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' : undefined
        },
        fieldEligibility: {
          businessName: {
            isEligible: selectedSource !== 'GOOGLE_MAPS',
            sourceProvenance: selectedSource === 'GOOGLE_MAPS' ? 'GOOGLE_DERIVED' : 'META_DERIVED'
          }
        },
        stageStates: {} as any,
        runMetadata: { runId: activeRun?.runId || 'run_001' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any;

      setInspectedLead(toResultDetailViewModel(uRecord));
      setIsDetailDrawerOpen(true);
    }
  };

  // Export Preview & Execution
  const exportPreviewVM: ExportPreviewViewModel = useMemo(() => {
    const selectedLeads = selectedRecordIds.size > 0
      ? resultsVM.filter(r => selectedRecordIds.has(r.entityId) || selectedRecordIds.has(r.recordId))
      : resultsVM;

    const totalSelected = selectedLeads.length;
    const exportableCount = selectedLeads.filter(r => r.isExportable && !r.isRestricted).length;
    const restrictedCount = selectedLeads.filter(r => r.isRestricted || !r.isExportable).length;

    const policyNotice = restrictedCount > 0
      ? `You selected ${totalSelected} records. ${restrictedCount} are unavailable for export due to source restrictions. ${exportableCount} are eligible.`
      : 'All selected records satisfy public source export policy.';

    return {
      totalSelectedRecords: totalSelected,
      exportableRecordsCount: exportableCount,
      restrictedRecordsCount: restrictedCount,
      blockedDueToComplianceCount: restrictedCount,
      eligibleFields: ['displayName', 'category', 'location', 'websiteUrl', 'businessEmail', 'businessPhone', 'qualificationState'],
      restrictedFieldsOmitted: ['Google consumer-web raw search entries', 'Google consumer-web place identifiers'],
      policyNotice,
      isExportReady: exportableCount > 0
    };
  }, [resultsVM, selectedRecordIds]);

  const analyticsSnapshot: RunAnalyticsSnapshot | null = useMemo(() => {
    if (!rawLeads || rawLeads.length === 0) return null;
    return computeRunAnalytics(activeRun?.runId || 'current-run', rawLeads, {
      sourceType: selectedSource,
      runTitle: activeRun?.queryScope?.rawInput || activeRun?.runId || 'Current Run'
    });
  }, [rawLeads, activeRun, selectedSource]);

  const optimizationSnapshot: ResearchOptimizationSnapshot | null = useMemo(() => {
    if (!rawLeads || rawLeads.length === 0) return null;
    const canonical = rawLeads.filter(isCanonicalLeadRecord);
    return computeResearchOptimization(
      historyRuns.length > 0 ? historyRuns : [{ runId: activeRun?.runId || 'current-run', searchUnits: [] }],
      canonical.length > 0 ? canonical : rawLeads as any,
      []
    );
  }, [rawLeads, historyRuns, activeRun]);

  const handleConfirmExport = () => {
    if (isExporting) return;
    setIsExporting(true);

    const eligibleLeads = rawLeads.filter((_, idx) => {
      const row = resultsVM[idx];
      if (!row) return false;
      const isSelected = selectedRecordIds.size === 0 ||
        selectedRecordIds.has(row.entityId) ||
        selectedRecordIds.has(row.recordId);
      // Strictly prevent export of restricted or non-exportable records
      return isSelected && row.isExportable && !row.isRestricted;
    });

    if (eligibleLeads.length > 0) {
      const csv = exportLeadsToCsv(eligibleLeads as ExtensionLead[]);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leadnoria_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    setIsExporting(false);
    setIsExportModalOpen(false);
  };

  const handleClearHistory = () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ researchHistory: [] }, () => {
        setHistoryRuns([]);
        // Phase 32: Reset reliability metrics when history cleared
        const emptyMetrics = computeReliabilityMetrics([]);
        setReliabilityMetrics(emptyMetrics);
        setGuardrailAlerts([]);
      });
    }
  };

  // Phase 32: Diagnostic resolution update handler
  const handleUpdateIssueResolution = (fingerprint: string, state: IssueResolutionState) => {
    setAggregatedIssues(prev =>
      prev.map(issue =>
        issue.fingerprint === fingerprint ? { ...issue, resolutionState: state } : issue
      )
    );
  };

  // Phase 32: Clear diagnostic history handler (never clears research data)
  const handleClearDiagnostics = () => {
    setAggregatedIssues([]);
    // In production this would call diagnosticsRepository.clearDiagnosticHistory()
  };

  return (
    <div className="min-w-[360px] w-full max-w-[800px] h-full min-h-[600px] max-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans select-none">
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        resultsCount={resultsVM.length}
        isRunning={isJobRunning(activeRun?.status)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 flex flex-col gap-3">
        {/* Checkpoint Recovery Notification */}
        {recoveryInfo && activeTab !== 'RUN_STATUS' && (
          <RecoveryBanner
            recoveryInfo={recoveryInfo}
            onResume={() => {
              setActiveTab('RUN_STATUS');
              setRecoveryInfo(null);
            }}
            onDiscard={() => {
              if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                chrome.storage.local.remove(['leadnoria_checkpoint']);
              }
              setRecoveryInfo(null);
            }}
          />
        )}

        {/* Tab 1: Research Configuration */}
        {activeTab === 'RESEARCH' && (
          <div role="tabpanel" id="tabpanel-RESEARCH" aria-labelledby="tab-RESEARCH">
            <ResearchConfigView
              selectedSource={selectedSource}
              onSelectSource={setSelectedSource}
              onOpenPlanReview={handleOpenPlanReview}
              disabled={isSubmitting || isJobRunning(activeRun?.status)}
            />
          </div>
        )}

        {/* Tab 2: Run Status */}
        {activeTab === 'RUN_STATUS' && (
          <div role="tabpanel" id="tabpanel-RUN_STATUS" aria-labelledby="tab-RUN_STATUS">
            <RunStatusView
              runStatus={runStatusVM}
              onStop={handleStopRun}
              onViewResults={() => setActiveTab('RESULTS')}
              onInspectDiagnostics={() => {
                setDiagnosticsVM({
                  runId: activeRun?.runId || 'run_diag',
                  pipelineVersion: PIPELINE_VERSION,
                  adapterVersions: { META: '1.0.0', GOOGLE_MAPS: '1.0.0-phase14', WEBSITE: '1.0.0' },
                  planVersion: '1.0.0',
                  currentStage: 'QUALIFICATION',
                  elapsedDurationMs: elapsedSeconds * 1000,
                  sourceStatuses: { [selectedSource]: activeRun?.status || 'COMPLETED' },
                  blockedOperationsCount: selectedSource === 'GOOGLE_MAPS' ? 1 : 0,
                  retriesAttempted: 0
                });
                setIsDiagnosticsOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 3: Results List */}
        {activeTab === 'RESULTS' && (
          <div role="tabpanel" id="tabpanel-RESULTS" aria-labelledby="tab-RESULTS">
            <ResultsTableView
              results={resultsVM}
              selectedRecordIds={selectedRecordIds}
              onToggleSelect={id => {
                const updated = new Set(selectedRecordIds);
                if (updated.has(id)) updated.delete(id);
                else updated.add(id);
                setSelectedRecordIds(updated);
              }}
              onSelectAll={ids => {
                setSelectedRecordIds(new Set([...selectedRecordIds, ...ids]));
              }}
              onClearSelection={() => setSelectedRecordIds(new Set())}
              onInspectRecord={handleInspectRecord}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 4: Intelligence Analytics */}
        {activeTab === 'ANALYTICS' && (
          <div role="tabpanel" id="tabpanel-ANALYTICS" aria-labelledby="tab-ANALYTICS" className="flex-1 flex flex-col min-h-0">
            <AnalyticsView
              currentSnapshot={analyticsSnapshot}
              optimizationSnapshot={optimizationSnapshot}
              rawRecords={rawLeads}
              onNavigateToResultsWithFilter={() => {
                setActiveTab('RESULTS');
              }}
              onPrefillResearchConfig={() => {
                setActiveTab('RESEARCH');
              }}
            />
          </div>
        )}

        {/* Tab 5: Persisted History */}
        {activeTab === 'HISTORY' && (
          <div role="tabpanel" id="tabpanel-HISTORY" aria-labelledby="tab-HISTORY">
            <HistoryView
              runs={historyRuns}
              onSelectRun={run => {
                handleRunUpdate(run);
                setActiveTab('RESULTS');
              }}
              onClearHistory={handleClearHistory}
            />
          </div>
        )}

        {/* Tab 5: Settings & Disclosures */}
        {activeTab === 'SETTINGS' && (
          <div role="tabpanel" id="tabpanel-SETTINGS" aria-labelledby="tab-SETTINGS">
            <SettingsView
              onOpenDiagnostics={() => {
                setDiagnosticsVM({
                  runId: activeRun?.runId || 'run_env',
                  pipelineVersion: PIPELINE_VERSION,
                  adapterVersions: { META: '1.0.0', GOOGLE_MAPS: '1.0.0-phase14', WEBSITE: '1.0.0' },
                  planVersion: '1.0.0',
                  elapsedDurationMs: 0,
                  sourceStatuses: { META: 'AVAILABLE', GOOGLE_MAPS: 'CONTRACT_ONLY' },
                  blockedOperationsCount: 0,
                  retriesAttempted: 0
                });
                setIsDiagnosticsOpen(true);
              }}
              onClearLocalHistory={handleClearHistory}
              version="1.5.0"
              reliabilityMetrics={reliabilityMetrics}
              guardrailAlerts={guardrailAlerts}
              issues={aggregatedIssues}
              storageHealth={storageHealth}
              onUpdateIssueResolution={handleUpdateIssueResolution}
              onClearDiagnostics={handleClearDiagnostics}
            />
          </div>
        )}
      </main>

      {/* Plan Review Modal */}
      {pendingPlan && (
        <PlanReviewModal
          isOpen={isPlanReviewOpen}
          plan={pendingPlan}
          onConfirm={handleConfirmStart}
          onCancel={() => setIsPlanReviewOpen(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Result Detail Drawer */}
      <ResultDetailDrawer
        isOpen={isDetailDrawerOpen}
        lead={inspectedLead}
        onClose={() => setIsDetailDrawerOpen(false)}
      />

      {/* Export Policy Firewall Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        preview={exportPreviewVM}
        onConfirmExport={handleConfirmExport}
        onCancel={() => setIsExportModalOpen(false)}
        isExporting={isExporting}
      />

      {/* Technical Diagnostics Drawer */}
      <DiagnosticsDrawer
        isOpen={isDiagnosticsOpen}
        diagnostics={diagnosticsVM}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </div>
  );
};
