import raw from "raw.macro";
import ohm from "ohm-js";
import { int10, int16, int2 } from "../util/twos";
import { t } from "@lingui/macro";
import { Err, Ok, Result } from "@davidsouther/jiffies/lib/esm/result";

export const UNKNOWN_PARSE_ERROR = t`Unknown parse error`;

// Reload .....

const baseGrammar = raw("./grammars/base.ohm");
export const grammars = {
  Base: ohm.grammar(baseGrammar),
};

export const baseSemantics = grammars.Base.createSemantics();

baseSemantics.extendOperation("asIteration", {
  List(list, _) {
    return list.asIteration();
  },
});

baseSemantics.addAttribute("value", {
  decNumber(_, digits): number {
    return int10(digits.sourceString);
  },
  wholeDec(_, digits): number {
    return int10(digits.sourceString);
  },
  binNumber(_, digits) {
    return int2(digits.sourceString);
  },
  hexNumber(_, digits) {
    return int16(digits.sourceString);
  },
  Number: (num) => {
    return num.value;
  },
});

baseSemantics.addAttribute("name", {
  identifier(_, __): string {
    return this.sourceString;
  },
  Name(_): string {
    return this.child(0)?.name;
  },
});

baseSemantics.addAttribute("String", {
  String(_a, str, _b) {
    return str.sourceString;
  },
});

export type ParseError = Error | { message: string; shortMessage: string };

export function makeParser<ResultType>(
  grammar: ohm.Grammar,
  semantics: ohm.Semantics,
  property: (obj: ohm.Dict) => ResultType = ({ root }) => root
): (source: string) => Result<ResultType, ParseError> {
  return function parse(source) {
    try {
      const match = grammar.match(source);
      if (match.succeeded()) {
        const parsed = semantics(match);
        const parse = property(parsed);
        return Ok(parse);
      } else {
        return Err({
          message: match.message ?? UNKNOWN_PARSE_ERROR,
          shortMessage: match.shortMessage ?? UNKNOWN_PARSE_ERROR,
        });
      }
    } catch (e) {
      return Err(e as Error);
    }
  };
}
