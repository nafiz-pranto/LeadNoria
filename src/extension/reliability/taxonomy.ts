/**
 * LeadNoria — Phase 32: Production Feedback, Reliability & Growth Readiness
 * Error Taxonomy & Deterministic Error Classifier
 *
 * Invariants:
 * - Transparent, explainable mapping: ZERO black-box predictive classification.
 * - Accurate severity and user impact assessment.
 * - Safe fallback classification for unexpected exception types.
 */

import {
  IssueCategory,
  IssueSeverity,
  Retryability,
  WorkflowStage
} from './types.ts';

export interface CategoryMetadata {
  defaultSeverity: IssueSeverity;
  defaultRetryability: Retryability;
  userImpact: string;
  description: string;
}

export const ERROR_TAXONOMY: Record<IssueCategory, CategoryMetadata> = {
  ACQUISITION: {
    defaultSeverity: 'P1',
    defaultRetryability: 'YES',
    userImpact: 'Source extraction or pagination was interrupted; some lead candidates may not be gathered.',
    description: 'Errors during public source query execution, DOM parsing, or pagination.'
  },
  WEBSITE: {
    defaultSeverity: 'P2',
    defaultRetryability: 'YES',
    userImpact: 'Target business website could not be verified or enriched; domain marked UNVERIFIED.',
    description: 'HTTP connection timeouts, DNS failures, or SSL errors during website signals discovery.'
  },
  NORMALIZATION: {
    defaultSeverity: 'P2',
    defaultRetryability: 'NO',
    userImpact: 'Malformed input record could not be normalized into structured format.',
    description: 'Field format mismatches, unparseable phone/address tokens, or corrupted raw input.'
  },
  ENTITY_RESOLUTION: {
    defaultSeverity: 'P1',
    defaultRetryability: 'NO',
    userImpact: 'Candidate merging or deduplication failed; records kept distinct to prevent false joins.',
    description: 'Graph clustering or deterministic entity match processing exceptions.'
  },
  QUALIFICATION: {
    defaultSeverity: 'P2',
    defaultRetryability: 'NO',
    userImpact: 'Commercial intent scoring or qualification evaluation failed; lead marked UNCERTAIN.',
    description: 'Qualification rule evaluation or commercial intent dimension scoring exceptions.'
  },
  PERSISTENCE: {
    defaultSeverity: 'P0',
    defaultRetryability: 'YES',
    userImpact: 'Research runs or checkpoint state could not be saved to local storage.',
    description: 'Local storage quota exhaustion, IndexedDB transaction aborts, or lock contention.'
  },
  EXPORT: {
    defaultSeverity: 'P1',
    defaultRetryability: 'YES',
    userImpact: 'File generation (CSV / JSON) failed; research data remains safe in local storage.',
    description: 'Data transformation, serialization, or blob download creation failures.'
  },
  UI: {
    defaultSeverity: 'P2',
    defaultRetryability: 'YES',
    userImpact: 'Interface rendering glitch or tab switch error; reloading restores normal state.',
    description: 'React component render errors, missing view-model properties, or DOM event failures.'
  },
  LIFECYCLE: {
    defaultSeverity: 'P1',
    defaultRetryability: 'YES',
    userImpact: 'Extension worker was terminated or restarted; active checkpoint used for recovery.',
    description: 'Service worker suspension, extension update, or browser shutdown events.'
  },
  SECURITY: {
    defaultSeverity: 'P0',
    defaultRetryability: 'NO',
    userImpact: 'Potential dangerous payload (XSS, formula injection) detected and safely neutralized.',
    description: 'Input sanitization triggers, script tag injections, or protocol violations.'
  },
  POLICY: {
    defaultSeverity: 'P1',
    defaultRetryability: 'NO',
    userImpact: 'Operation was blocked to adhere strictly to compliance boundaries (e.g. Google Maps).',
    description: 'Contract-only access enforcement, export restrictions, or lineage firewalls.'
  },
  PERFORMANCE: {
    defaultSeverity: 'P2',
    defaultRetryability: 'CONDITIONAL',
    userImpact: 'Operation exceeded runtime budget or memory limits; result truncated or paged.',
    description: 'Execution timeouts, excessive candidate volume, or linear processing slowdowns.'
  },
  UNKNOWN: {
    defaultSeverity: 'P2',
    defaultRetryability: 'CONDITIONAL',
    userImpact: 'Uncategorized system error encountered; state preserved locally.',
    description: 'Generic fallback for untyped or unexpected runtime exceptions.'
  }
};

export interface ClassifiedIssueResult {
  category: IssueCategory;
  severity: IssueSeverity;
  technicalCode: string;
  humanReadableMessage: string;
  retryability: Retryability;
  userImpact: string;
  workflowStage: WorkflowStage;
  reproductionHint: string;
}

/**
 * Classifies an operational error deterministically.
 */
export function classifyProductionError(
  err: unknown,
  context?: {
    stage?: WorkflowStage;
    category?: IssueCategory;
    technicalCode?: string;
  }
): ClassifiedIssueResult {
  const stage = context?.stage || 'IDLE';
  const rawMsg = err instanceof Error ? err.message : String(err || 'Unknown error');
  const lowerMsg = rawMsg.toLowerCase();

  let category: IssueCategory = context?.category || 'UNKNOWN';
  let technicalCode = context?.technicalCode || 'GENERIC_ERROR';
  let reproductionHint = 'Inspect local research inputs and retry the operation.';

  if (!context?.category) {
    if (lowerMsg.includes('quota') || lowerMsg.includes('storage') || lowerMsg.includes('persis') || lowerMsg.includes('indexeddb')) {
      category = 'PERSISTENCE';
      technicalCode = 'STORAGE_PERSISTENCE_FAILURE';
      reproductionHint = 'Check available browser local storage capacity or clear historical test runs.';
    } else if (lowerMsg.includes('timeout') || lowerMsg.includes('network') || lowerMsg.includes('abort') || lowerMsg.includes('fetch')) {
      if (stage === 'WEBSITE_VERIFICATION') {
        category = 'WEBSITE';
        technicalCode = 'WEBSITE_CONNECTION_TIMEOUT';
        reproductionHint = 'Verify target website URL is online and reachable without CAPTCHA.';
      } else {
        category = 'ACQUISITION';
        technicalCode = 'SOURCE_ACQUISITION_TIMEOUT';
        reproductionHint = 'Check network connectivity to Meta Ad Library or public endpoint.';
      }
    } else if (lowerMsg.includes('google') && (lowerMsg.includes('restrict') || lowerMsg.includes('policy') || lowerMsg.includes('firewall'))) {
      category = 'POLICY';
      technicalCode = 'GOOGLE_CONTRACT_FIREWALL_BLOCK';
      reproductionHint = 'Google Maps data is CONTRACT_ONLY and cannot be exported or persisted raw.';
    } else if (lowerMsg.includes('xss') || lowerMsg.includes('script') || lowerMsg.includes('sanitize') || lowerMsg.includes('injection')) {
      category = 'SECURITY';
      technicalCode = 'MALICIOUS_INPUT_SANITIZED';
      reproductionHint = 'Input query or category contained disallowed script/formula characters.';
    } else if (lowerMsg.includes('export') || lowerMsg.includes('csv') || lowerMsg.includes('download')) {
      category = 'EXPORT';
      technicalCode = 'EXPORT_SERIALIZATION_FAILURE';
      reproductionHint = 'Ensure file download permissions are granted in the browser.';
    } else if (lowerMsg.includes('dedup') || lowerMsg.includes('entity') || lowerMsg.includes('merge')) {
      category = 'ENTITY_RESOLUTION';
      technicalCode = 'ENTITY_RESOLUTION_FAILURE';
      reproductionHint = 'Validate canonical entity cluster IDs and candidate name aliases.';
    } else if (stage === 'UI_RENDER') {
      category = 'UI';
      technicalCode = 'UI_COMPONENT_RENDER_ERROR';
      reproductionHint = 'Switch between tabs or reload the extension popup/sidepanel.';
    } else if (stage === 'SOURCE_EXECUTION' || stage === 'SOURCE_PLANNING') {
      category = 'ACQUISITION';
      technicalCode = 'SOURCE_EXECUTION_FAILURE';
    } else if (stage === 'NORMALIZATION') {
      category = 'NORMALIZATION';
      technicalCode = 'CANDIDATE_NORMALIZATION_FAILURE';
    } else if (stage === 'QUALIFICATION') {
      category = 'QUALIFICATION';
      technicalCode = 'QUALIFICATION_EVAL_FAILURE';
    }
  }

  const meta = ERROR_TAXONOMY[category] || ERROR_TAXONOMY.UNKNOWN;

  return {
    category,
    severity: meta.defaultSeverity,
    technicalCode,
    humanReadableMessage: rawMsg,
    retryability: meta.defaultRetryability,
    userImpact: meta.userImpact,
    workflowStage: stage,
    reproductionHint
  };
}
