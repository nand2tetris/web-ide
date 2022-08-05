import ohm from "ohm-js";
import raw from "raw.macro";
import { ASSIGN, COMMANDS, JUMP } from "../simulator/cpu/alu";
import { grammars, makeParser, baseSemantics } from "./base";

export const asmGrammar = raw("./grammars/asm.ohm");
export const grammar = ohm.grammar(asmGrammar, grammars);
export const asmSemantics = grammar.extendSemantics(baseSemantics);

// reload ...

export interface Asm {
  instructions: AsmInstruction[];
}

export type AsmInstruction =
  | AsmAInstruction
  | AsmCInstruction
  | AsmLabelInstruction;

export interface AsmAInstruction {
  type: "A";
  value?: number;
  label?: string;
}

export interface AsmCInstruction {
  type: "C";
  op: number;
  store: number;
  jump: number;
}

export interface AsmLabelInstruction {
  type: "L";
  label: string;
}

asmSemantics.addAttribute<Asm>("asm", {
  Root(asm) {
    return {
      instructions: asm
        .child(0)
        .children.map(({ instruction }) => instruction as AsmInstruction),
    };
  },
});

asmSemantics.addAttribute<AsmInstruction>("instruction", {
  Instruction(inst): AsmInstruction {
    return inst.child(0).instruction;
  },
  AInstruction(_at, val): AsmAInstruction {
    let value: number | undefined;
    let name: string | undefined;
    try {
      value = val.value;
    } catch (e) {}
    try {
      name = val.name;
    } catch (e) {}

    return {
      type: "A",
      label: name,
      value: value,
    };
  },
  CInstruction(assignN, opN, jmpN): AsmCInstruction {
    const assign = assignN.child(0)?.child(0)
      ?.sourceString as keyof typeof ASSIGN.asm;
    const op = opN.sourceString as keyof typeof COMMANDS.asm;
    const jmp = jmpN.child(0)?.child(1)?.sourceString as keyof typeof JUMP.asm;
    return {
      type: "C",
      op: COMMANDS.asm[op] as unknown as number,
      jump: JUMP.asm[jmp] as unknown as number,
      store: ASSIGN.asm[assign] as unknown as number,
    };
  },
  Label(_o, { name }, _c): AsmLabelInstruction {
    return {
      type: "L",
      label: name,
    };
  },
});

export const ASM = {
  grammar: asmGrammar,
  semantics: asmSemantics,
  parser: grammar,
  parse: makeParser<Asm>(grammar, asmSemantics),
};
