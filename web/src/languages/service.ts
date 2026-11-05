import { REGISTRY } from "@nand2tetris/simulator/chip/builtins/index.js";
import { grammar as hdlGrammar } from "@nand2tetris/simulator/languages/hdl.js";
import { grammar as jackGrammar } from "@nand2tetris/simulator/languages/jack.js";
import { VM_BUILTINS } from "@nand2tetris/simulator/vm/builtins.js";
import type { ReadonlyVfs, WorkspaceConfig } from "@ohm-js/language";
import {
  declare,
  defineLanguage,
  descendants,
  type Language,
  ref,
  scope,
} from "@ohm-js/language";
import type { Node } from "ohm-js";

export const builtinChipPins = (name: string): string[] | undefined => {
  const make = REGISTRY.get(name);
  if (make === undefined) return undefined;
  const chip = make();
  try {
    return [...chip.ins.entries(), ...chip.outs.entries()].map((p) => p.name);
  } finally {
    chip.remove();
  }
};

export function hdlLanguage(
  workspace?: Pick<WorkspaceConfig, "group"> & { vfs?: ReadonlyVfs },
): Language {
  const language = defineLanguage(hdlGrammar, {
    start: "Root",
    workspace: workspace && {
      mode: "ambient",
      exported: (d) => d.kind === "chip",
      ...workspace,
    },
    external: {
      chip: (name) => {
        const members = builtinChipPins(name);
        return members && { members };
      },
    },
  });
  const firstName = (n: Node) => descendants(n, "Name")[0];
  return language.roles({
    Chip_closed: scope(),
    Chip_unclosed: scope(),
    ChipStart: declare(
      (_chip, name, correction) => (correction.recoveredFailure ? [] : name),
      "chip",
      { hoist: true },
    ),
    PinDecl: declare((name) => name, "pin"),
    ClockedList: ref(
      (_k, pins, correction) =>
        correction.recoveredFailure ? [] : descendants(pins, "Name"),
      "pin",
    ),
    Part: ref(
      (name, _open, _wires, _close, correction) =>
        correction.recoveredFailure ? [] : name,
      "chip",
      { external: true, as: "part" },
    ),
    Wire: ref(
      (lhs) => firstName(lhs),
      "pin",
      { via: (c) => c.part },
      ref(
        (_lhs, _eq, rhs) => (rhs.ctorName === "WireSide" ? firstName(rhs) : []),
        "pin",
        { orDeclare: "pin", private: true },
      ),
    ),
  });
}

const osClassMembers = (name: string): string[] | undefined => {
  const prefix = `${name}.`;
  const members = Object.keys(VM_BUILTINS)
    .filter((key) => key.startsWith(prefix))
    .map((key) => key.slice(prefix.length));
  return members.length > 0 ? members : undefined;
};

export function jackLanguage(
  workspace?: Pick<WorkspaceConfig, "group"> & { vfs?: ReadonlyVfs },
): Language {
  const language = defineLanguage(jackGrammar, {
    start: "Root",
    workspace: workspace && {
      mode: "ambient",
      exported: (d) => d.kind === "class",
      ...workspace,
    },
    namespaces: {
      value: ["static", "field", "local", "parameter"],
      subroutine: ["constructor", "function", "method"],
      class: ["class"],
    },
    external: {
      class: (name) => {
        const members = osClassMembers(name);
        return members && { members };
      },
    },
  });
  const kindOf = (n: Node) => n.child(0)?.sourceString ?? "";
  const identifier = (t: Node) =>
    t.ctorName === "jackIdentifier" && t.sourceString !== "void" ? t : [];
  return language.roles({
    Class_body: scope(),
    Class_unclosed: scope(),
    ClassOpen: declare(
      (_k, n, correction) => (correction.recoveredFailure ? [] : n),
      "class",
      { hoist: true },
    ),
    ClassVarDec: declare(
      (_k, _t, n, rest, correction) =>
        correction.recoveredFailure
          ? []
          : [n, ...descendants(rest, "jackIdentifier")],
      (k) => kindOf(k),
      { private: true, type: (_k, t) => t },
    ),
    SubroutineDec: scope(
      declare(
        (_k, _r, n, _open, _params, _close, correction) =>
          correction.recoveredFailure ? [] : n,
        (k) => kindOf(k),
        {
          hoist: true,
          data: (_k: Node, _r: Node, _n: Node, _l: Node, params: Node) => ({
            arity: descendants(params, "Parameter").length,
          }),
        },
      ),
    ),
    Parameter: declare((_t, n) => n, "parameter", { type: (t) => t }),
    VarDec: declare(
      (_v, _t, n, rest, correction) =>
        correction.recoveredFailure
          ? []
          : [n, ...descendants(rest, "jackIdentifier")],
      "local",
      { type: (_v, t) => t },
    ),
    type: ref((t) => identifier(t), "class", { external: true }),
    arrayAccessStart: ref((id) => id, "value"),
    LetTarget: ref((t) => identifier(t), "value"),
    Term: ref((t) => identifier(t), "value"),
    SubroutineName: ref((n) => identifier(n), "subroutine"),
    compoundIdentifier: ref(
      (recv) => recv,
      ["value", "class"],
      { external: true, as: "recv" },
      ref((_r, _d, name) => name, "subroutine", { via: (c) => c.recv }),
    ),
  });
}

/** Match the owning grammar's lexical rule, including its Unicode letter rules. */
export function validIdentifier(language: string, name: string): boolean {
  return language === "hdl"
    ? hdlGrammar.match(name, "identifier").succeeded()
    : jackGrammar.match(name, "jackIdentifier").succeeded();
}
