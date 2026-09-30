/**
 * LeadNoria — Phase 14: Unified Multi-Source Architecture
 * Pipeline Configuration Validator & Security Defenses
 * 
 * Non-Negotiable Invariants:
 * - Rejects prototype pollution (__proto__, constructor, prototype)
 * - Rejects dynamic import / path injection attacks
 * - Strictly enforces Google Maps CONTRACT_ONLY invariant
 * - Rejects cyclic pipeline graphs
 * - Bounds resource limits (max sources, max stages, max candidates, max concurrency)
 */

import { MultiSourceRunConfig } from './multiSourceRun.ts';
import { validateSourcePlan } from './sourcePlan.ts';
import { PipelineGraph } from './pipelineGraph.ts';
import { UnifiedSourceAdapterRegistry, defaultUnifiedRegistry } from './sourceRegistry.ts';

export interface MultiSourceValidationResult {
  isValid: boolean;
  errors: string[];
}

export function detectPrototypePollution(obj: unknown, depth = 0): string | null {
  if (!obj || typeof obj !== 'object' || depth > 10) return null;

  const forbiddenKeys = ['__proto__', 'constructor', 'prototype'];
  for (const key of Object.keys(obj)) {
    if (forbiddenKeys.includes(key)) {
      return `Prohibited object key detected: '${key}'`;
    }
    const val = (obj as Record<string, unknown>)[key];
    if (val && typeof val === 'object') {
      const nested = detectPrototypePollution(val, depth + 1);
      if (nested) return nested;
    }
  }
  return null;
}

export function validateMultiSourceRunConfig(
  config: unknown,
  registry: UnifiedSourceAdapterRegistry = defaultUnifiedRegistry
): MultiSourceValidationResult {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    return { isValid: false, errors: ['Run configuration must be a non-null object'] };
  }

  // 1. Prototype pollution check
  const pollution = detectPrototypePollution(config);
  if (pollution) {
    errors.push(pollution);
  }

  const c = config as Partial<MultiSourceRunConfig>;

  // 2. Identity checks
  if (!c.runId || typeof c.runId !== 'string' || c.runId.trim() === '') {
    errors.push('runId is required and must be a non-empty string');
  }
  if (!c.runVersion || typeof c.runVersion !== 'string' || c.runVersion.trim() === '') {
    errors.push('runVersion is required and must be a non-empty string');
  }

  // 3. Selected sources check
  if (!Array.isArray(c.selectedSources) || c.selectedSources.length === 0) {
    errors.push('selectedSources must be a non-empty array of SourceType');
  } else {
    if (c.selectedSources.length > 10) {
      errors.push(`Maximum sources per run exceeded: ${c.selectedSources.length} > 10`);
    }
    for (const src of c.selectedSources) {
      if (!registry.has(src)) {
        errors.push(`Unregistered or unsupported sourceType selected: '${src}'`);
      }
    }
  }

  // 4. Source plans check
  if (!Array.isArray(c.sourcePlans) || c.sourcePlans.length === 0) {
    errors.push('sourcePlans must be a non-empty array of SourcePlan');
  } else {
    for (const plan of c.sourcePlans) {
      const planVal = validateSourcePlan(plan, registry);
      if (!planVal.isValid) {
        errors.push(...planVal.errors);
      }
      // Mandatory Invariant 58: Google Maps live rejection
      if (plan.sourceType === 'GOOGLE_MAPS' && (plan.executionMode === 'LIVE' || c.globalExecutionMode === 'LIVE')) {
        errors.push('Google Maps cannot be executed in LIVE mode under any run configuration.');
      }
    }
  }

  // 5. Global Limits check
  if (!c.globalLimits || typeof c.globalLimits !== 'object') {
    errors.push('globalLimits is required');
  } else {
    if (typeof c.globalLimits.maxTotalCandidates !== 'number' || c.globalLimits.maxTotalCandidates < 1 || c.globalLimits.maxTotalCandidates > 50_000) {
      errors.push(`Invalid maxTotalCandidates: must be between 1 and 50,000 (got ${c.globalLimits.maxTotalCandidates})`);
    }
    if (typeof c.globalLimits.maxRunDurationMs !== 'number' || c.globalLimits.maxRunDurationMs < 1000 || c.globalLimits.maxRunDurationMs > 3_600_000) {
      errors.push(`Invalid maxRunDurationMs: must be between 1,000ms and 3,600,000ms (got ${c.globalLimits.maxRunDurationMs})`);
    }
    if (typeof c.globalLimits.maxConcurrentSources !== 'number' || c.globalLimits.maxConcurrentSources < 1 || c.globalLimits.maxConcurrentSources > 10) {
      errors.push(`Invalid maxConcurrentSources: must be between 1 and 10 (got ${c.globalLimits.maxConcurrentSources})`);
    }
  }

  // 6. Pipeline Graph check across all source plans
  const requestedStages = new Set<string>();
  if (Array.isArray(c.sourcePlans)) {
    for (const p of c.sourcePlans) {
      if (Array.isArray(p.enabledStages)) {
        for (const st of p.enabledStages) {
          requestedStages.add(st);
        }
      }
    }
  }

  if (requestedStages.size > 0) {
    const graph = new PipelineGraph(Array.from(requestedStages) as any);
    const graphVal = graph.validate(true);
    if (!graphVal.isValid) {
      errors.push(...graphVal.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
