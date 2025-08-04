import { VmMemory } from "../memory.js";
import { ERRNO } from "./errors.js";
import { OS } from "./os.js";

const HEAP_BASE = 2048;
const HEAP_SIZE = 14334;

export class MemoryLib {
  private memory: VmMemory;
  private os: OS;
  private freeListPtr: number;

  public constructor(memory: VmMemory, os: OS) {
    this.memory = memory;
    this.os = os;
    this.freeListPtr = HEAP_BASE;
    this.memory.set(HEAP_BASE, 0);
    this.memory.set(HEAP_BASE + 1, HEAP_SIZE);
  }

  alloc(size: number): number {
    if (size <= 0) {
      this.os.sys.error(ERRNO.ARRAY_SIZE_NOT_POSITIVE);
      return 0;
    }

    let blockPtr = this.freeListPtr;
    do {
      const nextFreeList = this.memory.get(blockPtr);
      const blockSize = this.memory.get(blockPtr + 1);
      if (blockSize >= size + 2) {
        // We can fit this required size and overhead in this block.
        this.memory.set(blockPtr + 1, size);

        const newBlockPtr = blockPtr + 2 + size;
        const newBlockSize = blockSize - size - 2;
        this.memory.set(newBlockPtr, nextFreeList);
        this.memory.set(newBlockPtr + 1, newBlockSize);
        if (this.freeListPtr === blockPtr) {
          // Move freelist pointer to the new block.
          this.freeListPtr = newBlockPtr;
        }
        return blockPtr + 2;
      } else {
        // We can't fit this required size and overhead in this block.
        blockPtr = nextFreeList;
      }
    } while (blockPtr !== 0);

    this.os.sys.error(ERRNO.HEAP_OVERFLOW);
    return 0;
  }

  deAlloc(address: number) {
    const deallocBlockPtr = address - 2;
    // This will be the last block in the free list.
    this.memory.set(deallocBlockPtr, 0);

    let blockPtr = this.freeListPtr;
    do {
      const nextBlockPtr = this.memory.get(blockPtr);
      if (nextBlockPtr === 0) {
        this.memory.set(blockPtr, deallocBlockPtr);
        return;
      }
      blockPtr = nextBlockPtr;
    } while (blockPtr !== 0);
  }
}
