/**
 * Contact Change Detection Layer (Phase 22)
 *
 * Compares current contact intelligence against previous in-memory session snapshots
 * to detect newly observed, modified, or removed contacts and titles.
 */

import type {
  CanonicalContact,
  CanonicalPerson,
  ContactChangeEvent,
  ContactIntelligenceResult
} from './types.ts';

export function detectContactChanges(
  arg1: any,
  arg2: any,
  arg3?: any,
  arg4?: string
): ContactChangeEvent[] {
  let currentContacts: CanonicalContact[] = [];
  let currentPeople: CanonicalPerson[] = [];
  let previousSnapshot: any = undefined;
  let observedAt: string = typeof arg4 === 'string' ? arg4 : new Date().toISOString();

  if (Array.isArray(arg1)) {
    // Calling convention: (currentContacts, currentPeople, previousSnapshot, observedAt)
    currentContacts = arg1;
    currentPeople = Array.isArray(arg2) ? arg2 : [];
    previousSnapshot = arg3;
  } else {
    // Calling convention: (previousSnapshot, currentContacts, currentPeople, observedAt)
    previousSnapshot = arg1;
    currentContacts = Array.isArray(arg2) ? arg2 : [];
    currentPeople = Array.isArray(arg3) ? arg3 : [];
    if (typeof arg4 === 'string') observedAt = arg4;
  }

  if (!previousSnapshot) return [];

  const changes: ContactChangeEvent[] = [];
  const prevContacts: CanonicalContact[] =
    previousSnapshot.canonicalContacts || previousSnapshot.contacts || [];
  const prevPeople: CanonicalPerson[] =
    previousSnapshot.canonicalPeople || previousSnapshot.people || [];

  // 1. Email additions and removals
  const currentEmails = currentContacts.filter(c => c.contactType === 'EMAIL');
  const prevEmails = prevContacts.filter(c => c.contactType === 'EMAIL');

  for (const ce of currentEmails) {
    if (!prevEmails.some(pe => pe.normalizedValue === ce.normalizedValue)) {
      changes.push({
        type: 'ADDED',
        target: 'EMAIL',
        changeType: 'EMAIL_ADDED',
        currentValue: ce.normalizedValue,
        observedAt
      });
    }
  }

  for (const pe of prevEmails) {
    if (!currentEmails.some(ce => ce.normalizedValue === pe.normalizedValue)) {
      changes.push({
        type: 'REMOVED',
        target: 'EMAIL',
        changeType: 'EMAIL_REMOVED',
        previousValue: pe.normalizedValue,
        observedAt
      });
    }
  }

  // 2. Phone changes
  const currentPhones = currentContacts.filter(c => c.contactType === 'PHONE');
  const prevPhones = prevContacts.filter(c => c.contactType === 'PHONE');

  for (const cp of currentPhones) {
    if (!prevPhones.some(pp => pp.normalizedValue === cp.normalizedValue)) {
      changes.push({
        type: 'ADDED',
        target: 'PHONE',
        changeType: 'PHONE_ADDED',
        currentValue: cp.normalizedValue,
        observedAt
      });
    }
  }

  for (const pp of prevPhones) {
    if (!currentPhones.some(cp => cp.normalizedValue === pp.normalizedValue)) {
      changes.push({
        type: 'REMOVED',
        target: 'PHONE',
        changeType: 'PHONE_REMOVED',
        previousValue: pp.normalizedValue,
        observedAt
      });
    }
  }

  // 3. Person title changes
  for (const cp of currentPeople) {
    const prevPerson = prevPeople.find(pp => pp.normalizedName === cp.normalizedName);
    if (prevPerson) {
      if (prevPerson.jobTitle && cp.jobTitle && prevPerson.jobTitle !== cp.jobTitle) {
        changes.push({
          type: 'MODIFIED',
          target: 'TITLE',
          changeType: 'TITLE_CHANGED',
          previousValue: prevPerson.jobTitle,
          currentValue: cp.jobTitle,
          observedAt
        });
      }
    } else {
      changes.push({
        type: 'ADDED',
        target: 'PERSON',
        changeType: 'PERSON_ADDED',
        currentValue: cp.fullName,
        observedAt
      });
    }
  }

  return changes;
}
