import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";
import { testRunner } from "./testrunner.js";

const lines = (...l: string[]) => l.join("\n");

const twoErrors = lines(
  "CHIP Not {",
  "  IN in;",
  "  OUT out;",
  "  PARTS:",
  "  Nand(a=in b=in, out=x);",
  "  Nope(a=x, out=out);",
  "}",
);

describe("running a test script", () => {
  let folder: string;
  let log: MockInstance<typeof console.log>;

  beforeEach(async () => {
    folder = await mkdtemp(join(tmpdir(), "nand2tetris-run-"));
    await writeFile(join(folder, "Not.hdl"), twoErrors);
    await writeFile(join(folder, "Not.tst"), "repeat 1 {\n  eval;\n}");
    await writeFile(join(folder, "Not.cmp"), "");
    log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(async () => {
    log.mockRestore();
    await rm(folder, { recursive: true, force: true });
  });

  const out = (): string => String(log.mock.calls.at(-1)?.[0]?.out);

  it("lists every diagnostic of a failing chip when recovery is on", async () => {
    await testRunner(folder, "Not", { attemptRecovery: true });

    expect(out()).toMatch(/Not\.hdl: Line 5: [^\n]*\nNot\.hdl: Line 6: /);
  });
});
