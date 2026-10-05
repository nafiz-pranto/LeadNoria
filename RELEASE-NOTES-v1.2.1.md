# LeadNoria v1.2.1 — Production Release Notes

**Product:** LeadNoria  
**Tagline:** "Discover. Verify. Connect."  
**Descriptor:** "Business lead research from real public signals."  
**Version:** `1.2.1`  
**Release Date:** October 5, 2026  
**Artifact:** `dist/leadnoria-v1.2.1.zip`  
**Byte Size:** `313,456 bytes` (~306.1 KB)  
**SHA-256:** `1c1327049ae85c47e77015e6dadd1bf1c9c31924613807efbfebc942b5ee0419`  
**Manifest SHA-256:** `17b567cbc4daf3c77b1a982e7a877d86d8b788855d65feb4d495ac15e042a215`  

### Historical Preserved Release Baselines
- `dist/leadnoria-v1.0.0.zip` (SHA-256: `bbb3d9f16e1efde29e77af0bf2ffb5e30f20f9b50ad5c0fb89f578aa52931d5b`, untouched)
- `dist/leadnoria-v1.1.0.zip` (SHA-256: `96f95e56a1b23ff9a686f1f2669ba7bafbcee92012d90d4ac553c77fb41d1b67`, preserved)
- `dist/leadnoria-v1.2.0.zip` (preserved previous release candidate)

---

## 1. Release Overview

LeadNoria `v1.2.1` is the certified production release for local, browser-based business lead research. Built as a self-contained Manifest V3 Chrome Extension, LeadNoria collects commercial advertiser signals from the Meta Ad Library, verifies target business websites under strict client-side boundaries, corroborates contact and digital presence facts, and evaluates leads against transparent multi-criteria qualification rules.

This release incorporates all hardening, UX, persistence, and qualification enhancements from Phases 19 through 27, and includes an important reliability fix resolving a runtime `TypeError` when evaluating lead records with unpopulated people contact-reference arrays.

---

## 2. Key Capabilities & Enhancements

### Unified Lead Intelligence & Entity Resolution
- **Canonical Entity Assembly:** Multi-source candidate deduplication joins advertiser signals and website intelligence facts under deterministic entity identity (`canonicalEntityId`).
- **Conflict & Lineage Preservation:** Alternative observations (e.g. conflicting phone numbers or branch locations) are preserved as distinct, source-attributed facts rather than blindly merged.

### Bounded Website Intelligence
- **Public Domain Verification:** Discovers and validates target business websites using bounded same-origin crawling (up to 5 pages per domain, 10s page timeout, 30s domain timeout).
- **Public Contact Extraction:** Discovers publicly listed emails, phone numbers, and social endpoints without form submission, email guessing, or SMTP verification.
- **Technology & Stack Signals:** Detects CMS and digital infrastructure signatures (WordPress, Shopify, Wix, Webflow, Calendly, GTM, Meta Pixel) from public client-side scripts.

### Evidence-Based Qualification Engine
- **Transparent Reason Graphs:** Every qualification decision (`QUALIFIED`, `NOT_QUALIFIED`, `UNCERTAIN`, `BLOCKED`) is fully explainable with human-readable criteria proofs, freshness ratings, and conflict flags.
- **Zero Opaque Lead Scoring:** No speculative buyer propensity, hidden predictive scoring, or conversion guarantees.

### Modern Responsive User Interface
- **Dual Presentation Support:** Operates seamlessly in both standard extension popup (440x600 fixed) and Chrome Side Panel (100vh responsive flex).
- **Fluid Layout & Scroll Discipline:** Full vertical scrolling support with zero layout shift, zero horizontal scrollbar traps, and responsive drawer drill-downs.

### Deterministic Export Firewall
- **Compliance Policy:** Governed exclusively by `ExportPolicy`; restricted source data cannot be exported.
- **Formula Injection Defense:** Spreadsheets cells starting with `=`, `+`, `-`, or `@` are neutralized with leading apostrophe prefixes according to RFC-4180.
- **Reproducible Output:** Exact selection filtering with deterministic JSON key sorting and row ordering.

### Durable Persistence & Crash Recovery
- **Local Storage Management:** Persists research runs with optimistic concurrency locking and automatic checkpoint pruning.
- **Worker Recovery:** Recovers gracefully across browser tab closures, service worker suspensions, and session reloads.

---

## 3. Reliability & Bug Fixes in v1.2.1
- **Defensive Contact Reference Evaluation:** Fixed runtime `TypeError` in `src/extension/qualification/businessIntelligence.ts` by adding defensive nullish checks on optional `emailRefs` and `phoneRefs` arrays in people profiles.

---

## 4. Policy & Security Boundaries

- **Meta Ad Library:** The sole active production external lead source.
- **Google Maps:** Quarantined strictly as an internal, experimental source (`CONTRACT_ONLY`). Live consumer-web scraping is prohibited, non-persistable, and non-exportable.
- **Client-Side Isolation:** Runs 100% locally within the browser. Zero remote server dependencies, zero telemetry, zero analytics tracking.

---

## 5. Known Limitations

1. **Public Signal Dependency:** Lead verification relies entirely on publicly visible business web presence and active Meta commercial ads.
2. **Same-Origin Website Crawl Bounds:** Verification is bounded to 5 pages and 30 seconds per domain to protect browser performance.
3. **No Automatic Contact Verification:** LeadNoria observes and reports public contact entries but does not ping SMTP servers or submit lead forms.
