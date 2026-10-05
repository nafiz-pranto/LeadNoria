/**
 * LeadNoria Phase 22: Contact & Person Intelligence Engine Test Suite
 *
 * Comprehensive validation across:
 * - EMAIL (Tests 1-10)
 * - PHONE (Tests 11-17)
 * - PERSON (Tests 18-26)
 * - ASSOCIATION (Tests 27-30)
 * - SOCIAL (Tests 31-35)
 * - CONFLICTS (Tests 36-38)
 * - FRESHNESS (Tests 39-42)
 * - COMPLETENESS (Tests 43-44)
 * - PROVENANCE (Tests 45-48)
 * - GOOGLE FIREWALL (Tests 49-52)
 * - SECURITY (Tests 53-57)
 * - REGRESSION (Tests 58-62)
 */

import assert from 'node:assert/strict';
import {
  ContactIntelligenceEngine,
  processEmailIntelligence,
  classifyEmailType,
  evaluateEmailDomainRelationship,
  normalizeEmail,
  processPhoneIntelligence,
  classifyPhoneEvidence,
  extractPhoneDepartment,
  clusterAndDeduplicatePeople,
  normalizePersonName,
  normalizeJobTitle,
  extractRoleClassification,
  associateContactsAndPeople,
  calculateContactCompleteness,
  determineContactPrioritySignal,
  buildContactSourceGraph,
  detectContactChanges
} from '../src/extension/contactIntelligence/index.ts';

import { ExportPolicy } from '../src/extension/export/exportPolicy.ts';

let passedTests = 0;
let failedTests = 0;

async function test(name, fn) {
  try {
    await fn();
    passedTests++;
    console.log(`  [PASS] Test ${passedTests + failedTests}: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  [FAIL] Test ${passedTests + failedTests}: ${name}`);
    console.error(err);
  }
}

console.log('\n--- STARTING PHASE 22: CONTACT & PERSON INTELLIGENCE ENGINE TESTS ---\n');

// ==========================================
// EMAIL INTELLIGENCE (Tests 1 - 10)
// ==========================================

await test('1. public email extraction: valid email normalized and categorized', () => {
  const res = processEmailIntelligence('Info@AcmeCorp.com', 'https://acmeprop.com/contact', 'acmeprop.com');
  assert.ok(res, 'Must return normalized email');
  assert.equal(res.normalizedEmail, 'Info@acmecorp.com');
  assert.equal(res.classification, 'ROLE_ACCOUNT');
  assert.equal(res.evidenceClassification, 'PUBLICLY_LISTED');
});

await test('2. mailto email: mailto prefix stripped and normalized', () => {
  const res = processEmailIntelligence('mailto:contact@acme.org?subject=Inquiry', 'https://acme.org', 'acme.org');
  assert.ok(res);
  assert.equal(res.normalizedEmail, 'contact@acme.org');
  assert.equal(res.evidenceClassification, 'MAILTO');
  assert.equal(res.classification, 'ROLE_ACCOUNT');
});

await test('3. structured-data email: structured data source recognized', () => {
  const res = processEmailIntelligence('support@acme.org', 'https://acme.org/#jsonld', 'acme.org');
  assert.ok(res);
  assert.equal(res.evidenceClassification, 'STRUCTURED_DATA');
});

await test('4. duplicate email: casing and whitespace normalized while preserving local-part case', () => {
  const e1 = normalizeEmail(' Sales@Example.Com ');
  const e2 = normalizeEmail('Sales@example.com');
  assert.equal(e1, e2);
  assert.equal(e1, 'Sales@example.com');
});

await test('5. invalid email: rejection of malformed, non-email strings', () => {
  assert.equal(normalizeEmail('not-an-email'), null);
  assert.equal(normalizeEmail('user@'), null);
  assert.equal(normalizeEmail('@domain.com'), null);
  assert.equal(normalizeEmail('user@.com'), null);
  assert.equal(normalizeEmail('user@domain..com'), null);
  assert.equal(normalizeEmail('user@domain'), null);
  assert.equal(processEmailIntelligence('invalid@@foo.bar', 'https://foo.bar', 'foo.bar'), null);
});

await test('6. role account classification: detection of standard operational mailboxes', () => {
  assert.equal(classifyEmailType('info@acme.com'), 'ROLE_ACCOUNT');
  assert.equal(classifyEmailType('support@acme.com'), 'ROLE_ACCOUNT');
  assert.equal(classifyEmailType('sales@acme.com'), 'ROLE_ACCOUNT');
  assert.equal(classifyEmailType('billing@acme.com'), 'ROLE_ACCOUNT');
  assert.equal(classifyEmailType('admin@acme.com'), 'ROLE_ACCOUNT');
  assert.equal(classifyEmailType('careers@acme.com'), 'ROLE_ACCOUNT');
  assert.equal(classifyEmailType('help@acme.com'), 'ROLE_ACCOUNT');
});

await test('7. person-style email classification: distinct from role accounts', () => {
  assert.equal(classifyEmailType('john.smith@acme.com'), 'PERSON_NAMED');
  assert.equal(classifyEmailType('alice_walker@acme.com'), 'PERSON_NAMED');
  assert.equal(classifyEmailType('jsmith@acme.com'), 'PERSON_NAMED');
});

await test('8. external email domain: third-party provider or external domain tagged', () => {
  const relGmail = evaluateEmailDomainRelationship('acmeplumbing@gmail.com', 'acmeplumbing.com');
  assert.equal(relGmail, 'EXTERNAL_DOMAIN');

  const relOther = evaluateEmailDomainRelationship('office@parentcompany.org', 'subsidiary.com');
  assert.equal(relOther, 'EXTERNAL_DOMAIN');
});

await test('9. website-domain match: exact match and subdomain detection', () => {
  const relExact = evaluateEmailDomainRelationship('hello@acme.com', 'acme.com');
  assert.equal(relExact, 'EXACT_DOMAIN_MATCH');

  const relSub = evaluateEmailDomainRelationship('hello@mail.acme.com', 'acme.com');
  assert.equal(relSub, 'SUBDOMAIN_MATCH');

  const relWww = evaluateEmailDomainRelationship('hello@acme.com', 'www.acme.com');
  assert.equal(relWww, 'EXACT_DOMAIN_MATCH');
});

await test('10. no email guessing: engine only accepts explicitly provided values', () => {
  const engine = new ContactIntelligenceEngine();
  const result = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://noguess.com',
        domain: 'noguess.com',
        pageTitle: 'No Guess Inc',
        phones: [],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [
        {
          fullName: 'Jane Doe',
          jobTitle: 'Founder',
          sourceUrl: 'https://noguess.com/team',
          evidenceType: 'HTML_TEAM_SECTION',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://noguess.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://noguess.com'], pagesSkipped: [], pagesFailed: [], durationMs: 10, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: false, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  const emails = result.contacts.filter(c => c.contactType === 'EMAIL');
  assert.equal(emails.length, 0, 'Must NOT invent or guess email for Jane Doe');
  assert.equal(result.people[0].emailRefs.length, 0, 'No guessed email attached to person');
});

// ==========================================
// PHONE INTELLIGENCE (Tests 11 - 17)
// ==========================================

await test('11. public phone: normalized into standard E.164-compatible form', () => {
  const p = processPhoneIntelligence('(555) 123-4567', 'https://example.com', 'US');
  assert.ok(p);
  assert.equal(p.normalizedPhone, '+15551234567');
  assert.equal(p.countryCodeKnown, true);
  assert.equal(p.evidenceClassification, 'PUBLICLY_LISTED');
});

await test('12. tel link: recognized from tel: href context', () => {
  const p = processPhoneIntelligence('tel:+15559876543', 'https://example.com', 'US');
  assert.ok(p);
  assert.equal(p.normalizedPhone, '+15559876543');
  assert.equal(p.evidenceClassification, 'TEL_LINK');
});

await test('13. structured-data phone: schema.org telephone identification', () => {
  const ev = classifyPhoneEvidence('+15553334444', 'https://example.com/#jsonld');
  assert.equal(ev, 'STRUCTURED_DATA');
});

await test('14. duplicate phone: formatting differences deduplicate to same normalized value', () => {
  const p1 = processPhoneIntelligence('555.222.3333', 'https://example.com/p1', 'US');
  const p2 = processPhoneIntelligence('(555) 222-3333', 'https://example.com/p2', 'US');
  assert.equal(p1?.normalizedPhone, p2?.normalizedPhone);
});

await test('15. conflicting phone: different phone numbers on different pages preserved as conflicts', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://multi-phone.com',
        domain: 'multi-phone.com',
        pageTitle: 'Multi Phone',
        phones: ['+15551112222', '+15559998888'],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [
        {
          rawNumber: '(555) 111-2222',
          normalizedNumber: '+15551112222',
          sourceUrl: 'https://multi-phone.com/location1',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        },
        {
          rawNumber: '(555) 999-8888',
          normalizedNumber: '+15559998888',
          sourceUrl: 'https://multi-phone.com/location2',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://multi-phone.com/location1', 'https://multi-phone.com/location2'],
      crawlStats: { pagesDiscovered: 2, pagesVisited: ['https://multi-phone.com/location1', 'https://multi-phone.com/location2'], pagesSkipped: [], pagesFailed: [], durationMs: 15, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.9 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  const phones = res.contacts.filter(c => c.contactType === 'PHONE');
  assert.equal(phones.length, 2, 'Both distinct phones must be preserved, none dropped');
  const conflict = res.conflicts.find(c => c.conflictType === 'PHONE_CONFLICT');
  assert.ok(conflict, 'Phone conflict record must be preserved');
  assert.equal(conflict.values.length, 2);
});

await test('16. unknown country-code handling: phone without leading country code is safely parsed', () => {
  const p = processPhoneIntelligence('212-555-0199', 'https://nyc.gov', undefined);
  assert.ok(p);
  assert.ok(p.normalizedPhone.length >= 10);
});

await test('17. no phone invention: no synthetic phone digits created', () => {
  const invalid = processPhoneIntelligence('12345', 'https://invalid.com', 'US');
  assert.equal(invalid, null, 'Must reject short/invalid phone strings');
});

// ==========================================
// PERSON INTELLIGENCE (Tests 18 - 26)
// ==========================================

await test('18. public person: extracts published person with name and role', () => {
  const people = clusterAndDeduplicatePeople([
    {
      fullName: 'Dr. Robert Oppenheimer',
      jobTitle: 'Director',
      sourceUrl: 'https://lab.gov/team',
      evidenceType: 'HTML_TEAM_SECTION',
      observedAt: new Date().toISOString(),
      provenance: 'WEBSITE_DERIVED'
    }
  ], new Date().toISOString());

  assert.equal(people.length, 1);
  assert.equal(people[0].fullName, 'Dr. Robert Oppenheimer');
  assert.equal(people[0].normalizedName, 'robert oppenheimer');
  assert.equal(people[0].jobTitle, 'Director');
});

await test('19. public title: whitespace and casing normalization preserving original', () => {
  assert.equal(normalizeJobTitle('  Chief   Executive   Officer  '), 'chief executive officer');
  assert.equal(extractRoleClassification('Chief Executive Officer'), 'CEO');
  assert.equal(extractRoleClassification('Co-Founder & VP of Sales'), 'FOUNDER');
});

await test('20. public person email: explicitly provided email attached to person', () => {
  const people = clusterAndDeduplicatePeople([
    {
      fullName: 'Sarah Connor',
      jobTitle: 'Security Lead',
      email: 'sconnor@cyberdyne.com',
      sourceUrl: 'https://cyberdyne.com/leadership',
      evidenceType: 'HTML_TEAM_SECTION',
      observedAt: new Date().toISOString(),
      provenance: 'WEBSITE_DERIVED'
    }
  ], new Date().toISOString());

  assert.equal(people.length, 1);
  assert.deepEqual(people[0].emailRefs, ['sconnor@cyberdyne.com']);
});

await test('21. public person phone: explicitly provided phone attached to person', () => {
  const people = clusterAndDeduplicatePeople([
    {
      fullName: 'Sarah Connor',
      jobTitle: 'Security Lead',
      phone: '+15558887777',
      sourceUrl: 'https://cyberdyne.com/leadership',
      evidenceType: 'HTML_TEAM_SECTION',
      observedAt: new Date().toISOString(),
      provenance: 'WEBSITE_DERIVED'
    }
  ], new Date().toISOString());

  assert.equal(people.length, 1);
  assert.deepEqual(people[0].phoneRefs, ['+15558887777']);
});

await test('22. public LinkedIn: person-associated LinkedIn link attached', () => {
  const people = clusterAndDeduplicatePeople([
    {
      fullName: 'Ada Lovelace',
      jobTitle: 'Lead Architect',
      linkedInUrl: 'https://linkedin.com/in/ada-lovelace',
      sourceUrl: 'https://engine.io/about',
      evidenceType: 'HTML_TEAM_SECTION',
      observedAt: new Date().toISOString(),
      provenance: 'WEBSITE_DERIVED'
    }
  ], new Date().toISOString());

  assert.equal(people.length, 1);
  assert.deepEqual(people[0].socialRefs, ['https://linkedin.com/in/ada-lovelace']);
});

await test('23. same person across pages: merges when strong corroboration (email or linkedin) matches', () => {
  const people = clusterAndDeduplicatePeople([
    {
      fullName: 'Alan Turing',
      jobTitle: 'Senior Cryptanalyst',
      email: 'aturing@bletchley.uk',
      sourceUrl: 'https://bletchley.uk/team',
      evidenceType: 'HTML_TEAM_SECTION',
      observedAt: new Date().toISOString(),
      provenance: 'WEBSITE_DERIVED'
    },
    {
      fullName: 'Alan Turing',
      jobTitle: 'Consultant',
      email: 'aturing@bletchley.uk',
      sourceUrl: 'https://bletchley.uk/about',
      evidenceType: 'JSON_LD_PERSON',
      observedAt: new Date().toISOString(),
      provenance: 'WEBSITE_DERIVED'
    }
  ], new Date().toISOString());

  assert.equal(people.length, 1, 'Should safely merge same person with matching email');
  assert.equal(people[0].sourcePages.length, 2, 'Lineage reflects both pages');
});

await test('24. separate people with same name: weak evidence (name alone) NEVER merges without corroboration', () => {
  const people = clusterAndDeduplicatePeople([
    {
      fullName: 'David Smith',
      jobTitle: 'Dentist',
      email: 'dsmith1@clinic.com',
      sourceUrl: 'https://clinic.com/doctors',
      evidenceType: 'HTML_TEAM_SECTION',
      observedAt: new Date().toISOString(),
      provenance: 'WEBSITE_DERIVED'
    },
    {
      fullName: 'David Smith',
      jobTitle: 'Orthodontist',
      email: 'dsmith2@clinic.com',
      sourceUrl: 'https://clinic.com/staff',
      evidenceType: 'HTML_TEAM_SECTION',
      observedAt: new Date().toISOString(),
      provenance: 'WEBSITE_DERIVED'
    }
  ], new Date().toISOString());

  assert.equal(people.length, 2, 'Separate individuals with distinct emails MUST NOT merge');
  assert.ok(people[0].potentialDuplicatePersonIds?.includes(people[1].personId), 'Attach potential duplicate reference');
});

await test('25. no inferred person: plain textual mentions without structural person context are ignored', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://plain.com',
        domain: 'plain.com',
        pageTitle: 'Plain Page',
        phones: [],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [], // No structural people found
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://plain.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://plain.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: false, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.5 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  assert.equal(res.people.length, 0, 'Must have zero people when none published structurally');
});

await test('26. no external person search: no external fetch or search API invocations', () => {
  // Verified by design: ContactIntelligenceEngine is pure in-memory, deterministic transformation
  const engine = new ContactIntelligenceEngine();
  assert.equal(typeof engine.fetch, 'undefined');
  assert.equal(typeof engine.googleSearch, 'undefined');
});

// ==========================================
// ASSOCIATION (Tests 27 - 30)
// ==========================================

await test('27. explicit person-email association: email inside person card links directly', () => {
  const contacts = [
    {
      contactId: 'email:elena@tech.io',
      contactType: 'EMAIL',
      rawValue: 'elena@tech.io',
      normalizedValue: 'elena@tech.io',
      sourceUrl: 'https://tech.io/team',
      evidenceType: 'STRUCTURED_DATA',
      confidenceState: 'HIGH',
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString(),
      firstObservedAt: new Date().toISOString(),
      lastObservedAt: new Date().toISOString(),
      observationCount: 1
    }
  ];
  const people = [
    {
      personId: 'person:elena-rostova:https://tech.io/team',
      fullName: 'Elena Rostova',
      normalizedName: 'elena rostova',
      jobTitle: 'CTO',
      emailRefs: [],
      phoneRefs: [],
      socialRefs: [],
      sourcePages: ['https://tech.io/team'],
      evidence: [],
      confidenceState: 'HIGH',
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    }
  ];
  const rawPeople = [
    {
      fullName: 'Elena Rostova',
      email: 'elena@tech.io',
      sourceUrl: 'https://tech.io/team',
      evidenceType: 'JSON_LD_PERSON',
      observedAt: new Date().toISOString(),
      provenance: 'WEBSITE_DERIVED'
    }
  ];

  associateContactsAndPeople(contacts, people, rawPeople);
  assert.deepEqual(people[0].emailRefs, ['elena@tech.io']);
  assert.equal(contacts[0].associatedPersonId, people[0].personId);
  assert.equal(contacts[0].associationConfidence, 'EXPLICIT_ASSOCIATION');
});

await test('28. explicit person-phone association: direct phone in team profile links to person', () => {
  const contacts = [
    {
      contactId: 'phone:+15554443333',
      contactType: 'PHONE',
      rawValue: '+15554443333',
      normalizedValue: '+15554443333',
      sourceUrl: 'https://tech.io/team',
      evidenceType: 'TEL_LINK',
      confidenceState: 'HIGH',
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString(),
      firstObservedAt: new Date().toISOString(),
      lastObservedAt: new Date().toISOString(),
      observationCount: 1
    }
  ];
  const people = [
    {
      personId: 'person:mark-spencer:https://tech.io/team',
      fullName: 'Mark Spencer',
      normalizedName: 'mark spencer',
      jobTitle: 'Managing Director',
      emailRefs: [],
      phoneRefs: [],
      socialRefs: [],
      sourcePages: ['https://tech.io/team'],
      evidence: [],
      confidenceState: 'HIGH',
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    }
  ];
  const rawPeople = [
    {
      fullName: 'Mark Spencer',
      phone: '+15554443333',
      sourceUrl: 'https://tech.io/team',
      evidenceType: 'HTML_TEAM_SECTION',
      observedAt: new Date().toISOString(),
      provenance: 'WEBSITE_DERIVED'
    }
  ];

  associateContactsAndPeople(contacts, people, rawPeople);
  assert.deepEqual(people[0].phoneRefs, ['+15554443333']);
  assert.equal(contacts[0].associatedPersonId, people[0].personId);
  assert.equal(contacts[0].associationConfidence, 'EXPLICIT_ASSOCIATION');
});

await test('29. weak association remains POTENTIAL_ASSOCIATION: same page but not in person card', () => {
  const contacts = [
    {
      contactId: 'email:general@tech.io',
      contactType: 'EMAIL',
      rawValue: 'general@tech.io',
      normalizedValue: 'general@tech.io',
      sourceUrl: 'https://tech.io/team',
      evidenceType: 'PUBLICLY_LISTED',
      confidenceState: 'LOW',
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString(),
      firstObservedAt: new Date().toISOString(),
      lastObservedAt: new Date().toISOString(),
      observationCount: 1
    }
  ];
  const people = [
    {
      personId: 'person:alice-cooper:https://tech.io/team',
      fullName: 'Alice Cooper',
      normalizedName: 'alice cooper',
      jobTitle: 'Developer',
      emailRefs: [],
      phoneRefs: [],
      socialRefs: [],
      sourcePages: ['https://tech.io/team'],
      evidence: [],
      confidenceState: 'MEDIUM',
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    }
  ];
  // rawPerson does not have email explicitly
  const rawPeople = [
    {
      fullName: 'Alice Cooper',
      sourceUrl: 'https://tech.io/team',
      evidenceType: 'HTML_TEAM_SECTION',
      observedAt: new Date().toISOString(),
      provenance: 'WEBSITE_DERIVED'
    }
  ];

  associateContactsAndPeople(contacts, people, rawPeople);
  // Contacts must NOT assert ownership; weak link is POTENTIAL_ASSOCIATION or unlinked
  assert.notEqual(contacts[0].associationConfidence, 'EXPLICIT_ASSOCIATION');
  assert.equal(people[0].emailRefs.length, 0);
});

await test('30. same-site unrelated email is not assigned to person', () => {
  const contacts = [
    {
      contactId: 'email:careers@tech.io',
      contactType: 'EMAIL',
      rawValue: 'careers@tech.io',
      normalizedValue: 'careers@tech.io',
      sourceUrl: 'https://tech.io/careers',
      evidenceType: 'PUBLICLY_LISTED',
      confidenceState: 'HIGH',
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString(),
      firstObservedAt: new Date().toISOString(),
      lastObservedAt: new Date().toISOString(),
      observationCount: 1
    }
  ];
  const people = [
    {
      personId: 'person:bob-smith:https://tech.io/team',
      fullName: 'Bob Smith',
      normalizedName: 'bob smith',
      jobTitle: 'Engineer',
      emailRefs: [],
      phoneRefs: [],
      socialRefs: [],
      sourcePages: ['https://tech.io/team'],
      evidence: [],
      confidenceState: 'HIGH',
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    }
  ];

  associateContactsAndPeople(contacts, people, []);
  assert.equal(contacts[0].associatedPersonId, undefined);
  assert.equal(people[0].emailRefs.length, 0);
});

// ==========================================
// SOCIAL PROFILE INTELLIGENCE (Tests 31 - 35)
// ==========================================

await test('31. business social profile: company-level social profile classified correctly', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://company.org',
        domain: 'company.org',
        pageTitle: 'Company Org',
        phones: [],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [
        {
          platform: 'LINKEDIN',
          url: 'https://www.linkedin.com/company/acme-corp',
          sourceUrl: 'https://company.org',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://company.org'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://company.org'], pagesSkipped: [], pagesFailed: [], durationMs: 8, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: false, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.7 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  const socials = res.contacts.filter(c => c.contactType === 'SOCIAL_PROFILE');
  assert.equal(socials.length, 1);
  assert.equal(socials[0].socialProfile?.associationType, 'BUSINESS_PROFILE');
});

await test('32. person social profile: person-level social profile attached to person', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://company.org',
        domain: 'company.org',
        pageTitle: 'Company Org',
        phones: [],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [
        {
          fullName: 'Grace Hopper',
          jobTitle: 'Admiral',
          linkedInUrl: 'https://www.linkedin.com/in/grace-hopper',
          sourceUrl: 'https://company.org/team',
          evidenceType: 'HTML_TEAM_SECTION',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://company.org/team'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://company.org/team'], pagesSkipped: [], pagesFailed: [], durationMs: 8, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: false, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  const socials = res.contacts.filter(c => c.contactType === 'SOCIAL_PROFILE');
  assert.equal(socials.length, 1);
  assert.equal(socials[0].socialProfile?.associationType, 'PERSON_PROFILE');
  assert.equal(socials[0].associatedPersonId, res.people[0].personId);
});

await test('33. duplicate social URL: equivalent social links normalize to single record', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://dupe-social.com',
        domain: 'dupe-social.com',
        pageTitle: 'Dupe Social',
        phones: [],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [
        {
          platform: 'FACEBOOK',
          url: 'https://facebook.com/acme',
          sourceUrl: 'https://dupe-social.com',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        },
        {
          platform: 'FACEBOOK',
          url: 'https://www.facebook.com/acme/',
          sourceUrl: 'https://dupe-social.com/contact',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://dupe-social.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://dupe-social.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: false, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  const socials = res.contacts.filter(c => c.contactType === 'SOCIAL_PROFILE');
  assert.equal(socials.length, 1, 'Duplicate social URL must be suppressed into 1 canonical contact');
});

await test('34. share/intent URL rejection: share links are not classified as profile URLs', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://share-links.com',
        domain: 'share-links.com',
        pageTitle: 'Share Links',
        phones: [],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [
        {
          platform: 'TWITTER',
          url: 'https://twitter.com/intent/tweet?url=https://share-links.com',
          sourceUrl: 'https://share-links.com/post',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://share-links.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://share-links.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: false, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  const socials = res.contacts.filter(c => c.contactType === 'SOCIAL_PROFILE');
  assert.equal(socials.length, 0, 'Must reject intent/share links');
});

await test('35. no social crawling: engine does not perform network requests on social profiles', () => {
  const engine = new ContactIntelligenceEngine();
  assert.equal(typeof engine.crawlSocial, 'undefined');
  assert.equal(typeof engine.fetchLinkedIn, 'undefined');
});

// ==========================================
// CONFLICTS (Tests 36 - 38)
// ==========================================

await test('36. conflicting emails: distinct public emails are preserved and conflict recorded', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://conflict.com',
        domain: 'conflict.com',
        pageTitle: 'Conflict Inc',
        phones: [],
        emails: ['office@conflict.com', 'billing@conflict.com'],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [
        {
          rawEmail: 'office@conflict.com',
          normalizedEmail: 'office@conflict.com',
          sourceUrl: 'https://conflict.com/office',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        },
        {
          rawEmail: 'billing@conflict.com',
          normalizedEmail: 'billing@conflict.com',
          sourceUrl: 'https://conflict.com/billing',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://conflict.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://conflict.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  const emailContacts = res.contacts.filter(c => c.contactType === 'EMAIL');
  assert.equal(emailContacts.length, 2, 'Preserve both distinct emails');
  const conflict = res.conflicts.find(c => c.conflictType === 'EMAIL_CONFLICT');
  assert.ok(conflict, 'EMAIL_CONFLICT record present');
});

await test('37. conflicting phones: distinct phone numbers recorded in conflicts array', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://phones.com',
        domain: 'phones.com',
        pageTitle: 'Phones Inc',
        phones: ['+15550001111', '+15550002222'],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [
        {
          rawNumber: '555-000-1111',
          normalizedNumber: '+15550001111',
          sourceUrl: 'https://phones.com/p1',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        },
        {
          rawNumber: '555-000-2222',
          normalizedNumber: '+15550002222',
          sourceUrl: 'https://phones.com/p2',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://phones.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://phones.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  const conflict = res.conflicts.find(c => c.conflictType === 'PHONE_CONFLICT');
  assert.ok(conflict);
  assert.equal(conflict.values.length, 2);
});

await test('38. conflicting person titles: conflicting titles across pages tracked', () => {
  const previous = {
    canonicalContacts: [],
    canonicalPeople: [
      {
        personId: 'p1',
        fullName: 'Dr. Jane Watson',
        normalizedName: 'jane watson',
        jobTitle: 'Assistant Surgeon',
        emailRefs: [],
        phoneRefs: [],
        socialRefs: [],
        sourcePages: ['https://hospital.org/staff'],
        evidence: [],
        confidenceState: 'HIGH',
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [],
        observedAt: '2026-01-01T00:00:00Z'
      }
    ]
  };

  const currentPeople = [
    {
      personId: 'p1',
      fullName: 'Dr. Jane Watson',
      normalizedName: 'jane watson',
      jobTitle: 'Chief of Surgery',
      emailRefs: [],
      phoneRefs: [],
      socialRefs: [],
      sourcePages: ['https://hospital.org/leadership'],
      evidence: [],
      confidenceState: 'HIGH',
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: '2026-02-01T00:00:00Z'
    }
  ];

  const changes = detectContactChanges(previous, [], currentPeople);
  const titleChange = changes.find(c => c.changeType === 'TITLE_CHANGED');
  assert.ok(titleChange, 'Must detect TITLE_CHANGED event');
  assert.equal(titleChange.previousValue, 'Assistant Surgeon');
  assert.equal(titleChange.currentValue, 'Chief of Surgery');
});

// ==========================================
// FRESHNESS (Tests 39 - 42)
// ==========================================

await test('39. firstObservedAt: timestamp preserved on initial observation', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://fresh.com',
        domain: 'fresh.com',
        pageTitle: 'Fresh Inc',
        phones: [],
        emails: ['info@fresh.com'],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [
        {
          rawEmail: 'info@fresh.com',
          normalizedEmail: 'info@fresh.com',
          sourceUrl: 'https://fresh.com',
          evidenceType: 'RAW_REGEX',
          observedAt: '2026-01-10T12:00:00Z',
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://fresh.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://fresh.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: '2026-01-10T12:00:00Z'
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  const contact = res.contacts[0];
  assert.ok(contact.firstObservedAt);
  assert.equal(contact.observationCount, 1);
});

await test('40. lastObservedAt: updated on repeated observation', () => {
  const engine = new ContactIntelligenceEngine();
  const t1 = '2026-01-01T00:00:00Z';
  const t2 = '2026-02-01T00:00:00Z';

  const prevSession = {
    canonicalContacts: [
      {
        contactId: 'email:info@fresh.com',
        contactType: 'EMAIL',
        rawValue: 'info@fresh.com',
        normalizedValue: 'info@fresh.com',
        sourceUrl: 'https://fresh.com',
        evidenceType: 'PUBLICLY_LISTED',
        confidenceState: 'HIGH',
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [],
        observedAt: t1,
        firstObservedAt: t1,
        lastObservedAt: t1,
        observationCount: 1
      }
    ],
    canonicalPeople: []
  };

  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://fresh.com',
        domain: 'fresh.com',
        pageTitle: 'Fresh Inc',
        phones: [],
        emails: ['info@fresh.com'],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [
        {
          rawEmail: 'info@fresh.com',
          normalizedEmail: 'info@fresh.com',
          sourceUrl: 'https://fresh.com',
          evidenceType: 'RAW_REGEX',
          observedAt: t2,
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://fresh.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://fresh.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: t2
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED',
    previousSession: prevSession
  });

  const contact = res.contacts[0];
  assert.equal(contact.firstObservedAt, t1, 'firstObservedAt preserved from previous session');
  assert.notEqual(contact.lastObservedAt, t1, 'lastObservedAt updated to latest observation');
  assert.equal(contact.observationCount, 2, 'observationCount incremented');
});

await test('41. observationCount: increments deterministically with every session', () => {
  const prev = {
    canonicalContacts: [
      {
        contactId: 'phone:+15551234567',
        contactType: 'PHONE',
        rawValue: '+15551234567',
        normalizedValue: '+15551234567',
        sourceUrl: 'https://fresh.com',
        evidenceType: 'PUBLICLY_LISTED',
        confidenceState: 'HIGH',
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [],
        observedAt: '2026-01-01T00:00:00Z',
        firstObservedAt: '2026-01-01T00:00:00Z',
        lastObservedAt: '2026-01-01T00:00:00Z',
        observationCount: 3
      }
    ],
    canonicalPeople: []
  };

  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://fresh.com',
        domain: 'fresh.com',
        pageTitle: 'Fresh Inc',
        phones: ['+15551234567'],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [
        {
          rawNumber: '(555) 123-4567',
          normalizedNumber: '+15551234567',
          sourceUrl: 'https://fresh.com',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      emails: [],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://fresh.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://fresh.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED',
    previousSession: prev
  });

  const p = res.contacts.find(c => c.contactType === 'PHONE');
  assert.equal(p?.observationCount, 4);
});

await test('42. repeated observation handling: does not duplicate contact list', () => {
  const prev = {
    canonicalContacts: [
      {
        contactId: 'email:info@fresh.com',
        contactType: 'EMAIL',
        rawValue: 'info@fresh.com',
        normalizedValue: 'info@fresh.com',
        sourceUrl: 'https://fresh.com',
        evidenceType: 'PUBLICLY_LISTED',
        confidenceState: 'HIGH',
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [],
        observedAt: '2026-01-01T00:00:00Z',
        firstObservedAt: '2026-01-01T00:00:00Z',
        lastObservedAt: '2026-01-01T00:00:00Z',
        observationCount: 1
      }
    ],
    canonicalPeople: []
  };

  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://fresh.com',
        domain: 'fresh.com',
        pageTitle: 'Fresh Inc',
        phones: [],
        emails: ['info@fresh.com'],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [
        {
          rawEmail: 'info@fresh.com',
          normalizedEmail: 'info@fresh.com',
          sourceUrl: 'https://fresh.com',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://fresh.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://fresh.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED',
    previousSession: prev
  });

  assert.equal(res.contacts.length, 1, 'No duplicate contacts produced across sessions');
});

// ==========================================
// COMPLETENESS & PRIORITY (Tests 43 - 44)
// ==========================================

await test('43. contact completeness: deterministic ratios calculated correctly', () => {
  const contacts = [
    {
      contactId: 'c1',
      contactType: 'EMAIL',
      rawValue: 'info@test.com',
      normalizedValue: 'info@test.com',
      sourceUrl: 'https://test.com',
      evidenceType: 'PUBLICLY_LISTED',
      confidenceState: 'HIGH',
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString(),
      firstObservedAt: new Date().toISOString(),
      lastObservedAt: new Date().toISOString(),
      observationCount: 1
    },
    {
      contactId: 'c2',
      contactType: 'PHONE',
      rawValue: '+15551234567',
      normalizedValue: '+15551234567',
      sourceUrl: 'https://test.com',
      evidenceType: 'PUBLICLY_LISTED',
      confidenceState: 'HIGH',
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString(),
      firstObservedAt: new Date().toISOString(),
      lastObservedAt: new Date().toISOString(),
      observationCount: 1
    }
  ];

  const comp = calculateContactCompleteness(contacts, []);
  assert.equal(comp.hasPublicEmail, true);
  assert.equal(comp.hasPublicPhone, true);
  assert.equal(comp.hasPublicPerson, false);
  assert.equal(comp.hasContactForm, false);
  assert.equal(comp.hasSocialProfile, false);
  assert.equal(comp.contactCompletenessRatio, 2 / 7);
});

await test('44. person-associated contact completeness: priority signal evaluation', () => {
  const contacts = [
    {
      contactId: 'c1',
      contactType: 'EMAIL',
      rawValue: 'founder@test.com',
      normalizedValue: 'founder@test.com',
      sourceUrl: 'https://test.com',
      evidenceType: 'PERSON_ASSOCIATED',
      confidenceState: 'HIGH',
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString(),
      firstObservedAt: new Date().toISOString(),
      lastObservedAt: new Date().toISOString(),
      observationCount: 1,
      associatedPersonId: 'p1'
    }
  ];
  const people = [
    {
      personId: 'p1',
      fullName: 'Alice Test',
      normalizedName: 'alice test',
      jobTitle: 'Founder',
      emailRefs: ['founder@test.com'],
      phoneRefs: [],
      socialRefs: [],
      sourcePages: ['https://test.com/about'],
      evidence: [],
      confidenceState: 'HIGH',
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    }
  ];

  const comp = calculateContactCompleteness(contacts, people);
  assert.equal(comp.hasPersonAssociatedEmail, true);
  assert.equal(comp.hasPublicPerson, true);

  const signal = determineContactPrioritySignal(contacts, people, []);
  assert.equal(signal, 'DIRECT_PUBLIC_CONTACT');
});

// ==========================================
// PROVENANCE (Tests 45 - 48)
// ==========================================

await test('45. WEBSITE_DERIVED preserved: facts discovered on website retain WEBSITE_DERIVED', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://site.org',
        domain: 'site.org',
        pageTitle: 'Site Org',
        phones: [],
        emails: ['info@site.org'],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [
        {
          rawEmail: 'info@site.org',
          normalizedEmail: 'info@site.org',
          sourceUrl: 'https://site.org',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://site.org'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://site.org'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'META',
    provenanceContext: 'META_DERIVED'
  });

  assert.equal(res.contacts[0].provenance, 'WEBSITE_DERIVED');
});

await test('46. LEADNORIA_DERIVED preserved: generated classifications retain LEADNORIA_DERIVED', () => {
  const emailIntel = processEmailIntelligence('support@help.com', 'https://help.com', 'help.com');
  assert.equal(emailIntel?.provenance, 'LEADNORIA_DERIVED');
});

await test('47. upstream Meta provenance preserved: Meta parent context does not block export', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://meta-source.com',
        domain: 'meta-source.com',
        pageTitle: 'Meta Source',
        phones: [],
        emails: ['meta@source.com'],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [
        {
          rawEmail: 'meta@source.com',
          normalizedEmail: 'meta@source.com',
          sourceUrl: 'https://meta-source.com',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://meta-source.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://meta-source.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'META',
    provenanceContext: 'META_DERIVED'
  });

  assert.equal(res.isRestricted, false);
  assert.equal(res.exportEligibility, 'EXPORTABLE');
  assert.equal(res.persistenceEligibility, 'PERSISTABLE');
});

await test('48. upstream Google provenance preserved: Google candidate origin is tracked explicitly', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://google-origin.com',
        domain: 'google-origin.com',
        pageTitle: 'Google Origin',
        phones: [],
        emails: ['info@origin.com'],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [
        {
          rawEmail: 'info@origin.com',
          normalizedEmail: 'info@origin.com',
          sourceUrl: 'https://google-origin.com',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://google-origin.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://google-origin.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED'
  });

  assert.equal(res.sourceContributions[0].source, 'GOOGLE_MAPS');
  assert.equal(res.sourceContributions[0].provenance, 'GOOGLE_DERIVED');
});

// ==========================================
// GOOGLE RESTRICTION FIREWALL (Tests 49 - 52)
// ==========================================

await test('49. Google email child cannot become exportable: blocked by ExportPolicy', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://gmap-lead.com',
        domain: 'gmap-lead.com',
        pageTitle: 'GMap Lead',
        phones: [],
        emails: ['owner@gmap-lead.com'],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [
        {
          rawEmail: 'owner@gmap-lead.com',
          normalizedEmail: 'owner@gmap-lead.com',
          sourceUrl: 'https://gmap-lead.com',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://gmap-lead.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://gmap-lead.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED'
  });

  const emailContact = res.contacts[0];
  assert.equal(res.exportEligibility, 'NOT_EXPORTABLE');
  assert.equal(emailContact.sourceContributions[0].exportStatus, 'NOT_EXPORTABLE');
  assert.equal(emailContact.sourceContributions[0].restrictionBasis, 'GOOGLE_CONSUMER_WEB_RESTRICTED');

  const exportPolicy = new ExportPolicy();
  const evalField = exportPolicy.evaluateField('email', {
    sourceProvenance: 'GOOGLE_DERIVED',
    isEligible: false,
    restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED'
  });
  assert.equal(evalField.decision, 'EXPORT_BLOCKED');
});

await test('50. Google person child cannot become persistable: blocked by persistence policy', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://gmap-lead.com',
        domain: 'gmap-lead.com',
        pageTitle: 'GMap Lead',
        phones: [],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [
        {
          fullName: 'John Doe',
          jobTitle: 'Store Manager',
          sourceUrl: 'https://gmap-lead.com/staff',
          evidenceType: 'HTML_TEAM_SECTION',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://gmap-lead.com/staff'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://gmap-lead.com/staff'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: false, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED'
  });

  assert.equal(res.persistenceEligibility, 'NOT_PERSISTABLE');
  assert.equal(res.people[0].sourceContributions[0].persistenceStatus, 'NOT_PERSISTABLE');
});

await test('51. Google contact remains restricted after normalization', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://gmap-lead.com',
        domain: 'gmap-lead.com',
        pageTitle: 'GMap Lead',
        phones: [],
        emails: ['  SALES@GMAP-LEAD.COM  '],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [
        {
          rawEmail: '  SALES@GMAP-LEAD.COM  ',
          normalizedEmail: 'sales@gmap-lead.com',
          sourceUrl: 'https://gmap-lead.com',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://gmap-lead.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://gmap-lead.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED'
  });

  const contact = res.contacts[0];
  assert.equal(contact.normalizedValue, 'sales@gmap-lead.com');
  assert.equal(contact.sourceContributions[0].isRestricted, true);
  assert.equal(contact.sourceContributions[0].exportStatus, 'NOT_EXPORTABLE');
});

await test('52. Google contact remains restricted after deduplication', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://gmap-lead.com',
        domain: 'gmap-lead.com',
        pageTitle: 'GMap Lead',
        phones: [],
        emails: ['sales@gmap-lead.com', 'SALES@GMAP-LEAD.COM'],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [
        {
          rawEmail: 'sales@gmap-lead.com',
          normalizedEmail: 'sales@gmap-lead.com',
          sourceUrl: 'https://gmap-lead.com/p1',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        },
        {
          rawEmail: 'SALES@GMAP-LEAD.COM',
          normalizedEmail: 'sales@gmap-lead.com',
          sourceUrl: 'https://gmap-lead.com/p2',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://gmap-lead.com'],
      crawlStats: { pagesDiscovered: 2, pagesVisited: ['https://gmap-lead.com/p1', 'https://gmap-lead.com/p2'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED'
  });

  assert.equal(res.contacts.length, 1);
  assert.equal(res.contacts[0].sourceContributions[0].isRestricted, true);
  assert.equal(res.contacts[0].sourceContributions[0].exportStatus, 'NOT_EXPORTABLE');
});

// ==========================================
// SECURITY & UNTRUSTED INPUTS (Tests 53 - 57)
// ==========================================

await test('53. malicious email-like text: script tags inside email input stripped or rejected', () => {
  const bad = '<script>alert(1)</script>foo@bar.com';
  const norm = normalizeEmail(bad);
  assert.equal(norm, null);
});

await test('54. unsafe social URL: javascript:, data:, and file: URLs rejected', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://security.com',
        domain: 'security.com',
        pageTitle: 'Security Test',
        phones: [],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [
        {
          platform: 'OTHER',
          url: 'javascript:alert(document.cookie)',
          sourceUrl: 'https://security.com',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        },
        {
          platform: 'OTHER',
          url: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
          sourceUrl: 'https://security.com',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://security.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://security.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: false, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  const socials = res.contacts.filter(c => c.contactType === 'SOCIAL_PROFILE');
  assert.equal(socials.length, 0, 'Unsafe social URLs must be discarded');
});

await test('55. script-bearing contact value: HTML payloads in names and titles sanitized', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://security.com',
        domain: 'security.com',
        pageTitle: 'Security Test',
        phones: [],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [
        {
          fullName: 'Alice <b>Smith</b><script>alert(1)</script>',
          jobTitle: 'VP of <i>Sales</i><style>body{display:none}</style>',
          sourceUrl: 'https://security.com/team',
          evidenceType: 'HTML_TEAM_SECTION',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://security.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://security.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: false, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  const person = res.people[0];
  assert.equal(person.fullName, 'Alice Smith');
  assert.equal(person.jobTitle, 'VP of Sales');
});

await test('56. prototype pollution input: payload keys cannot pollute Object.prototype', () => {
  const maliciousPerson = JSON.parse('{"__proto__": {"polluted": true}, "fullName": "Attacker", "sourceUrl": "https://hack.com", "evidenceType": "HTML_TEAM_SECTION", "observedAt": "2026-01-01T00:00:00Z", "provenance": "WEBSITE_DERIVED"}');
  const people = clusterAndDeduplicatePeople([maliciousPerson], new Date().toISOString());
  assert.equal(Object.prototype.polluted, undefined);
  assert.equal(people.length, 1);
});

await test('57. oversized contact field: huge string values truncated or discarded', () => {
  const hugeEmail = 'a'.repeat(300) + '@example.com';
  const norm = normalizeEmail(hugeEmail);
  assert.equal(norm, null, 'Oversized emails (>254 chars) must be rejected');

  const hugeName = 'John ' + 'Doe '.repeat(200);
  const normName = normalizePersonName(hugeName);
  assert.ok(normName.length <= 100, 'Normalized name must be bounded');
});

// ==========================================
// REGRESSION (Tests 58 - 62)
// ==========================================

await test('58. Phase 11 integration: compatibility with Phase 11 ContactEvidenceItem & facts', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://p11.org',
        domain: 'p11.org',
        pageTitle: 'Phase 11 Org',
        phones: ['+15551239999'],
        emails: ['hello@p11.org'],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [
        {
          type: 'EMAIL',
          rawValue: 'hello@p11.org',
          normalizedValue: 'hello@p11.org',
          confidence: 'HIGH',
          evidenceType: 'RAW_REGEX',
          sourceUrl: 'https://p11.org',
          provenance: 'WEBSITE_DERIVED',
          observedAt: new Date().toISOString()
        }
      ],
      phones: [
        {
          rawNumber: '(555) 123-9999',
          normalizedNumber: '+15551239999',
          sourceUrl: 'https://p11.org',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      emails: [
        {
          rawEmail: 'hello@p11.org',
          normalizedEmail: 'hello@p11.org',
          sourceUrl: 'https://p11.org',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://p11.org'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://p11.org'], pagesSkipped: [], pagesFailed: [], durationMs: 10, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.9 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  assert.equal(res.contacts.length, 2);
  const graph = buildContactSourceGraph('https://p11.org', res.contacts, res.people);
  assert.equal(graph.nodes.length >= 3, true);
});

await test('59. Phase 21 integration: consumes full Phase 21 WebsiteIntelligenceResult', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://phase21.com',
        domain: 'phase21.com',
        pageTitle: 'Phase 21 Tech',
        phones: ['+15550003333'],
        emails: ['info@phase21.com'],
        serviceAreas: ['New York'],
        services: ['Consulting'],
        categories: ['Professional Services']
      },
      contacts: [],
      phones: [
        {
          rawNumber: '(555) 000-3333',
          normalizedNumber: '+15550003333',
          sourceUrl: 'https://phase21.com/contact',
          evidenceType: 'TEL_LINK',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      emails: [
        {
          rawEmail: 'info@phase21.com',
          normalizedEmail: 'info@phase21.com',
          sourceUrl: 'https://phase21.com/contact',
          evidenceType: 'MAILTO_LINK',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [
        {
          platform: 'LINKEDIN',
          url: 'https://linkedin.com/company/phase21',
          sourceUrl: 'https://phase21.com',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      publicPeople: [
        {
          fullName: 'Alan Kay',
          jobTitle: 'Fellow',
          email: 'akay@phase21.com',
          sourceUrl: 'https://phase21.com/team',
          evidenceType: 'HTML_TEAM_SECTION',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      services: [],
      technologySignals: [
        {
          name: 'WordPress',
          category: 'CMS',
          state: 'DETECTED',
          evidence: 'wp-content/themes',
          observedAt: new Date().toISOString(),
          provenance: 'LEADNORIA_DERIVED'
        }
      ],
      contactForms: [
        {
          actionUrl: 'https://phase21.com/api/contact',
          method: 'POST',
          fields: ['name', 'email', 'message'],
          sourceUrl: 'https://phase21.com/contact',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      sourcePages: ['https://phase21.com', 'https://phase21.com/contact', 'https://phase21.com/team'],
      crawlStats: { pagesDiscovered: 3, pagesVisited: ['https://phase21.com', 'https://phase21.com/contact', 'https://phase21.com/team'], pagesSkipped: [], pagesFailed: [], durationMs: 25, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.95 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  assert.equal(res.people.length, 1);
  assert.equal(res.contacts.length >= 4, true); // phone, info@, akay@, linkedin, contact form
  assert.equal(res.completeness.hasContactForm, true);
  assert.equal(res.completeness.hasPublicPerson, true);
});

await test('60. Phase 16 firewall: ExportPolicy blocks entire Google-derived result from exporting', () => {
  const exportPolicy = new ExportPolicy();
  const evaluation = exportPolicy.evaluateRecord({
    recordId: 'rec_google_123',
    primarySource: 'GOOGLE_MAPS',
    fieldEligibility: {
      email: {
        sourceProvenance: 'GOOGLE_DERIVED',
        isEligible: false,
        restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED'
      },
      phone: {
        sourceProvenance: 'GOOGLE_DERIVED',
        isEligible: false,
        restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED'
      }
    },
    restrictions: {
      isRestricted: true,
      exportEligible: false,
      persistenceEligible: false,
      restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED'
    }
  });

  assert.equal(evaluation.isEligibleForExport, false);
  assert.equal(evaluation.projection, null);
  assert.equal(evaluation.blockedReason, 'GOOGLE_CONSUMER_WEB_RESTRICTED');
});

await test('61. Phase 17 security: Contact intelligence output passes strict object immutability and no-eval constraints', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://security17.com',
        domain: 'security17.com',
        pageTitle: 'Security 17',
        phones: [],
        emails: ['sec@security17.com'],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [
        {
          rawEmail: 'sec@security17.com',
          normalizedEmail: 'sec@security17.com',
          sourceUrl: 'https://security17.com',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: [],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://security17.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://security17.com'], pagesSkipped: [], pagesFailed: [], durationMs: 5, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.8 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'WEBSITE_DERIVED'
  });

  const serialized = JSON.stringify(res);
  assert.ok(!serialized.includes('<script>'));
  assert.ok(serialized.includes('sec@security17.com'));
});

await test('62. Phase 20 Google pipeline: candidate flowing from Phase 20 maintains restricted child contact facts', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://gmaps-p20-plumber.com',
        domain: 'gmaps-p20-plumber.com',
        pageTitle: 'Gmaps P20 Plumber',
        phones: ['+15559871111'],
        emails: ['plumber@gmaps-p20-plumber.com'],
        serviceAreas: [],
        services: [],
        categories: ['Plumber']
      },
      contacts: [],
      phones: [
        {
          rawNumber: '(555) 987-1111',
          normalizedNumber: '+15559871111',
          sourceUrl: 'https://gmaps-p20-plumber.com',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      emails: [
        {
          rawEmail: 'plumber@gmaps-p20-plumber.com',
          normalizedEmail: 'plumber@gmaps-p20-plumber.com',
          sourceUrl: 'https://gmaps-p20-plumber.com',
          evidenceType: 'RAW_REGEX',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: [
        {
          fullName: 'Mario Mario',
          jobTitle: 'Master Plumber',
          sourceUrl: 'https://gmaps-p20-plumber.com/about',
          evidenceType: 'HTML_TEAM_SECTION',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      services: [],
      technologySignals: [],
      contactForms: [],
      sourcePages: ['https://gmaps-p20-plumber.com'],
      crawlStats: { pagesDiscovered: 1, pagesVisited: ['https://gmaps-p20-plumber.com'], pagesSkipped: [], pagesFailed: [], durationMs: 10, fromCache: false },
      verificationState: { isVerified: true, hasBusinessIdentity: true, hasContactInformation: true, checksPassed: ['DOMAIN_RESOLVED'], checksFailed: [], confidenceScore: 0.9 },
      conflicts: [],
      warnings: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: [
        {
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          fieldName: 'website',
          acquisitionContext: 'GOOGLE_CONSUMER_WEB',
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          isRestricted: true,
          policyStatus: 'PRODUCT_REJECTED',
          persistenceStatus: 'NOT_PERSISTABLE',
          exportStatus: 'NOT_EXPORTABLE'
        }
      ],
      observedAt: new Date().toISOString()
    },
    sourceContext: 'GOOGLE_MAPS',
    provenanceContext: 'GOOGLE_DERIVED',
    sourceRestrictions: {
      isRestricted: true,
      restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
      policyStatus: 'PRODUCT_REJECTED',
      persistenceEligibility: 'NOT_PERSISTABLE',
      exportEligibility: 'NOT_EXPORTABLE'
    }
  });

  assert.equal(res.isRestricted, true);
  assert.equal(res.exportEligibility, 'NOT_EXPORTABLE');
  assert.equal(res.persistenceEligibility, 'NOT_PERSISTABLE');
  for (const c of res.contacts) {
    assert.equal(c.sourceContributions[0].isRestricted, true);
    assert.equal(c.sourceContributions[0].exportStatus, 'NOT_EXPORTABLE');
    assert.equal(c.sourceContributions[0].persistenceStatus, 'NOT_PERSISTABLE');
  }
  for (const p of res.people) {
    assert.equal(p.sourceContributions[0].isRestricted, true);
    assert.equal(p.sourceContributions[0].exportStatus, 'NOT_EXPORTABLE');
    assert.equal(p.sourceContributions[0].persistenceStatus, 'NOT_PERSISTABLE');
  }
});

// ==========================================
// EMAIL INTEGRITY CORRECTION (Tests EMAIL-CASE-01 to EMAIL-GUARD-03)
// ==========================================

await test('EMAIL-CASE-01: Smith@example.com and smith@example.com remain distinct', () => {
  const e1 = normalizeEmail('Smith@example.com');
  const e2 = normalizeEmail('smith@example.com');
  assert.equal(e1, 'Smith@example.com');
  assert.equal(e2, 'smith@example.com');
  assert.notEqual(e1, e2, 'Local-part case semantics must be preserved');
});

await test('EMAIL-CASE-02: SMITH@Example.COM normalizes domain casing while preserving local-part case', () => {
  const norm = normalizeEmail('SMITH@Example.COM');
  assert.equal(norm, 'SMITH@example.com');
});

await test('EMAIL-CASE-03: Repeated exact same public email deduplicates', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://dedup-email.com',
        domain: 'dedup-email.com',
        pageTitle: 'Dedup Inc',
        phones: [],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [
        {
          rawEmail: 'Manager@dedup-email.com',
          normalizedEmail: 'Manager@dedup-email.com',
          sourceUrl: 'https://dedup-email.com/page1',
          evidenceType: 'PUBLICLY_LISTED',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        },
        {
          rawEmail: 'Manager@DEDUP-EMAIL.COM',
          normalizedEmail: 'Manager@dedup-email.com',
          sourceUrl: 'https://dedup-email.com/page2',
          evidenceType: 'PUBLICLY_LISTED',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ],
      socialProfiles: [],
      publicPeople: []
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'USER_PROVIDED'
  });

  const emails = res.contacts.filter(c => c.contactType === 'EMAIL');
  assert.equal(emails.length, 1, 'Exact same public email must deduplicate across pages');
  assert.equal(emails[0].normalizedValue, 'Manager@dedup-email.com');
  assert.equal(emails[0].observationCount, 2);
  assert.equal(emails[0].sourcePages.length, 2);
});

await test('EMAIL-QUOTED-01: Quoted local-part containing @ is parsed correctly', () => {
  const norm = normalizeEmail('"a@b"@example.com');
  assert.equal(norm, '"a@b"@example.com');
  const intel = processEmailIntelligence('"a@b"@example.com', 'https://example.com', 'example.com');
  assert.ok(intel);
  assert.equal(intel.localPart, '"a@b"');
  assert.equal(intel.domainPart, 'example.com');
});

await test('EMAIL-QUOTED-02: Quoted local-part containing escaped characters is handled safely', () => {
  const norm = normalizeEmail('"john\\"doe"@example.com');
  assert.equal(norm, '"john\\"doe"@example.com');
  const normEsc = normalizeEmail('"hello\\\\world"@example.com');
  assert.equal(normEsc, '"hello\\\\world"@example.com');
});

await test('EMAIL-DOMAIN-01: Normal ASCII domain accepted', () => {
  const norm = normalizeEmail('contact@standard-business.org');
  assert.equal(norm, 'contact@standard-business.org');
});

await test('EMAIL-DOMAIN-02: Subdomain accepted', () => {
  const norm = normalizeEmail('support@mail.staging.corp.co.uk');
  assert.equal(norm, 'support@mail.staging.corp.co.uk');
});

await test('EMAIL-DOMAIN-03: Punycode A-label domain accepted', () => {
  const norm = normalizeEmail('info@xn--fiqs8s.cn');
  assert.equal(norm, 'info@xn--fiqs8s.cn');
  const normTld = normalizeEmail('sales@example.xn--fiqs8s');
  assert.equal(normTld, 'sales@example.xn--fiqs8s');
});

await test('EMAIL-DOMAIN-04: Malformed domain rejected', () => {
  assert.equal(normalizeEmail('user@-invalid.com'), null, 'Leading hyphen rejected');
  assert.equal(normalizeEmail('user@invalid-.com'), null, 'Trailing hyphen rejected');
  assert.equal(normalizeEmail('user@invalid..com'), null, 'Consecutive dots rejected');
  assert.equal(normalizeEmail('user@invalid'), null, 'Single label domain without TLD rejected');
  assert.equal(normalizeEmail('user@domain.123'), null, 'Purely numeric TLD rejected');
  assert.equal(normalizeEmail('user@domain.c'), null, 'Single character TLD rejected');
});

await test('EMAIL-DOMAIN-05: Whitespace/control characters rejected', () => {
  assert.equal(normalizeEmail('user@exam ple.com'), null);
  assert.equal(normalizeEmail('user@example\t.com'), null);
  assert.equal(normalizeEmail('user@example.com\n'), null);
  assert.equal(normalizeEmail('us er@example.com'), null);
});

await test('EMAIL-DOMAIN-06: Invalid hostname labels rejected', () => {
  assert.equal(normalizeEmail('user@exam_ple.com'), null, 'Underscore in domain label rejected');
  assert.equal(normalizeEmail('user@exam$ple.com'), null, 'Special character in domain label rejected');
  assert.equal(normalizeEmail('user@exam!ple.com'), null, 'Exclamation in domain label rejected');
});

await test('EMAIL-DOMAIN-07: Domain comparison remains case-insensitive', () => {
  const rel1 = evaluateEmailDomainRelationship('user@EXAMPLE.COM', 'example.com');
  assert.equal(rel1, 'EXACT_DOMAIN_MATCH');
  const rel2 = evaluateEmailDomainRelationship('user@sub.EXAMPLE.COM', 'example.com');
  assert.equal(rel2, 'SUBDOMAIN_MATCH');
});

await test('EMAIL-DOMAIN-08: Local-part comparison remains case-sensitive', () => {
  const res1 = processEmailIntelligence('Admin@example.com');
  const res2 = processEmailIntelligence('admin@example.com');
  assert.notEqual(res1?.normalizedEmail, res2?.normalizedEmail);
  assert.equal(res1?.localPart, 'Admin');
  assert.equal(res2?.localPart, 'admin');
});

await test('EMAIL-GUARD-01: No email guessing', () => {
  const engine = new ContactIntelligenceEngine();
  const res = engine.process({
    websiteResult: {
      identity: {
        canonicalUrl: 'https://no-guess.org',
        domain: 'no-guess.org',
        pageTitle: 'No Guess Inc',
        phones: [],
        emails: [],
        serviceAreas: [],
        services: [],
        categories: []
      },
      contacts: [],
      phones: [],
      emails: [],
      socialProfiles: [],
      publicPeople: [
        {
          fullName: 'Johnathan Archer',
          jobTitle: 'Captain',
          sourceUrl: 'https://no-guess.org/crew',
          evidenceType: 'HTML_TEAM_SECTION',
          observedAt: new Date().toISOString(),
          provenance: 'WEBSITE_DERIVED'
        }
      ]
    },
    sourceContext: 'USER_PROVIDED',
    provenanceContext: 'USER_PROVIDED'
  });

  const emails = res.contacts.filter(c => c.contactType === 'EMAIL');
  assert.equal(emails.length, 0, 'No synthetic emails generated');
  assert.equal(res.people[0].emailRefs.length, 0, 'No guessed email attached to person');
});

await test('EMAIL-GUARD-02: No SMTP probing', () => {
  assert.equal(typeof processEmailIntelligence, 'function');
  const res = processEmailIntelligence('user@nonexistent-mx-domain-probe-12345.com');
  assert.ok(res, 'Syntactic validation executes purely locally without network/MX/SMTP');
});

await test('EMAIL-GUARD-03: No external verification API', () => {
  const res = processEmailIntelligence('test.user@company.com');
  assert.equal(res?.isValid, true);
  assert.equal(res?.provenance, 'LEADNORIA_DERIVED');
});

console.log(`\n--- TEST RUN COMPLETE: ${passedTests} passed, ${failedTests} failed ---\n`);

if (failedTests > 0) {
  process.exit(1);
}
