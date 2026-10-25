/** Reads tst files to apply and perform test runs. */

import { type Node, grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  grammars,
  isFail,
  makeParser,
  type ParseError,
  parseErrorOf,
  Span,
  span,
} from "./base.js";

export interface TstEchoOperation {
  op: "echo";
  message: string;
}

export interface TstClearEchoOperation {
  op: "clear-echo";
}

export interface TstSetOperation {
  op: "set";
  id: string;
  index?: number;
  value: number;
}

export interface TstEvalOperation {
  op: "eval" | "tick" | "tock" | "ticktock" | "vmstep";
}

export interface TstOutputOperation {
  op: "output";
}

export interface TstOutputFormat {
  style: "D" | "X" | "B" | "S";
  width: number;
  lpad: number;
  rpad: number;
}

export interface TstOutputSpec {
  id: string;
  builtin: boolean;
  address: number;
  format?: TstOutputFormat;
}

export interface TstOutputListOperation {
  op: "output-list";
  spec: TstOutputSpec[];
}

export interface TstLoadROMOperation {
  op: "loadRom";
  file: string;
}

export interface TstFileOperation {
  op: "load" | "output-file" | "compare-to";
  file?: string;
}

export interface TstResetRamOperation {
  op: "resetRam";
}

export type TstOperation =
  | TstFileOperation
  | TstEvalOperation
  | TstEchoOperation
  | TstClearEchoOperation
  | TstOutputOperation
  | TstSetOperation
  | TstOutputListOperation
  | TstLoadROMOperation
  | TstResetRamOperation;

export type Separator = "," | ";" | "!";

export interface TstCommand {
  op: TstOperation;
  separator: Separator;
  span: Span;
}

/**
 * Recovery points widen a list's item type with `E`. The default `never` is
 * the strict type that a valid parse produces; `ParseError` is the partial one.
 */
export interface TstRepeat<E = never> {
  statements: (TstCommand | E)[];
  count: number;
  span: Span;
}

export interface TstWhileCondition {
  op: "<" | "<=" | "=" | ">=" | ">" | "<>";
  left: string | number;
  right: string | number;
}

export interface TstWhileStatement<E = never> {
  statements: (TstCommand | E)[];
  condition: TstWhileCondition;
  span: Span;
}

export type TstStatement<E = never> =
  | TstCommand
  | E
  | TstRepeat<E>
  | TstWhileStatement<E>;

export interface Tst<E = never> {
  lines: TstStatement<E>[];
}

/** A Tst where recovery may have replaced commands with error nodes. */
export type TstPartial = Tst<ParseError>;

import tstGrammar from "./grammars/tst.ohm.js";
export const grammar = ohmGrammar(tstGrammar, grammars);
export const tstSemantics = grammar.extendSemantics(baseSemantics);

tstSemantics.extendAttribute<number>("value", {
  Index(_a, idx, _b) {
    return idx?.child(0)?.value ?? -1;
  },
});

tstSemantics.extendAttribute<string>("name", {
  FileName({ name }) {
    return name;
  },
});

tstSemantics.addAttribute<number>("index", {
  Index(_open, dec, _close) {
    return dec.child(0)?.value ?? 0;
  },
});

tstSemantics.addAttribute<TstOutputFormat>("formatSpec", {
  FormatSpec(
    _a,
    { sourceString: style },
    { value: lpad },
    _b,
    { value: width },
    _c,
    { value: rpad },
  ) {
    return {
      style: style as TstOutputFormat["style"],
      width,
      lpad,
      rpad,
    };
  },
});

tstSemantics.addAttribute<TstOutputSpec>("format", {
  OutputFormat({ name: id }, index, formatSpec) {
    return {
      id,
      builtin: index?.child(0) !== undefined,
      address: index?.child(0)?.value ?? -1,
      format: formatSpec?.child(0)?.formatSpec,
    };
  },
});

tstSemantics.addAttribute<TstOperation>("operation", {
  TstEvalOperation(op) {
    return { op: op.sourceString as TstEvalOperation["op"] };
  },
  TstOutputOperation(_) {
    return { op: "output" };
  },
  TstOutputListOperation(_, formats) {
    return {
      op: "output-list",
      spec: formats.children.map((n) => n.format),
    };
  },
  TstSetOperation(op, { name }, index, { value }) {
    const setOp: TstSetOperation = {
      op: "set",
      id: name,
      value,
    };
    const child = index.child(0)?.child(1)?.child(0);
    if (child) {
      setOp.index = child.value;
    }
    return setOp;
  },
  TstEchoOperation(op, str) {
    return {
      op: "echo",
      message: str.String as string,
    };
  },
  TstClearEchoOperation(op) {
    return {
      op: "clear-echo",
    };
  },
  TstLoadROMOperation(_r, _l, name) {
    return {
      op: "loadRom",
      file: name.sourceString,
    };
  },
  TstFileOperation(op, file) {
    return {
      op: op.sourceString as TstFileOperation["op"],
      file: file?.sourceString,
    };
  },
  TstResetRAMOperation(_) {
    return {
      op: "resetRam",
    };
  },
});

tstSemantics.addAttribute<TstCommand | ParseError>("command", {
  TstCommand(op, sep) {
    if (isFail(sep)) {
      return parseErrorOf(sep);
    }
    return {
      op: op.operation,
      separator: sep.sourceString as Separator,
      span: span(this.source),
    };
  },
});

tstSemantics.addAttribute<TstWhileCondition>("condition", {
  Condition({ value: left }, { sourceString: op }, { value: right }) {
    return {
      left,
      right,
      op: op as "<" | "<=" | "=" | ">=" | ">" | "<>",
    };
  },
});

/** The commands of a block body, with a recovered stop marker's error last. */
function blockCommands(
  commands: Node,
  stop: Node,
): (TstCommand | ParseError)[] {
  const statements = commands.children.map((node) => node.command);
  return isFail(stop) ? [...statements, parseErrorOf(stop)] : statements;
}

tstSemantics.addAttribute<TstStatement<ParseError>>("statement", {
  TstWhile(op, cond, _o, commands, stop, _c) {
    return {
      statements: blockCommands(commands, stop),
      condition: cond.condition,
      span: span(this.source),
    };
  },
  TstRepeat(op, count, _o, commands, stop, _c) {
    return {
      statements: blockCommands(commands, stop),
      count: count.sourceString ? Number(count.sourceString) : -1,
      span: span(this.source),
    };
  },
  TstStatement(command) {
    return command.command;
  },
});

tstSemantics.addAttribute<TstPartial>("tst", {
  Tst(lines) {
    return {
      lines: lines.children.map((n) => n.statement),
    };
  },
});

tstSemantics.addAttribute<TstPartial>("root", {
  Root({ tst }) {
    return tst;
  },
});

export const TST = {
  grammar: tstGrammar,
  semantics: tstSemantics,
  parser: grammar,
  parse: makeParser<TstPartial>(grammar, tstSemantics),
};
