import { Err, isErr } from "@davidsouther/jiffies/result.ts";
import { Programs } from "@nand2tetris/projects/samples/project_11/index.js";
import { describe, expect, it } from "vitest";
import { type Valid } from "../languages/base.js";
import {
  DiagnosticCode,
  describeDiagnostic,
  Stage,
} from "../languages/diagnostic.js";
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

  describe.each([undefined, { attemptRecovery: true }])(
    "recovery %j",
    (options) => {
      it.each(Object.keys(Programs))("%s", (program) => {
        const compiled = compile(
          Object.fromEntries(
            Object.entries(Programs[program]).map(([name, file]) => [
              name,
              file.jack,
            ]),
          ),
          options,
        );

        for (const file of Object.keys(compiled)) {
          expect(compiled[file]).toEqual(Programs[program][file].compiled);
        }
      });
    },
  );

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

  const messagesOf = (
    files: Record<string, string>,
    options?: { attemptRecovery?: boolean },
  ): Record<string, string | readonly string[]> =>
    Object.fromEntries(
      Object.entries(compile(files, options)).map(([name, compiled]) => [
        name,
        typeof compiled === "string"
          ? compiled
          : compiled.map((found) => describeDiagnostic(found)),
      ]),
    );

  const mainOf = (...body: string[]) => lines("class Main {", ...body, "}");

  it.each([
    [
      "names that start with a keyword",
      ["var int trueValue, nullable, _x, do_it;", "let _x = trueValue;"],
    ],
    ["return before a parenthesis", ["return(1 + 1);"]],
  ])("accepts %s", (_case, body) => {
    const source = mainOf(
      "  function int main() {",
      ...body.map((line) => `    ${line}`),
      "    return 0;",
      "  }",
    );

    expect(typeof compile({ Main: source }).Main).toBe("string");
  });

  it("rejects a keyword glued to a word", () => {
    const source = mainOf("  function void main() {", "    returnx;", "  }");

    expect(messagesOf({ Main: source }).Main).toEqual([
      "Line 3: unknown statement returnx",
    ]);
  });

  it("reports an undeclared name once in each subroutine", () => {
    const source = mainOf(
      "  function void a() {",
      "    let x = 1;",
      "    let x = 2;",
      "    return;",
      "  }",
      "  function void b() {",
      "    let x = 3;",
      "    return;",
      "  }",
    );

    expect(messagesOf({ Main: source }).Main).toEqual([
      "Line 3: Undeclared variable x",
      "Line 8: Undeclared variable x",
    ]);
  });

  it("lets a method and a constructor use a field", () => {
    const source = mainOf(
      "  field int size;",
      "  constructor Main new() {",
      "    let size = 1;",
      "    return this;",
      "  }",
      "  method int get() {",
      "    return size;",
      "  }",
    );

    expect(typeof compile({ Main: source }).Main).toBe("string");
  });

  it("reports a missing subroutine of an OS class the program does not define", () => {
    const source = mainOf(
      "  function void main() {",
      "    do Math.squareroot(4);",
      "    return;",
      "  }",
    );

    expect(messagesOf({ Main: source }).Main).toEqual([
      "Line 3: Class Math doesn't contain a function/constructor squareroot",
    ]);
  });

  it("does not report a missing OS subroutine when its source class was lost", () => {
    const Main = mainOf(
      "  function void main() {",
      "    do Output.custom();",
      "    return;",
      "  }",
    );
    const Output = "class Output { function void custom(";

    const compiled = messagesOf({ Main, Output }, { attemptRecovery: true });

    expect(compiled.Main).toEqual(
      expect.stringContaining("call Output.custom 0"),
    );
    expect(compiled.Output).toHaveLength(1);
  });

  const STORY = mainOf(
    "  function void a() {",
    "    return;",
    "    let x = 1",
    "  }",
    "  function void b() {",
    "    let y = 2;",
    "    return;",
    "  }",
  );

  it("reports only the strict syntax error when recovery is omitted", () => {
    expect(compile({ Main: STORY }).Main).toEqual(
      JACK.parse(STORY).diagnostics,
    );
  });

  it("checks independent subroutines when recovery is enabled and withholds VM text", () => {
    const compiled = compile({ Main: STORY }, { attemptRecovery: true }).Main;
    expect(compiled).toHaveLength(3);
    expect(compiled).toMatchObject([
      {
        code: DiagnosticCode.Jack.UNDECLARED_VARIABLE,
        args: { name: "x" },
        span: { line: 4 },
        stage: Stage.COMPILE,
      },
      { span: { line: 4 }, stage: Stage.PARSE },
      {
        code: DiagnosticCode.Jack.UNDECLARED_VARIABLE,
        args: { name: "y" },
        span: { line: 7 },
        stage: Stage.COMPILE,
      },
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

    const compiled = messagesOf(files, { attemptRecovery: true });

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

    const compiled = messagesOf({ Main: source }, { attemptRecovery: true });

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

    const compiled = messagesOf({ Main: source }, { attemptRecovery: true });

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

    const compiled = messagesOf({ Main: source }, { attemptRecovery: true });

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

    const compiled = messagesOf({ Main: source }, { attemptRecovery: true });

    expect(compiled.Main).toHaveLength(2);
    expect(compiled.Main[1]).toBe("Line 8: Undeclared variable z");
  });

  it.each(["f", "g"])(
    "reports an undeclared variable in a later %s after a damaged local declaration in f",
    (name) => {
      const source = mainOf(
        "  function void f() {",
        "    var int;",
        "    let y = 1;",
        "    return;",
        "  }",
        `  function void ${name}() {`,
        "    let y = 2;",
        "    return;",
        "  }",
      );

      const compiled = compile({ Main: source }, { attemptRecovery: true });

      expect(compiled.Main).toMatchObject([
        { stage: Stage.PARSE, span: { line: 3 } },
        ...(name === "f"
          ? [{ code: DiagnosticCode.Jack.DUPLICATE_SUBROUTINE, args: { name } }]
          : []),
        {
          code: DiagnosticCode.Jack.UNDECLARED_VARIABLE,
          args: { name: "y" },
          span: { line: 8 },
        },
      ]);
    },
  );

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

    const compiled = messagesOf({ Main: source }, { attemptRecovery: true });

    expect(compiled.Main).toHaveLength(2);
    expect(compiled.Main[1]).toBe(
      "Line 12: A non void subroutine must return a value",
    );
  });

  it("does not report a missing return when a skipped statement could return", () => {
    const skipped = mainOf(
      "  function int main() {",
      "    if (true) {",
      "      return ???;",
      "    }",
      "  }",
    );
    const intact = skipped.replace("return ???;", "let x = 1;");

    const compiled = messagesOf({ Main: skipped }, { attemptRecovery: true });
    const missing = messagesOf({ Main: intact }, { attemptRecovery: true });

    expect(compiled.Main).toHaveLength(1);
    expect(missing.Main).toEqual([
      "Line 4: Undeclared variable x",
      "Line 6: Subroutine main: not all code paths return a value",
    ]);
  });

  it.each(["f", "g"])(
    "reports a missing return in a later %s after a skipped return in f",
    (name) => {
      const source = mainOf(
        "  function int f() {",
        "    if (true) {",
        "      return ???;",
        "    }",
        "  }",
        `  function int ${name}() {`,
        "  }",
      );

      const compiled = compile({ Main: source }, { attemptRecovery: true });

      expect(compiled.Main).toMatchObject([
        { stage: Stage.PARSE, span: { line: 4 } },
        ...(name === "f"
          ? [{ code: DiagnosticCode.Jack.DUPLICATE_SUBROUTINE, args: { name } }]
          : []),
        {
          code: DiagnosticCode.Jack.MISSING_RETURN_PATH,
          args: { name },
          span: { line: 8 },
        },
      ]);
    },
  );

  describe("a damaged class header", () => {
    it("checks a class whose header lost its name under its file's name", () => {
      const source = lines(
        "class {",
        "  function void a() {",
        "    let y = 2;",
        "    return;",
        "  }",
        "}",
      );

      const compiled = messagesOf({ Main: source }, { attemptRecovery: true });

      expect(compiled.Main).toEqual([
        "Line 1: expected a name",
        "Line 3: Undeclared variable y",
      ]);
    });

    it("serves a class whose header lost its name to its callers", () => {
      const caller = lines(
        "class A {",
        "  function void f() {",
        "    var B b;",
        "    let b = B.make();",
        "    do b.g();",
        "    do B.h();",
        "    return;",
        "  }",
        "}",
      );
      const B = lines(
        "class 1B {",
        "  function B make() { return null; }",
        "  method void g() { return; }",
        "}",
      );

      const compiled = messagesOf({ A: caller, B }, { attemptRecovery: true });

      expect(compiled.A).toEqual([
        "Line 6: Class B doesn't contain a function/constructor h",
      ]);
      expect(compiled.B).toEqual(["Line 1: expected a name"]);
    });

    it("does not report an undeclared variable a skipped class start could declare", () => {
      const source = lines(
        "class Main",
        "  field int x;",
        "  method void a() {",
        "    let x = 1;",
        "    return;",
        "  }",
        "  function int b() {",
        "    let x = 2;",
        "  }",
        "}",
      );

      const compiled = messagesOf({ Main: source }, { attemptRecovery: true });

      expect(compiled.Main).toEqual([
        'Line 1: expected "{"',
        "Line 9: Subroutine b: not all code paths return a value",
      ]);
    });
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

      const compiled = messagesOf({ A: CALLER, B }, { attemptRecovery: true });

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

      const compiled = messagesOf({ A: CALLER, B }, { attemptRecovery: true });

      expect(compiled.A).toEqual([
        "Line 4: Class B doesn't contain a function/constructor make",
      ]);
    });

    it("leaves a class with no matching closer out of the class table", () => {
      const B = lines("class B {", "  field int x;", "  field Nope y;");

      const compiled = messagesOf({ A: CALLER, B }, { attemptRecovery: true });

      expect(compiled.A).toEqual(expect.stringContaining("call B.g 1"));
      expect(compiled.B).toEqual(['Line 3: expected "}"']);
    });

    it("does not report a class whose file built no class", () => {
      const compiled = messagesOf(
        { A: CALLER, B: "class" },
        { attemptRecovery: true },
      );

      expect(compiled.A).toEqual(expect.stringContaining("call B.g 1"));
      expect(compiled.B).toHaveLength(1);
    });

    it("reports a class no file declares", () => {
      const compiled = messagesOf({ A: CALLER }, { attemptRecovery: true });

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

    const compiled = messagesOf({ Main: source }, { attemptRecovery: true });

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

    const compiled = messagesOf({ Main: source }, { attemptRecovery: true });

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

    const compiled = compile({ Main: source }, { attemptRecovery: true }).Main;

    expect(compiled).toMatchObject([
      { code: DiagnosticCode.Jack.MISSING_RETURN_VALUE, span: { line: 2 } },
      {
        code: DiagnosticCode.Jack.DUPLICATE_SUBROUTINE,
        args: { name: "a" },
        span: { line: 3 },
        stage: Stage.SEMANTIC,
      },
      {
        code: DiagnosticCode.Jack.DUPLICATE_SUBROUTINE,
        args: { name: "a" },
        span: { line: 4 },
        stage: Stage.SEMANTIC,
      },
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
      {
        code: DiagnosticCode.Error.UNEXPECTED,
        args: { message: expect.any(String) },
        stage: Stage.COMPILE,
      },
    ]);
  });
});

describe("Jack diagnostic wording and position", () => {
  const lines = (...l: string[]) => l.join("\n");

  const messagesOf = (source: string, attemptRecovery = false) =>
    Object.values(compile({ Main: source }, { attemptRecovery })).flatMap(
      (compiled) =>
        typeof compiled === "string"
          ? []
          : compiled.map((found) => describeDiagnostic(found)),
    );

  /** `Main.main` with `body` indented as its statements. */
  const mainWith = (...body: string[]) =>
    lines("class Main {", "    function void main() {", ...body, "    }", "}");

  const operators = '"=", ">", "<", "|", "&", "/", "*", "-", or "+"';

  it("reports a missing ) after an if condition on the condition line", () => {
    const source = mainWith(
      "        var int x;",
      "        let x = 0;",
      "        if (x < 5",
      "        {",
      "            let x = 1;",
      "        }",
      "        return;",
    );

    expect(messagesOf(source)).toEqual([`Line 5: expected ")", ${operators}`]);
  });

  it("reports a missing { after the class name on the class line", () => {
    const source = lines(
      "class Main",
      "    function void main() {",
      "        return;",
      "    }",
      "}",
    );

    expect(messagesOf(source)).toEqual(['Line 1: expected "{"']);
  });

  it("uses the singular for an expected count of one argument", () => {
    const source = mainWith(
      "        do Output.printInt(1, 2);",
      "        return;",
    );

    expect(messagesOf(source)).toEqual([
      "Line 3: Output.printInt expected 1 argument, got 2",
    ]);
  });

  it("names the class and subroutine of a misspelled OS call", () => {
    const source = mainWith("        do Output.prnt(5);", "        return;");

    expect(messagesOf(source)).toEqual([
      "Line 3: Class Output doesn't contain a function/constructor prnt",
    ]);
  });

  it("reports an undeclared variable once, at its first use", () => {
    const source = mainWith(
      "        var int cuont;",
      "        let count = 0;",
      "        let count = count + 1;",
      "        do Output.printInt(count);",
      "        let count = count * 2;",
      "        return;",
    );

    expect(messagesOf(source)).toEqual(["Line 4: Undeclared variable count"]);
  });

  it("reports an extra } as an early subroutine close: a missing return and an unexpected statement, with recovery", () => {
    const source = mainWith(
      "        var int x;",
      "        if (true) { let x = 1; }}",
      "        return;",
    );

    expect(messagesOf(source, true)).toEqual([
      "Line 4: Subroutine main: not all code paths return a value",
      'Line 4: expected "}", "method", "function", or "constructor"',
    ]);
  });

  it("accepts a name that starts with a keyword constant", () => {
    const source = mainWith(
      "        var boolean trueValue, x;",
      "        let trueValue = true;",
      "        let x = trueValue;",
      "        return;",
    );

    expect(messagesOf(source)).toEqual([]);
  });

  it("reports each use of a keyword as a variable name with recovery", () => {
    const source = mainWith(
      "        var int let;",
      "        let let = 5;",
      "        return;",
    );

    expect(messagesOf(source, true)).toEqual([
      "Line 3: expected a name that is not a keyword",
      "Line 4: expected a name that is not a keyword",
    ]);
  });

  it("accepts a name that starts with _ with recovery", () => {
    const source = mainWith(
      "        var int _x;",
      "        let _x = 1;",
      "        return;",
    );

    expect(messagesOf(source, true)).toEqual([]);
  });

  it("accepts return( with no space", () => {
    const source = lines(
      "class Main {",
      "    function int twice(int x) {",
      "        return(x + x);",
      "    }",
      "    function void main() {",
      "        do Output.printInt(Main.twice(2));",
      "        return;",
      "    }",
      "}",
    );

    expect(messagesOf(source)).toEqual([]);
  });

  it("accepts a space before [", () => {
    const source = mainWith(
      "        var Array a;",
      "        let a = Array.new(3);",
      "        let a [1] = 2;",
      "        return;",
    );

    expect(messagesOf(source)).toEqual([]);
  });

  it("reports a missing { after while once, on its line, with recovery", () => {
    const source = mainWith(
      "        var int x;",
      "        let x = 0;",
      "        while (x < 5)",
      "            let x = x + 1;",
      "        }",
      "        return;",
    );

    expect(messagesOf(source, true)).toEqual(['Line 5: expected "{"']);
  });

  it("reports each of two consecutive missing ; with recovery", () => {
    const source = mainWith(
      "        var int x;",
      "        let x = 5",
      "        do Output.printInt(x)",
      "        return;",
    );

    expect(messagesOf(source, true)).toEqual([
      `Line 4: expected ";", ${operators}`,
      'Line 5: expected ";"',
    ]);
  });

  it("rejects a field used in a function", () => {
    const source = lines(
      "class Main {",
      "    field int size;",
      "    function void main() {",
      "        let size = 1;",
      "        return;",
      "    }",
      "}",
    );

    expect(messagesOf(source)).toEqual([
      "Line 4: Function main cannot use field size",
    ]);
  });

  it("reports a misspelled let as an unknown statement", () => {
    const source = mainWith(
      "        var int x;",
      "        lett x = 5;",
      "        return;",
    );

    expect(messagesOf(source)).toEqual(["Line 4: unknown statement lett"]);
  });

  it("expects a variable name after var with no type", () => {
    const source = mainWith("        var x;", "        return;");

    expect(messagesOf(source)).toEqual(["Line 3: expected a variable name"]);
  });

  it("accepts spaces around . in a subroutine call", () => {
    const source = mainWith(
      "        do Output . printInt(1);",
      "        return;",
    );

    expect(messagesOf(source)).toEqual([]);
  });
});
