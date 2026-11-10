import { describe, expect, it } from "vitest";
import { isRecovered, isValid, recoveryOf, validOf } from "../base.js";
import { describeDiagnostic } from "../diagnostic.js";
import { HDL } from "../hdl.js";

const RECOVER = { attemptRecovery: true };
const WIRE_SEPARATOR = 'expected ")", ",", or "["';

const MISTAKES = [
  "Not { BUILTIN }",
  "CHIP { BUILTIN }",
  "CHIP Not BUILTIN }",
  "CHIP Not { BUILTIN }",
  "CHIP Not { BONKERS; }",
  "CHIP Not { ",
  "CHIP Not { PARTS: (); }",
  "CHIP Not { PARTS: Nand; }",
  "CHIP Not { PARTS: Nand() }",
  "CHIP Not { PARTS: Nand(=a) }",
  "CHIP Not { PARTS: Nand(a=) }",
  "CHIP Not { PARTS: Nand(a) }",
  "CHIP Not { PARTS: Nand(a=a }",
  "CHIP Not {\n IN a;\n OUT out;\n PARTS:\n Nand(a=a b=a, out=x);\n Nand(a=x, b=x, out=out)\n}",
  "CHIP Not {\n IN a\n OUT out;\n PARTS:\n Nand(a=a, b=a, out=out);\n}",
  "CHIP Not {\n IN a;\n OUT out;\n PARTS:\n Nand(a=a, b=a, out=out);\n CLOCKED a\n}",
];

it.each(MISTAKES)(
  "HDL recovery preserves the strict first displayed message and line for %j",
  (source) => {
    const strict = HDL.parse(source);
    const recovering = HDL.parse(source, RECOVER);
    if (isValid(strict) || isValid(recovering))
      throw new Error("expected diagnostics");
    expect(describeDiagnostic(recovering.diagnostics[0])).toBe(
      describeDiagnostic(strict.diagnostics[0]),
    );
    expect(recovering.diagnostics[0].span?.line).toBe(
      strict.diagnostics[0].span?.line,
    );
  },
);

describe("HDL recovery joins and null parts", () => {
  it.each([
    "CHIP K { OUT out; PARTS: Nand(a=true, b=true, out=out); }",
    "CHIP K { IN a; OUT out; PARTS: DFF(in=a, out=out); CLOCKED a; }",
    "CHIP K { OUT out; BUILTIN; }",
    "CHIP K { OUT out; BUILTIN K; }",
    "CHIP K { OUT out; PARTS: BUILTIN; }",
    "CHIP K { OUT out; PARTS: BUILTIN K; }",
  ])("still parses %s", (source) => {
    const outcome = HDL.parse(source, RECOVER);
    expect(validOf(outcome)).toBeOk();
    expect(outcome.diagnostics).toEqual([]);
  });

  it.each([
    [
      "leaves a CLOCKED line to the clocked list",
      "CHIP K {\n IN a;\n OUT out;\n PARTS:\n DFF(in=a out=out);\n CLOCKED a;\n}",
      [`Line 5: ${WIRE_SEPARATOR}`],
    ],
    [
      "stops at the chip's closer when the last part lacks `;`",
      "CHIP K {\n IN a;\n OUT out;\n PARTS:\n Nand(a=a, b=a, out=x);\n Nand(a=x, b=x, out=out)\n}",
      ['Line 7: expected ";"'],
    ],
    [
      "reports a broken part and a first-token typo before `}`, in order",
      "CHIP K {\n IN a;\n OUT out;\n PARTS:\n Nand(a=a b=a, out=x);\n 1Nand(a=x, b=x, out=out)\n}",
      [
        `Line 5: ${WIRE_SEPARATOR}`,
        'Line 6: expected "}", "CLOCKED", "BUILTIN", or a letter',
      ],
    ],
  ])("%s", (_name, source, expected) => {
    const outcome = HDL.parse(source as string, RECOVER);
    expect(outcome).not.toHaveProperty("nullRoot");
    expect(outcome.diagnostics.map((d) => describeDiagnostic(d))).toEqual(
      expected,
    );
  });

  it("keeps the parts before a last part that lacks its closer", () => {
    const outcome = HDL.parse(
      [
        "CHIP Xor {",
        "    IN a, b;",
        "    OUT out;",
        "    PARTS:",
        "    Not(in=a, out=nota);",
        "    Not(in=b, out=notb);",
        "    Or(a=nota, b=notb, out=out",
        "}",
      ].join("\n"),
      RECOVER,
    );
    expect(outcome).not.toHaveProperty("nullRoot");
    expect(outcome.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
      `Line 8: ${WIRE_SEPARATOR}`,
    ]);
    const parts = outcome.ast.parts;
    expect(parts).not.toBe("BUILTIN");
    if (parts === "BUILTIN") throw new Error("parts lost");
    expect(
      parts.filter((part) => !isRecovered(part)).map((part) => part.name),
    ).toEqual(["Not", "Not"]);
    expect(parts.filter(isRecovered)).toHaveLength(1);
    expect(recoveryOf(parts[2])).toBe(outcome.diagnostics[0]);
  });

  it("reports every broken part and links each null part to its listed diagnostic", () => {
    const outcome = HDL.parse(
      [
        "CHIP Xor {",
        "    IN a, b;",
        "    OUT out;",
        "",
        "    PARTS:",
        "    Not(in=a out=nota);",
        "    1Not(in=b, out=notb);",
        "    And(a=a, b=notb, out=w1);",
        "    And(a=nota, b=b, out=w2);",
        "    Or(a=w1 b=w2, out=out);",
        "}",
      ].join("\n"),
      RECOVER,
    );
    expect(outcome).not.toHaveProperty("nullRoot");
    expect(outcome.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
      `Line 6: ${WIRE_SEPARATOR}`,
      'Line 7: expected "}", "CLOCKED", "BUILTIN", or a letter',
      `Line 10: ${WIRE_SEPARATOR}`,
    ]);
    const parts = outcome.ast.parts;
    if (parts === "BUILTIN") throw new Error("parts lost");
    const broken = parts.filter(isRecovered);
    expect(broken).toHaveLength(3);
    broken.forEach((node, i) =>
      expect(recoveryOf(node)).toBe(outcome.diagnostics[i]),
    );
    expect(validOf(outcome)).toBeErr();
  });

  it("parses the intact Xor program without recovery placeholders", () => {
    const outcome = HDL.parse(
      [
        "CHIP Xor {",
        "    IN a, b;",
        "    OUT out;",
        "    PARTS:",
        "    Not(in=a, out=nota);",
        "    Not(in=b, out=notb);",
        "    And(a=a, b=notb, out=w1);",
        "    And(a=nota, b=b, out=w2);",
        "    Or(a=w1, b=w2, out=out);",
        "}",
      ].join("\n"),
      RECOVER,
    );
    expect(validOf(outcome)).toBeOk();
    expect(outcome.diagnostics).toEqual([]);
  });

  it("returns the null root when a damaged chip has no matching closer", () => {
    const outcome = HDL.parse(
      [
        "CHIP K {",
        "    IN a;",
        "    OUT out;",
        "    PARTS:",
        "    Nand(a=a b=a, out=x);",
        "    Nand(a=x b=x, out=out);",
        "",
      ].join("\n"),
      RECOVER,
    );
    expect(outcome).toHaveProperty("nullRoot", true);
    expect(outcome.ast).toEqual(HDL.empty());
    if (isValid(outcome)) throw new Error("expected diagnostics");
    expect(describeDiagnostic(outcome.diagnostics[0])).toBe(
      `Line 5: ${WIRE_SEPARATOR}`,
    );
  });
});
