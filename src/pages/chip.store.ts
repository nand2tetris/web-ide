import { Err, isErr, Ok, unwrap } from "@davidsouther/jiffies/lib/esm/result";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { Subject, distinctUntilChanged, filter, map } from "rxjs";
import { display } from "@davidsouther/jiffies/lib/esm/display";
import { Low, Pin } from "../simulator/chip/chip";
import { Chip as SimChip } from "../simulator/chip/chip";
import * as make from "../simulator/chip/builder";
import { getBuiltinChip } from "../simulator/chip/builtins/index";
import { Tst, tstParser } from "../languages/tst";
import { IResult } from "../languages/parser/base";
import { cmpParser } from "../languages/cmp";
import { ChipTest } from "../simulator/tst";
import { compare, Diff } from "../simulator/compare";
import { Clock } from "../simulator/chip/clock";
import { retrieve } from "@davidsouther/jiffies/lib/esm/dom/provide.js";

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

export class ChipPageStore {
  project: keyof typeof PROJECTS;
  chips: string[];
  chipName: string;
  chip: SimChip;
  test?: ChipTest;
  diffs: Diff[] = [];
  private runningTest = false;
  private readonly statusLine = unwrap(retrieve<(s: string) => void>("status"));
  private files = {
    hdl: "",
    cmp: "",
    tst: "",
    out: "",
  };

  readonly subject = new Subject<ChipPageStore>();
  readonly $ = this.subject.asObservable();
  readonly testLog = new Subject<string>();

  next() {
    if (!this.runningTest) this.subject.next(this);
  }

  readonly selectors = {
    project: this.$.pipe(
      map((t) => t.project),
      distinctUntilChanged()
    ),
    chipName: this.$.pipe(
      map((t) => t.chipName),
      distinctUntilChanged()
    ),
    chips: this.$.pipe(map((t) => t.chips)),
    chip: this.$.pipe(map((t) => t.chip)),
    files: this.$.pipe(map((t) => t.files as Readonly<typeof this.files>)),
    test: this.$.pipe(
      map((t) => t.test),
      filter((t): t is ChipTest => t !== undefined)
    ),
    diffs: this.$.pipe(map((t) => t.diffs)),
    log: this.testLog.asObservable(),
  };

  constructor(
    private readonly storage: Record<string, string> = localStorage,
    private readonly fs: FileSystem
  ) {
    this.project =
      (this.storage["chip/project"] as keyof typeof PROJECTS) ?? "01";
    this.chips = PROJECTS[this.project];
    this.chipName = this.storage["chip/chip"] ?? "Not";
    let maybeChip = getBuiltinChip(this.chipName);
    if (isErr(maybeChip)) this.statusLine(display(Err(maybeChip)));
    this.chip = isErr(maybeChip) ? new Low() : Ok(maybeChip);
    Clock.get().update.subscribe(() => {
      this.next();
    });
  }

  toggle(pin: Pin) {
    if (pin.width === 1) {
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
      try {
        this.runningTest = true;
        this.test?.run();
        r();
      } finally {
        this.runningTest = false;
      }
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
