import { Timer } from "@nand2tetris/simulator/timer.js";

import MemoryComponent from "@nand2tetris/components/chips/memory.js";
import { Screen } from "@nand2tetris/components/chips/screen.js";
import { Keyboard } from "@nand2tetris/components/chips/keyboard";
import { Runbar } from "@nand2tetris/components/runbar.js";
import { useCpuPageStore } from "@nand2tetris/components/stores/cpu.store";

export const CPU = () => {
  const { state, actions } = useCpuPageStore();

  const runner = new (class CPURunner extends Timer {
    override tick() {
      actions.tick();
      return true;
    }

    override finishFrame() {
      // TODO
    }

    override reset() {
      actions.reset();
    }

    override toggle() {
      // TODO
    }
  })();

  return (
    <div>
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
            memory={state.sim.ROM}
            highlight={state.sim.PC}
            format="asm"
            editable={false}
          />
          <MemoryComponent name="RAM" memory={state.sim.RAM} format="hex" />
        </div>
        <div>
          <Runbar runner={runner}></Runbar>
          <div>
            <dl>
              <dt>PC</dt>
              <dd>{state.sim.PC}</dd>
              <dt>A</dt>
              <dd>{state.sim.A}</dd>
              <dt>D</dt>
              <dd>{state.sim.D}</dd>
            </dl>
          </div>
          <Screen memory={state.sim.Screen}></Screen>
          <Keyboard keyboard={state.sim.Keyboard} />
        </div>
      </div>
    </div>
  );
};

export default CPU;
