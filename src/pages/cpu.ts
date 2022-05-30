import { div, label, span, style } from "@davidsouther/jiffies/dom/html.js";
import { CPU as CPUChip } from "../simulator/cpu/cpu.js";
import MemoryGUI from "../components/memory.js";
import { Memory } from "../simulator/cpu/memory.js";
import { HACK } from "../testing/mult.js";
import { Runbar } from "../components/runbar.js";
import { Timer } from "../simulator/timer.js";
import { Screen } from "../components/screen.js";

import { TickScreen } from "../testing/fill.js";

export const CPU = (
  { cpu } = { cpu: new CPUChip({ ROM: new Memory(HACK) }) }
) => {
  const PC = span();
  const A = span();
  const D = span();
  let RAM: ReturnType<typeof MemoryGUI>;
  let ROM: ReturnType<typeof MemoryGUI>;
  let runbar: ReturnType<typeof Runbar>;
  let screen: ReturnType<typeof Screen>;

  const resetRAM = () => {
    cpu.RAM.set(0, 3);
    cpu.RAM.set(1, 2);
    RAM?.update();
    screen?.update();
  };
  resetRAM();

  const tickScreen = TickScreen(cpu);

  const setState = () => {
    PC.update(`PC: ${cpu.PC}`);
    A.update(`A: ${cpu.A}`);
    D.update(`D: ${cpu.D}`);
    RAM?.update({ highlight: cpu.A });
    ROM?.update({ highlight: cpu.PC });
    screen?.update();
  };

  setState();

  const runner = new (class CPURunner extends Timer {
    tick() {
      cpu.tick();
      tickScreen();
    }

    finishFrame() {
      setState();
    }

    reset() {
      cpu.reset();
      setState();
    }

    toggle() {
      runbar.update();
    }
  })();

  return div(
    (runbar = Runbar({ runner }, label(PC, A, D))),
    div(
      { class: "grid" },
      div(
        {
          class: "grid",
          style: {
            gridAutoFlow: "column",
            gridTemplateColumns: "repeat(2, 1fr)",
          },
        },
        (ROM = MemoryGUI({
          name: "ROM",
          memory: cpu.ROM,
          highlight: cpu.PC,
          format: "asm",
          editable: false,
        })),
        (RAM = MemoryGUI({ name: "RAM", memory: cpu.RAM, format: "hex" }))
      ),
      div((screen = Screen({ memory: cpu.RAM })))
    )
  );
};

export default CPU;
