import { expect, test } from "@playwright/test";

const demos = [
  {
    label: "images demo",
    path: "/demos/images.html",
    ready: "items",
    statusPattern: null,
  },
  {
    label: "Bluesky cards demo",
    path: "/demos/bluesky-cards.html",
    ready: "status",
    statusPattern: /posts|Failed to load feed\./,
  },
  {
    label: "mixed demo",
    path: "/demos/mixed.html",
    ready: "items",
    statusPattern: null,
  },
] as const;

for (const { label, path, ready, statusPattern } of demos) {
  test(`${label} keeps the footer below the masonry host`, async ({ page }) => {
    await page.goto(path);

    if (ready === "status" && statusPattern) {
      const status = page.locator("#status");
      await expect(status).toContainText(statusPattern, { timeout: 15000 });
    } else {
      await expect(page.locator("masonry-grid-lanes > *").first()).toBeVisible({ timeout: 15000 });
    }

    const geometry = await page.evaluate(() => {
      const host = document.querySelector("masonry-grid-lanes");
      const footer = document.querySelector(".demo-foot");
      if (!(host instanceof HTMLElement) || !(footer instanceof HTMLElement)) {
        throw new Error("Expected demo host and footer");
      }

      const hostBox = host.getBoundingClientRect();
      const footerBox = footer.getBoundingClientRect();
      return {
        hostBottom: hostBox.bottom,
        footerTop: footerBox.top,
        hostMinHeight: getComputedStyle(host).minHeight,
      };
    });

    expect(Number.parseFloat(geometry.hostMinHeight)).toBeGreaterThan(0);
    expect(geometry.footerTop).toBeGreaterThanOrEqual(geometry.hostBottom);
  });
}
