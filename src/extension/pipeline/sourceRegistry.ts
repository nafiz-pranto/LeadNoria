/**
 * LeadNoria — Phase 14: Unified Multi-Source Architecture
 * Unified Source Adapter Registry
 * 
 * Invariants:
 * - Deterministic adapter registration and lookup
 * - Rejects duplicate registrations or unauthorized replacement
 * - Prevents arbitrary dynamic import or path injection
 * - Google Maps capability is always registered as CONTRACT_ONLY
 */

import {
  UnifiedSourceAdapter,
  MetaUnifiedAdapter,
  GoogleMapsUnifiedAdapter,
  WebsiteUnifiedAdapter,
  UserProvidedUnifiedAdapter
} from './sourceAdapter.ts';
import { SourceType, SourceCapability } from './pipelineTypes.ts';

export class UnifiedSourceAdapterRegistry {
  private adapters = new Map<SourceType, UnifiedSourceAdapter>();

  constructor(autoRegisterDefaults = true) {
    if (autoRegisterDefaults) {
      this.register(new MetaUnifiedAdapter());
      this.register(new GoogleMapsUnifiedAdapter());
      this.register(new WebsiteUnifiedAdapter());
      this.register(new UserProvidedUnifiedAdapter());
    }
  }

  public register(adapter: UnifiedSourceAdapter): void {
    if (!adapter || !adapter.sourceType) {
      throw new Error('Cannot register adapter: missing sourceType');
    }
    if (this.adapters.has(adapter.sourceType)) {
      throw new Error(`Source adapter already registered for sourceType '${adapter.sourceType}'`);
    }
    this.adapters.set(adapter.sourceType, adapter);
  }

  public get(sourceType: SourceType): UnifiedSourceAdapter | undefined {
    return this.adapters.get(sourceType);
  }

  public getRequired(sourceType: SourceType): UnifiedSourceAdapter {
    const adapter = this.adapters.get(sourceType);
    if (!adapter) {
      throw new Error(`No registered source adapter found for sourceType '${sourceType}'`);
    }
    return adapter;
  }

  public has(sourceType: SourceType): boolean {
    return this.adapters.has(sourceType);
  }

  public getCapability(sourceType: SourceType): SourceCapability | undefined {
    return this.adapters.get(sourceType)?.capabilities;
  }

  public listRegisteredSources(): SourceType[] {
    return Array.from(this.adapters.keys());
  }
}

export const defaultUnifiedRegistry = new UnifiedSourceAdapterRegistry();
