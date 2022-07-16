import raw from "raw.macro";
import ohm from "ohm-js";
import { grammars, valueSemantics } from "./base-ohm";
import {
  HdlParse,
  Part,
  PinDeclaration,
  PinIndex,
  PinParts,
  Wire,
} from "./hdl";

const hdlGrammar = raw("./grammars/hdl.ohm");
console.log(hdlGrammar);
export const grammar = ohm.grammar(hdlGrammar, grammars);

export const hdlSemantics = grammar.extendSemantics(valueSemantics);

hdlSemantics.addAttribute<PinIndex>("SubBus", {
  SubBus(_a, startNode, endNode, _b) {
    const start = startNode.value;
    const end = endNode.child(0)?.child(1)?.value ?? start;
    return { start, end };
  },
});

hdlSemantics.addAttribute<PinParts>("WireSide", {
  WireSide({ name }, index) {
    const { start, end } = (index.child(0)?.SubBus as PinIndex) ?? {
      start: undefined,
      end: undefined,
    };
    return { pin: name, start, end };
  },
});

hdlSemantics.addAttribute<Wire>("Wire", {
  Wire(left, _, right) {
    let rhs: PinParts = right.isTerminal()
      ? { pin: right.sourceString }
      : right.WireSide;
    return { lhs: left.WireSide as PinParts, rhs };
  },
});

hdlSemantics.addAttribute<Wire[]>("Wires", {
  Wires(list) {
    return [list.child(0).Wire, ...list.child(2).children.map((w) => w.Wire)];
  },
});

hdlSemantics.addAttribute<Part>("Part", {
  Part({ name }, _a, { Wires }, _b, _c) {
    return { name: name as string, wires: Wires as Wire[] };
  },
});

hdlSemantics.addAttribute<Part[] | "BUILTIN">("Parts", {
  Parts(_, parts) {
    return parts.children.map((c) => c.Part);
  },
  BuiltinPart(_a, _b) {
    return "BUILTIN";
  },
});

hdlSemantics.addAttribute<"BUILTIN" | Part[]>("PartList", {
  PartList(list) {
    return list.Parts;
  },
});

hdlSemantics.addAttribute<PinDeclaration>("PinDecl", {
  PinDecl({ name }, width) {
    return {
      pin: name,
      width: width.child(0)?.child(1)?.value ?? 1,
    };
  },
});

hdlSemantics.addAttribute<PinDeclaration[]>("PinList", {
  PinList(list) {
    return [
      list.child(0)?.PinDecl,
      ...list.child(2)?.children.map((c) => c.PinDecl),
    ];
  },
});

hdlSemantics.addAttribute<HdlParse>("Chip", {
  Chip(_a, { name }, _b, body, _c) {
    return {
      name,
      ins: body.child(0)?.child(0)?.child(1)?.PinList ?? [],
      outs: body.child(1)?.child(0)?.child(1)?.PinList ?? [],
      parts: body.child(2)?.PartList ?? [],
    };
  },
});
