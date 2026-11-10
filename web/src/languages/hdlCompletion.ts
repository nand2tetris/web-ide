import type { Definition } from "@ohm-js/language";

export type HdlSlot =
  | { slot: "chip" }
  | { slot: "part-pin"; chip: string }
  | { slot: "pin" }
  | { slot: "none" };

/** The text with comments blanked, so offsets and line structure are kept. */
function withoutComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?(\*\/|$)/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));
}

export function hdlSlot(textBefore: string): HdlSlot {
  const text = withoutComments(textBefore);
  let inParts = false;
  let statement = 0;
  let open = -1;
  let wire = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (!inParts && text.startsWith("PARTS:", i)) {
      inParts = true;
      i += "PARTS:".length - 1;
      statement = i + 1;
    } else if (c === "{" || c === ";") {
      statement = i + 1;
      open = -1;
    } else if (c === "(" && inParts && open < 0) {
      open = i;
      wire = i + 1;
    } else if (c === ")" && open >= 0) {
      open = -1;
    } else if (c === "," && open >= 0) {
      wire = i + 1;
    }
  }
  if (!inParts) return { slot: "none" };
  if (open >= 0) {
    const chip = text.slice(statement, open).trim();
    return text.slice(wire).includes("=")
      ? { slot: "pin" }
      : { slot: "part-pin", chip };
  }
  const started = text.slice(statement);
  if (/^\s*CLOCKED\b/.test(started)) return { slot: "pin" };
  return /^\s*\w*$/.test(started) ? { slot: "chip" } : { slot: "none" };
}

export interface HdlCandidate {
  label: string;
  kind: "chip" | "pin" | "keyword";
}

export interface HdlSources {
  definitions: readonly Definition[];
  /** The URI being edited, whose own chip cannot be one of its parts. */
  uri: string;
  builtinChips: readonly string[];
  /** Builtin pins have no definition node. */
  builtinPins(chip: string): readonly string[] | undefined;
}

export function hdlCandidates(
  slot: HdlSlot,
  { definitions, uri, builtinChips, builtinPins }: HdlSources,
): HdlCandidate[] {
  const unique = (names: Iterable<string>, kind: HdlCandidate["kind"]) =>
    [...new Set(names)].map((label) => ({ label, kind }));
  switch (slot.slot) {
    case "chip":
      // Builtin chips come as whole parts from the snippet provider.
      return unique(
        definitions
          .filter(
            (d) =>
              d.kind === "chip" &&
              d.uri !== uri &&
              !builtinChips.includes(d.name),
          )
          .map((d) => d.name),
        "chip",
      );
    case "part-pin": {
      const chip = definitions.find(
        (d) => d.kind === "chip" && d.name === slot.chip && d.uri !== uri,
      );
      const pins = chip?.members
        ? chip.members.symbols
            .filter((s) => s.kind === "pin" && !s.private)
            .map((s) => s.name)
        : (builtinPins(slot.chip) ?? []);
      return unique(pins, "pin");
    }
    case "pin":
      return [
        ...unique(
          definitions.filter((d) => d.kind === "pin").map((d) => d.name),
          "pin",
        ),
        ...unique(["true", "false"], "keyword"),
      ];
    case "none":
      return [];
  }
}
