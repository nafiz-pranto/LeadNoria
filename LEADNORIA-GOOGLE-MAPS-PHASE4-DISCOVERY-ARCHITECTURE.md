# LEADNORIA GOOGLE MAPS — PHASE 4 FINAL ARCHITECTURE RECONCILIATION
**Document Version:** 4.0.0-FINAL-RECONCILED  
**Target Product Branch:** Google Maps Development Branch (Target Next Release)  
**Production Frozen Baseline:** LeadNoria v1.0.0 (Meta Ad Library Engine Intact)  
**Date:** 2026-09-29  
**Status:** Architecture Investigation & Policy-Gated Decision Baseline (Implementation-Neutral)  

---

## 1. Executive Result

This document presents the definitive, reconciled technical investigation, browser permission analysis, data-boundary specification, and architectural go/no-go determination for a future Google Maps discovery layer in LeadNoria.

### Primary Architecture Determinations:
1. **Zero Scraping Implementation:** This phase is an architectural investigation only. No Google Maps DOM extraction code, scraping loops, or content scripts have been implemented.
2. **`activeTab` + Side Panel Critical Finding:** Official Chrome MV3 documentation explicitly documents `activeTab` grants via action clicks, context menus, and keyboard commands. It does **not** establish that clicking a button inside an extension Side Panel document automatically grants `activeTab` to the adjacent web tab. Therefore, Path B is **TECHNICALLY FEASIBLE (MECHANISM-DEPENDENT) / SOURCE-POLICY REVIEW REQUIRED**.
3. **Website-First Fallback (Path A & Path H):** Formally designated as **LOW GOOGLE-SOURCE EXPOSURE / WEBSITE-FIRST FALLBACK** (Path A) and **MANUAL WEBSITE-FIRST FALLBACK** (Path H). These paths have no direct Google Maps dependency, but remain subject to target-site terms, robots.txt, access controls, privacy/security requirements, and applicable law.
4. **LeadNoria Product Rejections:** Automated infinite scrolling, automated clicking, pagination harvesting loops, coordinate-grid sweeps, map panning coverage farming, proxy rotation, and CAPTCHA solving are confirmed as internal **LEADNORIA PRODUCT RULES (PRODUCT REJECTED)** rather than universal legal claims.
5. **Data Boundary & Anti-Laundering:** Discovered website URLs retain immutable `GOOGLE_DERIVED` provenance. Independent website fetches produce new `WEBSITE_DERIVED` evidence without retroactively relabeling the pointer. Raw Google directory content (places, reviews, ratings) remains non-persistable and non-exportable.
6. **Code Freeze Preservation:** LeadNoria v1.0.0 remains frozen (checksum `bbb3d9f16e1efde29e77af0bf2ffb5e30f20f9b50ad5c0fb89f578aa52931d5b`). Zero production source files or extension manifests have been modified.

---

## 2. ActiveTab + Side Panel Invocation Finding

### Chrome Documentation Analysis:
According to official Chrome Extensions Manifest V3 documentation, `activeTab` provides temporary host access to the currently active tab when the user **invokes** the extension. Documented invocation triggers are:

| Invocation Mechanism | Documented in Chrome Docs? | Status for activeTab Grant | Operational / UX Consequence |
| :--- | :--- | :--- | :--- |
| **A. Toolbar Action Click (`chrome.action`)** | **YES** | **DOCUMENTED** | User clicks the extension action icon in the browser toolbar. Grants temporary host access to active tab. |
| **B. Context Menu Item (`chrome.contextMenus`)** | **YES** | **DOCUMENTED** | User right-clicks inside the web page and selects an extension context menu entry. Grants `activeTab`. |
| **C. Keyboard Command (`chrome.commands`)** | **YES** | **DOCUMENTED** | User presses a configured shortcut (e.g. `Alt+Shift+L`). Grants `activeTab`. |
| **D. Side Panel Button Click (`side_panel`)** | **NO** | **NOT ESTABLISHED / IMPLEMENTATION-TEST-REQUIRED** | User clicks a button inside `sidepanel.html`. Chrome docs do **not** state that clicks within extension page documents grant `activeTab` to active tabs. |
| **E. Content Script User Gesture** | **NO** | **NOT ESTABLISHED** | User clicks within the page DOM; content scripts cannot arbitrarily request `activeTab`. |
| **F. Omnibox Suggestion (`chrome.omnibox`)** | **YES** | **DOCUMENTED** | User selects an omnibox suggestion. |

### Architectural Decision on Side Panel Invocation:
The extension cannot assume that clicking "Start Research" inside the Side Panel grants `activeTab`. If empirical testing in Phase 5 confirms that Side Panel clicks do not grant `activeTab`, LeadNoria will evaluate compliant UX alternatives:
- **Option 1 (Action-Initiated Grant):** User clicks the LeadNoria Action toolbar icon on the target Google Maps tab. This establishes the documented `activeTab` grant and opens/focuses the Side Panel for the session.
- **Option 2 (Context Menu Grant):** User right-clicks on the target page and selects *"Research with LeadNoria"*, triggering a documented `activeTab` grant.
- **Option 3 (Keyboard Shortcut):** User invokes a keyboard command to attach the active tab.
- **Option 4 (Path A Fallback):** User utilizes the Low Google-Source Exposure Fallback by entering/pasting business domains directly into the Side Panel without needing `activeTab`.

```
CORRECTED USER GESTURE PIPELINE:
[ Extension User Gesture (Action / Context Menu / Command) ]
                            ↓
[ Documented Chrome activeTab Grant Mechanism ]
                            ↓
[ Is Temporary Host Access Granted to Active Tab? ]
         ├─► NO  ──► Display Action Required / Route to Path A
         └─► YES
               ↓
[ Architectural Policy Gate Evaluation ]
               ↓
[ Future Source Workflow (Transient Evaluation) ]
```

---

## 3. Final Discovery Path Matrix

| Path | Technical Feasibility | Permission Model | Policy Status | Product Status |
| :--- | :--- | :--- | :--- | :--- |
| **Path A: User Domain** | **YES** | Existing permissions (`storage`, `sidePanel`, optional `https://*/*`) | No direct Google Maps dependency; target-site rules apply | **LOW GOOGLE-SOURCE EXPOSURE / WEBSITE-FIRST FALLBACK** |
| **Path B: `activeTab`** | **YES / mechanism-dependent** | `activeTab` + `scripting` if supported | Source-policy review required | **INVESTIGATE** |
| **Path C: Optional Host** | **YES** | `optional_host_permissions` | Source-policy review required | **NOT SELECTED** |
| **Path D: Static Script** | **YES** | Persistent host + `content_scripts` | Source-policy review required | **NOT SELECTED** |
| **Path E: Programmatic** | **YES** | `scripting` + host / `activeTab` | Source-policy review required | **INVESTIGATE** |
| **Path F: Official API** | **YES** | API / network + credential model | API-specific terms review | **FUTURE** |
| **Path G: Hybrid** | **YES** | Depends on discovery mechanism | Source-specific review | **POLICY-GATED** |
| **Path H: Manual Website Input**| **YES** | Existing permissions (Clipboard / Form) | No direct Google Maps dependency; target-site rules apply | **MANUAL WEBSITE-FIRST FALLBACK** |

---

## 4. Permission Model & Least-Privilege Analysis

```
PERMISSION SURFACE HIERARCHY (LEAST TO MOST PRIVILEGED):

1. Zero Additional Permissions (Path A / Path H)
   - Scope: Zero interaction with Google Maps tabs.
   - Status: Complete isolation; lowest possible attack surface.

2. activeTab + chrome.scripting (Path B / Path E)
   - Scope: activeTab is a least-privilege candidate for temporary host access 
            when the extension can legitimately obtain the grant through a documented user invocation.
   - Lifetime: Bound to active tab; revoked on navigation away or tab closure.
   - Status: INVESTIGATE (Subject to documented invocation mechanism).

3. optional_host_permissions (Path C)
   - Scope: Persistent access to google.com/maps across sessions.
   - Status: NOT SELECTED (Excessive privilege).

4. Static host_permissions + content_scripts (Path D)
   - Scope: Automatic execution on every Google Maps tab opened by user.
   - Status: NOT SELECTED (Maximum privilege / Brittle footprint).
```

### Frozen Manifest Baseline Verification:
- **Declared Permissions:** `storage`, `tabs`, `scripting`, `sidePanel`.
- **Declared Host Permissions:** `https://www.facebook.com/ads/library/*`, `https://web.facebook.com/ads/library/*`.
- **Declared Optional Host Permissions:** `https://*/*`.
- **Status:** **Zero manifest modifications.**

---

## 5. Chrome Capability vs. Google Authorization

A core architectural principle governing Phase 4 is the decoupling of browser technical capability from data source legal authorization:

```
┌────────────────────────────────────────┐
│        CHROME EXTENSION LAYER          │
│   activeTab / scripting permissions    │
│   Grants technical browser ability     │
└────────────────────────────────────────┘
                   ≠
┌────────────────────────────────────────┐
│          SOURCE POLICY LAYER           │
│   Google Consumer Terms / Target Terms │
│   Governs data acquisition & usage     │
└────────────────────────────────────────┘
                   ≠
┌────────────────────────────────────────┐
│       LEADNORIA PRODUCT RULES          │
│   Conservative internal boundaries     │
│   Rejects bulk scraping & automation   │
└────────────────────────────────────────┘
```
- Browser permissions allow an extension to inspect DOM elements in an active tab.
- Such permissions do **not** grant a license, waiver, or contractual authorization under Google Terms of Service or destination website terms.
- LeadNoria maintains strict product rejection of mass-extraction techniques even where technical mechanisms exist.

---

## 6. Google End-User Terms Scope & Policy Boundary

### Precise Scope of Google Maps End User Additional Terms:
Current official Google Maps End User Additional Terms prohibit:
- Redistribution or sale of Google Maps or Google Maps content.
- Copying content, except where otherwise permitted by law or terms.
- Mass downloading or creating bulk feeds of content.
- Using Google Maps to create or augment certain mapping-related datasets, including business listings databases, mailing lists, or telemarketing lists, for use in a service that is a substitute for or substantially similar to Google Maps.

*Reconciliation Rule:* LeadNoria avoids broadening this contractual wording into a universal claim that all lead lists are unlawful in every scenario. Rather, bulk extraction and copying remain restricted, and the exact intended use must be assessed against current terms.

---

## 7. LeadNoria Product Rejections (Internal Safety Rules)

Regardless of the external legal scope, LeadNoria enforces conservative internal product rules:

```
LEADNORIA PRODUCT REJECTED:
- Automated harvesting loops
- Infinite scrolling automation
- Automated pagination harvesting
- Coordinate-grid scraping
- Automated map panning coverage farming
- Automated clicking to expand card listings
- Proxy rotation networks
- CAPTCHA solving integrations
- Browser fingerprinting and stealth evasion
- Exploitation of private or reverse-engineered Google RPC endpoints
```

*Classification:* **LEADNORIA PRODUCT RULES.** These rules reflect LeadNoria's ethical, architectural, and risk-management boundaries rather than universal legal conclusions.

---

## 8. API Data, Credential & Caching Model (Path F)

An official Google Maps Platform integration requires separating technical capability from contractual permissions:

### Credential & Network Architecture:
1. **Secret Storage:** Requires `chrome.storage.local` to store user-supplied API credentials. Keys must never be hardcoded, bundled, or committed to source control. User credentials must be treated as local secrets.
2. **Network Request Capability:** Direct background requests from an MV3 service worker to `https://places.googleapis.com/*` require evaluation:
   - Service worker `fetch()` compatibility: **DOCUMENTED**.
   - Host permission requirements for API origins: **IMPLEMENTATION-TEST-REQUIRED**.
   - CORS and header constraints: **DOCUMENTED**.

### Service-Specific Caching & Retention Rules:
API-specific caching and retention permissions apply according to the exact Google Maps Platform Service Specific Terms and documentation for the specific service and field:
- **Place ID Caching:** The official Platform terms permit caching official `GOOGLE_API_PLACE_ID` values for identification and referencing.
- **Latitude / Longitude Caching:** Permitted for pre-specified operational windows (e.g. 30 days) under specific service terms.
- **General Content:** Arbitrary Places API content cannot be bulk downloaded or cached to create a persistent local directory.
- **Export Rule:** Export eligibility must be evaluated field-by-field and service-by-service under applicable Google Maps Platform terms, documentation, attribution rules, and LeadNoria product rules. LeadNoria may product-reject bulk export of API data even where narrower terms permit it.
- **Web vs. API Separation:** A web-scraped Place ID (`GOOGLE_WEB_PLACE_ID`) does **not** inherit the API-specific caching permissions governing `GOOGLE_API_PLACE_ID`.

---

## 9. Website-First Fallback Architecture (Path A & Path H)

### Existing Tested Capability vs. Future Fallback:
1. **Existing Tested Capability (v1.0.0):** LeadNoria already contains a production-tested local Deep Verification Engine (`websiteVerifier.ts`), multi-signal entity resolver (`entityResolver.ts`), and RFC-4180 CSV export with formula injection defense.
2. **Future Google Maps Fallback (Path A):** Provides an operational prospecting workflow with **low Google-source exposure**:
   - User supplies target business domains directly (manual paste or batch CSV import).
   - LeadNoria verifies the domains directly via same-origin fetch (max 5 pages, 10s timeout, 12 parking checks).
   - Extracts independently declared NAP, emails, and social profiles.
   - Computes commercial intent and category qualification scores.
   - Exports clean lead files.
3. **Manual Fallback (Path H):** User manually transfers a single observed domain via clipboard.
4. **Boundary Note:** Neither Path A nor Path H is considered risk-free. Both paths remain subject to:
   - Target-site terms of service.
   - Destination `robots.txt` and access controls.
   - Applicable privacy and data protection law.
   - LeadNoria data-provenance and etiquette rules.

---

## 10. Provenance Model & Anti-Laundering Chain

```
┌────────────────────────────────────────────────────────┐
│ STEP 1: POINTER DISCOVERY                              │
│ Observed on Google Maps UI                             │
│ Field: websiteUrl                                      │
│ Provenance: GOOGLE_DERIVED                             │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ STEP 2: ARCHITECTURAL POLICY GATE                      │
│ Evaluates: Is direct domain request permitted?         │
│ If BLOCKED → Discard pointer immediately.               │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ STEP 3: INDEPENDENT TARGET-SITE FETCH                  │
│ Local verifier issues fetch() directly to business site│
│ Subject to destination robots.txt & site terms         │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ STEP 4: INDEPENDENT EVIDENCE EXTRACTION                │
│ Fields: verifiedName, verifiedAddress, phone, email    │
│ Provenance: WEBSITE_DERIVED (New Independent Evidence) │
│ (Originating discovery pointer remains GOOGLE_DERIVED) │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ STEP 5: LEADNORIA QUALIFICATION                        │
│ Fields: relevanceScore, qualificationStatus            │
│ Provenance: LEADNORIA_DERIVED                          │
└────────────────────────────────────────────────────────┘
```

- **Fundamental Distinction:**
  $$\text{SOURCE PROVENANCE} \neq \text{PERSISTENCE ELIGIBILITY} \neq \text{EXPORT ELIGIBILITY}$$
  - `GOOGLE_DERIVED` $\rightarrow$ Not automatically persistable; policy-gated.
  - `WEBSITE_DERIVED` $\rightarrow$ Persistable and exportable **only** upon passing target-site and LeadNoria eligibility rules.
  - `USER_PROVIDED` $\rightarrow$ Subject to destination site rules.
  - `LEADNORIA_DERIVED` $\rightarrow$ Algorithmic output; cannot erase underlying source provenance.

---

## 11. Security Origin Model

Security validation must not rely on a bare or hardcoded string (e.g. `origin === "https://www.google.com"`). The architecture specifies a multi-factor origin and session validation model:

```typescript
export interface SessionValidationContext {
  readonly expectedTabId: number;
  readonly expectedRunId: string;
  readonly expectedSource: 'META_AD_LIBRARY' | 'GOOGLE_MAPS' | 'USER_DIRECT';
  readonly allowedHostPatterns: readonly string[]; // e.g. ["https://www.google.com/maps/*", "https://maps.google.com/*"]
  readonly permissionEpoch: number;
  readonly accessGrantState: 'GRANTED' | 'EXPIRED' | 'REVOKED';
}
```

### Validation Rules:
1. `message.sender.tab.id === session.expectedTabId`.
2. `session.allowedHostPatterns.some(pattern => matchesUrlPattern(message.sender.url, pattern))`.
3. `message.runId === session.expectedRunId`.
4. `message.permissionEpoch === session.permissionEpoch`.
5. `session.accessGrantState === 'GRANTED'`.
6. Messages failing any check are rejected, dropped, and logged as security anomalies.

---

## 12. Message Protocol & Tab Ownership

### Tab Ownership Lock Tuple:
$$\text{Session Lock} = (\text{RUN\_ID}, \text{TAB\_ID}, \text{WINDOW\_ID}, \text{SOURCE}, \text{ACCESS\_GRANT\_STATE}, \text{PERMISSION\_EPOCH})$$

### Message Definitions:
- `START_RESEARCH`: Initiates research configuration.
- `ATTACH_TO_TAB`: Evaluates user gesture and requests session attachment.
- `DETACH_FROM_TAB`: Cleans up attachment and resets volatile buffers.
- `ACCESS_GRANTED`: Confirms temporary tab access obtained via documented user invocation.
- `ACCESS_DENIED`: Informs UI that invocation grant failed or was revoked.
- `CANDIDATE_AVAILABLE`: **Defined strictly as:** *"A candidate has become available through an architecture whose discovery mechanism has already passed the relevant technical and policy gates."* Does not imply that Google-derived content was captured or persisted.
- `POLICY_BLOCK`: Indicates that candidate ingestion was halted by the architectural policy gate.
- `TAB_NAVIGATED`: Emitted when research tab navigates away from allowed host pattern.
- `TAB_CLOSED`: Emitted when research tab is closed by user or browser.
- `STOP_RESEARCH`: User abort signal.
- `RECOVERY_REQUIRED`: Emitted following unexpected service worker termination.

### Concurrency Rule:
- **Strictly Exclusive Concurrency (Single Active Session):** Documented as a **PRODUCT SIMPLICITY / SAFETY DECISION**. Only one active research session may run across the extension at any time.

---

## 13. GO / NO-GO Rules

### GO Criteria for Implementation:
An architecture may proceed to implementation **only if all** of the following conditions are met:
1. Technical mechanism is documented and reproducible under Manifest V3.
2. Invocation model obtains `activeTab` through an officially documented Chrome user gesture.
3. Field-level provenance is immutably preserved (`GOOGLE_DERIVED` pointer never relabeled).
4. Four-layer data boundary prevents raw Google content from persisting or exporting.
5. Zero automated bot actions (no scrolling, clicking, panning, or grid sweeps).
6. Zero private RPC endpoints or reverse-engineered APIs.
7. Zero evasion techniques (no proxies, no CAPTCHA solving, no fingerprinting).
8. Applicable terms of service for the specific mechanism are reviewed and deemed permissible.

### NO-GO Criteria (Immediate Block / Rejection):
An architecture is classified **NO-GO** if it requires:
1. Automated bulk harvesting or pagination loops.
2. Persistent broad host permissions (`https://www.google.com/*`).
3. Static content scripts running continuously on Google Maps.
4. Persistent storage or bulk export of raw Google place profiles, reviews, or listings.
5. Circumvention of rate limits, challenges, or platform access controls.

---

## 14. Phase 5 Handoff Specification

Phase 5 (Extraction Architecture & Data Normalization) is handed:
1. **Selected Candidate Architecture:** **Path B (`activeTab` with explicit user gesture)** as the prospective browser model, paired with **Path A (Website-First Fallback)** as the operational fallback.
2. **Side Panel Invocation Open Question:** Phase 5 must empirically verify whether Side Panel button clicks trigger `activeTab`, or whether the Action toolbar icon / Context Menu (Option 1 / Option 2) must be used.
3. **Explicitly Rejected Architectures:** Path C (Optional host permissions) and Path D (Static content scripts) are **rejected**.
4. **Data Boundary Enforcement:** Strict four-layer model; raw Google data is non-persistable and non-exportable.
5. **Mandatory Blockers for Phase 5:** Phase 5 **must not** write Google DOM extraction selectors or live scraping code until the specific extraction mechanism is reviewed against platform terms.

---

## 15. Files Changed

- `LEADNORIA-GOOGLE-MAPS-PHASE4-DISCOVERY-ARCHITECTURE.md`: Updated to Version 4.0.0-FINAL-RECONCILED.
- *Zero other files were created or modified.*

---

## 16. Files Untouched

- `manifest.json`: Untouched (100% frozen).
- `src/extension/manifest.json`: Untouched (100% frozen).
- `src/extension/service-worker.ts`: Untouched (100% frozen).
- `src/extension/content-script.ts`: Untouched (100% frozen).
- `src/extension/evidenceWaterfall.ts`: Untouched (100% frozen).
- `dist/leadnoria-v1.0.0.zip`: Untouched (SHA-256: `bbb3d9f16e1efde29e77af0bf2ffb5e30f20f9b50ad5c0fb89f578aa52931d5b`).
- All production source files, build scripts, and test suites remain untouched.

---

## 17. Verification & Integrity Checks

1. **Production Code Freeze:** Zero lines of production code or extension manifests were added or modified.
2. **TypeScript Compilation:** Validated via `npx tsc --noEmit` (0 errors, clean AST).
3. **Post-Freeze Validation Suite:** Validated via `npx tsx tests/test-postfreeze-verification.mjs` (19/19 checks passed).
4. **Git Repository Status:** Clean tree with zero modified tracked files.

---

## 18. Final Phase 4 Gate

# LEADNORIA GOOGLE MAPS — PHASE 4 FINAL GATE

### DETERMINATION: **PASS — PHASE 5 READY**

### Justification:
- **`activeTab` + Side Panel Mechanism Reconciled:** The document explicitly avoids assuming that Side Panel clicks grant `activeTab`. Documented triggers (toolbar action, context menu, commands) are identified with compliant UX options specified for Phase 5 empirical validation.
- **Terminology Cleaned:** Every occurrence of "unencumbered" and unsupported legal safety claims removed; Path A and Path H classified with "LOW GOOGLE-SOURCE EXPOSURE / WEBSITE-FIRST FALLBACK" and recognized as subject to destination site terms, robots.txt, access controls, and applicable law.
- **Google Policy Scope Accurate:** Google Maps End User Additional Terms stated precisely without overclaiming universal prohibition.
- **LeadNoria Product Rules Preserved:** Automation mechanisms classified under internal product rejection rules.
- **API Model Decoupled:** Secret storage, network fetch permissions, service-specific caching (`GOOGLE_API_PLACE_ID` vs `GOOGLE_WEB_PLACE_ID`), and export eligibility are properly separated.
- **Security Origin Model Robust:** Bare origin checking replaced with multi-factor validation (`tabId`, `runId`, `allowedHostPatterns`, `permissionEpoch`, `accessGrantState`).
- **Data Boundary & Anti-Laundering Complete:** Provenance invariance enforced; candidate availability decoupled from capture; raw Google listings remain non-persistable and non-exportable.
- **Zero Implementation / Zero Regressions:** No scraping code written; Meta Ad Library v1.0.0 remains 100% frozen and operational.
