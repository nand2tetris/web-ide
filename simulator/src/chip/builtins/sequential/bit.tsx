import { Bus, ClockedChip, HIGH, LOW, Pin, Voltage } from "../../chip.js";

export class Bit extends ClockedChip {
  bit: Voltage = LOW;

  constructor(name?: string) {
    super(["in", "load"], ["out"], name, [], ["in", "load"]);
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

class RegisterBus extends Bus {
  constructor(
    name: string,
    private register: { bits: number },
  ) {
    super(name);
  }

  override get busVoltage(): number {
    return this.register.bits & 0xffff;
  }

  override set busVoltage(num: number) {
    this.register.bits = num & 0xffff;
  }
}

export class Register extends ClockedChip {
  bits = 0x00;

  constructor(name?: string) {
    super(["in[16]", "load"], ["out[16]"], name, [], ["in", "load"]);
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
      ? new RegisterBus(this.name, this)
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
    super(
      ["in[16]", "reset", "load", "inc"],
      ["out[16]"],
      name,
      [],
      ["in", "reset", "load", "inc"],
    );
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
    return name === this.name
      ? new RegisterBus(this.name, this)
      : super.get(name, offset);
  }

  override reset() {
    this.bits = 0x00;
    super.reset();
  }
}
