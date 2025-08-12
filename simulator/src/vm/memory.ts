import {
  Err,
  isErr,
  Ok,
  Result,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { RAM } from "../cpu/memory.js";
import { Segment } from "../languages/vm.js";
import { VmFrame } from "./vm.js";

export const SP = 0;
export const LCL = 1;
export const ARG = 2;
export const THIS = 3;
export const THAT = 4;
export const TEMP = 5;
export const STATIC = 16;

export class VmMemory extends RAM {
  strict = true;
  get SP(): number {
    return this.get(SP);
  }
  set SP(value: number) {
    this.set(SP, value);
  }
  get LCL(): number {
    return this.get(LCL);
  }
  set LCL(value: number) {
    this.set(LCL, value);
  }
  get ARG(): number {
    return this.get(ARG);
  }
  set ARG(value: number) {
    this.set(ARG, value);
  }
  get THIS(): number {
    return this.get(THIS);
  }
  set THIS(value: number) {
    this.set(THIS, value);
  }
  get THAT(): number {
    return this.get(THAT);
  }
  set THAT(value: number) {
    this.set(THAT, value);
  }

  get statics() {
    const statics = [];
    for (let i = 16; i < 256; i++) {
      statics.push(this.get(i));
    }
    return statics;
  }

  constructor() {
    super();
    this.set(SP, 256);
  }

  baseSegment(segment: Segment, offset: number): Result<number, Error> {
    if (this.strict && (offset < 0 || offset > 32767))
      return Err(
        new Error(
          `Illegal offset value ${offset} (must be between 0 and 32767)`,
        ),
      );
    switch (segment) {
      case "argument":
        return Ok(this.ARG + offset);
      case "constant":
        return Ok(offset);
      case "local":
        return Ok(this.LCL + offset);
      case "pointer":
        if (this.strict && offset > 1)
          throw new Error(
            `pointer out of bounds access (pointer can be 0 for this, 1 for that, but got ${offset}`,
          );
        return Ok(offset === 0 ? THIS : THAT);
      case "static":
        if (this.strict && offset > 255 - 16)
          return Err(new Error(`Cannot access statics beyond 239: ${offset}`));
        return Ok(16 + offset);
      case "temp":
        if (this.strict && offset > 7)
          return Err(
            new Error(
              `Temp out of bounds access (temp can be 0 to 7, but got ${offset}`,
            ),
          );
        return Ok(5 + offset);
      case "that":
        return Ok(this.THAT + offset);
      case "this":
        return Ok(this.THIS + offset);
    }
  }

  getSegment(segment: Segment, offset: number): number {
    if (segment === "constant") {
      if (this.strict && (offset < 0 || offset > 32767))
        throw new Error(
          `Illegal offset value ${offset} (must be between 0 and 32767)`,
        );
      return offset;
    }
    const base = this.baseSegment(segment, offset);
    if (isErr(base)) {
      throw Err(base);
    }
    return this.get(Ok(base));
  }
  setSegment(segment: Segment, offset: number, value: number) {
    const base = this.baseSegment(segment, offset);
    if (isErr(base)) {
      throw Err(base);
    }
    this.set(Ok(base), value);
  }

  argument(offset: number): number {
    return this.getSegment("argument", offset);
  }
  local(offset: number): number {
    return this.getSegment("local", offset);
  }
  static(offset: number): number {
    return this.getSegment("static", offset);
  }
  constant(offset: number): number {
    return this.getSegment("constant", offset);
  }
  this(offset: number): number {
    return this.getSegment("this", offset);
  }
  that(offset: number): number {
    return this.getSegment("that", offset);
  }
  pointer(offset: number): number {
    return this.getSegment("pointer", offset);
  }
  temp(offset: number): number {
    return this.getSegment("temp", offset);
  }

  push(value: number) {
    const sp = this.SP;
    this.set(sp, value);
    this.set(0, sp + 1);
  }
  pop(): number {
    if (this.strict && this.SP === 256)
      throw new Error(`Cannot pop the stack below 256 in strict mode`);
    this.set(0, this.SP - 1);
    const value = this.get(this.SP);
    return value;
  }
  // Stack frame, from figure 8.3, is:
  // [ARG] Arg0 Arg1... RET LCL ARG THIS THAT [LCL] Local0 Local1... [SP]
  pushFrame(ret: number, nArgs: number, nLocals: number): number {
    const base = this.SP;
    const arg = base - nArgs;
    this.set(base, ret);
    this.set(base + 1, this.LCL);
    this.set(base + 2, this.ARG);
    this.set(base + 3, this.THIS);
    this.set(base + 4, this.THAT);

    this.set(ARG, arg);
    this.set(LCL, base + 5);

    const sp = base + 5;
    // Technically this happens in the function, but the VM will handle it for free
    for (let i = 0; i < nLocals; i++) {
      this.set(sp + i, 0);
    }
    this.set(SP, sp + nLocals);
    return base;
  }

  popFrame(): number {
    const frame = this.LCL;
    const ret = this.get(frame - 5);
    const value = this.pop();
    this.set(this.ARG, value);
    this.set(SP, this.ARG + 1);
    this.set(THAT, this.get(frame - 1));
    this.set(THIS, this.get(frame - 2));
    this.set(ARG, this.get(frame - 3));
    this.set(LCL, this.get(frame - 4));
    return ret;
  }

  getFrame(
    base: number, // The address of the frame, the RET address
    argN: number, // The number of arguments to this frame
    localN: number, // The number of locals in this frame
    thisN: number, // The number of items in `this`
    thatN: number, // the number of items in `that`
    nextFrame: number,
  ): VmFrame {
    const arg = base - argN;
    const lcl = base + 5;
    const stk = lcl + localN;
    const stackN = nextFrame - stk;
    const args = [...this.map((_, v) => v, arg, arg + argN)];
    const locals = [...this.map((_, v) => v, lcl, lcl + localN)];
    const stack = [...this.map((_, v) => v, stk, stk + stackN)];
    const this_ = [...this.map((_, v) => v, this.THIS, this.THIS + thisN)];
    const that = [...this.map((_, v) => v, this.THAT, this.THAT + thatN)];
    return {
      args: { base: arg, count: argN, values: args },
      locals: { base: lcl, count: localN, values: locals },
      stack: { base: stk, count: stackN, values: stack },
      this: { base: stk, count: thisN, values: this_ },
      that: { base: stk, count: thatN, values: that },
      frame: {
        RET: this.get(base),
        LCL: this.LCL,
        ARG: this.ARG,
        THIS: this.THIS,
        THAT: this.THAT,
      },
    };
  }

  getVmState(staticN = 240) {
    const temps = [...this.map((_, v) => v, 5, 13)];
    const internal = [...this.map((_, v) => v, 13, 16)];
    const statics = [...this.map((_, v) => v, 16, 16 + staticN)];
    return {
      ["0: SP"]: this.SP,
      ["1: LCL"]: this.LCL,
      ["2: ARG"]: this.ARG,
      ["3: THIS"]: this.THIS,
      ["4: THAT"]: this.THAT,
      temps,
      internal,
      static: statics,
    };
  }

  binOp(fn: (a: number, b: number) => number) {
    const a = this.get(this.SP - 2);
    const b = this.get(this.SP - 1);
    const v = fn(a, b) & 0xffff;
    this.set(this.SP - 2, v);
    this.set(SP, this.SP - 1);
  }
  unOp(fn: (a: number) => number) {
    const a = this.get(this.SP - 1);
    const v = fn(a) & 0xffff;
    this.set(this.SP - 1, v);
  }
  comp(fn: (a: number, b: number) => boolean) {
    this.binOp((a, b) => (fn(a, b) ? -1 : 0));
  }
}
