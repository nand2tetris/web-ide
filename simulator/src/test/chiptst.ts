import { Result } from "@davidsouther/jiffies/lib/esm/result.js";
import { Bus, Chip, HIGH, LOW, Low } from "../chip/chip.js";
import { Clock } from "../chip/clock.js";
import { Tst } from "../languages/tst.js";
import { Action } from "../types.js";
import { fill } from "./builder.js";
import { TestInstruction } from "./instruction.js";
import { Test } from "./tst.js";

export class ChipTest extends Test<ChipTestInstruction> {
  private chip: Chip = new Low();
  private doLoad?: (path: string) => Promise<Chip>;

  get chipId(): number {
    return this.chip.id;
  }

  private clock = Clock.get();

  static from(
    tst: Tst,
    options: {
      dir?: string;
      setStatus?: Action<string>;
      loadAction?: (path: string) => Promise<Chip>;
      compareTo?: Action<string>;
      requireLoad?: boolean;
    } = {},
  ): Result<ChipTest, Error> {
    const test = new ChipTest(options);

    return fill(test, tst, options.requireLoad);
  }

  constructor({
    dir,
    setStatus,
    loadAction,
    compareTo,
  }: {
    dir?: string;
    setStatus?: Action<string>;
    loadAction?: (path: string) => Promise<Chip>;
    compareTo?: Action<string>;
  } = {}) {
    super(dir, setStatus, compareTo);
    this.doLoad = loadAction;
  }

  with(chip: Chip): this {
    this.chip = chip;
    return this;
  }

  override async load(filename?: string): Promise<void> {
    if (!this.dir) return;
    const chip = await this.doLoad?.(
      filename ? `${this.dir}/${filename}` : this.dir,
    );
    if (chip) {
      this.chip = chip;
    }
  }

  hasVar(variable: string | number): boolean {
    if (variable === "time") {
      return true;
    }
    variable = `${variable}`;
    // Look up built-in chip state variables
    return this.chip.hasIn(variable) || this.chip.hasOut(variable);
  }

  getVar(variable: string | number, offset?: number): number | string {
    variable = `${variable}`;
    if (variable === "time") {
      return this.clock.toString();
    }
    const pin = this.chip.get(variable, offset);
    if (!pin) return 0;
    return pin instanceof Bus ? pin.busVoltage : pin.voltage();
  }

  getWidth(variable: string, offset?: number): number {
    const pin = this.chip.get(variable, offset);
    if (!pin) return 0;
    return pin.width;
  }

  setVar(variable: string, value: number, offset?: number): void {
    // Look up built-in chip state variables
    const pinOrBus = this.chip.get(variable, offset);
    if (pinOrBus instanceof Bus) {
      pinOrBus.busVoltage = value;
    } else {
      pinOrBus?.pull(value === 0 ? LOW : HIGH);
    }
  }

  eval(): void {
    this.chip.eval();
  }

  tick(): void {
    this.chip.eval();
    this.clock.tick();
  }

  tock(): void {
    this.chip.eval();
    this.clock.tock();
  }

  override async loadROM(filename: string) {
    await this.chip.load(this.fs, [this.dir ?? "", filename].join("/"));
  }

  override async run() {
    this.clock.reset();
    await super.run();
  }
}

export interface ChipTestInstruction extends TestInstruction {
  _chipTestInstruction_: true;
  do(test: ChipTest): Promise<void>;
}

export class TestEvalInstruction implements ChipTestInstruction {
  readonly _chipTestInstruction_ = true;
  async do(test: ChipTest) {
    test.eval();
  }

  *steps() {
    yield this;
  }
}

export class TestTickInstruction implements ChipTestInstruction {
  readonly _chipTestInstruction_ = true;
  async do(test: ChipTest) {
    test.tick();
  }

  *steps() {
    yield this;
  }
}

export class TestTockInstruction implements ChipTestInstruction {
  readonly _chipTestInstruction_ = true;
  async do(test: ChipTest) {
    test.tock();
  }

  *steps() {
    yield this;
  }
}
