import { assert } from "@davidsouther/jiffies/lib/esm/assert.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { op } from "../util/asm.js";
import { int10, int16, int2 } from "../util/twos.js";
import { load } from "../fs.js";

export const FORMATS = ["bin", "dec", "hex", "asm"];
export type Format = typeof FORMATS[number];

export const SCREEN = 0x4000;
export const SCREEN_ROWS = 512;
export const SCREEN_COLS = 256;
export const KEYBOARD = 0x6000;

export interface MemoryAdapter {
  size: number;
  get(index: number): number;
  set(index: number, value: number): void;
  update(cell: number, value: string, format: Format): void;
  load(fs: FileSystem, path: string): Promise<void>;
  range(start?: number, end?: number): number[];
  map<T>(
    fn: (index: number, value: number) => T,
    start?: number,
    end?: number
  ): Iterable<T>;
}

export interface KeyboardAdapter {
  getKey(): number;
  setKey(key: number): void;
  clearKey(): void;
}

export class Memory {
  private memory: Int16Array;

  get size(): number {
    return this.memory.length;
  }

  constructor(memory: ArrayBuffer | number) {
    if (typeof memory === "number") {
      this.memory = new Int16Array(memory);
    } else {
      this.memory = new Int16Array(memory);
    }
  }

  get(index: number): number {
    if (index < 0 || index >= this.size) {
      return 0xffff;
    }
    return this.memory[index] ?? 0;
  }

  set(index: number, value: number): void {
    if (index >= 0 && index < this.size) {
      this.memory[index] = value & 0xffff;
    }
  }

  reset(): void {
    this.#memory.fill(0);
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
    return [...this.memory.slice(start, end)];
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

export class SubMemory implements MemoryAdapter {
  constructor(
    private readonly parent: MemoryAdapter,
    readonly size: number,
    private readonly offset: number
  ) {}

  get(index: number): number {
    if (index < 0 || index >= this.size) {
      return 0xffff;
    }
    return this.parent.get(this.offset + index);
  }

  set(index: number, value: number): void {
    if (index >= 0 && index < this.size) {
      this.parent.set(index + this.offset, value);
    }
  }

  update(index: number, value: string, format: string): void {
    if (index >= 0 && index < this.size) {
      this.parent.update(index + this.offset, value, format);
    }
  }

  load(fs: FileSystem, path: string): Promise<void> {
    return this.parent.load(fs, path);
  }

  range(start?: number, end?: number): number[] {
    return this.parent.range(start, end);
  }
  map<T>(
    fn: (index: number, value: number) => T,
    start?: number,
    end?: number
  ): Iterable<T> {
    return this.parent.map(fn, start, end);
  }
}

export class MemoryKeyboard extends SubMemory implements KeyboardAdapter {
  constructor(memory: MemoryAdapter) {
    super(memory, 1, 0x6000);
  }

  getKey(): number {
    return this.get(0);
  }

  setKey(key: number): void {
    this.set(0, key & 0xffff);
  }

  clearKey(): void {
    this.set(0, 0);
  }
}
