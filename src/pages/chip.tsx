import { useContext, useState } from "react";

import "./chip.scss";

import { Pinout } from "../components/pinout";
import { DiffPanel } from "../components/diff";
import { ChipPageStore, PROJECTS, PROJECT_NAMES } from "./chip.store";
import { Diff } from "../simulator/compare";
import { StorageContext } from "../util/storage";
import { StatusLineContext } from "../components/shell/statusline";

export const Chip = () => {
  const fs = useContext(StorageContext);
  const state = new ChipPageStore(
    localStorage,
    fs,
    useContext(StatusLineContext).setStatus
  );

  const [project, setProject] = useState(state.project);
  const [chips, setChips] = useState<string[]>(PROJECTS[state.project]);
  const [chip, setChip] = useState(state.chip.name ?? "");
  const [clocked, setClocked] = useState(state.chip.clocked);
  const [inPins, setInPins] = useState(state.chip.ins);
  const [outPins, setOutPins] = useState(state.chip.outs);
  const [internalPins, setInternalPins] = useState(state.chip.pins);

  const [hdlText, setHdlText] = useState("");
  const [cmpText, setCmpText] = useState("");
  const [tstText, setTstText] = useState("");
  const [outText, setOutText] = useState("");

  const [diffs, setDiffs] = useState<Diff[]>([]);
  const [ran, setRan] = useState(false);

  state.subject.subscribe(setState);
  state.selectors.project.subscribe((project) => {
    setProject(project);
    setChips(PROJECTS[project]);
    setChip(PROJECTS[project][0]);
  });
  state.selectors.chipName.subscribe((chip) => {
    setChip(chip);
  });
  state.selectors.diffs.subscribe((diffs) => {
    setDiffs(diffs);
    setRan(true);
  });
  state.selectors.files.subscribe(({ hdl, tst, cmp, out }) => {
    setHdlText(hdl);
    setTstText(tst);
    setCmpText(cmp);
    setOutText(out);
  });
  state.selectors.log.subscribe((out) => {
    setOutText(out);
  });

  const onSaveChip = () => {
    state.saveChip(hdlText);
  };

  function setState() {
    setInPins(state.chip.ins);
    setClocked(state.chip.clocked);
    setOutPins(state.chip.outs);
    setInternalPins(state.chip.pins);
  }

  function clearOutput() {
    setOutText("");
    setRan(false);
  }

  function compile() {
    state.compileChip(hdlText);
  }

  async function execute() {
    const hdl = hdlText;
    const tst = tstText;
    const cmp = cmpText;
    clearOutput();
    await state.compileChip(hdl);
    await state.runTest(tst, cmp);
  }

  return (
    <div className="ChipPage flex-1 flex">
      <section className="flex-1 grid">
        <div className="pinouts grid">
          <div
            className="flex row inline align-end"
            style={{ gridColumn: "1 / span 2" }}
          >
            <select
              value={project}
              onChange={({ target: { value } }) => {
                state.setProject(value as keyof typeof PROJECTS);
              }}
            >
              {PROJECT_NAMES.map(([number, label]) => (
                <option key={number} value={number}>
                  {label}
                </option>
              ))}
            </select>
            <h2 tabIndex={0}>Chips:</h2>
            <select
              value={chip}
              onChange={({ target: { value } }) => state.setChip(value)}
            >
              {chips.map((chip) => (
                <option key={chip} value={chip}>
                  {chip}
                </option>
              ))}
            </select>
          </div>
          <article className="no-shadow panel">
            <header>
              <div tabIndex={0}>HDL</div>
              <fieldset className="button-group">
                <button onClick={compile} onKeyDown={compile}>
                  Eval
                </button>
                <button onClick={onSaveChip} onKeyDown={onSaveChip}>
                  Save
                </button>
              </fieldset>
            </header>
            <main className="flex">
              <textarea
                className="flex-1"
                rows={10}
                onChange={(e) => setHdlText(e.target.value)}
                value={hdlText}
              />
            </main>
          </article>
          <article className="no-shadow panel">
            <header tabIndex={0}>Input pins</header>
            <Pinout
              pins={inPins}
              clocked={clocked}
              toggle={(pin) => state.toggle(pin)}
            />
          </article>
          <article className="no-shadow panel">
            <header tabIndex={0}>Internal Pins</header>
            <Pinout pins={internalPins} />
          </article>
          <article className="no-shadow panel">
            <header tabIndex={0}>Output pins</header>
            <Pinout pins={outPins} />
          </article>
        </div>
        <article>
          <header>
            <div tabIndex={0}>Test</div>
            <fieldset className="input-group">
              <button onClick={execute}>Execute</button>
            </fieldset>
          </header>
          <textarea
            className="flex-2"
            rows={15}
            onChange={(e) => setTstText(e.target.value)}
            value={tstText}
          />
          <textarea
            className="flex-1"
            rows={5}
            onChange={(e) => setCmpText(e.target.value)}
            value={cmpText}
          />
          <textarea
            className="flex-1"
            rows={5}
            readOnly={true}
            value={outText}
          />
          <DiffPanel diffs={diffs} ran={ran} />
        </article>
      </section>
    </div>
  );
};

export default Chip;
