// https://docs.rs/nom/latest/nom/combinator/index.html

import { Err, isErr, isOk, Ok, Option } from "@davidsouther/jiffies/result.js";
import { ParseErrors, Parser } from "./base.js";

// Succeeds if all the input has been consumed by its child parser.
export const all_consuming =
  (parser: Parser): Parser =>
  (i) => {
    const o = parser(i);
    if (isOk(o)) {
      if (Ok(o)[1] != "") {
        return ParseErrors.failure("All Consuming");
      }
    }
    return o;
  };

// Transforms Incomplete into Error.
export const complete =
  (parser: Parser): Parser =>
  (i) => {
    const o = parser(i);
    if (isErr(o)) {
      const e = Err(o);
      if (e.name == "Parse Incomplete") {
        return ParseErrors.failure("incomplete as failure", e);
      } else {
        return o;
      }
    } else {
      return o;
    }
  };

// Transforms an error to failure
export const cut =
  (parser: Parser): Parser =>
  (i) => {
    const o = parser(i);
    if (isErr(o)) {
      const e = Err(o);
      if (e.name == "Parse Error") {
        return ParseErrors.failure("cut", e);
      } else {
        return o;
      }
    } else {
      return o;
    }
  };

// Returns its input if it is at the end of input data
export const eof = (): Parser => (i) =>
  i == "" ? Ok(["", ""]) : ParseErrors.error("Not EOF");

// A parser which always fails.
export const fail = (): Parser => (_) => ParseErrors.failure("fail");

// cond	Calls the parser if the condition is met.
// consumed	if the child parser was successful, return the consumed input with the output as a tuple. Functions similarly to recognize except it returns the parser output as well.
// flat_map	Creates a new parser from the output of the first parser, then apply that parser over the rest of the input.
// into	automatically converts the child parser’s result to another type
// iterator	Creates an iterator from input data and a parser.
// map	Maps a function on the result of a parser.
// map_opt	Applies a function returning an Option over the result of a parser.
// map_parser	Applies a parser over the result of another one.
// map_res	Applies a function returning a Result over the result of a parser.
// not	Succeeds if the child parser returns an error.

// Optional parser: Will return None if not successful.
export const opt =
  <O>(p: Parser<O>): Parser<Option<O>> =>
  (i) => {
    const result = p(i);
    return isErr(result) ? Ok([i, null]) : result;
  };

// peek	Tries to apply its parser without consuming the input.
// recognize	If the child parser was successful, return the consumed input as produced value.
// rest	Return the remaining input.
// rest_len	Return the length of the remaining input.
// success	a parser which always succeeds with given value without consuming any input.
// value	Returns the provided value if the child parser succeeds.
// verify	Returns the result of the child parser if it satisfies a verification function.
