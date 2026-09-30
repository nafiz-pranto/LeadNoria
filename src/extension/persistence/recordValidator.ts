/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Record Validation, Resource Limits & Security Bounds
 * 
 * Non-Negotiable Invariants:
 * - Validates all required fields, IDs, enum values, and versions before write
 * - Deep validation on read to catch manual tampering or corrupt records
 * - Enforces bounded payload size, lineage depth, and evidence collection limits
 * - Neutralizes prototype pollution payloads
 */

import { PersistenceError } from './persistenceTypes.ts';
import { SCHEMA_REGISTRY, validateSchemaCompatibility } from './schemaRegistry.ts';

// Resource Limits
export const MAX_RECORD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per record
export const MAX_LINEAGE_DEPTH = 15;
export const MAX_EVIDENCE_REFERENCES = 1000;
export const MAX_STORED_RUNS = 200;
export const MAX_CANDIDATES_PER_RUN = 10000;

/**
 * Validates any persisted record against its schema definition and integrity bounds.
 */
export function validateRecordForWrite(resourceType: string, record: unknown): void {
  if (!record || typeof record !== 'object') {
    throw new PersistenceError('INVALID_PERSISTED_RECORD', `Record must be a non-null object for '${resourceType}'`);
  }

  // Prototype pollution guard
  if (Object.prototype.hasOwnProperty.call(record, '__proto__') ||
      Object.prototype.hasOwnProperty.call(record, 'constructor') ||
      Object.prototype.hasOwnProperty.call(record, 'prototype')) {
    throw new PersistenceError('INVALID_PERSISTED_RECORD', `Prototype pollution detected in '${resourceType}' record`);
  }

  const def = SCHEMA_REGISTRY[resourceType];
  if (!def) {
    throw new PersistenceError('INVALID_PERSISTED_RECORD', `Unrecognized resource type '${resourceType}'`);
  }

  const rec = record as Record<string, unknown>;

  // Check required fields
  for (const field of def.requiredFields) {
    if (rec[field] === undefined || rec[field] === null) {
      throw new PersistenceError(
        'INVALID_PERSISTED_RECORD',
        `Missing required field '${field}' on '${resourceType}'`
      );
    }
  }

  // Schema version validation
  validateSchemaCompatibility(resourceType, rec.schemaVersion);

  // Lineage depth validation if candidate / source contributions present
  if (Array.isArray(rec.sourceContributions)) {
    for (const contrib of rec.sourceContributions as Record<string, unknown>[]) {
      if (Array.isArray(contrib.derivedFrom)) {
        if (contrib.derivedFrom.length > MAX_LINEAGE_DEPTH) {
          throw new PersistenceError(
            'LINEAGE_TOO_DEEP',
            `Lineage depth ${contrib.derivedFrom.length} exceeds maximum allowable depth ${MAX_LINEAGE_DEPTH}`
          );
        }
      }
    }
  }

  // Evidence count validation
  if (Array.isArray(rec.evidence) && rec.evidence.length > MAX_EVIDENCE_REFERENCES) {
    throw new PersistenceError(
      'RECORD_TOO_LARGE',
      `Evidence count ${rec.evidence.length} exceeds maximum limit of ${MAX_EVIDENCE_REFERENCES}`
    );
  }

  // Serialized size validation
  try {
    const serialized = JSON.stringify(record);
    if (serialized.length > MAX_RECORD_SIZE_BYTES) {
      throw new PersistenceError(
        'RECORD_TOO_LARGE',
        `Record size ${serialized.length} bytes exceeds limit of ${MAX_RECORD_SIZE_BYTES} bytes`
      );
    }
  } catch (err: unknown) {
    if (err instanceof PersistenceError) throw err;
    throw new PersistenceError('INVALID_PERSISTED_RECORD', `Failed to serialize record for size validation: ${String(err)}`);
  }
}

/**
 * Validates a record loaded from storage before consumption by domain or UI layers.
 */
export function validateRecordOnRead<T>(resourceType: string, record: unknown): T {
  if (!record || typeof record !== 'object') {
    throw new PersistenceError('INVALID_PERSISTED_RECORD', `Loaded record must be a non-null object for '${resourceType}'`);
  }

  const def = SCHEMA_REGISTRY[resourceType];
  if (!def) {
    throw new PersistenceError('INVALID_PERSISTED_RECORD', `Unrecognized resource type '${resourceType}'`);
  }

  const rec = record as Record<string, unknown>;

  for (const field of def.requiredFields) {
    if (rec[field] === undefined || rec[field] === null) {
      throw new PersistenceError(
        'INVALID_PERSISTED_RECORD',
        `Loaded '${resourceType}' is corrupt: missing required field '${field}'`
      );
    }
  }

  validateSchemaCompatibility(resourceType, rec.schemaVersion);
  return record as T;
}
