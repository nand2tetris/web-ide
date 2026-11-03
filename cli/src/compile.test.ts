import { describe, expect, it } from "vitest";
import { compileJack, describeDiagnostic } from "./compile.js";

const lines = (...l: string[]) => l.join("\n");

const main = lines(
  "class Main {",
  "  function void a() {",
  "    return;",
  "    let x = 1", // line 4: syntax error, no semicolon
  "  }",
  "  function void b() {",
  "    let y = 2;", // line 7: y is not declared
  "    return;",
  "  }",
  "}",
);
const util = lines(
  "class Util {",
  "  function void c() {",
  "    return;",
  "  }",
  "}",
);

describe("compiling a folder of Jack files", () => {
  it("lists every diagnostic of a file in order, each at its line, and withholds that file's VM", () => {
    const { vm, errors } = compileJack(
      { Main: main, Util: util },
      { attemptRecovery: true },
    );

    expect(errors).toHaveLength(2);
    expect(errors[0]).toMatch(/^Main\.jack:[45]: /);
    expect(errors[1]).toBe("Main.jack:7: Undeclared variable y");
    expect(Object.keys(vm)).toEqual(["Util"]);
  });
});

describe("compiling without recovery", () => {
  it("lists only the syntax error of a file", () => {
    const { vm, errors } = compileJack(
      { Main: main, Util: util },
      { attemptRecovery: false },
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^Main\.jack:[45]: /);
    expect(Object.keys(vm)).toEqual(["Util"]);
  });
});

describe("an error line", () => {
  it("names the file alone when the diagnostic has no location", () => {
    expect(describeDiagnostic("Main", { message: "No main function" })).toBe(
      "Main.jack: No main function",
    );
  });
});
