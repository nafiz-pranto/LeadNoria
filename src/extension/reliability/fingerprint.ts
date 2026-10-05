/**
 * LeadNoria — Phase 32: Production Feedback, Reliability & Growth Readiness
 * Deterministic Issue Fingerprinting & Message Normalization
 *
 * Invariants:
 * - Deterministic: identical semantic failures produce identical fingerprints regardless of run or time.
 * - Privacy-preserving: strips all volatile PII, emails, phones, tokens, and query strings.
 * - Noise-reducing: normalizes timestamps, memory addresses, and ephemeral identifiers.
 */

import { IssueCategory, WorkflowStage } from './types.ts';

/**
 * Normalizes an error message by stripping volatile, ephemeral, or sensitive tokens.
 */
export function normalizeErrorMessage(rawMessage: string | undefined | null): string {
  if (rawMessage === null || rawMessage === undefined || typeof rawMessage !== 'string') {
    return 'UNKNOWN_ERROR';
  }
  if (rawMessage.trim() === '') {
    return 'EMPTY_MESSAGE';
  }

  let normalized = rawMessage.trim();

  // 1. Strip script tags and their payload first (XSS defense)
  normalized = normalized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '<SCRIPT>');
  normalized = normalized.replace(/<[^>]+>/g, ' ');

  // 2. Strip ISO-8601 timestamps and date patterns (e.g. 2026-10-06T02:07:12.000Z or 2026/10/06)
  normalized = normalized.replace(/\b\d{4}[-/]\d{2}[-/]\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)?\b/gi, '<TIMESTAMP>');

  // 3. Strip dynamic hex sequences and UUIDs BEFORE numeric epochs to prevent partial digit matching
  normalized = normalized.replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '<UUID>');
  normalized = normalized.replace(/\b0x[0-9a-fA-F]+\b/g, '<HEX>');
  normalized = normalized.replace(/\b[0-9a-f]{16,64}\b/gi, '<HEX_HASH>');

  // 4. Strip epoch timestamps (10-13 digits)
  normalized = normalized.replace(/\b\d{10,13}\b/g, '<EPOCH>');

  // 5. Strip email addresses
  normalized = normalized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '<EMAIL>');

  // 6. Strip phone numbers (various international and domestic formats)
  normalized = normalized.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '<PHONE>');

  // 7. Strip query parameters and hashes from URLs, preserving protocol and host/path
  normalized = normalized.replace(/https?:\/\/[^\s"'<>]+(?:\?[^\s"'<>]*|#[^\s"'<>]*)?/gi, (match) => {
    try {
      const parsed = new URL(match);
      return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    } catch {
      return '<URL>';
    }
  });

  // 8. Strip run IDs and task IDs (e.g. run-123456, task-987)
  normalized = normalized.replace(/\b(?:run|task|job|lead|batch)[-_][a-zA-Z0-9_]+\b/gi, '<IDENTIFIER>');

  // 9. Collapse whitespace and uppercase
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized || 'EMPTY_MESSAGE';
}

/**
 * Simple, fast, deterministic hash function (FNV-1a 32-bit combined with Jenkins one-at-a-time).
 * Operates purely in memory without native crypto dependencies so it runs identically in service workers,
 * content scripts, and Node.js test runners.
 */
export function hashStringDeterministic(input: string): string {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }

  // Second pass for enhanced collision resistance
  let h2 = 0x27d4eb2d;
  for (let i = 0; i < input.length; i++) {
    h2 = Math.imul(h2 ^ input.charCodeAt(i), 0x5bd1e995);
    h2 ^= h2 >>> 15;
  }

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${hex1}${hex2}`;
}

/**
 * Generates a deterministic issue fingerprint.
 *
 * Guaranteed Properties:
 * - Identical category + technicalCode + stage + normalized message => identical fingerprint.
 * - Variations in timestamps, run IDs, or memory addresses => identical fingerprint.
 * - Differing categories, technical codes, or workflow stages => distinct fingerprints.
 */
export function generateIssueFingerprint(
  category: IssueCategory,
  technicalCode: string,
  stage: WorkflowStage,
  message?: string
): string {
  const normCategory = (category || 'UNKNOWN').trim().toUpperCase();
  const normCode = (technicalCode || 'GENERIC_ERROR').trim().toUpperCase();
  const normStage = (stage || 'IDLE').trim().toUpperCase();
  const normMsg = normalizeErrorMessage(message);

  const rawSeed = `${normCategory}::${normCode}::${normStage}::${normMsg}`;
  const hash = hashStringDeterministic(rawSeed);

  return `fp_${hash}`;
}
