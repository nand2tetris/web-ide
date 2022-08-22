import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs";
import { Max } from "../../../../projects/samples/hack";
import { HIGH } from "../../chip";
import { CPU, ROM32K } from "./computer";

describe("Computer Chip Builtins", () => {
  describe("ROM Builtin", () => {
    it("can load a file", async () => {
      const fs = new FileSystem(
        new ObjectFileSystemAdapter({ "/Max.hack": Max })
      );
      const rom = new ROM32K();

      await rom.load(fs, "Max.hack");

      expect(rom.at(4).busVoltage).toBe(10);
    });
  });

  describe("CPU Chip Builtin", () => {
    it("updates PC on tock", () => {
      const cpu = new CPU();

      cpu.in("instruction").busVoltage = 12345;

      cpu.tick();

      expect(cpu.out("pc").busVoltage).toBe(0);

      cpu.tock();

      expect(cpu.out("pc").busVoltage).toBe(1);
    });

    it("updtates writeM on tick", () => {
      const cpu = new CPU();

      cpu.in("instruction").busVoltage = 0b1110_1111_1100_1000;

      cpu.tick();

      expect(cpu.out("writeM").voltage()).toBe(HIGH);
      expect(cpu.out("outM").busVoltage).toBe(1);
    });
  });
});
