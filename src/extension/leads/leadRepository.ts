/**
 * LeadNoria — Export-Safe Lead Projection & Research Workspace
 * Part 8: Lead Repository & Persistence Boundaries
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * - Scoped repository maintaining ExportSafeLeads in-memory.
 * - Enforces zero serialization of restricted Google candidate data.
 * - Only ELIGIBLE leads with verified independent sources can be persisted.
 * - Session disposal cleans all records and terminates references.
 */

import type { ExportSafeLead, IndependentSourceAnchor } from './leadTypes.ts';

export class LeadRepository {
  private readonly sessionId: string;
  private readonly leads: Map<string, ExportSafeLead> = new Map();
  private readonly sources: Map<string, IndependentSourceAnchor> = new Map();
  private isDisposed = false;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public get size(): number {
    return this.leads.size;
  }

  public addLead(lead: ExportSafeLead): void {
    this.assertActive();
    this.leads.set(lead.leadId, lead);
  }

  public getLead(leadId: string): ExportSafeLead | undefined {
    this.assertActive();
    return this.leads.get(leadId);
  }

  public getAllLeads(): ExportSafeLead[] {
    this.assertActive();
    return Array.from(this.leads.values());
  }

  public getEligibleLeads(): ExportSafeLead[] {
    this.assertActive();
    return Array.from(this.leads.values()).filter(l => l.exportEligibility === 'ELIGIBLE');
  }

  public getBlockedLeads(): ExportSafeLead[] {
    this.assertActive();
    return Array.from(this.leads.values()).filter(l => l.exportEligibility === 'BLOCKED');
  }

  public removeLead(leadId: string): boolean {
    this.assertActive();
    return this.leads.delete(leadId);
  }

  public addSourceAnchor(source: IndependentSourceAnchor): void {
    this.assertActive();
    this.sources.set(source.sourceId, source);
  }

  public getSourceAnchor(sourceId: string): IndependentSourceAnchor | undefined {
    this.assertActive();
    return this.sources.get(sourceId);
  }

  public getAllSourceAnchors(): IndependentSourceAnchor[] {
    this.assertActive();
    return Array.from(this.sources.values());
  }

  /**
   * Persists eligible leads to a target storage dictionary.
   * STRICT GUARD: Throws error if any restricted Google terms appear.
   */
  public serializeForStorage(targetStorage: Record<string, string>): void {
    this.assertActive();
    const eligibleLeads = this.getEligibleLeads();
    const serialized = JSON.stringify(eligibleLeads);

    if (
      serialized.includes('GOOGLE_MAPS_BROWSER') ||
      serialized.includes('ChIJ') ||
      serialized.includes('GOOGLE_SENTINEL')
    ) {
      throw new Error('SECURITY VIOLATION: Restricted Google payload detected during lead serialization');
    }

    targetStorage[`leads_${this.sessionId}`] = serialized;
  }

  /**
   * Rehydrates eligible leads from storage dictionary.
   */
  public deserializeFromStorage(storageSource: Record<string, string>): void {
    this.assertActive();
    const raw = storageSource[`leads_${this.sessionId}`];
    if (!raw) return;
    const items = JSON.parse(raw);
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item && item.leadId) {
          this.leads.set(item.leadId, item);
        }
      }
    }
  }

  public dispose(): void {
    this.leads.clear();
    this.sources.clear();
    this.isDisposed = true;
  }

  private assertActive(): void {
    if (this.isDisposed) {
      throw new Error(`Cannot perform operation on disposed LeadRepository "${this.sessionId}"`);
    }
  }
}
