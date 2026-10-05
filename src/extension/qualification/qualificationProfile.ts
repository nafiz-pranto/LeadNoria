/**
 * Qualification Profile Registry & Security Validator (Phase 12)
 *
 * Implements strict schema validation, operator verification, prototype-pollution
 * prevention, and canonical default profiles for LeadNoria Advanced Qualification.
 */

import type {
  QualificationProfile,
  QualificationCriterion,
  CriterionType,
  CriterionOperator
} from './qualificationTypes.ts';

const VALID_CRITERION_TYPES: ReadonlySet<CriterionType> = new Set([
  'RELEVANCE',
  'WEBSITE_STATUS',
  'BUSINESS_IDENTITY',
  'HAS_BUSINESS_PHONE',
  'HAS_BUSINESS_EMAIL',
  'HAS_BUSINESS_ADDRESS',
  'HAS_CONTACT_FORM',
  'HAS_SOCIAL_PROFILE',
  'LOCATION_MATCH',
  'CATEGORY_MATCH',
  'NAME_MATCH',
  'NEGATIVE_EVIDENCE',
  'SOURCE_EVIDENCE_REQUIREMENT',
  'COMPLETENESS_THRESHOLD',
  'CUSTOM_FIELD',
  // Phase 23 Business Intelligence Additions:
  'VERIFIED_BUSINESS_WEBSITE',
  'PUBLISHED_SERVICES',
  'SERVICE_AREA_MATCH',
  'BUSINESS_HOURS_PRESENT',
  'DIGITAL_BOOKING_PRESENT',
  'DIGITAL_ECOMMERCE_PRESENT',
  'DIGITAL_CHAT_PRESENT',
  'DIGITAL_ANALYTICS_PRESENT',
  'DIGITAL_CMS_DETECTED',
  'PUBLIC_EMAIL_AVAILABLE',
  'ROLE_EMAIL_AVAILABLE',
  'PERSON_EMAIL_AVAILABLE',
  'PUBLIC_PHONE_AVAILABLE',
  'PERSON_PHONE_AVAILABLE',
  'PUBLIC_PERSON_AVAILABLE',
  'PERSON_WITH_TITLE_AVAILABLE',
  'CROSS_SOURCE_CORROBORATION',
  'CORROBORATED_PHONE',
  'CORROBORATED_IDENTITY',
  'META_AD_ACTIVE',
  'EVIDENCE_COVERAGE_THRESHOLD',
  'BUSINESS_COMPLETENESS_THRESHOLD',
  'TEMPORAL_FRESHNESS'
]);

const VALID_OPERATORS: ReadonlySet<CriterionOperator> = new Set([
  'EQUALS',
  'NOT_EQUALS',
  'IN',
  'NOT_IN',
  'CONTAINS',
  'NOT_CONTAINS',
  'MATCHES',
  'EXISTS',
  'NOT_EXISTS',
  'COUNT_AT_LEAST',
  'COUNT_AT_MOST',
  'THRESHOLD_AT_LEAST',
  'THRESHOLD_AT_MOST',
  'ANY',
  'ALL',
  'NONE'
]);

const BANNED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates untrusted QualificationProfile configuration before evaluation.
 * Defends against prototype pollution, ReDoS injection, and malformed criteria.
 */
export function validateQualificationProfile(profile: any): ProfileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!profile || typeof profile !== 'object') {
    return { isValid: false, errors: ['Profile must be a non-null object'], warnings: [] };
  }

  // Security check: Prototype pollution attempt
  for (const k of Object.keys(profile)) {
    if (BANNED_KEYS.has(k)) {
      errors.push(`Security violation: Prohibited object key '${k}' detected`);
    }
  }

  // Profile ID & Version
  if (!profile.profileId || typeof profile.profileId !== 'string' || !profile.profileId.trim()) {
    errors.push('Profile must have a valid non-empty string profileId');
  }

  if (!profile.version || typeof profile.version !== 'string' || !profile.version.trim()) {
    errors.push('Profile must have a valid non-empty string version');
  }

  // Policies
  const validMissingPolicies = ['MISSING_IS_UNKNOWN', 'MISSING_FAILS_REQUIRED', 'MISSING_ALLOWED'];
  if (!profile.missingDataPolicy || !validMissingPolicies.includes(profile.missingDataPolicy)) {
    errors.push(`Invalid missingDataPolicy: must be one of ${validMissingPolicies.join(', ')}`);
  }

  const validUnknownPolicies = ['UNKNOWN_FAILS_MANDATORY', 'UNKNOWN_YIELDS_UNCERTAIN', 'UNKNOWN_ALLOWED'];
  if (!profile.unknownDataPolicy || !validUnknownPolicies.includes(profile.unknownDataPolicy)) {
    errors.push(`Invalid unknownDataPolicy: must be one of ${validUnknownPolicies.join(', ')}`);
  }

  const validConflictPolicies = ['STRICT_CONTRADICTION', 'PERMISSIVE'];
  if (!profile.conflictPolicy || !validConflictPolicies.includes(profile.conflictPolicy)) {
    errors.push(`Invalid conflictPolicy: must be one of ${validConflictPolicies.join(', ')}`);
  }

  // Thresholds
  if (profile.thresholds) {
    if (typeof profile.thresholds !== 'object') {
      errors.push('thresholds must be an object if specified');
    } else {
      const minScore = profile.thresholds.minimumScore;
      if (minScore !== undefined) {
        if (typeof minScore !== 'number' || Number.isNaN(minScore) || !Number.isFinite(minScore) || minScore < 0) {
          errors.push('thresholds.minimumScore must be a non-negative finite number');
        }
      }
    }
  }

  // Criteria validation
  if (!Array.isArray(profile.criteria)) {
    errors.push('Profile must contain an array of criteria');
    return { isValid: errors.length === 0, errors, warnings };
  }

  if (profile.criteria.length === 0) {
    warnings.push('Profile has 0 criteria; evaluation will trivially pass');
  }

  if (profile.criteria.length > 100) {
    errors.push('Resource limit exceeded: profile cannot contain more than 100 criteria');
  }

  const seenIds = new Set<string>();

  for (let idx = 0; idx < profile.criteria.length; idx++) {
    const c = profile.criteria[idx];
    const prefix = `Criterion[${idx}]`;

    if (!c || typeof c !== 'object') {
      errors.push(`${prefix}: must be a non-null object`);
      continue;
    }

    // Prototype pollution in criterion
    for (const ck of Object.keys(c)) {
      if (BANNED_KEYS.has(ck)) {
        errors.push(`${prefix}: Security violation: Prohibited key '${ck}' detected`);
      }
    }

    if (!c.id || typeof c.id !== 'string' || !c.id.trim()) {
      errors.push(`${prefix}: must have a non-empty string id`);
    } else {
      if (seenIds.has(c.id)) {
        errors.push(`${prefix}: duplicate criterion ID '${c.id}'`);
      }
      seenIds.add(c.id);
    }

    if (!c.type || !VALID_CRITERION_TYPES.has(c.type)) {
      errors.push(`${prefix}: invalid or unsupported criterion type '${c.type}'`);
    }

    if (!c.operator || !VALID_OPERATORS.has(c.operator)) {
      errors.push(`${prefix}: invalid or unsupported operator '${c.operator}'`);
    }

    if (typeof c.mandatory !== 'boolean') {
      errors.push(`${prefix}: 'mandatory' must be a boolean`);
    }

    if (c.weight !== undefined) {
      if (typeof c.weight !== 'number' || Number.isNaN(c.weight) || !Number.isFinite(c.weight) || c.weight < 0) {
        errors.push(`${prefix}: 'weight' must be a non-negative finite number`);
      }
    }

    // Operator-specific validation
    if (c.operator === 'COUNT_AT_LEAST' || c.operator === 'COUNT_AT_MOST') {
      if (typeof c.expectedValue !== 'number' || Number.isNaN(c.expectedValue) || c.expectedValue < 0) {
        errors.push(`${prefix}: operator '${c.operator}' requires a non-negative integer expectedValue`);
      }
    }

    if (c.operator === 'MATCHES') {
      if (typeof c.expectedValue !== 'string') {
        errors.push(`${prefix}: operator 'MATCHES' requires a string regex pattern`);
      } else {
        // ReDoS safety check: limit regex string length and verify compile
        if (c.expectedValue.length > 200) {
          errors.push(`${prefix}: regex pattern exceeds safe maximum length (200 chars)`);
        } else {
          try {
            new RegExp(c.expectedValue);
          } catch (regErr: any) {
            errors.push(`${prefix}: invalid regular expression '${c.expectedValue}': ${regErr.message}`);
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ==========================================
// Canonical Default Profiles
// ==========================================

export const CANONICAL_DEFAULT_PROFILE: QualificationProfile = {
  profileId: 'leadnoria_default_commercial_v1',
  profileName: 'Standard Commercial Business Qualification',
  version: '1.0.0',
  enabled: true,
  missingDataPolicy: 'MISSING_IS_UNKNOWN',
  unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
  conflictPolicy: 'STRICT_CONTRADICTION',
  thresholds: {
    minimumScore: 60
  },
  criteria: [
    {
      id: 'req_relevance',
      type: 'RELEVANCE',
      operator: 'EQUALS',
      expectedValue: 'RELEVANT',
      mandatory: true,
      weight: 30,
      description: 'Business must satisfy search relevance'
    },
    {
      id: 'req_website_status',
      type: 'WEBSITE_STATUS',
      operator: 'IN',
      expectedValue: ['WEBSITE_VERIFIED_BUSINESS_SITE', 'WEBSITE_PRESENT'],
      mandatory: true,
      weight: 25,
      description: 'Business must possess an active or verified business website'
    },
    {
      id: 'req_phone',
      type: 'HAS_BUSINESS_PHONE',
      operator: 'COUNT_AT_LEAST',
      expectedValue: 1,
      mandatory: true,
      weight: 25,
      description: 'Business must have at least one usable public phone number'
    },
    {
      id: 'opt_email',
      type: 'HAS_BUSINESS_EMAIL',
      operator: 'COUNT_AT_LEAST',
      expectedValue: 1,
      mandatory: false,
      weight: 20,
      description: 'Bonus: Business possesses a public business email'
    }
  ]
};

// ==========================================
// Phase 23 Reusable Profile Templates
// ==========================================

export const LOCAL_SERVICE_BUSINESS_PROFILE: QualificationProfile = {
  profileId: 'leadnoria_local_service_v1',
  profileName: 'Local Service Business Qualification',
  version: '1.0.0',
  enabled: true,
  missingDataPolicy: 'MISSING_IS_UNKNOWN',
  unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
  conflictPolicy: 'STRICT_CONTRADICTION',
  thresholds: {
    minimumScore: 60
  },
  criteria: [
    {
      id: 'req_local_website',
      type: 'VERIFIED_BUSINESS_WEBSITE',
      operator: 'EXISTS',
      mandatory: true,
      weight: 25,
      description: 'Business must possess a verified website'
    },
    {
      id: 'req_local_contact',
      type: 'PUBLIC_PHONE_AVAILABLE',
      operator: 'EXISTS',
      mandatory: true,
      weight: 25,
      description: 'Business must provide a public phone contact'
    },
    {
      id: 'opt_local_services',
      type: 'PUBLISHED_SERVICES',
      operator: 'COUNT_AT_LEAST',
      expectedValue: 1,
      mandatory: false,
      weight: 20,
      description: 'Business lists published local services'
    },
    {
      id: 'opt_local_hours',
      type: 'BUSINESS_HOURS_PRESENT',
      operator: 'EXISTS',
      mandatory: false,
      weight: 15,
      description: 'Business hours are publicly available'
    },
    {
      id: 'opt_local_booking',
      type: 'DIGITAL_BOOKING_PRESENT',
      operator: 'EXISTS',
      mandatory: false,
      weight: 15,
      description: 'Online booking capability detected'
    }
  ]
};

export const B2B_PROSPECT_PROFILE: QualificationProfile = {
  profileId: 'leadnoria_b2b_prospect_v1',
  profileName: 'B2B Commercial Prospect Qualification',
  version: '1.0.0',
  enabled: true,
  missingDataPolicy: 'MISSING_IS_UNKNOWN',
  unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
  conflictPolicy: 'STRICT_CONTRADICTION',
  thresholds: {
    minimumScore: 65
  },
  criteria: [
    {
      id: 'req_b2b_website',
      type: 'VERIFIED_BUSINESS_WEBSITE',
      operator: 'EXISTS',
      mandatory: true,
      weight: 25,
      description: 'Verified business domain must exist'
    },
    {
      id: 'req_b2b_email',
      type: 'PUBLIC_EMAIL_AVAILABLE',
      operator: 'EXISTS',
      mandatory: true,
      weight: 25,
      description: 'Public business email must be available'
    },
    {
      id: 'opt_b2b_services',
      type: 'PUBLISHED_SERVICES',
      operator: 'COUNT_AT_LEAST',
      expectedValue: 1,
      mandatory: false,
      weight: 20,
      description: 'Business describes explicit service offerings'
    },
    {
      id: 'opt_b2b_person',
      type: 'PUBLIC_PERSON_AVAILABLE',
      operator: 'EXISTS',
      mandatory: false,
      weight: 15,
      description: 'Public team member or person identified'
    },
    {
      id: 'opt_b2b_corroboration',
      type: 'CORROBORATED_IDENTITY',
      operator: 'EXISTS',
      mandatory: false,
      weight: 15,
      description: 'Business identity corroborated across multiple sources'
    }
  ]
};

export const DIGITAL_COMMERCE_BUSINESS_PROFILE: QualificationProfile = {
  profileId: 'leadnoria_digital_commerce_v1',
  profileName: 'Digital Commerce Business Qualification',
  version: '1.0.0',
  enabled: true,
  missingDataPolicy: 'MISSING_IS_UNKNOWN',
  unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
  conflictPolicy: 'STRICT_CONTRADICTION',
  thresholds: {
    minimumScore: 60
  },
  criteria: [
    {
      id: 'req_ecom_website',
      type: 'VERIFIED_BUSINESS_WEBSITE',
      operator: 'EXISTS',
      mandatory: true,
      weight: 30,
      description: 'Active website required'
    },
    {
      id: 'req_ecom_capability',
      type: 'DIGITAL_ECOMMERCE_PRESENT',
      operator: 'EXISTS',
      mandatory: true,
      weight: 30,
      description: 'E-commerce platform or checkout capability detected'
    },
    {
      id: 'opt_ecom_chat',
      type: 'DIGITAL_CHAT_PRESENT',
      operator: 'EXISTS',
      mandatory: false,
      weight: 20,
      description: 'Customer chat / widget present'
    },
    {
      id: 'opt_ecom_analytics',
      type: 'DIGITAL_ANALYTICS_PRESENT',
      operator: 'EXISTS',
      mandatory: false,
      weight: 20,
      description: 'Digital analytics technology detected'
    }
  ]
};

export const HIGH_CONTACTABILITY_PROFILE: QualificationProfile = {
  profileId: 'leadnoria_high_contactability_v1',
  profileName: 'High Contactability Qualification',
  version: '1.0.0',
  enabled: true,
  missingDataPolicy: 'MISSING_IS_UNKNOWN',
  unknownDataPolicy: 'UNKNOWN_YIELDS_UNCERTAIN',
  conflictPolicy: 'STRICT_CONTRADICTION',
  thresholds: {
    minimumScore: 70
  },
  criteria: [
    {
      id: 'req_contact_email',
      type: 'PUBLIC_EMAIL_AVAILABLE',
      operator: 'EXISTS',
      mandatory: true,
      weight: 30,
      description: 'Public business email must be available'
    },
    {
      id: 'req_contact_phone',
      type: 'PUBLIC_PHONE_AVAILABLE',
      operator: 'EXISTS',
      mandatory: true,
      weight: 30,
      description: 'Public business phone must be available'
    },
    {
      id: 'opt_contact_form',
      type: 'HAS_CONTACT_FORM',
      operator: 'EXISTS',
      mandatory: false,
      weight: 20,
      description: 'Contact form available on website'
    },
    {
      id: 'opt_contact_corroborated_phone',
      type: 'CORROBORATED_PHONE',
      operator: 'EXISTS',
      mandatory: false,
      weight: 20,
      description: 'Phone corroborated across distinct sources'
    }
  ]
};

