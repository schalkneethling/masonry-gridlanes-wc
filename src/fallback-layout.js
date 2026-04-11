// @ts-check

import { layoutGridLanes as layoutGridLanesCore } from "./grid-lanes-layout.js";

/**
 * @typedef {{ top: number, left: number, width: number, height?: number }} PlacedItem
 * @typedef {{ positions: PlacedItem[], totalHeight: number }} ColumnPackResult
 * @typedef {{ positions: PlacedItem[], totalWidth: number, laneHeight: number }} RowPackResult
 */

/**
 * Greedy shortest-column masonry layout for equal-width columns (waterfall / grid-template-columns axis).
 *
 * @param {number} columnCount
 * @param {number} containerWidth
 * @param {number} gap gap between columns and between stacked items (px)
 * @param {number[]} itemHeights
 * @returns {ColumnPackResult}
 */
export function layoutShortestColumn(columnCount, containerWidth, gap, itemHeights) {
  const layout = layoutGridLanesCore({
    orientation: "columns",
    trackCount: columnCount,
    containerSize: containerWidth,
    gap,
    items: itemHeights.map((size, index) => ({ index, size })),
  });
  return {
    positions: layout.positions.map((position) => ({
      top: position.top,
      left: position.left,
      width: position.width,
    })),
    totalHeight: layout.extent,
  };
}

/**
 * How many fixed tracks fit on an axis when each track is at least `minTrackSize` and tracks are separated by `gap`.
 * Used for column count (width axis) or row lane count (height axis).
 *
 * @param {number} containerSize
 * @param {number} minTrackSize
 * @param {number} gap
 * @returns {number}
 */
export function trackCountFromMinSize(containerSize, minTrackSize, gap) {
  const minW = Math.max(1, minTrackSize);
  const g = Math.max(0, gap);
  const n = Math.floor((containerSize + g) / (minW + g));
  return Math.max(1, n);
}

/**
 * @param {number} trackCount
 * @param {number} containerSize
 * @param {number} gap
 * @returns {number}
 */
export function trackSizeFromContainer(trackCount, containerSize, gap) {
  const n = Math.max(1, Math.floor(trackCount));
  const g = Math.max(0, gap);
  const usable = Math.max(0, containerSize - g * (n - 1));
  return usable / n;
}

/**
 * @deprecated Use {@link trackCountFromMinSize} (same formula).
 * @param {number} containerWidth
 * @param {number} minColumnWidth
 * @param {number} gap
 * @returns {number}
 */
export function columnCountFromMinWidth(containerWidth, minColumnWidth, gap) {
  return trackCountFromMinSize(containerWidth, minColumnWidth, gap);
}

/**
 * Greedy shortest-row packing for horizontal lanes (brick layout / `grid-template-rows` masonry axis).
 * Each lane has uniform block size `laneHeight`; items keep measured widths; height is clamped to the lane.
 *
 * @param {number} rowLaneCount
 * @param {number} containerHeight
 * @param {number} gap between lanes and between items in the inline direction (px)
 * @param {{ width: number, height: number }[]} itemSizes measured intrinsic sizes
 * @returns {RowPackResult}
 */
export function layoutShortestRow(rowLaneCount, containerHeight, gap, itemSizes) {
  if (itemSizes.length === 0) {
    return { positions: [], totalWidth: 0, laneHeight: 0 };
  }
  const laneHeight = trackSizeFromContainer(rowLaneCount, containerHeight, gap);
  const layout = layoutGridLanesCore({
    orientation: "rows",
    trackCount: rowLaneCount,
    containerSize: containerHeight,
    gap,
    items: itemSizes.map((item, index) => ({
      index,
      size: Math.max(0, item.width),
      crossSize: Math.min(Math.max(0, item.height), laneHeight),
    })),
  });
  return {
    positions: layout.positions.map((position) => ({
      top: position.top,
      left: position.left,
      width: position.width,
      height: position.height,
    })),
    totalWidth: layout.extent,
    laneHeight,
  };
}

export { layoutGridLanes } from "./grid-lanes-layout.js";
export { resolveGridAxisPlacement } from "./grid-lanes-layout.js";
