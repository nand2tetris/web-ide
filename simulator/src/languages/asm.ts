import { assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";
import ohm from "ohm-js";
import {
  ASSIGN,
  ASSIGN_ASM,
  ASSIGN_OP,
  COMMANDS,
  COMMANDS_ASM,
  COMMANDS_OP,
  JUMP,
  JUMP_ASM,
  JUMP_OP,
} from "../cpu/alu.js";
import { KEYBOARD_OFFSET, SCREEN_OFFSET } from "../cpu/memory.js";
import { makeC } from "../util/asm.js";
import {
  CompilationError,
  Span,
  baseSemantics,
  createError,
  grammars,
  makeParser,
  span,
} from "./base.js";

import { Err, Ok, Result } from "@davidsouther/jiffies/lib/esm/result.js";
import asmGrammar from "./grammars/asm.ohm.js";

export const grammar = ohm.grammar(asmGrammar, grammars);
export const asmSemantics = grammar.extendSemantics(baseSemantics);

export interface Asm {
  instructions: AsmInstruction[];
}

export type AsmInstruction =
  | AsmAInstruction
  | AsmCInstruction
  | AsmLabelInstruction;

export type AsmAInstruction = AsmALabelInstruction | AsmAValueInstruction;
export interface AsmALabelInstruction {
  type: "A";
  label: string;
  span?: Span;
}

export interface AsmAValueInstruction {
  type: "A";
  value: number;
  span?: Span;
}

export function isAValueInstruction(
  inst: AsmInstruction
): inst is AsmAValueInstruction {
  return inst.type == "A" && (inst as AsmAValueInstruction).value !== undefined;
}

function isALabelInstruction(
  inst: AsmInstruction
): inst is AsmALabelInstruction {
  return inst.type == "A" && (inst as AsmALabelInstruction).label !== undefined;
}

export interface AsmCInstruction {
  type: "C";
  op: COMMANDS_OP;
  isM: boolean;
  store?: ASSIGN_OP;
  jump?: JUMP_OP;
  span?: Span;
}

export interface AsmLabelInstruction {
  type: "L";
  label: string;
  span?: Span;
}

asmSemantics.addAttribute<Asm>("root", {
  Root(_) {
    return this.asm;
  },
});

asmSemantics.addAttribute<Asm>("asm", {
  ASM(asm, last) {
    const instructions =
      asm.children.map(
        (node) => node.intermediateInstruction as AsmInstruction
      ) ?? [];
    return {
      instructions: last.child(0)
        ? [...instructions, last.child(0).instruction]
        : instructions,
    };
  },
});

asmSemantics.addAttribute<AsmInstruction>("intermediateInstruction", {
  intermediateInstruction(inst, _n) {
    return inst.instruction;
  },
});

asmSemantics.addAttribute<AsmInstruction>("instruction", {
  aInstruction(_at, name): AsmAInstruction {
    return A(name.value, span(this.source));
  },
  cInstruction(assignN, opN, jmpN): AsmCInstruction {
    let assign = assignN.child(0)?.child(0)?.sourceString ?? "";
    if (assign == "DM") {
      assign = "MD";
    }
    if (assign == "ADM") {
      assign = "AMD";
    }
    const op = opN.sourceString as COMMANDS_ASM;
    const jmp = (jmpN.child(0)?.child(1)?.sourceString ?? "") as JUMP_ASM;
    return C(assign as ASSIGN_ASM, op, jmp, span(this.source));
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

export function fillLabel(
  asm: Asm,
  symbolCallback?: (name: string, value: number, isVar: boolean) => void
): Result<void, CompilationError> {
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
  let line = 0;
  for (const instruction of asm.instructions) {
    if (instruction.type === "L") {
      if (symbols.has(instruction.label)) {
        return Err(
          createError(`Duplicate label ${instruction.label}`, instruction.span)
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
      (inst.jump ?? 0) as ASSIGN_OP
    );
  }
  return undefined;
}

export function emit(asm: Asm): number[] {
  return asm.instructions
    .map(translateInstruction)
    .filter((op): op is number => op !== undefined);
}

const A = (source: string | number, span?: Span): AsmAInstruction =>
  typeof source === "string"
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

const C = (
  assign: ASSIGN_ASM,
  op: COMMANDS_ASM,
  jmp?: JUMP_ASM,
  span?: Span
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
  jmp?: JUMP_ASM
) => [A(source), C(assign, op, jmp)];

const L = (label: string, span?: Span): AsmLabelInstruction => ({
  type: "L",
  label,
  span,
});

export const ASM = {
  grammar: asmGrammar,
  semantics: asmSemantics,
  parser: grammar,
  parse: makeParser<Asm>(grammar, asmSemantics),
  passes: {
    fillLabel,
    emit,
  },
  A,
  C,
  AC,
  L,
};
