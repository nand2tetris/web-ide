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
import { Trans } from "@lingui/macro";

import "./chip.scss";

import { FullPinout } from "../components/pinout";
import { Files, PROJECT_NAMES, useChipPageStore } from "./chip.store";
import { DiffTable } from "../components/difftable";
import { Editor } from "../components/editor";
import { HDL } from "@computron5k/simulator/languages/hdl";
import { TST } from "@computron5k/simulator/languages/tst";
import { CMP } from "@computron5k/simulator/languages/cmp";
import { Accordian, Panel } from "../components/shell/panel";
import { Runbar } from "../components/runbar";
import { Timer } from "@computron5k/simulator/timer";
import { useStateInitializer } from "../util/react";
import { Clockface } from "../components/clockface";
import { CHIP_PROJECTS } from "@computron5k/simulator/projects/index";
import { Icon } from "../components/pico/icon";
import { AppContext } from "../App.context";
import { makeVisualizationsWithId } from "../components/chips/visualizations";

export const Chip = () => {
  const { filePicker, fs, setStatus } = useContext(AppContext);
  const { state, actions, dispatch } = useChipPageStore();

  const [hdl, setHdl] = useStateInitializer(state.files.hdl);
  const [tst, setTst] = useStateInitializer(state.files.tst);
  const [cmp, setCmp] = useStateInitializer(state.files.cmp);
  const [out] = useStateInitializer(state.files.out);

  const saveChip = () => {
    actions.saveChip(hdl);
  };

  const compile = useRef<(files?: Partial<Files>) => void>(() => {});
  compile.current = async (files: Partial<Files> = {}) => {
    await actions.updateFiles({
      hdl: files.hdl ?? hdl,
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

      async tick(): Promise<boolean> {
        return actions.tick();
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
      },
      reset() {
        actions.reset();
      },
    }),
    [actions]
  );

  const [useBuiltin, setUseBuiltin] = useState(false);
  const toggleUseBuiltin = async () => {
    if (useBuiltin) {
      compile.current();
      setUseBuiltin(false);
    } else {
      actions.useBuiltin();
      setUseBuiltin(true);
    }
  };

  const selectors = (
    <>
      <fieldset role="group">
        <select
          value={state.controls.project}
          onChange={({ target: { value } }) => {
            actions.setProject(value as keyof typeof CHIP_PROJECTS);
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
            actions.setChip(value);
          }}
          data-testid="chip-picker"
        >
          {state.controls.chips.map((chip) => (
            <option key={chip} value={chip}>
              {chip}
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
            {state.controls.hasBuiltin && (
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
          compile.current({ hdl: source });
        }}
        grammar={HDL.parser}
        language={"hdl"}
        disabled={useBuiltin}
      />
    </Panel>
  );

  const chipButtons = (
    <fieldset role="group">
      <button
        onClick={actions.eval}
        onKeyDown={actions.eval}
        disabled={!state.sim.pending}
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

  const visualizations: [string, ReactNode][] = makeVisualizationsWithId({
    parts: [...state.sim.parts],
  });

  const pinsPanel = (
    <Panel
      className="_parts_panel"
      header={
        <>
          <div>
            <Trans>Chip</Trans>
          </div>
          {chipButtons}
        </>
      }
    >
      {state.sim.invalid ? (
        <Trans>Invalid Chip</Trans>
      ) : (
        <>
          <FullPinout sim={state.sim} toggle={actions.toggle} />
          {visualizations.length > 0 && (
            <Accordian summary={<Trans>Visualizations</Trans>} open={true}>
              <main>
                {visualizations.map(([p, v]) => (
                  <div key={p}>{v}</div>
                ))}
              </main>
            </Accordian>
          )}
        </>
      )}
    </Panel>
  );

  const [selectedTestTab, setSelectedTestTab] = useState<"tst" | "cmp" | "out">(
    "tst"
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