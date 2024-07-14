import { Timer } from "@nand2tetris/simulator/timer.js";

import { Keyboard } from "@nand2tetris/components/chips/keyboard";
import MemoryComponent from "@nand2tetris/components/chips/memory.js";
import { Screen, ScreenScales } from "@nand2tetris/components/chips/screen.js";
import { useContext, useEffect, useRef, useState } from "react";

import { Trans } from "@lingui/macro";
import { useStateInitializer } from "@nand2tetris/components/react";
import { Runbar } from "@nand2tetris/components/runbar";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { AppContext } from "../App.context";
import { PageContext } from "../Page.context";
import { Accordian, Panel } from "../shell/panel";
import { TestPanel } from "../shell/test_panel";
import "./cpu.scss";

export const CPU = () => {
  const { filePicker } = useContext(AppContext);
  const { setTool, stores } = useContext(PageContext);
  const { state, actions, dispatch } = stores.cpu;
  const { fs } = useContext(BaseContext);

  const [tst, setTst] = useStateInitializer(state.test.tst);
  const [out, setOut] = useStateInitializer(state.test.out);
  const [cmp, setCmp] = useStateInitializer(state.test.cmp);
  const [tstPath, setTstPath] = useState<string>();
  const [screenRenderKey, setScreenRenderKey] = useState(0);

  useEffect(() => {
    setTool("cpu");
  }, [setTool]);

  useEffect(() => {
    actions.compileTest(tst, cmp, tstPath);
    actions.reset();
  }, [tst, cmp, tstPath]);

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

  const setPath = async (fullPath: string) => {
    setTstPath(fullPath);
    actions.setPath(fullPath);
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

  const onScale = (scale: ScreenScales) => {
    dispatch.current({
      action: "updateConfig",
      payload: { screenScale: scale },
    });
  };

  const loadFile = async () => {
    const file = await filePicker.selectAllowLocal({
      suffix: [".asm", ".hack"],
    });
    const title =
      typeof file == "string" ? file.split("/").pop() ?? "" : file[0].name;
    dispatch.current({ action: "setTitle", payload: title });
    if (typeof file === "string") {
      setPath(file);
      return {
        name: file.split("/").pop() ?? "",
        content: await fs.readFile(file),
      };
    } else {
      actions.clearTest();
      return file[0];
    }
  };

  return (
    <div
      className={`Page CpuPage grid ${state.config.screenScale == 2 ? "large-screen" : "normal"}`}
    >
      <MemoryComponent
        name="ROM"
        memory={state.sim.ROM}
        highlight={state.sim.PC}
        format={state.config.romFormat}
        fileSelect={loadFile}
        onSetFormat={(format) => {
          dispatch.current({
            action: "updateConfig",
            payload: { romFormat: format },
          });
        }}
      />
      <MemoryComponent
        name="RAM"
        memory={state.sim.RAM}
        format={state.config.ramFormat}
        excludedFormats={["asm"]}
        onChange={onMemoryChange}
        onSetFormat={(format) => {
          dispatch.current({
            action: "updateConfig",
            payload: { ramFormat: format },
          });
        }}
      />
      <Panel
        className="IO"
        header={
          <>
            <div className="flex-1">
              {runnersAssigned && cpuRunner.current && (
                <Runbar
                  runner={cpuRunner.current}
                  speed={state.config.speed}
                  onSpeedChange={(speed) => {
                    dispatch.current({
                      action: "updateConfig",
                      payload: { speed },
                    });
                  }}
                />
              )}
            </div>
          </>
        }
      >
        <Screen
          key={screenRenderKey}
          memory={state.sim.Screen}
          showScaleControls={true}
          scale={state.config.screenScale}
          onScale={onScale}
        ></Screen>
        <Keyboard update={onKeyChange} keyboard={state.sim.Keyboard} />
        <Accordian summary={<Trans>Registers</Trans>} open={true}>
          <main>
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
          </main>
        </Accordian>
      </Panel>
      {runnersAssigned && (
        <TestPanel
          runner={testRunner}
          tst={[tst, setTst, state.test.highlight]}
          out={[out, setOut]}
          cmp={[cmp, setCmp]}
          setPath={setTstPath}
          tstName={state.test.name}
          disabled={!state.test.valid}
          showName={state.tests.length < 2}
          speed={state.config.testSpeed}
          onSpeedChange={(speed) => {
            dispatch.current({
              action: "updateConfig",
              payload: { testSpeed: speed },
            });
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
