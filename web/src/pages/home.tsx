import { isOk, Ok, Err } from "@davidsouther/jiffies/lib/esm/result";
import { ChangeEventHandler, useCallback, useState } from "react";
import { HDL } from "../languages/hdl";
import { TST } from "../languages/tst";
import { Assignments } from "../projects";
import { build as buildChip } from "../simulator/chip/builder";
import { ChipTest } from "../simulator/tst";

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

const Home = () => {
  const [tests, setTests] = useState([] as string[]);

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    async ({ target: { files } }) => {
      const tests = [...(files ?? [])]
        .map((file) => ({ file, ...splitFile(file) }))
        .filter(hasTest)
        .map(async (file) => {
          const assignment = Assignments[file.name as keyof typeof Assignments];
          const hdl = await file.file.text();
          const tst = assignment[`${file.name}.tst` as keyof typeof assignment];
          const cmp = assignment[`${file.name}.cmp` as keyof typeof assignment];
          return { ...file, hdl, tst, cmp };
        })
        .map(async (pfile) => {
          const file = await pfile;
          const maybeParsedHDL = HDL.parse(file.hdl);
          const maybeParsedTST = TST.parse(file.tst);
          return { ...file, maybeParsedHDL, maybeParsedTST };
        })
        .map(async (pfile) => {
          const file = await pfile;
          const maybeChip = isOk(file.maybeParsedHDL)
            ? buildChip(Ok(file.maybeParsedHDL))
            : Err(new Error("HDL Was not parsed"));
          const maybeTest = isOk(file.maybeParsedTST)
            ? Ok(ChipTest.from(Ok(file.maybeParsedTST)))
            : Err(new Error("TST Was not parsed"));
          if (isOk(maybeChip) && isOk(maybeTest)) {
            Ok(maybeTest).with(Ok(maybeChip));
          }
          return { ...file, maybeChip, maybeTest };
        });
      setTests((await Promise.all(tests)).map(({ name }) => `Found ${name}`));
    },
    [setTests]
  );

  return (
    <>
      <h1>NAND2Tetris Web IDE</h1>
      <input type="file" multiple onChange={onChange} />
      {tests.length > 0 && (
        <ol>
          {tests.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
      )}
    </>
  );
};

export default Home;
