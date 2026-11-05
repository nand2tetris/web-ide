import { describe, expect, it } from "vitest";
import { isRecovered, isValid, type Outcome, type Parser } from "../base.js";
import {
  type Diagnostic,
  DiagnosticCode,
  describeDiagnostic,
  Stage,
} from "../diagnostic.js";

import { type Class, JACK, prune as jackPrune } from "../jack.js";

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

const CLASS_BODY = [
  "  field int x;",
  "  function void a() {",
  "    return;",
  "  }",
  "}",
];

const subroutineNames = (cls: Class) =>
  cls.subroutines.map((s) => (isRecovered(s) ? "<error>" : s.name.value));

describe("Jack recovery at a malformed class header", () => {
  it.each([
    ["a missing class name", "class {"],
    ["a class name that is not an identifier", "class 1Main {"],
    ["an extra word before the brace", "class Main extends {"],
  ])("keeps the variables and subroutines after %s", (_, header) => {
    const source = lines(header, ...CLASS_BODY);

    const parsed = recovered(JACK, source);

    expect(parsed.diagnostics).toEqual([strictError(JACK, source)]);
    expect(parsed.ast.name).toMatchObject({
      value: "",
      skipped: { kind: "ClassHead" },
    });
    expect(parsed.ast.name.recovery).toBe(parsed.diagnostics[0]);
    expect(parsed.ast.varDecs).toMatchObject([{ names: ["x"] }]);
    expect(subroutineNames(parsed.ast)).toEqual(["a"]);
  });
});

describe("Jack recovery at unbalanced class braces", () => {
  it("resumes a class missing its `{` at its first subroutine", () => {
    const source = lines("class Main", ...CLASS_BODY);

    const parsed = recovered(JACK, source);

    expect(parsed.diagnostics).toEqual([strictError(JACK, source)]);
    expect(parsed.ast.name).toMatchObject({
      value: "",
      skipped: { kind: "ClassStart", interval: { start: 0, end: 25 } },
    });
    expect(parsed.ast.varDecs).toEqual([]);
    expect(subroutineNames(parsed.ast)).toEqual(["a"]);
  });

  it("does not skip into a subroutine to find a class's `{`", () => {
    const source = lines(
      "class Main",
      "  function void a() {",
      "    return;",
      "  }",
      "  function void b() {",
      "    return;",
      "  }",
      "}",
    );

    const parsed = recovered(JACK, source);

    expect(parsed.diagnostics).toHaveLength(1);
    expect(subroutineNames(parsed.ast)).toEqual(["a", "b"]);
  });

  it("returns the null root when a class of variables has no matching closer", () => {
    const source = lines("class Main {", "  field int x;");
    const parsed = JACK.parse(source, RECOVER);

    expect(parsed).toHaveProperty("nullRoot", true);
    expect(parsed.ast).toEqual(JACK.empty());
    expect(parsed.diagnostics[0]).toEqual(strictError(JACK, source));
  });

  it("returns the null root when a malformed class header has no matching closer", () => {
    const source = "class {";
    const parsed = JACK.parse(source, RECOVER);

    expect(parsed).toHaveProperty("nullRoot", true);
    expect(parsed.ast).toEqual(JACK.empty());
    expect(parsed.diagnostics[0]).toEqual(strictError(JACK, source));
  });
});

describe("a pruned Jack header", () => {
  it("drops the null name to an empty name and keeps its provenance", () => {
    const parsed = recovered(JACK, lines("class {", ...CLASS_BODY));

    const pruned = jackPrune(parsed.ast);

    expect(pruned.name).toEqual({ value: "", span: parsed.ast.name.span });
    expect(isRecovered(pruned.name)).toBe(false);
    expect(jackPrune.provenance(parsed.ast)).toMatchObject([
      { kind: "ClassHead", interval: { start: 0, end: 5 }, scope: [""] },
    ]);
  });
});

describe("the strict Jack message at a class with no subroutines", () => {
  it.each([
    ["its `{`", "class Main {", 1],
    ["a class variable's `;`", "class Main {\n  field int x;", 2],
  ])(
    'is today\'s `expected "}"` right after %s at the end',
    (_, source, line) => {
      const outcome = JACK.parse(source);

      expect(outcome.diagnostics).toEqual([
        {
          code: DiagnosticCode.Syntax.EXPECTED,
          args: { expected: ['"}"'] },
          span: expect.objectContaining({ line }),
          stage: Stage.PARSE,
        },
      ]);
    },
  );
});
