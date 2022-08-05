import { ASSIGN, COMMANDS, JUMP } from "../simulator/cpu/alu";
import { asmSemantics, grammar } from "./asm";

describe("asm language", () => {
  it("parses an empty file", () => {
    const match = grammar.match("");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).asm).toEqual({ instructions: [] });
  });

  it("parses an A instruction to a label", () => {
    const match = grammar.match("@R0", "AInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "A",
      label: "R0",
      value: undefined,
    });
  });

  it("parses an A instruction to a value", () => {
    const match = grammar.match("@5", "AInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "A",
      label: undefined,
      value: 5,
    });
  });

  it("parses a C instruction", () => {
    const match = grammar.match("-1", "CInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.asm["-1"],
    });
  });

  it("parses a C instruction with assignment", () => {
    const match = grammar.match("D=M", "CInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.asm["M"],
      store: ASSIGN.asm["D"],
    });
  });

  it("parses a C instruction with jump", () => {
    const match = grammar.match("D;JEQ", "CInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.asm["D"],
      jump: JUMP.asm["JEQ"],
    });
  });

  it("parses a C instruction with assignment and jump", () => {
    const match = grammar.match("A=D;JEQ", "CInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.asm["D"],
      jump: JUMP.asm["JEQ"],
      store: ASSIGN.asm["A"],
    });
  });

  it("parses a file into instructions", () => {
    const match = grammar.match(``);

    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).asm).toEqual({ instructions: [] });
  });
});
