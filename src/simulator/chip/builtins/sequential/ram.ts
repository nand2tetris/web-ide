import { isSome, None, Option, Some } from "@davidsouther/jiffies/result.js";
import { HIGH } from "../../chip.js";
import { ClockedChip } from "../../clock.js";

class RAM extends ClockedChip {
  private ram = new Int16Array(Math.pow(2, this.width));
  private nextData: Option<number> = None();

  constructor(private readonly width: number) {
    super(["in[16]", "load", `address[${width}]`], [`out[16]`]);
  }

  tick() {
    const load = this.in("low").voltage();
    this.nextData = load === HIGH ? Some(this.in().busVoltage) : None();
  }

  tock() {
    const address = this.in("address").busVoltage;
    if (isSome(this.nextData)) {
      this.ram[address] = this.nextData;
    }
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
