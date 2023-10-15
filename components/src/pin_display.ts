import { Err, Ok, isErr, isOk } from "@davidsouther/jiffies/lib/esm/result.js";
import {
  REGISTRY as BUILTIN_REGISTRY,
  getBuiltinChip,
} from "@nand2tetris/simulator/chip/builtins/index.js";

export class ChipDisplayInfo {
  signBehaviors: Map<string, boolean> = new Map();

  public constructor(chipName: string, unsigned?: string[]) {
    if (BUILTIN_REGISTRY.has(chipName)) {
      const chip = getBuiltinChip(chipName);
      console.log(isErr(chip) ? Err(chip) : Ok(chip));
      if (isOk(chip)) {
        const pins = Array.from(Ok(chip).ins.entries()).concat(
          Array.from(Ok(chip).outs.entries())
        );
        for (const pin of pins) {
          this.signBehaviors.set(
            pin.name,
            !unsigned || !unsigned.includes(pin.name)
          );
        }
      }
    }
  }

  public isSigned(pin: string) {
    return this.signBehaviors.get(pin);
  }
}

const UNSIGNED_PINS = new Map<string, string[]>([
  ["Mux4Way16", ["sel"]],
  ["Mux8Way16", ["sel"]],
  ["DMux4Way", ["sel"]],
  ["DMux8Way", ["sel"]],
  ["RAM8", ["address"]],
  ["RAM64", ["address"]],
  ["RAM512", ["address"]],
  ["RAM4K", ["address"]],
  ["RAM16K", ["address"]],
  ["Memory", ["address"]],
  ["CPU", ["addressM", "pc"]],
]);

export const getDisplayInfo = (chipName: string) =>
  new ChipDisplayInfo(chipName, UNSIGNED_PINS.get(chipName));
