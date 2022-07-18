/** Reads and parses HDL chip descriptions. */
import raw from "raw.macro";
import ohm from "ohm-js";
import { Err, Ok, Result } from "@davidsouther/jiffies/lib/esm/result";
import { grammars, UNKNOWN_PARSE_ERROR, baseSemantics } from "./base-ohm";

export interface PinIndex {
  start?: number | undefined;
  end?: number | undefined;
}

export interface PinParts extends PinIndex {
  pin: string;
}

export interface PinDeclaration {
  pin: string | string;
  width: number;
}

export interface Wire {
  lhs: PinParts;
  rhs: PinParts;
}

export interface Part {
  name: string;
  wires: Wire[];
}

export interface HdlParse {
  name: string;
  ins: PinDeclaration[];
  outs: PinDeclaration[];
  parts: "BUILTIN" | Part[];
}

const hdlGrammar = raw("./grammars/hdl.ohm");
export const grammar = ohm.grammar(hdlGrammar, grammars);

export const hdlSemantics = grammar.extendSemantics(baseSemantics);

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
    return list.asIteration().children.map(({ Wire }: { Wire: Wire }) => Wire);
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
    return list
      .asIteration()
      .children.map(({ PinDecl }: { PinDecl: PinDeclaration }) => PinDecl);
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

export const HDL = {
  grammar: hdlGrammar,
  semantics: hdlSemantics,
  parse(
    source: string
  ): Result<HdlParse, { message: string; shortMessage: string }> {
    const match = grammar.match(source);
    if (match.succeeded()) {
      const semantics = hdlSemantics(match);
      const parse = semantics.Chip;
      return Ok(parse);
    } else {
      return Err({
        message: match.message ?? UNKNOWN_PARSE_ERROR,
        shortMessage: match.shortMessage ?? UNKNOWN_PARSE_ERROR,
      });
    }
  },
};
