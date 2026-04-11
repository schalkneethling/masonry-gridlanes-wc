// @ts-check

import { layoutGridLanes, trackSizeFromContainer } from "./fallback-layout.js";
import { estimateTextBlockHeightCached, estimateTextHeightFromMetrics } from "./pretext-height.js";

/**
 * @typedef {{
 *   text: string,
 *   cache?: { _pretextKey?: string, _prepared?: unknown },
 *   order?: number,
 *   span?: number,
 *   start?: number | null,
 * }} HeadlessTextItem
 * @typedef {{
 *   font: string,
 *   lineHeight: number,
 *   inlineChrome: number,
 *   blockChrome: number,
 * }} SharedPretextMetrics
 * @typedef {{
 *   top: number,
 *   left: number,
 *   width: number,
 *   track: number,
 *   span: number,
 *   index: number,
 *   height: number,
 * }} HeadlessPosition
 * @typedef {{
 *   orientation: "columns",
 *   trackCount: number,
 *   trackSize: number,
 *   extent: number,
 *   positions: HeadlessPosition[],
 *   columnWidth: number,
 *   totalHeight: number,
 * }} HeadlessMasonryLayout
 */

/**
 * @param {Element} element
 * @returns {SharedPretextMetrics}
 */
export function sampleTextMetricsFromElement(element) {
  const styles = getComputedStyle(element);
  return {
    font: [
      styles.fontStyle !== "normal" ? styles.fontStyle : "",
      styles.fontVariant !== "normal" ? styles.fontVariant : "",
      styles.fontWeight !== "normal" && styles.fontWeight !== "400" ? styles.fontWeight : "",
      styles.fontStretch !== "normal" && styles.fontStretch !== "100%" ? styles.fontStretch : "",
      styles.fontSize || "16px",
      styles.fontFamily || "sans-serif",
    ]
      .filter(Boolean)
      .join(" "),
    lineHeight:
      Number.parseFloat(styles.lineHeight) ||
      Number.parseFloat(styles.fontSize || "16") * 1.2 ||
      19.2,
    inlineChrome:
      Number.parseFloat(styles.paddingLeft) +
      Number.parseFloat(styles.paddingRight) +
      Number.parseFloat(styles.borderLeftWidth) +
      Number.parseFloat(styles.borderRightWidth),
    blockChrome:
      Number.parseFloat(styles.paddingTop) +
      Number.parseFloat(styles.paddingBottom) +
      Number.parseFloat(styles.borderTopWidth) +
      Number.parseFloat(styles.borderBottomWidth),
  };
}

/**
 * Headless text-card masonry layout for large datasets. The hot path is pure math:
 * Pretext caches the prepared text, and the shared card metrics are reused across
 * every resize without mounting every card in the DOM.
 *
 * @param {{
 *   containerWidth: number,
 *   minColumnWidth: number,
 *   gap?: number,
 *   flowTolerance?: number,
 *   metrics: SharedPretextMetrics,
 *   items: HeadlessTextItem[],
 * }} options
 * @returns {HeadlessMasonryLayout}
 */
export function layoutPretextMasonry(options) {
  const gap = Math.max(0, options.gap ?? 0);
  const minColumnWidth = Math.max(1, options.minColumnWidth);
  const trackCount = Math.max(
    1,
    Math.floor((Math.max(0, options.containerWidth) + gap) / (minColumnWidth + gap)),
  );
  const columnWidth = trackSizeFromContainer(trackCount, options.containerWidth, gap);
  const heights = options.items.map((item) => {
    const span = Math.max(1, Math.floor(item.span ?? 1));
    const outerWidth = span * columnWidth + gap * (span - 1);
    const cache = item.cache ?? {};
    return estimateTextHeightFromMetrics(
      item.text,
      outerWidth,
      options.metrics,
      cache,
      estimateTextBlockHeightCached,
    );
  });

  const layout = layoutGridLanes({
    orientation: "columns",
    trackCount,
    containerSize: options.containerWidth,
    gap,
    flowTolerance: options.flowTolerance ?? 0,
    items: options.items.map((item, index) => {
      return {
        index,
        order: item.order ?? 0,
        start: item.start ?? null,
        span: Math.max(1, Math.floor(item.span ?? 1)),
        size: heights[index] ?? 0,
      };
    }),
  });

  return /** @type {HeadlessMasonryLayout} */ ({
    ...layout,
    positions: layout.positions.map((position, index) => ({
      ...position,
      height: heights[index] ?? 0,
    })),
    columnWidth,
    totalHeight: layout.extent,
  });
}
