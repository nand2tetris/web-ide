import { FONT } from "./font.js";
import { ScreenLib } from "./screen.js";
import { StringLib, intToCharArray } from "./string.js";

const MAX_WIDTH = 64;
const MAX_HEIGHT = 22;

export class OutputLib {
  private col = 0;
  private row = 0;
  private screen: ScreenLib;
  private string: StringLib;
  private lastColor = false;

  constructor(screen: ScreenLib, string: StringLib) {
    this.screen = screen;
    this.string = string;
  }

  private setColor(color: boolean) {
    this.lastColor = this.screen.color;
    this.screen.color = color;
  }

  private restoreColor() {
    this.screen.color = this.lastColor;
  }

  clearChar() {
    this.setColor(false);
    this.screen.drawRect(
      this.col * 8,
      this.row * 11,
      (this.col + 1) * 8,
      (this.row + 1) * 11
    );
    this.restoreColor();
  }

  moveCursor(i: number, j: number) {
    this.row = i;
    this.col = j;
    this.drawCursor();
  }

  println() {
    this.row += 1;
    this.col = 0;
  }

  drawCursor() {
    this.clearChar();
    this.setColor(true);
    this.screen.drawRect(
      this.col * 8 + 2,
      this.row * 11 + 2,
      (this.col + 1) * 8 - 2,
      (this.row + 1) * 11 - 2
    );
    this.restoreColor();
  }

  printChar(code: number) {
    const bitmap = FONT[code];
    if (bitmap) {
      this.clearChar();
      this.setColor(true);
      for (let row = 0; row < bitmap.length; row++) {
        for (let col = 0; col < bitmap[row].length; col++) {
          if (bitmap[row][col]) {
            this.screen.drawPixel(this.col * 8 + col, this.row * 11 + row);
          }
        }
      }
      this.restoreColor();
    }

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
    this.clearChar();
    this.col -= 1;
    if (this.col < 0) {
      this.col = 0;
      this.row -= 1;
      if (this.row < 0) {
        this.row = 0;
      }
    }
    this.drawCursor();
  }
}
