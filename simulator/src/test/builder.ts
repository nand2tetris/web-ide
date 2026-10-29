import { checkExhaustive } from "@davidsouther/jiffies/assert.ts";
import {
  Err,
  isErr,
  Ok,
  Result,
  unwrap,
} from "@davidsouther/jiffies/result.ts";
import type { Chip } from "../chip/chip.js";
import type { ROM } from "../cpu/memory.js";
import {
  type Diagnostic,
  type Diagnostics,
  mergeDiagnostics,
  originsOf,
  recoveredOf,
  type Skip,
  type Span,
  semanticError,
} from "../languages/base.js";
import {
  prune,
  TST,
  Tst,
  TstCommand,
  TstOperation,
  type TstSkipKind,
  TstStatement,
  TstWhileStatement,
} from "../languages/tst.js";
import type { Action, AsyncAction } from "../types.js";
import {
  ChipTest,
  TestEvalInstruction,
  TestTickInstruction,
  TestTockInstruction,
} from "./chiptst.js";
import {
  CPUTest,
  TestResetRamInstruction,
  TestTickTockInstruction,
} from "./cputst.js";
import {
  Condition,
  TestBreakInstruction,
  TestClearEchoInstruction,
  TestCompareToInstruction,
  TestEchoInstruction,
  TestInstruction,
  TestLoadInstruction,
  TestLoadROMInstruction,
  TestOutputFileInstruction,
  TestOutputInstruction,
  TestOutputListInstruction,
  TestRepeatInstruction,
  TestSetInstruction,
  TestStopInstruction,
  TestWhileInstruction,
} from "./instruction.js";
import { Test } from "./tst.js";
import { TestVMStepInstruction, VMTest } from "./vmtst.js";

export function isTstCommand(line: TstStatement): line is TstCommand {
  return (line as TstCommand).op !== undefined;
}

function isTstWhileStatement(line: TstStatement): line is TstWhileStatement {
  return (line as TstWhileStatement).condition !== undefined;
}

function makeInstruction(inst: TstOperation) {
  const { op } = inst;
  switch (op) {
    case "tick":
      return new TestTickInstruction();
    case "tock":
      return new TestTockInstruction();
    case "ticktock":
      return new TestTickTockInstruction();
    case "eval":
      return new TestEvalInstruction();
    case "vmstep":
      return new TestVMStepInstruction();
    case "output":
      return new TestOutputInstruction();
    case "set":
      return new TestSetInstruction(inst.id, inst.value, inst.index);
    case "output-list":
      return new TestOutputListInstruction(inst.spec);
    case "echo":
      return new TestEchoInstruction(inst.message);
    case "clear-echo":
      return new TestClearEchoInstruction();
    case "loadRom":
      return new TestLoadROMInstruction(inst.file);
    case "load":
      return new TestLoadInstruction(inst.file);
    case "output-file":
      return new TestOutputFileInstruction(inst.file);
    case "compare-to":
      return new TestCompareToInstruction(inst.file);
    case "resetRam":
      return new TestResetRamInstruction();
    default:
      checkExhaustive(op, `Unknown tst operation ${op}`);
  }
}

/** A test script: its name, the full path when known, and its source. */
export interface TstSource {
  name: string;
  content: string;
}

/** Options of the TST final call that every target shares. */
export interface TstRecoveryOptions {
  /** Recover from syntax errors to keep checking. Default true. */
  attemptRecovery?: boolean;
}

/** `ChipTest.from`'s options, and recovery. */
export type ChipTstBuildOptions = TstRecoveryOptions & {
  dir?: string;
  setStatus?: Action<string>;
  loadAction?: (path: string) => Promise<Chip>;
  compareTo?: Action<string>;
  requireLoad?: boolean;
};

/** `CPUTest.from`'s options, and recovery. */
export type CpuTstBuildOptions = TstRecoveryOptions & {
  dir?: string;
  rom?: ROM;
  doEcho?: Action<string>;
  doLoad?: AsyncAction<string>;
  compareTo?: Action<string>;
  requireLoad?: boolean;
};

/** `VMTest.from`'s options, and recovery. A VM test always requires a load. */
export type VmTstBuildOptions = TstRecoveryOptions & {
  dir?: string;
  doLoad?: AsyncAction<string>;
  doEcho?: Action<string>;
  compareTo?: Action<string>;
};

/**
 * Builds a test script to the test of `target`, or to every diagnostic of it,
 * in source order. No test is given when there is any diagnostic. Building
 * neither runs the test nor calls its load or compare callbacks; a caller
 * attaches its file system and simulator state to a built test.
 *
 * A script that built no tree has its syntax diagnostics only. A recovered
 * tree is built from its pruned form, and a builder error becomes a
 * `semantic` diagnostic. The missing load is reported at the end of the
 * script, unless a skipped command could have been the load.
 *
 * `source.name` names the script; spans are local to `source.content`.
 */
export function buildTst(
  source: TstSource,
  target: "chip",
  options?: ChipTstBuildOptions,
): Result<ChipTest, Diagnostics>;
export function buildTst(
  source: TstSource,
  target: "cpu",
  options?: CpuTstBuildOptions,
): Result<CPUTest, Diagnostics>;
export function buildTst(
  source: TstSource,
  target: "vm",
  options?: VmTstBuildOptions,
): Result<VMTest, Diagnostics>;
export function buildTst(
  { content }: TstSource,
  target: "chip" | "cpu" | "vm",
  {
    attemptRecovery = true,
    ...options
  }: ChipTstBuildOptions | CpuTstBuildOptions | VmTstBuildOptions = {},
): Result<ChipTest | CPUTest | VMTest, Diagnostics> {
  const outcome = TST.parse(content, { attemptRecovery });
  const recovered = recoveredOf(outcome, prune);
  if (recovered === undefined) {
    return Err(outcome.diagnostics as Diagnostics);
  }
  const diagnostics: Diagnostic[] = [...outcome.diagnostics];
  const origins = new Map(originsOf(recovered.provenance));
  const built = testOf(recovered.ast, target, options);
  if (isErr(built)) {
    const error = Err(built);
    if (!(error instanceof MissingLoadError)) {
      diagnostics.push(semanticError(error.message));
    } else if (!recovered.provenance.some(couldBeLoad)) {
      diagnostics.push(semanticError(error.message, endOf(content)));
    }
  }
  const [first, ...rest] = diagnostics;
  // With no diagnostic the build succeeded: a builder error is suppressed only
  // by a skip, and every skip has its own syntax diagnostic.
  return first === undefined
    ? Ok(unwrap(built))
    : Err(mergeDiagnostics([first, ...rest], origins));
}

/** The target's existing builder over a pruned script. */
function testOf(
  tst: Tst,
  target: "chip" | "cpu" | "vm",
  options: Omit<
    ChipTstBuildOptions & CpuTstBuildOptions & VmTstBuildOptions,
    "attemptRecovery"
  >,
): Result<ChipTest | CPUTest | VMTest, Error> {
  switch (target) {
    case "chip":
      return ChipTest.from(tst, options);
    case "cpu":
      return CPUTest.from(tst, options);
    case "vm":
      return VMTest.from(tst, options);
  }
}

/**
 * A skipped command could have been a load command; a missing block closer
 * could not.
 */
function couldBeLoad({ kind }: Skip): boolean {
  return kind === ("TstOperation" satisfies TstSkipKind);
}

/** The empty span at the end of `content`. */
function endOf(content: string): Span {
  return {
    start: content.length,
    end: content.length,
    line: content.split("\n").length,
  };
}

/** A script with no load command, where its target requires one. */
class MissingLoadError extends Error {
  constructor() {
    super("A test script must have a load command");
  }
}

export function fill<T extends Test>(
  test: T,
  tst: Tst,
  requireLoad = true,
): Result<T, Error> {
  let span: Span | undefined;
  let stepInstructions: TestInstruction[] = [];

  let base: T | TestWhileInstruction | TestRepeatInstruction = test;
  let commands: TstCommand[] = [];

  let hasLoad = false;

  for (const line of tst.lines) {
    if (isTstCommand(line)) {
      base = test;
      commands = [line];
    } else {
      const repeat = isTstWhileStatement(line)
        ? new TestWhileInstruction(
            new Condition(
              line.condition.left,
              line.condition.right,
              line.condition.op,
            ),
          )
        : new TestRepeatInstruction(line.count);
      repeat.span = line.span;
      test.addInstruction(repeat);

      base = repeat;
      commands = line.statements;
    }

    for (const command of commands) {
      if (command.op.op == "load") {
        hasLoad = true;
      }
      const inst = makeInstruction(command.op);
      if (inst !== undefined) {
        if (span === undefined) {
          span = line.span;
        } else {
          span.end = line.span.end;
        }

        base.addInstruction(inst);
        stepInstructions.push(inst);
      }
      if (command.separator != ",") {
        if (command.separator == ";") {
          base.addInstruction(new TestStopInstruction(span ?? command.span));
        } else if (command.separator == "!") {
          base.addInstruction(new TestBreakInstruction(span ?? command.span));
        }
        for (const inst of stepInstructions) {
          inst.span = span ?? command.span;
        }
        span = undefined;
        stepInstructions = [];
      }
    }
  }

  if (requireLoad && !hasLoad) {
    return Err(new MissingLoadError());
  }

  test.reset();

  return Ok(test);
}
