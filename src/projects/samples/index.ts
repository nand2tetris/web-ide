import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs";
import * as Hack from "./hack";
import * as Tst from "./tst";

const TST = {
  "TickTock.tst": Tst.TickTock,
};

const HACK = {
  "Add.hack": Hack.Add,
  "Max.hack": Hack.Max,
  "Rect.hack": Hack.Rect,
};

export async function loadSamples(fs: FileSystem) {
  await fs.pushd("/samples");
  await reset(fs, HACK);
  await reset(fs, TST);
  await fs.popd();
}
