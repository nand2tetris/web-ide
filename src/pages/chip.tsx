import { useContext, useEffect, useState } from "react";
import { Trans } from "@lingui/macro";

import "./chip.scss";

import { Pinout, ImmPin } from "../components/pinout";
import { DiffPanel } from "../components/diff";
import { ChipPageStore, PROJECTS, PROJECT_NAMES } from "./chip.store";
import { Diff } from "../simulator/compare";
import { StorageContext } from "../util/storage";
import { Subscription } from "rxjs";
import { Pins } from "../simulator/chip/chip";
import { AppContext } from "../App.context";

let store = new ChipPageStore();

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
      store.selectors.diffs.subscribe((diffs) => {
        setDiffs(diffs);
        setRan(true);
      })
    );
    subs.push(
      store.selectors.files.subscribe(({ hdl, tst, cmp, out }) => {
        setHdlText(hdl);
        setTstText(tst);
        setCmpText(cmp);
        setOutText(out);
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

  const [cmpText, setCmpText] = useState(store.files.cmp);
  const [hdlText, setHdlText] = useState(store.files.hdl);
  const [outText, setOutText] = useState(store.files.out);
  const [tstText, setTstText] = useState(store.files.tst);

  const [diffs, setDiffs] = useState<Diff[]>([]);
  const [ran, setRan] = useState(false);

  function clearOutput() {
    setOutText("");
    setRan(false);
  }

  const onSaveChip = () => {
    store.saveChip(hdlText);
  };

  async function setFiles() {
    const hdl = hdlText;
    const tst = tstText;
    const cmp = cmpText;
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

  return (
    <div className="ChipPage flex-1 flex">
      <section className="flex-1 grid">
        <div className="pinouts grid">
          <div className="flex row inline align-end">
            <select
              value={project}
              onChange={({ target: { value } }) => {
                store.setProject(value as keyof typeof PROJECTS);
              }}
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
                  <Trans>Eval</Trans>
                </button>
                <button onClick={onSaveChip} onKeyDown={onSaveChip}>
                  <Trans>Save</Trans>
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
            <header tabIndex={0}>
              <Trans>Input pins</Trans>
            </header>
            <Pinout
              pins={inPins}
              clocked={clocked}
              toggle={(pin) => store.toggle(pin)}
            />
          </article>
          <article className="no-shadow panel">
            <header tabIndex={0}>
              <Trans>Internal Pins</Trans>
            </header>
            <Pinout pins={internalPins} />
          </article>
          <article className="no-shadow panel">
            <header tabIndex={0}>
              <Trans>Output pins</Trans>
            </header>
            <Pinout pins={outPins} />
          </article>
        </div>
        <article>
          <header>
            <div tabIndex={0}>
              <Trans>Test</Trans>
            </div>
            <fieldset className="input-group">
              <button onClick={execute}>
                <Trans>Execute</Trans>
              </button>
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
