import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { defineMasonryGridLanes } from "../src/index.js";

vi.mock("../src/supports-grid-lanes.js", () => ({
  supportsGridLanes: () => false,
  resetSupportsGridLanesCache: () => {},
}));

describe("MasonryGridLanes (fallback path)", () => {
  beforeEach(() => {
    defineMasonryGridLanes();
    document.body.replaceChildren();
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  test("adds fallback class when grid-lanes is not supported", async () => {
    const host = document.createElement("masonry-grid-lanes");
    host.style.display = "block";
    host.style.width = "400px";
    const child = document.createElement("div");
    child.style.height = "40px";
    child.textContent = "x";
    host.appendChild(child);
    document.body.appendChild(host);

    await new Promise<void>((r) => {
      requestAnimationFrame(() => r());
    });

    expect(host.classList.contains("masonry-grid-lanes--fallback")).toBe(true);
    expect(child.style.position).toBe("absolute");
    expect(child.style.width).not.toBe("");
  });

  test("uses Pretext metrics for text-only cards when opted in", async () => {
    const host = document.createElement("masonry-grid-lanes");
    host.style.display = "block";
    host.style.width = "420px";
    host.setAttribute("text-metrics", "pretext");

    const child = document.createElement("article");
    child.textContent = "A text-only card that should be measured without offsetHeight.";
    child.style.fontFamily = "Georgia, serif";
    child.style.fontSize = "16px";
    child.style.lineHeight = "24px";
    child.style.padding = "10px 12px";
    child.style.border = "1px solid transparent";

    Object.defineProperty(child, "offsetHeight", {
      configurable: true,
      get() {
        throw new Error("offsetHeight should not be used for Pretext text cards");
      },
    });

    host.appendChild(child);
    document.body.appendChild(host);

    await new Promise<void>((r) => {
      requestAnimationFrame(() => r());
    });

    expect(child.style.position).toBe("absolute");
    expect(child.style.width).not.toBe("");
  });

  test("honors order and grid-column span in fallback mode", async () => {
    const host = document.createElement("masonry-grid-lanes");
    host.style.display = "block";
    host.style.width = "430px";
    host.setAttribute("gap", "10");
    Object.defineProperty(host, "clientWidth", {
      configurable: true,
      get: () => 430,
    });

    const first = document.createElement("article");
    first.textContent = "span";
    first.style.gridColumnStart = "auto";
    first.style.gridColumnEnd = "span 2";
    first.style.height = "50px";

    const second = document.createElement("article");
    second.textContent = "ordered first";
    second.style.order = "-1";
    second.style.height = "30px";

    const third = document.createElement("article");
    third.textContent = "third";
    third.style.height = "30px";

    host.append(first, second, third);
    document.body.appendChild(host);

    await new Promise<void>((r) => {
      requestAnimationFrame(() => r());
    });

    expect(second.style.left).toBe("0px");
    expect(first.style.width).toBe("430px");
  });

  test("honors explicit row-count in row fallback mode", async () => {
    const host = document.createElement("masonry-grid-lanes");
    host.style.display = "block";
    host.style.width = "600px";
    host.style.height = "340px";
    host.setAttribute("mode", "rows");
    host.setAttribute("row-count", "3");
    host.setAttribute("gap", "10");

    Object.defineProperty(host, "clientWidth", {
      configurable: true,
      get: () => 600,
    });
    Object.defineProperty(host, "clientHeight", {
      configurable: true,
      get: () => 340,
    });

    for (const width of [160, 80, 80, 240, 80, 240, 80, 160, 240]) {
      const child = document.createElement("div");
      child.style.width = `${width}px`;
      child.style.height = "40px";
      host.appendChild(child);
    }

    document.body.appendChild(host);

    await new Promise<void>((r) => {
      requestAnimationFrame(() => r());
    });

    const tops = Array.from(host.children, (child) =>
      Math.round(Number.parseFloat((child as HTMLElement).style.top)),
    );
    const uniqueTops = [...new Set(tops)].sort((a, b) => a - b);
    expect(uniqueTops).toHaveLength(3);
    expect(uniqueTops[0]).toBe(0);
  });
});
