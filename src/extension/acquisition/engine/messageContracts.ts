/**
 * LeadNoria — Google Maps Acquisition Engine — Message Contracts
 * Typed Chrome Extension Runtime Message Definitions
 *
 * Invariants:
 * - Every message has a typed payload, source, and correlation session ID.
 * - Uses the existing LeadNoria chrome.runtime.sendMessage / onMessage pattern.
 * - Message names follow existing SCREAMING_SNAKE_CASE naming convention.
 * - Malformed messages must be rejected with deterministic error responses.
 */

import type {
  GoogleMapsSearchUnitInput,
  GoogleMapsSessionConfig,
  GoogleMapsAcquisitionState,
  GoogleMapsAcquisitionDiagnostic,
  GoogleMapsCandidateObservation,
  GoogleMapsSessionProgress
} from './types.ts';

// ==========================================
// Base
// ==========================================

export interface BaseAcquisitionMessage {
  readonly source: 'GMAPS_ENGINE';
  readonly correlationId?: string;
}

// ==========================================
// Commands (UI → Service Worker)
// ==========================================

export interface StartAcquisitionMessage extends BaseAcquisitionMessage {
  readonly type: 'START_GMAPS_ACQUISITION';
  readonly payload: {
    sessionId: string;
    searchUnits: GoogleMapsSearchUnitInput[];
    config: Partial<GoogleMapsSessionConfig>;
  };
}

export interface PauseAcquisitionMessage extends BaseAcquisitionMessage {
  readonly type: 'PAUSE_GMAPS_ACQUISITION';
  readonly payload: { sessionId: string };
}

export interface ResumeAcquisitionMessage extends BaseAcquisitionMessage {
  readonly type: 'RESUME_GMAPS_ACQUISITION';
  readonly payload: { sessionId: string };
}

export interface CancelAcquisitionMessage extends BaseAcquisitionMessage {
  readonly type: 'CANCEL_GMAPS_ACQUISITION';
  readonly payload: { sessionId: string; reason?: string };
}

export interface GetAcquisitionStatusMessage extends BaseAcquisitionMessage {
  readonly type: 'GET_GMAPS_ACQUISITION_STATUS';
  readonly payload: { sessionId: string };
}

export interface ExecuteFeedScrollMessage extends BaseAcquisitionMessage {
  readonly type: 'EXECUTE_GMAPS_FEED_SCROLL';
  readonly payload: {
    sessionId: string;
    policy?: Record<string, unknown>;
  };
}

export interface ProbeLiveCapabilityMessage extends BaseAcquisitionMessage {
  readonly type: 'PROBE_GMAPS_LIVE_CAPABILITY';
  readonly payload: {
    sessionId: string;
    tabId?: number;
    url?: string;
  };
}

export interface SetGmapsFilterMessage extends BaseAcquisitionMessage {
  readonly type: 'SET_GMAPS_FILTER';
  readonly payload: {
    sessionId: string;
    rating?: string;
    website?: string;
  };
}

export interface ResetGmapsFilterMessage extends BaseAcquisitionMessage {
  readonly type: 'RESET_GMAPS_FILTER';
  readonly payload: {
    sessionId: string;
  };
}

export interface GetGmapsFilteredViewMessage extends BaseAcquisitionMessage {
  readonly type: 'GET_GMAPS_FILTERED_VIEW';
  readonly payload: {
    sessionId: string;
  };
}

// Bulk Research Commands (Part 4)
export interface StartGmapsBulkResearchMessage extends BaseAcquisitionMessage {
  readonly type: 'START_GMAPS_BULK_RESEARCH';
  readonly payload: {
    sessionId: string;
    keywords: string[];
    locations: string[];
    ratingFilter?: string;
    websiteFilter?: string;
    executionPolicy?: Record<string, unknown>;
    tabId?: number;
    planId?: string;
    runId?: string;
  };
}

export interface PauseGmapsBulkResearchMessage extends BaseAcquisitionMessage {
  readonly type: 'PAUSE_GMAPS_BULK_RESEARCH';
  readonly payload: {
    sessionId: string;
    runId?: string;
  };
}

export interface ResumeGmapsBulkResearchMessage extends BaseAcquisitionMessage {
  readonly type: 'RESUME_GMAPS_BULK_RESEARCH';
  readonly payload: {
    sessionId: string;
    runId?: string;
  };
}

export interface CancelGmapsBulkResearchMessage extends BaseAcquisitionMessage {
  readonly type: 'CANCEL_GMAPS_BULK_RESEARCH';
  readonly payload: {
    sessionId: string;
    runId?: string;
    reason?: string;
  };
}

export interface GetGmapsBulkResearchStatusMessage extends BaseAcquisitionMessage {
  readonly type: 'GET_GMAPS_BULK_RESEARCH_STATUS';
  readonly payload: {
    sessionId: string;
    runId?: string;
  };
}

// ==========================================
// Events (Service Worker → UI)
// ==========================================

export interface AcquisitionStatusUpdatedMessage extends BaseAcquisitionMessage {
  readonly type: 'GMAPS_ACQUISITION_STATUS_UPDATED';
  readonly payload: {
    sessionId: string;
    state: GoogleMapsAcquisitionState;
    progress: GoogleMapsSessionProgress;
    timestamp: string;
  };
}

export interface CandidatesObservedMessage extends BaseAcquisitionMessage {
  readonly type: 'GMAPS_CANDIDATES_OBSERVED';
  readonly payload: {
    sessionId: string;
    searchUnitId: string;
    candidates: GoogleMapsCandidateObservation[];
    cumulativeCount: number;
    timestamp: string;
  };
}

export interface AcquisitionDiagnosticMessage extends BaseAcquisitionMessage {
  readonly type: 'GMAPS_ACQUISITION_DIAGNOSTIC';
  readonly payload: {
    sessionId: string;
    diagnostic: GoogleMapsAcquisitionDiagnostic;
  };
}

// ==========================================
// Union Type
// ==========================================

export type GoogleMapsAcquisitionMessage =
  | StartAcquisitionMessage
  | PauseAcquisitionMessage
  | ResumeAcquisitionMessage
  | CancelAcquisitionMessage
  | GetAcquisitionStatusMessage
  | ExecuteFeedScrollMessage
  | ProbeLiveCapabilityMessage
  | SetGmapsFilterMessage
  | ResetGmapsFilterMessage
  | GetGmapsFilteredViewMessage
  | StartGmapsBulkResearchMessage
  | PauseGmapsBulkResearchMessage
  | ResumeGmapsBulkResearchMessage
  | CancelGmapsBulkResearchMessage
  | GetGmapsBulkResearchStatusMessage
  | AcquisitionStatusUpdatedMessage
  | CandidatesObservedMessage
  | AcquisitionDiagnosticMessage;

// ==========================================
// Message Validation
// ==========================================

export function validateAcquisitionMessage(msg: unknown): {
  valid: boolean;
  message?: GoogleMapsAcquisitionMessage;
  error?: string;
} {
  if (!msg || typeof msg !== 'object') {
    return { valid: false, error: 'Message must be a non-null object' };
  }

  const m = msg as Record<string, unknown>;
  if (typeof m.type !== 'string') {
    return { valid: false, error: 'Message must have a string "type" field' };
  }

  if (m.source !== 'GMAPS_ENGINE') {
    return { valid: false, error: 'Message source must be "GMAPS_ENGINE"' };
  }

  const validTypes = new Set([
    'START_GMAPS_ACQUISITION',
    'PAUSE_GMAPS_ACQUISITION',
    'RESUME_GMAPS_ACQUISITION',
    'CANCEL_GMAPS_ACQUISITION',
    'GET_GMAPS_ACQUISITION_STATUS',
    'EXECUTE_GMAPS_FEED_SCROLL',
    'PROBE_GMAPS_LIVE_CAPABILITY',
    'SET_GMAPS_FILTER',
    'RESET_GMAPS_FILTER',
    'GET_GMAPS_FILTERED_VIEW',
    'START_GMAPS_BULK_RESEARCH',
    'PAUSE_GMAPS_BULK_RESEARCH',
    'RESUME_GMAPS_BULK_RESEARCH',
    'CANCEL_GMAPS_BULK_RESEARCH',
    'GET_GMAPS_BULK_RESEARCH_STATUS',
    'GMAPS_ACQUISITION_STATUS_UPDATED',
    'GMAPS_CANDIDATES_OBSERVED',
    'GMAPS_ACQUISITION_DIAGNOSTIC'
  ]);

  if (!validTypes.has(m.type as string)) {
    return { valid: false, error: `Unknown message type: "${m.type}"` };
  }

  const isBulkType = typeof m.type === 'string' && m.type.includes('_BULK_');

  let payload = m.payload as Record<string, unknown> | undefined;
  if (!payload || typeof payload !== 'object') {
    if (m.type === 'GET_GMAPS_BULK_RESEARCH_STATUS' || isBulkType) {
      payload = {};
      (m as any).payload = payload;
    } else {
      return { valid: false, error: 'Message must have a "payload" object' };
    }
  }

  if (!isBulkType && (!payload.sessionId || typeof payload.sessionId !== 'string')) {
    return { valid: false, error: 'Message payload must include a "sessionId" string' };
  }

  return { valid: true, message: msg as GoogleMapsAcquisitionMessage };
}

