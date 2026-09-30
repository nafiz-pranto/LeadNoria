/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Field-Level Export Firewall & Policy Evaluator
 * 
 * Non-Negotiable Invariants:
 * - Google consumer-web derived fields are strictly EXPORT_BLOCKED
 * - Website-derived and Meta-derived fields are evaluated on their own independent merits
 * - Mixed records export field-by-field; eligible fields do not unlock restricted fields
 * - Neither UI nor direct download can bypass policy evaluations
 */

import { UnifiedResearchRecord, FieldEligibility } from '../pipeline/pipelineTypes.ts';
import { FieldPolicyEvaluation, RecordExportEvaluation } from './exportTypes.ts';

export class ExportPolicy {
  /**
   * Evaluates a single field contribution against export policy rules.
   */
  evaluateField(fieldName: string, eligibility?: FieldEligibility, primarySource?: string): FieldPolicyEvaluation {
    if (!eligibility) {
      if (primarySource === 'GOOGLE_MAPS') {
        return {
          fieldName,
          decision: 'EXPORT_BLOCKED',
          reasonCode: 'BLOCKED_BY_SOURCE_POLICY',
          sourceFamily: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED'
        };
      }
      return {
        fieldName,
        decision: 'EXPORT_ALLOWED',
        reasonCode: 'FIELD_DEFAULT_ELIGIBLE',
        sourceFamily: 'META',
        provenance: 'LEADNORIA_DERIVED'
      };
    }

    // Strict invariant: Google consumer-web fields are blocked from export
    if (eligibility.sourceProvenance === 'GOOGLE_DERIVED') {
      if (!eligibility.isEligible) {
        return {
          fieldName,
          decision: 'EXPORT_BLOCKED',
          reasonCode: eligibility.restrictionBasis || 'BLOCKED_BY_GOOGLE_CONSUMER_POLICY',
          sourceFamily: 'GOOGLE_MAPS',
          provenance: 'GOOGLE_DERIVED'
        };
      }
    }

    const sourceFamily = eligibility.sourceProvenance === 'GOOGLE_DERIVED'
      ? 'GOOGLE_MAPS'
      : (eligibility.sourceProvenance === 'META_DERIVED' ? 'META' : 'WEBSITE');

    if (!eligibility.isEligible) {
      return {
        fieldName,
        decision: 'EXPORT_BLOCKED',
        reasonCode: eligibility.restrictionBasis || 'BLOCKED_BY_POLICY',
        sourceFamily,
        provenance: eligibility.sourceProvenance
      };
    }

    return {
      fieldName,
      decision: 'EXPORT_ALLOWED',
      reasonCode: 'POLICY_APPROVED',
      sourceFamily,
      provenance: eligibility.sourceProvenance
    };
  }

  /**
   * Evaluates an entire UnifiedResearchRecord for export readiness.
   */
  evaluateRecord(record: UnifiedResearchRecord): RecordExportEvaluation {
    const fieldEvaluations: FieldPolicyEvaluation[] = [];
    const excludedFields: string[] = [];

    // Core invariant: if candidate restrictions strictly disallow export overall
    if (record.restrictions.exportEligible === false) {
      const allFields = Object.keys(record.fieldEligibility || {});
      return {
        recordId: record.recordId,
        isEligibleForExport: false,
        fieldEvaluations: allFields.map(f => this.evaluateField(f, record.fieldEligibility[f], record.primarySource)),
        projection: null,
        excludedFields: allFields,
        blockedReason: record.restrictions.restrictionBasis || 'RECORD_NOT_EXPORTABLE_BY_POLICY'
      };
    }

    // Evaluate known exportable fields plus all explicit field eligibility keys
    const targetFields = new Set([
      'businessName', 'website', 'phone', 'email', 'address', 'category', 'social',
      ...Object.keys(record.fieldEligibility || {})
    ]);

    for (const field of targetFields) {
      const eligibility = record.fieldEligibility[field];
      const evaluation = this.evaluateField(field, eligibility, record.primarySource);
      fieldEvaluations.push(evaluation);

      if (evaluation.decision !== 'EXPORT_ALLOWED') {
        excludedFields.push(field);
      }
    }

    // Invariant: If a record has zero eligible fields, it is ineligible for export.
    const allowedFields = fieldEvaluations.filter(f => f.decision === 'EXPORT_ALLOWED');
    if (allowedFields.length === 0) {
      return {
        recordId: record.recordId,
        isEligibleForExport: false,
        fieldEvaluations,
        projection: null,
        excludedFields,
        blockedReason: 'ALL_FIELDS_RESTRICTED_BY_SOURCE_POLICY'
      };
    }

    return {
      recordId: record.recordId,
      isEligibleForExport: true,
      fieldEvaluations,
      projection: null, // Populated by ExportProjection
      excludedFields
    };
  }
}
