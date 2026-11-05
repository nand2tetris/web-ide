import { describe, expect, it } from "vitest";
import { hdlCandidates, hdlSlot } from "./hdlCompletion";

const HEAD = "CHIP And {\n  IN a, b;\n  OUT out;\n\n  PARTS:\n";

describe("hdlSlot", () => {
  it("expects nothing where names are declared", () => {
    expect(hdlSlot("CHIP ")).toEqual({ slot: "none" });
    expect(hdlSlot("CHIP And {\n  IN a, ")).toEqual({ slot: "none" });
  });

  it("expects a chip where a part may start", () => {
    expect(hdlSlot(HEAD)).toEqual({ slot: "chip" });
    expect(hdlSlot(`${HEAD}  Na`)).toEqual({ slot: "chip" });
    expect(hdlSlot(`${HEAD}  Nand(a=a, b=b, out=x);\n  `)).toEqual({
      slot: "chip",
    });
    expect(hdlSlot(`${HEAD}  // Nand(a=`)).toEqual({ slot: "chip" });
  });

  it("expects a pin of the part's chip left of an equals sign", () => {
    expect(hdlSlot(`${HEAD}  Nand(`)).toEqual({
      slot: "part-pin",
      chip: "Nand",
    });
    expect(hdlSlot(`${HEAD}  Nand(a=a, b`)).toEqual({
      slot: "part-pin",
      chip: "Nand",
    });
  });

  it("expects a pin of this chip right of an equals sign", () => {
    expect(hdlSlot(`${HEAD}  Nand(a= `)).toEqual({ slot: "pin" });
    expect(hdlSlot(`${HEAD}  Nand(a=a, b=`)).toEqual({ slot: "pin" });
    expect(hdlSlot(`${HEAD}  Nand(a=a, b=b);\n  Not(in=`)).toEqual({
      slot: "pin",
    });
  });

  it("expects a pin in a clocked list and nothing after a finished part name", () => {
    expect(hdlSlot(`${HEAD}  Nand(a=a);\n  CLOCKED `)).toEqual({
      slot: "pin",
    });
    expect(hdlSlot(`${HEAD}  Nand `)).toEqual({ slot: "none" });
  });
});

describe("hdlCandidates", () => {
  const scope = { symbols: [], children: [], span: { start: 0, end: 0 } };
  const def = (name: string, kind: string, uri = "file:///01/And.hdl") =>
    ({ name, kind, uri, scope }) as never;
  const sources = {
    definitions: [
      def("a", "pin"),
      def("x", "pin"),
      def("And", "chip"),
      def("Or", "chip", "file:///01/Or.hdl"),
      def("Mine", "chip", "file:///01/Mine.hdl"),
    ],
    uri: "file:///01/And.hdl",
    builtinChips: ["Nand", "Or"],
    builtinPins: (chip: string) =>
      chip === "Nand" ? ["a", "b", "out"] : undefined,
  };
  const labels = (slot: Parameters<typeof hdlCandidates>[0]) =>
    hdlCandidates(slot, sources).map((c) => c.label);

  it("offers only custom chips, other than this one, where a part starts", () => {
    expect(labels({ slot: "chip" })).toEqual(["Mine"]);
  });

  it("offers only the part's pins on the left of a wire", () => {
    expect(labels({ slot: "part-pin", chip: "Nand" })).toEqual([
      "a",
      "b",
      "out",
    ]);
    expect(labels({ slot: "part-pin", chip: "Zzz" })).toEqual([]);
  });

  it("offers this chip's pins and the constants on the right of a wire", () => {
    expect(labels({ slot: "pin" })).toEqual(["a", "x", "true", "false"]);
  });

  it("offers nothing where a name is declared", () => {
    expect(labels({ slot: "none" })).toEqual([]);
  });
});
