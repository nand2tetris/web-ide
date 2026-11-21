import { type Node, grammar as ohmGrammar } from "ohm-js";
import {
  actionError,
  baseSemantics,
  carrierOf,
  categorize,
  grammars,
  guardedRecovery,
  isRecovered,
  makeParser,
  makePrune,
  type Recovery,
  type RecoveryPoint,
  rewrites,
  span,
} from "./base.js";
import { DiagnosticCode, Span } from "./diagnostic.js";

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

export type TstStatement = TstCommand | TstRepeat | TstWhileStatement;

export interface Tst {
  lines: TstStatement[];
}

/** Prune before execution: the placeholder operation is not executable. */
function nullCommand(point: RecoveryPoint, kind: TstSkipKind): TstCommand {
  return {
    op: { op: "eval" },
    separator: ",",
    span: point.span,
    ...carrierOf(point, kind),
  };
}

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

function blockCommands(
  commands: Node,
  correction: Node,
  kind: "TstRepeatClose" | "TstWhileClose",
): TstCommand[] {
  const statements = commands.children.map((node) => node.command);
  if (
    correction.recoveredFailure?.missing &&
    correction.source.contents === ""
  ) {
    return statements;
  }
  const recovered: RecoveryPoint | undefined = correction.recovery;
  if (recovered === undefined) return statements;
  const { span: skipped, recovery } = recovered;
  // A scanned insertion may skip a command after its synthesized diagnostic.
  // For ordinary recovery, only a skipped prefix before the failure may be a load.
  const discardedCommand =
    skipped.start < skipped.end &&
    (correction.recoveredFailure?.missing ||
      (recovery.span !== undefined && skipped.start < recovery.span.start));
  return [
    ...statements,
    nullCommand(recovered, discardedCommand ? "TstOperation" : kind),
  ];
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
    const given = count.sourceString ? Number(count.sourceString) : undefined;
    if (given !== undefined && given < 0) {
      actionError(
        DiagnosticCode.Tst.NEGATIVE_REPEAT,
        { count: given },
        span(count.source),
      );
    }
    return {
      statements: blockCommands(commands, correction, "TstRepeatClose"),
      count: given ?? -1,
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

export const prune = makePrune<Tst>((tree) => ({
  ...tree,
  lines: tree.lines.flatMap((line): TstStatement[] =>
    "statements" in line
      ? [{ ...line, statements: line.statements.filter(isIntact) }]
      : isIntact(line)
        ? [line]
        : [],
  ),
}));

function isIntact(command: TstCommand): boolean {
  return !isRecovered(command);
}

function emptyTst(): Tst {
  return { lines: [] };
}

/**
 * Every word that starts a statement. Where a statement may start, the end of
 * input is folded in too: a misspelled command is the likelier mistake.
 */
const TST_COMMANDS = [
  "load",
  "output-file",
  "compare-to",
  "output-list",
  "eval",
  "tick",
  "tock",
  "ticktock",
  "vmstep",
  "set",
  "output",
  "echo",
  "clear-echo",
  "ROM32K",
  "resetRam",
  "repeat",
  "while",
  "end of input",
];

const tstExpected = rewrites(categorize(TST_COMMANDS, "a command"));

export const TST = {
  grammar: tstGrammar,
  semantics: tstSemantics,
  parser: grammar,
  ...makeParser<Tst>(grammar, tstSemantics, emptyTst, "root", tstExpected),
};
