// @ts-check

/**
 * Entry that re-exports only Pretext helpers (no custom element, no layout math).
 * Import `@schalkneethling/masonry-gridlanes-wc/pretext` when you need text metrics without
 * pulling in the element.
 */

export {
  createPretextMetricsFromStyles,
  estimateTextBlockHeight,
  estimateTextBlockHeightCached,
  estimateTextElementHeightCached,
  estimateTextHeightFromMetrics,
  isPretextTextCandidate,
} from "./pretext-height.js";
