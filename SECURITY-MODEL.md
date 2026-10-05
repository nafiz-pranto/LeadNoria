# LeadNoria — Frozen Security & Policy Model

**Status:** Certified & Frozen  
**Baseline Version:** LeadNoria v1.5.0  
**Scope:** Browser Extension Security, Data Privacy, Compliance Boundaries, and Threat Modeling  

---

## 1. Frozen Permission Model (Manifest V3)

LeadNoria enforces the principle of least privilege. The extension manifest requests only four standard permissions:

```json
{
  "permissions": ["storage", "tabs", "scripting", "sidePanel"],
  "host_permissions": [
    "https://www.facebook.com/ads/library/*",
    "https://web.facebook.com/ads/library/*"
  ],
  "optional_host_permissions": [
    "https://*/*"
  ]
}
```

### Prohibited / Rejected Permissions
The following privileged Chrome APIs are permanently rejected:
* `webRequest` / `webRequestBlocking`: Eliminates network interception risks.
* `debugger`: Prevents arbitrary DOM and protocol tampering.
* `cookies`: Eliminates access to session identifiers and authentication state.
* `history`: Prevents surveillance of user browsing habits.
* `webNavigation`: Eliminates speculative cross-tab tracking.
* `userScripts`: Enforces static, auditable code execution.
* `unlimitedStorage`: Enforces hard local retention boundaries.

---

## 2. Google Maps Contract Quarantine

* **Status:** `CONTRACT_ONLY` / **INTERNAL EXPERIMENTAL ONLY**
* **Live Scraping Ban:** Live extraction from Google consumer web or Google Maps is strictly prohibited in production builds.
* **Lineage Tracking:** Any record originating from or touching Google consumer lineage is flagged with `hasGoogleConsumerWebLineage: true` and `isRestricted: true`.
* **Quarantine Enforcement:**
  * Non-persistable: StorageAdapter blocks saving Google-derived records to long-term storage collections.
  * Non-exportable: ExportPolicy drops restricted records from CSV and JSON export pipelines.
  * Anti-Laundering Barrier: Joining a Meta candidate with a Google record preserves restricted status over the entire entity (`isRestricted = true`). Diagnostics packages emit aggregate counters only (`googleRestrictedAccountingCount: N`) and strip all Place IDs, Maps URLs, and address details.

---

## 3. Public Website Crawler Sandbox

Website signal enrichment operates within strict client-side safety guardrails:
* **Same-Origin Constraint:** Only links matching the verified business hostname are eligible for crawling. `www` $\leftrightarrow$ apex domain equivalence is permitted; arbitrary subdomains and cross-domain redirects are rejected.
* **SSRF Defense:** Private IP addresses, loopback addresses (`127.0.0.1`, `localhost`), link-local addresses (`169.254.0.0/16`), and internal network ranges (`10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`) are blocked before dispatching fetch requests.
* **Protocol Whitelist:** Only standard `https://` and `http://` protocols are handled. Dangerous schemes (`javascript:`, `data:`, `file:`, `blob:`) are discarded.
* **Resource Bounds:**
  * Maximum 5 pages per domain.
  * Maximum 10 seconds per page fetch.
  * Maximum 30 seconds total domain verification duration.
  * Maximum 500 KB document payload limit (excess truncated).

---

## 4. Application Security Controls

* **Zero `eval()` Policy:** Prohibits `eval()`, `new Function()`, and inline script strings.
* **Zero Telemetry Guarantee:** Zero integration with remote telemetry platforms (no Mixpanel, Segment, Google Analytics, Sentry, or custom pingbacks). Diagnostic reports are user-initiated and exported locally.
* **Spreadsheet Formula Injection Defense:** CSV formula-injection mitigation is applied before CSV serialization, prefix-escaping command tokens (`=`, `+`, `-`, `@`) with a single quote to prevent arbitrary formula execution in spreadsheet viewers.
* **XSS Sanitization:** All untrusted public strings (business names, categories, error text, user queries) are sanitized through HTML tag stripping and attribute escaping before rendering into the React DOM.

---

## 5. Authoritative Threat Model

| # | Threat Area | Attack Vector / Failure Mode | Current Security Control | Residual Risk | Mitigation / Accepted Boundary |
|---|---|---|---|---|---|
| **T1** | **Malicious Source Text** | Adversary inputs HTML/JS in ad creative or business title | DOM text node rendering via React, `sanitizePassiveText()` | Low | Tag-stripping regex enforced in normalization and UI |
| **T2** | **Malicious Website Text** | Target domain injects payload into website body | Document parsing in sandboxed DOMParser; text content extraction only | Negligible | Script tags stripped prior to regex parsing |
| **T3** | **Unsafe URL Schemes** | Website links `javascript:` or `data:` in href | `getSafeExternalUrl()` validates against `http:` / `https:` | Low residual risk; protected by layered URL scheme validation rejecting non-http(s) targets | All other protocols resolved to `undefined` or `#` |
| **T4** | **SSRF via Website Probe** | User seeds private network address | Pre-request IP and hostname validation blocks loopback and RFC 1918 ranges | Low | Fetch dispatches only to public internet hostnames |
| **T5** | **Cross-Site Scripting (XSS)** | Error message injects script in DiagnosticsView | `normalizeErrorMessage()` strips `<script>` tags; React escapes bindings | Controlled residual risk; no known exploitable path identified under script-tag stripping and React auto-escaping | No `dangerouslySetInnerHTML` in codebase |
| **T6** | **CSV Formula Injection** | Public business name begins with `=cmd|...` | Single-quote prefix escaping applied prior to CSV serialization | Controlled residual risk; formula-injection prefixes neutralized prior to CSV serialization | Verified by dedicated export test suites |
| **T7** | **Malformed Local Storage** | Corrupted JSON or quota error in Chrome storage | Defensive JSON parsing with fallback defaults; error catching | Low | Corrupted diagnostic store returns empty collection safely |
| **T8** | **Worker Suspension / Restart** | Service worker suspended mid-research run | Active state checkpointed to local storage; resume flag set | Low | Pipeline recovers from latest durable checkpoint |
| **T9** | **Race Conditions / Locks** | Concurrent operations attempt conflicting writes | Mutex operation lock with 60-second automatic staleness eviction | Low | Prevents duplicate run execution |
| **T10** | **Policy Laundering** | Merging Google Maps candidate into Meta record | Bi-directional policy inheritance marks canonical record restricted | Low residual risk; protected by layered lineage taint-propagation and policy inheritance | Lineage tracks all contributing source families |
| **T11** | **Restricted Data Persistence** | Google records accidentally written to history | StorageAdapter checks `isRestricted` flag before writing collections | Controlled residual risk; blocked by StorageAdapter write boundary policy enforcement | Enforced at repository write boundary |
| **T12** | **Restricted Data Export** | Google records exported via CSV / JSON | ExportPolicy projection drops non-exportable records and fields | Low residual risk; protected by strict ExportPolicy projection filtering | Strict projection filtering enforced |
| **T13** | **Diagnostic Data Leakage** | Diagnostic report exports PII or credentials | Diagnostic package sanitizes strings, strips PII, and bounds output | Controlled residual risk; diagnostic reproduction package strictly sanitizes PII and normalizes dynamic identifiers | Verified by Phase 32 privacy test assertions |
| **T14** | **Local Storage Saturation** | Unbounded diagnostic or run history fills quota | Hard limits: 100 runs, 100 issues; deterministic eviction of oldest/lowest | Low | Quota alerts triggered at 80% usage |
| **T15** | **Browser Lifecycle Crashes** | Browser abruptly closed during crawler fetch | Timeouts on all network requests (10s page, 30s domain); no hung handles | Low | Operating system cleans up background sockets |
