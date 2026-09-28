# LEADNORIA v1.0 — STRESS TEST & SCALABILITY REPORT
**Evaluation Phase:** Master Prompt 7  
**Benchmark Nature:** Deterministic High-Volume Stress Fixture (Local Processing Only)  
**Total Records Processed:** 17,500 records  
**Internal Safety Ceiling:** 5,000 unique relevant leads  
**Date:** September 28, 2026  

---

## 1. Executive Summary

This report evaluates LeadNoria's data structures, entity resolution algorithms, and storage mechanisms under extreme record volume and adversarial duplicate densities. All testing was executed locally without generating artificial or irresponsible traffic against public Meta Ad Library endpoints.

### Core Benchmark Results
| Metric | Benchmark Result | Target / Ceiling | Status |
| :--- | :---: | :---: | :---: |
| **Total Records Ingested** | 17,500 records | >= 17,500 | PASS |
| **Processing Duration** | 4,800 ms (4.80s) | < 30,000 ms | PASS |
| **Throughput** | **3,646 records/sec** | > 500 records/sec | PASS |
| **Final Unique Relevant Leads** | Exactly **5,000 leads** | <= 5,000 (Safety Ceiling) | PASS |
| **Duplicates Collapsed** | 5,000 ads | 5,000 ads | PASS |
| **Not-Relevant Ads Rejected** | 5,000 ads | 5,000 ads | PASS |
| **Uncertain Ads Routed** | 2,500 ads | 2,500 ads | PASS |
| **Heap Memory Delta (10 Batches)** | **-2.77 MB** | Stable / Bounded | PASS |
| **Formula Injection Neutralization** | 100% protected (`=`, `+`, `-`, `@`) | RFC-4180 Compliant | PASS |

---

## 2. Large-Scale Fixture Composition (17,500 Records)

The stress fixture was constructed to stress every branch of the pipeline simultaneously:
1. **5,000 Unique Relevant Businesses:** High-evidence commercial entities with distinct brand names and valid domain destinations.
2. **5,000 Duplicate / Variant Ads:** Secondary and tertiary ad variations pointing to the first 500 entities (10 duplicate ads per entity).
3. **5,000 Not-Relevant Distractors:** Active commercial ads belonging to unrelated verticals (e.g., auto repair, car servicing) under a Furniture research intent.
4. **2,500 Ambiguous / Uncertain Ads:** Ads with lifestyle or editorial content lacking definitive commercial identity tokens.

### Invariant Validation
- The internal ceiling `MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH = 5000` held strictly.
- Exactly 0 not-relevant or uncertain records leaked into the qualified lead list.
- Storage writes and memory allocations remained strictly bounded.

---

## 3. Worst-Case Duplicate Stress (1x100, 10x100, 100x100)

Evaluated entity resolution resilience under extreme duplicate ratios to guarantee against lead count inflation:

| Test Setup | Input Ad Records | Expected Unique Entities | Observed Unique Entities | Duplicates Removed | Count Inflation |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **1 Entity x 100 Ads** | 100 ads | 1 entity | **1 entity** | 99 ads | **0 (None)** |
| **10 Entities x 100 Ads** | 1,000 ads | 10 entities | **10 entities** | 990 ads | **0 (None)** |
| **100 Entities x 100 Ads** | 10,000 ads | 100 entities | **100 entities** | 9,900 ads | **0 (None)** |

**Finding:** The entity index collapsed identical Facebook Page IDs, slugs, and domain pairings in $O(1)$ time, eliminating duplicate inflation.

---

## 4. Cross-Query Order Independence Verification

Evaluated 100 distinct commercial businesses appearing across 3 query variants (`Furniture`, `Sofa`, `Dining Table`) executed in two opposing chronological sequences:
- **Order A:** `Furniture` $\to$ `Sofa` $\to$ `Dining Table`
- **Order B:** `Dining Table` $\to$ `Sofa` $\to$ `Furniture`

### Audit Comparison
- **Order A Canonical Keys:** 100 unique canonical entities (200 duplicate ad variations collapsed).
- **Order B Canonical Keys:** 100 unique canonical entities (200 duplicate ad variations collapsed).
- **Key Equivalence:** `Array.from(keysA).sort() == Array.from(keysB).sort()`.
- **Verdict:** Strict semantic and identifier equivalence. Discovery results are completely independent of keyword execution order.

---

## 5. Checkpoint Persistence & Extension Restart Resilience

Simulated a mid-research extension worker termination and system restart:
1. Research state persisted to `BulkStore` (IndexedDB / storage).
2. Service worker context destroyed and recreated.
3. State restored from durable storage checkpoint.
4. Subsequent batches processed against restored state.

**Audit Results:**
- Zero lost entities.
- Zero duplicate entities introduced upon resumption.
- Uncertain queue and audit records preserved with full provenance.

---

## 6. RFC-4180 CSV Export & Formula Injection Stress

Exported a dataset of 5,000 leads including adversarial cells containing spreadsheet formula triggers (`=HYPERLINK(...)`, `+12345`, `-5000`, `@COMMAND`).

### Protection Validation
- Every cell starting with `=`, `+`, `-`, or `@` was automatically prepended with a single quote (`'`), neutralizing spreadsheet formula execution.
- Fields containing quotes, commas, or line breaks were escaped in accordance with RFC-4180.
- Export duration for 5,000 records: **14.2 ms**.

---

## 7. Defect Identification & Optimization (P2)

### Defect Description (P2 — Scalability Defect)
During initial execution of the 17,500-record stress test, processing stalled in `evaluateEntityMerge`. Analysis revealed that Step 4 (Local Branch Distinction) performed an unindexed linear scan (`for (const [key, existing] of existingEntities.entries())`) over all 5,000 accumulated entities for every incoming candidate that reached Tier 4. Furthermore, `getComparisonNameKey` was repeatedly invoked on every iteration, leading to $O(N^2)$ string allocations and ~87.5 million regex operations, causing run times to exceed 5 minutes.

### Remediation Applied
1. **Prefix Indexing:** Added `brandPrefixToKeys = new Map<string, string[]>()` to `EntityResolutionIndex`, indexing each entity by the first 2 characters of its comparison name.
2. **Precomputed Comparison Keys:** Enhanced `detectBranchRelationship` to accept precomputed keys and immediately short-circuit if the initial character does not match (`a[0] !== b[0]`).
3. **Lookup Scope Reduction:** Step 4 was updated to query only entities sharing the 2-character prefix (`index.brandPrefixToKeys.get(prefix)`), falling back to full iteration only for extremely short 1-character names.

### Before vs. After Metrics
| Metric | Before Optimization | After Optimization | Improvement Factor |
| :--- | :---: | :---: | :---: |
| **Duration (17,500 records)** | ~320 seconds | **4.80 seconds** | **66.6x Faster** |
| **Throughput** | ~54 records/sec | **3,646 records/sec** | **67.5x Increase** |
| **False Merges Introduced** | 0 | **0** | Perfect Preservation |

---

## 8. Status & Certification

- **17,500-Record Fixture:** VALIDATED (3,646 records/sec)
- **Worst-Case Duplicates:** VALIDATED (0 count inflation)
- **Order Independence:** VALIDATED
- **Persistence & Restart:** VALIDATED
- **CSV Formula Protection:** VALIDATED
- **Stress Test Status:** **STRESS TEST VALIDATED**
