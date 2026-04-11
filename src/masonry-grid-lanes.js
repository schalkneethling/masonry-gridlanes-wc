// @ts-check

import {
  columnCountFromMinWidth,
  layoutGridLanes,
  resolveGridAxisPlacement,
  trackCountFromMinSize,
} from "./fallback-layout.js";
import {
  createPretextMetricsFromStyles,
  estimateTextElementHeightCached,
  estimateTextHeightFromMetrics,
  isPretextTextCandidate,
} from "./pretext-height.js";
import { supportsGridLanes } from "./supports-grid-lanes.js";

const CLASS_SUPPORTS = "masonry-grid-lanes--supports";
const CLASS_FALLBACK = "masonry-grid-lanes--fallback";
const MANAGED_ITEM_STYLE_PROPS = [
  "top",
  "left",
  "width",
  "height",
  "position",
  "boxSizing",
  "display",
  "maxHeight",
  "visibility",
];

export class MasonryGridLanes extends HTMLElement {
  /** @returns {string[]} */
  static get observedAttributes() {
    return [
      "gap",
      "min-column-width",
      "min-row-height",
      "row-count",
      "flow-tolerance",
      "mode",
      "text-metrics",
    ];
  }

  constructor() {
    super();
    /** @type {ResizeObserver | null} */
    this._roHost = null;
    /** @type {ResizeObserver | null} */
    this._roChildren = null;
    /** @type {MutationObserver | null} */
    this._mo = null;
    /** @type {number | undefined} */
    this._raf = undefined;
    /** @type {"columns" | "rows" | null} */
    this._lastFallbackMode = null;
    /** @type {string | null} */
    this._authorMinHeight = null;
    /** @type {string | null} */
    this._authorMinWidth = null;
    /** @type {WeakMap<HTMLElement, Record<string, string>>} */
    this._authorItemStyles = new WeakMap();
    /** @type {WeakMap<HTMLElement, Record<string, string>>} */
    this._lastManagedItemStyles = new WeakMap();
  }

  connectedCallback() {
    if (this._authorMinHeight == null) {
      this._authorMinHeight = this.style.minHeight;
    }
    if (this._authorMinWidth == null) {
      this._authorMinWidth = this.style.minWidth;
    }
    this._adoptNativeOrFallback();
    this._syncAttributesToCssVars();
    if (!supportsGridLanes()) {
      this._setupObservers();
    }
    this._scheduleLayout();
  }

  disconnectedCallback() {
    this._teardownObservers();
    if (this._raf !== undefined) {
      cancelAnimationFrame(this._raf);
      this._raf = undefined;
    }
  }

  /**
   * @param {string} _name
   * @param {string | null} _old
   * @param {string | null} _new
   */
  attributeChangedCallback(_name, _old, _new) {
    this._syncAttributesToCssVars();
    this._scheduleLayout();
  }

  _adoptNativeOrFallback() {
    const native = supportsGridLanes();
    this.classList.toggle(CLASS_SUPPORTS, native);
    this.classList.toggle(CLASS_FALLBACK, !native);
    if (native) {
      this._clearItemGeometry();
      this._lastFallbackMode = null;
      this._teardownObservers();
    }
  }

  _clearItemGeometry() {
    for (const el of this._items()) {
      if (!(el instanceof HTMLElement)) continue;
      this._restoreAuthorItemStyles(el);
    }
    this.style.setProperty("--mgl-fallback-min-height", "0px");
    this.style.setProperty("--mgl-fallback-min-width", "0px");
    this.style.minHeight = this._authorMinHeight ?? "";
    this.style.minWidth = this._authorMinWidth ?? "";
  }

  /** @returns {Element[]} */
  _items() {
    return Array.from(this.children).filter((n) => n.nodeType === Node.ELEMENT_NODE);
  }

  _syncAttributesToCssVars() {
    const gap = this.getAttribute("gap");
    const minCol = this.getAttribute("min-column-width");
    const minRow = this.getAttribute("min-row-height");
    const rowCount = this.getAttribute("row-count");
    const tol = this.getAttribute("flow-tolerance");
    const mode = this.getAttribute("mode") ?? "columns";

    if (gap != null && gap !== "") {
      const v = /[a-z%]/i.test(gap) ? gap : `${gap}px`;
      this.style.setProperty("--mgl-gap", v);
    } else {
      this.style.removeProperty("--mgl-gap");
    }

    if (minCol != null && minCol !== "") {
      const v = /[a-z%]/i.test(minCol) ? minCol : `${minCol}px`;
      this.style.setProperty("--mgl-min-column", v);
    } else {
      this.style.removeProperty("--mgl-min-column");
    }

    if (minRow != null && minRow !== "") {
      const v = /[a-z%]/i.test(minRow) ? minRow : `${minRow}px`;
      this.style.setProperty("--mgl-min-row", v);
    } else {
      this.style.removeProperty("--mgl-min-row");
    }

    if (rowCount != null && rowCount !== "") {
      const n = Number.parseInt(rowCount, 10);
      if (Number.isFinite(n) && n > 0) {
        this.style.setProperty("--mgl-row-count", String(Math.max(1, Math.floor(n))));
      } else {
        this.style.removeProperty("--mgl-row-count");
      }
    } else {
      this.style.removeProperty("--mgl-row-count");
    }

    if (tol != null && tol !== "") {
      this.style.setProperty("--mgl-flow-tolerance", tol);
    } else {
      this.style.removeProperty("--mgl-flow-tolerance");
    }

    this.dataset.mglMode = mode === "rows" ? "rows" : "columns";
  }

  _setupObservers() {
    if (supportsGridLanes()) {
      return;
    }
    this._teardownObservers();
    this._roHost = new ResizeObserver(() => this._scheduleLayout());
    this._roHost.observe(this);
    this._roChildren = new ResizeObserver(() => this._scheduleLayout());
    for (const el of this._items()) {
      this._roChildren.observe(el);
    }
    this._mo = new MutationObserver(() => {
      if (this._roChildren) {
        for (const el of this._items()) {
          this._roChildren.observe(el);
        }
      }
      this._scheduleLayout();
    });
    this._mo.observe(this, { childList: true });
  }

  _teardownObservers() {
    this._roHost?.disconnect();
    this._roHost = null;
    this._roChildren?.disconnect();
    this._roChildren = null;
    this._mo?.disconnect();
    this._mo = null;
  }

  _scheduleLayout() {
    if (supportsGridLanes()) {
      return;
    }
    if (this._raf !== undefined) {
      cancelAnimationFrame(this._raf);
    }
    this._raf = requestAnimationFrame(() => {
      this._raf = undefined;
      this._layoutFallback();
    });
  }

  /**
   * @param {string} val
   * @param {number} fallback
   */
  _parsePx(val, fallback) {
    const n = Number.parseFloat(val);
    return Number.isFinite(n) ? n : fallback;
  }

  /**
   * Effective block size for row-lane packing when `clientHeight` is 0 (in-flow only).
   * @returns {number}
   */
  _fallbackPackHeightPx() {
    let h = this.clientHeight;
    if (h < 1) {
      h = this.offsetHeight;
    }
    if (h < 1) {
      const minH = getComputedStyle(this).minHeight;
      h = this._parsePx(minH, 240);
    }
    return Math.max(1, h);
  }

  /**
   * Effective inline-size cap for row-mode items when authors do not constrain them.
   * This keeps row masonry scrollable and readable instead of letting shrink-to-fit
   * cards expand to unbounded max-content widths.
   * @returns {number}
   */
  _fallbackRowItemMaxInlinePx() {
    const explicit = getComputedStyle(this)
      .getPropertyValue("--mgl-row-item-max-inline-size")
      .trim();
    if (explicit) {
      return Math.max(1, this._parsePx(explicit, 320));
    }

    let w = this.clientWidth;
    if (w < 1) {
      w = this.offsetWidth;
    }
    if (w < 1) {
      const computedWidth = getComputedStyle(this).width;
      w = this._parsePx(computedWidth, 320);
    }
    return Math.max(1, w);
  }

  _layoutFallback() {
    const nextMode = this.dataset.mglMode === "rows" ? "rows" : "columns";
    if (this._lastFallbackMode !== nextMode) {
      this._clearItemGeometry();
      this._lastFallbackMode = nextMode;
    }

    if (nextMode === "rows") {
      this._layoutFallbackRows();
    } else {
      this._layoutFallbackColumns();
    }
  }

  _layoutFallbackColumns() {
    const items = this._items();
    if (items.length === 0) {
      this.style.setProperty("--mgl-fallback-min-height", "0px");
      this.style.minHeight = "0px";
      return;
    }

    this._clearPlacementForMeasurement(items);
    this.dataset.mglMeasuring = "true";

    /** @type {{ top: number, left: number, width: number, height?: number }[]} */
    let positions = [];
    try {
      const w = this.clientWidth;
      const cs = getComputedStyle(this);
      const gapStr = cs.getPropertyValue("--mgl-gap").trim() || "0px";
      const minColStr = cs.getPropertyValue("--mgl-min-column").trim() || "200px";
      const tolStr = cs.getPropertyValue("--mgl-flow-tolerance").trim() || "0px";
      const gap = this._parsePx(gapStr, 0);
      const minCol = this._parsePx(minColStr, 200);
      const flowTolerance = this._parsePx(tolStr, 0);
      const nCols = columnCountFromMinWidth(w, minCol, gap);
      const colWidth = Math.max(0, (w - gap * (nCols - 1)) / nCols);
      /** @type {import("./pretext-height.js").SharedPretextMetrics | null} */
      let sharedPretextMetrics = null;

      const layout = layoutGridLanes({
        orientation: "columns",
        trackCount: nCols,
        containerSize: w,
        gap,
        flowTolerance,
        items: items.map((el, index) => {
          if (!(el instanceof HTMLElement)) {
            return { index, size: 0 };
          }

          const styles = getComputedStyle(el);
          const placement = resolveGridAxisPlacement(
            el.style.gridColumnStart || styles.gridColumnStart,
            el.style.gridColumnEnd || styles.gridColumnEnd,
            nCols,
          );
          const itemWidth = placement.span * colWidth + gap * (placement.span - 1);

          if (
            this.getAttribute("text-metrics") === "pretext" &&
            isPretextTextCandidate(el) &&
            sharedPretextMetrics == null
          ) {
            sharedPretextMetrics = this._readSharedPretextMetrics(styles);
          }

          return {
            index,
            order: Number.parseFloat(styles.order) || 0,
            start: placement.start,
            span: placement.span,
            size: this._measureColumnItemHeight(el, itemWidth, sharedPretextMetrics),
          };
        }),
      });

      positions = layout.positions;
      const minHeight = `${Math.max(0, layout.extent)}px`;
      this.style.setProperty("--mgl-fallback-min-height", minHeight);
      this.style.minHeight = minHeight;
    } finally {
      delete this.dataset.mglMeasuring;
    }

    for (let idx = 0; idx < items.length; idx++) {
      const el = items[idx];
      if (!(el instanceof HTMLElement)) continue;
      const p = positions[idx];
      if (!p) continue;
      const authoredHeight = this._authorItemStyle(el, "height");
      this._applyManagedItemStyles(el, {
        position: "absolute",
        top: `${p.top}px`,
        left: `${p.left}px`,
        width: `${p.width}px`,
        height: authoredHeight,
        boxSizing: "border-box",
      });
    }
  }

  /**
   * Clears only inline placement from a prior layout pass. Does not strip
   * author width/height — those are needed for row/column measurement.
   * @param {Element[]} items
   */
  _clearPlacementForMeasurement(items) {
    for (const el of items) {
      if (!(el instanceof HTMLElement)) continue;
      this._restoreAuthorItemStyles(el);
    }
  }

  /**
   * @param {HTMLElement} el
   * @param {number} outerWidth
   * @param {import("./pretext-height.js").SharedPretextMetrics | null} sharedPretextMetrics
   */
  _measureColumnItemHeight(el, outerWidth, sharedPretextMetrics) {
    if (this.getAttribute("text-metrics") === "pretext" && isPretextTextCandidate(el)) {
      if (sharedPretextMetrics != null) {
        return estimateTextHeightFromMetrics(
          el.textContent?.trim() ?? "",
          outerWidth,
          sharedPretextMetrics,
          /** @type {{ _pretextKey?: string, _prepared?: unknown }} */ (el),
        );
      }
      return estimateTextElementHeightCached(el, outerWidth);
    }

    /* This fallback remains the escape hatch for mixed / rich content where nested DOM, replaced
     * elements, or author-driven layout details cannot be represented by Pretext's plain-text model. */
    const prevPos = el.style.position;
    const prevW = el.style.width;
    const prevBox = el.style.boxSizing;
    el.style.position = "relative";
    el.style.width = `${outerWidth}px`;
    el.style.boxSizing = "border-box";
    const h = el.offsetHeight;
    el.style.position = prevPos;
    el.style.width = prevW;
    el.style.boxSizing = prevBox;
    return h;
  }

  /**
   * Row-lane (brick) fallback: mirrors native `grid-template-rows` + grid-lanes inline flow.
   * Pretext height hints are not applied here — text measurement is width-for-height; lane height is fixed.
   */
  _layoutFallbackRows() {
    const items = this._items();
    if (items.length === 0) {
      this.style.setProperty("--mgl-fallback-min-width", "0px");
      this.style.minWidth = this._authorMinWidth ?? "";
      return;
    }

    this._clearPlacementForMeasurement(items);
    this.dataset.mglMeasuring = "true";

    /** @type {{ top: number, left: number, width: number, height?: number }[]} */
    let positions = [];
    try {
      const packH = this._fallbackPackHeightPx();
      const cs = getComputedStyle(this);
      const gapStr = cs.getPropertyValue("--mgl-gap").trim() || "0px";
      const minRowStr = cs.getPropertyValue("--mgl-min-row").trim() || "";
      const minColStr = cs.getPropertyValue("--mgl-min-column").trim() || "120px";
      const tolStr = cs.getPropertyValue("--mgl-flow-tolerance").trim() || "0px";
      const gap = this._parsePx(gapStr, 0);
      const minRow = this._parsePx(minRowStr || minColStr, 120);
      const flowTolerance = this._parsePx(tolStr, 0);
      const rowCountAttr = this.getAttribute("row-count");
      const parsedRowCount = rowCountAttr == null ? Number.NaN : Number.parseInt(rowCountAttr, 10);
      const nRows =
        Number.isFinite(parsedRowCount) && parsedRowCount > 0
          ? Math.max(1, Math.floor(parsedRowCount))
          : trackCountFromMinSize(packH, minRow, gap);
      const laneH = Math.max(0, (packH - gap * (nRows - 1)) / nRows);
      const maxInlineSize = this._fallbackRowItemMaxInlinePx();
      const layout = layoutGridLanes({
        orientation: "rows",
        trackCount: nRows,
        containerSize: packH,
        gap,
        flowTolerance,
        items: items.map((el, index) => {
          if (!(el instanceof HTMLElement)) {
            return { index, size: 0, crossSize: 0 };
          }

          const styles = getComputedStyle(el);
          const placement = resolveGridAxisPlacement(
            el.style.gridRowStart || styles.gridRowStart,
            el.style.gridRowEnd || styles.gridRowEnd,
            nRows,
          );
          const laneExtent = placement.span * laneH + gap * (placement.span - 1);
          const { width, height } = this._measureRowItemSize(el, laneExtent, maxInlineSize);
          return {
            index,
            order: Number.parseFloat(styles.order) || 0,
            start: placement.start,
            span: placement.span,
            size: width,
            crossSize: Math.min(height, laneExtent),
          };
        }),
      });

      positions = layout.positions;
      const minWidth = `${Math.max(0, layout.extent)}px`;
      this.style.setProperty("--mgl-fallback-min-width", minWidth);
      this.style.minWidth = this._authorMinWidth ?? "";
    } finally {
      delete this.dataset.mglMeasuring;
    }

    let i = 0;
    for (const el of items) {
      if (!(el instanceof HTMLElement)) continue;
      const p = positions[i++];
      if (!p) continue;
      this._applyManagedItemStyles(el, {
        position: "absolute",
        top: `${p.top}px`,
        left: `${p.left}px`,
        width: `${p.width}px`,
        height: p.height != null ? `${p.height}px` : "",
        boxSizing: "border-box",
      });
    }
  }

  /**
   * @param {HTMLElement} el
   * @param {number} laneExtent
   * @param {number} maxInlineSize
   */
  _measureRowItemSize(el, laneExtent, maxInlineSize) {
    const hasExplicitInlineWidth =
      el.style.width.trim() !== "" ||
      el.style.minWidth.trim() !== "" ||
      el.style.maxWidth.trim() !== "";
    const hasExplicitBlockSize =
      el.style.height.trim() !== "" ||
      el.style.minHeight.trim() !== "" ||
      el.style.maxHeight.trim() !== "";
    const prev = {
      position: el.style.position,
      display: el.style.display,
      width: el.style.width,
      minWidth: el.style.minWidth,
      maxWidth: el.style.maxWidth,
      height: el.style.height,
      minHeight: el.style.minHeight,
      maxHeight: el.style.maxHeight,
      boxSizing: el.style.boxSizing,
    };
    el.style.position = "relative";
    el.style.display = "inline-block";
    if (!hasExplicitInlineWidth) {
      el.style.width = "fit-content";
      el.style.minWidth = "0";
      el.style.maxWidth = `${Math.max(1, maxInlineSize)}px`;
    }
    if (!hasExplicitBlockSize) {
      el.style.height = "auto";
      el.style.minHeight = "0";
    }
    el.style.maxHeight = `${laneExtent}px`;
    el.style.boxSizing = "border-box";
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    el.style.position = prev.position;
    el.style.display = prev.display;
    el.style.width = prev.width;
    el.style.minWidth = prev.minWidth;
    el.style.maxWidth = prev.maxWidth;
    el.style.height = prev.height;
    el.style.minHeight = prev.minHeight;
    el.style.maxHeight = prev.maxHeight;
    el.style.boxSizing = prev.boxSizing;
    return { width, height };
  }

  /**
   * @param {CSSStyleDeclaration} sampleStyles
   */
  _readSharedPretextMetrics(sampleStyles) {
    const hostStyles = getComputedStyle(this);
    const font = hostStyles.getPropertyValue("--mgl-pretext-font").trim();
    const lineHeight = hostStyles.getPropertyValue("--mgl-pretext-line-height").trim();
    const inlineChrome = hostStyles.getPropertyValue("--mgl-pretext-inline-chrome").trim();
    const blockChrome = hostStyles.getPropertyValue("--mgl-pretext-block-chrome").trim();

    if (font || lineHeight || inlineChrome || blockChrome) {
      const fallback = createPretextMetricsFromStyles(sampleStyles);
      return {
        font: font || fallback.font,
        lineHeight: lineHeight
          ? this._parsePx(lineHeight, fallback.lineHeight)
          : fallback.lineHeight,
        inlineChrome: inlineChrome
          ? this._parsePx(inlineChrome, fallback.inlineChrome)
          : fallback.inlineChrome,
        blockChrome: blockChrome
          ? this._parsePx(blockChrome, fallback.blockChrome)
          : fallback.blockChrome,
      };
    }

    return createPretextMetricsFromStyles(sampleStyles);
  }

  /**
   * @param {HTMLElement} el
   */
  _rememberAuthorItemStyles(el) {
    if (this._authorItemStyles.has(el)) {
      return;
    }

    /** @type {Record<string, string>} */
    const snapshot = {};
    for (const prop of MANAGED_ITEM_STYLE_PROPS) {
      snapshot[prop] =
        /** @type {Record<string, string>} */ (/** @type {unknown} */ (el.style))[prop] ?? "";
    }
    this._authorItemStyles.set(el, snapshot);
  }

  /**
   * @param {HTMLElement} el
   */
  _restoreAuthorItemStyles(el) {
    this._syncAuthorItemStyleOverrides(el);
    this._rememberAuthorItemStyles(el);
    const snapshot = this._authorItemStyles.get(el);
    if (!snapshot) {
      return;
    }

    for (const prop of MANAGED_ITEM_STYLE_PROPS) {
      /** @type {Record<string, string>} */ (/** @type {unknown} */ (el.style))[prop] =
        snapshot[prop] ?? "";
    }
  }

  /**
   * @param {HTMLElement} el
   * @param {string} prop
   * @returns {string}
   */
  _authorItemStyle(el, prop) {
    this._rememberAuthorItemStyles(el);
    const snapshot = this._authorItemStyles.get(el);
    return snapshot?.[prop] ?? "";
  }

  /**
   * If user code changes width/height/position-related inline styles after a layout pass,
   * preserve those edits as the new authored baseline instead of restoring an older snapshot.
   *
   * @param {HTMLElement} el
   */
  _syncAuthorItemStyleOverrides(el) {
    this._rememberAuthorItemStyles(el);
    const snapshot = this._authorItemStyles.get(el);
    const lastManaged = this._lastManagedItemStyles.get(el);
    if (!snapshot || !lastManaged) {
      return;
    }

    for (const prop of MANAGED_ITEM_STYLE_PROPS) {
      const current =
        /** @type {Record<string, string>} */ (/** @type {unknown} */ (el.style))[prop] ?? "";
      if (current !== (lastManaged[prop] ?? "")) {
        snapshot[prop] = current;
      }
    }
  }

  /**
   * @param {HTMLElement} el
   * @param {Record<string, string>} next
   */
  _applyManagedItemStyles(el, next) {
    this._rememberAuthorItemStyles(el);
    const lastManaged = { ...this._lastManagedItemStyles.get(el) };
    for (const [prop, value] of Object.entries(next)) {
      /** @type {Record<string, string>} */ (/** @type {unknown} */ (el.style))[prop] = value;
      lastManaged[prop] = value;
    }
    this._lastManagedItemStyles.set(el, lastManaged);
  }
}
