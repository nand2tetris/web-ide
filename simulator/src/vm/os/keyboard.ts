import { KEYBOARD_OFFSET } from "../../cpu/memory.js";
import { VmMemory } from "../memory.js";
import { OS } from "./os.js";
import { BACKSPACE, NEW_LINE } from "./string.js";

export class KeyboardLib {
  private memory: VmMemory;
  private os: OS;
  private animationFrameId: number | undefined = undefined;
  private cancel = false;

  constructor(memory: VmMemory, os: OS) {
    this.memory = memory;
    this.os = os;
  }

  keyPressed() {
    return this.memory.get(KEYBOARD_OFFSET);
  }

  private readCharLoop(resolve: (value: number) => void) {
    let pressed = false;
    let c = 0;

    const loop = () => {
      if (this.cancel) {
        return;
      }

      let exit = false;

      if (!this.os.paused) {
        if (!pressed && this.keyPressed() !== 0) {
          pressed = true;
          c = this.keyPressed();
        }
        if (pressed && this.keyPressed() === 0) {
          exit = true;
          resolve(c);
        }
      }

      if (!exit) {
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };

    loop();
  }

  readChar() {
    this.os.sys.block();
    this.os.output.drawCursor();

    new Promise<number>((resolve) => {
      this.readCharLoop(resolve);
    }).then((c) => {
      this.os.output.printChar(c);
      this.os.sys.release(c);
    });
  }

  private readLineLoop(resolve: (value: number) => void) {
    const str = this.os.string.new(100);
    if (this.os.sys.halted) {
      resolve(0);
    }
    let pressed = false;
    let c = 0;

    const loop = () => {
      if (this.cancel) {
        return;
      }

      let exit = false;

      if (!this.os.paused) {
        if (!pressed && this.keyPressed() != 0) {
          pressed = true;
          c = this.keyPressed();
        }
        if (pressed && this.keyPressed() == 0) {
          pressed = false;
          // key was released
          if (c == BACKSPACE) {
            if (this.os.string.length(str) > 0) {
              this.os.output.backspace();
            }
            this.os.string.eraseLastChar(str);
          } else if (c == NEW_LINE) {
            resolve(str);
            exit = true;
          } else {
            this.os.string.appendChar(str, c);
            if (this.os.sys.halted) {
              resolve(0);
            }
            this.os.output.printChar(c);
            this.os.output.drawCursor();
          }
        }
      }

      if (!exit) {
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };

    loop();
  }

  readLine(messagePointer: number) {
    this.os.sys.block();
    this.os.output.printString(messagePointer);
    this.os.output.drawCursor();

    new Promise<number>((resolve) => {
      this.readLineLoop(resolve);
    }).then((str) => {
      if (!this.os.sys.halted) {
        this.os.output.clearChar();
        this.os.output.println();
      }
      this.os.sys.release(str);
    });
  }

  readInt(messagePointer: number) {
    this.os.sys.block();
    this.os.output.printString(messagePointer);
    this.os.output.drawCursor();

    new Promise<number>((resolve) => {
      this.readLineLoop(resolve);
    }).then((str) => {
      if (!this.os.sys.halted) {
        this.os.output.clearChar();
        this.os.output.println();
      }
      this.os.sys.release(this.os.string.intValue(str));
    });
  }

  dispose() {
    this.cancel = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
