import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { Err, isErr } from "@davidsouther/jiffies/result.ts";
import { describe, expect, it } from "vitest";
import { describeDiagnostic } from "../languages/diagnostic.js";
import {
  type AssignmentFiles,
  maybeBuild,
  maybeParse,
  runner,
  runTests,
} from "./runner.js";

const lines = (...l: string[]) => l.join("\n");

const assignment = (name: string, hdl: string): AssignmentFiles => ({
  root: "",
  dir: "",
  base: `${name}.hdl`,
  ext: ".hdl",
  name,
  hdl,
  tst: "repeat 1 {\n  eval;\n}",
  cmp: "",
});

const twoErrors = lines(
  "CHIP Foo {",
  "  IN a;",
  "  OUT out;",
  "  PARTS:",
  "  Nand(a=a b=a, out=x);",
  "  Nope(a=x, out=out);",
  "}",
);

describe("building an assignment", () => {
  it("builds a chip that has no diagnostic", async () => {
    const source = lines(
      "CHIP Foo {",
      "  IN a, b;",
      "  OUT out;",
      "  PARTS:",
      "  Nand(a=a, b=b, out=out);",
      "}",
    );
    const fs = new FileSystem(new ObjectFileSystemAdapter({}));

    const { maybeChip } = await maybeBuild(fs)(
      maybeParse(assignment("Foo", source)),
    );

    expect(isErr(maybeChip)).toBe(false);
  });
});

describe("running an assignment", () => {
  it.each([
    [true, 2],
    [false, 1],
    [undefined, 1],
  ])(
    "with attemptRecovery %s, the output lists %s diagnostics",
    async (attemptRecovery, count) => {
      const fs = new FileSystem(new ObjectFileSystemAdapter({}));

      const run = await runner(
        fs,
        undefined,
        attemptRecovery === undefined ? {} : { attemptRecovery },
      )(assignment("Foo", twoErrors));

      expect(run.pass).toBe(false);
      const [syntax, ...semantic] = run.out.split("\n");
      expect(run.out.split("\n")).toHaveLength(count);
      expect(syntax).toMatch(/^Foo\.hdl: Line 5: /);
      expect(semantic).toEqual(
        attemptRecovery === true
          ? ["Foo.hdl: Line 6: Undefined chip name: Nope"]
          : [],
      );
    },
  );
});

it("keeps the TST diagnostic text when an assignment cannot parse its test", async () => {
  const parsed = maybeParse({
    root: "",
    dir: "",
    base: "Foo.hdl",
    ext: ".hdl",
    name: "Foo",
    hdl: "CHIP Foo { PARTS: }",
    tst: "this is invalid",
    cmp: "",
  });
  const built = await maybeBuild(
    new FileSystem(new ObjectFileSystemAdapter({})),
  )(parsed);

  if (!isErr(parsed.maybeParsedTST) || !isErr(built.maybeTest))
    throw new Error("invalid test was accepted");
  expect(Err(built.maybeTest).message).toBe(
    Err(parsed.maybeParsedTST)
      .map((found) => describeDiagnostic(found))
      .join("\n"),
  );
});

it("applies run recovery to independent TST mistakes while withholding the test", async () => {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  const input = {
    ...assignment("Foo", "CHIP Foo { PARTS: }"),
    tst: "set a ;\neval;\nset b ;\neval;",
  };
  const strict = await runner(fs)(input);
  const disabled = await runner(fs, undefined, { attemptRecovery: false })(
    input,
  );
  const recovered = await runner(fs, undefined, { attemptRecovery: true })(
    input,
  );

  const [graded] = await runTests([input], async () => input, fs, undefined, {
    attemptRecovery: true,
  });
  expect(graded.out).toBe(recovered.out);
  expect(disabled.out).toBe(strict.out);
  expect(isErr(recovered.maybeTest)).toBe(true);
  expect(recovered.pass).toBe(false);
  expect(isErr(recovered.maybeParsedTST)).toBe(true);
  if (!isErr(recovered.maybeParsedTST) || !isErr(strict.maybeParsedTST))
    expect.unreachable("both scripts contain syntax mistakes");
  expect(Err(strict.maybeParsedTST)).toHaveLength(1);
  expect(Err(recovered.maybeParsedTST).map(({ span }) => span?.line)).toEqual([
    1, 3,
  ]);
  expect(recovered.out).toBe(
    Err(recovered.maybeParsedTST)
      .map((found) => describeDiagnostic(found))
      .join("\n"),
  );
});
