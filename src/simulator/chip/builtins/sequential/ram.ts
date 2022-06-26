import { isSome, None, Option, Some } from "@davidsouther/jiffies/src/result";
import { ClockedChip, HIGH } from "../../chip"

export class RAM extends ClockedChip {
  private ram: Int16Array;
  private nextData: Option<number> = None();

  constructor(private readonly width: number) {
    super(["in[16]", "load", `address[${width}]`], [`out[16]`]);
    this.ram = new Int16Array(Math.pow(2, this.width));
  }

  override tick() {
    const load = this.in("load").voltage();
    this.nextData = load === HIGH ? Some(this.in().busVoltage) : None();
  }

  override tock() {
    const address = this.in("address").busVoltage;
    if (isSome(this.nextData)) {
      this.ram[address] = this.nextData;
    }
    this.out().busVoltage = this.ram?.[address];
  }

  override eval() {
    const address = this.in("address").busVoltage;
    this.out().busVoltage = this.ram?.[address];
  }
}

export class RAM8 extends RAM {
  constructor() {
    super(3);
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
