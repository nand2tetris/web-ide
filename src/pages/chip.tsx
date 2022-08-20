import { Dispatch, useEffect, useRef, useState } from "react";
import { Trans } from "@lingui/macro";

import "./chip.scss";

import { FullPinout } from "../components/pinout";
import { PROJECTS, PROJECT_NAMES, useChipPageStore } from "./chip.store";
import { DiffTable } from "../components/difftable";
import { Editor } from "../components/editor";
import { HDL } from "../languages/hdl";
import { TST } from "../languages/tst";
import { CMP } from "../languages/cmp";
import { Clockface } from "../components/clockface";
import { Visualizations } from "../components/chips/visualizations";
import { Accordian, Panel } from "../components/shell/panel";
import { Runbar } from "../components/runbar";
import { Timer } from "../simulator/timer";

function useReducerState<T>(init: T): [T, Dispatch<T>] {
  const [state, setState] = useState<T>(init);
  useEffect(() => {
    setState(init);
  }, [init]);
  return [state, setState];
}

export const Chip = () => {
  const { state, actions, dispatch } = useChipPageStore();

  const [hdl, setHdl] = useReducerState(state.files.hdl);
  const [tst, setTst] = useReducerState(state.files.tst);
  const [cmp, setCmp] = useReducerState(state.files.cmp);
  const [out] = useReducerState(state.files.out);

  const saveChip = () => {
    actions.saveChip(hdl);
  };

  const compile = useRef<() => void>();
  compile.current = async () => {
    await actions.updateFiles({ hdl, tst, cmp });
  };

  const runner = useRef<Timer>();
  useEffect(() => {
    runner.current = new (class ChipTimer extends Timer {
      async reset(): Promise<void> {
        await compile.current?.();
        await actions.reset();
      }

      finishFrame(): void {
        dispatch.current({ action: "updateTestStep" });
      }

      async tick(): Promise<void> {
        actions.tick();
      }

      toggle(): void {
        dispatch.current({ action: "updateTestStep" });
      }
    })();

    return () => {
      runner.current?.stop();
    };
  }, [compile, actions, dispatch]);

  const [useBuiltin, setUseBuiltin] = useState(false);
  const toggleUseBuiltin = async () => {
    if (useBuiltin) {
      compile.current?.();
      setUseBuiltin(false);
    } else {
      actions.useBuiltin();
      setUseBuiltin(true);
    }
  };

  const selectors = (
    <>
      <div>
        <Trans>Chip</Trans>
      </div>
      <fieldset role="group">
        <select
          value={state.controls.project}
          onChange={({ target: { value } }) => {
            actions.setProject(value as keyof typeof PROJECTS);
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
          <fieldset role="group">
            <button
              onClick={compile.current}
              onKeyDown={compile.current}
              disabled={useBuiltin}
            >
              <Trans>Eval</Trans>
            </button>
            <button onClick={saveChip} disabled={useBuiltin}>
              <Trans>Save</Trans>
            </button>
            <button
              style={{ whiteSpace: "nowrap" }}
              onClick={() => {
                actions.clock();
              }}
              disabled={!state.sim.clocked}
              data-testid="clock"
            >
              <Clockface />
            </button>
            <button
              onClick={() => {
                actions.reset();
              }}
              disabled={!state.sim.clocked}
              data-testid="clock-reset"
            >
              <Trans>Reset</Trans>
            </button>
          </fieldset>
        </>
      }
    >
      <Editor
        className="flex-1"
        value={hdl}
        onChange={setHdl}
        grammar={HDL.parser}
        language={"hdl"}
        disabled={useBuiltin}
      />
    </Panel>
  );

  const pinsPanel = (
    <Panel className="_parts_panel" header={selectors}>
      <FullPinout
        ins={{
          pins: state.sim.inPins,
          toggle: (pin, i) => {
            actions.toggle(pin, i);
          },
        }}
        outs={{ pins: state.sim.outPins }}
        internal={{ pins: state.sim.internalPins }}
      />
      <Accordian summary={<Trans>Visualizations</Trans>}>
        <main>
          <Visualizations parts={state.sim.parts} />
        </main>
      </Accordian>
    </Panel>
  );
  const testPanel = (
    <Panel className="_test_panel">
      <Accordian
        summary={
          <>
            <div className="flex-1">
              <Trans>Test</Trans>
            </div>
            <div className="flex-2">
              {runner.current && <Runbar runner={runner.current} />}
            </div>
          </>
        }
        style={{ position: "relative" }}
      >
        <Editor
          style={{
            position: "absolute",
            height: "calc(100% - var(--line-height) * var(--font-size) * 2)",
          }}
          value={tst}
          onChange={setTst}
          grammar={TST.parser}
          language={"tst"}
          highlight={state.controls.span}
        />
      </Accordian>
      <Accordian
        summary={<Trans>Comparison</Trans>}
        style={{ position: "relative" }}
      >
        <Editor
          style={{
            position: "absolute",
            height: "calc(100% - var(--line-height) * var(--font-size) * 2)",
          }}
          value={cmp}
          onChange={setCmp}
          grammar={CMP.parser}
          language={"cmp"}
        />
      </Accordian>
      <Accordian summary={<Trans>Diff</Trans>} open={true}>
        <div style={{ paddingLeft: "var(--block-spacing-horizontal)" }}>
          <DiffTable cmp={cmp} out={out} />
        </div>
      </Accordian>
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
