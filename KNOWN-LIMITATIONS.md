# LeadNoria — Known Limitations Register

**Status:** Certified & Frozen  
**Baseline Version:** LeadNoria v1.5.0  

---

## 1. Authoritative Operational Limitations

1. **Meta Ad Library as Sole Production Acquisition Source:**
   * In the V2 baseline, Meta Ad Library is the only supported automated public discovery source in standard production mode.
   * Entities that do not advertise publicly on Meta platforms will not be discovered automatically through top-of-funnel acquisition, though they may be manually verified via user-provided domains.

2. **Google Maps Integration is Strictly Contract-Only:**
   * Google Maps discovery remains internal, experimental, and contract-checked. Live scraping of Google consumer web is strictly prohibited and deactivated in production builds.

3. **Public Website Crawling is Deterministically Bounded:**
   * To prevent denial of service and respect target web servers, client-side website verification enforces hard operational bounds: maximum 5 pages per domain, 10-second page timeout, 30-second domain timeout, and 500 KB document payload cap.
   * Deep subpages or multi-hop link hierarchies are intentionally ignored.

4. **Public Signal Contactability is Naturally Incomplete:**
   * LeadNoria extracts only publicly published contact channels (business telephone numbers, publicly listed email addresses, contact forms).
   * It does not perform invasive guessing, email permutations, SMTP pinging, or private directory lookups. If a business does not publish a contact method publicly, the record will accurately report contactability as unavailable.

5. **Diagnostics and Analytics are Strictly Local to Browser Profile:**
   * Operational reliability metrics and issue history reflect solely the activity within the specific browser profile and local storage partition where the extension is running.
   * There is no multi-device synchronization or fleet-wide error aggregation.

6. **Optimization Engine Evaluates Historical Observations Only:**
   * Saturation states, marginal yield curves, and search unit rankings are calculated mathematically from past research runs recorded in local storage.
   * The system does not forecast market size, TAM, or economic viability beyond the scope of executed runs.

7. **Zero Predictive Scoring or Intent Modeling:**
   * LeadNoria explicitly rejects "buyer intent prediction", "propensity to buy", and "conversion probability scoring".
   * Qualification states (`QUALIFIED`, `NOT_QUALIFIED`, `UNCERTAIN`, `BLOCKED`) reflect factual commercial criteria satisfaction, not speculative future behavior.

8. **Browser Storage Quota Constraints:**
   * Operating under Chrome extension local storage limits (`chrome.storage.local`), LeadNoria enforces bounded retention: max 100 historical runs, max 10 active checkpoints, max 20 analytics snapshots, max 20 optimization snapshots, and max 100 diagnostic issue fingerprints.
   * Extremely high-volume research requires periodic manual CSV/JSON data export.

9. **No Automatic Unsupervised Execution:**
   * Research recommendations and search unit suggestions require explicit user initiation and confirmation. The extension does not autonomously launch background browser automation without user direction.
