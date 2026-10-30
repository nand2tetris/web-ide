import { isErr, unwrap } from "@davidsouther/jiffies/result.ts";
import { expect, test } from "vitest";
import { compile } from "../jack/compiler.js";
import { VM } from "../languages/vm.js";
import { Vm } from "../vm/vm.js";

// The projects/12 OutputTest Main.jack compiles and runs to exit code 0
// against the built-in OS.
const MAIN =
  String.raw`class Main {
    function void main() {
        var String s;
        let s = String.new(1);
        do s.appendChar(String.doubleQuote());
        do Output.moveCursor(0, 63);
        do Output.printChar(66);
        do Output.moveCursor(22, 0);
        do Output.printChar(67);
        do Output.moveCursor(22, 63);
        do Output.printChar(68);
        do Output.printChar(65);
        do Output.moveCursor(2, 0);
        do Output.printString("0123456789");
        do Output.println();
        do Output.printString("ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz");
        do Output.println();
        do Output.printString("!#$%&'()*+,-./:;<=>?@[\]^_` +
  "`" +
  String.raw`{|}~");
        do Output.printString(s);
        do Output.println();
        do Output.printInt(-12345);
        do Output.backSpace();
        do Output.printInt(6789);
        return;
    }
}`;

test("OutputTest Main.jack runs to completion without a Sys error", () => {
  const compiled = compile({ Main: MAIN });
  const files = Object.entries(compiled).map(([name, vm]) => {
    if (typeof vm !== "string") throw new Error(JSON.stringify(vm));
    return { name, instructions: unwrap(VM.parse(vm)).instructions };
  });
  const built = Vm.buildFromFiles(files);
  expect(isErr(built)).toBe(false);
  const vm = unwrap(built);
  let exitCode: number | undefined;
  for (let steps = 0; steps < 2_000_000 && exitCode === undefined; steps++) {
    exitCode = vm.step();
  }
  expect(exitCode).toBe(0);
});
