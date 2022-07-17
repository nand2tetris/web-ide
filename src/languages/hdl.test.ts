import { assert } from "@davidsouther/jiffies/lib/esm/assert";
import { isErr, Ok } from "@davidsouther/jiffies/lib/esm/result";
import { Token } from "./base";
import { HdlParser, Part, PinDeclaration, PinParts, TEST_ONLY } from "./hdl";
import { IResult, Span } from "./parser/base";
import { tag } from "./parser/bytes";
import { list } from "./parser/recipe";

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

describe("hdl language", () => {
  it("parses comments", () => {
    let parsed: IResult<Token>;
    parsed = TEST_ONLY.hdlIdentifier("a // comment");
    expect(Ok(parsed)).toMatchObject(["", { value: "a" }]);

    parsed = TEST_ONLY.hdlIdentifier(`/* multi
    line */ a // more`);
    expect(Ok(parsed)).toMatchObject(["", { value: "a" }]);
  });

  it("parses identifiers", () => {
    let parsed: IResult<Token>;
    parsed = TEST_ONLY.hdlIdentifier("inM");
    expect(Ok(parsed)).toMatchObject(["", { value: "inM" }]);

    parsed = TEST_ONLY.hdlIdentifier("a_b");
    expect(Ok(parsed)).toMatchObject(["", { value: "a_b" }]);
  });

  it("parses in/out lists", () => {
    let parsed: IResult<PinDeclaration[]>;

    parsed = TEST_ONLY.pinList("inM");
    expect(Ok(parsed)).toMatchObject([
      "",
      [{ pin: { value: "inM" }, width: 1 }],
    ]);
  });

  it("parses pin wiring", () => {
    let parsed: IResult<[PinParts, PinParts]>;

    parsed = TEST_ONLY.wire("a=a");
    expect(Ok(parsed)).toMatchObject([
      "",
      [{ pin: { value: "a" } }, { pin: { value: "a" } }],
    ]);

    parsed = TEST_ONLY.wire("b = /* to */ a // things");
    expect(Ok(parsed)).toMatchObject([
      "",
      [{ pin: { value: "b" } }, { pin: { value: "a" } }],
    ]);

    // parsed = TEST_ONLY.wire("b = 0");
    // expect(parsed).toMatchObject(Ok(["", [{ pin: "b", start: 0, end: 0 }, {pin: "0", start: 0, end: 0}]]));

    parsed = TEST_ONLY.wire("b = False");
    expect(Ok(parsed)).toMatchObject([
      "",
      [{ pin: { value: "b" } }, { pin: { value: "False" } }],
    ]);

    parsed = TEST_ONLY.wire("b = True");
    expect(Ok(parsed)).toMatchObject([
      "",
      [{ pin: { value: "b" } }, { pin: { value: "True" } }],
    ]);

    // parsed = TEST_ONLY.wire("b = Foo");
    // expect(isErr(parsed)).toBe(true);
  });

  it("parses a list of pins", () => {
    let parsed: IResult<[PinParts, PinParts][]>;
    let parser = list(TEST_ONLY.wire, tag(","));

    parsed = parser("a=a , b=b");
    expect(Ok(parsed)).toMatchObject([
      "",
      [
        [{ pin: { value: "a" } }, { pin: { value: "a" } }],
        [{ pin: { value: "b" } }, { pin: { value: "b" } }],
      ],
    ]);
  });

  it("parses bus pins", () => {
    let parsed: IResult<[PinParts, PinParts]>;
    let parser = TEST_ONLY.wire;

    parsed = parser("a[2..4]=b");
    expect(Ok(parsed)).toMatchObject([
      "",
      [{ pin: { value: "a" }, start: 2, end: 4 }, { pin: { value: "b" } }],
    ]);

    parsed = parser("a=b[0]");
    expect(Ok(parsed)).toMatchObject([
      "",
      [
        { pin: { value: "a" }, start: undefined, end: undefined },
        { pin: { value: "b" }, start: 0, end: 0 },
      ],
    ]);

    parsed = parser("a=b[2]");
    expect(Ok(parsed)).toMatchObject([
      "",
      [{ pin: { value: "a" } }, { pin: { value: "b" }, start: 2, end: 2 }],
    ]);

    parsed = parser("a[2..4]=b[10..12]");
    expect(Ok(parsed)).toMatchObject([
      "",
      [
        { pin: { value: "a" }, start: 2, end: 4 },
        { pin: { value: "b" }, start: 10, end: 12 },
      ],
    ]);
  });

  it("parses a part", () => {
    let parsed: IResult<Part>;

    parsed = TEST_ONLY.part("Nand(a=a, b=b, out=out)");
    expect(Ok(parsed)).toMatchObject([
      "",
      {
        name: { value: "Nand" },
        wires: [
          {
            lhs: { pin: { value: "a" } },
            rhs: { pin: { value: "a" } },
          },
          {
            lhs: { pin: { value: "b" } },
            rhs: { pin: { value: "b" } },
          },
          {
            lhs: { pin: { value: "out" } },
            rhs: { pin: { value: "out" } },
          },
        ],
      },
    ]);
  });

  it("parses a list of parts", () => {
    let parsed: IResult<"BUILTIN" | Part[]>;

    parsed = TEST_ONLY.parts(`PARTS: Not(a=a, o=o); And(b=b, c=c, i=i);`);
    expect(Ok(parsed)).toMatchObject([
      "",
      [
        {
          name: { value: "Not" },
          wires: [
            {
              lhs: { pin: { value: "a" } },
              rhs: { pin: { value: "a" } },
            },
            {
              lhs: { pin: { value: "o" } },
              rhs: { pin: { value: "o" } },
            },
          ],
        },
        {
          name: { value: "And" },
          wires: [
            {
              lhs: { pin: { value: "b" } },
              rhs: { pin: { value: "b" } },
            },
            {
              lhs: { pin: { value: "c" } },
              rhs: { pin: { value: "c" } },
            },
            {
              lhs: { pin: { value: "i" } },
              rhs: { pin: { value: "i" } },
            },
          ],
        },
      ],
    ]);

    parsed = TEST_ONLY.parts(`BUILTIN;`);
    // expect(Ok(parsed)).toMatchObject(["", { value: "BUILTIN" }]);
    expect(Ok(parsed)).toMatchObject(["", "BUILTIN"]);
  });

  it("parses IN list", () => {
    let parsed: IResult<PinDeclaration[]>;

    parsed = TEST_ONLY.inList(`IN a, b;`);
    expect(Ok(parsed)).toMatchObject([
      "",
      [
        { pin: { value: "a" }, width: 1 },
        { pin: { value: "b" }, width: 1 },
      ],
    ]);
  });

  it("parses OUT list", () => {
    let parsed: IResult<PinDeclaration[]>;

    parsed = TEST_ONLY.outList(`OUT out;`);
    expect(Ok(parsed)).toMatchObject([
      "",
      [{ pin: { value: "out" }, width: 1 }],
    ]);
  });

  it("parses a file into a builtin", () => {
    const parsed = HdlParser(new Span(AND_BUILTIN));

    expect(Ok(parsed)).toMatchObject([
      "",
      {
        name: { value: "And" },
        ins: [
          { pin: { value: "a" }, width: 1 },
          { pin: { value: "b" }, width: 1 },
        ],
        outs: [{ pin: { value: "out" }, width: 1 }],
        parts: "BUILTIN",
      },
    ]);
  });

  it("parses a file with parts", () => {
    const parsed = HdlParser(new Span(NOT_PARTS));
    expect(Ok(parsed)).toMatchObject([
      "",
      {
        name: { value: "Not" },
        ins: [{ pin: { value: "in" }, width: 1 }],
        outs: [{ pin: { value: "out" }, width: 1 }],
        parts: [
          {
            name: { value: "Nand" },
            wires: [
              {
                lhs: { pin: { value: "a" } },
                rhs: { pin: { value: "in" } },
              },
              {
                lhs: { pin: { value: "b" } },
                rhs: { pin: { value: "in" } },
              },
              {
                lhs: { pin: { value: "out" } },
                rhs: { pin: { value: "out" } },
              },
            ],
          },
        ],
      },
    ]);
  });

  it("parses a file without parts", () => {
    const parsed = HdlParser(new Span(NOT_NO_PARTS));
    expect(Ok(parsed)).toMatchObject([
      "",
      {
        name: { value: "Not" },
        ins: [{ pin: { value: "in" }, width: 1 }],
        outs: [{ pin: { value: "out" }, width: 1 }],
        parts: [],
      },
    ]);
  });

  it("Parses a file with 16-bit pins", () => {
    const parsed = HdlParser(new Span(AND_16_BUILTIN));

    expect(Ok(parsed)).toMatchObject([
      "",
      {
        name: { value: "And16" },
        ins: [
          { pin: { value: "a" }, width: 16 },
          { pin: { value: "b" }, width: 16 },
        ],
        outs: [{ pin: { value: "out" }, width: 16 }],
        parts: "BUILTIN",
      },
    ]);
  });

  describe("errors", () => {
    it("handles errors", () => {
      const parsed = HdlParser(new Span(`Chip And PARTS:`));
      assert(isErr(parsed));
    });
  });
});
