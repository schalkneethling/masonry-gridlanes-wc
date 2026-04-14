import { expect, test } from "@playwright/test";

test("reference switcher reproduces fixed-row horizontal masonry with row-count", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto("/demos/reference-switch.html");

  const grid = page.locator("#switcher-grid");
  const shell = page.locator(".demo-grid-shell");
  await expect(page.locator("#runtime-notice")).toHaveAttribute("data-runtime-layout", "fallback");
  await expect(grid.locator(":scope > *")).toHaveCount(9);
  await expect(grid).toHaveAttribute("min-column-width", "320");

  const columnGeometry = await grid.evaluate((el) => {
    const lefts = Array.from(el.children, (child) =>
      Math.round((child as HTMLElement).getBoundingClientRect().left),
    );
    const heights = Array.from(el.children, (child) =>
      Math.round((child as HTMLElement).getBoundingClientRect().height),
    );
    return {
      uniqueColumns: [...new Set(lefts)].sort((a, b) => a - b).length,
      uniqueHeights: [...new Set(heights)].sort((a, b) => a - b).length,
    };
  });
  expect(columnGeometry.uniqueColumns).toBe(3);
  expect(columnGeometry.uniqueHeights).toBeGreaterThanOrEqual(3);

  await page.locator("#switch-row").click();
  await expect(grid).toHaveAttribute("mode", "rows");
  await expect(grid).toHaveAttribute("row-count", "3");
  await expect(shell).toHaveAttribute("data-row-active", "true");
  await page.waitForTimeout(450);

  const geometry = await grid.evaluate((el) => {
    const tops = Array.from(el.children, (child) =>
      Math.round((child as HTMLElement).getBoundingClientRect().top),
    );
    const heights = Array.from(el.children, (child) =>
      Math.round((child as HTMLElement).getBoundingClientRect().height),
    );
    const widths = Array.from(el.children, (child) =>
      Math.round((child as HTMLElement).getBoundingClientRect().width),
    );
    const uniqueTops = [...new Set(tops)].sort((a, b) => a - b);
    return {
      minHeight: Math.min(...heights),
      uniqueTopCount: uniqueTops.length,
      maxWidth: Math.max(...widths),
    };
  });

  expect(geometry.uniqueTopCount).toBe(3);
  expect(geometry.minHeight).toBeGreaterThanOrEqual(95);
  expect(geometry.maxWidth).toBeGreaterThanOrEqual(180);

  const shellLayout = await shell.evaluate((el) => ({
    clientWidth: el.clientWidth,
    overflowX: getComputedStyle(el).overflowX,
    scrollWidth: el.scrollWidth,
  }));
  expect(shellLayout.overflowX).toBe("visible");
  expect(shellLayout.scrollWidth).toBeGreaterThanOrEqual(shellLayout.clientWidth);
});
