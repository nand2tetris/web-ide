import { VmMemory } from "../memory.js";
import { ERRNO } from "./errors.js";
import { OS } from "./os.js";

const HEAP_BASE = 2048;
const HEAP_SIZE = 14336;

interface Segment {
  address: number;
  length: number;
}

export class MemoryLib {
  private memory: VmMemory;
  private os: OS;

  private freeSegments: Segment[] = [{ address: HEAP_BASE, length: HEAP_SIZE }];

  public constructor(memory: VmMemory, os: OS) {
    this.memory = memory;
    this.os = os;
  }

  alloc(size: number): number {
    if (size <= 0) {
      this.os.sys.error(ERRNO.ARRAY_SIZE_NOT_POSITIVE);
      return 0;
    }
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
    this.os.sys.error(ERRNO.HEAP_OVERFLOW);
    return 0;
  }

  deAlloc(address: number) {
    const size = this.memory.get(address - 1);
    this.freeSegments.push({ address: address - 1, length: size + 1 });
  }
}
