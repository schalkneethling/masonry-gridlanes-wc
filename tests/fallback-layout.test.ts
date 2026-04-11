import { describe, expect, test } from "vite-plus/test";
import {
  columnCountFromMinWidth,
  layoutShortestColumn,
  layoutShortestRow,
  trackCountFromMinSize,
} from "../src/fallback-layout.js";

describe("layoutShortestColumn", () => {
  test("returns empty layout for no items", () => {
    expect(layoutShortestColumn(3, 300, 8, [])).toEqual({
      positions: [],
      totalHeight: 0,
    });
  });

  test("places one item at top of first column", () => {
    const { positions, totalHeight } = layoutShortestColumn(2, 200, 0, [40]);
    expect(positions).toEqual([{ top: 0, left: 0, width: 100 }]);
    expect(totalHeight).toBe(40);
  });

  test("uses shortest column for next item", () => {
    const heights = [50, 30, 40];
    const { positions, totalHeight } = layoutShortestColumn(2, 200, 10, heights);
    expect(positions[0]).toEqual({ top: 0, left: 0, width: 95 });
    expect(positions[1]).toEqual({ top: 0, left: 105, width: 95 });
    expect(positions[2].top).toBe(40);
    expect(totalHeight).toBeGreaterThan(0);
  });

  test("accounts for gap between items in column height", () => {
    const { positions, totalHeight } = layoutShortestColumn(1, 100, 8, [10, 10]);
    expect(positions[0].top).toBe(0);
    expect(positions[1].top).toBe(18);
    expect(totalHeight).toBe(18 + 10);
  });
});

describe("trackCountFromMinSize / columnCountFromMinWidth", () => {
  test("returns at least 1", () => {
    expect(trackCountFromMinSize(50, 200, 8)).toBe(1);
    expect(columnCountFromMinWidth(50, 200, 8)).toBe(1);
  });

  test("fits multiple tracks when size allows", () => {
    expect(trackCountFromMinSize(500, 100, 16)).toBe(4);
    expect(columnCountFromMinWidth(500, 100, 16)).toBe(4);
  });
});

describe("layoutShortestRow", () => {
  test("returns empty result for no items", () => {
    expect(layoutShortestRow(2, 100, 4, [])).toEqual({
      positions: [],
      totalWidth: 0,
      laneHeight: 0,
    });
  });

  test("packs into shortest row lane by inline extent", () => {
    const items = [
      { width: 40, height: 20 },
      { width: 30, height: 20 },
      { width: 50, height: 20 },
    ];
    const { positions, totalWidth, laneHeight } = layoutShortestRow(2, 100, 10, items);
    expect(laneHeight).toBe(45);
    expect(positions[0]).toMatchObject({ top: 0, left: 0, width: 40 });
    expect(positions[1]).toMatchObject({ top: 55, left: 0, width: 30 });
    expect(positions[2]).toMatchObject({ top: 55, left: 40, width: 50 });
    expect(totalWidth).toBe(90);
  });

  test("clamps item height to lane height", () => {
    const { positions, laneHeight } = layoutShortestRow(1, 80, 0, [{ width: 10, height: 200 }]);
    expect(laneHeight).toBe(80);
    expect(positions[0].height).toBe(80);
  });
});
