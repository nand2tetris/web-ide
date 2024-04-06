import { Timer } from "@nand2tetris/simulator/timer.js";

import { Keyboard } from "@nand2tetris/components/chips/keyboard";
import MemoryComponent from "@nand2tetris/components/chips/memory.js";
import { Screen } from "@nand2tetris/components/chips/screen.js";
import { useCpuPageStore } from "@nand2tetris/components/stores/cpu.store";
import { useContext, useEffect, useRef, useState } from "react";

import { Trans } from "@lingui/macro";
import { useStateInitializer } from "@nand2tetris/components/react";
import { Runbar } from "@nand2tetris/components/runbar";
import { AppContext } from "src/App.context";
import { Panel } from "src/shell/panel";
import { TestPanel } from "src/shell/test_panel";
import "./cpu.scss";

export const CPU = () => {
  const { state, actions, dispatch } = useCpuPageStore();
  const { toolStates, filePicker, setTitle } = useContext(AppContext);

  const [tst, setTst] = useStateInitializer(state.test.tst);
  const [out, setOut] = useStateInitializer(state.test.out);
  const [cmp, setCmp] = useStateInitializer(state.test.cmp);
  const [fileName, setFileName] = useState<string>();
  const [romFormat, setRomFormat] = useState("asm");
  const [displayEnabled, setDisplayEnabled] = useState(true);
  const [screenRenderKey, setScreenRenderKey] = useState(0);

  useEffect(() => {
    if (toolStates.cpuState.rom) {
      dispatch.current({
        action: "replaceROM",
        payload: toolStates.cpuState.rom,
      });
      setRomFormat(toolStates.cpuState.format);
      if (toolStates.cpuState.path) {
        const name = toolStates.cpuState.path.split("/").pop() ?? "";
        setTitle(name);
        setFileName(name);
        onUpload(toolStates.cpuState.path);
      }
    }
  }, []);

  useEffect(() => {
    toolStates.setCpuState(fileName, state.sim.ROM, romFormat);
  });

  useEffect(() => {
    actions.compileTest(tst, cmp);
    actions.reset();
  }, [tst, cmp]);

  const toggleDisplayEnabled = () => {
    setDisplayEnabled(!displayEnabled);
  };

  const cpuRunner = useRef<Timer>();
  const testRunner = useRef<Timer>();
  const [runnersAssigned, setRunnersAssigned] = useState(false);
  useEffect(() => {
    cpuRunner.current = new (class CPUTimer extends Timer {
      override async tick() {
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
      override async tick() {
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

  const onUpload = async (path: string) => {
    const name = path.split("/").pop() ?? "";
    setFileName(name);
    setTitle(name);
    actions.setPath(path);
    actions.reset();
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

  const [scale, setScale] = useState(1);
  const onScale = (scale: number) => {
    setScale(scale);
  };

  return (
    <div
      className={`Page CpuPage grid ${scale == 2 ? "large-screen" : "normal"}`}
    >
      <MemoryComponent
        name="ROM"
        displayEnabled={displayEnabled}
        memory={state.sim.ROM}
        highlight={state.sim.PC}
        format={romFormat}
        onUpload={onUpload}
        fileSelect={async () => {
          return await filePicker.select([".asm", ".hack"]);
        }}
      />
      <MemoryComponent
        name="RAM"
        displayEnabled={displayEnabled}
        memory={state.sim.RAM}
        format="dec"
        excludedFormats={["asm"]}
        onChange={onMemoryChange}
      />
      <Panel
        className="IO"
        header={
          <>
            <div className="flex-1">
              {runnersAssigned && cpuRunner.current && (
                <Runbar runner={cpuRunner.current} />
              )}
            </div>
          </>
        }
      >
        <Screen
          key={screenRenderKey}
          memory={state.sim.Screen}
          showScaleControls={true}
          onScale={onScale}
        ></Screen>
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
          tstName={state.test.name}
          disabled={!state.test.valid}
          showLoad={false}
          showName={state.tests.length < 2}
          onSpeedChange={(speed) => {
            actions.setAnimate(speed <= 2);
          }}
          prefix={
            state.tests.length > 1 ? (
              <select
                value={state.test.name}
                onChange={({ target: { value } }) => {
                  actions.loadTest(value);
                }}
                data-testid="test-picker"
              >
                {state.tests.map((test) => (
                  <option key={test} value={test}>
                    {test}
                  </option>
                ))}
              </select>
            ) : (
              <></>
            )
          }
        />
      )}
    </div>
  );
};

export default CPU;
