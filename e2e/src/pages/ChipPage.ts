import type { Page } from "@playwright/test";
import { TestPanel } from "./TestPanel";

export class ChipPage {
  testPanel: TestPanel;

  constructor(private page: Page) {
    this.testPanel = new TestPanel(page);
  }

  async selectProject(value: string): Promise<void> {
    await this.page.selectOption('[data-testid="project-picker"]', { value });
  }

  async selectChip(name: string): Promise<void> {
    await this.page.selectOption('[data-testid="chip-picker"]', {
      label: name,
    });
    const builtinSwitch = this.page.getByRole("switch", { name: "Builtin" });
    if (!(await builtinSwitch.isChecked())) {
      await builtinSwitch.click();
    }
  }
}
