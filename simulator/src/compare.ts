export interface Diff {
  a: string;
  b: string;
  row?: number;
  col?: number;
}

function normalLines(
  str: string,
  {
    trim = true,
    skipTrimmed = false,
  }: { trim?: boolean; skipTrimmed?: boolean } = {},
): string[] {
  let lines = str.replace("\r\n", "\n").split("\n");

  if (trim) lines = lines.map((line) => line.trim());
  if (skipTrimmed) lines = lines.filter((line) => line != "");
  return lines;
}

export type CompareResultSuccess = Record<string, never>;
export interface CompareResultLengths {
  lenA: number;
  lenB: number;
}
export interface CompareResultLine {
  line: number;
}
export type CompareResult =
  | CompareResultSuccess
  | CompareResultLine
  | CompareResultLengths;

export function compareLines(as: string, bs: string): CompareResult {
  const resultLines = normalLines(as);
  const compareLines = normalLines(bs);

  if (resultLines.length != compareLines.length) {
    return { lenA: resultLines.length, lenB: compareLines.length };
  }

  for (let line = 0; line < compareLines.length; line++) {
    if (resultLines[line] !== compareLines[line]) {
      return { line };
    }
  }

  return {};
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
      }),
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
    if (a !== b && !a.match(/\*+/)) {
      diffs.push({ a, b, col });
    }
  }
  return diffs;
}
