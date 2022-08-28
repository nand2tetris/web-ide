import { CPU as CPUChip } from "../../simulator/cpu/cpu";
import MemoryComponent from "../components/chips/memory";
import { Memory } from "../../simulator/cpu/memory";
import { HACK } from "../../testing/mult";
import { Runbar } from "../components/runbar";
import { Timer } from "../../simulator/timer";
import { Screen } from "../components/chips/screen";
import { TickScreen } from "../../testing/fill";

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
      tickScreen();
    }

    override finishFrame() {
      // setState();
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
