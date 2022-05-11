import { assert, assertString } from "@davidsouther/jiffies/assert.js";
import { range } from "@davidsouther/jiffies/range.js";
import { bin, nand16 } from "../../util/twos.js";

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

function nameOf(pin: string | Pin): string {
  return typeof pin === "string" ? pin : pin.name;
}

export class Bus implements Pin {
  state: Voltage[];
  next: Pin[] = [];
  constructor(readonly name: string, readonly width = 1) {
    this.state = range(0, this.width).map(() => 0);
  }

  connect(next: Pin) {
    this.next.push(next);
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
    this.next.forEach((n) => (n.busVoltage = voltage));
  }

  get busVoltage(): number {
    return range(0, this.width).reduce((b, i) => b | (this.state[i] << i), 0);
  }

  toggle(bit = 0) {
    const nextVoltage = this.voltage(bit) == LOW ? HIGH : LOW;
    this.pull(nextVoltage, bit);
  }
}

export class SubBus implements Pin {
  readonly name: string;
  constructor(private bus: Pin, private start: number, readonly width = 1) {
    this.name = bus.name;
    assert(start >= 0 && start + width <= bus.width);
  }

  pull(voltage: Voltage, bit = 0) {
    assert(bit >= 0 && bit < this.width);
    this.bus.pull(voltage, this.start + bit);
  }

  toggle(bit = 0) {
    const nextVoltage = this.voltage(bit) == LOW ? HIGH : LOW;
    this.pull(nextVoltage, bit);
  }

  voltage(bit = 0): Voltage {
    assert(bit >= 0 && bit < this.width);
    return this.bus.voltage(this.start + bit);
  }

  set busVoltage(voltage: number) {
    this.bus.busVoltage = (voltage & mask(this.width)) << this.start;
  }

  get busVoltage(): number {
    return this.bus.busVoltage >> this.start;
  }

  connect(bus: Pin): void {
    assert(this.start + this.width <= bus.width);
    this.bus = bus;
  }
}

export class TrueBus extends Bus {
  constructor(name: string) {
    super(name, 16);
  }
  pullHigh(_ = 0) {}
  pullLow(_ = 0) {}
  voltage(_ = 0): Voltage {
    return HIGH;
  }
}

export class FalseBus extends Bus {
  constructor(name: string) {
    super(name, 16);
  }
  pullHigh(_ = 0) {}
  pullLow(_ = 0) {}
  voltage(_ = 0): Voltage {
    return LOW;
  }
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

  has(pin: string | Pin): boolean {
    return this.map.has(nameOf(pin));
  }

  get(pin: string | Pin): Pin | undefined {
    return this.map.get(nameOf(pin));
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
    for (const oot of outs) {
      const { pin, start = 1 } =
        (oot as { pin: string }).pin !== undefined
          ? (oot as { pin: string; start: number })
          : parseToPin(oot as string);
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

  wire(chip: Chip, connections: Connection[]) {
    this.parts.add(chip);
    for (const { to, from } of connections) {
      if (chip.isOutPin(nameOf(to))) {
        const outPin = chip.outs.get(to)!;
        const output = this.findPin(nameOf(from), outPin.width);
        outPin.connect(output);
      } else {
        let toParse = assertString(nameOf(to));
        const { pin, start, end } = parseToPin(toParse);
        const inPin = chip.ins.get(pin)!;
        let input = this.findPin(nameOf(from), inPin.width);
        if (start) {
          if (end) {
            assert(end > start);
            const width = end - start;
            input = new SubBus(input, start, width);
          } else {
            input = new SubBus(input, start);
          }
        } else {
        }
        input.connect(inPin);
      }
    }
  }

  private findPin(from: string, minWidth?: number): Pin {
    if (from === "True" || from === "1") {
      return new TrueBus("True");
    }
    if (from === "false" || from === "0") {
      return new FalseBus("False");
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

export interface Connection {
  to: string | Pin;
  from: string | Pin;
}

export class DFF extends Chip {
  private t: Voltage = LOW;

  constructor() {
    super(["in"], ["out"]);
  }

  tick() {
    // Read in into t
    this.t = this.in().voltage();
  }

  tock() {
    // write t into out
    this.out().pull(this.t);
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
