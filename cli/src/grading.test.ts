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
import { main } from "./grading.js";

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

describe("grading a folder", () => {
  let folder: string;
  let log: MockInstance<typeof console.log>;

  beforeEach(async () => {
    folder = await mkdtemp(join(tmpdir(), "nand2tetris-grade-"));
    await writeFile(join(folder, "Not.hdl"), twoErrors);
    log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(async () => {
    log.mockRestore();
    await rm(folder, { recursive: true, force: true });
  });

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
});
