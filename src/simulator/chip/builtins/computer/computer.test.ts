import { HIGH } from "../../chip";
import { CPU } from "./computer";

describe("Computer Chip Builtins", () => {
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
