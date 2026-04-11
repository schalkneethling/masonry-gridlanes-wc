import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    __MGL_ROW_FALLBACK_READY?: boolean;
  }
}

const rowFallbackFixtures = [
  { label: "declarative HTML", path: "/e2e/fixtures/row-fallback-declarative.html" },
  { label: "imperative JS", path: "/e2e/fixtures/row-fallback-imperative.html" },
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const orig = CSS.supports.bind(CSS);
    Object.defineProperty(CSS, "supports", {
      configurable: true,
      value: (...args: string[]) => {
        if (args.join(" ").includes("grid-lanes")) {
          return false;
        }
        return Reflect.apply(orig, CSS, args) as boolean;
      },
    });
  });
});

for (const { label, path } of rowFallbackFixtures) {
  test(`row fallback (${label}) stays contained while exposing horizontal overflow`, async ({
    page,
  }) => {
    await page.goto(path);
    await page.waitForFunction(() => window.__MGL_ROW_FALLBACK_READY === true);

    const host = page.locator("masonry-grid-lanes");
    await expect(host).toHaveClass(/masonry-grid-lanes--fallback/);

    const minWidth = await host.evaluate((el) =>
      el.style.getPropertyValue("--mgl-fallback-min-width").trim(),
    );
    expect(minWidth).not.toBe("0px");
    const packedWidth = Number.parseFloat(minWidth);
    expect(packedWidth).toBeGreaterThan(0);

    const hostBox = await host.boundingBox();
    expect(hostBox?.width ?? 0).toBeGreaterThan(0);
    expect(hostBox?.width ?? 0).toBeLessThanOrEqual(410);

    const scrollMetrics = await host.evaluate((el) => ({
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
    }));
    if (packedWidth > scrollMetrics.clientWidth) {
      expect(scrollMetrics.scrollWidth).toBeGreaterThan(scrollMetrics.clientWidth);
    } else {
      expect(scrollMetrics.scrollWidth).toBeGreaterThanOrEqual(packedWidth);
    }

    await expect(host.locator(":scope > div").nth(0)).toHaveCSS("position", "absolute");
    await expect(host.locator(":scope > div").nth(1)).toHaveCSS("position", "absolute");
  });
}
