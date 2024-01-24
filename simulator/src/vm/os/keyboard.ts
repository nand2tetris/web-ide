import { KEYBOARD_OFFSET } from "../../cpu/memory.js";
import { VmMemory } from "../memory.js";
import { OutputLib } from "./output.js";
import { BACKSPACE, NEW_LINE, StringLib } from "./string.js";
import { SysLib } from "./sys.js";

export class KeyboardLib {
  private memory: VmMemory;
  private output: OutputLib;
  private string: StringLib;
  private sys: SysLib;
  private interval?: NodeJS.Timeout;

  constructor(
    memory: VmMemory,
    output: OutputLib,
    string: StringLib,
    sys: SysLib
  ) {
    this.memory = memory;
    this.output = output;
    this.string = string;
    this.sys = sys;
  }

  keyPressed() {
    return this.memory.get(KEYBOARD_OFFSET);
  }

  private readCharLoop(resolve: (value: number) => void) {
    let pressed = false;
    let c = 0;
    this.interval = setInterval(() => {
      if (!pressed && this.keyPressed() != 0) {
        pressed = true;
        c = this.keyPressed();
      }
      if (pressed && this.keyPressed() == 0) {
        clearInterval(this.interval);
        resolve(c);
      }
    }, 1);
  }

  readChar() {
    this.sys.block();
    this.output.drawCursor();

    new Promise<number>((resolve) => {
      this.readCharLoop(resolve);
    }).then((c) => {
      this.output.printChar(c);
      this.sys.release(c);
    });
  }

  private readLineLoop(resolve: (value: number) => void) {
    const str = this.string.new(100);

    let pressed = false;
    let c = 0;
    this.interval = setInterval(() => {
      if (!pressed && this.keyPressed() != 0) {
        pressed = true;
        c = this.keyPressed();
      }
      if (pressed && this.keyPressed() == 0) {
        pressed = false;
        // key was released
        if (c == BACKSPACE) {
          if (this.string.length(str) > 0) {
            this.output.backspace();
          }
          this.string.eraseLastChar(str);
        } else if (c == NEW_LINE) {
          clearInterval(this.interval);
          resolve(str);
        } else {
          this.string.appendChar(str, c);
          this.output.printChar(c);
          this.output.drawCursor();
        }
      }
    }, 1);
  }

  readLine(messagePointer: number) {
    this.sys.block();
    this.output.printString(messagePointer);
    this.output.drawCursor();

    new Promise<number>((resolve) => {
      this.readLineLoop(resolve);
    }).then((str) => {
      this.output.clearChar();
      this.output.println();
      this.sys.release(str);
    });
  }

  readInt(messagePointer: number) {
    this.sys.block();
    this.output.printString(messagePointer);
    this.output.drawCursor();

    new Promise<number>((resolve) => {
      this.readLineLoop(resolve);
    }).then((str) => {
      this.output.clearChar();
      this.output.println();
      this.sys.release(this.string.intValue(str));
    });
  }

  dispose() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
