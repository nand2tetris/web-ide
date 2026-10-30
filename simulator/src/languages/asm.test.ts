import { Err, isErr, Ok } from "@davidsouther/jiffies/result.ts";
import { MaxAsm } from "@nand2tetris/projects/samples/project_06/02_max.js";
import { describe, expect, it } from "vitest";
import { ASSIGN, COMMANDS, JUMP } from "../cpu/alu.js";
import {
  ASM,
  Asm,
  asmSemantics,
  assemble,
  emit,
  fillLabel,
  grammar,
  resolveAsm,
} from "./asm.js";
import type { Diagnostic } from "./base.js";

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

  it("gives a null instruction for an A instruction with a value too large", () => {
    const match = grammar.match("@32768", "aInstruction");
    expect(match.succeeded()).toBe(true);

    const instruction = asmSemantics(match).instruction;

    expect(instruction).toMatchObject({
      recovery: {
        code: "asm.aValueRange",
        args: { value: 32768 },
        stage: "semantic",
      },
      skipped: { kind: "aInstruction" },
    });
  });

  it("fails to parse an A instruction with a negative value", () => {
    const match = grammar.match("@-1", "aInstruction");
    expect(match.failed()).toBe(true);
  });
});

const lines = (...l: string[]) => l.join("\n");
const asmOf = (source: string): Asm => asmSemantics(grammar.match(source)).asm;

describe("fillLabel", () => {
  it("reports every duplicate label, not only the first", () => {
    const source = "(A)\n(B)\n(A)\n(B)\n(A)\n";
    const asm: Asm = asmSemantics(grammar.match(source)).asm;

    const result = fillLabel(asm);

    expect(isErr(result)).toBe(true);
    expect(Err(result as Err<readonly Diagnostic[]>)).toEqual([
      {
        code: "asm.duplicateLabel",
        args: { label: "A" },
        span: { start: 8, end: 11, line: 3 },
        stage: "semantic",
      },
      {
        code: "asm.duplicateLabel",
        args: { label: "B" },
        span: { start: 12, end: 15, line: 4 },
        stage: "semantic",
      },
      {
        code: "asm.duplicateLabel",
        args: { label: "A" },
        span: { start: 16, end: 19, line: 5 },
        stage: "semantic",
      },
    ]);
  });
});

describe("assemble", () => {
  const source = lines(
    "(LOOP)", //     1
    "@32768", //     2: action error, too large for an A instruction
    "D=Q", //        3: syntax error
    "(LOOP)", //     4: duplicate label
    "@LOOP", //      5
    "(LOOP)", //     6: duplicate label
  );

  it("lists syntax, action and label diagnostics in source order", () => {
    const result = assemble(source);

    expect(isErr(result)).toBe(true);
    const diagnostics = Err(result as Err<readonly Diagnostic[]>);
    expect(diagnostics.map(({ span, stage }) => [span?.line, stage])).toEqual([
      [2, "semantic"],
      [3, "lex"],
      [4, "semantic"],
      [6, "semantic"],
    ]);
    expect(diagnostics[2]).toMatchObject({
      code: "asm.duplicateLabel",
      args: { label: "LOOP" },
    });
  });

  it("gives the instruction words of a program with no diagnostic", () => {
    const result = assemble("(LOOP)\n@LOOP\n0;JMP\n");

    expect(Ok(result as Ok<number[]>)).toEqual(
      emit(asmOf("(LOOP)\n@0\n0;JMP\n")),
    );
    expect(Ok(result as Ok<number[]>)).toHaveLength(2);
  });

  it("gives an empty list for an empty program", () => {
    expect(Ok(assemble("") as Ok<number[]>)).toEqual([]);
  });

  it("recovers by default and when asked, alike", () => {
    const asked = assemble(source, { attemptRecovery: true });

    expect(Err(asked as Err<readonly Diagnostic[]>)).toEqual(
      Err(assemble(source) as Err<readonly Diagnostic[]>),
    );
  });

  it("gives only the first syntax diagnostic without recovery", () => {
    const strict = ASM.parse(source);

    const result = assemble(source, { attemptRecovery: false });

    expect(isErr(result)).toBe(true);
    expect(Err(result as Err<readonly Diagnostic[]>)).toEqual(
      strict.diagnostics,
    );
    expect(strict.diagnostics).toHaveLength(1);
  });

  it("keeps an action error and a label error with no syntax error, without recovery", () => {
    const result = assemble("(A)\n@32768\n(A)\n", { attemptRecovery: false });

    expect(
      Err(result as Err<readonly Diagnostic[]>).map(({ span }) => span?.line),
    ).toEqual([2, 3]);
  });

  it("gives no label diagnostic for lines that recovery skipped", () => {
    const result = assemble("D=Q\nD=Q\n@32768\n(A)\n");

    expect(
      Err(result as Err<readonly Diagnostic[]>).map(({ span }) => span?.line),
    ).toEqual([1, 2, 3]);
  });
});

describe("resolveAsm", () => {
  it("keeps labels, spans and symbols of a program for the animation", () => {
    const symbols: [string, number, boolean][] = [];

    const result = resolveAsm("(TOP)\n@x\n@TOP\n", {}, (...symbol) =>
      symbols.push(symbol),
    );

    const { instructions } = Ok(result as Ok<Asm>);
    expect(instructions.map(({ type }) => type)).toEqual(["L", "A", "A"]);
    expect(instructions[1]).toMatchObject({ value: 16, span: { line: 2 } });
    expect(symbols).toEqual([
      ["TOP", 0, false],
      ["x", 16, true],
    ]);
  });
});
