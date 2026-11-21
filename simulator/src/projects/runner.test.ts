import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { Err, isErr } from "@davidsouther/jiffies/result.ts";
import { expect, it } from "vitest";
import { describeDiagnostic } from "../languages/diagnostic.js";
import { maybeBuild, maybeParse } from "./runner.js";

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
