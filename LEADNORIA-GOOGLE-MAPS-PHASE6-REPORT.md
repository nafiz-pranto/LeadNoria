# LEADNORIA GOOGLE MAPS — PHASE 6 REPORT
## WEBSITE REQUIREMENT ENGINE & LEAD QUALIFICATION PIPELINE (RECONCILED)

**Execution Date:** 2026-09-29  
**Status:** PASS — PHASE 6 COMPLETE / PHASE 7 READY  
**Frozen Release SHA-256:** `bbb3d9f16e1efde29e77af0bf2ffb5e30f20f9b50ad5c0fb89f578aa52931d5b` (LeadNoria v1.0.0 Meta Ad Library Engine)

---

### 1. EXECUTIVE RESULT & CRITICAL QUALIFICATION CORRECTION

Phase 6 implements a deterministic, source-neutral **Website Requirement Engine** and **Lead Qualification Pipeline** for the LeadNoria research engine. Consuming the Phase 5 normalized candidate envelope (`NormalizedCandidate`, `FieldPolicyEnvelope`, `SourceContribution`, `PolicyRestrictionBasis`), Phase 6 deterministically evaluates:

1. **Critical WITH Qualification Correction (Prompt #6A Reconciliation):**
   - Corrected earlier behavior where unverified pointers satisfied `WITH`.
   - **`WITH + WEBSITE_PRESENT => UNCERTAIN`** (Reason: `UNCERTAIN_WEBSITE_VERIFICATION`).
   - `WEBSITE_PRESENT` means: *"A usable-looking URL pointer exists, but independent business-site verification has not yet established ownership/identity."*
   - Only **`WEBSITE_VERIFIED_BUSINESS_SITE`** qualifies under `WITH` (subject to relevance/geography/firewall gates).
   - In `BOTH` mode, `WEBSITE_PRESENT` is strictly **`UNCERTAIN`** (not WITH-qualified).
2. **Existing Website Verifier Integration:**
   - Reused the existing LeadNoria website verification engine (`websiteVerifier.ts` and `websiteCache.ts`).
   - Preserved all established resource and safety bounds:
     - `MAX_PAGES_PER_DOMAIN = 5`
     - `MAX_PAGE_TIMEOUT_MS = 10000` (10s)
     - `MAX_DOMAIN_VERIFICATION_TIME_MS = 30000` (30s)
     - `CACHE_TTL_MS = 86400000` (24 hours)
3. **Granular Unavailable Reasons:**
   - Kept the public 9-state model while preserving underlying failure reasons: `PAGE_TIMEOUT`, `DOMAIN_TIMEOUT`, `DNS_FAILURE`, `HTTP_403`, `HTTP_404`, `HTTP_429`, `HTTP_5XX`, `NETWORK_ERROR`, `REDIRECT_ERROR`.
   - Guaranteed that these reasons do not falsely imply the business does not exist or has no website.
4. **Data Firewall & Export Gates:**
   - Strictly decoupled commercial qualification (`QUALIFIED`) from exportability (`EXPORTABLE`).
   - Google consumer-web restricted dependencies remain strictly non-persistable and non-exportable.
5. **Durable Uncertainty:**
   - Flowed all ambiguous, unproven, or unreviewed leads into the durable uncertain queue with full lineage and evidence preserved.

All 50 qualification test checks pass, 24 deterministic fixtures validate, TypeScript checks report 0 errors, and frozen Meta v1.0.0 workflows pass with 0 regressions.

---

### 2. ARCHITECTURE & VERIFIER INTEGRATION

The Phase 6 architecture resides in `src/extension/qualification/`:

```
src/extension/qualification/
├── types.ts                      # Contracts for WebsiteRequirement, WebsiteState, WebsiteEvidence,
│                                 # UnavailableReasonCode, QualificationState, and ResultEnvelope
├── qualificationReasons.ts       # Machine-readable reason taxonomy & user-facing explanations ("Why this lead")
├── websiteRequirementEngine.ts   # Deterministic website state machine, WITH/WITHOUT/BOTH evaluation logic,
│                                 # and adaptVerificationRecordToEvidence verifier bridge
├── leadQualificationEngine.ts    # Multi-gate qualification pipeline, contradiction detector & firewall integration
└── index.ts                      # Module exports
```

```mermaid
flowchart TD
    NC[Phase 5 NormalizedCandidate] --> PRE[Lead Qualification Engine]
    
    subgraph Verifier [Existing Website Verifier (Reused)]
        WV[websiteVerifier.ts: verifyWebsiteDomain]
        WC[websiteCache.ts: 24h Domain Cache]
        WV -->|WebsiteVerificationRecord| ADAPT[adaptVerificationRecordToEvidence]
    end
    
    ADAPT -->|WebsiteEvidence| WRE[Website Requirement Engine]
    WI[User Intent: WITH / WITHOUT / BOTH] --> WRE
    
    WRE -->|Website State & Eligibility| PRE
    
    subgraph MultiGate [Qualification Gates]
        G1[Relevance Gate]
        G2[Geography Gate]
        G3[Contradiction Gate]
        G4[Firewall & Lineage Gate]
    end
    
    PRE --> MultiGate
    
    MultiGate -->|Pass All Gates & Verified Site| Q[QUALIFIED]
    MultiGate -->|Pointer Only / Inconclusive / No Absence Proof| U[UNCERTAIN -> Uncertain Queue]
    MultiGate -->|Parked / Non-Business / Geo Mismatch| D[DISQUALIFIED]
    
    Q --> FW{Firewall Check}
    FW -->|Google Restricted Lineage| BLOCKED[NOT_EXPORTABLE / NOT_PERSISTABLE]
    FW -->|Unencumbered Lineage| EXP[EXPORTABLE / PERSISTABLE]
```

---

### 3. WEBSITE STATE MACHINE

The engine establishes a 9-state deterministic machine:

| Website State | Technical Definition | Product Semantic |
| :--- | :--- | :--- |
| `WEBSITE_PRESENT` | A usable-looking URL pointer exists in candidate data, but independent verification has not yet verified identity/ownership. | Unverified active pointer. |
| `WEBSITE_NOT_FOUND` | No usable website URL was obtained from the permitted source path. | **`OBSERVED_NO_WEBSITE_POINTER`**. NOT proven absence. |
| `WEBSITE_INVALID` | URL is malformed, credential-bearing, or uses an unsafe protocol. | Rejected URL. |
| `WEBSITE_UNCERTAIN` | Verification evidence is contradictory, borderline, or uncorroborated. | Ambiguous digital identity. |
| `WEBSITE_VERIFIED_BUSINESS_SITE` | Independent verification confirms URL represents the target business with corroborating signals. | Verified commercial website. HTTP 200 alone never achieves this state. |
| `WEBSITE_NON_BUSINESS` | URL resolves to a generic directory, encyclopedia (Wikipedia), or unrelated site. | Non-business destination. |
| `WEBSITE_PARKED` | Destination is a domain-for-sale placeholder, Sedo/GoDaddy parked page. | Parked / placeholder domain. |
| `WEBSITE_UNAVAILABLE` | Destination timed out, returned HTTP 4xx/5xx, or DNS failed. | Bounded unreachable destination. |
| `WEBSITE_UNKNOWN` | No determination was possible. | Indeterminate state. |

---

### 4. RECONCILED WITH / WITHOUT / BOTH SEMANTICS

| Intent Mode | Website State Input | Final State | Reason Code |
| :--- | :--- | :--- | :--- |
| **`WITH`** | `WEBSITE_VERIFIED_BUSINESS_SITE` | **`QUALIFIED`** | `QUALIFIED_RELEVANT_WITH_VERIFIED_WEBSITE` |
| **`WITH`** | `WEBSITE_PRESENT` (unverified pointer) | **`UNCERTAIN`** | `UNCERTAIN_WEBSITE_VERIFICATION` |
| **`WITH`** | `WEBSITE_UNCERTAIN` | **`UNCERTAIN`** | `UNCERTAIN_WEBSITE_VERIFICATION` |
| **`WITH`** | `WEBSITE_UNKNOWN` | **`UNCERTAIN`** | `UNCERTAIN_WEBSITE_VERIFICATION` |
| **`WITH`** | `WEBSITE_UNAVAILABLE` | **`UNCERTAIN`** | `UNCERTAIN_WEBSITE_VERIFICATION` |
| **`WITH`** | `WEBSITE_PARKED` | **`DISQUALIFIED`** | `DISQUALIFIED_PARKED_DOMAIN` |
| **`WITH`** | `WEBSITE_NON_BUSINESS` | **`DISQUALIFIED`** | `DISQUALIFIED_NON_BUSINESS` |
| **`WITH`** | `WEBSITE_INVALID` | **`DISQUALIFIED`** | `DISQUALIFIED_WEBSITE_REQUIREMENT` |
| **`WITH`** | `WEBSITE_NOT_FOUND` | **`DISQUALIFIED`** | `DISQUALIFIED_WEBSITE_REQUIREMENT` |
| **`WITHOUT`**| Website exists (`VERIFIED` or `PRESENT`) | **`DISQUALIFIED`** | `DISQUALIFIED_WEBSITE_REQUIREMENT` |
| **`WITHOUT`**| Missing source pointer alone | **`UNCERTAIN`** | `UNCERTAIN_WEBSITE_NOT_FOUND` |
| **`WITHOUT`**| Parked / Non-business domain | **`UNCERTAIN`** | `UNCERTAIN_WEBSITE_VERIFICATION` |
| **`WITHOUT`**| Explicit verified absence proof | **`QUALIFIED`** | `QUALIFIED_WITHOUT_WEBSITE` |
| **`BOTH`**   | `WEBSITE_VERIFIED_BUSINESS_SITE` | **`QUALIFIED`** | `QUALIFIED_RELEVANT_WITH_VERIFIED_WEBSITE` |
| **`BOTH`**   | Explicit verified absence proof | **`QUALIFIED`** | `QUALIFIED_WITHOUT_WEBSITE` |
| **`BOTH`**   | `WEBSITE_PRESENT` (unverified pointer) | **`UNCERTAIN`** | `UNCERTAIN_WEBSITE_VERIFICATION` |
| **`BOTH`**   | Missing source pointer alone | **`UNCERTAIN`** | `UNCERTAIN_WEBSITE_NOT_FOUND` |
| **`BOTH`**   | `WEBSITE_PARKED` | **`DISQUALIFIED`** | `DISQUALIFIED_PARKED_DOMAIN` |
| **`BOTH`**   | `WEBSITE_NON_BUSINESS` | **`DISQUALIFIED`** | `DISQUALIFIED_NON_BUSINESS` |

---

### 5. VERIFIER BOUNDARY CONTROLS (PROVEN BY TESTS)

The test suite explicitly validates integration with `src/extension/websiteVerifier.ts` and `src/extension/websiteCache.ts`:

- **Boundary A (Max Pages):** `MAX_PAGES_PER_DOMAIN === 5`
- **Boundary B (Page Timeout):** `MAX_PAGE_TIMEOUT_MS === 10000` (10s)
- **Boundary C (Domain Timeout):** `MAX_DOMAIN_VERIFICATION_TIME_MS === 30000` (30s)
- **Boundary D (Cache TTL):** `CACHE_TTL_MS === 86400000` (24h)
- **Boundary E (Same-Origin Limitation):** Confirmed via `isSameOriginUrl` (cross-domain links strictly rejected)
- **Boundary F (Run Isolation):** Page/domain timeouts do not abort qualification runs
- **Boundary G (Evidence & Lineage Preservation):** Cached records adapt into `WebsiteEvidence` retaining `WEBSITE_DERIVED` lineage
- **Boundary H (Revalidation):** Stale cache entries expire and trigger re-verification

---

### 6. GRANULAR UNAVAILABLE REASONS

`resolveUnavailableReason` maps failure states without falsely implying entity absence:
- `PAGE_TIMEOUT` (HTTP 408 or >10s fetch boundary)
- `DOMAIN_TIMEOUT` (>30s overall domain crawl limit)
- `DNS_FAILURE` (domain resolution error)
- `HTTP_403` (security challenge / access barrier)
- `HTTP_404` (missing resource / dead link)
- `HTTP_429` (rate limited)
- `HTTP_5XX` (server error)
- `NETWORK_ERROR` (connection refused / socket reset)
- `REDIRECT_ERROR` (infinite redirect loop)

---

### 7. POLICY & LINEAGE INTEGRATION

- **Lineage Firewall:** Field dependencies and `sourceContributions` survive qualification intact.
- **Decoupled Qualification & Exportability (`QUALIFIED !== EXPORTABLE`):** A candidate with restricted Google consumer-web lineage qualifies on commercial relevance, but its `persistenceEligibility` and `exportEligibility` are strictly enforced as `NOT_PERSISTABLE` and `NOT_EXPORTABLE`.
- **Review Gating:** Google API contributions (`GOOGLE_API_SERVICE_SPECIFIC`) or ambiguous policy states route to `UNCERTAIN_POLICY_REVIEW` with gated export/persistence.

---

### 8. UNCERTAIN QUEUE INTEGRATION

All candidates resolving to `UNCERTAIN`:
- Are strictly excluded from Qualified leads and final CSV/JSON exports.
- Preserve complete candidate envelopes, verified evidence snippets, and machine-readable reason codes.
- Remain inspectable in durable state without data loss.

---

### 9. TEST FIXTURE MATRIX

All 24 deterministic test fixtures in `fixtures/qualification/` validate under the reconciled engine:
1. `01-valid-business-website.json`
2. `02-shopify-business-website.json`
3. `03-parked-domain.json`
4. `04-non-business-site.json`
5. `05-unavailable-site.json`
6. `06-timeout-site.json`
7. `07-redirect-site.json`
8. `08-wrong-business-site.json`
9. `09-multi-param-url-site.json`
10. `10-multilingual-content-site.json`
11. `11-no-website-pointer.json`
12. `12-google-derived-no-website.json`
13. `13-meta-derived-destination.json`
14. `14-user-provided-domain.json`
15. `15-google-website-mixed-lineage.json`
16. `16-meta-website-mixed-lineage.json`
17. `17-contradictory-business-name.json`
18. `18-contradictory-locality.json`
19. `19-requirement-with.json`
20. `20-requirement-without.json`
21. `21-requirement-both.json`
22. `22-policy-review-candidate.json`
23. `23-export-blocked-candidate.json`
24. `24-restart-recovery-candidate.json`

---

### 10. TEST RESULTS

- **Phase 6 Test Suite (`tests/test-phase6-website-qualification.mjs`):** **50 Passed / 0 Failed**
- **Phase 5 Test Suite (`tests/test-phase5-extraction-normalization.mjs`):** **45 Passed / 0 Failed**
- **Post-Freeze Validation (`tests/test-postfreeze-verification.mjs`):** **19 Passed / 0 Failed**
- **TypeScript (`npx tsc --noEmit`):** **0 Errors / 0 Warnings**

---

### 11. QUALIFICATION ENGINE PERFORMANCE BENCHMARKS

| Batch Size | Elapsed Time | Throughput | Heap Delta |
| :--- | :--- | :--- | :--- |
| **100 candidates** | 0.8 ms | 130,582 ops/sec | +0.55 MB |
| **500 candidates** | 3.8 ms | 130,890 ops/sec | +2.17 MB |
| **1,000 candidates** | 8.2 ms | 121,334 ops/sec | -1.29 MB |
| **5,000 candidates** | 37.1 ms | 134,756 ops/sec | +4.28 MB |
| **10,000 candidates** | 72.6 ms | 137,787 ops/sec | +3.85 MB |

---

### 12. FILES CHANGED

**Modified in Reconciliation:**
- `src/extension/qualification/types.ts` (added `UnavailableReasonCode` and `unavailableReason`)
- `src/extension/qualification/websiteRequirementEngine.ts` (enforced `WEBSITE_PRESENT => UNCERTAIN`, added `adaptVerificationRecordToEvidence`, `resolveUnavailableReason`)
- `tests/test-phase6-website-qualification.mjs` (expanded from 38 to 50 test checks)
- `LEADNORIA-GOOGLE-MAPS-PHASE6-REPORT.md` (reconciled report)

---

### 13. FILES UNTOUCHED

The following files remain completely untouched and production-frozen:
- `src/extension/metaAdapter.ts`
- `src/extension/evidenceWaterfall.ts`
- `src/extension/queryPlanner.ts`
- `src/extension/entityResolver.ts`
- `src/extension/adLibraryParser.ts`
- `src/extension/manifest.json`
- `extension.zip` (`bbb3d9f16e1efde29e77af0bf2ffb5e30f20f9b50ad5c0fb89f578aa52931d5b`)

---

### 14. SAFETY CONFIRMATIONS

- **Zero Google Maps live extraction:** 0 scraping loops, 0 DOM selectors.
- **Zero new manifest permissions:** `manifest.json` untouched (no `activeTab`, no Google host permissions).
- **Zero API credentials:** No Google API keys, Meta tokens, or secrets.
- **Meta behavior unmodified:** 19/19 post-freeze workflow checks passed.

---

### 15. PHASE 7 HANDOFF

The fixed roadmap proceeds directly to:
**PHASE 7 = Maps Data Normalization**

Phase 6 cleanly hands off:
- Normalized candidate envelope compatibility (`NormalizedCandidate`)
- Deterministic 9-state website state machine with `WEBSITE_PRESENT => UNCERTAIN` in `WITH` mode
- Existing website verifier integration (`adaptVerificationRecordToEvidence`, 5 pages, 10s page timeout, 30s domain timeout, 24h cache)
- Granular unavailable reasons (`PAGE_TIMEOUT`, `DOMAIN_TIMEOUT`, `DNS_FAILURE`, `HTTP_403`, etc.)
- Multi-gate Lead Qualification Pipeline (`qualifyLead`, `qualifyLeadBatch`)
- Machine-readable explainable reason codes (`QualificationReasonCode`)
- Data firewall enforcement (`assertNoGooglePersistence`, `assertNoGoogleExport`)
- Durable uncertain queue routing

---

## FINAL GATE VERDICT

**PASS — PHASE 6 COMPLETE / PHASE 7 READY**
