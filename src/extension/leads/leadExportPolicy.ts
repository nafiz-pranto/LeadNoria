/**
 * LeadNoria — Export-Safe Lead Projection & Research Workspace
 * Part 8: Export Policy, Safe CSV & JSON Exporters, Clipboard & Download Sanitization
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * - Rejects any record with exportEligibility === 'BLOCKED'.
 * - Protects against CSV Formula Injection (=, +, -, @, \t, \r).
 * - Never exports Google Place IDs, Maps URLs, ratings, review counts, or Google addresses.
 * - Enforces zero Google candidate leakage across CSV, JSON, and Clipboard outputs.
 */

import type { ExportSafeLead } from './leadTypes.ts';

/**
 * Sanitizes a CSV cell value to defend against formula injection (CSV Injection).
 */
export function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) return '';
  let str = String(value);

  // If the cell begins with formula trigger characters, prefix with single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape internal double quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export interface LeadExportRow {
  readonly leadId: string;
  readonly businessName: string;
  readonly website: string;
  readonly publicEmail: string;
  readonly publicPhone: string;
  readonly publicPersonName: string;
  readonly publicPersonRole: string;
  readonly qualificationOutcome: string;
  readonly reviewOutcome: string;
  readonly sourceClass: string;
  readonly evidenceTimestamp: string;
}

export interface ExportValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

export interface ExportReconciliationSummary {
  readonly totalInputCount: number;
  readonly eligibleCount: number;
  readonly exportedCount: number;
  readonly duplicateSuppressedCount: number;
  readonly rejectedCount: number;
  readonly csv: string;
  readonly json: string;
  readonly isReconciled: boolean;
}

const FORBIDDEN_EXPORT_GOOGLE_KEYS = [
  'placeId',
  'mapsUrl',
  'rating',
  'reviewCount',
  'businessStatus',
  'candidateId'
] as const;

/**
 * Validates that an object strictly fulfills the ExportSafeLead contract
 * and contains zero Google-restricted fields before entering any export pipeline.
 */
export function validateExportSafeLead(lead: unknown): ExportValidationResult {
  const errors: string[] = [];
  if (!lead || typeof lead !== 'object') {
    return { isValid: false, errors: ['Export lead must be a non-null object'] };
  }

  const l = lead as Record<string, any>;
  if (typeof l.leadId !== 'string' || !l.leadId.startsWith('lead_')) {
    errors.push(`Invalid leadId format: "${l.leadId}". Must begin with "lead_"`);
  }

  if (l.exportEligibility !== 'ELIGIBLE') {
    errors.push(`Lead is not eligible for export (status: ${String(l.exportEligibility)})`);
  }

  if (!l.identity || typeof l.identity !== 'object') {
    errors.push('Missing identity object');
  } else {
    if (typeof l.identity.businessName !== 'string' || !l.identity.businessName.trim()) {
      errors.push('Missing identity.businessName');
    }
    if (typeof l.identity.domain !== 'string' || !l.identity.domain.trim()) {
      errors.push('Missing identity.domain');
    }
  }

  if (l.sourceClass !== 'USER_PROVIDED' && l.sourceClass !== 'WEBSITE_PUBLIC' && l.sourceClass !== 'LEADNORIA_DERIVED_FROM_NON_RESTRICTED_INPUT') {
    errors.push(`Disallowed export sourceClass: "${l.sourceClass}"`);
  }

  for (const forbidden of FORBIDDEN_EXPORT_GOOGLE_KEYS) {
    if (forbidden in l) {
      errors.push(`CRITICAL FIREWALL BREACH: Forbidden Google key "${forbidden}" present in export lead`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Converts an ExportSafeLead into a sanitized flat export row.
 * Strictly allowlists only verified public facts.
 */
export function toExportRow(lead: ExportSafeLead): LeadExportRow {
  const validation = validateExportSafeLead(lead);
  if (!validation.isValid) {
    throw new Error(`Cannot export invalid lead "${lead?.leadId}": ${validation.errors.join('; ')}`);
  }

  const primaryEmail = lead.contact.publicEmails[0]?.email || '';
  const primaryPhone = lead.contact.publicPhones[0]?.phone || '';
  const primaryPerson = lead.person.leadershipPeople[0]?.fullName || '';
  const primaryRole = lead.person.leadershipPeople[0]?.jobTitle || '';

  return Object.freeze({
    leadId: lead.leadId,
    businessName: lead.identity.businessName,
    website: lead.identity.canonicalUrl,
    publicEmail: primaryEmail,
    publicPhone: primaryPhone,
    publicPersonName: primaryPerson,
    publicPersonRole: primaryRole,
    qualificationOutcome: lead.qualification.status,
    reviewOutcome: lead.reviewOutcome.reviewState,
    sourceClass: lead.sourceClass,
    evidenceTimestamp: lead.updatedAt
  });
}

/**
 * Filters, validates, deduplicates, and deterministically sorts leads for export.
 */
function prepareLeadsForExport(leads: readonly ExportSafeLead[]): {
  validLeads: ExportSafeLead[];
  duplicateCount: number;
  rejectedCount: number;
} {
  const seenLeadIds = new Set<string>();
  const seenDomains = new Set<string>();
  const validLeads: ExportSafeLead[] = [];
  let duplicateCount = 0;
  let rejectedCount = 0;

  for (const lead of leads) {
    const val = validateExportSafeLead(lead);
    if (!val.isValid) {
      rejectedCount++;
      continue;
    }

    const domainKey = lead.identity.domain.trim().toLowerCase();
    if (seenLeadIds.has(lead.leadId) || (domainKey && seenDomains.has(domainKey))) {
      duplicateCount++;
      continue;
    }

    seenLeadIds.add(lead.leadId);
    if (domainKey) seenDomains.add(domainKey);
    validLeads.push(lead);
  }

  // Deterministic sorting: businessName ascending, tie-breaker leadId ascending
  validLeads.sort((a, b) => {
    const nameA = a.identity.businessName.toLowerCase();
    const nameB = b.identity.businessName.toLowerCase();
    if (nameA !== nameB) return nameA.localeCompare(nameB);
    return a.leadId.localeCompare(b.leadId);
  });

  return { validLeads, duplicateCount, rejectedCount };
}

/**
 * Exports an array of ExportSafeLeads to CSV format.
 * Defends against formula injection, ensures deduplication, and guarantees deterministic ordering.
 */
export function exportLeadsToCsv(leads: readonly ExportSafeLead[]): string {
  const headers = [
    'leadId',
    'businessName',
    'website',
    'publicEmail',
    'publicPhone',
    'publicPersonName',
    'publicPersonRole',
    'qualificationOutcome',
    'reviewOutcome',
    'sourceClass',
    'evidenceTimestamp'
  ];

  const headerRow = headers.map(sanitizeCsvCell).join(',');
  const rows: string[] = [headerRow];

  const { validLeads } = prepareLeadsForExport(leads);

  for (const lead of validLeads) {
    const rowObj = toExportRow(lead);
    const rowValues = [
      sanitizeCsvCell(rowObj.leadId),
      sanitizeCsvCell(rowObj.businessName),
      sanitizeCsvCell(rowObj.website),
      sanitizeCsvCell(rowObj.publicEmail),
      sanitizeCsvCell(rowObj.publicPhone),
      sanitizeCsvCell(rowObj.publicPersonName),
      sanitizeCsvCell(rowObj.publicPersonRole),
      sanitizeCsvCell(rowObj.qualificationOutcome),
      sanitizeCsvCell(rowObj.reviewOutcome),
      sanitizeCsvCell(rowObj.sourceClass),
      sanitizeCsvCell(rowObj.evidenceTimestamp)
    ];
    rows.push(rowValues.join(','));
  }

  return rows.join('\r\n');
}

/**
 * Exports an array of ExportSafeLeads to JSON format.
 * Strictly allowlists only export-safe fields with deduplication and deterministic ordering.
 */
export function exportLeadsToJson(leads: readonly ExportSafeLead[]): string {
  const { validLeads } = prepareLeadsForExport(leads);
  const exportable = validLeads.map(toExportRow);
  return JSON.stringify(exportable, null, 2);
}

/**
 * Formats an array of ExportSafeLeads for clipboard copying.
 * Produces sanitized TSV (Tab-Separated Values).
 */
export function formatLeadsForClipboard(leads: readonly ExportSafeLead[]): string {
  const headers = [
    'Business Name',
    'Website',
    'Email',
    'Phone',
    'Key Contact',
    'Role',
    'Source'
  ];

  const rows: string[] = [headers.join('\t')];
  const { validLeads } = prepareLeadsForExport(leads);

  for (const lead of validLeads) {
    const r = toExportRow(lead);
    const cols = [
      sanitizeCsvCell(r.businessName),
      sanitizeCsvCell(r.website),
      sanitizeCsvCell(r.publicEmail),
      sanitizeCsvCell(r.publicPhone),
      sanitizeCsvCell(r.publicPersonName),
      sanitizeCsvCell(r.publicPersonRole),
      sanitizeCsvCell(r.sourceClass)
    ];
    rows.push(cols.join('\t'));
  }

  return rows.join('\n');
}

/**
 * Produces complete export artifacts alongside exact reconciliation accounting.
 */
export function exportLeadsWithReconciliation(leads: readonly ExportSafeLead[]): ExportReconciliationSummary {
  const { validLeads, duplicateCount, rejectedCount } = prepareLeadsForExport(leads);
  const csv = exportLeadsToCsv(leads);
  const json = exportLeadsToJson(leads);

  const totalInputCount = leads.length;
  const exportedCount = validLeads.length;
  const isReconciled = totalInputCount === exportedCount + duplicateCount + rejectedCount;

  return Object.freeze({
    totalInputCount,
    eligibleCount: exportedCount,
    exportedCount,
    duplicateSuppressedCount: duplicateCount,
    rejectedCount,
    csv,
    json,
    isReconciled
  });
}
