// https://docs.rs/nom/latest/nom/sequence/index.html

import { Err, isErr, Ok } from "@davidsouther/jiffies/result.js";
import { ParseErrors, Parser } from "./base.js";

// delimited	Matches an object from the first parser and discards it, then gets an object from the second parser, and finally matches an object from the third parser and discards it.
export const delimited =
  <O, O1, O2>(a: Parser<O1>, p: Parser<O>, b: Parser<O2>): Parser<O> =>
  (i) => {
    const a1 = a(i);
    if (isErr(a1)) {
      return ParseErrors.error("delimited a error", Err(a1));
    }
    const [inputP] = Ok(a1);
    const result = p(inputP);
    if (isErr(result)) {
      return ParseErrors.error("delimited p error", Err(result));
    }
    const [inputB, o] = Ok(result);
    const b1 = b(inputB);
    if (isErr(b1)) {
      return ParseErrors.error("delimited b error", Err(b1));
    }
    const [inputO] = Ok(b1);
    return Ok([inputO, o]);
  };

// Gets an object from the first parser, then gets another object from the second parser.
export const pair =
  <O1, O2>(a: Parser<O1>, b: Parser<O2>): Parser<[O1, O2]> =>
  (i) => {
    const a1 = a(i);
    if (isErr(a1)) {
      return ParseErrors.error("pair a error", Err(a1));
    }
    const [inputB, resultA] = Ok(a1);
    const b1 = b(inputB);
    if (isErr(b1)) {
      return ParseErrors.error("pair b error", Err(b1));
    }
    const [input, resultB] = Ok(b1);
    return Ok([input, [resultA, resultB]]);
  };

// preceded	Matches an object from the first parser and discards it, then gets an object from the second parser.
// separated_pair	Gets an object from the first parser, then matches an object from the sep_parser and discards it, then gets another object from the second parser.

// terminated	Gets an object from the first parser, then matches an object from the second parser and discards it.
export const terminated =
  <O, O2>(a: Parser<O>, b: Parser<O2>): Parser<O> =>
  (i) => {
    const a1 = a(i);
    if (isErr(a1)) {
      return ParseErrors.error("terminated result error");
    }
    const [inputB, resultA] = Ok(a1);
    const b1 = b(inputB);
    if (isErr(b1)) {
      return ParseErrors.error("terminated terminal error");
    }
    const [input] = Ok(b1);
    return Ok([input, resultA]);
  };

// Applies a tuple of parsers one by one and returns their results as a tuple. There is a maximum of ?? parsers
export function tuple<O1>(p1: Parser<O1>): Parser<[O1]>;
export function tuple<O1, O2>(p1: Parser<O1>, p2: Parser<O2>): Parser<[O1, O2]>;
export function tuple<O1, O2, O3>(
  p1: Parser<O1>,
  p2: Parser<O2>,
  p3: Parser<O3>
): Parser<[O1, O2, O3]>;
export function tuple<O1, O2, O3, O4>(
  p1: Parser<O1>,
  p2: Parser<O2>,
  p3: Parser<O3>,
  p4: Parser<O4>
): Parser<[O1, O2, O3, O4]>;
export function tuple(...parsers: any[]): any {
  return (i: string) => {
    const results = [];

    for (const parser of parsers) {
      const result = parser(i);
      if (isErr(result)) {
        return ParseErrors.error("tuple failed", Err(result));
      }
      const [i_, o] = Ok(result);
      results.push(o);
      i = i_;
    }

    return Ok([i, results]);
  };
}
