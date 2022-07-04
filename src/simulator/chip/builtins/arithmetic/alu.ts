import { alu, Flags } from "../../../cpu/alu"
import { Chip, HIGH, LOW } from "../../chip"

export class ALUNoStat extends Chip {
  constructor() {
    super(
      [
        "x[16]",
        "y[16]", // 16-bit inputs
        "zx", // zero the x input?
        "nx", // negate the x input?
        "zy", // zero the y input?
        "ny", // negate the y input?
        "f", // compute out = x + y (if 1) or x & y (if 0)
        "no", // negate the out output?
      ],
      [
        "out[16]", // 16-bit output
      ],
      "ALU"
    );
  }

  override eval() {
    const x = this.in("x").busVoltage;
    const y = this.in("y").busVoltage;
    const zx = this.in("zx").busVoltage << 5;
    const nx = this.in("nx").busVoltage << 4;
    const zy = this.in("zy").busVoltage << 3;
    const ny = this.in("ny").busVoltage << 2;
    const f = this.in("f").busVoltage << 1;
    const no = this.in("no").busVoltage << 0;
    const op = zx + nx + zy + ny + f + no;
    const [out] = alu(op, x, y);
    this.out().busVoltage = out;
  }
}

export class ALU extends Chip {
  constructor() {
    super(
      [
        "x[16]",
        "y[16]", // 16-bit inputs
        "zx", // zero the x input?
        "nx", // negate the x input?
        "zy", // zero the y input?
        "ny", // negate the y input?
        "f", // compute out = x + y (if 1) or x & y (if 0)
        "no", // negate the out output?
      ],
      [
        "out[16]", // 16-bit output
        "zr", // 1 if (out === 0), 0 otherwise
        "ng", // 1 if (out < 0),  0 otherwise
      ],
      "ALU"
    );
  }

  override eval() {
    const x = this.in("x").busVoltage;
    const y = this.in("y").busVoltage;
    const zx = this.in("zx").busVoltage << 5;
    const nx = this.in("nx").busVoltage << 4;
    const zy = this.in("zy").busVoltage << 3;
    const ny = this.in("ny").busVoltage << 2;
    const f = this.in("f").busVoltage << 1;
    const no = this.in("no").busVoltage << 0;
    const op = zx + nx + zy + ny + f + no;
    const [out, flags] = alu(op, x, y);
    const ng = flags === Flags.Negative ? HIGH : LOW;
    const zr = flags === Flags.Zero ? HIGH : LOW;
    this.out("out").busVoltage = out;
    this.out("ng").pull(ng);
    this.out("zr").pull(zr);
  }
}
