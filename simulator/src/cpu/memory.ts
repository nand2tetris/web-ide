import { assert } from "@davidsouther/jiffies/lib/esm/assert.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { load } from "../fs.js";
import { op } from "../util/asm.js";
import { int2, int10, int16 } from "../util/twos.js";

export const FORMATS = ["bin", "dec", "hex", "asm"];
export type Format = (typeof FORMATS)[number];

export const SCREEN_OFFSET = 0x4000;
export const SCREEN_ROWS = 256;
export const SCREEN_COLS = 32; // These are 16-bit columns
export const SCREEN_SIZE = SCREEN_ROWS * SCREEN_COLS;
export const KEYBOARD_OFFSET = 0x6000;

export interface MemoryAdapter {
  size: number;
  get(index: number): number;
  set(index: number, value: number): void;
  reset(): void;
  update(cell: number, value: string, format: Format): void;
  load(fs: FileSystem, path: string, offset?: number): Promise<void>;
  loadBytes(bytes: number[], offset?: number): void;
  range(start?: number, end?: number): number[];
  map<T>(
    fn: (index: number, value: number) => T,
    start?: number,
    end?: number,
  ): Iterable<T>;
  [Symbol.iterator](): Iterable<number>;
}

export interface KeyboardAdapter {
  getKey(): number;
  setKey(key: number): void;
  clearKey(): void;
}

export class Memory implements MemoryAdapter {
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
    this.memory.fill(0);
  }

  update(cell: number, value: string, format: Format) {
    let current: number | undefined;
    switch (format) {
      case "asm":
        try {
          current = op(value);
        } catch {
          current = undefined;
        }
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

    if (current !== undefined && isFinite(current) && current <= 0xffff) {
      this.set(cell, current);
    }
  }

  async load(fs: FileSystem, path: string, offset?: number) {
    try {
      this.loadBytes(await load(fs, path), offset);
    } catch (_cause) {
      // throw new Error(`ROM32K Failed to load file ${path}`, { cause });
      throw new Error(`Memory Failed to load file ${path}`);
    }
  }

  loadBytes(bytes: number[], offset?: number): void {
    this.memory.set(new Int16Array(bytes), offset);
    this.memory.fill(0, bytes.length, this.size);
  }

  range(start = 0, end = this.size): number[] {
    return [...this.memory.slice(start, end)];
  }

  *map<T>(
    fn: (index: number, value: number) => T,
    start = 0,
    end = this.size,
  ): Iterable<T> {
    assert(start <= end);
    for (let i = start; i < end; i++) {
      yield fn(i, this.get(i));
    }
  }

  [Symbol.iterator](): Iterable<number> {
    return this.map((_, v) => v);
  }

  isEmpty(): boolean {
    return this.memory.every((word) => word === 0);
  }
}

export class SubMemory implements MemoryAdapter {
  constructor(
    private readonly parent: MemoryAdapter,
    readonly size: number,
    private readonly offset: number,
  ) {}

  get(index: number): number {
    if (index < 0 || index >= this.size) {
      return 0xffff;
    }
    return this.parent.get(this.offset + index);
  }

  set(index: number, value: number, trackChange = true): void {
    if (index >= 0 && index < this.size) {
      this.parent.set(index + this.offset, value);
    }
  }

  reset(): void {
    for (let i = 0; i < this.size; i++) {
      this.set(i, 0, false);
    }
  }

  update(index: number, value: string, format: string): void {
    if (index >= 0 && index < this.size) {
      this.parent.update(index + this.offset, value, format);
    }
  }

  load(fs: FileSystem, path: string): Promise<void> {
    return this.parent.load(fs, path, this.offset);
  }

  loadBytes(bytes: number[]): void {
    return this.parent.loadBytes(bytes, this.offset);
  }

  range(start?: number, end?: number): number[] {
    return this.parent.range(start, end);
  }

  map<T>(
    fn: (index: number, value: number) => T,
    start = 0,
    end: number = this.size,
  ): Iterable<T> {
    return this.parent.map(fn, start + this.offset, end + this.offset);
  }

  [Symbol.iterator](): Iterable<number> {
    return this.map((_, v) => v);
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

export class ROM extends Memory {
  static readonly SIZE = 0x8000;
  constructor(program?: Int16Array) {
    if (program) {
      const arr = new Int16Array(ROM.SIZE);
      arr.set(program);
      super(arr.buffer);
    } else {
      super(ROM.SIZE);
    }
  }
}

export class RAM extends Memory {
  keyboard = new SubMemory(this, 1, KEYBOARD_OFFSET);
  screen = new SubMemory(this, SCREEN_SIZE, SCREEN_OFFSET);

  // 4k main memory, 2k screen memory, 1 keyboard
  static readonly SIZE = 0x4000 + 0x2000 + 0x0001;

  constructor() {
    super(RAM.SIZE);
  }
}
