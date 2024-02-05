import {
  ClockedChip,
  ConstantBus,
  HIGH,
  LOW,
  Pin,
  Voltage,
} from "../../chip.js";

export class Bit extends ClockedChip {
  bit: Voltage = LOW;

  constructor(name?: string) {
    super(["in", "load"], ["out"], name);
  }

  override tick() {
    if (this.in("load").voltage() === HIGH) {
      this.bit = this.in().voltage();
    }
  }

  override tock() {
    this.out().pull(this.bit ?? 0);
  }

  override reset() {
    this.bit = LOW;
    super.reset();
  }
}

export class Register extends ClockedChip {
  bits = 0x00;

  constructor(name?: string) {
    super(["in[16]", "load"], ["out[16]"], name);
  }

  override tick() {
    if (this.in("load").voltage() === HIGH) {
      this.bits = this.in().busVoltage & 0xffff;
    }
  }

  override tock() {
    this.out().busVoltage = this.bits & 0xffff;
  }

  override get(name: string, offset?: number): Pin | undefined {
    return name === this.name
      ? new ConstantBus("DRegister", this.bits & 0xffff)
      : super.get(name, offset);
  }

  override reset() {
    this.bits = 0x00;
    super.reset();
  }
}

export class VRegister extends Register {}

export class PC extends ClockedChip {
  bits = 0x00;

  constructor(name?: string) {
    super(["in[16]", "load", "inc", "reset"], ["out[16]"], name);
  }

  override tick() {
    if (this.in("reset").voltage() === HIGH) {
      this.bits = 0;
    } else if (this.in("load").voltage() === HIGH) {
      this.bits = this.in().busVoltage & 0xffff;
    } else if (this.in("inc").voltage() === HIGH) {
      this.bits += 1;
    }
  }

  override tock() {
    this.out().busVoltage = this.bits & 0xffff;
  }

  override get(name: string, offset?: number): Pin | undefined {
    return name === this.name ? this.out() : super.get(name, offset);
  }

  override reset() {
    this.bits = 0x00;
    super.reset();
  }
}
