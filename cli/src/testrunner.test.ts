import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { testRunner } from "./testrunner.js";

const lines = (...l: string[]) => l.join("\n");

/** A Not chip with two independent errors: a syntax error at line 5, an undefined chip at line 6. */
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
  let log: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    folder = await mkdtemp(join(tmpdir(), "nand2tetris-run-"));
    await writeFile(join(folder, "Not.hdl"), twoErrors);
    await writeFile(join(folder, "Not.tst"), "repeat 1 {\n  eval;\n}");
    await writeFile(join(folder, "Not.cmp"), "");
    log = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(async () => {
    log.mockRestore();
    await rm(folder, { recursive: true, force: true });
  });

  /** The output the run reports for the chip. */
  const out = (): string => String(log.mock.calls.at(-1)?.[0]?.out);

  it("lists every diagnostic of a failing chip when recovery is on", async () => {
    await testRunner(folder, "Not", { attemptRecovery: true });

    expect(out()).toMatch(/Not\.hdl: Line 5: [^\n]*\nNot\.hdl: Line 6: /);
  });

  it("lists only the first diagnostic of a failing chip when recovery is off", async () => {
    await testRunner(folder, "Not", { attemptRecovery: false });

    expect(out()).toMatch(/Not\.hdl: Line 5: /);
    expect(out()).not.toMatch(/Line 6/);
  });

  it("lists every diagnostic when no option is given", async () => {
    await testRunner(folder, "Not");

    expect(out()).toMatch(/Line 5: [^\n]*\nNot\.hdl: Line 6: /);
  });
});
