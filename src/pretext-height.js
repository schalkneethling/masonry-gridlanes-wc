// @ts-check

import { layout, prepare } from "@chenglou/pretext";

/**
 * @typedef {ReturnType<typeof prepare>} PreparedText
 * @typedef {{
 *   font: string,
 *   lineHeight: number,
 *   inlineChrome: number,
 *   blockChrome: number,
 * }} SharedPretextMetrics
 * @typedef {HTMLElement & {
 *   _pretextKey?: string,
 *   _prepared?: PreparedText,
 * }} PretextCacheElement
 */

/**
 * Pretext only needs a numeric pixel value, so we treat invalid / keyword values as `fallback`.
 *
 * @param {string} value
 * @param {number} fallback
 * @returns {number}
 */
function parsePx(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Canvas font strings do not include `line-height`, so we rebuild the shorthand from the pieces
 * that matter to Pretext. This keeps the font description aligned with the element's real styles
 * without depending on `getComputedStyle(el).font`, which is not consistently populated.
 *
 * @param {CSSStyleDeclaration} styles
 * @returns {string}
 */
function toCanvasFontShorthand(styles) {
  const parts = [];
  if (styles.fontStyle && styles.fontStyle !== "normal") parts.push(styles.fontStyle);
  if (styles.fontVariant && styles.fontVariant !== "normal") parts.push(styles.fontVariant);
  if (styles.fontWeight && styles.fontWeight !== "400" && styles.fontWeight !== "normal") {
    parts.push(styles.fontWeight);
  }
  if (styles.fontStretch && styles.fontStretch !== "normal" && styles.fontStretch !== "100%") {
    parts.push(styles.fontStretch);
  }
  parts.push(styles.fontSize || "16px");
  parts.push(styles.fontFamily || "sans-serif");
  return parts.join(" ");
}

/**
 * `line-height: normal` does not give us a pixel number, so we fall back to the browser-default
 * heuristic of roughly `1.2 * font-size`. The exact value is less important than staying stable
 * between layout passes once the font has loaded.
 *
 * @param {CSSStyleDeclaration} styles
 * @returns {number}
 */
function lineHeightPx(styles) {
  if (styles.lineHeight && styles.lineHeight !== "normal") {
    return parsePx(styles.lineHeight, parsePx(styles.fontSize, 16) * 1.2);
  }
  return parsePx(styles.fontSize, 16) * 1.2;
}

/**
 * @param {CSSStyleDeclaration} styles
 * @returns {SharedPretextMetrics}
 */
export function createPretextMetricsFromStyles(styles) {
  return {
    font: toCanvasFontShorthand(styles),
    lineHeight: lineHeightPx(styles),
    inlineChrome:
      parsePx(styles.paddingLeft) +
      parsePx(styles.paddingRight) +
      parsePx(styles.borderLeftWidth) +
      parsePx(styles.borderRightWidth),
    blockChrome:
      parsePx(styles.paddingTop) +
      parsePx(styles.paddingBottom) +
      parsePx(styles.borderTopWidth) +
      parsePx(styles.borderBottomWidth),
  };
}

/**
 * Plain text cards are the sweet spot for Pretext. Once an element contains nested markup we fall
 * back to real DOM measurement, because the canvas layout model cannot account for rich children.
 *
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isPretextTextCandidate(element) {
  return element.childElementCount === 0 && element.textContent?.trim() !== "";
}

/**
 * Estimate block height for plain text at a given max width using Pretext (no DOM layout).
 * `font` must match the canvas font shorthand used by Pretext (see library docs).
 *
 * @param {string} text
 * @param {string} font e.g. `16px Inter`
 * @param {number} maxWidth px
 * @param {number} lineHeight px
 * @returns {number}
 */
export function estimateTextBlockHeight(text, font, maxWidth, lineHeight) {
  const prepared = prepare(text, font);
  const { height } = layout(prepared, maxWidth, lineHeight);
  return height;
}

/**
 * Cached variant: reuses {@link prepare} until text or font changes (per element).
 *
 * @param {{ text: string, font: string, lineHeight: number, maxWidth: number }} opts
 * @param {{ _pretextKey?: string, _prepared?: unknown }} cacheSlot plain object or element-backed store
 * @returns {number}
 */
export function estimateTextBlockHeightCached(opts, cacheSlot) {
  const key = `${opts.font}\0${opts.text}`;
  if (cacheSlot._pretextKey !== key) {
    cacheSlot._pretextKey = key;
    cacheSlot._prepared = prepare(opts.text, opts.font);
  }
  const { height } = layout(
    /** @type {PreparedText} */ (cacheSlot._prepared),
    opts.maxWidth,
    opts.lineHeight,
  );
  return height;
}

/**
 * @param {string} text
 * @param {number} outerWidth
 * @param {SharedPretextMetrics} metrics
 * @param {{ _pretextKey?: string, _prepared?: unknown }} cacheSlot
 * @param {typeof estimateTextBlockHeightCached} [heightEstimator]
 * @returns {number}
 */
export function estimateTextHeightFromMetrics(
  text,
  outerWidth,
  metrics,
  cacheSlot,
  heightEstimator = estimateTextBlockHeightCached,
) {
  if (text.trim() === "") {
    return 0;
  }

  const textWidth = Math.max(0, outerWidth - metrics.inlineChrome);
  const height = heightEstimator(
    {
      text,
      font: metrics.font,
      lineHeight: metrics.lineHeight,
      maxWidth: textWidth,
    },
    cacheSlot,
  );

  return height + metrics.blockChrome;
}

/**
 * Height estimator for text-only DOM elements. We still read computed styles once per element so
 * the canvas metrics stay in sync with author CSS, but we never ask layout for `offsetHeight`.
 * That is the key Pretext win: `prepare()` is cached, and layout becomes pure math on resize.
 *
 * @param {HTMLElement} element
 * @param {number} outerWidth width assigned by the masonry column, including padding / borders
 * @returns {number}
 */
export function estimateTextElementHeightCached(element, outerWidth) {
  const text = element.textContent?.trim() ?? "";
  if (text === "") {
    return 0;
  }

  const metrics = createPretextMetricsFromStyles(getComputedStyle(element));
  return estimateTextHeightFromMetrics(
    text,
    outerWidth,
    metrics,
    /** @type {PretextCacheElement} */ (element),
  );
}
