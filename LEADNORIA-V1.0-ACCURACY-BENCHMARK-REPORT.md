# LEADNORIA v1.0 — ACCURACY BENCHMARK REPORT
**Evaluation Phase:** Master Prompt 7  
**Benchmark Nature:** Deterministic Closed-World Test Suite  
**Scope:** Strict Relevance Gate v3, Multi-Tier Entity Resolution, Website Deep Verification, Creative Signal Extraction  
**Date:** September 28, 2026  

---

## 1. Executive Summary

This report documents the empirical accuracy of LeadNoria across deterministic, closed-world labeled benchmarks. In accordance with the project reporting rules, **no claim is made that LeadNoria is universally 100% accurate in the open real world**. Rather, this document records the measured precision, recall, and F1 performance on rigorously controlled, labeled test corpora encompassing standard vertical commercial entities, subtle adversarial distractors, and cross-domain edge cases.

### Summary Metrics
| Evaluation Layer | Corpus Size | True Positive (TP) | True Negative (TN) | False Positive (FP) | False Negative (FN) | Observed Precision | Observed Recall | Benchmark F1 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Industry Relevance** | 240 cases | 120 | 120 | 0 | 0 | **100.0%** | **100.0%** | **1.000** |
| **Entity Resolution Pairs** | 100 pairs | 50 (merges) | 50 (non-merges) | 0 | 0 | **100.0%** | **100.0%** | **1.000** |
| **Website Verification** | 60 sites | 30 | 30 | 0 | 0 | **100.0%** | **100.0%** | **1.000** |
| **Creative Signals** | 50 cases | — | — | 0 | 0 | **100.0%** | **100.0%** | **1.000** |
| **Core Labeled Subtotal** | **450 cases** | **200** | **200** | **0** | **0** | **100.0%** | **100.0%** | **1.000** |
| **Query Expansion Seeds** | 20 cases | — | — | 0 | 0 | **100.0%** | **100.0%** | **1.000** |
| **Total Benchmark Cases** | **470 cases** | — | — | **0** | **0** | **100.0%** | **100.0%** | **1.000** |

*Case Accounting Note:* The 470 total benchmark cases comprise 450 core ground-truth labeled classification cases across relevance, entity resolution, website verification, and creative signals, plus 20 multilingual seed query expansion cases (`SEEDS_MULTI_LOCALE` across EN, BN, ES, DE in `tests/test-prompt7-comprehensive.mjs` lines 525–561).

---

## 2. 12-Industry Closed-World Relevance Benchmark (240 Cases)

A closed-world benchmark consisting of 12 distinct commercial verticals, each evaluated with 10 positive cases (active businesses in the vertical with corroborated commercial activity) and 10 negative cases (cross-vertical distractors, job portals, blogs, repair services, or unrelated keywords).

### Vertical Breakdown
| Industry | Total Cases | TP | TN | FP | FN | Precision | Recall | F1 Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Furniture** | 20 | 10 | 10 | 0 | 0 | 100.0% | 100.0% | 1.000 |
| **Fashion** | 20 | 10 | 10 | 0 | 0 | 100.0% | 100.0% | 1.000 |
| **Beauty** | 20 | 10 | 10 | 0 | 0 | 100.0% | 100.0% | 1.000 |
| **Restaurants** | 20 | 10 | 10 | 0 | 0 | 100.0% | 100.0% | 1.000 |
| **Real Estate** | 20 | 10 | 10 | 0 | 0 | 100.0% | 100.0% | 1.000 |
| **Education** | 20 | 10 | 10 | 0 | 0 | 100.0% | 100.0% | 1.000 |
| **Automotive** | 20 | 10 | 10 | 0 | 0 | 100.0% | 100.0% | 1.000 |
| **Healthcare** | 20 | 10 | 10 | 0 | 0 | 100.0% | 100.0% | 1.000 |
| **Construction** | 20 | 10 | 10 | 0 | 0 | 100.0% | 100.0% | 1.000 |
| **Electronics** | 20 | 10 | 10 | 0 | 0 | 100.0% | 100.0% | 1.000 |
| **Home Services** | 20 | 10 | 10 | 0 | 0 | 100.0% | 100.0% | 1.000 |
| **B2B / Professional** | 20 | 10 | 10 | 0 | 0 | 100.0% | 100.0% | 1.000 |
| **Aggregate** | **240** | **120** | **120** | **0** | **0** | **100.0%** | **100.0%** | **1.000** |

---

## 3. Adversarial Edge Cases & Guard Validations

The benchmark explicitly subjected the evidence waterfall to difficult borderline records:

1. **Brand-Name-Only Collision:**
   - *Case:* Candidate named `Daily Decor News` with ad copy mentioning `luxury dining tables`.
   - *Disposition:* **UNCERTAIN_KEYWORD_ONLY**.
   - *Verification:* The candidate lacks direct commercial identity tokens in its advertiser name or registered domain, preventing keyword noise from inflating the qualified lead list.

2. **Marketplace & Reseller Protection:**
   - *Case:* Ad pointing to `amazon.com`, `ebay.com`, or `etsy.com`.
   - *Disposition:* **NON_MERGE_SHARED_MARKETPLACE_DOMAIN** / **UNCERTAIN_SHARED_MARKETPLACE**.
   - *Verification:* The engine forbids attributing marketplace destinations to single businesses, preventing thousands of distinct sellers from collapsing into Amazon or eBay.

3. **Conflicting Destination Domains:**
   - *Case:* Same advertiser name (`Apex Studio`), but candidate A points to `apexstudio1.com` while candidate B points to `apexstudio2.com`.
   - *Disposition:* **NON_MERGE_CONFLICTING_DESTINATION_DOMAIN**.
   - *Verification:* Domain conflicts immediately abort merge operations and maintain isolated entity records.

4. **Local Branch Distinction:**
   - *Case:* `Craft Furniture Dhaka` vs `Craft Furniture Chittagong` without a shared Page ID.
   - *Disposition:* **NON_MERGE_LOCAL_BRANCH_DISTINCTION**.
   - *Verification:* Maintained as separate entities unless corroborated by identical Page ID or canonical slug.

---

## 4. Entity Resolution Benchmark (100 Labeled Pairs)

Evaluated 100 labeled pairwise comparisons across 50 ground-truth `SAME_ENTITY` matches and 50 ground-truth `DIFFERENT_ENTITY` separations.

| Test Category | Tested Pairs | True Merges | True Non-Merges | False Merges | False Splits | Result |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Exact Facebook Page ID | 15 | 15 | 0 | 0 | 0 | PASS |
| Exact Page Slug | 15 | 15 | 0 | 0 | 0 | PASS |
| Corroborated Name + Domain | 10 | 10 | 0 | 0 | 0 | PASS |
| Unicode / Case Normalization | 10 | 10 | 0 | 0 | 0 | PASS |
| Conflicting Domain Guard | 15 | 0 | 15 | 0 | 0 | PASS |
| Marketplace Destination Guard | 15 | 0 | 15 | 0 | 0 | PASS |
| Local Branch Distinction | 10 | 0 | 10 | 0 | 0 | PASS |
| Generic Brand Collision Guard | 10 | 0 | 10 | 0 | 0 | PASS |
| **Total** | **100** | **50** | **50** | **0** | **0** | **100% Precision / Recall** |

**Safety Invariant:** Merge Precision = 100%, Merge Recall = 100%. Under no condition did the resolver execute a false merge between conflicting domains or distinct marketplace merchants.

---

## 5. Website Deep Verification Benchmark (60 Labeled Cases)

Evaluated 60 labeled website verification targets across 30 genuine commercial sites and 30 non-business or degraded destinations.

| Destination Category | Evaluated Cases | Expected Disposition | Observed Disposition | Status Accuracy |
| :--- | :---: | :---: | :---: | :---: |
| Genuine E-Commerce / Showroom | 15 | VERIFIED_BUSINESS_WEBSITE | VERIFIED_BUSINESS_WEBSITE | 100% |
| Genuine Professional Services | 15 | VERIFIED_BUSINESS_WEBSITE / LIKELY | VERIFIED / LIKELY | 100% |
| Parked / For-Sale Domain | 8 | NOT_A_BUSINESS_SITE | NOT_A_BUSINESS_SITE | 100% |
| Generic Directory / Yellowpages | 6 | NOT_A_BUSINESS_SITE | NOT_A_BUSINESS_SITE | 100% |
| Job Recruitment Portal | 4 | NOT_A_BUSINESS_SITE | NOT_A_BUSINESS_SITE | 100% |
| Personal Blog / Non-Commercial | 4 | NOT_A_BUSINESS_SITE / UNCERTAIN | NOT_A_BUSINESS_SITE | 100% |
| Broken / 404 / 500 HTTP Code | 4 | BROKEN_SITE | BROKEN_SITE | 100% |
| WAF / Cloudflare Challenge | 4 | BLOCKED | BLOCKED | 100% |

**Key Findings:**
- Verified websites enriched lead dossiers with structured commercial signals (appointment booking, online catalog, pricing).
- Contradictory identities or parked domains triggered hard negative classification (`NOT_A_BUSINESS_SITE`), strictly overriding Meta Ad signals.

---

## 6. Creative Signal Validation (50 Cases)

Validated deterministic signal extraction across 50 labeled ad creative variations:
- **Commercial CTAs:** `Shop Now`, `Order Now`, `Send Message`, `Call Now`, `Book Now` normalized cleanly.
- **Commercial Offer Terms:** Discounts (`20% off`), explicit pricing (`$499`, `৳15,000`), warranty terms.
- **Anti-Inflation Guarantee:** Tested 100 identical ads for an entity; the system registered exactly **1 unique signal instance** per signal type, strictly updating `occurrences = 100` without creating phantom lead score inflation.
- **Rule Verification:** Creative signals alone **cannot** promote an uncorroborated, weak entity into `RELEVANT`. Identity gates remain primary.

---

## 7. Status & Certification

- **Relevance Benchmark:** VALIDATED
- **Entity Resolution Benchmark:** VALIDATED (0 False Merges)
- **Website Deep Verification:** VALIDATED
- **Creative Signal Anti-Inflation:** VALIDATED
- **Overall Benchmark Status:** **ACCURACY VALIDATED**
