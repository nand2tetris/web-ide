import { CPU as CPUChip } from "@nand2tetris/simulator/cpu/cpu.js";
import { Memory } from "@nand2tetris/simulator/cpu/memory.js";
import { HACK } from "@nand2tetris/simulator/testing/mult.js";
import { TickScreen } from "@nand2tetris/simulator/testing/fill.js";
import { Timer } from "@nand2tetris/simulator/timer.js";

import MemoryComponent from "@nand2tetris/components/chips/memory.js";
import { Screen } from "@nand2tetris/components/chips/screen.js";
import { Keyboard } from "@nand2tetris/components/chips/keyboard";
import { Runbar } from "@nand2tetris/components/runbar.js";

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
      <Runbar runner={runner}></Runbar>
      <div
        className="grid"
        style={{
          gridAutoFlow: "column",
          gridTemplateColumns: "1fr 514px",
        }}
      >
        <div
          className="grid"
          style={{
            gridAutoFlow: "column",
            gridTemplateColumns: "repeat(2, 1fr)",
          }}
        >
          <MemoryComponent
            name="ROM"
            memory={cpu.ROM}
            highlight={cpu.PC}
            format="asm"
            editable={false}
          />
          <MemoryComponent name="RAM" memory={cpu.RAM} format="hex" />
        </div>
        <div>
          <div>
            <dl>
              <dt>PC</dt>
              <dd>{cpu.PC}</dd>
              <dt>A</dt>
              <dd>{cpu.A}</dd>
              <dt>D</dt>
              <dd>{cpu.D}</dd>
            </dl>
          </div>
          <Screen memory={cpu.Screen}></Screen>
          <Keyboard keyboard={cpu.Keyboard} />
        </div>
      </div>
    </div>
  );
};

export default CPU;
