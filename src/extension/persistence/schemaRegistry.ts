/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Schema Registry & Version Compatibility
 * 
 * Non-Negotiable Invariants:
 * - Versioned schema definitions with explicit schemaVersion bounds
 * - Rejection of unsupported future versions (INCOMPATIBLE_STORAGE_VERSION)
 * - Safe migration paths without loss of provenance or restriction metadata
 */

import {
  CURRENT_PERSISTENCE_SCHEMA_VERSION,
  PersistenceError
} from './persistenceTypes.ts';

export interface ResourceSchemaDefinition {
  resourceType: string;
  currentVersion: number;
  minSupportedVersion: number;
  requiredFields: string[];
}

export const SCHEMA_REGISTRY: Record<string, ResourceSchemaDefinition> = {
  run: {
    resourceType: 'run',
    currentVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    minSupportedVersion: 1,
    requiredFields: ['runId', 'runVersion', 'schemaVersion', 'recordVersion', 'selectedSources', 'status', 'recoveryState']
  },
  sourcePlan: {
    resourceType: 'sourcePlan',
    currentVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    minSupportedVersion: 1,
    requiredFields: ['planId', 'runId', 'sourceType', 'adapterVersion', 'planVersion', 'schemaVersion']
  },
  pipelineState: {
    resourceType: 'pipelineState',
    currentVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    minSupportedVersion: 1,
    requiredFields: ['runId', 'schemaVersion', 'recordVersion', 'completedStages', 'sourceStatuses', 'stageStates']
  },
  candidate: {
    resourceType: 'candidate',
    currentVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    minSupportedVersion: 1,
    requiredFields: ['candidateId', 'runId', 'schemaVersion', 'recordVersion', 'sourceKey', 'provenance', 'restrictions', 'classification']
  },
  entity: {
    resourceType: 'entity',
    currentVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    minSupportedVersion: 1,
    requiredFields: ['entityId', 'runId', 'schemaVersion', 'recordVersion', 'canonicalDisplayName', 'candidateIds', 'provenance', 'restrictions']
  },
  evidence: {
    resourceType: 'evidence',
    currentVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    minSupportedVersion: 1,
    requiredFields: ['evidenceId', 'runId', 'schemaVersion', 'fact', 'source', 'evidenceType', 'provenance', 'classification', 'isRestricted']
  },
  qualification: {
    resourceType: 'qualification',
    currentVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    minSupportedVersion: 1,
    requiredFields: ['evaluationId', 'runId', 'schemaVersion', 'profileId', 'profileVersion', 'evaluatorVersion', 'status', 'criteriaResults']
  },
  checkpoint: {
    resourceType: 'checkpoint',
    currentVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    minSupportedVersion: 1,
    requiredFields: ['checkpointId', 'runId', 'runVersion', 'schemaVersion', 'commitState', 'completedStages', 'checksum']
  },
  exportAudit: {
    resourceType: 'exportAudit',
    currentVersion: CURRENT_PERSISTENCE_SCHEMA_VERSION,
    minSupportedVersion: 1,
    requiredFields: ['exportId', 'runId', 'schemaVersion', 'projectionVersion', 'policyVersion', 'format', 'status']
  }
};

/**
 * Validates version compatibility for any resource loaded from persistence.
 */
export function validateSchemaCompatibility(resourceType: string, schemaVersion: unknown): void {
  const def = SCHEMA_REGISTRY[resourceType];
  if (!def) {
    throw new PersistenceError('INVALID_PERSISTED_RECORD', `Unknown resource type '${resourceType}'`);
  }

  if (typeof schemaVersion !== 'number' || !Number.isInteger(schemaVersion)) {
    throw new PersistenceError(
      'INVALID_PERSISTED_RECORD',
      `Resource '${resourceType}' has invalid schemaVersion: ${String(schemaVersion)}`
    );
  }

  if (schemaVersion > def.currentVersion) {
    throw new PersistenceError(
      'INCOMPATIBLE_STORAGE_VERSION',
      `Storage version ${schemaVersion} for '${resourceType}' is newer than current runtime version ${def.currentVersion}`
    );
  }

  if (schemaVersion < def.minSupportedVersion) {
    throw new PersistenceError(
      'INCOMPATIBLE_STORAGE_VERSION',
      `Storage version ${schemaVersion} for '${resourceType}' is older than minimum supported version ${def.minSupportedVersion}`
    );
  }
}
