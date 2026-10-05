/**
 * Public Person & Team Extractor (Phase 21)
 *
 * Extracts team members, leadership, and public business contacts
 * explicitly published on the target business website.
 *
 * NON-NEGOTIABLE SAFETY:
 * - Extracts ONLY explicitly published names and titles.
 * - NEVER guesses emails or titles.
 * - NEVER searches external databases or LinkedIn.
 * - Bounded collection (max 15 individuals per domain).
 * - Emits WEBSITE_DERIVED provenance.
 */

import type { PublicPerson, PersonEvidenceKind } from './types.ts';

const MAX_EXTRACTED_PEOPLE = 15;

const LEADERSHIP_TITLE_PATTERNS = [
  /\b(?:founder|co-founder|owner|co-owner|proprietor)\b/i,
  /\b(?:ceo|chief executive officer|cto|cfo|coo|cmo|cso|president|vice president|vp)\b/i,
  /\b(?:managing director|director|principal|general manager|gm|partner|managing partner)\b/i,
  /\b(?:attorney|lawyer|counsel|solicitor|barrister)\b/i,
  /\b(?:dr\.|doctor|dentist|orthodontist|surgeon|chiropractor|physician)\b/i,
  /\b(?:office manager|practice manager|operations manager|sales manager|branch manager)\b/i,
  /\b(?:lead technician|master plumber|master electrician|head chef)\b/i
];

/**
 * Extracts public people from JSON-LD schema objects (Person, employee, alumni).
 */
export function extractPeopleFromJsonLd(html: string, pageUrl: string): PublicPerson[] {
  const people: PublicPerson[] = [];
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = (html || '').matchAll(scriptRegex);

  for (const m of matches) {
    if (people.length >= MAX_EXTRACTED_PEOPLE) break;

    try {
      const parsed = JSON.parse(m[1].trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of items) {
        if (!item || typeof item !== 'object') continue;

        // Check if item itself is Person
        if (item['@type'] === 'Person') {
          processPersonItem(item, people, pageUrl, 'STRUCTURED_DATA');
        }

        // Check employee / founder arrays in Organization/LocalBusiness
        if (Array.isArray(item.employee)) {
          for (const emp of item.employee) {
            processPersonItem(emp, people, pageUrl, 'STRUCTURED_DATA');
          }
        }
        if (Array.isArray(item.founder)) {
          for (const f of item.founder) {
            processPersonItem(f, people, pageUrl, 'STRUCTURED_DATA');
          }
        }
      }
    } catch {
      // Ignore invalid JSON-LD
    }
  }

  return people;
}

function processPersonItem(
  item: any,
  list: PublicPerson[],
  pageUrl: string,
  evidenceType: PersonEvidenceKind
) {
  if (list.length >= MAX_EXTRACTED_PEOPLE) return;
  if (!item || typeof item !== 'object') return;

  const rawName = typeof item.name === 'string' ? item.name.trim() : '';
  if (!rawName || rawName.length < 3 || rawName.length > 80) return;

  // Clean name
  const fullName = rawName.replace(/\s+/g, ' ');

  // Avoid duplicates
  if (list.some(p => p.fullName.toLowerCase() === fullName.toLowerCase())) return;

  const jobTitle = typeof item.jobTitle === 'string' ? item.jobTitle.trim() : undefined;
  const email = typeof item.email === 'string' && item.email.includes('@') ? item.email.trim().toLowerCase() : undefined;
  const phone = typeof item.telephone === 'string' ? item.telephone.trim() : undefined;

  let linkedInUrl: string | undefined;
  if (typeof item.sameAs === 'string' && item.sameAs.includes('linkedin.com/in/')) {
    linkedInUrl = item.sameAs.trim();
  } else if (Array.isArray(item.sameAs)) {
    const li = item.sameAs.find((u: any) => typeof u === 'string' && u.includes('linkedin.com/in/'));
    if (li) linkedInUrl = li.trim();
  }

  list.push({
    fullName,
    jobTitle,
    email,
    phone,
    linkedInUrl,
    sourceUrl: pageUrl,
    evidenceType,
    observedAt: new Date().toISOString(),
    provenance: 'WEBSITE_DERIVED'
  });
}

/**
 * Extracts public people from HTML DOM cards and heading patterns (e.g. on Team or About pages).
 */
export function extractPeopleFromHtmlDom(html: string, pageUrl: string): PublicPerson[] {
  const people: PublicPerson[] = [];
  const lowerUrl = pageUrl.toLowerCase();
  const isTeamOrAbout =
    lowerUrl.includes('/team') ||
    lowerUrl.includes('/about') ||
    lowerUrl.includes('/leadership') ||
    lowerUrl.includes('/staff') ||
    lowerUrl.includes('/people');

  const evidenceType: PersonEvidenceKind = isTeamOrAbout ? 'TEAM_PAGE' : 'VISIBLE_CONTENT';
  const normHtml = html || '';

  // Look for card-like blocks containing name and title
  // e.g. <h3 class="name">Dr. John Smith</h3> <p class="title">Founder & Medical Director</p>
  const cardRegex = /<(?:div|article|section|li)[^>]*class=["'][^"']*(?:team|member|person|profile|bio|staff)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|article|section|li)>/gi;
  const cards = normHtml.matchAll(cardRegex);

  for (const card of cards) {
    if (people.length >= MAX_EXTRACTED_PEOPLE) break;

    const cardContent = card[1] || '';

    // Extract name from h2, h3, h4 or .name
    const nameMatch = cardContent.match(/<(?:h[2-4]|strong|span)[^>]*class=["'][^"']*(?:name|title)[^"']*["'][^>]*>([^<]+)<\/(?:h[2-4]|strong|span)>/i) ||
      cardContent.match(/<h[3-4][^>]*>([^<]+)<\/h[3-4]>/i);

    if (!nameMatch) continue;

    const rawName = nameMatch[1].replace(/<[^>]+>/g, '').trim();
    if (!rawName || rawName.length < 3 || rawName.length > 70) continue;
    if (/\b(?:team|members|leadership|about|company|menu|services)\b/i.test(rawName)) continue;

    const fullName = rawName.replace(/\s+/g, ' ');

    if (people.some(p => p.fullName.toLowerCase() === fullName.toLowerCase())) continue;

    // Extract title from p or span with class role/title/position or following text
    let jobTitle: string | undefined;
    const titleMatch = cardContent.match(/<(?:p|span|div)[^>]*class=["'][^"']*(?:role|position|job-title|designation)[^"']*["'][^>]*>([^<]+)<\/(?:p|span|div)>/i);
    if (titleMatch) {
      jobTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim();
    } else {
      // Check if text within card matches a known leadership title
      for (const pat of LEADERSHIP_TITLE_PATTERNS) {
        const textMatch = cardContent.match(pat);
        if (textMatch) {
          jobTitle = textMatch[0].trim();
          break;
        }
      }
    }

    // Extract LinkedIn link if present inside this person's card
    let linkedInUrl: string | undefined;
    const liMatch = cardContent.match(/href=["'](https?:\/\/(?:www\.)?linkedin\.com\/in\/[^"']+)["']/i);
    if (liMatch) {
      linkedInUrl = liMatch[1].trim();
    }

    // Extract direct email if present inside card
    let email: string | undefined;
    const emailMatch = cardContent.match(/mailto:([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i) ||
      cardContent.match(/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/i);
    if (emailMatch) {
      email = emailMatch[1].trim().toLowerCase();
    }

    // Require either a recognized title, leadership keyword, or is on a dedicated team page with valid name
    if (jobTitle || isTeamOrAbout) {
      people.push({
        fullName,
        jobTitle,
        email,
        linkedInUrl,
        sourceUrl: pageUrl,
        evidenceType,
        observedAt: new Date().toISOString(),
        provenance: 'WEBSITE_DERIVED'
      });
    }
  }

  return people;
}

/**
 * Extracts and consolidates all public people from page HTML (JSON-LD + DOM).
 */
export function extractPublicPeople(html: string, pageUrl: string): PublicPerson[] {
  const jsonLdPeople = extractPeopleFromJsonLd(html, pageUrl);
  const domPeople = extractPeopleFromHtmlDom(html, pageUrl);

  const consolidated: PublicPerson[] = [...jsonLdPeople];

  for (const person of domPeople) {
    if (consolidated.length >= MAX_EXTRACTED_PEOPLE) break;
    const existing = consolidated.find(p => p.fullName.toLowerCase() === person.fullName.toLowerCase());
    if (existing) {
      // Corroborate missing fields
      if (!existing.jobTitle && person.jobTitle) existing.jobTitle = person.jobTitle;
      if (!existing.email && person.email) existing.email = person.email;
      if (!existing.linkedInUrl && person.linkedInUrl) existing.linkedInUrl = person.linkedInUrl;
    } else {
      consolidated.push(person);
    }
  }

  return consolidated;
}
