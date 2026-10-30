import { assertExists } from "@davidsouther/jiffies/assert.ts";
import { Err, isErr, Ok, Result } from "@davidsouther/jiffies/result.ts";
import { type Node, grammar as ohmGrammar } from "ohm-js";
import {
  ASSIGN,
  ASSIGN_ASM,
  ASSIGN_OP,
  COMMANDS,
  COMMANDS_ASM,
  COMMANDS_OP,
  isAssignAsm,
  isCommandAsm,
  JUMP,
  JUMP_ASM,
  JUMP_OP,
} from "../cpu/alu.js";
import { KEYBOARD_OFFSET, SCREEN_OFFSET } from "../cpu/memory.js";
import { makeC } from "../util/asm.js";
import {
  actionError,
  baseSemantics,
  carrierOf,
  Diagnostic,
  type Diagnostics,
  diagnostic,
  failedOf,
  grammars,
  guardedRecovery,
  isRecovered,
  makeParser,
  makePrune,
  mergeDiagnostics,
  originsOf,
  type Recovery,
  type RecoveryPoint,
  recoveredOf,
  Span,
  semanticError,
  span,
  type Valid,
} from "./base.js";
import asmGrammar from "./grammars/asm.ohm.js";

export const grammar = ohmGrammar(asmGrammar, grammars);
export const asmSemantics = grammar.extendSemantics(baseSemantics);

/**
 * One type for valid and recovered programs: a recovered line is a null
 * instruction (see `isRecovered`).
 */
export interface Asm {
  instructions: AsmInstruction[];
}

export type AsmInstruction =
  | AsmAInstruction
  | AsmCInstruction
  | AsmLabelInstruction;

export type AsmAInstruction = AsmALabelInstruction | AsmAValueInstruction;
export interface AsmALabelInstruction extends Recovery {
  type: "A";
  label: string;
  span?: Span;
}

export interface AsmAValueInstruction extends Recovery {
  type: "A";
  value: number;
  span?: Span;
}

export function isAValueInstruction(
  inst: AsmInstruction,
): inst is AsmAValueInstruction {
  return inst.type == "A" && (inst as AsmAValueInstruction).value !== undefined;
}

function isALabelInstruction(
  inst: AsmInstruction,
): inst is AsmALabelInstruction {
  return inst.type == "A" && (inst as AsmALabelInstruction).label !== undefined;
}

export interface AsmCInstruction extends Recovery {
  type: "C";
  op: COMMANDS_OP;
  isM: boolean;
  store?: ASSIGN_OP;
  jump?: JUMP_OP;
  span?: Span;
}

export interface AsmLabelInstruction extends Recovery {
  type: "L";
  label: string;
  span?: Span;
}

/**
 * The null instruction where recovery skipped a line: a label with no name,
 * which emits no code. It is a label only by its type; `recovery` marks it.
 */
function nullInstruction(point: RecoveryPoint): AsmInstruction {
  return {
    type: "L",
    label: "",
    span: point.span,
    ...carrierOf(point, "instruction"),
  };
}

/** The null instruction where an instruction action of `kind` failed. */
function failedInstruction(
  diagnostic: Diagnostic,
  at: Span,
  kind: "aInstruction" | "cInstruction",
): AsmInstruction {
  return { type: "L", label: "", span: at, ...failedOf(diagnostic, at, kind) };
}

asmSemantics.addAttribute<Asm>("root", {
  Root(_) {
    return this.asm;
  },
});

asmSemantics.addAttribute<Asm>("asm", {
  ASM(asm) {
    return {
      instructions: asm.children.map(
        (node) => node.intermediateInstruction as AsmInstruction,
      ),
    };
  },
});

asmSemantics.addAttribute<AsmInstruction>("intermediateInstruction", {
  intermediateInstruction(inst, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      inst,
      correction,
    );
    return recovered ? nullInstruction(recovered) : inst.instruction;
  },
});

/** The C target, or the action error of an invalid one. */
function getAsmAssign(assignN: Node): string | Diagnostic {
  let assign = assignN.child(0)?.child(0)?.sourceString ?? "";

  // The book (figure 4.5) specifies DM and ADM as the destination forms, but
  // the desktop simulators accept only MD and AMD, so both are accepted.
  if (assign == "DM") {
    assign = "MD";
  }
  if (assign == "ADM") {
    assign = "AMD";
  }
  if (assign != "" && !isAssignAsm(assign)) {
    const reversed = assign.split("").reverse().join("");
    return actionError(
      "asm.invalidTarget",
      {
        target: assign,
        ...(isAssignAsm(reversed) ? { suggestion: reversed } : {}),
      },
      span(assignN.source),
    );
  }

  return assign;
}

/** The C value, or the action error of an invalid one. */
function getAsmOp(opN: Node): string | Diagnostic {
  const op = opN.sourceString;

  if (!isCommandAsm(op)) {
    const reversed = op.split("").reverse().join("");
    return actionError(
      "asm.invalidValue",
      {
        value: opN.sourceString,
        ...(isCommandAsm(reversed) ? { suggestion: reversed } : {}),
      },
      span(opN.source),
    );
  }

  return op;
}

asmSemantics.addAttribute<AsmInstruction>("instruction", {
  aInstruction(_at, name): AsmInstruction {
    const at = span(this.source);
    if (typeof name.value === "string") return A(name.value, at);
    const value = parseInt(name.value.join(""), 10);
    return isAValue(value)
      ? A(value, at)
      : failedInstruction(
          actionError("asm.aValueRange", { value }, at),
          at,
          "aInstruction",
        );
  },
  cInstruction(assignN, opN, jmpN): AsmInstruction {
    const at = span(this.source);
    const assign = getAsmAssign(assignN);
    const op = getAsmOp(opN);
    // Both are checked, so an instruction reports each invalid part.
    const failed = [assign, op].find((part) => typeof part !== "string");
    if (failed !== undefined) {
      return failedInstruction(failed as Diagnostic, at, "cInstruction");
    }
    const jmp = (jmpN.child(0)?.child(1)?.sourceString ?? "") as JUMP_ASM;
    return C(assign as ASSIGN_ASM, op as COMMANDS_ASM, jmp, at);
  },
  label(_o, { name }, _c): AsmLabelInstruction {
    return L(name, span(this.source));
  },
});

export type Pointer =
  | "R0"
  | "R1"
  | "R2"
  | "R3"
  | "R4"
  | "R5"
  | "R6"
  | "R7"
  | "R8"
  | "R9"
  | "R10"
  | "R11"
  | "R12"
  | "R13"
  | "R14"
  | "R15"
  | "SP"
  | "LCL"
  | "ARG"
  | "THIS"
  | "THAT"
  | "SCREEN"
  | "KBD";

/**
 * Gives each A instruction its label's value, and calls `symbolCallback` for
 * each symbol it defines. Every repeated label is a diagnostic; the first
 * definition of a label is the one that counts.
 */
export function fillLabel(
  asm: Asm,
  symbolCallback?: (name: string, value: number, isVar: boolean) => void,
): Result<void, Diagnostics> {
  let nextLabel = 16;
  const symbols = new Map<Pointer | string, number>([
    ["R0", 0],
    ["R1", 1],
    ["R2", 2],
    ["R3", 3],
    ["R4", 4],
    ["R5", 5],
    ["R6", 6],
    ["R7", 7],
    ["R8", 8],
    ["R9", 9],
    ["R10", 10],
    ["R11", 11],
    ["R12", 12],
    ["R13", 13],
    ["R14", 14],
    ["R15", 15],
    ["SP", 0],
    ["LCL", 1],
    ["ARG", 2],
    ["THIS", 3],
    ["THAT", 4],
    ["SCREEN", SCREEN_OFFSET],
    ["KBD", KEYBOARD_OFFSET],
  ]);

  function getLabelValue(label: string) {
    if (!symbols.has(label)) {
      symbols.set(label, nextLabel);
      symbolCallback?.(label, nextLabel, true);
      nextLabel += 1;
    }
    return assertExists(symbols.get(label), `Label not in symbols: ${label}`);
  }

  function transmuteAInstruction(instruction: AsmALabelInstruction) {
    const value = getLabelValue(instruction.label);
    (instruction as unknown as AsmAValueInstruction).value = value;
    delete (instruction as unknown as { label: undefined }).label;
  }

  const unfilled: AsmALabelInstruction[] = [];
  const duplicates: Diagnostic[] = [];
  let line = 0;
  for (const instruction of asm.instructions) {
    if (instruction.type === "L") {
      if (symbols.has(instruction.label)) {
        duplicates.push(
          semanticError(
            "asm.duplicateLabel",
            { label: instruction.label },
            instruction.span,
          ),
        );
      } else {
        symbols.set(instruction.label, line);
        symbolCallback?.(instruction.label, line, false);
      }
      continue;
    }

    line += 1;

    if (instruction.type === "A") {
      if (isALabelInstruction(instruction)) {
        unfilled.push(instruction);
      }
    }
  }

  const [first, ...rest] = duplicates;
  if (first !== undefined) {
    return Err([first, ...rest]);
  }
  unfilled.forEach(transmuteAInstruction);
  return Ok();
}

function writeCInst(inst: AsmCInstruction): string {
  return (
    (inst.store ? `${ASSIGN.op[inst.store]}=` : "") +
    COMMANDS.op[inst.op] +
    (inst.jump ? `;${JUMP.op[inst.jump]}` : "")
  );
}

export const AsmToString = (inst: AsmInstruction | string): string => {
  if (typeof inst === "string") return inst;
  switch (inst.type) {
    case "A":
      return isALabelInstruction(inst) ? `@${inst.label}` : `@${inst.value}`;
    case "L":
      return `(${inst.label})`;
    case "C":
      return writeCInst(inst);
  }
};

export function translateInstruction(inst: AsmInstruction): number | undefined {
  if (inst.type === "A") {
    if (isALabelInstruction(inst)) {
      throw new Error(`ASM Emitting unfilled A instruction`);
    }
    return inst.value;
  }
  if (inst.type === "C") {
    return makeC(
      inst.isM,
      inst.op,
      (inst.store ?? 0) as ASSIGN_OP,
      (inst.jump ?? 0) as ASSIGN_OP,
    );
  }
  return undefined;
}

export function emit(asm: Asm): number[] {
  return asm.instructions
    .map(translateInstruction)
    .filter((op): op is number => op !== undefined);
}

/** True when `value` fits an A instruction. */
function isAValue(value: number): boolean {
  return !(value > 32767 || value < 0);
}

const A = (source: string | number, span?: Span): AsmAInstruction => {
  if (typeof source === "number" && !isAValue(source)) {
    throw diagnostic("asm.aValueRange", { value: source }, span);
  }
  return typeof source === "string"
    ? {
        type: "A",
        label: source,
        span,
      }
    : {
        type: "A",
        value: source,
        span,
      };
};

const C = (
  assign: ASSIGN_ASM,
  op: COMMANDS_ASM,
  jmp?: JUMP_ASM,
  span?: Span,
): AsmCInstruction => {
  const inst: AsmCInstruction = {
    type: "C",
    op: COMMANDS.getOp(op),
    isM: op.includes("M"),
    span,
  };
  if (jmp) inst.jump = JUMP.asm[jmp];
  if (assign) inst.store = ASSIGN.asm[assign];
  return inst;
};

const AC = (
  source: string | number,
  assign: ASSIGN_ASM,
  op: COMMANDS_ASM,
  jmp?: JUMP_ASM,
) => [A(source), C(assign, op, jmp)];

const L = (label: string, span?: Span): AsmLabelInstruction => ({
  type: "L",
  label,
  span,
});

/** Options of the ASM final call. */
export interface AssembleOptions {
  /** Recover from syntax errors to keep checking. Default true. */
  attemptRecovery?: boolean;
}

/**
 * Drops recovered instructions: a skipped line and an instruction whose action
 * failed. The result is checked and minted `Valid`.
 */
export const prune = makePrune<Asm>((tree) => ({
  ...tree,
  instructions: tree.instructions.filter(
    (instruction) => !isRecovered(instruction),
  ),
}));

/**
 * The one pipeline of the ASM final call: parse, label resolution and the
 * merged diagnostics of both. On success it gives the program with every label
 * resolved, still holding its label instructions and source spans, and calls
 * `symbolCallback` for each symbol as `fillLabel` does.
 *
 * A source that built no tree has its syntax diagnostics only. A recovered
 * tree continues from its pruned form, so a skipped line adds no label and
 * causes no further diagnostic: no check reads what a skipped line could
 * supply, since an unknown symbol is a variable, not an error.
 */
export function resolveAsm(
  source: string,
  options: AssembleOptions = {},
  symbolCallback?: (name: string, value: number, isVar: boolean) => void,
): Result<Valid<Asm>, Diagnostics> {
  const outcome = ASM.parse(source, {
    attemptRecovery: options.attemptRecovery ?? true,
  });
  const recovered = recoveredOf(outcome, prune);
  if (recovered === undefined) {
    return Err(outcome.diagnostics as Diagnostics);
  }
  const diagnostics: Diagnostic[] = [...outcome.diagnostics];
  const origins = new Map(originsOf(recovered.provenance));
  const labels = fillLabel(recovered.ast, symbolCallback);
  if (isErr(labels)) {
    diagnostics.push(...Err(labels));
  }
  const [first, ...rest] = diagnostics;
  return first === undefined
    ? Ok(recovered.ast)
    : Err(mergeDiagnostics([first, ...rest], origins));
}

/**
 * Assembles `source` to its instruction words, or to every diagnostic of it,
 * in source order. No instructions are given when there is any diagnostic.
 */
export function assemble(
  source: string,
  options: AssembleOptions = {},
): Result<number[], Diagnostics> {
  const resolved = resolveAsm(source, options);
  return isErr(resolved) ? resolved : Ok(emit(Ok(resolved)));
}

/** The null root of a parse that built no program: no instructions. */
function emptyAsm(): Asm {
  return { instructions: [] };
}

export const ASM = {
  grammar: asmGrammar,
  semantics: asmSemantics,
  parser: grammar,
  ...makeParser<Asm>(grammar, asmSemantics, emptyAsm),

  passes: {
    fillLabel,
    emit,
  },
  A,
  C,
  AC,
  L,
};
