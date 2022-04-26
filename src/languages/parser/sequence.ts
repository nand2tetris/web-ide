// https://docs.rs/nom/latest/nom/sequence/index.html

import { isErr, Ok } from "@davidsouther/jiffies/result.js";
import { ParseErrors, Parser } from "./base.js";

// delimited	Matches an object from the first parser and discards it, then gets an object from the second parser, and finally matches an object from the third parser and discards it.
// Gets an object from the first parser, then gets another object from the second parser.
export const pair =
  <I, O1, O2, E extends Error>(
    a: Parser<I, O1, E>,
    b: Parser<I, O2, E>
  ): Parser<I, [O1, O2], E> =>
  (i: I) => {
    const a1 = a(i);
    if (isErr(a1)) {
      return ParseErrors.error(new Error("pair a error"));
    }
    const [inputB, resultA] = Ok(a1);
    const b1 = b(inputB);
    if (isErr(b1)) {
      return ParseErrors.error(new Error("pair b error"));
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

// tuple	Applies a tuple of parsers one by one and returns their results as a tuple. There is a maximum of ?? parsers
