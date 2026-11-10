import { describe, expect, it } from "vitest";
import { compile } from "../../jack/compiler.js";
import {
  isRecovered,
  isValid,
  type Outcome,
  recoveryOf,
  validOf,
} from "../base.js";
import { type Diagnostic, describeDiagnostic } from "../diagnostic.js";
import { type Class, JACK } from "../jack.js";

const lines = (...l: string[]) => l.join("\n");

const RECOVER = { attemptRecovery: true };

const expectRecovered = (outcome: Outcome<Class>) => {
  expect(isValid(outcome)).toBe(false);
  expect(outcome.ast).not.toEqual(JACK.empty());
};

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

describe("Jack recovery preserves the strict first displayed message and line", () => {
  it.each(JACK_MISTAKES.map((s, i) => [i, s]))("Jack %i", (_i, source) => {
    const strict = JACK.parse(source as string);
    const recovering = JACK.parse(source as string, RECOVER);
    if (isValid(strict)) throw new Error("parse is valid");
    if (isValid(recovering)) throw new Error("parse is valid");
    const expected: Diagnostic = strict.diagnostics[0];
    const first: Diagnostic = recovering.diagnostics[0];
    expect(describeDiagnostic(first)).toBe(describeDiagnostic(expected));
    expect(first.span?.line).toBe(expected.span?.line);
  });
});

describe("Jack partial AST", () => {
  const astOf = (source: string) => {
    const outcome = JACK.parse(source, RECOVER);
    expectRecovered(outcome);
    return outcome.ast;
  };

  it("keeps the statements before a last statement that lacks `;`", () => {
    const source = lines(
      "class Main {",
      "  function void main() {",
      "    let x = 1;",
      "    do f();",
      "    let y = 2",
      "  }",
      "}",
    );
    const outcome = JACK.parse(source, RECOVER);
    expectRecovered(outcome);
    expect(outcome.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
      'Line 6: expected ";", "=", ">", "<", "|", "&", "/", "*", "-", or "+"',
    ]);
    const sub = outcome.ast.subroutines[0];
    expect(isRecovered(sub)).toBe(false);
    if (isRecovered(sub)) return;
    const statements = sub.body.statements;
    expect(statements).toHaveLength(3);
    expect(statements[0]).toMatchObject({ statementType: "letStatement" });
    expect(statements[1]).toMatchObject({ statementType: "doStatement" });
    expect(isRecovered(statements[2])).toBe(true);
    expect(recoveryOf(statements[2])).toBe(outcome.diagnostics[0]);
  });

  it("puts one null statement in a while body and keeps what follows", () => {
    const source = lines(
      "class Main {",
      "  function void main() {",
      "    while (x) {",
      "      let x = 1",
      "    }",
      "    do Output.printInt(x);",
      "    return;",
      "  }",
      "}",
    );
    const outcome = JACK.parse(source, RECOVER);
    expectRecovered(outcome);
    expect(outcome.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
      'Line 5: expected ";", "=", ">", "<", "|", "&", "/", "*", "-", or "+"',
    ]);
    const sub = outcome.ast.subroutines[0];
    if (isRecovered(sub)) throw new Error("subroutine lost");
    const [loop, call, ret] = sub.body.statements;
    expect(loop).toMatchObject({ statementType: "whileStatement" });
    if (isRecovered(loop) || loop.statementType !== "whileStatement") return;
    expect(loop.body).toHaveLength(1);
    expect(isRecovered(loop.body[0])).toBe(true);
    expect(recoveryOf(loop.body[0])).toBe(outcome.diagnostics[0]);
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
    const outcome = JACK.parse(source, RECOVER);
    expectRecovered(outcome);
    expect(outcome.diagnostics.map((e) => e.span?.line)).toEqual([2, 7]);
    const [a, b] = outcome.ast.subroutines;
    expect(isRecovered(a)).toBe(true);
    expect(b).toMatchObject({ name: { value: "b" } });
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
    const outcome = JACK.parse(source, RECOVER);
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
    const outcome = JACK.parse(source, RECOVER);
    expectRecovered(outcome);
    expect(outcome.diagnostics).toHaveLength(1);
  });
});

describe("compiler reports every parse error per file", () => {
  it("lists each file's recovered errors on its compile error", () => {
    const source = lines(
      "class Main {",
      "  function void main() {",
      "    var int;",
      "    let x 1;",
      "    do Output.printInt(x;",
      "    return;",
      "  }",
      "}",
    );
    const outcome = JACK.parse(source, RECOVER);
    expectRecovered(outcome);
    const body = outcome.ast.subroutines[0].body;
    const broken = [...body.varDecs, ...body.statements].filter(isRecovered);
    expect(broken).toHaveLength(3);
    broken.forEach((node, i) =>
      expect(recoveryOf(node)).toBe(outcome.diagnostics[i]),
    );
    expect(body.statements.at(-1)).toMatchObject({
      statementType: "returnStatement",
    });

    const compiled = compile(
      { Main: source, Other: "class Other { function void f() { return; } }" },
      RECOVER,
    );
    expect(typeof compiled.Other).toBe("string");
    const diagnostics = compiled.Main;
    if (typeof diagnostics === "string") throw new Error("Main compiled");
    expect(diagnostics.map((d) => describeDiagnostic(d))).toEqual([
      'Line 3: expected a space, "/*", or "//"',
      'Line 4: expected "="',
      'Line 5: expected ")"',
    ]);
  });
});

describe("Jack first-token typos and nested blocks", () => {
  const STATEMENT = 'expected "}", "return", "do", "while", "if", or "let"';
  it("recovers first-token typos in a class and in an if body", () => {
    const source = [
      "class Main {",
      "  feld int x;",
      "  function void main() {",
      "    if (x) {",
      "      evl x;",
      "    }",
      "    let x = 1;",
      "    return;",
      "  }",
      "}",
    ].join("\n");
    const outcome = JACK.parse(source, RECOVER);
    expectRecovered(outcome);
    expect(outcome.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
      'Line 2: expected "}", "method", "function", "constructor", "field", or "static"',
      `Line 5: ${STATEMENT}`,
    ]);
  });

  it("(b) keeps nested if, else and while blocks valid", () => {
    const source = [
      "class Main {",
      "  field int x;",
      "  function void main() {",
      "    if (x) {",
      "      let x = 1;",
      "    } else {",
      "      do f();",
      "    }",
      "    while (x) {",
      "      let x = 2;",
      "    }",
      "    return;",
      "  }",
      "}",
    ].join("\n");
    const outcome = JACK.parse(source, RECOVER);
    expect(validOf(outcome)).toBeOk();
    expect(outcome.diagnostics).toEqual([]);
  });

  it("(a) a first-token typo before `}` does not swallow the next subroutine", () => {
    const source = [
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
    ].join("\n");
    const outcome = JACK.parse(source, RECOVER);
    expectRecovered(outcome);
    expect(outcome.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
      `Line 4: ${STATEMENT}`,
    ]);
    expect(outcome.ast.subroutines.map((sub) => sub.name.value)).toEqual([
      "a",
      "b",
    ]);
    const [a, b] = outcome.ast.subroutines;
    expect(a.body.statements[0]).toMatchObject({
      statementType: "letStatement",
      name: { value: "x" },
    });
    expect(isRecovered(a.body.statements[1])).toBe(true);
    expect(recoveryOf(a.body.statements[1])).toBe(outcome.diagnostics[0]);
    expect(b.body.statements).toMatchObject([
      { statementType: "letStatement", name: { value: "y" } },
      { statementType: "returnStatement" },
    ]);
  });
});
