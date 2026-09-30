# LEADNORIA GOOGLE MAPS — FINAL PHASE 1 RECONCILIATION REPORT
**Document Version:** 1.2-FINAL-RECONCILED  
**Target Release Branch:** `main` (commit `a0108e2`)  
**Scope:** Phase 1 Architecture, Terms Audit, Manifest Verification, and Gate Reconciliation  
**Date:** 2026-09-29  

---

## 1. Final Executive Result

- **Current State of LeadNoria:** LeadNoria v1.0.0 (Meta Ad Library research engine) is production-frozen, completely intact, and verified against release archive SHA-256 `bbb3d9f16e1efde29e77af0bf2ffb5e30f20f9b50ad5c0fb89f578aa52931d5b`.
- **Purpose of this Reconciliation:** Correct remaining overclaims, establish strict contractual distinctions, verify the exact shipped `manifest.json` against the frozen baseline, provide transparent test accounting, and reclassify architectural paths without asserting legal certainty or Google approval.
- **Architectural Determinations:**
  - **PATH A (Direct Web Scraping of `google.com/maps`):** **PROHIBITED / BLOCKED.** Directly breaches the [Google Maps/Google Earth Additional Terms of Service](https://maps.google.com/help/terms_maps.html) Section 2 and Google Terms of Service.
  - **PATH B (Official Google Places API):** **HIGH REGULATORY & CONTRACTUAL FRICTION — REQUIRES PRODUCT/TERMS REVIEW.** Google Maps Platform Terms explicitly prohibit using Core Services to create or augment directory services or advertising products. A B2B lead export tool directly implicates this restriction.
  - **PATH C (Hybrid In-Browser Research Workbench):** **LOWER-RISK / COMPLIANCE-ORIENTED ARCHITECTURE — REQUIRES LEGAL/TERMS REVIEW BEFORE PRODUCTION.** Isolates Google-facing in-browser viewing from LeadNoria's persistent storage; extracts business leads independently from businesses' own public web domains via the Website Deep Verification Engine. Google has **not** expressly authorized this architecture, but it avoids direct bulk extraction of Google's proprietary database.
- **Phase 1 Final Gate:** **PASS — PHASE 2 READY** (Proceeds to Phase 2: Competitor Feature Benchmark under strict compliance boundaries).

---

## 2. Corrections From Previous Report

1. **Reclassification of Path C:** Retracted claims of "Legally grounded", "Compliant", and "PASS" as an absolute legal conclusion. Reclassified to: *"Lower-risk / compliance-oriented architecture — requires legal/terms review before production."*
2. **Reclassification of Path B:** Retracted description of Places API as "low compliance risk." Evaluated Google Maps Platform restriction against creating listings, directories, or lead databases, which creates substantial contractual friction for LeadNoria.
3. **Manifest Reconciliation:** Replaced erroneous claim of `unlimitedStorage` and `alarms` with exact verified manifest declarations: `["storage", "tabs", "scripting", "sidePanel"]`.
4. **Test Accounting Reconciliation:** Disaggregated the post-freeze test suite from historical release validation and benchmark counts.
5. **Website-Derived Data Independence:** Acknowledged that discovering a website pointer on Google Maps creates an initial link in the provenance chain; factual data crawled from the target site must carry full field-level lineage without claiming corroboration "cleanses" Google terms.
6. **"Without Website" Constraint Clarified:** Documented that while the UI can filter and display "WITHOUT WEBSITE" businesses in the user's active tab, LeadNoria cannot legally persist or bulk-export rich lead profiles for them because there is no independent website to source unencumbered contact data.

---

## 3. Current Official Google Policy Position

The legal/contractual constraints governing Google Maps content are defined across four official legal documents:

### 3.1 Google Terms of Service (General)
- **URL:** [https://policies.google.com/terms](https://policies.google.com/terms)
- **Applicable Clause:** *"Don't misuse our services. For example, don’t interfere with our services or try to access them using a method other than the interface and the instructions that we provide."*
- **Contractual Status:** Prohibits automated client-side scripts that access, parse, or scrape Google web pages outside the standard human interface.

### 3.2 Google Maps/Google Earth Additional Terms of Service
- **URL:** [https://maps.google.com/help/terms_maps.html](https://maps.google.com/help/terms_maps.html)
- **Section 2 ("Restrictions Against Misusing the Services"):**
  - **No Scraping:** *"export, extract, or otherwise scrape Google Maps Content for use outside of the services"*.
  - **No Bulk Downloading:** Prohibits creating bulk feeds of content, geocodes, or places information.
  - **No Offline Storage:** *"pre-fetch, index, store, reshare, or rehost Google Maps Content outside of the services"*.
  - **No Copying/Saving:** Expressly prohibits copying and saving business names, addresses, or user reviews outside the provided interface.
- **Contractual Status:** Direct browser-based DOM scraping, persistence, and CSV export of Google Maps web UI data is **contractually prohibited**.

### 3.3 Google Maps Platform Terms of Service
- **URL:** [https://cloud.google.com/maps-platform/terms](https://cloud.google.com/maps-platform/terms)
- **Section 3.2.3(a) ("Restrictions Against Misusing the Services"):**
  - **No Directory / Database Creation:** Prohibits using Google Maps Core Services to *"create or augment any directory, listings service, or advertising product"*.
  - **No Substitute Products:** Prohibits using the API to create a substitute for Google Maps Platform.
- **Contractual Status:** Using the official Places API to generate bulk commercial lead lists or directories for export directly implicates this contractual prohibition.

### 3.4 Google Maps Platform Service Specific Terms
- **URL:** [https://cloud.google.com/maps-platform/terms/maps-service-terms](https://cloud.google.com/maps-platform/terms/maps-service-terms)
- **Section 3.2.3 & 3.2.4 (Caching & Google IDs):**
  - Caching of `place_id` is contractually permitted indefinitely as a foreign key for subsequent API calls.
  - Caching of latitude/longitude coordinates is permitted on a temporary basis for up to 30 consecutive calendar days.
  - General content caching remains prohibited.
- **Contractual Status:** The Place ID and 30-day coordinate exceptions are **API-only licenses**; they do not apply to scraped web data.

---

## 4. Corrected Path A/B/C Assessment

The three proposed architectures are evaluated across technical, contractual, and operational dimensions:

```
EVALUATION FACTOR            PATH A: DIRECT UI SCRAPING          PATH B: OFFICIAL PLACES API             PATH C: HYBRID WORKBENCH
----------------------------------------------------------------------------------------------------------------------------------------
Classification               PROHIBITED / BLOCKED                HIGH FRICTION / TERMS REVIEW REQUIRED   LOWER-RISK / REVIEW REQUIRED
Technical Feasibility        High (MV3 DOM Parser)               High (Versioned REST API)               High (ActiveTab + Deep Verifier)
Contractual Compatibility    Direct breach of Additional ToS     Conflicts with Directory restriction    Avoids Google database extraction
Required Permissions         Host: `google.com/maps/*`           Network: `places.googleapis.com`        `activeTab` or optional host
Credentials / Billing        None                                Google Cloud Account + Credit Card      None (Zero-config)
Storage Permitted            ZERO STORAGE (Prohibited)           Place ID only; Lat/Long max 30 days     Zero Google storage; Website data stored
Export Permitted             PROHIBITED                          PROHIBITED for bulk directory export    Permitted for verified website data
Attribution Requirements     Cannot satisfy in CSV export        Mandatory Google logo & links           Not applicable (No Google content in export)
Maintenance Complexity       Severe (DOM shifts, bot challenges) Low (Stable API schema)                 Low (Independent website crawling)
Local-First Alignment        Technically local, legally exposed  Broken (Requires cloud key / billing)   100% Local-first (Browser only)
Explicit Google Approval     NO                                  Subject to API license conditions       NO
```

### Detailed Assessment:
- **Path A (Direct Web Scraping):** **PROHIBITED / BLOCKED.** Cannot be authorized. Even though technically possible in a browser extension, it directly violates Google's Additional Terms of Service Section 2 and triggers aggressive bot challenges.
- **Path B (Official Places API):** **HIGH REGULATORY & CONTRACTUAL FRICTION.** While technically robust, Section 3.2.3(a) of Google Maps Platform Terms forbids using Places API data to create directories, listings services, or bulk lead databases. Furthermore, mandatory billing and credit card requirements contradict LeadNoria's zero-config, local-first product philosophy.
- **Path C (Hybrid Research Workbench):** **LOWER-RISK / COMPLIANCE-ORIENTED ARCHITECTURE.** Google Maps serves purely as an interactive in-browser workbench for the user's active session. Ephemeral candidate pointers (domain URLs) are transferred across a strict boundary to LeadNoria's Website Deep Verification Engine, which extracts contact, location, and commercial data directly from the business's own public domain. While Google has not explicitly approved this architecture, it cleanly separates proprietary Google UI data from persistent LeadNoria lead records.

---

## 5. Actual Manifest Verification

The actual `manifest.json` files in the repository were directly inspected:
- Target files: `src/extension/manifest.json`, `extension/manifest.json`, and `dist/frozen-extracted/manifest.json`.

### Manifest Comparison Table:
```
MANIFEST PROPERTY           EXPECTED FROZEN BASELINE                   ACTUAL REPOSITORY VALUE                    STATUS / DIFF
---------------------------------------------------------------------------------------------------------------------------------
manifest_version            3                                          3                                          MATCH (Identical)
name                        "LeadNoria"                                "LeadNoria"                                MATCH (Identical)
version                     "1.0.0"                                    "1.0.0"                                    MATCH (Identical)
permissions                 ["storage", "tabs", "scripting",           ["storage", "tabs", "scripting",           MATCH (Identical)
                             "sidePanel"]                               "sidePanel"]
host_permissions            ["https://www.facebook.com/ads/library/*", ["https://www.facebook.com/ads/library/*", MATCH (Identical)
                             "https://web.facebook.com/ads/library/*"]  "https://web.facebook.com/ads/library/*"]
optional_host_permissions   ["https://*/*"]                            ["https://*/*"]                            MATCH (Identical)
background.service_worker   "service-worker.js" (type: "module")       "service-worker.js" (type: "module")       MATCH (Identical)
side_panel.default_path     "sidepanel.html"                           "sidepanel.html"                           MATCH (Identical)
action.default_popup        "popup.html"                               "popup.html"                               MATCH (Identical)
content_scripts.matches     ["https://www.facebook.com/ads/library/*", ["https://www.facebook.com/ads/library/*", MATCH (Identical)
                             "https://web.facebook.com/ads/library/*"]  "https://web.facebook.com/ads/library/*"]
content_scripts.js          ["content-script.js"]                      ["content-script.js"]                      MATCH (Identical)
```

- **Reconciliation Finding:** The actual manifest matches the frozen LeadNoria v1.0.0 baseline with 100% precision. The previous report's reference to `unlimitedStorage` and `alarms` was an errant draft note and has been corrected.

---

## 6. Frozen Meta Baseline Reconciliation

- **Git Commit Baseline:** `a0108e2` (*"LeadNoria v1.0.0: complete production release, extensions, source, and documentation"*).
- **Working Tree State:** `git status` confirms zero tracked files modified. `git diff a0108e2` returns empty.
- **Frozen Archive Integrity:** SHA-256 of `dist/leadnoria-v1.0.0.zip` verified:
  `bbb3d9f16e1efde29e77af0bf2ffb5e30f20f9b50ad5c0fb89f578aa52931d5b` (677,071 bytes).
- **Source Verification:**
  - `src/extension/content-script.ts`: Untouched (Meta Ad Library parser).
  - `src/extension/queryPlanner.ts`: Untouched (Meta taxonomy).
  - `src/extension/advertiserExpander.ts`: Untouched (Meta single-advertiser expansion).
  - `src/extension/creativeSignals.ts`: Untouched (Meta creative analysis).
  - `src/extension/evidenceWaterfall.ts`: Untouched (Meta Relevance Gate v3).

---

## 7. Test Accounting

To avoid misleading aggregate claims, test suites are strictly categorized:

| Category | Suite Name | Description | Tests / Checks | Status in Phase 1 |
| :--- | :--- | :--- | :--- | :--- |
| **A. Re-run Phase 1 Suite** | `test-postfreeze-verification.mjs` | Automated post-freeze workflow & integrity suite | **19 checks** | **19/19 PASSED** (Duration: 1.1s) |
| **A. Re-run Type Check** | `npm run lint` (`tsc --noEmit`) | TypeScript AST compilation check | Entire source | **0 errors, Exit code 0** |
| **B. Frozen Release Suites**| `test-release-gate-matrix.mjs` | Final release criteria verification (Prompt 8) | Historical | Preserved in repository |
| **C. Historical Benchmarks**| Expanded benchmark suite | 240 Relevance, 100 Entity, 60 Web, 50 Creative | **450 labeled cases** | Frozen baseline benchmark |
| **D. Live Smoke Tests** | `test-v3-live-validation.mjs` | Headful browser validation on live platforms | On-demand | Not executed in Phase 1 |
| **E. Unit / Integration** | `test-evidence-waterfall.mjs` | Module-specific deterministic unit tests | 42 test scripts | Preserved in `tests/` |

---

## 8. Final Data-Provenance Model

Every field in the LeadNoria pipeline carries an immutable provenance classification:

```typescript
export type FieldProvenance = 
  | 'USER_PROVIDED'      // Explicit user search keyword, manual URL, or configuration
  | 'WEBSITE_DERIVED'   // Extracted directly from target business's public web domain
  | 'LEADNORIA_DERIVED'  // Computed locally (relevance score, status, entity hash)
  | 'GOOGLE_DERIVED'     // Observed or parsed from Google Maps UI or API
  | 'MIXED';             // Multi-signal record requiring explicit sub-field lineage
```

### Strict Lineage & Lineage Rules:
1. **No Erasure of Provenance:** If a business domain URL is initially discovered from Google Maps, that discovery origin is recorded as `discoveryOrigin: 'GOOGLE_MAPS_VIEW'`.
2. **Field-Level Independence:** Data points extracted from the business's public website (NAP, email, commercial offerings) are marked `WEBSITE_DERIVED`. They do not "cleanse" Google data, but they carry their own independent legal basis as public commercial declarations.
3. **Export Restriction:** CSV and JSON exports will **exclusively** serialize fields with provenance `WEBSITE_DERIVED`, `USER_PROVIDED`, or `LEADNORIA_DERIVED`. Any field with `GOOGLE_DERIVED` provenance will be suppressed from export.

---

## 9. Website Requirement Status

The product requirement supports three operating modes: `WITH_WEBSITE`, `WITHOUT_WEBSITE`, and `BOTH`.

```
FILTER MODE         DESIRED USER EXPERIENCE           TECHNICAL OBSERVABILITY IN MAPS    LEGAL / POLICY PERSISTENT EXPORT
---------------------------------------------------------------------------------------------------------------------------------
WITH WEBSITE        Research only businesses with     Card renders external link icon    PERMITTED: Deep Verification crawls site
                    an active web presence            (href attribute present)           and produces exportable WEBSITE_DERIVED lead.
WITHOUT WEBSITE     Research businesses lacking a     Card lacks website button /        RESTRICTED / EPHEMERAL ONLY: Cannot crawl
                    website (e.g. for web design sales) link attribute in view           independent site; cannot export raw Google DOM.
BOTH                Display all discovered local      Both card variants present         PARTIAL: Businesses with websites export;
                    businesses                        in active tab view                 businesses without websites remain ephemeral.
```

- **Production Constraint:** For businesses lacking a website, LeadNoria can display them ephemerally in the browser view during the active session. However, to remain compliant with Google Terms of Service Section 2, LeadNoria **cannot** save or bulk-export Google Maps-scraped contact details for "WITHOUT WEBSITE" leads into a persistent CSV.

---

## 10. Security Status

- **Hardcoded Secrets:** Zero API keys, tokens, or private credentials exist in the codebase.
- **Remote Services:** Zero backend servers, Vercel endpoints, or remote scraper proxies.
- **Anti-Bot & Evasion:** Zero CAPTCHA solvers, proxy rotation networks, or fingerprint tampering mechanisms.
- **Failure Transparency:** If Google issues a challenge or rate limit, the state machine transitions truthfully to `CHALLENGED` or `RATE_LIMITED` and stops.

---

## 11. Restored 18-Phase Roadmap

The full 18-phase implementation roadmap is formally restored. Each phase represents a discrete milestone with compliance boundaries:

1. **Phase 1: Architecture, Compliance & Safety Lock** *(Current phase — Policy reconciliation & boundaries)*
2. **Phase 2: Competitor Feature Benchmark** *(Market tool feature gaps & compliance analysis)*
3. **Phase 3: Google Maps Product Specification** *(UI workflows, search filters, and user boundaries)*
4. **Phase 4: Maps Discovery Architecture** *(Interactive browser workbench & candidate pointer discovery)*
5. **Phase 5: Maps Extraction Architecture** *(Safe ephemeral pointer extraction; zero raw Google storage)*
6. **Phase 6: Website Requirement Engine** *(WITH / WITHOUT / BOTH website filtering architecture)*
7. **Phase 7: Maps Data Normalization** *(Harmonizing URLs, names, and regional formats)*
8. **Phase 8: Entity Resolution & Deduplication** *(Cross-matching candidates against existing leads)*
9. **Phase 9: Maps Evidence & Relevance Engine** *(Relevance rules based on category, location, and keywords)*
10. **Phase 10: Website Verification Integration** *(Routing discovered domains into Deep Verification)*
11. **Phase 11: Contact & Digital Presence Enrichment** *(Extracting NAP, email, and socials from business sites)*
12. **Phase 12: Advanced Lead Qualification** *(Scoring leads on verified commercial and digital maturity)*
13. **Phase 13: Geographic Expansion & Saturation** *(Managing user-directed viewport shifts without bot evasion)*
14. **Phase 14: Unified Multi-Source Architecture** *(Source Registry integrating Meta + Maps + Web)*
15. **Phase 15: UI/UX Integration** *(Source selection tabs: `[ Meta Ad Library ]` `[ Google Maps ]`)*
16. **Phase 16: Persistence, Recovery & Export** *(BulkStore IndexedDB & RFC-4180 CSV export of website data)*
17. **Phase 17: Security + Regression + Full E2E Testing** *(End-to-end integration and Meta safety audit)*
18. **Phase 18: Final Production Audit & Release** *(Package freeze, checksum validation, and documentation)*

---

## 12. Remaining Risks

1. **Google Terms Interpretation:** While Path C avoids direct bulk harvesting of Google databases, Google's terms broadly define "misuse" and "scraping." Legal counsel may view even ephemeral DOM inspection as a technical violation.
2. **User Expectation Mismatch on "Without Website":** Users expecting a downloadable CSV of businesses with no website will receive only ephemeral in-browser view cards unless an authorized data source is introduced.
3. **Google Maps DOM Volatility:** Even passive in-browser inspection is subject to breaking changes in Google's obfuscated CSS class names and DOM hierarchy.

---

## 13. Remaining Unknowns

1. **Pointer Extraction Stability:** Exact DOM selectors for extracting external website links from the current Google Maps web interface without triggering bot detection.
2. **Viewport Saturation:** How to define discovery completion in an infinite-scroll geographic map interface without automated scrolling scripts.
3. **Cross-Source Entity Resolution Weighting:** Optimal weighting between Meta Ad Library page names and Google Maps business names when both link to the same verified website domain.

---

## 14. Files Changed

- [LEADNORIA-GOOGLE-MAPS-PHASE1-REPORT.md](file:///e:/project%20anti/leadnoria/LEADNORIA-GOOGLE-MAPS-PHASE1-REPORT.md): Updated with complete, reconciled legal analysis, manifest verification, and provenance models.
- **Source Code Files Changed:** **ZERO.** No source code in `src/`, `extension/`, or `dist/` was modified.

---

## 15. Files Untouched

- All Meta research modules (`src/extension/content-script.ts`, `queryPlanner.ts`, `advertiserExpander.ts`, `creativeSignals.ts`).
- All shared core modules (`src/extension/entityResolver.ts`, `evidenceWaterfall.ts`, `websiteVerifier.ts`, `bulkStore.ts`, `bulkProcessor.ts`).
- Extension manifests (`src/extension/manifest.json`, `extension/manifest.json`).
- Release packages (`dist/leadnoria-v1.0.0.zip`, `extension.zip`).

---

## 16. Tests Executed

1. `tests/test-postfreeze-verification.mjs`:
   - Command: `node --import tsx tests/test-postfreeze-verification.mjs`
   - Output: 19 checks executed, 19 passed, 0 failed (Duration: 1.1s).
2. `npm run lint` (`tsc --noEmit`):
   - Command: `cmd.exe /c "npm run lint"`
   - Output: 0 errors, exit code 0.

---

## 17. Final Phase 1 Gate

### GATE DETERMINATION: **PASS — PHASE 2 READY**

- **Justification:**
  1. Policy conclusions have been rigorously reconciled without overclaiming legality or Google approval.
  2. Actual `manifest.json` declarations match the frozen LeadNoria v1.0.0 baseline with 100% precision.
  3. Meta Ad Library implementation is 100% frozen, untouched, and passing regression checks.
  4. The 18-phase implementation roadmap is formally restored with compliance gates at every milestone.
  5. The system is safe, stable, and ready to proceed to **Phase 2: Competitor Feature Benchmark**.
