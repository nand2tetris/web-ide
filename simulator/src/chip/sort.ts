import { Chip } from "./chip";

class Graph {
  private edges: Record<number, number[]> = {};

  addEdge(from: number, to: number) {
    if (!this.edges[from]) {
      this.edges[from] = [];
    }
    this.edges[from].push(to);
  }

  sort(start: number) {
    const marked = new Set<number>();
    const sorted: number[] = [];

    const doSort = (start: number) => {
      marked.add(start);

      const children = this.edges[start];
      if (children) {
        for (const node of children) {
          if (!marked.has(node)) {
            doSort(node);
          }
        }
      }
      sorted.push(start);
    };

    doSort(start);
    return sorted;
  }
}

// Topological sort for where this part should go
export function sortParts(chip: Chip) {
  const partToId: Map<Chip, number> = new Map();
  const idToPart: Chip[] = Array(chip.parts.length);

  for (let i = 0; i < chip.parts.length; i++) {
    partToId.set(chip.parts[i], i);
    idToPart[i] = chip.parts[i];
  }

  const g = new Graph();

  for (const part of chip.parts) {
    for (const other of chip.parts) {
      if (part == other) {
        continue;
      }
      const n1 = partToId.get(part);
      const n2 = partToId.get(other);
      if (n1 != undefined && n2 != undefined) {
        if (hasConnection(chip, part, other)) {
          g.addEdge(n2, n1);
        }
        if (hasConnection(chip, other, part)) {
          g.addEdge(n1, n2);
        }
      }
    }
  }

  for (const part of chip.parts) {
    const n = partToId.get(part);
    if (n != undefined) {
      g.addEdge(-1, n);
    }
  }

  const sorted = g.sort(-1);
  sorted.pop(); // remove (-1) node we added for sorting
  const sortedParts = sorted.map((id) => idToPart[id]);
  chip.parts = sortedParts;
}

export const hasConnection = (chip: Chip, from: Chip, to: Chip) => {
  const outs = chip.partToOuts.get(from) ?? [];
  for (const pin of outs) {
    if (
      chip.insToPart.get(pin)?.has(to) &&
      !(chip.isInternalPin(pin) && to.clocked)
    ) {
      return true;
    }
  }
  return false;
};
