import { cpu, CPU, CPUInput, CPUState } from "./cpu.js";
import { Memory } from "./memory.js";
import { HACK } from "../testing/mult.js";
import { Flags } from "./alu.js";

describe("CPU", () => {
  describe("cpu step function", () => {
    it("@A: sets A for @ instuructions", () => {
      const input: CPUInput = { inM: 0, reset: false, instruction: 0x0002 };
      const state: CPUState = {
        A: 0,
        D: 0,
        PC: 0,
        ALU: 0,
        flag: Flags.Zero,
      };

      const [output, outState] = cpu(input, state);

      expect(output).toEqual({ outM: 0, writeM: false, addressM: 2 });
      expect(outState).toEqual({
        A: 2,
        D: 0,
        PC: 1,
        ALU: 0,
        flag: Flags.Zero,
      });
    });

    it("M=1: writes to memory", () => {
      const input: CPUInput = { inM: 0, reset: false, instruction: 0xffc8 };
      const inState: CPUState = {
        A: 2,
        D: 0,
        PC: 0,
        ALU: 0,
        flag: Flags.Zero,
      };

      const [output, outState] = cpu(input, inState);

      expect(output).toEqual({ outM: 1, writeM: true, addressM: 2 });
      expect(outState).toEqual({
        A: 2,
        D: 0,
        PC: 1,
        ALU: 1,
        flag: Flags.Positive,
      });
    });

    it("D=M: reads from memory", () => {
      const input: CPUInput = {
        inM: 0x1234,
        reset: false,
        instruction: 0xfc10,
      };
      const inState: CPUState = { A: 0, D: 0, PC: 0, ALU: 0, flag: Flags.Zero };

      const [output, outState] = cpu(input, inState);

      expect(output).toEqual({ outM: 0x1234, writeM: false, addressM: 0 });
      expect(outState).toEqual({
        A: 0,
        D: 0x1234,
        PC: 1,
        ALU: 0x1234,
        flag: Flags.Positive,
      });
    });

    it("D;JEQ: jumps when D is 0", () => {
      const input: CPUInput = {
        inM: 0x0,
        reset: false,
        instruction: 0xd302,
      };
      const inState: CPUState = {
        A: 0xf,
        D: 0,
        PC: 0,
        ALU: 0,
        flag: Flags.Zero,
      };

      const [output, outState] = cpu(input, inState);

      expect(output).toEqual({ outM: 0, writeM: false, addressM: 0xf });
      expect(outState).toEqual({
        A: 0xf,
        D: 0,
        PC: 15,
        ALU: 0,
        flag: Flags.Zero,
      });
    });

    it("D;JEQ: does not jump when D is not 0", () => {
      const input: CPUInput = {
        inM: 0x0,
        reset: false,
        instruction: 0xd302,
      };
      const inState: CPUState = {
        A: 0xf,
        D: 3,
        PC: 0,
        ALU: 0,
        flag: Flags.Zero,
      };

      const [output, outState] = cpu(input, inState);

      expect(output).toEqual({ outM: 3, writeM: false, addressM: 0xf });
      expect(outState).toEqual({
        A: 0xf,
        D: 3,
        PC: 1,
        ALU: 3,
        flag: Flags.Positive,
      });
    });

    it("D=D+M: adds memory with register", () => {
      const input: CPUInput = {
        inM: 5,
        reset: false,
        instruction: 0xf090,
      };
      const inState: CPUState = { A: 0, D: 3, PC: 0, ALU: 0, flag: Flags.Zero };

      const [output, outState] = cpu(input, inState);

      expect(output).toEqual({ outM: 13, writeM: false, addressM: 0 });
      expect(outState).toEqual({
        A: 0,
        D: 8,
        PC: 1,
        ALU: 13, // ALU adds at every eval
        flag: Flags.Positive,
      });
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
