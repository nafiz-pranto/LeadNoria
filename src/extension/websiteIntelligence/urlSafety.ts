/**
 * URL Safety & SSRF Defense Validator (Phase 21)
 *
 * Enforces strict protocol validation, loopback/private-network blocking,
 * cloud metadata defense, and same-origin integrity for website intelligence crawling.
 */

export interface UrlSafetyResult {
  isSafe: boolean;
  reason?: string;
  normalizedUrl?: string;
  parsedUrl?: URL;
}

const FORBIDDEN_SCHEMES = new Set([
  'javascript:',
  'data:',
  'file:',
  'vbscript:',
  'chrome:',
  'chrome-extension:',
  'blob:',
  'about:',
  'ws:',
  'wss:',
  'ftp:',
  'sftp:'
]);

const FORBIDDEN_INTERNAL_TLDS = [
  '.local',
  '.internal',
  '.localhost',
  '.lan',
  '.corp',
  '.home',
  '.test',
  '.example',
  '.invalid'
];

/**
 * Checks if an IPv4 address string falls into loopback, private, or link-local ranges.
 */
function isPrivateOrLoopbackIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  const [b0, b1] = parts;

  // 0.0.0.0/8
  if (b0 === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return true;

  // 10.0.0.0/8 (Private Class A)
  if (b0 === 10) return true;

  // 172.16.0.0/12 (Private Class B: 172.16.0.0 - 172.31.255.255)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

  // 192.168.0.0/16 (Private Class C)
  if (b0 === 192 && b1 === 168) return true;

  // 169.254.0.0/16 (Link-Local / AWS/GCP/Azure Cloud Metadata 169.254.169.254)
  if (b0 === 169 && b1 === 254) return true;

  return false;
}

/**
 * Validates a target URL against protocol, SSRF, loopback, and internal network restrictions.
 */
export function validateSafeWebUrl(rawUrl: string): UrlSafetyResult {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return { isSafe: false, reason: 'EMPTY_URL' };
  }

  // Fast scheme check
  const lower = trimmed.toLowerCase();
  for (const scheme of FORBIDDEN_SCHEMES) {
    if (lower.startsWith(scheme)) {
      return { isSafe: false, reason: `FORBIDDEN_SCHEME: ${scheme}` };
    }
  }

  // Ensure standard http/https
  let working = trimmed;
  if (!/^https?:\/\//i.test(working)) {
    working = 'https://' + working;
  }

  let parsed: URL;
  try {
    parsed = new URL(working);
  } catch {
    return { isSafe: false, reason: 'MALFORMED_URL' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isSafe: false, reason: `INVALID_PROTOCOL: ${parsed.protocol}` };
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  // Loopback hostnames
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0' ||
    hostname === '[::1]'
  ) {
    return { isSafe: false, reason: 'LOOPBACK_NOT_ALLOWED' };
  }

  // IPv4 private & link-local / cloud metadata ranges
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    if (isPrivateOrLoopbackIPv4(hostname)) {
      return { isSafe: false, reason: 'PRIVATE_NETWORK_NOT_ALLOWED' };
    }
  }

  // IPv6 local ranges (fe80, fc00, fd00)
  if (hostname.startsWith('[fe8') || hostname.startsWith('[fc') || hostname.startsWith('[fd')) {
    return { isSafe: false, reason: 'IPV6_LOCAL_NOT_ALLOWED' };
  }

  // Internal TLDs
  for (const tld of FORBIDDEN_INTERNAL_TLDS) {
    if (hostname.endsWith(tld)) {
      return { isSafe: false, reason: `INTERNAL_TLD_NOT_ALLOWED: ${tld}` };
    }
  }

  // Must contain valid domain dot (excluding pure IP)
  if (!hostname.includes('.') || hostname.includes(' ')) {
    return { isSafe: false, reason: 'INVALID_HOSTNAME' };
  }

  return {
    isSafe: true,
    normalizedUrl: parsed.toString(),
    parsedUrl: parsed
  };
}

/**
 * Checks if targetUrl shares the exact same origin (or www-equivalent origin) as baseOrigin
 */
export function isSafeSameOrigin(targetUrl: string, baseOrigin: string): boolean {
  try {
    const targetParsed = new URL(targetUrl);
    const baseParsed = new URL(baseOrigin);

    if (targetParsed.protocol !== baseParsed.protocol) {
      // Allow https upgrade or downgrade if host matches
      if (!['http:', 'https:'].includes(targetParsed.protocol)) return false;
    }

    const tHost = targetParsed.hostname.toLowerCase().replace(/^www\./, '');
    const bHost = baseParsed.hostname.toLowerCase().replace(/^www\./, '');

    return tHost === bHost;
  } catch {
    return false;
  }
}

export interface RedirectValidationResult {
  isSafe: boolean;
  reason?: string;
  resolvedUrl?: string;
}

/**
 * Validates a single redirect hop against SSRF, IP safety, scheme, and same-origin rules.
 *
 * For every redirect:
 * 1. Resolves destination against current URL.
 * 2. Validates scheme (HTTP/HTTPS only).
 * 3. Rejects loopback (localhost, 127.0.0.1, ::1).
 * 4. Rejects private RFC-1918 IPs.
 * 5. Rejects link-local & cloud metadata IPs (169.254.169.254).
 * 6. Rejects internal/reserved TLDs.
 * 7. Enforces strict same-origin (or www-equivalent) constraint against baseOrigin.
 */
export function validateRedirectHop(
  locationHeader: string,
  currentUrl: string,
  baseOrigin: string
): RedirectValidationResult {
  if (!locationHeader || typeof locationHeader !== 'string') {
    return { isSafe: false, reason: 'EMPTY_REDIRECT_LOCATION' };
  }

  const trimmed = locationHeader.trim();
  if (!trimmed) {
    return { isSafe: false, reason: 'EMPTY_REDIRECT_LOCATION' };
  }

  // 1. Resolve relative or absolute redirect destination
  let resolved: URL;
  try {
    resolved = new URL(trimmed, currentUrl);
  } catch {
    return { isSafe: false, reason: 'MALFORMED_REDIRECT_URL' };
  }

  // 2. Validate destination against URL safety rules (scheme, loopback, private IP, metadata, internal TLDs)
  const safety = validateSafeWebUrl(resolved.toString());
  if (!safety.isSafe) {
    return { isSafe: false, reason: `UNSAFE_REDIRECT_TARGET: ${safety.reason}` };
  }

  // 3. Enforce strict same-origin relative to the crawl baseOrigin
  if (!isSafeSameOrigin(resolved.toString(), baseOrigin)) {
    return { isSafe: false, reason: 'CROSS_ORIGIN_REDIRECT_BLOCKED' };
  }

  return {
    isSafe: true,
    resolvedUrl: resolved.toString()
  };
}
