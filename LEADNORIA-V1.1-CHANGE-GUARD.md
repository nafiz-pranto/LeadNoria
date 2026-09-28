# LEADNORIA v1.1 CHANGE-GUARD CHECKLIST

**Purpose:** Mandatory pre-modification safety gate for Prompts 2 through 8.  
**Rule:** Before modifying any file in `leadnoria/`, the agent must complete this checklist. If any check fails or is unaccounted for, execution must pause for user clarification.

---

## Pre-Modification Safety Verification

Before applying any code change, verify and document:

- [ ] **1. Accuracy Objective Alignment:** Is this specific change strictly required by the active prompt's stated accuracy objective?
- [ ] **2. Scraper Boundary:** Does it modify scraper behavior (`content-script.ts` or page interaction)? If yes, does it maintain public Meta Ad Library compliance without evasion/stealth?
- [ ] **3. Relevance Integrity:** Does it modify relevance logic (`relevanceEngine.ts`)? If yes, will the baseline 100% precision on the 30-candidate calibration dataset still pass?
- [ ] **4. Deduplication Integrity:** Does it modify entity resolution or deduplication (`metaAdapter.ts`, `bulkProcessor.ts`)? If yes, is same-advertiser single-entity merging preserved?
- [ ] **5. Storage Architecture:** Does it modify storage schemas or IndexedDB (`bulkStore.ts`)? If yes, does it maintain backwards compatibility and survive service worker sleep?
- [ ] **6. Permissions Integrity:** Does it touch `manifest.json`? If yes, are permissions kept strictly minimal (no `<all_urls>`, no extra host permissions)?
- [ ] **7. User Workflow Integrity:** Does it modify UI workflows (`src/extension/ui/`)? If yes, is the streamlined Preset and Custom user experience kept simple?
- [ ] **8. Regression Surface:** What specific existing tests in `tests/` could regress? (List them explicitly).
- [ ] **9. Test Coverage Requirement:** What new deterministic test file or assertion is required to validate this change?
- [ ] **10. Target Metric Improvement:** Exactly which baseline accuracy metric is expected to improve?
- [ ] **11. Protected Invariants:** Which baseline metrics must NOT get worse (e.g. False Positive Rate must remain 0%)?

---

## Execution Protocol

1. **Verify Baseline State:** Run `npm run lint` and `npm run build` before making edits.
2. **Atomic Modification:** Apply focused edits only to the components targeted by the active prompt.
3. **Run Regression Suites:**
   ```bash
   npx tsx tests/test-prompt57-final-system-acceptance.mjs
   npx tsx tests/test-relevance-engine.mjs
   npx tsx tests/test-strict-gate-v2.mjs
   ```
4. **Run New Targeted Tests:** Verify the new capability with dedicated assertions.
5. **Re-Build Artifacts:** Run `node scripts/build-extension.mjs` to ensure production package builds cleanly.
