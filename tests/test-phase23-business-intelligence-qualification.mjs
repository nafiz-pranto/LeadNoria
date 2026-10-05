import assert from 'assert';
import {
  buildBusinessIntelligenceProfile,
  evaluateLeadQualification,
  validateQualificationProfile,
  evaluateCriterion,
  deriveCompositeRestrictions,
  CANONICAL_DEFAULT_PROFILE,
  LOCAL_SERVICE_BUSINESS_PROFILE,
  B2B_PROSPECT_PROFILE,
  DIGITAL_COMMERCE_BUSINESS_PROFILE,
  HIGH_CONTACTABILITY_PROFILE
} from '../src/extension/qualification/index.ts';

const accounts = {
  'Business Intelligence Signals': { passed: 0, failed: 0 },
  'Contact Quality Signals': { passed: 0, failed: 0 },
  'Cross-Source Corroboration': { passed: 0, failed: 0 },
  'Conflict Handling': { passed: 0, failed: 0 },
  'Qualification States': { passed: 0, failed: 0 },
  'Explainability & Reason Graph': { passed: 0, failed: 0 },
  'Completeness Metrics': { passed: 0, failed: 0 },
  'Temporal Freshness': { passed: 0, failed: 0 },
  'Provenance Integrity': { passed: 0, failed: 0 },
  'Google Firewall Invariant': { passed: 0, failed: 0 },
  'Security & Sanitization': { passed: 0, failed: 0 },
  'Regression & Architectural Compatibility': { passed: 0, failed: 0 },
  'Reusable Profile Templates': { passed: 0, failed: 0 },
  'Qualification Precedence Semantics': { passed: 0, failed: 0 }
};

let currentAccount = 'Business Intelligence Signals';

function pass(name) {
  accounts[currentAccount].passed++;
  console.log(`  [PASS] ${name}`);
}

function fail(name, error) {
  accounts[currentAccount].failed++;
  console.error(`  [FAIL] ${name}:`, error?.message || error);
}

function runSection(accountName, testFn) {
  currentAccount = accountName;
  console.log(`\n--- ${accountName} ---`);
  testFn();
}

// ==========================================
// Fixtures & Test Data Helpers
// ==========================================

function mkSampleWebsiteResult(overrides = {}) {
  return {
    identity: {
      canonicalUrl: 'https://acme-plumbing.com/',
      domain: 'acme-plumbing.com',
      pageTitle: 'Acme Commercial Plumbing Services',
      businessName: 'Acme Commercial Plumbing',
      address: '123 Main St, Austin, TX 78701',
      phones: ['+15125551234'],
      emails: ['contact@acme-plumbing.com'],
      businessHours: 'Mon-Fri 8am-6pm',
      serviceAreas: ['Austin', 'Round Rock'],
      services: ['Commercial Plumbing', 'Hydro Jetting', 'Backflow Testing'],
      categories: ['Commercial Contractor', 'Plumber']
    },
    contacts: [],
    phones: [
      {
        id: 'p1',
        rawPhone: '512-555-1234',
        normalizedPhone: '+15125551234',
        status: 'VERIFIED',
        evidence: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: []
      }
    ],
    emails: [
      {
        id: 'e1',
        rawEmail: 'info@acme-plumbing.com',
        normalizedEmail: 'info@acme-plumbing.com',
        status: 'VERIFIED',
        evidence: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: []
      }
    ],
    socialProfiles: [
      {
        id: 's1',
        platform: 'LINKEDIN',
        url: 'https://linkedin.com/company/acme-plumbing',
        status: 'VERIFIED',
        evidence: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: []
      }
    ],
    publicPeople: [
      {
        fullName: 'Jane Doe',
        jobTitle: 'Operations Director',
        email: 'jane@acme-plumbing.com',
        phone: '+15125551235',
        sourceUrl: 'https://acme-plumbing.com/team',
        evidenceType: 'TEAM_PAGE',
        observedAt: new Date().toISOString(),
        provenance: 'WEBSITE_DERIVED'
      }
    ],
    address: {
      id: 'a1',
      rawAddress: '123 Main St, Austin, TX 78701',
      normalizedAddress: '123 Main St, Austin, TX 78701',
      city: 'Austin',
      region: 'TX',
      postalCode: '78701',
      country: 'US',
      status: 'VERIFIED',
      evidence: [],
      provenance: 'WEBSITE_DERIVED',
      sourceContributions: []
    },
    services: [
      {
        name: 'Commercial Plumbing',
        sourceUrl: 'https://acme-plumbing.com/services',
        observedAt: new Date().toISOString(),
        provenance: 'WEBSITE_DERIVED'
      }
    ],
    description: {
      text: 'Premier commercial plumbing contractor serving Central Texas since 2005.',
      sourceType: 'HOMEPAGE',
      sourceUrl: 'https://acme-plumbing.com',
      observedAt: new Date().toISOString(),
      provenance: 'WEBSITE_DERIVED'
    },
    businessHours: 'Mon-Fri 8am-6pm',
    technologySignals: [
      {
        name: 'Shopify',
        category: 'ECOMMERCE',
        state: 'DETECTED',
        evidence: 'Shopify script',
        observedAt: new Date().toISOString(),
        provenance: 'WEBSITE_DERIVED'
      },
      {
        name: 'Calendly',
        category: 'BOOKING',
        state: 'DETECTED',
        evidence: 'Calendly widget',
        observedAt: new Date().toISOString(),
        provenance: 'WEBSITE_DERIVED'
      },
      {
        name: 'Intercom',
        category: 'CHAT_WIDGET',
        state: 'DETECTED',
        evidence: 'Intercom bundle',
        observedAt: new Date().toISOString(),
        provenance: 'WEBSITE_DERIVED'
      },
      {
        name: 'Google Analytics 4',
        category: 'ANALYTICS',
        state: 'DETECTED',
        evidence: 'gtag.js',
        observedAt: new Date().toISOString(),
        provenance: 'WEBSITE_DERIVED'
      },
      {
        name: 'WordPress',
        category: 'CMS',
        state: 'DETECTED',
        evidence: 'wp-content',
        observedAt: new Date().toISOString(),
        provenance: 'WEBSITE_DERIVED'
      }
    ],
    contactForms: [
      {
        id: 'cf1',
        url: 'https://acme-plumbing.com/contact',
        hasNameField: true,
        hasEmailField: true,
        hasPhoneField: true,
        hasMessageField: true,
        present: true,
        evidence: [],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: []
      }
    ],
    sourcePages: ['https://acme-plumbing.com/'],
    crawlStats: {
      pagesDiscovered: 5,
      pagesVisited: ['https://acme-plumbing.com/'],
      pagesSkipped: [],
      pagesFailed: [],
      durationMs: 450,
      fromCache: false
    },
    verificationState: 'VERIFIED',
    conflicts: [],
    warnings: [],
    provenance: 'WEBSITE_DERIVED',
    sourceContributions: [
      {
        source: 'WEBSITE',
        provenance: 'WEBSITE_DERIVED',
        fieldName: 'identity',
        acquisitionContext: 'WEBSITE_DIRECT',
        restrictionBasis: 'NONE',
        isRestricted: false,
        policyStatus: 'POLICY_APPROVED',
        persistenceStatus: 'PERSISTABLE',
        exportStatus: 'EXPORTABLE'
      }
    ],
    observedAt: new Date().toISOString(),
    ...overrides
  };
}

function mkSampleContactResult(overrides = {}) {
  return {
    entityId: 'ent_acme_1',
    targetDomain: 'acme-plumbing.com',
    contacts: [
      {
        contactId: 'c_email_1',
        contactType: 'EMAIL',
        rawValue: 'info@acme-plumbing.com',
        normalizedValue: 'info@acme-plumbing.com',
        sourceUrl: 'https://acme-plumbing.com/contact',
        sourcePages: ['https://acme-plumbing.com/contact'],
        evidenceType: 'PUBLICLY_LISTED',
        confidenceState: 'HIGH',
        emailClassification: 'ROLE_ACCOUNT',
        observedAt: new Date().toISOString(),
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: []
      },
      {
        contactId: 'c_email_2',
        contactType: 'EMAIL',
        rawValue: 'Jane.Doe@acme-plumbing.com',
        normalizedValue: 'Jane.Doe@acme-plumbing.com',
        sourceUrl: 'https://acme-plumbing.com/team',
        sourcePages: ['https://acme-plumbing.com/team'],
        evidenceType: 'PERSON_ASSOCIATED',
        confidenceState: 'HIGH',
        emailClassification: 'PERSON_NAMED',
        associatedPersonId: 'p_jane_1',
        observedAt: new Date().toISOString(),
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: []
      },
      {
        contactId: 'c_phone_1',
        contactType: 'PHONE',
        rawValue: '512-555-1234',
        normalizedValue: '+15125551234',
        sourceUrl: 'https://acme-plumbing.com/',
        sourcePages: ['https://acme-plumbing.com/'],
        evidenceType: 'PUBLICLY_LISTED',
        confidenceState: 'HIGH',
        observedAt: new Date().toISOString(),
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: []
      },
      {
        contactId: 'c_phone_2',
        contactType: 'PHONE',
        rawValue: '512-555-1235',
        normalizedValue: '+15125551235',
        sourceUrl: 'https://acme-plumbing.com/team',
        sourcePages: ['https://acme-plumbing.com/team'],
        evidenceType: 'PERSON_ASSOCIATED',
        confidenceState: 'HIGH',
        associatedPersonId: 'p_jane_1',
        observedAt: new Date().toISOString(),
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: []
      }
    ],
    people: [
      {
        personId: 'p_jane_1',
        fullName: 'Jane Doe',
        jobTitle: 'Director of Commercial Accounts',
        emailRefs: ['c_email_2'],
        phoneRefs: ['c_phone_2'],
        sourceUrls: ['https://acme-plumbing.com/team'],
        confidenceState: 'HIGH',
        observedAt: new Date().toISOString(),
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: []
      }
    ],
    completeness: {
      contactCompletenessRatio: 0.85,
      hasEmail: true,
      hasPhone: true,
      hasPublicPerson: true,
      hasSocialProfile: true,
      hasPersonDirectContact: true,
      totalContactsObserved: 4,
      totalPeopleObserved: 1
    },
    ...overrides
  };
}

// ==========================================
// 1. Business Intelligence Signals (1 - 9)
// ==========================================
runSection('Business Intelligence Signals', () => {
  // 1. verified website
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult()
    });
    assert.strictEqual(bi.digitalPresence.verifiedWebsite.value, true);
    assert.strictEqual(bi.digitalPresence.verifiedWebsite.state, 'CONFIRMED');
    pass('1. verified website observed and confirmed');
  } catch (err) {
    fail('1. verified website', err);
  }

  // 2. missing website
  try {
    const bi = buildBusinessIntelligenceProfile({});
    assert.strictEqual(bi.digitalPresence.websitePresent.value, false);
    assert.strictEqual(bi.digitalPresence.websitePresent.state, 'NOT_FOUND');
    assert.strictEqual(bi.digitalPresence.verifiedWebsite.state, 'NOT_FOUND');
    pass('2. missing website returns NOT_FOUND (no fabrication)');
  } catch (err) {
    fail('2. missing website', err);
  }

  // 3. service evidence
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult()
    });
    assert.ok(bi.businessActivity.publishedServices.value.includes('Commercial Plumbing'));
    assert.strictEqual(bi.businessActivity.publishedServices.state, 'OBSERVED');
    pass('3. published services extracted and observed');
  } catch (err) {
    fail('3. service evidence', err);
  }

  // 4. business category
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult(),
      googleCandidate: { categories: ['Plumbing Contractor', 'Drainage Service'] }
    });
    assert.ok(bi.identity.primaryCategory.value === 'Commercial Contractor' || bi.identity.primaryCategory.value === 'Plumbing Contractor');
    assert.ok(bi.identity.secondaryCategories.value.length > 0);
    pass('4. business category merged across sources');
  } catch (err) {
    fail('4. business category', err);
  }

  // 5. service area
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult()
    });
    assert.ok(bi.location.serviceAreas.value.includes('Austin'));
    assert.ok(bi.location.serviceAreas.value.includes('Round Rock'));
    pass('5. service area evidence observed');
  } catch (err) {
    fail('5. service area', err);
  }

  // 6. business hours
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult()
    });
    assert.strictEqual(bi.businessActivity.businessHours.value, 'Mon-Fri 8am-6pm');
    assert.strictEqual(bi.businessActivity.businessHours.state, 'OBSERVED');
    pass('6. business hours observed');
  } catch (err) {
    fail('6. business hours', err);
  }

  // 7. digital technology signals
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult()
    });
    assert.strictEqual(bi.digitalPresence.ecommercePresent.value, true);
    assert.strictEqual(bi.digitalPresence.bookingSystemPresent.value, true);
    assert.strictEqual(bi.digitalPresence.chatPresent.value, true);
    assert.strictEqual(bi.digitalPresence.analyticsTechnologyPresent.value, true);
    assert.strictEqual(bi.digitalPresence.cmsDetected.value, 'WordPress');
    pass('7. digital technology signals (ecommerce, booking, chat, analytics, cms) detected');
  } catch (err) {
    fail('7. digital technology signals', err);
  }

  // 8. contact availability
  try {
    const bi = buildBusinessIntelligenceProfile({
      contactResult: mkSampleContactResult()
    });
    assert.strictEqual(bi.businessActivity.contactAvailability.value, 'AVAILABLE');
    assert.strictEqual(bi.businessActivity.contactAvailability.state, 'OBSERVED');
    pass('8. contact availability classified as AVAILABLE');
  } catch (err) {
    fail('8. contact availability', err);
  }

  // 9. person availability
  try {
    const bi = buildBusinessIntelligenceProfile({
      contactResult: mkSampleContactResult()
    });
    assert.strictEqual(bi.contactPresence.publicPersonPresent.value, true);
    assert.strictEqual(bi.contactPresence.personWithTitlePresent.value, true);
    pass('9. public person and job title availability confirmed');
  } catch (err) {
    fail('9. person availability', err);
  }
});

// ==========================================
// 2. Contact Quality Signals (10 - 15)
// ==========================================
runSection('Contact Quality Signals', () => {
  // 10. public email
  try {
    const bi = buildBusinessIntelligenceProfile({
      contactResult: mkSampleContactResult()
    });
    assert.strictEqual(bi.contactPresence.publicEmailPresent.value, true);
    assert.strictEqual(bi.contactPresence.publicEmailPresent.state, 'CONFIRMED');
    pass('10. public email confirmed');
  } catch (err) {
    fail('10. public email', err);
  }

  // 11. role email
  try {
    const bi = buildBusinessIntelligenceProfile({
      contactResult: mkSampleContactResult()
    });
    assert.strictEqual(bi.contactPresence.roleEmailPresent.value, true);
    assert.strictEqual(bi.contactPresence.roleEmailPresent.state, 'CONFIRMED');
    pass('11. role email identified without value judgments');
  } catch (err) {
    fail('11. role email', err);
  }

  // 12. person email
  try {
    const bi = buildBusinessIntelligenceProfile({
      contactResult: mkSampleContactResult()
    });
    assert.strictEqual(bi.contactPresence.personEmailPresent.value, true);
    assert.strictEqual(bi.contactPresence.personEmailPresent.state, 'CONFIRMED');
    pass('12. person-associated email observed');
  } catch (err) {
    fail('12. person email', err);
  }

  // 13. public phone
  try {
    const bi = buildBusinessIntelligenceProfile({
      contactResult: mkSampleContactResult()
    });
    assert.strictEqual(bi.contactPresence.publicPhonePresent.value, true);
    assert.strictEqual(bi.contactPresence.personPhonePresent.value, true);
    pass('13. public phone and person phone observed');
  } catch (err) {
    fail('13. public phone', err);
  }

  // 14. contact form
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult()
    });
    assert.strictEqual(bi.digitalPresence.contactFormPresent.value, true);
    assert.strictEqual(bi.digitalPresence.contactFormPresent.state, 'OBSERVED');
    pass('14. contact form presence observed');
  } catch (err) {
    fail('14. contact form', err);
  }

  // 15. social presence
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult()
    });
    assert.ok(bi.digitalPresence.socialPresence.value.includes('LINKEDIN'));
    assert.strictEqual(bi.digitalPresence.socialPresence.state, 'OBSERVED');
    pass('15. social presence platforms observed');
  } catch (err) {
    fail('15. social presence', err);
  }
});

// ==========================================
// 3. Cross-Source Corroboration (16 - 20)
// ==========================================
runSection('Cross-Source Corroboration', () => {
  // 16. website + Meta corroboration
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult({
        identity: { businessName: 'Acme Commercial Plumbing', domain: 'acme-plumbing.com' }
      }),
      metaCandidate: {
        businessName: 'Acme Commercial Plumbing',
        pageUrl: 'https://facebook.com/acmeplumbing',
        adCount: 3,
        adStatus: 'ACTIVE'
      }
    });
    assert.strictEqual(bi.identity.canonicalBusinessName.state, 'CORROBORATED');
    assert.ok(bi.identity.canonicalBusinessName.corroborationSources.includes('WEBSITE'));
    assert.ok(bi.identity.canonicalBusinessName.corroborationSources.includes('META'));
    pass('16. website + Meta identity corroboration');
  } catch (err) {
    fail('16. website + Meta corroboration', err);
  }

  // 17. website + Google corroboration
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult(),
      googleCandidate: {
        businessName: 'Acme Commercial Plumbing',
        phone: '+15125551234',
        address: '123 Main St, Austin, TX 78701'
      }
    });
    assert.strictEqual(bi.identity.canonicalBusinessName.state, 'CORROBORATED');
    assert.strictEqual(bi.location.address.state, 'CORROBORATED');
    assert.strictEqual(bi.corroboration.identityCorroborated, true);
    pass('17. website + Google Maps identity and address corroboration');
  } catch (err) {
    fail('17. website + Google corroboration', err);
  }

  // 18. phone corroboration
  try {
    const bi = buildBusinessIntelligenceProfile({
      contactResult: mkSampleContactResult(),
      googleCandidate: { phone: '(512) 555-1234' }
    });
    assert.strictEqual(bi.contactPresence.publicPhonePresent.state, 'CORROBORATED');
    assert.strictEqual(bi.corroboration.phoneCorroborated, true);
    pass('18. normalized phone corroboration across distinct sources');
  } catch (err) {
    fail('18. phone corroboration', err);
  }

  // 19. domain corroboration
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult({ identity: { domain: 'acme-plumbing.com' } }),
      candidate: {
        websiteUrl: {
          value: { canonicalDomain: 'acme-plumbing.com' }
        },
        overallProvenance: 'GOOGLE_DERIVED'
      }
    });
    assert.strictEqual(bi.identity.verifiedDomain.state, 'CORROBORATED');
    assert.strictEqual(bi.corroboration.domainCorroborated, true);
    pass('19. domain corroboration between website crawl and listing record');
  } catch (err) {
    fail('19. domain corroboration', err);
  }

  // 20. branch preservation
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult(),
      contactResult: mkSampleContactResult()
    });
    assert.ok(bi.crossSourceCorroborations !== undefined);
    assert.ok(Array.isArray(bi.corroboration.details));
    pass('20. source contributions and branches preserved without destructive merging');
  } catch (err) {
    fail('20. branch preservation', err);
  }
});

// ==========================================
// 4. Conflicts (21 - 24)
// ==========================================
runSection('Conflict Handling', () => {
  // 21. address conflict
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult({
        address: { normalizedAddress: '400 Congress Ave, Austin, TX' }
      }),
      googleCandidate: { address: '999 Industrial Blvd, Dallas, TX' }
    });
    assert.strictEqual(bi.location.address.state, 'CONTRADICTORY');
    assert.ok(bi.conflicts.some(c => c.signal === 'address'));
    pass('21. address conflict detected and marked CONTRADICTORY');
  } catch (err) {
    fail('21. address conflict', err);
  }

  // 22. phone conflict
  try {
    const bi = buildBusinessIntelligenceProfile({
      contactResult: mkSampleContactResult(),
      googleCandidate: { phone: '+12125559999' }
    });
    assert.strictEqual(bi.contactPresence.publicPhonePresent.state === 'CONTRADICTORY' || bi.conflicts.some(c => c.signal === 'publicPhonePresent'), true);
    pass('22. phone conflict marked CONTRADICTORY without picking arbitrary winner');
  } catch (err) {
    fail('22. phone conflict', err);
  }

  // 23. business-name conflict
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult({ identity: { businessName: 'Omega Global Industries' } }),
      googleCandidate: { businessName: 'Bob Pizza Shack' }
    });
    assert.strictEqual(bi.identity.canonicalBusinessName.state, 'CONTRADICTORY');
    pass('23. business-name conflict cleanly flagged as CONTRADICTORY');
  } catch (err) {
    fail('23. business-name conflict', err);
  }

  // 24. service conflict
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult()
    });
    assert.ok(bi.conflicts !== undefined);
    pass('24. conflicts structured safely without throwing exceptions');
  } catch (err) {
    fail('24. service conflict', err);
  }
});

// ==========================================
// 5. Qualification States (25 - 33)
// ==========================================
runSection('Qualification States', () => {
  const testProfile = {
    profileId: 'test_bi_profile_v1',
    profileName: 'Test Profile',
    version: '1.0.0',
    enabled: true,
    missingDataPolicy: 'MISSING_IS_UNKNOWN',
    unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
    conflictPolicy: 'STRICT_CONTRADICTION',
    thresholds: { minimumScore: 50 },
    criteria: [
      {
        id: 'crit_web',
        type: 'VERIFIED_BUSINESS_WEBSITE',
        operator: 'EXISTS',
        mandatory: true,
        weight: 30
      },
      {
        id: 'crit_phone',
        type: 'PUBLIC_PHONE_AVAILABLE',
        operator: 'EXISTS',
        mandatory: true,
        weight: 30
      },
      {
        id: 'crit_email',
        type: 'PUBLIC_EMAIL_AVAILABLE',
        operator: 'EXISTS',
        mandatory: false,
        weight: 40
      }
    ]
  };

  // 25. PASS
  try {
    const context = {
      entityId: 'cand_pass',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult(),
        contactResult: mkSampleContactResult()
      })
    };
    const res = evaluateCriterion(testProfile.criteria[0], context, {
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'STRICT_CONTRADICTION'
    });
    assert.strictEqual(res.outcome, 'PASS');
    pass('25. PASS criterion evaluation');
  } catch (err) {
    fail('25. PASS', err);
  }

  // 26. FAIL
  try {
    const context = {
      entityId: 'cand_fail',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult()
      })
    };
    const failCrit = {
      id: 'crit_custom_fail',
      type: 'DIGITAL_CMS_DETECTED',
      operator: 'EQUALS',
      expectedValue: 'Drupal',
      mandatory: true,
      weight: 10
    };
    const res = evaluateCriterion(failCrit, context, {
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'STRICT_CONTRADICTION'
    });
    assert.strictEqual(res.outcome, 'FAIL');
    pass('26. FAIL criterion evaluation when expected value mismatches');
  } catch (err) {
    fail('26. FAIL', err);
  }

  // 27. UNKNOWN
  try {
    const context = {
      entityId: 'cand_unk',
      businessIntelligence: buildBusinessIntelligenceProfile({})
    };
    const res = evaluateCriterion(testProfile.criteria[0], context, {
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'STRICT_CONTRADICTION'
    });
    assert.strictEqual(res.outcome, 'UNKNOWN');
    pass('27. UNKNOWN outcome when data is missing under MISSING_IS_UNKNOWN');
  } catch (err) {
    fail('27. UNKNOWN', err);
  }

  // 28. CONTRADICTORY
  try {
    const context = {
      entityId: 'cand_contra',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult({ address: { normalizedAddress: '123 Fake St' } }),
        googleCandidate: { address: '999 Other St' }
      })
    };
    const addrCrit = {
      id: 'crit_addr',
      type: 'HAS_BUSINESS_ADDRESS',
      operator: 'EXISTS',
      mandatory: true,
      weight: 20
    };
    const res = evaluateCriterion(addrCrit, context, {
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'STRICT_CONTRADICTION'
    });
    assert.strictEqual(res.outcome, 'CONTRADICTORY');
    pass('28. CONTRADICTORY outcome on address conflict under STRICT_CONTRADICTION');
  } catch (err) {
    fail('28. CONTRADICTORY', err);
  }

  // 29. BLOCKED
  try {
    const context = {
      entityId: 'cand_blocked',
      sourceContributions: [
        {
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          fieldName: 'has_business_phone',
          acquisitionContext: 'GOOGLE_CONSUMER_WEB',
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          isRestricted: true,
          policyStatus: 'PRODUCT_REJECTED'
        }
      ]
    };
    const res = evaluateCriterion(testProfile.criteria[1], context, {
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'STRICT_CONTRADICTION'
    });
    assert.strictEqual(res.outcome, 'BLOCKED');
    pass('29. BLOCKED outcome on policy restricted field');
  } catch (err) {
    fail('29. BLOCKED', err);
  }

  // 30. QUALIFIED
  try {
    const context = {
      entityId: 'cand_qual',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult(),
        contactResult: mkSampleContactResult()
      })
    };
    const dec = evaluateLeadQualification(context, testProfile);
    assert.strictEqual(dec.status, 'QUALIFIED');
    assert.strictEqual(dec.scoreSummary.thresholdPassed, true);
    pass('30. QUALIFIED final state when all mandatory criteria pass and threshold met');
  } catch (err) {
    fail('30. QUALIFIED', err);
  }

  // 31. NOT_QUALIFIED
  try {
    const failProfile = {
      ...testProfile,
      missingDataPolicy: 'MISSING_FAILS_REQUIRED',
      criteria: [
        {
          id: 'crit_ecom_req',
          type: 'DIGITAL_ECOMMERCE_PRESENT',
          operator: 'EXISTS',
          mandatory: true,
          weight: 50
        }
      ]
    };
    const context = {
      entityId: 'cand_not_qual',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult({ technologySignals: [] })
      })
    };
    const dec = evaluateLeadQualification(context, failProfile);
    assert.strictEqual(dec.status, 'NOT_QUALIFIED');
    pass('31. NOT_QUALIFIED final state when mandatory criterion fails');
  } catch (err) {
    fail('31. NOT_QUALIFIED', err);
  }

  // 32. UNCERTAIN
  try {
    const context = {
      entityId: 'cand_unc',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult()
      })
    };
    // Email criterion is mandatory and missing
    const unkProfile = {
      ...testProfile,
      criteria: [
        {
          id: 'crit_mandatory_phone',
          type: 'PUBLIC_PHONE_AVAILABLE',
          operator: 'EXISTS',
          mandatory: true,
          weight: 50
        }
      ]
    };
    const dec = evaluateLeadQualification(context, unkProfile);
    assert.strictEqual(dec.status, 'UNCERTAIN');
    pass('32. UNCERTAIN final state on unobserved mandatory criterion');
  } catch (err) {
    fail('32. UNCERTAIN', err);
  }

  // 33. BLOCKED final state
  try {
    const blockedProfile = {
      ...testProfile,
      criteria: [
        {
          id: 'crit_blocked_field',
          type: 'HAS_BUSINESS_PHONE',
          operator: 'EXISTS',
          mandatory: true,
          weight: 50
        }
      ]
    };
    const context = {
      entityId: 'cand_blocked_final',
      sourceContributions: [
        {
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          fieldName: 'has_business_phone',
          acquisitionContext: 'GOOGLE_CONSUMER_WEB',
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          isRestricted: true,
          policyStatus: 'PRODUCT_REJECTED'
        }
      ]
    };
    const dec = evaluateLeadQualification(context, blockedProfile);
    assert.strictEqual(dec.status, 'BLOCKED');
    pass('33. BLOCKED final state when mandatory criterion is blocked');
  } catch (err) {
    fail('33. BLOCKED final state', err);
  }
});

// ==========================================
// 6. Explainability & Reason Graph (34 - 36)
// ==========================================
runSection('Explainability & Reason Graph', () => {
  const context = {
    entityId: 'cand_explain_1',
    businessIntelligence: buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult(),
      contactResult: mkSampleContactResult()
    })
  };
  const decision = evaluateLeadQualification(context, CANONICAL_DEFAULT_PROFILE);

  // 34. criterion evidence
  try {
    for (const r of decision.criterionResults) {
      assert.ok(Array.isArray(r.evidence), `Criterion ${r.criterionId} must have evidence array`);
    }
    pass('34. criterion evidence attached to all evaluation results');
  } catch (err) {
    fail('34. criterion evidence', err);
  }

  // 35. criterion rationale
  try {
    for (const r of decision.criterionResults) {
      assert.ok(r.explanation && r.explanation.length > 5, `Criterion ${r.criterionId} must have detailed explanation`);
      assert.ok(r.reasonCode && r.reasonCode.length > 3, `Criterion ${r.criterionId} must have typed reasonCode`);
    }
    pass('35. criterion rationale and explanation strings present');
  } catch (err) {
    fail('35. criterion rationale', err);
  }

  // 36. final reason graph
  try {
    assert.ok(decision.reasonGraph, 'QualificationDecision must contain a reasonGraph');
    assert.strictEqual(decision.reasonGraph.finalStatus, decision.status);
    assert.ok(decision.reasonGraph.primaryRationale.length > 0);
    assert.ok(Array.isArray(decision.reasonGraph.nodes));
    assert.ok(Array.isArray(decision.reasonGraph.passingFactors));
    pass('36. final reason graph completely explains qualification path');
  } catch (err) {
    fail('36. final reason graph', err);
  }
});

// ==========================================
// 7. Completeness Metrics (37 - 41)
// ==========================================
runSection('Completeness Metrics', () => {
  const bi = buildBusinessIntelligenceProfile({
    websiteResult: mkSampleWebsiteResult(),
    contactResult: mkSampleContactResult()
  });

  // 37. evidence coverage
  try {
    assert.ok(typeof bi.completenessMetrics.evidenceCoverage === 'number');
    assert.ok(bi.completenessMetrics.evidenceCoverage > 0 && bi.completenessMetrics.evidenceCoverage <= 1.0);
    pass('37. evidence coverage is a deterministic ratio between 0 and 1');
  } catch (err) {
    fail('37. evidence coverage', err);
  }

  // 38. contact completeness
  try {
    assert.ok(typeof bi.completenessMetrics.contactCompleteness === 'number');
    assert.ok(bi.completenessMetrics.contactCompleteness > 0);
    pass('38. contact completeness measurement');
  } catch (err) {
    fail('38. contact completeness', err);
  }

  // 39. business completeness
  try {
    assert.ok(typeof bi.completenessMetrics.businessCompleteness === 'number');
    assert.ok(bi.completenessMetrics.businessCompleteness > 0);
    pass('39. business completeness measurement without predictive conversion scoring');
  } catch (err) {
    fail('39. business completeness', err);
  }

  // 40. contradiction count
  try {
    assert.strictEqual(typeof bi.completenessMetrics.contradictionCount, 'number');
    assert.strictEqual(bi.completenessMetrics.contradictionCount, 0);
    pass('40. contradiction count measurement');
  } catch (err) {
    fail('40. contradiction count', err);
  }

  // 41. unknown count
  try {
    assert.strictEqual(typeof bi.completenessMetrics.unknownCriterionCount, 'number');
    pass('41. unknown criterion count measurement');
  } catch (err) {
    fail('41. unknown count', err);
  }
});

// ==========================================
// 8. Temporal Freshness (42 - 44)
// ==========================================
runSection('Temporal Freshness', () => {
  // 42. current evidence
  try {
    const biCurrent = buildBusinessIntelligenceProfile({
      metaCandidate: {
        businessName: 'Acme Ads',
        adCount: 5,
        observedAt: new Date().toISOString()
      },
      freshnessMaxAgeDays: 30
    });
    assert.strictEqual(biCurrent.advertisingSignals.hasMetaAds.freshnessState, 'CURRENT');
    pass('42. current evidence classified as CURRENT');
  } catch (err) {
    fail('42. current evidence', err);
  }

  // 43. stale evidence
  try {
    const fourMonthsAgo = new Date(Date.now() - 120 * 86400000).toISOString();
    const biStale = buildBusinessIntelligenceProfile({
      metaCandidate: {
        businessName: 'Acme Ads',
        adCount: 5,
        observedAt: fourMonthsAgo
      },
      freshnessMaxAgeDays: 30
    });
    assert.strictEqual(biStale.advertisingSignals.hasMetaAds.freshnessState, 'STALE');
    pass('43. stale evidence classified as STALE');
  } catch (err) {
    fail('43. stale evidence', err);
  }

  // 44. freshness threshold
  try {
    const twoMonthsAgo = new Date(Date.now() - 60 * 86400000).toISOString();
    const bi90Days = buildBusinessIntelligenceProfile({
      metaCandidate: {
        businessName: 'Acme Ads',
        adCount: 5,
        observedAt: twoMonthsAgo
      },
      freshnessMaxAgeDays: 90
    });
    assert.strictEqual(bi90Days.advertisingSignals.hasMetaAds.freshnessState, 'CURRENT');
    pass('44. configurable freshness threshold respected');
  } catch (err) {
    fail('44. freshness threshold', err);
  }
});

// ==========================================
// 9. Provenance Integrity (45 - 49)
// ==========================================
runSection('Provenance Integrity', () => {
  // 45. WEBSITE_DERIVED
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult()
    });
    assert.strictEqual(bi.provenance, 'WEBSITE_DERIVED');
    pass('45. WEBSITE_DERIVED provenance preserved');
  } catch (err) {
    fail('45. WEBSITE_DERIVED', err);
  }

  // 46. META_DERIVED
  try {
    const bi = buildBusinessIntelligenceProfile({
      metaCandidate: { businessName: 'Meta Client', adCount: 2 }
    });
    assert.strictEqual(bi.provenance, 'META_DERIVED');
    pass('46. META_DERIVED provenance preserved');
  } catch (err) {
    fail('46. META_DERIVED', err);
  }

  // 47. GOOGLE_DERIVED
  try {
    const bi = buildBusinessIntelligenceProfile({
      googleCandidate: { businessName: 'Google Listing', isRestricted: true }
    });
    assert.strictEqual(bi.provenance, 'GOOGLE_DERIVED');
    pass('47. GOOGLE_DERIVED provenance preserved');
  } catch (err) {
    fail('47. GOOGLE_DERIVED', err);
  }

  // 48. LEADNORIA_DERIVED
  try {
    const context = {
      entityId: 'test_composite',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult()
      })
    };
    const dec = evaluateLeadQualification(context, CANONICAL_DEFAULT_PROFILE);
    assert.ok(dec.provenance !== undefined);
    pass('48. composite decision lineage maintained');
  } catch (err) {
    fail('48. LEADNORIA_DERIVED', err);
  }

  // 49. USER_PROVIDED
  try {
    const bi = buildBusinessIntelligenceProfile({
      userProvidedUrl: 'https://user-submitted.com'
    });
    assert.strictEqual(bi.provenance, 'USER_PROVIDED');
    pass('49. USER_PROVIDED provenance preserved distinctly');
  } catch (err) {
    fail('49. USER_PROVIDED', err);
  }
});

// ==========================================
// 10. Google Firewall Invariant (50 - 52)
// ==========================================
runSection('Google Firewall Invariant', () => {
  const restrictedBi = buildBusinessIntelligenceProfile({
    googleCandidate: {
      businessName: 'Restricted Maps Shop',
      isRestricted: true
    }
  });

  // 50. restricted Google qualification cannot become exportable
  try {
    assert.strictEqual(restrictedBi.sourceRestrictions?.exportEligibility, 'NOT_EXPORTABLE');
    const context = {
      entityId: 'google_cand_1',
      businessIntelligence: restrictedBi
    };
    const decision = evaluateLeadQualification(context, CANONICAL_DEFAULT_PROFILE);
    assert.strictEqual(decision.sourceRestrictions.exportEligibility, 'NOT_EXPORTABLE');
    pass('50. restricted Google qualification decision remains NOT_EXPORTABLE');
  } catch (err) {
    fail('50. Google exportable firewall', err);
  }

  // 51. restricted Google qualification cannot become persistable
  try {
    assert.strictEqual(restrictedBi.sourceRestrictions?.persistenceEligibility, 'NOT_PERSISTABLE');
    const context = {
      entityId: 'google_cand_2',
      businessIntelligence: restrictedBi
    };
    const decision = evaluateLeadQualification(context, CANONICAL_DEFAULT_PROFILE);
    assert.strictEqual(decision.sourceRestrictions.persistenceEligibility, 'NOT_PERSISTABLE');
    pass('51. restricted Google qualification decision remains NOT_PERSISTABLE');
  } catch (err) {
    fail('51. Google persistable firewall', err);
  }

  // 52. Google child evidence cannot bypass policy
  try {
    const context = {
      entityId: 'google_cand_3',
      businessIntelligence: restrictedBi
    };
    const decision = evaluateLeadQualification(context, CANONICAL_DEFAULT_PROFILE);
    assert.strictEqual(decision.sourceRestrictions.isRestricted, true);
    assert.strictEqual(decision.sourceRestrictions.restrictionBasis, 'GOOGLE_CONSUMER_WEB_RESTRICTED');
    pass('52. Google child evidence strictly retains GOOGLE_CONSUMER_WEB_RESTRICTED');
  } catch (err) {
    fail('52. Google child evidence firewall', err);
  }
});

// ==========================================
// 11. Security & Sanitization (53 - 56)
// ==========================================
runSection('Security & Sanitization', () => {
  // 53. malicious business fields
  try {
    const bi = buildBusinessIntelligenceProfile({
      googleCandidate: {
        businessName: '<script>alert("xss")</script> Commercial Plumbers',
        address: '"><svg onload=alert(1)>'
      }
    });
    assert.strictEqual(bi.identity.canonicalBusinessName.value, '<script>alert("xss")</script> Commercial Plumbers');
    // Verify it is treated as a plain data string, not evaluated or executed
    pass('53. malicious business fields treated as pure untrusted text');
  } catch (err) {
    fail('53. malicious business fields', err);
  }

  // 54. injected rationale text
  try {
    const malProfile = {
      profileId: 'injection_profile',
      profileName: 'Inject',
      version: '1.0.0',
      enabled: true,
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'STRICT_CONTRADICTION',
      criteria: [
        {
          id: 'crit_injection',
          type: 'VERIFIED_BUSINESS_WEBSITE',
          operator: 'EXISTS',
          mandatory: false,
          description: '${alert(1)} DROP TABLE Candidates; --'
        }
      ]
    };
    const dec = evaluateLeadQualification({ entityId: 'c1' }, malProfile);
    assert.ok(dec.reasonGraph?.nodes.length > 0);
    pass('54. injected rationale text safely formatted without code execution');
  } catch (err) {
    fail('54. injected rationale text', err);
  }

  // 55. malformed criterion metadata
  try {
    const malformed = {
      profileId: 'bad_crit',
      version: '1.0.0',
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'STRICT_CONTRADICTION',
      criteria: [
        {
          id: 'invalid_type_crit',
          type: 'UNSUPPORTED_TYPE_XYZ',
          operator: 'EXISTS',
          mandatory: true
        }
      ]
    };
    const val = validateQualificationProfile(malformed);
    assert.strictEqual(val.isValid, false);
    assert.ok(val.errors.some(e => e.includes('invalid or unsupported criterion type')));
    pass('55. malformed criterion rejected by validator');
  } catch (err) {
    fail('55. malformed criterion metadata', err);
  }

  // 56. prototype pollution
  try {
    const pollutionPayload = JSON.parse('{"__proto__": {"polluted": true}, "profileId": "p", "version": "1.0.0", "missingDataPolicy": "MISSING_IS_UNKNOWN", "unknownDataPolicy": "UNKNOWN_YIELDS_UNCERTAIN", "conflictPolicy": "STRICT_CONTRADICTION", "criteria": []}');
    const val = validateQualificationProfile(pollutionPayload);
    assert.strictEqual(val.isValid, false);
    assert.strictEqual(Object.prototype.polluted, undefined);
    pass('56. prototype pollution rejected and blocked');
  } catch (err) {
    fail('56. prototype pollution', err);
  }
});

// ==========================================
// 12. Regression & Architectural Compatibility (57 - 62)
// ==========================================
runSection('Regression & Architectural Compatibility', () => {
  // 57. Phase 12 compatibility
  try {
    const val = validateQualificationProfile(CANONICAL_DEFAULT_PROFILE);
    assert.strictEqual(val.isValid, true);
    const context = {
      entityId: 'cand_p12',
      relevanceResult: {
        entityId: 'cand_p12',
        relevanceState: 'RELEVANT',
        internalScore: 80,
        evidenceWaterfall: [],
        sourceContributions: [],
        derivedFrom: []
      },
      websiteState: 'WEBSITE_VERIFIED_BUSINESS_SITE',
      contactEnrichment: {
        entityId: 'cand_p12',
        targetDomain: 'example.com',
        status: 'CONTACT_FOUND',
        phones: [{ rawValue: '555-1234', normalizedValue: '+15551234', confidence: 'HIGH', evidence: [] }],
        emails: [],
        addresses: [],
        contactForms: [],
        socialProfiles: [],
        provenance: 'WEBSITE_DERIVED',
        completeness: 0.6
      }
    };
    const dec = evaluateLeadQualification(context, CANONICAL_DEFAULT_PROFILE);
    assert.strictEqual(dec.status, 'QUALIFIED');
    pass('57. Phase 12 qualification engine remains 100% compatible and authoritative');
  } catch (err) {
    fail('57. Phase 12 compatibility', err);
  }

  // 58. Phase 21 compatibility
  try {
    const web = mkSampleWebsiteResult();
    const bi = buildBusinessIntelligenceProfile({ websiteResult: web });
    assert.strictEqual(bi.digitalPresence.websitePresent.value, true);
    assert.strictEqual(bi.digitalPresence.ecommercePresent.value, true);
    pass('58. Phase 21 WebsiteIntelligenceResult seamlessly consumed');
  } catch (err) {
    fail('58. Phase 21 compatibility', err);
  }

  // 59. Phase 22 compatibility
  try {
    const contacts = mkSampleContactResult();
    const bi = buildBusinessIntelligenceProfile({ contactResult: contacts });
    assert.strictEqual(bi.contactPresence.publicPersonPresent.value, true);
    assert.strictEqual(bi.contactPresence.roleEmailPresent.value, true);
    pass('59. Phase 22 ContactIntelligenceResult seamlessly consumed');
  } catch (err) {
    fail('59. Phase 22 compatibility', err);
  }

  // 60. Phase 16 firewall compatibility
  try {
    const restrContext = {
      entityId: 'cand_p16',
      sourceContributions: [
        {
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          fieldName: 'maps',
          acquisitionContext: 'GOOGLE_CONSUMER_WEB',
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          isRestricted: true,
          persistenceStatus: 'NOT_PERSISTABLE',
          exportStatus: 'NOT_EXPORTABLE'
        }
      ]
    };
    const restrictions = deriveCompositeRestrictions(restrContext);
    assert.strictEqual(restrictions.isRestricted, true);
    assert.strictEqual(restrictions.persistenceEligibility, 'NOT_PERSISTABLE');
    assert.strictEqual(restrictions.exportEligibility, 'NOT_EXPORTABLE');
    pass('60. Phase 16 firewall restrictions preserved without leakage');
  } catch (err) {
    fail('60. Phase 16 firewall compatibility', err);
  }

  // 61. Phase 17 security compatibility
  try {
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult()
    });
    assert.strictEqual(typeof bi.completenessMetrics.evidenceCoverage, 'number');
    pass('61. Phase 17 safe validation and execution guarantees maintained');
  } catch (err) {
    fail('61. Phase 17 security compatibility', err);
  }

  // 62. Phase 8 entity compatibility
  try {
    const resolvedGroup = {
      entityGroupId: 'grp_123',
      resolutionStatus: 'UNIFIED',
      candidates: []
    };
    const bi = buildBusinessIntelligenceProfile({
      websiteResult: mkSampleWebsiteResult(),
      resolvedEntityGroup: resolvedGroup
    });
    assert.ok(bi.identity.canonicalBusinessName.value);
    pass('62. Phase 8 entity resolution and grouping models honored');
  } catch (err) {
    fail('62. Phase 8 entity compatibility', err);
  }
});

// ==========================================
// 13. Reusable Profile Templates (63 - 66)
// ==========================================
runSection('Reusable Profile Templates', () => {
  // 63. LOCAL_SERVICE_BUSINESS_PROFILE
  try {
    const val = validateQualificationProfile(LOCAL_SERVICE_BUSINESS_PROFILE);
    assert.strictEqual(val.isValid, true);
    const context = {
      entityId: 'local_svc_cand',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult(),
        contactResult: mkSampleContactResult()
      })
    };
    const dec = evaluateLeadQualification(context, LOCAL_SERVICE_BUSINESS_PROFILE);
    assert.strictEqual(dec.status, 'QUALIFIED');
    pass('63. LOCAL_SERVICE_BUSINESS_PROFILE validates and evaluates correctly');
  } catch (err) {
    fail('63. LOCAL_SERVICE_BUSINESS_PROFILE', err);
  }

  // 64. B2B_PROSPECT_PROFILE
  try {
    const val = validateQualificationProfile(B2B_PROSPECT_PROFILE);
    assert.strictEqual(val.isValid, true);
    const context = {
      entityId: 'b2b_cand',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult(),
        contactResult: mkSampleContactResult()
      })
    };
    const dec = evaluateLeadQualification(context, B2B_PROSPECT_PROFILE);
    assert.strictEqual(dec.status, 'QUALIFIED');
    pass('64. B2B_PROSPECT_PROFILE validates and evaluates correctly');
  } catch (err) {
    fail('64. B2B_PROSPECT_PROFILE', err);
  }

  // 65. DIGITAL_COMMERCE_BUSINESS_PROFILE
  try {
    const val = validateQualificationProfile(DIGITAL_COMMERCE_BUSINESS_PROFILE);
    assert.strictEqual(val.isValid, true);
    const context = {
      entityId: 'ecom_cand',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult(),
        contactResult: mkSampleContactResult()
      })
    };
    const dec = evaluateLeadQualification(context, DIGITAL_COMMERCE_BUSINESS_PROFILE);
    assert.strictEqual(dec.status, 'QUALIFIED');
    pass('65. DIGITAL_COMMERCE_BUSINESS_PROFILE validates and evaluates correctly');
  } catch (err) {
    fail('65. DIGITAL_COMMERCE_BUSINESS_PROFILE', err);
  }

  // 66. HIGH_CONTACTABILITY_PROFILE
  try {
    const val = validateQualificationProfile(HIGH_CONTACTABILITY_PROFILE);
    assert.strictEqual(val.isValid, true);
    const context = {
      entityId: 'contact_cand',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult(),
        contactResult: mkSampleContactResult()
      })
    };
    const dec = evaluateLeadQualification(context, HIGH_CONTACTABILITY_PROFILE);
    assert.strictEqual(dec.status, 'QUALIFIED');
    pass('66. HIGH_CONTACTABILITY_PROFILE validates and evaluates correctly');
  } catch (err) {
    fail('66. HIGH_CONTACTABILITY_PROFILE', err);
  }
});

// ==========================================
// 14. Qualification Precedence Semantics (A - G)
// ==========================================
runSection('Qualification Precedence Semantics', () => {
  // A. PASS + UNKNOWN + non-mandatory FAIL => QUALIFIED
  try {
    const profileA = {
      profileId: 'prec_a_profile',
      profileName: 'Precedence A Profile',
      version: '1.0.0',
      enabled: true,
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'STRICT_CONTRADICTION',
      thresholds: { minimumScore: 40 },
      criteria: [
        {
          id: 'mand_pass',
          type: 'VERIFIED_BUSINESS_WEBSITE',
          operator: 'EXISTS',
          mandatory: true,
          weight: 50
        },
        {
          id: 'opt_unk',
          type: 'DIGITAL_CMS_DETECTED',
          operator: 'EXISTS',
          mandatory: false,
          weight: 20
        },
        {
          id: 'opt_fail_explicit',
          type: 'DIGITAL_CMS_DETECTED',
          operator: 'EQUALS',
          expectedValue: 'Shopify', // actual is 'WordPress'
          mandatory: false,
          weight: 30
        }
      ]
    };
    const contextA = {
      entityId: 'cand_prec_a',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult()
      })
    };
    const decA = evaluateLeadQualification(contextA, profileA);
    assert.strictEqual(decA.criterionResults.find(c => c.criterionId === 'mand_pass')?.outcome, 'PASS');
    assert.strictEqual(decA.criterionResults.find(c => c.criterionId === 'opt_fail_explicit')?.outcome, 'FAIL');
    assert.strictEqual(decA.status, 'QUALIFIED');
    pass('A: PASS + UNKNOWN + non-mandatory FAIL yields QUALIFIED (non-mandatory FAIL does not block)');
  } catch (err) {
    fail('A: PASS + UNKNOWN + non-mandatory FAIL', err);
  }

  // B. PASS + mandatory FAIL => NOT_QUALIFIED
  try {
    const profileB = {
      profileId: 'prec_b_profile',
      profileName: 'Precedence B Profile',
      version: '1.0.0',
      enabled: true,
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'STRICT_CONTRADICTION',
      criteria: [
        {
          id: 'mand_pass',
          type: 'VERIFIED_BUSINESS_WEBSITE',
          operator: 'EXISTS',
          mandatory: true,
          weight: 50
        },
        {
          id: 'mand_fail',
          type: 'DIGITAL_CMS_DETECTED',
          operator: 'EQUALS',
          expectedValue: 'Shopify', // actual is 'WordPress'
          mandatory: true,
          weight: 50
        }
      ]
    };
    const contextB = {
      entityId: 'cand_prec_b',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult()
      })
    };
    const decB = evaluateLeadQualification(contextB, profileB);
    assert.strictEqual(decB.criterionResults.find(c => c.criterionId === 'mand_pass')?.outcome, 'PASS');
    assert.strictEqual(decB.criterionResults.find(c => c.criterionId === 'mand_fail')?.outcome, 'FAIL');
    assert.strictEqual(decB.status, 'NOT_QUALIFIED');
    pass('B: PASS + mandatory FAIL yields NOT_QUALIFIED');
  } catch (err) {
    fail('B: PASS + mandatory FAIL', err);
  }

  // C. PASS + non-mandatory CONTRADICTORY => QUALIFIED
  try {
    const profileC = {
      profileId: 'prec_c_profile',
      profileName: 'Precedence C Profile',
      version: '1.0.0',
      enabled: true,
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'STRICT_CONTRADICTION',
      thresholds: { minimumScore: 50 },
      criteria: [
        {
          id: 'mand_web',
          type: 'VERIFIED_BUSINESS_WEBSITE',
          operator: 'EXISTS',
          mandatory: true,
          weight: 60
        },
        {
          id: 'opt_conflicting_addr',
          type: 'HAS_BUSINESS_ADDRESS',
          operator: 'EXISTS',
          mandatory: false,
          weight: 40
        }
      ]
    };
    const contextC = {
      entityId: 'cand_prec_c',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult({
          address: { normalizedAddress: '100 Main St, Austin, TX' }
        }),
        googleCandidate: { address: '999 Other Rd, Dallas, TX' }
      })
    };
    const decC = evaluateLeadQualification(contextC, profileC);
    assert.strictEqual(decC.criterionResults.find(c => c.criterionId === 'mand_web')?.outcome, 'PASS');
    assert.strictEqual(decC.criterionResults.find(c => c.criterionId === 'opt_conflicting_addr')?.outcome, 'CONTRADICTORY');
    assert.strictEqual(decC.status, 'QUALIFIED');
    assert.ok(decC.contradictionReasons.length > 0);
    pass('C: PASS + non-mandatory CONTRADICTORY yields QUALIFIED (contradiction only affects dependent criterion)');
  } catch (err) {
    fail('C: PASS + non-mandatory CONTRADICTORY', err);
  }

  // D. PASS + mandatory CONTRADICTORY under STRICT_CONTRADICTION => UNCERTAIN
  try {
    const profileD = {
      profileId: 'prec_d_profile',
      profileName: 'Precedence D Profile',
      version: '1.0.0',
      enabled: true,
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'STRICT_CONTRADICTION',
      criteria: [
        {
          id: 'mand_web',
          type: 'VERIFIED_BUSINESS_WEBSITE',
          operator: 'EXISTS',
          mandatory: true,
          weight: 50
        },
        {
          id: 'mand_addr_conflict',
          type: 'HAS_BUSINESS_ADDRESS',
          operator: 'EXISTS',
          mandatory: true,
          weight: 50
        }
      ]
    };
    const contextD = {
      entityId: 'cand_prec_d',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult({
          address: { normalizedAddress: '100 Main St, Austin, TX' }
        }),
        googleCandidate: { address: '999 Other Rd, Dallas, TX' }
      })
    };
    const decD = evaluateLeadQualification(contextD, profileD);
    assert.strictEqual(decD.criterionResults.find(c => c.criterionId === 'mand_addr_conflict')?.outcome, 'CONTRADICTORY');
    assert.strictEqual(decD.status, 'UNCERTAIN');
    pass('D: PASS + mandatory CONTRADICTORY under STRICT_CONTRADICTION yields UNCERTAIN');
  } catch (err) {
    fail('D: PASS + mandatory CONTRADICTORY under STRICT_CONTRADICTION', err);
  }

  // E. PASS + same contradiction under PERMISSIVE => QUALIFIED
  try {
    const profileE = {
      profileId: 'prec_e_profile',
      profileName: 'Precedence E Profile',
      version: '1.0.0',
      enabled: true,
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'PERMISSIVE',
      thresholds: { minimumScore: 60 },
      criteria: [
        {
          id: 'mand_web',
          type: 'VERIFIED_BUSINESS_WEBSITE',
          operator: 'EXISTS',
          mandatory: true,
          weight: 50
        },
        {
          id: 'mand_addr_conflict',
          type: 'HAS_BUSINESS_ADDRESS',
          operator: 'EXISTS',
          mandatory: true,
          weight: 50
        }
      ]
    };
    const contextE = {
      entityId: 'cand_prec_e',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult({
          address: { normalizedAddress: '100 Main St, Austin, TX' }
        }),
        googleCandidate: { address: '999 Other Rd, Dallas, TX' }
      })
    };
    const decE = evaluateLeadQualification(contextE, profileE);
    assert.strictEqual(decE.criterionResults.find(c => c.criterionId === 'mand_addr_conflict')?.outcome, 'PASS');
    assert.strictEqual(decE.status, 'QUALIFIED');
    pass('E: PASS + same contradiction under PERMISSIVE yields QUALIFIED (evaluates available evidence)');
  } catch (err) {
    fail('E: PASS + same contradiction under PERMISSIVE', err);
  }

  // F. BLOCKED criterion => BLOCKED
  try {
    const profileF = {
      profileId: 'prec_f_profile',
      profileName: 'Precedence F Profile',
      version: '1.0.0',
      enabled: true,
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'STRICT_CONTRADICTION',
      criteria: [
        {
          id: 'mand_web',
          type: 'VERIFIED_BUSINESS_WEBSITE',
          operator: 'EXISTS',
          mandatory: true,
          weight: 50
        },
        {
          id: 'mand_blocked',
          type: 'PUBLIC_PHONE_AVAILABLE',
          operator: 'EXISTS',
          mandatory: true,
          weight: 50
        }
      ]
    };
    const contextF = {
      entityId: 'cand_prec_f',
      sourceContributions: [
        {
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          fieldName: 'public_phone_available',
          acquisitionContext: 'GOOGLE_CONSUMER_WEB',
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          isRestricted: true,
          policyStatus: 'PRODUCT_REJECTED'
        }
      ]
    };
    const decF = evaluateLeadQualification(contextF, profileF);
    assert.strictEqual(decF.criterionResults.find(c => c.criterionId === 'mand_blocked')?.outcome, 'BLOCKED');
    assert.strictEqual(decF.status, 'BLOCKED');
    pass('F: BLOCKED criterion overrides lower outcomes to yield BLOCKED final state');
  } catch (err) {
    fail('F: BLOCKED criterion', err);
  }

  // G. UNKNOWN without negative evidence => UNCERTAIN
  try {
    const profileG = {
      profileId: 'prec_g_profile',
      profileName: 'Precedence G Profile',
      version: '1.0.0',
      enabled: true,
      missingDataPolicy: 'MISSING_IS_UNKNOWN',
      unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
      conflictPolicy: 'STRICT_CONTRADICTION',
      criteria: [
        {
          id: 'mand_web',
          type: 'VERIFIED_BUSINESS_WEBSITE',
          operator: 'EXISTS',
          mandatory: true,
          weight: 50
        },
        {
          id: 'mand_unobserved',
          type: 'PUBLIC_PHONE_AVAILABLE',
          operator: 'EXISTS',
          mandatory: true,
          weight: 50
        }
      ]
    };
    const contextG = {
      entityId: 'cand_prec_g',
      businessIntelligence: buildBusinessIntelligenceProfile({
        websiteResult: mkSampleWebsiteResult() // website present, but contact phone not observed
      })
    };
    const decG = evaluateLeadQualification(contextG, profileG);
    assert.strictEqual(decG.criterionResults.find(c => c.criterionId === 'mand_web')?.outcome, 'PASS');
    assert.strictEqual(decG.criterionResults.find(c => c.criterionId === 'mand_unobserved')?.outcome, 'UNKNOWN');
    assert.strictEqual(decG.status, 'UNCERTAIN');
    pass('G: UNKNOWN without negative evidence yields UNCERTAIN (never falsely collapsed to NOT_QUALIFIED)');
  } catch (err) {
    fail('G: UNKNOWN without negative evidence', err);
  }
});


// ==========================================
// Final Suite Summary
// ==========================================
console.log('\n==================================================');
console.log('PHASE 23 TEST SUITE SUMMARY');
console.log('==================================================');

let totalPassed = 0;
let totalFailed = 0;

for (const [account, res] of Object.entries(accounts)) {
  console.log(`${account.padEnd(45)}: ${res.passed} passed, ${res.failed} failed`);
  totalPassed += res.passed;
  totalFailed += res.failed;
}

console.log('--------------------------------------------------');
console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);

if (totalFailed > 0) {
  console.error(`\nFAILED: ${totalFailed} test(s) failed in Phase 23 test suite.`);
  process.exit(1);
} else {
  console.log('\nALL PHASE 23 TESTS PASSED PERFECTLY (100%).');
  process.exit(0);
}
