import { KEYBOARD_OFFSET } from "../../cpu/memory.js";
import { VmMemory } from "../memory.js";
import { OutputLib } from "./output.js";
import { BACKSPACE, NEW_LINE, StringLib } from "./string.js";

export class KeyboardLib {
  private memory: VmMemory;
  private output: OutputLib;
  private string: StringLib;

  constructor(memory: VmMemory, output: OutputLib, string: StringLib) {
    this.memory = memory;
    this.output = output;
    this.string = string;
  }

  keyPressed() {
    return this.memory.get(KEYBOARD_OFFSET);
  }

  readChar() {
    let c = 0;
    while (c == 0) {
      c = this.keyPressed();
    }
    while (this.keyPressed() != 0) {
      // wait
    }
    this.output.printChar(c);
    return c;
  }

  readLine(messagePointer: number) {
    this.output.printString(messagePointer);
    const str = this.string.new(100);
    let c = 0;
    while (c != NEW_LINE) {
      c = this.readChar();
      if (c == BACKSPACE) {
        this.output.backspace();
        this.string.eraseLastChar(str);
      } else if (c != NEW_LINE) {
        this.string.appendChar(str, c);
      }
    }
    this.output.println();
    return str;
  }

  readInt(messagePointer: number) {
    const str = this.readLine(messagePointer);
    return this.string.intValue(str);
  }
}
