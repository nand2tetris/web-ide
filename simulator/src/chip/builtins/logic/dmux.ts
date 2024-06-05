import { Chip, HIGH, LOW, Voltage } from "../../chip.js";

export function dmux(inn: Voltage, sel: Voltage): [Voltage, Voltage] {
  const a = sel === LOW && inn === HIGH ? HIGH : LOW;
  const b = sel === HIGH && inn === HIGH ? HIGH : LOW;
  return [a, b];
}

export function dmux4way(
  inn: Voltage,
  sel: number,
): [Voltage, Voltage, Voltage, Voltage] {
  const a = sel === 0b00 && inn === HIGH ? HIGH : LOW;
  const b = sel === 0b01 && inn === HIGH ? HIGH : LOW;
  const c = sel === 0b10 && inn === HIGH ? HIGH : LOW;
  const d = sel === 0b11 && inn === HIGH ? HIGH : LOW;
  return [a, b, c, d];
}

export function dmux8way(
  inn: Voltage,
  sel: number,
): [Voltage, Voltage, Voltage, Voltage, Voltage, Voltage, Voltage, Voltage] {
  const a = sel === 0b000 && inn === HIGH ? HIGH : LOW;
  const b = sel === 0b001 && inn === HIGH ? HIGH : LOW;
  const c = sel === 0b010 && inn === HIGH ? HIGH : LOW;
  const d = sel === 0b011 && inn === HIGH ? HIGH : LOW;
  const e = sel === 0b100 && inn === HIGH ? HIGH : LOW;
  const f = sel === 0b101 && inn === HIGH ? HIGH : LOW;
  const g = sel === 0b110 && inn === HIGH ? HIGH : LOW;
  const h = sel === 0b111 && inn === HIGH ? HIGH : LOW;
  return [a, b, c, d, e, f, g, h];
}

export class DMux extends Chip {
  constructor() {
    super(["in", "sel"], ["a", "b"]);
  }

  override eval() {
    const inn = this.in("in").voltage();
    const sel = this.in("sel").voltage();

    const [a, b] = dmux(inn, sel);
    this.out("a").pull(a);
    this.out("b").pull(b);
  }
}

export class DMux4Way extends Chip {
  constructor() {
    super(["in", "sel[2]"], ["a", "b", "c", "d"]);
  }

  override eval() {
    const inn = this.in("in").voltage();
    const sel = this.in("sel").busVoltage;

    const [a, b, c, d] = dmux4way(inn, sel);
    this.out("a").pull(a);
    this.out("b").pull(b);
    this.out("c").pull(c);
    this.out("d").pull(d);
  }
}

export class DMux8Way extends Chip {
  constructor() {
    super(["in", "sel[3]"], ["a", "b", "c", "d", "e", "f", "g", "h"]);
  }

  override eval() {
    const inn = this.in("in").voltage();
    const sel = this.in("sel").busVoltage;

    const [a, b, c, d, e, f, g, h] = dmux8way(inn, sel);
    this.out("a").pull(a);
    this.out("b").pull(b);
    this.out("c").pull(c);
    this.out("d").pull(d);
    this.out("e").pull(e);
    this.out("f").pull(f);
    this.out("g").pull(g);
    this.out("h").pull(h);
  }
}
