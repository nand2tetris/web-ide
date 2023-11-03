import { RAM } from "../cpu/memory.js";
import { FunctionInstruction, VmInstruction } from "../languages/vm.js";

const SP = 0;
const LCL = 1;
const ARG = 2;
const THIS = 3;
const THAT = 4;

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

  baseSegment(
    segment:
      | "argument"
      | "local"
      | "static"
      | "constant"
      | "this"
      | "that"
      | "pointer"
      | "temp",
    offset: number
  ): number {
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

  getSegment(
    segment:
      | "argument"
      | "local"
      | "static"
      | "constant"
      | "this"
      | "that"
      | "pointer"
      | "temp",
    offset: number
  ): number {
    if (segment === "constant") return offset;
    const base = this.baseSegment(segment, offset);
    return this.get(base);
  }
  setSegment(
    segment:
      | "argument"
      | "local"
      | "static"
      | "constant"
      | "this"
      | "that"
      | "pointer"
      | "temp",
    offset: number,
    value: number
  ) {
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

export type VmOperation =
  | StackOperation
  | OpOperation
  | CallOperation
  | ReturnOperation
  | GotoOperation
  | LabelOperation;

export interface StackOperation {
  op: "push" | "pop";
  segment:
    | "argument"
    | "local"
    | "static"
    | "constant"
    | "this"
    | "that"
    | "pointer"
    | "temp";
  offset: number;
}
export interface OpOperation {
  op: "add" | "sub" | "neg" | "lt" | "gt" | "eq" | "and" | "or" | "not";
}
export interface CallOperation {
  op: "call";
  name: string;
  nArgs: number;
}
export interface ReturnOperation {
  op: "return";
}
export interface LabelOperation {
  op: "label";
  label: string;
}
export interface GotoOperation {
  op: "goto" | "if-goto";
  label: string;
}

export type VmFunctions = Record<string, VmFunction>;
export interface VmFunction {
  name: string;
  nVars: number;
  labels: Record<string, number>;
  operations: VmOperation[];
}

interface VmFunctionInvocation {
  function: string;
  op: number;
}

const BOOTSTRAP: VmFunction = {
  name: "__bootstrap",
  nVars: 0,
  labels: {},
  operations: [{ op: "call", name: "Sys.init", nArgs: 0 }],
};

export class Vm {
  private memory = new VmMemory();
  private functionMap: Record<string, VmFunction> = {
    [BOOTSTRAP.name]: BOOTSTRAP,
  };
  private executionStack: VmFunctionInvocation[] = [
    { function: BOOTSTRAP.name, op: 0 },
  ];
  private staticCount = 0;
  private statics: Record<string, number[]> = {};
  private registerStatic(fnName: string, offset: number): number {
    const fileName = fnName.split(".")[0];
    const statics = this.statics[fileName] ?? [];
    this.statics[fileName] = statics;
    const static_ = statics[offset] ?? this.staticCount++;
    statics[offset] = static_;
    return static_;
  }

  private registerStatics() {
    for (const fn of Object.values(this.functionMap)) {
      for (const op of fn.operations) {
        if (
          ["push", "pop"].includes(op.op) &&
          (op as { segment: string }).segment === "static"
        ) {
          (op as { offset: number }).offset = this.registerStatic(
            fn.name,
            (op as { offset: number }).offset
          );
        }
      }
    }
  }

  static build(instructions: VmInstruction[]): Vm {
    const vm = new Vm();

    if (instructions[0]?.op !== "function") {
      instructions.unshift({ op: "function", name: "__implicit", nVars: 0 });
    }

    let i = 0;
    while (i < instructions.length) {
      const [fn, i_] = this.buildFunction(instructions, i);
      if (vm.functionMap[fn.name])
        throw new Error(`VM Already has a function named ${fn.name}`);
      if (fn.name === "__implicit") {
        fn.labels["__END"] = fn.operations.length;
        fn.operations.push({ op: "label", label: "__END" });
        fn.operations.push({ op: "goto", label: "__END" });
      }
      vm.functionMap[fn.name] = fn;
      i = i_;
    }

    if (!vm.functionMap["Sys.init"]) {
      if (vm.functionMap["main"]) {
        // Inject a Sys.init
        vm.functionMap["Sys.init"] = {
          name: "Sys.init",
          labels: { END: 1 },
          nVars: 0,
          operations: [
            { op: "call", name: "main", nArgs: 0 },
            { op: "goto", label: "END" },
          ],
        };
      } else if (vm.functionMap["__implicit"]) {
        // Use __implicit instead of __bootstrap
        vm.executionStack = [{ function: "__implicit", op: 0 }];
      } else {
        throw new Error("Could not determine an entry point for VM");
      }
    }

    vm.registerStatics();
    return vm;
  }

  private static buildFunction(
    instructions: VmInstruction[],
    i: number
  ): [VmFunction, number] {
    if (instructions[i].op !== "function")
      throw new Error(
        "Only call buildFunction at the initial Function instruction"
      );
    const fn: VmFunction = {
      name: (instructions[i] as FunctionInstruction).name,
      nVars: (instructions[i] as FunctionInstruction).nVars,
      labels: {},
      operations: [],
    };

    i += 1;
    instructions: while (i < instructions.length) {
      switch (instructions[i].op) {
        case "function":
          break instructions;
        case "add":
        case "sub":
        case "neg":
        case "and":
        case "or":
        case "not":
        case "gt":
        case "lt":
        case "eq":
          fn.operations.push({
            op: instructions[i].op as
              | "add"
              | "sub"
              | "neg"
              | "lt"
              | "gt"
              | "eq"
              | "and"
              | "or"
              | "not",
          });
          break;
        case "push":
        case "pop":
          fn.operations.push({
            op: instructions[i].op as "push" | "pop",
            segment: (
              instructions[i] as {
                segment:
                  | "argument"
                  | "local"
                  | "static"
                  | "constant"
                  | "this"
                  | "that"
                  | "pointer"
                  | "temp";
              }
            ).segment,
            offset: (instructions[i] as { offset: number }).offset,
          });
          break;
        case "call":
          fn.operations.push({
            op: "call",
            name: (instructions[i] as { name: string }).name,
            nArgs: (instructions[i] as { nArgs: number }).nArgs,
          });
          break;
        case "goto":
        case "if-goto":
          fn.operations.push({
            op: instructions[i].op as "goto" | "if-goto",
            label: (instructions[i] as { label: string }).label,
          });
          break;
        case "label": {
          const { label } = instructions[i] as { label: string };
          if (fn.labels[label])
            throw new Error(
              `Cannot redeclare label ${label} in function ${fn.name} (previously at ${fn.labels[label]})`
            );
          fn.labels[label] = fn.operations.length;
          fn.operations.push({ op: "label", label });
          break;
        }
        case "return": {
          fn.operations.push({ op: "return" });
          break;
        }
      }

      i += 1;
    }

    return [fn, i];
  }

  get invocation() {
    const invocation = this.executionStack.at(-1);
    if (invocation === undefined) throw new Error("Empty execution stack!");
    return invocation;
  }

  get currentFunction() {
    const fn = this.functionMap[this.invocation.function];
    if (fn === undefined)
      throw new Error(
        `Executing undefined function ${this.invocation.function}`
      );
    return fn;
  }

  get operation() {
    if (this.invocation.op > this.currentFunction.operations.length)
      throw new Error(
        `Current operation step beyond end of function operations (${this.invocation.op} > ${this.currentFunction.operations.length})`
      );

    return this.currentFunction.operations[this.invocation.op];
  }

  step() {
    const operation = this.operation ?? { op: "return" }; // Implicit return if the function doesn't end on its own.
    switch (operation.op) {
      case "push": {
        const value = this.memory.getSegment(
          operation.segment,
          operation.offset
        );
        this.memory.push(value);
        break;
      }
      case "pop": {
        const value = this.memory.pop();
        this.memory.setSegment(operation.segment, operation.offset, value);
        break;
      }
      case "add": {
        this.memory.binOp((a, b) => a + b);
        break;
      }
      case "sub": {
        this.memory.binOp((a, b) => a - b);
        break;
      }
      case "neg": {
        // neg by flipping the sign bit
        this.memory.unOp((a) => -a);
        break;
      }
      case "and": {
        this.memory.binOp((a, b) => a & b);
        break;
      }
      case "or": {
        this.memory.binOp((a, b) => a | b);
        break;
      }
      case "not": {
        this.memory.unOp((a) => ~a);
        break;
      }
      case "eq": {
        this.memory.comp((a, b) => a === b);
        break;
      }
      case "lt": {
        this.memory.comp((a, b) => a < b);
        break;
      }
      case "gt": {
        this.memory.comp((a, b) => a > b);
        break;
      }
      case "goto": {
        this.goto(operation.label);
        break;
      }
      case "if-goto": {
        const check = this.memory.pop();
        if (check != 0) {
          this.goto(operation.label);
        }
        break;
      }
      case "call": {
        const fnName = operation.name;
        const fn = this.functionMap[fnName];
        if (!fn) throw new Error(`Calling unknown function ${fnName}`);
        this.memory.pushFrame(this.invocation.op, operation.nArgs, fn.nVars);
        this.executionStack.push({ function: fnName, op: -1 });
        break;
      }
      case "return": {
        this.executionStack.pop();
        const ret = this.memory.popFrame();
        this.invocation.op = ret;
        break;
      }
      case "label": {
        // noop
        break;
      }
    }
    this.invocation.op += 1;
  }

  private goto(label: string) {
    if (this.currentFunction.labels[label] === undefined)
      throw new Error(
        `Attempting GOTO to unknown label ${label} in ${this.currentFunction.name}`
      );
    this.invocation.op = this.currentFunction.labels[label];
  }

  write(addresses: [number, number][]) {
    addresses.map(([address, value]) => {
      this.memory.set(address, value);
    });
  }

  read(addresses: number[]): number[] {
    return addresses.map((address) => this.memory.get(address));
  }
}
