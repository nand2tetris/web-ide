import { IResult, Parser } from "./base.js";
import { alt } from "./branch.js";
import { is_not, tag, take_until } from "./bytes.js";
import { line_ending, multispace0 } from "./character.js";
import { eof, opt, value } from "./combinator.js";
import { delimited, pair, terminated, tuple } from "./sequence.js";

export const line = () => {
  const parser = terminated(
    take_until(alt(line_ending(), eof())),
    opt(line_ending())
  );
  function lineParser(i: string): IResult<string> {
    return parser(i);
  }
  return lineParser;
};

// ws   Wrapper combinators that eat whitespace before and after a parser
export const ws = <O>(inner: Parser<O>, ws = multispace0): Parser<O> =>
  delimited(ws(), inner, ws());

// eol_comment  C++/EOL style comments
export const eol_comment = (start: string) =>
  value(null, pair(tag(start), is_not("\r\n")));

// inline_comment C-style comments
export const comment = (open: string, close: string): Parser<null> =>
  value(null, tuple(tag(open), take_until(tag(close)), tag(close)));

export const filler = (start = "//", open = "/*", close = "*/") =>
  alt(multispace0(), comment(open, close), eol_comment(start));

// identifier   C-style identifiers
// escaped_string   https://github.com/Geal/nom/blob/main/examples/string.rs
// hexadecimal  0x... or 0X...
// binary   0b... or 0B...
// decimal
// float
// number  https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-NumericLiteral
