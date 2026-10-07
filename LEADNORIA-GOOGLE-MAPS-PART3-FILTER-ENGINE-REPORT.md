# LeadNoria — Part 3: Rating + Website Filter Engine
## Architecture & Operational Contract Specification

### 1. Overview & Purpose
LeadNoria Part 3 establishes a pure, deterministic, source-aware filtering engine over acquired Google Maps candidate observations. The engine enables instant, local view refinement without mutating underlying research data, reloading Google Maps pages, or re-running DOM acquisition loops.

---

### 2. User-Facing Filter Contract & Canonical Representation
The engine exposes single-choice filters across two dimensions that combine strictly using **AND** semantics:

- **Canonical Internal Rating Options:**
  - `ANY`: No constraint on candidate rating.
  - `MIN_4_0`: Matches candidates with observed rating $\ge 4.0$. (Presentation label: `4.0+`)
  - `MIN_4_5`: Matches candidates with observed rating $\ge 4.5$. (Presentation label: `4.5+`)

- **Canonical Website Filter Options:**
  - `ANY`: No constraint on candidate website presence.
  - `WITH_WEBSITE`: Matches candidates where website availability is `PRESENT` and raw/parsed URL resolves to a valid external website (excluding internal Google Maps URLs). (Presentation label: `With Website`)
  - `WITHOUT_WEBSITE`: Matches candidates where website availability is explicitly `ABSENT`. (Presentation label: `Without Website`)

- **Single Boundary Normalization:**
  - External or legacy message values (such as `"4.0+"`, `"4.5+"`) are normalized immediately at the boundary via `normalizeRatingFilter()` and `normalizeWebsiteFilter()`.
  - Internal session state, filter manager storage, and serialized filters contain strictly canonical values (`ANY`, `MIN_4_0`, `MIN_4_5`). Duplicate semantic representations cannot coexist in internal state.

- **Default State:**
  ```json
  {
    "rating": "ANY",
    "website": "ANY"
  }
  ```
  In this state, 100% of unique acquired candidates are visible.

---

### 3. Truth Tables & Semantic Boundaries

#### 3.1 Rating Matching Semantics
A pure matcher evaluates candidate rating evidence:

| Candidate Rating State | `ANY` | `MIN_4_0` (4.0+) | `MIN_4_5` (4.5+) | Rationale / Reason Code |
| :--- | :---: | :---: | :---: | :--- |
| **5.0 PRESENT** | ✓ | ✓ | ✓ | `RATING_THRESHOLD_MET` |
| **4.9 PRESENT** | ✓ | ✓ | ✓ | `RATING_THRESHOLD_MET` |
| **4.5 PRESENT** | ✓ | ✓ | ✓ | `RATING_THRESHOLD_MET` |
| **4.0 PRESENT** | ✓ | ✓ | ✗ | `RATING_BELOW_THRESHOLD` for 4.5+ |
| **3.9 PRESENT** | ✓ | ✗ | ✗ | `RATING_BELOW_THRESHOLD` for 4.0+ & 4.5+ |
| **UNKNOWN** | ✓ | ✗ | ✗ | `RATING_UNKNOWN`: missing card rating is NOT 0; conservative exclusion |
| **ABSENT** | ✓ | ✗ | ✗ | `RATING_ABSENT`: explicit no-rating evidence ("Not rated") does not meet numeric threshold |
| **AMBIGUOUS** | ✓ | ✗ | ✗ | `RATING_AMBIGUOUS`: contradictory/malformed rating evidence rejected |
| **UNSUPPORTED** | ✓ | ✗ | ✗ | `RATING_UNSUPPORTED`: surface lacks rating support |

**Strict Invariants:**
- `UNKNOWN` is NEVER coerced to zero.
- `ABSENT` is NEVER coerced to zero.
- Numeric thresholds use $\ge$ comparisons against finite parsed values.

#### 3.2 Website Matching Semantics
A pure matcher evaluates observed website evidence:

| Candidate Website State | `ANY` | `WITH_WEBSITE` | `WITHOUT_WEBSITE` | Rationale / Reason Code |
| :--- | :---: | :---: | :---: | :--- |
| **PRESENT** (Valid URL) | ✓ | ✓ | ✗ | `WEBSITE_PRESENT` |
| **ABSENT** (Explicit proof) | ✓ | ✗ | ✓ | `WEBSITE_ABSENT` |
| **UNKNOWN** (Omitted on card) | ✓ | ✗ | ✗ | `WEBSITE_UNKNOWN`: omission does not prove absence |
| **AMBIGUOUS** (Internal Maps/Search link) | ✓ | ✗ | ✗ | `WEBSITE_AMBIGUOUS`: invalid structure |
| **UNSUPPORTED** (Surface unsupported) | ✓ | ✗ | ✗ | `WEBSITE_UNSUPPORTED` |

**CRITICAL INVARIANT:**
- `WITHOUT_WEBSITE` matches ONLY explicit `ABSENT` evidence (e.g. from detail inspection).
- A candidate whose result card merely omits a website link has `websiteUrl.availability === 'UNKNOWN'`, and is therefore **excluded** by `WITHOUT_WEBSITE`.
- `UNKNOWN` is NEVER collapsed into `ABSENT`.

---

### 4. Architectural Separation: Raw Acquisition vs. Filter View

The system enforces strict separation between acquired observations and view representations:

```
Google Maps Result Surface
        ↓ (DOM Observer & Scroller)
Raw Card Node Data
        ↓ (Observation Boundary)
Normalized Candidate Observations
        ↓ (Deduplication Registry)
Stored In-Memory Raw Dataset (Map<string, GoogleMapsCandidateObservation>)
        ↓ (Pure Filter Predicate: O(N))
Filtered Result View (matchingCandidateIds, counts, explanations)
        ↓
User Interface (ResultsTableView & GoogleMapsFilterControls)
```

1. **Non-Destructive Filtering:**
   Underlying candidate objects are never modified, overwritten, or removed from the acquisition collection.
2. **Instant Re-Evaluation:**
   Changing filters evaluates locally in $O(N)$ time with zero network requests, zero DOM parsing, and zero Maps tab reloading.
3. **Reset Operation:**
   Invoking `Reset Filters` restores `ANY` + `ANY`, immediately rendering all unique candidates.
4. **Live Ingestion:**
   When background scrolling yields new candidates, they are ingested into the raw dataset and evaluated against the currently active filter in real time.

---

### 5. Metric & Count Model

The UI distinguishes between raw candidate discoveries and active filter matches:
- **Total Unique Candidates (`totalObserved`):** Total distinct entities discovered in the current session.
- **Filtered Matches (`matchingCount`):** Candidates satisfying `predicate(candidate, activeFilter) === true`.
- **Excluded Candidates (`excludedCount`):** `totalObserved - matchingCount`.
- **Dimension Counts:** Breakdowns for `rating4PlusCount`, `rating4_5PlusCount`, `websitePresentCount`, and `websiteAbsentCount` are tracked independently and never confused with the combined AND count.

---

### 6. Empty State Classification

Empty states are deterministically partitioned:
1. `NO_DATA`: Session has completed or paused with 0 candidates acquired.
2. `ACQUISITION_IN_PROGRESS`: Session is actively scrolling but candidates have not yet arrived.
3. `NO_MATCHES`: Candidates exist in the raw dataset, but the active filter criteria excludes 100% of them (e.g., `0 businesses match 4.5+ + Without Website`).
4. `NONE`: Candidates exist and match the active filter.

---

### 7. Google Data Firewall & Security

1. **Firewall Preserved:**
   Filtering Google-derived observations does not alter policy status. All candidate observations remain:
   - `provenance.source = 'GOOGLE_MAPS_BROWSER'`
   - `provenance.isRestricted = true`
   - `provenance.policyStatus = 'POLICY_GATED'`
   - `provenance.persistenceStatus = 'NOT_PERSISTABLE'`
   - `provenance.exportStatus = 'NOT_EXPORTABLE'`
2. **Zero Website Crawling:**
   Website existence is evaluated solely from observed card evidence. No HTTP requests, DNS lookups, or crawling are initiated.
3. **Zero Qualification / Lead Scoring:**
   The filter engine performs deterministic boolean matching only. No intent scoring, lead grading, or qualification models exist in the engine.
4. **Prohibited Tokens:**
   Engine files are verified clean of prohibited qualification and crawling tokens.

---

### 8. Performance Characteristics & Benchmark Methodology

#### 8.1 Protocol & Methodology
- Pre-measurement JIT warm-up execution (10 iterations over synthetic candidate arrays).
- 5 measurement iterations per dataset size using `performance.now()`.
- Primary comparison metric: **Median duration**.
- Dataset sizes measured: 100, 500, 1,000, 5,000, 10,000 unique candidates.

#### 8.2 Measured Results
| Size (Candidates) | Min (ms) | Median (ms) | Max (ms) | Avg (ms) | Combined Matches |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **100** | 0.28 | **0.31** | 0.36 | 0.31 | 8 |
| **500** | 1.41 | **2.12** | 2.20 | 1.93 | 42 |
| **1,000** | 2.62 | **2.88** | 6.41 | 3.54 | 83 |
| **5,000** | 7.24 | **8.42** | 11.07 | 9.05 | 417 |
| **10,000** | 20.53 | **28.43** | 51.47 | 30.45 | 833 |

#### 8.3 Algorithmic Complexity Justification
- **Structural Invariant:** Filtering uses a single linear pass over $N$ unique candidates. Exactly one candidate-level predicate evaluation is performed per candidate with zero candidate $\times$ candidate nested iterations, zero repeated full-dataset rescans, zero DOM queries, and zero network calls.
- **Complexity Assessment:** Filtering uses a single linear pass over $N$ unique candidates; measured runtime is consistent with $O(N)$ algorithmic complexity within benchmark noise.
