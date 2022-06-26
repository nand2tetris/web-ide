import { isErr, Ok } from "@davidsouther/jiffies/src/result";
import { IResult, Parser, StringLike } from "./base"
import { map } from "./combinator"

// delimited	Matches an object from the first parser and discards it, then gets an object from the second parser, and finally matches an object from the third parser and discards it.
export const delimited = <O>(
  a: Parser<unknown>,
  p: Parser<O>,
  b: Parser<unknown>
): Parser<O> => map(tuple(a, p, b), ([_, o]) => o);

// Gets an object from the first parser, then gets another object from the second parser.
export const pair = <O1, O2>(a: Parser<O1>, b: Parser<O2>): Parser<[O1, O2]> =>
  tuple(a, b);

// preceded	Matches an object from the first parser and discards it, then gets an object from the second parser.
export const preceded = <O>(a: Parser<unknown>, b: Parser<O>): Parser<O> =>
  map(tuple(a, b), ([_, o]) => o);

// separated_pair	Gets an object from the first parser, then matches an object from the sep_parser and discards it, then gets another object from the second parser.
export const separated = <O1, O2>(
  a: Parser<O1>,
  b: Parser<unknown>,
  c: Parser<O2>
): Parser<[O1, O2]> => map(tuple(a, b, c), ([o1, _, o2]) => [o1, o2]);

// terminated	Gets an object from the first parser, then matches an object from the second parser and discards it.
export const terminated = <O>(a: Parser<O>, b: Parser<unknown>): Parser<O> =>
  map(tuple(a, b), ([o, _]) => o);

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
  const tuple: Parser<any> = (i: StringLike): IResult<any[]> => {
    const results: any[] = [];

    for (const parser of parsers) {
      const result = parser(i);
      if (isErr(result)) return result as IResult<any[]>;
      // @ts-ignore
      const [input, o] = Ok(result);
      results.push(o);
      i = input;
    }

    return Ok([i, results]);
  };
  return tuple;
}
