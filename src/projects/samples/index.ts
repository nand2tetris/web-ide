import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs";
import * as Hack from "../samples/hack";

const HACK = {
  "Add.hack": Hack.Add,
  "Max.hack": Hack.Max,
  "Rect.hack": Hack.Max,
};

export async function loadSamples(fs: FileSystem) {
  await fs.pushd("/samples");
  await reset(fs, HACK);
  await fs.popd();
}
