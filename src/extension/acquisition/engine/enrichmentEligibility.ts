/**
 * LeadNoria — Google Maps Candidate Enrichment Eligibility & Target Validator (Part 6)
 *
 * Enforces strict, conservative eligibility checks prior to website crawler invocation:
 * - Only candidates with website.availability === 'PRESENT' are eligible.
 * - UNKNOWN, ABSENT, AMBIGUOUS, UNSUPPORTED candidates are explicitly skipped.
 * - Zero website discovery: missing websites are NEVER searched or guessed.
 * - Target URL is strictly validated using existing urlSafety.ts SSRF defenses.
 * - Rejects loopback, private networks, cloud metadata, forbidden schemes, and internal TLDs.
 * - Detects and blocks conflicting website targets without arbitrary domain guessing.
 */

import type { SessionCandidate } from './candidateIdentityTypes.ts';
import type { CandidateEnrichmentStatus } from './enrichmentTypes.ts';
import { validateSafeWebUrl } from '../../websiteIntelligence/urlSafety.ts';

export interface WebsiteEligibilityResult {
  readonly isEligible: boolean;
  readonly status: CandidateEnrichmentStatus;
  readonly targetUrl?: string;
  readonly normalizedDomain?: string;
  readonly reason: string;
  readonly diagnosticCode?: string;
}

/**
 * Checks if a candidate is eligible for bounded website intelligence crawling.
 */
export function evaluateWebsiteEligibility(candidate: SessionCandidate): WebsiteEligibilityResult {
  const websiteField = candidate.websiteUrl;

  // 1. Availability check: MUST be explicitly PRESENT
  if (!websiteField) {
    return {
      isEligible: false,
      status: 'NOT_ELIGIBLE',
      reason: 'Candidate website field is undefined'
    };
  }

  const availability = websiteField.availability;

  if (availability === 'ABSENT') {
    return {
      isEligible: false,
      status: 'SKIPPED_NO_WEBSITE',
      reason: 'Candidate explicitly has no website (availability = ABSENT)'
    };
  }

  if (availability === 'UNKNOWN') {
    return {
      isEligible: false,
      status: 'NOT_ELIGIBLE',
      reason: 'Candidate website is unknown (availability = UNKNOWN). Website discovery is prohibited.'
    };
  }

  if (availability === 'AMBIGUOUS' || availability === 'UNSUPPORTED') {
    return {
      isEligible: false,
      status: 'SKIPPED_AMBIGUOUS_WEBSITE',
      reason: `Candidate website availability is ${availability}`
    };
  }

  if (availability !== 'PRESENT') {
    return {
      isEligible: false,
      status: 'NOT_ELIGIBLE',
      reason: `Unsupported website availability: ${availability}`
    };
  }

  // 2. Conflict check: Check for unresolved website field conflicts
  const hasWebsiteConflict = (candidate.fieldConflicts || []).some(
    fc => fc.fieldName === 'website' || fc.fieldName === 'websiteUrl'
  );

  const websiteEvidenceList = candidate.fieldEvidence?.websiteUrl || candidate.fieldEvidence?.website || [];
  const distinctTargets = new Set<string>();

  for (const ev of websiteEvidenceList) {
    if (ev.value && typeof ev.value === 'string' && ev.availability === 'PRESENT') {
      try {
        const parsed = new URL(ev.value.startsWith('http') ? ev.value : `https://${ev.value}`);
        const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
        distinctTargets.add(host);
      } catch {
        distinctTargets.add(ev.value.toLowerCase());
      }
    }
  }

  if (hasWebsiteConflict && distinctTargets.size > 1) {
    return {
      isEligible: false,
      status: 'BLOCKED_WEBSITE_CONFLICT',
      reason: `Candidate has unresolved conflicting website targets (${Array.from(distinctTargets).join(', ')}). Crawl blocked.`,
      diagnosticCode: 'WEBSITE_TARGET_CONFLICT'
    };
  }

  // 3. Raw target extraction
  const rawTarget = websiteField.parsedValue || websiteField.rawValue;
  if (!rawTarget || typeof rawTarget !== 'string' || !rawTarget.trim()) {
    return {
      isEligible: false,
      status: 'SKIPPED_NO_WEBSITE',
      reason: 'Candidate has PRESENT availability but empty website URL payload'
    };
  }

  const trimmed = rawTarget.trim();

  // 4. Reject Google internal / search URLs
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('google.com/maps') ||
    lower.includes('maps.google.com') ||
    lower.includes('google.com/search') ||
    lower.includes('goo.gl')
  ) {
    return {
      isEligible: false,
      status: 'BLOCKED',
      reason: 'Website target points to Google internal URL',
      diagnosticCode: 'WEBSITE_TARGET_INVALID'
    };
  }

  // 5. SSRF and Protocol Safety Validation via existing urlSafety.ts
  const safety = validateSafeWebUrl(trimmed);

  if (!safety.isSafe || !safety.normalizedUrl || !safety.parsedUrl) {
    const isSsrf = safety.reason?.includes('LOOPBACK') ||
                   safety.reason?.includes('PRIVATE_NETWORK') ||
                   safety.reason?.includes('INTERNAL_TLD') ||
                   safety.reason?.includes('IPV6_LOCAL');

    return {
      isEligible: false,
      status: 'BLOCKED',
      reason: `URL safety rejection: ${safety.reason || 'UNSAFE_URL'}`,
      diagnosticCode: isSsrf ? 'WEBSITE_SSRF_BLOCKED' : 'WEBSITE_TARGET_INVALID'
    };
  }

  const domain = safety.parsedUrl.hostname.toLowerCase().replace(/^www\./, '');

  return {
    isEligible: true,
    status: 'QUEUED',
    targetUrl: safety.normalizedUrl,
    normalizedDomain: domain,
    reason: 'Candidate website is PRESENT and safely validated'
  };
}
