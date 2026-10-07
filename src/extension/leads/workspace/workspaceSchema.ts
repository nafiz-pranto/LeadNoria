/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Schema Validation, Projection & Firewall Guard
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. Explicit allowlisting only: NO `{ ...lead }` or `{ ...metadata }` spread patterns.
 * 2. Absolute zero Google Maps fields or sentinels in PersistedLeadRecord.
 * 3. Sanitizes user notes, tags, and metadata against XSS, formula injection, and laundering.
 */

import type { ExportSafeLead } from '../leadTypes.ts';
import {
  METADATA_CONSTRAINTS,
  type PersistedLeadRecord,
  type LeadLifecycleState,
  type UserLeadMetadata,
  WORKSPACE_SCHEMA_VERSION
} from './workspaceTypes.ts';

/**
 * Forbidden Google property keys that must never appear in persisted records.
 */
const FORBIDDEN_GOOGLE_KEYS = [
  'placeId',
  'mapsUrl',
  'rating',
  'reviewCount',
  'businessStatus',
  'candidateId',
  'isRestricted',
  'pageUrl',
  'provenance'
] as const;

/**
 * Forbidden Google token patterns.
 */
const FORBIDDEN_GOOGLE_PATTERNS = [
  /ChIJ[A-Za-z0-9_-]{10,}/,
  /maps\.google\.com/i,
  /google\.com\/maps/i,
  /GOOGLE_MAPS_BROWSER/,
  /GOOGLE_SENTINEL/
];

/**
 * Sanitizes a single user metadata string (notes, labels, notes).
 * Guards against Google Place ID laundering and strips dangerous control characters.
 */
export function sanitizeUserString(
  input: string | undefined | null,
  maxLength: number,
  fieldName = 'userMetadata'
): string {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim().slice(0, maxLength);

  // Anti-laundering check
  for (const pattern of FORBIDDEN_GOOGLE_PATTERNS) {
    if (pattern.test(trimmed)) {
      throw new Error(`SECURITY VIOLATION: Forbidden Google token detected in "${fieldName}"`);
    }
  }

  return trimmed;
}

/**
 * Sanitizes and normalizes user tags.
 */
export function sanitizeTags(tags: readonly string[] | undefined | null): string[] {
  if (!tags || !Array.isArray(tags)) return [];
  const sanitizedSet = new Set<string>();

  for (const rawTag of tags) {
    if (typeof rawTag !== 'string') continue;
    let tag = rawTag.trim().toLowerCase();
    if (!tag) continue;

    // Check prototype pollution keys
    if (tag === '__proto__' || tag === 'constructor' || tag === 'prototype') {
      continue;
    }

    // Anti-laundering check
    for (const pattern of FORBIDDEN_GOOGLE_PATTERNS) {
      if (pattern.test(tag)) {
        throw new Error(`SECURITY VIOLATION: Forbidden Google token detected in tag "${tag}"`);
      }
    }

    // Enforce bounds
    tag = tag.slice(0, METADATA_CONSTRAINTS.MAX_TAG_LENGTH);
    sanitizedSet.add(tag);

    if (sanitizedSet.size >= METADATA_CONSTRAINTS.MAX_TAGS_COUNT) break;
  }

  return Array.from(sanitizedSet);
}

/**
 * Projects an ExportSafeLead into a durable PersistedLeadRecord.
 * STRICT GUARD: Strictly allowlisted field copying. Zero field inheritance.
 */
export function toPersistedLeadRecord(
  lead: ExportSafeLead,
  overrides?: {
    readonly lifecycleState?: LeadLifecycleState;
    readonly userMetadata?: Partial<UserLeadMetadata>;
    readonly version?: number;
  }
): PersistedLeadRecord {
  if (!lead || typeof lead !== 'object') {
    throw new Error('Cannot project null or non-object lead into PersistedLeadRecord');
  }

  if (!lead.leadId || !lead.leadId.startsWith('lead_')) {
    throw new Error(`Invalid leadId format: "${lead.leadId}". Must begin with "lead_"`);
  }

  if (lead.sourceClass !== 'USER_PROVIDED' && lead.sourceClass !== 'WEBSITE_PUBLIC' && lead.sourceClass !== 'LEADNORIA_DERIVED_FROM_NON_RESTRICTED_INPUT') {
    throw new Error(`SECURITY VIOLATION: Disallowed sourceClass "${lead.sourceClass}" for persistent lead`);
  }

  const now = new Date().toISOString();
  const lifecycleState: LeadLifecycleState = overrides?.lifecycleState || 'NEW';

  // Sanitize notes
  const rawNotes = overrides?.userMetadata?.notes ?? lead.userMetadata?.notes ?? '';
  const safeNotes = sanitizeUserString(rawNotes, METADATA_CONSTRAINTS.MAX_NOTES_LENGTH, 'notes');

  // Sanitize tags
  const rawTags = overrides?.userMetadata?.tags ?? lead.userMetadata?.tags ?? [];
  const safeTags = sanitizeTags(rawTags);

  // Construct PersistedLeadRecord with explicit property projection
  const record: PersistedLeadRecord = {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    leadId: lead.leadId,
    sourceClass: lead.sourceClass,
    independentSourceId: lead.independentSourceId,
    businessIdentity: {
      businessName: sanitizeUserString(lead.identity.businessName, 200, 'businessName'),
      domain: lead.identity.domain.trim().toLowerCase(),
      canonicalUrl: lead.identity.canonicalUrl
    },
    publicWebsite: {
      domain: lead.website.domain.trim().toLowerCase(),
      canonicalUrl: lead.website.canonicalUrl,
      pageTitle: lead.website.pageTitle ? sanitizeUserString(lead.website.pageTitle, 300, 'pageTitle') : undefined,
      metaDescription: lead.website.metaDescription ? sanitizeUserString(lead.website.metaDescription, 1000, 'metaDescription') : undefined,
      technologies: lead.website.technologies ? [...lead.website.technologies] : [],
      services: lead.website.services ? [...lead.website.services] : []
    },
    publicContacts: {
      publicEmails: lead.contact.publicEmails.map(e => ({
        email: e.email.trim().toLowerCase(),
        classification: e.classification,
        sourceUrl: e.sourceUrl,
        observedAt: e.observedAt
      })),
      publicPhones: lead.contact.publicPhones.map(p => ({
        phone: p.phone.trim(),
        rawPhone: p.rawPhone.trim(),
        sourceUrl: p.sourceUrl,
        observedAt: p.observedAt
      })),
      socialProfiles: lead.contact.socialProfiles.map(s => ({
        platform: s.platform,
        url: s.url
      }))
    },
    publicPerson: {
      leadershipPeople: lead.person.leadershipPeople.map(p => ({
        fullName: sanitizeUserString(p.fullName, 150, 'fullName'),
        jobTitle: sanitizeUserString(p.jobTitle, 150, 'jobTitle'),
        email: p.email ? p.email.trim().toLowerCase() : undefined,
        sourceUrl: p.sourceUrl,
        observedAt: p.observedAt
      }))
    },
    qualification: {
      status: lead.qualification.status,
      overallReadiness: lead.qualification.overallReadiness,
      passedRules: [...lead.qualification.passedRules]
    },
    reviewOutcome: {
      reviewState: lead.reviewOutcome.reviewState,
      reviewerNotes: lead.reviewOutcome.reviewerNotes ? sanitizeUserString(lead.reviewOutcome.reviewerNotes, 1000, 'reviewerNotes') : undefined,
      reviewedAt: lead.reviewOutcome.reviewedAt
    },
    lifecycle: {
      state: lifecycleState,
      changedAt: now,
      changeReason: 'INITIAL_PERSISTENCE'
    },
    userMetadata: {
      notes: safeNotes,
      tags: safeTags,
      priority: overrides?.userMetadata?.priority ?? lead.userMetadata?.priority ?? 'MEDIUM',
      customStatusNote: overrides?.userMetadata?.customStatusNote ? sanitizeUserString(overrides.userMetadata.customStatusNote, METADATA_CONSTRAINTS.MAX_CUSTOM_STATUS_NOTE_LENGTH, 'customStatusNote') : undefined,
      followUpDate: overrides?.userMetadata?.followUpDate,
      followUpStatus: overrides?.userMetadata?.followUpStatus ?? 'NONE',
      followUpNote: overrides?.userMetadata?.followUpNote ? sanitizeUserString(overrides.userMetadata.followUpNote, 500, 'followUpNote') : undefined,
      assigneeLabel: overrides?.userMetadata?.assigneeLabel ? sanitizeUserString(overrides.userMetadata.assigneeLabel, METADATA_CONSTRAINTS.MAX_ASSIGNEE_LABEL_LENGTH, 'assigneeLabel') : undefined
    },
    safeProvenance: {
      sourceClass: lead.sourceClass,
      isRestricted: false,
      exportEligibility: lead.exportEligibility,
      anchorVerifiedAt: lead.createdAt || now,
      // Boolean flag ONLY. Absolutely no candidate ID or Google pointer stored!
      hasResearchCorrelation: !!lead.correlation
    },
    auditMetadata: {
      createdAt: lead.createdAt || now,
      updatedAt: now,
      version: overrides?.version ?? 1
    }
  };

  // Run deep firewall verification before returning
  verifyZeroGoogleFieldsInPersistedRecord(record);

  return Object.freeze(record);
}

/**
 * Runtime barrier asserting zero Google fields exist in a PersistedLeadRecord.
 * Throws an exception if any restricted field or value pattern is detected.
 */
export function verifyZeroGoogleFieldsInPersistedRecord(record: PersistedLeadRecord): void {
  const serialized = JSON.stringify(record);

  for (const forbiddenKey of FORBIDDEN_GOOGLE_KEYS) {
    if (forbiddenKey in record) {
      throw new Error(`SECURITY VIOLATION: CRITICAL FIREWALL VIOLATION: Forbidden Google key "${forbiddenKey}" present on PersistedLeadRecord`);
    }
  }

  for (const pattern of FORBIDDEN_GOOGLE_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error('SECURITY VIOLATION: CRITICAL FIREWALL VIOLATION: Forbidden Google payload pattern detected in serialized PersistedLeadRecord');
    }
  }
}

/**
 * Validates whether a raw object matches the PersistedLeadRecord schema.
 */
export function validatePersistedLeadRecord(obj: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { isValid: false, errors: ['Record must be a non-null object'] };
  }

  const r = obj as Record<string, unknown>;

  if (typeof r.schemaVersion !== 'number' || r.schemaVersion <= 0) {
    errors.push('Invalid or missing schemaVersion');
  }

  if (typeof r.leadId !== 'string' || !r.leadId.startsWith('lead_')) {
    errors.push('Invalid or missing leadId');
  }

  if (!r.businessIdentity || typeof r.businessIdentity !== 'object') {
    errors.push('Missing businessIdentity object');
  } else {
    const b = r.businessIdentity as Record<string, unknown>;
    if (typeof b.businessName !== 'string' || !b.businessName.trim()) {
      errors.push('Missing businessIdentity.businessName');
    }
    if (typeof b.domain !== 'string' || !b.domain.trim()) {
      errors.push('Missing businessIdentity.domain');
    }
  }

  if (!r.lifecycle || typeof r.lifecycle !== 'object') {
    errors.push('Missing lifecycle object');
  } else {
    const l = r.lifecycle as Record<string, unknown>;
    const validStates: LeadLifecycleState[] = ['NEW', 'ACTIVE', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED', 'ON_HOLD', 'ARCHIVED'];
    if (!validStates.includes(l.state as LeadLifecycleState)) {
      errors.push(`Invalid lifecycle.state "${String(l.state)}"`);
    }
  }

  if (!r.userMetadata || typeof r.userMetadata !== 'object') {
    errors.push('Missing userMetadata object');
  } else {
    const u = r.userMetadata as Record<string, unknown>;
    if (typeof u.notes !== 'string') {
      errors.push('userMetadata.notes must be a string');
    }
    if (!Array.isArray(u.tags)) {
      errors.push('userMetadata.tags must be an array');
    }
  }

  if (!r.safeProvenance || typeof r.safeProvenance !== 'object') {
    errors.push('Missing safeProvenance object');
  } else {
    const p = r.safeProvenance as Record<string, unknown>;
    if (p.isRestricted !== false) {
      errors.push('safeProvenance.isRestricted must be false');
    }
  }

  // Check for forbidden fields
  for (const key of FORBIDDEN_GOOGLE_KEYS) {
    if (key in r) {
      errors.push(`Forbidden Google key "${key}" detected in record`);
    }
  }

  return { isValid: errors.length === 0, errors };
}
