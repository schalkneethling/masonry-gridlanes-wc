import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { resetSupportsGridLanesCache, supportsGridLanes } from "../src/supports-grid-lanes.js";

describe("supportsGridLanes", () => {
  afterEach(() => {
    resetSupportsGridLanesCache();
    vi.unstubAllGlobals();
  });

  test("returns false when CSS is missing", () => {
    vi.stubGlobal("CSS", undefined);
    expect(supportsGridLanes()).toBe(false);
  });

  test("caches result", () => {
    const spy = vi.fn().mockReturnValue(true);
    vi.stubGlobal("CSS", { supports: spy });
    expect(supportsGridLanes()).toBe(true);
    expect(supportsGridLanes()).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
