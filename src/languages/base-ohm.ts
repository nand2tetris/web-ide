import raw from "raw.macro";
import ohm from "ohm-js";
import { int10, int16, int2 } from "../util/twos";
import { t } from "@lingui/macro";

const baseGrammar = raw("./grammars/base.ohm");
// console.log(baseGrammar);
export const grammars = {
  Base: ohm.grammar(baseGrammar),
};

export const UNKNOWN_PARSE_ERROR = t`Unknown parse error`;

// Reload

export const valueSemantics = grammars.Base.createSemantics();

valueSemantics.extendOperation("asIteration", {
  List(list, _) {
    return list.asIteration();
  },
});

valueSemantics.addAttribute("value", {
  decNumber(_, digits): number {
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

valueSemantics.addAttribute("name", {
  identifier(_, __): string {
    return this.sourceString;
  },
  Name(_): string {
    return this.child(0)?.name;
  },
});
