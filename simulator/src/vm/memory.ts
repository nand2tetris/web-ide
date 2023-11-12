import { RAM } from "../cpu/memory.js";
import { Segment } from "./vm.js";

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
  get LCL(): number {
    return this.get(LCL);
  }
  get ARG(): number {
    return this.get(ARG);
  }
  get THIS(): number {
    return this.get(THIS);
  }
  get THAT(): number {
    return this.get(THAT);
  }

  get state() {
    const temps = [];
    for (let i = 5; i < 13; i++) {
      temps.push(this.get(i));
    }
    const internal = [];
    for (let i = 13; i < 16; i++) {
      internal.push(i);
    }
    return {
      ["0: SP"]: this.SP,
      ["1: LCL"]: this.LCL,
      ["2: ARG"]: this.ARG,
      ["3: THIS"]: this.THIS,
      ["4: THAT"]: this.THAT,
      TEMPS: temps,
      VM: internal,
    };
  }

  get statics() {
    const statics = [];
    for (let i = 16; i < 256; i++) {
      statics.push(this.get(i));
    }
    return statics;
  }

  get frame() {
    // Arg0 Arg1... RET LCL ARG THIS THAT [SP]
    const args = [];
    for (let i = this.ARG; i < this.LCL - 5; i++) {
      args.push(this.get(i));
    }
    const locals = [];
    for (let i = this.LCL; i < this.SP; i++) {
      locals.push(this.get(i));
    }
    const _this = [];
    for (let i = 0; i < 5; i++) {
      _this.push(this.this(i));
    }
    return {
      args,
      locals,
      this: _this,
    };
  }

  constructor() {
    super();
    this.set(SP, 256);
  }

  baseSegment(segment: Segment, offset: number): number {
    switch (segment) {
      case "argument":
        return this.ARG + offset;
      case "constant":
        return offset;
      case "local":
        return this.LCL + offset;
      case "pointer":
        return this.pointer(offset);
      case "static":
        return 16 + offset;
      case "temp":
        return 5 + offset;
      case "that":
        return this.THAT + offset;
      case "this":
        return this.THIS + offset;
    }
  }

  getSegment(segment: Segment, offset: number): number {
    if (segment === "constant") return offset;
    const base = this.baseSegment(segment, offset);
    return this.get(base);
  }
  setSegment(segment: Segment, offset: number, value: number) {
    const base = this.baseSegment(segment, offset);
    this.set(base, value);
  }

  argument(offset: number): number {
    if (this.strict && offset < 0)
      throw new Error(`Cannot access negative offsets: ${offset}`);
    return this.get(this.ARG + offset);
  }
  local(offset: number): number {
    if (this.strict && offset < 0)
      throw new Error(`Cannot access negative offsets: ${offset}`);
    return this.get(this.LCL + offset);
  }
  static(offset: number): number {
    if (this.strict && offset < 0)
      throw new Error(`Cannot access negative offsets: ${offset}`);
    if (this.strict && offset > 255 - 16)
      throw new Error(`Cannot access statics beyond 239: ${offset}`);
    return this.get(16 + offset);
  }
  constant(offset: number): number {
    return offset;
  }
  this(offset: number): number {
    if (this.strict && offset < 0)
      throw new Error(`Cannot access negative offsets: ${offset}`);
    return this.get(this.THIS + offset);
  }
  that(offset: number): number {
    if (this.strict && offset < 0)
      throw new Error(`Cannot access negative offsets: ${offset}`);
    return this.get(this.THAT + offset);
  }
  pointer(offset: number): number {
    if (this.strict && offset < 0)
      throw new Error(`Cannot access negative offsets: ${offset}`);
    if (this.strict && offset > 1)
      throw new Error(
        `pointer out of bounds access (pointer can be 0 for this, 1 for that, but got ${offset}`
      );
    return offset === 0 ? THIS : THAT;
  }
  temp(offset: number): number {
    if (this.strict && offset < 0)
      throw new Error(`Cannot access negative offsets: ${offset}`);
    if (this.strict && offset > 7)
      throw new Error(
        `Temp out of bounds access (temp can be 0 to 7, but got ${offset}`
      );
    return this.get(5 + offset);
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
  pushFrame(ret: number, nArgs: number, nLocals: number) {
    const arg = this.SP - nArgs;
    let sp = this.SP + 5;
    this.set(sp - 5, ret);
    this.set(sp - 4, this.LCL);
    this.set(sp - 3, this.ARG);
    this.set(sp - 2, this.THIS);
    this.set(sp - 1, this.THAT);

    this.set(ARG, arg);
    this.set(LCL, sp);

    // Technically this happens in the function, but the VM will handle it for free
    for (let i = 0; i < nLocals; i++) {
      this.set(sp, 0);
      sp += 1;
    }
    this.set(SP, sp);
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
