/** Reads tst files to apply and perform test runs. */

import { Option, unwrapOr } from "@davidsouther/jiffies/result.js";
import { int, int10 } from "../util/twos.js";
import { Parser, StringLike } from "./parser/base.js";
import { alt } from "./parser/branch.js";
import { tag } from "./parser/bytes.js";
import { map, opt, valueFn } from "./parser/combinator.js";
import { many1 } from "./parser/multi.js";
import { filler, identifier, list, token } from "./parser/recipe.js";
import { pair, preceded, terminated, tuple } from "./parser/sequence.js";

export interface TstSetOperation {
  op: "set";
  id: string;
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

export interface TstLine {
  ops: TstOperation[];
}

export interface Tst {
  lines: TstLine[];
}

const tstNumberValue = (p: Parser<StringLike>, r: number): Parser<number> =>
  map(p, (i) => int(i.toString(), r));
const tstBinaryValueParser = preceded(tag("B"), tag(/[01]{1,16}/));
const tstHexValueParser = preceded(tag("X"), tag(/[0-9a-fA-F]{1,4}/));
const tstDecimalValueParser = preceded(
  opt(tag("D")),
  tag(/(-[1-9])?[0-9]{0,4}/)
);
const tstHexValue = tstNumberValue(tstHexValueParser, 16);
const tstDecimalValue = tstNumberValue(tstDecimalValueParser, 10);
const tstBinaryValue = tstNumberValue(tstBinaryValueParser, 2);
const tstValueParser = alt(
  preceded(tag("%"), alt(tstBinaryValue, tstHexValue, tstDecimalValue)),
  tstDecimalValue
);
const tstValue: Parser<number> = (i) => tstValueParser(i);

const setParser: Parser<TstSetOperation> = map(
  preceded(token("set"), pair(token(identifier()), token(tstValue))),
  ([id, value]) => ({ op: "set", id: id.toString(), value })
);
const set: Parser<TstSetOperation> = (i) => setParser(i);

const tstOp = alt<TstOperation>(
  set,
  valueFn(() => ({ op: "tick" }), token("tick")),
  valueFn(() => ({ op: "tock" }), token("tock")),
  valueFn(() => ({ op: "eval" }), token("eval")),
  valueFn(() => ({ op: "output" }), token("output"))
);
const tstOpLineParser = map(
  terminated(list(tstOp, token(",")), token(";")),
  (ops) => ({ ops })
);

const tstOutputFormatParser = tuple(
  identifier(),
  opt(preceded(tag("%"), alt(tag("X"), tag("B"), tag("D"), tag("S")))),
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
  preceded(token("output-list"), list(token(tstOutputFormat), filler())),
  (spec) => ({ op: "output-list", spec })
);
const tstConfigParser = alt(tstOutputListParser);

const tstConfigLineParser: Parser<TstLine> = map(
  terminated(list(tstConfigParser, token(",")), token(";")),
  (ops) => ({ ops } as TstLine)
);

export const tstParser: Parser<Tst> = map(
  terminated(many1(alt(tstConfigLineParser, tstOpLineParser)), filler()),
  (lines) => ({ lines })
);

export const TEST_ONLY = {
  set,
  tstValue,
  tstOp,
  tstOutputFormat,
  tstOutputListParser,
  tstConfigParser,
};
