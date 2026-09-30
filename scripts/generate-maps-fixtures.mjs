/**
 * LeadNoria Phase 7 Maps Fixtures Generator
 *
 * Generates the 40 deterministic test fixtures required by Master Prompt #7 Section 25.
 */

import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('fixtures/maps');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const fixtures = {
  // 1. English business
  '01-english-business.json': {
    fixtureId: '01-english-business',
    description: 'English business with complete standard fields',
    candidate: {
      sourceId: 'ChIJ123456789_en',
      source: 'GOOGLE_MAPS',
      businessName: 'Austin Craft Roofing & Siding LLC',
      category: 'Roofing Contractor',
      address: '100 Congress Ave #2000, Austin, TX 78701, USA',
      street: '100 Congress Ave #2000',
      locality: 'Austin',
      region: 'TX',
      postalCode: '78701',
      country: 'USA',
      countryCode: 'US',
      latitude: 30.267153,
      longitude: -97.743061,
      phone: '+1 512-555-0144',
      website: 'https://austincraftroofing.com/?ref=gmb_listing',
      businessStatus: 'OPERATIONAL',
      rating: 4.8,
      reviewCount: 142,
      mapsUrl: 'https://maps.google.com/?cid=1029384756&q=Austin+Craft+Roofing'
    }
  },

  // 2. Bengali business
  '02-bengali-business.json': {
    fixtureId: '02-bengali-business',
    description: 'Bengali script business with Unicode characters',
    candidate: {
      sourceId: 'ChIJ_bn_dhaka_01',
      source: 'GOOGLE_MAPS',
      businessName: 'ঢাকা ডেন্টাল কেয়ার অ্যান্ড ইমপ্লান্ট সেন্টার',
      category: 'দাঁতের ডাক্তার',
      address: '১২/এ, মিরপুর রোড, ধানমন্ডি, ঢাকা ১২০৫',
      locality: 'ঢাকা',
      postalCode: '১২০৫',
      country: 'বাংলাদেশ',
      countryCode: 'BD',
      latitude: 23.746465,
      longitude: 90.376015,
      phone: '+880 1711-555999',
      website: 'https://dhakadental.com.bd',
      businessStatus: 'OPEN'
    }
  },

  // 3. Arabic business
  '03-arabic-business.json': {
    fixtureId: '03-arabic-business',
    description: 'Arabic script business in Dubai UAE',
    candidate: {
      sourceId: 'ChIJ_ar_dubai_01',
      source: 'GOOGLE_MAPS',
      businessName: 'عيادة دبي التخصصية لطب الأسنان',
      category: 'عيادة أسنان',
      address: 'شارع الشيخ زايد، دبي، الإمارات العربية المتحدة',
      locality: 'دبي',
      country: 'الإمارات العربية المتحدة',
      countryCode: 'AE',
      latitude: 25.204849,
      longitude: 55.270783,
      phone: '+971 4 555 1234',
      website: 'https://dubaidentalclinic.ae',
      businessStatus: 'OPERATIONAL'
    }
  },

  // 4. German business
  '04-german-business.json': {
    fixtureId: '04-german-business',
    description: 'German business with umlauts and GmbH suffix',
    candidate: {
      sourceId: 'ChIJ_de_munich_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Müller & Söhne Sanitärtechnik GmbH',
      category: 'Klempner',
      address: 'Leopoldstraße 45, 80802 München, Deutschland',
      street: 'Leopoldstraße 45',
      locality: 'München',
      region: 'Bayern',
      postalCode: '80802',
      country: 'Deutschland',
      countryCode: 'DE',
      latitude: 48.158312,
      longitude: 11.584729,
      phone: '+49 89 5556677',
      website: 'https://mueller-sanitaer.de',
      businessStatus: 'OPEN'
    }
  },

  // 5. French business
  '05-french-business.json': {
    fixtureId: '05-french-business',
    description: 'French business with accents and SARL suffix',
    candidate: {
      sourceId: 'ChIJ_fr_paris_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Ébénisterie d’Art & Rénovation SARL',
      category: 'Fabricant de meubles',
      address: '15 Rue de Bretagne, 75003 Paris, France',
      street: '15 Rue de Bretagne',
      locality: 'Paris',
      region: 'Île-de-France',
      postalCode: '75003',
      country: 'France',
      countryCode: 'FR',
      latitude: 48.862725,
      longitude: 2.363014,
      phone: '+33 1 42 68 55 00',
      website: 'https://ebenisterie-art.fr',
      businessStatus: 'OPERATIONAL'
    }
  },

  // 6. Spanish business
  '06-spanish-business.json': {
    fixtureId: '06-spanish-business',
    description: 'Spanish business with ñ, accents and S.L. suffix',
    candidate: {
      sourceId: 'ChIJ_es_madrid_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Diseño de Muebles & Decoración Castellana S.L.',
      category: 'Tienda de muebles',
      address: 'Calle de Serrano 88, 28006 Madrid, España',
      street: 'Calle de Serrano 88',
      locality: 'Madrid',
      region: 'Madrid',
      postalCode: '28006',
      country: 'España',
      countryCode: 'ES',
      latitude: 40.431215,
      longitude: -3.687412,
      phone: '+34 91 555 4321',
      website: 'https://castellana-muebles.es',
      businessStatus: 'OPEN'
    }
  },

  // 7. Mixed-script business name
  '07-mixed-script-business.json': {
    fixtureId: '07-mixed-script-business',
    description: 'Mixed Bengali and English business name',
    candidate: {
      sourceId: 'ChIJ_mixed_script_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Apex ডেন্টাল কেয়ার (Apex Dental Care)',
      category: 'Dental Clinic',
      address: 'Gulshan 2, Dhaka, Bangladesh',
      locality: 'Dhaka',
      countryCode: 'BD',
      phone: '+880 2 9885500'
    }
  },

  // 8. Branch name
  '08-branch-name.json': {
    fixtureId: '08-branch-name',
    description: 'Specific branch name that must survive normalization without collapsing',
    candidate: {
      sourceId: 'ChIJ_branch_01',
      source: 'GOOGLE_MAPS',
      businessName: 'ABC Furniture Ltd - Uttara Branch',
      category: 'Furniture Store',
      locality: 'Dhaka',
      countryCode: 'BD'
    }
  },

  // 9. Legal suffix variation
  '09-legal-suffix-variation.json': {
    fixtureId: '09-legal-suffix-variation',
    description: 'Name with legal suffix that is separated for comparison but kept in display',
    candidate: {
      sourceId: 'ChIJ_legal_suffix_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Precision Health Systems Incorporated',
      category: 'Medical Center',
      countryCode: 'US'
    }
  },

  // 10. Functional website parameters
  '10-functional-website-params.json': {
    fixtureId: '10-functional-website-params',
    description: 'Website URL with functional parameters preserved',
    candidate: {
      sourceId: 'ChIJ_func_params_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Bengal Home Living',
      website: 'https://bengalhomeliving.com/?store=gulshan&branch=2&lang=bn&mode=catalog'
    }
  },

  // 11. Tracking website parameters
  '11-tracking-website-params.json': {
    fixtureId: '11-tracking-website-params',
    description: 'Website URL with marketing click IDs that must be stripped',
    candidate: {
      sourceId: 'ChIJ_tracking_params_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Austin Modern Roofing',
      website: 'https://austinmodernroofing.com/?gclid=Cj0KCQjw123&fbclid=IwAR987&gbraid=0AAAAAD'
    }
  },

  // 12. International phone with +
  '12-international-phone-plus.json': {
    fixtureId: '12-international-phone-plus',
    description: 'Explicit international E.164 phone format',
    candidate: {
      sourceId: 'ChIJ_phone_intl_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Global Dental Care',
      phone: '+44 20 7946 0991',
      countryCode: 'GB'
    }
  },

  // 13. National phone with explicit country
  '13-national-phone-explicit-country.json': {
    fixtureId: '13-national-phone-explicit-country',
    description: 'National formatted phone with explicit country context',
    candidate: {
      sourceId: 'ChIJ_phone_nat_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Austin Family Practice',
      phone: '(512) 555-0188',
      countryCode: 'US'
    }
  },

  // 14. Ambiguous national phone
  '14-ambiguous-national-phone.json': {
    fixtureId: '14-ambiguous-national-phone',
    description: 'National phone without country context (flagged as PHONE_AMBIGUOUS)',
    candidate: {
      sourceId: 'ChIJ_phone_amb_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Mystery Plumbing Service',
      phone: '01711223344'
    }
  },

  // 15. Missing phone
  '15-missing-phone.json': {
    fixtureId: '15-missing-phone',
    description: 'Candidate without phone number',
    candidate: {
      sourceId: 'ChIJ_no_phone_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Online Direct Crafts',
      phone: null
    }
  },

  // 16. Structured address
  '16-structured-address.json': {
    fixtureId: '16-structured-address',
    description: 'Fully structured address with street, locality, region, postalCode, country',
    candidate: {
      sourceId: 'ChIJ_struct_addr_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Lone Star Dental Lab',
      address: '2500 Bee Cave Rd, Bldg 1, Suite 100, Austin, TX 78746, USA',
      street: '2500 Bee Cave Rd, Bldg 1, Suite 100',
      locality: 'Austin',
      region: 'TX',
      postalCode: '78746',
      country: 'USA',
      countryCode: 'US'
    }
  },

  // 17. Partial address
  '17-partial-address.json': {
    fixtureId: '17-partial-address',
    description: 'Address with only street and city',
    candidate: {
      sourceId: 'ChIJ_partial_addr_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Austin Downtown Barber',
      address: '6th Street, Austin',
      locality: 'Austin'
    }
  },

  // 18. Missing locality
  '18-missing-locality.json': {
    fixtureId: '18-missing-locality',
    description: 'Address with postal code and country but omitted locality',
    candidate: {
      sourceId: 'ChIJ_no_locality_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Rural Texas Electrician',
      address: 'Highway 71, 78669, USA',
      postalCode: '78669',
      countryCode: 'US'
    }
  },

  // 19. Missing postal code
  '19-missing-postal-code.json': {
    fixtureId: '19-missing-postal-code',
    description: 'Address with city and country but no postal code',
    candidate: {
      sourceId: 'ChIJ_no_postal_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Dhaka City Tailors',
      address: 'Dhanmondi, Dhaka, Bangladesh',
      locality: 'Dhaka',
      countryCode: 'BD'
    }
  },

  // 20. Missing country
  '20-missing-country.json': {
    fixtureId: '20-missing-country',
    description: 'Address without country or countryCode',
    candidate: {
      sourceId: 'ChIJ_no_country_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Main Street Bakery',
      address: '100 Main Street',
      street: '100 Main Street'
    }
  },

  // 21. Valid coordinates
  '21-valid-coordinates.json': {
    fixtureId: '21-valid-coordinates',
    description: 'Valid geographic latitude and longitude',
    candidate: {
      sourceId: 'ChIJ_coords_valid_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Texas State Capitol Tours',
      latitude: 30.274722,
      longitude: -97.740556
    }
  },

  // 22. Invalid coordinates
  '22-invalid-coordinates.json': {
    fixtureId: '22-invalid-coordinates',
    description: 'Out of range latitude (>90)',
    candidate: {
      sourceId: 'ChIJ_coords_invalid_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Impossible Geolocation Clinic',
      latitude: 145.267,
      longitude: -97.743
    }
  },

  // 23. Missing coordinates
  '23-missing-coordinates.json': {
    fixtureId: '23-missing-coordinates',
    description: 'Candidate with null coordinates',
    candidate: {
      sourceId: 'ChIJ_coords_missing_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Mobile Service Contractor',
      latitude: null,
      longitude: null
    }
  },

  // 24. Multiple business hours intervals
  '24-multiple-hours-intervals.json': {
    fixtureId: '24-multiple-hours-intervals',
    description: 'Opening hours with split shifts / multiple intervals per day',
    candidate: {
      sourceId: 'ChIJ_hours_multi_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Bistro & Cafe Milano',
      openingHours: {
        periods: [
          { day: 1, openTime: '08:00', closeTime: '14:00' },
          { day: 1, openTime: '17:00', closeTime: '22:00' },
          { day: 2, openTime: '08:00', closeTime: '14:00' },
          { day: 2, openTime: '17:00', closeTime: '22:00' }
        ],
        weekdayText: [
          'Monday: 8:00 AM – 2:00 PM, 5:00 – 10:00 PM',
          'Tuesday: 8:00 AM – 2:00 PM, 5:00 – 10:00 PM'
        ],
        timezone: 'America/Chicago'
      }
    }
  },

  // 25. Closed day
  '25-closed-day.json': {
    fixtureId: '25-closed-day',
    description: 'Business with explicit closed days',
    candidate: {
      sourceId: 'ChIJ_hours_closed_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Sunday Rest Dental Clinic',
      openingHours: {
        periods: [
          { day: 1, openTime: '09:00', closeTime: '17:00' }
        ],
        weekdayText: [
          'Sunday: Closed',
          'Monday: 9:00 AM – 5:00 PM'
        ]
      }
    }
  },

  // 26. Unknown hours
  '26-unknown-hours.json': {
    fixtureId: '26-unknown-hours',
    description: 'Candidate with no opening hours metadata',
    candidate: {
      sourceId: 'ChIJ_hours_unknown_01',
      source: 'GOOGLE_MAPS',
      businessName: '24/7 Remote Support Tech',
      openingHours: null
    }
  },

  // 27. Numeric rating
  '27-numeric-rating.json': {
    fixtureId: '27-numeric-rating',
    description: 'Valid numeric rating and review count',
    candidate: {
      sourceId: 'ChIJ_rating_valid_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Highly Rated Roofer',
      rating: 4.9,
      reviewCount: 382
    }
  },

  // 28. Missing rating
  '28-missing-rating.json': {
    fixtureId: '28-missing-rating',
    description: 'New business with missing rating and 0 reviews',
    candidate: {
      sourceId: 'ChIJ_rating_missing_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Brand New Dental Practice',
      rating: null,
      reviewCount: 0
    }
  },

  // 29. Numeric review count
  '29-numeric-review-count.json': {
    fixtureId: '29-numeric-review-count',
    description: 'Review count provided as string with comma formatting',
    candidate: {
      sourceId: 'ChIJ_review_count_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Popular Austin BBQ',
      rating: 4.7,
      reviewCount: '1,420'
    }
  },

  // 30. Malformed review count
  '30-malformed-review-count.json': {
    fixtureId: '30-malformed-review-count',
    description: 'Malformed review count string ("hundreds")',
    candidate: {
      sourceId: 'ChIJ_review_malformed_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Ambiguous Reviews Store',
      rating: 4.5,
      reviewCount: 'hundreds'
    }
  },

  // 31. Google source ID
  '31-google-source-id.json': {
    fixtureId: '31-google-source-id',
    description: 'Google Place ID with place reference metadata',
    candidate: {
      sourceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      source: 'GOOGLE_MAPS',
      businessName: 'Google Sydney Office',
      placeReference: {
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        plusCode: '4RRH+48 Pyrmont NSW, Australia'
      }
    }
  },

  // 32. Google-derived restricted lineage
  '32-google-derived-restricted-lineage.json': {
    fixtureId: '32-google-derived-restricted-lineage',
    description: 'Candidate derived from Google consumer web UI with restricted lineage',
    candidate: {
      sourceId: 'ChIJ_restricted_web_01',
      source: 'GOOGLE_MAPS',
      provenance: 'GOOGLE_DERIVED',
      acquisitionContext: 'GOOGLE_CONSUMER_WEB',
      restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
      businessName: 'Austin Consumer Web Listing',
      phone: '+1 512-555-0199'
    }
  },

  // 33. Google API service-specific lineage
  '33-google-api-service-specific-lineage.json': {
    fixtureId: '33-google-api-service-specific-lineage',
    description: 'Candidate from official Places API requiring policy review',
    candidate: {
      sourceId: 'ChIJ_places_api_01',
      source: 'GOOGLE_MAPS',
      provenance: 'GOOGLE_API_DERIVED',
      acquisitionContext: 'GOOGLE_PLATFORM_API',
      restrictionBasis: 'GOOGLE_API_SERVICE_SPECIFIC',
      businessName: 'Places API Enterprise Dental',
      phone: '+1 512-555-0177'
    }
  },

  // 34. Meta-derived normalized field
  '34-meta-derived-field.json': {
    fixtureId: '34-meta-derived-field',
    description: 'Candidate with Meta Ad Library origin',
    candidate: {
      sourceId: 'meta_ad_1029384756',
      source: 'META_AD_LIBRARY',
      provenance: 'META_DERIVED',
      acquisitionContext: 'META_AD_LIBRARY',
      restrictionBasis: 'NONE',
      businessName: 'Austin SaaS Marketing Agency',
      website: 'https://austinsaas.com'
    }
  },

  // 35. Website-derived normalized field
  '35-website-derived-field.json': {
    fixtureId: '35-website-derived-field',
    description: 'Candidate extracted directly from website crawl',
    candidate: {
      sourceId: 'web_crawl_austindental_com',
      source: 'USER_PROVIDED_DOMAIN',
      provenance: 'WEBSITE_DERIVED',
      acquisitionContext: 'WEBSITE_DIRECT',
      restrictionBasis: 'TARGET_SITE_RULES',
      businessName: 'Direct Crawled Dental Clinic',
      phone: '+1 512-555-0122'
    }
  },

  // 36. User-provided normalized field
  '36-user-provided-field.json': {
    fixtureId: '36-user-provided-field',
    description: 'Candidate provided directly by user form input',
    candidate: {
      sourceId: 'user_input_hash_89712',
      source: 'USER_PROVIDED_DOMAIN',
      provenance: 'USER_PROVIDED',
      acquisitionContext: 'USER_INPUT',
      restrictionBasis: 'NONE',
      businessName: 'Manual User Supplied Roofer',
      website: 'https://manualroofer.com'
    }
  },

  // 37. Mixed-lineage normalized field
  '37-mixed-lineage-field.json': {
    fixtureId: '37-mixed-lineage-field',
    description: 'Candidate with multi-source contributions',
    candidate: {
      sourceId: 'mixed_entity_9988',
      source: 'GOOGLE_MAPS',
      provenance: 'MIXED',
      acquisitionContext: 'GOOGLE_CONSUMER_WEB',
      restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
      businessName: 'Google Name + Web Phone Clinic',
      phone: '+1 512-555-0155',
      sourceContributions: [
        {
          source: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED',
          fieldName: 'businessName',
          acquisitionContext: 'GOOGLE_CONSUMER_WEB',
          restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
          isRestricted: true,
          policyStatus: 'POLICY_GATED',
          persistenceStatus: 'NOT_PERSISTABLE',
          exportStatus: 'NOT_EXPORTABLE'
        },
        {
          source: 'USER_PROVIDED_DOMAIN',
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
    }
  },

  // 38. Unknown category
  '38-unknown-category.json': {
    fixtureId: '38-unknown-category',
    description: 'Candidate with omitted category field',
    candidate: {
      sourceId: 'ChIJ_no_category_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Mysterious Enterprise Co',
      category: null
    }
  },

  // 39. Unknown country
  '39-unknown-country.json': {
    fixtureId: '39-unknown-country',
    description: 'Candidate with unrecognized / empty country',
    candidate: {
      sourceId: 'ChIJ_unknown_country_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Island Trade Center',
      country: '',
      countryCode: ''
    }
  },

  // 40. Empty candidate fields
  '40-empty-candidate-fields.json': {
    fixtureId: '40-empty-candidate-fields',
    description: 'Candidate with bare minimum fields (id and name only)',
    candidate: {
      sourceId: 'ChIJ_bare_min_01',
      source: 'GOOGLE_MAPS',
      businessName: 'Minimalist Studio'
    }
  }
};

let count = 0;
for (const [filename, data] of Object.entries(fixtures)) {
  const filePath = path.join(outDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  count++;
}

console.log(`Generated ${count} Maps normalization fixtures in ${outDir}`);
