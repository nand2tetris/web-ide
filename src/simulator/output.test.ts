import { cleanState } from "@davidsouther/jiffies/lib/esm/scope/state";
import { Output } from "./output"
import { Test, TestOutputInstruction } from "./tst"

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
  setVar(variable: string, value: number): void {
    this.vars.set(`${variable}`, value);
  }
}

describe("Test Output Handler", () => {
  const state = cleanState(() => ({
    test: new OutputTest([
      ["time", "14+"],
      ["a", 1],
      ["b", 20],
      ["in", 0],
      ["out", -1],
    ]),
  }), beforeEach);

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
      new Output("a", "D", 1, 2, 2),
      new Output("b", "X", 6, 1, 1),
      new Output("in", "B", 2, 2, 2),
      new Output("out", "B", 4, 2, 2),
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
      new Output("a", "B", 16, 1, 1),
      new Output("b", "B", 16, 1, 1),
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

  it("does not center %S", () => {
    const outTime = new Output("time", "S", 6, 1, 1);
    const time = outTime.print(state.test);
    expect(`'${time}'`).toEqual("' 14+    '");
  });
});
