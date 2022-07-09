import { Parser, StringLike } from "./base";
import { alt } from "./branch";
import { tag, take_until } from "./bytes";
import {
  alpha1,
  alphanumeric1,
  line_ending,
  multispace0,
  multispace1,
} from "./character";
import { eof, map, opt, recognize, value } from "./combinator";
import { many0 } from "./multi";
import { delimited, pair, preceded, terminated, tuple } from "./sequence";

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
export const eolComment = (start: string) => {
  const eolCommentParser = recognize(
    tuple(tag(start), tag(/[^\r\n]*(?:\r\n|\n)?/))
  );
  const eolComment = (i: StringLike) => eolCommentParser(i);
  return eolComment;
};

// C-style comments
export const comment = (open: string, close: string) => {
  const commentParser = recognize(
    tuple(tag(open), take_until(tag(close)), tag(close))
  );
  const comment = (i: StringLike) => commentParser(i);
  return comment;
};

// Eat white space and comments
export const filler = (start = "//", open = "/*", close = "*/") => {
  const fillerParser = recognize(
    many0(alt(multispace1(), comment(open, close), eolComment(start)))
  );
  const filler = (i: StringLike) => fillerParser(i);
  return filler;
};

export function token(
  token: string | RegExp,
  fill?: () => Parser<unknown>
): Parser<StringLike>;
export function token<O>(
  token: Parser<O>,
  fill?: () => Parser<unknown>
): Parser<O>;
export function token<O>(
  tokenP: string | RegExp | Parser<O>,
  fill: () => Parser<unknown> = filler
): Parser<O | StringLike> {
  const tokenParser =
    tokenP instanceof RegExp || typeof tokenP == "string"
      ? ws(tag(tokenP), fill)
      : ws(tokenP, fill);
  const token = (i: StringLike) => tokenParser(i);
  return token;
}

// C-style identifiers
export const identifier = (
  initial = alt(alpha1(), tag("_")),
  rest = alt(alphanumeric1(), tag("_"))
) => {
  const identifierParser = recognize(pair(initial, many0(rest)));
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
  const listParser: Parser<O[]> = terminated(
    map(tuple(parser, many0(preceded(separator, parser))), ([a, rest]) => [
      a,
      ...rest,
    ]),
    opt(separator)
  );
  const list = (i: StringLike) => listParser(i);
  return list;
};
