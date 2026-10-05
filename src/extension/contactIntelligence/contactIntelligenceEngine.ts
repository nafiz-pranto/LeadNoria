/**
 * Contact & Person Intelligence Engine (Phase 22)
 *
 * Transforms publicly observed website evidence into a structured, deduplicated,
 * confidence-aware contact and person intelligence layer.
 *
 * NON-NEGOTIABLE POLICY INVARIANTS:
 * - NO people search engine.
 * - NO data broker lookups (Apollo, Clearbit, Hunter, etc.).
 * - NO email guessing.
 * - NO SMTP verification.
 * - NO social crawling.
 * - STRICT GOOGLE RESTRICTION INHERITANCE:
 *   Website child contacts & people derived from Google candidates retain
 *   NOT_PERSISTABLE, NOT_EXPORTABLE, and GOOGLE_CONSUMER_WEB_RESTRICTED,
 *   completely preventing any circumvention or restriction laundering.
 */

import type {
  CanonicalContact,
  CanonicalPerson,
  ContactConflictRecord,
  ContactIntelligenceInput,
  ContactIntelligenceResult
} from './types.ts';
import type { SourceContribution, ProvenanceType, SourceType } from '../extraction/types.ts';
import { processEmailIntelligence } from './emailIntelligence.ts';
import { processPhoneIntelligence } from './phoneIntelligence.ts';
import { clusterAndDeduplicatePeople } from './personIntelligence.ts';
import { associateContactsAndPeople } from './associationEngine.ts';
import { calculateContactCompleteness, determineContactPrioritySignal } from './completenessCalculator.ts';
import { buildContactSourceGraph } from './graphBuilder.ts';
import { detectContactChanges } from './changeDetector.ts';

export class ContactIntelligenceEngine {
  /**
   * Sanitizes plain text from HTML or script injection payloads.
   */
  private sanitizeText(raw: string): string {
    return (raw || '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, '')
      .normalize('NFC')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Main pipeline to process website intelligence into structured canonical contacts & people.
   */
  process(input: ContactIntelligenceInput): ContactIntelligenceResult {
    const observedAt = new Date().toISOString();
    const websiteResult = input.websiteResult;

    const isGoogleRestricted =
      input.sourceContext === 'GOOGLE_MAPS' ||
      input.sourceContext === 'GOOGLE' ||
      input.provenanceContext === 'GOOGLE_DERIVED' ||
      input.sourceRestrictions?.isRestricted === true ||
      (input.websiteResult as { isRestricted?: boolean })?.isRestricted === true;

    // Helper to generate source contribution with strict Google firewall enforcement
    const makeContribution = (fieldName: string): SourceContribution => {
      if (isGoogleRestricted) {
        return {
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          fieldName,
          acquisitionContext: 'GOOGLE_CONSUMER_WEB',
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          isRestricted: true,
          policyStatus: 'PRODUCT_REJECTED',
          persistenceStatus: 'NOT_PERSISTABLE',
          exportStatus: 'NOT_EXPORTABLE'
        };
      }

      let sourceVal: SourceType = 'FUTURE_SOURCE';
      if (input.sourceContext === 'META' || input.sourceContext === 'META_AD_LIBRARY') {
        sourceVal = 'META_AD_LIBRARY';
      } else if (input.sourceContext === 'USER_PROVIDED' || input.sourceContext === 'USER_PROVIDED_DOMAIN') {
        sourceVal = 'USER_PROVIDED_DOMAIN';
      }

      return {
        source: sourceVal,
        provenance: 'WEBSITE_DERIVED',
        fieldName,
        acquisitionContext: 'WEBSITE_DIRECT',
        restrictionBasis: 'NONE',
        isRestricted: false,
        policyStatus: 'POLICY_APPROVED',
        persistenceStatus: 'PERSISTABLE',
        exportStatus: 'EXPORTABLE'
      };
    };

    const targetDomain = websiteResult?.identity?.domain || '';
    const contacts: CanonicalContact[] = [];
    const rootTargetUrl = input.targetUrl || websiteResult?.identity?.canonicalUrl || '';

    // ==========================================
    // 1. Process Emails
    // ==========================================
    const rawEmails = websiteResult?.emails || [];
    for (const raw of rawEmails) {
      const emailVal = raw.normalizedEmail || (raw as any).rawEmail || raw.rawValue;
      const emailRes = processEmailIntelligence(emailVal, targetDomain);
      if (!emailRes.isValid) continue;

      const norm = emailRes.normalizedEmail;
      const existing = contacts.find(c => c.contactType === 'EMAIL' && c.normalizedValue === norm);

      const sourcePage = (raw as any).sourceUrl || raw.evidence?.[0]?.pageUrl || rootTargetUrl;

      if (existing) {
        // Multi-page corroboration
        if (sourcePage && !existing.sourcePages.includes(sourcePage)) {
          existing.sourcePages.push(sourcePage);
          existing.evidenceType = 'MULTI_PAGE_CORROBORATED';
        }
        existing.lastObservedAt = observedAt;
        existing.observationCount++;
      } else {
        const contactId = `ct_email_${norm.replace(/[^a-zA-Z0-9]/g, '_')}`;
        contacts.push({
          contactId,
          contactType: 'EMAIL',
          rawValue: raw.rawValue || (raw as any).rawEmail || norm,
          normalizedValue: norm,
          sourceUrl: sourcePage,
          sourcePages: sourcePage ? [sourcePage] : [],
          evidenceType: emailRes.evidenceClassification,
          confidenceState: emailRes.confidenceState,
          emailClassification: emailRes.classification,
          emailDomainRelationship: emailRes.domainRelationship,
          associatedPersonIds: [],
          provenance: 'WEBSITE_DERIVED',
          sourceContributions: [makeContribution('email')],
          firstObservedAt: observedAt,
          lastObservedAt: observedAt,
          observationCount: 1
        });
      }
    }

    // ==========================================
    // 2. Process Phones
    // ==========================================
    const rawPhones = websiteResult?.phones || [];
    for (const raw of rawPhones) {
      const phoneVal = (raw as any).rawNumber || raw.rawValue || (raw as any).normalizedNumber || raw.normalizedValue;
      const phoneRes = processPhoneIntelligence(phoneVal);
      if (!phoneRes.isValid) continue;

      const norm = phoneRes.normalizedValue;
      const existing = contacts.find(c => c.contactType === 'PHONE' && c.normalizedValue === norm);

      const sourcePage = (raw as any).sourceUrl || raw.evidence?.[0]?.pageUrl || rootTargetUrl;

      if (existing) {
        if (sourcePage && !existing.sourcePages.includes(sourcePage)) {
          existing.sourcePages.push(sourcePage);
          existing.evidenceType = 'MULTI_PAGE_CORROBORATED';
        }
        existing.lastObservedAt = observedAt;
        existing.observationCount++;
      } else {
        const contactId = `ct_phone_${norm.replace(/[^0-9]/g, '') || String(contacts.length + 1)}`;
        contacts.push({
          contactId,
          contactType: 'PHONE',
          rawValue: raw.rawValue || (raw as any).rawNumber || norm,
          normalizedValue: norm,
          label: phoneRes.label || raw.label,
          sourceUrl: sourcePage,
          sourcePages: sourcePage ? [sourcePage] : [],
          evidenceType: phoneRes.evidenceClassification,
          confidenceState: phoneRes.confidenceState,
          associatedPersonIds: [],
          provenance: 'WEBSITE_DERIVED',
          sourceContributions: [makeContribution('phone')],
          firstObservedAt: observedAt,
          lastObservedAt: observedAt,
          observationCount: 1
        });
      }
    }

    // ==========================================
    // 3. Process Contact Forms
    // ==========================================
    const rawForms = websiteResult?.contactForms || [];
    for (const form of rawForms) {
      if ((form as any).present === false) continue;
      const formUrl = (form as any).pageUrl || (form as any).actionUrl || (form as any).sourceUrl || rootTargetUrl;
      if (!formUrl) continue;
      const contactId = `ct_form_${formUrl.replace(/[^a-zA-Z0-9]/g, '_').slice(-20)}`;

      if (!contacts.some(c => c.contactType === 'CONTACT_FORM' && c.normalizedValue === formUrl)) {
        contacts.push({
          contactId,
          contactType: 'CONTACT_FORM',
          rawValue: formUrl,
          normalizedValue: formUrl,
          label: 'Contact Form',
          sourceUrl: formUrl,
          sourcePages: [formUrl],
          evidenceType: 'STRUCTURED_DATA',
          confidenceState: 'HIGH',
          associatedPersonIds: [],
          provenance: 'WEBSITE_DERIVED',
          sourceContributions: [makeContribution('contact_form')],
          firstObservedAt: observedAt,
          lastObservedAt: observedAt,
          observationCount: 1
        });
      }
    }

    // Helper for canonical social URLs
    const normalizeSocialUrl = (rawUrl: string): string => {
      const trimmed = (rawUrl || '').trim();
      if (!/^https?:\/\//i.test(trimmed)) {
        return '';
      }
      try {
        const u = new URL(trimmed);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
        const host = u.hostname.toLowerCase().replace(/^www\./, '');
        const pathname = u.pathname.replace(/\/+$/, '');
        return `https://${host}${pathname}`;
      } catch {
        return '';
      }
    };

    // ==========================================
    // 4. Process Social Profiles
    // ==========================================
    const rawSocial = websiteResult?.socialProfiles || [];
    for (const soc of rawSocial) {
      const rawUrl = soc.rawUrl || (soc as any).url || '';
      const normUrl = normalizeSocialUrl(rawUrl);

      // Discard invalid/unsafe or sharing widgets
      if (!normUrl || /sharer\.php|intent\/tweet|sharearticle/i.test(normUrl)) {
        continue;
      }

      const existing = contacts.find(c => c.contactType === 'SOCIAL_PROFILE' && c.normalizedValue === normUrl);
      const sourcePage = soc.pageObserved || (soc as any).sourceUrl || rootTargetUrl;

      if (existing) {
        if (sourcePage && !existing.sourcePages.includes(sourcePage)) {
          existing.sourcePages.push(sourcePage);
        }
        existing.lastObservedAt = observedAt;
        existing.observationCount++;
      } else {
        const contactId = `ct_social_${soc.platform.toLowerCase()}_${contacts.length + 1}`;
        contacts.push({
          contactId,
          contactType: 'SOCIAL_PROFILE',
          rawValue: rawUrl,
          normalizedValue: normUrl,
          label: soc.platform,
          sourceUrl: sourcePage,
          sourcePages: sourcePage ? [sourcePage] : [],
          evidenceType: 'PUBLICLY_LISTED',
          confidenceState: 'HIGH',
          socialPlatform: soc.platform,
          socialAssociationType: 'BUSINESS_PROFILE',
          socialProfile: { platform: soc.platform, associationType: 'BUSINESS_PROFILE' },
          associatedPersonIds: [],
          provenance: 'WEBSITE_DERIVED',
          sourceContributions: [makeContribution('social')],
          firstObservedAt: observedAt,
          lastObservedAt: observedAt,
          observationCount: 1
        });
      }
    }

    // ==========================================
    // 5. Process Public People
    // ==========================================
    const rawPeople = websiteResult?.publicPeople || [];
    const canonicalPeople = clusterAndDeduplicatePeople(rawPeople, observedAt);

    // Apply contributions to people and extract individual contacts (e.g. LinkedIn)
    for (const p of canonicalPeople) {
      p.sourceContributions = [makeContribution('person')];
      p.fullName = this.sanitizeText(p.fullName);
      if (p.jobTitle) p.jobTitle = this.sanitizeText(p.jobTitle);

      for (const rawLnk of p.socialRefs) {
        const normLnk = normalizeSocialUrl(rawLnk);
        if (!contacts.some(c => c.contactType === 'SOCIAL_PROFILE' && c.normalizedValue === normLnk)) {
          const contactId = `ct_social_linkedin_${contacts.length + 1}`;
          contacts.push({
            contactId,
            contactType: 'SOCIAL_PROFILE',
            rawValue: rawLnk,
            normalizedValue: normLnk,
            label: 'LINKEDIN',
            sourceUrl: p.sourcePages[0] || rootTargetUrl,
            sourcePages: p.sourcePages.slice(),
            evidenceType: 'PUBLICLY_LISTED',
            confidenceState: 'HIGH',
            socialPlatform: 'LINKEDIN',
            socialAssociationType: 'PERSON_PROFILE',
            socialProfile: { platform: 'LINKEDIN', associationType: 'PERSON_PROFILE' },
            associatedPersonId: p.personId,
            associatedPersonIds: [p.personId],
            associationStrength: 'EXPLICIT_ASSOCIATION',
            associationConfidence: 'EXPLICIT_ASSOCIATION',
            provenance: 'WEBSITE_DERIVED',
            sourceContributions: [makeContribution('social')],
            firstObservedAt: observedAt,
            lastObservedAt: observedAt,
            observationCount: 1
          });
        }
      }
    }

    // ==========================================
    // 6. Contact ↔ Person Association
    // ==========================================
    associateContactsAndPeople(contacts, canonicalPeople, rawPeople);

    // ==========================================
    // 7. Freshness Tracking against Previous Session
    // ==========================================
    const prevContacts = input.previousSession?.canonicalContacts || input.previousSnapshot?.contacts || [];
    for (const contact of contacts) {
      const prev = prevContacts.find(p => {
        if (p.contactType !== contact.contactType) return false;
        if (contact.contactType === 'PHONE') {
          const d1 = p.normalizedValue.replace(/[^0-9]/g, '');
          const d2 = contact.normalizedValue.replace(/[^0-9]/g, '');
          return d1 === d2 || (d1.length >= 10 && d2.length >= 10 && (d1.endsWith(d2) || d2.endsWith(d1)));
        }
        return p.normalizedValue.toLowerCase() === contact.normalizedValue.toLowerCase();
      });
      if (prev) {
        contact.firstObservedAt = prev.firstObservedAt || prev.lastObservedAt;
        contact.lastObservedAt = observedAt;
        contact.observationCount = (prev.observationCount || 1) + 1;
      }
    }

    // ==========================================
    // 8. Conflict Detection
    // ==========================================
    const conflicts: ContactConflictRecord[] = [];
    if (websiteResult?.conflicts) {
      for (const conf of websiteResult.conflicts) {
        conflicts.push({
          conflictType: conf.conflictType as any,
          values: conf.values.map(v => ({
            value: v.value,
            sourceUrl: v.sourceUrl,
            observedAt: v.observedAt || observedAt
          })),
          corroborationCount: conf.values.length
        });
      }
    }

    // Deduce multi-contact conflicts (distinct public emails or phones on site)
    const distinctEmails = contacts.filter(c => c.contactType === 'EMAIL');
    if (distinctEmails.length > 1 && !conflicts.some(c => c.conflictType === 'EMAIL_CONFLICT')) {
      conflicts.push({
        conflictType: 'EMAIL_CONFLICT',
        values: distinctEmails.map(e => ({
          value: e.normalizedValue,
          sourceUrl: e.sourceUrl || rootTargetUrl,
          observedAt
        })),
        corroborationCount: distinctEmails.length
      });
    }

    const distinctPhones = contacts.filter(c => c.contactType === 'PHONE');
    if (distinctPhones.length > 1 && !conflicts.some(c => c.conflictType === 'PHONE_CONFLICT')) {
      conflicts.push({
        conflictType: 'PHONE_CONFLICT',
        values: distinctPhones.map(p => ({
          value: p.normalizedValue,
          sourceUrl: p.sourceUrl || rootTargetUrl,
          observedAt
        })),
        corroborationCount: distinctPhones.length
      });
    }

    // Detect conflicting titles for the same person
    for (const p of canonicalPeople) {
      const distinctTitles = new Set(p.evidence.map(e => e.snippet).filter(Boolean) as string[]);
      if (distinctTitles.size > 1) {
        conflicts.push({
          conflictType: 'TITLE_CONFLICT',
          values: Array.from(distinctTitles).map(t => ({
            value: t,
            sourceUrl: p.sourcePages[0] || rootTargetUrl,
            observedAt
          })),
          corroborationCount: distinctTitles.size
        });
      }
    }

    // ==========================================
    // 9. Completeness & Priority Signals
    // ==========================================
    const completeness = calculateContactCompleteness(contacts, canonicalPeople);
    const prioritySignal = determineContactPrioritySignal(contacts, canonicalPeople, conflicts);

    // ==========================================
    // 10. Source Graph
    // ==========================================
    const pagesVisited = websiteResult?.sourcePages || [rootTargetUrl];
    const sourceGraph = buildContactSourceGraph(rootTargetUrl, pagesVisited, contacts, canonicalPeople);

    // ==========================================
    // 11. Change Detection
    // ==========================================
    const prevSession = input.previousSession || input.previousSnapshot;
    const changes = detectContactChanges(prevSession, contacts, canonicalPeople);

    // Emitted result contributions
    const resultContributions: SourceContribution[] = [
      makeContribution('contact_intelligence')
    ];

    return {
      contacts,
      people: canonicalPeople,
      prioritySignal,
      completeness,
      sourceGraph,
      conflicts,
      changes,
      provenance: isGoogleRestricted ? 'GOOGLE_DERIVED' : 'LEADNORIA_DERIVED',
      sourceContributions: resultContributions,
      observedAt,
      isRestricted: isGoogleRestricted,
      persistenceEligibility: isGoogleRestricted ? 'NOT_PERSISTABLE' : 'PERSISTABLE',
      exportEligibility: isGoogleRestricted ? 'NOT_EXPORTABLE' : 'EXPORTABLE',
      restrictionBasis: isGoogleRestricted ? 'GOOGLE_CONSUMER_WEB_RESTRICTED' : undefined
    };
  }
}
