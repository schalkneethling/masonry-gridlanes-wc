import { describe, expect, test } from "vite-plus/test";
import { layoutGridLanes, resolveGridAxisPlacement } from "../src/fallback-layout.js";

describe("resolveGridAxisPlacement", () => {
  test("resolves spans and positive line numbers", () => {
    expect(resolveGridAxisPlacement("2", "span 2", 5)).toEqual({ start: 1, span: 2 });
  });

  test("resolves negative grid lines", () => {
    expect(resolveGridAxisPlacement("-3", "-1", 5)).toEqual({ start: 3, span: 2 });
  });
});

describe("layoutGridLanes", () => {
  test("keeps near-tie items in forward reading order when flowTolerance is set", () => {
    const noTolerance = layoutGridLanes({
      orientation: "columns",
      trackCount: 2,
      containerSize: 210,
      gap: 10,
      flowTolerance: 0,
      items: [
        { index: 0, size: 100 },
        { index: 1, size: 95 },
        { index: 2, size: 20 },
      ],
    });

    const tolerant = layoutGridLanes({
      orientation: "columns",
      trackCount: 2,
      containerSize: 210,
      gap: 10,
      flowTolerance: 6,
      items: [
        { index: 0, size: 100 },
        { index: 1, size: 95 },
        { index: 2, size: 20 },
      ],
    });

    expect(noTolerance.positions[2]?.left).toBe(110);
    expect(tolerant.positions[2]?.left).toBe(0);
  });

  test("supports explicit spans and placement in column mode", () => {
    const layout = layoutGridLanes({
      orientation: "columns",
      trackCount: 4,
      containerSize: 430,
      gap: 10,
      items: [
        { index: 0, size: 50, start: 0, span: 2 },
        { index: 1, size: 40 },
        { index: 2, size: 40 },
      ],
    });

    expect(layout.positions[0]).toMatchObject({ left: 0, width: 210, span: 2 });
    expect(layout.positions[1]).toMatchObject({ left: 220 });
    expect(layout.positions[2]).toMatchObject({ left: 330 });
  });

  test("uses order before source index", () => {
    const layout = layoutGridLanes({
      orientation: "columns",
      trackCount: 2,
      containerSize: 210,
      gap: 10,
      items: [
        { index: 0, size: 100, order: 1 },
        { index: 1, size: 40, order: -1 },
      ],
    });

    expect(layout.positions[1]?.left).toBe(0);
    expect(layout.positions[0]?.left).toBe(110);
  });

  test("supports explicit placement in row mode", () => {
    const layout = layoutGridLanes({
      orientation: "rows",
      trackCount: 3,
      containerSize: 130,
      gap: 10,
      items: [
        { index: 0, size: 80, crossSize: 80, start: 1, span: 2 },
        { index: 1, size: 30, crossSize: 30 },
      ],
    });

    expect(layout.positions[0]?.top).toBeCloseTo(46.67, 1);
    expect(layout.positions[0]?.height).toBe(80);
    expect(layout.positions[1]?.top).toBe(0);
  });
});
