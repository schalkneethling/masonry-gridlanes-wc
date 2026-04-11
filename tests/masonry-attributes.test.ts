import { beforeEach, describe, expect, test } from "vite-plus/test";
import { defineMasonryGridLanes } from "../src/index.js";

describe("masonry-grid-lanes attribute reflection", () => {
  beforeEach(() => {
    defineMasonryGridLanes();
    document.body.replaceChildren();
  });

  test("maps gap to --mgl-gap", () => {
    const el = document.createElement("masonry-grid-lanes");
    document.body.appendChild(el);
    el.setAttribute("gap", "12");
    expect(el.style.getPropertyValue("--mgl-gap").trim()).toBe("12px");
  });

  test("maps min-column-width to --mgl-min-column", () => {
    const el = document.createElement("masonry-grid-lanes");
    document.body.appendChild(el);
    el.setAttribute("min-column-width", "180");
    expect(el.style.getPropertyValue("--mgl-min-column").trim()).toBe("180px");
  });

  test("maps min-row-height to --mgl-min-row", () => {
    const el = document.createElement("masonry-grid-lanes");
    document.body.appendChild(el);
    el.setAttribute("min-row-height", "64");
    expect(el.style.getPropertyValue("--mgl-min-row").trim()).toBe("64px");
  });

  test("maps row-count to --mgl-row-count", () => {
    const el = document.createElement("masonry-grid-lanes");
    document.body.appendChild(el);
    el.setAttribute("row-count", "3");
    expect(el.style.getPropertyValue("--mgl-row-count").trim()).toBe("3");
  });

  test("maps flow-tolerance to --mgl-flow-tolerance", () => {
    const el = document.createElement("masonry-grid-lanes");
    document.body.appendChild(el);
    el.setAttribute("flow-tolerance", "0.5em");
    expect(el.style.getPropertyValue("--mgl-flow-tolerance").trim()).toBe("0.5em");
  });

  test("maps mode rows to data-mgl-mode", () => {
    const el = document.createElement("masonry-grid-lanes");
    document.body.appendChild(el);
    el.setAttribute("mode", "rows");
    expect(el.dataset.mglMode).toBe("rows");
  });
});
