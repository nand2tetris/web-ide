import { cpu, CPU, CPUInput, CPUState } from "./cpu";
import { Memory } from "./memory";
import { HACK } from "../../testing/mult";

describe("CPU", () => {
  describe("cpu step function", () => {
    it("@A: sets A for @ instuructions", () => {
      const input: CPUInput = { inM: 0, reset: false, instruction: 0x0002 };
      const inState: CPUState = { A: 0, D: 0, PC: 0 };

      const [output, outState] = cpu(input, inState);

      expect(output).toEqual({ outM: 0, writeM: false, addressM: 0 });
      expect(outState).toEqual({ A: 2, D: 0, PC: 1 });
    });

    it("M=0: writes to memory", () => {
      const input: CPUInput = { inM: 0, reset: false, instruction: 0xda88 };
      const inState: CPUState = { A: 2, D: 0, PC: 0 };

      const [output, outState] = cpu(input, inState);

      expect(output).toEqual({ outM: 0, writeM: true, addressM: 2 });
      expect(outState).toEqual({ A: 2, D: 0, PC: 1 });
    });

    it("D=M: reads from memory", () => {
      const input: CPUInput = {
        inM: 0x1234,
        reset: false,
        instruction: 0xfc10,
      };
      const inState: CPUState = { A: 0, D: 0, PC: 0 };

      const [output, outState] = cpu(input, inState);

      expect(output).toEqual({ outM: 0, writeM: false, addressM: 0 });
      expect(outState).toEqual({ A: 0, D: 0x1234, PC: 1 });
    });

    it("D;JEQ: jumps when D is 0", () => {
      const input: CPUInput = {
        inM: 0x0,
        reset: false,
        instruction: 0xd302,
      };
      const inState: CPUState = { A: 0xf, D: 0, PC: 0 };

      const [output, outState] = cpu(input, inState);

      expect(output).toEqual({ outM: 0, writeM: false, addressM: 0 });
      expect(outState).toEqual({ A: 0xf, D: 0, PC: 15 });
    });

    it("D;JEQ: does not jump when D is not 0", () => {
      const input: CPUInput = {
        inM: 0x0,
        reset: false,
        instruction: 0xd302,
      };
      const inState: CPUState = { A: 0xf, D: 3, PC: 0 };

      const [output, outState] = cpu(input, inState);

      expect(output).toEqual({ outM: 0, writeM: false, addressM: 0 });
      expect(outState).toEqual({ A: 0xf, D: 3, PC: 1 });
    });

    it("D=D+M: adds memory with register", () => {
      const input: CPUInput = {
        inM: 5,
        reset: false,
        instruction: 0xf090,
      };
      const inState: CPUState = { A: 0, D: 3, PC: 0 };

      const [output, outState] = cpu(input, inState);

      expect(output).toEqual({ outM: 0, writeM: false, addressM: 0 });
      expect(outState).toEqual({ A: 0, D: 8, PC: 1 });
    });
  });

  it("executes instructions", () => {
    const RAM = new Memory(256);
    RAM.set(0, 2);
    RAM.set(1, 3);
    const ROM = new Memory(HACK);
    const cpu = new CPU({ RAM, ROM });

    for (let i = 0; i < 100; i++) {
      cpu.tick();
    }

    expect(RAM.get(2)).toBe(6);
  });
});
