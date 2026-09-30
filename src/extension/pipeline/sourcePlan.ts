/**
 * LeadNoria — Phase 14: Unified Multi-Source Architecture
 * Source Plan Model & Validator
 * 
 * Invariants:
 * - Immutable plan contract defining execution scope per source
 * - Google Maps live execution mode is strictly rejected at the plan level
 * - Explicit versioning and stage declaration
 */

import { SourceType, PipelineStageId, ExecutionMode, PIPELINE_VERSION } from './pipelineTypes.ts';
import { UnifiedSourceAdapterRegistry, defaultUnifiedRegistry } from './sourceRegistry.ts';

export interface SourcePlanLimits {
  maxCandidates: number;
  timeoutMs: number;
}

export interface SourcePlan {
  planId: string;
  planVersion: string;
  sourceType: SourceType;
  sourceAdapterVersion: string;
  sourceConfiguration: Record<string, unknown>;
  queryScope?: string[];
  categoryScope?: string[];
  executionMode: ExecutionMode;
  enabledStages: PipelineStageId[];
  policyVersion: string;
  limits: SourcePlanLimits;
  createdAt: string;
  metadata?: Record<string, string>;
}

export interface SourcePlanValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateSourcePlan(
  plan: unknown,
  registry: UnifiedSourceAdapterRegistry = defaultUnifiedRegistry
): SourcePlanValidationResult {
  const errors: string[] = [];

  if (!plan || typeof plan !== 'object') {
    return { isValid: false, errors: ['SourcePlan must be a non-null object'] };
  }

  const p = plan as Partial<SourcePlan>;

  if (!p.planId || typeof p.planId !== 'string' || p.planId.trim() === '') {
    errors.push('planId is required and must be a non-empty string');
  }

  if (!p.planVersion || typeof p.planVersion !== 'string' || p.planVersion.trim() === '') {
    errors.push('planVersion is required and must be a non-empty string');
  }

  if (!p.sourceType || !registry.has(p.sourceType)) {
    errors.push(`Invalid or unregistered sourceType: '${p.sourceType}'`);
    return { isValid: false, errors };
  }

  const adapter = registry.get(p.sourceType)!;

  // Invariant 20: Google Maps CONTRACT_ONLY check
  if (p.sourceType === 'GOOGLE_MAPS' && p.executionMode === 'LIVE') {
    errors.push('Google Maps sourceType cannot be executed in LIVE mode; it is strictly CONTRACT_ONLY.');
  }

  // Validate execution mode compatibility
  const validModes: ExecutionMode[] = ['LIVE', 'DRY_RUN', 'REPLAY', 'VALIDATION_ONLY'];
  if (!p.executionMode || !validModes.includes(p.executionMode)) {
    errors.push(`Invalid executionMode: '${p.executionMode}'`);
  } else if (!adapter.capabilities.supportedExecutionModes.includes(p.executionMode)) {
    errors.push(
      `SourceType '${p.sourceType}' does not support requested executionMode '${p.executionMode}'. ` +
      `Supported: [${adapter.capabilities.supportedExecutionModes.join(', ')}]`
    );
  }

  // Validate enabled stages
  if (!Array.isArray(p.enabledStages) || p.enabledStages.length === 0) {
    errors.push('enabledStages must be a non-empty array of PipelineStageId');
  } else {
    for (const stage of p.enabledStages) {
      const cap = adapter.capabilities.stages[stage];
      if (!cap || cap === 'NOT_SUPPORTED') {
        errors.push(`Stage '${stage}' is unknown or NOT_SUPPORTED by sourceType '${p.sourceType}'`);
      }
    }
  }

  // Validate adapter configuration
  const configVal = adapter.validateConfiguration(p.sourceConfiguration || {});
  if (!configVal.isValid) {
    errors.push(...configVal.errors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function createCanonicalSourcePlan(
  sourceType: SourceType,
  overrides: Partial<SourcePlan> = {},
  registry: UnifiedSourceAdapterRegistry = defaultUnifiedRegistry
): SourcePlan {
  const adapter = registry.getRequired(sourceType);
  const now = new Date().toISOString();

  const isGmaps = sourceType === 'GOOGLE_MAPS';
  const defaultMode: ExecutionMode = isGmaps ? 'DRY_RUN' : 'LIVE';

  return {
    planId: `plan_${sourceType.toLowerCase()}_${Date.now()}`,
    planVersion: '1.0.0',
    sourceType,
    sourceAdapterVersion: adapter.adapterVersion,
    sourceConfiguration: {},
    queryScope: ['commercial'],
    categoryScope: ['business'],
    executionMode: defaultMode,
    enabledStages: [
      'SOURCE_PLANNING',
      'SOURCE_EXECUTION',
      'NORMALIZATION',
      'ENTITY_RESOLUTION',
      'RELEVANCE',
      'QUALIFICATION'
    ],
    policyVersion: PIPELINE_VERSION,
    limits: {
      maxCandidates: 500,
      timeoutMs: 30000
    },
    createdAt: now,
    ...overrides
  };
}
