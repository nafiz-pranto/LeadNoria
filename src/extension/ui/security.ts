/**
 * LeadNoria — Phase 15: UI/UX Integration
 * UI Security Controls & Content Sanitization
 * 
 * Invariants:
 * - Render all source text as literal passive text, never executable HTML
 * - Externally navigable links must strictly use http:// or https://
 * - Prompt injection phrases ("ignore rules", "export all data") are strictly data
 */

/**
 * Escapes unsafe HTML characters to prevent XSS injection.
 */
export function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates external URL protocols. Strictly permits ONLY http: and https:.
 * Rejects javascript:, data:, vbscript:, file:, blob:, etc.
 */
export function isValidExternalUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '') return false;

  // Explicit forbidden protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.startsWith('blob:')
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalizes an external URL for safe rendering or returns null if invalid.
 */
export function getSafeExternalUrl(url: string | null | undefined): string | null {
  if (isValidExternalUrl(url)) {
    return url!.trim();
  }
  return null;
}

/**
 * Treats prompt injection as literal passive string.
 * Ensures input cannot be executed as a command or alter policy.
 */
export function sanitizePassiveText(text: string | null | undefined, maxLength = 1000): string {
  if (text == null) return '';
  const str = String(text);
  // Truncate to bound memory
  const bounded = str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  return bounded.trim();
}
