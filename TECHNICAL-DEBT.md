# LeadNoria — Technical Debt Register

**Status:** Certified & Frozen  
**Baseline Version:** LeadNoria v1.5.0  

---

## 1. Technical Debt Classification

| ID | Priority | Subsystem | Description | Impact | Current Workaround | Recommended Future Action | Blocks Production? | Decision |
|---|---|---|---|---|---|---|---|---|
| **TD-01** | **P2** | Storage Subsystem | Single `StorageAdapter` key-value interface using `chrome.storage.local` serializes JSON arrays into contiguous memory | Run history over 1,000 runs requires deserializing entire collection arrays | Storage collections enforce bounded retention (max 100 runs, max 100 issues, max 20 snapshots) | Migrate to native IndexedDB object store with indexed primary/foreign keys in V3 | **NO** | **ACCEPT FOR V2** |
| **TD-02** | **P2** | Web Crawler | DOMParser execution runs inside worker context; heavily script-rendered single-page app (SPA) sites may yield sparse initial DOM | Target websites rendered entirely via client-side JavaScript frameworks may not expose server-rendered contact markup on first load | Regex scan fallback searches bundled script references for phone numbers and email strings | Implement optional user-directed active tab inspection for heavily dynamic websites in V3 | **NO** | **ACCEPT FOR V2** |
| **TD-03** | **P3** | UI Layout | ResultDetailDrawer in Chrome Extension popup is bounded by 440px width constraint | Narrow horizontal space in popup requires vertical scrolling and tabbed sub-sections for complex qualification reason graphs | Users are prompted to expand research drawer or switch to the full-height Chrome Side Panel for wide inspection | Maintain current responsive dual-layout; recommend Side Panel for dense multi-factor analysis | **NO** | **ACCEPT FOR V2** |
| **TD-04** | **P3** | Diagnostics | Issue occurrences in memory are synchronized to storage on run completion or manual user review | If browser is hard killed mid-run before persistence flush, ephemeral occurrences during that specific run are lost | Run checkpoints store in-flight anomalies; next startup detects partial state and logs `LIFECYCLE` issue | Add periodic batch flush (every 30s) during long multi-unit research runs | **NO** | **ACCEPT FOR V2** |
| **TD-05** | **P3** | Optimization Engine | Saturation curve calculation uses discrete sliding-window run comparisons rather than continuous spline estimation | Marginal yield trends are represented step-wise across successive runs | Step-wise yield accurately models batch research passes and avoids over-fitting small sample sizes | Retain discrete empirical steps; consider spline interpolation only if run sample sizes exceed 50 | **NO** | **ACCEPT FOR V2** |
| **TD-06** | **Future** | Geographic Subsystem | Administrative boundary coordinates are maintained in static lookup tables (`src/extension/geo/`) | New municipal district codes or rural postal divisions require updating static geographic definitions | System defaults to city/country level fallback coordinates when district codes are unmapped | Integrate optional offline GeoJSON administrative boundary packs | **NO** | **FUTURE ENHANCEMENT** |

---

## 2. Technical Debt Summary & Quality Statement

* **P0 (Critical) Blockers:** **0**
* **P1 (High) Blockers:** **0**
* **P2 (Medium) Items:** **2** (All bounded by operational safeguards; accepted for V2 freeze)
* **P3 (Low) Items:** **3** (Operational ergonomics; accepted for V2 freeze)
* **Future Enhancements:** **1** (Post-V2 roadmap candidate)

All existing technical debt items are well-bounded, documented, and non-blocking for production operations.
