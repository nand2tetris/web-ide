import { ChipPage } from "./ChipPage";

export class RamChipPage {
  constructor(private chip: ChipPage) {}

  async write(address: number, value: number): Promise<void> {
    await this.chip.setBusInput("address", address);
    await this.chip.setBusInput("in", value);
    await this.chip.setInput("load", 1);
    await this.chip.tickClock();
    await this.chip.tockClock();
  }

  async read(address: number): Promise<number> {
    await this.chip.setBusInput("address", address);
    await this.chip.setInput("load", 0);
    await this.chip.evalChip();
    return this.chip.getBusOutput("out");
  }
}
