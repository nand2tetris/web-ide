import { FC } from "@davidsouther/jiffies/dom/fc.js";
import { del, ins, li, ol, span } from "@davidsouther/jiffies/dom/html.js";
import { Diff } from "../simulator/compare.js";

export const DiffPanel = FC<{ diffs?: Diff[]; ran?: boolean }>(
  "diff-panel",
  (el, { diffs = [], ran = false }) => {
    return ran
      ? [
          span(`Failed ${diffs.length} assertions`),
          ol(
            ...diffs.map(({ a, b, row, col }) =>
              li(
                "Expected ",
                del(a),
                "Actual",
                ins(b),
                span(`at ${row}:${col}`)
              )
            )
          ),
        ]
      : [span()];
  }
);
