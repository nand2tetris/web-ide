/**
 * Recovery at a malformed chip or class header and at unbalanced chip or
 * class braces: the header becomes a null name that records what it stands
 * in for, the rest of the file stays intact, and the first error is the one
 * the strict parse reports.
 */
import { describe, expect, it } from "vitest";
import {
  type Diagnostic,
  isRecovered,
  isValid,
  type Outcome,
  type Parser,
} from "../base.js";
import { HDL, type HdlParse, type Part, prune } from "../hdl.js";

const lines = (...l: string[]) => l.join("\n");

const RECOVER = { attemptRecovery: true };

/** A parse that recovered: a tree that is not the null root, with diagnostics. */
type Recovered<T> = Exclude<Outcome<T>, { diagnostics: readonly [] }>;

function recovered<T>(language: Parser<T>, source: string): Recovered<T> {
  const outcome = language.parse(source, RECOVER);
  if (isValid(outcome)) throw new Error("parse is valid");
  const messages = outcome.diagnostics.map((e) => e.message).join(" | ");
  expect(outcome.ast, `parse did not recover: ${messages}`).not.toEqual(
    language.empty(),
  );
  return outcome;
}

/** The single error the strict parse reports for `source`. */
function strictError<T>(language: Parser<T>, source: string): Diagnostic {
  const outcome = language.parse(source);
  if (isValid(outcome)) throw new Error("parse is valid");
  return outcome.diagnostics[0];
}

/** A chip body that is valid after any header. */
const CHIP_BODY = [
  "  IN a;",
  "  OUT out;",
  "  PARTS:",
  "  Not(in=a, out=out);",
  "}",
];

const partNames = (chip: HdlParse) =>
  chip.parts === "BUILTIN"
    ? []
    : chip.parts.map((part: Part) =>
        isRecovered(part) ? "<error>" : part.name,
      );

describe("HDL recovery at a malformed CHIP header", () => {
  it.each([
    ["a missing chip name", "CHIP {"],
    ["a chip name that is not an identifier", "CHIP 1Not {"],
    ["a misspelled CHIP keyword", "CHP Not {"],
    ["an extra word before the brace", "CHIP Not Gate {"],
  ])("keeps the pins and parts after %s", (_, header) => {
    const source = lines(header, ...CHIP_BODY);

    const parsed = recovered(HDL, source);

    expect(parsed.diagnostics).toEqual([strictError(HDL, source)]);
    expect(parsed.ast.name).toMatchObject({
      value: "",
      skipped: { kind: "ChipHead" },
    });
    expect(parsed.ast.name.recovery).toBe(parsed.diagnostics[0]);
    expect(parsed.ast.ins).toEqual([{ pin: "a", width: 1 }]);
    expect(parsed.ast.outs).toEqual([{ pin: "out", width: 1 }]);
    expect(partNames(parsed.ast)).toEqual(["Not"]);
  });
});

describe("HDL recovery at unbalanced chip braces", () => {
  it("resumes a chip missing its `{` at `PARTS:`, skipping its pins", () => {
    const source = lines("CHIP Not", ...CHIP_BODY);

    const parsed = recovered(HDL, source);

    expect(parsed.diagnostics).toEqual([strictError(HDL, source)]);
    expect(parsed.ast.name).toMatchObject({
      value: "",
      skipped: { kind: "ChipStart", interval: { start: 0, end: 27 } },
    });
    expect(parsed.ast.ins).toEqual([]);
    expect(parsed.ast.outs).toEqual([]);
    expect(partNames(parsed.ast)).toEqual(["Not"]);
  });

  it("keeps a chip closed early and makes the text after it a null part", () => {
    const source = lines(
      "CHIP Not {",
      "  IN a;",
      "  OUT out;",
      "  PARTS:",
      "  Not(in=a, out=x);",
      "  }",
      "  Not(in=x, out=out);",
      "}",
    );

    const parsed = recovered(HDL, source);

    expect(parsed.diagnostics).toEqual([strictError(HDL, source)]);
    expect(parsed.diagnostics[0].span?.line).toBe(7);
    expect(parsed.ast.name.value).toBe("Not");
    expect(partNames(parsed.ast)).toEqual(["Not", "<error>"]);
    const parts = parsed.ast.parts as Part[];
    expect(parts[1].skipped).toMatchObject({ kind: "ChipClose" });
  });

  it("still builds no chip when the closer is missing at the end", () => {
    const source = lines("CHIP Not {", ...CHIP_BODY.slice(0, -1));

    const outcome = HDL.parse(source, RECOVER);

    expect(outcome.ast).toEqual(HDL.empty());
    expect(outcome.diagnostics).toEqual([strictError(HDL, source)]);
  });
});

describe("a pruned HDL header", () => {
  it("drops the null name to an empty name and keeps its provenance", () => {
    const parsed = recovered(HDL, lines("CHIP {", ...CHIP_BODY));

    const pruned = prune(parsed.ast);

    expect(pruned.name).toEqual({ value: "" });
    expect(prune.provenance(parsed.ast)).toMatchObject([
      { kind: "ChipHead", interval: { start: 0, end: 4 }, scope: [""] },
    ]);
  });
});
