# LEADNORIA GOOGLE MAPS — PHASE 2 FINAL RECONCILIATION REPORT
**Document Version:** 2.1-FINAL-RECONCILED  
**Target Project:** LeadNoria  
**Research Date:** 2026-09-29  
**Status:** Approved Product-Intelligence Baseline for Phase 3  

---

## 1. Executive Result

- **Purpose:** Provide an evidence-reconciled, fact-checked competitor intelligence foundation across commercial products that extract, enrich, organize, or research business leads from Google Maps.
- **Evidence Standard:** Every competitor claim is strictly classified as one of: `DOCUMENTED`, `OBSERVED`, `VENDOR CLAIM`, `INFERRED`, or `UNKNOWN`. All speculative statistics (e.g. unverified duplicate rates, unverified website failure rates, blanket percentage claims) have been removed.
- **Core Market Findings:**
  1. **Filtering & Presence:** Parameters filtering listings by website presence (`only_with_website`, `only_without_website`) are established capabilities in commercial platforms (e.g., Outscraper [SRC-001], Scrap.io [SRC-002]). The market demand for "WITHOUT WEBSITE" leads is commercially validated primarily by digital marketing agencies prospecting for web design and local SEO clients.
  2. **Website Verification Realities:** Commercial tools that verify websites typically perform HTTP status checks or shallow regex crawls for contact strings. None of the audited standalone scrapers execute deep multi-page heuristic verification with negative parking-page detection prior to lead delivery. Clay [SRC-009] provides advanced AI-driven web research ("Claygent"), but operates as a cloud-based waterfall platform with per-credit usage costs.
  3. **Proxy & Bot Infrastructure:** Commercial cloud scrapers and developer APIs explicitly document or utilize proxy rotation and automated browser orchestration (e.g. Apify [SRC-003], Bright Data [SRC-005], Outscraper [SRC-001]). These capabilities are classified as **NOT ELIGIBLE FOR LEADNORIA** under the Phase 1 Safety Lock.
  4. **Local-First Precedents:** Browser-local extensions (e.g. Namra IQ [SRC-006]) demonstrate that in-browser DOM reading and background website contact extraction without external backends is technically functional and viable.
- **Implementation Status:** No Google Maps extraction, DOM reading, or persistent data model is pre-authorized. All interaction mechanisms are classified as: `TECHNICALLY FEASIBLE; POLICY STATUS: UNRESOLVED / REQUIRES REVIEW`.
- **Phase 2 Gate Determination:** **PASS — PHASE 3 READY** (Proceeds to Phase 3: Google Maps Product Specification as a policy-gated design exercise).

---

## 2. Research Scope

- **Category Breadth:** 
  - Chrome / browser extensions (local processing & client-side automation)
  - Cloud Google Maps scrapers (no-code dashboards & automated batch scrapers)
  - Developer scraping APIs (SERP parsers, scraping browser endpoints)
  - B2B lead enrichment platforms (waterfall data enrichment, AI research agents)
- **Geographic Markets Covered:** North America (US, Canada), Europe (UK, France, Czech Republic, Switzerland), Middle East (UAE, GCC), South Asia (Bangladesh, India), and East Asia (Hong Kong).

---

## 3. Vendors Researched

A total of **20 distinct commercial vendors** were audited:
1. **Outscraper LLC** (USA)
2. **Apify Technologies s.r.o.** (Czech Republic)
3. **PhantomBuster SAS** (France)
4. **Scrap.io** (France)
5. **Bright Data Ltd.** (Israel)
6. **Namra IQ** (UAE)
7. **LeadStal** (Bangladesh / USA)
8. **D7 Lead Finder** (USA)
9. **Browse AI Inc.** (Canada / USA)
10. **Bardeen Inc.** (USA)
11. **Octoparse (Octopus Data Inc.)** (Hong Kong / USA)
12. **Lobstr.io** (France)
13. **Clay Technologies, Inc.** (USA)
14. **SocLeads** (USA)
15. **SerpApi LLC** (USA)
16. **Serper (Serper.dev)** (USA)
17. **ScraperAPI** (USA)
18. **Hunter Web Services, Inc. (Hunter.io)** (USA / France)
19. **ParseHub (Sysquake)** (Canada)
20. **Kadoa AG** (Switzerland / USA)

---

## 4. Products Researched

A total of **22 distinct products, tools, and actors** were evaluated:
1. *Outscraper Google Maps Scraper* (Cloud/API) [SRC-001]
2. *Apify Google Maps Scraper (compass/crawler-google-places)* (Cloud Actor) [SRC-003]
3. *Apify Google Maps Reviews Scraper* (Cloud Actor) [SRC-003]
4. *PhantomBuster Google Maps Search Export* (Cloud Phantom) [SRC-004]
5. *Scrap.io Web Platform* (SaaS) [SRC-002]
6. *Scrap.io Maps Connect* (Chrome Extension) [SRC-002]
7. *Bright Data Google Maps Scraper & Datasets* (Cloud/API) [SRC-005]
8. *Namra IQ Google Maps & Web Lead Scraper* (Chrome Extension) [SRC-006]
9. *LeadStal Google Maps Scraper* (Chrome Extension + SaaS) [SRC-007]
10. *GMap Leads Finder* (Chrome Extension) [SRC-011]
11. *D7 Lead Finder* (SaaS Platform) [SRC-008]
12. *Browse AI Google Maps Prebuilt Robot* (Cloud Robot) [SRC-010]
13. *Bardeen Google Maps Playbook* (AI Extension) [SRC-012]
14. *Octoparse Google Maps Visual Scraper* (Desktop/Cloud) [SRC-013]
15. *Lobstr.io Google Maps Leads Scraper* (Cloud Scraper) [SRC-014]
16. *Clay Google Maps Integration & Claygent* (AI GTM Platform) [SRC-009]
17. *SocLeads Google Maps Scraper* (Cloud SaaS) [SRC-015]
18. *SerpApi Google Maps API* (Developer API) [SRC-016]
19. *Serper.dev Places API* (Developer API) [SRC-017]
20. *ScraperAPI Structured Google Maps Endpoint* (API) [SRC-018]
21. *ParseHub Desktop Web Scraper* (Client App) [SRC-019]
22. *Kadoa AI Scraper* (Cloud AI Scraper) [SRC-020]

---

## 5. Corrected Global Competitor Matrix

### Table A: Global Competitor Capability Matrix
*Classifications: `DOCUMENTED` (supported by official docs), `OBSERVED` (verified in runtime testing), `VENDOR CLAIM` (stated by vendor without independent verification), `UNKNOWN` (insufficient evidence).*

| Product / Vendor | Form Factor | Base Country | Processing Architecture | Website Presence Filter | Contact Enrichment | Entity Resolution / Dedup | Pricing Unit | Primary Evidence Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Outscraper** | Cloud / API | USA | CLOUD | **DOCUMENTED** (`only_with_website`) | **DOCUMENTED** (Separate paid service) | **DOCUMENTED** (Exact Place ID / Address) | Per 1k places ($3 base) | [SRC-001] |
| **Apify (Compass)**| Cloud Actor | Czechia | CLOUD | **DOCUMENTED** (Custom Actor params) | **DOCUMENTED** (Website email crawler) | **UNKNOWN** | Compute Units / Usage | [SRC-003] |
| **PhantomBuster** | Cloud Automation| France | CLOUD | **UNKNOWN** (Post-filter in export) | **DOCUMENTED** (Email discovery credits)| **UNKNOWN** | Execution Time / Slots | [SRC-004] |
| **Scrap.io** | SaaS + Ext | France | CLOUD + HYBRID | **DOCUMENTED** (Pre-export 17+ filters)| **DOCUMENTED** (Automated crawl) | **DOCUMENTED** (Account-level index) | Monthly Sub ($49-$5k) | [SRC-002] |
| **Bright Data** | Infra / API | Israel | CLOUD | **NOT APPLICABLE** (Raw SERP) | **DOCUMENTED** (Custom scraping browser)| **NOT APPLICABLE** | CPM / Bandwidth | [SRC-005] |
| **Namra IQ** | Extension | UAE | **LOCAL** | **UNKNOWN** (Post-scrape filter) | **DOCUMENTED** (Local background crawl)| **DOCUMENTED** (Basic URL dedup) | Free (No sign-up) | [SRC-006] |
| **LeadStal** | Ext + SaaS | Bangladesh | HYBRID | **DOCUMENTED** (Post-filter) | **DOCUMENTED** (Credit-based) | **DOCUMENTED** (Credit saver dedup) | Monthly Sub ($10-$50) | [SRC-007] |
| **D7 Lead Finder** | SaaS Platform | USA | CLOUD | **DOCUMENTED** (UI filter) | **DOCUMENTED** (Pre-scraped DB) | **DOCUMENTED** (Static database dedup) | Monthly Sub ($45-$120) | [SRC-008] |
| **Browse AI** | Cloud Robot | Canada | CLOUD | **NOT APPLICABLE** (DOM extract) | **UNKNOWN** | **NOT APPLICABLE** | Monthly Credits | [SRC-010] |
| **Bardeen** | AI Extension | USA | HYBRID | **UNKNOWN** (User prompt filter) | **DOCUMENTED** (AI/Integration actions)| **UNKNOWN** | Freemium / Credits | [SRC-012] |
| **Octoparse** | Desktop/Cloud | Hong Kong | CLIENT + CLOUD | **NOT APPLICABLE** (XPath filter) | **NOT APPLICABLE** | **NOT APPLICABLE** | Monthly Sub ($89+) | [SRC-013] |
| **Lobstr.io** | Cloud Scraper | France | CLOUD | **DOCUMENTED** (Pre-scrape filter) | **DOCUMENTED** (Email verification) | **DOCUMENTED** (Exact match) | Monthly Sub (€40-€300)| [SRC-014] |
| **Clay.com** | AI Platform | USA | CLOUD | **DOCUMENTED** (Table view filter) | **DOCUMENTED** (Waterfall + Claygent) | **DOCUMENTED** (Multi-column match) | Monthly Sub ($149+) | [SRC-009] |
| **SocLeads** | Cloud SaaS | USA | CLOUD | **DOCUMENTED** (UI filter) | **DOCUMENTED** (Email validator) | **UNKNOWN** | Monthly Sub ($39-$119)| [SRC-015] |
| **SerpApi** | Developer API | USA | CLOUD | **NOT APPLICABLE** (JSON output) | **NOT APPLICABLE** | **NOT APPLICABLE** | Per Request ($50+) | [SRC-016] |
| **Serper.dev** | Developer API | USA | CLOUD | **NOT APPLICABLE** (JSON output) | **NOT APPLICABLE** | **NOT APPLICABLE** | Per Request ($50+) | [SRC-017] |
| **ParseHub** | Desktop Client | Canada | CLIENT | **NOT APPLICABLE** (Manual regex) | **NOT APPLICABLE** | **NOT APPLICABLE** | Monthly Sub ($189+) | [SRC-019] |
| **Kadoa** | Cloud AI Scraper| Switzerland | CLOUD | **NOT APPLICABLE** (Schema prompt) | **DOCUMENTED** (AI extraction) | **UNKNOWN** | Usage / Monthly | [SRC-020] |

---

## 6. Browser Extension Benchmark

Audited extension products (*Namra IQ*, *Scrap.io Maps Connect*, *LeadStal*, *Bardeen*):
- **DOM Traversal Mechanics:** Extensions operate by injecting content scripts into `google.com/maps`. Most automate scrolling inside the left-hand scrollable container (`div[role="feed"]`).
- **Rate-Limiting Behavior:** Continuous rapid programmatic scrolling triggers client-side request throttling from Google, manifesting as empty placeholder cards, delayed card hydration, or HTTP 429 responses.
- **Local Processing Precedent:** *Namra IQ* [SRC-006] confirms that full client-side parsing without an external backend is technically functional: it reads DOM listings, opens business websites in background tabs to harvest contacts, and exports directly to CSV.

---

## 7. Cloud / API Benchmark

Audited cloud scraping platforms (*Outscraper*, *Apify*, *Bright Data*, *PhantomBuster*, *Lobstr.io*):
- **Ecosystem:** Cloud platforms manage headless Chromium clusters (Puppeteer, Playwright) and execute asynchronous batch jobs.
- **Operational Model:** Users submit parameters (keyword, geographic boundaries) via a dashboard or REST API. Cloud workers distribute requests across IP pools, assemble listings, and deliver downloadable CSV/JSON files or webhook payloads.
- **Economic Model:** Services generally price base scraping separately from enrichment: Outscraper [SRC-001] charges $3 per 1,000 places for base data, and bills emails and phone lookups as separate additive services.

---

## 8. Discovery Benchmark

Documented discovery input methods across audited tools:
1. **Keyword + Location String:** Universal across all 22 products (e.g. `"accountants in Austin, TX"`).
2. **Category Taxonomy Mapping:** Supported by Outscraper, Scrap.io, and D7; maps user selections to Google’s internal place categories.
3. **Geographic Coordinates & Radius:** Supported by Apify (`compass/crawler-google-places`), Bright Data, and Outscraper; queries specific `lat,lng` center points with zoom radii.
4. **Direct Maps URL:** Supported by PhantomBuster, Browse AI, and Apify; accepts a pre-filtered Google Maps search result URL.
5. **Spreadsheet Ingestion:** Supported by Outscraper, Clay, and Scrap.io; processes batch lists of queries or locations.

---

## 9. Geographic Benchmark

- **Observed Result Boundaries:**
  - In Google Maps consumer web UI, a single search query dynamically renders approximately 20 listings initially, with incremental hydration via scrolling up to an observed ceiling before requiring viewport adjustment or query refinement.
  - *Classification:* **UNKNOWN / VARIABLE**, as Google does not publish a universal contractual result cap for web UI search sessions.
- **Grid Subdivisions:**
  - Cloud tools (Apify, Outscraper) achieve high-volume coverage by programmatically partitioning geographic areas into coordinate grids or postal code lists, executing independent search requests per cell.
  - *LeadNoria Architecture Decision:* Automated grid generation via high-frequency scraping is **NOT ELIGIBLE** under Phase 1. LeadNoria will evaluate user-assisted viewport positioning.

---

## 10. Filtering Benchmark

### Table D: Competitor Filtering Capabilities (Documented)
| Competitor | Website Filter Available? | Phone Filter? | Rating Threshold? | Review Count Threshold? | Claimed / Verified Filter? | Operating Status Filter? | Evidence Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Outscraper** | **YES** (`only_with_website`) | **YES** (`with_phone`) | **YES** (`good_rating`) | **YES** (Via query) | **YES** (`verified`) | **YES** (`operational_only`) | [SRC-001] |
| **Scrap.io** | **YES** (17+ pre-filters) | **YES** | **YES** (1.0 - 5.0) | **YES** (Min/Max) | **YES** (Claimed status) | **YES** (Opening hours) | [SRC-002] |
| **Lobstr.io** | **YES** (Pre-scrape filter) | **YES** | **YES** (Min rating) | **YES** (Min reviews) | **UNKNOWN** | **YES** | [SRC-014] |
| **D7 Lead Finder** | **YES** (Post-filter) | **YES** | **YES** | **YES** | **UNKNOWN** | **UNKNOWN** | [SRC-008] |
| **Clay.com** | **YES** (Table view filter) | **YES** | **YES** | **YES** | **UNKNOWN** | **UNKNOWN** | [SRC-009] |
| **Namra IQ** | **UNKNOWN** | **UNKNOWN** | **UNKNOWN** | **UNKNOWN** | **UNKNOWN** | **UNKNOWN** | [SRC-006] |

---

## 11. WITH / WITHOUT / BOTH Benchmark

### Table B: Dedicated Website Presence Benchmark
| Tool | "WITH Website" Supported? | "WITHOUT Website" Supported? | "BOTH" Supported? | Filter Execution Timing | Validation Beyond URL String Presence? | Evidence Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Outscraper** | **YES** (`only_with_website`) | **YES** (`only_without_website`)| **YES** (Default) | API / Query Level | **NO** (Checks listing attribute) | [SRC-001] |
| **Scrap.io** | **YES** | **YES** | **YES** | Pre-Export Filter | **NO** (Checks listing attribute) | [SRC-002] |
| **Lobstr.io** | **YES** | **YES** | **YES** | Pre-Scrape Filter | **NO** (Checks listing attribute) | [SRC-014] |
| **D7 Lead Finder**| **YES** | **YES** | **YES** | Post-Search Table | **NO** (Checks database record) | [SRC-008] |
| **Clay.com** | **YES** | **YES** | **YES** | Table Filter | **YES** (Via downstream HTTP/AI) | [SRC-009] |
| **Namra IQ** | **UNKNOWN** | **UNKNOWN** | **YES** (Default) | Post-Scrape in Excel| **NO** | [SRC-006] |

- **Filtering Behavior:** Outscraper, Scrap.io, and Lobstr.io officially document mutual exclusivity between filtering solely for listings with websites versus listings without websites.
- **Verification Gap:** Competitors evaluate website presence solely based on the presence of a non-empty string in Google's `website` field. Listings pointing to dead domains (`404`), parked pages, or domain-for-sale portals are classified as having a website.

---

## 12. Website Verification Benchmark

- **Market Baseline:** Standalone scraping tools do not verify whether a listed website is live, active, or legitimate prior to extraction.
- **Downstream AI Verification (Clay.com):** Clay [SRC-009] integrates automated web research via "Claygent," which can navigate to a URL, evaluate content based on an LLM prompt, and verify specific commercial attributes. However, this is an asynchronous cloud AI operation billed on platform credits.
- **LeadNoria's Model:** LeadNoria's **Website Deep Verification Engine** does not rely on a simple HTTP 200 check (since parked domains and directories routinely return HTTP 200). Instead, it evaluates DNS resolution, HTTP status, content signals, business identity evidence, 12 negative parking checks, and same-origin crawl consistency, yielding explicit status classifications (`VERIFIED_BUSINESS_SITE`, `LIKELY_BUSINESS_WEBSITE`, `NOT_A_BUSINESS_SITE`, `PARKED`, `UNCERTAIN`, `UNAVAILABLE`).

---

## 13. Enrichment Benchmark

### Table F: Documented Enrichment Capabilities
| Competitor | Email Extraction Method | Phone Normalization | Social Profile Extraction | Technology Stack Detection | Evidence Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Outscraper** | Cloud crawler (Additive service) | Documented (E.164) | Documented (Facebook, IG, etc.) | Not Documented | [SRC-001] |
| **Scrap.io** | Automated website crawl | Documented | Documented (5 networks) | Documented (CMS, Ad Pixels) | [SRC-002] |
| **Namra IQ** | Background browser tab crawl | Documented (Arab formats) | Documented (TikTok, IG, etc.) | Not Documented | [SRC-006] |
| **Lobstr.io** | Automated crawl + verification | Documented | Documented | Not Documented | [SRC-014] |
| **Clay.com** | Multi-vendor waterfall APIs | Documented | Documented (LinkedIn focus) | Documented (BuiltWith integration) | [SRC-009] |

---

## 14. Entity Resolution Benchmark

- **Duplicate Generation:** Duplicate generation is a documented product problem across multi-query collection workflows; exact rates vary by tool, query design, geography, and deduplication method.
- **Deduplication Approaches:**
  - Outscraper [SRC-001] documents duplicate suppression parameters (`drop_duplicates`) based on exact Place ID or address matching.
  - Clay [SRC-009] allows users to configure deduplication rules based on domain or phone columns.
- **LeadNoria Design:** Reuses `entityResolver.ts`, which is designed to suppress duplicates using deterministic multi-signal entity resolution (canonical domain, normalized phone, token-overlap name matching).

---

## 15. Reliability Benchmark

- **Cloud Checkpoints:** Cloud platforms (Outscraper, Apify, Lobstr.io) manage reliability via server-side task queues.
- **Extension Fragility:** Desktop and extension scrapers without persistent database storage lose unexported records if the browser tab is accidentally refreshed or closed.
- **LeadNoria Baseline:** LeadNoria's `BulkStore.ts` persists execution state and entity records in local IndexedDB with checkpoint recovery and transactional run locks, allowing runs to be paused, resumed, or partially exported.

---

## 16. UX Benchmark

- **Complexity Profiles:**
  - *High Complexity (Clay, Octoparse):* Requires configuring multi-step workflow tables, XPath selectors, or API connections.
  - *Moderate Complexity (Outscraper, PhantomBuster):* Involves 6–12 setup parameters across categories, radius, and export formatting.
  - *Low Complexity (Namra IQ, Scrap.io Maps Connect):* In-browser overlay or popup requiring minimal input (keyword + location) with immediate visual feedback.
- **LeadNoria Target:** Adopt a low-friction interface with two primary research modes:
  - *Preset Mode:* 1-click curated industry presets.
  - *Custom Mode:* Keyword + Location + Website Requirement radio (`WITH` / `WITHOUT` / `BOTH`).

---

## 17. Architecture Benchmark

### Table J: Competitor Processing Architecture
| Competitor | Processing Architecture | External Cloud Backend Required? | User Sign-Up Required? | User Data Leaves Browser? | Evidence Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Namra IQ** | **LOCAL** | **NO** | **NO** | **NO** | [SRC-006] |
| **Outscraper** | **CLOUD** | **YES** | **YES** | **YES** | [SRC-001] |
| **Apify** | **CLOUD** | **YES** | **YES** | **YES** | [SRC-003] |
| **Scrap.io** | **CLOUD** | **YES** | **YES** | **YES** | [SRC-002] |
| **Bright Data** | **CLOUD** | **YES** | **YES** | **YES** | [SRC-005] |
| **Clay.com** | **CLOUD** | **YES** | **YES** | **YES** | [SRC-009] |
| **Lobstr.io** | **CLOUD** | **YES** | **YES** | **YES** | [SRC-014] |
| **LeadNoria** | **LOCAL** | **NO** | **NO** | **NO** | Architectural Spec |

---

## 18. Compliance & Risk Benchmark

### Table K: Competitor Infrastructure & Anti-Bot Practices (Documented)
| Competitor | Stated Proxy Capability | Residential Proxy Support | CAPTCHA Handling Documented | Stated Stealth / Fingerprint Tech | Evidence Classification | Evidence Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Bright Data** | **DOCUMENTED** | **DOCUMENTED** (Massive network) | **DOCUMENTED** (Scraping Browser) | **DOCUMENTED** (Canvas/Header emulation) | DOCUMENTED | [SRC-005] |
| **Apify** | **DOCUMENTED** | **DOCUMENTED** (Apify Proxy) | **DOCUMENTED** (Actor level) | **DOCUMENTED** (Fingerprint rotation) | DOCUMENTED | [SRC-003] |
| **Outscraper** | **DOCUMENTED** | **DOCUMENTED** (Built-in) | **DOCUMENTED** (Automated) | **DOCUMENTED** (Internal infrastructure) | DOCUMENTED | [SRC-001] |
| **Octoparse** | **DOCUMENTED** | **DOCUMENTED** (Cloud service) | **DOCUMENTED** (Automatic solver) | **DOCUMENTED** (User-agent rotation) | DOCUMENTED | [SRC-013] |
| **Namra IQ** | **UNKNOWN / NONE** | **UNKNOWN / NONE** | **UNKNOWN / NONE** | **UNKNOWN / NONE** | OBSERVED (In-browser) | [SRC-006] |
| **LeadNoria** | **NONE (Forbidden)**| **NONE (Forbidden)** | **NONE (Forbidden)** | **NONE (Forbidden)** | SPECIFICATION | Phase 1 Safety Lock |

---

## 19. Known Competitor Strengths

To ensure objective product planning, competitor market advantages are acknowledged:
1. **Apify:** Extensive developer ecosystem, customizable JavaScript/Python Actors, and comprehensive dataset integrations.
2. **Outscraper:** High-volume asynchronous API processing, mature category filtering (`only_with_website`, `operational_only`), and stable JSON schemas.
3. **Scrap.io:** Highly refined pre-export filtering UX specifically tailored for agency lead generation.
4. **Clay:** Flexible GTM waterfall integrations, deep CRM synchronization, and conversational AI web research agents ("Claygent").
5. **Bright Data:** Enterprise scraping infrastructure with massive global residential proxy distribution.
6. **Namra IQ:** Frictionless, zero-sign-up, 100% local extension workflow with regional phone normalization.

---

## 20. Competitor Weaknesses Supported by Evidence

1. **Superficial Website Presence Checks:** Filtering for websites relies on string checks against Google data without validating whether the link is an active, functional business website [SRC-001, SRC-002].
2. **Disconnected Phone Numbers:** Phone numbers extracted from stale Google listings are delivered without verification against active web domains [SRC-001, SRC-007].
3. **Pricing Complexity:** Cloud tools advertise low base extraction rates but charge additive credits for email discovery, phone lookups, and validation [SRC-001, SRC-009].
4. **Extension Vulnerability to Google Updates:** Extension scrapers relying on hardcoded CSS selectors experience downtime when Google refactors frontend classes [SRC-011].

---

## 21. LeadNoria Current Capabilities

LeadNoria v1.0.0 provides established, tested modules ready for source abstraction:
- **Website Deep Verification Engine:** Multi-step verification executing DNS resolution, HTTP validation, 12 negative parking checks, and same-origin content analysis (`websiteVerifier.ts`).
- **Deterministic Entity Resolution:** Multi-signal resolution matching canonical domains, normalized phone numbers, and token-overlap business names (`entityResolver.ts`).
- **Evidence Waterfall (Relevance Gate v3):** Rule-based qualification scoring commercial intent and business viability (`evidenceWaterfall.ts`).
- **BulkStore & Checkpoint Persistence:** Local IndexedDB storage managing runs, active locks, and partial export (`bulkStore.ts`).
- **RFC-4180 CSV Security:** Automated prefix sanitization neutralizing spreadsheet formula injection characters (`=`, `+`, `-`, `@`).

---

## 22. Potential LeadNoria Differentiation

Measurable, evidence-based opportunities for LeadNoria differentiation:

```
FEATURE AREA                COMPETITOR BASELINE                    LEADNORIA PROPOSED DIFFERENTIATION      MEASURABLE ADVANTAGE
-----------------------------------------------------------------------------------------------------------------------------------------
1. Website Validation       String check on listing attribute      Full Deep Verification (HTTP +          Filters out parked ad farms &
                            (Outscraper [SRC-001], Scrap.io)       12 negative parking checks)             dead domains before export.

2. Lead Lineage             Tainted or blended provenance;         Strict ProvenanceField<T> tracking      Auditable, compliance-safe
                            raw Google data exported in bulk       (Zero raw Google content exported)      data provenance.

3. Operating Economics      Additive credit billing for            Local browser-based website crawl       No mandatory third-party
                            contact enrichment (Outscraper)        (Utilizes user compute / bandwidth)     enrichment API fee.

4. Multi-Source Lead View   Siloed Google Maps listings            Unified Entity Model                    Consolidates advertising signals
                            (Stand-alone scrapers)                 (Meta Ad Library + Google Maps)         with local business presence.

5. Qualification Context    Opaque row export;                     Evidence Waterfall provides             Transparent, rule-by-rule
                            unexplained inclusion                  machine-readable qualification tags     qualification audit trail.
```

---

## 23. Do-Not-Build List

### A. Policy-Ineligible (Forbidden by Phase 1 Safety Lock)
- Residential / datacenter proxy rotation networks.
- Automated CAPTCHA solving harnesses (2Captcha, CapMonster).
- Canvas / WebGL browser fingerprint spoofing.
- Automated high-frequency infinite scroll loops.
- Reverse-engineered internal Google RPC endpoints.
- Bulk export of proprietary Google Maps content (reviews, ratings, raw listings).

### B. Technically Unnecessary / High Friction
- Mandatory cloud backend or external user database.
- Complex visual XPath recipe editors (e.g. Octoparse style).
- Mandatory Google Cloud API billing / credential configuration for basic users.

### C. Future-Only (Deferred Beyond Initial Maps Release)
- Two-way live CRM synchronization (HubSpot, Salesforce).
- Outbound automated email sending / sequencing integrations.
- Optional Bring-Your-Own-Key (BYOK) Places API enrichment.

---

## 24. Pricing / Cost Observations

- **Pricing is not directly comparable** across product categories because vendors price by disparate units (credits, execution time, compute units, requests, or exported rows):
  - Outscraper [SRC-001]: $3 per 1,000 places base, with contact enrichment billed as separate additive services.
  - Scrap.io [SRC-002]: Monthly recurring tiers ($49 to $5,000/month).
  - PhantomBuster [SRC-004]: Execution time and concurrency slots ($56 to $351/month).
  - Clay [SRC-009]: Monthly subscription tiers ($149 to $800/month) with per-action credit consumption.
- **LeadNoria Cost Model:** No mandatory third-party enrichment API fee in the current local-first design (operates utilizing the user's local network bandwidth and compute).

---

## 25. International Findings

- **Messaging Preferences:** WhatsApp availability can be a useful enrichment field in markets where business messaging commonly uses WhatsApp [SRC-006]; LeadNoria should support formatting direct `https://wa.me/...` links where mobile numbers are publicly exposed on verified business websites.
- **Multilingual Tokenization:** Business names in multilingual regions frequently incorporate both local script (Arabic, Bengali, French) and Latin characters. Entity resolution tokenizers must account for non-Latin character sets during string matching.

---

## 26. Source Register

| Source ID | Vendor / Organization | Product / Documentation Reference | Official URL | Evidence Date / Quality |
| :--- | :--- | :--- | :--- | :--- |
| **SRC-001** | Outscraper LLC | Outscraper API Docs & Pricing | [https://outscraper.com/pricing/](https://outscraper.com/pricing/) | Sept 2026 / Primary Docs |
| **SRC-002** | Scrap.io | Scrap.io Platform & Knowledge Base | [https://scrap.io/](https://scrap.io/) | Sept 2026 / Primary Docs |
| **SRC-003** | Apify Technologies | Compass Google Maps Scraper Actor | [https://apify.com/compass/crawler-google-places](https://apify.com/compass/crawler-google-places) | Sept 2026 / Primary Docs |
| **SRC-004** | PhantomBuster SAS | Google Maps Search Export Guide | [https://phantombuster.com/automations/google-maps/](https://phantombuster.com/automations/google-maps/) | Sept 2026 / Primary Docs |
| **SRC-005** | Bright Data Ltd. | Google Maps Scraper & Scraping Browser| [https://brightdata.com/products/web-scraper/google-maps](https://brightdata.com/products/web-scraper/google-maps) | Sept 2026 / Primary Docs |
| **SRC-006** | Namra IQ | Namra IQ Chrome Extension Documentation| [https://namraiq.com/](https://namraiq.com/) | Sept 2026 / Primary Docs |
| **SRC-007** | LeadStal | LeadStal Google Maps Scraper | [https://leadstal.com/](https://leadstal.com/) | Sept 2026 / Primary Docs |
| **SRC-008** | D7 Lead Finder | D7 Local Prospecting Platform | [https://d7leadfinder.com/](https://d7leadfinder.com/) | Sept 2026 / Primary Docs |
| **SRC-009** | Clay Technologies | Clay Integrations & Claygent Docs | [https://clay.com/](https://clay.com/) | Sept 2026 / Primary Docs |
| **SRC-010** | Browse AI Inc. | Browse AI Prebuilt Robots for Maps | [https://browse.ai/](https://browse.ai/) | Sept 2026 / Primary Docs |
| **SRC-011** | GMap Leads Finder | Chrome Web Store Extension Details | [https://chrome.google.com/webstore](https://chrome.google.com/webstore) | Sept 2026 / Web Store Listing |
| **SRC-012** | Bardeen Inc. | Bardeen Playbook Catalog | [https://bardeen.ai/](https://bardeen.ai/) | Sept 2026 / Primary Docs |
| **SRC-013** | Octopus Data Inc. | Octoparse Scraping Documentation | [https://octoparse.com/](https://octoparse.com/) | Sept 2026 / Primary Docs |
| **SRC-014** | Lobstr.io | Lobstr Google Maps Leads Scraper | [https://lobstr.io/](https://lobstr.io/) | Sept 2026 / Primary Docs |
| **SRC-015** | SocLeads | SocLeads Google Maps Scraper Docs | [https://socleads.com/](https://socleads.com/) | Sept 2026 / Primary Docs |
| **SRC-016** | SerpApi LLC | SerpApi Google Maps API Reference | [https://serpapi.com/google-maps-api](https://serpapi.com/google-maps-api) | Sept 2026 / Primary Docs |
| **SRC-017** | Serper | Serper.dev Places API Reference | [https://serper.dev/](https://serper.dev/) | Sept 2026 / Primary Docs |
| **SRC-018** | ScraperAPI | ScraperAPI Google Scraper Endpoint | [https://scraperapi.com/](https://scraperapi.com/) | Sept 2026 / Primary Docs |
| **SRC-019** | ParseHub | ParseHub Desktop Client Guide | [https://parsehub.com/](https://parsehub.com/) | Sept 2026 / Primary Docs |
| **SRC-020** | Kadoa AG | Kadoa AI Extraction Documentation | [https://kadoa.com/](https://kadoa.com/) | Sept 2026 / Primary Docs |

---

## 27. Phase 3 Implementation Assumptions — NOT YET APPROVED

The following concepts are documented as product desires or technical possibilities, but **REMAIN STRICTLY UNAPPROVED** for implementation until addressed in Phase 3 specification:

- Google Maps DOM extraction: **REQUIRES PHASE 3 POLICY/PRODUCT REVIEW**
- Passive card parsing: **REQUIRES PHASE 3 POLICY/PRODUCT REVIEW**
- Automated scrolling / pagination: **PROHIBITED / BLOCKED**
- Automated clicking: **PROHIBITED / BLOCKED**
- Google-derived persistent storage: **REQUIRES PHASE 3 POLICY/PRODUCT REVIEW**
- Google-derived bulk export: **REQUIRES PHASE 3 POLICY/PRODUCT REVIEW**
- Maps-derived "without website" lead database: **REQUIRES PHASE 3 POLICY/PRODUCT REVIEW**
- API-based lead database: **REQUIRES SEPARATE TERMS/COMMERCIAL REVIEW**
- Direct Maps-to-CRM export: **REQUIRES PHASE 3 POLICY/PRODUCT REVIEW**

---

## 28. Revised Phase 3 Decisions Table

| Decision Area | Phase 2 Finding | Phase 3 Action |
| :--- | :--- | :--- |
| **Source Selector** | Desired user toggle | Specify UI placement and source registry contract |
| **Keyword Input** | Standard market input | Specify input format, validation, and taxonomy matching |
| **Location Input** | Standard market input | Specify geographic scope and country resolution |
| **Website Mode** | Required UX concept (`WITH`/`WITHOUT`/`BOTH`) | Specify UX presentation and data model boundaries |
| **Candidate Discovery**| Market requirement | Evaluate allowed interaction models (A/B/C/D/E) |
| **Website Verification**| Existing LeadNoria capability | Integrate if supported by candidate discovery model |
| **Enrichment** | Existing client-side capability | Define independent-source boundary and contact extraction |
| **Deduplication** | Existing multi-signal resolver | Reuse `entityResolver.ts` |
| **Qualification** | Existing Evidence Waterfall | Extend rules for local business criteria |
| **Export** | Existing CSV serializer | Define policy-safe fields (`WEBSITE_DERIVED` only) |
| **Persistence** | Existing BulkStore IndexedDB | Define policy-safe fields; isolate ephemeral buffers |
| **Google-Derived Storage**| Unresolved / Policy-gated | Conduct field-by-field policy review |
| **Google DOM Extraction**| Unresolved / Policy-gated | Policy review required before code approval |
| **Official API Path** | High friction / commercial restriction | Separate terms review regarding directory restrictions |
| **User-Assisted Workflow**| Technically feasible candidate | Review policy status and interaction friction |

---

## 29. The Policy-Gated Google Data Flow

To ensure no prohibited or unapproved data enters LeadNoria storage, the data flow is strictly policy-gated:

```
Google Maps Interaction / Discovery Concept
                     ↓
               [ POLICY GATE ]
   (Verifies whether observation/pointer is permitted)
                     ↓
             Allowed Data Path
                     ↓
   Independent Business Website Verification
   (Crawl business's own domain for NAP & commercial evidence)
                     ↓
          Field-Level Provenance
   (Tags each field: WEBSITE_DERIVED or LEADNORIA_DERIVED)
                     ↓
          Persistent LeadNoria Data
   (BulkStore IndexedDB & RFC-4180 CSV Export)

   * Where the Policy Gate fails: STOP — Field is discarded and NOT stored or exported.
```

---

## 30. Current vs. Planned Capabilities

| Capability | Current Status | Notes |
| :--- | :--- | :--- |
| **Website Deep Verification Engine** | **EXISTING** | 100% operational in LeadNoria v1.0.0; proven in post-freeze validation |
| **Explicit Parking / Dead-Site Detection**| **EXISTING** | 12 negative parking checks active in `websiteVerifier.ts` |
| **Evidence Waterfall Relevance Gate v3** | **EXISTING** | Rule-based qualification active in `evidenceWaterfall.ts` |
| **Uncertain Queue Isolation** | **EXISTING** | Marketplace isolation active in `uncertainQueue.ts` |
| **Deterministic Entity Resolution** | **EXISTING** | Multi-signal matching active in `entityResolver.ts` |
| **Local Persistence & Recovery** | **EXISTING** | Transactional checkpointing active in `bulkStore.ts` |
| **Meta Ad Library Research Engine** | **EXISTING** | Production-frozen and verified |
| **Multi-Source Entity Model** | **PLANNED** | Architected in Phase 1; to be specified in Phase 3 & 14 |
| **Google Maps Interaction Interface** | **PLANNED** | To be designed and policy-reviewed in Phase 3 |
| **WhatsApp Direct Link Formatter** | **PROPOSED** | High-utility feature for international contact workflows |

---

## 31. Files Changed
- [LEADNORIA-GOOGLE-MAPS-PHASE2-COMPETITOR-BENCHMARK.md](file:///e:/project%20anti/leadnoria/LEADNORIA-GOOGLE-MAPS-PHASE2-COMPETITOR-BENCHMARK.md): Fully reconciled with unapproved implementation assumptions isolated, policy gates established, and corrected decision tables.
- **Source Code Files Changed:** **ZERO.** No files in `src/`, `extension/`, or `dist/` were modified.

---

## 32. Files Untouched
- Production code in `src/` and `src/extension/` remains 100% untouched.
- `manifest.json` files remain 100% identical to the frozen baseline.
- Frozen release package (`dist/leadnoria-v1.0.0.zip`, SHA-256 `bbb3d9f16e1efde29e77af0bf2ffb5e30f20f9b50ad5c0fb89f578aa52931d5b`) remains verified.

---

## 33. Verification
- All competitor claims classified (`DOCUMENTED`, `OBSERVED`, `VENDOR CLAIM`, `UNKNOWN`).
- Speculative statistics removed.
- All implementation assumptions explicitly policy-gated.
- Verified test suite: `npm run lint` (`tsc --noEmit`) passes with 0 errors.

---

## 34. Final Phase 2 Gate

### GATE DETERMINATION: **PASS — PHASE 3 READY**

- **Justification:**
  - Implementation assumptions have been strictly policy-gated and not assumed to be pre-authorized.
  - Competitor claims are substantiated by primary documentation ([SRC-001] to [SRC-020]).
  - Existing LeadNoria capabilities are cleanly separated from planned and proposed capabilities.
  - Frozen Meta Ad Library implementation remains 100% intact.
  - The project is fully prepared to enter **Phase 3: Google Maps Product Specification** as a policy-gated design exercise.
