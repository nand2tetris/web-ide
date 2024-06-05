import { ASSIGN, COMMANDS, JUMP } from "../cpu/alu.js";
import { asm, makeC } from "./asm.js";

describe("asm", () => {
  it("converts int16 to asm", () => {
    expect(asm(0x0000)).toBe("@0");
    expect(asm(12)).toBe("@12");

    expect(asm(0b1110_101010_000_000)).toBe("0");
    expect(asm(0b1111_110000_010_000)).toBe("D=M");
    expect(asm(0b1110_001110_010_101)).toBe("D=D-1;JNE");
    expect(asm(0b1110_101010_000_111)).toBe("0;JMP");
    expect(asm(0b1111_110010_011_000)).toBe("MD=M-1");
  });

  it("makes C instruction", () => {
    expect(
      makeC(true, COMMANDS.getOp("D"), ASSIGN.asm["M"], JUMP.asm[""]),
    ).toBe(0b111_1_001100_001_000);
    expect(
      makeC(true, COMMANDS.getOp("D-M"), ASSIGN.asm["D"], JUMP.asm[""]),
    ).toBe(0b111_1_010011_010_000);
    expect(
      makeC(false, COMMANDS.getOp("D"), ASSIGN.asm[""], JUMP.asm["JGT"]),
    ).toBe(0b111_0_001100_000_001);
    expect(
      makeC(false, COMMANDS.getOp("0"), ASSIGN.asm[""], JUMP.asm["JMP"]),
    ).toBe(0b111_0_101010_000_111);
  });
});
