import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { Err, isErr } from "@davidsouther/jiffies/result.ts";
import { describe, expect, it } from "vitest";
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
  "  Nand(a=a b=a, out=x);", // line 5: syntax error, no comma
  "  Nope(a=x, out=out);", //   line 6: Nope is not a chip
  "}",
);

describe("building an assignment", () => {
  it("reports every diagnostic of the chip, each under its file", async () => {
    const source = twoErrors;
    const fs = new FileSystem(new ObjectFileSystemAdapter({}));

    const { maybeChip } = await maybeBuild(fs)(
      maybeParse(assignment("Foo", source)),
    );

    if (!isErr(maybeChip)) {
      expect.unreachable("the chip should not build");
    }
    const [syntax, semantic, ...rest] = Err(maybeChip).message.split("\n");
    expect(rest).toEqual([]);
    expect(syntax).toMatch(/^Foo\.hdl: Line 5: /);
    expect(semantic).toBe("Foo.hdl: Line 6: Undefined chip name: Nope");
  });

  it("reports only the syntax diagnostic when told not to attempt recovery", async () => {
    const fs = new FileSystem(new ObjectFileSystemAdapter({}));

    const { maybeChip } = await maybeBuild(fs, { attemptRecovery: false })(
      maybeParse(assignment("Foo", twoErrors)),
    );

    if (!isErr(maybeChip)) {
      expect.unreachable("the chip should not build");
    }
    const [syntax, ...rest] = Err(maybeChip).message.split("\n");
    expect(rest).toEqual([]);
    expect(syntax).toMatch(/^Foo\.hdl: Line 5: /);
  });

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
    [undefined, 2],
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
      expect(run.out.split("\n")).toHaveLength(count);
    },
  );

  it("passes the option to every assignment of a project", async () => {
    const fs = new FileSystem(new ObjectFileSystemAdapter({}));
    const files = [{ ...assignment("Foo", twoErrors) }];

    const [run] = await runTests(
      files,
      async (file) => ({ ...assignment(file.name, twoErrors) }),
      fs,
      undefined,
      { attemptRecovery: false },
    );

    expect(run.out.split("\n")).toHaveLength(1);
  });
});
