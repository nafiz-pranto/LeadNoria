/**
 * LeadNoria — Export-Safe Lead Projection & Research Workspace
 * Part 8: Provenance Enforcement & Anti-Laundering Guardrails
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * - Records with GOOGLE_MAPS_BROWSER source lineage remain strictly RESTRICTED.
 * - Website URLs discovered solely through Google Maps remain restricted unless
 *   anchored by an independent source.
 * - Prohibits silent provenance stripping or field-level laundering.
 */

import type { CandidateSourceClass, IndependentSourceAnchor, IndependentSourceClass } from './leadTypes.ts';

/**
 * Checks if a given source is a legitimate independent public source class.
 */
export function isIndependentSourceClass(sourceClass: string): sourceClass is IndependentSourceClass {
  return (
    sourceClass === 'WEBSITE_PUBLIC' ||
    sourceClass === 'USER_PROVIDED' ||
    sourceClass === 'LEADNORIA_DERIVED_FROM_NON_RESTRICTED_INPUT'
  );
}

/**
 * Checks whether an incoming research record has Google Maps restricted lineage.
 */
export function hasGoogleMapsLineage(context: {
  source?: string;
  isRestricted?: boolean;
  provenance?: { source?: string; isRestricted?: boolean };
}): boolean {
  if (context.isRestricted === true) return true;
  if (context.source === 'GOOGLE_MAPS_BROWSER' || context.source === 'GOOGLE_MAPS') return true;
  if (context.provenance?.isRestricted === true) return true;
  if (context.provenance?.source === 'GOOGLE_MAPS_BROWSER' || context.provenance?.source === 'GOOGLE_MAPS') return true;
  return false;
}

/**
 * Validates that an independent source anchor is completely detached from Google Maps.
 */
export function validateIndependentAnchor(anchor?: IndependentSourceAnchor | null): {
  isValid: boolean;
  error?: string;
} {
  if (!anchor) {
    return { isValid: false, error: 'Independent source anchor is missing' };
  }

  if (anchor.isRestricted !== false) {
    return { isValid: false, error: 'Source anchor cannot have isRestricted === true' };
  }

  if (!isIndependentSourceClass(anchor.sourceClass)) {
    return { isValid: false, error: `Invalid source class "${anchor.sourceClass}"; must be an independent public class` };
  }

  if (!anchor.targetUrl || !anchor.domain) {
    return { isValid: false, error: 'Source anchor requires valid targetUrl and domain' };
  }

  return { isValid: true };
}

/**
 * Ensures field-level provenance contains NO Google Maps derived elements.
 * Returns true if all fields are safe from Google restrictions.
 */
export function assertZeroGoogleFieldProvenance(
  fieldProvenances: readonly { fieldName: string; source: string; isRestricted: boolean }[]
): {
  isClean: boolean;
  taintedFields: string[];
} {
  const taintedFields: string[] = [];

  for (const fp of fieldProvenances) {
    if (fp.isRestricted || fp.source === 'GOOGLE_MAPS_BROWSER' || fp.source === 'GOOGLE_MAPS') {
      taintedFields.push(fp.fieldName);
    }
  }

  return {
    isClean: taintedFields.length === 0,
    taintedFields
  };
}
