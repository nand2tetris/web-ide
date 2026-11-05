import { describe, expect, it } from "vitest";
import {
  grammar,
  HdlParse,
  hdlSemantics,
  Part,
  PinDeclaration,
} from "./hdl.js";

const AND_BUILTIN = `CHIP And {
    IN a, b;
    OUT out;
    BUILTIN;
}`;

const NOT_PARTS = `CHIP Not {
    IN in;
    OUT out;
    PARTS:
    Nand(a=in, b=in, out=out);
}`;

const NOT_NO_PARTS = `CHIP Not {
    IN in;
    OUT out;
    PARTS:
}`;

const AND_16_BUILTIN = `CHIP And16 {
  IN a[16], b[16];
  OUT out[16];
  BUILTIN;
}`;

const AND_BUILTIN_NAMED = `CHIP And {
    IN a, b;
    OUT out;
    BUILTIN And;
}`;

const AND_BUILTIN_IN_PARTS = `CHIP And {
    IN a, b;
    OUT out;
    PARTS:
    BUILTIN And;
}`;

const CLOCKED = `CHIP Foo {
    IN in;

    PARTS:

    CLOCKED in;
}`;

const ERRORS = [
  ["Not { BUILTIN }", 'Line 1, col 1: expected "CHIP"'],
  ["CHIP { BUILTIN }", "Line 1, col 6: expected a letter"], // A chip name is expected
  ["CHIP Not BUILTIN }", 'Line 1, col 9: expected "{"'],
  ["CHIP Not { BUILTIN }", 'Line 1, col 20: expected ";" or a letter'],
  ["CHIP Not { BONKERS; }", 'Line 1, col 12: expected "PARTS:" or "BUILTIN"'],
  ["CHIP Not { ", 'Line 1, col 12: expected "PARTS:" or "BUILTIN"'],
  [
    "CHIP Not { PARTS: (); }",
    'Line 1, col 19: expected "}", "CLOCKED", "BUILTIN", or a letter', // A chip name is expected
  ],
  ["CHIP Not { PARTS: Nand; }", 'Line 1, col 23: expected "("'],
  ["CHIP Not { PARTS: Nand() }", "Line 1, col 24: expected a pin name"],
  ["CHIP Not { PARTS: Nand(=a) }", "Line 1, col 24: expected a pin name"],
  [
    "CHIP Not { PARTS: Nand(a=) }",
    'Line 1, col 26: expected "false", "true", or a pin name',
  ],
  ["CHIP Not { PARTS: Nand(a) }", 'Line 1, col 25: expected "="'],
  ["CHIP Not { PARTS: Nand(a=a }", 'Line 1, col 28: expected ")", ",", or "["'],
  ["CHIP Not { IN a,; BUILTIN; }", "Line 1, col 17: expected a pin name"],
  ["CHIP Not { OUT out,; BUILTIN; }", "Line 1, col 20: expected a pin name"],
  [
    "CHIP Not { IN in; PARTS: CLOCKED in,; }",
    "Line 1, col 37: expected a pin name",
  ],
  ["CHIP Not { IN CHIP; BUILTIN; }", "Line 1, col 15: expected a pin name"],
];

describe("HDL w/ Ohm", () => {
  describe("parts", () => {
    it("parses part wires", () => {
      const wire = grammar.match("a[2..4]=b[10..12]", "Wire");
      expect(wire).toHaveSucceeded();
      expect<PinDeclaration>(hdlSemantics(wire).Wire).toEqual({
        lhs: {
          pin: "a",
          start: 2,
          end: 4,
          span: { start: 0, end: 7, line: 1 },
        },
        rhs: {
          pin: "b",
          start: 10,
          end: 12,
          span: { start: 8, end: 17, line: 1 },
        },
      });
    });

    it("parses parts", () => {
      const wide = grammar.match("Nand(a=a, b=b, out=out);", "Part");
      expect(wide).toHaveSucceeded();
      expect<Part>(hdlSemantics(wide).Part).toEqual({
        name: "Nand",
        span: { start: 0, end: 24, line: 1 },
        wires: [
          {
            lhs: {
              pin: "a",
              start: undefined,
              end: undefined,
              span: { start: 5, end: 6, line: 1 },
            },
            rhs: {
              pin: "a",
              start: undefined,
              end: undefined,
              span: { start: 7, end: 8, line: 1 },
            },
          },
          {
            lhs: {
              pin: "b",
              start: undefined,
              end: undefined,
              span: { start: 10, end: 11, line: 1 },
            },
            rhs: {
              pin: "b",
              start: undefined,
              end: undefined,
              span: { start: 12, end: 13, line: 1 },
            },
          },
          {
            lhs: {
              pin: "out",
              start: undefined,
              end: undefined,
              span: { start: 15, end: 18, line: 1 },
            },
            rhs: {
              pin: "out",
              start: undefined,
              end: undefined,
              span: { start: 19, end: 22, line: 1 },
            },
          },
        ],
      });
    });

    it("parses trailing commas", () => {
      const parse1 = grammar.match(`a=a, b=b,`, "Wires");
      expect(parse1).toHaveSucceeded();
      const parse2 = grammar.match(`Foo(a=a, b=b,);`, "Part");
      expect(parse2).toHaveSucceeded();
    });

    it("parses complex parts", () => {
      const not8 = grammar.match(
        `Not(in[0..1] = true,
        in[3..5] = six,
        in[7] = true,
        out[3..7] = out1,
        address=address[0..13],
        out[2..3]=address[5..6]);`,
        "Part",
      );
      expect(not8).toHaveSucceeded();
      expect<Part>(hdlSemantics(not8).Part).toEqual({
        name: "Not",
        span: { start: 0, end: 158, line: 1 },
        wires: [
          {
            lhs: {
              pin: "in",
              start: 0,
              end: 1,
              span: { start: 4, end: 12, line: 1 },
            },
            rhs: {
              pin: "true",
              start: undefined,
              end: undefined,
              span: { start: 15, end: 19, line: 1 },
            },
          },
          {
            lhs: {
              pin: "in",
              start: 3,
              end: 5,
              span: { start: 29, end: 37, line: 2 },
            },
            rhs: {
              pin: "six",
              start: undefined,
              end: undefined,
              span: { start: 40, end: 43, line: 2 },
            },
          },
          {
            lhs: {
              pin: "in",
              start: 7,
              end: 7,
              span: { start: 53, end: 58, line: 3 },
            },
            rhs: {
              pin: "true",
              start: undefined,
              end: undefined,
              span: { start: 61, end: 65, line: 3 },
            },
          },
          {
            lhs: {
              pin: "out",
              start: 3,
              end: 7,
              span: { start: 75, end: 84, line: 4 },
            },
            rhs: {
              pin: "out1",
              start: undefined,
              end: undefined,
              span: { start: 87, end: 91, line: 4 },
            },
          },
          {
            lhs: {
              pin: "address",
              start: undefined,
              end: undefined,
              span: { start: 101, end: 108, line: 5 },
            },
            rhs: {
              pin: "address",
              start: 0,
              end: 13,
              span: { start: 109, end: 123, line: 5 },
            },
          },
          {
            lhs: {
              pin: "out",
              start: 2,
              end: 3,
              span: { start: 133, end: 142, line: 6 },
            },
            rhs: {
              pin: "address",
              start: 5,
              end: 6,
              span: { start: 143, end: 156, line: 6 },
            },
          },
        ],
      });
    });
  });

  describe("pins", () => {
    it("parses a simple decl", () => {
      const decl = grammar.match("a", "PinDecl");
      expect(decl).toHaveSucceeded();
      expect(hdlSemantics(decl).PinDecl).toEqual({
        pin: "a",
        width: 1,
        span: { start: 0, end: 1, line: 1 },
      });
    });

    it("parses a name that starts with a keyword", () => {
      const decl = grammar.match("INPUT", "PinDecl");
      expect(decl).toHaveSucceeded();
      expect(hdlSemantics(decl).PinDecl).toMatchObject({ pin: "INPUT" });
    });

    it("parses a wide decl", () => {
      const decl = grammar.match("a[3]", "PinDecl");
      expect(decl).toHaveSucceeded();
      expect(hdlSemantics(decl).PinDecl).toEqual({
        pin: "a",
        width: 3,
        span: { start: 0, end: 4, line: 1 },
      });
    });
  });

  describe("entire chips", () => {
    it("parses basic chip", () => {
      const match = grammar.match(AND_BUILTIN);
      expect(match).toHaveSucceeded();
      expect<HdlParse>(hdlSemantics(match).Chip).toEqual({
        name: { value: "And", span: { start: 5, end: 8, line: 1 } },
        ins: [
          { pin: "a", width: 1, span: { start: 18, end: 19, line: 2 } },
          { pin: "b", width: 1, span: { start: 21, end: 22, line: 2 } },
        ],
        outs: [{ pin: "out", width: 1, span: { start: 32, end: 35, line: 3 } }],
        parts: "BUILTIN",
      });
    });

    it("parses chip with parts", () => {
      const match = grammar.match(NOT_PARTS);
      expect(match).toHaveSucceeded();
      expect<HdlParse>(hdlSemantics(match).Chip).toEqual({
        name: { value: "Not", span: { start: 5, end: 8, line: 1 } },
        ins: [{ pin: "in", width: 1, span: { start: 18, end: 20, line: 2 } }],
        outs: [{ pin: "out", width: 1, span: { start: 30, end: 33, line: 3 } }],
        parts: [
          {
            name: "Nand",
            span: { start: 50, end: 76, line: 5 },
            wires: [
              {
                lhs: { pin: "a", span: { start: 55, end: 56, line: 5 } },
                rhs: { pin: "in", span: { start: 57, end: 59, line: 5 } },
              },
              {
                lhs: { pin: "b", span: { start: 61, end: 62, line: 5 } },
                rhs: { pin: "in", span: { start: 63, end: 65, line: 5 } },
              },
              {
                lhs: { pin: "out", span: { start: 67, end: 70, line: 5 } },
                rhs: { pin: "out", span: { start: 71, end: 74, line: 5 } },
              },
            ],
          },
        ],
      });
    });

    it("parses chip without parts", () => {
      const match = grammar.match(NOT_NO_PARTS);
      expect(match).toHaveSucceeded();

      expect<HdlParse>(hdlSemantics(match).Chip).toEqual({
        name: { value: "Not", span: { start: 5, end: 8, line: 1 } },
        ins: [{ pin: "in", width: 1, span: { start: 18, end: 20, line: 2 } }],
        outs: [{ pin: "out", width: 1, span: { start: 30, end: 33, line: 3 } }],
        parts: [],
      });
    });

    it("parses chip using builtins", () => {
      const match = grammar.match(AND_16_BUILTIN);
      expect(match).toHaveSucceeded();
      expect<HdlParse>(hdlSemantics(match).Chip).toEqual({
        name: { value: "And16", span: { start: 5, end: 10, line: 1 } },
        ins: [
          { pin: "a", width: 16, span: { start: 18, end: 23, line: 2 } },
          { pin: "b", width: 16, span: { start: 25, end: 30, line: 2 } },
        ],
        outs: [
          { pin: "out", width: 16, span: { start: 38, end: 45, line: 3 } },
        ],
        parts: "BUILTIN",
      });
    });

    it("parses chip using a named builtin", () => {
      const match = grammar.match(AND_BUILTIN_NAMED);
      expect(match).toHaveSucceeded();
      expect<HdlParse>(hdlSemantics(match).Chip.parts).toBe("BUILTIN");
    });

    it("parses chip with builtin inside PARTS", () => {
      const match = grammar.match(AND_BUILTIN_IN_PARTS);
      expect(match).toHaveSucceeded();
      expect<HdlParse>(hdlSemantics(match).Chip.parts).toBe("BUILTIN");
    });

    it("parses a chip with clocked pins", () => {
      const match = grammar.match(CLOCKED);
      expect(match).toHaveSucceeded();
      expect<HdlParse>(hdlSemantics(match).Chip).toEqual({
        name: { value: "Foo", span: { start: 5, end: 8, line: 1 } },
        ins: [{ pin: "in", width: 1, span: { start: 18, end: 20, line: 2 } }],
        outs: [],
        parts: [],
        clocked: ["in"],
      });
    });
  });

  describe("errors", () => {
    it.each(ERRORS)("fails with reasonable errors", (source, message) => {
      expect(grammar.match(source)).toHaveFailed(message);
    });
  });
});
