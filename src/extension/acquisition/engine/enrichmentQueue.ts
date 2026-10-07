/**
 * LeadNoria — Google Maps Asynchronous Enrichment Queue & Coordinator (Part 6)
 *
 * HARD BOUNDARIES & INVARIANTS:
 * - Decoupled secondary pipeline: Google Maps acquisition NEVER awaits website crawling.
 * - Concurrency = 1 (default): strictly bounded, single active crawl worker.
 * - Maps tab isolation: Google Maps acquisition tab is NEVER navigated to business websites.
 * - Backpressure: bounded pending queue (maxPendingEnrichmentJobs); excess becomes ENRICHMENT_DEFERRED.
 * - Idempotent deduplication: identical candidates across multiple SearchUnits are crawled at most ONCE.
 * - Google Data Firewall: Google-lineage candidates remain strictly NOT_PERSISTABLE and NOT_EXPORTABLE.
 * - Reuses existing WebsiteIntelligenceEngine and ContactIntelligenceEngine untouched.
 * - Respects bounded crawler limits: 5 pages, 10s page timeout, 30s domain timeout, 500KB document budget.
 * - Bounded retries for transient errors; SSRF and security blocks are NEVER retried.
 */

import type { SessionCandidate } from './candidateIdentityTypes.ts';
import type { GoogleMapsAcquisitionDiagnostic } from './types.ts';
import {
  CandidateEnrichmentStatus,
  CandidateEnrichmentResult,
  EnrichmentQueueSnapshot,
  EnrichmentPolicy,
  DEFAULT_ENRICHMENT_POLICY,
  ENRICHMENT_ADAPTER_VERSION,
  EnrichmentTerminationReason
} from './enrichmentTypes.ts';

import { evaluateWebsiteEligibility } from './enrichmentEligibility.ts';
import { mergeEnrichmentIntoCandidate } from './enrichmentMerger.ts';
import { WebsiteIntelligenceEngine } from '../../websiteIntelligence/websiteIntelligenceEngine.ts';
import { ContactIntelligenceEngine } from '../../contactIntelligence/contactIntelligenceEngine.ts';
import type { WebsiteIntelligenceInput, WebsiteIntelligenceResult } from '../../websiteIntelligence/types.ts';
import type { ContactIntelligenceInput } from '../../contactIntelligence/types.ts';

export interface EnrichmentQueueCallbacks {
  readonly onCandidateEnriched?: (candidate: SessionCandidate, result: CandidateEnrichmentResult) => void;
  readonly onQueueProgress?: (snapshot: EnrichmentQueueSnapshot) => void;
  readonly onDiagnostic?: (diagnostic: GoogleMapsAcquisitionDiagnostic) => void;
}

interface QueuedEnrichmentJob {
  readonly candidateId: string;
  readonly targetUrl: string;
  readonly normalizedDomain: string;
  candidate: SessionCandidate;
  attemptCount: number;
  enqueuedAt: string;
}

export class GoogleMapsEnrichmentQueue {
  private readonly _sessionId: string;
  private readonly _policy: EnrichmentPolicy;
  private readonly _callbacks: EnrichmentQueueCallbacks;

  // Existing engine instances reused untouched
  private readonly _websiteEngine: WebsiteIntelligenceEngine;
  private readonly _contactEngine: ContactIntelligenceEngine;

  // Custom fetch function if provided (e.g., test fixtures or dedicated background tab)
  private _customFetch?: (url: string, timeoutMs: number) => Promise<{ status: number; html: string; headers?: Record<string, string>; location?: string; redirectUrl?: string }>;

  // Queue state
  private readonly _pendingQueue: QueuedEnrichmentJob[] = [];
  private readonly _jobMap = new Map<string, QueuedEnrichmentJob>(); // candidateId -> job
  private readonly _completedResults = new Map<string, CandidateEnrichmentResult>(); // candidateId -> result
  private readonly _domainDeduplication = new Map<string, string>(); // normalizedDomain -> candidateId

  // Concurrency & lifecycle locks
  private _activeWorkers = 0;
  private _isPaused = false;
  private _isCancelled = false;
  private _currentCandidateId?: string;

  // Counters
  private _totalEligible = 0;
  private _queuedCount = 0;
  private _completedCount = 0;
  private _partialCount = 0;
  private _failedCount = 0;
  private _blockedCount = 0;
  private _skippedCount = 0;
  private _deferredCount = 0;

  private _pagesAttempted = 0;
  private _pagesSucceeded = 0;
  private _pagesFailed = 0;

  private _emailsFound = 0;
  private _phonesFound = 0;
  private _socialLinksFound = 0;
  private _personsFound = 0;

  private _websiteConflicts = 0;
  private _contactConflicts = 0;

  constructor(
    sessionId: string,
    policy: Partial<EnrichmentPolicy> = {},
    callbacks: EnrichmentQueueCallbacks = {},
    customFetch?: (url: string, timeoutMs: number) => Promise<{ status: number; html: string; headers?: Record<string, string>; location?: string; redirectUrl?: string }>
  ) {
    this._sessionId = sessionId;
    this._policy = { ...DEFAULT_ENRICHMENT_POLICY, ...policy };
    this._callbacks = callbacks;
    this._customFetch = customFetch;

    this._websiteEngine = new WebsiteIntelligenceEngine();
    this._contactEngine = new ContactIntelligenceEngine();
  }

  public get sessionId(): string {
    return this._sessionId;
  }

  public get isPaused(): boolean {
    return this._isPaused;
  }

  public get isCancelled(): boolean {
    return this._isCancelled;
  }

  public setCustomFetch(fetcher: (url: string, timeoutMs: number) => Promise<{ status: number; html: string; headers?: Record<string, string>; location?: string; redirectUrl?: string }>): void {
    this._customFetch = fetcher;
  }

  /**
   * Enqueues a candidate for website intelligence enrichment.
   * Runs asynchronously: returns immediate status without blocking Maps acquisition.
   */
  public enqueue(candidate: SessionCandidate): {
    status: CandidateEnrichmentStatus;
    reason: string;
    isQueued: boolean;
  } {
    if (this._isCancelled) {
      return { status: 'CANCELLED', reason: 'Enrichment queue is cancelled', isQueued: false };
    }

    const candidateId = candidate.candidateId;

    // 1. Check if already enriched in this session (idempotency)
    const existingResult = this._completedResults.get(candidateId);
    if (existingResult) {
      return {
        status: existingResult.status,
        reason: 'Candidate already enriched in this session (idempotent suppression)',
        isQueued: false
      };
    }

    // 2. Check if already in queue
    if (this._jobMap.has(candidateId)) {
      return {
        status: 'QUEUED',
        reason: 'Candidate is already queued for enrichment',
        isQueued: false
      };
    }

    // 3. Strict eligibility evaluation
    const eligibility = evaluateWebsiteEligibility(candidate);

    if (!eligibility.isEligible || !eligibility.targetUrl) {
      if (eligibility.status === 'BLOCKED' || eligibility.status === 'BLOCKED_WEBSITE_CONFLICT') {
        this._blockedCount++;
        if (eligibility.status === 'BLOCKED_WEBSITE_CONFLICT') {
          this._websiteConflicts++;
        }
        this._recordDiagnostic({
          code: (eligibility.diagnosticCode as any) || 'WEBSITE_TARGET_INVALID',
          severity: 'P2',
          recoveryClass: 'TERMINAL',
          message: `Candidate ${candidateId} enrichment blocked: ${eligibility.reason}`,
          timestamp: new Date().toISOString()
        });
      } else {
        this._skippedCount++;
      }

      // Record terminal non-eligible result
      const nonEligibleResult: CandidateEnrichmentResult = {
        sessionCandidateId: candidateId,
        websiteTarget: eligibility.targetUrl || '',
        status: eligibility.status,
        pagesVisited: [],
        pagesDiscovered: 0,
        qualityIssues: [eligibility.reason],
        diagnostics: [],
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: 0,
        truncated: false,
        terminationReason: 'NONE',
        crawlerVersion: ENRICHMENT_ADAPTER_VERSION,
        retryCount: 0,
        fromCache: false
      };
      this._completedResults.set(candidateId, nonEligibleResult);

      return {
        status: eligibility.status,
        reason: eligibility.reason,
        isQueued: false
      };
    }

    this._totalEligible++;

    // 4. Backpressure check: Bounded pending queue
    if (this._pendingQueue.length >= this._policy.maxPendingEnrichmentJobs) {
      this._deferredCount++;
      this._recordDiagnostic({
        code: 'ENRICHMENT_QUEUE_FULL' as any,
        severity: 'P2',
        recoveryClass: 'RECOVERABLE',
        message: `Pending enrichment queue reached limit (${this._policy.maxPendingEnrichmentJobs}). Candidate ${candidateId} deferred.`,
        timestamp: new Date().toISOString()
      });

      const deferredResult: CandidateEnrichmentResult = {
        sessionCandidateId: candidateId,
        websiteTarget: eligibility.targetUrl,
        status: 'ENRICHMENT_DEFERRED',
        pagesVisited: [],
        pagesDiscovered: 0,
        qualityIssues: ['Pending enrichment queue reached capacity bound'],
        diagnostics: [],
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: 0,
        truncated: false,
        terminationReason: 'NONE',
        crawlerVersion: ENRICHMENT_ADAPTER_VERSION,
        retryCount: 0,
        fromCache: false
      };
      this._completedResults.set(candidateId, deferredResult);

      return {
        status: 'ENRICHMENT_DEFERRED',
        reason: 'Pending enrichment queue reached capacity bound (backpressure)',
        isQueued: false
      };
    }

    // 5. Deduplicate across identical domains observed under differing candidates
    const normDomain = eligibility.normalizedDomain || '';
    if (normDomain && this._domainDeduplication.has(normDomain)) {
      const priorCandidateId = this._domainDeduplication.get(normDomain)!;
      const priorResult = this._completedResults.get(priorCandidateId);
      if (priorResult) {
        // Reuse prior domain result immediately for this candidate without duplicate crawl
        const clonedResult: CandidateEnrichmentResult = {
          ...priorResult,
          sessionCandidateId: candidateId,
          fromCache: true
        };
        this._completedResults.set(candidateId, clonedResult);
        this._completedCount++;

        const enriched = mergeEnrichmentIntoCandidate(candidate, clonedResult);
        if (this._callbacks.onCandidateEnriched) {
          this._callbacks.onCandidateEnriched(enriched, clonedResult);
        }

        return {
          status: priorResult.status,
          reason: `Reused existing enrichment result from domain ${normDomain}`,
          isQueued: false
        };
      }
    }

    if (normDomain) {
      this._domainDeduplication.set(normDomain, candidateId);
    }

    // 6. Push to pending queue
    const job: QueuedEnrichmentJob = {
      candidateId,
      targetUrl: eligibility.targetUrl,
      normalizedDomain: normDomain,
      candidate,
      attemptCount: 0,
      enqueuedAt: new Date().toISOString()
    };

    this._pendingQueue.push(job);
    this._jobMap.set(candidateId, job);
    this._queuedCount++;

    this._notifyProgress();

    // Trigger asynchronous queue processor loop (non-blocking)
    this._drainQueueAsync();

    return {
      status: 'QUEUED',
      reason: 'Candidate queued for website intelligence enrichment',
      isQueued: true
    };
  }

  /**
   * Pauses claiming new enrichment jobs. Active task reaches safe boundary.
   */
  public pause(): void {
    this._isPaused = true;
    this._notifyProgress();
  }

  /**
   * Resumes claiming queued enrichment jobs.
   */
  public resume(): void {
    if (this._isCancelled) {
      throw new Error('Cannot resume cancelled enrichment queue');
    }
    if (!this._isPaused) return;
    this._isPaused = false;
    this._notifyProgress();
    this._drainQueueAsync();
  }

  /**
   * Cancels enrichment queue permanently.
   */
  public cancel(): void {
    this._isCancelled = true;
    this._isPaused = false;
    this._websiteEngine.cancel();

    // Mark pending jobs as CANCELLED
    for (const job of this._pendingQueue) {
      const cancelledResult: CandidateEnrichmentResult = {
        sessionCandidateId: job.candidateId,
        websiteTarget: job.targetUrl,
        status: 'CANCELLED',
        pagesVisited: [],
        pagesDiscovered: 0,
        qualityIssues: ['Enrichment cancelled by user'],
        diagnostics: [],
        startedAt: job.enqueuedAt,
        completedAt: new Date().toISOString(),
        durationMs: 0,
        truncated: false,
        terminationReason: 'USER_CANCELLED',
        crawlerVersion: ENRICHMENT_ADAPTER_VERSION,
        retryCount: job.attemptCount,
        fromCache: false
      };
      this._completedResults.set(job.candidateId, cancelledResult);
    }

    this._pendingQueue.length = 0;
    this._jobMap.clear();
    this._notifyProgress();
  }

  /**
   * Cleans up all session-scoped queue and worker state.
   */
  public cleanup(): void {
    this.cancel();
    this._completedResults.clear();
    this._domainDeduplication.clear();
    this._websiteEngine.clearCache();
  }

  /**
   * Returns current snapshot of the enrichment pipeline.
   */
  public getSnapshot(): EnrichmentQueueSnapshot {
    return {
      totalEligible: this._totalEligible,
      eligible: this._totalEligible,
      queued: this._pendingQueue.length,
      running: this._activeWorkers,
      completed: this._completedCount,
      partial: this._partialCount,
      failed: this._failedCount,
      blocked: this._blockedCount,
      skipped: this._skippedCount,
      deferred: this._deferredCount,
      currentCandidateId: this._currentCandidateId,
      pagesAttempted: this._pagesAttempted,
      pagesSucceeded: this._pagesSucceeded,
      pagesFailed: this._pagesFailed,
      emailsFound: this._emailsFound,
      phonesFound: this._phonesFound,
      socialLinksFound: this._socialLinksFound,
      personsFound: this._personsFound,
      websiteConflicts: this._websiteConflicts,
      contactConflicts: this._contactConflicts,
      isPaused: this._isPaused,
      isCancelled: this._isCancelled
    };
  }

  public getResult(candidateId: string): CandidateEnrichmentResult | undefined {
    return this._completedResults.get(candidateId);
  }

  public getAllResults(): readonly CandidateEnrichmentResult[] {
    return Array.from(this._completedResults.values());
  }

  // ==========================================================================
  // Internal Worker & Execution Loop
  // ==========================================================================

  private _drainQueueAsync(): void {
    if (this._isPaused || this._isCancelled) return;
    if (this._activeWorkers >= this._policy.maxConcurrentTasks) return;
    if (this._pendingQueue.length === 0) return;

    Promise.resolve().then(async () => {
      if (this._isPaused || this._isCancelled) return;
      if (this._activeWorkers >= this._policy.maxConcurrentTasks) return;
      if (this._pendingQueue.length === 0) return;

      this._activeWorkers++;

      try {
        while (!this._isPaused && !this._isCancelled && this._pendingQueue.length > 0) {
          const job = this._pendingQueue.shift();
          if (!job) break;

          this._jobMap.delete(job.candidateId);
          this._currentCandidateId = job.candidateId;
          this._notifyProgress();

          await this._processJob(job);
        }
      } finally {
        this._activeWorkers--;
        this._currentCandidateId = undefined;
        this._notifyProgress();
      }
    });
  }

  private async _processJob(job: QueuedEnrichmentJob): Promise<void> {
    job.attemptCount++;
    const startTime = Date.now();

    const input: WebsiteIntelligenceInput = {
      targetUrl: job.targetUrl,
      sourceContext: 'GOOGLE_MAPS',
      provenanceContext: 'GOOGLE_DERIVED',
      sourceRestrictions: {
        isRestricted: true,
        restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
        policyStatus: 'POLICY_GATED',
        persistenceEligibility: 'NOT_PERSISTABLE',
        exportEligibility: 'NOT_EXPORTABLE'
      },
      businessContext: {
        expectedName: job.candidate.businessName?.parsedValue || job.candidate.businessName?.rawValue,
        expectedPhone: job.candidate.phone?.parsedValue || job.candidate.phone?.rawValue,
        expectedAddress: job.candidate.address?.parsedValue || job.candidate.address?.rawValue
      },
      config: {
        maxPages: this._policy.maxPagesPerDomain,
        pageTimeoutMs: this._policy.pageTimeoutMs,
        domainTimeoutMs: this._policy.domainTimeoutMs,
        maxDocumentBytes: this._policy.maxDocumentBytes,
        collectPeople: this._policy.collectPeople,
        collectServices: this._policy.collectServices,
        detectTechnology: this._policy.detectTechnology
      }
    };

    try {
      // 1. Run bounded website crawler & facts extraction
      const websiteResult = await this._websiteEngine.process(input, this._customFetch);

      // Track crawl pages stats
      const visitedCount = websiteResult.crawlStats?.pagesVisited?.length || 0;
      this._pagesAttempted += visitedCount;
      this._pagesSucceeded += visitedCount;

      // 2. Run contact & person intelligence engine
      const contactInput: ContactIntelligenceInput = {
        targetUrl: job.targetUrl,
        websiteResult,
        sourceContext: 'GOOGLE_MAPS',
        provenanceContext: 'GOOGLE_DERIVED',
        sourceRestrictions: {
          isRestricted: true,
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          policyStatus: 'POLICY_GATED',
          persistenceEligibility: 'NOT_PERSISTABLE',
          exportEligibility: 'NOT_EXPORTABLE'
        }
      };

      const contactResult = this._contactEngine.process(contactInput);
      const contactList = contactResult.contacts || [];
      const peopleList = contactResult.people || [];

      // 3. Extract typed evidence projections
      const emails = contactList
        .filter(c => c.contactType === 'EMAIL')
        .map(c => ({
          email: c.normalizedValue,
          rawEmail: c.rawValue,
          classification: c.emailClassification || 'GENERIC_BUSINESS',
          sourceUrl: c.sourceUrl,
          observedAt: c.lastObservedAt
        }));

      const phones = contactList
        .filter(c => c.contactType === 'PHONE')
        .map(c => ({
          phone: c.normalizedValue,
          rawPhone: c.rawValue,
          sourceUrl: c.sourceUrl,
          observedAt: c.lastObservedAt
        }));

      const socialProfiles = contactList
        .filter(c => c.contactType === 'SOCIAL_PROFILE')
        .map(c => ({
          platform: String(c.socialPlatform || 'UNKNOWN'),
          url: c.normalizedValue,
          sourceUrl: c.sourceUrl
        }));

      const people = peopleList.map(p => ({
        fullName: p.fullName,
        jobTitle: p.jobTitle,
        email: p.emailRefs?.length ? p.emailRefs[0] : undefined,
        phone: p.phoneRefs?.length ? p.phoneRefs[0] : undefined,
        linkedInUrl: p.socialRefs?.length ? p.socialRefs[0] : undefined,
        sourceUrl: p.sourcePages?.[0] || job.targetUrl,
        evidenceType: 'VISIBLE_CONTENT' as const,
        observedAt: p.lastObservedAt
      }));

      // Update counters
      this._emailsFound += emails.length;
      this._phonesFound += phones.length;
      this._socialLinksFound += socialProfiles.length;
      this._personsFound += people.length;
      if (contactResult.conflicts?.length) {
        this._contactConflicts += contactResult.conflicts.length;
      }

      // 4. Determine status: COMPLETED vs PARTIAL
      let status: CandidateEnrichmentStatus = 'COMPLETED';
      let termReason: EnrichmentTerminationReason = 'SUCCESS';

      if (visitedCount === 0) {
        if (job.attemptCount <= this._policy.maxRetries && !this._isCancelled) {
          this._pendingQueue.unshift(job);
          this._drainQueueAsync();
          return;
        }
        status = 'FAILED';
        termReason = 'ERROR';
        this._failedCount++;
      } else if (
        websiteResult.crawlStats?.pagesFailed && websiteResult.crawlStats.pagesFailed.length > 0
      ) {
        status = 'PARTIAL';
        termReason = 'MAX_PAGES';
        this._partialCount++;
      } else {
        this._completedCount++;
      }

      const enrichmentResult: CandidateEnrichmentResult = {
        sessionCandidateId: job.candidateId,
        websiteTarget: job.targetUrl,
        status,
        pagesVisited: websiteResult.crawlStats?.pagesVisited || [],
        pagesDiscovered: websiteResult.crawlStats?.pagesDiscovered || visitedCount,
        websiteEvidence: {
          targetUrl: job.targetUrl,
          canonicalUrl: websiteResult.identity.canonicalUrl || job.targetUrl,
          domain: websiteResult.identity.domain,
          pageTitle: websiteResult.identity.pageTitle,
          metaDescription: websiteResult.identity.metaDescription,
          description: websiteResult.description?.text,
          businessName: websiteResult.identity.businessName,
          businessHours: websiteResult.identity.businessHours,
          technologies: (websiteResult.technologySignals || []).map(t => ({
            name: t.name,
            category: t.category,
            state: t.state
          })),
          services: websiteResult.identity.services || [],
          sourcePages: websiteResult.sourcePages || []
        },
        contactEvidence: {
          emails,
          phones,
          socialProfiles,
          address: websiteResult.address ? {
            address: websiteResult.address.normalizedAddress,
            sourceUrl: websiteResult.address.evidence?.[0]?.pageUrl || job.targetUrl
          } : (websiteResult.identity?.address ? {
            address: websiteResult.identity.address,
            sourceUrl: job.targetUrl
          } : undefined),
          contactForms: (websiteResult.contactForms || []).map(f => ({
            actionUrl: f.formAction,
            formType: f.formMethod || (f.hasEmailField ? 'EMAIL' : undefined)
          }))
        },
        personEvidence: {
          people
        },
        qualityIssues: [],
        diagnostics: [],
        startedAt: job.enqueuedAt,
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        truncated: false,
        terminationReason: termReason,
        crawlerVersion: ENRICHMENT_ADAPTER_VERSION,
        retryCount: job.attemptCount - 1,
        fromCache: websiteResult.crawlStats?.fromCache || false
      };

      this._completedResults.set(job.candidateId, enrichmentResult);

      // Merge into candidate and notify
      const enrichedCandidate = mergeEnrichmentIntoCandidate(job.candidate, enrichmentResult);

      if (this._callbacks.onCandidateEnriched) {
        this._callbacks.onCandidateEnriched(enrichedCandidate, enrichmentResult);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isTransient = this._isTransientError(errMsg);

      // Security blocks are NEVER retryable
      const isSecurityBlock = errMsg.includes('SSRF') ||
                              errMsg.includes('Cross-origin') ||
                              errMsg.includes('redirect') ||
                              errMsg.includes('FORBIDDEN');

      if (isTransient && !isSecurityBlock && job.attemptCount <= this._policy.maxRetries && !this._isCancelled) {
        // Retryable: push to front of queue
        this._pendingQueue.unshift(job);
        this._recordDiagnostic({
          code: 'ENRICHMENT_TIMEOUT' as any,
          severity: 'P2',
          recoveryClass: 'RETRYABLE',
          message: `Candidate ${job.candidateId} crawl attempt ${job.attemptCount} failed: ${errMsg}. Retrying.`,
          timestamp: new Date().toISOString()
        });
      } else {
        // Terminal failure or security block
        const isBlocked = isSecurityBlock || errMsg.includes('Invalid target');
        const status: CandidateEnrichmentStatus = isBlocked ? 'BLOCKED' : 'FAILED';

        if (isBlocked) {
          this._blockedCount++;
        } else {
          this._failedCount++;
        }

        const failedResult: CandidateEnrichmentResult = {
          sessionCandidateId: job.candidateId,
          websiteTarget: job.targetUrl,
          status,
          pagesVisited: [],
          pagesDiscovered: 0,
          qualityIssues: [errMsg],
          diagnostics: [],
          startedAt: job.enqueuedAt,
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - startTime,
          truncated: false,
          terminationReason: isBlocked ? 'SSRF_BLOCKED' : 'ERROR',
          crawlerVersion: ENRICHMENT_ADAPTER_VERSION,
          retryCount: job.attemptCount - 1,
          fromCache: false
        };

        this._completedResults.set(job.candidateId, failedResult);

        this._recordDiagnostic({
          code: isBlocked ? 'WEBSITE_SSRF_BLOCKED' as any : 'ENRICHMENT_TIMEOUT' as any,
          severity: 'P2',
          recoveryClass: 'TERMINAL',
          message: `Candidate ${job.candidateId} enrichment ${status.toLowerCase()}: ${errMsg}`,
          timestamp: new Date().toISOString()
        });

        // Merge failed enrichment result to candidate so candidate retains state
        const enrichedCandidate = mergeEnrichmentIntoCandidate(job.candidate, failedResult);
        if (this._callbacks.onCandidateEnriched) {
          this._callbacks.onCandidateEnriched(enrichedCandidate, failedResult);
        }
      }
    }
  }

  private _isTransientError(msg: string): boolean {
    const lower = msg.toLowerCase();
    return lower.includes('timeout') ||
           lower.includes('aborted') ||
           lower.includes('econnreset') ||
           lower.includes('network');
  }

  private _recordDiagnostic(diag: GoogleMapsAcquisitionDiagnostic): void {
    if (this._callbacks.onDiagnostic) {
      this._callbacks.onDiagnostic(diag);
    }
  }

  private _notifyProgress(): void {
    if (this._callbacks.onQueueProgress) {
      this._callbacks.onQueueProgress(this.getSnapshot());
    }
  }
}
