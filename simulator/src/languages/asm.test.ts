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
      span: { line: 1, start: 0, end: 3 },
    });
  });

  it("parses an A instruction to a value", () => {
    const match = grammar.match("@5", "AInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "A",
      label: undefined,
      value: 5,
      span: { line: 1, start: 0, end: 2 },
    });
  });

  it("parses a C instruction", () => {
    const match = grammar.match("-1", "CInstruction");
    expect(match).toHaveSucceeded();
    expect(asmSemantics(match).instruction).toEqual({
      type: "C",
      op: COMMANDS.getOp("-1"),
      isM: false,
      span: { line: 1, start: 0, end: 2 },
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
      span: { line: 1, start: 0, end: 3 },
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
      span: { line: 1, start: 0, end: 5 },
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
      span: { line: 1, start: 0, end: 5 },
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
        span: { line: 10, start: 321, end: 324 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 11, start: 328, end: 331 },
      },
      {
        type: "A",
        label: "R1",
        span: { line: 12, start: 335, end: 338 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D-M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 13, start: 342, end: 347 },
      },
      {
        type: "A",
        label: "ITSR0",
        span: { line: 15, start: 379, end: 385 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        jump: JUMP.asm["JGT"],
        isM: false,
        span: { line: 16, start: 389, end: 394 },
      },
      {
        type: "A",
        label: "R1",
        span: { line: 18, start: 411, end: 414 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 19, start: 418, end: 421 },
      },
      {
        type: "A",
        label: "R2",
        span: { line: 20, start: 425, end: 428 },
      },
      {
        type: "C",
        store: ASSIGN.asm["M"],
        op: COMMANDS.getOp("D"),
        isM: false,
        span: { line: 21, start: 432, end: 435 },
      },
      {
        type: "A",
        label: "END",
        span: {
          end: 443,
          line: 22,
          start: 439,
        },
      },
      {
        isM: false,
        op: COMMANDS.getOp("0"),
        span: {
          end: 452,
          line: 23,
          start: 447,
        },
        jump: JUMP.asm["JMP"],
        type: "C",
      },
      {
        type: "L",
        label: "ITSR0",
        span: { line: 24, start: 453, end: 460 },
      },
      {
        type: "A",
        label: "R0",
        span: { line: 25, start: 464, end: 467 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 26, start: 484, end: 487 },
      },
      {
        type: "A",
        label: "R2",
        span: { line: 27, start: 491, end: 494 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        store: ASSIGN.asm["M"],
        isM: false,
        span: { line: 28, start: 498, end: 501 },
      },
      {
        type: "L",
        label: "END",
        span: { line: 29, start: 502, end: 507 },
      },
      {
        type: "A",
        label: "END",
        span: { line: 30, start: 511, end: 515 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        span: { line: 31, start: 519, end: 524 },
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
        span: { line: 10, start: 321, end: 324 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 11, start: 328, end: 331 },
      },
      {
        type: "A",
        value: 1,
        span: { line: 12, start: 335, end: 338 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D-M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 13, start: 342, end: 347 },
      },
      {
        type: "A",
        value: 12,
        span: { line: 15, start: 379, end: 385 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        jump: JUMP.asm["JGT"],
        isM: false,
        span: { line: 16, start: 389, end: 394 },
      },
      {
        type: "A",
        value: 1,
        span: { line: 18, start: 411, end: 414 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 19, start: 418, end: 421 },
      },
      {
        type: "A",
        value: 2,
        span: { line: 20, start: 425, end: 428 },
      },
      {
        type: "C",
        store: ASSIGN.asm["M"],
        op: COMMANDS.getOp("D"),
        isM: false,
        span: { line: 21, start: 432, end: 435 },
      },
      {
        type: "A",
        value: 16,
        span: {
          end: 443,
          line: 22,
          start: 439,
        },
      },
      {
        isM: false,
        op: COMMANDS.getOp("0"),
        span: {
          end: 452,
          line: 23,
          start: 447,
        },
        jump: JUMP.asm["JMP"],
        type: "C",
      },
      {
        type: "L",
        label: "ITSR0",
        span: { line: 24, start: 453, end: 460 },
      },
      {
        type: "A",
        value: 0,
        span: { line: 25, start: 464, end: 467 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("M"),
        store: ASSIGN.asm["D"],
        isM: true,
        span: { line: 26, start: 484, end: 487 },
      },
      {
        type: "A",
        value: 2,
        span: { line: 27, start: 491, end: 494 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("D"),
        store: ASSIGN.asm["M"],
        isM: false,
        span: { line: 28, start: 498, end: 501 },
      },
      {
        type: "L",
        label: "END",
        span: { line: 29, start: 502, end: 507 },
      },
      {
        type: "A",
        value: 16,
        span: { line: 30, start: 511, end: 515 },
      },
      {
        type: "C",
        op: COMMANDS.getOp("0"),
        jump: JUMP.asm["JMP"],
        isM: false,
        span: { line: 31, start: 519, end: 524 },
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
      0b0000000000000000,
      0b1111110000010000,
      0b0000000000000001,
      0b1111010011010000,
      0b0000000000001100,
      0b1110001100000001,
      0b0000000000000001,
      0b1111110000010000,
      0b0000000000000010,
      0b1110001100001000,
      0b0000000000010000,
      0b1110101010000111,
      0b0000000000000000,
      0b1111110000010000,
      0b0000000000000010,
      0b1110001100001000,
      0b0000000000010000,
      0b1110101010000111,
    ]);
  });
});
