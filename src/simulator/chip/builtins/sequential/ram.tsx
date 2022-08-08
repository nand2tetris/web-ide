import { Bus, ClockedChip, Pin } from "../../chip";
import { assert } from "@davidsouther/jiffies/lib/esm/assert";
import { Memory as MemoryComponent } from "../../../../components/chips/memory";
import { Memory, Memory as MemoryChip } from "../../../cpu/memory";

export class RAM extends ClockedChip {
  protected memory: MemoryChip;
  private nextData: number = 0;
  private address: number = 0;

  constructor(protected readonly width: number, name?: string) {
    super(["in[16]", "load", `address[${width}]`], [`out[16]`], name);
    this.memory = new MemoryChip(Math.pow(2, this.width));
  }

  override tick() {
    const load = this.in("load").voltage();
    this.address = this.in("address").busVoltage;
    if (load) {
      this.nextData = this.in().busVoltage;
      this.memory.set(this.address, this.nextData);
    }
  }

  override tock() {
    this.out().busVoltage = this.memory?.get(this.address) ?? 0;
  }

  override eval() {
    const address = this.in("address").busVoltage;
    this.out().busVoltage = this.memory?.get(address) ?? 0;
  }

  at(idx: number): Pin {
    assert(
      idx < this.memory.size,
      () => `Request out of bounds (${idx} >= ${this.memory.size})`
    );
    return new RamBus(`${this.name}[${idx}]`, idx, this.memory);
  }

  override render() {
    return [<MemoryComponent memory={this.memory} format="dec" />];
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

  override render() {
    return [<span>RAM {this.width}</span>];
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
