# LeadNoria v1.4.0 Release Notes
**Release Date:** October 6, 2026  
**Artifact SHA-256:** `18d0d38a3b70bf9e699d0dc7a64a63ebe2845b39630ce83d4a4637d826d70881`  
**Manifest SHA-256:** `ce2dd0e7b10d9e464f0b521e090ea7f4a8299a81aa53a18e591d17272386eba3`  
**Release Archive:** `dist/leadnoria-v1.4.0.zip`

---

## Executive Summary

LeadNoria v1.4.0 introduces the **Research Optimization & Saturation Intelligence** subsystem. Built directly upon the existing canonical lead pipeline (Phase 24), local analytics (Phase 30), and persistence architecture (Phase 16), this release provides operators with mathematical, evidence-based intelligence to answer:
- Which geographic areas and search units already have high observed coverage?
- Where are search runs suffering from declining marginal yield and high duplicate pressure?
- Where are underexplored areas producing high yield that warrant further investigation?
- What are the concrete, explainable next-step research recommendations based strictly on observed runs?

---

## Key Subsystems

### 1. Search Unit Performance Matrix
Search units are aggregated across historical research runs along explicit configuration dimensions (geographic area, category, query variant, source type). Each unit tracks:
- Execution attempts and raw candidates
- Unique canonical entities discovered
- Duplicate candidate count and duplicate ratio (%)
- Marginal yield (new entities / attempts) and discovery trend
- Data coverage dimensions (website, email, phone, key people, qualification, conflict rate)

### 2. Observational Saturation Model
Determines research saturation states strictly from observed data without ungrounded forecasting:
- `UNDEREXPLORED`: High marginal yield with low attempts
- `ACTIVE`: Balanced ongoing entity discovery
- `MODERATELY_SATURATED`: Declining discovery rate with moderate duplicates
- `HIGHLY_SATURATED`: Repeated duplicate-heavy acquisition with low yield
- `INSUFFICIENT_DATA`: Sample size too low (< 5 observations) to make a reliable determination

### 3. Duplicate Acquisition Pressure
Detects search areas with repeated duplicate acquisition and produces transparent warnings with:
- Observed duplicate ratio (%)
- Raw sample size
- Threshold (70%)
- Explicit statement that EntityResolver remains authoritative and duplicates are never suppressed

### 4. Explainable Next-Research Recommendations
Actionable research advice with complete mathematical provenance:
- Source search unit ID
- Triggering metrics and thresholds
- Observed evidence list
- Sample sufficiency rating (`LOW_SAMPLE`, `MODERATE_SAMPLE`, `STRONG_SAMPLE`)
- Prefill configuration button to initialize next research run

### 5. Interactive UI Integration
Integrated directly into the extension's Analytics tab as the "Optimization" sub-tab, featuring:
- Coverage Overview KPI cards
- Interactive search unit performance matrix
- Saturation status badges
- Marginal yield trends
- Duplicate pressure alerts
- Side-by-side run comparison for planning

---

## Compliance & Governance

- **Zero Predictive Lead Scoring:** Bounded to mathematical aggregation of verified data; strictly prohibits opaque predictive buyer intent scoring.
- **Zero Telemetry Guarantee:** 100% client-side calculation with zero remote analytics beacons or external tracking calls.
- **Data Firewall Integrity:** Preserved `CONTRACT_ONLY` restriction for experimental Google Maps lineage and strict same-origin website safety boundaries.
