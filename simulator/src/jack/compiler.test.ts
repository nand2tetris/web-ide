import { unwrap } from "@davidsouther/jiffies/lib/esm/result";
import { compiledFiles, files } from "../languages/jackSamples";
import { compile } from "./compiler";

describe("jack language", () => {
  it.each(Object.keys(files))("%s", (file) => {
    const compiled = compile(files[file]);
    expect(compiled).toBeOk();
    expect(unwrap(compiled)).toEqual(compiledFiles[file]);
  });
});
