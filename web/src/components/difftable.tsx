import { Plural, Trans } from "@lingui/macro";
import { CMP } from "@computron5k/simulator/languages/cmp.js";
import { Err, isErr, Ok } from "@davidsouther/jiffies/lib/esm/result";
import { display } from "@davidsouther/jiffies/lib/esm/display";
import { range } from "@davidsouther/jiffies/lib/esm/range";

export const DiffTable = ({
  className = "",
  out,
  cmp,
}: {
  out: string;
  cmp: string;
  className?: string;
}) => {
  const output = CMP.parse(out);
  const compare = CMP.parse(cmp);

  if (isErr(output)) {
    return (
      <details>
        <summary>
          <Trans>Failed to parse output</Trans>
        </summary>
        <pre>{display(Err(output))}</pre>
        <code>
          <pre>{out}</pre>
        </code>
      </details>
    );
  }

  if (isErr(compare)) {
    return (
      <details>
        <summary>
          <Trans>Failed to parse compare</Trans>
        </summary>
        <code>
          <pre>{display(Err(compare))}</pre>
          <pre>{cmp}</pre>
        </code>
      </details>
    );
  }

  const cmpData = Ok(compare);
  const outData = Ok(output);
  let failures = 0;
  const table = range(0, Math.max(cmpData.length, outData.length)).map((i) => {
    const cmpI = cmpData[i] ?? [];
    const outI = outData[i] ?? [];
    return range(0, Math.max(cmpI.length, outI.length))
      .map((_, j) => [cmpI[j] ?? "", outI[j] ?? ""])
      .map(([cmp, out]) => {
        const cell = {
          cmp: cmp ?? '"',
          out: out ?? '"',
          pass:
            cmp?.trim().match(/^\*+$/) !== null || out?.trim() === cmp?.trim(),
        };
        if (!cell.pass) {
          failures += 1;
        }
        return cell;
      });
  });

  return (
    <div className={"scroll-x " + className}>
      <p>
        <Plural
          value={failures}
          one={`${failures} failure`}
          other={`${failures} failures`}
        />
      </p>
      <table
        style={{
          fontFamily: "var(--font-family-monospace)",
          marginBottom: "none",
        }}
      >
        <tbody>
          {table.map((row, i) => (
            <tr key={i}>
              {row.map(({ cmp, out, pass }, i) => (
                <DiffCell cmp={cmp} out={out} pass={pass} key={i} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DiffCell = ({
  cmp,
  out,
  pass,
}: {
  cmp: string;
  out: string;
  pass: boolean;
}) => {
  return pass ? (
    <>
      <td>{cmp}</td>
      <td></td>
    </>
  ) : (
    <>
      <td>
        <ins>{cmp}</ins>
      </td>
      <td>
        <del>{out}</del>
      </td>
    </>
  );
};
