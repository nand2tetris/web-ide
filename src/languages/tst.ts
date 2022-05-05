/** Reads tst files to apply and perform test runs. */

import { Option, unwrapOr } from "@davidsouther/jiffies/result.js";
import { int, int10 } from "../util/twos.js";
import { Parser, StringLike } from "./parser/base.js";
import { alt } from "./parser/branch.js";
import { tag } from "./parser/bytes.js";
import { multispace1 } from "./parser/character.js";
import { map, opt, valueFn } from "./parser/combinator.js";
import { many1 } from "./parser/multi.js";
import { identifier, list, ws } from "./parser/recipe.js";
import { pair, preceded, terminated, tuple } from "./parser/sequence.js";

export interface TstSetOperation {
  op: "set";
  id: string;
  value: number;
}

export interface TstEvalOperation {
  op: "eval";
}

export interface TstOutputOperation {
  op: "output";
}

export interface TstOutputSpec {
  id: string;
  style: "D" | "X" | "B";
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

export interface TstLine {
  ops: TstOperation[];
}

export interface Tst {
  lines: TstLine[];
}

// const tstTagParser = ws();
const tstWs = <O>(p: Parser<O>): Parser<O> => ws(p);

const tstNumberValue = (p: Parser<StringLike>, r: number): Parser<number> =>
  map(p, (i) => int(i.toString(), r));
const tstBinaryValueParser = preceded(tag("B"), tag(/[01]{1,16}/));
const tstHexValueParser = preceded(tag("X"), tag(/[0-9a-fA-F]{1,4}/));
const tstDecimalValueParser = preceded(opt(tag("D")), tag(/-?[1-9][0-9]{0,4}/));
const tstHexValue = tstNumberValue(tstHexValueParser, 16);
const tstDecimalValue = tstNumberValue(tstDecimalValueParser, 10);
const tstBinaryValue = tstNumberValue(tstBinaryValueParser, 2);
const tstValueParser = preceded(
  tag("%"),
  alt(tstBinaryValue, tstHexValue, tstDecimalValue)
);
const tstValue: Parser<number> = (i) => tstValueParser(i);

const set: Parser<TstSetOperation> = map(
  preceded(tstWs(tag("set")), pair(tstWs(identifier()), tstWs(tstValue))),
  ([id, value]) => ({ op: "set", id: id.toString(), value })
);

const tstOp = alt<TstOperation>(
  set,
  valueFn(() => ({ op: "eval" }), tag("eval")),
  valueFn(() => ({ op: "output" }), tag("output"))
);
const tstOpLineParser = map(
  terminated(list(tstOp, tstWs(tag(","))), tag(";")),
  (ops) => ({ ops })
);

const tstOutputFormatParser = tuple(
  identifier(),
  opt(preceded(tag("%"), alt(tag("X"), tag("B"), tag("D")))),
  tag(/\d+\.\d+\.\d+/)
);
const tstOutputFormat: Parser<TstOutputSpec> = map(
  tstOutputFormatParser,
  ([id, style, tag]) => {
    const [a, b, c] = tag.toString().split(".");
    return {
      id: id.toString(),
      // @ts-ignore
      style: unwrapOr<"D" | "B" | "X">(style as Option<"D" | "B" | "X">, "D"),
      width: int10(b),
      lpad: int10(a),
      rpad: int10(c),
    };
  }
);

const tstOutputListParser: Parser<TstOutputListOperation> = map(
  preceded(tstWs(tag("output-list")), list(tstOutputFormat, multispace1())),
  (spec) => ({ op: "output-list", spec })
);
const tstConfigParser = alt(tstOutputListParser);

const tstConfigLineParser: Parser<TstLine> = map(
  terminated(list(tstConfigParser, tstWs(tag(","))), tstWs(tag(";"))),
  (ops) => ({ ops } as TstLine)
);

export const tstParser: Parser<Tst> = map(
  many1(tstWs(alt(tstConfigLineParser, tstOpLineParser))),
  (lines) => ({ lines })
);

export const TEST_ONLY = {
  tstValue,
  tstOp,
  tstOutputFormat,
  tstOutputListParser,
  tstConfigParser,
};
