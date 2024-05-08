/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { assert, assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { range } from "@davidsouther/jiffies/lib/esm/range.js";
import {
  Err,
  Ok,
  Result,
  isErr,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { bin } from "../util/twos.js";
import { Clock } from "./clock.js";

export const HIGH = 1;
export const LOW = 0;
export type Voltage = typeof HIGH | typeof LOW;

export interface Pin {
  readonly name: string;
  readonly width: number;
  busVoltage: number;
  pull(voltage: Voltage, bit?: number): void;
  toggle(bit?: number): void;
  voltage(bit?: number): Voltage;
  connect(pin: Pin): void;
}

export class Bus implements Pin {
  state: Voltage[];
  next: Pin[] = [];

  constructor(readonly name: string, readonly width = 1) {
    this.state = range(0, this.width).map(() => LOW);
  }

  ensureWidth(newWidth: number) {
    assert(newWidth <= 16, `Cannot widen past 16 to ${newWidth} bits`);
    if (this.width < newWidth) {
      (this as { width: number }).width = newWidth;
      this.state = [
        ...this.state,
        ...range(this.width, newWidth).map(() => LOW as Voltage),
      ];
    }
  }

  connect(next: Pin) {
    this.next.push(next);
    next.busVoltage = this.busVoltage;
  }

  pull(voltage: Voltage, bit = 0) {
    assert(
      bit >= 0 && bit < this.width,
      `Bit out of bounds: ${this.name}@${bit}`
    );
    this.state[bit] = voltage;
    this.next.forEach((n) => n.pull(voltage, bit));
  }

  voltage(bit = 0): Voltage {
    assert(bit >= 0 && bit < this.width);
    return this.state[bit];
  }

  set busVoltage(voltage: number) {
    for (const i of range(0, this.width)) {
      this.state[i] = ((voltage & (1 << i)) >> i) as Voltage;
    }
    this.next.forEach((n) => (n.busVoltage = this.busVoltage));
  }

  get busVoltage(): number {
    return range(0, this.width).reduce((b, i) => b | (this.state[i] << i), 0);
  }

  toggle(bit = 0) {
    const nextVoltage = this.voltage(bit) === LOW ? HIGH : LOW;
    this.pull(nextVoltage, bit);
  }
}

export class InSubBus extends Bus {
  constructor(
    private bus: Pin,
    private start: number,
    override readonly width = 1
  ) {
    super(bus.name);
    assert(
      start >= 0 && start + width <= bus.width,
      `Mismatched InSubBus dimensions on ${bus.name} (${width} + ${start} > ${bus.width})`
    );
    this.connect(bus);
  }

  override pull(voltage: Voltage, bit = 0) {
    assert(bit >= 0 && bit < this.width);
    this.bus.pull(voltage, this.start + bit);
  }

  override voltage(bit = 0): Voltage {
    assert(bit >= 0 && bit < this.width);
    return this.bus.voltage(this.start + bit);
  }

  override set busVoltage(voltage: number) {
    const high = this.bus.busVoltage & ~mask(this.width + this.start);
    const low = this.bus.busVoltage & mask(this.start);
    const mid = (voltage & mask(this.width)) << this.start;
    this.bus.busVoltage = high | mid | low;
  }

  override get busVoltage(): number {
    return (this.bus.busVoltage >> this.start) & mask(this.width);
  }

  override connect(bus: Pin): void {
    assert(
      this.start + this.width <= bus.width,
      `Mismatched InSubBus connection dimensions (From ${bus.name} to ${this.name})`
    );
    this.bus = bus;
  }
}

export class OutSubBus extends Bus {
  constructor(
    private bus: Pin,
    private start: number,
    override readonly width = 1
  ) {
    super(bus.name);
    assert(start >= 0 && width <= bus.width, `Mismatched OutSubBus dimensions`);
    this.connect(bus);
  }

  override set busVoltage(voltage: number) {
    this.bus.busVoltage =
      (voltage & mask(this.width + this.start)) >> this.start;
  }

  override get busVoltage(): number {
    return this.bus.busVoltage & mask(this.width);
  }

  override connect(bus: Pin): void {
    assert(
      this.width <= bus.width,
      `Mismatched OutSubBus connection dimensions`
    );
    this.bus = bus;
  }
}

export class ConstantBus extends Bus {
  constructor(name: string, private readonly value: number) {
    super(name, 16 /* TODO: get high bit index */);
  }

  pullHigh(_ = 0) {
    return undefined;
  }
  pullLow(_ = 0) {
    return undefined;
  }
  override voltage(_ = 0): Voltage {
    return (this.busVoltage & 0x1) as Voltage;
  }

  override set busVoltage(voltage: number) {
    // Noop
  }
  override get busVoltage(): number {
    return this.value;
  }
}

export const TRUE_BUS = new ConstantBus("true", 0xffff);
export const FALSE_BUS = new ConstantBus("false", 0);

export function parsePinDecl(toPin: string): {
  pin: string;
  width: number;
} {
  const { pin, w } = toPin.match(/(?<pin>[a-zA-Z]+)(\[(?<w>\d+)\])?/)
    ?.groups as {
    pin: string;
    w?: string;
  };
  return {
    pin,
    width: w ? Number(w) : 1,
  };
}

export function parseToPin(toPin: string): {
  pin: string;
  start?: number;
  end?: number;
} {
  const { pin, i, j } = toPin.match(
    /(?<pin>[a-z]+)(\[(?<i>\d+)(\.\.(?<j>\d+))?\])?/
  )?.groups as { pin: string; i?: string; j?: string };
  return {
    pin,
    start: i ? Number(i) : undefined,
    end: j ? Number(j) : undefined,
  };
}

export class Pins {
  private readonly map = new Map<string, Pin>();

  insert(pin: Pin) {
    const { name } = pin;
    assert(!this.map.has(name), `Pins already has ${name}!`);
    this.map.set(name, pin);
  }

  emplace(name: string, minWidth?: number) {
    if (this.has(name)) {
      return this.get(name)!;
    } else {
      const pin = new Bus(name, minWidth);
      this.insert(pin);
      return pin;
    }
  }

  has(pin: string): boolean {
    return this.map.has(pin);
  }

  get(pin: string): Pin | undefined {
    return this.map.get(pin);
  }

  entries(): Iterable<Pin> {
    return this.map.values();
  }

  [Symbol.iterator]() {
    return this.map[Symbol.iterator]();
  }
}

function validateWidth(
  start: number,
  width: number,
  pin: Pin
): Result<void, string> {
  return start + width <= pin.width
    ? Ok()
    : Err(`Sub-bus index out of range (${pin.name} has width ${pin.width})`);
}

let id = 0;

export interface PartWireError {
  wireIndex: number;
  lhs: boolean;
  message: string;
}

export interface WireError {
  message: string;
  lhs: boolean;
}
export class Chip {
  readonly id = id++;
  ins = new Pins();
  outs = new Pins();
  pins = new Pins();
  parts = new Set<Chip>();
  clockedPins: Set<string>;

  get clocked() {
    if (this.clockedPins.size > 0) {
      return true;
    }
    for (const part of this.parts) {
      if (part.clocked) return true;
    }
    return false;
  }

  constructor(
    ins: (string | { pin: string; width: number })[],
    outs: (string | { pin: string; width: number })[],
    public name?: string,
    internals: (string | { pin: string; width: number })[] = [],
    clocked: string[] = []
  ) {
    for (const inn of ins) {
      const { pin, width = 1 } =
        (inn as { pin: string }).pin !== undefined
          ? (inn as { pin: string; width: number })
          : parsePinDecl(inn as string);
      this.ins.insert(new Bus(pin, width));
    }

    for (const out of outs) {
      const { pin, width = 1 } =
        (out as { pin: string }).pin !== undefined
          ? (out as { pin: string; width: number })
          : parsePinDecl(out as string);
      this.outs.insert(new Bus(pin, width));
    }

    for (const internal of internals) {
      const { pin, width = 1 } =
        (internal as { pin: string }).pin !== undefined
          ? (internal as { pin: string; width: number })
          : parsePinDecl(internal as string);
      this.pins.insert(new Bus(pin, width));
    }

    this.clockedPins = new Set(clocked);

    Clock.get().$.subscribe(() => this.eval());
  }

  reset() {
    for (const [_, pin] of this.ins) {
      pin.busVoltage = 0;
    }
    for (const part of this.parts) {
      part.reset();
    }
    this.eval();
  }

  in(pin = "in"): Pin {
    assert(this.hasIn(pin), `No in pin ${pin}`);
    return this.ins.get(pin)!;
  }

  out(pin = "out"): Pin {
    assert(this.hasOut(pin), `No in pin ${pin}`);
    return this.outs.get(pin)!;
  }

  hasIn(pin: string): boolean {
    return this.ins.has(pin);
  }

  hasOut(pin: string): boolean {
    return this.outs.has(pin);
  }

  pin(name: string): Pin {
    assert(this.pins.has(name));
    return this.pins.get(name)!;
  }

  get(name: string, offset?: number): Pin | undefined {
    if (this.ins.has(name)) {
      return this.ins.get(name)!;
    }
    if (this.outs.has(name)) {
      return this.outs.get(name)!;
    }
    if (this.pins.has(name)) {
      return this.pins.get(name)!;
    }
    return this.getBuiltin(name, offset);
  }

  private getBuiltin(name: string, offset = 0): Pin | undefined {
    if (BUILTIN_NAMES.includes(name)) {
      for (const part of this.parts) {
        const pin = part.get(name, offset);
        if (pin) {
          return pin;
        }
      }
    }
    return undefined;
  }

  isInPin(pin: string): boolean {
    return this.ins.has(pin);
  }

  isOutPin(pin: string): boolean {
    return this.outs.has(pin);
  }

  wire(part: Chip, connections: Connection[]): Result<void, PartWireError> {
    this.parts.add(part);
    for (let i = 0; i < connections.length; i++) {
      const { from, to } = connections[i];
      if (part.isOutPin(to.name)) {
        const result = this.wireOutPin(part, to, from);
        if (isErr(result)) {
          return Err({
            wireIndex: i,
            lhs: Err(result).lhs,
            message: Err(result).message,
          });
        }
      } else {
        const result = this.wireInPin(part, to, from);
        if (isErr(result)) {
          return Err({
            wireIndex: i,
            lhs: Err(result).lhs,
            message: Err(result).message,
          });
        }
      }
    }
    return Ok();
  }

  private findPin(from: string, minWidth?: number): Pin {
    if (from === "true" || from === "1") {
      return TRUE_BUS;
    }
    if (from === "false" || from === "0") {
      return FALSE_BUS;
    }
    if (this.ins.has(from)) {
      return this.ins.get(from)!;
    }
    if (this.outs.has(from)) {
      return this.outs.get(from)!;
    }
    return this.pins.emplace(from, minWidth);
  }

  private wireOutPin(
    part: Chip,
    to: PinSide,
    from: PinSide
  ): Result<void, WireError> {
    const partPin = assertExists(
      part.outs.get(to.name),
      () => `Cannot wire to missing pin ${to.name}`
    );
    to.width ??= partPin.width;

    let chipPin = this.findPin(from.name, from.width ?? to.width);
    const isInternal = this.pins.has(chipPin.name);

    from.width ??= chipPin.width;

    if (chipPin instanceof ConstantBus) {
      return Err({
        message: `Cannot wire to constant bus`,
        lhs: true,
      });
    }

    // Widen internal pins
    if (isInternal && chipPin instanceof Bus) {
      chipPin.ensureWidth(from.start + from.width);
    }

    // Wrap the chipPin in an InBus when the chip side is dimensioned
    if (from.start > 0 || from.width !== chipPin.width) {
      const result = validateWidth(from.start, from.width, chipPin);
      if (isErr(result)) {
        return Err({
          message: Err(result),
          lhs: true,
        });
      }
      chipPin = new InSubBus(chipPin, from.start, from.width);
    }

    // Wrap the chipPin in an OutBus when the part side is dimensioned
    if (to.start > 0 || to.width !== partPin.width) {
      const result = validateWidth(to.start, to.width, partPin);
      if (isErr(result)) {
        return Err({
          message: Err(result),
          lhs: false,
        });
      }
      chipPin = new OutSubBus(chipPin, to.start, to.width);
    }

    partPin.connect(chipPin);
    return Ok();
  }

  private wireInPin(
    part: Chip,
    to: PinSide,
    from: PinSide
  ): Result<void, WireError> {
    let partPin = assertExists(
      part.ins.get(to.name),
      () => `Cannot wire to missing pin ${to.name}`
    );
    to.width ??= partPin.width;

    const chipPin = this.findPin(from.name, from.width ?? to.width);

    from.width ??= chipPin.width;

    // Wrap the partPin in an InBus when the part side is dimensioned
    if (to.start > 0 || to.width !== partPin.width) {
      const result = validateWidth(to.start, to.width, partPin);
      if (isErr(result)) {
        return Err({
          message: Err(result),
          lhs: true,
        });
      }
      partPin = new InSubBus(partPin, to.start, to.width);
    }

    // Wrap the partPin in an OutBus when the chip side is dimensioned
    if (!["true", "false"].includes(chipPin.name)) {
      if (from.start > 0 || from.width !== chipPin.width) {
        const result = validateWidth(from.start, from.width, chipPin);
        if (isErr(result)) {
          return Err({
            message: Err(result),
            lhs: false,
          });
        }
        partPin = new OutSubBus(partPin, from.start, from.width);
      }
    }
    chipPin.connect(partPin);
    return Ok();
  }

  eval() {
    for (const chip of this.parts) {
      // TODO topological sort
      // eval chip input busses
      TRUE_BUS.next.forEach((pin) => (pin.busVoltage = TRUE_BUS.busVoltage));
      FALSE_BUS.next.forEach((pin) => (pin.busVoltage = FALSE_BUS.busVoltage));
      chip.eval();
      // eval output busses
    }
  }

  tick() {
    this.eval();
  }

  tock() {
    this.eval();
  }

  remove() {
    for (const part of this.parts) {
      part.remove();
    }
  }

  // For the ROM32K builtin to load from a file system
  async load(fs: FileSystem, path: string): Promise<void> {
    for (const part of this.parts) {
      if (part.name === "ROM32K") {
        await part.load(fs, path);
      }
    }
  }
}

export class Low extends Chip {
  constructor() {
    super([], []);
    this.outs.insert(FALSE_BUS);
  }
}

export class High extends Chip {
  constructor() {
    super([], []);
    this.outs.insert(TRUE_BUS);
  }
}

export class ClockedChip extends Chip {
  override get clocked(): boolean {
    return true;
  }

  #subscription = Clock.get().$.subscribe(({ level }) => {
    if (level === LOW) {
      this.tock();
    } else {
      this.tick();
    }
  });

  override remove() {
    this.#subscription.unsubscribe();
    super.remove();
  }

  override reset(): void {
    super.reset();
    this.tick();
    this.tock();
  }
}

export interface PinSide {
  name: string;
  start: number;
  width?: number;
}

export interface Connection {
  // To is the part side
  to: PinSide;
  // From is the chip side
  from: PinSide;
}

export type Pinout = Record<string, string>;
export interface SerializedChip {
  id: number;
  name: string;
  ins: Pinout;
  outs: Pinout;
  pins: Pinout;
  children: SerializedChip[];
}

function mask(width: number) {
  return Math.pow(2, width) - 1;
}

function setBus(busses: Pinout, pin: Pin) {
  busses[pin.name] = bin(
    (pin.busVoltage & mask(pin.width)) <<
      (pin as unknown as { start: number }).start ?? 0
  );
  return busses;
}

export function printChip(chip: Chip): SerializedChip {
  return {
    id: chip.id,
    name: chip.name ?? chip.constructor.name,
    ins: [...chip.ins.entries()].reduce(setBus, {} as Pinout),
    outs: [...chip.outs.entries()].reduce(setBus, {} as Pinout),
    pins: [...chip.pins.entries()].reduce(setBus, {} as Pinout),
    children: [...chip.parts.values()].map(printChip),
  };
}

export const BUILTIN_NAMES = [
  "Register",
  "ARegister",
  "DRegister",
  "PC",
  "RAM8",
  "RAM64",
  "RAM512",
  "RAM4K",
  "RAM16K",
  "ROM32K",
  "Screen",
  "Keyboard",
  "Memory",
];
