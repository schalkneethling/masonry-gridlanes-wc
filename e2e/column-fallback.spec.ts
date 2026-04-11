import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    __MGL_COLUMN_FALLBACK_READY?: boolean;
  }
}

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

test("column fallback keeps order, span, and explicit placement", async ({ page }) => {
  await page.goto("/e2e/fixtures/column-fallback-placement.html");
  await page.waitForFunction(() => window.__MGL_COLUMN_FALLBACK_READY === true);

  const items = page.locator("masonry-grid-lanes > article");
  await expect(items.nth(0)).toHaveCSS("width", "210px");
  await expect(items.nth(1)).toHaveCSS("left", "0px");
  await expect(items.nth(2)).toHaveCSS("left", "330px");
});
