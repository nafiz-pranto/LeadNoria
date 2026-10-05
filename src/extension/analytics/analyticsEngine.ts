/**
 * LeadNoria — Phase 30: Production Intelligence Analytics & Run Quality Insights
 * Analytics Calculation Engine
 *
 * Invariants:
 * - Deterministic, pure calculation functions
 * - Single-pass O(N) evaluation across lead records for high performance (up to 10,000 leads)
 * - Safe sanitization of labels and values (prevents XSS, NaN, Infinity)
 * - Strictly observational: no predictive scores, no conversion claims
 * - Data firewall: restricted Google records remain restricted (aggregate counts only)
 */

import {
  RunAnalyticsSnapshot,
  RunLevelMetrics,
  CoverageMetrics,
  ContactabilityMetrics,
  WebsiteMetrics,
  QualificationAnalytics,
  SourceMetrics,
  RestrictedDataAggregate,
  QualityWarning,
  QualityWarningThresholds,
  DEFAULT_QUALITY_THRESHOLDS,
  RunComparisonSnapshot,
  MetricComparisonItem,
  ChangeAnalysisResult,
  EntityChangeRecord,
  EntityFieldDelta,
  AUTHORITATIVE_WEBSITE_LIMITS,
  ANALYTICS_SCHEMA_VERSION
} from './types.ts';
import { CanonicalLeadRecord } from '../leadIntelligence/types.ts';
import { UnifiedResearchRecord } from '../pipeline/pipelineTypes.ts';
import { isCanonicalLeadRecord } from '../ui/viewModelMappers.ts';

/**
 * Deterministic rounding utility
 */
export function roundDeterministic(val: number, precision: number = 1): number {
  if (isNaN(val) || !isFinite(val)) return 0;
  const factor = Math.pow(10, precision);
  return Math.round(val * factor) / factor;
}

/**
 * Safe text sanitizer for HTML/XSS and Unicode edge cases
 */
export function sanitizeAnalyticsText(input: unknown): string {
  if (input == null) return '';
  const str = String(input);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface ComputeAnalyticsOptions {
  runTitle?: string;
  sourceType?: 'META' | 'GOOGLE_MAPS';
  recordsDiscovered?: number;
  duplicatesDetected?: number;
  recordsRejected?: number;
  thresholds?: Partial<QualityWarningThresholds>;
}

/**
 * Normalized record accessor interface to handle CanonicalLeadRecord and UnifiedResearchRecord identically
 */
interface NormalizedLeadView {
  entityId: string;
  businessName: string;
  website: string;
  isWebsiteVerified: boolean;
  websiteState: string;
  websiteUnavailableReason?: string;
  emails: string[];
  phones: string[];
  contactForms: string[];
  publicPeople: string[];
  services: string[];
  socialLinks: string[];
  categories: string[];
  city: string;
  country: string;
  qualificationState: string;
  qualificationReasons: Array<{ code: string; mandatory?: boolean; outcome?: string; explanation?: string }>;
  isRestricted: boolean;
  isExportable: boolean;
  conflictsCount: number;
  corroborationsCount: number;
  sourceContributions: string[];
  freshnessTimestamp?: string;
  pagesInspected: number;
  technologySignalsCount: number;
}

function normalizeToView(record: CanonicalLeadRecord | UnifiedResearchRecord): NormalizedLeadView {
  if (isCanonicalLeadRecord(record)) {
    const r = record as CanonicalLeadRecord;
    const isVerified = r.qualification?.qualificationDecision?.criterionResults?.some(
      c => (c.criterionType === 'VERIFIED_BUSINESS_WEBSITE' || c.criterionType === 'WEBSITE_STATUS') && c.outcome === 'PASS'
    ) || (Boolean(r.digital?.verifiedWebsite?.value));

    const qualState = r.qualification?.finalState ||
      r.qualification?.qualificationDecision?.status ||
      ((r.quality?.identityCompleteness || 0) > 0.6 ? 'QUALIFIED' : 'UNCERTAIN');

    const qualReasons: Array<{ code: string; mandatory?: boolean; outcome?: string; explanation?: string }> = [];
    if (r.qualification?.qualificationDecision?.criterionResults) {
      for (const cr of r.qualification.qualificationDecision.criterionResults) {
        qualReasons.push({
          code: cr.reasonCode || cr.criterionType,
          mandatory: cr.mandatory,
          outcome: cr.outcome,
          explanation: cr.explanation
        });
      }
    }

    const emails = (r.contacts?.emails || []).map(e => e.value).filter(Boolean);
    const phones = (r.contacts?.phones || []).map(p => p.value).filter(Boolean);
    const forms = r.contacts?.contactForms || [];
    const people = (r.people?.publicPeople || []).map(p => p.name).filter(Boolean);
    const services = r.business?.services?.value || [];
    const socials = (r.digital?.socialProfiles?.value || []).map(s => s.url).filter(Boolean);
    const categories = r.business?.categories?.value || [];
    const isRestricted = r.policy?.isRestricted === true;
    const isExportable = r.policy?.exportEligible === true && !isRestricted;
    const conflicts = (r.evidence?.conflicts || []).length;
    const corroborations = (r.evidence?.corroborations || []).length;
    const sources = (r.evidence?.sourceContributions || []).map(s => String(s.source));
    const website = r.digital?.verifiedWebsite?.value || (r.digital?.domains?.value?.[0] ? `https://${r.digital.domains.value[0]}` : '');

    return {
      entityId: r.canonicalEntityId,
      businessName: r.canonicalBusinessName?.value || 'Unknown Business',
      website,
      isWebsiteVerified: isVerified,
      websiteState: isVerified ? 'WEBSITE_VERIFIED_BUSINESS_SITE' : (website ? 'WEBSITE_PRESENT' : 'WEBSITE_NOT_FOUND'),
      emails,
      phones,
      contactForms: forms,
      publicPeople: people,
      services,
      socialLinks: socials,
      categories,
      city: r.location?.city?.value || '',
      country: r.location?.country?.value || '',
      qualificationState: qualState,
      qualificationReasons: qualReasons,
      isRestricted,
      isExportable,
      conflictsCount: conflicts,
      corroborationsCount: corroborations,
      sourceContributions: sources,
      freshnessTimestamp: r.freshness?.lastObservedAt || r.updatedAt || r.createdAt,
      pagesInspected: Math.min(AUTHORITATIVE_WEBSITE_LIMITS.MAX_PAGES_PER_DOMAIN, (r.digital?.technologySignals?.length ? 2 : 1)),
      technologySignalsCount: r.digital?.technologySignals?.length || 0
    };
  }

  // UnifiedResearchRecord fallback
  const urr = record as UnifiedResearchRecord;
  const webRes = urr.websiteVerificationResult;
  const isVerified = webRes?.status === 'VERIFIED_BUSINESS_WEBSITE';
  const qualState = urr.qualificationState || urr.qualificationDecision?.status || 'UNCERTAIN';
  const qualReasons: Array<{ code: string; mandatory?: boolean; outcome?: string; explanation?: string }> = [];
  if (urr.qualificationDecision?.criterionResults) {
    for (const cr of urr.qualificationDecision.criterionResults) {
      qualReasons.push({
        code: cr.reasonCode || cr.criterionType,
        mandatory: cr.mandatory,
        outcome: cr.outcome,
        explanation: cr.explanation
      });
    }
  }

  const emails = urr.contactEnrichmentResult?.emails?.map(e => e.normalizedEmail || e.rawValue).filter(Boolean) || [];
  const phones = urr.contactEnrichmentResult?.phones?.map(p => p.normalizedValue || p.rawValue).filter(Boolean) || [];
  const forms = urr.contactEnrichmentResult?.contactForms?.filter(f => f.present).map(f => f.pageUrl).filter(Boolean) || [];
  const isRestricted = urr.restrictions?.isRestricted === true;
  const isExportable = !isRestricted;
  const sources = (urr.sourceContributions || []).map(s => String(s.source));
  const webUrl = webRes?.finalUrl || webRes?.originalUrl || '';

  return {
    entityId: urr.entityId || urr.recordId,
    businessName: urr.canonicalDisplayName || 'Unknown Business',
    website: webUrl,
    isWebsiteVerified: isVerified,
    websiteState: isVerified ? 'WEBSITE_VERIFIED_BUSINESS_SITE' : (webUrl ? 'WEBSITE_PRESENT' : 'WEBSITE_NOT_FOUND'),
    websiteUnavailableReason: webRes?.blockedReason || webRes?.errorCode,
    emails,
    phones,
    contactForms: forms,
    publicPeople: [],
    services: [],
    socialLinks: [],
    categories: [],
    city: urr.geographicObservations?.[0]?.name || '',
    country: urr.geographicObservations?.[0]?.countryCode || '',
    qualificationState: qualState,
    qualificationReasons: qualReasons,
    isRestricted,
    isExportable,
    conflictsCount: 0,
    corroborationsCount: urr.corroborationCount || 0,
    sourceContributions: sources,
    freshnessTimestamp: urr.updatedAt || urr.createdAt,
    pagesInspected: Math.min(AUTHORITATIVE_WEBSITE_LIMITS.MAX_PAGES_PER_DOMAIN, webRes?.pagesVisited?.length || 1),
    technologySignalsCount: 0
  };
}

/**
 * Main analytics calculation function (O(N) single-pass)
 */
export function computeRunAnalytics(
  runId: string,
  records: (CanonicalLeadRecord | UnifiedResearchRecord)[],
  options: ComputeAnalyticsOptions = {}
): RunAnalyticsSnapshot {
  const safeRunId = sanitizeAnalyticsText(runId || 'run-default');
  const safeTitle = sanitizeAnalyticsText(options.runTitle || safeRunId);
  const totalAccepted = records.length;

  // Aggregate accumulators
  let withWebsite = 0;
  let withVerifiedWebsite = 0;
  let withEmail = 0;
  let withPhone = 0;
  let withPeople = 0;
  let withSocial = 0;
  let withServices = 0;
  let qualified = 0;
  let notQualified = 0;
  let uncertain = 0;
  let blocked = 0;
  let conflicted = 0;
  let incomplete = 0;
  let exportable = 0;

  // Contactability categories
  let emailAndPhoneCount = 0;
  let emailOnlyCount = 0;
  let phoneOnlyCount = 0;
  let contactFormOnlyCount = 0;
  let personAvailableOnlyCount = 0;
  let noPublicContactSignalCount = 0;

  // Website intelligence
  let websitePresentCount = 0;
  let websiteUnavailableCount = 0;
  let websiteTimeoutCount = 0;
  let websiteBlockedBySafetyCount = 0;
  let websiteNonBusinessCount = 0;
  let websiteParkedCount = 0;
  let totalPagesInspected = 0;
  let totalTechSignals = 0;

  // Qualification reasons
  let mandatoryFailureCount = 0;
  let missingEvidenceCount = 0;
  let contradictoryEvidenceCount = 0;
  let insufficientCompletenessCount = 0;
  let corroborationWeaknessCount = 0;
  let freshnessIssueCount = 0;
  const reasonCodeMap = new Map<string, { count: number; category: any; description: string }>();

  // Source attribution & restrictions
  let metaRecords = 0;
  let websiteEnrichmentRecords = 0;
  let mixedSourceRecords = 0;
  let restrictedSourceRecords = 0;

  // Deduplication estimation
  let duplicatesDetected = options.duplicatesDetected || 0;
  let recordsMerged = 0;

  // Single-pass O(N) iteration
  for (const raw of records) {
    const lead = normalizeToView(raw);

    // Identity & Business counts
    const hasWebsite = Boolean(lead.website && lead.website.trim().length > 0);
    const hasEmail = lead.emails.length > 0;
    const hasPhone = lead.phones.length > 0;
    const hasForm = lead.contactForms.length > 0;
    const hasPeople = lead.publicPeople.length > 0;
    const hasSocial = lead.socialLinks.length > 0;
    const hasServices = lead.services.length > 0;

    if (hasWebsite) withWebsite++;
    if (lead.isWebsiteVerified) withVerifiedWebsite++;
    if (hasEmail) withEmail++;
    if (hasPhone) withPhone++;
    if (hasPeople) withPeople++;
    if (hasSocial) withSocial++;
    if (hasServices) withServices++;

    // Qualification distribution
    const qState = lead.qualificationState;
    if (lead.isRestricted || qState === 'BLOCKED') blocked++;
    else if (qState === 'QUALIFIED') qualified++;
    else if (qState === 'NOT_QUALIFIED' || qState === 'DISQUALIFIED') notQualified++;
    else uncertain++;

    if (lead.conflictsCount > 0) conflicted++;
    if (lead.isExportable) exportable++;

    // Incomplete definition: missing website AND missing all contact methods
    if (!hasWebsite && !hasEmail && !hasPhone) {
      incomplete++;
    }

    // Contactability mutual exclusivity
    if (hasEmail && hasPhone) {
      emailAndPhoneCount++;
    } else if (hasEmail) {
      emailOnlyCount++;
    } else if (hasPhone) {
      phoneOnlyCount++;
    } else if (hasForm) {
      contactFormOnlyCount++;
    } else if (hasPeople) {
      personAvailableOnlyCount++;
    } else {
      noPublicContactSignalCount++;
    }

    // Website intelligence
    if (hasWebsite) {
      websitePresentCount++;
      totalPagesInspected += lead.pagesInspected;
      totalTechSignals += lead.technologySignalsCount;

      const ws = lead.websiteState;
      if (ws === 'WEBSITE_UNAVAILABLE') {
        websiteUnavailableCount++;
        if (lead.websiteUnavailableReason === 'PAGE_TIMEOUT' || lead.websiteUnavailableReason === 'DOMAIN_TIMEOUT') {
          websiteTimeoutCount++;
        }
      } else if (ws === 'WEBSITE_INVALID') {
        websiteBlockedBySafetyCount++;
      } else if (ws === 'WEBSITE_NON_BUSINESS') {
        websiteNonBusinessCount++;
      } else if (ws === 'WEBSITE_PARKED') {
        websiteParkedCount++;
      }
    }

    // Qualification reasons breakdown
    for (const qr of lead.qualificationReasons) {
      const code = qr.code;
      const mandatory = qr.mandatory === true;
      const outcome = qr.outcome;

      let cat: 'MANDATORY_FAIL' | 'MISSING_EVIDENCE' | 'CONTRADICTION' | 'INSUFFICIENT' | 'CORROBORATION' | 'FRESHNESS' | 'PASS' = 'PASS';
      if (outcome === 'FAIL' && mandatory) {
        cat = 'MANDATORY_FAIL';
        mandatoryFailureCount++;
      } else if (outcome === 'CONTRADICTORY' || code.includes('CONTRADICTION')) {
        cat = 'CONTRADICTION';
        contradictoryEvidenceCount++;
      } else if (outcome === 'UNKNOWN' || code.includes('UNCERTAIN') || code.includes('NOT_FOUND')) {
        cat = 'MISSING_EVIDENCE';
        missingEvidenceCount++;
      } else if (code.includes('COMPLETENESS') || code.includes('THRESHOLD')) {
        cat = 'INSUFFICIENT';
        insufficientCompletenessCount++;
      } else if (code.includes('CORROBORATION') || code.includes('CROSS_SOURCE')) {
        cat = 'CORROBORATION';
        corroborationWeaknessCount++;
      } else if (code.includes('FRESHNESS') || code.includes('TEMPORAL')) {
        cat = 'FRESHNESS';
        freshnessIssueCount++;
      }

      const existing = reasonCodeMap.get(code);
      if (existing) {
        existing.count++;
      } else {
        reasonCodeMap.set(code, {
          count: 1,
          category: cat,
          description: qr.explanation || code
        });
      }
    }

    // Source tracking
    const sources = lead.sourceContributions;
    const hasMeta = sources.some(s => s === 'META' || s.includes('META'));
    const hasWeb = sources.some(s => s === 'WEBSITE' || s.includes('WEBSITE'));
    if (hasMeta) metaRecords++;
    if (hasWeb) websiteEnrichmentRecords++;
    if (hasMeta && hasWeb) mixedSourceRecords++;
    if (lead.isRestricted || sources.some(s => s === 'GOOGLE_MAPS' || s.includes('GOOGLE'))) {
      restrictedSourceRecords++;
    }

    // Deduplication & merge count
    if (sources.length > 1 || lead.corroborationsCount > 1) {
      recordsMerged++;
    }
  }

  // Denominator logic: total accepted records (if 0, percentages are 0)
  const denom = totalAccepted > 0 ? totalAccepted : 1;

  // Run-level metrics
  const recordsDiscovered = options.recordsDiscovered || (totalAccepted + duplicatesDetected);
  const recordsRejected = options.recordsRejected || 0;

  const runMetrics: RunLevelMetrics = {
    recordsDiscovered,
    recordsAccepted: totalAccepted,
    duplicatesDetected,
    recordsMerged,
    recordsRejected,
    recordsWithWebsite: withWebsite,
    recordsWithVerifiedWebsite: withVerifiedWebsite,
    recordsWithEmail: withEmail,
    recordsWithPhone: withPhone,
    recordsWithPublicPeople: withPeople,
    recordsWithSocialLinks: withSocial,
    recordsWithServices: withServices,
    qualifiedCount: qualified,
    notQualifiedCount: notQualified,
    uncertainCount: uncertain,
    blockedCount: blocked,
    conflictedCount: conflicted,
    incompleteCount: incomplete,
    exportableCount: exportable
  };

  // Coverage metrics
  const coverage: CoverageMetrics = {
    totalEligibleRecords: totalAccepted,
    identityCoverage: roundDeterministic((totalAccepted > 0 ? (totalAccepted - incomplete) : 0) / denom * 100),
    businessCoverage: roundDeterministic((withServices > 0 ? withServices : withWebsite) / denom * 100),
    locationCoverage: roundDeterministic(totalAccepted > 0 ? 100 : 0),
    websiteCoverage: roundDeterministic(withWebsite / denom * 100),
    emailCoverage: roundDeterministic(withEmail / denom * 100),
    phoneCoverage: roundDeterministic(withPhone / denom * 100),
    peopleCoverage: roundDeterministic(withPeople / denom * 100),
    servicesCoverage: roundDeterministic(withServices / denom * 100),
    socialCoverage: roundDeterministic(withSocial / denom * 100),
    qualificationCoverage: roundDeterministic((qualified + notQualified + uncertain + blocked) / denom * 100),
    evidenceCoverage: roundDeterministic((metaRecords + websiteEnrichmentRecords > 0 ? totalAccepted : 0) / denom * 100),
    freshnessCoverage: roundDeterministic(totalAccepted > 0 ? 100 : 0),
    rawCounts: {
      identityCount: totalAccepted,
      businessCount: withServices > 0 ? withServices : withWebsite,
      locationCount: totalAccepted,
      websiteCount: withWebsite,
      emailCount: withEmail,
      phoneCount: withPhone,
      peopleCount: withPeople,
      servicesCount: withServices,
      socialCount: withSocial,
      qualificationCount: qualified + notQualified + uncertain + blocked,
      evidenceCount: totalAccepted,
      freshnessCount: totalAccepted
    }
  };

  // Contactability metrics
  const contactability: ContactabilityMetrics = {
    totalRecords: totalAccepted,
    emailAndPhoneCount,
    emailOnlyCount,
    phoneOnlyCount,
    contactFormOnlyCount,
    personAvailableOnlyCount,
    noPublicContactSignalCount,
    totalEmailAvailableCount: withEmail,
    totalPhoneAvailableCount: withPhone,
    totalPublicPersonAvailableCount: withPeople,
    totalContactFormAvailableCount: contactFormOnlyCount,
    emailPercentage: roundDeterministic(withEmail / denom * 100),
    phonePercentage: roundDeterministic(withPhone / denom * 100),
    fullContactabilityPercentage: roundDeterministic(emailAndPhoneCount / denom * 100),
    noContactSignalPercentage: roundDeterministic(noPublicContactSignalCount / denom * 100)
  };

  // Website metrics
  const websiteVerificationRate = withWebsite > 0 ? roundDeterministic(withVerifiedWebsite / withWebsite * 100) : 0;
  const website: WebsiteMetrics = {
    limits: AUTHORITATIVE_WEBSITE_LIMITS,
    websitePresentCount: withWebsite,
    websiteVerifiedCount: withVerifiedWebsite,
    websiteUnavailableCount,
    websiteTimeoutCount,
    websiteBlockedBySafetyCount,
    websiteNonBusinessCount,
    websiteParkedCount,
    pagesSuccessfullyInspected: totalPagesInspected,
    contactSignalsDiscovered: withEmail + withPhone + contactFormOnlyCount,
    technologySignalsDiscovered: totalTechSignals,
    socialSignalsDiscovered: withSocial,
    personSignalsDiscovered: withPeople,
    verificationRate: websiteVerificationRate
  };

  // Deterministically sort reason breakdown by count desc, then code asc
  const reasonBreakdown = Array.from(reasonCodeMap.entries())
    .map(([code, data]) => ({
      code,
      count: data.count,
      category: data.category,
      description: data.description
    }))
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));

  // Qualification analytics
  const qualification: QualificationAnalytics = {
    qualifiedCount: qualified,
    notQualifiedCount: notQualified,
    uncertainCount: uncertain,
    blockedCount: blocked,
    mandatoryFailureCount,
    missingEvidenceCount,
    contradictoryEvidenceCount,
    insufficientCompletenessCount,
    corroborationWeaknessCount,
    freshnessIssueCount,
    reasonBreakdown
  };

  // Source metrics
  const source: SourceMetrics = {
    primarySource: options.sourceType || 'META',
    sourceRecordCount: metaRecords,
    sourceContributionCount: metaRecords,
    websiteEnrichmentContributionCount: websiteEnrichmentRecords,
    mixedSourceRecordCount: mixedSourceRecords,
    restrictedSourceRecordCount: restrictedSourceRecords,
    googleMapsStatus: 'INTERNAL_EXPERIMENTAL_RESTRICTED',
    restrictedPolicyNote: 'Google Maps lineage is restricted for internal experimental validation only and excluded from production export.'
  };

  // Restricted data aggregate
  const restrictedAggregate: RestrictedDataAggregate = {
    restrictedRecordCount: restrictedSourceRecords,
    excludedFromExportCount: restrictedSourceRecords,
    policyMessage: restrictedSourceRecords > 0
      ? `${restrictedSourceRecords} restricted Google lineage record(s) excluded from export per data firewall policy.`
      : 'All records conform to production export policy.'
  };

  // Evaluate quality warnings
  const thresholds = { ...DEFAULT_QUALITY_THRESHOLDS, ...options.thresholds };
  const warnings = evaluateQualityWarnings(
    {
      schemaVersion: ANALYTICS_SCHEMA_VERSION,
      runId: safeRunId,
      runTitle: safeTitle,
      sourceType: source.primarySource,
      createdAt: new Date().toISOString(),
      totalRecords: totalAccepted,
      runMetrics,
      coverage,
      contactability,
      website,
      qualification,
      source,
      restrictedAggregate,
      warnings: []
    },
    thresholds
  );

  return {
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    runId: safeRunId,
    runTitle: safeTitle,
    sourceType: source.primarySource,
    createdAt: new Date().toISOString(),
    totalRecords: totalAccepted,
    runMetrics,
    coverage,
    contactability,
    website,
    qualification,
    source,
    restrictedAggregate,
    warnings
  };
}

/**
 * Evaluates transparent, explainable quality warnings based on explicit thresholds
 */
export function evaluateQualityWarnings(
  snapshot: RunAnalyticsSnapshot,
  thresholds: QualityWarningThresholds = DEFAULT_QUALITY_THRESHOLDS
): QualityWarning[] {
  const warnings: QualityWarning[] = [];
  const total = snapshot.totalRecords;
  if (total === 0) return warnings;

  // 1. High missing email rate
  const missingEmailRate = roundDeterministic(100 - snapshot.coverage.emailCoverage);
  if (missingEmailRate > thresholds.highMissingEmailRateThreshold) {
    warnings.push({
      id: 'WARN-MISSING-EMAIL',
      code: 'HIGH_MISSING_EMAIL_RATE',
      severity: 'MEDIUM',
      title: 'High Missing-Email Rate',
      message: `${missingEmailRate}% of records lack an observed email address (threshold: ${thresholds.highMissingEmailRateThreshold}%).`,
      metricName: 'missingEmailRate',
      observedValue: missingEmailRate,
      threshold: thresholds.highMissingEmailRateThreshold,
      actionableRemedy: 'Enable website intelligence enrichment or review ad creative text for public contact details.'
    });
  }

  // 2. Low website verification coverage
  if (snapshot.website.websitePresentCount > 0) {
    const verifRate = snapshot.website.verificationRate;
    if (verifRate < thresholds.lowWebsiteVerificationThreshold) {
      warnings.push({
        id: 'WARN-LOW-WEBSITE-VERIF',
        code: 'LOW_WEBSITE_VERIFICATION',
        severity: 'HIGH',
        title: 'Low Website Verification Rate',
        message: `Only ${verifRate}% of observed websites were verified as authentic target business sites (threshold: ${thresholds.lowWebsiteVerificationThreshold}%).`,
        metricName: 'websiteVerificationRate',
        observedValue: verifRate,
        threshold: thresholds.lowWebsiteVerificationThreshold,
        actionableRemedy: 'Inspect unavailable/parked domains or check network timeout limits.'
      });
    }
  }

  // 3. High uncertainty rate
  const uncertaintyRate = roundDeterministic(snapshot.qualification.uncertainCount / total * 100);
  if (uncertaintyRate > thresholds.highUncertaintyRateThreshold) {
    warnings.push({
      id: 'WARN-HIGH-UNCERTAINTY',
      code: 'HIGH_UNCERTAINTY_RATE',
      severity: 'HIGH',
      title: 'High Lead Uncertainty Rate',
      message: `${uncertaintyRate}% of records are classified as UNCERTAIN due to missing corroborating signals (threshold: ${thresholds.highUncertaintyRateThreshold}%).`,
      metricName: 'uncertaintyRate',
      observedValue: uncertaintyRate,
      threshold: thresholds.highUncertaintyRateThreshold,
      actionableRemedy: 'Review Qualification Profile criteria or verify website requirement settings.'
    });
  }

  // 4. Multiple conflicting observations
  const conflictRate = roundDeterministic(snapshot.runMetrics.conflictedCount / total * 100);
  if (conflictRate > thresholds.highConflictRateThreshold) {
    warnings.push({
      id: 'WARN-HIGH-CONFLICT',
      code: 'HIGH_CONFLICT_RATE',
      severity: 'HIGH',
      title: 'Elevated Field Conflict Rate',
      message: `${conflictRate}% of records exhibit identity or contact discrepancies across sources (threshold: ${thresholds.highConflictRateThreshold}%).`,
      metricName: 'conflictRate',
      observedValue: conflictRate,
      threshold: thresholds.highConflictRateThreshold,
      actionableRemedy: 'Audit entity resolution clustering or run manual reviewer resolution.'
    });
  }

  // 5. High blocked record rate
  const blockedRate = roundDeterministic(snapshot.runMetrics.blockedCount / total * 100);
  if (blockedRate > thresholds.highBlockedRateThreshold) {
    warnings.push({
      id: 'WARN-HIGH-BLOCKED',
      code: 'HIGH_BLOCKED_RATE',
      severity: 'HIGH',
      title: 'High Policy Blocked Rate',
      message: `${blockedRate}% of records are blocked from export by policy firewalls (threshold: ${thresholds.highBlockedRateThreshold}%).`,
      metricName: 'blockedRate',
      observedValue: blockedRate,
      threshold: thresholds.highBlockedRateThreshold,
      actionableRemedy: 'Check for restricted Google Maps candidate injection or policy exclusions.'
    });
  }

  // 6. Low people coverage
  const peopleRate = snapshot.coverage.peopleCoverage;
  if (peopleRate < thresholds.lowPeopleCoverageThreshold) {
    warnings.push({
      id: 'WARN-LOW-PEOPLE',
      code: 'LOW_PEOPLE_COVERAGE',
      severity: 'LOW',
      title: 'Low Public People Coverage',
      message: `Only ${peopleRate}% of records have identified public team members or owners (threshold: ${thresholds.lowPeopleCoverageThreshold}%).`,
      metricName: 'peopleCoverage',
      observedValue: peopleRate,
      threshold: thresholds.lowPeopleCoverageThreshold,
      actionableRemedy: 'Expand website intelligence to crawl About Us / Team pages within the 5-page ceiling.'
    });
  }

  // 7. Large duplicate candidate ratio
  if (snapshot.runMetrics.recordsDiscovered > 0) {
    const dupRatio = roundDeterministic(snapshot.runMetrics.duplicatesDetected / snapshot.runMetrics.recordsDiscovered * 100);
    if (dupRatio > thresholds.highDuplicateCandidateRatioThreshold) {
      warnings.push({
        id: 'WARN-HIGH-DUPLICATES',
        code: 'HIGH_DUPLICATE_RATIO',
        severity: 'MEDIUM',
        title: 'Large Duplicate Candidate Ratio',
        message: `${dupRatio}% of discovered inputs were deduplicated into existing entities (threshold: ${thresholds.highDuplicateCandidateRatioThreshold}%).`,
        metricName: 'duplicateRatio',
        observedValue: dupRatio,
        threshold: thresholds.highDuplicateCandidateRatioThreshold,
        actionableRemedy: 'Broaden search terms or adjust geographic radius to reduce search unit overlap.'
      });
    }
  }

  return warnings;
}

/**
 * Deterministic change detection between two lead record sets
 */
export function detectRecordChanges(
  baseRecords: (CanonicalLeadRecord | UnifiedResearchRecord)[],
  compareRecords: (CanonicalLeadRecord | UnifiedResearchRecord)[]
): ChangeAnalysisResult {
  const baseMap = new Map<string, NormalizedLeadView>();
  for (const r of baseRecords) {
    const v = normalizeToView(r);
    baseMap.set(v.entityId, v);
  }

  const compareMap = new Map<string, NormalizedLeadView>();
  for (const r of compareRecords) {
    const v = normalizeToView(r);
    compareMap.set(v.entityId, v);
  }

  let newCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;
  let changedCount = 0;
  let changedWebsiteCount = 0;
  let changedContactCount = 0;
  let changedPeopleCount = 0;
  let changedQualificationCount = 0;
  let changedFreshnessCount = 0;
  let newlyConflictingCount = 0;
  let newlyResolvedCount = 0;

  const detailedChanges: EntityChangeRecord[] = [];

  // Check compare records against base (new & modified)
  for (const [id, comp] of compareMap.entries()) {
    const base = baseMap.get(id);
    if (!base) {
      newCount++;
      detailedChanges.push({
        entityId: id,
        businessName: comp.businessName,
        changeType: 'NEW',
        fieldDeltas: [{ field: 'entity', oldValue: null, newValue: comp.businessName, description: 'Newly discovered record' }]
      });
      continue;
    }

    const deltas: EntityFieldDelta[] = [];

    // Check website change
    if (base.website !== comp.website) {
      changedWebsiteCount++;
      deltas.push({
        field: 'website',
        oldValue: base.website || '(empty)',
        newValue: comp.website || '(empty)',
        description: 'Website URL changed'
      });
    }

    // Check contact change (emails or phones)
    const baseEmails = base.emails.sort().join(',');
    const compEmails = comp.emails.sort().join(',');
    const basePhones = base.phones.sort().join(',');
    const compPhones = comp.phones.sort().join(',');
    if (baseEmails !== compEmails || basePhones !== compPhones) {
      changedContactCount++;
      deltas.push({
        field: 'contact',
        oldValue: `Emails: ${baseEmails || 'none'} | Phones: ${basePhones || 'none'}`,
        newValue: `Emails: ${compEmails || 'none'} | Phones: ${compPhones || 'none'}`,
        description: 'Contact channels updated'
      });
    }

    // Check people change
    const basePeople = base.publicPeople.sort().join(',');
    const compPeople = comp.publicPeople.sort().join(',');
    if (basePeople !== compPeople) {
      changedPeopleCount++;
      deltas.push({
        field: 'people',
        oldValue: basePeople || 'none',
        newValue: compPeople || 'none',
        description: 'Public people updated'
      });
    }

    // Check qualification change
    if (base.qualificationState !== comp.qualificationState) {
      changedQualificationCount++;
      deltas.push({
        field: 'qualification',
        oldValue: base.qualificationState,
        newValue: comp.qualificationState,
        description: `Qualification shifted from ${base.qualificationState} to ${comp.qualificationState}`
      });
    }

    // Check conflict change
    if (base.conflictsCount === 0 && comp.conflictsCount > 0) {
      newlyConflictingCount++;
      deltas.push({
        field: 'conflicts',
        oldValue: '0',
        newValue: String(comp.conflictsCount),
        description: 'New field conflict detected'
      });
    } else if (base.conflictsCount > 0 && comp.conflictsCount === 0) {
      newlyResolvedCount++;
      deltas.push({
        field: 'conflicts',
        oldValue: String(base.conflictsCount),
        newValue: '0',
        description: 'Field conflict resolved'
      });
    }

    // Check freshness
    if (base.freshnessTimestamp !== comp.freshnessTimestamp) {
      changedFreshnessCount++;
    }

    if (deltas.length > 0) {
      changedCount++;
      detailedChanges.push({
        entityId: id,
        businessName: comp.businessName,
        changeType: 'MODIFIED',
        fieldDeltas: deltas
      });
    } else {
      unchangedCount++;
      detailedChanges.push({
        entityId: id,
        businessName: comp.businessName,
        changeType: 'UNCHANGED',
        fieldDeltas: []
      });
    }
  }

  // Check removed records
  for (const [id, base] of baseMap.entries()) {
    if (!compareMap.has(id)) {
      removedCount++;
      detailedChanges.push({
        entityId: id,
        businessName: base.businessName,
        changeType: 'REMOVED',
        fieldDeltas: [{ field: 'entity', oldValue: base.businessName, newValue: null, description: 'Record omitted in compare run' }]
      });
    }
  }

  // Deterministically sort detailed changes by entityId
  detailedChanges.sort((a, b) => a.entityId.localeCompare(b.entityId));

  return {
    baseRunId: 'base',
    compareRunId: 'compare',
    newRecordsCount: newCount,
    removedRecordsCount: removedCount,
    unchangedRecordsCount: unchangedCount,
    changedRecordsCount: changedCount,
    changedWebsiteCount,
    changedContactCount,
    changedPeopleCount,
    changedQualificationCount,
    changedFreshnessCount,
    newlyConflictingCount,
    newlyResolvedCount,
    detailedChanges
  };
}

/**
 * Descriptive comparison of two completed run snapshots
 */
export function compareRuns(
  baseSnapshot: RunAnalyticsSnapshot,
  compareSnapshot: RunAnalyticsSnapshot,
  baseRecords: (CanonicalLeadRecord | UnifiedResearchRecord)[] = [],
  compareRecords: (CanonicalLeadRecord | UnifiedResearchRecord)[] = []
): RunComparisonSnapshot {
  const metricsDiff: MetricComparisonItem[] = [];
  const descriptiveSummary: string[] = [];

  const metricsToCompare: Array<{ name: string; getBase: (s: RunAnalyticsSnapshot) => number; getComp: (s: RunAnalyticsSnapshot) => number; unit: string }> = [
    { name: 'Total Records', getBase: s => s.totalRecords, getComp: s => s.totalRecords, unit: 'records' },
    { name: 'Website Coverage', getBase: s => s.coverage.websiteCoverage, getComp: s => s.coverage.websiteCoverage, unit: '%' },
    { name: 'Email Coverage', getBase: s => s.coverage.emailCoverage, getComp: s => s.coverage.emailCoverage, unit: '%' },
    { name: 'Phone Coverage', getBase: s => s.coverage.phoneCoverage, getComp: s => s.coverage.phoneCoverage, unit: '%' },
    { name: 'People Coverage', getBase: s => s.coverage.peopleCoverage, getComp: s => s.coverage.peopleCoverage, unit: '%' },
    { name: 'Qualified Records', getBase: s => s.qualification.qualifiedCount, getComp: s => s.qualification.qualifiedCount, unit: 'records' },
    { name: 'Uncertain Records', getBase: s => s.qualification.uncertainCount, getComp: s => s.qualification.uncertainCount, unit: 'records' },
    { name: 'Blocked Records', getBase: s => s.runMetrics.blockedCount, getComp: s => s.runMetrics.blockedCount, unit: 'records' },
    { name: 'Field Conflicts', getBase: s => s.runMetrics.conflictedCount, getComp: s => s.runMetrics.conflictedCount, unit: 'records' },
    { name: 'Exportable Records', getBase: s => s.runMetrics.exportableCount, getComp: s => s.runMetrics.exportableCount, unit: 'records' }
  ];

  for (const m of metricsToCompare) {
    const baseVal = m.getBase(baseSnapshot);
    const compVal = m.getComp(compareSnapshot);
    const delta = roundDeterministic(compVal - baseVal);
    const pctChange = baseVal > 0 ? roundDeterministic((compVal - baseVal) / baseVal * 100) : 0;

    let note = '';
    if (delta > 0) {
      note = `Run '${compareSnapshot.runId}' contained ${delta}${m.unit === '%' ? '%' : ' more'} ${m.name.toLowerCase()} than Run '${baseSnapshot.runId}'.`;
    } else if (delta < 0) {
      note = `Run '${compareSnapshot.runId}' contained ${Math.abs(delta)}${m.unit === '%' ? '%' : ' fewer'} ${m.name.toLowerCase()} than Run '${baseSnapshot.runId}'.`;
    } else {
      note = `Both runs demonstrated identical ${m.name.toLowerCase()} (${baseVal}${m.unit === '%' ? '%' : ''}).`;
    }

    metricsDiff.push({
      metricName: m.name,
      baseValue: baseVal,
      compareValue: compVal,
      delta,
      percentageChange: pctChange,
      descriptiveNote: note
    });

    if (delta !== 0) {
      descriptiveSummary.push(note);
    }
  }

  if (descriptiveSummary.length === 0) {
    descriptiveSummary.push(`No metric variances observed between Run '${baseSnapshot.runId}' and Run '${compareSnapshot.runId}'.`);
  }

  // Change analysis across underlying records
  const changeAnalysis = detectRecordChanges(baseRecords, compareRecords);
  changeAnalysis.baseRunId = baseSnapshot.runId;
  changeAnalysis.compareRunId = compareSnapshot.runId;

  return {
    baseRunId: baseSnapshot.runId,
    compareRunId: compareSnapshot.runId,
    generatedAt: new Date().toISOString(),
    metricsDiff,
    descriptiveSummary,
    changeAnalysis
  };
}
