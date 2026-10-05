/**
 * Bounded Page Discovery Strategy (Phase 21)
 *
 * Implements deterministic same-origin page priority ordering:
 * 1. Homepage
 * 2. Contact page
 * 3. About page
 * 4. Services / Products page
 * 5. Team / Leadership page
 *
 * Enforces strict crawl bounds (max 5 pages) and filters out non-content paths.
 */

import { isSafeSameOrigin, validateSafeWebUrl } from './urlSafety.ts';

const BANNED_PATH_PATTERNS = [
  '/login',
  '/signin',
  '/sign-in',
  '/signup',
  '/sign-up',
  '/register',
  '/auth',
  '/cart',
  '/checkout',
  '/my-account',
  '/account',
  '/wp-admin',
  '/wp-login',
  '/user',
  '/password',
  '/reset',
  '/admin',
  '/portal',
  '/session',
  '/logout',
  '/signout'
];

const BANNED_EXTENSIONS = [
  '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
  '.exe', '.dmg', '.pkg', '.apk', '.bin',
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico',
  '.mp4', '.avi', '.mov', '.wmv', '.mp3', '.wav',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'
];

const BANNED_HOST_FRAGMENTS = [
  'facebook.com', 'fb.com', 'instagram.com', 'twitter.com', 'x.com',
  'linkedin.com', 'youtube.com', 'pinterest.com', 'tiktok.com',
  'google.com', 'amazon.', 'ebay.', 'aliexpress.', 'apple.com',
  'doubleclick.net', 'googleadservices.com', 'googlesyndication.com'
];

export interface PageCategoryMatch {
  url: string;
  category: 'HOMEPAGE' | 'CONTACT' | 'ABOUT' | 'SERVICES' | 'TEAM' | 'OTHER';
  priority: number;
}

const CATEGORY_PATTERNS: Array<{
  category: 'CONTACT' | 'ABOUT' | 'SERVICES' | 'TEAM';
  priority: number;
  patterns: RegExp[];
}> = [
  {
    category: 'CONTACT',
    priority: 1,
    patterns: [
      /\/contact(?:-us|us)?\b/i,
      /\/get-in-touch\b/i,
      /\/reach-us\b/i,
      /\/locations?\b/i,
      /\/find-us\b/i
    ]
  },
  {
    category: 'ABOUT',
    priority: 2,
    patterns: [
      /\/about(?:-us)?\b/i,
      /\/our-story\b/i,
      /\/who-we-are\b/i,
      /\/company\b/i,
      /\/mission\b/i
    ]
  },
  {
    category: 'SERVICES',
    priority: 3,
    patterns: [
      /\/services?\b/i,
      /\/our-services\b/i,
      /\/what-we-do\b/i,
      /\/practice-areas?\b/i,
      /\/treatments?\b/i,
      /\/products?\b/i,
      /\/solutions?\b/i
    ]
  },
  {
    category: 'TEAM',
    priority: 4,
    patterns: [
      /\/team\b/i,
      /\/our-team\b/i,
      /\/leadership\b/i,
      /\/staff\b/i,
      /\/doctors?\b/i,
      /\/attorneys?\b/i,
      /\/providers?\b/i,
      /\/people\b/i,
      /\/board\b/i
    ]
  }
];

/**
 * Categorizes a URL path into the deterministic discovery priority taxonomy.
 */
export function categorizePagePath(url: string, rootUrl: string): PageCategoryMatch {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { url, category: 'OTHER', priority: 99 };
  }

  const rootClean = rootUrl.toLowerCase().replace(/\/$/, '');
  const urlClean = url.toLowerCase().replace(/\/$/, '');
  if (rootClean === urlClean || parsed.pathname === '/' || !parsed.pathname) {
    return { url, category: 'HOMEPAGE', priority: 0 };
  }

  const pathname = parsed.pathname.toLowerCase();

  for (const cat of CATEGORY_PATTERNS) {
    for (const pat of cat.patterns) {
      if (pat.test(pathname)) {
        return { url, category: cat.category, priority: cat.priority };
      }
    }
  }

  return { url, category: 'OTHER', priority: 10 };
}

/**
 * Extracts and filters all valid candidate links from raw HTML on a given page.
 */
export function extractCandidateLinksFromHtml(html: string, pageUrl: string): string[] {
  const normHtml = html || '';
  const links: string[] = [];
  const currentOrigin = new URL(pageUrl).origin;

  const anchorRegex = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  const matches = normHtml.matchAll(anchorRegex);

  for (const m of matches) {
    const rawHref = (m[1] || '').trim();
    if (
      !rawHref ||
      rawHref.startsWith('#') ||
      rawHref.startsWith('mailto:') ||
      rawHref.startsWith('tel:') ||
      rawHref.startsWith('javascript:') ||
      rawHref.startsWith('data:')
    ) {
      continue;
    }

    let absUrl: string;
    try {
      absUrl = new URL(rawHref, pageUrl).toString();
    } catch {
      continue;
    }

    // Must be safe web URL
    const safety = validateSafeWebUrl(absUrl);
    if (!safety.isSafe || !safety.parsedUrl) {
      continue;
    }

    const parsed = safety.parsedUrl;

    // Must be same origin
    if (!isSafeSameOrigin(absUrl, currentOrigin)) {
      continue;
    }

    // Check banned hosts
    const host = parsed.hostname.toLowerCase();
    if (BANNED_HOST_FRAGMENTS.some(b => host.includes(b))) {
      continue;
    }

    // Check banned paths
    const path = parsed.pathname.toLowerCase();
    if (BANNED_PATH_PATTERNS.some(b => path.includes(b))) {
      continue;
    }

    // Check banned extensions
    if (BANNED_EXTENSIONS.some(ext => path.endsWith(ext))) {
      continue;
    }

    // Normalize: strip query tracking and trailing slashes
    const cleanPath = (path.replace(/\/$/, '') || '/');
    const normalized = `${parsed.protocol}//${parsed.hostname}${cleanPath}`;

    if (!links.includes(normalized)) {
      links.push(normalized);
    }
  }

  return links;
}

/**
 * Prioritizes candidate links into a bounded deterministic crawl list.
 */
export function buildDiscoveryPlan(rootUrl: string, candidateLinks: string[], maxPages = 5): string[] {
  const cleanRoot = rootUrl.replace(/\/$/, '');
  const plan: string[] = [cleanRoot];

  // Categorize and sort candidates
  const categorized = candidateLinks
    .filter(link => link.replace(/\/$/, '') !== cleanRoot)
    .map(link => categorizePagePath(link, rootUrl))
    .sort((a, b) => a.priority - b.priority);

  // Pick top candidate per category first to ensure diverse coverage
  const categoriesSeen = new Set<string>();

  for (const item of categorized) {
    if (plan.length >= maxPages) break;
    if (item.category !== 'OTHER' && !categoriesSeen.has(item.category)) {
      plan.push(item.url);
      categoriesSeen.add(item.category);
    }
  }

  // Fill remaining budget with other priority links
  for (const item of categorized) {
    if (plan.length >= maxPages) break;
    if (!plan.includes(item.url)) {
      plan.push(item.url);
    }
  }

  return plan.slice(0, maxPages);
}
