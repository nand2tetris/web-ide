import { Ok } from "@davidsouther/jiffies/result.js";
import { describe, expect, it } from "@davidsouther/jiffies/scope/index.js";
import { HdlParser, Part, PinParts, TEST_ONLY } from "./hdl.js";
import { IResult } from "./parser/base.js";
import { tag } from "./parser/bytes.js";
import { list } from "./parser/recipe.js";

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

describe("hdl language", () => {
  it("parses comments", () => {
    let parsed: IResult<string>;
    parsed = TEST_ONLY.hdlIdentifier("a // comment");
    expect(parsed).toEqual(Ok(["", "a"]));

    parsed = TEST_ONLY.hdlIdentifier(`/* multi
    line */ a // more`);
    expect(parsed).toEqual(Ok(["", "a"]));
  });

  it("parses pin wiring", () => {
    let parsed: IResult<[string, PinParts]>;

    parsed = TEST_ONLY.wire("a=a");
    expect(parsed).toEqual(Ok(["", ["a", { pin: "a" }]]));

    parsed = TEST_ONLY.wire("b = /* to */ a // things");
    expect(parsed).toEqual(Ok(["", ["b", { pin: "a" }]]));
  });

  it("parses a list of pins", () => {
    let parsed: IResult<[string, PinParts][]>;
    let parser = list(TEST_ONLY.wire, tag(","));

    parsed = parser("a=a , b=b");
    expect(parsed).toEqual(
      Ok([
        "",
        [
          ["a", { pin: "a" }],
          ["b", { pin: "b" }],
        ],
      ])
    );
  });

  it("Parses a part", () => {
    let parsed: IResult<Part>;

    parsed = TEST_ONLY.part("Nand(a=a, b=b, out=out)");
    expect(parsed).toEqual(
      Ok([
        "",
        {
          name: "Nand",
          wires: [
            { lhs: "a", rhs: { pin: "a" } },
            { lhs: "b", rhs: { pin: "b" } },
            { lhs: "out", rhs: { pin: "out" } },
          ],
        },
      ])
    );
  });

  it("parses a list of parts", () => {
    let parsed: IResult<"BUILTIN" | Part[]>;

    parsed = TEST_ONLY.parts(`PARTS: Not(a=a, o=o); And(b=b, c=c, i=i);`);
    expect(parsed).toEqual(
      Ok([
        "",
        [
          {
            name: "Not",
            wires: [
              { lhs: "a", rhs: { pin: "a" } },
              { lhs: "o", rhs: { pin: "o" } },
            ],
          },
          {
            name: "And",
            wires: [
              { lhs: "b", rhs: { pin: "b" } },
              { lhs: "c", rhs: { pin: "c" } },
              { lhs: "i", rhs: { pin: "i" } },
            ],
          },
        ],
      ])
    );

    parsed = TEST_ONLY.parts(`BUILTIN;`);
    expect(parsed).toEqual(Ok(["", "BUILTIN"]));
  });

  it("parses IN list", () => {
    let parsed: IResult<PinParts[]>;

    parsed = TEST_ONLY.inList(`IN a, b;`);
    expect(parsed).toEqual(Ok(["", [{ pin: "a" }, { pin: "b" }]]));
  });

  it("parses OUT list", () => {
    let parsed: IResult<PinParts[]>;

    parsed = TEST_ONLY.outList(`OUT out;`);
    expect(parsed).toEqual(Ok(["", [{ pin: "out" }]]));
  });

  it("parses a file into a builtin", () => {
    const parsed = HdlParser(AND_BUILTIN);

    expect(parsed).toEqual(
      Ok([
        "",
        {
          name: "And",
          ins: [{ pin: "a" }, { pin: "b" }],
          outs: [{ pin: "out" }],
          parts: "BUILTIN",
        },
      ])
    );
  });

  it("parses a file with parts", () => {
    const parsed = HdlParser(NOT_PARTS);
    expect(parsed).toEqual(
      Ok([
        "",
        {
          name: "Not",
          ins: [{ pin: "in" }],
          outs: [{ pin: "out" }],
          parts: [
            {
              name: "Nand",
              wires: [
                { lhs: "a", rhs: { pin: "in" } },
                { lhs: "b", rhs: { pin: "in" } },
                { lhs: "out", rhs: { pin: "out" } },
              ],
            },
          ],
        },
      ])
    );
  });
});
