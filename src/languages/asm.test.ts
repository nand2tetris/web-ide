import { MaxAsm } from "../projects/project_06/02_max";
import { ASSIGN, COMMANDS, JUMP } from "../simulator/cpu/alu";
import { Asm, asmSemantics, emit, fillLabel, grammar } from "./asm";

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
      isM: false,
    });
  });

  it("parses a C instruction with assignment", () => {
    const match = grammar.match("D=M", "CInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.asm["M"],
      store: ASSIGN.asm["D"],
      isM: true,
    });
  });

  it("parses a C instruction with jump", () => {
    const match = grammar.match("D;JEQ", "CInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.asm["D"],
      jump: JUMP.asm["JEQ"],
      isM: false,
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
      isM: false,
    });
  });

  it("parses a file into instructions", () => {
    const match = grammar.match(MaxAsm);

    expect(match).toHaveSucceeded();
    const { instructions } = asmSemantics(match).asm as Asm;
    expect(instructions[0]).toEqual({ type: "A", label: "R0" });
    expect(instructions[1]).toEqual({
      type: "C",
      op: COMMANDS.asm["M"],
      store: ASSIGN.asm["D"],
      isM: true,
    });
    expect(instructions[2]).toEqual({ type: "A", label: "R1" });
    expect(instructions[3]).toEqual({
      type: "C",
      op: COMMANDS.asm["D-M"],
      store: ASSIGN.asm["D"],
      isM: true,
    });
    expect(instructions[4]).toEqual({ type: "A", label: "OUTPUT_FIRST" });
    expect(instructions[5]).toEqual({
      type: "C",
      op: COMMANDS.asm["D"],
      jump: JUMP.asm["JGT"],
      isM: false,
    });
    expect(instructions[6]).toEqual({ type: "A", label: "R1" });
    expect(instructions[7]).toEqual({
      type: "C",
      op: COMMANDS.asm["M"],
      store: ASSIGN.asm["D"],
      isM: true,
    });
    expect(instructions[8]).toEqual({ type: "A", label: "OUTPUT_D" });
    expect(instructions[9]).toEqual({
      type: "C",
      op: COMMANDS.asm["0"],
      jump: JUMP.asm["JMP"],
      isM: false,
    });
    expect(instructions[10]).toEqual({ type: "L", label: "OUTPUT_FIRST" });
    expect(instructions[11]).toEqual({ type: "A", label: "R0" });
    expect(instructions[12]).toEqual({
      type: "C",
      op: COMMANDS.asm["M"],
      store: ASSIGN.asm["D"],
      isM: true,
    });
    expect(instructions[13]).toEqual({ type: "L", label: "OUTPUT_D" });
    expect(instructions[14]).toEqual({ type: "A", label: "R2" });
    expect(instructions[15]).toEqual({
      type: "C",
      op: COMMANDS.asm["D"],
      store: ASSIGN.asm["M"],
      isM: true,
    });
    expect(instructions[16]).toEqual({ type: "L", label: "INFINITE_LOOP" });
    expect(instructions[17]).toEqual({ type: "A", label: "INFINITE_LOOP" });
    expect(instructions[18]).toEqual({
      type: "C",
      op: COMMANDS.asm["0"],
      jump: JUMP.asm["JMP"],
      isM: false,
    });
  });

  it("assembles a file to hack", () => {
    const match = grammar.match(MaxAsm);

    expect(match).toHaveSucceeded();

    const asm: Asm = asmSemantics(match).asm;
    fillLabel(asm);

    expect(asm.instructions).toEqual([
      { type: "A", value: 0 },
      { type: "C", op: COMMANDS.asm["M"], store: ASSIGN.asm["D"], isM: true },
      { type: "A", value: 1 },
      { type: "C", op: COMMANDS.asm["D-M"], store: ASSIGN.asm["D"], isM: true },
      { type: "A", value: 10 },
      { type: "C", op: COMMANDS.asm["D"], jump: JUMP.asm["JGT"], isM: false },
      { type: "A", value: 1 },
      { type: "C", op: COMMANDS.asm["M"], store: ASSIGN.asm["D"], isM: true },
      { type: "A", value: 12 },
      { type: "C", op: COMMANDS.asm["0"], jump: JUMP.asm["JMP"], isM: false },
      { type: "L", label: "OUTPUT_FIRST" },
      { type: "A", value: 0 },
      { type: "C", op: COMMANDS.asm["M"], store: ASSIGN.asm["D"], isM: true },
      { type: "L", label: "OUTPUT_D" },
      { type: "A", value: 2 },
      { type: "C", op: COMMANDS.asm["D"], store: ASSIGN.asm["M"], isM: true },
      { type: "L", label: "INFINITE_LOOP" },
      { type: "A", value: 14 },
      { type: "C", op: COMMANDS.asm["0"], jump: JUMP.asm["JMP"], isM: false },
    ]);
  });

  it("assembles a file to bin", () => {
    const match = grammar.match(MaxAsm);

    expect(match).toHaveSucceeded();

    const asm: Asm = asmSemantics(match).asm;
    fillLabel(asm);
    const bin = emit(asm);

    // prettier-ignore
    expect(bin).toEqual([
      0b0_000000000000000,    // @R0
      0b111_1_110000_010_000, // D=M
      0b0_000000000000001,    // @R1
      0b111_1_010011_010_000, // D=D-M
      0b0_000000000001010,    // @OUTPUT_FIRST#10
      0b111_0_001100_000_001, // D;JGT
      0b0_000000000000001,    // @R1
      0b111_1_110000_010_000, // D=M
      0b0_000000000001100,    // @OUTPUT_D#12
      0b111_0_101010_000_111, // 0;JMP (OUTPUT_FIRST:10)
      0b0_000000000000000,    // @R0
      0b111_1_110000_010_000, // D=M (OUTPUT_D:12)
      0b0_000000000000010,    // @R2
      0b111_1_001100_001_000, // M=D (INFINITE LOOP:14)
      0b0_000000000001110,    // @INFINITE_LOOP#14
      0b111_0_101010_000_111, // 0;JMP
    ]);
  });
});
