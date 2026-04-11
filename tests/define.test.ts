import { describe, expect, test } from "vite-plus/test";
import { defineMasonryGridLanes, MasonryGridLanes } from "../src/index.js";

describe("defineMasonryGridLanes", () => {
  test("registers masonry-grid-lanes once", () => {
    defineMasonryGridLanes();
    expect(customElements.get("masonry-grid-lanes")).toBe(MasonryGridLanes);
  });

  test("calling define twice does not throw", () => {
    expect(() => {
      defineMasonryGridLanes();
      defineMasonryGridLanes();
    }).not.toThrow();
  });
});
