import { Programs } from "@nand2tetris/projects/samples/project_11/index.js";
import { JACK } from "../languages/jack";
import { Compiler, compile } from "./compiler";

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
});
