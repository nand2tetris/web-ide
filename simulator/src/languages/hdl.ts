/** Reads and parses HDL chip descriptions. */
import { grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  grammars,
  guardedRecovery,
  isRecovered,
  makeParser,
  makePrune,
  type Recovery,
  type RecoveryPoint,
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

export interface PinDeclaration extends Recovery {
  pin: string | string;
  width: number;
}

export interface Wire {
  lhs: PinParts;
  rhs: PinParts;
}

export interface Part extends Recovery {
  name: string;
  wires: Wire[];
  span: Span;
}

/**
 * One type for valid and recovered chips: a recovered list item is a null
 * object of its item type (see `isRecovered`). `clocked` holds strings, which
 * cannot carry a diagnostic, so a recovered `CLOCKED` clause is empty and its
 * diagnostic is only in the outcome's list.
 */
export interface HdlParse {
  name: { value: string; span?: Span };
  ins: PinDeclaration[];
  outs: PinDeclaration[];
  clocked: string[];
  parts: "BUILTIN" | Part[];
}

/** Null objects for the recovered positions. */
function nullPin({ recovery }: RecoveryPoint): PinDeclaration {
  return { pin: "", width: 1, recovery };
}

function nullPart({ recovery, span }: RecoveryPoint): Part {
  return { name: "", wires: [], span, recovery };
}

/** Drops recovered pins and parts; the result is checked and minted `Valid`. */
export const prune = makePrune<HdlParse>((tree) => ({
  ...tree,
  ins: tree.ins.filter((pin) => !isRecovered(pin)),
  outs: tree.outs.filter((pin) => !isRecovered(pin)),
  parts:
    tree.parts === "BUILTIN"
      ? tree.parts
      : tree.parts.filter((part) => !isRecovered(part)),
}));

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

hdlSemantics.addAttribute<Part>("Part", {
  Part(body, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      body,
      correction,
    );
    if (recovered) {
      return nullPart(recovered);
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

hdlSemantics.addAttribute<Part[] | "BUILTIN">("Parts", {
  Parts(_, parts, correction, _stop) {
    const kept = parts.children.map((c) => c.Part as Part);
    const recovered: RecoveryPoint | undefined = correction.recovery;
    return recovered ? [...kept, nullPart(recovered)] : kept;
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

hdlSemantics.addAttribute<string[]>("Clocked", {
  ClockedList(body, correction, _end) {
    if (correction.recovery) {
      return [];
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

/** A pin list, or the one null pin of a recovered `IN` or `OUT` line. */
hdlSemantics.addAttribute<PinDeclaration[]>("Pins", {
  InList(body, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      body,
      correction,
    );
    return recovered ? [nullPin(recovered)] : body.child(1).PinList;
  },
  OutList(body, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      body,
      correction,
    );
    return recovered ? [nullPin(recovered)] : body.child(1).PinList;
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

hdlSemantics.addAttribute<HdlParse>("Chip", {
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

hdlSemantics.addAttribute<HdlParse>("Root", {
  Root(root) {
    return root.child(0)?.Chip;
  },
});

/** The null root of a parse that built no chip: a chip with no name or pins. */
function emptyChip(): HdlParse {
  return { name: { value: "" }, ins: [], outs: [], clocked: [], parts: [] };
}

export const HDL = {
  parser: grammar,
  grammar: hdlGrammar,
  semantics: hdlSemantics,
  ...makeParser<HdlParse>(grammar, hdlSemantics, emptyChip, "Chip"),
};
