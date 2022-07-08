/** Reads tst files to apply and perform test runs. */

import { Option, unwrapOr } from "@davidsouther/jiffies/lib/esm/result";
import { int10, int16, int2 } from "../util/twos";
import { Parser } from "./parser/base";
import { alt } from "./parser/branch";
import { tag } from "./parser/bytes";
import { map, opt, recognize, valueFn } from "./parser/combinator";
import { many1 } from "./parser/multi";
import { filler, identifier, list, token } from "./parser/recipe";
import { pair, preceded, terminated, tuple } from "./parser/sequence";

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

const tstBinaryValueParser = preceded(tag("B"), tag(/[01]{1,16}/));
const tstHexValueParser = preceded(tag("X"), tag(/[0-9a-fA-F]{1,4}/));
const tstDecimalValueParser = preceded(
  opt(tag("D")),
  tag(/(-[1-9])?[0-9]{0,5}/)
);
const tstHexValue = map(tstHexValueParser, (s) => int16(s.toString()));
const tstDecimalValue = map(tstDecimalValueParser, (s) => int10(s.toString()));
const tstBinaryValue = map(tstBinaryValueParser, (s) => int2(s.toString()));
const tstValueParser = alt(
  preceded(tag("%"), alt(tstBinaryValue, tstHexValue, tstDecimalValue)),
  tstDecimalValue
);
const tstValue: Parser<number> = tstValueParser;

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
  recognize(pair(identifier(), opt(tag("[]")))),
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
  many1(alt(tstConfigLineParser, tstOpLineParser)),
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
