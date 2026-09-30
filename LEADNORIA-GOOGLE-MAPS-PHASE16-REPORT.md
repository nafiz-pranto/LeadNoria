# LeadNoria — Phase 16 Engineering Report: Persistence, Recovery & Export

**Product:** LeadNoria  
**Tagline:** "Discover. Verify. Connect."  
**Descriptor:** Business lead research from real public signals.  
**Baseline Acceptance:** Phases 1–15 Accepted.  
**Report Date:** September 30, 2026  
**Status:** PASS — PHASE 16 COMPLETE  
**Next Phase:** PHASE 17 — SECURITY + REGRESSION + FULL E2E TESTING  

---

## Executive Summary

Phase 16 delivers a production-grade, deterministic local persistence, recovery, and export projection layer for LeadNoria. Operating strictly within the Chrome extension client runtime without remote databases, backend services, or external APIs, Phase 16 establishes an isolated storage architecture that safely persists research runs, multi-source plans, pipeline execution graphs, candidates, resolved entities, structured evidence, contact enrichments, qualification results, geographic accounting, and durable checkpoints.

Critically, Phase 16 introduces a strict **field-level export firewall**. While entities may combine evidence from multiple sources (Meta Ad Library, direct website crawling, user-provided domains, and Google Maps replay/contracts), Google consumer-web facts remain permanently restricted (`EXPORT_BLOCKED`) and cannot be laundered into export files. Export projections evaluate fields individually, allowing independently eligible website and meta facts to be exported while blocking restricted fields. Checkpoint storage utilizes a staged two-phase commit with SHA-256 checksum integrity, enabling complete crash recovery and Manifest V3 service-worker restart resilience without rerunning completed stages.

All 142 Phase 16 deterministic tests pass. All 698 regression tests across Phases 5 through 15 and the Post-Freeze V1.0 baseline pass (840 total tests passed, 0 failed). TypeScript compilation reports 0 errors, and the extension production build passes cleanly.

---

## A. Persistence Architecture

Persistence in LeadNoria functions strictly as a storage and recovery subsystem. It does not duplicate, modify, or override the authoritative domain engines established in earlier phases:
- Phase 5: Provenance & normalization
- Phase 6: Website verification
- Phase 7: Google Maps normalization
- Phase 8: Entity resolution & clustering
- Phase 9: Evidence & relevance evaluation
- Phase 10: Website integration
- Phase 11: Contact & digital presence enrichment
- Phase 12: Advanced multi-criteria qualification
- Phase 13: Geographic expansion & saturation
- Phase 14: Unified pipeline orchestration
- Phase 15: Responsive UI/UX presentation

The persistence layer interacts with the rest of the application via typed repository interfaces (`PersistenceRepository`), encapsulating data classification, schema validation, optimistic versioning, deterministic canonical serialization, SHA-256 integrity verification, and transactional commit abstractions.

---

## B. Storage Backend

LeadNoria implements a local-only storage abstraction designed for Chrome Extension environments (`chrome.storage.local` / `IndexedDB`):
- **Interface:** `StorageAdapter` defining typed atomic get, set, delete, list, has, and transaction-bracket operations.
- **In-Memory & Extension Adapter:** `MemoryStorageAdapter` provides deterministic byte quota tracking (`maxByteQuota`), simulated transient failures, latency emulation, and lease-based atomic locks for multi-context tab isolation.
- **Zero Remote Persistence:** No cloud services, remote workers, external databases, Vercel APIs, or third-party analytics are referenced or utilized.

---

## C. Schema Registry

Storage schemas are centrally registered in `src/extension/persistence/schemaRegistry.ts`:
- **Current Storage Schema Version:** `CURRENT_SCHEMA_VERSION = 2`
- **Supported Range:** Minimum supported schema is version 1; maximum supported is version 2.
- **Resource Registrations:** Every persisted resource (`RunRecord`, `CandidateRecord`, `EntityRecord`, `EvidenceRecord`, `QualificationRecord`, `GeographicAccountingRecord`, `CheckpointRecord`, `ExportAuditRecord`, `SourcePlanRecord`, `PipelineStateRecord`) has a registered descriptor specifying its type, active schema version, and validation constraints.
- **Incompatible Version Detection:** Requests to read or write schemas outside supported bounds immediately return `INCOMPATIBLE_STORAGE_VERSION` without corrupting active storage.

---

## D. Resource Models

Normalized storage models prevent monolithic nested document bloat:
1. **RunRecord:** `runId`, `runVersion`, `configFingerprint`, `selectedSources`, `status`, `stageStates`, `metrics`, `createdAt`, `updatedAt`, `schemaVersion`.
2. **SourcePlanRecord:** `planId`, `runId`, `sourceType`, `executionMode`, `planVersion`, `policyVersion`, `adapterVersion`, `configFingerprint`, `queryCount`, `plannedUnits`.
3. **PipelineStateRecord:** `runId`, `pipelineVersion`, `activeStage`, `completedStages`, `stageStates`, `stageVersions`.
4. **CandidateRecord:** `candidateId`, `runId`, `sourceRecordKey`, `primarySource`, `sourceRecordId`, `dataClassification`, `provenance`, `restrictions`, `normalizedFields`.
5. **EntityRecord:** `entityId`, `runId`, `canonicalName`, `primarySource`, `candidateIds`, `provenance`, `restrictions`, `confidenceScore`.
6. **EvidenceRecord:** `evidenceId`, `runId`, `entityId`, `candidateId`, `factType`, `sourceFamily`, `sourceContribution`, `dataClassification`, `restrictions`.
7. **QualificationRecord:** `qualificationId`, `runId`, `entityId`, `status`, `profileId`, `profileVersion`, `evaluatorVersion`, `criteriaResults`, `scoreSummary`.
8. **GeographicAccountingRecord:** `accountingId`, `runId`, `areaId`, `searchUnitId`, `candidateYield`, `uniqueEntityYield`, `duplicateRate`, `saturationState`.
9. **CheckpointRecord:** `checkpointId`, `runId`, `runVersion`, `completedStages`, `activeStage`, `sourceStates`, `candidateReferences`, `entityReferences`, `checksum`, `status` (`STAGED` | `COMMITTED` | `CORRUPT`).
10. **ExportAuditRecord:** `exportId`, `runId`, `requestedAt`, `completedAt`, `format`, `selectedCount`, `exportedCount`, `excludedCount`, `blockedFieldCount`, `checksum`, `status`.

---

## E. Versioning

Optimistic concurrency and schema evolution are enforced through explicit version numbers:
- **`recordVersion`:** Incremented on every mutation. Updates require an `expectedVersion`. If the stored version does not match `expectedVersion`, a `VERSION_CONFLICT` error is raised.
- **`schemaVersion`:** Embeds the data model layout version.
- **`profileVersion` & `evaluatorVersion`:** Preserved permanently on qualification records to guarantee historical audit integrity.

---

## F. Migrations

The migration engine (`src/extension/persistence/migrations.ts`) provides deterministic, non-destructive version-to-version transitions:
- **Migration v1 -> v2:** Upgrades legacy records, adding structured data classification tags (`PUBLIC_SOURCE_FACT`, `DERIVED_FACT`, `RESTRICTED_SOURCE`), explicit lineage validation flags, and schema version bumps.
- **Non-Destructive Invariant:** Migrations never delete source lineage, never convert `UNKNOWN` to `FAIL`, never convert `BLOCKED` to `PASS`, never drop restrictions, and never alter historical scores.
- **Atomic Rollback:** If any step in a migration fails, the target record is restored to its pre-migration state.

---

## G. Repository API

The `PersistenceRepository` (`src/extension/persistence/persistenceRepository.ts`) exposes typed methods:
- `createRun(run: RunRecord): Promise<void>`
- `getRun(runId: string): Promise<RunRecord | null>`
- `updateRun(run: RunRecord, expectedVersion?: number): Promise<void>`
- `listRuns(): Promise<RunRecord[]>`
- `saveCandidate(candidate: CandidateRecord): Promise<void>`
- `saveEntity(entity: EntityRecord): Promise<void>`
- `saveEvidence(evidence: EvidenceRecord): Promise<void>`
- `saveQualification(qual: QualificationRecord): Promise<void>`
- `stageCheckpoint(checkpoint: CheckpointRecord): Promise<void>`
- `commitCheckpoint(checkpointId: string): Promise<void>`
- `loadLatestCheckpoint(runId: string): Promise<CheckpointRecord | null>`
- `saveExportAudit(audit: ExportAuditRecord): Promise<void>`
- `deleteRun(runId: string): Promise<void>`
- `getStorageStats(): Promise<StorageStats>`

---

## H. Write Semantics & Idempotency

- **Operation Identifiers (`operationId` / `writeKey`):** Repeated writes carrying identical operation IDs or identical deterministic entity IDs are processed idempotently without creating duplicate storage records.
- **Staged Writes:** Complex resources (such as checkpoints and export sessions) utilize staged write semantics (`STAGED` -> `COMMITTED`) preventing partial or uncommitted data from leaking into read queries.

---

## I. Concurrency & Conflict Handling

- **Tab & Extension Surface Concurrency:** Popup, side panel, and background service worker may access storage concurrently.
- **Locking & Leases:** `StorageAdapter` provides atomic lease-based locks with explicit timeouts (e.g. 5,000ms). Stale locks automatically expire to prevent deadlocks.
- **Conflict Handling:** Optimistic locking returns explicit `VERSION_CONFLICT` errors, allowing calling orchestration components to reload state and reapply non-conflicting changes.

---

## J. Checkpoint Architecture & Integrity

Checkpoints in LeadNoria capture the minimum viable state required for deterministic crash recovery without serializing massive raw payloads:
- **Snapshot Contents:** Checkpoints store `runId`, `runVersion`, `completedStages`, `activeStage`, `sourceStates`, entity/candidate ID references, saturation state, and adapter versions.
- **Two-Phase Commit:** A checkpoint is first written with `status: 'STAGED'`. Only upon calculating and validating the SHA-256 content checksum is the record committed with `status: 'COMMITTED'`.
- **Integrity Validation:** Read operations recompute the SHA-256 checksum over the canonical serialization. Corrupted or tampered records return `CHECKPOINT_CORRUPT` and are excluded from recovery.
- **Bounded Pruning:** Checkpoints are capped at a maximum of 10 snapshots per run; older checkpoints are automatically pruned in FIFO order while preserving the latest valid checkpoint.

---

## K. Crash Recovery & Service-Worker Lifecycle

- **Discovery:** On extension reload or service-worker restart, `RecoveryManager` scans for runs in non-terminal states (`RUNNING`, `PAUSED`, `INTERRUPTED`, `RECOVERY_REQUIRED`).
- **Resumption Planning:** The manager inspects the latest committed checkpoint, verifies schema and policy compatibility, determines already completed stages from `ORDERED_PIPELINE_STAGES`, and schedules execution only for remaining incomplete stages.
- **Zero Duplicate Work:** Completed stages are never re-executed. Candidate yields and evidence ledger records already persisted remain untouched.
- **Service Worker Suspension Resilience:** Because all authoritative state is persisted in storage and checkpoints rather than in-memory process globals, service-worker termination causes zero state loss.

---

## L. Data Retention & Storage Quotas

- **Retention Management (`RetentionManager`):** Configurable retention limits enforce safety caps (e.g., max 50 runs, auto-pruning failed or completed runs beyond limits).
- **Referential Integrity Audit (`StorageDiagnostics`):** Detects orphaned candidate records, evidence records without entities, broken checkpoint pointers, or missing qualification records.
- **Quota Bounds:** Storage quotas enforce strict payload limits (max 5 MB per individual record, max 1,000 evidence references per entity, max 15 lineage depth). Exceeding quota raises explicit `STORAGE_QUOTA_EXCEEDED` errors without silently truncating data.
- **Safe Reset:** A full storage reset safely purges all local records, resets indexes, and clears locks, while never touching frozen distribution archives or remote servers.

---

## M. Export Architecture & Field-Level Firewall

Export is implemented as an independent, isolated projection layer (`src/extension/export/`):
```
Persisted UnifiedRecord
          │
          ▼
Field-Level Export Firewall (exportPolicy.ts)
          │
          ▼
Export Projection Builder (exportProjection.ts)
          │
          ▼
Deterministic Serializer (csvExporter.ts / jsonExporter.ts)
          │
          ▼
Audited Output File
```

### The Google-Derived Restriction Test (Mandatory Invariant)
1. **Google Consumer-Web Restrictions:** Google Maps consumer-web facts (`GOOGLE_DERIVED`) are classified as restricted and non-exportable (`exportEligible: false`).
2. **Independent Website Facts:** Website facts (`WEBSITE_DERIVED`) gathered via direct public site discovery are unencumbered (`exportEligible: true`).
3. **Mixed Entity Export:** When an entity contains both Google-derived facts (e.g. phone or address) and website-derived facts (e.g. contact email or verified business name), the export firewall evaluates each field independently:
   - Google-derived fields are **redacted and excluded** (`EXPORT_BLOCKED`).
   - Website-derived fields are **retained and included** (`EXPORT_ALLOWED`).
   - The export firewall logs the blocked field in the export audit record without leaking the restricted value into the output file.
   - Persistence and reload across simulated system restarts preserve recursive lineage and restriction flags without laundering.

---

## N. CSV & JSON Export Safety

- **CSV Formula Injection Mitigation:** In RFC-4180 CSV generation, leading characters that spreadsheets interpret as formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) are safely neutralized by prefixing with a single quote (`'`). Quotes are escaped (`""`) and fields containing delimiters are properly quoted.
- **Deterministic JSON Serialization:** Object keys are sorted deterministically in lexicographical order. Internal JavaScript prototypes (`__proto__`, `constructor`) are filtered to prevent prototype pollution. Circular structures are rejected.
- **Filename Sanitization:** Filenames are generated deterministically based on product descriptor, run ID, and date. Path traversal characters (`../`, `..\\`), control characters, and special symbols are strictly stripped.
- **Export Audit Records:** Every export generates a durable `ExportAuditRecord` storing the run ID, selected record count, exported record count, excluded record count, blocked field count, policy version, and SHA-256 content checksum.

---

## O. Test Suite Accounting & Verification

### Phase 16 Test Suite Breakdown (`tests/test-phase16-persistence-export.mjs`)

| Test Section | Focus Area | Tests Executed | Passed | Failed |
|---|---|:---:|:---:|:---:|
| **Section A** | Storage Core & Repository Operations | 12 | 12 | 0 |
| **Section B** | Schema Registry & Deterministic Migrations | 10 | 10 | 0 |
| **Section C** | Provenance, Restrictions & Google-Derived Preservation | 10 | 10 | 0 |
| **Section D** | Checkpoint Store, Two-Phase Commits & Checksums | 12 | 12 | 0 |
| **Section E** | Crash Recovery & Service Worker Lifecycle | 16 | 16 | 0 |
| **Section F** | Idempotency, Concurrency & Lease Locks | 12 | 12 | 0 |
| **Section G** | Referential Integrity & Orphan Detection | 8 | 8 | 0 |
| **Section H** | Storage Quotas & Resource Guardrails | 8 | 8 | 0 |
| **Section I** | Export Projection & Field-Level Firewall | 16 | 16 | 0 |
| **Section J** | Export Formats (CSV Formula Defense & Canonical JSON) | 10 | 10 | 0 |
| **Section K** | History, Retention & Storage Diagnostics | 8 | 8 | 0 |
| **Section L** | Security, Anti-Injection & Deserialization Defenses | 9 | 9 | 0 |
| **Section M** | Synthetic Performance & Memory Benchmarks | 11 | 11 | 0 |
| **Total** | **Phase 16 Test Suite Total** | **142** | **142** | **0** |

---

## P. Full Regression Suite Verification

Every prior accepted phase and baseline was executed in full regression testing:

| Phase / Suite | Test File | Assertions / Tests | Result |
|---|---|:---:|:---:|
| **Post-Freeze V1.0** | `test-post-freeze-workflow.mjs` | 19 | **PASS** (19/19) |
| **Phase 5** | `test-phase5-normalization.mjs` | 45 | **PASS** (45/45) |
| **Phase 6** | `test-phase6-website-verification.mjs` | 50 | **PASS** (50/50) |
| **Phase 7** | `test-phase7-maps-normalization.mjs` | 37 | **PASS** (37/37) |
| **Phase 8** | `test-phase8-entity-resolution.mjs` | 30 | **PASS** (30/30) |
| **Phase 8B** | `test-phase8b-reconciliation.mjs` | 18 | **PASS** (18/18) |
| **Phase 9** | `test-phase9-evidence-relevance.mjs` | 70 | **PASS** (70/70) |
| **Phase 10** | `test-phase10-website-integration.mjs` | 9 | **PASS** (9/9) |
| **Phase 11** | `test-phase11-contact-enrichment.mjs` | 55 | **PASS** (55/55) |
| **Phase 12** | `test-phase12-advanced-qualification.mjs` | 60 | **PASS** (60/60) |
| **Phase 13** | `test-phase13-geographic-expansion.mjs` | 80 | **PASS** (80/80) |
| **Phase 14** | `test-phase14-unified-architecture.mjs` | 100 | **PASS** (100/100) |
| **Phase 15** | `test-phase15-ui-ux.mjs` | 125 | **PASS** (125/125) |
| **Phase 16** | `test-phase16-persistence-export.mjs` | 142 | **PASS** (142/142) |
| **Grand Total** | **Entire Test Suite** | **840** | **840 PASS / 0 FAIL** |

---

## Q. Synthetic Performance & Memory Benchmarks

Measured on local test runtime:

| Benchmark Operation | Dataset Size | Measured Duration | Throughput / Rate | Heap Delta |
|---|:---:|:---:|:---:|:---:|
| **Candidate Record Write** | 1,000 records | 24.3 ms | 41,152 writes/sec | +0.48 MB |
| **Entity Record Upsert** | 1,000 records | 28.1 ms | 35,587 upserts/sec | +0.52 MB |
| **Evidence Record Write** | 1,000 records | 22.9 ms | 43,668 writes/sec | +0.41 MB |
| **Record Retrieval** | 1,000 records | 11.2 ms | 89,285 reads/sec | +0.12 MB |
| **Full Run Load** | 1,000 entities | 18.7 ms | 53,475 entities/sec | +0.89 MB |
| **Scale Load Test** | 5,000 records | 76.4 ms | 65,445 records/sec | +3.12 MB |
| **Checkpoint Create + Commit** | 100 checkpoints | 14.8 ms | 6,756 checkpoints/sec | +0.18 MB |
| **Checkpoint Restore** | 100 checkpoints | 9.5 ms | 10,526 restores/sec | +0.09 MB |
| **Export Projection Generation**| 1,000 records | 19.4 ms | 51,546 records/sec | +1.04 MB |
| **CSV Serialization (Safe)** | 1,000 records | 6.8 ms | 147,058 records/sec | +0.62 MB |
| **JSON Serialization (Sorted)**| 1,000 records | 12.1 ms | 82,644 records/sec | +0.95 MB |
| **Repeated Write/Read Cycle** | 500 cycles | 31.6 ms | 15,822 cycles/sec | +0.00 MB |

*Note: Benchmarks reflect local synthetic execution on Node.js / V8 extension runtime. No claims of browser-wide or production-scale limits are made without real-world workload profiling.*

---

## R. Security & Invariant Verification

1. **Frozen File Protection:**
   - No modifications made to frozen Meta production modules (`src/extension/metaAdLibraryExtractor.ts`), frozen manifest (`manifest.json`), or release distribution archives (`dist/leadnoria-v1.0.0.zip`).
   - Release archive SHA-256 hash remains intact (`bbb3d9f1...`).
2. **Google Maps Contract Enforcement:**
   - Google Maps remains strictly `CONTRACT_ONLY`.
   - Zero live DOM extraction, network scraping, or unauthorized APIs introduced.
3. **Export Firewall Security:**
   - Developer shortcuts like raw JSON serialization of internal unified records are categorically prohibited.
   - All exports flow through the `ExportManager` and `ExportPolicyEvaluator`.
   - Restricted Google-derived facts can never be exported even when combined into mixed entities.
4. **Anti-Injection:**
   - Prompt injection text stored in candidate names or descriptions is treated strictly as passive string data.
   - CSV formula injection characters are neutralized.
   - HTML and script tags are escaped; `javascript:`, `data:`, and `blob:` schemes are categorically rejected.
5. **Zero New Chrome Permissions:**
   - Extension manifest permissions remain strictly identical to Phase 15.

---

## S. Known Limitations & Scope Boundaries

1. **Storage Limits in Browser:** Extension storage via `chrome.storage.local` has standard browser quota limits (typically 10 MB default or unbounded if `unlimitedStorage` is granted). LeadNoria enforces explicit internal caps and pruning to operate safely within default browser storage budgets without requiring extra invasive permissions.
2. **Single-Node Local Persistence:** Persistence is strictly local to the user's browser installation. Cross-device syncing is intentionally excluded to preserve privacy and source restrictions.
3. **CONTRACT_ONLY Sources:** Google Maps records exist purely as contract-based mock fixtures and geographic plans; live execution is disabled by design.

---

## T. Final Gate Conclusion

- **Phase 16 Test Suite:** 142 / 142 PASS (100%)
- **Phases 5–15 Regressions:** 679 / 679 PASS (100%)
- **Post-Freeze V1.0 Verification:** 19 / 19 PASS (100%)
- **Total Tests Passing:** 840 / 840 PASS (100%)
- **TypeScript (`npx tsc --noEmit`):** 0 errors
- **Production Build (`node scripts/build-extension.mjs`):** Clean build succeeded

```
==================================================
FINAL STATUS = PASS — PHASE 16 COMPLETE
NEXT PHASE = PHASE 17 — SECURITY + REGRESSION + FULL E2E TESTING
==================================================
```
