/**
 * Contact ↔ Person Association & Social Classification Engine (Phase 22)
 *
 * Implements evidence-backed association between contacts and people,
 * and classifies social profiles into business vs personal profiles.
 *
 * NON-NEGOTIABLE SAFETY:
 * - NO guessing association based on coincidental on-site presence.
 * - Same-site unrelated emails are NEVER assigned to people.
 * - Distinguishes EXPLICIT_ASSOCIATION from POTENTIAL_ASSOCIATION.
 */

import type {
  CanonicalContact,
  CanonicalPerson,
  SocialProfileAssociationType
} from './types.ts';
import type { PublicPerson } from '../websiteIntelligence/types.ts';

export interface AssociationResult {
  contacts: CanonicalContact[];
  people: CanonicalPerson[];
}

/**
 * Associates contacts with canonical people based strictly on observed structural evidence.
 */
export function associateContactsAndPeople(
  contacts: CanonicalContact[],
  people: CanonicalPerson[],
  rawPeople: PublicPerson[]
): AssociationResult {
  // Create mapping of raw person evidence to canonical people
  const rawToCanonical = new Map<PublicPerson, CanonicalPerson>();
  for (const raw of rawPeople) {
    const matched =
      people.find(p =>
        p.sourcePages.includes(raw.sourceUrl) &&
        p.fullName.toLowerCase() === raw.fullName.toLowerCase()
      ) ||
      people.find(p =>
        p.fullName.toLowerCase() === raw.fullName.toLowerCase()
      );
    if (matched) {
      rawToCanonical.set(raw, matched);
    }
  }

  for (const contact of contacts) {
    for (const [raw, canonicalPerson] of rawToCanonical.entries()) {
      let isExplicit = false;

      if (contact.contactType === 'EMAIL') {
        if (raw.email && contact.normalizedValue.toLowerCase() === raw.email.toLowerCase()) {
          isExplicit = true;
        }
      } else if (contact.contactType === 'PHONE') {
        if (raw.phone && contact.normalizedValue.replace(/[^0-9]/g, '').includes(raw.phone.replace(/[^0-9]/g, ''))) {
          isExplicit = true;
        }
      } else if (contact.contactType === 'SOCIAL_PROFILE') {
        if (raw.linkedInUrl && contact.normalizedValue.toLowerCase() === raw.linkedInUrl.toLowerCase()) {
          isExplicit = true;
        }
      }

      if (isExplicit) {
        if (!contact.associatedPersonIds) contact.associatedPersonIds = [];
        if (!canonicalPerson.emailRefs) canonicalPerson.emailRefs = [];
        if (!canonicalPerson.phoneRefs) canonicalPerson.phoneRefs = [];
        if (!canonicalPerson.socialRefs) canonicalPerson.socialRefs = [];

        if (!contact.associatedPersonIds.includes(canonicalPerson.personId)) {
          contact.associatedPersonIds.push(canonicalPerson.personId);
          contact.associatedPersonId = canonicalPerson.personId;
          contact.associationStrength = 'EXPLICIT_ASSOCIATION';
          contact.associationConfidence = 'EXPLICIT_ASSOCIATION';
          if (contact.evidenceType === 'PUBLICLY_LISTED') {
            contact.evidenceType = 'PERSON_ASSOCIATED';
          }
        }

        // Link references back into canonical person
        if (contact.contactType === 'EMAIL') {
          if (!canonicalPerson.emailRefs.includes(contact.normalizedValue)) {
            canonicalPerson.emailRefs.push(contact.normalizedValue);
          }
        } else if (contact.contactType === 'PHONE') {
          if (!canonicalPerson.phoneRefs.includes(contact.normalizedValue)) {
            canonicalPerson.phoneRefs.push(contact.normalizedValue);
          }
        } else if (contact.contactType === 'SOCIAL_PROFILE') {
          if (!canonicalPerson.socialRefs.includes(contact.normalizedValue)) {
            canonicalPerson.socialRefs.push(contact.normalizedValue);
          }
          contact.socialAssociationType = 'PERSON_PROFILE';
          contact.socialProfile = { platform: contact.socialPlatform, associationType: 'PERSON_PROFILE' };
        }
      }
    }

    // Default social association type if not linked to person
    if (contact.contactType === 'SOCIAL_PROFILE') {
      if (!contact.socialAssociationType) {
        contact.socialAssociationType = 'BUSINESS_PROFILE';
      }
      if (!contact.socialProfile) {
        contact.socialProfile = {
          platform: contact.socialPlatform,
          associationType: contact.socialAssociationType
        };
      }
    }
  }

  return { contacts, people };
}
