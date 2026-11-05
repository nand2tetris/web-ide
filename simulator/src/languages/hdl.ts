import { type Node, grammar as ohmGrammar } from "ohm-js";
import {
  attachTrailingSkip,
  baseSemantics,
  carrierOf,
  grammars,
  guardedRecovery,
  isRecovered,
  makeParser,
  makePrune,
  type Recovery,
  type RecoveryPoint,
  reservedName,
  rewrites,
  span,
  transferTrailingSkips,
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
  span?: Span;
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
 * When a CLOCKED guard is discarded, the list is empty and its diagnostic is
 * in the outcome. A retained list can carry skipped-tail provenance by identity.
 */
export interface HdlParse {
  name: ChipName;
  ins: PinDeclaration[];
  outs: PinDeclaration[];
  clocked: string[];
  parts: "BUILTIN" | Part[];
  /** Recovery placeholders retained when a mixed part list becomes BUILTIN. */
  skippedParts?: Part[];
}

export type HdlSkipKind =
  | "ChipHead"
  | "ChipHeadTail"
  | "ChipStart"
  | "ChipStartTail"
  | "InListBody"
  | "InListTail"
  | "OutListBody"
  | "OutListTail"
  | "PartBody"
  | "PartTail"
  | "ClockedTail"
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
  ({ skippedParts: _skippedParts, ...tree }) => ({
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

/**
 * Must list exactly the words of the `keyword` rule in hdl.ohm; a mismatch
 * yields wrong "reserved word" diagnostics.
 */
export const HDL_KEYWORDS = [
  "CHIP",
  "IN",
  "OUT",
  "PARTS",
  "BUILTIN",
  "CLOCKED",
] as const;

hdlSemantics.extendAttribute("name", {
  PinName(ident) {
    return ident.name;
  },
});

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
    const recovered: RecoveryPoint | undefined = correction.recoveredFailure
      ?.missing
      ? undefined
      : guardedRecovery(name, correction);
    if (recovered) {
      return nullPart(recovered, "PartBody");
    }
    return attachTrailingSkip(
      {
        name: name.name as string,
        wires: wires.Wires as Wire[],
        span: span(this.source),
      },
      correction,
      "PartTail",
    );
  },
});

interface PartEntries {
  value: Part[] | "BUILTIN";
  collapsed: Part[];
}

function partEntries(parts: Node): PartEntries {
  const entries = parts.children.map((node) => {
    const entry = node.child(0);
    return entry.ctorName === "BuiltinPart" ? "BUILTIN" : (entry.Part as Part);
  });
  return entries.includes("BUILTIN")
    ? {
        value: "BUILTIN",
        collapsed: entries.filter(
          (entry): entry is Part => entry !== "BUILTIN",
        ),
      }
    : { value: entries as Part[], collapsed: [] };
}

hdlSemantics.addAttribute<PartEntries>("Parts", {
  Parts(_, parts, correction, _stop) {
    const kept = partEntries(parts);
    const recovered: RecoveryPoint | undefined = correction.recovery;
    return kept.value === "BUILTIN"
      ? recovered
        ? {
            ...kept,
            collapsed: [...kept.collapsed, nullPart(recovered, "PartsClose")],
          }
        : kept
      : recovered
        ? { ...kept, value: [...kept.value, nullPart(recovered, "PartsClose")] }
        : kept;
  },
  BuiltinPart(_a, _name, _b) {
    return { value: "BUILTIN", collapsed: [] };
  },
});

hdlSemantics.addAttribute<PartEntries>("PartList", {
  PartList(list) {
    return list.Parts;
  },
});

hdlSemantics.addAttribute<string[]>("Clocked", {
  ClockedList(_keyword, pins, correction, _end) {
    if (correction.recovery && !correction.recoveredFailure?.missing) {
      return [];
    }
    const retained: string[] =
      pins
        .asIteration()
        .children.map(
          ({ sourceString }: { sourceString: string }) => sourceString,
        ) ?? [];
    return attachTrailingSkip(retained, correction, "ClockedTail");
  },
});

hdlSemantics.addAttribute<PinDeclaration[]>("Pins", {
  InList(keyword, pins, correction, _end) {
    const recovered: RecoveryPoint | undefined = correction.recoveredFailure
      ?.missing
      ? undefined
      : guardedRecovery(keyword, correction);
    if (recovered) return [nullPin(recovered, "InListBody")];
    const retained: PinDeclaration[] = pins.PinList;
    return attachTrailingSkip(retained, correction, "InListTail");
  },
  OutList(keyword, pins, correction, _end) {
    const recovered: RecoveryPoint | undefined = correction.recoveredFailure
      ?.missing
      ? undefined
      : guardedRecovery(keyword, correction);
    if (recovered) return [nullPin(recovered, "OutListBody")];
    const retained: PinDeclaration[] = pins.PinList;
    return attachTrailingSkip(retained, correction, "OutListTail");
  },
});

hdlSemantics.addAttribute<PinDeclaration>("PinDecl", {
  PinDecl({ name }, width) {
    return {
      pin: name,
      width: width.child(0)?.child(1)?.value ?? 1,
      span: span(this.source),
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
    const recovered: RecoveryPoint | undefined = correction.recoveredFailure
      ?.missing
      ? undefined
      : guardedRecovery(keyword, correction);
    return {
      name: recovered
        ? nullName(recovered, "ChipHead")
        : attachTrailingSkip(
            {
              value: name.sourceString,
              span: span(name.source),
            },
            correction,
            "ChipHeadTail",
          ),
      ins: pins.child(0).child(0)?.Pins ?? [],
      outs: pins.child(1).child(0)?.Pins ?? [],
    };
  },
});

hdlSemantics.addAttribute<ChipStart>("ChipOpen", {
  ChipOpen(start, correction, _partsStart) {
    const recovered: RecoveryPoint | undefined = correction.recoveredFailure
      ?.missing
      ? undefined
      : guardedRecovery(start, correction);
    if (recovered)
      return { name: nullName(recovered, "ChipStart"), ins: [], outs: [] };
    const retained = start.ChipStart as ChipStart;
    attachTrailingSkip(retained.name, correction, "ChipStartTail");
    return retained;
  },
});

function chipCloser(correction: Node): Part[] {
  const recovered: RecoveryPoint | undefined = correction.recovery;
  if (recovered === undefined) return [];
  return [nullPart(recovered, "PartsClose")];
}

hdlSemantics.addAttribute<HdlParse>("Chip", {
  Chip_closed(open, body, close) {
    const entries: PartEntries = body.child(0).PartList ?? {
      value: [],
      collapsed: [],
    };
    const parts = entries.value;
    // Keep skipped input after the closer in the part list or, for a builtin,
    // in the placeholders retained for provenance.
    const trailing: RecoveryPoint | undefined = close.child(1).recovery;
    const skippedParts = entries.collapsed.filter(isRecovered);
    if (trailing && parts === "BUILTIN") {
      skippedParts.push(nullPart(trailing, "ChipClose"));
    }
    const chip: HdlParse = {
      ...(open.ChipOpen as ChipStart),
      parts:
        trailing && parts !== "BUILTIN"
          ? [...parts, nullPart(trailing, "ChipClose")]
          : parts,
      clocked: body.child(1).child(0)?.Clocked,
      ...(skippedParts.length > 0 ? { skippedParts } : {}),
    };
    for (const part of entries.collapsed) transferTrailingSkips(part, chip);
    return chip;
  },
  Chip_unclosed(open, _parts, parts, correction, _close) {
    const kept = partEntries(parts);
    const skippedParts =
      kept.value === "BUILTIN"
        ? [...kept.collapsed.filter(isRecovered), ...chipCloser(correction)]
        : [];
    const chip: HdlParse = {
      ...(open.ChipOpen as ChipStart),
      parts:
        kept.value === "BUILTIN"
          ? kept.value
          : [...kept.value, ...chipCloser(correction)],
      clocked: [],
      ...(skippedParts.length > 0 ? { skippedParts } : {}),
    };
    for (const part of kept.collapsed) transferTrailingSkips(part, chip);
    return chip;
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
  ...makeParser<HdlParse>(
    grammar,
    hdlSemantics,
    emptyChip,
    "Chip",
    rewrites(reservedName(HDL_KEYWORDS, ["a pin name"])),
  ),
};
