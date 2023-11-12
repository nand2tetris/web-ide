import { FunctionInstruction, VmInstruction } from "../languages/vm.js";
import { VmCompiler } from "./compiler.js";
import { VmMemory } from "./memory.js";

export type VmOperation =
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
  protected memory = new VmMemory();
  protected functionMap: Record<string, VmFunction> = {
    [BOOTSTRAP.name]: BOOTSTRAP,
  };
  protected executionStack: VmFunctionInvocation[] = [
    { function: BOOTSTRAP.name, op: 0 },
  ];
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

  compiler(): VmCompiler {
    return new VmCompiler(this.functionMap);
  }
}
