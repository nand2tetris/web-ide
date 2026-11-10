import { describe, expect, it } from "vitest";
import { isRecovered, validOf } from "../base.js";
import { rawCMP } from "../cmp.js";
import { describeDiagnostic } from "../diagnostic.js";
import { TST, type TstCommand } from "../tst.js";

const RECOVER = { attemptRecovery: true };
const SEPARATOR = 'expected ",", "!", or ";"';
const SETTING = 'expected "%B", ".", a digit, or "%X"';
const OPERATIONS =
  '"resetRam", "ROM32K", "clear-echo", "echo", "output", "set", "vmstep", "tock", "tick", "ticktock", "eval", "output-list", "compare-to", "output-file", or "load"';
const COMMAND = `expected ${OPERATIONS}`;
const ANY = `expected end of input, "while", "repeat", ${OPERATIONS}`;

it("TST reports every mistake and links each null command to its listed diagnostic", () => {
  const outcome = TST.parse(
    "load Not.hdl,\nset in,\nevl,\neval 1,\noutput;",
    RECOVER,
  );

  expect(outcome).not.toHaveProperty("nullRoot");
  expect(outcome.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
    `Line 2: ${SETTING}`,
    `Line 3: ${ANY}`,
    `Line 4: ${SEPARATOR}`,
  ]);
  const commands = outcome.ast.lines as TstCommand[];
  expect(commands.filter(isRecovered).map((node) => node.recovery)).toEqual(
    outcome.diagnostics,
  );
  commands
    .filter(isRecovered)
    .forEach((node, i) => expect(node.recovery).toBe(outcome.diagnostics[i]));
  expect(commands.at(-1)?.op).toEqual({ op: "output" });
  expect(validOf(outcome)).toBeErr();
});

it("CMP reports every malformed row and links each null row to its listed diagnostic", () => {
  const outcome = rawCMP.parse("| in | out |\n  0 | 1 |\n| 1 | 0 ", RECOVER);

  expect(outcome).not.toHaveProperty("nullRoot");
  expect(outcome.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
    'Line 2: expected end of input or "|"',
    'Line 3: expected "|"',
  ]);
  const damaged = outcome.ast.filter(isRecovered);
  expect(damaged).toHaveLength(2);
  damaged.forEach((node, i) =>
    expect(node.recovery).toBe(outcome.diagnostics[i]),
  );
  expect(outcome.ast[0]).toEqual([" in ", " out "]);
  expect(validOf(outcome)).toBeErr();
});

describe("TST joins", () => {
  it("stops at a block's closer instead of swallowing it", () => {
    const outcome = TST.parse("repeat 2 {\n tick,\n tock\n}\noutput;", RECOVER);
    expect(outcome).not.toHaveProperty("nullRoot");
    expect(outcome.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
      `Line 4: ${SEPARATOR}`,
    ]);
    expect(outcome.ast.lines.at(-1)).toMatchObject({ op: { op: "output" } });
  });

  it("leaves repeat and while to their own alternatives", () => {
    const outcome = TST.parse(
      "set n,\nrepeat 2 { tick; }\nwhile n < 3 { evl; }\noutput;",
      RECOVER,
    );
    expect(outcome.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
      `Line 1: ${SETTING}`,
      `Line 3: ${COMMAND}`,
    ]);
    expect(outcome.ast.lines).toMatchObject([
      {},
      { count: 2 },
      { condition: { op: "<" } },
      { op: { op: "output" } },
    ]);
  });

  it("consumes input on every recovery and terminates", () => {
    const outcome = TST.parse("load Not.hdl,\n,\n;\n!\noutput;", RECOVER);
    expect(outcome.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
      `Line 2: ${ANY}`,
      `Line 3: ${ANY}`,
      `Line 4: ${ANY}`,
    ]);
    expect(outcome.ast.lines.at(-1)).toMatchObject({ op: { op: "output" } });
  });

  it.each([
    ['ech "a, b";\noutput;', `expected "while", "repeat", ${OPERATIONS}`],
    ['echo hello "x; y";\noutput;', 'expected "\\""'],
  ])(
    "skips a string after the failure point whole in %j",
    (source, message) => {
      const outcome = TST.parse(source, RECOVER);
      expect(outcome).not.toHaveProperty("nullRoot");
      expect(outcome.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
        `Line 1: ${message}`,
      ]);
      expect(outcome.ast.lines.at(-1)).toMatchObject({ op: { op: "output" } });
    },
  );
});
