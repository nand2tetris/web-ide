import { HdlParse, Part, PinDeclaration } from "./hdl";
import { grammar, hdlSemantics } from "./hdl-ohm";

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

const ERRORS = [
  ["Not { BUILTIN }", 'Line 1, col 1: expected "CHIP"'],
  ["CHIP { BUILTIN }", "Line 1, col 6: expected a letter"], // A chip name is expected
  ["CHIP Not BUILTIN }", 'Line 1, col 10: expected "{"'],
  ["CHIP Not { BUILTIN }", 'Line 1, col 20: expected ";"'],
  ["CHIP Not { BONKERS; }", 'Line 1, col 12: expected "}"'],
  ["CHIP Not { ", 'Line 1, col 12: expected "}"'],
  ["CHIP Not { PARTS: }", ""],
  ["CHIP Not { PARTS: (); }", 'Line 1, col 19: expected "}" or a letter'],
  ["CHIP Not { PARTS: Nand; }", 'Line 1, col 23: expected "("'],
  ["CHIP Not { PARTS: Nand() }", "Line 1, col 24: expected a letter"], // A pin name is expected
  ["CHIP Not { PARTS: Nand(=a) }", "Line 1, col 24: expected a letter"], // A pin name is expected
  [
    "CHIP Not { PARTS: Nand(a=) }",
    'Line 1, col 26: expected "false", "False", "true", "True", or a letter',
  ], // A pin name is expected
  ["CHIP Not { PARTS: Nand(a) }", 'Line 1, col 25: expected "="'],
  ["CHIP Not { PARTS: Nand(a=a }", 'Line 1, col 28: expected ")", ",", or "["'],
];

describe("HDL w/ Ohm", () => {
  describe("parts", () => {
    it("parses part wires", () => {
      const wire = grammar.match("a[2..4]=b[10..12]", "Wire");
      expect(wire).toHaveSucceeded();
      expect<PinDeclaration>(hdlSemantics(wire).Wire).toEqual({
        lhs: { pin: "a", start: 2, end: 4 },
        rhs: { pin: "b", start: 10, end: 12 },
      });
    });

    it("parses parts", () => {
      const wide = grammar.match("Nand(a=a, b=b, out=out);", "Part");
      expect(wide).toHaveSucceeded();
      expect<Part>(hdlSemantics(wide).Part).toEqual({
        name: "Nand",
        wires: [
          {
            lhs: { pin: "a", start: undefined, end: undefined },
            rhs: { pin: "a", start: undefined, end: undefined },
          },
          {
            lhs: { pin: "b", start: undefined, end: undefined },
            rhs: { pin: "b", start: undefined, end: undefined },
          },
          {
            lhs: { pin: "out", start: undefined, end: undefined },
            rhs: { pin: "out", start: undefined, end: undefined },
          },
        ],
      });
    });

    it("parses complex parts", () => {
      const not8 = grammar.match(
        `Not(in[0..1] = true,
        in[3..5] = six,
        in[7] = true,
        out[3..7] = out1,
        address=address[0..13],
        out[2..3]=address[5..6]);`,
        "Part"
      );
      expect(not8).toHaveSucceeded();
      expect<Part>(hdlSemantics(not8).Part).toEqual({
        name: "Not",
        wires: [
          {
            lhs: { pin: "in", start: 0, end: 1 },
            rhs: { pin: "true", start: undefined, end: undefined },
          },
          {
            lhs: { pin: "in", start: 3, end: 5 },
            rhs: { pin: "six", start: undefined, end: undefined },
          },
          {
            lhs: { pin: "in", start: 7, end: 7 },
            rhs: { pin: "true", start: undefined, end: undefined },
          },
          {
            lhs: { pin: "out", start: 3, end: 7 },
            rhs: { pin: "out1", start: undefined, end: undefined },
          },
          {
            lhs: { pin: "address", start: undefined, end: undefined },
            rhs: { pin: "address", start: 0, end: 13 },
          },
          {
            lhs: { pin: "out", start: 2, end: 3 },
            rhs: { pin: "address", start: 5, end: 6 },
          },
        ],
      });
    });
  });

  describe("pins", () => {
    it("parses a simple decl", () => {
      const decl = grammar.match("a", "PinDecl");
      expect(decl).toHaveSucceeded();
      expect(hdlSemantics(decl).PinDecl).toEqual({ pin: "a", width: 1 });
    });

    it("parses a wide decl", () => {
      const decl = grammar.match("a[3]", "PinDecl");
      expect(decl).toHaveSucceeded();
      expect(hdlSemantics(decl).PinDecl).toEqual({ pin: "a", width: 3 });
    });
  });

  describe("entire chips", () => {
    it("parses basic chip", () => {
      const match = grammar.match(AND_BUILTIN);
      expect(match).toHaveSucceeded();
      expect<HdlParse>(hdlSemantics(match).Chip).toEqual({
        name: "And",
        ins: [
          { pin: "a", width: 1 },
          { pin: "b", width: 1 },
        ],
        outs: [{ pin: "out", width: 1 }],
        parts: "BUILTIN",
      });
    });

    it("parses chip with parts", () => {
      const match = grammar.match(NOT_PARTS);
      expect(match).toHaveSucceeded();
      expect<HdlParse>(hdlSemantics(match).Chip).toEqual({
        name: "Not",
        ins: [{ pin: "in", width: 1 }],
        outs: [{ pin: "out", width: 1 }],
        parts: [
          {
            name: "Nand",
            wires: [
              {
                lhs: { pin: "a" },
                rhs: { pin: "in" },
              },
              {
                lhs: { pin: "b" },
                rhs: { pin: "in" },
              },
              {
                lhs: { pin: "out" },
                rhs: { pin: "out" },
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
        name: "Not",
        ins: [{ pin: "in", width: 1 }],
        outs: [{ pin: "out", width: 1 }],
        parts: [],
      });
    });

    it("parses chip using builtins", () => {
      const match = grammar.match(AND_16_BUILTIN);
      expect(match).toHaveSucceeded();
      expect<HdlParse>(hdlSemantics(match).Chip).toEqual({
        name: "And16",
        ins: [
          { pin: "a", width: 16 },
          { pin: "b", width: 16 },
        ],
        outs: [{ pin: "out", width: 16 }],
        parts: "BUILTIN",
      });
    });
  });

  describe("errors", () => {
    it.each(ERRORS)("fails with reasonable errors", (source, message) => {
      expect(grammar.match(source)).toHaveFailed(message);
    });
  });
});
