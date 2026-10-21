// Repro for nand2tetris/web-ide#488: Project 12 OutputTest Main.jack gives ERR 14
// RESULT: not reproducible with the builtin OS (passes).
import { isErr, unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { expect, test } from "vitest";
import { compile } from "../jack/compiler.js";
import { VM } from "../languages/vm.js";
import { Vm } from "./vm.js";

const MAIN = `class Main {
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
        do Output.printString("!#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~");
        do Output.printString(s);
        do Output.println();
        do Output.printInt(-12345);
        do Output.backSpace();
        do Output.printInt(6789);
        return;
    }
}`;

test("#488 OutputTest Main.jack does not raise ERR 14 on builtin OS", () => {
  const out = compile({ Main: MAIN });
  expect(isErr(out.Main as never)).toBe(false);
  const parsed = unwrap(VM.parse(out.Main as string));
  const vm = unwrap(
    Vm.buildFromFiles([{ name: "Main", instructions: parsed.instructions }]),
  );
  let code: number | undefined;
  for (let i = 0; i < 200000 && code === undefined; i++) code = vm.step();
  expect(code).not.toBe(14);
});
