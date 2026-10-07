/**
 * LeadNoria — Persistent Lead Workspace, Saved Research & Lead Lifecycle
 * Part 9: Lead History & Safe Audit Trail
 *
 * HARD ARCHITECTURAL INVARIANTS:
 * 1. History events record only safe scalar or delta values for permitted fields.
 * 2. Absolutely NO before/after snapshots of restricted Google candidate data.
 * 3. Bounded retention per lead to protect memory and storage bounds.
 */

import type { WorkspaceHistoryEvent, WorkspaceHistoryEventType } from './workspaceTypes.ts';

/**
 * Maximum audit trail events retained per lead.
 */
export const MAX_HISTORY_EVENTS_PER_LEAD = 50;

let eventCounter = 0;

/**
 * Generates a unique, collision-resistant history event ID.
 */
export function generateHistoryEventId(): string {
  eventCounter++;
  const rand = Math.random().toString(36).substring(2, 9);
  return `evt_${Date.now().toString(36)}_${eventCounter}_${rand}`;
}

/**
 * Creates a safe WorkspaceHistoryEvent.
 * Sanitizes old/new values to prevent covert data laundering in audit trail.
 */
export function createHistoryEvent(params: {
  readonly leadId: string;
  readonly eventType: WorkspaceHistoryEventType;
  readonly fieldName?: string;
  readonly oldSafeValue?: string;
  readonly newSafeValue?: string;
  readonly actor?: 'USER' | 'SYSTEM';
}): WorkspaceHistoryEvent {
  const sanitizeValue = (val?: string): string | undefined => {
    if (!val || typeof val !== 'string') return undefined;
    const trimmed = val.trim().slice(0, 500);
    // Anti-laundering check
    if (trimmed.includes('ChIJ') || trimmed.includes('maps.google.com') || trimmed.includes('GOOGLE_SENTINEL')) {
      return '[REDACTED_RESTRICTED_VALUE]';
    }
    return trimmed;
  };

  return Object.freeze({
    eventId: generateHistoryEventId(),
    leadId: params.leadId,
    eventType: params.eventType,
    fieldName: params.fieldName,
    oldSafeValue: sanitizeValue(params.oldSafeValue),
    newSafeValue: sanitizeValue(params.newSafeValue),
    timestamp: new Date().toISOString(),
    actor: params.actor || 'USER'
  });
}

/**
 * In-memory history manager maintaining bounded audit trails per lead.
 */
export class WorkspaceHistoryManager {
  private readonly historyMap = new Map<string, WorkspaceHistoryEvent[]>();

  public recordEvent(event: WorkspaceHistoryEvent): void {
    const list = this.historyMap.get(event.leadId) || [];
    list.push(event);

    // Enforce bounded history size
    if (list.length > MAX_HISTORY_EVENTS_PER_LEAD) {
      list.shift(); // Evict oldest
    }

    this.historyMap.set(event.leadId, list);
  }

  public getEventsForLead(leadId: string): readonly WorkspaceHistoryEvent[] {
    return this.historyMap.get(leadId) || [];
  }

  public clearLeadHistory(leadId: string): void {
    this.historyMap.delete(leadId);
  }

  public clearAll(): void {
    this.historyMap.clear();
  }

  public exportHistoryDictionary(): Record<string, WorkspaceHistoryEvent[]> {
    const out: Record<string, WorkspaceHistoryEvent[]> = {};
    for (const [leadId, events] of this.historyMap.entries()) {
      out[leadId] = [...events];
    }
    return out;
  }

  public importHistoryDictionary(data: Record<string, WorkspaceHistoryEvent[]>): void {
    if (!data || typeof data !== 'object') return;
    for (const [leadId, events] of Object.entries(data)) {
      if (Array.isArray(events)) {
        this.historyMap.set(leadId, events.slice(-MAX_HISTORY_EVENTS_PER_LEAD));
      }
    }
  }
}
