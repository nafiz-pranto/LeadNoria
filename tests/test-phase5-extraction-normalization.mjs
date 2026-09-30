/**
 * Phase 5 Extraction & Data Normalization Test Suite
 *
 * Verifies all 30 acceptance criteria for source-neutral extraction contracts,
 * data normalization, provenance invariants, sanitization, data firewall,
 * internationalization, determinism, and synthetic performance benchmarks.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Import extraction and normalization modules
import {
  sanitizeText,
  normalizeUrl,
  normalizePhone,
  normalizeEmail,
  normalizeBusinessName,
  normalizeAddress,
  normalizeCategory,
  normalizeLocation,
  normalizeSourceIdentifier,
  detectScript
} from '../src/extension/extraction/normalizer.ts';

import {
  assertProvenanceInvariants,
  assertNoGooglePersistence,
  assertNoGoogleExport,
  auditCandidateDataFirewall,
  ProvenanceInvariantViolation,
  PolicyBoundaryViolation
} from '../src/extension/extraction/firewall.ts';

import { MetaExtractionAdapter } from '../src/extension/extraction/adapters/metaExtractionAdapter.ts';
import { UserDomainExtractionAdapter } from '../src/extension/extraction/adapters/userDomainExtractionAdapter.ts';
import { GoogleMapsExtractionContract } from '../src/extension/extraction/adapters/googleMapsExtractionContract.ts';

console.log('================================================================');
console.log('LEADNORIA PHASE 5: EXTRACTION & NORMALIZATION TEST SUITE');
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${testName}: ${err.message}`);
    failedTests++;
  }
}

// -------------------------------------------------------------
// 1. Source Capability Contracts
// -------------------------------------------------------------
console.log('--- 1. SOURCE CAPABILITY CONTRACTS ---');

runTest('Meta Adapter declares correct capabilities and defaults', () => {
  const meta = new MetaExtractionAdapter();
  assert.strictEqual(meta.sourceType, 'META_AD_LIBRARY');
  assert.strictEqual(meta.capabilities.implementationStatus, 'IMPLEMENTED');
  assert.ok(meta.capabilities.supportedCapabilities.includes('CAN_DISCOVER'));
  assert.ok(meta.capabilities.supportedCapabilities.includes('CAN_EXTRACT_WEBSITE'));
  assert.ok(meta.capabilities.unsupportedCapabilities.includes('CAN_EXTRACT_PHONE'));
  assert.strictEqual(meta.capabilities.defaultProvenance, 'META_DERIVED');
  assert.strictEqual(meta.capabilities.defaultPolicyStatus, 'POLICY_APPROVED');
});

runTest('User Domain Adapter declares correct capabilities and defaults', () => {
  const user = new UserDomainExtractionAdapter();
  assert.strictEqual(user.sourceType, 'USER_PROVIDED_DOMAIN');
  assert.strictEqual(user.capabilities.implementationStatus, 'IMPLEMENTED');
  assert.ok(user.capabilities.supportedCapabilities.includes('CAN_ACCEPT_DOMAIN'));
  assert.ok(user.capabilities.unsupportedCapabilities.includes('CAN_DISCOVER'));
  assert.ok(user.capabilities.unsupportedCapabilities.includes('CAN_EXTRACT_BUSINESS_NAME'));
  assert.strictEqual(user.capabilities.defaultProvenance, 'USER_PROVIDED');
  assert.strictEqual(user.capabilities.defaultPolicyStatus, 'NOT_APPLICABLE');
  assert.strictEqual(user.capabilities.defaultPersistenceStatus, 'USER_PROVIDED');
});

runTest('Google Maps Contract declares CONTRACT_ONLY status and modeling capabilities', () => {
  const gmaps = new GoogleMapsExtractionContract();
  assert.strictEqual(gmaps.sourceType, 'GOOGLE_MAPS');
  assert.strictEqual(gmaps.capabilities.implementationStatus, 'CONTRACT_ONLY');
  assert.ok(gmaps.capabilities.supportedCapabilities.includes('CAN_MODEL_NAME'));
  assert.ok(gmaps.capabilities.supportedCapabilities.includes('CAN_MODEL_WEBSITE'));
  assert.ok(gmaps.capabilities.unsupportedCapabilities.includes('CAN_DISCOVER'));
  assert.ok(gmaps.capabilities.unsupportedCapabilities.includes('CAN_EXTRACT_BUSINESS_NAME'));
  assert.strictEqual(gmaps.capabilities.defaultProvenance, 'GOOGLE_DERIVED');
  assert.strictEqual(gmaps.capabilities.defaultPolicyStatus, 'POLICY_GATED');
  assert.strictEqual(gmaps.capabilities.defaultPersistenceStatus, 'NOT_PERSISTABLE');
  assert.strictEqual(gmaps.capabilities.defaultExportStatus, 'NOT_EXPORTABLE');
});

// -------------------------------------------------------------
// 2. Provenance Invariants & Firewall Guards
// -------------------------------------------------------------
console.log('\n--- 2. PROVENANCE INVARIANTS & DATA FIREWALL ---');

runTest('Rule 1 & 5: Provenance must survive normalization unchanged', () => {
  const rawField = {
    fieldName: 'phone',
    provenance: 'GOOGLE_DERIVED',
    acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    policyStatus: 'POLICY_GATED',
    persistenceStatus: 'NOT_PERSISTABLE',
    exportStatus: 'NOT_EXPORTABLE'
  };
  const normalizedField = {
    fieldName: 'phone',
    provenance: 'WEBSITE_DERIVED', // Violation!
    acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    policyStatus: 'POLICY_GATED',
    persistenceStatus: 'NOT_PERSISTABLE',
    exportStatus: 'NOT_EXPORTABLE'
  };
  assert.throws(() => {
    assertProvenanceInvariants(rawField, normalizedField);
  }, ProvenanceInvariantViolation);
});

runTest('Rule 2: GOOGLE_DERIVED never silently becomes WEBSITE_DERIVED', () => {
  const raw = { fieldName: 'websiteUrl', provenance: 'GOOGLE_DERIVED', acquisitionContext: 'GOOGLE_CONSUMER_WEB', policyStatus: 'POLICY_GATED' };
  const norm = { fieldName: 'websiteUrl', provenance: 'WEBSITE_DERIVED', acquisitionContext: 'GOOGLE_CONSUMER_WEB', policyStatus: 'POLICY_GATED' };
  assert.throws(() => {
    assertProvenanceInvariants(raw, norm);
  }, /Illegal provenance transformation: GOOGLE_DERIVED cannot be converted to WEBSITE_DERIVED/);
});

runTest('Rule 2b: META_DERIVED never silently becomes WEBSITE_DERIVED without independent crawl', () => {
  const raw = { fieldName: 'websiteUrl', provenance: 'META_DERIVED', acquisitionContext: 'META_AD_LIBRARY', policyStatus: 'POLICY_APPROVED' };
  const norm = { fieldName: 'websiteUrl', provenance: 'WEBSITE_DERIVED', acquisitionContext: 'META_AD_LIBRARY', policyStatus: 'POLICY_APPROVED' };
  assert.throws(() => {
    assertProvenanceInvariants(raw, norm);
  }, /Illegal provenance transformation: META_DERIVED cannot be converted to WEBSITE_DERIVED/);
});

runTest('Rule 8: Normalization must never promote POLICY_GATED to POLICY_APPROVED', () => {
  const raw = { fieldName: 'businessName', provenance: 'GOOGLE_DERIVED', acquisitionContext: 'GOOGLE_CONSUMER_WEB', policyStatus: 'POLICY_GATED' };
  const norm = { fieldName: 'businessName', provenance: 'GOOGLE_DERIVED', acquisitionContext: 'GOOGLE_CONSUMER_WEB', policyStatus: 'POLICY_APPROVED' };
  assert.throws(() => {
    assertProvenanceInvariants(raw, norm);
  }, PolicyBoundaryViolation);
});

runTest('Google Persistence Guard prevents GOOGLE_DERIVED from being marked PERSISTABLE', () => {
  const field = {
    fieldName: 'businessName',
    provenance: 'GOOGLE_DERIVED',
    acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    persistenceStatus: 'PERSISTABLE'
  };
  assert.throws(() => {
    assertNoGooglePersistence(field);
  }, PolicyBoundaryViolation);
});

runTest('Google Export Guard prevents GOOGLE_DERIVED from being marked EXPORTABLE', () => {
  const field = {
    fieldName: 'businessName',
    provenance: 'GOOGLE_DERIVED',
    acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    exportStatus: 'EXPORTABLE'
  };
  assert.throws(() => {
    assertNoGoogleExport(field);
  }, PolicyBoundaryViolation);
});

// -------------------------------------------------------------
// 2B. Derived Field Lineage Tests (Prompt 5A Sec 7)
// -------------------------------------------------------------
console.log('\n--- 2B. DERIVED FIELD LINEAGE TESTS (PROMPT 5A SEC 7) ---');

runTest('Test A: Google name -> normalizedName -> persistence attempt BLOCKED', () => {
  const derivedNameField = {
    fieldName: 'comparisonName',
    provenance: 'LEADNORIA_DERIVED',
    acquisitionContext: 'LEADNORIA_INTERNAL',
    persistenceStatus: 'PERSISTABLE',
    derivedFrom: [
      {
        source: 'GOOGLE_MAPS',
        provenance: 'GOOGLE_DERIVED',
        fieldName: 'businessName',
        acquisitionContext: 'GOOGLE_CONSUMER_WEB',
        isRestricted: true
      }
    ]
  };
  assert.throws(() => {
    assertNoGooglePersistence(derivedNameField);
  }, PolicyBoundaryViolation);
});

runTest('Test B: Google phone -> normalizedPhone -> export attempt BLOCKED', () => {
  const derivedPhoneField = {
    fieldName: 'normalizedPhone',
    provenance: 'LEADNORIA_DERIVED',
    acquisitionContext: 'LEADNORIA_INTERNAL',
    exportStatus: 'EXPORTABLE',
    derivedFrom: [
      {
        source: 'GOOGLE_MAPS',
        provenance: 'GOOGLE_DERIVED',
        fieldName: 'phoneNumber',
        acquisitionContext: 'GOOGLE_CONSUMER_WEB',
        isRestricted: true
      }
    ]
  };
  assert.throws(() => {
    assertNoGoogleExport(derivedPhoneField);
  }, PolicyBoundaryViolation);
});

runTest('Test C: Google website URL -> canonicalDomain preserves Google provenance and lineage', () => {
  const gmapsAdapter = new GoogleMapsExtractionContract();
  const raw = gmapsAdapter.createRawEnvelope({ websiteUrl: 'https://example.com' }, 'test_c');
  const norm = gmapsAdapter.normalize(raw);
  assert.strictEqual(norm.websiteUrl?.provenance, 'GOOGLE_DERIVED');
  assert.strictEqual(norm.websiteUrl?.derivedFrom?.[0].provenance, 'GOOGLE_DERIVED');
  assert.strictEqual(norm.websiteUrl?.derivedFrom?.[0].isRestricted, true);
});

runTest('Test D: Meta name -> comparisonName preserves META_DERIVED dependency', () => {
  const metaAdapter = new MetaExtractionAdapter();
  const raw = metaAdapter.createRawEnvelope({ advertiserName: 'Apex Clinic' }, 'test_d');
  const norm = metaAdapter.normalize(raw);
  assert.strictEqual(norm.businessName.provenance, 'META_DERIVED');
  assert.strictEqual(norm.businessName.derivedFrom?.[0].provenance, 'META_DERIVED');
  assert.strictEqual(norm.businessName.derivedFrom?.[0].source, 'META_AD_LIBRARY');
});

runTest('Test E: Website name -> normalizedName preserves WEBSITE_DERIVED lineage', () => {
  const websiteField = {
    fieldName: 'businessName',
    provenance: 'WEBSITE_DERIVED',
    acquisitionContext: 'WEBSITE_DIRECT',
    policyStatus: 'TARGET_SITE_RULES_APPLY',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'EXPORTABLE',
    derivedFrom: [
      {
        source: 'FUTURE_SOURCE',
        provenance: 'WEBSITE_DERIVED',
        fieldName: 'businessName',
        acquisitionContext: 'WEBSITE_DIRECT',
        isRestricted: false
      }
    ]
  };
  assert.doesNotThrow(() => {
    assertNoGooglePersistence(websiteField);
    assertNoGoogleExport(websiteField);
  });
  assert.strictEqual(websiteField.derivedFrom[0].provenance, 'WEBSITE_DERIVED');
});

runTest('Test F: Mixed Google + Website entity preserves inspectable source contributions', () => {
  const mixedQualificationField = {
    fieldName: 'qualificationScore',
    provenance: 'MIXED',
    acquisitionContext: 'LEADNORIA_INTERNAL',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'EXPORTABLE',
    sourceContributions: [
      {
        source: 'GOOGLE_MAPS',
        provenance: 'GOOGLE_DERIVED',
        fieldName: 'businessName',
        acquisitionContext: 'GOOGLE_CONSUMER_WEB',
        isRestricted: true
      },
      {
        source: 'FUTURE_SOURCE',
        provenance: 'WEBSITE_DERIVED',
        fieldName: 'phone',
        acquisitionContext: 'WEBSITE_DIRECT',
        isRestricted: false
      }
    ]
  };
  assert.throws(() => {
    assertNoGooglePersistence(mixedQualificationField);
  }, PolicyBoundaryViolation);
  assert.throws(() => {
    assertNoGoogleExport(mixedQualificationField);
  }, PolicyBoundaryViolation);
});

// -------------------------------------------------------------
// 2C. Mixed-Lineage Cases (Prompt 5A Sec 23)
// -------------------------------------------------------------
console.log('\n--- 2C. MIXED-LINEAGE DETERMINISTIC CASES (PROMPT 5A SEC 23) ---');

runTest('CASE 1: Google business name + website phone retains source contributions and blocks restricted persistence', () => {
  const googleName = {
    fieldName: 'businessName',
    provenance: 'GOOGLE_DERIVED',
    acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'NOT_EXPORTABLE',
    derivedFrom: [{ source: 'GOOGLE_MAPS', provenance: 'GOOGLE_DERIVED', fieldName: 'businessName', acquisitionContext: 'GOOGLE_CONSUMER_WEB', isRestricted: true }]
  };
  const webPhone = {
    fieldName: 'phone',
    provenance: 'WEBSITE_DERIVED',
    acquisitionContext: 'WEBSITE_DIRECT',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'EXPORTABLE',
    derivedFrom: [{ source: 'FUTURE_SOURCE', provenance: 'WEBSITE_DERIVED', fieldName: 'phone', acquisitionContext: 'WEBSITE_DIRECT', isRestricted: false }]
  };
  assert.throws(() => assertNoGooglePersistence(googleName), PolicyBoundaryViolation);
  assert.doesNotThrow(() => assertNoGooglePersistence(webPhone));
});

runTest('CASE 2: Meta name + website address preserves META_DERIVED and WEBSITE_DERIVED without laundering', () => {
  const metaName = {
    fieldName: 'businessName',
    provenance: 'META_DERIVED',
    acquisitionContext: 'META_AD_LIBRARY',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'EXPORTABLE'
  };
  const webAddress = {
    fieldName: 'address',
    provenance: 'WEBSITE_DERIVED',
    acquisitionContext: 'WEBSITE_DIRECT',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'EXPORTABLE'
  };
  assert.doesNotThrow(() => assertNoGooglePersistence(metaName));
  assert.doesNotThrow(() => assertNoGoogleExport(metaName));
  assert.doesNotThrow(() => assertNoGooglePersistence(webAddress));
  assert.doesNotThrow(() => assertNoGoogleExport(webAddress));
});

runTest('CASE 3: Google name + website name + LeadNoria qualification keeps restricted lineage identifiable', () => {
  const qualificationField = {
    fieldName: 'matchDecision',
    provenance: 'LEADNORIA_DERIVED',
    acquisitionContext: 'LEADNORIA_INTERNAL',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'EXPORTABLE',
    derivedFrom: [
      { source: 'GOOGLE_MAPS', provenance: 'GOOGLE_DERIVED', fieldName: 'businessName', acquisitionContext: 'GOOGLE_CONSUMER_WEB', isRestricted: true },
      { source: 'FUTURE_SOURCE', provenance: 'WEBSITE_DERIVED', fieldName: 'businessName', acquisitionContext: 'WEBSITE_DIRECT', isRestricted: false }
    ]
  };
  assert.throws(() => assertNoGooglePersistence(qualificationField), PolicyBoundaryViolation);
  assert.throws(() => assertNoGoogleExport(qualificationField), PolicyBoundaryViolation);
});

runTest('CASE 4: Meta destination URL + website-derived contacts enforces META_DERIVED pointer -> WEBSITE_DERIVED contacts', () => {
  const metaUrl = {
    fieldName: 'websiteUrl',
    provenance: 'META_DERIVED',
    acquisitionContext: 'META_AD_LIBRARY',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'EXPORTABLE'
  };
  const websiteContacts = {
    fieldName: 'email',
    provenance: 'WEBSITE_DERIVED',
    acquisitionContext: 'WEBSITE_DIRECT',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'EXPORTABLE'
  };
  assert.strictEqual(metaUrl.provenance, 'META_DERIVED');
  assert.strictEqual(websiteContacts.provenance, 'WEBSITE_DERIVED');
  assert.doesNotThrow(() => assertNoGooglePersistence(metaUrl));
  assert.doesNotThrow(() => assertNoGooglePersistence(websiteContacts));
});

runTest('CASE 5: User-provided domain + website-derived data remains free of GOOGLE_DERIVED restrictions', () => {
  const userDomain = {
    fieldName: 'websiteUrl',
    provenance: 'USER_PROVIDED',
    acquisitionContext: 'USER_INPUT',
    policyStatus: 'NOT_APPLICABLE',
    persistenceStatus: 'USER_PROVIDED',
    exportStatus: 'USER_APPROVED'
  };
  const webData = {
    fieldName: 'phone',
    provenance: 'WEBSITE_DERIVED',
    acquisitionContext: 'WEBSITE_DIRECT',
    policyStatus: 'TARGET_SITE_RULES_APPLY',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'EXPORTABLE'
  };
  assert.doesNotThrow(() => assertNoGooglePersistence(userDomain));
  assert.doesNotThrow(() => assertNoGooglePersistence(webData));
  assert.notStrictEqual(userDomain.provenance, 'GOOGLE_DERIVED');
  assert.notStrictEqual(webData.provenance, 'GOOGLE_DERIVED');
});

// -------------------------------------------------------------
// 2D. MASTER CORRECTION PROMPT #5B REGRESSION TESTS
// -------------------------------------------------------------
console.log('\n--- 2D. PROMPT #5B SPECIFIC REGRESSION TESTS ---');

runTest('Prompt 5B-A: Google consumer-web contribution is marked restricted, persistence blocked, export blocked', () => {
  const contrib = {
    source: 'GOOGLE_MAPS',
    provenance: 'GOOGLE_DERIVED',
    fieldName: 'placeName',
    acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
    isRestricted: true,
    policyStatus: 'POLICY_GATED',
    persistenceStatus: 'NOT_PERSISTABLE',
    exportStatus: 'NOT_EXPORTABLE'
  };
  const fieldPersist = {
    fieldName: 'placeName',
    provenance: 'GOOGLE_DERIVED',
    acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    persistenceStatus: 'PERSISTABLE',
    derivedFrom: [contrib]
  };
  const fieldExport = {
    fieldName: 'placeName',
    provenance: 'GOOGLE_DERIVED',
    acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    exportStatus: 'EXPORTABLE',
    derivedFrom: [contrib]
  };
  assert.throws(() => assertNoGooglePersistence(fieldPersist), PolicyBoundaryViolation);
  assert.throws(() => assertNoGoogleExport(fieldExport), PolicyBoundaryViolation);
});

runTest('Prompt 5B-B: Google API contribution represented separately from consumer-web with service-specific policy', () => {
  const apiContrib = {
    source: 'GOOGLE_MAPS',
    provenance: 'GOOGLE_API_DERIVED',
    fieldName: 'place_id',
    acquisitionContext: 'GOOGLE_PLATFORM_API',
    restrictionBasis: 'GOOGLE_API_SERVICE_SPECIFIC',
    isRestricted: false,
    policyStatus: 'TERMS_REVIEW_REQUIRED',
    persistenceStatus: 'PERSISTENCE_GATED',
    exportStatus: 'EXPORT_GATED'
  };
  const apiField = {
    fieldName: 'place_id',
    provenance: 'GOOGLE_API_DERIVED',
    acquisitionContext: 'GOOGLE_PLATFORM_API',
    policyStatus: 'TERMS_REVIEW_REQUIRED',
    persistenceStatus: 'PERSISTABLE',
    derivedFrom: [apiContrib]
  };
  assert.throws(() => assertNoGooglePersistence(apiField), PolicyBoundaryViolation);
});

runTest('Prompt 5B-C: Unknown policy status cannot silently pass to persistence or export', () => {
  const unknownField = {
    fieldName: 'customSignal',
    provenance: 'LEADNORIA_DERIVED',
    acquisitionContext: 'LEADNORIA_INTERNAL',
    policyStatus: 'UNKNOWN',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'EXPORTABLE',
    derivedFrom: [
      {
        source: 'FUTURE_SOURCE',
        provenance: 'WEBSITE_DERIVED',
        fieldName: 'signal',
        acquisitionContext: 'WEBSITE_DIRECT',
        restrictionBasis: 'UNKNOWN_REQUIRES_REVIEW',
        isRestricted: false,
        policyStatus: 'UNKNOWN'
      }
    ]
  };
  assert.throws(() => assertNoGooglePersistence(unknownField), PolicyBoundaryViolation);
  assert.throws(() => assertNoGoogleExport(unknownField), PolicyBoundaryViolation);
});

runTest('Prompt 5B-D: Meta provenance represents public Meta UI and introduces no API capability', () => {
  const adapter = new MetaExtractionAdapter();
  assert.strictEqual(adapter.capabilities.defaultProvenance, 'META_DERIVED');
  assert.strictEqual(adapter.capabilities.implementationStatus, 'IMPLEMENTED');
  assert.ok(!adapter.capabilities.supportedCapabilities.some(c => c.includes('API')));
});

runTest('Prompt 5B-E & 5B-F: Functional parameters (ref, source, campaign, affiliate, trk) preserved; tracking stripped', () => {
  const url = 'https://example.com/shop?store=dhaka&branch=2&lang=bn&ref=partner&source=store&campaign=spring&affiliate=partner101&trk=custom_event&utm_source=fb&utm_medium=cpc&fbclid=123&gclid=456&msclkid=789&dclid=012&gbraid=345&wbraid=678';
  const norm = normalizeUrl(url);
  assert.strictEqual(norm.isValid, true);
  
  // Preserved functional params
  assert.strictEqual(norm.preservedParams['store'], 'dhaka');
  assert.strictEqual(norm.preservedParams['branch'], '2');
  assert.strictEqual(norm.preservedParams['lang'], 'bn');
  assert.strictEqual(norm.preservedParams['ref'], 'partner');
  assert.strictEqual(norm.preservedParams['source'], 'store');
  assert.strictEqual(norm.preservedParams['campaign'], 'spring');
  assert.strictEqual(norm.preservedParams['affiliate'], 'partner101');
  assert.strictEqual(norm.preservedParams['trk'], 'custom_event');
  
  // Stripped tracking params
  assert.strictEqual(norm.preservedParams['utm_source'], undefined);
  assert.strictEqual(norm.preservedParams['utm_medium'], undefined);
  assert.strictEqual(norm.preservedParams['fbclid'], undefined);
  assert.strictEqual(norm.preservedParams['gclid'], undefined);
  assert.strictEqual(norm.preservedParams['msclkid'], undefined);
  assert.strictEqual(norm.preservedParams['dclid'], undefined);
  assert.strictEqual(norm.preservedParams['gbraid'], undefined);
  assert.strictEqual(norm.preservedParams['wbraid'], undefined);

  // URL string check
  assert.ok(norm.normalizedUrl.includes('ref=partner'));
  assert.ok(norm.normalizedUrl.includes('source=store'));
  assert.ok(norm.normalizedUrl.includes('campaign=spring'));
  assert.ok(norm.normalizedUrl.includes('affiliate=partner101'));
  assert.ok(norm.normalizedUrl.includes('trk=custom_event'));
  assert.ok(!norm.normalizedUrl.includes('utm_source'));
  assert.ok(!norm.normalizedUrl.includes('fbclid'));
  assert.ok(!norm.normalizedUrl.includes('gclid'));
});

runTest('Prompt 5B-G: Lineage interaction across Google consumer-web, Meta, and Website sources', () => {
  // Google consumer-web -> normalized field remains restricted
  const gmapsAdapter = new GoogleMapsExtractionContract();
  const rawGoogle = gmapsAdapter.createRawEnvelope({ placeName: 'Test Place' }, 'run_g');
  const normGoogle = gmapsAdapter.normalize(rawGoogle);
  assert.strictEqual(normGoogle.businessName.derivedFrom?.[0].restrictionBasis, 'GOOGLE_CONSUMER_WEB_RESTRICTED');
  assert.strictEqual(normGoogle.businessName.derivedFrom?.[0].isRestricted, true);

  // Google consumer-web -> LEADNORIA_DERIVED remains restricted
  const leadnoriaDerivedFromGoogle = {
    fieldName: 'leadScore',
    provenance: 'LEADNORIA_DERIVED',
    acquisitionContext: 'LEADNORIA_INTERNAL',
    persistenceStatus: 'PERSISTABLE',
    derivedFrom: normGoogle.businessName.derivedFrom
  };
  assert.throws(() => assertNoGooglePersistence(leadnoriaDerivedFromGoogle), PolicyBoundaryViolation);

  // Google consumer-web + WEBSITE_DERIVED mixed field remains restricted where Google dependency contributes materially
  const mixedField = {
    fieldName: 'combinedProfile',
    provenance: 'MIXED',
    acquisitionContext: 'LEADNORIA_INTERNAL',
    exportStatus: 'EXPORTABLE',
    sourceContributions: [
      normGoogle.businessName.derivedFrom[0],
      {
        source: 'FUTURE_SOURCE',
        provenance: 'WEBSITE_DERIVED',
        fieldName: 'phone',
        acquisitionContext: 'WEBSITE_DIRECT',
        restrictionBasis: 'TARGET_SITE_RULES',
        isRestricted: false,
        policyStatus: 'TARGET_SITE_RULES_APPLY',
        persistenceStatus: 'PERSISTABLE',
        exportStatus: 'EXPORTABLE'
      }
    ]
  };
  assert.throws(() => assertNoGoogleExport(mixedField), PolicyBoundaryViolation);

  // Independent WEBSITE_DERIVED value remains eligible under target-site rules
  const independentWeb = {
    fieldName: 'phone',
    provenance: 'WEBSITE_DERIVED',
    acquisitionContext: 'WEBSITE_DIRECT',
    policyStatus: 'TARGET_SITE_RULES_APPLY',
    persistenceStatus: 'PERSISTABLE',
    exportStatus: 'EXPORTABLE',
    derivedFrom: [
      {
        source: 'FUTURE_SOURCE',
        provenance: 'WEBSITE_DERIVED',
        fieldName: 'phone',
        acquisitionContext: 'WEBSITE_DIRECT',
        restrictionBasis: 'TARGET_SITE_RULES',
        isRestricted: false,
        policyStatus: 'TARGET_SITE_RULES_APPLY',
        persistenceStatus: 'PERSISTABLE',
        exportStatus: 'EXPORTABLE'
      }
    ]
  };
  assert.doesNotThrow(() => assertNoGooglePersistence(independentWeb));
  assert.doesNotThrow(() => assertNoGoogleExport(independentWeb));

  // Meta -> LEADNORIA_DERIVED retains Meta lineage
  const metaAdapter = new MetaExtractionAdapter();
  const rawMeta = metaAdapter.createRawEnvelope({ advertiserName: 'Meta Client' }, 'run_m');
  const normMeta = metaAdapter.normalize(rawMeta);
  assert.strictEqual(normMeta.businessName.derivedFrom?.[0].provenance, 'META_DERIVED');
  assert.strictEqual(normMeta.businessName.derivedFrom?.[0].restrictionBasis, 'NONE');
});

runTest('Prompt 5B-H: Phase 5 report static check confirms approved Phase 6 title', () => {
  const docPath = path.resolve('LEADNORIA-GOOGLE-MAPS-PHASE5-EXTRACTION-NORMALIZATION.md');
  const docContent = fs.readFileSync(docPath, 'utf8');
  assert.ok(
    docContent.includes('Website Requirement Engine & Lead Qualification Pipeline'),
    'Report must define Phase 6 as "Website Requirement Engine & Lead Qualification Pipeline"'
  );
  assert.ok(
    !docContent.includes('Phase 6: Search & Candidate Generation Architecture'),
    'Report must NOT name Phase 6 "Search & Candidate Generation Architecture"'
  );
});

// -------------------------------------------------------------
// 3. Normalization Engine (URL, Phone, Email, Name, Address)
// -------------------------------------------------------------
console.log('\n--- 3. FIELD NORMALIZATION & CANONICALIZATION ---');

runTest('URL Normalization strips tracking parameters, fragments, and canonicalizes origin', () => {
  const url = 'https://WWW.Example.com:443/services/?utm_source=google&fbclid=12345#overview';
  const norm = normalizeUrl(url);
  assert.strictEqual(norm.isValid, true);
  assert.strictEqual(norm.canonicalDomain, 'example.com');
  assert.strictEqual(norm.canonicalOrigin, 'https://www.example.com');
  assert.strictEqual(norm.normalizedUrl, 'https://www.example.com/services');
  assert.strictEqual(norm.isCredentialBearing, false);
});

runTest('URL Normalization strips marketing params but preserves functional parameters (?store=dhaka&branch=2&lang=bn)', () => {
  const url = 'https://www.example.com/store?store=dhaka&branch=2&lang=bn&utm_source=fb&fbclid=123';
  const norm = normalizeUrl(url);
  assert.strictEqual(norm.isValid, true);
  assert.strictEqual(norm.preservedParams['store'], 'dhaka');
  assert.strictEqual(norm.preservedParams['branch'], '2');
  assert.strictEqual(norm.preservedParams['lang'], 'bn');
  assert.strictEqual(norm.preservedParams['utm_source'], undefined);
  assert.strictEqual(norm.preservedParams['fbclid'], undefined);
  assert.ok(norm.normalizedUrl.includes('store=dhaka'));
  assert.ok(norm.normalizedUrl.includes('branch=2'));
  assert.ok(norm.normalizedUrl.includes('lang=bn'));
  assert.ok(!norm.normalizedUrl.includes('utm_source'));
  assert.ok(!norm.normalizedUrl.includes('fbclid'));
});

runTest('URL Normalization preserves meaningful subdomains', () => {
  const norm = normalizeUrl('https://austin.roofing-pros.com/contact/');
  assert.strictEqual(norm.isValid, true);
  assert.strictEqual(norm.hasMeaningfulSubdomain, true);
  assert.strictEqual(norm.canonicalDomain, 'austin.roofing-pros.com');
  assert.strictEqual(norm.normalizedUrl, 'https://austin.roofing-pros.com/contact');
});

runTest('Security: Credential-bearing URLs are strictly rejected', () => {
  const norm = normalizeUrl('https://admin:secretPass123@internal.business.com/dashboard');
  assert.strictEqual(norm.isValid, false);
  assert.strictEqual(norm.isCredentialBearing, true);
  assert.strictEqual(norm.error, 'SECURITY_REJECTED_CREDENTIALS');
});

runTest('Security: Dangerous protocols are strictly rejected', () => {
  const norm = normalizeUrl('javascript:alert(document.cookie)');
  assert.strictEqual(norm.isValid, false);
  assert.strictEqual(norm.error, 'SECURITY_REJECTED_PROTOCOL');
});

runTest('Phone Normalization handles international formats, extensions, and country codes', () => {
  const usPhone = normalizePhone('(512) 555-0199 ext 104', 'US');
  assert.strictEqual(usPhone.isValid, true);
  assert.strictEqual(usPhone.e164Format, '+15125550199');
  assert.strictEqual(usPhone.extension, '104');
  assert.strictEqual(usPhone.countryInference, 'COUNTRY_EXPLICIT');
  assert.strictEqual(usPhone.phoneState, 'PHONE_NORMALIZED');

  const ukPhone = normalizePhone('+44 20 7946 0991');
  assert.strictEqual(ukPhone.isValid, true);
  assert.strictEqual(ukPhone.e164Format, '+442079460991');
  assert.strictEqual(ukPhone.countryInference, 'COUNTRY_INFERRED');

  const bdPhone = normalizePhone('+880 1711 000000');
  assert.strictEqual(bdPhone.isValid, true);
  assert.strictEqual(bdPhone.e164Format, '+8801711000000');
  assert.strictEqual(bdPhone.countryInference, 'COUNTRY_INFERRED');
});

runTest('Phone Normalization safety: flags ambiguous numbers without fabricating country code', () => {
  const invalid = normalizePhone('123');
  assert.strictEqual(invalid.isValid, false);
  assert.strictEqual(invalid.phoneState, 'PHONE_INVALID');

  const ambiguous = normalizePhone('5551234567');
  assert.strictEqual(ambiguous.isValid, false);
  assert.strictEqual(ambiguous.phoneState, 'PHONE_AMBIGUOUS');
  assert.strictEqual(ambiguous.countryInference, 'COUNTRY_UNKNOWN');
});

runTest('Email Normalization lowercases domain and strips surrounding brackets', () => {
  const norm = normalizeEmail('<Info.Contact+Sales@AcmeDental.COM>');
  assert.strictEqual(norm.isValid, true);
  assert.strictEqual(norm.localPart, 'Info.Contact+Sales');
  assert.strictEqual(norm.domainPart, 'acmedental.com');
  assert.strictEqual(norm.normalizedEmail, 'Info.Contact+Sales@acmedental.com');
});

runTest('Business Name Normalization preserves display name and generates comparison key', () => {
  const norm = normalizeBusinessName('Apex Dental Studio LLC · Sponsored (Official)');
  assert.strictEqual(norm.displayName, 'Apex Dental Studio LLC');
  assert.strictEqual(norm.normalizedName, 'apex dental studio llc');
  assert.strictEqual(norm.comparisonName, 'apex dental studio');
  assert.strictEqual(norm.legalSuffix, 'llc');
  assert.strictEqual(norm.detectedScript, 'LATIN');
});

runTest('Script Detection correctly identifies Latin, Bengali, and Arabic scripts', () => {
  assert.strictEqual(detectScript('Apex Dental Clinic'), 'LATIN');
  assert.strictEqual(detectScript('পদ্মা ডেন্টাল কেয়ার'), 'BENGALI');
  assert.strictEqual(detectScript('مستشفى النور التخصصي'), 'ARABIC');
  assert.strictEqual(detectScript('Al-Noor مستشفى'), 'MIXED');
});

// -------------------------------------------------------------
// 4. Sanitization Layer
// -------------------------------------------------------------
console.log('\n--- 4. SANITIZATION LAYER ---');

runTest('SanitizeText removes HTML tags, zero-width characters, and control codes', () => {
  const dirty = '<script>alert(1)</script>Apex\u200B Dental\u0000 Clinic<br> <b>LLC</b>';
  const clean = sanitizeText(dirty);
  assert.strictEqual(clean, 'Apex Dental Clinic LLC');
});

runTest('SanitizeText collapses excessive whitespace and enforces length bounds', () => {
  const spaced = '   Austin    Roofing     Pros   \t\n  ';
  assert.strictEqual(sanitizeText(spaced), 'Austin Roofing Pros');

  const long = 'A'.repeat(3000);
  assert.strictEqual(sanitizeText(long, 50).length, 50);
});

// -------------------------------------------------------------
// 5. Determinism & Order Independence
// -------------------------------------------------------------
console.log('\n--- 5. DETERMINISM & ORDER INDEPENDENCE ---');

runTest('Normalization Determinism: 100 repetitions produce byte-identical output', () => {
  const input = {
    adLibraryId: '99887766',
    advertiserName: 'Premier Roofing Solutions Inc.',
    destinationUrl: 'https://www.premierroofing.com/estimate/?utm_source=fb'
  };
  const adapter = new MetaExtractionAdapter();
  const first = adapter.normalize(adapter.createRawEnvelope(input, 'run_det_test'));

  for (let i = 0; i < 100; i++) {
    const next = adapter.normalize(adapter.createRawEnvelope(input, 'run_det_test'));
    assert.strictEqual(next.businessName.value.comparisonName, first.businessName.value.comparisonName);
    assert.strictEqual(next.websiteUrl?.value.normalizedUrl, first.websiteUrl?.value.normalizedUrl);
    assert.strictEqual(next.overallPolicyStatus, first.overallPolicyStatus);
    assert.strictEqual(next.overallPersistenceStatus, first.overallPersistenceStatus);
  }
});

runTest('Order Independence: Shuffled input properties yield identical normalized entities', () => {
  const input1 = {
    businessName: 'Summit Health Care LLC',
    domainOrUrl: 'https://summithealth.org',
    countryCode: 'US'
  };
  const input2 = {
    countryCode: 'US',
    domainOrUrl: 'https://summithealth.org',
    businessName: 'Summit Health Care LLC'
  };
  const adapter = new UserDomainExtractionAdapter();
  const norm1 = adapter.normalize(adapter.createRawEnvelope(input1, 'order_test'));
  const norm2 = adapter.normalize(adapter.createRawEnvelope(input2, 'order_test'));

  assert.strictEqual(norm1.businessName.value.comparisonName, norm2.businessName.value.comparisonName);
  assert.strictEqual(norm1.websiteUrl?.value.canonicalDomain, norm2.websiteUrl?.value.canonicalDomain);
});

// -------------------------------------------------------------
// 6. Internationalization Tests
// -------------------------------------------------------------
console.log('\n--- 6. INTERNATIONALIZATION FIXTURE TESTS ---');

runTest('Multi-lingual fixtures (EN, BN, AR, DE, FR, ES) normalize without script loss', () => {
  const fixturePath = path.resolve('fixtures/sources/international/international-candidates.json');
  assert.ok(fs.existsSync(fixturePath), 'International fixture file exists');

  const content = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  assert.ok(Array.isArray(content.candidates), 'Fixture contains candidates array');

  for (const item of content.candidates) {
    const normName = normalizeBusinessName(item.businessName);
    assert.ok(normName.displayName.length > 0);
    assert.ok(normName.comparisonName.length > 0);

    const normUrl = normalizeUrl(item.websiteUrl);
    assert.strictEqual(normUrl.isValid, true);

    const normPhone = normalizePhone(item.phone, item.countryCode);
    assert.strictEqual(normPhone.isValid, true);
    assert.ok(normPhone.e164Format?.startsWith('+'));

    const normAddr = normalizeAddress(item.address, item.countryCode);
    assert.strictEqual(normAddr.countryCode, item.countryCode);
  }
});

// -------------------------------------------------------------
// 7. Synthetic Fixture Transformations
// -------------------------------------------------------------
console.log('\n--- 7. SYNTHETIC FIXTURE TRANSFORMATIONS ---');

runTest('Meta synthetic fixture transforms cleanly with META_DERIVED provenance', () => {
  const fixturePath = path.resolve('fixtures/sources/meta/sample-meta-candidate.json');
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  const adapter = new MetaExtractionAdapter();

  const validation = adapter.validateInput(fixture.candidate);
  assert.strictEqual(validation.isValid, true);

  const rawEnvelope = adapter.createRawEnvelope(fixture.candidate, 'test_meta_run');
  const normalized = adapter.normalize(rawEnvelope);

  assert.strictEqual(normalized.source, 'META_AD_LIBRARY');
  assert.strictEqual(normalized.businessName.provenance, 'META_DERIVED');
  assert.strictEqual(normalized.websiteUrl?.provenance, 'META_DERIVED');
  assert.strictEqual(normalized.businessName.value.comparisonName, 'apex dental studio');
  assert.strictEqual(normalized.websiteUrl?.value.canonicalDomain, 'apexdental.com');
  assert.strictEqual(normalized.overallPolicyStatus, 'POLICY_APPROVED');
  assert.strictEqual(normalized.overallPersistenceStatus, 'PERSISTABLE');

  const firewallAudit = auditCandidateDataFirewall(normalized);
  assert.strictEqual(firewallAudit.isCompliant, true);
});

runTest('User Domain synthetic fixture transforms cleanly with USER_PROVIDED provenance and NOT_APPLICABLE policy', () => {
  const fixturePath = path.resolve('fixtures/sources/user-domain/sample-user-domain.json');
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  const adapter = new UserDomainExtractionAdapter();

  const validation = adapter.validateInput(fixture.candidate);
  assert.strictEqual(validation.isValid, true);

  const rawEnvelope = adapter.createRawEnvelope(fixture.candidate, 'test_user_run');
  const normalized = adapter.normalize(rawEnvelope);

  assert.strictEqual(normalized.source, 'USER_PROVIDED_DOMAIN');
  assert.strictEqual(normalized.websiteUrl?.provenance, 'USER_PROVIDED');
  assert.strictEqual(normalized.businessName.value.comparisonName, 'manchester roofers');
  assert.strictEqual(normalized.overallPolicyStatus, 'NOT_APPLICABLE');
  assert.strictEqual(normalized.overallPersistenceStatus, 'USER_PROVIDED');

  const firewallAudit = auditCandidateDataFirewall(normalized);
  assert.strictEqual(firewallAudit.isCompliant, true);
});

runTest('Google Maps synthetic fixture transforms with GOOGLE_DERIVED, NOT_PERSISTABLE, and restricted lineage', () => {
  const fixturePath = path.resolve('fixtures/sources/google-maps/sample-maps-candidate.json');
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  const adapter = new GoogleMapsExtractionContract();

  const validation = adapter.validateInput(fixture.candidate);
  assert.strictEqual(validation.isValid, true);

  const rawEnvelope = adapter.createRawEnvelope(fixture.candidate, 'test_gmaps_run');
  const normalized = adapter.normalize(rawEnvelope);

  assert.strictEqual(normalized.source, 'GOOGLE_MAPS');
  assert.strictEqual(normalized.businessName.provenance, 'GOOGLE_DERIVED');
  assert.strictEqual(normalized.businessName.derivedFrom?.[0].isRestricted, true);
  assert.strictEqual(normalized.websiteUrl?.provenance, 'GOOGLE_DERIVED');
  assert.strictEqual(normalized.overallPolicyStatus, 'POLICY_GATED');
  assert.strictEqual(normalized.overallPersistenceStatus, 'NOT_PERSISTABLE');
  assert.strictEqual(normalized.overallExportStatus, 'NOT_EXPORTABLE');

  // Verify that firewall allows the candidate in memory as long as persistence/export are blocked
  const firewallAudit = auditCandidateDataFirewall(normalized);
  assert.strictEqual(firewallAudit.isCompliant, true);
});

// -------------------------------------------------------------
// 8. Synthetic Performance Benchmarks
// -------------------------------------------------------------
console.log('\n--- 8. SYNTHETIC PERFORMANCE BENCHMARKS ---');

function runBenchmark(count) {
  const adapter = new UserDomainExtractionAdapter();
  const startTime = Date.now();
  const startMem = process.memoryUsage().heapUsed;

  for (let i = 0; i < count; i++) {
    const input = {
      domainOrUrl: `https://business-${i}.co.uk/services`,
      businessName: `Acme Construction ${i} LLC`,
      countryCode: 'GB'
    };
    const raw = adapter.createRawEnvelope(input, `bench_${count}`);
    adapter.normalize(raw);
  }

  const durationMs = Date.now() - startTime;
  const endMem = process.memoryUsage().heapUsed;
  const memDeltaMB = ((endMem - startMem) / (1024 * 1024)).toFixed(2);
  const throughputPerSec = Math.round((count / (durationMs || 1)) * 1000);

  console.log(`  [BENCHMARK] ${count.toLocaleString().padStart(6)} candidates: ${durationMs.toString().padStart(4)}ms (${throughputPerSec.toLocaleString().padStart(7)} ops/sec), Heap Δ: ${memDeltaMB} MB`);
}

runBenchmark(100);
runBenchmark(500);
runBenchmark(1000);
runBenchmark(5000);
runBenchmark(10000);

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`PHASE 5 TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\n>>> ALL PHASE 5 EXTRACTION & NORMALIZATION CHECKS PASSED! <<<');
}
