import { Parser } from "./base.js";
import { alt } from "./branch.js";
import { take_until } from "./bytes.js";
import { line_ending } from "./character.js";
import { eof, opt } from "./combinator.js";
import { terminated } from "./sequence.js";

export const line = <O>(): Parser<O> =>
  terminated(take_until(alt(line_ending(), eof())), opt(line_ending()));

// ws   Wrapper combinators that eat whitespace before and after a parser
// eol_comment  C++/EOL style comments
// inline_comment C-style comments
// identifier   C-style identifiers
// escaped_string   https://github.com/Geal/nom/blob/main/examples/string.rs
// hexadecimal  0x... or 0X...
// binary   0b... or 0B...
// decimal
// float
// number  https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-NumericLiteral
