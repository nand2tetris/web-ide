/**
 * F7 own tests: recovery on never changes what a Jack course file or a
 * mistaken file reports first, a valid course file recovers nothing, and the
 * partial AST keeps the valid work around each error node.
 */
import { Err, isErr, Ok, unwrap } from "@davidsouther/jiffies/result.ts";
import { Programs } from "@nand2tetris/projects/samples/project_11/index.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compile } from "../jack/compiler.js";
import {
  type CompilationError,
  isParseError,
  isParserRecoveryEnabled,
  type Parsed,
  type ParseResult,
  setParserRecovery,
} from "./base.js";
import { type ClassPartial, JACK } from "./jack.js";

/** The parsed value of a result already asserted to be Ok. */
const parsedOf = (result: ParseResult<ClassPartial>): Parsed<ClassPartial> =>
  Ok(result as Ok<Parsed<ClassPartial>>);

const lines = (...l: string[]) => l.join("\n");

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
    expect(result).toBeOk();
    expect(parsedOf(result).errors).toEqual([]);
    const strict = JACK.parseStrict(source);
    expect(strict).toBeOk();
    expect(unwrap(strict)).toEqual(expected);
  });
});

/** Mistaken classes: today's first error must survive recovery unchanged. */
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
    expect(strict).toBeErr();
    const expected: CompilationError = Err(strict as Err<CompilationError>);
    const first: CompilationError = isErr(recovering)
      ? Err(recovering as Err<CompilationError>)
      : parsedOf(recovering).errors[0];
    expect(first.message).toBe(expected.message);
    expect(first.span?.line).toBe(expected.span?.line);
  });
});

describe("Jack partial AST", () => {
  const before = isParserRecoveryEnabled();
  beforeAll(() => setParserRecovery(true));
  afterAll(() => setParserRecovery(before));

  const astOf = (source: string) => {
    const result = JACK.parse(source);
    expect(result).toBeOk();
    return parsedOf(result).ast;
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
    expect(isParseError(sub)).toBe(false);
    if (isParseError(sub)) return;
    const statements = sub.body.statements;
    expect(statements).toHaveLength(3);
    expect(statements[0]).toMatchObject({ statementType: "letStatement" });
    expect(statements[1]).toMatchObject({ statementType: "doStatement" });
    expect(isParseError(statements[2])).toBe(true);
  });

  it("puts one error node in a while body and keeps what follows", () => {
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
    if (isParseError(sub)) throw new Error("subroutine lost");
    const [loop, call, ret] = sub.body.statements;
    expect(loop).toMatchObject({ statementType: "whileStatement" });
    if (isParseError(loop) || loop.statementType !== "whileStatement") return;
    expect(loop.body).toHaveLength(1);
    expect(isParseError(loop.body[0])).toBe(true);
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
    expect(isParseError(ast.varDecs[0])).toBe(true);
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
    const result = JACK.parse(source);
    expect(result).toBeOk();
    expect(parsedOf(result).errors.map((e) => e.span?.line)).toEqual([2, 7]);
    const [a, b] = parsedOf(result).ast.subroutines;
    expect(isParseError(a)).toBe(true);
    expect(b).toMatchObject({ name: { value: "b" } });
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
    const result = JACK.parse(source);
    expect(result).toBeOk();
    expect(parsedOf(result).errors.map((e) => e.span?.line)).toEqual([3]);
    const sub = parsedOf(result).ast.subroutines[0];
    if (isParseError(sub)) throw new Error("subroutine lost");
    expect(isParseError(sub.body.statements[0])).toBe(true);
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
    const result = JACK.parse(source);
    expect(result).toBeOk();
    expect(parsedOf(result).errors).toHaveLength(1);
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
    const error = compiled.Main as CompilationError;
    expect(error.message).toMatch(/^Line 3: /);
    expect(error.errors?.map((e) => e.span?.line)).toEqual([3, 4, 5]);
  });
});
