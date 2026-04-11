// @ts-check

import { MasonryGridLanes } from "./masonry-grid-lanes.js";

export { adoptMasonryGridLanesStyles } from "./adopt-default-styles.js";
export {
  columnCountFromMinWidth,
  layoutGridLanes,
  layoutShortestColumn,
  layoutShortestRow,
  resolveGridAxisPlacement,
  trackCountFromMinSize,
} from "./fallback-layout.js";
export { MasonryGridLanes } from "./masonry-grid-lanes.js";
export {
  createPretextMetricsFromStyles,
  estimateTextBlockHeight,
  estimateTextBlockHeightCached,
  estimateTextElementHeightCached,
  estimateTextHeightFromMetrics,
  isPretextTextCandidate,
} from "./pretext-height.js";
export { resetSupportsGridLanesCache, supportsGridLanes } from "./supports-grid-lanes.js";
export { layoutPretextMasonry, sampleTextMetricsFromElement } from "./headless.js";

/**
 * Register `<masonry-grid-lanes>` once (safe for duplicate imports / HMR).
 */
export function defineMasonryGridLanes() {
  if (!customElements.get("masonry-grid-lanes")) {
    customElements.define("masonry-grid-lanes", MasonryGridLanes);
  }
}
