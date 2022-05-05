import { Parser, StringLike } from "./base.js";
import { alt } from "./branch.js";
import { is_not, tag, take_until } from "./bytes.js";
import {
  alpha1,
  alphanumeric1,
  line_ending,
  multispace0,
  multispace1,
} from "./character.js";
import { eof, map, opt, recognize, value } from "./combinator.js";
import { many0 } from "./multi.js";
import { delimited, pair, preceded, terminated, tuple } from "./sequence.js";

export const line = (): Parser<StringLike> =>
  terminated(
    take_until(alt(line_ending(), value("", eof()))),
    opt(line_ending())
  );

// Wrapper combinators that eat whitespace before and after a parser
export const ws = <O>(
  inner: Parser<O>,
  ws: () => Parser<unknown> = multispace0
): Parser<O> => delimited(ws(), inner, ws());

// C++/EOL style comments
export const eol_comment = (start: string) =>
  value(null, pair(tag(start), is_not("\r\n")));

// C-style comments
export const comment = (open: string, close: string): Parser<null> =>
  value(null, tuple(tag(open), take_until(tag(close)), tag(close)));

// Eat white space and comments
export const filler = (start = "//", open = "/*", close = "*/") => {
  const fillerParser = value(
    null,
    many0(alt(multispace1(), comment(open, close), eol_comment(start)))
  );
  const filler: Parser<null> = (i) => fillerParser(i);
  return filler;
};

export const token = (
  token: string | RegExp,
  fill: () => Parser<unknown> = filler
) => ws(tag(token), fill);

// C-style identifiers
const identifierParser = recognize(
  pair(alt(alpha1(), tag("_")), many0(alt(alphanumeric1(), tag("_"))))
);
export const identifier = () => {
  const identifier: Parser<StringLike> = (i) => identifierParser(i);
  return identifier;
};

// escaped_string   https://github.com/Geal/nom/blob/main/examples/string.rs
// hexadecimal  0x... or 0X...
// binary   0b... or 0B...
// decimal
// float
// number  https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-NumericLiteral

export const list = <O>(
  parser: Parser<O>,
  separator: Parser<unknown>
): Parser<O[]> => {
  const list: Parser<O[]> = map(
    pair(parser, many0(preceded(separator, parser))),
    ([a, rest]) => [a, ...rest]
  );
  return list;
};
