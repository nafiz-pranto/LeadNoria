/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Design System Tokens & Accessible Styles
 * 
 * Communicates:
 * - Professional, research-grade, trustworthy, accessible
 * - Non-color-only indicators (always pairing color with clear icons/badges and textual state)
 */

export const THEME = {
  colors: {
    bg: {
      primary: '#0f172a',    // Deep slate 900
      secondary: '#1e293b',  // Slate 800
      elevated: '#334155',   // Slate 700
      subtle: '#090d16',     // Slate 950
      card: '#1e293b'
    },
    text: {
      primary: '#f8fafc',    // Slate 50
      secondary: '#94a3b8',  // Slate 400
      muted: '#64748b',      // Slate 500
      inverse: '#0f172a'
    },
    border: {
      subtle: '#334155',     // Slate 700
      prominent: '#475569',  // Slate 600
      active: '#38bdf8'      // Sky 400
    },
    status: {
      success: {
        bg: 'rgba(16, 185, 129, 0.15)',
        text: '#34d399',      // Emerald 400
        border: 'rgba(16, 185, 129, 0.4)'
      },
      warning: {
        bg: 'rgba(245, 158, 11, 0.15)',
        text: '#fbbf24',      // Amber 400
        border: 'rgba(245, 158, 11, 0.4)'
      },
      blocked: {
        bg: 'rgba(244, 63, 94, 0.15)',
        text: '#fb7185',      // Rose 400
        border: 'rgba(244, 63, 94, 0.4)'
      },
      error: {
        bg: 'rgba(239, 68, 68, 0.15)',
        text: '#f87171',      // Red 400
        border: 'rgba(239, 68, 68, 0.4)'
      },
      info: {
        bg: 'rgba(56, 189, 248, 0.15)',
        text: '#38bdf8',      // Sky 400
        border: 'rgba(56, 189, 248, 0.4)'
      },
      neutral: {
        bg: 'rgba(148, 163, 184, 0.15)',
        text: '#94a3b8',      // Slate 400
        border: 'rgba(148, 163, 184, 0.4)'
      }
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px'
  },
  radii: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    full: '9999px'
  }
};

/**
 * Returns accessible status indicator properties (color + textual label + icon symbol)
 */
export function getSemanticStatusBadge(status: string): {
  colorClass: string;
  iconSymbol: string;
  accessibleLabel: string;
} {
  const norm = (status || '').toUpperCase();

  switch (norm) {
    case 'QUALIFIED':
    case 'RELEVANT':
    case 'COMPLETED':
    case 'PASS':
    case 'WEBSITE_VERIFIED_BUSINESS_SITE':
      return {
        colorClass: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40',
        iconSymbol: '✓',
        accessibleLabel: `Status: ${status} (Confirmed)`
      };

    case 'NOT_QUALIFIED':
    case 'NOT_RELEVANT':
    case 'FAIL':
    case 'WEBSITE_NOT_FOUND':
    case 'DISQUALIFIED':
      return {
        colorClass: 'text-rose-400 bg-rose-950/50 border-rose-500/40',
        iconSymbol: '✕',
        accessibleLabel: `Status: ${status} (Excluded)`
      };

    case 'UNCERTAIN':
    case 'AMBIGUOUS':
    case 'UNKNOWN':
    case 'PARTIAL':
    case 'WEBSITE_UNCERTAIN':
      return {
        colorClass: 'text-amber-400 bg-amber-950/50 border-amber-500/40',
        iconSymbol: '?',
        accessibleLabel: `Status: ${status} (Uncertain - Needs Corroboration)`
      };

    case 'BLOCKED':
    case 'RESTRICTED':
    case 'CONTRACT_ONLY':
      return {
        colorClass: 'text-purple-400 bg-purple-950/50 border-purple-500/40',
        iconSymbol: '⊘',
        accessibleLabel: `Status: ${status} (Compliance or Contract Boundary)`
      };

    case 'SKIPPED':
    case 'NOT_STARTED':
      return {
        colorClass: 'text-slate-400 bg-slate-900 border-slate-700',
        iconSymbol: '—',
        accessibleLabel: `Status: ${status} (Stage Skipped or Unexecuted)`
      };

    default:
      return {
        colorClass: 'text-slate-400 bg-slate-900 border-slate-700',
        iconSymbol: '•',
        accessibleLabel: `Status: ${status}`
      };
  }
}
