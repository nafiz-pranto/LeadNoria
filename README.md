# LeadNoria

> **Discover. Verify. Connect.**  
> Business lead research from real public signals — built as a Manifest V3 Chrome Extension.

[![Version](https://img.shields.io/badge/version-1.3.0-blue)](RELEASE-NOTES-v1.3.0.md)
[![Previous](https://img.shields.io/badge/version-1.2.1-gray)](RELEASE-NOTES-v1.2.1.md)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](#testing)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)
[![Manifest](https://img.shields.io/badge/Manifest-V3-orange)](extension/manifest.json)

---

## What is LeadNoria?

LeadNoria is a **Chrome Extension** that researches business leads by collecting, verifying, and qualifying commercial signals from public sources — entirely within the user's browser, without any third-party servers or proprietary APIs.

It automates a multi-stage research pipeline:

1. **Source Planning** — determines which sources to query and in what mode
2. **Source Execution** — collects candidate business records from supported sources
3. **Normalization** — normalizes raw signals into a consistent structured format
4. **Entity Resolution** — deduplicates candidates into canonical business entities
5. **Evidence Collection** — gathers corroborating evidence facts per entity
6. **Relevance Scoring** — evaluates entity relevance against query intent
7. **Website Verification** — verifies target domain presence and live HTTP signals
8. **Contact Enrichment** — extracts phone, email, address, and social links
9. **Qualification** — scores entities against commercial qualification criteria
10. **Geographic Accounting** — tracks coverage and saturation by area
11. **Persistence** — durably stores run state, entities, and checkpoints
12. **Production Analytics** — calculates local run-level quality, coverage, contactability, and comparative insights
13. **Export** — exports qualified leads as CSV or JSON with field-level policy enforcement

---

## Current Version

| Property | Value |
|---|---|
| **Version** | `1.3.0` |
| **Build** | Production Verified Release Candidate (Phase 30 Analytics) |
| **Manifest Version** | Manifest V3 |
| **Release Artifact** | `dist/leadnoria-v1.3.0.zip` |
| **Artifact SHA-256** | `ff05215288e3723367ed8951fc16bb674ec323deaf5a2fb3cfb590a14edb0df2` |
| **Manifest SHA-256** | `af78fd566c5a2ab3211d96509dcf2e96a69280af7262dd37e769d707287742ef` |
| **Total Tests** | 2,230 across 22 suites (all passing) |
| **Historical Baseline** | `1.2.1` (`dist/leadnoria-v1.2.1.zip` - SHA `1c1327049ae85c47...`, immutable) |

See [RELEASE-NOTES-v1.3.0.md](RELEASE-NOTES-v1.3.0.md) and historical [RELEASE-NOTES-v1.2.1.md](RELEASE-NOTES-v1.2.1.md) for full release notes and changelog.

---

## Major Capabilities

### Multi-Source Research Pipeline
- **Meta Ad Library** — extracts public commercial advertiser signals (business name, website, category, ad creative text) from `facebook.com/ads/library`
- **Website Verification** — user-directed target domain verification with HTTP probing, domain matching, and contact form detection
- **User-Provided Input** — accepts manual domain seeds or business records directly from the user
- **Geographic Planning** — plans and tracks search coverage by country, region, city, and district

### Entity Resolution & Deduplication
- Cross-source entity deduplication using multi-signal fingerprinting
- Transitive conflict resolution with explicit winner selection
- Provenance-tagged field contributions (`META_DERIVED`, `WEBSITE_DERIVED`, `MIXED`)

### Field-Level Export Policy Firewall
- Every field is individually evaluated against export eligibility rules before inclusion in export output
- Restricted fields are redacted from CSV/JSON output — never leaked
- Export records are deterministic (bit-for-bit identical SHA-256 on repeated export)

### Durable State & Recovery
- Two-phase commit checkpoint system: `STAGED` → `COMMITTED`
- SHA-256 checksum integrity validation on every checkpoint read
- Automatic recovery of interrupted pipeline runs from the last valid committed checkpoint
- Bounded checkpoint retention (10 per run) to prevent storage quota exhaustion

### Security Controls
- Formula injection defense in CSV export (`=`, `+`, `-`, `@` prefix neutralization)
- XSS prevention via `escapeHtml()` on all source-provided text
- URL protocol allowlist (`http:` and `https:` only; blocks `javascript:`, `data:`, `blob:`, etc.)
- Prototype pollution protection in canonical JSON serialization
- No external API calls, no telemetry, no server-side processing

---

## ⚠️ Google Maps: CONTRACT_ONLY Limitation

> **IMPORTANT — Read before use.**

LeadNoria supports Google Maps as a **source type for planning, dry-run, and geographic structuring only**.

**Live extraction from Google Maps (consumer web) is strictly prohibited** under Google's Terms of Service. The `GoogleMapsUnifiedAdapter` enforces this at the code level:

```typescript
async executeLive(_config: any): Promise<CandidateEnvelope[]> {
  throw new Error(
    'Google Maps execution is CONTRACT_ONLY. Live extraction, DOM scraping, and network calls are strictly prohibited.'
  );
}
```

Any attempt to call `executeLive()` on the Google Maps adapter will throw a `CONTRACT_ONLY` error immediately. This is **not configurable** and cannot be bypassed.

Fields derived from Google Maps consumer web data are tagged `GOOGLE_DERIVED` and are permanently blocked from export with reason `GOOGLE_CONSUMER_WEB_RESTRICTED`.

---

## Project Architecture

```
leadnoria/
├── src/extension/              # All TypeScript source modules
│   ├── pipeline/               # Multi-source adapter registry & pipeline orchestration
│   │   ├── sourceAdapter.ts    # Meta, GoogleMaps, Website, UserProvided adapters
│   │   ├── sourceRegistry.ts   # UnifiedSourceAdapterRegistry
│   │   ├── sourcePlan.ts       # Canonical source planning
│   │   └── pipelineTypes.ts    # Shared pipeline type contracts
│   ├── extraction/             # Raw candidate extraction types & normalization
│   ├── resolution/             # Entity deduplication & conflict resolution
│   ├── relevance/              # Evidence waterfall & relevance scoring
│   ├── enrichment/             # Contact & website enrichment
│   ├── qualification/          # Commercial qualification engine
│   ├── geography/              # Geographic planning, saturation, & coverage
│   │   ├── saturationEngine.ts # Multi-scope saturation with false-saturation protection
│   │   └── searchUnitPlanner.ts
│   ├── persistence/            # Storage, recovery, & audit
│   │   ├── checkpointStore.ts  # Two-phase commit checkpoints with SHA-256 integrity
│   │   ├── recoveryManager.ts  # Interrupted run resumption planner
│   │   ├── persistenceRepository.ts # Typed repository over partitioned collections
│   │   ├── retentionManager.ts # Storage compaction with retention policies
│   │   ├── recordValidator.ts  # Pre-write & post-read validation
│   │   └── storageAdapter.ts   # MemoryStorageAdapter + ChromeStorageAdapter
│   ├── export/                 # Export policy, projection, CSV, JSON
│   │   ├── exportPolicy.ts     # Field-level export firewall
│   │   ├── csvExporter.ts      # RFC-4180 CSV with formula injection defense
│   │   └── exportManager.ts    # Export orchestrator with audit logging
│   └── ui/                     # Chrome Extension UI (React/TSX compiled to JS)
│       ├── App.tsx             # Root application with state machine
│       ├── viewModelMappers.ts # Domain → UI view model mappers
│       ├── security.ts         # XSS escaping & safe URL validation
│       └── components/         # Reusable UI component library
├── extension/                  # Compiled & packaged Chrome extension
│   ├── manifest.json
│   ├── app.js                  # Compiled bundle
│   ├── popup.html
│   └── sidepanel.html
├── tests/                      # Full test suites (Phases 5–18 + Post-Release Audit)
├── scripts/                    # Build, verification, regression runner
├── dist/                       # Release archives
│   ├── leadnoria-v1.0.0.zip    # Frozen historical baseline
│   ├── leadnoria-v1.1.0.zip    # Historical release archive
│   ├── leadnoria-v1.2.0.zip    # Preserved previous release candidate
│   └── leadnoria-v1.2.1.zip    # Current production release
└── docs/                       # Engineering phase reports & release documentation
```

---

## Installation

### Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x
- **Google Chrome** or **Microsoft Edge** (Chromium-based)

### 1. Clone the repository

```bash
git clone https://github.com/nafiz-pranto/LeadNoria.git
cd LeadNoria
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the extension

```bash
node scripts/build-extension.mjs
```

This compiles all TypeScript source, bundles the extension via Vite, and packages the output into:
- `extension/` — unpacked extension directory (load directly into Chrome)
- `extension.zip` — distributable archive
- `dist/leadnoria-v1.2.1.zip` — production release archive

### 4. Load into Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` directory from this repository

### 5. Use the release archive

A pre-built release archive is available at `dist/leadnoria-v1.2.1.zip`.  
SHA-256: `1c1327049ae85c47e77015e6dadd1bf1c9c31924613807efbfebc942b5ee0419`

---

## Testing

LeadNoria has **1,890 automated checks and assertions** across 20 suites covering all phases from extraction through production pilot and release operations.

### Run all tests

```bash
node scripts/run-all-regressions.mjs
```

### Run a specific suite

```bash
node --import tsx tests/test-phase16-persistence-export.mjs
node --import tsx tests/test-post-release-audit.mjs
```

### Test suites

| Suite | Tests | Coverage |
|---|---|---|
| Post-Freeze V1.0 Verification | 19 | Baseline regression |
| Phase 5: Extraction & Normalization | 45 | Raw signal normalization |
| Phase 6: Website Qualification | 50 | Domain verification |
| Phase 7: Google Maps Normalization | 37 | CONTRACT_ONLY adapter |
| Phase 8: Entity Resolution | 30 | Deduplication |
| Phase 8B: Transitive Conflict Resolution | 18 | Multi-source merging |
| Phase 9: Evidence Relevance Waterfall | 70 | Relevance scoring |
| Phase 10: Website Integration | 9 | HTTP verification |
| Phase 11: Contact Enrichment | 55 | Phone/email extraction |
| Phase 12: Advanced Qualification | 60 | Commercial scoring |
| Phase 13: Geographic Expansion | 80 | Coverage & saturation |
| Phase 14: Unified Multi-Source Arch | 100 | Pipeline orchestration |
| Phase 15: UI/UX & ViewModels | 125 | UI state mapping |
| Phase 16: Persistence, Recovery & Export | 142 | Checkpoint & storage |
| Phase 17: Security + Full E2E | 210 | Security & integration |
| Phase 18: Final Production Audit | 157 | Full system audit |
| Post-Release Full-System Audit | 63 | 30 E2E + adversarial |
| **Total** | **1,270** | |

### Typecheck

```bash
node node_modules/typescript/bin/tsc --noEmit
```

---

## Required Permissions

The extension declares the minimum necessary permissions:

| Permission | Purpose |
|---|---|
| `storage` | Persist run state, entities, and checkpoints locally |
| `tabs` | Detect active Meta Ad Library tab |
| `scripting` | Inject content script into Ad Library pages |
| `sidePanel` | Display the research side panel |

**Host permissions** are strictly bounded to:
- `https://www.facebook.com/ads/library/*`
- `https://web.facebook.com/ads/library/*`

**Optional host permissions** (`https://*/*`) are requested only when the user initiates website verification for a specific target domain.

---

## Release Notes

- [v1.1.0](RELEASE-NOTES-v1.1.0.md) — Post-Release Audit Build: 5 bugs fixed, full 18-phase pipeline, 1,270 tests passing
- [v1.0.0](RELEASE-NOTES-v1.0.0.md) — Initial production release

---

## Engineering Documentation

| Document | Description |
|---|---|
| [LEADNORIA-POST-RELEASE-FULL-AUDIT.md](LEADNORIA-POST-RELEASE-FULL-AUDIT.md) | Complete post-release audit report (30 E2E + adversarial) |
| [LEADNORIA-RELEASE-METADATA.json](LEADNORIA-RELEASE-METADATA.json) | Machine-readable release metadata & test accounting |
| [LEADNORIA-RELEASE-SHA256.txt](LEADNORIA-RELEASE-SHA256.txt) | SHA-256 checksums for all release artifacts |
| [LEADNORIA-FINAL-PRODUCTION-AUDIT.md](LEADNORIA-FINAL-PRODUCTION-AUDIT.md) | Phase 18 final production audit |
| [LEADNORIA-V1.1-REGRESSION-CONTRACT.md](LEADNORIA-V1.1-REGRESSION-CONTRACT.md) | v1.1 regression change guard |
| Phase reports (LEADNORIA-GOOGLE-MAPS-PHASE*.md) | Per-phase engineering decisions and results |

---

## License

MIT — see [LICENSE](LICENSE) if present, or contact the repository owner.

---

## Author

**Nafiz Pranto** — `pranto.mdnafiz@gmail.com`

Built with TypeScript, Vite, React, and the Chrome Extensions Manifest V3 platform.
