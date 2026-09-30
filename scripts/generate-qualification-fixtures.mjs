/**
 * LeadNoria Phase 6 Qualification Test Fixtures Generator
 *
 * Generates the 24 deterministic test fixtures required by Master Prompt #6 Section 23.
 */

import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('fixtures/qualification');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Helper to build normalized field envelope
function makeEnvelope(val, fieldName, provenance, acq, source, policy = 'POLICY_APPROVED', persist = 'PERSISTABLE', exp = 'EXPORTABLE', derivedFrom = []) {
  return {
    value: val,
    fieldName,
    provenance,
    acquisitionContext: acq,
    source,
    capturedAt: '2026-09-29T12:00:00.000Z',
    confidence: 'STRONG',
    policyStatus: policy,
    persistenceStatus: persist,
    exportStatus: exp,
    derivedFrom: derivedFrom.length > 0 ? derivedFrom : undefined
  };
}

function makeCandidate(id, name, url, source, provenance, acq, opts = {}) {
  const sourceContrib = {
    source,
    provenance,
    fieldName: 'entity',
    acquisitionContext: acq,
    restrictionBasis: opts.restrictionBasis || 'NONE',
    isRestricted: Boolean(opts.isRestricted),
    policyStatus: opts.policyStatus || 'POLICY_APPROVED',
    persistenceStatus: opts.persistenceStatus || 'PERSISTABLE',
    exportStatus: opts.exportStatus || 'EXPORTABLE'
  };

  const nameVal = {
    displayName: name,
    normalizedName: name.toLowerCase(),
    comparisonName: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    legalSuffix: opts.legalSuffix,
    detectedScript: opts.script || 'LATIN'
  };

  let urlEnv = undefined;
  if (url) {
    urlEnv = makeEnvelope({
      originalUrl: url,
      normalizedUrl: url.split('?')[0],
      canonicalDomain: opts.domain || 'example.com',
      canonicalOrigin: opts.origin || 'https://example.com',
      protocol: 'https:',
      hostname: opts.hostname || 'example.com',
      pathname: '/',
      hasMeaningfulSubdomain: Boolean(opts.hasMeaningfulSubdomain),
      preservedParams: opts.preservedParams || {},
      isCredentialBearing: false,
      isValid: opts.isUrlValid !== false
    }, 'websiteUrl', provenance, acq, source, opts.policyStatus || 'POLICY_APPROVED', opts.persistenceStatus || 'PERSISTABLE', opts.exportStatus || 'EXPORTABLE');
  }

  return {
    candidateId: id,
    runId: 'run-p6-test',
    source,
    sourceIdentifier: {
      sourceType: source,
      sourceRecordId: id,
      sourceRecordType: 'GENERIC_SOURCE_ID',
      sourceContext: acq,
      originalValue: id,
      normalizedValue: id,
      provenance,
      policyStatus: opts.policyStatus || 'POLICY_APPROVED'
    },
    acquisitionContext: acq,
    overallPolicyStatus: opts.policyStatus || 'POLICY_APPROVED',
    overallPersistenceStatus: opts.persistenceStatus || 'PERSISTABLE',
    overallExportStatus: opts.exportStatus || 'EXPORTABLE',
    overallProvenance: provenance,
    sourceContributions: [sourceContrib, ...(opts.extraContributions || [])],
    businessName: makeEnvelope(nameVal, 'businessName', provenance, acq, source, opts.policyStatus || 'POLICY_APPROVED', opts.persistenceStatus || 'PERSISTABLE', opts.exportStatus || 'EXPORTABLE'),
    websiteUrl: urlEnv,
    phones: opts.phone ? [makeEnvelope({
      rawPhone: opts.phone,
      e164Format: opts.phone,
      countryCode: opts.countryCode || 'US',
      countryInference: 'COUNTRY_EXPLICIT',
      phoneState: 'PHONE_NORMALIZED',
      isValid: true
    }, 'phone', opts.phoneProvenance || provenance, opts.phoneAcq || acq, opts.phoneSource || source, opts.policyStatus || 'POLICY_APPROVED', opts.phonePersist || opts.persistenceStatus || 'PERSISTABLE', opts.phoneExport || opts.exportStatus || 'EXPORTABLE')] : [],
    emails: opts.email ? [makeEnvelope({
      rawEmail: opts.email,
      normalizedEmail: opts.email.toLowerCase(),
      localPart: opts.email.split('@')[0],
      domainPart: opts.email.split('@')[1],
      isValid: true
    }, 'email', provenance, acq, source)] : [],
    address: opts.city ? makeEnvelope({
      displayAddress: `${opts.city}, ${opts.country || 'USA'}`,
      normalizedAddress: `${opts.city}, ${opts.country || 'USA'}`.toLowerCase(),
      locality: opts.city,
      country: opts.country || 'USA',
      countryCode: opts.countryCode || 'US'
    }, 'address', provenance, acq, source) : undefined,
    categories: opts.category ? [makeEnvelope({
      sourceCategory: opts.category,
      normalizedCategory: opts.category.toLowerCase(),
      categoryConfidence: 'STRONG'
    }, 'category', provenance, acq, source)] : [],
    socialUrls: [],
    normalizationAudit: {
      normalizedAt: '2026-09-29T12:00:00.000Z',
      engineVersion: '1.1.0',
      errors: [],
      warnings: [],
      isSanitized: true
    }
  };
}

function makeEvidence(url, domain, state, opts = {}) {
  return {
    websiteUrl: url,
    normalizedUrl: url.split('?')[0],
    canonicalOrigin: `https://${domain}`,
    canonicalDomain: domain,
    verificationState: state,
    httpStatus: opts.httpStatus || 200,
    redirectChain: opts.redirectChain || [url],
    pagesVisited: opts.pagesVisited || [url],
    sameOrigin: opts.sameOrigin !== false,
    businessNameEvidence: {
      matched: Boolean(opts.nameMatched),
      score: opts.nameScore !== undefined ? opts.nameScore : (opts.nameMatched ? 0.95 : 0.1),
      evidenceSnippet: opts.nameSnippet || (opts.nameMatched ? 'Matched business name on homepage' : undefined),
      matchedValue: opts.matchedName
    },
    addressEvidence: {
      matched: Boolean(opts.addressMatched),
      localityMatched: opts.localityMatched !== false,
      evidenceSnippet: opts.addressSnippet
    },
    phoneEvidence: {
      matched: Boolean(opts.phoneMatched),
      matchedPhone: opts.matchedPhone
    },
    emailEvidence: {
      matched: Boolean(opts.emailMatched),
      matchedEmail: opts.matchedEmail
    },
    brandEvidence: {
      matched: Boolean(opts.brandMatched),
      matchedValue: opts.matchedBrand
    },
    serviceEvidence: {
      matched: Boolean(opts.serviceMatched),
      keywords: opts.serviceKeywords || []
    },
    aboutEvidence: {
      matched: Boolean(opts.aboutMatched),
      text: opts.aboutText
    },
    contactEvidence: {
      matched: Boolean(opts.contactMatched),
      formPresent: Boolean(opts.formPresent)
    },
    parkingEvidence: {
      isParked: Boolean(opts.isParked),
      detectedPatterns: opts.parkingPatterns
    },
    nonBusinessEvidence: {
      isNonBusiness: Boolean(opts.isNonBusiness),
      category: opts.nonBusinessCategory,
      reason: opts.nonBusinessReason
    },
    capturedAt: '2026-09-29T12:00:00.000Z',
    policyStatus: 'TARGET_SITE_RULES_APPLY',
    sourceContributions: [{
      source: 'USER_PROVIDED_DOMAIN',
      provenance: 'WEBSITE_DERIVED',
      fieldName: 'websiteEvidence',
      acquisitionContext: 'WEBSITE_DIRECT',
      restrictionBasis: 'TARGET_SITE_RULES',
      isRestricted: false,
      policyStatus: 'TARGET_SITE_RULES_APPLY',
      persistenceStatus: 'PERSISTABLE',
      exportStatus: 'EXPORTABLE'
    }],
    derivedFrom: []
  };
}

const fixtures = {
  // 1. Valid business website
  '01-valid-business-website.json': {
    fixtureId: '01-valid-business-website',
    description: 'Valid business website with matching name, phone, email, and positive HTTP 200',
    candidate: makeCandidate('cand-01', 'Apex Dental Studio', 'https://www.apexdental.com', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'apexdental.com',
      phone: '+15125550199',
      email: 'info@apexdental.com',
      city: 'Austin',
      country: 'USA',
      countryCode: 'US',
      category: 'Dental Clinic'
    }),
    evidence: makeEvidence('https://www.apexdental.com', 'apexdental.com', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      nameMatched: true,
      nameScore: 0.98,
      brandMatched: true,
      phoneMatched: true,
      matchedPhone: '+15125550199',
      emailMatched: true,
      matchedEmail: 'info@apexdental.com',
      serviceMatched: true,
      serviceKeywords: ['cosmetic dentistry', 'family dentist', 'implants']
    })
  },

  // 2. Shopify business website
  '02-shopify-business-website.json': {
    fixtureId: '02-shopify-business-website',
    description: 'Active e-commerce Shopify business website with product catalog and matching brand',
    candidate: makeCandidate('cand-02', 'Lumina Modern Home', 'https://luminahome.store', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'luminahome.store',
      email: 'support@luminahome.store',
      category: 'Furniture & Decor'
    }),
    evidence: makeEvidence('https://luminahome.store', 'luminahome.store', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      nameMatched: true,
      brandMatched: true,
      emailMatched: true,
      matchedEmail: 'support@luminahome.store',
      serviceMatched: true,
      serviceKeywords: ['furniture', 'lighting', 'sofa', 'decor']
    })
  },

  // 3. Parked domain
  '03-parked-domain.json': {
    fixtureId: '03-parked-domain',
    description: 'Domain is parked with domain-for-sale placeholder',
    candidate: makeCandidate('cand-03', 'Austin Dental Implants', 'https://austindentalimplants.com', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'austindentalimplants.com',
      category: 'Dental Clinic'
    }),
    evidence: makeEvidence('https://austindentalimplants.com', 'austindentalimplants.com', 'WEBSITE_PARKED', {
      isParked: true,
      parkingPatterns: ['domain is for sale', 'buy this domain at sedo', 'hugedomains']
    })
  },

  // 4. Non-business site
  '04-non-business-site.json': {
    fixtureId: '04-non-business-site',
    description: 'Destination URL resolves to a generic Wikipedia article or directory',
    candidate: makeCandidate('cand-04', 'History of Roofing', 'https://en.wikipedia.org/wiki/Roof', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'wikipedia.org',
      category: 'Roofing'
    }),
    evidence: makeEvidence('https://en.wikipedia.org/wiki/Roof', 'wikipedia.org', 'WEBSITE_NON_BUSINESS', {
      isNonBusiness: true,
      nonBusinessCategory: 'WIKIPEDIA_OR_ENCYCLOPEDIA',
      nonBusinessReason: 'Generic encyclopedia entry, not a commercial enterprise.'
    })
  },

  // 5. Unavailable site
  '05-unavailable-site.json': {
    fixtureId: '05-unavailable-site',
    description: 'Business website server returns HTTP 500 error',
    candidate: makeCandidate('cand-05', 'Austin Broken Dental', 'https://www.austinbrokendental.com', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'austinbrokendental.com',
      category: 'Dental Clinic'
    }),
    evidence: makeEvidence('https://www.austinbrokendental.com', 'austinbrokendental.com', 'WEBSITE_UNAVAILABLE', {
      httpStatus: 500
    })
  },

  // 6. Timeout site
  '06-timeout-site.json': {
    fixtureId: '06-timeout-site',
    description: 'Verification timed out exceeding 10s page boundary',
    candidate: makeCandidate('cand-06', 'Slow Responding Roofing', 'https://www.slowroofing.com', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'slowroofing.com',
      category: 'Roofing Contractor'
    }),
    evidence: makeEvidence('https://www.slowroofing.com', 'slowroofing.com', 'WEBSITE_UNAVAILABLE', {
      httpStatus: 408
    })
  },

  // 7. Redirect site
  '07-redirect-site.json': {
    fixtureId: '07-redirect-site',
    description: 'Initial vanity domain redirects to verified main business portal',
    candidate: makeCandidate('cand-07', 'Austin Family Dental Care', 'https://austinfamilydental.net', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'austinfamilydental.net',
      category: 'Dental Clinic'
    }),
    evidence: makeEvidence('https://austinfamilydental.net', 'main-austinfamilydental.com', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      redirectChain: ['https://austinfamilydental.net', 'https://main-austinfamilydental.com'],
      nameMatched: true,
      brandMatched: true
    })
  },

  // 8. Wrong business site
  '08-wrong-business-site.json': {
    fixtureId: '08-wrong-business-site',
    description: 'Website resolves but belongs to completely unrelated company',
    candidate: makeCandidate('cand-08', 'Apex Dental Studio', 'https://www.davesplumbingaustin.com', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'davesplumbingaustin.com',
      category: 'Dental Clinic'
    }),
    evidence: makeEvidence('https://www.davesplumbingaustin.com', 'davesplumbingaustin.com', 'WEBSITE_NON_BUSINESS', {
      nameMatched: false,
      nameScore: 0.05,
      brandMatched: false,
      isNonBusiness: true,
      nonBusinessReason: 'Content is exclusively plumbing contractor, contradictory to dental candidate.'
    })
  },

  // 9. Multi-param URL site
  '09-multi-param-url-site.json': {
    fixtureId: '09-multi-param-url-site',
    description: 'URL preserves functional parameters while stripping tracking tokens',
    candidate: makeCandidate('cand-09', 'Bengal Furniture Co', 'https://bengalfurniture.com/?store=dhaka&branch=2&lang=bn', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'bengalfurniture.com',
      category: 'Furniture Store',
      preservedParams: { store: 'dhaka', branch: '2', lang: 'bn' }
    }),
    evidence: makeEvidence('https://bengalfurniture.com/?store=dhaka&branch=2&lang=bn', 'bengalfurniture.com', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      nameMatched: true,
      brandMatched: true,
      serviceMatched: true,
      serviceKeywords: ['sofa', 'wood', 'furniture']
    })
  },

  // 10. Multilingual content site (Bengali / English)
  '10-multilingual-content-site.json': {
    fixtureId: '10-multilingual-content-site',
    description: 'Business website with multi-script Bengali and English dental service copy',
    candidate: makeCandidate('cand-10', 'ঢাকা ডেন্টাল কেয়ার', 'https://dhakadentalcare.bd', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'dhakadentalcare.bd',
      category: 'Dental Care',
      script: 'BENGALI',
      city: 'Dhaka',
      country: 'Bangladesh',
      countryCode: 'BD'
    }),
    evidence: makeEvidence('https://dhakadentalcare.bd', 'dhakadentalcare.bd', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      nameMatched: true,
      nameScore: 0.95,
      nameSnippet: 'ঢাকা ডেন্টাল কেয়ার - আন্তর্জাতিক মানের চিকিৎসা',
      serviceMatched: true,
      serviceKeywords: ['দাঁতের চিকিৎসা', 'ডেন্টাল ক্লিনিক', 'dental implants']
    })
  },

  // 11. No website pointer
  '11-no-website-pointer.json': {
    fixtureId: '11-no-website-pointer',
    description: 'Candidate possesses business name, phone, and category, but no website URL pointer',
    candidate: makeCandidate('cand-11', 'Austin Quick Roof Repair', null, 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      phone: '+15125550188',
      city: 'Austin',
      category: 'Roofing Contractor'
    }),
    evidence: undefined
  },

  // 12. Google-derived no-website-pointer candidate
  '12-google-derived-no-website.json': {
    fixtureId: '12-google-derived-no-website',
    description: 'Google Maps consumer web listing with omitted website URL: OBSERVED_NO_WEBSITE_POINTER',
    candidate: makeCandidate('cand-12', 'Local Plumber Austin', null, 'GOOGLE_MAPS', 'GOOGLE_DERIVED', 'GOOGLE_CONSUMER_WEB', {
      isRestricted: true,
      restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
      policyStatus: 'POLICY_GATED',
      persistenceStatus: 'NOT_PERSISTABLE',
      exportStatus: 'NOT_EXPORTABLE',
      phone: '+15125550122',
      city: 'Austin',
      category: 'Plumber'
    }),
    evidence: undefined
  },

  // 13. Meta-derived destination URL
  '13-meta-derived-destination.json': {
    fixtureId: '13-meta-derived-destination',
    description: 'Meta Ad Library lead with destination URL linking to external verified business portal',
    candidate: makeCandidate('cand-13', 'CloudSync Solutions', 'https://cloudsync.io', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'cloudsync.io',
      category: 'B2B SaaS Software'
    }),
    evidence: makeEvidence('https://cloudsync.io', 'cloudsync.io', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      nameMatched: true,
      brandMatched: true,
      serviceMatched: true,
      serviceKeywords: ['cloud backup', 'b2b saas', 'enterprise sync']
    })
  },

  // 14. User-provided domain
  '14-user-provided-domain.json': {
    fixtureId: '14-user-provided-domain',
    description: 'User manually supplied domain input -> independent website crawl',
    candidate: makeCandidate('cand-14', 'Direct Dental Care', 'https://directdentalcare.com', 'USER_PROVIDED_DOMAIN', 'USER_PROVIDED', 'USER_INPUT', {
      domain: 'directdentalcare.com',
      policyStatus: 'NOT_APPLICABLE',
      persistenceStatus: 'USER_PROVIDED',
      exportStatus: 'USER_APPROVED',
      category: 'Dental Clinic'
    }),
    evidence: makeEvidence('https://directdentalcare.com', 'directdentalcare.com', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      nameMatched: true,
      phoneMatched: true,
      matchedPhone: '+18005550144'
    })
  },

  // 15. Google + website mixed lineage
  '15-google-website-mixed-lineage.json': {
    fixtureId: '15-google-website-mixed-lineage',
    description: 'Candidate business name is Google-derived; contact phone is website-derived',
    candidate: makeCandidate('cand-15', 'Austin Roofing Specialists', 'https://austinroofingspec.com', 'GOOGLE_MAPS', 'MIXED', 'GOOGLE_CONSUMER_WEB', {
      domain: 'austinroofingspec.com',
      isRestricted: true,
      restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
      policyStatus: 'POLICY_GATED',
      persistenceStatus: 'NOT_PERSISTABLE',
      exportStatus: 'NOT_EXPORTABLE',
      phone: '+15125559876',
      phoneProvenance: 'WEBSITE_DERIVED',
      phoneAcq: 'WEBSITE_DIRECT',
      phoneSource: 'USER_PROVIDED_DOMAIN',
      phonePersist: 'PERSISTABLE',
      phoneExport: 'EXPORTABLE',
      category: 'Roofing'
    }),
    evidence: makeEvidence('https://austinroofingspec.com', 'austinroofingspec.com', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      nameMatched: true,
      phoneMatched: true,
      matchedPhone: '+15125559876'
    })
  },

  // 16. Meta + website mixed lineage
  '16-meta-website-mixed-lineage.json': {
    fixtureId: '16-meta-website-mixed-lineage',
    description: 'Candidate name is Meta-derived; email and address are website-derived',
    candidate: makeCandidate('cand-16', 'Apex Orthodontics', 'https://apexortho.com', 'META_AD_LIBRARY', 'MIXED', 'META_AD_LIBRARY', {
      domain: 'apexortho.com',
      email: 'contact@apexortho.com',
      city: 'Austin',
      category: 'Orthodontics'
    }),
    evidence: makeEvidence('https://apexortho.com', 'apexortho.com', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      nameMatched: true,
      emailMatched: true,
      matchedEmail: 'contact@apexortho.com',
      addressMatched: true,
      localityMatched: true
    })
  },

  // 17. Contradictory business name
  '17-contradictory-business-name.json': {
    fixtureId: '17-contradictory-business-name',
    description: 'Irreconcilable business name contradiction between candidate and destination website',
    candidate: makeCandidate('cand-17', 'Elite Family Dentistry', 'https://elitedental.com', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'elitedental.com',
      category: 'Dental Clinic'
    }),
    evidence: makeEvidence('https://elitedental.com', 'elitedental.com', 'WEBSITE_NON_BUSINESS', {
      nameMatched: false,
      nameScore: 0.05,
      isNonBusiness: true,
      nonBusinessReason: 'Site header belongs to Bob Towing and Wrecker Service.'
    })
  },

  // 18. Contradictory locality
  '18-contradictory-locality.json': {
    fixtureId: '18-contradictory-locality',
    description: 'Geographic mismatch: candidate claims Austin USA, website address indicates Sydney Australia',
    candidate: makeCandidate('cand-18', 'Apex Dental Practice', 'https://apexdentalpractice.com', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'apexdentalpractice.com',
      city: 'Austin',
      country: 'USA',
      countryCode: 'US',
      category: 'Dentist'
    }),
    evidence: makeEvidence('https://apexdentalpractice.com', 'apexdentalpractice.com', 'WEBSITE_UNCERTAIN', {
      nameMatched: true,
      addressMatched: false,
      localityMatched: false,
      addressSnippet: 'George St, Sydney NSW 2000, Australia'
    })
  },

  // 19. Website requirement WITH
  '19-requirement-with.json': {
    fixtureId: '19-requirement-with',
    description: 'Candidate verified for WITH requirement mode',
    candidate: makeCandidate('cand-19', 'Precision Dental Group', 'https://precisiondental.com', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'precisiondental.com',
      category: 'Dental Clinic',
      city: 'Austin',
      countryCode: 'US'
    }),
    evidence: makeEvidence('https://precisiondental.com', 'precisiondental.com', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      nameMatched: true,
      brandMatched: true
    })
  },

  // 20. Website requirement WITHOUT
  '20-requirement-without.json': {
    fixtureId: '20-requirement-without',
    description: 'Candidate qualified for WITHOUT mode with explicit verified absence proof',
    candidate: makeCandidate('cand-20', 'Joe Mobile Barber', null, 'USER_PROVIDED_DOMAIN', 'USER_PROVIDED', 'USER_INPUT', {
      phone: '+15125550999',
      category: 'Barbershop',
      city: 'Austin',
      countryCode: 'US'
    }),
    evidence: undefined,
    explicitNoWebsiteEvidence: {
      hasConfirmedAbsence: true,
      source: 'USER_PROVIDED_DOMAIN',
      evidenceSnippet: 'Official business registration confirms walk-in only service without commercial website.'
    }
  },

  // 21. Website requirement BOTH
  '21-requirement-both.json': {
    fixtureId: '21-requirement-both',
    description: 'Evaluation under BOTH requirement mode (qualifies with verified website)',
    candidate: makeCandidate('cand-21', 'Austin Smile Studio', 'https://austinsmile.com', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'austinsmile.com',
      category: 'Dental Care',
      city: 'Austin',
      countryCode: 'US'
    }),
    evidence: makeEvidence('https://austinsmile.com', 'austinsmile.com', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      nameMatched: true,
      brandMatched: true
    })
  },

  // 22. Policy review candidate
  '22-policy-review-candidate.json': {
    fixtureId: '22-policy-review-candidate',
    description: 'Candidate carries ambiguous or unreviewed Google API contribution requiring compliance audit',
    candidate: makeCandidate('cand-22', 'Commercial HVAC Pro', 'https://commercialhvac.com', 'GOOGLE_MAPS', 'GOOGLE_API_DERIVED', 'GOOGLE_PLATFORM_API', {
      domain: 'commercialhvac.com',
      restrictionBasis: 'GOOGLE_API_SERVICE_SPECIFIC',
      policyStatus: 'POLICY_REVIEW_REQUIRED',
      persistenceStatus: 'PERSISTENCE_GATED',
      exportStatus: 'EXPORT_GATED',
      category: 'HVAC Services'
    }),
    evidence: makeEvidence('https://commercialhvac.com', 'commercialhvac.com', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      nameMatched: true,
      brandMatched: true
    })
  },

  // 23. Export blocked candidate
  '23-export-blocked-candidate.json': {
    fixtureId: '23-export-blocked-candidate',
    description: 'Candidate satisfies relevance and verified website, but carries restricted Google consumer-web lineage, blocking export',
    candidate: makeCandidate('cand-23', 'Austin Premier Roofing', 'https://austinpremroof.com', 'GOOGLE_MAPS', 'GOOGLE_DERIVED', 'GOOGLE_CONSUMER_WEB', {
      domain: 'austinpremroof.com',
      isRestricted: true,
      restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
      policyStatus: 'POLICY_GATED',
      persistenceStatus: 'NOT_PERSISTABLE',
      exportStatus: 'NOT_EXPORTABLE',
      category: 'Roofing Contractor'
    }),
    evidence: makeEvidence('https://austinpremroof.com', 'austinpremroof.com', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      nameMatched: true,
      brandMatched: true
    })
  },

  // 24. Restart/recovery candidate
  '24-restart-recovery-candidate.json': {
    fixtureId: '24-restart-recovery-candidate',
    description: 'Candidate with durable state and partial verification surviving recovery',
    candidate: makeCandidate('cand-24', 'Recovered Dental Clinic', 'https://recovereddental.com', 'META_AD_LIBRARY', 'META_DERIVED', 'META_AD_LIBRARY', {
      domain: 'recovereddental.com',
      category: 'Dental Clinic'
    }),
    evidence: makeEvidence('https://recovereddental.com', 'recovereddental.com', 'WEBSITE_VERIFIED_BUSINESS_SITE', {
      nameMatched: true,
      brandMatched: true
    })
  }
};

let count = 0;
for (const [filename, data] of Object.entries(fixtures)) {
  const filePath = path.join(outDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  count++;
}

console.log(`Generated ${count} qualification fixtures in ${outDir}`);
