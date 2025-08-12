import { assert } from "@davidsouther/jiffies/lib/esm/assert.js";
import { Test } from "./test/tst.js";
import { bin, dec, hex } from "./util/twos.js";

export class Output {
  private readonly fmt: "B" | "X" | "D" | "S";
  private readonly lPad: number;
  private readonly rPad: number;
  private readonly len: number;
  private readonly index: number;
  private readonly builtin: boolean;

  // new Output(inst.id, inst.style, inst.width, inst.lpad, inst.rpad)
  constructor(
    private variable: string,
    format = "%B1.1.1",
    len?: number,
    lPad?: number,
    rPad?: number,
    builtin?: boolean,
    index?: number,
  ) {
    if (
      format.startsWith("%") &&
      len === undefined &&
      lPad === undefined &&
      rPad === undefined
    ) {
      const { fmt, lPad, rPad, len } = format.match(
        /^%(?<fmt>[BDXS])(?<lPad>\d+)\.(?<len>\d+)\.(?<rPad>\d+)$/,
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
      this.builtin = false;
      this.index = -1;
    } else {
      assert(["B", "X", "D", "S"].includes(format[0]));
      this.fmt = format[0] as "B" | "X" | "D" | "S";
      this.len = len ?? 3;
      this.lPad = lPad ?? 1;
      this.rPad = rPad ?? 1;
      this.builtin = builtin ?? false;
      this.index = index ?? -1;
    }
  }

  header(test: Test) {
    let variable = `${this.variable}`;
    if (this.builtin) {
      const index = this.index >= 0 ? this.index : "";
      variable = `${variable}[${index}]`;
    }
    if (variable.length > this.len + this.lPad + this.rPad) {
      return variable.substring(0, this.len + this.lPad + this.rPad);
    }
    return this.padCenter(variable);
  }

  print(test: Test) {
    const val = test.getVar(this.variable, this.index);
    if (this.fmt === "S") {
      return this.padLeft(val as string);
    }

    const fmt = { B: bin, D: dec, X: hex }[this.fmt];
    const value = fmt(val as number);
    if (this.fmt === "D") {
      return this.padRight(value);
    } else {
      return this.padLeft(value.slice(value.length - this.len));
    }
  }

  private padCenter(value: string) {
    const space = this.lPad + this.len + this.rPad;
    const leftSpace = Math.floor((space - value.length) / 2);
    const rightSpace = space - leftSpace - value.length;
    const padLeft = leftSpace + value.length;
    const padRight = padLeft + rightSpace;
    value = value.padStart(padLeft);
    value = value.padEnd(padRight);
    return value;
  }

  private padLeft(value: string) {
    value = value.substring(0, this.len);
    const padRight = this.rPad + this.len;
    const padLeft = this.lPad + padRight;
    value = value.padEnd(padRight);
    value = value.padStart(padLeft);
    return value;
  }

  private padRight(value: string) {
    value = value.substring(0, this.len);
    const padLeft = this.lPad + this.len;
    const padRight = this.rPad + padLeft;
    value = value.padStart(padLeft);
    value = value.padEnd(padRight);
    return value;
  }
}
