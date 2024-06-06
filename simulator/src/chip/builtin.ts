import { Memory } from "./builtins/computer/computer.js";
import { RAM } from "./builtins/sequential/ram.js";
import { Chip, Pin } from "./chip.js";

export function getBuiltinValue(
  chip: string,
  part: Chip,
  idx: number,
): Pin | undefined {
  switch (chip) {
    case "Register":
    case "ARegister":
    case "DRegister":
    case "PC":
    case "KEYBOARD":
      return part.out();
    case "RAM8":
    case "RAM64":
    case "RAM512":
    case "RAM4K":
    case "RAM16K":
    case "ROM32K":
    case "Screen":
      return (part as RAM).at(idx);
    case "Memory":
      return (part as Memory).at(idx);
    default:
      return undefined;
  }
}
