import { Err, isErr, Ok } from "@davidsouther/jiffies/result.js";
import { IResult, ParseErrors, Parser } from "./base.js";

// delimited	Matches an object from the first parser and discards it, then gets an object from the second parser, and finally matches an object from the third parser and discards it.
export const delimited = <O>(
  a: Parser<unknown>,
  p: Parser<O>,
  b: Parser<unknown>
): Parser<O> => {
  const delimitedParser = tuple(a, p, b);
  const delimited: Parser<O> = (i) => {
    const t = delimitedParser(i);
    if (isErr(t)) return t;
    const [input, [_, P, __]] = Ok(t);
    return Ok([input, P]);
  };
  return delimited;
};

// Gets an object from the first parser, then gets another object from the second parser.
export const pair = <O1, O2>(
  a: Parser<O1>,
  b: Parser<O2>
): Parser<[O1, O2]> => {
  const pairParser = tuple(a, b);
  const pair: Parser<[O1, O2]> = (i) => {
    const t = pairParser(i);
    if (isErr(t)) return t;
    const [input, [A, B]] = Ok(t);
    return Ok([input, [A, B]]);
  };
  return pair;
};

// preceded	Matches an object from the first parser and discards it, then gets an object from the second parser.
export const preceded = <O>(a: Parser<unknown>, b: Parser<O>): Parser<O> => {
  const precededParser = tuple(a, b);
  const preceded: Parser<O> = (i) => {
    const t = precededParser(i);
    if (isErr(t)) return t;
    const [input, [_, B]] = Ok(t);
    return Ok([input, B]);
  };
  return preceded;
};

// separated_pair	Gets an object from the first parser, then matches an object from the sep_parser and discards it, then gets another object from the second parser.
export const separated_pair = <O1, O2>(
  a: Parser<O1>,
  b: Parser<unknown>,
  c: Parser<O2>
): Parser<[O1, O2]> => {
  const separated_pair_parser = tuple(a, b, c);
  const separated_pair: Parser<[O1, O2]> = (i) => {
    const t = separated_pair_parser(i);
    if (isErr(t)) return t;
    const [input, [A, _, C]] = Ok(t);
    return Ok([input, [A, C]]);
  };
  return separated_pair;
};

// terminated	Gets an object from the first parser, then matches an object from the second parser and discards it.
export const terminated = <O, O2>(a: Parser<O>, b: Parser<O2>): Parser<O> => {
  const parser = tuple(a, b);
  function terminated(i: string): IResult<O> {
    const t = parser(i);
    if (isErr(t)) return t;
    const [input, [A]] = Ok(t);
    return Ok([input, A]);
  }
  return terminated;
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
export function tuple<O1, O2, O3, O4, O5>(
  p1: Parser<O1>,
  p2: Parser<O2>,
  p3: Parser<O3>,
  p4: Parser<O4>,
  p5: Parser<O5>
): Parser<[O1, O2, O3, O4, O5]>;
export function tuple(...parsers: any[]): any {
  function tuple(i: string): IResult<any> {
    const results = [];

    for (const parser of parsers) {
      const result = parser(i);
      if (isErr(result)) {
        return ParseErrors.error("tuple failed", Err(result));
      }
      // @ts-ignore
      const [input, o] = Ok(result);
      results.push(o);
      i = input;
    }

    return Ok([i, results]);
  }
  return tuple;
}
