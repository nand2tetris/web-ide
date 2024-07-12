import { expect } from "@playwright/test";
import { test } from "./util/base.ts";

const NOT = `CHIP Not {
IN in;
OUT out;

PARTS:
Nand(a=in, b=in, out=out);
}`;

test.describe("chip", () => {
  test("has title", async ({ page }) => {
    await page.goto("chip");

    await expect(page).toHaveTitle(/NAND2Tetris/);
    await expect(page.getByText("Hardware Simulator")).toBeVisible();
    await expect(page.getByText("Compiled with problems:")).not.toBeAttached();
    await expect(page.getByText("Uncaught runtime errors:")).not.toBeAttached();
  });

  test("simple chip", async ({ page, monaco }) => {
    await page.goto("chip?monaco=false");
    await page.getByRole("button", { name: "Accept" }).click();
    await page.getByTestId("project-picker").selectOption("Project 1");
    await page.getByTestId("chip-picker").selectOption("Not");

    await monaco.toggleMonaco();
    await monaco.write(NOT, "hdl");
    await expect(page.getByText("HDL code: No syntax errors")).toBeVisible();

    await page.getByTestId("runbar-run-pause").click();
    await expect(
      page.getByText(
        "Simulation successful: The output file is identical to the compare file",
      ),
    ).toBeVisible();
  });
});
