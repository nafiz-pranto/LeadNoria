# LeadNoria v1.5.0 Release Notes

**Release Date:** October 6, 2026  
**Version:** `1.5.0`  
**Phase:** Phase 32 — Production Feedback, Reliability & Growth Readiness  
**Target Release Archive:** `dist/leadnoria-v1.5.0.zip`  
**Target Manifest:** `extension/manifest.json` (Manifest V3)  

---

## Executive Summary

LeadNoria v1.5.0 introduces the **Production Feedback, Reliability & Growth Readiness** layer, providing local-first, privacy-preserving diagnostics, deterministic error fingerprinting, an operational error taxonomy, quantitative reliability metrics, and accessible system diagnostic tooling.

Consistent with LeadNoria architectural commitments:
- **100% Local-First:** All diagnostic issues and operational metrics are persisted and computed locally.
- **Zero Remote Telemetry:** No third-party analytics libraries (no Mixpanel, Segment, Google Analytics, Sentry, or hidden network beacons).
- **Zero Predictive Claims:** Operational metrics are purely evidence-derived and historical; no predictive lead scoring, conversion modeling, or buyer intent claims.
- **Strict Data Firewall:** Diagnostics reproduction packages are sanitized of all PII, auth tokens, passwords, cookies, and raw website content. Google Maps data is strictly constrained to safe aggregate counters.
- **Immutable Provenance:** Preserves `v1.4.0` (commit `9ca5670a804124c6161e1dda3babd446a5fd2043`, SHA `18d0d38a3b70bf9e699d0dc7a64a63ebe2845b39630ce83d4a4637d826d70881`) as an immutable baseline.

---

## What's New in v1.5.0

### 1. Typed Local Issue Model & Deterministic Fingerprinting
- **Typed Model:** `ProductionIssue` records capture `issueId`, `fingerprint`, `severity` (P0/P1/P2/P3), `category`, `workflowStage`, `humanReadableMessage`, `sanitizedTechnicalCode`, `browser`, `os`, `timestamp`, `occurrenceCount`, `affectedRunIds`, `lastSeen`, `reproductionHint`, `resolutionState`, `retryability`, and `userImpact`.
- **Deterministic Fingerprinting:** Generates stable hashes across sessions using FNV-1a hashing. Strips ISO timestamps, epoch numbers, emails, phone numbers, run IDs, query parameters, hex tokens, and UUIDs while preserving semantic root cause.

### 2. Transparent 13-Category Error Taxonomy
- Comprehensive taxonomy covering:
  - `ACQUISITION` (P1)
  - `WEBSITE` (P2)
  - `NORMALIZATION` (P2)
  - `ENTITY_RESOLUTION` (P1)
  - `QUALIFICATION` (P2)
  - `PERSISTENCE` (P0)
  - `EXPORT` (P1)
  - `UI` (P2)
  - `LIFECYCLE` (P1)
  - `SECURITY` (P0)
  - `POLICY` (P1)
  - `PERFORMANCE` (P2)
  - `UNKNOWN` (P3)
- Explicit user impact statements and retryability indicators without black-box predictive models.

### 3. Local Diagnostics Persistence & Aggregation
- **Bounded Retention:** Stores up to 100 distinct issue fingerprints using the existing `StorageAdapter` under the `diagnostic_issues_v1` collection.
- **Deterministic Pruning:** Evicts lowest occurrence count first, then oldest `lastSeen`, with deterministic fingerprint tie-breakers.
- **Graceful Fault Tolerance:** Corrupt diagnostic state falls back safely without breaking research operations or corrupting lead data.
- **O(N) Issue Aggregation:** Rapidly aggregates occurrences and affected runs using in-memory indexed maps.

### 4. Quantitative Reliability Metrics & Operational Guardrails
- **Evidence-Derived Metrics:** Computes `runSuccessRate`, `failureRate`, `partialRate`, `recoveryRate`, `retryRate`, `averageRunDurationMs`, and `p95RunDurationMs`.
- **Transparent Denominators:** Completed runs define success rate, recoverable runs define recovery rate, and total runs define issue rates.
- **Sample Sufficiency Indicators:** Explicitly rates confidence as `NO_DATA`, `LOW_SAMPLE`, `MODERATE_SAMPLE`, or `STRONG_SAMPLE`.
- **Internal Guardrail Alerts:** Flags operational conditions (e.g. `HIGH_FAILURE_RATE`, `HIGH_PERSISTENCE_FAILURE_RATE`, `HIGH_EXPORT_FAILURE_RATE`) with severity ratings and actionable explanations without claiming external SLAs.

### 5. Diagnostics UI & User Feedback Workflow
- **Settings Integration:** Diagnostics embedded cleanly inside the Settings tab with:
  - System summary (version, browser, OS, schema version)
  - Reliability metrics grid with sample sufficiency tags
  - Active operational guardrail alerts
  - Filterable issues table with severity badges and resolution toggles
  - Storage health bar tracking quota consumption
  - Manual diagnostic reproduction package export (JSON) and clipboard copy
  - Safe diagnostic history clearing that protects research lead records
- **Accessibility:** Full WCAG AA compliance (keyboard navigation, ARIA live regions, semantic tables, high-contrast badges).

### 6. View-Model Defensive Resilience
- Defensive optional chaining throughout `viewModelMappers.ts` guarantees clean degradation without unhandled runtime exceptions when encountering incomplete or corrupt lead records.

---

## Verification & Test Results

| Suite | Tests | Passed | Failed | Status |
|---|---|---|---|---|
| Phase 32 Dedicated Suite | 286 | 286 | 0 | PASS |
| Clean Chromium Browser Verification (Full) | 23 | 23 | 0 | PASS |
| Clean Chromium Browser Verification (Sparse Probe) | 23 | 23 | 0 | PASS |
| Historical Regression Matrix (Phases 8–31 + E2E + Scroll) | 2,446 | 2,446 | 0 | PASS |
| **Total Test Accounting** | **2,732** | **2,732** | **0** | **PASS** |

TypeScript check (`tsc --noEmit`) passes with zero errors.
