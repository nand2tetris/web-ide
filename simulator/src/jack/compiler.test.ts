import { Err, isErr } from "@davidsouther/jiffies/result.ts";
import { Programs } from "@nand2tetris/projects/samples/project_11/index.js";
import { describe, expect, it } from "vitest";
import type { Valid } from "../languages/base.js";
import { type Class, JACK } from "../languages/jack.js";
import { Compiler, compile } from "./compiler.js";

function parse(code: string, rule: string) {
  return JACK.semantics(JACK.parser.match(code, rule));
}

describe("compiler", () => {
  it("compiles expression", () => {
    const exp = parse("(2 + 3) * 5", "Expression").expression;

    const compiler = new Compiler();
    compiler.compileExpression(exp);
    expect(compiler.output).toEqual([
      "push constant 2",
      "push constant 3",
      "add",
      "push constant 5",
      "call Math.multiply 2",
    ]);
  });

  it("compiles function", () => {
    const func = parse(
      `function void main() {
        var int a;
        let a = 4;
        return;
      }`,
      "SubroutineDec",
    ).subroutineDec;

    const compiler = new Compiler();
    compiler.className = "Main";
    compiler.compileFunction(func);
    expect(compiler.output).toEqual([
      "function Main.main 1",
      "push constant 4",
      "pop local 0",
      "push constant 0",
      "return",
    ]);
  });

  it("compiles array access", () => {
    const statement = parse(`let x = arr[2];`, "Statement").statement;

    const compiler = new Compiler();
    compiler.localSymbolTable = {
      x: {
        type: "int",
        segment: "local",
        index: 0,
      },
      arr: {
        type: "Array",
        segment: "local",
        index: 1,
      },
    };
    compiler.compileStatement(statement);
    expect(compiler.output).toEqual([
      "push constant 2",
      "push local 1",
      "add",
      "pop pointer 1",
      "push that 0",
      "pop local 0",
    ]);
  });

  it("compiles if-else", () => {
    const statement = parse(
      `if (condition) {
      let x = 4;
    } else {
      let x = 5;
    }`,
      "Statement",
    ).statement;

    const compiler = new Compiler();
    compiler.className = "Main";
    compiler.localSymbolTable = {
      condition: {
        type: "boolean",
        segment: "local",
        index: 0,
      },
      x: {
        type: "int",
        segment: "local",
        index: 1,
      },
    };
    compiler.compileStatement(statement);
    expect(compiler.output).toEqual([
      "push local 0",
      "not",
      "if-goto Main_1",
      "push constant 4",
      "pop local 1",
      "goto Main_0",
      "label Main_1",
      "push constant 5",
      "pop local 1",
      "label Main_0",
    ]);
  });

  it.each(Object.keys(Programs))("%s", (program) => {
    const compiled = compile(
      Object.fromEntries(
        Object.entries(Programs[program]).map(([name, file]) => [
          name,
          file.jack,
        ]),
      ),
    );

    for (const file of Object.keys(compiled)) {
      expect(compiled[file]).toEqual(Programs[program][file].compiled);
    }
  });

  it("compiles a class with no fields", () => {
    const compiled = compile({
      NoField: `
        class NoField {
            constructor NoField new() {
                return this;
            }
            method void dispose() {
              do Memory.deAlloc(this);
              return;
            }
        }
      `,
      Main: `
        class Main {
            function void main() {
                var NoField z;
                let z = NoField.new();
                do z.dispose();
                return;
            }
        }
      `,
    });

    const noFieldVm = compiled["NoField"];
    expect(noFieldVm).toContain("function NoField.new 0");
    expect(noFieldVm).not.toContain("call Memory.alloc 1");
    expect(noFieldVm).toContain("function NoField.dispose 0");
    expect(noFieldVm).not.toContain("call Memory.deAlloc 1");

    const mainVm = compiled["Main"];
    expect(mainVm).toContain("function Main.main 1");
    expect(mainVm).toContain("call NoField.new 0");
    expect(mainVm).toContain("call NoField.dispose 1");
  });
});

describe("compiler diagnostics", () => {
  const lines = (...l: string[]) => l.join("\n");

  /** Each file's messages, or its VM text. */
  const messagesOf = (
    files: Record<string, string>,
    options?: { attemptRecovery?: boolean },
  ): Record<string, string | readonly string[]> =>
    Object.fromEntries(
      Object.entries(compile(files, options)).map(([name, compiled]) => [
        name,
        typeof compiled === "string"
          ? compiled
          : compiled.map(({ message }) => message),
      ]),
    );

  const mainOf = (...body: string[]) => lines("class Main {", ...body, "}");

  const STORY = mainOf(
    "  function void a() {", //  2
    "    return;", //             3
    "    let x = 1", //           4: no semicolon
    "  }", //                     5
    "  function void b() {", //  6
    "    let y = 2;", //          7: y is not declared
    "    return;", //             8
    "  }", //                     9
  );

  it.each([
    ["omitted", undefined],
    ["on", { attemptRecovery: true }],
  ])("checks a recovered file with recovery %s", (_name, options) => {
    const compiled = compile({ Main: STORY }, options).Main;

    expect(compiled).toMatchObject([
      { span: { line: 5 }, stage: "parse" },
      { message: "Line 7: Undeclared variable y", stage: "compile" },
    ]);
  });

  it("reports only the strict syntax error with recovery off", () => {
    const strict = JACK.parse(STORY);

    const compiled = compile({ Main: STORY }, { attemptRecovery: false });

    expect(compiled.Main).toEqual([strict.diagnostics[0]]);
  });

  it("keys diagnostics by file and keeps a clean file's text", () => {
    const files = {
      A: lines(
        "class A {",
        "  function void f() {",
        "    let a = 1;",
        "    return;",
        "  }",
        "}",
      ),
      B: lines(
        "class B {",
        "  function void f() {",
        "    let b = 1;",
        "    return;",
        "  }",
        "}",
      ),
      C: "class C { function void f() { return; } }",
    };

    const compiled = messagesOf(files);

    expect(compiled).toEqual({
      A: ["Line 3: Undeclared variable a"],
      B: ["Line 3: Undeclared variable b"],
      C: expect.stringContaining("function C.f 0"),
    });
  });

  it("reports two independent errors of one subroutine and withholds its text", () => {
    const source = mainOf(
      "  function void main() {",
      "    let a = 1;",
      "    do Nope.f();",
      "    return;",
      "  }",
    );

    const compiled = messagesOf({ Main: source });

    expect(compiled.Main).toEqual([
      "Line 3: Undeclared variable a",
      "Line 4: Class Nope doesn't exist",
    ]);
  });

  it("reports an undeclared use after a skipped statement of the same subroutine", () => {
    const source = mainOf(
      "  function void main() {",
      "    let x 1;",
      "    let y = 2;",
      "    return;",
      "  }",
    );

    const compiled = messagesOf({ Main: source });

    expect(compiled.Main).toHaveLength(2);
    expect(compiled.Main[1]).toBe("Line 4: Undeclared variable y");
  });

  it("reports an undeclared use after a nested skipped statement", () => {
    const source = mainOf(
      "  function void main() {",
      "    while (true) {",
      "      do f(;",
      "    }",
      "    let y = 2;",
      "    return;",
      "  }",
    );

    const compiled = messagesOf({ Main: source });

    expect(compiled.Main).toHaveLength(2);
    expect(compiled.Main[1]).toBe("Line 6: Undeclared variable y");
  });

  it("does not report a variable a skipped local declaration could declare", () => {
    const source = mainOf(
      "  function void a() {",
      "    var int;",
      "    let y = 2;",
      "    return;",
      "  }",
      "  function void b() {",
      "    let z = 2;",
      "    return;",
      "  }",
    );

    const compiled = messagesOf({ Main: source });

    // The skip's own subroutine is suppressed; the independent one is not.
    expect(compiled.Main).toHaveLength(2);
    expect(compiled.Main[1]).toBe("Line 8: Undeclared variable z");
  });

  it("does not report a variable a skipped class declaration could declare", () => {
    const source = mainOf(
      "  field int;",
      "  method void a() {",
      "    let y = 2;",
      "    return;",
      "  }",
      "  method void b() {",
      "    do y.f();",
      "    return;",
      "  }",
      "  function int c() {",
      "    return;",
      "  }",
    );

    const compiled = messagesOf({ Main: source });

    // Every subroutine of the class is suppressed; other checks still run.
    expect(compiled.Main).toHaveLength(2);
    expect(compiled.Main[1]).toBe(
      "Line 12: A non void subroutine must return a value",
    );
  });

  it("does not report a missing return when a skipped statement could return", () => {
    const skipped = mainOf(
      "  function int main() {",
      "    if (true) {",
      "      return 1",
      "    }",
      "  }",
    );
    const intact = skipped.replace("return 1", "let x = 1;");

    const compiled = messagesOf({ Main: skipped });
    const missing = messagesOf({ Main: intact });

    expect(compiled.Main).toHaveLength(1);
    expect(missing.Main).toEqual([
      "Line 2: Subroutine main: not all code paths return a value",
      "Line 4: Undeclared variable x",
    ]);
  });

  describe("across files", () => {
    const CALLER = lines(
      "class A {",
      "  function void f() {",
      "    var B b;",
      "    let b = B.make();",
      "    do b.g();",
      "    return;",
      "  }",
      "}",
    );

    it("does not report a subroutine a skipped header of its class could declare", () => {
      const B = lines(
        "class B {",
        "  function B make( { return null; }",
        "  method void g() { return; }",
        "}",
      );

      const compiled = messagesOf({ A: CALLER, B });

      expect(compiled.A).toEqual(expect.stringContaining("call B.make 0"));
      expect(compiled.B).toHaveLength(1);
    });

    it("reports a missing subroutine when its class only skipped a statement", () => {
      const B = lines(
        "class B {",
        "  method void g() {",
        "    let x 1;",
        "    return;",
        "  }",
        "}",
      );

      const compiled = messagesOf({ A: CALLER, B });

      expect(compiled.A).toEqual([
        "Line 4: Class B doesn't contain a function/constructor make",
      ]);
    });

    it("does not report a class whose file built no class", () => {
      const compiled = messagesOf({ A: CALLER, B: "class B" });

      expect(compiled.A).toEqual(expect.stringContaining("call B.g 1"));
      expect(compiled.B).toHaveLength(1);
    });

    it("reports a class no file declares", () => {
      const compiled = messagesOf({ A: CALLER });

      expect(compiled.A).toEqual([
        "Line 3: Unknown type B",
        "Line 4: Class B doesn't exist",
      ]);
    });
  });

  it("registers a variable of unknown type and checks later subroutines", () => {
    const source = mainOf(
      "  function void a() {",
      "    var Foo f;",
      "    let f = null;",
      "    do f.bar();",
      "    return;",
      "  }",
      "  function void b() {",
      "    let z = 1;",
      "    return;",
      "  }",
    );

    const compiled = messagesOf({ Main: source });

    // `f` is declared, and `f.bar` needs its invalid type, so is withheld.
    expect(compiled.Main).toEqual([
      "Line 3: Unknown type Foo",
      "Line 9: Undeclared variable z",
    ]);
  });

  it("checks the intact bodies of a failed condition", () => {
    const source = mainOf(
      "  function void main() {",
      "    if (p) {",
      "      let q = 1;",
      "    } else {",
      "      let r = 1;",
      "    }",
      "    while (s) {",
      "      let t = 1;",
      "    }",
      "    return;",
      "  }",
    );

    const compiled = messagesOf({ Main: source });

    expect(compiled.Main).toEqual([
      "Line 3: Undeclared variable p",
      "Line 4: Undeclared variable q",
      "Line 6: Undeclared variable r",
      "Line 8: Undeclared variable s",
      "Line 9: Undeclared variable t",
    ]);
  });

  it("reports every repeated subroutine and bad return", () => {
    const source = mainOf(
      "  function int a() { return; }",
      "  function void a() { return; }",
      "  function void a() { return; }",
    );

    const compiled = compile({ Main: source }).Main;

    expect(compiled).toMatchObject([
      { message: "Line 2: A non void subroutine must return a value" },
      { message: "Line 3: Subroutine a already declared", stage: "semantic" },
      { message: "Line 4: Subroutine a already declared", stage: "semantic" },
    ]);
  });

  it("reports an unexpected error as a spanless compile diagnostic", () => {
    const broken = {
      name: { value: "Main", span: { start: 0, end: 0, line: 1 } },
      varDecs: [],
      subroutines: [
        {
          type: "function",
          name: { value: "f" },
          returnType: { value: "void" },
          parameters: [],
        },
      ],
    } as unknown as Valid<Class>;

    const compiled = new Compiler().compile(broken);

    expect(compiled).toBeErr();
    if (!isErr(compiled)) return;
    expect(Err(compiled)).toEqual([
      { message: expect.any(String), stage: "compile" },
    ]);
  });

  it("finds no diagnostic in any course sample", () => {
    const diagnostics = Object.values(Programs).flatMap((files) =>
      Object.entries(
        compile(
          Object.fromEntries(
            Object.entries(files).map(([name, file]) => [name, file.jack]),
          ),
        ),
      ).filter(([, compiled]) => typeof compiled !== "string"),
    );

    expect(diagnostics).toEqual([]);
  });
});
