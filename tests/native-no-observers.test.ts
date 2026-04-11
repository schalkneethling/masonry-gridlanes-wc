import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";

vi.mock("../src/supports-grid-lanes.js", () => ({
  supportsGridLanes: () => true,
  resetSupportsGridLanesCache: () => {},
}));

const ResizeObserverSpy = vi.fn(function ResizeObserverMock(
  this: ResizeObserver,
  _callback: ResizeObserverCallback,
) {
  this.disconnect = () => {};
  this.observe = () => {};
  this.unobserve = () => {};
});
vi.stubGlobal("ResizeObserver", ResizeObserverSpy);

const { defineMasonryGridLanes } = await import("../src/index.js");

describe("native grid-lanes path", () => {
  beforeEach(() => {
    defineMasonryGridLanes();
    document.body.replaceChildren();
    ResizeObserverSpy.mockClear();
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  test("does not install ResizeObserver when grid-lanes is supported", async () => {
    const el = document.createElement("masonry-grid-lanes");
    el.style.display = "block";
    document.body.appendChild(el);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    expect(ResizeObserverSpy).not.toHaveBeenCalled();
  });
});
