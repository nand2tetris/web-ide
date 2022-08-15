import { t } from "@lingui/macro";
import { Subject, map } from "rxjs";

import { Err, isErr, Ok } from "@davidsouther/jiffies/lib/esm/result";
import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs";
import { display } from "@davidsouther/jiffies/lib/esm/display";

import { TST } from "../languages/tst";
import { Low, Pin, Chip as SimChip } from "../simulator/chip/chip";
import * as make from "../simulator/chip/builder";
import { getBuiltinChip } from "../simulator/chip/builtins/index";
import { ChipTest } from "../simulator/tst";
import { compare, Diff } from "../simulator/compare";
import * as not from "../projects/project_01/01_not";
import { Clock } from "../simulator/chip/clock";
import { HDL } from "../languages/hdl";
import { CMP } from "../languages/cmp";

export const PROJECT_NAMES = [
  ["01", "Project 1"],
  ["02", "Project 2"],
  ["03", "Project 3"],
  ["05", "Project 5"],
];

export const PROJECTS: Record<"01" | "02" | "03" | "05", string[]> = {
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
    "Mux4Way16",
    "Mux8Way16",
    "DMux4Way",
    "DMux8Way",
    "Or8Way",
  ],
  "02": ["HalfAdder", "FullAdder", "Add16", "Inc16", "AluNoStat", "ALU"],
  "03": ["Bit", "Register", "PC", "RAM8", "RAM64", "RAM512", "RAM4k", "RAM16k"],
  "05": ["Memory", "CPU", "Computer"],
};

function makeHdl(name: string) {
  return `CHIP ${name} {
    IN: in;
    OUT: out;
    PARTS:
  }`;
}

function makeTst() {
  return `repeat {
    tick,
    tock;
  }`;
}

function makeCmp() {
  return `| in|out|`;
}

export class ChipPageStore {
  project: keyof typeof PROJECTS;
  chips: string[];
  chipName: string;
  chip: SimChip;
  test?: ChipTest;
  diffs: Diff[] = [];
  files = {
    hdl: "",
    cmp: "",
    tst: "",
    out: "",
  };
  errors = {
    hdl: "",
    cmp: "",
    tst: "",
    out: "",
  };

  readonly subject = new Subject<ChipPageStore>();
  readonly $ = this.subject.asObservable();
  readonly testLog = new Subject<string>();

  private runningTest = false;
  private initialized = false;

  next() {
    if (this.initialized && !this.runningTest) this.subject.next(this);
  }

  readonly selectors = {
    project: this.$.pipe(map((t) => t.project)),
    chipName: this.$.pipe(map((t) => t.chipName)),
    chips: this.$.pipe(map((t) => t.chips)),
    chip: this.$.pipe(map((t) => t.chip)),
    files: this.$.pipe(map((t) => t.files)),
    errors: this.$.pipe(map((t) => t.errors)),
    test: this.$.pipe(map((t) => t.test)),
    diffs: this.$.pipe(map((t) => t.diffs)),
    log: this.testLog.asObservable(),
  };

  constructor(
    private readonly fs: FileSystem = new FileSystem(
      new ObjectFileSystemAdapter({
        "/projects/01/Not/Not.hdl": not.hdl,
        "/projects/01/Not/Not.tst": not.tst,
        "/projects/01/Not/Not.cmp": not.cmp,
      })
    ),
    private readonly storage: Record<string, string> = {},
    private readonly statusLine: (status: string) => void = () => {}
  ) {
    this.project =
      (this.storage["/chip/project"] as keyof typeof PROJECTS) ?? "01";
    this.chips = PROJECTS[this.project];
    this.chipName = this.storage["chip/chip"] ?? "Not";
    let maybeChip = getBuiltinChip(this.chipName);
    if (isErr(maybeChip)) this.statusLine(display(Err(maybeChip)));
    this.chip = isErr(maybeChip) ? new Low() : Ok(maybeChip);
    this.setProject(this.project);
    // Clock.get().update.subscribe(() => {
    //   this.next();
    // });
  }

  replaceChip(chip: Ok<SimChip>) {
    // Store current inPins
    const inPins = this.chip.ins;
    this.chip = Ok(chip);
    for (const [pin, { busVoltage }] of inPins) {
      if (this.chip.ins.has(pin)) {
        this.chip.ins.get(pin)!.busVoltage = busVoltage;
      }
    }
    this.chip.eval();
    this.next();
    return true;
  }

  useBuiltin() {
    const nextChip = getBuiltinChip(this.chipName);
    if (isErr(nextChip)) {
      this.statusLine(
        `Failed to load builtin ${this.chipName}: ${display(Err(nextChip))}`
      );
      return false;
    }
    return this.replaceChip(nextChip);
  }

  reset() {
    Clock.get().reset();
    this.chip?.reset();
  }

  toggle(pin: Pin, i?: number) {
    if (i !== undefined) {
      pin.busVoltage = pin.busVoltage ^ (1 << i);
    } else {
      if (pin.width === 1) {
        pin.toggle();
      } else {
        pin.busVoltage += 1;
      }
    }
    this.chip.eval();
    this.next();
  }

  setFiles({
    hdl,
    tst,
    cmp,
    out = "",
  }: {
    hdl: string;
    tst: string;
    cmp: string;
    out?: string;
  }) {
    this.files.hdl = hdl;
    this.files.tst = tst;
    this.files.cmp = cmp;
    this.files.out = out;
    this.errors.hdl = "";
    this.errors.tst = "";
    this.errors.cmp = "";
    this.errors.out = "";
  }

  compileChip() {
    this.chip?.remove();
    const maybeParsed = HDL.parse(this.files.hdl);
    if (isErr(maybeParsed)) {
      this.errors.hdl = Err(maybeParsed).message;
      this.statusLine("Failed to parse chip");
      return;
    }
    const maybeChip = make.build(Ok(maybeParsed));
    if (isErr(maybeChip)) {
      this.statusLine(display(Err(maybeChip)));
      return;
    }
    this.statusLine(t`Compiled ${this.chip.name}`);
    this.replaceChip(maybeChip);
  }

  async saveChip(text: string) {
    this.files.hdl = text;
    this.errors.hdl = "";
    const name = this.chipName;
    const path = `/projects/${this.project}/${name}/${name}.hdl`;
    await this.fs.writeFile(path, text);
    this.statusLine(`Saved ${path}`);
    this.next();
  }

  async setProject(proj: keyof typeof PROJECTS) {
    this.storage["/chip/project"] = this.project = proj;
    this.chips = PROJECTS[proj];
    this.chipName =
      this.chipName && this.chips.includes(this.chipName)
        ? this.chipName
        : this.chips[0];
    await this.setChip(this.chipName);
  }

  async setChip(name: string) {
    this.chipName = this.storage["chip/chip"] = name;
    const fsName = (ext: string) =>
      `/projects/${this.project}/${name}/${name}.${ext}`;
    const hdl = await this.fs
      .readFile(fsName("hdl"))
      .catch(() => makeHdl(name));
    const tst = await this.fs.readFile(fsName("tst")).catch(() => makeTst());
    const cmp = await this.fs.readFile(fsName("cmp")).catch(() => makeCmp());

    this.files.hdl = hdl;
    this.files.tst = tst;
    this.files.cmp = cmp;
    this.files.out = "";
    this.errors.hdl = "";
    this.errors.tst = "";
    this.errors.cmp = "";
    this.errors.out = "";

    try {
      this.compileChip();
    } catch (e) {
      this.statusLine(display(e));
    }

    this.next();
    this.initialized = true;
  }

  async runTest() {
    const tst = TST.parse(this.files.tst);

    if (isErr(tst)) {
      this.errors.tst = display(Err(tst).message);
      this.statusLine(t`Failed to parse test`);
      this.next();
      return;
    }
    this.statusLine(t`Parsed tst`);

    this.test = ChipTest.from(Ok(tst)).with(this.chip);
    this.test.setFileSystem(this.fs);
    this.fs.pushd("/samples");

    const run = async () => {
      try {
        this.runningTest = true;
        await this.test?.run();
      } finally {
        this.runningTest = false;
      }
    };
    await run();

    this.fs.popd();

    this.files.out = this.test.log();
    this.next();

    const cmp = CMP.parse(this.files.cmp);
    const out = CMP.parse(this.files.out);

    if (isErr(cmp)) {
      this.errors.cmp = Err(cmp).message;
      this.statusLine(t`Error parsing cmp`);
      this.next();
      return;
    }
    if (isErr(out)) {
      this.errors.out = Err(out).message;
      this.statusLine(t`Error parsing out`);
      this.next();
      return;
    }

    this.diffs = compare(Ok(cmp), Ok(out));
    this.next();
  }
}
