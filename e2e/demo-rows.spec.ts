import { expect, test } from "@playwright/test";

test("row demo stays contained and exposes horizontal scrolling on the masonry host", async ({
  page,
}) => {
  await page.setViewportSize({ width: 700, height: 900 });
  await page.goto("/demos/rows.html");

  const host = page.locator("masonry-grid-lanes");
  const footer = page.locator("footer");

  await expect(host).toHaveAttribute("mode", "rows");
  await expect(host).toHaveAttribute("row-count", "3");
  await expect(host.locator(":scope > *").first()).toBeVisible({ timeout: 15000 });

  const pageWidths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    body: document.documentElement.scrollWidth,
  }));
  expect(pageWidths.body).toBeLessThanOrEqual(pageWidths.viewport + 4);

  const hostMetrics = await host.evaluate((el) => ({
    clientWidth: el.clientWidth,
    scrollWidth: el.scrollWidth,
  }));
  expect(hostMetrics.scrollWidth).toBeGreaterThan(hostMetrics.clientWidth);

  const hostBox = await host.boundingBox();
  const footerBox = await footer.boundingBox();
  expect((footerBox?.y ?? 0) + 1).toBeGreaterThan((hostBox?.y ?? 0) + (hostBox?.height ?? 0));
});
