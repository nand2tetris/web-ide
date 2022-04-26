// https://docs.rs/nom/latest/nom/branch/index.html

import { isOk } from "@davidsouther/jiffies/result.js";
import { ParseErrors, Parser } from "./base.js";

// Tests a list of parsers one by one until one succeeds.
export const alt =
  <O>(...parsers: Parser<O>[]): Parser<O> =>
  (i) => {
    for (const parser of parsers) {
      const result = parser(i);
      if (isOk(result)) {
        return result;
      }
    }
    return ParseErrors.error("alt did not match any branches.");
  };

// permutation	Applies a list of parsers in any order.
