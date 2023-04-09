import { Timer } from "@nand2tetris/simulator/timer.js";

import MemoryComponent from "@nand2tetris/components/chips/memory.js";
import { Screen } from "@nand2tetris/components/chips/screen.js";
import { Keyboard } from "@nand2tetris/components/chips/keyboard";
import { useCpuPageStore } from "@nand2tetris/components/stores/cpu.store";
import { useEffect, useRef, useState } from "react";

import "./cpu.scss";
import { TestPanel } from "src/shell/test_panel";
import { Panel } from "src/shell/panel";

export const CPU = () => {
  const { state, actions, dispatch } = useCpuPageStore();

  const [tst, setTst] = useState("repeat {\n\tticktock;\n}");
  const [out, setOut] = useState("");
  const [cmp, setCmp] = useState("");

  const runner = useRef<Timer>();
  useEffect(() => {
    runner.current = new (class ChipTimer extends Timer {
      override tick() {
        actions.tick();
        return false;
      }

      override finishFrame() {
        dispatch.current({ action: "update" });
      }

      override reset() {
        actions.reset();
      }

      override toggle() {
        dispatch.current({ action: "update" });
      }
    })();

    return () => {
      runner.current?.stop();
    };
  }, [actions, dispatch]);

  return (
    <div className="CpuPage grid">
      <MemoryComponent
        name="ROM"
        memory={state.sim.ROM}
        highlight={state.sim.PC}
        format="asm"
        editable={false}
      />
      <MemoryComponent name="RAM" memory={state.sim.RAM} format="hex" />
      <Panel className="IO">
        <div>
          <label>
            <input
              type="checkbox"
              onChange={actions.toggleUseTest}
              checked={state.test.useTest}
              role="switch"
            />
            Use Test Script
          </label>
        </div>
        <Screen memory={state.sim.Screen}></Screen>
        <Keyboard keyboard={state.sim.Keyboard} />
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
      </Panel>
      <TestPanel
        disabled={!state.test.useTest}
        runner={runner}
        tst={[tst, setTst, state.test.highlight]}
        out={[out, setOut]}
        cmp={[cmp, setCmp]}
      />
    </div>
  );
};

export default CPU;
