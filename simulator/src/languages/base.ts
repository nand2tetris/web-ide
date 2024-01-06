import { Err, Ok, Result } from "@davidsouther/jiffies/lib/esm/result.js";
import ohm, { Interval } from "ohm-js";
import { int10, int16, int2 } from "../util/twos.js";

import baseGrammar from "./grammars/base.ohm.js";
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
  Number(num) {
    return num.value;
  },
  Name(ident) {
    return ident.name;
  },
  identifier(_, __): string {
    return this.sourceString;
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

export interface ParseError {
  message: string | undefined;
  span?: Span;
}

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
          message: match.shortMessage,
          span: span(match.getInterval()),
        });
      }
    } catch (e) {
      return Err(e as Error);
    }
  };
}

export interface Span {
  start: number;
  end: number;
  line: number;
}

export function span(span: Interval): Span {
  return {
    start: span.startIdx,
    end: span.endIdx,
    line: span.getLineAndColumn().lineNum,
  };
}
