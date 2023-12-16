import { MaxAsm } from "@nand2tetris/projects/samples/project_06/02_max.js";
import { ASSIGN, COMMANDS, JUMP } from "../cpu/alu.js";
import { Asm, asmSemantics, emit, fillLabel, grammar } from "./asm.js";

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
      lineNum: 1,
      span: { start: 0, end: 3 },
    });
  });

  it("parses an A instruction to a value", () => {
    const match = grammar.match("@5", "AInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "A",
      label: undefined,
      value: 5,
      lineNum: 1,
      span: { start: 0, end: 2 },
    });
  });

  it("parses a C instruction", () => {
    const match = grammar.match("-1", "CInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.getOp("-1"),
      isM: false,
      lineNum: 1,
      span: { start: 0, end: 2 },
    });
  });

  it("parses a C instruction with assignment", () => {
    const match = grammar.match("D=M", "CInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.getOp("M"),
      store: ASSIGN.asm["D"],
      isM: true,
      lineNum: 1,
      span: { start: 0, end: 3 },
    });
  });

  it("parses a C instruction with operation", () => {
    const match = grammar.match("M=M+1", "CInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.getOp("A+1"),
      store: ASSIGN.asm["M"],
      isM: true,
      lineNum: 1,
      span: { start: 0, end: 5 },
    });
  });

  it("parses a C instruction with jump", () => {
    const match = grammar.match("D;JEQ", "CInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.getOp("D"),
      jump: JUMP.asm["JEQ"],
      isM: false,
      lineNum: 1,
      span: { start: 0, end: 5 },
    });
  });

  it("parses a C instruction with assignment and jump", () => {
    const match = grammar.match("A=D;JEQ", "CInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.getOp("D"),
      jump: JUMP.asm["JEQ"],
      store: ASSIGN.asm["A"],
      isM: false,
      lineNum: 1,
      span: { start: 0, end: 7 },
    });
  });

  it("parses a file into instructions", () => {
    const match = grammar.match(MaxAsm);

    expect(match).toHaveSucceeded();
    const { instructions } = asmSemantics(match).asm as Asm;
    expect(instructions).toEqual([
      {
        type: "A",
        label: "R0",
        lineNum: 4,
        span: { start: 34, end: 37 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        lineNum: 5,
        span: { start: 41, end: 44 },
      },
      {
        type: "A",
        label: "R1",
        lineNum: 6,
        span: { start: 81, end: 84 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D-M"),
        store: ASSIGN.asm["D"],
        isM: true,
        lineNum: 7,
        span: { start: 88, end: 93 },
      },
      {
        type: "A",
        label: "OUTPUT_FIRST",
        lineNum: 8,
        span: { start: 144, end: 157 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        jump: JUMP.asm["JGT"],
        isM: false,
        lineNum: 9,
        span: { start: 161, end: 166 },
      },
      {
        type: "A",
        label: "R1",
        lineNum: 10,
        span: { start: 228, end: 231 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        lineNum: 11,
        span: { start: 235, end: 238 },
      },
      {
        type: "A",
        label: "OUTPUT_D",
        lineNum: 12,
        span: { start: 276, end: 285 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        lineNum: 13,
        span: { start: 289, end: 294 },
      },
      {
        type: "L",
        label: "OUTPUT_FIRST",
        lineNum: 14,
      },
      {
        type: "A",
        label: "R0",
        lineNum: 15,
        span: { start: 341, end: 344 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        lineNum: 16,
        span: { start: 361, end: 364 },
      },
      {
        type: "L",
        label: "OUTPUT_D",
        lineNum: 17,
      },
      {
        type: "A",
        label: "R2",
        lineNum: 18,
        span: { start: 412, end: 415 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        store: ASSIGN.asm["M"],
        isM: false,
        lineNum: 19,
        span: { start: 419, end: 422 },
      },
      {
        type: "L",
        label: "INFINITE_LOOP",
        lineNum: 20,
      },
      {
        type: "A",
        label: "INFINITE_LOOP",
        lineNum: 21,
        span: { start: 485, end: 499 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        lineNum: 22,
        span: { start: 503, end: 508 },
      },
    ]);
  });

  it("assembles a file to hack", () => {
    const match = grammar.match(MaxAsm);

    expect(match).toHaveSucceeded();

    const asm: Asm = asmSemantics(match).asm;
    fillLabel(asm);

    expect(asm.instructions).toEqual([
      {
        type: "A",
        value: 0,
        lineNum: 4,
        span: { start: 34, end: 37 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        lineNum: 5,
        span: { start: 41, end: 44 },
      },
      {
        type: "A",
        value: 1,
        lineNum: 6,
        span: { start: 81, end: 84 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D-M"),
        store: ASSIGN.asm["D"],
        isM: true,
        lineNum: 7,
        span: { start: 88, end: 93 },
      },
      {
        type: "A",
        value: 10,
        lineNum: 8,
        span: { start: 144, end: 157 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        jump: JUMP.asm["JGT"],
        isM: false,
        lineNum: 9,
        span: { start: 161, end: 166 },
      },
      {
        type: "A",
        value: 1,
        lineNum: 10,
        span: { start: 228, end: 231 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        lineNum: 11,
        span: { start: 235, end: 238 },
      },
      {
        type: "A",
        value: 12,
        lineNum: 12,
        span: { start: 276, end: 285 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        lineNum: 13,
        span: { start: 289, end: 294 },
      },
      {
        type: "L",
        label: "OUTPUT_FIRST",
        lineNum: 14,
      },
      {
        type: "A",
        value: 0,
        lineNum: 15,
        span: { start: 341, end: 344 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        lineNum: 16,
        span: { start: 361, end: 364 },
      },
      {
        type: "L",
        label: "OUTPUT_D",
        lineNum: 17,
      },
      {
        type: "A",
        value: 2,
        lineNum: 18,
        span: { start: 412, end: 415 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        store: ASSIGN.asm["M"],
        isM: false,
        lineNum: 19,
        span: { start: 419, end: 422 },
      },
      {
        type: "L",
        label: "INFINITE_LOOP",
        lineNum: 20,
      },
      {
        type: "A",
        value: 14,
        lineNum: 21,
        span: { start: 485, end: 499 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        lineNum: 22,
        span: { start: 503, end: 508 },
      },
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
      0b111_0_001100_001_000, // M=D (INFINITE LOOP:14)
      0b0_000000000001110,    // @INFINITE_LOOP#14
      0b111_0_101010_000_111, // 0;JMP
    ]);
  });
});
