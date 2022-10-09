import { Bus, ClockedChip, Pin } from "../../chip.js";
import { assert } from "@davidsouther/jiffies/lib/esm/assert.js";
import { Memory, Memory as MemoryChip } from "../../../cpu/memory.js";

export class RAM extends ClockedChip {
  protected _memory: MemoryChip;
  private _nextData: number = 0;
  private _address: number = 0;

  get memory() {
    return this._memory;
  }
  get address() {
    return this._address;
  }

  constructor(readonly width: number, name?: string) {
    super(["in[16]", "load", `address[${width}]`], [`out[16]`], name);
    this._memory = new MemoryChip(Math.pow(2, this.width));
  }

  override tick() {
    const load = this.in("load").voltage();
    this._address = this.in("address").busVoltage;
    if (load) {
      this._nextData = this.in().busVoltage;
      this._memory.set(this._address, this._nextData);
    }
  }

  override tock() {
    this.out().busVoltage = this._memory?.get(this._address) ?? 0;
  }

  override eval() {
    const address = this.in("address").busVoltage;
    this.out().busVoltage = this._memory?.get(address) ?? 0;
  }

  at(idx: number): Pin {
    assert(
      idx < this._memory.size,
      () => `Request out of bounds (${idx} >= ${this._memory.size})`
    );
    return new RamBus(`${this.name}[${idx}]`, idx, this._memory);
  }
}

export class RamBus extends Bus {
  constructor(
    name: string,
    private readonly index: number,
    private ram: Memory
  ) {
    super(name);
  }

  override get busVoltage(): number {
    return this.ram.get(this.index);
  }

  override set busVoltage(num: number) {
    this.ram.set(this.index, num);
  }
}

export class RAM8 extends RAM {
  constructor(name?: string) {
    super(3, name);
  }
}

export class RAM64 extends RAM {
  constructor(name?: string) {
    super(6, name);
  }
}

export class RAM512 extends RAM {
  constructor(name?: string) {
    super(9, name);
  }
}

export class RAM4K extends RAM {
  constructor(name?: string) {
    super(12, name);
  }
}

export class RAM16K extends RAM {
  constructor(name?: string) {
    super(14, name);
  }
}
