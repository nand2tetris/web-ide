import { bin, dec, hex, int2, int10, int16, nand16 } from "./twos.js";

describe("twos", () => {
  it("formats as base 16", () => {
    // expect(bin(0)).toBe("0000 0000 0000 0000");
    // expect(bin(1)).toBe("0000 0000 0000 0001");
    // expect(bin(-1)).toBe("1111 1111 1111 1111");
    // expect(bin(256)).toBe("0000 0001 0000 0000");
    expect(bin(0)).toBe("0000000000000000");
    expect(bin(1)).toBe("0000000000000001");
    expect(bin(-1)).toBe("1111111111111111");
    expect(bin(256)).toBe("0000000100000000");

    expect(bin(6, 4)).toBe("0110");

    expect(dec(0)).toBe("0");
    expect(dec(1)).toBe("1");
    expect(dec(-1)).toBe("-1");
    expect(dec(33413)).toBe("-32123");
    expect(dec(0x8000)).toBe("-32768");
    expect(dec(256)).toBe("256");

    expect(hex(0)).toBe("0x0000");
    expect(hex(1)).toBe("0x0001");
    expect(hex(-1)).toBe("0xFFFF");
    expect(hex(256)).toBe("0x0100");
  });

  it("parses to integer", () => {
    expect(int2("0000000000000000")).toBe(0);
    expect(int2("0000000000000001")).toBe(1);
    expect(int2("1111111111111111")).toBe(65535);
    expect(int2("0000000100000000")).toBe(256);
    expect(int2("0000 0000 0000 0000")).toBe(0);
    expect(int2("0000 0000 0000 0001")).toBe(1);
    expect(int2("1111 1111 1111 1111")).toBe(65535);
    expect(int2("0000 0001 0000 0000")).toBe(256);

    expect(int10("0")).toBe(0);
    expect(int10("1")).toBe(1);
    expect(int10("-1")).toBe(65535);
    expect(int10("-32123")).toBe(33413);
    expect(int10("-32768")).toBe(0x8000);
    expect(int10("256")).toBe(256);

    expect(int16("0x0000")).toBe(0);
    expect(int16("0x0001")).toBe(1);
    expect(int16("0xffff")).toBe(65535);
    expect(int16("0xFFFF")).toBe(65535);
    expect(int16("0x0100")).toBe(256);
  });

  it("nands 16 bit numbers", () => {
    expect(nand16(0b0, 0b0)).toBe(0b1111_1111_1111_1111);
    expect(nand16(0b1, 0b0)).toBe(0b1111_1111_1111_1111);
    expect(nand16(0b0, 0b1)).toBe(0b1111_1111_1111_1111);
    expect(nand16(0b1, 0b1)).toBe(0b1111_1111_1111_1110);
    expect(nand16(0b1010_1010_1010_1010, 0b0101_0101_0101_0101)).toBe(
      0b1111_1111_1111_1111,
    );
    expect(nand16(0b1111_0000_1111_0000, 0b1111_0000_0000_1111)).toBe(
      0b0000_1111_1111_1111,
    );
    expect(nand16(0b1111_1111_0000_1111_0000, 0b1111_1111_0000_0000_1111)).toBe(
      0b0000_1111_1111_1111,
    );
  });
});
