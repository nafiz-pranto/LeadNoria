# Changelog

All notable changes to the **LeadNoria** Chrome Extension are documented in this file.

## [1.3.0] - 2026-10-06

### Added
- **Production Intelligence Analytics Engine:** Local, deterministic analytics calculating run-level quality, geographic coverage, contactability rates, website verification statistics, qualification breakdowns, and source attribution (`src/extension/analytics/`).
- **Interactive Analytics UI (`AnalyticsView`):** Dedicated Analytics tab in extension navigation with stat cards, distribution charts, quality warnings, and side-by-side run comparison diffing.
- **Analytics Persistence:** Isolated collection persistence via storage adapters (`analytics_snapshots`) with automated run-linking and snapshot retrieval.

### Security & Governance
- **Zero Telemetry Guarantee:** 100% client-side calculation with zero remote analytics beacons, zero telemetry dependencies, and zero external tracking calls.
- **Zero Predictive Lead Scoring:** Bounded to mathematical aggregation of verified data; strictly prohibits opaque predictive buyer intent scoring.
- **Data Firewall Integrity:** Preserved `CONTRACT_ONLY` restriction for experimental Google Maps lineage and strict same-origin website safety boundaries.

---

## [1.2.1] - 2026-10-05

### Fixed
- **Contact Reference Array Evaluation:** Added defensive nullish checks on optional `emailRefs` and `phoneRefs` arrays in people profiles within `src/extension/qualification/businessIntelligence.ts`, resolving runtime `TypeError` on records with unpopulated people contact arrays.

### Packaging & Operations
- **Release Verification:** Verified fresh release candidate `dist/leadnoria-v1.2.1.zip` via isolated directory extraction and automated clean Chromium browser testing.
- **Repository Hygiene:** Whitelisted `v1.2.0` and `v1.2.1` release archives in `.gitignore`; synchronized license and release metadata.

---

## [1.2.0] - 2026-10-04

### Added
- **Unified Lead Intelligence:** Cross-source candidate assembly joining Meta commercial signals with target website intelligence facts under deterministic `canonicalEntityId`.
- **Public Website Intelligence Engine:** Bounded same-origin website crawler discovering public emails, phones, social links, and digital technology stacks (up to 5 pages, 10s page timeout, 30s domain timeout).
- **Explainable Qualification Engine:** Multi-factor commercial qualification with transparent reason graphs, freshness indicators, and conflict detection (`QUALIFIED`, `NOT_QUALIFIED`, `UNCERTAIN`, `BLOCKED`).
- **Responsive Dual UI:** Seamless support for Chrome Side Panel (100vh flex) and Extension Popup (440x600 fixed), featuring fluid multi-column sorting, row filtering, and drawer drill-down inspection.
- **Compliance Export Firewall:** Strict projection-based CSV/JSON export governed by `ExportPolicy`; spreadsheet formula injection neutralized via RFC-4180 escaping.
- **Production Pilot Validation:** Comprehensive 156-assertion pilot test suite covering live Meta workflows, load scaling (up to 5,000 leads), fault injection, and security boundaries.

---

## [1.1.0] - 2026-09-30

### Changed
- **Product Rebranding:** Official rebrand to LeadNoria with brand new icon assets and unified identity.
- **UI Scroll Discipline:** Resolved vertical scrolling defect in popup and side panel; added responsive flex scrolling containers and eliminated horizontal scroll traps.
- **Unified Source Planning:** Canonical source adapter registry separating production sources (Meta, Website) from contract-only planning sources (Google Maps).

---

## [1.0.0] - 2026-09-20 (Final Release Gate)

### Core Capabilities
- **Local Chrome Extension (MV3)**: Standalone Manifest V3 Chrome Extension operating purely locally via `chrome.tabs`, `chrome.scripting`, `chrome.storage.local`, and `chrome.sidePanel`.
- **Public Meta Ad Library Automation**: Automated public search URL construction, page navigation, rendered DOM card detection, and adaptive infinite scroll continuation.
- **Deterministic Lead Relevance Engine (Strategy v1)**:
  - Local, explainable, rule-based classification replacing blind card acceptance.
  - Multi-tiered scoring evaluating advertiser name, ad copy catalog terms, destination domain context, and commercial CTAs.
  - Negative conflict penalties rejecting sports clubs, healthcare clinics, gaming ads, and non-target industry advertisers.
  - Entity-level multi-ad aggregation ensuring high catalog coverage while preserving zero false positives.
- **Identity Resolution & Deduplication**:
  - Automatically merges multiple ad cards from identical advertisers.
  - Accumulates active ad counts and aggregates observed ad library IDs.
  - Preserves multi-keyword associations without inflating lead counts.
- **Accurate Detection & Quota Discipline**:
  - Strictly distinguishes `found` vs `not_found` states for Facebook Pages and destination websites.
  - Decodes Facebook link shims (`l.facebook.com/l.php?u=...`).
  - Quota tracks unique relevant leads; dynamically continues scrolling until target quota is reached or results are exhausted.
  - Accurate operational stop reasons: `TARGET_REACHED`, `SOURCE_EXHAUSTED`, `NO_NEW_RESULTS`, `USER_CANCELLED`, `BLOCKED`, `FATAL_ERROR`.
- **Formula-Safe CSV & JSON Export**:
  - Full RFC-4180 compliance with injection defense against `=, +, -, @, \t, \r`.
  - Transparent export of relevance decisions, scores, confidence levels, and active ad metrics.
- **Distribution Packages**:
  - Unpacked build directory in `./extension`.
  - Production distribution archive in `./extension.zip` and `./dist/leadnoria-v1.0.0.zip`.
  - Non-technical installation guide in `INSTALL_GUIDE.md`.
