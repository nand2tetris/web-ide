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
    const match = grammar.match("@R0", "aInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "A",
      label: "R0",
      value: undefined,
      span: { line: 1, start: 0, end: 3 },
    });
  });

  it("parses an A instruction to a value", () => {
    const match = grammar.match("@5", "aInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "A",
      label: undefined,
      value: 5,
      span: { line: 1, start: 0, end: 2 },
    });
  });

  it("parses a C instruction", () => {
    const match = grammar.match("-1", "cInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.getOp("-1"),
      isM: false,
      span: { line: 1, start: 0, end: 2 },
    });
  });

  it("parses a C instruction with assignment", () => {
    const match = grammar.match("D=M", "cInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.getOp("M"),
      store: ASSIGN.asm["D"],
      isM: true,
      span: { line: 1, start: 0, end: 3 },
    });
  });

  it("parses a C instruction with operation", () => {
    const match = grammar.match("M=M+1", "cInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.getOp("A+1"),
      store: ASSIGN.asm["M"],
      isM: true,
      span: { line: 1, start: 0, end: 5 },
    });
  });

  it("parses a C instruction with jump", () => {
    const match = grammar.match("D;JEQ", "cInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.getOp("D"),
      jump: JUMP.asm["JEQ"],
      isM: false,
      span: { line: 1, start: 0, end: 5 },
    });
  });

  it("parses a C instruction with assignment and jump", () => {
    const match = grammar.match("A=D;JEQ", "cInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.getOp("D"),
      jump: JUMP.asm["JEQ"],
      store: ASSIGN.asm["A"],
      isM: false,
      span: { line: 1, start: 0, end: 7 },
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
        span: { line: 4, start: 34, end: 37 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 5, start: 41, end: 44 },
      },
      {
        type: "A",
        label: "R1",
        span: { line: 6, start: 81, end: 84 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D-M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 7, start: 88, end: 93 },
      },
      {
        type: "A",
        label: "OUTPUT_FIRST",
        span: { line: 8, start: 144, end: 157 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        jump: JUMP.asm["JGT"],
        isM: false,
        span: { line: 9, start: 161, end: 166 },
      },
      {
        type: "A",
        label: "R1",
        span: { line: 10, start: 228, end: 231 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 11, start: 235, end: 238 },
      },
      {
        type: "A",
        label: "OUTPUT_D",
        span: { line: 12, start: 276, end: 285 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        span: { line: 13, start: 289, end: 294 },
      },
      {
        type: "L",
        label: "OUTPUT_FIRST",
        span: { line: 14, start: 323, end: 337 },
      },
      {
        type: "A",
        label: "R0",
        span: { line: 15, start: 341, end: 344 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 16, start: 361, end: 364 },
      },
      {
        type: "L",
        label: "OUTPUT_D",
        span: { line: 17, start: 398, end: 408 },
      },
      {
        type: "A",
        label: "R2",
        span: { line: 18, start: 412, end: 415 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        store: ASSIGN.asm["M"],
        isM: false,
        span: { line: 19, start: 419, end: 422 },
      },
      {
        type: "L",
        label: "INFINITE_LOOP",
        span: { line: 20, start: 466, end: 481 },
      },
      {
        type: "A",
        label: "INFINITE_LOOP",
        span: { line: 21, start: 485, end: 499 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        span: { line: 22, start: 503, end: 508 },
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
        span: { line: 4, start: 34, end: 37 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 5, start: 41, end: 44 },
      },
      {
        type: "A",
        value: 1,
        span: { line: 6, start: 81, end: 84 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D-M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 7, start: 88, end: 93 },
      },
      {
        type: "A",
        value: 10,
        span: { line: 8, start: 144, end: 157 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        jump: JUMP.asm["JGT"],
        isM: false,
        span: { line: 9, start: 161, end: 166 },
      },
      {
        type: "A",
        value: 1,
        span: { line: 10, start: 228, end: 231 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 11, start: 235, end: 238 },
      },
      {
        type: "A",
        value: 12,
        span: { line: 12, start: 276, end: 285 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        span: { line: 13, start: 289, end: 294 },
      },
      {
        type: "L",
        label: "OUTPUT_FIRST",
        span: { line: 14, start: 323, end: 337 },
      },
      {
        type: "A",
        value: 0,
        span: { line: 15, start: 341, end: 344 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 16, start: 361, end: 364 },
      },
      {
        type: "L",
        label: "OUTPUT_D",
        span: { line: 17, start: 398, end: 408 },
      },
      {
        type: "A",
        value: 2,
        span: { line: 18, start: 412, end: 415 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        store: ASSIGN.asm["M"],
        isM: false,
        span: { line: 19, start: 419, end: 422 },
      },
      {
        type: "L",
        label: "INFINITE_LOOP",
        span: { line: 20, start: 466, end: 481 },
      },
      {
        type: "A",
        value: 14,
        span: { line: 21, start: 485, end: 499 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        span: { line: 22, start: 503, end: 508 },
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
      0b0_000000000000000,    // @R0                     0x0000     0
      0b111_1_110000_010_000, // D=M                     0xFE10
      0b0_000000000000001,    // @R1                     0x0001
      0b111_1_010011_010_000, // D=D-M                   0xF8D0
      0b0_000000000001010,    // @OUTPUT_FIRST#10        0x000A
      0b111_0_001100_000_001, // D;JGT                   0xE301
      0b0_000000000000001,    // @R1                     0x0001
      0b111_1_110000_010_000, // D=M                     0xFE10
      0b0_000000000001100,    // @OUTPUT_D#12            0x000C
      0b111_0_101010_000_111, // 0;JMP (OUTPUT_FIRST:10) 0xEA85
      0b0_000000000000000,    // @R0                     0x0000
      0b111_1_110000_010_000, // D=M (OUTPUT_D:12)       0x000C
      0b0_000000000000010,    // @R2                     0x0002
      0b111_0_001100_001_000, // M=D (INFINITE LOOP:14)  0xE308
      0b0_000000000001110,    // @INFINITE_LOOP#14       0x0014
      0b111_0_101010_000_111, // 0;JMP                   0xEA83
    ]);
  });
});
