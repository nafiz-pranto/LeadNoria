/**
 * Public Business Services Extractor (Phase 21)
 *
 * Extracts public business services and offerings explicitly listed in page HTML,
 * navigation menus, and JSON-LD schema catalogs.
 *
 * NON-NEGOTIABLE SAFETY:
 * - Extracts ONLY explicitly published service text and headings.
 * - NEVER infers unobserved services or invents semantic categories.
 * - Bounded collection (max 25 services per domain).
 * - Emits WEBSITE_DERIVED provenance.
 */

import type { BusinessService } from './types.ts';

const MAX_EXTRACTED_SERVICES = 25;

/**
 * Extracts services from JSON-LD schema (hasOfferCatalog, makesOffer, serviceType, offers).
 */
export function extractServicesFromJsonLd(html: string, pageUrl: string): BusinessService[] {
  const services: BusinessService[] = [];
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = (html || '').matchAll(scriptRegex);

  for (const m of matches) {
    if (services.length >= MAX_EXTRACTED_SERVICES) break;

    try {
      const parsed = JSON.parse(m[1].trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of items) {
        if (!item || typeof item !== 'object') continue;

        // Service item directly
        if (item['@type'] === 'Service' && typeof item.name === 'string') {
          addService(services, item.name, item.serviceType || item.category, pageUrl, item.description);
        }

        // hasOfferCatalog / offers
        const offers = item.hasOfferCatalog?.itemListElement || item.offers || item.makesOffer;
        if (Array.isArray(offers)) {
          for (const off of offers) {
            const name = off.name || off.itemOffered?.name;
            if (typeof name === 'string') {
              addService(services, name, off.itemOffered?.serviceType, pageUrl, off.description);
            }
          }
        }
      }
    } catch {
      // Ignore malformed JSON-LD
    }
  }

  return services;
}

/**
 * Extracts services from HTML sections, headings, and list items.
 */
export function extractServicesFromHtmlDom(html: string, pageUrl: string): BusinessService[] {
  const services: BusinessService[] = [];
  const lowerUrl = pageUrl.toLowerCase();
  const isServicesPage =
    lowerUrl.includes('/service') ||
    lowerUrl.includes('/practice-area') ||
    lowerUrl.includes('/treatment') ||
    lowerUrl.includes('/what-we-do');

  const normHtml = html || '';

  // 1. Look for service containers: <section id="services"> or <div class="services">
  const sectionRegex = /<(?:section|div|article)[^>]+(?:id|class)=["'][^"']*(?:service|offering|practice-area|treatment)[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div|article)>/gi;
  const sections = normHtml.matchAll(sectionRegex);

  for (const s of sections) {
    if (services.length >= MAX_EXTRACTED_SERVICES) break;
    const content = s[1] || '';

    // Extract headings (h2, h3, h4) inside service sections
    const headingMatches = content.matchAll(/<h[2-4][^>]*>([^<]+)<\/h[2-4]>/gi);
    for (const h of headingMatches) {
      if (services.length >= MAX_EXTRACTED_SERVICES) break;
      const text = h[1].replace(/<[^>]+>/g, '').trim();
      if (isValidServiceName(text)) {
        addService(services, text, undefined, pageUrl);
      }
    }

    // Extract list items <li> inside service sections
    const liMatches = content.matchAll(/<li[^>]*>([^<]{3,80})<\/li>/gi);
    for (const li of liMatches) {
      if (services.length >= MAX_EXTRACTED_SERVICES) break;
      const text = li[1].replace(/<[^>]+>/g, '').trim();
      if (isValidServiceName(text)) {
        addService(services, text, undefined, pageUrl);
      }
    }
  }

  // 2. If dedicated services page, also inspect main headings
  if (isServicesPage && services.length < 5) {
    const mainHeadings = normHtml.matchAll(/<h[2-3][^>]*>([^<]+)<\/h[2-3]>/gi);
    for (const h of mainHeadings) {
      if (services.length >= MAX_EXTRACTED_SERVICES) break;
      const text = h[1].replace(/<[^>]+>/g, '').trim();
      if (isValidServiceName(text)) {
        addService(services, text, undefined, pageUrl);
      }
    }
  }

  return services;
}

function isValidServiceName(text: string): boolean {
  if (!text || text.length < 3 || text.length > 70) return false;
  const lower = text.toLowerCase();
  const banned = [
    'services', 'our services', 'all services', 'what we do',
    'contact us', 'about us', 'read more', 'learn more', 'view details',
    'home', 'privacy policy', 'terms of service', 'menu', 'navigation',
    'quick links', 'get in touch', 'book now', 'schedule now'
  ];
  return !banned.includes(lower) && !lower.startsWith('copyright');
}

function addService(
  list: BusinessService[],
  rawName: string,
  category: string | undefined,
  pageUrl: string,
  snippet?: string
) {
  if (list.length >= MAX_EXTRACTED_SERVICES) return;
  const cleanName = rawName.replace(/\s+/g, ' ').trim();
  if (list.some(s => s.name.toLowerCase() === cleanName.toLowerCase())) return;

  list.push({
    name: cleanName,
    category: category ? category.trim() : undefined,
    sourceUrl: pageUrl,
    snippet: snippet ? snippet.slice(0, 200).trim() : undefined,
    observedAt: new Date().toISOString(),
    provenance: 'WEBSITE_DERIVED'
  });
}

/**
 * Extracts and consolidates all public business services from page HTML.
 */
export function extractPublicServices(html: string, pageUrl: string): BusinessService[] {
  const jsonLdServices = extractServicesFromJsonLd(html, pageUrl);
  const domServices = extractServicesFromHtmlDom(html, pageUrl);

  const consolidated: BusinessService[] = [...jsonLdServices];

  for (const s of domServices) {
    if (consolidated.length >= MAX_EXTRACTED_SERVICES) break;
    if (!consolidated.some(existing => existing.name.toLowerCase() === s.name.toLowerCase())) {
      consolidated.push(s);
    }
  }

  return consolidated;
}
