import { describe, expect, it } from "vitest";
import { isRecovered, recoveredOf } from "./base.js";
import { HDL, prune as hdlPrune } from "./hdl.js";
import { JACK, prune as jackPrune } from "./jack.js";
import { TST, type TstRepeat, prune as tstPrune } from "./tst.js";

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

  it("builds no pruned tree when an empty block has no closer", () => {
    const outcome = TST.parse("repeat 1 {", RECOVER);

    expect(outcome).toHaveProperty("nullRoot", true);
    expect(recoveredOf(outcome, tstPrune)).toBeUndefined();
  });

  it("retains a command when a missing block closer is inferred", () => {
    const outcome = TST.parse("repeat 1 { eval;", RECOVER);
    const recovered = recoveredOf(outcome, tstPrune);
    const repeat = recovered?.ast.lines[0] as TstRepeat;
    expect(repeat.statements.map((command) => command.op.op)).toEqual(["eval"]);
    expect(outcome.diagnostics).toHaveLength(1);
    expect(recovered?.provenance).toEqual([]);
  });

  it("retains a command and records the skipped tail before an inferred closer", () => {
    const source = "repeat 1 { eval; xyz";
    const outcome = TST.parse(source, RECOVER);
    const recovered = recoveredOf(outcome, tstPrune);
    const repeat = recovered?.ast.lines[0] as TstRepeat;
    expect(repeat.statements.map((command) => command.op.op)).toEqual(["eval"]);
    const [skip] = recovered?.provenance ?? [];
    expect(source.slice(skip.interval.start, skip.interval.end)).toBe("xyz");
    expect(skip.kind).toBe("TstOperation");
  });
});

describe("provenance captured before pruning", () => {
  it("retains Jack statements when missing semicolons are inferred", () => {
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

    expect(provenance).toEqual([]);
    const tree = jackPrune(outcome.ast);
    expect(tree.subroutines[0].body.statements[0]).toMatchObject({
      statementType: "ifStatement",
      body: [{ statementType: "letStatement", name: { value: "x" } }],
    });
    expect(tree.subroutines[1].body.statements[0]).toMatchObject({
      statementType: "doStatement",
    });
    expect(outcome.diagnostics).toHaveLength(2);
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

it("retains guarded statement and skipped provenance", () => {
  const source =
    "class Main { function void f() { let x = 1 xyz let y = 2; return; } }";
  const result = JACK.parse(source, { attemptRecovery: true });
  const clean = jackPrune(result.ast);
  expect(clean.subroutines[0].body.statements[0]).toMatchObject({
    statementType: "letStatement",
    name: { value: "x" },
  });
  const [skip] = jackPrune.provenance(result.ast);
  expect(skip).toMatchObject({
    kind: "StatementTrailing",
    interval: { start: source.indexOf("xyz"), end: source.indexOf("xyz") + 3 },
    scope: ["Main", "f"],
    key: expect.any(String),
  });
  expect(result.diagnostics).toContain(skip.diagnostic);
});
