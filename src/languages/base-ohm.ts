import raw from "raw.macro";
import ohm from "ohm-js";
import { int10, int16, int2 } from "../util/twos";
import { t } from "@lingui/macro";

export const UNKNOWN_PARSE_ERROR = t`Unknown parse error`;

// Reload ..

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
