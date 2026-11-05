import { describe, expect, it } from "vitest";
import { isRecovered, isValid, type Outcome, type Parser } from "../base.js";
import { type Diagnostic, describeDiagnostic } from "../diagnostic.js";
import { HDL, type HdlParse, type Part, prune } from "../hdl.js";

const lines = (...l: string[]) => l.join("\n");

const RECOVER = { attemptRecovery: true };

type Recovered<T> = Exclude<Outcome<T>, { diagnostics: readonly [] }>;

function recovered<T>(language: Parser<T>, source: string): Recovered<T> {
  const outcome = language.parse(source, RECOVER);
  if (isValid(outcome)) throw new Error("parse is valid");
  const messages = outcome.diagnostics
    .map((e) => describeDiagnostic(e))
    .join(" | ");
  expect(outcome.ast, `parse did not recover: ${messages}`).not.toEqual(
    language.empty(),
  );
  return outcome;
}

function strictError<T>(language: Parser<T>, source: string): Diagnostic {
  const outcome = language.parse(source);
  if (isValid(outcome)) throw new Error("parse is valid");
  return outcome.diagnostics[0];
}

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
    expect(parsed.ast.ins).toMatchObject([
      { pin: "a", width: 1, span: { line: 2 } },
    ]);
    expect(parsed.ast.outs).toMatchObject([
      { pin: "out", width: 1, span: { line: 3 } },
    ]);
    expect(partNames(parsed.ast)).toEqual(["Not"]);
  });
});

describe("HDL recovery at unbalanced chip braces", () => {
  it("retains a chip's name and pins when its `{` is inferred", () => {
    const source = lines("CHIP Not", ...CHIP_BODY);

    const parsed = recovered(HDL, source);

    expect(parsed.diagnostics).toEqual([strictError(HDL, source)]);
    expect(parsed.ast.name.value).toBe("Not");
    expect(parsed.ast.ins).toMatchObject([{ pin: "a" }]);
    expect(parsed.ast.outs).toMatchObject([{ pin: "out" }]);
    expect(partNames(parsed.ast)).toEqual(["Not"]);
  });

  it("retains the chip header and records only the skipped tail when `{` is inferred", () => {
    const source = lines("CHIP Not xyz", ...CHIP_BODY);
    const parsed = recovered(HDL, source);
    const pruned = prune(parsed.ast);

    expect(pruned.name.value).toBe("Not");
    expect(pruned.ins).toMatchObject([{ pin: "a" }]);
    expect(pruned.outs).toMatchObject([{ pin: "out" }]);
    const [skip] = prune.provenance(parsed.ast);
    expect(source.slice(skip.interval.start, skip.interval.end)).toBe("xyz");
    expect(skip.scope).toEqual(["Not"]);
  });

  it("retains a part and records only the skipped tail when `;` is inferred", () => {
    const source = "CHIP Not { IN a; OUT out; PARTS: Not(in=a,out=out) xyz }";
    const parsed = recovered(HDL, source);
    expect(partNames(prune(parsed.ast))).toEqual(["Not"]);
    const [skip] = prune.provenance(parsed.ast);
    expect(source.slice(skip.interval.start, skip.interval.end)).toBe("xyz");
    expect(skip.scope).toEqual(["Not"]);
  });

  it("retains skipped-tail provenance when a mixed part list collapses to BUILTIN", () => {
    const source =
      "CHIP Not { IN a; OUT out; PARTS: Not(in=a,out=out) xyz BUILTIN; }";
    const parsed = recovered(HDL, source);
    expect(parsed.ast.parts).toBe("BUILTIN");
    const [skip] = prune.provenance(parsed.ast);
    expect(source.slice(skip.interval.start, skip.interval.end)).toBe("xyz");
    expect(skip.kind).toBe("PartTail");
    expect(skip.scope).toEqual(["Not"]);
  });

  it("keeps skipped part-list text as provenance when the list is BUILTIN", () => {
    const source = "CHIP Not { IN a; OUT out; PARTS: BUILTIN; xyz }";
    const parsed = recovered(HDL, source);
    expect(parsed.ast.parts).toBe("BUILTIN");
    const [skip] = prune.provenance(parsed.ast);
    expect(source.slice(skip.interval.start, skip.interval.end)).toBe("xyz");
    expect(skip.kind).toBe("PartsClose");
    expect(skip.scope).toEqual(["Not"]);
    expect(prune(parsed.ast)).not.toHaveProperty("skippedParts");
  });

  it("keeps skipped text after a builtin chip closer as provenance", () => {
    const source = "CHIP Not { IN a; OUT out; BUILTIN; } xyz";
    const parsed = recovered(HDL, source);
    expect(parsed.ast.parts).toBe("BUILTIN");
    const [skip] = prune.provenance(parsed.ast);
    expect(source.slice(skip.interval.start, skip.interval.end)).toBe("xyz");
    expect(skip.kind).toBe("ChipClose");
    expect(skip.scope).toEqual(["Not"]);
    expect(prune(parsed.ast)).not.toHaveProperty("skippedParts");
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

  it("returns the null root when a chip has no matching closer", () => {
    const source = lines("CHIP Not {", ...CHIP_BODY.slice(0, -1));
    const parsed = HDL.parse(source, RECOVER);

    expect(parsed).toHaveProperty("nullRoot", true);
    expect(parsed.ast).toEqual(HDL.empty());
    expect(parsed.diagnostics[0]).toEqual(strictError(HDL, source));
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
