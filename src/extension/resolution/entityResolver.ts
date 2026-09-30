/**
 * LeadNoria Entity Resolution & Deduplication Engine (Phase 8, corrected 8A)
 *
 * Implements deterministic multi-signal entity identity resolution,
 * branch differentiation, contradiction detection, and deduplication
 * for normalized candidate envelopes.
 *
 * INVARIANTS:
 * 1. ZERO DOM scraping, ZERO live Google Maps extraction.
 * 2. ZERO modification of frozen Meta production behavior.
 * 3. Never merge different branches of the same brand into one physical entity.
 * 4. Never merge on name alone, category alone, or city alone.
 * 5. Never merge on phone + address alone without compatible identity corroborator.
 * 6. Marketplace and generic shared domains never act as sole identity anchors.
 * 7. Provenance & Policy Firewall strictly preserved:
 *    Merged entity containing GOOGLE_CONSUMER_WEB_RESTRICTED remains strictly
 *    NOT_PERSISTABLE and NOT_EXPORTABLE.
 * 8. Indexed blocking reduces comparisons in observed distributions, but bucket
 *    size can increase pairwise work. We do NOT claim worst-case O(N) linearity.
 */

import { createHash } from 'node:crypto';
import type {
  NormalizedCandidate,
  SourceContribution,
  PolicyStatus,
  PersistenceStatus,
  ExportStatus,
  ProvenanceType
} from '../extraction/types.ts';

import type {
  ResolvedEntityGroup,
  EntityResolutionResult,
  CandidatePairComparison,
  EntityRelationshipLink,
  EntityRelationshipType,
  ResolutionStatus,
  ResolutionConfidence,
  IdentityEvidenceItem,
  IdentityConflictItem,
  BranchSignal,
  EntityPolicySummary,
  ResolutionOptions,
  DeduplicationSummary
} from './types.ts';

// Generic shorteners, multi-tenant marketplace platforms, and hosting services
// Domains in this set MUST NEVER act as sole identity anchors for entity merging
export const GENERIC_SHARED_DOMAINS = new Set([
  'facebook.com', 'web.facebook.com', 'm.facebook.com', 'l.facebook.com',
  'instagram.com', 'wa.me', 'api.whatsapp.com', 'whatsapp.com',
  't.me', 'telegram.me', 'youtube.com', 'youtu.be',
  'linktr.ee', 'bio.link', 'beacons.ai', 'campsite.bio',
  'forms.gle', 'docs.google.com', 'drive.google.com', 'google.com',
  'typeform.com', 'calendly.com',
  'bit.ly', 'tinyurl.com', 'ow.ly', 'rebrand.ly', 't.co',
  'amazon.com', 'amazon.co.uk', 'amazon.in', 'amazon.de',
  'ebay.com', 'etsy.com', 'daraz.com.bd', 'daraz.pk', 'daraz.lk',
  'walmart.com', 'target.com', 'aliexpress.com', 'alibaba.com',
  'myshopify.com', 'shopee.com', 'lazada.com', 'yelp.com',
  'tripadvisor.com', 'yellowpages.com'
]);

// Short generic brand tokens that require strong multi-field corroboration before merging
export const GENERIC_BRAND_TOKENS = new Set([
  'apex', 'nova', 'home', 'design', 'elite', 'furniture', 'store', 'shop',
  'studio', 'center', 'mart', 'market', 'group', 'house', 'city', 'star',
  'royal', 'classic', 'modern', 'prime', 'best', 'super', 'mega', 'global',
  'trading', 'agency', 'services', 'solutions', 'clinic', 'restaurant',
  'cafe', 'hotel', 'construction', 'dentist', 'dental', 'salon', 'spa'
]);

// Common branch keywords in names, addresses, or URL slugs
const BRANCH_KEYWORDS = [
  'branch', 'branch office', 'outlet', 'showroom', 'location',
  'head office', 'corporate office', 'main branch', 'flagship',
  'shakha', 'bazar', 'road', 'sector', 'block', 'plaza', 'mall',
  'point', 'zone', 'campus', 'substation'
];

/**
 * Generates a stable, deterministic entity ID based on a canonical anchor string.
 */
export function generateDeterministicEntityId(anchor: string): string {
  const hash = createHash('sha256').update(anchor.trim().toLowerCase()).digest('hex');
  return `ent_${hash.slice(0, 16)}`;
}

/**
 * Extracts the canonical parent brand key by removing branch qualifiers,
 * locality markers, and parenthesized content.
 */
export function extractParentBrandName(name: string): string {
  if (!name) return '';

  // 1. Remove content inside parentheses or brackets
  let clean = name.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();

  // 2. Remove dash/hyphenated branch markers (e.g., "Subway - Store #1024" -> "Subway")
  if (clean.includes(' - ') || clean.includes(' – ')) {
    const parts = clean.split(/\s*[-–]\s*/);
    if (parts[0] && parts[0].length >= 3) {
      clean = parts[0];
    }
  }

  // 3. Remove branch keywords and following words
  for (const kw of BRANCH_KEYWORDS) {
    const regex = new RegExp(`\\b${kw}\\b.*$`, 'i');
    const stripped = clean.replace(regex, '').trim();
    if (stripped.length >= 3) {
      clean = stripped;
      break;
    }
  }

  return clean
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts normalized phone string across e164, international, or normalized representations.
 */
export function getCandidatePhone(candidate: NormalizedCandidate): string | undefined {
  const p = candidate.phones?.[0]?.value;
  if (!p) return undefined;
  return p.e164Format || p.internationalFormat || (p as any).normalizedPhone || (p.isValid ? p.rawPhone : undefined);
}

/**
 * Detects branch indicators across business name, display name, and address.
 */
export function detectBranchSignals(
  candidate: NormalizedCandidate
): BranchSignal[] {
  const signals: BranchSignal[] = [];
  const displayName = candidate.businessName.value.displayName || '';
  const normalizedName = candidate.businessName.value.normalizedName || '';
  const street = candidate.address?.value?.addressLine1 || candidate.address?.value?.displayAddress || '';
  const locality = candidate.address?.value?.locality || '';

  // Check explicit branch markers in parentheses or brackets (e.g., "(Uttara Branch)")
  const parenMatch = displayName.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const content = parenMatch[1].toLowerCase();
    for (const kw of BRANCH_KEYWORDS) {
      if (content.includes(kw)) {
        signals.push({
          type: 'EXPLICIT_LABEL',
          token: parenMatch[1],
          confidence: 'STRONG'
        });
        break;
      }
    }
  }

  // Check keyword tokens in name
  for (const kw of BRANCH_KEYWORDS) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(displayName) || regex.test(normalizedName)) {
      if (!signals.some(s => s.token.toLowerCase() === kw)) {
        signals.push({
          type: 'KEYWORD',
          token: kw,
          confidence: 'STRONG'
        });
      }
    }
  }

  // Check if locality is explicitly embedded in the name (e.g., "ABC Furniture Dhanmondi")
  if (locality && locality.length > 2) {
    const locRegex = new RegExp(`\\b${locality.toLowerCase()}\\b`, 'i');
    if (locRegex.test(normalizedName)) {
      signals.push({
        type: 'LOCALITY',
        token: locality,
        confidence: 'STRONG'
      });
    }
  }

  // Check URL path slugs for location/branch indicators (e.g., /dhaka, /branches/uttara)
  const normUrl = candidate.websiteUrl?.value?.normalizedUrl;
  if (normUrl) {
    try {
      const parsed = new URL(normUrl);
      const pathname = parsed.pathname.toLowerCase();
      for (const kw of BRANCH_KEYWORDS) {
        if (pathname.includes(kw)) {
          signals.push({
            type: 'URL_SLUG',
            token: pathname,
            confidence: 'MODERATE'
          });
          break;
        }
      }
    } catch {
      // ignore invalid URL
    }
  }

  return signals;
}

/**
 * Checks whether a business comparison name consists solely of generic brand tokens.
 */
export function isGenericBrandName(comparisonName: string): boolean {
  const tokens = comparisonName.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  if (tokens.length === 1 && GENERIC_BRAND_TOKENS.has(tokens[0])) return true;
  return tokens.every(t => GENERIC_BRAND_TOKENS.has(t));
}

/**
 * Compares two normalized candidates deterministically using the Phase 8 hierarchy.
 */
export function compareCandidates(
  a: NormalizedCandidate,
  b: NormalizedCandidate,
  options: ResolutionOptions = {}
): CandidatePairComparison {
  const reasons: string[] = [];
  const evidence: IdentityEvidenceItem[] = [];
  const conflicts: IdentityConflictItem[] = [];
  const branchSignals: BranchSignal[] = [];

  const aId = a.candidateId;
  const bId = b.candidateId;

  // 1. EXACT STABLE SOURCE RECORD ID (Same source & context)
  const aSrcId = a.sourceIdentifier.sourceRecordId;
  const bSrcId = b.sourceIdentifier.sourceRecordId;
  const sameSourceType = a.source === b.source;
  const sameSourceContext = a.acquisitionContext === b.acquisitionContext;

  if (sameSourceType && sameSourceContext && aSrcId && bSrcId && aSrcId === bSrcId) {
    evidence.push({
      field: 'sourceRecordId',
      relationship: 'EXACT_MATCH',
      strength: 'STRONG',
      description: `Exact stable source identifier match within ${a.source} (${aSrcId})`,
      candidateAId: aId,
      candidateBId: bId
    });
    reasons.push('EXACT_SOURCE_ID_MATCH');
    return {
      candidateAId: aId,
      candidateBId: bId,
      relationshipType: 'SAME_ENTITY',
      resolutionStatus: 'STRONG_MATCH',
      confidence: 'STRONG',
      reasons,
      evidence,
      conflicts,
      branchSignals
    };
  }

  // Extract core candidate comparison primitives
  const aNameComp = a.businessName.value.comparisonName || '';
  const bNameComp = b.businessName.value.comparisonName || '';
  const aNameNorm = a.businessName.value.normalizedName || '';
  const bNameNorm = b.businessName.value.normalizedName || '';

  const aDomain = a.websiteUrl?.value?.canonicalDomain?.toLowerCase();
  const bDomain = b.websiteUrl?.value?.canonicalDomain?.toLowerCase();
  const hasValidDomainA = Boolean(aDomain && !GENERIC_SHARED_DOMAINS.has(aDomain));
  const hasValidDomainB = Boolean(bDomain && !GENERIC_SHARED_DOMAINS.has(bDomain));
  const sameDomain = hasValidDomainA && hasValidDomainB && aDomain === bDomain;

  const aPhone = getCandidatePhone(a);
  const bPhone = getCandidatePhone(b);
  const samePhone = Boolean(aPhone && bPhone && aPhone === bPhone);

  const aStreet = (a.address?.value?.addressLine1 || (a.address?.value as any)?.street || a.address?.value?.displayAddress || '')?.toLowerCase()?.trim();
  const bStreet = (b.address?.value?.addressLine1 || (b.address?.value as any)?.street || b.address?.value?.displayAddress || '')?.toLowerCase()?.trim();
  const aLocality = a.address?.value?.locality?.toLowerCase()?.trim();
  const bLocality = b.address?.value?.locality?.toLowerCase()?.trim();
  const aPostal = a.address?.value?.postalCode?.trim();
  const bPostal = b.address?.value?.postalCode?.trim();
  const aCountry = a.address?.value?.countryCode || (a as any).countryCode;
  const bCountry = b.address?.value?.countryCode || (b as any).countryCode;

  const sameCountry = Boolean(aCountry && bCountry && aCountry === bCountry);
  const sameLocality = Boolean(aLocality && bLocality && aLocality === bLocality);
  const sameStreet = Boolean(aStreet && bStreet && aStreet === bStreet);
  const samePostal = Boolean(aPostal && bPostal && aPostal === bPostal);

  const aAddrNorm = a.address?.value?.normalizedAddress?.toLowerCase()?.trim();
  const bAddrNorm = b.address?.value?.normalizedAddress?.toLowerCase()?.trim();
  const exactAddressMatch = Boolean(
    (aAddrNorm && bAddrNorm && aAddrNorm === bAddrNorm) ||
    (sameStreet && (samePostal || sameLocality || sameCountry || (!aPostal && !bPostal)))
  );

  // Branch signals detection on both candidates
  const aBranches = detectBranchSignals(a);
  const bBranches = detectBranchSignals(b);
  const combinedBranches = [...aBranches, ...bBranches];
  branchSignals.push(...combinedBranches);

  // Compare business names & parent brands
  const exactNameCompMatch = Boolean(aNameComp && bNameComp && aNameComp === bNameComp);
  const exactNameNormMatch = Boolean(aNameNorm && bNameNorm && aNameNorm === bNameNorm);
  const nameIsGeneric = isGenericBrandName(aNameComp) || isGenericBrandName(bNameComp);

  const aCompressed = aNameComp.replace(/\s+/g, '');
  const bCompressed = bNameComp.replace(/\s+/g, '');
  const sameCompressedName = Boolean(aCompressed && bCompressed && aCompressed === bCompressed);

  const aParentBrand = extractParentBrandName(a.businessName.value.displayName || aNameComp);
  const bParentBrand = extractParentBrandName(b.businessName.value.displayName || bNameComp);
  const parentBrandMatch = exactNameCompMatch ||
    sameCompressedName ||
    Boolean(aParentBrand && bParentBrand && aParentBrand === bParentBrand) ||
    (aNameComp.length > 3 && bNameComp.length > 3 &&
      (aNameComp.startsWith(bNameComp) || bNameComp.startsWith(aNameComp)));

  // CONTRADICTION CHECK 1: Country mismatch
  if (aCountry && bCountry && aCountry !== bCountry) {
    conflicts.push({
      field: 'countryCode',
      conflictType: 'GEOGRAPHIC_MISMATCH',
      description: `Incompatible countries: ${aCountry} vs ${bCountry}`,
      candidateAId: aId,
      candidateBId: bId
    });
  }

  // CONTRADICTION CHECK 2: Distinct non-generic domains with same name
  if (hasValidDomainA && hasValidDomainB && aDomain !== bDomain) {
    conflicts.push({
      field: 'canonicalDomain',
      conflictType: 'DISTINCT_DOMAIN_CONFLICT',
      description: `Different primary business domains: ${aDomain} vs ${bDomain}`,
      candidateAId: aId,
      candidateBId: bId
    });
  }

  // CONTRADICTION CHECK 3: Same domain with completely contradictory business names
  if (sameDomain && aNameComp && bNameComp && !parentBrandMatch) {
    conflicts.push({
      field: 'businessName',
      conflictType: 'CONTRADICTORY_NAME_ON_SAME_DOMAIN',
      description: `Contradictory business names on domain ${aDomain}: "${a.businessName.value.displayName}" vs "${b.businessName.value.displayName}"`,
      candidateAId: aId,
      candidateBId: bId
    });
  }

  // If hard contradiction detected
  if (conflicts.length > 0) {
    reasons.push('CONTRADICTION_DETECTED');
    return {
      candidateAId: aId,
      candidateBId: bId,
      relationshipType: 'CONFLICTING_ENTITY',
      resolutionStatus: 'CONFLICTING_IDENTITY',
      confidence: 'STRONG',
      reasons,
      evidence,
      conflicts,
      branchSignals
    };
  }

  // BRANCH DIFFERENTIATION CHECK:
  // Same parent brand, but distinct physical locations or branch tokens.
  // Uses structured locality/address comparison — NOT hardcoded city lists.
  const hasBranchTokens = combinedBranches.length > 0;
  const distinctLocalities = Boolean(aLocality && bLocality && aLocality !== bLocality);
  const distinctStreets = Boolean(aStreet && bStreet && aStreet !== bStreet);
  const distinctPostal = Boolean(aPostal && bPostal && aPostal !== bPostal);
  const distinctRegion = Boolean(
    a.address?.value?.region && b.address?.value?.region &&
    a.address.value.region.toLowerCase() !== b.address.value.region.toLowerCase()
  );
  // Structured physical-location divergence: any structured field that distinguishes locations
  const hasStructuralLocationDifference = distinctLocalities || distinctPostal || distinctRegion;

  // Branch detection: parentBrandMatch + (branch tokens OR structured location difference
  //   OR distinct streets without same phone/address forcing a merge)
  if (parentBrandMatch && (hasBranchTokens || hasStructuralLocationDifference || (distinctStreets && !samePhone))) {
    evidence.push({
      field: 'businessName',
      relationship: 'PARENT_BRAND_COMPATIBLE',
      strength: 'STRONG',
      description: `Parent brand agrees ("${aNameComp}"), but branch or location differs`,
      candidateAId: aId,
      candidateBId: bId
    });

    if (distinctLocalities) {
      evidence.push({
        field: 'locality',
        relationship: 'LOCALITY_DIFFERENCE',
        strength: 'STRONG',
        description: `Different physical branches: "${aLocality}" vs "${bLocality}"`,
        candidateAId: aId,
        candidateBId: bId
      });
    }

    if (distinctStreets) {
      evidence.push({
        field: 'address',
        relationship: 'ADDRESS_DIFFERENCE',
        strength: 'STRONG',
        description: `Different street addresses: "${aStreet}" vs "${bStreet}"`,
        candidateAId: aId,
        candidateBId: bId
      });
    }

    reasons.push('SAME_PARENT_BRAND_DIFFERENT_BRANCH');
    return {
      candidateAId: aId,
      candidateBId: bId,
      relationshipType: 'SAME_PARENT_BRAND_DIFFERENT_BRANCH',
      resolutionStatus: 'MODERATE_MATCH',
      confidence: 'STRONG',
      reasons,
      evidence,
      conflicts,
      branchSignals
    };
  }

  // GENERIC BRAND GUARD:
  // If brand is generic (e.g. "Furniture Store", "Apex", "Elite"), require at least 2 strong corroborating signals
  if (nameIsGeneric) {
    reasons.push('GENERIC_BRAND_NAME_GUARD');
    let corroborations = 0;

    if (sameDomain) {
      corroborations++;
      evidence.push({
        field: 'canonicalDomain',
        relationship: 'EXACT_MATCH',
        strength: 'STRONG',
        description: `Corroborating domain: ${aDomain}`,
        candidateAId: aId,
        candidateBId: bId
      });
    }

    if (samePhone) {
      corroborations++;
      evidence.push({
        field: 'phone',
        relationship: 'EXACT_MATCH',
        strength: 'STRONG',
        description: `Corroborating phone: ${aPhone}`,
        candidateAId: aId,
        candidateBId: bId
      });
    }

    if (exactAddressMatch) {
      corroborations++;
      evidence.push({
        field: 'address',
        relationship: 'EXACT_MATCH',
        strength: 'STRONG',
        description: `Corroborating exact address: ${aStreet}, ${aLocality}`,
        candidateAId: aId,
        candidateBId: bId
      });
    }

    if (corroborations >= 2) {
      reasons.push('CORROBORATED_GENERIC_BRAND_MERGE');
      return {
        candidateAId: aId,
        candidateBId: bId,
        relationshipType: 'SAME_ENTITY',
        resolutionStatus: 'STRONG_MATCH',
        confidence: 'STRONG',
        reasons,
        evidence,
        conflicts,
        branchSignals
      };
    } else {
      reasons.push('UNRESOLVED_GENERIC_BRAND_INSUFFICIENT_EVIDENCE');
      return {
        candidateAId: aId,
        candidateBId: bId,
        relationshipType: 'UNRESOLVED',
        resolutionStatus: 'UNRESOLVED',
        confidence: 'UNRESOLVED',
        reasons,
        evidence,
        conflicts,
        branchSignals
      };
    }
  }

  // STANDARD ENTITY RESOLUTION HIERARCHY

  // Signal A: Exact Domain + Compatible Name
  // BRANCH SAFETY: Even if domain matches and name matches, if the two candidates
  // have distinct physical addresses and at least one has a locality, this is a branch.
  if (sameDomain && parentBrandMatch) {
    // Branch safety check: same domain + same name + different addresses = branch, not merge
    if (distinctStreets && (aLocality || bLocality)) {
      evidence.push({
        field: 'canonicalDomain',
        relationship: 'EXACT_MATCH',
        strength: 'STRONG',
        description: `Same canonical domain: ${aDomain}`,
        candidateAId: aId,
        candidateBId: bId
      });
      evidence.push({
        field: 'address',
        relationship: 'ADDRESS_DIFFERENCE',
        strength: 'STRONG',
        description: `Different street addresses despite same domain: "${aStreet}" vs "${bStreet}"`,
        candidateAId: aId,
        candidateBId: bId
      });
      reasons.push('SAME_DOMAIN_DIFFERENT_ADDRESS_BRANCH');
      return {
        candidateAId: aId,
        candidateBId: bId,
        relationshipType: 'SAME_PARENT_BRAND_DIFFERENT_BRANCH',
        resolutionStatus: 'MODERATE_MATCH',
        confidence: 'STRONG',
        reasons,
        evidence,
        conflicts,
        branchSignals
      };
    }

    evidence.push({
      field: 'canonicalDomain',
      relationship: 'EXACT_MATCH',
      strength: 'STRONG',
      description: `Exact matching canonical domain: ${aDomain}`,
      candidateAId: aId,
      candidateBId: bId
    });
    evidence.push({
      field: 'businessName',
      relationship: 'COMPATIBLE',
      strength: 'STRONG',
      description: `Compatible business name: ${aNameComp}`,
      candidateAId: aId,
      candidateBId: bId
    });
    reasons.push('SAME_DOMAIN_AND_COMPATIBLE_NAME');
    return {
      candidateAId: aId,
      candidateBId: bId,
      relationshipType: 'SAME_ENTITY',
      resolutionStatus: 'STRONG_MATCH',
      confidence: 'STRONG',
      reasons,
      evidence,
      conflicts,
      branchSignals
    };
  }

  // Signal B: Exact Phone + Compatible Name + Locality Agreement
  if (samePhone && parentBrandMatch && (sameLocality || (!aLocality && !bLocality))) {
    evidence.push({
      field: 'phone',
      relationship: 'EXACT_MATCH',
      strength: 'STRONG',
      description: `Exact matching normalized phone: ${aPhone}`,
      candidateAId: aId,
      candidateBId: bId
    });
    evidence.push({
      field: 'businessName',
      relationship: 'COMPATIBLE',
      strength: 'STRONG',
      description: `Compatible business name: ${aNameComp}`,
      candidateAId: aId,
      candidateBId: bId
    });
    reasons.push('SAME_PHONE_AND_COMPATIBLE_NAME');
    return {
      candidateAId: aId,
      candidateBId: bId,
      relationshipType: 'SAME_ENTITY',
      resolutionStatus: 'STRONG_MATCH',
      confidence: 'STRONG',
      reasons,
      evidence,
      conflicts,
      branchSignals
    };
  }

  // Signal C: Exact Address + Compatible Name
  if (exactAddressMatch && parentBrandMatch) {
    evidence.push({
      field: 'address',
      relationship: 'EXACT_MATCH',
      strength: 'STRONG',
      description: `Exact address match: ${aStreet}, ${aLocality}`,
      candidateAId: aId,
      candidateBId: bId
    });
    evidence.push({
      field: 'businessName',
      relationship: 'COMPATIBLE',
      strength: 'STRONG',
      description: `Compatible business name: ${aNameComp}`,
      candidateAId: aId,
      candidateBId: bId
    });
    reasons.push('SAME_ADDRESS_AND_COMPATIBLE_NAME');
    return {
      candidateAId: aId,
      candidateBId: bId,
      relationshipType: 'SAME_ENTITY',
      resolutionStatus: 'STRONG_MATCH',
      confidence: 'STRONG',
      reasons,
      evidence,
      conflicts,
      branchSignals
    };
  }

  // Signal C2: Exact Phone + Exact Address
  // CORRECTION 8A: Phone + Address alone is NOT sufficient for SAME_ENTITY.
  // Requires at least one compatible identity corroborator:
  //   - compatible name / parent brand
  //   - compatible canonical domain
  //   - compatible source-local identity
  // Without a corroborator, phone+address alone remains UNRESOLVED.
  if (samePhone && exactAddressMatch) {
    // Check for at least one identity corroborator
    const hasNameCorroboration = parentBrandMatch;
    const hasDomainCorroboration = sameDomain;
    const hasSourceIdCorroboration = sameSourceType && sameSourceContext && aSrcId && bSrcId && aSrcId === bSrcId;

    // Cross-script multilingual corroboration: when names are in different Unicode script
    // blocks (e.g., Bengali vs Latin, Arabic vs Latin), the comparison names cannot match
    // by string equality but are NOT conflicting. Combined with phone + address + locality
    // + country, this constitutes overwhelming geographic identity corroboration.
    const isLatin = (s: string) => /^[\u0000-\u024F\u1E00-\u1EFF\s\d\p{P}]+$/u.test(s);
    const hasCrossScriptCorroboration = Boolean(
      aNameComp && bNameComp &&
      aNameComp !== bNameComp &&
      ((isLatin(aNameComp) && !isLatin(bNameComp)) || (!isLatin(aNameComp) && isLatin(bNameComp))) &&
      sameLocality && sameCountry
    );

    if (hasNameCorroboration || hasDomainCorroboration || hasSourceIdCorroboration || hasCrossScriptCorroboration) {
      evidence.push({
        field: 'phone',
        relationship: 'EXACT_MATCH',
        strength: 'STRONG',
        description: `Exact matching normalized phone: ${aPhone}`,
        candidateAId: aId,
        candidateBId: bId
      });
      evidence.push({
        field: 'address',
        relationship: 'EXACT_MATCH',
        strength: 'STRONG',
        description: `Exact matching physical address: ${aStreet}`,
        candidateAId: aId,
        candidateBId: bId
      });
      if (hasNameCorroboration) {
        evidence.push({
          field: 'businessName',
          relationship: 'COMPATIBLE',
          strength: 'STRONG',
          description: `Identity corroborator: compatible business name: ${aNameComp}`,
          candidateAId: aId,
          candidateBId: bId
        });
      }
      if (hasDomainCorroboration) {
        evidence.push({
          field: 'canonicalDomain',
          relationship: 'EXACT_MATCH',
          strength: 'STRONG',
          description: `Identity corroborator: matching canonical domain: ${aDomain}`,
          candidateAId: aId,
          candidateBId: bId
        });
      }
      reasons.push('SAME_PHONE_AND_ADDRESS_WITH_IDENTITY_CORROBORATION');
      return {
        candidateAId: aId,
        candidateBId: bId,
        relationshipType: 'SAME_ENTITY',
        resolutionStatus: 'STRONG_MATCH',
        confidence: 'STRONG',
        reasons,
        evidence,
        conflicts,
        branchSignals
      };
    } else {
      // Phone + Address WITHOUT compatible identity corroboration: NOT SAME_ENTITY
      evidence.push({
        field: 'phone',
        relationship: 'EXACT_MATCH',
        strength: 'MODERATE',
        description: `Shared phone at same address but incompatible identities: ${aPhone}`,
        candidateAId: aId,
        candidateBId: bId
      });
      reasons.push('PHONE_ADDRESS_MATCH_WITHOUT_IDENTITY_CORROBORATION');
      return {
        candidateAId: aId,
        candidateBId: bId,
        relationshipType: 'DIFFERENT_ENTITY',
        resolutionStatus: 'UNRESOLVED',
        confidence: 'WEAK',
        reasons,
        evidence,
        conflicts,
        branchSignals
      };
    }
  }

  // Signal C3: Exact Phone + Exact Canonical Domain
  if (samePhone && sameDomain) {
    evidence.push({
      field: 'phone',
      relationship: 'EXACT_MATCH',
      strength: 'STRONG',
      description: `Exact matching normalized phone: ${aPhone}`,
      candidateAId: aId,
      candidateBId: bId
    });
    evidence.push({
      field: 'canonicalDomain',
      relationship: 'EXACT_MATCH',
      strength: 'STRONG',
      description: `Exact matching canonical domain: ${aDomain}`,
      candidateAId: aId,
      candidateBId: bId
    });
    reasons.push('SAME_PHONE_AND_DOMAIN_CORROBORATION');
    return {
      candidateAId: aId,
      candidateBId: bId,
      relationshipType: 'SAME_ENTITY',
      resolutionStatus: 'STRONG_MATCH',
      confidence: 'STRONG',
      reasons,
      evidence,
      conflicts,
      branchSignals
    };
  }

  // Signal D: Exact Normalized Name Match + Shared Locality (No conflicting phone or domain)
  if (exactNameNormMatch && sameLocality && sameCountry && !hasValidDomainA && !hasValidDomainB) {
    evidence.push({
      field: 'businessName',
      relationship: 'EXACT_NORMALIZED_MATCH',
      strength: 'MODERATE',
      description: `Exact normalized name: ${aNameNorm} in ${aLocality}`,
      candidateAId: aId,
      candidateBId: bId
    });
    reasons.push('NAME_AND_LOCALITY_MODERATE_MATCH');
    return {
      candidateAId: aId,
      candidateBId: bId,
      relationshipType: 'POSSIBLE_SAME_ENTITY',
      resolutionStatus: 'MODERATE_MATCH',
      confidence: 'MODERATE',
      reasons,
      evidence,
      conflicts,
      branchSignals
    };
  }

  // DEFAULT: UNRESOLVED / DIFFERENT ENTITY
  reasons.push('INSUFFICIENT_IDENTITY_EVIDENCE');
  return {
    candidateAId: aId,
    candidateBId: bId,
    relationshipType: 'DIFFERENT_ENTITY',
    resolutionStatus: 'UNRESOLVED',
    confidence: 'UNRESOLVED',
    reasons,
    evidence,
    conflicts,
    branchSignals
  };
}

/**
 * Computes the unified policy summary across all merged member candidates.
 * Enforces strict Provenance & Data Firewall invariants:
 * Any GOOGLE_CONSUMER_WEB_RESTRICTED dependency marks the entity as NOT_PERSISTABLE and NOT_EXPORTABLE.
 */
export function computeEntityPolicySummary(
  candidates: NormalizedCandidate[]
): EntityPolicySummary {
  let isRestricted = false;
  let hasGoogleConsumerWebLineage = false;
  let hasGoogleApiLineage = false;
  let hasMetaLineage = false;
  let hasWebsiteLineage = false;
  let hasUserProvidedLineage = false;

  for (const c of candidates) {
    if (c.overallPersistenceStatus === 'NOT_PERSISTABLE' || c.overallExportStatus === 'NOT_EXPORTABLE') {
      isRestricted = true;
    }
    if (c.acquisitionContext === 'GOOGLE_CONSUMER_WEB' || c.overallProvenance === 'GOOGLE_DERIVED') {
      hasGoogleConsumerWebLineage = true;
      isRestricted = true;
    }
    if (c.acquisitionContext === 'GOOGLE_PLATFORM_API' || c.overallProvenance === 'GOOGLE_API_DERIVED') {
      hasGoogleApiLineage = true;
    }
    if (c.source === 'META_AD_LIBRARY' || (c.source as any) === 'META_ADS' || c.overallProvenance === 'META_DERIVED') {
      hasMetaLineage = true;
    }
    if ((c.source as any) === 'WEBSITE_SCRAPE' || c.overallProvenance === 'WEBSITE_DERIVED') {
      hasWebsiteLineage = true;
    }
    if (c.source === 'USER_PROVIDED_DOMAIN' || (c.source as any) === 'USER_DOMAIN' || c.overallProvenance === 'USER_PROVIDED') {
      hasUserProvidedLineage = true;
    }

    // Check individual contributions
    for (const sc of c.sourceContributions || []) {
      if (sc.isRestricted || sc.restrictionBasis === 'GOOGLE_CONSUMER_WEB_RESTRICTED') {
        isRestricted = true;
        hasGoogleConsumerWebLineage = true;
      }
    }
  }

  const distinctProvenances = [
    hasGoogleConsumerWebLineage,
    hasGoogleApiLineage,
    hasMetaLineage,
    hasWebsiteLineage,
    hasUserProvidedLineage
  ].filter(Boolean).length;

  const overallProvenance: ProvenanceType = distinctProvenances > 1 ? 'MIXED' :
    hasGoogleConsumerWebLineage ? 'GOOGLE_DERIVED' :
      hasGoogleApiLineage ? 'GOOGLE_API_DERIVED' :
        hasMetaLineage ? 'META_DERIVED' :
          hasWebsiteLineage ? 'WEBSITE_DERIVED' :
            hasUserProvidedLineage ? 'USER_PROVIDED' : 'LEADNORIA_DERIVED';

  const overallPolicyStatus: PolicyStatus = isRestricted ? 'POLICY_GATED' :
    hasGoogleApiLineage ? 'POLICY_REVIEW_REQUIRED' : 'POLICY_APPROVED';

  const overallPersistenceStatus: PersistenceStatus = isRestricted ? 'NOT_PERSISTABLE' :
    hasGoogleApiLineage ? 'PERSISTENCE_GATED' : 'PERSISTABLE';

  const overallExportStatus: ExportStatus = isRestricted ? 'NOT_EXPORTABLE' :
    hasGoogleApiLineage ? 'EXPORT_GATED' : 'EXPORTABLE';

  return {
    overallPolicyStatus,
    overallPersistenceStatus,
    overallExportStatus,
    overallProvenance,
    isRestricted,
    hasGoogleConsumerWebLineage,
    hasGoogleApiLineage,
    hasMetaLineage,
    hasWebsiteLineage,
    hasUserProvidedLineage
  };
}

/**
 * Selects the canonical representative values for an entity group deterministically.
 */
export function buildResolvedEntityGroup(
  entityId: string,
  members: NormalizedCandidate[],
  evidenceList: IdentityEvidenceItem[] = [],
  conflictsList: IdentityConflictItem[] = [],
  reasonCodes: string[] = []
): ResolvedEntityGroup {
  // Deterministic sorting of members to ensure order-independence:
  // 1. Most complete fields (score)
  // 2. Verified website presence
  // 3. Stable candidateId tie-breaker
  const scoredMembers = [...members].sort((a, b) => {
    const scoreA = (a.websiteUrl ? 2 : 0) + (a.phones?.length ? 2 : 0) + (a.address ? 2 : 0) + (a.coordinates ? 1 : 0);
    const scoreB = (b.websiteUrl ? 2 : 0) + (b.phones?.length ? 2 : 0) + (b.address ? 2 : 0) + (b.coordinates ? 1 : 0);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.candidateId.localeCompare(b.candidateId);
  });

  const rep = scoredMembers[0];

  // Aggregate aliases
  const aliasSet = new Set<string>();
  const domainSet = new Set<string>();
  const phoneSet = new Set<string>();
  const addressSet = new Set<string>();
  const locationSet = new Set<string>();
  const sourceIdList: Array<{ sourceType: string; sourceContext?: string; sourceRecordId: string }> = [];
  const allContributions: SourceContribution[] = [];
  const derivedLineage: SourceContribution[] = [];
  const branchSignalsList: BranchSignal[] = [];

  for (const m of members) {
    if (m.businessName.value.displayName) {
      aliasSet.add(m.businessName.value.displayName);
    }
    const dom = m.websiteUrl?.value?.canonicalDomain;
    if (dom) domainSet.add(dom);

    for (const ph of m.phones || []) {
      const phVal = ph.value.e164Format || ph.value.internationalFormat || (ph.value as any).normalizedPhone || ph.value.rawPhone;
      if (phVal) phoneSet.add(phVal);
    }

    const addr = m.address?.value?.displayAddress || m.address?.value?.addressLine1 || (m.address?.value as any)?.street || (m.address?.value as any)?.fullAddress;
    if (addr) {
      addressSet.add(addr);
    }
    if (m.address?.value?.locality) {
      locationSet.add(m.address.value.locality);
    }

    sourceIdList.push({
      sourceType: m.source,
      sourceContext: m.acquisitionContext,
      sourceRecordId: m.sourceIdentifier.sourceRecordId
    });

    if (m.sourceContributions) {
      allContributions.push(...m.sourceContributions);
    }
    if ((m as any).derivedFrom) {
      derivedLineage.push(...(m as any).derivedFrom);
    }

    branchSignalsList.push(...detectBranchSignals(m));
  }

  const policySummary = computeEntityPolicySummary(members);

  const resolutionStatus: ResolutionStatus = members.length > 1 ? 'STRONG_MATCH' : 'UNRESOLVED';
  const resolutionConfidence: ResolutionConfidence = members.length > 1 ? 'STRONG' : 'UNRESOLVED';

  return {
    entityId,
    canonicalDisplayName: rep.businessName.value.displayName,
    canonicalComparisonName: rep.businessName.value.comparisonName,
    aliases: Array.from(aliasSet),
    sourceRecords: members,
    sourceIds: sourceIdList,
    domains: Array.from(domainSet),
    phones: Array.from(phoneSet),
    addresses: Array.from(addressSet),
    locations: Array.from(locationSet),
    branchSignals: branchSignalsList,
    branchEntityIds: [],
    identityEvidence: evidenceList,
    identityConflicts: conflictsList,
    resolutionStatus,
    resolutionConfidence,
    resolutionReasonCodes: reasonCodes.length > 0 ? Array.from(new Set(reasonCodes)) : ['SINGLE_CANDIDATE_RECORD'],
    sourceContributions: allContributions,
    derivedFrom: derivedLineage,
    policySummary,
    createdAt: '2026-09-29T12:00:00.000Z'
  };
}

/**
 * Disjoint Set (Union-Find) with path compression and rank optimization.
 */
class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = new Array(size).fill(0);
  }

  find(i: number): number {
    if (this.parent[i] === i) return i;
    this.parent[i] = this.find(this.parent[i]);
    return this.parent[i];
  }

  union(i: number, j: number): boolean {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI === rootJ) return false;

    if (this.rank[rootI] < this.rank[rootJ]) {
      this.parent[rootI] = rootJ;
    } else if (this.rank[rootI] > this.rank[rootJ]) {
      this.parent[rootJ] = rootI;
    } else {
      this.parent[rootJ] = rootI;
      this.rank[rootI]++;
    }
    return true;
  }
}

/**
 * Resolves and deduplicates a batch of normalized candidates into canonical EntityGroups.
 * Uses indexed candidate blocking to reduce comparisons in observed distributions.
 * Bucket size can increase pairwise work; we do not claim worst-case O(N) linearity.
 */
export function resolveCandidates(
  candidates: NormalizedCandidate[],
  options: ResolutionOptions = {}
): EntityResolutionResult {
  const startTime = performance.now();
  const N = candidates.length;

  if (N === 0) {
    return {
      entities: [],
      relationships: [],
      recordToEntityMap: {},
      summary: {
        sourceRecordCount: 0,
        uniqueEntityCount: 0,
        duplicateRecordCount: 0,
        sameEntityMerges: 0,
        branchRelationships: 0,
        unresolvedRecords: 0,
        conflictingIdentities: 0,
        elapsedMs: 0,
        throughputOpsSec: 0
      }
    };
  }

  // 1. Build Precomputed Blocking Indexes
  const sourceIdIndex = new Map<string, number[]>();
  const domainIndex = new Map<string, number[]>();
  const phoneIndex = new Map<string, number[]>();
  const addressIndex = new Map<string, number[]>();
  const nameIndex = new Map<string, number[]>();
  const parentBrandIndex = new Map<string, number[]>();

  for (let i = 0; i < N; i++) {
    const c = candidates[i];

    // Source Record ID Index
    if (c.sourceIdentifier.sourceRecordId) {
      const sKey = `${c.source}:${c.acquisitionContext}:${c.sourceIdentifier.sourceRecordId}`;
      if (!sourceIdIndex.has(sKey)) sourceIdIndex.set(sKey, []);
      sourceIdIndex.get(sKey)!.push(i);
    }

    // Canonical Domain Index (excluding generic shared domains)
    const dom = c.websiteUrl?.value?.canonicalDomain?.toLowerCase();
    if (dom && !GENERIC_SHARED_DOMAINS.has(dom)) {
      if (!domainIndex.has(dom)) domainIndex.set(dom, []);
      domainIndex.get(dom)!.push(i);
    }

    // Normalized Phone Index
    const ph = getCandidatePhone(c);
    if (ph) {
      if (!phoneIndex.has(ph)) phoneIndex.set(ph, []);
      phoneIndex.get(ph)!.push(i);
    }

    // Normalized Address Key Index
    const street = (c.address?.value?.addressLine1 || (c.address?.value as any)?.street || c.address?.value?.displayAddress || '')?.toLowerCase()?.trim();
    const postal = c.address?.value?.postalCode?.trim() || '';
    const locality = c.address?.value?.locality?.toLowerCase()?.trim() || '';
    const country = c.address?.value?.countryCode || (c as any).countryCode || 'XX';
    if (street && (postal || locality)) {
      const addrKey = `${country}:${postal || locality}:${street}`;
      if (!addressIndex.has(addrKey)) addressIndex.set(addrKey, []);
      addressIndex.get(addrKey)!.push(i);
    }

    // Comparison Name Index
    const compName = c.businessName?.value?.comparisonName?.toLowerCase();
    if (compName && compName.length > 2) {
      if (!nameIndex.has(compName)) nameIndex.set(compName, []);
      nameIndex.get(compName)!.push(i);
    }

    // Parent Brand Index
    const parentBrand = extractParentBrandName(c.businessName?.value?.displayName || c.businessName?.value?.comparisonName || '');
    if (parentBrand && parentBrand.length > 2) {
      if (!parentBrandIndex.has(parentBrand)) parentBrandIndex.set(parentBrand, []);
      parentBrandIndex.get(parentBrand)!.push(i);
    }
  }

  // 2. Candidate Pair Generation via Blocking (Avoid N^2)
  const candidatePairs = new Set<string>();
  const addPair = (i: number, j: number) => {
    if (i === j) return;
    const min = Math.min(i, j);
    const max = Math.max(i, j);
    candidatePairs.add(`${min}:${max}`);
  };

  const collectPairsFromIndex = (index: Map<string, number[]>) => {
    for (const indices of index.values()) {
      if (indices.length > 1) {
        for (let a = 0; a < indices.length; a++) {
          for (let b = a + 1; b < indices.length; b++) {
            addPair(indices[a], indices[b]);
          }
        }
      }
    }
  };

  collectPairsFromIndex(sourceIdIndex);
  collectPairsFromIndex(domainIndex);
  collectPairsFromIndex(phoneIndex);
  collectPairsFromIndex(addressIndex);
  collectPairsFromIndex(nameIndex);
  collectPairsFromIndex(parentBrandIndex);

  // 3. Evaluate Candidate Pairs
  const uf = new UnionFind(N);
  const relationships: EntityRelationshipLink[] = [];
  const pairwiseEvidence = new Map<number, IdentityEvidenceItem[]>();
  const pairwiseConflicts = new Map<number, IdentityConflictItem[]>();
  const pairwiseReasons = new Map<number, string[]>();

  let sameEntityMerges = 0;
  let branchRelationshipCount = 0;
  let conflictingCount = 0;
  let detailedComparisons = 0;

  // Compute blocking index metrics
  let maxBucketSize = 0;
  let totalBucketEntries = 0;
  let bucketCount = 0;
  for (const index of [sourceIdIndex, domainIndex, phoneIndex, addressIndex, nameIndex, parentBrandIndex]) {
    for (const bucket of index.values()) {
      bucketCount++;
      totalBucketEntries += bucket.length;
      if (bucket.length > maxBucketSize) maxBucketSize = bucket.length;
    }
  }

  for (const pairKey of candidatePairs) {
    const [iStr, jStr] = pairKey.split(':');
    const i = parseInt(iStr, 10);
    const j = parseInt(jStr, 10);

    detailedComparisons++;
    const comp = compareCandidates(candidates[i], candidates[j], options);

    if (comp.relationshipType === 'SAME_ENTITY') {
      uf.union(i, j);
      sameEntityMerges++;

      // Record evidence and reasons on root
      const root = uf.find(i);
      if (!pairwiseEvidence.has(root)) pairwiseEvidence.set(root, []);
      if (!pairwiseReasons.has(root)) pairwiseReasons.set(root, []);

      pairwiseEvidence.get(root)!.push(...comp.evidence);
      pairwiseReasons.get(root)!.push(...comp.reasons);
    } else if (comp.relationshipType === 'SAME_PARENT_BRAND_DIFFERENT_BRANCH') {
      branchRelationshipCount++;
      relationships.push({
        entityAId: candidates[i].candidateId,
        entityBId: candidates[j].candidateId,
        relationshipType: 'SAME_PARENT_BRAND_DIFFERENT_BRANCH',
        reason: comp.reasons.join('; '),
        confidence: comp.confidence,
        evidence: comp.evidence
      });
    } else if (comp.relationshipType === 'CONFLICTING_ENTITY') {
      conflictingCount++;
      const rootI = uf.find(i);
      if (!pairwiseConflicts.has(rootI)) pairwiseConflicts.set(rootI, []);
      pairwiseConflicts.get(rootI)!.push(...comp.conflicts);

      relationships.push({
        entityAId: candidates[i].candidateId,
        entityBId: candidates[j].candidateId,
        relationshipType: 'CONFLICTING_ENTITY',
        reason: comp.reasons.join('; '),
        confidence: comp.confidence,
        evidence: comp.evidence
      });
    }
  }

  // 4. Provisional Cluster Formation
  const provisionalClusters = new Map<number, number[]>();
  for (let i = 0; i < N; i++) {
    const root = uf.find(i);
    if (!provisionalClusters.has(root)) provisionalClusters.set(root, []);
    provisionalClusters.get(root)!.push(i);
  }

  const provisionalClusterCount = provisionalClusters.size;

  // 5. Cluster-Wide Contradiction Audit (Phase 8B)
  //
  // For every provisional cluster with > 1 member, verify that no intra-cluster
  // pair has a CONFLICTING_ENTITY relationship. If a strong pairwise edge merged
  // records transitively (A-B strong, B-C strong) but A-C is a contradiction,
  // the cluster must be split.
  //
  // Algorithm:
  //   For each cluster, examine all internal pairs. If any pair is CONFLICTING_ENTITY,
  //   remove the conflicting record from the cluster by assigning it its own singleton.
  //   Repeat until no cluster contains internal contradictions.

  // Build a lookup of all pairwise results for quick intra-cluster auditing
  const pairResultMap = new Map<string, CandidatePairComparison>();
  // Re-use already computed pairs - store results during initial evaluation
  // We need to re-evaluate pairs inside clusters. To avoid double work,
  // store the conflict edges we already know about, and lazily evaluate new ones.
  const conflictEdges = new Set<string>();

  // Collect all known conflict edges from the pairwise evaluation
  for (const rel of relationships) {
    if (rel.relationshipType === 'CONFLICTING_ENTITY') {
      // Find indices of the conflicting candidates
      const idxA = candidates.findIndex(c => c.candidateId === rel.entityAId);
      const idxB = candidates.findIndex(c => c.candidateId === rel.entityBId);
      if (idxA >= 0 && idxB >= 0) {
        const min = Math.min(idxA, idxB);
        const max = Math.max(idxA, idxB);
        conflictEdges.add(`${min}:${max}`);
      }
    }
  }

  let clusterConflictChecks = 0;
  let clusterSplits = 0;

  // Validated clusters: start from provisionals, split as needed
  const validatedClusters: number[][] = [];

  for (const [_rootIdx, memberIndices] of provisionalClusters.entries()) {
    if (memberIndices.length <= 1) {
      validatedClusters.push(memberIndices);
      continue;
    }

    // For multi-member clusters, run intra-cluster contradiction audit
    // We need to check all internal pairs for conflicts
    let currentCluster = [...memberIndices];
    let hadSplit = true;

    while (hadSplit) {
      hadSplit = false;
      const toRemove = new Set<number>();

      for (let a = 0; a < currentCluster.length && !hadSplit; a++) {
        for (let b = a + 1; b < currentCluster.length && !hadSplit; b++) {
          const idxA = currentCluster[a];
          const idxB = currentCluster[b];
          const min = Math.min(idxA, idxB);
          const max = Math.max(idxA, idxB);
          const pairKey = `${min}:${max}`;

          clusterConflictChecks++;

          // Check if this pair is a known conflict
          let isConflict = conflictEdges.has(pairKey);

          // If not already evaluated, evaluate now (lazy intra-cluster audit)
          if (!isConflict && !candidatePairs.has(pairKey)) {
            detailedComparisons++;
            const comp = compareCandidates(candidates[idxA], candidates[idxB], options);
            if (comp.relationshipType === 'CONFLICTING_ENTITY') {
              isConflict = true;
              conflictEdges.add(pairKey);
              conflictingCount++;

              relationships.push({
                entityAId: candidates[idxA].candidateId,
                entityBId: candidates[idxB].candidateId,
                relationshipType: 'CONFLICTING_ENTITY',
                reason: comp.reasons.join('; '),
                confidence: comp.confidence,
                evidence: comp.evidence
              });
            }
          }

          if (isConflict) {
            // Determine which record to eject: the one with fewer merge edges in this cluster
            // Count how many other cluster members each has a SAME_ENTITY edge with
            let edgesA = 0;
            let edgesB = 0;
            for (const other of currentCluster) {
              if (other === idxA || other === idxB) continue;
              const keyA = `${Math.min(idxA, other)}:${Math.max(idxA, other)}`;
              const keyB = `${Math.min(idxB, other)}:${Math.max(idxB, other)}`;
              if (candidatePairs.has(keyA) && !conflictEdges.has(keyA)) edgesA++;
              if (candidatePairs.has(keyB) && !conflictEdges.has(keyB)) edgesB++;
            }

            // Eject the record with fewer supporting edges (break ties by candidateId for determinism)
            const ejectIdx = edgesA < edgesB ? idxA :
              edgesA > edgesB ? idxB :
                candidates[idxA].candidateId < candidates[idxB].candidateId ? idxA : idxB;

            toRemove.add(ejectIdx);
            clusterSplits++;
            hadSplit = true;
          }
        }
      }

      if (toRemove.size > 0) {
        // Split: ejected records become singletons
        for (const ejected of toRemove) {
          validatedClusters.push([ejected]);
        }
        currentCluster = currentCluster.filter(idx => !toRemove.has(idx));
      }
    }

    // Remaining validated cluster
    if (currentCluster.length > 0) {
      validatedClusters.push(currentCluster);
    }
  }

  const finalClusterCount = validatedClusters.length;

  // 6. Construct ResolvedEntityGroups from validated clusters
  const resolvedEntities: ResolvedEntityGroup[] = [];
  const recordToEntityMap: Record<string, string> = {};
  let unresolvedCount = 0;

  // Collect all pairwise evidence/reasons keyed by sorted member indices for each cluster
  for (const memberIndices of validatedClusters) {
    const memberCandidates = memberIndices.map(idx => candidates[idx]);

    // Generate stable deterministic entity ID using sorted member candidate IDs
    // This ensures order-independence: same set of members => same entity ID
    const sortedMemberIds = memberCandidates.map(c => c.candidateId).sort();
    const primaryAnchor = sortedMemberIds.join('::');
    const entityId = generateDeterministicEntityId(primaryAnchor);

    for (const m of memberCandidates) {
      recordToEntityMap[m.candidateId] = entityId;
    }

    // Aggregate evidence and reasons from all pairwise results within this cluster
    const clusterEvidence: IdentityEvidenceItem[] = [];
    const clusterConflicts: IdentityConflictItem[] = [];
    const clusterReasons: string[] = [];

    for (let a = 0; a < memberIndices.length; a++) {
      for (let b = a + 1; b < memberIndices.length; b++) {
        const idxA = memberIndices[a];
        const idxB = memberIndices[b];
        const min = Math.min(idxA, idxB);
        const max = Math.max(idxA, idxB);
        const key = `${min}:${max}`;

        // Check if we have stored evidence from original pairwise evaluation
        if (candidatePairs.has(key)) {
          // Re-evaluate to get evidence (lightweight since already computed)
          const comp = compareCandidates(candidates[idxA], candidates[idxB], options);
          clusterEvidence.push(...comp.evidence);
          clusterReasons.push(...comp.reasons);
          if (comp.conflicts.length > 0) {
            clusterConflicts.push(...comp.conflicts);
          }
        }
      }
    }

    const entityGroup = buildResolvedEntityGroup(
      entityId,
      memberCandidates,
      clusterEvidence,
      clusterConflicts,
      clusterReasons
    );

    if (memberCandidates.length === 1) {
      unresolvedCount++;
    }

    resolvedEntities.push(entityGroup);
  }

  // Sort resolved entities deterministically by entityId
  resolvedEntities.sort((a, b) => a.entityId.localeCompare(b.entityId));

  // 7. Map Branch Relationships between Resolved Entities
  const resolvedRelationships: EntityRelationshipLink[] = [];
  for (const rel of relationships) {
    const entA = recordToEntityMap[rel.entityAId];
    const entB = recordToEntityMap[rel.entityBId];

    if (entA && entB && entA !== entB) {
      resolvedRelationships.push({
        entityAId: entA,
        entityBId: entB,
        relationshipType: rel.relationshipType,
        reason: rel.reason,
        confidence: rel.confidence,
        evidence: rel.evidence
      });

      // Link branchEntityIds on the entities
      if (rel.relationshipType === 'SAME_PARENT_BRAND_DIFFERENT_BRANCH') {
        const entityAObj = resolvedEntities.find(e => e.entityId === entA);
        const entityBObj = resolvedEntities.find(e => e.entityId === entB);
        if (entityAObj && !entityAObj.branchEntityIds.includes(entB)) {
          entityAObj.branchEntityIds.push(entB);
        }
        if (entityBObj && !entityBObj.branchEntityIds.includes(entA)) {
          entityBObj.branchEntityIds.push(entA);
        }
      }
    }
  }

  const elapsedMs = performance.now() - startTime;
  const throughputOpsSec = Math.round((N / (elapsedMs / 1000 || 0.001)));

  const summary: DeduplicationSummary = {
    sourceRecordCount: N,
    uniqueEntityCount: resolvedEntities.length,
    duplicateRecordCount: N - resolvedEntities.length,
    sameEntityMerges,
    branchRelationships: branchRelationshipCount,
    unresolvedRecords: unresolvedCount,
    conflictingIdentities: conflictingCount,
    elapsedMs,
    throughputOpsSec,
    candidatePairsGenerated: candidatePairs.size,
    detailedComparisons,
    indexEntries: totalBucketEntries,
    maxBucketSize,
    avgBucketSize: bucketCount > 0 ? Math.round(totalBucketEntries / bucketCount * 100) / 100 : 0,
    provisionalClusters: provisionalClusterCount,
    finalClusters: finalClusterCount,
    clusterConflictChecks,
    clusterSplits
  };

  return {
    entities: resolvedEntities,
    relationships: resolvedRelationships,
    recordToEntityMap,
    summary
  };
}

