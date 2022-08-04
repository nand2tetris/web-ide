import { ReactNode } from "react";
import { Bus, ClockedChip, Pin } from "../../chip";
import { assert } from "@davidsouther/jiffies/lib/esm/assert";

export class RAM extends ClockedChip {
  private ram: Int16Array;
  private nextData: number = 0;
  private address: number = 0;

  constructor(protected readonly width: number) {
    super(["in[16]", "load", `address[${width}]`], [`out[16]`]);
    this.ram = new Int16Array(Math.pow(2, this.width));
  }

  override tick() {
    const load = this.in("load").voltage();
    this.address = this.in("address").busVoltage;
    if (load) {
      this.nextData = this.in().busVoltage;
      this.ram[this.address] = this.nextData;
    }
  }

  override tock() {
    this.out().busVoltage = this.ram?.[this.address];
  }

  override eval() {
    const address = this.in("address").busVoltage;
    this.out().busVoltage = this.ram?.[address];
  }

  at(idx: number): Pin {
    assert(
      idx < this.ram.length,
      () => `Request out of bounds (${idx} >= ${this.ram.length})`
    );
    return new RamBus(`${this.name}[${idx}]`, idx, this.ram);
  }
}

export class RamBus extends Bus {
  constructor(
    name: string,
    private readonly index: number,
    private ram: Int16Array
  ) {
    super(name);
  }

  override get busVoltage(): number {
    return this.ram[this.index];
  }

  override set busVoltage(num: number) {
    this.ram[this.index] = num;
  }
}

export class RAM8 extends RAM {
  constructor() {
    super(3);
  }

  override render(): ReactNode {
    return <span>RAM {this.width}</span>;
  }
}

export class RAM64 extends RAM {
  constructor() {
    super(6);
  }
}

export class RAM512 extends RAM {
  constructor() {
    super(9);
  }
}

export class RAM4K extends RAM {
  constructor() {
    super(12);
  }
}

export class RAM16K extends RAM {
  constructor() {
    super(14);
  }
}
