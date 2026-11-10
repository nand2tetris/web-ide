import { Not } from "@nand2tetris/simulator/chip/builtins/index.js";
import { Clock } from "@nand2tetris/simulator/chip/clock.js";
import { describe, expect, it, vi } from "vitest";
import { builtinChipPins, hdlLanguage, jackLanguage } from "./service";

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
  it("releases repeated builtin pin probes while an existing chip remains clocked", () => {
    const existing = new Not();
    const existingEval = vi.spyOn(existing, "eval");
    const subscribe = Clock.subscribe;
    const callbacks: ReturnType<typeof vi.fn>[] = [];
    const subscriptions = vi
      .spyOn(Clock, "subscribe")
      .mockImplementation((observer) => {
        const counted = vi.fn(observer);
        callbacks.push(counted);
        return subscribe(counted);
      });
    try {
      for (let i = 0; i < 3; i++) {
        expect(builtinChipPins("RAM16K")).toEqual([
          "in",
          "load",
          "address",
          "out",
        ]);
      }
      expect(callbacks).toHaveLength(3);
      callbacks.forEach((callback) => callback.mockClear());
      Clock.get().toggle();
      expect(existingEval).toHaveBeenCalledOnce();
      expect(existing.clockSubscription?.closed).toBe(false);
      expect(
        callbacks.every((callback) => callback.mock.calls.length === 0),
      ).toBe(true);
      expect(
        subscriptions.mock.results.every((result) => result.value.closed),
      ).toBe(true);
    } finally {
      subscriptions.mock.results.forEach((result) =>
        result.value.unsubscribe(),
      );
      subscriptions.mockRestore();
      existingEval.mockRestore();
      existing.remove();
    }
  });

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

  it("resolves declared OS types and their typed calls, but rejects unknown types", () => {
    const text =
      "class Main { field Array a; field String s; method void f() { do a.dispose(); do s.appendChar(65); return; } }";
    expect(codes(text, jackLanguage())).toEqual([]);
    expect(
      codes(text.replace("a.dispose", "a.missing"), jackLanguage()),
    ).toContainEqual(["ref.undefinedMember", "missing"]);
    expect(
      codes(text.replace("field Array", "field Missing"), jackLanguage()),
    ).toContainEqual(["ref.undefined", "Missing"]);
  });

  it("reports an undefined variable", () => {
    expect(codes(MAIN.replace("return x", "return y"), jackLanguage())).toEqual(
      [["ref.undefined", "y"]],
    );
  });
});
