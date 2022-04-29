// https://docs.rs/nom/latest/nom/combinator/index.html

import { Err, isErr, isOk, Ok, Option } from "@davidsouther/jiffies/result.js";
import { IResult, ParseErrors, Parser } from "./base.js";

// Succeeds if all the input has been consumed by its child parser.
export const all_consuming = <T>(parser: Parser<T>): Parser<T> => {
  function all_consuming(i: string): IResult<T> {
    const o = parser(i);
    if (isOk(o)) {
      if (Ok(o)[0] != "") {
        return ParseErrors.failure("all Consuming");
      }
    }
    return o;
  }
  return all_consuming;
};

// Transforms Incomplete into Error.
export const complete = <T>(parser: Parser<T>): Parser<T> => {
  function complete(i: string): IResult<T> {
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
  }
  return complete;
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
export const opt = <O>(p: Parser<O>): Parser<Option<O>> => {
  function opt(i: string): IResult<Option<O>> {
    const result = p(i);
    return isErr(result) ? Ok([i, null]) : result;
  }
  return opt;
};

// peek	Tries to apply its parser without consuming the input.

// recognize	If the child parser was successful, return the consumed input as produced value.
export const recognize = <O>(p: Parser<O>): Parser<string> => {
  function recognize(i: string): IResult<string> {
    const res = p(i);
    if (isErr(res)) return res;
    const [inp, _] = Ok(res);
    const idx = i.indexOf(inp);
    return Ok([inp, i.substring(0, idx)]);
  }
  return recognize;
};

// rest	Return the remaining input.
// rest_len	Return the length of the remaining input.
// success	a parser which always succeeds with given value without consuming any input.

// value	Returns the provided value if the child parser succeeds.
export const value = <O>(o: O, parser: Parser<unknown>): Parser<O> => {
  function value(i: string): IResult<O> {
    const r = parser(i);
    if (isErr(r)) {
      return ParseErrors.error("value parser", Err(r));
    }
    return Ok([Ok(r)[0], o]);
  }
  return value;
};

// verify	Returns the result of the child parser if it satisfies a verification function.
