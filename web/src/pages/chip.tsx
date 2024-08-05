import { Trans, t } from "@lingui/macro";
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./chip.scss";

import { makeVisualizationsWithId } from "@nand2tetris/components/chips/visualizations.js";
import { Clockface } from "@nand2tetris/components/clockface.js";
import {
  FullPinout,
  PinContext,
  PinResetDispatcher,
} from "@nand2tetris/components/pinout.js";
import { useStateInitializer } from "@nand2tetris/components/react.js";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { hasBuiltinChip } from "@nand2tetris/simulator/chip/builtins/index.js";
import { HDL } from "@nand2tetris/simulator/languages/hdl.js";
import { Timer } from "@nand2tetris/simulator/timer.js";
import { TestPanel } from "src/shell/test_panel";
import { AppContext } from "../App.context";
import { PageContext } from "../Page.context";
import { Editor } from "../shell/editor";
import { Accordian, Panel } from "../shell/panel";

interface CompileInput {
  hdl: string;
  tst: string;
  cmp: string;
  tstDir: string;
}

export const Chip = () => {
  const { setStatus, localFsRoot } = useContext(BaseContext);
  const { stores, setTool } = useContext(PageContext);
  const { tracking, filePicker } = useContext(AppContext);
  const { state, actions, dispatch } = stores.chip;

  const [hdl, setHdl] = useStateInitializer(state.files.hdl);
  const [tst, setTst] = useStateInitializer(state.files.tst);
  const [cmp, setCmp] = useStateInitializer(state.files.cmp);
  const [out, setOut] = useStateInitializer(state.files.out);
  const [tstDir, setTstDir] = useStateInitializer(state.dir);
  const [tstPath, setTstPath] = useState<string>();

  useEffect(() => {
    if (tstPath) {
      setTstDir(tstPath?.split("/").slice(0, -1).join("/"));
    }
  }, [tstPath]);

  useEffect(() => {
    setTool("chip");
  }, [setTool]);

  useEffect(() => {
    tracking.trackPage("/chip");
  }, [tracking]);

  useEffect(() => {
    tracking.trackEvent("action", "setProject", state.controls.project);
    tracking.trackEvent("action", "setChip", state.controls.chipName);
  }, []);

  const doEval = useCallback(() => {
    actions.eval();
    tracking.trackEvent("action", "eval");
  }, [actions, tracking]);

  const compile = useRef<(files?: Partial<CompileInput>) => void>(
    () => undefined,
  );
  compile.current = async (files: Partial<CompileInput> = {}) => {
    const hdlToCompile = state.controls.usingBuiltin
      ? files.hdl
      : files.hdl ?? hdl;
    await actions.updateFiles({
      hdl: hdlToCompile,
      tst: files.tst ?? tst,
      cmp: files.cmp ?? cmp,
      tstPath: files.tstDir ?? tstDir,
    });
  };

  useEffect(() => {
    compile.current({ tst, cmp, tstDir });
    actions.reset();
  }, [tst, cmp, tstDir]);

  const runner = useRef<Timer>();
  useEffect(() => {
    runner.current = new (class ChipTimer extends Timer {
      async reset(): Promise<void> {
        await compile.current();
        await actions.reset();
      }

      override finishFrame(): void {
        super.finishFrame();
        dispatch.current({ action: "updateTestStep" });
      }

      async tick(): Promise<boolean> {
        return await actions.stepTest();
      }

      toggle(): void {
        dispatch.current({ action: "updateTestStep" });
      }
    })();

    return () => {
      runner.current?.stop();
    };
  }, [compile, actions, dispatch]);

  const clockActions = useMemo(
    () => ({
      toggle() {
        actions.clock();
        tracking.trackEvent("action", "toggleClock");
      },
      reset() {
        tracking.trackEvent("action", "resetClock");
        actions.reset();
      },
    }),
    [actions],
  );

  const toggleUseBuiltin = () => {
    actions.toggleBuiltin();
    pinResetDispatcher.reset();
  };

  const loadFile = async () => {
    const path = await filePicker.select({ suffix: "hdl" });
    actions.loadChip(path);
  };

  const selectors = (
    <>
      <fieldset role="group">
        <select
          value={state.controls.project}
          onChange={({ target: { value } }) => {
            actions.setProject(value);
          }}
          data-testid="project-picker"
        >
          {state.controls.projects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>
        <select
          value={state.controls.chipName}
          onChange={({ target: { value } }) => {
            if (value != "") {
              let path = `/${state.controls.project}/${value}.hdl`;
              if (!localFsRoot) {
                path = `/projects${path}`;
              }
              actions.loadChip(path);
            }
          }}
          data-testid="chip-picker"
        >
          {state.controls.chipName == "" && <option></option>}
          {state.controls.chips.map((chip) => (
            <option key={chip} value={chip}>
              {chip}
            </option>
          ))}
        </select>
      </fieldset>
    </>
  );
  const hdlPanel = (
    <Panel
      className="_hdl_panel"
      isEditorPanel={true}
      header={
        <>
          <div className="flex-1" tabIndex={0}>
            HDL
          </div>
          {hasBuiltinChip(state.controls.chipName) && (
            <label>
              <input
                type="checkbox"
                role="switch"
                checked={state.controls.usingBuiltin}
                onChange={toggleUseBuiltin}
              />
              <Trans>Builtin</Trans>
            </label>
          )}
          {selectors}
          <fieldset role="group">
            <button onClick={loadFile}>📂</button>
          </fieldset>
        </>
      }
    >
      <Editor
        className="flex-1"
        value={hdl}
        error={state.controls.error}
        onChange={async (source) => {
          setHdl(source);
          if (!state.controls.usingBuiltin) {
            actions.saveChip(source);
          }
          compile.current(state.controls.usingBuiltin ? {} : { hdl: source });
        }}
        grammar={HDL.parser}
        language={"hdl"}
        disabled={state.controls.usingBuiltin}
      />
    </Panel>
  );

  const [inputValid, setInputValid] = useState(true);

  const showCannotTestError = () => {
    setStatus(t`Cannot test a chip that has syntax errors`);
  };

  const evalIfCan = () => {
    if (state.sim.invalid) {
      showCannotTestError();
      return;
    }
    doEval();
  };

  const chipButtons = (
    <fieldset role="group">
      <button
        onClick={evalIfCan}
        onKeyDown={evalIfCan}
        disabled={!state.sim.pending || !inputValid}
      >
        <Trans>Eval</Trans>
      </button>
      <button
        onClick={() => {
          if (state.sim.invalid) {
            showCannotTestError();
            return;
          }
          clockActions.reset();
        }}
        style={{ maxWidth: "initial" }}
        disabled={!state.sim.clocked}
      >
        <Trans>Reset</Trans>
      </button>
      <button
        onClick={() => {
          if (state.sim.invalid) {
            showCannotTestError();
            return;
          }
          clockActions.toggle();
        }}
        style={{ minWidth: "7em", textAlign: "start" }}
        disabled={!state.sim.clocked}
      >
        <Trans>Clock</Trans>:{"\u00a0"}
        <Clockface />
      </button>
    </fieldset>
  );

  const visualizations: [string, ReactNode][] = makeVisualizationsWithId(
    {
      parts: state.sim.chip,
    },
    () => {
      dispatch.current({ action: "updateChip" });
    },
    state.controls.visualizationParameters,
  );

  const pinResetDispatcher = new PinResetDispatcher();

  const pinsPanel = (
    <Panel
      className="_parts_panel"
      header={
        <>
          <div>
            <Trans>Chip</Trans> {state.controls.chipName}
          </div>
          {chipButtons}
        </>
      }
    >
      {state.sim.invalid ? (
        <Trans>Syntax errors in the HDL code or test</Trans>
      ) : (
        <>
          <PinContext.Provider value={pinResetDispatcher}>
            <FullPinout
              sim={state.sim}
              toggle={actions.toggle}
              setInputValid={setInputValid}
              hideInternal={state.controls.usingBuiltin}
            />
          </PinContext.Provider>
          {visualizations.length > 0 && (
            <Accordian summary={<Trans>Visualization</Trans>} open={true}>
              <main>{visualizations.map(([_, v]) => v)}</main>
            </Accordian>
          )}
        </>
      )}
    </Panel>
  );

  const testPanel = (
    <TestPanel
      runner={runner}
      disabled={state.sim.invalid}
      prefix={
        state.controls.tests.length > 1 ? (
          <select
            value={state.controls.testName}
            onChange={({ target: { value } }) => {
              actions.loadTest(value);
            }}
            data-testid="test-picker"
          >
            {state.controls.tests.map((test) => (
              <option key={test} value={test}>
                {test}
              </option>
            ))}
          </select>
        ) : (
          <></>
        )
      }
      tst={[tst, setTst, state.controls.span]}
      cmp={[cmp, setCmp]}
      out={[out, setOut]}
      setPath={setTstPath}
      speed={state.config.speed}
      onSpeedChange={(speed) => {
        dispatch.current({ action: "updateConfig", payload: { speed } });
      }}
    />
  );

  return (
    <>
      <div className="Page ChipPage grid">
        {hdlPanel}
        {pinsPanel}
        {testPanel}
      </div>
    </>
  );
};

export default Chip;
