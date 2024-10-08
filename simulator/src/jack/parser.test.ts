import fs from "fs";

import path from "path";
import {
  getTestResourcePath,
  listenToTheTree,
  parseJackFile,
  parseJackText,
  testResourceDirs,
} from "./test.helper";
import { BinderListener } from "./listener/binder.listener";

describe("Jack parser", () => {
  const jestConsole = console;
  beforeEach(() => {
    global.console = require("console");
  });

  afterEach(() => {
    global.console = jestConsole;
  });

  test.each(testResourceDirs)("%s", (dir: string) => {
    testJackDir(getTestResourcePath(dir));
  });
  test("expected EOF", () => {
    try {
      parseJackText(`
            class A{
            }
            var a;
            `);
    } catch (e) {
      if (e instanceof Error) {
        expect(e.message).toContain("expecting <EOF>");
        return;
      } else {
        fail("Expected Error");
      }
    }
    fail("Expected Error");
  });
});

function testJackDir(testFolder: string): void {
  const files = fs
    .readdirSync(testFolder)
    .filter((file) => file.endsWith(".jack"))
    .map((file) => path.join(testFolder, file));
  for (const filePath of files) {
    const tree = parseJackFile(filePath);
    const globalSymbolsListener = listenToTheTree(tree, new BinderListener());
    const symbolsErrors = globalSymbolsListener.errors.join("\n");
    try {
      expect(globalSymbolsListener.errors.length).toBe(0);
    } catch (e) {
      throw new Error(symbolsErrors);
    }
  }
}
