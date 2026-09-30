# LeadNoria v1.0.0 — Production Release Notes

**Product:** LeadNoria  
**Tagline:** "Discover. Verify. Connect."  
**Descriptor:** "Business lead research from real public signals."  
**Version:** `1.0.0`  
**Release Date:** September 30, 2026  
**Artifact:** `dist/leadnoria-v1.0.0-production.zip`  
**SHA-256:** `b8167a53dc83c6668c408599b8fe640a8775b5571435e9d14de14b398a3fefda`  

---

## 1. Major Capabilities

LeadNoria is a high-integrity Chrome extension built for business lead research from authenticated public signals. Key capabilities include:

- **Multi-Source Unified Architecture:** Synchronous and staged multi-source research pipeline combining Meta Ad Library public commercial signals, user-provided inputs, and target website verification.
- **Entity Resolution Engine:** High-confidence candidate deduplication, transitive relationship clustering, and deterministic canonical entity identity assignment.
- **Multi-Factor Lead Qualification:** Configurable qualification profiles evaluating mandatory and optional criteria with explainable scoring breakdowns.
- **Geographic Expansion & Saturation Planning:** Intelligent, bounded query planning across geographic units with saturation-based early termination.

---

## 2. Security & Compliance Highlights

- **Manifest V3 Strict Conformance:** Fully self-contained extension with zero remote script execution, zero dynamic evaluation (`eval` / `new Function`), and strict Content Security Policy.
- **Zero Permission Escalation:** Uses only 4 core permissions (`storage`, `tabs`, `scripting`, `sidePanel`). Prohibited permissions (`webRequest`, `unlimitedStorage`, `alarms`, `<all_urls>`) are completely absent.
- **Zero Telemetry:** No external tracking, analytics, or third-party lead marketplace calls.

---

## 3. Persistence & Recovery

- **Crash-Resilient State:** Persistent storage with two-phase commit checkpoints (`STAGED` -> `COMMITTED`) preventing corrupted runs.
- **Deterministic Resumption:** Automatic detection of interrupted runs across browser restarts or service worker suspensions without duplicating completed work.
- **Referential Integrity & Pruning:** Automatic checkpoint pruning bounding storage usage to the 10 latest valid checkpoints.

---

## 4. Export Firewall

- **Projection-Based Export:** Export records are filtered through an strict compliance firewall (`ExportPolicy`).
- **Data Laundering Prevention:** Restricted fields are permanently redacted; unverified provenance is never promoted.
- **Formula Injection Defense:** CSV cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` are neutralized with leading apostrophe prefixes according to RFC-4180.

---

## 5. Source Capabilities & Invariants

- **Meta Ad Library:** Fully operational for live public commercial advertiser discovery.
- **Target Website Verification:** User-initiated deep verification of public domains for business contact corroboration.
- **Google Maps:** **CONTRACT_ONLY**. Live scraping is **NOT ENABLED** and is prohibited by strict architectural and export firewalls.

---

## 6. Known Limitations

- **Google Maps Live Extraction is NOT Enabled:** The Google Maps adapter operates solely in contract mode for dry-run geographic planning. Live DOM extraction or hidden API calls are permanently rejected.
- **Public Signal Availability:** Signals are limited to what entities publish publicly.
- **Browser Local Quota:** Operates within default browser extension local storage bounds.
