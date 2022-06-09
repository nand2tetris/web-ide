import {
  assert,
  assertExists,
  assertString,
} from "@davidsouther/jiffies/assert.js";
import { range } from "@davidsouther/jiffies/range.js";
import { bin } from "../../util/twos.js";

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
    this.state = range(0, this.width).map(() => 0);
  }

  connect(next: Pin) {
    this.next.push(next);
    next.busVoltage = this.busVoltage;
  }

  pull(voltage: Voltage, bit = 0) {
    assert(bit >= 0 && bit < this.width);
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
    const nextVoltage = this.voltage(bit) == LOW ? HIGH : LOW;
    this.pull(nextVoltage, bit);
  }
}

export class InSubBus extends Bus {
  constructor(private bus: Pin, private start: number, readonly width = 1) {
    super(bus.name);
    assert(start >= 0 && start + width <= bus.width);
  }

  pull(voltage: Voltage, bit = 0) {
    assert(bit >= 0 && bit < this.width);
    this.bus.pull(voltage, this.start + bit);
  }

  voltage(bit = 0): Voltage {
    assert(bit >= 0 && bit < this.width);
    return this.bus.voltage(this.start + bit);
  }

  set busVoltage(voltage: number) {
    const high = this.bus.busVoltage & ~mask(this.width + this.start);
    const low = this.bus.busVoltage & mask(this.start);
    const mid = (voltage & mask(this.width)) << this.start;
    this.bus.busVoltage = high | mid | low;
  }

  get busVoltage(): number {
    return (this.bus.busVoltage >> this.start) & mask(this.width);
  }

  connect(bus: Pin): void {
    assert(this.start + this.width <= bus.width);
    this.bus = bus;
  }
}

export class OutSubBus extends Bus {
  constructor(private bus: Pin, private start: number, readonly width = 1) {
    super(bus.name);
    assert(start >= 0 && width <= bus.width);
  }

  set busVoltage(voltage: number) {
    this.bus.busVoltage =
      (voltage & mask(this.width + this.start)) >> this.start;
  }

  get busVoltage(): number {
    return this.bus.busVoltage & mask(this.width);
  }

  connect(bus: Pin): void {
    assert(this.width <= bus.width);
    this.bus = bus;
  }
}

export class ConstantBus extends Bus {
  constructor(name: string, private readonly value: number) {
    super(name, 16 /* TODO: get high bit index */);
  }

  pullHigh(_ = 0) {}
  pullLow(_ = 0) {}
  voltage(_ = 0): Voltage {
    return (this.busVoltage & 0x1) as Voltage;
  }

  set busVoltage(voltage: number) {
    // Noop
  }
  get busVoltage(): number {
    return this.value;
  }
}

export const TRUE_BUS = new ConstantBus("true", 0xffff);
export const FALSE_BUS = new ConstantBus("false", 0);

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
    let { name } = pin;
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
}

let id = 0;
export class Chip {
  readonly id = id++;
  ins = new Pins();
  outs = new Pins();
  pins = new Pins();
  parts = new Set<Chip>();

  constructor(
    ins: (string | { pin: string; start: number })[],
    outs: (string | { pin: string; start: number })[],
    public name?: string
  ) {
    for (const inn of ins) {
      const { pin, start = 1 } =
        (inn as { pin: string }).pin !== undefined
          ? (inn as { pin: string; start: number })
          : parseToPin(inn as string);
      this.ins.insert(new Bus(pin, start));
    }
    for (const out of outs) {
      const { pin, start = 1 } =
        (out as { pin: string }).pin !== undefined
          ? (out as { pin: string; start: number })
          : parseToPin(out as string);
      this.outs.insert(new Bus(pin, start));
    }
  }

  in(pin = "in"): Pin {
    assert(this.ins.has(pin));
    return this.ins.get(pin)!;
  }

  out(pin = "out"): Pin {
    assert(this.outs.has(pin));
    return this.outs.get(pin)!;
  }

  pin(name: string): Pin {
    assert(this.pins.has(name));
    return this.pins.get(name)!;
  }

  get(name: string): Pin | undefined {
    if (this.ins.has(name)) {
      return this.ins.get(name)!;
    }
    if (this.outs.has(name)) {
      return this.outs.get(name)!;
    }
    if (this.pins.has(name)) {
      return this.pins.get(name)!;
    }
    return undefined;
  }

  isOutPin(pin: string): boolean {
    return this.outs.has(pin);
  }

  wire(part: Chip, connections: Connection[]) {
    this.parts.add(part);
    for (const { to, from } of connections) {
      let pin = assertString(to.name);
      if (part.isOutPin(to.name)) {
        const outPin = assertExists(
          part.outs.get(pin),
          () => `Cannot wire to missing pin ${pin}`
        );
        const output = this.findPin(from.name, outPin.width);

        if (from.start == 0 && outPin.width == output.width) {
          outPin.connect(output);
        } else {
          const outBus = new OutSubBus(output, to.start, to.width);
          outPin.connect(outBus);
          outBus.connect(output);
        }
      } else {
        const inPin = assertExists(
          part.ins.get(pin),
          () => `Cannot wire to missing pin ${pin}`
        );
        let input = this.findPin(from.name, inPin.width);

        if (from.start == 0 && inPin.width == input.width) {
          input.connect(inPin);
        } else {
          const inBus = new InSubBus(inPin, to.start, to.width);
          input.connect(inBus);
          inBus.connect(inPin);
        }
      }
    }
  }

  private findPin(from: string, minWidth?: number): Pin {
    if (from.toLowerCase() === "true" || from === "1") {
      return TRUE_BUS;
    }
    if (from.toLowerCase() === "false" || from === "0") {
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

  eval() {
    for (const chip of this.parts) {
      // TODO topological sort
      // eval chip input busses
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

export interface PinSide {
  name: string;
  start: number;
  width: number;
}

export interface Connection {
  // To is the part side
  to: PinSide;
  // From is the chip side
  from: PinSide;
}

export class DFF extends Chip {
  private t: Voltage = LOW;

  constructor() {
    super(["in"], ["out"]);
  }

  tick() {
    // Read in into t
    this.t = this.in().voltage();
    this.eval();
  }

  tock() {
    // write t into out
    this.out().pull(this.t);
    this.eval();
  }
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
