import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

test("Chip simulator surfaces syntax errors for malformed HDL", async ({
  chipPage,
}) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("And");
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");

  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});
