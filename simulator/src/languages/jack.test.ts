import { unwrap } from "@davidsouther/jiffies/lib/esm/result";
import { JACK } from "./jack";
import { files, parsedFiles } from "./jackSamples";

describe("compiler", () => {
  it.each(Object.keys(files))("%s", (file) => {
    const parsed = JACK.parse(files[file]);
    expect(parsed).toBeOk();
    expect(unwrap(parsed)).toEqual(parsedFiles[file]);
  });
});
