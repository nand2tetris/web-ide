import { expect, test, type Page } from "@playwright/test";

const TOOL_PAGES = [
  {
    path: "/chip",
    tooltip: "Hardware Simulator",
    sentinel: (page: Page) => page.locator(".ChipPage"),
  },
  {
    path: "/cpu",
    tooltip: "CPU Emulator",
    sentinel: (page: Page) => page.locator(".CpuPage"),
  },
  {
    path: "/asm",
    tooltip: "Assembler",
    sentinel: (page: Page) => page.locator(".AsmPage"),
  },
  {
    path: "/vm",
    tooltip: "VM Emulator",
    sentinel: (page: Page) => page.locator(".VmPage"),
  },
  {
    path: "/compiler",
    tooltip: "Jack Compiler",
    sentinel: (page: Page) => page.locator(".CompilerPage"),
  },
  {
    path: "/bitmap",
    tooltip: "Bitmap Editor",
    sentinel: (page: Page) => page.locator(".BitmapPage"),
  },
  {
    path: "/util",
    tooltip: "Converter Tool",
    sentinel: (page: Page) => page.getByRole("heading", { name: "Convert Hack Number Types" }),
  },
  {
    path: "/about",
    tooltip: "About",
    sentinel: (page: Page) => page.getByText("Nand to Tetris IDE Online"),
  },
];

test(
  "every top-level tool page renders after navigating from the top menu",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.goto("");

    for (const { path, tooltip, sentinel } of TOOL_PAGES) {
      await page.locator(`li[data-tooltip="${tooltip}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(sentinel(page)).toBeVisible();
    }
  },
);

TOOL_PAGES.forEach(({ path, sentinel }) => {
  test(
    `deep-link ${path} renders its sentinel`,
    async ({ page }) => {
      await page.goto(path.replace(/^\//, ""));
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(sentinel(page)).toBeVisible();
    },
  );
});

test(
  "en-PL pseudolocale renders Lingui macro strings pseudo-translated",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("/locale", "en-PL");
    });

    await page.goto("");
    await page.locator('li[data-tooltip="Settings"]').click();

    const dialogHeader = page.locator("dialog[open] article.settings-dialog header p");
    await expect(dialogHeader).toHaveText("Śēţţĩńĝś");
  },
);
