import { describe, expect, it } from "vitest";
import { hdlLanguage, jackLanguage } from "./service";

const codes = (text: string, language = hdlLanguage()) =>
  language
    .analyze(text)
    .diagnostics.map((d) => [d.code, text.slice(d.span.start, d.span.end)]);

const AND = `CHIP And {
  IN a, b;
  OUT out;
  PARTS:
  Nand(a=a, b=b, out=x);
  Not(in=x, out=out);
}`;

describe("hdl language service", () => {
  it("resolves builtin chips and their pins", () => {
    expect(codes(AND)).toEqual([]);
  });

  it("reports an unknown chip and an unknown pin of a builtin", () => {
    expect(codes(AND.replace("Not(", "Nott("))).toEqual([
      ["ref.undefined", "Nott"],
    ]);
    expect(codes(AND.replace("in=x", "inn=x"))).toEqual([
      ["ref.undefinedMember", "inn"],
    ]);
  });

  it("reports a duplicate pin", () => {
    expect(codes(AND.replace("IN a, b", "IN a, a"))).toContainEqual([
      "def.duplicate",
      "a",
    ]);
  });

  it("finds the definition of an internal pin", () => {
    const service = hdlLanguage().service();
    service.open("file:///And.hdl", 1, AND);
    const use = AND.lastIndexOf("x");
    const [definition] = service.definition(
      "file:///And.hdl",
      use as unknown as Parameters<typeof service.definition>[1],
    );
    expect(definition?.name).toBe("x");
    expect(definition?.nameSpan.start).toBe(AND.indexOf("x"));
  });
});

describe("jack language service", () => {
  const MAIN = `class Main {
  field int x;
  method int get() { return x; }
  function void main() {
    var Main m;
    do Output.printInt(1);
    return;
  }
}`;

  it("resolves fields, locals and OS classes", () => {
    expect(codes(MAIN, jackLanguage())).toEqual([]);
  });

  it("reports an undefined variable", () => {
    expect(codes(MAIN.replace("return x", "return y"), jackLanguage())).toEqual(
      [["ref.undefined", "y"]],
    );
  });
});
