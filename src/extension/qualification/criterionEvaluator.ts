/**
 * Deterministic Criterion Evaluator (Phase 12)
 *
 * Implements type-safe five-valued logic (PASS, FAIL, UNKNOWN, CONTRADICTORY, BLOCKED),
 * operator execution, missing/unknown policy enforcement, and field-level evidence binding.
 */

import type {
  QualificationCriterion,
  CandidateEvaluationContext,
  CriterionEvaluationResult,
  CriterionOutcome,
  MissingDataPolicy,
  UnknownDataPolicy,
  ConflictPolicy
} from './qualificationTypes.ts';
import { checkQualificationEligibility } from './qualificationFirewall.ts';

/**
 * Safely evaluates a binary comparison operator on primitive values or sets.
 */
function evaluateOperator(
  operator: string,
  actual: any,
  expected: any
): boolean {
  switch (operator) {
    case 'EQUALS':
      return actual === expected || String(actual).toLowerCase() === String(expected).toLowerCase();

    case 'NOT_EQUALS':
      return actual !== expected && String(actual).toLowerCase() !== String(expected).toLowerCase();

    case 'IN':
      if (Array.isArray(expected)) {
        return expected.some(exp => exp === actual || String(exp).toLowerCase() === String(actual).toLowerCase());
      }
      return false;

    case 'NOT_IN':
      if (Array.isArray(expected)) {
        return !expected.some(exp => exp === actual || String(exp).toLowerCase() === String(actual).toLowerCase());
      }
      return true;

    case 'CONTAINS':
      if (typeof actual === 'string' && typeof expected === 'string') {
        return actual.toLowerCase().includes(expected.toLowerCase());
      }
      if (Array.isArray(actual)) {
        return actual.some(item => item === expected || String(item).toLowerCase() === String(expected).toLowerCase());
      }
      return false;

    case 'NOT_CONTAINS':
      if (typeof actual === 'string' && typeof expected === 'string') {
        return !actual.toLowerCase().includes(expected.toLowerCase());
      }
      if (Array.isArray(actual)) {
        return !actual.some(item => item === expected || String(item).toLowerCase() === String(expected).toLowerCase());
      }
      return true;

    case 'MATCHES':
      if (typeof actual === 'string' && typeof expected === 'string') {
        try {
          const reg = new RegExp(expected, 'i');
          return reg.test(actual);
        } catch {
          return false;
        }
      }
      return false;

    case 'EXISTS':
      return actual !== undefined && actual !== null && actual !== false && actual !== '' && (!Array.isArray(actual) || actual.length > 0);

    case 'NOT_EXISTS':
      return actual === undefined || actual === null || actual === '' || (Array.isArray(actual) && actual.length === 0);

    case 'COUNT_AT_LEAST':
      if (Array.isArray(actual)) {
        return actual.length >= Number(expected);
      }
      if (typeof actual === 'number') {
        return actual >= Number(expected);
      }
      return false;

    case 'COUNT_AT_MOST':
      if (Array.isArray(actual)) {
        return actual.length <= Number(expected);
      }
      if (typeof actual === 'number') {
        return actual <= Number(expected);
      }
      return false;

    case 'THRESHOLD_AT_LEAST':
      return Number(actual) >= Number(expected);

    case 'THRESHOLD_AT_MOST':
      return Number(actual) <= Number(expected);

    case 'ANY':
      if (Array.isArray(actual) && Array.isArray(expected)) {
        return actual.some(a => expected.includes(a));
      }
      return false;

    case 'ALL':
      if (Array.isArray(actual) && Array.isArray(expected)) {
        return expected.every(e => actual.includes(e));
      }
      return false;

    case 'NONE':
      if (Array.isArray(actual) && Array.isArray(expected)) {
        return !actual.some(a => expected.includes(a));
      }
      return true;

    default:
      return false;
  }
}

/**
 * Evaluates a single qualification criterion against the candidate context.
 */
export function evaluateCriterion(
  criterion: QualificationCriterion,
  context: CandidateEvaluationContext,
  policies: {
    missingDataPolicy: MissingDataPolicy;
    unknownDataPolicy: UnknownDataPolicy;
    conflictPolicy: ConflictPolicy;
  }
): CriterionEvaluationResult {
  const weight = criterion.weight ?? (criterion.mandatory ? 10 : 5);
  const evidence: any[] = [];
  let actualValue: any = undefined;
  let isMissing = false;
  let isContradictory = false;
  let contradictionReason = '';
  let reasonCode = '';
  let explanation = '';

  // 1. Extract target value & evidence according to CriterionType
  switch (criterion.type) {
    case 'RELEVANCE': {
      actualValue = context.relevanceResult?.relevanceState;
      if (!actualValue) {
        isMissing = true;
      } else {
        if (context.relevanceResult?.evidenceItems) {
          evidence.push(...context.relevanceResult.evidenceItems);
        }
      }
      break;
    }

    case 'WEBSITE_STATUS': {
      actualValue =
        context.websiteState ||
        context.mapsVerificationResult?.websiteState ||
        (context.normalizedCandidate?.verificationPlaceholder?.verificationStatus as any);
      if (!actualValue) {
        isMissing = true;
      } else {
        if (context.websiteEvidence) {
          evidence.push(...context.websiteEvidence);
        }
        if (context.mapsVerificationResult?.verificationEvidence) {
          evidence.push(...context.mapsVerificationResult.verificationEvidence);
        }
      }
      break;
    }

    case 'BUSINESS_IDENTITY': {
      const biConflict = context.businessIntelligence?.identity.canonicalBusinessName.state === 'CONTRADICTORY';
      const isConflict =
        biConflict ||
        context.resolvedEntityGroup?.resolutionStatus === 'CONFLICTING_IDENTITY' ||
        (context.resolvedEntityGroup as any)?.relationshipType === 'CONFLICTING_IDENTITY' ||
        (context.resolvedEntityGroup?.identityConflicts && context.resolvedEntityGroup.identityConflicts.length > 0) ||
        context.contactEnrichment?.diagnostics?.warnings?.some(w => w.includes('conflicts with candidate name'));
      
      if (isConflict) {
        isContradictory = true;
        contradictionReason = 'Business identity contradiction detected across source records';
      }
      actualValue = isConflict ? 'CONTRADICTION' : (context.businessIntelligence?.identity.canonicalBusinessName.value || context.canonicalDisplayName || context.normalizedCandidate?.businessName?.value?.displayName);
      if (!actualValue) isMissing = true;
      if (context.businessIntelligence?.identity.canonicalBusinessName.sourceContributions) {
        evidence.push(...context.businessIntelligence.identity.canonicalBusinessName.sourceContributions);
      }
      break;
    }

    case 'HAS_BUSINESS_PHONE': {
      if (context.businessIntelligence?.contactPresence.publicPhonePresent.state === 'CONTRADICTORY') {
        isContradictory = true;
        contradictionReason = 'Conflicting phone numbers observed across distinct sources';
      }
      const enrichmentPhones = context.contactEnrichment?.phones || [];
      const candidatePhones = context.normalizedCandidate?.phones || [];
      const biPhones = context.businessIntelligence?.contactPresence.publicPhonePresent.value ? [context.businessIntelligence.contactPresence.publicPhonePresent.value] : [];
      const hasPhones = enrichmentPhones.length > 0 || candidatePhones.length > 0 || biPhones.length > 0;
      actualValue = enrichmentPhones.length > 0 ? enrichmentPhones : (candidatePhones.length > 0 ? candidatePhones : biPhones);
      if (!hasPhones) {
        isMissing = true;
      } else {
        for (const p of enrichmentPhones) {
          if (p.evidence) evidence.push(...p.evidence);
        }
        for (const cp of candidatePhones) {
          if (cp.sourceContributions) evidence.push(...cp.sourceContributions);
        }
        if (context.businessIntelligence?.contactPresence.publicPhonePresent.sourceContributions) {
          evidence.push(...context.businessIntelligence.contactPresence.publicPhonePresent.sourceContributions);
        }
      }
      break;
    }

    case 'HAS_BUSINESS_EMAIL': {
      if (context.businessIntelligence?.contactPresence.publicEmailPresent.state === 'CONTRADICTORY') {
        isContradictory = true;
        contradictionReason = 'Conflicting email records observed across sources';
      }
      const enrichmentEmails = context.contactEnrichment?.emails || [];
      const candidateEmails = context.normalizedCandidate?.emails || [];
      const biEmails = context.businessIntelligence?.contactPresence.publicEmailPresent.value ? [context.businessIntelligence.contactPresence.publicEmailPresent.value] : [];
      const hasEmails = enrichmentEmails.length > 0 || candidateEmails.length > 0 || biEmails.length > 0;
      actualValue = enrichmentEmails.length > 0 ? enrichmentEmails : (candidateEmails.length > 0 ? candidateEmails : biEmails);
      if (!hasEmails) {
        isMissing = true;
      } else {
        for (const e of enrichmentEmails) {
          if (e.evidence) evidence.push(...e.evidence);
        }
        for (const ce of candidateEmails) {
          if (ce.sourceContributions) evidence.push(...ce.sourceContributions);
        }
        if (context.businessIntelligence?.contactPresence.publicEmailPresent.sourceContributions) {
          evidence.push(...context.businessIntelligence.contactPresence.publicEmailPresent.sourceContributions);
        }
      }
      break;
    }

    case 'HAS_BUSINESS_ADDRESS': {
      if (context.businessIntelligence?.location.address.state === 'CONTRADICTORY') {
        isContradictory = true;
        contradictionReason = 'Address conflict detected across distinct sources';
      }
      const enrichmentAddresses = context.contactEnrichment?.addresses || [];
      const candidateAddress = context.normalizedCandidate?.address ? [context.normalizedCandidate.address] : [];
      const biAddress = context.businessIntelligence?.location.address.value ? [context.businessIntelligence.location.address.value] : [];
      const hasAddresses = enrichmentAddresses.length > 0 || candidateAddress.length > 0 || biAddress.length > 0;
      actualValue = enrichmentAddresses.length > 0 ? enrichmentAddresses : (candidateAddress.length > 0 ? candidateAddress : biAddress);
      if (!hasAddresses) {
        isMissing = true;
      } else {
        for (const a of enrichmentAddresses) {
          if (a.evidence) evidence.push(...a.evidence);
        }
        for (const ca of candidateAddress) {
          if (ca.sourceContributions) evidence.push(...ca.sourceContributions);
        }
        if (context.businessIntelligence?.location.address.sourceContributions) {
          evidence.push(...context.businessIntelligence.location.address.sourceContributions);
        }
      }
      break;
    }

    case 'HAS_CONTACT_FORM': {
      const forms = context.contactEnrichment?.contactForms || [];
      const biForm = context.businessIntelligence?.digitalPresence.contactFormPresent.value;
      actualValue = forms.some(f => f.present) || (biForm === true ? true : undefined);
      if (forms.length === 0 && biForm === undefined) {
        isMissing = true;
      } else {
        for (const f of forms) {
          if (f.evidence) evidence.push(...f.evidence);
        }
        if (context.businessIntelligence?.digitalPresence.contactFormPresent.sourceContributions) {
          evidence.push(...context.businessIntelligence.digitalPresence.contactFormPresent.sourceContributions);
        }
      }
      break;
    }

    case 'HAS_SOCIAL_PROFILE': {
      const socials = context.contactEnrichment?.socialProfiles || [];
      const biSocials = context.businessIntelligence?.digitalPresence.socialPresence.value || [];
      actualValue = socials.length > 0 ? socials.map(s => s.platform) : (biSocials.length > 0 ? biSocials : undefined);
      if (socials.length === 0 && biSocials.length === 0) {
        isMissing = true;
      } else {
        for (const s of socials) {
          if (s.evidence) evidence.push(...s.evidence);
        }
        if (context.businessIntelligence?.digitalPresence.socialPresence.sourceContributions) {
          evidence.push(...context.businessIntelligence.digitalPresence.socialPresence.sourceContributions);
        }
      }
      break;
    }

    case 'LOCATION_MATCH': {
      const country =
        context.businessIntelligence?.location.country.value ||
        context.normalizedCandidate?.address?.value?.countryCode ||
        context.normalizedCandidate?.location?.value?.countryCode ||
        context.contactEnrichment?.addresses?.[0]?.country;
      const city =
        context.businessIntelligence?.location.city.value ||
        context.normalizedCandidate?.address?.value?.locality ||
        context.normalizedCandidate?.location?.value?.city ||
        context.contactEnrichment?.addresses?.[0]?.city;

      actualValue = { country, city };
      if (!country && !city) {
        isMissing = true;
      }
      break;
    }

    case 'CATEGORY_MATCH': {
      actualValue =
        context.businessIntelligence?.identity.primaryCategory.value ||
        context.normalizedCandidate?.categories?.[0]?.value?.normalizedCategory ||
        (context.normalizedCandidate as any)?.category?.normalizedCategory ||
        (context.normalizedCandidate as any)?.category ||
        context.relevanceResult?.evidenceItems?.find(e => e.evidenceType === 'CATEGORY_EVIDENCE')?.observedValue;
      if (!actualValue) isMissing = true;
      break;
    }

    case 'NAME_MATCH': {
      if (context.businessIntelligence?.identity.canonicalBusinessName.state === 'CONTRADICTORY') {
        isContradictory = true;
        contradictionReason = 'Conflicting business names observed across distinct sources';
      }
      actualValue =
        context.businessIntelligence?.identity.canonicalBusinessName.value ||
        context.canonicalDisplayName ||
        context.normalizedCandidate?.businessName?.value?.displayName ||
        context.contactEnrichment?.businessName?.normalizedName;
      if (!actualValue) isMissing = true;
      break;
    }

    case 'NEGATIVE_EVIDENCE': {
      const hasNegativeRelevance = context.relevanceResult?.relevanceState === 'NOT_RELEVANT';
      const hasNegativeWeb =
        context.websiteState === 'WEBSITE_NON_BUSINESS' ||
        context.websiteState === 'WEBSITE_PARKED';
      actualValue = hasNegativeRelevance || hasNegativeWeb;
      break;
    }

    case 'SOURCE_EVIDENCE_REQUIREMENT': {
      const allContribs = [
        ...(context.sourceContributions || []),
        ...(context.contactEnrichment?.sourceContributions || [])
      ];
      actualValue = allContribs.map(c => c.provenance);
      if (allContribs.length === 0) isMissing = true;
      break;
    }

    case 'COMPLETENESS_THRESHOLD': {
      actualValue = context.businessIntelligence?.completenessMetrics.businessCompleteness ?? context.contactEnrichment?.completeness;
      if (actualValue === undefined || actualValue === null) isMissing = true;
      break;
    }

    // ==========================================
    // Phase 23 Business Intelligence Criteria
    // ==========================================

    case 'VERIFIED_BUSINESS_WEBSITE': {
      const biWeb = context.businessIntelligence?.digitalPresence.verifiedWebsite;
      if (biWeb?.state === 'CONTRADICTORY') {
        isContradictory = true;
        contradictionReason = 'Conflicting website domains detected';
      }
      const isVerified =
        biWeb?.value === true ||
        context.businessIntelligence?.digitalPresence.websitePresent.value === true ||
        context.websiteState === 'WEBSITE_VERIFIED_BUSINESS_SITE';
      actualValue = isVerified ? true : undefined;
      if (actualValue === undefined) {
        isMissing = true;
      } else {
        if (biWeb?.sourceContributions) evidence.push(...biWeb.sourceContributions);
        if (context.websiteEvidence) evidence.push(...context.websiteEvidence);
      }
      break;
    }

    case 'PUBLISHED_SERVICES': {
      const biServices = context.businessIntelligence?.businessActivity.publishedServices;
      if (biServices?.state === 'CONTRADICTORY') {
        isContradictory = true;
        contradictionReason = 'Contradictory service offerings reported';
      }
      const services = biServices?.value ?? (context.websiteIntelligence as any)?.services ?? [];
      actualValue = Array.isArray(services) && services.length > 0 ? services : undefined;
      if (!actualValue) {
        isMissing = true;
      } else {
        if (biServices?.sourceContributions) evidence.push(...biServices.sourceContributions);
      }
      break;
    }

    case 'SERVICE_AREA_MATCH': {
      const areas = context.businessIntelligence?.location.serviceAreas.value ?? (context.websiteIntelligence as any)?.serviceAreas ?? [];
      actualValue = Array.isArray(areas) && areas.length > 0 ? areas : undefined;
      if (!actualValue) {
        isMissing = true;
      } else {
        if (context.businessIntelligence?.location.serviceAreas.sourceContributions) {
          evidence.push(...context.businessIntelligence.location.serviceAreas.sourceContributions);
        }
      }
      break;
    }

    case 'BUSINESS_HOURS_PRESENT': {
      const hours = context.businessIntelligence?.businessActivity.businessHours.value;
      actualValue = hours && Object.keys(hours).length > 0 ? hours : undefined;
      if (!actualValue) {
        isMissing = true;
      } else {
        if (context.businessIntelligence?.businessActivity.businessHours.sourceContributions) {
          evidence.push(...context.businessIntelligence.businessActivity.businessHours.sourceContributions);
        }
      }
      break;
    }

    case 'DIGITAL_BOOKING_PRESENT': {
      const booking = context.businessIntelligence?.digitalPresence.bookingSystemPresent.value ??
        (context.websiteIntelligence as any)?.technologies?.booking;
      actualValue = booking === true ? true : undefined;
      if (actualValue === undefined) isMissing = true;
      if (context.businessIntelligence?.digitalPresence.bookingSystemPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.digitalPresence.bookingSystemPresent.sourceContributions);
      }
      break;
    }

    case 'DIGITAL_ECOMMERCE_PRESENT': {
      const ecom = context.businessIntelligence?.digitalPresence.ecommercePresent.value ??
        (context.websiteIntelligence as any)?.technologies?.ecommerce;
      actualValue = ecom === true ? true : undefined;
      if (actualValue === undefined) isMissing = true;
      if (context.businessIntelligence?.digitalPresence.ecommercePresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.digitalPresence.ecommercePresent.sourceContributions);
      }
      break;
    }

    case 'DIGITAL_CHAT_PRESENT': {
      const chat = context.businessIntelligence?.digitalPresence.chatPresent.value ??
        (context.websiteIntelligence as any)?.technologies?.chat;
      actualValue = chat === true ? true : undefined;
      if (actualValue === undefined) isMissing = true;
      if (context.businessIntelligence?.digitalPresence.chatPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.digitalPresence.chatPresent.sourceContributions);
      }
      break;
    }

    case 'DIGITAL_ANALYTICS_PRESENT': {
      const analytics = context.businessIntelligence?.digitalPresence.analyticsTechnologyPresent.value ??
        (context.websiteIntelligence as any)?.technologies?.analytics;
      actualValue = analytics === true ? true : undefined;
      if (actualValue === undefined) isMissing = true;
      if (context.businessIntelligence?.digitalPresence.analyticsTechnologyPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.digitalPresence.analyticsTechnologyPresent.sourceContributions);
      }
      break;
    }

    case 'DIGITAL_CMS_DETECTED': {
      const cms = (context.businessIntelligence?.digitalPresence as any)?.cmsDetected?.value ??
        (context.websiteIntelligence as any)?.technologies?.cms;
      actualValue = cms ? cms : undefined;
      if (!actualValue) isMissing = true;
      break;
    }

    case 'PUBLIC_EMAIL_AVAILABLE': {
      if (context.businessIntelligence?.contactPresence.publicEmailPresent.state === 'CONTRADICTORY') {
        isContradictory = true;
        contradictionReason = 'Email contradiction observed';
      }
      const hasEmail = context.businessIntelligence?.contactPresence.publicEmailPresent.value ??
        ((context.contactEnrichment?.emails?.length ?? 0) > 0 || (context.normalizedCandidate?.emails?.length ?? 0) > 0);
      actualValue = hasEmail ? true : undefined;
      if (actualValue === undefined) isMissing = true;
      if (context.businessIntelligence?.contactPresence.publicEmailPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.contactPresence.publicEmailPresent.sourceContributions);
      }
      break;
    }

    case 'ROLE_EMAIL_AVAILABLE': {
      const roleEmail = context.businessIntelligence?.contactPresence.roleEmailPresent.value;
      actualValue = roleEmail === true ? true : undefined;
      if (actualValue === undefined) isMissing = true;
      if (context.businessIntelligence?.contactPresence.roleEmailPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.contactPresence.roleEmailPresent.sourceContributions);
      }
      break;
    }

    case 'PERSON_EMAIL_AVAILABLE': {
      const personEmail = context.businessIntelligence?.contactPresence.personEmailPresent.value;
      actualValue = personEmail === true ? true : undefined;
      if (actualValue === undefined) isMissing = true;
      if (context.businessIntelligence?.contactPresence.personEmailPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.contactPresence.personEmailPresent.sourceContributions);
      }
      break;
    }

    case 'PUBLIC_PHONE_AVAILABLE': {
      if (context.businessIntelligence?.contactPresence.publicPhonePresent.state === 'CONTRADICTORY') {
        isContradictory = true;
        contradictionReason = 'Phone contradiction observed';
      }
      const hasPhone = context.businessIntelligence?.contactPresence.publicPhonePresent.value ??
        ((context.contactEnrichment?.phones?.length ?? 0) > 0 || (context.normalizedCandidate?.phones?.length ?? 0) > 0);
      actualValue = hasPhone ? true : undefined;
      if (actualValue === undefined) isMissing = true;
      if (context.businessIntelligence?.contactPresence.publicPhonePresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.contactPresence.publicPhonePresent.sourceContributions);
      }
      break;
    }

    case 'PERSON_PHONE_AVAILABLE': {
      const personPhone = context.businessIntelligence?.contactPresence.personPhonePresent.value;
      actualValue = personPhone === true ? true : undefined;
      if (actualValue === undefined) isMissing = true;
      if (context.businessIntelligence?.contactPresence.personPhonePresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.contactPresence.personPhonePresent.sourceContributions);
      }
      break;
    }

    case 'PUBLIC_PERSON_AVAILABLE': {
      const publicPerson = context.businessIntelligence?.contactPresence.publicPersonPresent.value;
      actualValue = publicPerson === true ? true : undefined;
      if (actualValue === undefined) isMissing = true;
      if (context.businessIntelligence?.contactPresence.publicPersonPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.contactPresence.publicPersonPresent.sourceContributions);
      }
      break;
    }

    case 'PERSON_WITH_TITLE_AVAILABLE': {
      const personWithTitle = (context.businessIntelligence?.contactPresence as any)?.personWithTitlePresent?.value;
      actualValue = personWithTitle === true ? true : undefined;
      if (actualValue === undefined) isMissing = true;
      break;
    }

    case 'CROSS_SOURCE_CORROBORATION': {
      const count = context.businessIntelligence?.completenessMetrics.sourceCorroborationCount ??
        (context.businessIntelligence?.crossSourceCorroborations?.length ?? 0);
      actualValue = count;
      if (count === 0) isMissing = true;
      if (context.businessIntelligence?.crossSourceCorroborations) {
        evidence.push(...context.businessIntelligence.crossSourceCorroborations);
      }
      break;
    }

    case 'CORROBORATED_PHONE': {
      const sig = context.businessIntelligence?.contactPresence.publicPhonePresent;
      if (sig?.state === 'CONTRADICTORY') {
        isContradictory = true;
        contradictionReason = 'Phone conflict observed between sources';
      }
      const corroborated = sig?.state === 'CORROBORATED' || (sig?.corroborationSources && sig.corroborationSources.length > 1);
      actualValue = corroborated ? true : undefined;
      if (!actualValue) isMissing = true;
      if (sig?.sourceContributions) evidence.push(...sig.sourceContributions);
      break;
    }

    case 'CORROBORATED_IDENTITY': {
      const sig = context.businessIntelligence?.identity.canonicalBusinessName;
      if (sig?.state === 'CONTRADICTORY') {
        isContradictory = true;
        contradictionReason = 'Business identity contradiction between sources';
      }
      const corroborated = sig?.state === 'CORROBORATED' || (sig?.corroborationSources && sig.corroborationSources.length > 1);
      actualValue = corroborated ? true : undefined;
      if (!actualValue) isMissing = true;
      if (sig?.sourceContributions) evidence.push(...sig.sourceContributions);
      break;
    }

    case 'META_AD_ACTIVE': {
      const adSig = context.businessIntelligence?.advertisingSignals.adPresenceState;
      actualValue = adSig?.value;
      if (adSig?.freshnessState === 'STALE') {
        isMissing = true; // Stale evidence does not pass active ad requirement
      } else if (!actualValue) {
        isMissing = true;
      } else {
        if (adSig?.sourceContributions) evidence.push(...adSig.sourceContributions);
      }
      break;
    }

    case 'EVIDENCE_COVERAGE_THRESHOLD': {
      actualValue = context.businessIntelligence?.completenessMetrics.evidenceCoverage;
      if (actualValue === undefined || actualValue === null) isMissing = true;
      break;
    }

    case 'BUSINESS_COMPLETENESS_THRESHOLD': {
      actualValue = context.businessIntelligence?.completenessMetrics.businessCompleteness;
      if (actualValue === undefined || actualValue === null) isMissing = true;
      break;
    }

    case 'TEMPORAL_FRESHNESS': {
      const freshness = context.businessIntelligence?.advertisingSignals.adPresenceState.freshnessState ||
        context.businessIntelligence?.digitalPresence.verifiedWebsite.freshnessState;
      actualValue = freshness;
      if (!actualValue || actualValue === 'UNKNOWN') isMissing = true;
      break;
    }

    case 'CUSTOM_FIELD': {
      if (criterion.field) {
        const resolvePath = (obj: any, path: string) => {
          if (!obj) return undefined;
          return path.split('.').reduce((curr, key) => (curr !== null && curr !== undefined ? curr[key] : undefined), obj);
        };
        actualValue =
          resolvePath(context, criterion.field) ??
          resolvePath(context.normalizedCandidate, criterion.field) ??
          resolvePath(context.businessIntelligence, criterion.field) ??
          resolvePath(context.contactEnrichment, criterion.field);
      }
      if (actualValue === undefined || actualValue === null) isMissing = true;
      break;
    }
  }

  // 2. Evaluate Policy Check: Is any required evidence BLOCKED?
  const matchingContrib = context.sourceContributions?.find(c =>
    c.fieldName === criterion.field ||
    c.fieldName === criterion.type.toLowerCase() ||
    (criterion.type.includes('PHONE') && c.fieldName.toLowerCase().includes('phone')) ||
    (criterion.type.includes('EMAIL') && c.fieldName.toLowerCase().includes('email')) ||
    (criterion.type.includes('WEBSITE') && c.fieldName.toLowerCase().includes('website')) ||
    (criterion.type.includes('ADDRESS') && c.fieldName.toLowerCase().includes('address'))
  );
  const policyCheck = checkQualificationEligibility(matchingContrib);
  if (policyCheck.isBlocked) {
    return {
      criterionId: criterion.id,
      criterionType: criterion.type,
      operator: criterion.operator,
      expectedValue: criterion.expectedValue,
      actualValue,
      outcome: 'BLOCKED',
      mandatory: criterion.mandatory,
      weight,
      scoreContribution: 0,
      evidence,
      reasonCode: 'CRITERION_BLOCKED_BY_POLICY',
      explanation: `Evaluation blocked: ${policyCheck.reason || 'Source compliance restriction'}`
    };
  }

  // 3. Evaluate Contradiction
  if (isContradictory && policies.conflictPolicy === 'STRICT_CONTRADICTION') {
    return {
      criterionId: criterion.id,
      criterionType: criterion.type,
      operator: criterion.operator,
      expectedValue: criterion.expectedValue,
      actualValue,
      outcome: 'CONTRADICTORY',
      mandatory: criterion.mandatory,
      weight,
      scoreContribution: 0,
      evidence,
      reasonCode: 'CRITERION_CONTRADICTORY',
      explanation: `Contradiction detected: ${contradictionReason}`
    };
  }

  // 4. Handle Missing Data Policy
  if (isMissing) {
    if (policies.missingDataPolicy === 'MISSING_FAILS_REQUIRED') {
      return {
        criterionId: criterion.id,
        criterionType: criterion.type,
        operator: criterion.operator,
        expectedValue: criterion.expectedValue,
        actualValue: undefined,
        outcome: 'FAIL',
        mandatory: criterion.mandatory,
        weight,
        scoreContribution: 0,
        evidence: [],
        reasonCode: 'MISSING_DATA_FAILS',
        explanation: `Mandatory evidence for '${criterion.id}' is missing; policy classifies missing as FAIL.`
      };
    } else if (policies.missingDataPolicy === 'MISSING_ALLOWED') {
      return {
        criterionId: criterion.id,
        criterionType: criterion.type,
        operator: criterion.operator,
        expectedValue: criterion.expectedValue,
        actualValue: undefined,
        outcome: 'PASS',
        mandatory: criterion.mandatory,
        weight,
        scoreContribution: weight,
        evidence: [],
        reasonCode: 'MISSING_DATA_ALLOWED',
        explanation: `Evidence for '${criterion.id}' is absent; policy permits missing data as PASS.`
      };
    } else {
      // MISSING_IS_UNKNOWN
      return {
        criterionId: criterion.id,
        criterionType: criterion.type,
        operator: criterion.operator,
        expectedValue: criterion.expectedValue,
        actualValue: undefined,
        outcome: 'UNKNOWN',
        mandatory: criterion.mandatory,
        weight,
        scoreContribution: 0,
        evidence: [],
        reasonCode: 'MISSING_DATA_UNKNOWN',
        explanation: `Evidence for '${criterion.id}' is currently unknown or unobserved.`
      };
    }
  }

  // 5. Evaluate Operator
  // Special handling for LOCATION_MATCH object comparison
  let passed = false;
  if (criterion.type === 'LOCATION_MATCH' && typeof criterion.expectedValue === 'object') {
    const locActual = actualValue || {};
    let countryPass = true;
    let cityPass = true;
    if (criterion.expectedValue.country) {
      countryPass = evaluateOperator(criterion.operator, locActual.country, criterion.expectedValue.country);
    }
    if (criterion.expectedValue.city) {
      cityPass = evaluateOperator(criterion.operator, locActual.city, criterion.expectedValue.city);
    }
    passed = countryPass && cityPass;
  } else {
    passed = evaluateOperator(criterion.operator, actualValue, criterion.expectedValue);
  }

  const outcome: CriterionOutcome = passed ? 'PASS' : 'FAIL';
  const scoreContribution = passed ? weight : 0;
  reasonCode = passed ? 'CRITERION_SATISFIED' : 'CRITERION_UNSATISFIED';
  explanation = passed
    ? `Criterion '${criterion.id}' (${criterion.type}) passed: observed value satisfied operator ${criterion.operator}.`
    : `Criterion '${criterion.id}' (${criterion.type}) failed: observed value did not satisfy operator ${criterion.operator}.`;

  return {
    criterionId: criterion.id,
    criterionType: criterion.type,
    operator: criterion.operator,
    expectedValue: criterion.expectedValue,
    actualValue,
    outcome,
    mandatory: criterion.mandatory,
    weight,
    scoreContribution,
    evidence,
    reasonCode,
    explanation
  };
}
