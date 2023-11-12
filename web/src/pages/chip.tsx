import { Trans } from "@lingui/macro";
import {
  CSSProperties,
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
import { DiffTable } from "@nand2tetris/components/difftable.js";
import {
  FullPinout,
  PinContext,
  PinResetDispatcher,
} from "@nand2tetris/components/pinout.js";
import { useStateInitializer } from "@nand2tetris/components/react.js";
import { Runbar } from "@nand2tetris/components/runbar.js";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import {
  Files,
  PROJECT_NAMES,
  isBuiltinOnly,
  useChipPageStore,
} from "@nand2tetris/components/stores/chip.store.js";
import { CHIP_PROJECTS } from "@nand2tetris/projects/index.js";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";
import { HDL } from "@nand2tetris/simulator/languages/hdl.js";
import { TST } from "@nand2tetris/simulator/languages/tst.js";
import { Timer } from "@nand2tetris/simulator/timer.js";
import { AppContext } from "../App.context";
import { Icon } from "../pico/icon";
import { Editor } from "../shell/editor";
import { Accordian, Panel } from "../shell/panel";

export const Chip = () => {
  const { fs, setStatus } = useContext(BaseContext);
  const { filePicker, tracking } = useContext(AppContext);
  const { state, actions, dispatch } = useChipPageStore();

  const [hdl, setHdl] = useStateInitializer(state.files.hdl);
  const [tst, setTst] = useStateInitializer(state.files.tst);
  const [cmp, setCmp] = useStateInitializer(state.files.cmp);
  const [out] = useStateInitializer(state.files.out);

  useEffect(() => {
    actions.initialize();
  }, [actions]);

  useEffect(() => {
    tracking.trackPage("/chip");
  }, [tracking]);

  const saveChip = () => {
    actions.saveChip(hdl);
  };

  useEffect(() => {
    tracking.trackEvent("action", "setProject", state.controls.project);
    tracking.trackEvent("action", "setChip", state.controls.chipName);
  }, []);

  const setProject = useCallback(
    (project: keyof typeof CHIP_PROJECTS) => {
      actions.setProject(project);
      tracking.trackEvent("action", "setProject", project);
    },
    [actions, tracking]
  );

  const setChip = useCallback(
    (chip: string) => {
      actions.setChip(chip);
      tracking.trackEvent("action", "setChip", chip);
      pinResetDispatcher.reset();
    },
    [actions, tracking]
  );

  const doEval = useCallback(() => {
    actions.eval();
    tracking.trackEvent("action", "eval");
  }, [actions, tracking]);

  const compile = useRef<(files?: Partial<Files>) => void>(() => undefined);
  compile.current = async (files: Partial<Files> = {}) => {
    await actions.updateFiles({
      hdl: files.hdl,
      tst: files.tst ?? tst,
      cmp: files.cmp ?? cmp,
    });
  };

  const loadTest = useCallback(async () => {
    try {
      const path = await filePicker.select();
      const tst = await fs.readFile(path);
      await compile.current({ tst });
    } catch (e) {
      console.error(e);
      setStatus(`Failed to load into memory`);
    }
  }, [filePicker, setStatus, fs, compile]);

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

      tick(): boolean {
        return actions.stepTest();
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
    [actions]
  );

  const [useBuiltin, setUseBuiltin] = useState(false);
  const toggleUseBuiltin = () => {
    if (useBuiltin) {
      setUseBuiltin(false);
      actions.useBuiltin(false);
    } else {
      setUseBuiltin(true);
      actions.useBuiltin(true, hdl);
    }
    pinResetDispatcher.reset();
  };

  const selectors = (
    <>
      <fieldset role="group">
        <select
          value={state.controls.project}
          onChange={({ target: { value } }) => {
            setProject(value as keyof typeof CHIP_PROJECTS);
          }}
          data-testid="project-picker"
        >
          {PROJECT_NAMES.map(([number, label]) => (
            <option key={number} value={number}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={state.controls.chipName}
          onChange={({ target: { value } }) => {
            setChip(value);
          }}
          data-testid="chip-picker"
        >
          {state.controls.chips.map((chip) => (
            <option
              key={chip}
              value={chip}
              style={isBuiltinOnly(chip) ? { color: "rgb(170, 170, 170)" } : {}}
            >
              {`${chip} ${isBuiltinOnly(chip) ? "(given)" : ""}`}
            </option>
          ))}
        </select>
        <button className="flex-0" onClick={saveChip} disabled={useBuiltin}>
          <Trans>Save</Trans>
        </button>
      </fieldset>
    </>
  );
  const hdlPanel = (
    <Panel
      className="_hdl_panel"
      header={
        <>
          <div tabIndex={0}>HDL</div>
          <fieldset>
            {state.controls.hasBuiltin && !state.controls.builtinOnly && (
              <label>
                <input
                  type="checkbox"
                  role="switch"
                  checked={useBuiltin}
                  onChange={toggleUseBuiltin}
                />
                <Trans>Builtin</Trans>
              </label>
            )}
          </fieldset>
          {selectors}
        </>
      }
    >
      <Editor
        className="flex-1"
        value={hdl}
        onChange={(source) => {
          setHdl(source);
          compile.current(
            useBuiltin || state.controls.builtinOnly ? {} : { hdl: source }
          );
        }}
        grammar={HDL.parser}
        language={"hdl"}
        disabled={useBuiltin || state.controls.builtinOnly}
      />
    </Panel>
  );

  const [inputValid, setInputValid] = useState(true);

  const chipButtons = (
    <fieldset role="group">
      <button
        onClick={doEval}
        onKeyDown={doEval}
        disabled={!state.sim.pending || !inputValid}
      >
        <Trans>Eval</Trans>
      </button>
      <button
        onClick={clockActions.toggle}
        style={{ maxWidth: "initial" }}
        disabled={!state.sim.clocked}
      >
        <Trans>Clock</Trans>:{"\u00a0"}
        <Clockface />
      </button>
      <button
        onClick={clockActions.reset}
        style={{ maxWidth: "initial" }}
        disabled={!state.sim.clocked}
      >
        <Trans>Reset</Trans>
      </button>
    </fieldset>
  );

  const visualizations: [string, ReactNode][] = makeVisualizationsWithId(
    {
      parts: state.sim.chip,
    },
    () => {
      dispatch.current({ action: "updateChip" });
    }
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
        <Trans>Syntax errors in the HDL code</Trans>
      ) : (
        <>
          <PinContext.Provider value={pinResetDispatcher}>
            <FullPinout
              sim={state.sim}
              toggle={actions.toggle}
              setInputValid={setInputValid}
              hideInternal={state.controls.builtinOnly || useBuiltin}
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

  const [selectedTestTab, doSetSelectedTestTab] = useState<
    "tst" | "cmp" | "out"
  >("tst");

  const setSelectedTestTab = useCallback(
    (tab: typeof selectedTestTab) => {
      doSetSelectedTestTab(tab);
      tracking.trackEvent("tab", "change", tab);
    },
    [tracking]
  );

  const testPanel = (
    <Panel
      className="_test_panel"
      header={
        <>
          <div className="flex-1">
            <Trans>Test</Trans>
          </div>
          <div className="flex-2">
            {runner.current && <Runbar runner={runner.current} />}
          </div>
          <div>
            <button onClick={loadTest}>
              <Icon name="upload_file" />{" "}
            </button>
          </div>
        </>
      }
    >
      <div role="tablist" style={{ "--tab-count": "3" } as CSSProperties}>
        <div
          role="tab"
          id="test-tab-tst"
          aria-controls="test-tabpanel-tst"
          aria-selected={selectedTestTab === "tst"}
        >
          <label>
            <input
              type="radio"
              name="test-tabs"
              aria-controls="test-tabpanel-tst"
              value="tst"
              checked={selectedTestTab === "tst"}
              onChange={() => setSelectedTestTab("tst")}
            />
            Test Script
          </label>
        </div>
        <div
          role="tabpanel"
          aria-labelledby="test-tab-tst"
          id="test-tabpanel-tst"
        >
          <Editor
            value={tst}
            onChange={setTst}
            grammar={TST.parser}
            language={"tst"}
            highlight={state.controls.span}
            disabled={state.controls.builtinOnly}
          />
        </div>
        <div
          role="tab"
          id="test-tab-cmp"
          aria-controls="test-tablpanel-cmp"
          aria-selected={selectedTestTab === "cmp"}
        >
          <label>
            <input
              type="radio"
              name="test-tabs"
              aria-controls="test-tabpanel-cmp"
              value="cmp"
              checked={selectedTestTab === "cmp"}
              onChange={() => setSelectedTestTab("cmp")}
            />
            Compare File
          </label>
        </div>
        <div
          role="tabpanel"
          aria-labelledby="test-tab-cmp"
          id="test-tabpanel-cmp"
          style={{ position: "relative" }}
        >
          <Editor
            value={cmp}
            onChange={setCmp}
            grammar={CMP.parser}
            language={"cmp"}
            disabled={state.controls.builtinOnly}
          />
        </div>
        <div
          role="tab"
          id="test-tab-out"
          aria-controls="test-tabpanel-out"
          aria-selected={selectedTestTab === "out"}
        >
          <label>
            <input
              type="radio"
              name="test-tabs"
              aria-controls="test-tabpanel-out"
              value="out"
              checked={selectedTestTab === "out"}
              onChange={() => setSelectedTestTab("out")}
            />
            Output File
          </label>
        </div>
        <div
          role="tabpanel"
          id="test-tabpanel-out"
          aria-labelledby="test-tab-out"
        >
          <DiffTable cmp={cmp} out={out} />
        </div>
      </div>
    </Panel>
  );

  return (
    <div className="ChipPage grid">
      {hdlPanel}
      {pinsPanel}
      {testPanel}
    </div>
  );
};

export default Chip;
