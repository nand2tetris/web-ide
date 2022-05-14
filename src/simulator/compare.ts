export interface Diff {
  a: string;
  b: string;
  row?: number;
  col?: number;
}

export function compare(as: string[][], bs: string[][]): Diff[] {
  let diffs: Diff[] = [];

  const q = Math.max(as.length, bs.length);
  for (let row = 0; row < q; row++) {
    const a = as[row] ?? [];
    const b = bs[row] ?? [];
    diffs = diffs.concat(
      diff(a, b).map((diff) => {
        diff.row = row;
        return diff;
      })
    );
  }

  return diffs;
}

export function diff(as: string[], bs: string[]): Diff[] {
  const diffs: Diff[] = [];

  const q = Math.max(as.length, bs.length);
  for (let col = 0; col < q; col++) {
    const a = as[col] ?? "";
    const b = bs[col] ?? "";
    if (a !== b) {
      diffs.push({ a, b, col });
    }
  }
  return diffs;
}
