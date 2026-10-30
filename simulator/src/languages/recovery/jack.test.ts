/**
 * Recovery on never changes what a Jack course file or a
 * mistaken file reports first, a valid course file recovers nothing, and the
 * partial AST keeps the valid work around each null object.
 */
import { unwrap } from "@davidsouther/jiffies/result.ts";
import { Programs } from "@nand2tetris/projects/samples/project_11/index.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compile } from "../../jack/compiler.js";
import {
  type Diagnostic,
  describeEnglish,
  isParserRecoveryEnabled,
  isRecovered,
  isValid,
  type Outcome,
  recoveryOf,
  setParserRecovery,
  validOf,
} from "../base.js";
import { type Class, JACK } from "../jack.js";

const lines = (...l: string[]) => l.join("\n");

/** A recovered parse: diagnostics beside a tree that is not the null root. */
const expectRecovered = (outcome: Outcome<Class>) => {
  expect(isValid(outcome)).toBe(false);
  expect(outcome.ast).not.toEqual(JACK.empty());
};

const COURSE: [string, string, unknown][] = Object.entries(Programs).flatMap(
  ([program, files]) =>
    Object.entries(files).map(([name, file]): [string, string, unknown] => [
      `${program}/${name}.jack`,
      file.jack,
      file.parsed,
    ]),
);

describe("Jack recovery over the course files", () => {
  const before = isParserRecoveryEnabled();
  beforeAll(() => setParserRecovery(true));
  afterAll(() => setParserRecovery(before));

  it("finds the course files", () => {
    expect(COURSE.length).toBeGreaterThan(10);
  });

  it.each(COURSE)("%s parses with no errors", (_name, source, expected) => {
    const result = JACK.parse(source);
    expect(isValid(result)).toBe(true);
    expect(result.diagnostics).toEqual([]);
    const strict = validOf(JACK.parse(source));
    expect(strict).toBeOk();
    expect(unwrap(strict)).toEqual(expected);
  });
});

/** Mistaken classes: the strict parse's first error must survive recovery unchanged. */
const JACK_MISTAKES = [
  "",
  "class",
  "class Main",
  "class Main {",
  "class Main { field int; }",
  "class Main { feld int x; }",
  "class Main { function void main() { return; }",
  "class Main { function void main( { return; } }",
  "class Main { function void main() { let x 1; return; } }",
  "class Main { function void main() { do f(; return; } }",
  "class Main { function void main() { return x } }",
  "class Main { function void main() { if (x y) { let a = 1; } return; } }",
  "class Main { function void main() { while (x <) { let a = 1; } } }",
  "class Main { function void main() { if (x) { let a = 1 } else { do f() } } }",
  "class Main { function void main() { let x = 1; var int y; return; } }",
  'class Main { function void main() { do Output.printString("a;}" x); } }',
  lines(
    "class Main {",
    "  function void a() {",
    "    let x = 1;",
    "    evl x",
    "  }",
    "  function void b() {",
    "    let y = 2;",
    "    return;",
    "  }",
    "}",
  ),
];

describe("Jack recovery leaves the first error byte for byte", () => {
  it.each(JACK_MISTAKES.map((s, i) => [i, s]))("Jack %i", (_i, source) => {
    const before = isParserRecoveryEnabled();
    setParserRecovery(false);
    const strict = JACK.parse(source as string);
    setParserRecovery(true);
    const recovering = JACK.parse(source as string);
    setParserRecovery(before);
    if (isValid(strict)) throw new Error("parse is valid");
    if (isValid(recovering)) throw new Error("parse is valid");
    const expected: Diagnostic = strict.diagnostics[0];
    const first: Diagnostic = recovering.diagnostics[0];
    expect(describeEnglish(first)).toBe(describeEnglish(expected));
    expect(first.span?.line).toBe(expected.span?.line);
  });
});

describe("Jack partial AST", () => {
  const before = isParserRecoveryEnabled();
  beforeAll(() => setParserRecovery(true));
  afterAll(() => setParserRecovery(before));

  const astOf = (source: string) => {
    const outcome = JACK.parse(source);
    expectRecovered(outcome);
    return outcome.ast;
  };

  it("keeps the statements before a last statement that lacks `;`", () => {
    const ast = astOf(
      lines(
        "class Main {",
        "  function void main() {",
        "    let x = 1;",
        "    do f();",
        "    let y = 2",
        "  }",
        "}",
      ),
    );
    const sub = ast.subroutines[0];
    expect(isRecovered(sub)).toBe(false);
    if (isRecovered(sub)) return;
    const statements = sub.body.statements;
    expect(statements).toHaveLength(3);
    expect(statements[0]).toMatchObject({ statementType: "letStatement" });
    expect(statements[1]).toMatchObject({ statementType: "doStatement" });
    expect(isRecovered(statements[2])).toBe(true);
  });

  it("puts one null statement in a while body and keeps what follows", () => {
    const ast = astOf(
      lines(
        "class Main {",
        "  function void main() {",
        "    while (x) {",
        "      let x = 1",
        "    }",
        "    do Output.printInt(x);",
        "    return;",
        "  }",
        "}",
      ),
    );
    const sub = ast.subroutines[0];
    if (isRecovered(sub)) throw new Error("subroutine lost");
    const [loop, call, ret] = sub.body.statements;
    expect(loop).toMatchObject({ statementType: "whileStatement" });
    if (isRecovered(loop) || loop.statementType !== "whileStatement") return;
    expect(loop.body).toHaveLength(1);
    expect(isRecovered(loop.body[0])).toBe(true);
    expect(call).toMatchObject({ statementType: "doStatement" });
    expect(ret).toMatchObject({ statementType: "returnStatement" });
  });

  it("replaces a mistyped class variable and keeps the subroutines", () => {
    const ast = astOf(
      lines(
        "class Main {",
        "  feld int x;",
        "  field int y;",
        "  function void main() {",
        "    return;",
        "  }",
        "}",
      ),
    );
    expect(isRecovered(ast.varDecs[0])).toBe(true);
    expect(ast.varDecs[1]).toMatchObject({ names: ["y"] });
    expect(ast.subroutines).toHaveLength(1);
  });

  it("recovers a broken subroutine header and parses the next one", () => {
    const source = lines(
      "class Main {",
      "  function void a(int x y) {",
      "    let x = 1;",
      "    return;",
      "  }",
      "  function void b() {",
      "    retrn;",
      "  }",
      "}",
    );
    const outcome = JACK.parse(source);
    expectRecovered(outcome);
    expect(outcome.diagnostics.map((e) => e.span?.line)).toEqual([2, 7]);
    const [a, b] = outcome.ast.subroutines;
    expect(isRecovered(a)).toBe(true);
    expect(b).toMatchObject({ name: { value: "b" } });
    // The null subroutine carries the outcome's own diagnostic.
    expect(recoveryOf(a)).toBe(outcome.diagnostics[0]);
    expect(outcome.ast.subroutines.filter(isRecovered)).toEqual([a]);
  });

  it("recovers a broken if condition and keeps the statements after it", () => {
    const source = lines(
      "class Main {",
      "  function void main() {",
      "    if (x y) {",
      "      let a = 1;",
      "    }",
      "    let b = 2;",
      "    return;",
      "  }",
      "}",
    );
    const outcome = JACK.parse(source);
    expectRecovered(outcome);
    expect(outcome.diagnostics.map((e) => e.span?.line)).toEqual([3]);
    const sub = outcome.ast.subroutines[0];
    if (isRecovered(sub)) throw new Error("subroutine lost");
    expect(isRecovered(sub.body.statements[0])).toBe(true);
    expect(sub.body.statements[1]).toMatchObject({
      statementType: "letStatement",
      name: { value: "b" },
    });
  });

  it("recovers a return that lacks `;` before a later statement", () => {
    const source = lines(
      "class Main {",
      "  function int main() {",
      "    return 1",
      "    let x = 2;",
      "  }",
      "}",
    );
    const outcome = JACK.parse(source);
    expectRecovered(outcome);
    expect(outcome.diagnostics).toHaveLength(1);
  });
});

describe("compiler reports every parse error per file", () => {
  const before = isParserRecoveryEnabled();
  beforeAll(() => setParserRecovery(true));
  afterAll(() => setParserRecovery(before));

  it("lists each file's recovered errors on its compile error", () => {
    const compiled = compile({
      Main: lines(
        "class Main {",
        "  function void main() {",
        "    var int;",
        "    let x 1;",
        "    do Output.printInt(x;",
        "    return;",
        "  }",
        "}",
      ),
      Other: "class Other { function void f() { return; } }",
    });
    expect(typeof compiled.Other).toBe("string");
    const diagnostics = compiled.Main;
    if (typeof diagnostics === "string") throw new Error("Main compiled");
    expect(describeEnglish(diagnostics[0])).toMatch(/^Line 3: /);
    expect(diagnostics.map((e) => e.span?.line)).toEqual([3, 4, 5]);
  });
});
