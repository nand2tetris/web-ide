import type { Locator, Page } from "@playwright/test";
import { EditorPanel } from "./EditorPanel";

export class VmPage {
  editor: EditorPanel;

  constructor(private _page: Page) {
    this.editor = new EditorPanel(_page);
  }

  get page(): Page {
    return this._page;
  }

  get vmStructures(): Locator {
    throw new Error("not implemented");
  }

  async step(): Promise<void> {
    throw new Error("not implemented");
  }

  async run(): Promise<void> {
    throw new Error("not implemented");
  }

  async reset(): Promise<void> {
    throw new Error("not implemented");
  }

  async waitForHalt(): Promise<void> {
    throw new Error("not implemented");
  }

  async readRam(_address: number): Promise<number> {
    throw new Error("not implemented");
  }
}
