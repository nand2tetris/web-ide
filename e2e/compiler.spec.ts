import { expect } from "@playwright/test";
import { test } from "./util/base.ts";

test.describe("compiler", () => {
  test("has title", async ({ page }) => {
    await page.goto("compiler");

    await expect(page).toHaveTitle(/NAND2Tetris/);
    await expect(page.getByText("Jack Compiler")).toBeVisible();
    await expect(page.getByText("Compiled with problems:")).not.toBeAttached();
    await expect(page.getByText("Uncaught runtime errors:")).not.toBeAttached();
  });
});
