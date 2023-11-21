import { Timer } from "@nand2tetris/simulator/timer.js";

import { Keyboard } from "@nand2tetris/components/chips/keyboard";
import MemoryComponent from "@nand2tetris/components/chips/memory.js";
import { Screen } from "@nand2tetris/components/chips/screen.js";
import { useCpuPageStore } from "@nand2tetris/components/stores/cpu.store";
import { useEffect, useRef, useState } from "react";

import { Trans } from "@lingui/macro";
import { useStateInitializer } from "@nand2tetris/components/react";
import { Runbar } from "@nand2tetris/components/runbar";
import { Panel } from "src/shell/panel";
import { TestPanel } from "src/shell/test_panel";
import "./cpu.scss";

export const CPU = () => {
  const { state, actions, dispatch } = useCpuPageStore();

  const [tst, setTst] = useStateInitializer(state.test.tst);
  const [out, setOut] = useStateInitializer(state.test.out);
  const [cmp, setCmp] = useStateInitializer(state.test.cmp);
  const [fileName, setFileName] = useState<string | null>(null);
  const [displayEnabled, setDisplayEnabled] = useState(true);
  const [screenRenderKey, setScreenRenderKey] = useState(0);

  useEffect(() => {
    actions.initialize();
  }, [actions]);

  const toggleDisplayEnabled = () => {
    setDisplayEnabled(!displayEnabled);
  };

  const cpuRunner = useRef<Timer>();
  const testRunner = useRef<Timer>();
  const [runnersAssigned, setRunnersAssigned] = useState(false);
  useEffect(() => {
    cpuRunner.current = new (class CPUTimer extends Timer {
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

    testRunner.current = new (class CPUTestTimer extends Timer {
      override tick() {
        return actions.testStep();
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
    setRunnersAssigned(true);

    return () => {
      cpuRunner.current?.stop();
      testRunner.current?.stop();
    };
  }, [actions, dispatch]);

  const onUpload = (fileName: string) => {
    setFileName(fileName);
    actions.reset();
  };

  const onLoadTest = (tst: string, cmp?: string) => {
    actions.compileTest(tst, cmp);
  };

  const rerenderScreen = () => {
    setScreenRenderKey(screenRenderKey + 1);
  };

  const onMemoryChange = () => {
    rerenderScreen();
  };

  const onKeyChange = () => {
    dispatch.current({ action: "update" });
  };

  return (
    <div className="CpuPage grid">
      <MemoryComponent
        name="ROM"
        displayEnabled={displayEnabled}
        memory={state.sim.ROM}
        highlight={state.sim.PC}
        format="asm"
        onUpload={onUpload}
      />
      <MemoryComponent
        name="RAM"
        displayEnabled={displayEnabled}
        memory={state.sim.RAM}
        format="hex"
        onChange={onMemoryChange}
      />
      <Panel
        className="IO"
        header={
          <>
            {fileName && <div className="flex-0">{fileName}</div>}
            <div className="flex-1">
              {runnersAssigned && cpuRunner.current && (
                <Runbar runner={cpuRunner.current} />
              )}
            </div>
          </>
        }
      >
        <Screen key={screenRenderKey} memory={state.sim.Screen}></Screen>
        <Keyboard update={onKeyChange} keyboard={state.sim.Keyboard} />
        <label>
          <input
            type="checkbox"
            role="switch"
            checked={displayEnabled}
            onChange={toggleDisplayEnabled}
          />
          <Trans>{displayEnabled ? "Disable display" : "Enable display"}</Trans>
        </label>
        {displayEnabled && (
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
        )}
      </Panel>
      {runnersAssigned && (
        <TestPanel
          runner={testRunner}
          tst={[tst, setTst, state.test.highlight]}
          out={[out, setOut]}
          cmp={[cmp, setCmp]}
          onLoadTest={onLoadTest}
        />
      )}
    </div>
  );
};

export default CPU;
