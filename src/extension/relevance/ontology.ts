/**
 * LeadNoria Deterministic Category & Industry Ontology (Phase 9)
 *
 * Provides deterministic mapping, synonym resolution, service terms,
 * negative category rules, and multilingual dictionary tables.
 *
 * Adheres to Phase 9 Sections 8, 9, 11, 12, and 25:
 * - Deterministic (no hidden ML, no random fuzzy matching).
 * - Multi-lingual: EN, BN, AR, DE, FR, ES.
 * - Negative and contradictory category detection.
 * - Negation and service phrase matching.
 */

export interface IndustryDefinition {
  id: string;
  name: string;
  canonicalCategories: string[];
  compatibleCategories: string[];
  contradictoryCategories: string[];
  serviceTerms: string[];
  negativeModifiers: string[];
  multilingualAliases: {
    bn?: string[];
    ar?: string[];
    de?: string[];
    fr?: string[];
    es?: string[];
  };
}

export const INDUSTRY_ONTOLOGY: Record<string, IndustryDefinition> = {
  roofing: {
    id: 'roofing',
    name: 'Roofing',
    canonicalCategories: [
      'roofing contractor', 'roofing service', 'roofing company',
      'commercial roofer', 'residential roofer', 'metal roofing contractor'
    ],
    compatibleCategories: [
      'general contractor', 'siding contractor', 'gutter cleaning service',
      'waterproofing company', 'building restoration service', 'construction company'
    ],
    contradictoryCategories: [
      'pet store', 'pet supplies', 'veterinarian', 'bakery', 'dentist',
      'hair salon', 'clothing store', 'florist', 'book store', 'pharmacy',
      'auto repair', 'restaurant', 'hotel', 'day care', 'supermarket'
    ],
    serviceTerms: [
      'roof repair', 'roof replacement', 'shingle replacement', 'leak detection',
      'gutter installation', 'metal roofing', 'flat roof', 'commercial roofing',
      'roof inspection', 'slate roof', 'roof flashing', 'emergency roof repair'
    ],
    negativeModifiers: [
      'supplies only', 'materials only', 'wholesaler', 'supply depot',
      'roofing jobs', 'roofing careers', 'roofing association', 'roofing magazine',
      'school of roofing', 'roofing manufacturing', 'diy roofing'
    ],
    multilingualAliases: {
      bn: ['ছাদ মেরামত', 'রুফিং ঠিকাদার', 'ছাদ নির্মাণ'],
      ar: ['مقاول أسقف', 'إصلاح الأسقف', 'عزل أسطح'],
      de: ['Dachdecker', 'Dachdeckerei', 'Dachdeckerbetrieb', 'Dachreparatur'],
      fr: ['Couvreur', 'Entreprise de toiture', 'Réparation de toiture'],
      es: ['Techador', 'Contratista de techos', 'Reparación de tejados']
    }
  },

  plumbing: {
    id: 'plumbing',
    name: 'Plumbing',
    canonicalCategories: [
      'plumber', 'plumbing service', 'plumbing contractor', 'emergency plumber',
      'drain cleaning service', 'commercial plumber'
    ],
    compatibleCategories: [
      'hvac contractor', 'water heater repair service', 'septic system service',
      'general contractor', 'gas installation service', 'pipe restoration service'
    ],
    contradictoryCategories: [
      'bakery', 'clothing store', 'dentist', 'restaurant', 'hotel',
      'jewelry store', 'hair salon', 'florist', 'pet grooming', 'law firm'
    ],
    serviceTerms: [
      'drain cleaning', 'pipe repair', 'water heater repair', 'clogged drain',
      'toilet repair', 'leak detection', 'sewer line repair', 'faucet installation',
      'hydro jetting', 'sump pump installation', 'pipe relining'
    ],
    negativeModifiers: [
      'plumbing supplies only', 'wholesaler', 'plumbing showroom', 'plumbing parts depot',
      'plumbing jobs', 'plumber apprentice', 'plumbing museum', 'not a plumber'
    ],
    multilingualAliases: {
      bn: ['প্লাম্বার', 'পাইপ মেরামত', 'স্যানিটারি মিস্ত্রি'],
      ar: ['سباك', 'خدمات سباكة', 'تسليك مجاري'],
      de: ['Klempner', 'Sanitärinstallateur', 'Installateur', 'Rohrreinigung'],
      fr: ['Plombier', 'Service de plomberie', 'Débouchage'],
      es: ['Fontanero', 'Plomero', 'Servicio de fontanería', 'Desatascos']
    }
  },

  dental: {
    id: 'dental',
    name: 'Dental',
    canonicalCategories: [
      'dentist', 'dental clinic', 'orthodontist', 'pediatric dentist',
      'cosmetic dentist', 'dental implants periodontist', 'endodontist',
      'oral surgeon'
    ],
    compatibleCategories: [
      'doctor', 'medical clinic', 'health consultant', 'hospital',
      'orthopedic clinic', 'wellness center'
    ],
    contradictoryCategories: [
      'veterinary clinic', 'pet hospital', 'auto repair', 'restaurant',
      'roofing contractor', 'plumber', 'furniture store', 'bakery'
    ],
    serviceTerms: [
      'teeth whitening', 'root canal', 'dental implants', 'orthodontics',
      'invisalign', 'braces', 'wisdom tooth extraction', 'dental crowns',
      'teeth cleaning', 'cavity filling', 'veneer installation', 'dentures'
    ],
    negativeModifiers: [
      'dental supplies only', 'dental lab only', 'dental equipment wholesaler',
      'dental school', 'dental academy', 'dental conference', 'not a dentist'
    ],
    multilingualAliases: {
      bn: ['দাঁতের ডাক্তার', 'ডেন্টাল ক্লিনিক', 'দাঁতের চিকিৎসা'],
      ar: ['طبيب أسنان', 'عيادة أسنان', 'تقويم أسنان'],
      de: ['Zahnarzt', 'Zahnarztpraxis', 'Kieferorthopäde', 'Zahnklinik'],
      fr: ['Dentiste', 'Cabinet dentaire', 'Orthodontiste', 'Clinique dentaire'],
      es: ['Dentista', 'Clínica dental', 'Ortodoncista', 'Odontólogo']
    }
  },

  hvac: {
    id: 'hvac',
    name: 'HVAC',
    canonicalCategories: [
      'hvac contractor', 'air conditioning contractor', 'heating contractor',
      'air conditioning repair service', 'furnace repair service'
    ],
    compatibleCategories: [
      'electrician', 'plumber', 'appliance repair service', 'insulation contractor',
      'sheet metal contractor'
    ],
    contradictoryCategories: [
      'restaurant', 'hotel', 'dentist', 'bakery', 'florist', 'pet salon',
      'book store', 'clothing boutique', 'lawyer'
    ],
    serviceTerms: [
      'ac repair', 'ac installation', 'furnace repair', 'heat pump installation',
      'duct cleaning', 'thermostat installation', 'air filter replacement',
      'hvac maintenance', 'ventilation repair', 'refrigerant recharge'
    ],
    negativeModifiers: [
      'parts only', 'hvac distributor', 'wholesale hvac', 'training center',
      'hvac jobs', 'association'
    ],
    multilingualAliases: {
      bn: ['এয়ার কন্ডিশনার মেরামত', 'এইচভিএসি কন্ট্রাক্টর', 'এসি সার্ভিস'],
      ar: ['تكييف وتبريد', 'صيانة مكيفات', 'فني تكييف'],
      de: ['Klimaanlagenmonteur', 'Heizungsbauer', 'Kältetechnik', 'Lüftungsbau'],
      fr: ['Climatisation', 'Chauffagiste', 'Installation CVC'],
      es: ['Aire acondicionado', 'Calefacción', 'Instalador de climatización']
    }
  },

  restaurants: {
    id: 'restaurants',
    name: 'Restaurants',
    canonicalCategories: [
      'restaurant', 'bistro', 'cafe', 'bar & grill', 'diner',
      'family restaurant', 'seafood restaurant', 'italian restaurant',
      'mexican restaurant', 'chinese restaurant', 'steak house'
    ],
    compatibleCategories: [
      'catering food and drink supplier', 'bakery', 'pub', 'food court',
      'takeout restaurant', 'brewery'
    ],
    contradictoryCategories: [
      'roofing contractor', 'dentist', 'plumber', 'auto repair',
      'law firm', 'accounting firm', 'real estate agency', 'veterinarian'
    ],
    serviceTerms: [
      'dine in', 'takeout', 'food delivery', 'outdoor seating', 'dinner menu',
      'lunch specials', 'table reservation', 'fresh ingredients', 'full bar'
    ],
    negativeModifiers: [
      'restaurant equipment only', 'restaurant supply wholesaler', 'culinary school',
      'restaurant guide', 'jobs', 'careers', 'closed permanently'
    ],
    multilingualAliases: {
      bn: ['রেস্তোরাঁ', 'খাবারের দোকান', 'ক্যাফে'],
      ar: ['مطعم', 'مقهى', 'مأكولات'],
      de: ['Restaurant', 'Gaststätte', 'Gasthof', 'Bistro'],
      fr: ['Restaurant', 'Brasserie', 'Auberge', 'Bistrot'],
      es: ['Restaurante', 'Cafetería', 'Mesón', 'Comedor']
    }
  },

  hotels: {
    id: 'hotels',
    name: 'Hotels',
    canonicalCategories: [
      'hotel', 'motel', 'boutique hotel', 'resort hotel', 'extended stay hotel',
      'bed & breakfast', 'guest house', 'inn'
    ],
    compatibleCategories: [
      'vacation home rental agency', 'hostel', 'conference center',
      'event venue', 'lodge'
    ],
    contradictoryCategories: [
      'plumber', 'dentist', 'auto repair', 'veterinarian', 'roofing contractor',
      'supermarket', 'hair salon'
    ],
    serviceTerms: [
      'room reservation', 'overnight stay', 'complimentary breakfast', 'swimming pool',
      'valet parking', 'free wifi', 'suites', 'concierge service', 'room service'
    ],
    negativeModifiers: [
      'hotel supplies only', 'hotel management school', 'booking software',
      'hotel careers', 'hotel association'
    ],
    multilingualAliases: {
      bn: ['হোটেল', 'গেস্ট হাউস', 'রিসোর্ট'],
      ar: ['فندق', 'منتجع', 'نزل'],
      de: ['Hotel', 'Pension', 'Gasthof', 'Herberge'],
      fr: ['Hôtel', 'Chambres d’hôtes', 'Auberge'],
      es: ['Hotel', 'Hostal', 'Posada', 'Alojamiento']
    }
  },

  legal_services: {
    id: 'legal_services',
    name: 'Legal Services',
    canonicalCategories: [
      'lawyer', 'law firm', 'attorney', 'legal services', 'personal injury attorney',
      'criminal defense lawyer', 'family law attorney', 'corporate attorney'
    ],
    compatibleCategories: [
      'notary public', 'mediation service', 'legal aid organization',
      'title company', 'arbitration service', 'compliance consultant', 'tax consultant'
    ],
    contradictoryCategories: [
      'restaurant', 'plumber', 'roofing contractor', 'dentist', 'auto repair',
      'furniture store', 'bakery', 'hair salon'
    ],
    serviceTerms: [
      'legal consultation', 'court representation', 'litigation', 'contract review',
      'settlement negotiation', 'estate planning', 'probate law', 'intellectual property'
    ],
    negativeModifiers: [
      'law school', 'legal software', 'paralegal academy', 'court clerk office',
      'legal forms only', 'association'
    ],
    multilingualAliases: {
      bn: ['আইনজীবী', 'উকিল', 'ল ফার্ম'],
      ar: ['محامي', 'مكتب محاماة', 'استشارات قانونية'],
      de: ['Rechtsanwalt', 'Anwaltskanzlei', 'Rechtsberatung', 'Kanzlei'],
      fr: ['Avocat', 'Cabinet d’avocats', 'Conseiller juridique'],
      es: ['Abogado', 'Bufete de abogados', 'Asesoría jurídica']
    }
  },

  real_estate: {
    id: 'real_estate',
    name: 'Real Estate',
    canonicalCategories: [
      'real estate agency', 'real estate agent', 'commercial real estate agency',
      'property management company', 'real estate consultant', 'realtor'
    ],
    compatibleCategories: [
      'mortgage broker', 'property investment company', 'title company',
      'home inspector', 'appraiser'
    ],
    contradictoryCategories: [
      'dentist', 'auto repair', 'bakery', 'plumber', 'roofing contractor',
      'pet store', 'clothing shop'
    ],
    serviceTerms: [
      'home buying', 'home selling', 'property listing', 'commercial leasing',
      'tenant screening', 'property valuation', 'open house', 'real estate closing'
    ],
    negativeModifiers: [
      'real estate school', 'licensing course', 'software only', 'portal only',
      'careers in real estate', 'real estate photography'
    ],
    multilingualAliases: {
      bn: ['রিয়েল এস্টেট এজেন্সি', 'সম্পত্তি কেনাবেচা', 'জমি বিক্রয়'],
      ar: ['عقارات', 'وكالة عقارية', 'وسيط عقاري'],
      de: ['Immobilienmakler', 'Immobilienbüro', 'Immobilienagentur'],
      fr: ['Agence immobilière', 'Agent immobilier', 'Gestion locative'],
      es: ['Inmobiliaria', 'Agente inmobiliario', 'Bienes raíces']
    }
  },

  auto_repair: {
    id: 'auto_repair',
    name: 'Auto Repair',
    canonicalCategories: [
      'auto repair shop', 'car repair and maintenance', 'brake shop',
      'transmission shop', 'oil change service', 'tire shop', 'auto mechanic'
    ],
    compatibleCategories: [
      'auto body shop', 'car inspection station', 'towing service',
      'car battery store', 'auto electrical service'
    ],
    contradictoryCategories: [
      'restaurant', 'dentist', 'lawyer', 'hotel', 'clothing store',
      'bakery', 'plumber', 'roofing contractor', 'florist'
    ],
    serviceTerms: [
      'brake repair', 'oil change', 'engine diagnostics', 'tire rotation',
      'transmission repair', 'wheel alignment', 'battery replacement',
      'exhaust repair', 'clutch replacement', 'suspension repair'
    ],
    negativeModifiers: [
      'auto parts store only', 'salvage yard only', 'car wash only',
      'mechanic school', 'racing club', 'not a mechanic'
    ],
    multilingualAliases: {
      bn: ['গাড়ি মেরামত', 'অটো রিপেয়ার', 'গ্যারেজ'],
      ar: ['ورشة سيارات', 'ميكانيكي سيارات', 'صيانة سيارات'],
      de: ['Autowerkstatt', 'Kfz-Werkstatt', 'Autoreparatur'],
      fr: ['Garage automobile', 'Réparation auto', 'Mécanicien'],
      es: ['Taller mecánico', 'Reparación de automóviles', 'Mecánico']
    }
  },

  furniture: {
    id: 'furniture',
    name: 'Furniture',
    canonicalCategories: [
      'furniture store', 'furniture maker', 'custom furniture shop',
      'office furniture store', 'outdoor furniture store', 'furniture repair shop'
    ],
    compatibleCategories: [
      'home goods store', 'interior designer', 'cabinet maker',
      'upholstery shop', 'mattress store', 'antique store'
    ],
    contradictoryCategories: [
      'roofing contractor', 'plumber', 'dentist', 'veterinarian',
      'auto repair', 'law firm', 'pharmacy', 'optometrist'
    ],
    serviceTerms: [
      'custom sofa', 'dining tables', 'bedroom sets', 'office desks',
      'woodcraft', 'upholstery service', 'furniture restoration', 'home delivery'
    ],
    negativeModifiers: [
      'furniture hardware only', 'wholesale lumber', 'furniture moving only',
      'furniture assembly app', 'diy plans'
    ],
    multilingualAliases: {
      bn: ['আসবাবপত্র', 'ফার্নিচার শপ', 'কাঠের আসবাব'],
      ar: ['متجر أثاث', 'مفروشات', 'صناعة أثاث'],
      de: ['Möbelhaus', 'Möbelgeschäft', 'Schreinerei', 'Möbelhersteller'],
      fr: ['Magasin de meubles', 'Ébéniste', 'Ameublement'],
      es: ['Tienda de muebles', 'Mueblería', 'Carpintería de muebles']
    }
  },

  it_saas: {
    id: 'it_saas',
    name: 'IT / SaaS',
    canonicalCategories: [
      'software company', 'computer support and services', 'it service provider',
      'information technology company', 'web development agency', 'cloud service provider'
    ],
    compatibleCategories: [
      'computer consultant', 'cybersecurity company', 'data recovery service',
      'telecommunications service provider', 'marketing agency'
    ],
    contradictoryCategories: [
      'restaurant', 'plumber', 'roofing contractor', 'dentist', 'bakery',
      'hair salon', 'pet store', 'auto repair'
    ],
    serviceTerms: [
      'cloud migration', 'network security', 'managed it services', 'software development',
      'data backup', 'helpdesk support', 'api integration', 'saas platform'
    ],
    negativeModifiers: [
      'coding bootcamp only', 'computer museum', 'used computer parts only',
      'electronics recycling only', 'jobs'
    ],
    multilingualAliases: {
      bn: ['সফটওয়্যার কোম্পানি', 'আইটি সার্ভিস', 'কম্পিউটার সেবা'],
      ar: ['شركة برمجيات', 'خدمات تقنية المعلومات', 'تطوير مواقع'],
      de: ['Softwareunternehmen', 'IT-Dienstleister', 'Systemhaus', 'Webentwicklung'],
      fr: ['Entreprise de logiciels', 'Services informatiques', 'Agence web'],
      es: ['Empresa de software', 'Servicios de TI', 'Desarrollo web']
    }
  },

  accounting: {
    id: 'accounting',
    name: 'Accounting',
    canonicalCategories: [
      'accounting firm', 'accountant', 'certified public accountant',
      'tax preparation service', 'bookkeeping service', 'payroll service'
    ],
    compatibleCategories: [
      'financial consultant', 'tax consultant', 'business management consultant',
      'auditor', 'financial planner'
    ],
    contradictoryCategories: [
      'plumber', 'roofing contractor', 'dentist', 'restaurant', 'hotel',
      'auto repair', 'veterinarian', 'florist'
    ],
    serviceTerms: [
      'tax preparation', 'bookkeeping', 'corporate tax return', 'payroll processing',
      'financial auditing', 'cpa consultation', 'business tax planning', 'irs audit assistance'
    ],
    negativeModifiers: [
      'accounting software only', 'accounting textbook publisher', 'accounting school',
      'careers in accounting', 'accounting jobs'
    ],
    multilingualAliases: {
      bn: ['হিসাবরক্ষণ', 'অ্যাকাউন্টিং ফার্ম', 'ট্যাক্স কনসালট্যান্ট'],
      ar: ['محاسب', 'مكتب محاسبة', 'إعداد الإقرارات الضريبية'],
      de: ['Steuerberater', 'Wirtschaftsprüfer', 'Buchhaltungsbüro', 'Steuerkanzlei'],
      fr: ['Expert-comptable', 'Cabinet comptable', 'Comptabilité'],
      es: ['Contador', 'Asesoría fiscal', 'Estudio contable', 'Gestoría']
    }
  }
};

/**
 * Normalizes text for deterministic ontology lookup.
 * Trims, lowercases, removes excessive punctuation, and normalizes Unicode.
 */
export const GENERIC_NAME_STOP_WORDS = new Set([
  'agency', 'company', 'co', 'corp', 'corporation', 'inc', 'llc', 'ltd',
  'limited', 'group', 'services', 'service', 'solutions', 'associates',
  'firm', 'center', 'centre', 'studio', 'shop', 'store', 'pros', 'care',
  'masters', 'experts', 'hub', 'depot', 'place', 'house'
]);

export function normalizeOntologyString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s&/-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function matchesCategoryPhrase(text: string, phrase: string): boolean {
  if (!text || !phrase) return false;
  if (text === phrase) return true;
  // Match as complete words/tokens
  const pattern = new RegExp(`(?:^|\\s)${escapeRegExp(phrase)}(?:$|\\s)`, 'i');
  return pattern.test(text);
}

/**
 * Finds the matching industry definition for a given keyword or category term.
 */
export function resolveIndustryForTerm(term: string): IndustryDefinition | null {
  const norm = normalizeOntologyString(term);
  if (!norm) return null;

  for (const ind of Object.values(INDUSTRY_ONTOLOGY)) {
    const normIndName = normalizeOntologyString(ind.name);
    // Exact ID or name match or phrase match with industry name
    if (norm === ind.id || norm === normIndName || matchesCategoryPhrase(norm, normIndName) || matchesCategoryPhrase(normIndName, norm)) return ind;

    // Check canonical categories with word boundary
    if (ind.canonicalCategories.some(c => {
      const normC = normalizeOntologyString(c);
      return norm === normC || matchesCategoryPhrase(norm, normC) || matchesCategoryPhrase(normC, norm);
    })) {
      return ind;
    }

    // Check multilingual aliases
    for (const aliases of Object.values(ind.multilingualAliases)) {
      if (aliases && aliases.some(a => {
        const normA = normalizeOntologyString(a);
        return norm === normA || matchesCategoryPhrase(norm, normA) || matchesCategoryPhrase(normA, norm);
      })) {
        return ind;
      }
    }
  }
  return null;
}

/**
 * Deterministically checks whether an observed category matches the intent category/keyword.
 */
export function evaluateCategoryMatch(
  observedCategory: string,
  targetKeywordOrCategory: string
): {
  isMatch: boolean;
  isCompatible: boolean;
  isContradictory: boolean;
  matchType: 'EXACT' | 'CATEGORY_MATCH' | 'CATEGORY_COMPATIBLE' | 'CONTRADICTORY_MATCH' | 'NO_MATCH';
  industryId?: string;
  matchedCategory?: string;
} {
  const normObs = normalizeOntologyString(observedCategory);
  const normTarget = normalizeOntologyString(targetKeywordOrCategory);

  if (!normObs || !normTarget) {
    return { isMatch: false, isCompatible: false, isContradictory: false, matchType: 'NO_MATCH' };
  }

  // Exact direct text match
  if (normObs === normTarget) {
    return { isMatch: true, isCompatible: true, isContradictory: false, matchType: 'EXACT', matchedCategory: normObs };
  }

  // Token / phrase match on word boundaries
  if (matchesCategoryPhrase(normObs, normTarget) || matchesCategoryPhrase(normTarget, normObs)) {
    return { isMatch: true, isCompatible: true, isContradictory: false, matchType: 'CATEGORY_MATCH', matchedCategory: normObs };
  }

  // Industry ontology lookup
  const targetIndustry = resolveIndustryForTerm(normTarget);
  const obsIndustry = resolveIndustryForTerm(normObs);

  if (targetIndustry) {
    // Canonical match in target industry
    const isCanonical = targetIndustry.canonicalCategories.some(c => {
      const normC = normalizeOntologyString(c);
      return normC === normObs || matchesCategoryPhrase(normObs, normC) || matchesCategoryPhrase(normC, normObs);
    });
    if (isCanonical) {
      return { isMatch: true, isCompatible: true, isContradictory: false, matchType: 'CATEGORY_MATCH', industryId: targetIndustry.id, matchedCategory: normObs };
    }

    // Check multilingual aliases
    for (const aliases of Object.values(targetIndustry.multilingualAliases)) {
      if (aliases && aliases.some(a => {
        const normA = normalizeOntologyString(a);
        return normA === normObs || matchesCategoryPhrase(normObs, normA);
      })) {
        return { isMatch: true, isCompatible: true, isContradictory: false, matchType: 'CATEGORY_MATCH', industryId: targetIndustry.id, matchedCategory: normObs };
      }
    }

    // Check compatible categories
    const isCompatible = targetIndustry.compatibleCategories.some(c => {
      const normC = normalizeOntologyString(c);
      return normC === normObs || matchesCategoryPhrase(normObs, normC) || matchesCategoryPhrase(normC, normObs);
    });
    if (isCompatible) {
      return { isMatch: false, isCompatible: true, isContradictory: false, matchType: 'CATEGORY_COMPATIBLE', industryId: targetIndustry.id, matchedCategory: normObs };
    }

    // Check contradictory categories
    const isContradictory = targetIndustry.contradictoryCategories.some(c => {
      const normC = normalizeOntologyString(c);
      return normC === normObs || matchesCategoryPhrase(normObs, normC);
    });
    if (isContradictory) {
      return { isMatch: false, isCompatible: false, isContradictory: true, matchType: 'CONTRADICTORY_MATCH', industryId: targetIndustry.id, matchedCategory: normObs };
    }

    // Cross-industry contradiction check: if observed belongs to a known distinct industry
    if (obsIndustry && obsIndustry.id !== targetIndustry.id) {
      // If the observed industry is explicitly in target's contradictory list, or target is in observed's contradictory list
      const mutuallyContradictory =
        targetIndustry.contradictoryCategories.some(c => normalizeOntologyString(c) === normalizeOntologyString(obsIndustry.name) || normalizeOntologyString(c) === obsIndustry.id) ||
        obsIndustry.contradictoryCategories.some(c => normalizeOntologyString(c) === normalizeOntologyString(targetIndustry.name) || normalizeOntologyString(c) === targetIndustry.id);

      if (mutuallyContradictory) {
        return { isMatch: false, isCompatible: false, isContradictory: true, matchType: 'CONTRADICTORY_MATCH', industryId: targetIndustry.id, matchedCategory: normObs };
      }
    }
  }

  return { isMatch: false, isCompatible: false, isContradictory: false, matchType: 'NO_MATCH' };
}

/**
 * Scans text for positive service terms relevant to the target industry or keyword.
 */
export function extractServiceMatches(
  text: string,
  targetKeywordOrCategory: string
): string[] {
  if (!text) return [];
  const normText = normalizeOntologyString(text);
  const industry = resolveIndustryForTerm(targetKeywordOrCategory);
  if (!industry) return [];

  const matched: string[] = [];
  for (const st of industry.serviceTerms) {
    const normSt = normalizeOntologyString(st);
    if (normText.includes(normSt)) {
      matched.push(st);
    }
  }
  return matched;
}

import type { NegationContextType } from './types.ts';

export interface NegationDetectionResult {
  term: string;
  contextType: NegationContextType;
  isDecisive: boolean;
  explanation: string;
}

/**
 * Context-aware negative evidence detection (Phase 9A Section 1 & 5).
 * Distinguishes ENTITY_LEVEL_NEGATION, PAGE_CONTEXT_TERM, and INCIDENTAL_TEXT.
 */
export function detectContextualNegation(
  text: string,
  targetKeywordOrCategory: string,
  sourceFieldName?: string
): NegationDetectionResult[] {
  if (!text) return [];
  const normText = normalizeOntologyString(text);
  const normTarget = normalizeOntologyString(targetKeywordOrCategory);
  const results: NegationDetectionResult[] = [];

  // 1. ENTITY_LEVEL_NEGATION
  // Explicit entity negation of business identity or permanent operational cessation
  const entityNegationPatterns = [
    'not a ', 'not an ', 'we are not a', 'not offering ',
    'permanently closed', 'fake', 'scam', 'defunct'
  ];

  for (const pat of entityNegationPatterns) {
    if (normText.includes(pat)) {
      results.push({
        term: pat.trim(),
        contextType: 'ENTITY_LEVEL_NEGATION',
        isDecisive: true,
        explanation: `Explicit entity-level negation observed: "${pat.trim()}"`
      });
    }
  }

  // Also check if text has "not a <target/keyword>" specifically
  if (normTarget && (normText.includes(`not a ${normTarget}`) || normText.includes(`not an ${normTarget}`))) {
    results.push({
      term: `not a ${normTarget}`,
      contextType: 'ENTITY_LEVEL_NEGATION',
      isDecisive: true,
      explanation: `Explicit denial of requested service/business: "not a ${normTarget}"`
    });
  }

  // Exclusive limitations (e.g. "supplies only", "materials only")
  // When target specifically requires a contractor or service provider, "... only" contradicts contracting services
  const exclusiveLimitationPatterns = [
    'supplies only', 'materials only', 'wholesale only', 'parts only', 'equipment only'
  ];

  for (const pat of exclusiveLimitationPatterns) {
    if (normText.includes(pat)) {
      const targetRequiresContractor = normTarget.includes('contractor') || normTarget.includes('service') || normTarget.includes('repair') || normTarget.includes('clinic');
      results.push({
        term: pat,
        contextType: 'ENTITY_LEVEL_NEGATION',
        isDecisive: targetRequiresContractor,
        explanation: `Exclusive business limitation "${pat}" evaluated against requested intent "${targetKeywordOrCategory}"`
      });
    }
  }

  // 2. PAGE_CONTEXT_TERM
  // Navigation, portal, job, or legal context terms that appear in page titles or descriptions
  // These must NOT mark the underlying business irrelevant!
  const pageContextPatterns = [
    'careers', 'jobs', 'hiring', 'employment', 'vacancies',
    'privacy policy', 'terms of service', 'terms of use', 'portal login', 'employee portal'
  ];

  for (const pat of pageContextPatterns) {
    const regex = new RegExp(`(?:^|\\b|\\s|[-—|])${pat}(?:$|\\b|\\s|[-—|])`, 'i');
    if (regex.test(normText)) {
      results.push({
        term: pat,
        contextType: 'PAGE_CONTEXT_TERM',
        isDecisive: false,
        explanation: `Incidental page context term "${pat}" detected (e.g. careers/jobs/portal); does not negate business identity.`
      });
    }
  }

  // 3. INCIDENTAL_TEXT
  // Terms like "wholesale", "association", "supplies", "museum", "fan club", "directory"
  const incidentalPatterns = [
    'association', 'society', 'wholesale', 'distributor', 'supplies', 'parts', 'directory', 'museum', 'fan club', 'parody'
  ];

  for (const pat of incidentalPatterns) {
    const regex = new RegExp(`(?:^|\\b|\\s)${pat}(?:$|\\b|\\s)`, 'i');
    if (regex.test(normText)) {
      // Is this term part of the user's intent? (e.g. user searched for "roofing wholesale" or "dental association")
      if (normTarget.includes(pat)) {
        // User requested this term! Not a negative at all.
        continue;
      }

      // If user requested a general term like "roofing", "association" or "wholesale" is domain-related!
      // It is NOT a decisive negation.
      const isDecisive = pat === 'parody' || pat === 'fake' || pat === 'scam';
      results.push({
        term: pat,
        contextType: 'INCIDENTAL_TEXT',
        isDecisive,
        explanation: `Descriptive modifier "${pat}" observed; evaluated contextually against requested intent.`
      });
    }
  }

  return results;
}

/**
 * Checks if a string contains decisive negative modifier tokens.
 */
export function detectNegativeModifiers(
  text: string,
  targetKeywordOrCategory: string
): string[] {
  const contextual = detectContextualNegation(text, targetKeywordOrCategory);
  return contextual.filter(c => c.isDecisive).map(c => c.term);
}
