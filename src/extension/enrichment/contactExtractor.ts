/**
 * Contact Fact Extractor (Phase 11)
 *
 * Implements deterministic public business contact discovery across HTML DOM,
 * JSON-LD schema, microdata, tel/mailto anchors, and visible text.
 *
 * NON-NEGOTIABLE SAFETY:
 * - Publicly visible data only.
 * - Discards private personal information patterns.
 * - Detects contact forms for presence ONLY; NEVER SUBMITS.
 */

import type {
  BusinessPhoneFact,
  BusinessEmailFact,
  BusinessLocationFact,
  ContactFormFact,
  BusinessNameFact,
  ContactEvidenceItem,
  ContactEvidenceType
} from './contactTypes.ts';
import {
  normalizeBusinessEmail,
  normalizeBusinessPhone,
  normalizeBusinessAddress,
  normalizeBusinessNameFact,
  sanitizeWebText
} from './contactNormalizer.ts';
import { createContactEvidence } from './contactEvidence.ts';
import {
  deduplicatePhones,
  deduplicateEmails,
  deduplicateLocations,
  deduplicateContactForms
} from './contactDeduper.ts';

export interface RawPageExtractedContacts {
  businessNames: BusinessNameFact[];
  phones: BusinessPhoneFact[];
  emails: BusinessEmailFact[];
  locations: BusinessLocationFact[];
  contactForms: ContactFormFact[];
}

/**
 * Decodes standard HTML entities (e.g. &#64; -> @, &amp; -> &, &quot; -> ", etc.)
 */
function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&#64;/gi, '@')
    .replace(/&#x40;/gi, '@')
    .replace(/&commat;/gi, '@')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, ' ');
}

/**
 * Extracts business name facts from title, h1, JSON-LD, and footer.
 */
export function extractBusinessNamesFromHtml(html: string, pageUrl: string): BusinessNameFact[] {
  const facts: BusinessNameFact[] = [];
  const decoded = decodeHtmlEntities(html);

  // 1. JSON-LD Organization / LocalBusiness name
  const jsonLdMatches = decoded.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const orgs = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of orgs) {
        const type = item['@type'];
        if (
          type === 'Organization' ||
          type === 'LocalBusiness' ||
          type === 'Corporation' ||
          type === 'Store' ||
          (Array.isArray(type) && type.some(t => t === 'Organization' || t === 'LocalBusiness'))
        ) {
          if (item.name && typeof item.name === 'string') {
            const norm = normalizeBusinessNameFact(item.name);
            if (norm.status === 'FOUND') {
              facts.push({
                rawValue: norm.rawValue,
                normalizedName: norm.normalizedName,
                comparisonKey: norm.comparisonKey,
                status: 'FOUND',
                evidence: [
                  createContactEvidence({
                    field: 'business_name',
                    rawValue: norm.rawValue,
                    normalizedValue: norm.normalizedName,
                    pageUrl,
                    evidenceType: 'STRUCTURED_PAGE_CONTENT',
                    evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
                    contextSnippet: `JSON-LD Schema ${type}`
                  })
                ],
                provenance: 'WEBSITE_DERIVED',
                sourceContributions: [
                  {
                    source: 'FUTURE_SOURCE',
                    provenance: 'WEBSITE_DERIVED',
                    fieldName: 'business_name',
                    acquisitionContext: 'WEBSITE_DIRECT',
                    restrictionBasis: 'NONE',
                    isRestricted: false,
                    policyStatus: 'POLICY_APPROVED',
                    persistenceStatus: 'PERSISTABLE',
                    exportStatus: 'EXPORTABLE'
                  }
                ]
              });
            }
          }
        }
      }
    } catch {
      // Ignore malformed JSON-LD
    }
  }

  // 2. OpenGraph og:site_name
  const ogSiteName = decoded.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
  if (ogSiteName && ogSiteName[1]) {
    const norm = normalizeBusinessNameFact(ogSiteName[1]);
    if (norm.status === 'FOUND') {
      facts.push({
        rawValue: norm.rawValue,
        normalizedName: norm.normalizedName,
        comparisonKey: norm.comparisonKey,
        status: 'FOUND',
        evidence: [
          createContactEvidence({
            field: 'business_name',
            rawValue: norm.rawValue,
            normalizedValue: norm.normalizedName,
            pageUrl,
            evidenceType: 'STRUCTURED_PAGE_CONTENT',
            evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
            contextSnippet: 'meta og:site_name'
          })
        ],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [
          {
            source: 'FUTURE_SOURCE',
            provenance: 'WEBSITE_DERIVED',
            fieldName: 'business_name',
            acquisitionContext: 'WEBSITE_DIRECT',
            restrictionBasis: 'NONE',
            isRestricted: false,
            policyStatus: 'POLICY_APPROVED',
            persistenceStatus: 'PERSISTABLE',
            exportStatus: 'EXPORTABLE'
          }
        ]
      });
    }
  }

  // 3. Document Title (cleaned of boilerplate)
  const titleMatch = decoded.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    let rawTitle = titleMatch[1].trim();
    // Split on common title dividers: " | ", " - ", " : ", " • "
    const segments = rawTitle.split(/\s+[-|:•–—]\s+/);
    const candidateName = segments[0]?.trim() || rawTitle;
    if (candidateName.length > 2 && candidateName.length < 80) {
      const norm = normalizeBusinessNameFact(candidateName);
      if (norm.status === 'FOUND') {
        facts.push({
          rawValue: norm.rawValue,
          normalizedName: norm.normalizedName,
          comparisonKey: norm.comparisonKey,
          status: 'FOUND',
          evidence: [
            createContactEvidence({
              field: 'business_name',
              rawValue: norm.rawValue,
              normalizedValue: norm.normalizedName,
              pageUrl,
              evidenceType: 'PAGE_TITLE',
              evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
              contextSnippet: `Title: ${rawTitle}`
            })
          ],
          provenance: 'WEBSITE_DERIVED',
          sourceContributions: [
            {
              source: 'FUTURE_SOURCE',
              provenance: 'WEBSITE_DERIVED',
              fieldName: 'business_name',
              acquisitionContext: 'WEBSITE_DIRECT',
              restrictionBasis: 'NONE',
              isRestricted: false,
              policyStatus: 'POLICY_APPROVED',
              persistenceStatus: 'PERSISTABLE',
              exportStatus: 'EXPORTABLE'
            }
          ]
        });
      }
    }
  }

  return facts;
}

/**
 * Extracts business phone numbers from tel: links, schema, and visible text.
 */
export function extractPhonesFromHtml(
  html: string,
  pageUrl: string,
  countryHint?: string
): BusinessPhoneFact[] {
  const facts: BusinessPhoneFact[] = [];
  const decoded = decodeHtmlEntities(html);

  // 1. Tel: links
  const telRegex = /<a\b[^>]*\bhref=["']tel:([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const telMatches = decoded.matchAll(telRegex);
  for (const m of telMatches) {
    const rawTel = (m[1] || '').trim();
    const linkBody = sanitizeWebText(m[2] || '');
    const norm = normalizeBusinessPhone(rawTel, countryHint);

    if (norm.status === 'FOUND' || norm.status === 'AMBIGUOUS') {
      facts.push({
        rawValue: rawTel,
        normalizedValue: norm.normalizedValue,
        e164Format: norm.e164Format,
        nationalFormat: norm.nationalFormat,
        countryCode: norm.countryCode,
        dialCode: norm.dialCode,
        extension: norm.extension,
        phoneType: 'GENERAL',
        status: norm.status,
        evidence: [
          createContactEvidence({
            field: 'phone',
            rawValue: rawTel,
            normalizedValue: norm.normalizedValue,
            pageUrl,
            evidenceType: 'TEL_LINK',
            evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
            contextSnippet: linkBody || `tel:${rawTel}`
          })
        ],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [
          {
            source: 'FUTURE_SOURCE',
            provenance: 'WEBSITE_DERIVED',
            fieldName: 'phone',
            acquisitionContext: 'WEBSITE_DIRECT',
            restrictionBasis: 'NONE',
            isRestricted: false,
            policyStatus: 'POLICY_APPROVED',
            persistenceStatus: 'PERSISTABLE',
            exportStatus: 'EXPORTABLE'
          }
        ]
      });
    }
  }

  // 2. JSON-LD schema telephone
  const jsonLdMatches = decoded.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const tels = Array.isArray(item.telephone) ? item.telephone : item.telephone ? [item.telephone] : [];
        for (const t of tels) {
          if (typeof t === 'string') {
            const norm = normalizeBusinessPhone(t, countryHint);
            if (norm.status === 'FOUND' || norm.status === 'AMBIGUOUS') {
              facts.push({
                rawValue: t,
                normalizedValue: norm.normalizedValue,
                e164Format: norm.e164Format,
                nationalFormat: norm.nationalFormat,
                countryCode: norm.countryCode,
                dialCode: norm.dialCode,
                phoneType: 'GENERAL',
                status: norm.status,
                evidence: [
                  createContactEvidence({
                    field: 'phone',
                    rawValue: t,
                    normalizedValue: norm.normalizedValue,
                    pageUrl,
                    evidenceType: 'STRUCTURED_PAGE_CONTENT',
                    evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
                    contextSnippet: 'JSON-LD schema telephone'
                  })
                ],
                provenance: 'WEBSITE_DERIVED',
                sourceContributions: [
                  {
                    source: 'FUTURE_SOURCE',
                    provenance: 'WEBSITE_DERIVED',
                    fieldName: 'phone',
                    acquisitionContext: 'WEBSITE_DIRECT',
                    restrictionBasis: 'NONE',
                    isRestricted: false,
                    policyStatus: 'POLICY_APPROVED',
                    persistenceStatus: 'PERSISTABLE',
                    exportStatus: 'EXPORTABLE'
                  }
                ]
              });
            }
          }
        }
      }
    } catch {}
  }

  // 3. Visible text patterns
  // Clean scripts and styles to inspect visible text
  const cleanBody = decoded
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  const phonePattern = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}\b/g;
  const rawMatches = cleanBody.match(phonePattern) || [];

  for (const p of rawMatches) {
    const trimmed = p.trim();
    const digitCount = (trimmed.match(/\d/g) || []).length;
    if (digitCount >= 7 && digitCount <= 15) {
      const norm = normalizeBusinessPhone(trimmed, countryHint);
      if (norm.status === 'FOUND' || norm.status === 'AMBIGUOUS') {
        facts.push({
          rawValue: trimmed,
          normalizedValue: norm.normalizedValue,
          e164Format: norm.e164Format,
          nationalFormat: norm.nationalFormat,
          countryCode: norm.countryCode,
          dialCode: norm.dialCode,
          phoneType: 'GENERAL',
          status: norm.status,
          evidence: [
            createContactEvidence({
              field: 'phone',
              rawValue: trimmed,
              normalizedValue: norm.normalizedValue,
              pageUrl,
              evidenceType: 'VISIBLE_TEXT',
              evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
              contextSnippet: `Visible text: ${trimmed}`
            })
          ],
          provenance: 'WEBSITE_DERIVED',
          sourceContributions: [
            {
              source: 'FUTURE_SOURCE',
              provenance: 'WEBSITE_DERIVED',
              fieldName: 'phone',
              acquisitionContext: 'WEBSITE_DIRECT',
              restrictionBasis: 'NONE',
              isRestricted: false,
              policyStatus: 'POLICY_APPROVED',
              persistenceStatus: 'PERSISTABLE',
              exportStatus: 'EXPORTABLE'
            }
          ]
        });
      }
    }
  }

  return facts;
}

/**
 * Extracts public business email addresses from mailto: links, schema, visible text,
 * and safe deterministic obfuscated text (e.g. info [at] domain [dot] com).
 */
export function extractEmailsFromHtml(html: string, pageUrl: string): BusinessEmailFact[] {
  const facts: BusinessEmailFact[] = [];
  const decoded = decodeHtmlEntities(html);

  // 1. Mailto links
  const mailtoRegex = /<a\b[^>]*\bhref=["']mailto:([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const mailtoMatches = decoded.matchAll(mailtoRegex);
  for (const m of mailtoMatches) {
    const rawMailto = (m[1] || '').trim();
    const linkBody = sanitizeWebText(m[2] || '');
    const norm = normalizeBusinessEmail(rawMailto);

    if (norm.status === 'FOUND') {
      facts.push({
        rawValue: rawMailto,
        normalizedEmail: norm.normalizedEmail,
        localPart: norm.localPart,
        domainPart: norm.domainPart,
        emailType: norm.emailType,
        status: 'FOUND',
        evidence: [
          createContactEvidence({
            field: 'email',
            rawValue: rawMailto,
            normalizedValue: norm.normalizedEmail,
            pageUrl,
            evidenceType: 'MAILTO_LINK',
            evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
            contextSnippet: linkBody || `mailto:${rawMailto}`
          })
        ],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [
          {
            source: 'FUTURE_SOURCE',
            provenance: 'WEBSITE_DERIVED',
            fieldName: 'email',
            acquisitionContext: 'WEBSITE_DIRECT',
            restrictionBasis: 'NONE',
            isRestricted: false,
            policyStatus: 'POLICY_APPROVED',
            persistenceStatus: 'PERSISTABLE',
            exportStatus: 'EXPORTABLE'
          }
        ]
      });
    }
  }

  // 2. JSON-LD schema email
  const jsonLdMatches = decoded.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const emails = Array.isArray(item.email) ? item.email : item.email ? [item.email] : [];
        for (const e of emails) {
          if (typeof e === 'string') {
            const norm = normalizeBusinessEmail(e);
            if (norm.status === 'FOUND') {
              facts.push({
                rawValue: e,
                normalizedEmail: norm.normalizedEmail,
                localPart: norm.localPart,
                domainPart: norm.domainPart,
                emailType: norm.emailType,
                status: 'FOUND',
                evidence: [
                  createContactEvidence({
                    field: 'email',
                    rawValue: e,
                    normalizedValue: norm.normalizedEmail,
                    pageUrl,
                    evidenceType: 'STRUCTURED_PAGE_CONTENT',
                    evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
                    contextSnippet: 'JSON-LD schema email'
                  })
                ],
                provenance: 'WEBSITE_DERIVED',
                sourceContributions: [
                  {
                    source: 'FUTURE_SOURCE',
                    provenance: 'WEBSITE_DERIVED',
                    fieldName: 'email',
                    acquisitionContext: 'WEBSITE_DIRECT',
                    restrictionBasis: 'NONE',
                    isRestricted: false,
                    policyStatus: 'POLICY_APPROVED',
                    persistenceStatus: 'PERSISTABLE',
                    exportStatus: 'EXPORTABLE'
                  }
                ]
              });
            }
          }
        }
      }
    } catch {}
  }

  // 3. Obfuscated emails (e.g. "info [at] example [dot] com", "sales(at)domain.com")
  const obfuscatedRegex = /\b([a-zA-Z0-9._%+-]+)\s*(?:\[at\]|\(at\)|\[@\]|@)\s*([a-zA-Z0-9.-]+)\s*(?:\[dot\]|\(dot\)|\.)\s*([a-zA-Z]{2,})\b/gi;
  const obfMatches = decoded.matchAll(obfuscatedRegex);
  for (const m of obfMatches) {
    const rawObf = m[0];
    const deobfuscated = `${m[1]}@${m[2]}.${m[3]}`.toLowerCase();
    const norm = normalizeBusinessEmail(deobfuscated);
    if (norm.status === 'FOUND') {
      facts.push({
        rawValue: rawObf,
        normalizedEmail: norm.normalizedEmail,
        localPart: norm.localPart,
        domainPart: norm.domainPart,
        emailType: norm.emailType,
        status: 'FOUND',
        evidence: [
          createContactEvidence({
            field: 'email',
            rawValue: rawObf,
            normalizedValue: norm.normalizedEmail,
            pageUrl,
            evidenceType: 'VISIBLE_TEXT',
            evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
            contextSnippet: `Deobfuscated text: ${rawObf}`
          })
        ],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [
          {
            source: 'FUTURE_SOURCE',
            provenance: 'WEBSITE_DERIVED',
            fieldName: 'email',
            acquisitionContext: 'WEBSITE_DIRECT',
            restrictionBasis: 'NONE',
            isRestricted: false,
            policyStatus: 'POLICY_APPROVED',
            persistenceStatus: 'PERSISTABLE',
            exportStatus: 'EXPORTABLE'
          }
        ]
      });
    }
  }

  // 4. Visible standard email regex
  const cleanBody = decoded
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const rawEmails = cleanBody.match(emailRegex) || [];

  for (const e of rawEmails) {
    const norm = normalizeBusinessEmail(e);
    if (norm.status === 'FOUND') {
      facts.push({
        rawValue: e,
        normalizedEmail: norm.normalizedEmail,
        localPart: norm.localPart,
        domainPart: norm.domainPart,
        emailType: norm.emailType,
        status: 'FOUND',
        evidence: [
          createContactEvidence({
            field: 'email',
            rawValue: e,
            normalizedValue: norm.normalizedEmail,
            pageUrl,
            evidenceType: 'VISIBLE_TEXT',
            evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
            contextSnippet: `Visible text: ${e}`
          })
        ],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [
          {
            source: 'FUTURE_SOURCE',
            provenance: 'WEBSITE_DERIVED',
            fieldName: 'email',
            acquisitionContext: 'WEBSITE_DIRECT',
            restrictionBasis: 'NONE',
            isRestricted: false,
            policyStatus: 'POLICY_APPROVED',
            persistenceStatus: 'PERSISTABLE',
            exportStatus: 'EXPORTABLE'
          }
        ]
      });
    }
  }

  return facts;
}

/**
 * Extracts physical business address and NAP locations from schema, <address> tags,
 * and location blocks. Distinguishes multiple branch offices.
 */
export function extractLocationsFromHtml(
  html: string,
  pageUrl: string,
  countryHint?: string
): BusinessLocationFact[] {
  const facts: BusinessLocationFact[] = [];
  const decoded = decodeHtmlEntities(html);

  // 1. JSON-LD PostalAddress & LocalBusiness addresses
  const jsonLdMatches = decoded.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of items) {
        const addresses: any[] = [];
        if (item['@type'] === 'PostalAddress') {
          addresses.push(item);
        } else if (item.address) {
          if (Array.isArray(item.address)) {
            addresses.push(...item.address);
          } else {
            addresses.push(item.address);
          }
        }

        // Sub-branches / department locations
        if (item.department && Array.isArray(item.department)) {
          for (const dep of item.department) {
            if (dep.address) addresses.push(dep.address);
          }
        }

        for (const addr of addresses) {
          if (typeof addr === 'string') {
            const norm = normalizeBusinessAddress(addr, countryHint);
            if (norm.status === 'FOUND' || norm.status === 'PARTIAL') {
              facts.push({
                id: `loc_${pageUrl}_${norm.normalizedAddress.slice(0, 30)}`.replace(/[^a-z0-9]/gi, '_'),
                rawAddress: addr,
                normalizedAddress: norm.normalizedAddress,
                postalCode: norm.postalCode,
                country: norm.country,
                status: norm.status,
                evidence: [
                  createContactEvidence({
                    field: 'address',
                    rawValue: addr,
                    normalizedValue: norm.normalizedAddress,
                    pageUrl,
                    evidenceType: 'STRUCTURED_PAGE_CONTENT',
                    evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
                    contextSnippet: 'JSON-LD schema address'
                  })
                ],
                provenance: 'WEBSITE_DERIVED',
                sourceContributions: [
                  {
                    source: 'FUTURE_SOURCE',
                    provenance: 'WEBSITE_DERIVED',
                    fieldName: 'address',
                    acquisitionContext: 'WEBSITE_DIRECT',
                    restrictionBasis: 'NONE',
                    isRestricted: false,
                    policyStatus: 'POLICY_APPROVED',
                    persistenceStatus: 'PERSISTABLE',
                    exportStatus: 'EXPORTABLE'
                  }
                ]
              });
            }
          } else if (typeof addr === 'object' && addr !== null) {
            const parts = [
              addr.streetAddress,
              addr.addressLocality,
              addr.addressRegion,
              addr.postalCode,
              addr.addressCountry
            ].filter(Boolean);

            if (parts.length > 0) {
              const rawStr = parts.join(', ');
              const norm = normalizeBusinessAddress(rawStr, countryHint);
              facts.push({
                id: `loc_${pageUrl}_${norm.normalizedAddress.slice(0, 30)}`.replace(/[^a-z0-9]/gi, '_'),
                label: item.name ? String(item.name) : undefined,
                rawAddress: rawStr,
                normalizedAddress: norm.normalizedAddress,
                streetAddress: addr.streetAddress ? String(addr.streetAddress) : undefined,
                city: addr.addressLocality ? String(addr.addressLocality) : undefined,
                region: addr.addressRegion ? String(addr.addressRegion) : undefined,
                postalCode: addr.postalCode ? String(addr.postalCode) : norm.postalCode,
                country: addr.addressCountry ? String(addr.addressCountry) : norm.country,
                phone: item.telephone ? String(item.telephone) : undefined,
                status: norm.status,
                evidence: [
                  createContactEvidence({
                    field: 'address',
                    rawValue: rawStr,
                    normalizedValue: norm.normalizedAddress,
                    pageUrl,
                    evidenceType: 'STRUCTURED_PAGE_CONTENT',
                    evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
                    contextSnippet: 'JSON-LD PostalAddress'
                  })
                ],
                provenance: 'WEBSITE_DERIVED',
                sourceContributions: [
                  {
                    source: 'FUTURE_SOURCE',
                    provenance: 'WEBSITE_DERIVED',
                    fieldName: 'address',
                    acquisitionContext: 'WEBSITE_DIRECT',
                    restrictionBasis: 'NONE',
                    isRestricted: false,
                    policyStatus: 'POLICY_APPROVED',
                    persistenceStatus: 'PERSISTABLE',
                    exportStatus: 'EXPORTABLE'
                  }
                ]
              });
            }
          }
        }
      }
    } catch {}
  }

  // 2. HTML <address> tags
  const addressRegex = /<address\b[^>]*>([\s\S]*?)<\/address>/gi;
  const addressMatches = decoded.matchAll(addressRegex);
  for (const m of addressMatches) {
    const rawTag = m[1];
    const textOnly = sanitizeWebText(rawTag);
    if (textOnly && textOnly.length >= 8) {
      const norm = normalizeBusinessAddress(textOnly, countryHint);
      if (norm.status === 'FOUND' || norm.status === 'PARTIAL') {
        facts.push({
          id: `loc_${pageUrl}_${norm.normalizedAddress.slice(0, 30)}`.replace(/[^a-z0-9]/gi, '_'),
          rawAddress: textOnly,
          normalizedAddress: norm.normalizedAddress,
          postalCode: norm.postalCode,
          country: norm.country,
          status: norm.status,
          evidence: [
            createContactEvidence({
              field: 'address',
              rawValue: textOnly,
              normalizedValue: norm.normalizedAddress,
              pageUrl,
              evidenceType: 'VISIBLE_TEXT',
              evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
              contextSnippet: `<address> tag: ${textOnly.slice(0, 100)}`
            })
          ],
          provenance: 'WEBSITE_DERIVED',
          sourceContributions: [
            {
              source: 'FUTURE_SOURCE',
              provenance: 'WEBSITE_DERIVED',
              fieldName: 'address',
              acquisitionContext: 'WEBSITE_DIRECT',
              restrictionBasis: 'NONE',
              isRestricted: false,
              policyStatus: 'POLICY_APPROVED',
              persistenceStatus: 'PERSISTABLE',
              exportStatus: 'EXPORTABLE'
            }
          ]
        });
      }
    }
  }

  return facts;
}

/**
 * Detects public business contact forms.
 *
 * SAFETY INVARIANT:
 * Records detection ONLY. Never submits, never sends input.
 */
export function extractContactFormsFromHtml(html: string, pageUrl: string): ContactFormFact[] {
  const forms: ContactFormFact[] = [];
  const decoded = decodeHtmlEntities(html);

  // Match <form> blocks
  const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  const matches = decoded.matchAll(formRegex);

  let formIndex = 0;
  for (const m of matches) {
    formIndex++;
    const formAttrs = m[1] || '';
    const formBody = m[2] || '';

    // Extract action and method
    const actionMatch = formAttrs.match(/\baction=["']([^"']*)["']/i);
    const methodMatch = formAttrs.match(/\bmethod=["']([^"']*)["']/i);
    const idMatch = formAttrs.match(/\b(?:id|name)=["']([^"']*)["']/i);

    const action = actionMatch ? actionMatch[1].trim() : undefined;
    const method = methodMatch ? methodMatch[1].trim().toUpperCase() : 'GET';
    const formId = idMatch ? idMatch[1].trim() : undefined;

    const lowerAttrs = formAttrs.toLowerCase();
    const lowerBody = formBody.toLowerCase();

    // Check for email, phone, message inputs
    const hasEmailField = /type=["']email["']|name=["'][^"']*(?:email|e-mail)[^"']*["']/i.test(formBody);
    const hasPhoneField = /type=["']tel["']|name=["'][^"']*(?:phone|tel|mobile)[^"']*["']/i.test(formBody);
    const hasMessageField = /<textarea\b|name=["'][^"']*(?:message|comment|inquiry|body)[^"']*["']/i.test(formBody);

    // Identify if form is likely a contact form (vs search bar or newsletter signup)
    const isContactIntent =
      lowerAttrs.includes('contact') ||
      lowerAttrs.includes('feedback') ||
      lowerAttrs.includes('inquiry') ||
      lowerAttrs.includes('get-in-touch') ||
      lowerBody.includes('send message') ||
      lowerBody.includes('submit inquiry') ||
      lowerBody.includes('contact us') ||
      hasMessageField ||
      (hasEmailField && (hasPhoneField || lowerBody.includes('name')));

    const isSearchOnly = lowerAttrs.includes('search') || (lowerBody.includes('search') && !hasMessageField && !hasEmailField);

    if (isContactIntent && !isSearchOnly) {
      const factId = `form_${pageUrl}_${formIndex}`.replace(/[^a-z0-9]/gi, '_');

      forms.push({
        id: factId,
        present: true,
        pageUrl,
        formAction: action,
        formMethod: method,
        formIdOrName: formId,
        hasEmailField,
        hasPhoneField,
        hasMessageField,
        evidence: [
          createContactEvidence({
            field: 'contact_form',
            rawValue: `form_${formId || formIndex}`,
            normalizedValue: action || pageUrl,
            pageUrl,
            evidenceType: 'CONTACT_FORM',
            evidenceStrength: 'DIRECT_PUBLIC_OBSERVATION',
            contextSnippet: `Contact form detected (method=${method}, hasEmail=${hasEmailField}, hasMessage=${hasMessageField})`
          })
        ],
        provenance: 'WEBSITE_DERIVED',
        sourceContributions: [
          {
            source: 'FUTURE_SOURCE',
            provenance: 'WEBSITE_DERIVED',
            fieldName: 'contact_form',
            acquisitionContext: 'WEBSITE_DIRECT',
            restrictionBasis: 'NONE',
            isRestricted: false,
            policyStatus: 'POLICY_APPROVED',
            persistenceStatus: 'PERSISTABLE',
            exportStatus: 'EXPORTABLE'
          }
        ]
      });
    }
  }

  return forms;
}

/**
 * Orchestrates raw contact extraction for a single HTML page.
 * Deduplicates intra-page duplicates so a single page does not emit
 * duplicate facts for the same email/phone appearing in both mailto/tel and body text.
 */
export function extractContactsFromHtmlPage(
  html: string,
  pageUrl: string,
  countryHint?: string
): RawPageExtractedContacts {
  const rawBusinessNames = extractBusinessNamesFromHtml(html, pageUrl);
  const rawPhones = extractPhonesFromHtml(html, pageUrl, countryHint);
  const rawEmails = extractEmailsFromHtml(html, pageUrl);
  const rawLocations = extractLocationsFromHtml(html, pageUrl, countryHint);
  const rawContactForms = extractContactFormsFromHtml(html, pageUrl);

  return {
    businessNames: rawBusinessNames,
    phones: deduplicatePhones(rawPhones),
    emails: deduplicateEmails(rawEmails),
    locations: deduplicateLocations(rawLocations),
    contactForms: deduplicateContactForms(rawContactForms)
  };
}
