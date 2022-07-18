/** Reads tst files to apply and perform test runs. */

import { Err, Ok, Result } from "@davidsouther/jiffies/lib/esm/result";
import ohm from "ohm-js";
import raw from "raw.macro";
import { UNKNOWN_PARSE_ERROR, baseSemantics, grammars } from "./base-ohm";

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
  style: "D" | "X" | "B" | "S";
  width: number;
  lpad: number;
  rpad: number;
}

export interface TstOutputListOperation {
  op: "output-list";
  spec: TstOutputSpec[];
}

export type TstOperation =
  | TstEvalOperation
  | TstOutputOperation
  | TstSetOperation
  | TstOutputListOperation;

export interface TstStatement {
  ops: TstOperation[];
  break?: true;
}

export interface Tst {
  lines: TstStatement[];
}

// reload .....

export const tstGrammar = raw("./grammars/tst.ohm");
export const grammar = ohm.grammar(tstGrammar, grammars);
export const tstSemantics = grammar.extendSemantics(baseSemantics);

tstSemantics.extendAttribute<number>("value", {
  Index(_a, idx, _b) {
    return idx.value;
  },
});

tstSemantics.addAttribute<TstOutputSpec>("format", {
  OutputFormat({ name }, _a, type, leftPad, _b, len, _c, rightPad) {
    return {
      id: name,
      style: type.sourceString as TstOutputSpec["style"],
      width: len.value,
      lpad: leftPad.value,
      rpad: rightPad.value,
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
    const child = index.child(0);
    if (child) {
      setOp.index = child.value;
    }
    return setOp;
  },
});

tstSemantics.addAttribute<TstStatement>("statement", {
  TstStatement(list, end) {
    const stmt: TstStatement = {
      ops: list
        .asIteration()
        .children.map(
          ({ operation }: { operation: TstOperation }) => operation
        ),
    };
    if (end.sourceString === "!") {
      stmt.break = true;
    }
    return stmt;
  },
});

tstSemantics.addAttribute<Tst>("tst", {
  Tst(lines) {
    return { lines: lines.children.map((n) => n.statement) };
  },
});

export function parse(
  source: string
): Result<Tst, Error | { message: string; shortMessage: string }> {
  try {
    const match = grammar.match(source);
    if (match.succeeded()) {
      const semantics = tstSemantics(match);
      const parse = semantics.tst;
      return Ok(parse);
    } else {
      return Err({
        message: match.message ?? UNKNOWN_PARSE_ERROR,
        shortMessage: match.shortMessage ?? UNKNOWN_PARSE_ERROR,
      });
    }
  } catch (e) {
    return Err(e as Error);
  }
}

export const TST = {
  grammar,
  semantics: tstSemantics,
  parse,
};
