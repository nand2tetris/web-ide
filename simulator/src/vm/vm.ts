import { Err, isErr, Ok, Result } from "@davidsouther/jiffies/result.ts";
import { MemoryAdapter, RAM } from "../cpu/memory.js";
import {
  createError,
  Diagnostic,
  type Diagnostics,
  mergeByFile,
  type Origin,
  type Provenance,
  recoveredOf,
  Span,
  semanticError,
} from "../languages/base.js";
import {
  CallInstruction,
  FunctionInstruction,
  prune,
  Segment,
  StackInstruction,
  VM,
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
  // The highest accessed index + 1 of the function's THAT segment
  thatN?: number;
}

export const IMPLICIT = "__implicit";

export const SYS_INIT: VmFunction = {
  name: "Sys.init",
  labels: {},
  nVars: 0,
  opBase: 0,
  operations: [
    { op: "function", name: "Sys.init", nVars: 0 },
    { op: "call", name: "Math.init", nArgs: 0 },
    { op: "call", name: "String.init", nArgs: 0 },
    { op: "call", name: "Array.init", nArgs: 0 },
    { op: "call", name: "Output.init", nArgs: 0 },
    { op: "call", name: "Screen.init", nArgs: 0 },
    { op: "call", name: "Keyboard.init", nArgs: 0 },
    { op: "call", name: "Memory.init", nArgs: 0 },
    { op: "call", name: "Main.main", nArgs: 0 },
  ],
};

const ARRAY_NEW_BRIDGE: VmFunction = {
  name: "Array.new",
  labels: {},
  nVars: 0,
  opBase: 0,
  operations: [
    { op: "function", name: "Array.new", nVars: 0 },
    { op: "push", segment: "argument", offset: 0 },
    { op: "call", name: "Memory.alloc", nArgs: 1 },
    { op: "return" },
  ],
};

const ARRAY_DISPOSE_BRIDGE: VmFunction = {
  name: "Array.dispose",
  labels: {},
  nVars: 0,
  opBase: 0,
  operations: [
    { op: "function", name: "Array.dispose", nVars: 0 },
    { op: "push", segment: "argument", offset: 0 },
    { op: "call", name: "Memory.deAlloc", nArgs: 1 },
    { op: "pop", segment: "temp", offset: 0 },
    { op: "push", segment: "constant", offset: 0 },
    { op: "return" },
  ],
};

// Walks a string by calling String.length / String.charAt so a
// user-supplied String.jack (with a custom internal layout) is honoured by
// the builtin Output.printString. local 0 = i, local 1 = length.
const OUTPUT_PRINT_STRING_BRIDGE: VmFunction = {
  name: "Output.printString",
  labels: { LOOP: 6, END: 21 },
  nVars: 2,
  opBase: 0,
  operations: [
    { op: "function", name: "Output.printString", nVars: 2 },
    { op: "push", segment: "argument", offset: 0 },
    { op: "call", name: "String.length", nArgs: 1 },
    { op: "pop", segment: "local", offset: 1 },
    { op: "push", segment: "constant", offset: 0 },
    { op: "pop", segment: "local", offset: 0 },
    { op: "label", label: "LOOP" },
    { op: "push", segment: "local", offset: 0 },
    { op: "push", segment: "local", offset: 1 },
    { op: "eq" },
    { op: "if-goto", label: "END" },
    { op: "push", segment: "argument", offset: 0 },
    { op: "push", segment: "local", offset: 0 },
    { op: "call", name: "String.charAt", nArgs: 2 },
    { op: "call", name: "Output.printChar", nArgs: 1 },
    { op: "pop", segment: "temp", offset: 0 },
    { op: "push", segment: "local", offset: 0 },
    { op: "push", segment: "constant", offset: 1 },
    { op: "add" },
    { op: "pop", segment: "local", offset: 0 },
    { op: "goto", label: "LOOP" },
    { op: "label", label: "END" },
    { op: "push", segment: "constant", offset: 0 },
    { op: "return" },
  ],
};

/**
 * A parsed VM file. `skips` is the provenance of the lines that recovery
 * dropped from `instructions`; only `loadVm`, which reports their syntax
 * diagnostics, gives it.
 */
export interface ParsedVmFile {
  name: string;
  instructions: VmInstruction[];
  skips?: Provenance;
}

/** A named VM source, as the editor and the file pickers hold it. */
export interface VmFile {
  name: string;
  content: string;
}

/** Options of the VM final call. */
export interface LoadVmOptions {
  /** Recover from syntax errors to keep checking. Default true. */
  attemptRecovery?: boolean;
  /**
   * Check that each function's class prefix names its file. Default true. A
   * single editor buffer has no file name to match, so it passes false. This
   * disables only that equality: a function name of the wrong shape is
   * rejected either way.
   */
  validateFileNames?: boolean;
}

/** The key of every diagnostic that has no source file of its own. */
export const VM_INPUT = "<input>.vm";

/** The failure of a build: the nonempty merged diagnostics of each file. */
export type VmFailure = Record<string, Diagnostics>;

/**
 * What a build knows of the lines recovery dropped. A dropped line may have
 * been any instruction, so a check whose input a dropped line could supply is
 * suppressed, and only that check:
 *
 * - `anywhere`: some line, or a whole file, is missing, and could have
 *   declared a function or the program's entry. That suppresses the checks
 *   of an undefined function, of a builtin's argument count (a dropped
 *   function could override the builtin) and of the entry point.
 * - `functions`: the functions whose bodies held a dropped line, which could
 *   have declared a label. That suppresses the undeclared label checks of
 *   those functions only.
 */
interface Damage {
  readonly anywhere: boolean;
  readonly functions: ReadonlySet<string>;
}

const NO_DAMAGE: Damage = { anywhere: false, functions: new Set() };

/**
 * The damage of parsed files. A dropped line belongs to the last function
 * declared before it, in its own file or, before a file's first function, in
 * the files before it. `unparsed` is true when a file built no tree at all.
 */
function damageOf(files: ParsedVmFile[], unparsed: boolean): Damage {
  const functions = new Set<string>();
  let anywhere = unparsed;
  let current = IMPLICIT;
  for (const { instructions, skips = [] } of files) {
    const headers = instructions.filter(
      (instruction): instruction is FunctionInstruction =>
        instruction.op === "function",
    );
    for (const { interval } of skips) {
      anywhere = true;
      const owner = headers.filter(
        ({ span }) => span !== undefined && span.start <= interval.start,
      );
      functions.add(owner.at(-1)?.name ?? current);
    }
    current = headers.at(-1)?.name ?? current;
  }
  return { anywhere, functions };
}

/**
 * The diagnostics of one build, by the file each belongs to. A diagnostic with
 * a span lies in the file whose instruction owns that span object; any other
 * belongs to the file the caller names, or to `VM_INPUT`.
 */
class Report {
  private readonly lists: Record<string, Diagnostic[]> = {};

  constructor(private readonly owners: ReadonlyMap<Span, string> = new Map()) {}

  add(diagnostic: Diagnostic, file?: string) {
    const owner =
      (diagnostic.span && this.owners.get(diagnostic.span)) ?? file ?? VM_INPUT;
    this.lists[owner] ??= [];
    this.lists[owner].push(diagnostic);
  }

  get isEmpty(): boolean {
    return Object.keys(this.lists).length === 0;
  }

  /** The first diagnostic added, for callers that stop at the first. */
  first(): Diagnostic | undefined {
    return Object.values(this.lists)[0]?.[0];
  }

  /** Each file's diagnostics in source order, without the files with none. */
  merged(origins?: ReadonlyMap<Diagnostic, Origin>): VmFailure {
    const files: Record<string, Diagnostics> = {};
    for (const [file, [first, ...rest]] of Object.entries(this.lists)) {
      if (first !== undefined) {
        files[file] = [first, ...rest];
      }
    }
    return mergeByFile(files, origins);
  }
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
            (op as StackInstruction).offset,
          );
        }
      }
    }
  }

  private static fileBasenameNoExtension(file: string): string {
    // Files that are part of the web-ide are usually passed with folders but without extensions.
    // e.g.: /projects/08/FibonacciElement/Sys
    if (file.includes("/")) {
      file = file.split("/").pop() ?? "";
    }

    // Local files on Windows are usually passed with extension.
    // e.g.: Sys.vm
    if (file.includes(".")) {
      file = file.split(".")[0];
    }

    return file;

    // TODO: Check if this also works for Linux and MacOS
  }

  /**
   * Reports each function of `file` whose name is not `<class>.<name>`, and,
   * with `matchFileName`, each whose class is not the file's name.
   */
  private static validateFile(
    file: ParsedVmFile,
    matchFileName: boolean,
    report: Report,
  ) {
    for (const inst of file.instructions) {
      if (inst.op == "function") {
        const parts = inst.name.split(".");
        if (parts.length != 2) {
          report.add(
            semanticError(
              `Illegal subroutine name ${inst.name} (Expected <className>.<SubroutineName>)`,
              inst.span,
            ),
            file.name,
          );
        } else if (
          matchFileName &&
          parts[0] != this.fileBasenameNoExtension(file.name)
        ) {
          report.add(
            semanticError(
              `File name ${file.name} doesn't match class name ${parts[0]} (at ${inst.name})`,
              inst.span,
            ),
            file.name,
          );
        }
      }
    }
  }

  private static validateFiles(
    files: ParsedVmFile[],
    matchFileName: boolean,
    report: Report,
  ) {
    const names: Set<string> = new Set();

    for (const file of files) {
      if (names.has(file.name)) {
        report.add(
          semanticError(`File ${file.name} already exists`),
          file.name,
        );
      }
      names.add(file.name);
      this.validateFile(file, matchFileName, report);
    }
  }

  private validateStackInstructions(report: Report) {
    for (const fn of Object.values(this.functionMap)) {
      for (const inst of fn.operations) {
        if (inst.op == "pop" || inst.op == "push") {
          try {
            const base = this.memory.baseSegment(inst.segment, inst.offset);
            if (isErr(base)) {
              report.add(semanticError(Err(base).message, inst.span));
            }
          } catch (e) {
            // A pointer offset out of bounds throws instead of giving an Err.
            report.add(
              semanticError(
                e instanceof Error ? e.message : String(e),
                inst.span,
              ),
            );
          }
        }
      }
    }
  }

  /**
   * Reports each function and call of `instructions` that is ill formed. A
   * call to a function that is not declared is a builtin or an error, unless
   * `damage` says a dropped line could have declared it.
   */
  private static validateFunctions(
    instructions: VmInstruction[],
    report: Report,
    damage: Damage,
  ) {
    const functions: Set<string> = new Set();
    const calls = [];

    for (const inst of instructions) {
      if (inst.op == "function") {
        if (inst.nVars < 0 || inst.nVars > 32767) {
          report.add(
            semanticError(
              `Illegal number of local variables ${inst.nVars} (Expected 0-32767)`,
              inst.span,
            ),
          );
        }
        functions.add(inst.name);
      }
      if (inst.op == "call") {
        if (inst.nArgs < 0 || inst.nArgs > 32767) {
          report.add(
            semanticError(
              `Illegal number of arguments ${inst.nArgs} (Expected 0-32767)`,
              inst.span,
            ),
          );
        }
        calls.push(inst as CallInstruction);
      }
    }

    // Suppressed under `damage.anywhere`: a dropped line could have declared
    // the function, which also overrides any builtin of its name.
    if (damage.anywhere) {
      return;
    }
    for (const call of calls) {
      if (!functions.has(call.name)) {
        const builtin = VM_BUILTINS[call.name];
        if (builtin) {
          const expectedNArgs =
            builtin.type == "method"
              ? builtin.args.length + 1
              : builtin.args.length;
          if (expectedNArgs != call.nArgs) {
            report.add(
              semanticError(
                `OS function ${call.name} expects ${
                  expectedNArgs
                } arguments, not ${call.nArgs}`,
                call.span,
              ),
            );
          }
        } else {
          report.add(
            semanticError(`Undefined function ${call.name}`, call.span),
          );
        }
      }
    }
  }

  /**
   * Builds each file's functions and checks them. Every file is checked, and
   * every check reports all that it finds; no `Vm` is given when there is any.
   */
  private static check(
    files: ParsedVmFile[],
    rules: { names: boolean; matchFileName: boolean; unparsed: boolean },
  ): Result<Vm, VmFailure> {
    const owners = new Map<Span, string>();
    for (const { name, instructions } of files) {
      for (const { span } of instructions) {
        if (span !== undefined) {
          owners.set(span, name);
        }
      }
    }
    const report = new Report(owners);
    const damage = damageOf(files, rules.unparsed);
    if (rules.names) {
      this.validateFiles(files, rules.matchFileName, report);
    }
    const instructions = files.flatMap((file) => file.instructions);
    this.validateFunctions(instructions, report, damage);

    const vm = new Vm();
    vm.loadInto(instructions, false, report, damage);
    const booted = vm.bootstrap();
    // Suppressed under `damage.anywhere`: a dropped line could have declared
    // the entry point, or the first function that makes the implicit one illegal.
    if (isErr(booted) && !damage.anywhere) {
      report.add({ ...Err(booted), stage: "semantic" });
    }

    return report.isEmpty ? Ok(vm) : Err(report.merged());
  }

  /**
   * Builds a VM from named files, or fails with every diagnostic of each
   * file. By default each function's class must be its file's name; a function
   * name that is not `<class>.<name>` is always rejected.
   */
  static buildFromFiles(
    files: ParsedVmFile[],
    options: { validateFileNames?: boolean; unparsed?: boolean } = {},
  ): Result<Vm, VmFailure> {
    if (files.length === 0) {
      return Err({
        [VM_INPUT]: [
          semanticError("No .vm files to load. Compile your Jack files first."),
        ],
      });
    }
    return this.check(files, {
      names: true,
      matchFileName: options.validateFileNames ?? true,
      unparsed: options.unparsed ?? false,
    });
  }

  /**
   * Builds a VM from instructions that have no file. This raw path checks no
   * function name's shape; the final call `loadVm` does.
   */
  static build(instructions: VmInstruction[]): Result<Vm, VmFailure> {
    return this.check([{ name: VM_INPUT, instructions }], {
      names: false,
      matchFileName: false,
      unparsed: false,
    });
  }

  /**
   * Builds the function that starts at `instructions[i]`, reporting its label
   * errors, and gives it with the index where the next function starts.
   * `damaged` is true when a dropped line could have declared one of its labels.
   */
  private static buildFunction(
    instructions: VmInstruction[],
    i: number,
    report: Report,
    damaged: boolean,
  ): [VmFunction, number] {
    if (instructions[i].op !== "function")
      throw new Error(
        "Only call buildFunction at the initial Function instruction",
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
    const usedLabels: [string, Span | undefined][] = [];

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
          usedLabels.push([label, instructions[i].span]);
          fn.operations.push({
            op: instructions[i].op as "goto" | "if-goto",
            label,
            span: instructions[i].span,
          });
          break;
        }
        case "label": {
          const { label } = instructions[i] as { label: string };
          if (declaredLabels.has(label)) {
            report.add(
              semanticError(
                `Cannot redeclare label ${label} in function ${
                  fn.name
                } (previously at line ${fn.labels[label] + 1})`,
                instructions[i].span,
              ),
            );
          } else {
            declaredLabels.add(label);
            fn.labels[label] = fn.operations.length;
          }
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

    // Suppressed when `damaged`: a dropped line of this function could have
    // declared the label.
    if (!damaged) {
      for (const [label, span] of usedLabels) {
        if (!declaredLabels.has(label)) {
          report.add(semanticError(`Undeclared label ${label}`, span));
        }
      }
    }

    return [fn, i];
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
      return undefined;
    }
    if (this.invocation.opPtr > this.currentFunction.operations.length)
      throw new Error(
        `Current operation step beyond end of function operations (${this.invocation.opPtr} > ${this.currentFunction.operations.length})`,
      );

    return this.currentFunction.operations[this.invocation.opPtr];
  }

  load(instructions: VmInstruction[], reset = false): Result<this, Diagnostic> {
    const report = new Report();
    this.loadInto(instructions, reset, report, NO_DAMAGE);
    const first = report.first();
    return first === undefined ? Ok(this) : Err(first);
  }

  /** `load`, reporting every diagnostic of `instructions` to `report`. */
  private loadInto(
    instructions: VmInstruction[],
    reset: boolean,
    report: Report,
    damage: Damage,
  ) {
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
      const header = instructions[i] as FunctionInstruction;
      const [fn, next] = Vm.buildFunction(
        instructions,
        i,
        report,
        damage.functions.has(header.name),
      );
      if (
        this.functionMap[fn.name] &&
        this.memory.strict &&
        fn.name !== IMPLICIT &&
        fn.name !== SYS_INIT.name
      ) {
        report.add(
          semanticError(
            `VM Already has a function named ${fn.name}`,
            header.span,
          ),
        );
      }

      this.functionMap[fn.name] = fn;
      i = next;
    }

    this.validateStackInstructions(report);
    this.registerStatics();

    if (reset) {
      this.bootstrap();
    }
  }

  bootstrap() {
    if (!this.functionMap[SYS_INIT.name] && this.functionMap["Main.main"]) {
      this.functionMap[SYS_INIT.name] = SYS_INIT;
      this.addedSysInit = true;
      // TODO should this be an error from the compiler/OS?
    }

    if (
      this.functionMap["Memory.alloc"] &&
      !this.functionMap[ARRAY_NEW_BRIDGE.name]
    ) {
      this.functionMap[ARRAY_NEW_BRIDGE.name] = ARRAY_NEW_BRIDGE;
    }
    if (
      this.functionMap["Memory.deAlloc"] &&
      !this.functionMap[ARRAY_DISPOSE_BRIDGE.name]
    ) {
      this.functionMap[ARRAY_DISPOSE_BRIDGE.name] = ARRAY_DISPOSE_BRIDGE;
    }
    if (
      this.functionMap["String.charAt"] &&
      !this.functionMap[OUTPUT_PRINT_STRING_BRIDGE.name]
    ) {
      this.functionMap[OUTPUT_PRINT_STRING_BRIDGE.name] =
        OUTPUT_PRINT_STRING_BRIDGE;
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
        createError("Cannot use both bootstrap and an implicit function"),
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
              this.segmentInitializations[segment].n,
            );
            return;
          } else {
            throw new Error(
              `The ${segment} segment cannot be accessed since it was not initialized`,
            );
          }
        }
      }
      if (op.segment == "this" && this.invocation.thisInitialized) {
        this.invocation.thisN = Math.max(
          op.offset + 1,
          this.invocation.thisN ?? 0,
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
        `The this segment cannot be accessed since it was not initialized`,
      );
    }
    if (op.segment == "that" && !this.invocation.thatInitialized) {
      throw new Error(
        `The that segment cannot be accessed since it was not initialized`,
      );
    }
    if (op.segment == "that") {
      this.invocation.thatN = Math.max(
        op.offset + 1,
        this.invocation.thatN ?? 1,
      );
    }
  }

  setPaused(paused = true) {
    this.os.paused = paused;
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
          operation.offset,
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
            this.invocation.thatN = 1;
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
            this.functionMap[fnName].nVars,
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
        `Attempting GOTO to unknown label ${label} in ${this.currentFunction.name}`,
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
      const nThat = this.invocation.thatN ?? 1;
      const stackCount = frameEnd - stackBase;
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
          count: Math.max(0, stackCount),
          values:
            stackCount > 0
              ? [...this.memory.map((_, v) => v, stackBase, frameEnd)]
              : [],
        },
        this: {
          base: THIS,
          count: nThis,
          values: [...this.memory.map((_, v) => v, THIS, THIS + nThis)],
        },
        that: {
          base: THAT,
          count: nThat,
          values: [...this.memory.map((_, v) => v, THAT, THAT + nThat)],
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
      this.invocation.thatN ?? 1,
      nextFrame,
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

/** Where each file starts in the joined buffer of `files`: characters and lines. */
function joinedBases(files: VmFile[]): { chars: number; lines: number }[] {
  const bases = [];
  let chars = 0;
  let lines = 0;
  for (const { content } of files) {
    bases.push({ chars, lines });
    // The joining newline follows each file's content, whatever it ends with.
    chars += content.length + 1;
    lines += content.split("\n").length;
  }
  return bases;
}

/**
 * Loads VM files to a `Vm`, or to every diagnostic of each file, in source
 * order. Each key is a file's name, or `VM_INPUT` for a failure of no file. No
 * `Vm` is given when there is any diagnostic.
 *
 * A file that recovered from syntax errors still has its intact functions
 * checked; a file that built no tree is checked as syntax only, and a check
 * whose input it could have supplied is suppressed (see `Damage`).
 *
 * The spans of a given `Vm`'s instructions lie in the joined buffer
 * `files.map((f) => f.content).join("\n")`, where an editor shows them. The
 * spans of diagnostics stay local to their file: see `joinedDiagnostics`.
 */
export function loadVm(
  files: VmFile[],
  options: LoadVmOptions = {},
): Result<Vm, VmFailure> {
  if (files.length === 0) {
    return Vm.buildFromFiles([]);
  }
  const attemptRecovery = options.attemptRecovery ?? true;
  const bases = joinedBases(files);
  const report = new Report();
  const origins = new Map<Diagnostic, Origin>();
  const parsed: ParsedVmFile[] = [];
  const placed: (() => void)[] = [];
  let unparsed = false;
  files.forEach(({ name, content }, i) => {
    const outcome = VM.parse(content, { attemptRecovery });
    for (const diagnostic of outcome.diagnostics) {
      report.add(diagnostic, name);
    }
    const recovered = recoveredOf(outcome, prune);
    if (recovered === undefined) {
      unparsed = true;
      return;
    }
    for (const { diagnostic, key } of recovered.provenance) {
      if (key !== undefined) {
        origins.set(diagnostic, { recovery: key });
      }
    }
    const instructions = [...recovered.ast.instructions];
    parsed.push({ name, instructions, skips: recovered.provenance });
    placed.push(() => {
      for (const { span } of instructions) {
        if (span !== undefined) {
          span.start += bases[i].chars;
          span.end += bases[i].chars;
          span.line += bases[i].lines;
        }
      }
    });
  });

  if (parsed.length > 0) {
    const built = Vm.buildFromFiles(parsed, {
      validateFileNames: options.validateFileNames ?? true,
      unparsed,
    });
    if (isErr(built)) {
      for (const [name, diagnostics] of Object.entries(Err(built))) {
        for (const diagnostic of diagnostics) {
          report.add(diagnostic, name);
        }
      }
    } else if (report.isEmpty) {
      placed.forEach((place) => place());
      return built;
    }
  }
  return Err(report.merged(origins));
}

/**
 * The diagnostics of a failed `loadVm` as an editor of the joined buffer
 * `files.map((f) => f.content).join("\n")` shows them: file by file, each
 * diagnostic a copy whose span (both ends and line) and "Line N:" message
 * lie in the joined buffer. The failure's own diagnostics stay file-local.
 */
export function joinedDiagnostics(
  files: VmFile[],
  failure: VmFailure,
): Diagnostic[] {
  const bases = joinedBases(files);
  const names = [...new Set(files.map(({ name }) => name))];
  const others = Object.keys(failure).filter((name) => !names.includes(name));
  return [...names, ...others].flatMap((name) => {
    const base = bases[files.findIndex((file) => file.name === name)];
    return (failure[name] ?? []).map((diagnostic) =>
      base === undefined || diagnostic.span === undefined
        ? { ...diagnostic }
        : movedBy(diagnostic, diagnostic.span, base),
    );
  });
}

function movedBy(
  diagnostic: Diagnostic,
  span: Span,
  base: { chars: number; lines: number },
): Diagnostic {
  const line = span.line + base.lines;
  const label = `Line ${span.line}: `;
  return {
    ...diagnostic,
    message: diagnostic.message.startsWith(label)
      ? `Line ${line}: ${diagnostic.message.slice(label.length)}`
      : diagnostic.message,
    span: { start: span.start + base.chars, end: span.end + base.chars, line },
  };
}
