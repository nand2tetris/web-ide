import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { main } from "./grading.js";

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

describe("grading a folder", () => {
  let folder: string;
  let log: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    folder = await mkdtemp(join(tmpdir(), "nand2tetris-grade-"));
    await writeFile(join(folder, "Not.hdl"), twoErrors);
    log = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(async () => {
    log.mockRestore();
    await rm(folder, { recursive: true, force: true });
  });

  /** The text of the `Test Not: Failed (...)` report. */
  const report = () =>
    log.mock.calls
      .map(([line]) => String(line))
      .filter((line) => line.startsWith("Test Not:"))
      .join("\n");

  it("lists every diagnostic of a failing chip when recovery is on", async () => {
    const code = await main(folder, "", { attemptRecovery: true });

    expect(code).toBe(1);
    expect(report()).toMatch(/Not\.hdl: Line 5: [^\n]*\nNot\.hdl: Line 6: /);
  });

  it("lists only the first diagnostic of a failing chip when recovery is off", async () => {
    const code = await main(folder, "", { attemptRecovery: false });

    expect(code).toBe(1);
    expect(report()).toMatch(/Not\.hdl: Line 5: /);
    expect(report()).not.toMatch(/Line 6/);
  });

  it("lists every diagnostic when no option is given", async () => {
    await main(folder, "");

    expect(report()).toMatch(/Line 5: [^\n]*\nNot\.hdl: Line 6: /);
  });
});
