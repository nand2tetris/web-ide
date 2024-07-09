import { expect } from "@playwright/test";
import { test } from "./util/base.ts";

test.describe("cpu", () => {
  test("has title", async ({ page }) => {
    await page.goto("cpu");

    await expect(page).toHaveTitle(/NAND2Tetris/);
    await expect(page.getByText("CPU Emulator")).toBeVisible();
    await expect(page.getByText("Compiled with problems:")).not.toBeAttached();
    await expect(page.getByText("Uncaught runtime errors:")).not.toBeAttached();
  });
});
