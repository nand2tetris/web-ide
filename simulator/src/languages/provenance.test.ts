import { describe, expect, it } from "vitest";
import { isRecovered, recoveredOf } from "./base.js";

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
