import { describe, expect, test } from "vitest";
import { VmMemory } from "../memory.js";
import { MemoryLib } from "./memory.js";
import { OS } from "./os.js";

const HEAP_BASE = 2048;
const HEAP_SIZE = 14334;

function makeLib() {
  const memory = new VmMemory();
  const os = new OS(memory);
  return { memory, lib: os.memory };
}

function freeList(memory: VmMemory, lib: MemoryLib): number[] {
  const seen: number[] = [];
  let p = (lib as unknown as { freeListPtr: number }).freeListPtr;
  while (p !== 0) {
    if (seen.includes(p)) {
      throw new Error(`free list cycle at ${p}: ${seen.join(" -> ")}`);
    }
    seen.push(p);
    p = memory.get(p);
  }
  return seen;
}

describe("MemoryLib", () => {
  test("initializes a single heap-sized free block", () => {
    const { memory, lib } = makeLib();
    expect(memory.get(HEAP_BASE)).toBe(0);
    expect(memory.get(HEAP_BASE + 1)).toBe(HEAP_SIZE);
    expect(freeList(memory, lib)).toEqual([HEAP_BASE]);
  });

  test("alloc returns the user-data pointer and records the size header", () => {
    const { memory, lib } = makeLib();
    const p = lib.alloc(10);
    expect(p).toBe(HEAP_BASE + 2);
    expect(memory.get(p - 1)).toBe(10);
  });

  test("alloc/deAlloc round trip leaves the heap usable", () => {
    const { lib } = makeLib();
    const p = lib.alloc(10);
    lib.deAlloc(p);
    const q = lib.alloc(10);
    expect(typeof q).toBe("number");
    expect(q).toBeGreaterThan(0);
  });

  test("repeated alloc/write/deAlloc with non-zero user data does not hang", () => {
    const { memory, lib } = makeLib();
    for (let iter = 0; iter < 50; iter++) {
      const piece = lib.alloc(3);
      const tiles = lib.alloc(10);
      for (let i = 0; i < 10; i++) {
        memory.set(tiles + i, i % 2 === 0 ? -1 : 12345);
      }
      lib.deAlloc(tiles);
      lib.deAlloc(piece);
      // freeList walk throws on cycle; repeated calls verify no corruption.
      freeList(memory, lib);
    }
  });

  test("alloc that splits a non-head free block keeps the free list well formed", () => {
    const { memory, lib } = makeLib();
    // Force two free blocks where the head is too small for a later request.
    const a = lib.alloc(10);
    const b = lib.alloc(10);
    lib.deAlloc(a);
    // Shrink the head so the next alloc must walk past it.
    const headPtr = (lib as unknown as { freeListPtr: number }).freeListPtr;
    memory.set(headPtr + 1, 5);
    const c = lib.alloc(8);
    expect(c).toBeGreaterThan(0);
    // Returned pointer must not still be linked into the free list.
    const blockPtr = c - 2;
    const list = freeList(memory, lib);
    expect(list).not.toContain(blockPtr);
    void b;
  });

  test("alloc that splits a non-head block does not lose the remainder", () => {
    const { memory, lib } = makeLib();
    const a = lib.alloc(10);
    const b = lib.alloc(10);
    lib.deAlloc(a);
    const headPtr = (lib as unknown as { freeListPtr: number }).freeListPtr;
    memory.set(headPtr + 1, 5);
    const before = freeList(memory, lib).length;
    lib.alloc(8);
    const after = freeList(memory, lib).length;
    // One free block is consumed and one remainder added: list length unchanged.
    expect(after).toBe(before);
    void b;
  });
});
