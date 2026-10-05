/**
 * LeadNoria — Phase 24 Test Suite
 * Unified Lead Intelligence & Cross-Source Record Assembly
 *
 * Covers:
 * 1-6. Canonical Assembly (Single-source Meta, Website, multi-source, Google+Website, Meta+Website, Meta+Google+Website)
 * 7-10. Field Lineage (Field-level provenance, multiple source contributions, transformation lineage, source URL preservation)
 * 11-14. Entity Resolution (Consumes Phase 8 canonical entity, branch separation, parent/branch relationship, no reimplementing entity merging)
 * 15-20. Conflicts (Business names, phones, addresses, websites, categories, no arbitrary winner without policy)
 * 21-24. Corroboration (Phone corroboration, identity corroboration, domain corroboration, multi-source count)
 * 25-29. Freshness (Per-source timestamps, stale source, current source, mixed freshness, NOT_OBSERVED_THIS_RUN)
 * 30-34. Change Tracking (New contact, changed phone, changed person, removed-from-run observation, preserved historical observation)
 * 35-39. Qualification (Attaches Phase 23 result, does not recalculate, preserves reason graph, preserves contradiction state, preserves blocking state)
 * 40-46. Google Firewall (Google-only restricted, Google+Website restricted, Google+Meta restricted, Google+Website+Meta restricted, Website child cannot launder, Qualification cannot launder, Evidence pack cannot launder)
 * 47-49. User Input (User value preserved, conflicting user/external preserved, no implicit override without policy)
 * 50-52. Export/Persistence (Uses existing ExportPolicy, uses existing persistence policy, no second independent firewall)
 * 53-54. Determinism (Identical inputs produce identical output, input order does not alter semantic result)
 * 55-59. Security (Prototype pollution, forged provenance, forged restriction state, malicious URL, oversized evidence)
 * 60. Performance (Large multi-source entity assembly remains bounded)
 */

import { RecordAssembler } from '../src/extension/leadIntelligence/recordAssembler.ts';
import { sanitizeObject, evaluateRestrictionFirewall } from '../src/extension/leadIntelligence/sanitizer.ts';
import { CURRENT_LEAD_RECORD_SCHEMA_VERSION } from '../src/extension/leadIntelligence/types.ts';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  [FAIL] ${message}`);
    failedTests++;
    throw new Error(message);
  } else {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  }
}

console.log('================================================================');
console.log('LEADNORIA PHASE 24: UNIFIED LEAD INTELLIGENCE TEST SUITE');
console.log('================================================================');

const assembler = new RecordAssembler();
const fixedNow = '2026-10-01T12:00:00.000Z';

// ==========================================
// GROUP 1: CANONICAL ASSEMBLY (TESTS 1 - 6)
// ==========================================
console.log('\n--- GROUP 1: CANONICAL ASSEMBLY ---');

// Test 1: single-source Meta record
{
  const rec = assembler.assemble({
    metaCandidate: {
      businessName: 'Apex Dental Care',
      pageUrl: 'https://facebook.com/apexdental',
      pageId: '10928374',
      adCount: 5,
      adStatus: 'ACTIVE',
      adPlatforms: ['facebook', 'instagram'],
      observedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  assert(rec.schemaVersion === CURRENT_LEAD_RECORD_SCHEMA_VERSION, 'Test 1: single-source Meta has valid schema version');
  assert(rec.canonicalBusinessName.value === 'Apex Dental Care', 'Test 1: single-source Meta preserves business name');
  assert(rec.sourceSignals.metaEvidence?.adCount === 5, 'Test 1: single-source Meta preserves ad count');
  assert(rec.policy.isRestricted === false, 'Test 1: single-source Meta is not restricted');
}

// Test 2: single-source Website record
{
  const rec = assembler.assemble({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://apexdental.com',
        domain: 'apexdental.com',
        pageTitle: 'Apex Dental Home',
        businessName: 'Apex Dental Care',
        phones: ['+1-555-0199'],
        emails: ['info@apexdental.com'],
        serviceAreas: ['Berlin'],
        services: ['Dental Implants'],
        categories: ['Dentist']
      },
      contacts: [],
      phones: [{
        rawValue: '+1-555-0199',
        normalizedValue: '15550199',
        nationalFormat: '(555) 0199',
        phoneType: 'MAIN',
        status: 'FOUND',
        evidence: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: []
      }],
      emails: [{
        rawValue: 'info@apexdental.com',
        normalizedEmail: 'info@apexdental.com',
        localPart: 'info',
        domainPart: 'apexdental.com',
        emailType: 'GENERIC_BUSINESS',
        status: 'FOUND',
        evidence: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: []
      }],
      socialProfiles: [],
      publicPeople: [],
      services: [{ name: 'Dental Implants', sourceUrl: 'https://apexdental.com', observedAt: fixedNow, provenance: 'WEBSITE_DERIVED' }],
      technologySignals: [{ name: 'WordPress', category: 'CMS', state: 'DETECTED', evidence: 'wp-content', observedAt: fixedNow, provenance: 'WEBSITE_DERIVED' }],
      contactForms: [],
      sourcePages: ['https://apexdental.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://apexdental.com'], pagesSkipped: [], pagesFailed: [], durationMs: 200, fromCache: false },
      verificationState: 'VERIFIED',
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  assert(rec.digital.verifiedWebsite.value === 'https://apexdental.com', 'Test 2: single-source Website verified website preserved');
  assert(rec.digital.cms === 'WordPress', 'Test 2: single-source Website CMS signal detected');
  assert(rec.policy.exportEligible === true, 'Test 2: single-source Website is export eligible');
}

// Test 3: multi-source record
{
  const rec = assembler.assemble({
    metaCandidate: { businessName: 'Apex Dental', pageUrl: 'https://facebook.com/apexdental', observedAt: fixedNow },
    websiteResult: {
      identity: { canonicalUrl: 'https://apexdental.com', domain: 'apexdental.com', pageTitle: 'Apex Dental' },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: [],
      crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 100, fromCache: false },
      verificationState: 'VERIFIED',
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  assert(rec.policy.overallProvenance === 'MIXED', 'Test 3: multi-source record has MIXED provenance');
  assert(rec.sourceSignals.metaEvidence !== undefined, 'Test 3: multi-source contains meta signals');
  assert(rec.sourceSignals.websiteEvidence !== undefined, 'Test 3: multi-source contains website signals');
}

// Test 4: Google + Website
{
  const rec = assembler.assemble({
    googleCandidate: {
      businessName: 'Apex Dental Google',
      placeId: 'ChIJ123456789',
      address: 'Friedrichstr 10, Berlin',
      phone: '+49 30 123456',
      websiteUrl: 'https://apexdental.de',
      isRestricted: true,
      observedAt: fixedNow
    },
    websiteResult: {
      identity: { canonicalUrl: 'https://apexdental.de', domain: 'apexdental.de', pageTitle: 'Apex Dental Germany' },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: [],
      crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 100, fromCache: false },
      verificationState: 'VERIFIED',
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  assert(rec.policy.isRestricted === true, 'Test 4: Google + Website preserves Google restriction');
  assert(rec.policy.exportEligible === false, 'Test 4: Google + Website is not export eligible');
  assert(rec.policy.persistenceEligible === false, 'Test 4: Google + Website is not persistable');
}

// Test 5: Meta + Website
{
  const rec = assembler.assemble({
    metaCandidate: { businessName: 'Nordic Law', pageUrl: 'https://facebook.com/nordiclaw', adCount: 2, observedAt: fixedNow },
    websiteResult: {
      identity: { canonicalUrl: 'https://nordiclaw.se', domain: 'nordiclaw.se', pageTitle: 'Nordic Law' },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: [],
      crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 100, fromCache: false },
      verificationState: 'VERIFIED',
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  assert(rec.policy.isRestricted === false, 'Test 5: Meta + Website remains unrestricted');
  assert(rec.policy.exportEligible === true, 'Test 5: Meta + Website is export eligible');
}

// Test 6: Meta + Google + Website
{
  const rec = assembler.assemble({
    metaCandidate: { businessName: 'Global Logistics', pageUrl: 'https://facebook.com/globallogistics', adCount: 4, observedAt: fixedNow },
    googleCandidate: { businessName: 'Global Logistics DE', placeId: 'ChIJ99999', isRestricted: true, observedAt: fixedNow },
    websiteResult: {
      identity: { canonicalUrl: 'https://globallogistics.com', domain: 'globallogistics.com', pageTitle: 'Global Logistics' },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: [],
      crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 100, fromCache: false },
      verificationState: 'VERIFIED',
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  assert(rec.sourceSignals.metaEvidence?.adCount === 4, 'Test 6: Tri-source Meta signal present');
  assert(rec.sourceSignals.googleEvidence?.placeId === 'ChIJ99999', 'Test 6: Tri-source Google signal present');
  assert(rec.sourceSignals.websiteEvidence?.domain === 'globallogistics.com', 'Test 6: Tri-source Website signal present');
  assert(rec.policy.isRestricted === true, 'Test 6: Tri-source with Google is restricted');
}

// ==========================================
// GROUP 2: FIELD LINEAGE (TESTS 7 - 10)
// ==========================================
console.log('\n--- GROUP 2: FIELD LINEAGE ---');

// Test 7: field-level provenance
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Bavaria Motors', phone: '+49 89 11111', isRestricted: true, observedAt: fixedNow },
    websiteResult: {
      identity: { canonicalUrl: 'https://bavaria-motors.de', domain: 'bavaria-motors.de', pageTitle: 'Bavaria Motors' },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: [],
      crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 100, fromCache: false },
      verificationState: 'VERIFIED',
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow
    },
    contactResult: {
      contacts: [{
        contactId: 'c1',
        contactType: 'EMAIL',
        rawValue: 'kontakt@bavaria-motors.de',
        normalizedValue: 'kontakt@bavaria-motors.de',
        sourceUrl: 'https://bavaria-motors.de/impressum',
        sourcePages: ['https://bavaria-motors.de/impressum'],
        evidenceType: 'VISIBLE_TEXT',
        confidenceState: 'HIGH',
        associatedPersonIds: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [],
        firstObservedAt: fixedNow,
        lastObservedAt: fixedNow,
        observationCount: 1
      }],
      people: [],
      prioritySignal: 'DIRECT_PUBLIC_CONTACT',
      completeness: { hasPublicEmail: true, hasPublicPhone: true, hasContactForm: false, hasSocialProfile: false, hasPublicPerson: false, hasPersonAssociatedEmail: false, hasPersonAssociatedPhone: false, contactCompletenessRatio: 0.5 },
      sourceGraph: { nodes: [], edges: [] },
      conflicts: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow,
      isRestricted: false
    },
    referenceNow: fixedNow
  });

  const email = rec.contacts.emails[0];
  const phone = rec.contacts.phones[0];
  assert(email.provenance === 'WEBSITE_DERIVED', 'Test 7: email field preserves WEBSITE_DERIVED provenance');
  assert(phone.provenance === 'GOOGLE_DERIVED', 'Test 7: phone field preserves GOOGLE_DERIVED provenance');
}

// Test 8: multiple source contributions
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Crown Bakery', observedAt: fixedNow },
    metaCandidate: { businessName: 'Crown Bakery Official', observedAt: fixedNow },
    referenceNow: fixedNow
  });

  assert(rec.canonicalBusinessName.alternatives.length === 2, 'Test 8: businessName retains both source contributions');
  assert(rec.canonicalBusinessName.alternatives.some(a => a.source === 'GOOGLE_MAPS'), 'Test 8: contains GOOGLE_MAPS contribution');
  assert(rec.canonicalBusinessName.alternatives.some(a => a.source === 'META_AD_LIBRARY'), 'Test 8: contains META_AD_LIBRARY contribution');
}

// Test 9: transformation lineage
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Crown Bakery', phone: '+1 (555) 012-3456', observedAt: fixedNow },
    referenceNow: fixedNow
  });

  const phone = rec.contacts.phones[0];
  assert(phone.alternatives[0].lineage?.includes('google-maps-raw-phone'), 'Test 9: phone contains transformation lineage');
  assert(phone.normalizedValue === '5550123456', 'Test 9: phone normalizedValue correctly computed');
}

// Test 10: source URL preservation
{
  const rec = assembler.assemble({
    metaCandidate: { businessName: 'Solo Cafe', pageUrl: 'https://facebook.com/solocafe', observedAt: fixedNow },
    websiteResult: {
      identity: { canonicalUrl: 'https://solocafe.com', domain: 'solocafe.com', pageTitle: 'Solo Cafe' },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: [],
      crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 100, fromCache: false },
      verificationState: 'VERIFIED',
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  assert(rec.sourceSignals.metaEvidence?.pageUrl === 'https://facebook.com/solocafe', 'Test 10: meta pageUrl preserved');
  assert(rec.digital.verifiedWebsite.value === 'https://solocafe.com', 'Test 10: website canonical URL preserved');
}

// ==========================================
// GROUP 3: ENTITY RESOLUTION AUTHORITY (TESTS 11 - 14)
// ==========================================
console.log('\n--- GROUP 3: ENTITY RESOLUTION AUTHORITY ---');

// Test 11: consumes Phase 8 canonical entity
{
  const phase8Entity = {
    entityId: 'ent_phase8_1001',
    canonicalDisplayName: 'Kaffeehaus Mitte',
    canonicalComparisonName: 'kaffeehaus mitte',
    aliases: ['Kaffeehaus Berlin'],
    sourceRecords: [],
    sourceIds: [{ sourceType: 'GOOGLE_MAPS', sourceRecordId: 'g1' }],
    domains: ['kaffeehaus-mitte.de'],
    phones: ['+49 30 999999'],
    addresses: ['Mitte 1, Berlin'],
    locations: ['Berlin'],
    branchSignals: [],
    branchEntityIds: [],
    identityEvidence: [],
    identityConflicts: [],
    resolutionStatus: 'RESOLVED_SAME_ENTITY',
    resolutionConfidence: 'HIGH',
    resolutionReasonCodes: ['EXACT_NAME_AND_DOMAIN'],
    sourceContributions: [],
    derivedFrom: [],
    policySummary: {
      overallPolicyStatus: 'POLICY_APPROVED',
      overallPersistenceStatus: 'PERSISTABLE',
      overallExportStatus: 'EXPORTABLE',
      overallProvenance: 'LEADNORIA_DERIVED',
      isRestricted: false,
      hasGoogleConsumerWebLineage: false,
      hasGoogleApiLineage: false,
      hasMetaLineage: false,
      hasWebsiteLineage: true,
      hasUserProvidedLineage: false
    },
    createdAt: fixedNow
  };

  const rec = assembler.assemble({
    resolvedEntityGroup: phase8Entity,
    referenceNow: fixedNow
  });

  assert(rec.canonicalEntityId === 'ent_phase8_1001', 'Test 11: consumes Phase 8 canonicalEntityId');
  assert(rec.canonicalBusinessName.value === 'Kaffeehaus Mitte', 'Test 11: consumes Phase 8 canonicalDisplayName');
  assert(rec.aliases.includes('Kaffeehaus Berlin'), 'Test 11: consumes Phase 8 aliases');
}

// Test 12: preserves branch separation
{
  const branchEntityA = {
    entityId: 'ent_branch_berlin',
    canonicalDisplayName: 'Bank Branch Berlin',
    canonicalComparisonName: 'bank branch berlin',
    aliases: [],
    sourceRecords: [],
    sourceIds: [],
    domains: ['globalbank.com'],
    phones: ['+49 30 1111'],
    addresses: ['Alexanderplatz 1, Berlin'],
    locations: ['Berlin'],
    branchSignals: [{ type: 'LOCALITY', token: 'berlin', confidence: 'STRONG' }],
    branchEntityIds: [],
    parentEntityId: 'ent_parent_bank',
    identityEvidence: [],
    identityConflicts: [],
    resolutionStatus: 'BRANCH_RELATIONSHIP',
    resolutionConfidence: 'HIGH',
    resolutionReasonCodes: ['BRANCH_SIGNAL_FOUND'],
    sourceContributions: [],
    derivedFrom: [],
    policySummary: { isRestricted: false, hasGoogleConsumerWebLineage: false },
    createdAt: fixedNow
  };

  const branchEntityB = {
    entityId: 'ent_branch_munich',
    canonicalDisplayName: 'Bank Branch Munich',
    canonicalComparisonName: 'bank branch munich',
    aliases: [],
    sourceRecords: [],
    sourceIds: [],
    domains: ['globalbank.com'],
    phones: ['+49 89 2222'],
    addresses: ['Marienplatz 1, Munich'],
    locations: ['Munich'],
    branchSignals: [{ type: 'LOCALITY', token: 'munich', confidence: 'STRONG' }],
    branchEntityIds: [],
    parentEntityId: 'ent_parent_bank',
    identityEvidence: [],
    identityConflicts: [],
    resolutionStatus: 'BRANCH_RELATIONSHIP',
    resolutionConfidence: 'HIGH',
    resolutionReasonCodes: ['BRANCH_SIGNAL_FOUND'],
    sourceContributions: [],
    derivedFrom: [],
    policySummary: { isRestricted: false, hasGoogleConsumerWebLineage: false },
    createdAt: fixedNow
  };

  const recA = assembler.assemble({ resolvedEntityGroup: branchEntityA, referenceNow: fixedNow });
  const recB = assembler.assemble({ resolvedEntityGroup: branchEntityB, referenceNow: fixedNow });

  assert(recA.canonicalEntityId !== recB.canonicalEntityId, 'Test 12: branches have distinct entity IDs');
  assert(recA.entityType === 'BRANCH', 'Test 12: record A typed as BRANCH');
  assert(recB.entityType === 'BRANCH', 'Test 12: record B typed as BRANCH');
}

// Test 13: preserves parent/branch relationship
{
  const parentEntity = {
    entityId: 'ent_parent_bank',
    canonicalDisplayName: 'Global Bank AG',
    canonicalComparisonName: 'global bank ag',
    aliases: [],
    sourceRecords: [],
    sourceIds: [],
    domains: ['globalbank.com'],
    phones: [],
    addresses: [],
    locations: [],
    branchSignals: [],
    branchEntityIds: ['ent_branch_berlin', 'ent_branch_munich'],
    identityEvidence: [],
    identityConflicts: [],
    resolutionStatus: 'RESOLVED_SAME_ENTITY',
    resolutionConfidence: 'HIGH',
    resolutionReasonCodes: ['PARENT_ORGANIZATION'],
    sourceContributions: [],
    derivedFrom: [],
    policySummary: { isRestricted: false, hasGoogleConsumerWebLineage: false },
    createdAt: fixedNow
  };

  const rec = assembler.assemble({ resolvedEntityGroup: parentEntity, referenceNow: fixedNow });
  assert(rec.entityType === 'PARENT_ORGANIZATION', 'Test 13: typed as PARENT_ORGANIZATION');
  assert(rec.branchRelationship?.isParent === true, 'Test 13: isParent is true');
  assert(rec.branchRelationship?.branchEntityIds.includes('ent_branch_berlin'), 'Test 13: lists branchEntityIds');
}

// Test 14: does not reimplement entity merging
{
  // Given two distinct candidates without a Phase 8 merge, assembler must NOT merge them into one
  const rec1 = assembler.assemble({ googleCandidate: { placeId: 'place_1', businessName: 'Shop A' }, referenceNow: fixedNow });
  const rec2 = assembler.assemble({ googleCandidate: { placeId: 'place_2', businessName: 'Shop B' }, referenceNow: fixedNow });
  assert(rec1.canonicalEntityId !== rec2.canonicalEntityId, 'Test 14: separate invocations yield separate entities without merging');
}

// ==========================================
// GROUP 4: CONFLICT MODEL (TESTS 15 - 20)
// ==========================================
console.log('\n--- GROUP 4: CONFLICT MODEL ---');

// Test 15: conflicting business names
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Blue Ocean Seafood Restaurant', observedAt: fixedNow },
    metaCandidate: { businessName: 'Blue Ocean Fish Market & Grill', observedAt: fixedNow },
    referenceNow: fixedNow
  });

  assert(rec.canonicalBusinessName.hasConflict === true, 'Test 15: conflicting business names detected');
  assert(rec.canonicalBusinessName.conflicts.length > 0, 'Test 15: conflict record populated');
  assert(rec.canonicalBusinessName.preferredObservedValue === undefined, 'Test 15: preferredObservedValue is undefined without policy');
}

// Test 16: conflicting phones
{
  const rec = assembler.assemble({
    googleCandidate: { phone: '+1 555-111-2222', observedAt: fixedNow },
    contactResult: {
      contacts: [{
        contactId: 'c2',
        contactType: 'PHONE',
        rawValue: '+1 555-999-8888',
        normalizedValue: '5559998888',
        sourceUrl: 'https://example.com',
        sourcePages: [],
        evidenceType: 'VISIBLE_TEXT',
        confidenceState: 'HIGH',
        associatedPersonIds: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [],
        firstObservedAt: fixedNow,
        lastObservedAt: fixedNow,
        observationCount: 1
      }],
      people: [],
      prioritySignal: 'DIRECT_PUBLIC_CONTACT',
      completeness: { hasPublicEmail: false, hasPublicPhone: true, hasContactForm: false, hasSocialProfile: false, hasPublicPerson: false, hasPersonAssociatedEmail: false, hasPersonAssociatedPhone: false, contactCompletenessRatio: 0.5 },
      sourceGraph: { nodes: [], edges: [] },
      conflicts: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow,
      isRestricted: false
    },
    referenceNow: fixedNow
  });

  assert(rec.contacts.phones.length === 2, 'Test 16: preserves both conflicting phones');
  assert(rec.contacts.phones[0].hasConflict === true, 'Test 16: phone marked hasConflict');
  assert(rec.contacts.phones[0].preferredObservedValue === undefined, 'Test 16: preferredObservedValue is undefined');
}

// Test 17: conflicting addresses
{
  const rec = assembler.assemble({
    googleCandidate: { address: '123 Main St, New York', observedAt: fixedNow },
    websiteResult: {
      address: {
        id: 'loc1',
        rawAddress: '456 Broadway, New York',
        normalizedAddress: '456 Broadway, New York',
        status: 'FOUND',
        evidence: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: []
      },
      identity: { canonicalUrl: 'https://example.com', domain: 'example.com', pageTitle: 'Example' },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: [],
      crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 100, fromCache: false },
      verificationState: 'VERIFIED',
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  assert(rec.location.normalizedAddress.hasConflict === true, 'Test 17: conflicting address detected');
  assert(rec.location.normalizedAddress.preferredObservedValue === undefined, 'Test 17: address preferred value undefined');
}

// Test 18: conflicting websites
{
  const rec = assembler.assemble({
    googleCandidate: { websiteUrl: 'https://alpha.com', observedAt: fixedNow },
    metaCandidate: { pageUrl: 'https://beta.org', observedAt: fixedNow },
    referenceNow: fixedNow
  });

  assert(rec.digital.verifiedWebsite.hasConflict === true, 'Test 18: conflicting websites detected');
  assert(rec.digital.verifiedWebsite.preferredObservedValue === undefined, 'Test 18: preferred website undefined without verification');
}

// Test 19: conflicting categories
{
  const rec = assembler.assemble({
    googleCandidate: { categories: ['Italian Restaurant', 'Pizza Delivery'], observedAt: fixedNow },
    referenceNow: fixedNow
  });

  assert(rec.business.categories.value.length === 2, 'Test 19: categories array retains distinct categories');
}

// Test 20: no arbitrary winner without policy
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Name X', observedAt: fixedNow },
    metaCandidate: { businessName: 'Name Y', observedAt: fixedNow },
    referenceNow: fixedNow
  });

  assert(rec.canonicalBusinessName.preferredObservedValue === undefined, 'Test 20: no arbitrary winner selected');
  assert(rec.canonicalBusinessName.alternatives.length === 2, 'Test 20: all alternatives preserved');
}

// ==========================================
// GROUP 5: CORROBORATION (TESTS 21 - 24)
// ==========================================
console.log('\n--- GROUP 5: CORROBORATION ---');

// Test 21: phone corroboration across Google and Website
{
  const rec = assembler.assemble({
    googleCandidate: { phone: '+1 555-4321', observedAt: fixedNow },
    websiteResult: {
      phones: [{
        rawValue: '+1 (555) 4321',
        normalizedValue: '5554321',
        phoneType: 'MAIN',
        status: 'FOUND',
        evidence: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: []
      }],
      identity: { canonicalUrl: 'https://example.com', domain: 'example.com', pageTitle: 'Example' },
      contacts: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: [],
      crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 100, fromCache: false },
      verificationState: 'VERIFIED',
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  const phoneCorroboration = rec.evidence.corroborations.find(c => c.field === 'phone');
  assert(phoneCorroboration !== undefined, 'Test 21: phone corroboration entry generated');
  assert(phoneCorroboration?.corroborationCount === 2, 'Test 21: corroborated by 2 sources');
  assert(phoneCorroboration?.sources.includes('GOOGLE_MAPS') && phoneCorroboration?.sources.includes('WEBSITE'), 'Test 21: sources include GOOGLE_MAPS and WEBSITE');
}

// Test 22: identity corroboration across Meta and Google
{
  const rec = assembler.assemble({
    metaCandidate: { businessName: 'Exact Matches Studio', observedAt: fixedNow },
    googleCandidate: { businessName: 'Exact Matches Studio', observedAt: fixedNow },
    referenceNow: fixedNow
  });

  const nameCorroboration = rec.evidence.corroborations.find(c => c.field === 'businessName');
  assert(nameCorroboration !== undefined, 'Test 22: business name corroborated across Meta and Google');
  assert(nameCorroboration?.sources.length === 2, 'Test 22: corroborated by 2 distinct sources');
}

// Test 23: domain corroboration across listing and crawled site
{
  const rec = assembler.assemble({
    googleCandidate: { websiteUrl: 'https://www.example.com/about', observedAt: fixedNow },
    websiteResult: {
      identity: { canonicalUrl: 'https://example.com', domain: 'example.com', pageTitle: 'Example' },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: [],
      crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 100, fromCache: false },
      verificationState: 'VERIFIED',
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  const domainCorroboration = rec.evidence.corroborations.find(c => c.field === 'domain');
  assert(domainCorroboration !== undefined, 'Test 23: domain identity corroborated');
}

// Test 24: multi-source evidence count
{
  const rec = assembler.assemble({
    metaCandidate: { businessName: 'Omega Auto', observedAt: fixedNow },
    googleCandidate: { businessName: 'Omega Auto', phone: '1234567', observedAt: fixedNow },
    websiteResult: {
      identity: { canonicalUrl: 'https://omega.com', domain: 'omega.com', pageTitle: 'Omega' },
      phones: [{ rawValue: '1234567', normalizedValue: '1234567', phoneType: 'MAIN', status: 'FOUND', evidence: [], provenance: 'WEBSITE_DERIVED', sourceContributions: [] }],
      contacts: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: [],
      crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 100, fromCache: false },
      verificationState: 'VERIFIED',
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  assert(rec.evidence.corroborations.length >= 2, 'Test 24: multiple fields corroborated');
  assert(rec.evidence.evidencePack.corroborationCount >= 2, 'Test 24: evidence pack reflects corroboration count');
}

// ==========================================
// GROUP 6: FRESHNESS MODEL (TESTS 25 - 29)
// ==========================================
console.log('\n--- GROUP 6: FRESHNESS MODEL ---');

// Test 25: per-source timestamps
{
  const rec = assembler.assemble({
    metaCandidate: { businessName: 'Time Test', observedAt: '2026-09-30T10:00:00.000Z' },
    googleCandidate: { businessName: 'Time Test', observedAt: '2026-06-01T10:00:00.000Z' },
    referenceNow: fixedNow
  });

  assert(rec.freshness.perSourceFreshness['META_AD_LIBRARY']?.lastObservedAt === '2026-09-30T10:00:00.000Z', 'Test 25: Meta timestamp preserved');
  assert(rec.freshness.perSourceFreshness['GOOGLE_MAPS']?.lastObservedAt === '2026-06-01T10:00:00.000Z', 'Test 25: Google timestamp preserved');
}

// Test 26: stale source (age > 90 days)
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Old Listing', observedAt: '2025-01-01T00:00:00.000Z' },
    referenceNow: fixedNow,
    freshnessMaxAgeDays: 90
  });

  assert(rec.freshness.perSourceFreshness['GOOGLE_MAPS']?.state === 'STALE', 'Test 26: source older than 90 days marked STALE');
}

// Test 27: current source (age <= 90 days)
{
  const rec = assembler.assemble({
    metaCandidate: { businessName: 'Recent Ad', observedAt: '2026-09-28T00:00:00.000Z' },
    referenceNow: fixedNow,
    freshnessMaxAgeDays: 90
  });

  assert(rec.freshness.perSourceFreshness['META_AD_LIBRARY']?.state === 'CURRENT', 'Test 27: recent source marked CURRENT');
}

// Test 28: mixed freshness
{
  const rec = assembler.assemble({
    metaCandidate: { businessName: 'Mixed Freshness', observedAt: '2026-09-28T00:00:00.000Z' },
    googleCandidate: { businessName: 'Mixed Freshness', observedAt: '2025-01-01T00:00:00.000Z' },
    referenceNow: fixedNow,
    freshnessMaxAgeDays: 90
  });

  assert(rec.freshness.perSourceFreshness['META_AD_LIBRARY']?.state === 'CURRENT', 'Test 28: Meta is CURRENT');
  assert(rec.freshness.perSourceFreshness['GOOGLE_MAPS']?.state === 'STALE', 'Test 28: Google is STALE');
}

// Test 29: NOT_OBSERVED_THIS_RUN state
{
  const previousRecord = assembler.assemble({
    contactResult: {
      contacts: [{
        contactId: 'old_c',
        contactType: 'EMAIL',
        rawValue: 'old@company.com',
        normalizedValue: 'old@company.com',
        sourceUrl: 'https://company.com',
        sourcePages: [],
        evidenceType: 'VISIBLE_TEXT',
        confidenceState: 'HIGH',
        associatedPersonIds: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [],
        firstObservedAt: '2025-01-01T00:00:00.000Z',
        lastObservedAt: '2025-01-01T00:00:00.000Z',
        observationCount: 1
      }],
      people: [],
      prioritySignal: 'DIRECT_PUBLIC_CONTACT',
      completeness: { hasPublicEmail: true, hasPublicPhone: false, hasContactForm: false, hasSocialProfile: false, hasPublicPerson: false, hasPersonAssociatedEmail: false, hasPersonAssociatedPhone: false, contactCompletenessRatio: 0.5 },
      sourceGraph: { nodes: [], edges: [] },
      conflicts: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: '2025-01-01T00:00:00.000Z',
      isRestricted: false
    },
    referenceNow: '2025-01-01T00:00:00.000Z'
  });

  // Now run current assembly without this email
  const currentRec = assembler.assemble({
    metaCandidate: { businessName: 'Company' },
    previousSnapshot: previousRecord,
    referenceNow: fixedNow
  });

  const carriedEmail = currentRec.contacts.emails.find(e => e.normalizedValue === 'old@company.com');
  assert(carriedEmail !== undefined, 'Test 29: previously seen contact preserved in record');
  assert(carriedEmail?.changeState === 'NOT_OBSERVED_THIS_RUN', 'Test 29: marked NOT_OBSERVED_THIS_RUN');
}

// ==========================================
// GROUP 7: CHANGE TRACKING (TESTS 30 - 34)
// ==========================================
console.log('\n--- GROUP 7: CHANGE TRACKING ---');

// Test 30: new contact
{
  const rec = assembler.assemble({
    contactResult: {
      contacts: [{
        contactId: 'new_1',
        contactType: 'EMAIL',
        rawValue: 'new@target.com',
        normalizedValue: 'new@target.com',
        sourceUrl: 'https://target.com',
        sourcePages: [],
        evidenceType: 'VISIBLE_TEXT',
        confidenceState: 'HIGH',
        associatedPersonIds: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [],
        firstObservedAt: fixedNow,
        lastObservedAt: fixedNow,
        observationCount: 1
      }],
      people: [],
      prioritySignal: 'DIRECT_PUBLIC_CONTACT',
      completeness: { hasPublicEmail: true, hasPublicPhone: false, hasContactForm: false, hasSocialProfile: false, hasPublicPerson: false, hasPersonAssociatedEmail: false, hasPersonAssociatedPhone: false, contactCompletenessRatio: 0.5 },
      sourceGraph: { nodes: [], edges: [] },
      conflicts: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow,
      isRestricted: false
    },
    referenceNow: fixedNow
  });

  assert(rec.contacts.emails[0].changeState === 'OBSERVED', 'Test 30: new contact marked OBSERVED');
}

// Test 31: changed phone
{
  const prev = assembler.assemble({
    googleCandidate: { phone: '+1 555-1111' },
    referenceNow: fixedNow
  });

  const curr = assembler.assemble({
    googleCandidate: { phone: '+1 555-2222' },
    previousSnapshot: prev,
    referenceNow: fixedNow
  });

  assert(curr.contacts.phones.some(p => p.normalizedValue === '5552222'), 'Test 31: new phone recorded in current snapshot');
  assert(curr.contacts.phones.some(p => p.changeState === 'NOT_OBSERVED_THIS_RUN'), 'Test 31: old phone preserved as NOT_OBSERVED_THIS_RUN');
}

// Test 32: changed person
{
  const prev = assembler.assemble({
    contactResult: {
      contacts: [],
      people: [{
        personId: 'p_1',
        fullName: 'Alice Smith',
        normalizedName: 'alice smith',
        jobTitle: 'Sales Director',
        emailRefs: [],
        phoneRefs: [],
        socialRefs: [],
        sourcePages: [],
        evidence: [],
        confidenceState: 'HIGH',
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [],
        firstObservedAt: fixedNow,
        lastObservedAt: fixedNow,
        observationCount: 1
      }],
      prioritySignal: 'DIRECT_PUBLIC_CONTACT',
      completeness: { hasPublicEmail: false, hasPublicPhone: false, hasContactForm: false, hasSocialProfile: false, hasPublicPerson: true, hasPersonAssociatedEmail: false, hasPersonAssociatedPhone: false, contactCompletenessRatio: 0.5 },
      sourceGraph: { nodes: [], edges: [] },
      conflicts: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow,
      isRestricted: false
    },
    referenceNow: fixedNow
  });

  const curr = assembler.assemble({
    contactResult: {
      contacts: [],
      people: [{
        personId: 'p_1',
        fullName: 'Alice Smith',
        normalizedName: 'alice smith',
        jobTitle: 'Vice President of Sales',
        emailRefs: [],
        phoneRefs: [],
        socialRefs: [],
        sourcePages: [],
        evidence: [],
        confidenceState: 'HIGH',
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [],
        firstObservedAt: fixedNow,
        lastObservedAt: fixedNow,
        observationCount: 2
      }],
      prioritySignal: 'DIRECT_PUBLIC_CONTACT',
      completeness: { hasPublicEmail: false, hasPublicPhone: false, hasContactForm: false, hasSocialProfile: false, hasPublicPerson: true, hasPersonAssociatedEmail: false, hasPersonAssociatedPhone: false, contactCompletenessRatio: 0.5 },
      sourceGraph: { nodes: [], edges: [] },
      conflicts: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow,
      isRestricted: false
    },
    previousSnapshot: prev,
    referenceNow: fixedNow
  });

  assert(curr.people.publicPeople[0].titles.includes('Vice President of Sales'), 'Test 32: updated title preserved for person');
}

// Test 33: removed-from-current-run observation
{
  const prev = assembler.assemble({
    contactResult: {
      contacts: [],
      people: [{
        personId: 'p_retiring',
        fullName: 'Bob Brown',
        normalizedName: 'bob brown',
        jobTitle: 'Consultant',
        emailRefs: [],
        phoneRefs: [],
        socialRefs: [],
        sourcePages: [],
        evidence: [],
        confidenceState: 'HIGH',
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [],
        firstObservedAt: fixedNow,
        lastObservedAt: fixedNow,
        observationCount: 1
      }],
      prioritySignal: 'DIRECT_PUBLIC_CONTACT',
      completeness: { hasPublicEmail: false, hasPublicPhone: false, hasContactForm: false, hasSocialProfile: false, hasPublicPerson: true, hasPersonAssociatedEmail: false, hasPersonAssociatedPhone: false, contactCompletenessRatio: 0.5 },
      sourceGraph: { nodes: [], edges: [] },
      conflicts: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow,
      isRestricted: false
    },
    referenceNow: fixedNow
  });

  // Current run does not observe Bob Brown
  const curr = assembler.assemble({
    contactResult: {
      contacts: [],
      people: [],
      prioritySignal: 'NO_PUBLIC_CONTACT',
      completeness: { hasPublicEmail: false, hasPublicPhone: false, hasContactForm: false, hasSocialProfile: false, hasPublicPerson: false, hasPersonAssociatedEmail: false, hasPersonAssociatedPhone: false, contactCompletenessRatio: 0 },
      sourceGraph: { nodes: [], edges: [] },
      conflicts: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow,
      isRestricted: false
    },
    previousSnapshot: prev,
    referenceNow: fixedNow
  });

  const carriedPerson = curr.people.publicPeople.find(p => p.personId === 'p_retiring');
  assert(carriedPerson !== undefined, 'Test 33: unobserved person carried over from snapshot');
  assert(carriedPerson?.changeState === 'NOT_OBSERVED_THIS_RUN', 'Test 33: marked NOT_OBSERVED_THIS_RUN');
}

// Test 34: preserved historical observation
{
  const prev = assembler.assemble({
    googleCandidate: { phone: '111-222-3333' },
    referenceNow: fixedNow
  });

  const curr = assembler.assemble({
    googleCandidate: { phone: '111-222-3333' },
    previousSnapshot: prev,
    referenceNow: fixedNow
  });

  assert(curr.contacts.phones[0].changeState === 'OBSERVED', 'Test 34: continuously observed phone marked OBSERVED');
}

// ==========================================
// GROUP 8: QUALIFICATION INTEGRATION (TESTS 35 - 39)
// ==========================================
console.log('\n--- GROUP 8: QUALIFICATION INTEGRATION ---');

const dummyQualificationDecision = {
  entityId: 'ent_qual_1',
  status: 'QUALIFIED',
  profileId: 'LOCAL_SERVICE_BUSINESS_PROFILE',
  profileVersion: '1.0.0',
  evaluatorVersion: '1.0.0',
  evaluatedAt: fixedNow,
  criterionResults: [],
  scoreSummary: { totalScore: 85, maxPossibleScore: 100, threshold: 70, thresholdPassed: true },
  blockingReasons: [],
  contradictionReasons: [],
  unknownReasons: [],
  failureReasons: [],
  supportingEvidence: [],
  provenance: 'LEADNORIA_DERIVED',
  sourceContributions: [],
  derivedFrom: [],
  sourceRestrictions: {
    isRestricted: false,
    restrictionBasis: 'NONE',
    policyStatus: 'POLICY_APPROVED',
    persistenceEligibility: 'PERSISTABLE',
    exportEligibility: 'EXPORTABLE'
  },
  diagnostics: { errors: [], warnings: [], notices: [] },
  reasonGraph: {
    finalStatus: 'QUALIFIED',
    primaryRationale: 'High contactability and operational status confirmed',
    summaryText: 'Candidate passed all mandatory local service criteria.',
    nodes: [],
    passingFactors: ['OPERATIONAL_STATUS', 'PHONE_PRESENT'],
    failingFactors: [],
    uncertainFactors: [],
    contradictoryFactors: [],
    blockingFactors: []
  }
};

// Test 35: attaches Phase 23 result
{
  const rec = assembler.assemble({
    qualificationDecision: dummyQualificationDecision,
    referenceNow: fixedNow
  });

  assert(rec.qualification.qualificationDecision?.profileId === dummyQualificationDecision.profileId, 'Test 35: attaches Phase 23 decision reference');
  assert(rec.qualification.qualificationProfileId === 'LOCAL_SERVICE_BUSINESS_PROFILE', 'Test 35: profileId attached');
}

// Test 36: does not recalculate qualification
{
  const rec = assembler.assemble({
    qualificationDecision: dummyQualificationDecision,
    referenceNow: fixedNow
  });

  assert(rec.qualification.finalState === 'QUALIFIED', 'Test 36: finalState preserved without modification');
}

// Test 37: preserves reason graph
{
  const rec = assembler.assemble({
    qualificationDecision: dummyQualificationDecision,
    referenceNow: fixedNow
  });

  assert(rec.qualification.reasonGraph?.primaryRationale === 'High contactability and operational status confirmed', 'Test 37: reasonGraph attached accurately');
}

// Test 38: preserves contradiction state
{
  const contradictoryDecision = {
    ...dummyQualificationDecision,
    status: 'UNCERTAIN',
    contradictionReasons: ['CONFLICTING_DOMAINS']
  };

  const rec = assembler.assemble({
    qualificationDecision: contradictoryDecision,
    referenceNow: fixedNow
  });

  assert(rec.qualification.finalState === 'UNCERTAIN', 'Test 38: UNCERTAIN contradiction state preserved');
  assert(rec.qualification.contradictoryCriteria.includes('CONFLICTING_DOMAINS'), 'Test 38: contradictoryCriteria preserved');
}

// Test 39: preserves blocking state
{
  const blockedDecision = {
    ...dummyQualificationDecision,
    status: 'BLOCKED',
    blockingReasons: ['POLICY_PROHIBITED_CATEGORY']
  };

  const rec = assembler.assemble({
    qualificationDecision: blockedDecision,
    referenceNow: fixedNow
  });

  assert(rec.qualification.finalState === 'BLOCKED', 'Test 39: BLOCKED state preserved');
  assert(rec.qualification.blockingCriteria.includes('POLICY_PROHIBITED_CATEGORY'), 'Test 39: blockingCriteria preserved');
}

// ==========================================
// GROUP 9: GOOGLE RESTRICTION FIREWALL (TESTS 40 - 46)
// ==========================================
console.log('\n--- GROUP 9: GOOGLE RESTRICTION FIREWALL ---');

// Test 40: Google-only record remains restricted
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Restricted Listing', placeId: 'g_123', isRestricted: true },
    referenceNow: fixedNow
  });

  assert(rec.policy.isRestricted === true, 'Test 40: Google-only isRestricted is true');
  assert(rec.policy.exportEligible === false, 'Test 40: Google-only exportEligible is false');
  assert(rec.policy.persistenceEligible === false, 'Test 40: Google-only persistenceEligible is false');
}

// Test 41: Google + Website remains restricted
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Restricted Listing', isRestricted: true },
    websiteResult: {
      identity: { canonicalUrl: 'https://site.com', domain: 'site.com', pageTitle: 'Site' },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: [],
      crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 100, fromCache: false },
      verificationState: 'VERIFIED',
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  assert(rec.policy.isRestricted === true, 'Test 41: Google + Website remains restricted');
}

// Test 42: Google + Meta remains restricted
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Restricted Listing', isRestricted: true },
    metaCandidate: { businessName: 'Meta Listing' },
    referenceNow: fixedNow
  });

  assert(rec.policy.isRestricted === true, 'Test 42: Google + Meta remains restricted');
}

// Test 43: Google + Website + Meta remains restricted
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Restricted Listing', isRestricted: true },
    metaCandidate: { businessName: 'Meta Listing' },
    websiteResult: {
      identity: { canonicalUrl: 'https://site.com', domain: 'site.com', pageTitle: 'Site' },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: [],
      crawlStats: { pagesDiscovered: 1, pagesVisited: [], pagesSkipped: [], pagesFailed: [], durationMs: 100, fromCache: false },
      verificationState: 'VERIFIED',
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  assert(rec.policy.isRestricted === true, 'Test 43: Google + Website + Meta remains restricted');
  assert(rec.policy.upstreamRestrictions.includes('GOOGLE_CONSUMER_WEB_RESTRICTED'), 'Test 43: upstreamRestrictions contains GOOGLE_CONSUMER_WEB_RESTRICTED');
}

// Test 44: Website child cannot launder Google restriction
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Restricted Parent', isRestricted: true },
    contactResult: {
      contacts: [{
        contactId: 'c_clean',
        contactType: 'EMAIL',
        rawValue: 'hello@clean.com',
        normalizedValue: 'hello@clean.com',
        sourceUrl: 'https://clean.com',
        sourcePages: [],
        evidenceType: 'VISIBLE_TEXT',
        confidenceState: 'HIGH',
        associatedPersonIds: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [],
        firstObservedAt: fixedNow,
        lastObservedAt: fixedNow,
        observationCount: 1
      }],
      people: [],
      prioritySignal: 'DIRECT_PUBLIC_CONTACT',
      completeness: { hasPublicEmail: true, hasPublicPhone: false, hasContactForm: false, hasSocialProfile: false, hasPublicPerson: false, hasPersonAssociatedEmail: false, hasPersonAssociatedPhone: false, contactCompletenessRatio: 0.5 },
      sourceGraph: { nodes: [], edges: [] },
      conflicts: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: fixedNow,
      isRestricted: false
    },
    referenceNow: fixedNow
  });

  const exportEval = assembler.evaluateExport(rec);
  assert(exportEval.isEligibleForExport === false, 'Test 44: child website contact cannot launder overall record into exportable');
}

// Test 45: Qualification cannot launder Google restriction
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Restricted Entity', isRestricted: true },
    qualificationDecision: dummyQualificationDecision,
    referenceNow: fixedNow
  });

  assert(rec.qualification.finalState === 'QUALIFIED', 'Test 45: qualification status preserved');
  assert(rec.policy.isRestricted === true, 'Test 45: record remains strictly restricted regardless of qualification');
  assert(assembler.evaluateExport(rec).isEligibleForExport === false, 'Test 45: export blocked despite QUALIFIED status');
}

// Test 46: Evidence pack cannot launder Google restriction
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Restricted Entity', isRestricted: true },
    referenceNow: fixedNow
  });

  const googleEvidence = rec.evidence.evidencePack.items.find(i => i.sourceType === 'GOOGLE_MAPS');
  assert(googleEvidence?.isRestricted === true, 'Test 46: evidence pack item retains isRestricted: true');
}

// ==========================================
// GROUP 10: USER INPUT & OVERRIDES (TESTS 47 - 49)
// ==========================================
console.log('\n--- GROUP 10: USER INPUT & OVERRIDES ---');

// Test 47: user-provided value preserved
{
  const rec = assembler.assemble({
    userOverride: {
      businessName: 'My Custom Business',
      website: 'https://mycustombusiness.com',
      phone: '+1 555-9000',
      providedAt: fixedNow
    },
    referenceNow: fixedNow
  });

  assert(rec.sourceSignals.userProvidedEvidence?.userProvidedName === 'My Custom Business', 'Test 47: userProvidedName preserved');
  assert(rec.canonicalBusinessName.alternatives.some(a => a.source === 'USER_PROVIDED'), 'Test 47: USER_PROVIDED alternative recorded');
}

// Test 48: conflicting user/external value preserved
{
  const rec = assembler.assemble({
    metaCandidate: { businessName: 'Automated Meta Name' },
    userOverride: { businessName: 'Custom User Name', applyAsPreferred: false },
    referenceNow: fixedNow
  });

  assert(rec.canonicalBusinessName.alternatives.length === 2, 'Test 48: both user and external values preserved');
  assert(rec.canonicalBusinessName.hasConflict === true, 'Test 48: conflict recorded between user and external');
}

// Test 49: no implicit user override without policy
{
  const recNoPolicy = assembler.assemble({
    metaCandidate: { businessName: 'Automated Meta Name' },
    userOverride: { businessName: 'Custom User Name', applyAsPreferred: false },
    referenceNow: fixedNow
  });

  assert(recNoPolicy.canonicalBusinessName.preferredObservedValue === undefined, 'Test 49: without applyAsPreferred, user value does not automatically win');

  const recWithPolicy = assembler.assemble({
    metaCandidate: { businessName: 'Automated Meta Name' },
    userOverride: { businessName: 'Custom User Name', applyAsPreferred: true },
    referenceNow: fixedNow
  });

  assert(recWithPolicy.canonicalBusinessName.preferredObservedValue === 'Custom User Name', 'Test 49: with applyAsPreferred, user value is preferredObservedValue');
}

// ==========================================
// GROUP 11: EXPORT & PERSISTENCE FIREWALL (TESTS 50 - 52)
// ==========================================
console.log('\n--- GROUP 11: EXPORT & PERSISTENCE FIREWALL ---');

// Test 50: uses existing ExportPolicy
{
  const unrestrictedRec = assembler.assemble({
    metaCandidate: { businessName: 'Clean Agency', pageUrl: 'https://facebook.com/agency' },
    referenceNow: fixedNow
  });

  const evaluation = assembler.evaluateExport(unrestrictedRec);
  assert(evaluation.isEligibleForExport === true, 'Test 50: unrestricted record eligible via Phase 16 ExportPolicy');

  const projection = assembler.projectExport(unrestrictedRec, evaluation);
  assert(projection !== null, 'Test 50: projection generated via Phase 16 ExportProjection');
  assert(projection?.businessName === 'Clean Agency', 'Test 50: projection contains projected businessName');
}

// Test 51: uses existing persistence policy
{
  const restrictedRec = assembler.assemble({
    googleCandidate: { businessName: 'Restricted Persistence', isRestricted: true },
    referenceNow: fixedNow
  });

  assert(restrictedRec.policy.persistenceEligible === false, 'Test 51: persistenceEligible is false for restricted record');
}

// Test 52: no second independent firewall
{
  const rec = assembler.assemble({
    googleCandidate: { businessName: 'Restricted Entity', isRestricted: true },
    referenceNow: fixedNow
  });

  const evaluation = assembler.evaluateExport(rec);
  assert(evaluation.isEligibleForExport === false, 'Test 52: ExportPolicy directly blocks export');
  assert(assembler.projectExport(rec, evaluation) === null, 'Test 52: ExportProjection yields null');
}

// ==========================================
// GROUP 12: DETERMINISM (TESTS 53 - 54)
// ==========================================
console.log('\n--- GROUP 12: DETERMINISM ---');

// Test 53: identical inputs produce identical semantic output
{
  const inputA = {
    metaCandidate: { businessName: 'Determinism Test', pageUrl: 'https://facebook.com/test' },
    referenceNow: fixedNow
  };
  const inputB = {
    metaCandidate: { businessName: 'Determinism Test', pageUrl: 'https://facebook.com/test' },
    referenceNow: fixedNow
  };

  const recA = assembler.assemble(inputA);
  const recB = assembler.assemble(inputB);

  assert(JSON.stringify(recA) === JSON.stringify(recB), 'Test 53: identical inputs produce byte-identical JSON representation');
}

// Test 54: input order does not alter semantic result
{
  const recOrder1 = assembler.assemble({
    googleCandidate: { categories: ['Plumbing', 'Heating', 'Cooling'] },
    referenceNow: fixedNow
  });

  const recOrder2 = assembler.assemble({
    googleCandidate: { categories: ['Cooling', 'Plumbing', 'Heating'] },
    referenceNow: fixedNow
  });

  assert(JSON.stringify(recOrder1.business.categories.value) === JSON.stringify(recOrder2.business.categories.value), 'Test 54: categories array sorted deterministically regardless of input order');
}

// ==========================================
// GROUP 13: SECURITY CONTROLS (TESTS 55 - 59)
// ==========================================
console.log('\n--- GROUP 13: SECURITY CONTROLS ---');

// Test 55: prototype pollution defense
{
  const payload = JSON.parse('{"__proto__": {"polluted": true}, "businessName": "Pollution Test"}');
  const sanitized = sanitizeObject(payload);

  assert(Object.prototype.polluted === undefined, 'Test 55: prototype not polluted');
  assert(sanitized.businessName === 'Pollution Test', 'Test 55: valid property retained');
}

// Test 56: forged provenance
{
  const rec = assembler.assemble({
    googleCandidate: {
      businessName: 'Forged Provenance Attempt',
      isRestricted: true
    },
    // Attempting to pass an unrestricted provenance flag
    userOverride: {
      businessName: 'Unrestricted override'
    },
    referenceNow: fixedNow
  });

  assert(rec.policy.isRestricted === true, 'Test 56: presence of Google source strictly overrides any forged/unrestricted flag');
}

// Test 57: forged restriction state
{
  const firewall = evaluateRestrictionFirewall({
    isExplicitlyRestricted: true,
    provenances: ['WEBSITE_DERIVED', 'GOOGLE_DERIVED']
  });

  assert(firewall.isRestricted === true, 'Test 57: restriction firewall cannot be de-escalated');
  assert(firewall.persistenceEligible === false, 'Test 57: persistence permanently disabled');
}

// Test 58: malicious URL
{
  const rec = assembler.assemble({
    metaCandidate: {
      businessName: 'XSS Attack Corp',
      pageUrl: 'javascript:alert(1)'
    },
    referenceNow: fixedNow
  });

  assert(rec.sourceSignals.metaEvidence?.pageUrl === '', 'Test 58: javascript: URL stripped');
}

// Test 59: oversized evidence payload bounded
{
  const hugeArray = Array.from({ length: 500 }, (_, i) => `item_${i}`);
  const sanitized = sanitizeObject(hugeArray);

  assert(sanitized.length <= 100, 'Test 59: oversized array bounded to maximum collection size');
}

// ==========================================
// GROUP 14: PERFORMANCE (TEST 60)
// ==========================================
console.log('\n--- GROUP 14: PERFORMANCE BENCHMARK ---');

// Test 60: large multi-source entity assembly remains bounded
{
  const startTime = Date.now();
  const iterations = 500;

  for (let i = 0; i < iterations; i++) {
    assembler.assemble({
      metaCandidate: { businessName: `Business ${i}`, pageUrl: `https://facebook.com/biz${i}` },
      googleCandidate: { businessName: `Business ${i}`, placeId: `place_${i}`, phone: `+1 555-000${i}` },
      referenceNow: fixedNow
    });
  }

  const elapsedMs = Date.now() - startTime;
  const opsSec = Math.round((iterations / elapsedMs) * 1000);

  console.log(`  [BENCHMARK] ${iterations} assemblies in ${elapsedMs}ms (${opsSec} ops/sec)`);
  assert(elapsedMs < 2000, 'Test 60: 500 multi-source assemblies completed in under 2 seconds');
}

console.log('\n================================================================');
console.log(`PHASE 24 TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed (Total ${passedTests + failedTests})`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\n>>> ALL PHASE 24 UNIFIED LEAD INTELLIGENCE TESTS PASSED! <<<\n');
}
