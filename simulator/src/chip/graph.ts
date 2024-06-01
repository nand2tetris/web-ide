import { assertExists } from "@davidsouther/jiffies/lib/esm/assert";

interface NodeState {
  node: number;
  isReturning: boolean;
}

export class Graph {
  private edges: Record<number, number[]> = {};

  addEdge(from: number, to: number) {
    if (!this.edges[from]) {
      this.edges[from] = [];
    }
    this.edges[from].push(to);
  }

  sort(start: number) {
    const visited = new Set<number>();
    const visiting = new Set<number>();
    const sorted: number[] = [];
    const stack: NodeState[] = [{ node: start, isReturning: false }];

    while (stack.length > 0) {
      const { node, isReturning } = assertExists(stack.pop());

      if (isReturning) {
        // If we are returning to this node, we can safely add it to the sorted list
        visited.add(node);
        sorted.push(node);
      } else if (!visited.has(node)) {
        // If we are visiting this node for the first time
        if (visiting.has(node)) {
          continue;
        }
        visiting.add(node);

        // Re-push this node to handle it on return
        stack.push({ node, isReturning: true });

        // Push all its children to visit them
        const children = this.edges[node] ?? [];
        for (const child of children) {
          if (!visited.has(child)) {
            stack.push({ node: child, isReturning: false });
          }
        }
      }
    }

    return sorted;
  }
}
