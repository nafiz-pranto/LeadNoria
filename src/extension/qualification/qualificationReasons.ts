/**
 * LeadNoria Qualification Reason Taxonomy & Explainability (Phase 6)
 *
 * Implements deterministic machine-readable reason codes and concise, factual,
 * user-facing explanations ("Why this lead") without leaking internal implementation details.
 */

import type { QualificationReasonCode } from './types.ts';

export const REASON_DESCRIPTIONS: Record<QualificationReasonCode, string> = {
  QUALIFIED_RELEVANT_WITH_VERIFIED_WEBSITE:
    'Lead satisfies relevance criteria with an independently verified business website.',
  QUALIFIED_WITH_WEBSITE:
    'Lead satisfies criteria with an active, functional business website.',
  QUALIFIED_WITHOUT_WEBSITE:
    'Lead satisfies criteria with verified absence of a business website.',
  UNCERTAIN_WEBSITE_NOT_FOUND:
    'No usable website was observed, but absence cannot be definitively proven.',
  UNCERTAIN_WEBSITE_VERIFICATION:
    'Website verification was inconclusive, timed out, or had ambiguous identity signals.',
  UNCERTAIN_POLICY_REVIEW:
    'Source data requires compliance review before full eligibility can be established.',
  UNCERTAIN_CONTRADICTORY_EVIDENCE:
    'Conflicting signals detected between business identity, location, or source records.',
  UNCERTAIN_GEOGRAPHY_AMBIGUOUS:
    'Candidate location evidence is ambiguous or incomplete relative to target area.',
  UNCERTAIN_RELEVANCE_WEAK:
    'Business relevance signals are present but insufficient for definitive qualification.',
  DISQUALIFIED_NON_BUSINESS:
    'Destination website is a generic profile, directory, or non-business entity.',
  DISQUALIFIED_PARKED_DOMAIN:
    'Destination domain is parked, for sale, or a placeholder.',
  DISQUALIFIED_IRRELEVANT:
    'Business activities or services do not align with target research criteria.',
  DISQUALIFIED_GEO_MISMATCH:
    'Business is confirmed outside the specified geographic target area.',
  DISQUALIFIED_WEBSITE_REQUIREMENT:
    'Website status contradicts the research requirement mode.',
  DISQUALIFIED_POLICY_INELIGIBLE:
    'Data provenance does not meet product policy or export standards.',
  DISQUALIFIED_CONTRADICTION:
    'Irreconcilable contradiction between source signals and verification evidence.'
};

/**
 * Returns a clean, user-facing explanation for a given reason code.
 */
export function getReasonExplanation(code: QualificationReasonCode): string {
  return REASON_DESCRIPTIONS[code] || 'Lead evaluated against qualification standards.';
}

/**
 * Synthesizes multiple reason codes into a concise human-readable summary.
 */
export function formatWhyThisLead(codes: QualificationReasonCode[]): string {
  if (!codes || codes.length === 0) {
    return 'Lead evaluated under standard qualification rules.';
  }
  return codes.map(code => REASON_DESCRIPTIONS[code] || code).join(' ');
}
