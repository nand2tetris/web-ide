import { type Node, grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  carrierOf,
  grammars,
  guardedRecovery,
  isRecovered,
  makeParser,
  makePrune,
  type Recovery,
  type RecoveryPoint,
  span,
} from "./base.js";
import { Span } from "./diagnostic.js";

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

export interface ChipName extends Recovery {
  value: string;
  span?: Span;
}

/**
 * Raw ASTs can contain placeholders identified by `isRecovered`; prune before use.
 * CLOCKED strings cannot carry recovery, so a skipped clause leaves an empty list
 * and its diagnostic only in the outcome.
 */
export interface HdlParse {
  name: ChipName;
  ins: PinDeclaration[];
  outs: PinDeclaration[];
  clocked: string[];
  parts: "BUILTIN" | Part[];
}

export type HdlSkipKind =
  | "ChipHead"
  | "ChipStart"
  | "InListBody"
  | "OutListBody"
  | "PartBody"
  | "PartsClose"
  | "ChipClose"
  | "MissingChipClose";

function nullPin(
  point: RecoveryPoint,
  kind: "InListBody" | "OutListBody",
): PinDeclaration {
  return { pin: "", width: 1, ...carrierOf(point, kind) };
}

function nullPart(
  point: RecoveryPoint,
  kind: "PartBody" | "PartsClose" | "ChipClose" | "MissingChipClose",
): Part {
  return { name: "", wires: [], span: point.span, ...carrierOf(point, kind) };
}

function nullName(
  point: RecoveryPoint,
  kind: "ChipHead" | "ChipStart",
): ChipName {
  return { value: "", ...carrierOf(point, kind) };
}

function scopeOf(node: object): string | undefined {
  return "parts" in node ? (node as HdlParse).name.value : undefined;
}

export const prune = makePrune<HdlParse>(
  (tree) => ({
    ...tree,
    name: isRecovered(tree.name) ? { value: "" } : tree.name,
    ins: tree.ins.filter((pin) => !isRecovered(pin)),
    outs: tree.outs.filter((pin) => !isRecovered(pin)),
    parts:
      tree.parts === "BUILTIN"
        ? tree.parts
        : tree.parts.filter((part) => !isRecovered(part)),
  }),
  scopeOf,
);

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
  Part(name, _open, wires, _close, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      name,
      correction,
    );
    if (recovered) {
      return nullPart(recovered, "PartBody");
    }
    return {
      name: name.name as string,
      wires: wires.Wires as Wire[],
      span: span(this.source),
    };
  },
});

function partEntries(parts: Node): Part[] | "BUILTIN" {
  const entries = parts.children.map((node) => {
    const entry = node.child(0);
    return entry.ctorName === "BuiltinPart" ? "BUILTIN" : (entry.Part as Part);
  });
  return entries.includes("BUILTIN") ? "BUILTIN" : (entries as Part[]);
}

hdlSemantics.addAttribute<Part[] | "BUILTIN">("Parts", {
  Parts(_, parts, correction, _stop) {
    const kept = partEntries(parts);
    const recovered: RecoveryPoint | undefined = correction.recovery;
    return kept === "BUILTIN"
      ? kept
      : recovered
        ? [...kept, nullPart(recovered, "PartsClose")]
        : kept;
  },
  BuiltinPart(_a, _name, _b) {
    return "BUILTIN";
  },
});

hdlSemantics.addAttribute<"BUILTIN" | Part[]>("PartList", {
  PartList(list) {
    return list.Parts;
  },
});

hdlSemantics.addAttribute<string[]>("Clocked", {
  ClockedList(_keyword, pins, correction, _end) {
    if (correction.recovery) {
      return [];
    }
    return (
      pins
        .asIteration()
        .children.map(
          ({ sourceString }: { sourceString: string }) => sourceString,
        ) ?? []
    );
  },
});

hdlSemantics.addAttribute<PinDeclaration[]>("Pins", {
  InList(keyword, pins, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      keyword,
      correction,
    );
    return recovered ? [nullPin(recovered, "InListBody")] : pins.PinList;
  },
  OutList(keyword, pins, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      keyword,
      correction,
    );
    return recovered ? [nullPin(recovered, "OutListBody")] : pins.PinList;
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

type ChipStart = Pick<HdlParse, "name" | "ins" | "outs">;

hdlSemantics.addAttribute<ChipStart>("ChipStart", {
  ChipStart(keyword, name, correction, _open, pins) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      keyword,
      correction,
    );
    return {
      name: recovered
        ? nullName(recovered, "ChipHead")
        : {
            value: name.sourceString,
            span: span(name.source),
          },
      ins: pins.child(0).child(0)?.Pins ?? [],
      outs: pins.child(1).child(0)?.Pins ?? [],
    };
  },
});

hdlSemantics.addAttribute<ChipStart>("ChipOpen", {
  ChipOpen(start, correction, _partsStart) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      start,
      correction,
    );
    return recovered
      ? { name: nullName(recovered, "ChipStart"), ins: [], outs: [] }
      : (start.ChipStart as ChipStart);
  },
});

function chipCloser(correction: Node): Part[] {
  const recovered: RecoveryPoint | undefined = correction.recovery;
  if (recovered === undefined) return [];
  return [nullPart(recovered, "PartsClose")];
}

hdlSemantics.addAttribute<HdlParse>("Chip", {
  Chip_closed(open, body, close) {
    const parts: "BUILTIN" | Part[] = body.child(0).PartList ?? [];
    // Skipped input after the closer becomes a null part. A builtin chip has
    // no part list to hold it, and nothing it skipped could reach a check.
    const trailing: RecoveryPoint | undefined = close.child(1).recovery;
    return {
      ...(open.ChipOpen as ChipStart),
      parts:
        trailing && parts !== "BUILTIN"
          ? [...parts, nullPart(trailing, "ChipClose")]
          : parts,
      clocked: body.child(1).child(0)?.Clocked,
    };
  },
  Chip_unclosed(open, _parts, parts, correction, _close) {
    const kept = partEntries(parts);
    return {
      ...(open.ChipOpen as ChipStart),
      parts: kept === "BUILTIN" ? kept : [...kept, ...chipCloser(correction)],
      clocked: [],
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
