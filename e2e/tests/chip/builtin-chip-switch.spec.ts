import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

// Regression for #698: with Builtin toggled on, switching chips must show the
// new chip's pins in the Chip Input panel, not the previous chip's.
test("Switching chips with Builtin enabled shows the new chip's input pins", async ({
  chipPage,
}) => {
  const page = chipPage.page;
  const pinCell = (name: string) => page.locator(`td:text-is("${name}")`);

  await chipPage.selectProject("01");
  await chipPage.selectChip("Not");
  await chipPage.enableBuiltin();
  await expect(pinCell("in")).toHaveCount(1);

  // Select a different chip directly, leaving Builtin on.
  await page.selectOption('[data-testid="chip-picker"]', { label: "And" });

  await expect(page.getByRole("switch", { name: "Builtin" })).toBeChecked();
  await expect(pinCell("a")).toHaveCount(1);
  await expect(pinCell("b")).toHaveCount(1);
  await expect(pinCell("in")).toHaveCount(0);
});
