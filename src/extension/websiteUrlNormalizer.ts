/**
 * Website URL Normalizer for LeadNoria Website Deep Verification
 *
 * Deterministically normalizes input URLs:
 * - Protocols (http vs https)
 * - Trailing slash canonicalization
 * - Domain / www standardization
 * - Strips URL fragments (#...)
 * - Strips marketing tracking query parameters (utm_*, fbclid, gclid, etc.)
 * - Unwraps public Meta link shims (l.facebook.com/l.php?u=...) safely without network calls
 */

export interface NormalizedUrlResult {
  isValid: boolean;
  originalUrl: string;
  normalizedUrl: string;
  finalUrl: string;
  finalOrigin: string;
  finalHostname: string;
  isMetaRedirect: boolean;
  error?: string;
}

const TRACKING_PARAM_PREFIXES = [
  'utm_',
  '_hs',
  'mc_'
];

const TRACKING_PARAMS = new Set([
  'fbclid',
  'gclid',
  'msclkid',
  'ref',
  'ref_src',
  'source',
  'campaign',
  'affiliate',
  'tracking_id',
  'trk'
]);

/**
 * Normalizes input URL and extracts clean canonical address
 */
export function normalizeWebsiteUrl(inputUrl?: string | null): NormalizedUrlResult {
  const original = (inputUrl || '').trim();

  if (!original) {
    return {
      isValid: false,
      originalUrl: original,
      normalizedUrl: '',
      finalUrl: '',
      finalOrigin: '',
      finalHostname: '',
      isMetaRedirect: false,
      error: 'EMPTY_URL'
    };
  }

  // Reject javascript:, data:, blob:, file:, etc.
  if (/^(javascript|data|blob|file|about|chrome|chrome-extension):/i.test(original)) {
    return {
      isValid: false,
      originalUrl: original,
      normalizedUrl: '',
      finalUrl: '',
      finalOrigin: '',
      finalHostname: '',
      isMetaRedirect: false,
      error: 'UNSUPPORTED_SCHEME'
    };
  }

  let workingUrl = original;
  let isMetaRedirect = false;

  // Add https:// scheme if missing
  if (!/^https?:\/\//i.test(workingUrl)) {
    workingUrl = 'https://' + workingUrl;
  }

  try {
    let parsed = new URL(workingUrl);

    // Detect and unpack public Meta redirect link shim (e.g. l.facebook.com/l.php?u=https...)
    if (
      parsed.hostname.toLowerCase().includes('facebook.com') &&
      (parsed.pathname.toLowerCase().endsWith('/l.php') || parsed.pathname.toLowerCase().endsWith('/l/'))
    ) {
      const destinationParam = parsed.searchParams.get('u');
      if (destinationParam) {
        try {
          const decoded = decodeURIComponent(destinationParam);
          if (/^https?:\/\//i.test(decoded)) {
            workingUrl = decoded;
            parsed = new URL(workingUrl);
            isMetaRedirect = true;
          }
        } catch {
          // If decoding fails, continue with original
        }
      }
    }

    // Reject non-http(s) schemes
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        originalUrl: original,
        normalizedUrl: '',
        finalUrl: '',
        finalOrigin: '',
        finalHostname: '',
        isMetaRedirect,
        error: 'INVALID_PROTOCOL'
      };
    }

    // Normalize hostname: lowercase, remove trailing dot
    let hostname = parsed.hostname.toLowerCase().trim();
    if (hostname.endsWith('.')) {
      hostname = hostname.slice(0, -1);
    }

    // Require valid domain format (at least one dot, no spaces)
    if (!hostname || !hostname.includes('.') || hostname.includes(' ')) {
      return {
        isValid: false,
        originalUrl: original,
        normalizedUrl: '',
        finalUrl: '',
        finalOrigin: '',
        finalHostname: '',
        isMetaRedirect,
        error: 'INVALID_HOSTNAME'
      };
    }

    // Remove tracking query parameters
    const cleanedSearchParams = new URLSearchParams();
    for (const [key, value] of parsed.searchParams.entries()) {
      const lowerKey = key.toLowerCase();
      const isTracking =
        TRACKING_PARAMS.has(lowerKey) ||
        TRACKING_PARAM_PREFIXES.some(prefix => lowerKey.startsWith(prefix));

      if (!isTracking) {
        cleanedSearchParams.append(key, value);
      }
    }

    // Normalize path: clean double slashes, strip fragment
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    if (!pathname) {
      pathname = '/';
    }

    const searchString = cleanedSearchParams.toString() ? `?${cleanedSearchParams.toString()}` : '';
    const finalUrl = `${parsed.protocol}//${hostname}${pathname}${searchString}`;
    const finalOrigin = `${parsed.protocol}//${hostname}`;

    // Standardized normalizedUrl (always https if possible, www stripped for comparison)
    const baseHost = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
    const normalizedUrl = `https://${baseHost}${pathname === '/' ? '' : pathname}${searchString}`;

    return {
      isValid: true,
      originalUrl: original,
      normalizedUrl,
      finalUrl,
      finalOrigin,
      finalHostname: hostname,
      isMetaRedirect
    };
  } catch (err) {
    return {
      isValid: false,
      originalUrl: original,
      normalizedUrl: '',
      finalUrl: '',
      finalOrigin: '',
      finalHostname: '',
      isMetaRedirect: false,
      error: (err as Error).message || 'MALFORMED_URL'
    };
  }
}

/**
 * Checks if a candidate URL belongs to the same origin as the root verified origin
 */
export function isSameOriginUrl(targetUrl: string, baseOrigin: string): boolean {
  try {
    const targetParsed = new URL(targetUrl);
    const baseParsed = new URL(baseOrigin);

    // Hostname equality or www equivalence
    const targetHost = targetParsed.hostname.toLowerCase().replace(/^www\./, '');
    const baseHost = baseParsed.hostname.toLowerCase().replace(/^www\./, '');

    return targetHost === baseHost;
  } catch {
    return false;
  }
}
