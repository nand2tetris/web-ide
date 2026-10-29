import { display } from "@davidsouther/jiffies/display.ts";
import { range } from "@davidsouther/jiffies/range.ts";
import { Err, isErr, Ok } from "@davidsouther/jiffies/result.ts";
import {
  type Diagnostics,
  validOf,
} from "@nand2tetris/simulator/languages/base.js";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";
import { ReactElement } from "react";

/** Every message of a failed parse, one per line. */
const messages = (diagnostics: Diagnostics) =>
  diagnostics.map(({ message }) => message).join("\n");

export const DiffTable = ({
  className = "",
  out,
  cmp,
  zeroState,
}: {
  out: string;
  cmp: string;
  className?: string;
  zeroState?: ReactElement;
}) => {
  const output = validOf(CMP.parse(out));
  const compare = validOf(CMP.parse(cmp));

  if (isErr(output)) {
    return (
      <details>
        <summary>Failed to parse output</summary>
        <pre>{messages(Err(output))}</pre>
        <code>
          <pre>{out}</pre>
        </code>
      </details>
    );
  }

  if (isErr(compare)) {
    return (
      <details>
        <summary>Failed to parse compare</summary>
        <code>
          <pre>{messages(Err(compare))}</pre>
          <pre>{cmp}</pre>
        </code>
      </details>
    );
  }

  const cmpData = Ok(compare);
  const outData = Ok(output);
  let failures = 0;
  const table = range(0, Math.min(cmpData.length, outData.length)).map((i) => {
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
      {failures > 0 && (
        <p>
          {failures} failure{failures === 1 ? "" : "s"}
        </p>
      )}
      {table.length > 0 ? (
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
      ) : (
        (zeroState ?? <p>Execute test script to compare output.</p>)
      )}
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
    </>
  ) : (
    <>
      <td>
        <ins>{cmp}</ins>
        <br />
        <del>{out}</del>
      </td>
    </>
  );
};
