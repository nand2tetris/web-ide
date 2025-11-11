import { cleanState } from "@davidsouther/jiffies/lib/esm/scope/state.js";
import { Output } from "./output.js";
import { TestOutputInstruction } from "./test/instruction.js";
import { Test } from "./test/tst.js";

class OutputTest extends Test {
  private readonly vars: Map<string, number | string>;

  constructor(init: [string, number | string][]) {
    super();
    this.vars = new Map(init);
  }

  hasVar(variable: string | number): boolean {
    return this.vars.has(`${variable}`);
  }
  getVar(variable: string | number): number | string {
    return this.vars.get(`${variable}`) ?? 0;
  }
  getWidth(variable: string, offset?: number | undefined): number {
    return 1;
  }
  setVar(variable: string, value: number): void {
    this.vars.set(`${variable}`, value);
  }
}

describe("Test Output Handler", () => {
  const state = cleanState(
    () => ({
      test: new OutputTest([
        ["time", "14+"],
        ["a", 1],
        ["b", 20],
        ["in", 0],
        ["out", -1],
        ["address", 1234],
      ]),
    }),
    beforeEach,
  );

  it("outputs padded values", () => {
    const outA = new Output("a", "D", 1, 3, 3);
    const a = outA.print(state.test);

    expect(a).toEqual("   1   ");
  });

  it("outputs 16 bit values", () => {
    const outB = new Output("b", "B", 16, 1, 1);
    const b = outB.print(state.test);
    expect(b).toEqual(" 0000000000010100 ");
  });

  it("outputs a line", () => {
    state.test.outputList([
      { id: "a", style: "D", len: 1, lpad: 2, rpad: 2 },
      { id: "b", style: "X", len: 6, lpad: 1, rpad: 1 },
      { id: "in", style: "B", len: 2, lpad: 2, rpad: 2 },
      { id: "out", style: "B", len: 4, lpad: 2, rpad: 2 },
    ]);
    state.test.addInstruction(new TestOutputInstruction());
    state.test.run();

    expect(state.test.log()).toEqual("|  1  | 0x0014 |  00  |  1111  |\n");
  });

  it("outputs 16 bit", () => {
    const test = new OutputTest([
      ["a", 0b0001001000110100],
      ["b", 0b1001100001110110],
    ]);
    test.outputList([
      { id: "a", style: "B", len: 16, lpad: 1, rpad: 1 },
      { id: "b", style: "B", len: 16, lpad: 1, rpad: 1 },
    ]);

    test.addInstruction(new TestOutputInstruction());
    test.run();

    expect(test.log()).toEqual("| 0001001000110100 | 1001100001110110 |\n");
  });

  it("outputs a header for 16 bit", () => {
    const outB = new Output("b", "B", 16, 1, 1);
    const b = outB.header(state.test);
    expect(b).toEqual("        b         ");
  });

  it("truncates a narrow header", () => {
    const wideOut = new Output("addressM", "D", 5, 0, 0);

    const wide = wideOut.header(state.test);
    expect(wide).toEqual("addre");
  });

  it("does not center %S", () => {
    const outTime = new Output("time", "S", 6, 1, 1);
    const time = outTime.print(state.test);
    expect(`'${time}'`).toEqual("' 14+    '");
  });

  it("outputs builtin header with no index", () => {
    const outPC = new Output("PC", "D", 4, 0, 0, true, -1);
    const header = outPC.header(state.test);
    expect(header).toEqual("PC[]");
  });

  it("outputs builtin header with index", () => {
    const outPC = new Output("RAM16K", "D", 7, 1, 1, true, 2);
    const header = outPC.header(state.test);
    expect(header).toEqual("RAM16K[2]");
  });
});
