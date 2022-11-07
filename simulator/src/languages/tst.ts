/** Reads tst files to apply and perform test runs. */

import ohm from "ohm-js";
import { baseSemantics, grammars, makeParser, Span } from "./base.js";

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
  op: "eval" | "tick" | "tock";
}

export interface TstOutputOperation {
  op: "output";
}

export interface TstOutputSpec {
  id: string;
  builtin: boolean;
  address: number;
  style: "D" | "X" | "B" | "S";
  width: number;
  lpad: number;
  rpad: number;
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
  file: string;
}

export type TstOperation =
  | TstFileOperation
  | TstEvalOperation
  | TstEchoOperation
  | TstClearEchoOperation
  | TstOutputOperation
  | TstSetOperation
  | TstOutputListOperation
  | TstLoadROMOperation;

export interface TstLineStatement {
  ops: TstOperation[];
  break?: true;
  span: Span;
}

export interface TstRepeat {
  statements: TstLineStatement[];
  count: number;
  span: Span;
}

export interface TstWhileCondition {
  op: "<" | "<=" | "=" | ">=" | ">" | "<>";
  left: string | number;
  right: string | number;
}

export interface TstWhileStatement {
  statements: TstLineStatement[];
  condition: TstWhileCondition;
  span: Span;
}

export type TstStatement = TstLineStatement | TstRepeat | TstWhileStatement;

export interface Tst {
  lines: TstStatement[];
}

import tstGrammar from "./grammars/tst.ohm.js";
export const grammar = ohm.grammar(tstGrammar, grammars);
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

tstSemantics.addAttribute<TstOutputSpec>("format", {
  OutputFormat(
    { name: id },
    index,
    _a,
    { sourceString: style },
    { value: lpad },
    _b,
    { value: width },
    _c,
    { value: rpad }
  ) {
    return {
      id,
      builtin: index?.child(0) !== undefined,
      address: index?.child(0)?.value ?? -1,
      style: style as TstOutputSpec["style"],
      width,
      lpad,
      rpad,
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
  TstLoadROMOperation(_r, _l, { name }) {
    return {
      op: "loadRom",
      file: name,
    };
  },
  TstFileOperation(op, file) {
    return {
      op: op.sourceString as TstFileOperation["op"],
      file: file.sourceString,
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

tstSemantics.addAttribute<TstStatement>("statement", {
  TstWhile(op, cond, _o, statements, _c) {
    return {
      statements: statements.children.map(({ statement }) => statement),
      condition: cond.condition,
      span: {
        start: op.source.startIdx,
        end: cond.source.endIdx,
      },
    };
  },
  TstRepeat(op, count, _o, statements, _c) {
    return {
      statements: statements.children.map(({ statement }) => statement),
      count: count.child(0)?.value ?? -1,
      span: {
        start: op.source.startIdx,
        end: count.source.endIdx,
      },
    };
  },
  TstStatement(list, end) {
    const stmt: TstStatement = {
      ops: list
        .asIteration()
        .children.map(
          ({ operation }: { operation: TstOperation }) => operation
        ),
      span: {
        start: this.source.startIdx,
        end: this.source.endIdx,
      },
    };
    if (end.sourceString === "!") {
      stmt.break = true;
    }
    return stmt;
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

export const TST = {
  grammar: tstGrammar,
  semantics: tstSemantics,
  parser: grammar,
  parse: makeParser<Tst>(grammar, tstSemantics),
};
