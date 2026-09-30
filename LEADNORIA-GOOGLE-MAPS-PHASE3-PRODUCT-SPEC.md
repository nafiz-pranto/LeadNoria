# LEADNORIA GOOGLE MAPS — PHASE 3 FINAL RECONCILIATION
**Document Version:** 3.0-FINAL-RECONCILED  
**Target Product Branch:** Google Maps Development Branch (Target Next Release)  
**Production Frozen Baseline:** LeadNoria v1.0.0 (Meta Ad Library Engine Intact)  
**Date:** 2026-09-29  
**Status:** Product Specification Baseline (Implementation-Neutral, Policy-Gated & Provenance-Reconciled)  

---

## 1. Executive Result

This document establishes the definitive, implementation-neutral product specification for integrating local-business research capabilities into LeadNoria. Following audits across Master Correction Prompts #3A, #3B, and #3C, this specification resolves all previous ambiguities concerning platform terms, data provenance, destination-site access rules, and export eligibility.

Key Reconciliation Conclusions:
1. **Separation of Policy Contexts:** Google Consumer Website Terms, Google Maps Platform Terms, Maps JavaScript API Policies, and Chrome Manifest V3 developer policies are formally separated into independent legal and technical layers.
2. **Provenance Integrity:** A website URL observed in Google Maps retains immutable `GOOGLE_DERIVED` provenance upon discovery. Subsequent requests to that domain yield new, independent `WEBSITE_DERIVED` evidence without retroactively relabeling the originating pointer.
3. **Core Provenance Distinction:** `SOURCE PROVENANCE ≠ PERSISTENCE ELIGIBILITY ≠ EXPORT ELIGIBILITY`. Destination website data is not automatically persistable or exportable; eligibility requires independent authorization and adherence to target-site access rules.
4. **Product Rejections:** Automated infinite scrolling, pagination harvesting, coordinate sweeps, map panning coverage farming, click expansion, proxy rotation, and CAPTCHA solving are formally classified as **LEADNORIA PRODUCT REJECTED**.
5. **Freeze Preservation:** Zero production source code is modified, `manifest.json` remains untouched, no broad permissions or API keys are introduced, and Meta Ad Library v1.0.0 remains 100% frozen and operational.

---

## 2. Corrections Applied

| Ref ID | Correction Category | Previous Phrasing / Assumption | Corrected Reconciliation Standard |
| :--- | :--- | :--- | :--- |
| **CORR-01** | **Direct Website Crawl Status** | "Website Independent Crawl = PERMITTED" | **TECHNICALLY FEASIBLE; SUBJECT TO TARGET-SITE TERMS, ROBOTS/ACCESS CONTROLS, APPLICABLE LAW, AND LEADNORIA DATA-PROVENANCE RULES.** Google Maps and target websites represent separate policy contexts. |
| **CORR-02** | **User-Provided Domain Status** | "USER_PROVIDED_DOMAIN = automatically permitted" | **TECHNICALLY FEASIBLE; TARGET-SITE RULES APPLY; LEADNORIA POLICY CHECK REQUIRED.** User input does not waive or override destination-site access restrictions. |
| **CORR-03** | **Export Rule** | "WEBSITE_DERIVED = automatically exportable" | `WEBSITE_DERIVED + AUTHORIZED/PERMITTED ACQUISITION + LEADNORIA EXPORT RULES = EXPORTABLE CANDIDATE`. Export eligibility is a separate decision boundary. |
| **CORR-04** | **Persistence Rule** | "WEBSITE_DERIVED = automatically persistable" | `PROVENANCE + ACQUISITION STATUS + RETENTION RULE + LEADNORIA PERSISTENCE POLICY = PERSISTABLE`. Field-level provenance survives verification. |
| **CORR-05** | **Policy Context Separation** | Mixed Consumer Terms with Platform Terms & JS API policies | Established a 4-tier Policy Context Matrix treating Consumer ToS, Platform ToS, JS API policies, and MV3 docs as distinct contracts. |
| **CORR-06** | **Website Pointer Provenance** | Initial domain pointer labeled `WEBSITE_DERIVED` | Formally designated as `GOOGLE_DERIVED` upon discovery; retains discovery lineage even if independently visited. |
| **CORR-07** | **Anti-Laundering Chain** | Ambiguous boundary between Maps observation and website data | Defined formal transformation: `GOOGLE_DERIVED` discovery produces independent `WEBSITE_DERIVED` evidence; no source reclassification. |
| **CORR-08** | **Automated Scrolling / Clicking** | Categorically labeled as "universally prohibited by law" | Reclassified to: **TECHNICALLY FEASIBLE; LEADNORIA PRODUCT DECISION = REJECT; POLICY/TERMS STATUS = REQUIRES SOURCE-SPECIFIC REVIEW.** Avoids legal overclaiming. |
| **CORR-09** | **Ephemeral Display Status** | Assumed active-session display was automatically permitted | Reclassified to: **TECHNICALLY FEASIBLE; PRODUCT STATUS = POLICY-GATED; POLICY STATUS = REQUIRES SOURCE-SPECIFIC REVIEW.** |
| **CORR-10** | **Architectural Policy Gate** | Described as an autonomous legal engine | Reclassified as an **architectural decision boundary** based on documented rules, approved policy, provenance, retention, and export rules. |
| **CORR-11** | **Passive DOM Observation** | Promoted as "compliant" or "safe" | Maintained as: **TECHNICALLY FEASIBLE; POLICY STATUS = UNRESOLVED / REQUIRES REVIEW; PRODUCT STATUS = POLICY-GATED.** |
| **CORR-12** | **API Place ID Handling** | Assumed Place IDs are universally persistable | Separated `GOOGLE_API_PLACE_ID` (governed by Platform Terms) from `GOOGLE_WEB_PLACE_ID` (governed by Consumer ToS). |
| **CORR-13** | **Chrome Permissions vs Policy** | Inferred Chrome capability implies Google permission | Documented: Chrome grants **technical browser capability**; Google terms govern **source usage**. Layers are independent. |
| **CORR-14** | **Compliance Claims Removal** | Used terms like "100% compliant", "legally safe", "guaranteed" | Removed or replaced with: "LOWER POLICY EXPOSURE", "DOCUMENTED", "POLICY-GATED", "TERMS REVIEW REQUIRED", "PRODUCT-REJECTED". |
| **CORR-15** | **User Journey Wording** | Implied candidates are definitely captured from Google | Replaced with: `Session Initiation → interaction model evaluation → policy gate → candidate availability where permitted`. |
| **CORR-16** | **Phase 4 Handoff Scope** | Assumed immediate DOM scraper implementation | Structured around 8 investigative research areas; explicitly bars beginning with "implement DOM scraper". |

---

## 3. Product Vision & Positioning

**Product Tagline:** *"Business lead research from real public signals."*

LeadNoria is an in-browser prospecting and research workbench designed to identify, verify, and qualify local businesses from public web presence signals while maintaining strict compliance with platform policies and data-source boundaries.

LeadNoria is **not**:
- A bulk scraper designed to mass-extract or harvest proprietary directory databases.
- A crawler that circumvents platform rate limits, access controls, or terms of service.
- A cloud surveillance service that aggregates or resells private contact lists.

The Google Maps integration vision is an **interactive, policy-gated research workbench**: a user-directed interface supporting local prospecting, digital presence evaluation (e.g. identifying businesses without active websites), direct website verification through LeadNoria's local Deep Verification Engine, and RFC-4180 CSV export of independently verified data with field-level provenance tracking.

---

## 4. User Journey

```
[ User Initiates Research Session ]
                 ↓
[ Interaction Model Evaluation ]
  - User configures industry keyword, target location, country, and website mode
  - Extension evaluates requested interaction mechanism against platform boundaries
                 ↓
[ Architectural Policy Gate ]
  - Evaluates whether candidate pointer acquisition is authorized under active mode
  - Enforces field retention and source-specific access constraints
                 ↓
[ Candidate Availability (Where Permitted) ]
  - Candidate pointer identified (e.g. user-supplied domain or permitted discovery)
  - Raw consumer directory listings remain non-persistable and non-exportable
                 ↓
[ Independent Target-Site Deep Verification ]
  - LeadNoria crawls business website directly (same-origin HTTP fetch)
  - Subject to destination-site terms, robots.txt/access controls, and etiquette
  - Evaluates DNS, HTTP status, and 12 negative parking checks
  - Extracts independently declared NAP, email, and social profiles
                 ↓
[ Evidence Waterfall Qualification ]
  - Evaluates commercial legitimacy, category relevance, and location match
  - Generates deterministic qualification score and entity resolution hashes
                 ↓
[ Persistence & Export Decisions ]
  - Evaluates record against persistence rules: PROVENANCE + ACQUISITION + RETENTION = PERSISTABLE
  - Evaluates record against export rules: WEBSITE_DERIVED + AUTHORIZED ACQUISITION = EXPORTABLE
  - 1-click RFC-4180 CSV export with active formula injection defense
```

### Detailed Personas:
1. **Digital Agency Founder / Sales Prospector ("Elena"):**
   - *Goal:* Prospect local service businesses (contractors, dental clinics, mechanics) lacking a functional website ("WITHOUT WEBSITE" mode) to propose web design and local SEO packages.
   - *Requirement:* Clear detection of missing or broken web presences without false positives from parked or squatted domains; strict policy gating for raw Google listings.
2. **B2B SDR / Account Executive ("Marcus"):**
   - *Goal:* Build targeted outreach lists of verified, operating local businesses ("WITH WEBSITE" mode) with verified business names, telephone numbers, and direct contact points.
   - *Requirement:* Clean, live business websites, multi-signal deduplication, deterministic qualification scores, and formula-injection-safe CSV export.

---

## 5. Website Modes & Research Configurations

### Research Modes:
- **Preset Mode:** 1-click industry research configurations pre-populating verified category taxonomies (Dental Clinics, Plumbing & HVAC, Roofing Contractors, Law Firms, Real Estate, Restaurants, B2B Services).
- **Custom Mode:** User-specified research parameters including Project Name, Business Category/Keywords, Target Location, Country Selector, and Website Mode.

### Website Requirement Modes:

| Mode | User-Intent Requirement | Technical Specification | Data Boundary & Policy Status |
| :--- | :--- | :--- | :--- |
| **WITH WEBSITE** | Prospecting businesses with active digital presences for B2B sales/software outreach. | Identifies business domain pointer; deep verifier requests domain directly. | **PLANNED + GATED:** Target site crawled directly; independently verified signals persistable and exportable subject to eligibility checks. |
| **WITHOUT WEBSITE** | Prospecting businesses lacking websites to pitch digital presence services. | Identifies listings where website link is absent in active view. | **POLICY-GATED:** Raw Google directory entries cannot be bulk extracted; display is policy-gated and subject to source review. |
| **BOTH** | Comprehensive local market density analysis across online and offline businesses. | Displays candidates across both categories in active workspace session. | **PARTIAL:** Verified business sites exportable; website-absent records remain policy-gated or ephemeral. |

### Country & Location Models:
- **Country Selector:** Searchable dropdown containing ISO 3166-1 alpha-2 country codes. Guides E.164 phone number parsing, currency detection, and regional dial-code formatting. WhatsApp link formatting is permitted only when an E.164-normalizable public telephone number is independently extracted from a verified website.
- **Location Model:** Supports city, metropolitan area, state/province, or postal code. Strictly bounded by user-assisted search context; automated coordinate-grid scraping and viewport panning sweeps are prohibited.

---

## 6. Candidate / Data Lifecycle

```
[ RESEARCH_REQUESTED ]           User configures parameters in LeadNoria interface
          ↓
[ INTERACTION_MODEL_SELECTED ]   Workflow selected (Path A workbench, Path B API, Path C user-domain)
          ↓
[ POLICY_GATE ]                  Architectural evaluation against source terms & data rights
          ↓
          ├─► [ POLICY_BLOCKED ] ──► [ DISCARD / USER ACTION REQUIRED ]
          ↓
[ CANDIDATE_AVAILABLE ]          Domain pointer available for independent investigation
          ↓
[ INDEPENDENT_SOURCE_VERIFY ]    Local crawler fetches target website directly (same-origin)
          ↓
[ QUALIFICATION ]                Evidence Waterfall computes category, location & commercial scores
          ↓
[ PERSISTENCE_DECISION ]         Evaluates: PROVENANCE + ACQUISITION + RETENTION = PERSISTABLE
          ↓
[ EXPORT_DECISION ]              Evaluates: WEBSITE_DERIVED + AUTHORIZED ACQUISITION = EXPORTABLE
```

### Four-Layer Data State Separation:
- **Layer 1: User-Controlled Context:** Search keywords, target location, country selection, website filter mode. Fully user-owned and persistable.
- **Layer 2: External Research Context:** Ephemeral data observed during browsing (e.g. Google Maps tab, external directory). Session-bound only; not automatically persistable or exportable.
- **Layer 3: Independently Verified Lead Data:** Data extracted directly from the target business's public domain via Deep Verification (NAP, services, emails, public socials).
- **Layer 4: LeadNoria-Derived Results:** Computed algorithmic outputs (qualification status, commercial intent score, entity resolution hashes).

---

## 7. Provenance Model & Anti-Laundering Chain

### Provenance Classification:
```typescript
export type FieldProvenance = 
  | 'USER_PROVIDED'      // Explicit user input keyword, location, or uploaded domain
  | 'WEBSITE_DERIVED'   // Extracted directly from target business's public web domain
  | 'LEADNORIA_DERIVED'  // Computed locally (relevance score, status, entity hash)
  | 'GOOGLE_DERIVED'     // Observed or parsed from Google Maps consumer web UI
  | 'GOOGLE_API_DERIVED' // Retrieved via authorized Google Maps Platform API request
  | 'MIXED';             // Multi-signal record requiring explicit sub-field lineage
```

### The Formal Anti-Laundering Chain:
```
GOOGLE_DERIVED (Website URL pointer observed in Google Maps)
     ↓
INDIVIDUAL FIELD / VALUE (Domain pointer: https://example.com)
     ↓
MAY PRODUCE NEW WEBSITE_REQUEST (Subject to target-site access rules & law)
     ↓
WEBSITE_DERIVED CONTENT (NAP, services, emails extracted directly from example.com)
     ↓
LEADNORIA_DERIVED QUALIFICATION (Algorithmic score computed on independent evidence)
```

### Core Invariance Principles:
1. **Provenance Invariance:** `WEBSITE_DERIVED` content represents **new independent evidence**, not a source reclassification. The originating discovery pointer remains `GOOGLE_DERIVED`.
2. **Fundamental Distinction:**
   $$\text{SOURCE PROVENANCE} \neq \text{PERSISTENCE ELIGIBILITY} \neq \text{EXPORT ELIGIBILITY}$$
   - `GOOGLE_DERIVED` $\rightarrow$ Not automatically persistable; policy-gated.
   - `WEBSITE_DERIVED` $\rightarrow$ Not automatically persistable or exportable; subject to target-site terms and acquisition eligibility.
   - `USER_PROVIDED` $\rightarrow$ Not automatically exportable if combined with restricted destination data.
   - `LEADNORIA_DERIVED` $\rightarrow$ Algorithmic output; cannot erase underlying source provenance.

### Website Domain Pointer States:
- `GOOGLE_DERIVED_POINTER`: Observed on Google Maps consumer web UI (Policy-gated).
- `USER_PROVIDED_DOMAIN`: Manually entered or uploaded by user (Permitted candidate; target-site rules apply).
- `INDEPENDENTLY_SOURCED_DOMAIN`: Discovered via external authorized crawl or directory (Target-site rules apply).
- `WEBSITE_DERIVED_CONTENT`: Public data fetched directly from business domain (Subject to target-site access controls).

---

## 8. Persistence / Export Eligibility Matrix

Every data field is audited against technical storage, policy status, persistence rules, and export eligibility:

| Field | Provenance | Acquisition Source | Technical Storage | Policy Status | Persistence Status | Export Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Search Keyword** | `USER_PROVIDED` | User Input | IndexedDB | PERMITTED | **PERSISTED** | **EXPORTABLE** |
| **Search Location** | `USER_PROVIDED` | User Input | IndexedDB | PERMITTED | **PERSISTED** | **EXPORTABLE** |
| **Observed Place Name (Maps)**| `GOOGLE_DERIVED` | Google Maps DOM | Session Only | RESTRICTED | **NOT PERSISTED** | **NON_EXPORTABLE** |
| **Verified Business Name** | `WEBSITE_DERIVED` | Business Website | IndexedDB | TARGET SITE RULES | **PERSISTED (Eligible)** | **EXPORTABLE CANDIDATE** |
| **Observed Address (Maps)** | `GOOGLE_DERIVED` | Google Maps DOM | Session Only | RESTRICTED | **NOT PERSISTED** | **NON_EXPORTABLE** |
| **Verified Business Address**| `WEBSITE_DERIVED` | Business Website | IndexedDB | TARGET SITE RULES | **PERSISTED (Eligible)** | **EXPORTABLE CANDIDATE** |
| **Observed Phone (Maps)** | `GOOGLE_DERIVED` | Google Maps DOM | Session Only | RESTRICTED | **NOT PERSISTED** | **NON_EXPORTABLE** |
| **Verified Business Phone** | `WEBSITE_DERIVED` | Business Website | IndexedDB | TARGET SITE RULES | **PERSISTED (Eligible)** | **EXPORTABLE CANDIDATE** |
| **Observed Website URL (Maps)**| `GOOGLE_DERIVED` | Google Maps DOM | Session Only | POLICY-GATED | **POLICY-GATED** | **POLICY-GATED** |
| **User-Supplied Domain** | `USER_PROVIDED` | User Input / CSV | IndexedDB | PERMITTED | **PERSISTED** | **EXPORTABLE CANDIDATE** |
| **Website Verification Status**| `LEADNORIA_DERIVED`| Local Verifier | IndexedDB | PERMITTED | **PERSISTED** | **EXPORTABLE** |
| **Commercial Intent Score** | `LEADNORIA_DERIVED`| Local Waterfall | IndexedDB | PERMITTED | **PERSISTED** | **EXPORTABLE** |
| **Raw Google Reviews/Ratings**| `GOOGLE_DERIVED` | Google Maps DOM | None | PROHIBITED | **DISCARDED** | **NON_EXPORTABLE** |
| **API Place ID** | `GOOGLE_API_DERIVED`| Official Places API| IndexedDB | PLATFORM TERMS | **PERMITTED (Caching TTL)**| **NON_EXPORTABLE (Bulk)**|

### Formulas:
- **Persistence Eligibility Formula:**
  $$\text{PROVENANCE} + \text{ACQUISITION STATUS} + \text{RETENTION RULE} + \text{LEADNORIA PERSISTENCE POLICY} = \text{PERSISTABLE}$$
- **Export Eligibility Formula:**
  $$\text{WEBSITE_DERIVED} + \text{AUTHORIZED ACQUISITION} + \text{LEADNORIA EXPORT RULES} = \text{EXPORTABLE CANDIDATE}$$

---

## 9. Policy Context Matrix

Contractual terms and technical guidelines are separated into four distinct operational contexts:

| Policy Context | Applies To | Governing Documents | Relevant For LeadNoria | Legal / Operational Interpretation |
| :--- | :--- | :--- | :--- | :--- |
| **Google Consumer / End User Terms** | Consumer use of `google.com/maps` | Google Terms of Service & Google Maps Additional ToS Sec. 2 | **YES** | Prohibits mass downloading, scraping, or creating bulk persistent directory extracts from consumer web UI. |
| **Google Maps Platform Terms** | Customers using paid Google Cloud APIs | Google Maps Platform Terms of Service Sec. 3.2.3(a) | **ONLY if using Platform services** | Prohibits using Places API to create or augment competitive listing/directory databases. Allows specific Place ID caching. |
| **Maps JavaScript API Policies** | Websites embedding Google Maps JS SDK | Maps JavaScript API Policies (Place Name scraping warnings) | **ONLY if embedding JS API** | Specifically restricts scraping place data from embedded maps. Does not serve as direct consumer web ToS. |
| **Chrome Web Store / Manifest V3** | Extension runtime permissions & technical behavior | Chrome Web Store Policies & MV3 Documentation | **YES** | Enforces least-privilege permissions (`activeTab`, `scripting`). Technical capability $\neq$ contractual authorization. |

---

## 10. Technical Feasibility vs. Policy vs. Product Decision

| Capability | Technical Feasibility | Chrome Mechanism | Data-Source / Policy Context | Policy Status | LeadNoria Final Decision |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Opens Google Maps** | YES | Standard Navigation | Consumer Terms | END-USER USE | **DESIRED (Workbench Context)** |
| **Extension DOM Reading** | YES | Tab Script / Inspector | Maps Additional ToS Sec. 2 | UNRESOLVED / REVIEW | **POLICY-GATED** |
| **Passive Candidate Observation**| YES | DOM Mutation Observer | Maps Additional ToS Sec. 2 | UNRESOLVED / REVIEW | **POLICY-GATED** |
| **Automated Scrolling** | YES | Programmatic Scroll | General ToS ("Interference") | REQUIRES REVIEW | **PRODUCT REJECTED** |
| **Automated Clicking** | YES | Simulated Click Events | General ToS ("Bot interaction")| REQUIRES REVIEW | **PRODUCT REJECTED** |
| **Website URL Observation** | YES | DOM Attribute Read | Maps Additional ToS Sec. 2 | POLICY-GATED | **POLICY-GATED** |
| **Google-Derived Persistence** | YES | IndexedDB Write | Maps Additional ToS Sec. 2 | RESTRICTED | **PRODUCT REJECTED** |
| **Google-Derived Export** | YES | CSV Serializer | Maps Additional ToS Sec. 2 | RESTRICTED | **PRODUCT REJECTED** |
| **Official Places API Usage** | YES | REST API Request | Platform Terms Sec. 3.2.3(a) | TERMS REVIEW REQUIRED | **OPTIONAL (Future BYOK)** |
| **API Place ID Storage** | YES | IndexedDB Key | Platform Service Terms | API-SPECIFIC TERMS APPLY| **FUTURE API OPTION** |
| **User-Provided Domain** | YES | Form / CSV Upload | Destination Web Domain | TARGET-SITE RULES APPLY | **CANDIDATE** |
| **Direct Website Crawl** | YES | Background `fetch()` | Target Web Domain | TARGET-SITE RULES APPLY | **PLANNED + GATED** |
| **Website-Derived Field** | YES | HTML Parser | Target Web Domain | DEPENDS ON ACQUISITION | **PERSIST/EXPORT ON ELIGIBILITY**|
| **Google-Derived Field** | YES | DOM Attribute Read | Consumer Terms | GOOGLE SOURCE RULES APPLY| **POLICY-GATED / REJECTED** |

### LeadNoria Absolute Product Rejection List:
Regardless of competitor implementations, LeadNoria strictly rejects:
1. Automated infinite scrolling loops.
2. Automated pagination harvesting.
3. Coordinate-grid crawling and tile sweeps.
4. Automated map panning for coverage farming.
5. Automated clicking to expand large listing sets.
6. Residential and datacenter proxy rotation networks.
7. CAPTCHA solving integrations (2Captcha, Anti-Captcha, CapMonster).
8. Browser fingerprint spoofing (Canvas, WebGL, AudioContext masking).
9. Exploitation of private, undocumented, or internal Google RPC endpoints.

*Classification:* **LEADNORIA PRODUCT REJECTED.**

---

## 11. Website Verification (Deep Verification Engine)

LeadNoria executes verification directly against the public website identified for each candidate:
1. **Direct Same-Origin Fetch:** Issues background HTTP/HTTPS requests directly to the business domain. Complies with destination robots.txt and standard web etiquette.
2. **HTTP & DNS Validation:** Verifies domain resolution, evaluates HTTP response codes (200 OK vs 404/500 errors), and identifies redirect chains.
3. **12 Negative Domain Parking Checks:** Detects parked, expired, or placeholder domains by evaluating:
   - Registrar landing page signatures (GoDaddy, Sedo, Namecheap, Dan.com).
   - Parked ad network scripts and iframe ad containers.
   - For-sale banners and domain auction contact forms.
   - Generic template tokens lacking unique commercial text.
4. **Independent Extraction:** Extracts NAP (Name, Address, Phone), public email addresses, and official social media profile links directly declared on the website.

---

## 12. Qualification (Deterministic Evidence Waterfall)

The Evidence Waterfall evaluates independent signals extracted from verified websites:
- **Category Relevance:** Matches target industry keywords against business page titles, meta descriptions, schema.org JSON-LD markup, and service descriptions.
- **Location Relevance:** Validates that business address, postal code, or telephone area code aligns with target research geography.
- **Commercial Intent:** Evaluates active business indicators (pricing tables, quote request forms, client testimonials, booking widgets).
- **Contact Normalization:** Public phone numbers are normalized to E.164 international format. Direct WhatsApp chat links (`https://wa.me/...`) are generated solely where a valid public telephone number is independently extracted from a verified website.

---

## 13. Multi-Signal Entity Resolution & Deduplication

LeadNoria prevents duplicate records across multiple searches and research sources:
1. **Primary Key:** Fully Qualified Domain Name (FQDN) normalized (stripping `www.`, tracking parameters, and sub-paths).
2. **Secondary Key:** E.164 normalized telephone number.
3. **Tertiary Key:** Normalized business name combined with geographic locality.
4. **Collision Handling:** When a duplicate entity is identified, independent evidence signals are merged without duplicating records, while preserving original source provenance for each attribute.

---

## 14. Failure & Recovery Specifications

- **Target Site Timeout:** Default 10-second timeout for external website verification. Unresponsive sites are marked `UNVERIFIED_TIMEOUT` and excluded from export.
- **Parked Domain Detection:** Candidates failing parking checks are flagged `EXCLUDED_PARKED_DOMAIN`.
- **Target Site Access Denial (403/429):** If a target business website returns HTTP 403 or 429, the crawler immediately aborts requests to that origin, marking the candidate `ACCESS_RESTRICTED`. No retry loops or proxy rotation are attempted.
- **Memory Ceiling Defense:** Ephemeral discovery buffers are capped at 5,000 processed candidates per session to ensure Chrome extension memory stability.

---

## 15. Security & Permission Architecture

1. **Manifest V3 Least Privilege:**
   - Active permissions restricted to `storage` and `activeTab`.
   - Strictly prohibited permissions: `<all_urls>`, `webRequest`, `webRequestBlocking`, `debugger`, `cookies`.
2. **Local-First Processing:** 100% of network requests, parsing, scoring, and storage occur inside the user's local Chrome browser. Zero remote scraping backend servers.
3. **CSV Formula Injection Defense:** All exported fields are sanitized using RFC-4180 escaping. Cells starting with dangerous formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) are automatically prefixed with a single quote (`'`) to neutralize spreadsheet execution.

---

## 16. API Option (Path B Exploration)

- **Platform Architecture:** Bring-Your-Own-Key (BYOK) model where the user provides an official Google Cloud Places API key.
- **Platform Terms Consideration:** Section 3.2.3(a) of the Google Maps Platform Terms prohibits creating or augmenting competitive directory databases. Lead prospecting export requires specific contractual review.
- **Place ID Separation:** The API contract permits storing official `GOOGLE_API_PLACE_ID` values for caching and referencing. This authorization does **not** transfer to web-observed `GOOGLE_WEB_PLACE_ID` identifiers.

---

## 17. Chrome Permission Model vs. Source Authorization

A fundamental principle established in this specification is the separation of browser technical capability from data source legal authorization:

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
```
- Browser permissions allow an extension to observe DOM structures in an active tab.
- Such permissions do **not** grant a license, waiver, or contractual exception under Google Terms of Service or destination website terms.

---

## 18. Phase 4 Handoff Contract

Phase 4 (Maps Discovery Architecture) is commissioned to investigate discovery mechanisms. Phase 4 MUST investigate the following 8 architectural questions and MUST NOT begin with writing DOM scraping code:

1. **Consumer Google Maps Interaction Boundaries:** Evaluate technical models for active-session user interaction without crossing automated extraction boundaries.
2. **Google Maps Platform / API Alternative (Path B):** Audit the official Places API (New) endpoints, pricing models, and Section 3.2.3(a) commercial terms.
3. **User-Provided Domain Workflow (Path C):** Design the input interface, batch CSV import, and validation workflow for user-supplied business domains.
4. **Independently Sourced Domain Workflow:** Determine mechanisms for discovering business domains from public web registries and business directories.
5. **Least-Privilege Chrome Permissions:** Audit whether `activeTab` alone suffices or whether `optional_host_permissions` are required for destination website verification.
6. **Source / Provenance Runtime Data Model:** Design the TypeScript interface schemas enforcing immutable field-level provenance across all candidate states.
7. **Policy-Safe Data Boundary:** Specify the technical firewall isolating ephemeral browsing memory from persistent IndexedDB storage.
8. **Failure & Boundary Handling:** Model system behaviors when rate limits, access denials, or unresolvable domains occur.

---

## 19. Open Questions Register

| Open Question ID | Question Summary | Owner Phase | Resolution Objective |
| :--- | :--- | :--- | :--- |
| **OQ-01** | Can a Chrome extension observe a Maps-displayed external website URL under Consumer ToS? | Phase 4 (Discovery Architecture) | Determine whether passive domain pointer capture crosses platform extraction boundaries. |
| **OQ-02** | Does direct website verification purge downstream records of Google source encumbrance? | Phase 4 / Phase 5 (Extraction Architecture) | Review legal consensus on independent evidence extraction following web discovery. |
| **OQ-03** | Which Chrome MV3 permission model offers the lowest security profile (`activeTab` vs host)? | Phase 4 (Discovery Architecture) | Audit user prompt disclosures and permission footprint. |
| **OQ-04** | Does Places API Section 3.2.3(a) permit B2B sales prospecting exports? | Phase 4 (API Terms Review) | Determine commercial compliance constraints for optional BYOK integration. |
| **OQ-05** | What robots.txt parsing and crawl etiquette controls should be embedded in the verifier? | Phase 5 (Verification Engine) | Formalize polite web crawling standards for local-first browser fetch. |

---

## 20. Files Changed

- `LEADNORIA-GOOGLE-MAPS-PHASE3-PRODUCT-SPEC.md`: Fully reconciled and updated to Version 3.0-FINAL-RECONCILED.
- *Zero other files were created or modified.*

---

## 21. Files Untouched

- `manifest.json`: Untouched (100% frozen).
- `src/` (All production TypeScript source files): Untouched (100% frozen).
- `src/extension/evidenceWaterfall.ts`: Untouched (Meta engine baseline intact).
- `dist/leadnoria-v1.0.0.zip`: Untouched (SHA-256: `bbb3d9f16e1efde29e77af0bf2ffb5e30f20f9b50ad5c0fb89f578aa52931d5b`).
- `tests/` (All existing regression and unit tests): Untouched.

---

## 22. Verification & Baseline Integrity

1. **Production Code Freeze:** No production source code or extension manifests have been modified.
2. **TypeScript Compilation:** Zero compilation errors (`tsc --noEmit` clean).
3. **Regression Tests:** Post-freeze test suite passes 19/19 checks with zero regressions on Meta Ad Library v1.0.0.
4. **Git Repository Status:** Clean working tree with existing tracked files untouched.

---

## 23. Final Phase 3 Gate

# LEADNORIA GOOGLE MAPS — PHASE 3 FINAL GATE

### DETERMINATION: **PASS — PHASE 4 READY**

### Justification:
- **Policy Contexts Separated:** Google consumer web terms, Google Maps Platform terms, Maps JavaScript API policies, and Chrome MV3 developer policies are strictly decoupled into independent operational layers.
- **Provenance Formally Reconciled:** Observed website URLs are explicitly classified as `GOOGLE_DERIVED` upon discovery; `WEBSITE_DERIVED` evidence constitutes new independent evidence that never retroactively relabels discovery lineage.
- **Target-Site Access Rules Acknowledged:** Direct website crawling and user-provided domain handling are explicitly recognized as subject to destination terms, robots.txt, access controls, and applicable law.
- **Persistence & Export Decoupled:** Evaluated under independent eligibility formulas ($\text{PROVENANCE} + \text{ACQUISITION} + \text{RETENTION} = \text{PERSISTABLE}$ and $\text{WEBSITE_DERIVED} + \text{AUTHORIZED ACQUISITION} = \text{EXPORTABLE}$).
- **Zero Implementation / Zero Regressions:** No scraping code, no Google permissions, and no API credentials added. Meta Ad Library v1.0.0 remains 100% frozen, intact, and passing all verification baselines.
- **Phase 4 Handoff Clearly Bounded:** Commissioned to investigate interaction models and compliance boundaries across 8 specific research tracks, with automated DOM scraping explicitly barred.
