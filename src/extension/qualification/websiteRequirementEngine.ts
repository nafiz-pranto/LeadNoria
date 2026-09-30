/**
 * LeadNoria Website Requirement Engine (Phase 6)
 *
 * Implements deterministic website state classification and user intent evaluation
 * for WITH, WITHOUT, and BOTH modes according to strict evidence and policy rules.
 *
 * INVARIANTS:
 * 1. Missing website field is OBSERVED_NO_WEBSITE_POINTER, NOT proven absence.
 * 2. WEBSITE_NOT_FOUND in WITHOUT mode yields UNCERTAIN unless explicit proof of absence exists.
 * 3. HTTP 200 alone NEVER yields WEBSITE_VERIFIED_BUSINESS_SITE without corroborating evidence.
 * 4. Parked, non-business, or uncertain sites are NEVER qualified as WITHOUT.
 * 5. BOTH mode strictly unions valid WITH and valid WITHOUT leads without double-counting.
 */

import type {
  NormalizedCandidate
} from '../extraction/types.ts';
import type {
  WebsiteRequirement,
  WebsiteState,
  WebsiteEvidence,
  WebsiteEligibilityResult,
  UnavailableReasonCode
} from './types.ts';
import type {
  WebsiteVerificationRecord
} from '../types.ts';

/**
 * Determines granular UnavailableReasonCode from HTTP status or error codes.
 */
export function resolveUnavailableReason(
  httpStatus?: number,
  errorCode?: string
): UnavailableReasonCode {
  if (errorCode) {
    const err = errorCode.toUpperCase();
    if (err.includes('PAGE_TIMEOUT')) return 'PAGE_TIMEOUT';
    if (err.includes('DOMAIN_TIMEOUT')) return 'DOMAIN_TIMEOUT';
    if (err.includes('TIMEOUT')) return 'PAGE_TIMEOUT';
    if (err.includes('DNS')) return 'DNS_FAILURE';
    if (err.includes('NETWORK')) return 'NETWORK_ERROR';
    if (err.includes('REDIRECT')) return 'REDIRECT_ERROR';
  }

  if (httpStatus) {
    if (httpStatus === 403) return 'HTTP_403';
    if (httpStatus === 404) return 'HTTP_404';
    if (httpStatus === 429) return 'HTTP_429';
    if (httpStatus === 408) return 'PAGE_TIMEOUT';
    if (httpStatus >= 500 && httpStatus <= 599) return 'HTTP_5XX';
  }

  return 'UNKNOWN';
}

/**
 * Bridges existing LeadNoria WebsiteVerificationRecord into Phase 6 WebsiteEvidence.
 */
export function adaptVerificationRecordToEvidence(
  record: WebsiteVerificationRecord,
  candidate: NormalizedCandidate
): WebsiteEvidence {
  let verificationState: WebsiteState = 'WEBSITE_UNCERTAIN';
  let unavailableReason: UnavailableReasonCode | undefined = undefined;

  const isParked = record.negativeSignals?.some(
    s => s === 'PARKED_DOMAIN' || s === 'DOMAIN_FOR_SALE'
  ) || false;

  const isNonBusiness = record.status === 'NOT_A_BUSINESS_SITE' ||
    record.negativeSignals?.some(
      s => s === 'GENERIC_DIRECTORY' || s === 'JOB_PORTAL' || s === 'PERSONAL_BLOG' || s === 'NEWS_ONLY'
    ) || false;

  if (isParked) {
    verificationState = 'WEBSITE_PARKED';
  } else if (isNonBusiness) {
    verificationState = 'WEBSITE_NON_BUSINESS';
  } else if (record.status === 'VERIFIED_BUSINESS_WEBSITE') {
    verificationState = 'WEBSITE_VERIFIED_BUSINESS_SITE';
  } else if (record.status === 'BLOCKED') {
    verificationState = 'WEBSITE_UNAVAILABLE';
    unavailableReason = 'HTTP_403';
  } else if (record.status === 'INVALID') {
    verificationState = 'WEBSITE_INVALID';
  } else if (record.errorCode || (record.durationMs >= 10000 && record.pagesVisited.length === 0)) {
    verificationState = 'WEBSITE_UNAVAILABLE';
    unavailableReason = resolveUnavailableReason(undefined, record.errorCode || 'PAGE_TIMEOUT');
  } else {
    verificationState = 'WEBSITE_UNCERTAIN';
  }

  const phoneSignal = record.contactSignals?.find(s => s.type === 'phone');
  const emailSignal = record.contactSignals?.find(s => s.type === 'email');
  const addressSignal = record.contactSignals?.find(s => s.type === 'address' || s.type === 'city');

  const hasNameMatch = record.identityMatch === 'STRONG' || record.identityMatch === 'MODERATE';

  return {
    websiteUrl: record.originalUrl || candidate.websiteUrl?.value?.originalUrl || '',
    normalizedUrl: record.normalizedUrl || candidate.websiteUrl?.value?.normalizedUrl || '',
    canonicalOrigin: record.finalOrigin || candidate.websiteUrl?.value?.canonicalOrigin || '',
    canonicalDomain: record.hostname || candidate.websiteUrl?.value?.canonicalDomain || '',
    verificationState,
    unavailableReason,
    httpStatus: record.status === 'VERIFIED_BUSINESS_WEBSITE' ? 200 : undefined,
    redirectChain: record.finalUrl && record.originalUrl && record.finalUrl !== record.originalUrl
      ? [record.originalUrl, record.finalUrl]
      : [record.originalUrl || ''],
    pagesVisited: record.pagesVisited || [],
    sameOrigin: true,
    businessNameEvidence: {
      matched: hasNameMatch,
      score: record.identityMatch === 'STRONG' ? 0.95 : (record.identityMatch === 'MODERATE' ? 0.7 : 0.1),
      evidenceSnippet: record.identityMatch === 'STRONG' ? `Strong brand match for ${record.canonicalName}` : undefined
    },
    addressEvidence: {
      matched: Boolean(addressSignal),
      localityMatched: true,
      evidenceSnippet: addressSignal?.value
    },
    phoneEvidence: {
      matched: Boolean(phoneSignal),
      matchedPhone: phoneSignal?.value
    },
    emailEvidence: {
      matched: Boolean(emailSignal),
      matchedEmail: emailSignal?.value
    },
    brandEvidence: {
      matched: hasNameMatch,
      matchedValue: record.canonicalName
    },
    serviceEvidence: {
      matched: (record.commercialSignals?.length || 0) > 0,
      keywords: record.commercialSignals as unknown as string[]
    },
    aboutEvidence: {
      matched: record.pagesVisited?.some(p => p.toLowerCase().includes('about')) || false
    },
    contactEvidence: {
      matched: Boolean(phoneSignal || emailSignal || addressSignal),
      formPresent: record.contactSignals?.some(s => s.type === 'contactPage') || false
    },
    parkingEvidence: {
      isParked
    },
    nonBusinessEvidence: {
      isNonBusiness
    },
    capturedAt: record.verifiedAt || new Date().toISOString(),
    policyStatus: 'TARGET_SITE_RULES_APPLY',
    sourceContributions: [{
      source: 'USER_PROVIDED_DOMAIN',
      provenance: 'WEBSITE_DERIVED',
      fieldName: 'websiteEvidence',
      acquisitionContext: 'WEBSITE_DIRECT',
      restrictionBasis: 'TARGET_SITE_RULES',
      isRestricted: false,
      policyStatus: 'TARGET_SITE_RULES_APPLY',
      persistenceStatus: 'PERSISTABLE',
      exportStatus: 'EXPORTABLE'
    }],
    derivedFrom: []
  };
}

/**
 * Determines the deterministic WebsiteState from candidate data and optional WebsiteEvidence.
 */
export function determineWebsiteState(
  candidate: NormalizedCandidate,
  evidence?: WebsiteEvidence
): WebsiteState {
  const urlEnvelope = candidate.websiteUrl;
  const rawUrl = urlEnvelope?.value?.normalizedUrl || urlEnvelope?.value?.originalUrl || '';

  // 1. If candidate has no website pointer
  if (!rawUrl || rawUrl.trim() === '') {
    return 'WEBSITE_NOT_FOUND';
  }

  // 2. Validate URL structure
  if (urlEnvelope?.value && !urlEnvelope.value.isValid) {
    return 'WEBSITE_INVALID';
  }

  // 3. If explicit verification evidence is supplied
  if (evidence) {
    // Check parking indicators
    if (evidence.parkingEvidence?.isParked) {
      return 'WEBSITE_PARKED';
    }

    // Check non-business destination indicators
    if (evidence.nonBusinessEvidence?.isNonBusiness) {
      return 'WEBSITE_NON_BUSINESS';
    }

    // Check unreachable/timeout/status failure
    if (
      (evidence.httpStatus && (evidence.httpStatus < 200 || evidence.httpStatus >= 400)) ||
      evidence.verificationState === 'WEBSITE_UNAVAILABLE'
    ) {
      if (!evidence.unavailableReason) {
        evidence.unavailableReason = resolveUnavailableReason(evidence.httpStatus);
      }
      return 'WEBSITE_UNAVAILABLE';
    }

    // Check if verification state explicitly marked
    if (evidence.verificationState === 'WEBSITE_INVALID') {
      return 'WEBSITE_INVALID';
    }

    // Corroborate identity: Business name, address, phone, email, brand, service
    const hasNameMatch = Boolean(evidence.businessNameEvidence?.matched);
    const hasBrandMatch = Boolean(evidence.brandEvidence?.matched);
    const hasPhoneMatch = Boolean(evidence.phoneEvidence?.matched);
    const hasEmailMatch = Boolean(evidence.emailEvidence?.matched);
    const hasAddressMatch = Boolean(evidence.addressEvidence?.matched);
    const hasServiceMatch = Boolean(evidence.serviceEvidence?.matched);

    const positiveMatches = [
      hasNameMatch,
      hasBrandMatch,
      hasPhoneMatch,
      hasEmailMatch,
      hasAddressMatch,
      hasServiceMatch
    ].filter(Boolean).length;

    // HTTP 200 alone is NOT enough for verified business site.
    // Must have at least 1 corroborating signal (name, brand, phone, email, or address)
    if (hasNameMatch || hasBrandMatch || (hasPhoneMatch && (hasServiceMatch || hasAddressMatch))) {
      return 'WEBSITE_VERIFIED_BUSINESS_SITE';
    }

    if (positiveMatches > 0) {
      // Partial or weak match -> UNCERTAIN
      return 'WEBSITE_UNCERTAIN';
    }

    // HTTP 200 with zero corroboration -> UNCERTAIN
    return 'WEBSITE_UNCERTAIN';
  }

  // 4. Default if URL exists but no deep verification evidence provided yet
  return 'WEBSITE_PRESENT';
}

/**
 * Evaluates whether a candidate satisfies the requested WebsiteRequirement.
 */
export function evaluateWebsiteRequirement(
  requirement: WebsiteRequirement,
  websiteState: WebsiteState,
  explicitNoWebsiteEvidence?: { hasConfirmedAbsence: boolean; evidenceSnippet: string }
): WebsiteEligibilityResult {
  switch (requirement) {
    case 'WITH': {
      if (websiteState === 'WEBSITE_VERIFIED_BUSINESS_SITE') {
        return {
          isEligible: true,
          state: websiteState,
          reason: 'Verified business website confirmed with corroborating identity signals.',
          reasonCode: 'QUALIFIED_RELEVANT_WITH_VERIFIED_WEBSITE'
        };
      }
      if (websiteState === 'WEBSITE_PRESENT') {
        // CRITICAL CORRECTION: WEBSITE_PRESENT is an unverified pointer, NOT a verified business website!
        return {
          isEligible: false,
          state: websiteState,
          reason: 'Website pointer is present but independent business verification has not established identity or ownership.',
          reasonCode: 'UNCERTAIN_WEBSITE_VERIFICATION'
        };
      }
      if (websiteState === 'WEBSITE_PARKED') {
        return {
          isEligible: false,
          state: websiteState,
          reason: 'Domain is parked, for sale, or a placeholder.',
          reasonCode: 'DISQUALIFIED_PARKED_DOMAIN'
        };
      }
      if (websiteState === 'WEBSITE_NON_BUSINESS') {
        return {
          isEligible: false,
          state: websiteState,
          reason: 'URL resolves to a non-business profile or generic directory.',
          reasonCode: 'DISQUALIFIED_NON_BUSINESS'
        };
      }
      if (websiteState === 'WEBSITE_UNAVAILABLE') {
        return {
          isEligible: false,
          state: websiteState,
          reason: 'Website is currently unavailable, timed out, or blocked.',
          reasonCode: 'UNCERTAIN_WEBSITE_VERIFICATION'
        };
      }
      if (websiteState === 'WEBSITE_UNCERTAIN') {
        return {
          isEligible: false,
          state: websiteState,
          reason: 'Website verification is inconclusive or lacks sufficient corroboration.',
          reasonCode: 'UNCERTAIN_WEBSITE_VERIFICATION'
        };
      }
      if (websiteState === 'WEBSITE_UNKNOWN') {
        return {
          isEligible: false,
          state: websiteState,
          reason: 'Website status is unknown.',
          reasonCode: 'UNCERTAIN_WEBSITE_VERIFICATION'
        };
      }
      if (websiteState === 'WEBSITE_INVALID') {
        return {
          isEligible: false,
          state: websiteState,
          reason: 'Website URL is invalid or malformed.',
          reasonCode: 'DISQUALIFIED_WEBSITE_REQUIREMENT'
        };
      }
      // WEBSITE_NOT_FOUND
      return {
        isEligible: false,
        state: websiteState,
        reason: 'No website URL available for candidate under WITH requirement.',
        reasonCode: 'DISQUALIFIED_WEBSITE_REQUIREMENT'
      };
    }

    case 'WITHOUT': {
      // If website URL exists or is verified, definitely not eligible for WITHOUT
      if (
        websiteState === 'WEBSITE_VERIFIED_BUSINESS_SITE' ||
        websiteState === 'WEBSITE_PRESENT'
      ) {
        return {
          isEligible: false,
          state: websiteState,
          reason: 'Business has an active website, failing WITHOUT requirement.',
          reasonCode: 'DISQUALIFIED_WEBSITE_REQUIREMENT'
        };
      }

      // Parked or non-business cannot be claimed as "WITHOUT"
      if (websiteState === 'WEBSITE_PARKED' || websiteState === 'WEBSITE_NON_BUSINESS') {
        return {
          isEligible: false,
          state: websiteState,
          reason: 'Parked or non-business destination does not constitute confirmed absence of website.',
          reasonCode: 'UNCERTAIN_WEBSITE_VERIFICATION'
        };
      }

      // If website is unavailable or uncertain, cannot claim proven absence
      if (websiteState === 'WEBSITE_UNAVAILABLE' || websiteState === 'WEBSITE_UNCERTAIN') {
        return {
          isEligible: false,
          state: websiteState,
          reason: 'Website is unreachable or uncertain, which is not proof that business lacks a website.',
          reasonCode: 'UNCERTAIN_WEBSITE_VERIFICATION'
        };
      }

      // Candidate has no website pointer (WEBSITE_NOT_FOUND)
      if (websiteState === 'WEBSITE_NOT_FOUND') {
        if (explicitNoWebsiteEvidence && explicitNoWebsiteEvidence.hasConfirmedAbsence) {
          return {
            isEligible: true,
            state: websiteState,
            reason: `Verified absence of business website: ${explicitNoWebsiteEvidence.evidenceSnippet}`,
            reasonCode: 'QUALIFIED_WITHOUT_WEBSITE'
          };
        }

        // CRITICAL SAFETY RULE: Missing pointer != confirmed absence.
        return {
          isEligible: false,
          state: websiteState,
          reason: 'No website URL observed, but absence cannot be definitively established without independent proof.',
          reasonCode: 'UNCERTAIN_WEBSITE_NOT_FOUND'
        };
      }

      return {
        isEligible: false,
        state: websiteState,
        reason: 'Website state is unknown.',
        reasonCode: 'UNCERTAIN_WEBSITE_NOT_FOUND'
      };
    }

    case 'BOTH': {
      // Evaluate for WITH eligibility first
      const withEval = evaluateWebsiteRequirement('WITH', websiteState, explicitNoWebsiteEvidence);
      if (withEval.isEligible) {
        return withEval;
      }

      // Evaluate for WITHOUT eligibility
      const withoutEval = evaluateWebsiteRequirement('WITHOUT', websiteState, explicitNoWebsiteEvidence);
      if (withoutEval.isEligible) {
        return withoutEval;
      }

      // If neither is eligible, return the specific uncertainty or disqualification
      if (websiteState === 'WEBSITE_PARKED') {
        return {
          isEligible: false,
          state: websiteState,
          reason: 'Domain is parked, for sale, or a placeholder.',
          reasonCode: 'DISQUALIFIED_PARKED_DOMAIN'
        };
      }
      if (websiteState === 'WEBSITE_NON_BUSINESS') {
        return {
          isEligible: false,
          state: websiteState,
          reason: 'URL resolves to a non-business profile or generic directory.',
          reasonCode: 'DISQUALIFIED_NON_BUSINESS'
        };
      }
      if (websiteState === 'WEBSITE_NOT_FOUND') {
        return {
          isEligible: false,
          state: websiteState,
          reason: 'No website URL observed, and absence cannot be verified.',
          reasonCode: 'UNCERTAIN_WEBSITE_NOT_FOUND'
        };
      }
      if (websiteState === 'WEBSITE_PRESENT') {
        return {
          isEligible: false,
          state: websiteState,
          reason: 'Website pointer is present but unverified; requires independent business verification to qualify for WITH, and cannot qualify for WITHOUT.',
          reasonCode: 'UNCERTAIN_WEBSITE_VERIFICATION'
        };
      }

      return {
        isEligible: false,
        state: websiteState,
        reason: 'Website status is uncertain or verification is incomplete.',
        reasonCode: 'UNCERTAIN_WEBSITE_VERIFICATION'
      };
    }
  }
}
