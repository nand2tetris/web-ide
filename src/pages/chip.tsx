import { Dispatch, useEffect, useState } from "react";
import { Trans } from "@lingui/macro";

import "./chip.scss";

import { Pinout } from "../components/pinout";
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

function useReducerState<T>(init: T): [T, Dispatch<T>] {
  const [state, setState] = useState<T>(init);
  useEffect(() => {
    setState(init);
  }, [init]);
  return [state, setState];
}

export const Chip = () => {
  const { state, actions, runner } = useChipPageStore();

  const [hdl, setHdl] = useReducerState(state.files.hdl);
  const [tst, setTst] = useReducerState(state.files.tst);
  const [cmp, setCmp] = useReducerState(state.files.cmp);
  const [out] = useReducerState(state.files.out);

  const saveChip = () => {
    actions.saveChip(hdl);
  };

  const compile = async () => {
    actions.updateFiles({ hdl, tst, cmp });
  };

  const [useBuiltin, setUseBuiltin] = useState(false);
  const toggleUseBuiltin = async () => {
    if (useBuiltin) {
      compile();
      setUseBuiltin(false);
    } else {
      actions.useBuiltin();
      setUseBuiltin(true);
    }
  };

  const selectors = (
    <>
      <div>
        <Trans>Chips:</Trans>
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
            <button onClick={compile} onKeyDown={compile} disabled={useBuiltin}>
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
      <Accordian summary={<Trans>Input pins</Trans>} open={true}>
        <Pinout
          pins={state.sim.inPins}
          toggle={(pin, i) => {
            actions.toggle(pin, i);
          }}
          allowIncrement={(pin) => pin.width > 1}
        />
      </Accordian>
      <Accordian summary={<Trans>Output pins</Trans>} open={true}>
        <Pinout pins={state.sim.outPins} />
      </Accordian>
      <Accordian summary={<Trans>Internal pins</Trans>}>
        <Pinout pins={state.sim.internalPins} />
      </Accordian>
      <Accordian summary={<Trans>Visualizations</Trans>}>
        <main>
          <Visualizations parts={state.sim.parts} />
        </main>
      </Accordian>
    </Panel>
  );
  const testPanel = (
    <Panel
      className="_test_panel"
      header={
        <>
          <div>
            <Trans>Test</Trans>
          </div>
          <div className="flex-1">
            <Runbar runner={runner} />
          </div>
        </>
      }
    >
      <Editor
        className="flex-2"
        value={tst}
        onChange={setTst}
        grammar={TST.parser}
        language={"tst"}
      />
      <Accordian summary={<Trans>Comparison</Trans>}>
        <Editor
          className="flex-1"
          value={cmp}
          onChange={setCmp}
          grammar={CMP.parser}
          language={"cmp"}
        />
      </Accordian>
      <Accordian summary={<Trans>Diff</Trans>} open={true}>
        <div style={{ paddingLeft: "var(--block-spacing-horizontal)" }}>
          <DiffTable className="flex-1" cmp={cmp} out={out} />
        </div>
      </Accordian>
    </Panel>
  );

  return (
    <div className="ChipPage flex-1 grid">
      {hdlPanel}
      {pinsPanel}
      {testPanel}
    </div>
  );
};

export default Chip;
