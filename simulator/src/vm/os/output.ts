import { ScreenLib } from "./screen.js";
import { StringLib, intToCharArray } from "./string.js";

const MAX_WIDTH = 64;
const MAX_HEIGHT = 22;

export class OutputLib {
  private col = 0;
  private row = 0;
  private screen: ScreenLib;
  private string: StringLib;

  constructor(screen: ScreenLib, string: StringLib) {
    this.screen = screen;
    this.string = string;
  }

  private clear() {
    this.screen.color = !this.screen.color;
    this.screen.drawRect(
      this.col * 8,
      this.row * 11,
      (this.col + 1) * 8,
      (this.row + 1) * 11
    );
    this.screen.color = !this.screen.color;
  }

  moveCursor(i: number, j: number) {
    this.clear();
    this.row = i;
    this.col = j;
    this.printChar(0); // draw the cursor
  }

  println() {
    this.row += 1;
    this.col = 0;
  }

  printChar(code: number) {
    this.screen.drawRect(
      this.col * 8 + 2,
      this.row * 11 + 2,
      (this.col + 1) * 8 - 2,
      (this.row + 1) * 11 - 2
    );
    this.col += 1;
    if (this.col == MAX_WIDTH) {
      this.println();
      if (this.row == MAX_HEIGHT) {
        // TODO
      }
    }
  }

  printString(pointer: number) {
    for (let i = 0; i < this.string.length(pointer); i++) {
      this.printChar(this.string.charAt(pointer, i));
    }
  }

  printInt(value: number) {
    for (const c of intToCharArray(value)) {
      this.printChar(c);
    }
  }

  backspace() {
    this.clear();
    this.col -= 1;
    if (this.col < 0) {
      this.col = 0;
      this.row -= 1;
      if (this.row < 0) {
        this.row = 0;
      }
    }
    this.printChar(0); // draw the cursor again.
  }
}
