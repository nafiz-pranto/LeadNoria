# LeadNoria — Long-Term Architectural Roadmap

**Status:** Certified & Frozen  
**Baseline Version:** LeadNoria v1.5.0  

---

## 1. Roadmap Categorization

### A. High-Value Future Work (Post-V2 Considerations)
1. **IndexedDB Direct Storage Layer:**
   * Transition `StorageAdapter` from `chrome.storage.local` to a native IndexedDB object store with indexation on `canonicalEntityId`, `fingerprint`, and `searchUnitId`.
   * Enables seamless storage of 10,000+ lead records without serializing large JSON arrays.
2. **Offline Public Sector Open Data Registries:**
   * Support importing public business registrar snapshots (e.g. UK Companies House, OpenCorporates public open data dumps).
   * Provides local, privacy-safe identity corroboration without external scraping.
3. **Advanced Export Formats:**
   * Add structured XLSX export with formatted sheets, native Excel table definitions, and embedded policy metadata banners.

---

### B. Optional Ergonomic Enhancements
1. **Side Panel Theme Customization:**
   * Add high-contrast light/dark theme toggles in Settings while preserving accessible WCAG AA color ratios.
2. **Custom Qualification Profile Importer:**
   * Allow users to import JSON qualification rule configurations to adjust commercial criteria weights for specific niche verticals.
3. **Run Comparison Diff View in Drawer:**
   * Enable side-by-side lead attribute diffing directly within the entity detail drawer.

---

### C. Explicitly Rejected Ideas (Permanent Architecture Anti-Patterns)
The following concepts are **strictly rejected** and will **never** be implemented in LeadNoria:

| Rejected Concept | Rationale & Architectural Prohibition |
|---|---|
| **Private Endpoint Scraping** | Violates privacy contracts, terms of service, and local-first compliance boundaries. |
| **CAPTCHA Bypass & Anti-Bot Evasion** | LeadNoria operates transparently using legitimate public browser tabs. Adversarial evasion mechanisms are prohibited. |
| **Stealth Scraping & Proxy Rotators** | Third-party proxy networks and residential scraper meshes compromise user security and violate data governance. |
| **Browser Fingerprint Spoofing** | Compromises extension integrity and browser trust boundaries. |
| **Cloud Telemetry & User Surveillance** | Violates LeadNoria core commitment to 100% local-first, privacy-preserving execution. Zero remote beacons permitted. |
| **Predictive Buyer Intent Scoring** | Lead scoring must remain strictly empirical and derived from verifiable public facts. Fabricated "intent prediction" is anti-scientific and unsupportable. |
| **Conversion Prediction Presented as Fact** | LeadNoria provides factual signals, not speculative sales forecasts. |
| **Unrestricted Google Consumer Scraping** | Google Maps data extraction is prohibited on policy, legal, and compliance grounds. Contract-only quarantine is permanent. |

---

### D. Areas Requiring Architectural Reevaluation
1. **Headless Execution / CLI Daemon:**
   * Executing outside the browser environment requires replacing Chrome MV3 APIs (`chrome.storage`, `chrome.tabs`, `chrome.scripting`) with native operating system primitives.
2. **Multi-User Shared Team Workspace:**
   * Requires peer-to-peer end-to-end encrypted synchronization or optional self-hosted relay servers, which fundamentally alters the single-user local-first trust model.

---

### E. Areas Requiring External Authorization / Policy Review
1. **Direct CRM Webhook Integrations (HubSpot, Salesforce):**
   * Pushing data to external cloud CRM platforms requires third-party API keys and OAuth tokens, demanding strict outbound network security review and explicit user data authorization.
2. **Official Platform API Partnerships:**
   * Integrating official partner APIs (e.g. Meta Marketing API, LinkedIn Company API) requires platform developer accounts, external API credentials, and commercial rate agreements.
