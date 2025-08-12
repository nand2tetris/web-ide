import { SCREEN_COLS, SCREEN_ROWS, SCREEN_SIZE } from "../../cpu/memory.js";
import { VmMemory } from "../memory.js";
import { ERRNO } from "./errors.js";
import { OS } from "./os.js";

const BLANK_SCREEN = new Array(SCREEN_SIZE).fill(0);
const MAX_R = 181;

export type Color = boolean;
export const BLACK: Color = true;
export const WHITE: Color = false;

export class ScreenLib {
  private memory: VmMemory;
  private os: OS;

  color: Color = BLACK;

  constructor(memory: VmMemory, os: OS) {
    this.memory = memory;
    this.os = os;
  }

  clear() {
    this.memory.screen.loadBytes(BLANK_SCREEN);
  }

  private outOfBounds(col: number, row: number) {
    return col < 0 || col > SCREEN_COLS * 16 || row < 0 || row > SCREEN_ROWS;
  }

  drawPixel(col: number, row: number) {
    if (this.outOfBounds(col, row)) {
      this.os.sys.error(ERRNO.ILLEGAL_PIXEL_COORD);
      return;
    }
    const address = row * 32 + Math.floor(col / 16);
    let value = this.memory.screen.get(address);
    const rem = col % 16;
    if (this.color) {
      value |= 1 << rem;
    } else {
      value &= ~(1 << rem);
    }
    this.memory.screen.set(address, value);
  }

  drawLine(x1: number, y1: number, x2: number, y2: number) {
    if (this.outOfBounds(x1, y1) || this.outOfBounds(x2, y2)) {
      this.os.sys.error(ERRNO.ILLEGAL_LINE_COORD);
      return;
    }
    if (x1 == x2) {
      this.drawVerticalLine(x1, y1, y2);
    } else if (y1 == y2) {
      this.drawHorizontalLine(y1, x1, x2);
    } else {
      this.drawGeneralLine(x1, y1, x2, y2);
    }
  }

  private drawHorizontalLine(y: number, x1: number, x2: number) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      this.drawPixel(x, y);
    }
  }

  private drawVerticalLine(x: number, y1: number, y2: number) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      this.drawPixel(x, y);
    }
  }

  private drawGeneralLine(x1: number, y1: number, x2: number, y2: number) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);

    let a = 0;
    let b = 0;
    let diff = 0;

    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;

    while (a <= dx && b <= dy) {
      this.drawPixel(x1 + sx * a, y1 + sy * b);
      if (diff < 0) {
        a = a + 1;
        diff = diff + dy;
      } else {
        b = b + 1;
        diff = diff - dx;
      }
    }
  }

  drawRect(x1: number, y1: number, x2: number, y2: number) {
    if (this.outOfBounds(x1, y1) || this.outOfBounds(x2, y2)) {
      this.os.sys.error(ERRNO.ILLEGAL_RECT_COORD);
      return;
    }
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        this.drawPixel(x, y);
      }
    }
  }

  drawCircle(x: number, y: number, r: number) {
    if (this.outOfBounds(x, y)) {
      this.os.sys.error(ERRNO.ILLEGAL_CENTER_COORD);
      return;
    }
    if (r > MAX_R) {
      this.os.sys.error(ERRNO.ILLEGAL_RADIUS);
      return;
    }
    for (let dy = -r; dy <= r; dy++) {
      this.drawLine(
        x - Math.floor(Math.sqrt(r * r - dy * dy)),
        y + dy,
        x + Math.floor(Math.sqrt(r * r - dy * dy)),
        y + dy,
      );
    }
  }
}
