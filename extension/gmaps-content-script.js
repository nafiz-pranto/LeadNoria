(() => {
  // src/extension/acquisition/googleMapsBrowserAdapter.ts
  var ADAPTER_VERSION = "1.0.0-phase19";
  var SOURCE_ID = "GOOGLE_MAPS_CONSUMER_WEB";
  var MAX_TEXT_LENGTH = 500;
  var MAX_HOURS_ENTRIES = 14;
  var MAX_SERVICE_ATTRIBUTES = 20;
  function sanitizeText(raw) {
    if (raw == null) return void 0;
    let s = String(raw);
    const lower = s.trim().toLowerCase();
    if (lower.startsWith("javascript:") || lower.startsWith("data:")) return void 0;
    s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    try {
      s = s.normalize("NFC");
    } catch {
    }
    s = s.trim().slice(0, MAX_TEXT_LENGTH);
    return s.length > 0 ? s : void 0;
  }
  function sanitizeUrl(raw) {
    if (raw == null) return void 0;
    const s = raw.trim().slice(0, 2e3);
    try {
      const url = new URL(s);
      if (url.protocol !== "http:" && url.protocol !== "https:") return void 0;
      return url.href;
    } catch {
      return void 0;
    }
  }
  var AcquisitionLogger = class {
    constructor(sessionId) {
      this.sessionId = sessionId;
    }
    emit(type, message, meta) {
      const event = {
        type,
        sessionId: this.sessionId,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        message,
        metadata: meta
      };
      console.log(`[GMAPS-ACQ] [${type}] ${message}`, meta ?? "");
      return event;
    }
    warn(message) {
      console.warn(`[GMAPS-ACQ] WARN: ${message}`);
    }
    error(message) {
      console.error(`[GMAPS-ACQ] ERROR: ${message}`);
    }
  };
  function generateAcquisitionId(sessionId, index) {
    return `gmaps_acq_${sessionId}_${index}_${Date.now().toString(36)}`;
  }
  function buildDedupSignature(fields) {
    const name = (fields.businessName ?? "").toLowerCase().replace(/\s+/g, " ").trim();
    const addr = (fields.address ?? "").toLowerCase().replace(/\s+/g, " ").trim();
    const url = (fields.mapsUrl ?? fields.listingUrl ?? "").split("?")[0];
    if (url) return `url:${url}`;
    if (name && addr) return `name+addr:${name}|${addr}`;
    if (name) return `name:${name}`;
    return `raw:${JSON.stringify(fields).slice(0, 200)}`;
  }
  var SELECTORS = {
    // Search results list container
    resultsPanel: 'div[role="feed"]',
    // Individual result card in the list
    resultCard: 'div[role="feed"] > div[jsaction]',
    // Business name in result card
    cardName: '.qBF1Pd, [class*="fontHeadlineSmall"], .NrDZNb',
    // Category in result card
    cardCategory: '.W4Efsd .W4Efsd span, .YkTo7b, [jsan*="category"]',
    // Rating in result card
    cardRating: 'span[aria-label*="stars"], span[aria-label*="rated"], .MW4etd',
    // Review count in result card
    cardReviewCount: '.UY7F9, .e4rVHe, [aria-label*="reviews"]',
    // Address in result card
    cardAddress: ".W4Efsd .W4Efsd .W4Efsd span, .GHT2ce .rllt__details .rllt__wrapped",
    // Business status in result card
    cardStatus: '.YhemCb, [aria-label*="Closed"], [aria-label*="Open"]',
    // Link for the listing (maps.google.com/maps/place/...)
    cardLink: 'a[href*="/maps/place/"], a[href*="google.com/maps/place/"]',
    // Detail panel (right side / bottom sheet when listing selected)
    detailPanel: 'div[role="main"][aria-label]',
    // Business name in detail panel
    detailName: 'h1.DUwDvf, h1[class*="fontHeadlineLarge"], .lMbq3e h1',
    // Category in detail panel
    detailCategory: 'button[jsaction*="category"], .DkEaL, .LBgpqf button',
    // Address in detail panel
    detailAddress: 'button[data-item-id="address"] .Io6YTe, [data-item-id="address"] .rogA2c',
    // Phone in detail panel
    detailPhone: 'button[data-item-id*="phone"] .Io6YTe, [data-item-id*="phone:tel"] .rogA2c',
    // Website in detail panel
    detailWebsite: 'a[data-item-id="authority"], a[href][data-tooltip*="website"]',
    // Opening hours in detail panel
    detailHours: 'table.WgFkxc tr, div[aria-label*="hours"] tr',
    // Rating in detail panel
    detailRating: 'div.F7nice span[aria-hidden="true"], .Aq14fc',
    // Review count in detail panel
    detailReviewCount: 'button[jsaction*="review"] span.HHrUdb, div.F7nice span[aria-label*="reviews"]',
    // Description in detail panel
    detailDescription: '.PYvSYb, [data-attrid*="description"] .LGOjhe',
    // Business status in detail panel
    detailStatus: '.o0Svhf, button[jsaction*="openhours"] .ZDu9vd',
    // Price level in detail panel
    detailPrice: "span.mgr77e, .TB0oVb",
    // Service attributes
    detailAttributes: ".E0DTEd .e2moi, .iP2t7d .l0uA6",
    // Place ID from URL (when on /maps/place/ URL)
    // Not a DOM selector — parsed from window.location
    // Results list scroll container
    scrollContainer: 'div[role="feed"]'
  };
  function queryText(root, selector) {
    try {
      const el = root.querySelector(selector);
      return el ? sanitizeText(el.textContent) : void 0;
    } catch {
      return void 0;
    }
  }
  function queryAllTexts(root, selector, max) {
    try {
      const els = Array.from(root.querySelectorAll(selector)).slice(0, max);
      return els.map((el) => sanitizeText(el.textContent)).filter((t) => t != null);
    } catch {
      return [];
    }
  }
  function extractCoordinatesFromUrl(url) {
    try {
      const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (!match) return {};
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (isNaN(lat) || isNaN(lng)) return {};
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return {};
      return { latitude: lat, longitude: lng };
    } catch {
      return {};
    }
  }
  function extractPlaceIdFromUrl(url) {
    try {
      const match = url.match(/[?&!]1s(ChIJ[A-Za-z0-9_-]{20,})/);
      if (match && match[1]) return match[1];
      return void 0;
    } catch {
      return void 0;
    }
  }
  function extractCardFields(card, pageUrl, searchContext) {
    const fields = {};
    const name = queryText(card, SELECTORS.cardName);
    if (name) fields.businessName = name;
    const cats = queryAllTexts(card, SELECTORS.cardCategory, 3);
    if (cats.length > 0) {
      fields.category = cats[0];
      if (cats.length > 1) fields.secondaryCategories = cats.slice(1);
    }
    const ratingEl = card.querySelector("span[aria-label]");
    if (ratingEl) {
      const ariaLabel = sanitizeText(ratingEl.getAttribute("aria-label"));
      if (ariaLabel && (ariaLabel.includes("star") || ariaLabel.includes("rated"))) {
        const ratingMatch = ariaLabel.match(/(\d+\.?\d*)/);
        if (ratingMatch) fields.rating = ratingMatch[1];
      }
      if (!fields.rating) {
        const ratingText = sanitizeText(ratingEl.textContent);
        if (ratingText && /^\d+\.?\d*$/.test(ratingText)) fields.rating = ratingText;
      }
    }
    const reviewText = queryText(card, SELECTORS.cardReviewCount);
    if (reviewText) {
      const reviewMatch = reviewText.match(/[\(（]?([\d,]+)[\)）]?/);
      if (reviewMatch) fields.reviewCount = reviewMatch[1].replace(/,/g, "");
    }
    const statusText = queryText(card, SELECTORS.cardStatus);
    if (statusText) fields.businessStatus = statusText;
    const linkEl = card.querySelector(SELECTORS.cardLink);
    if (linkEl) {
      const href = sanitizeUrl(linkEl.href);
      if (href) {
        fields.listingUrl = href;
        const pid = extractPlaceIdFromUrl(href);
        if (pid) {
          fields.placeId = pid;
          fields.sourceRecordId = pid;
        }
      }
    }
    if (fields.category) fields.primaryCategory = fields.category;
    if (fields.address) fields.fullAddress = fields.address;
    const coords = extractCoordinatesFromUrl(pageUrl);
    if (coords.latitude != null) fields.latitude = coords.latitude;
    if (coords.longitude != null) fields.longitude = coords.longitude;
    fields.mapsUrl = sanitizeUrl(pageUrl) ?? pageUrl;
    if (searchContext) {
      fields.searchContext = searchContext;
      fields.searchQuery = searchContext;
    }
    return fields;
  }
  function extractDetailPanelFields(doc, pageUrl, searchContext) {
    const panel = doc.querySelector(SELECTORS.detailPanel);
    if (!panel) return null;
    const fields = {};
    const name = queryText(panel, SELECTORS.detailName);
    if (name) fields.businessName = name;
    const category = queryText(panel, SELECTORS.detailCategory);
    if (category) fields.category = category;
    const address = queryText(panel, SELECTORS.detailAddress);
    if (address) fields.address = address;
    const phone = queryText(panel, SELECTORS.detailPhone);
    if (phone) {
      const sanitizedPhone = phone.replace(/[^\d\s+\-().]/g, "").trim();
      if (sanitizedPhone.length > 0) fields.phone = sanitizedPhone;
    }
    const websiteEl = panel.querySelector(SELECTORS.detailWebsite);
    if (websiteEl) {
      const href = websiteEl.href ?? "";
      let resolvedUrl;
      try {
        const parsed = new URL(href);
        if (parsed.hostname.includes("google.com") && parsed.searchParams.has("q")) {
          resolvedUrl = sanitizeUrl(parsed.searchParams.get("q"));
        } else {
          resolvedUrl = sanitizeUrl(href);
        }
      } catch {
        resolvedUrl = void 0;
      }
      if (resolvedUrl) fields.websiteUrl = resolvedUrl;
    }
    const hoursRows = queryAllTexts(panel, SELECTORS.detailHours, MAX_HOURS_ENTRIES);
    if (hoursRows.length > 0) fields.openingHours = hoursRows;
    const ratingEl = panel.querySelector(SELECTORS.detailRating);
    if (ratingEl) {
      const ratingText = sanitizeText(ratingEl.textContent);
      if (ratingText && /^\d+\.?\d*$/.test(ratingText)) fields.rating = ratingText;
    }
    const reviewEl = panel.querySelector(SELECTORS.detailReviewCount);
    if (reviewEl) {
      const reviewLabel = sanitizeText(reviewEl.getAttribute("aria-label") ?? reviewEl.textContent);
      if (reviewLabel) {
        const m = reviewLabel.match(/([\d,]+)/);
        if (m) fields.reviewCount = m[1].replace(/,/g, "");
      }
    }
    const description = queryText(panel, SELECTORS.detailDescription);
    if (description) fields.description = description;
    const status = queryText(panel, SELECTORS.detailStatus);
    if (status) fields.businessStatus = status;
    const price = queryText(panel, SELECTORS.detailPrice);
    if (price) {
      const priceClean = price.replace(/[^$€£¥₹]/g, "");
      if (priceClean.length > 0 && priceClean.length <= 4) fields.priceLevel = priceClean;
    }
    const attrs = queryAllTexts(panel, SELECTORS.detailAttributes, MAX_SERVICE_ATTRIBUTES);
    if (attrs.length > 0) {
      fields.serviceAttributes = attrs;
      fields.serviceOptions = attrs;
    }
    if (fields.category) fields.primaryCategory = fields.category;
    if (fields.address) fields.fullAddress = fields.address;
    const coords = extractCoordinatesFromUrl(pageUrl);
    if (coords.latitude != null) fields.latitude = coords.latitude;
    if (coords.longitude != null) fields.longitude = coords.longitude;
    const pid = extractPlaceIdFromUrl(pageUrl);
    if (pid) {
      fields.placeId = pid;
      fields.sourceRecordId = pid;
    }
    fields.mapsUrl = sanitizeUrl(pageUrl) ?? pageUrl;
    fields.listingUrl = sanitizeUrl(pageUrl) ?? pageUrl;
    if (searchContext) {
      fields.searchContext = searchContext;
      fields.searchQuery = searchContext;
    }
    return Object.keys(fields).length > 0 ? fields : null;
  }
  var GoogleMapsBrowserAdapter = class {
    constructor(sessionId) {
      this.sourceId = SOURCE_ID;
      this.adapterVersion = ADAPTER_VERSION;
      this.mutationObserver = null;
      this.observedMutations = 0;
      this.candidateIndex = 0;
      this.logger = new AcquisitionLogger(sessionId);
    }
    // ──────────────────────────────────────────
    // Page Detection
    // ──────────────────────────────────────────
    detectSupportedPage(url) {
      try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();
        const pathname = parsed.pathname;
        const isMapsSubdomain = hostname === "maps.google.com";
        const isGoogleMapsPath = (hostname === "www.google.com" || hostname === "google.com" || hostname.endsWith(".google.com")) && (pathname.startsWith("/maps") || isMapsSubdomain);
        if (!isGoogleMapsPath && !isMapsSubdomain) {
          return {
            isSupported: false,
            pageType: "UNKNOWN",
            url,
            reason: "Not a Google Maps URL"
          };
        }
        let pageType = "UNKNOWN";
        if (pathname.startsWith("/maps/place/") || pathname.startsWith("/maps/place")) {
          pageType = "PLACE_DETAIL";
        } else if (pathname.startsWith("/maps/search/") || pathname.startsWith("/maps/search") || parsed.searchParams.has("q") || pathname === "/maps" || pathname === "/maps/" || pathname === "/" && isMapsSubdomain) {
          pageType = "SEARCH_RESULTS";
        }
        if (pageType === "UNKNOWN") {
          return {
            isSupported: false,
            pageType,
            url,
            reason: "Unrecognised Maps page type (not search results or place detail)"
          };
        }
        return { isSupported: true, pageType, url };
      } catch {
        return {
          isSupported: false,
          pageType: "UNKNOWN",
          url,
          reason: "Invalid URL"
        };
      }
    }
    // ──────────────────────────────────────────
    // Page Readiness
    // ──────────────────────────────────────────
    isPageReady() {
      if (typeof document === "undefined") return false;
      const feed = document.querySelector(SELECTORS.resultsPanel);
      if (feed && feed.children.length > 0) return true;
      const detail = document.querySelector(SELECTORS.detailPanel);
      if (detail && detail.textContent && detail.textContent.trim().length > 10) return true;
      return false;
    }
    // ──────────────────────────────────────────
    // Observer Management
    // ──────────────────────────────────────────
    attachObservers(config) {
      if (typeof MutationObserver === "undefined") return;
      if (this.mutationObserver) return;
      this.observedMutations = 0;
      this.mutationObserver = new MutationObserver((mutations) => {
        this.observedMutations += mutations.length;
      });
      const target = document.querySelector(SELECTORS.resultsPanel) ?? document.body;
      this.mutationObserver.observe(target, {
        childList: true,
        subtree: true
      });
      this.logger.emit("OBSERVER_ATTACHED", "MutationObserver attached to results feed");
    }
    detachObservers() {
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
        this.mutationObserver = null;
        this.logger.emit("OBSERVER_DETACHED", "MutationObserver detached");
      }
    }
    // ──────────────────────────────────────────
    // Candidate Collection
    // ──────────────────────────────────────────
    collectVisibleCandidates(config, seenSignatures) {
      if (typeof document === "undefined") return [];
      const pageUrl = typeof window !== "undefined" ? window.location.href : "";
      const results = [];
      const cards = Array.from(document.querySelectorAll(SELECTORS.resultCard));
      if (cards.length > 0) {
        for (const card of cards) {
          if (results.length + seenSignatures.size >= config.maxCandidates) break;
          try {
            const observed = extractCardFields(card, pageUrl, config.searchContext);
            if (!observed.businessName) continue;
            const sig = buildDedupSignature(observed);
            if (seenSignatures.has(sig)) {
              this.logger.emit("CANDIDATE_SKIPPED", "Duplicate signature \u2014 skipped", { sig });
              continue;
            }
            seenSignatures.add(sig);
            this.candidateIndex++;
            const candidate = {
              acquisitionId: generateAcquisitionId(config.sessionId, this.candidateIndex),
              source: SOURCE_ID,
              sourceUrl: pageUrl,
              observedAt: (/* @__PURE__ */ new Date()).toISOString(),
              sessionId: config.sessionId,
              observed,
              dedupSignature: sig,
              provenance: "GOOGLE_DERIVED",
              restrictionBasis: "GOOGLE_CONSUMER_WEB_RESTRICTED",
              sourceContribution: {
                source: "GOOGLE_MAPS",
                acquisitionContext: "GOOGLE_CONSUMER_WEB",
                isRestricted: true,
                policyStatus: "POLICY_GATED",
                persistenceStatus: "NOT_PERSISTABLE",
                exportStatus: "NOT_EXPORTABLE"
              },
              warnings: [],
              errors: []
            };
            results.push(candidate);
            this.logger.emit("CANDIDATE_DISCOVERED", `Candidate: ${observed.businessName}`, {
              acquisitionId: candidate.acquisitionId,
              sig
            });
          } catch (err) {
            const acqError = {
              code: "EXTRACTION_FAILED",
              message: err instanceof Error ? err.message : "Unknown extraction error",
              recoverable: true,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            };
            this.logger.error(`Card extraction failed: ${acqError.message}`);
          }
        }
      } else {
        if (config.collectDetails) {
          try {
            const detailFields = extractDetailPanelFields(document, pageUrl, config.searchContext);
            if (detailFields && detailFields.businessName) {
              const observed = detailFields;
              const sig = buildDedupSignature(observed);
              if (!seenSignatures.has(sig)) {
                seenSignatures.add(sig);
                this.candidateIndex++;
                results.push({
                  acquisitionId: generateAcquisitionId(config.sessionId, this.candidateIndex),
                  source: SOURCE_ID,
                  sourceUrl: pageUrl,
                  observedAt: (/* @__PURE__ */ new Date()).toISOString(),
                  sessionId: config.sessionId,
                  observed,
                  dedupSignature: sig,
                  provenance: "GOOGLE_DERIVED",
                  restrictionBasis: "GOOGLE_CONSUMER_WEB_RESTRICTED",
                  sourceContribution: {
                    source: "GOOGLE_MAPS",
                    acquisitionContext: "GOOGLE_CONSUMER_WEB",
                    isRestricted: true,
                    policyStatus: "POLICY_GATED",
                    persistenceStatus: "NOT_PERSISTABLE",
                    exportStatus: "NOT_EXPORTABLE"
                  },
                  warnings: ["Collected from detail panel, not search results list"],
                  errors: []
                });
              }
            }
          } catch {
          }
        }
      }
      return results;
    }
    collectDetailPanel(config) {
      if (typeof document === "undefined") return null;
      const pageUrl = typeof window !== "undefined" ? window.location.href : "";
      return extractDetailPanelFields(document, pageUrl, config.searchContext);
    }
    // ──────────────────────────────────────────
    // Scroll
    // ──────────────────────────────────────────
    /**
     * Trigger a single bounded scroll step on the results list.
     * Uses the results feed container scroll, not window.scrollBy.
     * Returns true if scroll was triggered, false if not applicable.
     */
    triggerScroll() {
      if (typeof document === "undefined") return false;
      const feed = document.querySelector(SELECTORS.scrollContainer);
      if (feed) {
        feed.scrollBy({ top: 800, behavior: "smooth" });
        return true;
      }
      if (typeof window !== "undefined") {
        window.scrollBy({ top: 800, behavior: "smooth" });
        return true;
      }
      return false;
    }
    isAtBottom() {
      if (typeof document === "undefined") return true;
      const feed = document.querySelector(SELECTORS.scrollContainer);
      if (feed) {
        return feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 50;
      }
      if (typeof window !== "undefined") {
        return window.innerHeight + window.scrollY >= document.body.scrollHeight - 100;
      }
      return true;
    }
    // ──────────────────────────────────────────
    // Dispose
    // ──────────────────────────────────────────
    dispose() {
      this.detachObservers();
      this.candidateIndex = 0;
      this.observedMutations = 0;
      this.logger.emit("OBSERVER_DETACHED", "Adapter disposed \u2014 all resources released");
    }
  };

  // src/extension/acquisition/browserAcquisitionTypes.ts
  var DEFAULT_ACQUISITION_CONFIG = {
    sessionId: "",
    maxCandidates: 100,
    maxScrolls: 20,
    renderWaitMs: 1500,
    maxRetries: 3,
    collectDetails: false
  };

  // src/extension/acquisition/googleMapsContentScript.ts
  var activeAdapter = null;
  var activeConfig = null;
  var isCancelled = false;
  var isRunning = false;
  function log(type, msg) {
    console.log(`[GMAPS-CS] [${type}] ${msg}`);
  }
  function warn(msg) {
    console.warn(`[GMAPS-CS] WARN: ${msg}`);
  }
  async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function runAcquisitionSession(config) {
    const sessionId = config.sessionId;
    const adapter = new GoogleMapsBrowserAdapter(sessionId);
    activeAdapter = adapter;
    activeConfig = config;
    const sessionState = {
      sessionId,
      status: "INITIALIZING",
      candidatesCollected: 0,
      candidatesSkipped: 0,
      scrollCount: 0,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastActivityAt: (/* @__PURE__ */ new Date()).toISOString(),
      errors: [],
      warnings: []
    };
    const allCandidates = [];
    const seenSignatures = /* @__PURE__ */ new Set();
    log("SESSION_STARTED", `Session ${sessionId} starting`);
    const url = typeof window !== "undefined" ? window.location.href : "";
    const detection = adapter.detectSupportedPage(url);
    if (!detection.isSupported) {
      const error = {
        code: "UNSUPPORTED_PAGE",
        message: detection.reason ?? "Page not supported",
        recoverable: false,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      sessionState.status = "FAILED";
      sessionState.errors.push(error);
      log("PAGE_UNSUPPORTED", detection.reason ?? "Not supported");
      adapter.dispose();
      activeAdapter = null;
      return { sessionId, status: "FAILED", candidates: [], sessionState, errors: [error] };
    }
    log("PAGE_DETECTED", `Page type: ${detection.pageType} \u2014 ${url}`);
    sessionState.status = "ACQUIRING";
    let readyAttempts = 0;
    while (!adapter.isPageReady() && readyAttempts < config.maxRetries) {
      if (isCancelled) break;
      await sleep(config.renderWaitMs);
      readyAttempts++;
      log("RENDER_WAITED", `Waiting for page ready (attempt ${readyAttempts}/${config.maxRetries})`);
    }
    if (!adapter.isPageReady() && readyAttempts >= config.maxRetries) {
      const error = {
        code: "PAGE_NOT_READY",
        message: "Page did not become ready within retry limit",
        recoverable: false,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      sessionState.status = "FAILED";
      sessionState.errors.push(error);
      adapter.dispose();
      activeAdapter = null;
      return { sessionId, status: "FAILED", candidates: [], sessionState, errors: [error] };
    }
    adapter.attachObservers(config);
    for (let scroll = 0; scroll <= config.maxScrolls; scroll++) {
      if (isCancelled) {
        sessionState.status = "CANCELLED";
        log("SESSION_CANCELLED", `Cancelled at scroll ${scroll}`);
        break;
      }
      if (allCandidates.length >= config.maxCandidates) {
        log("SESSION_COMPLETED", `maxCandidates (${config.maxCandidates}) reached`);
        break;
      }
      const batch = adapter.collectVisibleCandidates(config, seenSignatures);
      for (const c of batch) {
        allCandidates.push(c);
        sessionState.candidatesCollected++;
      }
      sessionState.lastActivityAt = (/* @__PURE__ */ new Date()).toISOString();
      if (adapter.isAtBottom() && scroll > 0) {
        log("SESSION_COMPLETED", "Results list exhausted (at bottom)");
        break;
      }
      if (scroll < config.maxScrolls) {
        adapter.triggerScroll();
        sessionState.scrollCount++;
        log("SCROLL_TRIGGERED", `Scroll ${sessionState.scrollCount}/${config.maxScrolls}`);
        await sleep(config.renderWaitMs);
      }
    }
    if (config.collectDetails && !isCancelled) {
      try {
        const detail = adapter.collectDetailPanel(config);
        if (detail) {
          log("CANDIDATE_NORMALIZED", "Detail panel fields collected");
        }
      } catch {
        warn("Detail panel collection failed \u2014 non-fatal");
      }
    }
    const finalStatus = isCancelled ? "CANCELLED" : allCandidates.length === 0 ? "FAILED" : allCandidates.length < config.maxCandidates ? "COMPLETED" : "PARTIAL";
    if (finalStatus === "FAILED") {
      const noResultsError = {
        code: "NO_RESULTS",
        message: "No candidates collected from this page",
        recoverable: true,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      sessionState.errors.push(noResultsError);
    }
    sessionState.status = finalStatus;
    log(`SESSION_${finalStatus}`, `${allCandidates.length} candidates collected`);
    adapter.dispose();
    activeAdapter = null;
    activeConfig = null;
    isRunning = false;
    return {
      sessionId,
      status: finalStatus,
      candidates: allCandidates,
      sessionState,
      errors: sessionState.errors
    };
  }
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === "GMAPS_DETECT") {
        const url = typeof window !== "undefined" ? window.location.href : "";
        const probe = new GoogleMapsBrowserAdapter("probe");
        const detection = probe.detectSupportedPage(url);
        probe.dispose();
        sendResponse({
          type: "GMAPS_DETECT_RESULT",
          payload: detection
        });
        return true;
      }
      if (message.type === "GMAPS_ACQUIRE") {
        if (isRunning) {
          sendResponse({
            type: "GMAPS_ACQUIRE_ERROR",
            payload: { error: "Acquisition session already running", code: "ALREADY_RUNNING" }
          });
          return true;
        }
        isRunning = true;
        isCancelled = false;
        const config = {
          ...DEFAULT_ACQUISITION_CONFIG,
          ...message.payload?.config ?? {},
          sessionId: message.payload?.sessionId ?? `gmaps_${Date.now()}`
        };
        runAcquisitionSession(config).then((result) => {
          isRunning = false;
          sendResponse({
            type: "GMAPS_ACQUIRE_RESULT",
            payload: result
          });
        }).catch((err) => {
          isRunning = false;
          sendResponse({
            type: "GMAPS_ACQUIRE_ERROR",
            payload: {
              error: err instanceof Error ? err.message : "Unknown error",
              code: "UNKNOWN"
            }
          });
        });
        return true;
      }
      if (message.type === "GMAPS_CANCEL") {
        isCancelled = true;
        if (activeAdapter) {
          activeAdapter.dispose();
          activeAdapter = null;
        }
        isRunning = false;
        log("SESSION_CANCELLED", "Cancelled by service worker message");
        sendResponse({ type: "GMAPS_CANCEL_ACK" });
        return true;
      }
      return false;
    });
  }
  try {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: "GMAPS_CONTENT_SCRIPT_READY",
        payload: { url: typeof window !== "undefined" ? window.location.href : "" }
      }).catch(() => {
      });
    }
  } catch {
  }
  log("SESSION_STARTED", `Google Maps content script active on: ${typeof window !== "undefined" ? window.location.href : "unknown"}`);
})();
