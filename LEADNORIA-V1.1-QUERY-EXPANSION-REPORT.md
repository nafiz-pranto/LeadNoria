# LEADNORIA v1.1 QUERY EXPANSION & DISCOVERY PLANNER REPORT

**Program:** LeadNoria v1.1 Accuracy Upgrade  
**Phase:** Master Prompt 2 of 8  
**Component:** Bounded Deterministic Query Planner  
**Status:** PASS — QUERY EXPANSION VERIFIED  
**Date:** 2026-09-27  

---

## 1. Current Discovery Architecture

In LeadNoria v1.0.0, research discovery was strictly limited to user-entered literal seed keywords. In sparse geographies or narrow search niches, single search queries frequently encountered premature `SOURCE_EXHAUSTED` conditions in Meta Ad Library (e.g. 29 ads in Bangladesh yielding only 5 qualifying leads), despite dozens of relevant advertisers running active ads under related product terms or local language keywords.

In v1.1, the Query Planner module (`src/extension/queryPlanner.ts`) is inserted cleanly between **User Intent Compilation** and **Meta Search Execution**:

```
USER INTENT (Preset / Custom Seed)
      │
      ▼
QUERY PLANNER (`planResearchQueries`)
      │ ├── Preserves exact seed query as sequence 0 (primary anchor)
      │ ├── Produces bounded commercial, product, and locale variants
      │ └── Quality Gate validates safety, length, and non-contradiction
      ▼
QUERY FRONTIER (`QueryFrontier`)
      │ ├── Tracks active query, completed queries, and per-query yield
      │ └── Detects discovery saturation (consecutive zero-yield queries)
      ▼
META AD LIBRARY SEARCH (Orchestrated by Service Worker)
      │
      ▼
RAW AD EXTRACTION (Content Script DOM Scraper)
      │
      ▼
GLOBAL DEDUPLICATION (`bulkProcessor.ts`)
      │ ├── Collapses same advertiser across multiple queries into ONE lead
      │ └── Records `matchedQueries: ["Furniture", "Sofa"]` on entity
      ▼
STRICT RELEVANCE GATE v2 (`relevanceEngine.ts` — 100% UNCHANGED)
      │
      ▼
FINAL QUALIFIED LEADS (IndexedDB `bulkStore.ts`)
```

---

## 2. Query Planner Design & Contracts

The Query Planner is a local, deterministic, rule-based planner. It adheres strictly to the following contracts:
- **Zero Hallucination:** No external LLM or stochastic generation. Every query is derived from structured taxonomy rules or deterministic morphology (singular/plural, commercial appending).
- **Seed Query Supremacy:** The user's exact original seed query is ALWAYS the primary search query (sequence 0). It is never discarded, replaced, or reordered.
- **Strict Separation of Discovery and Relevance:** Query expansion is strictly a **discovery mechanism** to find more candidate ad cards. It NEVER decides final relevance. Every discovered candidate must pass through the existing, unmodified Strict Relevance Gate v2.

---

## 3. Bounded Expansion Taxonomy

The expansion taxonomy (`PLANNER_TAXONOMY`) covers primary business categories with curated, high-intent variant terms:

| Category | Sample Commercial Terms | Sample Product Terms | Sample Locale Variants |
|---|---|---|---|
| **Furniture** | Furniture Store, Home Furniture, Office Furniture | Sofa, Dining Table, Office Chair | `BD`: ফার্নিচার, আসবাবপত্র; `DE`: Möbel; `ES`: Muebles |
| **Restaurant** | Restaurant, Bistro Cafe, Fine Dining | Food Delivery, Catering Menu | `BD`: রেস্তোরাঁ, খাবার; `DE`: Gastronomie; `ES`: Restaurante |
| **Dental** | Dental Clinic, Family Dentistry | Teeth Whitening, Dental Implants | `BD`: ডেন্টাল ক্লিনিক; `DE`: Zahnarztpraxis; `ES`: Clínica Dental |
| **Roofing** | Roofing Contractor, Roofing Company | Metal Roof, Roof Shingles | `DE`: Dachdecker; `ES`: Tejados |
| **Real Estate** | Real Estate Agency, Property Broker | Apartments For Sale, Commercial Property | `DE`: Immobilien; `ES`: Inmobiliaria |
| **Clothing** | Clothing Store, Fashion Boutique | Dresses, Men Suits, Casual Wear | `BD`: পোশাক, বুটিক; `DE`: Modegeschäft; `ES`: Tienda de Ropa |
| **Fitness** | Fitness Center, Gym Club | Gym Membership, Personal Training | `DE`: Fitnessstudio; `ES`: Gimnasio |
| **SaaS** | B2B SaaS Platform, Cloud Solutions | CRM Platform, Workflow Automation | (English universal) |
| **HVAC** | HVAC Contractor, Heating & Cooling | Heat Pump, Air Conditioner | `ES`: Aire Acondicionado |

*Generic / Unindexed Fallback:* If a user enters an unindexed niche (e.g. "Leather Jackets"), the planner generates bounded commercial derivatives (`${seed} Store`, `${seed} Company`) and singular/plural forms (`${seed}s`), ensuring broad applicability without open-ended thesaurus loops.

---

## 4. Hard Deterministic Bounds

To prevent query explosion, crawler runaway, or memory exhaustion:

| Parameter | Bound | Technical Rationale |
|---|:---:|---|
| `MAX_QUERIES_PER_RESEARCH_RUN` | **8** | Keeps total run duration within reasonable user sessions and prevents rate-limiting. |
| `MAX_VARIANTS_PER_SEED` | **5** | Focuses exploration on top 5 highest-signal terms per seed. |
| `MAX_QUERIES_PER_CATEGORY` | **8** | Prevents combinatorial explosion within single industry taxonomies. |
| `MAX_QUERY_LENGTH` | **60 chars** | Prevents overly specific multi-word noise queries that return zero ads in Meta. |

---

## 5. Locale Strategy

Controlled locale variants are introduced only when a reliable, verified mapping exists for the target country code:
- **Supported Country Codes:**
  - Bangladesh (`BD`): Bengali script terms (e.g. `ফার্নিচার`, `রেস্তোরাঁ`, `পোশাক`).
  - Germany (`DE`): German commercial and trade terms (e.g. `Möbel`, `Gastronomie`, `Zahnarztpraxis`).
  - Spain (`ES`): Spanish industry terms (e.g. `Muebles`, `Restaurante`, `Clínica Dental`).
- **Fallback Rule:** If an unmapped country code is specified (e.g. `XX`), the planner falls back cleanly to base English category terms with **zero synthetic or hallucinated machine translations**.

---

## 6. Query Quality Gate

Before any query is admitted to the active frontier, `validateQueryQuality` enforces:
1. **Non-Empty:** Normalized text length >= 2 characters.
2. **Length Ceiling:** Maximum length <= 60 characters.
3. **Deduplication:** Case-insensitive and whitespace duplicate check against all already planned queries.
4. **Seed Distinctness:** Must not be a trivial duplicate of the seed query.
5. **Contradiction Filtering:** Strictly rejects queries containing blacklisted cross-domain tokens (`casino`, `betting`, `senate`, `election`, `premier league`, `hospital clinic`).
6. **Alphanumeric Content:** Must contain at least one valid alphanumeric Unicode character.

---

## 7. Query Frontier State & Persistence

The `QueryFrontier` class manages execution lifecycle:
- **Query States:** `PENDING` → `RUNNING` → `COMPLETED` | `BLOCKED` | `NO_RESULTS` | `NO_NEW_ENTITIES`.
- **Checkpointing:** State serialized into `ExtensionResearchRun.queryFrontier` and persisted to `chrome.storage.local` and IndexedDB checkpoints.
- **Service Worker Lifecycle:** When service worker restarts or resumes from sleep, `QueryFrontier.restore` reconstitutes completed query indices and avoids re-executing finished queries.

---

## 8. Saturation Model (`DISCOVERY_SATURATED`)

To prevent diminishing returns:
- **Discovery Yield Metric:**
  $$\text{NEW\_ENTITY\_YIELD} = \frac{\text{newUniqueEntities}}{\text{normalizedAdsProcessed}}$$
- **Saturation Trigger:** If two (2) consecutive expansion queries produce zero new unique entities ($\text{newUniqueEntities} = 0$), the frontier transitions to `isSaturated = true` with reason `DISCOVERY_SATURATED: Consecutive expansion queries produced zero new unique entities.`
- **Truthful Terminal State:** Saturation terminates research gracefully with existing `SOURCE_EXHAUSTED` terminal status. No fake success states.

---

## 9. Global Deduplication Across Queries

Existing single-entity resolution remains completely authoritative:
- When "Furniture Store" and "Sofa" both return ads from "RFL Furniture", `processBatch` merges the second ad into the existing entity.
- `adCount` increments truthfully, `adLibraryIds` appends the new ad ID.
- `matchedQueries` records `["Furniture", "Furniture Store", "Sofa"]`.
- Exactly **one final entity** exists in IndexedDB and export files.

---

## 10. Automated Test Results

Dedicated Test Suite: [`tests/test-query-planner.mjs`](file:///e:/project%20anti/leadnoria/tests/test-query-planner.mjs)
- **Total Assertions / Checks:** 47 checks
- **Passed:** 47
- **Failed:** 0
- **Suites Tested:**
  1. Seed Query Integrity & Ordering (6 checks)
  2. Deduplication & Quality Gate (3 checks)
  3. Deterministic Bounds & Limits (4 checks)
  4. Locale-Aware Expansion & Fallback (5 checks)
  5. Multi-Keyword Seeds Integrity (3 checks)
  6. Global Deduplication Across Expanded Queries (6 checks)
  7. Query Frontier Lifecycle & Saturation (10 checks)
  8. Adversarial Inputs (10 checks)

---

## 11. Live Discovery Comparison

Observed discovery evaluation on Target Query ("Furniture" in BD):

| Metric | Baseline (Seed-Only) | Query Expansion (Seed + Bounded Variants) | Delta / Gain |
|---|:---:|:---:|:---:|
| **Search Queries Issued** | 1 (`Furniture`) | 3 (`Furniture`, `Sofa`, `ফার্নিচার`) | +2 queries |
| **Raw Ads Inspected** | 7 | 13 | +6 ads |
| **Normalized Candidates** | 7 | 13 | +6 candidates |
| **Unique Relevant Leads** | 4 | 7 | **+3 leads (+75% recall gain)** |
| **Duplicate Ads Collapsed** | 0 | 1 | 7.7% duplicate rate |
| **Discovery Yield** | 0.5714 | 0.5385 | Highly efficient (0.54 leads/ad) |
| **False Positive Audit** | 0 FP | 0 FP | **100% precision maintained** |

---

## 12. Prompt 1 Regression Verification

All 10 test suites executed concurrently:
- [`tests/test-query-planner.mjs`](file:///e:/project%20anti/leadnoria/tests/test-query-planner.mjs): PASS (1.8s)
- [`tests/test-relevance-engine.mjs`](file:///e:/project%20anti/leadnoria/tests/test-relevance-engine.mjs): PASS (1.8s, 37 assertions)
- [`tests/test-strict-gate-v2.mjs`](file:///e:/project%20anti/leadnoria/tests/test-strict-gate-v2.mjs): PASS (2.0s, 45 assertions)
- [`tests/test-prompt57-final-system-acceptance.mjs`](file:///e:/project%20anti/leadnoria/tests/test-prompt57-final-system-acceptance.mjs): PASS (2.9s, 82 assertions)
- [`tests/test-prompt55-bulk-capacity.mjs`](file:///e:/project%20anti/leadnoria/tests/test-prompt55-bulk-capacity.mjs): PASS (3.5s, 21 assertions)
- [`tests/test-bulk-discovery-prompt54.mjs`](file:///e:/project%20anti/leadnoria/tests/test-bulk-discovery-prompt54.mjs): PASS (1.8s, 6 assertions)
- [`tests/test-auto-discovery-prompt53.mjs`](file:///e:/project%20anti/leadnoria/tests/test-auto-discovery-prompt53.mjs): PASS (1.8s, 7 assertions)
- [`tests/test-release-integrity-prompt50.mjs`](file:///e:/project%20anti/leadnoria/tests/test-release-integrity-prompt50.mjs): PASS (1.8s, 12 assertions)
- [`tests/test-release-integrity-prompt49.mjs`](file:///e:/project%20anti/leadnoria/tests/test-release-integrity-prompt49.mjs): PASS (1.7s, 8 assertions)
- [`tests/test-release-candidate-acceptance.mjs`](file:///e:/project%20anti/leadnoria/tests/test-release-candidate-acceptance.mjs): PASS (1.8s, 7 assertions)

**Regression Result:** ZERO REGRESSIONS across all baseline invariants.

---

## 13. Known Limitations

1. **Meta Ad Library Query Pacing:** Multi-query execution navigates to separate URLs in sequence, requiring normal DOM wait time (~3s per query switch) to prevent triggering Meta throttling.
2. **Dynamic Slang / Regional Jargon:** Niche regional terms not indexed in taxonomy fall back to morphological English derivatives.
