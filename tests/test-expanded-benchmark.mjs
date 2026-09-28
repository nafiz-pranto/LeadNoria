/**
 * Master Prompt 4: Multi-Category Expanded Benchmark Suite
 *
 * Covers 10 distinct industry categories:
 * 1. Furniture
 * 2. Restaurants
 * 3. Gyms
 * 4. Dental
 * 5. HVAC
 * 6. Roofing
 * 7. Home Services
 * 8. E-commerce
 * 9. B2B SaaS
 * 10. Professional Services
 *
 * For each category:
 * - Clear Positives
 * - Clear Negatives
 * - Hard Negatives / Contradictions
 * - Keyword-only Negatives
 * - Ambiguous / Edge Cases
 *
 * Computes and prints:
 * - Per-category TP, TN, FP, FN, Precision, Recall, F1
 * - Aggregate metrics across all 10 categories
 */

import assert from 'node:assert';
import { evaluateStrictRelevanceV3 } from '../src/extension/evidenceWaterfall.ts';
import { compileResearchIntent } from '../src/extension/relevanceEngine.ts';

console.log('================================================================');
console.log('MASTER PROMPT 4: MULTI-CATEGORY EXPANDED BENCHMARK SUITE');
console.log('================================================================\n');

const BENCHMARK_DATA = {
  Furniture: {
    intentKeywords: ['Furniture', 'Sofa', 'Office Furniture'],
    cases: [
      {
        id: 'furn_cp_1',
        category: 'Furniture',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'Apex Comfort Furniture Studio',
          adText: 'Exclusive dining tables, sofas, and ergonomic office chairs. 5 years warranty.',
          destinationUrl: 'https://apexcomfort.com/dining-tables',
          destinationDomain: 'apexcomfort.com',
          ctaText: 'Shop Now',
          matchedKeyword: 'Furniture'
        }
      },
      {
        id: 'furn_cp_2',
        category: 'Furniture',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'Nordic Craft Co.',
          adText: 'Handcrafted solid wood dining tables, wardrobes, and credenzas.',
          destinationUrl: 'https://nordiccraft.com/catalog',
          destinationDomain: 'nordiccraft.com',
          ctaText: 'Order Now',
          matchedKeyword: 'Furniture'
        }
      },
      {
        id: 'furn_cn_1',
        category: 'Furniture',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'FastLane Auto Repairs',
          adText: 'Brake pads, engine overhaul, and tire changes at affordable rates.',
          destinationUrl: 'https://fastlaneauto.com',
          destinationDomain: 'fastlaneauto.com',
          matchedKeyword: 'Furniture'
        }
      },
      {
        id: 'furn_hn_1',
        category: 'Furniture',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Manchester United FC',
          adText: 'Enjoy executive stadium chairs in VIP boxes at Old Trafford. Buy tickets now.',
          destinationUrl: 'https://manutd.com/tickets',
          destinationDomain: 'manutd.com',
          matchedKeyword: 'Furniture'
        }
      },
      {
        id: 'furn_ko_1',
        category: 'Furniture',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Daily Tech Review',
          adText: 'Our newsroom furniture was upgraded. Read our review of modern workstations.',
          destinationUrl: 'https://dailytech.org/news',
          destinationDomain: 'dailytech.org',
          matchedKeyword: 'Furniture'
        }
      },
      {
        id: 'furn_amb_1',
        category: 'Furniture',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Apex General Store',
          adText: 'Great deals on household items and essentials this week.',
          destinationUrl: 'https://apexgeneral.com',
          matchedKeyword: 'Furniture'
        }
      }
    ]
  },

  Restaurants: {
    intentKeywords: ['Restaurant', 'Dining', 'Bistro', 'Cafe'],
    cases: [
      {
        id: 'rest_cp_1',
        category: 'Restaurants',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'The Olive Branch Bistro',
          adText: 'Experience fine Mediterranean cuisine, fresh seafood pasta, and artisan wine. Reserve your table.',
          destinationUrl: 'https://olivebranchbistro.com/menu',
          destinationDomain: 'olivebranchbistro.com',
          ctaText: 'Book Now',
          matchedKeyword: 'Restaurant'
        }
      },
      {
        id: 'rest_cp_2',
        category: 'Restaurants',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'Urban Smokehouse & Bar',
          adText: 'Authentic wood-smoked BBQ ribs, brisket, and craft beers. Dinner reservations open.',
          destinationUrl: 'https://urbansmokehouse.com/reservations',
          destinationDomain: 'urbansmokehouse.com',
          ctaText: 'Book Now',
          matchedKeyword: 'Dining'
        }
      },
      {
        id: 'rest_cn_1',
        category: 'Restaurants',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Precision Machine Tools',
          adText: 'Industrial CNC cutters and lathes for manufacturing facilities.',
          destinationUrl: 'https://precisiontools.com',
          destinationDomain: 'precisiontools.com',
          matchedKeyword: 'Restaurant'
        }
      },
      {
        id: 'rest_hn_1',
        category: 'Restaurants',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'All-Star Sports Betting & Casino',
          adText: 'Enjoy buffet dining while you bet on the championship match! Spin roulette.',
          destinationUrl: 'https://allstarbetting.com',
          destinationDomain: 'allstarbetting.com',
          matchedKeyword: 'Restaurant'
        }
      },
      {
        id: 'rest_ko_1',
        category: 'Restaurants',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Global Accounting Partners',
          adText: 'We held our corporate lunch at a great restaurant. Let us balance your tax books.',
          destinationUrl: 'https://globalaccounting.com',
          destinationDomain: 'globalaccounting.com',
          matchedKeyword: 'Restaurant'
        }
      },
      {
        id: 'rest_amb_1',
        category: 'Restaurants',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'City Events Hub',
          adText: 'Check out local happenings across the city this weekend.',
          destinationUrl: 'https://cityevents.org',
          matchedKeyword: 'Restaurant'
        }
      }
    ]
  },

  Gyms: {
    intentKeywords: ['Gym', 'Fitness Center', 'Workout'],
    cases: [
      {
        id: 'gym_cp_1',
        category: 'Gyms',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'IronCore Fitness Gym',
          adText: 'State of the art gym with personal trainer coaching, cardio zones, and CrossFit classes. Join now for $29/mo.',
          destinationUrl: 'https://ironcoregym.com/membership',
          destinationDomain: 'ironcoregym.com',
          ctaText: 'Sign Up',
          matchedKeyword: 'Gym'
        }
      },
      {
        id: 'gym_cp_2',
        category: 'Gyms',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'Peak Performance Training Club',
          adText: 'Strength training, HIIT workouts, and certified personal trainers. Free 7-day trial pass.',
          destinationUrl: 'https://peaktrainingclub.com/trial',
          destinationDomain: 'peaktrainingclub.com',
          ctaText: 'Get Quote',
          matchedKeyword: 'Fitness Center'
        }
      },
      {
        id: 'gym_cn_1',
        category: 'Gyms',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Apex Financial Advisors',
          adText: 'Retirement wealth management and bond investment strategies.',
          destinationUrl: 'https://apexfinancial.com',
          destinationDomain: 'apexfinancial.com',
          matchedKeyword: 'Gym'
        }
      },
      {
        id: 'gym_hn_1',
        category: 'Gyms',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Election Reform Campaign',
          adText: 'Politicians need a political workout to fix government corruption. Vote on election day.',
          destinationUrl: 'https://electionreform.org',
          destinationDomain: 'electionreform.org',
          matchedKeyword: 'Workout'
        }
      },
      {
        id: 'gym_ko_1',
        category: 'Gyms',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Software Solutions Inc',
          adText: 'Our cloud platform gives your database a rigorous workout. Try free for 14 days.',
          destinationUrl: 'https://softwaresolutions.com',
          destinationDomain: 'softwaresolutions.com',
          matchedKeyword: 'Workout'
        }
      },
      {
        id: 'gym_amb_1',
        category: 'Gyms',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Active Lifestyle Magazine',
          adText: 'Read stories about active living and healthy habits.',
          destinationUrl: 'https://activelifestylemag.org',
          matchedKeyword: 'Gym'
        }
      }
    ]
  },

  Dental: {
    intentKeywords: ['Dentist', 'Dental Clinic', 'Orthodontist'],
    cases: [
      {
        id: 'dent_cp_1',
        category: 'Dental',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'Bright Smiles Dental Clinic',
          adText: 'Comprehensive family dentistry, teeth whitening, Invisalign, and dental implants. Book your exam today.',
          destinationUrl: 'https://brightsmilesdental.com/appointment',
          destinationDomain: 'brightsmilesdental.com',
          ctaText: 'Book Now',
          matchedKeyword: 'Dental Clinic'
        }
      },
      {
        id: 'dent_cp_2',
        category: 'Dental',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'Metro Orthodontics Practice',
          adText: 'Clear braces, invisalign specialists, and oral teeth alignment for kids and adults. Free consult.',
          destinationUrl: 'https://metroorthodontics.com/consult',
          destinationDomain: 'metroorthodontics.com',
          ctaText: 'Contact Us',
          matchedKeyword: 'Orthodontist'
        }
      },
      {
        id: 'dent_cn_1',
        category: 'Dental',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Premier Home Roofing',
          adText: 'Shingle replacement and storm roof leak repair.',
          destinationUrl: 'https://premierhomeroofing.com',
          destinationDomain: 'premierhomeroofing.com',
          matchedKeyword: 'Dentist'
        }
      },
      {
        id: 'dent_hn_1',
        category: 'Dental',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Manchester Premier League Team',
          adText: 'Team dentist checked striker after matchday victory! Official fan merchandise.',
          destinationUrl: 'https://manchesterteam.com/news',
          destinationDomain: 'manchesterteam.com',
          matchedKeyword: 'Dentist'
        }
      },
      {
        id: 'dent_ko_1',
        category: 'Dental',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'B2B Procurement Weekly',
          adText: 'Dentist office supplies procurement article published in our latest trade gazette.',
          destinationUrl: 'https://b2btrade.com/article',
          destinationDomain: 'b2btrade.com',
          matchedKeyword: 'Dentist'
        }
      },
      {
        id: 'dent_amb_1',
        category: 'Dental',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Smile More Wellness',
          adText: 'Live with joy and smile every morning.',
          destinationUrl: 'https://smilemorewellness.org',
          matchedKeyword: 'Dental'
        }
      }
    ]
  },

  HVAC: {
    intentKeywords: ['HVAC', 'Air Conditioning', 'Heating and Cooling'],
    cases: [
      {
        id: 'hvac_cp_1',
        category: 'HVAC',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'All-Pro HVAC Services',
          adText: 'Emergency AC repair, furnace installation, heat pump maintenance, and ductwork cleaning. 24/7 service.',
          destinationUrl: 'https://allprohvac.com/ac-repair',
          destinationDomain: 'allprohvac.com',
          ctaText: 'Call Now',
          matchedKeyword: 'HVAC'
        }
      },
      {
        id: 'hvac_cp_2',
        category: 'HVAC',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'CoolBreeze Air Conditioning Specialists',
          adText: 'Central air conditioning tune-up, compressor replacement, and smart thermostat setup. Save on energy bills.',
          destinationUrl: 'https://coolbreezeac.com/tuneup',
          destinationDomain: 'coolbreezeac.com',
          ctaText: 'Get Quote',
          matchedKeyword: 'Air Conditioning'
        }
      },
      {
        id: 'hvac_cn_1',
        category: 'HVAC',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Elite Fashion Boutique',
          adText: 'Summer designer dresses, sunglasses, and sandals.',
          destinationUrl: 'https://elitefashion.com',
          destinationDomain: 'elitefashion.com',
          matchedKeyword: 'HVAC'
        }
      },
      {
        id: 'hvac_hn_1',
        category: 'HVAC',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Royal Poker Casino',
          adText: 'Cool down at our air conditioned luxury casino lounge. Play slots and poker!',
          destinationUrl: 'https://royalpokercasino.com',
          destinationDomain: 'royalpokercasino.com',
          matchedKeyword: 'Air Conditioning'
        }
      },
      {
        id: 'hvac_ko_1',
        category: 'HVAC',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Metropolitan Real Estate News',
          adText: 'Why modern commercial buildings require efficient HVAC. Read our architectural piece.',
          destinationUrl: 'https://metrorealestatenews.com',
          destinationDomain: 'metrorealestatenews.com',
          matchedKeyword: 'HVAC'
        }
      },
      {
        id: 'hvac_amb_1',
        category: 'HVAC',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Breeze Consulting Group',
          adText: 'Cool solutions for tricky corporate problems.',
          destinationUrl: 'https://breezeconsulting.com',
          matchedKeyword: 'HVAC'
        }
      }
    ]
  },

  Roofing: {
    intentKeywords: ['Roofing', 'Roofer', 'Roof Repair'],
    cases: [
      {
        id: 'roof_cp_1',
        category: 'Roofing',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'Apex Roofing & Siding Contractors',
          adText: 'Storm damage roof inspection, shingle replacement, metal roof installation, and gutters. Licensed & insured.',
          destinationUrl: 'https://apexroofingpros.com/estimate',
          destinationDomain: 'apexroofingpros.com',
          ctaText: 'Get Quote',
          matchedKeyword: 'Roofing'
        }
      },
      {
        id: 'roof_cp_2',
        category: 'Roofing',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'WeatherShield Roofing Specialists',
          adText: 'Emergency leak repair, flat roof coatings, and full residential roof replacement. 20-year warranty.',
          destinationUrl: 'https://weathershieldroof.com',
          destinationDomain: 'weathershieldroof.com',
          ctaText: 'Contact Us',
          matchedKeyword: 'Roof Repair'
        }
      },
      {
        id: 'roof_cn_1',
        category: 'Roofing',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'CloudByte SaaS Software',
          adText: 'Automate your customer support tickets with our cloud AI.',
          destinationUrl: 'https://cloudbyte.io',
          destinationDomain: 'cloudbyte.io',
          matchedKeyword: 'Roofing'
        }
      },
      {
        id: 'roof_hn_1',
        category: 'Roofing',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Premier League Stadium Club',
          adText: 'New stadium retractable roof unveiled before football match against United!',
          destinationUrl: 'https://premierfootballstadium.com',
          destinationDomain: 'premierfootballstadium.com',
          matchedKeyword: 'Roofing'
        }
      },
      {
        id: 'roof_ko_1',
        category: 'Roofing',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Urban Poet Society',
          adText: 'Under the tin roof, words flow. Join our creative writing circle.',
          destinationUrl: 'https://urbanpoets.org',
          destinationDomain: 'urbanpoets.org',
          matchedKeyword: 'Roofing'
        }
      },
      {
        id: 'roof_amb_1',
        category: 'Roofing',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Top Cover Solutions',
          adText: 'Protect what matters most with comprehensive plans.',
          destinationUrl: 'https://topcoversolutions.com',
          matchedKeyword: 'Roofing'
        }
      }
    ]
  },

  'Home Services': {
    intentKeywords: ['Home Services', 'Plumbing', 'Electrician', 'Handyman'],
    cases: [
      {
        id: 'home_cp_1',
        category: 'Home Services',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'RapidDrain Plumbing & Home Services',
          adText: 'Clogged drains, pipe leak repair, water heater replacement, and 24/7 emergency plumbing service.',
          destinationUrl: 'https://rapiddrainplumbing.com/service',
          destinationDomain: 'rapiddrainplumbing.com',
          ctaText: 'Call Now',
          matchedKeyword: 'Plumbing'
        }
      },
      {
        id: 'home_cp_2',
        category: 'Home Services',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'VoltCraft Residential Electricians',
          adText: 'Electrical panel upgrades, ceiling fan wiring, and safety home inspections. Licensed master electricians.',
          destinationUrl: 'https://voltcraftelectric.com',
          destinationDomain: 'voltcraftelectric.com',
          ctaText: 'Get Quote',
          matchedKeyword: 'Electrician'
        }
      },
      {
        id: 'home_cn_1',
        category: 'Home Services',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'FinServe Forex Trading',
          adText: 'Trade foreign currencies with zero commission.',
          destinationUrl: 'https://finserveforex.com',
          destinationDomain: 'finserveforex.com',
          matchedKeyword: 'Home Services'
        }
      },
      {
        id: 'home_hn_1',
        category: 'Home Services',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Senate Candidate Campaign',
          adText: 'Fight for working families at home. Vote for clean governance on the ballot.',
          destinationUrl: 'https://candidateforgovernance.org',
          destinationDomain: 'candidateforgovernance.org',
          matchedKeyword: 'Home Services'
        }
      },
      {
        id: 'home_ko_1',
        category: 'Home Services',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Daily Tech Blogger',
          adText: 'The future of IoT in home services. Read our newsletter.',
          destinationUrl: 'https://techblogger.example.com',
          destinationDomain: 'techblogger.example.com',
          matchedKeyword: 'Home Services'
        }
      },
      {
        id: 'home_amb_1',
        category: 'Home Services',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Domestic Ease Group',
          adText: 'Making everyday living smoother.',
          destinationUrl: 'https://domesticease.com',
          matchedKeyword: 'Home Services'
        }
      }
    ]
  },

  'E-commerce': {
    intentKeywords: ['Ecommerce', 'Online Store', 'Retail Store'],
    cases: [
      {
        id: 'ecom_cp_1',
        category: 'E-commerce',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'LuxeLiving Online Store',
          adText: 'Shop our curated apparel catalog. Free shipping on orders over $50. Add to cart today!',
          destinationUrl: 'https://luxelivingstore.com/checkout',
          destinationDomain: 'luxelivingstore.com',
          ctaText: 'Shop Now',
          matchedKeyword: 'Online Store'
        }
      },
      {
        id: 'ecom_cp_2',
        category: 'E-commerce',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'TrendVibe Retail Store',
          adText: 'Direct to consumer streetwear accessories and footwear. Fast delivery and easy returns.',
          destinationUrl: 'https://trendviberetail.com/shop',
          destinationDomain: 'trendviberetail.com',
          ctaText: 'Shop Now',
          matchedKeyword: 'Retail Store'
        }
      },
      {
        id: 'ecom_cn_1',
        category: 'E-commerce',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'City Sewer Authority',
          adText: 'Public utility notice regarding municipal water line upgrades.',
          destinationUrl: 'https://citysewer.gov',
          destinationDomain: 'citysewer.gov',
          matchedKeyword: 'Ecommerce'
        }
      },
      {
        id: 'ecom_hn_1',
        category: 'E-commerce',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Jackpot Slots Online Casino',
          adText: 'Buy virtual coin packs in our online store and play high stakes roulette!',
          destinationUrl: 'https://jackpotslots.com',
          destinationDomain: 'jackpotslots.com',
          matchedKeyword: 'Online Store'
        }
      },
      {
        id: 'ecom_ko_1',
        category: 'E-commerce',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Economics Professor Insights',
          adText: 'Examining global ecommerce market shifts in 2026. Academic lecture recording.',
          destinationUrl: 'https://econinsights.edu',
          destinationDomain: 'econinsights.edu',
          matchedKeyword: 'Ecommerce'
        }
      },
      {
        id: 'ecom_amb_1',
        category: 'E-commerce',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Global Connections',
          adText: 'Connecting entities across borders seamlessly.',
          destinationUrl: 'https://globalconnections.org',
          matchedKeyword: 'Ecommerce'
        }
      }
    ]
  },

  'B2B SaaS': {
    intentKeywords: ['SaaS', 'Cloud Software', 'Business Software'],
    cases: [
      {
        id: 'saas_cp_1',
        category: 'B2B SaaS',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'PipelinePro B2B SaaS',
          adText: 'Automate sales pipeline management, CRM workflows, and deal tracking with our cloud software platform. Start free 14-day trial.',
          destinationUrl: 'https://pipelinepro.io/trial',
          destinationDomain: 'pipelinepro.io',
          ctaText: 'Sign Up',
          matchedKeyword: 'SaaS'
        }
      },
      {
        id: 'saas_cp_2',
        category: 'B2B SaaS',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'SyncFlow Cloud Software',
          adText: 'Enterprise workflow automation, dashboard analytics, and ERP integration for B2B teams.',
          destinationUrl: 'https://syncflow.io/demo',
          destinationDomain: 'syncflow.io',
          ctaText: 'Get Quote',
          matchedKeyword: 'Cloud Software'
        }
      },
      {
        id: 'saas_cn_1',
        category: 'B2B SaaS',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'GreenThumb Landscaping',
          adText: 'Lawn mowing, flower planting, and tree trimming services.',
          destinationUrl: 'https://greenthumblandscaping.com',
          destinationDomain: 'greenthumblandscaping.com',
          matchedKeyword: 'SaaS'
        }
      },
      {
        id: 'saas_hn_1',
        category: 'B2B SaaS',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Champions League Football Club',
          adText: 'Our match analysis team uses cloud software to analyze player sprint speed. Buy fan jerseys!',
          destinationUrl: 'https://championsleagueclub.com',
          destinationDomain: 'championsleagueclub.com',
          matchedKeyword: 'Cloud Software'
        }
      },
      {
        id: 'saas_ko_1',
        category: 'B2B SaaS',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Philosophy Quarterly',
          adText: 'The philosophy of automation and human purpose in the digital age.',
          destinationUrl: 'https://philosophyquarterly.org',
          destinationDomain: 'philosophyquarterly.org',
          matchedKeyword: 'SaaS'
        }
      },
      {
        id: 'saas_amb_1',
        category: 'B2B SaaS',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Future Solutions Co',
          adText: 'Empowering future forward thinkers.',
          destinationUrl: 'https://futuresolutions.org',
          matchedKeyword: 'SaaS'
        }
      }
    ]
  },

  'Professional Services': {
    intentKeywords: ['Professional Services', 'Law Firm', 'Accounting', 'CPA'],
    cases: [
      {
        id: 'prof_cp_1',
        category: 'Professional Services',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'Sterling & Croft Law Firm',
          adText: 'Corporate legal counsel, commercial litigation, contract disputes, and compliance advisory. Schedule an attorney consultation.',
          destinationUrl: 'https://sterlingcroftlaw.com/consult',
          destinationDomain: 'sterlingcroftlaw.com',
          ctaText: 'Contact Us',
          matchedKeyword: 'Law Firm'
        }
      },
      {
        id: 'prof_cp_2',
        category: 'Professional Services',
        expected: 'RELEVANT',
        candidate: {
          advertiserName: 'Vanguard CPA & Accounting Partners',
          adText: 'Tax filing preparation, corporate audit, business advisory, and strategic bookkeeping for businesses.',
          destinationUrl: 'https://vanguardcpa.com',
          destinationDomain: 'vanguardcpa.com',
          ctaText: 'Get Quote',
          matchedKeyword: 'Accounting'
        }
      },
      {
        id: 'prof_cn_1',
        category: 'Professional Services',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Discount Auto Parts Warehouse',
          adText: 'Batteries, alternators, and oil filters shipped directly to your door.',
          destinationUrl: 'https://discountautoparts.com',
          destinationDomain: 'discountautoparts.com',
          matchedKeyword: 'Professional Services'
        }
      },
      {
        id: 'prof_hn_1',
        category: 'Professional Services',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Premier Sports Betting League',
          adText: 'Bet on live sports games with professional odds! Claim bonus tokens.',
          destinationUrl: 'https://premiersportsbetting.com',
          destinationDomain: 'premiersportsbetting.com',
          matchedKeyword: 'Professional Services'
        }
      },
      {
        id: 'prof_ko_1',
        category: 'Professional Services',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Film Critics Guild',
          adText: 'Review of the legal courtroom thriller movie released this Friday.',
          destinationUrl: 'https://filmcriticsguild.org',
          destinationDomain: 'filmcriticsguild.org',
          matchedKeyword: 'Law Firm'
        }
      },
      {
        id: 'prof_amb_1',
        category: 'Professional Services',
        expected: 'NOT_RELEVANT',
        candidate: {
          advertiserName: 'Strategic Horizons',
          adText: 'Navigating paths toward corporate growth.',
          destinationUrl: 'https://strategichorizons.com',
          matchedKeyword: 'Professional Services'
        }
      }
    ]
  }
};

const categoryMetrics = [];
let aggregateTP = 0;
let aggregateTN = 0;
let aggregateFP = 0;
let aggregateFN = 0;

for (const [catName, catData] of Object.entries(BENCHMARK_DATA)) {
  const intent = compileResearchIntent('CUSTOM', catData.intentKeywords, undefined, 'US');
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (const c of catData.cases) {
    const res = evaluateStrictRelevanceV3(c.candidate, intent);
    const actual = res.decision === 'RELEVANT' ? 'RELEVANT' : 'NOT_RELEVANT';

    if (c.expected === 'RELEVANT' && actual === 'RELEVANT') tp++;
    else if (c.expected === 'NOT_RELEVANT' && actual === 'NOT_RELEVANT') tn++;
    else if (c.expected === 'NOT_RELEVANT' && actual === 'RELEVANT') fp++;
    else if (c.expected === 'RELEVANT' && actual === 'NOT_RELEVANT') fn++;
  }

  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 1.0;
  const recall = (tp + fn) > 0 ? tp / (tp + fn) : 1.0;
  const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0.0;

  categoryMetrics.push({
    category: catName,
    total: catData.cases.length,
    tp,
    tn,
    fp,
    fn,
    precision: Math.round(precision * 1000) / 10,
    recall: Math.round(recall * 1000) / 10,
    f1: Math.round(f1 * 1000) / 10
  });

  aggregateTP += tp;
  aggregateTN += tn;
  aggregateFP += fp;
  aggregateFN += fn;
}

const aggPrecision = (aggregateTP + aggregateFP) > 0 ? aggregateTP / (aggregateTP + aggregateFP) : 1.0;
const aggRecall = (aggregateTP + aggregateFN) > 0 ? aggregateTP / (aggregateTP + aggregateFN) : 1.0;
const aggF1 = (aggPrecision + aggRecall) > 0 ? (2 * aggPrecision * aggRecall) / (aggPrecision + aggRecall) : 0.0;

console.log('PER-CATEGORY BENCHMARK RESULTS (10 Categories):');
console.table(categoryMetrics);

console.log('AGGREGATE BENCHMARK METRICS:');
console.log(`Total Cases: ${aggregateTP + aggregateTN + aggregateFP + aggregateFN}`);
console.log(`TP: ${aggregateTP}`);
console.log(`TN: ${aggregateTN}`);
console.log(`FP: ${aggregateFP}`);
console.log(`FN: ${aggregateFN}`);
console.log(`Precision: ${(aggPrecision * 100).toFixed(1)}%`);
console.log(`Recall: ${(aggRecall * 100).toFixed(1)}%`);
console.log(`F1 Score: ${(aggF1 * 100).toFixed(1)}%\n`);

assert.strictEqual(aggregateFP, 0, 'Zero False Positives allowed across expanded benchmark');
assert.strictEqual(aggregateFN, 0, 'Zero False Negatives allowed across expanded benchmark');
assert.strictEqual(aggPrecision, 1.0, 'Aggregate Precision must be 100%');
assert.strictEqual(aggRecall, 1.0, 'Aggregate Recall must be 100%');

console.log('✓ [PASS] Multi-category benchmark verified with 100% Precision and 100% Recall across all 10 categories!\n');
