/** Reads tst files to apply and perform test runs. */

import { type Node, grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  carrierOf,
  grammars,
  guardedRecovery,
  makeParser,
  type Recovery,
  type RecoveryPoint,
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

export interface TstCommand extends Recovery {
  op: TstOperation;
  separator: Separator;
  span: Span;
}

export interface TstRepeat {
  statements: TstCommand[];
  count: number;
  span: Span;
}

export interface TstWhileCondition {
  op: "<" | "<=" | "=" | ">=" | ">" | "<>";
  left: string | number;
  right: string | number;
}

export interface TstWhileStatement {
  statements: TstCommand[];
  condition: TstWhileCondition;
  span: Span;
}

/**
 * A recovered command is a null command (see `isRecovered`), so one type
 * serves valid and recovered tests.
 */
export type TstStatement = TstCommand | TstRepeat | TstWhileStatement;

export interface Tst {
  lines: TstStatement[];
}

/**
 * The null command where recovery skipped input. `eval` changes no test
 * state, and the `,` separator joins it to the step that follows.
 */
function nullCommand(point: RecoveryPoint, kind: TstSkipKind): TstCommand {
  return {
    op: { op: "eval" },
    separator: ",",
    span: point.span,
    ...carrierOf(point, kind),
  };
}

/**
 * What a null command stands in for, named by the slot that recovered.
 */
export type TstSkipKind = "TstOperation" | "TstRepeatClose" | "TstWhileClose";

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

tstSemantics.addAttribute<TstCommand>("command", {
  TstCommand(op, correction, sep) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      op,
      correction,
    );
    if (recovered) {
      return nullCommand(recovered, "TstOperation");
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

/** The matched commands of a block body, with a correction's null command last. */
function blockCommands(
  commands: Node,
  correction: Node,
  kind: "TstRepeatClose" | "TstWhileClose",
): TstCommand[] {
  const statements = commands.children.map((node) => node.command);
  const recovered: RecoveryPoint | undefined = correction.recovery;
  return recovered ? [...statements, nullCommand(recovered, kind)] : statements;
}

tstSemantics.addAttribute<TstStatement>("statement", {
  TstWhile(op, cond, _o, commands, correction, _stop) {
    return {
      statements: blockCommands(commands, correction, "TstWhileClose"),
      condition: cond.condition,
      span: span(this.source),
    };
  },
  TstRepeat(op, count, _o, commands, correction, _stop) {
    return {
      statements: blockCommands(commands, correction, "TstRepeatClose"),
      count: count.sourceString ? Number(count.sourceString) : -1,
      span: span(this.source),
    };
  },
  TstStatement(command) {
    return command.command;
  },
});

tstSemantics.addAttribute<Tst>("tst", {
  Tst(lines) {
    return {
      lines: lines.children.map((n) => n.statement),
    };
  },
});

tstSemantics.addAttribute<Tst>("root", {
  Root({ tst }) {
    return tst;
  },
});

/** The null root of a parse that built no test: a test with no statements. */
function emptyTst(): Tst {
  return { lines: [] };
}

export const TST = {
  grammar: tstGrammar,
  semantics: tstSemantics,
  parser: grammar,
  ...makeParser<Tst>(grammar, tstSemantics, emptyTst),
};
