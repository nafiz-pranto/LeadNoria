/**
 * LeadNoria — Google Maps Candidate Identity Matcher
 * Part 5: Deterministic Decision Engine for Entity Equivalence & Conflict Detection
 *
 * HARD BOUNDARIES & INVARIANTS:
 * - Deterministic, explainable matching matrix returning typed IdentityDecision.
 * - Same business name does NOT mean same candidate (Branch Safety).
 * - Multi-location businesses (e.g. ABC Restaurant Dhaka vs ABC Restaurant Chattogram) kept separate.
 * - Phone-only or website-only matches NEVER auto-merge.
 * - Rating and review count NEVER used as identity signals.
 * - Contradictory strong identity signals (e.g. same Place ID with conflicting cities) emit CONFLICT.
 */

import type {
  IdentityDecision,
  IdentityMethod
} from './candidateIdentityTypes.ts';

import {
  normalizeBusinessNameForIdentity,
  normalizeAddressForIdentity,
  normalizePhoneForIdentity,
  arePhonesEquivalent,
  normalizeWebsiteForIdentity,
  normalizeMapsUrlSlug
} from './candidateNormalizer.ts';

export interface MatchSubject {
  readonly candidateId?: string;
  readonly observationId?: string;
  readonly businessName?: string;
  readonly placeId?: string;
  readonly mapsUrl?: string;
  readonly address?: string;
  readonly phone?: string;
  readonly websiteUrl?: string;
  readonly category?: string;
  readonly searchLocation?: string;
  readonly searchKeyword?: string;
  readonly searchUnitId?: string;
}

/**
 * Pure deterministic identity comparator between two candidate subjects.
 */
export function compareCandidatesForIdentity(
  subjectA: MatchSubject,
  subjectB: MatchSubject
): IdentityDecision {
  const normNameA = normalizeBusinessNameForIdentity(subjectA.businessName);
  const normNameB = normalizeBusinessNameForIdentity(subjectB.businessName);

  const normAddrA = normalizeAddressForIdentity(subjectA.address);
  const normAddrB = normalizeAddressForIdentity(subjectB.address);

  const placeIdA = subjectA.placeId?.trim();
  const placeIdB = subjectB.placeId?.trim();

  const slugA = normalizeMapsUrlSlug(subjectA.mapsUrl);
  const slugB = normalizeMapsUrlSlug(subjectB.mapsUrl);

  const isPlaceIdAValid = Boolean(placeIdA && (placeIdA.startsWith('ChIJ') || placeIdA.startsWith('0x') || placeIdA.includes(':')));
  const isPlaceIdBValid = Boolean(placeIdB && (placeIdB.startsWith('ChIJ') || placeIdB.startsWith('0x') || placeIdB.includes(':')));

  // ==========================================================================
  // 1. STRONG SIGNAL: VISIBLE_PLACE_ID
  // ==========================================================================
  if (isPlaceIdAValid && isPlaceIdBValid) {
    if (placeIdA === placeIdB) {
      // Check for locality/city conflict
      if (normAddrA.locality && normAddrB.locality && normAddrA.locality !== normAddrB.locality) {
        return {
          relationship: 'CONFLICT',
          confidence: 0.99,
          confidenceTier: 'CONFLICT',
          method: 'VISIBLE_PLACE_ID',
          evidence: [`PlaceId:${placeIdA}`, `AddrA:${normAddrA.rawAddress}`, `AddrB:${normAddrB.rawAddress}`],
          reasons: [
            `Same stable Place ID (${placeIdA}) but mutually incompatible localities: '${normAddrA.locality}' vs '${normAddrB.locality}'`
          ],
          conflictDetails: ['MATERIAL_ADDRESS_CONFLICT']
        };
      }

      // Check for name divergence
      const conflictDetails: string[] = [];
      if (normNameA.comparisonKey && normNameB.comparisonKey && normNameA.comparisonKey !== normNameB.comparisonKey) {
        // If one does not contain the other, note name divergence
        if (!normNameA.comparisonKey.includes(normNameB.comparisonKey) && !normNameB.comparisonKey.includes(normNameA.comparisonKey)) {
          conflictDetails.push('NAME_DIVERGENCE');
        }
      }

      return {
        relationship: 'SAME',
        confidence: 0.99,
        confidenceTier: 'HIGH',
        method: 'VISIBLE_PLACE_ID',
        evidence: [`PlaceId:${placeIdA}`],
        reasons: [`Strong verified Google Place ID match (${placeIdA})`],
        conflictDetails: conflictDetails.length > 0 ? conflictDetails : undefined
      };
    } else {
      // Both have explicit, different Place IDs:
      // Different stable Place IDs are strong NON-MERGE evidence that two observations
      // refer to different Maps listings/places.
      // However, we DO NOT automatically force DISTINCT solely from Place ID difference
      // if other strong evidence creates a contradictory identity situation:

      // 1. Same Maps URL slug + conflicting Place IDs -> CONFLICT (Correction 7, item 5)
      if (slugA && slugB && slugA.length >= 3 && slugA === slugB) {
        return {
          relationship: 'CONFLICT',
          confidence: 0.85,
          confidenceTier: 'CONFLICT',
          method: 'VISIBLE_PLACE_ID',
          evidence: [`PlaceIdA:${placeIdA}`, `PlaceIdB:${placeIdB}`, `SharedSlug:${slugA}`],
          reasons: [`Identical Maps URL slug ('${slugA}') with conflicting Place IDs (${placeIdA} vs ${placeIdB})`],
          conflictDetails: ['PLACE_ID_MAPS_URL_CONTRADICTION']
        };
      }

      // Check name match:
      const namesMatch = Boolean(
        normNameA.comparisonKey &&
        normNameB.comparisonKey &&
        (normNameA.comparisonKey === normNameB.comparisonKey ||
         normNameA.comparisonKey.includes(normNameB.comparisonKey) ||
         normNameB.comparisonKey.includes(normNameA.comparisonKey))
      );

      // Check addresses:
      const hasAddrA = Boolean(normAddrA.comparisonKey && normAddrA.comparisonKey.length >= 5);
      const hasAddrB = Boolean(normAddrB.comparisonKey && normAddrB.comparisonKey.length >= 5);
      const addressesMatch = hasAddrA && hasAddrB && normAddrA.comparisonKey === normAddrB.comparisonKey;
      const localitiesDiffer = Boolean(normAddrA.locality && normAddrB.locality && normAddrA.locality !== normAddrB.locality);

      // 2. Branch Safety: Different localities (e.g. Dhaka vs Chattogram) -> DISTINCT (Correction 6)
      if (localitiesDiffer) {
        return {
          relationship: 'DISTINCT',
          confidence: 0.95,
          confidenceTier: 'HIGH',
          method: 'VISIBLE_PLACE_ID',
          evidence: [`PlaceIdA:${placeIdA}`, `PlaceIdB:${placeIdB}`, `LocA:${normAddrA.locality}`, `LocB:${normAddrB.locality}`],
          reasons: [`Different Place IDs and distinct physical branches in '${normAddrA.locality}' vs '${normAddrB.locality}'`]
        };
      }

      // 3. Different Place IDs + different physical street addresses -> DISTINCT (Correction 7, item 2)
      if (hasAddrA && hasAddrB && !addressesMatch) {
        return {
          relationship: 'DISTINCT',
          confidence: 0.95,
          confidenceTier: 'HIGH',
          method: 'VISIBLE_PLACE_ID',
          evidence: [`PlaceIdA:${placeIdA}`, `PlaceIdB:${placeIdB}`, `AddrA:${normAddrA.comparisonKey}`, `AddrB:${normAddrB.comparisonKey}`],
          reasons: [`Different Place IDs at different physical street addresses establish distinct listings`]
        };
      }

      // 4. Different Place IDs + same normalized address + matching phone/website -> POTENTIAL_DUPLICATE (Correction 5 & Correction 7, item 3)
      if (namesMatch && addressesMatch) {
        const phoneMatch = arePhonesEquivalent(subjectA.phone, subjectB.phone);
        const webMatch = Boolean(
          subjectA.websiteUrl &&
          subjectB.websiteUrl &&
          normalizeWebsiteForIdentity(subjectA.websiteUrl).domain &&
          normalizeWebsiteForIdentity(subjectA.websiteUrl).domain === normalizeWebsiteForIdentity(subjectB.websiteUrl).domain
        );

        if (phoneMatch || webMatch) {
          return {
            relationship: 'POTENTIAL_DUPLICATE',
            confidence: 0.70,
            confidenceTier: 'MEDIUM',
            method: 'VISIBLE_PLACE_ID',
            evidence: [
              `PlaceIdA:${placeIdA}`,
              `PlaceIdB:${placeIdB}`,
              `SharedAddress:${normAddrA.comparisonKey}`,
              ...(phoneMatch ? ['SharedPhone'] : []),
              ...(webMatch ? ['SharedWebsite'] : [])
            ],
            reasons: [
              `Contradictory Place IDs (${placeIdA} vs ${placeIdB}) for matching business name, physical address, and corroborated contact; held for review, no auto-merge`
            ],
            conflictDetails: ['DIFFERENT_PLACE_IDS_SAME_ADDRESS']
          };
        }

        // Without phone or website corroboration, different Place IDs represent distinct listings
        return {
          relationship: 'DISTINCT',
          confidence: 0.90,
          confidenceTier: 'HIGH',
          method: 'VISIBLE_PLACE_ID',
          evidence: [`PlaceIdA:${placeIdA}`, `PlaceIdB:${placeIdB}`, `Addr:${normAddrA.comparisonKey}`],
          reasons: [`Different stable Place IDs (${placeIdA} vs ${placeIdB}) establish distinct listings despite generic address match`]
        };
      }

      // 5. Different Place IDs + same name only (no address on one or both) -> POTENTIAL_DUPLICATE (Correction 7, item 4)
      if (namesMatch && (!hasAddrA || !hasAddrB)) {
        return {
          relationship: 'POTENTIAL_DUPLICATE',
          confidence: 0.60,
          confidenceTier: 'MEDIUM',
          method: 'VISIBLE_PLACE_ID',
          evidence: [`PlaceIdA:${placeIdA}`, `PlaceIdB:${placeIdB}`, `Name:${normNameA.comparisonKey}`],
          reasons: [`Different Place IDs with matching name but uncorroborated address; held for review`]
        };
      }

      // 6. Default: Different Place IDs with different names or generic -> DISTINCT
      return {
        relationship: 'DISTINCT',
        confidence: 0.95,
        confidenceTier: 'HIGH',
        method: 'VISIBLE_PLACE_ID',
        evidence: [`PlaceIdA:${placeIdA}`, `PlaceIdB:${placeIdB}`],
        reasons: [`Different stable Place IDs (${placeIdA} vs ${placeIdB}) establish distinct listings`]
      };
    }
  }

  // ==========================================================================
  // 2. STRONG SIGNAL: MAPS_URL SLUG
  // ==========================================================================
  if (slugA && slugB && slugA.length >= 3 && slugB.length >= 3) {
    if (slugA === slugB) {
      const conflictDetails: string[] = [];
      if (normNameA.comparisonKey && normNameB.comparisonKey && normNameA.comparisonKey !== normNameB.comparisonKey) {
        if (!normNameA.comparisonKey.includes(normNameB.comparisonKey) && !normNameB.comparisonKey.includes(normNameA.comparisonKey)) {
          conflictDetails.push('NAME_DIVERGENCE');
        }
      }

      return {
        relationship: 'SAME',
        confidence: 0.95,
        confidenceTier: 'HIGH',
        method: 'MAPS_URL',
        evidence: [`MapsUrlSlug:${slugA}`],
        reasons: [`Strong verified Maps place URL slug match ('${slugA}')`],
        conflictDetails: conflictDetails.length > 0 ? conflictDetails : undefined
      };
    } else {
      // Different Maps URLs
      // Check if names match: Branch safety check!
      if (normNameA.comparisonKey && normNameB.comparisonKey && normNameA.comparisonKey === normNameB.comparisonKey) {
        // Same business name, different Maps URLs
        // If localities differ, definitely distinct branches
        if (normAddrA.locality && normAddrB.locality && normAddrA.locality !== normAddrB.locality) {
          return {
            relationship: 'DISTINCT',
            confidence: 0.92,
            confidenceTier: 'HIGH',
            method: 'MAPS_URL',
            evidence: [`SlugA:${slugA}`, `SlugB:${slugB}`, `LocA:${normAddrA.locality}`, `LocB:${normAddrB.locality}`],
            reasons: [
              `Same business name ('${normNameA.displayName}') with different Maps URLs and distinct branches in '${normAddrA.locality}' vs '${normAddrB.locality}'`
            ]
          };
        }

        // If addresses differ materially
        if (normAddrA.comparisonKey && normAddrB.comparisonKey && normAddrA.comparisonKey !== normAddrB.comparisonKey) {
          return {
            relationship: 'DISTINCT',
            confidence: 0.88,
            confidenceTier: 'HIGH',
            method: 'MAPS_URL',
            evidence: [`SlugA:${slugA}`, `SlugB:${slugB}`],
            reasons: [
              `Same business name ('${normNameA.displayName}') with different Maps URLs and distinct physical addresses`
            ]
          };
        }

        // Addresses unknown or ambiguous, but different Maps URLs
        const phonesMatch = arePhonesEquivalent(subjectA.phone, subjectB.phone);
        if (phonesMatch) {
          return {
            relationship: 'POTENTIAL_DUPLICATE',
            confidence: 0.65,
            confidenceTier: 'MEDIUM',
            method: 'NAME_PHONE',
            evidence: [`Name:${normNameA.comparisonKey}`, `Phone:${subjectA.phone}`, `SlugA:${slugA}`, `SlugB:${slugB}`],
            reasons: [
              `Matching business name and phone across different Maps URLs; held as potential duplicate without auto-merge`
            ]
          };
        }

        return {
          relationship: 'POTENTIAL_DUPLICATE',
          confidence: 0.50,
          confidenceTier: 'LOW',
          method: 'MAPS_URL',
          evidence: [`Name:${normNameA.comparisonKey}`, `SlugA:${slugA}`, `SlugB:${slugB}`],
          reasons: [
            `Same business name with different Maps URLs and uncorroborated address; held separate for branch safety`
          ]
        };
      }
    }
  }

  // ==========================================================================
  // 3. STRONG / HIGH SIGNAL: NAME + ADDRESS
  // ==========================================================================
  const namesMatch = Boolean(
    normNameA.comparisonKey &&
    normNameB.comparisonKey &&
    normNameA.comparisonKey === normNameB.comparisonKey
  );

  if (namesMatch) {
    const hasAddressA = Boolean(normAddrA.comparisonKey && normAddrA.comparisonKey.length >= 5);
    const hasAddressB = Boolean(normAddrB.comparisonKey && normAddrB.comparisonKey.length >= 5);

    if (hasAddressA && hasAddressB) {
      // Branch differentiation: different localities
      if (normAddrA.locality && normAddrB.locality && normAddrA.locality !== normAddrB.locality) {
        return {
          relationship: 'DISTINCT',
          confidence: 0.90,
          confidenceTier: 'HIGH',
          method: 'NAME_ADDRESS',
          evidence: [`Name:${normNameA.comparisonKey}`, `LocA:${normAddrA.locality}`, `LocB:${normAddrB.locality}`],
          reasons: [
            `Same business name in different cities/localities ('${normAddrA.locality}' vs '${normAddrB.locality}') — branch safety enforced`
          ]
        };
      }

      // Exact address comparison key match
      if (normAddrA.comparisonKey === normAddrB.comparisonKey) {
        return {
          relationship: 'SAME',
          confidence: 0.85,
          confidenceTier: 'HIGH',
          method: 'NAME_ADDRESS',
          evidence: [`Name:${normNameA.comparisonKey}`, `Address:${normAddrA.comparisonKey}`],
          reasons: [`Normalized business name and physical address match exactly`]
        };
      }

      // Check if one address is a substring or includes road/street match in same locality
      if (
        (normAddrA.comparisonKey.includes(normAddrB.comparisonKey) || normAddrB.comparisonKey.includes(normAddrA.comparisonKey)) ||
        (normAddrA.locality && normAddrA.locality === normAddrB.locality)
      ) {
        // If phone also matches, high confidence same
        if (arePhonesEquivalent(subjectA.phone, subjectB.phone)) {
          return {
            relationship: 'SAME',
            confidence: 0.85,
            confidenceTier: 'HIGH',
            method: 'NAME_ADDRESS',
            evidence: [`Name:${normNameA.comparisonKey}`, `AddressOverlap:${normAddrA.locality}`, `PhoneMatch`],
            reasons: [`Matching name, overlapping address in same locality, and matching phone`]
          };
        }

        return {
          relationship: 'POTENTIAL_DUPLICATE',
          confidence: 0.65,
          confidenceTier: 'MEDIUM',
          method: 'NAME_ADDRESS',
          evidence: [`Name:${normNameA.comparisonKey}`, `AddrA:${normAddrA.comparisonKey}`, `AddrB:${normAddrB.comparisonKey}`],
          reasons: [`Matching name with overlapping locality/address formatting; requires confirmation`]
        };
      }

      // Clearly different street addresses
      return {
        relationship: 'DISTINCT',
        confidence: 0.80,
        confidenceTier: 'MEDIUM',
        method: 'NAME_ADDRESS',
        evidence: [`Name:${normNameA.comparisonKey}`, `AddrA:${normAddrA.comparisonKey}`, `AddrB:${normAddrB.comparisonKey}`],
        reasons: [`Same business name at different physical addresses`]
      };
    }

    // Address missing on one or both subjects
    // Check supporting phone signal
    if (arePhonesEquivalent(subjectA.phone, subjectB.phone)) {
      return {
        relationship: 'POTENTIAL_DUPLICATE',
        confidence: 0.70,
        confidenceTier: 'MEDIUM',
        method: 'NAME_PHONE',
        evidence: [`Name:${normNameA.comparisonKey}`, `Phone:${subjectA.phone}`],
        reasons: [`Matching business name and phone number; physical address uncorroborated`]
      };
    }

    // Supporting category and search location match
    const catA = (subjectA.category || '').toLowerCase().trim();
    const catB = (subjectB.category || '').toLowerCase().trim();
    const locA = (subjectA.searchLocation || '').toLowerCase().trim();
    const locB = (subjectB.searchLocation || '').toLowerCase().trim();

    // 1. Within the same SearchUnit: repeated observation of the same business card during feed scrolling
    if (subjectA.searchUnitId && subjectB.searchUnitId && subjectA.searchUnitId === subjectB.searchUnitId) {
      return {
        relationship: 'SAME',
        confidence: (locA || catA) ? 0.75 : 0.60,
        confidenceTier: 'MEDIUM',
        method: (locA || catA) ? 'NAME_CATEGORY_LOCATION' : 'WEAK_FALLBACK',
        evidence: [`Name:${normNameA.comparisonKey}`, `SearchUnit:${subjectA.searchUnitId}`],
        reasons: [`Matching name observed within the same SearchUnit feed`]
      };
    }

    // 2. Across different SearchUnits: requires category + location corroboration for potential duplicate
    if (catA && catB && catA === catB && locA && locB && locA === locB) {
      return {
        relationship: 'POTENTIAL_DUPLICATE',
        confidence: 0.60,
        confidenceTier: 'MEDIUM',
        method: 'NAME_CATEGORY_LOCATION',
        evidence: [`Name:${normNameA.comparisonKey}`, `Cat:${catA}`, `Loc:${locA}`],
        reasons: [`Matching name, category, and search location across different search units; held for review`]
      };
    }

    return {
      relationship: 'POTENTIAL_DUPLICATE',
      confidence: 0.40,
      confidenceTier: 'LOW',
      method: 'WEAK_FALLBACK',
      evidence: [`Name:${normNameA.comparisonKey}`],
      reasons: [`Name matches but lack of address/phone prevents auto-merge across SearchUnits`]
    };
  }

  // ==========================================================================
  // 4. SUPPORTING-ONLY SIGNALS WITH DIFFERENT NAMES (NEVER AUTO-MERGE)
  // ==========================================================================

  // Same phone, different names: shared line/reception/mall/call-center
  if (arePhonesEquivalent(subjectA.phone, subjectB.phone)) {
    return {
      relationship: 'DISTINCT',
      confidence: 0.85,
      confidenceTier: 'HIGH',
      method: 'NAME_PHONE',
      evidence: [`NameA:${normNameA.displayName}`, `NameB:${normNameB.displayName}`, `Phone:${subjectA.phone}`],
      reasons: [`Shared phone number alone does not establish business identity across different names`]
    };
  }

  // Same website, different names: holding company, web agency, platform, or shared domain
  const webA = normalizeWebsiteForIdentity(subjectA.websiteUrl);
  const webB = normalizeWebsiteForIdentity(subjectB.websiteUrl);
  if (webA.domain && webB.domain && webA.domain === webB.domain) {
    return {
      relationship: 'DISTINCT',
      confidence: 0.85,
      confidenceTier: 'HIGH',
      method: 'MAPS_URL',
      evidence: [`NameA:${normNameA.displayName}`, `NameB:${normNameB.displayName}`, `Domain:${webA.domain}`],
      reasons: [`Shared website domain alone does not establish business identity across different names`]
    };
  }

  // ==========================================================================
  // 5. DEFAULT: DISTINCT
  // ==========================================================================
  return {
    relationship: 'DISTINCT',
    confidence: 0.95,
    confidenceTier: 'HIGH',
    method: 'WEAK_FALLBACK',
    evidence: [`NameA:${normNameA.displayName || 'unknown'}`, `NameB:${normNameB.displayName || 'unknown'}`],
    reasons: [`No compatible identity signals found; candidates represent distinct businesses`]
  };
}
