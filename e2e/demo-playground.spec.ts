import { expect, test } from "@playwright/test";

test("playground toggles and updates custom element attributes live", async ({ page }) => {
  await page.goto("/demos/playground.html");

  const grid = page.locator("#playground-grid");
  const attrs = page.locator("#playground-attrs");
  const toolbar = page.locator(".demo-playground-toolbar");
  const shell = page.locator(".demo-playground-shell");

  await expect(grid.locator(":scope > *").first()).toBeVisible({ timeout: 15000 });

  await expect(toolbar).toBeVisible();
  await expect(page.locator("#dataset-input")).toBeVisible();
  await expect(page.locator("#playground-scope-note")).toBeVisible();
  await expect(page.locator('input[name="mode-enabled"]')).toHaveCount(0);
  await expect(page.locator('input[name="row-count-enabled"]')).toHaveCount(0);
  await expect(page.locator('input[name="min-row-height-enabled"]')).toHaveCount(0);

  const toolbarBox = await toolbar.boundingBox();
  const shellBox = await shell.boundingBox();
  expect(toolbarBox?.y ?? 0).toBeLessThan(shellBox?.y ?? 0);

  await expect(grid).toHaveAttribute("gap", "16");
  await expect(grid).toHaveAttribute("min-column-width", "250");
  await expect(attrs).toContainText('gap="16"');
  await expect(page.locator("#dataset-value")).toContainText(/mixed wall/i);
  await expect(grid.locator(":scope > *")).toHaveCount(28);
  await expect(page.locator("#flow-tolerance-value")).toContainText("16px");

  await page.locator("#dataset-input").selectOption("balanced");
  await expect(page.locator("#dataset-value")).toContainText(/balanced cards/i);
  await expect(grid.locator(":scope > *")).toHaveCount(12);
  await expect(grid.locator(':scope > [aria-label="Balanced card 1"]')).toBeVisible();

  await page.locator('input[name="flow-tolerance-enabled"]').check();
  await page.locator("#flow-tolerance-input").fill("32");
  await expect(grid).toHaveAttribute("flow-tolerance", "32");
  await expect(page.locator("#playground-scope-note")).toContainText(
    /balanced cards dataset makes `flow-tolerance` threshold changes easier to observe/i,
  );

  await page.locator('input[name="gap-enabled"]').uncheck();
  await expect(grid).not.toHaveAttribute("gap", /.+/);
  await expect(attrs).not.toContainText('gap="16"');
});
