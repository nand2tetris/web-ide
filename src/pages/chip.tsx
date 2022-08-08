import { useContext, useEffect, useState } from "react";
import { Trans } from "@lingui/macro";

import "./chip.scss";

import { Pinout, ImmPin } from "../components/pinout";
import { ChipPageStore, PROJECTS, PROJECT_NAMES } from "./chip.store";
import { StorageContext } from "../util/storage";
import { Subscription } from "rxjs";
import { Pins } from "../simulator/chip/chip";
import { AppContext } from "../App.context";
import { DiffTable } from "../components/difftable";
import { Clock } from "../simulator/chip/clock";
import { Editor } from "../components/editor";
import { HDL } from "../languages/hdl";
import { TST } from "../languages/tst";
import { CMP } from "../languages/cmp";
import { Clockface } from "../components/clockface";
import { Visualizations } from "../components/chips/visualizations";

let store = new ChipPageStore();
const clock = Clock.get();

function reducePins(pins: Pins): ImmPin[] {
  return [...pins.entries()].map((pin) => ({ pin }));
}

export const Chip = () => {
  const fs = useContext(StorageContext);
  const { setStatus } = useContext(AppContext);

  useEffect(() => {
    store = new ChipPageStore(fs, localStorage, setStatus);

    const subs: Subscription[] = [];

    subs.push(
      store.selectors.chip.subscribe((chip) => {
        setClocked(chip.clocked);
        setParts(new Set(chip.parts));
        setInPins(reducePins(chip.ins));
        setOutPins(reducePins(chip.outs));
        setInternalPins(reducePins(chip.pins));
      })
    );

    subs.push(
      store.selectors.project.subscribe((project) => {
        setProject(project);
        setChips(PROJECTS[project]);
        setChip(PROJECTS[project][0]);
      })
    );
    subs.push(
      store.selectors.chipName.subscribe((chip) => {
        setChip(chip);
      })
    );
    subs.push(
      store.selectors.files.subscribe(({ hdl, tst, cmp, out }) => {
        setHdlText(hdl);
        setTstText(tst);
        setCmpText(cmp);
        setOutText(out);
        setHdlFile(hdl);
        setTstFile(tst);
        setCmpFile(cmp);
      })
    );
    subs.push(
      store.selectors.log.subscribe((out) => {
        setOutText(out);
      })
    );

    return () => {
      for (const sub of subs) {
        sub.unsubscribe();
      }
    };
  }, [fs, setStatus]);

  const [project, setProject] = useState(store.project);
  const [chips, setChips] = useState<string[]>(PROJECTS[store.project]);
  const [chip, setChip] = useState(store.chip.name ?? "");
  const [clocked, setClocked] = useState(store.chip.clocked);
  const [inPins, setInPins] = useState(reducePins(store.chip.ins));
  const [outPins, setOutPins] = useState(reducePins(store.chip.outs));
  const [internalPins, setInternalPins] = useState(reducePins(store.chip.pins));
  const [parts, setParts] = useState(store.chip.parts);

  const [cmpText, setCmpText] = useState(store.files.cmp);
  const [hdlText, setHdlText] = useState(store.files.hdl);
  const [outText, setOutText] = useState(store.files.out);
  const [tstText, setTstText] = useState(store.files.tst);

  const [cmpFile, setCmpFile] = useState(store.files.cmp);
  const [hdlFile, setHdlFile] = useState(store.files.hdl);
  const [tstFile, setTstFile] = useState(store.files.tst);

  function clearOutput() {
    setOutText("");
  }

  const onSaveChip = () => {
    store.saveChip(hdlText);
  };

  async function setFiles() {
    const hdl = hdlFile;
    const tst = tstFile;
    const cmp = cmpFile;
    clearOutput();
    await store.setFiles({ hdl, tst, cmp });
  }

  async function compile() {
    await setFiles();
    await store.compileChip();
  }

  async function execute() {
    await setFiles();
    await store.compileChip();
    await store.runTest();
  }

  /* Layout:
    [Project] [Chip]  +------+
    +--------+--------+ Test +
    |   HDL  | InPins |      |
    |        +--------|      |
    |        | OutPin |      |
    +--------+--------+------+
    |Internal|  Vis   |  Out |
    |        |        +------+
    |        |        | Diffs|
    +--------+--------+------+
  */
  const selectors = (
    <div className="_selectors flex row inline align-end">
      <select
        value={project}
        onChange={({ target: { value } }) => {
          store.setProject(value as keyof typeof PROJECTS);
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
        value={chip}
        onChange={({ target: { value } }) => store.setChip(value)}
        data-testid="chip-picker"
      >
        {chips.map((chip) => (
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
        {/* <fieldset className="button-group"> */}
        <fieldset role="group">
          <button onClick={compile} onKeyDown={compile}>
            <Trans>Eval</Trans>
          </button>
          <button onClick={onSaveChip} onKeyDown={onSaveChip}>
            <Trans>Save</Trans>
          </button>
          <button
            style={{ whiteSpace: "nowrap" }}
            onClick={() => {
              clock.toggle();
            }}
            disabled={!clocked}
            data-testid="clock"
          >
            <Clockface />
          </button>
          <button
            onClick={() => store.reset()}
            disabled={!clocked}
            data-testid="clock-reset"
          >
            <Trans>Reset</Trans>
          </button>
        </fieldset>
      </header>
      <main className="flex">
        <Editor
          className="flex-1"
          value={hdlText}
          onChange={setHdlFile}
          grammar={HDL.parser}
          language={"hdl"}
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
        pins={inPins}
        toggle={(pin, i) => store.toggle(pin, i)}
        allowIncrement={(pin) => pin.width > 1}
      />
    </article>
  );
  const outputPanel = (
    <article className="_output_panel no-shadow panel">
      <header tabIndex={0}>
        <Trans>Output pins</Trans>
      </header>
      <Pinout pins={outPins} />
    </article>
  );
  const internalPanel = (
    <article className="_internal_panel no-shadow panel">
      <header tabIndex={0}>
        <Trans>Internal pins</Trans>
      </header>
      <Pinout pins={internalPins} />
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
          value={tstText}
          onChange={setTstFile}
          grammar={TST.parser}
          language={"tst"}
        />
        <Editor
          className="flex-1"
          value={cmpText}
          onChange={setCmpFile}
          grammar={CMP.parser}
          language={"cmp"}
        />
        <DiffTable className="flex-1" cmp={cmpText} out={outText} />
      </main>
    </article>
  );
  const visualizationPanel = (
    <article className="_visualization_panel no-shadow panel">
      <header>
        <Trans>Visualizations</Trans>
      </header>
      <main>
        <Visualizations parts={parts} />
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
