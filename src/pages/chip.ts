import { display } from "@davidsouther/jiffies/display.js";
import {
  article,
  button,
  div,
  fieldset,
  h2,
  header,
  main,
  section,
  span,
  style,
  textarea,
} from "@davidsouther/jiffies/dom/html.js";
import { Dropdown } from "@davidsouther/jiffies/dom/form/form.js";
import { compileFStyle, FStyle } from "@davidsouther/jiffies/dom/css/fstyle.js";
import { FileSystem } from "@davidsouther/jiffies/fs.js";
import {
  Observable,
  Subject,
} from "@davidsouther/jiffies/observable/observable.js";
import { retrieve } from "@davidsouther/jiffies/dom/provide.js";
import { Err, isErr, Ok, unwrap } from "@davidsouther/jiffies/result.js";
import { Pinout } from "../components/pinout.js";
import { Low, Pin } from "../simulator/chip/chip.js";
import { Chip as SimChip } from "../simulator/chip/chip.js";
import * as make from "../simulator/chip/builder.js";
import { getBuiltinChip } from "../simulator/chip/builtins/index.js";
import { Tst, tstParser } from "../languages/tst.js";
import { IResult } from "../languages/parser/base.js";
import { cmpParser } from "../languages/cmp.js";
import { ChipTest } from "../simulator/tst.js";
import { compare, Diff } from "../simulator/compare.js";
import { DiffPanel } from "../components/diff.js";
import { Clock } from "../simulator/chip/clock.js";

const PROJECTS: Record<"01" | "02" | "03" | "05", string[]> = {
  "01": [
    "Not",
    "And",
    "Or",
    "XOr",
    "Mux",
    "DMux",
    "Not16",
    "And16",
    "Or16",
    "Mux16",
    "Mux4way16",
    "Mux8way16",
    "DMux4way",
    "DMux8way",
    "Or8way",
  ],
  "02": ["HalfAdder", "FullAdder", "Add16", "Inc16", "AluNoStat", "ALU"],
  "03": ["Bit", "Register", "PC", "RAM8", "RAM64", "RAM512", "RAM4k", "RAM16k"],
  "05": ["Memory", "Computer"],
};

function makeProjectDropdown(
  selected: keyof typeof PROJECTS,
  setProject: (p: keyof typeof PROJECTS) => void
) {
  return Dropdown(
    {
      style: {
        display: "inline-block",
      },
      selected,
      events: {
        change: (event: Event) =>
          setProject(
            (event.target as HTMLSelectElement)?.value as keyof typeof PROJECTS
          ),
      },
    },
    {
      "01": "Project 1",
      "02": "Project 2",
      "03": "Project 3",
      // "05": "Project 5",
    }
  );
}

function makeChipsDropdown(
  selected: string,
  chips: string[],
  setChip: (chip: string) => void
) {
  return Dropdown(
    {
      style: {
        display: "inline-block",
      },
      selected,
      events: {
        change: (event) => setChip((event.target as HTMLSelectElement)?.value),
      },
    },
    chips
  );
}

class ChipPageStore {
  project: keyof typeof PROJECTS;
  chips: string[];
  chipName: string;
  chip: SimChip;
  test?: ChipTest;
  diffs: Diff[] = [];
  private readonly statusLine = unwrap(retrieve<(s: string) => void>("status"));
  private files = {
    hdl: "",
    cmp: "",
    tst: "",
    out: "",
  };

  readonly subject = new Subject<ChipPageStore>();
  readonly $ = this.subject.$;
  readonly testLog = new Subject<string>();

  next() {
    this.subject.next(this);
  }

  readonly selectors = {
    project: this.$.map((t) => t.project).distinct(),
    chipName: this.$.map((t) => t.chipName).distinct(),
    chips: this.$.map((t) => t.chips),
    chip: this.$.map((t) => t.chip),
    files: this.$.map((t) => t.files as Readonly<typeof this.files>),
    test: this.$.map((t) => t.test).filter(
      (t): t is ChipTest => t !== undefined
    ),
    diffs: this.$.map((t) => t.diffs),
    log: this.testLog.$,
  };

  constructor(
    private readonly storage: Record<string, string> = localStorage,
    private readonly fs: FileSystem
  ) {
    this.project = localStorage["chip/project"] ?? "01";
    this.chips = PROJECTS[this.project];
    this.chipName = localStorage["chip/chip"] ?? "And";
    let maybeChip = getBuiltinChip(this.chipName);
    if (isErr(maybeChip)) this.statusLine(display(Err(maybeChip)));
    this.chip = isErr(maybeChip) ? new Low() : Ok(maybeChip);
    Clock.get().update.$.subscribe(() => {
      this.next();
    });
  }

  toggle(pin: Pin) {
    if (pin.width == 1) {
      pin.toggle();
    } else {
      pin.busVoltage += 1;
    }
    this.chip.eval();
    this.next();
  }

  compileChip(text: string) {
    this.files.hdl = text;
    this.chip?.remove();
    const maybeChip = make.parse(text);
    if (isErr(maybeChip)) {
      this.statusLine(display(Err(maybeChip)));
      return;
    }
    this.chip = Ok(maybeChip);
    this.statusLine(`Compiled ${this.chip.name}`);
    this.storage["chip/chip"] = this.chip.name!;
    this.chip.eval();
    this.next();
  }

  async saveChip(text: string) {
    const name = this.chipName;
    const path = `/projects/${this.project}/${name}/${name}.hdl`;
    await this.fs.writeFile(path, text);
    this.statusLine(`Saved ${path}`);
  }

  async setProject(proj: keyof typeof PROJECTS) {
    localStorage["chip/project"] = this.project = proj;
    this.chips = PROJECTS[proj as "01" | "02"];
    this.chipName =
      this.chipName && this.chips.includes(this.chipName)
        ? this.chipName
        : this.chips[0];
    return await this.setChip(this.chipName);
  }

  async setChip(name: string) {
    const fsName = (ext: string) =>
      `/projects/${this.project}/${name}/${name}.${ext}`;
    const hdl = await this.fs.readFile(fsName("hdl"));
    const tst = await this.fs.readFile(fsName("tst"));
    const cmp = await this.fs.readFile(fsName("cmp"));

    this.compileChip(hdl);
    this.files.hdl = hdl;
    this.files.tst = tst;
    this.files.cmp = cmp;
    this.files.out = "";

    this.next();
    return this.files;
  }

  async runTest(tstString: string, cmpString: string) {
    this.files.tst = tstString;
    this.files.cmp = cmpString;

    const tst = await new Promise<IResult<Tst>>((r) => r(tstParser(tstString)));

    if (isErr(tst)) {
      this.statusLine(display(Err(tst)));
      return;
    }
    this.statusLine("Parsed tst");

    this.test = ChipTest.from(Ok(tst)[1]).with(this.chip);

    await new Promise<void>((r) => {
      this.test?.run();
      r();
    });

    this.files.out = this.test.log();
    this.next();

    const [cmp, out] = await Promise.all([
      new Promise<IResult<string[][]>>((r) => r(cmpParser(cmpString))),
      new Promise<IResult<string[][]>>((r) => r(cmpParser(this.files.out))),
    ]);

    if (isErr(cmp)) {
      this.statusLine(`Error parsing cmp file!`);
      return;
    }
    if (isErr(out)) {
      this.statusLine(`Error parsing out file!`);
      return;
    }

    this.diffs = compare(Ok(cmp)[1], Ok(out)[1]);
    this.next();
  }
}

export const Chip = () => {
  const fs = unwrap(retrieve<FileSystem>("fs"));
  const state = new ChipPageStore(localStorage, fs);

  setTimeout(async function () {
    await state.setProject(state.project);
    await state.setChip(state.chip.name!);
  });

  const chipsDropdown = span();
  const projectDropdown = span();
  const inPinout = Pinout({
    pins: state.chip.ins,
    toggle: (pin) => state.toggle(pin),
    clocked: state.chip.clocked,
  });
  const outPinout = Pinout({ pins: state.chip.outs });
  const pinsPinout = Pinout({ pins: state.chip.pins });
  const hdlTextarea = textarea({ class: "font-monospace flex-1", rows: 10 });
  const tstTextarea = textarea({ class: "font-monospace flex-2", rows: 15 });
  const cmpTextarea = textarea({ class: "font-monospace flex-1", rows: 5 });
  const outTextarea = textarea({
    class: "font-monospace flex-1",
    rows: 5,
    readOnly: true,
  });
  const diffPanel = DiffPanel();

  const onSaveChip = () => {
    state.saveChip(hdlTextarea.value);
  };

  function setState() {
    inPinout.update({ pins: state.chip.ins, clocked: state.chip.clocked });
    outPinout.update({ pins: state.chip.outs });
    pinsPinout.update({ pins: state.chip.pins });
  }

  function clearOutput() {
    outTextarea.value = "";
    diffPanel.update({ ran: false });
  }

  state.subject.$.subscribe(setState);
  state.selectors.project.subscribe((project) => {
    projectDropdown.update(
      makeProjectDropdown(project, (p) => {
        clearOutput();
        state.setProject(p);
      })
    );
  });
  state.selectors.chipName.subscribe((chipName) => {
    chipsDropdown.update(
      makeChipsDropdown(chipName, PROJECTS[state.project], (chip) => {
        clearOutput();
        state.setChip(chip);
      })
    );
  });
  state.selectors.diffs.subscribe((diffs) => {
    diffPanel.update({ diffs, ran: true });
  });
  state.selectors.files.subscribe(({ hdl, tst, cmp, out }) => {
    hdlTextarea.value = hdl;
    tstTextarea.value = tst;
    cmpTextarea.value = cmp;
    outTextarea.value = out;
  });
  state.selectors.log.subscribe((out) => {
    outTextarea.value = out;
  });

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

  return div(
    { class: "View__Chip flex-1 flex" },
    style(compileFStyle(fstyle)),
    section(
      { class: "flex-1 grid" },
      div(
        { class: "pinouts grid" },
        div(
          {
            class: "flex row inline align-end",
            style: { gridColumn: "1 / span 2" },
          },
          projectDropdown,
          h2({ tabIndex: 0 }, "Chips:"),
          chipsDropdown
        ),
        article(
          { class: "no-shadow panel" },
          header(
            div({ tabIndex: 0 }, "HDL"),
            fieldset(
              { class: "button-group" },
              button(
                {
                  events: {
                    click: () => state.compileChip(hdlTextarea.value),
                    keypress: () => state.compileChip(hdlTextarea.value),
                  },
                },
                "Eval"
              ),
              button(
                {
                  events: {
                    click: onSaveChip,
                    keypress: onSaveChip,
                  },
                },
                "Save"
              )
            )
          ),
          main({ class: "flex" }, hdlTextarea)
        ),
        article(
          { class: "no-shadow panel" },
          header({ tabIndex: 0 }, "Input pins"),
          inPinout
        ),
        article(
          { class: "no-shadow panel" },
          header({ tabIndex: 0 }, "Internal Pins"),
          pinsPinout
        ),
        article(
          { class: "no-shadow panel" },
          header({ tabIndex: 0 }, "Output pins"),
          outPinout
        )
      ),
      article(
        header(
          div({ tabIndex: 0 }, "Test"),
          fieldset(
            { class: "input-group" },
            button(
              {
                events: {
                  click: (e) => {
                    e.preventDefault();
                    clearOutput();
                    state.runTest(tstTextarea.value, cmpTextarea.value);
                  },
                },
              },
              "Execute"
            )
          )
        ),
        tstTextarea,
        cmpTextarea,
        outTextarea,
        diffPanel
      )
    )
  );
};
