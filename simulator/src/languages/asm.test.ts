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
        span: { line: 10, start: 319, end: 322 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 11, start: 325, end: 328 },
      },
      {
        type: "A",
        label: "R1",
        span: { line: 12, start: 331, end: 334 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D-M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 13, start: 337, end: 342 },
      },
      {
        type: "A",
        label: "ITSR0",
        span: { line: 15, start: 372, end: 378 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        jump: JUMP.asm["JGT"],
        isM: false,
        span: { line: 16, start: 381, end: 386 },
      },
      {
        type: "A",
        label: "R1",
        span: { line: 18, start: 401, end: 404 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 19, start: 407, end: 410 },
      },
      {
        type: "A",
        label: "OUTPUT_D",
        span: { line: 20, start: 413, end: 422 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        span: { line: 21, start: 425, end: 430 },
      },
      {
        type: "L",
        label: "ITSR0",
        span: { line: 22, start: 431, end: 438 },
      },
      {
        type: "A",
        label: "R0",
        span: { line: 23, start: 441, end: 444 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 24, start: 447, end: 450 },
      },
      {
        type: "L",
        label: "OUTPUT_D",
        span: { line: 25, start: 451, end: 461 },
      },
      {
        type: "A",
        label: "R2",
        span: { line: 26, start: 464, end: 467 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        store: ASSIGN.asm["M"],
        isM: false,
        span: { line: 27, start: 470, end: 473 },
      },
      {
        type: "L",
        label: "END",
        span: { line: 28, start: 474, end: 479 },
      },
      {
        type: "A",
        label: "END",
        span: { line: 29, start: 482, end: 486 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        span: { line: 30, start: 489, end: 494 },
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
        span: { line: 10, start: 319, end: 322 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 11, start: 325, end: 328 },
      },
      {
        type: "A",
        value: 1,
        span: { line: 12, start: 331, end: 334 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D-M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 13, start: 337, end: 342 },
      },
      {
        type: "A",
        value: 10,
        span: { line: 15, start: 372, end: 378 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        jump: JUMP.asm["JGT"],
        isM: false,
        span: { line: 16, start: 381, end: 386 },
      },
      {
        type: "A",
        value: 1,
        span: { line: 18, start: 401, end: 404 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 19, start: 407, end: 410 },
      },
      {
        type: "A",
        value: 12,
        span: { line: 20, start: 413, end: 422 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        span: { line: 21, start: 425, end: 430 },
      },
      {
        type: "L",
        label: "ITSR0",
        span: { line: 22, start: 431, end: 438 },
      },
      {
        type: "A",
        value: 0,
        span: { line: 23, start: 441, end: 444 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 24, start: 447, end: 450 },
      },
      {
        type: "L",
        label: "OUTPUT_D",
        span: { line: 25, start: 451, end: 461 },
      },
      {
        type: "A",
        value: 2,
        span: { line: 26, start: 464, end: 467 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        store: ASSIGN.asm["M"],
        isM: false,
        span: { line: 27, start: 470, end: 473 },
      },
      {
        type: "L",
        label: "END",
        span: { line: 28, start: 474, end: 479 },
      },
      {
        type: "A",
        value: 14,
        span: { line: 29, start: 482, end: 486 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        span: { line: 30, start: 489, end: 494 },
      },
    ]);
  });

  it("assembles a file to bin", () => {
    const match = grammar.match(MaxAsm);

    expect(match).toHaveSucceeded();

    const asm: Asm = asmSemantics(match).asm;
    fillLabel(asm);
    const bin = emit(asm);

    // biome-ignore format: special constant formatting
    const file = [
      0b0_000000000000000,    // @R0                     0x0000
      0b111_1_110000_010_000, // D=M                     0xFE10
      0b0_000000000000001,    // @R1                     0x0001
      0b111_1_010011_010_000, // D=D-M                   0xF8D0
      0b0_000000000001010,    // @ITSR0#10               0x000A
      0b111_0_001100_000_001, // D;JGT                   0xE301
      0b0_000000000000001,    // @R1                     0x0001
      0b111_1_110000_010_000, // D=M                     0xFE10
      0b0_000000000001100,    // @OUTPUT_D#12            0x000C
      0b111_0_101010_000_111, // 0;JMP (ITSR0:10)        0xEA85
      0b0_000000000000000,    // @R0                     0x0000
      0b111_1_110000_010_000, // D=M (OUTPUT_D:12)       0x000C
      0b0_000000000000010,    // @R2                     0x0002
      0b111_0_001100_001_000, // M=D (INFINITE LOOP:14)  0xE308
      0b0_000000000001110,    // @INFINITE_LOOP#14       0x0014
      0b111_0_101010_000_111, // 0;JMP                   0xEA83
    ];
    expect(bin).toEqual(file);
  });
});
