import { info } from "@davidsouther/jiffies/log.js";
import { describe, expect, it } from "@davidsouther/jiffies/scope/index.js";
import { And16 } from "./busses.js";
import { Nand16, printChip } from "./chip.js";

// 0x1001 & 0x1001 = 0x1001

describe("bus logic", () => {
  describe("nand16", () => {
    it("nands 16-bit-wide", () => {
      const nand16 = new Nand16();
      nand16.in("a").busVoltage = 0xf00f;
      nand16.in("b").busVoltage = 0xf0f0;
      nand16.eval();
      expect(nand16.out().busVoltage).toBe(0x00ff);
    });
  });

  describe("and16", () => {
    it("ands 16-bit-wide busses", () => {
      const and16 = And16();
      and16.in("a").busVoltage = 0x1001;
      info("And16(0x1001, 0x0000)", printChip(and16));
      and16.in("b").busVoltage = 0x1010;
      info("And16(0x1001, 0x1010)", printChip(and16));
      and16.eval();
      info("And16(0x1001, 0x1010) = ", printChip(and16));
      expect(and16.out().busVoltage).toBe(0x1000);
    });
  });
});
