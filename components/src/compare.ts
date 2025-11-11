import { isErr, Ok } from "@davidsouther/jiffies/lib/esm/result.js";
import { Span } from "@nand2tetris/simulator/languages/base";
import { CMP, Cmp } from "@nand2tetris/simulator/languages/cmp.js";

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

export type DecorationType =
  | "correct-line"
  | "error-line"
  | "correct-cell"
  | "error-cell";

interface Decoration {
  span: Span;
  type: DecorationType;
}

export interface DiffDisplay {
  text: string;
  failureNum: number;
  decorations: Decoration[];
  lineNumbers: string[];
}

function getDiffs(cmpData: Cmp, outData: Cmp): Diff[] {
  const diffs: Diff[] = [];

  for (let i = 0; i < Math.min(cmpData.length, outData.length); i++) {
    const cmpI = cmpData[i] ?? [];
    const outI = outData[i] ?? [];

    for (let j = 0; j < Math.max(cmpI.length, outI.length); j++) {
      const cmpJ = cmpI[j] ?? "";
      const outJ = outI[j] ?? "";
      if (!(cmpJ?.trim().match(/^\*+$/) !== null || outJ === cmpJ)) {
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
      decorations: [],
      lineNumbers: [],
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
  const decorations: Decoration[] = [];
  const lineNumbers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const diffLine = diffLines[i];
    lineNumbers.push((i + 1).toString());
    if (diffLine) {
      lineNumbers.push("");
      finalLines.push(diffLine.givenLine);
      decorations.push({
        span: {
          start: lineStart,
          end: lineStart + diffLine.givenLine.length,
          line: finalLines.length,
        },
        type: "error-line",
      });
      decorations.push(
        ...diffLine.incorrectCellSpans.map((span) => ({
          span: {
            start: span.start + lineStart,
            end: span.end + lineStart,
            line: span.line,
          },
          type: "error-cell" as DecorationType,
        })),
      );

      lineStart += diffLine.expectedLine.length + 1; // +1 for the newline character

      finalLines.push(diffLine.expectedLine);
      decorations.push({
        span: {
          start: lineStart,
          end: lineStart + diffLine.expectedLine.length,
          line: i,
        },
        type: "correct-line",
      });
      decorations.push(
        ...diffLine.correctCellSpans.map((span) => ({
          span: {
            start: span.start + lineStart,
            end: span.end + lineStart,
            line: finalLines.length,
          },
          type: "correct-cell" as DecorationType,
        })),
      );

      lineStart += diffLine.givenLine.length + 1;
    } else {
      finalLines.push(lines[i]);
      lineStart += lines[i].length + 1;
    }
  }

  let text = finalLines.join("\n");
  if (text.endsWith("\n")) {
    text = text.substring(0, text.length - 1);
  }

  return {
    text: text,
    failureNum: diffs.length,
    decorations,
    lineNumbers,
  };
}

function generateDiffLine(original: string, diffs: Diff[]): DiffLineDisplay {
  const cells = original.split("|").filter((cell) => cell != "");
  const newCells = Array.from(cells);

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
