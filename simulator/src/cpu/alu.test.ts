import { alu, alua, COMMANDS, Flags } from "./alu.js";

describe("alu", () => {
  it("calculates", () => {
    expect(alu(COMMANDS.asm["0"], 123, 456)).toEqual([0, Flags.Zero]);
    expect(alu(COMMANDS.asm["D+A"], 123, 456)).toEqual([579, Flags.Positive]);
    expect(alu(COMMANDS.asm["D-A"], 123, 456)).toEqual([
      -333 & 0xffff,
      Flags.Negative,
    ]);
    expect(alu(COMMANDS.asm["A-D"], 123, 456)).toEqual([333, Flags.Positive]);
    expect(alu(COMMANDS.asm["D&A"], 0b1010, 0b1101)).toEqual([
      0b1000,
      Flags.Positive,
    ]);
    expect(alu(COMMANDS.asm["D|A"], 0b1010, 0b1101)).toEqual([
      0b1111,
      Flags.Positive,
    ]);
  });

  it("calculates undocumented", () => {
    // https://medium.com/@MadOverlord/14-nand2tetris-opcodes-they-dont-want-you-to-know-about-f3246831d1d1

    // -2
    expect(alua(0b111110, 0, 0)).toEqual([0xfffe, Flags.Negative]);

    // NAND
    expect(alua(0b000001, 0, 0)).toEqual([0xffff, Flags.Negative]);
    expect(alua(0b000001, 0, 1)).toEqual([0xffff, Flags.Negative]);
    expect(alua(0b000001, 1, 0)).toEqual([0xffff, Flags.Negative]);
    expect(alua(0b000001, 1, 1)).toEqual([0xfffe, Flags.Negative]);
    expect(alua(0b000001, 0b0011, 0b0101)).toEqual([
      0b1111111111111110,
      Flags.Negative,
    ]);

    // NOR
    expect(alua(0b010100, 0, 0)).toEqual([0xffff, Flags.Negative]);
    expect(alua(0b010100, 0, 1)).toEqual([0xfffe, Flags.Negative]);
    expect(alua(0b010100, 1, 0)).toEqual([0xfffe, Flags.Negative]);
    expect(alua(0b010100, 1, 1)).toEqual([0xfffe, Flags.Negative]);
    expect(alua(0b010100, 0b0011, 0b0101)).toEqual([
      0b1111_1111_1111_1000,
      Flags.Negative,
    ]);

    // Weird
    // 010000 : NOT(X) AND Y      : 00,01,10,11 TruthTable=0100
    expect(alua(0b010000, 0b0011, 0b0101)[0] & 0b1111).toBe(0b0100);
    // 010001 : NOT(NOT(X) AND Y) : 00,01,10,11 TruthTable=1011
    expect(alua(0b010001, 0b0011, 0b0101)[0] & 0b1111).toBe(0b1011);
    // 000101 : NOT(X AND NOT(Y)) : 00,01,10,11 TruthTable=1101
    expect(alua(0b000101, 0b0011, 0b0101)[0] & 0b1111).toBe(0b1101);
    // 000100 : X AND NOT(Y)      : 00,01,10,11 TruthTable=0010
    expect(alua(0b000100, 0b0011, 0b0101)[0] & 0b1111).toBe(0b0010);

    // Bizarre
    expect(alua(0b010111, 13, 19)[0]).toBe(33); // X + Y + 1
    expect(alua(0b000110, 13, 19)[0]).toBe(-7 & 0xffff); // X — Y — 1
    expect(alua(0b011110, 13, 19)[0]).toBe(-15 & 0xffff); // -(X + 2)
    expect(alua(0b110110, 13, 19)[0]).toBe(-21 & 0xffff); // -(Y + 2)
    expect(alua(0b010110, 13, 19)[0]).toBe(-34 & 0xffff); // -(X + Y + 2)
    expect(alua(0b000011, 13, 19)[0]).toBe(-33 & 0xffff); // -(X + Y + 1)
    expect(alua(0b010010, 13, 19)[0]).toBe(5 & 0xffff); // -(X — Y + 1)
  });
});
