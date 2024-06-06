import { Chip, LOW, Voltage } from "../../chip.js";

export function mux(a: Voltage, b: Voltage, sel: Voltage): [Voltage] {
  return [sel === LOW ? a : b];
}

export function mux16(a: number, b: number, sel: Voltage): [number] {
  return [sel === LOW ? a : b];
}

export function mux16_4(
  a: number,
  b: number,
  c: number,
  d: number,
  sel: number,
): [number] {
  const s2 = (sel & 0b01) as Voltage;
  return (sel & 0b10) === 0b00 ? mux16(a, b, s2) : mux16(c, d, s2);
}

export function mux16_8(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  sel: number,
): [number] {
  const s2 = (sel & 0b11) as Voltage;
  return (sel & 0b100) === 0b000
    ? mux16_4(a, b, c, d, s2)
    : mux16_4(e, f, g, h, s2);
}

export class Mux extends Chip {
  constructor() {
    super(["a", "b", "sel"], ["out"]);
  }

  override eval() {
    const a = this.in("a").voltage();
    const b = this.in("b").voltage();
    const sel = this.in("sel").voltage();

    const [set] = mux(a, b, sel);
    this.out().pull(set);
  }
}

export class Mux16 extends Chip {
  constructor() {
    super(["a[16]", "b[16]", "sel"], ["out[16]"]);
  }

  override eval() {
    const a = this.in("a").busVoltage;
    const b = this.in("b").busVoltage;
    const sel = this.in("sel").voltage();
    const [out] = mux16(a, b, sel);
    this.out().busVoltage = out;
  }
}

export class Mux4Way16 extends Chip {
  constructor() {
    super(["a[16]", "b[16]", "c[16]", "d[16]", "sel[2]"], ["out[16]"]);
  }

  override eval() {
    const a = this.in("a").busVoltage;
    const b = this.in("b").busVoltage;
    const c = this.in("c").busVoltage;
    const d = this.in("d").busVoltage;
    const sel = this.in("sel").busVoltage;
    const [out] = mux16_4(a, b, c, d, sel);

    this.out().busVoltage = out;
  }
}

export class Mux8Way16 extends Chip {
  constructor() {
    super(
      [
        "a[16]",
        "b[16]",
        "c[16]",
        "d[16]",
        "e[16]",
        "f[16]",
        "g[16]",
        "h[16]",
        "sel[3]",
      ],
      ["out[16]"],
    );
  }

  override eval() {
    const a = this.in("a").busVoltage;
    const b = this.in("b").busVoltage;
    const c = this.in("c").busVoltage;
    const d = this.in("d").busVoltage;
    const e = this.in("e").busVoltage;
    const f = this.in("f").busVoltage;
    const g = this.in("g").busVoltage;
    const h = this.in("h").busVoltage;
    const sel = this.in("sel").busVoltage;
    const [out] = mux16_8(a, b, c, d, e, f, g, h, sel);

    this.out().busVoltage = out;
  }
}
