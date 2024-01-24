import {
  Err,
  Ok,
  Result,
  isErr,
  unwrap,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { MemoryAdapter, RAM } from "../cpu/memory.js";
import { FunctionInstruction, VmInstruction } from "../languages/vm.js";
import { VM_BUILTINS } from "./builtins.js";
import { VmMemory } from "./memory.js";
import { initOs } from "./os/os.js";

export type VmOperation =
  | FunctionOperation
  | StackOperation
  | OpOperation
  | CallOperation
  | ReturnOperation
  | GotoOperation
  | LabelOperation;

export type Segment =
  | "argument"
  | "local"
  | "static"
  | "constant"
  | "this"
  | "that"
  | "pointer"
  | "temp";

export type BinOp = "add" | "sub" | "and" | "or";
export type CmpOp = "lt" | "gt" | "eq";
export type UnOp = "neg" | "not";
export type Op = BinOp | CmpOp | UnOp;

export interface FunctionOperation {
  op: "function";
  name: string;
  nVars: number;
}

export interface StackOperation {
  op: "push" | "pop";
  segment: Segment;
  offset: number;
}

export interface OpOperation {
  op: Op;
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

interface VmFrameValues {
  base: number;
  count: number;
  values: number[];
}

export interface VmFrame {
  fn?: VmFunction;
  locals: VmFrameValues;
  args: VmFrameValues;
  stack: VmFrameValues;
  this: VmFrameValues;
  that: VmFrameValues;
  frame: {
    RET: number;
    ARG: number;
    LCL: number;
    THIS: number;
    THAT: number;
  };
}

export type VmFunctions = Record<string, VmFunction>;
export interface VmFunction {
  name: string;
  nVars: number;
  labels: Record<string, number>;
  operations: VmOperation[];
  opBase: number;
}

interface VmFunctionInvocation {
  function: string;
  // The current operation offset in the function
  opPtr: number;
  // Base address of the frame in memory
  frameBase: number;
  // The number of args the function was called with
  nArgs: number;
}

const IMPLICIT: VmFunction = {
  name: "__implicit",
  nVars: 0,
  opBase: 0,
  labels: {},
  operations: [{ op: "function", name: "__implicit", nVars: 0 }],
};

const BOOTSTRAP: VmFunction = {
  name: "__bootstrap",
  nVars: 0,
  opBase: 0,
  labels: {},
  operations: [
    { op: "function", name: "__bootstrap", nVars: 0 },
    { op: "call", name: "Sys.init", nArgs: 0 },
  ],
};

const END_LABEL = "__END";
const SYS_INIT: VmFunction = {
  name: "Sys.init",
  labels: { END: 1 },
  nVars: 0,
  opBase: 0,
  operations: [
    { op: "call", name: "main", nArgs: 0 },
    { op: "label", label: END_LABEL },
    { op: "goto", label: END_LABEL },
  ],
};

export class Vm {
  memory = new VmMemory();
  private os = initOs(this.memory);
  entry = "";
  functionMap: Record<string, VmFunction> = {};
  executionStack: VmFunctionInvocation[] = [];

  functions: VmFunction[] = [];
  program: VmOperation[] = [];

  private staticCount = 0;
  protected statics: Record<string, number[]> = {};

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
          (op.op === "push" || op.op === "pop") &&
          (op as StackOperation)?.segment === "static"
        ) {
          (op as StackOperation).offset = this.registerStatic(
            fn.name,
            (op as StackOperation).offset
          );
        }
      }
    }
  }

  static build(instructions: VmInstruction[]): Result<Vm> {
    const vm = new Vm();
    const load = vm.load(instructions);
    if (isErr(load)) return load;
    return vm.bootstrap();
  }

  private static buildFunction(
    instructions: VmInstruction[],
    i: number
  ): Result<[VmFunction, number]> {
    if (instructions[i].op !== "function")
      return Err(
        Error("Only call buildFunction at the initial Function instruction")
      );

    const { name, nVars } = instructions[i] as FunctionInstruction;
    const fn: VmFunction = {
      name,
      nVars,
      labels: {},
      operations: [{ op: "function", name, nVars }],
      opBase: 0,
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

    if (fn.name === IMPLICIT.name) {
      fn.labels[END_LABEL] = fn.operations.length;
      fn.operations.push({ op: "label", label: END_LABEL });
      fn.operations.push({ op: "goto", label: END_LABEL });
    }

    return Ok([fn, i]);
  }

  get RAM(): RAM {
    return this.memory;
  }

  get Keyboard(): MemoryAdapter {
    return this.memory.keyboard;
  }
  get Screen(): MemoryAdapter {
    return this.memory.screen;
  }

  get invocation(): VmFunctionInvocation {
    const invocation = this.executionStack.at(-1);
    if (invocation === undefined) {
      return {
        frameBase: 256,
        function: IMPLICIT.name,
        nArgs: 0,
        opPtr: 0,
      };
    }
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
    if (this.invocation.opPtr > this.currentFunction.operations.length)
      throw new Error(
        `Current operation step beyond end of function operations (${this.invocation.opPtr} > ${this.currentFunction.operations.length})`
      );

    return this.currentFunction.operations[this.invocation.opPtr];
  }

  load(instructions: VmInstruction[], reset = false): Result<this, Error> {
    if (reset) {
      this.functionMap = {};
      this.statics = {};
      this.staticCount = 0;
    }

    if (instructions[0]?.op !== "function") {
      instructions.unshift({ op: "function", name: IMPLICIT.name, nVars: 0 });
    }

    let i = 0;
    while (i < instructions.length) {
      const buildFn = Vm.buildFunction(instructions, i);

      if (isErr(buildFn))
        return Err(new Error("Failed to build VM", { cause: Err(buildFn) }));
      const [fn, i_] = unwrap(buildFn);
      if (
        this.functionMap[fn.name] &&
        this.memory.strict &&
        fn.name !== IMPLICIT.name &&
        fn.name !== SYS_INIT.name
      ) {
        return Err(new Error(`VM Already has a function named ${fn.name}`));
      }

      this.functionMap[fn.name] = fn;
      i = i_;
    }

    this.registerStatics();

    if (reset) {
      this.bootstrap();
    }

    return Ok(this);
  }

  bootstrap() {
    if (!this.functionMap[SYS_INIT.name] && this.functionMap["main"]) {
      this.functionMap[SYS_INIT.name] = SYS_INIT;
      // TODO should this be an error from the compiler/OS?
    }

    if (this.functionMap[SYS_INIT.name]) {
      this.entry = SYS_INIT.name;
    } else if (this.functionMap[IMPLICIT.name]) {
      this.entry = IMPLICIT.name;
    } else {
      const fnNames = Object.keys(this.functionMap);
      if (fnNames.length === 1) {
        this.entry = fnNames[0];
        this.functionMap[IMPLICIT.name] = IMPLICIT;
      }
    }

    if (this.functionMap[IMPLICIT.name] && this.functionMap[BOOTSTRAP.name]) {
      return Err(
        new Error("Cannot use both bootstrap and an implicit function")
      );
    }

    if (this.entry === "") {
      return Err(Error("Could not determine an entry point for VM"));
    }

    this.functions = Object.values(this.functionMap);
    this.functions.sort((a, b) => {
      if (a.name === this.entry) return -1;
      if (a.name === this.entry) return 1;
      return 0; // Stable sort otherwise
    });

    let offset = 0;
    this.program = this.functions.reduce((prog, fn) => {
      fn.opBase = offset;
      offset += fn.operations.length;
      return prog.concat(fn.operations);
    }, [] as VmOperation[]);

    this.reset();

    return Ok(this);
  }

  reset() {
    this.executionStack = [
      { function: this.entry, opPtr: 1, frameBase: 256, nArgs: 0 },
    ];
    this.memory.reset();
    this.memory.set(0, 256);
    this.os.keyboard.dispose();
    this.os = initOs(this.memory);
  }

  step() {
    if (this.os.sys.shouldHalt) {
      return true;
    }
    if (this.os.sys.isBlocked) {
      return false;
    }
    if (this.os.sys.hasReleased && this.operation.op == "call") {
      const ret = this.os.sys.readReturnValue();
      const sp = this.memory.SP - this.operation.nArgs;
      this.memory.set(sp, ret);
      this.memory.SP = sp + 1;
      this.invocation.opPtr += 1;
      return false;
    }

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
        if (this.functionMap[fnName]) {
          const base = this.memory.pushFrame(
            this.invocation.opPtr,
            operation.nArgs,
            this.functionMap[fnName].nVars
          );
          this.executionStack.push({
            function: fnName,
            opPtr: 0,
            nArgs: operation.nArgs,
            frameBase: base,
          });
        } else if (VM_BUILTINS[fnName]) {
          const ret = VM_BUILTINS[fnName](this.memory, this.os);
          if (this.os.sys.isBlocked) {
            return false; // we will handle the return when the OS is released
          }
          const sp = this.memory.SP - operation.nArgs;
          this.memory.set(sp, ret);
          this.memory.SP = sp + 1;
        }
        break;
      }
      case "return": {
        this.executionStack.pop();
        const ret = this.memory.popFrame();
        this.invocation.opPtr = ret;
        break;
      }
      case "label": {
        // noop
        break;
      }
    }
    this.invocation.opPtr += 1;
    return false;
  }

  private goto(label: string) {
    if (this.currentFunction.labels[label] === undefined)
      throw new Error(
        `Attempting GOTO to unknown label ${label} in ${this.currentFunction.name}`
      );
    this.invocation.opPtr = this.currentFunction.labels[label];
  }

  write(addresses: [number, number][]) {
    addresses.map(([address, value]) => {
      this.memory.set(address, value);
    });
  }

  read(addresses: number[]): number[] {
    return addresses.map((address) => this.memory.get(address));
  }

  vmStack(): VmFrame[] {
    return this.executionStack.map((invocation, i) => {
      const next = this.executionStack[i + 1];
      const end = next ? next.frameBase - next.nArgs : this.memory.get(0);
      return this.makeFrame(invocation, end);
    });
  }

  makeFrame(invocation = this.invocation, nextFrame: number): VmFrame {
    const fn = this.functionMap[invocation.function];
    if (fn.name === this.entry) {
      const frameBase = 256;
      const nextFrame = this.executionStack[1];
      const frameEnd = nextFrame
        ? nextFrame.frameBase - nextFrame.nArgs
        : this.memory.get(0);
      const { ARG, LCL, THAT, THIS } = this.memory;
      return {
        fn,
        args: {
          base: ARG,
          count: 7,
          values: [...this.memory.map((_, v) => v, ARG, ARG + 7)],
        },
        locals: {
          base: LCL,
          count: 5,
          values: [...this.memory.map((_, v) => v, LCL, LCL + 5)],
        },
        stack: {
          base: 256,
          count: frameEnd - frameBase,
          values: [...this.memory.map((_, v) => v, frameBase, frameEnd)],
        },
        ["this"]: { base: THAT, count: 0, values: [] },
        that: { base: THIS, count: 0, values: [] },
        frame: {
          ARG,
          LCL,
          RET: 0xffff,
          THAT,
          THIS,
        },
      };
    }
    const frame = this.memory.getFrame(
      invocation.frameBase,
      invocation.nArgs,
      fn.nVars,
      0,
      0,
      nextFrame
    );
    frame.fn = fn;
    return frame;
  }

  derivedLine(): number {
    return this.currentFunction.opBase + this.invocation.opPtr;
  }

  writeDebug(): string {
    const line = this.derivedLine();
    const from = Math.max(line - 5, 0);
    const to = Math.min(line + 3, this.program.length);
    const lines = this.program.slice(from, to);
    const prog = lines
      .map((op, i) => `${i === line - from ? "->" : "  "} ${writeOp(op)}`)
      .join("\n");
    const frame = this.vmStack().at(-1);
    if (frame) {
      return prog + "\n\n" + writeFrame(frame);
    }
    return prog;
  }
}

export function writeFrame(frame: VmFrame): string {
  return [
    `Frame: ${frame.fn?.name ?? "Unknown Fn"} ARG:${frame.frame.ARG} LCL:${
      frame.frame.LCL
    }`,
    `Args: ${writeFrameValues(frame.args)}`,
    `Lcls: ${writeFrameValues(frame.locals)}`,
    `Stck: ${writeFrameValues(frame.stack)}`,
  ].join("\n");
}

function writeFrameValues(fv: VmFrameValues): string {
  return `[${fv.base};${fv.count}][${fv.values.join(", ")}]`;
}

function writeOp(op: VmOperation): string {
  switch (op.op) {
    case "add":
    case "and":
    case "sub":
    case "eq":
    case "gt":
    case "lt":
    case "neg":
    case "not":
    case "or":
    case "return":
      return `  ${op.op}`;
    case "goto":
      return `  ${op.op}    ${op.label}`;
    case "if-goto":
      return `  ${op.op} ${op.label}`;
    case "label":
      return `${op.op}     ${op.label}`;
    case "call":
      return `  ${op.op}    ${op.name} ${op.nArgs}`;
    case "function":
      return `${op.op}  ${op.name} ${op.nVars}`;
    case "pop":
      return `  ${op.op}     ${op.segment} ${op.offset}`;
    case "push":
      return `  ${op.op}    ${op.segment} ${op.offset}`;
  }
}
