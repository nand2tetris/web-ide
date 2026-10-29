/** Reads tst files to apply and perform test runs. */

import { grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  carrierOf,
  grammars,
  isRecovered,
  makeParser,
  makePrune,
  type Recovery,
  type RecoveryPoint,
  Span,
  span,
} from "./base.js";

import vmGrammar from "./grammars/vm.ohm.js";
export const grammar = ohmGrammar(vmGrammar, grammars);
export const vmSemantics = grammar.extendSemantics(baseSemantics);

/**
 * One type for valid and recovered programs: a recovered line is a null
 * instruction (see `isRecovered`).
 */
export interface Vm {
  instructions: VmInstruction[];
}

export type Segment =
  | "argument"
  | "local"
  | "static"
  | "constant"
  | "this"
  | "that"
  | "pointer"
  | "temp";

export type VmInstruction =
  | StackInstruction
  | OpInstruction
  | FunctionInstruction
  | CallInstruction
  | ReturnInstruction
  | GotoInstruction
  | LabelInstruction;

export interface StackInstruction extends Recovery {
  op: "push" | "pop";
  segment: Segment;
  offset: number;
  span?: Span;
}
export interface OpInstruction extends Recovery {
  op: "add" | "sub" | "neg" | "lt" | "gt" | "eq" | "and" | "or" | "not";
  span?: Span;
}
export interface FunctionInstruction extends Recovery {
  op: "function";
  name: string;
  nVars: number;
  span?: Span;
}
export interface CallInstruction extends Recovery {
  op: "call";
  name: string;
  nArgs: number;
  span?: Span;
}
export interface ReturnInstruction extends Recovery {
  op: "return";
  span?: Span;
}
export interface LabelInstruction extends Recovery {
  op: "label";
  label: string;
  span?: Span;
}
export interface GotoInstruction extends Recovery {
  op: "goto" | "if-goto";
  label: string;
  span?: Span;
}

/**
 * What a skipped line could have been, as provenance records it. The kind of
 * the instruction its first token names, or `VmInstruction` when that token
 * names none, so the line could have been any instruction, a `function`
 * declaration among them.
 */
export type VmSkipKind =
  | "StackInstruction"
  | "OpInstruction"
  | "FunctionInstruction"
  | "CallInstruction"
  | "ReturnInstruction"
  | "GotoInstruction"
  | "LabelInstruction"
  | "VmInstruction";

/**
 * The instruction kind each opening word names; a word that is not here names
 * none. The words are the grammar's `push`, `pop`, `function`, ... rules and
 * the operator rules of `OpInstruction`.
 */
const KIND_OF_WORD: Readonly<Record<string, VmSkipKind>> = {
  push: "StackInstruction",
  pop: "StackInstruction",
  function: "FunctionInstruction",
  call: "CallInstruction",
  return: "ReturnInstruction",
  goto: "GotoInstruction",
  "if-goto": "GotoInstruction",
  label: "LabelInstruction",
  add: "OpInstruction",
  sub: "OpInstruction",
  neg: "OpInstruction",
  lt: "OpInstruction",
  gt: "OpInstruction",
  eq: "OpInstruction",
  and: "OpInstruction",
  or: "OpInstruction",
  not: "OpInstruction",
};

/**
 * The kind of the skipped `line`, from its first token, the run up to the
 * first space. The grammar cannot say: one synchronizer follows every
 * instruction, so a failure anywhere in a line skips the whole line, and the
 * only record of what it was is its text.
 *
 * A first token that is not an instruction word (a misspelled `fucntion`, a
 * stray symbol, a word run into the next token) leaves the line possibly any
 * instruction, a `function` header included, because that is the conservative
 * reading. It is `VmInstruction`.
 */
export function skippedKind(line: string): VmSkipKind {
  const [word] = line.trim().split(/\s/, 1);
  return Object.hasOwn(KIND_OF_WORD, word)
    ? KIND_OF_WORD[word]
    : "VmInstruction";
}

/**
 * True when a line skipped as `kind` could have been a `function` declaration:
 * it was read as one, or its first token named no instruction.
 */
export function couldBeFunctionHeader(kind: string): boolean {
  return kind === "FunctionInstruction" || kind === "VmInstruction";
}

/**
 * The null instruction where recovery skipped `line`: a label with no name,
 * which does nothing when run. It is a label only by its op; `recovery`
 * marks it.
 */
function nullInstruction(point: RecoveryPoint, line: string): VmInstruction {
  return {
    op: "label",
    label: "",
    span: point.span,
    ...carrierOf(point, skippedKind(line)),
  };
}

vmSemantics.addAttribute<
  | "push"
  | "pop"
  | "function"
  | "call"
  | "return"
  | "goto"
  | "if-goto"
  | "label"
  | "add"
  | "sub"
  | "neg"
  | "lt"
  | "gt"
  | "eq"
  | "and"
  | "or"
  | "not"
>("op", {
  push(_a, _b) {
    return "push";
  },
  pop(_a, _b) {
    return "pop";
  },
  function(_a, _b) {
    return "function";
  },
  call(_a, _b) {
    return "call";
  },
  return(_a) {
    return "return";
  },
  goto(_a, _b) {
    return "goto";
  },
  ifGoto(_a, _b) {
    return "if-goto";
  },
  label(_a, _b) {
    return "label";
  },
  Add(_) {
    return "add";
  },
  Sub(_) {
    return "sub";
  },
  Neg(_) {
    return "neg";
  },
  Eq(_) {
    return "eq";
  },
  Lt(_) {
    return "lt";
  },
  Gt(_) {
    return "gt";
  },
  And(_) {
    return "and";
  },
  Or(_) {
    return "or";
  },
  Not(_) {
    return "not";
  },
});

vmSemantics.addAttribute<
  | "argument"
  | "local"
  | "static"
  | "constant"
  | "this"
  | "that"
  | "pointer"
  | "temp"
>("segment", {
  argument(_a, _b) {
    return "argument";
  },
  local(_a, _b) {
    return "local";
  },
  static(_a, _b) {
    return "static";
  },
  constant(_a, _b) {
    return "constant";
  },
  this(_a, _b) {
    return "this";
  },
  that(_a, _b) {
    return "that";
  },
  pointer(_a, _b) {
    return "pointer";
  },
  temp(_a, _b) {
    return "temp";
  },
});

vmSemantics.addAttribute<VmInstruction>("instruction", {
  StackInstruction({ op }, { segment }, value) {
    return {
      op: op as "push" | "pop",
      segment,
      offset: Number(value.sourceString),
      span: span(this.source),
    };
  },
  OpInstruction({ op }) {
    return {
      op: op as
        | "add"
        | "sub"
        | "neg"
        | "lt"
        | "gt"
        | "eq"
        | "and"
        | "or"
        | "not",
      span: span(this.source),
    };
  },
  FunctionInstruction(_, { name }, nVars) {
    return {
      op: "function",
      name,
      nVars: Number(nVars.sourceString),
      span: span(this.source),
    };
  },
  CallInstruction(_, { name }, nArgs) {
    return {
      op: "call",
      name,
      nArgs: Number(nArgs.sourceString),
      span: span(this.source),
    };
  },
  ReturnInstruction(_) {
    return { op: "return", span: span(this.source) };
  },
  // LabelInstruction = Label Name
  LabelInstruction(_, { name: label }) {
    return { op: "label", label, span: span(this.source) };
  },
  // GotoInstruction = (Goto | IfGoto) Name
  GotoInstruction({ op }, { name: label }) {
    return {
      op: op as "goto" | "if-goto",
      label,
      span: span(this.source),
    };
  },
  VmInstructionLine(inst, end) {
    const recovered: RecoveryPoint | undefined = end.recovery;
    return recovered
      ? nullInstruction(recovered, end.sourceString)
      : inst.instruction;
  },
});

vmSemantics.addAttribute<Vm>("vm", {
  Vm(_, lines) {
    return {
      instructions: lines.children.map(
        (node) => node.instruction as VmInstruction,
      ),
    };
  },
});

vmSemantics.addAttribute<Vm>("root", {
  Root({ vm }) {
    return vm;
  },
});

/**
 * Drops each skipped line. The result is checked and minted `Valid`.
 *
 * Provenance names the kind of each skipped line (see `skippedKind`), so a
 * check whose input a skipped line could supply is suppressed only by a line
 * of a kind that could supply it.
 */
export const prune = makePrune<Vm>((tree) => ({
  ...tree,
  instructions: tree.instructions.filter(
    (instruction) => !isRecovered(instruction),
  ),
}));

/** The null root of a parse that built no program: no instructions. */
function emptyVm(): Vm {
  return { instructions: [] };
}

export const VM = {
  grammar: vmGrammar,
  semantics: vmSemantics,
  parser: grammar,
  ...makeParser<Vm>(grammar, vmSemantics, emptyVm),
};
