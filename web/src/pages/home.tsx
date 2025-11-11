import { useBaseContext } from "@nand2tetris/components/stores/base.context";
import { DiffTable } from "@nand2tetris/components/difftable";
import { runTests } from "@nand2tetris/simulator/projects/runner.js";
import { Trans } from "@lingui/macro";
import { ChangeEventHandler, useCallback, useState } from "react";
import { AssignmentStubs } from "@nand2tetris/projects/base.js";
import type { ParsedPath } from "path";
// import { parse, ParsedPath } from "node:path";

function hasTest({ name, ext }: { name: string; ext: string }) {
  return (
    AssignmentStubs[name as keyof typeof AssignmentStubs] !== undefined &&
    ext === ".hdl"
  );
}

const TestResult = (props: {
  name: string;
  pass: boolean;
  hdl: string;
  tst: string;
  cmp: string;
  out: string;
}) => (
  <details>
    <summary>
      {props.name} {props.pass ? <Trans>Passed</Trans> : <Trans>Failed</Trans>}
    </summary>
    <div className="flex row">
      <pre>
        <code>{props.hdl}</code>
      </pre>
      <pre>
        <code>{props.tst}</code>
      </pre>
    </div>
    <DiffTable cmp={props.cmp} out={props.out} />
  </details>
);

async function loadAssignment(file: ParsedPath & { file?: File }) {
  const { Assignments } = await import("@nand2tetris/projects/full.js");
  const assignment = Assignments[file.name as keyof typeof Assignments];
  const hdl = (await file.file?.text()) ?? "";
  const tst = assignment[
    `${file.name}.tst` as keyof typeof assignment
  ] as string;
  const cmp = assignment[
    `${file.name}.cmp` as keyof typeof assignment
  ] as string;
  return { ...file, hdl, tst, cmp };
}

declare module "react" {
  // eslint-disable-next-line
  interface HTMLAttributes<T> {
    // extends React's HTMLAttributes
    directory?: string;
    webkitdirectory?: string;
  }
}

const Home = () => {
  const [tests, setTests] = useState(
    [] as Array<Parameters<typeof TestResult>[0]>,
  );
  const { fs } = useBaseContext();

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    async ({ target }) => {
      const files = await Promise.all(
        [...(target.files ?? [])]
          .filter((file) => file.name.endsWith(".hdl"))
          .map((file) => {
            const { name, base, ext } =
              file.name.match(/^(?<base>(?<name>.*)(?<ext>\.[^.]*))?$/)
                ?.groups ?? {};

            const root = "/";
            const dir =
              root + (file.webkitRelativePath?.replace(base, "") ?? "");

            return { name, base, ext, dir, root, file };
          })
          .filter(hasTest)
          .map(async (file) => {
            const hdl = await file.file.text();
            return { ...file, hdl };
          }),
      );

      const tests = await runTests(files, loadAssignment, fs);

      fs.pushd("/samples");
      setTests(tests);
      fs.popd();
    },
    [setTests, fs],
  );

  return (
    <>
      <h1>NAND2Tetris Web IDE</h1>
      <form>
        <fieldset>
          <legend>Files for grading:</legend>
          <input type="file" multiple webkitdirectory="" onChange={onChange} />
        </fieldset>
      </form>
      <figure>
        {tests.length > 0 ? (
          tests.map((t, i) => <TestResult key={t.name} {...t} />)
        ) : (
          <></>
        )}
      </figure>
    </>
  );
};

export default Home;
