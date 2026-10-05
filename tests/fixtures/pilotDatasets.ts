/**
 * LeadNoria — Phase 27 Production Pilot Datasets
 * Controlled, realistic test fixtures covering representative business archetypes.
 * 
 * NOTE: This fixture resides in tests/ and is strictly excluded from production extension bundles.
 */

export interface PilotBusinessCandidate {
  archetype: string;
  name: string;
  category: string;
  country: string;
  facebookPageId?: string;
  facebookPageUrl?: string;
  websiteUrl?: string;
  adCount: number;
  phone?: string;
  email?: string;
  address?: string;
  technologies?: string[];
  people?: Array<{ name: string; role: string; email?: string }>;
  conflicts?: Array<{ field: string; sourceA: string; valueA: string; sourceB: string; valueB: string }>;
  expectedQualification: 'QUALIFIED' | 'NOT_QUALIFIED' | 'UNCERTAIN' | 'BLOCKED';
  isRestricted?: boolean;
}

export const REALISTIC_PILOT_DATASET: PilotBusinessCandidate[] = [
  // 1. Local Service with Strong Presence (Plumber UK)
  {
    archetype: 'LOCAL_SERVICE_STRONG',
    name: 'Apex Heating & Plumbing Ltd',
    category: 'Plumber',
    country: 'GB',
    facebookPageId: 'fb_page_apex_heat',
    facebookPageUrl: 'https://www.facebook.com/apexheatinguk',
    websiteUrl: 'https://www.apexheating-london.co.uk',
    adCount: 4,
    phone: '+44 20 7946 0991',
    email: 'contact@apexheating-london.co.uk',
    address: '14 Elm Road, London E1 6AN',
    technologies: ['WordPress', 'Google Tag Manager', 'Calendly'],
    people: [{ name: 'David Smith', role: 'Managing Director' }],
    expectedQualification: 'QUALIFIED'
  },
  // 2. B2B Consulting with Leadership (US Logistics)
  {
    archetype: 'B2B_CONSULTING',
    name: 'Vanguard Supply Chain Solutions',
    category: 'Management Consultant',
    country: 'US',
    facebookPageId: 'fb_page_vanguard_sc',
    facebookPageUrl: 'https://www.facebook.com/vanguardlogisticsus',
    websiteUrl: 'https://www.vanguardsupply.com',
    adCount: 2,
    phone: '+1 312 555 0188',
    email: 'solutions@vanguardsupply.com',
    address: '200 W Madison St, Chicago, IL 60606',
    technologies: ['Webflow', 'HubSpot', 'Intercom'],
    people: [
      { name: 'Sarah Jenkins', role: 'Chief Executive Officer', email: 'sjenkins@vanguardsupply.com' },
      { name: 'Marcus Vance', role: 'Head of Operations' }
    ],
    expectedQualification: 'QUALIFIED'
  },
  // 3. Digital Commerce Brand (AU Sustainable Apparel)
  {
    archetype: 'DIGITAL_COMMERCE',
    name: 'Koa Eco Apparel',
    category: 'Clothing Brand',
    country: 'AU',
    facebookPageId: 'fb_page_koa_eco',
    facebookPageUrl: 'https://www.facebook.com/koaecoapparel',
    websiteUrl: 'https://www.koaeco.com.au',
    adCount: 8,
    email: 'support@koaeco.com.au',
    technologies: ['Shopify', 'Klaviyo', 'Meta Pixel'],
    expectedQualification: 'QUALIFIED'
  },
  // 4. Local Service with Weak Presence (No Plain Email, Form Only)
  {
    archetype: 'LOCAL_SERVICE_WEAK',
    name: 'QuickFix Auto Care',
    category: 'Auto Repair',
    country: 'US',
    facebookPageId: 'fb_page_quickfix_auto',
    facebookPageUrl: 'https://www.facebook.com/quickfixautous',
    websiteUrl: 'https://www.quickfixautocare.com',
    adCount: 1,
    phone: '+1 214 555 0142',
    technologies: ['Wix'],
    expectedQualification: 'QUALIFIED'
  },
  // 5. Minimal Social-Only Business (No Website)
  {
    archetype: 'SOCIAL_ONLY_NO_WEBSITE',
    name: 'Artisan Sourdough Bakery',
    category: 'Bakery',
    country: 'GB',
    facebookPageId: 'fb_page_artisan_sourdough',
    facebookPageUrl: 'https://www.facebook.com/artisansourdoughmanchester',
    adCount: 3,
    phone: '+44 161 496 0233',
    expectedQualification: 'UNCERTAIN'
  },
  // 6. Conflicting Identity & Contact Signals
  {
    archetype: 'CONFLICTING_SIGNALS',
    name: 'Metro Electric Co',
    category: 'Electrician',
    country: 'CA',
    facebookPageId: 'fb_page_metro_elec',
    facebookPageUrl: 'https://www.facebook.com/metroelectricto',
    websiteUrl: 'https://www.metroelectric.ca',
    adCount: 2,
    phone: '+1 416 555 0199',
    email: 'service@metroelectric.ca',
    conflicts: [
      {
        field: 'phone',
        sourceA: 'META_AD_LIBRARY',
        valueA: '+1 416 555 0199',
        sourceB: 'WEBSITE',
        valueB: '+1 416 555 0100'
      }
    ],
    expectedQualification: 'UNCERTAIN'
  },
  // 7. Non-Qualified Business (Missing Mandatory Criteria for B2B Profile)
  {
    archetype: 'NOT_QUALIFIED_B2B',
    name: 'Solo Design Studio',
    category: 'Graphic Designer',
    country: 'US',
    facebookPageId: 'fb_page_solo_design',
    facebookPageUrl: 'https://www.facebook.com/solodesignus',
    websiteUrl: 'https://www.solodesign.xyz',
    adCount: 1,
    expectedQualification: 'NOT_QUALIFIED'
  },
  // 8. Restricted Google Candidate (Consumer Web Origin)
  {
    archetype: 'RESTRICTED_GOOGLE_CANDIDATE',
    name: 'City Dental Clinic',
    category: 'Dentist',
    country: 'US',
    websiteUrl: 'https://www.citydentalcare.com',
    phone: '+1 206 555 0122',
    adCount: 0,
    isRestricted: true,
    expectedQualification: 'BLOCKED'
  }
];
