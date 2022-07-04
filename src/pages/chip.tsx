import {
  compileFStyle,
  FStyle,
} from "@davidsouther/jiffies/lib/esm/dom/css/fstyle";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { retrieve } from "@davidsouther/jiffies/lib/esm/dom/provide";
import { Pinout } from "../components/pinout";
import { DiffPanel } from "../components/diff";
import { useState } from "react";
import { ChipPageStore, PROJECTS } from "./chip.store";
import { unwrap } from "@davidsouther/jiffies/lib/esm/result";
import { Diff } from "../simulator/compare";

const ProjectDropdown = ({
  selected,
  setProject,
}: {
  selected: keyof typeof PROJECTS;
  setProject: (p: keyof typeof PROJECTS) => void;
}) => (
  <select
    style={{
      display: "inline-block",
    }}
    onChange={(e) => {
      if (e.target) {
        setProject(e.target.value as keyof typeof PROJECTS);
      }
    }}
  >
    {[
      ["01", "Project 1"],
      ["02", "Project 2"],
      ["03", "Project 3"],
      ["05", "Project 5"],
    ].map(([number, label]) => (
      <option key={number} value={number} selected={number === selected}>
        {label}
      </option>
    ))}
  </select>
);

const ChipsDropdown = ({
  selected,
  chips,
  setChip,
}: {
  selected: string;
  chips: string[];
  setChip: (chip: string) => void;
}) => (
  <select
    style={{
      display: "inline-block",
    }}
    onChange={(event) => setChip((event.target as HTMLSelectElement)?.value)}
  >
    {chips.map((chip) => (
      <option key={chip} value={chip} selected={selected === chip}>
        {chip}
      </option>
    ))}
  </select>
);

export const Chip = () => {
  const fs = unwrap(retrieve<FileSystem>("fs"));
  const state = new ChipPageStore(localStorage, fs);

  const [project, setProject] = useState(state.project);
  const [chips, setChips] = useState<string[]>([]);
  const [chip, setChip] = useState(state.chip.name ?? "");
  const projectDropdown = (
    <ProjectDropdown
      selected={project}
      setProject={(p) => state.setProject(p)}
    ></ProjectDropdown>
  );
  const chipsDropdown = (
    <ChipsDropdown
      chips={chips}
      selected={chip}
      setChip={(c) => state.setChip(c)}
    ></ChipsDropdown>
  );

  const [inPins, setInPins] = useState(state.chip.ins);
  const [clocked, setClocked] = useState(state.chip.clocked);
  const [outPins, setOutPins] = useState(state.chip.outs);
  const [internalPins, setInternalPins] = useState(state.chip.pins);

  const inPinout = (
    <Pinout
      pins={inPins}
      clocked={clocked}
      toggle={(pin) => state.toggle(pin)}
    />
  );
  const outPinout = <Pinout pins={outPins} />;
  const pinsPinout = <Pinout pins={internalPins} />;

  const [hdlText, setHdlText] = useState("");
  const [cmpText, setCmpText] = useState("");
  const [tstText, setTstText] = useState("");
  const [outText, setOutText] = useState("");

  const hdlTextarea = (
    <textarea
      className="font-monospace flex-1"
      rows={10}
      onChange={(e) => setHdlText(e.target.value)}
    >
      {hdlText}
    </textarea>
  );
  const tstTextarea = (
    <textarea
      className="font-monospace flex-2"
      rows={15}
      onChange={(e) => setTstText(e.target.value)}
    >
      {tstText}
    </textarea>
  );
  const cmpTextarea = (
    <textarea
      className="font-monospace flex-1"
      rows={5}
      onChange={(e) => setCmpText(e.target.value)}
    >
      {cmpText}
    </textarea>
  );
  const outTextarea = (
    <textarea className="font-monospace flex-1" rows={5} readOnly={true}>
      {outText}
    </textarea>
  );

  const [diffs, setDiffs] = useState<Diff[]>([]);
  const [ran, setRan] = useState(false);
  const diffPanel = <DiffPanel diffs={diffs} ran={ran}></DiffPanel>;

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

  state.subject.subscribe(setState);
  state.selectors.project.subscribe((project) => {
    setProject(project);
    setChips(PROJECTS[project]);
    setChip(PROJECTS[project][0]);
  });
  state.selectors.chipName.subscribe((chip) => {
    setChip(PROJECTS[project][0]);
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

  const fstyle: FStyle = {
    ".View__Chip": {
      "> section": {
        grid: "auto / 2fr 1fr",
        "> .pinouts": {
          grid: "min-content repeat(2, minmax(200px, 1fr)) / 1fr 1fr",
          h2: { margin: "0 var(--nav-element-spacing-horizontal)" },
        },
      },
    },
    "@media (max-width: 992px)": {
      ".View__Chip > section": {
        display: "flex",
        flexDirection: "column",
      },
    },
    "@media (max-width: 576px)": {
      ".View__Chip > section > .pinouts": {
        display: "flex",
        flexDirection: "column",
        "> h2": { order: "0" },
        "> article:not(nth-of-type(3))": { order: "1" },
        "> article:nth-of-type(3)": { order: "2" },
      },
    },
  };

  return (
    <div className="View__Chip flex-1 flex">
      <style>{compileFStyle(fstyle)}</style>
      <section className="flex-1 grid">
        <div className="pinouts grid">
          <div
            className="flex row inline align-end"
            style={{ gridColumn: "1 / span 2" }}
          >
            {projectDropdown}
            <h2 tabIndex={0}>Chips:</h2>
            {chipsDropdown}
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
            <main className="flex">{hdlTextarea}</main>
            <article className="no-shadow panel">
              <header tabIndex={0}>Input pins</header>
              {inPinout}
            </article>
            <article className="no-shadow panel">
              <header tabIndex={0}>Internal Pins</header>
              {pinsPinout}
            </article>
            <article className="no-shadow panel">
              <header tabIndex={0}>"Output pins"</header>
              {outPinout}
            </article>
          </article>
          <article>
            <header>
              <div tabIndex={0}>Test</div>
              <fieldset className="input-group">
                <button onClick={execute}>Execute</button>
              </fieldset>
            </header>
            {tstTextarea}
            {cmpTextarea}
            {outTextarea}
            {diffPanel}
          </article>
        </div>
      </section>
    </div>
  );
};

export default Chip;
