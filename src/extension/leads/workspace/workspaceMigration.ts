/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Schema Migration Engine
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Deterministic and backward-aware migrations (V1 -> V2, etc.).
 * 2. Fail-closed on unknown future schema versions.
 * 3. Never migrate or restore restricted Google fields into persistent storage.
 */

import { validatePersistedLeadRecord } from './workspaceSchema.ts';
import { type PersistedLeadRecord, WORKSPACE_SCHEMA_VERSION } from './workspaceTypes.ts';

export interface MigrationResult {
  readonly success: boolean;
  readonly migratedRecords: readonly PersistedLeadRecord[];
  readonly discardedCount: number;
  readonly diagnostics: readonly string[];
}

/**
 * Migrates a raw lead record from schema V1 to V2.
 * (V2 extends V1 with optional custom status note and followUpNote enhancements).
 */
export function migrateRecordV1ToV2(recordV1: PersistedLeadRecord): PersistedLeadRecord {
  return Object.freeze({
    ...recordV1,
    schemaVersion: 2,
    userMetadata: {
      ...recordV1.userMetadata,
      customStatusNote: recordV1.userMetadata.customStatusNote || '',
      followUpNote: recordV1.userMetadata.followUpNote || ''
    },
    auditMetadata: {
      ...recordV1.auditMetadata,
      updatedAt: new Date().toISOString(),
      version: recordV1.auditMetadata.version + 1
    }
  });
}

/**
 * Migrates a collection of serialized or raw workspace records to the target schema version.
 */
export function migrateWorkspaceRecords(
  records: readonly unknown[],
  targetVersion = WORKSPACE_SCHEMA_VERSION
): MigrationResult {
  const diagnostics: string[] = [];
  const migrated: PersistedLeadRecord[] = [];
  let discardedCount = 0;

  for (let idx = 0; idx < records.length; idx++) {
    const raw = records[idx];

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      discardedCount++;
      diagnostics.push(`Record index ${idx} discarded: not a valid object`);
      continue;
    }

    const r = raw as Record<string, any>;
    const recordVersion = typeof r.schemaVersion === 'number' ? r.schemaVersion : 1;

    // Fail-closed on future versions that current code cannot understand
    if (recordVersion > Math.max(targetVersion, 2)) {
      discardedCount++;
      diagnostics.push(`Record index ${idx} (${r.leadId}): unknown future schemaVersion ${recordVersion}`);
      continue;
    }

    // Check for Google contamination before migrating
    const rawJson = JSON.stringify(r);
    if (
      rawJson.includes('GOOGLE_MAPS_BROWSER') ||
      rawJson.includes('ChIJ') ||
      rawJson.includes('maps.google.com') ||
      rawJson.includes('GOOGLE_SENTINEL')
    ) {
      discardedCount++;
      diagnostics.push(`SECURITY VIOLATION: Discarded record ${r.leadId} due to restricted Google tokens`);
      continue;
    }

    try {
      let current = r as PersistedLeadRecord;

      // Apply migrations
      if (recordVersion === 1 && targetVersion === 2) {
        current = migrateRecordV1ToV2(current);
      }

      // Validate migrated record
      const val = validatePersistedLeadRecord(current);
      if (val.isValid) {
        migrated.push(current);
      } else {
        discardedCount++;
        diagnostics.push(`Validation failed after migration for ${r.leadId}: ${val.errors.join('; ')}`);
      }
    } catch (err: any) {
      discardedCount++;
      diagnostics.push(`Migration exception on record index ${idx}: ${err.message}`);
    }
  }

  return {
    success: migrated.length > 0 || discardedCount === 0,
    migratedRecords: migrated,
    discardedCount,
    diagnostics
  };
}
