import { expect, test } from "@playwright/test";

test("The Problems list shows the first problem and remembers Show All Problems", async ({
  page,
}) => {
  const source = [
    "CHIP Problems {",
    "  IN a; OUT out;",
    "  PARTS:",
    "  Nope(a=a, out=x);",
    "  Never(a=a, out=out);",
    "}",
  ].join("\n");
  await page.addInitScript((hdl) => {
    localStorage.setItem("/projects/problems/Problems.hdl", hdl);
  }, source);
  await page.goto("chip");
  await page.selectOption('[data-testid="project-picker"]', "problems");
  await page.selectOption('[data-testid="chip-picker"]', { label: "Problems" });

  const problems = page.locator("._hdl_panel .Editor > .ErrorPanel");
  await expect(
    problems.getByRole("button", { name: "Problems", exact: true }),
  ).toBeVisible();
  await expect(problems.getByRole("listitem")).toHaveText([
    "First problem: Line 4: Undefined chip name: Nope (and 1 more)",
  ]);

  await page.locator('li[data-tooltip="Settings"]').click();
  const settings = page.locator("dialog[open] article.settings-dialog");
  await expect(
    settings.getByRole("radio", { name: "Show First Problem" }),
  ).toBeChecked();
  await settings.getByRole("radio", { name: "Show All Problems" }).check();
  await settings.locator("a.close").click();
  await expect(problems.getByRole("listitem")).toHaveText([
    "Line 4: Undefined chip name: Nope",
    "Line 5: Undefined chip name: Never",
  ]);

  await page.reload();
  await page.selectOption('[data-testid="project-picker"]', "problems");
  await page.selectOption('[data-testid="chip-picker"]', { label: "Problems" });
  await expect(problems.getByRole("listitem")).toHaveText([
    "Line 4: Undefined chip name: Nope",
    "Line 5: Undefined chip name: Never",
  ]);
  await page.locator('li[data-tooltip="Settings"]').click();
  await expect(
    settings.getByRole("radio", { name: "Show All Problems" }),
  ).toBeChecked();
});
