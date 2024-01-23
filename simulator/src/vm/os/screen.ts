import { VmMemory } from "../memory.js";

export class ScreenLib {
  color = true;
  private memory: VmMemory;

  constructor(memory: VmMemory) {
    this.memory = memory;
  }

  drawPixel(col: number, row: number) {
    const address = row * 32 + Math.floor(col / 16);
    let value = this.memory.screen.get(address);
    if (this.color) {
      value |= 1 << col % 16;
    } else {
      value &= ~(1 << col % 16);
    }
    this.memory.screen.set(address, value);
  }

  drawLine(x1: number, y1: number, x2: number, y2: number) {
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
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        this.drawPixel(x, y);
      }
    }
  }

  drawCircle(x: number, y: number, r: number) {
    r = Math.min(r, 181);
    for (let dy = -r; dy <= r; dy++) {
      this.drawLine(
        x - Math.floor(Math.sqrt(r * r - dy * dy)),
        y + dy,
        x + Math.floor(Math.sqrt(r * r - dy * dy)),
        y + dy
      );
    }
  }
}
