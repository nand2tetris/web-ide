import { Trans } from "@lingui/macro";
import { Err, isErr, Ok } from "@davidsouther/jiffies/lib/esm/result";
import { display } from "@davidsouther/jiffies/lib/esm/display";
import { range } from "@davidsouther/jiffies/lib/esm/range";
import { CMP } from "../languages/cmp";

export const DiffTable = ({ out, cmp }: { out: string; cmp: string }) => {
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
          pass: cmp?.trim().match(/^\*+$/) || out?.trim() === cmp?.trim(),
        };
        if (!cell.pass) {
          failures += 1;
        }
        return cell;
      });
  });

  return (
    <div
      style={{
        overflow: "auto",
        maxHeight: "200px",
        border: "var(--border-width) solid var(--form-element-border-color)",
        borderRadius: "var(--border-radius)",
      }}
    >
      <p>
        <Trans>{failures} failures</Trans>
      </p>
      <table
        style={{
          fontFamily: "var(--font-family-monospace)",
        }}
      >
        <tbody>
          {table.map((row, i) => (
            <tr key={i}>
              {row.map(({ cmp, out, pass }, i) =>
                pass ? (
                  <>
                    <td>{cmp}</td>
                    <td></td>
                  </>
                ) : (
                  <>
                    <td key={`${i}_cmp`}>
                      <ins>{cmp}</ins>
                    </td>
                    <td key={`${i}_out`}>
                      <del>{out}</del>
                    </td>
                  </>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
