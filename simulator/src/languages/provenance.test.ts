/**
 * Provenance: before pruning drops a null object, the tree records what it
 * stood in for, so later stages can tell which checks a skipped region could
 * affect. The kind is named by the action that owns the recovered slot, never
 * inferred from the null object's own type.
 */
import { describe, expect, it } from "vitest";
import { isRecovered, recoveredOf } from "./base.js";
import { HDL, prune as hdlPrune } from "./hdl.js";
import { JACK, prune as jackPrune } from "./jack.js";
import { TST, type TstRepeat } from "./tst.js";

const RECOVER = { attemptRecovery: true };

describe("a null object records what it stands in for", () => {
  it("records a skipped command before a real block closer", () => {
    const outcome = TST.parse("repeat 1 { eval; ? }", RECOVER);
    const repeat = outcome.ast.lines[0] as TstRepeat;
    const [damaged] = repeat.statements.filter(isRecovered);

    expect(damaged.skipped).toMatchObject({
      kind: "TstRepeatClose",
      interval: { start: 17, end: 18 },
      key: expect.any(String),
    });
    expect(repeat.statements[0].op).toEqual({ op: "eval" });
  });
});

describe("provenance captured before pruning", () => {
  it("records each Jack skip with its kind, full interval and owning scopes", () => {
    const source = [
      "class Main {",
      "  function void a() {",
      "    if (true) {",
      "      let x = 1",
      "    }",
      "    return;",
      "  }",
      "  function void b() {",
      "    do Output.printInt(1)",
      "    return;",
      "  }",
      "}",
    ].join("\n");
    const outcome = JACK.parse(source, RECOVER);

    const provenance = jackPrune.provenance(outcome.ast);

    expect(provenance).toMatchObject([
      {
        // The statement before `}` lacks its `;`: the if block's closer slot
        // recovered, so the skip is that closer's, inside the subroutine.
        kind: "IfClose",
        scope: ["Main", "a"],
        interval: { start: source.indexOf("let x") },
        diagnostic: outcome.diagnostics[0],
      },
      {
        kind: "DoBody",
        scope: ["Main", "b"],
        interval: { start: source.indexOf("do Output") },
        diagnostic: outcome.diagnostics[1],
      },
    ]);
    // The interval is the whole skipped input; the diagnostic is a point.
    for (const { key, interval, diagnostic } of provenance) {
      expect(key).toEqual(expect.any(String));
      expect(interval.end).toBeGreaterThan(interval.start);
      expect(diagnostic.span?.end).toBe(diagnostic.span?.start);
    }
  });
});

describe("a recovered tree beside a null root", () => {
  const PROBE = [
    "CHIP Probe {",
    "  IN a;",
    "  OUT x;",
    "  PARTS:",
    "  Not(in=a out=x);",
    "  Not(in=a, out=x);",
    "}",
  ].join("\n");

  it("gives a recovered HDL tree, pruned, with its provenance", () => {
    const outcome = HDL.parse(PROBE, RECOVER);

    const recovered = recoveredOf(outcome, hdlPrune);

    expect(recovered?.ast.parts).toHaveLength(1);
    expect(recovered?.provenance).toMatchObject([
      {
        kind: "PartBody",
        scope: ["Probe"],
        diagnostic: outcome.diagnostics[0],
      },
    ]);
  });

  it("gives a valid tree with no provenance", () => {
    const fixed = PROBE.replace("in=a out", "in=a, out");

    const recovered = recoveredOf(HDL.parse(fixed, RECOVER), hdlPrune);

    expect(recovered?.ast.parts).toHaveLength(2);
    expect(recovered?.provenance).toEqual([]);
  });

  it.each([
    ["recovery off", PROBE, undefined],
    ["an unrecoverable header", "CHIP {", RECOVER],
  ])("takes the syntax-only path for %s", (_name, source, options) => {
    const outcome = HDL.parse(source, options);

    expect(outcome).toHaveProperty("nullRoot", true);
    expect(outcome.diagnostics).not.toHaveLength(0);
    expect(recoveredOf(outcome, hdlPrune)).toBeUndefined();
  });

  it("leaves a no-tree file out of a class table", () => {
    const files: Record<string, string> = {
      Damaged:
        "class Damaged {\n  function void a() {\n    let x = ;\n    return;\n  }\n}",
      Broken: "class B",
    };

    const table = Object.fromEntries(
      Object.entries(files).flatMap(([name, source]) => {
        const recovered = recoveredOf(JACK.parse(source, RECOVER), jackPrune);
        return recovered ? [[name, recovered]] : [];
      }),
    );

    expect(Object.keys(table)).toEqual(["Damaged"]);
    expect(table.Damaged.ast.subroutines[0].body.statements).toHaveLength(1);
    expect(table.Damaged.provenance).toMatchObject([
      { kind: "LetBody", scope: ["Damaged", "a"] },
    ]);
  });
});
