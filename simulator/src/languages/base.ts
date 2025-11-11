import { Err, Ok, Result } from "@davidsouther/jiffies/lib/esm/result.js";
import {
  type Dict,
  type Grammar,
  grammar,
  Interval,
  type Semantics,
} from "ohm-js";
import { int2, int10, int16 } from "../util/twos.js";

import baseGrammar from "./grammars/base.ohm.js";
export const grammars = {
  Base: grammar(baseGrammar),
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

export interface CompilationError {
  message: string;
  span?: Span;
}

const UNKNOWN_HDL_ERROR = `HDL statement has a syntax error`;

export function createError(
  description: string,
  span?: Span,
): CompilationError {
  const match = description.match(/Line \d+, col \d+: (?<message>.*)/);
  const message = match?.groups?.message ? match.groups.message : description;
  return {
    message: `${
      span?.line != undefined ? `Line ${span.line}: ` : ""
    }${message}`,
    span: span,
  };
}

export function makeParser<ResultType>(
  grammar: Grammar,
  semantics: Semantics,
  property: (obj: Dict) => ResultType = ({ root }) => root,
): (source: string) => Result<ResultType, CompilationError> {
  return function parse(source) {
    try {
      const match = grammar.match(source);
      if (match.succeeded()) {
        const parsed = semantics(match);
        const parse = property(parsed);
        return Ok(parse);
      } else {
        return Err(
          createError(
            match.shortMessage ?? UNKNOWN_HDL_ERROR,
            span(match.getInterval()),
          ),
        );
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
