import { isErr, Ok } from "@davidsouther/jiffies/lib/esm/result.js";
import { Span } from "@nand2tetris/simulator/languages/base";
import { Cmp, CMP } from "@nand2tetris/simulator/languages/cmp.js";

interface Diff {
  row: number;
  col: number;
  expected: string;
  given: string;
}

interface DiffLineDisplay {
  expectedLine: string;
  givenLine: string;
  correctCellSpans: Span[];
  incorrectCellSpans: Span[];
}

export interface DiffDisplay {
  text: string;
  failureNum: number;
  correctCellSpans: Span[];
  incorrectCellSpans: Span[];
}

function getDiffs(cmpData: Cmp, outData: Cmp): Diff[] {
  const diffs: Diff[] = [];

  for (let i = 0; i < Math.min(cmpData.length, outData.length); i++) {
    const cmpI = cmpData[i] ?? [];
    const outI = outData[i] ?? [];

    for (let j = 0; j < Math.max(cmpI.length, outI.length); j++) {
      const cmpJ = cmpI[j] ?? "";
      const outJ = outI[j] ?? "";
      if (
        !(cmpJ?.trim().match(/^\*+$/) !== null || outJ?.trim() === cmpJ?.trim())
      ) {
        diffs.push({ row: i, col: j, expected: cmpJ, given: outJ });
      }
    }
  }
  return diffs;
}

export function compare(cmp: string, out: string) {
  const cmpResult = CMP.parse(cmp);
  const outResult = CMP.parse(out);

  if (isErr(cmpResult) || isErr(outResult)) {
    return false;
  }

  const cmpData = Ok(cmpResult);
  const outData = Ok(outResult);

  return getDiffs(cmpData, outData).length == 0;
}

export function generateDiffs(cmp: string, out: string): DiffDisplay {
  const cmpResult = CMP.parse(cmp);
  const outResult = CMP.parse(out);

  if (isErr(cmpResult) || isErr(outResult)) {
    return {
      text: "",
      failureNum: 0,
      correctCellSpans: [],
      incorrectCellSpans: [],
    };
  }

  const cmpData = Ok(cmpResult);
  const outData = Ok(outResult);

  const diffs = getDiffs(cmpData, outData);

  const diffsByLine: Diff[][] = new Array<Diff[]>(cmpData.length);
  for (const diff of diffs) {
    const lineDiffs = diffsByLine[diff.row];
    if (lineDiffs) {
      lineDiffs.push(diff);
    } else {
      diffsByLine[diff.row] = [diff];
    }
  }

  const lines = out.split("\n");
  const diffLines: DiffLineDisplay[] = new Array(cmpData.length);
  for (let i = 0; i < diffsByLine.length; i++) {
    if (diffsByLine[i]) {
      diffLines[i] = generateDiffLine(lines[i], diffsByLine[i]);
    }
  }

  const finalLines: string[] = [];
  let lineStart = 0;
  const correctCellSpans: Span[] = [];
  const incorrectCellSpans: Span[] = [];

  for (let i = 0; i < lines.length; i++) {
    const diffLine = diffLines[i];
    if (diffLine) {
      finalLines.push(diffLine.expectedLine);
      correctCellSpans.push(
        ...diffLine.correctCellSpans.map((span) => ({
          start: span.start + lineStart,
          end: span.end + lineStart,
          line: span.line,
        }))
      );
      lineStart += diffLine.expectedLine.length + 1; // +1 for the newline character
      finalLines.push(diffLine.givenLine);
      incorrectCellSpans.push(
        ...diffLine.correctCellSpans.map((span) => ({
          start: span.start + lineStart,
          end: span.end + lineStart,
          line: span.line,
        }))
      );
      lineStart += diffLine.givenLine.length + 1;
    } else {
      finalLines.push(lines[i]);
      lineStart += lines[i].length + 1;
    }
  }

  return {
    text: finalLines.join("\n"),
    failureNum: diffs.length,
    correctCellSpans,
    incorrectCellSpans,
  };
}

function generateDiffLine(original: string, diffs: Diff[]): DiffLineDisplay {
  const cells = original.split("|").filter((cell) => cell != "");
  const newCells = cells.map((cell) => " ".repeat(cell.length));

  const cellStarts: number[] = [];
  let sum = 0;
  for (let i = 0; i < cells.length; i++) {
    cellStarts.push(sum + 1);
    sum += cells[i].length + 1;
  }

  const correctCellSpans: Span[] = [];
  const incorrectCellSpans: Span[] = [];

  for (const diff of diffs) {
    cells[diff.col] = diff.expected;
    newCells[diff.col] = diff.given;

    const span = {
      start: cellStarts[diff.col],
      end: cellStarts[diff.col] + diff.expected.length,
      line: 0, // not used
    };
    correctCellSpans.push(span);
    incorrectCellSpans.push(span);
  }
  return {
    expectedLine: `|${cells.join("|")}|`,
    givenLine: `|${newCells.join("|")}|`,
    correctCellSpans,
    incorrectCellSpans,
  };
}
