import { Diff } from "../simulator/compare"
import {FC} from "react";

export const DiffPanel: FC<{ diffs?: Diff[]; ran?: boolean }> = (
  ({ diffs = [], ran = false }) => {
    return ran
      ? (<>
          <span>Failed {diffs.length} assertions</span>
          <ol>
            {diffs.map(({ a, b, row, col }) =>
              <li key={`${row}:${col}`}>
                Expected <del>{a}</del>
                Actual <ins>{b}</ins>
                <span>at {row}:{col}</span>
              </li> 
            )}
          </ol>
        </>
        )
      : <span></span>;
  }
);
