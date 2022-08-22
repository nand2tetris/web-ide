import { assert } from "@davidsouther/jiffies/lib/esm/assert";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { op } from "../../util/asm";
import { int10, int16, int2 } from "../../util/twos";
import { load } from "../fs";

export const FORMATS = ["bin", "dec", "hex", "asm"];
export type Format = typeof FORMATS[number];

export const SCREEN = 0x4000;
export const SCREEN_ROWS = 512;
export const SCREEN_COLS = 256;
export const KEYBOARD = 0x6000;

export class Memory {
  #memory: Int16Array;

  get size(): number {
    return this.#memory.length;
  }

  constructor(memory: ArrayBuffer | number) {
    if (typeof memory === "number") {
      this.#memory = new Int16Array(memory);
    } else {
      this.#memory = new Int16Array(memory);
    }
  }

  get(index: number): number {
    if (index < 0 || index >= this.size) {
      return 0xffff;
    }
    return this.#memory[index] ?? 0;
  }

  set(index: number, value: number): void {
    if (index >= 0 && index < this.size) {
      this.#memory[index] = value & 0xffff;
    }
  }

  update(cell: number, value: string, format: Format) {
    let current: number;
    switch (format) {
      case "asm":
        current = op(value);
        break;
      case "bin":
        current = int2(value);
        break;
      case "hex":
        current = int16(value);
        break;
      case "dec":
      default:
        current = int10(value);
        break;
    }

    if (isFinite(current) && current <= 0xffff) {
      this.set(cell, current);
    }
  }

  async load(fs: FileSystem, path: string) {
    try {
      (await load(fs, path)).map((v, i) => this.set(i, v));
    } catch (cause) {
      // throw new Error(`ROM32K Failed to load file ${path}`, { cause });
      throw new Error(`Memory Failed to load file ${path}`);
    }
  }

  range(start = 0, end = this.size): number[] {
    return [...this.#memory.slice(start, end)];
  }

  *map<T>(
    fn: (index: number, value: number) => T,
    start = 0,
    end = this.size
  ): Iterable<T> {
    assert(start < end);
    for (let i = start; i < end; i++) {
      yield fn(i, this.get(i));
    }
  }
}
