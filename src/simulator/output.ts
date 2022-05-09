import { assert } from "@davidsouther/jiffies/assert.js";
import { bin, dec, hex } from "../util/twos.js";
import { Test } from "./tst.js";

export class Output {
  private readonly fmt: "B" | "X" | "D" | "S";
  private readonly lPad: number;
  private readonly rPad: number;
  private readonly len: number;

  // new Output(inst.id, inst.style, inst.width, inst.lpad, inst.rpad)
  constructor(
    private variable: string,
    private format = "%B1.1.1",
    len?: number,
    lPad?: number,
    rPad?: number
  ) {
    if (
      format.startsWith("%") &&
      len == undefined &&
      lPad == undefined &&
      rPad == undefined
    ) {
      const { fmt, lPad, rPad, len } = format.match(
        /^%(?<fmt>[BDXS])(?<lPad>\d+)\.(?<len>\d+)\.(?<rPad>\d+)$/
      )?.groups as {
        fmt: "B" | "X" | "D" | "S";
        lPad: string;
        rPad: string;
        len: string;
      };
      this.fmt = fmt;
      this.lPad = parseInt(lPad);
      this.rPad = parseInt(rPad);
      this.len = parseInt(len);
    } else {
      assert(["B", "X", "D", "S"].includes(format[0]));
      this.fmt = format[0] as "B" | "X" | "D" | "S";
      this.len = len ?? 3;
      this.lPad = lPad ?? 1;
      this.rPad = rPad ?? 1;
    }
  }

  header(test: Test) {
    return this.pad(this.variable);
  }

  print(test: Test) {
    const val = test.getVar(this.variable);
    const fmt = { B: bin, D: dec, X: hex, S: (i: number) => `${i}` }[this.fmt];
    let value = fmt(val);
    return this.pad(value.slice(value.length - this.len));
  }

  private pad(value: string) {
    const space = this.lPad + this.len + this.rPad;
    const leftSpace = Math.floor((space - value.length) / 2);
    const rightSpace = space - leftSpace - value.length;
    const padLeft = leftSpace + value.length;
    const padRight = padLeft + rightSpace;
    value = value.padStart(padLeft);
    value = value.padEnd(padRight);
    return value;
  }
}
