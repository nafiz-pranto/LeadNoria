/**
 * Website Technology & Digital Signal Detector (Phase 21)
 *
 * Passively observes client-side technology signatures (CMS, E-Commerce,
 * Booking widgets, Chat widgets, Tag Managers, Analytics) in public page HTML.
 *
 * Core Guarantees:
 * - Operates strictly as a passive string/DOM pattern observer.
 * - NEVER executes client-side scripts.
 * - NEVER pings third-party tracking endpoints.
 * - Emits LEADNORIA_DERIVED provenance.
 */

import type { TechnologySignal, TechnologyCategory, TechnologyDetectionState } from './types.ts';

interface TechRule {
  name: string;
  category: TechnologyCategory;
  patterns: Array<{
    regex: RegExp;
    state: TechnologyDetectionState;
    evidence: string;
  }>;
}

const TECHNOLOGY_RULES: TechRule[] = [
  // 1. CMS & Website Builders
  {
    name: 'WordPress',
    category: 'CMS',
    patterns: [
      { regex: /<meta[^>]+name=["']generator["'][^>]+content=["'][^"']*WordPress/i, state: 'DETECTED', evidence: 'WordPress generator meta tag' },
      { regex: /\/wp-content\/(?:themes|plugins)\//i, state: 'DETECTED', evidence: '/wp-content/ asset path' },
      { regex: /\/wp-includes\//i, state: 'DETECTED', evidence: '/wp-includes/ path' },
      { regex: /class=["'][^"']*\bwp-block-/i, state: 'LIKELY', evidence: 'wp-block- Gutenberg class' }
    ]
  },
  {
    name: 'Shopify',
    category: 'ECOMMERCE',
    patterns: [
      { regex: /cdn\.shopify\.com\/s\/files/i, state: 'DETECTED', evidence: 'Shopify CDN asset link' },
      { regex: /\bShopify\.theme\b/i, state: 'DETECTED', evidence: 'Shopify.theme JS object' },
      { regex: /myshopify\.com/i, state: 'DETECTED', evidence: 'myshopify.com reference' }
    ]
  },
  {
    name: 'WooCommerce',
    category: 'ECOMMERCE',
    patterns: [
      { regex: /\/plugins\/woocommerce\//i, state: 'DETECTED', evidence: 'WooCommerce plugin asset' },
      { regex: /\bclass=["'][^"']*\bwoocommerce\b/i, state: 'DETECTED', evidence: 'woocommerce CSS class' }
    ]
  },
  {
    name: 'Wix',
    category: 'CMS',
    patterns: [
      { regex: /static\.parastorage\.com/i, state: 'DETECTED', evidence: 'Wix parastorage CDN' },
      { regex: /<meta[^>]+name=["']generator["'][^>]+content=["'][^"']*Wix\.com/i, state: 'DETECTED', evidence: 'Wix generator meta tag' },
      { regex: /wix-warmup-data/i, state: 'DETECTED', evidence: 'Wix warmup data container' }
    ]
  },
  {
    name: 'Webflow',
    category: 'CMS',
    patterns: [
      { regex: /data-wf-page=["']/i, state: 'DETECTED', evidence: 'data-wf-page Webflow attribute' },
      { regex: /assets\.website-files\.com/i, state: 'DETECTED', evidence: 'Webflow CDN asset URL' },
      { regex: /<meta[^>]+name=["']generator["'][^>]+content=["'][^"']*Webflow/i, state: 'DETECTED', evidence: 'Webflow generator tag' }
    ]
  },
  {
    name: 'Squarespace',
    category: 'CMS',
    patterns: [
      { regex: /static1\.squarespace\.com/i, state: 'DETECTED', evidence: 'Squarespace static CDN' },
      { regex: /<!-- This is Squarespace\. -->/i, state: 'DETECTED', evidence: 'Squarespace comment signature' }
    ]
  },

  // 2. Booking & Scheduling Widgets
  {
    name: 'Calendly',
    category: 'BOOKING',
    patterns: [
      { regex: /assets\.calendly\.com\/assets\/external\/widget\.js/i, state: 'DETECTED', evidence: 'Calendly embedded widget script' },
      { regex: /href=["']https?:\/\/calendly\.com\/[^"']+/i, state: 'LIKELY', evidence: 'Outbound Calendly scheduling link' }
    ]
  },
  {
    name: 'Acuity Scheduling',
    category: 'BOOKING',
    patterns: [
      { regex: /embed\.acuityscheduling\.com\/js\/embed\.js/i, state: 'DETECTED', evidence: 'Acuity Scheduling embed script' },
      { regex: /acuityscheduling\.com\/schedule\.php/i, state: 'LIKELY', evidence: 'Acuity scheduling frame' }
    ]
  },
  {
    name: 'Vagaro',
    category: 'BOOKING',
    patterns: [
      { regex: /saleswidget\.vagaro\.com/i, state: 'DETECTED', evidence: 'Vagaro booking widget' }
    ]
  },

  // 3. Contact & Chat Widgets
  {
    name: 'Intercom',
    category: 'CHAT_WIDGET',
    patterns: [
      { regex: /widget\.intercom\.io\/widget\//i, state: 'DETECTED', evidence: 'Intercom live chat widget script' },
      { regex: /\bwindow\.Intercom\b/i, state: 'DETECTED', evidence: 'window.Intercom API' }
    ]
  },
  {
    name: 'Drift',
    category: 'CHAT_WIDGET',
    patterns: [
      { regex: /js\.driftt\.com\/include\//i, state: 'DETECTED', evidence: 'Drift chat widget script' }
    ]
  },
  {
    name: 'Tawk.to',
    category: 'CHAT_WIDGET',
    patterns: [
      { regex: /embed\.tawk\.to\/[a-z0-9]+/i, state: 'DETECTED', evidence: 'Tawk.to chat embed' }
    ]
  },
  {
    name: 'Crisp',
    category: 'CHAT_WIDGET',
    patterns: [
      { regex: /client\.crisp\.chat\/l\.js/i, state: 'DETECTED', evidence: 'Crisp live chat script' }
    ]
  },

  // 4. Analytics & Tag Managers
  {
    name: 'Google Tag Manager',
    category: 'TAG_MANAGER',
    patterns: [
      { regex: /googletagmanager\.com\/gtm\.js\?id=GTM-/i, state: 'DETECTED', evidence: 'Google Tag Manager container script' }
    ]
  },
  {
    name: 'Google Analytics',
    category: 'ANALYTICS',
    patterns: [
      { regex: /googletagmanager\.com\/gtag\/js\?id=(?:G|UA)-/i, state: 'DETECTED', evidence: 'Google Analytics gtag script' },
      { regex: /google-analytics\.com\/analytics\.js/i, state: 'DETECTED', evidence: 'Legacy Google Analytics script' }
    ]
  },
  {
    name: 'Meta Pixel',
    category: 'ANALYTICS',
    patterns: [
      { regex: /connect\.facebook\.net\/[a-z_]+\/fbevents\.js/i, state: 'DETECTED', evidence: 'Meta Pixel fbevents script' },
      { regex: /\bfbq\(\s*['"]init['"]/i, state: 'DETECTED', evidence: 'fbq("init") Pixel call' }
    ]
  }
];

/**
 * Scans page HTML string for client-side technology signals.
 */
export function detectTechnologiesInHtml(html: string): TechnologySignal[] {
  const normHtml = html || '';
  const detectedSignals: TechnologySignal[] = [];
  const seenTech = new Set<string>();

  for (const rule of TECHNOLOGY_RULES) {
    for (const pat of rule.patterns) {
      if (pat.regex.test(normHtml)) {
        if (!seenTech.has(rule.name)) {
          seenTech.add(rule.name);
          detectedSignals.push({
            name: rule.name,
            category: rule.category,
            state: pat.state,
            evidence: pat.evidence,
            observedAt: new Date().toISOString(),
            provenance: 'LEADNORIA_DERIVED'
          });
        }
        break; // Match rule once
      }
    }
  }

  return detectedSignals;
}
