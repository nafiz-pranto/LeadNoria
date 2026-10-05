# LeadNoria — Authoritative V2 Architecture Specification

**Status:** Certified & Frozen  
**Baseline Version:** LeadNoria v1.5.0  
**Architecture Generation:** V2 Unified Lead Intelligence & Reliability Pipeline  
**Runtime Environment:** Google Chrome Extension (Manifest V3)  

---

## 1. System Overview

LeadNoria is a client-side Chrome Extension designed to research, verify, corroborate, and qualify commercial business leads using publicly observable web signals. It operates 100% locally within the user's browser, eliminating remote server dependencies, cloud telemetry, and third-party tracking services.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 LEADNORIA V2 RUNTIME                                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [UI Layer: Side Panel & Popup] (React 19, Tailwind CSS, Recharts)                    │
│    ├── Research & Query Planning                                                       │
│    ├── Interactive Results & Drawers                                                   │
│    ├── Production Intelligence Analytics                                               │
│    ├── Research Optimization & Saturation Intelligence                                │
│    ├── Diagnostics & Reliability Center                                                │
│    └── Local Storage Management                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [Pipeline & Core Subsystems]                                                          │
│    ├── Source Planning & Execution (Meta Browser Acquisition, Google Contract Adapter) │
│    ├── Geographic Planning & Spatial Coverage                                          │
│    ├── Normalization & Data Cleansing                                                  │
│    ├── Deterministic Entity Resolution (canonicalEntityId)                             │
│    ├── Public Website Intelligence Engine (Same-Origin Bounded Crawler)                │
│    ├── Contact & Public Person Corroboration Engine                                    │
│    ├── Commercial Intent Qualification Engine (Multi-Factor Reason Graph)              │
│    ├── Production Analytics Engine (Run-Level Distribution & Quality)                  │
│    ├── Research Optimization Engine (Search Unit Yield, Coverage, Saturation)          │
│    ├── Production Reliability Engine (Fingerprinting, Taxonomy, Diagnostics Store)     │
│    └── Compliance Export Firewall (RFC-4180 Escaped Projections)                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [Persistence Subsystem]                                                               │
│    └── StorageAdapter (Chrome Storage Local / Extension Storage Subsystem)             │
│          ├── research_history (Max 100 runs)                                           │
│          ├── checkpoints (Max 10 active states)                                        │
│          ├── analytics_snapshots (Max 20 snapshots)                                    │
│          ├── research_optimization_snapshots (Max 20 snapshots)                        │
│          └── diagnostic_issues_v1 (Max 100 issues, deterministic pruning)              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authoritative Module Inventory

### 2.1 Acquisition Subsystem
* **Meta Browser Acquisition (`src/extension/sources/meta/`):**
  * *Status:* **PRODUCTION**
  * *Capabilities:* Injects non-intrusive extraction logic into public Meta Ad Library pages (`facebook.com/ads/library`). Extracts public advertiser identities, active ad creative texts, categories, reported business websites, and public telephone numbers.
* **Google Contract Adapter (`src/extension/sources/google/`):**
  * *Status:* **CONTRACT_ONLY / INTERNAL EXPERIMENTAL**
  * *Capabilities:* Schema translation and mock/dry-run fixtures for contract compliance. **Strictly prohibited from live consumer scraping.** Lineage is flagged `hasGoogleConsumerWebLineage: true` and quarantined from export and persistent lead storage.

### 2.2 Geographic Planning & Accounting (`src/extension/geo/`)
* *Status:* **PRODUCTION**
* *Capabilities:* Manages hierarchical administrative units (`Country` $\rightarrow$ `Region` $\rightarrow$ `City` $\rightarrow$ `District`). Deconstructs queries into deterministic `SearchUnit` coordinates, avoiding redundant spatial overlap and providing coverage metrics.

### 2.3 Normalization Subsystem (`src/extension/normalization/`)
* *Status:* **PRODUCTION**
* *Capabilities:* Cleanses raw text strings, standardizes phone formats (E.164 / national variants), parses domain tokens, canonicalizes street addresses, and strips ephemeral noise without dropping unparsed fallback values.

### 2.4 Entity Resolution Subsystem (`src/extension/entityResolution/`)
* *Status:* **PRODUCTION**
* *Capabilities:* Deduplicates candidate leads across multiple public observations into single canonical entities identified by deterministic `canonicalEntityId` (Phase 8 authority). Resolves entity splits/joins using string distance thresholds, domain matching, and shared phone numbers.

### 2.5 Public Website Intelligence Engine (`src/extension/website/`)
* *Status:* **PRODUCTION**
* *Capabilities:* User-directed, client-side same-origin web crawler. Verifies live domain HTTP presence, detects TLS configurations, extracts public contact forms, email addresses, phone numbers, public personnel, digital technologies (CMS, booking, ecommerce, analytics), and business services. Enforces strict bounds: max 5 pages, 10s page timeout, 30s domain timeout, 500 KB document payload limit.

### 2.6 Contact & Person Intelligence (`src/extension/contacts/`)
* *Status:* **PRODUCTION**
* *Capabilities:* Corroborates contact references against primary identity signals. Tracks individual field provenance, cross-source contradiction flags, and observation timestamps. Extracts named public representatives and corporate roles without scraping restricted personal directories.

### 2.7 Commercial Qualification Engine (`src/extension/qualification/`)
* *Status:* **PRODUCTION**
* *Capabilities:* Evaluates leads against explicit multi-factor qualification criteria (advertising intensity, active web presence, contactability, business completeness) to generate deterministic states: `QUALIFIED`, `NOT_QUALIFIED`, `UNCERTAIN`, or `BLOCKED`. Emits transparent reason graphs explaining every criterion outcome. Zero black-box scoring.

### 2.8 Lead Intelligence & Assembly (`src/extension/leadIntelligence/`)
* *Status:* **PRODUCTION**
* *Capabilities:* Assembles multi-source signals into the authoritative `CanonicalLeadRecord` envelope. Governs source attribution, conflict resolution, freshness tracking, quality completeness scoring, and compliance policy flags.

### 2.9 Production Analytics Subsystem (`src/extension/analytics/`)
* *Status:* **PRODUCTION**
* *Capabilities:* Calculates local run-level quality distributions, contactability ratios, source attribution splits, website verification rates, and qualification outcomes. Enables side-by-side run comparisons without remote telemetry.

### 2.10 Research Optimization Subsystem (`src/extension/optimization/`)
* *Status:* **PRODUCTION**
* *Capabilities:* Observational optimization engine evaluating search unit performance, observed spatial coverage, saturation states (`UNEXPLORED`, `EARLY_DISCOVERY`, `SATURATING`, `SATURATED`), marginal yield trends, and duplicate acquisition pressure. Generates explainable, rule-based recommendations. Zero predictive conversion modeling.

### 2.11 Production Reliability Subsystem (`src/extension/reliability/`)
* *Status:* **PRODUCTION**
* *Capabilities:* Typed local issue capture (`ProductionIssue`), deterministic issue fingerprinting (`generateIssueFingerprint`), transparent 13-category error taxonomy (`ERROR_TAXONOMY`), quantitative reliability metrics (`runSuccessRate`, `recoveryRate`, p95 durations), operational guardrails, and sanitized reproduction package export.

### 2.12 Persistence Subsystem (`src/extension/persistence/`)
* *Status:* **PRODUCTION**
* *Capabilities:* Unified storage management via `StorageAdapter`. Enforces deterministic collection-specific retention rules:
  * Research History: Max 100 runs
  * Checkpoints: Max 10 checkpoints
  * Analytics Snapshots: Max 20 snapshots
  * Optimization Snapshots: Max 20 snapshots
  * Diagnostic Issues: Max 100 entries (pruned by frequency and recency)

### 2.13 Compliance Export Firewall (`src/extension/export/`)
* *Status:* **PRODUCTION**
* *Capabilities:* Enforces field-level export eligibility. Restricts unverified or contract-quarantined sources. Sanitizes CSV output against formula injection attacks (`=`, `+`, `-`, `@`) pursuant to RFC-4180.

### 2.14 User Interface (`src/extension/ui/`)
* *Status:* **PRODUCTION**
* *Capabilities:* Responsive dual-surface UI supporting Chrome Side Panel (100vh flex layout) and Popup (440x600 fixed). Features 5 primary navigation tabs: Research, Results, Analytics (including Research Optimization sub-dashboard), History, and Settings (including Diagnostics & Storage health center). Full WCAG AA accessibility.

---

## 3. Runtime Boundaries & Execution Modes

1. **Production Mode:**
   * Primary acquisition: Meta Ad Library.
   * Target verification: Public websites (user-directed).
   * Storage: Local browser storage (`chrome.storage.local`).
   * Analytics & Diagnostics: Local in-memory calculation.
2. **Contract / Internal Audit Mode:**
   * Google Maps: Fixture-based and contract-checked only. Live network requests to Google consumer web are blocked at the content-script and network boundary.
   * Telemetry: Disabled permanently across all modes. Zero exceptions.
