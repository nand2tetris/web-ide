import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Trans } from "@lingui/macro";

import "./chip.scss";

import { FullPinout } from "../components/pinout";
import { Files, PROJECT_NAMES, useChipPageStore } from "./chip.store";
import { DiffTable } from "../components/difftable";
import { Editor } from "../components/editor";
import { HDL } from "../../languages/hdl";
import { TST } from "../../languages/tst";
import { CMP } from "../../languages/cmp";
import { Accordian, Panel } from "../components/shell/panel";
import { Runbar } from "../components/runbar";
import { Timer } from "../../simulator/timer";
import { useStateInitializer } from "../util/react";
import { Clockface } from "../components/clockface";
import { PROJECTS } from "../../projects";

export const Chip = () => {
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

  const runner = useRef<Timer>();
  useEffect(() => {
    runner.current = new (class ChipTimer extends Timer {
      async reset(): Promise<void> {
        await compile.current();
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

  // const visualizations = <Visualizations parts={state.sim.parts} />;

  const visualizations: [string, ReactNode][] = [...state.sim.parts].flatMap(
    (part) =>
      part.render().map((v, i) => [`${part.id}_${i}`, v] as [string, ReactNode])
  );

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
        summary={<Trans>Compare File</Trans>}
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
      <Accordian summary={<Trans>Output File</Trans>} open={true}>
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
