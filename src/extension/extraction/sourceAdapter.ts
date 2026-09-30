/**
 * LeadNoria Source Adapter Contract & Registry (Phase 5)
 *
 * Defines the source-neutral extraction adapter contract and registry.
 */

import type {
  SourceType,
  SourceCapabilityDeclaration,
  RawCandidateEnvelope,
  NormalizedCandidate,
  FieldPolicyEnvelope,
  NormalizationErrorRecord
} from './types.ts';
import { auditCandidateDataFirewall } from './firewall.ts';

export interface SourceAdapter<TInput = any, TRaw = RawCandidateEnvelope, TNormalized = NormalizedCandidate> {
  readonly sourceType: SourceType;
  readonly capabilities: SourceCapabilityDeclaration;

  /**
   * Validates raw input structure before extraction or envelope wrapping.
   */
  validateInput(input: TInput): { isValid: boolean; errors: string[] };

  /**
   * Wraps source-native input into a typed raw candidate envelope with provenance.
   */
  createRawEnvelope(input: TInput, runId: string): TRaw;

  /**
   * Normalizes the raw candidate envelope into the standardized candidate representation.
   */
  normalize(rawEnvelope: TRaw): TNormalized;
}

// Global Source Adapter Registry
class SourceAdapterRegistry {
  private adapters = new Map<SourceType, SourceAdapter>();

  register(adapter: SourceAdapter): void {
    this.adapters.set(adapter.sourceType, adapter);
  }

  get(sourceType: SourceType): SourceAdapter | undefined {
    return this.adapters.get(sourceType);
  }

  has(sourceType: SourceType): boolean {
    return this.adapters.has(sourceType);
  }

  listRegistered(): SourceType[] {
    return Array.from(this.adapters.keys());
  }
}

export const sourceRegistry = new SourceAdapterRegistry();
