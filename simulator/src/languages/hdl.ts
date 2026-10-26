/** Reads and parses HDL chip descriptions. */
import { grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  grammars,
  isFail,
  makeParsers,
  type ParseError,
  parseErrorOf,
  Span,
  span,
} from "./base.js";

export interface PinIndex {
  start?: number | undefined;
  end?: number | undefined;
}

export interface PinParts extends PinIndex {
  pin: string;
  span: Span;
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
  span: Span;
}

/**
 * `E` widens the lists at the recovery points; `never` is the strict type that
 * a valid parse produces, `ParseError` the partial one.
 */
export interface HdlParse<E = never> {
  name: { value: string; span?: Span };
  ins: (PinDeclaration | E)[];
  outs: (PinDeclaration | E)[];
  clocked: (string | E)[];
  parts: "BUILTIN" | (Part | E)[];
}

/** An HdlParse where recovery may have replaced items with error nodes. */
export type HdlPartial = HdlParse<ParseError>;

import hdlGrammar from "./grammars/hdl.ohm.js";
export const grammar = ohmGrammar(hdlGrammar, grammars);

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
    return { pin: name, start, end, span: span(this.source) };
  },
});

hdlSemantics.addAttribute<Wire>("Wire", {
  Wire(left, _, right) {
    const rhs: PinParts = right.isTerminal()
      ? { pin: right.sourceString }
      : right.WireSide;
    return { lhs: left.WireSide as PinParts, rhs };
  },
});

hdlSemantics.addAttribute<Wire[]>("Wires", {
  Wires(list) {
    return list.asIteration().children.map((node) => node.Wire as Wire);
  },
});

hdlSemantics.addAttribute<Part | ParseError>("Part", {
  Part(body, end) {
    if (isFail(end)) {
      return parseErrorOf(end);
    }
    const { name } = body.child(0);
    const { Wires } = body.child(2);
    return {
      name: name as string,
      wires: Wires as Wire[],
      span: span(this.source),
    };
  },
});

hdlSemantics.addAttribute<(Part | ParseError)[] | "BUILTIN">("Parts", {
  Parts(_, parts, stop) {
    const kept = parts.children.map((c) => c.Part as Part | ParseError);
    return isFail(stop) ? [...kept, parseErrorOf(stop)] : kept;
  },
  BuiltinPart(_a, _b) {
    return "BUILTIN";
  },
});

hdlSemantics.addAttribute<"BUILTIN" | (Part | ParseError)[]>("PartList", {
  PartList(list) {
    return list.Parts;
  },
});

hdlSemantics.addAttribute<(string | ParseError)[]>("Clocked", {
  ClockedList(body, end) {
    if (isFail(end)) {
      return [parseErrorOf(end)];
    }
    return (
      body
        .child(1)
        .asIteration()
        .children.map(
          ({ sourceString }: { sourceString: string }) => sourceString,
        ) ?? []
    );
  },
});

/** A pin list, or the one error node of a recovered `IN` or `OUT` line. */
hdlSemantics.addAttribute<(PinDeclaration | ParseError)[]>("Pins", {
  InList(body, end) {
    return isFail(end) ? [parseErrorOf(end)] : body.child(1).PinList;
  },
  OutList(body, end) {
    return isFail(end) ? [parseErrorOf(end)] : body.child(1).PinList;
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
      .children.map((node) => node.PinDecl as PinDeclaration);
  },
});

hdlSemantics.addAttribute<HdlPartial>("Chip", {
  Chip(_a, name, _b, body, _c) {
    return {
      name: { value: name.sourceString, span: span(name.source) },
      ins: body.child(0).child(0)?.Pins ?? [],
      outs: body.child(1).child(0)?.Pins ?? [],
      parts: body.child(2).PartList ?? [],
      clocked: body.child(3).child(0)?.Clocked,
    };
  },
});

hdlSemantics.addAttribute<HdlPartial>("Root", {
  Root(root) {
    return root.child(0)?.Chip;
  },
});

export const HDL = {
  parser: grammar,
  grammar: hdlGrammar,
  semantics: hdlSemantics,
  ...makeParsers<HdlPartial>(grammar, hdlSemantics, (n) => n.Chip),
};
