/**
 * LeadNoria Query Planner & Discovery Engine (v1.1)
 *
 * Implements deterministic, bounded query expansion to improve discovery recall
 * while preserving Strict Relevance Gate v2 precision.
 *
 * Absolute Invariants:
 * 1. Original user query ALWAYS comes first as sequence 0 (primary seed).
 * 2. Hard deterministic ceiling: MAX_QUERIES_PER_RESEARCH_RUN = 8.
 * 3. Max variants per seed: MAX_VARIANTS_PER_SEED = 5.
 * 4. No recursive expansion, no open-ended thesaurus loops, no external AI.
 * 5. Query expansion is a DISCOVERY mechanism; final relevance is strictly decided
 *    by the existing downstream Strict Relevance Gate v2.
 * 6. Global deduplication across all queries is strictly enforced.
 */

import type {
  PlannedQuery,
  QueryVariantType,
  QueryStatus,
  QueryFrontierState
} from './types.ts';

// Deterministic Boundary Constants
export const MAX_QUERIES_PER_RESEARCH_RUN = 8;
export const MAX_VARIANTS_PER_SEED = 5;
export const MAX_QUERIES_PER_CATEGORY = 8;
export const MAX_QUERY_LENGTH = 60;

// Prohibited contradictory terms that must never appear in generated search queries
const CONTRADICTORY_QUERY_TOKENS = new Set([
  'casino', 'betting', 'poker', 'slots', 'jackpot', 'roulette',
  'senate', 'parliament', 'election', 'ballot', 'campaign rally',
  'fifa', 'uefa', 'premier league', 'cricket board', 'stadium match',
  'hospital clinic', 'cancer remedy', 'chronic disease', 'prescription'
]);

export interface CategoryVocabulary {
  category: string;
  aliases: string[];
  commercialTerms: string[];
  productTerms: string[];
  serviceTerms: string[];
  localeMappings: Record<string, string[]>;
}

// Bounded Category Taxonomy for Deterministic Expansion
export const PLANNER_TAXONOMY: Record<string, CategoryVocabulary> = {
  furniture: {
    category: 'furniture',
    aliases: ['furniture', 'furnishing', 'furnishings', 'home decor', 'woodcraft'],
    commercialTerms: [
      'Furniture Store',
      'Home Furniture',
      'Office Furniture',
      'Furniture Showroom'
    ],
    productTerms: [
      'Sofa',
      'Dining Table',
      'Office Chair',
      'Bedroom Furniture'
    ],
    serviceTerms: [
      'Custom Furniture'
    ],
    localeMappings: {
      BD: ['ফার্নিচার', 'আসবাবপত্র'],
      DE: ['Möbel', 'Möbelhaus'],
      ES: ['Muebles', 'Tienda de muebles']
    }
  },
  restaurant: {
    category: 'restaurant',
    aliases: ['restaurant', 'cafe', 'bistro', 'eatery', 'dining', 'food'],
    commercialTerms: [
      'Restaurant',
      'Bistro Cafe',
      'Fine Dining'
    ],
    productTerms: [
      'Food Delivery',
      'Catering Menu',
      'Lunch and Dinner'
    ],
    serviceTerms: [
      'Catering Services'
    ],
    localeMappings: {
      BD: ['রেস্তোরাঁ', 'খাবার'],
      DE: ['Gastronomie', 'Speiselokal'],
      ES: ['Restaurante', 'Cafetería']
    }
  },
  dental: {
    category: 'dental',
    aliases: ['dentist', 'dental', 'orthodontist', 'teeth'],
    commercialTerms: [
      'Dental Clinic',
      'Dental Practice',
      'Family Dentistry'
    ],
    productTerms: [
      'Teeth Whitening',
      'Dental Implants',
      'Invisalign'
    ],
    serviceTerms: [
      'Dental Care'
    ],
    localeMappings: {
      BD: ['ডেন্টাল ক্লিনিক', 'দাঁতের ডাক্তার'],
      DE: ['Zahnarztpraxis', 'Zahnklinik'],
      ES: ['Clínica Dental', 'Odontología']
    }
  },
  roofing: {
    category: 'roofing',
    aliases: ['roof', 'roofing', 'roofer'],
    commercialTerms: [
      'Roofing Contractor',
      'Roofing Company',
      'Roof Replacement'
    ],
    productTerms: [
      'Metal Roof',
      'Roof Shingles'
    ],
    serviceTerms: [
      'Roof Repair',
      'Roof Inspection'
    ],
    localeMappings: {
      DE: ['Dachdecker', 'Dachdeckerei'],
      ES: ['Tejados', 'Cubiertas']
    }
  },
  real_estate: {
    category: 'real_estate',
    aliases: ['real estate', 'realty', 'realtor', 'property', 'properties'],
    commercialTerms: [
      'Real Estate Agency',
      'Property Broker',
      'Realty Group'
    ],
    productTerms: [
      'Apartments For Sale',
      'Commercial Property',
      'Homes For Sale'
    ],
    serviceTerms: [
      'Property Management'
    ],
    localeMappings: {
      DE: ['Immobilien', 'Immobilienmakler'],
      ES: ['Inmobiliaria', 'Bienes Raíces']
    }
  },
  clothing: {
    category: 'clothing',
    aliases: ['clothing', 'apparel', 'fashion', 'garments', 'wear'],
    commercialTerms: [
      'Clothing Store',
      'Fashion Boutique',
      'Apparel Brand'
    ],
    productTerms: [
      'Dresses',
      'Men Suits',
      'Casual Wear'
    ],
    serviceTerms: [
      'Custom Tailoring'
    ],
    localeMappings: {
      BD: ['পোশাক', 'বুটিক'],
      DE: ['Bekleidungsgeschäft', 'Modegeschäft'],
      ES: ['Tienda de Ropa', 'Moda']
    }
  },
  fitness: {
    category: 'fitness',
    aliases: ['fitness', 'gym', 'workout', 'training'],
    commercialTerms: [
      'Fitness Center',
      'Gym Club',
      'Health Club'
    ],
    productTerms: [
      'Gym Membership',
      'Personal Training'
    ],
    serviceTerms: [
      'Fitness Coaching'
    ],
    localeMappings: {
      DE: ['Fitnessstudio', 'Sportstudio'],
      ES: ['Gimnasio', 'Centro de Fitness']
    }
  },
  saas: {
    category: 'saas',
    aliases: ['saas', 'software', 'cloud software', 'b2b software'],
    commercialTerms: [
      'B2B SaaS Platform',
      'Cloud Software Solutions',
      'Enterprise Software'
    ],
    productTerms: [
      'CRM Platform',
      'Workflow Automation',
      'Analytics Software'
    ],
    serviceTerms: [
      'Software Subscription'
    ],
    localeMappings: {}
  },
  hvac: {
    category: 'hvac',
    aliases: ['hvac', 'air conditioning', 'heating', 'cooling', 'ac repair'],
    commercialTerms: [
      'HVAC Contractor',
      'Heating and Cooling',
      'AC Installation'
    ],
    productTerms: [
      'Heat Pump',
      'Air Conditioner'
    ],
    serviceTerms: [
      'AC Repair',
      'HVAC Maintenance'
    ],
    localeMappings: {
      ES: ['Aire Acondicionado', 'Climatización']
    }
  }
};

/**
 * Normalizes a query string: trims, collapses inner whitespace.
 */
export function normalizeQueryString(q: string): string {
  if (!q) return '';
  return q.trim().replace(/\s+/g, ' ');
}

/**
 * Validates a generated candidate query against the Query Quality Gate.
 */
export function validateQueryQuality(
  candidate: string,
  seed: string,
  existingQueries: Set<string>
): { valid: boolean; reason?: string } {
  const norm = normalizeQueryString(candidate);

  if (!norm || norm.length < 2) {
    return { valid: false, reason: 'Query is empty or shorter than 2 characters.' };
  }

  if (norm.length > MAX_QUERY_LENGTH) {
    return { valid: false, reason: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters.` };
  }

  const lowerCandidate = norm.toLowerCase();
  const lowerSeed = normalizeQueryString(seed).toLowerCase();

  // Check duplicate against existing queries (case-insensitive)
  if (existingQueries.has(lowerCandidate)) {
    return { valid: false, reason: 'Query is a duplicate of an existing query.' };
  }

  // Check identical to seed
  if (lowerCandidate === lowerSeed) {
    return { valid: false, reason: 'Query is identical to seed query.' };
  }

  // Check for contradiction or prohibited category tokens
  for (const token of CONTRADICTORY_QUERY_TOKENS) {
    if (lowerCandidate.includes(token)) {
      return { valid: false, reason: `Query contains contradictory industry token: "${token}".` };
    }
  }

  // Ensure candidate contains at least one meaningful letter or number
  if (!/[\p{L}\p{N}]/u.test(norm)) {
    return { valid: false, reason: 'Query contains no alphanumeric characters.' };
  }

  return { valid: true };
}

/**
 * Finds taxonomy entry matching a seed keyword.
 */
export function matchCategoryTaxonomy(keyword: string): CategoryVocabulary | null {
  const lower = keyword.toLowerCase().trim();
  for (const key of Object.keys(PLANNER_TAXONOMY)) {
    const entry = PLANNER_TAXONOMY[key];
    if (lower === entry.category || entry.aliases.some(alias => lower.includes(alias) || alias.includes(lower))) {
      return entry;
    }
  }
  return null;
}

export interface QueryPlannerOptions {
  seedKeywords: string[];
  countryCode: string;
  locale?: string;
  runId: string;
  maxQueries?: number;
  maxVariantsPerSeed?: number;
}

/**
 * Deterministically plans ordered search query candidates for a research run.
 *
 * Guaranteed order:
 * 1. Original user seed queries (ALWAYS first, exact match, sequence 0..N)
 * 2. Strong commercial category variants
 * 3. Core product / service terms
 * 4. Controlled locale variants
 * 5. Bounded plural / singular variants
 */
export function planResearchQueries(options: QueryPlannerOptions): PlannedQuery[] {
  const {
    seedKeywords,
    countryCode = 'US',
    locale = '',
    runId,
    maxQueries = MAX_QUERIES_PER_RESEARCH_RUN,
    maxVariantsPerSeed = MAX_VARIANTS_PER_SEED
  } = options;

  const validSeeds = seedKeywords
    .map(normalizeQueryString)
    .filter(k => k.length >= 2);

  if (validSeeds.length === 0) {
    return [];
  }

  const planned: PlannedQuery[] = [];
  const existingSet = new Set<string>();
  let sequenceCounter = 0;

  // STEP 1: Add all user seed queries FIRST
  for (const seed of validSeeds) {
    if (planned.length >= maxQueries) break;
    const lowerSeed = seed.toLowerCase();
    if (!existingSet.has(lowerSeed)) {
      existingSet.add(lowerSeed);
      planned.push({
        query: seed,
        seedQuery: seed,
        variantType: 'SEED',
        rationale: 'Original user-entered seed query (primary discovery anchor)',
        locale,
        country: countryCode,
        sequence: sequenceCounter++,
        runId,
        status: 'PENDING'
      });
    }
  }

  // STEP 2: For each seed, generate bounded, deterministic variants
  for (const seed of validSeeds) {
    if (planned.length >= maxQueries) break;

    let seedVariantCount = 0;
    const taxonomy = matchCategoryTaxonomy(seed);

    const candidatePool: Array<{ query: string; type: QueryVariantType; rationale: string }> = [];

    if (taxonomy) {
      // 1. Top commercial terms (up to 2)
      for (const term of taxonomy.commercialTerms.slice(0, 2)) {
        candidatePool.push({
          query: term,
          type: 'COMMERCIAL_CATEGORY',
          rationale: `Commercial category expansion for ${taxonomy.category}`
        });
      }

      // 2. Top product terms (up to 2)
      for (const term of taxonomy.productTerms.slice(0, 2)) {
        candidatePool.push({
          query: term,
          type: 'PRODUCT_TERM',
          rationale: `High-intent product keyword for ${taxonomy.category}`
        });
      }

      // 3. Locale variants (if reliable mapping exists for countryCode, up to 2)
      const countryUpper = countryCode.toUpperCase();
      const localeTerms = taxonomy.localeMappings[countryUpper] || [];
      for (const term of localeTerms.slice(0, 2)) {
        candidatePool.push({
          query: term,
          type: 'LOCALE_VARIANT',
          rationale: `Controlled locale variant for country ${countryUpper}`
        });
      }

      // 4. Service terms (up to 1)
      for (const term of taxonomy.serviceTerms.slice(0, 1)) {
        candidatePool.push({
          query: term,
          type: 'SERVICE_TERM',
          rationale: `Service offering term for ${taxonomy.category}`
        });
      }

      // 5. Remaining commercial and product terms
      for (const term of taxonomy.commercialTerms.slice(2)) {
        candidatePool.push({
          query: term,
          type: 'COMMERCIAL_CATEGORY',
          rationale: `Additional commercial category expansion for ${taxonomy.category}`
        });
      }
      for (const term of taxonomy.productTerms.slice(2)) {
        candidatePool.push({
          query: term,
          type: 'PRODUCT_TERM',
          rationale: `Additional product keyword for ${taxonomy.category}`
        });
      }
    } else {
      // Generic fallback for unindexed categories:
      // Produce bounded commercial and singular/plural variants derived from seed tokens
      const lowerSeed = seed.toLowerCase();

      // Commercial variant
      if (!lowerSeed.includes('store') && !lowerSeed.includes('shop') && !lowerSeed.includes('company')) {
        candidatePool.push({
          query: `${seed} Store`,
          type: 'COMMERCIAL_CATEGORY',
          rationale: `Commercial category derivation for ${seed}`
        });
        candidatePool.push({
          query: `${seed} Company`,
          type: 'COMMERCIAL_CATEGORY',
          rationale: `Commercial provider derivation for ${seed}`
        });
      }

      // Singular/plural variant
      if (lowerSeed.endsWith('s') && !lowerSeed.endsWith('ss') && lowerSeed.length > 3) {
        candidatePool.push({
          query: seed.substring(0, seed.length - 1),
          type: 'SINGULAR_PLURAL',
          rationale: `Singular form derivation for ${seed}`
        });
      } else if (!lowerSeed.endsWith('s')) {
        candidatePool.push({
          query: `${seed}s`,
          type: 'SINGULAR_PLURAL',
          rationale: `Plural form derivation for ${seed}`
        });
      }
    }

    // Process candidate pool through Quality Gate
    for (const item of candidatePool) {
      if (planned.length >= maxQueries) break;
      if (seedVariantCount >= maxVariantsPerSeed) break;

      const qualityCheck = validateQueryQuality(item.query, seed, existingSet);
      if (qualityCheck.valid) {
        existingSet.add(item.query.toLowerCase());
        planned.push({
          query: item.query,
          seedQuery: seed,
          variantType: item.type,
          rationale: item.rationale,
          locale,
          country: countryCode,
          sequence: sequenceCounter++,
          runId,
          status: 'PENDING'
        });
        seedVariantCount++;
      }
    }
  }

  return planned;
}

/**
 * Calculates discovery yield metric for a completed query:
 * yield = newUniqueEntities / normalizedAdsProcessed
 */
export function calculateQueryYield(newUniqueEntities: number, normalizedAdsProcessed: number): number {
  if (normalizedAdsProcessed <= 0) return 0;
  return Number((newUniqueEntities / normalizedAdsProcessed).toFixed(4));
}

/**
 * Manages runtime query frontier lifecycle, checkpointing, and saturation detection.
 */
export class QueryFrontier {
  private runId: string;
  private queries: PlannedQuery[];
  private activeIndex: number = 0;
  private completedQueries: string[] = [];
  private consecutiveZeroYieldCount: number = 0;
  private isSaturated: boolean = false;
  private saturationReason?: string;

  constructor(runId: string, initialQueries: PlannedQuery[], completed: string[] = [], activeIdx: number = 0) {
    this.runId = runId;
    this.queries = [...initialQueries];
    this.completedQueries = [...completed];
    this.activeIndex = activeIdx;
  }

  /**
   * Returns current active query or null if frontier exhausted or saturated.
   */
  public getActiveQuery(): PlannedQuery | null {
    if (this.isSaturated) return null;
    if (this.activeIndex >= this.queries.length) return null;
    return this.queries[this.activeIndex];
  }

  /**
   * Returns all planned queries in frontier.
   */
  public getQueries(): PlannedQuery[] {
    return [...this.queries];
  }

  /**
   * Records execution metrics for completed query and checks saturation.
   */
  public recordQueryMetrics(
    queryIndex: number,
    metrics: {
      rawAds: number;
      normalizedAds: number;
      newUniqueEntities: number;
      duplicateEntities: number;
      rejectedByRelevance: number;
      uncertainByRelevance: number;
    }
  ): void {
    if (queryIndex < 0 || queryIndex >= this.queries.length) return;

    const q = this.queries[queryIndex];
    q.rawAds = metrics.rawAds;
    q.normalizedAds = metrics.normalizedAds;
    q.newUniqueEntities = metrics.newUniqueEntities;
    q.duplicateEntities = metrics.duplicateEntities;
    q.rejectedByRelevance = metrics.rejectedByRelevance;
    q.uncertainByRelevance = metrics.uncertainByRelevance;
    q.yield = calculateQueryYield(metrics.newUniqueEntities, metrics.normalizedAds);
    q.status = 'COMPLETED';

    if (!this.completedQueries.includes(q.query)) {
      this.completedQueries.push(q.query);
    }

    // Saturation tracking:
    // If an expansion query (not seed) yields 0 new unique entities, increment counter
    if (q.variantType !== 'SEED') {
      if (metrics.newUniqueEntities === 0) {
        this.consecutiveZeroYieldCount++;
      } else {
        this.consecutiveZeroYieldCount = 0;
      }
    }

    // If 2 consecutive expansion queries produce zero new unique entities, mark saturated
    if (this.consecutiveZeroYieldCount >= 2) {
      this.isSaturated = true;
      this.saturationReason = 'DISCOVERY_SATURATED: Consecutive expansion queries produced zero new unique entities.';
    }

    this.activeIndex = queryIndex + 1;
  }

  /**
   * Advances active index to next query.
   */
  public advance(): void {
    this.activeIndex++;
  }

  /**
   * Checks if discovery is saturated.
   */
  public getSaturationState(): { isSaturated: boolean; reason?: string } {
    return {
      isSaturated: this.isSaturated,
      reason: this.saturationReason
    };
  }

  /**
   * Serializes frontier for persistence in chrome.storage.local / IndexedDB.
   */
  public serialize(): QueryFrontierState {
    return {
      runId: this.runId,
      activeQueryIndex: this.activeIndex,
      queries: this.queries,
      completedQueries: this.completedQueries,
      isSaturated: this.isSaturated,
      saturationReason: this.saturationReason,
      consecutiveZeroYieldCount: this.consecutiveZeroYieldCount
    };
  }

  /**
   * Restores QueryFrontier from serialized state.
   */
  public static restore(state: QueryFrontierState): QueryFrontier {
    const frontier = new QueryFrontier(
      state.runId,
      state.queries || [],
      state.completedQueries || [],
      state.activeQueryIndex || 0
    );
    frontier.isSaturated = !!state.isSaturated;
    frontier.saturationReason = state.saturationReason;
    frontier.consecutiveZeroYieldCount = state.consecutiveZeroYieldCount || 0;
    return frontier;
  }
}
