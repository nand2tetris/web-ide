import { Diff } from "../simulator/compare";

export const DiffPanel = ({
  diffs = [],
  ran = false,
}: {
  diffs?: Diff[];
  ran?: boolean;
}) => {
  return ran ? (
    <>
      <span>Failed {diffs.length} assertions</span>
      <ol>
        {diffs.map(({ a, b, row, col }) => (
          <li key={`${row}:${col}`}>
            Expected <del>{a}</del>
            Actual <ins>{b}</ins>
            <span>
              at {row}:{col}
            </span>
          </li>
        ))}
      </ol>
    </>
  ) : (
    <span></span>
  );
};
