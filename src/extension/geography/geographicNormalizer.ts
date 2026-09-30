/**
 * LeadNoria — Phase 13: Geographic Expansion & Saturation
 * Geographic Normalizer
 * 
 * Invariants:
 * - Deterministic area identity generation from canonical attributes
 * - No silent merging of ambiguous geographic names (e.g. Springfield without country/state)
 * - Strict bounds checking for coordinates and radii (rejects NaN/Infinity/impossible bounds)
 */

import { createHash } from 'node:crypto';
import {
  GeographicArea,
  GeographicLevel,
  GeographicCoordinates,
  GeographicBoundingBox,
  GeographicAreaStatus
} from './geographicTypes.ts';

// ISO 3166-1 alpha-2 mapping for common countries
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'united states': 'US',
  'united states of america': 'US',
  'usa': 'US',
  'us': 'US',
  'bangladesh': 'BD',
  'bd': 'BD',
  'germany': 'DE',
  'deutschland': 'DE',
  'de': 'DE',
  'united kingdom': 'GB',
  'great britain': 'GB',
  'uk': 'GB',
  'gb': 'GB',
  'canada': 'CA',
  'ca': 'CA',
  'australia': 'AU',
  'au': 'AU',
  'france': 'FR',
  'fr': 'FR',
  'india': 'IN',
  'in': 'IN',
  'japan': 'JP',
  'jp': 'JP',
  'spain': 'ES',
  'espana': 'ES',
  'es': 'ES',
  'italy': 'IT',
  'italia': 'IT',
  'it': 'IT'
};

/**
 * Normalizes text: trims, applies Unicode NFKC normalization, collapses whitespace, lowercases.
 */
export function normalizeGeographicText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .normalize('NFKC')
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width spaces
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Normalizes country input to ISO 3166-1 alpha-2 code if recognized.
 */
export function normalizeCountryCode(country?: string): string | undefined {
  if (!country || typeof country !== 'string') return undefined;
  const cleaned = normalizeGeographicText(country);
  return COUNTRY_NAME_TO_CODE[cleaned] || (cleaned.length === 2 ? cleaned.toUpperCase() : undefined);
}

/**
 * Validates and bounds-checks latitude and longitude coordinates.
 */
export function validateCoordinates(coords?: GeographicCoordinates): { isValid: boolean; error?: string } {
  if (!coords) return { isValid: true };
  const { latitude, longitude } = coords;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return { isValid: false, error: 'Coordinates must be numeric' };
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { isValid: false, error: 'Coordinates cannot be NaN or Infinity' };
  }
  if (latitude < -90 || latitude > 90) {
    return { isValid: false, error: `Latitude out of range [-90, 90]: ${latitude}` };
  }
  if (longitude < -180 || longitude > 180) {
    return { isValid: false, error: `Longitude out of range [-180, 180]: ${longitude}` };
  }
  return { isValid: true };
}

/**
 * Validates bounding box coordinates.
 */
export function validateBoundingBox(box?: GeographicBoundingBox): { isValid: boolean; error?: string } {
  if (!box) return { isValid: true };
  const { north, south, east, west } = box;
  const nums = [north, south, east, west];

  if (nums.some(n => typeof n !== 'number' || !Number.isFinite(n))) {
    return { isValid: false, error: 'Bounding box coordinates must be finite numbers' };
  }
  if (north < south) {
    return { isValid: false, error: `Bounding box north (${north}) cannot be south of south (${south})` };
  }
  if (north > 90 || south < -90) {
    return { isValid: false, error: 'Bounding box latitude exceeds [-90, 90]' };
  }
  if (east > 180 || west < -180) {
    return { isValid: false, error: 'Bounding box longitude exceeds [-180, 180]' };
  }
  return { isValid: true };
}

/**
 * Validates radius in meters. Max 50,000,000m (circumference of Earth is ~40,000,000m).
 */
export function validateRadiusMeters(radius?: number): { isValid: boolean; error?: string } {
  if (radius === undefined || radius === null) return { isValid: true };
  if (typeof radius !== 'number' || !Number.isFinite(radius)) {
    return { isValid: false, error: 'Radius must be a finite number' };
  }
  if (radius < 0) {
    return { isValid: false, error: 'Radius cannot be negative' };
  }
  if (radius > 50_000_000) {
    return { isValid: false, error: `Radius exceeds maximum sensible limit: ${radius}m` };
  }
  return { isValid: true };
}

/**
 * Generates a stable deterministic area ID from canonical geographic attributes.
 * Invariant 10: Area IDs are deterministic regardless of insertion order or timestamps.
 */
export function generateDeterministicAreaId(params: {
  countryCode?: string;
  level: GeographicLevel;
  canonicalName: string;
  parentAreaId?: string;
  cityCode?: string;
  regionCode?: string;
  postalCode?: string;
}): string {
  const parts = [
    params.countryCode || 'GLOBAL',
    params.level,
    params.parentAreaId || 'ROOT',
    params.canonicalName,
    params.regionCode || '',
    params.cityCode || '',
    params.postalCode || ''
  ];
  const payload = parts.join('::');
  const hash = createHash('sha256').update(payload).digest('hex').substring(0, 16);
  return `geo_${hash}`;
}

/**
 * Normalizes raw geographic area attributes into a validated, canonical GeographicArea.
 */
export function normalizeGeographicArea(raw: {
  level: GeographicLevel;
  name: string;
  countryCode?: string;
  parentAreaId?: string;
  regionCode?: string;
  cityCode?: string;
  postalCode?: string;
  boundingBox?: GeographicBoundingBox;
  center?: GeographicCoordinates;
  radiusMeters?: number;
  geometryReference?: string;
  depth?: number;
  priority?: number;
  metadata?: Record<string, string>;
}): GeographicArea {
  const canonicalName = normalizeGeographicText(raw.name);
  const normalizedCountry = normalizeCountryCode(raw.countryCode);
  const normalizedRegion = raw.regionCode ? normalizeGeographicText(raw.regionCode) : undefined;
  const normalizedCity = raw.cityCode ? normalizeGeographicText(raw.cityCode) : undefined;
  const normalizedPostal = raw.postalCode ? raw.postalCode.trim().toUpperCase() : undefined;

  // Validate coordinates
  const coordVal = validateCoordinates(raw.center);
  if (!coordVal.isValid) {
    throw new Error(`Invalid geographic coordinates for area '${raw.name}': ${coordVal.error}`);
  }
  const boxVal = validateBoundingBox(raw.boundingBox);
  if (!boxVal.isValid) {
    throw new Error(`Invalid bounding box for area '${raw.name}': ${boxVal.error}`);
  }
  const radiusVal = validateRadiusMeters(raw.radiusMeters);
  if (!radiusVal.isValid) {
    throw new Error(`Invalid radius for area '${raw.name}': ${radiusVal.error}`);
  }

  // Detect ambiguity: city/district without country or parent context
  let status: GeographicAreaStatus = 'ACTIVE';
  if ((raw.level === 'CITY' || raw.level === 'DISTRICT') && !normalizedCountry && !raw.parentAreaId) {
    status = 'AMBIGUOUS';
  }

  const areaId = generateDeterministicAreaId({
    countryCode: normalizedCountry,
    level: raw.level,
    canonicalName,
    parentAreaId: raw.parentAreaId,
    regionCode: normalizedRegion,
    cityCode: normalizedCity,
    postalCode: normalizedPostal
  });

  return {
    areaId,
    parentAreaId: raw.parentAreaId,
    level: raw.level,
    name: raw.name.trim(),
    canonicalName,
    countryCode: normalizedCountry,
    regionCode: normalizedRegion,
    cityCode: normalizedCity,
    postalCode: normalizedPostal,
    boundingBox: raw.boundingBox,
    center: raw.center,
    radiusMeters: raw.radiusMeters,
    geometryReference: raw.geometryReference,
    status,
    depth: raw.depth ?? 0,
    priority: raw.priority ?? 0,
    metadata: raw.metadata
  };
}
