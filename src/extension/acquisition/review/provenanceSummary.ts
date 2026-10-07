/**
 * LeadNoria — Google Maps Unified Candidate Review & Qualification Layer
 * Part 7: Field-Level Provenance & Source Lineage Model
 *
 * HARD INVARIANTS:
 * - Every displayed evidence-bearing field preserves source classification.
 * - GOOGLE_MAPS_BROWSER fields are explicitly flagged as isRestricted = true.
 * - Website/Contact/Person fields are classified with their respective public source.
 * - Never present derived or user-reviewed facts as if they came directly from Google.
 */

import type { SessionCandidate } from '../engine/candidateIdentityTypes.ts';
import type { FieldProvenanceRecord } from './reviewTypes.ts';

/**
 * Summarizes field-level provenance across Maps observations, Website crawling,
 * Contact extraction, and Person intelligence.
 */
export function summarizeCandidateProvenance(
  candidate: SessionCandidate
): readonly FieldProvenanceRecord[] {
  const records: FieldProvenanceRecord[] = [];
  const mapsObservedAt = candidate.firstObservedAt || new Date().toISOString();
  const enrichCompletedAt = candidate.enrichmentResult?.completedAt || candidate.lastObservedAt || mapsObservedAt;

  // 1. Google Maps Browser Observations (Restricted)
  if (candidate.businessName?.parsedValue || candidate.businessName?.rawValue) {
    records.push(Object.freeze({
      fieldName: 'businessName',
      source: 'GOOGLE_MAPS_BROWSER',
      value: candidate.businessName.parsedValue || candidate.businessName.rawValue,
      availability: candidate.businessName.availability,
      confidence: candidate.businessName.confidence ?? 1.0,
      observedAt: mapsObservedAt,
      isRestricted: true
    }));
  }

  if (candidate.address?.parsedValue || candidate.address?.rawValue) {
    records.push(Object.freeze({
      fieldName: 'address',
      source: 'GOOGLE_MAPS_BROWSER',
      value: candidate.address.parsedValue || candidate.address.rawValue,
      availability: candidate.address.availability,
      confidence: candidate.address.confidence ?? 0.95,
      observedAt: mapsObservedAt,
      isRestricted: true
    }));
  }

  if (candidate.phone?.parsedValue || candidate.phone?.rawValue) {
    records.push(Object.freeze({
      fieldName: 'mapsPhone',
      source: 'GOOGLE_MAPS_BROWSER',
      value: candidate.phone.parsedValue || candidate.phone.rawValue,
      availability: candidate.phone.availability,
      confidence: candidate.phone.confidence ?? 0.95,
      observedAt: mapsObservedAt,
      isRestricted: true
    }));
  }

  if (candidate.websiteUrl?.parsedValue || candidate.websiteUrl?.rawValue) {
    records.push(Object.freeze({
      fieldName: 'mapsWebsiteUrl',
      source: 'GOOGLE_MAPS_BROWSER',
      value: candidate.websiteUrl.parsedValue || candidate.websiteUrl.rawValue,
      availability: candidate.websiteUrl.availability,
      confidence: candidate.websiteUrl.confidence ?? 0.95,
      observedAt: mapsObservedAt,
      isRestricted: true
    }));
  }

  if (candidate.rating?.parsedValue !== undefined) {
    records.push(Object.freeze({
      fieldName: 'rating',
      source: 'GOOGLE_MAPS_BROWSER',
      value: candidate.rating.parsedValue,
      availability: candidate.rating.availability,
      confidence: candidate.rating.confidence ?? 1.0,
      observedAt: mapsObservedAt,
      isRestricted: true
    }));
  }

  if (candidate.reviewCount?.parsedValue !== undefined) {
    records.push(Object.freeze({
      fieldName: 'reviewCount',
      source: 'GOOGLE_MAPS_BROWSER',
      value: candidate.reviewCount.parsedValue,
      availability: candidate.reviewCount.availability,
      confidence: candidate.reviewCount.confidence ?? 1.0,
      observedAt: mapsObservedAt,
      isRestricted: true
    }));
  }

  if (candidate.placeId?.parsedValue || candidate.placeId?.rawValue) {
    records.push(Object.freeze({
      fieldName: 'placeId',
      source: 'GOOGLE_MAPS_BROWSER',
      value: candidate.placeId.parsedValue || candidate.placeId.rawValue,
      availability: candidate.placeId.availability,
      confidence: candidate.placeId.confidence ?? 1.0,
      observedAt: mapsObservedAt,
      isRestricted: true
    }));
  }

  // 2. Website Public Intelligence
  const webEv = candidate.enrichmentResult?.websiteEvidence;
  if (webEv) {
    if (webEv.domain) {
      records.push(Object.freeze({
        fieldName: 'domain',
        source: 'WEBSITE_PUBLIC',
        value: webEv.domain,
        availability: 'PRESENT',
        confidence: 1.0,
        observedAt: enrichCompletedAt,
        isRestricted: false,
        sourceUrl: webEv.targetUrl
      }));
    }

    if (webEv.pageTitle) {
      records.push(Object.freeze({
        fieldName: 'pageTitle',
        source: 'WEBSITE_PUBLIC',
        value: webEv.pageTitle,
        availability: 'PRESENT',
        confidence: 0.95,
        observedAt: enrichCompletedAt,
        isRestricted: false,
        sourceUrl: webEv.targetUrl
      }));
    }

    if (webEv.description || webEv.metaDescription) {
      records.push(Object.freeze({
        fieldName: 'websiteDescription',
        source: 'WEBSITE_PUBLIC',
        value: webEv.description || webEv.metaDescription,
        availability: 'PRESENT',
        confidence: 0.90,
        observedAt: enrichCompletedAt,
        isRestricted: false,
        sourceUrl: webEv.targetUrl
      }));
    }

    if (webEv.technologies && webEv.technologies.length > 0) {
      records.push(Object.freeze({
        fieldName: 'technologies',
        source: 'WEBSITE_PUBLIC',
        value: webEv.technologies.map(t => t.name),
        availability: 'PRESENT',
        confidence: 0.85,
        observedAt: enrichCompletedAt,
        isRestricted: false,
        sourceUrl: webEv.targetUrl
      }));
    }
  }

  // 3. Contact Public Intelligence
  const contactEv = candidate.enrichmentResult?.contactEvidence;
  if (contactEv) {
    if (contactEv.emails && contactEv.emails.length > 0) {
      records.push(Object.freeze({
        fieldName: 'websiteEmails',
        source: 'CONTACT_PUBLIC',
        value: contactEv.emails.map(e => e.email),
        availability: 'PRESENT',
        confidence: 0.90,
        observedAt: enrichCompletedAt,
        isRestricted: false,
        sourceUrl: contactEv.emails[0]?.sourceUrl
      }));
    }

    if (contactEv.phones && contactEv.phones.length > 0) {
      records.push(Object.freeze({
        fieldName: 'websitePhones',
        source: 'CONTACT_PUBLIC',
        value: contactEv.phones.map(p => p.phone),
        availability: 'PRESENT',
        confidence: 0.90,
        observedAt: enrichCompletedAt,
        isRestricted: false,
        sourceUrl: contactEv.phones[0]?.sourceUrl
      }));
    }

    if (contactEv.socialProfiles && contactEv.socialProfiles.length > 0) {
      records.push(Object.freeze({
        fieldName: 'socialProfiles',
        source: 'CONTACT_PUBLIC',
        value: contactEv.socialProfiles.map(s => `${s.platform}: ${s.url}`),
        availability: 'PRESENT',
        confidence: 0.85,
        observedAt: enrichCompletedAt,
        isRestricted: false,
        sourceUrl: contactEv.socialProfiles[0]?.sourceUrl
      }));
    }

    if (contactEv.address?.address) {
      records.push(Object.freeze({
        fieldName: 'websiteAddress',
        source: 'CONTACT_PUBLIC',
        value: contactEv.address.address,
        availability: 'PRESENT',
        confidence: 0.85,
        observedAt: enrichCompletedAt,
        isRestricted: false,
        sourceUrl: contactEv.address.sourceUrl
      }));
    }
  }

  // 4. Person Public Intelligence
  const personEv = candidate.enrichmentResult?.personEvidence;
  if (personEv && personEv.people && personEv.people.length > 0) {
    records.push(Object.freeze({
      fieldName: 'leadershipPeople',
      source: 'PERSON_PUBLIC',
      value: personEv.people.map(p => `${p.fullName}${p.jobTitle ? ` (${p.jobTitle})` : ''}`),
      availability: 'PRESENT',
      confidence: 0.85,
      observedAt: enrichCompletedAt,
      isRestricted: false,
      sourceUrl: personEv.people[0]?.sourceUrl
    }));
  }

  // 5. Derived Analysis (Quality & Identity)
  records.push(Object.freeze({
    fieldName: 'identityMethod',
    source: 'DERIVED',
    value: candidate.identityMethod,
    availability: 'PRESENT',
    confidence: candidate.identityConfidence,
    observedAt: candidate.lastObservedAt || mapsObservedAt,
    isRestricted: false
  }));

  records.push(Object.freeze({
    fieldName: 'dataCompleteness',
    source: 'DERIVED',
    value: `${candidate.qualityMetrics?.dataCompleteness ?? 0}%`,
    availability: 'PRESENT',
    confidence: 1.0,
    observedAt: candidate.lastObservedAt || mapsObservedAt,
    isRestricted: false
  }));

  return Object.freeze(records);
}
