/**
 * Contact Completeness & Usability Priority Calculator (Phase 22)
 *
 * Computes deterministic completeness metrics and evidence-based usability states.
 *
 * NON-NEGOTIABLE SAFETY:
 * - NO subjective "lead scores", "buyer scores", or "probabilities".
 * - Metrics are strictly based on declared, measurable facts.
 */

import type {
  CanonicalContact,
  CanonicalPerson,
  ContactCompleteness,
  ContactPrioritySignal,
  ContactConflictRecord
} from './types.ts';

export function calculateContactCompleteness(
  contacts: CanonicalContact[],
  people: CanonicalPerson[]
): ContactCompleteness {
  const hasPublicEmail = contacts.some(c => c.contactType === 'EMAIL' && c.confidenceState !== 'INVALID');
  const hasPublicPhone = contacts.some(c => c.contactType === 'PHONE' && c.confidenceState !== 'INVALID');
  const hasContactForm = contacts.some(c => c.contactType === 'CONTACT_FORM');
  const hasSocialProfile = contacts.some(c => c.contactType === 'SOCIAL_PROFILE');
  const hasPublicPerson = people.length > 0;
  const hasPersonAssociatedEmail = people.some(p => p.emailRefs.length > 0);
  const hasPersonAssociatedPhone = people.some(p => p.phoneRefs.length > 0);

  const metrics = [
    hasPublicEmail,
    hasPublicPhone,
    hasContactForm,
    hasSocialProfile,
    hasPublicPerson,
    hasPersonAssociatedEmail,
    hasPersonAssociatedPhone
  ];

  const trueCount = metrics.filter(Boolean).length;
  const contactCompletenessRatio = trueCount / metrics.length;

  return {
    hasPublicEmail,
    hasPublicPhone,
    hasContactForm,
    hasSocialProfile,
    hasPublicPerson,
    hasPersonAssociatedEmail,
    hasPersonAssociatedPhone,
    contactCompletenessRatio
  };
}

export function determineContactPrioritySignal(
  contacts: CanonicalContact[],
  people: CanonicalPerson[],
  conflicts: ContactConflictRecord[] = []
): ContactPrioritySignal {
  if (conflicts.some(c => c.conflictType === 'PHONE_CONFLICT' || c.conflictType === 'EMAIL_CONFLICT')) {
    return 'CONFLICTING_CONTACT';
  }

  // 1. Direct public person contact
  const hasDirectPerson = people.some(p => p.emailRefs.length > 0 || p.phoneRefs.length > 0);
  if (hasDirectPerson) {
    return 'DIRECT_PUBLIC_CONTACT';
  }

  // 2. Role contact (e.g. sales@, ceo@)
  const hasRoleContact = contacts.some(c => c.contactType === 'EMAIL' && c.emailClassification === 'ROLE_ACCOUNT');
  if (hasRoleContact) {
    return 'ROLE_CONTACT';
  }

  // 3. Generic business contact (e.g. info@, phone)
  const hasGenericEmailOrPhone = contacts.some(
    c => (c.contactType === 'EMAIL' && c.confidenceState !== 'INVALID') ||
         (c.contactType === 'PHONE' && c.confidenceState !== 'INVALID')
  );
  if (hasGenericEmailOrPhone) {
    return 'GENERIC_BUSINESS_CONTACT';
  }

  // 4. Contact form only
  const hasForm = contacts.some(c => c.contactType === 'CONTACT_FORM');
  if (hasForm) {
    return 'WEBSITE_FORM_ONLY';
  }

  // 5. Social profile only
  const hasSocial = contacts.some(c => c.contactType === 'SOCIAL_PROFILE');
  if (hasSocial) {
    return 'SOCIAL_ONLY';
  }

  return 'NO_PUBLIC_CONTACT';
}
