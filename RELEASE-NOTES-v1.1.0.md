# LeadNoria v1.1.0 — Production Release Notes

**Product:** LeadNoria  
**Tagline:** "Discover. Verify. Connect."  
**Descriptor:** "Business lead research from real public signals."  
**Version:** `1.1.0`  
**Release Date:** September 30, 2026  
**Artifact:** `dist/leadnoria-v1.1.0.zip`  
**Byte Size:** `704,627 bytes` (~688.1 KB)  
**SHA-256:** `c4c6bcb1452dc44ac8cde1a7273f5a5daebd6fe27df060dc9d9726f56423f19f`  
**Manifest SHA-256:** `6d7bc75317b20ee83f1209a91297f1610b5e4c1ff10f16c9db66a4a5ace4510f`  
**Historical Frozen Baseline:** `dist/leadnoria-v1.0.0.zip` (SHA-256: `bbb3d9f16e1efde29e77af0bf2ffb5e30f20f9b50ad5c0fb89f578aa52931d5b`, untouched)

---

## 1. Release Overview & Version Identity

LeadNoria `v1.1.0` represents the authoritative production release for multi-source lead research from real public signals. This release resolves the release-version identity collision against the frozen historical `v1.0.0` baseline (`dist/leadnoria-v1.0.0.zip`) by assigning the authoritative production package to `v1.1.0` (`dist/leadnoria-v1.1.0.zip`) while keeping the historical `v1.0.0` artifact 100% byte-identical and untouched.

---

## 2. Major Capabilities

LeadNoria is an enterprise-grade Chrome extension built for business lead research from verified public signals:

- **Multi-Source Unified Architecture:** Synchronous and staged multi-source research pipeline combining Meta Ad Library public commercial signals, user-provided inputs, and target website verification.
- **Entity Resolution Engine:** High-confidence candidate deduplication, transitive relationship clustering, and deterministic canonical entity identity assignment.
- **Multi-Factor Lead Qualification:** Configurable qualification profiles evaluating mandatory and optional criteria with explainable scoring breakdowns.
- **Geographic Expansion & Saturation Planning:** Intelligent, bounded query planning across geographic units with saturation-based early termination.

---

## 3. Security & Compliance Highlights

- **Manifest V3 Strict Conformance:** Fully self-contained extension with zero remote script execution, zero dynamic evaluation (`eval` / `new Function`), and strict Content Security Policy.
- **Zero Permission Escalation:** Uses only 4 core permissions (`storage`, `tabs`, `scripting`, `sidePanel`). Prohibited permissions (`webRequest`, `unlimitedStorage`, `alarms`, `<all_urls>`) are completely absent.
- **Zero Telemetry:** No external tracking, analytics, or third-party lead marketplace calls.

---

## 4. Persistence & Crash Resiliency

- **Crash-Resilient State:** Persistent storage with two-phase commit checkpoints (`STAGED` -> `COMMITTED`) preventing corrupted runs.
- **Deterministic Resumption:** Automatic detection of interrupted runs across browser restarts or service worker suspensions without duplicating completed work.
- **Referential Integrity & Pruning:** Automatic checkpoint pruning bounding storage usage to the 10 latest valid checkpoints.

---

## 5. Export Firewall & Data Laundering Prevention

- **Projection-Based Export:** Export records are filtered through a strict compliance firewall (`ExportPolicy`).
- **Data Laundering Prevention:** Restricted fields are permanently redacted; unverified provenance is never promoted.
- **Formula Injection Defense:** CSV cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` are neutralized with leading apostrophe prefixes according to RFC-4180.

---

## 6. Source Capabilities & Invariants

- **Meta Ad Library:** Fully operational for live public commercial advertiser discovery.
- **Target Website Verification:** User-initiated deep verification of public domains for business contact corroboration.
- **Google Maps:** **CONTRACT_ONLY**. Live scraping is **NOT ENABLED** and is prohibited by strict architectural and export firewalls.

---

## 7. Known Limitations

- **Google Maps Live Extraction is NOT Enabled:** The Google Maps adapter operates solely in contract mode for dry-run geographic planning. Live DOM extraction or hidden API calls are permanently rejected.
- **Public Signal Availability:** Signals are limited to what entities publish publicly.
- **Browser Local Quota:** Operates within default browser extension local storage bounds.
