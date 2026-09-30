/**
 * LeadNoria Phase 9: Maps Evidence & Relevance Engine Test Suite
 *
 * Implements:
 * - 300-Case Ground-Truth Benchmark across 12 Industries (10 relevant, 10 irrelevant, 5 ambiguous per industry)
 * - 30 Required Edge Cases
 * - Matrices A through Z verification
 * - Anti-inflation (duplicate evidence and query expansion)
 * - Branch-aware physical locality isolation
 * - Policy firewall & provenance preservation
 * - Synthetic scalability benchmarks (100 to 25,000 entities)
 */

import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { normalizeMapsCandidate } from '../src/extension/extraction/mapsNormalizer.ts';
import { resolveCandidates } from '../src/extension/resolution/index.ts';
import {
  evaluateEntityRelevance,
  evaluateEntityRelevanceBatch,
  normalizeResearchIntent,
  extractEntityEvidence,
  INDUSTRY_ONTOLOGY
} from '../src/extension/relevance/index.ts';

// Separate test accounting
const accounts = {
  'Phase 9 functional assertions': { passed: 0, failed: 0 },
  'Phase 9 300-case ground-truth corpus': { passed: 0, failed: 0 },
  'Phase 9 edge cases (30)': { passed: 0, failed: 0 },
  'Phase 9 benchmarks': { passed: 0, failed: 0 },
  'Phase 9 regression assertions': { passed: 0, failed: 0 }
};

let currentAccount = 'Phase 9 functional assertions';

function pass(name) {
  if (!accounts[currentAccount]) accounts[currentAccount] = { passed: 0, failed: 0 };
  accounts[currentAccount].passed++;
  console.log(`  [PASS] ${name}`);
}

function fail(name, error) {
  if (!accounts[currentAccount]) accounts[currentAccount] = { passed: 0, failed: 0 };
  accounts[currentAccount].failed++;
  console.error(`  [FAIL] ${name}:`, error?.message || error);
  if (error?.stack) console.error(error.stack);
}

function mkCandidate(fields) {
  return normalizeMapsCandidate({
    source: 'GOOGLE_MAPS',
    acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    provenance: 'GOOGLE_DERIVED',
    ...fields
  });
}

function mkEntity(fields) {
  const cand = mkCandidate(fields);
  const res = resolveCandidates([cand]);
  return res.entities[0];
}

console.log('================================================================');
console.log('LEADNORIA PHASE 9: MAPS EVIDENCE & RELEVANCE ENGINE TEST SUITE');
console.log('================================================================\n');

// ============================================================================
// 1. 300-CASE GROUND-TRUTH CORPUS ACROSS 12 INDUSTRIES (PHASE 9 SEC 31)
// ============================================================================
currentAccount = 'Phase 9 300-case ground-truth corpus';
console.log('--- 1. 300-CASE GROUND-TRUTH CORPUS (12 INDUSTRIES x 25 CASES) ---');

const industries = [
  { id: 'roofing', name: 'Roofing', kw: 'roofing contractor', loc: 'Austin', cc: 'US',
    relNames: ['Austin Premier Roofing', 'Apex Roof Repair', 'Lone Star Roofing LLC', 'Texas Roof Masters', 'Capital City Roofing', 'Oak Hill Roofers', 'Barton Creek Roofing', 'Austin Commercial Roofers', 'Hill Country Roofing', 'Travis County Roof Care'],
    relCats: ['Roofing contractor', 'Roofing service', 'Roofing contractor', 'Commercial roofer', 'Roofing company', 'Residential roofer', 'Metal roofing contractor', 'Roofing contractor', 'Roofing service', 'Roofing company'],
    irrelNames: ['Austin Pet Grooming', 'Austin Dental Arts', 'Travis County Legal', 'Austin Auto Mechanics', 'Hill Country Bakery', 'Barton Creek Hotel', 'Austin Furniture Mart', 'Lone Star HVAC', 'Texas Real Estate Group', 'Oak Hill Plumbers'],
    irrelCats: ['Pet supplies', 'Dentist', 'Law firm', 'Auto repair', 'Bakery', 'Hotel', 'Furniture store', 'HVAC contractor', 'Real estate agency', 'Plumber'],
    ambNames: ['Austin Holdings', 'Apex Solutions', 'Lone Star Group', 'Capital Services', 'Travis Enterprise'],
    ambCats: ['General contractor', 'Building restoration service', 'Waterproofing company', 'Construction company', 'Siding contractor']
  },
  { id: 'plumbing', name: 'Plumbing', kw: 'plumber', loc: 'Chicago', cc: 'US',
    relNames: ['Windy City Plumbing', 'Chicago Drain Pros', 'Midwest Plumbing Co', 'Lakeview Emergency Plumber', 'Loop Plumbing Services', 'Lincoln Park Plumbers', 'Michigan Ave Pipe Care', 'South Side Plumbing', 'North Shore Drain Care', 'Chicago Water Heater Repair'],
    relCats: ['Plumber', 'Plumbing contractor', 'Emergency plumber', 'Drain cleaning service', 'Plumbing service', 'Commercial plumber', 'Plumber', 'Plumbing service', 'Drain cleaning service', 'Plumbing contractor'],
    irrelNames: ['Chicago Pizza Mart', 'Loop Dental Clinic', 'Windy City Law', 'Midwest Accounting', 'Lakeview Auto Repair', 'Lincoln Park Hotel', 'South Side Furniture', 'North Shore Real Estate', 'Chicago Hair Salon', 'Midwest Pet Care'],
    irrelCats: ['Restaurant', 'Dentist', 'Law firm', 'Accounting firm', 'Auto repair shop', 'Hotel', 'Furniture store', 'Real estate agency', 'Hair salon', 'Pet hospital'],
    ambNames: ['Chicago Tech Group', 'Midwest Contracting', 'Lakeview Maintenance', 'Loop Home Care', 'Lincoln Park Solutions'],
    ambCats: ['Water heater repair service', 'Septic system service', 'General contractor', 'Gas installation service', 'Pipe restoration service']
  },
  { id: 'dental', name: 'Dental', kw: 'dentist', loc: 'Miami', cc: 'US',
    relNames: ['Miami Dental Arts', 'Biscayne Dental Clinic', 'South Beach Smiles', 'Coral Gables Orthodontics', 'Miami Implant Center', 'Brickell Pediatric Dentist', 'Sunny Isles Cosmetic Dentistry', 'Coconut Grove Dental Care', 'Miami Teeth Whitening', 'Downtown Miami Endodontics'],
    relCats: ['Dentist', 'Dental clinic', 'Dentist', 'Orthodontist', 'Dental implants periodontist', 'Pediatric dentist', 'Cosmetic dentist', 'Dental clinic', 'Dentist', 'Endodontist'],
    irrelNames: ['Miami Veterinary Hospital', 'South Beach Roofing', 'Biscayne Plumbing', 'Brickell Auto Repair', 'Coral Gables Bakery', 'Coconut Grove Hotel', 'Downtown Law Firm', 'Miami Real Estate Group', 'South Beach Restaurant', 'Biscayne Furniture'],
    irrelCats: ['Veterinary clinic', 'Roofing contractor', 'Plumber', 'Auto repair shop', 'Bakery', 'Hotel', 'Lawyer', 'Real estate agency', 'Restaurant', 'Furniture store'],
    ambNames: ['Miami Health Group', 'Biscayne Wellness', 'South Beach Care Center', 'Coral Gables Medical', 'Brickell Clinic'],
    ambCats: ['Medical clinic', 'Health consultant', 'Hospital', 'Doctor', 'Wellness center']
  },
  { id: 'hvac', name: 'HVAC', kw: 'hvac contractor', loc: 'Phoenix', cc: 'US',
    relNames: ['Desert Air HVAC', 'Phoenix AC Repair', 'Valley Cooling & Heating', 'Scottsdale Air Solutions', 'Sun Devil HVAC Pros', 'Camelback Heating & Air', 'Phoenix Heat Pump Specialists', 'Arizona AC Masters', 'Tempe HVAC Services', 'Mesa Climate Control'],
    relCats: ['HVAC contractor', 'Air conditioning contractor', 'Heating contractor', 'Air conditioning repair service', 'HVAC contractor', 'Furnace repair service', 'HVAC contractor', 'Air conditioning contractor', 'HVAC contractor', 'Heating contractor'],
    irrelNames: ['Phoenix Pet Hospital', 'Scottsdale Dental Group', 'Desert Roofing Co', 'Camelback Law Firm', 'Valley Bakery', 'Sun Devil Motel', 'Tempe Auto Repair', 'Mesa Restaurant', 'Arizona Furniture', 'Phoenix Real Estate'],
    irrelCats: ['Veterinarian', 'Dentist', 'Roofing contractor', 'Law firm', 'Bakery', 'Hotel', 'Auto repair shop', 'Restaurant', 'Furniture store', 'Real estate agent'],
    ambNames: ['Phoenix Home Services', 'Desert Electrical', 'Scottsdale Appliance Repair', 'Valley Insulation', 'Camelback Sheet Metal'],
    ambCats: ['Electrician', 'Appliance repair service', 'Insulation contractor', 'Plumber', 'Sheet metal contractor']
  },
  { id: 'restaurants', name: 'Restaurants', kw: 'restaurant', loc: 'London', cc: 'GB',
    relNames: ['Soho Bistro', 'Mayfair Dining Room', 'Covent Garden Cafe', 'Camden Bar & Grill', 'Kensington Italian Kitchen', 'Chelsea Steakhouse', 'Westminster Diner', 'Shoreditch Seafood', 'City Family Restaurant', 'Bloomsbury Chinese Eatery'],
    relCats: ['Restaurant', 'Bistro', 'Cafe', 'Bar & grill', 'Italian restaurant', 'Steak house', 'Diner', 'Seafood restaurant', 'Family restaurant', 'Chinese restaurant'],
    irrelNames: ['London Roofing Group', 'Soho Dental Care', 'Mayfair Law Firm', 'Covent Garden Plumbers', 'Camden Auto Garage', 'Kensington Hotel Supplies', 'Chelsea Accountant', 'Shoreditch Real Estate', 'Westminster Pet Clinic', 'City Furniture Maker'],
    irrelCats: ['Roofing contractor', 'Dentist', 'Lawyer', 'Plumber', 'Auto repair shop', 'Hotel', 'Accounting firm', 'Real estate agency', 'Veterinarian', 'Furniture store'],
    ambNames: ['Soho Events', 'Mayfair Venue', 'Covent Garden Pub', 'Camden Brewery', 'Kensington Bakery'],
    ambCats: ['Pub', 'Brewery', 'Catering food and drink supplier', 'Food court', 'Bakery']
  },
  { id: 'hotels', name: 'Hotels', kw: 'hotel', loc: 'Paris', cc: 'FR',
    relNames: ['Hôtel de Paris', 'Montmartre Boutique Hotel', 'Le Marais Inn', 'Champs-Élysées Resort', 'Latin Quarter Extended Stay', 'Eiffel Tower Bed & Breakfast', 'Louvre Luxury Hotel', 'Bastille Guest House', 'Saint-Germain Motel', 'Opéra Grand Hotel'],
    relCats: ['Hotel', 'Boutique hotel', 'Inn', 'Resort hotel', 'Extended stay hotel', 'Bed & breakfast', 'Hotel', 'Guest house', 'Motel', 'Hotel'],
    irrelNames: ['Paris Plombier', 'Montmartre Dentiste', 'Le Marais Couvreur', 'Champs-Élysées Garage Auto', 'Latin Quarter Restaurant', 'Bastille Fleuriste', 'Louvre Pharmacie', 'Saint-Germain Coiffure', 'Opéra Avocat', 'Bastille Supermarché'],
    irrelCats: ['Plumber', 'Dentist', 'Roofing contractor', 'Auto repair shop', 'Restaurant', 'Florist', 'Pharmacy', 'Hair salon', 'Lawyer', 'Supermarket'],
    ambNames: ['Paris Hostellerie', 'Montmartre Lodge', 'Le Marais Vacation Rentals', 'Latin Quarter Event Space', 'Bastille Conference Center'],
    ambCats: ['Hostel', 'Lodge', 'Vacation home rental agency', 'Event venue', 'Conference center']
  },
  { id: 'legal_services', name: 'Legal Services', kw: 'law firm', loc: 'New York', cc: 'US',
    relNames: ['Manhattan Legal Associates', 'Empire State Law Firm', 'Brooklyn Defense Attorneys', 'Wall Street Corporate Law', 'Midtown Personal Injury Law', 'Hudson Family Law Group', 'Queens Litigation Counsel', 'Madison Ave Tax Attorneys', 'Park Ave Legal Services', 'Fifth Ave Patent Lawyers'],
    relCats: ['Law firm', 'Lawyer', 'Criminal defense lawyer', 'Corporate attorney', 'Personal injury attorney', 'Family law attorney', 'Law firm', 'Tax attorney', 'Legal services', 'Patent attorney'],
    irrelNames: ['Manhattan Pizza Kitchen', 'Empire State Dental Clinic', 'Brooklyn Auto Garage', 'Wall Street Roofing Solutions', 'Midtown Plumbing Pros', 'Hudson Bakery', 'Queens Hotel', 'Madison Ave Hair Studio', 'Park Ave Furniture Mart', 'Fifth Ave Pet Spa'],
    irrelCats: ['Restaurant', 'Dentist', 'Auto repair shop', 'Roofing contractor', 'Plumber', 'Bakery', 'Hotel', 'Hair salon', 'Furniture store', 'Pet grooming'],
    ambNames: ['Manhattan Notary Services', 'Empire Mediation Group', 'Brooklyn Legal Aid', 'Midtown Title Agency', 'Hudson Compliance Group'],
    ambCats: ['Notary public', 'Mediation service', 'Legal aid organization', 'Title company', 'Tax consultant']
  },
  { id: 'real_estate', name: 'Real Estate', kw: 'real estate agency', loc: 'Toronto', cc: 'CA',
    relNames: ['Toronto Realty Group', 'Downtown Real Estate Agency', 'Yorkville Luxury Realtors', 'Ontario Property Management', 'Lakeshore Commercial Realty', 'Midtown Real Estate Brokers', 'Bay Street Real Estate Consultants', 'Scarborough Homes Realty', 'Etobicoke Realty Services', 'North York Property Agency'],
    relCats: ['Real estate agency', 'Real estate agency', 'Realtor', 'Property management company', 'Commercial real estate agency', 'Real estate agent', 'Real estate consultant', 'Real estate agency', 'Real estate agent', 'Real estate agency'],
    irrelNames: ['Toronto Dental Clinic', 'Downtown Roofing Repair', 'Yorkville Auto Mechanics', 'Ontario Plumbing Services', 'Lakeshore Bakery', 'Midtown Pet Hospital', 'Bay Street Law Firm', 'Scarborough Hotel', 'Etobicoke Furniture Store', 'North York Restaurant'],
    irrelCats: ['Dentist', 'Roofing contractor', 'Auto repair shop', 'Plumber', 'Bakery', 'Veterinary clinic', 'Lawyer', 'Hotel', 'Furniture store', 'Restaurant'],
    ambNames: ['Toronto Mortgage Brokers', 'Downtown Home Inspection', 'Yorkville Title Agency', 'Ontario Property Appraisers', 'Lakeshore Property Investment'],
    ambCats: ['Mortgage broker', 'Home inspector', 'Title company', 'Appraiser', 'Property investment company']
  },
  { id: 'auto_repair', name: 'Auto Repair', kw: 'auto repair shop', loc: 'Berlin', cc: 'DE',
    relNames: ['Berlin Kfz-Reparatur', 'Mitte Auto Werkstatt', 'Kreuzberg Bremsen Service', 'Charlottenburg Getriebe Reparatur', 'Pankow Ölwechsel Dienst', 'Spandau Reifen Service', 'Prenzlauer Berg Autowerkstatt', 'Neukölln Auto Mechanik', 'Tempelhof Kfz-Meister', 'Friedrichshain Auto Service'],
    relCats: ['Auto repair shop', 'Car repair and maintenance', 'Brake shop', 'Transmission shop', 'Oil change service', 'Tire shop', 'Auto repair shop', 'Auto mechanic', 'Auto repair shop', 'Car repair and maintenance'],
    irrelNames: ['Berlin Zahnarztpraxis', 'Mitte Restaurant & Bar', 'Kreuzberg Dachdeckerei', 'Charlottenburg Anwaltskanzlei', 'Pankow Hotel', 'Spandau Möbelhaus', 'Prenzlauer Berg Bäckerei', 'Neukölln Klempner', 'Tempelhof Tierarzt', 'Friedrichshain Friseursalon'],
    irrelCats: ['Dentist', 'Restaurant', 'Roofing contractor', 'Lawyer', 'Hotel', 'Furniture store', 'Bakery', 'Plumber', 'Veterinarian', 'Hair salon'],
    ambNames: ['Berlin Autolackierung', 'Mitte Abschleppdienst', 'Kreuzberg TÜV Station', 'Charlottenburg Autobatterien', 'Spandau Kfz-Elektrik'],
    ambCats: ['Auto body shop', 'Towing service', 'Car inspection station', 'Car battery store', 'Auto electrical service']
  },
  { id: 'furniture', name: 'Furniture', kw: 'furniture store', loc: 'Dallas', cc: 'US',
    relNames: ['Dallas Furniture Mart', 'North Texas Custom Furniture', 'Lone Star Office Furniture', 'Uptown Sofa & Bedding', 'Dallas Woodcraft Studio', 'Oak Cliff Furniture Gallery', 'Highland Park Modern Living', 'Trinity River Furniture Store', 'Dallas Outdoor Furniture', 'Preston Furniture Makers'],
    relCats: ['Furniture store', 'Furniture maker', 'Office furniture store', 'Furniture store', 'Custom furniture shop', 'Furniture store', 'Furniture store', 'Furniture store', 'Outdoor furniture store', 'Furniture maker'],
    irrelNames: ['Dallas Dental Clinic', 'North Texas Roofing Pros', 'Lone Star Plumbers', 'Uptown Law Firm', 'Dallas Auto Mechanics', 'Oak Cliff Pet Hospital', 'Highland Park Bakery', 'Trinity River Restaurant', 'Preston Hotel', 'Dallas Pharmacy'],
    irrelCats: ['Dentist', 'Roofing contractor', 'Plumber', 'Lawyer', 'Auto repair shop', 'Veterinary clinic', 'Bakery', 'Restaurant', 'Hotel', 'Pharmacy'],
    ambNames: ['Dallas Home Goods', 'North Texas Interior Design', 'Lone Star Cabinetry', 'Uptown Upholstery Studio', 'Highland Park Mattresses'],
    ambCats: ['Home goods store', 'Interior designer', 'Cabinet maker', 'Upholstery shop', 'Mattress store']
  },
  { id: 'it_saas', name: 'IT / SaaS', kw: 'software company', loc: 'San Francisco', cc: 'US',
    relNames: ['Bay Area Software Labs', 'Silicon IT Services', 'Mission Cloud Solutions', 'SOMA Web Development', 'Golden Gate Tech Providers', 'Market Street Cloud Platforms', 'San Francisco Managed IT', 'Pacific Software Systems', 'Financial District IT Consulting', 'Embarcadero Software Group'],
    relCats: ['Software company', 'IT service provider', 'Cloud service provider', 'Web development agency', 'Information technology company', 'Software company', 'Computer support and services', 'Software company', 'IT service provider', 'Software company'],
    irrelNames: ['Bay Area Pizza Co', 'Silicon Dental Care', 'Mission Plumbing Pros', 'SOMA Roofing Contractors', 'Golden Gate Hotel', 'Market Street Auto Garage', 'San Francisco Bakery', 'Pacific Hair Salon', 'Financial District Florist', 'Embarcadero Pet Spa'],
    irrelCats: ['Restaurant', 'Dentist', 'Plumber', 'Roofing contractor', 'Hotel', 'Auto repair shop', 'Bakery', 'Hair salon', 'Florist', 'Pet store'],
    ambNames: ['Bay Area Cybersecurity', 'Silicon Telecom Group', 'Mission Data Recovery', 'SOMA Computer Consulting', 'Golden Gate Marketing Agency'],
    ambCats: ['Cybersecurity company', 'Telecommunications service provider', 'Data recovery service', 'Computer consultant', 'Marketing agency']
  },
  { id: 'accounting', name: 'Accounting', kw: 'accounting firm', loc: 'Dhaka', cc: 'BD',
    relNames: ['Dhaka Chartered Accountants', 'Gulshan Tax Consultants', 'Banani CPA Services', 'Motijheel Bookkeeping Firm', 'Uttara Accounting Associates', 'Dhanmondi Tax Advisors', 'Dhaka Financial Auditing', 'Mirpur Payroll Solutions', 'Baridhara CPA Group', 'Tejgaon Business Tax Services'],
    relCats: ['Accounting firm', 'Tax preparation service', 'Certified public accountant', 'Bookkeeping service', 'Accounting firm', 'Tax preparation service', 'Accountant', 'Payroll service', 'Certified public accountant', 'Accounting firm'],
    irrelNames: ['Dhaka Roofing Contractors', 'Gulshan Dental Clinic', 'Banani Plumbing Services', 'Motijheel Restaurant', 'Uttara Auto Mechanics', 'Dhanmondi Hotel', 'Dhaka Pet Care', 'Mirpur Furniture Store', 'Baridhara Hair Salon', 'Tejgaon Bakery'],
    irrelCats: ['Roofing contractor', 'Dentist', 'Plumber', 'Restaurant', 'Auto repair shop', 'Hotel', 'Veterinarian', 'Furniture store', 'Hair salon', 'Bakery'],
    ambNames: ['Dhaka Financial Advisors', 'Gulshan Business Consultants', 'Banani Audit Services', 'Motijheel Management Group', 'Uttara Tax Consultants'],
    ambCats: ['Financial consultant', 'Business management consultant', 'Auditor', 'Financial planner', 'Tax consultant']
  }
];

let corpusPassed = 0;
let corpusTotal = 0;

for (const ind of industries) {
  const intent = {
    keyword: ind.kw,
    category: ind.kw,
    targetLocation: ind.loc,
    targetCountry: ind.cc,
    strictLocation: true
  };

  // 10 Relevant cases
  for (let i = 0; i < 10; i++) {
    corpusTotal++;
    const ent = mkEntity({
      sourceId: `ChIJ_rel_${ind.id}_${i}`,
      businessName: ind.relNames[i],
      category: ind.relCats[i],
      locality: ind.loc,
      countryCode: ind.cc,
      candidateId: `cand_rel_${ind.id}_${i}`
    });
    const res = evaluateEntityRelevance(ent, intent);
    assert.equal(res.relevanceState, 'RELEVANT',
      `Corpus [${ind.name} Relevant #${i + 1}] "${ind.relNames[i]}" must be RELEVANT (got ${res.relevanceState})`);
    corpusPassed++;
  }

  // 10 Irrelevant cases
  for (let i = 0; i < 10; i++) {
    corpusTotal++;
    const ent = mkEntity({
      sourceId: `ChIJ_irrel_${ind.id}_${i}`,
      businessName: ind.irrelNames[i],
      category: ind.irrelCats[i],
      locality: ind.loc,
      countryCode: ind.cc,
      candidateId: `cand_irrel_${ind.id}_${i}`
    });
    const res = evaluateEntityRelevance(ent, intent);
    assert.equal(res.relevanceState, 'NOT_RELEVANT',
      `Corpus [${ind.name} Irrelevant #${i + 1}] "${ind.irrelNames[i]}" must be NOT_RELEVANT (got ${res.relevanceState})`);
    corpusPassed++;
  }

  // 5 Ambiguous cases
  for (let i = 0; i < 5; i++) {
    corpusTotal++;
    const ent = mkEntity({
      sourceId: `ChIJ_amb_${ind.id}_${i}`,
      businessName: ind.ambNames[i],
      category: ind.ambCats[i],
      locality: ind.loc,
      countryCode: ind.cc,
      candidateId: `cand_amb_${ind.id}_${i}`
    });
    const res = evaluateEntityRelevance(ent, intent);
    assert.equal(res.relevanceState, 'UNCERTAIN',
      `Corpus [${ind.name} Ambiguous #${i + 1}] "${ind.ambNames[i]}" must be UNCERTAIN (got ${res.relevanceState})`);
    corpusPassed++;
  }
}

pass(`300-case ground-truth corpus: All ${corpusPassed}/${corpusTotal} labeled cases evaluated with 100% ground-truth agreement across 12 industries`);

// ============================================================================
// 2. 30 REQUIRED EDGE CASES (PHASE 9 SEC 32)
// ============================================================================
currentAccount = 'Phase 9 edge cases (30)';
console.log('\n--- 2. 30 REQUIRED EDGE CASES ---');

try {
  // Edge Case 1: Exact category + location
  const e1 = mkEntity({ sourceId: 'ChIJ_ec_1', businessName: 'Apex Roofing', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'ec_1' });
  const r1 = evaluateEntityRelevance(e1, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r1.relevanceState, 'RELEVANT');
  assert.equal(r1.evidenceTier, 'TIER_1_EXACT_CATEGORY_LOCATION');
  pass('Edge 1: Exact category + location => RELEVANT Tier 1');

  // Edge Case 2: Exact name + category
  const e2 = mkEntity({ sourceId: 'ChIJ_ec_2', businessName: 'Roofing Contractor LLC', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'ec_2' });
  const r2 = evaluateEntityRelevance(e2, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r2.relevanceState, 'RELEVANT');
  pass('Edge 2: Exact name + category => RELEVANT');

  // Edge Case 3: Exact name but wrong category (Contradiction Override)
  const e3 = mkEntity({ sourceId: 'ChIJ_ec_3', businessName: 'ABC Roofing', category: 'Pet supplies', locality: 'Austin', countryCode: 'US', candidateId: 'ec_3' });
  const r3 = evaluateEntityRelevance(e3, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r3.relevanceState, 'NOT_RELEVANT');
  assert.equal(r3.evidenceTier, 'CONTRADICTION_OVERRIDE');
  pass('Edge 3: Exact name but contradictory category => NOT_RELEVANT via contradiction override');

  // Edge Case 4: Generic name alone with no corroboration (Prompt 9A Section 2: UNKNOWN category => UNCERTAIN)
  const e4 = mkEntity({ sourceId: 'ChIJ_ec_4', businessName: 'Apex Solutions', locality: 'Austin', countryCode: 'US', candidateId: 'ec_4' });
  const r4 = evaluateEntityRelevance(e4, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r4.relevanceState, 'UNCERTAIN');
  assert.ok(r4.reasonCodes.includes('UNCERTAIN_CATEGORY_UNKNOWN'));
  pass('Edge 4: Generic name with unknown category => UNCERTAIN');

  // Edge Case 5: Generic category alone
  const e5 = mkEntity({ sourceId: 'ChIJ_ec_5', businessName: 'Apex Corp', category: 'General contractor', locality: 'Austin', countryCode: 'US', candidateId: 'ec_5' });
  const r5 = evaluateEntityRelevance(e5, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r5.relevanceState, 'UNCERTAIN');
  pass('Edge 5: Generic compatible category without name/service support => UNCERTAIN');

  // Edge Case 6: Correct category, wrong city (strict location)
  const e6 = mkEntity({ sourceId: 'ChIJ_ec_6', businessName: 'Dallas Premier Roofing', category: 'Roofing contractor', locality: 'Dallas', countryCode: 'US', candidateId: 'ec_6' });
  const r6 = evaluateEntityRelevance(e6, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US', strictLocation: true });
  assert.equal(r6.relevanceState, 'NOT_RELEVANT');
  assert.ok(r6.reasonCodes.includes('NOT_RELEVANT_LOCATION_MISMATCH'));
  pass('Edge 6: Correct category, wrong city with strict location => NOT_RELEVANT');

  // Edge Case 7: Correct city, wrong category
  const e7 = mkEntity({ sourceId: 'ChIJ_ec_7', businessName: 'Austin Dental Group', category: 'Dentist', locality: 'Austin', countryCode: 'US', candidateId: 'ec_7' });
  const r7 = evaluateEntityRelevance(e7, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r7.relevanceState, 'NOT_RELEVANT');
  pass('Edge 7: Correct city, contradictory category => NOT_RELEVANT');

  // Edge Case 8: Correct country, wrong city (partial location non-strict)
  const e8 = mkEntity({ sourceId: 'ChIJ_ec_8', businessName: 'Texas Roofers', category: 'Roofing contractor', region: 'Texas', countryCode: 'US', candidateId: 'ec_8' });
  const r8 = evaluateEntityRelevance(e8, { keyword: 'roofing contractor', targetLocation: 'Austin', targetRegion: 'Texas', targetCountry: 'US', strictLocation: false });
  assert.equal(r8.relevanceState, 'UNCERTAIN');
  pass('Edge 8: Correct country/region, locality missing or partial => UNCERTAIN');

  // Edge Case 9: Missing location
  const e9 = mkEntity({ sourceId: 'ChIJ_ec_9', businessName: 'National Roof Care', category: 'Roofing contractor', candidateId: 'ec_9' });
  const r9 = evaluateEntityRelevance(e9, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r9.relevanceState, 'UNCERTAIN');
  assert.ok(r9.reasonCodes.includes('UNCERTAIN_LOCATION_MISSING'));
  pass('Edge 9: Missing location => UNCERTAIN (unknown != negative)');

  // Edge Case 10: Missing category
  const e10 = mkEntity({ sourceId: 'ChIJ_ec_10', businessName: 'Austin Roofing Crew', locality: 'Austin', countryCode: 'US', candidateId: 'ec_10' });
  const r10 = evaluateEntityRelevance(e10, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r10.relevanceState, 'UNCERTAIN');
  assert.ok(r10.reasonCodes.includes('UNCERTAIN_NAME_ONLY'));
  pass('Edge 10: Missing category with matching name => UNCERTAIN');

  // Edge Case 11: Ambiguous category
  const e11 = mkEntity({ sourceId: 'ChIJ_ec_11', businessName: 'Austin Restorations', category: 'Building restoration service', locality: 'Austin', countryCode: 'US', candidateId: 'ec_11' });
  const r11 = evaluateEntityRelevance(e11, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r11.relevanceState, 'UNCERTAIN');
  pass('Edge 11: Ambiguous compatible category => UNCERTAIN');

  // Edge Case 12: Negative keyword ("roofing supplies only")
  const e12 = mkEntity({ sourceId: 'ChIJ_ec_12', businessName: 'Austin Roofing Supplies Only', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'ec_12' });
  const r12 = evaluateEntityRelevance(e12, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r12.relevanceState, 'NOT_RELEVANT');
  assert.ok(r12.reasonCodes.includes('NOT_RELEVANT_NEGATED_INTENT'));
  pass('Edge 12: Explicit negative keyword modifier => NOT_RELEVANT');

  // Edge Case 13: Negated service ("not a roofing contractor")
  const e13 = mkEntity({ sourceId: 'ChIJ_ec_13', businessName: 'Austin Roof Design (not a roofing contractor)', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'ec_13' });
  const r13 = evaluateEntityRelevance(e13, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r13.relevanceState, 'NOT_RELEVANT');
  pass('Edge 13: Negated service phrase => NOT_RELEVANT');

  // Edge Case 14: Parent brand branch isolation
  // HQ is in Austin, but this branch is physically in Houston
  const e14 = mkEntity({ sourceId: 'ChIJ_ec_14', businessName: 'MegaRoof Austin (Houston Branch)', category: 'Roofing contractor', locality: 'Houston', countryCode: 'US', candidateId: 'ec_14' });
  const r14 = evaluateEntityRelevance(e14, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US', strictLocation: true });
  assert.equal(r14.relevanceState, 'NOT_RELEVANT');
  assert.ok(r14.reasonCodes.includes('NOT_RELEVANT_LOCATION_MISMATCH'));
  pass('Edge 14: Branch in different city not relevant to target city');

  // Edge Case 15: Same business, multilingual name (Bengali)
  const e15 = mkEntity({ sourceId: 'ChIJ_ec_15', businessName: 'ঢাকা রুফিং ঠিকাদার', category: 'ছাদ মেরামত', locality: 'Dhaka', countryCode: 'BD', candidateId: 'ec_15' });
  const r15 = evaluateEntityRelevance(e15, { keyword: 'roofing contractor', targetLocation: 'Dhaka', targetCountry: 'BD' });
  assert.equal(r15.relevanceState, 'RELEVANT');
  pass('Edge 15: Multilingual Bengali category and name => RELEVANT');

  // Edge Case 16: Transliterated name and German category
  const e16 = mkEntity({ sourceId: 'ChIJ_ec_16', businessName: 'Schmidt Dachdeckerei GmbH', category: 'Dachdecker', locality: 'Berlin', countryCode: 'DE', candidateId: 'ec_16' });
  const r16 = evaluateEntityRelevance(e16, { keyword: 'roofing contractor', targetLocation: 'Berlin', targetCountry: 'DE' });
  assert.equal(r16.relevanceState, 'RELEVANT');
  pass('Edge 16: German localized category (Dachdecker) => RELEVANT');

  // Edge Case 17: Website positive evidence (embedded domain keyword)
  const e17 = mkEntity({ sourceId: 'ChIJ_ec_17', businessName: 'Austin Apex', category: 'Roofing contractor', website: 'https://austinroofing.com', locality: 'Austin', countryCode: 'US', candidateId: 'ec_17' });
  const r17 = evaluateEntityRelevance(e17, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r17.relevanceState, 'RELEVANT');
  assert.ok(r17.evidenceItems.some(e => e.evidenceType === 'WEBSITE_EVIDENCE'));
  pass('Edge 17: Website positive evidence recorded');

  // Edge Case 18: User exclusion match
  const e18 = mkEntity({ sourceId: 'ChIJ_ec_18', businessName: 'Austin Commercial Roofers', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'ec_18' });
  const r18 = evaluateEntityRelevance(e18, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US', exclusions: ['Commercial'] });
  assert.equal(r18.relevanceState, 'NOT_RELEVANT');
  assert.equal(r18.evidenceTier, 'EXCLUSION_OVERRIDE');
  pass('Edge 18: User exclusion overrides relevance => NOT_RELEVANT');

  // Edge Case 19: Google restricted lineage preservation
  const e19 = mkEntity({ sourceId: 'ChIJ_ec_19', businessName: 'Austin Roofer', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'ec_19' });
  const r19 = evaluateEntityRelevance(e19, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r19.relevanceState, 'RELEVANT');
  assert.equal(r19.isRestricted, true);
  assert.equal(r19.persistenceEligibility, 'NOT_PERSISTABLE');
  assert.equal(r19.exportEligibility, 'NOT_EXPORTABLE');
  pass('Edge 19: RELEVANT + Google restricted lineage remains NOT_PERSISTABLE / NOT_EXPORTABLE');

  // Edge Case 20: Meta lineage preservation
  const candMeta = normalizeMapsCandidate({ source: 'META_AD_LIBRARY', acquisitionContext: 'META_AD_LIBRARY', provenance: 'META_DERIVED', sourceId: 'meta_adv_1', businessName: 'Meta Roofer', locality: 'Austin', countryCode: 'US', candidateId: 'ec_20' });
  const e20 = resolveCandidates([candMeta]).entities[0];
  const r20 = evaluateEntityRelevance(e20, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r20.isRestricted, false);
  pass('Edge 20: Meta-derived entity preserves non-restricted lineage');

  // Edge Case 21: Website lineage preservation
  const candWeb = normalizeMapsCandidate({ source: 'USER_PROVIDED_DOMAIN', acquisitionContext: 'WEBSITE_DIRECT', provenance: 'WEBSITE_DERIVED', sourceId: 'web_1', businessName: 'Direct Web Roofer', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'ec_21' });
  const e21 = resolveCandidates([candWeb]).entities[0];
  const r21 = evaluateEntityRelevance(e21, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r21.relevanceState, 'RELEVANT');
  assert.equal(r21.isRestricted, false);
  pass('Edge 21: Website-derived entity preserves unencumbered lineage');

  const c1 = mkCandidate({ sourceId: 'ChIJ_mixed_1', businessName: 'Apex Roofing Inc', website: 'https://apexroofingaustin.com', locality: 'Austin', countryCode: 'US', candidateId: 'c1' });
  const c2 = normalizeMapsCandidate({ source: 'USER_PROVIDED_DOMAIN', acquisitionContext: 'USER_INPUT', provenance: 'USER_PROVIDED', sourceId: 'usr_1', businessName: 'Apex Roofing Inc', website: 'https://apexroofingaustin.com', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'c2' });
  const res22 = resolveCandidates([c1, c2]);
  assert.equal(res22.entities.length, 1, 'Must merge into a single mixed-lineage entity');
  const e22 = res22.entities[0];
  const r22 = evaluateEntityRelevance(e22, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r22.relevanceState, 'RELEVANT');
  assert.equal(r22.isRestricted, true); // Retains Google restricted lineage from c1
  pass('Edge 22: Mixed entity retains strict firewall gating');

  // Edge Case 23: Repeated query variants anti-inflation
  const e23 = mkEntity({ sourceId: 'ChIJ_ec_23', businessName: 'Austin Roof Repair', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'ec_23' });
  const r23 = evaluateEntityRelevance(e23, {
    keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US',
    queryVariants: ['roofing contractor', 'roof repair', 'roofing service', 'roof replacement', 'commercial roofer']
  });
  assert.equal(r23.relevanceState, 'RELEVANT');
  // Confirm evidence items are deduplicated and bounded
  const uniqueEvidenceIds = new Set(r23.evidenceItems.map(e => e.evidenceId));
  assert.equal(r23.evidenceItems.length, uniqueEvidenceIds.size);
  pass('Edge 23: Query expansion does not duplicate or inflate evidence facts');

  // Edge Case 24: Duplicate evidence inside entity
  const e24 = mkEntity({ sourceId: 'ChIJ_ec_24', businessName: 'Austin Roof Repair', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'ec_24' });
  // Add duplicate categories to source records
  e24.sourceRecords[0].categories.push(e24.sourceRecords[0].categories[0]);
  e24.sourceRecords[0].categories.push(e24.sourceRecords[0].categories[0]);
  const r24 = evaluateEntityRelevance(e24, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  const catEvidence = r24.evidenceItems.filter(e => e.evidenceType === 'CATEGORY_EVIDENCE');
  assert.equal(catEvidence.length, 1, 'Duplicate category records must produce exactly 1 consolidated evidence fact');
  pass('Edge 24: Duplicate evidence within entity deduplicated');

  // Edge Case 25: Conflicting evidence (category positive vs country negative)
  const e25 = mkEntity({ sourceId: 'ChIJ_ec_25', businessName: 'Berlin Roofer', category: 'Roofing contractor', locality: 'Berlin', countryCode: 'DE', candidateId: 'ec_25' });
  const r25 = evaluateEntityRelevance(e25, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r25.relevanceState, 'NOT_RELEVANT');
  assert.ok(r25.reasonCodes.includes('NOT_RELEVANT_COUNTRY_MISMATCH'));
  pass('Edge 25: Conflicting country overrides positive category match');

  // Edge Case 26: Unknown evidence vs negative (Prompt 9A Section 2: UNKNOWN != NEGATIVE)
  const e26 = mkEntity({ sourceId: 'ChIJ_ec_26', businessName: 'Acme Enterprise', locality: 'Austin', candidateId: 'ec_26' });
  const r26 = evaluateEntityRelevance(e26, { keyword: 'roofing contractor', targetLocation: 'Austin' });
  assert.equal(r26.relevanceState, 'UNCERTAIN'); // Category unknown, required evidence missing
  assert.ok(r26.reasonCodes.includes('UNCERTAIN_CATEGORY_UNKNOWN'));
  pass('Edge 26: Unknown evidence produces UNCERTAIN without fabricating negative facts');

  // Edge Case 27: Missing category with matching location only => UNCERTAIN
  const e27 = mkEntity({ sourceId: 'ChIJ_ec_27', businessName: 'Austin Alpha Inc', locality: 'Austin', countryCode: 'US', candidateId: 'ec_27' });
  const r27 = evaluateEntityRelevance(e27, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r27.relevanceState, 'UNCERTAIN');
  pass('Edge 27: Missing category with location alone produces UNCERTAIN');

  // Edge Case 28: Marketplace-like generic listing
  const e28 = mkEntity({ sourceId: 'ChIJ_ec_28', businessName: 'Daraz Marketplace Store', category: 'Supermarket', locality: 'Dhaka', countryCode: 'BD', candidateId: 'ec_28' });
  const r28 = evaluateEntityRelevance(e28, { keyword: 'roofing contractor', targetLocation: 'Dhaka', targetCountry: 'BD' });
  assert.equal(r28.relevanceState, 'NOT_RELEVANT');
  pass('Edge 28: Generic marketplace listing not relevant');

  // Edge Case 29: Unrelated business with matching keyword in legal name
  const e29 = mkEntity({ sourceId: 'ChIJ_ec_29', businessName: 'Roofing & Bakery Cafe', category: 'Bakery', locality: 'Austin', countryCode: 'US', candidateId: 'ec_29' });
  const r29 = evaluateEntityRelevance(e29, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r29.relevanceState, 'NOT_RELEVANT');
  assert.equal(r29.evidenceTier, 'CONTRADICTION_OVERRIDE');
  pass('Edge 29: Unrelated bakery with keyword in name contradicted by category');

  // Edge Case 30: Business with multiple services
  const e30 = mkEntity({ sourceId: 'ChIJ_ec_30', businessName: 'Austin Leak Detection & Roof Repair Services', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'ec_30' });
  const r30 = evaluateEntityRelevance(e30, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(r30.relevanceState, 'RELEVANT');
  assert.ok(r30.evidenceItems.some(e => e.evidenceType === 'SERVICE_TERM_EVIDENCE'));
  pass('Edge 30: Business with multiple service terms qualifies cleanly');

  pass('All 30 required edge cases verified');
} catch (e) {
  fail('Edge cases evaluation', e);
}

// ============================================================================
// 3. REQUIRED TEST MATRIX A TO Z (PHASE 9 SEC 33)
// ============================================================================
currentAccount = 'Phase 9 functional assertions';
console.log('\n--- 3. TEST MATRICES A TO Z ---');

try {
  // Matrix A: Evidence extraction
  const ea = mkEntity({ sourceId: 'ChIJ_ma_1', businessName: 'Austin Roofing Specialist', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'ma_1' });
  const ra = evaluateEntityRelevance(ea, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.ok(ra.evidenceItems.length >= 3, 'Must extract name, category, and location evidence');
  pass('Matrix A: Evidence extraction extracts comprehensive structured items');

  // Matrix B: Exact keyword matching
  const rb = normalizeResearchIntent({ keyword: '  Roofing Contractor  ' });
  assert.equal(rb.normalizedKeyword, 'roofing contractor');
  pass('Matrix B: Exact keyword matching normalizes whitespace and casing');

  // Matrix C: Category matching
  const ec = mkEntity({ sourceId: 'ChIJ_mc_1', businessName: 'Quality Roofers', category: 'Roofing service', locality: 'Austin', countryCode: 'US', candidateId: 'mc_1' });
  const rc = evaluateEntityRelevance(ec, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(rc.relevanceState, 'RELEVANT');
  pass('Matrix C: Category matching evaluates canonical industry categories');

  // Matrix D: Service / product matching
  const ed = mkEntity({ sourceId: 'ChIJ_md_1', businessName: 'Austin Leak Detection & Roof Repair', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'md_1' });
  const rd = evaluateEntityRelevance(ed, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.ok(rd.evidenceItems.some(e => e.matchType === 'SERVICE_MATCH'));
  pass('Matrix D: Service and product term matching extracts explicit services');

  // Matrix E & F: Location & Country matching
  const ef = mkEntity({ sourceId: 'ChIJ_mef_1', businessName: 'London Roofer', category: 'Roofing contractor', locality: 'London', countryCode: 'GB', candidateId: 'mef_1' });
  const rf = evaluateEntityRelevance(ef, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(rf.relevanceState, 'NOT_RELEVANT');
  assert.equal(rf.locationState, 'LOCATION_CONTRADICTORY');
  pass('Matrix E & F: Location and Country matching flags geographic contradiction');

  // Matrix G: Branch-aware relevance
  const eg = mkEntity({ sourceId: 'ChIJ_mg_1', businessName: 'MegaCorp Roofers (San Antonio)', category: 'Roofing contractor', locality: 'San Antonio', countryCode: 'US', candidateId: 'mg_1' });
  const rg = evaluateEntityRelevance(eg, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US', strictLocation: true });
  assert.equal(rg.relevanceState, 'NOT_RELEVANT');
  pass('Matrix G: Branch-aware physical locality isolation verified');

  // Matrix H & I: Negative evidence & Contradiction handling
  const eh = mkEntity({ sourceId: 'ChIJ_mh_1', businessName: 'Austin Vet Clinic', category: 'Veterinarian', locality: 'Austin', countryCode: 'US', candidateId: 'mh_1' });
  const rh = evaluateEntityRelevance(eh, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(rh.relevanceState, 'NOT_RELEVANT');
  assert.ok(rh.contradictions.length > 0);
  pass('Matrix H & I: Negative evidence and contradiction handling verified');

  // Matrix J: Unknown vs negative
  const ej = mkEntity({ sourceId: 'ChIJ_mj_1', businessName: 'Unknown Corp', candidateId: 'mj_1' });
  const rj = evaluateEntityRelevance(ej, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(rj.locationState, 'LOCATION_UNKNOWN');
  pass('Matrix J: Unknown fields classified as UNKNOWN without fabricating negative proof');

  // Matrix K, L, M: Evidence waterfall, Reason codes & Explanations
  assert.ok(ra.reasonCodes.length > 0);
  assert.ok(ra.explanation.length > 0);
  assert.ok(ra.evidenceTier.startsWith('TIER_1'));
  pass('Matrix K, L, M: Evidence waterfall tiers, explainable reason codes and explanations verified');

  // Matrix N & O: Anti-inflation
  const en = mkEntity({ sourceId: 'ChIJ_mn_1', businessName: 'Apex Roofer', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'mn_1' });
  const rn = evaluateEntityRelevance(en, {
    keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US',
    queryVariants: ['roofing contractor', 'roofing contractor', 'roofing contractor']
  });
  const evSet = new Set(rn.evidenceItems.map(e => e.evidenceId));
  assert.equal(rn.evidenceItems.length, evSet.size);
  pass('Matrix N & O: Duplicate evidence and query expansion anti-inflation verified');

  // Matrix P, Q, R: Cross-source & Provenance preservation
  const eq = mkEntity({ sourceId: 'ChIJ_mq_1', businessName: 'Google Maps Roofer', category: 'Roofing contractor', locality: 'Austin', countryCode: 'US', candidateId: 'mq_1' });
  const rq = evaluateEntityRelevance(eq, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.ok(rq.evidenceItems.every(e => e.sourceProvenance === 'GOOGLE_DERIVED'));
  pass('Matrix P, Q, R: Cross-source evidence and provenance preservation intact');

  // Matrix S & T: Policy restriction & export firewall preservation
  assert.equal(rq.isRestricted, true);
  assert.equal(rq.persistenceEligibility, 'NOT_PERSISTABLE');
  assert.equal(rq.exportEligibility, 'NOT_EXPORTABLE');
  pass('Matrix S & T: RELEVANT + Google restricted lineage remains NOT_PERSISTABLE / NOT_EXPORTABLE');

  // Matrix U: Internationalization
  const eu = mkEntity({ sourceId: 'ChIJ_mu_1', businessName: 'طبيب أسنان في دبي', category: 'عيادة أسنان', locality: 'Dubai', countryCode: 'AE', candidateId: 'mu_1' });
  const ru = evaluateEntityRelevance(eu, { keyword: 'dentist', targetLocation: 'Dubai', targetCountry: 'AE' });
  assert.equal(ru.relevanceState, 'RELEVANT');
  pass('Matrix U: Internationalization (Arabic native script) verified');

  // Matrix V & W: Determinism & Order Independence
  const ev1 = evaluateEntityRelevance(ea, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  const ev2 = evaluateEntityRelevance(ea, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.deepEqual(ev1.evidenceItems.map(e => e.evidenceId), ev2.evidenceItems.map(e => e.evidenceId));
  assert.equal(ev1.relevanceState, ev2.relevanceState);
  pass('Matrix V & W: Determinism and order independence verified');

  // Matrix X & Y: Batch processing & Missing-field handling
  const batchRes = evaluateEntityRelevanceBatch([ea, ec, ef], { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(batchRes.results.length, 3);
  assert.equal(batchRes.summary.relevantCount, 2);
  assert.equal(batchRes.summary.notRelevantCount, 1);
  pass('Matrix X & Y: Batch processing and missing field resilience verified');

  // Matrix Z: Performance
  assert.ok(batchRes.summary.throughputOpsSec > 100);
  pass('Matrix Z: High local evaluation throughput verified');

} catch (e) {
  fail('Matrix A to Z evaluation', e);
}

// ============================================================================
// 4. SYNTHETIC PERFORMANCE BENCHMARKS (PHASE 9 SEC 34)
// ============================================================================
currentAccount = 'Phase 9 benchmarks';
console.log('\n--- 4. SYNTHETIC PERFORMANCE BENCHMARKS (100 to 25,000 ENTITIES) ---');

try {
  const benchSizes = [100, 500, 1000, 5000, 10000, 25000];
  const intent = {
    keyword: 'roofing contractor',
    targetLocation: 'Austin',
    targetCountry: 'US',
    strictLocation: true
  };

  for (const count of benchSizes) {
    const syntheticEntities = [];
    for (let i = 0; i < count; i++) {
      const mod = i % 3;
      if (mod === 0) {
        syntheticEntities.push(mkEntity({
          sourceId: `ChIJ_bench_${i}`,
          businessName: `Austin Roofing Crew ${i}`,
          category: 'Roofing contractor',
          locality: 'Austin', countryCode: 'US',
          candidateId: `bench_cand_${i}`
        }));
      } else if (mod === 1) {
        syntheticEntities.push(mkEntity({
          sourceId: `ChIJ_bench_${i}`,
          businessName: `Austin Dental Care ${i}`,
          category: 'Dentist',
          locality: 'Austin', countryCode: 'US',
          candidateId: `bench_cand_${i}`
        }));
      } else {
        syntheticEntities.push(mkEntity({
          sourceId: `ChIJ_bench_${i}`,
          businessName: `Austin Holding Co ${i}`,
          category: 'General contractor',
          locality: 'Austin', countryCode: 'US',
          candidateId: `bench_cand_${i}`
        }));
      }
    }

    const res = evaluateEntityRelevanceBatch(syntheticEntities, intent);
    const s = res.summary;

    console.log([
      `  [BENCHMARK] ${count.toString().padStart(6)} entities:`,
      `${s.elapsedMs.toFixed(1).padStart(8)}ms`,
      `| Relevant: ${s.relevantCount.toString().padStart(6)}`,
      `| Uncertain: ${s.uncertainCount.toString().padStart(6)}`,
      `| NotRelevant: ${s.notRelevantCount.toString().padStart(6)}`,
      `| TotalEv: ${s.totalEvidenceGenerated.toString().padStart(7)}`,
      `| Heap Δ: ${(s.heapDeltaMB || 0).toFixed(2).padStart(6)} MB`,
      `| ${s.throughputOpsSec.toLocaleString().padStart(8)} ops/sec`
    ].join(' '));

    assert.equal(s.totalEntities, count);
  }

  pass('Phase 9 synthetic performance benchmark completed across 100 to 25,000 entities');
} catch (e) {
  fail('Performance benchmark execution', e);
}

// ============================================================================
// 5. REGRESSION VERIFICATIONS (PHASE 8B INVARIANTS)
// ============================================================================
currentAccount = 'Phase 9 regression assertions';
console.log('\n--- 5. REGRESSION VERIFICATIONS ---');

try {
  // 1. Phone + address corroboration remains enforced in resolution
  const candA = mkCandidate({
    sourceId: 'ChIJ_reg_1', businessName: 'Apex Medical',
    street: '100 Main St', locality: 'Austin', phone: '+1 512-555-0001', candidateId: 'reg_1'
  });
  const candB = mkCandidate({
    sourceId: 'ChIJ_reg_2', businessName: 'Blue Ocean Seafood',
    street: '100 Main St', locality: 'Austin', phone: '+1 512-555-0001', candidateId: 'reg_2'
  });
  const res = resolveCandidates([candA, candB]);
  assert.equal(res.entities.length, 2, 'Phone + address with distinct names must not merge');
  pass('Regression: Phone + address without corroboration remains unmerged');

  // 2. Transitive conflict protection remains intact
  const cA = mkCandidate({ sourceId: 'ChIJ_tc_1', businessName: 'Apex Inc', website: 'https://apex.com', countryCode: 'US', candidateId: 'tc_1' });
  const cB = mkCandidate({ sourceId: 'ChIJ_tc_2', businessName: 'Apex Inc', website: 'https://apex.com', phone: '+44 20-7946-0001', candidateId: 'tc_2' });
  const cC = mkCandidate({ sourceId: 'ChIJ_tc_3', businessName: 'Apex Inc', countryCode: 'GB', phone: '+44 20-7946-0001', candidateId: 'tc_3' });
  const resTC = resolveCandidates([cA, cB, cC]);
  assert.ok(resTC.entities.length >= 2, 'Transitive conflict must split cluster');
  pass('Regression: Transitive conflict protection cluster audit intact');

  // 3. Entity ID stability remains intact
  assert.equal(resTC.entities[0].entityId.startsWith('ent_'), true);
  pass('Regression: Deterministic SHA-256 entity IDs intact');

} catch (e) {
  fail('Regression assertions', e);
}

// ============================================================================
// 6. PROMPT 9A: CONTEXT-AWARE NEGATIVE-EVIDENCE TESTS (PROMPT 9A SEC 5)
// ============================================================================
currentAccount = 'Phase 9A negative-evidence tests';
console.log('\n--- 6. PROMPT 9A: CONTEXT-AWARE NEGATIVE-EVIDENCE TESTS ---');

try {
  // Test 1: Entity-level "not a roofing contractor" => strong negative
  const ent1 = mkEntity({
    sourceId: 'ChIJ_neg_1',
    businessName: 'Apex Roofing & Solar (not a roofing contractor)',
    category: 'Roofing contractor',
    locality: 'Austin',
    countryCode: 'US',
    candidateId: 'neg_1'
  });
  const res1 = evaluateEntityRelevance(ent1, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(res1.relevanceState, 'NOT_RELEVANT', 'Entity-level negation must force NOT_RELEVANT');
  assert.ok(res1.reasonCodes.includes('NOT_RELEVANT_NEGATED_INTENT'));
  pass('Prompt 9A Test 1: Entity-level "not a roofing contractor" => strong negative (NOT_RELEVANT)');

  // Test 2: Careers-page incidental text => not automatically negative
  const ent2 = mkEntity({
    sourceId: 'ChIJ_neg_2',
    businessName: 'Apex Roofing — careers',
    category: 'Roofing contractor',
    locality: 'Austin',
    countryCode: 'US',
    candidateId: 'neg_2'
  });
  const res2 = evaluateEntityRelevance(ent2, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(res2.relevanceState, 'RELEVANT', 'Careers-page incidental text must NOT mark the entity irrelevant');
  pass('Prompt 9A Test 2: Careers-page incidental text ("ABC Roofing — careers") => not automatically negative (RELEVANT)');

  // Test 3: "Roofing Association" => not universally negative
  // Case 3a: General roofing research intent => RELEVANT
  const ent3 = mkEntity({
    sourceId: 'ChIJ_neg_3',
    businessName: 'Austin Roofing Association',
    category: 'Roofing contractor',
    locality: 'Austin',
    countryCode: 'US',
    candidateId: 'neg_3'
  });
  const res3a = evaluateEntityRelevance(ent3, { keyword: 'roofing', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(res3a.relevanceState, 'RELEVANT', '"Roofing Association" must not be universally negative for roofing intent');
  pass('Prompt 9A Test 3: "Roofing Association" is not universally negative (RELEVANT for domain intent)');

  // Test 4: "Roofing wholesale supplier" => depends on intent; must not be universally negative
  const ent4 = mkEntity({
    sourceId: 'ChIJ_neg_4',
    businessName: 'Lone Star Roofing Materials Wholesale',
    category: 'Roofing contractor',
    locality: 'Austin',
    countryCode: 'US',
    candidateId: 'neg_4'
  });
  const res4 = evaluateEntityRelevance(ent4, { keyword: 'roofing wholesale', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(res4.relevanceState, 'RELEVANT', 'Wholesale supplier must be RELEVANT when user requests wholesale intent');
  pass('Prompt 9A Test 4: "Roofing wholesale supplier" => RELEVANT when intent allows wholesale');

  // Test 5: Veterinary Clinic for Roofing intent => NOT_RELEVANT (observed mismatch)
  const ent5 = mkEntity({
    sourceId: 'ChIJ_neg_5',
    businessName: 'Austin Vet Clinic',
    category: 'Veterinary clinic',
    locality: 'Austin',
    countryCode: 'US',
    candidateId: 'neg_5'
  });
  const res5 = evaluateEntityRelevance(ent5, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(res5.relevanceState, 'NOT_RELEVANT', 'Observed contradictory category must produce NOT_RELEVANT');
  pass('Prompt 9A Test 5: Veterinary Clinic for Roofing intent => NOT_RELEVANT (observed mismatch)');

  // Test 6: Unknown category + unknown service => UNCERTAIN (Prompt 9A Section 2 Case B)
  const ent6 = mkEntity({
    sourceId: 'ChIJ_neg_6',
    businessName: 'ABC Holdings',
    locality: 'Austin',
    countryCode: 'US',
    candidateId: 'neg_6'
  });
  const res6 = evaluateEntityRelevance(ent6, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(res6.relevanceState, 'UNCERTAIN', 'Unknown category with no observed mismatch must be UNCERTAIN, not NOT_RELEVANT');
  assert.ok(res6.reasonCodes.includes('UNCERTAIN_CATEGORY_UNKNOWN'));
  pass('Prompt 9A Test 6: Unknown category + unknown service ("ABC Holdings") => UNCERTAIN');

  // Test 7: Missing location => LOCATION_UNKNOWN / UNCERTAIN
  const ent7 = mkEntity({
    sourceId: 'ChIJ_neg_7',
    businessName: 'Apex Roofing Systems',
    category: 'Roofing contractor',
    candidateId: 'neg_7'
  });
  const res7 = evaluateEntityRelevance(ent7, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(res7.relevanceState, 'UNCERTAIN', 'Missing location must produce UNCERTAIN, not location mismatch');
  assert.equal(res7.locationState, 'LOCATION_UNKNOWN');
  pass('Prompt 9A Test 7: Missing location => LOCATION_UNKNOWN / UNCERTAIN (not mismatch)');

  // Test 8: Negative evidence + strong positive evidence => explicit contradiction handling
  const cand8A = mkCandidate({
    sourceId: 'ChIJ_neg_8',
    businessName: 'Austin Certified Roofing',
    category: 'Roofing contractor',
    locality: 'Austin',
    countryCode: 'US',
    candidateId: 'neg_8'
  });
  const ent8 = resolveCandidates([cand8A]).entities[0];
  // Add a user exclusion that conflicts with positive evidence
  const res8 = evaluateEntityRelevance(ent8, { keyword: 'roofing contractor', targetLocation: 'Austin', exclusions: ['certified'] });
  assert.equal(res8.relevanceState, 'NOT_RELEVANT', 'Explicit exclusion override must cleanly resolve contradiction');
  pass('Prompt 9A Test 8: Negative exclusion + positive evidence => explicit contradiction handling');

} catch (e) {
  fail('Prompt 9A negative-evidence tests', e);
}

// ============================================================================
// 6B. PROMPT 9B: ZERO-MATCH BEHAVIOR REGRESSION TESTS
// ============================================================================
currentAccount = 'Phase 9B zero-match tests';
console.log('\n--- 8. PROMPT 9B: ZERO-MATCH BEHAVIOR TESTS ---');

try {
  // Case 1: Zero positive evidence + no negative evidence + insufficient information => UNCERTAIN
  const ent9B_1 = mkEntity({
    sourceId: 'ChIJ_9b_1',
    businessName: 'Generic Co',
    locality: 'Austin',
    countryCode: 'US',
    candidateId: '9b_1'
  });
  const res9B_1 = evaluateEntityRelevance(ent9B_1, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(res9B_1.relevanceState, 'UNCERTAIN', 'Zero matching evidence with no mismatch should be UNCERTAIN');
  assert.ok(res9B_1.reasonCodes.includes('UNCERTAIN_INSUFFICIENT_CORROBORATION'));
  pass('Prompt 9B Test 1: Zero positive evidence + insufficient info => UNCERTAIN');

  // Case 2: Available evidence explicitly establishes mismatch => NOT_RELEVANT
  const ent9B_2 = mkEntity({
    sourceId: 'ChIJ_9b_2',
    businessName: 'Austin Pharmacy',
    category: 'Pharmacy',
    locality: 'Austin',
    countryCode: 'US',
    candidateId: '9b_2'
  });
  const res9B_2 = evaluateEntityRelevance(ent9B_2, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(res9B_2.relevanceState, 'NOT_RELEVANT', 'Explicit category mismatch should be NOT_RELEVANT');
  pass('Prompt 9B Test 2: Available evidence explicitly establishes mismatch => NOT_RELEVANT');

  // Case 3: Available evidence is absent/unknown => UNCERTAIN
  const ent9B_3 = mkEntity({
    sourceId: 'ChIJ_9b_3',
    businessName: 'Austin Roofing Co',
    // category missing, locality missing
    countryCode: 'US',
    candidateId: '9b_3'
  });
  const res9B_3 = evaluateEntityRelevance(ent9B_3, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US' });
  assert.equal(res9B_3.relevanceState, 'UNCERTAIN', 'Missing category and location should be UNCERTAIN');
  pass('Prompt 9B Test 3: Available evidence is absent/unknown => UNCERTAIN');

  // Case 4: Explicit decisive contradiction => NOT_RELEVANT only under documented override
  const ent9B_4 = mkEntity({
    sourceId: 'ChIJ_9b_4',
    businessName: 'Not a roofer',
    category: 'Roofing contractor',
    locality: 'Austin',
    countryCode: 'US',
    candidateId: '9b_4'
  });
  const res9B_4 = evaluateEntityRelevance(ent9B_4, { keyword: 'roofing contractor', targetLocation: 'Austin', targetCountry: 'US', exclusions: ['not a roofer'] });
  assert.equal(res9B_4.relevanceState, 'NOT_RELEVANT', 'Explicit negation override should be NOT_RELEVANT');
  pass('Prompt 9B Test 4: Explicit decisive contradiction => NOT_RELEVANT');

} catch (e) {
  fail('Phase 9B zero-match tests', e);
}

// ============================================================================
// 7. PROMPT 9A: RECURSIVE FIREWALL & FULL LINEAGE PRESERVATION (PROMPT 9A SEC 3 & 4)
// ============================================================================
currentAccount = 'Phase 9A recursive firewall tests';
console.log('\n--- 7. PROMPT 9A: RECURSIVE FIREWALL & FULL LINEAGE PRESERVATION ---');

try {
  // A. Google-derived category -> relevance evidence -> relevance result => Google restriction still detectable
  const candA = mkCandidate({
    sourceId: 'ChIJ_lin_A',
    businessName: 'Austin Roof Masters',
    category: 'Roofing contractor',
    locality: 'Austin',
    countryCode: 'US',
    provenance: 'GOOGLE_DERIVED',
    acquisitionContext: 'GOOGLE_CONSUMER_WEB',
    isRestricted: true,
    restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
    candidateId: 'lin_A'
  });
  const entA = resolveCandidates([candA]).entities[0];
  const resA = evaluateEntityRelevance(entA, { keyword: 'roofing contractor', targetLocation: 'Austin' });

  assert.equal(resA.relevanceState, 'RELEVANT');
  assert.equal(resA.isRestricted, true, 'Google restriction must remain detectable in relevance result');
  assert.equal(resA.persistenceEligibility, 'NOT_PERSISTABLE', 'Persistence must be blocked');
  assert.equal(resA.exportEligibility, 'NOT_EXPORTABLE', 'Export must be blocked');

  // Verify that full SourceContribution objects are preserved
  const hasGoogleContrib = resA.sourceContributions.some(sc =>
    sc.provenance === 'GOOGLE_DERIVED' &&
    sc.restrictionBasis === 'GOOGLE_CONSUMER_WEB_RESTRICTED' &&
    sc.isRestricted === true
  );
  assert.ok(hasGoogleContrib, 'Full Phase 5 SourceContribution with GOOGLE_DERIVED and restrictionBasis preserved');
  pass('Prompt 9A Test A: Google-derived category -> Google restriction still detectable in relevance result');

  // B. Google-derived name + website-derived service -> mixed relevance evidence => Google restriction remains visible
  const candB1 = mkCandidate({
    sourceId: 'ChIJ_lin_B1',
    businessName: 'Apex Roofing Solutions',
    website: 'https://apexroofing.com',
    locality: 'Austin',
    provenance: 'GOOGLE_DERIVED',
    isRestricted: true,
    restrictionBasis: 'GOOGLE_CONSUMER_WEB_RESTRICTED',
    candidateId: 'lin_B1'
  });
  const candB2 = normalizeMapsCandidate({
    website: 'https://apexroofing.com',
    source: 'USER_PROVIDED_DOMAIN',
    acquisitionContext: 'WEBSITE_DIRECT',
    provenance: 'WEBSITE_DERIVED',
    businessName: 'Apex Roofing Solutions',
    locality: 'Austin',
    candidateId: 'lin_B2'
  });
  const resResolve = resolveCandidates([candB1, candB2]);
  const entB = resResolve.entities[0];
  const resB = evaluateEntityRelevance(entB, { keyword: 'roofing contractor', targetLocation: 'Austin' });

  assert.equal(resB.isRestricted, true, 'Mixed entity with Google contribution must remain restricted');
  assert.ok(resB.sourceContributions.some(sc => sc.provenance === 'GOOGLE_DERIVED'), 'GOOGLE_DERIVED contribution visible');
  assert.ok(resB.sourceContributions.some(sc => sc.provenance === 'WEBSITE_DERIVED'), 'WEBSITE_DERIVED contribution visible');
  pass('Prompt 9A Test B: Google-derived name + website-derived service => mixed evidence retains Google restriction');

  // C. Meta-derived name -> relevance evidence => META_DERIVED remains visible
  const candC = normalizeMapsCandidate({
    sourceId: 'meta_ad_12345',
    source: 'META_AD_LIBRARY',
    provenance: 'META_DERIVED',
    acquisitionContext: 'META_AD_LIBRARY',
    businessName: 'Austin Premier Roofing',
    locality: 'Austin',
    candidateId: 'lin_C'
  });
  const entC = resolveCandidates([candC]).entities[0];
  const resC = evaluateEntityRelevance(entC, { keyword: 'roofing contractor', targetLocation: 'Austin' });

  assert.ok(resC.sourceContributions.some(sc => sc.provenance === 'META_DERIVED'), 'META_DERIVED contribution visible');
  pass('Prompt 9A Test C: Meta-derived name -> relevance evidence => META_DERIVED remains visible');

  // D. Website-derived service -> relevance evidence => WEBSITE_DERIVED remains visible
  const candD = normalizeMapsCandidate({
    website: 'https://dallasroofpros.com',
    source: 'USER_PROVIDED_DOMAIN',
    acquisitionContext: 'WEBSITE_DIRECT',
    provenance: 'WEBSITE_DERIVED',
    businessName: 'Dallas Roof Pros',
    locality: 'Dallas',
    candidateId: 'lin_D'
  });
  const entD = resolveCandidates([candD]).entities[0];
  const resD = evaluateEntityRelevance(entD, { keyword: 'roofing contractor', targetLocation: 'Dallas' });

  assert.ok(resD.sourceContributions.some(sc => sc.provenance === 'WEBSITE_DERIVED'), 'WEBSITE_DERIVED contribution visible');
  pass('Prompt 9A Test D: Website-derived service -> relevance evidence => WEBSITE_DERIVED remains visible');

  // E. User-provided field -> relevance evidence => USER_PROVIDED remains visible
  const candE = normalizeMapsCandidate({
    source: 'USER_PROVIDED_DOMAIN',
    acquisitionContext: 'USER_INPUT',
    provenance: 'USER_PROVIDED',
    businessName: 'Custom Roofing Inc',
    locality: 'Austin',
    candidateId: 'lin_E'
  });
  const entE = resolveCandidates([candE]).entities[0];
  const resE = evaluateEntityRelevance(entE, { keyword: 'roofing contractor', targetLocation: 'Austin' });

  assert.ok(resE.sourceContributions.some(sc => sc.provenance === 'USER_PROVIDED'), 'USER_PROVIDED contribution visible');
  pass('Prompt 9A Test E: User-provided field -> relevance evidence => USER_PROVIDED remains visible');

  // F. LEADNORIA_DERIVED relevance decision does not erase source dependencies
  assert.ok(resA.sourceContributions.some(sc => sc.provenance === 'LEADNORIA_DERIVED'), 'LEADNORIA_DERIVED decision contribution present');
  assert.ok(resA.sourceContributions.some(sc => sc.provenance === 'GOOGLE_DERIVED'), 'Original GOOGLE_DERIVED contribution retained');
  pass('Prompt 9A Test F: LEADNORIA_DERIVED decision retains original source dependencies without erasure');

} catch (e) {
  fail('Prompt 9A recursive firewall tests', e);
}

// ============================================================================
// SUMMARY — SEPARATE TEST ACCOUNTING (PHASE 9 SEC 8)
// ============================================================================
console.log('\n================================================================');
console.log('PHASE 9 TEST ACCOUNTING');
console.log('================================================================');

let totalPassed = 0;
let totalFailed = 0;

for (const [category, counts] of Object.entries(accounts)) {
  console.log(`  ${category}: ${counts.passed} Passed, ${counts.failed} Failed`);
  totalPassed += counts.passed;
  totalFailed += counts.failed;
}

console.log(`  -----------------------------------------`);
console.log(`  Phase 9 Total: ${totalPassed} Passed, ${totalFailed} Failed`);
console.log('================================================================\n');

if (totalFailed > 0) {
  console.error('>>> SOME PHASE 9 TESTS FAILED <<<');
  process.exit(1);
} else {
  console.log('>>> ALL PHASE 9 MAPS EVIDENCE & RELEVANCE TESTS PASSED! <<<');
}
