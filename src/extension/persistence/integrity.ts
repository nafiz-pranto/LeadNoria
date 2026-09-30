/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Cryptographic Integrity & Deterministic Serialization
 * 
 * Non-Negotiable Invariants:
 * - Deterministic canonical JSON serialization (sorted keys, stable encoding)
 * - SHA-256 checksum generation and validation
 * - Prototype pollution defense
 * - Safe stringification without cyclical references or function serialization
 */

import { createHash } from 'node:crypto';

/**
 * Deterministically serializes any JavaScript object or primitive into canonical JSON.
 * Keys are lexicographically sorted; undefined and functions are cleanly omitted.
 */
export function canonicalJsonStringify(value: unknown): string {
  const seen = new WeakSet();

  function serialize(val: unknown): unknown {
    if (val === null || val === undefined) {
      return val;
    }
    if (typeof val === 'function' || typeof val === 'symbol') {
      return undefined;
    }
    if (typeof val !== 'object') {
      return val;
    }

    if (seen.has(val as object)) {
      throw new Error('[CIRCULAR_REFERENCE] Circular structure cannot be canonically serialized');
    }
    seen.add(val as object);

    if (Array.isArray(val)) {
      const result = val.map(item => serialize(item));
      seen.delete(val as object);
      return result;
    }

    // Standard plain object: sort keys deterministically
    const keys = Object.keys(val as Record<string, unknown>).sort();
    const sortedObj: Record<string, unknown> = {};

    for (const key of keys) {
      // Prototype pollution defense: ignore prototype properties
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      const serializedChild = serialize((val as Record<string, unknown>)[key]);
      if (serializedChild !== undefined) {
        sortedObj[key] = serializedChild;
      }
    }

    seen.delete(val as object);
    return sortedObj;
  }

  const cleaned = serialize(value);
  return JSON.stringify(cleaned);
}

/**
 * Calculates a deterministic SHA-256 checksum over canonical JSON representation.
 */
export function calculateChecksum(value: unknown): string {
  const canonical = canonicalJsonStringify(value);
  return createHash('sha256').update(canonical).digest('hex');
}

/**
 * Verifies if an object matches an expected checksum.
 */
export function verifyChecksum(value: unknown, expectedChecksum: string): boolean {
  if (!expectedChecksum || typeof expectedChecksum !== 'string') {
    return false;
  }
  const calculated = calculateChecksum(value);
  return calculated === expectedChecksum;
}

/**
 * Generates a deterministic configuration fingerprint for tracking semantic shifts.
 */
export function generateConfigFingerprint(config: unknown): string {
  return calculateChecksum(config).substring(0, 16);
}
