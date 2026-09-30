/**
 * LeadNoria — Phase 14: Unified Multi-Source Architecture
 * Pipeline Graph & Stage Dependency Management
 * 
 * Invariants:
 * - Detects and rejects cyclic stage dependencies
 * - Enforces required stage dependencies before execution
 * - Validates partial pipeline legality (e.g. Website verification only)
 * - Computes deterministic topological stage execution sequence
 */

import { PipelineStageId } from './pipelineTypes.ts';

export interface StageNode {
  stageId: PipelineStageId;
  dependencies: PipelineStageId[];
  isOptional: boolean;
}

// Canonical stage dependencies
const CANONICAL_STAGE_DEPENDENCIES: Record<PipelineStageId, PipelineStageId[]> = {
  SOURCE_PLANNING: [],
  SOURCE_EXECUTION: ['SOURCE_PLANNING'],
  NORMALIZATION: ['SOURCE_EXECUTION'],
  ENTITY_RESOLUTION: ['NORMALIZATION'],
  EVIDENCE: ['NORMALIZATION'],
  RELEVANCE: ['EVIDENCE'],
  WEBSITE_VERIFICATION: ['NORMALIZATION'],
  CONTACT_ENRICHMENT: ['WEBSITE_VERIFICATION'],
  QUALIFICATION: ['RELEVANCE'],
  GEOGRAPHIC_ACCOUNTING: ['NORMALIZATION'],
  PERSISTENCE: ['QUALIFICATION'],
  EXPORT: ['PERSISTENCE']
};

export interface GraphValidationResult {
  isValid: boolean;
  topologicalStages: PipelineStageId[];
  errors: string[];
}

export class PipelineGraph {
  private nodes = new Map<PipelineStageId, StageNode>();

  constructor(stages?: PipelineStageId[]) {
    if (stages) {
      for (const s of stages) {
        this.addStage(s);
      }
    }
  }

  public addStage(stageId: PipelineStageId, customDeps?: PipelineStageId[], isOptional = false): void {
    const deps = customDeps || CANONICAL_STAGE_DEPENDENCIES[stageId] || [];
    this.nodes.set(stageId, {
      stageId,
      dependencies: deps,
      isOptional
    });
  }

  public hasStage(stageId: PipelineStageId): boolean {
    return this.nodes.has(stageId);
  }

  public getAllStages(): PipelineStageId[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * Validates the graph for cycles and missing dependencies,
   * producing a deterministic topological execution order.
   */
  public validate(allowPartialPipelines = true): GraphValidationResult {
    const errors: string[] = [];
    const inDegree = new Map<PipelineStageId, number>();
    const adj = new Map<PipelineStageId, PipelineStageId[]>();

    for (const [id, node] of this.nodes.entries()) {
      inDegree.set(id, 0);
      adj.set(id, []);
    }

    // Build edges: dependency -> dependent
    for (const [id, node] of this.nodes.entries()) {
      for (const dep of node.dependencies) {
        if (!this.nodes.has(dep)) {
          if (!allowPartialPipelines) {
            errors.push(`Stage '${id}' depends on missing stage '${dep}'`);
          }
          // In partial pipelines, if the dependency is not requested, it is relaxed or assumed satisfied
          continue;
        }
        adj.get(dep)!.push(id);
        inDegree.set(id, (inDegree.get(id) || 0) + 1);
      }
    }

    // Kahn's Algorithm for Topological Sort & Cycle Detection
    const queue: PipelineStageId[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) {
        queue.push(id);
      }
    }

    // Sort queue deterministically
    queue.sort((a, b) => a.localeCompare(b));

    const topologicalStages: PipelineStageId[] = [];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      topologicalStages.push(curr);

      const neighbors = adj.get(curr) || [];
      for (const n of neighbors) {
        const newDeg = (inDegree.get(n) || 0) - 1;
        inDegree.set(n, newDeg);
        if (newDeg === 0) {
          queue.push(n);
          queue.sort((a, b) => a.localeCompare(b));
        }
      }
    }

    if (topologicalStages.length !== this.nodes.size) {
      errors.push('Cyclic dependency detected in pipeline stage graph');
    }

    return {
      isValid: errors.length === 0,
      topologicalStages,
      errors
    };
  }
}
