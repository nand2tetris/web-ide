import { VmMemory } from "../memory.js";

const HEAP_BASE = 2048;
const HEAP_SIZE = 14336;

interface Segment {
  address: number;
  length: number;
}

export class MemoryLib {
  private memory: VmMemory;
  private freeSegments: Segment[] = [{ address: HEAP_BASE, length: HEAP_SIZE }];

  public constructor(memory: VmMemory) {
    this.memory = memory;
  }

  alloc(size: number): number {
    for (let i = 0; i < this.freeSegments.length; i++) {
      const seg = this.freeSegments[i];
      if (seg.length >= size) {
        const address = seg.address;
        seg.address += size + 1;
        seg.length -= size + 1;
        if (seg.length === 0) {
          this.freeSegments.splice(i, 1);
        }
        this.memory.set(address, size); // save the segment size for deallocation
        return address + 1;
      }
    }
    console.log("no matching memory segment found");
    return -1;
  }

  deAlloc(address: number) {
    const size = this.memory.get(address - 1);
    this.freeSegments.push({ address: address - 1, length: size + 1 });
  }
}
