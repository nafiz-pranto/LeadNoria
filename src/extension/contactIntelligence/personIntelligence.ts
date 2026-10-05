/**
 * Public Person Intelligence Layer (Phase 22)
 *
 * Normalizes explicitly published website personnel, extracts explicit role categories,
 * deduplicates persons conservatively, and prevents false person merging.
 *
 * NON-NEGOTIABLE SAFETY:
 * - NO external people search.
 * - NO LinkedIn scraping.
 * - NO inferred employees.
 * - Weak evidence (name alone) NEVER merges people.
 */

import type { PublicPerson } from '../websiteIntelligence/types.ts';
import type { CanonicalPerson, PersonEvidenceItem } from './types.ts';

const EXPLICIT_ROLES = [
  'Founder',
  'Co-Founder',
  'Owner',
  'Co-Owner',
  'CEO',
  'Chief Executive Officer',
  'COO',
  'CFO',
  'CTO',
  'CMO',
  'President',
  'Vice President',
  'Managing Director',
  'Executive Director',
  'Director',
  'Partner',
  'Managing Partner',
  'Principal',
  'General Manager',
  'Operations Manager',
  'Office Manager',
  'Sales Manager',
  'Marketing Manager',
  'Project Manager',
  'Account Manager',
  'Dentist',
  'Orthodontist',
  'Physician',
  'Surgeon',
  'Attorney',
  'Lawyer',
  'Counsel',
  'Consultant',
  'Specialist',
  'Lead',
  'Associate'
];

/**
 * Sanitizes raw HTML strings from tags and scripts.
 */
function stripHtml(input: string): string {
  return (input || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ');
}

/**
 * Normalizes a person's full name deterministically.
 */
export function normalizePersonName(rawName: string): string {
  if (!rawName) return '';
  const stripped = stripHtml(rawName);
  const clean = stripped
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s.'-]/gu, '') // Keep letters, numbers, spaces, periods, apostrophes, hyphens
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);

  // Normalized key for comparison (strip professional honorifics and collapse spaces)
  const cleanWithoutHonorific = clean.replace(/^(?:dr|mr|mrs|ms|prof)\.?\s+/i, '');
  const normalizedKey = cleanWithoutHonorific
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);

  return normalizedKey;
}

/**
 * Normalizes a job title, preserving original text while standardizing comparison key.
 */
export function normalizeJobTitle(rawTitle?: string): string {
  if (!rawTitle) return '';

  const stripped = stripHtml(rawTitle);
  return stripped
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, 100);
}

/**
 * Deduplicates and clusters public people observed across website pages.
 *
 * Strict Rules:
 * - Strong Match (Same exact email or LinkedIn URL): merge into single CanonicalPerson.
 * - Weak Match (Same name only or same name + title alone): DO NOT MERGE!
 *   Keep separate records and link via potentialDuplicatePersonIds.
 */
export function clusterAndDeduplicatePeople(
  rawPeople: PublicPerson[],
  observedAt: string
): CanonicalPerson[] {
  const canonicalPeople: CanonicalPerson[] = [];

  for (const raw of rawPeople) {
    const normalizedName = normalizePersonName(raw.fullName);
    if (!normalizedName) continue;

    const displayName = stripHtml(raw.fullName)
      .normalize('NFC')
      .replace(/[^\p{L}\p{N}\s.'-]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);

    const displayTitle = raw.jobTitle
      ? stripHtml(raw.jobTitle).normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 100)
      : undefined;
    const normalizedJobTitle = raw.jobTitle ? normalizeJobTitle(raw.jobTitle) : undefined;
    const roleCategory = extractRoleClassification(raw.jobTitle);

    const normEmail = raw.email ? raw.email.toLowerCase().trim() : undefined;
    const normLinkedIn = raw.linkedInUrl ? raw.linkedInUrl.toLowerCase().trim() : undefined;

    // Check for strong matches
    let merged = false;
    for (const existing of canonicalPeople) {
      const emailMatch =
        normEmail &&
        existing.emailRefs.some(e => e.toLowerCase() === normEmail);

      const linkedInMatch =
        normLinkedIn &&
        existing.socialRefs.some(s => s.toLowerCase() === normLinkedIn);

      // Strong match condition
      if (emailMatch || linkedInMatch) {
        // Merge into existing canonical person
        if (!existing.sourcePages.includes(raw.sourceUrl)) {
          existing.sourcePages.push(raw.sourceUrl);
        }
        existing.evidence.push({
          sourceUrl: raw.sourceUrl,
          evidenceKind: raw.evidenceType,
          snippet: raw.jobTitle,
          observedAt: raw.observedAt || observedAt
        });
        existing.lastObservedAt = observedAt;
        existing.observationCount++;

        if (normEmail && !existing.emailRefs.includes(normEmail)) {
          existing.emailRefs.push(normEmail);
        }
        if (raw.phone && !existing.phoneRefs.includes(raw.phone)) {
          existing.phoneRefs.push(raw.phone);
        }
        if (normLinkedIn && !existing.socialRefs.includes(normLinkedIn)) {
          existing.socialRefs.push(normLinkedIn);
        }

        merged = true;
        break;
      }

      // Weak match condition (same normalized name, but no strong corroborating email/LinkedIn)
      if (existing.normalizedName === normalizedName) {
        // Flag potential duplicate without merging to prevent data loss!
        if (!existing.potentialDuplicatePersonIds) {
          existing.potentialDuplicatePersonIds = [];
        }
        // Will link after generating new personId below
      }
    }

    if (!merged) {
      const personId = `per_${normalizedName}_${canonicalPeople.length + 1}`;
      const newPerson: CanonicalPerson = {
        personId,
        fullName: displayName,
        normalizedName,
        jobTitle: displayTitle,
        normalizedJobTitle,
        roleCategory,
        emailRefs: normEmail ? [normEmail] : [],
        phoneRefs: raw.phone ? [raw.phone] : [],
        socialRefs: normLinkedIn ? [normLinkedIn] : [],
        sourcePages: [raw.sourceUrl],
        evidence: [
          {
            sourceUrl: raw.sourceUrl,
            evidenceKind: raw.evidenceType,
            snippet: raw.jobTitle,
            observedAt: raw.observedAt || observedAt
          }
        ],
        confidenceState: normEmail || normLinkedIn ? 'HIGH' : 'MEDIUM',
        potentialDuplicatePersonIds: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [],
        firstObservedAt: raw.observedAt || observedAt,
        lastObservedAt: raw.observedAt || observedAt,
        observationCount: 1
      };

      // Link weak duplicate references both ways
      for (const existing of canonicalPeople) {
        if (existing.normalizedName === normalizedName) {
          if (!existing.potentialDuplicatePersonIds) existing.potentialDuplicatePersonIds = [];
          existing.potentialDuplicatePersonIds.push(personId);
          newPerson.potentialDuplicatePersonIds?.push(existing.personId);
        }
      }

      canonicalPeople.push(newPerson);
    }
  }

  return canonicalPeople;
}

/**
 * Extracts explicit role classification without title upgrading.
 */
export function extractRoleClassification(rawTitle?: string): string | undefined {
  if (!rawTitle) return undefined;
  const clean = stripHtml(rawTitle).toLowerCase().trim();
  if (/\b(?:co-founder|founder)\b/i.test(clean)) return 'FOUNDER';
  if (/\b(?:co-owner|owner)\b/i.test(clean)) return 'OWNER';
  if (/\b(?:ceo|chief\s+executive\s+officer)\b/i.test(clean)) return 'CEO';
  if (/\b(?:coo|chief\s+operating\s+officer)\b/i.test(clean)) return 'COO';
  if (/\b(?:cfo|chief\s+financial\s+officer)\b/i.test(clean)) return 'CFO';
  if (/\b(?:cto|chief\s+technology\s+officer)\b/i.test(clean)) return 'CTO';
  if (/\b(?:cmo|chief\s+marketing\s+officer)\b/i.test(clean)) return 'CMO';
  if (/\b(?:president)\b/i.test(clean)) return 'PRESIDENT';
  if (/\b(?:vice\s+president|vp)\b/i.test(clean)) return 'VICE_PRESIDENT';
  if (/\b(?:managing\s+director|executive\s+director|director)\b/i.test(clean)) return 'DIRECTOR';
  if (/\b(?:managing\s+partner|partner)\b/i.test(clean)) return 'PARTNER';
  if (/\b(?:principal)\b/i.test(clean)) return 'PRINCIPAL';
  if (/\b(?:general\s+manager|manager)\b/i.test(clean)) return 'MANAGER';
  if (/\b(?:dentist|orthodontist)\b/i.test(clean)) return 'DENTIST';
  if (/\b(?:physician|surgeon|doctor)\b/i.test(clean)) return 'PHYSICIAN';
  if (/\b(?:attorney|lawyer|counsel)\b/i.test(clean)) return 'ATTORNEY';
  if (/\b(?:consultant)\b/i.test(clean)) return 'CONSULTANT';
  return undefined;
}
