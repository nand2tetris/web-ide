import { expect } from "@playwright/test";
import { test } from "../../fixtures/vm.fixture";

test(
  "Student opens the file picker, navigates to SimpleAdd.vm, and sees it loaded into the editor",
  { tag: "@vm" },
  async ({ vmPage }) => {
    await vmPage.filePicker.open();
    await vmPage.filePicker.selectPath([
      "projects",
      "07",
      "SimpleAdd",
      "SimpleAdd.vm",
    ]);

    await expect(vmPage.page.getByTestId("editor-vm")).toHaveValue(
      /push constant 7/,
    );
  },
);
