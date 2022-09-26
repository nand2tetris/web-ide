import { Assignments } from "@computron5k/simulator/projects/index.js";
import { runTests } from "@computron5k/simulator/projects/runner.js";
import { Trans } from "@lingui/macro";
import { ChangeEventHandler, useCallback, useContext, useState } from "react";
import { AppContext } from "../App.context";
import { DiffTable } from "../components/difftable";

function splitFile(file: File) {
  const { name, ext } = file.name.match(
    /(.*\/)?(?<name>[^/]+)\.(?<ext>[^./]+)$/
  )?.groups as { name: string; ext: string };
  return { name, ext };
}

function hasTest({ name, ext }: { name: string; ext: string }) {
  return (
    Assignments[name as keyof typeof Assignments] !== undefined && ext === "hdl"
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

async function loadAssignment(pfile: Promise<{ name: string; hdl: string }>) {
  const file = await pfile;
  const assignment = Assignments[file.name as keyof typeof Assignments];
  const tst = assignment[
    `${file.name}.tst` as keyof typeof assignment
  ] as string;
  const cmp = assignment[
    `${file.name}.cmp` as keyof typeof assignment
  ] as string;
  return { ...file, tst, cmp };
}

const Home = () => {
  const [tests, setTests] = useState(
    [] as Array<Parameters<typeof TestResult>[0]>
  );
  const { fs } = useContext(AppContext);

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    async ({ target }) => {
      const files = [...(target.files ?? [])]
        .filter((file) => file.name.endsWith(".hdl"))
        .map((file) => ({ file, ...splitFile(file) }))
        .filter(hasTest)
        .map(async (file) => {
          const hdl = await file.file.text();
          return { ...file, hdl };
        });

      const tests = runTests(files, loadAssignment, fs);

      fs.pushd("/samples");
      setTests(await Promise.all(tests));
      fs.popd();
    },
    [setTests, fs]
  );

  return (
    <>
      <h1>NAND2Tetris Web IDE</h1>
      <form>
        <fieldset>
          <legend>Files for grading:</legend>
          <input type="file" multiple onChange={onChange} />
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
