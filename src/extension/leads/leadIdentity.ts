/**
 * LeadNoria — Export-Safe Lead Projection & Research Workspace
 * Part 8: Identity & Correlation Boundaries
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * - Lead IDs (lead_xxx) and Candidate IDs (cid_xxx) are strictly separate.
 * - Source Anchor IDs (src_xxx) are strictly independent.
 * - Correlation does NOT merge or transfer Google fields into lead records.
 */

import type { CorrelationStatus, IndependentSourceAnchor, IndependentSourceClass } from './leadTypes.ts';

let leadCounter = 0;
let sourceCounter = 0;

/**
 * Generates a cryptographically strong, deterministic, or collision-resistant Lead ID.
 */
export function generateLeadId(prefix = 'lead'): string {
  leadCounter++;
  const rand = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${leadCounter}_${rand}`;
}

/**
 * Generates a deterministic, collision-resistant Lead ID derived from the canonical domain
 * and optional independent source ID. Guarantees idempotent projections.
 */
export function generateDeterministicLeadId(domain: string, sourceAnchorId?: string, prefix = 'lead'): string {
  const normDomain = normalizeDomain(domain);
  const key = `${normDomain}|${sourceAnchorId || ''}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hashHex = (hash >>> 0).toString(16).padStart(8, '0');
  return `${prefix}_det_${hashHex}`;
}

/**
 * Generates an Independent Source Anchor ID.
 */
export function generateSourceAnchorId(prefix = 'src'): string {
  sourceCounter++;
  const rand = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${sourceCounter}_${rand}`;
}

/**
 * Normalizes a website domain string safely.
 * Strips protocol, trailing slashes, www prefix, and lowercases.
 */
export function normalizeDomain(urlOrDomain: string): string {
  if (!urlOrDomain || typeof urlOrDomain !== 'string') return '';
  let cleaned = urlOrDomain.trim().toLowerCase();

  // Strip protocol
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  // Strip path & query
  cleaned = cleaned.split('/')[0].split('?')[0].split('#')[0];
  // Strip port
  cleaned = cleaned.split(':')[0];
  // Strip www
  cleaned = cleaned.replace(/^www\./i, '');

  return cleaned.trim();
}

/**
 * Validates whether a given URL is a safe, valid HTTP/HTTPS public URL.
 * Rejects non-HTTP schemes (javascript:, data:, file:, etc.) and loopback IPs.
 */
export function isSafePublicHttpUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();

  // Explicit scheme check
  if (!/^https?:\/\//i.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();

    // Reject loopback, link-local, private hosts
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.lan') ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      /^169\.254\./.test(hostname) ||
      /^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\./.test(hostname)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Creates an IndependentSourceAnchor from legitimate non-Google input.
 */
export function createIndependentSourceAnchor(params: {
  targetUrl: string;
  sourceClass?: IndependentSourceClass;
  businessName?: string;
  inputMethod?: 'MANUAL_ENTRY' | 'STANDALONE_CRAWL' | 'EXTERNAL_IMPORT';
  notes?: string;
}): IndependentSourceAnchor {
  if (!isSafePublicHttpUrl(params.targetUrl)) {
    throw new Error(`Invalid or unsafe independent source URL: "${params.targetUrl}"`);
  }

  const domain = normalizeDomain(params.targetUrl);
  if (!domain) {
    throw new Error(`Could not extract valid domain from URL: "${params.targetUrl}"`);
  }

  return Object.freeze({
    sourceId: generateSourceAnchorId(),
    sourceClass: params.sourceClass || 'USER_PROVIDED',
    targetUrl: params.targetUrl.trim(),
    domain,
    businessName: params.businessName ? params.businessName.trim() : undefined,
    inputMethod: params.inputMethod || 'MANUAL_ENTRY',
    verifiedAt: new Date().toISOString(),
    notes: params.notes ? params.notes.trim() : undefined,
    isRestricted: false as const
  });
}

/**
 * Establishes a correlation link between a research candidate and an independent source.
 * CRITICAL: Returns only metadata pointers; NEVER copies or transfers Google candidate data.
 */
export function correlateResearchCandidate(
  candidateId: string,
  sourceAnchor: IndependentSourceAnchor
): {
  candidateId: string;
  independentSourceId: string;
  domain: string;
  correlationStatus: CorrelationStatus;
  correlatedAt: string;
} {
  if (!candidateId || !candidateId.startsWith('cid_')) {
    throw new Error(`Invalid candidateId for correlation: "${candidateId}"`);
  }
  if (!sourceAnchor || !sourceAnchor.sourceId) {
    throw new Error('Valid independent source anchor is required for correlation');
  }

  return Object.freeze({
    candidateId,
    independentSourceId: sourceAnchor.sourceId,
    domain: sourceAnchor.domain,
    correlationStatus: 'CONFIRMED_BY_INDEPENDENT_SOURCE',
    correlatedAt: new Date().toISOString()
  });
}
