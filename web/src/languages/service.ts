// Editor features for HDL and Jack, from role actions over the simulator's own
// grammars. The roles say which names declare and which refer; the language
// service answers diagnostics, outline, definition, references, rename and
// completion from them.
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

/** The pin names of a builtin chip, which a part may wire. */
export const builtinChipPins = (name: string): string[] | undefined => {
  const make = REGISTRY.get(name);
  if (make === undefined) return undefined;
  const chip = make();
  return [...chip.ins.entries(), ...chip.outs.entries()].map((p) => p.name);
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
    ChipHead: declare((_chip, name) => name, "chip", { hoist: true }),
    PinDecl: declare((name) => name, "pin"),
    ClockedBody: ref((_k, pins) => descendants(pins, "Name"), "pin"),
    PartBody: ref((name) => name, "chip", { external: true, as: "part" }),
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

/** Subroutine names of the OS classes, from the VM builtins table. */
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
  const kindOf = (n: Node) => n.child(0).sourceString;
  const identifier = (t: Node) =>
    t.ctorName === "jackIdentifier" && t.sourceString !== "void" ? t : [];
  return language.roles({
    Class_body: scope(),
    Class_unclosed: scope(),
    SubroutineDec: scope(),
    ClassHead: declare((_k, n) => n, "class", { hoist: true }),
    ClassVarDecBody: declare(
      (_k, _t, n, rest) => [n, ...descendants(rest, "jackIdentifier")],
      (k) => kindOf(k),
      { private: true, type: (_k, t) => t },
    ),
    SubroutineHead: declare(
      (_k, _r, n) => n,
      (k) => kindOf(k),
      {
        hoist: true,
        data: (_k: Node, _r: Node, _n: Node, _l: Node, params: Node) => ({
          arity: descendants(params, "Parameter").length,
        }),
      },
    ),
    Parameter: declare((_t, n) => n, "parameter", { type: (t) => t }),
    VarDecBody: declare(
      (_v, _t, n, rest) => [n, ...descendants(rest, "jackIdentifier")],
      "local",
      { type: (_v, t) => t },
    ),
    type: ref((t) => identifier(t), "class"),
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
