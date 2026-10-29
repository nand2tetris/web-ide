import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { Err, isErr } from "@davidsouther/jiffies/result.ts";
import { describe, expect, it } from "vitest";
import { type AssignmentFiles, maybeBuild, maybeParse } from "./runner.js";

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

describe("building an assignment", () => {
  it("reports every diagnostic of the chip, each under its file", async () => {
    const source = lines(
      "CHIP Foo {",
      "  IN a;",
      "  OUT out;",
      "  PARTS:",
      "  Nand(a=a b=a, out=x);", // line 5: syntax error, no comma
      "  Nope(a=x, out=out);", //   line 6: Nope is not a chip
      "}",
    );
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
