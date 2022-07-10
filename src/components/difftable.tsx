import { Trans } from "@lingui/macro";
import { Err, isErr, Ok } from "@davidsouther/jiffies/lib/esm/result";
import { cmpParser } from "../languages/cmp";
import { display } from "@davidsouther/jiffies/lib/esm/display";
import { range } from "@davidsouther/jiffies/lib/esm/range";

export const DiffTable = ({ out, cmp }: { out: string; cmp: string }) => {
  const output = cmpParser(out);
  const compare = cmpParser(cmp);

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

  const [_a, cmpData] = Ok(compare);
  const [_b, outData] = Ok(output);
  let failures = 0;
  const table = range(0, Math.max(cmpData.length, outData.length)).map(
    (_, i) => {
      const cmpI: string[] = cmpData[i] ?? [];
      const outI: string[] = outData[i] ?? [];
      return range(0, Math.max(cmpI.length, outI.length))
        .map(
          (_, j) =>
            [cmpI[j], outI[j]] as [string | undefined, string | undefined]
        )
        .map(([cmp, out]) => {
          const cell = {
            cmp: cmp ?? '""',
            out: out ?? '"',
            pass: out?.trim() === cmp?.trim(),
          };
          if (!cell.pass) {
            failures += 1;
          }
          return cell;
        });
    }
  );

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
                    <td key={`${i}_cmp`}>{cmp}</td>
                    <td key={`${i}_out`}></td>
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
