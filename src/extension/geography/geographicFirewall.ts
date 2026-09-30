/**
 * LeadNoria — Phase 13: Geographic Expansion & Saturation
 * Geographic Compliance & Policy Firewall
 * 
 * Invariants:
 * - INVARIANT 1: Geographic planning never performs source extraction
 * - INVARIANT 2: Google Maps remains CONTRACT_ONLY
 * - INVARIANT 12: Source restrictions survive aggregation (no data laundering)
 * - INVARIANT 19: No new Chrome permission is introduced
 * - INVARIANT 20: No external API is introduced
 */

import { SourceType, SourceContribution } from '../extraction/types.ts';

export interface GeographicPolicyCheck {
  isPermitted: boolean;
  isContractOnly: boolean;
  reason?: string;
}

/**
 * Validates whether a requested source type can be actively extracted in Phase 13.
 * Google Maps remains strictly CONTRACT_ONLY.
 */
export function checkSourceExtractionPermitted(sourceType: SourceType): GeographicPolicyCheck {
  if (sourceType === 'GOOGLE_MAPS') {
    return {
      isPermitted: false,
      isContractOnly: true,
      reason: 'Google Maps extraction is CONTRACT_ONLY. Live extraction is strictly prohibited in Phase 13.'
    };
  }

  return {
    isPermitted: true,
    isContractOnly: false
  };
}

/**
 * Ensures that restricted source contributions preserve their restriction flags
 * across geographic grouping and cannot be laundered through aggregation.
 */
export function assertLineagePreservedInAggregation(contributions: SourceContribution[]): {
  isRestricted: boolean;
  hasGoogleConsumerWeb: boolean;
  exportPermitted: boolean;
} {
  let isRestricted = false;
  let hasGoogleConsumerWeb = false;

  for (const c of contributions) {
    if (c.isRestricted) isRestricted = true;
    if (c.acquisitionContext === 'GOOGLE_CONSUMER_WEB' || c.provenance === 'GOOGLE_DERIVED') {
      hasGoogleConsumerWeb = true;
      isRestricted = true;
    }
  }

  return {
    isRestricted,
    hasGoogleConsumerWeb,
    // INVARIANT 12: Export is strictly forbidden if Google consumer-web data is present
    exportPermitted: !hasGoogleConsumerWeb && !isRestricted
  };
}
