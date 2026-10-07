/**
 * LeadNoria Qualification & Website Requirement Pipeline (Phase 6 & Phase 12)
 */

// Phase 6 Exports
export * from './types.ts';
export * from './qualificationReasons.ts';
export * from './websiteRequirementEngine.ts';
export * from './leadQualificationEngine.ts';

// Phase 12 Advanced Qualification Exports
export * from './qualificationTypes.ts';
export * from './qualificationProfile.ts';
export * from './qualificationFirewall.ts';
export * from './criterionEvaluator.ts';
export * from './qualificationScorer.ts';
export * from './qualificationExplainer.ts';
export * from './qualificationEvaluator.ts';

// Phase 23 Business Intelligence Exports
export * from './businessIntelligence.ts';

// Google Maps Advanced Research Qualification Domain
export * as googleMapsQualification from './googleMaps/index.ts';
export {
  qualifiesCandidate,
  extractRatingSignal,
  determineWebsiteState as determineGoogleMapsWebsiteState,
  createInitialCounters,
  executeMultiQueryResearch,
  DEFAULT_RESEARCH_FILTERS,
  normalizeRatingFilter as normalizeGoogleMapsRatingFilter,
  normalizeWebsiteFilter as normalizeGoogleMapsWebsiteFilter,
  normalizeResearchFilters as normalizeGoogleMapsResearchFilters
} from './googleMaps/index.ts';
export type {
  RatingFilter as GoogleMapsRatingFilter,
  WebsiteFilter as GoogleMapsWebsiteFilter,
  ResearchFilters,
  QualificationRejectionReason as GoogleMapsQualificationRejectionReason,
  QualificationResult as GoogleMapsQualificationResult,
  WebsiteEvidenceState as GoogleMapsWebsiteEvidenceState,
  ResearchCandidate,
  ResearchCounters,
  MultiQueryResearchOptions,
  MultiQueryResearchResult,
  QueryExecutionFn
} from './googleMaps/index.ts';

