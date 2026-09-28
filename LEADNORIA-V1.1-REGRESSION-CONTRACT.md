# LEADNORIA v1.1 REGRESSION CONTRACT

**Scope:** Non-Negotiable System Invariants Across All Accuracy Upgrades  
**Base Release:** LeadNoria v1.0.0  
**Target Program:** LeadNoria v1.1 Accuracy Upgrades  
**Effective Date:** 2026-09-27  

Every future accuracy upgrade prompt (Prompts 2 through 8) MUST preserve the following invariants. Any commit or prompt that violates any clause herein constitutes an immediate regression failure.

---

## 1. ARCHITECTURE INVARIANTS
- **Local-Only Runtime:** LeadNoria executes 100% locally inside the user's Chromium browser session.
- **No Backend Server Dependency:** No operational backend or remote database may be introduced for research execution.
- **No Private Meta Endpoints:** Scraper must interact exclusively with public Meta Ad Library search URLs (`https://www.facebook.com/ads/library/*`).
- **No Meta Graph API:** No private Graph API keys or developer app credentials.
- **No Anti-Detection / Evasion Machinery:** No stealth evasion, CAPTCHA bypass, proxy rotation, or bot cloaking mechanisms.
- **No External AI / LLM APIs:** Research filtering must remain deterministic, instant, local, and cost-free. No external OpenAI, Anthropic, or remote LLM API calls during lead extraction.
- **No Paid Scrapers:** No dependency on third-party commercial scraping services.
- **No Remote Workers:** All batch processing remains client-side.

---

## 2. DISCOVERY INVARIANTS
- **Zero User-Facing Quotas:** Auto-Discovery workflow must remain free of arbitrary user-facing batch limits.
- **5,000 Lead Global Safety Ceiling:** The internal 5,000 unique relevant lead ceiling (`MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH`) must remain strictly enforced to prevent browser memory exhaustion.
- **Truthful Terminal States:** Terminal states (`TARGET_REACHED`, `SAFETY_LIMIT_REACHED`, `SOURCE_EXHAUSTED`, `SOURCE_PROGRESS_STALLED`, `NO_NEW_RESULTS_OBSERVED`, `USER_CANCELLED`, `BROWSER_TAB_CLOSED`, `RECOVERY_REQUIRED`, `CHALLENGED`, `RATE_LIMITED`, `FAILED`) must remain mutually exclusive and accurately reported.
- **No Synthetic Records:** Never fabricate simulated ads or placeholder leads in production runs.

---

## 3. RELEVANCE INVARIANTS
- **No Baseline Regression:** The baseline 100% precision on the 30-candidate calibration dataset must not regress.
- **No Keyword-Only Accepted Leads:** A casual, passing keyword match in ad body text must NEVER qualify an entity as a lead without category or commercial entity corroboration.
- **UNCERTAIN Remains Excluded:** Any candidate evaluated as `UNCERTAIN` must be strictly excluded from the final exported lead list unless a future phase explicitly implements multi-signal corroboration that upgrades it to `RELEVANT`.
- **Hard Contradiction Integrity:** Contradictions in entity identity (e.g. Healthcare, Sports, Politics, Gambling when searching for Furniture or Business Services) must override copy signals and trigger disqualification.

---

## 4. DEDUPLICATION INVARIANTS
- **Single Entity Invariant:** The same advertiser entity (identified by Page ID, normalized Page URL, or cleaned name) must NEVER produce multiple entries in the final lead list, regardless of how many ads or keywords observed.
- **Multi-Keyword Merging:** Leads discovered across multiple frontier keywords must merge into the existing entity, aggregating `activeAds` and `adLibraryIds` without inflating scores.

---

## 5. STORAGE & RECOVERY INVARIANTS
- **Lifecycle Resilience:** Service worker termination/sleep must not corrupt or erase in-flight batch data or keyword frontiers.
- **Deduplicated Resume:** Resuming an interrupted or checkpointed research run must not create duplicate records in IndexedDB.
- **Storage Tiering:** `chrome.storage.local` must remain lightweight (<100 KB); all bulk records remain in IndexedDB.

---

## 6. DATA-TRUTHFULNESS INVARIANTS
- **Missing Data Stays Missing:** Missing websites, missing Facebook pages, or missing domains must be stored as `"not_found"` or `null`. Under no circumstances may fallback values be guessed, synthesized, or hallucinated.
- **Precise Metric Counting:** Counters (`rawAds`, `normalizedCandidates`, `relevantEntities`, `duplicatesRemoved`) must reflect exact arithmetic counts of observed items.

---

## 7. EXPORT INVARIANTS
- **RFC-4180 Compliance:** CSV export must properly quote commas, double-quotes, and newlines.
- **Formula Injection Immunity:** Any field starting with `=`, `+`, `-`, `@`, `\t`, or `\r` must be neutralized with a leading single quote `'`.
- **UTF-8 BOM:** Must be preserved to guarantee international character fidelity across spreadsheet applications.

---

## 8. PERMISSION INVARIANTS
- **Minimal Manifest Permissions:** Do NOT add `<all_urls>`, `webRequest`, `debugger`, or broad background permissions.
- **Host Permissions:** Must remain strictly confined to public Meta Ad Library URLs.

---

## 9. USER EXPERIENCE INVARIANTS
- **Simplicity Preserved:** One-click launch for Preset and Custom workflows must remain intact.
- **No Complex Pre-Requisites:** End users must not be required to configure proxies, API keys, or developer accounts to perform research.
- **Transparent Audit Trail:** Users can inspect why any lead was accepted or rejected directly in the UI.
