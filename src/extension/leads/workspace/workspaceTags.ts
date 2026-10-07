/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Tag Management & Sanitization
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Normalized, bounded, deduplicated tags.
 * 2. Rejects prototype pollution keys (__proto__, constructor, prototype).
 * 3. Rejects spreadsheet formula injection patterns.
 * 4. Rejects Google Maps Place IDs and sentinels.
 */

import { METADATA_CONSTRAINTS, type PersistedLeadRecord } from './workspaceTypes.ts';

/**
 * Formula injection prefixes.
 */
const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Normalizes and validates a tag string.
 * Returns null if the tag is invalid or empty.
 */
export function normalizeTag(tagInput: string): string {
  if (!tagInput || typeof tagInput !== 'string') {
    throw new Error('Tag must be a non-empty string');
  }

  let tag = tagInput.trim().toLowerCase();
  if (!tag) {
    throw new Error('Tag cannot be empty or whitespace only');
  }

  // Prototype pollution rejection
  if (tag === '__proto__' || tag === 'constructor' || tag === 'prototype') {
    throw new Error(`SECURITY VIOLATION: Disallowed prototype key "${tag}" cannot be used as a tag`);
  }

  // Formula injection check
  if (FORMULA_PREFIXES.some(prefix => tag.startsWith(prefix))) {
    throw new Error(`SECURITY VIOLATION: Tag "${tag}" cannot start with formula injection characters`);
  }

  // Google Sentinel check
  if (
    tag.includes('chij') ||
    tag.includes('maps.google') ||
    tag.includes('google_sentinel') ||
    tag.includes('google_maps')
  ) {
    throw new Error(`SECURITY VIOLATION: Tag "${tag}" contains forbidden Google sentinel token`);
  }

  // Length bound
  if (tag.length > METADATA_CONSTRAINTS.MAX_TAG_LENGTH) {
    tag = tag.slice(0, METADATA_CONSTRAINTS.MAX_TAG_LENGTH);
  }

  return tag;
}

/**
 * Safely adds a tag to a PersistedLeadRecord.
 * Deduplicates automatically and enforces bounds.
 */
export function addTagToLead(record: PersistedLeadRecord, tagInput: string): PersistedLeadRecord {
  const normalized = normalizeTag(tagInput);
  const currentTags = record.userMetadata.tags;

  if (currentTags.includes(normalized)) {
    return record; // Idempotent
  }

  if (currentTags.length >= METADATA_CONSTRAINTS.MAX_TAGS_COUNT) {
    throw new Error(`Cannot add tag: maximum limit of ${METADATA_CONSTRAINTS.MAX_TAGS_COUNT} tags reached`);
  }

  const updatedTags = [...currentTags, normalized];
  const now = new Date().toISOString();

  return Object.freeze({
    ...record,
    userMetadata: {
      ...record.userMetadata,
      tags: updatedTags
    },
    auditMetadata: {
      ...record.auditMetadata,
      updatedAt: now,
      version: record.auditMetadata.version + 1
    }
  });
}

/**
 * Safely removes a tag from a PersistedLeadRecord.
 */
export function removeTagFromLead(record: PersistedLeadRecord, tagToRemove: string): PersistedLeadRecord {
  const target = tagToRemove.trim().toLowerCase();
  const currentTags = record.userMetadata.tags;

  if (!currentTags.includes(target)) {
    return record; // Idempotent
  }

  const updatedTags = currentTags.filter(t => t !== target);
  const now = new Date().toISOString();

  return Object.freeze({
    ...record,
    userMetadata: {
      ...record.userMetadata,
      tags: updatedTags
    },
    auditMetadata: {
      ...record.auditMetadata,
      updatedAt: now,
      version: record.auditMetadata.version + 1
    }
  });
}
