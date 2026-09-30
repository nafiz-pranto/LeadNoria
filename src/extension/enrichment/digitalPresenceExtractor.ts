/**
 * Digital Presence & Social Link Extractor (Phase 11)
 *
 * Deterministically extracts outbound links to verified social profiles and channels
 * directly linked from the target business website.
 *
 * NON-NEGOTIABLE SAFETY:
 * - NEVER crawls the social platforms.
 * - NEVER fetches external profile pages.
 * - Discards sharing widgets (sharer.php, intent/tweet, etc.).
 * - Operates strictly as a passive public-link observer.
 */

import type {
  DigitalPresenceFact,
  SocialPlatform,
  ContactEvidenceItem
} from './contactTypes.ts';
import { normalizeSocialUrl } from './contactNormalizer.ts';
import { createContactEvidence } from './contactEvidence.ts';

// Known social platform definitions mapped to root domains
interface PlatformPattern {
  platform: SocialPlatform;
  hostPatterns: string[];
  bannedPaths: string[];
}

const PLATFORM_PATTERNS: PlatformPattern[] = [
  {
    platform: 'FACEBOOK',
    hostPatterns: ['facebook.com', 'fb.com', 'fb.me', 'm.facebook.com'],
    bannedPaths: ['/sharer', '/share', '/dialog', '/login', '/signup', '/help', '/policy']
  },
  {
    platform: 'INSTAGRAM',
    hostPatterns: ['instagram.com', 'instagr.am'],
    bannedPaths: ['/accounts', '/explore', '/developer', '/about']
  },
  {
    platform: 'LINKEDIN',
    hostPatterns: ['linkedin.com'],
    bannedPaths: ['/sharearticle', '/sharing', '/share', '/login', '/signup', '/help', '/legal']
  },
  {
    platform: 'YOUTUBE',
    hostPatterns: ['youtube.com', 'youtu.be'],
    bannedPaths: ['/watch', '/embed', '/results', '/feed', '/t/terms', '/howyoutubeworks']
  },
  {
    platform: 'TIKTOK',
    hostPatterns: ['tiktok.com'],
    bannedPaths: ['/share', '/login', '/tag', '/legal']
  },
  {
    platform: 'TWITTER_X',
    hostPatterns: ['twitter.com', 'x.com', 't.co'],
    bannedPaths: ['/intent', '/share', '/home', '/login', '/privacy', '/tos']
  },
  {
    platform: 'GITHUB',
    hostPatterns: ['github.com'],
    bannedPaths: ['/login', '/join', '/features', '/pricing', '/about']
  },
  {
    platform: 'PINTEREST',
    hostPatterns: ['pinterest.com'],
    bannedPaths: ['/pin/create', '/resource', '/about', '/business']
  }
];

/**
 * Extracts social profile destinations from page HTML anchors.
 */
export function extractDigitalPresenceFromHtml(
  html: string,
  pageUrl: string
): DigitalPresenceFact[] {
  const facts: DigitalPresenceFact[] = [];
  const normHtml = html || '';

  // Extract all hrefs from <a> tags
  const anchorRegex = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const matches = normHtml.matchAll(anchorRegex);

  for (const m of matches) {
    const rawHref = (m[1] || '').trim();
    const anchorBody = (m[2] || '').trim();

    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || rawHref.startsWith('javascript:')) {
      continue;
    }

    // Must be an external absolute URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawHref, pageUrl);
    } catch {
      continue;
    }

    const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsedUrl.pathname.toLowerCase();

    // Match against known platforms
    for (const pat of PLATFORM_PATTERNS) {
      if (pat.hostPatterns.some(p => host === p || host.endsWith(`.${p}`))) {
        // Check for banned / share paths
        if (pat.bannedPaths.some(bp => pathname.startsWith(bp) || pathname.includes(bp))) {
          continue;
        }

        // Must have a meaningful path or handle (e.g. facebook.com/acme, not just facebook.com/)
        const cleanPath = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
        if (!cleanPath) {
          continue;
        }

        const norm = normalizeSocialUrl(parsedUrl.toString());
        if (!norm.isValid || norm.isShareWidget) {
          continue;
        }

        // Determine context snippet
        const snippet = anchorBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || `${pat.platform} profile link`;

        const evidence: ContactEvidenceItem = createContactEvidence({
          field: 'social',
          rawValue: rawHref,
          normalizedValue: norm.normalizedUrl,
          pageUrl,
          evidenceType: 'ANCHOR_LINK',
          evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
          contextSnippet: snippet.slice(0, 150)
        });

        facts.push({
          platform: pat.platform,
          rawUrl: rawHref,
          normalizedUrl: norm.normalizedUrl,
          domain: norm.domain,
          handleOrPath: norm.handleOrPath,
          pageObserved: pageUrl,
          status: 'FOUND',
          evidence: [evidence],
          provenance: 'WEBSITE_DERIVED',
          sourceContributions: [
            {
              source: 'FUTURE_SOURCE',
              provenance: 'WEBSITE_DERIVED',
              fieldName: `social_${pat.platform.toLowerCase()}`,
              acquisitionContext: 'WEBSITE_DIRECT',
              restrictionBasis: 'NONE',
              isRestricted: false,
              policyStatus: 'POLICY_APPROVED',
              persistenceStatus: 'PERSISTABLE',
              exportStatus: 'EXPORTABLE'
            }
          ]
        });
        break;
      }
    }
  }

  return facts;
}
