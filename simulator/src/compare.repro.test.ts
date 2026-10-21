// Repro for nand2tetris/web-ide#678 (and related edge cases) in compareLines.
import { describe, expect, it } from "vitest";
import { compareLines } from "./compare.js";

const hack = "0000000000000001\n1110110000010000";

describe("#678 compareLines trailing newline", () => {
  it("identical content, one side has trailing newline -> should be equal", () => {
    // Currently returns { lenA: 2, lenB: 3 } => 'Comparison failed - different lengths'
    expect(compareLines(hack, `${hack}\n`)).toEqual({});
  });
  it("trailing newline on result side too", () => {
    expect(compareLines(`${hack}\n`, hack)).toEqual({});
  });
  it("both with trailing newline passes (control)", () => {
    expect(compareLines(`${hack}\n`, `${hack}\n`)).toEqual({});
  });
  it("CRLF compare file: only FIRST \\r\\n is normalised (string replace)", () => {
    expect(compareLines(hack, hack.replace(/\n/g, "\r\n"))).toEqual({});
  });
  it("3 CRLF lines match LF equivalent", () => {
    expect(compareLines("a\nb\nc", "a\r\nb\r\nc")).toEqual({});
  });
});

describe("compare.store consumers: falsy-zero hazards", () => {
  it("mismatch on line index 0 is reported as { line: 0 } (store tests `if (line)` so 0 is treated as success)", () => {
    const r = compareLines("x\ny", "z\ny");
    expect(r).toEqual({ line: 0 });
    // asm.store.ts: `const { line } = comparison; if (line) {...}` -> false for 0
    expect(Boolean((r as { line: number }).line)).toBe(false);
  });
});
