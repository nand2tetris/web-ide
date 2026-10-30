/** Reads and parses HDL chip descriptions. */
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
 * A chip's name. A recovered `CHIP` header leaves a null name: its value is
 * empty and it stands in for the skipped header.
 */
export interface ChipName extends Recovery {
  value: string;
  span?: Span;
}

/**
 * One type for valid and recovered chips: a recovered list item is a null
 * object of its item type (see `isRecovered`). `clocked` holds strings, which
 * cannot carry a diagnostic, so a recovered `CLOCKED` clause is empty and its
 * diagnostic is only in the outcome's list.
 */
export interface HdlParse {
  name: ChipName;
  ins: PinDeclaration[];
  outs: PinDeclaration[];
  clocked: string[];
  parts: "BUILTIN" | Part[];
}

/**
 * What an HDL null object stands in for, named by the slot that recovered.
 */
export type HdlSkipKind =
  | "ChipHead"
  | "ChipStart"
  | "InListBody"
  | "OutListBody"
  | "PartBody"
  | "PartsClose"
  | "ChipClose"
  | "MissingChipClose";

/** Null objects for the recovered positions. */
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

/** A chip opens a scope named for it. */
function scopeOf(node: object): string | undefined {
  return "parts" in node ? (node as HdlParse).name.value : undefined;
}

/**
 * Drops recovered pins and parts; the result is checked and minted `Valid`.
 * Its provenance scopes each skip by its chip.
 */
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
  Part(body, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      body,
      correction,
    );
    if (recovered) {
      return nullPart(recovered, "PartBody");
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
    return recovered ? [...kept, nullPart(recovered, "PartsClose")] : kept;
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
    return recovered
      ? [nullPin(recovered, "InListBody")]
      : body.child(1).PinList;
  },
  OutList(body, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      body,
      correction,
    );
    return recovered
      ? [nullPin(recovered, "OutListBody")]
      : body.child(1).PinList;
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

/** A chip's name, `IN` pins and `OUT` pins, or the null name of a skipped header. */
type ChipStart = Pick<HdlParse, "name" | "ins" | "outs">;

hdlSemantics.addAttribute<ChipStart>("ChipStart", {
  ChipStart(head, correction, _open, pins) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      head,
      correction,
    );
    return {
      name: recovered
        ? nullName(recovered, "ChipHead")
        : {
            value: head.child(1).sourceString,
            span: span(head.child(1).source),
          },
      ins: pins.child(0).child(0)?.Pins ?? [],
      outs: pins.child(1).child(0)?.Pins ?? [],
    };
  },
});

/** A chip's start, or a null name with no pins when it lacks its `{`. */
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

/** The null part for input skipped before a matched chip closer. */
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
    const kept = parts.children.map((c) => c.Part as Part);
    return {
      ...(open.ChipOpen as ChipStart),
      parts: [...kept, ...chipCloser(correction)],
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
