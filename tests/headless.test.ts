import { describe, expect, test } from "vite-plus/test";
import { layoutPretextMasonry, sampleTextMetricsFromElement } from "../src/headless.js";

describe("layoutPretextMasonry", () => {
  test("returns stable positions and total height for text cards", () => {
    const probe = document.createElement("article");
    probe.textContent = "Probe";
    probe.style.fontFamily = "Georgia, serif";
    probe.style.fontSize = "16px";
    probe.style.lineHeight = "24px";
    probe.style.padding = "8px 12px";
    probe.style.border = "1px solid transparent";
    document.body.appendChild(probe);

    const metrics = sampleTextMetricsFromElement(probe);
    const items = [
      { text: "Short card", cache: {} },
      { text: "A much longer text card that should wrap onto multiple lines.", cache: {} },
      { text: "Third card", cache: {} },
    ];

    const layout = layoutPretextMasonry({
      containerWidth: 420,
      minColumnWidth: 180,
      gap: 12,
      metrics,
      items,
    });

    expect(layout.trackCount).toBe(2);
    expect(layout.positions).toHaveLength(3);
    expect(layout.totalHeight).toBeGreaterThan(0);
    expect(layout.positions[0]?.width).toBeGreaterThan(0);
  });
});
