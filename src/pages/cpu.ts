import { div, li, span, style, ul } from "@davidsouther/jiffies/dom/html.js";
import { CPU as CPUChip } from "../simulator/cpu/cpu.js";
import MemoryGUI from "../components/memory.js";
import { Memory } from "../simulator/cpu/memory.js";
import { HACK } from "../testing/mult.js";
import { Runbar } from "../components/runbar.js";
import { Timer } from "../simulator/timer.js";
import { Screen } from "../components/screen.js";

import { TickScreen } from "../testing/fill.js";
import { compileFStyle } from "@davidsouther/jiffies/dom/css/fstyle.js";

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
      // tickScreen();
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
    { class: "View__CPU" },
    (runbar = Runbar({ runner }, ul(li(PC), li(A), li(D)))),
    style(
      compileFStyle({
        ".View__CPU": {
          "div.grid": {
            gridTemplateColumns: "repeat(4, 283px)",
            justifyContent: "center",
          },
          "hack-screen": {
            gridColumn: "3 / span 2",
          },
        },
        "@media (max-width: 1195px)": {
          ".View__CPU": {
            "div.grid": {
              gridTemplateColumns: "repeat(2, 283px)",
            },
            "hack-screen": {
              gridColumn: "1 / span 2",
            },
          },
        },
      })
    ),
    div(
      { class: "grid" },
      (ROM = MemoryGUI({
        name: "ROM",
        memory: cpu.ROM,
        highlight: cpu.PC,
        format: "asm",
        editable: false,
      })),
      (RAM = MemoryGUI({ name: "RAM", memory: cpu.RAM, format: "hex" })),
      (screen = Screen({
        memory: cpu.RAM,
      }))
    )
  );
};

export default CPU;
