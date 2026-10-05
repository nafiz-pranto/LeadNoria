/**
 * LeadNoria — Phase 25: Unified Lead Intelligence UI & Research Workflow Integration
 * Human-Readable Status & Semantic Label Mappers
 * 
 * Strict Invariants:
 * - Translates internal technical states and enums into friendly user-facing labels
 * - Never exposes raw technical enum strings or internal error codes to normal users
 * - Preserves semantic truth without misleading subjective claims
 */

/**
 * Maps technical states to clear, human-understandable UI labels.
 */
export function toFriendlyStatus(status: string | null | undefined): string {
  if (!status) return 'Not available';
  const norm = status.trim().toUpperCase();

  switch (norm) {
    // Qualification States
    case 'QUALIFIED':
      return 'Qualified';
    case 'NOT_QUALIFIED':
      return 'Does not meet current criteria';
    case 'UNCERTAIN':
      return 'Needs review';
    case 'BLOCKED':
      return 'Unavailable due to policy restrictions';
    case 'NOT_STARTED':
      return 'Not evaluated';
    case 'DISQUALIFIED':
      return 'Does not meet current criteria';

    // Freshness & Change States
    case 'CURRENT':
      return 'Recently observed';
    case 'STALE':
      return 'May be outdated';
    case 'UNKNOWN':
      return 'Not enough information';
    case 'CONTRADICTORY':
      return 'Conflicting information found';
    case 'OBSERVED':
      return 'Observed';
    case 'NOT_OBSERVED_THIS_RUN':
      return 'Not observed this run';
    case 'CHANGED':
      return 'Updated value observed';

    // Relevance States
    case 'RELEVANT':
      return 'Relevant';
    case 'NOT_RELEVANT':
      return 'Not relevant';

    // Criteria outcomes
    case 'PASS':
      return 'Meets requirement';
    case 'FAIL':
      return 'Does not meet requirement';

    // Website Verification States
    case 'VERIFIED_BUSINESS_WEBSITE':
    case 'WEBSITE_VERIFIED_BUSINESS_SITE':
      return 'Verified business website';
    case 'NOT_OBSERVED':
    case 'WEBSITE_NOT_FOUND':
      return 'Website not observed';
    case 'WEBSITE_UNCERTAIN':
      return 'Website needs review';
    case 'WEBSITE_PRESENT_UNVERIFIED':
      return 'Website unverified';

    // Entity Types
    case 'LOCAL_BUSINESS':
      return 'Local Business';
    case 'PARENT_ORGANIZATION':
      return 'Parent Organization';
    case 'BRANCH':
      return 'Branch Location';
    case 'ONLINE_BUSINESS':
      return 'Online Business';
    case 'GENERAL_BUSINESS':
      return 'General Business';

    // Operational Status
    case 'OPERATIONAL':
      return 'Operational';
    case 'PERMANENTLY_CLOSED':
      return 'Permanently Closed';
    case 'TEMPORARILY_CLOSED':
      return 'Temporarily Closed';

    // Contact Categories
    case 'OPERATIONAL_ROLE':
      return 'Operational Role';
    case 'NAMED_INDIVIDUAL':
      return 'Named Individual';
    case 'GENERAL_INQUIRY':
      return 'General Inquiry';

    // Sources
    case 'META':
      return 'Meta Ad Library';
    case 'WEBSITE':
      return 'Public Website';
    case 'GOOGLE_MAPS':
      return 'Restricted Google';
    case 'USER_PROVIDED':
      return 'User Provided';

    default:
      // Return normalized readable string without raw underscores
      return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}

/**
 * Returns a friendly badge definition for a source type.
 */
export function getSourceBadgeInfo(sourceType: string): { sourceType: string; label: string; isRestricted: boolean; badgeClass: string } {
  switch (sourceType?.toUpperCase()) {
    case 'GOOGLE_MAPS':
      return {
        sourceType: 'GOOGLE_MAPS',
        label: 'Restricted Google',
        isRestricted: true,
        badgeClass: 'text-purple-300 bg-purple-950/60 border-purple-500/40'
      };
    case 'WEBSITE':
      return {
        sourceType: 'WEBSITE',
        label: 'Website',
        isRestricted: false,
        badgeClass: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40'
      };
    case 'META':
      return {
        sourceType: 'META',
        label: 'Meta',
        isRestricted: false,
        badgeClass: 'text-sky-300 bg-sky-950/60 border-sky-500/40'
      };
    case 'USER_PROVIDED':
      return {
        sourceType: 'USER_PROVIDED',
        label: 'User Provided',
        isRestricted: false,
        badgeClass: 'text-slate-300 bg-slate-800 border-slate-700'
      };
    default:
      return {
        sourceType: sourceType || 'PUBLIC',
        label: sourceType || 'Public Source',
        isRestricted: false,
        badgeClass: 'text-slate-300 bg-slate-800 border-slate-700'
      };
  }
}
