import { CPU } from "./cpu";
import { Memory } from "./memory";
import { HACK } from "../../testing/mult";

describe("CPU", () => {
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
