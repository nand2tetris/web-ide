import { Trans } from "@lingui/macro";
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
      <span>
        <Trans>Failed {diffs.length} assertions</Trans>
      </span>
      <ol>
        {diffs.map(({ a, b, row, col }) => (
          <li key={`${row}:${col}`}>
            <Trans>
              Expected <del>{a}</del>
              Actual <ins>{b}</ins>
              <span>
                at {row}:{col}
              </span>
            </Trans>
          </li>
        ))}
      </ol>
    </>
  ) : (
    <span></span>
  );
};
