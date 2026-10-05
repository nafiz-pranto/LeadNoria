# LeadNoria — Data Provenance & Domain Contract Registry

**Status:** Certified & Frozen  
**Baseline Version:** LeadNoria v1.5.0  
**Scope:** Data Flow, Lineage Lifecycle, Domain Model Ownership, and Anti-Laundering Rules  

---

## 1. Frozen Domain Contracts

| Model Name | Primary Purpose | Authoritative Owner | Allowed Producers | Allowed Consumers | Persistence State | Export State | Mutation Rules |
|---|---|---|---|---|---|---|---|
| **`CanonicalLeadRecord`** | Core canonical entity representing a verified business lead | `src/extension/leadIntelligence/` | `RecordAssembler` | UI components, Export engine, Analytics, StorageAdapter | Persistable if `policy.persistenceEligible = true` | Exportable if `policy.exportEligible = true` | Immutable once assembled; enrichment fields appended via functional transforms |
| **`CandidateEnvelope`** | Raw extracted candidate from an individual source observation | `src/extension/sources/` | Source adapters (`MetaAcquisition`, `GoogleAdapter`) | Normalization, Entity Resolution | Transient in-memory; serialized only in checkpoint states | Non-exportable directly | Read-only wrapper over raw source payload |
| **`UnifiedResearchRecord`** | Intermediate merged representation prior to final intelligence assembly | `src/extension/entityResolution/` | `EntityGraphResolver` | `RecordAssembler` | In-memory pipeline transition | Non-exportable directly | Mutable during candidate clustering and deduplication |
| **`SearchUnit`** | Discrete geographic search coordinate with saturation metadata | `src/extension/geo/` | `GeographicPlanner` | Source Planner, Analytics, Optimization | Persisted within run metadata | Included in aggregate run export summary | Read-only coordinates; counters updated upon run completion |
| **`RunAnalyticsSnapshot`** | Aggregate metrics, distributions, and contactability rates for a run | `src/extension/analytics/` | `AnalyticsEngine` | AnalyticsView, HistoryView | Persisted in `analytics_snapshots` (Max 20) | Exportable as JSON summary | Deterministic snapshot calculated once at run completion |
| **`ResearchOptimizationSnapshot`** | Saturation state, marginal yield curves, and search unit rankings | `src/extension/optimization/` | `OptimizationEngine` | ResearchOptimizationView | Persisted in `research_optimization_snapshots` (Max 20) | Exportable as JSON summary | Derived across historical runs; immutable per snapshot |
| **`ProductionIssue`** | Local diagnostic record of an operational fault or warning | `src/extension/reliability/` | Reliability Engine, Classifiers | DiagnosticsView, DiagnosticsRepository | Persisted in `diagnostic_issues_v1` (Max 100) | Exportable as sanitized reproduction package | `resolutionState` mutable via user action; fingerprints immutable |
| **`ExportPolicy`** | Rules governing projection, column sanitization, and lineage filtering | `src/extension/export/` | `ExportGovernor` | UI export triggers | Static configuration | Meta-contract | Frozen configuration; changes require semver major update |
| **`PersistencePolicy`** | Rules governing storage quotas, collection caps, and pruning logic | `src/extension/persistence/` | `StorageAdapter` | Chrome storage wrappers | Static configuration | Meta-contract | Frozen configuration; strictly enforces bounded retention |
| **`QualificationProfile`** | Evaluative thresholds and weights for commercial qualification | `src/extension/qualification/` | `QualificationEngine` | Pipeline stages | Static profile definition | Exportable as configuration | Read-only rules evaluated against observable signals |

---

## 2. End-to-End Source-to-Output Lineage Map

```
[Public Source: Meta Ad Library]
       │
       ▼ (Extracts raw ad text, business name, category, website, phone)
[CandidateEnvelope]
       │
       ▼ (Cleanses phone, canonicalizes domains, normalizes address tokens)
[Normalization Pipeline]
       │
       ▼ (Deduplicates via canonicalEntityId, clusters aliases, detects conflicts)
[Entity Resolution Subsystem]
       │
       ▼ (Initial CanonicalLeadRecord assembled with provenance tags)
[Lead Intelligence Assembly] ◄──────┐
       │                             │
       ▼                             │
[Public Website Intelligence] ───────┤ (Injects live HTTP facts, CMS, contact forms, emails)
       │                             │
       ▼                             │
[Contact & Person Corroboration] ────┘ (Corroborates contacts, links public executives)
       │
       ▼ (Evaluates commercial criteria, generates transparent reason graph)
[Commercial Qualification Engine]
       │
       ▼ (Calculates distributions, contactability, and quality indices)
[Production Analytics Subsystem]
       │
       ▼ (Evaluates saturation, marginal yield, and search unit performance)
[Research Optimization Subsystem]
       │
       ▼ (Renders responsive side panel & popup tables, stat cards, and drawers)
[User Interface (UI Layer)]
       │
       ├──► [Durable Storage (StorageAdapter)]
       │      ├── research_history (Max 100 runs)
       │      ├── analytics_snapshots (Max 20)
       │      ├── research_optimization_snapshots (Max 20)
       │      └── diagnostic_issues_v1 (Max 100)
       │
       └──► [Compliance Export Firewall]
              ├── CSV Export (Formula-injection mitigated, Google fields dropped)
              └── JSON Export (Restricted records quarantined)
```

---

## 3. Data Transformation & Field Lineage Rules

1. **Meta Signal Ingestion:**
   * Business name, reported website URL, reported phone number, ad copy tokens, active ad counts, observed timestamps.
   * Transformation: Raw strings trimmed, whitespace collapsed, URLs protocol-checked.
2. **Website Signal Enrichment:**
   * Live domain status, CMS, ecommerce indicators, verified email addresses, verified telephone numbers, public team members.
   * Transformation: Discovered emails checked against RFC-5322 regex; phone numbers normalized to standard dialable patterns.
3. **Qualification Projection:**
   * Inputs: Advertising status, verified domain presence, available contact channels.
   * Output: `finalState` (`QUALIFIED`, `NOT_QUALIFIED`, `UNCERTAIN`, `BLOCKED`) and explainable criterion breakdown.
4. **Export Projection Firewall:**
   * Fields permitted in CSV: `entityId`, `businessName`, `category`, `website`, `phone`, `email`, `city`, `country`, `qualificationState`, `freshnessState`, `corroborationCount`.
   * Prohibited: Internal graph node IDs, unverified raw scraped HTML dumps, and any fields with Google Maps lineage.

---

## 4. Anti-Laundering & Lineage Firewall Rules

* **Rule 1 (Taint Propagation):** If any candidate contributing to a canonical entity contains Google Maps or restricted consumer-web lineage, the entire entity is permanently tagged `isRestricted: true` and `policy.exportEligible: false`.
* **Rule 2 (No Unrestricted Merging):** An entity cannot lose restricted status through subsequent enrichment from Meta or public website sources.
* **Rule 3 (Export Barrier):** The Export Governor checks `isExportable` and `isRestricted` on each individual record before writing to the output stream. Non-compliant records are omitted.
* **Rule 4 (Diagnostics Isolation):** Diagnostics packages and issue fingerprints are derived only from error codes, workflow stages, and sanitized message templates. Zero business lead payloads are serialized into diagnostic packages.
