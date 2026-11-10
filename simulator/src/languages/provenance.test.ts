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

  it("builds no pruned tree or provenance when a block has no real closer", () => {
    const outcome = TST.parse("repeat 1 { eval;", RECOVER);

    expect(outcome).toHaveProperty("nullRoot", true);
    expect(recoveredOf(outcome, tstPrune)).toBeUndefined();
  });
});
