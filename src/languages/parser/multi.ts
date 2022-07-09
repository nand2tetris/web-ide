import { isErr, Ok } from "@davidsouther/jiffies/lib/esm/result";
import { ParseErrors, Parser } from "./base";

// https://docs.rs/nom/latest/nom/multi/index.html
// repeat	Runs the embedded parser a specified number of times. Returns the results in a Vec.

// fold_many0	Applies a parser until it fails and accumulates the results using a given function and initial value.
// fold_many1	Applies a parser until it fails and accumulates the results using a given function and initial value. Fails if the embedded parser does not succeed at least once.
// fold_many_m_n	Applies a parser n times or until it fails and accumulates the results using a given function and initial value. Fails if the embedded parser does not succeed at least m times.

// length_count	Gets a number from the first parser, then applies the second parser that many times.
// length_data	Gets a number from the parser and returns a subslice of the input of that size. If the parser returns Incomplete, length_data will return an error.
// length_value	Gets a number from the first parser, takes a subslice of the input of that size, then applies the second parser on that subslice. If the second parser returns Incomplete, length_value will return an error.

// Repeats the embedded parser max times or until it fails and returns the results in a Vec. Fails if the embedded parser does not succeed at least min times.
export const many = <O>(
  parser: Parser<O>,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): Parser<O[]> => {
  const many: Parser<O[]> = (i) => {
    const results: O[] = [];
    while (results.length < max && i.length > 0) {
      const result = parser(i);
      if (isErr(result)) {
        break;
      } else {
        const [_i, _o] = Ok(result);
        results.push(_o);
        i = _i;
      }
    }
    if (results.length < min) {
      return ParseErrors.incomplete(results.length, {
        cause: "many did not find enough results",
        span: i,
      });
    } else {
      return Ok([i, results]);
    }
  };
  return many;
};

// Repeats the embedded parser until it fails and returns the results in a Vec.
export const many0 = <O>(parser: Parser<O>): Parser<O[]> => many(parser, 0);

// Repeats the embedded parser until it fails and returns the number of successful iterations.
// export const many0_count = (parser: Parser) => count(many0(parser));
// Runs the embedded parser until it fails and returns the results in a Vec. Fails if the embedded parser does not produce at least one result.
export const many1 = <O>(parser: Parser<O>) => many<O>(parser, 1);

// Repeats the embedded parser until it fails and returns the number of successful iterations. Fails if the embedded parser does not succeed at least once.
// export const many1_times = (parser: Parser) => times(many1(parser));
// many_till	Applies the parser f until the parser g produces a result. Returns a pair consisting of the results of f in a Vec and the result of g.
// separated_list0	Alternates between two parsers to produce a list of elements.
// separated_list1	Alternates between two parsers to produce a list of elements. Fails if the element parser does not produce at least one element.
