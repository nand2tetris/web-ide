import { ERRNO } from "./errors.js";
import { FONT } from "./font.js";
import { OS } from "./os.js";
import { BLACK, Color, WHITE } from "./screen.js";
import { intToCharArray } from "./string.js";

const MAX_WIDTH = 64;
const MAX_HEIGHT = 22;

export class OutputLib {
  private os: OS;

  private col = 0;
  private row = 0;
  private lastColor = false;

  constructor(os: OS) {
    this.os = os;
  }

  private setColor(color: Color) {
    this.lastColor = this.os.screen.color;
    this.os.screen.color = color;
  }

  private restoreColor() {
    this.os.screen.color = this.lastColor;
  }

  clearChar() {
    this.setColor(WHITE);
    this.os.screen.drawRect(
      this.col * 8,
      this.row * 11,
      (this.col + 1) * 8,
      (this.row + 1) * 11,
    );
    this.restoreColor();
  }

  moveCursor(i: number, j: number) {
    if (i < 0 || i > MAX_HEIGHT || j < 0 || j > MAX_WIDTH) {
      this.os.sys.error(ERRNO.ILLEGAL_CURSOR_LOCATION);
      return;
    }
    this.row = i;
    this.col = j;
    this.drawCursor();
  }

  println() {
    this.row = this.row == MAX_HEIGHT ? 0 : this.row + 1;
    this.col = 0;
  }

  drawCursor() {
    this.clearChar();
    this.setColor(BLACK);
    this.os.screen.drawRect(
      this.col * 8 + 2,
      this.row * 11 + 2,
      (this.col + 1) * 8 - 2,
      (this.row + 1) * 11 - 2,
    );
    this.restoreColor();
  }

  printChar(code: number) {
    const bitmap = FONT[code];
    if (bitmap) {
      this.clearChar();
      this.setColor(BLACK);
      for (let row = 0; row < bitmap.length; row++) {
        for (let col = 0; col < bitmap[row].length; col++) {
          if (bitmap[row][col]) {
            this.os.screen.drawPixel(this.col * 8 + col, this.row * 11 + row);
          }
        }
      }
      this.restoreColor();
    }

    this.col += 1;
    if (this.col == MAX_WIDTH) {
      this.println();
    }
  }

  printString(pointer: number) {
    for (let i = 0; i < this.os.string.length(pointer); i++) {
      this.printChar(this.os.string.charAt(pointer, i));
    }
  }

  printJsString(str: string) {
    for (const char of str) {
      this.printChar(char.charCodeAt(0));
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
