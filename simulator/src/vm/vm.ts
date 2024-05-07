import {
  Err,
  Ok,
  Result,
  isErr,
  unwrap,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { MemoryAdapter, RAM } from "../cpu/memory.js";
import { CompilationError, Span, createError } from "../languages/base.js";
import {
  CallInstruction,
  FunctionInstruction,
  Segment,
  StackInstruction,
  VmInstruction,
} from "../languages/vm.js";
import { VM_BUILTINS } from "./builtins.js";
import { VmMemory } from "./memory.js";
import { OS } from "./os/os.js";

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
  usedSegments?: Set<Segment>;
}

export type VmFunctions = Record<string, VmFunction>;
export interface VmFunction {
  name: string;
  nVars: number;
  labels: Record<string, number>;
  operations: VmInstruction[];
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
  // Whether the THIS segment was initialized in this invocation
  thisInitialized: boolean;
  // Whether the THAT segment was initialized in this invocation
  thatInitialized: boolean;
  // The size of the memory block pointed to by the function's THIS (if exists)
  thisN?: number;
}

export const IMPLICIT = "__implicit";

export const SYS_INIT: VmFunction = {
  name: "Sys.init",
  labels: {},
  nVars: 0,
  opBase: 0,
  operations: [
    { op: "function", name: "Sys.init", nVars: 0 },
    { op: "call", name: "Main.main", nArgs: 0 },
  ],
};

export interface ParsedVmFile {
  name: string;
  instructions: VmInstruction[];
}

interface SegmentStatus {
  initialized: boolean;
  n: number;
}

export class Vm {
  memory = new VmMemory();
  private os = new OS(this.memory);
  functionMap: Record<string, VmFunction> = {};
  executionStack: VmFunctionInvocation[] = [];

  entry = "";

  segmentInitializations: Record<"local" | "argument", SegmentStatus> = {
    local: { initialized: false, n: 0 },
    argument: { initialized: false, n: 0 },
  };

  functions: VmFunction[] = [];
  program: VmInstruction[] = [];
  addedSysInit = false;

  private staticCount = 0;
  protected statics: Record<string, number[]> = {};

  getStaticCount() {
    return this.staticCount;
  }

  private returnLine: number | undefined = undefined;

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
          (op as StackInstruction)?.segment === "static"
        ) {
          (op as StackInstruction).offset = this.registerStatic(
            fn.name,
            (op as StackInstruction).offset
          );
        }
      }
    }
  }

  private static validateFile(file: ParsedVmFile) {
    for (const inst of file.instructions) {
      if (inst.op == "function") {
        const parts = inst.name.split(".");
        if (parts.length != 2) {
          return Err(
            createError(
              `Illegal subroutine name ${inst.name} (Expected <className>.<SubroutineName>)`,
              inst.span
            )
          );
        }
        if (parts[0] != file.name) {
          return Err(
            createError(
              `File name ${file.name} doesn't match class name ${parts[0]} (at ${inst.name})`,
              inst.span
            )
          );
        }
      }
    }
    return Ok();
  }

  private static validateFiles(files: ParsedVmFile[]) {
    const names: Set<string> = new Set();

    for (const file of files) {
      if (names.has(file.name)) {
        return Err(createError(`File ${file.name} already exists`));
      }
      const result = this.validateFile(file);
      if (isErr(result)) {
        return result;
      }
      names.add(file.name);
    }
    return Ok();
  }

  private validateStackInstructions() {
    for (const fn of Object.values(this.functionMap)) {
      for (const inst of fn.operations) {
        if (inst.op == "pop" || inst.op == "push") {
          const base = this.memory.baseSegment(inst.segment, inst.offset);
          if (isErr(base)) {
            return Err(createError(Err(base).message, inst.span));
          }
        }
      }
    }
    return Ok();
  }

  private static validateFunctions(
    instructions: VmInstruction[]
  ): Result<void, CompilationError> {
    const functions: Set<string> = new Set();
    const calls = [];

    for (const inst of instructions) {
      if (inst.op == "function") {
        if (inst.nVars < 0 || inst.nVars > 32767) {
          return Err(
            createError(
              `Illegal number of local variables ${inst.nVars} (Expected 0-32767)`,
              inst.span
            )
          );
        }
        functions.add(inst.name);
      }
      if (inst.op == "call") {
        if (inst.nArgs < 0 || inst.nArgs > 32767) {
          return Err(
            createError(
              `Illegal number of arguments ${inst.nArgs} (Expected 0-32767)`,
              inst.span
            )
          );
        }
        calls.push(inst as CallInstruction);
      }
    }

    for (const call of calls) {
      if (!functions.has(call.name)) {
        if (VM_BUILTINS[call.name]) {
          if (VM_BUILTINS[call.name].nArgs != call.nArgs) {
            return Err(
              createError(
                `OS function ${call.name} expects ${
                  VM_BUILTINS[call.name].nArgs
                } arguments, not ${call.nArgs}`,
                call.span
              )
            );
          }
        } else {
          return Err(createError(`Undefined function ${call.name}`, call.span));
        }
      }
    }

    return Ok();
  }

  static buildFromFiles(files: ParsedVmFile[]): Result<Vm, CompilationError> {
    let result = this.validateFiles(files);
    if (isErr(result)) {
      return result;
    }
    const instructions = files
      .map((file) => file.instructions)
      .reduce((list1, list2) => list1.concat(list2));
    result = this.validateFunctions(instructions);
    if (isErr(result)) {
      return result;
    }
    const vm = new Vm();
    const load = vm.load(instructions);
    if (isErr(load)) return load;
    return vm.bootstrap();
  }

  static build(instructions: VmInstruction[]): Result<Vm, CompilationError> {
    const result = this.validateFunctions(instructions);
    if (isErr(result)) {
      return result;
    }
    const vm = new Vm();
    const load = vm.load(instructions);
    if (isErr(load)) return load;
    return vm.bootstrap();
  }

  private static buildFunction(
    instructions: VmInstruction[],
    i: number
  ): Result<[VmFunction, number], CompilationError> {
    if (instructions[i].op !== "function")
      throw new Error(
        "Only call buildFunction at the initial Function instruction"
      );

    const { name, nVars } = instructions[i] as FunctionInstruction;
    const fn: VmFunction = {
      name,
      nVars,
      labels: {},
      operations: [{ op: "function", name, nVars, span: instructions[i].span }],
      opBase: 0,
    };

    const declaredLabels: Set<string> = new Set();
    const usedLabels: Record<string, Span | undefined> = {};

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
            span: instructions[i].span,
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
            span: instructions[i].span,
          });
          break;
        case "call":
          fn.operations.push({
            op: "call",
            name: (instructions[i] as { name: string }).name,
            nArgs: (instructions[i] as { nArgs: number }).nArgs,
            span: instructions[i].span,
          });
          break;
        case "goto":
        case "if-goto": {
          const { label } = instructions[i] as { label: string };
          usedLabels[label] = instructions[i].span;
          fn.operations.push({
            op: instructions[i].op as "goto" | "if-goto",
            label,
            span: instructions[i].span,
          });
          break;
        }
        case "label": {
          const { label } = instructions[i] as { label: string };
          declaredLabels.add(label);
          if (fn.labels[label])
            return Err(
              createError(
                `Cannot redeclare label ${label} in function ${
                  fn.name
                } (previously at line ${fn.labels[label] + 1})`,
                instructions[i].span
              )
            );
          fn.labels[label] = fn.operations.length;
          fn.operations.push({
            op: "label",
            label,
            span: instructions[i].span,
          });
          break;
        }
        case "return": {
          fn.operations.push({ op: "return", span: instructions[i].span });
          break;
        }
      }

      i += 1;
    }

    for (const label of Object.keys(usedLabels)) {
      if (!declaredLabels.has(label)) {
        return Err(createError(`Undeclared label ${label}`, usedLabels[label]));
      }
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
        function: IMPLICIT,
        nArgs: 0,
        opPtr: 0,
        thisInitialized: false,
        thatInitialized: false,
      };
    }
    return invocation;
  }

  get currentFunction() {
    return this.functionMap[this.invocation.function];
  }

  get operation() {
    if (!this.currentFunction) {
      return;
    }
    if (this.invocation.opPtr > this.currentFunction.operations.length)
      throw new Error(
        `Current operation step beyond end of function operations (${this.invocation.opPtr} > ${this.currentFunction.operations.length})`
      );

    return this.currentFunction.operations[this.invocation.opPtr];
  }

  load(
    instructions: VmInstruction[],
    reset = false
  ): Result<this, CompilationError> {
    if (reset) {
      this.functionMap = {};
      this.statics = {};
      this.staticCount = 0;
    }

    if (instructions[0]?.op !== "function") {
      instructions.unshift({ op: "function", name: IMPLICIT, nVars: 0 });
    }

    let i = 0;
    while (i < instructions.length) {
      const buildFn = Vm.buildFunction(instructions, i);

      if (isErr(buildFn)) return buildFn;
      const [fn, i_] = unwrap(buildFn);
      if (
        this.functionMap[fn.name] &&
        this.memory.strict &&
        fn.name !== IMPLICIT &&
        fn.name !== SYS_INIT.name
      ) {
        return Err(
          createError(
            `VM Already has a function named ${fn.name}`,
            instructions[0].span
          )
        );
      }

      this.functionMap[fn.name] = fn;
      i = i_;
    }

    const result = this.validateStackInstructions();
    if (isErr(result)) {
      return result;
    }
    this.registerStatics();

    if (reset) {
      this.bootstrap();
    }

    return Ok(this);
  }

  bootstrap() {
    if (!this.functionMap[SYS_INIT.name] && this.functionMap["Main.main"]) {
      this.functionMap[SYS_INIT.name] = SYS_INIT;
      this.addedSysInit = true;
      // TODO should this be an error from the compiler/OS?
    }

    if (this.functionMap[SYS_INIT.name]) {
      this.entry = SYS_INIT.name;
    } else if (this.functionMap[IMPLICIT]) {
      this.entry = IMPLICIT;
    } else {
      const fnNames = Object.keys(this.functionMap);
      if (fnNames.length === 1) {
        this.entry = fnNames[0];
      }
    }

    if (this.functionMap[IMPLICIT] && this.functionMap[SYS_INIT.name]) {
      return Err(
        createError("Cannot use both bootstrap and an implicit function")
      );
    }

    if (this.entry === "") {
      return Err(createError("Could not determine an entry point for VM"));
    }

    this.functions = Object.values(this.functionMap);
    this.functions.sort((a, b) => {
      if (a.name === this.entry) return -1;
      if (b.name === this.entry) return 1;
      return 0; // Stable sort otherwise
    });

    let offset = 0;
    this.program = this.functions.reduce((prog, fn) => {
      if (fn.name != SYS_INIT.name) {
        fn.opBase = offset;
      }
      offset += fn.operations.length;
      return prog.concat(fn.operations);
    }, [] as VmInstruction[]);

    this.reset();

    return Ok(this);
  }

  reset() {
    this.executionStack = [
      {
        function: this.entry,
        opPtr: 1,
        frameBase: 256,
        nArgs: 0,
        thisInitialized: false,
        thatInitialized: false,
      },
    ];
    this.memory.reset();
    this.memory.SP = 256;
    this.segmentInitializations = {
      local: { initialized: false, n: 0 },
      argument: { initialized: false, n: 0 },
    };

    this.os.dispose();
    this.os = new OS(this.memory);
  }

  private validateStackOp(op: StackInstruction) {
    if (this.currentFunction?.name == this.entry) {
      for (const segment of ["local", "argument"] as const) {
        if (op.segment == segment) {
          if (this.segmentInitializations[segment].initialized) {
            // the size of that segment is always 1
            this.segmentInitializations[segment].n = Math.max(
              op.offset + 1,
              this.segmentInitializations[segment].n
            );
            return;
          } else {
            throw new Error(
              `The ${segment} segment cannot be accessed since it was not initialized`
            );
          }
        }
      }
      if (op.segment == "this" && this.invocation.thisInitialized) {
        this.invocation.thisN = Math.max(
          op.offset + 1,
          this.invocation.thisN ?? 0
        );
        return;
      }
    }
    if (op.segment == "argument" && op.offset >= this.invocation.nArgs) {
      throw new Error("Argument offset out of bounds");
    }
    if (
      op.segment == "local" &&
      op.offset >= this.functionMap[this.invocation.function]?.nVars
    ) {
      throw new Error("Local offset out of bounds");
    }
    if (op.segment == "this" && !this.invocation.thisInitialized) {
      throw new Error(
        `The this segment cannot be accessed since it was not initialized`
      );
    }
    if (op.segment == "that" && !this.invocation.thatInitialized) {
      throw new Error(
        `The that segment cannot be accessed since it was not initialized`
      );
    }
  }

  step(): number | undefined {
    if (this.os.sys.halted) {
      return this.os.sys.exitCode;
    }
    if (this.os.sys.blocked) {
      return;
    }
    if (this.os.sys.released && this.operation?.op == "call") {
      const ret = this.os.sys.readReturnValue();
      const sp = this.memory.SP - this.operation.nArgs;
      this.memory.set(sp, ret);
      this.memory.SP = sp + 1;
      this.invocation.opPtr += 1;
      return;
    }

    if (this.operation == undefined) {
      this.os.sys.halt();
      return this.step();
    }

    const operation = this.operation;

    if (operation.op === "label") {
      this.invocation.opPtr += 1;
      return this.step();
    }

    switch (operation.op) {
      case "push": {
        this.validateStackOp(operation);
        const value = this.memory.getSegment(
          operation.segment,
          operation.offset
        );
        this.memory.push(value);
        break;
      }
      case "pop": {
        this.validateStackOp(operation);
        const value = this.memory.pop();
        this.memory.setSegment(operation.segment, operation.offset, value);

        // update THIS/THAT segment status
        if (operation.segment == "pointer") {
          if (operation.offset == 0) {
            this.invocation.thisInitialized = true;
            this.invocation.thisN = this.memory.get(this.memory.THIS - 1);
          } else if (operation.offset == 1) {
            this.invocation.thatInitialized = true;
          }
        }
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
            thisInitialized: false,
            thatInitialized: false,
          });
        } else if (VM_BUILTINS[fnName]) {
          const ret = VM_BUILTINS[fnName].func(this.memory, this.os);
          if (this.os.sys.blocked) {
            return; // we will handle the return when the OS is released
          }
          const sp = this.memory.SP - operation.nArgs;
          this.memory.set(sp, ret);
          this.memory.SP = sp + 1;
        }
        break;
      }
      case "return": {
        const line = this.derivedLine();
        this.executionStack.pop();
        const ret = this.memory.popFrame();
        this.invocation.opPtr = ret;
        if (this.executionStack.length === 0) {
          this.returnLine = line;
          return 0;
        }
        break;
      }
    }
    this.invocation.opPtr += 1;
    return;
  }

  private goto(label: string) {
    if (!this.currentFunction) {
      return;
    }
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

  private getUsedSegments(invocation: VmFunctionInvocation) {
    const usedSegments = new Set<Segment>();

    for (const inst of this.functionMap[invocation.function].operations) {
      if (inst.op === "push" || inst.op == "pop") {
        usedSegments.add(inst.segment);
      }
    }

    return usedSegments;
  }

  makeFrame(invocation = this.invocation, nextFrame: number): VmFrame {
    const fn = this.functionMap[invocation.function];
    if (fn.name === this.entry) {
      const stackBase = 256 + fn.nVars;
      const nextFrame = this.executionStack[1];
      const frameEnd = nextFrame
        ? nextFrame.frameBase - nextFrame.nArgs
        : this.memory.get(0);
      const { ARG, LCL, THAT, THIS } = this.memory;
      const nArg = this.segmentInitializations["argument"].n;
      const nLocal = this.segmentInitializations["local"].n;
      const nThis = this.invocation.thisN ?? 0;
      return {
        fn,
        args: {
          base: ARG,
          count: nArg,
          values: [...this.memory.map((_, v) => v, ARG, ARG + nArg)],
        },
        locals: {
          base: LCL,
          count: nLocal,
          values: [...this.memory.map((_, v) => v, LCL, LCL + nLocal)],
        },
        stack: {
          base: 256,
          count: frameEnd - stackBase,
          values: [...this.memory.map((_, v) => v, stackBase, frameEnd)],
        },
        this: {
          base: THIS,
          count: nThis,
          values: [...this.memory.map((_, v) => v, THIS, THIS + nThis)],
        },
        that: {
          base: THAT,
          count: 1,
          values: [this.memory.THAT],
        },
        frame: {
          ARG,
          LCL,
          RET: 0xffff,
          THAT,
          THIS,
        },
        usedSegments: this.getUsedSegments(invocation),
      };
    }
    const frame = this.memory.getFrame(
      invocation.frameBase,
      invocation.nArgs,
      fn.nVars,
      this.invocation.thisN ?? 0,
      1,
      nextFrame
    );
    frame.fn = fn;
    frame.usedSegments = this.getUsedSegments(invocation);
    return frame;
  }

  derivedLine(): number {
    return this.operation?.span?.line ?? this.returnLine ?? 0;
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

function writeOp(op: VmInstruction): string {
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
