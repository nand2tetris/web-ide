import { CPU as CPUChip } from "@computron5k/simulator/cpu/cpu.js";
import { Memory } from "@computron5k/simulator/cpu/memory.js";
import { HACK } from "@computron5k/simulator/testing/mult.js";
import { TickScreen } from "@computron5k/simulator/testing/fill.js";
import { Timer } from "@computron5k/simulator/timer.js";

import MemoryComponent from "@computron5k/components/chips/memory.js";
import { Screen } from "@computron5k/components/chips/screen.js";
import { Runbar } from "@computron5k/components/runbar.js";

export const CPU = () => {
  const cpu = new CPUChip({ ROM: new Memory(HACK) });
  const resetRAM = () => {
    cpu.RAM.set(0, 3);
    cpu.RAM.set(1, 2);
  };

  const tickScreen = TickScreen(cpu);

  const runner = new (class CPURunner extends Timer {
    override tick() {
      cpu.tick();
      return false;
    }

    override finishFrame() {
      tickScreen();
    }

    override reset() {
      resetRAM();
      cpu.reset();
      // setState();
    }

    override toggle() {
      // runbar.update();
    }
  })();

  return (
    <div>
      <Runbar runner={runner}>
        <label>
          <span>{cpu.PC}</span>
          <span>{cpu.A}</span>
          <span>{cpu.D}</span>
        </label>
      </Runbar>
      <div className="grid">
        <div
          className="grid"
          style={{
            gridAutoFlow: "column",
            gridTemplateColumns: "repeat(2, 1fr)",
          }}
        >
          <MemoryComponent name="RAM" memory={cpu.RAM} format="hex" />
          <MemoryComponent
            name="ROM"
            memory={cpu.ROM}
            highlight={cpu.PC}
            format="asm"
            editable={false}
          />
        </div>
        <div>
          <Screen memory={cpu.RAM}></Screen>;
        </div>
      </div>
    </div>
  );
};

export default CPU;
