/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Workspace Corruption Detection & Recovery
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Resilient recovery: corrupted or adversarial records are safely quarantined.
 * 2. Healthy records are preserved without data loss.
 * 3. Never attempts to "guess" missing security data.
 * 4. Zero workspace crash on corrupted storage strings.
 */

import { validatePersistedLeadRecord } from './workspaceSchema.ts';
import type { PersistedLeadRecord } from './workspaceTypes.ts';

export interface RecoveryReport {
  readonly isClean: boolean;
  readonly healthyRecords: readonly PersistedLeadRecord[];
  readonly corruptedCount: number;
  readonly diagnostics: readonly string[];
}

/**
 * Safely parses and validates a raw storage string or object.
 * Returns healthy records and logs detailed diagnostics for corrupted ones.
 */
export function recoverWorkspaceState(rawStorageData: unknown): RecoveryReport {
  const diagnostics: string[] = [];
  const healthy: PersistedLeadRecord[] = [];
  let corruptedCount = 0;

  if (rawStorageData === null || rawStorageData === undefined) {
    return {
      isClean: true,
      healthyRecords: [],
      corruptedCount: 0,
      diagnostics: ['Storage is empty']
    };
  }

  let parsed: unknown = rawStorageData;

  // Handle JSON string inputs
  if (typeof rawStorageData === 'string') {
    const trimmed = rawStorageData.trim();
    if (!trimmed) {
      return { isClean: true, healthyRecords: [], corruptedCount: 0, diagnostics: ['Empty storage string'] };
    }

    try {
      parsed = JSON.parse(trimmed);
    } catch (err: any) {
      return {
        isClean: false,
        healthyRecords: [],
        corruptedCount: 1,
        diagnostics: [`CRITICAL STORAGE CORRUPTION: Failed to parse storage JSON: ${err.message}`]
      };
    }
  }

  // Ensure array format
  let recordList: unknown[] = [];
  if (Array.isArray(parsed)) {
    recordList = parsed;
  } else if (parsed && typeof parsed === 'object') {
    // Check if wrapped in an object like { leads: [...] }
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.leads)) {
      recordList = obj.leads;
    } else {
      // Single record passed
      recordList = [parsed];
    }
  } else {
    return {
      isClean: false,
      healthyRecords: [],
      corruptedCount: 1,
      diagnostics: ['Invalid storage format: Expected an array or record map']
    };
  }

  // Scan and validate each record
  for (let i = 0; i < recordList.length; i++) {
    const item = recordList[i];

    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      corruptedCount++;
      diagnostics.push(`Record #${i} corrupted: not a valid JSON object`);
      continue;
    }

    // Prototype pollution check
    const proto = Object.getPrototypeOf(item);
    if (proto !== Object.prototype && proto !== null) {
      corruptedCount++;
      diagnostics.push(`SECURITY VIOLATION: Record #${i} discarded due to prototype pollution keys`);
      continue;
    }
    const rawKeys = Object.getOwnPropertyNames(item);
    if (rawKeys.includes('__proto__') || rawKeys.includes('constructor') || rawKeys.includes('prototype')) {
      corruptedCount++;
      diagnostics.push(`SECURITY VIOLATION: Record #${i} discarded due to prototype pollution keys`);
      continue;
    }

    // Google sentinel / restricted tokens check
    const serialized = JSON.stringify(item);
    if (
      serialized.includes('GOOGLE_MAPS_BROWSER') ||
      serialized.includes('ChIJ') ||
      serialized.includes('maps.google.com') ||
      serialized.includes('GOOGLE_SENTINEL')
    ) {
      corruptedCount++;
      diagnostics.push(`SECURITY VIOLATION: Record #${i} discarded due to restricted Google tokens`);
      continue;
    }

    // Schema validation
    const validation = validatePersistedLeadRecord(item);
    if (!validation.isValid) {
      corruptedCount++;
      diagnostics.push(`Record #${i} validation failure: ${validation.errors.join('; ')}`);
      continue;
    }

    healthy.push(item as PersistedLeadRecord);
  }

  return {
    isClean: corruptedCount === 0,
    healthyRecords: healthy,
    corruptedCount,
    diagnostics
  };
}
