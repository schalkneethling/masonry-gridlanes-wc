import { describe, expect, test } from "vite-plus/test";
import {
  createPretextMetricsFromStyles,
  estimateTextBlockHeight,
  estimateTextBlockHeightCached,
  estimateTextElementHeightCached,
  estimateTextHeightFromMetrics,
  isPretextTextCandidate,
} from "../src/pretext-height.js";

describe("estimateTextBlockHeight", () => {
  test("returns positive height for short Latin text", () => {
    const h = estimateTextBlockHeight("Hello world", "16px sans-serif", 200, 20);
    expect(h).toBeGreaterThan(0);
    expect(h).toBeLessThanOrEqual(40);
  });
});

describe("estimateTextBlockHeightCached", () => {
  test("reuses prepare when text and font unchanged", () => {
    const slot = {};
    const a = estimateTextBlockHeightCached(
      { text: "alpha", font: "14px sans-serif", lineHeight: 18, maxWidth: 100 },
      slot,
    );
    const b = estimateTextBlockHeightCached(
      { text: "alpha", font: "14px sans-serif", lineHeight: 18, maxWidth: 120 },
      slot,
    );
    expect(b).toBeGreaterThanOrEqual(a);
  });
});

describe("estimateTextElementHeightCached", () => {
  test("accounts for card chrome around the Pretext text block", () => {
    const el = document.createElement("article");
    el.textContent = "A short text card that should wrap onto multiple lines.";
    el.style.fontFamily = "Georgia, serif";
    el.style.fontSize = "16px";
    el.style.lineHeight = "24px";
    el.style.padding = "10px 12px";
    el.style.border = "2px solid transparent";
    document.body.appendChild(el);

    const wide = estimateTextElementHeightCached(el, 240);
    const narrow = estimateTextElementHeightCached(el, 160);

    expect(wide).toBeGreaterThan(28);
    expect(narrow).toBeGreaterThanOrEqual(wide);
  });
});

describe("estimateTextHeightFromMetrics", () => {
  test("reuses shared metrics without rereading per-item styles", () => {
    const el = document.createElement("article");
    el.textContent = "Shared metrics should work for many text cards.";
    el.style.fontFamily = "Georgia, serif";
    el.style.fontSize = "16px";
    el.style.lineHeight = "24px";
    el.style.padding = "10px 12px";
    el.style.border = "2px solid transparent";
    document.body.appendChild(el);

    const metrics = createPretextMetricsFromStyles(getComputedStyle(el));
    const cache = {};
    const wide = estimateTextHeightFromMetrics(el.textContent ?? "", 260, metrics, cache);
    const narrow = estimateTextHeightFromMetrics(el.textContent ?? "", 180, metrics, cache);

    expect(wide).toBeGreaterThan(28);
    expect(narrow).toBeGreaterThanOrEqual(wide);
  });
});

describe("isPretextTextCandidate", () => {
  test("accepts plain text nodes and rejects rich markup", () => {
    const plain = document.createElement("article");
    plain.textContent = "Plain text only";

    const rich = document.createElement("article");
    rich.innerHTML = "<strong>Rich</strong> text";

    expect(isPretextTextCandidate(plain)).toBe(true);
    expect(isPretextTextCandidate(rich)).toBe(false);
  });
});
