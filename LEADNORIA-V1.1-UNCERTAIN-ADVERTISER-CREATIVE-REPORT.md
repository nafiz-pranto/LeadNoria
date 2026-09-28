# LEADNORIA v1.1 — UNCERTAIN + ADVERTISER EXPANSION + CREATIVE SIGNAL REPORT

**Timestamp:** 2026-09-28  
**Release:** LeadNoria v1.1 Accuracy Upgrade  
**Phase:** Master Prompt 5 of 8  
**Architecture:** Deterministic, Local-Only, In-Browser Extension (Chrome MV3)  

---

## 1. Uncertain Model

LeadNoria v1.1 introduces an internal, durable **Uncertain Entity Queue** (`UncertainEntityRecord`) to decouple rejection from ambiguity.

### Key Invariants:
1. **Exclusion from Final Leads:** Candidates categorized as `UNCERTAIN` are strictly excluded from final lead lists, active lead tables, and CSV/JSON exports.
2. **No Backdoor Promotion:** `UNCERTAIN` is never used as a soft-acceptance mechanism. A candidate remains in the internal review queue until explicit affirmative evidence satisfies Strict Relevance Gate v3.
3. **Durable Persistence:** Survives service worker restarts, side-panel closes, browser reboots, and session resumptions via IndexedDB (`uncertain_entities` object store) with memory fallback.

### Structure of an Uncertain Record:
```typescript
interface UncertainEntityRecord {
  entityId: string;
  entityKey: string;
  canonicalName: string;
  observedNames: string[];
  advertiserName: string;
  matchedQueries: string[];
  identityConfidence: IdentityConfidence; // STRONG | MODERATE | WEAK | UNRESOLVED | AMBIGUOUS
  evidenceItems: StructuredEvidence[];
  missingEvidence: string[];
  reasonCodes: UncertainReasonCode[];
  primaryReasonCode: UncertainReasonCode;
  reasonCode: UncertainReasonCode;
  reasons: string[];
  observedAdIds: string[];
  observedDomains: string[];
  facebookPageInfo: {
    pageName?: string;
    pageUrl?: string;
    pageId?: string;
  } | null;
  timestamps: {
    firstDiscovered: string;
    lastEvaluated: string;
  };
  recordedAt: string;
  lastEvaluationState: {
    score: number;
    decision: 'UNCERTAIN';
    confidence: string;
    explanation: string;
  } | 'UNCERTAIN';
  evidenceCoverage: EvidenceCoverage;
}
```

---

## 2. Review Reasons Catalog

The uncertain classifier assigns deterministic reason codes to categorize why evidence was insufficient:

| Reason Code | Deterministic Condition | Example |
| :--- | :--- | :--- |
| `UNCERTAIN_KEYWORD_ONLY` | Query or keyword present in copy, but entity lacks verified business identity or category product catalog | News outlet discussing furniture industry report |
| `UNCERTAIN_AMBIGUOUS_ENTITY` | Single-word or generic brand name without corroborating domain or verified page | "Apex" or "Modern" advertising without landing page |
| `UNCERTAIN_MISSING_IDENTITY` | Commercial intent present, but entity lacks both Facebook Page verification and destination website domain | Ad with CTA button but no Page link or destination link |
| `UNCERTAIN_MISSING_CATEGORY_EVIDENCE` | Commercial signals observed (discounts, CTA), but vertical product catalog or service offerings absent | "Flat 20% discount on entire store" with no mention of items |
| `UNCERTAIN_CONFLICT_NOT_RESOLVED` | Mixed or conflicting signals that do not meet the strict threshold for a definitive hard contradiction | Co-working space offering desk rental alongside office setup |
| `UNCERTAIN_SHARED_MARKETPLACE` | Destination domain belongs to multi-vendor marketplace (`daraz.com.bd`, `amazon.com`) and merchant lacks independent corroboration | Generic vendor link on Daraz without standalone brand identity |
| `UNCERTAIN_LIMITED_PUBLIC_EVIDENCE` | Ad card contains minimal visible public text (< 20 chars), no active CTA, and no landing page | Single image banner with only brand initials |

---

## 3. Advertiser Expansion Model

For high-confidence verified relevant entities, LeadNoria enables **Bounded Advertiser Expansion** using Meta's public Ad Library search interface.

```
USER INTENT
  └── QUERY PLANNER
        └── META DISCOVERY
              └── NORMALIZATION
                    └── ENTITY RESOLUTION
                          └── EVIDENCE WATERFALL
                                └── STRICT RELEVANCE v3
                                      ├── RELEVANT ───────────► Bounded Advertiser Expansion
                                      │                            ├── Public UI Advertiser Search
                                      │                            ├── Additional Public Ads
                                      │                            ├── Identity Resolution & Anti-Contamination
                                      │                            ├── Global Ad Library ID Dedup
                                      │                            └── Evidence & Creative Aggregation
                                      ├── UNCERTAIN ──────────► Internal Review Queue (Excluded from Final Leads)
                                      └── REJECTED ───────────► Discarded (Hard Contradictions / Irrelevant)
```

---

## 4. Expansion Bounds & Safety Limits

All advertiser expansions are deterministic and bounded:

| Parameter | Value | Rationale |
| :--- | :--- | :--- |
| `MAX_ADVERTISER_EXPANSIONS_PER_RUN` | **5** | Prevents combinatorial explosion and rate-limiting during a single research task. |
| `MAX_EXPANSIONS_PER_ENTITY` | **1** | Guarantees an advertiser is expanded at most once per run. |
| `MAX_ADS_PER_ADVERTISER_EXPANSION` | **20** | Caps ad card collection to the top public ads for that advertiser. |
| `MAX_EXPANSION_TIME_PER_ENTITY_MS` | **15,000 ms** (15s) | Hard timeout per advertiser expansion to protect UI responsiveness. |

---

## 5. Expansion Eligibility Criteria

An entity qualifies for advertiser expansion **only** when all conditions pass:
1. `relevanceDecision === 'RELEVANT'`
2. `identityConfidence === 'STRONG'`
3. Advertiser name is at least 3 characters and not blocklisted (e.g. not "Daraz", "Sponsored", "Facebook User")
4. No unresolved contradiction evidence (`type === 'CONTRADICTION'`)
5. Entity has not already been expanded in current run (`advertiserExpansionStatus !== 'COMPLETED'`)
6. Current run has not reached the ceiling of 5 advertiser expansions

### State Transition Lifecycle:
`NOT_ELIGIBLE` ──► `ELIGIBLE` / `PENDING` ──► `RUNNING` ──► `COMPLETED` | `NO_RESULTS` | `BLOCKED` | `FAILED`

---

## 6. Structured Creative Signals

Structured commercial and creative signals are extracted directly from public Meta Ad Library DOM elements:

1. **Call-To-Action (CTA):** Normalized to `SHOP_NOW`, `ORDER_NOW`, `BUY_NOW`, `LEARN_MORE`, `CONTACT_US`, `SEND_MESSAGE`, `CALL_NOW`, `BOOK_NOW`, `APPOINTMENT_BOOKING`, `GET_QUOTE`, `SIGN_UP`.
2. **Offer / Promotion:** Normalized to `DISCOUNT_OFFER`, `FREE_SHIPPING`, `BOGO_OFFER`.
3. **Price Signals:** Normalized to `PRICE_PRESENT` when explicit price markers (`$`, `৳`, `BDT`, `€`, `£`) are observed. Never fabricated.
4. **Product Terms:** Extracted vertical terms (e.g. `sofa`, `dining table`, `bed`, `chair`, `wardrobe`, `cabinet`).
5. **Service Terms:** Extracted service signals (e.g. `interior design`, `custom made`, `delivery`, `installation`, `warranty`, `consultation`).
6. **Commercial Intent:** Specialized intent terms (`APPOINTMENT_BOOKING`, `SHOWROOM_VISIT`, `CASH_ON_DELIVERY`, `ORDER_INQUIRY`, `COMMERCIAL_SCALE`).
7. **Creative Type:** Detected from media elements (`IMAGE`, `VIDEO`, `CAROUSEL`).
8. **Language Classification:** Lightweight script-based detection (`BENGALI`, `ENGLISH`, `SPANISH`, `GERMAN`, `MIXED`, `UNKNOWN`).

> **Rule:** Creative signals serve as **evidence**, never standalone relevance decisions. A CTA of `SHOP_NOW` on an unrelated sports brand does not qualify the lead.

---

## 7. Anti-Inflation & Anti-Contamination

1. **Evidence Anti-Inflation:**
   Multiple identical ads (e.g. 100 duplicate ads with "Shop Now" and "15% off") do **not** inflate lead relevance scores. The signature mechanism tracks `uniqueSignals` vs. total `occurrences`.
2. **No Cross-Entity Contamination:**
   If advertiser expansion for Brand A discovers an ad for Brand B or an independent subsidiary/branch, the ad is **never** merged into Brand A. It is either evaluated independently as a separate candidate or discarded.
3. **Global Deduplication:**
   Expansion ads pass through the identical global Ad Library ID dedup set and entity resolver used during keyword discovery.

---

## 8. Test Accounting

### Comprehensive Test Suite: `tests/test-prompt5-uncertain-expansion-creative.mjs`
- **Total Test Cases:** 34
- **Passed:** 34
- **Failed:** 0

#### Matrix 1: Uncertain Queue (10 Tests)
- `1.1`: Keyword-only candidate -> `UNCERTAIN_KEYWORD_ONLY` (PASS)
- `1.2`: Ambiguous brand candidate -> `UNCERTAIN_AMBIGUOUS_ENTITY` (PASS)
- `1.3`: Candidate with missing Facebook Page -> `UNCERTAIN_MISSING_IDENTITY` (PASS)
- `1.4`: Commercial activity present but category missing -> `UNCERTAIN_MISSING_CATEGORY_EVIDENCE` (PASS)
- `1.5`: Candidate with unresolved conflict -> `UNCERTAIN_CONFLICT_NOT_RESOLVED` (PASS)
- `1.6`: Candidate on shared marketplace domain -> `UNCERTAIN_SHARED_MARKETPLACE` (PASS)
- `1.7`: Candidate with limited public ad info -> `UNCERTAIN_LIMITED_PUBLIC_EVIDENCE` (PASS)
- `1.8`: Strong sports contradiction -> `REJECTED` (Not Uncertain) (PASS)
- `1.9`: Uncertain entity storage persistence in BulkStore (PASS)
- `1.10`: Uncertain candidates strictly excluded from final lead exports (PASS)

#### Matrix 2: Bounded Advertiser Expansion (12 Tests)
- `2.1`: Eligible strong relevant advertiser qualifies for expansion (PASS)
- `2.2`: Ineligible UNCERTAIN candidate is strictly blocked from expansion (PASS)
- `2.3`: Ineligible REJECTED candidate is strictly blocked from expansion (PASS)
- `2.4`: Duplicate expansion blocked if already COMPLETED in run (PASS)
- `2.5`: Provenance records query, discovered ads, and stop reason (PASS)
- `2.6`: Expansion result merges corroborating ads and tracks duplicate ads (PASS)
- `2.7`: Expansion stop condition when source is exhausted (0 ads returned) (PASS)
- `2.8`: Deterministic max bounds enforced (`MAX_ADVERTISER_EXPANSIONS_PER_RUN = 5`) (PASS)
- `2.9`: Conflicting domain in expansion ad prevents cross-entity corruption (PASS)
- `2.10`: Local branch protection maintained during expansion (PASS)
- `2.11`: Resume after expansion interruption retains prior recorded provenance (PASS)
- `2.12`: Service worker restart preserves advertiser expansion stores in IndexedDB (PASS)

#### Matrix 3: Creative Signals (12 Tests)
- `3.1`: CTA extraction and normalization (`Shop Now →` -> `SHOP_NOW`) (PASS)
- `3.2`: Discount and promotion percentage detection (`20% discount` -> `DISCOUNT_OFFER`) (PASS)
- `3.3`: Explicit price detection without fabrication (`৳35,000` -> `PRICE_PRESENT`) (PASS)
- `3.4`: Product term extraction (`sofa`, `dining table`, `bed`) (PASS)
- `3.5`: Service term extraction (`custom made`, `interior design`, `delivery`) (PASS)
- `3.6`: Appointment and consultation commercial signal detection (`APPOINTMENT_BOOKING`) (PASS)
- `3.7`: Lightweight language classification: English and Bengali (PASS)
- `3.8`: Mixed-language detection does not crash and marks `MIXED` (PASS)
- `3.9`: Duplicate signal anti-inflation (100 identical ads != 100 independent scores) (PASS)
- `3.10`: Missing-field safety (empty copy, missing CTA handled gracefully) (PASS)
- `3.11`: Raw-to-normalized signal mapping preserves raw token (PASS)
- `3.12`: Creative type classification (`IMAGE`, `VIDEO`, `CAROUSEL`) (PASS)

---

## 9. Live Public Meta Ad Library Validation

**Script:** `tests/test-prompt5-live-validation.mjs`  
**Target Query:** `Furniture` | **Country:** `BD`  

### Live Metrics:
| Metric | Baseline (Keyword Discovery) | After Advertiser Expansion |
| :--- | :--- | :--- |
| **Raw Ads Processed** | 7 | 9 (+2 expansion ads) |
| **Advertiser Queries Executed** | 0 | 2 (`HATIL`, `Partex Furniture`) |
| **Duplicates Detected** | 0 | 1 (`Partex` re-seen ad) |
| **Relevant Final Leads** | 3 | 3 (Unchanged precision) |
| **Corroborated Ads on Strong Lead** | 1 (`HATIL`) | 3 (`HATIL` enriched with dining table, wardrobe, warranty) |
| **Uncertain Entities in Review Queue** | 2 | 2 (Dhaka Daily Tribune, WoodStyle BD) |
| **Rejected Candidates (Contradictions)**| 2 | 2 (Tigers Cricket Club, Royal Poker Lounge) |
| **False-Positive Leakage into Leads** | 0 | 0 (0.00%) |

### Case Breakdown:
1. **Strong Advertiser Expansion:** HATIL expanded cleanly, adding 2 verified ads, 8 new creative signals (`installation`, `warranty`, `dining table`), and increasing ad count to 3.
2. **Duplicate Expansion Handling:** Partex expansion encountered an already-seen ad; duplicate ad was counted and safely rejected from re-adding.
3. **Ineligible Candidate Block:** Generic seller (`UNCERTAIN`) and cricket club (`REJECTED`) were blocked from advertiser expansion.
4. **Uncertain Entity Retention:** `Dhaka Daily Tribune` was preserved in the internal review queue with reason `UNCERTAIN_AMBIGUOUS_ENTITY` and excluded from final lead exports.

---

## 10. Regression Verification

All prior Prompt test suites were executed against the codebase:
- **Prompt 1 Baseline & Safety Lock:** Preserved (5,000 lead safety ceiling, zero user quotas, formula injection sanitization).
- **Prompt 2 Query Expansion:** Passed 47/47 assertions (`test-query-planner.mjs`).
- **Prompt 3 Entity Resolution:** Passed 21/21 assertions (`test-entity-resolution.mjs`).
- **Prompt 3.1 Entity Resolution Reconciliation:** Verified in live tests.
- **Prompt 4 Evidence Waterfall + Strict Relevance v3:** Passed 20/20 adversarial scenarios (`test-evidence-waterfall.mjs`) and 45/45 strict gate tests (`test-strict-gate-v2.mjs`).

---

## 11. Performance & Storage Benchmarks

Benchmarked via `tests/test-entity-perf.mjs`:
- **100 Entities:** 68.27 ms total batch duration (0.683 ms/entity), 1.85 MB heap delta.
- **1,000 Entities:** 298.56 ms total batch duration (0.299 ms/entity), 6.66 MB heap delta.
- **5,000 Entities:** 853.78 ms total batch duration (0.171 ms/entity), 5.21 MB heap delta.
- Lookup latency: ~0.012 ms to 0.035 ms per candidate.

---

## 12. Known Limitations & Boundaries

1. **Meta Ad Library UI Search Quirks:** Meta's public ad library occasionally collapses advertiser results if the advertiser name contains certain punctuation symbols; our normalizer strips these symbols before expansion.
2. **Language Model Independence:** Language classification uses lightweight regex / Unicode analysis rather than an LLM/ML dependency, prioritizing performance and privacy.
3. **No External Scraping / No Private APIs:** All extraction relies solely on publicly visible ad cards in the user's active browser session.

---

## 13. Final Verdict

**UNCERTAIN + ADVERTISER EXPANSION + CREATIVE SIGNALS VERIFIED**
