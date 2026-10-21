// Repro for #535: `run foo.asm` / `run foo.hack` are not implemented.
import { describe, expect, it, vi } from "vitest";

const testRunner = vi.fn();
vi.mock("./testrunner.js", () => ({ testRunner }));
vi.mock("./grading.js", () => ({ main: vi.fn() }));

describe("#535 CLI run", () => {
  for (const ext of [".asm", ".hack"]) {
    it(`handles ${ext} (loads and runs it)`, async () => {
      const log = vi.spyOn(console, "log").mockImplementation(() => {});
      process.argv = ["node", "nand2tetris", "run", `/tmp/Max${ext}`];
      vi.resetModules();
      await import("./index.js");
      const out = log.mock.calls.map((c) => c.join(" ")).join("\n");
      // Currently falls to `default:` and prints "unknown .asm".
      expect(out).not.toContain("unknown");
      log.mockRestore();
    });
  }
});
