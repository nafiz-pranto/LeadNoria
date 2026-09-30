/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Schema Migration Engine
 * 
 * Non-Negotiable Invariants:
 * - Deterministic version-to-version migrations (e.g., 1 -> 2)
 * - Non-destructive: preserves all source lineage and field contributions
 * - Never converts UNKNOWN to FAIL or BLOCKED to PASS
 * - Never removes Google or consumer-web restrictions
 * - Preserves historical qualification profileId, profileVersion, and evaluatorVersion
 */

import { PersistenceError } from './persistenceTypes.ts';

export type MigrationStep = (data: Record<string, unknown>) => Record<string, unknown>;

export interface MigrationDefinition {
  fromVersion: number;
  toVersion: number;
  resourceType: string;
  migrate: MigrationStep;
}

const MIGRATIONS: MigrationDefinition[] = [
  // Example future migration: v1 -> v2 demonstration maintaining full backwards compatibility
  {
    fromVersion: 1,
    toVersion: 2,
    resourceType: 'candidate',
    migrate: (record: Record<string, unknown>) => {
      // Invariant checks: ensure provenance and restrictions survive
      if (!record.provenance) {
        throw new PersistenceError('INVALID_PERSISTED_RECORD', 'Cannot migrate record without provenance');
      }
      return {
        ...record,
        schemaVersion: 2,
        migratedAt: new Date().toISOString()
      };
    }
  },
  {
    fromVersion: 1,
    toVersion: 2,
    resourceType: 'qualification',
    migrate: (record: Record<string, unknown>) => {
      // Must preserve historical profile metadata
      if (!record.profileId || !record.profileVersion) {
        throw new PersistenceError('INVALID_PERSISTED_RECORD', 'Cannot migrate qualification without historical profile metadata');
      }
      return {
        ...record,
        schemaVersion: 2,
        migratedAt: new Date().toISOString()
      };
    }
  }
];

/**
 * Applies all necessary sequential migrations to bring a record to targetVersion.
 */
export function migrateRecord<T extends Record<string, unknown>>(
  resourceType: string,
  record: T,
  targetVersion: number
): T {
  let currentVersion = typeof record.schemaVersion === 'number' ? record.schemaVersion : 1;
  let currentRecord = { ...record };

  if (currentVersion === targetVersion) {
    return currentRecord as T;
  }

  if (currentVersion > targetVersion) {
    throw new PersistenceError(
      'INCOMPATIBLE_STORAGE_VERSION',
      `Cannot downgrade '${resourceType}' from version ${currentVersion} to ${targetVersion}`
    );
  }

  while (currentVersion < targetVersion) {
    const nextVersion = currentVersion + 1;
    const migration = MIGRATIONS.find(
      m => m.resourceType === resourceType && m.fromVersion === currentVersion && m.toVersion === nextVersion
    );

    if (!migration) {
      throw new PersistenceError(
        'INCOMPATIBLE_STORAGE_VERSION',
        `No migration path found for '${resourceType}' from v${currentVersion} to v${nextVersion}`
      );
    }

    try {
      currentRecord = migration.migrate(currentRecord) as T;
      currentVersion = nextVersion;
    } catch (err: unknown) {
      if (err instanceof PersistenceError) throw err;
      throw new PersistenceError(
        'INVALID_PERSISTED_RECORD',
        `Migration failed for '${resourceType}' from v${currentVersion} to v${nextVersion}: ${String(err)}`
      );
    }
  }

  return currentRecord as T;
}
