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

function useReducerState<T>(init: T): [T, Dispatch<T>] {
  const [state, setState] = useState<T>(init);
  useEffect(() => {
    setState(init);
  }, [init]);
  return [state, setState];
}

export const Chip = () => {
  const [state, _dispatch, actions] = useChipPageStore();

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

  const execute = async () => {
    if (!useBuiltin) {
      await compile();
    }
    actions.runTest();
  };

  const selectors = (
    <div className="_selectors flex row inline align-end">
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
      <h2 tabIndex={0}>
        <Trans>Chips:</Trans>
      </h2>
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
    </div>
  );
  const hdlPanel = (
    <article className="_hdl_panel no-shadow panel">
      <header>
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
      </header>
      <main className="flex">
        <Editor
          className="flex-1"
          value={hdl}
          onChange={setHdl}
          grammar={HDL.parser}
          language={"hdl"}
          disabled={useBuiltin}
        />
      </main>
    </article>
  );
  const inputPanel = (
    <article className="_input_panel no-shadow panel">
      <header tabIndex={0}>
        <Trans>Input pins</Trans>
      </header>
      <Pinout
        pins={state.sim.inPins}
        toggle={(pin, i) => {
          actions.toggle(pin, i);
        }}
        allowIncrement={(pin) => pin.width > 1}
      />
    </article>
  );
  const outputPanel = (
    <article className="_output_panel no-shadow panel">
      <header tabIndex={0}>
        <Trans>Output pins</Trans>
      </header>
      <Pinout pins={state.sim.outPins} />
    </article>
  );
  const internalPanel = (
    <article className="_internal_panel no-shadow panel">
      <header>
        <div tabIndex={0}>
          <Trans>Internal pins</Trans>
        </div>
        <fieldset role="group"></fieldset>
      </header>
      <Pinout pins={state.sim.internalPins} />
    </article>
  );
  const testPanel = (
    <article className="_test_panel">
      <header>
        <div tabIndex={0}>
          <Trans>Test</Trans>
        </div>
        <fieldset role="group">
          <button onClick={execute}>
            <Trans>Execute</Trans>
          </button>
        </fieldset>
      </header>
      <main className="flex">
        <Editor
          className="flex-2"
          value={tst}
          onChange={setTst}
          grammar={TST.parser}
          language={"tst"}
        />
        <Editor
          className="flex-1"
          value={cmp}
          onChange={setCmp}
          grammar={CMP.parser}
          language={"cmp"}
        />
        <DiffTable className="flex-1" cmp={cmp} out={out} />
      </main>
    </article>
  );
  const visualizationPanel = (
    <article className="_visualization_panel no-shadow panel">
      <header>
        <Trans>Visualizations</Trans>
      </header>
      <main>
        <Visualizations parts={state.sim.parts} />
      </main>
    </article>
  );

  return (
    <div className="ChipPage flex-1 grid">
      {selectors}
      {hdlPanel}
      {inputPanel}
      {outputPanel}
      {internalPanel}
      {visualizationPanel}
      {testPanel}
    </div>
  );
};

export default Chip;
